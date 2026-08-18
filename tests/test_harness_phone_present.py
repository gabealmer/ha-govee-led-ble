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
# A second Apple device that is not ours. Invented outright rather than derived from a real
# UDID by editing a few characters: that trick leaves most of the real identifier in place,
# and this constant replaced a value that had kept twelve of the real one's sixteen
# device-specific digits. tests/test_no_committed_identity.py is the standing guard.
_OTHER_UDID = "00001111-000000000000000A"


def _run(
    function: str,
    tmp_path: Path,
    sysfs: Path | str,
    pymobiledevice3: str = "/bin/false",
    host_kind: str = "lab",
) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.update(
        {
            "PHONE_SYSFS_USB": str(sysfs),
            "PHONE_UDID": _UDID,
            "PYMOBILEDEVICE3": pymobiledevice3,
            "HARNESS_HOST_KIND": host_kind,
            "HARNESS_PHONE_BACKEND": "native",
            "HARNESS_BLE_BACKEND": "native",
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


def test_wsl_points_pymobiledevice3_at_native_usbmuxd(tmp_path):
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    result = _run('printf "%s\\n" "$USBMUXD_SOCKET_ADDRESS"', tmp_path, tree, host_kind="wsl")
    assert result.stdout.strip() == "/var/run/usbmuxd"


def test_wsl_userspace_backend_resolves_the_pinned_native_pmd3_tool(tmp_path):
    root = tmp_path / "mise-tool"
    binary = root / "pymobiledevice3" / "bin" / "pymobiledevice3"
    binary.parent.mkdir(parents=True)
    binary.write_text("#!/bin/sh\n")
    binary.chmod(0o755)
    stale = tmp_path / "pymobiledevice3"
    stale.write_text("#!/bin/sh\n")
    stale.chmod(0o755)
    mise = tmp_path / "mise"
    mise.write_text('#!/bin/sh\n[ "$1" = where ] && { printf "%s\\n" "$NATIVE_PMD3_ROOT"; exit 0; }\nexit 1\n')
    mise.chmod(0o755)
    env = os.environ.copy()
    env.update(
        {
            "PHONE_SYSFS_USB": str(tmp_path / "sysfs"),
            "PHONE_UDID": _UDID,
            "HARNESS_HOST_KIND": "wsl",
            "HARNESS_PHONE_BACKEND": "native",
            "HARNESS_BLE_BACKEND": "windows",
            "HARNESS_RSD_BACKEND": "userspace",
            "NATIVE_PMD3_TOOL": "pipx:pymobiledevice3@10.2.1",
            "NATIVE_PMD3_ROOT": str(root),
            "HARNESS_RUN_DIR": str(tmp_path / "run"),
            "GOVEE_CAPTURE_DIR": str(tmp_path / "captures"),
            "PATH": f"{tmp_path}:{env['PATH']}",
        }
    )
    env.pop("PYMOBILEDEVICE3", None)

    result = subprocess.run(  # noqa: S603
        ["/bin/bash", "-c", f"source {_PHONE_SH}; printf '%s\\n' \"$PYMOBILEDEVICE3\""],
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )

    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == str(binary)


def test_absent_for_a_different_apple_device(tmp_path):
    """Matching Apple's vendor id alone would call somebody else's iPad our phone.

    The USB serial descriptor carries the UDID unhyphenated while usbmux prints it hyphenated,
    so both sides are stripped before comparison; this also guards that.
    """
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _OTHER_UDID.replace("-", ""))})
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


def test_wsl_reads_an_empty_tree_as_absent_not_unknown(tmp_path):
    """On WSL an empty USB tree is an observation, not a failure to observe.

    This guest has no USB bus of its own, so vhci_hcd stays unloaded and the directory is
    genuinely empty until the first usbipd attach. Answering UNKNOWN there sent the operator
    to "check /sys/bus/usb/devices is readable" when the true answer was that the phone had
    not been attached yet.
    """
    empty = tmp_path / "sysfs"
    empty.mkdir()
    result = _run("phone_present", tmp_path, empty, host_kind="wsl")
    assert result.stdout.strip() == "ABSENT"


def test_unreadable_sysfs_is_still_unknown_on_wsl(tmp_path):
    """The WSL allowance is for an EMPTY tree, never for one that could not be read."""
    result = _run("phone_present", tmp_path, tmp_path / "nope", host_kind="wsl")
    assert result.stdout.strip() == "UNKNOWN"


