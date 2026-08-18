from pathlib import Path
from zipfile import ZipFile

import pytest

from tools.harness.local_package import extract_package


def _package(path: Path, files: dict[str, str]) -> Path:
    with ZipFile(path, "w") as archive:
        for name, content in files.items():
            archive.writestr(name, content)
    return path


def test_extract_package_replaces_stale_tree(tmp_path: Path) -> None:
    destination = tmp_path / "integration"
    destination.mkdir()
    (destination / "stale.py").write_text("stale", encoding="utf-8")
    archive = _package(
        tmp_path / "integration.zip",
        {
            "__init__.py": "",
            "manifest.json": "{}",
            "generated_protocol/sample.py": "generated",
        },
    )

    extract_package(archive, destination)

    assert not (destination / "stale.py").exists()
    assert (destination / "generated_protocol/sample.py").read_text(encoding="utf-8") == "generated"


@pytest.mark.parametrize("name", ["../escape", "/absolute"])
def test_extract_package_rejects_unsafe_paths(tmp_path: Path, name: str) -> None:
    archive = _package(
        tmp_path / "unsafe.zip",
        {
            "__init__.py": "",
            "manifest.json": "{}",
            name: "unsafe",
        },
    )

    with pytest.raises(ValueError, match="unsafe package entry"):
        extract_package(archive, tmp_path / "integration")
