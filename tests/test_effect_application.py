"""Effect Studio application use cases."""

from __future__ import annotations

import asyncio
from hashlib import sha256
from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from custom_components.ha_govee_led_ble.coordinator import GoveeBLECoordinator
from custom_components.ha_govee_led_ble.effect_application import EffectStudioApplication
from custom_components.ha_govee_led_ble.effect_deployments import (
    DeploymentPhase,
    DeploymentRecord,
    EffectDeploymentRepository,
    ObservationConfidence,
)
from custom_components.ha_govee_led_ble.effect_domain import EffectValidationError, LibraryItem
from custom_components.ha_govee_led_ble.effect_identity import (
    ActiveEffectHint,
    EffectDeviceCache,
    ObservedDeviceState,
)
from custom_components.ha_govee_led_ble.effect_runtime import EffectDeploymentEngine
from custom_components.ha_govee_led_ble.effect_storage import (
    EffectLibraryRepository,
    EffectVersionConflictError,
)
from custom_components.ha_govee_led_ble.effect_user_state import EffectUserStateRepository
from tests.storage_test_double import InMemoryVersionedDocumentStore

CONTENT = {
    "kind": "h617a_single",
    "family": 0,
    "variant": 0,
    "speed": 50,
    "palette": [[255, 0, 0]],
}


async def _application() -> EffectStudioApplication:
    library = EffectLibraryRepository(InMemoryVersionedDocumentStore())
    deployments = EffectDeploymentRepository(InMemoryVersionedDocumentStore())
    user_state = EffectUserStateRepository(InMemoryVersionedDocumentStore())
    device_cache = EffectDeviceCache(InMemoryVersionedDocumentStore())
    await library.async_load()
    await deployments.async_load()
    await user_state.async_load()
    await device_cache.async_load()
    return EffectStudioApplication(library, deployments, user_state, device_cache)


async def test_library_use_cases_publish_current_versions_and_hard_delete() -> None:
    application = await _application()
    listener = MagicMock()
    application.subscribe_library(listener)

    created = await application.async_create_library_item(name="Effect", content=CONTENT)
    updated = await application.async_update_library_item(
        item_id=str(created.item.id),
        name="Updated",
        content={**CONTENT, "speed": 60},
        expected_version=created.item.version,
        expected_updated_at=created.item.updated_at,
    )
    deployment = _deployment(created.item)
    await application.deployments.async_put(deployment, expected_version=0)
    assert application.device_cache is not None
    application.device_cache.set(
        ObservedDeviceState(
            config_entry_id="entry-a",
            mode="custom",
            observed_at="2026-08-17T00:00:00Z",
            confidence=ObservationConfidence.ACTIVATION_MATCH,
            diy_code=800,
            matched_operation_id=deployment.operation_id,
            active_effect=ActiveEffectHint.from_record(
                deployment,
                observable_signature="custom:800",
                confidence=ObservationConfidence.ACTIVATION_MATCH,
            ),
        )
    )
    deleted = await application.async_delete_library_item(
        item_id=str(created.item.id),
        expected_version=updated.item.version,
        expected_updated_at=updated.item.updated_at,
    )

    assert created.item.version == 1
    assert updated.item.version == 2
    assert updated.item.updated_at > created.item.updated_at
    assert deleted.items == ()
    detached = application.deployments.get(deployment.operation_id)
    assert detached.source_kind == "deleted_effect"
    assert detached.item_id is None
    assert detached.item_version is None
    active_effect = application.device_cache.get("entry-a")
    assert active_effect is not None
    assert active_effect.active_effect is not None
    assert active_effect.active_effect.source_kind == "deleted_effect"
    assert active_effect.active_effect.item_id is None
    assert listener.call_count == 3


async def test_library_use_cases_reject_stale_write_token() -> None:
    application = await _application()
    created = await application.async_create_library_item(name="Effect", content=CONTENT)

    with pytest.raises(EffectVersionConflictError):
        await application.async_update_library_item(
            item_id=str(created.item.id),
            name="Stale",
            content=CONTENT,
            expected_version=0,
            expected_updated_at=created.item.updated_at,
        )


