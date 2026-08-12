"""Process-global advanced-effect backend, not registered by default."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.core import HomeAssistant

from .effect_application import EffectStudioApplication
from .effect_deployments import EffectDeploymentRepository, EffectDeviceCache
from .effect_drafts import EffectDraftRepository
from .effect_runtime import EffectDeploymentEngine
from .effect_storage import EffectLibraryRepository
from .effect_user_state import EffectUserStateRepository


@dataclass(slots=True)
class EffectBackend:
    library: EffectLibraryRepository
    deployments: EffectDeploymentRepository
    device_cache: EffectDeviceCache
    drafts: EffectDraftRepository
    user_state: EffectUserStateRepository
    application: EffectStudioApplication
    engine: EffectDeploymentEngine

    @classmethod
    async def async_create(cls, hass: HomeAssistant) -> EffectBackend:
        library = EffectLibraryRepository(hass)
        deployments = EffectDeploymentRepository(hass)
        device_cache = EffectDeviceCache(hass)
        drafts = EffectDraftRepository(hass)
        user_state = EffectUserStateRepository(hass)
        await library.async_load()
        await deployments.async_load()
        await device_cache.async_load()
        await drafts.async_load()
        await user_state.async_load()
        return cls(
            library=library,
            deployments=deployments,
            device_cache=device_cache,
            drafts=drafts,
            user_state=user_state,
            application=EffectStudioApplication(library, drafts, user_state),
            engine=EffectDeploymentEngine(deployments),
        )
