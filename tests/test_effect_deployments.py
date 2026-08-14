"""Deployment, observation and draft persistence remain separate from the library."""

from __future__ import annotations

import re
from dataclasses import replace
from hashlib import sha256
from pathlib import Path
from typing import Any
from uuid import uuid4

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from custom_components.ha_govee_led_ble.effect_deployments import (
    DEPLOYMENT_STORE_KEY,
    DEPLOYMENT_STORE_MINOR_VERSION,
    DEPLOYMENT_STORE_VERSION,
    DEVICE_CACHE_STORE_KEY,
    DEVICE_CACHE_STORE_MINOR_VERSION,
    DEVICE_CACHE_STORE_VERSION,
    DeploymentPhase,
    DeploymentRecord,
    EffectDeploymentRepository,
    EffectDeviceCache,
    ObservationConfidence,
    ObservedDeviceState,
    PriorControlState,
)
from custom_components.ha_govee_led_ble.effect_domain import LibraryItem, SingleEffect
from custom_components.ha_govee_led_ble.effect_drafts import (
    DRAFT_STORE_KEY,
    DRAFT_STORE_MINOR_VERSION,
    DRAFT_STORE_VERSION,
    EffectDraft,
    EffectDraftRepository,
)
from custom_components.ha_govee_led_ble.effect_limits import (
    MAX_DEPLOYMENT_RECORDS,
    MAX_DRAFTS_PER_OWNER,
    MAX_JSON_STRING_LENGTH,
)
from custom_components.ha_govee_led_ble.effect_storage import (
    EffectNotFoundError,
    EffectRevisionConflictError,
    EffectStorageError,
)
from custom_components.ha_govee_led_ble.effect_user_state import (
    MAX_RECENT_COLOURS,
    USER_STATE_STORE_KEY,
    USER_STATE_STORE_MINOR_VERSION,
    USER_STATE_STORE_VERSION,
    EffectUserState,
    EffectUserStateRepository,
)
from tests.storage_test_double import InMemoryVersionedDocumentStore


def _item() -> LibraryItem:
    return LibraryItem.new("Test", SingleEffect(0, 0, 50, ((255, 0, 0),)))


def _deployment(phase: DeploymentPhase = DeploymentPhase.COMPILING) -> DeploymentRecord:
    return DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=phase,
        compiler_version=1,
        artifact_sha256=sha256(b"artifact").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        item_id=_item().id,
        item_revision=1,
    )


def test_frontend_deployment_phase_contract_matches_backend() -> None:
    source = (Path(__file__).parents[1] / "frontend" / "src" / "types.ts").read_text(encoding="utf-8")
    phase_block = source.split("export const DEPLOYMENT_PHASES = [", 1)[1].split("] as const;", 1)[0]
    frontend_phases = tuple(re.findall(r'"([^"]+)"', phase_block))

    assert frontend_phases == tuple(phase.value for phase in DeploymentPhase)


async def test_personal_repositories_use_injected_stores_without_home_assistant() -> None:
    draft_store = InMemoryVersionedDocumentStore()
    drafts = EffectDraftRepository(draft_store)
    await drafts.async_load()
    draft = EffectDraft(
        id=uuid4(),
        owner_id="user-a",
        revision=1,
        item=_item(),
        updated_at="2026-08-11T00:00:00Z",
    )
    await drafts.async_put(draft, expected_revision=None)

    user_store = InMemoryVersionedDocumentStore()
    user_state = EffectUserStateRepository(user_store)
    await user_state.async_load()
    state = EffectUserState("user-a", preferences={"pane": "scenes"})
    user_state.set(state)

    assert (await EffectDraftRepository(draft_store).async_load()) == (draft,)
    assert user_store.data is None
    assert user_store.delayed_seconds == 5

    await user_store.async_fire_delayed_save()
    reloaded_user_state = EffectUserStateRepository(user_store)
    await reloaded_user_state.async_load()
    assert reloaded_user_state.get("user-a") == state


