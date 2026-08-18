"""HA Govee LED BLE integration."""

import asyncio

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util

from .const import (
    CONF_EFFECT_FAMILIES,
    CONF_MODEL,
    DOMAIN,
    EFFECT_FAMILIES,
    MODEL_PROFILES,
    default_effect_families,
    effect_families_from_options,
    resolve_model,
)
from .coordinator import GoveeBLECoordinator, clear_availability_log_state
from .editor import async_register_editor_panel, editor_url
from .effect_setup import async_setup_effects, get_effect_backend
from .light_services import async_register_light_services

type GoveeBLEConfigEntry = ConfigEntry[GoveeBLECoordinator]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
PLATFORMS = [Platform.LIGHT]
_LEGACY_ENTITY_SUFFIXES = {
    "_active_mode",
    "_blank_screen",
    "_effect_preview",
    "_music_daynight_segments",
    "_music_daynight_speed",
    "_music_fountain_direction",
    "_music_hopping_brightness",
    "_music_piano_key_count",
    "_music_sensitivity",
    "_music_separation_gradient",
    "_music_separation_point",
    "_music_style",
    "_poweroff_memory",
    "_reduce_motion",
    "_relative_brightness",
    "_relative_brightness_bottom",
    "_relative_brightness_left",
    "_relative_brightness_right",
    "_relative_brightness_top",
    "_scene_speed",
    "_sleep_timer",
    "_sleep_timer_duration",
    "_video_brightness",
    "_video_capture_region",
    "_video_saturation",
    "_video_sound_effects",
    "_video_sound_effects_softness",
    "_wakeup_timer",
    "_wakeup_timer_time",
    "_white_brightness",
    "_white_balance_blue",
    "_white_balance",
    "_white_balance_preset",
    "_white_balance_red",
    "_music_calm",
    "_music_mode",
}
# Config entry versions below 2 can contain this unsupported option.
_LEGACY_EXPERIMENTAL_OPTION = "experimental"


def _unsupported_model_issue_id(entry: GoveeBLEConfigEntry) -> str:
    return f"unsupported_model_{entry.entry_id}"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_register_light_services(hass)
    effects = await async_setup_effects(hass)
    await async_register_editor_panel(hass, advanced_available=effects is not None)
    return True


async def _async_cleanup_legacy_entities(hass: HomeAssistant, entry: GoveeBLEConfigEntry) -> None:
    registry = er.async_get(hass)
    for entity in er.async_entries_for_config_entry(registry, entry.entry_id):
        if entity.unique_id and any(entity.unique_id.endswith(suffix) for suffix in _LEGACY_ENTITY_SUFFIXES):
            registry.async_remove(entity.entity_id)


def _addr(entry: GoveeBLEConfigEntry) -> str:
    assert entry.unique_id is not None
    return entry.unique_id.replace(":", "").lower()


async def async_migrate_entry(hass: HomeAssistant, entry: GoveeBLEConfigEntry) -> bool:
    options = dict(entry.options)
    if entry.version < 2:
        options = {k: v for k, v in options.items() if k != _LEGACY_EXPERIMENTAL_OPTION}
    data = dict(entry.data)
    raw_model = data.get(CONF_MODEL)
    model = resolve_model(raw_model) if isinstance(raw_model, str) else None
    if model is None and isinstance(entry.title, str):
        model = next((candidate for candidate in MODEL_PROFILES if candidate in entry.title.upper()), None)
    if model is not None:
        data[CONF_MODEL] = model
        defaults = default_effect_families(model)
        options.setdefault(CONF_EFFECT_FAMILIES, [family for family in EFFECT_FAMILIES if family in defaults])
    hass.config_entries.async_update_entry(entry, data=data, options=options, version=5)
    return True


def _maybe_flag_music_mode_replaced(hass: HomeAssistant, entry: GoveeBLEConfigEntry) -> None:
    """Warn when a legacy music-mode select remains in the entity registry."""
    old_id = er.async_get(hass).async_get_entity_id("select", DOMAIN, f"{_addr(entry)}_music_mode")
    if old_id is None:
        return
    ir.async_create_issue(
        hass,
        DOMAIN,
        "music_mode_replaced",
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key="music_mode_replaced",
        translation_placeholders={"old": old_id},
    )


async def async_setup_entry(hass: HomeAssistant, entry: GoveeBLEConfigEntry) -> bool:
    assert entry.unique_id is not None
    raw_model = entry.data.get(CONF_MODEL)
    model = resolve_model(raw_model) if isinstance(raw_model, str) else None
    issue_id = _unsupported_model_issue_id(entry)
    if model is None:
        ir.async_create_issue(
            hass,
            DOMAIN,
            issue_id,
            is_fixable=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key="unsupported_model",
            translation_placeholders={"model": str(raw_model or "missing")},
        )
        return False
    ir.async_delete_issue(hass, DOMAIN, issue_id)
    coordinator = GoveeBLECoordinator(
        hass,
        entry.unique_id,
        model,
        configuration_url=editor_url(entry.entry_id),
        effect_families=effect_families_from_options(model, entry.options),
    )
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    if effect_backend := get_effect_backend(hass):
        await effect_backend.preview.async_load_device(entry.entry_id)
        await effect_backend.engine.async_reconcile(
            coordinator,
            config_entry_id=entry.entry_id,
            observed_at=dt_util.utcnow().isoformat(),
        )
    _maybe_flag_music_mode_replaced(hass, entry)
    await _async_cleanup_legacy_entities(hass, entry)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: GoveeBLEConfigEntry) -> bool:
    effect_backend = get_effect_backend(hass)
    if effect_backend is not None:
        await effect_backend.preview.async_unload_device(entry.entry_id)
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        await entry.runtime_data.disconnect()
    elif effect_backend is not None:
        await effect_backend.preview.async_load_device(entry.entry_id)
    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: GoveeBLEConfigEntry) -> None:
    effect_backend = get_effect_backend(hass)
    if effect_backend is not None:
        await asyncio.gather(
            effect_backend.scene_defaults.async_delete_device(entry.entry_id),
            effect_backend.device_cache.async_delete_device(entry.entry_id),
            effect_backend.deployments.async_delete_device(entry.entry_id),
            effect_backend.user_state.async_clear_config_entry(entry.entry_id),
        )
    ir.async_delete_issue(hass, DOMAIN, _unsupported_model_issue_id(entry))
    if entry.unique_id is not None:
        clear_availability_log_state(hass, entry.unique_id)
