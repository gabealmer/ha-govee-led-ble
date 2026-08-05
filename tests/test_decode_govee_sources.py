"""Prove a capture is read as evidence about ONE light.

A phone stays paired with every Govee device in the house, so a single HCI capture can
carry two devices' traffic on two connections. ``decode_govee`` refuses to print such a
capture until it is narrowed, because reading a second device's frames as this one's is
not a display bug, it is a false protocol finding, and the model boundary is the one thing
the H6199 discovery run must not cross.

A SOURCE IS A CONNECTION, NOT AN ADDRESS, and these tests exist in that shape because the
address version of this guard failed in the field on 2026-08-05. Every frame in
``session-dreamtv-ai.pcap`` arrived on a connection the capture never saw open, so every
frame was unaddressed, so all 2191 of them counted as the single bucket ``?`` and the
capture printed clean. It held two ATT connections: 2189 frames on 0x4e and 2 on 0x56. The
handle is on every frame whether an address was ever captured or not, which is why the
count keys on it.

The awkward case is the handle itself: it is only unique while its connection is up, and
the controller hands the same number back out afterwards, so the tests below pin both
halves. Two connections must not merge because they shared a number, and one device must
not split because it was named.
"""

import pytest

from tests.hci_capture import (
    BRIGHTNESS,
    PEER_H617A,
    PEER_H6199,
    POWER_ON,
    STATUS,
    connect,
    disconnect,
    notify,
    pcap,
    two_unnamed_connections,
    write,
)
from tools.ble import decode_govee as dg


@pytest.fixture
def two_light_capture(tmp_path):
    """One H617A frame, two H6199 frames, on two connections opened inside the capture."""
    path = tmp_path / "two-lights.pcap"
    path.write_bytes(
        pcap(
            [
                connect(0x0040, PEER_H617A),
                connect(0x0041, PEER_H6199),
                write(0x0040, POWER_ON),
                write(0x0041, BRIGHTNESS),
                notify(0x0041, STATUS),
            ]
        )
    )
    return path


@pytest.fixture
def unattributed_capture(tmp_path):
    """One attributed peer plus a frame on a connection this capture never saw open."""
    path = tmp_path / "partial.pcap"
    path.write_bytes(
        pcap(
            [
                connect(0x0040, PEER_H6199),
                write(0x0040, BRIGHTNESS),
                write(0x0099, POWER_ON),
            ]
        )
    )
    return path


@pytest.fixture
def two_unnamed_capture(tmp_path):
    path = tmp_path / "two-unnamed.pcap"
    path.write_bytes(two_unnamed_connections())
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


def test_named_peers_are_counted_separately(two_light_capture):
    sources = dg.govee_sources(dg.parse_capture(two_light_capture.read_bytes()))
    assert sources == {PEER_H617A: 1, PEER_H6199: 2}


def test_a_frame_whose_connection_predates_the_capture_is_counted_not_dropped(unattributed_capture):
    sources = dg.govee_sources(dg.parse_capture(unattributed_capture.read_bytes()))
    assert sources == {PEER_H6199: 1, "?conn-0x99": 1}


def test_two_unnamed_connections_are_two_sources(two_unnamed_capture):
    """The count that failed in the field. Keyed on the address these collapse to one bucket."""
    sources = dg.govee_sources(dg.parse_capture(two_unnamed_capture.read_bytes()))
    assert sources == {"?conn-0x4e": 3, "?conn-0x56": 1}


def test_a_handle_reused_after_a_disconnect_is_two_sources(tmp_path):
    """A handle is only unique while its connection is up, so reuse must split the count.

    Without the disconnect between them these are one connection; with it they are two
    devices that happened to be given the same number, and merging them is the same
    false-single-source reading the address key produced, arrived at from the other side.
    """
    path = tmp_path / "reused.pcap"
    path.write_bytes(pcap([write(0x0040, POWER_ON), disconnect(0x0040), write(0x0040, BRIGHTNESS)]))
    sources = dg.govee_sources(dg.parse_capture(path.read_bytes()))
    assert sources == {"?conn-0x40#1": 1, "?conn-0x40#2": 1}


