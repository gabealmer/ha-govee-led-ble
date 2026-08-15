"""Fixture grounding for the model-aware Effect Studio catalogue."""

import io
from pathlib import Path
from typing import cast

from kaitaistruct import KaitaiStream

from custom_components.ha_govee_led_ble.const import MODEL_PROFILES, MUSIC_MODE_SLUGS
from custom_components.ha_govee_led_ble.effect_catalogue import (
    EFFECT_STUDIO_CATALOGUE_SCHEMA_VERSION,
    H617A_NATIVE_MUSIC_MODES,
    H617A_PAINTED_EFFECTS,
    H617A_TYPE04_APPLY_CODE,
    H617A_TYPE04_EFFECTS,
    H617A_TYPE04_FAMILIES,
    H6199_DIY_EFFECTS,
    H6199_NATIVE_MUSIC_MODES,
    H6199_PALETTE_DIY_FAMILIES,
    H6199_SPECIAL_DIY_TEMPLATES,
    H6199_VIDEO_MODES,
    LEGACY_CATALOGUE_SKU,
    MODEL_EFFECT_CATALOGUES,
    WORKSHOP_TEMPLATES,
    custom_effect_catalogue_payload,
)
from custom_components.ha_govee_led_ble.effect_contracts import (
    RELEASE_CAPABILITY_CONTRACT,
    ApplicationRoute,
    CapabilityState,
    CapabilityWorkflow,
    CompilerDeployerStrategy,
    EvidenceClassification,
    FrontendVisibility,
    PhysicalValidationState,
    VerificationConfidence,
    frontend_release_capabilities,
    release_capability,
    studio_apply_capability_state,
    workflow_capability_state,
)
from custom_components.ha_govee_led_ble.effect_domain import JsonValue
from custom_components.ha_govee_led_ble.generated_protocol.diy_type03 import DiyType03
from custom_components.ha_govee_led_ble.generated_protocol.diy_type04 import DiyType04
from custom_components.ha_govee_led_ble.generated_protocol.h6199_effect_upload import H6199EffectUpload

FIXTURES = Path(__file__).resolve().parents[1] / "tools/ble/kaitai/src"


def test_h617a_type04_authoring_options_match_their_committed_fixtures() -> None:
    for effect in H617A_TYPE04_EFFECTS:
        parsed = DiyType04(KaitaiStream(io.BytesIO((FIXTURES / effect.source_fixture).read_bytes())))
        parsed._read()

        assert (effect.family, effect.variant) == (
            parsed.family,
            parsed.body.variant,
        )


def test_h6199_palette_diy_options_match_their_committed_fixtures() -> None:
    for effect in H6199_DIY_EFFECTS:
        parsed = H6199EffectUpload(KaitaiStream(io.BytesIO((FIXTURES / effect.source_fixture).read_bytes())))
        parsed._read()

        assert parsed.kind == H6199EffectUpload.BodyKind.diy
        assert (effect.family, effect.variant) == (
            parsed.content.family,
            parsed.content.variant,
        )


def test_model_aware_catalogue_includes_both_models_and_legacy_h617a_view() -> None:
    catalogue = custom_effect_catalogue_payload()

    assert catalogue["schema_version"] == EFFECT_STUDIO_CATALOGUE_SCHEMA_VERSION
    assert catalogue["sku"] == LEGACY_CATALOGUE_SKU
    assert catalogue["models"] == {sku: model.to_dict() for sku, model in MODEL_EFFECT_CATALOGUES.items()}
    assert catalogue["painted_effects"] == list(H617A_PAINTED_EFFECTS)
    assert catalogue["effects"] == [family.to_dict() for family in H617A_TYPE04_FAMILIES]
    assert catalogue["music_modes"] == [mode.to_dict() for mode in H617A_NATIVE_MUSIC_MODES]
    assert catalogue["video_modes"] == []
    assert catalogue["limits"] == {
        "palette_min": 1,
        "palette_max": 8,
        "multi_max": 4,
        "music_sensitivity_min": 0,
        "music_sensitivity_max": 99,
    }
    assert H617A_TYPE04_APPLY_CODE == 24
    assert catalogue["apply"] == {
        "painted": "supported",
        "single": "supported",
        "multi": "supported",
        "palette_diy": "unsupported",
        "workshop": "supported",
        "special_diy": "unsupported",
    }


