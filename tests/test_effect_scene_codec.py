"""Lossless decoding for committed layered scene templates."""

from __future__ import annotations

import base64
from collections import Counter
from typing import Any, cast

import pytest

from custom_components.ha_govee_led_ble.effect_compiler import (
    CompatibilityState,
    compatibility,
    compile_h617a,
)
from custom_components.ha_govee_led_ble.effect_domain import (
    CatalogueRef,
    LayeredScene,
    LibraryItem,
    effect_content_from_dict,
    effect_content_to_dict,
)
from custom_components.ha_govee_led_ble.effect_scene_codec import (
    decode_layered_scene as compatibility_decode_layered_scene,
)
from custom_components.ha_govee_led_ble.effect_scene_codec import (
    encode_layered_scene as compatibility_encode_layered_scene,
)
from custom_components.ha_govee_led_ble.generated_protocol.scene_body import SceneBody
from custom_components.ha_govee_led_ble.generated_protocol_adapter import (
    _check_tree,
    _write,
    parse_scene_body_param,
)
from custom_components.ha_govee_led_ble.layered_scene_decoder import decode_layered_scene, encode_layered_scene
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES, SceneEntry

_LAYERED_SCENE_TYPE = int(SceneBody.SceneType.scene_v2)


def _reference(sku: str, entry: SceneEntry) -> CatalogueRef:
    return CatalogueRef(sku, entry.scene_id, entry.effect_id)


def _raw_param(entry: SceneEntry) -> bytes:
    return base64.b64decode(entry.param, validate=True)


def _assert_movement(decoded: Any, parsed: Any) -> None:
    assert decoded.enabled is bool(parsed.enabled)
    assert decoded.enter_exit is bool(parsed.enter_exit_effect)
    assert decoded.direction == int(parsed.direction)
    assert decoded.distance == int(parsed.interval)
    assert decoded.speed == int(parsed.speed)
    assert decoded.unknown_flags == int(parsed.unknown_flags)


def _assert_layer(decoded: Any, parsed: Any) -> None:
    assert (decoded.area.start_tenths, decoded.area.width_tenths) == (
        int(parsed.applied_area_start_tenths),
        int(parsed.applied_area_width_tenths),
    )
    assert (int(decoded.selection.type), decoded.selection.param_1, decoded.selection.param_2) == (
        int(parsed.select_type),
        int(parsed.select_param_1),
        int(parsed.select_param_2),
    )
    assert decoded.brightness_gradient is bool(parsed.brightness_is_gradient)
    assert [
        (
            block.scope_high,
            block.scope_low,
            int(block.order),
            block.change_speed,
            block.brightest_retention,
            block.darkest_retention,
        )
        for block in decoded.brightness_patterns
    ] == [
        (
            int(block.scope_high),
            int(block.scope_low),
            int(block.order),
            int(block.change_speed),
            int(block.retention_brightest),
            int(block.retention_darkest),
        )
        for block in parsed.brightness_blocks
    ]
    assert (decoded.distribution.method, decoded.distribution.backwards) == (
        int(parsed.distribution_method),
        bool(parsed.direction_is_backward),
    )
    assert (decoded.colour_speed, decoded.colour_retention) == (
        int(parsed.colour_speed),
        int(parsed.colour_retention),
    )
    assert decoded.palette == tuple((int(colour.r), int(colour.g), int(colour.b)) for colour in parsed.palette)
    _assert_movement(decoded.selected_movement, parsed.selected_area_movement)
    _assert_movement(decoded.overall_movement, parsed.overall_movement)
    assert decoded.priority == int(parsed.priority)
    assert decoded.unknown_flags == int(parsed.unknown_flags)
    assert decoded.excess == bytes(parsed.excess)


def test_compatibility_import_reexports_master_decoder() -> None:
    assert compatibility_decode_layered_scene is decode_layered_scene
    assert compatibility_encode_layered_scene is encode_layered_scene