async def test_deployment_repositories_use_injected_stores_without_home_assistant() -> None:
    deployment_store = InMemoryVersionedDocumentStore()
    deployments = EffectDeploymentRepository(deployment_store)
    await deployments.async_load()
    pending = _deployment()
    await deployments.async_put(pending, expected_revision=0)

    reloaded_deployments = EffectDeploymentRepository(deployment_store)
    snapshot = await reloaded_deployments.async_load()

    assert snapshot.revision == 2
    interrupted = reloaded_deployments.get(pending.operation_id)
    assert interrupted.phase is DeploymentPhase.FAILED
    assert interrupted.error_code == "home_assistant_restarted_before_write"
    assert deployment_store.save_count == 2

    cache_store = InMemoryVersionedDocumentStore()
    cache = EffectDeviceCache(cache_store)
    await cache.async_load()
    observed = ObservedDeviceState(
        config_entry_id="entry-a",
        mode="diy",
        observed_at="2026-08-11T00:00:00Z",
        confidence=ObservationConfidence.EXACT_SESSION,
        matched_operation_id=pending.operation_id,
    )
    cache.set(observed)

    assert cache_store.data is None
    assert cache_store.delayed_seconds == 5

    await cache_store.async_fire_delayed_save()
    reloaded_cache = EffectDeviceCache(cache_store)
    states = await reloaded_cache.async_load()
    assert states[0].confidence is ObservationConfidence.UNKNOWN
    assert states[0].matched_operation_id is None


async def test_deployment_transitions_are_durable(hass: HomeAssistant) -> None:
    repository = EffectDeploymentRepository(hass)
    assert (await repository.async_load()).revision == 0
    pending = _deployment()

    saved = await repository.async_put(pending, expected_revision=0)
    confirmed = replace(
        pending,
        phase=DeploymentPhase.CONFIRMED,
        updated_at="2026-08-11T00:00:10Z",
    )
    saved = await repository.async_put(confirmed, expected_revision=saved.revision)

    reloaded = EffectDeploymentRepository(hass)
    assert (await reloaded.async_load()).revision == saved.revision
    assert reloaded.get(pending.operation_id).phase is DeploymentPhase.CONFIRMED

    with pytest.raises(EffectRevisionConflictError):
        await reloaded.async_put(confirmed, expected_revision=0)
    with pytest.raises(EffectNotFoundError):
        reloaded.get(uuid4())


@pytest.mark.parametrize(
    ("phase", "progress_current", "progress_total", "terminal_phase", "error_code"),
    [
        (
            DeploymentPhase.COMPILING,
            0,
            5,
            DeploymentPhase.FAILED,
            "home_assistant_restarted_before_write",
        ),
        (DeploymentPhase.UPLOADING, 2, 5, DeploymentPhase.UNCERTAIN, "home_assistant_restarted"),
        (DeploymentPhase.ACTIVATING, 4, 5, DeploymentPhase.UNCERTAIN, "home_assistant_restarted"),
        (DeploymentPhase.VERIFYING, 5, 5, DeploymentPhase.UNCERTAIN, "home_assistant_restarted"),
        (DeploymentPhase.RECOVERING, 5, 5, DeploymentPhase.UNCERTAIN, "home_assistant_restarted"),
    ],
)
async def test_inflight_deployment_gets_truthful_terminal_state_after_restart(
    hass: HomeAssistant,
    phase: DeploymentPhase,
    progress_current: int,
    progress_total: int,
    terminal_phase: DeploymentPhase,
    error_code: str,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    inflight = replace(
        _deployment(phase),
        progress_current=progress_current,
        progress_total=progress_total,
    )
    await repository.async_put(inflight, expected_revision=0)

    reloaded = EffectDeploymentRepository(hass)
    snapshot = await reloaded.async_load()
    interrupted = reloaded.get(inflight.operation_id)

    assert snapshot.revision == 2
    assert interrupted.phase is terminal_phase
    assert interrupted.error_code == error_code
    assert interrupted.progress_current == progress_current
    assert interrupted.progress_total == progress_total


@pytest.mark.parametrize(
    ("legacy_phase", "canonical_phase"),
    [
        (DeploymentPhase.PENDING, DeploymentPhase.FAILED),
        (DeploymentPhase.UNKNOWN, DeploymentPhase.UNCERTAIN),
        (DeploymentPhase.INTERRUPTED, DeploymentPhase.UNCERTAIN),
    ],
)
async def test_legacy_deployment_phases_remain_loadable(
    hass: HomeAssistant,
    legacy_phase: DeploymentPhase,
    canonical_phase: DeploymentPhase,
) -> None:
    legacy = _deployment(legacy_phase)
    store = Store[dict[str, Any]](
        hass,
        DEPLOYMENT_STORE_VERSION,
        DEPLOYMENT_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=1,
    )
    await store.async_save(
        {
            "revision": 1,
            "records": {str(legacy.operation_id): legacy.to_dict()},
        }
    )

    repository = EffectDeploymentRepository(hass)
    await repository.async_load()

    assert repository.get(legacy.operation_id).phase is canonical_phase


def test_unsaved_apply_requires_durable_snapshot() -> None:
    item = _item()

    record = DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=DeploymentPhase.PENDING,
        compiler_version=1,
        artifact_sha256=sha256(b"artifact").hexdigest(),
        updated_at="2026-08-11T00:00:00Z",
        snapshot_id=uuid4(),
        snapshot=item,
    )

    assert DeploymentRecord.from_dict(record.to_dict()) == record


