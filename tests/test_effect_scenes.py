"""Native scene editor contracts."""

import base64
import binascii
from dataclasses import replace
from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant

from custom_components.ha_govee_led_ble import scene_preview_profiles as runtime_profiles
from custom_components.ha_govee_led_ble.const import EFFECT_FAMILY_SCENES
from custom_components.ha_govee_led_ble.effect_scenes import (
    SceneUnavailableError,
    _light_entity_id,
    async_apply_scene,
    resolve_scene,
    scene_catalogue_payload,
    scene_detail_payload,
)
from custom_components.ha_govee_led_ble.scene_preview_profiles import (
    PreviewProfileValidationError,
    warm_preview_profile_index,
)
from custom_components.ha_govee_led_ble.scenes import (
    MODEL_SCENES,
    SCENE_ENTRIES,
)

REVIEWED_PREVIEW_IDENTITIES = {
    ("H617A", 1011, 1073): "static",
    ("H617A", 1012, 1074): "static",
    ("H617A", 1051, 1113): "static",
    ("H617A", 1068, 1130): "directional_sweep",
    ("H617A", 8860, 13920): "static",
}


def test_catalogue_and_identity_errors() -> None:
    with pytest.raises(ValueError, match="no native scene catalogue"):
        scene_catalogue_payload("UNKNOWN", enabled=False)

    with pytest.raises(ValueError, match="no native scene catalogue"):
        resolve_scene("UNKNOWN", 0, 0)

    with pytest.raises(ValueError, match="was not found"):
        resolve_scene("H617A", -1, -1)


def test_layered_scene_detail_decodes_strict_base64_template(monkeypatch) -> None:
    key, entry = next(
        (key, entry) for key, entry in MODEL_SCENES["H617A"].items() if entry.scene_type == 2 and entry.param
    )

    detail = scene_detail_payload("H617A", entry.scene_id, entry.effect_id)
    content = cast(dict[str, Any], detail["content"])

    assert content["kind"] == "scene_layered"
    assert content["template"] == {
        "sku": "H617A",
        "scene_id": entry.scene_id,
        "effect_id": entry.effect_id,
        "catalogue_schema_version": 1,
    }
    assert content["raw_param"] == base64.b64decode(entry.param, validate=True).hex()
    assert content["speed_index"] == (entry.speed.default_index if entry.speed is not None else None)
    assert content["effect"]["layers"]

    monkeypatch.setitem(
        MODEL_SCENES["H617A"],
        key,
        replace(entry, param=f"{entry.param}\n"),
    )
    with pytest.raises(binascii.Error):
        scene_detail_payload("H617A", entry.scene_id, entry.effect_id)


def test_palette_scene_detail_decodes_template() -> None:
    entry = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.scene_type == 1 and scene.param)

    detail = scene_detail_payload("H617A", entry.scene_id, entry.effect_id)
    content = cast(dict[str, Any], detail["content"])

    assert content["kind"] == "scene_palette"
    assert content["template"] == {
        "sku": "H617A",
        "scene_id": entry.scene_id,
        "effect_id": entry.effect_id,
        "catalogue_schema_version": 1,
    }
    assert content["layout"] == 0
    assert content["brightness_flag"] is True
    assert content["steps"]
    assert content["palette"]
    assert content["speed_index"] is None


def test_type_0_scene_detail_remains_builtin() -> None:
    entry = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.scene_type == 0)

    detail = scene_detail_payload("H617A", entry.scene_id, entry.effect_id)
    content = cast(dict[str, Any], detail["content"])

    assert content["kind"] == "scene_builtin"


def test_scene_detail_optionally_exposes_only_reviewed_capture_profiles() -> None:
    warm_preview_profile_index()
    exposed: dict[tuple[str, int, int], dict[str, Any]] = {}
    for entry in SCENE_ENTRIES["H617A"]:
        detail = scene_detail_payload("H617A", entry.scene_id, entry.effect_id)
        profile = detail.get("preview_profile")
        if profile is not None:
            exposed[("H617A", entry.scene_id, entry.effect_id)] = cast(dict[str, Any], profile)

    assert {identity: profile["primitive"] for identity, profile in exposed.items()} == REVIEWED_PREVIEW_IDENTITIES
    for identity, exposed_profile in exposed.items():
        profile = cast(Any, exposed_profile)
        assert profile["fidelity"] == "capture_backed"
        assert profile["review_state"] == "reviewed"
        assert profile["review_confidence"] >= profile["minimum_review_confidence"]
        assert "name" not in profile
        assert profile["sku"] == identity[0]
        assert profile["scene_id"] == identity[1]
        assert profile["effect_id"] == identity[2]
        if profile["primitive"] == "static":
            assert len(profile["palette"]["segment_rgb"]) == 15
        else:
            assert profile["direction"] == "towards_first_segment"
            assert profile["period_seconds"] == 3.953

    pending = scene_detail_payload("H617A", 1013, 11836)
    assert "preview_profile" not in pending
    assert cast(dict[str, Any], pending["content"])["kind"] == "scene_layered"


