"""Advanced editor adaptation of the stable mainline route contract."""

from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace

import pytest
from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import UnsupportedStorageVersionError
from homeassistant.setup import async_setup_component

from custom_components.ha_govee_led_ble import async_setup
from custom_components.ha_govee_led_ble.const import DOMAIN, EFFECT_FAMILY_SCENES
from custom_components.ha_govee_led_ble.coordinator import GoveeBLECoordinator
from custom_components.ha_govee_led_ble.editor import (
    _EDITOR_MANIFEST,
    _EDITOR_STATIC_PATH,
    EDITOR_ELEMENT_NAME,
    EDITOR_FALLBACK_MODULE_URL,
    EDITOR_LOADER_MODULE_URL,
    EDITOR_PANEL_PATH,
    EDITOR_SIDEBAR_ICON,
    EDITOR_SIDEBAR_TITLE,
    _editor_module_url,
    _load_packaged_editor_module_url,
    async_register_editor_panel,
    editor_url,
)
from custom_components.ha_govee_led_ble.editor_dev import EDITOR_DEV_MODULE_URL_ENV
from custom_components.ha_govee_led_ble.effect_contracts import (
    EDITOR_API_VERSION,
    EDITOR_ASSET_VERSION,
    EFFECT_COMPILER_VERSION,
)
from custom_components.ha_govee_led_ble.effect_domain import EFFECT_SCHEMA_VERSION
from custom_components.ha_govee_led_ble.effect_setup import get_effect_backend
from custom_components.ha_govee_led_ble.effect_storage import EffectStorageError
from custom_components.ha_govee_led_ble.effect_websocket import (
    WS_DEVICES,
    WS_INFO,
    WS_LIBRARY_LIST,
    WS_SCENE_CATALOGUE_LIST,
)
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES


@pytest.fixture(autouse=True)
def _clear_editor_development_module(monkeypatch) -> None:
    monkeypatch.delenv(EDITOR_DEV_MODULE_URL_ENV, raising=False)


async def test_process_setup_registers_visible_advanced_stable_route(
    hass: HomeAssistant,
) -> None:
    assert await async_setup_component(hass, "http", {})

    assert await async_setup(hass, {})

    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    custom = panel.config["_panel_custom"]
    assert panel.sidebar_title == EDITOR_SIDEBAR_TITLE
    assert panel.sidebar_icon == EDITOR_SIDEBAR_ICON
    assert panel.require_admin is False
    assert panel.show_in_sidebar is True
    assert custom["name"] == EDITOR_ELEMENT_NAME
    assert custom["embed_iframe"] is False
    assert custom["trust_external"] is False
    assert custom["module_url"] == _editor_module_url()
    assert get_effect_backend(hass) is not None


async def test_panel_registration_is_idempotent_and_updates_configuration(
    hass: HomeAssistant,
) -> None:
    assert await async_setup_component(hass, "http", {})

    await async_register_editor_panel(hass, advanced_available=False)
    await async_register_editor_panel(hass, advanced_available=True)

    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    assert panel.config["_panel_custom"]["module_url"] == EDITOR_LOADER_MODULE_URL


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
    assert get_effect_backend(hass) is None


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


