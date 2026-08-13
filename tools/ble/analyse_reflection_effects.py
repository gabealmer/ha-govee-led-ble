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
"""Analyse effect motion from the colour-visible floor reflection.

The direct LED ridge is deliberately bright enough to clip camera colour.  The floor
reflection preserves the distinct authored colours and their movement, so this analyser
samples a dense path at a documented vertical offset from the calibrated strip centreline.
Authored RGB remains the colour source of truth.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.ble.analyse_scene_captures import derive_sampling_lanes  # noqa: E402
from tools.ble.animation_colour import parse_palette, track_colour_labels  # noqa: E402
from tools.ble.animation_features import derive_motion_features  # noqa: E402
from tools.ble.capture_analysis import (  # noqa: E402
    derive_corpus_calibration,
    lane_masks,
    probe_video_size,
    read_lane_colour_series,
    sha256_file,
    toolchain,
)

DEFAULT_SAMPLE_COUNT = 90
DEFAULT_VERTICAL_OFFSET = 40


def _palette_label(rgb: list[int], index: int) -> str:
    known = {
        (0, 0, 0): "black",
        (255, 0, 0): "red",
        (0, 255, 0): "green",
        (0, 0, 255): "blue",
        (255, 255, 255): "white",
    }
    return known.get(tuple(rgb), f"colour-{index}")


def _visual_palette(palette: list[list[int]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    entries: list[dict[str, Any]] = []
    collapsed: list[dict[str, Any]] = []
    by_rgb: dict[tuple[int, int, int], dict[str, Any]] = {}
    for index, rgb in enumerate(palette):
        key = tuple(rgb)
        if existing := by_rgb.get(key):
            existing["source_indexes"].append(index)
            continue
        entry = {
            "index": index,
            "label": _palette_label(rgb, index),
            "rgb": rgb,
            "source_indexes": [index],
        }
        entries.append(entry)
        by_rgb[key] = entry
    for entry in entries:
        if len(entry["source_indexes"]) > 1:
            collapsed.append(
                {
                    "label": entry["label"],
                    "rgb": entry["rgb"],
                    "source_indexes": entry["source_indexes"],
                }
            )
    tracking_entries = [{"index": entry["index"], "label": entry["label"], "rgb": entry["rgb"]} for entry in entries]
    return tracking_entries, collapsed


def _dense_lanes(calibration_lanes: Any, sample_count: int) -> Any:
    path = []
    for lane in calibration_lanes:
        path.extend(lane.polyline if not path else lane.polyline[1:])
    return derive_sampling_lanes(path, segment_count=sample_count)


def analyse_corpus(
    corpus: Path,
    *,
    calibration_directory: Path,
    output: Path,
    sample_count: int,
    vertical_offset: int,
) -> dict[str, Any]:
    campaign_path = corpus / "campaign.json"
    campaign = json.loads(campaign_path.read_text(encoding="utf-8"))
    output.mkdir(parents=True, exist_ok=True)
    results_path = output / "results.jsonl"
    records: list[dict[str, Any]] = []
    versions = toolchain()

    with results_path.open("w", encoding="utf-8") as stream:
        for target in campaign["targets"]:
            video = corpus / "analysis" / f"{target['id']}.webm"
            if not video.is_file():
                continue
            size = probe_video_size(video)
            calibration, lanes = derive_corpus_calibration(calibration_directory, video_size=size)
            dense_lanes = _dense_lanes(lanes, sample_count)
            masks = lane_masks(
                dense_lanes,
                size,
                float(calibration["uniform_scale"]),
                vertical_offset=vertical_offset,
            )
            series = read_lane_colour_series(video, masks)
            visual_palette, collapsed = _visual_palette(target["palette"])
            tracking = track_colour_labels(series.colours, parse_palette(visual_palette))
            motion = derive_motion_features(tracking, series.timestamps)
            limitations = [
                "Camera RGB is used only to locate authored colour classes; "
                "authored RGB is the colour source of truth.",
                f"Motion is sampled from the floor reflection {vertical_offset} pixels below the calibrated LED ridge.",
            ]
            if collapsed:
                limitations.append(
                    "Identical authored RGB entries are visually indistinguishable "
                    "and are collapsed for camera tracking."
                )
            record = {
                "schema_version": 1,
                "campaign": campaign["campaign_id"],
                "target_id": target["id"],
                "family": target["family"],
                "parameters": target["parameters"],
                "source": {
                    "video": str(video.relative_to(corpus)),
                    "video_sha256": sha256_file(video),
                    "campaign_sha256": sha256_file(campaign_path),
                },
                "authored": {
                    "palette_rgb": target["palette"],
                    "visual_palette": visual_palette,
                    "collapsed_identical_colours": collapsed,
                    "speed_policy": target["speed_policy"],
                },
                "sampling": {
                    "frame_count": tracking.frame_count,
                    "sample_count": tracking.lane_count,
                    "fps": round(series.fps, 4),
                    "duration_seconds": round(series.timestamps[-1] - series.timestamps[0], 4),
                    "vertical_offset_pixels": vertical_offset,
                    "analysis_video_size": list(size),
                },
                "colour": tracking.summary(),
                "motion": motion,
                "limitations": limitations,
                "toolchain": versions,
            }
            stream.write(json.dumps(record, sort_keys=True, separators=(",", ":")) + "\n")
            records.append(record)

    summary = {
        "schema_version": 1,
        "campaign": campaign["campaign_id"],
        "capture_count": len(records),
        "sample_count": sample_count,
        "vertical_offset_pixels": vertical_offset,
        "calibration_directory": str(calibration_directory),
        "results": {
            "file": results_path.name,
            "sha256": sha256_file(results_path),
        },
        "toolchain": versions,
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("corpus", type=Path)
    parser.add_argument("--calibration", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--samples", type=int, default=DEFAULT_SAMPLE_COUNT)
    parser.add_argument("--vertical-offset", type=int, default=DEFAULT_VERTICAL_OFFSET)
    args = parser.parse_args()
    output = args.output or args.corpus / "reflection-analysis"
    summary = analyse_corpus(
        args.corpus,
        calibration_directory=args.calibration,
        output=output,
        sample_count=args.samples,
        vertical_offset=args.vertical_offset,
    )
    print(json.dumps(summary, sort_keys=True))


if __name__ == "__main__":
    main()
