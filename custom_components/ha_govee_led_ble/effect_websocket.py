"""Authenticated WebSocket API for the optional advanced-effect backend."""

from __future__ import annotations

from typing import Any, cast
from uuid import uuid4

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    require_admin,
    websocket_command,
)
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, EFFECT_FAMILY_SCENES
from .effect_backend import EffectBackend
from .effect_catalogue import custom_effect_catalogue_payload
from .effect_contracts import EditorApiInfo, device_effect_capabilities
from .effect_deployments import DeploymentSnapshot
from .effect_domain import (
    EffectValidationError,
    OpaqueContent,
)
from .effect_limits import (
    MAX_EDITOR_DEVICES,
    MAX_SCENE_CATALOGUE_ENTRIES,
)
from .effect_preview import (
    PreviewError,
    PreviewOwnershipError,
    PreviewRateLimitError,
    PreviewSequenceError,
    PreviewSessionNotFoundError,
    PreviewShutdownError,
    PreviewStatus,
)
from .effect_scenes import (
    SceneUnavailableError,
    async_apply_scene,
    scene_catalogue_payload,
    scene_detail_payload,
)
from .effect_storage import (
    EffectLimitError,
    EffectNotFoundError,
    EffectRevisionConflictError,
    EffectStorageError,
    LibrarySnapshot,
)
from .effect_websocket_payloads import (
    draft_summary,
    library_snapshot_payload,
)
from .effect_websocket_schema import (
    EFFECT_CONTENT,
    EFFECT_NAME,
    IDENTIFIER,
    NON_NEGATIVE_REVISION,
    POSITIVE_REVISION,
    PREFERENCES,
    SCENE_ID,
    SPEED_INDEX,
    STRICT_BOOL,
    TIMESTAMP,
    UUID_TEXT,
    WS_APPLY,
    WS_APPLY_SNAPSHOT,
    WS_CUSTOM_CATALOGUE,
    WS_DEPLOYMENT_SUBSCRIBE,
    WS_DEVICES,
    WS_DRAFT_CREATE,
    WS_DRAFT_DELETE,
    WS_DRAFT_GET,
    WS_DRAFT_LIST,
    WS_DRAFT_UPDATE,
    WS_INFO,
    WS_LIBRARY_CREATE,
    WS_LIBRARY_DELETE,
    WS_LIBRARY_GET,
    WS_LIBRARY_LIST,
    WS_LIBRARY_SUBSCRIBE,
    WS_LIBRARY_UPDATE,
    WS_PREVIEW_APPLY_SCENE,
    WS_PREVIEW_APPLY_SNAPSHOT,
    WS_PREVIEW_CANCEL,
    WS_PREVIEW_CLOSE,
    WS_PREVIEW_OPEN,
    WS_PREVIEW_SUBSCRIBE,
    WS_SCENE_APPLY,
    WS_SCENE_CATALOGUE_GET,
    WS_SCENE_CATALOGUE_LIST,
    WS_USER_STATE_GET,
    WS_USER_STATE_RECORD_COLOUR,
    WS_USER_STATE_UPDATE,
    strict_int,
)

BACKEND_DATA_KEY = "effect_backend"


