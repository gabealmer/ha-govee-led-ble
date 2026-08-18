"""Prove down.sh hands the BLE link back whatever the capture turned out to be.

down.sh runs teardown in a deliberate order: the app is closed, the capture is stopped, and
only then is the Home Assistant entry re-enabled, with tunneld left until last because its
stop needs sudo and a failure there must not come between the device and its owner.

Stopping the capture now JUDGES it. govee-capture.sh exits 3 when the capture holds none of
the light's frames, which is a failed session rather than a null result. That verdict has to
be loud, because the teardown path used to send it to /dev/null, and it must not be fatal
where it runs, because the device is sitting with nobody holding its link at that point.
Those two requirements pull opposite ways, so both are asserted here by running the real
script against a stubbed rig rather than by reading it.
"""

import os
import subprocess
from pathlib import Path

import pytest

_REPO = Path(__file__).parents[1]
_DOWN_SH = _REPO / "tools" / "harness" / "down.sh"

_STUB_PHONE_SH = """
CALLS="$CALL_LOG"
HARNESS_STATE_FILE="$STATE_FILE"
GOVEE_APP_PROCESS=GoveeHome
HARNESS_RSD_BACKEND=tunneld
DEVICE_DEFAULT=tv

resolve_device() {{ DEVICE_NAME="${{1:-tv}}"; DEVICE_ENTRY=entry-$DEVICE_NAME; DEVICE_SKU=H6199; }}
pmd3() {{ echo "pmd3 $*" >> "$CALLS"; }}
wda_down() {{ echo "wda_down" >> "$CALLS"; return {cleanup_exit}; }}
hid_down() {{ echo "hid_down" >> "$CALLS"; return {cleanup_exit}; }}
tunnel_down() {{ echo "tunnel_down" >> "$CALLS"; }}
phone_usbipd_release() {{ echo "phone_usbipd_release" >> "$CALLS"; }}
capture() {{
  echo "capture $*" >> "$CALLS"
  echo "decode output on stdout"
  echo "capture 'x' is not usable as evidence about D5:36:36:DD:EE:FF" >&2
  return {capture_exit}
}}
ha_entry() {{
  echo "ha_entry $1 $2" >> "$CALLS"
  [ "$2" = status ] && printf '{entry_status}\\n'
  return 0
}}
"""

_ENTRY_LOADED = '{{"state": "loaded", "disabled_by": null}}'
_ENTRY_STUCK = '{{"state": "setup_retry", "disabled_by": null, "reason": "unreachable at setup"}}'


def _run_down(
    tmp_path: Path,
    *,
    capture_exit: int,
    entry_status: str = _ENTRY_LOADED,
    cleanup_exit: int = 0,
) -> tuple[subprocess.CompletedProcess[str], list[str]]:
    rig = tmp_path / "harness"
    rig.mkdir()
    (rig / "down.sh").write_text(_DOWN_SH.read_text())
    (rig / "phone.sh").write_text(
        _STUB_PHONE_SH.format(
            capture_exit=capture_exit,
            cleanup_exit=cleanup_exit,
            entry_status=entry_status,
        )
    )
    calls = tmp_path / "calls.log"
    state = tmp_path / "state"
    state.write_text("app tv entry-tv\n")

    env = os.environ.copy()
    env.update(
        {
            "CALL_LOG": str(calls),
            "STATE_FILE": str(state),
            "HARNESS_STATE_FILE": str(state),
            # The retry exists for a real race, but waiting it out here would add a minute
            # to the suite for a stub that will never change its answer.
            "HA_ENTRY_ATTEMPTS": "2",
            "HA_ENTRY_DELAY": "0",
        }
    )
    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(rig / "down.sh")],
        check=False,
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )
    return result, calls.read_text().splitlines() if calls.exists() else []


def _state_file(tmp_path: Path) -> Path:
    return tmp_path / "state"


def test_a_failed_capture_verdict_is_reported_after_link_restoration(tmp_path: Path):
    result, calls = _run_down(tmp_path, capture_exit=3)

    assert "ha_entry entry-tv enable" in calls
    assert calls.index("capture stop") < calls.index("ha_entry entry-tv enable")
    assert result.returncode == 1
    assert "not usable as evidence" in result.stderr
    assert "repeat the run" in result.stderr
    assert "entry loaded, disabled_by null" in result.stdout


def test_successful_capture_teardown_restores_entry_without_extra_polling(tmp_path: Path):
    result, calls = _run_down(tmp_path, capture_exit=0)

    assert result.returncode == 0, result.stderr
    assert "not usable as evidence" not in result.stderr
    assert "ha_entry entry-tv enable" in calls
    assert calls.count("ha_entry entry-tv status") == 1


@pytest.mark.parametrize("capture_exit", [1, 2])
def test_other_capture_failures_stay_tolerated(tmp_path: Path, capture_exit: int):
    """Only exit 3 means "this capture proves nothing". "No capture running" exits 1 and has
    always been survivable, so widening the check to any failure would break every teardown
    that runs without one."""
    result, calls = _run_down(tmp_path, capture_exit=capture_exit)

    assert result.returncode == 0, result.stderr
    assert "ha_entry entry-tv enable" in calls


def test_phone_cleanup_failure_restores_home_assistant_before_failing(tmp_path: Path):
    result, calls = _run_down(tmp_path, capture_exit=0, cleanup_exit=1)

    assert result.returncode == 1
    assert "wda_down" in calls and "hid_down" in calls
    assert calls.index("wda_down") < calls.index("ha_entry entry-tv enable")
    assert calls.index("hid_down") < calls.index("ha_entry entry-tv enable")
    assert "entry loaded, disabled_by null" in result.stdout


def test_an_entry_that_has_not_loaded_yet_completes_teardown_and_reports_failure(tmp_path: Path):
    result, calls = _run_down(tmp_path, capture_exit=0, entry_status=_ENTRY_STUCK)

    assert "phone_usbipd_release" in calls
    assert not _state_file(tmp_path).exists(), "a rig that is down must not look live"
    assert result.returncode == 1
    assert "has not loaded yet" in result.stderr
    assert "one BLE link" in result.stderr
    assert "entry loaded, disabled_by null" not in result.stdout