async def test_invalid_development_url_does_not_break_panel_registration(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    monkeypatch.setenv(EDITOR_DEV_MODULE_URL_ENV, "not a URL")
    assert await async_setup_component(hass, "http", {})

    assert await async_setup(hass, {})

    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    assert panel.config["_panel_custom"]["module_url"] == EDITOR_FALLBACK_MODULE_URL
    assert panel.config["_panel_custom"]["trust_external"] is False


async def test_panel_registration_performs_no_filesystem_reads(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    assert await async_setup_component(hass, "http", {})

    def fail(*_args, **_kwargs):
        raise AssertionError("panel registration must use the packaged manifest loaded at import")

    monkeypatch.setattr(Path, "open", fail)
    monkeypatch.setattr(Path, "read_text", fail)
    monkeypatch.setattr(Path, "is_file", fail)

    await async_register_editor_panel(hass, advanced_available=True)

    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    assert panel.config["_panel_custom"]["module_url"] == EDITOR_LOADER_MODULE_URL


async def test_container_process_contract_uses_production_panel_websocket_storage_catalogue_and_coordinator(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    assert await async_setup_component(hass, "http", {})
    assert await async_setup_component(hass, "websocket_api", {})
    assert await async_setup(hass, {})

    panel = hass.data[frontend.DATA_PANELS][EDITOR_PANEL_PATH]
    assert panel.config is not None
    assert panel.config["_panel_custom"]["module_url"] == EDITOR_LOADER_MODULE_URL
    backend = get_effect_backend(hass)
    assert backend is not None

    coordinator = GoveeBLECoordinator(
        hass,
        "D0:35:34:AA:BB:CC",
        "H617A",
        configuration_url=editor_url("isolated-entry"),
        effect_families=frozenset({EFFECT_FAMILY_SCENES}),
    )
    entry = SimpleNamespace(
        entry_id="isolated-entry",
        domain=DOMAIN,
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
        title="Govee H617A",
    )
    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_entries",
            lambda domain=None: [entry] if domain in (None, DOMAIN) else [],
        )
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: entry if entry_id == entry.entry_id else None,
        )
        client = await hass_ws_client(hass)
        await client.send_json_auto_id({"type": WS_INFO})
        info = await client.receive_json()
        await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
        library = await client.receive_json()
        await client.send_json_auto_id({"type": WS_DEVICES})
        devices = await client.receive_json()
        await client.send_json_auto_id(
            {
                "type": WS_SCENE_CATALOGUE_LIST,
                "config_entry_id": entry.entry_id,
            }
        )
        catalogue = await client.receive_json()

    assert info["success"] is True
    assert info["result"]["api_version"] == EDITOR_API_VERSION
    assert library["result"] == {"items": []}
    device = devices["result"]["devices"][0]
    assert device["config_entry_id"] == "isolated-entry"
    assert device["model"] == "H617A"
    assert device["segment_count"] == coordinator.profile.segment_count
    assert device["custom_effects"]["painted"] == "supported"
    assert device["active_state"]["mode"] == "off"
    assert device["active_state"]["active_effect"] is None
    assert catalogue["success"] is True
    assert catalogue["result"]["catalogue"]["sku"] == "H617A"
    assert len(catalogue["result"]["catalogue"]["scenes"]) == len(SCENE_ENTRIES["H617A"])


def test_manifest_selects_stable_advanced_asset() -> None:
    manifest = json.loads(_EDITOR_MANIFEST.read_text())
    filename = manifest["bootstrap"]

    assert filename == "effect-studio-bootstrap.js"
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

    assert _load_packaged_editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_hashed_bootstrap_manifest_falls_back_to_stable_editor(
    monkeypatch,
    tmp_path,
) -> None:
    manifest = tmp_path / "manifest.json"
    manifest.write_text(
        json.dumps(
            {
                "bootstrap": "effect-studio-bootstrap.legacy.js",
                "asset_version": EDITOR_ASSET_VERSION,
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

    assert _load_packaged_editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_missing_development_loader_falls_back_to_stable_editor(
    monkeypatch,
    tmp_path,
) -> None:
    monkeypatch.setattr(
        "custom_components.ha_govee_led_ble.editor._EDITOR_LOADER",
        tmp_path / "missing-loader.js",
    )

    assert _load_packaged_editor_module_url() == EDITOR_FALLBACK_MODULE_URL


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
        assert _load_packaged_editor_module_url() == EDITOR_FALLBACK_MODULE_URL


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

    assert _load_packaged_editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_device_url_uses_mainline_rollback_contract() -> None:
    assert editor_url("entry-a") == "homeassistant://ha-govee-led-ble/editor/entry-a"
    assert DOMAIN in EDITOR_FALLBACK_MODULE_URL


def test_explicit_local_development_module_overrides_built_assets(monkeypatch) -> None:
    development_url = "http://127.0.0.1:5173/src/panel.ts"
    monkeypatch.setenv(EDITOR_DEV_MODULE_URL_ENV, development_url)

    assert _editor_module_url() == development_url


@pytest.mark.parametrize(
    "development_url",
    [
        "",
        " https://127.0.0.1:5173/src/panel.ts",
        "https://127.0.0.1:5173/src/panel.ts",
        "http://example.com:5173/src/panel.ts",
        "http://user:password@127.0.0.1:5173/src/panel.ts",
        "http://127.0.0.1/src/panel.ts",
        "http://127.0.0.1:70000/src/panel.ts",
        "http://[invalid:5173/src/panel.ts",
        "http://127.0.0.1:5173/src/panel.css",
        "http://127.0.0.1:5173/src/panel.ts?cache=no",
    ],
)
def test_invalid_development_module_url_uses_safe_built_asset(monkeypatch, development_url: str) -> None:
    monkeypatch.setenv(EDITOR_DEV_MODULE_URL_ENV, development_url)

    assert _editor_module_url() == EDITOR_FALLBACK_MODULE_URL


def test_development_module_does_not_bypass_backend_fallback(monkeypatch) -> None:
    monkeypatch.setenv(EDITOR_DEV_MODULE_URL_ENV, "not a URL")

    assert _editor_module_url(advanced_available=False) == EDITOR_FALLBACK_MODULE_URL
