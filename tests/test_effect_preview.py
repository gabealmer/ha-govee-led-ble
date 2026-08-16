"""Ephemeral Effect Studio preview workers."""

from __future__ import annotations

import asyncio
from dataclasses import replace
from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from custom_components.ha_govee_led_ble.const import DOMAIN, EFFECT_FAMILY_SCENES
from custom_components.ha_govee_led_ble.coordinator import GoveeBLECoordinator
from custom_components.ha_govee_led_ble.effect_catalogue import WORKSHOP_TEMPLATES
from custom_components.ha_govee_led_ble.effect_deployments import (
    EffectDeviceCache,
    ObservationConfidence,
    ObservedDeviceState,
)
from custom_components.ha_govee_led_ble.effect_diagnostics import EffectDiagnosticHistory
from custom_components.ha_govee_led_ble.effect_domain import (
    LibraryItem,
    MusicProfile,
    RelativeBrightness,
    SingleEffect,
    VideoProfile,
)
from custom_components.ha_govee_led_ble.effect_preview import (
    EffectPreviewManager,
    PreviewError,
    PreviewOwnershipError,
    PreviewPhase,
    PreviewRateLimitError,
    PreviewSequenceError,
    PreviewSessionNotFoundError,
    PreviewShutdownError,
    PreviewStatus,
)
from custom_components.ha_govee_led_ble.scenes import SCENE_ENTRIES
from tests.storage_test_double import InMemoryVersionedDocumentStore


def _item(name: str, speed: int = 50) -> LibraryItem:
    return LibraryItem.new(name, SingleEffect(0, 0, speed, ((255, 0, 0),)))


def _coordinator(*, model: str = "H617A", readable: bool = False) -> SimpleNamespace:
    coordinator = SimpleNamespace(
        model=model,
        profile=SimpleNamespace(state_readable=readable),
        effect_families={EFFECT_FAMILY_SCENES},
        _control_lock=asyncio.Lock(),
        is_on=False,
        effect=None,
        diy_code=None,
        music_mode="off",
        video_mode="off",
        writes=[],
    )
    coordinator.async_preview_preflight = AsyncMock()

    async def write(packet: bytes) -> None:
        coordinator.writes.append(packet)

    coordinator.async_preview_write = AsyncMock(side_effect=write)
    coordinator.async_preview_observe = AsyncMock(return_value=True)
    coordinator.send_command = AsyncMock(side_effect=AssertionError("preview verification must not call send_command"))
    return coordinator


async def _manager(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
    coordinator: Any,
    **timing: float,
) -> tuple[EffectPreviewManager, EffectDeviceCache]:
    cache = EffectDeviceCache(InMemoryVersionedDocumentStore())
    await cache.async_load()
    manager = EffectPreviewManager(
        hass,
        cache,
        EffectDiagnosticHistory(),
        write_cadence=timing.get("write_cadence", 0),
        verify_delay=timing.get("verify_delay", 0),
        verify_timeout=timing.get("verify_timeout", 0.1),
        connect_timeout=timing.get("connect_timeout", 0.1),
        failure_cooldown=timing.get("failure_cooldown", 0),
    )
    entry = SimpleNamespace(
        entry_id="entry-a",
        domain=DOMAIN,
        state=ConfigEntryState.LOADED,
        runtime_data=coordinator,
    )
    monkeypatch.setattr(
        hass.config_entries,
        "async_get_entry",
        lambda entry_id: entry if entry_id == entry.entry_id else None,
    )
    return manager, cache


def _open(manager: EffectPreviewManager, owner: object, events: list[PreviewStatus]) -> str:
    session_id = manager.open_session(owner=owner)
    manager.subscribe(
        session_id=session_id,
        owner=owner,
        subscription_id=object(),
        listener=events.append,
    )
    return session_id


