#!/usr/bin/env python3
"""Decode Govee BLE command/status packets from an iPhone HCI capture.

Reads either container an iPhone HCI capture arrives in, walks
HCI H4 -> ACL -> L2CAP -> ATT, and prints the 20-byte Govee packets carried by
ATT writes (phone -> light) and notifications (light -> phone).

Both containers carry link type 201, DLT_BLUETOOTH_HCI_H4_WITH_PHDR, and the framing
inside is byte-identical: a 4-byte big-endian direction pseudo-header, the HCI H4 type
byte, then the HCI payload. Only the container and the timestamp basis differ, so
everything below `iter_frames` is shared.

Govee packets are 20 bytes: header 0x33 (command), 0xAA (status) or 0xA3
(multi-packet fragment), with byte 19 = XOR of bytes 0..18. That signature is
used to filter Govee traffic out of the phone's other BLE activity.

Usage: uv run python tools/ble/decode_govee.py <capture.pcapng|capture.pcap> [--all]
  --all   also print packets that are not Govee (raw ATT values)
"""

import struct
import sys
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from datetime import UTC, datetime

ATT_CID = 0x0004
WRITE_OPCODES = {0x12: "WriteReq", 0x52: "WriteCmd", 0x1D: "Indication", 0x1B: "Notification"}


@dataclass(frozen=True)
class ConnectionEvent:
    timestamp: datetime
    connection_handle: int
    address: str | None
    connected: bool


@dataclass(frozen=True)
class AttRecord:
    timestamp: datetime
    direction: str
    connection_handle: int
    address: str | None
    opcode: int
    attribute_handle: int
    value: bytes


@dataclass(frozen=True)
class CaptureTrace:
    connections: tuple[ConnectionEvent, ...]
    att: tuple[AttRecord, ...]


def _xor_ok(v: bytes) -> bool:
    checksum = 0
    for byte in v[:19]:
        checksum ^= byte
    return len(v) == 20 and checksum == v[19]


def _sum8_ok(v: bytes) -> bool:
    return len(v) == 7 and (sum(v[:6]) & 0xFF) == v[6]


def _is_music_stream(v: bytes) -> bool:
    # The phone-microphone music path (music_stream.ksy). A 7-byte a5 02 83 <rgb> frame
    # on the same write handle, checksummed by SUM rather than XOR, which is exactly why
    # it slipped past _is_govee for a whole session and showed up as "(non-govee)".
    return len(v) == 7 and v[:3] == b"\xa5\x02\x83" and _sum8_ok(v)


def _is_govee(v: bytes) -> bool:
    # 0x33 write / 0xAA read / 0xA3 multi-part write are the H617A opcode set. 0xA1 is
    # the multi-part upload opcode used by the H6127/H6199 family in place of 0xA3, so
    # filtering it out would leave us blind to their DIY uploads during app-sniff work.
    # The 20-byte length and XOR check still gate the match strictly.
    if _is_music_stream(v):
        return True
    return len(v) == 20 and v[0] in (0x33, 0xAA, 0xA3, 0xA1) and _xor_ok(v)


# Observed 0xAA query/status types (phone TX = query, light RX = reply).
AA_TYPES = {
    0x01: "power",
    0x04: "brightness",
    0x05: "colormode",
    0x06: "fw-ver",
    0x07: "hw-ver",
    0x0B: "?0b",
    0x11: "sleep-timer",
    0x12: "wake-timer",
    0x23: "timer",
    0x40: "count-40",
    0xA3: "multi",
    0xA5: "segments",
}


def _ascii(b: bytes) -> str:
    return "".join(chr(x) for x in b if 32 <= x < 127)


def reassemble_a3(frames: Iterable[bytes]) -> bytes:
    """Reassemble ONE 0xA3 transaction, per govee_common::a3_header.

    Concatenate ``bytes[2:19]`` of every frame in arrival order, INCLUDING the 0xff-indexed
    one. The 0xff index does not mean "terminator": in the plain form the last DATA chunk
    carries it, so discarding that frame truncates the body. That is the common case, not an
    edge case: 40 of the 46 A3 transactions in the capture corpus are the plain form.

    Caller must pass exactly one transaction. Segment on index 0x00..0xff first; handing this
    a whole capture window concatenates unrelated bodies.

    Deliberately does NOT cut to ``linecount * 17``. That cut was tried on 2026-07-26 and
    removed: for one complete transaction it is provably a no-op (linecount * 17 equals the
    concatenated length in all 46 corpus transactions), and for anything else it is destructive,
    silently dropping every transaction after the first and mangling duplicates. Use linecount
    as a CHECK on the result, never as a slice.
    """
    return b"".join(frame[2:19] for frame in frames)


