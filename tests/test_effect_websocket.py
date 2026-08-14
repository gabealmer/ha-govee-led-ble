"""Authenticated read and admin mutation WebSocket contracts."""

from __future__ import annotations

import asyncio
import base64
from copy import deepcopy
from hashlib import sha256
from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import AsyncMock, call
from uuid import uuid4

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.setup import async_setup_component

from custom_components.ha_govee_led_ble.const import EFFECT_FAMILY_SCENES
from custom_components.ha_govee_led_ble.effect_backend import EffectBackend
from custom_components.ha_govee_led_ble.effect_catalogue import H6199_DIY_EFFECTS
from custom_components.ha_govee_led_ble.effect_compiler import compile_effect
from custom_components.ha_govee_led_ble.effect_deployments import (
    DeploymentPhase,
    DeploymentRecord,
    ObservationConfidence,
)
from custom_components.ha_govee_led_ble.effect_domain import (
    LibraryItem,
    MusicProfile,
    OpaqueContent,
    PaintedEffect,
    PaletteDiyEffect,
    RelativeBrightness,
    SingleEffect,
    TargetHint,
    VideoProfile,
    effect_content_from_dict,
    effect_content_to_dict,
)
from custom_components.ha_govee_led_ble.effect_limits import (
    MAX_EFFECT_DOCUMENT_BYTES,
    MAX_EFFECT_NAME_LENGTH,
)
from custom_components.ha_govee_led_ble.effect_scenes import scene_detail_payload
from custom_components.ha_govee_led_ble.effect_websocket import (
    WS_APPLY,
    WS_APPLY_SNAPSHOT,
    WS_CUSTOM_CATALOGUE,
    WS_DEPLOYMENT_SUBSCRIBE,
    WS_DEVICES,
    WS_DRAFT_CREATE,
    WS_DRAFT_DELETE,
    WS_DRAFT_GET,
    WS_DRAFT_LIST,
    WS_DRAFT_UPDATE,
    WS_INFO,
    WS_LIBRARY_CREATE,
    WS_LIBRARY_DELETE,
    WS_LIBRARY_GET,
    WS_LIBRARY_LIST,
    WS_LIBRARY_SUBSCRIBE,
    WS_LIBRARY_UPDATE,
    WS_SCENE_APPLY,
    WS_SCENE_CATALOGUE_GET,
    WS_SCENE_CATALOGUE_LIST,
    WS_USER_STATE_GET,
    WS_USER_STATE_RECORD_COLOUR,
    WS_USER_STATE_UPDATE,
    async_register_effect_websocket,
)
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES


async def _setup_backend(hass: HomeAssistant) -> EffectBackend:
    assert await async_setup_component(hass, "websocket_api", {})
    backend = await EffectBackend.async_create(hass)
    async_register_effect_websocket(hass, backend)
    return backend


def _layered_scene_content() -> dict[str, Any]:
    entry = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.scene_type == 2 and scene.param)
    return cast(
        dict[str, Any],
        scene_detail_payload("H617A", entry.scene_id, entry.effect_id)["content"],
    )


def _saved_profile_contents() -> tuple[dict[str, Any], ...]:
    return (
        effect_content_to_dict(PaletteDiyEffect("H6199", 8, 9, 60, ((255, 0, 0), (0, 0, 255)))),
        effect_content_to_dict(
            MusicProfile(
                "H6199",
                "rolling",
                75,
                None,
                True,
                {
                    "preset": "warm",
                    "bands": [1, 2, 3],
                    "mirror": False,
                    "slot": 2,
                    "override": None,
                },
            )
        ),
        effect_content_to_dict(
            VideoProfile(
                "H6199",
                "movie",
                True,
                70,
                True,
                40,
                12,
                RelativeBrightness(80, 60, 55, 45),
                False,
            )
        ),
    )


async def test_authenticated_users_can_read_library(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(
        hass,
        access_token=hass_read_only_access_token,
    )

    await client.send_json_auto_id({"type": WS_INFO})
    info = await client.receive_json()
    await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
    listing = await client.receive_json()
    await client.send_json_auto_id({"type": WS_CUSTOM_CATALOGUE})
    catalogue = await client.receive_json()

    assert info["success"] is True
    assert info["result"]["api_version"] == 2
    assert listing["success"] is True
    assert listing["result"] == {"library_revision": 0, "items": []}
    assert catalogue["success"] is True
    assert catalogue["result"]["catalogue"]["schema_version"] == 4
    assert sorted(catalogue["result"]["catalogue"]["models"]) == ["H617A", "H6199"]
    assert [effect["label"] for effect in catalogue["result"]["catalogue"]["effects"]] == [
        "Fade",
        "Jumping",
        "Blinking",
        "Marquee",
        "Music",
        "Stream",
        "Flow",
        "Chase",
    ]
    assert catalogue["result"]["catalogue"]["models"]["H6199"]["video_modes"] == [
        {"id": "movie", "label": "Movie"},
        {"id": "game", "label": "Game"},
    ]
    assert {workflow["id"] for workflow in catalogue["result"]["catalogue"]["models"]["H6199"]["workflows"]} >= {
        "workshop",
        "special_diy",
    }


async def test_non_admin_mutation_is_rejected(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(
        hass,
        access_token=hass_read_only_access_token,
    )

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Test",
            "content": effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),))),
            "expected_library_revision": 0,
        }
    )
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "unauthorized"

    await client.send_json_auto_id(
        {
            "type": WS_APPLY_SNAPSHOT,
            "config_entry_id": "entry-a",
            "name": "Unsaved",
            "content": effect_content_to_dict(PaintedEffect("clockwise", 50, 100, (0, 0, 0))),
            "updated_at": "2026-08-11T00:00:00Z",
        }
    )
    snapshot_response = await client.receive_json()

    assert snapshot_response["success"] is False
    assert snapshot_response["error"]["code"] == "unauthorized"


