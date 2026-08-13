"""Derive smooth-preview motion evidence from labelled lane series.

Every measurement here describes what the camera saw: which palette label sat on which
lane at which time.  None of it claims a wire field, a parameter value or a speed
calibration.  Where the evidence does not resolve, the feature says ``unknown`` rather than
picking the most likely of several readings.

The input is the label grid from :mod:`tools.ble.animation_colour`, so a colour-only motion
at constant brightness is measured as motion.  Brightness-driven measurement would miss it,
which is exactly the case the colour-first campaign exists to cover.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from tools.ble.animation_colour import BLACK_LABEL, UNKNOWN_LABEL, ColourTracking
from tools.ble.capture_analysis import best_lag, mean, median, percentile

DIRECTION_VALUES = (
    "towards_first_segment",
    "towards_last_segment",
    "bidirectional",
    "stationary",
    "unknown",
)
PATH_VALUES = ("wrapping", "bouncing", "open", "stationary", "unknown")
TRANSITION_SHAPES = ("step", "fade", "mixed", "unknown")
MOVEMENT_DOMAINS = ("none", "within_active_region", "whole_strip", "unknown")
PALETTE_ORDER_RELATIONS = (
    "authored_order",
    "reversed_authored_order",
    "other_permutation",
    "single_label",
    "unknown",
)
CONTINUITY_VALUES = ("continuous", "reset", "unknown")
BOUNDARY_SHAPES = ("cut", "crossfade", "blackout", "unknown")

BACKGROUND_MINIMUM_COVERAGE = 0.4
BACKGROUND_MINIMUM_PRESENCE = 0.9
SHIFT_STRIDES = (1, 2, 3, 5, 8, 12, 20)
BACKGROUND_MATCH_WEIGHT = 0.15
CONTINUOUS_LIT_FRACTION = 0.9
DIRECTION_MINIMUM_CONSISTENCY = 0.7
BIDIRECTIONAL_BALANCE = 0.35
FADE_TRANSITION_FRAMES = 2.0
MIXED_SHAPE_FRACTION = 0.3
PLATEAU_TOLERANCE = 0.2
PERIODICITY_MINIMUM_RISE = 0.15
PERIODICITY_PEAK_TOLERANCE = 0.03
PERIODICITY_DIP_HYSTERESIS = 0.02
MINIMUM_PERIOD_CORRELATION = 0.55
MINIMUM_STATE_DWELL_SECONDS = 0.6
STATE_BOUNDARY_MINIMUM_CHANGE = 0.25
LAYER_OVERLAP_MINIMUM = 0.05

SETTLING_SECONDS = 2.0
MINIMUM_CYCLES = 3
ANALYSED_FLOOR_SECONDS = 8.0
DURATION_MARGIN_SECONDS = 1.0
MINIMUM_DURATION_SECONDS = 10.0
MAXIMUM_DURATION_SECONDS = 25.0
UNRESOLVED_DURATION_SECONDS = 20.0
DURATION_QUANTUM_SECONDS = 0.5


def _fps(timestamps: Sequence[float]) -> float:
    intervals = [right - left for left, right in zip(timestamps[:-1], timestamps[1:], strict=True)]
    if not intervals or any(interval <= 0 for interval in intervals):
        raise ValueError("timestamps must increase")
    return 1 / median(intervals)


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _frame_presence(labels: Sequence[Sequence[str]], label: str) -> float:
    """Return the fraction of frames the label appears in at all."""
    if not labels:
        return 0.0
    return sum(1 for frame in labels if label in frame) / len(labels)


def background_state(tracking: ColourTracking) -> dict[str, Any]:
    """Identify the label the strip rests at, which may be black or a lit colour.

    A lit colour is a background only when it is there in nearly every frame.  A strip that
    shows one colour at a time covers most of its samples with whichever colour it dwells on
    longest, and calling that colour the background would hide the effect drawn on top of it.
    """
    coverage = tracking.label_coverage()
    unknown = {
        "label": UNKNOWN_LABEL,
        "palette_index": None,
        "is_black": False,
        "coverage": 0.0,
        "presence": 0.0,
        "state": "unknown",
    }
    if not coverage:
        return unknown
    label, fraction = max(coverage.items(), key=lambda item: (item[1], item[0] == BLACK_LABEL, item[0]))
    presence = _frame_presence(tracking.labels, label)
    if fraction < BACKGROUND_MINIMUM_COVERAGE:
        return {**unknown, "coverage": round(fraction, 4), "presence": round(presence, 4)}
    if label != BLACK_LABEL and presence < BACKGROUND_MINIMUM_PRESENCE:
        return {**unknown, "coverage": round(fraction, 4), "presence": round(presence, 4), "state": "none"}
    palette_index = next(
        (cluster.palette_index for cluster in tracking.clusters if cluster.label == label),
        None,
    )
    return {
        "label": label,
        "palette_index": palette_index,
        "is_black": label == BLACK_LABEL,
        "coverage": round(fraction, 4),
        "presence": round(presence, 4),
        "state": "black" if label == BLACK_LABEL else "lit",
    }


def _runs(frame: Sequence[str], background: str, *, wrap: bool) -> list[tuple[int, int, str]]:
    """Return contiguous same-label foreground runs as ``(start, length, label)``."""
    lane_count = len(frame)
    runs: list[tuple[int, int, str]] = []
    index = 0
    while index < lane_count:
        label = frame[index]
        if label == background:
            index += 1
            continue
        end = index
        while end + 1 < lane_count and frame[end + 1] == label:
            end += 1
        runs.append((index, end - index + 1, label))
        index = end + 1
    if wrap and len(runs) > 1:
        first = runs[0]
        last = runs[-1]
        if first[0] == 0 and last[0] + last[1] == lane_count and first[2] == last[2]:
            runs = runs[1:-1] + [(last[0], last[1] + first[1], last[2])]
    return runs


def _match_score(left: Sequence[str], right: Sequence[str], shift: int, background: str, *, wrap: bool) -> float:
    lane_count = len(left)
    score = 0.0
    total = 0.0
    for index, label in enumerate(left):
        target = index + shift
        if wrap:
            target %= lane_count
        elif not 0 <= target < lane_count:
            continue
        weight = 1.0 if label != background else BACKGROUND_MATCH_WEIGHT
        total += weight
        if right[target] == label:
            score += weight
    return score / total if total else 0.0


def _best_shift(
    left: Sequence[str],
    right: Sequence[str],
    maximum_shift: int,
    background: str,
    *,
    wrap: bool,
) -> tuple[int, float]:
    best_shift = 0
    best_score = -1.0
    for shift in sorted(range(-maximum_shift, maximum_shift + 1), key=lambda value: (abs(value), value)):
        score = _match_score(left, right, shift, background, wrap=wrap)
        if score > best_score:
            best_shift, best_score = shift, score
    return best_shift, best_score


def _shift_series(
    labels: Sequence[Sequence[str]],
    background: str,
    stride: int,
    maximum_shift: int,
    *,
    wrap: bool,
) -> list[tuple[int, float]]:
    return [
        _best_shift(labels[index], labels[index + stride], maximum_shift, background, wrap=wrap)
        for index in range(0, len(labels) - stride)
    ]


def _first_dip(agreements: dict[int, float], maximum_lag: int) -> int:
    """Return the first lag the agreement stops falling at.

    The search floor has to be the first dip rather than the lowest point anywhere: the
    longest lags overlap the fewest frames, so their agreement is the noisiest, and a floor
    taken from there would push the peak search past every real period.
    """
    dip_lag = 1
    lowest = agreements[1]
    for lag in range(2, maximum_lag + 1):
        value = agreements[lag]
        if value < lowest:
            dip_lag, lowest = lag, value
        elif value > lowest + PERIODICITY_DIP_HYSTERESIS:
            break
    return dip_lag


def label_periodicity(labels: Sequence[Sequence[str]], timestamps: Sequence[float]) -> dict[str, Any]:
    """Autocorrelate the label grid, so colour-only cycles are measured as periodic.

    A repeat has to be a return, so the peak is only read after the agreement has fallen
    away from it.  Without that, a long dwell reports its own frame rate: every short lag
    inside one held colour agrees with itself, which looks like a fast cycle and is not one.
    """
    frames = len(labels)
    fps = _fps(timestamps)
    result: dict[str, Any] = {
        "period_seconds": None,
        "period_frames": None,
        "correlation": 0.0,
        "rise_from_dip": 0.0,
        "confidence": 0.0,
    }
    if frames < max(12, round(fps * 3)):
        return result
    counts: dict[str, int] = {}
    for frame in labels:
        for label in frame:
            counts[label] = counts.get(label, 0) + 1
    total = sum(counts.values())
    chance = sum((count / total) ** 2 for count in counts.values())
    if chance >= 0.999:
        return result
    minimum_lag = max(2, round(fps * 0.3))
    maximum_lag = frames // 2
    if maximum_lag <= minimum_lag:
        return result
    agreements = {
        lag: (
            mean(
                [
                    sum(1 for left, right in zip(labels[index], labels[index + lag], strict=True) if left == right)
                    / len(labels[index])
                    for index in range(frames - lag)
                ]
            )
            - chance
        )
        / (1 - chance)
        for lag in range(1, maximum_lag + 1)
    }
    dip_lag = _first_dip(agreements, maximum_lag)
    candidates = [lag for lag in range(max(minimum_lag, dip_lag), maximum_lag + 1)]
    if not candidates:
        return result
    peak = max(agreements[lag] for lag in candidates)
    # Every multiple of a period agrees as well as the period, so the shortest lag that is
    # indistinguishable from the peak is the reading; the longer ones are the same cycle counted twice.
    best_lag_frames = min(lag for lag in candidates if agreements[lag] >= peak - PERIODICITY_PEAK_TOLERANCE)
    best_correlation = agreements[best_lag_frames]
    rise = best_correlation - agreements[dip_lag]
    cycles = frames / best_lag_frames if best_lag_frames else 0.0
    confidence = _clamp(best_correlation * min(1.0, (cycles - 1) / 2) * min(1.0, rise / PERIODICITY_MINIMUM_RISE))
    result["correlation"] = round(best_correlation, 3)
    result["rise_from_dip"] = round(rise, 3)
    result["confidence"] = round(confidence, 3)
    if best_correlation >= MINIMUM_PERIOD_CORRELATION and cycles >= 2 and rise >= PERIODICITY_MINIMUM_RISE:
        result["period_frames"] = best_lag_frames
        result["period_seconds"] = round(best_lag_frames / fps, 4)
    return result


@dataclass(frozen=True)
class _ShiftEvidence:
    """One stride's frame-to-frame lane shifts and how well the shifted frames matched."""

    stride_frames: int
    shifts: list[int]
    scores: list[float]
    moving_fraction: float
    median_shift: float


