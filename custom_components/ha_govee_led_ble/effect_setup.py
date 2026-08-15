"""Fail-open process setup for the optional advanced-effect backend."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Final, cast

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import UnsupportedStorageVersionError

from .const import DOMAIN
from .effect_backend import EffectBackend
from .effect_services import async_register_effect_services
from .effect_storage import EffectStorageError
from .effect_websocket import async_register_effect_websocket

_LOGGER = logging.getLogger(__name__)

EFFECT_SETUP_DATA_KEY: Final = "effect_setup"


@dataclass(slots=True)
class EffectSetup:
    backend: EffectBackend


async def async_setup_effects(hass: HomeAssistant) -> EffectSetup | None:
    try:
        backend = await EffectBackend.async_create(hass)
    except EffectStorageError, UnsupportedStorageVersionError:
        _LOGGER.exception("Advanced effect storage is unavailable; normal Govee entities remain active")
        return None
    async_register_effect_websocket(hass, backend)
    async_register_effect_services(hass, backend)
    setup = EffectSetup(backend)
    hass.data.setdefault(DOMAIN, {})[EFFECT_SETUP_DATA_KEY] = setup
    return setup


def get_effect_setup(hass: HomeAssistant) -> EffectSetup | None:
    value = hass.data.get(DOMAIN, {}).get(EFFECT_SETUP_DATA_KEY)
    return value if value is None else cast(EffectSetup, value)
