"""Versioned Home Assistant storage for advanced effect definitions."""

from __future__ import annotations

import asyncio
import copy
import logging
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Any, Final, cast
from uuid import UUID

from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .effect_domain import EffectValidationError, LibraryItem
from .effect_limits import (
    MAX_LIBRARY_ITEMS,
    MAX_LIBRARY_REVISIONS_PER_ITEM,
    MAX_LIBRARY_STORE_BYTES,
    MAX_REVISION,
    MAX_STORE_JSON_NODES,
    validate_json_document,
)
from .effect_store import HomeAssistantVersionedDocumentStore, VersionedDocumentStore

LIBRARY_STORE_VERSION: Final = 1
LIBRARY_STORE_MINOR_VERSION: Final = 1
LIBRARY_STORE_KEY: Final = f"{DOMAIN}.effect_library"

_LOGGER = logging.getLogger(__name__)


class EffectStorageError(RuntimeError):
    """Persisted effect data is unavailable or internally inconsistent."""


class EffectRevisionConflictError(EffectStorageError):
    """A mutation was based on an outdated library or resource revision."""

    def __init__(self, current_revision: int) -> None:
        super().__init__(f"effect revision conflict; current revision is {current_revision}")
        self.current_revision = current_revision


class EffectNotFoundError(EffectStorageError):
    """A requested effect or revision does not exist."""


class EffectLimitError(EffectStorageError):
    """A bounded Effect Studio collection cannot accept more data."""


@dataclass(frozen=True, slots=True)
class LibrarySnapshot:
    library_revision: int
    items: tuple[LibraryItem, ...]


