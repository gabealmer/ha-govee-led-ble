"""Prove a capture is read as evidence about ONE light.

A phone stays paired with every Govee device in the house, so a single HCI capture can
carry two models' traffic on two connection handles. ``decode_govee`` has always known
each frame's peer (``parse_capture`` fills ``AttRecord.address``) and never showed or used
it, so an H6199 app-sniff read straight off the default output could quietly attribute an
H617A frame to the H6199. That is not a display bug, it is a false protocol finding, and
the model boundary is the one thing the H6199 discovery run must not cross.

The awkward case is a frame whose connection was opened before the capture started: it has
no address at all. Dropping those when filtering would turn a partly-captured session into
a whole-looking one, so they are counted separately and refused by default.
"""

import struct
from datetime import UTC, datetime

import pytest

from tools.ble import decode_govee as dg

PEER_H617A = "D0:35:34:AA:BB:CC"
PEER_H6199 = "D5:36:36:DD:EE:FF"

POWER_ON = bytes.fromhex("3301010000000000000000000000000000000033")
BRIGHTNESS = bytes.fromhex("3304320000000000000000000000000000000005")
STATUS = bytes.fromhex("aa050000000000000000000000000000000000af")

BASE_INSTANT = datetime(2026, 8, 1, 9, 0, 0, tzinfo=UTC)


def _phdr(direction_in: int, h4_type: int, payload: bytes) -> bytes:
    return struct.pack(">I", direction_in) + bytes([h4_type]) + payload


def _connect(handle: int, address: str) -> bytes:
    raw = bytes.fromhex(address.replace(":", ""))[::-1]
    params = (
        bytes([0x01, 0x00])
        + struct.pack("<H", handle)
        + bytes([0x00, 0x00])
        + raw
        + struct.pack("<HHH", 0x0006, 0x0000, 0x01F4)
        + bytes([0x00])
    )
    return _phdr(1, 0x04, bytes([0x3E, len(params)]) + params)


def _att(handle: int, direction_in: int, opcode: int, attribute_handle: int, value: bytes) -> bytes:
    att = bytes([opcode]) + struct.pack("<H", attribute_handle) + value
    l2cap = struct.pack("<HH", len(att), 0x0004) + att
    return _phdr(direction_in, 0x02, struct.pack("<HH", handle, len(l2cap)) + l2cap)


def _pcap(frames: list[bytes]) -> bytes:
    out = bytearray(struct.pack("<IHHiIII", 0xA1B2C3D4, 2, 4, 0, 0, 0x40000, 201))
    for index, frame in enumerate(frames):
        epoch = BASE_INSTANT.timestamp() + index * 0.25
        seconds = int(epoch)
        out += struct.pack("<IIII", seconds, round((epoch - seconds) * 1_000_000), len(frame), len(frame))
        out += frame
    return bytes(out)


@pytest.fixture
def two_light_capture(tmp_path):
    """One H617A frame, two H6199 frames, on two connections opened inside the capture."""
    path = tmp_path / "two-lights.pcap"
    path.write_bytes(
        _pcap(
            [
                _connect(0x0040, PEER_H617A),
                _connect(0x0041, PEER_H6199),
                _att(0x0040, 0, 0x52, 0x0014, POWER_ON),
                _att(0x0041, 0, 0x52, 0x0014, BRIGHTNESS),
                _att(0x0041, 1, 0x1B, 0x0010, STATUS),
            ]
        )
    )
    return path


@pytest.fixture
def unattributed_capture(tmp_path):
    """One attributed peer plus a frame on a connection this capture never saw open."""
    path = tmp_path / "partial.pcap"
    path.write_bytes(
        _pcap(
            [
                _connect(0x0040, PEER_H6199),
                _att(0x0040, 0, 0x52, 0x0014, BRIGHTNESS),
                _att(0x0099, 0, 0x52, 0x0014, POWER_ON),
            ]
        )
    )
    return path


def test_the_committed_fixture_decodes_to_the_address_its_literal_states():
    """Control on the fixture generator's byte order, which nothing asserted before.

    ``make_container_fixtures.PEER_ADDRESS`` reverses its literal into HCI's little-endian
    wire order and ``_format_address`` reverses it back. It used to reverse the wrong way,
    so the address in the committed fixture was the reverse of the one the source appeared
    to name, and every container test still passed because they only compare the two
    containers against each other.
    """
    from pathlib import Path

    trace = dg.parse_capture((Path(__file__).parent / "fixtures" / "govee_hci.pcapng").read_bytes())
    assert {event.address for event in trace.connections if event.address} == {PEER_H617A}
    assert {record.address for record in trace.att} == {PEER_H617A}


def test_peers_are_counted_separately(two_light_capture):
    peers = dg.govee_peers(dg.parse_capture(two_light_capture.read_bytes()))
    assert peers == {PEER_H617A: 1, PEER_H6199: 2}


def test_a_frame_whose_connection_predates_the_capture_is_counted_not_dropped(unattributed_capture):
    peers = dg.govee_peers(dg.parse_capture(unattributed_capture.read_bytes()))
    assert peers == {PEER_H6199: 1, dg.UNATTRIBUTED: 1}