def test_deployment_round_trip_preserves_prior_state_and_verification_confidence() -> None:
    prior_state = PriorControlState(
        mode="colour",
        is_on=True,
        brightness_pct=72,
        rgb_color=(1, 2, 3),
        music_sensitivity=50,
    )
    record = replace(
        _deployment(DeploymentPhase.CONFIRMED),
        prior_state=prior_state,
        verification_confidence=ObservationConfidence.ACTIVATION_MATCH,
        target_mode="scene",
        target_effect="forest",
        evidence_codes=(
            "scene_payload_readback_unavailable",
            "layered_field_semantics_uncalibrated",
        ),
    )

    restored = DeploymentRecord.from_dict(record.to_dict())

    assert restored == record
    assert restored.to_public_dict()["verification_confidence"] == "activation_match"
    assert restored.to_public_dict()["target_mode"] == "scene"
    assert restored.to_public_dict()["target_effect"] == "forest"


@pytest.mark.parametrize(
    "changes",
    [
        {"config_entry_id": ""},
        {"diy_code": -1},
        {"target_mode": "invalid"},
        {"target_mode": "scene", "target_effect": None},
        {"compiler_version": 0},
        {"artifact_sha256": "short"},
        {"updated_at": ""},
        {"progress_current": 2, "progress_total": 1},
        {"item_id": None, "item_revision": None},
        {"snapshot_id": uuid4(), "snapshot": None},
    ],
)
def test_invalid_deployments_are_rejected(changes) -> None:
    with pytest.raises(EffectStorageError):
        replace(_deployment(), **changes)


async def test_drafts_are_owner_scoped_and_revision_checked(
    hass: HomeAssistant,
) -> None:
    repository = EffectDraftRepository(hass)
    await repository.async_load()
    draft = EffectDraft(
        id=uuid4(),
        owner_id="user-a",
        revision=1,
        item=_item(),
        updated_at="2026-08-11T00:00:00Z",
    )
    await repository.async_put(draft, expected_revision=None)

    assert repository.list_for_owner("user-a") == (draft,)
    assert repository.list_for_owner("user-b") == ()
    with pytest.raises(EffectNotFoundError):
        repository.get(draft.id, "user-b")
    with pytest.raises(EffectRevisionConflictError):
        await repository.async_put(
            replace(draft, revision=2),
            expected_revision=0,
        )

    updated = replace(
        draft,
        revision=2,
        updated_at="2026-08-11T00:01:00Z",
    )
    await repository.async_put(updated, expected_revision=1)
    assert repository.get(draft.id, "user-a") == updated
    await repository.async_delete(
        draft.id,
        "user-a",
        expected_revision=2,
    )
    with pytest.raises(EffectNotFoundError):
        repository.get(draft.id, "user-a")


def test_observation_does_not_contain_authored_definition() -> None:
    state = ObservedDeviceState(
        config_entry_id="entry-a",
        mode="diy",
        observed_at="2026-08-11T00:00:00Z",
        confidence=ObservationConfidence.ACTIVATION_MATCH,
        diy_code=800,
        effect="forest",
        matched_operation_id=uuid4(),
    )

    restored = ObservedDeviceState.from_dict(state.to_dict())

    assert restored == state
    assert "snapshot" not in restored.to_dict()


async def test_device_cache_drops_session_confidence_after_reload(
    hass: HomeAssistant,
) -> None:
    cache = EffectDeviceCache(hass)
    await cache.async_load()
    state = ObservedDeviceState(
        config_entry_id="entry-a",
        mode="diy",
        observed_at="2026-08-11T00:00:00Z",
        confidence=ObservationConfidence.EXACT_SESSION,
        diy_code=800,
        matched_operation_id=uuid4(),
    )
    cache.set(state)
    assert cache.get("entry-a") == state

    await cache.async_flush()
    reloaded = EffectDeviceCache(hass)
    states = await reloaded.async_load()

    assert states[0].confidence is ObservationConfidence.UNKNOWN
    assert states[0].matched_operation_id is None


