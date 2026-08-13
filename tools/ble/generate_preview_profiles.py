#!/usr/bin/env python3
"""Generate capture-backed preview profiles from animation analysis.

Consumes results.jsonl from animation_pipeline.py and produces scene_preview_profiles.json
for runtime use by the Home Assistant integration.

Each analysed effect creates a capture-backed preview model parameterised by observed
motion, colour, and geometry. The profile includes evidence metadata and limitations.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, TypedDict

logger = logging.getLogger(__name__)


class PreviewProfile(TypedDict, total=False):
    """Runtime preview profile matching Home Assistant integration schema."""

    sku: str
    scene_id: int
    effect_id: int
    kind: str
    fidelity: str
    title: str
    notice: str


@dataclass
class AnalysisRecord:
    """Single capture analysis record from results.jsonl."""

    schema_version: int
    campaign: str
    sku: str
    capture: dict[str, Any]
    source: dict[str, Any]
    calibration: dict[str, Any]
    sampling: dict[str, Any]
    colour: dict[str, Any]
    features: dict[str, Any]
    duration_recommendation: dict[str, Any]
    limitations: list[str]
    toolchain: dict[str, Any]


def load_analysis_results(path: Path) -> list[AnalysisRecord]:
    """Load analysed effect captures from results.jsonl."""
    records = []
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                data = json.loads(line)
                records.append(AnalysisRecord(**data))
    except (OSError, json.JSONDecodeError, TypeError) as exc:
        logger.error(f"Cannot load analysis results from {path}: {exc}")
        raise
    return records


def motion_features_to_preview(
    record: AnalysisRecord,
    preview_index: int,
) -> PreviewProfile | None:
    """Convert motion features to capture-backed directional sweep preview.

    Returns None if insufficient evidence or inapplicable family.
    """
    motion = record.features.get("motion")
    if not motion:
        return None

    # Extract key motion observations
    direction_obj = motion.get("direction", {})
    direction = direction_obj.get("direction")
    direction_confidence = direction_obj.get("confidence", 0)

    path_obj = motion.get("path", {})
    path = path_obj.get("path")
    path_confidence = path_obj.get("confidence", 0)

    periodicity = motion.get("periodicity", {})
    period_seconds = periodicity.get("period_seconds")
    periodicity_confidence = periodicity.get("confidence", 0)

    bands = motion.get("bands", {})
    band_count = bands.get("simultaneous_band_count", 0)
    band_width = bands.get("band_width_lanes", 1.0)

    background = motion.get("background", {})
    motion_confidence = motion.get("confidence", 0)

    # Only support wrapping directional motion for sweep preview
    if path != "wrapping" or not direction or not period_seconds:
        return None

    if direction_confidence < 0.7 or path_confidence < 0.7:
        logger.debug(f"Skipping {record.capture['label']}: low direction/path confidence")
        return None

    # Extract colour information
    palette_assignment = motion.get("palette_assignment", {})
    label_by_index = palette_assignment.get("label_by_palette_index", {})
    authored_palette = record.capture.get("authored", {}).get("palette", [])

    if not label_by_index or not authored_palette:
        logger.debug(f"Skipping {record.capture['label']}: missing palette data")
        return None

    # Map palette indices to RGB values
    base_colour = None
    band_colour = None

    background_index = background.get("palette_index")
    if background_index is not None and background_index < len(authored_palette):
        base_colour = authored_palette[background_index]

    # Band colour: use first non-background observed index
    observed_indices = palette_assignment.get("observed_palette_indexes", [])
    for idx in observed_indices:
        if idx != background_index and idx < len(authored_palette):
            band_colour = authored_palette[idx]
            break

    if not base_colour or not band_colour:
        logger.warning(
            f"Skipping {record.capture['label']}: could not map palette colours"
        )
        return None

    # Map direction string to preview direction
    direction_map = {
        "towards_first_segment": "towards_first_segment",
        "towards_last_segment": "towards_last_segment",
    }
    mapped_direction = direction_map.get(direction)
    if not mapped_direction:
        return None

    # Extract effect identity from capture
    effect_identity = record.capture.get("authored", {})

    # Build preview profile with effect-based identity
    profile: PreviewProfile = {
        "sku": record.sku,
        "effect_family": effect_identity.get("family", -1),
        "effect_variant": effect_identity.get("variant", -1),
        "kind": "capture-directional-sweep",
        "fidelity": "capture_backed",
        "primitive": "directional_sweep",
        "title": f"{record.capture.get('label', 'Unknown')} effect",
        "direction": mapped_direction,
        "period_seconds": round(period_seconds, 3),
        "travelling_bands": int(band_count),
        "base_rgb": base_colour,
        "band_rgb": band_colour,
        "notice": (
            f"Capture-backed animation at Default speed. "
            f"Observed: {direction} direction, "
            f"{band_count} band(s) {band_width:.1f} lanes wide, "
            f"period {period_seconds:.3f}s (confidence {periodicity_confidence:.0%}). "
            f"Motion quality: {motion_confidence:.0%}."
        ),
        "limitations": record.limitations,
    }

    logger.info(
        f"Generated preview {preview_index} for {record.capture['label']}: "
        f"{direction} {period_seconds:.3f}s period "
        f"(family {effect_identity.get('family')}, variant {effect_identity.get('variant')})"
    )

    return profile


def generate_profiles(results_path: Path) -> list[PreviewProfile]:
    """Convert analysis results to preview profiles."""
    records = load_analysis_results(results_path)
    profiles = []

    for record in records:
        if record.features.get("motion"):
            profile = motion_features_to_preview(record, len(profiles))
            if profile:
                profiles.append(profile)

    logger.info(f"Generated {len(profiles)} profiles from {len(records)} records")
    return profiles


def main() -> int:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Generate capture-backed preview profiles from animation analysis"
    )
    parser.add_argument(
        "results_path",
        type=Path,
        help="Path to results.jsonl from animation analysis pipeline",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output path for scene_preview_profiles.json (default: stdout)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(levelname)s: %(message)s",
    )

    if not args.results_path.exists():
        logger.error(f"Analysis results not found: {args.results_path}")
        return 1

    try:
        profiles = generate_profiles(args.results_path)
        logger.info(f"Generated {len(profiles)} preview profiles")

        output_data = {
            "schema_version": 1,
            "source": {
                "analysis_path": str(args.results_path),
                "profile_count": len(profiles),
            },
            "profiles": profiles,
        }

        output_text = json.dumps(output_data, indent=2)

        if args.output:
            args.output.write_text(output_text, encoding="utf-8")
            logger.info(f"Profiles written to {args.output}")
        else:
            print(output_text)

        return 0

    except Exception as exc:  # pylint: disable=broad-except
        logger.error(f"Generation failed: {exc}", exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    sys.exit(main())
