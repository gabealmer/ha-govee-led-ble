"""Report static public-contract identifiers for any Git commit."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
DOMAIN = "ha_govee_led_ble"
INTEGRATION = f"custom_components/{DOMAIN}"
DIAGNOSTIC_FILES = (
    f"{INTEGRATION}/diagnostics.py",
    f"{INTEGRATION}/effect_diagnostics.py",
    f"{INTEGRATION}/effect_deployment_diagnostics.py",
)


def _run(*args: str) -> bytes:
    return subprocess.check_output(args, cwd=REPO)  # noqa: S603 - fixed git executable and argv


class Source:
    def __init__(self, ref: str) -> None:
        self.sha = _run("git", "rev-parse", "--verify", f"{ref}^{{commit}}").decode().strip()

    def bytes(self, path: str) -> bytes:
        return _run("git", "cat-file", "blob", f"{self.sha}:{path}")

    def text(self, path: str) -> str:
        return self.bytes(path).decode()

    def paths(self, prefix: str = "") -> list[str]:
        return [
            raw.decode()
            for raw in _run("git", "ls-tree", "-rz", "--name-only", self.sha, "--", prefix).split(b"\0")
            if raw
        ]


def _json_key_paths(value: Any, prefix: str = "") -> list[str]:
    if not isinstance(value, dict):
        return []
    paths: list[str] = []
    for key, nested in value.items():
        path = f"{prefix}.{key}" if prefix else str(key)
        paths.append(path)
        paths.extend(_json_key_paths(nested, path))
    return paths


def _dict_keys(source: str) -> list[str]:
    tree = ast.parse(source)
    keys: set[str] = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Dict):
            continue
        for key in node.keys:
            if isinstance(key, ast.Constant) and isinstance(key.value, str):
                keys.add(key.value)
    return sorted(keys)


def _literal_assignment(source: str, name: str) -> Any:
    tree = ast.parse(source)
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(target, ast.Name) and target.id == name for target in node.targets
        ):
            return ast.literal_eval(node.value)
    raise ValueError(f"{name} is not a literal assignment")


def _websocket_commands(source: str) -> list[str]:
    return sorted(
        {
            f"{DOMAIN}/editor/{match}"
            for match in re.findall(r'WS_[A-Z0-9_]+\s*=\s*f"\{DOMAIN\}/editor/([^"]+)"', source)
        }
    )


def _storage_contracts(source: Source) -> dict[str, int | str]:
    values: dict[str, int | str] = {}
    for path in source.paths(INTEGRATION):
        if not path.endswith(".py"):
            continue
        text = source.text(path)
        for name, value in re.findall(
            r"^([A-Z][A-Z0-9_]*STORE_(?:KEY|VERSION|MINOR_VERSION)):\s*Final\s*=\s*(.+)$",
            text,
            re.MULTILINE,
        ):
            if value.isdigit():
                values[name] = int(value)
            elif match := re.fullmatch(r'f"\{DOMAIN\}\.([^"]+)"', value):
                values[name] = f"{DOMAIN}.{match.group(1)}"
    return dict(sorted(values.items()))


def _service_names(source: str) -> list[str]:
    return sorted(re.findall(r"^([a-z][a-z0-9_]+):\s*$", source, re.MULTILINE))


def _platforms(source: str) -> list[str]:
    return sorted(set(re.findall(r"Platform\.([A-Z_]+)", source)))


def report(ref: str, archive: Path | None = None) -> dict[str, Any]:
    source = Source(ref)
    init_source = source.text(f"{INTEGRATION}/__init__.py")
    strings = json.loads(source.text(f"{INTEGRATION}/strings.json"))
    translations = json.loads(source.text(f"{INTEGRATION}/translations/en.json"))
    scene_catalogues = {
        Path(path).name: hashlib.sha256(source.bytes(path)).hexdigest()
        for path in source.paths(f"{INTEGRATION}/scene_catalogues")
        if path.endswith(".json")
    }
    package_paths: list[str] = []
    if archive is not None:
        with zipfile.ZipFile(archive) as package:
            package_paths = sorted(info.filename for info in package.infolist() if not info.is_dir())
    return {
        "ref": source.sha,
        "platforms": _platforms(init_source),
        "legacy_entity_suffixes": sorted(_literal_assignment(init_source, "_LEGACY_ENTITY_SUFFIXES")),
        "services": _service_names(source.text(f"{INTEGRATION}/services.yaml")),
        "websocket_commands": _websocket_commands(source.text(f"{INTEGRATION}/effect_websocket_schema.py")),
        "storage": _storage_contracts(source),
        "diagnostic_keys": sorted({key for path in DIAGNOSTIC_FILES for key in _dict_keys(source.text(path))}),
        "strings_keys": _json_key_paths(strings),
        "translation_keys": _json_key_paths(translations),
        "scene_catalogue_sha256": scene_catalogues,
        "package_paths": package_paths,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("ref")
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    print(json.dumps(report(args.ref, args.archive), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