async def test_recent_colours_are_owner_scoped_deduplicated_and_bounded(
    hass: HomeAssistant,
) -> None:
    repository = EffectUserStateRepository(hass)
    await repository.async_load()
    repository.set(EffectUserState("user-a", preferences={"pane": "scenes"}))

    for value in range(MAX_RECENT_COLOURS + 2):
        repository.record_colour("user-a", (value, 0, 0))
    updated = repository.record_colour("user-a", (5, 0, 0))

    assert len(updated.recent_colours) == MAX_RECENT_COLOURS
    assert updated.recent_colours[0] == (5, 0, 0)
    assert len(set(updated.recent_colours)) == MAX_RECENT_COLOURS
    assert repository.get("user-b").recent_colours == ()

    await repository.async_flush()
    reloaded = EffectUserStateRepository(hass)
    await reloaded.async_load()
    assert reloaded.get("user-a") == updated


@pytest.mark.parametrize(
    "state",
    [
        lambda: EffectDraft(
            id=uuid4(),
            owner_id="",
            revision=1,
            item=_item(),
            updated_at="now",
        ),
        lambda: EffectDraft(
            id=uuid4(),
            owner_id="user",
            revision=0,
            item=_item(),
            updated_at="now",
        ),
        lambda: EffectUserState("", ()),
        lambda: EffectUserState(
            "user",
            tuple((value, 0, 0) for value in range(MAX_RECENT_COLOURS + 1)),
        ),
        lambda: EffectUserState("user", ((1, 2, 3), (1, 2, 3))),
    ],
)
def test_invalid_personal_state_is_rejected(state) -> None:
    with pytest.raises(EffectStorageError):
        state()


async def test_recovery_stores_drop_only_malformed_records(
    hass: HomeAssistant,
) -> None:
    valid_draft = EffectDraft(
        id=uuid4(),
        owner_id="user-a",
        revision=1,
        item=_item(),
        updated_at="2026-08-11T00:00:00Z",
    )
    draft_store = Store[dict[str, Any]](
        hass,
        DRAFT_STORE_VERSION,
        DRAFT_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=DRAFT_STORE_MINOR_VERSION,
    )
    await draft_store.async_save(
        {
            "drafts": {
                str(valid_draft.id): valid_draft.to_dict(),
                str(uuid4()): {"owner_id": "broken"},
                str(uuid4()): {"ignored": "x" * (MAX_JSON_STRING_LENGTH + 1)},
            }
        }
    )
    drafts = EffectDraftRepository(hass)

    assert await drafts.async_load() == (valid_draft,)
    repaired_drafts = await draft_store.async_load()
    assert repaired_drafts == {"drafts": {str(valid_draft.id): valid_draft.to_dict()}}

    valid_deployment = _deployment(DeploymentPhase.CONFIRMED)
    deployment_store = Store[dict[str, Any]](
        hass,
        DEPLOYMENT_STORE_VERSION,
        DEPLOYMENT_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=DEPLOYMENT_STORE_MINOR_VERSION,
    )
    await deployment_store.async_save(
        {
            "revision": 2,
            "records": {
                str(valid_deployment.operation_id): valid_deployment.to_dict(),
                str(uuid4()): {"phase": "broken"},
                str(uuid4()): {"ignored": "x" * (MAX_JSON_STRING_LENGTH + 1)},
            },
        }
    )
    deployments = EffectDeploymentRepository(hass)

    deployment_snapshot = await deployments.async_load()
    assert deployment_snapshot.records == (valid_deployment,)
    assert deployment_snapshot.revision == 3

    valid_device = ObservedDeviceState(
        config_entry_id="entry-a",
        mode="diy",
        observed_at="2026-08-11T00:00:00Z",
    )
    device_store = Store[dict[str, Any]](
        hass,
        DEVICE_CACHE_STORE_VERSION,
        DEVICE_CACHE_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=DEVICE_CACHE_STORE_MINOR_VERSION,
    )
    await device_store.async_save(
        {
            "devices": {
                valid_device.config_entry_id: valid_device.to_dict(),
                "broken": {"mode": "diy"},
                "oversized": {"ignored": "x" * (MAX_JSON_STRING_LENGTH + 1)},
            }
        }
    )
    cache = EffectDeviceCache(hass)

    assert await cache.async_load() == (valid_device,)

    valid_user = EffectUserState("user-a", preferences={"pane": "scenes"})
    user_store = Store[dict[str, Any]](
        hass,
        USER_STATE_STORE_VERSION,
        USER_STATE_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=USER_STATE_STORE_MINOR_VERSION,
    )
    await user_store.async_save(
        {
            "users": {
                valid_user.owner_id: valid_user.to_dict(),
                "broken": {"owner_id": ""},
                "oversized": {"ignored": "x" * (MAX_JSON_STRING_LENGTH + 1)},
            }
        }
    )
    user_state = EffectUserStateRepository(hass)

    assert await user_state.async_load() == (valid_user,)


