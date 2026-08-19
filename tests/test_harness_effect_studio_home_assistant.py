import argparse
import asyncio
import importlib.util
import json
import sys
from collections.abc import Callable
from io import BytesIO
from pathlib import Path
from typing import Any

import pytest

_SCRIPT = Path(__file__).parents[1] / "tools" / "harness" / "effect_studio_home_assistant.py"
_SPEC = importlib.util.spec_from_file_location("harness_effect_studio_home_assistant", _SCRIPT)
assert _SPEC is not None and _SPEC.loader is not None
harness = importlib.util.module_from_spec(_SPEC)
sys.modules[_SPEC.name] = harness
_SPEC.loader.exec_module(harness)


class FakeWebSocket:
    def __init__(self, responses):
        self.responses = [json.dumps(response) for response in responses]
        self.sent = []
        self.closed = False

    async def recv(self):
        if not self.responses:
            await asyncio.Future()
        return self.responses.pop(0)

    async def send(self, payload):
        self.sent.append(json.loads(payload))

    async def close(self):
        self.closed = True


class FakeClient:
    def __init__(self, responses: dict[str, Any] | None = None):
        self.responses = responses or {}
        self.calls: list[dict[str, Any]] = []
        self.raw_response = {"type": "result", "success": True, "result": {}}
        self.closed = False

    async def call(self, payload):
        self.calls.append(payload)
        response = self.responses.get(payload["type"], {})
        if isinstance(response, list):
            return response.pop(0)
        if isinstance(response, Callable):
            return response(payload)
        return response

    async def call_raw(self, payload):
        self.calls.append(payload)
        return self.raw_response

    async def subscribe(self, payload, *, initial_event=True):
        self.calls.append(payload)
        return 1, {"event": {}} if initial_event else {}

    async def wait_event(self, subscription_id, predicate=None, *, timeout=30):
        raise AssertionError("unexpected subscription wait")

    async def close(self):
        self.closed = True


class FakeRest:
    async def diagnostics(self, config_entry_id):
        return {}


class RestartRest:
    def __init__(self):
        self.readiness = iter((True, False, True, True, True))
        self.calls = 0

    async def ready(self):
        self.calls += 1
        return next(self.readiness)


def test_real_rest_client_sends_the_configured_bearer_token(monkeypatch):
    captured = {}

    class Response:
        def __enter__(self):
            return BytesIO(b'{"message":"API running."}')

        def __exit__(self, *_args):
            return False

    def open_request(request, **_kwargs):
        captured["authorization"] = request.get_header("Authorization")
        return Response()

    monkeypatch.setattr(harness.transport, "urlopen", open_request)

    result = harness.HomeAssistantRest(
        "http://127.0.0.1:8123",
        "test-token",
    )._request_json("api/", "GET", None, 5)

    assert captured["authorization"] == "Bearer " + "test-token"
    assert result == {"message": "API running."}


def _device(model="H617A"):
    return {
        "config_entry_id": "entry-secret",
        "model": model,
        "display_name": "Cupboard",
        "custom_effects": {
            "painted": "supported",
            "single": "supported",
            "multi": "supported",
            "advanced": "supported",
            "workshop": "supported",
        },
        "profiles": {"music": "supported"},
    }


def _catalogue():
    return {
        "schema_version": 6,
        "models": {
            "H617A": {
                "painted_effects": [{"id": "clockwise"}],
                "effects": [
                    {
                        "family": 0,
                        "supports_multi": True,
                        "variations": [{"variant": 0}],
                    }
                ],
                "music_modes": [{"id": "energetic"}],
                "workshop_templates": [{"id": "movement", "content": {"kind": "workshop"}}],
                "workflows": [{"id": "painted"}],
                "supports": {"advanced": "supported", "workshop": "supported"},
                "apply": {
                    "painted": "supported",
                    "single": "supported",
                    "multi": "supported",
                    "workshop": "supported",
                },
            }
        },
    }


