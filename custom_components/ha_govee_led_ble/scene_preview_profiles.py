"""Capture-backed scene preview profiles packaged with the integration.

The profiles are observational camera evidence, not BLE protocol semantics.  They are
generated from ``tools/ble/scene_visual_evidence.yaml`` and deliberately contain no
scene-name key.
"""

from __future__ import annotations

import copy
import json
import logging
from pathlib import Path
from typing import Any, cast

from .effect_domain import JsonValue

PROFILE_SCHEMA_VERSION = 1
PROFILE_FIDELITY = "capture_backed"
PREVIEW_PRIMITIVES = frozenset(("static", "directional_sweep"))
PROFILE_SKUS = frozenset(("H617A",))
SEGMENT_COUNT = 15
_ASSET_PATH = Path(__file__).with_name("scene_preview_profiles.json")
_LOGGER = logging.getLogger(__name__)
_PROFILE_INDEX: dict[tuple[str, int, int], dict[str, JsonValue]] | None = None
_PROFILE_FAILURE_LOGGED = False


class PreviewProfileValidationError(ValueError):
    """Raised when the packaged capture-backed preview asset is invalid."""


def load_preview_profiles(path: Path = _ASSET_PATH) -> tuple[dict[str, JsonValue], ...]:
    """Load and validate the generated runtime profile asset."""
    try:
        asset = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise PreviewProfileValidationError(f"cannot load runtime preview profiles: {exc}") from exc
    return _validate_asset(asset)


def preview_profile_for_scene(
    sku: str,
    scene_id: int,
    effect_id: int,
) -> dict[str, JsonValue] | None:
    """Return a preloaded reviewed profile without performing filesystem I/O."""
    if sku not in PROFILE_SKUS or _PROFILE_INDEX is None:
        return None
    return copy.deepcopy(_PROFILE_INDEX.get((sku, scene_id, effect_id)))


def warm_preview_profile_index() -> None:
    """Load optional packaged preview data before WebSocket scene callbacks can use it."""
    _preview_profile_index()


def _preview_profile_index() -> dict[tuple[str, int, int], dict[str, JsonValue]]:
    """Load and index the optional packaged asset once for all scene-detail requests."""
    global _PROFILE_INDEX, _PROFILE_FAILURE_LOGGED
    if _PROFILE_INDEX is not None:
        return _PROFILE_INDEX
    try:
        profiles = load_preview_profiles()
    except PreviewProfileValidationError as exc:
        if not _PROFILE_FAILURE_LOGGED:
            _LOGGER.warning("Capture-backed scene preview profiles are unavailable: %s", exc)
            _PROFILE_FAILURE_LOGGED = True
        _PROFILE_INDEX = {}
        return _PROFILE_INDEX
    _PROFILE_INDEX = {
        (cast(str, profile["sku"]), cast(int, profile["scene_id"]), cast(int, profile["effect_id"])): profile
        for profile in profiles
        if _is_consumable(profile)
    }
    return _PROFILE_INDEX


def _reset_preview_profile_cache() -> None:
    """Reset cached optional preview data for isolated tests."""
    global _PROFILE_INDEX, _PROFILE_FAILURE_LOGGED
    _PROFILE_INDEX = None
    _PROFILE_FAILURE_LOGGED = False


def _validate_asset(asset: Any) -> tuple[dict[str, JsonValue], ...]:
    root = _mapping(asset, "asset", {"schema_version", "source", "profiles"})
    if root["schema_version"] != PROFILE_SCHEMA_VERSION:
        _invalid("asset.schema_version is unsupported")
    source = _mapping(
        root["source"],
        "asset.source",
        {
            "evidence_path",
            "evidence_sha256",
            "corpus_id",
            "review_id",
            "minimum_review_confidence",
            "profile_count",
        },
    )
    if source["evidence_path"] != "tools/ble/scene_visual_evidence.yaml":
        _invalid("asset.source.evidence_path is invalid")
    _sha256(source["evidence_sha256"], "asset.source.evidence_sha256")
    _text(source["corpus_id"], "asset.source.corpus_id")
    _text(source["review_id"], "asset.source.review_id")
    minimum = _confidence(source["minimum_review_confidence"], "asset.source.minimum_review_confidence")
    profiles = root["profiles"]
    if not isinstance(profiles, list) or len(profiles) > 512:
        _invalid("asset.profiles must be an array of at most 512 profiles")
    if source["profile_count"] != len(profiles):
        _invalid("asset.source.profile_count does not match asset.profiles")

    validated = tuple(_validate_profile(profile, minimum) for profile in profiles)
    identities = [(profile["sku"], profile["scene_id"], profile["effect_id"]) for profile in validated]
    if len(set(identities)) != len(identities):
        _invalid("asset.profiles contains a duplicate immutable identity")
    if identities != sorted(identities):
        _invalid("asset.profiles must be sorted by immutable identity")
    return validated


