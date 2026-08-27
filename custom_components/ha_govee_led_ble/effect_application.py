"""Home Assistant-neutral Effect Studio application use cases."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable, Mapping, Sequence
from contextlib import asynccontextmanager
from dataclasses import dataclass, field, replace
from datetime import UTC, datetime
from typing import Any, cast
from uuid import UUID

from .coordinator import GoveeBLECoordinator
from .effect_deployments import DeploymentRecord, EffectDeploymentRepository
from .effect_domain import (
    RGB,
    EffectContent,
    EffectValidationError,
    JsonValue,
    LayeredEffect,
    LibraryItem,
    Origin,
    WorkshopEffect,
    effect_content_from_dict,
)
from .effect_identity import EffectDeviceCache
from .effect_runtime import EffectDeploymentEngine
from .effect_selector import normalise_effect_name, validate_saved_effect_name
from .effect_storage import (
    EffectLibraryRepository,
    EffectStorageError,
    EffectVersionConflictError,
    LibrarySnapshot,
)
from .effect_user_state import EffectUserState, EffectUserStateRepository


@dataclass(frozen=True, slots=True)
class LibraryMutation:
    item: LibraryItem
    snapshot: LibrarySnapshot


@dataclass(slots=True)
class EffectStudioApplication:
    library: EffectLibraryRepository
    deployments: EffectDeploymentRepository
    user_state: EffectUserStateRepository
    device_cache: EffectDeviceCache | None = None
    _library_mutation_lock: asyncio.Lock = field(default_factory=asyncio.Lock, init=False, repr=False)

    def library_snapshot(self) -> LibrarySnapshot:
        return self.library.snapshot()

    def subscribe_library(
        self,
        listener: Callable[[LibrarySnapshot], None],
    ) -> Callable[[], None]:
        return self.library.subscribe(listener)

    def get_saved_effect(self, item_id: str) -> LibraryItem:
        return self.library.get(UUID(item_id))

    async def async_apply_saved_effect(
        self,
        engine: EffectDeploymentEngine,
        coordinator: GoveeBLECoordinator,
        *,
        item_id: str,
        config_entry_id: str,
        updated_at: str,
        operation_id: UUID | None = None,
        expected_version: int | None = None,
    ) -> DeploymentRecord:
        async with self.saved_effect_for_apply(
            item_id,
            expected_version=expected_version,
        ) as item:
            return await engine.async_apply_saved(
                coordinator,
                item,
                config_entry_id=config_entry_id,
                updated_at=updated_at,
                operation_id=operation_id,
            )

    @asynccontextmanager
    async def saved_effect_for_apply(
        self,
        item_id: str,
        *,
        expected_version: int | None = None,
    ) -> AsyncIterator[LibraryItem]:
        async with self._library_mutation_lock:
            item = self.get_saved_effect(item_id)
            if expected_version is not None and item.version != expected_version:
                raise EffectVersionConflictError(item.version)
            yield item

    async def async_create_library_item(
        self,
        *,
        name: str,
        content: Mapping[str, Any],
    ) -> LibraryMutation:
        async with self._library_mutation_lock:
            item = self.new_authored_item(name=name, content=content)
            validate_saved_effect_name(item.name, self.library_snapshot().items)
            snapshot = await self.library.async_create(item)
            return LibraryMutation(item, snapshot)

    async def async_update_library_item(
        self,
        *,
        item_id: str,
        name: str,
        content: Mapping[str, Any],
        expected_version: int,
        expected_updated_at: str,
    ) -> LibraryMutation:
        async with self._library_mutation_lock:
            current = self.get_saved_effect(item_id)
            item = replace(
                current,
                version=current.version + 1,
                updated_at=datetime.now(UTC).isoformat(),
                name=name,
                content=_authored_content_from_dict(content),
                content_hash="",
            )
            validate_saved_effect_name(
                item.name,
                self.library_snapshot().items,
                excluding_item_id=item.id,
                allow_reserved=normalise_effect_name(item.name) == normalise_effect_name(current.name),
            )
            snapshot = await self.library.async_update(
                item,
                expected_version=expected_version,
                expected_updated_at=expected_updated_at,
            )
            return LibraryMutation(item, snapshot)

    async def async_delete_library_item(
        self,
        *,
        item_id: str,
        expected_version: int,
        expected_updated_at: str,
    ) -> LibrarySnapshot:
        resolved_item_id = UUID(item_id)
        async with self._library_mutation_lock:
            item = self.library.assert_write_token(
                resolved_item_id,
                expected_version=expected_version,
                expected_updated_at=expected_updated_at,
            )
            detachment = await self.deployments.async_detach_item(resolved_item_id)
            deleted = False
            try:
                snapshot = await self.library.async_delete(
                    resolved_item_id,
                    expected_version=expected_version,
                    expected_updated_at=expected_updated_at,
                )
                deleted = True
                if self.device_cache is not None:
                    self.device_cache.detach_item(resolved_item_id)
                return snapshot
            finally:
                if not deleted:
                    await self.deployments.async_reattach_item(
                        detachment,
                        item_id=resolved_item_id,
                        item_version=item.version,
                    )

    def get_user_state(self, owner_id: str) -> EffectUserState:
        return self.user_state.get(owner_id)

    def update_user_state(
        self,
        owner_id: str,
        *,
        selected_config_entry_id: str | None,
        navigation: Mapping[str, JsonValue],
    ) -> EffectUserState:
        current = self.user_state.get(owner_id)
        updated = EffectUserState(
            owner_id=current.owner_id,
            recent_colours=current.recent_colours,
            selected_config_entry_id=selected_config_entry_id,
            navigation=navigation,
        )
        self.user_state.set(updated)
        return updated

    def record_user_colour(
        self,
        owner_id: str,
        colour: Sequence[int],
    ) -> EffectUserState:
        if len(colour) != 3:
            raise EffectStorageError("colour must contain three channels")
        return self.user_state.record_colour(
            owner_id,
            cast(RGB, tuple(colour)),
        )

    @staticmethod
    def new_authored_item(
        *,
        name: str,
        content: Mapping[str, Any],
        origin: Origin | None = None,
    ) -> LibraryItem:
        return LibraryItem.new(
            name,
            _authored_content_from_dict(content),
            origin=origin,
        )


def _authored_content_from_dict(raw: Mapping[str, Any]) -> EffectContent:
    content = effect_content_from_dict(raw)
    layered = content.effect if isinstance(content, WorkshopEffect) else content
    if not isinstance(layered, LayeredEffect):
        return content
    if not layered.layers:
        raise EffectValidationError("Advanced effect must contain at least one layer")
    for index, layer in enumerate(layered.layers, start=1):
        if not layer.brightness_patterns:
            raise EffectValidationError(f"Advanced effect layer {index} must contain at least one brightness pattern")
    return content