def test_one_connection_is_one_source_however_many_frames_it_carries(tmp_path):
    """Control on the split above: without a disconnect, a handle stays one source."""
    path = tmp_path / "single.pcap"
    path.write_bytes(pcap([write(0x0040, POWER_ON), write(0x0040, BRIGHTNESS)]))
    assert dg.govee_sources(dg.parse_capture(path.read_bytes())) == {"?conn-0x40": 2}


def test_a_device_that_reconnects_inside_the_capture_is_still_one_source(tmp_path):
    """The false positive handle keying could have introduced, and the reason the address wins.

    A light that drops and comes back gets a fresh handle, so keying on the handle alone
    would report two sources for one device and refuse a capture that is perfectly good.
    Whenever the connect event was captured the address is known, so the address is what
    the count uses and the two connections merge back into the one device they were.
    """
    path = tmp_path / "reconnect.pcap"
    path.write_bytes(
        pcap(
            [
                connect(0x0040, PEER_H6199),
                write(0x0040, POWER_ON),
                disconnect(0x0040),
                connect(0x0041, PEER_H6199),
                write(0x0041, BRIGHTNESS),
            ]
        )
    )
    assert dg.govee_sources(dg.parse_capture(path.read_bytes())) == {PEER_H6199: 2}


@pytest.mark.parametrize("wanted", [PEER_H6199, PEER_H6199.lower(), "d5:36:36:dd:ee:ff", "DD:EE:FF", "eeff"])
def test_a_peer_resolves_by_full_address_or_by_a_unique_tail(wanted):
    """The tail is what is to hand at the rig: a Govee light advertises it in its name."""
    assert dg.resolve_source([PEER_H617A, PEER_H6199], wanted) == PEER_H6199


@pytest.mark.parametrize("wanted", ["?conn-0x4e", "0x4e", "0x4E", "hdl:0x4e"])
def test_an_unnamed_connection_resolves_by_the_handle_it_is_printed_under(wanted):
    """A refusal with no way past it is how an unreadable capture turns back into an unread one.

    An address-only selector leaves an operator holding a capture the tool has just refused
    and no argument that can narrow it, so the handle the summary prints is selectable.
    """
    assert dg.resolve_source(["?conn-0x4e", "?conn-0x56"], wanted) == "?conn-0x4e"


def test_a_reused_handle_must_be_named_by_which_use_is_meant():
    with pytest.raises(dg.SourceSelectionError, match="matches 2 connections"):
        dg.resolve_source(["?conn-0x40#1", "?conn-0x40#2"], "0x40")
    assert dg.resolve_source(["?conn-0x40#1", "?conn-0x40#2"], "?conn-0x40#2") == "?conn-0x40#2"


def test_an_unmatched_peer_raises_rather_than_filtering_everything_away():
    with pytest.raises(dg.SourceSelectionError, match="no captured source"):
        dg.resolve_source([PEER_H617A, PEER_H6199], "11:22:33:44:55:66")


def test_an_ambiguous_tail_raises_rather_than_picking_one():
    with pytest.raises(dg.SourceSelectionError, match="matches 2 peers"):
        dg.resolve_source(["D0:35:34:00:BB:CC", "D5:36:36:00:BB:CC"], "BB:CC")


def test_an_unresolvable_address_lists_the_connections_the_capture_does_hold():
    """``captured: none`` is what the failing session answered, and it read as an empty capture.

    It was true and useless: the capture held two connections, just no addresses. Naming
    them is what turns the refusal into the next command to run.
    """
    with pytest.raises(dg.SourceSelectionError, match=r"captured: \?conn-0x4e, \?conn-0x56"):
        dg.resolve_source(["?conn-0x4e", "?conn-0x56"], PEER_H6199)


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


