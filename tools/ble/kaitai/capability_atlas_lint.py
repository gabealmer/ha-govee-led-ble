#!/usr/bin/env python3
"""Validate capability_atlas.yaml against its own required-field and enum contract.

The atlas is a cross-reference over evidence that already exists elsewhere (Kaitai
schemas, spec/*.kst fixtures, generated_protocol/*.py modules); this module does not
re-derive any of that evidence, it only checks that every row in the atlas is
internally consistent and that every reference it makes resolves to something real:

  * every row has all required fields, and no (model, capability) pair repeats
  * evidence_status / preview_level / persistence_need / runtime.* are drawn from the
    atlas's own declared enums, so a typo'd status value is a hard failure rather than
    a silent no-op
  * kaitai_schema entries name a real "<file>.ksy::<type>" pair
  * evidence_refs entries name a real spec/*.kst id, or are a "capture:" label for
    evidence that is known only from an uncommitted/historical capture
  * generated_module entries name a real file under generated_protocol/

Mirrors kst_runner.py's stance: a reference this cannot evaluate is a failure, not a
skip.
"""

from __future__ import annotations

import re
from functools import cache
from pathlib import Path
from typing import Any

import yaml  # type: ignore[import-untyped]  # pyyaml ships no type stubs

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent.parent
ATLAS_PATH = HERE / "capability_atlas.yaml"
SPEC_DIR = HERE / "spec"
AGGREGATES_PATH = SPEC_DIR / "_aggregates.yaml"
PROTOCOL_BLOCKERS_PATH = HERE / "protocol_blockers.yaml"

REQUIRED_TOP_KEYS = (
    "schema_version",
    "evidence_status_values",
    "preview_level_values",
    "persistence_need_values",
    "wiring_status_values",
    "pipeline_known_issues",
    "capabilities",
)

REQUIRED_ROW_KEYS = (
    "model",
    "capability",
    "summary",
    "kaitai_schema",
    "evidence_status",
    "evidence_refs",
    "generated_module",
    "runtime",
    "ha_surface",
    "persistence_need",
    "preview_level",
    "known_gaps",
)

REQUIRED_RUNTIME_KEYS = ("encode", "decode", "readback")

REQUIRED_PREVIEW_VARIANT_KEYS = ("label", "preview_level", "note")

VALID_MODELS = ("H617A", "H6199")

_SCHEMA_REF_RE = re.compile(r"^(?P<file>[a-z0-9_]+\.ksy)::(?P<type>[a-z0-9_]+)$")
_ISSUE_REF_RE = re.compile(r"\b(?:GitHub\s+)?issue\s+#(?P<issue>\d+)\b", re.IGNORECASE)


class AtlasValidationError(Exception):
    """The atlas is missing a required field, uses an invalid value, or a reference does not resolve."""


@cache
def _kaitai_type_names(ksy_path: Path) -> frozenset[str]:
    """Every real type name a "file.ksy::type" reference may legally point at.

    Parsed from the actual YAML structure, not matched by regex against raw text: a
    type is either the file's own meta.id (the implicit root type) or a key under a
    (possibly nested) types: mapping. This deliberately does NOT walk enums: or seq:
    (or any other reserved Kaitai key) — an enum name like command_op, or the literal
    keyword seq, renders as "  <name>:" in the file just like a real type does, so a
    regex/text match against arbitrary "<name>:" lines would wrongly accept either as
    a valid type reference. Walking the parsed document instead of the raw text makes
    that class of false-positive structurally impossible.
    """
    doc = yaml.safe_load(ksy_path.read_text())
    names: set[str] = set()
    if isinstance(doc, dict):
        meta = doc.get("meta")
        if isinstance(meta, dict) and isinstance(meta.get("id"), str):
            names.add(meta["id"])
        _collect_nested_type_names(doc.get("types"), names)
    return frozenset(names)


def _collect_nested_type_names(types_mapping: Any, names: set[str]) -> None:
    if not isinstance(types_mapping, dict):
        return
    for type_name, type_body in types_mapping.items():
        names.add(type_name)
        if isinstance(type_body, dict):
            _collect_nested_type_names(type_body.get("types"), names)


def load_atlas(path: Path = ATLAS_PATH) -> dict[str, Any]:
    doc = yaml.safe_load(path.read_text())
    if not isinstance(doc, dict):
        raise AtlasValidationError(f"{path.name}: document root must be a mapping")
    for key in REQUIRED_TOP_KEYS:
        if key not in doc:
            raise AtlasValidationError(f"{path.name}: missing required top-level key {key!r}")
    return doc


