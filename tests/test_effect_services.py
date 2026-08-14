"""Automation action for saved custom effects."""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.ha_govee_led_ble.const import DOMAIN
from custom_components.ha_govee_led_ble.effect_backend import EffectBackend
from custom_components.ha_govee_led_ble.effect_domain import (
    LibraryItem,
    PaintedEffect,
)
from custom_components.ha_govee_led_ble.effect_services import (
    ATTR_CORRELATION_ID,
    ATTR_EFFECT_ID,
    SERVICE_APPLY_CUSTOM_EFFECT,
    async_apply_custom_effect,
    async_register_effect_services,
)


async def test_service_registration_and_apply(
    hass: HomeAssistant,
    entity_registry,
    monkeypatch,
) -> None:
    backend = await EffectBackend.async_create(hass)
    async_register_effect_services(hass, backend)
    item = LibraryItem.new(
        "Paint",
        PaintedEffect("clockwise", 50, 100, (0, 0, 0)),
    )
    await backend.library.async_create(item, expected_library_revision=0)
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    registry_entry = entity_registry.async_get_or_create(
        "light",
        DOMAIN,
        "test-light",
        config_entry=entry,
    )
    coordinator = SimpleNamespace()
    config_entry = SimpleNamespace(
        entry_id=entry.entry_id,
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
    )
    apply_mock = AsyncMock()
    monkeypatch.setattr(backend.engine, "async_apply_saved", apply_mock)
    correlation_id = "11111111-2222-4333-8444-555555555555"

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: config_entry if entry_id == entry.entry_id else None,
        )
        await async_apply_custom_effect(
            hass,
            backend,
            SimpleNamespace(
                context=Context(),
                data={
                    "entity_id": registry_entry.entity_id,
                    ATTR_EFFECT_ID: str(item.id),
                    ATTR_CORRELATION_ID: correlation_id,
                },
            ),
        )

    assert hass.services.has_service(DOMAIN, SERVICE_APPLY_CUSTOM_EFFECT)
    apply_mock.assert_awaited_once()
    assert apply_mock.await_args is not None
    assert apply_mock.await_args.kwargs["config_entry_id"] == entry.entry_id
    assert str(apply_mock.await_args.kwargs["operation_id"]) == correlation_id
    events = backend.diagnostics.snapshot()["events"]
    assert [(event["stage"], event["outcome"]) for event in events] == [
        ("api_service", "started"),
        ("api_service", "succeeded"),
    ]
    assert {event["correlation_id"] for event in events} == {correlation_id}


async def test_service_rejects_non_govee_entity(
    hass: HomeAssistant,
    entity_registry,
) -> None:
    backend = await EffectBackend.async_create(hass)
    registry_entry = entity_registry.async_get_or_create(
        "light",
        "other",
        "test-light",
    )

    with pytest.raises(ServiceValidationError, match="not a Govee"):
        await async_apply_custom_effect(
            hass,
            backend,
            SimpleNamespace(
                context=Context(),
                data={
                    "entity_id": registry_entry.entity_id,
                    ATTR_EFFECT_ID: "not-a-uuid",
                },
            ),
        )


async def test_service_checks_entity_control_permission(
    hass: HomeAssistant,
    entity_registry,
    hass_read_only_user,
) -> None:
    backend = await EffectBackend.async_create(hass)
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    registry_entry = entity_registry.async_get_or_create(
        "light",
        DOMAIN,
        "test-light",
        config_entry=entry,
    )

    with pytest.raises(ServiceValidationError, match="not allowed"):
        await async_apply_custom_effect(
            hass,
            backend,
            SimpleNamespace(
                context=Context(user_id=hass_read_only_user.id),
                data={
                    "entity_id": registry_entry.entity_id,
                    ATTR_EFFECT_ID: "not-a-uuid",
                },
            ),
        )
