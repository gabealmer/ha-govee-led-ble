"""Map camera lane colours onto the palette labels an effect was authored with.

The camera is not colorimetric: exposure, white balance and the strip diffuser all move
the recorded colour away from the value that was sent.  Nothing here treats a measured RGB
triple as a photometric claim.  It clusters what the camera actually recorded for one
capture, then assigns whole clusters to the commanded palette labels, so a uniform camera
hue rotation is absorbed by the assignment instead of being reported as a different colour.

A sample that is too dark to carry colour is ``black``, a sample that matches no cluster is
``unknown``, and a sample sitting between two clusters keeps both contributing labels with
the mixing fraction.  Those three outcomes are values, not missing data.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from itertools import permutations
from typing import Any

BLACK_LABEL = "black"
UNKNOWN_LABEL = "unknown"
SENTINEL_LABELS = (BLACK_LABEL, UNKNOWN_LABEL)

# Eight-bit brightness below which a sample carries no usable colour even before the
# adaptive threshold is considered.
ABSOLUTE_BLACK_BRIGHTNESS = 10.0
# A capture only has a dark background when the dark class is clearly separated from the
# lit class; otherwise every sample is lit and the threshold stays at the absolute floor.
BACKGROUND_SEPARATION_RATIO = 0.45
CLIPPED_CHANNEL_VALUE = 250.0
CHROMATICITY_QUANTUM = 0.02
MAXIMUM_CLUSTERS = 8
CLUSTER_IMPROVEMENT = 0.55
MINIMUM_CLUSTER_SEPARATION = 0.1
KMEANS_ITERATIONS = 25
HUE_ROTATION_LIMIT_DEGREES = 40.0
HUE_ROTATION_STEP_DEGREES = 4.0
EXHAUSTIVE_ASSIGNMENT_LIMIT = 7
MAXIMUM_ASSIGNMENT_COST = 0.9
UNKNOWN_DISTANCE = 0.22
BLEND_MINIMUM_FRACTION = 0.15
BLEND_PERPENDICULAR_TOLERANCE = 0.35
CLUSTER_CORE_FRACTION = 0.35


@dataclass(frozen=True, slots=True)
class PaletteEntry:
    """One authored palette colour.  ``rgb`` is the exact commanded source value."""

    index: int
    label: str
    rgb: tuple[int, int, int]


@dataclass(frozen=True, slots=True)
class Blend:
    """A sample lying between two clusters, with the fraction of the second label."""

    labels: tuple[str, str]
    fraction: float


@dataclass(frozen=True, slots=True)
class Cluster:
    """One adaptive colour cluster measured from a single capture."""

    id: int
    point: tuple[float, float]
    spread: float
    sample_fraction: float
    label: str
    palette_index: int | None
    assignment_cost: float | None
    assignment_confidence: float


@dataclass(frozen=True, slots=True)
class ColourTracking:
    """Per-sample palette labels with the evidence that produced them."""

    labels: tuple[tuple[str, ...], ...]
    palette_indexes: tuple[tuple[int | None, ...], ...]
    confidences: tuple[tuple[float, ...], ...]
    blends: tuple[tuple[Blend | None, ...], ...]
    brightness: tuple[tuple[float, ...], ...]
    clusters: tuple[Cluster, ...]
    black_threshold: float
    background_black_detected: bool
    clipped_sample_fraction: float
    hue_rotation_degrees: float
    palette: tuple[PaletteEntry, ...]

    @property
    def frame_count(self) -> int:
        return len(self.labels)

    @property
    def lane_count(self) -> int:
        return len(self.labels[0]) if self.labels else 0

    def label_coverage(self) -> dict[str, float]:
        total = self.frame_count * self.lane_count
        counts: dict[str, int] = {}
        for frame in self.labels:
            for label in frame:
                counts[label] = counts.get(label, 0) + 1
        return {label: round(count / total, 4) for label, count in sorted(counts.items())}

    def unassigned_palette_labels(self) -> list[str]:
        assigned = {cluster.label for cluster in self.clusters}
        return [entry.label for entry in self.palette if entry.label not in assigned]

    def blend_fraction(self) -> float:
        total = self.frame_count * self.lane_count
        blended = sum(1 for frame in self.blends for blend in frame if blend is not None)
        return blended / total if total else 0.0

    def confidence(self) -> float:
        """Overall labelling confidence: sample margin discounted by unknown coverage."""
        total = self.frame_count * self.lane_count
        if not total:
            return 0.0
        values = [value for frame in self.confidences for value in frame]
        unknown = sum(1 for frame in self.labels for label in frame if label == UNKNOWN_LABEL) / total
        return max(0.0, min(1.0, (sum(values) / total) * (1.0 - unknown)))

    def summary(self) -> dict[str, Any]:
        return {
            "black_threshold": round(self.black_threshold, 3),
            "background_black_detected": self.background_black_detected,
            "clipped_sample_fraction": round(self.clipped_sample_fraction, 4),
            "camera_hue_rotation_degrees": round(self.hue_rotation_degrees, 2),
            "clusters": [
                {
                    "id": cluster.id,
                    "chromaticity": [round(value, 4) for value in cluster.point],
                    "spread": round(cluster.spread, 4),
                    "sample_fraction": round(cluster.sample_fraction, 4),
                    "label": cluster.label,
                    "palette_index": cluster.palette_index,
                    "assignment_cost": None if cluster.assignment_cost is None else round(cluster.assignment_cost, 4),
                    "assignment_confidence": round(cluster.assignment_confidence, 3),
                }
                for cluster in self.clusters
            ],
            "label_coverage": self.label_coverage(),
            "unassigned_palette_labels": self.unassigned_palette_labels(),
            "blended_sample_fraction": round(self.blend_fraction(), 4),
            "unknown_sample_fraction": round(self.label_coverage().get(UNKNOWN_LABEL, 0.0), 4),
            "confidence": round(self.confidence(), 3),
        }


def parse_palette(entries: Sequence[dict[str, Any]]) -> tuple[PaletteEntry, ...]:
    """Read authored palette entries, rejecting duplicate labels or indexes."""
    palette = []
    for position, entry in enumerate(entries):
        rgb = tuple(int(value) for value in entry["rgb"])
        if len(rgb) != 3 or any(not 0 <= value <= 255 for value in rgb):
            raise ValueError(f"palette entry {position} needs three eight-bit channels")
        palette.append(PaletteEntry(index=int(entry.get("index", position)), label=str(entry["label"]), rgb=rgb))
    if len({entry.label for entry in palette}) != len(palette):
        raise ValueError("authored palette labels must be unique")
    if len({entry.index for entry in palette}) != len(palette):
        raise ValueError("authored palette indexes must be unique")
    if any(label in SENTINEL_LABELS for label in (entry.label for entry in palette)):
        raise ValueError(f"authored palette labels must not reuse the sentinels {SENTINEL_LABELS}")
    return tuple(palette)


def chromaticity(rgb: Sequence[float]) -> tuple[float, float]:
    """Return a saturation-weighted hue vector, so achromatic samples sit at the origin."""
    red, green, blue = (float(value) for value in rgb)
    high = max(red, green, blue)
    low = min(red, green, blue)
    if high <= 0:
        return (0.0, 0.0)
    chroma = high - low
    saturation = chroma / high
    if chroma <= 0:
        return (0.0, 0.0)
    if high == red:
        hue = ((green - blue) / chroma) % 6
    elif high == green:
        hue = (blue - red) / chroma + 2
    else:
        hue = (red - green) / chroma + 4
    angle = math.radians(hue * 60)
    return (saturation * math.cos(angle), saturation * math.sin(angle))


def _distance(left: Sequence[float], right: Sequence[float]) -> float:
    return math.hypot(left[0] - right[0], left[1] - right[1])


def _nearest_centre(point: Sequence[float], centres: Sequence[Sequence[float]]) -> int:
    best = 0
    best_distance = math.inf
    for index, centre in enumerate(centres):
        distance = _distance(point, centre)
        if distance < best_distance:
            best, best_distance = index, distance
    return best


def _rotate(point: Sequence[float], degrees: float) -> tuple[float, float]:
    angle = math.radians(degrees)
    cosine, sine = math.cos(angle), math.sin(angle)
    return (point[0] * cosine - point[1] * sine, point[0] * sine + point[1] * cosine)


def otsu_threshold(values: Sequence[float], *, bins: int = 64) -> float:
    """Return the between-class variance maximising split of a one-dimensional signal."""
    if not values:
        raise ValueError("a threshold needs at least one value")
    low, high = min(values), max(values)
    if high - low < 1e-9:
        return low
    counts = [0] * bins
    for value in values:
        index = min(bins - 1, int((value - low) / (high - low) * bins))
        counts[index] += 1
    total = len(values)
    centres = [low + (high - low) * (index + 0.5) / bins for index in range(bins)]
    total_mass = sum(count * centre for count, centre in zip(counts, centres, strict=True))
    best_variance = -1.0
    best_threshold = low
    below_weight = 0
    below_mass = 0.0
    for index in range(bins - 1):
        below_weight += counts[index]
        below_mass += counts[index] * centres[index]
        above_weight = total - below_weight
        if below_weight == 0 or above_weight == 0:
            continue
        below_mean = below_mass / below_weight
        above_mean = (total_mass - below_mass) / above_weight
        variance = below_weight * above_weight * (above_mean - below_mean) ** 2
        if variance > best_variance:
            best_variance = variance
            best_threshold = low + (high - low) * (index + 1) / bins
    return best_threshold


def _black_threshold(brightness: Sequence[float]) -> tuple[float, bool]:
    threshold = otsu_threshold(brightness)
    dark = [value for value in brightness if value < threshold]
    lit = [value for value in brightness if value >= threshold]
    if not dark or not lit:
        return ABSOLUTE_BLACK_BRIGHTNESS, False
    dark_mean = sum(dark) / len(dark)
    lit_mean = sum(lit) / len(lit)
    if dark_mean > lit_mean * BACKGROUND_SEPARATION_RATIO:
        return ABSOLUTE_BLACK_BRIGHTNESS, False
    return max(ABSOLUTE_BLACK_BRIGHTNESS, threshold), True


def _weighted_points(points: Sequence[tuple[float, float]]) -> list[tuple[tuple[float, float], int]]:
    """Quantise chromaticity samples so clustering cost does not grow with capture length."""
    buckets: dict[tuple[int, int], int] = {}
    for point in points:
        key = (round(point[0] / CHROMATICITY_QUANTUM), round(point[1] / CHROMATICITY_QUANTUM))
        buckets[key] = buckets.get(key, 0) + 1
    return [
        ((key[0] * CHROMATICITY_QUANTUM, key[1] * CHROMATICITY_QUANTUM), count)
        for key, count in sorted(buckets.items())
    ]


def _initial_centres(weighted: Sequence[tuple[tuple[float, float], int]], count: int) -> list[tuple[float, float]]:
    """Farthest-first initialisation, seeded by the most saturated sample for determinism."""
    seed = max(weighted, key=lambda item: (math.hypot(*item[0]), item[1], item[0]))
    centres = [seed[0]]
    while len(centres) < count:
        candidate = max(
            weighted,
            key=lambda item: (min(_distance(item[0], centre) for centre in centres), item[1], item[0]),
        )
        if candidate[0] in centres:
            break
        centres.append(candidate[0])
    return centres


def _kmeans(
    weighted: Sequence[tuple[tuple[float, float], int]],
    count: int,
) -> tuple[list[tuple[float, float]], float]:
    centres = _initial_centres(weighted, count)
    for _ in range(KMEANS_ITERATIONS):
        sums = [[0.0, 0.0, 0] for _ in centres]
        for point, weight in weighted:
            index = _nearest_centre(point, centres)
            sums[index][0] += point[0] * weight
            sums[index][1] += point[1] * weight
            sums[index][2] += weight
        moved = [
            (total[0] / total[2], total[1] / total[2]) if total[2] else centre
            for centre, total in zip(centres, sums, strict=True)
        ]
        if all(_distance(old, new) < 1e-6 for old, new in zip(centres, moved, strict=True)):
            centres = moved
            break
        centres = moved
    inertia = sum(
        weight * min(_distance(point, centre) for centre in centres) ** 2 for point, weight in weighted
    ) / max(1, sum(weight for _, weight in weighted))
    return centres, inertia


def _merge_close_centres(centres: Sequence[tuple[float, float]]) -> list[tuple[float, float]]:
    merged: list[tuple[float, float]] = []
    for centre in sorted(centres):
        if all(_distance(centre, kept) >= MINIMUM_CLUSTER_SEPARATION for kept in merged):
            merged.append(centre)
    return merged


def _cluster_chromaticity(
    points: Sequence[tuple[float, float]],
    maximum_clusters: int,
) -> list[tuple[float, float]]:
    weighted = _weighted_points(points)
    limit = max(1, min(maximum_clusters, len(weighted)))
    best_centres, previous_inertia = _kmeans(weighted, 1)
    for count in range(2, limit + 1):
        centres, inertia = _kmeans(weighted, count)
        if previous_inertia <= 1e-9 or inertia > previous_inertia * CLUSTER_IMPROVEMENT:
            break
        best_centres, previous_inertia = centres, inertia
    return _merge_close_centres(best_centres)


def _assignment_cost_matrix(
    centres: Sequence[tuple[float, float]],
    targets: Sequence[tuple[float, float]],
    rotation: float,
) -> list[list[float]]:
    rotated = [_rotate(centre, rotation) for centre in centres]
    return [[_distance(centre, target) for target in targets] for centre in rotated]


def _best_assignment(costs: Sequence[Sequence[float]]) -> tuple[list[int], float]:
    """Return the lowest-cost cluster to label assignment, exhaustive while that is cheap."""
    rows = len(costs)
    columns = len(costs[0]) if rows else 0
    if not rows or not columns:
        return [], 0.0
    if rows <= columns <= EXHAUSTIVE_ASSIGNMENT_LIMIT:
        best_total = math.inf
        best_assignment: tuple[int, ...] = tuple(range(rows))
        for candidate in permutations(range(columns), rows):
            total = sum(costs[row][column] for row, column in enumerate(candidate))
            if (total, candidate) < (best_total, best_assignment):
                best_total, best_assignment = total, candidate
        return list(best_assignment), best_total
    order = sorted(
        ((costs[row][column], row, column) for row in range(rows) for column in range(columns)),
    )
    assignment = [-1] * rows
    used: set[int] = set()
    total = 0.0
    for cost, row, column in order:
        if assignment[row] >= 0 or column in used:
            continue
        assignment[row] = column
        used.add(column)
        total += cost
    return assignment, total


def _normalise_saturation(
    centres: Sequence[tuple[float, float]],
    targets: Sequence[tuple[float, float]],
) -> list[tuple[float, float]]:
    """Scale observed saturation onto the authored range, which the camera does not preserve."""
    observed = max((math.hypot(*centre) for centre in centres), default=0.0)
    authored = max((math.hypot(*target) for target in targets), default=0.0)
    if observed <= 1e-6 or authored <= 1e-6:
        return list(centres)
    scale = authored / observed
    return [(centre[0] * scale, centre[1] * scale) for centre in centres]


def _assign_clusters(
    centres: Sequence[tuple[float, float]],
    palette: Sequence[PaletteEntry],
) -> tuple[list[int], float]:
    targets = [chromaticity(entry.rgb) for entry in palette]
    if not targets:
        return [-1] * len(centres), 0.0
    scaled = _normalise_saturation(centres, targets)
    steps = int(HUE_ROTATION_LIMIT_DEGREES / HUE_ROTATION_STEP_DEGREES)
    best_key = (math.inf, math.inf, [0])
    best_rotation = 0.0
    best_assignment = [-1] * len(centres)
    for step in range(-steps, steps + 1):
        rotation = step * HUE_ROTATION_STEP_DEGREES
        assignment, total = _best_assignment(_assignment_cost_matrix(scaled, targets, rotation))
        key = (round(total, 9), abs(rotation), assignment)
        if key < best_key:
            best_key, best_rotation, best_assignment = key, rotation, assignment
    return best_assignment, best_rotation


def _assignment_confidence(costs: Sequence[float], chosen: int) -> float:
    if chosen < 0 or not costs:
        return 0.0
    best = costs[chosen]
    others = [cost for index, cost in enumerate(costs) if index != chosen]
    margin = 1.0 if not others else max(0.0, min(1.0, (min(others) - best) / max(min(others), 1e-9)))
    closeness = max(0.0, 1.0 - best / MAXIMUM_ASSIGNMENT_COST)
    return max(0.0, min(1.0, margin * 0.5 + closeness * 0.5))


def _cluster_spread(points: Sequence[tuple[float, float]], centres: Sequence[tuple[float, float]]) -> list[float]:
    distances: list[list[float]] = [[] for _ in centres]
    for point in points:
        index = _nearest_centre(point, centres)
        distances[index].append(_distance(point, centres[index]))
    return [(sorted(values)[min(len(values) - 1, int(len(values) * 0.9))] if values else 0.0) for values in distances]


def _cluster(
    index: int,
    centre: tuple[float, float],
    spread: float,
    sample_fraction: float,
    palette: Sequence[PaletteEntry],
    assignment: Sequence[int],
    costs: Sequence[Sequence[float]],
) -> Cluster:
    """Build one cluster, dropping an assignment the authored palette does not explain."""
    chosen = assignment[index] if index < len(assignment) else -1
    cost = costs[index][chosen] if chosen >= 0 else None
    matched = chosen >= 0 and cost is not None and cost <= MAXIMUM_ASSIGNMENT_COST
    return Cluster(
        id=index,
        point=centre,
        spread=spread,
        sample_fraction=sample_fraction,
        label=palette[chosen].label if matched else UNKNOWN_LABEL,
        palette_index=palette[chosen].index if matched else None,
        assignment_cost=cost,
        assignment_confidence=_assignment_confidence(costs[index], chosen) if matched else 0.0,
    )


def _label_sample(
    point: tuple[float, float],
    clusters: Sequence[Cluster],
) -> tuple[str, int | None, float, Blend | None]:
    ranked = sorted((_distance(point, cluster.point), position) for position, cluster in enumerate(clusters))
    nearest = clusters[ranked[0][1]]
    nearest_distance = ranked[0][0]
    tolerance = max(UNKNOWN_DISTANCE, nearest.spread * 2.5)
    blend = None
    if len(ranked) > 1:
        second = clusters[ranked[1][1]]
        span = _distance(nearest.point, second.point)
        if span > 1e-9:
            along = (
                (point[0] - nearest.point[0]) * (second.point[0] - nearest.point[0])
                + (point[1] - nearest.point[1]) * (second.point[1] - nearest.point[1])
            ) / span**2
            perpendicular = math.sqrt(max(0.0, nearest_distance**2 - (along * span) ** 2))
            core = max(nearest.spread, second.spread, span * CLUSTER_CORE_FRACTION)
            if (
                BLEND_MINIMUM_FRACTION < along < 1 - BLEND_MINIMUM_FRACTION
                and perpendicular <= span * BLEND_PERPENDICULAR_TOLERANCE
                and nearest_distance > core * CLUSTER_CORE_FRACTION
            ):
                blend = Blend(labels=(nearest.label, second.label), fraction=round(min(1.0, max(0.0, along)), 3))
    if nearest_distance > tolerance and blend is None:
        return UNKNOWN_LABEL, None, 0.0, None
    if blend is not None:
        mixing = min(blend.fraction, 1 - blend.fraction)
        confidence = nearest.assignment_confidence * max(0.0, 1.0 - 2 * mixing)
    else:
        margin = (ranked[1][0] - nearest_distance) / max(ranked[1][0], 1e-9) if len(ranked) > 1 else 1.0
        confidence = max(0.0, min(1.0, margin)) * nearest.assignment_confidence
    return nearest.label, nearest.palette_index, round(confidence, 3), blend


def track_colour_labels(
    colours: Sequence[Sequence[Sequence[float]]],
    palette: Sequence[PaletteEntry],
) -> ColourTracking:
    """Label every lane sample with the authored palette colour it most likely shows."""
    if not colours or not colours[0]:
        raise ValueError("colour tracking needs at least one frame of lane samples")
    lane_count = len(colours[0])
    if any(len(frame) != lane_count for frame in colours):
        raise ValueError("every frame needs the same lane count")
    brightness = [[max(float(channel) for channel in sample) for sample in frame] for frame in colours]
    flat_brightness = [value for frame in brightness for value in frame]
    black_threshold, background_black = _black_threshold(flat_brightness)
    lit_points = [
        chromaticity(sample)
        for frame, frame_brightness in zip(colours, brightness, strict=True)
        for sample, value in zip(frame, frame_brightness, strict=True)
        if value >= black_threshold
    ]
    clipped = sum(
        1 for frame in colours for sample in frame if max(float(channel) for channel in sample) >= CLIPPED_CHANNEL_VALUE
    ) / max(1, len(colours) * lane_count)
    if lit_points:
        centres = _cluster_chromaticity(lit_points, min(MAXIMUM_CLUSTERS, max(1, len(palette))))
        spreads = _cluster_spread(lit_points, centres)
        assignment, rotation = _assign_clusters(centres, palette)
        cost_matrix = _assignment_cost_matrix(
            _normalise_saturation(centres, [chromaticity(entry.rgb) for entry in palette]),
            [chromaticity(entry.rgb) for entry in palette],
            rotation,
        )
        counts = [0] * len(centres)
        for point in lit_points:
            counts[_nearest_centre(point, centres)] += 1
        clusters = tuple(
            _cluster(index, centre, spreads[index], counts[index] / len(lit_points), palette, assignment, cost_matrix)
            for index, centre in enumerate(centres)
        )
    else:
        clusters = ()
        rotation = 0.0
    # A cluster the camera found but the authored palette does not explain is not evidence
    # for the nearest spare label: labelling uses only the clusters that matched.
    assigned = tuple(cluster for cluster in clusters if cluster.palette_index is not None)
    labels: list[tuple[str, ...]] = []
    indexes: list[tuple[int | None, ...]] = []
    confidences: list[tuple[float, ...]] = []
    blends: list[tuple[Blend | None, ...]] = []
    for frame, frame_brightness in zip(colours, brightness, strict=True):
        frame_labels: list[str] = []
        frame_indexes: list[int | None] = []
        frame_confidence: list[float] = []
        frame_blends: list[Blend | None] = []
        for sample, value in zip(frame, frame_brightness, strict=True):
            if value < black_threshold or not assigned:
                frame_labels.append(BLACK_LABEL if value < black_threshold else UNKNOWN_LABEL)
                frame_indexes.append(None)
                frame_confidence.append(1.0 if value < black_threshold else 0.0)
                frame_blends.append(None)
                continue
            label, index, confidence, blend = _label_sample(chromaticity(sample), assigned)
            frame_labels.append(label)
            frame_indexes.append(index)
            frame_confidence.append(confidence)
            frame_blends.append(blend)
        labels.append(tuple(frame_labels))
        indexes.append(tuple(frame_indexes))
        confidences.append(tuple(frame_confidence))
        blends.append(tuple(frame_blends))
    return ColourTracking(
        labels=tuple(labels),
        palette_indexes=tuple(indexes),
        confidences=tuple(confidences),
        blends=tuple(blends),
        brightness=tuple(tuple(frame) for frame in brightness),
        clusters=clusters,
        black_threshold=black_threshold,
        background_black_detected=background_black,
        clipped_sample_fraction=clipped,
        hue_rotation_degrees=rotation,
        palette=tuple(palette),
    )