class EffectLibraryRepository:
    """Atomic immutable-revision library over one versioned document store."""

    def __init__(self, hass: HomeAssistant | VersionedDocumentStore) -> None:
        self._store = _library_store(hass) if isinstance(hass, HomeAssistant) else hass
        self._lock = asyncio.Lock()
        self._data: dict[str, Any] | None = None
        self._listeners: set[Callable[[LibrarySnapshot], None]] = set()

    async def async_load(self) -> LibrarySnapshot:
        async with self._lock:
            stored = await self._store.async_load()
            data = _empty_library() if stored is None else stored
            snapshot = _validate_library(data)
            self._data = copy.deepcopy(data)
            return snapshot

    def snapshot(self, *, include_deleted: bool = False) -> LibrarySnapshot:
        data = self._require_loaded()
        return _snapshot_from_data(data, include_deleted=include_deleted)

    def subscribe(
        self,
        listener: Callable[[LibrarySnapshot], None],
    ) -> Callable[[], None]:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)

    def get(self, item_id: UUID, revision: int | None = None) -> LibraryItem:
        data = self._require_loaded()
        resource = _resource(data, item_id)
        selected = resource["head_revision"] if revision is None else revision
        raw = cast(dict[str, Any] | None, resource["revisions"].get(str(selected)))
        if raw is None:
            raise EffectNotFoundError(f"effect revision {item_id}/{selected} does not exist")
        return LibraryItem.from_dict(raw)

    async def async_create(
        self,
        item: LibraryItem,
        *,
        expected_library_revision: int,
    ) -> LibrarySnapshot:
        if item.revision != 1:
            raise EffectStorageError("new effects must begin at revision 1")
        async with self._lock:
            current = self._require_loaded()
            _expect_library_revision(current, expected_library_revision)
            key = str(item.id)
            if key in current["resources"]:
                raise EffectStorageError(f"effect {item.id} already exists")
            if len(current["resources"]) >= MAX_LIBRARY_ITEMS:
                raise EffectLimitError(f"effect library must not exceed {MAX_LIBRARY_ITEMS} items")
            candidate = copy.deepcopy(current)
            candidate["resources"][key] = {
                "head_revision": 1,
                "deleted": False,
                "revisions": {"1": item.to_dict()},
            }
            candidate["library_revision"] += 1
            return await self._async_commit(candidate)

    async def async_update(
        self,
        item: LibraryItem,
        *,
        expected_revision: int,
        expected_library_revision: int,
    ) -> LibrarySnapshot:
        async with self._lock:
            current = self._require_loaded()
            _expect_library_revision(current, expected_library_revision)
            resource = _resource(current, item.id)
            head = cast(int, resource["head_revision"])
            if head != expected_revision:
                raise EffectRevisionConflictError(head)
            if item.revision != head + 1:
                raise EffectStorageError(f"updated effect revision must be {head + 1}")
            if head >= MAX_LIBRARY_REVISIONS_PER_ITEM:
                raise EffectLimitError(f"effect history must not exceed {MAX_LIBRARY_REVISIONS_PER_ITEM} revisions")
            candidate = copy.deepcopy(current)
            candidate_resource = candidate["resources"][str(item.id)]
            candidate_resource["head_revision"] = item.revision
            candidate_resource["deleted"] = False
            candidate_resource["revisions"][str(item.revision)] = item.to_dict()
            candidate["library_revision"] += 1
            return await self._async_commit(candidate)

    async def async_delete(
        self,
        item_id: UUID,
        *,
        expected_revision: int,
        expected_library_revision: int,
    ) -> LibrarySnapshot:
        async with self._lock:
            current = self._require_loaded()
            _expect_library_revision(current, expected_library_revision)
            resource = _resource(current, item_id)
            head = cast(int, resource["head_revision"])
            if head != expected_revision:
                raise EffectRevisionConflictError(head)
            if resource["deleted"]:
                return _snapshot_from_data(current)
            candidate = copy.deepcopy(current)
            candidate["resources"][str(item_id)]["deleted"] = True
            candidate["library_revision"] += 1
            return await self._async_commit(candidate)

    async def async_restore(
        self,
        item_id: UUID,
        *,
        expected_revision: int,
        expected_library_revision: int,
    ) -> LibrarySnapshot:
        async with self._lock:
            current = self._require_loaded()
            _expect_library_revision(current, expected_library_revision)
            resource = _resource(current, item_id)
            head = cast(int, resource["head_revision"])
            if head != expected_revision:
                raise EffectRevisionConflictError(head)
            if not resource["deleted"]:
                return _snapshot_from_data(current)
            candidate = copy.deepcopy(current)
            candidate["resources"][str(item_id)]["deleted"] = False
            candidate["library_revision"] += 1
            return await self._async_commit(candidate)

    async def _async_commit(self, candidate: dict[str, Any]) -> LibrarySnapshot:
        snapshot = _validate_library(candidate)
        await self._store.async_save(candidate)
        self._data = candidate
        for listener in tuple(self._listeners):
            try:
                listener(snapshot)
            except Exception:
                _LOGGER.exception("Effect library subscriber failed after a committed write")
        return snapshot

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise EffectStorageError("effect library has not been loaded")
        return self._data


def _library_store(hass: HomeAssistant) -> VersionedDocumentStore:
    return HomeAssistantVersionedDocumentStore(
        hass,
        LIBRARY_STORE_VERSION,
        LIBRARY_STORE_KEY,
        minor_version=LIBRARY_STORE_MINOR_VERSION,
        migrate=_async_migrate_library,
    )


async def _async_migrate_library(
    old_major_version: int,
    old_minor_version: int,
    old_data: dict[str, Any],
) -> dict[str, Any]:
    if old_major_version == LIBRARY_STORE_VERSION and old_minor_version <= LIBRARY_STORE_MINOR_VERSION:
        return old_data
    raise EffectStorageError(f"cannot migrate effect store version {old_major_version}.{old_minor_version}")


def _empty_library() -> dict[str, Any]:
    return {"library_revision": 0, "resources": {}}


