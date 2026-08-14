"""Generate production contracts for the frontend development harness."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from custom_components.ha_govee_led_ble.const import MODEL_PROFILES
from custom_components.ha_govee_led_ble.effect_catalogue import custom_effect_catalogue_payload
from custom_components.ha_govee_led_ble.effect_contracts import device_effect_capabilities
from custom_components.ha_govee_led_ble.effect_scenes import scene_catalogue_payload, scene_detail_payload
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = REPO_ROOT / "frontend" / "tests" / "harness" / "production-data.json"
MODELS = ("H617A", "H6199")


def rendered_data() -> str:
    scene_details = {
        model: {
            f"{entry.scene_id}:{entry.effect_id}": scene_detail_payload(model, entry.scene_id, entry.effect_id)
            for entry in SCENE_ENTRIES[model]
        }
        for model in MODELS
    }
    document = {
        "schema_version": 1,
        "devices": [
            device_effect_capabilities(
                f"{model.lower()}-main",
                model,
                MODEL_PROFILES[model].name,
                MODEL_PROFILES[model].segment_count,
            ).to_dict()
            for model in MODELS
        ],
        "custom_catalogue": custom_effect_catalogue_payload(),
        "scene_catalogues": {model: scene_catalogue_payload(model, enabled=True) for model in MODELS},
        "scene_details": scene_details,
    }
    return f"{json.dumps(document, ensure_ascii=False, indent=2, sort_keys=True)}\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    rendered = rendered_data()
    if args.check:
        return 0 if OUTPUT_PATH.read_text(encoding="utf-8") == rendered else 1
    OUTPUT_PATH.write_text(rendered, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
