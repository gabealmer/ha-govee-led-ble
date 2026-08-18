#!/usr/bin/env python3
"""Extract a verified local integration package for isolated Home Assistant."""

from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path, PurePosixPath
from zipfile import ZipFile


def extract_package(archive_path: Path, destination: Path) -> None:
    stage = destination.with_name(f".{destination.name}.stage")
    shutil.rmtree(stage, ignore_errors=True)
    stage.mkdir(parents=True)
    try:
        with ZipFile(archive_path) as archive:
            for info in archive.infolist():
                relative = PurePosixPath(info.filename)
                if relative.is_absolute() or ".." in relative.parts or info.is_dir():
                    raise ValueError(f"unsafe package entry: {info.filename}")
                target = stage.joinpath(*relative.parts)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.read(info))
                target.chmod(0o644)
        for required in ("__init__.py", "manifest.json"):
            if not (stage / required).is_file():
                raise ValueError(f"package is missing {required}")
        shutil.rmtree(destination, ignore_errors=True)
        os.replace(stage, destination)
    except Exception:
        shutil.rmtree(stage, ignore_errors=True)
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    extract_package(args.archive, args.destination)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
