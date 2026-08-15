"""Run manifest-driven analysis over an arbitrary effect-capture campaign.

The campaign manifest names each capture, its kind, the device it came from and the palette
it was authored with.  Calibration, lane geometry and lane sampling come from
:mod:`tools.ble.capture_analysis`, which is the same code the scene corpus was measured
with, so two campaigns analysed here sample the same strip the same way.

Large measurements are written next to the external corpus.  Only the compact candidate
document is meant to be read by a person, and it stays pending review.
"""

from __future__ import annotations

import array
import json
import shutil
import subprocess
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from tools.ble import animation_schema
from tools.ble.animation_audio import AudioEnvelope, audio_envelope, derive_music_features
from tools.ble.animation_colour import ColourTracking, parse_palette, track_colour_labels
from tools.ble.animation_features import (
    derive_advanced_features,
    derive_motion_features,
    derive_multi_features,
    evaluate_pilot,
)
from tools.ble.capture_analysis import (
    LaneColourSeries,
    derive_corpus_calibration,
    lane_masks,
    probe_video_size,
    read_lane_colour_series,
    sha256_file,
    toolchain,
    write_calibration_diagnostic,
    write_contact_sheet,
    write_mapping_evidence,
)

MANIFEST_NAME = "manifest.json"
DEFAULT_CALIBRATION_DIRECTORY = "calibration"
MAPPING_OFFSET_PIXELS = 8
AUDIO_SAMPLE_RATE = 16000
AUDIO_SCALE = 1 / 32768
STOCHASTIC_KINDS = frozenset({"music"})


class ManifestError(ValueError):
    """The campaign manifest does not describe an analysable corpus."""


def load_manifest(corpus: Path) -> tuple[dict[str, Any], str]:
    """Read and validate the campaign manifest, returning it with its provenance hash."""
    path = corpus / MANIFEST_NAME
    if not path.is_file():
        raise ManifestError(f"{path} is missing, so the campaign has no capture contract")
    document = json.loads(path.read_text(encoding="utf-8"))
    if problems := animation_schema.validate_manifest(document):
        raise ManifestError(f"{path} is not a valid capture manifest: {'; '.join(problems)}")
    return document, sha256_file(path)


def _video_path(corpus: Path, manifest: dict[str, Any], capture: dict[str, Any]) -> Path:
    declared = capture.get("media", {}).get("video")
    if declared:
        return corpus / str(declared)
    return corpus / str(manifest["media"]["directory"]) / f"{capture['stem']}.webm"


def _audio_path(corpus: Path, capture: dict[str, Any]) -> Path | None:
    declared = capture.get("media", {}).get("audio")
    return corpus / str(declared) if declared else None