def test_h617a_model_catalogue_preserves_type04_and_painted_contracts() -> None:
    models = cast(
        dict[str, dict[str, JsonValue]],
        custom_effect_catalogue_payload()["models"],
    )
    catalogue = models["H617A"]

    assert catalogue["painted_effects"] == list(H617A_PAINTED_EFFECTS)
    assert catalogue["effects"] == [family.to_dict() for family in H617A_TYPE04_FAMILIES]
    assert {
        (family.family, variation.variant) for family in H617A_TYPE04_FAMILIES for variation in family.variations
    } == {
        (0, 0),
        (0, 1),
        (0, 2),
        (1, 0),
        (1, 2),
        (2, 0),
        (2, 1),
        (2, 2),
        (3, 3),
        (3, 4),
        (3, 5),
        (4, 6),
        (4, 7),
        (4, 8),
        (8, 9),
        (8, 10),
        (9, 9),
        (9, 10),
        (10, 0),
    }
    assert [effect["id"] for effect in H617A_PAINTED_EFFECTS] == [effect.name for effect in DiyType03.Effect]


def test_native_music_modes_are_derived_from_profiles_and_slug_catalogue() -> None:
    def expected_modes(model: str) -> list[dict[str, str]]:
        supported = frozenset(MODEL_PROFILES[model].music_modes)
        return [
            {
                "id": slug,
                "label": slug.replace("_", " ").title(),
            }
            for slug in MUSIC_MODE_SLUGS
            if slug in supported
        ]

    assert [mode.to_dict() for mode in H617A_NATIVE_MUSIC_MODES] == expected_modes("H617A")
    assert [mode.to_dict() for mode in H6199_NATIVE_MUSIC_MODES] == expected_modes("H6199")
    assert all(mode.id != "custom" for mode in (*H617A_NATIVE_MUSIC_MODES, *H6199_NATIVE_MUSIC_MODES))
    models = cast(
        dict[str, dict[str, JsonValue]],
        custom_effect_catalogue_payload()["models"],
    )
    assert models["H617A"]["music_modes"] == expected_modes("H617A")


def test_palette_music_families_remain_single_layer_effects_for_both_models() -> None:
    for families in (H617A_TYPE04_FAMILIES, H6199_PALETTE_DIY_FAMILIES):
        music = next(family for family in families if family.id == "music")

        assert music.label == "Music"
        assert music.rate == "sensitivity"
        assert music.category == "single_layer"
        assert all(family.to_dict()["category"] == "single_layer" for family in families)


def test_h6199_model_catalogue_exposes_confirmed_palette_music_and_video_entries() -> None:
    models = cast(
        dict[str, dict[str, JsonValue]],
        custom_effect_catalogue_payload()["models"],
    )
    catalogue = models["H6199"]

    assert catalogue["painted_effects"] == []
    assert catalogue["effects"] == [family.to_dict() for family in H6199_PALETTE_DIY_FAMILIES]
    assert [mode.to_dict() for mode in H6199_VIDEO_MODES] == [
        {"id": "movie", "label": "Movie"},
        {"id": "game", "label": "Game"},
    ]
    assert catalogue["music_modes"] == [mode.to_dict() for mode in H6199_NATIVE_MUSIC_MODES]
    assert catalogue["video_modes"] == [mode.to_dict() for mode in H6199_VIDEO_MODES]
    assert catalogue["supports"] == {
        "multi": "unsupported",
        "advanced": "supported",
        "workshop": "supported",
        "special_diy": "supported",
    }
    assert catalogue["apply"] == {
        "painted": "unsupported",
        "single": "unsupported",
        "multi": "unsupported",
        "palette_diy": "supported",
        "workshop": "supported",
        "special_diy": "supported",
    }


