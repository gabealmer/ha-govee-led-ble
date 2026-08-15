"""Manifest-driven animation capture orchestration."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import shutil
import signal
import struct
import subprocess
import sys
import time
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

from custom_components.ha_govee_led_ble import protocol
from custom_components.ha_govee_led_ble.coordinator_modes import BLOOM_MODE_ID, SHINY_MODE_ID

REPO = Path(__file__).resolve().parents[2]
DATA_DIR = Path(__file__).resolve().parent / "animation_capture_data"
DEFAULT_MANIFEST = DATA_DIR / "manifests" / "campaign.json"
VIEWER_URL = "https://vdo.ninja/?view=7MdKzqF"
FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"
MAC_RE = re.compile(r"(?i)\b(?:[0-9a-f]{2}:){5}[0-9a-f]{2}\b")
ENTRY_RE = re.compile(r"\b01[A-Z0-9]{24}\b")
HEX_ENTRY_RE = re.compile(r"(?i)\b[0-9a-f]{32}\b")
TOKEN_RE = re.compile(r"\beyJ[A-Za-z0-9._-]{20,}\b")
BEARER_RE = re.compile(r"(?i)\bBearer\s+\S+")
TARGET_ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
CALIBRATION_FILES = {
    "calibration-black": "00-black.png",
    "calibration-first-red": "01-first-red.png",
    "calibration-last-blue": "02-last-blue.png",
    "calibration-all-white": "03-all-white.png",
}


class HarnessError(RuntimeError):
    """An operator-actionable harness failure."""


@dataclass(frozen=True, slots=True)
class FeedAssessment:
    state: str
    width: int
    height: int
    active_videos: int
    ready_state: int
    advancement_seconds: float
    stable_seconds: float
    audio_tracks: int


@dataclass(frozen=True, slots=True)
class AttemptPaths:
    record: Path
    raw: Path
    reduced: Path
    frames: Path
    log: Path


def now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, separators=(",", ":"), sort_keys=True) + "\n").encode()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def redact_text(value: str) -> str:
    value = MAC_RE.sub("<redacted-mac>", value)
    value = ENTRY_RE.sub("<redacted-entry>", value)
    value = HEX_ENTRY_RE.sub("<redacted-entry>", value)
    value = TOKEN_RE.sub("<redacted-token>", value)
    return BEARER_RE.sub("Bearer <redacted-token>", value)


def atomic_write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(f".{path.name}.partial")
    partial.write_bytes(canonical_bytes(value))
    partial.replace(path)


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as err:
        raise HarnessError(f"cannot read JSON from {path}: {err}") from err
    if not isinstance(value, dict):
        raise HarnessError(f"{path} must contain a JSON object")
    return cast(dict[str, Any], value)


def _require(mapping: dict[str, Any], key: str, expected: type, context: str) -> Any:
    value = mapping.get(key)
    if not isinstance(value, expected):
        raise HarnessError(f"{context}.{key} must be {expected.__name__}")
    return value


def _validate_rgb(value: Any, context: str) -> None:
    if (
        not isinstance(value, list)
        or len(value) != 3
        or any(not isinstance(channel, int) or not 0 <= channel <= 255 for channel in value)
    ):
        raise HarnessError(f"{context} must be an RGB array with channels from 0 to 255")


def validate_manifest(manifest: dict[str, Any]) -> Counter[str]:
    if manifest.get("schema_version") != 1:
        raise HarnessError("manifest.schema_version must be 1")
    campaign_id = _require(manifest, "campaign_id", str, "manifest")
    if not TARGET_ID_RE.fullmatch(campaign_id):
        raise HarnessError("manifest.campaign_id must be a lowercase hyphenated id")

    viewer = _require(manifest, "viewer", dict, "manifest")
    expected_viewer = {
        "url": VIEWER_URL,
        "session": "govee-camera",
        "expected_width": 1280,
        "expected_height": 720,
    }
    for key, expected in expected_viewer.items():
        if viewer.get(key) != expected:
            raise HarnessError(f"manifest.viewer.{key} must be {expected!r}")
    stable_seconds = viewer.get("stable_seconds")
    interval = viewer.get("sample_interval_seconds")
    sample_count = viewer.get("sample_count")
    if not isinstance(stable_seconds, int | float) or stable_seconds < 1:
        raise HarnessError("manifest.viewer.stable_seconds must be at least 1")
    if not isinstance(interval, int | float) or interval <= 0:
        raise HarnessError("manifest.viewer.sample_interval_seconds must be positive")
    if not isinstance(sample_count, int) or sample_count < 3:
        raise HarnessError("manifest.viewer.sample_count must be at least 3")
    if (sample_count - 1) * interval < stable_seconds:
        raise HarnessError("manifest.viewer sampling window is shorter than stable_seconds")

    analysis = _require(manifest, "analysis", dict, "manifest")
    if analysis.get("fps") != 30:
        raise HarnessError("manifest.analysis.fps must be 30")
    crop = _require(analysis, "crop", dict, "manifest.analysis")
    for key in ("x", "y", "width", "height"):
        value = crop.get(key)
        if not isinstance(value, int) or value < (0 if key in {"x", "y"} else 1):
            raise HarnessError(f"manifest.analysis.crop.{key} is invalid")
    if crop["x"] + crop["width"] > 1280 or crop["y"] + crop["height"] > 720:
        raise HarnessError("manifest.analysis.crop exceeds the required 1280x720 feed")
    _require(crop, "calibration_target", str, "manifest.analysis.crop")

    baseline = _require(manifest, "device_baseline", dict, "manifest")
    _require(baseline, "direct", dict, "manifest.device_baseline")
    vendor_baseline = _require(baseline, "vendor_app", dict, "manifest.device_baseline")
    if vendor_baseline.get("household_light_service") != "light.turn_off":
        raise HarnessError("vendor-app baseline must restore through household light.turn_off")

    targets = _require(manifest, "targets", list, "manifest")
    if not targets:
        raise HarnessError("manifest.targets must not be empty")
    seen: set[str] = set()
    counts: Counter[str] = Counter()
    for index, target_value in enumerate(targets):
        if not isinstance(target_value, dict):
            raise HarnessError(f"manifest.targets[{index}] must be an object")
        target = target_value
        target_id = _require(target, "id", str, f"manifest.targets[{index}]")
        if not TARGET_ID_RE.fullmatch(target_id) or target_id in seen:
            raise HarnessError(f"target id {target_id!r} is invalid or duplicated")
        seen.add(target_id)
        batch = _require(target, "batch", str, target_id)
        counts[batch] += 1
        driver = target.get("driver")
        if driver not in {"direct", "vendor_app"}:
            raise HarnessError(f"{target_id}.driver must be direct or vendor_app")
        if target.get("model") not in {"H617A", "H6199"}:
            raise HarnessError(f"{target_id}.model is unsupported")
        _require(target, "family", str, target_id)
        duration = target.get("duration_seconds")
        if not isinstance(duration, int | float) or duration <= 0:
            raise HarnessError(f"{target_id}.duration_seconds must be positive")
        brightness = target.get("brightness_percent")
        if not isinstance(brightness, int) or not 0 <= brightness <= 100:
            raise HarnessError(f"{target_id}.brightness_percent must be from 0 to 100")
        _require(target, "parameters", dict, target_id)
        palette = _require(target, "palette", list, target_id)
        if len(palette) > 8:
            raise HarnessError(f"{target_id}.palette cannot exceed eight colours")
        for colour_index, colour in enumerate(palette):
            _validate_rgb(colour, f"{target_id}.palette[{colour_index}]")
        _require(target, "speed_policy", dict, target_id)
        audio = _require(target, "audio", dict, target_id)
        retain_audio = audio.get("retain_in_reduced")
        if not isinstance(retain_audio, bool):
            raise HarnessError(f"{target_id}.audio.retain_in_reduced must be boolean")
        if target.get("family") == "music" and not retain_audio:
            raise HarnessError(f"{target_id} must retain audio")
        if target.get("family") != "music" and retain_audio:
            raise HarnessError(f"{target_id} cannot retain audio")
        if driver == "direct":
            direct = _require(target, "direct", dict, target_id)
            if target.get("model") != "H617A":
                raise HarnessError(f"{target_id} direct capture must use H617A")
            if direct.get("kind") not in {"static_rgb", "calibration", "type04_single", "type04_multi", "music"}:
                raise HarnessError(f"{target_id}.direct.kind is unsupported")
        else:
            steps = _require(target, "operator_steps", list, target_id)
            if not steps or any(not isinstance(step, str) or not step for step in steps):
                raise HarnessError(f"{target_id}.operator_steps must contain instructions")

    pilot = next((target for target in targets if target["id"] == "pilot-single-chasing-rgb-step-below-default"), None)
    if pilot is not None:
        if (
            pilot["duration_seconds"] != 20
            or pilot["parameters"] != {"effect": "chasing", "family": 8, "variant": 9, "speed": 40}
            or pilot["palette"] != [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
            or pilot["speed_policy"].get("offset_steps") != -1
        ):
            raise HarnessError("the Single Chasing pilot contract has drifted")
    return counts


def target_by_id(manifest: dict[str, Any], target_id: str) -> dict[str, Any]:
    for target in manifest["targets"]:
        if target["id"] == target_id:
            return cast(dict[str, Any], target)
    raise HarnessError(f"unknown target {target_id!r}")


def parse_crop(value: str) -> dict[str, Any]:
    parts = value.split(":")
    if len(parts) != 4:
        raise HarnessError("crop must be x:y:width:height")
    try:
        x, y, width, height = (int(part) for part in parts)
    except ValueError as err:
        raise HarnessError("crop must contain integers") from err
    if min(x, y) < 0 or min(width, height) < 1 or x + width > 1280 or y + height > 720:
        raise HarnessError("crop must fit within 1280x720")
    return {"x": x, "y": y, "width": width, "height": height, "calibration_target": "operator-calibrated"}


def generate_music_stimulus(path: Path) -> str:
    sample_rate = 48_000
    duration = 20
    samples = bytearray()
    noise_state = 0x13579BDF
    for index in range(sample_rate * duration):
        second = index / sample_rate
        value = 0.0
        if 2 <= second < 6:
            value = 0.25 * math.sin(2 * math.pi * 440 * (second - 2))
        elif 6 <= second < 14 and ((second - 6) % 0.5) < 0.08:
            noise_state = (1103515245 * noise_state + 12345) & 0x7FFFFFFF
            value = 0.35 * ((noise_state / 0x3FFFFFFF) - 1.0)
        elif 14 <= second < 18:
            frequencies = (100, 400, 1600, 6400)
            frequency = frequencies[min(int(second - 14), 3)]
            value = 0.25 * math.sin(2 * math.pi * frequency * (second - 14))
        samples.extend(struct.pack("<h", round(max(-1.0, min(1.0, value)) * 32767)))

    path.parent.mkdir(parents=True, exist_ok=True)
    data_size = len(samples)
    header = (
        b"RIFF"
        + struct.pack("<I", 36 + data_size)
        + b"WAVEfmt "
        + struct.pack("<IHHIIHH", 16, 1, 1, sample_rate, sample_rate * 2, 2, 16)
        + b"data"
        + struct.pack("<I", data_size)
    )
    path.write_bytes(header + samples)
    return sha256_file(path)


def initialise_corpus(manifest_path: Path, corpus: Path, crop_override: str | None = None) -> dict[str, Any]:
    manifest = load_json(manifest_path)
    validate_manifest(manifest)
    if crop_override is not None:
        manifest["analysis"]["crop"] = parse_crop(crop_override)
        validate_manifest(manifest)
    manifest_digest = sha256_bytes(canonical_bytes(manifest))
    corpus.mkdir(parents=True, exist_ok=True)
    destination = corpus / "campaign.json"
    if destination.exists():
        existing = load_json(destination)
        if sha256_bytes(canonical_bytes(existing)) != manifest_digest:
            raise HarnessError(f"{corpus} is already initialised with another manifest")
    else:
        atomic_write_json(destination, manifest)
    for directory in ("analysis", "calibration", "frames", "hci", "logs", "raw", "records", "stimulus"):
        (corpus / directory).mkdir(exist_ok=True)
    stimulus = corpus / "stimulus" / "music-v1.wav"
    stimulus_sha = generate_music_stimulus(stimulus)
    metadata = {
        "schema_version": 1,
        "campaign_id": manifest["campaign_id"],
        "campaign_sha256": manifest_digest,
        "initialised_at": now_iso(),
        "analysis": manifest["analysis"],
        "music_stimulus": {
            "file": str(stimulus.relative_to(corpus)),
            "sha256": stimulus_sha,
        },
    }
    metadata_path = corpus / "corpus.json"
    if metadata_path.exists():
        existing_metadata = load_json(metadata_path)
        if existing_metadata.get("campaign_sha256") != manifest_digest:
            raise HarnessError("corpus metadata does not match its campaign")
        metadata["initialised_at"] = existing_metadata["initialised_at"]
    atomic_write_json(metadata_path, metadata)
    return metadata


def load_corpus(corpus: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    manifest = load_json(corpus / "campaign.json")
    validate_manifest(manifest)
    metadata = load_json(corpus / "corpus.json")
    manifest_digest = sha256_bytes(canonical_bytes(manifest))
    if metadata.get("campaign_sha256") != manifest_digest:
        raise HarnessError("corpus campaign hash does not match corpus metadata")
    return manifest, metadata


def completed_target_ids(corpus: Path) -> set[str]:
    completed: set[str] = set()
    records = corpus / "records"
    if not records.exists():
        return completed
    for path in records.glob("*/*.json"):
        record = load_json(path)
        if record.get("outcome") == "complete":
            completed.add(str(record.get("target_id")))
    return completed


def completed_records(corpus: Path) -> dict[str, tuple[Path, dict[str, Any]]]:
    completed: dict[str, tuple[Path, dict[str, Any]]] = {}
    records = corpus / "records"
    if not records.exists():
        return completed
    for path in sorted(records.glob("*/*.json")):
        record = load_json(path)
        if record.get("outcome") == "complete":
            completed[str(record["target_id"])] = (path, record)
    return completed


def _palette_label(rgb: list[int], index: int) -> str:
    known = {
        (0, 0, 0): "black",
        (255, 0, 0): "red",
        (0, 255, 0): "green",
        (0, 0, 255): "blue",
        (255, 255, 255): "white",
    }
    key = (rgb[0], rgb[1], rgb[2])
    return known.get(key, f"colour-{index}")


def _analysis_palette(palette: list[list[int]]) -> list[dict[str, Any]]:
    labels: dict[str, int] = {}
    entries: list[dict[str, Any]] = []
    for index, rgb in enumerate(palette):
        base = _palette_label(rgb, index)
        occurrence = labels.get(base, 0)
        labels[base] = occurrence + 1
        label = base if occurrence == 0 else f"{base}-{occurrence}"
        entries.append({"index": index, "label": label, "rgb": rgb})
    return entries


def _analysis_kind(target: dict[str, Any]) -> str:
    family = str(target["family"])
    if family == "type04-multi":
        return "multi"
    if family == "music":
        return "music"
    if family == "workshop-primitive":
        return "advanced"
    return "motion"


def _authored_states(target: dict[str, Any]) -> list[dict[str, Any]] | None:
    if target["family"] != "type04-multi":
        return None
    palette_indexes = list(range(len(target["palette"])))
    return [
        {
            "index": index,
            "label": str(effect["effect"]),
            "palette_indexes": palette_indexes,
        }
        for index, effect in enumerate(target["parameters"]["effects"])
    ]


def analysis_manifest_document(corpus: Path, campaign: dict[str, Any]) -> dict[str, Any] | None:
    records = completed_records(corpus)
    captures: list[dict[str, Any]] = []
    models: set[str] = set()
    for target in campaign["targets"]:
        target_id = str(target["id"])
        if target["family"] == "calibration-static" or target_id not in records:
            continue
        record_path, record = records[target_id]
        model = str(target["model"])
        models.add(model)
        authored: dict[str, Any] = {
            "palette": _analysis_palette(target["palette"]),
            "background": target["parameters"].get("background"),
            "speed": target["speed_policy"],
        }
        states = _authored_states(target)
        if states is not None:
            authored["states"] = states
        video = str(record["media"]["reduced_file"])
        captures.append(
            {
                "stem": target_id,
                "kind": _analysis_kind(target),
                "label": target_id.replace("-", " ").title(),
                "duration_seconds": record["media"]["duration_seconds"],
                "pilot": target_id == "pilot-single-chasing-rgb-step-below-default",
                "notes": target["audio"]["stimulus_notes"],
                "sku": model,
                "target_id": target_id,
                "family": target["family"],
                "brightness_percent": target["brightness_percent"],
                "media": {
                    "video": video,
                    "audio": video if target["family"] == "music" else None,
                },
                "authored": authored,
                "provenance": {
                    "record": _relative(record_path, corpus),
                    "campaign_sha256": record["campaign_sha256"],
                    "wire": record["wire"],
                    "raw_sha256": record["media"]["raw_sha256"],
                    "analysis_sha256": record["media"]["reduced_sha256"],
                    "timestamps": record["timestamps"],
                    "apply_state": record["apply_status"]["state"],
                    "camera_state": record["camera_status"]["state"],
                    "restore_state": record["restore_status"]["state"],
                },
            },
        )
    if not captures:
        return None
    return {
        "schema_version": 1,
        "campaign": campaign["campaign_id"],
        "sku": next(iter(models)) if len(models) == 1 else "MULTI",
        "segment_count": 15,
        "calibration": {
            "directory": "calibration",
            "mapping_reference_stem": None,
        },
        "media": {"directory": "analysis", "fps": 30},
        "captures": captures,
    }


def update_analysis_manifest(corpus: Path, campaign: dict[str, Any]) -> None:
    document = analysis_manifest_document(corpus, campaign)
    if document is not None:
        atomic_write_json(corpus / "manifest.json", document)


def next_attempt_paths(corpus: Path, target_id: str) -> AttemptPaths:
    record_dir = corpus / "records" / target_id
    record_dir.mkdir(parents=True, exist_ok=True)
    attempts = sorted(record_dir.glob("attempt-*.json"))
    attempt = max((int(path.stem.removeprefix("attempt-")) for path in attempts), default=0) + 1
    stem = f"{target_id}-attempt-{attempt:03d}"
    return AttemptPaths(
        record=record_dir / f"attempt-{attempt:03d}.json",
        raw=corpus / "raw" / f"{stem}.webm",
        reduced=corpus / "analysis" / f"{target_id}.webm",
        frames=corpus / "frames" / f"{stem}.frames",
        log=corpus / "logs" / f"{stem}.log",
    )


def assess_feed_samples(
    samples: list[dict[str, Any]],
    *,
    expected_width: int = 1280,
    expected_height: int = 720,
    stable_seconds: float = 2.0,
    require_audio: bool = False,
) -> FeedAssessment:
    if len(samples) < 2:
        raise HarnessError("camera returned too few feed samples")

    def acceptable(sample: dict[str, Any]) -> bool:
        return (
            sample.get("activeCount") == 1
            and sample.get("readyState") == 4
            and sample.get("paused") is False
            and sample.get("ended") is False
            and sample.get("width") == expected_width
            and sample.get("height") == expected_height
            and (not require_audio or int(sample.get("audioTracks", 0)) >= 1)
        )

    start = len(samples) - 1
    while start >= 0 and acceptable(samples[start]):
        start -= 1
    stable = samples[start + 1 :]
    if len(stable) < 2:
        last = samples[-1]
        raise HarnessError(
            "camera feed is not one active readyState 4 video at stable "
            f"{expected_width}x{expected_height}; last sample={redact_text(json.dumps(last, sort_keys=True))}"
        )
    elapsed = float(stable[-1]["elapsed"]) - float(stable[0]["elapsed"])
    if elapsed < stable_seconds:
        raise HarnessError(f"camera reached {expected_width}x{expected_height} but was stable for only {elapsed:.3f} s")
    times = [float(sample["currentTime"]) for sample in stable]
    if any(later <= earlier + 0.001 for earlier, later in zip(times, times[1:], strict=False)):
        raise HarnessError("camera currentTime stalled during the stable-resolution interval")
    advancement = times[-1] - times[0]
    if advancement < elapsed * 0.5:
        raise HarnessError(f"camera advanced only {advancement:.3f} s during a {elapsed:.3f} s feed check")
    last = stable[-1]
    return FeedAssessment(
        state="ok",
        width=int(last["width"]),
        height=int(last["height"]),
        active_videos=int(last["activeCount"]),
        ready_state=int(last["readyState"]),
        advancement_seconds=round(advancement, 3),
        stable_seconds=round(elapsed, 3),
        audio_tracks=int(last.get("audioTracks", 0)),
    )


def _decode_cli_json(output: str) -> Any:
    value: Any = output.strip()
    for _ in range(2):
        if not isinstance(value, str):
            return value
        try:
            value = json.loads(value)
        except json.JSONDecodeError as err:
            raise HarnessError(f"playwright-cli returned non-JSON output: {redact_text(output)}") from err
    return value


class CameraSession:
    def __init__(self, viewer: dict[str, Any], *, executable: str = "playwright-cli") -> None:
        self.viewer = viewer
        self.executable = executable
        self.session = str(viewer["session"])
        self._recording_backend: str | None = None
        self._recording_started: float | None = None
        self._recording_path: Path | None = None

    def _run(self, arguments: list[str], *, timeout: float = 60) -> str:
        try:
            result = subprocess.run(  # noqa: S603
                [self.executable, "--raw", f"-s={self.session}", *arguments],
                check=False,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired as err:
            raise HarnessError(f"playwright-cli timed out after {timeout:g} s") from err
        if result.returncode != 0:
            message = result.stderr.strip() or result.stdout.strip()
            raise HarnessError(f"playwright-cli failed: {redact_text(message)}")
        return result.stdout.strip()

    def ensure_open(self) -> None:
        current_url = ""
        try:
            current_url = self._run(["eval", "location.href"], timeout=10).strip('"')
        except HarnessError:
            try:
                self._run(["open", str(self.viewer["url"]), "--persistent"], timeout=60)
            except HarnessError:
                self._run(["goto", str(self.viewer["url"])], timeout=60)
            return
        if current_url != self.viewer["url"]:
            self._run(["goto", str(self.viewer["url"])], timeout=60)

    def ensure_ready(self, *, require_audio: bool = False) -> FeedAssessment:
        self.ensure_open()
        count = int(self.viewer["sample_count"])
        interval_ms = round(float(self.viewer["sample_interval_seconds"]) * 1000)
        code = f"""async page => {{
  const samples = [];
  for (let index = 0; index < {count}; index += 1) {{
    samples.push(await page.evaluate((elapsed) => {{
      const videos = Array.from(document.querySelectorAll('video'));
      const active = videos.filter((video) => video.readyState === 4 && !video.paused && !video.ended);
      const video = active[0] || videos[0] || null;
      const stream = video && video.srcObject;
      const audioTracks = stream && typeof stream.getAudioTracks === 'function'
        ? stream.getAudioTracks().filter((track) => track.readyState === 'live' && track.enabled).length
        : 0;
      return {{
        elapsed,
        totalCount: videos.length,
        activeCount: active.length,
        readyState: video ? video.readyState : 0,
        paused: video ? video.paused : true,
        ended: video ? video.ended : true,
        currentTime: video ? video.currentTime : 0,
        width: video ? video.videoWidth : 0,
        height: video ? video.videoHeight : 0,
        audioTracks,
      }};
    }}, index * {interval_ms / 1000}));
    if (index + 1 < {count}) await page.waitForTimeout({interval_ms});
  }}
  return JSON.stringify(samples);
}}"""
        last_error: HarnessError | None = None
        for attempt in range(4):
            samples = _decode_cli_json(self._run(["run-code", code], timeout=count * interval_ms / 1000 + 30))
            if not isinstance(samples, list) or any(not isinstance(sample, dict) for sample in samples):
                raise HarnessError("playwright-cli camera samples have an invalid shape")
            try:
                return assess_feed_samples(
                    samples,
                    expected_width=int(self.viewer["expected_width"]),
                    expected_height=int(self.viewer["expected_height"]),
                    stable_seconds=float(self.viewer["stable_seconds"]),
                    require_audio=require_audio,
                )
            except HarnessError as err:
                last_error = err
                if attempt < 3:
                    time.sleep(3)
        raise last_error or HarnessError("camera feed did not stabilise")

    def start_recording(self, path: Path, *, require_audio: bool = False) -> dict[str, Any]:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.unlink(missing_ok=True)
        if not require_audio:
            self._run(["resize", "1280", "720"], timeout=30)
            self._run(["video-start", str(path.resolve())], timeout=30)
            self._recording_backend = "playwright-video"
            self._recording_started = time.monotonic()
            self._recording_path = path
            return {
                "backend": self._recording_backend,
                "width": 1280,
                "height": 720,
                "requireAudio": False,
            }
        required = "true" if require_audio else "false"
        code = f"""async page => {{
  return JSON.stringify(await page.evaluate((requireAudio) => {{
    const videos = Array.from(document.querySelectorAll('video'));
    const active = videos.filter((video) => video.readyState === 4 && !video.paused && !video.ended);
    if (active.length !== 1) throw new Error(`expected one active video, found ${{active.length}}`);
    const video = active[0];
    const source = video.srcObject && typeof video.srcObject.getVideoTracks === 'function'
      ? video.srcObject
      : video.captureStream();
    const videoTracks = source.getVideoTracks().filter((track) => track.readyState === 'live');
    const audioTracks = source.getAudioTracks().filter((track) => track.readyState === 'live' && track.enabled);
    if (videoTracks.length !== 1) throw new Error(`expected one live video track, found ${{videoTracks.length}}`);
    if (requireAudio && audioTracks.length < 1) throw new Error('music capture requires one live audio track');
    if (window.__goveeCapture) throw new Error('a raw recording is already active');
    const stream = new MediaStream([...videoTracks, ...audioTracks]);
    const chunks = [];
    const mimeType = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ].find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) throw new Error('browser has no supported WebM MediaRecorder format');
    const recorder = new MediaRecorder(stream, {{ mimeType }});
    const startedAt = performance.now();
    const monitorSamples = [];
    const sample = () => {{
      const elapsed = (performance.now() - startedAt) / 1000;
      const previous = monitorSamples[monitorSamples.length - 1];
      if (previous && elapsed - previous.elapsed < 0.25) return;
      monitorSamples.push({{
        elapsed,
        activeCount: video.readyState === 4 && !video.paused && !video.ended ? 1 : 0,
        readyState: video.readyState,
        paused: video.paused,
        ended: video.ended,
        currentTime: video.currentTime,
        width: video.videoWidth,
        height: video.videoHeight,
        audioTracks: audioTracks.filter((track) => track.readyState === 'live' && track.enabled).length,
      }});
    }};
    recorder.addEventListener('dataavailable', (event) => {{
      if (event.data && event.data.size > 0) chunks.push(event.data);
    }});
    recorder.start(1000);
    sample();
    const monitor = setInterval(sample, 500);
    window.__goveeCapture = {{
      recorder,
      chunks,
      startedAt,
      monitor,
      monitorSamples,
      sample,
      requireAudio,
    }};
    const settings = videoTracks[0].getSettings();
    return {{
      mimeType: recorder.mimeType,
      width: settings.width || video.videoWidth,
      height: settings.height || video.videoHeight,
      frameRate: settings.frameRate || null,
      audioTracks: audioTracks.length,
    }};
  }}, {required}));
}}"""
        result = _decode_cli_json(self._run(["run-code", code]))
        if not isinstance(result, dict):
            raise HarnessError("camera recording start returned invalid metadata")
        if result.get("width") != 1280 or result.get("height") != 720:
            raise HarnessError(f"camera recording source is downscaled to {result.get('width')}x{result.get('height')}")
        self._recording_backend = "media-recorder"
        self._recording_started = time.monotonic()
        self._recording_path = path
        return result

    def stop_recording(self, path: Path) -> dict[str, Any]:
        if self._recording_backend == "playwright-video":
            if self._recording_path != path or self._recording_started is None:
                raise HarnessError("camera recording state does not match the target path")
            self._run(["video-stop"], timeout=90)
            duration = time.monotonic() - self._recording_started
            self._recording_backend = None
            self._recording_started = None
            self._recording_path = None
            if not path.is_file() or path.stat().st_size == 0:
                raise HarnessError("camera raw recording is empty")
            raw = validate_raw_recording(
                path,
                max(0.1, duration),
                require_audio=False,
                duration_hint=duration,
            )
            return {
                "backend": "playwright-video",
                "durationSeconds": duration,
                "requireAudio": False,
                "raw": raw,
            }
        destination = json.dumps(str(path.resolve()))
        code = f"""async page => {{
  const downloadPromise = page.waitForEvent('download');
  const metadata = await page.evaluate(async () => {{
    const capture = window.__goveeCapture;
    if (!capture) throw new Error('no raw recording is active');
    clearInterval(capture.monitor);
    capture.sample();
    const recorder = capture.recorder;
    const stopped = new Promise((resolve, reject) => {{
      recorder.addEventListener(
        'error',
        (event) => reject(event.error || new Error('MediaRecorder failed')),
        {{ once: true }},
      );
      recorder.addEventListener('stop', () => resolve(), {{ once: true }});
    }});
    recorder.stop();
    await stopped;
    const blob = new Blob(capture.chunks, {{ type: recorder.mimeType }});
    if (blob.size === 0) throw new Error('raw recording is empty');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'govee-camera.webm';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.__goveeCapture = null;
    return {{
      bytes: blob.size,
      durationSeconds: (performance.now() - capture.startedAt) / 1000,
      monitorSamples: capture.monitorSamples,
      requireAudio: capture.requireAudio,
    }};
  }});
  const download = await downloadPromise;
  await download.saveAs({destination});
  return JSON.stringify(metadata);
}}"""
        result = _decode_cli_json(self._run(["run-code", code], timeout=90))
        if not isinstance(result, dict):
            raise HarnessError("camera recording stop returned invalid metadata")
        if not path.is_file() or path.stat().st_size == 0:
            raise HarnessError("camera raw recording is empty")
        require_audio = bool(result.get("requireAudio"))
        result["monitor"] = validate_recording_monitor(result, require_audio=require_audio)
        try:
            recorded_seconds = float(result.get("durationSeconds", 0))
        except (TypeError, ValueError) as err:
            raise HarnessError("camera recording stop returned no duration") from err
        result["raw"] = validate_raw_recording(
            path,
            max(0.1, recorded_seconds),
            require_audio=require_audio,
            duration_hint=recorded_seconds,
        )
        return result


def probe_media(path: Path) -> dict[str, Any]:
    result = subprocess.run(  # noqa: S603
        [
            FFPROBE,
            "-v",
            "error",
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            str(path),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise HarnessError(f"ffprobe rejected {path}: {redact_text(result.stderr.strip())}")
    try:
        value = json.loads(result.stdout)
    except json.JSONDecodeError as err:
        raise HarnessError(f"ffprobe returned invalid JSON for {path}") from err
    if not isinstance(value, dict):
        raise HarnessError(f"ffprobe returned invalid metadata for {path}")
    return value


def validate_raw_recording(
    path: Path,
    requested_duration: float,
    *,
    require_audio: bool,
    duration_hint: float | None = None,
) -> dict[str, Any]:
    if not path.is_file() or path.stat().st_size < 1024:
        raise HarnessError("raw camera recording is empty")
    metadata = probe_media(path)
    streams = metadata.get("streams")
    if not isinstance(streams, list):
        raise HarnessError("raw camera recording has no streams")
    videos = [stream for stream in streams if isinstance(stream, dict) and stream.get("codec_type") == "video"]
    audios = [stream for stream in streams if isinstance(stream, dict) and stream.get("codec_type") == "audio"]
    if len(videos) != 1:
        raise HarnessError(f"raw camera recording has {len(videos)} video streams")
    video = videos[0]
    width = int(video.get("width", 0))
    height = int(video.get("height", 0))
    if width < 800 or height < 450 or abs(width / height - 16 / 9) > 0.02:
        raise HarnessError(f"raw camera recording has unusable dimensions {width}x{height}")
    if require_audio and not audios:
        raise HarnessError("music raw recording has no audio stream")
    duration_value = metadata.get("format", {}).get("duration")
    try:
        duration = float(duration_value)
    except (TypeError, ValueError) as err:
        if duration_hint is None or duration_hint <= 0:
            raise HarnessError("raw camera recording has no readable duration") from err
        duration = duration_hint
    if duration < requested_duration * 0.9:
        raise HarnessError(f"raw camera recording is only {duration:.3f} s for a {requested_duration:.3f} s target")
    return {
        "duration_seconds": round(duration, 3),
        "width": width,
        "height": height,
        "avg_frame_rate": str(video.get("avg_frame_rate", "unknown")),
        "audio_streams": len(audios),
    }


def validate_recording_monitor(metadata: dict[str, Any], *, require_audio: bool) -> dict[str, Any]:
    samples = metadata.get("monitorSamples")
    if not isinstance(samples, list) or len(samples) < 2 or any(not isinstance(sample, dict) for sample in samples):
        raise HarnessError("camera recording has no continuous feed monitor")
    typed_samples = cast(list[dict[str, Any]], samples)
    monitor_seconds = float(typed_samples[-1]["elapsed"]) - float(typed_samples[0]["elapsed"])
    assessment = assess_feed_samples(
        typed_samples,
        stable_seconds=max(0.001, monitor_seconds),
        require_audio=require_audio,
    )
    return asdict(assessment)


def build_conversion_command(raw: Path, reduced: Path, crop: dict[str, Any], *, keep_audio: bool) -> list[str]:
    command = [
        FFMPEG,
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-fflags",
        "+bitexact",
        "-i",
        str(raw),
        "-map",
        "0:v:0",
        "-vf",
        f"crop={crop['width']}:{crop['height']}:{crop['x']}:{crop['y']}:exact=1,fps=30",
        "-map_metadata",
        "-1",
        "-c:v",
        "libvpx-vp9",
        "-lossless",
        "1",
        "-deadline",
        "good",
        "-cpu-used",
        "0",
        "-row-mt",
        "0",
        "-pix_fmt",
        "yuv444p",
        "-threads",
        "1",
        "-flags",
        "+bitexact",
    ]
    if keep_audio:
        command.extend(["-map", "0:a:0", "-ac", "1", "-c:a", "libopus", "-b:a", "96k"])
    else:
        command.append("-an")
    command.extend(["-f", "webm", str(reduced)])
    return command


def convert_recording(raw: Path, reduced: Path, crop: dict[str, Any], *, keep_audio: bool) -> None:
    reduced.parent.mkdir(parents=True, exist_ok=True)
    reduced.unlink(missing_ok=True)
    result = subprocess.run(  # noqa: S603
        build_conversion_command(raw, reduced, crop, keep_audio=keep_audio),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise HarnessError(f"ffmpeg conversion failed: {redact_text(result.stderr.strip())}")
    if not reduced.is_file() or reduced.stat().st_size == 0:
        raise HarnessError("ffmpeg produced an empty reduced clip")


def build_calibration_frame_command(video: Path, output: Path, duration_seconds: float) -> list[str]:
    return [
        FFMPEG,
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        f"{duration_seconds / 2:.6f}",
        "-i",
        str(video),
        "-frames:v",
        "1",
        "-map_metadata",
        "-1",
        "-pix_fmt",
        "rgb24",
        "-compression_level",
        "9",
        "-pred",
        "mixed",
        str(output),
    ]


def extract_calibration_frame(video: Path, output: Path, duration_seconds: float) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)
    result = subprocess.run(  # noqa: S603
        build_calibration_frame_command(video, output, duration_seconds),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise HarnessError(f"calibration frame extraction failed: {redact_text(result.stderr.strip())}")
    if not output.is_file() or output.stat().st_size == 0:
        raise HarnessError("calibration frame extraction produced an empty image")


def build_target_frames(target: dict[str, Any]) -> list[bytes]:
    direct = target["direct"]
    parameters = target["parameters"]
    model = str(target["model"])
    brightness = int(target["brightness_percent"])
    palette: list[tuple[int, int, int]] = [
        (int(colour[0]), int(colour[1]), int(colour[2])) for colour in target["palette"]
    ]
    if direct["kind"] == "calibration":
        state = str(parameters["state"])
        if state == "black":
            return [protocol.build_power(False, model)]
        frames = [
            protocol.build_power(True, model),
            protocol.build_brightness(brightness, model),
            protocol.build_color_rgb(0, 0, 0, model),
        ]
        if state == "first_segment_red":
            frames.append(protocol.build_segment_color([1], 255, 0, 0, model))
        elif state == "last_segment_blue":
            frames.append(protocol.build_segment_color([15], 0, 0, 255, model))
        elif state == "all_segments_white":
            frames.append(protocol.build_color_rgb(255, 255, 255, model))
        else:
            raise HarnessError(f"unsupported calibration state {state!r}")
        return frames
    frames = [protocol.build_power(True, model), protocol.build_brightness(brightness, model)]
    match direct["kind"]:
        case "static_rgb":
            colour = parameters["colour"]
            frames.append(protocol.build_color_rgb(int(colour[0]), int(colour[1]), int(colour[2]), model))
        case "type04_single":
            frames.extend(
                protocol.build_h617a_diy_single(
                    int(parameters["family"]),
                    int(parameters["variant"]),
                    int(parameters["speed"]),
                    palette,
                )
            )
            frames.append(protocol.build_h617a_diy_activation(int(direct["activation_code"])))
        case "type04_multi":
            effects = [(int(effect["family"]), int(effect["variant"])) for effect in parameters["effects"]]
            frames.extend(protocol.build_h617a_diy_multi(effects, int(parameters["speed"]), palette))
            frames.append(protocol.build_h617a_diy_activation(int(direct["activation_code"])))
        case "music":
            mode_id = int(parameters["mode_id"])
            calm = parameters["style"] == "calm"
            frames.append(
                protocol.build_music_mode_with_color(
                    mode_id,
                    int(parameters["sensitivity"]),
                    None,
                    calm,
                    model,
                )
            )
            if mode_id == BLOOM_MODE_ID:
                frames.extend(protocol.build_music_params_a3(mode_id, {27: 0x14 if calm else 0x50}))
            elif mode_id == SHINY_MODE_ID:
                overrides = {20: 0x14, 21: 0x46} if calm else {20: 0x05, 21: 0x64}
                frames.extend(protocol.build_music_params_a3(mode_id, overrides))
        case _:
            raise HarnessError(f"unsupported direct frame kind {direct['kind']!r}")
    return frames


def write_frame_file(path: Path, frames: list[bytes]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(f"{frame.hex()}\n" for frame in frames))


def _append_log(path: Path, heading: str, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a") as stream:
        stream.write(f"== {heading}\n")
        stream.write(redact_text(text))
        if text and not text.endswith("\n"):
            stream.write("\n")


def run_process(
    arguments: list[str],
    *,
    env: dict[str, str],
    log: Path,
    heading: str,
    input_text: str | None = None,
    timeout: float = 300,
) -> subprocess.CompletedProcess[str]:
    try:
        result = subprocess.run(  # noqa: S603
            arguments,
            check=False,
            capture_output=True,
            text=True,
            input=input_text,
            env=env,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as err:
        stdout = err.stdout.decode() if isinstance(err.stdout, bytes) else err.stdout or ""
        stderr = err.stderr.decode() if isinstance(err.stderr, bytes) else err.stderr or ""
        result = subprocess.CompletedProcess(arguments, 124, stdout, f"{stderr}\ncommand timed out after {timeout:g} s")
    _append_log(log, heading, result.stdout + result.stderr)
    return result


def physical_environment(corpus: Path, *, vendor_app: bool) -> dict[str, str]:
    identity = os.environ.get("HARNESS_IDENTITY_FILE")
    if not identity:
        raise HarnessError("set HARNESS_IDENTITY_FILE to the untracked rig identity file")
    if not Path(identity).is_file():
        raise HarnessError("HARNESS_IDENTITY_FILE is not readable")
    env = os.environ.copy()
    env["HARNESS_IDENTITY_FILE"] = identity
    if vendor_app:
        env["GOVEE_CAPTURE_DIR"] = str((corpus / "hci").resolve())
        env["GOVEE_SHOT_DIR"] = str((corpus / "shots").resolve())
    return env


def take_ownership(driver: str, device: str, env: dict[str, str], log: Path) -> None:
    mode = "direct" if driver == "direct" else "app"
    result = run_process(
        ["/bin/bash", str(REPO / "tools/harness/up.sh"), mode, device],
        env=env,
        log=log,
        heading=f"take ownership ({mode})",
        timeout=600,
    )
    if result.returncode != 0:
        raise HarnessError(f"{mode} ownership failed: {redact_text(result.stderr.strip() or result.stdout.strip())}")


def send_frames(device: str, gap: float, frames: list[bytes], env: dict[str, str], log: Path, heading: str) -> None:
    source_script = """
