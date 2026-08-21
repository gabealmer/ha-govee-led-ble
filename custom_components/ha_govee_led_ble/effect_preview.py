"""Ephemeral latest-only Effect Studio device previews."""

from __future__ import annotations

import asyncio
import json
import logging
from collections import deque
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field, replace
from enum import StrEnum
from hashlib import sha256
from typing import Any
from uuid import uuid4

from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import Event, HomeAssistant

from .const import DOMAIN
from .effect_catalogue import H6199_PALETTE_DIY_APPLY_CODE, H6199_WORKSHOP_APPLY_CODE
from .effect_compiler import (
    ActivationMode,
    CompatibilityState,
    CompiledApplication,
    CompiledEffect,
    CompiledMusicProfile,
    CompiledVideoProfile,
    compatibility,
    compile_application,
)
from .effect_deployments import ObservationConfidence
from .effect_diagnostics import DiagnosticOutcome, DiagnosticStage, EffectDiagnosticHistory
from .effect_domain import LayeredScene, LibraryItem, PaletteScene, effect_content_to_dict
from .effect_identity import EffectDeviceCache
from .effect_limits import MAX_PREVIEW_REQUESTS_PER_SECOND, MAX_PREVIEW_SEQUENCE
from .effect_runtime import async_apply_compiled_profile, async_write_packets, resolve_diy_code
from .effect_scene_defaults import NativeSceneDefault, NativeSceneDefaultRepository
from .effect_scenes import ResolvedScene, resolve_scene, resolve_scene_application_body
from .generated_protocol_adapter import build_power
from .h6199_calibration import WHITE_BALANCE_POSITIONS
from .native_scenes import encode_authored_scene_body, resolve_native_scene_body

PREVIEW_WRITE_CADENCE = 0.25
PREVIEW_VERIFY_DELAY = 0.75
PREVIEW_VERIFY_TIMEOUT = 2.0
PREVIEW_CONNECT_TIMEOUT = 8.0
PREVIEW_FAILURE_COOLDOWN = 2.0

_LOGGER = logging.getLogger(__name__)


class PreviewError(ValueError):
    """Base error for preview contract failures."""


class PreviewSessionNotFoundError(PreviewError):
    pass


class PreviewOwnershipError(PreviewError):
    pass


class PreviewSequenceError(PreviewError):
    pass


class PreviewRateLimitError(PreviewError):
    pass


class PreviewShutdownError(RuntimeError):
    pass


class _PreviewSupersededError(RuntimeError):
    pass


class PreviewPhase(StrEnum):
    QUEUED = "queued"
    WRITING = "writing"
    WRITTEN = "written"
    CONFIRMED = "confirmed"
    UNCONFIRMED = "unconfirmed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(frozen=True, slots=True)
class PreviewStatus:
    session_id: str
    config_entry_id: str
    sequence: int
    phase: PreviewPhase
    content_kind: str
    confidence: ObservationConfidence
    error_code: str | None

    def to_dict(self) -> dict[str, str | int | None]:
        return {
            "session_id": self.session_id,
            "config_entry_id": self.config_entry_id,
            "sequence": self.sequence,
            "phase": self.phase.value,
            "content_kind": self.content_kind,
            "confidence": self.confidence.value,
            "error_code": self.error_code,
        }


@dataclass(frozen=True, slots=True)
class PreviewAcceptance:
    accepted: bool
    session_id: str
    config_entry_id: str
    sequence: int
    reason: str | None = None

    def to_dict(self) -> dict[str, str | int | bool | None]:
        return {
            "accepted": self.accepted,
            "session_id": self.session_id,
            "config_entry_id": self.config_entry_id,
            "sequence": self.sequence,
            "reason": self.reason,
        }


@dataclass(slots=True)
class _PreviewSession:
    owner: object
    listeners: dict[object, Callable[[PreviewStatus], None]] = field(default_factory=dict)
    last_sequence: int = 0
    accepted_at: deque[float] = field(default_factory=deque)