async def test_worker_compiles_active_then_only_newest_pending_request(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    first_started = asyncio.Event()
    release_first = asyncio.Event()
    writes = 0

    async def write(packet: bytes) -> None:
        nonlocal writes
        writes += 1
        if writes == 1:
            first_started.set()
            await release_first.wait()
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    compiled_names: list[str] = []
    from custom_components.ha_govee_led_ble import effect_preview

    original_compile = effect_preview.compile_application

    def compile_recording(item, model, *, diy_code=None):
        compiled_names.append(item.name)
        return original_compile(item, model, diy_code=diy_code)

    monkeypatch.setattr(effect_preview, "compile_application", compile_recording)

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("first", 10),
    )
    await first_started.wait()
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("second", 20),
    )
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=3,
        updated_at="2026-08-17T00:00:02Z",
        item=_item("third", 30),
    )
    release_first.set()
    await manager.async_wait_idle("entry-a")

    assert compiled_names == ["first", "third"]
    assert any(
        event.sequence == 2 and event.phase is PreviewPhase.CANCELLED and event.error_code == "superseded"
        for event in events
    )
    await manager.async_shutdown()


async def test_newest_request_can_return_to_the_active_state(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    first_started = asyncio.Event()
    release_first = asyncio.Event()
    writes = 0

    async def write(packet: bytes) -> None:
        nonlocal writes
        writes += 1
        if writes == 1:
            first_started.set()
            await release_first.wait()
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])
    compiled_names: list[str] = []
    from custom_components.ha_govee_led_ble import effect_preview

    original_compile = effect_preview.compile_application

    def compile_recording(item, model, *, diy_code=None):
        compiled_names.append(item.name)
        return original_compile(item, model, diy_code=diy_code)

    monkeypatch.setattr(effect_preview, "compile_application", compile_recording)

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("state-a", 10),
    )
    await first_started.wait()
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("state-b", 20),
    )
    acceptance = await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=3,
        updated_at="2026-08-17T00:00:02Z",
        item=_item("state-a", 10),
    )
    release_first.set()
    await manager.async_wait_idle("entry-a")

    assert acceptance.accepted
    assert compiled_names == ["state-a", "state-a"]
    await manager.async_shutdown()


async def test_session_ownership_and_acceptance_rate_are_enforced(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])

    with pytest.raises(PreviewOwnershipError):
        manager.require_owner(session_id, object())

    for sequence in range(1, 11):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=sequence,
            updated_at=f"2026-08-17T00:00:{sequence:02d}Z",
            item=_item(f"request-{sequence}", sequence),
        )
    with pytest.raises(PreviewRateLimitError):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=11,
            updated_at="2026-08-17T00:00:11Z",
            item=_item("request-11", 11),
        )
    await manager.async_shutdown()


async def test_status_subscription_is_filtered_to_its_session(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    first_owner = object()
    second_owner = object()
    first_events: list[PreviewStatus] = []
    second_events: list[PreviewStatus] = []
    first_session = _open(manager, first_owner, first_events)
    _open(manager, second_owner, second_events)

    await manager.async_queue_snapshot(
        session_id=first_session,
        owner=first_owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("first"),
    )
    await manager.async_wait_idle("entry-a")

    assert first_events
    assert second_events == []
    await manager.async_shutdown()


async def test_device_write_starts_respect_backend_cadence(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    manager, _cache = await _manager(
        hass,
        monkeypatch,
        coordinator,
        write_cadence=0.05,
    )
    owner = object()
    writing_times = []

    def record(event) -> None:
        if event.phase is PreviewPhase.WRITING:
            writing_times.append(asyncio.get_running_loop().time())

    session_id = manager.open_session(owner=owner)
    manager.subscribe(
        session_id=session_id,
        owner=owner,
        subscription_id=object(),
        listener=record,
    )
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("first"),
    )
    await manager.async_wait_idle("entry-a")
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("second", 60),
    )
    await manager.async_wait_idle("entry-a")

    assert writing_times[1] - writing_times[0] >= 0.045
    await manager.async_shutdown()