def segment_a3(frames: Iterable[bytes]) -> list[list[bytes]]:
    """Split a stream of 0xA3 frames into individual transactions.

    Both framing forms described in govee_common::a3_header end on the frame whose index byte
    is 0xFF, in the terminator form as an appended all-zero frame and in the plain form as the
    last data chunk, so that byte closes a transaction under either. A restart to index 0x00
    also closes one, so a capture that lost the tail of an upload yields two transactions
    rather than one fused body.
    """
    transactions: list[list[bytes]] = []
    current: list[bytes] = []
    for frame in frames:
        if current and frame[1] == 0x00:
            transactions.append(current)
            current = []
        current.append(frame)
        if frame[1] == 0xFF:
            transactions.append(current)
            current = []
    if current:
        transactions.append(current)
    return transactions


def a3_body_is_complete(body: bytes) -> bool:
    """Check a reassembled body against its own linecount, per govee_common::a3_header.

    linecount is a CHECK, never a slice. A body that fails this is truncated or fused, and the
    length disagreement it causes downstream invites the wrong conclusion that the grammar is
    broken.
    """
    return len(body) >= 2 and body[0] == 0x01 and len(body) == body[1] * 17


DIRECTIONS = ("TX", "RX")


def _require_direction(direction: str) -> None:
    """Refuse to label a frame without knowing who sent it.

    Two families of Govee frame are byte-identical between the two directions, so a labeller
    that guesses reports state the device never sent. The aa 05 query body is identical to a
    mode 0x00 video reply (see status_reply::cm_video), and an aa reply with an all-zero body
    is identical to its own query frame, which has now bitten on 0xa3 and again on 0x01. The
    old code treated any unrecognised direction as a REPLY, so a typo produced phantom state
    silently rather than failing.
    """
    if direction not in DIRECTIONS:
        raise ValueError(f"direction must be one of {DIRECTIONS}, got {direction!r}")


def _label_aa(v: bytes, direction: str) -> str:
    t = v[1]
    name = AA_TYPES.get(t, f"type={t:#04x}")
    if direction == "TX":
        return f"query {name}"
    data = v[2:19]
    if t in (0x06, 0x07):
        return f"reply {name}={_ascii(data)!r}"
    if t == 0x01:
        return f"reply power={'on' if data[0] else 'off'}"
    if t == 0x05:
        return f"reply colormode {data[0]:#04x} {data[1]:#04x}"
    if t == 0x40:
        # status_reply::unit_count_body: the value 15 is corroborated, but neither the
        # u1/u2be split nor what it counts is. Do not print it as a segment count.
        return f"reply count={data[1]}" + (f" reserved={data[0]:#04x}" if data[0] else "")
    if t == 0x04:
        return f"reply brightness={data[0]}%"
    if t == 0xA5:
        segs = " ".join(data[1:13][i : i + 4].hex() for i in range(0, 12, 4))
        return f"reply segments group={data[0]} [{segs}]"
    return f"reply {name} {data.hex()}"


def _segment_mask(pair: bytes) -> str:
    """Render a command_write::segment_mask, which is u2le, NOT the raw byte order.

    Printing the two bytes in wire order reads like a big-endian value and silently
    transposes the bitmap: an all-segments 0x7fff shows up as 0xff7f, which looks like
    a 15-bit map that skips bit 7 and uses bit 15. That misreading was made and caught
    on 2026-07-27; render the value the spec defines and list the segments outright so
    it cannot happen from decoder output again.
    """
    bits = int.from_bytes(pair, "little")
    if bits == 0x7FFF:
        return "0x7fff(all)"
    segments = [str(i + 1) for i in range(15) if bits & (1 << i)]
    return f"0x{bits:04x}(seg {','.join(segments) if segments else '-'})"


