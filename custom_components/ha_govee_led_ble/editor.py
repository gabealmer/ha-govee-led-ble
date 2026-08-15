"""Stable frontend route contract for per-device configuration."""

import json
import logging
from pathlib import Path
from typing import Any, cast

from homeassistant.components import frontend
from homeassistant.components.http.server import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .editor_dev import editor_dev_module_url
from .effect_contracts import (
    EDITOR_API_VERSION,
    EDITOR_ASSET_VERSION,
    EFFECT_COMPILER_VERSION,
)
from .effect_domain import EFFECT_SCHEMA_VERSION

_LOGGER = logging.getLogger(__name__)

EDITOR_PANEL_PATH = "ha-govee-led-ble"
EDITOR_ROUTE_SEGMENT = "editor"
EDITOR_ELEMENT_NAME = "ha-govee-led-ble-editor"
EDITOR_STATIC_URL = f"/{DOMAIN}_static"
EDITOR_FALLBACK_MODULE_URL = f"{EDITOR_STATIC_URL}/editor.js"
EDITOR_LOADER_MODULE_URL = f"{EDITOR_STATIC_URL}/editor-loader.js"
_EDITOR_STATIC_PATH = Path(__file__).parent / "frontend"
_EDITOR_MANIFEST = _EDITOR_STATIC_PATH / "manifest.json"
_EDITOR_LOADER = _EDITOR_STATIC_PATH / "editor-loader.js"


def _load_packaged_editor_module_url() -> str:
    try:
        parsed = json.loads(_EDITOR_MANIFEST.read_text(encoding="utf-8"))
    except OSError, UnicodeDecodeError, json.JSONDecodeError:
        return EDITOR_FALLBACK_MODULE_URL
    if not isinstance(parsed, dict):
        return EDITOR_FALLBACK_MODULE_URL
    manifest = cast(dict[str, Any], parsed)
    filename = manifest.get("bootstrap")
    if (
        manifest.get("asset_version") != EDITOR_ASSET_VERSION
        or manifest.get("api_version") != EDITOR_API_VERSION
        or manifest.get("effect_schema_version") != EFFECT_SCHEMA_VERSION
        or manifest.get("compiler_version") != EFFECT_COMPILER_VERSION
        or not isinstance(filename, str)
        or not filename.endswith(".js")
        or "/" in filename
        or "\\" in filename
        or not (_EDITOR_STATIC_PATH / filename).is_file()
        or not _EDITOR_LOADER.is_file()
    ):
        return EDITOR_FALLBACK_MODULE_URL
    return EDITOR_LOADER_MODULE_URL


_PACKAGED_EDITOR_MODULE_URL = _load_packaged_editor_module_url()


def editor_url(config_entry_id: str) -> str:
    """Return the canonical internal editor URL for a config entry."""
    return f"homeassistant://{EDITOR_PANEL_PATH}/{EDITOR_ROUTE_SEGMENT}/{config_entry_id}"


async def async_register_editor_panel(
    hass: HomeAssistant,
    *,
    advanced_available: bool = False,
) -> None:
    """Register the stable hidden panel served by the device configuration link."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(EDITOR_STATIC_URL, str(_EDITOR_STATIC_PATH), cache_headers=False)]
    )
    if frontend.async_panel_exists(hass, EDITOR_PANEL_PATH):
        return
    module_url = _editor_module_url(advanced_available=advanced_available)
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        frontend_url_path=EDITOR_PANEL_PATH,
        config={
            "configuration_path": f"/config/integrations/integration/{DOMAIN}",
            "_panel_custom": {
                "name": EDITOR_ELEMENT_NAME,
                "module_url": module_url,
                "embed_iframe": False,
                "trust_external": False,
            },
        },
        require_admin=False,
        show_in_sidebar=False,
    )


def _editor_module_url(*, advanced_available: bool = True) -> str:
    if not advanced_available:
        return EDITOR_FALLBACK_MODULE_URL
    try:
        development_url = editor_dev_module_url()
    except ValueError:
        _LOGGER.warning("Ignoring invalid development editor module URL")
        return EDITOR_FALLBACK_MODULE_URL
    if development_url is not None:
        return development_url
    return _PACKAGED_EDITOR_MODULE_URL
