"""Generated protocol inspection-tool tests."""

import shutil
import subprocess
import sys
from pathlib import Path

import pytest

from custom_components.ha_govee_led_ble.generated_protocol_adapter import (
    build_brightness_query,
    build_colour_mode_query,
    build_firmware_query,
    build_h6199_blank_screen_query,
    build_h6199_relative_brightness_query,
    build_h6199_subordinate_query,
    build_h6199_white_balance_query,
    build_hardware_query,
    build_power_query,
    build_segment_query,
)
from tools.ble.generated_protocol_view import describe_generated, query_frames

ROOT = Path(__file__).resolve().parents[1]


def test_protocol_view_runs_from_flat_windows_tool_copy(tmp_path: Path) -> None:
    shutil.copytree(ROOT / "custom_components/ha_govee_led_ble/generated_protocol", tmp_path / "generated_protocol")
    shutil.copy(ROOT / "tools/ble/generated_protocol_view.py", tmp_path)
    shutil.copy(ROOT / "tools/ble/govee_send.py", tmp_path)

    result = subprocess.run(  # noqa: S603 - fixed repository test script
        [
            sys.executable,
            str(tmp_path / "govee_send.py"),
            "build",
            "aa060000000000000000000000000000000000ac",
            "--checksum",
            "raw",
            "--model",
            "H6199",
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert "query firmware" in result.stdout


def test_generated_tool_queries_match_runtime_builders() -> None:
    assert dict(query_frames("H617A")) == {
        "power": build_power_query(),
        "brightness": build_brightness_query(),
        "colour_mode": build_colour_mode_query(),
        "firmware": build_firmware_query(),
        "hardware": build_hardware_query(),
        **{f"segments_{group}": build_segment_query(group) for group in range(1, 6)},
    }
    h6199 = dict(query_frames("H6199"))
    assert h6199["white_balance"] == build_h6199_white_balance_query()
    assert h6199["blank_screen"] == build_h6199_blank_screen_query()
    assert h6199["relative_brightness"] == build_h6199_relative_brightness_query()
    assert h6199["subordinate_20"] == build_h6199_subordinate_query(0x20)
    assert h6199["subordinate_21"] == build_h6199_subordinate_query(0x21)
    for group in range(1, 5):
        assert h6199[f"segments_{group}"] == build_segment_query(group, "H6199")
    labels = {name: describe_generated(frame, "TX", "H6199") for name, frame in h6199.items()}
    assert labels["white_balance"] == "query display_setting.white_balance"
    assert labels["blank_screen"] == "query display_setting.blank_screen"
    assert labels["relative_brightness"] == "query relative_brightness"
    assert labels["subordinate_20"] == "query subordinate_20"
    assert labels["subordinate_21"] == "query subordinate_21"
    assert labels["segments_4"] == "query segments group=4"


@pytest.mark.parametrize(("model", "maximum"), [("H617A", 5), ("H6199", 4)])
def test_segment_query_groups_are_model_bounded(model: str, maximum: int) -> None:
    assert build_segment_query(maximum, model)[2] == maximum
    with pytest.raises(ValueError, match=f"1 to {maximum}"):
        build_segment_query(maximum + 1, model)


def test_h6199_subordinate_queries_exclude_identity_domain() -> None:
    with pytest.raises(ValueError, match="0x20 or 0x21"):
        build_h6199_subordinate_query(0x14)
