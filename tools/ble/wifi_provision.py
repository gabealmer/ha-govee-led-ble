#!/usr/bin/env python3
r"""Build an H6199 Wi-Fi provisioning sequence (BLE ``a1 11``).

WHY THIS IS NOT IN protocol.py. That module is the integration's encoder and ships inside a
Home Assistant custom component. Nothing in the integration provisions Wi-Fi, and a
credential-writing encoder is not something to ship into every install of it for the sake of
tidiness. It lives here with the other research tools instead, and the wire structure it
produces is owned by ``kaitai/h6199_wifi_body.ksy`` and ``kaitai/h6199_wifi_provision.ksy``.

THE SAFETY ARGUMENT IS THE DIFF, NOT THE CODE. We have exactly one sequence this firmware is
known to accept, and the fragmentation rule is confirmed at that single point. So
``verify_against`` rebuilds that known-accepted sequence and compares byte for byte, and a
new push is chosen to have the SAME field lengths so that only the characters differ. Run
``compare`` before sending anything to hardware; a difference outside the SSID and
passphrase windows means the rule has been extrapolated rather than applied.

NEVER PASS A PASSPHRASE AS AN ARGUMENT. argv is world-readable through /proc for the life of
the process. ``build`` reads the network from stdin as two lines, ssid then passphrase, and
``govee_send.py send -`` reads the frames it produces the same way::

    printf '%s\n%s\n' "$SSID" "$PASSPHRASE" |
      python tools/ble/wifi_provision.py build |
      python tools/ble/govee_send.py send - --address <addr> --gap 0.3 --listen 40
"""

from __future__ import annotations

import argparse
import math
import sys

FRAME_LEN = 20
PAYLOAD_LEN = 16
SUB_OPCODE = 0x11
HEADER_INDEX = 0x00
TERMINATOR_INDEX = 0xFF

# The endpoint the app selects for this device's reported support level. Sending a different
# one is the untested lever described in h6199_wifi_body.ksy, not a normal parameter.
DEFAULT_API = "https://device.govee.com"

# The one sequence this firmware is known to have accepted: it drew the a1 11 write-ack and
# then ee 11 01, a genuine failure of a network invented to be impossible, which is still a
# structural acceptance of the frames. Fabricated credentials, committed deliberately.
KNOWN_ACCEPTED_SSID = "FAKENET"
# noqa justified rather than renamed: this IS a hardcoded passphrase and the linter is right
# to say so. It is committed on purpose, for a network that has never existed, because the
# fixture it anchors is what proves the encoder still produces bytes this firmware accepted.
# Renaming the constant to slip past the check would hide exactly the thing worth flagging.
KNOWN_ACCEPTED_PASSWORD = "12345678"  # noqa: S105
KNOWN_ACCEPTED_FRAMES = [
    "a1110004000000000000000000000000000000b4",
    "a111010746414b454e45540831323334353637d8",
    "a1110238000a0000001868747470733a2f2f64ad",
    "a1110365766963652e676f7665652e636f6d00d0",
    "a1110400000000000000000000000000000000b4",
    "a111ff000000000000000000000000000000004f",
]


def build_body(
    ssid: str,
    password: str,
    *,
    api: str = DEFAULT_API,
    run_mode: int = 0x00,
    tz_hour: int = 10,
    iot_version: int = 0x00,
    tz_minute: int = 0x00,
    matter_wifi_flag: int = 0x00,
    security_type: int = 0x00,
) -> bytes:
    """Assemble the reassembled provisioning body; see h6199_wifi_body.ksy for every field.

    The two trailing bytes are always sent. The vendor code appends them on a branch whose
    condition is false in our captures, yet the bytes are on the wire, so the wire wins:
    a 47-byte body has never been acknowledged by this firmware and a 49-byte one has.
    """
    ssid_bytes, password_bytes, api_bytes = ssid.encode(), password.encode(), api.encode()
    if len(ssid_bytes) > 0xFF or len(password_bytes) > 0xFF:
        raise ValueError("ssid and passphrase are length-prefixed with a single byte")
    return (
        bytes([len(ssid_bytes)])
        + ssid_bytes
        + bytes([len(password_bytes)])
        + password_bytes
        + bytes([run_mode, tz_hour, iot_version, tz_minute])
        + len(api_bytes).to_bytes(2, "big")
        + api_bytes
        + bytes([matter_wifi_flag, security_type])
    )


