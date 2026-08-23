"""Report fixed source-size categories for any Git commit."""

from __future__ import annotations

import argparse
import json
import subprocess
from collections.abc import Iterable
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INTEGRATION = "custom_components/ha_govee_led_ble/"
GENERATED_PROTOCOL = f"{INTEGRATION}generated_protocol/"
INTEGRATION_FRONTEND = f"{INTEGRATION}frontend/"
FRONTEND_SOURCE = "frontend/src/"
FRONTEND_TESTS = "frontend/tests/"
TOOL_SOURCE_SUFFIXES = {".py", ".sh", ".ps1"}
COMMITTED_FRONTEND_SOURCE = {
    f"{INTEGRATION_FRONTEND}editor-loader.js",
    f"{INTEGRATION_FRONTEND}editor.js",
}
IGNORED_FRONTEND_OUTPUTS = (
    Path(INTEGRATION_FRONTEND) / "effect-studio-bootstrap.js",
    Path(INTEGRATION_FRONTEND) / "manifest.json",
)


def line_count(data: bytes) -> int:
    return data.count(b"\n")


def categories(path: str) -> set[str]:
    result: set[str] = set()
    suffix = Path(path).suffix
    if path.startswith(INTEGRATION) and suffix == ".py" and not path.startswith(GENERATED_PROTOCOL):
        result.add("handwritten_backend")
    if path.startswith(FRONTEND_SOURCE) or path in COMMITTED_FRONTEND_SOURCE:
        result.add("frontend_source")
    if path.startswith("tests/") and suffix == ".py":
        result.add("python_tests")
    if path.startswith(FRONTEND_TESTS):
        result.add("frontend_tests")
    if (path.startswith("tools/generate_frontend_") and suffix == ".py") or (
        path.startswith("tools/ble/") and not path.startswith("tools/ble/kaitai/") and suffix in TOOL_SOURCE_SUFFIXES
    ):
        result.add("non_kaitai_tools")
    if path == "Makefile" or path.startswith(("scripts/", ".github/workflows/")):
        result.add("build_scripts_workflows")
    if suffix == ".ksy":
        result.add("ksy")
    if suffix == ".md":
        result.add("documentation")
    if path.startswith(GENERATED_PROTOCOL) or (
        path.startswith(INTEGRATION_FRONTEND) and path not in COMMITTED_FRONTEND_SOURCE
    ):
        result.add("tracked_generated_output")
    return result


def _run(*args: str) -> bytes:
    return subprocess.check_output(args, cwd=REPO)  # noqa: S603 - fixed git executable and argv


def tracked_files(ref: str) -> Iterable[tuple[str, bytes]]:
    resolved = _run("git", "rev-parse", "--verify", f"{ref}^{{commit}}").decode().strip()
    paths = _run("git", "ls-tree", "-rz", "--name-only", resolved).split(b"\0")
    for raw_path in paths:
        if not raw_path:
            continue
        path = raw_path.decode()
        yield path, _run("git", "cat-file", "blob", f"{resolved}:{path}")


def report(ref: str, *, working_generated: bool = False) -> dict[str, int | str]:
    values: dict[str, int | str] = {
        "ref": _run("git", "rev-parse", f"{ref}^{{commit}}").decode().strip(),
        "tracked_total": 0,
        "handwritten_backend": 0,
        "frontend_source": 0,
        "python_tests": 0,
        "frontend_tests": 0,
        "non_kaitai_tools": 0,
        "build_scripts_workflows": 0,
        "ksy": 0,
        "documentation": 0,
        "tracked_generated_output": 0,
        "ignored_generated_protocol": 0,
        "ignored_generated_frontend": 0,
    }

    def add(key: str, lines: int) -> None:
        current = values[key]
        assert isinstance(current, int)
        values[key] = current + lines

    for path, data in tracked_files(ref):
        lines = line_count(data)
        add("tracked_total", lines)
        for category in categories(path):
            add(category, lines)
    if working_generated and values["ref"] == _run("git", "rev-parse", "HEAD").decode().strip():
        protocol_root = REPO / GENERATED_PROTOCOL
        values["ignored_generated_protocol"] = sum(line_count(path.read_bytes()) for path in protocol_root.glob("*.py"))
        values["ignored_generated_frontend"] = sum(
            line_count((REPO / path).read_bytes()) for path in IGNORED_FRONTEND_OUTPUTS if (REPO / path).is_file()
        )
    return values


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("refs", nargs="+")
    parser.add_argument("--working-generated", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    reports = [report(ref, working_generated=args.working_generated) for ref in args.refs]
    if args.json:
        print(json.dumps(reports, indent=2, sort_keys=True))
        return 0
    columns = [key for key in reports[0] if key != "ref"]
    print("ref\t" + "\t".join(columns))
    for value in reports:
        print(str(value["ref"])[:12] + "\t" + "\t".join(str(value[column]) for column in columns))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
