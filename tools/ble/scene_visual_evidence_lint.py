"""Validate the compact scene visual-evidence catalogue.

The catalogue is deliberately separate from ``kaitai/capability_atlas.yaml``.  It
records camera-observed behaviour and provenance only; it is not evidence for packet
fields or other wire semantics.

The analyser owns everything under ``schema_version``: it writes one row per capture with
the measured classification and leaves every row pending.  The review overlay under
``review_schema_version`` is added afterwards and never alters a measured field.  A
runtime preview may consume a row only through :func:`preview_profiles`, which requires a
reviewed row, a primitive the preview knows how to render, and the declared minimum review
confidence.
"""

from __future__ import annotations

import re
from collections.abc import Sequence
from pathlib import Path
from typing import Any, TypeGuard

import yaml  # type: ignore[import-untyped]

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CATALOGUE_PATH = Path(__file__).with_name("scene_visual_evidence.yaml")
SCENE_CATALOGUE_DIR = REPO_ROOT / "custom_components" / "ha_govee_led_ble" / "scene_catalogues"
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
SEGMENT_COUNT = 15
PRIMITIVE_VALUES = (
    "static",
    "global_pulse",
    "abrupt_global_transition",
    "directional_sweep",
    "local_variation",
    "unknown",
)
# Primitives that determine an abstract rendering on their own.  The rest measure that
# something changed without fixing the pattern, so rendering one would mean inventing it.
PREVIEW_PRIMITIVES = ("static", "global_pulse", "directional_sweep")
PERIODIC_PREVIEW_PRIMITIVES = ("global_pulse", "directional_sweep")
REVIEW_SCHEMA_VERSION = 1
REVIEW_STATES = ("pending_human_review", "reviewed")
REVIEW_DECISIONS = ("accepted",)
REVIEW_BASIS = "recorded_evidence"
COLOUR_SPACES = ("uncalibrated_camera_srgb",)
DIRECTION_VALUES = ("towards_first_segment", "towards_last_segment", "synchronous", "unknown")
RESOLVED_DIRECTIONS = ("towards_first_segment", "towards_last_segment")
PINNED_DEPENDENCIES = {
    "numpy": "2.3.2",
    "opencv-python-headless": "5.0.0.93",
    "Pillow": "12.3.0",
    "PyYAML": "6.0.3",
}
REQUIRED_TOP_LEVEL = (
    "schema_version",
    "purpose",
    "primitive_values",
    "primitive_definitions",
    "review_schema_version",
    "review_states",
    "preview_primitives",
    "minimum_review_confidence",
    "review",
    "corpus",
    "evidence",
)
REQUIRED_REVIEW = (
    "id",
    "basis",
    "statement",
    "identity_basis",
    "inspected",
    "diagnostic",
    "excluded_primitives",
    "corpus_limitations",
)
REQUIRED_CORPUS = (
    "id",
    "scenes_manifest_sha256",
    "capture_results_sha256",
    "calibration_sha256",
    "analysis_results_sha256",
    "analysis_calibration_sha256",
    "analysis_tool_sha256",
    "toolchain",
)
REQUIRED_EVIDENCE = ("sku", "scene_id", "effect_id", "source", "observation")
REQUIRED_SOURCE = ("stem", "analysis_video_sha256")
REQUIRED_OBSERVATION = (
    "primitive",
    "automated_primitive_confidence",
    "unresolved_evidence",
    "review_state",
    "review_confidence",
    "active_segments",
    "direction",
    "period_seconds",
)
REQUIRED_ROW_REVIEW = ("decision", "reviewed_primitive", "rationale", "limitations", "render", "evidence")
REQUIRED_ROW_REVIEW_EVIDENCE = ("contact_sheet", "contact_sheet_sha256", "frame_count", "duration_seconds")
REQUIRED_PALETTE = ("colour_space", "clipped_sample_fraction", "clipped_channel_fraction", "segment_rgb")


class VisualEvidenceValidationError(ValueError):
    """The visual-evidence catalogue has an invalid schema or provenance reference."""


def load_catalogue(path: Path = CATALOGUE_PATH) -> dict[str, Any]:
    document = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(document, dict):
        raise VisualEvidenceValidationError(f"{path}: root must be a mapping")
    return document


