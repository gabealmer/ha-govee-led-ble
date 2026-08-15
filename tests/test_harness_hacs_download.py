import importlib.util
import json
from pathlib import Path

import pytest

_SCRIPT = Path(__file__).parents[1] / "tools" / "harness" / "hacs_download.py"
_SPEC = importlib.util.spec_from_file_location("harness_hacs_download", _SCRIPT)
assert _SPEC is not None and _SPEC.loader is not None
hacs_download = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(hacs_download)


class FakeWebSocket:
    def __init__(self, responses):
        self.responses = [json.dumps(response) for response in responses]
        self.sent = []

    async def recv(self):
        return self.responses.pop(0)

    async def send(self, payload):
        self.sent.append(json.loads(payload))


async def test_client_authenticates_and_correlates_results(monkeypatch):
    monkeypatch.setenv("HA_TOKEN", "secret")
    websocket = FakeWebSocket(
        [
            {"type": "auth_required"},
            {"type": "auth_ok"},
            {"type": "event", "id": 99},
            {"type": "result", "id": 1, "success": True, "result": {"ok": True}},
        ]
    )
    client = hacs_download.HomeAssistantWebSocket(websocket)

    await client.authenticate()
    result = await client.call({"type": "get_panels"})

    assert websocket.sent == [
        {"type": "auth", "access_token": "secret"},
        {"type": "get_panels", "id": 1},
    ]
    assert result == {"ok": True}


def test_websocket_url_preserves_home_assistant_prefix():
    assert hacs_download._websocket_url("https://ha.example/prefix") == "wss://ha.example/prefix/api/websocket"


def test_repository_lookup_requires_one_exact_match():
    repository = {"id": "123", "full_name": "teh-hippo/ha-govee-led-ble"}

    assert (
        hacs_download._find_repository(
            [repository],
            "teh-hippo/ha-govee-led-ble",
        )
        == repository
    )
    with pytest.raises(RuntimeError, match="found 0"):
        hacs_download._find_repository([], "teh-hippo/ha-govee-led-ble")


def test_frontend_mode_requires_stable_loader_panel():
    panels = {
        "ha-govee-led-ble": {
            "config": {
                "_panel_custom": {
                    "module_url": "/ha_govee_led_ble_static/editor-loader.js",
                }
            }
        }
    }

    hacs_download._require_loader(panels)
    panels["ha-govee-led-ble"]["config"]["_panel_custom"]["module_url"] = (
        "/ha_govee_led_ble_static/effect-studio-bootstrap.old.js"
    )
    with pytest.raises(RuntimeError, match="restart-free frontend deployment is not active"):
        hacs_download._require_loader(panels)
