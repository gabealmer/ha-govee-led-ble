"""Native scene catalogue contracts for the advanced editor."""

from __future__ import annotations

import base64
from dataclasses import dataclass
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import EFFECT_FAMILY_SCENES
from .effect_domain import (
    BuiltinScene,
    CatalogueRef,
    EffectContent,
    JsonValue,
    effect_content_to_dict,
)
from .effect_scene_defaults import NativeSceneDefault, NativeSceneDefaultRepository
from .layered_scene_decoder import decode_layered_scene
from .native_scenes import apply_scene_speed, resolve_native_scene_body
from .palette_scene_decoder import decode_palette_scene
from .scenes import (
    MODEL_SCENE_LABELS,
    MODEL_SCENES,
    SCENE_ENTRIES,
    SceneEntry,
)

CATALOGUE_SCHEMA_VERSION = 1


class SceneUnavailableError(ValueError):
    """Raised when a valid native scene cannot be used by the target entry."""


@dataclass(frozen=True, slots=True)
class ResolvedScene:
    key: str
    label: str
    entry: SceneEntry


def scene_catalogue_payload(model: str, *, enabled: bool) -> dict[str, JsonValue]:
    entries = SCENE_ENTRIES.get(model)
    if entries is None:
        raise ValueError(f"{model} has no native scene catalogue")
    categories: list[JsonValue] = []
    seen_categories: set[int] = set()
    for entry in entries:
        if entry.category_id not in seen_categories:
            seen_categories.add(entry.category_id)
            categories.append({"id": entry.category_id, "name": entry.category})
    return {
        "schema_version": CATALOGUE_SCHEMA_VERSION,
        "sku": model,
        "enabled": enabled,
        "categories": categories,
        "scenes": [_scene_summary(model, entry) for entry in entries],
    }


def scene_detail_payload(
    model: str,
    scene_id: int,
    effect_id: int,
    *,
    scene_default: NativeSceneDefault | None = None,
) -> dict[str, JsonValue]:
    resolved = resolve_scene(model, scene_id, effect_id)
    if scene_default is not None and resolved.entry.scene_type == 0:
        scene_default = None
    speed_index = (
        scene_default.speed_index
        if scene_default is not None
        else resolved.entry.speed.default_index
        if resolved.entry.speed is not None
        else None
    )
    template = CatalogueRef(
        sku=model,
        scene_id=scene_id,
        effect_id=effect_id,
        catalogue_schema_version=CATALOGUE_SCHEMA_VERSION,
    )
    content: EffectContent
    if resolved.entry.scene_type == 1 and resolved.entry.param:
        content = decode_palette_scene(
            template,
            (
                scene_default.canonical_body
                if scene_default is not None
                else base64.b64decode(resolved.entry.param, validate=True)
            ),
            speed_index=speed_index,
        )
    elif resolved.entry.scene_type == 2 and resolved.entry.param:
        content = decode_layered_scene(
            template,
            (
                scene_default.canonical_body
                if scene_default is not None
                else base64.b64decode(resolved.entry.param, validate=True)
            ),
            speed_index=speed_index,
        )
    else:
        content = BuiltinScene(template, speed_index=speed_index)
    return {
        "scene": _scene_summary(model, resolved.entry),
        "content": effect_content_to_dict(content),
        "has_default": scene_default is not None,
    }


def resolve_scene(model: str, scene_id: int, effect_id: int) -> ResolvedScene:
    scenes = MODEL_SCENES.get(model)
    labels = MODEL_SCENE_LABELS.get(model)
    if scenes is None or labels is None:
        raise ValueError(f"{model} has no native scene catalogue")
    for key, entry in scenes.items():
        if entry.scene_id == scene_id and entry.effect_id == effect_id:
            return ResolvedScene(key, labels[key], entry)
    raise ValueError(f"{model} scene identity ({scene_id}, {effect_id}) was not found")


async def async_apply_scene(
    hass: HomeAssistant,
    config_entry: ConfigEntry[Any],
    *,
    scene_id: int,
    effect_id: int,
    speed_index: int | None,
    user_id: str,
    scene_defaults: NativeSceneDefaultRepository | None = None,
) -> tuple[ResolvedScene, int | None]:
    del hass, user_id
    coordinator = config_entry.runtime_data
    if EFFECT_FAMILY_SCENES not in coordinator.effect_families:
        raise SceneUnavailableError(f"native scenes are not enabled for {coordinator.model}")
    resolved = resolve_scene(coordinator.model, scene_id, effect_id)
    scene_default = scene_defaults.get(config_entry.entry_id, scene_id, effect_id) if scene_defaults else None
    canonical_body, resolved_speed = resolve_scene_application_body(
        resolved.entry,
        scene_default=scene_default,
        speed_index=speed_index,
    )

    await coordinator.async_apply_native_scene(
        resolved.key,
        speed_index=resolved_speed,
        canonical_body=canonical_body or None,
    )
    return resolved, resolved_speed


async def async_reset_scene_default(
    config_entry: ConfigEntry[Any],
    *,
    scene_id: int,
    effect_id: int,
    scene_defaults: NativeSceneDefaultRepository,
) -> ResolvedScene:
    coordinator = config_entry.runtime_data
    if EFFECT_FAMILY_SCENES not in coordinator.effect_families:
        raise SceneUnavailableError(f"native scenes are not enabled for {coordinator.model}")
    resolved = resolve_scene(coordinator.model, scene_id, effect_id)
    canonical_body, resolved_speed = resolve_native_scene_body(resolved.entry)
    await coordinator.async_apply_native_scene(
        resolved.key,
        speed_index=resolved_speed,
        canonical_body=canonical_body or None,
    )
    await scene_defaults.async_delete(config_entry.entry_id, scene_id, effect_id)
    return resolved


def resolve_scene_application_body(
    scene: SceneEntry,
    *,
    scene_default: NativeSceneDefault | None,
    speed_index: int | None,
) -> tuple[bytes, int | None]:
    if scene_default is None:
        return resolve_native_scene_body(scene, speed_index=speed_index)
    speed = scene.speed
    if speed is None:
        if speed_index is not None:
            raise ValueError("this scene does not expose a documented Speed control")
        return scene_default.canonical_body, None
    resolved_speed = scene_default.speed_index if speed_index is None else speed_index
    if resolved_speed is None:
        resolved_speed = speed.default_index
    if not 0 <= resolved_speed < speed.option_count:
        raise ValueError(f"scene speed index {resolved_speed} outside 0..{speed.option_count - 1}")
    body = scene_default.canonical_body
    if speed_index is not None and speed_index != scene_default.speed_index:
        body = apply_scene_speed(body, speed, speed_index)
    return body, resolved_speed


def _scene_summary(model: str, entry: SceneEntry) -> dict[str, JsonValue]:
    resolved = resolve_scene(model, entry.scene_id, entry.effect_id)
    parameter_kind = (
        "none"
        if not entry.param
        else "palette"
        if entry.scene_type == 1
        else "layers"
        if entry.scene_type == 2
        else "opaque"
    )
    return {
        "scene_id": entry.scene_id,
        "effect_id": entry.effect_id,
        "category_id": entry.category_id,
        "category": entry.category,
        "name": entry.name,
        "variant": entry.variant,
        "display_name": resolved.label,
        "scene_type": entry.scene_type,
        "parameter_kind": parameter_kind,
        "speed": (
            {
                "option_count": entry.speed.option_count,
                "default_index": entry.speed.default_index,
            }
            if entry.speed is not None
            else None
        ),
    }
