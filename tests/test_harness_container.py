import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest

_REPO = Path(__file__).parents[1]
_CONTAINER_SH = _REPO / "tools" / "harness" / "container.sh"
_FAKE_DBUS_DIR = _REPO / ".harness" / f"test-dbus-{os.getpid()}"
_FAKE_PROXY_DBUS_DIR = _REPO / ".harness" / f"test-host-dbus-{os.getpid()}"
_FAKE_HCI_PATH = _REPO / ".harness" / f"test-hci-{os.getpid()}"

_PODMAN_STUB = r"""#!/usr/bin/env bash
set -euo pipefail
echo "podman $*" >> "$CALL_LOG"
if [ "${FAIL_PODMAN_RUNTIME:-0}" = 1 ] || [ -f "$FAKE_RUNTIME/podman-unavailable" ]; then
  exit 125
fi
case "$1" in
  info)
    [ "${FAIL_PODMAN_INFO:-0}" != 1 ] || exit 1
    echo crun
    ;;
  container)
    [ "$2" = exists ]
    [ "${FAIL_CONTAINER_EXISTS:-0}" != 1 ] || exit 125
    [ -f "$FAKE_RUNTIME/container" ]
    ;;
  inspect)
    [ "${FAIL_INSPECT:-0}" != 1 ] || exit 125
    if [[ "$*" == *"io.github.teh-hippo.ha-govee-led-ble.device"* ]]; then
      [ -f "$FAKE_RUNTIME/container" ] || exit 1
      echo strip
    elif [[ "$*" == *".State.Running"* ]]; then
      [ -f "$FAKE_RUNTIME/running" ] && echo true || echo false
    else
      echo healthy
    fi
    ;;
  run)
    if [[ " $* " == *" --rm "* ]]; then
      if [[ "$*" == *"bluetooth_adapters.dbus"* ]]; then
        [ "${FAIL_BLUETOOTH_ADAPTER_PREFLIGHT:-0}" != 1 ] || exit 1
      elif [[ "$*" == *"socket.AF_BLUETOOTH"* ]]; then
        [ "${PF_BLUETOOTH_UNAVAILABLE:-0}" != 1 ] || exit 1
      elif [[ "$*" == *"BleakScanner.find_device_by_address"* ]]; then
        cat >/dev/null
        if [ "${REQUIRE_HOUSEHOLD_DISABLED_FOR_SCAN:-0}" = 1 ]; then
          [ -f "$FAKE_RUNTIME/disabled" ] || exit 1
        fi
        [ "${FAIL_DIRECT_BLE_PREFLIGHT:-0}" != 1 ] || exit 1
      fi
      exit 0
    fi
    touch "$FAKE_RUNTIME/container" "$FAKE_RUNTIME/running"
    [ "${FAIL_PODMAN_AFTER_RUN:-0}" != 1 ] || touch "$FAKE_RUNTIME/podman-unavailable"
    echo fake-container-id
    ;;
  pull)
    ;;
  image)
    [ "$2" = inspect ]
    echo sha256:fake-image
    ;;
  stop)
    [ "${FAIL_STOP:-0}" != 1 ] || exit 1
    rm -f "$FAKE_RUNTIME/running"
    ;;
  rm)
    [ "${FAIL_REMOVE:-0}" != 1 ] || exit 1
    rm -f "$FAKE_RUNTIME/container" "$FAKE_RUNTIME/running"
    ;;
  restart)
    [ -f "$FAKE_RUNTIME/container" ]
    touch "$FAKE_RUNTIME/running"
    ;;
  logs)
    ;;
  *)
    exit 2
    ;;
esac
"""

_HOUSEHOLD_STUB = r"""#!/usr/bin/env bash
set -euo pipefail
echo "household $*" >> "$CALL_LOG"
case "$2" in
  status)
    if [ -f "$FAKE_RUNTIME/disabled" ]; then
      printf '{"state": "%s", "disabled_by": "user"}\n' "${HOUSEHOLD_DISABLED_STATE:-not_loaded}"
    else
      printf '{"state": "loaded", "disabled_by": null}\n'
    fi
    ;;
  disable)
    touch "$FAKE_RUNTIME/disabled"
    printf '{"success": true}\n'
    ;;
  enable)
    [ "${FAIL_ENABLE:-0}" != 1 ] || exit 1
    touch "$FAKE_RUNTIME/enable-started"
    sleep "${ENABLE_DELAY:-0}"
    rm -f "$FAKE_RUNTIME/disabled"
    printf '{"success": true}\n'
    ;;
esac
"""

