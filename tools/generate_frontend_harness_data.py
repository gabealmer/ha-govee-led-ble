"""Generate production H617A catalogues for the frontend development harness."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from custom_components.ha_govee_led_ble.effect_catalogue import custom_effect_catalogue_payload
from custom_components.ha_govee_led_ble.effect_scenes import scene_catalogue_payload, scene_detail_payload
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = REPO_ROOT / "frontend" / "tests" / "harness" / "h617a-data.json"


def rendered_data() -> str:
    details = {
        f"{entry.scene_id}:{entry.effect_id}": scene_detail_payload("H617A", entry.scene_id, entry.effect_id)
        for entry in SCENE_ENTRIES["H617A"]
    }
    document = {
        "schema_version": 1,
        "custom_catalogue": custom_effect_catalogue_payload(),
        "scene_catalogue": scene_catalogue_payload("H617A", enabled=True),
        "scene_details": details,
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
