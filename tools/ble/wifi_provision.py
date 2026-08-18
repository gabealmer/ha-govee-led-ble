#!/usr/bin/env python3
r"""Build an H6199 Wi-Fi provisioning sequence (BLE ``a1 11``).

WHY THIS IS NOT IN THE INTEGRATION. The runtime encoders ship inside a
Home Assistant custom component. Nothing in the integration provisions Wi-Fi, and a
credential-writing encoder is not something to ship into every install of it for the sake of
tidiness. It lives here with the other research tools instead, and the wire structure it
produces is owned by ``kaitai/h6199_wifi_body.ksy`` and ``kaitai/h6199_wifi_provision.ksy``.

THE SAFETY ARGUMENT IS THE DIFF, NOT THE CODE. We hold vendor-generated sequences at the
three, four and five data-frame shapes this firmware accepted. ``verify_against`` rebuilds
each one byte for byte. A new push must match the field lengths of one captured sequence so
that only field contents differ. Run ``compare`` before sending anything to hardware.

NEVER PASS A PASSPHRASE AS AN ARGUMENT. argv is world-readable through /proc for the life of
the process. ``build`` reads stdin as SSID, passphrase and an optional API URL. The API
defaults to the captured production value. ``govee_send.py send -`` reads the frames from
stdin too::

    printf '%s\n%s\n%s\n' "$SSID" "$PASSPHRASE" "$API" |
      python tools/ble/wifi_provision.py build |
      python tools/ble/govee_send.py send - --address <addr> --gap 0.3 --listen 40
"""

from __future__ import annotations

import argparse
import math
import sys
from dataclasses import dataclass

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

SHAPE3_SSID = "GVS006"
SHAPE3_PASSWORD = "B1c2D3e4"  # noqa: S105 - fabricated fixture credential
SHAPE3_FRAMES = [
    "a1110003000000000000000000000000000000b3",
    "a1110106475653303036084231633244336534cf",
    "a11102000a0000001868747470733a2f2f6465f0",
    "a11103766963652e676f7665652e636f6d0000b5",
    "a111ff000000000000000000000000000000004f",
]

SHAPE5_SSID = "GOVEE5FRAMEBOUNDARY0000"
SHAPE5_PASSWORD = "C1d2E3f4"  # noqa: S105 - fabricated fixture credential
SHAPE5_FRAMES = [
    "a1110005000000000000000000000000000000b5",
    "a1110117474f564545354652414d45424f554e86",
    "a111024441525930303030084331643245336680",
    "a1110334000a0000001868747470733a2f2f64a0",
    "a1110465766963652e676f7665652e636f6d00d7",
    "a1110500000000000000000000000000000000b5",
    "a111ff000000000000000000000000000000004f",
]


@dataclass(frozen=True)
class AcceptedSequence:
    name: str
    ssid: str
    password: str
    api: str
    frames: tuple[str, ...]

    @property
    def field_lengths(self) -> tuple[int, int, int]:
        return len(self.ssid.encode()), len(self.password.encode()), len(self.api.encode())


KNOWN_ACCEPTED_CASES = (
    AcceptedSequence(
        "four-frame",
        KNOWN_ACCEPTED_SSID,
        KNOWN_ACCEPTED_PASSWORD,
        DEFAULT_API,
        tuple(KNOWN_ACCEPTED_FRAMES),
    ),
    AcceptedSequence("three-frame", SHAPE3_SSID, SHAPE3_PASSWORD, DEFAULT_API, tuple(SHAPE3_FRAMES)),
    AcceptedSequence("five-frame", SHAPE5_SSID, SHAPE5_PASSWORD, DEFAULT_API, tuple(SHAPE5_FRAMES)),
)


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
    """Rebuild every captured accepted sequence and check it byte for byte."""
    return all(
        [frame.hex() for frame in build(case.ssid, case.password, case.api)] == list(case.frames)
        for case in KNOWN_ACCEPTED_CASES
    )


def reference_for(ssid: str, password: str, api: str = DEFAULT_API) -> AcceptedSequence | None:
    """Return the captured sequence with the same length-prefixed field widths."""
    lengths = len(ssid.encode()), len(password.encode()), len(api.encode())
    return next((case for case in KNOWN_ACCEPTED_CASES if case.field_lengths == lengths), None)


def _read_network() -> tuple[str, str, str]:
    lines = sys.stdin.read().splitlines()
    if len(lines) < 2:
        raise SystemExit("stdin must hold SSID and passphrase lines, with an optional API URL")
    api = lines[2].strip() if len(lines) > 2 and lines[2].strip() else DEFAULT_API
    return lines[0].strip(), lines[1].strip(), api


def cmd_build(_: argparse.Namespace) -> int:
    ssid, password, api = _read_network()
    if not verify_against_known_accepted():
        raise SystemExit("refusing to build: the encoder no longer reproduces every captured accepted sequence")
    if reference_for(ssid, password, api) is None:
        raise SystemExit("refusing to build: no captured sequence has these SSID, passphrase and API lengths")
    for frame in build(ssid, password, api):
        print(frame.hex())
    return 0


def cmd_compare(_: argparse.Namespace) -> int:
    """Show exactly which bytes a push would differ by, against a captured sequence."""
    ssid, password, api = _read_network()
    reference = reference_for(ssid, password, api)
    if reference is None:
        print("UNPROVEN SHAPE: no captured sequence has these SSID, passphrase and API lengths")
        return 1
    new = build(ssid, password, api)
    old = [bytes.fromhex(frame) for frame in reference.frames]
    print(f"encoder reproduces every captured accepted sequence: {verify_against_known_accepted()}")
    print(f"reference: {reference.name}")
    print(f"writes: {len(new)} vs {len(old)}")
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
