import json
import os
import subprocess
from datetime import datetime
from pathlib import Path

_REPO = Path(__file__).parents[1]
_SCRIPT = _REPO / "tools" / "ble" / "govee-capture.sh"
_PCAPNG_FIXTURE = _REPO / "tests" / "fixtures" / "govee_hci.pcapng"
_EMPTY_PCAPNG_FIXTURE = _REPO / "tests" / "fixtures" / "govee_hci_empty.pcapng"


def _capture_env(tmp_path: Path, pymobiledevice3: str = "/bin/false") -> dict[str, str]:
    env = os.environ.copy()
    env.update(
        {
            "GOVEE_CAPTURE_DIR": str(tmp_path / "captures"),
            "PYMOBILEDEVICE3": pymobiledevice3,
            "PREFLIGHT_SECONDS": "4",
        }
    )
    return env


def _stub_logger(tmp_path: Path, *, writes: bytes) -> str:
    """A stand-in for ``pymobiledevice3 btlogger capture`` that we control.

    It is invoked exactly as the real CLI is, so the argument handling, backgrounding and
    PID tracking under test are the real code paths; only the phone is replaced.
    """
    stub = tmp_path / "stub-pymobiledevice3"
    payload = tmp_path / "payload.bin"
    payload.write_bytes(writes)
    stub.write_text(
        "#!/bin/bash\n"
        # The version probe asks for help first; answer it the way 10.2.3 does, with no
        # `capture` subcommand, so the bare invocation is what gets exercised.
        'if [[ " $* " == *" --help "* ]]; then echo "Usage: pymobiledevice3 btlogger [OPTIONS] {out}"; exit 0; fi\n'
        'out="${@: -1}"\n'  # the output path is the last argument, as in the real CLI
        f'cat "{payload}" > "$out"\n'
        "sleep 60\n"
    )
    stub.chmod(0o755)
    return str(stub)


def _stop(tmp_path: Path, stub: str) -> None:
    if (tmp_path / "captures" / ".current").exists():
        subprocess.run(  # noqa: S603
            ["/bin/bash", str(_SCRIPT), "stop"],
            check=False,
            capture_output=True,
            env=_capture_env(tmp_path, stub),
        )


def test_mark_records_timestamped_batch_action(tmp_path: Path):
    captures = tmp_path / "captures"
    captures.mkdir()
    (captures / ".current").write_text(f"123 batch-run 2026-07-13T15:00:00+10:00 {'a' * 64}\n")

    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "mark", "Bloom", "Dynamic"],
        check=True,
        capture_output=True,
        text=True,
        env=_capture_env(tmp_path),
    )

    timestamp, label = (captures / "batch-run.actions.tsv").read_text().rstrip().split("\t", 1)
    assert datetime.fromisoformat(timestamp)
    assert label == "Bloom Dynamic"
    assert result.stdout.strip() == "marked 'Bloom Dynamic'"


def test_marks_carry_an_offset_so_they_can_be_compared_to_a_capture(tmp_path: Path):
    """A naive mark cannot be compared to a pcapng record without guessing a zone.

    analyse_capture slices at these marks. The old container dated its records in device
    wall clock, so a naive mark happened to line up; pcapng dates them truly, and it no
    longer does. The offset written here is what keeps that comparison an instant comparison.
    """
    captures = tmp_path / "captures"
    captures.mkdir()
    (captures / ".current").write_text("123 batch-run 2026-07-13T15:00:00+10:00 -\n")

    subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "mark", "Scene"],
        check=True,
        capture_output=True,
        text=True,
        env=_capture_env(tmp_path),
    )

    timestamp = (captures / "batch-run.actions.tsv").read_text().split("\t", 1)[0]
    assert datetime.fromisoformat(timestamp).tzinfo is not None


def test_mark_requires_active_capture(tmp_path: Path):
    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "mark", "Bloom Dynamic"],
        check=False,
        capture_output=True,
        text=True,
        env=_capture_env(tmp_path),
    )

    assert result.returncode == 1
    assert result.stdout.strip() == "no capture running"


def test_start_rejects_invalid_prediction_hash(tmp_path: Path):
    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "start", "batch-run", "not-a-hash"],
        check=False,
        capture_output=True,
        text=True,
        env=_capture_env(tmp_path),
    )

    assert result.returncode == 1
    assert "prediction SHA-256" in result.stderr


def test_start_refuses_a_capture_carrying_no_frames(tmp_path: Path):
    """The failure that cost a session on 2026-07-30, made loud.

    A missing Bluetooth logging profile leaves btlogger connecting cleanly and recording
    nothing. Note what that leaves on disk: not an empty file, but a well-formed pcapng of
    zero packets, because the writer emits its section and interface blocks up front. So
    checking that a file exists, or that it parses, or that it has a header, all pass. Only
    counting frames separates a dead stream from a quiet one.
    """
    stub = _stub_logger(tmp_path, writes=_EMPTY_PCAPNG_FIXTURE.read_bytes())
    result = subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "start", "empty-run"],
        check=False,
        capture_output=True,
        text=True,
        env=_capture_env(tmp_path, stub),
    )

    assert result.returncode == 1
    assert "no HCI frames" in result.stderr
    assert "Bluetooth logging" in result.stderr
    assert not (tmp_path / "captures" / ".current").exists()
    # The file the preflight rejected was a valid capture, not a broken one.
    assert (tmp_path / "captures" / "empty-run.pcapng").stat().st_size > 0


