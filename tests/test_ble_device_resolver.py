import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bleak import BleakError
from bleak.backends.device import BLEDevice

from custom_components.ha_govee_led_ble.ble_connection import (
    async_establish_ble_connection,
    async_validate_ble_connection,
)
from custom_components.ha_govee_led_ble.ble_device_resolver import (
    PORTABLE_BLE_FALLBACK_ENV,
    BLEDeviceResolution,
    BLEDeviceResolver,
    BLEDeviceSource,
)

M = "custom_components.ha_govee_led_ble.ble_device_resolver"
CONNECTION_M = "custom_components.ha_govee_led_ble.ble_connection"
ADDRESS = "AA:BB:CC:DD:EE:FF"


def _device() -> BLEDevice:
    return BLEDevice(ADDRESS, "Govee_H617A_EEFF", {})


def _resolution() -> BLEDeviceResolution:
    return BLEDeviceResolution(_device(), type("WrappedClient", (), {}), BLEDeviceSource.HA_CACHE)


async def test_production_cache_uses_wrapped_client_without_scanner_lookup(hass):
    device = _device()
    resolver = BLEDeviceResolver()
    wrapped_client = type("WrappedClient", (), {})

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=device) as cache,
        patch(f"{M}.bluetooth.async_last_service_info") as last_service_info,
        patch(f"{M}.bluetooth.async_scanner_by_source") as scanner_by_source,
        patch(f"{M}.bleak.BleakClient", wrapped_client),
        patch(f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address", new_callable=AsyncMock) as scan,
    ):
        resolution = await resolver.async_resolve(hass, ADDRESS)

    assert resolution == BLEDeviceResolution(device, wrapped_client, BLEDeviceSource.HA_CACHE)
    cache.assert_called_once_with(hass, ADDRESS, connectable=True)
    last_service_info.assert_not_called()
    scanner_by_source.assert_not_called()
    scan.assert_not_awaited()


async def test_portable_cache_with_scanner_uses_wrapped_client(hass):
    device = _device()
    resolver = BLEDeviceResolver(portable_fallback_enabled=True)
    wrapped_client = type("WrappedClient", (), {})
    service_info = MagicMock(source="hci0")

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=device),
        patch(f"{M}.bluetooth.async_last_service_info", return_value=service_info) as last_service_info,
        patch(f"{M}.bluetooth.async_scanner_by_source", return_value=MagicMock()) as scanner_by_source,
        patch(f"{M}.bleak.BleakClient", wrapped_client),
        patch(f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address", new_callable=AsyncMock) as scan,
    ):
        resolution = await resolver.async_resolve(hass, ADDRESS)

    assert resolution == BLEDeviceResolution(device, wrapped_client, BLEDeviceSource.HA_CACHE)
    last_service_info.assert_called_once_with(hass, ADDRESS, connectable=True)
    scanner_by_source.assert_called_once_with(hass, "hci0")
    scan.assert_not_awaited()


async def test_portable_stale_cache_without_scanner_uses_original_client(hass):
    device = _device()
    resolver = BLEDeviceResolver(portable_fallback_enabled=True)
    original_client = type("OriginalClient", (), {})
    service_info = MagicMock(source="stale-hci0")

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=device),
        patch(f"{M}.bluetooth.async_last_service_info", return_value=service_info),
        patch(f"{M}.bluetooth.async_scanner_by_source", return_value=None) as scanner_by_source,
        patch(f"{M}.ORIGINAL_BLEAK_CLIENT", original_client),
        patch(f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address", new_callable=AsyncMock) as scan,
    ):
        resolution = await resolver.async_resolve(hass, ADDRESS)

    assert resolution == BLEDeviceResolution(device, original_client, BLEDeviceSource.PORTABLE_CACHE)
    scanner_by_source.assert_called_once_with(hass, "stale-hci0")
    scan.assert_not_awaited()


async def test_cache_miss_without_flag_does_not_scan(hass):
    resolver = BLEDeviceResolver()

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=None),
        patch(f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address", new_callable=AsyncMock) as scan,
    ):
        assert await resolver.async_resolve(hass, ADDRESS) is None

    scan.assert_not_awaited()


async def test_flag_enabled_fallback_returns_scanned_device(hass):
    device = _device()
    resolver = BLEDeviceResolver(portable_fallback_enabled=True, scan_timeout=2.5)
    original_client = type("OriginalClient", (), {})

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=None),
        patch(
            f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address",
            new_callable=AsyncMock,
            return_value=device,
        ) as scan,
        patch(f"{M}.ORIGINAL_BLEAK_CLIENT", original_client),
    ):
        resolution = await resolver.async_resolve(hass, ADDRESS)

    assert resolution == BLEDeviceResolution(device, original_client, BLEDeviceSource.PORTABLE_DISCOVERY)
    scan.assert_awaited_once_with(ADDRESS, timeout=2.5)


async def test_flag_enabled_fallback_miss_returns_none(hass):
    resolver = BLEDeviceResolver(portable_fallback_enabled=True)

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=None),
        patch(
            f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address",
            new_callable=AsyncMock,
            return_value=None,
        ),
    ):
        assert await resolver.async_resolve(hass, ADDRESS) is None


