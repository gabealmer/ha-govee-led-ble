#!/usr/bin/env python3
"""Segment a Govee BLE capture by action mark and reassemble each A3 body.

Companion to ``govee-capture.sh``: that script writes ``<name>.pcap`` alongside a
``<name>.actions.tsv`` of ``mark`` timestamps. This tool slices the capture at those
marks and, for each action, prints the 0x33 command writes, the non-power 0xaa
read-backs, and the reassembled 0xA3 multi-frame body.

    analyse_capture.py <name> [--address AA:BB:...] [--tail-seconds N]

A3 REASSEMBLY. The app uses ``build_a3_multi``'s non-terminator form: the LAST data
chunk carries index 0xff, so its 17-byte payload is real data, not an empty terminator.
Dropping it truncates the body and silently corrupts trailing fields (it made a 21-byte
DIY palette look like a length mismatch on 2026-07-26). Every frame payload is kept.

CAPTURE CAVEATS. Only ``direction == "TX"`` on ``attribute_handle == 0x14`` is a phone
write; the RX ``a3 02 00...`` notification is an acknowledgement and contaminates a
reassembly if included. Marks and capture records are both timezone-aware and compared as
instants: pcapng records a true instant while classic pcap recorded device-local wall clock
as though it were UTC, and ``decode_govee.iter_frames`` reconciles the two, so a mark window
means the same thing whichever tool took the capture.
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from decode_govee import a3_body_is_complete, parse_capture, reassemble_a3, segment_a3  # noqa: E402

DEFAULT_CAPTURE_DIR = Path(os.environ.get("GOVEE_CAPTURE_DIR", Path.home() / "govee-captures"))
# New captures are pcapng; the pre-2026-07-30 corpus is classic pcap. Both read the same.
CAPTURE_SUFFIXES = (".pcapng", ".pcap")


def load_marks(path: Path) -> list[tuple[datetime, str]]:
    """Read ``<name>.actions.tsv`` as timezone-aware timestamps paired with their labels.

    ``govee-capture.sh mark`` writes ``date --iso-8601=ns``, which carries the host offset.
    That offset is kept: stripping it only appeared to work because the old container dated
    its records in local wall clock too, and it silently mis-slices anything that does not.
    """
    marks: list[tuple[datetime, str]] = []
    if not path.exists():
        return marks
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        stamp, label = line.split("\t", 1)
        parsed = datetime.fromisoformat(stamp.replace(",", "."))
        marks.append((parsed if parsed.tzinfo else parsed.astimezone(), label))
    return marks


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name", help="capture name, without the container suffix")
    ap.add_argument("--capture-dir", type=Path, default=DEFAULT_CAPTURE_DIR)
    ap.add_argument("--address", help="restrict to one BLE peer address")
    ap.add_argument("--tail-seconds", type=float, default=25.0, help="window length for the final mark")
    args = ap.parse_args()

    capture = next(
        (
            args.capture_dir / f"{args.name}{s}"
            for s in CAPTURE_SUFFIXES
            if (args.capture_dir / f"{args.name}{s}").exists()
        ),
        None,
    )
    if capture is None:
        print(f"no such capture: {args.capture_dir / args.name} ({' or '.join(CAPTURE_SUFFIXES)})", file=sys.stderr)
        return 1

    trace = parse_capture(capture.read_bytes(), allow_truncated=True)
    tx = [
        r
        for r in trace.att
        if r.direction == "TX"
        and r.attribute_handle == 0x14
        and (args.address is None or r.address in (args.address, None))
    ]
    rx = [r for r in trace.att if r.direction == "RX" and r.attribute_handle == 0x10]

    marks = load_marks(args.capture_dir / f"{args.name}.actions.tsv")
    if not marks:
        start = min((r.timestamp for r in tx), default=datetime.min.replace(tzinfo=UTC))
        marks = [(start, "whole-capture")]

    for index, (start, label) in enumerate(marks):
        end = marks[index + 1][0] if index + 1 < len(marks) else start + timedelta(seconds=args.tail_seconds)
        seg_tx = [r for r in tx if start <= r.timestamp < end]
        seg_rx = [r for r in rx if start <= r.timestamp < end]
        a3 = [r.value for r in seg_tx if r.value[0] == 0xA3]
        commands = [r.value for r in seg_tx if r.value[0] == 0x33]
        # aa 01 is the app's power keep-alive poll; it fires constantly and carries no signal.
        replies = [r.value for r in seg_rx if r.value[0] == 0xAA and r.value[1] != 0x01]

        print(f"\n=== {label} ===")
        print(f"  a3 frames: {len(a3)}   33-writes: {len(commands)}   non-power aa replies: {len(replies)}")
        for value in commands:
            print(f"  33-write : {value.hex()}")
        for value in replies:
            print(f"  aa reply : {value.hex()}")
        if a3:
            transactions = segment_a3(a3)
            for number, frames in enumerate(transactions, 1):
                body = reassemble_a3(frames)
                which = "  a3 body  :" if len(transactions) == 1 else f"  a3 body {number}/{len(transactions)}:"
                warning = "" if a3_body_is_complete(body) else "  TRUNCATED OR FUSED, fails its own linecount"
                print(f"{which} {len(body)} B{warning}")
                print(f"    {body.hex()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
