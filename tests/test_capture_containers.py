"""Prove the decoder reads both capture containers, and dates them to the same instant.

An iPhone HCI capture arrives as pcapng from ``pymobiledevice3 btlogger capture`` on the lab
or classic pcap from native WSL ``idevicebtlogger``. The frames inside are byte-identical
(link type 201: a big-endian direction pseudo-header, the H4 type byte, the HCI payload), so
the container choice should be invisible below ``iter_frames``.

The timestamps are NOT identical, and that is the part worth a gate. ``idevicebtlogger``
stored the device's local wall clock as though it were UTC. ``write_pcapng_stream``
subtracts the device's UTC offset so the pcapng holds a true instant. A reader that ignored
that would still parse every packet and would still print a full-looking decode; the damage
lands one layer up, where ``analyse_capture`` slices a capture at wall-clock action marks
and would quietly return EMPTY segments for every mark. An empty segment reads as "the app
sent nothing", which is a conclusion, not an error, and that is the failure this file exists
to stop.

The fixture pair holds the SAME frames at the SAME instants written both ways. Regenerate
it with ``tools/ble/make_container_fixtures.py``; the pcapng half is written by
pymobiledevice3 itself, so it pins us against the real producer rather than an imitation.
"""

import struct
import time
from datetime import UTC, datetime
from pathlib import Path

import pytest

from tools.ble.decode_govee import iter_frames, parse_capture

FIXTURES = Path(__file__).parent / "fixtures"
CLASSIC = FIXTURES / "govee_hci.pcap"
PCAPNG = FIXTURES / "govee_hci.pcapng"
EMPTY_PCAPNG = FIXTURES / "govee_hci_empty.pcapng"

# The offset the fixture was captured at, in POSIX TZ form so no tz database is needed.
CAPTURE_TZ = "AEST-10"
CAPTURE_OFFSET_SECONDS = 10 * 3600


@pytest.fixture
def phone_timezone(monkeypatch: pytest.MonkeyPatch):
    """Pin the host zone to the phone's.

    A classic pcap records a wall clock with no offset attached, so recovering the instant
    needs the zone it was written in. pcapng captures carry a true instant and need no such
    assumption.
    """
    monkeypatch.setenv("TZ", CAPTURE_TZ)
    time.tzset()
    yield
    monkeypatch.undo()
    time.tzset()


def test_containers_carry_byte_identical_frames(phone_timezone):
    classic = [frame for _, frame in iter_frames(CLASSIC.read_bytes())]
    pcapng = [frame for _, frame in iter_frames(PCAPNG.read_bytes())]
    assert classic == pcapng
    # One connection, three writes out, two notifications back, one disconnection.
    assert len(classic) == 7


def test_containers_agree_on_every_att_record(phone_timezone):
    classic = parse_capture(CLASSIC.read_bytes())
    pcapng = parse_capture(PCAPNG.read_bytes())

    assert [r.value for r in classic.att] == [r.value for r in pcapng.att]
    assert [r.direction for r in classic.att] == [r.direction for r in pcapng.att]
    assert [r.attribute_handle for r in classic.att] == [r.attribute_handle for r in pcapng.att]
    assert [r.address for r in classic.att] == [r.address for r in pcapng.att]
    assert [e.connected for e in classic.connections] == [e.connected for e in pcapng.connections]
    # Both directions and both Govee opcode families are present, so agreement is not
    # agreement about an empty list.
    assert {r.direction for r in classic.att} == {"TX", "RX"}
    assert {r.value[0] for r in classic.att} == {0x33, 0xAA}


def test_containers_date_the_same_frame_to_the_same_instant(phone_timezone):
    classic = parse_capture(CLASSIC.read_bytes())
    pcapng = parse_capture(PCAPNG.read_bytes())
    assert [r.timestamp for r in classic.att] == [r.timestamp for r in pcapng.att]