_BUSCTL_STUB = r"""#!/usr/bin/env bash
set -euo pipefail
echo "busctl $*" >> "$CALL_LOG"
[ "${FAIL_BUSCTL:-0}" != 1 ] || exit 1
"""

_BLUETOOTH_WRAPPER_STUB = r"""#!/usr/bin/env bash
set -euo pipefail
echo "with-host-bluetooth $*" >> "$CALL_LOG"
export DBUS_SYSTEM_BUS_ADDRESS="unix:path=$FAKE_PROXY_DBUS_SOCKET"
export BLEAK_DBUS_AUTH_UID=-1
exec "$@"
"""

_API_STUB = r"""#!/usr/bin/env bash
set -euo pipefail
echo "isolated-api $*" >> "$CALL_LOG"
case "$1" in
  bootstrap)
    [ "${FAIL_BOOTSTRAP:-0}" != 1 ] || exit 1
    while [ "$#" -gt 0 ]; do
      if [ "$1" = --entry-id-file ]; then
        mkdir -p "$(dirname "$2")"
        printf 'isolated-entry\n' > "$2"
        break
      fi
      shift
    done
    printf '{"entry_id":"isolated-entry","state":"loaded"}\n'
    ;;
  status)
    printf '{"entry_id":"isolated-entry","state":"loaded","disabled_by":null}\n'
    ;;
  *)
    exit 2
    ;;
esac
"""


def _write_executable(path: Path, content: str) -> None:
    path.write_text(content)
    path.chmod(0o755)


@pytest.fixture(scope="module", autouse=True)
def _fake_host_bluetooth_transport():
    shutil.rmtree(_FAKE_DBUS_DIR, ignore_errors=True)
    shutil.rmtree(_FAKE_PROXY_DBUS_DIR, ignore_errors=True)
    shutil.rmtree(_FAKE_HCI_PATH, ignore_errors=True)
    _FAKE_DBUS_DIR.mkdir(parents=True)
    _FAKE_PROXY_DBUS_DIR.mkdir(parents=True)
    _FAKE_HCI_PATH.mkdir(parents=True)
    for socket_path in (
        _FAKE_DBUS_DIR / "system_bus_socket",
        _FAKE_PROXY_DBUS_DIR / "system_bus_socket",
    ):
        subprocess.run(  # noqa: S603
            [
                sys.executable,
                "-c",
                "import socket,sys; s=socket.socket(socket.AF_UNIX); s.bind(sys.argv[1]); s.close()",
                str(socket_path),
            ],
            check=True,
        )
    yield
    shutil.rmtree(_FAKE_DBUS_DIR, ignore_errors=True)
    shutil.rmtree(_FAKE_PROXY_DBUS_DIR, ignore_errors=True)
    shutil.rmtree(_FAKE_HCI_PATH, ignore_errors=True)


def _environment(tmp_path: Path) -> tuple[dict[str, str], Path, Path]:
    runtime = tmp_path / "runtime"
    runtime.mkdir()
    calls = tmp_path / "calls.log"
    identity = tmp_path / "devices.local.env"
    identity.write_text(
        """
PHONE_UDID=00008140-AAAABBBBCCCCDDDD
HA_WEBSOCKET_URL=wss://ha.example.invalid:8123/api/websocket
APPLE_TEAM_ID=ABCDE12345
WDA_RUNNER_BUNDLE_ID=com.example.WebDriverAgentRunner.xctrunner
HA_CONTAINER_USERNAME=developer
HA_CONTAINER_PASSWORD=local-test-password
declare -A DEVICE_HA_ENTRY=([strip]=01JAAAAAAAAAAAAAAAAAAAAAAA)
declare -A DEVICE_MODEL=([strip]=H617A)
declare -A DEVICE_BLE_ADDRESS=([strip]=D0:35:34:AA:BB:CC)
declare -A DEVICE_SNIFF_ADDRESS=()
declare -A DEVICE_HA_CONTAINER_ADDRESS=()
DEVICE_DEFAULT=strip
"""
    )
    podman = tmp_path / "podman"
    household = tmp_path / "household"
    api = tmp_path / "isolated-api"
    busctl = tmp_path / "busctl"
    _write_executable(podman, _PODMAN_STUB)
    _write_executable(household, _HOUSEHOLD_STUB)
    _write_executable(api, _API_STUB)
    _write_executable(busctl, _BUSCTL_STUB)
    container_root = tmp_path / "container-state"
    env = os.environ.copy()
    env.update(
        {
            "CALL_LOG": str(calls),
            "FAKE_RUNTIME": str(runtime),
            "HARNESS_IDENTITY_FILE": str(identity),
            "HA_CONTAINER_ROOT": str(container_root),
            "PODMAN": str(podman),
            "HA_CONTAINER_HOUSEHOLD_COMMAND": str(household),
            "HA_CONTAINER_API_COMMAND": str(api),
            "HA_CONTAINER_BUSCTL": str(busctl),
            "HA_CONTAINER_HCI_PATH": str(_FAKE_HCI_PATH),
            "HARNESS_HOST_KIND": "linux",
            "WITH_HOST_BLUETOOTH": "",
            "DBUS_SYSTEM_BUS_ADDRESS": f"unix:path={_FAKE_DBUS_DIR}/system_bus_socket",
            "HA_ENTRY_ATTEMPTS": "1",
            "HA_ENTRY_DELAY": "0",
            "HA_ENTRY_DISABLE_ATTEMPTS": "1",
            "HA_ENTRY_DISABLE_DELAY": "0",
        }
    )
    env.pop("BLEAK_DBUS_AUTH_UID", None)
    return env, calls, container_root


