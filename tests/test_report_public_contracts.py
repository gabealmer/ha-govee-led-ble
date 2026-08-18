"""Static public-contract inventory."""

from scripts.report_public_contracts import _json_key_paths, _service_names, _websocket_commands


def test_json_key_paths_include_nested_contracts() -> None:
    assert _json_key_paths({"config": {"error": "value"}, "title": "x"}) == [
        "config",
        "config.error",
        "title",
    ]


def test_service_and_websocket_names_are_stable() -> None:
    assert _service_names("paint_segments:\n  fields:\nset_value:\n") == [
        "paint_segments",
        "set_value",
    ]
    assert _websocket_commands('WS_INFO = f"{DOMAIN}/editor/info"\n') == [
        "ha_govee_led_ble/editor/info"
    ]
