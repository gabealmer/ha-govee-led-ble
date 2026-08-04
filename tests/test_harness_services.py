"""Tests for the background-service lifecycle in phone.sh.

These exist because a teardown that reported success left an XCTest runner and a usbmux
forward alive on the phone and on port 8100. Two separate defects produced one symptom, and
neither was visible from the script's output: the stop never checked that the kill landed,
and the forward's pid file recorded a shell wrapper rather than the process holding the
socket. Every case below is about a stop being believed only when the process is actually
gone. None of them needs a phone.
"""

import os
import signal
import subprocess
import time
from pathlib import Path

import pytest

_REPO = Path(__file__).parents[1]
_PHONE_SH = _REPO / "tools" / "harness" / "phone.sh"


def _run(script: str, run_dir: Path) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["HARNESS_RUN_DIR"] = str(run_dir)
    env["HARNESS_PHONE_BACKEND"] = "native"
    env["HARNESS_BLE_BACKEND"] = "native"
    return subprocess.run(  # noqa: S603
        ["/bin/bash", "-c", f"source {_PHONE_SH}; {script}"],
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )


def _spawn(ignores_term: bool = False) -> int:
    """Start a process ORPHANED to init and return its pid.

    Deliberately not a child of pytest. stop_service kills processes it did not spawn, so a
    child of this test would sit as an unreaped zombie after the kill, kill -0 would keep
    succeeding, and the stop would report a failure that only the test setup caused. Orphaned
    is also what the real thing is: the shell that started the forward has long exited by the
    time down.sh reaches for it.
    """
    body = 'trap "" TERM; sleep 300' if ignores_term else "sleep 300"
    out = subprocess.run(  # noqa: S603
        ["/bin/bash", "-c", f"setsid bash -c '{body}' >/dev/null 2>&1 & echo $!"],
        capture_output=True,
        text=True,
        timeout=30,
        check=True,
    )
    pid = int(out.stdout.strip())
    for _ in range(50):
        if _alive(pid):
            return pid
        time.sleep(0.05)
    raise AssertionError("helper process never started")


def _alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    return True


