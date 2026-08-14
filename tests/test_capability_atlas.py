"""Validate tools/ble/kaitai/capability_atlas.yaml against its own required-field and enum contract.

Mirrors the kst_runner.py convention: the atlas is data, and this test both proves the
committed atlas is currently clean and proves the validator actually rejects the
mistakes the task calls out (invalid status values, missing required fields, dangling
cross-references, duplicate rows).
"""

from __future__ import annotations

import copy
from typing import Any

import pytest
import yaml  # type: ignore[import-untyped]

from custom_components.ha_govee_led_ble.effect_catalogue import H617A_TYPE04_EFFECTS
from tools.ble.kaitai import capability_atlas_lint as lint


@pytest.fixture
def atlas() -> dict[str, Any]:
    return lint.load_atlas()


def _row(atlas: dict[str, Any], model: str, capability: str) -> dict[str, Any]:
    for row in atlas["capabilities"]:
        if row["model"] == model and row["capability"] == capability:
            return row
    raise AssertionError(f"no such row: {model}/{capability}")


def test_committed_atlas_is_clean(atlas):
    problems = lint.validate(atlas)
    assert problems == []


def test_committed_atlas_covers_both_models(atlas):
    models = {row["model"] for row in atlas["capabilities"]}
    assert models == {"H617A", "H6199"}


def test_committed_atlas_has_no_duplicate_rows(atlas):
    keys = [(row["model"], row["capability"]) for row in atlas["capabilities"]]
    assert len(keys) == len(set(keys))


@pytest.mark.parametrize(
    ("model", "capability"),
    [
        ("H617A", "timers"),
        ("H6199", "timers"),
        ("H617A", "ota"),
        ("H6199", "ota"),
        ("H617A", "diy_upload"),
        ("H6199", "diy_upload"),
        ("H6199", "diy_activation"),
        ("H6199", "static_color"),
    ],
)
def test_known_issue_rows_are_present_and_explained(atlas, model, capability):
    """The six known issues named in the capability-atlas task must be resolved or encoded, never silently dropped."""
    row = _row(atlas, model, capability)
    assert row["known_gaps"], f"{model}/{capability} should explain itself in known_gaps"


def test_h6199_static_color_evidence_is_flagged_as_conflicting(atlas):
    row = _row(atlas, "H6199", "static_color")
    assert row["evidence_status"] == "raw_attributed"


def test_h617a_segments_readback_is_decode_only(atlas):
    row = _row(atlas, "H617A", "segments")
    assert row["runtime"]["readback"] == "none"
    assert row["runtime"]["decode"] == "decode_only"


def test_h6199_segments_readback_is_decode_only(atlas):
    row = _row(atlas, "H6199", "segments")
    assert row["runtime"]["readback"] == "none"
    assert row["runtime"]["decode"] == "decode_only"


def test_diy_upload_encoder_status_matches_runtime(atlas):
    assert _row(atlas, "H617A", "diy_upload")["runtime"]["encode"] == "wired"
    assert _row(atlas, "H6199", "diy_upload")["runtime"]["encode"] == "wired"


def test_h617a_type04_apply_evidence_is_current(atlas):
    activation = _row(atlas, "H617A", "diy_activation")
    upload = _row(atlas, "H617A", "diy_upload")

    assert "Single and Multi Apply" in activation["ha_surface"]
    assert all(workflow in upload["ha_surface"] for workflow in ("Painted", "Single", "Multi", "Workshop"))
    assert "diy_type04_code24_stable_across_body_edits" in activation["aggregate_refs"]
    assert "diy_type04_multi_two_upload_precedes_selector" in upload["aggregate_refs"]
    assert all("issue #155" not in text.lower() for row in (activation, upload) for text in lint._strings(row))


def test_ota_is_absent_on_both_models(atlas):
    for model in ("H617A", "H6199"):
        row = _row(atlas, model, "ota")
        assert row["evidence_status"] == "absent"
        assert row["kaitai_schema"] == []
        assert row["evidence_refs"] == []