def test_reviewed_sweep_detail_keeps_real_layered_content_and_speed() -> None:
    warm_preview_profile_index()
    detail = scene_detail_payload("H617A", 1068, 1130)
    content = cast(dict[str, Any], detail["content"])
    profile = cast(dict[str, Any], detail["preview_profile"])

    assert cast(dict[str, Any], detail["scene"])["speed"] == {"option_count": 3, "default_index": 2}
    assert content["kind"] == "scene_layered"
    assert content["speed_index"] == 2
    assert content["effect"]["layers"]
    assert profile["primitive"] == "directional_sweep"
    assert "period holds for that setting only" in profile["limitations"][0]


def test_unavailable_optional_preview_asset_keeps_scene_detail_usable(monkeypatch) -> None:
    runtime_profiles._reset_preview_profile_cache()

    def fail_load() -> tuple[dict[str, Any], ...]:
        raise PreviewProfileValidationError("missing profile asset")

    monkeypatch.setattr(runtime_profiles, "load_preview_profiles", fail_load)
    warm_preview_profile_index()

    detail = scene_detail_payload("H617A", 1068, 1130)

    assert "preview_profile" not in detail
    assert cast(dict[str, Any], detail["content"])["kind"] == "scene_layered"
    assert cast(dict[str, Any], detail["scene"])["speed"] == {"option_count": 3, "default_index": 2}
    runtime_profiles._reset_preview_profile_cache()


async def test_scene_speed_request_is_validated_before_service_call(
    hass: HomeAssistant,
) -> None:
    no_speed = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.speed is None)
    with_speed = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.speed is not None)
    coordinator = SimpleNamespace(
        model="H617A",
        effect_families={EFFECT_FAMILY_SCENES},
    )
    entry = SimpleNamespace(entry_id="entry-a", runtime_data=coordinator)

    with pytest.raises(ValueError, match="does not expose"):
        await async_apply_scene(
            hass,
            entry,
            scene_id=no_speed.scene_id,
            effect_id=no_speed.effect_id,
            speed_index=0,
            user_id="admin",
        )

    assert with_speed.speed is not None
    with pytest.raises(ValueError, match="outside"):
        await async_apply_scene(
            hass,
            entry,
            scene_id=with_speed.scene_id,
            effect_id=with_speed.effect_id,
            speed_index=with_speed.speed.option_count,
            user_id="admin",
        )


async def test_scene_without_speed_uses_native_light_only(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    scene = next(item for item in SCENE_ENTRIES["H617A"] if item.speed is None)
    coordinator = SimpleNamespace(
        model="H617A",
        effect_families={EFFECT_FAMILY_SCENES},
        async_set_scene_speed=AsyncMock(),
    )
    entry = SimpleNamespace(entry_id="entry-a", runtime_data=coordinator)
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

    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.effect_scenes.er.async_entries_for_config_entry",
        lambda registry, config_entry_id: [registry_entry],
    )
    monkeypatch.setattr(type(hass.services), "async_call", service_call)

    resolved, speed_index = await async_apply_scene(
        hass,
        entry,
        scene_id=scene.scene_id,
        effect_id=scene.effect_id,
        speed_index=None,
        user_id="admin",
    )

    assert resolved.entry == scene
    assert speed_index is None
    assert len(service_calls) == 1
    coordinator.async_set_scene_speed.assert_not_awaited()


def test_light_entity_must_be_unique(hass: HomeAssistant, monkeypatch) -> None:
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.effect_scenes.er.async_entries_for_config_entry",
        lambda registry, config_entry_id: [],
    )

    with pytest.raises(SceneUnavailableError, match="one enabled Govee light"):
        _light_entity_id(hass, "entry-a")
