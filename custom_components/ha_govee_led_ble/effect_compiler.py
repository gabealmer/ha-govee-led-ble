"""Compile canonical custom effects into model-specific device operations."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from hashlib import sha256

from . import protocol
from .effect_contracts import EFFECT_COMPILER_VERSION
from .effect_domain import (
    LibraryItem,
    MultiEffect,
    OpaqueContent,
    PaintedEffect,
    SingleEffect,
)


class CompatibilityState(StrEnum):
    COMPATIBLE = "compatible"
    INCOMPATIBLE = "incompatible"
    UNKNOWN = "unknown"


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