async def test_native_scene_preview_uses_scene_speed_primitive_and_reasserts(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    applied = []

    async def apply_scene(scene_name, *, speed_index, writer, verify, force):
        async with coordinator._control_lock:
            applied.append((scene_name, speed_index, verify, force))
            await writer(b"scene")

    coordinator.async_apply_native_scene = AsyncMock(side_effect=apply_scene)
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])
    scene = next(entry for entry in SCENE_ENTRIES["H617A"] if entry.speed is not None)
    assert scene.speed is not None

    for sequence in (1, 2):
        acceptance = await manager.async_queue_scene(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=sequence,
            updated_at=f"2026-08-17T00:00:0{sequence}Z",
            scene_id=scene.scene_id,
            effect_id=scene.effect_id,
            speed_index=scene.speed.default_index,
        )
        assert acceptance.accepted is True
        await manager.async_wait_idle("entry-a")

    assert len(applied) == 2
    assert all(item[1:] == (scene.speed.default_index, False, True) for item in applied)
    await manager.async_shutdown()


async def test_transport_failure_stops_sequence_and_retains_newest_request_through_cooldown(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    failed_write_started = asyncio.Event()
    release_failure = asyncio.Event()
    failed_at = 0.0
    next_started_at = 0.0
    write_count = 0

    async def write(packet: bytes) -> None:
        nonlocal failed_at, next_started_at, write_count
        write_count += 1
        if write_count == 1:
            failed_write_started.set()
            await release_failure.wait()
            failed_at = asyncio.get_running_loop().time()
            raise OSError("transport failed")
        if next_started_at == 0:
            next_started_at = asyncio.get_running_loop().time()
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(
        hass,
        monkeypatch,
        coordinator,
        failure_cooldown=0.05,
    )
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("fails"),
    )
    await failed_write_started.wait()
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("retained", 60),
    )
    release_failure.set()
    await manager.async_wait_idle("entry-a")

    assert next_started_at - failed_at >= 0.045
    assert any(event.sequence == 1 and event.error_code == "transport_failed" for event in events)
    assert any(event.sequence == 2 and event.phase is PreviewPhase.WRITTEN for event in events)
    await manager.async_shutdown()


async def test_explicit_reassert_bypasses_transport_cooldown(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    attempts = 0

    async def write(packet: bytes) -> None:
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise OSError("transport failed")
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(
        hass,
        monkeypatch,
        coordinator,
        failure_cooldown=10,
    )
    owner = object()
    session_id = _open(manager, owner, [])
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("fails"),
    )
    await manager.async_wait_idle("entry-a")

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("reassert"),
        reassert=True,
    )
    async with asyncio.timeout(0.2):
        await manager.async_wait_idle("entry-a")
    await manager.async_shutdown()


async def test_latest_verification_is_read_only_and_owns_control_lock(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator(readable=True)

    async def observe(_expectations, *, timeout):
        assert timeout == 0.1
        assert coordinator._control_lock.locked()
        coordinator.send_command.assert_not_awaited()
        return True

    coordinator.async_preview_observe.side_effect = observe
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("verified"),
    )
    await manager.async_wait_idle("entry-a")

    coordinator.async_preview_observe.assert_awaited_once()
    coordinator.send_command.assert_not_awaited()
    assert any(
        event.phase is PreviewPhase.CONFIRMED and event.confidence is ObservationConfidence.ACTIVATION_MATCH
        for event in events
    )
    await manager.async_shutdown()


async def test_stale_in_progress_verification_finishes_but_cannot_publish(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator(readable=True)
    first_observation_started = asyncio.Event()
    release_first_observation = asyncio.Event()
    observation_count = 0

    async def observe(_expectations, *, timeout):
        nonlocal observation_count
        observation_count += 1
        if observation_count == 1:
            first_observation_started.set()
            await release_first_observation.wait()
        return True

    coordinator.async_preview_observe.side_effect = observe
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("first"),
    )
    await first_observation_started.wait()
    writes_before_newer = coordinator.async_preview_write.await_count
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("second", 60),
    )
    await asyncio.sleep(0)
    assert coordinator.async_preview_write.await_count == writes_before_newer

    release_first_observation.set()
    await manager.async_wait_idle("entry-a")

    current_sequences = [event.sequence for event in events if event.phase is PreviewPhase.CONFIRMED]
    assert current_sequences == [2]
    assert observation_count == 2
    await manager.async_shutdown()


