#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14,<3.15"
# dependencies = [
#   "numpy==2.3.2",
#   "opencv-python-headless==5.0.0.93",
#   "Pillow==12.3.0",
#   "PyYAML==6.0.3",
# ]
# ///
"""Analyse calibrated Govee scene videos as visual evidence, not protocol semantics.

The command accepts a corpus directory containing ``analysis/*.webm``, ``scenes.json``
and the saved calibration images.  It writes the large, reproducible measurements next
to that corpus.  ``--catalogue-output`` is intentionally explicit because only the
small reviewed evidence summary belongs in this repository.

Run with:

    uv run tools/ble/analyse_scene_captures.py /path/to/corpus --output /path/to/corpus/visual-analysis
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import statistics
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ANALYSIS_SCHEMA_VERSION = 1
CALIBRATION_SCHEMA_VERSION = 1
CATALOGUE_SCHEMA_VERSION = 1
SEGMENT_COUNT = 15
PRIMITIVES = (
    "static",
    "global_pulse",
    "abrupt_global_transition",
    "directional_sweep",
    "local_variation",
    "unknown",
)
PRIMITIVE_DEFINITIONS = {
    "static": "No measured temporal variation above the camera-noise threshold.",
    "global_pulse": "Periodic, spatially synchronous brightness variation.",
    "abrupt_global_transition": (
        "Short, high-magnitude aggregate lane-colour transition. It does not claim a strobe or flash effect."
    ),
    "directional_sweep": "Coherent adjacent-lane phase progression.",
    "local_variation": "Spatially non-uniform variation without coherent direction.",
    "unknown": "The strongest measured candidate did not meet the primitive evidence threshold.",
}
CLASSIFICATION_TIE_BREAK_ORDER = (
    "abrupt_global_transition",
    "directional_sweep",
    "global_pulse",
    "local_variation",
    "static",
)
CLASSIFICATION_MIN_EVIDENCE_STRENGTH = 0.7
PINNED_TOOLCHAIN = {
    "numpy": "2.3.2",
    "opencv-python-headless": "5.0.0.93",
    "Pillow": "12.3.0",
    "PyYAML": "6.0.3",
}

MAPPING_REFERENCE_SCENE_NAME = "white light"
MAPPING_REFERENCE_FRAME_COUNT = 3
MAPPING_OFFSET_PIXELS = 8
# Eight-bit ridge thresholds tolerate small registration error while rejecting the
# five-pixel vertical crop displacement measured against the White light reference.
MAPPING_MIN_LANE_BRIGHTNESS = 220.0
MAPPING_MIN_BRIGHT_LANE_FRACTION = 0.9
MAPPING_MIN_RIDGE_CONTRAST = 60.0
MAPPING_MIN_CONFIDENCE = 0.75


@dataclass(frozen=True, slots=True)
class Point:
    """A point in the calibration image coordinate system."""

    x: float
    y: float


@dataclass(frozen=True, slots=True)
class SamplingLane:
    """One physical-strip interval sampled along a calibrated centre line."""

    index: int
    start: Point
    centre: Point
    end: Point
    polyline: tuple[Point, ...]


def _distance(left: Point, right: Point) -> float:
    return math.hypot(right.x - left.x, right.y - left.y)


def _interpolate(left: Point, right: Point, fraction: float) -> Point:
    return Point(left.x + (right.x - left.x) * fraction, left.y + (right.y - left.y) * fraction)


def _point_at_distance(path: Sequence[Point], distance: float) -> Point:
    if len(path) < 2:
        raise ValueError("the strip path needs at least two points")
    remaining = max(0.0, distance)
    for left, right in zip(path[:-1], path[1:], strict=True):
        length = _distance(left, right)
        if remaining <= length or right is path[-1]:
            return _interpolate(left, right, 0.0 if length == 0 else min(1.0, remaining / length))
        remaining -= length
    return path[-1]


def _subpath(path: Sequence[Point], start: float, end: float) -> tuple[Point, ...]:
    """Return an arclength-bounded centre-line polyline."""
    if end <= start:
        raise ValueError("lane end must follow its start")
    result = [_point_at_distance(path, start)]
    walked = 0.0
    for left, right in zip(path[:-1], path[1:], strict=True):
        next_walked = walked + _distance(left, right)
        if start < next_walked < end:
            result.append(right)
        walked = next_walked
    result.append(_point_at_distance(path, end))
    return tuple(result)


def derive_sampling_lanes(path: Sequence[Point], *, segment_count: int = SEGMENT_COUNT) -> tuple[SamplingLane, ...]:
    """Split a traced strip centre line into equal-arclength sampling lanes."""
    if segment_count < 1:
        raise ValueError("segment_count must be positive")
    length = sum(_distance(left, right) for left, right in zip(path[:-1], path[1:], strict=True))
    if length <= 0:
        raise ValueError("the strip path must have positive length")
    lanes = []
    for index in range(segment_count):
        start_distance = length * index / segment_count
        end_distance = length * (index + 1) / segment_count
        lanes.append(
            SamplingLane(
                index=index,
                start=_point_at_distance(path, start_distance),
                centre=_point_at_distance(path, (start_distance + end_distance) / 2),
                end=_point_at_distance(path, end_distance),
                polyline=_subpath(path, start_distance, end_distance),
            )
        )
    return tuple(lanes)


def map_lanes_to_video(
    lanes: Sequence[SamplingLane],
    source_size: tuple[int, int],
    video_size: tuple[int, int],
) -> tuple[float, list[dict[str, Any]]]:
    """Map calibration lanes to an analysis video using its documented uniform reduction."""
    source_width, _source_height = source_size
    video_width, video_height = video_size
    scale = video_width / source_width
    if not 0.35 <= scale <= 1.0:
        raise ValueError(
            f"analysis video width {video_width} is not a plausible reduced calibration width {source_width}"
        )
    mapped_lanes: list[dict[str, Any]] = [
        {
            "index": lane.index,
            "start": [round(lane.start.x * scale, 3), round(lane.start.y * scale, 3)],
            "centre": [round(lane.centre.x * scale, 3), round(lane.centre.y * scale, 3)],
            "end": [round(lane.end.x * scale, 3), round(lane.end.y * scale, 3)],
            "polyline": [[round(point.x * scale, 3), round(point.y * scale, 3)] for point in lane.polyline],
        }
        for lane in lanes
    ]
    if any(point[1] < 0 or point[1] >= video_height for lane in mapped_lanes for point in lane["polyline"]):
        raise ValueError("calibrated strip lies outside the reduced analysis video")
    return scale, mapped_lanes


def _median(values: Sequence[float], default: float = 0.0) -> float:
    return float(statistics.median(values)) if values else default


def _mean(values: Sequence[float], default: float = 0.0) -> float:
    return float(statistics.fmean(values)) if values else default


def _percentile(values: Sequence[float], fraction: float, default: float = 0.0) -> float:
    if not values:
        return default
    ordered = sorted(values)
    position = min(len(ordered) - 1, max(0, round((len(ordered) - 1) * fraction)))
    return float(ordered[position])


def _rgb_distance(left: Sequence[float], right: Sequence[float]) -> float:
    return sum(abs(a - b) for a, b in zip(left, right, strict=True)) / 3


def _toolchain() -> dict[str, str]:
    """Return the versions that can affect image decoding and classification."""
    if sys.version_info[:2] != (3, 14):
        raise RuntimeError(f"scene analysis requires Python 3.14, not {sys.version.split()[0]}")
    versions = {name: importlib.metadata.version(name) for name in PINNED_TOOLCHAIN}
    if versions != PINNED_TOOLCHAIN:
        raise RuntimeError(f"scene analysis dependency versions differ from pinned toolchain: {versions}")
    return {"python": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}", **versions}


def _brightness(rgb: Sequence[float]) -> float:
    return max(rgb)


def _mean_rgb(frame: Sequence[Sequence[float]]) -> tuple[float, float, float]:
    return tuple(_mean([colour[channel] for colour in frame]) for channel in range(3))  # type: ignore[return-value]


def _normalise(values: Sequence[float]) -> list[float]:
    if not values:
        return []
    centre = _mean(values)
    scale = math.sqrt(_mean([(value - centre) ** 2 for value in values]))
    if scale < 1e-9:
        return [0.0] * len(values)
    return [(value - centre) / scale for value in values]


def _correlation(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) < 3 or len(left) != len(right):
        return 0.0
    normal_left = _normalise(left)
    normal_right = _normalise(right)
    return max(-1.0, min(1.0, _mean([a * b for a, b in zip(normal_left, normal_right, strict=True)])))


def _best_lag(left: Sequence[float], right: Sequence[float], maximum_lag: int) -> tuple[int, float]:
    """Return the lag where right best follows left, with positive meaning later."""
    if len(left) != len(right):
        raise ValueError("lag signals need equal lengths")
    candidates: list[tuple[int, float]] = []
    for lag in range(-maximum_lag, maximum_lag + 1):
        if lag >= 0:
            correlation = _correlation(left[: len(left) - lag] if lag else left, right[lag:] if lag else right)
        else:
            correlation = _correlation(left[-lag:], right[: len(right) + lag])
        candidates.append((lag, correlation))
    best_correlation = max(candidate[1] for candidate in candidates)
    near_best = [candidate for candidate in candidates if candidate[1] >= best_correlation - 1e-9]
    return min(near_best, key=lambda candidate: abs(candidate[0]))


def _transition_clusters(changes: Sequence[float], threshold: float, fps: float) -> list[dict[str, float | int]]:
    clusters: list[list[int]] = []
    for index, change in enumerate(changes, start=1):
        if change < threshold:
            continue
        if clusters and index - clusters[-1][-1] <= 2:
            clusters[-1].append(index)
        else:
            clusters.append([index])
    return [
        {
            "start_seconds": round(cluster[0] / fps, 4),
            "end_seconds": round(cluster[-1] / fps, 4),
            "peak_seconds": round(max(cluster, key=lambda index: changes[index - 1]) / fps, 4),
            "peak_change": round(max(changes[index - 1] for index in cluster), 3),
        }
        for cluster in clusters
    ]


def _periodicity(signal: Sequence[float], fps: float, noise: float) -> dict[str, float | int | None]:
    if len(signal) < max(12, round(fps * 3)):
        return {"period_seconds": None, "period_frames": None, "correlation": 0.0, "confidence": 0.0}
    if statistics.pstdev(signal) <= max(1.5, noise):
        return {"period_seconds": None, "period_frames": None, "correlation": 0.0, "confidence": 0.0}
    minimum_lag = max(2, round(fps * 0.5))
    maximum_lag = len(signal) // 2
    candidates = [
        (lag, _correlation(signal[:-lag], signal[lag:]))
        for lag in range(minimum_lag, maximum_lag + 1)
        if len(signal) - lag >= 8
    ]
    if not candidates:
        return {"period_seconds": None, "period_frames": None, "correlation": 0.0, "confidence": 0.0}
    lag, correlation = max(candidates, key=lambda candidate: candidate[1])
    cycles = len(signal) / lag
    confidence = max(0.0, min(1.0, correlation * min(1.0, (cycles - 1) / 2)))
    if correlation < 0.55 or cycles < 2:
        return {
            "period_seconds": None,
            "period_frames": None,
            "correlation": round(correlation, 3),
            "confidence": round(confidence, 3),
        }
    return {
        "period_seconds": round(lag / fps, 4),
        "period_frames": lag,
        "correlation": round(correlation, 3),
        "confidence": round(confidence, 3),
    }


def _select_classification(candidates: dict[str, float]) -> dict[str, Any]:
    """Select a primitive deterministically, retaining insufficient evidence as unresolved."""
    unknown_candidates = set(candidates) - set(CLASSIFICATION_TIE_BREAK_ORDER)
    if unknown_candidates:
        raise ValueError(f"classification candidates have no tie-break order: {sorted(unknown_candidates)}")
    strength = max(candidates.values())
    tied_candidates = [
        primitive
        for primitive in CLASSIFICATION_TIE_BREAK_ORDER
        if math.isclose(candidates[primitive], strength, rel_tol=0, abs_tol=1e-9)
    ]
    strongest_candidate = tied_candidates[0]
    primitive = strongest_candidate if strength >= CLASSIFICATION_MIN_EVIDENCE_STRENGTH else "unknown"
    return {
        "primitive": primitive,
        "primitive_confidence": round(strength, 3) if primitive != "unknown" else None,
        "unresolved_evidence": (
            {
                "strongest_candidate": strongest_candidate,
                "strength": round(strength, 3),
            }
            if primitive == "unknown"
            else None
        ),
        "selection": {
            "minimum_evidence_strength": CLASSIFICATION_MIN_EVIDENCE_STRENGTH,
            "tie_break_order": list(CLASSIFICATION_TIE_BREAK_ORDER),
            "tied_candidates": tied_candidates,
        },
        "candidates": {key: round(value, 3) for key, value in candidates.items()},
    }


def analyse_segment_series(
    colours: Sequence[Sequence[Sequence[float]]],
    timestamps: Sequence[float],
) -> dict[str, Any]:
    """Extract conservative temporal and spatial evidence from segment RGB samples.

    The input shape is ``frame, segment, RGB``.  This pure-Python surface is kept
    dependency-free so the classifier is testable without video or image libraries.
    """
    if len(colours) < 2 or len(colours) != len(timestamps):
        raise ValueError("at least two timestamped frames are required")
    segment_count = len(colours[0])
    if segment_count < 1 or any(len(frame) != segment_count for frame in colours):
        raise ValueError("every frame needs the same non-zero segment count")
    if any(len(colour) != 3 for frame in colours for colour in frame):
        raise ValueError("each segment colour needs three channels")
    intervals = [right - left for left, right in zip(timestamps[:-1], timestamps[1:], strict=True)]
    if any(interval <= 0 for interval in intervals):
        raise ValueError("timestamps must increase")
    fps = 1 / _median(intervals)
    by_segment = [
        [tuple(float(channel) for channel in frame[index]) for frame in colours] for index in range(segment_count)
    ]
    frame_colours = [_mean_rgb(frame) for frame in colours]
    segment_changes = [
        [_rgb_distance(left, right) for left, right in zip(series[:-1], series[1:], strict=True)]
        for series in by_segment
    ]
    all_changes = [change for changes in segment_changes for change in changes]
    low_changes = sorted(all_changes)[: max(1, len(all_changes) // 2)]
    noise = max(1.0, _median(low_changes))
    activity_threshold = max(6.0, noise * 3.5)
    segment_activity = []
    for series, changes in zip(by_segment, segment_changes, strict=True):
        centre = tuple(_median([colour[channel] for colour in series]) for channel in range(3))
        amplitude = _percentile([_rgb_distance(colour, centre) for colour in series], 0.9)
        segment_activity.append(max(_percentile(changes, 0.9), amplitude))
    dynamic_segments = [index for index, activity in enumerate(segment_activity) if activity >= activity_threshold]
    mean_brightness = [_mean([_brightness(colour) for colour in series]) for series in by_segment]
    illuminated_threshold = max(12.0, _percentile(mean_brightness, 0.2) * 0.45)
    illuminated_segments = [index for index, value in enumerate(mean_brightness) if value >= illuminated_threshold]
    aggregate_changes = [
        _rgb_distance(left, right) for left, right in zip(frame_colours[:-1], frame_colours[1:], strict=True)
    ]
    aggregate_noise = max(1.0, _median(sorted(aggregate_changes)[: max(1, len(aggregate_changes) // 2)]))
    transition_threshold = max(5.0, aggregate_noise * 3.5)
    transitions = _transition_clusters(aggregate_changes, transition_threshold, fps)
    transition_peaks = [float(item["peak_seconds"]) for item in transitions]
    transition_intervals = [
        right - left for left, right in zip(transition_peaks[:-1], transition_peaks[1:], strict=True)
    ]
    brightness = [_brightness(colour) for colour in frame_colours]
    periodicity = _periodicity(brightness, fps, aggregate_noise)

    maximum_lag = max(1, min(round(fps * 2), len(colours) // 5))
    pair_lags = []
    for index in range(segment_count - 1):
        left = [_brightness(colour) for colour in by_segment[index]]
        right = [_brightness(colour) for colour in by_segment[index + 1]]
        lag, correlation = _best_lag(left, right, maximum_lag)
        pair_lags.append(
            {
                "from_segment": index,
                "to_segment": index + 1,
                "lag_frames": lag,
                "correlation": round(correlation, 3),
            }
        )
    reliable_lags = [
        item for item in pair_lags if float(item["correlation"]) >= 0.5 and abs(int(item["lag_frames"])) >= 1
    ]
    lag_signs = [1 if int(item["lag_frames"]) > 0 else -1 for item in reliable_lags]
    median_lag = _median([float(item["lag_frames"]) for item in reliable_lags])
    consistency = max(
        (lag_signs.count(1) / len(lag_signs) if lag_signs else 0.0),
        (lag_signs.count(-1) / len(lag_signs) if lag_signs else 0.0),
    )
    phase_confidence = min(
        1.0,
        (len(reliable_lags) / max(1, segment_count - 1)) * consistency * min(1.0, abs(median_lag) / 2),
    )
    if _percentile(segment_activity, 0.8) < activity_threshold:
        reliable_lags = []
        phase_confidence = 0.0
    if phase_confidence >= 0.65:
        direction = "towards_last_segment" if median_lag > 0 else "towards_first_segment"
    elif reliable_lags and abs(median_lag) < 1:
        direction = "synchronous"
    else:
        direction = "unknown"

    global_signal = brightness
    shared_correlations = [
        _correlation([_brightness(colour) for colour in series], global_signal) for series in by_segment
    ]
    shared_correlation = _median(shared_correlations)
    transition_durations = [float(item["end_seconds"]) - float(item["start_seconds"]) + 1 / fps for item in transitions]
    abrupt_transition_candidates = [
        item
        for item, duration in zip(transitions, transition_durations, strict=True)
        if duration <= 0.5 and float(item["peak_change"]) >= transition_threshold * 2
    ]
    abrupt_transition_confidence = min(
        1.0,
        len(abrupt_transition_candidates)
        / 3
        * min(
            1.0,
            max(
                (float(item["peak_change"]) / transition_threshold for item in abrupt_transition_candidates),
                default=0.0,
            )
            / 3,
        ),
    )
    periodicity_confidence = periodicity["confidence"]
    if not isinstance(periodicity_confidence, int | float):
        raise ValueError("periodicity confidence is not numeric")
    pulse_confidence = min(
        1.0,
        float(periodicity_confidence) * max(0.0, shared_correlation) * (1.0 - phase_confidence),
    )
    spatial_brightness = [statistics.pstdev([_brightness(colour) for colour in frame]) for frame in colours]
    spatial_variation = _mean(spatial_brightness)
    temporal_variation = statistics.pstdev(global_signal)
    local_confidence = min(
        1.0,
        (len(dynamic_segments) / segment_count) * min(1.0, spatial_variation / max(8.0, temporal_variation)),
    )
    motion_confidence = phase_confidence
    static_confidence = min(
        1.0,
        max(0.0, (activity_threshold - _percentile(segment_activity, 0.8)) / activity_threshold),
    )

    candidates = {
        "static": static_confidence,
        "global_pulse": pulse_confidence,
        "abrupt_global_transition": abrupt_transition_confidence,
        "directional_sweep": motion_confidence,
        "local_variation": local_confidence,
    }
    classification = _select_classification(candidates)
    return {
        "frame_count": len(colours),
        "duration_seconds": round(timestamps[-1] - timestamps[0], 4),
        "fps": round(fps, 4),
        "sampling_confidence": round(min(1.0, _mean(mean_brightness) / 80), 3),
        "noise_floor": round(noise, 3),
        "segment_activity": [round(value, 3) for value in segment_activity],
        "active_regions": {
            "illuminated_segments": illuminated_segments,
            "dynamic_segments": dynamic_segments,
        },
        "transitions": {
            "threshold": round(transition_threshold, 3),
            "events": transitions,
            "median_interval_seconds": round(_median(transition_intervals), 4) if transition_intervals else None,
        },
        "periodicity": periodicity,
        "phase_direction": {
            "direction": direction,
            "confidence": round(phase_confidence, 3),
            "median_adjacent_lag_frames": round(median_lag, 3) if reliable_lags else None,
            "adjacent_pairs": pair_lags,
        },
        "pulse": {"confidence": round(pulse_confidence, 3), "shared_correlation": round(shared_correlation, 3)},
        "abrupt_global_transition": {
            "confidence": round(abrupt_transition_confidence, 3),
            "event_count": len(abrupt_transition_candidates),
            "events": abrupt_transition_candidates,
        },
        "local_variation": {
            "confidence": round(local_confidence, 3),
            "spatial_brightness_stddev": round(spatial_variation, 3),
        },
        "classification": classification,
    }


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _import_media_dependencies() -> tuple[Any, Any, Any, Any]:
    import cv2
    import numpy
    from PIL import Image, ImageDraw

    return cv2, numpy, Image, ImageDraw


def _colour_endpoint(image: Any, baseline: Any, colour: str, numpy: Any) -> tuple[Point, float]:
    difference = numpy.maximum(image.astype(numpy.float32) - baseline.astype(numpy.float32), 0)
    red, green, blue = (difference[:, :, index] for index in range(3))
    if colour == "red":
        signal = numpy.maximum(red - numpy.maximum(green, blue), 0)
    elif colour == "blue":
        signal = numpy.maximum(blue - numpy.maximum(red, green), 0)
    else:
        raise ValueError(f"unsupported endpoint colour {colour}")
    signal[int(signal.shape[0] * 0.3) :, :] = 0
    threshold = max(10.0, float(numpy.quantile(signal, 0.997)))
    weights = numpy.where(signal >= threshold, signal, 0)
    total = float(weights.sum())
    if total <= 0:
        raise ValueError(f"{colour} endpoint was not visible above the saved black calibration")
    ys, xs = numpy.indices(signal.shape)
    point = Point(float((xs * weights).sum() / total), float((ys * weights).sum() / total))
    concentration = total / max(1.0, float(signal.sum()))
    return point, min(1.0, concentration * 2)


def _trace_strip_path(white: Any, baseline: Any, first: Point, last: Point, cv2: Any, numpy: Any) -> tuple[Point, ...]:
    """Trace the bright calibration ridge between colour-isolated physical endpoints."""
    difference = numpy.maximum(white.astype(numpy.float32) - baseline.astype(numpy.float32), 0)
    response = difference.max(axis=2)
    top = min(
        response.shape[0],
        max(
            int(max(first.y, last.y) + response.shape[0] * 0.15),
            int(response.shape[0] * 0.18),
        ),
    )
    start_x = max(0, int(round(first.x)))
    end_x = min(response.shape[1] - 1, int(round(last.x)))
    if end_x - start_x < SEGMENT_COUNT:
        raise ValueError("calibration endpoints are too close for 15 sampling lanes")
    ridge = cv2.GaussianBlur(response[:top, start_x : end_x + 1], (15, 9), 0)
    height, width = ridge.shape
    costs = numpy.full((height, width), numpy.inf, dtype=numpy.float64)
    previous = numpy.zeros((height, width), dtype=numpy.int16)
    normalised = ridge / max(1.0, float(numpy.quantile(ridge, 0.99)))
    target_first = first.y
    target_last = last.y
    ys = numpy.arange(height)
    costs[:, 0] = -normalised[:, 0] + ((ys - target_first) / 3.5) ** 2
    for x in range(1, width):
        for y in range(height):
            low = max(0, y - 4)
            high = min(height, y + 5)
            candidate_rows = numpy.arange(low, high)
            penalties = costs[low:high, x - 1] + ((candidate_rows - y) * 0.45) ** 2
            offset = int(numpy.argmin(penalties))
            costs[y, x] = -normalised[y, x] + penalties[offset]
            previous[y, x] = low + offset
    terminal_cost = costs[:, -1] + ((ys - target_last) / 3.5) ** 2
    y = int(numpy.argmin(terminal_cost))
    path = []
    for x in range(width - 1, -1, -1):
        path.append(Point(float(start_x + x), float(y)))
        y = int(previous[y, x])
    path.reverse()
    return tuple(path)


def derive_calibration(corpus: Path, *, video_size: tuple[int, int]) -> tuple[dict[str, Any], tuple[SamplingLane, ...]]:
    """Validate saved calibration images and derive source and video-space lane geometry."""
    cv2, numpy, image_module, _ = _import_media_dependencies()
    calibration_dir = corpus / "calibration"
    required = {
        "black": calibration_dir / "00-black.png",
        "first": calibration_dir / "01-first-red.png",
        "last": calibration_dir / "02-last-blue.png",
        "white": calibration_dir / "03-all-white.png",
    }
    if missing := [str(path) for path in required.values() if not path.is_file()]:
        raise FileNotFoundError(f"saved calibration is incomplete: {', '.join(missing)}")
    images = {name: numpy.asarray(image_module.open(path).convert("RGB")) for name, path in required.items()}
    source_shape = images["black"].shape
    if any(image.shape != source_shape for image in images.values()):
        raise ValueError("saved calibration images do not share one image size")
    first, first_confidence = _colour_endpoint(images["first"], images["black"], "red", numpy)
    last, last_confidence = _colour_endpoint(images["last"], images["black"], "blue", numpy)
    if last.x <= first.x:
        raise ValueError("saved first/last endpoint calibration is reversed or ambiguous")
    path = _trace_strip_path(images["white"], images["black"], first, last, cv2, numpy)
    lanes = derive_sampling_lanes(path)
    source_height, source_width = source_shape[:2]
    scale, video_lanes = map_lanes_to_video(lanes, (source_width, source_height), video_size)
    white_signal = numpy.maximum(
        images["white"].astype(numpy.float32) - images["black"].astype(numpy.float32),
        0,
    ).max(axis=2)
    path_values = [white_signal[round(point.y), round(point.x)] for point in path]
    background_values = white_signal[int(source_height * 0.35) :, :].reshape(-1)
    ridge_contrast = max(
        0.0,
        _median([float(value) for value in path_values]) - float(numpy.quantile(background_values, 0.95)),
    )
    if ridge_contrast < 30:
        raise ValueError("saved all-white calibration does not isolate a stable strip ridge")
    calibration = {
        "schema_version": CALIBRATION_SCHEMA_VERSION,
        "images": {name: {"file": path.name, "sha256": _sha256(path)} for name, path in required.items()},
        "source_size": [source_width, source_height],
        "analysis_video_size": list(video_size),
        "uniform_scale": round(scale, 8),
        "endpoint_confidence": {"first": round(first_confidence, 3), "last": round(last_confidence, 3)},
        "ridge_contrast": round(ridge_contrast, 3),
        "lane_count": len(lanes),
        "lanes": video_lanes,
    }
    return calibration, lanes


def _lane_masks(
    lanes: Sequence[SamplingLane],
    video_size: tuple[int, int],
    scale: float,
    cv2: Any,
    numpy: Any,
    *,
    vertical_offset: int = 0,
) -> list[Any]:
    width, height = video_size
    radius = max(2, round(5 * scale))
    masks = []
    for lane in lanes:
        mask = numpy.zeros((height, width), dtype=numpy.uint8)
        points = numpy.asarray(
            [[round(point.x * scale), round(point.y * scale) + vertical_offset] for point in lane.polyline],
            dtype=numpy.int32,
        )
        cv2.polylines(mask, [points], False, 255, thickness=radius * 2 + 1, lineType=cv2.LINE_AA)
        masks.append(mask.astype(bool))
    return masks


def _sample_lane_colours(frame: Any, masks: Sequence[Any], numpy: Any) -> list[tuple[float, float, float]]:
    rgb = frame[:, :, ::-1].astype(numpy.float32)
    colours = []
    for mask in masks:
        pixels = rgb[mask]
        if len(pixels) == 0:
            raise ValueError("a calibrated lane mask did not cover the analysis frame")
        brightness = pixels.max(axis=1)
        chroma = pixels.max(axis=1) - pixels.min(axis=1)
        score = brightness + chroma * 0.45
        threshold = float(numpy.quantile(score, 0.65))
        selected = pixels[score >= threshold]
        median = numpy.median(selected, axis=0)
        colours.append((float(median[0]), float(median[1]), float(median[2])))
    return colours


def assess_video_mapping(
    lane_brightness: Sequence[Sequence[float]],
    upper_offset_brightness: Sequence[Sequence[float]],
    lower_offset_brightness: Sequence[Sequence[float]],
) -> dict[str, Any]:
    """Score whether mapped lanes align with a bright strip ridge in reference frames."""
    frame_sets = (lane_brightness, upper_offset_brightness, lower_offset_brightness)
    if not lane_brightness or any(len(values) != len(lane_brightness) for values in frame_sets):
        raise ValueError("video mapping evidence needs equally sampled non-empty frame sets")
    lane_count = len(lane_brightness[0])
    if lane_count != SEGMENT_COUNT or any(len(frame) != lane_count for values in frame_sets for frame in values):
        raise ValueError(f"video mapping evidence needs {SEGMENT_COUNT} values for every frame")
    lane_medians = [_median([frame[index] for frame in lane_brightness]) for index in range(lane_count)]
    mapped_brightness = _median(lane_medians)
    upper_brightness = _median([value for frame in upper_offset_brightness for value in frame])
    lower_brightness = _median([value for frame in lower_offset_brightness for value in frame])
    ridge_contrast = mapped_brightness - _mean((upper_brightness, lower_brightness))
    bright_lane_fraction = _mean(
        [1.0 if brightness >= MAPPING_MIN_LANE_BRIGHTNESS else 0.0 for brightness in lane_medians]
    )
    confidence = min(
        1.0,
        bright_lane_fraction
        * min(1.0, mapped_brightness / MAPPING_MIN_LANE_BRIGHTNESS)
        * min(1.0, ridge_contrast / MAPPING_MIN_RIDGE_CONTRAST),
    )
    return {
        "frame_count": len(lane_brightness),
        "lane_median_brightness": [round(value, 3) for value in lane_medians],
        "median_lane_brightness": round(mapped_brightness, 3),
        "bright_lane_fraction": round(bright_lane_fraction, 3),
        "ridge_contrast": round(ridge_contrast, 3),
        "confidence": round(confidence, 3),
        "thresholds": {
            "minimum_lane_brightness": MAPPING_MIN_LANE_BRIGHTNESS,
            "minimum_bright_lane_fraction": MAPPING_MIN_BRIGHT_LANE_FRACTION,
            "minimum_ridge_contrast": MAPPING_MIN_RIDGE_CONTRAST,
            "minimum_confidence": MAPPING_MIN_CONFIDENCE,
        },
    }


def validate_video_mapping(metrics: dict[str, Any]) -> None:
    """Reject a width-compatible video crop that does not visually align with calibration lanes."""
    failures = []
    if float(metrics["median_lane_brightness"]) < MAPPING_MIN_LANE_BRIGHTNESS:
        failures.append(f"median brightness {metrics['median_lane_brightness']} < {MAPPING_MIN_LANE_BRIGHTNESS}")
    if float(metrics["bright_lane_fraction"]) < MAPPING_MIN_BRIGHT_LANE_FRACTION:
        failures.append(f"bright lane fraction {metrics['bright_lane_fraction']} < {MAPPING_MIN_BRIGHT_LANE_FRACTION}")
    if float(metrics["ridge_contrast"]) < MAPPING_MIN_RIDGE_CONTRAST:
        failures.append(f"ridge contrast {metrics['ridge_contrast']} < {MAPPING_MIN_RIDGE_CONTRAST}")
    if float(metrics["confidence"]) < MAPPING_MIN_CONFIDENCE:
        failures.append(f"confidence {metrics['confidence']} < {MAPPING_MIN_CONFIDENCE}")
    if failures:
        raise ValueError(f"video mapping does not match calibrated strip evidence: {'; '.join(failures)}")


def _mapping_reference_video(scene_by_stem: dict[str, dict[str, Any]], videos: Sequence[Path]) -> Path:
    video_by_stem = {video.stem: video for video in videos}
    matches = [
        video_by_stem[stem]
        for stem, scene in scene_by_stem.items()
        if str(scene.get("name", "")).casefold() == MAPPING_REFERENCE_SCENE_NAME and stem in video_by_stem
    ]
    if len(matches) != 1:
        raise ValueError(f"expected one {MAPPING_REFERENCE_SCENE_NAME!r} mapping reference video, found {len(matches)}")
    return matches[0]


def _validate_video_mapping(
    reference_video: Path,
    lane_masks: Sequence[Any],
    upper_offset_masks: Sequence[Any],
    lower_offset_masks: Sequence[Any],
    cv2: Any,
    numpy: Any,
) -> dict[str, Any]:
    capture = cv2.VideoCapture(str(reference_video))
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count < MAPPING_REFERENCE_FRAME_COUNT:
        capture.release()
        raise ValueError(f"{reference_video} has too few frames for mapping validation")
    frame_indexes = sorted(
        {
            round(index * (frame_count - 1) / (MAPPING_REFERENCE_FRAME_COUNT - 1))
            for index in range(MAPPING_REFERENCE_FRAME_COUNT)
        }
    )
    values: list[list[list[float]]] = [[], [], []]
    for frame_index in frame_indexes:
        capture.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        ok, frame = capture.read()
        if not ok:
            capture.release()
            raise ValueError(f"{reference_video} cannot read mapping validation frame {frame_index}")
        brightness = frame[:, :, ::-1].max(axis=2).astype(numpy.float32)
        for target, masks in zip(values, (lane_masks, upper_offset_masks, lower_offset_masks), strict=True):
            target.append([float(numpy.median(brightness[mask])) for mask in masks])
    capture.release()
    metrics = assess_video_mapping(values[0], values[1], values[2])
    metrics["reference_video"] = reference_video.name
    metrics["frame_indexes"] = frame_indexes
    validate_video_mapping(metrics)
    return metrics


def _write_contact_sheet(
    frames: Sequence[Any],
    timestamps: Sequence[float],
    lanes: Sequence[SamplingLane],
    scale: float,
    path: Path,
    cv2: Any,
    numpy: Any,
    image_module: Any,
    image_draw_module: Any,
) -> None:
    selected_count = min(12, len(frames))
    selected = [round(value * (len(frames) - 1) / min(11, len(frames) - 1)) for value in range(selected_count)]
    tiles = []
    for index in selected:
        tile = frames[index].copy()
        for lane in lanes:
            points = [[round(point.x * scale), round(point.y * scale)] for point in lane.polyline]
            cv2.polylines(tile, [numpy.asarray(points, dtype=numpy.int32)], False, (0, 255, 255), 1)
        tiles.append(image_module.fromarray(cv2.cvtColor(tile, cv2.COLOR_BGR2RGB)))
    columns = 4
    rows = math.ceil(len(tiles) / columns)
    width, height = tiles[0].size
    sheet = image_module.new("RGB", (width * columns, height * rows), "black")
    draw = image_draw_module.Draw(sheet)
    for position, (index, tile) in enumerate(zip(selected, tiles, strict=True)):
        x = position % columns * width
        y = position // columns * height
        sheet.paste(tile, (x, y))
        draw.text((x + 2, y + 2), f"{timestamps[index]:.1f}s", fill="white", stroke_width=1, stroke_fill="black")
    sheet.save(path, quality=90)


def _write_calibration_diagnostic(
    corpus: Path,
    lanes: Sequence[SamplingLane],
    output: Path,
    cv2: Any,
    numpy: Any,
) -> None:
    _, _, image_module, _ = _import_media_dependencies()
    image = numpy.asarray(image_module.open(corpus / "calibration" / "03-all-white.png").convert("RGB"))[
        :, :, ::-1
    ].copy()
    for lane in lanes:
        points = numpy.asarray([[round(point.x), round(point.y)] for point in lane.polyline], dtype=numpy.int32)
        cv2.polylines(image, [points], False, (0, 255, 255), 3)
        centre = (round(lane.centre.x), round(lane.centre.y))
        cv2.putText(image, str(lane.index), centre, cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 3, cv2.LINE_AA)
        cv2.putText(image, str(lane.index), centre, cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 0), 1, cv2.LINE_AA)
    cv2.imwrite(str(output), image)


def _read_video(
    path: Path,
    masks: Sequence[Any],
    cv2: Any,
    numpy: Any,
) -> tuple[list[Any], list[float], list[list[tuple[float, float, float]]], tuple[int, int]]:
    capture = cv2.VideoCapture(str(path))
    fps = float(capture.get(cv2.CAP_PROP_FPS))
    frames: list[Any] = []
    timestamps: list[float] = []
    colours: list[list[tuple[float, float, float]]] = []
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        frame_index = len(frames)
        timestamp = float(capture.get(cv2.CAP_PROP_POS_MSEC) / 1000)
        if timestamp <= (timestamps[-1] if timestamps else -1):
            timestamp = frame_index / fps if fps > 0 else float(frame_index)
        frames.append(frame)
        timestamps.append(timestamp)
        colours.append(_sample_lane_colours(frame, masks, numpy))
    capture.release()
    if len(frames) < 2 or fps <= 0:
        raise ValueError(f"{path} does not contain a usable video stream")
    height, width = frames[0].shape[:2]
    if any(frame.shape[:2] != (height, width) for frame in frames):
        raise ValueError(f"{path} changes dimensions between frames")
    return frames, timestamps, colours, (width, height)


def _scene_index(corpus: Path) -> dict[str, dict[str, Any]]:
    scenes_path = corpus / "scenes.json"
    scenes = json.loads(scenes_path.read_text(encoding="utf-8"))
    if not isinstance(scenes, list):
        raise ValueError("scenes.json must contain a list")
    indexed = {str(scene["stem"]): scene for scene in scenes}
    if len(indexed) != len(scenes):
        raise ValueError("scenes.json contains duplicate video stems")
    return indexed


def _catalogue_row(scene: dict[str, Any], feature: dict[str, Any], video_hash: str) -> dict[str, Any]:
    classification = feature["classification"]
    return {
        "sku": "H617A",
        "scene_id": int(scene["scene_id"]),
        "effect_id": int(scene["effect_id"]),
        "source": {"stem": scene["stem"], "analysis_video_sha256": video_hash},
        "observation": {
            "primitive": classification["primitive"],
            "automated_primitive_confidence": classification["primitive_confidence"],
            "unresolved_evidence": classification["unresolved_evidence"],
            "review_state": "pending_human_review",
            "review_confidence": None,
            "active_segments": feature["active_regions"]["dynamic_segments"],
            "direction": feature["phase_direction"]["direction"],
            "period_seconds": feature["periodicity"]["period_seconds"],
        },
    }


def _write_catalogue(
    path: Path,
    corpus: Path,
    calibration: dict[str, Any],
    records: Sequence[dict[str, Any]],
    analysis_results_sha256: str,
    analysis_calibration_sha256: str,
) -> None:
    import yaml  # type: ignore[import-untyped]

    data = {
        "schema_version": CATALOGUE_SCHEMA_VERSION,
        "purpose": (
            "Observed visual behaviour from calibrated camera captures. "
            "This evidence does not describe BLE wire semantics."
        ),
        "primitive_values": list(PRIMITIVES),
        "primitive_definitions": PRIMITIVE_DEFINITIONS,
        "corpus": {
            "id": corpus.name,
            "scenes_manifest_sha256": _sha256(corpus / "scenes.json"),
            "capture_results_sha256": _sha256(corpus / "results.jsonl"),
            "calibration_sha256": hashlib.sha256(
                json.dumps(calibration, sort_keys=True, separators=(",", ":")).encode()
            ).hexdigest(),
            "analysis_results_sha256": analysis_results_sha256,
            "analysis_calibration_sha256": analysis_calibration_sha256,
            "analysis_tool_sha256": _sha256(Path(__file__)),
            "toolchain": calibration["toolchain"],
        },
        "evidence": sorted(records, key=lambda item: (item["sku"], item["scene_id"], item["effect_id"])),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=180), encoding="utf-8")


def analyse_corpus(corpus: Path, output: Path, catalogue_output: Path | None = None) -> dict[str, Any]:
    """Run all video analysis and return a compact deterministic summary."""
    toolchain = _toolchain()
    cv2, numpy, image_module, image_draw_module = _import_media_dependencies()
    scene_by_stem = _scene_index(corpus)
    videos = sorted((corpus / "analysis").glob("*.webm"))
    video_stems = {path.stem for path in videos}
    if video_stems != set(scene_by_stem):
        missing = sorted(set(scene_by_stem) - video_stems)
        extra = sorted(video_stems - set(scene_by_stem))
        raise ValueError(f"analysis videos and scenes.json disagree: missing={missing}, extra={extra}")
    probe = cv2.VideoCapture(str(videos[0]))
    video_size = (int(probe.get(cv2.CAP_PROP_FRAME_WIDTH)), int(probe.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    probe.release()
    calibration, lanes = derive_calibration(corpus, video_size=video_size)
    calibration["toolchain"] = toolchain
    output.mkdir(parents=True, exist_ok=True)
    contact_sheets = output / "contact-sheets"
    diagnostics = output / "diagnostics"
    contact_sheets.mkdir(exist_ok=True)
    diagnostics.mkdir(exist_ok=True)
    _write_calibration_diagnostic(corpus, lanes, diagnostics / "calibration-lanes.png", cv2, numpy)
    masks = _lane_masks(lanes, video_size, float(calibration["uniform_scale"]), cv2, numpy)
    mapping_metrics = _validate_video_mapping(
        _mapping_reference_video(scene_by_stem, videos),
        masks,
        _lane_masks(
            lanes,
            video_size,
            float(calibration["uniform_scale"]),
            cv2,
            numpy,
            vertical_offset=-MAPPING_OFFSET_PIXELS,
        ),
        _lane_masks(
            lanes,
            video_size,
            float(calibration["uniform_scale"]),
            cv2,
            numpy,
            vertical_offset=MAPPING_OFFSET_PIXELS,
        ),
        cv2,
        numpy,
    )
    calibration["video_mapping"] = mapping_metrics
    results_path = output / "results.jsonl"
    catalogue_rows = []
    primitive_counts = {primitive: 0 for primitive in PRIMITIVES}
    with results_path.open("w", encoding="utf-8") as stream:
        for video in videos:
            frames, timestamps, colours, actual_size = _read_video(video, masks, cv2, numpy)
            if actual_size != video_size:
                raise ValueError(f"{video} does not match the corpus analysis dimensions")
            feature = analyse_segment_series(colours, timestamps)
            video_hash = _sha256(video)
            scene = scene_by_stem[video.stem]
            record = {
                "schema_version": ANALYSIS_SCHEMA_VERSION,
                "sku": "H617A",
                "scene_id": int(scene["scene_id"]),
                "effect_id": int(scene["effect_id"]),
                "source": {
                    "stem": video.stem,
                    "analysis_video": video.name,
                    "analysis_video_sha256": video_hash,
                    "scene_manifest_sha256": _sha256(corpus / "scenes.json"),
                },
                "sampling": {
                    "lane_count": len(lanes),
                    "colours_rgb": [[[round(value, 2) for value in colour] for colour in frame] for frame in colours],
                    "timestamps_seconds": [round(timestamp, 4) for timestamp in timestamps],
                },
                "features": feature,
            }
            stream.write(json.dumps(record, sort_keys=True, separators=(",", ":")) + "\n")
            _write_contact_sheet(
                frames,
                timestamps,
                lanes,
                float(calibration["uniform_scale"]),
                contact_sheets / f"{video.stem}.jpg",
                cv2,
                numpy,
                image_module,
                image_draw_module,
            )
            catalogue_rows.append(_catalogue_row(scene, feature, video_hash))
            primitive_counts[feature["classification"]["primitive"]] += 1
    calibration_path = output / "calibration.json"
    calibration_path.write_text(json.dumps(calibration, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    summary = {
        "schema_version": ANALYSIS_SCHEMA_VERSION,
        "corpus": corpus.name,
        "video_count": len(videos),
        "toolchain": toolchain,
        "calibration": {"file": calibration_path.name, "sha256": _sha256(calibration_path)},
        "results": {"file": results_path.name, "sha256": _sha256(results_path)},
        "classification_counts": primitive_counts,
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if catalogue_output is not None:
        _write_catalogue(
            catalogue_output,
            corpus,
            calibration,
            catalogue_rows,
            _sha256(results_path),
            _sha256(calibration_path),
        )
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("corpus", type=Path, help="External capture corpus root")
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="External directory for generated measurements and images",
    )
    parser.add_argument(
        "--catalogue-output",
        type=Path,
        help="Explicit path for the compact curated visual-evidence catalogue",
    )
    args = parser.parse_args()
    summary = analyse_corpus(args.corpus, args.output, args.catalogue_output)
    print(json.dumps(summary, sort_keys=True))


if __name__ == "__main__":
    main()