def _surface_client(model="H617A"):
    return FakeClient(
        {
            "get_panels": {
                "ha-govee-led-ble": {
                    "config": {
                        "_panel_custom": {
                            "module_url": "/ha_govee_led_ble_static/editor-loader.js",
                        }
                    }
                }
            },
            harness.WS_INFO: {
                "api_version": 5,
                "effect_schema_version": 2,
                "limits": {"deployment_records": 16, "library_items": 16},
            },
            harness.WS_DEVICES: {"devices": [_device(model)]},
            "config/entity_registry/list": lambda _: [
                {
                    "config_entry_id": "entry-secret",
                    "entity_id": "light.cupboard",
                    "disabled_by": None,
                }
            ],
            "get_services": {
                "ha_govee_led_ble": {
                    "apply_custom_effect": {},
                }
            },
            harness.WS_CUSTOM_CATALOGUE: {"catalogue": _catalogue()},
            harness.WS_SCENE_CATALOGUE_LIST: {
                "catalogue": {
                    "sku": "H617A",
                    "enabled": True,
                    "scenes": [
                        {"parameter_kind": "none"},
                        {"parameter_kind": "palette"},
                        {"parameter_kind": "layers"},
                    ],
                }
            },
        }
    )


async def test_websocket_client_authenticates_and_supports_subscriptions_without_initial_events():
    websocket = FakeWebSocket(
        [
            {"type": "auth_required"},
            {"type": "auth_ok"},
            {"type": "result", "id": 1, "success": True, "result": None},
        ]
    )
    client = harness.HomeAssistantWebSocket(websocket)

    await client.authenticate("secret")
    subscription_id, initial = await client.subscribe(
        {"type": "subscribe_events", "event_type": "homeassistant_stop"},
        initial_event=False,
    )

    assert subscription_id == 1
    assert initial == {}
    assert websocket.sent == [
        {"type": "auth", "access_token": "secret"},
        {"type": "subscribe_events", "event_type": "homeassistant_stop", "id": 1},
    ]


async def test_websocket_subscription_wait_correlates_events_and_retains_non_matches():
    websocket = FakeWebSocket(
        [
            {"type": "event", "id": 2, "event": {"operation_id": "other-subscription"}},
            {"type": "event", "id": 1, "event": {"operation_id": "wrong-operation"}},
            {"type": "event", "id": 1, "event": {"operation_id": "expected-operation"}},
        ]
    )
    client = harness.HomeAssistantWebSocket(websocket)

    matched = await client.wait_event(
        1,
        lambda message: message.get("event", {}).get("operation_id") == "expected-operation",
    )

    assert matched["event"]["operation_id"] == "expected-operation"
    assert (await client.wait_event(2))["event"]["operation_id"] == "other-subscription"
    assert (await client.wait_event(1))["event"]["operation_id"] == "wrong-operation"


async def test_websocket_subscription_wait_reports_a_bounded_timeout():
    client = harness.HomeAssistantWebSocket(FakeWebSocket([]))

    with pytest.raises(harness.ValidationError, match="subscription event timed out"):
        await client.wait_event(1, timeout=0.001)


async def test_restart_waits_for_loaded_entry_and_usable_light(monkeypatch):
    client = FakeClient()
    client.wait_event = lambda *args, **kwargs: _async_value({"event": {}})
    rest = RestartRest()
    setup_retry = FakeClient(
        {
            "config_entries/get": lambda _: [
                {
                    "entry_id": "entry-secret",
                    "domain": harness.DOMAIN,
                    "disabled_by": None,
                    "state": "setup_retry",
                }
            ]
        }
    )
    unavailable_light = FakeClient(
        {
            "config_entries/get": lambda _: [
                {
                    "entry_id": "entry-secret",
                    "domain": harness.DOMAIN,
                    "disabled_by": None,
                    "state": "loaded",
                }
            ],
            "get_states": lambda _: [{"entity_id": "light.cupboard", "state": "unavailable"}],
        }
    )
    ready = FakeClient(
        {
            "config_entries/get": lambda _: [
                {
                    "entry_id": "entry-secret",
                    "domain": harness.DOMAIN,
                    "disabled_by": None,
                    "state": "loaded",
                }
            ],
            "get_states": lambda _: [{"entity_id": "light.cupboard", "state": "on"}],
        }
    )
    candidates = iter((setup_retry, unavailable_light, ready))

    async def no_delay(_seconds):
        return None

    async def reconnect():
        return next(candidates), rest

    monkeypatch.setattr(harness.asyncio, "sleep", no_delay)
    monkeypatch.setattr(harness, "_connect", reconnect)

    reconnected, returned_rest = await harness._restart_home_assistant(
        client,
        rest,
        identity_entry_id="entry-secret",
        light_entity_id="light.cupboard",
    )

    assert reconnected is ready
    assert returned_rest is rest
    assert rest.calls == 5
    assert setup_retry.closed is True
    assert unavailable_light.closed is True
    assert ready.closed is False
    assert client.calls[-1] == {
        "type": "call_service",
        "domain": "homeassistant",
        "service": "restart",
        "service_data": {},
    }


