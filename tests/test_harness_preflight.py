"""Tests for harness prerequisite selection."""

import os
import subprocess
from pathlib import Path

_REPO = Path(__file__).parents[1]
_PREFLIGHT = _REPO / "tools" / "harness" / "preflight.sh"


def test_wsl_direct_preflight_loads_windows_ble_backend(tmp_path):
    identity = tmp_path / "devices.local.env"
    identity.write_text(
        """
PHONE_UDID=00008140-AAAABBBBCCCCDDDD
HA_WEBSOCKET_URL=wss://ha.example.invalid:8123/api/websocket
APPLE_TEAM_ID=ABCDE12345
WDA_RUNNER_BUNDLE_ID=com.example.WebDriverAgentRunner.xctrunner
declare -A DEVICE_HA_ENTRY=([tv]=01JCCCCCCCCCCCCCCCCCCCCCCC)
declare -A DEVICE_MODEL=([tv]=H6199)
declare -A DEVICE_BLE_ADDRESS=()
declare -A DEVICE_SNIFF_ADDRESS=([tv]=D5:36:36:DD:EE:FF)
DEVICE_DEFAULT=tv
""".strip()
        + "\n"
    )
    windows_python = tmp_path / "python.exe"
    windows_python.write_text("#!/bin/sh\nexit 0\n")
    windows_python.chmod(0o755)

    env = os.environ.copy()
    env.update(
        {
            "HARNESS_HOST_KIND": "wsl",
            "HARNESS_IDENTITY_FILE": str(identity),
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "GOVEE_CAPTURE_DIR": str(tmp_path / "captures"),
            "WSL_WINDOWS_TOOL_DIR": str(tmp_path / "windows"),
            "WINDOWS_CLIENT_PYTHON": str(windows_python),
        }
    )
    env.pop("HARNESS_PHONE_BACKEND", None)
    env.pop("HARNESS_BLE_BACKEND", None)

    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(_PREFLIGHT), "direct", "tv"],
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )

    assert result.returncode == 0, result.stderr
    assert "BLE backend: windows" in result.stdout
    assert "bluetooth: ready" in result.stdout
