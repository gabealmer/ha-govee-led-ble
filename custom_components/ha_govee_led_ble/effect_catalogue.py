"""Fixture-grounded authoring catalogue for H617A type04 effects."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from .effect_domain import MAX_MULTI_EFFECTS, MAX_PALETTE_COLOURS, JsonValue

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
        "Chasing",
        8,
        9,
        "diy_type04_flat_len_palette_0x09_3_colours_fam_0x08.bin",
    ),
)


def custom_effect_catalogue_payload() -> dict[str, JsonValue]:
    return {
        "schema_version": 1,
        "sku": "H617A",
        "effects": [effect.to_dict() for effect in H617A_TYPE04_EFFECTS],
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