def decode_audio(path: Path) -> tuple[list[float], int] | None:
    """Decode one mono audio track, or return ``None`` when no decoder or track exists."""
    binary = shutil.which("ffmpeg")
    if binary is None:
        return None
    completed = subprocess.run(  # noqa: S603 - argv is built here from a resolved binary and a corpus path
        [
            binary,
            "-v",
            "error",
            "-i",
            str(path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            str(AUDIO_SAMPLE_RATE),
            "-f",
            "s16le",
            "-",
        ],
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0 or not completed.stdout:
        return None
    samples = array.array("h")
    samples.frombytes(completed.stdout[: len(completed.stdout) // 2 * 2])
    return [value * AUDIO_SCALE for value in samples], AUDIO_SAMPLE_RATE


def _music_features(
    tracking: ColourTracking,
    timestamps: Sequence[float],
    media: Path,
    limitations: list[str],
) -> dict[str, Any] | None:
    decoded = decode_audio(media)
    if decoded is None:
        limitations.append(f"{media.name} has no decodable audio track, so music correlation is unavailable")
        return None
    samples, sample_rate = decoded
    try:
        envelope: AudioEnvelope = audio_envelope(samples, sample_rate)
    except ValueError as error:
        limitations.append(f"{media.name} audio is unusable: {error}")
        return None
    return derive_music_features(tracking, timestamps, envelope)


def analyse_capture(
    capture: dict[str, Any],
    series: LaneColourSeries,
    *,
    media: Path,
    limitations: list[str],
) -> tuple[ColourTracking, dict[str, Any], dict[str, Any] | None]:
    """Track colours once and derive only the feature families the capture kind supports."""
    palette = parse_palette(capture["authored"]["palette"])
    tracking = track_colour_labels(series.colours, palette)
    timestamps = list(series.timestamps)
    kind = capture["kind"]
    motion = derive_motion_features(tracking, timestamps)
    features: dict[str, Any] = {"motion": motion, "multi": None, "advanced": None, "music": None}
    if kind == "multi":
        features["multi"] = derive_multi_features(tracking, timestamps)
    if kind == "advanced":
        features["advanced"] = derive_advanced_features(tracking, timestamps)
    if kind == "music":
        features["music"] = _music_features(tracking, timestamps, media, limitations)
    duration = (
        evaluate_pilot(tracking, timestamps, motion, stochastic=kind in STOCHASTIC_KINDS)
        if capture.get("pilot")
        else None
    )
    return tracking, features, duration


def build_record(
    manifest: dict[str, Any],
    capture: dict[str, Any],
    series: LaneColourSeries,
    tracking: ColourTracking,
    features: dict[str, Any],
    duration: dict[str, Any] | None,
    *,
    calibration: dict[str, Any],
    video: Path,
    audio: Path | None,
    manifest_sha256: str,
    calibration_sha256: str,
    limitations: Sequence[str],
    versions: dict[str, str],
) -> dict[str, Any]:
    """Assemble the schema-shaped measurement for one capture, with its own device identity."""
    return {
        "schema_version": animation_schema.ANALYSIS_SCHEMA_VERSION,
        "campaign": manifest["campaign"],
        "sku": animation_schema.capture_sku(manifest, capture),
        "capture": {
            "stem": capture["stem"],
            "kind": capture["kind"],
            "label": capture["label"],
            "pilot": bool(capture.get("pilot", False)),
            "authored": capture["authored"],
        },
        "source": {
            "video": video.name,
            "video_sha256": sha256_file(video),
            "manifest_sha256": manifest_sha256,
            "audio": audio.name if audio else None,
            "audio_sha256": sha256_file(audio) if audio else None,
        },
        "calibration": {
            "lane_count": int(calibration["lane_count"]),
            "uniform_scale": float(calibration["uniform_scale"]),
            "calibration_sha256": calibration_sha256,
            "video_mapping": calibration["video_mapping"],
        },
        "sampling": {
            "lane_count": tracking.lane_count,
            "frame_count": tracking.frame_count,
            "fps": round(series.fps, 4),
            "duration_seconds": round(series.timestamps[-1] - series.timestamps[0], 4),
            "timestamps_seconds": [round(value, 4) for value in series.timestamps],
            "colours_rgb": [[[round(value, 2) for value in colour] for colour in frame] for frame in series.colours],
        },
        "colour": tracking.summary(),
        "features": features,
        "duration_recommendation": duration,
        "limitations": list(limitations),
        "toolchain": versions,
    }


def _write_document(path: Path, document: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix in {".yaml", ".yml"}:
        import yaml  # type: ignore[import-untyped]

        path.write_text(yaml.safe_dump(document, sort_keys=False, allow_unicode=True, width=180), encoding="utf-8")
        return
    path.write_text(json.dumps(document, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def _mapping_evidence(
    manifest: dict[str, Any],
    corpus: Path,
    lanes: Any,
    video_size: tuple[int, int],
    scale: float,
    limitations: list[str],
) -> dict[str, Any]:
    reference_stem = manifest.get("calibration", {}).get("mapping_reference_stem")
    if not reference_stem:
        limitations.append(
            "the manifest names no fully lit mapping reference, so lane alignment is calibration-derived only"
        )
        return {"validated": False, "confidence": None, "reference_video": None}
    capture = next((item for item in manifest["captures"] if item["stem"] == reference_stem), None)
    reference = (
        _video_path(corpus, manifest, capture)
        if capture is not None
        else corpus / str(manifest["media"]["directory"]) / f"{reference_stem}.webm"
    )
    if not reference.is_file():
        limitations.append(
            f"the fully lit mapping reference {reference_stem!r} is not in the corpus, "
            "so lane alignment is calibration-derived only"
        )
        return {"validated": False, "confidence": None, "reference_video": None}
    metrics = write_mapping_evidence(
        reference,
        lanes,
        video_size,
        scale,
        offset_pixels=MAPPING_OFFSET_PIXELS,
    )
    return {"validated": True, **metrics}


def analyse_campaign(
    corpus: Path,
    output: Path,
    *,
    candidates_output: Path | None = None,
    contact_sheets: bool = True,
) -> dict[str, Any]:
    """Analyse every capture a manifest declares and write the campaign's measurements."""
    versions = toolchain()
    manifest, manifest_sha256 = load_manifest(corpus)
    calibration_directory = corpus / manifest.get("calibration", {}).get("directory", DEFAULT_CALIBRATION_DIRECTORY)
    captures = list(manifest["captures"])
    first_video = _video_path(corpus, manifest, captures[0])
    videos = [_video_path(corpus, manifest, capture) for capture in captures]
    if missing := [str(video) for video in videos if not video.is_file()]:
        raise ManifestError(f"the manifest names videos that do not exist: {', '.join(missing)}")
    video_size = probe_video_size(first_video)
    calibration, lanes = derive_corpus_calibration(calibration_directory, video_size=video_size)
    calibration["toolchain"] = versions
    scale = float(calibration["uniform_scale"])
    campaign_limitations: list[str] = []
    calibration["video_mapping"] = _mapping_evidence(manifest, corpus, lanes, video_size, scale, campaign_limitations)
    output.mkdir(parents=True, exist_ok=True)
    diagnostics = output / "diagnostics"
    diagnostics.mkdir(exist_ok=True)
    write_calibration_diagnostic(calibration_directory, lanes, diagnostics / "calibration-lanes.png")
    calibration_path = output / "calibration.json"
    calibration_path.write_text(json.dumps(calibration, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    calibration_sha256 = sha256_file(calibration_path)
    masks = lane_masks(lanes, video_size, scale)
    sheets = output / "contact-sheets"
    if contact_sheets:
        sheets.mkdir(exist_ok=True)
    results_path = output / "results.jsonl"
    records: list[dict[str, Any]] = []
    with results_path.open("w", encoding="utf-8") as stream:
        for capture in captures:
            video = _video_path(corpus, manifest, capture)
            audio = _audio_path(corpus, capture)
            series = read_lane_colour_series(video, masks)
            if series.size != video_size:
                raise ManifestError(f"{video} does not match the campaign analysis dimensions {video_size}")
            limitations = list(campaign_limitations)
            tracking, features, duration = analyse_capture(
                capture, series, media=audio or video, limitations=limitations
            )
            record = build_record(
                manifest,
                capture,
                series,
                tracking,
                features,
                duration,
                calibration=calibration,
                video=video,
                audio=audio,
                manifest_sha256=manifest_sha256,
                calibration_sha256=calibration_sha256,
                limitations=limitations,
                versions=versions,
            )
            if problems := animation_schema.validate_analysis_record(record):
                raise ValueError(f"{capture['stem']} analysis does not match the schema: {'; '.join(problems)}")
            stream.write(json.dumps(record, sort_keys=True, separators=(",", ":")) + "\n")
            records.append(record)
            if contact_sheets:
                write_contact_sheet(series, lanes, scale, sheets / f"{capture['stem']}.jpg")
    candidates = animation_schema.build_candidate_document(
        records,
        campaign=manifest["campaign"],
        sku=manifest["sku"],
        manifest_sha256=manifest_sha256,
        analysis_results_sha256=sha256_file(results_path),
        toolchain=versions,
    )
    if problems := animation_schema.validate_candidate_document(candidates):
        raise ValueError(f"evidence candidates do not match the schema: {'; '.join(problems)}")
    if candidates_output is not None:
        _write_document(candidates_output, candidates)
    summary = {
        "schema_version": animation_schema.ANALYSIS_SCHEMA_VERSION,
        "campaign": manifest["campaign"],
        "sku": manifest["sku"],
        "capture_count": len(records),
        "skus": sorted({record["sku"] for record in records}),
        "toolchain": versions,
        "analysis_tool_sha256": animation_schema.analysis_code_digest(),
        "manifest_sha256": manifest_sha256,
        "calibration": {"file": calibration_path.name, "sha256": calibration_sha256},
        "results": {"file": results_path.name, "sha256": sha256_file(results_path)},
        "duration_recommendations": {
            record["capture"]["stem"]: record["duration_recommendation"]["recommended_seconds"]
            for record in records
            if record["duration_recommendation"] is not None
        },
        "unresolved_captures": sorted(
            candidate["stem"] for candidate in candidates["candidates"] if candidate["unresolved"]
        ),
        "limitations": sorted({limitation for record in records for limitation in record["limitations"]}),
    }
    (output / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return summary