def _validate_library(data: object) -> LibrarySnapshot:
    if not isinstance(data, Mapping):
        raise EffectStorageError("effect library root must be a mapping")
    validate_json_document(
        data,
        "effect library",
        maximum_bytes=MAX_LIBRARY_STORE_BYTES,
        error_type=EffectStorageError,
        maximum_nodes=MAX_STORE_JSON_NODES,
    )
    library_revision = data.get("library_revision")
    resources = data.get("resources")
    if (
        not isinstance(library_revision, int)
        or isinstance(library_revision, bool)
        or not 0 <= library_revision <= MAX_REVISION
    ):
        raise EffectStorageError("effect library revision must be a non-negative integer")
    if not isinstance(resources, Mapping):
        raise EffectStorageError("effect library resources must be a mapping")
    if len(resources) > MAX_LIBRARY_ITEMS:
        raise EffectLimitError(f"effect library must not exceed {MAX_LIBRARY_ITEMS} items")
    items: list[LibraryItem] = []
    for key, raw_resource in resources.items():
        try:
            item_id = UUID(str(key))
        except ValueError as exc:
            raise EffectStorageError(f"invalid effect resource ID {key!r}") from exc
        if not isinstance(raw_resource, Mapping):
            raise EffectStorageError(f"effect resource {item_id} must be a mapping")
        head = raw_resource.get("head_revision")
        deleted = raw_resource.get("deleted")
        revisions = raw_resource.get("revisions")
        if not isinstance(head, int) or isinstance(head, bool) or not 1 <= head <= MAX_LIBRARY_REVISIONS_PER_ITEM:
            raise EffectStorageError(f"effect resource {item_id} has an invalid head revision")
        if not isinstance(deleted, bool):
            raise EffectStorageError(f"effect resource {item_id} has an invalid deleted flag")
        if not isinstance(revisions, Mapping) or str(head) not in revisions:
            raise EffectStorageError(f"effect resource {item_id} is missing its head revision")
        if len(revisions) > MAX_LIBRARY_REVISIONS_PER_ITEM:
            raise EffectLimitError(
                f"effect resource {item_id} must not exceed {MAX_LIBRARY_REVISIONS_PER_ITEM} revisions"
            )
        try:
            revision_numbers = sorted(int(key) for key in revisions)
        except (TypeError, ValueError) as exc:
            raise EffectStorageError(f"effect resource {item_id} has a non-integer revision key") from exc
        if revision_numbers != list(range(1, head + 1)):
            raise EffectStorageError(f"effect resource {item_id} revisions must be contiguous through head {head}")
        for revision_key, raw_item in revisions.items():
            if not isinstance(raw_item, Mapping):
                raise EffectStorageError(f"effect resource {item_id} revision {revision_key} must be a mapping")
            try:
                item = LibraryItem.from_dict(cast(Mapping[str, Any], raw_item))
            except EffectValidationError as exc:
                raise EffectStorageError(
                    f"effect resource {item_id} revision {revision_key} is invalid: {exc}"
                ) from exc
            if item.id != item_id or str(item.revision) != str(revision_key):
                raise EffectStorageError(f"effect resource {item_id} revision {revision_key} has mismatched identity")
        if not deleted:
            items.append(LibraryItem.from_dict(cast(Mapping[str, Any], revisions[str(head)])))
    return LibrarySnapshot(library_revision, tuple(items))


def _snapshot_from_data(
    data: Mapping[str, Any],
    *,
    include_deleted: bool = False,
) -> LibrarySnapshot:
    validated = _validate_library(data)
    if not include_deleted:
        return validated
    resources = cast(Mapping[str, Mapping[str, Any]], data["resources"])
    items = tuple(
        LibraryItem.from_dict(cast(Mapping[str, Any], resource["revisions"][str(resource["head_revision"])]))
        for resource in resources.values()
    )
    return LibrarySnapshot(validated.library_revision, items)


def _resource(data: Mapping[str, Any], item_id: UUID) -> dict[str, Any]:
    resources = cast(dict[str, Any], data["resources"])
    resource = resources.get(str(item_id))
    if not isinstance(resource, dict):
        raise EffectNotFoundError(f"effect {item_id} does not exist")
    return cast(dict[str, Any], resource)


def _expect_library_revision(data: Mapping[str, Any], expected: int) -> None:
    current = cast(int, data["library_revision"])
    if current != expected:
        raise EffectRevisionConflictError(current)
