"""Coordinator-owned custom-effect deployment transactions."""

from __future__ import annotations

from dataclasses import replace
from uuid import UUID, uuid4

from .coordinator import GoveeBLECoordinator
from .effect_catalogue import H617A_TYPE04_APPLY_CODE
from .effect_compiler import compile_h617a
from .effect_deployments import (
    DeploymentPhase,
    DeploymentRecord,
    EffectDeploymentRepository,
)
from .effect_domain import LibraryItem, MultiEffect, PaintedEffect, SingleEffect


class EffectDeploymentEngine:
    """Apply immutable H617A definitions without changing existing light paths."""

    def __init__(self, deployments: EffectDeploymentRepository) -> None:
        self._deployments = deployments

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
        _require_h617a(coordinator)
        diy_code = resolve_diy_code(self._deployments, item, config_entry_id) if diy_code is None else diy_code
        compiled = compile_h617a(item, diy_code)
        record = DeploymentRecord(
            operation_id=operation_id or uuid4(),
            config_entry_id=config_entry_id,
            diy_code=diy_code,
            phase=DeploymentPhase.PENDING,
            compiler_version=compiled.compiler_version,
            artifact_sha256=compiled.artifact_sha256,
            updated_at=updated_at,
            item_id=item.id,
            item_revision=item.revision,
        )
        return await self._async_apply(coordinator, compiled.packets, record)

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
        _require_h617a(coordinator)
        diy_code = resolve_diy_code(self._deployments, item, config_entry_id) if diy_code is None else diy_code
        compiled = compile_h617a(item, diy_code)
        record = DeploymentRecord(
            operation_id=operation_id or uuid4(),
            config_entry_id=config_entry_id,
            diy_code=diy_code,
            phase=DeploymentPhase.PENDING,
            compiler_version=compiled.compiler_version,
            artifact_sha256=compiled.artifact_sha256,
            updated_at=updated_at,
            snapshot_id=snapshot_id,
            snapshot=item,
        )
        return await self._async_apply(coordinator, compiled.packets, record)

    async def _async_apply(
        self,
        coordinator: GoveeBLECoordinator,
        packets: tuple[bytes, ...],
        record: DeploymentRecord,
    ) -> DeploymentRecord:
        await self._deployments.async_put(record, expected_revision=None)
        uploading = replace(record, phase=DeploymentPhase.UPLOADING)
        await self._deployments.async_put(uploading, expected_revision=None)
        try:
            async with coordinator._control_lock:
                confirmed = await self._async_send_and_verify(
                    coordinator,
                    packets,
                    uploading,
                )
        except Exception as exc:
            current = self._deployments.get(record.operation_id)
            failed = replace(
                current,
                phase=DeploymentPhase.FAILED,
                error_code=type(exc).__name__,
            )
            await self._deployments.async_put(failed, expected_revision=None)
            raise
        current = self._deployments.get(record.operation_id)
        completed = replace(
            current,
            phase=(DeploymentPhase.CONFIRMED if confirmed else DeploymentPhase.UNKNOWN),
            error_code=None if confirmed else "device_state_unconfirmed",
        )
        await self._deployments.async_put(completed, expected_revision=None)
        return completed

    async def _async_send_and_verify(
        self,
        coordinator: GoveeBLECoordinator,
        packets: tuple[bytes, ...],
        record: DeploymentRecord,
    ) -> bool:
        for _attempt in range(2):
            progress = replace(
                record,
                phase=DeploymentPhase.UPLOADING,
                progress_current=0,
                progress_total=len(packets),
            )
            await self._deployments.async_put(progress, expected_revision=None)
            for index, packet in enumerate(packets, start=1):
                await coordinator.send_command(packet)
                progress = replace(progress, progress_current=index)
                await self._deployments.async_put(progress, expected_revision=None)
            if not coordinator.profile.state_readable:
                return False
            verifying = replace(progress, phase=DeploymentPhase.VERIFYING)
            await self._deployments.async_put(verifying, expected_revision=None)
            if await coordinator.refresh_state() and coordinator.diy_code == record.diy_code:
                return True
        return False


def _require_h617a(coordinator: GoveeBLECoordinator) -> None:
    if coordinator.model != "H617A":
        raise ValueError(f"{coordinator.model} custom-effect upload is not supported")


def resolve_diy_code(
    deployments: EffectDeploymentRepository,
    item: LibraryItem,
    config_entry_id: str,
) -> int:
    if isinstance(item.content, PaintedEffect):
        return 800
    if isinstance(item.content, SingleEffect | MultiEffect):
        return H617A_TYPE04_APPLY_CODE
    raise ValueError("this content kind has no H617A DIY-code allocation")