def _validate_profile(value: Any, asset_minimum: float) -> dict[str, JsonValue]:
    common = {
        "schema_version",
        "fidelity",
        "sku",
        "scene_id",
        "effect_id",
        "review_state",
        "minimum_review_confidence",
        "review_confidence",
        "primitive",
        "illuminated_segments",
        "limitations",
        "evidence",
        "palette",
    }
    mapping = _mapping(value, "profile", common, allow_extra=True)
    primitive = mapping["primitive"]
    if primitive == "static":
        mapping = _mapping(value, "static profile", common)
    elif primitive == "directional_sweep":
        mapping = _mapping(
            value,
            "directional sweep profile",
            common | {"direction", "period_seconds", "travelling_bands"},
        )
    else:
        _invalid("profile.primitive is unsupported")
    if mapping["schema_version"] != PROFILE_SCHEMA_VERSION or mapping["fidelity"] != PROFILE_FIDELITY:
        _invalid("profile schema or fidelity is invalid")
    _text(mapping["sku"], "profile.sku")
    _integer(mapping["scene_id"], "profile.scene_id", 0, 65_535)
    _integer(mapping["effect_id"], "profile.effect_id", 0, 65_535)
    if mapping["review_state"] != "reviewed":
        _invalid("profile.review_state must be reviewed")
    profile_minimum = _confidence(mapping["minimum_review_confidence"], "profile.minimum_review_confidence")
    if profile_minimum != asset_minimum:
        _invalid("profile.minimum_review_confidence does not match the asset")
    confidence = _confidence(mapping["review_confidence"], "profile.review_confidence")
    if confidence < profile_minimum:
        _invalid("profile.review_confidence is below the review minimum")
    _segments(mapping["illuminated_segments"], "profile.illuminated_segments")
    _strings(mapping["limitations"], "profile.limitations")
    evidence = _mapping(mapping["evidence"], "profile.evidence", {"corpus_id", "contact_sheet_sha256"})
    _text(evidence["corpus_id"], "profile.evidence.corpus_id")
    _sha256(evidence["contact_sheet_sha256"], "profile.evidence.contact_sheet_sha256")
    palette = _mapping(
        mapping["palette"],
        "profile.palette",
        {"colour_space", "segment_rgb"} if primitive == "static" else {"colour_space", "base_rgb", "band_rgb"},
    )
    if palette["colour_space"] != "uncalibrated_camera_srgb":
        _invalid("profile.palette.colour_space is unsupported")
    if primitive == "static":
        colours = palette["segment_rgb"]
        if not isinstance(colours, list) or len(colours) != SEGMENT_COUNT:
            _invalid("profile.palette.segment_rgb must contain 15 colours")
        for index, colour in enumerate(colours):
            _rgb(colour, f"profile.palette.segment_rgb[{index}]")
    else:
        _rgb(palette["base_rgb"], "profile.palette.base_rgb")
        _rgb(palette["band_rgb"], "profile.palette.band_rgb")
        if mapping["direction"] not in {"towards_first_segment", "towards_last_segment"}:
            _invalid("profile.direction is unresolved")
        period = mapping["period_seconds"]
        if not isinstance(period, (int, float)) or isinstance(period, bool) or period <= 0:
            _invalid("profile.period_seconds must be positive")
        _integer(mapping["travelling_bands"], "profile.travelling_bands", 1, SEGMENT_COUNT)
    return cast(dict[str, JsonValue], mapping)


def _is_consumable(profile: dict[str, JsonValue]) -> bool:
    confidence = profile["review_confidence"]
    minimum = profile["minimum_review_confidence"]
    return (
        profile["review_state"] == "reviewed"
        and profile["primitive"] in PREVIEW_PRIMITIVES
        and isinstance(confidence, (int, float))
        and not isinstance(confidence, bool)
        and isinstance(minimum, (int, float))
        and not isinstance(minimum, bool)
        and confidence >= minimum
    )


def _mapping(value: Any, name: str, expected: set[str], *, allow_extra: bool = False) -> dict[str, Any]:
    if not isinstance(value, dict):
        _invalid(f"{name} must be an object")
    keys = set(value)
    if (not allow_extra and keys != expected) or (allow_extra and not expected.issubset(keys)):
        _invalid(f"{name} fields are invalid")
    return cast(dict[str, Any], value)


def _text(value: Any, name: str) -> None:
    if not isinstance(value, str) or not value:
        _invalid(f"{name} must be a non-empty string")


def _sha256(value: Any, name: str) -> None:
    if (
        not isinstance(value, str)
        or len(value) != 64
        or any(character not in "0123456789abcdef" for character in value)
    ):
        _invalid(f"{name} must be a lower-case SHA-256 digest")


def _confidence(value: Any, name: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool) or not 0 < value <= 1:
        _invalid(f"{name} must be within 0..1")
    return float(value)


def _integer(value: Any, name: str, minimum: int, maximum: int) -> None:
    if not isinstance(value, int) or isinstance(value, bool) or not minimum <= value <= maximum:
        _invalid(f"{name} must be an integer from {minimum} to {maximum}")


def _segments(value: Any, name: str) -> None:
    if not isinstance(value, list) or not value:
        _invalid(f"{name} must name illuminated segments")
    if len(set(value)) != len(value):
        _invalid(f"{name} must not repeat a segment")
    for index, segment in enumerate(value):
        _integer(segment, f"{name}[{index}]", 0, SEGMENT_COUNT - 1)


def _strings(value: Any, name: str) -> None:
    if not isinstance(value, list) or not value:
        _invalid(f"{name} must be a non-empty string list")
    for index, item in enumerate(value):
        _text(item, f"{name}[{index}]")


def _rgb(value: Any, name: str) -> None:
    if not isinstance(value, list) or len(value) != 3:
        _invalid(f"{name} must be an RGB triple")
    for index, channel in enumerate(value):
        _integer(channel, f"{name}[{index}]", 0, 255)


def _invalid(message: str) -> None:
    raise PreviewProfileValidationError(message)
