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
    app_branch = body.split('if [ "$state_mode" = app ]; then', 1)[1].split("fi", 1)[0]
    assert "wda_down" in app_branch


def test_the_forward_is_launched_without_a_shell_function_wrapper():
    """Backgrounding the pmd3 FUNCTION records the subshell's pid, so the stop killed a
    wrapper and left the real forward orphaned on the port while reporting success."""
    body = (_PHONE_SH).read_text()
    launch = next(line for line in body.splitlines() if "usbmux forward" in line and line.rstrip().endswith("&"))
    assert "$PYMOBILEDEVICE3" in launch
    assert not launch.lstrip().startswith("pmd3 ")


def test_signal_names_used_here_exist():
    """Guards the test file itself: a typo'd signal would make the escalation case vacuous."""
    assert signal.SIGTERM and signal.SIGKILL