set -euo pipefail
source "$1/tools/harness/phone.sh"
resolve_device "$2"
govee_send send - --address "$DEVICE_ADDRESS" --model "$DEVICE_SKU" --gap "$3" --listen 2
"""
    result = run_process(
        ["/bin/bash", "-c", source_script, "--", str(REPO), device, str(gap)],
        env=env,
        log=log,
        heading=heading,
        input_text="".join(f"{frame.hex()}\n" for frame in frames),
        timeout=180,
    )
    if result.returncode != 0:
        raise HarnessError(f"{heading} failed: {redact_text(result.stderr.strip() or result.stdout.strip())}")


def mark_vendor_capture(label: str, env: dict[str, str], log: Path) -> None:
    result = run_process(
        ["/bin/bash", str(REPO / "tools/ble/govee-capture.sh"), "mark", label],
        env=env,
        log=log,
        heading=f"HCI mark {label}",
        timeout=30,
    )
    if result.returncode != 0:
        raise HarnessError(f"could not mark vendor HCI capture: {redact_text(result.stderr.strip())}")


def current_hci_name(corpus: Path) -> str:
    state = corpus / "hci" / ".current"
    if not state.is_file():
        raise HarnessError("vendor-app ownership did not leave an active attributed HCI capture")
    fields = state.read_text().split()
    if len(fields) < 2:
        raise HarnessError("active HCI capture state is malformed")
    return fields[1]


def find_hci_capture(corpus: Path, name: str) -> Path:
    candidates = [corpus / "hci" / f"{name}.pcap", corpus / "hci" / f"{name}.pcapng"]
    matches = [path for path in candidates if path.is_file() and path.stat().st_size > 0]
    if len(matches) != 1:
        raise HarnessError(f"expected one HCI capture for {name!r}, found {len(matches)}")
    return matches[0]


def _ha_command(device: str, action: str) -> str:
    if action == "status":
        operation = 'bash "$1/tools/harness/ha.sh" "$DEVICE_ENTRY" status'
    elif action == "off":
        operation = 'printf "{}\\n" | bash "$1/tools/harness/ha.sh" "$DEVICE_ENTRY" call light turn_off light'
    else:
        raise HarnessError(f"unknown Home Assistant action {action!r}")
    return f"""