async def test_discovery_selects_only_devices_env_cupboard_identity():
    client = _surface_client()
    validator = harness.EffectStudioValidator(
        client,
        FakeRest(),
        identity_entry_id="entry-secret",
        identity_model="H617A",
    )

    selection = await validator.verify_surfaces()

    assert selection.model == "H617A"
    assert selection.light_entity_id == "light.cupboard"
    assert selection.entity_ids == ("light.cupboard",)

    wrong_model = harness.EffectStudioValidator(
        _surface_client("H6199"),
        FakeRest(),
        identity_entry_id="entry-secret",
        identity_model="H617A",
    )
    with pytest.raises(harness.ValidationError, match="does not route to an H617A"):
        await wrong_model.verify_surfaces()


@pytest.mark.parametrize(
    ("kind", "phase", "confidence"),
    [
        ("h617a_painted", "confirmed", "activation_match"),
        ("h617a_single", "confirmed", "activation_match"),
        ("h617a_multi", "confirmed", "activation_match"),
        ("scene_palette", "confirmed", "activation_match"),
        ("scene_layered", "confirmed", "activation_match"),
        ("advanced", "confirmed", "activation_match"),
        ("music_profile", "confirmed", "mode_match"),
        ("workshop", "confirmed", "activation_match"),
    ],
)
def test_phase_acceptance_matches_truthful_backend_terminal_states(kind, phase, confidence):
    harness._validate_deployment(
        {
            "config_entry_id": "entry-secret",
            "content_kind": kind,
            "phase": phase,
            "verification_confidence": confidence,
            "error_code": None,
            "progress_current": 2,
            "progress_total": 2,
        },
        "entry-secret",
    )


def test_phase_acceptance_rejects_uncertain_or_wrong_device_results():
    deployment = {
        "config_entry_id": "entry-secret",
        "content_kind": "h617a_single",
        "phase": "uncertain",
        "verification_confidence": "unknown",
        "error_code": "device_state_unconfirmed",
        "progress_current": 2,
        "progress_total": 2,
    }
    with pytest.raises(harness.ValidationError, match="ended in phase"):
        harness._validate_deployment(deployment, "entry-secret")
    deployment["config_entry_id"] = "other-entry"
    with pytest.raises(harness.ValidationError, match="different config entry"):
        harness._validate_deployment(deployment, "entry-secret")


def test_deployment_validation_rejects_boolean_progress_values():
    with pytest.raises(harness.ValidationError, match="progress_current was not an integer"):
        harness._validate_deployment(
            {
                "config_entry_id": "entry-secret",
                "content_kind": "h617a_single",
                "phase": "confirmed",
                "verification_confidence": "activation_match",
                "error_code": None,
                "progress_current": True,
                "progress_total": 1,
            },
            "entry-secret",
        )


async def test_cleanup_removes_temporary_item_using_current_write_token():
    client = FakeClient(
        {
            harness.WS_LIBRARY_LIST: {
                "items": [
                    {
                        "id": "temporary-item",
                        "version": 3,
                        "updated_at": "2026-08-17T00:00:00Z",
                    }
                ],
            },
            harness.WS_LIBRARY_DELETE: {"deleted": True},
        }
    )
    validator = harness.EffectStudioValidator(
        client,
        FakeRest(),
        identity_entry_id="entry-secret",
        identity_model="H617A",
    )

    await validator.cleanup_item("temporary-item")

    assert client.calls[-1] == {
        "type": harness.WS_LIBRARY_DELETE,
        "item_id": "temporary-item",
        "expected_version": 3,
        "expected_updated_at": "2026-08-17T00:00:00Z",
    }