def _enable_host_bluez_proxy(env: dict[str, str], tmp_path: Path) -> Path:
    wrapper = tmp_path / "with-host-bluetooth"
    _write_executable(wrapper, _BLUETOOTH_WRAPPER_STUB)
    env.update(
        {
            "HARNESS_HOST_KIND": "lab",
            "WITH_HOST_BLUETOOTH": str(wrapper),
            "FAKE_PROXY_DBUS_SOCKET": str(_FAKE_PROXY_DBUS_DIR / "system_bus_socket"),
            "PF_BLUETOOTH_UNAVAILABLE": "1",
            "REQUIRE_HOUSEHOLD_DISABLED_FOR_SCAN": "1",
        }
    )
    return wrapper


def _run(env: dict[str, str], *arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(  # noqa: S603
        ["/bin/bash", str(_CONTAINER_SH), *arguments],
        check=False,
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )


def test_dry_run_describes_pinned_host_container_without_changing_ownership(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env["DBUS_SYSTEM_BUS_ADDRESS"] = ""

    result = _run(env, "--dry-run", "up", "strip")

    assert result.returncode == 0, result.stderr
    assert "ghcr.io/home-assistant/home-assistant:2026.8.1" in result.stdout
    assert "--network host" in result.stdout
    assert "/run/dbus:/run/dbus:ro" in result.stdout
    assert "DBUS_SYSTEM_BUS_ADDRESS=unix:path=/run/dbus/system_bus_socket" in result.stdout
    assert "BLEAK_DBUS_AUTH_UID" not in result.stdout
    assert "HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH" not in result.stdout
    assert "HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK" not in result.stdout
    assert "BleakScanner.find_device_by_address" not in result.stdout
    assert "container_python" not in result.stdout
    assert "--privileged" not in result.stdout
    assert "urlopen\\(\\'http://127.0.0.1:8123/\\'" in result.stdout
    assert "/api/onboarding" not in result.stdout
    assert (
        f"{_REPO}/custom_components/ha_govee_led_ble:/config/custom_components/ha_govee_led_ble:ro"
    ) in result.stdout
    assert "HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL" not in result.stdout
    assert "household-ha HOUSEHOLD_ENTRY_REDACTED disable" in result.stdout
    assert "01JAAAAAAAAAAAAAAAAAAAAAAA" not in result.stdout
    assert "D0:35:34:AA:BB:CC" not in result.stdout
    assert not calls.exists()
    assert not container_root.exists()


def test_down_stops_isolated_processes_before_restoring_household_owner(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    up = _run(env, "up", "strip")
    assert up.returncode == 0, up.stderr

    down = _run(env, "down", "strip")

    assert down.returncode == 0, down.stderr
    rows = calls.read_text().splitlines()
    stop_index = next(index for index, row in enumerate(rows) if row.startswith("podman stop"))
    remove_index = next(index for index, row in enumerate(rows) if row.startswith("podman rm"))
    enable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA enable")
    assert stop_index < remove_index < enable_index
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_image_is_pulled_and_verified_before_household_handover(tmp_path: Path) -> None:
    env, calls, _ = _environment(tmp_path)

    up = _run(env, "up", "strip")

    assert up.returncode == 0, up.stderr
    rows = calls.read_text().splitlines()
    pull_index = next(index for index, row in enumerate(rows) if row.startswith("podman pull"))
    inspect_index = next(index for index, row in enumerate(rows) if row.startswith("podman image inspect"))
    preflight_index = next(index for index, row in enumerate(rows) if row.startswith("podman run --rm"))
    disable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA disable")
    assert pull_index < inspect_index < preflight_index < disable_index
    assert "bluetooth_adapters.dbus" in rows[preflight_index]
    assert "get_bluetooth_adapter_details" in rows[preflight_index]
    assert not any("BleakScanner.find_device_by_address" in row for row in rows)
    assert not any("HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK" in row for row in rows)
    assert _run(env, "down", "strip").returncode == 0


def test_unusable_podman_fails_before_household_handover(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env["FAIL_PODMAN_INFO"] = "1"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    assert "cannot create its runtime namespace" in result.stderr
    assert not any(" disable" in row for row in calls.read_text().splitlines())
    assert not container_root.exists()


def test_bluez_adapter_call_completes_before_household_handover(tmp_path: Path) -> None:
    env, calls, _ = _environment(tmp_path)
    up = _run(env, "up", "strip")

    assert up.returncode == 0, up.stderr
    rows = calls.read_text().splitlines()
    busctl_index = next(index for index, row in enumerate(rows) if row.startswith("busctl "))
    disable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA disable")
    assert busctl_index < disable_index
    assert f"--address=unix:path={_FAKE_DBUS_DIR}/system_bus_socket" in rows[busctl_index]
    assert "org.bluez /org/bluez/hci0 org.bluez.Adapter1 Powered" in rows[busctl_index]
    assert _run(env, "down", "strip").returncode == 0


def test_direct_bluez_preflight_failure_stops_before_household_handover(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env["FAIL_BUSCTL"] = "1"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    rows = calls.read_text().splitlines()
    assert any(row.startswith("busctl --address=") for row in rows)
    assert not any(row.startswith("household ") for row in rows)
    assert not any(row.startswith("podman pull ") for row in rows)
    assert not container_root.exists()


def test_host_bluez_wrapper_sets_container_bus_and_authentication(tmp_path: Path) -> None:
    env, calls, _ = _environment(tmp_path)
    wrapper = _enable_host_bluez_proxy(env, tmp_path)
    env["HA_CONTAINER_HCI_PATH"] = str(tmp_path / "no-local-hci")

    up = _run(env, "up", "strip")

    assert up.returncode == 0, up.stderr
    rows = calls.read_text().splitlines()
    busctl_index = next(
        index for index, row in enumerate(rows) if row.startswith("with-host-bluetooth ") and " get-property " in row
    )
    adapter_index = next(index for index, row in enumerate(rows) if "bluetooth_adapters.dbus" in row)
    pf_index = next(index for index, row in enumerate(rows) if "socket.AF_BLUETOOTH" in row)
    discovery_index = next(index for index, row in enumerate(rows) if "BleakScanner.find_device_by_address" in row)
    disable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA disable")
    detach_index = next(index for index, row in enumerate(rows) if row.startswith("podman run --detach "))
    run_rows = [row for row in rows if row.startswith("podman run ")]
    assert busctl_index < disable_index
    assert adapter_index < pf_index < disable_index < discovery_index < detach_index
    assert f"with-host-bluetooth {env['HA_CONTAINER_BUSCTL']} --system get-property" in rows[busctl_index]
    assert len(run_rows) == 4
    for run_row in run_rows:
        assert f"{_FAKE_PROXY_DBUS_DIR}:{_FAKE_PROXY_DBUS_DIR}:ro" in run_row
        assert f"DBUS_SYSTEM_BUS_ADDRESS=unix:path={_FAKE_PROXY_DBUS_DIR}/system_bus_socket" in run_row
        assert "BLEAK_DBUS_AUTH_UID=-1" in run_row
        assert f"{_REPO}/tools/harness/container_python:/opt/ha-govee-led-ble-harness:ro" in run_row
        assert "PYTHONPATH=/opt/ha-govee-led-ble-harness" in run_row
        assert "HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH=1" in run_row
    fallback_rows = [
        row
        for row in run_rows
        if "BleakScanner.find_device_by_address" in row or row.startswith("podman run --detach ")
    ]
    assert len(fallback_rows) == 2
    assert all("HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK=1" in row for row in fallback_rows)
    assert all("HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK" not in row for row in run_rows if row not in fallback_rows)
    discovery_row = next(row for row in rows if "BleakScanner.find_device_by_address" in row)
    assert "D0:35:34:AA:BB:CC" not in discovery_row
    assert "BleakClient" not in discovery_row
    assert ".connect" not in discovery_row
    assert str(wrapper) == env["WITH_HOST_BLUETOOTH"]
    assert _run(env, "down", "strip").returncode == 0


def test_host_bluez_wrapper_dry_run_reports_proxy_args_without_device_identity(tmp_path: Path) -> None:
    env, _, container_root = _environment(tmp_path)
    wrapper = _enable_host_bluez_proxy(env, tmp_path)

    result = _run(env, "--dry-run", "up", "strip")

    assert result.returncode == 0, result.stderr
    assert f"{wrapper} {env['HA_CONTAINER_BUSCTL']} --system get-property" in result.stdout
    assert f"{_FAKE_PROXY_DBUS_DIR}:{_FAKE_PROXY_DBUS_DIR}:ro" in result.stdout
    assert f"DBUS_SYSTEM_BUS_ADDRESS=unix:path={_FAKE_PROXY_DBUS_DIR}/system_bus_socket" in result.stdout
    assert "BLEAK_DBUS_AUTH_UID=-1" in result.stdout
    assert f"{_REPO}/tools/harness/container_python:/opt/ha-govee-led-ble-harness:ro" in result.stdout
    assert "HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH=1" in result.stdout
    assert "HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK=1" in result.stdout
    assert "BleakScanner.find_device_by_address" in result.stdout
    assert "01JAAAAAAAAAAAAAAAAAAAAAAA" not in result.stdout
    assert "D0:35:34:AA:BB:CC" not in result.stdout
    rows = result.stdout.splitlines()
    disable_index = next(
        index for index, row in enumerate(rows) if "household-ha HOUSEHOLD_ENTRY_REDACTED disable" in row
    )
    discovery_index = next(index for index, row in enumerate(rows) if "BleakScanner.find_device_by_address" in row)
    assert disable_index < discovery_index
    assert not container_root.exists()


def test_host_bluez_wrapper_failure_stops_before_household_handover(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    _enable_host_bluez_proxy(env, tmp_path)
    env["FAIL_BUSCTL"] = "1"
    env["HA_CONTAINER_HCI_PATH"] = str(tmp_path / "no-local-hci")

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    rows = calls.read_text().splitlines()
    assert any(row.startswith("with-host-bluetooth ") and " get-property " in row for row in rows)
    assert not any(row.startswith("household ") for row in rows)
    assert not any(row.startswith("podman pull ") for row in rows)
    assert not container_root.exists()


def test_configured_host_dbus_address_sets_proxy_container_args(tmp_path: Path) -> None:
    env, _, _ = _environment(tmp_path)
    env.update(
        {
            "DBUS_SYSTEM_BUS_ADDRESS": f"unix:path={_FAKE_PROXY_DBUS_DIR}/system_bus_socket",
            "BLEAK_DBUS_AUTH_UID": "-1",
            "HA_CONTAINER_HCI_PATH": str(tmp_path / "no-local-hci"),
        }
    )

    result = _run(env, "--dry-run", "up", "strip")

    assert result.returncode == 0, result.stderr
    assert f"{_FAKE_PROXY_DBUS_DIR}:{_FAKE_PROXY_DBUS_DIR}:ro" in result.stdout
    assert f"DBUS_SYSTEM_BUS_ADDRESS=unix:path={_FAKE_PROXY_DBUS_DIR}/system_bus_socket" in result.stdout
    assert "BLEAK_DBUS_AUTH_UID=-1" in result.stdout
    assert "HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH=1" in result.stdout


def test_image_bluetooth_adapter_preflight_failure_stops_before_household_handover(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    _enable_host_bluez_proxy(env, tmp_path)
    env["FAIL_BLUETOOTH_ADAPTER_PREFLIGHT"] = "1"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    assert "bluetooth_adapters preflight did not authenticate to hci0" in result.stderr
    rows = calls.read_text().splitlines()
    assert any(row.startswith("podman run --rm ") for row in rows)
    assert not any(row.startswith("podman run --detach ") for row in rows)
    assert not any(row.startswith("household ") for row in rows)
    assert not (container_root / "current").exists()


def test_proxy_direct_ble_preflight_failure_restores_household_owner(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    _enable_host_bluez_proxy(env, tmp_path)
    env["FAIL_DIRECT_BLE_PREFLIGHT"] = "1"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    assert "direct Bleak discovery preflight did not find the selected device" in result.stderr
    rows = calls.read_text().splitlines()
    disable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA disable")
    discovery_index = next(index for index, row in enumerate(rows) if "BleakScanner.find_device_by_address" in row)
    enable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA enable")
    assert disable_index < discovery_index < enable_index
    assert not any(row.startswith("podman run --detach ") for row in rows)
    assert all("D0:35:34:AA:BB:CC" not in row for row in rows)
    assert "D0:35:34:AA:BB:CC" not in result.stdout
    assert "D0:35:34:AA:BB:CC" not in result.stderr
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_proxy_with_pf_bluetooth_does_not_enable_portable_resolver(tmp_path: Path) -> None:
    env, calls, _ = _environment(tmp_path)
    _enable_host_bluez_proxy(env, tmp_path)
    env["PF_BLUETOOTH_UNAVAILABLE"] = "0"

    up = _run(env, "up", "strip")

    assert up.returncode == 0, up.stderr
    rows = calls.read_text().splitlines()
    assert not any("BleakScanner.find_device_by_address" in row for row in rows)
    assert all("HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK" not in row for row in rows)
    assert _run(env, "down", "strip").returncode == 0


def test_failed_start_removes_container_and_restores_household_owner(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env["FAIL_BOOTSTRAP"] = "1"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    rows = calls.read_text().splitlines()
    disable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA disable")
    run_index = next(index for index, row in enumerate(rows) if row.startswith("podman run --detach"))
    remove_index = next(index for index, row in enumerate(rows) if row.startswith("podman rm"))
    enable_index = rows.index("household 01JAAAAAAAAAAAAAAAAAAAAAAA enable")
    assert disable_index < run_index < remove_index < enable_index
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "container").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_podman_unavailable_during_rollback_keeps_household_disabled_until_recovery(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env.update({"FAIL_BOOTSTRAP": "1", "FAIL_PODMAN_AFTER_RUN": "1"})

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    assert "Restore Podman access" in result.stderr
    assert (container_root / "current").read_text().startswith("container-stop-failed\tstrip\t")
    assert (tmp_path / "runtime" / "disabled").exists()
    assert (tmp_path / "runtime" / "running").exists()
    assert not any(row.endswith(" enable") for row in calls.read_text().splitlines())

    (tmp_path / "runtime" / "podman-unavailable").unlink()
    env.pop("FAIL_BOOTSTRAP")
    env.pop("FAIL_PODMAN_AFTER_RUN")
    recovered = _run(env, "down", "strip")

    assert recovered.returncode == 0, recovered.stderr
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()
    assert not (tmp_path / "runtime" / "container").exists()


def test_podman_unavailable_during_down_keeps_household_disabled_until_recovery(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    calls.write_text("")
    env["FAIL_PODMAN_RUNTIME"] = "1"

    failed = _run(env, "down", "strip")

    assert failed.returncode != 0
    assert "Restore Podman access" in failed.stderr
    assert (container_root / "current").read_text().startswith("container-stop-failed\tstrip\t")
    assert (tmp_path / "runtime" / "disabled").exists()
    assert not any(row.endswith(" enable") for row in calls.read_text().splitlines())

    env.pop("FAIL_PODMAN_RUNTIME")
    recovered = _run(env, "down", "strip")

    assert recovered.returncode == 0, recovered.stderr
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_inspect_error_during_down_blocks_restore_until_state_is_confirmed(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    calls.write_text("")
    env["FAIL_INSPECT"] = "1"

    failed = _run(env, "down", "strip")

    assert failed.returncode != 0
    assert "could not determine whether the isolated container is active" in failed.stderr
    assert (container_root / "current").read_text().startswith("container-stop-failed\tstrip\t")
    assert (tmp_path / "runtime" / "disabled").exists()
    assert not any(row.startswith("podman stop ") for row in calls.read_text().splitlines())
    assert not any(row.endswith(" enable") for row in calls.read_text().splitlines())

    env.pop("FAIL_INSPECT")
    assert _run(env, "down", "strip").returncode == 0
    assert not (tmp_path / "runtime" / "disabled").exists()


@pytest.mark.parametrize(
    ("failure_flag", "expected_success"),
    [
        ("FAIL_STOP", True),
        ("FAIL_REMOVE", False),
    ],
)
def test_stop_or_remove_failure_restores_only_after_confirmed_stopped_or_absent(
    tmp_path: Path,
    failure_flag: str,
    expected_success: bool,
) -> None:
    env, _, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    env[failure_flag] = "1"

    result = _run(env, "down", "strip")

    assert (result.returncode == 0) is expected_success
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()
    assert not (tmp_path / "runtime" / "running").exists()

    if failure_flag == "FAIL_REMOVE":
        assert (tmp_path / "runtime" / "container").exists()
        env.pop(failure_flag)
        assert _run(env, "down", "strip").returncode == 0
        assert not (tmp_path / "runtime" / "container").exists()


def test_failed_stop_and_remove_keep_household_disabled_until_later_recovery(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    calls.write_text("")
    env.update({"FAIL_STOP": "1", "FAIL_REMOVE": "1"})

    failed = _run(env, "down", "strip")

    assert failed.returncode != 0
    assert "still running; household HA remains disabled" in failed.stderr
    assert (container_root / "current").read_text().startswith("container-stop-failed\tstrip\t")
    assert (tmp_path / "runtime" / "disabled").exists()
    assert (tmp_path / "runtime" / "running").exists()
    assert not any(row.endswith(" enable") for row in calls.read_text().splitlines())

    env.pop("FAIL_STOP")
    env.pop("FAIL_REMOVE")
    recovered = _run(env, "down", "strip")

    assert recovered.returncode == 0, recovered.stderr
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_failed_start_rollback_ignores_termination_until_household_is_restored(tmp_path: Path) -> None:
    env, _, container_root = _environment(tmp_path)
    env.update({"FAIL_BOOTSTRAP": "1", "ENABLE_DELAY": "1"})
    process = subprocess.Popen(  # noqa: S603
        ["/bin/bash", str(_CONTAINER_SH), "up", "strip"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env,
    )
    enable_started = tmp_path / "runtime" / "enable-started"
    for _ in range(100):
        if enable_started.exists():
            break
        process.poll()
        if process.returncode is not None:
            break
        time.sleep(0.02)
    assert enable_started.exists()

    process.terminate()
    stdout, stderr = process.communicate(timeout=10)

    assert process.returncode != 0, (stdout, stderr)
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_handover_requires_not_loaded_after_household_disable(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env["HOUSEHOLD_DISABLED_STATE"] = "loaded"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    assert "state not_loaded" in result.stderr
    assert not any(row.startswith("podman run --detach") for row in calls.read_text().splitlines())
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_handover_rejects_household_require_restart(tmp_path: Path) -> None:
    env, calls, container_root = _environment(tmp_path)
    env["HOUSEHOLD_DISABLED_STATE"] = "require_restart"

    result = _run(env, "up", "strip")

    assert result.returncode != 0
    assert "requires a restart" in result.stderr
    assert not any(row.startswith("podman run --detach") for row in calls.read_text().splitlines())
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_failed_household_restore_keeps_retryable_ownership_state(tmp_path: Path) -> None:
    env, _, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    env["FAIL_ENABLE"] = "1"

    failed = _run(env, "down", "strip")

    assert failed.returncode != 0
    assert (container_root / "current").read_text().startswith("restore-failed\tstrip\t")

    env.pop("FAIL_ENABLE")
    retried = _run(env, "down", "strip")
    assert retried.returncode == 0, retried.stderr
    assert not (container_root / "current").exists()


def test_down_recovers_selected_device_from_container_label_when_state_is_missing(tmp_path: Path) -> None:
    env, _, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    (container_root / "current").unlink()

    recovered = _run(env, "down", "strip")

    assert recovered.returncode == 0, recovered.stderr
    assert "household owner restored" in recovered.stdout
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_failed_backend_restart_tears_down_and_restores_household_owner(tmp_path: Path) -> None:
    env, _, container_root = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    env["FAIL_BOOTSTRAP"] = "1"

    restarted = _run(env, "restart", "strip")

    assert restarted.returncode != 0
    assert not (container_root / "current").exists()
    assert not (tmp_path / "runtime" / "container").exists()
    assert not (tmp_path / "runtime" / "disabled").exists()


def test_status_reports_double_owner_conflict(tmp_path: Path) -> None:
    env, _, _ = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    (tmp_path / "runtime" / "disabled").unlink()

    status = _run(env, "status", "strip")

    assert status.returncode == 0, status.stderr
    assert "owner: CONFLICT: household and isolated Home Assistant are both active" in status.stdout
    assert _run(env, "down", "strip").returncode == 0


def test_status_reports_unknown_when_podman_inspection_fails(tmp_path: Path) -> None:
    env, _, _ = _environment(tmp_path)
    assert _run(env, "up", "strip").returncode == 0
    env["FAIL_INSPECT"] = "1"

    status = _run(env, "status", "strip")

    assert status.returncode == 0, status.stderr
    assert "owner: UNKNOWN: Podman could not inspect" in status.stdout
    assert "isolated container: running=unknown health=unknown" in status.stdout

    env.pop("FAIL_INSPECT")
    assert _run(env, "down", "strip").returncode == 0


def test_indexed_podman_prefix_preserves_argument_boundaries(tmp_path: Path) -> None:
    env, calls, _ = _environment(tmp_path)
    prefix = tmp_path / "podman-prefix"
    prefix.write_text(
        """#!/usr/bin/env bash
set -euo pipefail
{
  printf 'prefix'
  printf ' <%s>' "$@"
  printf '\\n'
} >> "$CALL_LOG"
exec "$@"
"""
    )
    prefix.chmod(0o755)
    identity = Path(env["HARNESS_IDENTITY_FILE"])
    identity.write_text(f'{identity.read_text()}\nHA_CONTAINER_PODMAN_COMMAND=("{prefix}" "{env["PODMAN"]}")\n')

    up = _run(env, "up", "strip")

    assert up.returncode == 0, up.stderr
    rows = calls.read_text().splitlines()
    assert any(row.startswith(f"prefix <{env['PODMAN']}> <pull> <--quiet> ") for row in rows)
    assert any(row.startswith(f"prefix <{env['PODMAN']}> <run> <--detach> ") for row in rows)
    assert any("<--health-cmd> <python3 -c " in row for row in rows)
    assert _run(env, "down", "strip").returncode == 0


def test_frontend_serves_panel_from_confined_root_with_narrow_cors(
    tmp_path: Path,
    socket_enabled,
) -> None:
    env, _, _ = _environment(tmp_path)
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    module_url = f"http://127.0.0.1:{port}/src/panel.ts"
    allowed_origin = "http://127.0.0.1:8123"
    env.update(
        {
            "HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL": module_url,
            "HA_CONTAINER_FRONTEND_ORIGIN": allowed_origin,
        }
    )

    started = _run(env, "frontend", "strip")
    try:
        assert started.returncode == 0, started.stderr
        with urlopen(Request(module_url, headers={"Origin": allowed_origin}), timeout=5) as response:
            assert response.status == 200
            assert response.headers["Access-Control-Allow-Origin"] == allowed_origin
            assert response.headers["Access-Control-Allow-Origin"] != "*"
        with urlopen(Request(module_url, headers={"Origin": "http://evil.example"}), timeout=5) as response:
            assert response.headers["Access-Control-Allow-Origin"] != "http://evil.example"
        confined_paths = (
            f"http://127.0.0.1:{port}/@fs/{_REPO}/pyproject.toml",
            f"http://127.0.0.1:{port}/@fs/{_REPO}/tools/harness/devices.local.env",
            f"http://127.0.0.1:{port}/@fs/{env['HARNESS_IDENTITY_FILE']}",
        )
        for confined_url in confined_paths:
            try:
                urlopen(confined_url, timeout=5)  # noqa: S310 - local test server.
            except HTTPError as err:
                assert err.code in {403, 404}
            else:
                raise AssertionError(f"Vite exposed a path outside frontend/: {confined_url}")
    finally:
        stopped = _run(env, "down", "strip")
        assert stopped.returncode == 0, stopped.stderr


def test_frontend_up_and_backend_restart_share_persistent_container_config(
    tmp_path: Path,
    socket_enabled,
) -> None:
    env, calls, container_root = _environment(tmp_path)
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    module_url = f"http://127.0.0.1:{port}/src/panel.ts"
    env["HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL"] = module_url
    config_dir = container_root / "devices" / "strip" / "config"
    storage_dir = config_dir / ".storage"
    storage_dir.mkdir(parents=True)
    storage_sentinel = storage_dir / "container-contract"
    storage_sentinel.write_text("persistent-storage\n")

    assert _run(env, "frontend", "strip").returncode == 0
    up = _run(env, "up", "strip")
    try:
        assert up.returncode == 0, up.stderr
        configuration = (config_dir / "configuration.yaml").read_text()
        entry_id = (container_root / "devices" / "strip" / "config-entry-id").read_text()

        restarted = _run(env, "restart", "strip")

        assert restarted.returncode == 0, restarted.stderr
        assert storage_sentinel.read_text() == "persistent-storage\n"
        assert (config_dir / "configuration.yaml").read_text() == configuration
        assert (container_root / "devices" / "strip" / "config-entry-id").read_text() == entry_id
        with urlopen(module_url, timeout=5) as response:  # noqa: S310 - local test server.
            assert response.status == 200
        rows = calls.read_text().splitlines()
        assert sum(row.startswith("podman run --detach ") for row in rows) == 1
        assert sum(row.startswith("podman run --rm ") for row in rows) == 1
        assert sum(row.startswith("podman restart ") for row in rows) == 1
        assert any(f"{config_dir}:/config:rw" in row for row in rows if row.startswith("podman run --detach "))
        assert any(
            f"HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL={module_url}" in row
            for row in rows
            if row.startswith("podman run --detach ")
        )
    finally:
        stopped = _run(env, "down", "strip")
        assert stopped.returncode == 0, stopped.stderr
    assert storage_sentinel.read_text() == "persistent-storage\n"
