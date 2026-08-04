"""Tests for the DDI mount path and the usbmuxd wedge detector in phone.sh.

These exist because of a failure that took several sessions to name. The ~15 MB Developer
Disk Image upload cannot cross USB/IP: usbipd-win's user-mode timing lets bulk transfers
bunch up, the usbmux sequence counter desynchronises, and because no usbmuxd version handles
the device's type-4 complaint the session then wedges permanently rather than erroring.

Two properties follow, and both are asserted below:

* On WSL the upload must never be ATTEMPTED. Trying it is what breaks the muxer, so an
  already-mounted image has to short-circuit and an unmounted one has to go via Windows.
* The wedge must be named from the muxer's own log rather than inferred from a client
  timeout, because the log line is written the moment the link dies and a timeout costs
  PMD3_PROBE_TIMEOUT of silence and still says nothing about the cause.
"""

import os
import subprocess
from pathlib import Path

_REPO = Path(__file__).parents[1]
_PHONE_SH = _REPO / "tools" / "harness" / "phone.sh"
_UDID = "00008140-AAAABBBBCCCCDDDD"


def _run(
    script: str,
    tmp_path: Path,
    *,
    host_kind: str = "wsl",
    extra_env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.update(
        {
            "PHONE_UDID": _UDID,
            "PHONE_SYSFS_USB": str(tmp_path / "sysfs"),
            "HARNESS_HOST_KIND": host_kind,
            "HARNESS_PHONE_BACKEND": "native",
            "HARNESS_BLE_BACKEND": "native",
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "GOVEE_CAPTURE_DIR": str(tmp_path / "captures"),
            "PYMOBILEDEVICE3": "/bin/false",
        }
    )
    env.update(extra_env or {})
    return subprocess.run(  # noqa: S603
        ["/bin/bash", "-c", f"source {_PHONE_SH}\n{script}"],
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )


def _journal_stub(tmp_path: Path, output: str) -> Path:
    """A stand-in journalctl, since the real one needs a running usbmuxd to have failed."""
    stub = tmp_path / "journalctl"
    stub.write_text(f'#!/bin/bash\ncat <<"EOF"\n{output}\nEOF\n')
    stub.chmod(0o755)
    return stub


def _with_stub_path(tmp_path: Path) -> dict[str, str]:
    return {"PATH": f"{tmp_path}:{os.environ['PATH']}"}


def test_wedge_reason_names_the_sequence_desync(tmp_path):
    """Type 4 is the specific message, so it wins over the more general boundary error.

    Both appear in the same failure: the boundary error is logged first, the desync after.
    The desync is the one that says the link is unusable, so it must not be masked.
    """
    _journal_stub(
        tmp_path,
        "usbmuxd[1]: device_control_input: ERROR (on device): asyncReadComplete, "
        "message was too large (65536 bytes, max = 65535)\n"
        "usbmuxd[1]: device_control_input: Got unhandled payload type 4",
    )
    result = _run("mux_wedge_reason", tmp_path, extra_env=_with_stub_path(tmp_path))
    assert result.returncode == 0
    assert "sequence counter desynchronised" in result.stdout


def test_wedge_reason_names_a_lost_message_boundary(tmp_path):
    _journal_stub(
        tmp_path,
        "usbmuxd[1]: device_control_input: ERROR (on device): asyncReadComplete, "
        "message was too large (65536 bytes, max = 65535)",
    )
    result = _run("mux_wedge_reason", tmp_path, extra_env=_with_stub_path(tmp_path))
    assert result.returncode == 0
    assert "lost a mux message boundary" in result.stdout


def test_wedge_reason_stays_silent_on_a_healthy_log(tmp_path):
    """A detector that fires on an ordinary log would make every restart look like a wedge."""
    _journal_stub(
        tmp_path,
        "usbmuxd[1]: usbmuxd v1.1.1 starting up\nusbmuxd[1]: Connected to v2.0 device 1 on location 0x10002",
    )
    result = _run("mux_wedge_reason", tmp_path, extra_env=_with_stub_path(tmp_path))
    assert result.returncode != 0
    assert result.stdout.strip() == ""


def test_wsl_never_attempts_the_upload_when_the_image_is_mounted(tmp_path):
    """The short-circuit is the whole protection: attempting the upload is what breaks it."""
    calls = tmp_path / "calls"
    script = f"""
    developer_image_mounted() {{ echo checked >> {calls}; return 0; }}
    mount_developer_image() {{ echo MOUNT-ATTEMPTED >> {calls}; }}
    ensure_developer_image_via_windows() {{ echo WENT-TO-WINDOWS >> {calls}; }}
    require_developer_image
    """
    result = _run(script, tmp_path)
    assert result.returncode == 0
    recorded = calls.read_text()
    assert "MOUNT-ATTEMPTED" not in recorded
    assert "WENT-TO-WINDOWS" not in recorded


def test_wsl_routes_an_unmounted_image_to_windows_without_attempting_the_upload(tmp_path):
    calls = tmp_path / "calls"
    script = f"""
    developer_image_mounted() {{ return 1; }}
    mount_developer_image() {{ echo MOUNT-ATTEMPTED >> {calls}; }}
    ensure_developer_image_via_windows() {{ echo WENT-TO-WINDOWS >> {calls}; return 0; }}
    require_developer_image
    """
    result = _run(script, tmp_path)
    assert result.returncode == 0
    recorded = calls.read_text()
    assert "WENT-TO-WINDOWS" in recorded
    assert "MOUNT-ATTEMPTED" not in recorded


def test_a_non_wsl_host_still_mounts_locally(tmp_path):
    """Only USB/IP breaks the upload. A host that owns the phone directly must still mount."""
    calls = tmp_path / "calls"
    script = f"""
    developer_image_mounted() {{ [ -e {calls} ]; }}
    mount_developer_image() {{ echo MOUNT-ATTEMPTED >> {calls}; }}
    require_developer_image
    """
    result = _run(script, tmp_path, host_kind="lab")
    assert result.returncode == 0
    assert "MOUNT-ATTEMPTED" in calls.read_text()


def test_windows_handover_returns_the_phone_to_wsl_even_when_the_mount_fails(tmp_path):
    """A failure partway through must still hand an ATTACHED phone back.

    Restoring only the bind leaves the device attached to nothing, so the real fault (a
    phone that locked partway through) surfaces on the next run as an absent device.

    The attach stub takes no BUSID because attach_phone_to_wsl resolves its own: the
    force-bind inside the to-wsl handover re-enumerates the phone, so a BUSID passed in
    here would have been read before that.
    """
    calls = tmp_path / "calls"
    script = f"""
    USBIPD=/bin/true
    WINDOWS_PMD3_PYTHON=/bin/true
    windows_ddi_ownership() {{ echo "OWNERSHIP:$1" >> {calls}; return 0; }}
    wait_for_phone_on_windows() {{ return 0; }}
    mount_developer_image_on_windows() {{ echo MOUNT-FAILED >> {calls}; return 1; }}
    wait_for_phone_usbipd_busid() {{ echo 1-2; }}
    attach_phone_to_wsl() {{ echo ATTACHED >> {calls}; return 0; }}
    ensure_mux_serving_phone() {{ return 0; }}
    ensure_developer_image_via_windows
    """
    result = _run(script, tmp_path)
    assert result.returncode != 0, "a failed mount must still be reported as a failure"
    recorded = calls.read_text()
    assert "OWNERSHIP:to-windows" in recorded
    assert "OWNERSHIP:to-wsl" in recorded
    assert "ATTACHED" in recorded


def test_windows_handover_reports_success_only_when_the_mount_worked(tmp_path):
    calls = tmp_path / "calls"
    script = f"""
    USBIPD=/bin/true
    WINDOWS_PMD3_PYTHON=/bin/true
    windows_ddi_ownership() {{ return 0; }}
    wait_for_phone_on_windows() {{ return 0; }}
    mount_developer_image_on_windows() {{ echo MOUNTED >> {calls}; return 0; }}
    wait_for_phone_usbipd_busid() {{ echo 1-2; }}
    attach_phone_to_wsl() {{ echo ATTACHED >> {calls}; return 0; }}
    ensure_mux_serving_phone() {{ return 0; }}
    ensure_developer_image_via_windows
    """
    result = _run(script, tmp_path)
    assert result.returncode == 0
    assert "ATTACHED" in calls.read_text()


def test_windows_handover_waits_for_amds_to_see_the_phone(tmp_path):
    """AMDS does not have the phone the moment its service reports started.

    The unbind makes Windows re-enumerate and the service then has to notice. Going straight
    to the mount failed with "Device is not connected", which reads as an absent phone
    rather than as the few seconds of settling it was.
    """
    calls = tmp_path / "calls"
    script = f"""
    USBIPD=/bin/true
    WINDOWS_PMD3_PYTHON=/bin/true
    windows_ddi_ownership() {{ return 0; }}
    wait_for_phone_on_windows() {{ echo WAITED >> {calls}; return 1; }}
    mount_developer_image_on_windows() {{ echo MOUNT-ATTEMPTED >> {calls}; return 0; }}
    wait_for_phone_usbipd_busid() {{ echo 1-2; }}
    attach_phone_to_wsl() {{ return 0; }}
    ensure_mux_serving_phone() {{ return 0; }}
    ensure_developer_image_via_windows
    """
    result = _run(script, tmp_path)
    assert result.returncode != 0
    recorded = calls.read_text()
    assert "WAITED" in recorded
    assert "MOUNT-ATTEMPTED" not in recorded, "must not mount a phone Windows cannot see"


def test_windows_handover_refuses_without_windows_pymobiledevice3(tmp_path):
    """Naming the missing tool beats detaching the phone and failing anyway."""
    calls = tmp_path / "calls"
    script = f"""
    WINDOWS_PMD3_PYTHON={tmp_path}/absent-python.exe
    windows_ddi_ownership() {{ echo "OWNERSHIP:$1" >> {calls}; return 0; }}
    ensure_developer_image_via_windows
    """
    result = _run(script, tmp_path)
    assert result.returncode != 0
    assert not calls.exists()
    assert "not" in result.stderr.lower()
