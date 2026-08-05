from dataclasses import replace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bleak.exc import BleakError
from homeassistant.components.number import NumberMode
from homeassistant.const import EntityCategory

from custom_components.ha_govee_led_ble.coordinator_modes import MUSIC_PARAM_SPECS
from custom_components.ha_govee_led_ble.h6199_controls import H6199ParameterNumber as N
from custom_components.ha_govee_led_ble.h6199_controls import MusicParamNumber as MPNumber
from custom_components.ha_govee_led_ble.h6199_controls import (
    _set_with_rollback,
    _supports_number_param,
    async_setup_number_entry,
)
from custom_components.ha_govee_led_ble.protocol import (
    WHITE_BALANCE_RESET,
    build_relative_brightness,
    build_video_mode,
    build_video_white_balance,
)


def test_native_value_property(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    c.music_sensitivity = 42
    assert N(c, key="music_sensitivity", name="T").native_value == 42.0
    assert N(c, key="music_sensitivity", name="T").entity_registry_enabled_default is True


async def test_music_sensitivity(mock_h6199_coordinator):
    (c := mock_h6199_coordinator).music_mode, c.music_color = "rolling", (10, 20, 30)
    entity = N(c, key="music_sensitivity", name="T")
    assert entity.native_max_value == 99  # device caps sensitivity at 99, not 100
    await entity.async_set_native_value(77)
    assert c.music_sensitivity == 77
    c.async_select_music_slug.assert_awaited_once_with("rolling")


async def test_rollback_restores_the_previous_value_when_the_write_fails(mock_h6199_coordinator):
    """Carried over from master, which is where this case was written. The no-op test below
    covers the path where nothing is sent; this one covers the write FAILING, which is the
    only path where the optimistic value has to be put back."""
    c = mock_h6199_coordinator
    c.music_sensitivity = 55
    c.is_on, c.music_mode = True, "rolling"
    c.async_select_music_slug = AsyncMock(side_effect=BleakError("timeout"))
    with pytest.raises(BleakError):
        await N(c, key="music_sensitivity", name="T").async_set_native_value(20)
    assert c.music_sensitivity == 55


def test_supports_number_param_unknown_key(mock_h6199_coordinator):
    assert _supports_number_param(mock_h6199_coordinator, "unknown") is False


async def test_set_with_rollback_noop(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    reapply = AsyncMock()
    await _set_with_rollback(c, key="music_sensitivity", value=c.music_sensitivity, reapply=reapply)
    reapply.assert_not_called()
    c.async_set_updated_data.assert_not_called()


async def test_setup_number_entry_h617a(mock_coordinator):
    add = MagicMock()
    await async_setup_number_entry(MagicMock(), MagicMock(runtime_data=mock_coordinator), add)
    keys = [entity._key for entity in add.call_args.args[0]]
    assert keys == [
        "music_sensitivity",
        "music_separation_point",
        "music_hopping_brightness",
        "music_piano_key_count",
        "music_daynight_segments",
        "music_daynight_speed",
    ]


async def test_setup_number_entry_h6199(mock_h6199_coordinator):
    add = MagicMock()
    await async_setup_number_entry(MagicMock(), MagicMock(runtime_data=mock_h6199_coordinator), add)
    keys = [entity._key for entity in add.call_args.args[0]]
    assert keys == [
        "music_sensitivity",
        "video_saturation",
        "video_sound_effects_softness",
        "relative_brightness",
        "white_balance_red",
        "white_balance_blue",
    ]


async def test_setup_number_entry_without_supported_params(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    c.profile = replace(
        c.profile,
        music_modes=(),
        supports_video_mode=False,
        supports_video_sound_effects=False,
        supports_relative_brightness=False,
        supports_white_balance=False,
    )
    add = MagicMock()
    await async_setup_number_entry(MagicMock(), MagicMock(runtime_data=c), add)
    add.assert_not_called()


async def test_h617a_gets_no_h6199_display_controls(mock_coordinator):
    """The two models share the table, so the gate is what keeps a strip free of TV settings."""
    add = MagicMock()
    await async_setup_number_entry(MagicMock(), MagicMock(runtime_data=mock_coordinator), add)
    keys = [entity._key for entity in add.call_args.args[0]]
    assert not {"video_saturation", "relative_brightness", "white_balance_red"} & set(keys)


def test_white_balance_numbers_are_boxes_over_the_full_gain_range(mock_h6199_coordinator):
    """A slider would suggest a 0..100 percent; these are raw gains and the neutral is 16 and 3."""
    red = N(mock_h6199_coordinator, key="white_balance_red")
    assert (red.native_min_value, red.native_max_value) == (0, 255)
    assert red.mode is NumberMode.BOX
    assert red.native_value is None


async def test_white_balance_writes_both_axes_naming_the_untouched_one(mock_h6199_coordinator):
    """One byte cannot be sent alone, and nothing here reads the other back, so it comes from us."""
    c = mock_h6199_coordinator
    c.white_balance_red = c.white_balance_blue = None
    c.white_balance = (WHITE_BALANCE_RESET[0], 9)
    await N(c, key="white_balance_blue").async_set_native_value(9)
    assert c.white_balance_blue == 9
    c.send_command.assert_awaited_once_with(build_video_white_balance(WHITE_BALANCE_RESET[0], 9))


async def test_white_balance_rolls_back_when_the_write_fails(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    c.white_balance_red = 16
    c.send_command = AsyncMock(side_effect=BleakError("timeout"))
    with pytest.raises(BleakError):
        await N(c, key="white_balance_red").async_set_native_value(21)
    assert c.white_balance_red == 16
    c.async_set_updated_data.assert_not_called()


async def test_relative_brightness_writes_a_direct_percent(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    c.relative_brightness = None
    entity = N(c, key="relative_brightness")
    assert (entity.native_min_value, entity.native_max_value) == (0, 100)
    await entity.async_set_native_value(36)
    assert c.relative_brightness == 36
    c.send_command.assert_awaited_once_with(build_relative_brightness(36))


async def test_video_percentages_ride_the_video_frame_only_while_video_is_live(mock_h6199_coordinator):
    """Saturation and softness are fields of the 33 05 00 frame, not registers of their own."""
    c = mock_h6199_coordinator
    c.is_on, c.video_mode = True, "off"
    await N(c, key="video_saturation").async_set_native_value(88)
    assert c.video_saturation == 88
    c.send_command.assert_not_called()

    c.video_mode = "movie"
    await N(c, key="video_sound_effects_softness").async_set_native_value(12)
    assert c.video_sound_effects_softness == 12
    c.send_command.assert_awaited_once_with(build_video_mode(c.video_full_screen, False, 88, c.video_sound_effects, 12))


def test_softness_floor_matches_the_wire(mock_h6199_coordinator):
    """Every captured write carries at least 1; a 0 the device never sees is not a setting."""
    assert N(mock_h6199_coordinator, key="video_sound_effects_softness").native_min_value == 1


async def test_number_restores_last_written_without_sending(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    c.relative_brightness = None
    entity = N(c, key="relative_brightness")
    entity.async_get_last_state = AsyncMock(return_value=MagicMock(state="36"))
    await entity._async_restore_state()
    assert c.relative_brightness == 36
    c.send_command.assert_not_called()


@pytest.mark.parametrize("state", ["unknown", "9999"])
async def test_number_restore_ignores_unusable_states(mock_h6199_coordinator, state):
    c = mock_h6199_coordinator
    c.relative_brightness = None
    entity = N(c, key="relative_brightness")
    entity.async_get_last_state = AsyncMock(return_value=MagicMock(state=state))
    await entity._async_restore_state()
    assert c.relative_brightness is None
    c.async_set_updated_data.assert_not_called()


async def test_number_restore_skips_when_already_known(mock_h6199_coordinator):
    """A value already on the coordinator wins, which is what keeps the restore out of a read's way.

    The light answers aa a9 and aa ae, so these fields will one day be set from the wire during
    startup. Restoring over that would show the last thing we wrote in place of what the device
    reported, and this is the assertion that stops it.
    """
    c = mock_h6199_coordinator
    c.relative_brightness = 50
    entity = N(c, key="relative_brightness")
    entity.async_get_last_state = AsyncMock()
    await entity._async_restore_state()
    entity.async_get_last_state.assert_not_called()


async def test_number_restore_without_last_state(mock_h6199_coordinator):
    c = mock_h6199_coordinator
    c.relative_brightness = None
    entity = N(c, key="relative_brightness")
    entity.async_get_last_state = AsyncMock(return_value=None)
    await entity._async_restore_state()
    assert c.relative_brightness is None


async def test_number_added_to_hass_triggers_restore(mock_h6199_coordinator):
    entity = N(mock_h6199_coordinator, key="relative_brightness")
    entity._async_restore_state = AsyncMock()
    with patch(
        "custom_components.ha_govee_led_ble.entity.GoveeBLEEntity.async_added_to_hass",
        new_callable=AsyncMock,
    ) as super_added:
        await entity.async_added_to_hass()
    super_added.assert_awaited_once()
    entity._async_restore_state.assert_awaited_once()


def _mspec(key):
    return next(s for s in MUSIC_PARAM_SPECS if s.key == key)


async def test_music_param_number_is_experimental_and_config(mock_coordinator):
    ent = MPNumber(mock_coordinator, _mspec("music_daynight_speed"))
    assert ent._attr_entity_registry_enabled_default is False
    assert ent._attr_entity_category is EntityCategory.CONFIG
    assert (ent.native_min_value, ent.native_max_value) == (1, 50)
    assert ent.native_value == 10.0


async def test_music_param_number_reapplies_when_mode_active(mock_coordinator):
    c = mock_coordinator
    c.is_on, c.music_mode = True, "day_and_night"
    await MPNumber(c, _mspec("music_daynight_speed")).async_set_native_value(30)
    assert c.music_daynight_speed == 30
    c.async_apply_music_params.assert_awaited_once_with(0x37)


async def test_music_param_number_stores_only_when_inactive(mock_coordinator):
    c = mock_coordinator
    c.is_on, c.music_mode = True, "off"
    await MPNumber(c, _mspec("music_separation_point")).async_set_native_value(4)
    assert c.music_separation_point == 4
    c.async_apply_music_params.assert_not_awaited()
