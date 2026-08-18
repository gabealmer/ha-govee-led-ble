import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bleak import BleakError
from bleak.backends.device import BLEDevice

from custom_components.ha_govee_led_ble.ble_device_resolver import (
    PORTABLE_BLE_FALLBACK_ENV,
    BLEDeviceResolution,
    BLEDeviceResolver,
    BLEDeviceSource,
)

M = "custom_components.ha_govee_led_ble.ble_device_resolver"
ADDRESS = "AA:BB:CC:DD:EE:FF"


def _device() -> BLEDevice:
    return BLEDevice(ADDRESS, "Govee_H617A_EEFF", {})


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