async def test_workshop_write_remains_current_without_claiming_verification(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator(readable=True)
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    item = LibraryItem.new("Workshop", WORKSHOP_TEMPLATES[0].content("H617A"))

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=item,
    )
    await manager.async_wait_idle("entry-a")

    coordinator.async_preview_observe.assert_not_awaited()
    assert any(
        event.phase is PreviewPhase.WRITTEN and event.confidence is ObservationConfidence.WRITE_COMPLETED
        for event in events
    )
    await manager.async_shutdown()


@pytest.mark.parametrize(
    ("model", "item"),
    [
        (
            "H617A",
            LibraryItem.new(
                "Music",
                MusicProfile("H617A", "separation", 50, (1, 2, 3), None, {"point": 3, "gradient": True}),
            ),
        ),
        (
            "H6199",
            LibraryItem.new(
                "Video",
                VideoProfile(
                    "H6199",
                    "movie",
                    True,
                    70,
                    True,
                    40,
                    12,
                    RelativeBrightness(80, 60, 55, 45),
                    False,
                ),
            ),
        ),
    ],
)
async def test_snapshot_profile_previews_use_preview_transport(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
    model: str,
    item: LibraryItem,
) -> None:
    coordinator = GoveeBLECoordinator(
        hass,
        "AA:BB:CC:DD:EE:FF",
        model,
        configuration_url="homeassistant://ha-govee-led-ble/editor/entry-a",
    )
    coordinator.async_preview_preflight = AsyncMock()  # type: ignore[method-assign]
    coordinator.async_preview_write = AsyncMock()  # type: ignore[method-assign]
    coordinator.async_preview_observe = AsyncMock(return_value=True)  # type: ignore[method-assign]
    coordinator.send_command = AsyncMock(side_effect=AssertionError("preview must use preview transport"))  # type: ignore[method-assign]
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=item,
    )
    await manager.async_wait_idle("entry-a")

    coordinator.async_preview_write.assert_awaited()
    coordinator.send_command.assert_not_awaited()
    await manager.async_shutdown()


async def test_successful_unsaved_preview_invalidates_persistent_observed_match(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    manager, cache = await _manager(hass, monkeypatch, coordinator)
    operation_id = uuid4()
    cache.set(
        ObservedDeviceState(
            config_entry_id="entry-a",
            mode="custom",
            observed_at="2026-08-16T00:00:00Z",
            confidence=ObservationConfidence.ACTIVATION_MATCH,
            diy_code=207,
            matched_operation_id=operation_id,
        )
    )
    owner = object()
    session_id = _open(manager, owner, [])

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("invalidate"),
    )
    await manager.async_wait_idle("entry-a")

    observed = cache.get("entry-a")
    assert observed is not None
    assert observed.matched_operation_id is None
    assert observed.confidence is ObservationConfidence.UNKNOWN
    await manager.async_shutdown()


async def test_config_unload_waits_for_atomic_write_and_drops_pending_work(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    write_started = asyncio.Event()
    release_write = asyncio.Event()
    write_count = 0

    async def write(packet: bytes) -> None:
        nonlocal write_count
        write_count += 1
        if write_count == 1:
            write_started.set()
            await release_write.wait()
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("active"),
    )
    await write_started.wait()
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("pending", 60),
    )

    unload = asyncio.create_task(manager.async_unload_device("entry-a"))
    await asyncio.sleep(0)
    assert not unload.done()
    with pytest.raises(PreviewError, match="not loaded"):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=3,
            updated_at="2026-08-17T00:00:02Z",
            item=_item("rejected", 70),
        )
    release_write.set()
    await unload

    assert "entry-a" not in manager._devices
    await manager.async_shutdown()