@dataclass(frozen=True, slots=True)
class _PreviewRequest:
    session_id: str
    config_entry_id: str
    sequence: int
    updated_at: str
    fingerprint: str
    generation: int
    correlation_id: str
    reassert: bool
    committed: bool
    content_kind: str
    item: LibraryItem | None = None
    diy_code: int | None = None
    scene: ResolvedScene | None = None
    speed_index: int | None = None
    canonical_body: bytes | None = None


@dataclass(slots=True)
class _DeviceWorker:
    wake: asyncio.Event = field(default_factory=asyncio.Event)
    pending: _PreviewRequest | None = None
    active: _PreviewRequest | None = None
    task: asyncio.Task[None] | None = None
    verification_task: asyncio.Task[None] | None = None
    verification_request: _PreviewRequest | None = None
    verification_observing: bool = False
    cancelled_generations: set[int] = field(default_factory=set)
    latest_accepted_generation: int = 0
    last_write_started: float = float("-inf")
    cooldown_until: float = 0.0
    closing: bool = False


class _PreviewWriter:
    def __init__(
        self,
        manager: EffectPreviewManager,
        request: _PreviewRequest,
        coordinator: Any,
    ) -> None:
        self._manager = manager
        self._request = request
        self._coordinator = coordinator
        self.started = False

    async def __call__(self, packet: bytes) -> None:
        if not self.started:
            await self._manager._async_begin_transmission(self._request)
            self.started = True
        if self._manager._stopping or self._manager._hass.is_stopping:
            raise PreviewShutdownError("Home Assistant is stopping")
        await self._coordinator.async_preview_write(packet)