set -euo pipefail
source "$1/tools/harness/phone.sh"
resolve_device "$2"
{operation}
"""


def _household_ha_loaded(device: str, env: dict[str, str], log: Path) -> bool:
    result = run_process(
        ["/bin/bash", "-c", _ha_command(device, "status"), "--", str(REPO), device],
        env=env,
        log=log,
        heading="verify household Home Assistant",
        timeout=120,
    )
    if result.returncode != 0:
        return False
    try:
        status = json.loads(result.stdout)
    except json.JSONDecodeError:
        return False
    return status.get("state") == "loaded" and status.get("disabled_by") is None


def restore_target(
    manifest: dict[str, Any],
    target: dict[str, Any],
    device: str,
    env: dict[str, str],
    log: Path,
    *,
    owned: bool,
    ownership_attempted: bool,
) -> dict[str, Any]:
    driver = str(target["driver"])
    baseline_state = "unchanged"
    baseline_error: str | None = None
    if owned and driver == "direct":
        direct_baseline = manifest["device_baseline"]["direct"]
        frames = [
            protocol.build_h617a_diy_activation(int(direct_baseline["diy_activation_code"])),
            protocol.build_brightness(int(direct_baseline["brightness_percent"]), str(target["model"])),
            protocol.build_power(bool(direct_baseline["power"]), str(target["model"])),
        ]
        try:
            send_frames(device, 0.3, frames, env, log, "restore direct device baseline")
            baseline_state = "ok"
        except HarnessError as err:
            baseline_state = "failed"
            baseline_error = str(err)

    down_result: subprocess.CompletedProcess[str] | None = None
    if ownership_attempted:
        down_result = run_process(
            ["/bin/bash", str(REPO / "tools/harness/down.sh"), device],
            env=env,
            log=log,
            heading="restore household ownership",
            timeout=600,
        )

    if owned and driver == "vendor_app":
        off_result = run_process(
            ["/bin/bash", "-c", _ha_command(device, "off"), "--", str(REPO), device],
            env=env,
            log=log,
            heading="restore vendor device baseline",
            timeout=120,
        )
        if off_result.returncode == 0:
            baseline_state = "ok"
        else:
            baseline_state = "failed"
            baseline_error = redact_text(off_result.stderr.strip() or off_result.stdout.strip())

    household_state = "ok" if _household_ha_loaded(device, env, log) else "failed"
    capture_verdict = "not_applicable"
    if driver == "vendor_app" and down_result is not None:
        capture_verdict = "ok" if down_result.returncode == 0 else "failed"
    state = "ok" if baseline_state in {"ok", "unchanged"} and household_state == "ok" else "failed"
    return {
        "state": state,
        "device_baseline": baseline_state,
        "household_ha": household_state,
        "capture_verdict": capture_verdict,
        "error": baseline_error,
    }


def protected_restore(
    manifest: dict[str, Any],
    target: dict[str, Any],
    device: str,
    env: dict[str, str],
    log: Path,
    *,
    owned: bool,
    ownership_attempted: bool,
) -> dict[str, Any]:
    previous = {sig: signal.getsignal(sig) for sig in (signal.SIGINT, signal.SIGTERM)}
    for sig in previous:
        signal.signal(sig, signal.SIG_IGN)
    try:
        return restore_target(
            manifest,
            target,
            device,
            env,
            log,
            owned=owned,
            ownership_attempted=ownership_attempted,
        )
    finally:
        for sig, handler in previous.items():
            signal.signal(sig, handler)


def initial_record(target: dict[str, Any], campaign_sha: str, paths: AttemptPaths, corpus: Path) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "target_id": target["id"],
        "campaign_sha256": campaign_sha,
        "family": target["family"],
        "parameters": target["parameters"],
        "palette": target["palette"],
        "speed_policy": target["speed_policy"],
        "wire": {
            "frame_file": None,
            "frame_file_sha256": None,
            "frame_sha256": None,
            "hci_capture_file": None,
            "hci_capture_sha256": None,
        },
        "media": {
            "raw_file": _relative(paths.raw, corpus),
            "raw_sha256": None,
            "reduced_file": _relative(paths.reduced, corpus),
            "reduced_sha256": None,
            "calibration_file": None,
            "calibration_sha256": None,
            "duration_seconds": None,
            "audio_retained": bool(target["audio"]["retain_in_reduced"]),
        },
        "timestamps": {
            "started_at": now_iso(),
            "applied_at": None,
            "finished_at": None,
        },
        "requested_duration_seconds": target["duration_seconds"],
        "brightness_percent": target["brightness_percent"],
        "audio_stimulus_notes": target["audio"]["stimulus_notes"],
        "apply_status": {"state": "pending"},
        "camera_status": {"state": "pending"},
        "restore_status": {"state": "pending"},
        "outcome": "failed",
        "error": None,
    }


def _relative(path: Path, corpus: Path) -> str:
    return str(path.resolve().relative_to(corpus.resolve()))


def _dry_run_plan(target: dict[str, Any], corpus: Path, device: str) -> dict[str, Any]:
    return {
        "target_id": target["id"],
        "driver": target["driver"],
        "device": device,
        "corpus": str(corpus),
        "camera_gate": "one advancing readyState 4 video stable at 1280x720",
        "duration_seconds": target["duration_seconds"],
        "retain_audio": target["audio"]["retain_in_reduced"],
        "restore": "device baseline, then household Home Assistant ownership",
    }


def execute_target(
    corpus: Path,
    target_id: str,
    device: str,
    expected_driver: str,
    *,
    dry_run: bool = False,
    interactive: bool = True,
    repeat: bool = False,
) -> dict[str, Any]:
    manifest, metadata = load_corpus(corpus)
    target = target_by_id(manifest, target_id)
    if target["driver"] != expected_driver:
        raise HarnessError(f"{target_id} uses {target['driver']}, not {expected_driver}")
    if expected_driver == "direct" and target["family"] == "music":
        raise HarnessError("music targets must use record-music so the stimulus gate cannot be skipped")
    if not repeat and target_id in completed_target_ids(corpus):
        raise HarnessError(f"{target_id} already has a complete capture")
    if dry_run:
        plan = _dry_run_plan(target, corpus, device)
        print(json.dumps(plan, indent=2, sort_keys=True))
        return plan
    return _execute_physical(corpus, manifest, metadata, target, device, interactive=interactive)


def execute_music_target(
    corpus: Path,
    target_id: str,
    device: str,
    *,
    dry_run: bool = False,
    interactive: bool = True,
    repeat: bool = False,
) -> dict[str, Any]:
    manifest, metadata = load_corpus(corpus)
    target = target_by_id(manifest, target_id)
    if target["driver"] != "direct" or target["family"] != "music":
        raise HarnessError(f"{target_id} is not a direct music target")
    if not repeat and target_id in completed_target_ids(corpus):
        raise HarnessError(f"{target_id} already has a complete capture")
    if dry_run:
        plan = _dry_run_plan(target, corpus, device)
        plan["stimulus"] = metadata["music_stimulus"]
        print(json.dumps(plan, indent=2, sort_keys=True))
        return plan
    return _execute_physical(corpus, manifest, metadata, target, device, interactive=interactive)


def _execute_physical(
    corpus: Path,
    manifest: dict[str, Any],
    metadata: dict[str, Any],
    target: dict[str, Any],
    device: str,
    *,
    interactive: bool,
) -> dict[str, Any]:
    active_path = corpus / ".active.json"
    if active_path.exists():
        raise HarnessError(f"{corpus} has an active or interrupted attempt; run restore before resuming")
    env = physical_environment(corpus, vendor_app=target["driver"] == "vendor_app")
    paths = next_attempt_paths(corpus, str(target["id"]))
    campaign_sha = str(metadata["campaign_sha256"])
    record = initial_record(target, campaign_sha, paths, corpus)
    atomic_write_json(paths.record, record)
    active = {
        "schema_version": 1,
        "target_id": target["id"],
        "driver": target["driver"],
        "device": device,
        "record": _relative(paths.record, corpus),
        "phase": "camera_preflight",
        "ownership_attempted": False,
        "owned": False,
    }
    atomic_write_json(active_path, active)

    camera = CameraSession(manifest["viewer"])
    require_audio = bool(target["audio"]["retain_in_reduced"])
    ownership_attempted = False
    owned = False
    recording = False
    hci_name: str | None = None
    first_error: str | None = None
    preflight: dict[str, Any] | None = None
    postflight: dict[str, Any] | None = None
    start_metadata: dict[str, Any] | None = None
    stop_metadata: dict[str, Any] | None = None

    try:
        if target["family"] == "music" and interactive:
            stimulus = corpus / str(metadata["music_stimulus"]["file"])
            print(f"Prepare the fixed external speaker and {stimulus}.")
            print(str(target["audio"]["stimulus_notes"]))
            input("Press Enter only when the speaker volume and position are fixed: ")
        preflight = asdict(camera.ensure_ready(require_audio=require_audio))
        active["phase"] = "taking_ownership"
        active["ownership_attempted"] = True
        ownership_attempted = True
        atomic_write_json(active_path, active)
        take_ownership(str(target["driver"]), device, env, paths.log)
        active["phase"] = "owned"
        active["owned"] = True
        owned = True
        atomic_write_json(active_path, active)
        if target["driver"] == "vendor_app":
            hci_name = current_hci_name(corpus)
            if interactive:
                print("\n".join(f"- {step}" for step in target["operator_steps"]))
                input("Press Enter when the target is configured but not applied: ")
        else:
            frames = build_target_frames(target)
            write_frame_file(paths.frames, frames)
            record["wire"]["frame_file"] = _relative(paths.frames, corpus)
            record["wire"]["frame_file_sha256"] = sha256_file(paths.frames)
            record["wire"]["frame_sha256"] = sha256_bytes(b"".join(frames))
            send_frames(
                device,
                float(target["direct"]["send_gap_seconds"]),
                frames,
                env,
                paths.log,
                "apply direct target",
            )
            record["apply_status"] = {"state": "ok", "method": "direct_frames"}
            record["timestamps"]["applied_at"] = now_iso()
            atomic_write_json(paths.record, record)
            time.sleep(2)

        active["phase"] = "recording"
        atomic_write_json(active_path, active)
        start_metadata = camera.start_recording(paths.raw, require_audio=require_audio)
        recording = True
        if target["driver"] == "vendor_app":
            mark_vendor_capture(f"apply {target['id']}", env, paths.log)
            if not interactive:
                raise HarnessError("vendor-app targets require operator confirmation")
            input("Apply the target now, then press Enter when the app confirms it: ")
            record["apply_status"] = {"state": "operator_confirmed", "method": "vendor_app"}
            record["timestamps"]["applied_at"] = now_iso()
        elif target["family"] == "music":
            if not interactive:
                raise HarnessError("music targets require operator stimulus confirmation")
            print("Press Enter, then start music-v1.wav immediately.")
            input()
            record["apply_status"]["stimulus"] = "operator_confirmed"
        atomic_write_json(paths.record, record)
        time.sleep(float(target["duration_seconds"]))
        stop_metadata = camera.stop_recording(paths.raw)
        recording = False
    except (
        HarnessError,
        OSError,
        subprocess.SubprocessError,
        KeyboardInterrupt,
        EOFError,
        TypeError,
        ValueError,
    ) as err:
        first_error = str(err) or err.__class__.__name__
        record["error"] = redact_text(first_error)
        if record["apply_status"]["state"] == "pending":
            record["apply_status"] = {"state": "failed", "error": redact_text(first_error)}
    finally:
        if recording:
            try:
                stop_metadata = camera.stop_recording(paths.raw)
                recording = False
            except HarnessError as err:
                if first_error is None:
                    first_error = str(err)
                    record["error"] = redact_text(first_error)

        active["phase"] = "restoring"
        atomic_write_json(active_path, active)
        restore_status = protected_restore(
            manifest,
            target,
            device,
            env,
            paths.log,
            owned=owned,
            ownership_attempted=ownership_attempted,
        )
        record["restore_status"] = restore_status
        if restore_status["state"] != "ok" and first_error is None:
            first_error = "device baseline or household Home Assistant restoration failed"
            record["error"] = first_error

    try:
        if paths.raw.is_file() and paths.raw.stat().st_size > 0:
            postflight = asdict(camera.ensure_ready(require_audio=require_audio))
            if stop_metadata is None:
                raise HarnessError("camera recording stop metadata is absent")
            monitor_metadata = (
                validate_recording_monitor(stop_metadata, require_audio=require_audio)
                if stop_metadata.get("monitorSamples") is not None
                else {"state": "not_available"}
            )
            raw_metadata = validate_raw_recording(
                paths.raw,
                float(target["duration_seconds"]),
                require_audio=require_audio,
                duration_hint=(
                    float(stop_metadata["durationSeconds"])
                    if stop_metadata is not None and stop_metadata.get("durationSeconds") is not None
                    else None
                ),
            )
            record["media"]["raw_file"] = _relative(paths.raw, corpus)
            record["media"]["raw_sha256"] = sha256_file(paths.raw)
            record["media"]["duration_seconds"] = raw_metadata["duration_seconds"]
        else:
            raise HarnessError("raw camera recording is absent")
        if target["driver"] == "vendor_app":
            if hci_name is None:
                raise HarnessError("vendor-app capture name was not recorded")
            hci_path = find_hci_capture(corpus, hci_name)
            record["wire"]["hci_capture_file"] = _relative(hci_path, corpus)
            record["wire"]["hci_capture_sha256"] = sha256_file(hci_path)
            if record["restore_status"].get("capture_verdict") != "ok":
                raise HarnessError("vendor-app HCI attribution failed")
        convert_recording(
            paths.raw,
            paths.reduced,
            manifest["analysis"]["crop"],
            keep_audio=require_audio,
        )
        record["media"]["reduced_file"] = _relative(paths.reduced, corpus)
        record["media"]["reduced_sha256"] = sha256_file(paths.reduced)
        calibration_name = CALIBRATION_FILES.get(str(target["id"]))
        if calibration_name is not None:
            calibration_path = corpus / "calibration" / calibration_name
            extract_calibration_frame(
                paths.reduced,
                calibration_path,
                float(record["media"]["duration_seconds"]),
            )
            record["media"]["calibration_file"] = _relative(calibration_path, corpus)
            record["media"]["calibration_sha256"] = sha256_file(calibration_path)
        record["camera_status"] = {
            "state": "ok",
            "preflight": preflight,
            "recording_start": start_metadata,
            "recording_stop": stop_metadata,
            "recording_monitor": monitor_metadata,
            "postflight": postflight,
        }
    except (HarnessError, OSError, subprocess.SubprocessError, TypeError, ValueError) as err:
        if first_error is None:
            first_error = str(err)
            record["error"] = redact_text(first_error)
        record["camera_status"] = {
            "state": "failed",
            "preflight": preflight,
            "recording_start": start_metadata,
            "recording_stop": stop_metadata,
            "postflight": postflight,
            "error": redact_text(str(err)),
        }

    direct_wire_ok = target["driver"] != "direct" or (
        record["wire"]["frame_sha256"] is not None and record["wire"]["frame_file_sha256"] is not None
    )
    vendor_wire_ok = target["driver"] != "vendor_app" or record["wire"]["hci_capture_sha256"] is not None
    complete = (
        first_error is None
        and record["apply_status"]["state"] in {"ok", "operator_confirmed"}
        and record["camera_status"]["state"] == "ok"
        and record["restore_status"]["state"] == "ok"
        and direct_wire_ok
        and vendor_wire_ok
        and record["media"]["raw_sha256"] is not None
        and record["media"]["reduced_sha256"] is not None
    )
    record["timestamps"]["finished_at"] = now_iso()
    record["outcome"] = "complete" if complete else "failed"
    atomic_write_json(paths.record, record)
    if complete:
        try:
            update_analysis_manifest(corpus, manifest)
        except (HarnessError, OSError, TypeError, ValueError) as err:
            complete = False
            record["outcome"] = "failed"
            record["error"] = f"analysis manifest update failed: {redact_text(str(err))}"
            atomic_write_json(paths.record, record)
    if record["restore_status"]["state"] == "ok":
        active_path.unlink(missing_ok=True)
    if not complete:
        raise HarnessError(record["error"] or "capture attempt failed")
    return record


def restore_interrupted(corpus: Path, device_override: str | None = None) -> dict[str, Any]:
    manifest, _ = load_corpus(corpus)
    active_path = corpus / ".active.json"
    if not active_path.exists():
        return {"state": "not_required"}
    active = load_json(active_path)
    target = target_by_id(manifest, str(active["target_id"]))
    device = device_override or str(active["device"])
    record_path = corpus / str(active["record"])
    log = corpus / "logs" / f"restore-{target['id']}.log"
    env = physical_environment(corpus, vendor_app=target["driver"] == "vendor_app")
    status = protected_restore(
        manifest,
        target,
        device,
        env,
        log,
        owned=bool(active.get("owned")),
        ownership_attempted=bool(active.get("ownership_attempted")),
    )
    if record_path.exists():
        record = load_json(record_path)
        record["restore_status"] = status
        record["timestamps"]["finished_at"] = now_iso()
        record["outcome"] = "failed"
        record["error"] = record.get("error") or "attempt restored after interruption"
        atomic_write_json(record_path, record)
    if status["state"] == "ok":
        active_path.unlink()
    return status


def campaign_status(corpus: Path) -> dict[str, Any]:
    manifest, _ = load_corpus(corpus)
    complete = completed_target_ids(corpus)
    counts = Counter(target["batch"] for target in manifest["targets"])
    completed_counts = Counter(target["batch"] for target in manifest["targets"] if target["id"] in complete)
    active = load_json(corpus / ".active.json") if (corpus / ".active.json").exists() else None
    return {
        "campaign_id": manifest["campaign_id"],
        "total": len(manifest["targets"]),
        "complete": len(complete),
        "remaining": len(manifest["targets"]) - len(complete),
        "batches": {
            batch: {"complete": completed_counts[batch], "total": total} for batch, total in sorted(counts.items())
        },
        "active": active,
    }


def resume_target(
    corpus: Path,
    device: str,
    *,
    batch: str | None,
    dry_run: bool,
    interactive: bool,
) -> dict[str, Any]:
    manifest, _ = load_corpus(corpus)
    if (corpus / ".active.json").exists():
        raise HarnessError("an interrupted attempt must be restored before resume")
    complete = completed_target_ids(corpus)
    candidates = [
        target
        for target in manifest["targets"]
        if target["id"] not in complete and (batch is None or target["batch"] == batch)
    ]
    if not candidates:
        return {"state": "complete", "batch": batch}
    target = candidates[0]
    if target["family"] == "music":
        return execute_music_target(corpus, str(target["id"]), device, dry_run=dry_run, interactive=interactive)
    return execute_target(
        corpus,
        str(target["id"]),
        device,
        str(target["driver"]),
        dry_run=dry_run,
        interactive=interactive,
    )


def _check_tools(include_camera: bool) -> None:
    required = ["ffmpeg", "ffprobe"]
    if include_camera:
        required.append("playwright-cli")
    missing = [tool for tool in required if shutil.which(tool) is None]
    if missing:
        raise HarnessError(f"missing required tools: {', '.join(missing)}")


def _add_corpus_device(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--device", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--non-interactive", action="store_true")
    parser.add_argument("--repeat", action="store_true")


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    commands = root.add_subparsers(dest="command", required=True)

    validate = commands.add_parser("validate")
    validate.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    validate.add_argument("--camera", action="store_true")
    validate.add_argument("--require-audio", action="store_true")

    initialise = commands.add_parser("init")
    initialise.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    initialise.add_argument("--corpus", type=Path, required=True)
    initialise.add_argument("--crop")

    run_direct = commands.add_parser("run-direct")
    run_direct.add_argument("target")
    _add_corpus_device(run_direct)

    run_vendor = commands.add_parser("run-vendor")
    run_vendor.add_argument("target")
    _add_corpus_device(run_vendor)

    music = commands.add_parser("record-music")
    music.add_argument("target")
    _add_corpus_device(music)

    resume = commands.add_parser("resume")
    _add_corpus_device(resume)
    resume.add_argument("--batch")

    status = commands.add_parser("status")
    status.add_argument("--corpus", type=Path, required=True)

    restore = commands.add_parser("restore")
    restore.add_argument("--corpus", type=Path, required=True)
    restore.add_argument("--device")

    camera = commands.add_parser("camera")
    camera_commands = camera.add_subparsers(dest="camera_command", required=True)
    camera_commands.add_parser("open")
    camera_validate = camera_commands.add_parser("validate")
    camera_validate.add_argument("--require-audio", action="store_true")
    camera_start = camera_commands.add_parser("start")
    camera_start.add_argument("path", type=Path)
    camera_start.add_argument("--require-audio", action="store_true")
    camera_stop = camera_commands.add_parser("stop")
    camera_stop.add_argument("path", type=Path)

    stimulus = commands.add_parser("generate-stimulus")
    stimulus.add_argument("path", type=Path)
    return root


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        match args.command:
            case "validate":
                manifest = load_json(args.manifest)
                counts = validate_manifest(manifest)
                _check_tools(True)
                result: dict[str, Any] = {
                    "state": "ok",
                    "targets": sum(counts.values()),
                    "batches": dict(sorted(counts.items())),
                }
                if args.camera:
                    assessment = CameraSession(manifest["viewer"]).ensure_ready(require_audio=args.require_audio)
                    result["camera"] = asdict(assessment)
                print(json.dumps(result, indent=2, sort_keys=True))
            case "init":
                print(json.dumps(initialise_corpus(args.manifest, args.corpus, args.crop), indent=2, sort_keys=True))
            case "run-direct":
                execute_target(
                    args.corpus,
                    args.target,
                    args.device,
                    "direct",
                    dry_run=args.dry_run,
                    interactive=not args.non_interactive,
                    repeat=args.repeat,
                )
            case "run-vendor":
                execute_target(
                    args.corpus,
                    args.target,
                    args.device,
                    "vendor_app",
                    dry_run=args.dry_run,
                    interactive=not args.non_interactive,
                    repeat=args.repeat,
                )
            case "record-music":
                execute_music_target(
                    args.corpus,
                    args.target,
                    args.device,
                    dry_run=args.dry_run,
                    interactive=not args.non_interactive,
                    repeat=args.repeat,
                )
            case "resume":
                print(
                    json.dumps(
                        resume_target(
                            args.corpus,
                            args.device,
                            batch=args.batch,
                            dry_run=args.dry_run,
                            interactive=not args.non_interactive,
                        ),
                        indent=2,
                        sort_keys=True,
                    )
                )
            case "status":
                print(json.dumps(campaign_status(args.corpus), indent=2, sort_keys=True))
            case "restore":
                result = restore_interrupted(args.corpus, args.device)
                print(json.dumps(result, indent=2, sort_keys=True))
                if result["state"] == "failed":
                    return 1
            case "camera":
                manifest = load_json(DEFAULT_MANIFEST)
                camera = CameraSession(manifest["viewer"])
                match args.camera_command:
                    case "open":
                        camera.ensure_open()
                    case "validate":
                        assessment = camera.ensure_ready(require_audio=args.require_audio)
                        print(json.dumps(asdict(assessment), indent=2, sort_keys=True))
                    case "start":
                        assessment = camera.ensure_ready(require_audio=args.require_audio)
                        print(
                            json.dumps(
                                {
                                    "feed": asdict(assessment),
                                    "recording": camera.start_recording(
                                        args.path,
                                        require_audio=args.require_audio,
                                    ),
                                },
                                indent=2,
                                sort_keys=True,
                            )
                        )
                    case "stop":
                        print(json.dumps(camera.stop_recording(args.path), indent=2, sort_keys=True))
            case "generate-stimulus":
                print(json.dumps({"path": str(args.path), "sha256": generate_music_stimulus(args.path)}, indent=2))
        return 0
    except HarnessError as err:
        print(f"ERROR: {redact_text(str(err))}", file=sys.stderr)
        return 1


def _raise_interrupted(signum: int, _frame: Any) -> None:
    raise KeyboardInterrupt(f"signal {signum}")


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, _raise_interrupted)
    signal.signal(signal.SIGINT, _raise_interrupted)
    raise SystemExit(main())
