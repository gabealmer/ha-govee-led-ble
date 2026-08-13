#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14,<3.15"
# dependencies = [
#   "numpy==2.3.2",
#   "opencv-python-headless==5.0.0.93",
#   "Pillow==12.3.0",
#   "PyYAML==6.0.3",
# ]
# ///
"""Analyse a manifest-driven effect-capture campaign as visual evidence.

The command accepts a corpus directory holding ``manifest.json``, the saved calibration
images and the reduced analysis clips.  It writes the large reproducible measurements next
to that corpus.  ``--candidates-output`` is explicit because only the small pending-review
document is ever worth reading by hand, and nothing it contains may drive a runtime
preview.

Run with:

    uv run tools/ble/analyse_effect_animations.py /path/to/corpus --output /path/to/corpus/animation-analysis
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import argparse  # noqa: E402
import json  # noqa: E402

from tools.ble.animation_pipeline import analyse_campaign  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("corpus", type=Path, help="External capture corpus root holding manifest.json")
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="External directory for generated measurements and images",
    )
    parser.add_argument(
        "--candidates-output",
        type=Path,
        help="Explicit path for the compact pending-review evidence candidates",
    )
    parser.add_argument(
        "--no-contact-sheets",
        action="store_true",
        help="Skip contact sheets when only the measurements are needed",
    )
    args = parser.parse_args()
    summary = analyse_campaign(
        args.corpus,
        args.output,
        candidates_output=args.candidates_output,
        contact_sheets=not args.no_contact_sheets,
    )
    print(json.dumps(summary, sort_keys=True))


if __name__ == "__main__":
    main()
