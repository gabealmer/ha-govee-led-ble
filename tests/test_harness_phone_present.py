"""Tests for the USB presence checks in phone.sh.

These exist because the check they replace was a silent false negative that got believed and
written into two hand-over documents as fact. The point of every case below is that a
diagnostic must distinguish "not there" from "could not tell", and must identify OUR phone
rather than any Apple device.
"""

import os
import subprocess
from pathlib import Path

_REPO = Path(__file__).parents[1]
_PHONE_SH = _REPO / "tools" / "harness" / "phone.sh"
_UDID = "00008140-AAAABBBBCCCCDDDD"


def _run(
    function: str,
    tmp_path: Path,
    sysfs: Path | str,
    pymobiledevice3: str = "/bin/false",
) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.update(
        {
            "PHONE_SYSFS_USB": str(sysfs),
            "PHONE_UDID": _UDID,
            "PYMOBILEDEVICE3": pymobiledevice3,
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "GOVEE_CAPTURE_DIR": str(tmp_path / "captures"),
        }
    )
    return subprocess.run(  # noqa: S603
        ["/bin/bash", "-c", f"source {_PHONE_SH}; {function}"],
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )


def _usb_tree(tmp_path: Path, devices: dict[str, tuple[str, str]]) -> Path:
    """Build a stand-in for /sys/bus/usb/devices. Values are (idVendor, serial)."""
    root = tmp_path / "sysfs"
    for name, (vendor, serial) in devices.items():
        node = root / name
        node.mkdir(parents=True)
        (node / "idVendor").write_text(vendor)
        (node / "serial").write_text(serial)
    root.mkdir(parents=True, exist_ok=True)
    return root


def test_present_when_our_phone_is_on_the_bus(tmp_path):
    tree = _usb_tree(
        tmp_path,
        {
            "1-2": ("05ac", _UDID.replace("-", "")),
            "1-5": ("0a12", ""),
        },
    )
    assert _run("phone_present", tmp_path, tree).stdout.strip() == "PRESENT"


def test_absent_for_a_different_apple_device(tmp_path):
    """Matching Apple's vendor id alone would call somebody else's iPad our phone.

    The USB serial descriptor carries the UDID unhyphenated while usbmux prints it hyphenated,
    so both sides are stripped before comparison; this also guards that.
    """
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", "00008999001A69261EA3999C")})
    assert _run("phone_present", tmp_path, tree).stdout.strip() == "ABSENT"


def test_absent_when_the_tree_holds_no_apple_device(tmp_path):
    tree = _usb_tree(tmp_path, {"1-5": ("0a12", ""), "usb1": ("1d6b", "0000:00:14.0")})
    assert _run("phone_present", tmp_path, tree).stdout.strip() == "ABSENT"


def test_unknown_when_sysfs_is_missing(tmp_path):
    """Not the same answer as ABSENT. Conflating them is the whole bug this replaces."""
    assert _run("phone_present", tmp_path, tmp_path / "nope").stdout.strip() == "UNKNOWN"


def test_unknown_when_the_tree_has_no_idvendor_entries(tmp_path):
    """A directory that exists but is not laid out as sysfs is a failure to observe.

    Reading it as "no Apple device attached" would report a confident negative from a
    directory that was never the USB tree at all.
    """
    empty = tmp_path / "sysfs"
    empty.mkdir()
    assert _run("phone_present", tmp_path, empty).stdout.strip() == "UNKNOWN"


def test_require_phone_separates_an_unrunnable_pymobiledevice3_from_a_missing_phone(tmp_path):
    """A broken CLI previously read as "usbmuxd is not serving it", sending the reader to
    restart a daemon that was never the problem."""
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    result = _run("require_phone", tmp_path, tree, pymobiledevice3="/bin/false")
    assert result.returncode == 1
    assert "could not be run" in result.stderr
    assert "systemctl restart" not in result.stderr


def test_require_phone_reports_the_muxer_when_the_phone_is_present_but_unserved(tmp_path):
    """The guest gets no udev hotplug, so this is the ordinary case after replugging."""
    stub = tmp_path / "stub"
    stub.write_text("#!/bin/sh\necho '[]'\n")
    stub.chmod(0o755)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    result = _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub))
    assert result.returncode == 1
    assert "systemctl restart hippoxmox-usbmuxd.service" in result.stderr


def test_require_phone_succeeds_when_the_muxer_serves_our_udid(tmp_path):
    stub = tmp_path / "stub"
    stub.write_text(f'#!/bin/sh\necho \'[{{"UniqueDeviceID": "{_UDID}"}}]\'\n')
    stub.chmod(0o755)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    assert _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub)).returncode == 0


def test_require_phone_does_not_accept_some_other_device_being_served(tmp_path):
    """`grep -q Identifier` accepted ANY served device, including one that is not ours."""
    stub = tmp_path / "stub"
    stub.write_text('#!/bin/sh\necho \'[{"UniqueDeviceID": "00001111-000000000000000A"}]\'\n')
    stub.chmod(0o755)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    assert _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub)).returncode == 1


def test_require_phone_says_unknown_is_not_absent(tmp_path):
    result = _run("require_phone", tmp_path, tmp_path / "nope")
    assert result.returncode == 1
    assert "unknown" in result.stderr.lower()
    assert "not the same" in result.stderr.lower()