def label(v: bytes, direction: str) -> str:
    """Best-effort human label using the known Govee command map."""
    _require_direction(direction)
    h = v[0]
    if _is_music_stream(v):
        return f"mic-stream rgb=({v[3]},{v[4]},{v[5]})"
    if h == 0xA3:
        return f"multi-frame idx={v[1]:#04x} {v[2:12].hex()}"
    if h == 0xA1:
        # H6127/H6199-family multi-part upload; byte[1] is a sub-opcode, byte[2] the index.
        return f"multi-frame(a1) sub={v[1]:#04x} idx={v[2]:#04x} {v[3:12].hex()}"
    if h == 0xAA:
        return _label_aa(v, direction)
    if h != 0x33:
        return "?"
    action = v[1]
    if direction == "RX":  # device ack/echo of a 0x33 command; payload is a status, not a set value
        names = {0x01: "power", 0x04: "brightness", 0x05: "colour", 0x09: "time/cfg", 0xA9: "calibration"}
        return f"ack {names.get(action, f'action={action:#04x}')}"
    if action == 0x01:
        return f"power {'on' if v[2] else 'off'}"
    if action == 0x04:
        return f"brightness {v[2]}%"
    if action == 0x05:
        mode = v[2]
        modes = {0x15: "static", 0x04: "scene", 0x00: "video", 0x13: "music", 0x0A: "diy"}
        detail = modes.get(mode, f"mode={mode:#04x}")
        if mode == 0x15 and v[3] == 0x01:
            kelvin = int.from_bytes(v[7:9], "big")
            if kelvin:
                return f"colortemp {kelvin}K preview=({v[9]},{v[10]},{v[11]}) mask={_segment_mask(v[12:14])}"
            return f"color rgb=({v[4]},{v[5]},{v[6]}) mask={_segment_mask(v[12:14])}"
        if mode == 0x15 and v[3] == 0x02:
            return f"brightness {v[4]}% mask={_segment_mask(v[5:7])}"
        if mode == 0x15 and v[3] == 0x03:
            # command_write::static_brightness_all: one 0..100 percent per segment,
            # index i = segment i+1, no mask. Rendering it as a bare hex run hid it
            # for as long as we had captures containing it.
            percents = list(v[4:19])
            shown = ",".join(f"s{i + 1}={p}" for i, p in enumerate(percents) if p != 100)
            return f"seg brightness all ({shown or 'all 100%'})"
        if mode == 0x04:
            # status_reply::cm_scene.scene_id is u2le. Falling through to the generic
            # "sub=v[3]" line below renders its LOW BYTE as if it were a selector, so
            # scene 1173 reads as sub=0x95. Same misreading class as the segment mask.
            return f"scene id={int.from_bytes(v[3:5], 'little')} {v[3:13].hex()}"
        if mode == 0x0A:
            # govee_common::diy_selector: slot then type_byte, two independent u1 fields.
            return f"diy slot={v[3]:#04x} type={v[4]:#04x} {v[3:13].hex()}"
        return f"color/{detail} sub={v[3]:#04x} {v[3:13].hex()}"
    if action == 0x09:
        return f"time/cfg {v[2:9].hex()}"
    if action == 0xA9:
        return "dreamview/calibration"
    return f"cmd action={action:#04x} {v[2:13].hex()}"


_PCAPNG_SHB = 0x0A0D0D0A
_PCAPNG_IDB = 0x00000001
_PCAPNG_EPB = 0x00000006
_LINKTYPE_BLUETOOTH_HCI_H4_WITH_PHDR = 201

# idevicebtlogger wrote the BTPacketLogger record's device-LOCAL wall clock straight into a
# classic pcap record, where it is read back as UTC. pymobiledevice3 subtracts the device's
# UTC offset when writing pcapng, precisely so the pcapng timestamp is a true instant. Both
# are normalised to a true instant here so that everything downstream compares like with
# like: a naive comparison against wall-clock action marks looked right for years on the old
# container and would be silently a whole UTC offset out on the new one, printing empty
# segments that read as "the app sent nothing" rather than as a broken tool.
_CLASSIC_PCAP_LAYOUTS = {
    b"\xd4\xc3\xb2\xa1": ("<", 1_000_000),
    b"\xa1\xb2\xc3\xd4": (">", 1_000_000),
    b"\x4d\x3c\xb2\xa1": ("<", 1_000_000_000),
    b"\xa1\xb2\x3c\x4d": (">", 1_000_000_000),
}


def _local_wall_clock_to_instant(epoch_seconds: float) -> datetime:
    """Reinterpret a device-local wall clock that was stored as though it were UTC."""
    rendered = datetime.fromtimestamp(epoch_seconds, UTC).replace(tzinfo=None)
    return rendered.astimezone()


