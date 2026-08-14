import importlib.util
import json
import sys
from collections.abc import Callable
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
        return self.responses.pop(0)

    async def send(self, payload):
        self.sent.append(json.loads(payload))

    async def close(self):
        self.closed = True


class FakeClient:
    def __init__(self, responses: dict[str, Any] | None = None):
        self.responses = responses or {}
        self.calls = []
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
        self.readiness = iter((True, False, False, True))
        self.calls = 0

    async def ready(self):
        self.calls += 1
        return next(self.readiness)


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
        "schema_version": 5,
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
                "api_version": 2,
                "effect_schema_version": 1,
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
                    "apply_effect_snapshot": {},
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


async def test_restart_waits_for_rest_unavailability_before_accepting_readiness(monkeypatch):
    client = FakeClient()
    client.wait_event = lambda *args, **kwargs: _async_value({"event": {}})
    rest = RestartRest()

    async def no_delay(_seconds):
        return None

    monkeypatch.setattr(harness.asyncio, "sleep", no_delay)

    await harness._restart_home_assistant(client, rest)

    assert rest.calls == 4
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
        ("workshop", "applied", "write_completed"),
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


async def test_cleanup_removes_temporary_item_using_current_library_revisions():
    client = FakeClient(
        {
            harness.WS_LIBRARY_LIST: {
                "library_revision": 7,
                "items": [{"id": "temporary-item", "revision": 3}],
            },
            harness.WS_LIBRARY_DELETE: {"library_revision": 8},
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
        "expected_revision": 3,
        "expected_library_revision": 7,
    }
    assert validator.library_revision == 8


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
                "effect": "None",
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


async def _async_value(value):
    return value