@cache
def load_aggregate_ids(path: Path = AGGREGATES_PATH) -> frozenset[str]:
    doc = yaml.safe_load(path.read_text())
    if not isinstance(doc, list):
        raise AtlasValidationError(f"{path.name}: document root must be a list")
    ids: list[str] = []
    for index, entry in enumerate(doc):
        if not isinstance(entry, dict) or not isinstance(entry.get("id"), str) or not entry["id"]:
            raise AtlasValidationError(f"{path.name}[{index}]: needs a non-empty string id")
        ids.append(entry["id"])
    if len(ids) != len(set(ids)):
        raise AtlasValidationError(f"{path.name}: aggregate ids must be unique")
    return frozenset(ids)


@cache
def load_resolved_protocol_blockers(path: Path = PROTOCOL_BLOCKERS_PATH) -> dict[tuple[str, str], frozenset[int]]:
    doc = yaml.safe_load(path.read_text())
    if not isinstance(doc, dict) or not isinstance(doc.get("blockers"), list):
        raise AtlasValidationError(f"{path.name}: blockers must be a list")
    resolved: dict[tuple[str, str], set[int]] = {}
    for index, blocker in enumerate(doc["blockers"]):
        if not isinstance(blocker, dict):
            raise AtlasValidationError(f"{path.name}: blockers[{index}] must be a mapping")
        if blocker.get("status") != "resolved":
            continue
        issue = blocker.get("issue")
        affected = blocker.get("affected_capabilities")
        if not isinstance(issue, int) or isinstance(issue, bool) or not isinstance(affected, list):
            raise AtlasValidationError(
                f"{path.name}: resolved blocker {index} has invalid issue or affected_capabilities"
            )
        for capability in affected:
            if not isinstance(capability, dict):
                raise AtlasValidationError(f"{path.name}: resolved blocker {issue} has an invalid affected capability")
            model = capability.get("model")
            capability_name = capability.get("capability")
            if not isinstance(model, str) or not isinstance(capability_name, str):
                raise AtlasValidationError(f"{path.name}: resolved blocker {issue} has an invalid affected capability")
            resolved.setdefault((model, capability_name), set()).add(issue)
    return {key: frozenset(issues) for key, issues in resolved.items()}


def check_required_fields(row: dict[str, Any], index: int) -> list[str]:
    problems = []
    for key in REQUIRED_ROW_KEYS:
        if key not in row:
            problems.append(f"row {index}: missing required field {key!r}")
    return problems


def check_enum_values(row: dict[str, Any], index: int, doc: dict[str, Any]) -> list[str]:
    problems = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    if "model" in row and row["model"] not in VALID_MODELS:
        problems.append(f"{label}: model {row['model']!r} is not one of {VALID_MODELS}")
    if "evidence_status" in row and row["evidence_status"] not in doc["evidence_status_values"]:
        problems.append(
            f"{label}: evidence_status {row['evidence_status']!r} is not a declared evidence_status_values entry"
        )
    if "preview_level" in row and row["preview_level"] not in doc["preview_level_values"]:
        problems.append(f"{label}: preview_level {row['preview_level']!r} is not a declared preview_level_values entry")
    if "persistence_need" in row and row["persistence_need"] not in doc["persistence_need_values"]:
        problems.append(
            f"{label}: persistence_need {row['persistence_need']!r} is not a declared persistence_need_values entry"
        )
    runtime = row.get("runtime")
    if not isinstance(runtime, dict):
        problems.append(f"{label}: runtime must be a mapping with keys {REQUIRED_RUNTIME_KEYS}")
    else:
        for key in REQUIRED_RUNTIME_KEYS:
            if key not in runtime:
                problems.append(f"{label}: runtime is missing {key!r}")
            elif runtime[key] not in doc["wiring_status_values"]:
                problems.append(f"{label}: runtime.{key} {runtime[key]!r} is not a declared wiring_status_values entry")
    return problems


def check_uniqueness(rows: list[dict[str, Any]]) -> list[str]:
    problems = []
    seen: dict[tuple[Any, Any], int] = {}
    for index, row in enumerate(rows):
        key = (row.get("model"), row.get("capability"))
        if key in seen:
            problems.append(f"row {index}: duplicate (model, capability) {key!r}, first seen at row {seen[key]}")
        else:
            seen[key] = index
    return problems


def check_list_fields(row: dict[str, Any], index: int) -> list[str]:
    problems = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    for key in ("kaitai_schema", "evidence_refs", "known_gaps"):
        value = row.get(key)
        if not isinstance(value, list):
            problems.append(f"{label}: {key} must be a list")
    if "aggregate_refs" in row and not isinstance(row["aggregate_refs"], list):
        problems.append(f"{label}: aggregate_refs must be a list when present")
    return problems


