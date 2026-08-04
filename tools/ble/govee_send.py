#!/usr/bin/env python3
r"""Drive a Govee H617A RGBIC LED strip over BLE to verify the reverse-engineered protocol.

This runs on the lab against the host Bluetooth radio. An LXC gets its own network
namespace and the kernel only allows ``AF_BLUETOOTH`` in ``init_net``, so BlueZ stays on
the Proxmox host and the guest borrows its D-Bus socket. Bleak's BlueZ backend is pure
D-Bus and opens no socket of its own, so nothing here changes; the wrapper points one
command at the host bus::

    with-host-bluetooth uv run --no-sync python tools/ble/govee_send.py scan

Govee frames are exactly 20 bytes: header 0x33 (command), 0xAA (query/status) or 0xA3
(multi-frame fragment), with ``byte[19] = XOR(byte[0..18])``. A frame given as fewer than
20 bytes is zero-padded to 19 bytes and the XOR checksum is appended automatically; a full
20-byte frame is sent verbatim (its checksum is only reported, never rewritten).

Subcommands:
  build   Complete a frame (zero-pad + checksum) and print it. No BLE, so it is offline-testable.
  scan    Discovery only: list devices (name/address/RSSI); flag Govee_H617A_*. Does not connect.
  send    Connect, write one or more frames, optionally subscribe and print notifications.
  query   Connect, subscribe, send the standard status queries, and print the 20-byte replies.

Only ``build`` and ``scan`` are safe while the vendor app holds the (single) BLE connection.
``send`` and ``query`` open a connection and must be run at a coordinated pause.

``send`` and ``query`` REQUIRE ``--address``. They will not find a device for you: with more
than one Govee strip in range, name-prefix discovery picks whichever is loudest right now, and
that answer changes between invocations. Run ``scan`` once, then name the device you mean.
"""

from __future__ import annotations

import argparse
import asyncio
import re
import sys
import time

WRITE_UUID = "00010203-0405-0607-0809-0a0b0c0d2b11"
NOTIFY_UUID = "00010203-0405-0607-0809-0a0b0c0d2b10"
DEFAULT_NAME_PREFIX = "Govee_H617A_"
FRAME_LEN = 20

# Standard status queries the app issues; replies arrive on the notify characteristic.
QUERY_FRAMES = [
    "aa 01",
    "aa 04",
    "aa 05",
    "aa 06",
    "aa 07",
    "aa 23",
    "aa a5 01",
    "aa a5 02",
    "aa a5 03",
    "aa a5 04",
    "aa a5 05",
]

# 0xAA status/query types, mirrored from decode_govee.py so labels stay consistent.
AA_TYPES = {
    0x01: "power",
    0x04: "brightness",
    0x05: "colormode",
    0x06: "fw-ver",
    0x07: "hw-ver",
    0x0B: "?0b",
    0x11: "?11",
    0x12: "?12",
    0x23: "segcfg",
    0x40: "count?",
    0xA3: "multi",
    0xA5: "segments",
}
CMD_MODES = {0x15: "static", 0x04: "scene", 0x00: "video", 0x13: "music", 0x0A: "diy"}

# Domains seen acknowledging a write; mirrored from decode_govee.label so the two
# labellers cannot drift.
ACK_DOMAINS = {0x01: "power", 0x04: "brightness", 0x05: "colour", 0x09: "time/cfg", 0xA9: "calibration"}


def xor_checksum(data: bytes) -> int:
    """XOR of every byte; Govee uses this over bytes 0..18 as the 20th byte."""
    checksum = 0
    for byte in data:
        checksum ^= byte
    return checksum


def sum8_checksum(data: bytes) -> int:
    """Low 8 bits of the sum; used by the 7-byte a5 02 83 phone-microphone stream.

    A genuinely different algorithm, not a coincidence: a captured 33 05 15 static
    write checksums to 0xa7 under XOR and 0xaf under sum, and a5 02 83 0f 0f 00 gives
    0x48 under sum against 0x24 under XOR. The device selects by opcode.
    """
    return sum(data) & 0xFF


def parse_hex(text: str) -> bytes:
    """Parse a hex frame with or without spaces/colons/0x, e.g. '33 01 01' or '330101'."""
    cleaned = re.sub(r"[\s:_-]", "", text)
    if cleaned[:2].lower() == "0x":
        cleaned = cleaned[2:]
    return bytes.fromhex(cleaned)


