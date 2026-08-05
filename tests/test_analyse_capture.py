"""Prove the analyser reassembles ONE device's frames.

``decode_govee`` prints rows, so a second device there is a row an operator might read
wrongly. This tool CONCATENATES frames into a body, so a second device here is a body that
no device ever sent, arriving with a valid-looking length and no marking of any kind. It is
the tool the protocol conclusions are actually drawn with, so it gets the same guard.

Its ``--address`` filter used to keep records whose address was ``None`` alongside the
requested one, which on a capture that named nobody is every record in the file. The flag
therefore restricted nothing on exactly the captures it was reached for. The RX side was
not filtered at all, so a second connection's notifications were read as this device's
replies whatever was passed.
"""

import subprocess
import sys
from pathlib import Path

import pytest

from tests.hci_capture import (
    BRIGHTNESS,
    PEER_H617A,
    PEER_H6199,
    POWER_ON,
    STATUS,
    att,
    connect,
    notify,
    pcap,
    two_unnamed_connections,
    write,
)

_REPO = Path(__file__).parents[1]
_SCRIPT = _REPO / "tools" / "ble" / "analyse_capture.py"

# Two halves of one A3 upload, the shape reassembly cares about. Checksums are the XOR of
# the first nineteen bytes, which is what _is_govee tests.
A3_FIRST = bytes.fromhex("a300" + "11" * 17 + "00")
A3_LAST = bytes.fromhex("a3ff" + "22" * 17 + "00")


def _xor(frame: bytes) -> bytes:
    checksum = 0
    for byte in frame[:19]:
        checksum ^= byte
    return frame[:19] + bytes([checksum])


def _analyse(tmp_path: Path, name: str, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(  # noqa: S603
        [sys.executable, str(_SCRIPT), name, "--capture-dir", str(tmp_path), *args],
        check=False,
        capture_output=True,
        text=True,
    )


@pytest.fixture
def two_unnamed(tmp_path):
    (tmp_path / "mixed.pcap").write_bytes(two_unnamed_connections())
    return "mixed"


def test_a_capture_holding_two_connections_is_refused(tmp_path, two_unnamed):
    """A fused body is worse than a mixed listing: it looks like one device's answer."""
    result = _analyse(tmp_path, two_unnamed)
    assert result.returncode == 2
    assert "holds 2 Govee sources" in result.stderr
    assert "?conn-0x4e" in result.stdout


def test_narrowing_to_a_connection_is_the_way_past_the_refusal(tmp_path, two_unnamed):
    result = _analyse(tmp_path, two_unnamed, "--source", "0x4e", "--allow-unattributed")
    assert result.returncode == 0, result.stderr
    assert "33-writes: 2" in result.stdout


def test_an_unnamed_capture_is_refused_until_that_is_accepted(tmp_path):
    (tmp_path / "unnamed.pcap").write_bytes(pcap([write(0x004E, POWER_ON)]))
    result = _analyse(tmp_path, "unnamed")
    assert result.returncode == 2
    assert "cannot be attributed" in result.stderr


def test_an_address_filter_does_not_quietly_keep_frames_it_could_not_attribute(tmp_path):
    """The bug: unaddressed records were kept ALONGSIDE the requested peer, not instead of it.

    ``r.address in (args.address, None)`` reads like a filter and is not one. On a capture
    that named nobody every record has a ``None`` address, so the flag admitted the whole
    file, and on a partly named one it admitted whatever the capture could not place. Either
    way the operator asked for one device and got everything, with a header saying they had
    narrowed it.
    """
    (tmp_path / "partly.pcap").write_bytes(
        pcap([connect(0x0040, PEER_H6199), write(0x0040, POWER_ON), write(0x0099, BRIGHTNESS)])
    )
    refused = _analyse(tmp_path, "partly", "--address", PEER_H6199)
    assert refused.returncode == 2
    assert "cannot be attributed" in refused.stderr

    accepted = _analyse(tmp_path, "partly", "--address", PEER_H6199, "--allow-unattributed")
    assert accepted.returncode == 0, accepted.stderr
    assert "33-writes: 1" in accepted.stdout
    assert BRIGHTNESS.hex() not in accepted.stdout


def test_selecting_an_address_keeps_only_that_devices_writes(tmp_path):
    """Control on the filter itself, with both connections named."""
    (tmp_path / "two.pcap").write_bytes(
        pcap(
            [
                connect(0x0040, PEER_H6199),
                write(0x0040, POWER_ON),
                connect(0x0041, PEER_H617A),
                write(0x0041, BRIGHTNESS),
            ]
        )
    )
    result = _analyse(tmp_path, "two", "--address", PEER_H6199)
    assert result.returncode == 0, result.stderr
    assert "33-writes: 1" in result.stdout
    assert POWER_ON.hex() in result.stdout
    assert BRIGHTNESS.hex() not in result.stdout


def test_replies_are_filtered_too_so_another_device_does_not_answer_for_this_one(tmp_path):
    """RX was never filtered, so every notification in the file was read as this device's."""
    (tmp_path / "replies.pcap").write_bytes(
        pcap(
            [
                connect(0x0040, PEER_H6199),
                write(0x0040, POWER_ON),
                connect(0x0041, PEER_H617A),
                notify(0x0041, STATUS),
            ]
        )
    )
    result = _analyse(tmp_path, "replies", "--address", PEER_H6199)
    assert result.returncode == 0, result.stderr
    assert "non-power aa replies: 0" in result.stdout
    assert STATUS.hex() not in result.stdout


def test_a_body_is_reassembled_from_one_connection_only(tmp_path):
    """The consequence the refusal exists for, shown on the tool's own output.

    Both connections carry an A3 upload and neither was named. Reassembled together they
    concatenate into one body of twice the length, which carries no marking to say so and
    reads as a single upload from a single device.
    """
    (tmp_path / "a3.pcap").write_bytes(
        pcap(
            [
                att(0x004E, 0, 0x52, 0x0014, _xor(A3_FIRST)),
                att(0x0056, 0, 0x52, 0x0014, _xor(A3_FIRST)),
                att(0x0056, 0, 0x52, 0x0014, _xor(A3_LAST)),
                att(0x004E, 0, 0x52, 0x0014, _xor(A3_LAST)),
            ]
        )
    )
    fused = _analyse(tmp_path, "a3", "--source", "0x4e", "--allow-unattributed")
    assert fused.returncode == 0, fused.stderr
    assert "a3 body  : 34 B" in fused.stdout
