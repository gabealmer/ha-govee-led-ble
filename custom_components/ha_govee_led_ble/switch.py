"""Switch entities for HA Govee LED BLE."""

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import h6199_controls as c
from .coordinator import GoveeBLECoordinator
from .entity import GoveeBLEEntity

PARALLEL_UPDATES = 0


class _TimerEnableSwitch(GoveeBLEEntity, SwitchEntity):
    _attr_entity_category = EntityCategory.CONFIG
    _attr_entity_registry_enabled_default = False

    def __init__(self, coordinator: GoveeBLECoordinator, *, key: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.address.replace(':', '').lower()}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = coordinator.device_info


class SleepTimerSwitch(_TimerEnableSwitch):
    def __init__(self, coordinator: GoveeBLECoordinator) -> None:
        super().__init__(coordinator, key="sleep_timer")

    @property
    def is_on(self) -> bool | None:
        return self.coordinator.sleep_timer_enabled

    async def async_turn_on(self, **kwargs: object) -> None:
        await self.coordinator.async_set_sleep_timer(enabled=True)

    async def async_turn_off(self, **kwargs: object) -> None:
        await self.coordinator.async_set_sleep_timer(enabled=False)


class WakeupTimerSwitch(_TimerEnableSwitch):
    def __init__(self, coordinator: GoveeBLECoordinator) -> None:
        super().__init__(coordinator, key="wakeup_timer")

    @property
    def is_on(self) -> bool | None:
        return self.coordinator.wakeup_timer_enabled

    async def async_turn_on(self, **kwargs: object) -> None:
        await self.coordinator.async_set_wakeup_timer(enabled=True)

    async def async_turn_off(self, **kwargs: object) -> None:
        await self.coordinator.async_set_wakeup_timer(enabled=False)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    await c.async_setup_switch_entry(hass, config_entry, async_add_entities)
    coordinator = config_entry.runtime_data
    if coordinator.profile.supports_timers:
        async_add_entities([SleepTimerSwitch(coordinator), WakeupTimerSwitch(coordinator)])