def complete_frame(text: str, mode: str = "xor") -> bytes:
    """Complete a frame according to the checksum family.

    mode='xor'  (default, unchanged behaviour): the 20-byte 33/aa/a3 family. Verbatim
                if already 20 bytes, else zero-padded to 19 and the XOR appended.
    mode='sum8': the 7-byte a5 02 83 stream family. NOT padded, because these frames
                are short by design; the sum8 of exactly the bytes given is appended.
    mode='raw':  send precisely what was given, at any length, with no padding and no
                checksum. The escape hatch for probing a family we have not modelled.
    """
    raw = parse_hex(text)
    if mode == "raw":
        return raw
    if mode == "sum8":
        return raw + bytes([sum8_checksum(raw)])
    if len(raw) > FRAME_LEN:
        raise ValueError(f"{text!r} is {len(raw)} bytes; frames are at most {FRAME_LEN}")
    if len(raw) == FRAME_LEN:
        return raw
    body = raw.ljust(FRAME_LEN - 1, b"\x00")
    return body + bytes([xor_checksum(body)])


def _ascii(data: bytes) -> str:
    return "".join(chr(x) for x in data if 32 <= x < 127)


def _describe_aa(frame: bytes, direction: str) -> str:
    kind = frame[1]
    name = AA_TYPES.get(kind, f"type=0x{kind:02x}")
    if direction == "TX":
        return f"query {name}"
    data = frame[2:19]
    if kind in (0x06, 0x07):
        return f"reply {name}={_ascii(data)!r}"
    if kind == 0x01:
        return f"reply power={'on' if data[0] else 'off'}"
    if kind == 0x05:
        return f"reply colormode 0x{data[0]:02x} 0x{data[1]:02x}"
    if kind == 0x40:
        return f"reply count?={data[0] * 256 + data[1]}"
    if kind == 0x04:
        return f"reply brightness={data[0]}%"
    if kind == 0xA5:
        segs = " ".join(data[1:13][i : i + 4].hex() for i in range(0, 12, 4))
        return f"reply segments group={data[0]} [{segs}]"
    return f"reply {name} {data.hex()}"


def describe(frame: bytes, direction: str) -> str:
    """Best-effort human label for a frame; direction is 'TX' (write) or 'RX' (notify)."""
    if len(frame) == 7 and frame[0] == 0xA5 and frame[1] == 0x02 and frame[2] == 0x83:
        ok = frame[6] == sum8_checksum(frame[:6])
        return f"mic-stream rgb=({frame[3]},{frame[4]},{frame[5]}) sum8{'' if ok else ' MISMATCH'}"
    if len(frame) != FRAME_LEN:
        return f"(len={len(frame)})"
    head = frame[0]
    if head == 0xA3:
        return f"multi-frame idx=0x{frame[1]:02x} {frame[2:12].hex()}"
    if head == 0xAA:
        return _describe_aa(frame, direction)
    if head != 0x33:
        return "?"
    action = frame[1]
    # A write draws a 33 <same action> 00 acknowledgement with an all-zero body, so an
    # inbound 0x33 frame carries no set value. Labelling it as a command invents one:
    # the ack for `33 04 07` is `33 04 00`, which reads as "brightness 0%" if direction
    # is ignored. decode_govee.label applies the same rule.
    if direction == "RX":
        return f"ack {ACK_DOMAINS.get(action, f'action=0x{action:02x}')}"
    if action == 0x01:
        return f"power {'on' if frame[2] else 'off'}"
    if action == 0x04:
        return f"brightness {frame[2]}%"
    if action == 0x05:
        mode = frame[2]
        if mode == 0x15 and frame[3] == 0x01:
            return f"static color rgb=({frame[4]},{frame[5]},{frame[6]}) mask=0x{frame[13]:02x}{frame[12]:02x}"
        if mode == 0x15 and frame[3] == 0x02:
            return f"static brightness {frame[4]}% mask=0x{frame[6]:02x}{frame[5]:02x}"
        detail = CMD_MODES.get(mode, f"mode=0x{mode:02x}")
        return f"{detail} sub=0x{frame[3]:02x} {frame[3:13].hex()}"
    return f"cmd action=0x{action:02x} {frame[2:13].hex()}"


async def cmd_scan(args: argparse.Namespace) -> int:
    from bleak import BleakScanner

    print(f"# scanning {args.seconds:.0f}s (discovery only; no connection is made)...", file=sys.stderr)
    found = await BleakScanner.discover(timeout=args.seconds, return_adv=True)
    rows = []
    for device, adv in found.values():
        name = adv.local_name or device.name or ""
        rssi = adv.rssi if adv.rssi is not None else -999
        rows.append((rssi, device.address, name))
    rows.sort(key=lambda row: row[0], reverse=True)
    matches = [row for row in rows if row[2].startswith(args.name_prefix)]

    print(f"# {len(rows)} device(s) seen; {len(matches)} matching {args.name_prefix!r}")
    print(f"# {'RSSI':>5}  {'ADDRESS':<18}  NAME")
    for rssi, address, name in rows:
        flag = f"  <== matches {args.name_prefix!r}" if name.startswith(args.name_prefix) else ""
        shown = str(rssi) if rssi != -999 else "n/a"
        print(f"  {shown:>5}  {address:<18}  {name!r}{flag}")
    for rssi, address, name in matches:
        print(f"MATCH name={name} address={address} rssi={rssi}")
    if not matches:
        print(f"# no device matching {args.name_prefix!r} found", file=sys.stderr)
        return 1
    return 0


