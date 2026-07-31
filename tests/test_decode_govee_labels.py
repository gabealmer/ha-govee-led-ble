"""Guard decode_govee's labels against the encoder that produces the same frames.

These labels are read by humans deciding what a capture proves, so a rendering bug
here becomes a protocol claim. That is not hypothetical: until 2026-07-27 the segment
mask was printed in raw byte order while ``command_write::segment_mask`` defines it as
``u2le``, so an all-segments 0x7fff displayed as ``ff7f``. Read off decoder output that
looks exactly like a 15-bit map skipping bit 7 and using bit 15, and it was one step
from being written into the spec as a structural finding.

The defence is a round trip rather than a fixture: build a frame with the shipped
``protocol.py`` encoder, whose values are known by construction, then assert the label
reports those same values back. Any endianness or offset drift between the two breaks it.
"""

import pytest

from custom_components.ha_govee_led_ble import protocol as proto
from tools.ble import decode_govee as dg


@pytest.mark.parametrize(
    ("segments", "expected"),
    [
        ([1], "0x0001(seg 1)"),
        # Segment 9 is the exact value the old byte-order rendering printed for
        # segment 1, so this pair is what makes a regression to it unambiguous.
        ([9], "0x0100(seg 9)"),
        ([15], "0x4000(seg 15)"),
        ([1, 2, 3], "0x0007(seg 1,2,3)"),
        ([8], "0x0080(seg 8)"),
        (list(range(1, 16)), "0x7fff(all)"),
    ],
)
def test_segment_colour_label_reports_the_segments_that_were_encoded(segments, expected):
    label = dg.label(proto.build_segment_color(segments, 10, 20, 30), "TX")
    assert f"mask={expected}" in label
    assert "rgb=(10,20,30)" in label


def test_segment_brightness_label_uses_the_same_mask_rendering():
    label = dg.label(proto.build_segment_brightness([8], 50), "TX")
    assert "mask=0x0080(seg 8)" in label
    assert "brightness 50%" in label


def test_segment_mask_rendering_is_not_byte_order():
    """Segment 1 and segment 9 must not be confusable, which byte order makes them."""
    one = dg.label(proto.build_segment_color([1], 0, 0, 0), "TX")
    nine = dg.label(proto.build_segment_color([9], 0, 0, 0), "TX")
    assert one != nine
    assert "seg 1)" in one and "seg 9)" in nine


# Real frames from capture drive3-random-color (2026-07-27). Random Color paints a
# generated scheme in three patterned writes instead of fifteen single-segment ones,
# and these are the first multi-bit masks ever captured. They pin the byte order
# without appealing to the encoder: read little-endian the three masks partition
# segments 1..15 exactly, while raw byte order turns aa 2a into a segment 16 that
# cannot exist on a 15-segment strip and drops segment 8.
RANDOM_COLOUR_FRAMES = [
    ("33051501ffffff0000000000aa2a00000000005d", [2, 4, 6, 8, 10, 12, 14]),
    ("330515017544e5000000000044440000000000f6", [3, 7, 11, 15]),
    ("33051501007bff000000000011110000000000a6", [1, 5, 9, 13]),
]


@pytest.mark.parametrize(("frame", "expected"), RANDOM_COLOUR_FRAMES)
def test_captured_multi_segment_masks_render_as_the_segments_the_device_painted(frame, expected):
    label = dg.label(bytes.fromhex(frame), "TX")
    assert f"seg {','.join(str(s) for s in expected)})" in label


def test_captured_multi_segment_masks_partition_the_strip():
    """The three Random Color writes must cover 1..15 once each, with no segment 16."""
    painted: list[int] = []
    for frame, _ in RANDOM_COLOUR_FRAMES:
        raw = bytes.fromhex(frame)
        mask = int.from_bytes(raw[12:14], "little")
        painted.extend(i + 1 for i in range(16) if mask >> i & 1)
    assert sorted(painted) == list(range(1, 16))


def test_whole_strip_segment_brightness_label_names_the_segments_that_differ():
    """33 05 15 03 carries one percent per segment; the label must say which differ.

    Captured 2026-07-27 (drive3-static03) as the last write of a per-segment snapshot
    restore, with segment 1 at 31% and segment 3 at 67%. This frame went unmodelled for
    a long time partly because it rendered as an undifferentiated run of hex.
    """
    frame = bytes.fromhex("330515031f644364646464646464646464646418")
    label = dg.label(frame, "TX")
    assert "seg brightness all" in label
    assert "s1=31" in label
    assert "s3=67" in label
    assert "s2=" not in label


@pytest.mark.parametrize("kelvin", [2700, 3600, 8500])
def test_colour_temperature_label_reports_the_kelvin_that_was_encoded(kelvin):
    """kelvin is u2be, the one big-endian field in this family; guard it stays that way."""
    assert f"{kelvin}K" in dg.label(proto.build_color_temp(kelvin), "TX")


@pytest.mark.parametrize("scene_id", [402, 1173, 10315])
def test_scene_label_reports_the_scene_id_that_was_encoded(scene_id):
    """scene_id is u2le; rendering byte 3 alone showed scene 1173 as 'sub=0x95'."""
    assert f"scene id={scene_id}" in dg.label(proto.build_scene(scene_id), "TX")
