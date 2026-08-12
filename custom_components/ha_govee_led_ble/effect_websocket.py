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
    BuiltinScene,
    EffectValidationError,
    LayeredScene,
    LibraryItem,
    OpaqueContent,
    PaletteScene,
    effect_content_to_dict,
)
from .effect_drafts import EffectDraft
from .effect_limits import (
    MAX_EDITOR_DEVICES,
    MAX_EFFECT_DOCUMENT_BYTES,
    MAX_EFFECT_NAME_LENGTH,
    MAX_IDENTIFIER_LENGTH,
    MAX_PREFERENCES_BYTES,
    MAX_REVISION,
    MAX_SCENE_CATALOGUE_ENTRIES,
    MAX_TIMESTAMP_LENGTH,
    validate_json_document,
    validate_timestamp,
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

WS_INFO = f"{DOMAIN}/editor/info"
WS_DEVICES = f"{DOMAIN}/editor/devices"
WS_CUSTOM_CATALOGUE = f"{DOMAIN}/editor/custom/catalogue"
WS_LIBRARY_LIST = f"{DOMAIN}/editor/library/list"
WS_LIBRARY_GET = f"{DOMAIN}/editor/library/get"
WS_LIBRARY_CREATE = f"{DOMAIN}/editor/library/create"
WS_LIBRARY_UPDATE = f"{DOMAIN}/editor/library/update"
WS_LIBRARY_DELETE = f"{DOMAIN}/editor/library/delete"
WS_LIBRARY_SUBSCRIBE = f"{DOMAIN}/editor/library/subscribe"
WS_DRAFT_LIST = f"{DOMAIN}/editor/draft/list"
WS_DRAFT_GET = f"{DOMAIN}/editor/draft/get"
WS_DRAFT_CREATE = f"{DOMAIN}/editor/draft/create"
WS_DRAFT_UPDATE = f"{DOMAIN}/editor/draft/update"
WS_DRAFT_DELETE = f"{DOMAIN}/editor/draft/delete"
WS_DEPLOYMENT_SUBSCRIBE = f"{DOMAIN}/editor/deployment/subscribe"
WS_USER_STATE_GET = f"{DOMAIN}/editor/user_state/get"
WS_USER_STATE_UPDATE = f"{DOMAIN}/editor/user_state/update"
WS_USER_STATE_RECORD_COLOUR = f"{DOMAIN}/editor/user_state/record_colour"
WS_APPLY = f"{DOMAIN}/editor/apply"
WS_APPLY_SNAPSHOT = f"{DOMAIN}/editor/apply_snapshot"
WS_SCENE_CATALOGUE_LIST = f"{DOMAIN}/editor/scene/catalogue/list"
WS_SCENE_CATALOGUE_GET = f"{DOMAIN}/editor/scene/catalogue/get"
WS_SCENE_APPLY = f"{DOMAIN}/editor/scene/apply"
BACKEND_DATA_KEY = "effect_backend"


def _strict_int(value: object) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise vol.Invalid("value must be an integer")
    return value


def _bounded_effect_content(value: dict[str, Any]) -> dict[str, Any]:
    try:
        validate_json_document(
            value,
            "effect content",
            maximum_bytes=MAX_EFFECT_DOCUMENT_BYTES,
            error_type=ValueError,
        )
    except ValueError as exc:
        raise vol.Invalid(str(exc)) from exc
    return value


def _bounded_preferences(value: dict[str, Any]) -> dict[str, Any]:
    try:
        validate_json_document(
            value,
            "preferences",
            maximum_bytes=MAX_PREFERENCES_BYTES,
            error_type=ValueError,
        )
    except ValueError as exc:
        raise vol.Invalid(str(exc)) from exc
    return value


def _timestamp(value: str) -> str:
    try:
        validate_timestamp(
            value,
            "timestamp",
            error_type=ValueError,
        )
    except ValueError as exc:
        raise vol.Invalid(str(exc)) from exc
    return value


EFFECT_NAME = vol.All(str, vol.Length(max=MAX_EFFECT_NAME_LENGTH))
IDENTIFIER = vol.All(str, vol.Length(min=1, max=MAX_IDENTIFIER_LENGTH))
UUID_TEXT = vol.All(str, vol.Length(min=36, max=36))
TIMESTAMP = vol.All(str, vol.Length(min=1, max=MAX_TIMESTAMP_LENGTH), _timestamp)
NON_NEGATIVE_REVISION = vol.All(_strict_int, vol.Range(min=0, max=MAX_REVISION))
POSITIVE_REVISION = vol.All(_strict_int, vol.Range(min=1, max=MAX_REVISION))
SCENE_ID = vol.All(_strict_int, vol.Range(min=0, max=0xFFFF))
SPEED_INDEX = vol.All(_strict_int, vol.Range(min=0, max=0xFF))
EFFECT_CONTENT = vol.All(dict, _bounded_effect_content)
PREFERENCES = vol.All(dict, _bounded_preferences)


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


@websocket_command({vol.Required("type"): WS_LIBRARY_LIST})
@callback
def ws_library_list(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    backend = _backend(hass)
    snapshot = backend.application.library_snapshot()
    connection.send_result(msg["id"], _library_snapshot_payload(snapshot))


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
        connection.send_event(msg["id"], _library_snapshot_payload(snapshot))

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
        {"drafts": [_draft_summary(draft) for draft in drafts]},
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
        vol.Required("colour"): [vol.All(_strict_int, vol.Range(min=0, max=255))],
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


def _item_summary(item: LibraryItem) -> dict[str, Any]:
    content = effect_content_to_dict(item.content)
    summary = {
        "id": str(item.id),
        "revision": item.revision,
        "name": item.name,
        "kind": content["kind"],
    }
    if isinstance(item.content, BuiltinScene | PaletteScene | LayeredScene):
        summary["template"] = content["template"]
    return summary


def _library_snapshot_payload(snapshot: LibrarySnapshot) -> dict[str, Any]:
    return {
        "library_revision": snapshot.library_revision,
        "items": [_item_summary(item) for item in snapshot.items],
    }


def _draft_summary(draft: EffectDraft) -> dict[str, Any]:
    return {
        "id": str(draft.id),
        "revision": draft.revision,
        "name": draft.item.name,
        "updated_at": draft.updated_at,
        "selected_config_entry_id": draft.selected_config_entry_id,
    }