def _iter_classic_pcap(data: bytes, *, allow_truncated: bool) -> Iterator[tuple[datetime, bytes]]:
    if len(data) < 24:
        raise ValueError("pcap header is truncated")
    try:
        endian, timestamp_scale = _CLASSIC_PCAP_LAYOUTS[data[:4]]
    except KeyError as exc:
        raise ValueError("unsupported pcap byte order or timestamp format") from exc
    if struct.unpack(f"{endian}I", data[20:24])[0] != _LINKTYPE_BLUETOOTH_HCI_H4_WITH_PHDR:
        raise ValueError("pcap is not DLT_BLUETOOTH_HCI_H4_WITH_PHDR")
    rec = struct.Struct(f"{endian}IIII")
    off = 24
    while off < len(data):
        if off + 16 > len(data):
            if allow_truncated:
                return
            raise ValueError("pcap record header is truncated")
        seconds, fraction, incl, _ = rec.unpack(data[off : off + 16])
        off += 16
        if off + incl > len(data):
            if allow_truncated:
                return
            raise ValueError("pcap record payload is truncated")
        yield _local_wall_clock_to_instant(seconds + fraction / timestamp_scale), data[off : off + incl]
        off += incl


def _pcapng_timestamp_divisor(options: bytes, endian: str) -> int:
    """Read if_tsresol (option 9) from an Interface Description Block's option list.

    The default really is microseconds, but it is written as an option often enough that
    assuming it is how a capture ends up dated to 1970 or to the far future.
    """
    off = 0
    while off + 4 <= len(options):
        code, length = struct.unpack(f"{endian}HH", options[off : off + 4])
        value = options[off + 4 : off + 4 + length]
        off += 4 + length + (-length % 4)
        if code == 0:  # opt_endofopt
            break
        if code == 9 and len(value) == 1:
            resolution = value[0]
            exponent: int = resolution & 0x7F
            # int(...) because mypy widens int ** int to Any: a negative exponent would give
            # a float. The 0x7F mask makes that impossible here.
            return int(2**exponent) if resolution & 0x80 else int(10**exponent)
    return 1_000_000


def _iter_pcapng(data: bytes, *, allow_truncated: bool) -> Iterator[tuple[datetime, bytes]]:
    endian = "<"
    divisors: dict[int, int] = {}
    off = 0
    while off + 8 <= len(data):
        block_type = struct.unpack(f"{endian}I", data[off : off + 4])[0]
        if block_type == _PCAPNG_SHB:
            # A new section restarts interface numbering and may flip byte order.
            if data[off + 8 : off + 12] == b"\x1a\x2b\x3c\x4d":
                endian = ">"
            elif data[off + 8 : off + 12] == b"\x4d\x3c\x2b\x1a":
                endian = "<"
            else:
                raise ValueError("pcapng section header has no recognisable byte-order magic")
            divisors = {}
        block_length = struct.unpack(f"{endian}I", data[off + 4 : off + 8])[0]
        if block_length < 12 or off + block_length > len(data):
            if allow_truncated:
                return
            raise ValueError("pcapng block is truncated")
        body = data[off + 8 : off + block_length - 4]
        if block_type == _PCAPNG_IDB:
            link_type = struct.unpack(f"{endian}H", body[0:2])[0]
            if link_type != _LINKTYPE_BLUETOOTH_HCI_H4_WITH_PHDR:
                raise ValueError("pcapng is not DLT_BLUETOOTH_HCI_H4_WITH_PHDR")
            divisors[len(divisors)] = _pcapng_timestamp_divisor(body[8:], endian)
        elif block_type == _PCAPNG_EPB:
            interface_id, high, low, captured = struct.unpack(f"{endian}IIII", body[0:16])
            divisor = divisors.get(interface_id, 1_000_000)
            timestamp = datetime.fromtimestamp(((high << 32) | low) / divisor, UTC)
            yield timestamp, body[20 : 20 + captured]
        off += block_length


def iter_frames(data: bytes, *, allow_truncated: bool = False) -> Iterator[tuple[datetime, bytes]]:
    """Yield ``(instant, link-type-201 frame)`` from either capture container.

    Classic pcap comes from idevicebtlogger and pcapng from pymobiledevice3's btlogger.
    The frames are byte-identical between them, so dispatching here is the whole of the
    difference and nothing below this point needs to know which tool produced the file.
    """
    if data[:4] == struct.pack("<I", _PCAPNG_SHB):
        yield from _iter_pcapng(data, allow_truncated=allow_truncated)
    else:
        yield from _iter_classic_pcap(data, allow_truncated=allow_truncated)


def _format_address(raw: bytes) -> str:
    return ":".join(f"{part:02X}" for part in reversed(raw))


