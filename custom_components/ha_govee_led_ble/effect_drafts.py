"""Owner-scoped recovery drafts for the advanced editor."""

from __future__ import annotations

import asyncio
import copy
import logging
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, Final, cast
from uuid import UUID

from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .effect_domain import EffectValidationError, LibraryItem
from .effect_limits import (
    MAX_DRAFT_STORE_BYTES,
    MAX_DRAFTS_PER_OWNER,
    MAX_DRAFTS_TOTAL,
    MAX_IDENTIFIER_LENGTH,
    MAX_STORE_JSON_NODES,
    validate_bounded_string,
    validate_json_document,
    validate_revision,
    validate_timestamp,
)
from .effect_storage import (
    EffectLimitError,
    EffectNotFoundError,
    EffectRevisionConflictError,
    EffectStorageError,
)
from .effect_store import HomeAssistantVersionedDocumentStore, VersionedDocumentStore

DRAFT_STORE_VERSION: Final = 1
DRAFT_STORE_MINOR_VERSION: Final = 1
DRAFT_STORE_KEY: Final = f"{DOMAIN}.effect_drafts"

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class EffectDraft:
    id: UUID
    owner_id: str
    revision: int
    item: LibraryItem
    updated_at: str
    selected_config_entry_id: str | None = None
    base_item_id: UUID | None = None
    base_item_revision: int | None = None

    def __post_init__(self) -> None:
        validate_bounded_string(
            self.owner_id,
            "draft owner",
            maximum=MAX_IDENTIFIER_LENGTH,
            error_type=EffectStorageError,
        )
        validate_timestamp(
            self.updated_at,
            "draft timestamp",
            error_type=EffectStorageError,
        )
        validate_revision(
            self.revision,
            "draft revision",
            minimum=1,
            error_type=EffectStorageError,
        )
        if self.selected_config_entry_id is not None:
            validate_bounded_string(
                self.selected_config_entry_id,
                "draft config entry ID",
                maximum=MAX_IDENTIFIER_LENGTH,
                error_type=EffectStorageError,
            )
        if (self.base_item_id is None) != (self.base_item_revision is None):
            raise EffectStorageError("draft base ID and revision must be provided together")
        if self.base_item_revision is not None:
            validate_revision(
                self.base_item_revision,
                "draft base revision",
                minimum=1,
                error_type=EffectStorageError,
            )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "owner_id": self.owner_id,
            "revision": self.revision,
            "item": self.item.to_dict(),
            "updated_at": self.updated_at,
            "selected_config_entry_id": self.selected_config_entry_id,
            "base_item_id": (str(self.base_item_id) if self.base_item_id is not None else None),
            "base_item_revision": self.base_item_revision,
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> EffectDraft:
        try:
            draft_id = UUID(_required_str(raw, "id"))
            base_raw = raw.get("base_item_id")
            base_id = None if base_raw is None else UUID(str(base_raw))
        except ValueError as exc:
            raise EffectStorageError("draft contains an invalid UUID") from exc
        try:
            item = LibraryItem.from_dict(_required_mapping(raw, "item"))
        except EffectValidationError as exc:
            raise EffectStorageError(f"draft item is invalid: {exc}") from exc
        return cls(
            id=draft_id,
            owner_id=_required_str(raw, "owner_id"),
            revision=_required_int(raw, "revision"),
            item=item,
            updated_at=_required_str(raw, "updated_at"),
            selected_config_entry_id=_optional_str(raw, "selected_config_entry_id"),
            base_item_id=base_id,
            base_item_revision=_optional_int(raw, "base_item_revision"),
        )


class EffectDraftRepository:
    def __init__(self, hass: HomeAssistant | VersionedDocumentStore) -> None:
        self._store = _draft_store(hass) if isinstance(hass, HomeAssistant) else hass
        self._lock = asyncio.Lock()
        self._data: dict[str, Any] | None = None

    async def async_load(self) -> tuple[EffectDraft, ...]:
        async with self._lock:
            stored = await self._store.async_load()
            data = {"drafts": {}} if stored is None else stored
            drafts, cleaned = _load_drafts(data)
            if cleaned != data:
                await self._store.async_save(cleaned)
            self._data = copy.deepcopy(cleaned)
            return drafts

    def list_for_owner(self, owner_id: str) -> tuple[EffectDraft, ...]:
        return tuple(draft for draft in _validate_drafts(self._require_loaded()) if draft.owner_id == owner_id)

    def get(self, draft_id: UUID, owner_id: str) -> EffectDraft:
        drafts = cast(dict[str, Any], self._require_loaded()["drafts"])
        raw = drafts.get(str(draft_id))
        if not isinstance(raw, Mapping):
            raise EffectNotFoundError(f"draft {draft_id} does not exist")
        draft = EffectDraft.from_dict(cast(Mapping[str, Any], raw))
        if draft.owner_id != owner_id:
            raise EffectNotFoundError(f"draft {draft_id} does not exist")
        return draft

    async def async_put(
        self,
        draft: EffectDraft,
        *,
        expected_revision: int | None,
    ) -> EffectDraft:
        async with self._lock:
            current = self._require_loaded()
            existing_raw = current["drafts"].get(str(draft.id))
            if existing_raw is None:
                if expected_revision is not None or draft.revision != 1:
                    raise EffectRevisionConflictError(0)
                drafts = tuple(
                    EffectDraft.from_dict(cast(Mapping[str, Any], raw)) for raw in current["drafts"].values()
                )
                if len(drafts) >= MAX_DRAFTS_TOTAL:
                    raise EffectLimitError(f"draft store must not exceed {MAX_DRAFTS_TOTAL} drafts")
                if sum(existing.owner_id == draft.owner_id for existing in drafts) >= MAX_DRAFTS_PER_OWNER:
                    raise EffectLimitError(f"each user must not exceed {MAX_DRAFTS_PER_OWNER} recovery drafts")
            else:
                existing = EffectDraft.from_dict(cast(Mapping[str, Any], existing_raw))
                if existing.owner_id != draft.owner_id:
                    raise EffectNotFoundError(f"draft {draft.id} does not exist")
                if expected_revision != existing.revision:
                    raise EffectRevisionConflictError(existing.revision)
                if draft.revision != existing.revision + 1:
                    raise EffectStorageError(f"updated draft revision must be {existing.revision + 1}")
            candidate = copy.deepcopy(current)
            candidate["drafts"][str(draft.id)] = draft.to_dict()
            _validate_drafts(candidate)
            await self._store.async_save(candidate)
            self._data = candidate
            return draft

    async def async_delete(
        self,
        draft_id: UUID,
        owner_id: str,
        *,
        expected_revision: int,
    ) -> None:
        async with self._lock:
            current = self._require_loaded()
            draft = self.get(draft_id, owner_id)
            if draft.revision != expected_revision:
                raise EffectRevisionConflictError(draft.revision)
            candidate = copy.deepcopy(current)
            candidate["drafts"].pop(str(draft_id))
            await self._store.async_save(candidate)
            self._data = candidate

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise EffectStorageError("draft store has not been loaded")
        return self._data