async def test_non_admin_cannot_read_opaque_library_content(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    backend = await _setup_backend(hass)
    item = LibraryItem.new(
        "Future definition",
        OpaqueContent(
            "future_private",
            {
                "payload": "opaque",
                "template": {"secret": "opaque-summary-secret"},
            },
        ),
        target_hint=TargetHint("future-model", 15),
    )
    await backend.library.async_create(item, expected_library_revision=0)
    client = await hass_ws_client(
        hass,
        access_token=hass_read_only_access_token,
    )

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_GET,
            "item_id": str(item.id),
        }
    )
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "unauthorized"

    await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
    listing = await client.receive_json()
    assert listing["result"]["items"] == [
        {
            "id": str(item.id),
            "revision": 1,
            "name": "Future definition",
            "kind": "future_private",
        }
    ]

    await client.send_json_auto_id({"type": WS_LIBRARY_SUBSCRIBE})
    subscribed = await client.receive_json()
    initial = await client.receive_json()
    assert subscribed["success"] is True
    assert initial["event"]["items"] == listing["result"]["items"]


async def test_admin_library_lifecycle_and_conflict(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    content = effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),)))

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Test",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    created = await client.receive_json()
    item_id = created["result"]["item"]["id"]
    assert created["success"] is True
    assert created["result"]["library_revision"] == 1

    await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
    listing = await client.receive_json()
    assert listing["result"]["items"][0]["model"] == "H617A"

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_GET,
            "item_id": item_id,
        }
    )
    fetched = await client.receive_json()
    assert fetched["result"]["item"]["name"] == "Test"

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": item_id,
            "name": "Renamed",
            "content": content,
            "expected_revision": 1,
            "expected_library_revision": 1,
        }
    )
    updated = await client.receive_json()
    assert updated["success"] is True
    assert updated["result"]["item"]["revision"] == 2

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": item_id,
            "name": "Stale",
            "content": content,
            "expected_revision": 1,
            "expected_library_revision": 2,
        }
    )
    conflict = await client.receive_json()
    assert conflict["success"] is False
    assert conflict["error"]["code"] == "conflict"

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_DELETE,
            "item_id": item_id,
            "expected_revision": 2,
            "expected_library_revision": 2,
        }
    )
    deleted = await client.receive_json()
    assert deleted["success"] is True
    assert deleted["result"]["library_revision"] == 3


async def test_library_errors_have_stable_codes(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_GET,
            "item_id": "not-a-uuid",
        }
    )
    missing = await client.receive_json()
    assert missing["error"]["code"] == "invalid_format"

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "",
            "content": {"kind": "h617a_single"},
            "expected_library_revision": 0,
        }
    )
    invalid = await client.receive_json()
    assert invalid["error"]["code"] == "invalid_format"

    content = effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),)))
    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Test",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    created = await client.receive_json()
    item_id = created["result"]["item"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Conflict",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    conflict = await client.receive_json()
    assert conflict["error"]["code"] == "conflict"

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": item_id,
            "name": "Invalid",
            "content": {"kind": "h617a_single"},
            "expected_revision": 1,
            "expected_library_revision": 1,
        }
    )
    update_invalid = await client.receive_json()
    assert update_invalid["error"]["code"] == "invalid_format"

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_DELETE,
            "item_id": str(uuid4()),
            "expected_revision": 1,
            "expected_library_revision": 1,
        }
    )
    delete_missing = await client.receive_json()
    assert delete_missing["error"]["code"] == "not_found"


@pytest.mark.parametrize(
    "message",
    [
        {
            "type": WS_LIBRARY_CREATE,
            "name": "x" * (MAX_EFFECT_NAME_LENGTH + 1),
            "content": effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),))),
            "expected_library_revision": 0,
        },
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Oversized",
            "content": {
                "kind": "future",
                "body": "x" * MAX_EFFECT_DOCUMENT_BYTES,
            },
            "expected_library_revision": 0,
        },
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Boolean revision",
            "content": effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),))),
            "expected_library_revision": False,
        },
    ],
)
async def test_websocket_request_boundaries_reject_oversized_or_ambiguous_values(
    hass: HomeAssistant,
    hass_ws_client,
    message: dict[str, Any],
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(message)
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "invalid_format"


async def test_empty_authored_advanced_mutations_are_rejected(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    scene_content = _layered_scene_content()
    valid_advanced = {
        "kind": "advanced",
        **cast(dict[str, Any], scene_content["effect"]),
    }
    empty_layers = {"kind": "advanced", "layers": []}
    empty_patterns = deepcopy(valid_advanced)
    empty_patterns["layers"][0]["brightness_patterns"] = []

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Empty advanced",
            "content": empty_layers,
            "expected_library_revision": 0,
        }
    )
    library_create = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_CREATE,
            "name": "Empty advanced draft",
            "content": empty_layers,
            "updated_at": "2026-08-12T00:00:00Z",
        }
    )
    draft_create = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Valid advanced",
            "content": valid_advanced,
            "expected_library_revision": 0,
        }
    )
    valid_library = await client.receive_json()
    item_id = valid_library["result"]["item"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": item_id,
            "name": "Invalid update",
            "content": empty_layers,
            "expected_revision": 1,
            "expected_library_revision": 1,
        }
    )
    library_update = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_CREATE,
            "name": "Valid advanced draft",
            "content": valid_advanced,
            "updated_at": "2026-08-12T00:01:00Z",
        }
    )
    valid_draft = await client.receive_json()
    draft_id = valid_draft["result"]["draft"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_UPDATE,
            "draft_id": draft_id,
            "expected_revision": 1,
            "name": "Invalid draft update",
            "content": empty_layers,
            "updated_at": "2026-08-12T00:02:00Z",
        }
    )
    draft_update = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Empty pattern",
            "content": empty_patterns,
            "expected_library_revision": 1,
        }
    )
    pattern_create = await client.receive_json()

    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=SimpleNamespace(),
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == "entry-a" else None,
    )
    await client.send_json_auto_id(
        {
            "type": WS_APPLY_SNAPSHOT,
            "config_entry_id": "entry-a",
            "name": "Empty advanced snapshot",
            "content": empty_layers,
            "updated_at": "2026-08-12T00:03:00Z",
        }
    )
    snapshot_apply = await client.receive_json()

    for response in (
        library_create,
        draft_create,
        library_update,
        draft_update,
        snapshot_apply,
    ):
        assert response["error"]["code"] == "invalid_format"
        assert "at least one layer" in response["error"]["message"]
    assert pattern_create["error"]["code"] == "invalid_format"
    assert "at least one brightness pattern" in pattern_create["error"]["message"]


