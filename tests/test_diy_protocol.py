"""Round-trip tests for H617A DIY body encoders."""

import io
from pathlib import Path

import pytest
from kaitaistruct import KaitaiStream

from custom_components.ha_govee_led_ble import protocol as proto
from custom_components.ha_govee_led_ble.generated_protocol.diy_type03 import DiyType03
from custom_components.ha_govee_led_ble.generated_protocol.diy_type04 import DiyType04

FIXTURES = Path(__file__).resolve().parents[1] / "tools/ble/kaitai/src"


def _reassemble(frames: list[bytes]) -> bytes:
    for frame in frames:
        assert len(frame) == 20
        assert proto.xor_checksum(frame[:19]) == frame[19]
    return b"".join(frame[2:19] for frame in frames)


def test_activation_encoder_matches_captured_diy_code() -> None:
    expected = (FIXTURES / "command_write_diy_saved.bin").read_bytes()

    assert proto.build_h617a_diy_activation(800) == expected
    parsed = proto.decode_command_frame(expected)
    assert parsed is not None
    assert parsed.body.sub_body.code == 800


@pytest.mark.parametrize("diy_code", [-1, 0x10000, 1.5])
def test_activation_encoder_rejects_invalid_code(diy_code: int) -> None:
    with pytest.raises(ValueError, match="DIY code"):
        proto.build_h617a_diy_activation(diy_code)


@pytest.mark.parametrize("path", sorted(FIXTURES.glob("diy_type03_*.bin")), ids=lambda path: path.stem)
def test_painted_encoder_round_trips_every_fixture(path: Path) -> None:
    raw = path.read_bytes()
    parsed = DiyType03(KaitaiStream(io.BytesIO(raw)))
    parsed._read()
    groups = [
        proto.DiyPaintGroup(
            (group.fill.r, group.fill.g, group.fill.b),
            tuple(group.segment_indices),
        )
        for group in parsed.groups
    ]

    frames = proto.build_h617a_diy_painted(
        parsed.effect.name,
        parsed.speed,
        parsed.brightness,
        (parsed.background.r, parsed.background.g, parsed.background.b),
        groups,
    )

    assert _reassemble(frames) == raw


@pytest.mark.parametrize(
    "path",
    sorted(FIXTURES.glob("diy_type04_flat_*.bin")),
    ids=lambda path: path.stem,
)
def test_single_encoder_round_trips_every_fixture(path: Path) -> None:
    raw = path.read_bytes()
    parsed = DiyType04(KaitaiStream(io.BytesIO(raw)))
    parsed._read()
    palette = [(colour.r, colour.g, colour.b) for colour in parsed.body.palette.colours]

    frames = proto.build_h617a_diy_single(
        parsed.family,
        parsed.body.variant,
        parsed.body.speed,
        palette,
    )

    assert _reassemble(frames) == raw


@pytest.mark.parametrize(
    "path",
    sorted(FIXTURES.glob("diy_type04_combo_*.bin")),
    ids=lambda path: path.stem,
)
def test_multi_encoder_round_trips_every_fixture(path: Path) -> None:
    raw = path.read_bytes()
    parsed = DiyType04(KaitaiStream(io.BytesIO(raw)))
    parsed._read()
    palette = [(colour.r, colour.g, colour.b) for colour in parsed.body.palette.colours]
    effects = [(pair.family, pair.variant) for pair in parsed.body.pairs]

    frames = proto.build_h617a_diy_multi(effects, parsed.body.speed, palette)

    assert _reassemble(frames) == raw


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