def check_kaitai_schema_refs(row: dict[str, Any], index: int) -> list[str]:
    problems = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    for ref in row.get("kaitai_schema") or []:
        match = _SCHEMA_REF_RE.match(ref)
        if not match:
            problems.append(f"{label}: kaitai_schema entry {ref!r} is not shaped like 'file.ksy::type_name'")
            continue
        ksy_path = HERE / match.group("file")
        if not ksy_path.exists():
            problems.append(f"{label}: kaitai_schema entry {ref!r} names a .ksy file that does not exist: {ksy_path}")
            continue
        type_name = match.group("type")
        try:
            type_names = _kaitai_type_names(ksy_path)
        except yaml.YAMLError as exc:
            problems.append(f"{label}: kaitai_schema entry {ref!r} names a .ksy file that failed to parse: {exc}")
            continue
        if type_name not in type_names:
            problems.append(f"{label}: kaitai_schema entry {ref!r} names a type not found in {ksy_path.name}")
    return problems


def check_evidence_refs(row: dict[str, Any], index: int) -> list[str]:
    problems = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    for ref in row.get("evidence_refs") or []:
        if ref.startswith("capture:"):
            continue
        if not (SPEC_DIR / f"{ref}.kst").exists():
            problems.append(f"{label}: evidence_refs entry {ref!r} does not match any spec/{ref}.kst fixture")
    return problems


def check_aggregate_refs(
    row: dict[str, Any],
    index: int,
    aggregate_ids: frozenset[str] | None = None,
) -> list[str]:
    problems: list[str] = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    refs = row.get("aggregate_refs")
    if refs is None or not isinstance(refs, list):
        return problems
    known_ids = load_aggregate_ids() if aggregate_ids is None else aggregate_ids
    seen: set[str] = set()
    for ref in refs:
        if not isinstance(ref, str) or not ref:
            problems.append(f"{label}: aggregate_refs entries must be non-empty strings")
            continue
        if ref in seen:
            problems.append(f"{label}: aggregate_refs entry {ref!r} is duplicated")
        seen.add(ref)
        if ref not in known_ids:
            problems.append(f"{label}: aggregate_refs entry {ref!r} does not match any aggregate id")
    return problems


def _strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [text for item in value for text in _strings(item)]
    if isinstance(value, dict):
        return [text for item in value.values() for text in _strings(item)]
    return []


def check_resolved_protocol_blocker_refs(
    row: dict[str, Any],
    index: int,
    resolved: dict[tuple[str, str], frozenset[int]] | None = None,
) -> list[str]:
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    blocker_map = load_resolved_protocol_blockers() if resolved is None else resolved
    resolved_issues = frozenset(issue for issues in blocker_map.values() for issue in issues)
    if not resolved_issues:
        return []
    referenced = {
        int(match.group("issue"))
        for text in _strings(row)
        for match in _ISSUE_REF_RE.finditer(text)
        if int(match.group("issue")) in resolved_issues
    }
    return [f"{label}: references resolved protocol blocker issue #{issue}" for issue in sorted(referenced)]


def check_resolved_protocol_blocker_targets(
    rows: list[dict[str, Any]],
    resolved: dict[tuple[str, str], frozenset[int]] | None = None,
) -> list[str]:
    blocker_map = load_resolved_protocol_blockers() if resolved is None else resolved
    present = {(row.get("model"), row.get("capability")) for row in rows}
    problems = []
    for target, issues in blocker_map.items():
        if target not in present:
            issue_labels = ", ".join(f"#{issue}" for issue in sorted(issues))
            problems.append(
                f"resolved protocol blocker issue(s) {issue_labels} target missing capability row {target!r}"
            )
    return problems


def check_generated_module(row: dict[str, Any], index: int) -> list[str]:
    problems = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    module = row.get("generated_module")
    if module is not None and not (REPO_ROOT / module).exists():
        problems.append(f"{label}: generated_module {module!r} does not exist")
    return problems


def check_absent_rows_have_no_schema(row: dict[str, Any], index: int) -> list[str]:
    """evidence_status: absent means nothing is modelled: no schema, no fixture refs."""
    problems = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    if row.get("evidence_status") == "absent":
        if row.get("kaitai_schema"):
            problems.append(f"{label}: evidence_status is absent but kaitai_schema is non-empty")
        if row.get("evidence_refs"):
            problems.append(f"{label}: evidence_status is absent but evidence_refs is non-empty")
    return problems