def test_two_unnamed_connections_are_refused_the_same_way(monkeypatch, capsys, two_unnamed_capture):
    """The regression. This capture printed clean, exit 0, with no warning of any kind."""
    code, out, err = _run(monkeypatch, capsys, str(two_unnamed_capture))
    assert code == 2
    assert "holds 2 Govee sources" in err
    assert "?conn-0x4e=3" in out and "?conn-0x56=1" in out
    assert not [line for line in out.splitlines() if line.startswith((" ", "."))]


def test_allowing_unattributed_frames_does_not_allow_mixing_two_of_them(monkeypatch, capsys, two_unnamed_capture):
    """--allow-unattributed accepts ONE thing, and it is not this.

    It says the operator accepts frames the capture never named. It does not say they
    accept two devices being read as one, which is a different claim about a different
    failure. Letting it cover both would disarm the guard on exactly the captures with
    nothing else left to go on, and govee-capture.sh passes it on every unbound stop, so
    the fix would be dead at the call site that swallowed the failing session.
    """
    code, _, err = _run(monkeypatch, capsys, str(two_unnamed_capture), "--allow-unattributed")
    assert code == 2
    assert "holds 2 Govee sources" in err


def test_a_single_unnamed_connection_is_refused_until_that_is_accepted(monkeypatch, capsys, tmp_path):
    """One connection IS one source, but the capture still cannot say which device it was.

    Refused on the default read for the same reason it is refused under --peer: this path
    is the one govee-capture.sh takes when no peer is bound, and it printed such a capture
    with no comment at all.
    """
    path = tmp_path / "unnamed.pcap"
    path.write_bytes(pcap([write(0x004E, POWER_ON)]))
    code, out, err = _run(monkeypatch, capsys, str(path))
    assert code == 2
    assert "cannot be attributed" in err and "?conn-0x4e" in err
    assert "?conn-0x4e=1" in out
    code, out, _ = _run(monkeypatch, capsys, str(path), "--allow-unattributed")
    assert code == 0
    assert "WARNING: ?conn-0x4e was never named" in out


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


def test_filtering_to_one_connection_keeps_only_that_connections_frames(monkeypatch, capsys, two_unnamed_capture):
    """The way out of the refusal for a capture that has no address to filter on."""
    code, out, err = _run(monkeypatch, capsys, str(two_unnamed_capture), "--source", "0x56", "--allow-unattributed")
    assert code == 0, err
    rows = [line for line in out.splitlines() if line.startswith((" ", "."))]
    assert rows and all("?conn-0x56" in row for row in rows)
    assert "Govee packets: 1" in out
    assert "WARNING: ?conn-0x56 was never named" in out


def test_selecting_a_connection_still_requires_accepting_that_it_is_unnamed(monkeypatch, capsys, two_unnamed_capture):
    """Narrowing to one connection answers "one source", never "which device"."""
    code, _, err = _run(monkeypatch, capsys, str(two_unnamed_capture), "--source", "0x56")
    assert code == 2
    assert "cannot be attributed" in err


def test_a_single_light_capture_does_not_warn(monkeypatch, capsys, two_light_capture):
    """Control: the refusal above is raised by the second source, not applied unconditionally."""
    code, out, _ = _run(monkeypatch, capsys, str(two_light_capture), "--peer", PEER_H6199)
    assert code == 0
    assert "more than one Govee source" not in out


def test_a_mistyped_peer_fails_instead_of_reporting_a_silent_light(monkeypatch, capsys, two_light_capture):
    code, out, err = _run(monkeypatch, capsys, str(two_light_capture), "--peer", "D0:35:34:11:22:33")
    assert code == 2
    assert "no captured source" in err
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
    assert "?conn-0x99=1" in out


def test_a_genuinely_single_source_capture_prints_without_any_flag(monkeypatch, capsys, tmp_path):
    """Control: the refusals above come from a second source, not from the check being on."""
    path = tmp_path / "one-light.pcap"
    path.write_bytes(pcap([connect(0x0040, PEER_H6199), write(0x0040, BRIGHTNESS)]))
    code, out, err = _run(monkeypatch, capsys, str(path))
    assert code == 0
    assert err == ""
    assert [line for line in out.splitlines() if line.startswith((" ", "."))]