async def test_cleanup_retries_until_editor_commands_register(monkeypatch):
    list_calls = 0

    def library_listing(_payload):
        nonlocal list_calls
        list_calls += 1
        if list_calls == 1:
            raise harness.HomeAssistantApiError("unknown_command")
        return {
            "items": [
                {
                    "id": "temporary-item",
                    "version": 3,
                    "updated_at": "2026-08-17T00:00:00Z",
                }
            ],
        }

    async def no_delay(_seconds):
        return None

    client = FakeClient(
        {
            harness.WS_LIBRARY_LIST: library_listing,
            harness.WS_LIBRARY_DELETE: {"deleted": True},
        }
    )
    validator = harness.EffectStudioValidator(
        client,
        FakeRest(),
        identity_entry_id="entry-secret",
        identity_model="H617A",
    )
    monkeypatch.setattr(harness.asyncio, "sleep", no_delay)

    await validator.cleanup_item("temporary-item")

    assert list_calls == 2


async def test_restoration_replays_controls_and_verifies_the_original_light_state():
    original_states = [
        {
            "entity_id": "number.cupboard_level",
            "state": "12",
            "attributes": {},
        },
        {
            "entity_id": "select.cupboard_mode",
            "state": "full",
            "attributes": {},
        },
        {
            "entity_id": "switch.cupboard_option",
            "state": "off",
            "attributes": {},
        },
        {
            "entity_id": "light.cupboard",
            "state": "on",
            "attributes": {
                "brightness": 128,
                "effect": "off",
                "color_mode": "rgb",
                "rgb_color": [1, 2, 3],
            },
        },
    ]
    client = FakeClient({"get_states": lambda _: original_states})
    validator = harness.EffectStudioValidator(
        client,
        FakeRest(),
        identity_entry_id="entry-secret",
        identity_model="H617A",
    )
    validator.selection = harness.DeviceSelection(
        "entry-secret",
        "H617A",
        "Cupboard",
        "light.cupboard",
        tuple(state["entity_id"] for state in original_states),
    )

    await validator.restore_states(original_states)

    service_calls = [call for call in client.calls if call["type"] == "call_service"]
    assert [(call["domain"], call["service"]) for call in service_calls] == [
        ("number", "set_value"),
        ("select", "select_option"),
        ("switch", "turn_off"),
        ("light", "turn_on"),
    ]
    assert service_calls[-1]["service_data"] == {
        "brightness": 128,
        "rgb_color": [1, 2, 3],
    }


def test_light_restoration_prefers_an_active_effect_over_stale_colour_attributes():
    assert harness._light_restore_data(
        {
            "state": "on",
            "attributes": {
                "brightness": 128,
                "effect": "Rainbow",
                "color_mode": "rgb",
                "rgb_color": [1, 2, 3],
            },
        }
    ) == {
        "brightness": 128,
        "effect": "Rainbow",
    }


def test_light_state_matching_uses_effect_identity_and_brightness_tolerance():
    expected = {
        "state": "on",
        "attributes": {
            "brightness": 128,
            "effect": "Rainbow",
            "color_mode": "rgb",
            "rgb_color": [1, 2, 3],
        },
    }
    current = {
        "state": "on",
        "attributes": {
            "brightness": 129,
            "effect": "Rainbow",
            "color_mode": "rgb",
            "rgb_color": [8, 9, 10],
        },
    }

    assert harness._light_state_matches(expected, current) is True
    current["attributes"]["effect"] = "Sunset"
    assert harness._light_state_matches(expected, current) is False


