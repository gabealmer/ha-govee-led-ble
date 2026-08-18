"""Round-trip tests for H617A DIY body encoders."""

import io

import pytest
from kaitaistruct import KaitaiStream

from custom_components.ha_govee_led_ble import effect_commands as proto
from custom_components.ha_govee_led_ble.effect_catalogue import (
    H6199_DIY_EFFECTS,
    H6199_PALETTE_DIY_APPLY_CODE,
)
from custom_components.ha_govee_led_ble.effect_compiler import compile_h6199
from custom_components.ha_govee_led_ble.effect_domain import LibraryItem, PaletteDiyEffect
from custom_components.ha_govee_led_ble.generated_protocol.diy_type03 import DiyType03
from custom_components.ha_govee_led_ble.generated_protocol.diy_type04 import DiyType04
from custom_components.ha_govee_led_ble.generated_protocol.h6199_effect_upload import H6199EffectUpload
from custom_components.ha_govee_led_ble.generated_protocol_adapter import (
    build_h6199_palette_diy_envelope,
    parse_command,
)
from custom_components.ha_govee_led_ble.transport import xor_checksum


def _reassemble(frames: list[bytes]) -> bytes:
    for frame in frames:
        assert len(frame) == 20
        assert xor_checksum(frame[:19]) == frame[19]
    return b"".join(frame[2:19] for frame in frames)


def test_activation_encoder_uses_diy_code_800() -> None:
    expected = bytes.fromhex("33050a200300000000000000000000000000001f")

    assert proto.build_h617a_diy_activation(800) == expected
    parsed = parse_command(expected)
    assert parsed is not None
    assert parsed.body.sub_body.code == 800


@pytest.mark.parametrize("diy_code", [-1, 0x10000, 1.5])
def test_activation_encoder_rejects_invalid_code(diy_code: int) -> None:
    with pytest.raises(ValueError, match="DIY code"):
        proto.build_h617a_diy_activation(diy_code)


def test_painted_encoder_round_trips_generated_fields() -> None:
    frames = proto.build_h617a_diy_painted(
        "clockwise",
        45,
        80,
        (1, 2, 3),
        [proto.DiyPaintGroup((10, 20, 30), (0, 2, 4))],
    )
    parsed = DiyType03(KaitaiStream(io.BytesIO(_reassemble(frames))))
    parsed._read()

    assert parsed.effect.name == "clockwise"
    assert (parsed.speed, parsed.brightness) == (45, 80)
    assert (parsed.background.red, parsed.background.green, parsed.background.blue) == (1, 2, 3)
    assert parsed.groups[0].segment_indices == [0, 2, 4]


def test_single_encoder_round_trips_generated_fields() -> None:
    frames = proto.build_h617a_diy_single(1, 2, 50, [(255, 0, 0), (0, 0, 255)])
    parsed = DiyType04(KaitaiStream(io.BytesIO(_reassemble(frames))))
    parsed._read()

    assert (parsed.family, parsed.body.variant, parsed.body.speed) == (1, 2, 50)
    assert [(colour.red, colour.green, colour.blue) for colour in parsed.body.palette.colours] == [
        (255, 0, 0),
        (0, 0, 255),
    ]


def test_multi_encoder_round_trips_generated_fields() -> None:
    frames = proto.build_h617a_diy_multi([(0, 1), (2, 3)], 60, [(1, 2, 3)])
    parsed = DiyType04(KaitaiStream(io.BytesIO(_reassemble(frames))))
    parsed._read()

    assert parsed.family == 0xFF and parsed.body.speed == 60
    assert [(pair.family, pair.variant) for pair in parsed.body.pairs] == [(0, 1), (2, 3)]


@pytest.mark.parametrize("effect", H6199_DIY_EFFECTS, ids=lambda effect: effect.id)
def test_h6199_compiler_matches_every_visible_family_and_variation(effect) -> None:
    palette = ((255, 0, 0), (0, 0, 255))
    item = LibraryItem.new(
        effect.label,
        PaletteDiyEffect(
            "H6199",
            effect.family,
            effect.variant,
            50,
            palette,
        ),
    )

    compiled = compile_h6199(item)
    parsed = H6199EffectUpload(KaitaiStream(io.BytesIO(_reassemble(list(compiled.upload_packets)))))
    parsed._read()

    assert int(parsed.content.family) == effect.family
    assert parsed.content.variant == effect.variant
    assert parsed.content.speed == 50
    assert [(colour.red, colour.green, colour.blue) for colour in parsed.content.palette] == list(palette)
    assert compiled.activation_packet == bytes.fromhex("33050491010200000000000000000000000000a0")
    assert compiled.diy_code == H6199_PALETTE_DIY_APPLY_CODE