@pytest.mark.parametrize(
    ("repository_type", "version", "key", "minor_version", "data"),
    [
        (
            EffectDraftRepository,
            DRAFT_STORE_VERSION,
            DRAFT_STORE_KEY,
            DRAFT_STORE_MINOR_VERSION,
            {"drafts": {}},
        ),
        (
            EffectDeploymentRepository,
            DEPLOYMENT_STORE_VERSION,
            DEPLOYMENT_STORE_KEY,
            DEPLOYMENT_STORE_MINOR_VERSION,
            {"revision": 0, "records": {}},
        ),
        (
            EffectDeviceCache,
            DEVICE_CACHE_STORE_VERSION,
            DEVICE_CACHE_STORE_KEY,
            DEVICE_CACHE_STORE_MINOR_VERSION,
            {"devices": {}},
        ),
        (
            EffectUserStateRepository,
            USER_STATE_STORE_VERSION,
            USER_STATE_STORE_KEY,
            USER_STATE_STORE_MINOR_VERSION,
            {"users": {}},
        ),
    ],
)
async def test_optional_stores_refuse_newer_minor_versions(
    hass: HomeAssistant,
    repository_type: type[Any],
    version: int,
    key: str,
    minor_version: int,
    data: dict[str, Any],
) -> None:
    store = Store[dict[str, Any]](
        hass,
        version,
        key,
        private=True,
        atomic_writes=True,
        minor_version=minor_version + 1,
    )
    await store.async_save(data)

    with pytest.raises(EffectStorageError, match="cannot migrate"):
        await repository_type(hass).async_load()


async def test_drafts_enforce_per_owner_capacity(
    hass: HomeAssistant,
) -> None:
    drafts = {
        str(draft.id): draft.to_dict()
        for draft in (
            EffectDraft(
                id=uuid4(),
                owner_id="user-a",
                revision=1,
                item=_item(),
                updated_at=f"2026-08-11T00:{index:02d}:00Z",
            )
            for index in range(MAX_DRAFTS_PER_OWNER)
        )
    }
    store = Store[dict[str, Any]](
        hass,
        DRAFT_STORE_VERSION,
        DRAFT_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=DRAFT_STORE_MINOR_VERSION,
    )
    await store.async_save({"drafts": drafts})
    repository = EffectDraftRepository(hass)
    await repository.async_load()
    extra = EffectDraft(
        id=uuid4(),
        owner_id="user-a",
        revision=1,
        item=_item(),
        updated_at="2026-08-11T01:00:00Z",
    )

    with pytest.raises(EffectStorageError, match="must not exceed"):
        await repository.async_put(extra, expected_revision=None)


async def test_deployment_history_discards_oldest_terminal_record(
    hass: HomeAssistant,
) -> None:
    records: dict[str, Any] = {}
    for index in range(MAX_DEPLOYMENT_RECORDS):
        record = replace(
            _deployment(DeploymentPhase.CONFIRMED),
            updated_at=f"2026-08-11T{index // 60:02d}:{index % 60:02d}:00Z",
        )
        records[str(record.operation_id)] = record.to_dict()
    oldest_id = next(iter(records))
    store = Store[dict[str, Any]](
        hass,
        DEPLOYMENT_STORE_VERSION,
        DEPLOYMENT_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=DEPLOYMENT_STORE_MINOR_VERSION,
    )
    await store.async_save({"revision": MAX_DEPLOYMENT_RECORDS, "records": records})
    repository = EffectDeploymentRepository(hass)
    snapshot = await repository.async_load()

    next_record = replace(
        _deployment(DeploymentPhase.PENDING),
        updated_at="2026-08-12T00:00:00Z",
    )
    updated = await repository.async_put(
        next_record,
        expected_revision=snapshot.revision,
    )

    assert len(updated.records) == MAX_DEPLOYMENT_RECORDS
    assert all(str(record.operation_id) != oldest_id for record in updated.records)
    assert repository.get(next_record.operation_id) == next_record
