"""Versioned Effect Studio catalogue contracts."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from .const import MODEL_PROFILES, MUSIC_MODE_SLUGS
from .effect_contracts import CapabilityState
from .effect_domain import MAX_MULTI_EFFECTS, MAX_PALETTE_COLOURS, JsonValue
from .generated_protocol.diy_type03 import DiyType03  # type: ignore[attr-defined]

EFFECT_STUDIO_CATALOGUE_SCHEMA_VERSION: Final = 2
LEGACY_CATALOGUE_SKU: Final = "H617A"

# PR #156 proves code 24 immediately follows and reads back after both Flat and Combo uploads.
H617A_TYPE04_APPLY_CODE: Final = 24


@dataclass(frozen=True, slots=True)
class DiyEffectTemplate:
    id: str
    label: str
    family: int
    variant: int
    source_fixture: str

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
            "family": self.family,
            "variant": self.variant,
        }


@dataclass(frozen=True, slots=True)
class DiyEffectVariation:
    id: str
    label: str
    variant: int

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
            "variant": self.variant,
        }


@dataclass(frozen=True, slots=True)
class DiyEffectFamily:
    id: str
    label: str
    family: int
    variations: tuple[DiyEffectVariation, ...]
    supports_multi: bool
    rate: str = "speed"
    source_reference: str = "GoveeHome V7.5.30 dreamcolorlightv1.adjust.Diy"

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
            "family": self.family,
            "variations": [variation.to_dict() for variation in self.variations],
            "supports_multi": self.supports_multi,
            "rate": self.rate,
        }


@dataclass(frozen=True, slots=True)
class NativeModeOption:
    id: str
    label: str

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
        }


@dataclass(frozen=True, slots=True)
class CatalogueSupport:
    multi: CapabilityState
    advanced: CapabilityState

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "multi": self.multi.value,
            "advanced": self.advanced.value,
        }


@dataclass(frozen=True, slots=True)
class ApplySupport:
    single: CapabilityState
    multi: CapabilityState

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "single": self.single.value,
            "multi": self.multi.value,
        }


@dataclass(frozen=True, slots=True)
class ModelEffectCatalogue:
    sku: str
    painted_effects: tuple[dict[str, str], ...]
    effects: tuple[DiyEffectFamily, ...]
    music_modes: tuple[NativeModeOption, ...]
    video_modes: tuple[NativeModeOption, ...]
    supports: CatalogueSupport
    apply: ApplySupport

    def to_dict(self) -> dict[str, JsonValue]:
        profile = MODEL_PROFILES[self.sku]
        return {
            "sku": self.sku,
            "painted_effects": [dict(effect) for effect in self.painted_effects],
            "effects": [effect.to_dict() for effect in self.effects],
            "music_modes": [mode.to_dict() for mode in self.music_modes],
            "video_modes": [mode.to_dict() for mode in self.video_modes],
            "supports": self.supports.to_dict(),
            "limits": {
                "palette_min": 1,
                "palette_max": MAX_PALETTE_COLOURS,
                "multi_max": MAX_MULTI_EFFECTS,
                "music_sensitivity_min": profile.music_sensitivity_min,
                "music_sensitivity_max": profile.music_sensitivity_max,
            },
            "apply": self.apply.to_dict(),
        }


H617A_TYPE04_EFFECTS: Final = (
    DiyEffectTemplate(
        "fade",
        "Fade",
        0,
        0,
        "diy_type04_flat_len_palette_0x0c_4_colours_fam_0x00.bin",
    ),
    DiyEffectTemplate(
        "jumping",
        "Jumping",
        1,
        0,
        "diy_type04_flat_len_palette_0x03_1_colour_fam_0x01.bin",
    ),
    DiyEffectTemplate(
        "marquee",
        "Marquee",
        3,
        3,
        "diy_type04_flat_len_palette_0x15_7_colours_fam_0x03.bin",
    ),
    DiyEffectTemplate(
        "chasing",
        "Stream",
        8,
        9,
        "diy_type04_flat_len_palette_0x09_3_colours_fam_0x08.bin",
    ),
)

# GoveeHome V7.5.30 exposes these basic Type04 families through
# dreamcolorlightv1.adjust.Diy.e(), with the same base roster retained by later
# revisions.  The family and variation bytes use the structure defined by
# diy_type04.ksy.  H617A_TYPE04_EFFECTS retains historical capture-corpus IDs;
# its family 8 fixture is the vendor-labelled Stream family.
H617A_TYPE04_FAMILIES: Final = (
    DiyEffectFamily(
        "fade",
        "Fade",
        0,
        (
            DiyEffectVariation("whole", "Whole strip", 0),
            DiyEffectVariation("sections", "Sections", 1),
            DiyEffectVariation("cycle", "Cycle", 2),
        ),
        True,
    ),
    DiyEffectFamily(
        "jumping",
        "Jumping",
        1,
        (
            DiyEffectVariation("whole", "Whole strip", 0),
            DiyEffectVariation("cycle", "Cycle", 2),
        ),
        True,
    ),
    DiyEffectFamily(
        "blinking",
        "Blinking",
        2,
        (
            DiyEffectVariation("whole", "Whole strip", 0),
            DiyEffectVariation("sections", "Sections", 1),
            DiyEffectVariation("cycle", "Cycle", 2),
        ),
        True,
    ),
    DiyEffectFamily(
        "marquee",
        "Marquee",
        3,
        (
            DiyEffectVariation("all", "Together", 3),
            DiyEffectVariation("gathered", "Gather", 4),
            DiyEffectVariation("dispersive", "Disperse", 5),
        ),
        True,
    ),
    DiyEffectFamily(
        "music",
        "Music",
        4,
        (
            DiyEffectVariation("rhythm", "Rhythm", 8),
            DiyEffectVariation("spectrum", "Spectrum", 6),
            DiyEffectVariation("rolling", "Rolling", 7),
        ),
        False,
        "sensitivity",
    ),
    DiyEffectFamily(
        "stream",
        "Stream",
        8,
        (
            DiyEffectVariation("clockwise", "Clockwise", 9),
            DiyEffectVariation("counter_clockwise", "Counterclockwise", 10),
        ),
        True,
    ),
    DiyEffectFamily(
        "flow",
        "Flow",
        9,
        (
            DiyEffectVariation("clockwise", "Clockwise", 9),
            DiyEffectVariation("counter_clockwise", "Counterclockwise", 10),
        ),
        True,
    ),
    DiyEffectFamily(
        "chase",
        "Chase",
        10,
        (DiyEffectVariation("default", "Default", 0),),
        False,
    ),
)

H617A_PAINTED_EFFECTS: Final = tuple(
    {
        "id": effect.name,
        "label": "Counterclockwise" if effect.name == "counter_clockwise" else effect.name.capitalize(),
    }
    for effect in DiyType03.Effect
)


def _mode_label(slug: str) -> str:
    return slug.replace("_", " ").title()


def _native_music_modes(model: str) -> tuple[NativeModeOption, ...]:
    supported = frozenset(MODEL_PROFILES[model].music_modes)
    return tuple(
        NativeModeOption(
            slug,
            _mode_label(slug),
        )
        for slug in MUSIC_MODE_SLUGS
        if slug in supported
    )


H617A_NATIVE_MUSIC_MODES: Final = _native_music_modes("H617A")
H6199_DIY_SOURCE_REFERENCE: Final = "tools/ble/kaitai/h6199_effect_upload.ksy"

H6199_DIY_EFFECTS: Final = (
    DiyEffectTemplate(
        "fade",
        "Fade",
        0,
        0,
        "h6199_effect_diy_fade1_fast.bin",
    ),
    DiyEffectTemplate(
        "jumping",
        "Jumping",
        1,
        0,
        "h6199_effect_diy_jumping1.bin",
    ),
    DiyEffectTemplate(
        "twinkle",
        "Twinkle",
        2,
        0,
        "h6199_effect_diy_twinkle1.bin",
    ),
    DiyEffectTemplate(
        "marquee",
        "Marquee",
        3,
        3,
        "h6199_effect_diy_marquee1.bin",
    ),
    DiyEffectTemplate(
        "music",
        "Music",
        4,
        8,
        "h6199_effect_diy_music1.bin",
    ),
    DiyEffectTemplate(
        "chasing",
        "Chasing",
        8,
        9,
        "h6199_effect_diy_chasing1.bin",
    ),
    DiyEffectTemplate(
        "chasing_counterclockwise",
        "Chasing Counterclockwise",
        8,
        10,
        "h6199_effect_diy_chasing2.bin",
    ),
    DiyEffectTemplate(
        "rainbow",
        "Rainbow",
        9,
        9,
        "h6199_effect_diy_rainbow1.bin",
    ),
    DiyEffectTemplate(
        "crossing",
        "Crossing",
        10,
        0,
        "h6199_effect_diy_crossing.bin",
    ),
)

H6199_PALETTE_DIY_FAMILIES: Final = (
    DiyEffectFamily(
        "fade",
        "Fade",
        0,
        (DiyEffectVariation("default", "Default", 0),),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "jumping",
        "Jumping",
        1,
        (DiyEffectVariation("default", "Default", 0),),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "twinkle",
        "Twinkle",
        2,
        (DiyEffectVariation("default", "Default", 0),),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "marquee",
        "Marquee",
        3,
        (DiyEffectVariation("default", "Default", 3),),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "music",
        "Music",
        4,
        (DiyEffectVariation("default", "Default", 8),),
        False,
        "sensitivity",
        H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "chasing",
        "Chasing",
        8,
        (
            DiyEffectVariation("clockwise", "Clockwise", 9),
            DiyEffectVariation("counter_clockwise", "Counterclockwise", 10),
        ),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "rainbow",
        "Rainbow",
        9,
        (DiyEffectVariation("default", "Default", 9),),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
    DiyEffectFamily(
        "crossing",
        "Crossing",
        10,
        (DiyEffectVariation("default", "Default", 0),),
        False,
        source_reference=H6199_DIY_SOURCE_REFERENCE,
    ),
)

H6199_NATIVE_MUSIC_MODES: Final = _native_music_modes("H6199")

H6199_VIDEO_MODES: Final = (
    NativeModeOption("movie", "Movie"),
    NativeModeOption("game", "Game"),
)

MODEL_EFFECT_CATALOGUES: Final = {
    "H617A": ModelEffectCatalogue(
        sku="H617A",
        painted_effects=H617A_PAINTED_EFFECTS,
        effects=H617A_TYPE04_FAMILIES,
        music_modes=H617A_NATIVE_MUSIC_MODES,
        video_modes=(),
        supports=CatalogueSupport(
            multi=CapabilityState.SUPPORTED,
            advanced=CapabilityState.EVIDENCE_GAP,
        ),
        apply=ApplySupport(
            single=CapabilityState.SUPPORTED,
            multi=CapabilityState.SUPPORTED,
        ),
    ),
    "H6199": ModelEffectCatalogue(
        sku="H6199",
        painted_effects=(),
        effects=H6199_PALETTE_DIY_FAMILIES,
        music_modes=H6199_NATIVE_MUSIC_MODES,
        video_modes=H6199_VIDEO_MODES,
        supports=CatalogueSupport(
            multi=CapabilityState.UNSUPPORTED,
            advanced=CapabilityState.EVIDENCE_GAP,
        ),
        apply=ApplySupport(
            single=CapabilityState.UNSUPPORTED,
            multi=CapabilityState.UNSUPPORTED,
        ),
    ),
}


def custom_effect_catalogue_payload() -> dict[str, JsonValue]:
    legacy = MODEL_EFFECT_CATALOGUES[LEGACY_CATALOGUE_SKU].to_dict()
    return {
        "schema_version": EFFECT_STUDIO_CATALOGUE_SCHEMA_VERSION,
        **legacy,
        "models": {sku: catalogue.to_dict() for sku, catalogue in MODEL_EFFECT_CATALOGUES.items()},
    }
