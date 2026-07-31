from tools.harness.ax import main, select

# Captions as the phone actually returned them on 2026-07-30, with the Govee device list
# showing the cupboard strip (on), an offline H617A and a DreamView T1.
_ELEMENTS = [
    {"caption": "ALL, Button"},
    {"caption": "RGBIC Strip Lights, H617A_5849, Device offline, DreamView T1"},
    {"caption": "control btn home off, Button, Selected"},
    {"caption": "control btn home off, Button, Not Enabled"},
    {"caption": "control btn home off, Button"},
]


def test_select_matches_on_a_substring_so_a_state_suffix_cannot_hide_a_control():
    """The caption carries state, so equality would find nothing the moment a light flips.

    The same power button read "control btn home off, Button, Selected" while lit and
    "control btn home off, Button" once off, within a single probe session.
    """
    assert select(_ELEMENTS, "control btn home off") is not None
    assert select([{"caption": "control btn home off, Button"}], "control btn home off, Button, Selected") is None


def test_select_returns_the_first_in_walk_order():
    """Walk order is layout order, so the first match is the topmost, leftmost control.

    All three power buttons share a caption prefix; picking any other one would drive the
    wrong device, and the offline device's button would silently do nothing at all.
    """
    assert select(_ELEMENTS, "control btn home off")["caption"] == "control btn home off, Button, Selected"


def test_select_returns_none_when_absent():
    assert select(_ELEMENTS, "no such control") is None


def test_select_tolerates_a_null_caption():
    """A focus event may carry no caption, and that must not abort the whole walk."""
    assert select([{"caption": None}, {"caption": "Device, Button"}], "Device")["caption"] == "Device, Button"


def test_main_rejects_an_unknown_command_without_touching_the_phone():
    assert main(["ax.py"]) == 2
    assert main(["ax.py", "press"]) == 2


def test_main_rejects_find_with_no_substring():
    """`find` with no argument must not fall through to an empty needle, which matches all."""
    assert main(["ax.py", "find"]) == 2
