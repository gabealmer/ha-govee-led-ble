"""Effect Studio WebSocket contracts."""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock, Mock

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.ha_govee_led_ble.const import DOMAIN
from custom_components.ha_govee_led_ble.effect_application import EffectStudioApplication
from custom_components.ha_govee_led_ble.effect_backend import EffectBackend
from custom_components.ha_govee_led_ble.effect_contracts import EDITOR_API_VERSION
from custom_components.ha_govee_led_ble.effect_domain import SingleEffect, effect_content_to_dict
from custom_components.ha_govee_led_ble.effect_preview import (
    PreviewOwnershipError,
    PreviewSessionNotFoundError,
    PreviewTargetUnavailableError,
)
from custom_components.ha_govee_led_ble.effect_storage import EffectVersionConflictError
from custom_components.ha_govee_led_ble.effect_websocket import (
    PREVIEW_SESSION_NOT_FOUND_CODE,
    PREVIEW_SESSION_UNAUTHORIZED_CODE,
    PREVIEW_TARGET_UNAVAILABLE_CODE,
    WS_APPLY,
    WS_CUSTOM_CATALOGUE,
    WS_INFO,
    WS_LIBRARY_CREATE,
    WS_LIBRARY_DELETE,
    WS_LIBRARY_GET,
    WS_LIBRARY_LIST,
    WS_LIBRARY_SUBSCRIBE,
    WS_LIBRARY_UPDATE,
    WS_USER_STATE_GET,
    WS_USER_STATE_RECORD_COLOUR,
    WS_USER_STATE_UPDATE,
    _light_entity_id,
    _send_preview_error,
    async_register_effect_websocket,
)


async def _setup_backend(hass: HomeAssistant) -> EffectBackend:
    assert await async_setup_component(hass, "websocket_api", {})
    backend = await EffectBackend.async_create(hass)
    async_register_effect_websocket(hass, backend)
    return backend


def _content(speed: int = 50) -> dict[str, Any]:
    return effect_content_to_dict(SingleEffect(0, 0, speed, ((255, 0, 0),)))


async def test_light_entity_resolution_requires_one_enabled_integration_light(
    hass: HomeAssistant,
    entity_registry,
) -> None:
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    other = entity_registry.async_get_or_create(
        "light",
        "other",
        "other-light",
        config_entry=entry,
    )
    disabled = entity_registry.async_get_or_create(
        "light",
        DOMAIN,
        "disabled-light",
        config_entry=entry,
        disabled_by=er.RegistryEntryDisabler.USER,
    )

    assert _light_entity_id(hass, entry.entry_id) is None
    assert other.entity_id != disabled.entity_id

    first = entity_registry.async_get_or_create(
        "light",
        DOMAIN,
        "first-light",
        config_entry=entry,
    )
    assert _light_entity_id(hass, entry.entry_id) == first.entity_id

    entity_registry.async_get_or_create(
        "light",
        DOMAIN,
        "second-light",
        config_entry=entry,
    )
    assert _light_entity_id(hass, entry.entry_id) is None


async def test_authenticated_users_can_read_contracts(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass, access_token=hass_read_only_access_token)

    await client.send_json_auto_id({"type": WS_INFO})
    info = await client.receive_json()
    await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
    library = await client.receive_json()
    await client.send_json_auto_id({"type": WS_CUSTOM_CATALOGUE})
    catalogue = await client.receive_json()

    assert info["result"]["api_version"] == EDITOR_API_VERSION
    assert "drafts_per_owner" not in info["result"]["limits"]
    assert library["result"] == {"items": []}
    assert sorted(catalogue["result"]["catalogue"]["models"]) == ["H617A", "H6199"]


async def test_non_admin_cannot_mutate_library(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass, access_token=hass_read_only_access_token)

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Test",
            "content": _content(),
        }
    )
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "unauthorized"


async def test_apply_forwards_expected_item_version(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    monkeypatch.setattr(cast(Any, backend.preview), "async_supersede_device", AsyncMock())
    deployment = MagicMock()
    deployment.to_public_dict.return_value = {"phase": "confirmed"}
    apply_saved = AsyncMock(return_value=deployment)
    monkeypatch.setattr(cast(Any, EffectStudioApplication), "async_apply_saved_effect", apply_saved)
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain=DOMAIN,
        state=ConfigEntryState.LOADED,
        runtime_data=MagicMock(),
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == entry.entry_id else None,
    )
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_APPLY,
            "config_entry_id": entry.entry_id,
            "item_id": "00000000-0000-0000-0000-000000000001",
            "expected_version": 4,
            "updated_at": "2026-08-27T00:00:00Z",
        }
    )
    response = await client.receive_json()

    assert response["success"] is True
    apply_saved.assert_awaited_once_with(
        backend.engine,
        entry.runtime_data,
        item_id="00000000-0000-0000-0000-000000000001",
        config_entry_id=entry.entry_id,
        updated_at="2026-08-27T00:00:00Z",
        operation_id=None,
        expected_version=4,
    )