async def test_session_cancel_finishes_active_sequence_without_replaying_pending_work(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    write_started = asyncio.Event()
    release_write = asyncio.Event()
    write_count = 0

    async def write(packet: bytes) -> None:
        nonlocal write_count
        write_count += 1
        if write_count == 1:
            write_started.set()
            await release_write.wait()
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("active"),
    )
    await write_started.wait()
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        item=_item("pending", 60),
    )

    await manager.async_cancel(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
    )
    release_write.set()
    await manager.async_wait_idle("entry-a")

    assert any(event.sequence == 1 and event.error_code == "session_cancelled" for event in events)
    assert any(event.sequence == 2 and event.error_code == "session_cancelled" for event in events)
    assert not any(event.phase is PreviewPhase.WRITTEN for event in events)
    await manager.async_shutdown()


async def test_shutdown_marks_active_sequence_incomplete_and_rejects_new_sessions(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    write_started = asyncio.Event()
    release_write = asyncio.Event()

    async def write(packet: bytes) -> None:
        write_started.set()
        await release_write.wait()
        coordinator.writes.append(packet)

    coordinator.async_preview_write.side_effect = write
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("shutdown"),
    )
    await write_started.wait()

    shutdown = asyncio.create_task(manager.async_shutdown())
    await asyncio.sleep(0)
    release_write.set()
    await shutdown

    assert any(event.phase is PreviewPhase.FAILED and event.error_code == "shutdown_incomplete" for event in events)
    with pytest.raises(PreviewShutdownError):
        manager.open_session(owner=object())


async def test_session_and_device_lifecycle_edge_cases(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    manager, _cache = await _manager(hass, monkeypatch, _coordinator())
    owner = object()
    listener = AsyncMock()
    session_id = manager.open_session(owner=owner)
    unsubscribe = manager.subscribe(
        session_id=session_id,
        owner=owner,
        subscription_id="subscription",
        listener=listener,
    )
    unsubscribe()
    unsubscribe()

    with pytest.raises(PreviewOwnershipError):
        manager.require_owner(session_id, object())
    with pytest.raises(PreviewSessionNotFoundError, match="not found"):
        manager.require_owner(str(uuid4()), owner)

    await manager.async_unload_device("missing-entry")
    await manager.async_load_device("missing-entry")
    await manager.async_close_session(session_id, owner)
    await manager.async_shutdown()
    await manager.async_shutdown()

    with pytest.raises(PreviewShutdownError):
        manager.open_session(owner=owner)


async def test_scene_preview_validation_errors(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    coordinator.effect_families = set()
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])
    speed_scene = next(entry for entry in SCENE_ENTRIES["H617A"] if entry.speed is not None)
    no_speed_scene = next(entry for entry in SCENE_ENTRIES["H617A"] if entry.speed is None)

    with pytest.raises(PreviewError, match="not enabled"):
        await manager.async_queue_scene(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=1,
            updated_at="2026-08-17T00:00:00Z",
            scene_id=speed_scene.scene_id,
            effect_id=speed_scene.effect_id,
            speed_index=None,
        )

    coordinator.effect_families = {EFFECT_FAMILY_SCENES}
    with pytest.raises(PreviewError, match="does not expose"):
        await manager.async_queue_scene(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=1,
            updated_at="2026-08-17T00:00:00Z",
            scene_id=no_speed_scene.scene_id,
            effect_id=no_speed_scene.effect_id,
            speed_index=1,
        )
    assert speed_scene.speed is not None
    with pytest.raises(PreviewError, match="outside"):
        await manager.async_queue_scene(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=1,
            updated_at="2026-08-17T00:00:00Z",
            scene_id=speed_scene.scene_id,
            effect_id=speed_scene.effect_id,
            speed_index=speed_scene.speed.option_count,
        )
    await manager.async_shutdown()