def test_all_committed_type_2_scenes_decode_losslessly() -> None:
    scene_counts: Counter[str] = Counter()
    layer_count = 0
    catalogue_unknown_flags = 0
    catalogue_excess = 0
    multi_line_bodies = 0

    for sku, entries in SCENE_ENTRIES.items():
        for entry in entries:
            if entry.scene_type != _LAYERED_SCENE_TYPE:
                continue
            raw_param = _raw_param(entry)
            parsed = parse_scene_body_param(raw_param)
            synthetic_envelope = cast(bytes, parsed._io.to_byte_array())
            assert len(synthetic_envelope) == int(parsed.header.linecount) * 17
            _check_tree(parsed)
            assert _write(parsed, len(synthetic_envelope)) == synthetic_envelope

            decoded = decode_layered_scene(
                _reference(sku, entry),
                raw_param,
                speed_index=entry.speed.default_index if entry.speed is not None else None,
            )
            document = effect_content_to_dict(decoded)
            restored = effect_content_from_dict(document)

            assert document["raw_param"] == raw_param.hex()
            assert isinstance(restored, LayeredScene)
            assert restored == decoded
            assert restored.raw_param == raw_param
            assert encode_layered_scene(decoded) == raw_param
            assert len(decoded.effect.layers) == len(parsed.records)
            for layer, record in zip(decoded.effect.layers, parsed.records, strict=True):
                _assert_layer(layer, record.body)
                catalogue_unknown_flags += layer.unknown_flags
                catalogue_unknown_flags += layer.selected_movement.unknown_flags
                catalogue_unknown_flags += layer.overall_movement.unknown_flags
                catalogue_excess += len(layer.excess)

            scene_counts[sku] += 1
            layer_count += len(decoded.effect.layers)
            multi_line_bodies += parsed.header.linecount > 2

    assert scene_counts == {"H617A": 72, "H6199": 226}
    assert layer_count == 863
    assert catalogue_unknown_flags == 0
    assert catalogue_excess == 0
    assert multi_line_bodies > 0


def test_unknown_flags_and_excess_survive_decode_and_json() -> None:
    entry = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.scene_type == _LAYERED_SCENE_TYPE)
    raw_param = _raw_param(entry)
    parsed = parse_scene_body_param(raw_param)
    original_envelope = cast(bytes, parsed._io.to_byte_array())
    prefix_length = len(original_envelope) - len(raw_param) - len(parsed.padding)
    record = parsed.records[0]
    record.body.layer_flags |= 0x80
    record.body.selected_area_movement.packed |= 0x20
    record.body.select_type = 0xFE
    record.body.brightness_blocks[0].brightness_order = 0xFD
    record.body.excess = b"\xaa\xbb"
    record.len_body += len(record.body.excess)
    parsed.padding = []
    _check_tree(parsed)
    synthetic_envelope = _write(parsed, prefix_length + len(raw_param) + len(record.body.excess))
    synthetic_param = synthetic_envelope[prefix_length:]

    decoded = decode_layered_scene(_reference("H617A", entry), synthetic_param)
    restored = effect_content_from_dict(effect_content_to_dict(decoded))

    assert isinstance(restored, LayeredScene)
    assert restored == decoded
    assert restored.raw_param == synthetic_param
    assert restored.effect.layers[0].unknown_flags == 0x80
    assert restored.effect.layers[0].selected_movement.unknown_flags == 0x20
    assert restored.effect.layers[0].selection.type == 0xFE
    assert restored.effect.layers[0].brightness_patterns[0].order == 0xFD
    assert restored.effect.layers[0].excess == b"\xaa\xbb"
    assert encode_layered_scene(decoded) == synthetic_param
    assert decode_layered_scene(_reference("H617A", entry), encode_layered_scene(decoded)) == decoded


def test_decoded_layered_scene_remains_non_compilable() -> None:
    entry = next(scene for scene in SCENE_ENTRIES["H617A"] if scene.scene_type == _LAYERED_SCENE_TYPE)
    content = decode_layered_scene(_reference("H617A", entry), _raw_param(entry))
    item = LibraryItem.new("Layered template", content)

    assert compatibility(item, "H617A").state is CompatibilityState.UNKNOWN
    with pytest.raises(ValueError, match="no H617A compiler"):
        compile_h617a(item, 800)