class EffectPreviewManager:
    """Own connection-bound sessions and one latest-only worker per device."""

    def __init__(
        self,
        hass: HomeAssistant,
        device_cache: EffectDeviceCache,
        scene_defaults: NativeSceneDefaultRepository,
        diagnostics: EffectDiagnosticHistory,
        *,
        write_cadence: float = PREVIEW_WRITE_CADENCE,
        verify_delay: float = PREVIEW_VERIFY_DELAY,
        verify_timeout: float = PREVIEW_VERIFY_TIMEOUT,
        connect_timeout: float = PREVIEW_CONNECT_TIMEOUT,
        failure_cooldown: float = PREVIEW_FAILURE_COOLDOWN,
    ) -> None:
        self._hass = hass
        self._device_cache = device_cache
        self._scene_defaults = scene_defaults
        self._diagnostics = diagnostics
        self._write_cadence = write_cadence
        self._verify_delay = verify_delay
        self._verify_timeout = verify_timeout
        self._connect_timeout = connect_timeout
        self._failure_cooldown = failure_cooldown
        self._sessions: dict[str, _PreviewSession] = {}
        self._devices: dict[str, _DeviceWorker] = {}
        self._blocked_devices: set[str] = set()
        self._generation = 0
        self._lock = asyncio.Lock()
        self._stopping = False
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, self._async_handle_hass_stop)

    def open_session(
        self,
        *,
        owner: object,
    ) -> str:
        if self._stopping or self._hass.is_stopping:
            raise PreviewShutdownError("Home Assistant is stopping")
        session_id = str(uuid4())
        self._sessions[session_id] = _PreviewSession(owner)
        return session_id

    def subscribe(
        self,
        *,
        session_id: str,
        owner: object,
        subscription_id: object,
        listener: Callable[[PreviewStatus], None],
    ) -> Callable[[], None]:
        self.require_owner(session_id, owner)
        session = self._sessions[session_id]
        session.listeners[subscription_id] = listener

        def unsubscribe() -> None:
            current = self._sessions.get(session_id)
            if current is not None and current.owner is owner:
                current.listeners.pop(subscription_id, None)

        return unsubscribe

    def require_owner(self, session_id: str, owner: object) -> None:
        session = self._sessions.get(session_id)
        if session is None:
            raise PreviewSessionNotFoundError("preview session was not found")
        if session.owner is not owner:
            raise PreviewOwnershipError("preview session belongs to another WebSocket connection")

    async def async_queue_snapshot(
        self,
        *,
        session_id: str,
        owner: object,
        config_entry_id: str,
        sequence: int,
        updated_at: str,
        item: LibraryItem,
        reassert: bool = False,
        committed: bool = False,
    ) -> PreviewAcceptance:
        self.require_owner(session_id, owner)
        coordinator = self._loaded_coordinator(config_entry_id)
        result = compatibility(item, coordinator.model)
        if result.state is not CompatibilityState.COMPATIBLE:
            raise PreviewError("; ".join(result.reasons))
        diy_code = resolve_diy_code(item)
        fingerprint = _snapshot_fingerprint(coordinator.model, item)
        request = _PreviewRequest(
            session_id=session_id,
            config_entry_id=config_entry_id,
            sequence=sequence,
            updated_at=updated_at,
            fingerprint=fingerprint,
            generation=0,
            correlation_id=str(uuid4()),
            reassert=reassert,
            committed=committed,
            content_kind=str(effect_content_to_dict(item.content)["kind"]),
            item=item,
            diy_code=diy_code,
        )
        return await self._async_accept(owner, request)

    async def async_queue_scene(
        self,
        *,
        session_id: str,
        owner: object,
        config_entry_id: str,
        sequence: int,
        updated_at: str,
        scene_id: int,
        effect_id: int,
        speed_index: int | None,
        committed: bool = False,
    ) -> PreviewAcceptance:
        self.require_owner(session_id, owner)
        coordinator = self._loaded_coordinator(config_entry_id)
        resolved = resolve_scene(coordinator.model, scene_id, effect_id)
        scene_default = self._scene_defaults.get(
            config_entry_id,
            scene_id,
            effect_id,
        )
        try:
            canonical_body, resolved_speed = resolve_scene_application_body(
                resolved.entry,
                scene_default=scene_default,
                speed_index=speed_index,
            )
        except ValueError as exc:
            raise PreviewError(str(exc)) from exc
        request = _PreviewRequest(
            session_id=session_id,
            config_entry_id=config_entry_id,
            sequence=sequence,
            updated_at=updated_at,
            fingerprint=(
                f"scene:{coordinator.model}:{scene_id}:{effect_id}:{resolved_speed}:"
                f"{sha256(canonical_body).hexdigest()}"
            ),
            generation=0,
            correlation_id=str(uuid4()),
            reassert=True,
            committed=committed,
            content_kind="scene_builtin",
            scene=resolved,
            speed_index=resolved_speed,
            canonical_body=canonical_body or None,
        )
        return await self._async_accept(owner, request)

    async def _async_accept(
        self,
        owner: object,
        request: _PreviewRequest,
    ) -> PreviewAcceptance:
        if not 1 <= request.sequence <= MAX_PREVIEW_SEQUENCE:
            raise PreviewSequenceError(f"preview sequence must be from 1 to {MAX_PREVIEW_SEQUENCE}")
        superseded: _PreviewRequest | None = None
        async with self._lock:
            session = self._session_owner_locked(request.session_id, owner)
            if self._stopping or self._hass.is_stopping:
                raise PreviewShutdownError("Home Assistant is stopping")
            if request.config_entry_id in self._blocked_devices:
                raise PreviewError("target config entry is unloading")
            if request.sequence <= session.last_sequence:
                raise PreviewSequenceError("preview sequence must increase within the session")
            worker = self._devices.setdefault(request.config_entry_id, _DeviceWorker())
            now = asyncio.get_running_loop().time()
            while session.accepted_at and now - session.accepted_at[0] >= 1:
                session.accepted_at.popleft()
            if len(session.accepted_at) >= MAX_PREVIEW_REQUESTS_PER_SECOND:
                raise PreviewRateLimitError(
                    f"preview session accepts at most {MAX_PREVIEW_REQUESTS_PER_SECOND} requests per second"
                )
            self._generation += 1
            request = replace(request, generation=self._generation)
            session.last_sequence = request.sequence
            session.accepted_at.append(now)
            superseded = worker.pending
            worker.pending = request
            worker.latest_accepted_generation = request.generation
            if request.reassert:
                worker.cooldown_until = 0
            if worker.verification_task is not None and not worker.verification_observing:
                worker.verification_task.cancel()
                worker.verification_task = None
                worker.verification_request = None
            if worker.task is None or worker.task.done():
                worker.closing = False
                worker.task = self._hass.async_create_task(
                    self._async_device_worker(request.config_entry_id),
                    name=f"{DOMAIN} preview {request.config_entry_id}",
                )
            worker.wake.set()
        if superseded is not None:
            self._publish(superseded, PreviewPhase.CANCELLED, error_code="superseded")
        self._publish(request, PreviewPhase.QUEUED)
        return PreviewAcceptance(True, request.session_id, request.config_entry_id, request.sequence)

    async def async_cancel(
        self,
        *,
        session_id: str,
        owner: object,
        config_entry_id: str | None = None,
    ) -> None:
        self.require_owner(session_id, owner)
        cancelled: list[_PreviewRequest] = []
        async with self._lock:
            self._session_owner_locked(session_id, owner)
            for device_id, worker in self._devices.items():
                if config_entry_id is not None and device_id != config_entry_id:
                    continue
                if worker.pending is not None and worker.pending.session_id == session_id:
                    cancelled.append(worker.pending)
                    worker.cancelled_generations.add(worker.pending.generation)
                    worker.pending = None
                if worker.active is not None and worker.active.session_id == session_id:
                    cancelled.append(worker.active)
                    worker.cancelled_generations.add(worker.active.generation)
                if (
                    worker.verification_request is not None
                    and worker.verification_request.session_id == session_id
                    and not worker.verification_observing
                    and worker.verification_task is not None
                ):
                    worker.verification_task.cancel()
                    worker.verification_task = None
                    worker.verification_request = None
                worker.wake.set()
        for request in cancelled:
            self._publish(request, PreviewPhase.CANCELLED, error_code="session_cancelled")

    async def async_close_session(self, session_id: str, owner: object) -> None:
        self.require_owner(session_id, owner)
        await self.async_cancel(session_id=session_id, owner=owner)
        async with self._lock:
            session = self._sessions.get(session_id)
            if session is not None and session.owner is owner:
                self._sessions.pop(session_id, None)

    async def async_unload_device(self, config_entry_id: str) -> None:
        cancelled: list[_PreviewRequest] = []
        async with self._lock:
            self._blocked_devices.add(config_entry_id)
            worker = self._devices.get(config_entry_id)
            if worker is None:
                return
            worker.closing = True
            if worker.pending is not None:
                cancelled.append(worker.pending)
                worker.cancelled_generations.add(worker.pending.generation)
                worker.pending = None
            if worker.active is not None:
                cancelled.append(worker.active)
                worker.cancelled_generations.add(worker.active.generation)
            worker.wake.set()
            task = worker.task
            verification_task = worker.verification_task
            if verification_task is not None and not worker.verification_observing:
                verification_task.cancel()
                worker.verification_task = None
                worker.verification_request = None
        for request in cancelled:
            self._publish(request, PreviewPhase.CANCELLED, error_code="device_unloaded")
        if task is not None:
            await asyncio.gather(task, return_exceptions=True)
        if verification_task is not None:
            await asyncio.gather(verification_task, return_exceptions=True)
        async with self._lock:
            self._devices.pop(config_entry_id, None)

    async def async_load_device(self, config_entry_id: str) -> None:
        async with self._lock:
            self._blocked_devices.discard(config_entry_id)

    async def async_shutdown(self) -> None:
        async with self._lock:
            if self._stopping:
                tasks = [
                    task
                    for worker in self._devices.values()
                    for task in (worker.task, worker.verification_task)
                    if task is not None
                ]
            else:
                self._stopping = True
                tasks = []
                for worker in self._devices.values():
                    worker.closing = True
                    if worker.pending is not None:
                        self._publish(worker.pending, PreviewPhase.FAILED, error_code="shutdown_incomplete")
                        worker.cancelled_generations.add(worker.pending.generation)
                        worker.pending = None
                    if worker.active is not None:
                        worker.cancelled_generations.add(worker.active.generation)
                    worker.wake.set()
                    if worker.verification_task is not None and not worker.verification_observing:
                        worker.verification_task.cancel()
                    tasks.extend(task for task in (worker.task, worker.verification_task) if task is not None)
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        async with self._lock:
            self._devices.clear()
            self._sessions.clear()

    async def async_wait_idle(self, config_entry_id: str) -> None:
        while True:
            async with self._lock:
                worker = self._devices.get(config_entry_id)
                tasks = (
                    []
                    if worker is None
                    else [
                        task for task in (worker.task, worker.verification_task) if task is not None and not task.done()
                    ]
                )
            if not tasks:
                return
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _async_device_worker(self, config_entry_id: str) -> None:
        current_task = asyncio.current_task()
        try:
            while True:
                async with self._lock:
                    worker = self._devices.get(config_entry_id)
                    if worker is None or worker.closing:
                        return
                    request = worker.pending
                    if request is None:
                        return
                    now = asyncio.get_running_loop().time()
                    not_before = max(
                        worker.last_write_started + self._write_cadence,
                        0 if request.reassert else worker.cooldown_until,
                    )
                    delay = max(0.0, not_before - now)
                    if delay:
                        worker.wake.clear()
                    else:
                        worker.pending = None
                        worker.active = request
                if delay:
                    try:
                        await asyncio.wait_for(worker.wake.wait(), timeout=delay)
                    except TimeoutError:
                        pass
                    continue
                await self._async_execute_request(request)
                async with self._lock:
                    worker = self._devices.get(config_entry_id)
                    if worker is None:
                        return
                    worker.active = None
                    worker.cancelled_generations.discard(request.generation)
        finally:
            async with self._lock:
                worker = self._devices.get(config_entry_id)
                if worker is not None and worker.task is current_task:
                    worker.task = None
                    if worker.pending is not None and not worker.closing:
                        worker.task = self._hass.async_create_task(
                            self._async_device_worker(config_entry_id),
                            name=f"{DOMAIN} preview {config_entry_id}",
                        )

    async def _async_execute_request(self, request: _PreviewRequest) -> None:
        try:
            coordinator = self._loaded_coordinator(request.config_entry_id)
            compiled = (
                None
                if request.scene is not None
                else compile_application(
                    _required_item(request),
                    coordinator.model,
                    diy_code=request.diy_code,
                )
            )
        except Exception as exc:
            self._diagnostics.record(
                DiagnosticStage.COMPILATION,
                DiagnosticOutcome.FAILED,
                "preview_compilation_failed",
                correlation_id=request.correlation_id,
                config_entry_id=request.config_entry_id,
                details={"error_type": type(exc).__name__, "sequence": request.sequence},
            )
            self._publish(request, PreviewPhase.FAILED, error_code="compilation_failed")
            return

        try:
            await coordinator.async_preview_preflight(timeout=self._connect_timeout)
            writer = _PreviewWriter(self, request, coordinator)
            if request.scene is not None:
                await coordinator.async_apply_native_scene(
                    request.scene.key,
                    speed_index=request.speed_index,
                    canonical_body=request.canonical_body,
                    writer=writer,
                    verify=False,
                )
            else:
                assert compiled is not None
                async with coordinator._control_lock:
                    if isinstance(compiled, CompiledEffect):
                        if not coordinator.is_on:
                            await writer(build_power(True, coordinator.model))
                            coordinator.is_on = True
                        await async_write_packets(compiled.upload_packets, writer)
                        if compiled.activation_packet is not None:
                            await writer(compiled.activation_packet)
                        _install_effect_state(coordinator, compiled)
                    else:
                        await async_apply_compiled_profile(
                            coordinator,
                            compiled,
                            writer=writer,
                            verify=False,
                        )
            if self._stopping or self._hass.is_stopping:
                raise PreviewShutdownError("Home Assistant is stopping")
        except _PreviewSupersededError:
            self._publish(request, PreviewPhase.CANCELLED, error_code="superseded")
            return
        except PreviewShutdownError:
            self._publish(request, PreviewPhase.FAILED, error_code="shutdown_incomplete")
            return
        except Exception as exc:
            async with self._lock:
                worker = self._devices.get(request.config_entry_id)
                if worker is not None:
                    worker.cooldown_until = asyncio.get_running_loop().time() + self._failure_cooldown
            self._diagnostics.record(
                DiagnosticStage.PACKET_PROGRESS,
                DiagnosticOutcome.FAILED,
                "preview_transport_failed",
                correlation_id=request.correlation_id,
                config_entry_id=request.config_entry_id,
                details={"error_type": type(exc).__name__, "sequence": request.sequence},
            )
            self._publish(request, PreviewPhase.FAILED, error_code="transport_failed")
            return

        self._invalidate_observed_match(request)
        coordinator.async_update_listeners()

        if request.committed:
            try:
                await self._async_persist_scene_default(request)
            except Exception as exc:
                self._diagnostics.record(
                    DiagnosticStage.API_SERVICE,
                    DiagnosticOutcome.FAILED,
                    "scene_default_storage_failed",
                    correlation_id=request.correlation_id,
                    config_entry_id=request.config_entry_id,
                    details={"error_type": type(exc).__name__, "sequence": request.sequence},
                )
                self._publish(request, PreviewPhase.FAILED, error_code="storage_failed")
                return

        if await self._async_request_status_is_live(request):
            self._publish(
                request,
                PreviewPhase.WRITTEN,
                confidence=ObservationConfidence.WRITE_COMPLETED,
            )
        expectations = _verification_expectations(coordinator, request, compiled)
        async with self._lock:
            worker = self._devices.get(request.config_entry_id)
            if (
                worker is None
                or worker.closing
                or request.generation != worker.latest_accepted_generation
                or request.generation in worker.cancelled_generations
                or request.session_id not in self._sessions
            ):
                return
            if expectations is not None:
                worker.verification_task = self._hass.async_create_task(
                    self._async_verify(
                        request,
                        coordinator,
                        expectations,
                        _confirmed_confidence(request, compiled),
                    ),
                    name=f"{DOMAIN} preview verify {request.config_entry_id}",
                )
                worker.verification_request = request
        if expectations is None:
            self._diagnostics.record_evidence_gap(
                "preview_write_unverified",
                correlation_id=request.correlation_id,
                config_entry_id=request.config_entry_id,
                details={"sequence": request.sequence},
            )

    async def _async_persist_scene_default(self, request: _PreviewRequest) -> None:
        if request.scene is not None:
            if request.scene.entry.scene_type == 0 or request.canonical_body is None:
                return
            scene = request.scene
            canonical_body = request.canonical_body
            speed_index = request.speed_index
        else:
            item = _required_item(request)
            if not isinstance(item.content, PaletteScene | LayeredScene):
                return
            scene = resolve_scene(
                item.content.template.sku,
                item.content.template.scene_id,
                item.content.template.effect_id,
            )
            canonical_body, speed_index = encode_authored_scene_body(
                item.content,
                scene.entry,
            )
        catalogue_body, catalogue_speed = resolve_native_scene_body(scene.entry)
        if canonical_body == catalogue_body and speed_index == catalogue_speed:
            await self._scene_defaults.async_delete(
                request.config_entry_id,
                scene.entry.scene_id,
                scene.entry.effect_id,
            )
            return
        await self._scene_defaults.async_set(
            NativeSceneDefault(
                config_entry_id=request.config_entry_id,
                scene_id=scene.entry.scene_id,
                effect_id=scene.entry.effect_id,
                updated_at=request.updated_at,
                canonical_body=canonical_body,
                speed_index=speed_index,
            )
        )

    async def _async_begin_transmission(self, request: _PreviewRequest) -> None:
        async with self._lock:
            if self._stopping or self._hass.is_stopping:
                raise PreviewShutdownError("Home Assistant is stopping")
            worker = self._devices.get(request.config_entry_id)
            if (
                worker is None
                or worker.closing
                or request.generation != worker.latest_accepted_generation
                or request.generation in worker.cancelled_generations
                or request.session_id not in self._sessions
            ):
                raise _PreviewSupersededError
            worker.last_write_started = asyncio.get_running_loop().time()
        self._publish(request, PreviewPhase.WRITING)

    async def _async_verify(
        self,
        request: _PreviewRequest,
        coordinator: Any,
        expectations: Mapping[str, Any],
        confirmed_confidence: ObservationConfidence,
    ) -> None:
        result: bool | None = None
        observing = False
        try:
            await asyncio.sleep(self._verify_delay)
            if not await self._async_verification_is_current(request):
                return
            async with coordinator._control_lock:
                if not await self._async_verification_is_current(request):
                    return
                async with self._lock:
                    worker = self._devices.get(request.config_entry_id)
                    if worker is None:
                        return
                    worker.verification_observing = True
                    observing = True
                async with asyncio.timeout(self._verify_timeout):
                    result = await coordinator.async_preview_observe(
                        expectations,
                        timeout=self._verify_timeout,
                    )
        except TimeoutError:
            result = None
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            self._diagnostics.record(
                DiagnosticStage.VERIFICATION,
                DiagnosticOutcome.FAILED,
                "preview_verification_failed",
                correlation_id=request.correlation_id,
                config_entry_id=request.config_entry_id,
                details={"error_type": type(exc).__name__, "sequence": request.sequence},
            )
            result = None
        finally:
            async with self._lock:
                worker = self._devices.get(request.config_entry_id)
                if worker is not None:
                    if observing:
                        worker.verification_observing = False
                    if worker.verification_task is asyncio.current_task():
                        worker.verification_task = None
                        worker.verification_request = None
        if not await self._async_verification_is_current(request):
            return
        if result is True:
            phase = PreviewPhase.CONFIRMED
            confidence = confirmed_confidence
            error_code = None
        elif result is False:
            phase = PreviewPhase.UNCONFIRMED
            confidence = ObservationConfidence.UNKNOWN
            error_code = "device_state_mismatch"
        else:
            phase = PreviewPhase.UNCONFIRMED
            confidence = ObservationConfidence.UNKNOWN
            error_code = "device_readback_unknown"
        self._publish(
            request,
            phase,
            confidence=confidence,
            error_code=error_code,
        )

    async def _async_verification_is_current(self, request: _PreviewRequest) -> bool:
        async with self._lock:
            worker = self._devices.get(request.config_entry_id)
            return (
                worker is not None
                and not worker.closing
                and request.generation == worker.latest_accepted_generation
                and request.generation not in worker.cancelled_generations
                and request.session_id in self._sessions
            )

    async def _async_request_status_is_live(self, request: _PreviewRequest) -> bool:
        async with self._lock:
            worker = self._devices.get(request.config_entry_id)
            return (
                worker is not None
                and request.generation not in worker.cancelled_generations
                and request.session_id in self._sessions
            )

    def _invalidate_observed_match(self, request: _PreviewRequest) -> None:
        observed = self._device_cache.get(request.config_entry_id)
        if observed is None or (observed.matched_operation_id is None and observed.active_effect is None):
            return
        self._device_cache.set(
            replace(
                observed,
                observed_at=request.updated_at,
                confidence=ObservationConfidence.UNKNOWN,
                matched_operation_id=None,
                active_effect=None,
            )
        )

    def _loaded_coordinator(self, config_entry_id: str) -> Any:
        entry = self._hass.config_entries.async_get_entry(config_entry_id)
        if (
            entry is None
            or entry.domain != DOMAIN
            or entry.state is not ConfigEntryState.LOADED
            or config_entry_id in self._blocked_devices
        ):
            raise PreviewError("target config entry is not loaded")
        return entry.runtime_data

    def _session_owner_locked(self, session_id: str, owner: object) -> _PreviewSession:
        session = self._sessions.get(session_id)
        if session is None:
            raise PreviewSessionNotFoundError("preview session was not found")
        if session.owner is not owner:
            raise PreviewOwnershipError("preview session belongs to another WebSocket connection")
        return session

    def _publish(
        self,
        request: _PreviewRequest,
        phase: PreviewPhase,
        *,
        confidence: ObservationConfidence = ObservationConfidence.UNKNOWN,
        error_code: str | None = None,
    ) -> None:
        session = self._sessions.get(request.session_id)
        if session is None:
            return
        status = PreviewStatus(
            request.session_id,
            request.config_entry_id,
            request.sequence,
            phase,
            request.content_kind,
            confidence,
            error_code,
        )
        for listener in tuple(session.listeners.values()):
            try:
                listener(status)
            except Exception:
                _LOGGER.debug("Preview status listener failed", exc_info=True)

    async def _async_handle_hass_stop(self, _event: Event) -> None:
        await self.async_shutdown()