def _pmd3_stub(tmp_path: Path, udid: str = _UDID, *, lockdown: str = "ok") -> Path:
    """A stand-in pymobiledevice3 answering `usbmux list` and `lockdown info` separately.

    They are separate because require_phone asks two different questions of them: the
    listing says WHICH device the muxer knows about, and lockdown says whether a connection
    to it actually completes. A stub that answered both with one string could not tell the
    two checks apart, which is the very confusion the real code exists to avoid.

    lockdown="dead" models pymobiledevice3's real failure shape: it logs to stderr, writes
    NOTHING to stdout, and still exits 0.
    """
    stub = tmp_path / f"pmd3-{lockdown}"
    if lockdown == "ok":
        lockdown_body = f"""echo '{{"UniqueDeviceID": "{udid}"}}'"""
    else:
        lockdown_body = "echo 'ERROR Failed to connect to usbmuxd socket.' >&2; exit 0"
    stub.write_text(
        f"""#!/bin/sh
case "$1" in
  usbmux) echo '[{{"UniqueDeviceID": "{udid}"}}]' ;;
  lockdown) {lockdown_body} ;;
esac
"""
    )
    stub.chmod(0o755)
    return stub


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


def test_require_phone_gives_wsl_attachment_guidance_when_the_phone_is_absent(tmp_path):
    tree = _usb_tree(tmp_path, {"1-5": ("0a12", "")})
    result = _run("require_phone", tmp_path, tree, host_kind="wsl")
    assert result.returncode == 1
    assert "attach it to WSL" in result.stderr
    assert "hippoxmox-usbmuxd" not in result.stderr


def test_require_phone_names_native_usbmuxd_on_wsl(tmp_path):
    stub = tmp_path / "stub"
    stub.write_text("#!/bin/sh\necho '[]'\n")
    stub.chmod(0o755)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    result = _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub), host_kind="wsl")
    assert result.returncode == 1
    assert "systemctl restart usbmuxd.service" in result.stderr
    assert "hippoxmox-usbmuxd" not in result.stderr


def test_require_phone_succeeds_when_the_muxer_serves_our_udid(tmp_path):
    stub = _pmd3_stub(tmp_path)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    assert _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub)).returncode == 0


def test_require_phone_rejects_a_listed_phone_it_cannot_reach(tmp_path):
    """The stale-muxer case, and the reason liveness is a round trip rather than a listing.

    usbmuxd keeps answering ListDevices from cache after the mux session dies, so the
    listing still names our phone while every real connection to it fails. Measured
    2026-08-03: `idevice_id -l` named the phone three times running while `ideviceinfo`
    failed all three with "Mux error (-8)".
    """
    stub = _pmd3_stub(tmp_path, lockdown="dead")
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    result = _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub))
    assert result.returncode == 1
    assert "will not open a connection" in result.stderr


def test_phone_mux_alive_does_not_believe_a_zero_exit_with_no_output(tmp_path):
    """pymobiledevice3 EXITS 0 ON FAILURE (pymobiledevice3#1817, open).

    Verified 2026-08-03 against a nonexistent usbmux socket: it logged "Failed to connect
    to usbmuxd socket" to stderr, wrote nothing to stdout, and returned 0. A first version
    of this probe tested `$?` and so reported a healthy muxer for one that was not running,
    which is precisely the bug it was written to catch.
    """
    stub = _pmd3_stub(tmp_path, lockdown="dead")
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    assert _run("phone_mux_alive", tmp_path, tree, pymobiledevice3=str(stub)).returncode != 0


def test_phone_mux_alive_requires_our_udid_not_merely_a_phone(tmp_path):
    """pymobiledevice3 defaults to the first USB device, so a second Apple device attached
    to the same host would otherwise satisfy the probe."""
    stub = _pmd3_stub(tmp_path, udid=_OTHER_UDID)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    assert _run("phone_mux_alive", tmp_path, tree, pymobiledevice3=str(stub)).returncode != 0


def test_require_phone_does_not_accept_some_other_device_being_served(tmp_path):
    """`grep -q Identifier` accepted ANY served device, including one that is not ours."""
    stub = _pmd3_stub(tmp_path, udid=_OTHER_UDID)
    tree = _usb_tree(tmp_path, {"1-2": ("05ac", _UDID.replace("-", ""))})
    assert _run("require_phone", tmp_path, tree, pymobiledevice3=str(stub)).returncode == 1


def test_require_phone_says_unknown_is_not_absent(tmp_path):
    result = _run("require_phone", tmp_path, tmp_path / "nope")
    assert result.returncode == 1
    assert "unknown" in result.stderr.lower()
    assert "not the same" in result.stderr.lower()
