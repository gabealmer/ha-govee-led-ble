"""Fixture grounding for the H617A type04 authoring catalogue."""

import io
from pathlib import Path

from kaitaistruct import KaitaiStream

from custom_components.ha_govee_led_ble.effect_catalogue import (
    H617A_TYPE04_APPLY_CODE,
    H617A_TYPE04_EFFECTS,
    custom_effect_catalogue_payload,
)
from custom_components.ha_govee_led_ble.generated_protocol.diy_type04 import DiyType04

FIXTURES = Path(__file__).resolve().parents[1] / "tools/ble/kaitai/src"


def test_type04_authoring_options_match_their_committed_fixtures() -> None:
    for effect in H617A_TYPE04_EFFECTS:
        parsed = DiyType04(KaitaiStream(io.BytesIO((FIXTURES / effect.source_fixture).read_bytes())))
        parsed._read()

        assert (effect.family, effect.variant) == (
            parsed.family,
            parsed.body.variant,
        )


def test_type04_catalogue_exposes_domain_limits_and_apply_support() -> None:
    catalogue = custom_effect_catalogue_payload()

    assert H617A_TYPE04_APPLY_CODE == 24
    assert catalogue["limits"] == {
        "palette_min": 1,
        "palette_max": 8,
        "multi_max": 4,
    }
    apply = catalogue["apply"]
    assert isinstance(apply, dict)
    assert apply["single"] == "supported"
    assert apply["multi"] == "supported"
