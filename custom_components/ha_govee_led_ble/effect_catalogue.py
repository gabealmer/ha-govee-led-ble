"""Versioned Effect Studio catalogue contracts."""

from __future__ import annotations

import base64
import io
from dataclasses import dataclass
from typing import Final

from kaitaistruct import KaitaiStream

from .const import MODEL_PROFILES, MUSIC_MODE_SLUGS
from .effect_contracts import (
    CapabilityState,
    CapabilityWorkflow,
    frontend_release_capabilities,
    studio_apply_capability_state,
    workflow_capability_state,
)
from .effect_domain import (
    MAX_MULTI_EFFECTS,
    MAX_PALETTE_COLOURS,
    JsonValue,
    SpecialDiyEffect,
    WorkshopEffect,
    effect_content_to_dict,
)
from .generated_protocol.diy_type03 import DiyType03  # type: ignore[attr-defined]
from .generated_protocol.h6199_effect_upload import H6199EffectUpload  # type: ignore[attr-defined]
from .layered_scene_decoder import decode_workshop_effect

EFFECT_STUDIO_CATALOGUE_SCHEMA_VERSION: Final = 6
LEGACY_CATALOGUE_SKU: Final = "H617A"

# H617A Type04 uploads are selected with DIY code 24.
H617A_TYPE04_APPLY_CODE: Final = 24


@dataclass(frozen=True, slots=True)
class DiyEffectTemplate:
    id: str
    label: str
    family: int
    variant: int

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
    category: str = "single_layer"

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
            "family": self.family,
            "variations": [variation.to_dict() for variation in self.variations],
            "supports_multi": self.supports_multi,
            "rate": self.rate,
            "category": self.category,
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
class WorkshopTemplate:
    id: str
    label: str
    raw_param_b64: str

    def content(self, model: str) -> WorkshopEffect:
        raw_param = base64.b64decode(self.raw_param_b64, validate=True)
        effect, trailing_padding = decode_workshop_effect(model, raw_param)
        return WorkshopEffect(
            model=model,
            template=self.id,
            effect=effect,
            raw_param=raw_param,
            trailing_padding=trailing_padding,
        )

    def to_dict(self, model: str) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
            "content": effect_content_to_dict(self.content(model)),
        }


@dataclass(frozen=True, slots=True)
class SpecialDiyTemplate:
    id: str
    label: str
    source_body_b64: str

    def content(self) -> SpecialDiyEffect:
        source_body = base64.b64decode(self.source_body_b64, validate=True)
        parsed = H6199EffectUpload(KaitaiStream(io.BytesIO(source_body)))
        parsed._read()
        if parsed.kind != H6199EffectUpload.BodyKind.diy:
            raise ValueError(f"{self.id} is not a Special DIY body")
        return SpecialDiyEffect(
            model="H6199",
            template=self.id,
            family=int(parsed.content.family),
            variant=int(parsed.content.variant),
            speed=int(parsed.content.speed),
            palette=tuple((int(colour.red), int(colour.green), int(colour.blue)) for colour in parsed.content.palette),
            raw_payload=source_body,
            trailing_padding=len(parsed.content.padding),
        )

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "id": self.id,
            "label": self.label,
            "content": effect_content_to_dict(self.content()),
        }


@dataclass(frozen=True, slots=True)
class CatalogueSupport:
    multi: CapabilityState
    advanced: CapabilityState
    workshop: CapabilityState
    special_diy: CapabilityState

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "multi": self.multi.value,
            "advanced": self.advanced.value,
            "workshop": self.workshop.value,
            "special_diy": self.special_diy.value,
        }


@dataclass(frozen=True, slots=True)
class ApplySupport:
    painted: CapabilityState
    single: CapabilityState
    multi: CapabilityState
    palette_diy: CapabilityState
    workshop: CapabilityState
    special_diy: CapabilityState

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "painted": self.painted.value,
            "single": self.single.value,
            "multi": self.multi.value,
            "palette_diy": self.palette_diy.value,
            "workshop": self.workshop.value,
            "special_diy": self.special_diy.value,
        }


@dataclass(frozen=True, slots=True)
class ModelEffectCatalogue:
    sku: str
    painted_effects: tuple[dict[str, str], ...]
    effects: tuple[DiyEffectFamily, ...]
    music_modes: tuple[NativeModeOption, ...]
    video_modes: tuple[NativeModeOption, ...]
    workshop_templates: tuple[WorkshopTemplate, ...]
    special_diy_templates: tuple[SpecialDiyTemplate, ...]
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
            "workshop_templates": [template.to_dict(self.sku) for template in self.workshop_templates],
            "special_diy_templates": [template.to_dict() for template in self.special_diy_templates],
            "workflows": frontend_release_capabilities(self.sku),
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


