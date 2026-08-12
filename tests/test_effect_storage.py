"""Atomic immutable-revision effect library storage."""

from __future__ import annotations

from dataclasses import replace
from typing import Any
from unittest.mock import AsyncMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import UnsupportedStorageVersionError
from homeassistant.helpers.storage import Store

from custom_components.ha_govee_led_ble.effect_domain import LibraryItem, SingleEffect
from custom_components.ha_govee_led_ble.effect_limits import (
    MAX_LIBRARY_ITEMS,
    MAX_LIBRARY_REVISIONS_PER_ITEM,
)
from custom_components.ha_govee_led_ble.effect_storage import (
    LIBRARY_STORE_KEY,
    LIBRARY_STORE_MINOR_VERSION,
    LIBRARY_STORE_VERSION,
    EffectLibraryRepository,
    EffectLimitError,
    EffectNotFoundError,
    EffectRevisionConflictError,
    EffectStorageError,
)


def _item(name: str = "Test") -> LibraryItem:
    return LibraryItem.new(name, SingleEffect(0, 0, 50, ((255, 0, 0),)))


async def test_library_persists_immutable_revisions(hass: HomeAssistant) -> None:
    repository = EffectLibraryRepository(hass)
    assert (await repository.async_load()).library_revision == 0
    item = _item()

    created = await repository.async_create(item, expected_library_revision=0)
    updated_item = replace(item, revision=2, name="Renamed")
    updated = await repository.async_update(
        updated_item,
        expected_revision=1,
        expected_library_revision=created.library_revision,
    )

    assert updated.library_revision == 2
    assert repository.get(item.id, 1).name == "Test"
    assert repository.get(item.id).name == "Renamed"

    reloaded = EffectLibraryRepository(hass)
    snapshot = await reloaded.async_load()
    assert snapshot == updated
    assert reloaded.get(item.id, 1) == item


async def test_library_rejects_stale_mutations(hass: HomeAssistant) -> None:
    repository = EffectLibraryRepository(hass)
    await repository.async_load()
    item = _item()
    created = await repository.async_create(item, expected_library_revision=0)

    with pytest.raises(EffectRevisionConflictError) as error:
        await repository.async_update(
            replace(item, revision=2),
            expected_revision=1,
            expected_library_revision=0,
        )

    assert error.value.current_revision == created.library_revision

    with pytest.raises(EffectRevisionConflictError) as resource_error:
        await repository.async_update(
            replace(item, revision=2),
            expected_revision=2,
            expected_library_revision=created.library_revision,
        )
    assert resource_error.value.current_revision == 1


async def test_library_rejects_duplicate_and_invalid_revision_sequences(
    hass: HomeAssistant,
) -> None:
    repository = EffectLibraryRepository(hass)
    await repository.async_load()
    item = _item()
    created = await repository.async_create(item, expected_library_revision=0)

    with pytest.raises(EffectStorageError, match="already exists"):
        await repository.async_create(
            item,
            expected_library_revision=created.library_revision,
        )
    with pytest.raises(EffectStorageError, match="must be 2"):
        await repository.async_update(
            replace(item, revision=3),
            expected_revision=1,
            expected_library_revision=created.library_revision,
        )
    with pytest.raises(EffectNotFoundError, match="revision"):
        repository.get(item.id, 99)


async def test_delete_is_soft_and_restore_preserves_identity(
    hass: HomeAssistant,
) -> None:
    repository = EffectLibraryRepository(hass)
    await repository.async_load()
    item = _item()
    created = await repository.async_create(item, expected_library_revision=0)

    deleted = await repository.async_delete(
        item.id,
        expected_revision=1,
        expected_library_revision=created.library_revision,
    )
    assert deleted.items == ()
    assert repository.snapshot(include_deleted=True).items == (item,)
    with pytest.raises(EffectNotFoundError):
        repository.get(_item().id)

    restored = await repository.async_restore(
        item.id,
        expected_revision=1,
        expected_library_revision=deleted.library_revision,
    )
    assert restored.items == (item,)

    unchanged = await repository.async_restore(
        item.id,
        expected_revision=1,
        expected_library_revision=restored.library_revision,
    )
    assert unchanged == restored


async def test_semantically_invalid_store_does_not_become_empty_library(
    hass: HomeAssistant,
) -> None:
    store = Store[dict[str, Any]](
        hass,
        LIBRARY_STORE_VERSION,
        LIBRARY_STORE_KEY,
        private=True,
        atomic_writes=True,
    )
    await store.async_save(
        {
            "library_revision": 1,
            "resources": {
                "not-a-uuid": {
                    "head_revision": 1,
                    "deleted": False,
                    "revisions": {},
                }
            },
        }
    )

    with pytest.raises(EffectStorageError, match="invalid effect resource ID"):
        await EffectLibraryRepository(hass).async_load()


async def test_store_rejects_revision_history_beyond_head(
    hass: HomeAssistant,
) -> None:
    item = _item()
    store = Store[dict[str, Any]](
        hass,
        LIBRARY_STORE_VERSION,
        LIBRARY_STORE_KEY,
        private=True,
        atomic_writes=True,
    )
    await store.async_save(
        {
            "library_revision": 1,
            "resources": {
                str(item.id): {
                    "head_revision": 1,
                    "deleted": False,
                    "revisions": {
                        "1": item.to_dict(),
                        "2": replace(item, revision=2).to_dict(),
                    },
                }
            },
        }
    )

    with pytest.raises(EffectStorageError, match="contiguous through head"):
        await EffectLibraryRepository(hass).async_load()