async def test_empty_layered_scene_import_mutations_are_accepted(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    content = _layered_scene_content()
    content["effect"] = {"layers": []}

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Empty imported scene",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    library_created = await client.receive_json()
    item_id = library_created["result"]["item"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": item_id,
            "name": "Empty imported scene",
            "content": content,
            "expected_revision": 1,
            "expected_library_revision": 1,
        }
    )
    library_updated = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_CREATE,
            "name": "Empty imported scene draft",
            "content": content,
            "updated_at": "2026-08-12T00:00:00Z",
        }
    )
    draft_created = await client.receive_json()
    draft_id = draft_created["result"]["draft"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_UPDATE,
            "draft_id": draft_id,
            "expected_revision": 1,
            "name": "Empty imported scene draft",
            "content": content,
            "updated_at": "2026-08-12T00:01:00Z",
        }
    )
    draft_updated = await client.receive_json()

    assert library_created["success"] is True
    assert library_updated["success"] is True
    assert draft_created["success"] is True
    assert draft_updated["success"] is True
    assert library_updated["result"]["item"]["content"] == content
    assert draft_updated["result"]["draft"]["item"]["content"] == content


@pytest.mark.parametrize("content", _saved_profile_contents())
async def test_saved_profile_content_round_trips_through_websocket_mutations(
    hass: HomeAssistant,
    hass_ws_client,
    content: dict[str, Any],
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Saved profile",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    library_created = await client.receive_json()
    item_id = library_created["result"]["item"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_GET,
            "item_id": item_id,
        }
    )
    library_fetched = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": item_id,
            "name": "Saved profile updated",
            "content": content,
            "expected_revision": 1,
            "expected_library_revision": 1,
        }
    )
    library_updated = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_CREATE,
            "name": "Saved profile draft",
            "content": content,
            "updated_at": "2026-08-12T00:00:00Z",
        }
    )
    draft_created = await client.receive_json()
    draft_id = draft_created["result"]["draft"]["id"]

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_GET,
            "draft_id": draft_id,
        }
    )
    draft_fetched = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_UPDATE,
            "draft_id": draft_id,
            "expected_revision": 1,
            "name": "Saved profile draft updated",
            "content": content,
            "updated_at": "2026-08-12T00:01:00Z",
        }
    )
    draft_updated = await client.receive_json()

    assert library_created["success"] is True
    assert library_fetched["result"]["item"]["content"] == content
    assert library_updated["success"] is True
    assert library_updated["result"]["item"]["content"] == content
    assert draft_created["success"] is True
    assert draft_fetched["result"]["draft"]["item"]["content"] == content
    assert draft_updated["success"] is True
    assert draft_updated["result"]["draft"]["item"]["content"] == content


