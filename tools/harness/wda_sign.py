"""Re-sign Appium's prebuilt WebDriverAgent runner with our own Apple Development identity.

WHY THIS EXISTS. The accessibility daemon can READ the screen by name (see ax.py) but
`perform_press` is a silent no-op against a third-party app: it returns success and puts
nothing on the wire. XCUITest has no such restriction, so driving the phone by element name
means running WebDriverAgent, and running WebDriverAgent means signing it ourselves.

WHY NOT A MAC. Appium ships a prebuilt device runner as a release asset, so there is no
Xcode build here. All that is missing from the download is a signature this phone will
accept, which zsign applies on Linux.

THE PROFILE MUST BE A DEVELOPMENT ONE. An XCTest runner cannot launch without
`get-task-allow: true`, and Ad Hoc and App Store profiles both set it false. That single
entitlement is the reason an existing distribution profile cannot be reused.

Certificate renewal is the expected reason to run this again: Apple Development certificates
last a year, and the runner stops launching the day one expires.
"""

from __future__ import annotations

import argparse
import plistlib
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from typing import Any

RUNNER_URL = "https://github.com/appium/WebDriverAgent/releases/download/v16.0.3/WebDriverAgentRunner-Runner.zip"
RUNNER_APP = "WebDriverAgentRunner-Runner.app"
XCTEST_PLIST = f"{RUNNER_APP}/PlugIns/WebDriverAgentRunner.xctest/Info.plist"
XCTRUNNER_SUFFIX = ".xctrunner"
# Valid under a team-wide `TEAM.*` profile, which matches any bundle id including these.
UPSTREAM_RUNNER_ID = "com.facebook.WebDriverAgentRunner.xctrunner"


def profile_entitlements(raw: bytes) -> dict[str, Any]:
    """Pull the entitlements out of a .mobileprovision.

    The file is a CMS blob wrapping an XML plist. Slicing the plist out by its own delimiters
    avoids shelling out to openssl to verify a signature we have no intention of checking:
    Apple's, on a file we just downloaded from Apple over TLS.
    """
    start = raw.find(b"<?xml")
    end = raw.find(b"</plist>")
    if start == -1 or end == -1:
        raise ValueError("no plist found; is this really a .mobileprovision?")
    profile = plistlib.loads(raw[start : end + len(b"</plist>")])
    entitlements: dict[str, Any] = profile.get("Entitlements", {})
    return entitlements


def derive_bundle_ids(application_identifier: str) -> tuple[str, str]:
    """Return (runner app id, nested xctest id) for a profile's application-identifier.

    zsign's -b rewrites the TOP-LEVEL app only, so the nested .xctest keeps whatever id it
    shipped with. Under a wildcard profile that leaves com.facebook.WebDriverAgentRunner
    uncovered and the install is rejected, so both ids are derived here and both are written.
    """
    team, _, app_id = application_identifier.partition(".")
    if not team or not app_id:
        raise ValueError(f"malformed application-identifier {application_identifier!r}")
    if app_id == "*":
        runner = UPSTREAM_RUNNER_ID
    elif app_id.endswith(".*"):
        runner = f"{app_id[:-2]}.WebDriverAgentRunner{XCTRUNNER_SUFFIX}"
    elif app_id.endswith(XCTRUNNER_SUFFIX):
        runner = app_id
    else:
        raise ValueError(
            f"profile is for {app_id!r}, which is neither a wildcard nor an "
            f"{XCTRUNNER_SUFFIX} id; an XCUITest runner needs one of those"
        )
    return runner, runner[: -len(XCTRUNNER_SUFFIX)]


def prepare_payload(runner_zip: Path, workdir: Path, xctest_id: str) -> Path:
    """Unpack the runner into a Payload/ tree and make it signable. Returns the Payload dir."""
    payload = workdir / "Payload"
    if payload.exists():
        shutil.rmtree(payload)
    payload.mkdir(parents=True)
    with zipfile.ZipFile(runner_zip) as zf:
        zf.extractall(payload)

    # Debug symbols for a binary we will re-sign, shipped inside PlugIns where installd
    # expects only loadable bundles. A megabyte of nothing at best, a rejection at worst.
    for dsym in (payload / RUNNER_APP / "PlugIns").glob("*.dSYM"):
        shutil.rmtree(dsym)

    set_bundle_id(payload / XCTEST_PLIST, xctest_id)
    return payload


def set_bundle_id(plist_path: Path, bundle_id: str) -> None:
    with plist_path.open("rb") as fh:
        data = plistlib.load(fh)
    data["CFBundleIdentifier"] = bundle_id
    with plist_path.open("wb") as fh:
        plistlib.dump(data, fh)


def _run(cmd: list[str]) -> None:
    print("+ " + " ".join(cmd))
    subprocess.run(cmd, check=True)  # noqa: S603 - argv is built here from constants and CLI paths


def _fetch_runner(dest: Path) -> Path:
    if dest.exists():
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"+ fetching {RUNNER_URL}")
    urllib.request.urlretrieve(RUNNER_URL, dest)  # noqa: S310 - constant https URL
    return dest


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cert", type=Path, help="Apple Development certificate (.cer, DER)")
    parser.add_argument("profile", type=Path, help="iOS App Development profile (.mobileprovision)")
    parser.add_argument("--key", type=Path, required=True, help="private key matching the CSR")
    parser.add_argument("--workdir", type=Path, default=Path(tempfile.gettempdir()) / "wda-sign")
    parser.add_argument("--install", action="store_true", help="install onto the phone when signed")
    args = parser.parse_args(argv)

    entitlements = profile_entitlements(args.profile.read_bytes())
    if not entitlements.get("get-task-allow"):
        print(
            "refusing: this profile has get-task-allow false, so it is Ad Hoc or App Store.\n"
            "An XCUITest runner cannot launch under it. Create an iOS App Development profile.",
            file=sys.stderr,
        )
        return 1
    runner_id, xctest_id = derive_bundle_ids(entitlements["application-identifier"])
    print(f"  runner {runner_id}\n  xctest {xctest_id}")

    args.workdir.mkdir(parents=True, exist_ok=True)
    payload = prepare_payload(_fetch_runner(args.workdir / "WebDriverAgentRunner-Runner.zip"), args.workdir, xctest_id)

    # zsign takes a certificate and a key separately, so the usual detour through a .p12
    # is unnecessary. Apple hands out DER, which openssl's x509 -in will not read.
    cert_pem = args.workdir / "cert.pem"
    _run(["openssl", "x509", "-inform", "DER", "-in", str(args.cert), "-out", str(cert_pem)])

    ipa = args.workdir / "WebDriverAgentRunner.ipa"
    _run(
        [
            "zsign",
            "-f",
            "-c",
            str(cert_pem),
            "-k",
            str(args.key),
            "-m",
            str(args.profile),
            "-b",
            runner_id,
            "-o",
            str(ipa),
            str(payload / RUNNER_APP),
        ]
    )

    if args.install:
        _run(["pymobiledevice3", "apps", "install", str(ipa)])
        print(
            f"\ninstalled. prove it independently of anything Govee:\n"
            f"  pymobiledevice3 developer wda status -xc {runner_id}"
        )
    else:
        print(f"\nsigned: {ipa}\nrerun with --install, or:\n  pymobiledevice3 apps install {ipa}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