def _frame(index: int, payload: bytes) -> bytes:
    body = bytes([0xA1, SUB_OPCODE, index]) + payload.ljust(PAYLOAD_LEN, b"\x00")
    checksum = 0
    for byte in body:
        checksum ^= byte
    return body + bytes([checksum])


def build_sequence(body: bytes) -> list[bytes]:
    """Fragment a body into the header / data / terminator sequence the device expects.

    ``ceil(len / 16)`` with no fixed buffer and no padding to a minimum, and the terminator
    is always appended rather than being the last data frame renumbered. Both differ from
    the H617A's 0xA3 fragmenter, which is why neither model's framing may be assumed of the
    other.
    """
    count = math.ceil(len(body) / PAYLOAD_LEN)
    padded = body.ljust(count * PAYLOAD_LEN, b"\x00")
    frames = [_frame(HEADER_INDEX, bytes([count]))]
    frames += [_frame(index + 1, padded[index * PAYLOAD_LEN : (index + 1) * PAYLOAD_LEN]) for index in range(count)]
    frames.append(_frame(TERMINATOR_INDEX, b""))
    return frames


def build(ssid: str, password: str, api: str = DEFAULT_API) -> list[bytes]:
    """Body plus framing, for the ordinary case where only the network changes."""
    return build_sequence(build_body(ssid, password, api=api))


def verify_against_known_accepted() -> bool:
    """Rebuild the sequence this firmware accepted and check it byte for byte."""
    built = [frame.hex() for frame in build(KNOWN_ACCEPTED_SSID, KNOWN_ACCEPTED_PASSWORD)]
    return built == KNOWN_ACCEPTED_FRAMES


def _read_network() -> tuple[str, str]:
    lines = sys.stdin.read().splitlines()
    if len(lines) < 2:
        raise SystemExit("stdin must hold two lines: ssid then passphrase")
    return lines[0].strip(), lines[1].strip()


def cmd_build(_: argparse.Namespace) -> int:
    ssid, password = _read_network()
    if not verify_against_known_accepted():
        raise SystemExit("refusing to build: the encoder no longer reproduces a known-accepted sequence")
    for frame in build(ssid, password):
        print(frame.hex())
    return 0


def cmd_compare(_: argparse.Namespace) -> int:
    """Show exactly which bytes a push would differ by, against the accepted sequence."""
    ssid, password = _read_network()
    new = build(ssid, password)
    old = build(KNOWN_ACCEPTED_SSID, KNOWN_ACCEPTED_PASSWORD)
    print(f"encoder reproduces the known-accepted sequence: {verify_against_known_accepted()}")
    print(f"writes: {len(new)} vs {len(old)}")
    if len(new) != len(old):
        print("DIFFERENT SHAPE: the fragmentation rule is being extrapolated, not applied")
        return 1
    for position, (a, b) in enumerate(zip(new, old, strict=True)):
        differing = [i for i in range(FRAME_LEN) if a[i] != b[i]]
        where = (
            "identical"
            if not differing
            else "differs at " + ", ".join("checksum" if i == 19 else f"byte{i}" for i in differing)
        )
        print(f"  frame {position} idx={a[2]:#04x}  {where}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("build", help="print the frames for a network read from stdin").set_defaults(func=cmd_build)
    sub.add_parser("compare", help="diff a network's frames against the known-accepted sequence").set_defaults(
        func=cmd_compare
    )
    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
