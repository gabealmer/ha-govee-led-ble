"""Automation action for saved custom effects."""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.ha_govee_led_ble.const import DOMAIN
from custom_components.ha_govee_led_ble.effect_backend import EffectBackend
from custom_components.ha_govee_led_ble.effect_domain import (
    LibraryItem,
    PaintedEffect,
    PaletteDiyEffect,
)
from custom_components.ha_govee_led_ble.effect_services import (
    ATTR_CONTENT,
    ATTR_CORRELATION_ID,
    ATTR_EFFECT_ID,
    ATTR_NAME,
    SERVICE_APPLY_CUSTOM_EFFECT,
    SERVICE_APPLY_EFFECT_SNAPSHOT,
    async_apply_custom_effect,
    async_apply_effect_snapshot,
    async_register_effect_services,
)


@pytest.mark.parametrize(
    "content",
    [
        PaintedEffect("clockwise", 50, 100, (0, 0, 0)),
        PaletteDiyEffect("H6199", 8, 9, 50, ((255, 0, 0), (0, 0, 255))),
    ],
)
async def test_service_registration_and_apply(
    hass: HomeAssistant,
    entity_registry,
    monkeypatch,
    content,
) -> None:
    backend = await EffectBackend.async_create(hass)
    async_register_effect_services(hass, backend)
    item = LibraryItem.new("Paint", content)
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


async def test_snapshot_service_applies_unsaved_music_profile(
    hass: HomeAssistant,
    entity_registry,
    monkeypatch,
) -> None:
    backend = await EffectBackend.async_create(hass)
    async_register_effect_services(hass, backend)
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
    monkeypatch.setattr(backend.engine, "async_apply_snapshot", apply_mock)
    correlation_id = "11111111-2222-4333-8444-555555555556"

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: config_entry if entry_id == entry.entry_id else None,
        )
        await async_apply_effect_snapshot(
            hass,
            backend,
            SimpleNamespace(
                context=Context(),
                data={
                    "entity_id": registry_entry.entity_id,
                    ATTR_NAME: "Live music",
                    ATTR_CONTENT: {
                        "kind": "music_profile",
                        "model": "H617A",
                        "mode": "rhythm",
                        "sensitivity": 50,
                        "colour": None,
                        "calm": False,
                        "parameters": {},
                    },
                    ATTR_CORRELATION_ID: correlation_id,
                },
            ),
        )

    assert hass.services.has_service(DOMAIN, SERVICE_APPLY_EFFECT_SNAPSHOT)
    apply_mock.assert_awaited_once()
    assert apply_mock.await_args is not None
    assert apply_mock.await_args.args[1].content.mode == "rhythm"
    assert apply_mock.await_args.kwargs["snapshot_id"] == apply_mock.await_args.kwargs["operation_id"]


async def test_snapshot_service_reports_profile_application_failure(
    hass: HomeAssistant,
    entity_registry,
    monkeypatch,
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
    config_entry = SimpleNamespace(
        entry_id=entry.entry_id,
        state=ConfigEntryState.LOADED,
        runtime_data=SimpleNamespace(),
    )
    monkeypatch.setattr(
        backend.engine,
        "async_apply_snapshot",
        AsyncMock(side_effect=RuntimeError("video write failed")),
    )
    correlation_id = "11111111-2222-4333-8444-555555555557"

    with monkeypatch.context() as context:
        context.setattr(
            hass.config_entries,
            "async_get_entry",
            lambda entry_id: config_entry if entry_id == entry.entry_id else None,
        )
        with pytest.raises(HomeAssistantError, match="video write failed"):
            await async_apply_effect_snapshot(
                hass,
                backend,
                SimpleNamespace(
                    context=Context(),
                    data={
                        "entity_id": registry_entry.entity_id,
                        ATTR_NAME: "Movie",
                        ATTR_CONTENT: {
                            "kind": "video_profile",
                            "model": "H6199",
                            "mode": "movie",
                            "full_screen": True,
                            "saturation": 70,
                            "sound_effects": False,
                            "sound_effects_softness": 50,
                            "white_balance_position": 10,
                            "relative_brightness": {
                                "left": 80,
                                "top": 80,
                                "right": 80,
                                "bottom": 80,
                            },
                            "blank_screen": False,
                        },
                        ATTR_CORRELATION_ID: correlation_id,
                    },
                ),
            )

    event = backend.diagnostics.snapshot()["events"][-1]
    assert (event["stage"], event["outcome"], event["code"]) == (
        "api_service",
        "failed",
        "apply_failed",
    )
    assert event["details"] == {"error_type": "RuntimeError"}


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
