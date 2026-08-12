"""Regression tests for calibrated visual-scene analysis and evidence provenance."""

from __future__ import annotations

import copy
import hashlib
import json
import math
from pathlib import Path
from typing import Any

import pytest

from tools.ble import scene_visual_evidence_lint as lint
from tools.ble.analyse_scene_captures import (
    Point,
    SamplingLane,
    _select_classification,
    analyse_segment_series,
    assess_video_mapping,
    derive_sampling_lanes,
    map_lanes_to_video,
    validate_video_mapping,
)

GEOMETRY_FIXTURE = Path(__file__).with_name("fixtures") / "scene_analysis_h617a_geometry.json"


def _static_series() -> tuple[list[list[tuple[float, float, float]]], list[float]]:
    timestamps = [index / 15 for index in range(90)]
    colours = [
        [
            (
                80.0 + (frame + segment) % 2,
                32.0 + (frame * 3 + segment) % 2,
                18.0 + (frame + segment * 2) % 2,
            )
            for segment in range(15)
        ]
        for frame in range(90)
    ]
    return colours, timestamps


def _moving_series() -> tuple[list[list[tuple[float, float, float]]], list[float]]:
    timestamps = [index / 15 for index in range(180)]
    colours = []
    for _frame, timestamp in enumerate(timestamps):
        row = []
        for segment in range(15):
            phase = 2 * 3.141592653589793 * (timestamp / 2.0 - segment / 15)
            value = 90 + 70 * (math.sin(phase) + 1) / 2
            row.append((value, 20.0, 10.0))
        colours.append(row)
    return colours, timestamps


def test_sampling_lanes_are_equal_arclength_and_keep_endpoints() -> None:
    lanes = derive_sampling_lanes((Point(0, 8), Point(75, 8), Point(150, 48)))

    assert len(lanes) == 15
    assert lanes[0].start == Point(0, 8)
    assert lanes[-1].end == Point(150, 48)
    lengths = [((lane.end.x - lane.start.x) ** 2 + (lane.end.y - lane.start.y) ** 2) ** 0.5 for lane in lanes]
    assert max(lengths) - min(lengths) < 0.05
    assert [lane.index for lane in lanes] == list(range(15))


def test_static_noise_is_not_classified_as_motion() -> None:
    colours, timestamps = _static_series()

    result = analyse_segment_series(colours, timestamps)

    assert result["classification"]["primitive"] == "static"
    assert result["classification"]["primitive_confidence"] >= 0.7
    assert result["classification"]["unresolved_evidence"] is None
    assert result["phase_direction"]["direction"] == "unknown"


def test_synthetic_directional_motion_has_phase_evidence() -> None:
    colours, timestamps = _moving_series()

    result = analyse_segment_series(colours, timestamps)

    assert result["phase_direction"]["direction"] == "towards_last_segment"
    assert result["phase_direction"]["confidence"] >= 0.65
    assert result["classification"]["primitive"] == "directional_sweep"


def _real_calibration_lanes() -> tuple[dict[str, Any], tuple[SamplingLane, ...]]:
    geometry = json.loads(GEOMETRY_FIXTURE.read_text(encoding="utf-8"))
    lanes = tuple(
        SamplingLane(
            index=row["index"],
            start=Point(*row["start"]),
            centre=Point(*row["centre"]),
            end=Point(*row["end"]),
            polyline=(Point(*row["start"]), Point(*row["centre"]), Point(*row["end"])),
        )
        for row in geometry["lanes"]
    )
    return geometry, lanes


def test_real_calibration_geometry_maps_all_fifteen_lanes_in_normal_ci() -> None:
    geometry, lanes = _real_calibration_lanes()

    scale, mapped = map_lanes_to_video(lanes, tuple(geometry["source_size"]), tuple(geometry["video_size"]))

    assert geometry["corpus"] == "20260812-h617a-scenes"
    assert set(geometry["calibration_images"]) == {"black", "first", "last", "white"}
    assert all(len(image["sha256"]) == 64 for image in geometry["calibration_images"].values())
    assert scale == 0.5
    assert len(mapped) == 15
    assert mapped[0]["start"] == [43.0, 26.5]
    assert mapped[7]["centre"] == [321.818, 55.0]
    assert mapped[-1]["end"] == [602.5, 20.0]
    assert all(0 <= point[1] < geometry["video_size"][1] for lane in mapped for point in lane["polyline"])