@pytest.mark.parametrize(
    ("content", "message"),
    [
        (
            {
                "kind": "music_profile",
                "model": "H6199",
                "mode": "rolling",
                "sensitivity": 50,
                "colour": None,
                "calm": None,
                "parameters": [],
            },
            "parameters must be a mapping",
        ),
        (
            {
                "kind": "video_profile",
                "model": "H6199",
                "mode": "movie",
                "full_screen": True,
                "saturation": 50,
                "sound_effects": True,
                "sound_effects_softness": 50,
                "white_balance_position": 10,
                "relative_brightness": {
                    "left": 0,
                    "top": 50,
                    "right": 50,
                    "bottom": 50,
                },
                "blank_screen": False,
            },
            "left must be an integer from 1 to 100",
        ),
    ],
)
async def test_saved_profile_content_websocket_validation_errors(
    hass: HomeAssistant,
    hass_ws_client,
    content: dict[str, Any],
    message: str,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Invalid profile",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "invalid_format"
    assert message in response["error"]["message"]


async def test_device_capabilities_and_apply(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    client = await hass_ws_client(hass)
    coordinator = SimpleNamespace(
        model="H617A",
        profile=SimpleNamespace(segment_count=15),
    )
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
        title="Cupboard",
    )
    item = LibraryItem.new(
        "Paint",
        PaintedEffect("clockwise", 50, 100, (0, 0, 0)),
    )
    await backend.library.async_create(item, expected_library_revision=0)
    deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=DeploymentPhase.CONFIRMED,
        compiler_version=1,
        artifact_sha256=sha256(b"artifact").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        item_id=item.id,
        item_revision=1,
    )
    apply_mock = AsyncMock(return_value=deployment)
    monkeypatch.setattr(backend.engine, "async_apply_saved", apply_mock)

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_entries",
            lambda domain=None: [entry],
        )
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: entry if entry_id == "entry-a" else None,
        )

        await client.send_json_auto_id({"type": WS_DEVICES})
        devices = await client.receive_json()
        assert devices["result"]["devices"][0]["model"] == "H617A"

        await client.send_json_auto_id(
            {
                "type": WS_APPLY,
                "config_entry_id": "entry-a",
                "item_id": str(item.id),
                "updated_at": "2026-08-11T00:00:00Z",
            }
        )
        applied = await client.receive_json()

        await client.send_json_auto_id(
            {
                "type": WS_APPLY,
                "config_entry_id": "entry-a",
                "item_id": str(uuid4()),
                "updated_at": "2026-08-11T00:00:00Z",
            }
        )
        missing = await client.receive_json()

        await client.send_json_auto_id(
            {
                "type": WS_APPLY,
                "config_entry_id": "entry-a",
                "item_id": "not-a-uuid",
                "updated_at": "2026-08-11T00:00:00Z",
            }
        )
        malformed = await client.receive_json()

        apply_mock.side_effect = ValueError("H6199 custom-effect upload is not supported")
        await client.send_json_auto_id(
            {
                "type": WS_APPLY,
                "config_entry_id": "entry-a",
                "item_id": str(item.id),
                "updated_at": "2026-08-11T00:00:00Z",
            }
        )
        unsupported = await client.receive_json()

    assert applied["success"] is True
    assert applied["result"]["deployment"]["phase"] == "confirmed"
    assert missing["error"]["code"] == "not_found"
    assert malformed["error"]["code"] == "invalid_format"
    assert unsupported["error"]["code"] == "unsupported_model"
    assert apply_mock.await_count == 2


async def test_h6199_palette_diy_saved_and_snapshot_apply_cover_every_visible_option(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    client = await hass_ws_client(hass)
    coordinator = SimpleNamespace(
        model="H6199",
        profile=SimpleNamespace(segment_count=15),
    )
    entry = SimpleNamespace(
        entry_id="entry-h6199",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
        title="DreamView",
    )
    items = [
        LibraryItem.new(
            effect.label,
            PaletteDiyEffect(
                "H6199",
                effect.family,
                effect.variant,
                50,
                ((255, 0, 0), (0, 0, 255)),
            ),
        )
        for effect in H6199_DIY_EFFECTS
    ]
    revision = 0
    for item in items:
        revision += 1
        await backend.library.async_create(item, expected_library_revision=revision - 1)

    async def apply_saved(_coordinator, item, **kwargs):
        return DeploymentRecord(
            operation_id=uuid4(),
            config_entry_id=kwargs["config_entry_id"],
            diy_code=401,
            phase=DeploymentPhase.UNCERTAIN,
            compiler_version=2,
            artifact_sha256=sha256(item.name.encode()).hexdigest(),
            updated_at=kwargs["updated_at"],
            item_id=item.id,
            item_revision=item.revision,
            error_code="activation_readback_unproven",
            progress_current=3,
            progress_total=3,
            verification_confidence=ObservationConfidence.UNKNOWN,
        )

    async def apply_snapshot(_coordinator, item, **kwargs):
        return DeploymentRecord(
            operation_id=uuid4(),
            config_entry_id=kwargs["config_entry_id"],
            diy_code=401,
            phase=DeploymentPhase.UNCERTAIN,
            compiler_version=2,
            artifact_sha256=sha256(item.name.encode()).hexdigest(),
            updated_at=kwargs["updated_at"],
            snapshot_id=kwargs["snapshot_id"],
            snapshot=item,
            error_code="activation_readback_unproven",
            progress_current=3,
            progress_total=3,
            verification_confidence=ObservationConfidence.UNKNOWN,
        )

    saved_mock = AsyncMock(side_effect=apply_saved)
    snapshot_mock = AsyncMock(side_effect=apply_snapshot)
    monkeypatch.setattr(backend.engine, "async_apply_saved", saved_mock)
    monkeypatch.setattr(backend.engine, "async_apply_snapshot", snapshot_mock)

    with monkeypatch.context() as context:
        context.setattr(hass.config_entries, "async_entries", lambda domain=None: [entry])
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: entry if entry_id == entry.entry_id else None,
        )
        await client.send_json_auto_id({"type": WS_DEVICES})
        devices = await client.receive_json()
        assert devices["result"]["devices"][0]["custom_effects"]["palette_diy"] == "supported"

        for item in items:
            await client.send_json_auto_id(
                {
                    "type": WS_APPLY,
                    "config_entry_id": entry.entry_id,
                    "item_id": str(item.id),
                    "revision": item.revision,
                    "updated_at": "2026-08-14T00:00:00Z",
                }
            )
            saved = await client.receive_json()
            assert saved["success"] is True
            assert saved["result"]["deployment"]["phase"] == "uncertain"
            assert saved["result"]["deployment"]["verification_confidence"] == "unknown"

            await client.send_json_auto_id(
                {
                    "type": WS_APPLY_SNAPSHOT,
                    "config_entry_id": entry.entry_id,
                    "name": item.name,
                    "content": effect_content_to_dict(item.content),
                    "updated_at": "2026-08-14T00:00:00Z",
                }
            )
            snapshot = await client.receive_json()
            assert snapshot["success"] is True
            assert snapshot["result"]["deployment"]["phase"] == "uncertain"

    assert saved_mock.await_count == len(H6199_DIY_EFFECTS)
    assert snapshot_mock.await_count == len(H6199_DIY_EFFECTS)


