"""Refuse to let the rig's phone identity become committable.

A UDID names one physical handset belonging to one person, so it is the one value in this
project that must never reach a tracked file. The harness keeps it in the untracked
tools/harness/devices.local.env and every tracked reference goes through $PHONE_UDID, but
that is a convention, and a convention is exactly what a stub or a sysfs fixture written in
a hurry breaks. This is the mechanical version of it.

The bug that forced this was not a paste of the whole UDID. It was a fixture that wanted a
different Apple device on the USB bus and produced one by editing four digits at each end
of the real one, which committed twelve of its sixteen device-specific digits and read as
obviously fake to everybody who saw it. So the check is on SHAPE with an allowlist of exact
known-fake values, not on similarity to the real value: the real value is not in this repo
and must not be added here to check against.

The hardware id 05ac:12a8 is deliberately not covered. It identifies a generation of iPhone
rather than a phone, every unit of that generation reports the same pair, and the harness
depends on it being committed so device resolution never has to fall back to a bus id.
"""

import re
import subprocess
from pathlib import Path

import pytest

_REPO = Path(__file__).parents[1]

# usbmux prints a UDID hyphenated, the USB serial descriptor drops the hyphen, and the
# Windows PnP instance id (USB\VID_05AC&PID_12A8\<serial>) carries that same bare form.
# All three are matched, because a leak that only ever surfaced in a sysfs fixture would
# walk straight past a check that knew only the pretty spelling.
_HYPHENATED = re.compile(r"\b[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}\b")
# Anchored on the 0000 that opens the board identifier in this UDID format, and on that
# identifier not itself being zero. Without the first anchor the rule is just "twenty-four
# hex characters", which matches pinned action SHAs, image digests and the packet literals
# in protocol.py, and a check that cries wolf is a check somebody switches off. Without the
# second it also matches the zero padding inside a captured BLE frame, which is how a
# Kaitai colour fixture with the tail 0000000000ff7f0000000000 came to be reported as a
# handset. Apple board identifiers are values like 8030 and 8140; none is 0000, so
# excluding that one case costs no real coverage, and the fragment check below is the
# instrument that catches anything this shape rule declines to guess at.
_BARE = re.compile(r"\b0000(?!0000)[0-9A-Fa-f]{20}\b")

# Every fake in the tree, by exact value. Not by pattern: a real UDID is hex-shaped too, so
# any rule loose enough to admit these admits the thing they stand in for. Keep this list
# short, and add to it only when a new fixture genuinely needs a distinct handset.
_KNOWN_FAKE = frozenset(
    {
        # tools/harness/devices.local.env.example, and the phone in most harness tests.
        "00008140AAAABBBBCCCCDDDD",
        # A second Apple device that is not ours, used to prove the checks match on identity
        # rather than on Apple's vendor id.
        "00001111000000000000000A",
    }
)


def _normalise(value: str) -> str:
    return value.replace("-", "").upper()


def _tracked_files() -> list[Path]:
    """One git call for the whole tree.

    Enumerated from the index rather than from a directory walk so the check sees exactly
    what a push would carry, and so an untracked devices.local.env sitting in a working
    tree is never read.
    """
    listing = subprocess.run(  # noqa: S603
        ["git", "ls-files", "-z"],  # noqa: S607
        cwd=_REPO,
        capture_output=True,
        text=True,
        check=True,
        timeout=60,
    ).stdout
    return [_REPO / name for name in listing.split("\0") if name]


def _readable_text(path: Path) -> str:
    """Bytes as latin-1, which cannot raise and leaves ASCII untouched.

    The 20-byte capture fixtures under tools/ble/kaitai/src are binary and a UTF-8 decode of
    them throws, which would turn this check into a crash on a file it has nothing to say
    about. A UDID cannot fit in a 20-byte BLE packet, but the fixtures are read anyway
    because deciding what to skip by directory is how the next binary corpus gets missed.
    """
    return path.read_bytes().decode("latin-1")


def test_no_tracked_file_carries_a_device_udid():
    offenders = []
    for path in _tracked_files():
        if not path.is_file():
            continue
        text = _readable_text(path)
        for pattern in (_HYPHENATED, _BARE):
            for match in pattern.finditer(text):
                if _normalise(match.group()) in _KNOWN_FAKE:
                    continue
                line = text.count("\n", 0, match.start()) + 1
                offenders.append(f"{path.relative_to(_REPO)}:{line}: {match.group()}")

    assert not offenders, (
        "UDID-shaped values found in tracked files. A UDID is personally identifying and "
        "belongs only in the untracked tools/harness/devices.local.env; read it from "
        "$PHONE_UDID instead. If one of these is a fixture, replace it with an invented "
        "value and add that value to _KNOWN_FAKE.\n" + "\n".join(offenders)
    )


