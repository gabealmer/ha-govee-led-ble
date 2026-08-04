"""Constants for HA Govee LED BLE."""

from dataclasses import dataclass

DOMAIN = "ha_govee_led_ble"
CONF_MODEL = "model"


@dataclass(frozen=True)
class ModelProfile:
    name: str
    state_readable: bool = False
    scene_source: str = "none"
    supports_video_mode: bool = False
    supports_video_sound_effects: bool = False
    supports_white_balance: bool = False
    supports_relative_brightness: bool = False
    supports_blank_screen: bool = False
    music_modes: tuple[str, ...] = ()
    supports_music_color: bool = False
    supports_music_style: bool = False
    supports_music_params: bool = False
    supports_white_brightness: bool = False
    static_readback_echoes_color: bool = False
    supports_diy: bool = False
    supports_timers: bool = False
    supports_poweroff_memory: bool = False
    segment_count: int = 0
    supports_segment_writes: bool = False

    @property
    def supports_segments(self) -> bool:
        return self.segment_count > 0 and self.supports_segment_writes

    @property
    def supports_music_mode(self) -> bool:
        return bool(self.music_modes)

    @property
    def custom_effect_kinds(self) -> frozenset[str]:
        kinds = {"segments"} if self.supports_segments else set()
        if self.supports_diy:
            kinds.update({"sketch", "vibrant", "flat", "combo"})
        return frozenset(kinds)


MUSIC_MODES: dict[str, int] = {
    "energetic": 0x05,
    "rhythm": 0x03,
    "spectrum": 0x04,
    "rolling": 0x06,
    "separation": 0x32,
    "hopping": 0x33,
    "piano keys": 0x34,
    "fountain": 0x35,
    "day and night": 0x37,
    "bloom": 0x30,
    "shiny": 0x31,
}

# Single source of truth for the ``select.music_mode`` options: HA slugs (underscored, no
# "off") mapped to their live-confirmed mode codes. Distinct from ``MUSIC_MODES`` above, whose
# spaced display names remain the parse/service vocabulary.
MUSIC_MODE_SLUGS: dict[str, int] = {
    "energetic": 0x05,
    "rhythm": 0x03,
    "spectrum": 0x04,
    "rolling": 0x06,
    "separation": 0x32,
    "hopping": 0x33,
    "piano_keys": 0x34,
    "fountain": 0x35,
    "day_and_night": 0x37,
    "bloom": 0x30,
    "shiny": 0x31,
}

_H6199_MUSIC_MODES = ("energetic", "rhythm", "spectrum", "rolling")


MODEL_PROFILES: dict[str, ModelProfile] = {
    "H617A": ModelProfile(
        "H617A LED Strip",
        state_readable=True,
        scene_source="api",
        music_modes=tuple(MUSIC_MODE_SLUGS),
        supports_music_color=True,
        supports_music_style=True,
        supports_music_params=True,
        supports_diy=True,
        supports_timers=True,
        segment_count=15,
        supports_segment_writes=True,
        # supports_white_brightness stays false, and NOT because the command does nothing. Driven
        # directly on 2026-07-31 it dims the strip and compounds with the whole-strip opcode 0x04
        # rather than duplicating it (command_write::static_brightness). Two things block exposing
        # it through this service. It has no read-back, and async_set_white_brightness verifies
        # through _refresh_with_retry, which raises when the field is never observed. And the
        # service means "the level of the white mode" and forces ColorMode.COLOR_TEMP, which is not
        # what the frame does here: on this model it is a relative brightness that multiplies the
        # master. Exposing that axis needs its own control, which is a feature, not a correction.
    ),
    "H6199": ModelProfile(
        "H6199 DreamView T1",
        state_readable=True,
        supports_video_mode=True,
        supports_video_sound_effects=True,
        # The three registers the app reaches from the same video sheet, each modelled from an
        # H6199 capture and reproduced byte-exact by its builder: white balance and blank screen
        # behind the 33 a9 selector, relative brightness on 33 ae of its own.
        supports_white_balance=True,
        supports_relative_brightness=True,
        supports_blank_screen=True,
        music_modes=_H6199_MUSIC_MODES,
        supports_white_brightness=True,
        # UNVERIFIED, and deliberately named so it can be falsified. The parser assumed this of
        # every model until the H617A disproved it (status_reply::cm_static: the byte after the
        # mode mirrors the 33 a3 register, and no colour is ever echoed). That evidence is H617A
        # only and says nothing about this model, so the old assumption is kept here rather than
        # silently extended or silently dropped. supports_white_brightness depends on it: the
        # write is verified against a read-back, so if the H6199 also echoes nothing, that service
        # raises. Settle it in the H6199 discovery run.
        static_readback_echoes_color=True,
        # Fifteen segments, and this now carries a protocol claim rather than sizing a preview
        # image. A whole-strip write from the app addresses fifteen bits (0x7fff) and the app draws
        # fifteen tiles for this model, captured 2026-08-03; colouring one segment, then a second,
        # then both gave 0x0001, 0x0004 and their OR, which is what makes it a mask rather than an
        # index (h6199_command_write::static_colour_body::segment_mask).
        #
        # It is still NOT 38. The device answers 38 to aa 40, but that reply was positively excluded
        # as an app segment count (an external H7015 reads 30 against 15 segments proven by an
        # exhaustive per-bit sweep), so copying it in would re-assert the reading we disproved.
        segment_count=15,
        # build_segment_color reproduces three captured H6199 app writes byte for byte, whole-strip
        # and per-segment alike, so painting segments is the app's own behaviour on this model
        # rather than an H617A habit carried across. The brightness sub-register those services also
        # reach has no H6199 capture, but supports_white_brightness already assumes it, so enabling
        # this adds no new assumption.
        supports_segment_writes=True,
    ),
}

UNSUPPORTED_PROFILE = ModelProfile("Unsupported Govee device")


def resolve_model(model: str) -> str | None:
    candidate = model.strip().upper()
    return next((known for known in MODEL_PROFILES if candidate.startswith(known)), None)


def get_profile(model: str) -> ModelProfile:
    resolved = resolve_model(model)
    return MODEL_PROFILES[resolved] if resolved is not None else UNSUPPORTED_PROFILE