def resolve_frame_texts(texts: list[str]) -> list[str]:
    """Expand a literal ``-`` into frames read from stdin, one per line.

    A frame carrying a Wi-Fi passphrase must never be an argument: argv is world-readable
    through /proc for the life of the process, so passing provisioning frames on the command
    line leaks the credential to every account on the box. This is the same reason wda.py
    reads typed text from stdin, and the reason that verb exists at all.

    Blank lines and ``#`` comments are dropped, so a generated frame file can explain itself.
    """
    if texts != ["-"]:
        return texts
    out = []
    for line in sys.stdin.read().splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            out.append(line)
    if not out:
        raise ValueError("no frames on stdin")
    return out


async def cmd_send(args: argparse.Namespace) -> int:
    from bleak import BleakClient

    frames = [complete_frame(text, args.checksum) for text in resolve_frame_texts(args.frames)]
    response = {"auto": None, "yes": True, "no": False}[args.response]
    target = args.address

    start = time.monotonic()
    notifications: list[bytes] = []

    def on_notify(_characteristic, data: bytearray) -> None:
        payload = bytes(data)
        notifications.append(payload)
        print(f"  NOTIFY  t={time.monotonic() - start:5.2f}s  {payload.hex()}  {describe(payload, 'RX')}")

    async with BleakClient(target, timeout=args.timeout) as client:
        print(f"# connected to {client.address}")
        if args.listen > 0:
            await client.start_notify(NOTIFY_UUID, on_notify)
        start = time.monotonic()
        for frame in frames:
            print(f"  WRITE            {frame.hex()}  {describe(frame, 'TX')}")
            await client.write_gatt_char(WRITE_UUID, frame, response=response)
            await asyncio.sleep(args.gap)
        if args.listen > 0:
            print(f"# listening {args.listen:.1f}s for notifications...", file=sys.stderr)
            await asyncio.sleep(args.listen)
            await client.stop_notify(NOTIFY_UUID)
            print(f"# {len(notifications)} notification(s) received")
    return 0


async def cmd_query(args: argparse.Namespace) -> int:
    from bleak import BleakClient

    frames = [(text, complete_frame(text)) for text in QUERY_FRAMES]
    target = args.address

    start = time.monotonic()
    replies: list[bytes] = []

    def on_notify(_characteristic, data: bytearray) -> None:
        payload = bytes(data)
        replies.append(payload)
        print(f"  REPLY  t={time.monotonic() - start:5.2f}s  {payload.hex()}  {describe(payload, 'RX')}")

    async with BleakClient(target, timeout=args.timeout) as client:
        print(f"# connected to {client.address}")
        await client.start_notify(NOTIFY_UUID, on_notify)
        start = time.monotonic()
        for text, frame in frames:
            print(f"  QUERY            {frame.hex()}  {describe(frame, 'TX')}  ({text})")
            await client.write_gatt_char(WRITE_UUID, frame, response=None)
            await asyncio.sleep(args.gap)
        print(f"# waiting {args.listen:.1f}s for replies...", file=sys.stderr)
        await asyncio.sleep(args.listen)
        await client.stop_notify(NOTIFY_UUID)
        print(f"# {len(replies)} reply packet(s) received")
    return 0


def cmd_build(args: argparse.Namespace) -> int:
    status = 0
    for text in args.frames:
        try:
            raw = parse_hex(text)
            frame = complete_frame(text, args.checksum)
        except ValueError as exc:
            print(f"error: {exc}", file=sys.stderr)
            status = 1
            continue
        if args.checksum == "raw":
            note = f"raw, {len(frame)}B verbatim, no checksum appended"
        elif args.checksum == "sum8":
            note = f"sum8=0x{frame[-1]:02x} appended to {len(raw)}B, not padded"
        else:
            checksum = xor_checksum(frame[:19])
            if len(raw) == FRAME_LEN:
                note = (
                    f"xor=0x{checksum:02x} ok"
                    if raw[19] == checksum
                    else f"xor MISMATCH got=0x{raw[19]:02x} want=0x{checksum:02x}"
                )
            else:
                note = f"padded {len(raw)}->19B, xor=0x{checksum:02x} appended"
        print(f"{text!r:>26}  ->  {frame.hex()}  ({len(frame)}B, {note})  {describe(frame, 'TX')}")
    return status


