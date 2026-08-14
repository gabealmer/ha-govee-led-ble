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
    H6199_VIDEO_MODES,
    LEGACY_CATALOGUE_SKU,
    MODEL_EFFECT_CATALOGUES,
    custom_effect_catalogue_payload,
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
        "single": "supported",
        "multi": "supported",
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
    models = cast(
        dict[str, dict[str, JsonValue]],
        custom_effect_catalogue_payload()["models"],
    )
    assert models["H617A"]["music_modes"] == expected_modes("H617A")


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
        "advanced": "evidence_gap",
    }
    assert catalogue["apply"] == {
        "single": "unsupported",
        "multi": "unsupported",
    }
