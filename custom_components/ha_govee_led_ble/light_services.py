"""Control helpers for the Govee BLE light."""

from collections.abc import Awaitable, Callable
from contextlib import AbstractContextManager
from typing import TYPE_CHECKING, Any

from homeassistant.components.light import ColorMode  # type: ignore[attr-defined]
from homeassistant.exceptions import ServiceValidationError

from .const import DOMAIN
from .coordinator import GoveeBLECoordinator
from .coordinator_modes import MUSIC_STYLE_SLUGS
from .generated_protocol_adapter import build_h6199_video, build_power
from .light_commands import SegmentColorGroup
from .native_profile_controls import apply_active_video_mode

__all__ = ("apply_active_video_mode",)


class _GoveeLightOwner:
    """Typed surface the service mixin relies on from ``GoveeBLELight``."""

    coordinator: GoveeBLECoordinator
    _attr_color_mode: ColorMode | None

    if TYPE_CHECKING:

        def _rollback(self) -> AbstractContextManager[None]: ...

        async def _refresh_with_retry(
            self,
            *,
            expected_effect: str | None = None,
            expected_on: bool | None = None,
            expected_brightness: int | None = None,
            expected_music_mode: str | None = None,
            expected_music_sensitivity: int | None = None,
            expected_music_calm: bool | None = None,
            expected_music_color: tuple[int, int, int] | None = None,
            expected_music_auto_color: bool = False,
            expected_video_mode: str | None = None,
            expected_video_full_screen: bool | None = None,
            expected_video_saturation: int | None = None,
            expected_video_sound_effects: bool | None = None,
            expected_video_sound_effects_softness: int | None = None,
            expected_white_brightness: int | None = None,
            retry_command: Callable[[], Awaitable[None]] | None = None,
            required: bool = True,
        ) -> None: ...

        def _notify_state_changed(self) -> None: ...

        def _require_support(self, service: str, *, supported: bool) -> None: ...


class _GoveeLightServicesMixin(_GoveeLightOwner):
    """Entity-service methods for the Govee BLE light."""

    # fmt: off
    async def _async_set_video_mode(self, mode: str, saturation: int = 100,
            capture_region: str | None = None, full_screen: bool = True,
            sound_effects: bool = False, sound_effects_softness: int | None = None) -> None:
        # fmt: on
        self._require_support("set_video_mode", supported=self.coordinator.profile.supports_video_mode)
        if sound_effects:
            self._require_support(
                "video sound effects",
                supported=self.coordinator.profile.supports_video_sound_effects,
            )
        with self._rollback():
            c = self.coordinator
            resolved_fs = full_screen if capture_region is None else capture_region == "full"
            supports_sound = c.profile.supports_video_sound_effects
            resolved_sound = sound_effects and supports_sound
            resolved_softness = (
                c.video_sound_effects_softness if sound_effects_softness is None else sound_effects_softness
            )
            # fmt: off
            packet = build_h6199_video(resolved_fs, mode == "game", saturation, resolved_sound, resolved_softness)
            # fmt: on
            async def apply() -> None:
                await self.coordinator.send_command(
                    build_power(True, self.coordinator.model)
                )
                self.coordinator.is_on = True
                await self.coordinator.send_command(packet)

            await apply()
            await self._refresh_with_retry(
                expected_on=True,
                expected_video_mode=mode,
                expected_video_full_screen=resolved_fs,
                expected_video_saturation=saturation,
                expected_video_sound_effects=resolved_sound if supports_sound else None,
                expected_video_sound_effects_softness=resolved_softness if resolved_sound else None,
                retry_command=apply,
            )
            c.video_mode, c.effect = mode, None
            c.music_mode = "off"
            c.diy_code = None
            c.video_saturation, c.video_full_screen = saturation, resolved_fs
            c.video_sound_effects = resolved_sound
            if supports_sound:
                c.video_sound_effects_softness = resolved_softness
        self._notify_state_changed()

    async def _async_set_music_mode(self, mode: str, sensitivity: int = 99,
            color: tuple[int, int, int] | None = None, calm: bool | None = None) -> None:
        slug = mode.replace(" ", "_")
        self._require_support("set_music_mode", supported=slug in self.coordinator.profile.music_modes)
        if color is not None:
            self._require_support(
                "set_music_mode",
                supported=self.coordinator.profile.supports_music_color,
            )
        if calm is not None:
            self._require_support(
                "set_music_mode",
                supported=slug in MUSIC_STYLE_SLUGS,
            )
        with self._rollback():
            c = self.coordinator
            resolved_sensitivity = max(
                c.profile.music_sensitivity_min,
                min(sensitivity, c.profile.music_sensitivity_max),
            )
            if slug in MUSIC_STYLE_SLUGS and calm is not None:
                c.music_calm = calm
            style_calm = c.music_calm if slug in MUSIC_STYLE_SLUGS else None
            # Rhythm reflects STYLE in its status reply; Bloom/Shiny repurpose that byte, so their
            # calm is written optimistically but not verified on read-back.
            verify_calm = c.music_calm if slug == "rhythm" else None

            async def apply() -> None:
                c.music_sensitivity, c.music_color = resolved_sensitivity, color
                if style_calm is not None:
                    c.music_calm = style_calm
                await c.async_select_music_slug(slug)

            await apply()
            await self._refresh_with_retry(
                expected_on=True,
                expected_music_mode=slug,
                expected_music_sensitivity=resolved_sensitivity,
                expected_music_calm=verify_calm,
                expected_music_color=color,
                expected_music_auto_color=color is None,
                retry_command=apply,
            )
        self._notify_state_changed()

    async def async_paint_segments(self, groups: list[dict[str, Any]]) -> None:
        async with self.coordinator._control_lock:
            self._require_support("paint_segments", supported=self.coordinator.profile.supports_segments)
            if not groups or any(not group.get("segments") for group in groups):
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key="invalid_segments",
                )
            resolved: list[SegmentColorGroup] = [(group["segments"], group["rgb_color"]) for group in groups]
            try:
                await self.coordinator.async_paint_segments(resolved)
            except (TypeError, ValueError) as err:
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key="invalid_segments",
                ) from err

    async def async_set_segment_color(self, segments: list[int], color: tuple[int, int, int]) -> None:
        group: dict[str, Any] = {"segments": segments, "rgb_color": color}
        await self.async_paint_segments([group])

    async def async_set_segment_brightness(self, segments: list[int], brightness: int) -> None:
        async with self.coordinator._control_lock:
            self._require_support("set_segment_brightness", supported=self.coordinator.profile.supports_segments)
            if not segments:
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key="invalid_segments",
                )
            try:
                await self.coordinator.async_set_segment_brightness(segments, brightness)
            except (TypeError, ValueError) as err:
                raise ServiceValidationError(
                    translation_domain=DOMAIN,
                    translation_key="invalid_segments",
                ) from err
            self._notify_state_changed()
