"""Capture- and vendor-grounded authoring catalogue for H617A custom effects."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from .effect_domain import MAX_MULTI_EFFECTS, MAX_PALETTE_COLOURS, JsonValue
from .generated_protocol.diy_type03 import DiyType03  # type: ignore[attr-defined]

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


def custom_effect_catalogue_payload() -> dict[str, JsonValue]:
    return {
        "schema_version": 1,
        "sku": "H617A",
        "painted_effects": list(H617A_PAINTED_EFFECTS),
        "effects": [effect.to_dict() for effect in H617A_TYPE04_FAMILIES],
        "limits": {
            "palette_min": 1,
            "palette_max": MAX_PALETTE_COLOURS,
            "multi_max": MAX_MULTI_EFFECTS,
        },
        "apply": {
            "single": "supported",
            "multi": "supported",
        },
    }