async def test_profile_websocket_routes_apply_saved_and_snapshot_content(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    client = await hass_ws_client(hass)
    coordinator = SimpleNamespace(
        model="H6199",
        profile=SimpleNamespace(segment_count=0),
    )
    entry = SimpleNamespace(
        entry_id="entry-video",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
        title="Television",
    )
    music = LibraryItem.new(
        "Rolling",
        MusicProfile("H6199", "rolling", 75, None, None, {}),
    )
    await backend.library.async_create(music, expected_library_revision=0)
    saved_deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id=entry.entry_id,
        diy_code=None,
        content_kind="music_profile",
        phase=DeploymentPhase.CONFIRMED,
        compiler_version=1,
        artifact_sha256=sha256(b"music").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        item_id=music.id,
        item_revision=music.revision,
    )
    snapshot_deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id=entry.entry_id,
        diy_code=None,
        content_kind="video_profile",
        phase=DeploymentPhase.CONFIRMED,
        compiler_version=1,
        artifact_sha256=sha256(b"video").hexdigest(),
        updated_at="2026-08-11T00:01:00Z",
        snapshot_id=uuid4(),
        snapshot=LibraryItem.new(
            "Movie",
            VideoProfile(
                "H6199",
                "movie",
                True,
                70,
                True,
                40,
                12,
                RelativeBrightness(80, 60, 55, 45),
                False,
            ),
        ),
    )
    saved_mock = AsyncMock(return_value=saved_deployment)
    snapshot_mock = AsyncMock(return_value=snapshot_deployment)
    monkeypatch.setattr(backend.engine, "async_apply_saved", saved_mock)
    monkeypatch.setattr(backend.engine, "async_apply_snapshot", snapshot_mock)
    assert snapshot_deployment.snapshot is not None
    expected_snapshot_content = snapshot_deployment.snapshot.content
    snapshot_content = effect_content_to_dict(expected_snapshot_content)

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_entries",
            lambda domain=None: [entry],
        )
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: entry if entry_id == entry.entry_id else None,
        )

        await client.send_json_auto_id({"type": WS_DEVICES})
        devices = await client.receive_json()
        await client.send_json_auto_id(
            {
                "type": WS_APPLY,
                "config_entry_id": entry.entry_id,
                "item_id": str(music.id),
                "updated_at": "2026-08-11T00:00:00Z",
            }
        )
        saved = await client.receive_json()
        await client.send_json_auto_id(
            {
                "type": WS_APPLY_SNAPSHOT,
                "config_entry_id": entry.entry_id,
                "name": "Movie",
                "content": snapshot_content,
                "updated_at": "2026-08-11T00:01:00Z",
            }
        )
        snapshot = await client.receive_json()
        snapshot_mock.side_effect = RuntimeError("video write failed")
        await client.send_json_auto_id(
            {
                "type": WS_APPLY_SNAPSHOT,
                "config_entry_id": entry.entry_id,
                "name": "Movie",
                "content": snapshot_content,
                "updated_at": "2026-08-11T00:02:00Z",
            }
        )
        failed_snapshot = await client.receive_json()

    assert devices["result"]["devices"][0]["profiles"] == {
        "music": "supported",
        "video": "supported",
    }
    assert saved["result"]["deployment"]["content_kind"] == "music_profile"
    assert saved["result"]["deployment"]["diy_code"] is None
    assert snapshot["result"]["deployment"]["content_kind"] == "video_profile"
    assert snapshot["result"]["deployment"]["diy_code"] is None
    assert failed_snapshot["error"]["code"] == "apply_failed"
    assert saved_mock.await_args is not None
    assert snapshot_mock.await_args is not None
    assert saved_mock.await_args.args[1] == music
    assert snapshot_mock.await_args.args[1].content == expected_snapshot_content