def test_the_shape_rule_still_matches_a_handset_and_not_captured_padding():
    """Pins the boundary of the bare-UDID rule, because that rule was narrowed once.

    The narrowing was to stop a Kaitai fixture's zero padding reading as a handset. A
    privacy check that gets relaxed to quieten a false positive is exactly the kind of
    change that quietly relaxes it to nothing, so the cases on both sides of the line are
    written down rather than left to the regex.

    The positive cases are the allowlisted fakes rather than fresh inventions, because a
    new UDID-shaped literal written here would be reported by the scan above as a leak in
    this very file. Reusing them keeps the corpus of committed handset-shaped values at
    exactly the size the allowlist says it is.
    """
    for value in sorted(_KNOWN_FAKE):
        assert _BARE.fullmatch(value), f"{value} is UDID-shaped and must still be caught"

    # Captured BLE payload: twenty-four hex characters opening with a zero board id, which
    # no Apple handset has. The colour fixture tail is the real value that forced this.
    for value in ["0000000000FF7F0000000000", "000000000000000000000000"]:
        assert not _BARE.fullmatch(value), f"{value} is frame padding, not a handset"


def test_the_identity_file_itself_is_not_tracked():
    """The gitignore entry is the only thing standing between this file and a push.

    Checked separately from the scan above because `git add -f` stages it without touching
    .gitignore, and the scan would then report the leak against a filename that looks like
    it was always meant to be there.
    """
    identity = _REPO / "tools" / "harness" / "devices.local.env"
    assert identity not in _tracked_files(), (
        f"{identity.relative_to(_REPO)} is tracked. It holds the phone UDID and the rig's "
        "real BLE addresses; untrack it and keep the example file as the committed template."
    )


# How much of a real identifier has to appear before it counts as leaked. The threshold is
# per identifier type because the two have very different amounts of unit-specific material:
# a UDID has sixteen digits after its board prefix, a BLE address has six after its OUI. One
# global number either misses addresses entirely or drowns the UDID check in false hits.
_UDID_FRAGMENT = 8
_ADDRESS_FRAGMENT = 6


def _identifying_values() -> list[tuple[str, str, int]]:
    """The rig's real identifiers, read from the untracked file, never from a tracked one.

    Returns (label, hex-only unit-specific part, minimum run length). A UDID's leading eight
    digits are a board identifier shared by every handset of that generation, and a BLE
    address's leading six are the vendor OUI that this project deliberately keeps in its
    fakes, so both prefixes are dropped: including them would flag the placeholders this
    repo is supposed to contain.
    """
    identity = _REPO / "tools" / "harness" / "devices.local.env"
    if not identity.is_file():
        return []
    text = identity.read_text(encoding="utf-8", errors="replace")
    values: list[tuple[str, str, int]] = []
    for match in _HYPHENATED.finditer(text):
        bare = _normalise(match.group())
        if bare not in _KNOWN_FAKE:
            values.append(("phone UDID", bare[8:], _UDID_FRAGMENT))
    for match in re.finditer(r"\b(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}\b", text):
        tail = match.group().replace(":", "").upper()[6:]
        values.append(("BLE address", tail, _ADDRESS_FRAGMENT))
    return values


def test_no_tracked_file_carries_a_fragment_of_a_real_identifier():
    """Catches an identifier that was EDITED rather than pasted.

    The leak that prompted all of this was not a copy of the UDID. It was a fixture that
    needed a second Apple device and made one by changing four digits at each end of the
    real one, which left twelve consecutive real digits in a value that looked invented.
    The shape check above happens to catch that, but only because the result still looked
    like a UDID; the same edit applied to a BLE address would have produced something the
    shape rule has no opinion about at all, because this project's fake addresses are
    SUPPOSED to carry the real vendor OUI.

    Reading the real values at runtime is not the same as committing them. This test is
    therefore local-only by construction and skips where the untracked identity file is
    absent, which includes CI. The shape check is what runs there, and this is the sharper
    instrument for the machine that actually holds the secrets.
    """
    secrets = _identifying_values()
    if not secrets:
        pytest.skip("no tools/harness/devices.local.env on this host, so nothing to compare")

    fragments = [
        (label, value[start : start + length])
        for label, value, length in secrets
        for start in range(len(value) - length + 1)
    ]
    assert fragments, "identity file held no comparable values, so this proved nothing"

    offenders = []
    for path in _tracked_files():
        if not path.is_file():
            continue
        # Compared against the punctuated text and against a hex-only condensation of it, so
        # a value spelled with colons or hyphens cannot hide from the bare form. Only hex
        # characters survive the condensation: keeping the rest of the alphabet would splice
        # unrelated words into runs that read as identifiers.
        haystack = _readable_text(path).upper()
        condensed = re.sub(r"[^0-9A-F]", "", haystack)
        for label, fragment in fragments:
            if fragment in haystack or fragment in condensed:
                offenders.append(f"{path.relative_to(_REPO)}: carries {len(fragment)} digits of the {label}")
                break

    assert not offenders, (
        "Tracked files contain a run of a real device identifier. Editing a few digits of a "
        "real value does not make it fake; invent the whole value instead.\n" + "\n".join(sorted(set(offenders)))
    )