def test_video_mapping_evidence_rejects_a_differently_cropped_ridge() -> None:
    mapped = [[245.0] * 15, [246.0] * 15, [244.0] * 15]
    upper = [[100.0] * 15] * 3
    lower = [[155.0] * 15] * 3
    metrics = assess_video_mapping(mapped, upper, lower)

    validate_video_mapping(metrics)
    assert metrics["confidence"] == 1.0

    cropped_metrics = assess_video_mapping(mapped, [[190.0] * 15] * 3, [[200.0] * 15] * 3)
    with pytest.raises(ValueError, match="ridge contrast"):
        validate_video_mapping(cropped_metrics)


def test_classifier_tie_breaking_and_unknown_evidence_are_explicit() -> None:
    result = _select_classification(
        {
            "static": 0.4,
            "global_pulse": 0.4,
            "abrupt_global_transition": 0.4,
            "directional_sweep": 0.4,
            "local_variation": 0.4,
        }
    )

    assert result["primitive"] == "unknown"
    assert result["primitive_confidence"] is None
    assert result["unresolved_evidence"] == {"strongest_candidate": "abrupt_global_transition", "strength": 0.4}
    assert result["selection"]["tied_candidates"] == [
        "abrupt_global_transition",
        "directional_sweep",
        "global_pulse",
        "local_variation",
        "static",
    ]


def test_analysis_is_deterministic() -> None:
    colours, timestamps = _static_series()

    assert analyse_segment_series(colours, timestamps) == analyse_segment_series(colours, timestamps)


@pytest.fixture
def catalogue() -> dict[str, Any]:
    return lint.load_catalogue()


REVIEWED_IDENTITIES = {
    ("H617A", 1011, 1073): ("static", 0.95),
    ("H617A", 1012, 1074): ("static", 0.9),
    ("H617A", 1051, 1113): ("static", 0.9),
    ("H617A", 1068, 1130): ("directional_sweep", 0.9),
    ("H617A", 8860, 13920): ("static", 0.9),
}


def _identity(row: dict[str, Any]) -> tuple[str, int, int]:
    return row["sku"], row["scene_id"], row["effect_id"]


def _reviewed(catalogue: dict[str, Any], identity: tuple[str, int, int]) -> dict[str, Any]:
    return next(row for row in catalogue["evidence"] if _identity(row) == identity)


def test_committed_visual_evidence_has_valid_schema_and_provenance(catalogue: dict[str, Any]) -> None:
    assert lint.validate(catalogue) == []
    assert len(catalogue["evidence"]) == 83
    assert {row["sku"] for row in catalogue["evidence"]} == {"H617A"}


def test_visual_evidence_provenance_tracks_the_analyser(catalogue: dict[str, Any]) -> None:
    analyser = Path("tools/ble/analyse_scene_captures.py")

    assert catalogue["corpus"]["analysis_tool_sha256"] == hashlib.sha256(analyser.read_bytes()).hexdigest()