async def test_scene_catalogue_and_native_apply(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    scene = next(
        entry for entry in SCENE_ENTRIES["H617A"] if entry.scene_type == 2 and entry.param and entry.speed is not None
    )
    coordinator = SimpleNamespace(
        model="H617A",
        profile=SimpleNamespace(segment_count=15),
        effect_families={EFFECT_FAMILY_SCENES},
        async_set_scene_speed=AsyncMock(),
    )
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
        title="Cupboard",
    )
    registry_entry = SimpleNamespace(
        entity_id="light.cupboard",
        platform="ha_govee_led_ble",
        disabled_by=None,
    )
    service_calls = []

    async def service_call(
        registry,
        domain,
        service,
        service_data,
        *,
        blocking,
        context,
        return_response=False,
    ) -> None:
        service_calls.append((domain, service, service_data, blocking, context, return_response))

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: entry if entry_id == "entry-a" else None,
        )
        context.setattr(
            "custom_components.ha_govee_led_ble.effect_scenes.er.async_entries_for_config_entry",
            lambda registry, config_entry_id: [registry_entry],
        )
        context.setattr(type(hass.services), "async_call", service_call)

        await client.send_json_auto_id(
            {
                "type": WS_SCENE_CATALOGUE_LIST,
                "config_entry_id": "entry-a",
            }
        )
        listed = await client.receive_json()
        assert listed["success"] is True
        assert listed["result"]["catalogue"]["sku"] == "H617A"
        assert listed["result"]["catalogue"]["enabled"] is True

        await client.send_json_auto_id(
            {
                "type": WS_SCENE_CATALOGUE_GET,
                "config_entry_id": "entry-a",
                "scene_id": scene.scene_id,
                "effect_id": scene.effect_id,
            }
        )
        fetched = await client.receive_json()
        assert fetched["result"]["content"]["kind"] == "scene_layered"

        await client.send_json_auto_id(
            {
                "type": WS_LIBRARY_CREATE,
                "name": "Saved scene",
                "content": fetched["result"]["content"],
                "expected_library_revision": 0,
            }
        )
        saved = await client.receive_json()
        assert saved["success"] is True

        await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
        scene_library = await client.receive_json()
        assert scene_library["result"]["items"][0]["template"]["sku"] == "H617A"
        assert scene_library["result"]["items"][0]["model"] == "H617A"

        assert scene.speed is not None
        await client.send_json_auto_id(
            {
                "type": WS_SCENE_APPLY,
                "config_entry_id": "entry-a",
                "scene_id": scene.scene_id,
                "effect_id": scene.effect_id,
                "speed_index": scene.speed.default_index,
            }
        )
        applied = await client.receive_json()

        coordinator.effect_families = set()
        await client.send_json_auto_id(
            {
                "type": WS_SCENE_APPLY,
                "config_entry_id": "entry-a",
                "scene_id": scene.scene_id,
                "effect_id": scene.effect_id,
            }
        )
        disabled = await client.receive_json()

    assert applied["success"] is True
    assert applied["result"]["readback"] == "scene_identity_only"
    assert disabled["error"]["code"] == "scene_unavailable"
    assert len(service_calls) == 1
    assert service_calls[0][0:2] == ("light", "turn_on")
    assert service_calls[0][2]["entity_id"] == "light.cupboard"
    coordinator.async_set_scene_speed.assert_awaited_once_with(scene.speed.default_index)


async def test_scene_apply_runtime_failure_returns_apply_failed(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=SimpleNamespace(model="H617A"),
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == "entry-a" else None,
    )
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.effect_websocket.async_apply_scene",
        AsyncMock(side_effect=RuntimeError("scene speed was not confirmed")),
    )

    await client.send_json_auto_id(
        {
            "type": WS_SCENE_APPLY,
            "config_entry_id": "entry-a",
            "scene_id": 1,
            "effect_id": 2,
        }
    )
    response = await client.receive_json()

    assert response["error"]["code"] == "apply_failed"
    assert response["error"]["message"] == "scene speed was not confirmed"


async def test_layered_scene_get_round_trips_through_draft_and_library(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    scene = next(
        entry
        for entry in SCENE_ENTRIES["H617A"]
        if entry.scene_type == 2 and entry.param and entry.speed is not None and entry.speed.option_count > 1
    )
    coordinator = SimpleNamespace(model="H617A")
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == "entry-a" else None,
    )

    await client.send_json_auto_id(
        {
            "type": WS_SCENE_CATALOGUE_GET,
            "config_entry_id": "entry-a",
            "scene_id": scene.scene_id,
            "effect_id": scene.effect_id,
        }
    )
    fetched = await client.receive_json()
    assert fetched["success"] is True
    source = fetched["result"]["content"]
    assert source["kind"] == "scene_layered"
    assert source["raw_param"] == base64.b64decode(scene.param, validate=True).hex()
    assert source["effect"]["layers"]

    assert scene.speed is not None
    selected_speed = (scene.speed.default_index + 1) % scene.speed.option_count
    content = {**source, "speed_index": selected_speed}

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_CREATE,
            "name": "Layered scene draft",
            "content": content,
            "updated_at": "2026-08-12T00:00:00Z",
            "selected_config_entry_id": "entry-a",
        }
    )
    draft_created = await client.receive_json()
    assert draft_created["success"] is True
    draft_id = draft_created["result"]["draft"]["id"]
    assert draft_created["result"]["draft"]["item"]["content"] == content

    await client.send_json_auto_id({"type": WS_DRAFT_GET, "draft_id": draft_id})
    draft_fetched = await client.receive_json()
    assert draft_fetched["result"]["draft"]["item"]["content"] == content

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Layered scene template",
            "content": content,
            "expected_library_revision": 0,
        }
    )
    library_created = await client.receive_json()
    assert library_created["success"] is True
    item_id = library_created["result"]["item"]["id"]
    assert library_created["result"]["item"]["content"] == content

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_GET,
            "item_id": item_id,
        }
    )
    library_fetched = await client.receive_json()
    assert library_fetched["result"]["item"]["content"] == content