def is_preview_usable(
    row: dict[str, Any],
    *,
    preview_primitives: Sequence[str],
    minimum_review_confidence: float,
) -> bool:
    """Report whether a runtime preview may render motion for one evidence row."""
    observation = row.get("observation")
    if not isinstance(observation, dict) or observation.get("review_state") != "reviewed":
        return False
    if observation.get("primitive") not in preview_primitives:
        return False
    confidence = observation.get("review_confidence")
    if not isinstance(confidence, (float, int)) or isinstance(confidence, bool):
        return False
    return confidence >= minimum_review_confidence


def preview_profiles(document: dict[str, Any]) -> tuple[dict[str, Any], ...]:
    """Return the evidence rows a runtime preview may consume, using the catalogue's own gate."""
    if problems := validate(document):
        raise VisualEvidenceValidationError(f"catalogue is not valid: {problems[0]}")
    preview_primitives = tuple(document["preview_primitives"])
    minimum = float(document["minimum_review_confidence"])
    return tuple(
        row
        for row in document["evidence"]
        if is_preview_usable(row, preview_primitives=preview_primitives, minimum_review_confidence=minimum)
    )


def _scene_identities(sku: str) -> set[tuple[int, int]]:
    path = SCENE_CATALOGUE_DIR / f"{sku}.json"
    if not path.is_file():
        return set()
    import json

    document = json.loads(path.read_text(encoding="utf-8"))
    return {(int(row["scene_id"]), int(row["effect_id"])) for row in document["effects"]}


def _sha_problem(label: str, value: Any) -> str | None:
    if not isinstance(value, str) or not SHA256_RE.fullmatch(value):
        return f"{label} must be a lower-case SHA-256 digest"
    return None


def _is_number(value: Any) -> TypeGuard[float]:
    return isinstance(value, (float, int)) and not isinstance(value, bool)