async def test_apply_surfaces_item_version_conflict(
    hass: HomeAssistant,
    hass_ws_client,
    monkeypatch,
) -> None:
    backend = await _setup_backend(hass)
    monkeypatch.setattr(cast(Any, backend.preview), "async_supersede_device", AsyncMock())
    apply_saved = AsyncMock(
        side_effect=EffectVersionConflictError(5),
    )
    monkeypatch.setattr(cast(Any, EffectStudioApplication), "async_apply_saved_effect", apply_saved)
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain=DOMAIN,
        state=ConfigEntryState.LOADED,
        runtime_data=MagicMock(),
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == entry.entry_id else None,
    )
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_APPLY,
            "config_entry_id": entry.entry_id,
            "item_id": "00000000-0000-0000-0000-000000000001",
            "expected_version": 4,
            "updated_at": "2026-08-27T00:00:00Z",
        }
    )
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "conflict"


async def test_admin_current_only_library_lifecycle_and_stale_token(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Test",
            "content": _content(),
        }
    )
    created = (await client.receive_json())["result"]["item"]
    assert created["version"] == 1
    assert len(created["content_hash"]) == 64
    assert created["origin"] == {"kind": "authored", "source_id": None}

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": created["id"],
            "name": "Updated",
            "content": _content(60),
            "expected_version": created["version"],
            "expected_updated_at": created["updated_at"],
        }
    )
    updated = (await client.receive_json())["result"]["item"]
    assert updated["version"] == 2
    assert updated["updated_at"] > created["updated_at"]

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_UPDATE,
            "item_id": created["id"],
            "name": "Stale",
            "content": _content(),
            "expected_version": created["version"],
            "expected_updated_at": created["updated_at"],
        }
    )
    conflict = await client.receive_json()
    assert conflict["success"] is False
    assert conflict["error"]["code"] == "conflict"

    await client.send_json_auto_id({"type": WS_LIBRARY_GET, "item_id": created["id"]})
    assert (await client.receive_json())["result"]["item"] == updated

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_DELETE,
            "item_id": updated["id"],
            "expected_version": updated["version"],
            "expected_updated_at": updated["updated_at"],
        }
    )
    assert (await client.receive_json())["success"] is True
    await client.send_json_auto_id({"type": WS_LIBRARY_LIST})
    assert (await client.receive_json())["result"] == {"items": []}


async def test_library_subscription_publishes_current_snapshot(
    hass: HomeAssistant,
    hass_ws_client,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": WS_LIBRARY_SUBSCRIBE})
    subscribed = await client.receive_json()
    assert subscribed["success"] is True
    initial = await client.receive_json()
    assert initial["id"] == subscribed["id"]
    assert initial["event"] == {"items": []}

    await client.send_json_auto_id(
        {
            "type": WS_LIBRARY_CREATE,
            "name": "Test",
            "content": _content(),
        }
    )
    messages = [await client.receive_json(), await client.receive_json()]
    created = next(message for message in messages if "success" in message)
    event = next(message for message in messages if "event" in message)

    assert created["success"] is True
    assert event["id"] == subscribed["id"]
    assert event["event"]["items"][0]["version"] == 1


async def test_user_state_contains_navigation_without_drafts(
    hass: HomeAssistant,
    hass_ws_client,
    hass_read_only_access_token: str,
) -> None:
    await _setup_backend(hass)
    client = await hass_ws_client(hass, access_token=hass_read_only_access_token)

    await client.send_json_auto_id(
        {
            "type": WS_USER_STATE_UPDATE,
            "selected_config_entry_id": "entry-a",
            "navigation": {"section": "scenes", "item_id": "effect-a"},
        }
    )
    updated = (await client.receive_json())["result"]["user_state"]
    await client.send_json_auto_id(
        {
            "type": WS_USER_STATE_RECORD_COLOUR,
            "colour": [1, 2, 3],
        }
    )
    coloured = (await client.receive_json())["result"]["user_state"]
    await client.send_json_auto_id({"type": WS_USER_STATE_GET})
    fetched = (await client.receive_json())["result"]["user_state"]

    assert updated["selected_config_entry_id"] == "entry-a"
    assert updated["navigation"] == {"section": "scenes", "item_id": "effect-a"}
    assert coloured["recent_colours"] == [[1, 2, 3]]
    assert fetched == coloured
    assert "preferences" not in fetched


def test_preview_session_and_target_errors_have_distinct_codes() -> None:
    connection = Mock()
    cases = (
        (
            PreviewSessionNotFoundError("missing"),
            PREVIEW_SESSION_NOT_FOUND_CODE,
            "The preview session was not found.",
        ),
        (
            PreviewOwnershipError("wrong owner"),
            PREVIEW_SESSION_UNAUTHORIZED_CODE,
            "The preview session belongs to another connection.",
        ),
        (
            PreviewTargetUnavailableError("unloaded"),
            PREVIEW_TARGET_UNAVAILABLE_CODE,
            "The target light is not loaded.",
        ),
    )

    for error, code, message in cases:
        connection.reset_mock()
        _send_preview_error(connection, 7, error)
        connection.send_error.assert_called_once_with(7, code, message)
