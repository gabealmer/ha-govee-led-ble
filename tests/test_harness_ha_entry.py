import argparse
import importlib.util
import json
from pathlib import Path

import pytest

_SCRIPT = Path(__file__).parents[1] / "tools" / "harness" / "ha_entry.py"
_SPEC = importlib.util.spec_from_file_location("harness_ha_entry", _SCRIPT)
assert _SPEC is not None and _SPEC.loader is not None
ha = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(ha)


class FakeWebSocket:
    def __init__(self, responses):
        self.responses = [json.dumps(response) for response in responses]
        self.sent = []

    async def recv(self):
        return self.responses.pop(0)

    async def send(self, payload):
        self.sent.append(json.loads(payload))


async def test_client_authenticates_and_correlates_results():
    websocket = FakeWebSocket(
        [
            {"type": "auth_required"},
            {"type": "auth_ok"},
            {"type": "event", "id": 99},
            {"type": "result", "id": 1, "success": True, "result": {"ok": True}},
        ]
    )
    client = ha.HomeAssistantWebSocket(websocket)

    await client.authenticate("secret")
    result = await client.call({"type": "get_states"})

    assert websocket.sent == [
        {"type": "auth", "access_token": "secret"},
        {"type": "get_states", "id": 1},
    ]
    assert result["result"] == {"ok": True}


def test_resolve_entity_uses_entry_and_suffix_without_returning_an_ambiguous_match():
    entries = [
        {"config_entry_id": "one", "unique_id": "aabb_white_balance_red", "entity_id": "number.red"},
        {"config_entry_id": "two", "unique_id": "ccdd_white_balance_red", "entity_id": "number.other"},
    ]

    assert ha.resolve_entity(entries, "one", "white_balance_red")["entity_id"] == "number.red"
    with pytest.raises(ValueError, match="found 0"):
        ha.resolve_entity(entries, "one", "white_balance_blue")
    with pytest.raises(ValueError, match="found 2"):
        ha.resolve_entity([*entries, entries[0]], "one", "white_balance_red")


def test_resolve_entity_can_select_the_single_entity_in_a_domain():
    entries = [
        {"config_entry_id": "one", "unique_id": "aabb", "entity_id": "light.dreamview"},
        {"config_entry_id": "one", "unique_id": "aabb_music", "entity_id": "number.music"},
    ]

    assert ha.resolve_entity(entries, "one", "domain:light")["entity_id"] == "light.dreamview"


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        (
            "wss://ha.example:8123/api/websocket",
            "https://ha.example:8123/api/diagnostics/config_entry/entry",
        ),
        (
            "ws://localhost:8123/prefix/api/websocket",
            "http://localhost:8123/prefix/api/diagnostics/config_entry/entry",
        ),
    ],
)
def test_diagnostics_url_is_derived_from_the_configured_websocket(url, expected):
    assert ha.diagnostics_url(url, "entry") == expected


def test_diagnostics_url_rejects_an_unrelated_endpoint():
    with pytest.raises(ValueError, match="/api/websocket"):
        ha.diagnostics_url("https://ha.example/", "entry")


def test_service_data_accepts_only_json_objects():
    assert ha._service_data("") == {}
    assert ha._service_data('{"value": 17}') == {"value": 17}
    with pytest.raises(ValueError, match="JSON object"):
        ha._service_data("[17]")


def test_parser_preserves_the_existing_entry_commands_and_adds_control_commands():
    parser = ha._parser()
    assert parser.parse_args(["entry", "status"]).action == "status"
    call = parser.parse_args(["entry", "call", "number", "set_value", "white_balance_red"])
    assert vars(call) == {
        "entry_id": "entry",
        "action": "call",
        "domain": "number",
        "service": "set_value",
        "suffix": "white_balance_red",
    }
    wait = parser.parse_args(["entry", "wait", "white_balance_red", "17", "--timeout", "5"])
    assert isinstance(wait, argparse.Namespace)
    assert wait.timeout == 5
    enabled = parser.parse_args(["entry", "entity-enable", "relative_brightness_right"])
    assert enabled.action == "entity-enable"
