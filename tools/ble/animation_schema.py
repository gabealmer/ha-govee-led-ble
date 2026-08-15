"""Schemas and provenance for animation analysis output.

The committed JSON Schema documents are the contract; this module is only their reader.
The validator implements the keyword subset the schemas use and refuses any schema that
reaches for a keyword outside it, because a keyword the validator silently ignores is a
constraint that does not exist.

Analysis records and evidence candidates carry hashes of the media, the manifest and the
analysis code.  Candidates stay pending and describe no rendering: a measurement becomes
usable to a preview only through a separate reviewed catalogue, never from here.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Sequence
from pathlib import Path
from typing import Any

SCHEMA_DIRECTORY = Path(__file__).with_name("schemas")
MANIFEST_SCHEMA = "animation-capture-manifest.schema.json"
ANALYSIS_SCHEMA = "animation-analysis.schema.json"
CANDIDATE_SCHEMA = "animation-evidence-candidate.schema.json"
ANALYSIS_SCHEMA_VERSION = 1
CANDIDATE_SCHEMA_VERSION = 1
MANIFEST_SCHEMA_VERSION = 1
# A corpus that spans several devices names this instead of a device, so the campaign sku
# never claims to be one.  Each capture then carries the device it was actually recorded from.
MIXED_CORPUS_SKU = "MULTI"
CANDIDATE_PURPOSE = (
    "Camera-observed animation behaviour proposed for human review. "
    "It does not describe BLE wire semantics and no row is usable by a runtime preview."
)
RUNTIME_PROMOTION_REASON = (
    "A candidate has not been reviewed, carries no rendering payload, and may only reach a "
    "preview through the reviewed visual-evidence catalogue."
)
# Every file whose behaviour can change a measurement.  The digest covers all of them, so
# provenance does not quietly stop tracking the code once it spans more than one module.
ANALYSIS_CODE_FILES = (
    "analyse_effect_animations.py",
    "analyse_scene_captures.py",
    "animation_audio.py",
    "animation_colour.py",
    "animation_features.py",
    "animation_pipeline.py",
    "animation_schema.py",
    "capture_analysis.py",
    "schemas/animation-analysis.schema.json",
    "schemas/animation-capture-manifest.schema.json",
    "schemas/animation-evidence-candidate.schema.json",
)
SUPPORTED_KEYWORDS = frozenset(
    {
        "$schema",
        "$id",
        "$defs",
        "$ref",
        "title",
        "description",
        "type",
        "properties",
        "required",
        "additionalProperties",
        "items",
        "enum",
        "const",
        "minimum",
        "maximum",
        "minItems",
        "maxItems",
        "pattern",
    }
)


class SchemaError(ValueError):
    """A schema document uses a keyword this validator does not implement."""


def _matches_type(value: Any, name: str) -> bool:
    match name:
        case "object":
            return isinstance(value, dict)
        case "array":
            return isinstance(value, list)
        case "string":
            return isinstance(value, str)
        case "boolean":
            return isinstance(value, bool)
        case "integer":
            return isinstance(value, int) and not isinstance(value, bool)
        case "number":
            return isinstance(value, int | float) and not isinstance(value, bool)
        case "null":
            return value is None
    raise SchemaError(f"unsupported schema type {name!r}")


def _assert_supported(schema: Any, path: str = "$") -> None:
    if not isinstance(schema, dict):
        raise SchemaError(f"{path}: a schema must be a mapping")
    for key, value in schema.items():
        if key not in SUPPORTED_KEYWORDS:
            raise SchemaError(f"{path}: unsupported schema keyword {key!r}")
        if key in {"properties", "$defs"}:
            for name, child in value.items():
                _assert_supported(child, f"{path}/{key}/{name}")
        elif key == "items" or (key == "additionalProperties" and isinstance(value, dict)):
            _assert_supported(value, f"{path}/{key}")


def load_schema(name: str) -> dict[str, Any]:
    """Read a committed schema, rejecting keywords the validator cannot enforce."""
    document = json.loads((SCHEMA_DIRECTORY / name).read_text(encoding="utf-8"))
    if not isinstance(document, dict):
        raise SchemaError(f"{name}: a schema must be a mapping")
    _assert_supported(document)
    return document


def _resolve(schema: dict[str, Any], root: dict[str, Any]) -> dict[str, Any]:
    reference = schema.get("$ref")
    if reference is None:
        return schema
    if not reference.startswith("#/$defs/"):
        raise SchemaError(f"unsupported schema reference {reference!r}")
    resolved = root.get("$defs", {}).get(reference.removeprefix("#/$defs/"))
    if resolved is None:
        raise SchemaError(f"unresolved schema reference {reference!r}")
    return _resolve(resolved, root)


def validate(
    instance: Any, schema: dict[str, Any], *, root: dict[str, Any] | None = None, path: str = "$"
) -> list[str]:
    """Return every way ``instance`` breaks ``schema``, deepest problem first at each level."""
    root = root if root is not None else schema
    schema = _resolve(schema, root)
    problems: list[str] = []
    declared = schema.get("type")
    if declared is not None:
        names = [declared] if isinstance(declared, str) else list(declared)
        if not any(_matches_type(instance, name) for name in names):
            return [f"{path}: expected {' or '.join(names)}, found {type(instance).__name__}"]
    if "const" in schema and instance != schema["const"]:
        problems.append(f"{path}: must equal {schema['const']!r}")
    if "enum" in schema and instance not in schema["enum"]:
        problems.append(f"{path}: {instance!r} is not one of {schema['enum']}")
    if isinstance(instance, str) and "pattern" in schema and not re.search(schema["pattern"], instance):
        problems.append(f"{path}: {instance!r} does not match {schema['pattern']}")
    if isinstance(instance, int | float) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            problems.append(f"{path}: {instance} is below the minimum {schema['minimum']}")
        if "maximum" in schema and instance > schema["maximum"]:
            problems.append(f"{path}: {instance} is above the maximum {schema['maximum']}")
    if isinstance(instance, dict):
        for key in schema.get("required", []):
            if key not in instance:
                problems.append(f"{path}: missing required key {key!r}")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            for key in sorted(set(instance) - set(properties)):
                problems.append(f"{path}: unexpected key {key!r}")
        for key, child in properties.items():
            if key in instance:
                problems.extend(validate(instance[key], child, root=root, path=f"{path}.{key}"))
    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            problems.append(f"{path}: needs at least {schema['minItems']} items")
        if "maxItems" in schema and len(instance) > schema["maxItems"]:
            problems.append(f"{path}: allows at most {schema['maxItems']} items")
        if "items" in schema:
            for index, value in enumerate(instance):
                problems.extend(validate(value, schema["items"], root=root, path=f"{path}[{index}]"))
    return problems


def capture_sku(manifest: dict[str, Any], capture: dict[str, Any]) -> str:
    """Resolve the device one capture came from, falling back to a single-device campaign."""
    declared = capture.get("sku")
    return str(declared) if declared else str(manifest["sku"])


def validate_manifest(document: Any) -> list[str]:
    """Check a capture manifest, including the identity rules a schema cannot express."""
    problems = validate(document, load_schema(MANIFEST_SCHEMA))
    if problems or not isinstance(document, dict):
        return problems
    stems = [capture["stem"] for capture in document["captures"]]
    if len(set(stems)) != len(stems):
        problems.append("$.captures: every capture needs a unique stem")
    for position, capture in enumerate(document["captures"]):
        palette = capture["authored"]["palette"]
        labels = [entry["label"] for entry in palette]
        indexes = [entry["index"] for entry in palette]
        if len(set(labels)) != len(labels):
            problems.append(f"$.captures[{position}].authored.palette: labels must be unique")
        if len(set(indexes)) != len(indexes):
            problems.append(f"$.captures[{position}].authored.palette: indexes must be unique")
        if capture["kind"] == "multi" and not capture["authored"].get("states"):
            problems.append(f"$.captures[{position}]: a multi capture needs its authored states")
        if document["sku"] == MIXED_CORPUS_SKU and not capture.get("sku"):
            problems.append(
                f"$.captures[{position}]: a capture in a {MIXED_CORPUS_SKU} corpus needs its own sku, "
                f"because {MIXED_CORPUS_SKU} is not a device"
            )
    skus = {capture_sku(document, capture) for capture in document["captures"]}
    if len(skus) > 1 and document["sku"] != MIXED_CORPUS_SKU:
        problems.append(
            f"$.sku: captures span {', '.join(sorted(skus))}, so the campaign sku must be {MIXED_CORPUS_SKU}"
        )
    return problems


def validate_analysis_record(record: Any) -> list[str]:
    """Check one analysis record against the committed analysis schema."""
    return validate(record, load_schema(ANALYSIS_SCHEMA))


def validate_candidate_document(document: Any) -> list[str]:
    """Check the evidence-candidate document, including its no-promotion guarantees."""
    problems = validate(document, load_schema(CANDIDATE_SCHEMA))
    if problems or not isinstance(document, dict):
        return problems
    stems = [candidate["stem"] for candidate in document["candidates"]]
    if len(set(stems)) != len(stems):
        problems.append("$.candidates: every candidate needs a unique stem")
    return problems


def analysis_code_digest(directory: Path | None = None) -> str:
    """Hash every file that can change a measurement, so provenance covers all of them."""
    base = directory if directory is not None else Path(__file__).parent
    digest = hashlib.sha256()
    for name in sorted(ANALYSIS_CODE_FILES):
        digest.update(name.encode())
        digest.update(hashlib.sha256((base / name).read_bytes()).digest())
    return digest.hexdigest()


def record_digest(record: dict[str, Any]) -> str:
    """Hash a record exactly as it is written, so a candidate cites the analysed values."""
    return hashlib.sha256(json.dumps(record, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def _unresolved(record: dict[str, Any]) -> list[str]:
    unresolved: list[str] = []
    motion = record["features"]["motion"]
    if motion is not None:
        if motion["direction"]["direction"] == "unknown":
            unresolved.append("direction")
        if motion["path"]["path"] == "unknown":
            unresolved.append("path")
        if motion["periodicity"]["period_seconds"] is None:
            unresolved.append("period")
        if motion["transition_shape"]["shape"] == "unknown":
            unresolved.append("transition_shape")
        if motion["palette_order"]["relation"] == "unknown":
            unresolved.append("palette_order")
    if record["colour"]["unassigned_palette_labels"]:
        unresolved.append("palette_labels_not_observed")
    if record["colour"]["unknown_sample_fraction"] > 0.1:
        unresolved.append("unknown_colour_samples")
    return unresolved


def build_candidate(record: dict[str, Any]) -> dict[str, Any]:
    """Reduce an analysis record to the small observation a reviewer reads."""
    motion = record["features"]["motion"]
    multi = record["features"]["multi"]
    advanced = record["features"]["advanced"]
    music = record["features"]["music"]
    response = (music or {}).get("response", {})
    return {
        "sku": record["sku"],
        "stem": record["capture"]["stem"],
        "kind": record["capture"]["kind"],
        "source": {
            "video_sha256": record["source"]["video_sha256"],
            "analysis_record_sha256": record_digest(record),
        },
        "observed": {
            "background_state": (motion or {}).get("background", {}).get("state", "unknown"),
            "direction": (motion or {}).get("direction", {}).get("direction", "unknown"),
            "path": (motion or {}).get("path", {}).get("path", "unknown"),
            "movement_domain": (advanced or {}).get("movement_domain", "unknown"),
            "simultaneous_band_count": (motion or {}).get("bands", {}).get("simultaneous_band_count"),
            "band_width_lanes": (motion or {}).get("bands", {}).get("band_width_lanes"),
            "duty_cycle": (motion or {}).get("bands", {}).get("duty_cycle"),
            "period_seconds": (motion or {}).get("periodicity", {}).get("period_seconds"),
            "transition_shape": (motion or {}).get("transition_shape", {}).get("shape", "unknown"),
            "palette_relation": (motion or {}).get("palette_order", {}).get("relation", "unknown"),
            "palette_indexes": (motion or {}).get("palette_assignment", {}).get("observed_palette_indexes", []),
            "state_count": (multi or {}).get("state_count"),
            "spatial_response_class": response.get("spatial_response", {}).get("class", "unknown"),
            "colour_treatment": response.get("colour_treatment", {}).get("treatment", "unknown"),
            "confidence": (motion or {}).get("confidence"),
        },
        "review_state": "pending_human_review",
        "review_confidence": None,
        "unresolved": _unresolved(record),
    }


def build_candidate_document(
    records: Sequence[dict[str, Any]],
    *,
    campaign: str,
    sku: str,
    manifest_sha256: str,
    analysis_results_sha256: str,
    toolchain: dict[str, str],
) -> dict[str, Any]:
    """Assemble the reviewable candidate document for one analysed campaign."""
    return {
        "schema_version": CANDIDATE_SCHEMA_VERSION,
        "purpose": CANDIDATE_PURPOSE,
        "runtime_promotion": {"allowed": False, "reason": RUNTIME_PROMOTION_REASON},
        "campaign": {
            "id": campaign,
            "sku": sku,
            "manifest_sha256": manifest_sha256,
            "analysis_results_sha256": analysis_results_sha256,
            "analysis_tool_sha256": analysis_code_digest(),
            "toolchain": toolchain,
        },
        "candidates": [build_candidate(record) for record in records],
    }
