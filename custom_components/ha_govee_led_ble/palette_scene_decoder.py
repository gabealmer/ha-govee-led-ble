"""Decode catalogue palette scenes into canonical, non-compilable values."""

from __future__ import annotations

import base64
from typing import Any

from .effect_domain import CatalogueRef, PaletteScene, SceneStep
from .generated_protocol_adapter import parse_scene_type1_body_param
from .scenes import SceneEntry

__all__ = ["decode_catalogue_palette_scene", "decode_palette_scene"]


def decode_palette_scene(
    template: CatalogueRef,
    raw_param: bytes,
    *,
    speed_index: int | None = None,
) -> PaletteScene:
    """Decode a type-1 parameter without adding an application or compilation path."""
    parsed = parse_scene_type1_body_param(raw_param)
    layout = int(parsed.layout)
    return PaletteScene(
        template=template,
        layout=layout,
        brightness_flag=bool(parsed.brightness_flag),
        steps=tuple(_decode_step(step, layout) for step in parsed.steps),
        palette=(tuple(_decode_colour(colour) for colour in parsed.palette) if layout == 0 else ()),
        speed_index=speed_index,
    )


def decode_catalogue_palette_scene(sku: str, entry: SceneEntry) -> PaletteScene | None:
    """Decode one type-1 catalogue entry, returning None for other scene grammars."""
    if entry.scene_type != 1:
        return None
    if not entry.param:
        raise ValueError("type-1 catalogue scene has no parameter")
    return decode_palette_scene(
        CatalogueRef(sku=sku, scene_id=entry.scene_id, effect_id=entry.effect_id),
        base64.b64decode(entry.param, validate=True),
        speed_index=entry.speed.default_index if entry.speed is not None else None,
    )


def _decode_step(step: Any, layout: int) -> SceneStep:
    if layout == 0:
        return SceneStep(
            value=int(step.value),
            colour=_decode_colour(step.colour),
        )
    return SceneStep(
        value=int(step.param.value),
        colour=_decode_colour(step.param.colour),
        inline_colour=_decode_colour(step.colour),
    )


def _decode_colour(colour: Any) -> tuple[int, int, int]:
    return int(colour.r), int(colour.g), int(colour.b)