async def test_preview_acceptance_rejects_stale_unloading_and_incompatible_requests(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    manager, _cache = await _manager(hass, monkeypatch, _coordinator())
    owner = object()
    session_id = _open(manager, owner, [])

    with pytest.raises(PreviewSequenceError, match="from 1"):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=0,
            updated_at="2026-08-17T00:00:00Z",
            item=_item("zero"),
        )

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("first"),
    )
    with pytest.raises(PreviewSequenceError, match="increase"):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=1,
            updated_at="2026-08-17T00:00:01Z",
            item=_item("stale"),
        )
    await manager.async_wait_idle("entry-a")

    incompatible = LibraryItem.new(
        "Video",
        VideoProfile(
            "H6199",
            "movie",
            True,
            70,
            True,
            40,
            12,
            RelativeBrightness(80, 60, 55, 45),
            False,
        ),
    )
    with pytest.raises(PreviewError, match="not supported"):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=2,
            updated_at="2026-08-17T00:00:02Z",
            item=incompatible,
        )

    await manager.async_unload_device("entry-a")
    with pytest.raises(PreviewError, match="not loaded"):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=2,
            updated_at="2026-08-17T00:00:02Z",
            item=_item("unloading"),
        )
    await manager.async_load_device("entry-a")
    manager._stopping = True
    with pytest.raises(PreviewShutdownError):
        await manager.async_queue_snapshot(
            session_id=session_id,
            owner=owner,
            config_entry_id="entry-a",
            sequence=2,
            updated_at="2026-08-17T00:00:02Z",
            item=_item("stopping"),
        )
    await manager.async_shutdown()


async def test_pending_verification_is_cancelled_by_new_work_cancel_unload_and_shutdown(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from custom_components.ha_govee_led_ble import effect_preview

    coordinator = _coordinator()
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    session_id = _open(manager, owner, [])
    request = effect_preview._PreviewRequest(
        session_id=session_id,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        fingerprint="pending",
        generation=1,
        correlation_id="correlation",
        reassert=False,
        content_kind="h617a_single",
        item=_item("pending"),
    )
    verification = asyncio.create_task(asyncio.sleep(10))
    manager._devices["entry-a"] = effect_preview._DeviceWorker(
        verification_task=verification,
        verification_request=request,
    )
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("new"),
    )
    await asyncio.gather(verification, return_exceptions=True)
    await manager.async_wait_idle("entry-a")

    verification = asyncio.create_task(asyncio.sleep(10))
    worker = manager._devices["entry-a"]
    worker.verification_task = verification
    worker.verification_request = replace(request, sequence=2)
    await manager.async_cancel(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
    )
    await asyncio.gather(verification, return_exceptions=True)

    verification = asyncio.create_task(asyncio.sleep(10))
    worker.pending = replace(request, sequence=3, generation=3)
    worker.verification_task = verification
    worker.verification_request = replace(request, sequence=3)
    await manager.async_unload_device("entry-a")
    await asyncio.gather(verification, return_exceptions=True)
    await manager.async_load_device("entry-a")

    worker = effect_preview._DeviceWorker(
        pending=replace(request, sequence=4, generation=4),
        verification_task=asyncio.create_task(asyncio.sleep(10)),
        verification_request=replace(request, sequence=4),
    )
    manager._devices["entry-a"] = worker
    await manager.async_shutdown()
    assert not manager._devices


async def test_compilation_failure_is_reported_without_writing(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    coordinator = _coordinator()
    manager, _cache = await _manager(hass, monkeypatch, coordinator)
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)
    from custom_components.ha_govee_led_ble import effect_preview

    def compile_failure(*_args, **_kwargs):
        raise ValueError("invalid")

    monkeypatch.setattr(effect_preview, "compile_application", compile_failure)
    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("invalid"),
    )
    await manager.async_wait_idle("entry-a")

    coordinator.async_preview_write.assert_not_awaited()
    assert any(event.phase is PreviewPhase.FAILED and event.error_code == "compilation_failed" for event in events)
    await manager.async_shutdown()


