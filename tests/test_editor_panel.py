"""Advanced editor adaptation of the stable mainline route contract."""

from __future__ import annotations

import json

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import UnsupportedStorageVersionError
from homeassistant.setup import async_setup_component

from custom_components.ha_govee_led_ble import async_setup
from custom_components.ha_govee_led_ble.const import DOMAIN
from custom_components.ha_govee_led_ble.editor import (
    _EDITOR_MANIFEST,
    _EDITOR_STATIC_PATH,
    EDITOR_ELEMENT_NAME,
    EDITOR_FALLBACK_MODULE_URL,
    EDITOR_LOADER_MODULE_URL,
    EDITOR_PANEL_PATH,
    _editor_module_url,
    editor_url,
)
from custom_components.ha_govee_led_ble.effect_contracts import (
    EDITOR_API_VERSION,
    EDITOR_ASSET_VERSION,
    EFFECT_COMPILER_VERSION,
)
from custom_components.ha_govee_led_ble.effect_domain import EFFECT_SCHEMA_VERSION
from custom_components.ha_govee_led_ble.effect_setup import get_effect_setup
from custom_components.ha_govee_led_ble.effect_storage import EffectStorageError


async def test_process_setup_registers_advanced_stable_route(
    hass: HomeAssistant,
) -> None:
    assert await async_setup_component(hass, "http", {})

    assert await async_setup(hass, {})

    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    custom = panel.config["_panel_custom"]
    assert panel.sidebar_title is None
    assert panel.require_admin is False
    assert panel.show_in_sidebar is False
    assert custom["name"] == EDITOR_ELEMENT_NAME
    assert custom["embed_iframe"] is False
    assert custom["module_url"] == _editor_module_url()
    assert get_effect_setup(hass) is not None


async def test_backend_storage_failure_keeps_stable_fallback_panel(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    assert await async_setup_component(hass, "http", {})

    async def fail(_hass):
        raise EffectStorageError("broken store")

    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.effect_setup.EffectBackend.async_create",
        fail,
    )

    assert await async_setup(hass, {})
    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    assert panel.config["_panel_custom"]["module_url"] == EDITOR_FALLBACK_MODULE_URL
    assert get_effect_setup(hass) is None


async def test_newer_optional_store_keeps_stable_fallback_panel(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    assert await async_setup_component(hass, "http", {})

    async def fail(_hass):
        raise UnsupportedStorageVersionError("effects", 2, 1)

    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.effect_setup.EffectBackend.async_create",
        fail,
    )

    assert await async_setup(hass, {})
    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    assert panel.config["_panel_custom"]["module_url"] == EDITOR_FALLBACK_MODULE_URL


def test_manifest_selects_hashed_advanced_asset() -> None:
    manifest = json.loads(_EDITOR_MANIFEST.read_text())
    filename = manifest["bootstrap"]

    assert filename.startswith("effect-studio-bootstrap.")
    assert filename.endswith(".js")
    assert manifest["asset_version"] == EDITOR_ASSET_VERSION
    assert manifest["api_version"] == EDITOR_API_VERSION
    assert manifest["effect_schema_version"] == EFFECT_SCHEMA_VERSION
    assert manifest["compiler_version"] == EFFECT_COMPILER_VERSION
    assert (_EDITOR_STATIC_PATH / filename).is_file()
    assert _editor_module_url() == EDITOR_LOADER_MODULE_URL


def test_invalid_manifest_falls_back_to_stable_editor(
    monkeypatch,
    tmp_path,
) -> None:
    invalid = tmp_path / "manifest.json"
    invalid.write_text('{"bootstrap":"../outside.js"}')
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.editor._EDITOR_MANIFEST",
        invalid,
    )

    assert _editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_missing_development_loader_falls_back_to_stable_editor(
    monkeypatch,
    tmp_path,
) -> None:
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.editor._EDITOR_LOADER",
        tmp_path / "missing-loader.js",
    )

    assert _editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_non_object_manifest_falls_back_to_stable_editor(
    monkeypatch,
    tmp_path,
) -> None:
    manifest = tmp_path / "manifest.json"
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.editor._EDITOR_MANIFEST",
        manifest,
    )

    values: tuple[object, ...] = (None, [], "manifest", 1)
    for value in values:
        manifest.write_text(json.dumps(value))
        assert _editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_mismatched_prerelease_asset_contract_falls_back_to_stable_editor(
    monkeypatch,
    tmp_path,
) -> None:
    manifest = tmp_path / "manifest.json"
    manifest.write_text(
        json.dumps(
            {
                "bootstrap": _EDITOR_MANIFEST.name,
                "asset_version": EDITOR_ASSET_VERSION + 1,
                "api_version": EDITOR_API_VERSION,
                "effect_schema_version": EFFECT_SCHEMA_VERSION,
                "compiler_version": EFFECT_COMPILER_VERSION,
            }
        )
    )
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.editor._EDITOR_MANIFEST",
        manifest,
    )

    assert _editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_device_url_uses_mainline_rollback_contract() -> None:
    assert editor_url("entry-a") == "homeassistant://ha-govee-led-ble/editor/entry-a"
    assert DOMAIN in EDITOR_FALLBACK_MODULE_URL
