"""Sensor entities for Govee BLE devices."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfPercentage
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .coordinator import GoveeBLECoordinator
from .entity import GoveeBLEEntity


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: GoveeBLECoordinator = config_entry.runtime_data
    if coordinator.model == "H3001":
        async_add_entities([H3001BatterySensor(coordinator)])


class H3001BatterySensor(GoveeBLEEntity, SensorEntity):
    """Battery percentage sensor for H3001 solar string lights."""

    _attr_name = "Battery"
    _attr_native_unit_of_measurement = UnitOfPercentage
    _attr_device_class = SensorDeviceClass.BATTERY
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_unique_id_suffix = "_battery"

    @property
    def unique_id(self) -> str:
        return f"{self.coordinator.address}_{self._attr_unique_id_suffix}"

    @property
    def native_value(self) -> int | None:
        return self.coordinator.battery_pct

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {}
