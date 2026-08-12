"""Lossless decoding for committed palette scene templates."""

from __future__ import annotations

import base64
import binascii
from dataclasses import replace
from typing import Any, cast

import pytest
from kaitaistruct import KaitaiStructError

from custom_components.ha_govee_led_ble.effect_domain import (
    CatalogueRef,
    PaletteScene,
    SceneStep,
    effect_content_from_dict,
    effect_content_to_dict,
)
from custom_components.ha_govee_led_ble.generated_protocol_adapter import (
    _check_tree,
    _write,
    parse_scene_type1_body_param,
)
from custom_components.ha_govee_led_ble.palette_scene_decoder import (
    decode_catalogue_palette_scene,
    decode_palette_scene,
)
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES, SceneEntry


def _reference(entry: SceneEntry) -> CatalogueRef:
    return CatalogueRef("H617A", entry.scene_id, entry.effect_id)


def _colour(colour: Any) -> tuple[int, int, int]:
    return int(colour.r), int(colour.g), int(colour.b)


def test_all_committed_h617a_type_1_scenes_decode_losslessly() -> None:
    entries = [entry for entry in SCENE_ENTRIES["H617A"] if entry.scene_type == 1]

    for entry in entries:
        raw_param = base64.b64decode(entry.param, validate=True)
        parsed = parse_scene_type1_body_param(raw_param)
        envelope = cast(bytes, parsed._io.to_byte_array())
        parameter_start = len(parsed.header.marker) + 2
        decoded = decode_catalogue_palette_scene("H617A", entry)

        assert decoded is not None
        assert decoded.template == _reference(entry)
        assert decoded.layout == int(parsed.layout) == 0
        assert decoded.brightness_flag is bool(parsed.brightness_flag)
        assert decoded.speed_index is None
        assert decoded.steps == tuple(
            SceneStep(
                value=int(step.value),
                colour=_colour(step.colour),
            )
            for step in parsed.steps
        )
        assert decoded.palette == tuple(_colour(colour) for colour in parsed.palette)
        assert envelope[parameter_start : parameter_start + len(raw_param)] == raw_param
        assert not any(envelope[parameter_start + len(raw_param) :])
        _check_tree(parsed)
        assert _write(parsed, len(envelope)) == envelope
        assert effect_content_from_dict(effect_content_to_dict(decoded)) == decoded

    assert len(entries) == 2


def test_layout_1_decoding_is_synthetic_schema_support_without_hardware_evidence() -> None:
    raw_param = bytes.fromhex("93010102033412040506")

    decoded = decode_palette_scene(
        CatalogueRef("SYNTHETIC", 1, 1),
        raw_param,
        speed_index=7,
    )

    assert decoded == PaletteScene(
        template=CatalogueRef("SYNTHETIC", 1, 1),
        layout=1,
        brightness_flag=True,
        steps=(
            SceneStep(
                value=0x1234,
                colour=(1, 2, 3),
                inline_colour=(4, 5, 6),
            ),
        ),
        speed_index=7,
    )
    assert effect_content_from_dict(effect_content_to_dict(decoded)) == decoded


@pytest.mark.parametrize(
    ("raw_param", "expected_steps", "expected_palette"),
    [
        (bytes.fromhex("830000"), 0, 0),
        (
            b"\x83\xff" + bytes.fromhex("0102033412") * 255 + b"\xff" + bytes.fromhex("040506") * 255,
            255,
            255,
        ),
    ],
)
def test_layout_0_preserves_full_u1_count_boundaries(
    raw_param: bytes,
    expected_steps: int,
    expected_palette: int,
) -> None:
    decoded = decode_palette_scene(CatalogueRef("SYNTHETIC", 1, 1), raw_param)

    assert len(decoded.steps) == expected_steps
    assert len(decoded.palette) == expected_palette
    assert effect_content_from_dict(effect_content_to_dict(decoded)) == decoded


@pytest.mark.parametrize("raw_param", [bytearray(b"\x83"), memoryview(b"\x83"), "\x83"])
def test_generated_type_1_parser_requires_bytes(raw_param) -> None:
    with pytest.raises(TypeError, match="must be bytes"):
        parse_scene_type1_body_param(raw_param)


@pytest.mark.parametrize(
    "raw_param",
    [
        b"",
        b"\x83",
        b"\x83\x01\x01",
        b"\x83\x00",
    ],
)
def test_generated_type_1_parser_rejects_truncated_parameters(raw_param: bytes) -> None:
    with pytest.raises(KaitaiStructError):
        parse_scene_type1_body_param(raw_param)


@pytest.mark.parametrize(
    "raw_param",
    [
        b"\x82\x00\x00",
        b"\x83\x00\x00\x01",
    ],
)
def test_generated_type_1_parser_rejects_malformed_parameters(raw_param: bytes) -> None:
    with pytest.raises(KaitaiStructError):
        parse_scene_type1_body_param(raw_param)


def test_catalogue_decoder_rejects_invalid_base64_and_missing_parameters() -> None:
    entry = next(entry for entry in SCENE_ENTRIES["H617A"] if entry.scene_type == 1)

    with pytest.raises(binascii.Error):
        decode_catalogue_palette_scene("H617A", replace(entry, param=f"{entry.param}\n"))
    with pytest.raises(ValueError, match="has no parameter"):
        decode_catalogue_palette_scene("H617A", replace(entry, param=""))
    assert decode_catalogue_palette_scene("H617A", replace(entry, scene_type=0)) is None