def test_visual_evidence_rejects_bad_provenance_hash(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    invalid["evidence"][0]["source"]["analysis_video_sha256"] = "not-a-hash"

    assert any("SHA-256" in problem for problem in lint.validate(invalid))


def test_visual_evidence_rejects_confidence_for_an_unknown_primitive(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    unknown = next(row for row in invalid["evidence"] if row["observation"]["primitive"] == "unknown")
    unknown["observation"]["automated_primitive_confidence"] = 0.4

    assert any("unknown primitive must not have" in problem for problem in lint.validate(invalid))


def test_visual_evidence_rejects_catalogue_identity(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    invalid["evidence"][0]["scene_id"] = -1

    assert any("not in the committed H617A scene catalogue" in problem for problem in lint.validate(invalid))


def test_reviewed_preview_profiles_are_the_curated_identities(catalogue: dict[str, Any]) -> None:
    profiles = lint.preview_profiles(catalogue)

    assert {
        _identity(row): (row["observation"]["primitive"], row["observation"]["review_confidence"]) for row in profiles
    } == REVIEWED_IDENTITIES
    assert catalogue["preview_primitives"] == ["static", "global_pulse", "directional_sweep"]
    assert catalogue["minimum_review_confidence"] == 0.85


def test_every_other_profile_stays_unusable_for_a_motion_preview(catalogue: dict[str, Any]) -> None:
    unusable = [row for row in catalogue["evidence"] if _identity(row) not in REVIEWED_IDENTITIES]

    assert len(unusable) == 78
    assert {row["observation"]["review_state"] for row in unusable} == {"pending_human_review"}
    assert all("review" not in row["observation"] for row in unusable)
    assert all(
        not lint.is_preview_usable(row, preview_primitives=catalogue["preview_primitives"], minimum_review_confidence=0)
        for row in unusable
    )


def test_reviewed_rows_carry_renderable_palette_and_evidence_references(catalogue: dict[str, Any]) -> None:
    for identity in REVIEWED_IDENTITIES:
        review = _reviewed(catalogue, identity)["observation"]["review"]
        palette = review["render"]["palette"]

        assert review["decision"] == "accepted"
        assert review["limitations"]
        assert len(palette["segment_rgb"]) == 15
        assert palette["colour_space"] == "uncalibrated_camera_srgb"
        assert review["render"]["illuminated_segments"]
        assert len(review["evidence"]["contact_sheet_sha256"]) == 64


def test_reviewed_sweep_states_direction_period_and_travelling_bands(catalogue: dict[str, Any]) -> None:
    observation = _reviewed(catalogue, ("H617A", 1068, 1130))["observation"]

    assert observation["direction"] == "towards_first_segment"
    assert observation["period_seconds"] == 3.953
    assert observation["review"]["render"]["travelling_bands"] == 2
    palette = observation["review"]["render"]["palette"]
    assert palette["band_rgb"] != palette["base_rgb"]


def test_visual_evidence_rejects_a_reviewed_row_without_review_metadata(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    del _reviewed(invalid, ("H617A", 1011, 1073))["observation"]["review"]

    assert any("needs a review mapping" in problem for problem in lint.validate(invalid))


def test_visual_evidence_rejects_review_metadata_on_a_pending_row(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    pending = next(row for row in invalid["evidence"] if row["observation"]["review_state"] == "pending_human_review")
    pending["observation"]["review"] = copy.deepcopy(_reviewed(invalid, ("H617A", 1011, 1073))["observation"]["review"])

    assert any("only a reviewed observation may carry review metadata" in problem for problem in lint.validate(invalid))


@pytest.mark.parametrize("primitive", ["abrupt_global_transition", "local_variation", "unknown"])
def test_visual_evidence_rejects_reviewing_an_unrenderable_primitive(catalogue: dict[str, Any], primitive: str) -> None:
    invalid = copy.deepcopy(catalogue)
    candidate = next(row for row in invalid["evidence"] if row["observation"]["primitive"] == primitive)
    reviewed = copy.deepcopy(_reviewed(invalid, ("H617A", 1011, 1073))["observation"])
    candidate["observation"] |= {
        "review_state": "reviewed",
        "review_confidence": 0.95,
        "review": reviewed["review"] | {"reviewed_primitive": primitive},
    }

    assert any("does not determine a rendering" in problem for problem in lint.validate(invalid))
    assert not lint.is_preview_usable(
        candidate,
        preview_primitives=catalogue["preview_primitives"],
        minimum_review_confidence=catalogue["minimum_review_confidence"],
    )


def test_visual_evidence_rejects_review_confidence_below_the_declared_minimum(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    _reviewed(invalid, ("H617A", 1011, 1073))["observation"]["review_confidence"] = 0.5

    assert any("below the declared minimum_review_confidence" in problem for problem in lint.validate(invalid))


def test_visual_evidence_rejects_a_reviewed_static_row_that_measured_motion(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    _reviewed(invalid, ("H617A", 1011, 1073))["observation"]["active_segments"] = [3]

    assert any("no dynamic segments and no period" in problem for problem in lint.validate(invalid))


def test_visual_evidence_rejects_a_reviewed_sweep_without_a_resolved_direction(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    _reviewed(invalid, ("H617A", 1068, 1130))["observation"]["direction"] = "unknown"

    assert any("needs a resolved direction" in problem for problem in lint.validate(invalid))


def test_visual_evidence_requires_a_written_reason_for_every_excluded_primitive(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    del invalid["review"]["excluded_primitives"]["local_variation"]

    assert any("excluded_primitives must explain exactly" in problem for problem in lint.validate(invalid))


def test_preview_profiles_refuse_an_invalid_catalogue(catalogue: dict[str, Any]) -> None:
    invalid = copy.deepcopy(catalogue)
    invalid["minimum_review_confidence"] = 2

    with pytest.raises(lint.VisualEvidenceValidationError):
        lint.preview_profiles(invalid)
