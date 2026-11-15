"""Battery sensor setup and Home Assistant compatibility."""

from unittest.mock import MagicMock

import pytest
from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import PERCENTAGE

from custom_components.ha_govee_led_ble.sensor import async_setup_entry


@pytest.mark.parametrize("model", ["H3001", "H6199"])
async def test_battery_sensor_setup(hass, model):
    coordinator = MagicMock(model=model, battery_pct=73, address="AA:BB:CC:DD:EE:FF")
    entry = MagicMock(runtime_data=coordinator)
    add_entities = MagicMock()

    await async_setup_entry(hass, entry, add_entities)

    if model != "H3001":
        add_entities.assert_not_called()
        return

    sensor = add_entities.call_args.args[0][0]
    assert sensor.native_unit_of_measurement == PERCENTAGE
    assert sensor.device_class == SensorDeviceClass.BATTERY
    assert sensor.native_value == 73
    coordinator.battery_pct = None
    assert sensor.native_value is None