async def test_restoration_verification_is_selection_independent_and_converges(monkeypatch):
    original_states = [
        {
            "entity_id": "light.cupboard",
            "state": "on",
            "attributes": {
                "brightness": 128,
                "effect": "off",
                "color_mode": "rgb",
                "rgb_color": [1, 2, 3],
            },
        }
    ]
    different_states = [
        {
            "entity_id": "light.cupboard",
            "state": "on",
            "attributes": {
                "brightness": 16,
                "effect": "off",
                "color_mode": "rgb",
                "rgb_color": [8, 9, 10],
            },
        }
    ]
    client = FakeClient({"get_states": [different_states, original_states]})
    validator = harness.EffectStudioValidator(
        client,
        FakeRest(),
        identity_entry_id="entry-secret",
        identity_model="H617A",
    )

    async def no_delay(_seconds):
        return None

    monkeypatch.setattr(harness.asyncio, "sleep", no_delay)

    await validator._verify_restored(original_states)

    assert [call["type"] for call in client.calls] == ["get_states", "get_states"]


class RunValidator:
    events: list[str] = []
    route_error: BaseException | None = None
    cleanup_error: BaseException | None = None
    restore_error: BaseException | None = None

    def __init__(self, client, rest, *, identity_entry_id, identity_model):
        self.client = client
        self.rest = rest
        self.identity_entry_id = identity_entry_id
        self.identity_model = identity_model
        self.selection = None
        self.temporary_item_id = None
        self.temporary_item_version = 1
        self.temporary_item_updated_at = ""

    async def verify_surfaces(self):
        self.events.append("verify")
        self.selection = harness.DeviceSelection(
            "entry-secret",
            "H617A",
            "Cupboard",
            "light.cupboard",
            ("light.cupboard",),
        )
        return self.selection

    async def subscribe(self):
        self.events.append("subscribe")

    def _selection(self):
        if self.selection is None:
            raise harness.ValidationError("selection unavailable")
        return self.selection

    async def capture_controllable_state(self):
        self.events.append("capture")
        return _original_run_states()

    async def create_and_update_temporary_effect(self):
        self.events.append("create")
        self.temporary_item_id = "temporary-item"
        self.temporary_item_version = 2
        self.temporary_item_updated_at = "2026-08-17T00:00:00Z"
        return harness.RunState("temporary-item", 2, self.temporary_item_updated_at, [])

    async def verify_persisted_item(self, _state):
        self.events.append("persisted")

    async def run_routes(self, _state):
        self.events.append("routes")
        if self.route_error is not None:
            raise self.route_error
        return [
            harness.RouteSummary(
                "single",
                "confirmed",
                "activation_match",
                "h617a_single",
            )
        ], ["operation-id"]

    async def verify_diagnostics(self, _operation_ids):
        self.events.append("diagnostics")
        return 2

    async def cleanup_item(self, _item_id):
        self.events.append("cleanup")
        if self.cleanup_error is not None:
            raise self.cleanup_error

    async def restore_states(self, _states):
        self.events.append(f"restore:{self.selection is not None}")
        if self.restore_error is not None:
            raise self.restore_error


def _original_run_states():
    return [
        {
            "entity_id": "light.cupboard",
            "state": "on",
            "attributes": {
                "brightness": 128,
                "effect": "off",
                "color_mode": "rgb",
                "rgb_color": [1, 2, 3],
            },
        }
    ]


def _prepare_run(monkeypatch, tmp_path: Path):
    RunValidator.events = []
    RunValidator.route_error = None
    RunValidator.cleanup_error = None
    RunValidator.restore_error = None
    state_path = tmp_path / "effect-studio-state.json"
    monkeypatch.setattr(harness, "STATE_PATH", state_path)
    monkeypatch.setattr(harness, "EffectStudioValidator", RunValidator)
    monkeypatch.setenv("EFFECT_STUDIO_CONFIG_ENTRY_ID", "entry-secret")
    monkeypatch.setenv("EFFECT_STUDIO_DEVICE_MODEL", "H617A")
    return state_path


