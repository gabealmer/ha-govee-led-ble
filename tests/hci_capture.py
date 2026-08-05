"""Build synthetic iPhone HCI captures, in the classic pcap container.

Shared by the decoder's attribution tests and by the capture script's, which both need a
capture with a shape no committed fixture has: two BLE connections, or a handle handed to
a second device after the first disconnects. Built here rather than copied into a real
pcap, because a real capture holds the address of every Bluetooth peer that was near the
phone and none of that is ours to publish.

Only the classic container is built. ``decode_govee.iter_frames`` reconciles the two
containers and ``test_capture_containers`` is what proves it, so nothing here needs to say
it twice.
"""

import struct
from datetime import UTC, datetime

PEER_H617A = "D0:35:34:AA:BB:CC"
PEER_H6199 = "D5:36:36:DD:EE:FF"

POWER_ON = bytes.fromhex("3301010000000000000000000000000000000033")
BRIGHTNESS = bytes.fromhex("3304320000000000000000000000000000000005")
STATUS = bytes.fromhex("aa050000000000000000000000000000000000af")

WRITE_HANDLE = 0x0014
NOTIFY_HANDLE = 0x0010

BASE_INSTANT = datetime(2026, 8, 1, 9, 0, 0, tzinfo=UTC)


def phdr(direction_in: int, h4_type: int, payload: bytes) -> bytes:
    return struct.pack(">I", direction_in) + bytes([h4_type]) + payload


def connect(handle: int, address: str) -> bytes:
    """HCI LE Connection Complete, the only event that carries a peer's address."""
    raw = bytes.fromhex(address.replace(":", ""))[::-1]
    params = (
        bytes([0x01, 0x00])
        + struct.pack("<H", handle)
        + bytes([0x00, 0x00])
        + raw
        + struct.pack("<HHH", 0x0006, 0x0000, 0x01F4)
        + bytes([0x00])
    )
    return phdr(1, 0x04, bytes([0x3E, len(params)]) + params)


def disconnect(handle: int) -> bytes:
    """HCI Disconnection Complete, which ends a handle's lifetime so it can be reissued."""
    params = bytes([0x00]) + struct.pack("<H", handle) + bytes([0x13])
    return phdr(1, 0x04, bytes([0x05, len(params)]) + params)


def att(handle: int, direction_in: int, opcode: int, attribute_handle: int, value: bytes) -> bytes:
    body = bytes([opcode]) + struct.pack("<H", attribute_handle) + value
    l2cap = struct.pack("<HH", len(body), 0x0004) + body
    return phdr(direction_in, 0x02, struct.pack("<HH", handle, len(l2cap)) + l2cap)


def write(handle: int, value: bytes) -> bytes:
    """A phone-to-light ATT Write Command on the Govee write handle."""
    return att(handle, 0, 0x52, WRITE_HANDLE, value)


def notify(handle: int, value: bytes, *, attribute_handle: int = NOTIFY_HANDLE) -> bytes:
    """A light-to-phone ATT notification."""
    return att(handle, 1, 0x1B, attribute_handle, value)


def pcap(frames: list[bytes]) -> bytes:
    out = bytearray(struct.pack("<IHHiIII", 0xA1B2C3D4, 2, 4, 0, 0, 0x40000, 201))
    for index, frame in enumerate(frames):
        epoch = BASE_INSTANT.timestamp() + index * 0.25
        seconds = int(epoch)
        out += struct.pack("<IIII", seconds, round((epoch - seconds) * 1_000_000), len(frame), len(frame))
        out += frame
    return bytes(out)


def two_unnamed_connections() -> bytes:
    """The shape of session-dreamtv-ai.pcap: two live connections, no connect event for either.

    The vendor app was already talking to both devices when recording started, which is the
    normal state of a phone that stays paired with everything in the house. Neither
    connection has an address anywhere in the capture, so the address-keyed guard saw one
    bucket. The smaller connection is deliberately tiny, for the same reason it was there:
    two frames out of two thousand is what a contaminating source looks like.
    """
    return pcap(
        [
            write(0x004E, POWER_ON),
            notify(0x004E, STATUS),
            write(0x004E, BRIGHTNESS),
            notify(0x0056, POWER_ON, attribute_handle=0x099D),
        ]
    )
