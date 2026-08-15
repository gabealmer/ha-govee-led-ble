"""Correlate a music capture's audio with what the strip did, without modelling timing.

A music effect responds to whatever the microphone hears, so the timing of any individual
event is a property of the room and the track, not of the effect.  Reproducing that timing
would be inventing it.  What survives repetition is spatial: where a response appears, how
long it persists, and how colour is used.  Only those survive into the output.

The envelope and every derived measure take plain sample values, so the analysis is
testable without an audio decoder.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from tools.ble.animation_colour import BLACK_LABEL, UNKNOWN_LABEL, ColourTracking, otsu_threshold
from tools.ble.animation_features import background_state
from tools.ble.capture_analysis import correlation, mean, median, percentile

SPATIAL_RESPONSE_CLASSES = (
    "whole_strip",
    "end_to_end",
    "centre_out",
    "edges_in",
    "localised",
    "none",
    "unknown",
)
COLOUR_TREATMENTS = ("single_label", "palette_cycle", "level_mapped", "unknown")

ENVELOPE_WINDOW_SECONDS = 0.05
STIMULUS_MERGE_SECONDS = 0.15
STIMULUS_MINIMUM_SECONDS = 0.08
STIMULUS_ONSET_WINDOW_SECONDS = 0.6
WHOLE_STRIP_COVERAGE = 0.8
LOCALISED_COVERAGE = 0.4
ORDERING_CORRELATION = 0.6
LEVEL_MAPPING_CORRELATION = 0.5
SINGLE_LABEL_FRACTION = 0.9
PERSISTENCE_RETURN_FRACTION = 0.2


@dataclass(frozen=True, slots=True)
class AudioEnvelope:
    """A short-window loudness envelope normalised to the loudest window."""

    times: tuple[float, ...]
    levels: tuple[float, ...]
    window_seconds: float
    sample_rate: int
    noise_floor: float

    def summary(self) -> dict[str, Any]:
        return {
            "window_seconds": self.window_seconds,
            "sample_rate": self.sample_rate,
            "window_count": len(self.levels),
            "duration_seconds": round(self.times[-1] + self.window_seconds, 4) if self.times else 0.0,
            "noise_floor": round(self.noise_floor, 4),
            "median_level": round(median(list(self.levels)), 4),
            "peak_level": round(max(self.levels), 4) if self.levels else 0.0,
        }


def audio_envelope(
    samples: Sequence[float],
    sample_rate: int,
    *,
    window_seconds: float = ENVELOPE_WINDOW_SECONDS,
) -> AudioEnvelope:
    """Reduce PCM samples to a normalised root-mean-square envelope."""
    if sample_rate <= 0:
        raise ValueError("an audio envelope needs a positive sample rate")
    window = max(1, round(sample_rate * window_seconds))
    if len(samples) < window:
        raise ValueError("the audio stream is shorter than one envelope window")
    levels = []
    times = []
    for start in range(0, len(samples) - window + 1, window):
        chunk = samples[start : start + window]
        levels.append(math.sqrt(sum(value * value for value in chunk) / len(chunk)))
        times.append(start / sample_rate)
    peak = max(levels)
    normalised = [value / peak for value in levels] if peak > 0 else [0.0] * len(levels)
    return AudioEnvelope(
        times=tuple(times),
        levels=tuple(normalised),
        window_seconds=window / sample_rate,
        sample_rate=sample_rate,
        noise_floor=round(percentile(normalised, 0.1), 6),
    )


def stimulus_regions(envelope: AudioEnvelope) -> list[dict[str, Any]]:
    """Find the loud regions an effect could have responded to."""
    levels = list(envelope.levels)
    if not levels:
        return []
    threshold = max(otsu_threshold(levels), envelope.noise_floor * 2, 0.08)
    regions: list[list[int]] = []
    gap = max(1, round(STIMULUS_MERGE_SECONDS / envelope.window_seconds))
    for index, level in enumerate(levels):
        if level < threshold:
            continue
        if regions and index - regions[-1][-1] <= gap:
            regions[-1].append(index)
        else:
            regions.append([index])
    minimum_windows = max(1, round(STIMULUS_MINIMUM_SECONDS / envelope.window_seconds))
    return [
        {
            "start_seconds": round(envelope.times[region[0]], 4),
            "end_seconds": round(envelope.times[region[-1]] + envelope.window_seconds, 4),
            "peak_level": round(max(levels[index] for index in region), 4),
        }
        for region in regions
        if region[-1] - region[0] + 1 >= minimum_windows
    ]


def _visual_event_density(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    envelope: AudioEnvelope,
) -> list[float]:
    density = [0.0] * len(envelope.levels)
    counts = [0] * len(envelope.levels)
    for index in range(1, tracking.frame_count):
        window = int(timestamps[index] / envelope.window_seconds)
        if not 0 <= window < len(density):
            continue
        changes = sum(
            1 for lane in range(tracking.lane_count) if tracking.labels[index][lane] != tracking.labels[index - 1][lane]
        )
        density[window] += changes / tracking.lane_count
        counts[window] += 1
    return [value / count if count else 0.0 for value, count in zip(density, counts, strict=True)]


def _lit_fraction(tracking: ColourTracking, background: str) -> list[float]:
    return [sum(1 for label in frame if label != background) / tracking.lane_count for frame in tracking.labels]


def _frames_in(timestamps: Sequence[float], start: float, end: float) -> list[int]:
    return [index for index, value in enumerate(timestamps) if start <= value <= end]


def _spatial_class(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    regions: Sequence[dict[str, Any]],
    background: str,
) -> dict[str, Any]:
    lane_count = tracking.lane_count
    coverages: list[float] = []
    index_correlations: list[float] = []
    centre_correlations: list[float] = []
    centre = (lane_count - 1) / 2
    for region in regions:
        frames = _frames_in(
            timestamps, float(region["start_seconds"]), float(region["start_seconds"]) + STIMULUS_ONSET_WINDOW_SECONDS
        )
        if len(frames) < 2:
            continue
        onsets: dict[int, float] = {}
        for lane in range(lane_count):
            for frame in frames:
                if tracking.labels[frame][lane] != background:
                    onsets[lane] = timestamps[frame]
                    break
        coverages.append(len(onsets) / lane_count)
        if len(onsets) >= 3:
            lanes = sorted(onsets)
            times = [onsets[lane] for lane in lanes]
            index_correlations.append(abs(correlation([float(lane) for lane in lanes], times)))
            centre_correlations.append(correlation([abs(lane - centre) for lane in lanes], times))
    if not coverages:
        return {"class": "none", "confidence": 0.0, "coverage": 0.0, "region_count": len(regions)}
    coverage = median(coverages)
    index_order = median(index_correlations) if index_correlations else 0.0
    centre_order = median(centre_correlations) if centre_correlations else 0.0
    if coverage <= 0.02:
        response = "none"
        confidence = 1.0 - coverage
    elif centre_order >= ORDERING_CORRELATION:
        response = "centre_out"
        confidence = centre_order
    elif centre_order <= -ORDERING_CORRELATION:
        response = "edges_in"
        confidence = abs(centre_order)
    elif index_order >= ORDERING_CORRELATION:
        response = "end_to_end"
        confidence = index_order
    elif coverage >= WHOLE_STRIP_COVERAGE:
        response = "whole_strip"
        confidence = coverage
    elif coverage <= LOCALISED_COVERAGE:
        response = "localised"
        confidence = 1.0 - coverage
    else:
        response = "unknown"
        confidence = 0.0
    return {
        "class": response,
        "confidence": round(max(0.0, min(1.0, confidence)), 3),
        "coverage": round(coverage, 4),
        "region_count": len(regions),
    }


def _persistence(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    regions: Sequence[dict[str, Any]],
    background: str,
) -> dict[str, Any]:
    lit = _lit_fraction(tracking, background)
    quiet = percentile(lit, 0.1)
    durations = []
    for region in regions:
        end = float(region["end_seconds"])
        started = next((index for index, value in enumerate(timestamps) if value >= end), None)
        if started is None:
            continue
        for index in range(started, tracking.frame_count):
            if lit[index] <= quiet + PERSISTENCE_RETURN_FRACTION:
                durations.append(timestamps[index] - end)
                break
    if not durations:
        return {"seconds": None, "confidence": 0.0, "measured_regions": 0}
    return {
        "seconds": round(median(durations), 4),
        "confidence": round(max(0.0, min(1.0, len(durations) / max(1, len(regions)))), 3),
        "measured_regions": len(durations),
    }


def _colour_treatment(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    envelope: AudioEnvelope,
    regions: Sequence[dict[str, Any]],
    background: str,
) -> dict[str, Any]:
    lit_counts: dict[str, int] = {}
    for frame in tracking.labels:
        for label in frame:
            if label in {background, BLACK_LABEL, UNKNOWN_LABEL}:
                continue
            lit_counts[label] = lit_counts.get(label, 0) + 1
    total = sum(lit_counts.values())
    if not total:
        return {"treatment": "unknown", "confidence": 0.0, "dominant_labels": []}
    dominant = max(lit_counts.items(), key=lambda item: (item[1], item[0]))
    if dominant[1] / total >= SINGLE_LABEL_FRACTION:
        return {
            "treatment": "single_label",
            "confidence": round(dominant[1] / total, 3),
            "dominant_labels": [dominant[0]],
        }
    index_by_label = {cluster.label: cluster.palette_index for cluster in tracking.clusters}
    levels: list[float] = []
    indexes: list[float] = []
    region_labels: list[str] = []
    for region in regions:
        frames = _frames_in(timestamps, float(region["start_seconds"]), float(region["end_seconds"]))
        counts: dict[str, int] = {}
        for index in frames:
            for label in tracking.labels[index]:
                if label in {background, BLACK_LABEL, UNKNOWN_LABEL}:
                    continue
                counts[label] = counts.get(label, 0) + 1
        if not counts:
            continue
        region_label = max(counts.items(), key=lambda item: (item[1], item[0]))[0]
        region_labels.append(region_label)
        palette_index = index_by_label.get(region_label)
        if palette_index is not None:
            levels.append(float(region["peak_level"]))
            indexes.append(float(palette_index))
    level_correlation = correlation(levels, indexes) if len(levels) >= 3 else 0.0
    if abs(level_correlation) >= LEVEL_MAPPING_CORRELATION:
        return {
            "treatment": "level_mapped",
            "confidence": round(abs(level_correlation), 3),
            "dominant_labels": sorted(set(region_labels)),
        }
    if len(set(region_labels)) >= 3:
        return {
            "treatment": "palette_cycle",
            "confidence": round(min(1.0, len(set(region_labels)) / max(3, len(lit_counts))), 3),
            "dominant_labels": sorted(set(region_labels)),
        }
    return {"treatment": "unknown", "confidence": 0.0, "dominant_labels": sorted(set(region_labels))}


def derive_music_features(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    envelope: AudioEnvelope,
) -> dict[str, Any]:
    """Report only the spatial and colour behaviour that repeats across stimuli."""
    if len(timestamps) != tracking.frame_count:
        raise ValueError("timestamps must match the tracked frame count")
    background = str(background_state(tracking)["label"])
    regions = stimulus_regions(envelope)
    density = _visual_event_density(tracking, timestamps, envelope)
    stimulus_correlation = correlation(list(envelope.levels), density)
    quiet_density = mean(
        [
            value
            for index, value in enumerate(density)
            if not any(
                float(region["start_seconds"]) <= envelope.times[index] <= float(region["end_seconds"])
                for region in regions
            )
        ]
    )
    stimulus_density = mean(
        [
            value
            for index, value in enumerate(density)
            if any(
                float(region["start_seconds"]) <= envelope.times[index] <= float(region["end_seconds"])
                for region in regions
            )
        ]
    )
    responds = stimulus_density > quiet_density * 1.5 and stimulus_density > 0
    # A strip that holds one colour for a whole stimulus responds strongly and changes rarely,
    # so a correlation against event density alone would report that response as almost absent.
    ratio_evidence = (
        min(1.0, (stimulus_density / quiet_density - 1.0) / 2.0)
        if quiet_density > 0
        else (1.0 if stimulus_density > 0 else 0.0)
    )
    strength = max(abs(stimulus_correlation), ratio_evidence if responds else 0.0)
    return {
        "envelope": envelope.summary(),
        "stimulus": {
            "region_count": len(regions),
            "regions": regions[:64],
            "median_region_seconds": (
                round(
                    median([float(region["end_seconds"]) - float(region["start_seconds"]) for region in regions]),
                    4,
                )
                if regions
                else None
            ),
        },
        "response": {
            "responds_to_stimulus": responds,
            "event_density_correlation": round(stimulus_correlation, 3),
            "stimulus_event_density": round(stimulus_density, 4),
            "quiet_event_density": round(quiet_density, 4),
            "spatial_response": _spatial_class(tracking, timestamps, regions, background),
            "persistence": _persistence(tracking, timestamps, regions, background),
            "colour_treatment": _colour_treatment(tracking, timestamps, envelope, regions, background),
        },
        "timing": {
            "deterministic_timing_modelled": False,
            "note": "Event timing follows the room audio, so only spatial and colour behaviour is reported.",
        },
        "confidence": round(max(0.0, min(1.0, strength * (1.0 if responds else 0.4) * tracking.confidence())), 3),
    }