def _wait_gone(pid: int, timeout: float = 10.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if not _alive(pid):
            return True
        time.sleep(0.05)
    return False


def _reap(pid: int) -> None:
    if _alive(pid):
        os.kill(pid, signal.SIGKILL)


@pytest.fixture
def run_dir(tmp_path):
    d = tmp_path / "run"
    d.mkdir()
    return d


def test_stop_service_kills_the_process_and_clears_the_pid_file(run_dir):
    pid = _spawn()
    (run_dir / "thing.pid").write_text(str(pid))
    try:
        result = _run("stop_service thing", run_dir)
        assert result.returncode == 0, result.stderr
        assert not (run_dir / "thing.pid").exists()
        assert _wait_gone(pid)
    finally:
        _reap(pid)


def test_stop_service_escalates_when_the_process_ignores_sigterm(run_dir):
    """The whole point of the fix. A process that swallows SIGTERM used to be reported as
    stopped, because removing the pid file was the entire stop."""
    pid = _spawn(ignores_term=True)
    time.sleep(0.5)  # let the trap install before the stop arrives
    (run_dir / "stubborn.pid").write_text(str(pid))
    try:
        result = _run("stop_service stubborn", run_dir)
        assert result.returncode == 0, result.stderr
        assert _wait_gone(pid)
    finally:
        _reap(pid)


def test_stop_service_is_quiet_when_there_is_no_pid_file(run_dir):
    result = _run("stop_service never-started", run_dir)
    assert result.returncode == 0
    assert result.stderr == ""


def test_stop_service_clears_a_pid_file_whose_process_is_already_gone(run_dir):
    """A stale pid file must not wedge a teardown, and must not linger either."""
    pid = _spawn()
    _reap(pid)
    assert _wait_gone(pid)
    (run_dir / "stale.pid").write_text(str(pid))
    result = _run("stop_service stale", run_dir)
    assert result.returncode == 0, result.stderr
    assert not (run_dir / "stale.pid").exists()


def test_wda_down_stops_both_the_runner_and_the_forward(run_dir):
    """They are separate processes on purpose, so stopping one is not stopping WDA. The
    forward holds port 8100 and the runner holds an automation session on the phone."""
    runner, forward = _spawn(), _spawn()
    (run_dir / "wda.pid").write_text(str(runner))
    (run_dir / "wda-forward.pid").write_text(str(forward))
    try:
        result = _run("wda_down", run_dir)
        assert result.returncode == 0, result.stderr
        assert _wait_gone(runner), "runner survived wda_down"
        assert _wait_gone(forward), "forward survived wda_down"
        assert not (run_dir / "wda.pid").exists()
        assert not (run_dir / "wda-forward.pid").exists()
    finally:
        _reap(runner)
        _reap(forward)


def test_down_sh_tears_wda_down_in_app_mode():
    """down.sh grew every other teardown and never grew this one, which is how the leak
    lasted. Asserted against the script because the alternative is standing a rig up."""
    body = (_REPO / "tools" / "harness" / "down.sh").read_text()
    phone_branch = body.split('if [ "$state_mode" != direct ]; then', 1)[1]
    assert "wda_down" in phone_branch


def test_ui_mode_starts_wda_without_starting_capture():
    body = (_REPO / "tools" / "harness" / "up.sh").read_text()
    ui_branch = body.split('elif [ "$mode" = ui ]; then', 1)[1].split("else", 1)[0]
    assert "wda_up" in ui_branch
    assert "capture start" not in ui_branch


def test_the_forward_is_launched_without_a_shell_function_wrapper():
    """Backgrounding the pmd3 FUNCTION records the subshell's pid, so the stop killed a
    wrapper and left the real forward orphaned on the port while reporting success."""
    body = (_PHONE_SH).read_text()
    launch = next(line for line in body.splitlines() if "usbmux forward" in line and line.rstrip().endswith("&"))
    assert "$PYMOBILEDEVICE3" in launch
    assert not launch.lstrip().startswith("pmd3 ")


def test_tunneld_keeps_the_wsl_usbmux_socket_through_sudo():
    body = _PHONE_SH.read_text()
    assert 'env USBMUXD_SOCKET_ADDRESS="$USBMUXD_SOCKET_ADDRESS"' in body


def test_developer_commands_use_userspace_rsd_when_wsl_owns_usb():
    body = _PHONE_SH.read_text()
    assert 'pmd3() { timeout "$PMD3_COMMAND_TIMEOUT"' in body
    assert 'pmd3 developer dvt "$@" --userspace' in body
    assert 'pmd3 developer dvt "$@" --tunnel "$PHONE_UDID"' in body
    assert '[ "$HARNESS_RSD_BACKEND" = userspace ] && return 0' in body
    assert '--http-port "$SERVE_WEB_PORT" --userspace' in body


def test_wsl_app_selects_userspace_before_phone_backend_is_loaded():
    body = (_REPO / "tools" / "harness" / "up.sh").read_text()
    backend_selection = body.split('source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"', 1)[0]
    assert "HARNESS_RSD_BACKEND=userspace" in backend_selection


def test_failed_stand_up_stops_tunneld():
    body = (_REPO / "tools" / "harness" / "up.sh").read_text()
    cleanup = body.split("cleanup_failed_standup() {", 1)[1].split("}", 1)[0]
    assert "tunnel_down" in cleanup
    assert "wda_down" in cleanup
    assert 'pkill "$GOVEE_APP_PROCESS"' in cleanup
    assert "|| echo" in cleanup


def test_down_keeps_cleanup_failures_nonfatal_until_ha_is_restored():
    body = (_REPO / "tools" / "harness" / "down.sh").read_text()
    assert "wda_down || {" in body
    assert "hid_down || {" in body
    assert body.index('ha_entry "$DEVICE_ENTRY" enable') < body.index('[ "$cleanup_status" = 0 ]')


def test_govee_send_runs_directly_when_no_host_wrapper_is_configured(tmp_path):
    log = tmp_path / "calls"
    uv = tmp_path / "uv"
    uv.write_text(f"#!/bin/sh\nprintf '%s\\n' \"$*\" > '{log}'\n")
    uv.chmod(0o755)

    env = os.environ.copy()
    env.update(
        {
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "HARNESS_PHONE_BACKEND": "native",
            "HARNESS_BLE_BACKEND": "native",
            "WITH_HOST_BLUETOOTH": "",
            "PATH": f"{tmp_path}:{env['PATH']}",
        }
    )
    result = subprocess.run(  # noqa: S603
        ["/bin/bash", "-c", f"source {_PHONE_SH}; govee_send send 'aa 01'"],
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )

    assert result.returncode == 0, result.stderr
    assert log.read_text().startswith("run --project ")
    assert "govee_send.py send aa 01" in log.read_text()


def test_signal_names_used_here_exist():
    """Guards the test file itself: a typo'd signal would make the escalation case vacuous."""
    assert signal.SIGTERM and signal.SIGKILL
