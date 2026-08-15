"""Home Assistant-neutral Effect Studio application use cases."""

from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, replace
from typing import Any, cast
from uuid import UUID, uuid4

from .effect_domain import (
    RGB,
    EffectContent,
    EffectValidationError,
    JsonValue,
    LayeredEffect,
    LibraryItem,
    WorkshopEffect,
    effect_content_from_dict,
)
from .effect_drafts import EffectDraft, EffectDraftRepository
from .effect_storage import EffectLibraryRepository, EffectStorageError, LibrarySnapshot
from .effect_user_state import EffectUserState, EffectUserStateRepository


@dataclass(frozen=True, slots=True)
class LibraryMutation:
    item: LibraryItem
    snapshot: LibrarySnapshot


@dataclass(slots=True)
class EffectStudioApplication:
    library: EffectLibraryRepository
    drafts: EffectDraftRepository
    user_state: EffectUserStateRepository

    def library_snapshot(self) -> LibrarySnapshot:
        return self.library.snapshot()

    def subscribe_library(
        self,
        listener: Callable[[LibrarySnapshot], None],
    ) -> Callable[[], None]:
        return self.library.subscribe(listener)

    def get_saved_effect(
        self,
        item_id: str,
        revision: int | None = None,
    ) -> LibraryItem:
        return self.library.get(UUID(item_id), revision)

    async def async_create_library_item(
        self,
        *,
        name: str,
        content: Mapping[str, Any],
        expected_library_revision: int,
    ) -> LibraryMutation:
        item = self.new_authored_item(name=name, content=content)
        snapshot = await self.library.async_create(
            item,
            expected_library_revision=expected_library_revision,
        )
        return LibraryMutation(item, snapshot)

    async def async_update_library_item(
        self,
        *,
        item_id: str,
        name: str,
        content: Mapping[str, Any],
        expected_revision: int,
        expected_library_revision: int,
    ) -> LibraryMutation:
        current = self.get_saved_effect(item_id)
        item = replace(
            current,
            revision=current.revision + 1,
            name=name,
            content=_authored_content_from_dict(content),
        )
        snapshot = await self.library.async_update(
            item,
            expected_revision=expected_revision,
            expected_library_revision=expected_library_revision,
        )
        return LibraryMutation(item, snapshot)

    async def async_delete_library_item(
        self,
        *,
        item_id: str,
        expected_revision: int,
        expected_library_revision: int,
    ) -> LibrarySnapshot:
        return await self.library.async_delete(
            UUID(item_id),
            expected_revision=expected_revision,
            expected_library_revision=expected_library_revision,
        )

    async def async_restore_library_item(
        self,
        *,
        item_id: str,
        expected_revision: int,
        expected_library_revision: int,
    ) -> LibrarySnapshot:
        return await self.library.async_restore(
            UUID(item_id),
            expected_revision=expected_revision,
            expected_library_revision=expected_library_revision,
        )

    def list_drafts(self, owner_id: str) -> tuple[EffectDraft, ...]:
        return self.drafts.list_for_owner(owner_id)

    def get_draft(self, owner_id: str, draft_id: str) -> EffectDraft:
        return self.drafts.get(UUID(draft_id), owner_id)

    async def async_create_draft(
        self,
        owner_id: str,
        *,
        name: str,
        content: Mapping[str, Any],
        updated_at: str,
        selected_config_entry_id: str | None = None,
        base_item_id: str | None = None,
        base_item_revision: int | None = None,
    ) -> EffectDraft:
        draft = EffectDraft(
            id=uuid4(),
            owner_id=owner_id,
            revision=1,
            item=self.new_authored_item(name=name, content=content),
            updated_at=updated_at,
            selected_config_entry_id=selected_config_entry_id,
            base_item_id=None if base_item_id is None else UUID(base_item_id),
            base_item_revision=base_item_revision,
        )
        return await self.drafts.async_put(draft, expected_revision=None)

    async def async_update_draft(
        self,
        owner_id: str,
        *,
        draft_id: str,
        expected_revision: int,
        name: str,
        content: Mapping[str, Any],
        updated_at: str,
        selected_config_entry_id: str | None = None,
    ) -> EffectDraft:
        current = self.get_draft(owner_id, draft_id)
        draft = replace(
            current,
            revision=current.revision + 1,
            item=replace(
                current.item,
                name=name,
                content=_authored_content_from_dict(content),
            ),
            updated_at=updated_at,
            selected_config_entry_id=selected_config_entry_id,
        )
        return await self.drafts.async_put(
            draft,
            expected_revision=expected_revision,
        )

    async def async_delete_draft(
        self,
        owner_id: str,
        *,
        draft_id: str,
        expected_revision: int,
    ) -> None:
        await self.drafts.async_delete(
            UUID(draft_id),
            owner_id,
            expected_revision=expected_revision,
        )

    def get_user_state(self, owner_id: str) -> EffectUserState:
        return self.user_state.get(owner_id)

    def update_user_state(
        self,
        owner_id: str,
        preferences: Mapping[str, JsonValue],
    ) -> EffectUserState:
        current = self.user_state.get(owner_id)
        updated = EffectUserState(
            owner_id=current.owner_id,
            recent_colours=current.recent_colours,
            preferences=preferences,
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
    ) -> LibraryItem:
        return LibraryItem.new(name, _authored_content_from_dict(content))


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