async def test_library_names_are_unique_and_do_not_shadow_native_effects() -> None:
    application = await _application()
    created = await application.async_create_library_item(name="My Effect", content=CONTENT)

    with pytest.raises(EffectValidationError, match="already in use"):
        await application.async_create_library_item(name="  my   effect  ", content=CONTENT)
    with pytest.raises(EffectValidationError, match="reserved"):
        await application.async_create_library_item(name="Candy", content=CONTENT)
    with pytest.raises(EffectValidationError, match="reserved"):
        await application.async_update_library_item(
            item_id=str(created.item.id),
            name="Video: Movie",
            content=CONTENT,
            expected_version=created.item.version,
            expected_updated_at=created.item.updated_at,
        )


async def test_failed_library_delete_restores_deployment_link(monkeypatch) -> None:
    application = await _application()
    created = await application.async_create_library_item(name="Effect", content=CONTENT)
    deployment = _deployment(created.item)
    await application.deployments.async_put(deployment, expected_version=0)
    monkeypatch.setattr(
        application.library._store,
        "async_save",
        AsyncMock(side_effect=OSError("library unavailable")),
    )

    with pytest.raises(OSError, match="library unavailable"):
        await application.async_delete_library_item(
            item_id=str(created.item.id),
            expected_version=created.item.version,
            expected_updated_at=created.item.updated_at,
        )

    assert application.get_saved_effect(str(created.item.id)) == created.item
    restored = application.deployments.get(deployment.operation_id)
    assert restored.source_kind == "saved_effect"
    assert restored.item_id == created.item.id
    assert restored.item_version == created.item.version


async def test_hard_delete_waits_for_saved_effect_application() -> None:
    application = await _application()
    created = await application.async_create_library_item(name="Effect", content=CONTENT)
    entered = asyncio.Event()
    release = asyncio.Event()
    applied: list[LibraryItem] = []

    async def apply_saved(_coordinator, item, **_kwargs):
        applied.append(item)
        entered.set()
        await release.wait()
        return _deployment(item)

    engine = cast(
        EffectDeploymentEngine,
        SimpleNamespace(async_apply_saved=apply_saved),
    )
    coordinator = cast(GoveeBLECoordinator, SimpleNamespace())
    apply_task = asyncio.create_task(
        application.async_apply_saved_effect(
            engine,
            coordinator,
            item_id=str(created.item.id),
            config_entry_id="entry-a",
            updated_at="2026-08-17T00:00:00Z",
        )
    )
    await entered.wait()
    delete_task = asyncio.create_task(
        application.async_delete_library_item(
            item_id=str(created.item.id),
            expected_version=created.item.version,
            expected_updated_at=created.item.updated_at,
        )
    )
    await asyncio.sleep(0)

    assert not delete_task.done()

    release.set()
    await apply_task
    await delete_task

    assert applied == [created.item]
    assert application.library_snapshot().items == ()


async def test_name_based_apply_rejects_a_concurrently_changed_version() -> None:
    application = await _application()
    created = await application.async_create_library_item(name="Effect", content=CONTENT)
    await application.async_update_library_item(
        item_id=str(created.item.id),
        name="Renamed",
        content=CONTENT,
        expected_version=created.item.version,
        expected_updated_at=created.item.updated_at,
    )

    with pytest.raises(EffectVersionConflictError):
        await application.async_apply_saved_effect(
            AsyncMock(),
            cast(GoveeBLECoordinator, SimpleNamespace()),
            item_id=str(created.item.id),
            config_entry_id="entry-a",
            updated_at="2026-08-17T00:00:00Z",
            expected_version=created.item.version,
        )


async def test_user_state_keeps_only_device_navigation_and_colours() -> None:
    application = await _application()

    updated = application.update_user_state(
        "user-a",
        selected_config_entry_id="entry-a",
        navigation={"section": "scenes", "item_id": "effect-a"},
    )
    coloured = application.record_user_colour("user-a", (1, 2, 3))

    assert updated.selected_config_entry_id == "entry-a"
    assert updated.navigation == {"section": "scenes", "item_id": "effect-a"}
    assert coloured.recent_colours == ((1, 2, 3),)


def _deployment(item: LibraryItem) -> DeploymentRecord:
    return DeploymentRecord(
        operation_id=uuid4(),
        config_entry_id="entry-a",
        diy_code=800,
        phase=DeploymentPhase.CONFIRMED,
        compiler_version=1,
        artifact_sha256=sha256(b"artifact").hexdigest(),
        updated_at="2026-08-17T00:00:00Z",
        source_kind="saved_effect",
        selector_label=item.name,
        source_origin_kind=item.origin.kind.value,
        source_content_hash=item.content_hash,
        item_id=item.id,
        item_version=item.version,
    )
