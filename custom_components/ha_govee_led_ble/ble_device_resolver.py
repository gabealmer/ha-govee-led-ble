"""Resolve BLE devices through Home Assistant with an isolated-harness fallback."""

import asyncio
import os
from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum

import bleak
from bleak import BleakClient
from bleak.backends.device import BLEDevice
from habluetooth.usage import ORIGINAL_BLEAK_CLIENT, ORIGINAL_BLEAK_SCANNER
from homeassistant.components import bluetooth
from homeassistant.core import HomeAssistant

PORTABLE_BLE_FALLBACK_ENV = "HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK"
PORTABLE_BLE_SCAN_TIMEOUT = 10.0


def _portable_fallback_enabled(environ: Mapping[str, str]) -> bool:
    value = environ.get(PORTABLE_BLE_FALLBACK_ENV)
    if value is None:
        return False
    if value == "1":
        return True
    raise ValueError(f"{PORTABLE_BLE_FALLBACK_ENV} must be unset or exactly '1'")


class BLEDeviceSource(StrEnum):
    """The transport path that supplied a BLE device."""

    HA_CACHE = "ha_cache"
    PORTABLE_CACHE = "portable_cache"
    PORTABLE_DISCOVERY = "portable_discovery"


@dataclass(frozen=True, slots=True)
class BLEDeviceResolution:
    """A device paired with the client class suitable for its source."""

    device: BLEDevice
    client_class: type[BleakClient]
    source: BLEDeviceSource


@dataclass(frozen=True, slots=True)
class BLEDeviceResolver:
    """Resolve from Home Assistant's cache before any optional direct scan."""

    portable_fallback_enabled: bool = False
    scan_timeout: float = PORTABLE_BLE_SCAN_TIMEOUT

    @classmethod
    def from_environment(cls, environ: Mapping[str, str] | None = None) -> BLEDeviceResolver:
        return cls(portable_fallback_enabled=_portable_fallback_enabled(os.environ if environ is None else environ))

    async def async_resolve(self, hass: HomeAssistant, address: str) -> BLEDeviceResolution | None:
        device = bluetooth.async_ble_device_from_address(hass, address, connectable=True)
        if device is not None:
            if self.portable_fallback_enabled:
                service_info = bluetooth.async_last_service_info(hass, address, connectable=True)
                scanner = (
                    bluetooth.async_scanner_by_source(hass, service_info.source) if service_info is not None else None
                )
                if scanner is None:
                    return BLEDeviceResolution(device, ORIGINAL_BLEAK_CLIENT, BLEDeviceSource.PORTABLE_CACHE)
            return BLEDeviceResolution(device, bleak.BleakClient, BLEDeviceSource.HA_CACHE)
        if not self.portable_fallback_enabled:
            return None
        try:
            async with asyncio.timeout(self.scan_timeout):
                device = await ORIGINAL_BLEAK_SCANNER.find_device_by_address(address, timeout=self.scan_timeout)
        except TimeoutError:
            return None
        if device is None:
            return None
        return BLEDeviceResolution(device, ORIGINAL_BLEAK_CLIENT, BLEDeviceSource.PORTABLE_DISCOVERY)