def test_release_capability_contract_covers_every_preview_workflow() -> None:
    expected = {
        "H617A": {
            CapabilityWorkflow.NATIVE_SCENES,
            CapabilityWorkflow.EDITED_PALETTE_SCENES,
            CapabilityWorkflow.LAYERED_SCENES,
            CapabilityWorkflow.PAINTED,
            CapabilityWorkflow.SINGLE,
            CapabilityWorkflow.MULTI,
            CapabilityWorkflow.NATIVE_MUSIC,
            CapabilityWorkflow.ADVANCED,
            CapabilityWorkflow.WORKSHOP,
            CapabilityWorkflow.SPECIAL_DIY,
        },
        "H6199": {
            CapabilityWorkflow.NATIVE_SCENES,
            CapabilityWorkflow.EDITED_PALETTE_SCENES,
            CapabilityWorkflow.LAYERED_SCENES,
            CapabilityWorkflow.PALETTE_DIY,
            CapabilityWorkflow.NATIVE_MUSIC,
            CapabilityWorkflow.VIDEO,
            CapabilityWorkflow.ADVANCED,
            CapabilityWorkflow.WORKSHOP,
            CapabilityWorkflow.SPECIAL_DIY,
        },
    }

    for model, workflows in expected.items():
        model_contract = [capability for capability in RELEASE_CAPABILITY_CONTRACT if capability.model == model]
        declared = {capability.workflow for capability in model_contract}
        assert declared == workflows
        assert len(model_contract) == len(workflows)


def test_model_visible_capabilities_declare_application_and_evidence_strategies() -> None:
    visible = [
        capability
        for capability in RELEASE_CAPABILITY_CONTRACT
        if capability.frontend_visibility is FrontendVisibility.VISIBLE
    ]

    assert visible
    assert all(isinstance(capability.application_route, ApplicationRoute) for capability in visible)
    assert all(isinstance(capability.compiler_deployer_strategy, CompilerDeployerStrategy) for capability in visible)
    assert all(isinstance(capability.verification_confidence, VerificationConfidence) for capability in visible)
    assert all(isinstance(capability.physical_validation_state, PhysicalValidationState) for capability in visible)
    assert all(
        isinstance(capability.diagnostics_evidence_classification, EvidenceClassification) for capability in visible
    )
    assert all(capability.persistent_content_kind for capability in visible)


def test_release_capability_contract_preserves_audited_application_boundaries() -> None:
    h617a_painted = release_capability("H617A", CapabilityWorkflow.PAINTED)
    h617a_single = release_capability("H617A", CapabilityWorkflow.SINGLE)
    h617a_multi = release_capability("H617A", CapabilityWorkflow.MULTI)
    h617a_scenes = release_capability("H617A", CapabilityWorkflow.NATIVE_SCENES)
    compiled_scenes = tuple(
        release_capability(model, workflow)
        for model in ("H617A", "H6199")
        for workflow in (
            CapabilityWorkflow.EDITED_PALETTE_SCENES,
            CapabilityWorkflow.LAYERED_SCENES,
            CapabilityWorkflow.ADVANCED,
        )
    )
    h617a_music = release_capability("H617A", CapabilityWorkflow.NATIVE_MUSIC)
    h6199_music = release_capability("H6199", CapabilityWorkflow.NATIVE_MUSIC)
    h6199_video = release_capability("H6199", CapabilityWorkflow.VIDEO)
    h6199_diy = release_capability("H6199", CapabilityWorkflow.PALETTE_DIY)
    h6199_special = release_capability("H6199", CapabilityWorkflow.SPECIAL_DIY)

    assert all(
        capability is not None
        and capability.application_route is ApplicationRoute.STUDIO_CUSTOM_APPLY
        and capability.compiler_deployer_strategy is CompilerDeployerStrategy.H617A_CUSTOM_ENGINE
        and capability.verification_confidence is VerificationConfidence.SELECTION_ONLY
        for capability in (h617a_painted, h617a_single, h617a_multi)
    )
    assert h617a_scenes is not None
    assert h617a_scenes.application_route is ApplicationRoute.STUDIO_SCENE_APPLY
    assert h617a_scenes.compiler_deployer_strategy is CompilerDeployerStrategy.NATIVE_EFFECT_SELECTION
    assert h617a_music is not None
    assert h617a_music.application_route is ApplicationRoute.STUDIO_CUSTOM_APPLY
    assert h617a_music.compiler_deployer_strategy is CompilerDeployerStrategy.COORDINATOR_WRITER
    assert h617a_music.verification_confidence is VerificationConfidence.SELECTION_ONLY
    assert all(
        capability is not None
        and capability.application_route is ApplicationRoute.STUDIO_CUSTOM_APPLY
        and capability.compiler_deployer_strategy is CompilerDeployerStrategy.MODEL_SCENE_ENGINE
        and capability.verification_confidence is VerificationConfidence.SELECTION_ONLY
        for capability in compiled_scenes
    )
    assert all(
        capability is not None
        and capability.application_route is ApplicationRoute.STUDIO_CUSTOM_APPLY
        and capability.compiler_deployer_strategy is CompilerDeployerStrategy.COORDINATOR_WRITER
        and capability.verification_confidence is VerificationConfidence.STATE_CONFIRMED
        for capability in (h6199_music, h6199_video)
    )
    assert h6199_diy is not None
    assert h6199_diy.application_route is ApplicationRoute.STUDIO_CUSTOM_APPLY
    assert h6199_diy.compiler_deployer_strategy is CompilerDeployerStrategy.H6199_CUSTOM_ENGINE
    assert h6199_diy.verification_confidence is VerificationConfidence.UNVERIFIED
    assert h6199_diy.diagnostics_evidence_classification is EvidenceClassification.STRUCTURAL
    assert h6199_special is not None
    assert h6199_special.application_route is ApplicationRoute.STUDIO_CUSTOM_APPLY
    assert h6199_special.compiler_deployer_strategy is CompilerDeployerStrategy.H6199_CUSTOM_ENGINE
    assert h6199_special.verification_confidence is VerificationConfidence.UNVERIFIED
    assert h6199_special.diagnostics_evidence_classification is EvidenceClassification.STRUCTURAL


