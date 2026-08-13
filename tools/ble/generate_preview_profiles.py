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
from dataclasses import dataclass, asdict
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
) -> PreviewProfile | None:
    """Convert motion features to capture-backed directional sweep preview.

    Returns None if insufficient evidence or inapplicable family.
    """
    if not record.features.get("motion"):
        return None

    motion = record.features["motion"]

    # Extract key observations
    direction = motion.get("direction", {}).get("direction")
    path = motion.get("path", {}).get("path")
    periodicity = motion.get("periodicity", {})
    bands = motion.get("bands", {})
    background = motion.get("background", {})
    period_seconds = periodicity.get("period_seconds")
    confidence = motion.get("confidence", 0)

    # Only support directional wrapping motions for now
    if path != "wrapping" or not direction or not period_seconds:
        return None

    # Extract colour information
    palette_assignment = motion.get("palette_assignment", {})
    observed_indices = palette_assignment.get("observed_palette_indexes", [])
    authored_palette = record.capture.get("authored", {}).get("palette", [])

    if not observed_indices or not authored_palette:
        return None

    # Map observed indices to authored colours
    base_colour = None
    band_colour = None

    background_index = background.get("palette_index")
    if background_index is not None and background_index < len(authored_palette):
        base_colour = tuple(authored_palette[background_index])

    # Band colour is typically the first non-background observed index
    for idx in observed_indices:
        if idx != background_index and idx < len(authored_palette):
            band_colour = tuple(authored_palette[idx])
            break

    if not base_colour or not band_colour:
        return None

    # Map direction
    direction_map = {
        "towards_first_segment": "towards_first_segment",
        "towards_last_segment": "towards_last_segment",
    }
    mapped_direction = direction_map.get(direction)

    if not mapped_direction:
        return None

    # Build preview profile
    profile: PreviewProfile = {
        "sku": record.sku,
        "scene_id": 0,  # Placeholder: need to map from effect identity
        "effect_id": 0,  # Placeholder: need to map from effect identity
        "kind": "capture-directional-sweep",
        "fidelity": "capture_backed",
        "title": f"{record.capture.get('label', 'Unknown')} effect",
        "notice": f"Capture-backed animation at Default speed. Observed period: {period_seconds:.3f}s, confidence: {confidence:.2%}.",
    }

    return profile


def generate_profiles(results_path: Path) -> list[PreviewProfile]:
    """Convert analysis results to preview profiles."""
    records = load_analysis_results(results_path)
    profiles = []

    for record in records:
        if record.features.get("motion"):
            profile = motion_features_to_preview(record)
            if profile:
                profiles.append(profile)

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