def test_h6199_activation_encoder_uses_workshop_slot() -> None:
    expected = bytes.fromhex("33050491010200000000000000000000000000a0")

    assert proto.build_h6199_palette_diy_activation(401, 2) == expected


def test_h6199_fixed_diy_envelope_accepts_the_largest_structurally_fitting_palette() -> None:
    envelope = build_h6199_palette_diy_envelope(
        0,
        0,
        50,
        tuple((index, index + 1, index + 2) for index in range(9)),
    )
    parsed = H6199EffectUpload(KaitaiStream(io.BytesIO(envelope)))
    parsed._read()

    assert len(envelope) == 34
    assert len(parsed.content.palette) == 9
    assert parsed.content.padding == []


def test_h6199_fixed_diy_envelope_rejects_palette_overflow_before_writing() -> None:
    with pytest.raises(ValueError, match="does not fit the fixed two-chunk envelope"):
        build_h6199_palette_diy_envelope(
            0,
            0,
            50,
            tuple((index, index + 1, index + 2) for index in range(10)),
        )


@pytest.mark.parametrize("effect", ["", "unknown", "Clockwise"])
def test_painted_encoder_rejects_unknown_effect(effect: str) -> None:
    with pytest.raises(ValueError, match="unknown painted effect"):
        proto.build_h617a_diy_painted(effect, 50, 100, (0, 0, 0))


@pytest.mark.parametrize("value", [-1, 101, 1.5])
def test_painted_encoder_rejects_invalid_percentages(value: int) -> None:
    with pytest.raises(ValueError):
        proto.build_h617a_diy_painted("clockwise", value, 100, (0, 0, 0))
    with pytest.raises(ValueError):
        proto.build_h617a_diy_painted("clockwise", 50, value, (0, 0, 0))


@pytest.mark.parametrize("background", [(-1, 0, 0), (0, 0, 256), (0, 0), [0, 0, 0]])
def test_painted_encoder_rejects_invalid_background(background) -> None:
    with pytest.raises(ValueError, match="background"):
        proto.build_h617a_diy_painted("clockwise", 50, 100, background)


def test_painted_encoder_rejects_invalid_groups() -> None:
    with pytest.raises(ValueError, match="at least one"):
        proto.build_h617a_diy_painted(
            "clockwise",
            50,
            100,
            (0, 0, 0),
            [proto.DiyPaintGroup((255, 0, 0), ())],
        )
    with pytest.raises(ValueError, match="out of range"):
        proto.build_h617a_diy_painted(
            "clockwise",
            50,
            100,
            (0, 0, 0),
            [proto.DiyPaintGroup((255, 0, 0), (15,))],
        )
    with pytest.raises(ValueError, match="more than one group"):
        proto.build_h617a_diy_painted(
            "clockwise",
            50,
            100,
            (0, 0, 0),
            [
                proto.DiyPaintGroup((255, 0, 0), (0, 1)),
                proto.DiyPaintGroup((0, 0, 255), (1,)),
            ],
        )


@pytest.mark.parametrize("family", [-1, 0xFF, 0x100])
def test_single_encoder_rejects_invalid_family(family: int) -> None:
    with pytest.raises(ValueError):
        proto.build_h617a_diy_single(family, 0, 50, [(255, 0, 0)])


@pytest.mark.parametrize("palette", [[], [(255, 0, 0)] * 9, [(256, 0, 0)], [[255, 0, 0]]])
def test_single_encoder_rejects_invalid_palette(palette) -> None:
    with pytest.raises(ValueError):
        proto.build_h617a_diy_single(0, 0, 50, palette)


def test_multi_encoder_rejects_invalid_effects() -> None:
    with pytest.raises(ValueError, match="1 to 4"):
        proto.build_h617a_diy_multi([], 50, [(255, 0, 0)])
    with pytest.raises(ValueError, match="1 to 4"):
        proto.build_h617a_diy_multi([(0, 0)] * 5, 50, [(255, 0, 0)])
    with pytest.raises(ValueError, match="reserved"):
        proto.build_h617a_diy_multi([(0xFF, 0)], 50, [(255, 0, 0)])
    with pytest.raises(ValueError, match="effect variant"):
        proto.build_h617a_diy_multi([(0, 0x100)], 50, [(255, 0, 0)])
