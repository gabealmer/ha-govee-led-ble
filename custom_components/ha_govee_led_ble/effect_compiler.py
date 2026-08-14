"""Compile canonical effects into model-specific device operations."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256
from typing import Final

from . import protocol
from .effect_catalogue import (
    H6199_DIY_EFFECTS,
    H6199_PALETTE_DIY_APPLY_CODE,
    H6199_PALETTE_DIY_APPLY_MUSIC_CODE,
)
from .effect_contracts import EFFECT_COMPILER_VERSION
from .effect_domain import (
    BuiltinScene,
    LayeredEffect,
    LayeredScene,
    LibraryItem,
    MultiEffect,
    OpaqueContent,
    PaintedEffect,
    PaletteDiyEffect,
    PaletteScene,
    SingleEffect,
)
from .layered_scene import CatalogueRef
from .layered_scene_decoder import encode_layered_scene
from .palette_scene_decoder import encode_palette_scene
from .scenes import MODEL_SCENES, SceneEntry


class CompatibilityState(StrEnum):
    COMPATIBLE = "compatible"
    INCOMPATIBLE = "incompatible"
    UNKNOWN = "unknown"


class ActivationMode(StrEnum):
    CUSTOM = "custom"
    SCENE = "scene"


class VerificationStrategy(StrEnum):
    ACTIVATION = "activation"
    UNPROVEN_H6199_SLOT = "unproven_h6199_slot"


@dataclass(frozen=True, slots=True)
class CompatibilityResult:
    state: CompatibilityState
    reasons: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class CompiledEffect:
    item_id: str
    revision: int
    model: str
    diy_code: int
    activation_mode: ActivationMode
    expected_effect: str | None
    upload_packets: tuple[bytes, ...]
    activation_packet: bytes
    artifact_sha256: str
    verification_strategy: VerificationStrategy = VerificationStrategy.ACTIVATION
    evidence_codes: tuple[str, ...] = ()
    compiler_version: int = EFFECT_COMPILER_VERSION

    @property
    def packets(self) -> tuple[bytes, ...]:
        return (*self.upload_packets, self.activation_packet)


_ADVANCED_CARRIER_IDENTITIES: Final = {
    "H617A": (1013, 11836),
    "H6199": (29884, 41599),
}


def compatibility(item: LibraryItem, model: str) -> CompatibilityResult:
    content = item.content
    if isinstance(content, OpaqueContent):
        return CompatibilityResult(
            CompatibilityState.UNKNOWN,
            (f"content kind {content.kind!r} is not understood",),
        )
    if isinstance(content, BuiltinScene):
        return CompatibilityResult(
            CompatibilityState.INCOMPATIBLE,
            ("native catalogue scenes must use direct scene selection",),
        )
    if isinstance(content, PaletteDiyEffect):
        if model != "H6199":
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                (f"H6199 palette DIY definitions are not supported on {model}",),
            )
        if content.model != model:
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                (f"palette DIY targets {content.model}, not {model}",),
            )
        supported = {(effect.family, effect.variant) for effect in H6199_DIY_EFFECTS}
        if (content.family, content.variant) not in supported:
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                (
                    f"H6199 palette DIY family {content.family} variation "
                    f"{content.variant} has no committed capture fixture",
                ),
            )
        return CompatibilityResult(CompatibilityState.COMPATIBLE)
    if isinstance(content, PaintedEffect | SingleEffect | MultiEffect):
        if model == "H617A":
            return CompatibilityResult(CompatibilityState.COMPATIBLE)
        return CompatibilityResult(
            CompatibilityState.INCOMPATIBLE,
            (f"this H617A custom-effect definition is not supported on {model}",),
        )
    if isinstance(content, PaletteScene | LayeredScene):
        if content.template.sku != model:
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                (f"scene targets {content.template.sku}, not {model}",),
            )
        try:
            _resolve_scene(
                model,
                content.template,
                expected_scene_type=1 if isinstance(content, PaletteScene) else 2,
            )
            if isinstance(content, PaletteScene) and content.speed_index is not None:
                raise ValueError("type-1 palette scenes do not expose a documented Speed control")
        except ValueError as error:
            return CompatibilityResult(CompatibilityState.INCOMPATIBLE, (str(error),))
        return CompatibilityResult(CompatibilityState.COMPATIBLE)
    if isinstance(content, LayeredEffect):
        if model in _ADVANCED_CARRIER_IDENTITIES:
            return CompatibilityResult(CompatibilityState.COMPATIBLE)
        return CompatibilityResult(
            CompatibilityState.INCOMPATIBLE,
            (f"{model} layered-scene framing is not supported",),
        )
    return CompatibilityResult(
        CompatibilityState.UNKNOWN,
        ("this content kind has no compiler yet",),
    )


def compile_effect(item: LibraryItem, model: str, *, diy_code: int | None = None) -> CompiledEffect:
    result = compatibility(item, model)
    if result.state is not CompatibilityState.COMPATIBLE:
        raise ValueError("; ".join(result.reasons))
    if isinstance(item.content, PaintedEffect | SingleEffect | MultiEffect):
        if diy_code is None:
            raise ValueError("H617A custom-effect compilation requires a DIY code")
        return compile_h617a(item, diy_code)
    if isinstance(item.content, PaletteDiyEffect):
        return compile_h6199(
            item,
            H6199_PALETTE_DIY_APPLY_CODE if diy_code is None else diy_code,
        )
    if isinstance(item.content, PaletteScene | LayeredScene | LayeredEffect):
        return compile_scene_effect(item, model)
    raise ValueError("unsupported effect content")


def compile_scene_effect(item: LibraryItem, model: str) -> CompiledEffect:
    result = compatibility(item, model)
    if result.state is not CompatibilityState.COMPATIBLE:
        raise ValueError("; ".join(result.reasons))

    content = item.content
    evidence_codes = ["scene_payload_readback_unavailable"]
    if isinstance(content, PaletteScene):
        scene_key, entry = _resolve_scene(model, content.template, expected_scene_type=1)
        if content.speed_index is not None:
            raise ValueError("type-1 palette scenes do not expose a documented Speed control")
        scene_type = 1
        payload = encode_palette_scene(content)
    elif isinstance(content, LayeredScene):
        scene_key, entry = _resolve_scene(model, content.template, expected_scene_type=2)
        scene_type = 2
        payload = _apply_speed(encode_layered_scene(content), entry, content.speed_index)
        evidence_codes.append("layered_field_semantics_uncalibrated")
    elif isinstance(content, LayeredEffect):
        scene_key, entry = _advanced_carrier(model)
        scene_type = 2
        payload = encode_layered_scene(
            LayeredScene(
                template=CatalogueRef(model, entry.scene_id, entry.effect_id),
                effect=content,
            )
        )
        evidence_codes.extend(
            (
                "layered_field_semantics_uncalibrated",
                "layered_activation_carrier_uncalibrated",
            )
        )
    else:
        raise ValueError("unsupported scene effect content")

    upload = tuple(protocol.build_a3_multi(scene_type, payload))
    activation = _scene_activation(model, entry)
    digest = sha256(b"".join((*upload, activation))).hexdigest()
    return CompiledEffect(
        item_id=str(item.id),
        revision=item.revision,
        model=model,
        diy_code=entry.code,
        activation_mode=ActivationMode.SCENE,
        expected_effect=scene_key,
        upload_packets=upload,
        activation_packet=activation,
        artifact_sha256=digest,
        evidence_codes=tuple(evidence_codes),
    )


def compile_h617a(item: LibraryItem, diy_code: int) -> CompiledEffect:
    result = compatibility(item, "H617A")
    if result.state is not CompatibilityState.COMPATIBLE:
        raise ValueError("; ".join(result.reasons))

    content = item.content
    if isinstance(content, PaintedEffect):
        upload = protocol.build_h617a_diy_painted(
            content.effect,
            content.speed,
            content.brightness,
            content.background,
            tuple(protocol.DiyPaintGroup(group.fill, group.segments) for group in content.groups),
        )
    elif isinstance(content, SingleEffect):
        upload = protocol.build_h617a_diy_single(
            content.family,
            content.variant,
            content.speed,
            content.palette,
        )
    elif isinstance(content, MultiEffect):
        upload = protocol.build_h617a_diy_multi(
            tuple((effect.family, effect.variant) for effect in content.effects),
            content.speed,
            content.palette,
        )
    else:
        raise ValueError("unsupported H617A effect content")

    activation = protocol.build_h617a_diy_activation(diy_code)
    digest = sha256(b"".join((*upload, activation))).hexdigest()
    return CompiledEffect(
        item_id=str(item.id),
        revision=item.revision,
        model="H617A",
        diy_code=diy_code,
        activation_mode=ActivationMode.CUSTOM,
        expected_effect=None,
        upload_packets=tuple(upload),
        activation_packet=activation,
        artifact_sha256=digest,
    )


def compile_h6199(
    item: LibraryItem,
    diy_code: int = H6199_PALETTE_DIY_APPLY_CODE,
) -> CompiledEffect:
    result = compatibility(item, "H6199")
    if result.state is not CompatibilityState.COMPATIBLE:
        raise ValueError("; ".join(result.reasons))
    if diy_code != H6199_PALETTE_DIY_APPLY_CODE:
        raise ValueError(f"H6199 palette DIY activation is only evidenced for slot {H6199_PALETTE_DIY_APPLY_CODE}")

    content = item.content
    if not isinstance(content, PaletteDiyEffect):
        raise ValueError("unsupported H6199 palette DIY content")
    upload = protocol.build_h6199_palette_diy(
        content.family,
        content.variant,
        content.speed,
        content.palette,
    )
    activation = protocol.build_h6199_palette_diy_activation(
        H6199_PALETTE_DIY_APPLY_CODE,
        H6199_PALETTE_DIY_APPLY_MUSIC_CODE,
    )
    digest = sha256(b"".join((*upload, activation))).hexdigest()
    return CompiledEffect(
        item_id=str(item.id),
        revision=item.revision,
        model="H6199",
        diy_code=H6199_PALETTE_DIY_APPLY_CODE,
        activation_mode=ActivationMode.CUSTOM,
        expected_effect=None,
        upload_packets=tuple(upload),
        activation_packet=activation,
        artifact_sha256=digest,
        verification_strategy=VerificationStrategy.UNPROVEN_H6199_SLOT,
    )


def _resolve_scene(
    model: str,
    template: CatalogueRef,
    *,
    expected_scene_type: int | None = None,
) -> tuple[str, SceneEntry]:
    if template.catalogue_schema_version != 1:
        raise ValueError(f"catalogue schema version {template.catalogue_schema_version} is not supported")
    scenes = MODEL_SCENES.get(model)
    if scenes is None:
        raise ValueError(f"{model} has no scene catalogue")
    for key, entry in scenes.items():
        if entry.scene_id == template.scene_id and entry.effect_id == template.effect_id:
            if expected_scene_type is not None and entry.scene_type != expected_scene_type:
                raise ValueError(
                    f"{model} scene identity ({template.scene_id}, {template.effect_id}) "
                    f"uses type {entry.scene_type}, not type {expected_scene_type}"
                )
            return key, entry
    raise ValueError(f"{model} scene identity ({template.scene_id}, {template.effect_id}) was not found")


def _advanced_carrier(model: str) -> tuple[str, SceneEntry]:
    try:
        scene_id, effect_id = _ADVANCED_CARRIER_IDENTITIES[model]
    except KeyError as error:
        raise ValueError(f"{model} layered-scene framing is not supported") from error
    return _resolve_scene(
        model,
        CatalogueRef(model, scene_id, effect_id),
        expected_scene_type=2,
    )


def _apply_speed(payload: bytes, entry: SceneEntry, speed_index: int | None) -> bytes:
    if entry.speed is None:
        if speed_index is not None:
            raise ValueError("this scene does not expose a documented Speed control")
        return payload
    resolved = entry.speed.default_index if speed_index is None else speed_index
    if not 0 <= resolved < entry.speed.option_count:
        raise ValueError(f"scene speed index {resolved} outside 0..{entry.speed.option_count - 1}")
    return protocol.apply_scene_speed(payload, entry.speed, resolved)


def _scene_activation(model: str, entry: SceneEntry) -> bytes:
    if model == "H6199":
        return protocol.build_h6199_scene(entry.code, entry.music_code)[0]
    return protocol.build_scene(entry.code)
