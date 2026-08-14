"""Generate the animation-capture campaign manifests."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from custom_components.ha_govee_led_ble.const import MUSIC_MODE_SLUGS
from custom_components.ha_govee_led_ble.coordinator_modes import MUSIC_STYLE_SLUGS
from custom_components.ha_govee_led_ble.effect_catalogue import H617A_TYPE04_EFFECTS

ROOT = Path(__file__).resolve().parent
MANIFEST_DIR = ROOT / "manifests"
VIEWER_URL = "https://vdo.ninja/?view=7MdKzqF"
RGB_PALETTE = [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
REVERSED_PALETTE = list(reversed(RGB_PALETTE))
SINGLE_COLOUR_PALETTE = [[255, 0, 0]]
BLACK_SENTINEL_PALETTE = [[255, 0, 0], [0, 0, 0], [0, 0, 255]]
DEFAULT_SPEED = 50
SPEED_STEP = 10
MUSIC_STIMULUS_NOTES = (
    "Play music-v1.wav through the fixed external speaker at the marked volume and position.  "
    "The 20-second sequence is 2 s silence, 4 s 440 Hz tone, 8 s of 120 BPM deterministic noise bursts, "
    "4 s stepped tones at 100/400/1600/6400 Hz, then 2 s silence."
)


def _speed_policy(applied: int = DEFAULT_SPEED, *, offset_steps: int = 0) -> dict[str, Any]:
    return {
        "kind": "relative_step",
        "default": DEFAULT_SPEED,
        "step": SPEED_STEP,
        "offset_steps": offset_steps,
        "applied": applied,
    }


def _target(
    target_id: str,
    batch: str,
    driver: str,
    family: str,
    model: str,
    *,
    duration: float,
    brightness: int,
    parameters: dict[str, Any],
    palette: list[list[int]] | None = None,
    speed_policy: dict[str, Any] | None = None,
    audio: bool = False,
    direct: dict[str, Any] | None = None,
    operator_steps: list[str] | None = None,
) -> dict[str, Any]:
    target: dict[str, Any] = {
        "id": target_id,
        "batch": batch,
        "driver": driver,
        "family": family,
        "model": model,
        "duration_seconds": duration,
        "brightness_percent": brightness,
        "parameters": parameters,
        "palette": palette or [],
        "speed_policy": speed_policy or {"kind": "not_applicable"},
        "audio": {
            "retain_in_reduced": audio,
            "stimulus_notes": MUSIC_STIMULUS_NOTES if audio else None,
        },
    }
    if direct is not None:
        target["direct"] = direct
    if operator_steps is not None:
        target["operator_steps"] = operator_steps
    return target


def calibration_targets() -> list[dict[str, Any]]:
    states: tuple[tuple[str, str, list[list[int]]], ...] = (
        ("black", "black", []),
        ("first-red", "first_segment_red", [[255, 0, 0]]),
        ("last-blue", "last_segment_blue", [[0, 0, 255]]),
        ("all-white", "all_segments_white", [[255, 255, 255]]),
    )
    return [
        _target(
            f"calibration-{name}",
            "calibration",
            "direct",
            "calibration-static",
            "H617A",
            duration=10,
            brightness=30,
            parameters={"state": state},
            palette=palette,
            direct={"kind": "calibration", "send_gap_seconds": 0.25},
        )
        for name, state, palette in states
    ]


def pilot_targets() -> list[dict[str, Any]]:
    speed = DEFAULT_SPEED - SPEED_STEP
    return [
        _target(
            "pilot-single-chasing-rgb-step-below-default",
            "pilot",
            "direct",
            "type04-single",
            "H617A",
            duration=20,
            brightness=30,
            parameters={"effect": "chasing", "family": 8, "variant": 9, "speed": speed},
            palette=RGB_PALETTE,
            speed_policy=_speed_policy(speed, offset_steps=-1),
            direct={"kind": "type04_single", "activation_code": 24, "send_gap_seconds": 0.25},
        )
    ]


def type04_single_targets() -> list[dict[str, Any]]:
    return [
        _target(
            f"type04-single-{effect.id}-default-rgb",
            "type04-single",
            "direct",
            "type04-single",
            "H617A",
            duration=15,
            brightness=30,
            parameters={
                "effect": effect.id,
                "family": effect.family,
                "variant": effect.variant,
                "speed": DEFAULT_SPEED,
            },
            palette=RGB_PALETTE,
            speed_policy=_speed_policy(),
            direct={"kind": "type04_single", "activation_code": 24, "send_gap_seconds": 0.25},
        )
        for effect in H617A_TYPE04_EFFECTS
    ]


def type04_single_colour_targets() -> list[dict[str, Any]]:
    variants = (
        ("reversed", REVERSED_PALETTE),
        ("single-red", SINGLE_COLOUR_PALETTE),
        ("black-sentinel", BLACK_SENTINEL_PALETTE),
    )
    return [
        _target(
            f"type04-single-{effect.id}-{variant}",
            "type04-single-colours",
            "direct",
            "type04-single",
            "H617A",
            duration=20,
            brightness=30,
            parameters={
                "effect": effect.id,
                "family": effect.family,
                "variant": effect.variant,
                "speed": DEFAULT_SPEED,
                "palette_variant": variant,
            },
            palette=palette,
            speed_policy=_speed_policy(),
            direct={"kind": "type04_single", "activation_code": 24, "send_gap_seconds": 0.25},
        )
        for effect in H617A_TYPE04_EFFECTS
        for variant, palette in variants
    ]


def type04_multi_targets() -> list[dict[str, Any]]:
    effects = [{"effect": item.id, "family": item.family, "variant": item.variant} for item in H617A_TYPE04_EFFECTS]
    return [
        _target(
            f"type04-multi-{count}-effect-default-rgb",
            "type04-multi",
            "direct",
            "type04-multi",
            "H617A",
            duration=20,
            brightness=30,
            parameters={"effects": effects[:count], "speed": DEFAULT_SPEED},
            palette=RGB_PALETTE,
            speed_policy=_speed_policy(),
            direct={"kind": "type04_multi", "activation_code": 24, "send_gap_seconds": 0.25},
        )
        for count in range(1, len(effects) + 1)
    ]


def special_diy_targets() -> list[dict[str, Any]]:
    templates = ("fade", "jumping", "chasing", "marquee", "crossing", "rainbow", "twinkle")
    return [
        _target(
            f"special-diy-{template}-baseline",
            "special-diy",
            "vendor_app",
            "special-diy",
            "H6199",
            duration=20,
            brightness=30,
            parameters={"template": template, "variation": "app_default"},
            palette=RGB_PALETTE,
            speed_policy={"kind": "app_default"},
            operator_steps=[
                "Open DIY, select the named Special Effects template and leave every control at the app default.",
                "Set the palette to red, green and blue where the template exposes colours.",
                "Stop before Apply, return to the terminal, then follow the Apply prompt.",
            ],
        )
        for template in templates
    ]


def workshop_targets() -> list[dict[str, Any]]:
    primitives = (
        "movement-baseline",
        "selected-area-movement-direction",
        "overall-movement-direction",
        "two-colour-continuous-selection",
        "three-colour-palette",
        "brightness-scope",
        "two-layer-priority",
        "distribution-direction",
        "matrix-customise",
        "five-layer-applied-area",
    )
    return [
        _target(
            (f"workshop-{primitive}-baseline" if model == "H617A" else f"workshop-h6199-{primitive}-baseline"),
            "advanced-workshop",
            "vendor_app",
            "workshop-primitive",
            model,
            duration=20,
            brightness=30,
            parameters={"primitive": primitive, "variation": "app_default_baseline"},
            palette=RGB_PALETTE,
            speed_policy={"kind": "app_default"},
            operator_steps=[
                "Open Workshop and build only the named primitive using the app defaults.",
                "Use red, green and blue for exposed palette controls and avoid unrelated controls.",
                "Stop before Apply, return to the terminal, then follow the Apply prompt.",
            ],
        )
        for model in ("H617A", "H6199")
        for primitive in primitives
    ]


def native_gap_targets() -> list[dict[str, Any]]:
    return [
        _target(
            f"native-gap-{str(gap).replace('.', 'p')}-seconds",
            "native-gaps",
            "direct",
            "native-gap",
            "H617A",
            duration=12,
            brightness=30,
            parameters={"effect": "chasing", "family": 8, "variant": 9, "speed": DEFAULT_SPEED, "gap_seconds": gap},
            palette=RGB_PALETTE,
            speed_policy=_speed_policy(),
            direct={"kind": "type04_single", "activation_code": 24, "send_gap_seconds": gap},
        )
        for gap in (0.0, 0.05, 0.1, 0.25, 0.5)
    ]


def music_targets() -> list[dict[str, Any]]:
    targets: list[dict[str, Any]] = []
    for slug, mode_id in MUSIC_MODE_SLUGS.items():
        styles = ("dynamic", "calm") if slug in MUSIC_STYLE_SLUGS else ("default",)
        for style in styles:
            target_slug = slug.replace("_", "-")
            targets.append(
                _target(
                    f"music-{target_slug}-{style}",
                    "music",
                    "direct",
                    "music",
                    "H617A",
                    duration=20,
                    brightness=30,
                    parameters={
                        "mode": slug,
                        "mode_id": mode_id,
                        "style": style,
                        "sensitivity": 99,
                        "manual_colour": None,
                    },
                    speed_policy={"kind": "not_applicable"},
                    audio=True,
                    direct={"kind": "music", "send_gap_seconds": 0.25},
                )
            )
    return targets


def manifest(campaign_id: str, targets: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "campaign_id": campaign_id,
        "viewer": {
            "url": VIEWER_URL,
            "session": "govee-camera",
            "expected_width": 1280,
            "expected_height": 720,
            "stable_seconds": 2.0,
            "sample_interval_seconds": 0.5,
            "sample_count": 9,
        },
        "analysis": {
            "fps": 30,
            "crop": {
                "x": 0,
                "y": 0,
                "width": 800,
                "height": 125,
                "calibration_target": "calibration-all-white",
            },
            "container": "webm",
            "video_codec": "vp9-lossless",
            "music_audio_codec": "opus",
        },
        "device_baseline": {
            "direct": {"diy_activation_code": 240, "brightness_percent": 5, "power": False},
            "vendor_app": {"household_light_service": "light.turn_off"},
        },
        "targets": targets,
    }


def generated_manifests() -> dict[str, dict[str, Any]]:
    batches = {
        "calibration": calibration_targets(),
        "pilot": pilot_targets(),
        "type04-single": type04_single_targets(),
        "type04-single-colours": type04_single_colour_targets(),
        "type04-multi": type04_multi_targets(),
        "special-diy": special_diy_targets(),
        "advanced-workshop": workshop_targets(),
        "native-gaps": native_gap_targets(),
        "music": music_targets(),
    }
    generated = {name: manifest(f"animation-{name}-v1", targets) for name, targets in batches.items()}
    campaign_targets = [target for targets in batches.values() for target in targets]
    generated["campaign"] = manifest("animation-campaign-v1", campaign_targets)
    return generated


def main() -> None:
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    for name, data in generated_manifests().items():
        (MANIFEST_DIR / f"{name}.json").write_text(json.dumps(data, indent=2, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
