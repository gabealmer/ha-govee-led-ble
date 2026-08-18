"""Effect content and scenario payload builders."""

from __future__ import annotations

from collections.abc import Mapping
from copy import deepcopy
from typing import Any

from .contracts import (
    EXPECTED_MODEL,
    JsonObject,
    ValidationError,
    object_list,
    object_value,
    required_int,
    required_str,
)


def single_content(catalogue: Mapping[str, Any], *, speed: int) -> JsonObject:
    family = object_value(object_list(catalogue.get("effects"), "H617A effect families")[0], "H617A effect family")
    variation = object_value(
        object_list(family.get("variations"), "H617A effect variations")[0], "H617A effect variation"
    )
    return {
        "kind": "h617a_single",
        "family": required_int(family, "family"),
        "variant": required_int(variation, "variant"),
        "speed": speed,
        "palette": [[255, 48, 16], [16, 96, 255]],
    }


def painted_content(catalogue: Mapping[str, Any]) -> JsonObject:
    painted = object_value(object_list(catalogue.get("painted_effects"), "H617A painted effects")[0], "painted effect")
    return {
        "kind": "h617a_painted",
        "effect": required_str(painted, "id"),
        "speed": 55,
        "brightness": 70,
        "background": [0, 0, 0],
        "groups": [
            {"fill": [255, 32, 0], "segments": [0, 1, 2]},
            {"fill": [0, 64, 255], "segments": [3, 4, 5]},
        ],
    }


def multi_content(catalogue: Mapping[str, Any]) -> JsonObject:
    families = [
        family
        for family in object_list(catalogue.get("effects"), "H617A effect families")
        if family.get("supports_multi") is True
    ]
    if len(families) < 2:
        raise ValidationError("H617A catalogue does not expose two Multi-capable families")
    effects = []
    for family in families[:2]:
        variation = object_value(object_list(family.get("variations"), "H617A Multi variations")[0], "Multi variation")
        effects.append(
            {
                "family": required_int(family, "family"),
                "variant": required_int(variation, "variant"),
            }
        )
    return {
        "kind": "h617a_multi",
        "effects": effects,
        "speed": 55,
        "palette": [[255, 0, 64], [0, 192, 255], [255, 192, 0]],
    }


def music_content(catalogue: Mapping[str, Any]) -> JsonObject:
    mode = object_value(object_list(catalogue.get("music_modes"), "H617A music modes")[0], "H617A music mode")
    limits = object_value(catalogue.get("limits"), "H617A catalogue limits")
    minimum = required_int(limits, "music_sensitivity_min")
    maximum = required_int(limits, "music_sensitivity_max")
    return {
        "kind": "music_profile",
        "model": EXPECTED_MODEL,
        "mode": required_str(mode, "id"),
        "sensitivity": (minimum + maximum) // 2,
        "colour": None,
        "calm": None,
        "parameters": {},
    }


def advanced_content(layered_scene: Mapping[str, Any]) -> JsonObject:
    if layered_scene.get("kind") != "scene_layered":
        raise ValidationError("live layered scene detail is not layered content")
    effect = object_value(layered_scene.get("effect"), "live layered scene effect")
    return {"kind": "advanced", **deepcopy(effect)}


def edited_palette_content(content: Mapping[str, Any]) -> JsonObject:
    edited = deepcopy(dict(content))
    if edited.get("kind") != "scene_palette":
        raise ValidationError("live palette scene detail is not palette content")
    palette = edited.get("palette")
    steps = edited.get("steps")
    if not isinstance(steps, list) or not steps:
        raise ValidationError("live palette scene has no editable steps")
    if isinstance(palette, list) and palette:
        old_colour = palette[0]
        new_colour = [32, 220, 96]
        palette[0] = new_colour
        for step in steps:
            if isinstance(step, dict) and step.get("colour") == old_colour:
                step["colour"] = new_colour
    else:
        first_step = object_value(steps[0], "palette scene step")
        first_step["colour"] = [32, 220, 96]
        first_step["inline_colour"] = [32, 220, 96]
    return edited