async def test_scene_websocket_errors_have_stable_codes(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_SCENE_CATALOGUE_LIST,
            "config_entry_id": "missing",
        }
    )
    missing_list = await client.receive_json()
    assert missing_list["error"]["code"] == "not_found"

    await client.send_json_auto_id(
        {
            "type": WS_SCENE_CATALOGUE_GET,
            "config_entry_id": "missing",
            "scene_id": 0,
            "effect_id": 0,
        }
    )
    missing_get = await client.receive_json()
    assert missing_get["error"]["code"] == "not_found"

    await client.send_json_auto_id(
        {
            "type": WS_SCENE_APPLY,
            "config_entry_id": "missing",
            "scene_id": 0,
            "effect_id": 0,
        }
    )
    missing_apply = await client.receive_json()
    assert missing_apply["error"]["code"] == "not_found"

    coordinator = SimpleNamespace(
        model="UNKNOWN",
        effect_families={EFFECT_FAMILY_SCENES},
    )
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == "entry-a" else None,
    )

    await client.send_json_auto_id(
        {
            "type": WS_SCENE_CATALOGUE_LIST,
            "config_entry_id": "entry-a",
        }
    )
    unknown_catalogue = await client.receive_json()
    assert unknown_catalogue["error"]["code"] == "not_found"

    coordinator.model = "H617A"
    await client.send_json_auto_id(
        {
            "type": WS_SCENE_CATALOGUE_GET,
            "config_entry_id": "entry-a",
            "scene_id": -1,
            "effect_id": -1,
        }
    )
    unknown_scene = await client.receive_json()
    assert unknown_scene["error"]["code"] == "invalid_format"

    scene = next(item for item in SCENE_ENTRIES["H617A"] if item.speed is not None)
    assert scene.speed is not None
    await client.send_json_auto_id(
        {
            "type": WS_SCENE_APPLY,
            "config_entry_id": "entry-a",
            "scene_id": scene.scene_id,
            "effect_id": scene.effect_id,
            "speed_index": scene.speed.option_count,
        }
    )
    invalid_speed = await client.receive_json()
    assert invalid_speed["error"]["code"] == "invalid_format"

    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.effect_websocket.async_apply_scene",
        AsyncMock(side_effect=HomeAssistantError("service failed")),
    )
    await client.send_json_auto_id(
        {
            "type": WS_SCENE_APPLY,
            "config_entry_id": "entry-a",
            "scene_id": scene.scene_id,
            "effect_id": scene.effect_id,
        }
    )
    failed_apply = await client.receive_json()
    assert failed_apply["error"]["code"] == "apply_failed"


async def test_unsaved_painted_effect_can_be_applied_as_snapshot(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    client = await hass_ws_client(hass)
    coordinator = SimpleNamespace(
        model="H617A",
        profile=SimpleNamespace(segment_count=15),
    )
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
        title="Cupboard",
    )
    deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=DeploymentPhase.CONFIRMED,
        compiler_version=1,
        artifact_sha256=sha256(b"snapshot").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        snapshot_id=uuid4(),
        snapshot=LibraryItem.new(
            "Unsaved paint",
            PaintedEffect("clockwise", 50, 100, (0, 0, 0)),
        ),
    )
    apply_mock = AsyncMock(return_value=deployment)
    monkeypatch.setattr(backend.engine, "async_apply_snapshot", apply_mock)

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: entry if entry_id == "entry-a" else None,
        )
        await client.send_json_auto_id(
            {
                "type": WS_APPLY_SNAPSHOT,
                "config_entry_id": "entry-a",
                "name": "Unsaved paint",
                "content": effect_content_to_dict(PaintedEffect("clockwise", 50, 100, (0, 0, 0))),
                "updated_at": "2026-08-11T00:00:00Z",
            }
        )
        applied = await client.receive_json()

    assert applied["success"] is True
    assert "snapshot" not in applied["result"]["deployment"]
    assert "snapshot_id" not in applied["result"]["deployment"]
    assert "artifact_sha256" not in applied["result"]["deployment"]
    assert "compiler_version" not in applied["result"]["deployment"]
    apply_mock.assert_awaited_once()


async def test_unsaved_layered_scene_api_compiles_and_sends_authored_packets(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    client = await hass_ws_client(hass)
    content = _layered_scene_content()
    expected = compile_effect(
        LibraryItem.new("Unsaved layered scene", effect_content_from_dict(content)),
        "H617A",
    )
    coordinator = SimpleNamespace(
        _control_lock=asyncio.Lock(),
        address="AA:BB:CC:DD:EE:FF",
        model="H617A",
        profile=SimpleNamespace(state_readable=True),
        is_on=True,
        brightness_pct=72,
        rgb_color=(1, 2, 3),
        color_temp_kelvin=None,
        effect=None,
        diy_code=None,
        music_mode="off",
        video_mode="off",
        music_sensitivity=50,
        music_calm=False,
        music_color=None,
        send_command=AsyncMock(),
        refresh_state=AsyncMock(),
    )

    async def refresh() -> bool:
        if coordinator.refresh_state.await_count >= 2:
            coordinator.effect = expected.expected_effect
        return True

    coordinator.refresh_state.side_effect = refresh
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain="ha_govee_led_ble",
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == "entry-a" else None,
    )

    await client.send_json_auto_id(
        {
            "type": WS_APPLY_SNAPSHOT,
            "config_entry_id": "entry-a",
            "name": "Unsaved layered scene",
            "content": content,
            "updated_at": "2026-08-11T00:00:00Z",
        }
    )
    applied = await client.receive_json()

    assert applied["success"] is True
    assert applied["result"]["deployment"]["target_mode"] == "scene"
    assert applied["result"]["deployment"]["verification_confidence"] == "activation_match"
    assert coordinator.send_command.await_args_list == [call(packet) for packet in expected.packets]
    assert backend.deployments.snapshot().records[0].snapshot is not None
    assert {
        event["code"]
        for event in backend.diagnostics.snapshot(config_entry_id="entry-a")["events"]
        if event["stage"] == "evidence_gap"
    } == {
        "scene_payload_readback_unavailable",
        "layered_field_semantics_uncalibrated",
    }


