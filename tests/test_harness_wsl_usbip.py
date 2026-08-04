"""Exercise the WSL app-capture ownership transition without touching a phone."""

import os
import subprocess
from pathlib import Path

_REPO = Path(__file__).parents[1]
_PHONE_SH = _REPO / "tools" / "harness" / "phone.sh"
_UP_SH = _REPO / "tools" / "harness" / "up.sh"
_DOWN_SH = _REPO / "tools" / "harness" / "down.sh"
_WDA_DAEMON = _REPO / "tools" / "harness" / "wda_daemon.py"
_IDENTITY = _REPO / "tools" / "harness" / "devices.local.env.example"


def _usbipd_rig(tmp_path: Path) -> tuple[Path, Path, Path, Path]:
    calls = tmp_path / "calls.log"
    phase = tmp_path / "phase"
    detached = tmp_path / "detached"
    usbipd = tmp_path / "usbipd"
    elevated = tmp_path / "elevated-usbipd"
    usbipd.write_text(
        """#!/bin/bash
set -eu
printf 'usbipd %s\\n' "$*" >> "$USBIPD_TEST_CALLS"
case "$1" in
  list)
    if [ -e "$USBIPD_TEST_DETACHED" ]; then
      busid=4-1
    elif [ -e "$USBIPD_TEST_PHASE" ]; then
      busid=3-1
    else
      busid=2-1
    fi
    printf 'Connected:\\nBUSID  VID:PID    DEVICE  STATE\\n%s    05AC:12A8  iPhone  Shared\\n' "$busid"
    ;;
  detach) [ ! -e "$USBIPD_TEST_PHASE" ] || touch "$USBIPD_TEST_DETACHED" ;;
  attach) ;;
esac
"""
    )
    elevated.write_text(
        """#!/bin/bash
set -eu
printf 'elevated %s\\n' "$*" >> "$USBIPD_TEST_CALLS"
[ "$1" != bind ] || touch "$USBIPD_TEST_PHASE"
"""
    )
    usbipd.chmod(0o755)
    elevated.chmod(0o755)
    return calls, phase, detached, usbipd


def _usbipd_env(tmp_path: Path, calls: Path, phase: Path, detached: Path, usbipd: Path) -> dict[str, str]:
    env = os.environ.copy()
    env.update(
        {
            "HARNESS_IDENTITY_FILE": str(_IDENTITY),
            "HARNESS_HOST_KIND": "wsl",
            "HARNESS_PHONE_BACKEND": "native",
            "HARNESS_BLE_BACKEND": "windows",
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "GOVEE_CAPTURE_DIR": str(tmp_path / "captures"),
            "PHONE_USBIPD_STATE_FILE": str(tmp_path / "iphone-usbipd.state"),
            "USBIPD": str(usbipd),
            "USBIPD_ELEVATED": str(tmp_path / "elevated-usbipd"),
            "USBIPD_TEST_CALLS": str(calls),
            "USBIPD_TEST_PHASE": str(phase),
            "USBIPD_TEST_DETACHED": str(detached),
            "USBIPD_WAIT_ATTEMPTS": "1",
            "USBIPD_WAIT_DELAY": "0",
        }
    )
    return env