def test_source_index_reproducibility_is_a_named_pipeline_issue(atlas):
    ids = {issue["id"] for issue in atlas["pipeline_known_issues"]}
    assert "source_index_provenance_not_reproducible" in ids


def test_preview_fidelity_ceiling_is_a_named_pipeline_issue(atlas):
    """Verified finding must be recorded once, cross-referenced by affected rows, not restated per row."""
    issues = {issue["id"]: issue for issue in atlas["pipeline_known_issues"]}
    assert "preview_fidelity_ceiling" in issues
    affects = set(issues["preview_fidelity_ceiling"]["affects"])
    assert affects == {
        "scenes_builtin",
        "music_mode",
        "video_dreamview",
        "diy_upload",
        "diy_activation",
    }


@pytest.mark.parametrize(
    ("model", "capability", "expected_preview_level"),
    [
        ("H617A", "scenes_builtin", "structural"),
        ("H6199", "scenes_builtin", "structural"),
        ("H617A", "music_mode", "live"),
        ("H6199", "music_mode", "live"),
        ("H6199", "video_dreamview", "live"),
    ],
)
def test_previewability_finding_downgrades_are_applied(atlas, model, capability, expected_preview_level):
    """Scenes are structural-only (motion/timing uncalibrated); reactive music/video are live-signal-only.

    The atlas must reflect the verified finding, not the earlier optimistic 'modelled' guess.
    """
    row = _row(atlas, model, capability)
    assert row["preview_level"] == expected_preview_level
    assert any("preview_fidelity_ceiling" in gap for gap in row["known_gaps"])


def test_static_color_and_brightness_remain_deterministic(atlas):
    """Static colour/brightness are named as exactly-previewable; must not regress while other rows are downgraded."""
    for model in ("H617A", "H6199"):
        assert _row(atlas, model, "static_color")["preview_level"] == "deterministic"
        assert _row(atlas, model, "brightness")["preview_level"] == "deterministic"


def test_scene_type_zero_must_not_animate_is_documented_with_catalogue_counts(atlas):
    h617a = _row(atlas, "H617A", "scenes_builtin")
    assert "83" in h617a["summary"]
    assert "9 type0" in h617a["summary"]
    assert "72 type2" in h617a["summary"]
    assert any("scene_type=0" in gap and "must not be animated" in gap for gap in h617a["known_gaps"])

    h6199 = _row(atlas, "H6199", "scenes_builtin")
    assert "240" in h6199["summary"]
    assert "12 type0" in h6199["summary"]
    assert "226 type2" in h6199["summary"]
    assert any("scene_type=0" in gap and "must not be animated" in gap for gap in h6199["known_gaps"])


def test_diy_upload_notes_deterministic_paint_map_and_palette_subset(atlas):
    """diy_upload stays structural row-wide while only the painted segment map is deterministic."""
    row = _row(atlas, "H617A", "diy_upload")
    assert row["preview_level"] == "structural"
    assert any("deterministic static preview" in gap and "15-segment paint map" in gap for gap in row["known_gaps"])


def test_h6199_diy_activation_preserves_the_unproven_binding(atlas):
    row = _row(atlas, "H6199", "diy_activation")
    assert row["persistence_need"] == "deployment_intent"
    assert any("Runtime therefore reports the transaction as uncertain" in gap for gap in row["known_gaps"])