@pytest.mark.parametrize(
    ("observation", "error_code"),
    [
        (False, "device_state_mismatch"),
        (RuntimeError("read failed"), "device_readback_unknown"),
        ("timeout", "device_readback_unknown"),
    ],
)
async def test_preview_verification_reports_non_successful_readback(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
    observation: object,
    error_code: str,
) -> None:
    coordinator = _coordinator(readable=True)
    if observation == "timeout":

        async def observe(*_args, **_kwargs):
            await asyncio.sleep(1)

        coordinator.async_preview_observe.side_effect = observe
    elif isinstance(observation, Exception):
        coordinator.async_preview_observe.side_effect = observation
    else:
        coordinator.async_preview_observe.return_value = observation
    manager, _cache = await _manager(
        hass,
        monkeypatch,
        coordinator,
        verify_timeout=0.01,
    )
    owner = object()
    events: list[PreviewStatus] = []
    session_id = _open(manager, owner, events)

    await manager.async_queue_snapshot(
        session_id=session_id,
        owner=owner,
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        item=_item("verify"),
    )
    await manager.async_wait_idle("entry-a")

    assert any(event.phase is PreviewPhase.UNCONFIRMED and event.error_code == error_code for event in events)
    await manager.async_shutdown()


def test_preview_helper_expectations_and_state_installation() -> None:
    from custom_components.ha_govee_led_ble import effect_preview

    item = _item("Single", 42)
    request = effect_preview._PreviewRequest(
        session_id="session",
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        fingerprint="fingerprint",
        generation=1,
        correlation_id="correlation",
        reassert=False,
        content_kind="h617a_single",
        item=item,
        diy_code=800,
    )
    compiled = effect_preview.compile_application(item, "H617A", diy_code=800)
    readable = SimpleNamespace(profile=SimpleNamespace(state_readable=True))
    unreadable = SimpleNamespace(profile=SimpleNamespace(state_readable=False))

    assert effect_preview._snapshot_fingerprint("H617A", item) == effect_preview._snapshot_fingerprint("H617A", item)
    assert effect_preview._required_item(request) is item
    assert effect_preview._verification_expectations(unreadable, request, compiled) is None
    assert effect_preview._verification_expectations(readable, request, compiled) == {
        "is_on": True,
        "diy_code": 800,
    }
    coordinator = SimpleNamespace(effect="old", diy_code=None, music_mode="on", video_mode="movie")
    effect_preview._install_effect_state(coordinator, compiled)
    assert coordinator.effect is None
    assert coordinator.diy_code == 800
    assert coordinator.music_mode == coordinator.video_mode == "off"
    assert effect_preview._confirmed_confidence(request, compiled) is ObservationConfidence.ACTIVATION_MATCH

    scene_compiled = replace(
        compiled,
        activation_mode=effect_preview.ActivationMode.SCENE,
        expected_effect="scene.test",
    )
    scene_state = SimpleNamespace(effect=None, diy_code=800, music_mode="on", video_mode="movie")
    effect_preview._install_effect_state(scene_state, scene_compiled)
    assert scene_state.effect == "scene.test"
    assert scene_state.diy_code is None
    assert effect_preview._verification_expectations(readable, request, scene_compiled) == {
        "is_on": True,
        "effect": "scene.test",
    }
    h6199_compiled = replace(compiled, model="H6199")
    assert effect_preview._verification_expectations(readable, request, h6199_compiled) is None

    scene_entry = next(entry for entry in SCENE_ENTRIES["H617A"] if entry.speed is not None)
    scene = effect_preview.resolve_scene("H617A", scene_entry.scene_id, scene_entry.effect_id)
    scene_request = effect_preview._PreviewRequest(
        session_id="session",
        config_entry_id="entry-a",
        sequence=2,
        updated_at="2026-08-17T00:00:01Z",
        fingerprint="scene",
        generation=2,
        correlation_id="correlation",
        reassert=True,
        content_kind="scene_builtin",
        scene=scene,
    )
    assert effect_preview._verification_expectations(readable, scene_request, None) == {
        "is_on": True,
        "effect": scene.key,
    }
    assert effect_preview._confirmed_confidence(scene_request, None) is ObservationConfidence.ACTIVATION_MATCH

    music_item = LibraryItem.new(
        "Music",
        MusicProfile("H617A", "separation", 50, (1, 2, 3), None, {"point": 3, "gradient": True}),
    )
    music = effect_preview.compile_application(music_item, "H617A")
    assert effect_preview._verification_expectations(readable, request, music) == {
        "is_on": True,
        "music_mode": "separation",
    }
    assert effect_preview._confirmed_confidence(request, music) is ObservationConfidence.MODE_MATCH

    h6199_music_item = LibraryItem.new(
        "Rhythm",
        MusicProfile("H6199", "rhythm", 60, (4, 5, 6), True, {}),
    )
    h6199_music = effect_preview.compile_application(h6199_music_item, "H6199")
    assert effect_preview._verification_expectations(readable, request, h6199_music) == {
        "is_on": True,
        "music_mode": "rhythm",
        "music_sensitivity": 60,
        "music_color": (4, 5, 6),
        "music_calm": True,
    }

    video_item = LibraryItem.new(
        "Video",
        VideoProfile(
            "H6199",
            "movie",
            True,
            70,
            True,
            40,
            12,
            RelativeBrightness(80, 60, 55, 45),
            False,
        ),
    )
    video = effect_preview.compile_application(video_item, "H6199")
    video_expectations = effect_preview._verification_expectations(readable, request, video)
    assert video_expectations is not None
    assert video_expectations["video_mode"] == "movie"
    assert video_expectations["relative_brightness"] is None
    assert effect_preview._confirmed_confidence(request, video) is ObservationConfidence.SETTINGS_MATCH

    missing = effect_preview._PreviewRequest(
        session_id="session",
        config_entry_id="entry-a",
        sequence=3,
        updated_at="2026-08-17T00:00:02Z",
        fingerprint="missing",
        generation=3,
        correlation_id="correlation",
        reassert=False,
        content_kind="advanced",
    )
    with pytest.raises(RuntimeError, match="no effect content"):
        effect_preview._required_item(missing)

    workshop_item = LibraryItem.new("Workshop", WORKSHOP_TEMPLATES[0].content("H617A"))
    workshop = effect_preview.compile_application(workshop_item, "H617A")
    assert effect_preview._verification_expectations(readable, request, workshop) is None
    untouched = SimpleNamespace(effect="old", diy_code=7, music_mode="on", video_mode="movie")
    effect_preview._install_effect_state(untouched, workshop)
    assert (untouched.effect, untouched.diy_code, untouched.music_mode, untouched.video_mode) == (
        "old",
        7,
        "on",
        "movie",
    )


def test_preview_publish_handles_missing_sessions_and_listener_errors(
    hass: HomeAssistant,
) -> None:
    from custom_components.ha_govee_led_ble import effect_preview

    manager = EffectPreviewManager(
        hass,
        EffectDeviceCache(InMemoryVersionedDocumentStore()),
        EffectDiagnosticHistory(),
    )
    request = effect_preview._PreviewRequest(
        session_id="missing",
        config_entry_id="entry-a",
        sequence=1,
        updated_at="2026-08-17T00:00:00Z",
        fingerprint="fingerprint",
        generation=1,
        correlation_id="correlation",
        reassert=False,
        content_kind="h617a_single",
        item=_item("publish"),
    )
    manager._publish(request, PreviewPhase.WRITTEN)

    owner = object()
    session_id = manager.open_session(owner=owner)

    def broken_listener(_status: PreviewStatus) -> None:
        raise RuntimeError("listener failed")

    manager.subscribe(
        session_id=session_id,
        owner=owner,
        subscription_id="broken",
        listener=broken_listener,
    )
    manager._publish(
        replace(request, session_id=session_id),
        PreviewPhase.WRITTEN,
    )