def _snapshot_fingerprint(model: str, item: LibraryItem) -> str:
    encoded = json.dumps(
        {
            "model": model,
            "content": effect_content_to_dict(item.content),
        },
        allow_nan=False,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode()
    return sha256(encoded).hexdigest()


def _required_item(request: _PreviewRequest) -> LibraryItem:
    if request.item is None:
        raise RuntimeError("snapshot preview request has no effect content")
    return request.item


def _install_effect_state(coordinator: Any, compiled: CompiledEffect) -> None:
    if compiled.activation_packet is None:
        return
    if compiled.activation_mode is ActivationMode.SCENE:
        coordinator.effect = compiled.expected_effect
        coordinator.diy_code = None
    else:
        coordinator.effect = None
        coordinator.diy_code = compiled.diy_code
    coordinator.music_mode = coordinator.video_mode = "off"


def _verification_expectations(
    coordinator: Any,
    request: _PreviewRequest,
    compiled: CompiledApplication | None,
) -> dict[str, Any] | None:
    if not coordinator.profile.state_readable:
        return None
    if request.scene is not None:
        return {"is_on": True, "effect": request.scene.key}
    if isinstance(compiled, CompiledEffect):
        if compiled.activation_mode is ActivationMode.SCENE:
            return {"is_on": True, "effect": compiled.expected_effect}
        if compiled.content_kind == "workshop":
            return {"is_on": True, "unknown_scene_code": compiled.diy_code}
        if compiled.model == "H617A":
            return {"is_on": True, "diy_code": compiled.diy_code}
        if compiled.diy_code in {H6199_PALETTE_DIY_APPLY_CODE, H6199_WORKSHOP_APPLY_CODE}:
            return {"is_on": True, "unknown_scene_code": compiled.diy_code}
        return None
    if isinstance(compiled, CompiledMusicProfile):
        expectations: dict[str, Any] = {
            "is_on": True,
            "music_mode": compiled.mode,
        }
        if compiled.model == "H6199":
            expectations.update(
                {
                    "music_sensitivity": compiled.sensitivity,
                    "music_color": compiled.colour,
                }
            )
            if compiled.mode == "rhythm":
                expectations["music_calm"] = compiled.calm
        return expectations
    if isinstance(compiled, CompiledVideoProfile):
        red, blue = WHITE_BALANCE_POSITIONS[compiled.white_balance_position - 1]
        left, top, right, bottom = compiled.relative_brightness
        return {
            "is_on": True,
            "video_mode": compiled.mode,
            "video_full_screen": compiled.full_screen,
            "video_saturation": compiled.saturation,
            "video_sound_effects": compiled.sound_effects,
            "video_sound_effects_softness": compiled.sound_effects_softness,
            "white_balance_red": red,
            "white_balance_blue": blue,
            "relative_brightness": left if len(set(compiled.relative_brightness)) == 1 else None,
            "relative_brightness_left": left,
            "relative_brightness_top": top,
            "relative_brightness_right": right,
            "relative_brightness_bottom": bottom,
            "blank_screen": compiled.blank_screen,
        }
    return None


def _confirmed_confidence(
    request: _PreviewRequest,
    compiled: CompiledApplication | None,
) -> ObservationConfidence:
    if request.scene is not None or isinstance(compiled, CompiledEffect):
        return ObservationConfidence.ACTIVATION_MATCH
    if isinstance(compiled, CompiledMusicProfile) and compiled.model == "H617A":
        return ObservationConfidence.MODE_MATCH
    return ObservationConfidence.SETTINGS_MATCH