async def test_admin_draft_lifecycle(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)
    content = effect_content_to_dict(SingleEffect(0, 0, 50, ((255, 0, 0),)))

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_CREATE,
            "name": "Draft",
            "content": content,
            "updated_at": "2026-08-11T00:00:00Z",
            "selected_config_entry_id": "entry-a",
        }
    )
    created = await client.receive_json()
    draft_id = created["result"]["draft"]["id"]
    assert created["success"] is True

    await client.send_json_auto_id({"type": WS_DRAFT_LIST})
    listed = await client.receive_json()
    assert listed["result"]["drafts"][0]["name"] == "Draft"

    await client.send_json_auto_id({"type": WS_DRAFT_GET, "draft_id": draft_id})
    fetched = await client.receive_json()
    assert fetched["result"]["draft"]["revision"] == 1

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_UPDATE,
            "draft_id": draft_id,
            "expected_revision": 1,
            "name": "Updated",
            "content": content,
            "updated_at": "2026-08-11T00:01:00Z",
        }
    )
    updated = await client.receive_json()
    assert updated["result"]["draft"]["revision"] == 2

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_UPDATE,
            "draft_id": draft_id,
            "expected_revision": 1,
            "name": "Stale",
            "content": content,
            "updated_at": "2026-08-11T00:02:00Z",
        }
    )
    conflict = await client.receive_json()
    assert conflict["error"]["code"] == "conflict"

    await client.send_json_auto_id(
        {
            "type": WS_DRAFT_DELETE,
            "draft_id": draft_id,
            "expected_revision": 2,
        }
    )
    deleted = await client.receive_json()
    assert deleted["success"] is True

    await client.send_json_auto_id({"type": WS_DRAFT_GET, "draft_id": draft_id})
    missing = await client.receive_json()
    assert missing["error"]["code"] == "not_found"


async def test_library_subscription_remains_available_to_non_admin(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    backend = await _setup_backend(hass)
    client = await hass_ws_client(
        hass,
        access_token=hass_read_only_access_token,
    )

    await client.send_json_auto_id({"type": WS_LIBRARY_SUBSCRIBE})
    library_result = await client.receive_json()
    assert library_result["success"] is True
    initial_library = await client.receive_json()
    assert initial_library["id"] == library_result["id"]
    assert initial_library["event"]["library_revision"] == 0

    item = LibraryItem.new("Test", SingleEffect(0, 0, 50, ((255, 0, 0),)))
    await backend.library.async_create(item, expected_library_revision=0)
    library_event = await client.receive_json()
    assert library_event["event"]["library_revision"] == 1


async def test_non_admin_deployment_subscription_is_rejected(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    backend = await _setup_backend(hass)
    snapshot = LibraryItem.new(
        "Private unsaved effect",
        SingleEffect(0, 0, 50, ((255, 0, 0),)),
    )
    deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=DeploymentPhase.PENDING,
        compiler_version=1,
        artifact_sha256=sha256(b"private artifact").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        snapshot_id=uuid4(),
        snapshot=snapshot,
    )
    await backend.deployments.async_put(deployment, expected_revision=0)
    client = await hass_ws_client(
        hass,
        access_token=hass_read_only_access_token,
    )

    await client.send_json_auto_id({"type": WS_DEPLOYMENT_SUBSCRIBE})
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "unauthorized"

    await backend.deployments.async_put(deployment, expected_revision=1)
    with pytest.raises(TimeoutError):
        await client.receive_json(timeout=0.05)


async def test_admin_deployment_subscription_receives_initial_and_live_snapshots(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    backend = await _setup_backend(hass)
    initial_snapshot = LibraryItem.new(
        "Initial unsaved effect",
        SingleEffect(0, 0, 50, ((255, 0, 0),)),
    )
    initial_deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=DeploymentPhase.PENDING,
        compiler_version=1,
        artifact_sha256=sha256(b"initial artifact").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        snapshot_id=uuid4(),
        snapshot=initial_snapshot,
    )
    await backend.deployments.async_put(initial_deployment, expected_revision=0)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": WS_DEPLOYMENT_SUBSCRIBE})
    deployment_result = await client.receive_json()
    assert deployment_result["success"] is True
    initial_event = await client.receive_json()
    assert initial_event["id"] == deployment_result["id"]
    assert initial_event["event"]["revision"] == 1
    assert "snapshot" not in initial_event["event"]["deployments"][0]

    live_snapshot = LibraryItem.new(
        "Live unsaved effect",
        SingleEffect(0, 0, 50, ((0, 255, 0),)),
    )
    live_deployment = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=801,
        phase=DeploymentPhase.UPLOADING,
        compiler_version=1,
        artifact_sha256=sha256(b"live artifact").hexdigest(),
        updated_at="2026-08-11T00:01:00Z",
        snapshot_id=uuid4(),
        snapshot=live_snapshot,
    )
    await backend.deployments.async_put(live_deployment, expected_revision=1)
    deployment_event = await client.receive_json()
    assert deployment_event["event"]["revision"] == 2
    live_records = {record["operation_id"]: record for record in deployment_event["event"]["deployments"]}
    assert live_records[str(live_deployment.operation_id)]["phase"] == "uploading"
    assert "snapshot" not in live_records[str(live_deployment.operation_id)]


async def test_admin_user_state_lifecycle(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": WS_USER_STATE_GET})
    initial = await client.receive_json()
    assert initial["result"]["user_state"]["recent_colours"] == []

    await client.send_json_auto_id(
        {
            "type": WS_USER_STATE_UPDATE,
            "preferences": {"pane": "scenes"},
        }
    )
    updated = await client.receive_json()
    assert updated["result"]["user_state"]["preferences"]["pane"] == "scenes"

    await client.send_json_auto_id(
        {
            "type": WS_USER_STATE_RECORD_COLOUR,
            "colour": [255, 0, 0],
        }
    )
    colour = await client.receive_json()
    assert colour["result"]["user_state"]["recent_colours"] == [[255, 0, 0]]

    await client.send_json_auto_id(
        {
            "type": WS_USER_STATE_RECORD_COLOUR,
            "colour": [1, 2],
        }
    )
    invalid = await client.receive_json()
    assert invalid["error"]["code"] == "invalid_format"
