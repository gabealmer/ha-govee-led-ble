#!/usr/bin/env python3
"""Regenerate the capture-container fixture pair under ``tests/fixtures``.

The pair is the evidence that ``decode_govee.iter_frames`` reads the two containers an
iPhone HCI capture arrives in and dates both to the same instant: ``govee_hci.pcap`` as
``idevicebtlogger`` wrote it, and ``govee_hci.pcapng`` as ``pymobiledevice3 btlogger
capture --format pcapng`` writes it now.

The pcapng half is produced by pymobiledevice3's OWN ``write_pcapng_stream``, not by a
local imitation of it, because the point of the fixture is to pin our reader against the
real producer. That makes this script's dependency heavier than the project's, so it is
run by hand when the producer changes rather than by the gate:

    uv run --with pymobiledevice3 python tools/ble/make_container_fixtures.py

CONTENT. The frames wrap representative Govee packets defined below, around a synthetic
connection to a documentation BLE address. No real capture is used: a capture holds the
addresses of every other Bluetooth peer that happened to be near the phone, and none of
that is ours to publish.

TIME. ``idevicebtlogger`` stored the BTPacketLogger record's device-local wall clock as
though it were UTC; ``write_pcapng_stream`` subtracts the device's UTC offset so the pcapng
holds a true instant. Both halves below describe the SAME instants, written each way, so a
reader that agrees on them has reconciled the difference rather than papered over it.
"""

import asyncio
import struct
import sys
from datetime import UTC, datetime
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "tools" / "ble"))

from pymobiledevice3.services.bt_packet_logger import (  # noqa: E402
    HCI_H4_TYPE_BY_PACKET_TYPE,
    write_pcapng_stream,
)

FIXTURES = REPO / "tests" / "fixtures"

# The phone's UTC offset at the moment of capture. Baked in rather than read from the host
# so the fixture is identical wherever it is regenerated.
TZ_OFFSET_SECONDS = 10 * 3600
BASE_INSTANT = datetime(2026, 7, 24, 12, 12, 55, 856000, tzinfo=UTC)

CONNECTION_HANDLE = 0x0040
# D0:35:34 is Govee's OUI, kept real so the fixture still looks like the traffic it stands
# in for, followed by an obviously invented tail. Same convention as
# tools/harness/devices.local.env.example, so there is one recognisable-but-fake shape.
# HCI stores the human-readable address in little-endian wire order.
PEER_ADDRESS = bytes.fromhex("D03534AABBCC")[::-1]

WRITE_HANDLE = 0x0014
NOTIFY_HANDLE = 0x0010

# The decoder distinguishes the 0x33 command and 0xAA status families.
TX_FRAMES = (
    bytes.fromhex("3301010000000000000000000000000000000033"),
    bytes.fromhex("3304330000000000000000000000000000000004"),
    bytes.fromhex("33051501ff00000000000000ff7f00000000005d"),
)
RX_FRAMES = (
    bytes.fromhex("aa040500000000000000000000000000000000ab"),
    bytes.fromhex("aa050a980000000000000000000000000000003d"),
)


def phdr(direction_in: int, h4_type: int, payload: bytes) -> bytes:
    return struct.pack(">I", direction_in) + bytes([h4_type]) + payload


def hci_event(event_code: int, params: bytes) -> bytes:
    return phdr(1, 0x04, bytes([event_code, len(params)]) + params)


def le_connection_complete() -> bytes:
    params = (
        bytes([0x01, 0x00])
        + struct.pack("<H", CONNECTION_HANDLE)
        + bytes([0x00, 0x00])
        + PEER_ADDRESS
        + struct.pack("<HHH", 0x0006, 0x0000, 0x01F4)
        + bytes([0x00])
    )
    return hci_event(0x3E, params)


def disconnection_complete() -> bytes:
    return hci_event(0x05, bytes([0x00]) + struct.pack("<H", CONNECTION_HANDLE) + bytes([0x16]))


def att_frame(direction_in: int, opcode: int, attribute_handle: int, value: bytes) -> bytes:
    att = bytes([opcode]) + struct.pack("<H", attribute_handle) + value
    l2cap = struct.pack("<HH", len(att), 0x0004) + att
    acl = struct.pack("<HH", CONNECTION_HANDLE, len(l2cap)) + l2cap
    return phdr(direction_in, 0x02, acl)


def build_frames() -> list[tuple[datetime, bytes]]:
    frames = [le_connection_complete()]
    for value in TX_FRAMES:
        frames.append(att_frame(0, 0x52, WRITE_HANDLE, value))
    for value in RX_FRAMES:
        frames.append(att_frame(1, 0x1B, NOTIFY_HANDLE, value))
    frames.append(disconnection_complete())
    # 250 ms apart, which keeps every frame inside one second boundary group and still gives
    # the sub-second field a value that a divisor bug would visibly mangle.
    return [(BASE_INSTANT.fromtimestamp(BASE_INSTANT.timestamp() + i * 0.25, UTC), f) for i, f in enumerate(frames)]


def write_classic_pcap(path: Path, frames: list[tuple[datetime, bytes]]) -> None:
    """Write the frames the way idevicebtlogger did: local wall clock stored as UTC."""
    out = bytearray(struct.pack("<IHHiIII", 0xA1B2C3D4, 2, 4, 0, 0, 0x40000, 201))
    for instant, frame in frames:
        local_epoch = instant.timestamp() + TZ_OFFSET_SECONDS
        seconds = int(local_epoch)
        out += struct.pack("<IIII", seconds, round((local_epoch - seconds) * 1_000_000), len(frame), len(frame))
        out += frame
    path.write_bytes(bytes(out))


async def write_pcapng(path: Path, frames: list[tuple[datetime, bytes]]) -> None:
    """Write the same frames through pymobiledevice3's real writer."""
    inverse = {v: k for k, v in HCI_H4_TYPE_BY_PACKET_TYPE.items()}

    async def records():
        for instant, frame in frames:
            packet_type = inverse[(frame[4], struct.unpack(">I", frame[0:4])[0])]
            payload = frame[5:]
            local_epoch = instant.timestamp() + TZ_OFFSET_SECONDS
            seconds = int(local_epoch)
            yield (
                struct.pack(">III", len(payload) + 9, seconds, round((local_epoch - seconds) * 1_000_000))
                + bytes([packet_type])
                + payload
            )

    with path.open("wb") as out:
        await write_pcapng_stream(out, records(), "18.0", TZ_OFFSET_SECONDS)


def main() -> int:
    FIXTURES.mkdir(parents=True, exist_ok=True)
    frames = build_frames()
    write_classic_pcap(FIXTURES / "govee_hci.pcap", frames)
    asyncio.run(write_pcapng(FIXTURES / "govee_hci.pcapng", frames))
    # What a capture that started and received NOTHING actually looks like. FileWriter emits
    # the section and interface blocks when it is constructed, before the first record is
    # awaited, so a dead HCI stream leaves a well-formed file rather than an empty one. It
    # parses cleanly to zero frames, which is why the capture preflight counts frames
    # instead of trusting that a parse succeeded.
    asyncio.run(write_pcapng(FIXTURES / "govee_hci_empty.pcapng", []))
    for name in ("govee_hci.pcap", "govee_hci.pcapng", "govee_hci_empty.pcapng"):
        print(f"{name}: {(FIXTURES / name).stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
