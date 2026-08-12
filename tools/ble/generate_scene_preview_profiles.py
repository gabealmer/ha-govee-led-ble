"""Generate the compact runtime scene-preview profile asset.

The visual-evidence catalogue remains the review and provenance source.  This generator
copies only fields that a reviewed abstract preview may display into the integration,
because HACS packages ``custom_components`` but not ``tools``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from tools.ble import scene_visual_evidence_lint as evidence_lint

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
EVIDENCE_PATH = Path(__file__).with_name("scene_visual_evidence.yaml")
RUNTIME_ASSET_PATH = REPO_ROOT / "custom_components" / "ha_govee_led_ble" / "scene_preview_profiles.json"
PROFILE_SCHEMA_VERSION = 1


def build_runtime_asset(document: dict[str, Any], *, evidence_sha256: str) -> dict[str, Any]:
    """Return the compact reviewed subset that runtime code may consume."""
    profiles = [_runtime_profile(row, document) for row in evidence_lint.preview_profiles(document)]
    profiles.sort(key=lambda profile: (profile["sku"], profile["scene_id"], profile["effect_id"]))
    return {
        "schema_version": PROFILE_SCHEMA_VERSION,
        "source": {
            "evidence_path": "tools/ble/scene_visual_evidence.yaml",
            "evidence_sha256": evidence_sha256,
            "corpus_id": document["corpus"]["id"],
            "review_id": document["review"]["id"],
            "minimum_review_confidence": document["minimum_review_confidence"],
            "profile_count": len(profiles),
        },
        "profiles": profiles,
    }


def render_runtime_asset(document: dict[str, Any] | None = None) -> str:
    """Return the deterministic JSON representation for the committed runtime asset."""
    if document is None:
        document = evidence_lint.load_catalogue(EVIDENCE_PATH)
    asset = build_runtime_asset(document, evidence_sha256=_sha256(EVIDENCE_PATH))
    return f"{json.dumps(asset, separators=(',', ':'), sort_keys=True)}\n"


def _runtime_profile(row: dict[str, Any], document: dict[str, Any]) -> dict[str, Any]:
    observation = row["observation"]
    review = observation["review"]
    render = review["render"]
    palette = render["palette"]
    primitive = observation["primitive"]

    if not evidence_lint.is_preview_usable(
        row,
        preview_primitives=document["preview_primitives"],
        minimum_review_confidence=document["minimum_review_confidence"],
    ):
        raise evidence_lint.VisualEvidenceValidationError("attempted to package an unusable preview profile")

    profile: dict[str, Any] = {
        "schema_version": PROFILE_SCHEMA_VERSION,
        "fidelity": "capture_backed",
        "sku": row["sku"],
        "scene_id": row["scene_id"],
        "effect_id": row["effect_id"],
        "review_state": observation["review_state"],
        "minimum_review_confidence": document["minimum_review_confidence"],
        "review_confidence": observation["review_confidence"],
        "primitive": primitive,
        "illuminated_segments": render["illuminated_segments"],
        "limitations": review["limitations"],
        "evidence": {
            "corpus_id": document["corpus"]["id"],
            "contact_sheet_sha256": review["evidence"]["contact_sheet_sha256"],
        },
    }
    if primitive == "static":
        profile["palette"] = {
            "colour_space": palette["colour_space"],
            "segment_rgb": palette["segment_rgb"],
        }
    elif primitive == "directional_sweep":
        profile["palette"] = {
            "colour_space": palette["colour_space"],
            "base_rgb": palette["base_rgb"],
            "band_rgb": palette["band_rgb"],
        }
        profile["direction"] = observation["direction"]
        profile["period_seconds"] = observation["period_seconds"]
        profile["travelling_bands"] = render["travelling_bands"]
    else:
        raise evidence_lint.VisualEvidenceValidationError(f"no runtime renderer for {primitive!r}")
    return profile


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    """Write, or check, the generated runtime preview-profile asset."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when the committed asset is stale")
    parser.add_argument("--output", type=Path, default=RUNTIME_ASSET_PATH, help="asset path to write or check")
    arguments = parser.parse_args()

    rendered = render_runtime_asset()
    if arguments.check:
        if not arguments.output.is_file() or arguments.output.read_text(encoding="utf-8") != rendered:
            print(f"{arguments.output} is not generated from {EVIDENCE_PATH}")
            return 1
        return 0
    arguments.output.write_text(rendered, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