def _movement_evidence(
    labels: Sequence[Sequence[str]],
    timestamps: Sequence[float],
    background: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Measure direction and path together, because both read the same shift series.

    Displacement comes from consecutive frames, where a tie resolves to no movement, so a
    slow effect accumulates its travel instead of rounding it away.  Matching across the seam
    keeps counting a band that leaves one end and re-enters at the other, which is the travel
    the eye follows; the same measurement without the seam is kept as the wrap evidence.
    Direction consistency comes from the shortest stride that actually moves a whole lane,
    because a stride that never does reports noise.
    """
    lane_count = len(labels[0])
    fps = _fps(timestamps)
    duration = timestamps[-1] - timestamps[0]
    maximum_shift = max(1, lane_count // 3)
    unit = _shift_series(labels, background, 1, maximum_shift, wrap=True)
    displacement = sum(shift for shift, _ in unit)
    open_displacement = sum(shift for shift, _ in _shift_series(labels, background, 1, maximum_shift, wrap=False))
    chosen: _ShiftEvidence | None = None
    for stride in SHIFT_STRIDES:
        if stride >= len(labels):
            break
        series = _shift_series(labels, background, stride, maximum_shift, wrap=False)
        if not series:
            continue
        shifts = [shift for shift, _ in series]
        moving = [shift for shift in shifts if shift != 0]
        candidate = _ShiftEvidence(
            stride_frames=stride,
            shifts=shifts,
            scores=[score for _, score in series],
            moving_fraction=len(moving) / len(shifts),
            median_shift=median([float(shift) for shift in moving]) if moving else 0.0,
        )
        if chosen is None or abs(candidate.median_shift) > abs(chosen.median_shift):
            chosen = candidate
        if abs(candidate.median_shift) >= 1 and candidate.moving_fraction >= 0.5:
            chosen = candidate
            break
    if chosen is None:
        unknown = {
            "direction": "unknown",
            "confidence": 0.0,
            "stride_frames": None,
            "speed_lanes_per_second": None,
            "wrap": False,
            "sign_consistency": 0.0,
            "moving_fraction": 0.0,
            "total_displacement_lanes": 0,
        }
        return unknown, {"path": "unknown", "confidence": 0.0, "sign_reversals": 0, "continuously_lit": False}
    shifts = list(chosen.shifts)
    moving = [shift for shift in shifts if shift != 0]
    forward = sum(1 for shift in moving if shift > 0)
    backward = len(moving) - forward
    dominant = max(forward, backward)
    consistency = dominant / len(moving) if moving else 0.0
    balance = min(forward, backward) / dominant if dominant else 0.0
    agreement = mean(chosen.scores)
    moving_fraction = chosen.moving_fraction
    unit_shifts = [shift for shift, _ in unit]
    reversals = _sign_reversals(unit_shifts)
    lit_fraction = mean([1.0 if any(label != background for label in frame) else 0.0 for frame in labels])
    if not moving or moving_fraction < 0.1:
        direction = "stationary"
        confidence = _clamp(agreement)
        speed = None
    elif balance >= BIDIRECTIONAL_BALANCE:
        direction = "bidirectional"
        confidence = _clamp(agreement * min(1.0, len(moving) / max(1, len(shifts))))
        speed = mean([abs(float(shift)) for shift in unit_shifts]) * fps
    elif consistency >= DIRECTION_MINIMUM_CONSISTENCY:
        direction = "towards_last_segment" if forward > backward else "towards_first_segment"
        confidence = _clamp(consistency * agreement * min(1.0, moving_fraction / 0.5))
        speed = abs(displacement) / duration if duration > 0 else None
    else:
        direction = "unknown"
        confidence = 0.0
        speed = None
    if direction in {"stationary", "unknown"}:
        path = {"path": direction, "confidence": round(confidence, 3), "sign_reversals": reversals}
    elif (
        direction != "bidirectional"
        and abs(displacement) >= lane_count
        and reversals <= 1
        and lit_fraction >= CONTINUOUS_LIT_FRACTION
    ):
        path = {"path": "wrapping", "confidence": round(confidence, 3), "sign_reversals": reversals}
    elif reversals >= 2:
        path = {"path": "bouncing", "confidence": round(confidence, 3), "sign_reversals": reversals}
    else:
        path = {"path": "open", "confidence": round(_clamp(confidence * 0.9), 3), "sign_reversals": reversals}
    path["continuously_lit"] = lit_fraction >= CONTINUOUS_LIT_FRACTION
    return (
        {
            "direction": direction,
            "confidence": round(confidence, 3),
            "stride_frames": chosen.stride_frames,
            "speed_lanes_per_second": round(speed, 3) if speed is not None else None,
            "wrap": path["path"] == "wrapping",
            "sign_consistency": round(consistency, 3),
            "moving_fraction": round(moving_fraction, 3),
            "total_displacement_lanes": displacement,
            "displacement_without_seam_lanes": open_displacement,
        },
        path,
    )


def _sign_reversals(shifts: Sequence[int]) -> int:
    """Count direction changes, ignoring the pauses a slow effect spends between lanes."""
    reversals = 0
    previous = 0
    for shift in shifts:
        sign = 1 if shift > 0 else (-1 if shift < 0 else 0)
        if sign and previous and sign != previous:
            reversals += 1
        previous = sign or previous
    return reversals


def _band_evidence(labels: Sequence[Sequence[str]], background: str, *, wrap: bool) -> dict[str, Any]:
    lane_count = len(labels[0])
    per_frame = [_runs(frame, background, wrap=wrap) for frame in labels]
    counts = [float(len(runs)) for runs in per_frame]
    widths = [float(width) for runs in per_frame for _, width, _ in runs]
    lit_fraction = [sum(width for _, width, _ in runs) / lane_count for runs in per_frame]
    lane_duty = [mean([1.0 if frame[lane] != background else 0.0 for frame in labels]) for lane in range(lane_count)]
    return {
        "simultaneous_band_count": int(round(median(counts))) if counts else 0,
        "band_count_range": [int(min(counts)), int(max(counts))] if counts else [0, 0],
        "band_width_lanes": round(median(widths), 3) if widths else 0.0,
        "band_width_range": [int(min(widths)), int(max(widths))] if widths else [0, 0],
        "duty_cycle": round(mean(lit_fraction), 4),
        "lane_duty_cycle": [round(value, 4) for value in lane_duty],
        "confidence": round(
            _clamp(1.0 - (percentile(counts, 0.9) - percentile(counts, 0.1)) / max(1.0, median(counts) or 1.0)), 3
        )
        if counts
        else 0.0,
    }


def _phase_evidence(labels: Sequence[Sequence[str]], timestamps: Sequence[float], background: str) -> dict[str, Any]:
    lane_count = len(labels[0])
    fps = _fps(timestamps)
    signals = [[1.0 if frame[lane] != background else 0.0 for frame in labels] for lane in range(lane_count)]
    maximum_lag = max(1, min(round(fps * 2), len(labels) // 5))
    pairs = []
    for lane in range(lane_count - 1):
        lag, correlation = best_lag(signals[lane], signals[lane + 1], maximum_lag)
        pairs.append({"from_lane": lane, "to_lane": lane + 1, "lag_frames": lag, "correlation": round(correlation, 3)})
    reliable = [pair for pair in pairs if float(pair["correlation"]) >= 0.5 and int(pair["lag_frames"]) != 0]
    lags = [float(pair["lag_frames"]) for pair in reliable]
    signs = [1 if lag > 0 else -1 for lag in lags]
    consistency = max(signs.count(1), signs.count(-1)) / len(signs) if signs else 0.0
    median_lag = median(lags) if lags else 0.0
    confidence = _clamp((len(reliable) / max(1, lane_count - 1)) * consistency)
    return {
        "median_adjacent_lag_frames": round(median_lag, 3) if reliable else None,
        "seconds_per_lane": round(abs(median_lag) / fps, 4) if reliable else None,
        "confidence": round(confidence, 3),
        "adjacent_pairs": pairs,
    }


def _transition_events(
    labels: Sequence[Sequence[str]],
    brightness: Sequence[Sequence[float]],
    blends: Sequence[Sequence[Any]],
) -> list[dict[str, Any]]:
    lane_count = len(labels[0])
    events: list[dict[str, Any]] = []
    for lane in range(lane_count):
        series = [frame[lane] for frame in labels]
        values = [frame[lane] for frame in brightness]
        for index in range(1, len(series)):
            if series[index] == series[index - 1]:
                continue
            window_start = max(0, index - 4)
            window_end = min(len(series), index + 4)
            before = values[window_start:index]
            after = values[index:window_end]
            plateau_low = min(mean(before), mean(after))
            plateau_high = max(mean(before), mean(after))
            span = plateau_high - plateau_low
            if span > 6.0:
                intermediate = sum(
                    1
                    for value in values[window_start:window_end]
                    if plateau_low + span * PLATEAU_TOLERANCE < value < plateau_high - span * PLATEAU_TOLERANCE
                )
            else:
                intermediate = sum(1 for frame in blends[window_start:window_end] if frame[lane] is not None)
            events.append({"lane": lane, "frame": index, "intermediate_frames": intermediate})
    return events


def _transition_shape(events: Sequence[dict[str, Any]]) -> dict[str, Any]:
    if not events:
        return {"shape": "unknown", "median_transition_frames": None, "fade_fraction": None, "event_count": 0}
    frames = [float(event["intermediate_frames"]) for event in events]
    fades = [value for value in frames if value >= FADE_TRANSITION_FRAMES]
    fade_fraction = len(fades) / len(frames)
    if MIXED_SHAPE_FRACTION <= fade_fraction <= 1 - MIXED_SHAPE_FRACTION:
        shape = "mixed"
    elif fade_fraction > 1 - MIXED_SHAPE_FRACTION:
        shape = "fade"
    else:
        shape = "step"
    return {
        "shape": shape,
        "median_transition_frames": round(median(frames), 3),
        "fade_fraction": round(fade_fraction, 3),
        "event_count": len(events),
    }


def _sequence_without_repeats(values: Sequence[str], background: str) -> list[str]:
    sequence: list[str] = []
    for value in values:
        if value in {background, UNKNOWN_LABEL}:
            continue
        if not sequence or sequence[-1] != value:
            sequence.append(value)
    return sequence


def _smallest_repeating_unit(sequence: Sequence[str]) -> tuple[list[str], int]:
    length = len(sequence)
    for size in range(1, length // 2 + 1):
        if length % size:
            continue
        unit = list(sequence[:size])
        if all(sequence[index] == unit[index % size] for index in range(length)):
            return unit, length // size
    return list(sequence), 1 if sequence else 0


def _is_rotation(candidate: Sequence[str], reference: Sequence[str]) -> bool:
    if len(candidate) != len(reference) or not candidate:
        return False
    doubled = list(reference) * 2
    return any(list(candidate) == doubled[start : start + len(candidate)] for start in range(len(reference)))


def _palette_order(
    tracking: ColourTracking,
    background: str,
) -> dict[str, Any]:
    labels = tracking.labels
    lane_count = tracking.lane_count
    changes = [
        sum(1 for index in range(1, len(labels)) if labels[index][lane] != labels[index - 1][lane])
        for lane in range(lane_count)
    ]
    reference_lane = max(range(lane_count), key=lambda lane: (changes[lane], -lane)) if lane_count else 0
    temporal = _sequence_without_repeats([frame[reference_lane] for frame in labels], background)
    unit, repeats = _smallest_repeating_unit(temporal)
    observed_labels = {cluster.label for cluster in tracking.clusters}
    authored = [entry.label for entry in tracking.palette if entry.label in observed_labels]
    if len(unit) <= 1:
        relation = "single_label" if unit else "unknown"
    elif _is_rotation(unit, authored):
        relation = "authored_order"
    elif _is_rotation(unit, list(reversed(authored))):
        relation = "reversed_authored_order"
    elif set(unit) == set(authored):
        relation = "other_permutation"
    else:
        relation = "unknown"
    spatial_counts: dict[tuple[str, ...], int] = {}
    for frame in labels:
        spatial = tuple(_sequence_without_repeats(frame, background))
        if spatial:
            spatial_counts[spatial] = spatial_counts.get(spatial, 0) + 1
    spatial_sequence = (
        list(max(spatial_counts.items(), key=lambda item: (item[1], item[0]))[0]) if spatial_counts else []
    )
    return {
        "reference_lane": reference_lane,
        "temporal_sequence": unit,
        "temporal_repeats": repeats,
        "spatial_sequence": spatial_sequence,
        "authored_sequence": authored,
        "relation": relation,
        "confidence": round(_clamp(min(1.0, repeats / 2) * tracking.confidence()), 3) if relation != "unknown" else 0.0,
    }


def _palette_assignment(tracking: ColourTracking) -> dict[str, Any]:
    observed = sorted({cluster.palette_index for cluster in tracking.clusters if cluster.palette_index is not None})
    return {
        "observed_palette_indexes": observed,
        "label_by_palette_index": {
            str(cluster.palette_index): cluster.label
            for cluster in sorted(tracking.clusters, key=lambda item: (item.palette_index is None, item.palette_index))
            if cluster.palette_index is not None
        },
        "unassigned_palette_labels": tracking.unassigned_palette_labels(),
        "unknown_sample_fraction": round(tracking.label_coverage().get(UNKNOWN_LABEL, 0.0), 4),
        "confidence": round(
            _clamp(
                mean([cluster.assignment_confidence for cluster in tracking.clusters]) if tracking.clusters else 0.0
            ),
            3,
        ),
    }


def derive_motion_features(tracking: ColourTracking, timestamps: Sequence[float]) -> dict[str, Any]:
    """Measure the geometry a smooth preview needs: bands, direction, path and shape."""
    if len(timestamps) != tracking.frame_count:
        raise ValueError("timestamps must match the tracked frame count")
    labels = tracking.labels
    background = background_state(tracking)
    background_label = str(background["label"])
    direction, path = _movement_evidence(labels, timestamps, background_label)
    bands = _band_evidence(labels, background_label, wrap=bool(direction["wrap"]))
    phase = _phase_evidence(labels, timestamps, background_label)
    periodicity = label_periodicity(labels, timestamps)
    shape = _transition_shape(_transition_events(labels, tracking.brightness, tracking.blends))
    order = _palette_order(tracking, background_label)
    assignment = _palette_assignment(tracking)
    confidence = _clamp(
        mean(
            [
                float(direction["confidence"]),
                float(bands["confidence"]),
                float(assignment["confidence"]),
                float(periodicity["confidence"]),
            ]
        )
        * tracking.confidence()
    )
    return {
        "background": background,
        "direction": direction,
        "path": path,
        "bands": bands,
        "phase": phase,
        "periodicity": periodicity,
        "transition_shape": shape,
        "palette_assignment": assignment,
        "palette_order": order,
        "confidence": round(confidence, 3),
    }


def _descriptor(frame: Sequence[str], label_order: Sequence[str]) -> list[float]:
    counts = {label: 0 for label in label_order}
    for label in frame:
        if label in counts:
            counts[label] += 1
    return [counts[label] / len(frame) for label in label_order]


def _state_boundaries(labels: Sequence[Sequence[str]], timestamps: Sequence[float]) -> list[int]:
    fps = _fps(timestamps)
    label_order = sorted({label for frame in labels for label in frame})
    descriptors = [_descriptor(frame, label_order) for frame in labels]
    window = max(2, round(fps * 0.3))
    minimum_gap = max(window, round(fps * MINIMUM_STATE_DWELL_SECONDS))
    changes = []
    for index in range(len(descriptors)):
        if index < window or index > len(descriptors) - window:
            changes.append(0.0)
            continue
        before = [mean([row[axis] for row in descriptors[index - window : index]]) for axis in range(len(label_order))]
        after = [mean([row[axis] for row in descriptors[index : index + window]]) for axis in range(len(label_order))]
        changes.append(sum(abs(left - right) for left, right in zip(before, after, strict=True)) / 2)
    threshold = max(STATE_BOUNDARY_MINIMUM_CHANGE, percentile(changes, 0.9))
    boundaries: list[int] = []
    for index, value in enumerate(changes):
        if value < threshold:
            continue
        if boundaries and index - boundaries[-1] < minimum_gap:
            if value > changes[boundaries[-1]]:
                boundaries[-1] = index
            continue
        boundaries.append(index)
    return boundaries


def _boundary_shape(
    tracking: ColourTracking,
    boundary: int,
    background_label: str,
) -> str:
    window = 3
    start = max(0, boundary - window)
    end = min(tracking.frame_count, boundary + window + 1)
    blended = sum(1 for frame in tracking.blends[start:end] for blend in frame if blend is not None)
    dark = [
        sum(1 for label in tracking.labels[index] if label == BLACK_LABEL) / tracking.lane_count
        for index in range(start, end)
    ]
    baseline = mean(
        [sum(1 for label in frame if label == BLACK_LABEL) / tracking.lane_count for frame in tracking.labels]
    )
    if dark and max(dark) > max(0.5, baseline + 0.3):
        return "blackout"
    if blended >= tracking.lane_count * 0.5:
        return "crossfade"
    changed = sum(
        1
        for lane in range(tracking.lane_count)
        if tracking.labels[boundary][lane] != tracking.labels[boundary - 1][lane]
    )
    if changed >= tracking.lane_count * 0.3:
        return "cut"
    return "unknown" if background_label == UNKNOWN_LABEL else "cut"


def _state_signature(labels: Sequence[Sequence[str]], background: str) -> tuple[str, ...]:
    counts: dict[str, int] = {}
    for frame in labels:
        for label in frame:
            if label == background:
                continue
            counts[label] = counts.get(label, 0) + 1
    return tuple(sorted(label for label, count in counts.items() if count >= max(1, sum(counts.values()) * 0.1)))


def _opening_palette_index(tracking: ColourTracking, start: int, end: int) -> int | None:
    """Return the palette index the state opens on, scanning frames then lanes in order."""
    for frame in range(start, min(end, tracking.frame_count)):
        for index in tracking.palette_indexes[frame]:
            if index is not None:
                return index
    return None


def derive_multi_features(tracking: ColourTracking, timestamps: Sequence[float]) -> dict[str, Any]:
    """Segment a Multi capture into effect states and measure how it moves between them."""
    if len(timestamps) != tracking.frame_count:
        raise ValueError("timestamps must match the tracked frame count")
    background = background_state(tracking)
    background_label = str(background["label"])
    boundaries = _state_boundaries(tracking.labels, timestamps)
    edges = [0, *boundaries, tracking.frame_count]
    states: list[dict[str, Any]] = []
    for index, (start, end) in enumerate(zip(edges[:-1], edges[1:], strict=True)):
        segment = tracking.labels[start:end]
        if not segment:
            continue
        signature = _state_signature(segment, background_label)
        states.append(
            {
                "index": index,
                "start_seconds": round(timestamps[start], 4),
                "end_seconds": round(timestamps[min(end, len(timestamps)) - 1], 4),
                "dwell_seconds": round(timestamps[min(end, len(timestamps)) - 1] - timestamps[start], 4),
                "labels": list(signature),
                "palette_indexes": sorted(
                    {
                        cluster.palette_index
                        for cluster in tracking.clusters
                        if cluster.label in signature and cluster.palette_index is not None
                    }
                ),
                "opening_palette_index": _opening_palette_index(tracking, start, end),
                "duty_cycle": round(
                    mean(
                        [
                            sum(1 for label in frame if label != background_label) / tracking.lane_count
                            for frame in segment
                        ]
                    ),
                    4,
                ),
            }
        )
    dwells = [float(state["dwell_seconds"]) for state in states]
    shapes = [_boundary_shape(tracking, boundary, background_label) for boundary in boundaries]
    transitions = [
        {"at_seconds": round(timestamps[boundary], 4), "shape": shape}
        for boundary, shape in zip(boundaries, shapes, strict=True)
    ]
    signatures = [tuple(state["labels"]) for state in states]
    unit, repeats = _smallest_repeating_unit([",".join(signature) for signature in signatures])
    continuity = _palette_continuity(states)
    dominant_shape = max(sorted(set(shapes)), key=shapes.count) if shapes else ("unknown" if not states else "unknown")
    return {
        "state_count": len(states),
        "states": states,
        "dwell": {
            "median_seconds": round(median(dwells), 4) if dwells else None,
            "minimum_seconds": round(min(dwells), 4) if dwells else None,
            "maximum_seconds": round(max(dwells), 4) if dwells else None,
            "regular": bool(dwells) and (max(dwells) - min(dwells)) <= max(0.5, median(dwells) * 0.35),
        },
        "transitions": transitions,
        "transition_shape": dominant_shape,
        "palette_state": continuity,
        "repeat_sequence": {
            "unit": [item.split(",") if item else [] for item in unit],
            "repeats": repeats,
            "cycle_seconds": round(sum(dwells[: len(unit)]), 4) if dwells and repeats > 1 else None,
        },
        "confidence": round(
            _clamp(min(1.0, len(states) / 3) * tracking.confidence()) if states else 0.0,
            3,
        ),
    }


def _palette_continuity(states: Sequence[dict[str, Any]]) -> dict[str, Any]:
    """Decide whether each effect state restarts the palette or carries it forward.

    The evidence is the palette index each state opens on, not the set of colours it uses:
    two states can draw the same colours while entering them at different points.
    """
    opening = [state["opening_palette_index"] for state in states if state["opening_palette_index"] is not None]
    if len(opening) < 2:
        return {"continuity": "unknown", "confidence": 0.0, "resets": 0, "opening_palette_indexes": opening}
    pairs = len(opening) - 1
    resets = sum(1 for previous, current in zip(opening[:-1], opening[1:], strict=True) if current == previous)
    advanced = pairs - resets
    summary = {"resets": resets, "opening_palette_indexes": opening}
    if resets == pairs:
        return {"continuity": "reset", "confidence": round(_clamp(len(opening) / 3), 3), **summary}
    if advanced > resets:
        return {"continuity": "continuous", "confidence": round(_clamp(advanced / pairs), 3), **summary}
    return {"continuity": "unknown", "confidence": 0.0, **summary}


def derive_advanced_features(tracking: ColourTracking, timestamps: Sequence[float]) -> dict[str, Any]:
    """Measure region, movement and layering for advanced controls, without wire semantics."""
    if len(timestamps) != tracking.frame_count:
        raise ValueError("timestamps must match the tracked frame count")
    labels = tracking.labels
    background = background_state(tracking)
    background_label = str(background["label"])
    lane_count = tracking.lane_count
    lit_lanes = [lane for lane in range(lane_count) if any(frame[lane] != background_label for frame in labels)]
    changing_lanes = [
        lane
        for lane in range(lane_count)
        if any(labels[index][lane] != labels[index - 1][lane] for index in range(1, len(labels)))
    ]
    direction, _ = _movement_evidence(labels, timestamps, background_label)
    bands = _band_evidence(labels, background_label, wrap=bool(direction["wrap"]))
    coverage = len(lit_lanes) / lane_count if lane_count else 0.0
    if not changing_lanes:
        domain = "none"
    elif coverage >= 0.9 and len(changing_lanes) >= lane_count * 0.9:
        domain = "whole_strip"
    elif lit_lanes and set(changing_lanes) <= set(lit_lanes):
        domain = "within_active_region"
    else:
        domain = "unknown"
    centroids = [
        mean([float(lane) for lane, label in enumerate(frame) if label != background_label])
        for frame in labels
        if any(label != background_label for label in frame)
    ]
    distance = round(max(centroids) - min(centroids), 3) if centroids else 0.0
    simultaneous = mean(
        [
            1.0 if len({label for label in frame if label not in {background_label, BLACK_LABEL}}) > 1 else 0.0
            for frame in labels
        ]
    )
    overlap_lanes = sorted({lane for frame in tracking.blends for lane, blend in enumerate(frame) if blend is not None})
    colour_events = _transition_events(labels, tracking.brightness, tracking.blends)
    brightness_shape = _brightness_transition_shape(tracking.brightness)
    return {
        "active_region": {
            "lanes": lit_lanes,
            "first_lane": lit_lanes[0] if lit_lanes else None,
            "last_lane": lit_lanes[-1] if lit_lanes else None,
            "coverage_fraction": round(coverage, 4),
            "contiguous": bool(lit_lanes) and lit_lanes == list(range(lit_lanes[0], lit_lanes[-1] + 1)),
        },
        "movement_domain": domain,
        "direction": direction,
        "geometry": {
            "width_lanes": bands["band_width_lanes"],
            "distance_lanes": distance,
            "simultaneous_band_count": bands["simultaneous_band_count"],
        },
        "layer_overlap": {
            "simultaneous_label_fraction": round(simultaneous, 4),
            "blended_sample_fraction": round(tracking.blend_fraction(), 4),
            "overlap_lanes": overlap_lanes,
            "overlapping": simultaneous >= LAYER_OVERLAP_MINIMUM and bool(overlap_lanes),
        },
        "colour_transition_shape": _transition_shape(colour_events),
        "brightness_transition_shape": brightness_shape,
        "confidence": round(_clamp(float(direction["confidence"]) * tracking.confidence()), 3),
    }


def _brightness_transition_shape(brightness: Sequence[Sequence[float]]) -> dict[str, Any]:
    lane_count = len(brightness[0]) if brightness else 0
    events: list[dict[str, Any]] = []
    for lane in range(lane_count):
        series = [frame[lane] for frame in brightness]
        span = max(series) - min(series)
        if span < 8.0:
            continue
        threshold = span * 0.5
        for index in range(1, len(series)):
            if abs(series[index] - series[index - 1]) < span * 0.15:
                continue
            start = index
            while start > 1 and abs(series[start - 1] - series[start - 2]) >= span * 0.15:
                start -= 1
            end = index
            while end + 1 < len(series) and abs(series[end + 1] - series[end]) >= span * 0.15:
                end += 1
            if abs(series[end] - series[start - 1]) >= threshold:
                events.append({"lane": lane, "frame": index, "intermediate_frames": end - start})
    return (
        _transition_shape(events)
        if events
        else {
            "shape": "unknown",
            "median_transition_frames": None,
            "fade_fraction": None,
            "event_count": 0,
        }
    )


def recommend_duration(
    *,
    pilot_seconds: float,
    period_seconds: float | None,
    period_confidence: float,
    stochastic: bool,
    resolved: bool,
) -> dict[str, Any]:
    """Recommend the shortest capture that still shows the behaviour a pilot revealed."""
    limitations: list[str] = []
    if stochastic or not resolved or period_seconds is None or period_confidence < MINIMUM_PERIOD_CORRELATION:
        reason = "stochastic" if stochastic else "unresolved"
        return {
            "recommended_seconds": UNRESOLVED_DURATION_SECONDS,
            "reason": reason,
            "pilot_seconds": round(pilot_seconds, 3),
            "period_seconds": period_seconds,
            "cycles_captured": None,
            "analysed_seconds": None,
            "settling_seconds": SETTLING_SECONDS,
            "margin_seconds": DURATION_MARGIN_SECONDS,
            "limitations": ["no reliable period, so the pilot duration is kept"],
        }
    analysed = max(ANALYSED_FLOOR_SECONDS, MINIMUM_CYCLES * period_seconds)
    total = SETTLING_SECONDS + analysed + DURATION_MARGIN_SECONDS
    total = math.ceil(total / DURATION_QUANTUM_SECONDS) * DURATION_QUANTUM_SECONDS
    if total > MAXIMUM_DURATION_SECONDS:
        limitations.append(
            f"{MINIMUM_CYCLES} cycles of {period_seconds:.3f}s need more than the "
            f"{MAXIMUM_DURATION_SECONDS:.0f}s maximum, so fewer cycles are captured"
        )
    recommended = min(MAXIMUM_DURATION_SECONDS, max(MINIMUM_DURATION_SECONDS, total))
    usable = recommended - SETTLING_SECONDS - DURATION_MARGIN_SECONDS
    return {
        "recommended_seconds": round(recommended, 3),
        "reason": "periodic",
        "pilot_seconds": round(pilot_seconds, 3),
        "period_seconds": round(period_seconds, 4),
        "cycles_captured": round(usable / period_seconds, 3),
        "analysed_seconds": round(usable, 3),
        "settling_seconds": SETTLING_SECONDS,
        "margin_seconds": DURATION_MARGIN_SECONDS,
        "limitations": limitations,
    }


def evaluate_pilot(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    motion: dict[str, Any],
    *,
    stochastic: bool = False,
) -> dict[str, Any]:
    """Turn one pilot capture into a duration recommendation for the full campaign."""
    periodicity = motion["periodicity"]
    settled = [index for index, value in enumerate(timestamps) if value - timestamps[0] >= SETTLING_SECONDS]
    settled_periodicity = (
        label_periodicity(tracking.labels[settled[0] :], timestamps[settled[0] :])
        if len(settled) >= max(12, round(_fps(timestamps) * 3))
        else periodicity
    )
    resolved = motion["direction"]["direction"] != "unknown" or settled_periodicity["period_seconds"] is not None
    recommendation = recommend_duration(
        pilot_seconds=round(timestamps[-1] - timestamps[0], 3),
        period_seconds=settled_periodicity["period_seconds"],
        period_confidence=float(settled_periodicity["confidence"]),
        stochastic=stochastic,
        resolved=resolved,
    )
    recommendation["settled_periodicity"] = settled_periodicity
    return recommendation