def test_rejects_missing_required_field(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    del row["ha_surface"]
    problems = lint.check_required_fields(row, 0)
    assert any("ha_surface" in problem for problem in problems)


def test_rejects_invalid_evidence_status(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["evidence_status"] = "definitely_confirmed"
    problems = lint.check_enum_values(row, 0, atlas)
    assert any("evidence_status" in problem for problem in problems)


def test_rejects_invalid_preview_level(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["preview_level"] = "photorealistic"
    problems = lint.check_enum_values(row, 0, atlas)
    assert any("preview_level" in problem for problem in problems)


def test_rejects_invalid_runtime_wiring_status(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["runtime"] = {"encode": "wired", "decode": "wired", "readback": "kind_of"}
    problems = lint.check_enum_values(row, 0, atlas)
    assert any("readback" in problem for problem in problems)


def test_rejects_duplicate_model_capability_pairs(atlas):
    rows = [atlas["capabilities"][0], atlas["capabilities"][0]]
    problems = lint.check_uniqueness(rows)
    assert problems


def test_rejects_dangling_kaitai_schema_reference(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["kaitai_schema"] = ["command_write.ksy::nonexistent_type"]
    problems = lint.check_kaitai_schema_refs(row, 0)
    assert problems


def test_rejects_malformed_kaitai_schema_reference(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["kaitai_schema"] = ["not-a-schema-reference"]
    problems = lint.check_kaitai_schema_refs(row, 0)
    assert problems


def test_rejects_dangling_evidence_ref(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["evidence_refs"] = ["this_fixture_does_not_exist"]
    problems = lint.check_evidence_refs(row, 0)
    assert problems


def test_accepts_capture_prefixed_evidence_ref_without_a_file(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["evidence_refs"] = ["capture:some historical session, never committed"]
    problems = lint.check_evidence_refs(row, 0)
    assert problems == []


def test_rejects_dangling_aggregate_ref(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["aggregate_refs"] = ["this_aggregate_does_not_exist"]
    problems = lint.check_aggregate_refs(row, 0)
    assert problems


def test_accepts_committed_aggregate_refs(atlas):
    row = copy.deepcopy(_row(atlas, "H617A", "diy_activation"))
    problems = lint.check_aggregate_refs(row, 0)
    assert problems == []


def test_rejects_resolved_protocol_blocker_anywhere_in_affected_row(atlas):
    row = copy.deepcopy(_row(atlas, "H617A", "diy_upload"))
    row["summary"] += " Still blocked by GitHub issue #155."
    problems = lint.check_resolved_protocol_blocker_refs(row, 0)
    assert problems


def test_rejects_resolved_protocol_blocker_in_any_row(atlas):
    row = copy.deepcopy(_row(atlas, "H6199", "diy_upload"))
    row["summary"] += " Historical issue #155."
    problems = lint.check_resolved_protocol_blocker_refs(row, 0)
    assert problems


def test_rejects_missing_resolved_protocol_blocker_target(atlas):
    invalid = copy.deepcopy(atlas)
    row = _row(invalid, "H617A", "diy_upload")
    row["capability"] = "diy_upload issue #155"
    problems = lint.validate(invalid)
    assert any("target missing capability row" in problem for problem in problems)
    assert any("references resolved protocol blocker" in problem for problem in problems)


def test_rejects_dangling_generated_module(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["generated_module"] = "custom_components/ha_govee_led_ble/generated_protocol/does_not_exist.py"
    problems = lint.check_generated_module(row, 0)
    assert problems


def test_absent_evidence_status_forbids_nonempty_schema_or_refs(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["evidence_status"] = "absent"
    row["kaitai_schema"] = ["command_write.ksy::power_cmd"]
    problems = lint.check_absent_rows_have_no_schema(row, 0)
    assert problems


# --- Review-finding regressions -------------------------------------------------
#
# check_kaitai_schema_refs must parse each .ksy file's real YAML structure (meta.id
# plus nested types: mappings) rather than regex-matching arbitrary "  <name>:" lines,
# or an enum member name or the reserved seq: key would wrongly validate as a type.


def test_rejects_enum_member_as_kaitai_schema_type_reference(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    # command_op is a real enum (under enums:) in h6199_command_write.ksy, not a type.
    row["kaitai_schema"] = ["h6199_command_write.ksy::command_op"]
    problems = lint.check_kaitai_schema_refs(row, 0)
    assert problems


def test_rejects_seq_keyword_as_kaitai_schema_type_reference(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    # seq is Kaitai's reserved field-list key, appearing 12x in h6199_command_write.ksy;
    # it must never be accepted as if it were a nested type name.
    row["kaitai_schema"] = ["h6199_command_write.ksy::seq"]
    problems = lint.check_kaitai_schema_refs(row, 0)
    assert problems


def test_accepts_real_nested_type_and_meta_id_as_kaitai_schema_type_reference(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["kaitai_schema"] = ["h6199_command_write.ksy::mode_body", "h6199_command_write.ksy::h6199_command_write"]
    problems = lint.check_kaitai_schema_refs(row, 0)
    assert problems == []


def test_wifi_provisioning_known_gaps_credit_the_real_decode_wiring(atlas):
    row = _row(atlas, "H6199", "wifi_provisioning")
    assert row["runtime"]["decode"] == "tool_only"
    gaps = " ".join(row["known_gaps"])
    assert "generated_protocol_view" in gaps
    assert "decode_govee" in gaps
    assert "is_wifi_provision" in gaps
    # The corrected prose must not claim decode never uses the generated classes.
    assert "hand-rolls frame bytes rather than importing the generated classes" not in gaps


def test_h617a_music_streams_decode_is_tool_only_not_none(atlas):
    row = _row(atlas, "H617A", "music_streams")
    assert row["runtime"]["decode"] == "tool_only"
    gaps = " ".join(row["known_gaps"])
    assert "generated_protocol_view" in gaps
    assert "is_music_stream" in gaps


def test_h6199_music_streams_row_is_unaffected(atlas):
    row = _row(atlas, "H6199", "music_streams")
    assert row["runtime"]["decode"] == "none"


@pytest.mark.parametrize("model", ["H617A", "H6199"])
def test_timers_evidence_refs_are_non_empty_and_capture_prefixed(atlas, model):
    row = _row(atlas, model, "timers")
    assert row["evidence_status"] == "raw_attributed"
    assert row["evidence_refs"], "raw_attributed timers row must cite what was observed"
    for ref in row["evidence_refs"]:
        assert ref.startswith("capture:"), (
            f"{ref!r} is not capture-prefixed: raw_attributed means no fixture is currently committed"
        )
    problems = lint.check_evidence_refs(row, 0) + lint.check_non_absent_rows_have_evidence_refs(row, 0)
    assert problems == []


def test_check_non_absent_rows_have_evidence_refs_rejects_empty_refs(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["evidence_status"] = "raw_attributed"
    row["evidence_refs"] = []
    problems = lint.check_non_absent_rows_have_evidence_refs(row, 0)
    assert problems


def test_check_non_absent_rows_have_evidence_refs_allows_absent_with_empty_refs(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["evidence_status"] = "absent"
    row["evidence_refs"] = []
    problems = lint.check_non_absent_rows_have_evidence_refs(row, 0)
    assert problems == []


def test_no_committed_row_fails_the_new_non_absent_evidence_refs_invariant(atlas):
    problems = []
    for index, row in enumerate(atlas["capabilities"]):
        problems.extend(lint.check_non_absent_rows_have_evidence_refs(row, index))
    assert problems == []


@pytest.mark.parametrize("model", ["H617A", "H6199"])
def test_scenes_builtin_preview_variants_cover_all_scene_types(atlas, model):
    row = _row(atlas, model, "scenes_builtin")
    variants = row["preview_variants"]
    assert {variant["label"]: variant["preview_level"] for variant in variants} == {
        "scene_type0": "opaque",
        "scene_type1": "structural",
        "scene_type2": "structural",
    }
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems == []
    # The row's own aggregate preview_level must be one its variants actually carry.
    assert row["preview_level"] in {variant["preview_level"] for variant in variants}


def test_scene_type1_preview_metadata_does_not_claim_layout1_hardware_evidence(atlas):
    for model in ("H617A", "H6199"):
        row = _row(atlas, model, "scenes_builtin")
        variant = next(item for item in row["preview_variants"] if item["label"] == "scene_type1")
        assert "layout 0" in variant["note"]
        assert "Layout 1" in variant["note"]
        assert "no hardware evidence" in variant["note"]

    h617a = _row(atlas, "H617A", "scenes_builtin")
    fixture_refs = [ref for ref in h617a["evidence_refs"] if ref.startswith("scene_type1_")]
    assert fixture_refs
    for ref in fixture_refs:
        fixture = yaml.safe_load((lint.SPEC_DIR / f"{ref}.kst").read_text(encoding="utf-8"))
        layout_assertions = [
            assertion["expected"] for assertion in fixture["asserts"] if assertion["actual"] == "layout"
        ]
        assert layout_assertions == [0]


def test_diy_upload_h617a_preview_variants_match_product_classifications(atlas):
    row = _row(atlas, "H617A", "diy_upload")
    variants = row["preview_variants"]
    assert {variant["label"]: variant["preview_level"] for variant in variants} == {
        "painted_segment_map": "deterministic",
        "type04_fixture_catalogue": "structural",
        "workshop_layers": "structural",
        "uncaptured_special_templates": "opaque",
    }
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems == []


def test_type04_preview_claim_is_limited_to_fixture_backed_catalogue_entries(atlas):
    row = _row(atlas, "H617A", "diy_upload")
    variants = {variant["label"]: variant for variant in row["preview_variants"]}
    catalogue_fixtures = {effect.source_fixture.removesuffix(".bin") for effect in H617A_TYPE04_EFFECTS}

    assert len(catalogue_fixtures) == 4
    assert catalogue_fixtures <= set(row["evidence_refs"])
    assert "Four exact family/variant identities" in variants["type04_fixture_catalogue"]["note"]
    assert "Neither source maps" in variants["type04_fixture_catalogue"]["note"]
    uncaptured_note = variants["uncaptured_special_templates"]["note"]
    assert "No H617A Special DIY payload has committed attribution" in uncaptured_note
    assert "H6199 fixtures cannot establish an H617A grammar" in uncaptured_note


def test_preview_pipeline_does_not_call_type04_palette_deterministic(atlas):
    issue = next(issue for issue in atlas["pipeline_known_issues"] if issue["id"] == "preview_fidelity_ceiling")
    summary = issue["summary"]

    assert "diy_type04" in summary
    assert "structural-only rather than deterministic" in summary
    assert "uncaptured special DIY templates" in summary


def test_diy_upload_h6199_has_no_preview_variants_pending_evaluation(atlas):
    # h6199_effect_upload has not been evaluated against H617A's product-specific
    # classification (see known_gaps).  No variants are more honest than a fabricated
    # breakdown.
    row = _row(atlas, "H6199", "diy_upload")
    assert "preview_variants" not in row


def test_h6199_special_diy_wording_distinguishes_shared_routing_from_physical_evidence(atlas):
    row = _row(atlas, "H6199", "diy_upload")
    gaps = " ".join(row["known_gaps"])

    assert "Palette DIY and Special DIY use the same captured kind 0x04 bodies" in gaps
    assert "Runtime sends both through the same slot 401 activation transaction" in gaps
    assert "no capture proves that slot binding" in gaps


def test_check_preview_variants_requires_all_fields(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["preview_variants"] = [{"label": "incomplete"}]
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems


def test_check_preview_variants_rejects_invalid_preview_level(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["preview_variants"] = [{"label": "bogus", "preview_level": "not-a-real-level", "note": "x"}]
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems


def test_check_preview_variants_rejects_duplicate_labels(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["preview_variants"] = [
        {"label": "same", "preview_level": "structural", "note": "a"},
        {"label": "same", "preview_level": "opaque", "note": "b"},
    ]
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems


def test_check_preview_variants_rejects_aggregate_disconnected_from_variants(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row["preview_level"] = "live"
    row["preview_variants"] = [
        {"label": "a", "preview_level": "structural", "note": "a"},
        {"label": "b", "preview_level": "opaque", "note": "b"},
    ]
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems


def test_check_preview_variants_accepts_none(atlas):
    row = copy.deepcopy(atlas["capabilities"][0])
    row.pop("preview_variants", None)
    problems = lint.check_preview_variants(row, 0, atlas)
    assert problems == []