def _is_text(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _is_text_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(_is_text(item) for item in value)


def _is_segment_list(value: Any) -> bool:
    return isinstance(value, list) and all(
        isinstance(item, int) and not isinstance(item, bool) and 0 <= item < SEGMENT_COUNT for item in value
    )


def _is_colour(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 3
        and all(isinstance(channel, int) and not isinstance(channel, bool) and 0 <= channel <= 255 for channel in value)
    )


def _is_fraction(value: Any) -> bool:
    return _is_number(value) and 0 <= value <= 1


def _validate_review_header(document: dict[str, Any], primitives: Sequence[str]) -> list[str]:
    """Validate the review overlay that decides which rows a runtime preview may consume."""
    problems = []
    if document["review_schema_version"] != REVIEW_SCHEMA_VERSION:
        problems.append(f"catalogue: review_schema_version must be {REVIEW_SCHEMA_VERSION}")
    states = document["review_states"]
    valid_states = isinstance(states, dict) and set(states) == set(REVIEW_STATES)
    if not valid_states or not all(_is_text(value) for value in states.values()):
        problems.append(f"catalogue: review_states must define {REVIEW_STATES!r}")
    preview_primitives = document["preview_primitives"]
    if not isinstance(preview_primitives, list) or tuple(preview_primitives) != PREVIEW_PRIMITIVES:
        problems.append(f"catalogue: preview_primitives must be {PREVIEW_PRIMITIVES!r}")
        preview_primitives = list(PREVIEW_PRIMITIVES)
    minimum = document["minimum_review_confidence"]
    if not _is_number(minimum) or not 0 < minimum <= 1:
        problems.append("catalogue: minimum_review_confidence must be within 0..1")
    review = document["review"]
    if not isinstance(review, dict):
        return [*problems, "catalogue: review must be a mapping"]
    problems.extend(f"catalogue: review missing {key!r}" for key in REQUIRED_REVIEW if key not in review)
    if not _is_text(review.get("id")):
        problems.append("catalogue: review.id must be a non-empty string")
    if review.get("basis") != REVIEW_BASIS:
        problems.append(f"catalogue: review.basis must be {REVIEW_BASIS!r}")
    for key in ("statement", "identity_basis"):
        if not _is_text(review.get(key)):
            problems.append(f"catalogue: review.{key} must be a non-empty string")
    for key in ("inspected", "corpus_limitations"):
        if not _is_text_list(review.get(key)):
            problems.append(f"catalogue: review.{key} must be a non-empty string list")
    diagnostic = review.get("diagnostic")
    if not isinstance(diagnostic, dict) or not _is_text(diagnostic.get("file")):
        problems.append("catalogue: review.diagnostic must name an inspected file")
    elif problem := _sha_problem("catalogue: review.diagnostic.sha256", diagnostic.get("sha256")):
        problems.append(problem)
    excluded = review.get("excluded_primitives")
    expected_exclusions = {primitive for primitive in primitives if primitive not in preview_primitives}
    if not isinstance(excluded, dict) or set(excluded) != expected_exclusions:
        problems.append(f"catalogue: review.excluded_primitives must explain exactly {sorted(expected_exclusions)!r}")
    elif not all(_is_text(reason) for reason in excluded.values()):
        problems.append("catalogue: review.excluded_primitives reasons must be non-empty strings")
    return problems


def _validate_render(label: str, observation: dict[str, Any], render: Any) -> list[str]:
    if not isinstance(render, dict):
        return [f"{label}: review.render must be a mapping"]
    problems = []
    illuminated = render.get("illuminated_segments")
    if not _is_segment_list(illuminated) or not illuminated:
        problems.append(f"{label}: review.render.illuminated_segments must name lit segment indexes")
    palette = render.get("palette")
    if not isinstance(palette, dict):
        return [*problems, f"{label}: review.render.palette must be a mapping"]
    problems.extend(f"{label}: review.render.palette missing {key!r}" for key in REQUIRED_PALETTE if key not in palette)
    if palette.get("colour_space") not in COLOUR_SPACES:
        problems.append(f"{label}: review.render.palette.colour_space must be one of {COLOUR_SPACES!r}")
    if not _is_fraction(palette.get("clipped_sample_fraction")):
        problems.append(f"{label}: review.render.palette.clipped_sample_fraction must be within 0..1")
    channel_fraction = palette.get("clipped_channel_fraction")
    if not isinstance(channel_fraction, list) or len(channel_fraction) != 3:
        problems.append(f"{label}: review.render.palette.clipped_channel_fraction needs three fractions")
    elif not all(_is_fraction(value) for value in channel_fraction):
        problems.append(f"{label}: review.render.palette.clipped_channel_fraction needs three fractions")
    segment_rgb = palette.get("segment_rgb")
    if not isinstance(segment_rgb, list) or len(segment_rgb) != SEGMENT_COUNT:
        problems.append(f"{label}: review.render.palette.segment_rgb needs {SEGMENT_COUNT} RGB triples")
    elif not all(_is_colour(colour) for colour in segment_rgb):
        problems.append(f"{label}: review.render.palette.segment_rgb needs {SEGMENT_COUNT} RGB triples")
    if observation.get("primitive") == "directional_sweep":
        bands = render.get("travelling_bands")
        if not isinstance(bands, int) or isinstance(bands, bool) or bands < 1:
            problems.append(f"{label}: a reviewed directional_sweep needs a positive review.render.travelling_bands")
        if not _is_colour(palette.get("band_rgb")) or not _is_colour(palette.get("base_rgb")):
            problems.append(f"{label}: a reviewed directional_sweep needs review.render.palette band_rgb and base_rgb")
    return problems


def _validate_row_review(label: str, observation: dict[str, Any], minimum_review_confidence: Any) -> list[str]:
    """Validate the review metadata that lets a runtime preview render one row."""
    review = observation.get("review")
    if observation.get("review_state") != "reviewed":
        return [f"{label}: only a reviewed observation may carry review metadata"] if review is not None else []
    confidence = observation.get("review_confidence")
    if confidence is None:
        return [f"{label}: reviewed observation needs review_confidence"]
    if _is_number(minimum_review_confidence) and _is_number(confidence) and confidence < minimum_review_confidence:
        return [f"{label}: review_confidence is below the declared minimum_review_confidence"]
    if not isinstance(review, dict):
        return [f"{label}: reviewed observation needs a review mapping"]
    problems = [f"{label}: review missing {key!r}" for key in REQUIRED_ROW_REVIEW if key not in review]
    if review.get("decision") not in REVIEW_DECISIONS:
        problems.append(f"{label}: review.decision must be one of {REVIEW_DECISIONS!r}")
    primitive = observation.get("primitive")
    if primitive not in PREVIEW_PRIMITIVES:
        problems.append(
            f"{label}: {primitive!r} does not determine a rendering, so it cannot be reviewed for preview use"
        )
    if review.get("reviewed_primitive") != primitive:
        problems.append(f"{label}: review.reviewed_primitive must repeat observation.primitive")
    if not _is_text(review.get("rationale")):
        problems.append(f"{label}: review.rationale must be a non-empty string")
    if not _is_text_list(review.get("limitations")):
        problems.append(f"{label}: review.limitations must be a non-empty string list")
    problems.extend(_validate_render(label, observation, review.get("render")))
    evidence = review.get("evidence")
    if not isinstance(evidence, dict):
        problems.append(f"{label}: review.evidence must be a mapping")
    else:
        problems.extend(
            f"{label}: review.evidence missing {key!r}" for key in REQUIRED_ROW_REVIEW_EVIDENCE if key not in evidence
        )
        if not _is_text(evidence.get("contact_sheet")):
            problems.append(f"{label}: review.evidence.contact_sheet must name the inspected sheet")
        sheet_label = f"{label}: review.evidence.contact_sheet_sha256"
        if problem := _sha_problem(sheet_label, evidence.get("contact_sheet_sha256")):
            problems.append(problem)
        frame_count = evidence.get("frame_count")
        if not isinstance(frame_count, int) or isinstance(frame_count, bool) or frame_count < 2:
            problems.append(f"{label}: review.evidence.frame_count must count the sampled frames")
        if not _is_number(evidence.get("duration_seconds")) or evidence["duration_seconds"] <= 0:
            problems.append(f"{label}: review.evidence.duration_seconds must be positive")
    period = observation.get("period_seconds")
    if primitive == "static" and (observation.get("active_segments") or period is not None):
        problems.append(f"{label}: a reviewed static observation must have no dynamic segments and no period")
    if primitive in PERIODIC_PREVIEW_PRIMITIVES and not _is_number(period):
        problems.append(f"{label}: a reviewed {primitive} needs a measured period_seconds")
    if primitive == "directional_sweep" and observation.get("direction") not in RESOLVED_DIRECTIONS:
        problems.append(f"{label}: a reviewed directional_sweep needs a resolved direction")
    return problems


def validate(document: dict[str, Any]) -> list[str]:
    problems = [f"catalogue: missing {key!r}" for key in REQUIRED_TOP_LEVEL if key not in document]
    if problems:
        return problems
    if document["schema_version"] != 1:
        problems.append("catalogue: schema_version must be 1")
    primitives = document["primitive_values"]
    if not isinstance(primitives, list) or not primitives or not all(isinstance(item, str) for item in primitives):
        problems.append("catalogue: primitive_values must be a non-empty string list")
        primitives = []
    elif tuple(primitives) != PRIMITIVE_VALUES:
        problems.append(f"catalogue: primitive_values must be {PRIMITIVE_VALUES!r}")
    primitive_definitions = document["primitive_definitions"]
    if not isinstance(primitive_definitions, dict) or set(primitive_definitions) != set(PRIMITIVE_VALUES):
        problems.append("catalogue: primitive_definitions must cover every primitive")
    elif not all(isinstance(value, str) and value for value in primitive_definitions.values()):
        problems.append("catalogue: primitive_definitions values must be non-empty strings")
    problems.extend(_validate_review_header(document, primitives))
    corpus = document["corpus"]
    if not isinstance(corpus, dict):
        problems.append("catalogue: corpus must be a mapping")
    else:
        for key in REQUIRED_CORPUS:
            if key not in corpus:
                problems.append(f"catalogue: corpus missing {key!r}")
        if not isinstance(corpus.get("id"), str) or not corpus.get("id"):
            problems.append("catalogue: corpus.id must be a non-empty string")
        for key in REQUIRED_CORPUS[1:-1]:
            if key in corpus and (problem := _sha_problem(f"catalogue: corpus.{key}", corpus[key])):
                problems.append(problem)
        toolchain = corpus.get("toolchain")
        if not isinstance(toolchain, dict):
            problems.append("catalogue: corpus.toolchain must be a mapping")
        elif not isinstance(toolchain.get("python"), str) or not toolchain["python"].startswith("3.14."):
            problems.append("catalogue: corpus.toolchain.python must be Python 3.14")
        elif any(toolchain.get(package) != version for package, version in PINNED_DEPENDENCIES.items()):
            problems.append("catalogue: corpus.toolchain does not match the pinned analysis dependencies")
    evidence = document["evidence"]
    if not isinstance(evidence, list):
        return [*problems, "catalogue: evidence must be a list"]
    seen: set[tuple[Any, Any, Any]] = set()
    known_by_sku: dict[str, set[tuple[int, int]]] = {}
    for index, row in enumerate(evidence):
        label = f"evidence[{index}]"
        if not isinstance(row, dict):
            problems.append(f"{label}: must be a mapping")
            continue
        for key in REQUIRED_EVIDENCE:
            if key not in row:
                problems.append(f"{label}: missing {key!r}")
        sku = row.get("sku")
        scene_id = row.get("scene_id")
        effect_id = row.get("effect_id")
        if not isinstance(sku, str):
            problems.append(f"{label}: sku must be a string")
            continue
        valid_scene_id = isinstance(scene_id, int) and not isinstance(scene_id, bool)
        valid_effect_id = isinstance(effect_id, int) and not isinstance(effect_id, bool)
        if not valid_scene_id or not valid_effect_id:
            problems.append(f"{label}: scene_id and effect_id must be integers")
            continue
        identity = (sku, scene_id, effect_id)
        if identity in seen:
            problems.append(f"{label}: duplicate identity {identity!r}")
        seen.add(identity)
        known_by_sku.setdefault(sku, _scene_identities(sku))
        if (scene_id, effect_id) not in known_by_sku[sku]:
            problems.append(
                f"{label}: identity {(scene_id, effect_id)!r} is not in the committed {sku} scene catalogue"
            )
        source = row.get("source")
        if not isinstance(source, dict):
            problems.append(f"{label}: source must be a mapping")
        else:
            for key in REQUIRED_SOURCE:
                if key not in source:
                    problems.append(f"{label}: source missing {key!r}")
            if not isinstance(source.get("stem"), str) or not source.get("stem"):
                problems.append(f"{label}: source.stem must be a non-empty string")
            if "analysis_video_sha256" in source:
                problem = _sha_problem(
                    f"{label}: source.analysis_video_sha256",
                    source["analysis_video_sha256"],
                )
                if problem:
                    problems.append(problem)
        observation = row.get("observation")
        if not isinstance(observation, dict):
            problems.append(f"{label}: observation must be a mapping")
            continue
        for key in REQUIRED_OBSERVATION:
            if key not in observation:
                problems.append(f"{label}: observation missing {key!r}")
        if observation.get("primitive") not in primitives:
            problems.append(f"{label}: observation.primitive is not declared")
        confidence = observation.get("automated_primitive_confidence")
        unresolved_evidence = observation.get("unresolved_evidence")
        if observation.get("primitive") == "unknown":
            if confidence is not None:
                problems.append(f"{label}: unknown primitive must not have automated_primitive_confidence")
            if not isinstance(unresolved_evidence, dict):
                problems.append(f"{label}: unknown primitive needs unresolved_evidence")
            else:
                strongest_candidate = unresolved_evidence.get("strongest_candidate")
                strength = unresolved_evidence.get("strength")
                if strongest_candidate not in PRIMITIVE_VALUES[:-1]:
                    problems.append(f"{label}: unresolved_evidence.strongest_candidate is invalid")
                if not _is_number(strength) or not 0 <= strength < 0.7:
                    problems.append(f"{label}: unresolved_evidence.strength must be within 0..0.7")
        else:
            if not _is_number(confidence) or not 0.7 <= confidence <= 1:
                problems.append(f"{label}: observation.automated_primitive_confidence must be within 0.7..1")
            if unresolved_evidence is not None:
                problems.append(f"{label}: resolved primitive must not carry unresolved_evidence")
        if observation.get("review_state") not in REVIEW_STATES:
            problems.append(f"{label}: observation.review_state is invalid")
        review_confidence = observation.get("review_confidence")
        if review_confidence is not None and not _is_fraction(review_confidence):
            problems.append(f"{label}: observation.review_confidence must be null or within 0..1")
        problems.extend(_validate_row_review(label, observation, document["minimum_review_confidence"]))
        active_segments = observation.get("active_segments")
        if not _is_segment_list(active_segments):
            problems.append(f"{label}: observation.active_segments must contain segment indexes 0..14")
        if observation.get("direction") not in DIRECTION_VALUES:
            problems.append(f"{label}: observation.direction is invalid")
        period = observation.get("period_seconds")
        if period is not None and (not _is_number(period) or period <= 0):
            problems.append(f"{label}: observation.period_seconds must be null or positive")
    return problems
