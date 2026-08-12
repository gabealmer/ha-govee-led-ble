"""H617A custom-effect deployment transactions."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, call
from uuid import uuid4

import pytest
from homeassistant.core import HomeAssistant

from custom_components.ha_govee_led_ble.effect_compiler import compile_h617a
from custom_components.ha_govee_led_ble.effect_deployments import (
    DeploymentPhase,
    EffectDeploymentRepository,
)
from custom_components.ha_govee_led_ble.effect_domain import (
    LibraryItem,
    PaintedEffect,
    SingleEffect,
)
from custom_components.ha_govee_led_ble.effect_runtime import (
    EffectDeploymentEngine,
    resolve_diy_code,
)


def _item() -> LibraryItem:
    return LibraryItem.new(
        "Paint",
        PaintedEffect("clockwise", 50, 100, (0, 0, 0)),
    )


def _type04_item() -> LibraryItem:
    return LibraryItem.new("Test", SingleEffect(0, 0, 50, ((255, 0, 0),)))


def _coordinator(*, readable: bool = True):
    coordinator = SimpleNamespace(
        _control_lock=asyncio.Lock(),
        model="H617A",
        profile=SimpleNamespace(state_readable=readable),
        diy_code=None,
        send_command=AsyncMock(),
        refresh_state=AsyncMock(),
    )
    return coordinator


async def test_saved_effect_uploads_then_confirms_readback(
    hass: HomeAssistant,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    engine = EffectDeploymentEngine(repository)
    coordinator = _coordinator()

    async def confirm() -> bool:
        coordinator.diy_code = 800
        return True

    coordinator.refresh_state.side_effect = confirm

    result = await engine.async_apply_saved(
        coordinator,
        _item(),
        config_entry_id="entry-a",
        updated_at="2026-08-11T00:00:00Z",
    )

    assert result.phase is DeploymentPhase.CONFIRMED
    assert coordinator.send_command.await_count >= 2
    assert repository.get(result.operation_id) == result
    assert result.progress_current == result.progress_total


async def test_unconfirmed_upload_retries_complete_packet_sequence(
    hass: HomeAssistant,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    engine = EffectDeploymentEngine(repository)
    coordinator = _coordinator()
    coordinator.refresh_state.return_value = False
    item = _item()
    packets = compile_h617a(item, 800).packets

    result = await engine.async_apply_snapshot(
        coordinator,
        item,
        config_entry_id="entry-a",
        snapshot_id=uuid4(),
        updated_at="2026-08-11T00:00:00Z",
    )

    assert result.phase is DeploymentPhase.UNKNOWN
    assert result.snapshot == item
    assert result.error_code == "device_state_unconfirmed"
    assert coordinator.refresh_state.await_count == 2
    assert coordinator.send_command.await_args_list == [call(packet) for packet in (*packets, *packets)]


async def test_upload_does_not_start_if_uploading_phase_cannot_be_persisted(
    hass: HomeAssistant,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    engine = EffectDeploymentEngine(repository)
    coordinator = _coordinator()
    operation_id = uuid4()
    original_put = repository.async_put

    async def fail_uploading(record, *, expected_revision):
        if record.phase is DeploymentPhase.UPLOADING:
            raise OSError("storage unavailable")
        return await original_put(record, expected_revision=expected_revision)

    monkeypatch.setattr(repository, "async_put", fail_uploading)

    with pytest.raises(OSError, match="storage unavailable"):
        await engine.async_apply_saved(
            coordinator,
            _item(),
            config_entry_id="entry-a",
            updated_at="2026-08-11T00:00:00Z",
            operation_id=operation_id,
        )

    pending = repository.get(operation_id)
    assert pending.phase is DeploymentPhase.PENDING
    assert pending.progress_current == 0
    assert pending.progress_total == 0
    coordinator.send_command.assert_not_awaited()


async def test_mid_upload_failure_preserves_progress_and_propagates(
    hass: HomeAssistant,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    engine = EffectDeploymentEngine(repository)
    coordinator = _coordinator()
    item = _item()
    packets = compile_h617a(item, 800).packets
    coordinator.send_command.side_effect = [None, RuntimeError("write failed")]
    operation_id = uuid4()

    with pytest.raises(RuntimeError, match="write failed"):
        await engine.async_apply_saved(
            coordinator,
            item,
            config_entry_id="entry-a",
            updated_at="2026-08-11T00:00:00Z",
            operation_id=operation_id,
        )

    failed = repository.get(operation_id)
    assert failed.phase is DeploymentPhase.FAILED
    assert failed.error_code == "RuntimeError"
    assert failed.progress_current == 1
    assert failed.progress_total == len(packets)
    assert coordinator.send_command.await_args_list == [
        call(packets[0]),
        call(packets[1]),
    ]


async def test_verification_failure_preserves_completed_upload(
    hass: HomeAssistant,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    engine = EffectDeploymentEngine(repository)
    coordinator = _coordinator()
    item = _item()
    packets = compile_h617a(item, 800).packets
    coordinator.refresh_state.side_effect = RuntimeError("read failed")
    operation_id = uuid4()

    with pytest.raises(RuntimeError, match="read failed"):
        await engine.async_apply_saved(
            coordinator,
            item,
            config_entry_id="entry-a",
            updated_at="2026-08-11T00:00:00Z",
            operation_id=operation_id,
        )

    failed = repository.get(operation_id)
    assert failed.phase is DeploymentPhase.FAILED
    assert failed.error_code == "RuntimeError"
    assert failed.progress_current == len(packets)
    assert failed.progress_total == len(packets)
    assert coordinator.send_command.await_args_list == [call(packet) for packet in packets]


@pytest.mark.parametrize(
    ("prior_outcome", "prior_phase"),
    [
        ("failed", DeploymentPhase.FAILED),
        ("unknown", DeploymentPhase.UNKNOWN),
    ],
)
async def test_fresh_operation_recovers_after_unsuccessful_operation(
    hass: HomeAssistant,
    prior_outcome: str,
    prior_phase: DeploymentPhase,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    engine = EffectDeploymentEngine(repository)
    item = _item()
    prior_coordinator = _coordinator()
    prior_operation_id = uuid4()

    if prior_outcome == "failed":
        prior_coordinator.send_command.side_effect = RuntimeError("write failed")
        with pytest.raises(RuntimeError, match="write failed"):
            await engine.async_apply_saved(
                prior_coordinator,
                item,
                config_entry_id="entry-a",
                updated_at="2026-08-11T00:00:00Z",
                operation_id=prior_operation_id,
            )
    else:
        prior_coordinator.refresh_state.return_value = False
        prior = await engine.async_apply_saved(
            prior_coordinator,
            item,
            config_entry_id="entry-a",
            updated_at="2026-08-11T00:00:00Z",
            operation_id=prior_operation_id,
        )
        assert prior.phase is DeploymentPhase.UNKNOWN

    recovered_coordinator = _coordinator()

    async def confirm() -> bool:
        recovered_coordinator.diy_code = 800
        return True

    recovered_coordinator.refresh_state.side_effect = confirm
    recovered = await engine.async_apply_saved(
        recovered_coordinator,
        item,
        config_entry_id="entry-a",
        updated_at="2026-08-11T00:01:00Z",
    )

    assert recovered.phase is DeploymentPhase.CONFIRMED
    assert recovered.operation_id != prior_operation_id
    assert repository.get(prior_operation_id).phase is prior_phase
    assert len(repository.snapshot().records) == 2


async def test_unreadable_device_is_never_reported_confirmed(
    hass: HomeAssistant,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    coordinator = _coordinator(readable=False)

    result = await EffectDeploymentEngine(repository).async_apply_saved(
        coordinator,
        _item(),
        config_entry_id="entry-a",
        updated_at="2026-08-11T00:00:00Z",
    )

    assert result.phase is DeploymentPhase.UNKNOWN
    coordinator.refresh_state.assert_not_awaited()


async def test_h6199_is_rejected_before_any_write(hass: HomeAssistant) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    coordinator = _coordinator()
    coordinator.model = "H6199"

    with pytest.raises(ValueError, match="not supported"):
        await EffectDeploymentEngine(repository).async_apply_saved(
            coordinator,
            _item(),
            config_entry_id="entry-a",
            updated_at="2026-08-11T00:00:00Z",
        )

    coordinator.send_command.assert_not_awaited()


async def test_type04_uses_evidenced_code_and_confirms_readback(
    hass: HomeAssistant,
) -> None:
    repository = EffectDeploymentRepository(hass)
    await repository.async_load()
    coordinator = _coordinator()

    async def confirm() -> bool:
        coordinator.diy_code = 24
        return True

    coordinator.refresh_state.side_effect = confirm

    result = await EffectDeploymentEngine(repository).async_apply_saved(
        coordinator,
        _type04_item(),
        config_entry_id="entry-a",
        updated_at="2026-08-11T00:00:00Z",
    )

    assert result.phase is DeploymentPhase.CONFIRMED
    assert result.diy_code == 24
    assert coordinator.send_command.await_count >= 2


def test_painted_effect_uses_evidenced_code(hass: HomeAssistant) -> None:
    repository = EffectDeploymentRepository(hass)
    item = LibraryItem.new(
        "Paint",
        PaintedEffect("clockwise", 50, 100, (0, 0, 0)),
    )

    assert resolve_diy_code(repository, item, "entry-a") == 800


def test_type04_effect_uses_evidenced_code(hass: HomeAssistant) -> None:
    repository = EffectDeploymentRepository(hass)

    assert resolve_diy_code(repository, _type04_item(), "entry-a") == 24
