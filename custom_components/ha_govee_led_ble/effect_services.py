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
from .effect_diagnostics import (
    DiagnosticOutcome,
    DiagnosticStage,
    new_correlation_id,
    normalise_correlation_id,
)
from .effect_storage import EffectNotFoundError, EffectStorageError

SERVICE_APPLY_CUSTOM_EFFECT = "apply_custom_effect"
ATTR_EFFECT_ID = "effect_id"
ATTR_REVISION = "revision"
ATTR_CORRELATION_ID = "correlation_id"

APPLY_CUSTOM_EFFECT_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Required(ATTR_EFFECT_ID): cv.string,
        vol.Optional(ATTR_REVISION): vol.All(int, vol.Range(min=1)),
        vol.Optional(ATTR_CORRELATION_ID): vol.All(cv.string, normalise_correlation_id),
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
    supplied_correlation_id = call.data.get(ATTR_CORRELATION_ID)
    correlation_id = (
        new_correlation_id() if supplied_correlation_id is None else normalise_correlation_id(supplied_correlation_id)
    )
    backend.diagnostics.record(
        DiagnosticStage.API_SERVICE,
        DiagnosticOutcome.STARTED,
        "apply_request_received",
        correlation_id=correlation_id,
    )
    entity_id = call.data[ATTR_ENTITY_ID]
    registry_entry = er.async_get(hass).async_get(entity_id)
    if (
        registry_entry is None
        or registry_entry.platform != DOMAIN
        or not entity_id.startswith("light.")
        or registry_entry.config_entry_id is None
    ):
        _record_rejection(backend, correlation_id, "invalid_target")
        raise ServiceValidationError(f"{entity_id} is not a Govee BLE light")
    if call.context.user_id is not None:
        user = await hass.auth.async_get_user(call.context.user_id)
        if user is None or not user.permissions.check_entity(
            entity_id,
            POLICY_CONTROL,
        ):
            _record_rejection(backend, correlation_id, "permission_denied")
            raise ServiceValidationError(f"User is not allowed to control {entity_id}")
    config_entry = hass.config_entries.async_get_entry(registry_entry.config_entry_id)
    if config_entry is None or config_entry.state is not ConfigEntryState.LOADED:
        _record_rejection(backend, correlation_id, "target_not_loaded")
        raise ServiceValidationError(f"{entity_id} is not loaded")
    try:
        item = backend.application.get_saved_effect(
            str(UUID(call.data[ATTR_EFFECT_ID])),
            call.data.get(ATTR_REVISION),
        )
    except (ValueError, EffectNotFoundError) as exc:
        _record_rejection(
            backend,
            correlation_id,
            "invalid_effect",
            config_entry_id=config_entry.entry_id,
            error_type=type(exc).__name__,
        )
        raise ServiceValidationError(str(exc)) from exc
    except EffectStorageError as exc:
        _record_rejection(
            backend,
            correlation_id,
            "storage_error",
            config_entry_id=config_entry.entry_id,
            error_type=type(exc).__name__,
        )
        raise HomeAssistantError(str(exc)) from exc
    backend.diagnostics.record(
        DiagnosticStage.API_SERVICE,
        DiagnosticOutcome.SUCCEEDED,
        "apply_request_accepted",
        correlation_id=correlation_id,
        config_entry_id=config_entry.entry_id,
        operation_id=correlation_id,
    )
    try:
        await backend.engine.async_apply_saved(
            config_entry.runtime_data,
            item,
            config_entry_id=config_entry.entry_id,
            updated_at=dt_util.utcnow().isoformat(),
            operation_id=UUID(correlation_id),
        )
    except ValueError as exc:
        backend.diagnostics.record(
            DiagnosticStage.COMPILATION,
            DiagnosticOutcome.FAILED,
            "compilation_failed",
            correlation_id=correlation_id,
            config_entry_id=config_entry.entry_id,
            operation_id=correlation_id,
            details={"error_type": type(exc).__name__},
        )
        raise ServiceValidationError(str(exc)) from exc
    except EffectStorageError as exc:
        _record_rejection(
            backend,
            correlation_id,
            "storage_error",
            config_entry_id=config_entry.entry_id,
            error_type=type(exc).__name__,
        )
        raise HomeAssistantError(str(exc)) from exc


def _record_rejection(
    backend: EffectBackend,
    correlation_id: str,
    code: str,
    *,
    config_entry_id: str | None = None,
    error_type: str | None = None,
) -> None:
    backend.diagnostics.record(
        DiagnosticStage.API_SERVICE,
        DiagnosticOutcome.FAILED,
        code,
        correlation_id=correlation_id,
        config_entry_id=config_entry_id,
        operation_id=correlation_id if config_entry_id is not None else None,
        details={} if error_type is None else {"error_type": error_type},
    )