def test_catalogue_apply_support_and_visible_workflows_derive_from_release_contract() -> None:
    apply_workflows = {
        "painted": CapabilityWorkflow.PAINTED,
        "single": CapabilityWorkflow.SINGLE,
        "multi": CapabilityWorkflow.MULTI,
        "palette_diy": CapabilityWorkflow.PALETTE_DIY,
        "workshop": CapabilityWorkflow.WORKSHOP,
        "special_diy": CapabilityWorkflow.SPECIAL_DIY,
    }
    models = cast(
        dict[str, dict[str, JsonValue]],
        custom_effect_catalogue_payload()["models"],
    )

    for model, catalogue in models.items():
        assert catalogue["workflows"] == frontend_release_capabilities(model)
        for field, workflow in apply_workflows.items():
            assert (
                cast(dict[str, str], catalogue["apply"])[field]
                == studio_apply_capability_state(
                    model,
                    workflow,
                ).value
            )


def test_capability_state_distinguishes_visibility_from_deployability() -> None:
    assert workflow_capability_state("H617A", CapabilityWorkflow.ADVANCED) is CapabilityState.SUPPORTED
    assert workflow_capability_state("H6199", CapabilityWorkflow.ADVANCED) is CapabilityState.SUPPORTED
    assert studio_apply_capability_state("H6199", CapabilityWorkflow.PALETTE_DIY) is CapabilityState.SUPPORTED
    assert studio_apply_capability_state("H617A", CapabilityWorkflow.WORKSHOP) is CapabilityState.SUPPORTED
    assert studio_apply_capability_state("H617A", CapabilityWorkflow.SPECIAL_DIY) is CapabilityState.UNSUPPORTED
    assert studio_apply_capability_state("H6199", CapabilityWorkflow.WORKSHOP) is CapabilityState.SUPPORTED
    assert studio_apply_capability_state("H6199", CapabilityWorkflow.SPECIAL_DIY) is CapabilityState.SUPPORTED


def test_workshop_and_special_diy_templates_are_grounded_in_committed_fixtures() -> None:
    for model in ("H617A", "H6199"):
        for template in WORKSHOP_TEMPLATES:
            content = template.content(model)
            fixture = (FIXTURES / template.source_fixture).read_bytes()

            assert content.model == model
            assert content.raw_param == fixture[3:]
            assert content.template == template.id

    for special_template in H6199_SPECIAL_DIY_TEMPLATES:
        special_content = special_template.content()
        fixture = (FIXTURES / special_template.source_fixture).read_bytes()

        assert special_content.raw_payload == fixture
        assert special_content.model == "H6199"
        assert special_content.template == special_template.id