def test_usbipd_resolves_the_reenumerated_busid_before_attach(tmp_path: Path):
    """Force binding re-enumerates the phone, so attach must use the newly listed BUSID."""
    calls, phase, detached, usbipd = _usbipd_rig(tmp_path)
    env = _usbipd_env(tmp_path, calls, phase, detached, usbipd)
    result = subprocess.run(  # noqa: S603
        [
            "/bin/bash",
            "-c",
            f'source "{_PHONE_SH}"; '
            'ensure_mux_serving_phone() { echo mux-serving >> "$USBIPD_TEST_CALLS"; }; '
            'phone_present() { [ -e "$USBIPD_TEST_PHASE" ] && echo PRESENT || echo ABSENT; }; '
            "phone_usbipd_acquire; phone_usbipd_release",
        ],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode == 0, result.stderr
    assert not (tmp_path / "iphone-usbipd.state").exists()
    sequence = calls.read_text().splitlines()
    assert sequence.index("elevated bind 05ac:12a8") < sequence.index("usbipd attach --wsl --busid 3-1")
    # The BUSID listed BEFORE the force bind, which force binding invalidated.
    assert "usbipd attach --wsl --busid 2-1" not in sequence
    # Ownership is only useful once the muxer will actually serve the phone.
    assert "mux-serving" in sequence


def _moving_busid_usbipd(tmp_path: Path) -> Path:
    """A usbipd whose list reports a DIFFERENT port each time it is asked."""
    stub = tmp_path / "usbipd-moving"
    stub.write_text(
        """#!/bin/bash
set -eu
printf 'usbipd %s\\n' "$*" >> "$USBIPD_TEST_CALLS"
[ "$1" = list ] || exit 0
seen="$(cat "$USBIPD_TEST_SEQ" 2>/dev/null || echo 0)"
seen=$((seen + 1))
printf '%s' "$seen" > "$USBIPD_TEST_SEQ"
[ "$seen" -le 1 ] && busid=1-2 || busid=11-1
printf 'Connected:\\nBUSID  VID:PID    DEVICE  STATE\\n%s    05AC:12A8  iPhone  Shared\\n' "$busid"
"""
    )
    stub.chmod(0o755)
    return stub


def test_attach_resolves_the_busid_itself_on_every_attempt(tmp_path: Path):
    """A BUSID names a hub port, not a phone, so it moves when the phone does.

    Observed on this rig: 1-2 for the whole morning, then 11-1 after a re-dock. Re-resolving
    inside the retry is what turns that move into a retry rather than an attach aimed at
    whatever now sits on the old port. `attach` is the only usbipd call here still given a
    BUSID at all, so it is the only one where the property has to be tested rather than read
    off the argument list.
    """
    calls, phase, detached, _ = _usbipd_rig(tmp_path)
    env = _usbipd_env(tmp_path, calls, phase, detached, _moving_busid_usbipd(tmp_path))
    env["USBIPD_TEST_SEQ"] = str(tmp_path / "list-count")
    env["USBIPD_ATTACH_ATTEMPTS"] = "2"
    result = subprocess.run(  # noqa: S603
        [
            "/bin/bash",
            "-c",
            f'source "{_PHONE_SH}"; phone_present() {{ echo ABSENT; }}; attach_phone_to_wsl',
        ],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode != 0, "a phone that never reaches the USB tree is a failure"
    sequence = calls.read_text().splitlines()
    assert sequence.index("usbipd attach --wsl --busid 1-2") < sequence.index("usbipd attach --wsl --busid 11-1")


def test_usbipd_release_detaches_without_unbinding(tmp_path: Path):
    """The share is deliberately persistent.

    Binding is the only step needing elevation and it survives replugs and reboots, so
    unbinding on teardown would buy a UAC prompt on every single cycle and drop the stub
    driver that makes attach work at all. The cost, which is accepted rather than hidden:
    a force-bound phone is not returned to Windows by a detach, so iTunes/AMDS will not
    see it again until someone unbinds by hand.
    """
    calls, phase, detached, usbipd = _usbipd_rig(tmp_path)
    env = _usbipd_env(tmp_path, calls, phase, detached, usbipd)
    result = subprocess.run(  # noqa: S603
        [
            "/bin/bash",
            "-c",
            f'source "{_PHONE_SH}"; '
            'ensure_mux_serving_phone() { echo mux-serving >> "$USBIPD_TEST_CALLS"; }; '
            'phone_present() { [ -e "$USBIPD_TEST_PHASE" ] && echo PRESENT || echo ABSENT; }; '
            "phone_usbipd_acquire; phone_usbipd_release",
        ],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode == 0, result.stderr
    sequence = calls.read_text().splitlines()
    assert "usbipd detach --hardware-id 05ac:12a8" in sequence
    assert not any(call.startswith("elevated unbind") for call in sequence)


def test_usbipd_acquire_adopts_an_attached_phone_without_touching_ownership(tmp_path: Path):
    """Detaching and re-binding a working attachment is the one move guaranteed to break it.

    The stub driver only takes over on re-enumeration, so cycling ownership is not free even
    when it succeeds, and an already-attached phone is already the goal state.
    """
    calls, phase, detached, usbipd = _usbipd_rig(tmp_path)
    env = _usbipd_env(tmp_path, calls, phase, detached, usbipd)
    result = subprocess.run(  # noqa: S603
        [
            "/bin/bash",
            "-c",
            f'source "{_PHONE_SH}"; '
            'ensure_mux_serving_phone() { echo mux-serving >> "$USBIPD_TEST_CALLS"; }; '
            "phone_present() { echo PRESENT; }; "
            "phone_usbipd_acquire",
        ],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode == 0, result.stderr
    sequence = calls.read_text().splitlines()
    assert not any(call.startswith("elevated") for call in sequence)
    assert not any(call.startswith("usbipd attach") for call in sequence)
    assert not any(call.startswith("usbipd detach") for call in sequence)
    assert "mux-serving" in sequence


def test_usbipd_force_bind_is_the_only_elevated_acquire_step():
    body = _PHONE_SH.read_text()
    assert '@("bind", "--force", "--hardware-id", $env:IPHONE_USB_HARDWARE_ID)' in body
    assert "-Verb RunAs -Wait -PassThru" in body


def _app_phone_stub() -> str:
    return """#!/usr/bin/env bash
set -eu
mkdir -p "$HARNESS_RUN_DIR"
printf 'source phone=%s rsd=%s capture=%s\\n' \
  "$HARNESS_PHONE_BACKEND" "$HARNESS_RSD_BACKEND" "$GOVEE_CAPTURE_BACKEND" >> "$CALL_LOG"
GOVEE_APP_PROCESS=GoveeHome
resolve_device() {
  DEVICE_NAME="${1:-tv}"
  DEVICE_ENTRY="entry-$DEVICE_NAME"
  DEVICE_SKU=H6199
  DEVICE_EXPECTED_PEER=D5:36:36:DD:EE:FF
}
phone_usbipd_acquire() { echo acquire-usb >> "$CALL_LOG"; }
phone_usbipd_release() { echo release-usb >> "$CALL_LOG"; }
require_phone() {
  echo require-phone >> "$CALL_LOG"
  [ -z "${FAIL_REQUIRE_PHONE:-}" ]
}
mount_developer_image() { echo mount-image >> "$CALL_LOG"; }
require_developer_image() { echo require-developer-image >> "$CALL_LOG"; }
tunnel_up() { echo tunnel-up >> "$CALL_LOG"; }
require_unlocked() { echo require-unlocked >> "$CALL_LOG"; }
hid_up() { echo hid-up >> "$CALL_LOG"; }
hid_down() { echo hid-down >> "$CALL_LOG"; }
tunnel_down() { echo tunnel-down >> "$CALL_LOG"; }
wda_up() { echo wda-up >> "$CALL_LOG"; }
wda_down() { echo wda-down >> "$CALL_LOG"; }
wda_activate_govee() { echo wda-activate-govee >> "$CALL_LOG"; }
dvt() { echo "dvt $*" >> "$CALL_LOG"; }
capture() { echo "capture $* backend=$GOVEE_CAPTURE_BACKEND" >> "$CALL_LOG"; }
ha_entry() {
  echo "ha-entry $1 $2" >> "$CALL_LOG"
  [ "$2" != disable ] || printf '{"success": true}\\n'
}
serve_web_url() { echo http://127.0.0.1:8080; }
shot() { echo "$HARNESS_RUN_DIR/$1.png"; }
"""


def test_wsl_app_mode_selects_native_wda_and_idevicebtlogger(tmp_path: Path):
    """App capture must not leave WDA on Windows after USB moves to WSL."""
    harness = tmp_path / "harness"
    harness.mkdir()
    (harness / "up.sh").write_text(_UP_SH.read_text())
    (harness / "phone.sh").write_text(_app_phone_stub())
    calls = tmp_path / "calls.log"
    env = os.environ.copy()
    env.update(
        {
            "HARNESS_HOST_KIND": "wsl",
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "HARNESS_STATE_FILE": str(tmp_path / "state"),
            "CALL_LOG": str(calls),
        }
    )
    env.pop("HARNESS_PHONE_BACKEND", None)
    env.pop("GOVEE_CAPTURE_BACKEND", None)

    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(harness / "up.sh"), "app", "tv"],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode == 0, result.stderr
    sequence = calls.read_text().splitlines()
    assert sequence[0] == "source phone=native rsd=userspace capture=idevicebtlogger"
    assert sequence.index("acquire-usb") < sequence.index("require-phone")
    assert "capture start session-tv-" in "\n".join(sequence)
    assert any(line.endswith("backend=idevicebtlogger") for line in sequence if line.startswith("capture start"))
    capture_index = next(index for index, line in enumerate(sequence) if line.startswith("capture start"))
    assert sequence.index("wda-up") < capture_index < sequence.index("wda-activate-govee")
    assert sequence.count("wda-activate-govee") == 1
    assert "restart_govee_app" not in _UP_SH.read_text()
    assert (tmp_path / "state").read_text().split()[3:] == ["native", "userspace"]


def test_wsl_wda_uses_its_own_userspace_rsd():
    body = _WDA_DAEMON.read_text()
    assert 'os.environ.get("HARNESS_RSD_BACKEND") == "userspace"' in body
    assert "UserspaceRsdTunnel(serial=UDID)" in body
    assert "get_tunneld_device_by_udid" in body


def test_failed_wsl_phone_setup_releases_usb_without_touching_home_assistant(tmp_path: Path):
    harness = tmp_path / "harness"
    harness.mkdir()
    (harness / "up.sh").write_text(_UP_SH.read_text())
    (harness / "phone.sh").write_text(_app_phone_stub())
    calls = tmp_path / "calls.log"
    env = os.environ.copy()
    env.update(
        {
            "HARNESS_HOST_KIND": "wsl",
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "HARNESS_STATE_FILE": str(tmp_path / "state"),
            "CALL_LOG": str(calls),
            "FAIL_REQUIRE_PHONE": "1",
        }
    )
    env.pop("HARNESS_PHONE_BACKEND", None)
    env.pop("GOVEE_CAPTURE_BACKEND", None)

    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(harness / "up.sh"), "app", "tv"],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode == 1
    sequence = calls.read_text().splitlines()
    assert sequence.index("acquire-usb") < sequence.index("require-phone") < sequence.index("release-usb")
    assert not any(call.startswith("ha-entry") for call in sequence)


def test_down_releases_wsl_phone_ownership_after_native_services(tmp_path: Path):
    """Ownership teardown is independent of the BLE entry it is handing back."""
    harness = tmp_path / "harness"
    harness.mkdir()
    (harness / "down.sh").write_text(_DOWN_SH.read_text())
    (harness / "phone.sh").write_text(
        """#!/usr/bin/env bash
set -eu
GOVEE_APP_PROCESS=GoveeHome
        printf 'source phone=%s rsd=%s\\n' "$HARNESS_PHONE_BACKEND" "$HARNESS_RSD_BACKEND" >> "$CALL_LOG"
        resolve_device() { DEVICE_NAME="${1:-tv}"; DEVICE_ENTRY="entry-$DEVICE_NAME"; }
dvt() { echo "dvt $*" >> "$CALL_LOG"; }
capture() { echo "capture $*" >> "$CALL_LOG"; }
wda_down() { echo wda-down >> "$CALL_LOG"; }
hid_down() { echo hid-down >> "$CALL_LOG"; }
tunnel_down() { echo tunnel-down >> "$CALL_LOG"; }
phone_usbipd_release() { echo release-usb >> "$CALL_LOG"; }
ha_entry() {
  echo "ha-entry $1 $2" >> "$CALL_LOG"
  [ "$2" = status ] && printf '{"state": "loaded", "disabled_by": null}\\n'
  return 0
}
"""
    )
    calls = tmp_path / "calls.log"
    state = tmp_path / "state"
    state.write_text("app tv entry-tv native userspace\n")
    env = os.environ.copy()
    env.update({"CALL_LOG": str(calls), "HARNESS_STATE_FILE": str(state)})

    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(harness / "down.sh")],
        capture_output=True,
        text=True,
        env=env,
        timeout=30,
    )

    assert result.returncode == 0, result.stderr
    sequence = calls.read_text().splitlines()
    assert sequence[0] == "source phone=native rsd=userspace"
    assert sequence.index("wda-down") < sequence.index("release-usb")
    assert "tunnel-down" not in sequence
    assert "ha-entry entry-tv enable" in sequence
    assert not any("strip" in call for call in sequence)
