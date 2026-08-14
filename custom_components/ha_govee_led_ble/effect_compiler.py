"""Compile canonical custom effects into model-specific device operations."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256

from . import protocol
from .effect_catalogue import (
    H6199_DIY_EFFECTS,
    H6199_PALETTE_DIY_APPLY_CODE,
    H6199_PALETTE_DIY_APPLY_MUSIC_CODE,
)
from .effect_contracts import EFFECT_COMPILER_VERSION
from .effect_domain import (
    LibraryItem,
    MultiEffect,
    OpaqueContent,
    PaintedEffect,
    PaletteDiyEffect,
    SingleEffect,
)


class CompatibilityState(StrEnum):
    COMPATIBLE = "compatible"
    INCOMPATIBLE = "incompatible"
    UNKNOWN = "unknown"


class VerificationStrategy(StrEnum):
    DIY_CODE = "diy_code"
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
    upload_packets: tuple[bytes, ...]
    activation_packet: bytes
    artifact_sha256: str
    verification_strategy: VerificationStrategy = VerificationStrategy.DIY_CODE
    compiler_version: int = EFFECT_COMPILER_VERSION

    @property
    def packets(self) -> tuple[bytes, ...]:
        return (*self.upload_packets, self.activation_packet)


def compatibility(item: LibraryItem, model: str) -> CompatibilityResult:
    if isinstance(item.content, OpaqueContent):
        return CompatibilityResult(
            CompatibilityState.UNKNOWN,
            (f"content kind {item.content.kind!r} is not understood",),
        )
    if model == "H6199":
        if not isinstance(item.content, PaletteDiyEffect):
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                ("this content kind is not supported by the H6199 palette-DIY compiler",),
            )
        if item.content.model != model:
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                (f"palette DIY targets {item.content.model}, not {model}",),
            )
        supported = {(effect.family, effect.variant) for effect in H6199_DIY_EFFECTS}
        if (item.content.family, item.content.variant) not in supported:
            return CompatibilityResult(
                CompatibilityState.INCOMPATIBLE,
                (
                    f"H6199 palette DIY family {item.content.family} variation "
                    f"{item.content.variant} has no committed capture fixture",
                ),
            )
        return CompatibilityResult(CompatibilityState.COMPATIBLE)
    if model != "H617A":
        return CompatibilityResult(
            CompatibilityState.INCOMPATIBLE,
            (f"{model} custom-effect upload is not supported",),
        )
    if not isinstance(item.content, PaintedEffect | SingleEffect | MultiEffect):
        return CompatibilityResult(
            CompatibilityState.UNKNOWN,
            ("this content kind has no H617A compiler yet",),
        )
    return CompatibilityResult(CompatibilityState.COMPATIBLE)


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
        upload_packets=tuple(upload),
        activation_packet=activation,
        artifact_sha256=digest,
        verification_strategy=VerificationStrategy.UNPROVEN_H6199_SLOT,
    )


def compile_effect(item: LibraryItem, model: str, diy_code: int) -> CompiledEffect:
    if model == "H617A":
        return compile_h617a(item, diy_code)
    if model == "H6199":
        return compile_h6199(item, diy_code)
    raise ValueError(f"{model} custom-effect upload is not supported")