def test_the_two_containers_really_do_store_different_numbers(phone_timezone):
    """Control: the instants above agree after reconciliation, not because nothing differs.

    Without this, a reader that simply passed both timestamps through unchanged would sail
    through the equality test on a host that happened to sit at UTC.
    """
    data = CLASSIC.read_bytes()
    stored_seconds, stored_microseconds = struct.unpack("<II", data[24:32])
    stored_wall_clock = stored_seconds + stored_microseconds / 1_000_000
    first_instant, _ = next(iter(iter_frames(data)))

    assert stored_wall_clock - first_instant.timestamp() == CAPTURE_OFFSET_SECONDS
    assert first_instant.utcoffset().total_seconds() == CAPTURE_OFFSET_SECONDS
    # The pcapng stores that same instant as the true epoch, ten hours lower.
    pcapng_instant, _ = next(iter(iter_frames(PCAPNG.read_bytes())))
    assert pcapng_instant == first_instant
    assert pcapng_instant.utcoffset().total_seconds() == 0


def test_pcapng_reader_honours_if_tsresol():
    """A nanosecond interface must not be read at the microsecond default.

    pymobiledevice3 does not write if_tsresol today, so the default applies and this is the
    one branch the fixture cannot exercise. Assuming the default instead of reading it dates
    a nanosecond capture to roughly 1970.
    """
    frame = struct.pack(">I", 0) + bytes([0x04, 0x05, 0x04, 0x00, 0x40, 0x00, 0x16])
    instant = datetime(2026, 7, 24, 12, 12, 55, tzinfo=UTC)
    nanoseconds = int(instant.timestamp() * 1_000_000_000)

    option = struct.pack("<HH", 9, 1) + bytes([9, 0, 0, 0]) + struct.pack("<HH", 0, 0)
    idb_body = struct.pack("<HHI", 201, 0, 0) + option
    idb = struct.pack("<II", 0x00000001, len(idb_body) + 12) + idb_body + struct.pack("<I", len(idb_body) + 12)

    padded = frame + b"\x00" * (-len(frame) % 4)
    epb_body = struct.pack("<IIIII", 0, nanoseconds >> 32, nanoseconds & 0xFFFFFFFF, len(frame), len(frame)) + padded
    epb = struct.pack("<II", 0x00000006, len(epb_body) + 12) + epb_body + struct.pack("<I", len(epb_body) + 12)

    shb_body = struct.pack("<IHHq", 0x1A2B3C4D, 1, 0, -1)
    shb = struct.pack("<II", 0x0A0D0D0A, len(shb_body) + 12) + shb_body + struct.pack("<I", len(shb_body) + 12)

    (read_instant, read_frame) = next(iter(iter_frames(shb + idb + epb)))
    assert read_frame == frame
    assert read_instant == instant


def test_pcapng_with_a_foreign_link_type_is_refused():
    idb_body = struct.pack("<HHI", 1, 0, 0)  # DLT_EN10MB, not Bluetooth HCI
    idb = struct.pack("<II", 0x00000001, len(idb_body) + 12) + idb_body + struct.pack("<I", len(idb_body) + 12)
    shb_body = struct.pack("<IHHq", 0x1A2B3C4D, 1, 0, -1)
    shb = struct.pack("<II", 0x0A0D0D0A, len(shb_body) + 12) + shb_body + struct.pack("<I", len(shb_body) + 12)

    with pytest.raises(ValueError, match="DLT_BLUETOOTH_HCI_H4_WITH_PHDR"):
        list(iter_frames(shb + idb))


def test_a_capture_that_recorded_nothing_still_parses_as_a_valid_file():
    """Why the capture preflight counts frames instead of trusting a successful parse.

    A missing Bluetooth logging profile, or a locked phone, leaves btlogger connecting
    cleanly and recording nothing. That does NOT leave an empty file: the pcapng writer
    emits the section and interface blocks when it is constructed, before the first record
    is awaited, so a dead stream produces a well-formed capture of zero packets. It decodes
    without complaint as "0 Govee packets", which is a conclusion about the app rather than
    about the rig, and is exactly the reading that cost 2026-07-30.

    So the file is not the instrument. `govee-capture.sh` refuses to start unless frames are
    actually flowing, and `test_start_refuses_a_capture_carrying_no_frames` gates that
    against this same fixture.
    """
    assert EMPTY_PCAPNG.stat().st_size > 0
    assert list(iter_frames(EMPTY_PCAPNG.read_bytes())) == []
    assert parse_capture(EMPTY_PCAPNG.read_bytes()).att == ()


def test_a_capture_that_never_opened_is_refused_outright():
    """A zero-byte file is a different failure again, and must not decode at all."""
    with pytest.raises(ValueError):
        list(iter_frames(b""))
