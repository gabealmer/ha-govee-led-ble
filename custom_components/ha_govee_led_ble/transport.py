"""BLE transport framing shared by commands and effect uploads."""

import math

WRITE_UUID = "00010203-0405-0607-0809-0a0b0c0d2b11"
READ_UUID = "00010203-0405-0607-0809-0a0b0c0d2b10"

_A3_FRAME_PREFIX = 0xA3
A3_CHUNK_SIZE = 17


def xor_checksum(data: bytes | bytearray) -> int:
    checksum = 0
    for part in data:
        checksum ^= part
    return checksum


def _a3_frame(index: int, chunk: bytes) -> bytes:
    packet = bytearray([_A3_FRAME_PREFIX, index, *chunk])
    packet = (packet + bytearray(19 - len(packet)))[:19]
    packet.append(xor_checksum(packet))
    return bytes(packet)


def fragment_a3(type_byte: int, body: bytes, *, terminator: bool = False) -> list[bytes]:
    """Fragment one A3 body using the app's data-frame and terminator rules."""
    data = bytes([type_byte]) + body
    chunk_count = math.ceil((len(data) + 2) / A3_CHUNK_SIZE)
    trailing_terminator = terminator or chunk_count == 1
    payload = bytes([0x01, chunk_count + (1 if trailing_terminator else 0)]) + data
    chunks = [payload[index : index + A3_CHUNK_SIZE] for index in range(0, len(payload), A3_CHUNK_SIZE)]
    last = len(chunks) - 1
    packets = [
        _a3_frame(index if trailing_terminator or index != last else 0xFF, chunk) for index, chunk in enumerate(chunks)
    ]
    if trailing_terminator:
        packets.append(_a3_frame(0xFF, b""))
    return packets


def fragment_a3_envelope(envelope: bytes) -> list[bytes]:
    """Fragment a generated A3 envelope whose line count already includes padding."""
    if len(envelope) < 2 or envelope[0] != 0x01 or len(envelope) != envelope[1] * A3_CHUNK_SIZE:
        raise ValueError("A3 envelope does not match its chunk count")
    chunks = [envelope[index : index + A3_CHUNK_SIZE] for index in range(0, len(envelope), A3_CHUNK_SIZE)]
    return [_a3_frame(index if index + 1 < len(chunks) else 0xFF, chunk) for index, chunk in enumerate(chunks)]