# GoveeHome V7.5.30 exposes these basic Type04 families through
# dreamcolorlightv1.adjust.Diy.e(), with the same base roster retained by later
# revisions.  The family and variation bytes use the structure defined by
# diy_type04.ksy.
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
H617A_WORKSHOP_APPLY_CODE: Final = 401
H617A_WORKSHOP_SCENE_TYPE: Final = 2
H6199_DIY_SOURCE_REFERENCE: Final = "tools/ble/kaitai/h6199_effect_upload.ksy"
H6199_PALETTE_DIY_APPLY_CODE: Final = 401
H6199_PALETTE_DIY_APPLY_MUSIC_CODE: Final = 2
H6199_WORKSHOP_APPLY_CODE: Final = 402
H6199_WORKSHOP_APPLY_MUSIC_CODE: Final = 0

H6199_DIY_EFFECTS: Final = (
    DiyEffectTemplate(
        "fade",
        "Fade",
        0,
        0,
    ),
    DiyEffectTemplate(
        "jumping",
        "Jumping",
        1,
        0,
    ),
    DiyEffectTemplate(
        "twinkle",
        "Twinkle",
        2,
        0,
    ),
    DiyEffectTemplate(
        "marquee",
        "Marquee",
        3,
        3,
    ),
    DiyEffectTemplate(
        "music",
        "Music",
        4,
        8,
    ),
    DiyEffectTemplate(
        "chasing",
        "Chasing",
        8,
        9,
    ),
    DiyEffectTemplate(
        "chasing_counterclockwise",
        "Chasing Counterclockwise",
        8,
        10,
    ),
    DiyEffectTemplate(
        "rainbow",
        "Rainbow",
        9,
        9,
    ),
    DiyEffectTemplate(
        "crossing",
        "Crossing",
        10,
        0,
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

WORKSHOP_TEMPLATES: Final = (
    WorkshopTemplate(
        "movement-baseline",
        "Movement",
        "Ah1AAAACEgH/AACAFBSBsm0CAP8A/wAAFAHvEAG3ARoAAQAPEAH/AACAFBQBgBQBBv8AAACAAACAAAAAAAAAAAA=",
    ),
    WorkshopTemplate(
        "selected-area-movement-direction",
        "Selected-area movement",
        "Ah1AAAACEgH/AACAFBSDsm0CAP8A/wAAFgHvEAG3ARoAAQAPEAH/AACAFBQBgBQBBv8AAACAAACAAAAAAAAAAAA=",
    ),
    WorkshopTemplate(
        "overall-movement-direction",
        "Whole-layer movement",
        "Ah1AAAACEgH/AACAFBSDsm0CAP8A/wAAAAHvEgG3ABoAAQAPEAH/AACAFBQBgBQBBv8AAACAAACAAAAAAAAAAAA=",
    ),
    WorkshopTemplate(
        "two-colour-continuous-selection",
        "Continuous two-colour",
        "AR0AAQAPEAH/AACAFBQBgBQC/wAAAAD/AACAAACAAA==",
    ),
    WorkshopTemplate(
        "three-colour-palette",
        "Three-colour palette",
        "ASAAAQAPEAH/AACAFBQBgBQD/wAAAAD/AP8AAACAAACAAAAAAAAAAAAAAAAAAAAA",
    ),
    WorkshopTemplate(
        "brightness-scope",
        "Brightness range",
        "AR0AAQAPEAHGOQD/yDABfxQC/wAAAAD/AACAAACAAA==",
    ),
    WorkshopTemplate(
        "two-layer-priority",
        "Layer priority",
        "Ah1AAAACEgH/AACAFBSDsm0CAP8A/wAAAAHvEAG3AhoAAQAPEAH/AACAFBQBgBQBBv8AAACAAACAAAAAAAAAAAA=",
    ),
    WorkshopTemplate(
        "distribution-direction",
        "Distribution direction",
        "BRogAQACAAH/AACAFBSAgBQB/wAFAACAAACAABoiAQACAAH/AACAFBQBgBQBAP8EAACAAACAABokAQACAAH/AACAFBQBgBQB/wABAACAAACAABomAQACAAH/AACAFBQBgBQBAP8AAACAAACAABooAQABAAH/AACAFBQBgBQB/wAAAACAAACAAAAAAAAAAAAAAAAAAAAA",
    ),
    WorkshopTemplate(
        "matrix-customise",
        "Custom segments",
        "AR0AAwEAEAH/AACAFBQBgBQC/wAAAAD/AACAAACAAA==",
    ),
    WorkshopTemplate(
        "five-layer-applied-area",
        "Five applied areas",
        "BRogAQACAAH/AACAFBQBgBQB/wAFAACAAACAABoiAQACAAH/AACAFBQBgBQBAP8EAACAAACAABokAQACAAH/AACAFBQBgBQB/wABAACAAACAABomAQACAAH/AACAFBQBgBQBAP8AAACAAACAABooAQABAAH/AACAFBQBgBQB/wAAAACAAACAAAAAAAAAAAAAAAAAAAAA",
    ),
)

H6199_SPECIAL_DIY_TEMPLATES: Final = (
    SpecialDiyTemplate(
        "fade",
        "Fade",
        "AQIEAABcFf8AAP99AP//AAD/AAAA/wD//4sA/wAAAAAAAA==",
    ),
    SpecialDiyTemplate(
        "jumping",
        "Jumping",
        "AQIEAQBcFf8AAP99AP//AAD/AAAA/wD//4sA/wAAAAAAAA==",
    ),
    SpecialDiyTemplate(
        "chasing",
        "Chasing",
        "AQIECAkyFf8AAP99AP//AAD/AAAA/wD//4sA/wAAAAAAAA==",
    ),
    SpecialDiyTemplate(
        "marquee",
        "Marquee",
        "AQIEAwNcFf8AAP99AP//AAD/AAAA/wD//4sA/wAAAAAAAA==",
    ),
    SpecialDiyTemplate(
        "crossing",
        "Crossing",
        "AQIECgBkCf8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAA==",
    ),
    SpecialDiyTemplate(
        "rainbow",
        "Rainbow",
        "AQIECQkyFf8AAP99AP//AAD/AAAA/wD//4sA/wAAAAAAAA==",
    ),
    SpecialDiyTemplate(
        "twinkle",
        "Twinkle",
        "AQIEAgBcFf8AAP99AP//AAD/AAAA/wD//4sA/wAAAAAAAA==",
    ),
)

MODEL_EFFECT_CATALOGUES: Final = {
    "H617A": ModelEffectCatalogue(
        sku="H617A",
        painted_effects=H617A_PAINTED_EFFECTS,
        effects=H617A_TYPE04_FAMILIES,
        music_modes=H617A_NATIVE_MUSIC_MODES,
        video_modes=(),
        workshop_templates=WORKSHOP_TEMPLATES,
        special_diy_templates=(),
        supports=CatalogueSupport(
            multi=workflow_capability_state("H617A", CapabilityWorkflow.MULTI),
            advanced=workflow_capability_state("H617A", CapabilityWorkflow.ADVANCED),
            workshop=workflow_capability_state("H617A", CapabilityWorkflow.WORKSHOP),
            special_diy=workflow_capability_state("H617A", CapabilityWorkflow.SPECIAL_DIY),
        ),
        apply=ApplySupport(
            painted=studio_apply_capability_state("H617A", CapabilityWorkflow.PAINTED),
            single=studio_apply_capability_state("H617A", CapabilityWorkflow.SINGLE),
            multi=studio_apply_capability_state("H617A", CapabilityWorkflow.MULTI),
            palette_diy=studio_apply_capability_state("H617A", CapabilityWorkflow.PALETTE_DIY),
            workshop=studio_apply_capability_state("H617A", CapabilityWorkflow.WORKSHOP),
            special_diy=studio_apply_capability_state("H617A", CapabilityWorkflow.SPECIAL_DIY),
        ),
    ),
    "H6199": ModelEffectCatalogue(
        sku="H6199",
        painted_effects=(),
        effects=H6199_PALETTE_DIY_FAMILIES,
        music_modes=H6199_NATIVE_MUSIC_MODES,
        video_modes=H6199_VIDEO_MODES,
        workshop_templates=WORKSHOP_TEMPLATES,
        special_diy_templates=H6199_SPECIAL_DIY_TEMPLATES,
        supports=CatalogueSupport(
            multi=workflow_capability_state("H6199", CapabilityWorkflow.MULTI),
            advanced=workflow_capability_state("H6199", CapabilityWorkflow.ADVANCED),
            workshop=workflow_capability_state("H6199", CapabilityWorkflow.WORKSHOP),
            special_diy=workflow_capability_state("H6199", CapabilityWorkflow.SPECIAL_DIY),
        ),
        apply=ApplySupport(
            painted=studio_apply_capability_state("H6199", CapabilityWorkflow.PAINTED),
            single=studio_apply_capability_state("H6199", CapabilityWorkflow.SINGLE),
            multi=studio_apply_capability_state("H6199", CapabilityWorkflow.MULTI),
            palette_diy=studio_apply_capability_state("H6199", CapabilityWorkflow.PALETTE_DIY),
            workshop=studio_apply_capability_state("H6199", CapabilityWorkflow.WORKSHOP),
            special_diy=studio_apply_capability_state("H6199", CapabilityWorkflow.SPECIAL_DIY),
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