def _add_checksum_arg(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--checksum",
        choices=("xor", "sum8", "raw"),
        default="xor",
        help=(
            "Frame family. 'xor' (default) is the 20-byte 33/aa/a3 family, zero-padded "
            "with an XOR checksum. 'sum8' is the 7-byte a5 02 83 phone-mic stream, "
            "appended un-padded. 'raw' sends the bytes verbatim with no checksum."
        ),
    )


def _add_connect_args(parser: argparse.ArgumentParser) -> None:
    # --address IS REQUIRED, and that is a safety property rather than an ergonomic one.
    # This used to fall back to picking whichever device advertised a matching name prefix
    # with the STRONGEST SIGNAL. With more than one Govee strip in range that is a lottery
    # re-run on every invocation: on 2026-08-01 two consecutive steps of one differential
    # landed on two different lights, and the second write went to a device the harness
    # deliberately refuses to drive (it is deliberately absent from DEVICE_BLE_ADDRESS, and
    # up.sh direct had already refused it by name). Discovery reached around that refusal,
    # because a scan consults no map at all.
    #
    # The failure is quiet, which is what makes it dangerous: both runs connect, both write
    # successfully, and the only evidence is one line of address in the log. Use `scan` to
    # find an address, then pass it. Naming a device is the caller's job.
    parser.add_argument("--address", required=True, help="Bluetooth address of the strip (see `scan`)")
    parser.add_argument("--timeout", type=float, default=20.0, help="Connect timeout in seconds (default 20)")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="govee_send.py",
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=r"""examples:
  build a frame offline (no BLE, unit-testable):
    govee_send.py build '33 01 01'
  scan (safe even while the app is connected):
    govee_send.py scan --seconds 10
  turn on, go red, then listen 3s (run at a coordinated pause):
    govee_send.py send '33 01 01' '33 05 15 01 ff 00 00 00 00 00 00 00 ff 7f' --listen 3 --address AA:BB:CC:DD:EE:FF
  read strip state back:
    govee_send.py query --address AA:BB:CC:DD:EE:FF --listen 5
""",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_build = sub.add_parser(
        "build",
        help="Complete a frame (pad + checksum) and print it; no BLE",
        description="Complete each frame body (zero-pad to 19 bytes, append the XOR "
        "checksum) and print the full 20-byte frame. Performs no BLE.",
    )
    p_build.add_argument("frames", nargs="+", metavar="HEXFRAME", help="Frame body as hex, e.g. '33 01 01' or '330101'")
    _add_checksum_arg(p_build)

    p_scan = sub.add_parser(
        "scan",
        help="List nearby BLE devices; flag Govee_H617A_* (no connection)",
        description="Discover nearby BLE devices and print name/address/RSSI, flagging "
        "any whose name matches the prefix. Does not connect to anything.",
    )
    p_scan.add_argument("--seconds", type=float, default=8.0, help="Scan duration in seconds (default 8)")
    p_scan.add_argument(
        "--name-prefix",
        default=DEFAULT_NAME_PREFIX,
        help=f"Advertised-name prefix to flag (default {DEFAULT_NAME_PREFIX!r})",
    )

    p_send = sub.add_parser(
        "send",
        help="Connect and write frames; optionally print notifications",
        description="Connect to the strip, write each frame, then optionally subscribe to "
        "the notify characteristic and print notifications. Opens a connection.",
    )
    p_send.add_argument(
        "frames",
        nargs="+",
        metavar="HEXFRAME",
        help="One or more frames (see 'build'), or a single '-' to read them from stdin",
    )
    p_send.add_argument(
        "--listen",
        type=float,
        default=0.0,
        help="Seconds to print notifications after writing (default 0 = do not listen)",
    )
    p_send.add_argument("--gap", type=float, default=0.25, help="Delay between successive writes (default 0.25)")
    p_send.add_argument(
        "--response",
        choices=["auto", "yes", "no"],
        default="auto",
        help="Write with response: auto lets bleak choose (default), yes/no force it",
    )
    _add_connect_args(p_send)
    _add_checksum_arg(p_send)

    p_query = sub.add_parser(
        "query",
        help="Connect, subscribe, send status queries, print replies",
        description="Connect, subscribe to the notify characteristic, send the standard "
        "status queries and print the 20-byte replies. Opens a connection.",
    )
    p_query.add_argument(
        "--listen", type=float, default=4.0, help="Seconds to wait for replies after sending the queries (default 4)"
    )
    p_query.add_argument("--gap", type=float, default=0.3, help="Delay between successive queries (default 0.3)")
    _add_connect_args(p_query)

    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.command == "build":
        return cmd_build(args)
    runners = {"scan": cmd_scan, "send": cmd_send, "query": cmd_query}
    try:
        return asyncio.run(runners[args.command](args))
    except SystemExit:
        raise
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