def test_start_uses_the_capture_subcommand_when_the_installed_cli_has_one(tmp_path: Path):
    """The invocation differs by version, and getting it wrong is not a soft failure.

    pymobiledevice3 10.2.3 takes ``btlogger [OPTIONS] {out}``; upstream moved it under a
    ``capture`` subcommand. Passing ``capture`` to 10.2.3 makes it the OUTPUT PATH, so the
    tool writes a file called ``capture`` and exits, which is what happened on 2026-07-30
    against the form both our note and the lab documentation recorded.
    """
    stub = tmp_path / "stub-pymobiledevice3"
    payload = tmp_path / "payload.bin"
    payload.write_bytes(_PCAPNG_FIXTURE.read_bytes())
    argv_log = tmp_path / "argv.log"
    stub.write_text(
        "#!/bin/bash\n"
        'if [[ " $* " == *" --help "* ]]; then printf "Commands:\\n  capture  Capture HCI\\n"; exit 0; fi\n'
        f'echo "$@" > "{argv_log}"\n'
        'out="${@: -1}"\n'
        f'cat "{payload}" > "$out"\n'
        "sleep 60\n"
    )
    stub.chmod(0o755)
    try:
        result = subprocess.run(  # noqa: S603
            ["/bin/bash", str(_SCRIPT), "start", "versioned-run"],
            check=False,
            capture_output=True,
            text=True,
            env=_capture_env(tmp_path, str(stub)),
        )
        assert result.returncode == 0, result.stderr
        assert argv_log.read_text().split()[:2] == ["btlogger", "capture"]
    finally:
        _stop(tmp_path, str(stub))


def test_start_accepts_a_capture_that_is_carrying_frames(tmp_path: Path):
    """Positive control for the check above: it has to be able to pass, or it proves nothing."""
    stub = _stub_logger(tmp_path, writes=_PCAPNG_FIXTURE.read_bytes())
    try:
        result = subprocess.run(  # noqa: S603
            ["/bin/bash", str(_SCRIPT), "start", "live-run"],
            check=False,
            capture_output=True,
            text=True,
            env=_capture_env(tmp_path, stub),
        )

        assert result.returncode == 0, result.stderr
        assert "recording 'live-run'" in result.stdout
        assert (tmp_path / "captures" / ".current").read_text().split()[1] == "live-run"
    finally:
        _stop(tmp_path, stub)


# The peer the committed pcapng fixture was built around, and one that is not in it.
_FIXTURE_PEER = "D0:35:34:AA:BB:CC"
_ABSENT_PEER = "D5:36:36:DD:EE:FF"


def _record_session(tmp_path: Path, name: str, *, expected_peer: str | None) -> subprocess.CompletedProcess[str]:
    """Start a capture over the committed fixture and stop it, returning stop's result."""
    stub = _stub_logger(tmp_path, writes=_PCAPNG_FIXTURE.read_bytes())
    env = _capture_env(tmp_path, stub)
    if expected_peer is not None:
        env["GOVEE_EXPECTED_PEER"] = expected_peer
    started = subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "start", name],
        check=False,
        capture_output=True,
        text=True,
        env=env,
    )
    assert started.returncode == 0, started.stderr
    return subprocess.run(  # noqa: S603
        ["/bin/bash", str(_SCRIPT), "stop"],
        check=False,
        capture_output=True,
        text=True,
        env=env,
    )


def test_a_session_for_a_light_that_never_appeared_is_a_failed_run(tmp_path: Path):
    """The quiet failure app-sniff sessions are prone to, made loud.

    The phone can be recording perfectly while the vendor app never reaches the light, or
    reaches it on a connection opened before recording started. Either way the decode comes
    out clean and holds nothing from the device the session was for, which reads as "it sent
    nothing" rather than "we did not capture it". Binding the capture to the address it is
    supposed to be of turns that into an error while the rig is still up to redo it.
    """
    result = _record_session(tmp_path, "wrong-light", expected_peer=_ABSENT_PEER)

    # 3 rather than 1, so down.sh can separate this from "no capture running", which it
    # has always tolerated on the path that hands the BLE link back.
    assert result.returncode == 3
    assert "not usable as evidence" in result.stderr
    assert "no captured peer" in result.stderr


def test_a_session_that_did_capture_its_light_passes_and_records_the_binding(tmp_path: Path):
    """Positive control: the check above can pass, and says which peer it was checked against."""
    result = _record_session(tmp_path, "right-light", expected_peer=_FIXTURE_PEER)

    assert result.returncode == 0, result.stderr
    meta = json.loads((tmp_path / "captures" / "right-light.meta.json").read_text())
    assert meta["expected_peer"] == _FIXTURE_PEER
    assert f"filtered to peer {_FIXTURE_PEER}" in result.stdout


def test_a_capture_with_no_expected_peer_still_decodes(tmp_path: Path):
    """Direct-mode and ad-hoc captures never set one, and must not start failing."""
    result = _record_session(tmp_path, "unbound", expected_peer=None)

    assert result.returncode == 0, result.stderr
    meta = json.loads((tmp_path / "captures" / "unbound.meta.json").read_text())
    assert meta["expected_peer"] is None
