"""Shared calibrated sampling and signal measures for camera capture corpora.

``analyse_scene_captures`` owns the geometry: endpoint isolation, ridge tracing, equal
arclength lanes, lane masks and the video mapping guard.  Its file hash is the committed
provenance of the scene visual-evidence catalogue, so that module stays byte-identical and
every other analyser reaches the same code through this surface instead of copying it.  A
copy would drift, and a drifted lane sampler reports a different strip while claiming the
same calibration.

Nothing here imports a media library at module scope, so the analysis cores stay importable
and testable without OpenCV, NumPy or a decoded video.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from tools.ble.analyse_scene_captures import (
    CALIBRATION_SCHEMA_VERSION,
    SEGMENT_COUNT,
    Point,
    SamplingLane,
    _best_lag,
    _colour_endpoint,
    _correlation,
    _import_media_dependencies,
    _lane_masks,
    _mean,
    _median,
    _percentile,
    _periodicity,
    _read_video,
    _rgb_distance,
    _sha256,
    _toolchain,
    _trace_strip_path,
    _validate_video_mapping,
    _write_calibration_diagnostic,
    _write_contact_sheet,
    assess_video_mapping,
    derive_calibration,
    derive_sampling_lanes,
    map_lanes_to_video,
    validate_video_mapping,
)

CALIBRATION_DIRECTORY_NAME = "calibration"

__all__ = [
    "CALIBRATION_DIRECTORY_NAME",
    "CALIBRATION_SCHEMA_VERSION",
    "SEGMENT_COUNT",
    "LaneColourSeries",
    "Point",
    "SamplingLane",
    "assess_video_mapping",
    "best_lag",
    "correlation",
    "derive_calibration",
    "derive_sampling_lanes",
    "import_media_dependencies",
    "lane_masks",
    "map_lanes_to_video",
    "mean",
    "median",
    "percentile",
    "periodicity",
    "read_lane_colour_series",
    "rgb_distance",
    "sha256_file",
    "toolchain",
    "validate_video_mapping",
    "write_calibration_diagnostic",
    "write_contact_sheet",
    "write_mapping_evidence",
]


@dataclass(frozen=True, slots=True)
class LaneColourSeries:
    """Calibrated lane colours sampled from one analysis video."""

    timestamps: tuple[float, ...]
    colours: tuple[tuple[tuple[float, float, float], ...], ...]
    size: tuple[int, int]
    frames: tuple[Any, ...]

    @property
    def fps(self) -> float:
        intervals = [right - left for left, right in zip(self.timestamps[:-1], self.timestamps[1:], strict=True)]
        return 1 / median(intervals) if intervals else 0.0


def sha256_file(path: Path) -> str:
    """Return the hex SHA-256 of a file for provenance."""
    return _sha256(path)


def toolchain() -> dict[str, str]:
    """Return the pinned interpreter and media dependency versions."""
    return _toolchain()


def import_media_dependencies() -> tuple[Any, Any, Any, Any]:
    """Import OpenCV, NumPy and Pillow lazily, so the analysis cores stay dependency-free."""
    return _import_media_dependencies()


def median(values: Sequence[float], default: float = 0.0) -> float:
    return _median(values, default)


def mean(values: Sequence[float], default: float = 0.0) -> float:
    return _mean(values, default)


def percentile(values: Sequence[float], fraction: float, default: float = 0.0) -> float:
    return _percentile(values, fraction, default)


def rgb_distance(left: Sequence[float], right: Sequence[float]) -> float:
    return _rgb_distance(left, right)


def correlation(left: Sequence[float], right: Sequence[float]) -> float:
    return _correlation(left, right)


def best_lag(left: Sequence[float], right: Sequence[float], maximum_lag: int) -> tuple[int, float]:
    return _best_lag(left, right, maximum_lag)


def periodicity(signal: Sequence[float], fps: float, noise: float) -> dict[str, float | int | None]:
    return _periodicity(signal, fps, noise)


def calibration_root(calibration_directory: Path) -> Path:
    """Return the corpus root that holds a reusable ``calibration`` directory."""
    if calibration_directory.name != CALIBRATION_DIRECTORY_NAME:
        raise ValueError(
            f"calibration images must live in a directory named {CALIBRATION_DIRECTORY_NAME!r}, "
            f"not {calibration_directory.name!r}"
        )
    return calibration_directory.parent


def probe_video_size(path: Path) -> tuple[int, int]:
    """Return the pixel size of an analysis video without decoding its frames."""
    cv2, _, _, _ = import_media_dependencies()
    capture = cv2.VideoCapture(str(path))
    size = (int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)), int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    capture.release()
    if size[0] <= 0 or size[1] <= 0:
        raise ValueError(f"{path} does not report a usable frame size")
    return size


def derive_corpus_calibration(
    calibration_directory: Path,
    *,
    video_size: tuple[int, int],
) -> tuple[dict[str, Any], tuple[SamplingLane, ...]]:
    """Derive lane geometry from saved calibration images for a given analysis video size."""
    try:
        return derive_calibration(calibration_root(calibration_directory), video_size=video_size)
    except ValueError as err:
        if "does not isolate a stable strip ridge" not in str(err):
            raise

    cv2, numpy, image_module, _ = import_media_dependencies()
    files = {
        "black": calibration_directory / "00-black.png",
        "first": calibration_directory / "01-first-red.png",
        "last": calibration_directory / "02-last-blue.png",
        "white": calibration_directory / "03-all-white.png",
    }
    images = {name: numpy.asarray(image_module.open(path).convert("RGB")) for name, path in files.items()}
    first, first_confidence = _colour_endpoint(images["first"], images["black"], "red", numpy)
    last, last_confidence = _colour_endpoint(images["last"], images["black"], "blue", numpy)
    path = _trace_strip_path(images["white"], images["black"], first, last, cv2, numpy)
    lanes = derive_sampling_lanes(path)
    source_height, source_width = images["black"].shape[:2]
    scale, video_lanes = map_lanes_to_video(lanes, (source_width, source_height), video_size)
    calibration = {
        "schema_version": CALIBRATION_SCHEMA_VERSION,
        "images": {name: {"file": file.name, "sha256": sha256_file(file)} for name, file in files.items()},
        "source_size": [source_width, source_height],
        "analysis_video_size": list(video_size),
        "uniform_scale": round(scale, 8),
        "endpoint_confidence": {"first": round(first_confidence, 3), "last": round(last_confidence, 3)},
        "ridge_contrast": None,
        "lane_count": len(lanes),
        "lanes": video_lanes,
        "limitations": [
            "White-light spill is brighter than the LED ridge; geometry uses colour endpoints and the traced path."
        ],
    }
    return calibration, lanes


def lane_masks(
    lanes: Sequence[SamplingLane],
    video_size: tuple[int, int],
    scale: float,
    *,
    vertical_offset: int = 0,
) -> list[Any]:
    """Build boolean lane masks in analysis-video space."""
    cv2, numpy, _, _ = import_media_dependencies()
    return _lane_masks(lanes, video_size, scale, cv2, numpy, vertical_offset=vertical_offset)


def read_lane_colour_series(path: Path, masks: Sequence[Any]) -> LaneColourSeries:
    """Sample calibrated lane colours from every frame of an analysis video."""
    cv2, numpy, _, _ = import_media_dependencies()
    frames, timestamps, colours, size = _read_video(path, masks, cv2, numpy)
    return LaneColourSeries(
        timestamps=tuple(timestamps),
        colours=tuple(tuple(frame) for frame in colours),
        size=size,
        frames=tuple(frames),
    )


def write_mapping_evidence(
    reference_video: Path,
    lanes: Sequence[SamplingLane],
    video_size: tuple[int, int],
    scale: float,
    *,
    offset_pixels: int,
) -> dict[str, Any]:
    """Score and enforce that mapped lanes sit on the bright ridge of a fully lit reference."""
    cv2, numpy, _, _ = import_media_dependencies()
    return _validate_video_mapping(
        reference_video,
        lane_masks(lanes, video_size, scale),
        lane_masks(lanes, video_size, scale, vertical_offset=-offset_pixels),
        lane_masks(lanes, video_size, scale, vertical_offset=offset_pixels),
        cv2,
        numpy,
    )


def write_calibration_diagnostic(calibration_directory: Path, lanes: Sequence[SamplingLane], output: Path) -> None:
    """Write the calibration overlay that shows which pixels each lane samples."""
    cv2, numpy, _, _ = import_media_dependencies()
    _write_calibration_diagnostic(calibration_root(calibration_directory), lanes, output, cv2, numpy)


def write_contact_sheet(
    series: LaneColourSeries,
    lanes: Sequence[SamplingLane],
    scale: float,
    path: Path,
) -> None:
    """Write the sampled-frame contact sheet used to review a capture by eye."""
    cv2, numpy, image_module, image_draw_module = import_media_dependencies()
    _write_contact_sheet(
        list(series.frames),
        list(series.timestamps),
        lanes,
        scale,
        path,
        cv2,
        numpy,
        image_module,
        image_draw_module,
    )