def _draft_store(hass: HomeAssistant) -> VersionedDocumentStore:
    return HomeAssistantVersionedDocumentStore(
        hass,
        DRAFT_STORE_VERSION,
        DRAFT_STORE_KEY,
        minor_version=DRAFT_STORE_MINOR_VERSION,
        migrate=_async_migrate_drafts,
    )


async def _async_migrate_drafts(
    old_major_version: int,
    old_minor_version: int,
    old_data: dict[str, Any],
) -> dict[str, Any]:
    if old_major_version == DRAFT_STORE_VERSION and old_minor_version <= DRAFT_STORE_MINOR_VERSION:
        return old_data
    raise EffectStorageError(f"cannot migrate draft store version {old_major_version}.{old_minor_version}")


def _validate_drafts(data: object) -> tuple[EffectDraft, ...]:
    raw = _as_mapping(data, "draft store")
    validate_json_document(
        raw,
        "draft store",
        maximum_bytes=MAX_DRAFT_STORE_BYTES,
        error_type=EffectStorageError,
        maximum_nodes=MAX_STORE_JSON_NODES,
    )
    drafts = _required_mapping(raw, "drafts")
    if len(drafts) > MAX_DRAFTS_TOTAL:
        raise EffectLimitError(f"draft store must not exceed {MAX_DRAFTS_TOTAL} drafts")
    parsed = tuple(EffectDraft.from_dict(_as_mapping(draft, f"draft {key}")) for key, draft in drafts.items())
    if any(str(draft.id) != str(key) for key, draft in zip(drafts, parsed, strict=True)):
        raise EffectStorageError("draft key does not match draft ID")
    owner_counts: dict[str, int] = {}
    for draft in parsed:
        owner_counts[draft.owner_id] = owner_counts.get(draft.owner_id, 0) + 1
    if any(count > MAX_DRAFTS_PER_OWNER for count in owner_counts.values()):
        raise EffectLimitError(f"each user must not exceed {MAX_DRAFTS_PER_OWNER} recovery drafts")
    return parsed


def _load_drafts(data: object) -> tuple[tuple[EffectDraft, ...], dict[str, Any]]:
    raw = _as_mapping(data, "draft store")
    drafts = _required_mapping(raw, "drafts")
    cleaned: dict[str, Any] = {}
    parsed: list[EffectDraft] = []
    invalid = 0
    for key, value in drafts.items():
        try:
            validate_json_document(
                value,
                f"draft {key}",
                maximum_bytes=MAX_DRAFT_STORE_BYTES,
                error_type=EffectStorageError,
            )
            draft = EffectDraft.from_dict(_as_mapping(value, "draft"))
            if str(draft.id) != str(key):
                raise EffectStorageError("draft key does not match draft ID")
        except EffectStorageError:
            invalid += 1
            continue
        cleaned[str(key)] = draft.to_dict()
        parsed.append(draft)
    candidate = {"drafts": cleaned}
    validated = _validate_drafts(candidate)
    if invalid:
        _LOGGER.warning("Discarded %d invalid Effect Studio recovery draft(s)", invalid)
    return validated, candidate


def _as_mapping(value: object, name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise EffectStorageError(f"{name} must be a mapping")
    return cast(Mapping[str, Any], value)


def _required_mapping(raw: Mapping[str, Any], key: str) -> Mapping[str, Any]:
    if key not in raw:
        raise EffectStorageError(f"missing required field {key!r}")
    return _as_mapping(raw[key], key)


def _required_str(raw: Mapping[str, Any], key: str) -> str:
    value = raw.get(key)
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string")
    return value


def _optional_str(raw: Mapping[str, Any], key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string or null")
    return value


def _required_int(raw: Mapping[str, Any], key: str) -> int:
    value = raw.get(key)
    if not isinstance(value, int) or isinstance(value, bool):
        raise EffectStorageError(f"{key} must be an integer")
    return value


def _optional_int(raw: Mapping[str, Any], key: str) -> int | None:
    value = raw.get(key)
    if value is None:
        return None
    if not isinstance(value, int) or isinstance(value, bool):
        raise EffectStorageError(f"{key} must be an integer or null")
    return value
