"""Validate the complete integration quality-scale inventory."""

from __future__ import annotations

import json
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

import yaml  # type: ignore[import-untyped]

REPO = Path(__file__).resolve().parent.parent
QUALITY_SCALE_PATH = REPO / "custom_components/ha_govee_led_ble/quality_scale.yaml"
HACS_PATH = REPO / "hacs.json"
HOME_ASSISTANT_VERSION = "2026.3.0"
RULE_SOURCE = "https://github.com/home-assistant/core/blob/2026.3.0/script/hassfest/quality_scale.py"

# ALL_RULES at RULE_SOURCE is the authoritative inventory for the minimum Home
# Assistant version declared in hacs.json.
EXPECTED_RULES_BY_TIER = {
    "bronze": (
        "action-setup",
        "appropriate-polling",
        "brands",
        "common-modules",
        "config-flow",
        "config-flow-test-coverage",
        "dependency-transparency",
        "docs-actions",
        "docs-high-level-description",
        "docs-installation-instructions",
        "docs-removal-instructions",
        "entity-event-setup",
        "entity-unique-id",
        "has-entity-name",
        "runtime-data",
        "test-before-configure",
        "test-before-setup",
        "unique-config-entry",
    ),
    "silver": (
        "action-exceptions",
        "config-entry-unloading",
        "docs-configuration-parameters",
        "docs-installation-parameters",
        "entity-unavailable",
        "integration-owner",
        "log-when-unavailable",
        "parallel-updates",
        "reauthentication-flow",
        "test-coverage",
    ),
    "gold": (
        "devices",
        "diagnostics",
        "discovery",
        "discovery-update-info",
        "docs-data-update",
        "docs-examples",
        "docs-known-limitations",
        "docs-supported-devices",
        "docs-supported-functions",
        "docs-troubleshooting",
        "docs-use-cases",
        "dynamic-devices",
        "entity-category",
        "entity-device-class",
        "entity-disabled-by-default",
        "entity-translations",
        "exception-translations",
        "icon-translations",
        "reconfiguration-flow",
        "repair-issues",
        "stale-devices",
    ),
    "platinum": (
        "async-dependency",
        "inject-websession",
        "strict-typing",
    ),
}
EXPECTED_RULES = frozenset(rule for tier_rules in EXPECTED_RULES_BY_TIER.values() for rule in tier_rules)
VALID_STATUSES = frozenset({"done", "exempt", "todo"})

CORE_HOSTED_TODO_RULES = frozenset(
    {
        "brands",
        "docs-actions",
        "docs-configuration-parameters",
        "docs-data-update",
        "docs-examples",
        "docs-high-level-description",
        "docs-installation-instructions",
        "docs-installation-parameters",
        "docs-known-limitations",
        "docs-removal-instructions",
        "docs-supported-devices",
        "docs-supported-functions",
        "docs-troubleshooting",
        "docs-use-cases",
    }
)
REQUIRED_TODO_RULES = CORE_HOSTED_TODO_RULES | {"test-coverage"}
REQUIRED_TODO_EVIDENCE_RULES = frozenset({"test-coverage"})
REQUIRED_DONE_EVIDENCE_RULES = frozenset(
    {
        "entity-device-class",
        "entity-disabled-by-default",
        "icon-translations",
    }
)


def _status(rule: str, value: Any, errors: list[str]) -> str | None:
    comment: Any = None
    if isinstance(value, str):
        status: Any = value
    elif isinstance(value, Mapping):
        unexpected = set(value) - {"status", "comment"}
        if unexpected:
            errors.append(f"{rule}: unexpected fields: {', '.join(sorted(str(key) for key in unexpected))}")
        status = value.get("status")
        comment = value.get("comment")
        if comment is not None and not isinstance(comment, str):
            errors.append(f"{rule}: comment must be a string")
    else:
        errors.append(f"{rule}: rule value must be a status string or mapping")
        return None

    if not isinstance(status, str) or status not in VALID_STATUSES:
        errors.append(f"{rule}: status must be one of {', '.join(sorted(VALID_STATUSES))}")
        return None
    if rule in REQUIRED_DONE_EVIDENCE_RULES:
        if status != "done":
            errors.append(f"{rule}: must remain done because the rule has no applicable exemption")
        if not isinstance(comment, str) or not comment.strip():
            errors.append(f"{rule}: done status requires a non-empty evidence comment")
    elif status == "exempt" and (not isinstance(comment, str) or not comment.strip()):
        errors.append(f"{rule}: exempt rules require a non-empty comment")
    elif rule in REQUIRED_TODO_EVIDENCE_RULES and (not isinstance(comment, str) or not comment.strip()):
        errors.append(f"{rule}: todo status requires a non-empty prerequisite comment")
    return status


def validate_quality_scale(
    quality_scale_path: Path = QUALITY_SCALE_PATH,
    hacs_path: Path = HACS_PATH,
) -> list[str]:
    """Return validation errors for the repository quality-scale inventory."""
    errors: list[str] = []
    try:
        hacs = json.loads(hacs_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as err:
        return [f"{hacs_path}: cannot read HACS metadata: {err}"]
    if hacs.get("homeassistant") != HOME_ASSISTANT_VERSION:
        errors.append(
            f"{hacs_path}: homeassistant must remain {HOME_ASSISTANT_VERSION} "
            f"while the rule inventory is pinned to {RULE_SOURCE}"
        )

    try:
        document = yaml.safe_load(quality_scale_path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as err:
        return [*errors, f"{quality_scale_path}: cannot read quality scale: {err}"]
    if not isinstance(document, Mapping):
        return [*errors, f"{quality_scale_path}: root must be a mapping"]

    unexpected_root = set(document) - {"rules"}
    if unexpected_root:
        errors.append(f"unexpected top-level fields: {', '.join(sorted(str(key) for key in unexpected_root))}")
    rules = document.get("rules")
    if not isinstance(rules, Mapping):
        return [*errors, f"{quality_scale_path}: rules must be a mapping"]

    actual_rules = {str(rule) for rule in rules}
    missing = EXPECTED_RULES - actual_rules
    extra = actual_rules - EXPECTED_RULES
    if missing:
        errors.append(f"missing rules: {', '.join(sorted(missing))}")
    if extra:
        errors.append(f"extra rules: {', '.join(sorted(extra))}")

    for rule in sorted(EXPECTED_RULES & actual_rules):
        status = _status(rule, rules[rule], errors)
        if rule in REQUIRED_TODO_RULES:
            if status is not None and status != "todo":
                errors.append(f"{rule}: must remain todo until its external or repository prerequisite is complete")
        elif status == "todo":
            errors.append(f"{rule}: todo is not permitted without a recorded prerequisite")
    return errors


def main() -> int:
    errors = validate_quality_scale()
    if not errors:
        print(f"Quality-scale inventory matches Home Assistant {HOME_ASSISTANT_VERSION}: {len(EXPECTED_RULES)} rules.")
        return 0
    print("Quality-scale validation failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