def check_non_absent_rows_have_evidence_refs(row: dict[str, Any], index: int) -> list[str]:
    """Any evidence_status other than absent asserts *something* was observed, so it must
    cite what: a committed spec/*.kst fixture, or (per check_evidence_refs) a "capture:"
    label for evidence that was only ever seen live/historically and never committed.
    An empty evidence_refs on a non-absent row is an unfalsifiable claim."""
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    status = row.get("evidence_status")
    if status is not None and status != "absent" and not row.get("evidence_refs"):
        return [
            f"{label}: evidence_status is {status!r} but evidence_refs is empty; cite a fixture or a 'capture:' label"
        ]
    return []


def check_preview_variants(row: dict[str, Any], index: int, doc: dict[str, Any]) -> list[str]:
    """preview_variants is optional: a row may break its own aggregate preview_level down
    into labelled sub-cases (e.g. per scene type, or static-vs-motion) when the evidence
    supports a real split. When present, every variant needs the same three fields, a
    valid preview_level, and a label unique within the row. The row's own preview_level
    must equal at least one variant's preview_level: the aggregate is meant to be the
    value that represents the dominant/majority case among the variants, never an
    invented claim disconnected from what the variants actually say."""
    problems: list[str] = []
    label = f"row {index} ({row.get('model')}/{row.get('capability')})"
    variants = row.get("preview_variants")
    if variants is None:
        return problems
    if not isinstance(variants, list) or not variants:
        return [f"{label}: preview_variants must be a non-empty list when present"]
    seen_labels: set[str] = set()
    variant_levels: set[Any] = set()
    for variant_index, variant in enumerate(variants):
        variant_label = f"{label}: preview_variants[{variant_index}]"
        if not isinstance(variant, dict):
            problems.append(f"{variant_label}: must be a mapping")
            continue
        for key in REQUIRED_PREVIEW_VARIANT_KEYS:
            if key not in variant:
                problems.append(f"{variant_label}: missing required field {key!r}")
        variant_name = variant.get("label")
        if isinstance(variant_name, str):
            if variant_name in seen_labels:
                problems.append(f"{variant_label}: duplicate label {variant_name!r} within this row")
            seen_labels.add(variant_name)
        variant_level = variant.get("preview_level")
        if variant_level is not None:
            if variant_level not in doc["preview_level_values"]:
                problems.append(
                    f"{variant_label}: preview_level {variant_level!r} is not a declared preview_level_values entry"
                )
            variant_levels.add(variant_level)
    row_level = row.get("preview_level")
    if row_level is not None and variant_levels and row_level not in variant_levels:
        problems.append(
            f"{label}: preview_level {row_level!r} is not among its own preview_variants' preview_level values "
            f"{sorted(variant_levels)!r} — the aggregate must be a value a real variant actually has"
        )
    return problems


def check_pipeline_known_issues(doc: dict[str, Any]) -> list[str]:
    problems = []
    for index, issue in enumerate(doc.get("pipeline_known_issues") or []):
        for key in ("id", "summary", "status"):
            if key not in issue:
                problems.append(f"pipeline_known_issues[{index}]: missing required field {key!r}")
    return problems


def validate(doc: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    rows = doc.get("capabilities")
    if not isinstance(rows, list) or not rows:
        return ["capabilities must be a non-empty list"]
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            problems.append(f"row {index}: must be a mapping")
            continue
        problems.extend(check_required_fields(row, index))
        problems.extend(check_list_fields(row, index))
        problems.extend(check_enum_values(row, index, doc))
        problems.extend(check_kaitai_schema_refs(row, index))
        problems.extend(check_evidence_refs(row, index))
        problems.extend(check_aggregate_refs(row, index))
        problems.extend(check_resolved_protocol_blocker_refs(row, index))
        problems.extend(check_generated_module(row, index))
        problems.extend(check_absent_rows_have_no_schema(row, index))
        problems.extend(check_non_absent_rows_have_evidence_refs(row, index))
        problems.extend(check_preview_variants(row, index, doc))
    problems.extend(check_uniqueness(rows))
    problems.extend(check_resolved_protocol_blocker_targets(rows))
    problems.extend(check_pipeline_known_issues(doc))
    return problems


def main() -> int:
    doc = load_atlas()
    problems = validate(doc)
    if problems:
        print(f"FAIL capability_atlas.yaml ({len(problems)} problem(s))")
        for problem in problems:
            print(f"       {problem}")
        return 1
    print(f"PASS capability_atlas.yaml ({len(doc['capabilities'])} row(s), 0 problems)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