async def test_run_all_reconnects_validates_cleans_and_restores(monkeypatch, tmp_path: Path):
    state_path = _prepare_run(monkeypatch, tmp_path)
    initial_client = FakeClient()
    reconnected_client = FakeClient()
    rest = FakeRest()

    async def connect():
        return initial_client, rest

    async def restart(client, returned_rest, **kwargs):
        assert client is initial_client
        assert returned_rest is rest
        assert kwargs == {
            "identity_entry_id": "entry-secret",
            "light_entity_id": "light.cupboard",
        }
        return reconnected_client, rest

    monkeypatch.setattr(harness, "_connect", connect)
    monkeypatch.setattr(harness, "_restart_home_assistant", restart)

    result = await harness._run(argparse.Namespace(stage="all"))

    assert result == {
        "stage": "all",
        "restart": "completed",
        "routes": [
            {
                "route": "single",
                "phase": "confirmed",
                "confidence": "activation_match",
                "content_kind": "h617a_single",
            }
        ],
        "retained_diagnostic_events": 2,
        "temporary_item": "removed",
        "restoration": "verified",
    }
    assert RunValidator.events == [
        "verify",
        "subscribe",
        "capture",
        "create",
        "verify",
        "subscribe",
        "persisted",
        "routes",
        "diagnostics",
        "cleanup",
        "restore:True",
    ]
    assert state_path.exists() is False
    assert reconnected_client.closed is True


async def test_run_before_restart_retains_recovery_state_and_selection(monkeypatch, tmp_path: Path):
    state_path = _prepare_run(monkeypatch, tmp_path)
    initial_client = FakeClient()
    reconnected_client = FakeClient()
    rest = FakeRest()

    async def connect():
        return initial_client, rest

    async def restart(_client, _rest, **_kwargs):
        return reconnected_client, rest

    monkeypatch.setattr(harness, "_connect", connect)
    monkeypatch.setattr(harness, "_restart_home_assistant", restart)

    result = await harness._run(argparse.Namespace(stage="before-restart"))

    assert result == {
        "stage": "before-restart",
        "restart": "completed",
        "temporary_item": "retained_for_after_restart",
        "restoration": "verified",
    }
    assert RunValidator.events == [
        "verify",
        "subscribe",
        "capture",
        "create",
        "restore:True",
    ]
    assert state_path.exists() is True


async def test_run_after_restart_uses_staged_state_and_removes_it(monkeypatch, tmp_path: Path):
    state_path = _prepare_run(monkeypatch, tmp_path)
    harness._write_state(
        harness.RunState(
            "temporary-item",
            2,
            "2026-08-17T00:00:00Z",
            _original_run_states(),
        )
    )
    client = FakeClient()
    rest = FakeRest()

    async def connect():
        return client, rest

    monkeypatch.setattr(harness, "_connect", connect)

    result = await harness._run(argparse.Namespace(stage="after-restart"))

    assert result["stage"] == "after-restart"
    assert RunValidator.events == [
        "verify",
        "subscribe",
        "persisted",
        "routes",
        "diagnostics",
        "cleanup",
        "restore:True",
    ]
    assert state_path.exists() is False


async def test_run_attempts_cleanup_and_surfaces_residual_errors(monkeypatch, tmp_path: Path):
    state_path = _prepare_run(monkeypatch, tmp_path)
    initial_client = FakeClient()
    reconnected_client = FakeClient()
    rest = FakeRest()
    RunValidator.route_error = harness.ValidationError("route validation failed")
    RunValidator.cleanup_error = harness.ValidationError("delete remained")
    RunValidator.restore_error = harness.ValidationError("light remained changed")

    async def connect():
        return initial_client, rest

    async def restart(_client, _rest, **_kwargs):
        return reconnected_client, rest

    monkeypatch.setattr(harness, "_connect", connect)
    monkeypatch.setattr(harness, "_restart_home_assistant", restart)

    with pytest.raises(harness.ValidationError) as error:
        await harness._run(argparse.Namespace(stage="all"))

    assert "route validation failed" in str(error.value)
    assert "temporary library cleanup failed" in str(error.value)
    assert "light restoration failed" in str(error.value)
    assert "cleanup" in RunValidator.events
    assert "restore:True" in RunValidator.events
    assert state_path.exists() is True


async def _async_value(value):
    return value
