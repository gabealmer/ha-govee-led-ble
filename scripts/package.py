"""Create the deterministic HACS integration archive."""

from __future__ import annotations

import argparse
import stat
from hashlib import sha256
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

_TIMESTAMP = (1980, 1, 1, 0, 0, 0)
_EXCLUDED_DIRECTORIES = {"__pycache__"}
_EXCLUDED_SUFFIXES = {".pyc", ".pyo"}


def _runtime_files(source: Path) -> list[Path]:
    files: list[Path] = []
    for path in source.rglob("*"):
        relative = path.relative_to(source)
        if any(part in _EXCLUDED_DIRECTORIES or part.startswith(".") for part in relative.parts):
            continue
        if path.is_symlink():
            raise SystemExit(f"runtime package cannot contain a symbolic link: {relative}")
        if path.is_file() and path.suffix not in _EXCLUDED_SUFFIXES:
            files.append(path)
    return sorted(files, key=lambda path: path.relative_to(source).as_posix())


def build_archive(source: Path, output: Path) -> str:
    files = _runtime_files(source)
    required = {Path("__init__.py"), Path("manifest.json")}
    present = {path.relative_to(source) for path in files}
    missing = required - present
    if missing:
        names = ", ".join(sorted(path.as_posix() for path in missing))
        raise SystemExit(f"runtime package is missing: {names}")

    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        archive.comment = b""
        for path in files:
            relative = path.relative_to(source).as_posix()
            info = ZipInfo(relative, _TIMESTAMP)
            info.compress_type = ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.extra = b""
            info.comment = b""
            archive.writestr(info, path.read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)

    digest = sha256(output.read_bytes()).hexdigest()
    output.with_suffix(f"{output.suffix}.sha256").write_text(f"{digest}  {output.name}\n", encoding="ascii")
    return digest


def verify_archive(source: Path, archive_path: Path) -> None:
    files = _runtime_files(source)
    expected = {path.relative_to(source).as_posix(): path for path in files}
    with ZipFile(archive_path) as archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if names != sorted(expected):
            raise SystemExit("runtime package entries differ from the source tree")
        for info in infos:
            path = expected[info.filename]
            mode = info.external_attr >> 16
            if (
                info.date_time != _TIMESTAMP
                or info.create_system != 3
                or stat.S_IFMT(mode) != stat.S_IFREG
                or stat.S_IMODE(mode) != 0o644
                or info.extra
                or info.comment
            ):
                raise SystemExit(f"runtime package metadata is invalid: {info.filename}")
            if archive.read(info) != path.read_bytes():
                raise SystemExit(f"runtime package content differs from source: {info.filename}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--output", type=Path)
    action.add_argument("--verify-archive", type=Path)
    args = parser.parse_args()
    if args.verify_archive is not None:
        verify_archive(args.source, args.verify_archive)
        return 0
    assert args.output is not None
    print(build_archive(args.source, args.output))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
