"""Consistency checks for the user-facing metadata."""

from pathlib import Path

_COMPONENT = Path(__file__).resolve().parents[1] / "custom_components" / "ha_govee_led_ble"
_STRINGS = _COMPONENT / "strings.json"
_EN = _COMPONENT / "translations" / "en.json"


def test_strings_and_en_are_byte_identical():
    assert _STRINGS.read_bytes() == _EN.read_bytes()