async def test_store_rejects_oversized_head_before_expanding_revision_range(
    hass: HomeAssistant,
) -> None:
    item = _item()
    oversized_head = 9_007_199_254_740_991
    store = Store[dict[str, Any]](
        hass,
        LIBRARY_STORE_VERSION,
        LIBRARY_STORE_KEY,
        private=True,
        atomic_writes=True,
    )
    await store.async_save(
        {
            "library_revision": 1,
            "resources": {
                str(item.id): {
                    "head_revision": oversized_head,
                    "deleted": False,
                    "revisions": {
                        str(oversized_head): replace(
                            item,
                            revision=oversized_head,
                        ).to_dict(),
                    },
                }
            },
        }
    )

    with pytest.raises(EffectStorageError, match="invalid head revision"):
        await EffectLibraryRepository(hass).async_load()


def test_library_must_be_loaded_before_use(hass: HomeAssistant) -> None:
    repository = EffectLibraryRepository(hass)

    with pytest.raises(EffectStorageError, match="not been loaded"):
        repository.snapshot()


async def test_library_refuses_newer_store_major_and_minor_versions(
    hass: HomeAssistant,
) -> None:
    newer_minor = Store[dict[str, Any]](
        hass,
        LIBRARY_STORE_VERSION,
        LIBRARY_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=LIBRARY_STORE_MINOR_VERSION + 1,
    )
    await newer_minor.async_save({"library_revision": 0, "resources": {}})

    with pytest.raises(EffectStorageError, match="cannot migrate"):
        await EffectLibraryRepository(hass).async_load()

    await newer_minor.async_remove()
    newer_major = Store[dict[str, Any]](
        hass,
        LIBRARY_STORE_VERSION + 1,
        LIBRARY_STORE_KEY,
        private=True,
        atomic_writes=True,
    )
    await newer_major.async_save({"library_revision": 0, "resources": {}})

    with pytest.raises(UnsupportedStorageVersionError):
        await EffectLibraryRepository(hass).async_load()


async def test_library_capacity_and_revision_history_are_bounded(
    hass: HomeAssistant,
) -> None:
    resources: dict[str, Any] = {}
    for index in range(MAX_LIBRARY_ITEMS):
        item = _item(f"Effect {index}")
        resources[str(item.id)] = {
            "head_revision": 1,
            "deleted": False,
            "revisions": {"1": item.to_dict()},
        }
    store = Store[dict[str, Any]](
        hass,
        LIBRARY_STORE_VERSION,
        LIBRARY_STORE_KEY,
        private=True,
        atomic_writes=True,
        minor_version=LIBRARY_STORE_MINOR_VERSION,
    )
    await store.async_save(
        {
            "library_revision": MAX_LIBRARY_ITEMS,
            "resources": resources,
        }
    )
    repository = EffectLibraryRepository(hass)
    snapshot = await repository.async_load()

    with pytest.raises(EffectLimitError, match="library"):
        await repository.async_create(
            _item("One too many"),
            expected_library_revision=snapshot.library_revision,
        )

    await store.async_remove()
    item = _item()
    revisions = {
        str(revision): replace(item, revision=revision).to_dict()
        for revision in range(1, MAX_LIBRARY_REVISIONS_PER_ITEM + 1)
    }
    await store.async_save(
        {
            "library_revision": MAX_LIBRARY_REVISIONS_PER_ITEM,
            "resources": {
                str(item.id): {
                    "head_revision": MAX_LIBRARY_REVISIONS_PER_ITEM,
                    "deleted": False,
                    "revisions": revisions,
                }
            },
        }
    )
    repository = EffectLibraryRepository(hass)
    snapshot = await repository.async_load()

    with pytest.raises(EffectLimitError, match="history"):
        await repository.async_update(
            replace(
                item,
                revision=MAX_LIBRARY_REVISIONS_PER_ITEM + 1,
            ),
            expected_revision=MAX_LIBRARY_REVISIONS_PER_ITEM,
            expected_library_revision=snapshot.library_revision,
        )


async def test_committed_library_write_survives_subscriber_failure(
    hass: HomeAssistant,
) -> None:
    repository = EffectLibraryRepository(hass)
    await repository.async_load()
    repository.subscribe(lambda _snapshot: (_ for _ in ()).throw(RuntimeError("subscriber failed")))
    item = _item()

    snapshot = await repository.async_create(item, expected_library_revision=0)

    assert snapshot.library_revision == 1
    assert (await EffectLibraryRepository(hass).async_load()).items == (item,)


async def test_failed_library_save_does_not_publish_candidate_state(
    hass: HomeAssistant,
    monkeypatch,
) -> None:
    repository = EffectLibraryRepository(hass)
    await repository.async_load()
    save = AsyncMock(side_effect=OSError("disk unavailable"))
    monkeypatch.setattr(repository._store, "async_save", save)

    with pytest.raises(OSError, match="disk unavailable"):
        await repository.async_create(_item(), expected_library_revision=0)

    assert repository.snapshot().library_revision == 0
    assert repository.snapshot().items == ()
