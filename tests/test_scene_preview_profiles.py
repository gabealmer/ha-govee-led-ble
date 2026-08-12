"""Runtime packaging tests for capture-backed scene previews."""

from __future__ import annotations

import copy
import hashlib
from collections.abc import Generator
from typing import Any, cast

import pytest

from custom_components.ha_govee_led_ble import scene_preview_profiles as runtime_profiles
from custom_components.ha_govee_led_ble.scene_preview_profiles import (
    PreviewProfileValidationError,
    _validate_asset,
    load_preview_profiles,
    preview_profile_for_scene,
    warm_preview_profile_index,
)
from tools.ble.generate_scene_preview_profiles import (
    EVIDENCE_PATH,
    RUNTIME_ASSET_PATH,
    build_runtime_asset,
    render_runtime_asset,
)
from tools.ble.scene_visual_evidence_lint import load_catalogue

REVIEWED_IDENTITIES = {
    ("H617A", 1011, 1073): "static",
    ("H617A", 1012, 1074): "static",
    ("H617A", 1051, 1113): "static",
    ("H617A", 1068, 1130): "directional_sweep",
    ("H617A", 8860, 13920): "static",
}


@pytest.fixture(autouse=True)
def _clear_runtime_preview_cache() -> Generator[None]:
    runtime_profiles._reset_preview_profile_cache()
    yield
    runtime_profiles._reset_preview_profile_cache()


def _identity(profile: dict[str, Any]) -> tuple[str, int, int]:
    return profile["sku"], profile["scene_id"], profile["effect_id"]


def test_runtime_profiles_are_generated_from_reviewed_evidence() -> None:
    document = load_catalogue()
    asset = build_runtime_asset(
        document,
        evidence_sha256=hashlib.sha256(EVIDENCE_PATH.read_bytes()).hexdigest(),
    )

    assert RUNTIME_ASSET_PATH.read_text(encoding="utf-8") == render_runtime_asset(document)
    assert asset["source"]["evidence_sha256"] == hashlib.sha256(EVIDENCE_PATH.read_bytes()).hexdigest()
    assert asset["source"]["profile_count"] == 5
    assert {_identity(profile): profile["primitive"] for profile in asset["profiles"]} == REVIEWED_IDENTITIES


def test_runtime_profiles_expose_only_reviewed_observational_fields() -> None:
    profiles = cast(tuple[dict[str, Any], ...], load_preview_profiles())

    assert {_identity(profile): profile["primitive"] for profile in profiles} == REVIEWED_IDENTITIES
    assert all(profile["fidelity"] == "capture_backed" for profile in profiles)
    assert all(profile["review_state"] == "reviewed" for profile in profiles)
    assert all(profile["review_confidence"] >= profile["minimum_review_confidence"] for profile in profiles)
    assert all("name" not in profile for profile in profiles)
    for profile in profiles:
        assert profile["illuminated_segments"] == list(range(15))
        assert profile["limitations"]
        if profile["primitive"] == "static":
            assert set(profile["palette"]) == {"colour_space", "segment_rgb"}
            assert len(profile["palette"]["segment_rgb"]) == 15
        else:
            assert profile["direction"] == "towards_first_segment"
            assert profile["period_seconds"] == 3.953
            assert profile["travelling_bands"] == 2
            assert set(profile["palette"]) == {"colour_space", "base_rgb", "band_rgb"}


def test_pending_evidence_never_reaches_the_runtime_lookup() -> None:
    warm_preview_profile_index()
    assert preview_profile_for_scene("H617A", 1013, 11836) is None


@pytest.mark.parametrize(
    "mutate",
    [
        lambda asset: asset["profiles"][0].__setitem__("review_state", "pending_human_review"),
        lambda asset: asset["profiles"][0].__setitem__("review_confidence", 0.5),
        lambda asset: asset["profiles"][0].__setitem__("primitive", "global_pulse"),
        lambda asset: asset["profiles"][0].__setitem__("name", "Display-only name"),
    ],
)
def test_runtime_profiles_reject_malformed_or_unreviewed_data(mutate) -> None:
    asset = build_runtime_asset(
        load_catalogue(),
        evidence_sha256=hashlib.sha256(EVIDENCE_PATH.read_bytes()).hexdigest(),
    )
    invalid = copy.deepcopy(asset)
    mutate(invalid)

    with pytest.raises(PreviewProfileValidationError):
        _validate_asset(invalid)


def test_runtime_preview_asset_is_warmed_once_and_scene_callbacks_do_no_io(monkeypatch) -> None:
    profiles = load_preview_profiles()
    calls = 0

    def load_once() -> tuple[dict[str, Any], ...]:
        nonlocal calls
        calls += 1
        return cast(tuple[dict[str, Any], ...], profiles)

    monkeypatch.setattr(runtime_profiles, "load_preview_profiles", load_once)

    assert preview_profile_for_scene("H6199", 1, 2) is None
    assert preview_profile_for_scene("H617A", 1011, 1073) is None
    assert calls == 0
    warm_preview_profile_index()

    def unexpected_load() -> tuple[dict[str, Any], ...]:
        raise AssertionError("scene callback must not load preview profiles")

    monkeypatch.setattr(runtime_profiles, "load_preview_profiles", unexpected_load)

    assert preview_profile_for_scene("H617A", 1011, 1073) is not None
    assert preview_profile_for_scene("H617A", 1012, 1074) is not None
    assert preview_profile_for_scene("H617A", 1013, 11836) is None
    assert calls == 1


def test_runtime_preview_asset_failure_is_logged_once_and_degrades_to_no_profile(
    monkeypatch,
    caplog,
) -> None:
    def fail_load() -> tuple[dict[str, Any], ...]:
        raise PreviewProfileValidationError("asset is malformed")

    monkeypatch.setattr(runtime_profiles, "load_preview_profiles", fail_load)

    warm_preview_profile_index()
    assert preview_profile_for_scene("H617A", 1011, 1073) is None
    assert preview_profile_for_scene("H617A", 1012, 1074) is None
    assert preview_profile_for_scene("H6199", 1, 2) is None
    assert caplog.messages == ["Capture-backed scene preview profiles are unavailable: asset is malformed"]