@websocket_command({vol.Required("type"): WS_INFO})
@callback
def ws_editor_info(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    connection.send_result(msg["id"], EditorApiInfo().to_dict())


@websocket_command({vol.Required("type"): WS_DEVICES})
@callback
def ws_editor_devices(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    devices = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is not ConfigEntryState.LOADED:
            continue
        coordinator = entry.runtime_data
        devices.append(
            device_effect_capabilities(
                entry.entry_id,
                coordinator.model,
                entry.title,
                coordinator.profile.segment_count,
            ).to_dict()
        )
    if len(devices) > MAX_EDITOR_DEVICES:
        connection.send_error(
            msg["id"],
            "limit_reached",
            f"device response must not exceed {MAX_EDITOR_DEVICES} entries",
        )
        return
    connection.send_result(msg["id"], {"devices": devices})


@websocket_command({vol.Required("type"): WS_CUSTOM_CATALOGUE})
@callback
def ws_custom_catalogue(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    connection.send_result(msg["id"], {"catalogue": custom_effect_catalogue_payload()})


@websocket_command(
    {
        vol.Required("type"): WS_SCENE_CATALOGUE_LIST,
        vol.Required("config_entry_id"): IDENTIFIER,
    }
)
@callback
def ws_scene_catalogue_list(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    entry = hass.config_entries.async_get_entry(msg["config_entry_id"])
    if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
        connection.send_error(msg["id"], "not_found", "target config entry is not loaded")
        return
    coordinator = entry.runtime_data
    try:
        catalogue = scene_catalogue_payload(
            coordinator.model,
            enabled=EFFECT_FAMILY_SCENES in coordinator.effect_families,
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    scenes = catalogue["scenes"]
    if not isinstance(scenes, list):
        connection.send_error(msg["id"], "invalid_format", "scene catalogue has no scene list")
        return
    if len(scenes) > MAX_SCENE_CATALOGUE_ENTRIES:
        connection.send_error(
            msg["id"],
            "limit_reached",
            f"scene catalogue must not exceed {MAX_SCENE_CATALOGUE_ENTRIES} entries",
        )
        return
    connection.send_result(msg["id"], {"catalogue": catalogue})


@websocket_command(
    {
        vol.Required("type"): WS_SCENE_CATALOGUE_GET,
        vol.Required("config_entry_id"): IDENTIFIER,
        vol.Required("scene_id"): SCENE_ID,
        vol.Required("effect_id"): SCENE_ID,
    }
)
@callback
def ws_scene_catalogue_get(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    entry = hass.config_entries.async_get_entry(msg["config_entry_id"])
    if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
        connection.send_error(msg["id"], "not_found", "target config entry is not loaded")
        return
    try:
        detail = scene_detail_payload(
            entry.runtime_data.model,
            msg["scene_id"],
            msg["effect_id"],
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    connection.send_result(msg["id"], detail)


@websocket_command(
    {
        vol.Required("type"): WS_SCENE_APPLY,
        vol.Required("config_entry_id"): IDENTIFIER,
        vol.Required("scene_id"): SCENE_ID,
        vol.Required("effect_id"): SCENE_ID,
        vol.Optional("speed_index"): SPEED_INDEX,
    }
)
@require_admin
@async_response
async def ws_scene_apply(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    entry = hass.config_entries.async_get_entry(msg["config_entry_id"])
    if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
        connection.send_error(msg["id"], "not_found", "target config entry is not loaded")
        return
    try:
        resolved, speed_index = await async_apply_scene(
            hass,
            entry,
            scene_id=msg["scene_id"],
            effect_id=msg["effect_id"],
            speed_index=msg.get("speed_index"),
            user_id=connection.user.id,
        )
    except SceneUnavailableError as exc:
        connection.send_error(msg["id"], "scene_unavailable", str(exc))
        return
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    except (HomeAssistantError, RuntimeError) as exc:
        connection.send_error(msg["id"], "apply_failed", str(exc))
        return
    connection.send_result(
        msg["id"],
        {
            "scene": scene_detail_payload(
                entry.runtime_data.model,
                resolved.entry.scene_id,
                resolved.entry.effect_id,
            )["scene"],
            "speed_index": speed_index,
            "readback": "scene_identity_only",
        },
    )


@websocket_command({vol.Required("type"): WS_PREVIEW_OPEN})
@require_admin
@callback
def ws_preview_open(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)

    try:
        session_id = backend.preview.open_session(owner=connection)
    except PreviewShutdownError as exc:
        connection.send_error(msg["id"], "shutdown", str(exc))
        return

    @callback
    def close_session() -> None:
        hass.async_create_task(
            _async_close_preview_session(backend, session_id, connection),
            name=f"{DOMAIN} close preview session",
        )

    connection.subscriptions[msg["id"]] = close_session
    connection.send_result(msg["id"], {"session_id": session_id})


@websocket_command(
    {
        vol.Required("type"): WS_PREVIEW_CLOSE,
        vol.Required("session_id"): UUID_TEXT,
    }
)
@require_admin
@async_response
async def ws_preview_close(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        await _backend(hass).preview.async_close_session(
            msg["session_id"],
            connection,
        )
    except PreviewOwnershipError as exc:
        connection.send_error(msg["id"], "unauthorized", str(exc))
        return
    except PreviewSessionNotFoundError as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    connection.send_result(msg["id"], {"closed": True})


@websocket_command(
    {
        vol.Required("type"): WS_PREVIEW_APPLY_SNAPSHOT,
        vol.Required("session_id"): UUID_TEXT,
        vol.Required("sequence"): POSITIVE_REVISION,
        vol.Required("config_entry_id"): IDENTIFIER,
        vol.Required("updated_at"): TIMESTAMP,
        vol.Required("name"): EFFECT_NAME,
        vol.Required("content"): EFFECT_CONTENT,
        vol.Optional("force", default=False): STRICT_BOOL,
    }
)
@require_admin
@async_response
async def ws_preview_apply_snapshot(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    try:
        backend.preview.require_owner(msg["session_id"], connection)
        item = backend.application.new_authored_item(
            name=msg["name"],
            content=msg["content"],
        )
        acceptance = await backend.preview.async_queue_snapshot(
            session_id=msg["session_id"],
            owner=connection,
            config_entry_id=msg["config_entry_id"],
            sequence=msg["sequence"],
            updated_at=msg["updated_at"],
            item=item,
            reassert=msg["force"],
        )
    except Exception as exc:
        _send_preview_error(connection, msg["id"], exc)
        return
    connection.send_result(msg["id"], acceptance.to_dict())


@websocket_command(
    {
        vol.Required("type"): WS_PREVIEW_APPLY_SCENE,
        vol.Required("session_id"): UUID_TEXT,
        vol.Required("sequence"): POSITIVE_REVISION,
        vol.Required("config_entry_id"): IDENTIFIER,
        vol.Required("updated_at"): TIMESTAMP,
        vol.Required("scene_id"): SCENE_ID,
        vol.Required("effect_id"): SCENE_ID,
        vol.Optional("speed_index"): SPEED_INDEX,
        vol.Optional("force", default=False): STRICT_BOOL,
    }
)
@require_admin
@async_response
async def ws_preview_apply_scene(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    try:
        backend.preview.require_owner(msg["session_id"], connection)
        acceptance = await backend.preview.async_queue_scene(
            session_id=msg["session_id"],
            owner=connection,
            config_entry_id=msg["config_entry_id"],
            sequence=msg["sequence"],
            updated_at=msg["updated_at"],
            scene_id=msg["scene_id"],
            effect_id=msg["effect_id"],
            speed_index=msg.get("speed_index"),
        )
    except Exception as exc:
        _send_preview_error(connection, msg["id"], exc)
        return
    connection.send_result(msg["id"], acceptance.to_dict())


@websocket_command(
    {
        vol.Required("type"): WS_PREVIEW_CANCEL,
        vol.Required("session_id"): UUID_TEXT,
        vol.Optional("config_entry_id"): IDENTIFIER,
    }
)
@require_admin
@async_response
async def ws_preview_cancel(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        await _backend(hass).preview.async_cancel(
            session_id=msg["session_id"],
            owner=connection,
            config_entry_id=msg.get("config_entry_id"),
        )
    except PreviewOwnershipError as exc:
        connection.send_error(msg["id"], "unauthorized", str(exc))
        return
    except PreviewSessionNotFoundError as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    connection.send_result(msg["id"], {"cancelled": True})


@websocket_command(
    {
        vol.Required("type"): WS_PREVIEW_SUBSCRIBE,
        vol.Required("session_id"): UUID_TEXT,
    }
)
@require_admin
@callback
def ws_preview_subscribe(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)

    @callback
    def forward(status: PreviewStatus) -> None:
        connection.send_event(msg["id"], status.to_dict())

    try:
        connection.subscriptions[msg["id"]] = backend.preview.subscribe(
            session_id=msg["session_id"],
            owner=connection,
            subscription_id=msg["id"],
            listener=forward,
        )
    except Exception as exc:
        _send_preview_error(connection, msg["id"], exc)
        return
    connection.send_result(msg["id"])


@websocket_command({vol.Required("type"): WS_LIBRARY_LIST})
@callback
def ws_library_list(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    snapshot = backend.application.library_snapshot()
    connection.send_result(msg["id"], library_snapshot_payload(snapshot))


@websocket_command({vol.Required("type"): WS_LIBRARY_SUBSCRIBE})
@callback
def ws_library_subscribe(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    application = _backend(hass).application

    @callback
    def forward(snapshot: LibrarySnapshot) -> None:
        connection.send_event(msg["id"], library_snapshot_payload(snapshot))

    connection.subscriptions[msg["id"]] = application.subscribe_library(forward)
    connection.send_result(msg["id"])
    forward(application.library_snapshot())


@websocket_command(
    {
        vol.Required("type"): WS_LIBRARY_GET,
        vol.Required("item_id"): UUID_TEXT,
        vol.Optional("revision"): POSITIVE_REVISION,
    }
)
@callback
def ws_library_get(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    try:
        item = backend.application.get_saved_effect(
            msg["item_id"],
            msg.get("revision"),
        )
    except (ValueError, EffectNotFoundError) as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    if isinstance(item.content, OpaqueContent) and not connection.user.is_admin:
        connection.send_error(
            msg["id"],
            "unauthorized",
            "opaque effect content is available only to administrators",
        )
        return
    connection.send_result(msg["id"], {"item": item.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_LIBRARY_CREATE,
        vol.Required("name"): EFFECT_NAME,
        vol.Required("content"): EFFECT_CONTENT,
        vol.Required("expected_library_revision"): NON_NEGATIVE_REVISION,
    }
)
@require_admin
@async_response
async def ws_library_create(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        mutation = await _backend(hass).application.async_create_library_item(
            name=msg["name"],
            content=msg["content"],
            expected_library_revision=msg["expected_library_revision"],
        )
    except EffectValidationError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    except EffectRevisionConflictError as exc:
        connection.send_error(
            msg["id"],
            "conflict",
            f"{exc}; current_revision={exc.current_revision}",
        )
        return
    except EffectLimitError as exc:
        connection.send_error(msg["id"], "limit_reached", str(exc))
        return
    except EffectStorageError as exc:
        connection.send_error(msg["id"], "storage_unavailable", str(exc))
        return
    connection.send_result(
        msg["id"],
        {
            "item": mutation.item.to_dict(),
            "library_revision": mutation.snapshot.library_revision,
        },
    )


@websocket_command(
    {
        vol.Required("type"): WS_LIBRARY_UPDATE,
        vol.Required("item_id"): UUID_TEXT,
        vol.Required("name"): EFFECT_NAME,
        vol.Required("content"): EFFECT_CONTENT,
        vol.Required("expected_revision"): POSITIVE_REVISION,
        vol.Required("expected_library_revision"): NON_NEGATIVE_REVISION,
    }
)
@require_admin
@async_response
async def ws_library_update(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        mutation = await _backend(hass).application.async_update_library_item(
            item_id=msg["item_id"],
            name=msg["name"],
            content=msg["content"],
            expected_revision=msg["expected_revision"],
            expected_library_revision=msg["expected_library_revision"],
        )
    except EffectValidationError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    except (ValueError, EffectNotFoundError) as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    except EffectRevisionConflictError as exc:
        connection.send_error(
            msg["id"],
            "conflict",
            f"{exc}; current_revision={exc.current_revision}",
        )
        return
    except EffectLimitError as exc:
        connection.send_error(msg["id"], "limit_reached", str(exc))
        return
    except EffectStorageError as exc:
        connection.send_error(msg["id"], "storage_unavailable", str(exc))
        return
    connection.send_result(
        msg["id"],
        {
            "item": mutation.item.to_dict(),
            "library_revision": mutation.snapshot.library_revision,
        },
    )


@websocket_command(
    {
        vol.Required("type"): WS_LIBRARY_DELETE,
        vol.Required("item_id"): UUID_TEXT,
        vol.Required("expected_revision"): POSITIVE_REVISION,
        vol.Required("expected_library_revision"): NON_NEGATIVE_REVISION,
    }
)
@require_admin
@async_response
async def ws_library_delete(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        snapshot = await _backend(hass).application.async_delete_library_item(
            item_id=msg["item_id"],
            expected_revision=msg["expected_revision"],
            expected_library_revision=msg["expected_library_revision"],
        )
    except (ValueError, EffectNotFoundError) as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    except EffectRevisionConflictError as exc:
        connection.send_error(
            msg["id"],
            "conflict",
            f"{exc}; current_revision={exc.current_revision}",
        )
        return
    connection.send_result(
        msg["id"],
        {"library_revision": snapshot.library_revision},
    )


@websocket_command({vol.Required("type"): WS_DRAFT_LIST})
@require_admin
@callback
def ws_draft_list(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    drafts = _backend(hass).application.list_drafts(connection.user.id)
    connection.send_result(
        msg["id"],
        {"drafts": [draft_summary(draft) for draft in drafts]},
    )


@websocket_command(
    {
        vol.Required("type"): WS_DRAFT_GET,
        vol.Required("draft_id"): UUID_TEXT,
    }
)
@require_admin
@callback
def ws_draft_get(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        draft = _backend(hass).application.get_draft(connection.user.id, msg["draft_id"])
    except (ValueError, EffectNotFoundError) as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    connection.send_result(msg["id"], {"draft": draft.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_DRAFT_CREATE,
        vol.Required("name"): EFFECT_NAME,
        vol.Required("content"): EFFECT_CONTENT,
        vol.Required("updated_at"): TIMESTAMP,
        vol.Optional("selected_config_entry_id"): IDENTIFIER,
        vol.Optional("base_item_id"): UUID_TEXT,
        vol.Optional("base_item_revision"): POSITIVE_REVISION,
    }
)
@require_admin
@async_response
async def ws_draft_create(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        draft = await _backend(hass).application.async_create_draft(
            connection.user.id,
            name=msg["name"],
            content=msg["content"],
            updated_at=msg["updated_at"],
            selected_config_entry_id=msg.get("selected_config_entry_id"),
            base_item_id=msg.get("base_item_id"),
            base_item_revision=msg.get("base_item_revision"),
        )
    except EffectLimitError as exc:
        connection.send_error(msg["id"], "limit_reached", str(exc))
        return
    except (ValueError, EffectValidationError, EffectStorageError) as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    connection.send_result(msg["id"], {"draft": draft.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_DRAFT_UPDATE,
        vol.Required("draft_id"): UUID_TEXT,
        vol.Required("expected_revision"): POSITIVE_REVISION,
        vol.Required("name"): EFFECT_NAME,
        vol.Required("content"): EFFECT_CONTENT,
        vol.Required("updated_at"): TIMESTAMP,
        vol.Optional("selected_config_entry_id"): IDENTIFIER,
    }
)
@require_admin
@async_response
async def ws_draft_update(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        draft = await _backend(hass).application.async_update_draft(
            connection.user.id,
            draft_id=msg["draft_id"],
            expected_revision=msg["expected_revision"],
            name=msg["name"],
            content=msg["content"],
            updated_at=msg["updated_at"],
            selected_config_entry_id=msg.get("selected_config_entry_id"),
        )
    except EffectValidationError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    except (ValueError, EffectNotFoundError) as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    except EffectRevisionConflictError as exc:
        connection.send_error(
            msg["id"],
            "conflict",
            f"{exc}; current_revision={exc.current_revision}",
        )
        return
    except EffectLimitError as exc:
        connection.send_error(msg["id"], "limit_reached", str(exc))
        return
    connection.send_result(msg["id"], {"draft": draft.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_DRAFT_DELETE,
        vol.Required("draft_id"): UUID_TEXT,
        vol.Required("expected_revision"): POSITIVE_REVISION,
    }
)
@require_admin
@async_response
async def ws_draft_delete(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        await _backend(hass).application.async_delete_draft(
            connection.user.id,
            draft_id=msg["draft_id"],
            expected_revision=msg["expected_revision"],
        )
    except (ValueError, EffectNotFoundError) as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    except EffectRevisionConflictError as exc:
        connection.send_error(
            msg["id"],
            "conflict",
            f"{exc}; current_revision={exc.current_revision}",
        )
        return
    connection.send_result(msg["id"])


@websocket_command({vol.Required("type"): WS_DEPLOYMENT_SUBSCRIBE})
@require_admin
@callback
def ws_deployment_subscribe(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    repository = _backend(hass).deployments

    @callback
    def forward(snapshot: DeploymentSnapshot) -> None:
        connection.send_event(
            msg["id"],
            {
                "revision": snapshot.revision,
                "deployments": [record.to_public_dict() for record in snapshot.records],
            },
        )

    connection.subscriptions[msg["id"]] = repository.subscribe(forward)
    connection.send_result(msg["id"])
    forward(repository.snapshot())


@websocket_command({vol.Required("type"): WS_USER_STATE_GET})
@require_admin
@callback
def ws_user_state_get(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    state = _backend(hass).application.get_user_state(connection.user.id)
    connection.send_result(msg["id"], {"user_state": state.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_USER_STATE_UPDATE,
        vol.Required("preferences"): PREFERENCES,
    }
)
@require_admin
@callback
def ws_user_state_update(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        updated = _backend(hass).application.update_user_state(
            connection.user.id,
            msg["preferences"],
        )
    except EffectStorageError as exc:
        connection.send_error(
            msg["id"],
            "limit_reached" if isinstance(exc, EffectLimitError) else "invalid_format",
            str(exc),
        )
        return
    connection.send_result(msg["id"], {"user_state": updated.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_USER_STATE_RECORD_COLOUR,
        vol.Required("colour"): [vol.All(strict_int, vol.Range(min=0, max=255))],
    }
)
@require_admin
@callback
def ws_user_state_record_colour(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    try:
        updated = _backend(hass).application.record_user_colour(
            connection.user.id,
            msg["colour"],
        )
    except EffectLimitError as exc:
        connection.send_error(msg["id"], "limit_reached", str(exc))
        return
    except EffectStorageError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    connection.send_result(msg["id"], {"user_state": updated.to_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_APPLY,
        vol.Required("config_entry_id"): IDENTIFIER,
        vol.Required("item_id"): UUID_TEXT,
        vol.Optional("revision"): POSITIVE_REVISION,
        vol.Required("updated_at"): TIMESTAMP,
    }
)
@require_admin
@async_response
async def ws_apply(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    entry = hass.config_entries.async_get_entry(msg["config_entry_id"])
    if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
        connection.send_error(msg["id"], "not_found", "target config entry is not loaded")
        return
    try:
        item = backend.application.get_saved_effect(msg["item_id"], msg.get("revision"))
    except ValueError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    except EffectNotFoundError as exc:
        connection.send_error(msg["id"], "not_found", str(exc))
        return
    try:
        result = await backend.engine.async_apply_saved(
            entry.runtime_data,
            item,
            config_entry_id=entry.entry_id,
            updated_at=msg["updated_at"],
        )
    except ValueError as exc:
        connection.send_error(msg["id"], "unsupported_model", str(exc))
        return
    except EffectStorageError as exc:
        connection.send_error(msg["id"], "storage_unavailable", str(exc))
        return
    except Exception as exc:
        connection.send_error(msg["id"], "apply_failed", str(exc))
        return
    connection.send_result(msg["id"], {"deployment": result.to_public_dict()})


@websocket_command(
    {
        vol.Required("type"): WS_APPLY_SNAPSHOT,
        vol.Required("config_entry_id"): IDENTIFIER,
        vol.Required("name"): EFFECT_NAME,
        vol.Required("content"): EFFECT_CONTENT,
        vol.Required("updated_at"): TIMESTAMP,
    }
)
@require_admin
@async_response
async def ws_apply_snapshot(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    entry = hass.config_entries.async_get_entry(msg["config_entry_id"])
    if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
        connection.send_error(msg["id"], "not_found", "target config entry is not loaded")
        return
    try:
        item = backend.application.new_authored_item(
            name=msg["name"],
            content=msg["content"],
        )
        result = await backend.engine.async_apply_snapshot(
            entry.runtime_data,
            item,
            config_entry_id=entry.entry_id,
            snapshot_id=uuid4(),
            updated_at=msg["updated_at"],
        )
    except EffectValidationError as exc:
        connection.send_error(msg["id"], "invalid_format", str(exc))
        return
    except ValueError as exc:
        connection.send_error(msg["id"], "unsupported_model", str(exc))
        return
    except EffectStorageError as exc:
        connection.send_error(msg["id"], "storage_unavailable", str(exc))
        return
    except Exception as exc:
        connection.send_error(msg["id"], "apply_failed", str(exc))
        return
    connection.send_result(msg["id"], {"deployment": result.to_public_dict()})


def async_register_effect_websocket(
    hass: HomeAssistant,
    backend: EffectBackend,
) -> None:
    hass.data.setdefault(DOMAIN, {})[BACKEND_DATA_KEY] = backend
    websocket_api.async_register_command(hass, ws_editor_info)
    websocket_api.async_register_command(hass, ws_editor_devices)
    websocket_api.async_register_command(hass, ws_custom_catalogue)
    websocket_api.async_register_command(hass, ws_scene_catalogue_list)
    websocket_api.async_register_command(hass, ws_scene_catalogue_get)
    websocket_api.async_register_command(hass, ws_scene_apply)
    websocket_api.async_register_command(hass, ws_preview_open)
    websocket_api.async_register_command(hass, ws_preview_close)
    websocket_api.async_register_command(hass, ws_preview_apply_snapshot)
    websocket_api.async_register_command(hass, ws_preview_apply_scene)
    websocket_api.async_register_command(hass, ws_preview_cancel)
    websocket_api.async_register_command(hass, ws_preview_subscribe)
    websocket_api.async_register_command(hass, ws_library_list)
    websocket_api.async_register_command(hass, ws_library_get)
    websocket_api.async_register_command(hass, ws_library_create)
    websocket_api.async_register_command(hass, ws_library_update)
    websocket_api.async_register_command(hass, ws_library_delete)
    websocket_api.async_register_command(hass, ws_library_subscribe)
    websocket_api.async_register_command(hass, ws_draft_list)
    websocket_api.async_register_command(hass, ws_draft_get)
    websocket_api.async_register_command(hass, ws_draft_create)
    websocket_api.async_register_command(hass, ws_draft_update)
    websocket_api.async_register_command(hass, ws_draft_delete)
    websocket_api.async_register_command(hass, ws_deployment_subscribe)
    websocket_api.async_register_command(hass, ws_user_state_get)
    websocket_api.async_register_command(hass, ws_user_state_update)
    websocket_api.async_register_command(hass, ws_user_state_record_colour)
    websocket_api.async_register_command(hass, ws_apply)
    websocket_api.async_register_command(hass, ws_apply_snapshot)


def _backend(hass: HomeAssistant) -> EffectBackend:
    return cast(EffectBackend, hass.data[DOMAIN][BACKEND_DATA_KEY])


def _send_preview_error(
    connection: ActiveConnection,
    message_id: int,
    error: Exception,
) -> None:
    if isinstance(error, PreviewOwnershipError):
        code = "unauthorized"
    elif isinstance(error, PreviewSessionNotFoundError):
        code = "not_found"
    elif isinstance(error, PreviewSequenceError):
        code = "invalid_sequence"
    elif isinstance(error, PreviewRateLimitError):
        code = "rate_limited"
    elif isinstance(error, PreviewShutdownError):
        code = "shutdown"
    elif isinstance(error, EffectValidationError):
        code = "invalid_format"
    elif isinstance(error, PreviewError):
        code = "not_found" if "not loaded" in str(error) or "unloading" in str(error) else "invalid_format"
    else:
        code = "preview_failed"
    connection.send_error(message_id, code, str(error))


async def _async_close_preview_session(
    backend: EffectBackend,
    session_id: str,
    connection: ActiveConnection,
) -> None:
    try:
        await backend.preview.async_close_session(session_id, connection)
    except PreviewSessionNotFoundError:
        return
