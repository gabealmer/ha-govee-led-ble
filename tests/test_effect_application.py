"""Home Assistant-neutral Effect Studio application use cases."""

from __future__ import annotations

from typing import Any

import pytest

from custom_components.ha_govee_led_ble.effect_application import EffectStudioApplication
from custom_components.ha_govee_led_ble.effect_domain import SingleEffect, effect_content_to_dict
from custom_components.ha_govee_led_ble.effect_drafts import EffectDraftRepository
from custom_components.ha_govee_led_ble.effect_storage import (
    EffectLibraryRepository,
    EffectNotFoundError,
    EffectRevisionConflictError,
    EffectStorageError,
)
from custom_components.ha_govee_led_ble.effect_user_state import EffectUserStateRepository
from tests.storage_test_double import InMemoryVersionedDocumentStore


async def _application() -> EffectStudioApplication:
    library = EffectLibraryRepository(InMemoryVersionedDocumentStore())
    drafts = EffectDraftRepository(InMemoryVersionedDocumentStore())
    user_state = EffectUserStateRepository(InMemoryVersionedDocumentStore())
    await library.async_load()
    await drafts.async_load()
    await user_state.async_load()
    return EffectStudioApplication(library, drafts, user_state)


def _content() -> dict[str, Any]:
    return effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),)))


async def test_library_use_cases_construct_revisions_and_publish_committed_snapshots() -> None:
    application = await _application()
    published_revisions: list[int] = []
    unsubscribe = application.subscribe_library(lambda snapshot: published_revisions.append(snapshot.library_revision))

    created = await application.async_create_library_item(
        name="Test",
        content=_content(),
        expected_library_revision=0,
    )
    updated = await application.async_update_library_item(
        item_id=str(created.item.id),
        name="Renamed",
        content=_content(),
        expected_revision=1,
        expected_library_revision=1,
    )

    assert created.item.revision == 1
    assert updated.item.revision == 2
    assert application.get_saved_effect(str(created.item.id), 1).name == "Test"
    assert application.library_snapshot().items == (updated.item,)
    assert published_revisions == [1, 2]

    deleted = await application.async_delete_library_item(
        item_id=str(created.item.id),
        expected_revision=2,
        expected_library_revision=2,
    )
    restored = await application.async_restore_library_item(
        item_id=str(created.item.id),
        expected_revision=2,
        expected_library_revision=deleted.library_revision,
    )
    unsubscribe()

    assert deleted.items == ()
    assert restored.items == (updated.item,)
    assert published_revisions == [1, 2, 3, 4]


async def test_library_use_cases_enforce_optimistic_revisions() -> None:
    application = await _application()
    created = await application.async_create_library_item(
        name="Test",
        content=_content(),
        expected_library_revision=0,
    )

    with pytest.raises(EffectRevisionConflictError) as error:
        await application.async_update_library_item(
            item_id=str(created.item.id),
            name="Stale",
            content=_content(),
            expected_revision=1,
            expected_library_revision=0,
        )

    assert error.value.current_revision == 1


@pytest.mark.parametrize(
    "content, message",
    [
        ({"kind": "advanced", "layers": []}, "at least one layer"),
        (
            {
                "kind": "advanced",
                "layers": [
                    {
                        "area": {"start_tenths": 0, "width_tenths": 10},
                        "selection": {"type": 0, "param_1": 0, "param_2": 0},
                        "brightness_gradient": False,
                        "brightness_patterns": [],
                        "distribution": {"method": 0, "backwards": False},
                        "colour_speed": 0,
                        "colour_retention": 0,
                        "palette": [[255, 0, 0]],
                        "selected_movement": {
                            "enabled": False,
                            "enter_exit": False,
                            "direction": 0,
                            "distance": 0,
                            "speed": 0,
                            "unknown_flags": 0,
                        },
                        "overall_movement": {
                            "enabled": False,
                            "enter_exit": False,
                            "direction": 0,
                            "distance": 0,
                            "speed": 0,
                            "unknown_flags": 0,
                        },
                        "priority": 0,
                        "unknown_flags": 0,
                        "excess": "",
                    }
                ],
            },
            "at least one brightness pattern",
        ),
    ],
)
async def test_authored_content_validation_is_shared_by_library_and_drafts(
    content: dict[str, Any],
    message: str,
) -> None:
    application = await _application()

    with pytest.raises(ValueError, match=message):
        await application.async_create_library_item(
            name="Invalid",
            content=content,
            expected_library_revision=0,
        )
    with pytest.raises(ValueError, match=message):
        await application.async_create_draft(
            "owner-a",
            name="Invalid",
            content=content,
            updated_at="2026-08-12T00:00:00Z",
        )


async def test_draft_use_cases_scope_ownership_and_construct_revisions() -> None:
    application = await _application()
    created = await application.async_create_draft(
        "owner-a",
        name="Draft",
        content=_content(),
        updated_at="2026-08-12T00:00:00Z",
        selected_config_entry_id="entry-a",
    )

    assert application.list_drafts("owner-a") == (created,)
    assert application.list_drafts("owner-b") == ()
    with pytest.raises(EffectNotFoundError):
        application.get_draft("owner-b", str(created.id))

    updated = await application.async_update_draft(
        "owner-a",
        draft_id=str(created.id),
        expected_revision=1,
        name="Updated",
        content=_content(),
        updated_at="2026-08-12T00:01:00Z",
    )
    assert updated.revision == 2

    with pytest.raises(EffectRevisionConflictError) as error:
        await application.async_delete_draft(
            "owner-a",
            draft_id=str(created.id),
            expected_revision=1,
        )
    assert error.value.current_revision == 2

    await application.async_delete_draft(
        "owner-a",
        draft_id=str(created.id),
        expected_revision=2,
    )
    assert application.list_drafts("owner-a") == ()


async def test_user_state_use_cases_scope_preferences_and_recent_colours() -> None:
    application = await _application()

    updated = application.update_user_state("owner-a", {"pane": "scenes"})
    coloured = application.record_user_colour("owner-a", [255, 0, 0])

    assert updated.preferences == {"pane": "scenes"}
    assert coloured.recent_colours == ((255, 0, 0),)
    assert application.get_user_state("owner-b").preferences == {}
    with pytest.raises(EffectStorageError, match="three channels"):
        application.record_user_colour("owner-a", [1, 2])