@pytest.mark.parametrize("wanted", [PEER_H6199, PEER_H6199.lower(), "d5:36:36:dd:ee:ff", "DD:EE:FF", "eeff"])
def test_a_peer_resolves_by_full_address_or_by_a_unique_tail(wanted):
    """The tail is what is to hand at the rig: a Govee light advertises it in its name."""
    assert dg.resolve_peer([PEER_H617A, PEER_H6199], wanted) == PEER_H6199


def test_an_unmatched_peer_raises_rather_than_filtering_everything_away():
    with pytest.raises(dg.PeerSelectionError, match="no captured peer"):
        dg.resolve_peer([PEER_H617A, PEER_H6199], "11:22:33:44:55:66")


def test_an_ambiguous_tail_raises_rather_than_picking_one():
    with pytest.raises(dg.PeerSelectionError, match="matches 2 peers"):
        dg.resolve_peer(["D0:35:34:00:BB:CC", "D5:36:36:00:BB:CC"], "BB:CC")


def test_the_unattributed_bucket_is_never_offered_as_a_peer():
    with pytest.raises(dg.PeerSelectionError):
        dg.resolve_peer([dg.UNATTRIBUTED], dg.UNATTRIBUTED)


def _run(monkeypatch, capsys, *argv) -> tuple[int, str, str]:
    monkeypatch.setattr("sys.argv", ["decode_govee.py", *argv])
    code = dg.main()
    captured = capsys.readouterr()
    return code, captured.out, captured.err


def test_a_two_light_capture_is_refused_until_it_is_narrowed(monkeypatch, capsys, two_light_capture):
    """An opt-in filter you can forget protects nothing, so this refuses rather than warns."""
    code, out, err = _run(monkeypatch, capsys, str(two_light_capture))
    assert code == 2
    assert "holds 2 Govee sources" in err
    assert f"{PEER_H617A}=1" in out and f"{PEER_H6199}=2" in out
    assert not [line for line in out.splitlines() if line.startswith((" ", "."))]


def test_the_refusal_to_mix_can_be_overridden_deliberately(monkeypatch, capsys, two_light_capture):
    code, out, _ = _run(monkeypatch, capsys, str(two_light_capture), "--all-peers")
    assert code == 0
    warning = next(i for i, line in enumerate(out.splitlines()) if "more than one Govee source" in line)
    first_row = next(i for i, line in enumerate(out.splitlines()) if line.startswith((" ", ".")))
    assert warning < first_row
    assert "Govee packets: 3" in out


def test_filtering_to_one_peer_keeps_only_that_peers_frames(monkeypatch, capsys, two_light_capture):
    code, out, _ = _run(monkeypatch, capsys, str(two_light_capture), "--peer", PEER_H6199)
    assert code == 0
    rows = [line for line in out.splitlines() if line.startswith((" ", "."))]
    assert rows and all(PEER_H6199 in row for row in rows)
    assert PEER_H617A not in "".join(rows)
    assert "Govee packets: 2" in out


def test_a_single_light_capture_does_not_warn(monkeypatch, capsys, two_light_capture):
    """Control: the refusal above is raised by the second source, not applied unconditionally."""
    code, out, _ = _run(monkeypatch, capsys, str(two_light_capture), "--peer", PEER_H6199)
    assert code == 0
    assert "more than one Govee source" not in out


def test_a_mistyped_peer_fails_instead_of_reporting_a_silent_light(monkeypatch, capsys, two_light_capture):
    code, out, err = _run(monkeypatch, capsys, str(two_light_capture), "--peer", "D0:35:34:11:22:33")
    assert code == 2
    assert "no captured peer" in err
    assert not [line for line in out.splitlines() if line.startswith((" ", "."))]


def test_filtering_refuses_a_capture_holding_frames_it_cannot_attribute(monkeypatch, capsys, unattributed_capture):
    code, _, err = _run(monkeypatch, capsys, str(unattributed_capture), "--peer", PEER_H6199)
    assert code == 2
    assert "cannot be attributed" in err


def test_the_refusal_can_be_overridden_deliberately(monkeypatch, capsys, unattributed_capture):
    code, out, _ = _run(monkeypatch, capsys, str(unattributed_capture), "--peer", PEER_H6199, "--allow-unattributed")
    assert code == 0
    assert "Govee packets: 1" in out


def test_an_unfiltered_read_of_a_partly_attributed_capture_is_also_refused(monkeypatch, capsys, unattributed_capture):
    """One named peer plus frames from nobody is still two sources, so the mix is refused."""
    code, out, err = _run(monkeypatch, capsys, str(unattributed_capture))
    assert code == 2
    assert "holds 2 Govee sources" in err
    assert f"{dg.UNATTRIBUTED}=1" in out


def test_a_genuinely_single_source_capture_prints_without_any_flag(monkeypatch, capsys, tmp_path):
    """Control: the refusals above come from a second source, not from the check being on."""
    path = tmp_path / "one-light.pcap"
    path.write_bytes(_pcap([_connect(0x0040, PEER_H6199), _att(0x0040, 0, 0x52, 0x0014, BRIGHTNESS)]))
    code, out, err = _run(monkeypatch, capsys, str(path))
    assert code == 0
    assert err == ""
    assert [line for line in out.splitlines() if line.startswith((" ", "."))]