async def test_flag_enabled_fallback_timeout_returns_none(hass):
    resolver = BLEDeviceResolver(portable_fallback_enabled=True, scan_timeout=0.001)

    async def _never_returns(*_args, **_kwargs):
        await asyncio.Event().wait()

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=None),
        patch(f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address", side_effect=_never_returns),
    ):
        assert await resolver.async_resolve(hass, ADDRESS) is None


async def test_flag_enabled_fallback_propagates_scan_error(hass):
    resolver = BLEDeviceResolver(portable_fallback_enabled=True)

    with (
        patch(f"{M}.bluetooth.async_ble_device_from_address", return_value=None),
        patch(
            f"{M}.ORIGINAL_BLEAK_SCANNER.find_device_by_address",
            new_callable=AsyncMock,
            side_effect=BleakError("D-Bus unavailable"),
        ),
        pytest.raises(BleakError, match="D-Bus unavailable"),
    ):
        await resolver.async_resolve(hass, ADDRESS)


def test_environment_flag_is_absent_by_default():
    assert BLEDeviceResolver.from_environment({}) == BLEDeviceResolver()
    assert BLEDeviceResolver.from_environment({PORTABLE_BLE_FALLBACK_ENV: "1"}).portable_fallback_enabled


@pytest.mark.parametrize("value", ["", "0", "true", "yes", " 1", "1 "])
def test_environment_flag_rejects_every_other_value(value):
    with pytest.raises(ValueError, match="must be unset or exactly '1'"):
        BLEDeviceResolver.from_environment({PORTABLE_BLE_FALLBACK_ENV: value})


async def test_connection_establishment_reuses_resolution_retry_contract(hass):
    resolver = MagicMock(spec=BLEDeviceResolver)
    resolution = _resolution()
    resolver.async_resolve = AsyncMock(side_effect=[None, resolution])
    client = MagicMock()
    establish = AsyncMock(return_value=client)
    sleep = AsyncMock()

    assert (
        await async_establish_ble_connection(
            hass,
            ADDRESS,
            resolver=resolver,
            establish=establish,
            sleep=sleep,
        )
        is client
    )

    assert resolver.async_resolve.await_count == 2
    sleep.assert_awaited_once_with(2)
    establish.assert_awaited_once_with(resolution.client_class, resolution.device, ADDRESS)


async def test_connection_establishment_fails_after_bounded_cache_resolution(hass):
    resolver = MagicMock(spec=BLEDeviceResolver)
    resolver.async_resolve = AsyncMock(return_value=None)
    sleep = AsyncMock()

    with pytest.raises(BleakError, match="Device AA:BB:CC:DD:EE:FF not found"):
        await async_establish_ble_connection(hass, ADDRESS, resolver=resolver, sleep=sleep)

    assert resolver.async_resolve.await_count == 4
    assert sleep.await_count == 3


async def test_connection_validation_disconnects_established_client(hass):
    client = MagicMock(disconnect=AsyncMock())
    with (
        patch(f"{CONNECTION_M}.async_establish_ble_connection", new_callable=AsyncMock, return_value=client),
        patch.object(hass, "async_create_task") as create_task,
    ):
        await async_validate_ble_connection(hass, ADDRESS)
    client.disconnect.assert_awaited_once_with()
    create_task.assert_not_called()


async def test_connection_validation_surfaces_disconnect_failure(hass):
    client = MagicMock(disconnect=AsyncMock(side_effect=BleakError("disconnect failed")))
    with (
        patch(f"{CONNECTION_M}.async_establish_ble_connection", new_callable=AsyncMock, return_value=client),
        patch(f"{CONNECTION_M}.close_stale_connections_by_address", new_callable=AsyncMock) as close_stale,
    ):
        await async_validate_ble_connection(hass, ADDRESS)
    close_stale.assert_awaited_once_with(ADDRESS)


async def test_connection_validation_surfaces_cleanup_failure_without_address(hass):
    client = MagicMock(disconnect=AsyncMock(side_effect=BleakError("disconnect failed")))
    with (
        patch(f"{CONNECTION_M}.async_establish_ble_connection", new_callable=AsyncMock, return_value=client),
        patch(
            f"{CONNECTION_M}.close_stale_connections_by_address",
            new_callable=AsyncMock,
            side_effect=BleakError("cleanup failed"),
        ),
        pytest.raises(BleakError, match="Failed to close the validation connection") as exc,
    ):
        await async_validate_ble_connection(hass, ADDRESS)
    assert ADDRESS not in str(exc.value)


async def test_connection_validation_bounds_establishment_and_cleans_stale_connection(hass):
    async def never_connects(*_args, **_kwargs):
        await asyncio.Event().wait()

    with (
        patch(f"{CONNECTION_M}.VALIDATION_CONNECT_TIMEOUT", 0.001),
        patch(f"{CONNECTION_M}.async_establish_ble_connection", side_effect=never_connects),
        patch(f"{CONNECTION_M}.close_stale_connections_by_address", new_callable=AsyncMock) as close_stale,
        pytest.raises(BleakError, match="Timed out opening the validation connection") as exc,
    ):
        await async_validate_ble_connection(hass, ADDRESS)
    close_stale.assert_awaited_once_with(ADDRESS)
    assert ADDRESS not in str(exc.value)
