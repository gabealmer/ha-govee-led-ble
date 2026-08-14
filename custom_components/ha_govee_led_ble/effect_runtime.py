"""Coordinator-owned Effect Studio deployment transactions."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import replace
from uuid import UUID, uuid4

from .coordinator import GoveeBLECoordinator
from .effect_catalogue import H617A_TYPE04_APPLY_CODE, H6199_PALETTE_DIY_APPLY_CODE
from .effect_compiler import ActivationMode, CompiledEffect, VerificationStrategy, compile_effect
from .effect_deployments import (
    DeploymentPhase,
    DeploymentRecord,
    EffectDeploymentRepository,
    EffectDeviceCache,
    ObservationConfidence,
    ObservedDeviceState,
    PriorControlState,
)
from .effect_domain import LibraryItem, MultiEffect, PaintedEffect, PaletteDiyEffect, SingleEffect

ACTIVATION_ATTEMPTS = 2
VERIFICATION_ATTEMPTS = 2

_LOGGER = logging.getLogger(__name__)


class EffectDeploymentEngine:
    """Apply immutable definitions through one coordinator transaction."""

    def __init__(
        self,
        deployments: EffectDeploymentRepository,
        device_cache: EffectDeviceCache | None = None,
    ) -> None:
        self._deployments = deployments
        self._device_cache = device_cache
        self._operation_locks_guard = asyncio.Lock()
        self._operation_locks: dict[UUID, asyncio.Lock] = {}
        self._operation_lock_users: dict[UUID, int] = {}

    async def async_apply_saved(
        self,
        coordinator: GoveeBLECoordinator,
        item: LibraryItem,
        *,
        config_entry_id: str,
        updated_at: str,
        diy_code: int | None = None,
        operation_id: UUID | None = None,
    ) -> DeploymentRecord:
        resolved_diy_code = _resolve_compiler_diy_code(
            self._deployments,
            item,
            config_entry_id,
            diy_code,
        )
        compiled = compile_effect(item, coordinator.model, diy_code=resolved_diy_code)
        record = self._new_record(
            compiled,
            config_entry_id=config_entry_id,
            updated_at=updated_at,
            operation_id=operation_id,
            item_id=item.id,
            item_revision=item.revision,
        )
        return await self._async_apply(coordinator, compiled, record)

    async def async_apply_snapshot(
        self,
        coordinator: GoveeBLECoordinator,
        item: LibraryItem,
        *,
        config_entry_id: str,
        snapshot_id: UUID,
        updated_at: str,
        diy_code: int | None = None,
        operation_id: UUID | None = None,
    ) -> DeploymentRecord:
        resolved_diy_code = _resolve_compiler_diy_code(
            self._deployments,
            item,
            config_entry_id,
            diy_code,
        )
        compiled = compile_effect(item, coordinator.model, diy_code=resolved_diy_code)
        record = self._new_record(
            compiled,
            config_entry_id=config_entry_id,
            updated_at=updated_at,
            operation_id=operation_id,
            snapshot_id=snapshot_id,
            snapshot=item,
        )
        return await self._async_apply(coordinator, compiled, record)

    async def async_reconcile(
        self,
        coordinator: GoveeBLECoordinator,
        *,
        config_entry_id: str,
        observed_at: str,
    ) -> ObservedDeviceState:
        async with coordinator._control_lock:
            refreshed = await self._async_refresh_for_reconciliation(coordinator)
            return self._reconcile_observation(
                coordinator,
                config_entry_id=config_entry_id,
                observed_at=observed_at,
                refreshed=refreshed,
            )

    def _new_record(
        self,
        compiled: CompiledEffect,
        *,
        config_entry_id: str,
        updated_at: str,
        operation_id: UUID | None,
        item_id: UUID | None = None,
        item_revision: int | None = None,
        snapshot_id: UUID | None = None,
        snapshot: LibraryItem | None = None,
    ) -> DeploymentRecord:
        return DeploymentRecord(
            operation_id=operation_id or uuid4(),
            config_entry_id=config_entry_id,
            diy_code=compiled.diy_code,
            phase=DeploymentPhase.COMPILING,
            compiler_version=compiled.compiler_version,
            artifact_sha256=compiled.artifact_sha256,
            updated_at=updated_at,
            target_mode=compiled.activation_mode.value,
            target_effect=compiled.expected_effect,
            evidence_codes=compiled.evidence_codes,
            item_id=item_id,
            item_revision=item_revision,
            snapshot_id=snapshot_id,
            snapshot=snapshot,
            progress_total=len(compiled.upload_packets) + 1,
        )

    async def _async_apply(
        self,
        coordinator: GoveeBLECoordinator,
        compiled: CompiledEffect,
        record: DeploymentRecord,
    ) -> DeploymentRecord:
        async with self._operation_lock(record.operation_id):
            return await self._async_apply_serialised(coordinator, compiled, record)

    async def _async_apply_serialised(
        self,
        coordinator: GoveeBLECoordinator,
        compiled: CompiledEffect,
        record: DeploymentRecord,
    ) -> DeploymentRecord:
        if existing := self._deployments.get_optional(record.operation_id):
            if (
                existing.config_entry_id == record.config_entry_id
                and existing.artifact_sha256 == record.artifact_sha256
                and existing.phase is DeploymentPhase.CONFIRMED
            ):
                return existing
            raise RuntimeError(
                f"deployment operation {record.operation_id} already exists in phase {existing.phase.value}"
            )
        current = record
        lock_acquired = False
        try:
            await self._deployments.async_put(record, expected_revision=None)
            async with coordinator._control_lock:
                lock_acquired = True
                try:
                    refreshed = await self._async_refresh_for_reconciliation(coordinator)
                    self._reconcile_observation(
                        coordinator,
                        config_entry_id=record.config_entry_id,
                        observed_at=record.updated_at,
                        refreshed=refreshed,
                    )
                    prior_state = self._capture_prior_state(coordinator)
                    next_record = replace(current, prior_state=prior_state)
                    await self._deployments.async_put(next_record, expected_revision=None)
                    current = next_record

                    next_record = replace(current, phase=DeploymentPhase.UPLOADING)
                    await self._deployments.async_put(next_record, expected_revision=None)
                    current = next_record
                    for index, packet in enumerate(compiled.upload_packets, start=1):
                        await coordinator.send_command(packet)
                        current = replace(current, progress_current=index)
                        await self._deployments.async_put(current, expected_revision=None)

                    next_record = replace(current, phase=DeploymentPhase.ACTIVATING)
                    await self._deployments.async_put(next_record, expected_revision=None)
                    current = next_record
                    await self._async_activate(coordinator, compiled.activation_packet)
                    current = replace(current, progress_current=current.progress_total)
                    await self._deployments.async_put(current, expected_revision=None)

                    next_record = replace(current, phase=DeploymentPhase.VERIFYING)
                    await self._deployments.async_put(next_record, expected_revision=None)
                    current = next_record
                    if compiled.verification_strategy is VerificationStrategy.UNPROVEN_H6199_SLOT:
                        selector_observed = await self._async_observe_unproven_h6199_slot(
                            coordinator,
                            compiled.diy_code,
                        )
                        uncertain = replace(
                            current,
                            phase=DeploymentPhase.UNCERTAIN,
                            error_code=(
                                "effect_content_readback_unproven"
                                if selector_observed
                                else "activation_readback_unproven"
                            ),
                            verification_confidence=ObservationConfidence.UNKNOWN,
                        )
                        await self._deployments.async_put(uncertain, expected_revision=None)
                        self._reconcile_observation(
                            coordinator,
                            config_entry_id=record.config_entry_id,
                            observed_at=record.updated_at,
                            refreshed=False,
                        )
                        return uncertain
                    confirmed, current = await self._async_verify(
                        coordinator,
                        compiled.activation_packet,
                        current,
                    )
                    if not confirmed:
                        return await self._async_finish_failure(
                            coordinator,
                            current,
                            error_code="device_state_unconfirmed",
                        )
                    completed = replace(
                        current,
                        phase=DeploymentPhase.CONFIRMED,
                        error_code=None,
                        verification_confidence=ObservationConfidence.ACTIVATION_MATCH,
                    )
                    await self._deployments.async_put(completed, expected_revision=None)
                    self._reconcile_observation(
                        coordinator,
                        config_entry_id=record.config_entry_id,
                        observed_at=record.updated_at,
                        refreshed=True,
                        matched_record=completed,
                    )
                    return completed
                except asyncio.CancelledError:
                    await self._async_finish_failure_while_locked_best_effort(
                        coordinator,
                        current,
                        error_code="operation_cancelled",
                    )
                    raise
                except Exception as exc:
                    await self._async_finish_failure_while_locked_best_effort(
                        coordinator,
                        current,
                        error_code=type(exc).__name__,
                    )
                    raise
        except asyncio.CancelledError:
            if not lock_acquired:
                await self._async_finish_failure_best_effort(
                    coordinator,
                    current,
                    error_code="operation_cancelled",
                )
            raise
        except Exception as exc:
            if not lock_acquired:
                await self._async_finish_failure_best_effort(
                    coordinator,
                    current,
                    error_code=type(exc).__name__,
                )
            raise

    @asynccontextmanager
    async def _operation_lock(self, operation_id: UUID) -> AsyncIterator[None]:
        async with self._operation_locks_guard:
            lock = self._operation_locks.setdefault(operation_id, asyncio.Lock())
            self._operation_lock_users[operation_id] = self._operation_lock_users.get(operation_id, 0) + 1
        try:
            async with lock:
                yield
        finally:
            async with self._operation_locks_guard:
                remaining = self._operation_lock_users[operation_id] - 1
                if remaining:
                    self._operation_lock_users[operation_id] = remaining
                else:
                    self._operation_lock_users.pop(operation_id, None)
                    self._operation_locks.pop(operation_id, None)

    async def _async_activate(
        self,
        coordinator: GoveeBLECoordinator,
        activation_packet: bytes,
    ) -> None:
        for attempt in range(ACTIVATION_ATTEMPTS):
            try:
                await coordinator.send_command(activation_packet)
                return
            except Exception:
                if attempt + 1 == ACTIVATION_ATTEMPTS:
                    raise

    async def _async_verify(
        self,
        coordinator: GoveeBLECoordinator,
        activation_packet: bytes,
        record: DeploymentRecord,
    ) -> tuple[bool, DeploymentRecord]:
        if not coordinator.profile.state_readable:
            return False, record
        current = record
        for attempt in range(VERIFICATION_ATTEMPTS):
            try:
                refreshed = await coordinator.refresh_state()
            except Exception:
                if attempt + 1 == VERIFICATION_ATTEMPTS:
                    raise
                continue
            if refreshed and _activation_matches(coordinator, record):
                return True, current
            if refreshed and attempt + 1 < VERIFICATION_ATTEMPTS:
                current = replace(current, phase=DeploymentPhase.ACTIVATING)
                await self._deployments.async_put(current, expected_revision=None)
                await self._async_activate(coordinator, activation_packet)
                current = replace(current, phase=DeploymentPhase.VERIFYING)
                await self._deployments.async_put(current, expected_revision=None)
        return False, current

    async def _async_observe_unproven_h6199_slot(
        self,
        coordinator: GoveeBLECoordinator,
        scene_code: int,
    ) -> bool:
        if not coordinator.profile.state_readable:
            return False
        for _attempt in range(VERIFICATION_ATTEMPTS):
            try:
                refreshed = await coordinator.refresh_state()
            except Exception:
                _LOGGER.debug("Could not observe the H6199 user-effect slot after activation", exc_info=True)
                continue
            if refreshed and getattr(coordinator, "unknown_scene_code", None) == scene_code:
                return True
        return False

    async def _async_finish_failure(
        self,
        coordinator: GoveeBLECoordinator,
        record: DeploymentRecord,
        *,
        error_code: str,
    ) -> DeploymentRecord:
        writes_may_have_started = record.phase in {
            DeploymentPhase.UPLOADING,
            DeploymentPhase.ACTIVATING,
            DeploymentPhase.VERIFYING,
            DeploymentPhase.RECOVERING,
        }
        if not writes_may_have_started:
            failed = replace(
                record,
                phase=DeploymentPhase.FAILED,
                error_code=error_code,
                verification_confidence=ObservationConfidence.UNKNOWN,
            )
            await self._deployments.async_put(failed, expected_revision=None)
            return failed

        recovering = replace(
            record,
            phase=DeploymentPhase.RECOVERING,
            error_code=error_code,
            verification_confidence=ObservationConfidence.UNKNOWN,
        )
        await self._deployments.async_put(recovering, expected_revision=None)
        recovered = False
        if recovering.prior_state is not None:
            restore = getattr(coordinator, "async_restore_effect_control_state", None)
            if restore is not None:
                try:
                    recovered = await restore(
                        recovering.prior_state,
                        overwritten_diy_code=(
                            recovering.diy_code if recovering.target_mode == ActivationMode.CUSTOM.value else -1
                        ),
                    )
                except Exception:
                    _LOGGER.exception(
                        "Failed to recover the prior state after Effect Studio deployment %s",
                        recovering.operation_id,
                    )
        final = replace(
            recovering,
            phase=DeploymentPhase.FAILED if recovered else DeploymentPhase.UNCERTAIN,
        )
        await self._deployments.async_put(final, expected_revision=None)
        self._reconcile_observation(
            coordinator,
            config_entry_id=record.config_entry_id,
            observed_at=record.updated_at,
            refreshed=recovered,
        )
        return final

    async def _async_finish_failure_best_effort(
        self,
        coordinator: GoveeBLECoordinator,
        record: DeploymentRecord,
        *,
        error_code: str,
    ) -> None:
        try:
            async with coordinator._control_lock:
                await self._async_finish_failure(
                    coordinator,
                    record,
                    error_code=error_code,
                )
        except Exception:
            _LOGGER.exception(
                "Failed to persist the terminal state for Effect Studio deployment %s",
                record.operation_id,
            )

    async def _async_finish_failure_while_locked_best_effort(
        self,
        coordinator: GoveeBLECoordinator,
        record: DeploymentRecord,
        *,
        error_code: str,
    ) -> None:
        try:
            await self._async_finish_failure(
                coordinator,
                record,
                error_code=error_code,
            )
        except Exception:
            _LOGGER.exception(
                "Failed to persist the terminal state for Effect Studio deployment %s",
                record.operation_id,
            )

    async def _async_refresh_for_reconciliation(
        self,
        coordinator: GoveeBLECoordinator,
    ) -> bool:
        if not coordinator.profile.state_readable:
            return False
        try:
            return await coordinator.refresh_state()
        except Exception:
            _LOGGER.debug(
                "Could not refresh %s before Effect Studio reconciliation",
                getattr(coordinator, "address", coordinator.model),
                exc_info=True,
            )
            return False

    def _capture_prior_state(
        self,
        coordinator: GoveeBLECoordinator,
    ) -> PriorControlState:
        capture = getattr(coordinator, "capture_effect_control_state", None)
        if capture is not None:
            captured = capture()
            if not isinstance(captured, PriorControlState):
                raise TypeError("coordinator returned an invalid prior control state")
            return captured
        return PriorControlState(
            mode=_coordinator_mode(coordinator),
            is_on=getattr(coordinator, "is_on", True),
            brightness_pct=getattr(coordinator, "brightness_pct", 100),
            rgb_color=getattr(coordinator, "rgb_color", (255, 255, 255)),
            color_temp_kelvin=getattr(coordinator, "color_temp_kelvin", None),
            effect=getattr(coordinator, "effect", None),
            diy_code=coordinator.diy_code,
            music_mode=getattr(coordinator, "music_mode", "off"),
            video_mode=getattr(coordinator, "video_mode", "off"),
            music_sensitivity=getattr(coordinator, "music_sensitivity", 100),
            music_calm=getattr(coordinator, "music_calm", False),
            music_color=getattr(coordinator, "music_color", None),
        )

    def _reconcile_observation(
        self,
        coordinator: GoveeBLECoordinator,
        *,
        config_entry_id: str,
        observed_at: str,
        refreshed: bool,
        matched_record: DeploymentRecord | None = None,
    ) -> ObservedDeviceState:
        mode = _coordinator_mode(coordinator)
        diy_code = coordinator.diy_code if mode == "custom" else None
        effect = coordinator.effect if mode == "scene" else None
        if diy_code is not None and matched_record is None:
            latest = self._deployments.latest_for_diy_code(config_entry_id, diy_code)
            if latest is not None and latest.phase is DeploymentPhase.CONFIRMED:
                matched_record = latest
        if effect is not None and matched_record is None:
            latest = self._deployments.latest_for_effect(config_entry_id, effect)
            if latest is not None and latest.phase is DeploymentPhase.CONFIRMED:
                matched_record = latest
        if diy_code is not None or effect is not None:
            confidence = (
                ObservationConfidence.ACTIVATION_MATCH if matched_record is not None else ObservationConfidence.UNKNOWN
            )
        elif refreshed:
            confidence = ObservationConfidence.EXACT_SESSION
        else:
            confidence = ObservationConfidence.UNKNOWN
        state = ObservedDeviceState(
            config_entry_id=config_entry_id,
            mode=mode,
            observed_at=observed_at,
            confidence=confidence,
            diy_code=diy_code,
            effect=effect,
            matched_operation_id=(
                matched_record.operation_id
                if confidence is ObservationConfidence.ACTIVATION_MATCH and matched_record is not None
                else None
            ),
        )
        if self._device_cache is not None:
            self._device_cache.set(state)
        return state


def _coordinator_mode(coordinator: GoveeBLECoordinator) -> str:
    mode = getattr(coordinator, "active_mode", None)
    if isinstance(mode, str):
        return mode
    if not getattr(coordinator, "is_on", True):
        return "off"
    if getattr(coordinator, "unknown_scene_code", None) is not None:
        return "scene"
    if coordinator.diy_code is not None:
        return "custom"
    if getattr(coordinator, "effect", None) is not None:
        return "scene"
    if getattr(coordinator, "music_mode", "off") not in (None, "off"):
        return "music"
    if getattr(coordinator, "video_mode", "off") not in (None, "off"):
        return "video"
    return "colour"


def resolve_diy_code(
    deployments: EffectDeploymentRepository,
    item: LibraryItem,
    config_entry_id: str,
) -> int:
    if isinstance(item.content, PaintedEffect):
        return 800
    if isinstance(item.content, SingleEffect | MultiEffect):
        return H617A_TYPE04_APPLY_CODE
    if isinstance(item.content, PaletteDiyEffect):
        return H6199_PALETTE_DIY_APPLY_CODE
    raise ValueError("this content kind has no custom-effect selector allocation")


def _resolve_compiler_diy_code(
    deployments: EffectDeploymentRepository,
    item: LibraryItem,
    config_entry_id: str,
    diy_code: int | None,
) -> int | None:
    if not isinstance(item.content, PaintedEffect | SingleEffect | MultiEffect | PaletteDiyEffect):
        return None
    return resolve_diy_code(deployments, item, config_entry_id) if diy_code is None else diy_code


def _activation_matches(
    coordinator: GoveeBLECoordinator,
    record: DeploymentRecord,
) -> bool:
    if record.target_mode == ActivationMode.SCENE.value:
        return record.target_effect is not None and coordinator.effect == record.target_effect
    return coordinator.diy_code == record.diy_code