def _connection_event(timestamp: datetime, h4: bytes) -> ConnectionEvent | None:
    if len(h4) < 3 or h4[0] != 0x04:
        return None
    event_code = h4[1]
    params = h4[3 : 3 + h4[2]]
    if event_code == 0x3E and len(params) >= 12 and params[0] in (0x01, 0x0A, 0x29):
        if params[1] != 0:
            return None
        return ConnectionEvent(
            timestamp=timestamp,
            connection_handle=struct.unpack("<H", params[2:4])[0] & 0x0FFF,
            address=_format_address(params[6:12]),
            connected=True,
        )
    if event_code == 0x05 and len(params) >= 4 and params[0] == 0:
        return ConnectionEvent(
            timestamp=timestamp,
            connection_handle=struct.unpack("<H", params[1:3])[0] & 0x0FFF,
            address=None,
            connected=False,
        )
    return None


def parse_capture(data: bytes, *, allow_truncated: bool = False) -> CaptureTrace:
    """Parse connection lifecycle and attributed ATT records from an iPhone HCI capture."""
    active_connections: dict[int, str] = {}
    connection_events: list[ConnectionEvent] = []
    att_records: list[AttRecord] = []
    for timestamp, pkt in iter_frames(data, allow_truncated=allow_truncated):
        if len(pkt) < 5:
            continue
        direction = "RX" if (struct.unpack(">I", pkt[0:4])[0] & 1) else "TX"
        h4 = pkt[4:]
        if event := _connection_event(timestamp, h4):
            if event.connected and event.address is not None:
                active_connections[event.connection_handle] = event.address
            else:
                active_connections.pop(event.connection_handle, None)
            connection_events.append(event)
            continue
        if h4[0] != 0x02:  # H4 ACL only
            continue
        acl = h4[1:]
        if len(acl) < 8:
            continue
        connection_handle = struct.unpack("<H", acl[0:2])[0] & 0x0FFF
        l2_len, cid = struct.unpack("<HH", acl[4:8])
        if cid != ATT_CID:
            continue
        att = acl[8 : 8 + l2_len]
        if not att:
            continue
        opcode = att[0]
        if opcode not in WRITE_OPCODES or len(att) < 3:
            continue
        att_records.append(
            AttRecord(
                timestamp=timestamp,
                direction=direction,
                connection_handle=connection_handle,
                address=active_connections.get(connection_handle),
                opcode=opcode,
                attribute_handle=struct.unpack("<H", att[1:3])[0],
                value=att[3:],
            )
        )
    return CaptureTrace(tuple(connection_events), tuple(att_records))


def active_connections_at(trace: CaptureTrace, timestamp: datetime) -> dict[int, str]:
    active: dict[int, str] = {}
    for event in trace.connections:
        if event.timestamp > timestamp:
            break
        if event.connected and event.address is not None:
            active[event.connection_handle] = event.address
        else:
            active.pop(event.connection_handle, None)
    return active


def _iter_att(data: bytes) -> Iterator[tuple[str, int, int, bytes]]:
    """Yield the legacy (direction, opcode, attribute handle, value) ATT tuples."""
    for record in parse_capture(data).att:
        yield record.direction, record.opcode, record.attribute_handle, record.value


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show_all = "--all" in sys.argv
    if not args:
        print(__doc__)
        return 2
    data = open(args[0], "rb").read()
    rows = []
    seen: set[bytes] = set()
    total = govee = 0
    for record in parse_capture(data).att:
        direction = record.direction
        opcode = record.opcode
        handle = record.attribute_handle
        value = record.value
        total += 1
        if _is_govee(value):
            govee += 1
            first = value not in seen
            seen.add(value)
            rows.append((direction, WRITE_OPCODES[opcode], handle, value, label(value, direction), first))
        elif show_all and value:
            rows.append((direction, WRITE_OPCODES[opcode], handle, value, "(non-govee)", True))

    print(f"# {args[0]}")
    print(f"# ATT writes/notifications: {total}   Govee packets: {govee}   unique Govee: {len(seen)}")
    print(f"# {'dir':<3} {'op':<12} {'hdl':<6} {'payload (hex)':<41} label")
    for direction, op, handle, value, lab, first in rows:
        mark = " " if first else "."
        print(f"{mark} {direction:<3} {op:<12} {handle:#06x} {value.hex():<41} {lab}")
    if not show_all:
        print("# ('.' = repeat of an earlier packet; pass --all to include non-Govee ATT values)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
