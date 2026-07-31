import plistlib
import zipfile
from typing import Any

import pytest

from tools.harness.wda_sign import (
    RUNNER_APP,
    UPSTREAM_RUNNER_ID,
    XCTEST_PLIST,
    derive_bundle_ids,
    main,
    prepare_payload,
    profile_entitlements,
)


def _profile_bytes(entitlements: dict[str, Any]) -> bytes:
    """A .mobileprovision is an XML plist inside a CMS blob, so wrap one in plausible noise."""
    plist = plistlib.dumps({"Name": "test", "Entitlements": entitlements})
    return b"\x30\x82\x0b\xd1CMS-HEADER-BYTES" + plist + b"CMS-SIGNATURE-BYTES"


def test_profile_entitlements_slices_the_plist_out_of_the_cms_wrapper():
    raw = _profile_bytes({"get-task-allow": True, "application-identifier": "TEAM.io.example.*"})
    assert profile_entitlements(raw)["application-identifier"] == "TEAM.io.example.*"


def test_profile_entitlements_rejects_a_file_that_is_not_a_profile():
    with pytest.raises(ValueError, match="mobileprovision"):
        profile_entitlements(b"not a profile at all")


def test_derive_bundle_ids_from_a_prefix_wildcard():
    """The wildcard route is the one the portal instructions recommend, because a single
    App ID then covers both the runner and its nested test bundle."""
    assert derive_bundle_ids("ABCDE12345.com.example.*") == (
        "com.example.WebDriverAgentRunner.xctrunner",
        "com.example.WebDriverAgentRunner",
    )


def test_derive_bundle_ids_from_a_team_wide_wildcard_keeps_the_upstream_ids():
    """A bare `TEAM.*` gives no prefix to build on, but it also matches everything, so the
    ids the runner already ships with are valid and there is nothing to rewrite."""
    assert derive_bundle_ids("ABCDE12345.*") == (
        UPSTREAM_RUNNER_ID,
        "com.facebook.WebDriverAgentRunner",
    )


def test_derive_bundle_ids_from_an_explicit_app_id():
    assert derive_bundle_ids("ABCDE12345.com.example.WebDriverAgentRunner.xctrunner") == (
        "com.example.WebDriverAgentRunner.xctrunner",
        "com.example.WebDriverAgentRunner",
    )


def test_derive_bundle_ids_refuses_an_app_id_that_cannot_name_a_runner():
    """Reaching for an unrelated app's profile is the obvious shortcut and it cannot work, so it
    has to fail here rather than at install time with an opaque installd error."""
    with pytest.raises(ValueError, match="xctrunner"):
        derive_bundle_ids("ABCDE12345.com.example.someotherapp")


def test_derive_bundle_ids_refuses_a_malformed_identifier():
    with pytest.raises(ValueError, match="malformed"):
        derive_bundle_ids("noteamprefix")


def _fake_runner_zip(path):
    """The parts of the real runner that preparation touches, and nothing else."""
    with zipfile.ZipFile(path, "w") as zf:
        zf.writestr(f"{RUNNER_APP}/Info.plist", plistlib.dumps({"CFBundleIdentifier": UPSTREAM_RUNNER_ID}))
        zf.writestr(XCTEST_PLIST, plistlib.dumps({"CFBundleIdentifier": "com.facebook.WebDriverAgentRunner"}))
        zf.writestr(f"{RUNNER_APP}/PlugIns/WebDriverAgentRunner.xctest.dSYM/Contents/Info.plist", b"debug symbols")
    return path


def test_prepare_payload_rewrites_nested_id_and_drops_debug_symbols(tmp_path):
    """Two failures at once: the nested id zsign will not touch (see -b, which is
    top-level only), and a .dSYM sitting in PlugIns where installd expects loadable
    bundles."""
    payload = prepare_payload(
        _fake_runner_zip(tmp_path / "runner.zip"), tmp_path / "work", "com.example.WebDriverAgentRunner"
    )
    with (payload / XCTEST_PLIST).open("rb") as fh:
        assert plistlib.load(fh)["CFBundleIdentifier"] == "com.example.WebDriverAgentRunner"
    assert not list((payload / RUNNER_APP / "PlugIns").glob("*.dSYM"))


def test_prepare_payload_is_repeatable(tmp_path):
    """Signing is retried by hand after a portal mistake, and a stale tree from the previous
    attempt would be signed silently."""
    zip_path = _fake_runner_zip(tmp_path / "runner.zip")
    prepare_payload(zip_path, tmp_path / "work", "com.example.First")
    payload = prepare_payload(zip_path, tmp_path / "work", "com.example.Second")
    with (payload / XCTEST_PLIST).open("rb") as fh:
        assert plistlib.load(fh)["CFBundleIdentifier"] == "com.example.Second"


def test_main_refuses_a_profile_that_cannot_launch_a_runner(tmp_path, capsys):
    """Ad Hoc and App Store profiles both carry get-task-allow false, and the two already on
    this phone are Ad Hoc. Signing with one succeeds and installs; the runner then refuses to
    launch, which is a far more expensive place to learn it."""
    profile = tmp_path / "adhoc.mobileprovision"
    profile.write_bytes(_profile_bytes({"get-task-allow": False, "application-identifier": "TEAM.com.example.*"}))
    assert main([str(tmp_path / "cert.cer"), str(profile), "--key", str(tmp_path / "k.pem")]) == 1
    assert "get-task-allow" in capsys.readouterr().err
