"""Home Assistant actions for saved custom effects."""

from __future__ import annotations

from uuid import UUID

import voluptuous as vol
from homeassistant.auth.permissions.const import POLICY_CONTROL
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .effect_backend import EffectBackend
from .effect_storage import EffectNotFoundError, EffectStorageError

SERVICE_APPLY_CUSTOM_EFFECT = "apply_custom_effect"
ATTR_EFFECT_ID = "effect_id"
ATTR_REVISION = "revision"

APPLY_CUSTOM_EFFECT_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_EFFECT_ID): cv.string,
        vol.Optional(ATTR_REVISION): vol.All(int, vol.Range(min=1)),
    }
)


def async_register_effect_services(
    hass: HomeAssistant,
    backend: EffectBackend,
) -> None:
    async def apply(call: ServiceCall) -> None:
        await async_apply_custom_effect(hass, backend, call)

    hass.services.async_register(
        DOMAIN,
        SERVICE_APPLY_CUSTOM_EFFECT,
        apply,
        schema=APPLY_CUSTOM_EFFECT_SCHEMA,
    )


async def async_apply_custom_effect(
    hass: HomeAssistant,
    backend: EffectBackend,
    call: ServiceCall,
) -> None:
    entity_id = call.data[ATTR_ENTITY_ID]
    registry_entry = er.async_get(hass).async_get(entity_id)
    if (
        registry_entry is None
        or registry_entry.platform != DOMAIN
        or not entity_id.startswith("light.")
        or registry_entry.config_entry_id is None
    ):
        raise ServiceValidationError(f"{entity_id} is not a Govee BLE light")
    if call.context.user_id is not None:
        user = await hass.auth.async_get_user(call.context.user_id)
        if user is None or not user.permissions.check_entity(
            entity_id,
            POLICY_CONTROL,
        ):
            raise ServiceValidationError(f"User is not allowed to control {entity_id}")
    config_entry = hass.config_entries.async_get_entry(registry_entry.config_entry_id)
    if config_entry is None or config_entry.state is not ConfigEntryState.LOADED:
        raise ServiceValidationError(f"{entity_id} is not loaded")
    try:
        item = backend.library.get(
            UUID(call.data[ATTR_EFFECT_ID]),
            call.data.get(ATTR_REVISION),
        )
        await backend.engine.async_apply_saved(
            config_entry.runtime_data,
            item,
            config_entry_id=config_entry.entry_id,
            updated_at=dt_util.utcnow().isoformat(),
        )
    except (ValueError, EffectNotFoundError) as exc:
        raise ServiceValidationError(str(exc)) from exc
    except EffectStorageError as exc:
        raise HomeAssistantError(str(exc)) from exc
