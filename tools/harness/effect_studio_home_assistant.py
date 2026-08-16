#!/usr/bin/env python3
"""Validate Effect Studio against the configured household Home Assistant instance."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import ssl
import sys
from collections.abc import Callable, Mapping, Sequence
from contextlib import suppress
from copy import deepcopy
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Protocol, cast
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from uuid import uuid4

type JsonObject = dict[str, Any]
type JsonValue = str | int | float | bool | None | list["JsonValue"] | dict[str, "JsonValue"]

DOMAIN = "ha_govee_led_ble"
PANEL_PATH = "ha-govee-led-ble"
PANEL_MODULE_URL = f"/{DOMAIN}_static/editor-loader.js"
EXPECTED_MODEL = "H617A"
STATE_SCHEMA_VERSION = 1
MAX_ROUTE_SUMMARIES = 32
STATE_PATH = Path(__file__).parents[2] / ".harness" / "effect-studio-home-assistant.json"
RESTART_UNAVAILABLE_TIMEOUT = 60
RESTART_SETUP_TIMEOUT = 180
EDITOR_CLEANUP_TIMEOUT = 30

WS_INFO = f"{DOMAIN}/editor/info"
WS_DEVICES = f"{DOMAIN}/editor/devices"
WS_CUSTOM_CATALOGUE = f"{DOMAIN}/editor/custom/catalogue"
WS_LIBRARY_LIST = f"{DOMAIN}/editor/library/list"
WS_LIBRARY_GET = f"{DOMAIN}/editor/library/get"
WS_LIBRARY_CREATE = f"{DOMAIN}/editor/library/create"
WS_LIBRARY_UPDATE = f"{DOMAIN}/editor/library/update"
WS_LIBRARY_DELETE = f"{DOMAIN}/editor/library/delete"
WS_LIBRARY_SUBSCRIBE = f"{DOMAIN}/editor/library/subscribe"
WS_DEPLOYMENT_SUBSCRIBE = f"{DOMAIN}/editor/deployment/subscribe"
WS_APPLY_SNAPSHOT = f"{DOMAIN}/editor/apply_snapshot"
WS_SCENE_CATALOGUE_LIST = f"{DOMAIN}/editor/scene/catalogue/list"
WS_SCENE_CATALOGUE_GET = f"{DOMAIN}/editor/scene/catalogue/get"
WS_SCENE_APPLY = f"{DOMAIN}/editor/scene/apply"

TERMINAL_DEPLOYMENTS: dict[str, tuple[str, str]] = {
    "h617a_painted": ("confirmed", "activation_match"),
    "h617a_single": ("confirmed", "activation_match"),
    "h617a_multi": ("confirmed", "activation_match"),
    "scene_palette": ("confirmed", "activation_match"),
    "scene_layered": ("confirmed", "activation_match"),
    "advanced": ("confirmed", "activation_match"),
    "music_profile": ("confirmed", "mode_match"),
    "workshop": ("applied", "write_completed"),
}


class ValidationError(RuntimeError):
    """The live Home Assistant contract did not match the validation requirements."""


class HomeAssistantApiError(ValidationError):
    """Home Assistant returned an unsuccessful WebSocket result."""

    def __init__(self, code: str, message: str = "") -> None:
        self.code = code
        super().__init__(
            f"Home Assistant request failed with {code}: {message}"
            if message
            else f"Home Assistant request failed with {code}"
        )


class ClientProtocol(Protocol):
    async def call(self, payload: JsonObject) -> Any: ...

    async def call_raw(self, payload: JsonObject) -> JsonObject: ...

    async def subscribe(
        self,
        payload: JsonObject,
        *,
        initial_event: bool = True,
    ) -> tuple[int, JsonObject]: ...

    async def wait_event(
        self,
        subscription_id: int,
        predicate: Callable[[JsonObject], bool] | None = None,
        *,
        timeout: float = 30,
    ) -> JsonObject: ...

    async def close(self) -> None: ...


class HomeAssistantWebSocket:
    """Correlate requests while retaining subscription events on one connection."""

    def __init__(self, websocket: Any) -> None:
        self.websocket = websocket
        self.next_id = 1
        self.events: dict[int, list[JsonObject]] = {}

    @classmethod
    async def connect(cls, base_url: str, token: str) -> HomeAssistantWebSocket:
        import websockets  # type: ignore[import-not-found]

        websocket_url = _websocket_url(base_url)
        ssl_context = ssl.create_default_context() if websocket_url.startswith("wss://") else None
        websocket = await websockets.connect(websocket_url, ssl=ssl_context, max_size=None, open_timeout=15)
        client = cls(websocket)
        await client.authenticate(token)
        return client

    async def authenticate(self, token: str) -> None:
        if (await self._receive()).get("type") != "auth_required":
            raise ValidationError("Home Assistant did not request WebSocket authentication")
        await self.websocket.send(json.dumps({"type": "auth", "access_token": token}))
        if (await self._receive()).get("type") != "auth_ok":
            raise ValidationError("Home Assistant rejected WebSocket authentication")

    async def call_raw(self, payload: JsonObject) -> JsonObject:
        message_id = await self._send(payload)
        return await self._wait_result(message_id)

    async def call(self, payload: JsonObject) -> Any:
        response = await self.call_raw(payload)
        if not response.get("success"):
            error = response.get("error")
            error_object = error if isinstance(error, dict) else {}
            raise HomeAssistantApiError(
                str(error_object.get("code", "unknown_error")), str(error_object.get("message", ""))
            )
        return response.get("result")

    async def subscribe(
        self,
        payload: JsonObject,
        *,
        initial_event: bool = True,
    ) -> tuple[int, JsonObject]:
        subscription_id = await self._send(payload)
        response = await self._wait_result(subscription_id)
        if not response.get("success"):
            error = response.get("error")
            error_object = error if isinstance(error, dict) else {}
            raise HomeAssistantApiError(
                str(error_object.get("code", "unknown_error")), str(error_object.get("message", ""))
            )
        return subscription_id, await self.wait_event(subscription_id) if initial_event else {}

    async def wait_event(
        self,
        subscription_id: int,
        predicate: Callable[[JsonObject], bool] | None = None,
        *,
        timeout: float = 30,
    ) -> JsonObject:
        matches = predicate or (lambda _: True)
        deadline = asyncio.get_running_loop().time() + timeout
        while True:
            queued = self.events.setdefault(subscription_id, [])
            for index, event in enumerate(queued):
                if matches(event):
                    return queued.pop(index)
            remaining = deadline - asyncio.get_running_loop().time()
            if remaining <= 0:
                raise ValidationError("Home Assistant subscription event timed out")
            try:
                message = await asyncio.wait_for(self._receive(), remaining)
            except TimeoutError as exc:
                raise ValidationError("Home Assistant subscription event timed out") from exc
            if message.get("type") == "event" and isinstance(message.get("id"), int):
                self.events.setdefault(cast(int, message["id"]), []).append(message)

    async def close(self) -> None:
        await self.websocket.close()

    async def _send(self, payload: JsonObject) -> int:
        message_id = self.next_id
        self.next_id += 1
        await self.websocket.send(json.dumps({**payload, "id": message_id}))
        return message_id

    async def _wait_result(self, message_id: int) -> JsonObject:
        while True:
            message = await self._receive()
            if message.get("type") == "event" and isinstance(message.get("id"), int):
                self.events.setdefault(cast(int, message["id"]), []).append(message)
                continue
            if message.get("type") == "result" and message.get("id") == message_id:
                return message

    async def _receive(self) -> JsonObject:
        value = json.loads(await self.websocket.recv())
        if not isinstance(value, dict):
            raise ValidationError("Home Assistant returned a non-object WebSocket message")
        return value


class HomeAssistantRest:
    """Use the configured Home Assistant REST API without exposing credentials."""

    def __init__(self, base_url: str, token: str) -> None:
        self.base_url = base_url.rstrip("/") + "/"
        self.token = token

    async def get_json(self, path: str, *, timeout: float = 15) -> Any:
        return await asyncio.to_thread(self._request_json, path, "GET", None, timeout)

    async def ready(self) -> bool:
        try:
            response = await self.get_json("api/", timeout=5)
        except ValidationError:
            return False
        return isinstance(response, dict) and response.get("message") == "API running."

    async def diagnostics(self, config_entry_id: str) -> JsonObject:
        value = await self.get_json(f"api/diagnostics/config_entry/{quote(config_entry_id, safe='')}", timeout=45)
        if not isinstance(value, dict):
            raise ValidationError("Home Assistant diagnostics response was not an object")
        nested = value.get("data")
        return cast(JsonObject, nested) if isinstance(nested, dict) else value

    def _request_json(self, path: str, method: str, body: bytes | None, timeout: float) -> Any:
        request = Request(  # noqa: S310 - the URL is derived from the configured Home Assistant endpoint.
            urljoin(self.base_url, path),
            data=body,
            method=method,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )
        context = ssl.create_default_context() if request.full_url.startswith("https://") else None
        try:
            with urlopen(request, context=context, timeout=timeout) as response:  # noqa: S310
                return json.load(response)
        except HTTPError as exc:
            raise ValidationError(f"Home Assistant REST request returned HTTP {exc.code}") from exc
        except (URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            raise ValidationError("Home Assistant REST request failed") from exc


@dataclass(frozen=True, slots=True)
class DeviceSelection:
    config_entry_id: str
    model: str
    display_name: str
    light_entity_id: str
    entity_ids: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class RouteSummary:
    route: str
    phase: str
    confidence: str
    content_kind: str

    def to_dict(self) -> JsonObject:
        return {
            "route": self.route,
            "phase": self.phase,
            "confidence": self.confidence,
            "content_kind": self.content_kind,
        }


@dataclass(slots=True)
class RunState:
    item_id: str
    item_revision: int
    original_states: list[JsonObject]

    def to_dict(self) -> JsonObject:
        return {
            "schema_version": STATE_SCHEMA_VERSION,
            "item_id": self.item_id,
            "item_revision": self.item_revision,
            "original_states": self.original_states,
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> RunState:
        if raw.get("schema_version") != STATE_SCHEMA_VERSION:
            raise ValidationError("Effect Studio staged state has an unsupported schema")
        item_id = raw.get("item_id")
        item_revision = raw.get("item_revision")
        original_states = raw.get("original_states")
        if not isinstance(item_id, str) or not isinstance(item_revision, int) or not isinstance(original_states, list):
            raise ValidationError("Effect Studio staged state is malformed")
        if any(not isinstance(state, dict) for state in original_states):
            raise ValidationError("Effect Studio staged control state is malformed")
        return cls(item_id, item_revision, cast(list[JsonObject], original_states))


class EffectStudioValidator:
    """Validate the live editor API and restore every touched controllable entity."""

    def __init__(
        self,
        client: ClientProtocol,
        rest: HomeAssistantRest,
        *,
        identity_entry_id: str,
        identity_model: str,
    ) -> None:
        self.client = client
        self.rest = rest
        self.identity_entry_id = identity_entry_id
        self.identity_model = identity_model
        self.selection: DeviceSelection | None = None
        self.library_subscription_id: int | None = None
        self.deployment_subscription_id: int | None = None
        self.library_revision = 0
        self.catalogue: JsonObject = {}
        self.scene_catalogue: JsonObject = {}
        self.temporary_item_id: str | None = None
        self.temporary_item_revision: int = 1

    async def verify_surfaces(self) -> DeviceSelection:
        panels = _object(await self.client.call({"type": "get_panels"}), "panel response")
        panel = _object(panels.get(PANEL_PATH), "Effect Studio panel")
        panel_config = _object(panel.get("config"), "Effect Studio panel config")
        panel_custom = _object(panel_config.get("_panel_custom"), "Effect Studio custom panel config")
        if panel_custom.get("module_url") != PANEL_MODULE_URL:
            raise ValidationError("Effect Studio panel does not use the stable loader module")

        info = _object(await self.client.call({"type": WS_INFO}), "editor info")
        if info.get("api_version") != 3 or info.get("effect_schema_version") != 1:
            raise ValidationError("Effect Studio editor API versions are not supported")
        limits = _object(info.get("limits"), "editor limits")
        if not isinstance(limits.get("deployment_records"), int) or not isinstance(limits.get("library_items"), int):
            raise ValidationError("Effect Studio editor limits are incomplete")

        devices_payload = _object(await self.client.call({"type": WS_DEVICES}), "editor devices")
        devices = _object_list(devices_payload.get("devices"), "editor devices")
        device = _select_device(devices, self.identity_entry_id, self.identity_model)

        registry = _object_list(
            await self.client.call({"type": "config/entity_registry/list"}),
            "entity registry",
        )
        entry_entities = [
            entry
            for entry in registry
            if entry.get("config_entry_id") == self.identity_entry_id and entry.get("disabled_by") is None
        ]
        light_entities = [
            str(entry["entity_id"])
            for entry in entry_entities
            if isinstance(entry.get("entity_id"), str) and str(entry["entity_id"]).startswith("light.")
        ]
        if len(light_entities) != 1:
            raise ValidationError("cupboard config entry does not have exactly one enabled light entity")
        self.selection = DeviceSelection(
            config_entry_id=self.identity_entry_id,
            model=device["model"],
            display_name=str(device.get("display_name", "cupboard")),
            light_entity_id=light_entities[0],
            entity_ids=tuple(
                str(entry["entity_id"]) for entry in entry_entities if isinstance(entry.get("entity_id"), str)
            ),
        )

        services = _object(await self.client.call({"type": "get_services"}), "service registry")
        domain_services = _object(services.get(DOMAIN), "Effect Studio services")
        required_services = {"apply_custom_effect", "apply_effect_snapshot"}
        if not required_services.issubset(domain_services):
            raise ValidationError("Effect Studio services are incomplete")

        catalogue_payload = _object(await self.client.call({"type": WS_CUSTOM_CATALOGUE}), "custom catalogue")
        self.catalogue = _object(catalogue_payload.get("catalogue"), "custom catalogue")
        if self.catalogue.get("schema_version") != 5:
            raise ValidationError("Effect Studio custom catalogue schema is not supported")
        models = _object(self.catalogue.get("models"), "model catalogues")
        model_catalogue = _object(models.get(EXPECTED_MODEL), "H617A catalogue")
        _validate_h617a_catalogue(model_catalogue)

        scene_payload = _object(
            await self.client.call(
                {
                    "type": WS_SCENE_CATALOGUE_LIST,
                    "config_entry_id": self.identity_entry_id,
                }
            ),
            "scene catalogue response",
        )
        self.scene_catalogue = _object(scene_payload.get("catalogue"), "scene catalogue")
        if self.scene_catalogue.get("sku") != EXPECTED_MODEL or self.scene_catalogue.get("enabled") is not True:
            raise ValidationError("cupboard native scene catalogue is unavailable or routed to the wrong model")
        _require_scene_kinds(_object_list(self.scene_catalogue.get("scenes"), "scene catalogue entries"))
        return self.selection

    async def subscribe(self) -> None:
        self.library_subscription_id, library_event = await self.client.subscribe({"type": WS_LIBRARY_SUBSCRIBE})
        library_payload = _object(library_event.get("event"), "initial library subscription event")
        self.library_revision = _required_int(library_payload, "library_revision")
        self.deployment_subscription_id, deployment_event = await self.client.subscribe(
            {"type": WS_DEPLOYMENT_SUBSCRIBE}
        )
        deployment_payload = _object(deployment_event.get("event"), "initial deployment subscription event")
        _required_int(deployment_payload, "revision")
        _object_list(deployment_payload.get("deployments"), "initial deployments")

    async def capture_controllable_state(self) -> list[JsonObject]:
        selection = self._selection()
        states = _object_list(await self.client.call({"type": "get_states"}), "state response")
        captured = [
            deepcopy(state)
            for state in states
            if state.get("entity_id") in selection.entity_ids
            and str(state.get("entity_id", "")).partition(".")[0] in {"light", "number", "select", "switch"}
        ]
        light_state = next((state for state in captured if state.get("entity_id") == selection.light_entity_id), None)
        if light_state is None or light_state.get("state") not in {"on", "off"}:
            raise ValidationError("cupboard light does not have a controllable on/off state")
        return captured

    async def create_and_update_temporary_effect(self) -> RunState:
        model_catalogue = self._model_catalogue()
        content = _single_content(model_catalogue, speed=40)
        created = _object(
            await self.client.call(
                {
                    "type": WS_LIBRARY_CREATE,
                    "name": "Effect Studio HA validation",
                    "content": content,
                    "expected_library_revision": self.library_revision,
                }
            ),
            "library create response",
        )
        created_item = _object(created.get("item"), "created library item")
        item_id = _required_str(created_item, "id")
        created_revision = _required_int(created_item, "revision")
        self.temporary_item_id = item_id
        self.temporary_item_revision = created_revision
        created_library_revision = _required_int(created, "library_revision")
        await self._expect_library_event(created_library_revision, item_id, created_revision)

        updated_content = _single_content(model_catalogue, speed=60)
        updated = _object(
            await self.client.call(
                {
                    "type": WS_LIBRARY_UPDATE,
                    "item_id": item_id,
                    "name": "Effect Studio HA validation",
                    "content": updated_content,
                    "expected_revision": created_revision,
                    "expected_library_revision": created_library_revision,
                }
            ),
            "library update response",
        )
        updated_item = _object(updated.get("item"), "updated library item")
        item_revision = _required_int(updated_item, "revision")
        self.temporary_item_revision = item_revision
        library_revision = _required_int(updated, "library_revision")
        await self._expect_library_event(library_revision, item_id, item_revision)
        self.library_revision = library_revision

        conflict = await self.client.call_raw(
            {
                "type": WS_LIBRARY_UPDATE,
                "item_id": item_id,
                "name": "Stale Effect Studio HA validation",
                "content": updated_content,
                "expected_revision": created_revision,
                "expected_library_revision": library_revision,
            }
        )
        error = conflict.get("error")
        if conflict.get("success") is not False or not isinstance(error, dict) or error.get("code") != "conflict":
            raise ValidationError("Effect Studio library did not reject a stale item revision")
        return RunState(item_id, item_revision, [])

    async def verify_persisted_item(self, state: RunState) -> None:
        listing = _object(await self.client.call({"type": WS_LIBRARY_LIST}), "library list")
        self.library_revision = _required_int(listing, "library_revision")
        items = _object_list(listing.get("items"), "library items")
        summary = next((item for item in items if item.get("id") == state.item_id), None)
        if summary is None or summary.get("revision") != state.item_revision:
            raise ValidationError("temporary Effect Studio item did not survive the Home Assistant restart")
        item_payload = _object(
            await self.client.call({"type": WS_LIBRARY_GET, "item_id": state.item_id}),
            "library get response",
        )
        item = _object(item_payload.get("item"), "persisted library item")
        if (
            item.get("revision") != state.item_revision
            or _object(item.get("content"), "persisted content").get("kind") != "h617a_single"
        ):
            raise ValidationError("temporary Effect Studio item changed across the Home Assistant restart")

    async def run_routes(self, state: RunState) -> tuple[list[RouteSummary], list[str]]:
        selection = self._selection()
        if self.deployment_subscription_id is None:
            raise ValidationError("deployment subscription is not active")
        routes: list[RouteSummary] = []
        operation_ids: list[str] = []
        scenes = _object_list(self.scene_catalogue.get("scenes"), "scene catalogue entries")
        native = next((scene for scene in scenes if scene.get("parameter_kind") == "none"), scenes[0])
        native_result = _object(
            await self.client.call(
                {
                    "type": WS_SCENE_APPLY,
                    "config_entry_id": selection.config_entry_id,
                    "scene_id": _required_int(native, "scene_id"),
                    "effect_id": _required_int(native, "effect_id"),
                }
            ),
            "native scene apply response",
        )
        if native_result.get("readback") != "scene_identity_only":
            raise ValidationError("native scene route reported an unexpected readback contract")
        await self._wait_light_effect(str(native.get("display_name", "")))
        routes.append(RouteSummary("native_scene", "confirmed", "scene_identity_only", "scene_builtin"))

        palette_scene = next(scene for scene in scenes if scene.get("parameter_kind") == "palette")
        palette_detail = await self._scene_detail(palette_scene)
        palette_content = _edited_palette_content(_object(palette_detail.get("content"), "palette scene content"))
        deployment = await self._apply_snapshot("edited_palette_scene", palette_content)
        routes.append(_deployment_summary("edited_palette_scene", deployment))
        operation_ids.append(_required_str(deployment, "operation_id"))

        layered_scene = next(scene for scene in scenes if scene.get("parameter_kind") == "layers")
        layered_detail = await self._scene_detail(layered_scene)
        layered_content = deepcopy(_object(layered_detail.get("content"), "layered scene content"))
        deployment = await self._apply_snapshot("layered_scene_copy", layered_content)
        routes.append(_deployment_summary("layered_scene_copy", deployment))
        operation_ids.append(_required_str(deployment, "operation_id"))

        correlation_id = str(uuid4())
        await self.client.call(
            {
                "type": "call_service",
                "domain": DOMAIN,
                "service": "apply_custom_effect",
                "service_data": {
                    "entity_id": selection.light_entity_id,
                    "effect_id": state.item_id,
                    "revision": state.item_revision,
                    "correlation_id": correlation_id,
                },
            }
        )
        deployment = await self._wait_deployment(correlation_id)
        routes.append(_deployment_summary("single", deployment))
        operation_ids.append(correlation_id)

        model_catalogue = self._model_catalogue()
        painted_content = _painted_content(model_catalogue)
        correlation_id = str(uuid4())
        await self.client.call(
            {
                "type": "call_service",
                "domain": DOMAIN,
                "service": "apply_effect_snapshot",
                "service_data": {
                    "entity_id": selection.light_entity_id,
                    "name": "Effect Studio HA validation Painted",
                    "content": painted_content,
                    "correlation_id": correlation_id,
                },
            }
        )
        deployment = await self._wait_deployment(correlation_id)
        routes.append(_deployment_summary("painted", deployment))
        operation_ids.append(correlation_id)

        for route, content in (
            ("multi", _multi_content(model_catalogue)),
            ("native_music", _music_content(model_catalogue)),
            ("advanced", _advanced_content(layered_content)),
        ):
            deployment = await self._apply_snapshot(route, content)
            routes.append(_deployment_summary(route, deployment))
            operation_ids.append(_required_str(deployment, "operation_id"))

        workshop_templates = _object_list(model_catalogue.get("workshop_templates"), "H617A Workshop templates")
        for template in workshop_templates:
            template_id = _required_str(template, "id")
            content = deepcopy(_object(template.get("content"), "Workshop template content"))
            deployment = await self._apply_snapshot(f"workshop:{template_id}", content)
            routes.append(_deployment_summary(f"workshop:{template_id}", deployment))
            operation_ids.append(_required_str(deployment, "operation_id"))

        if len(routes) > MAX_ROUTE_SUMMARIES:
            raise ValidationError("Effect Studio route summary exceeded its configured bound")
        return routes, operation_ids

    async def verify_diagnostics(self, operation_ids: Sequence[str]) -> int:
        diagnostics = await self.rest.diagnostics(self._selection().config_entry_id)
        coordinator = _object(diagnostics.get("coordinator"), "coordinator diagnostics")
        if coordinator.get("model") != EXPECTED_MODEL:
            raise ValidationError("diagnostics report the wrong physical model")
        packet_log = _object_list(coordinator.get("packet_log"), "diagnostic packet log")
        if not packet_log:
            raise ValidationError("diagnostics contain no bounded packet evidence")
        deployment_diagnostics = _object(
            diagnostics.get("effect_deployment_diagnostics"),
            "effect deployment diagnostics",
        )
        events = _object_list(deployment_diagnostics.get("events"), "effect deployment diagnostic events")
        if not events:
            raise ValidationError("Effect Studio deployment diagnostics are missing")
        known_operations = set(operation_ids)
        if known_operations and not any(event.get("operation_id") in known_operations for event in events):
            raise ValidationError("Effect Studio diagnostics do not include a validation deployment")
        return len(events)

    async def cleanup_item(self, item_id: str) -> None:
        deadline = asyncio.get_running_loop().time() + EDITOR_CLEANUP_TIMEOUT
        while True:
            try:
                listing = _object(await self.client.call({"type": WS_LIBRARY_LIST}), "library cleanup list")
            except HomeAssistantApiError as exc:
                if exc.code != "unknown_command" or asyncio.get_running_loop().time() >= deadline:
                    raise
                await asyncio.sleep(1)
                continue
            library_revision = _required_int(listing, "library_revision")
            items = _object_list(listing.get("items"), "library cleanup items")
            summary = next((item for item in items if item.get("id") == item_id), None)
            if summary is None:
                self.library_revision = library_revision
                return
            item_revision = _required_int(summary, "revision")
            try:
                result = _object(
                    await self.client.call(
                        {
                            "type": WS_LIBRARY_DELETE,
                            "item_id": item_id,
                            "expected_revision": item_revision,
                            "expected_library_revision": library_revision,
                        }
                    ),
                    "library delete response",
                )
            except HomeAssistantApiError as exc:
                if exc.code in {"conflict", "unknown_command"} and asyncio.get_running_loop().time() < deadline:
                    await asyncio.sleep(1)
                    continue
                raise
            deleted_revision = _required_int(result, "library_revision")
            if self.library_subscription_id is not None:
                await self._expect_library_event(deleted_revision, item_id, None)
            self.library_revision = deleted_revision
            return

    async def restore_states(self, original_states: Sequence[JsonObject]) -> None:
        ordered = sorted(original_states, key=lambda state: str(state.get("entity_id", "")).startswith("light."))
        for state in ordered:
            entity_id = state.get("entity_id")
            state_value = state.get("state")
            if not isinstance(entity_id, str) or not isinstance(state_value, str):
                raise ValidationError("captured controllable state is malformed")
            domain = entity_id.partition(".")[0]
            if state_value in {"unknown", "unavailable"}:
                continue
            if domain == "number":
                try:
                    value = float(state_value)
                except ValueError as exc:
                    raise ValidationError("captured number state is not numeric") from exc
                await self._call_entity_service("number", "set_value", entity_id, {"value": value})
            elif domain == "select":
                await self._call_entity_service("select", "select_option", entity_id, {"option": state_value})
            elif domain == "switch":
                await self._call_entity_service("switch", "turn_on" if state_value == "on" else "turn_off", entity_id)
            elif domain == "light":
                if state_value == "off":
                    restore_data = _light_restore_data(state)
                    if restore_data:
                        await self._call_entity_service("light", "turn_on", entity_id, restore_data)
                    await self._call_entity_service("light", "turn_off", entity_id)
                elif state_value == "on":
                    await self._call_entity_service("light", "turn_on", entity_id, _light_restore_data(state))
        await self._verify_restored(original_states)

    async def _apply_snapshot(self, route: str, content: JsonObject) -> JsonObject:
        result = _object(
            await self.client.call(
                {
                    "type": WS_APPLY_SNAPSHOT,
                    "config_entry_id": self._selection().config_entry_id,
                    "name": f"Effect Studio HA validation {route}"[:96],
                    "content": content,
                    "updated_at": _timestamp(),
                }
            ),
            f"{route} apply response",
        )
        deployment = _object(result.get("deployment"), f"{route} deployment")
        operation_id = _required_str(deployment, "operation_id")
        await self._wait_deployment(operation_id)
        _validate_deployment(deployment, self._selection().config_entry_id)
        return deployment

    async def _wait_deployment(self, operation_id: str) -> JsonObject:
        if self.deployment_subscription_id is None:
            raise ValidationError("deployment subscription is not active")

        def matches(message: JsonObject) -> bool:
            event = message.get("event")
            if not isinstance(event, dict):
                return False
            deployments = event.get("deployments")
            return isinstance(deployments, list) and any(
                isinstance(deployment, dict)
                and deployment.get("operation_id") == operation_id
                and deployment.get("phase") in {"confirmed", "applied", "uncertain", "failed", "interrupted", "unknown"}
                for deployment in deployments
            )

        event = await self.client.wait_event(self.deployment_subscription_id, matches, timeout=90)
        payload = _object(event.get("event"), "deployment subscription event")
        deployments = _object_list(payload.get("deployments"), "deployment subscription records")
        deployment = next(deployment for deployment in deployments if deployment.get("operation_id") == operation_id)
        _validate_deployment(deployment, self._selection().config_entry_id)
        return deployment

    async def _scene_detail(self, scene: Mapping[str, Any]) -> JsonObject:
        return _object(
            await self.client.call(
                {
                    "type": WS_SCENE_CATALOGUE_GET,
                    "config_entry_id": self._selection().config_entry_id,
                    "scene_id": _required_int(scene, "scene_id"),
                    "effect_id": _required_int(scene, "effect_id"),
                }
            ),
            "scene detail",
        )

    async def _expect_library_event(self, revision: int, item_id: str, item_revision: int | None) -> None:
        if self.library_subscription_id is None:
            raise ValidationError("library subscription is not active")

        def matches(message: JsonObject) -> bool:
            event = message.get("event")
            if not isinstance(event, dict) or event.get("library_revision") != revision:
                return False
            items = event.get("items")
            if not isinstance(items, list):
                return False
            matching = next((item for item in items if isinstance(item, dict) and item.get("id") == item_id), None)
            return (
                matching is None
                if item_revision is None
                else matching is not None and matching.get("revision") == item_revision
            )

        await self.client.wait_event(self.library_subscription_id, matches)

    async def _wait_light_effect(self, expected: str) -> None:
        deadline = asyncio.get_running_loop().time() + 30
        while True:
            states = _object_list(await self.client.call({"type": "get_states"}), "state response")
            state = next((item for item in states if item.get("entity_id") == self._selection().light_entity_id), None)
            attributes = state.get("attributes") if isinstance(state, dict) else None
            if isinstance(attributes, dict) and attributes.get("effect") == expected:
                return
            if asyncio.get_running_loop().time() >= deadline:
                raise ValidationError("native scene state was not confirmed through Home Assistant")
            await asyncio.sleep(1)

    async def _call_entity_service(
        self,
        domain: str,
        service: str,
        entity_id: str,
        service_data: JsonObject | None = None,
    ) -> None:
        await self.client.call(
            {
                "type": "call_service",
                "domain": domain,
                "service": service,
                "service_data": service_data or {},
                "target": {"entity_id": entity_id},
            }
        )

    async def _verify_restored(self, original_states: Sequence[JsonObject]) -> None:
        light_entities = [
            state.get("entity_id")
            for state in original_states
            if isinstance(state.get("entity_id"), str) and str(state["entity_id"]).startswith("light.")
        ]
        if len(light_entities) != 1:
            raise ValidationError("captured state has no cupboard light")
        deadline = asyncio.get_running_loop().time() + 45
        while True:
            states = _object_list(await self.client.call({"type": "get_states"}), "restored state response")
            current_by_id = {
                str(state["entity_id"]): state for state in states if isinstance(state.get("entity_id"), str)
            }
            if all(
                _control_state_matches(expected, current_by_id.get(str(expected.get("entity_id"))))
                for expected in original_states
            ):
                return
            if asyncio.get_running_loop().time() >= deadline:
                raise ValidationError("cupboard light state restoration could not be verified")
            await asyncio.sleep(1)

    def _selection(self) -> DeviceSelection:
        if self.selection is None:
            raise ValidationError("cupboard device has not been discovered")
        return self.selection

    def _model_catalogue(self) -> JsonObject:
        models = _object(self.catalogue.get("models"), "model catalogues")
        return _object(models.get(EXPECTED_MODEL), "H617A catalogue")


def _select_device(devices: Sequence[JsonObject], identity_entry_id: str, identity_model: str) -> JsonObject:
    matches = [device for device in devices if device.get("config_entry_id") == identity_entry_id]
    if len(matches) != 1:
        raise ValidationError("devices.env cupboard identity did not select exactly one loaded editor device")
    selected = matches[0]
    if selected.get("model") != identity_model or selected.get("model") != EXPECTED_MODEL:
        raise ValidationError("devices.env cupboard identity does not route to an H617A editor device")
    custom_effects = _object(selected.get("custom_effects"), "cupboard custom-effect capabilities")
    profiles = _object(selected.get("profiles"), "cupboard profile capabilities")
    required_custom = {"painted", "single", "multi", "advanced", "workshop"}
    if any(custom_effects.get(capability) != "supported" for capability in required_custom):
        raise ValidationError("cupboard is missing an applicable H617A custom-effect route")
    if profiles.get("music") != "supported":
        raise ValidationError("cupboard is missing the native music route")
    return selected


def _validate_h617a_catalogue(catalogue: Mapping[str, Any]) -> None:
    for key in ("painted_effects", "effects", "music_modes", "workshop_templates", "workflows"):
        if not _object_list(catalogue.get(key), f"H617A catalogue {key}"):
            raise ValidationError(f"H617A catalogue {key} is empty")
    supports = _object(catalogue.get("supports"), "H617A catalogue support")
    apply = _object(catalogue.get("apply"), "H617A catalogue apply support")
    if supports.get("advanced") != "supported" or supports.get("workshop") != "supported":
        raise ValidationError("H617A catalogue does not declare Advanced and Workshop support")
    if any(apply.get(kind) != "supported" for kind in ("painted", "single", "multi", "workshop")):
        raise ValidationError("H617A catalogue does not declare all physical apply routes")


def _require_scene_kinds(scenes: Sequence[JsonObject]) -> None:
    kinds = {scene.get("parameter_kind") for scene in scenes}
    if not {"none", "palette", "layers"}.issubset(kinds):
        raise ValidationError("H617A live scene catalogue lacks native, palette or layered content")


def _single_content(catalogue: Mapping[str, Any], *, speed: int) -> JsonObject:
    family = _object(_object_list(catalogue.get("effects"), "H617A effect families")[0], "H617A effect family")
    variation = _object(_object_list(family.get("variations"), "H617A effect variations")[0], "H617A effect variation")
    return {
        "kind": "h617a_single",
        "family": _required_int(family, "family"),
        "variant": _required_int(variation, "variant"),
        "speed": speed,
        "palette": [[255, 48, 16], [16, 96, 255]],
    }


def _painted_content(catalogue: Mapping[str, Any]) -> JsonObject:
    painted = _object(_object_list(catalogue.get("painted_effects"), "H617A painted effects")[0], "painted effect")
    return {
        "kind": "h617a_painted",
        "effect": _required_str(painted, "id"),
        "speed": 55,
        "brightness": 70,
        "background": [0, 0, 0],
        "groups": [
            {"fill": [255, 32, 0], "segments": [0, 1, 2]},
            {"fill": [0, 64, 255], "segments": [3, 4, 5]},
        ],
    }


def _multi_content(catalogue: Mapping[str, Any]) -> JsonObject:
    families = [
        family
        for family in _object_list(catalogue.get("effects"), "H617A effect families")
        if family.get("supports_multi") is True
    ]
    if len(families) < 2:
        raise ValidationError("H617A catalogue does not expose two Multi-capable families")
    effects = []
    for family in families[:2]:
        variation = _object(_object_list(family.get("variations"), "H617A Multi variations")[0], "Multi variation")
        effects.append(
            {
                "family": _required_int(family, "family"),
                "variant": _required_int(variation, "variant"),
            }
        )
    return {
        "kind": "h617a_multi",
        "effects": effects,
        "speed": 55,
        "palette": [[255, 0, 64], [0, 192, 255], [255, 192, 0]],
    }


def _music_content(catalogue: Mapping[str, Any]) -> JsonObject:
    mode = _object(_object_list(catalogue.get("music_modes"), "H617A music modes")[0], "H617A music mode")
    limits = _object(catalogue.get("limits"), "H617A catalogue limits")
    minimum = _required_int(limits, "music_sensitivity_min")
    maximum = _required_int(limits, "music_sensitivity_max")
    return {
        "kind": "music_profile",
        "model": EXPECTED_MODEL,
        "mode": _required_str(mode, "id"),
        "sensitivity": (minimum + maximum) // 2,
        "colour": None,
        "calm": None,
        "parameters": {},
    }


def _advanced_content(layered_scene: Mapping[str, Any]) -> JsonObject:
    if layered_scene.get("kind") != "scene_layered":
        raise ValidationError("live layered scene detail is not layered content")
    effect = _object(layered_scene.get("effect"), "live layered scene effect")
    return {"kind": "advanced", **deepcopy(effect)}


def _edited_palette_content(content: Mapping[str, Any]) -> JsonObject:
    edited = deepcopy(dict(content))
    if edited.get("kind") != "scene_palette":
        raise ValidationError("live palette scene detail is not palette content")
    palette = edited.get("palette")
    steps = edited.get("steps")
    if not isinstance(steps, list) or not steps:
        raise ValidationError("live palette scene has no editable steps")
    if isinstance(palette, list) and palette:
        old_colour = palette[0]
        new_colour = [32, 220, 96]
        palette[0] = new_colour
        for step in steps:
            if isinstance(step, dict) and step.get("colour") == old_colour:
                step["colour"] = new_colour
    else:
        first_step = _object(steps[0], "palette scene step")
        first_step["colour"] = [32, 220, 96]
        first_step["inline_colour"] = [32, 220, 96]
    return edited


def _validate_deployment(deployment: Mapping[str, Any], config_entry_id: str) -> None:
    if deployment.get("config_entry_id") != config_entry_id:
        raise ValidationError("deployment was routed to a different config entry")
    content_kind = _required_str(deployment, "content_kind")
    expected = TERMINAL_DEPLOYMENTS.get(content_kind)
    if expected is None:
        raise ValidationError(f"deployment returned unexpected content kind {content_kind!r}")
    actual = (_required_str(deployment, "phase"), _required_str(deployment, "verification_confidence"))
    if actual != expected:
        raise ValidationError(
            f"{content_kind} ended in phase {actual[0]!r} with confidence {actual[1]!r}; "
            f"expected {expected[0]!r}/{expected[1]!r}"
        )
    if deployment.get("error_code") is not None:
        raise ValidationError(f"{content_kind} deployment retained an error code")
    current = _required_int(deployment, "progress_current")
    total = _required_int(deployment, "progress_total")
    if total < 1 or current != total:
        raise ValidationError(f"{content_kind} deployment progress is incomplete")


def _deployment_summary(route: str, deployment: Mapping[str, Any]) -> RouteSummary:
    return RouteSummary(
        route=route,
        phase=_required_str(deployment, "phase"),
        confidence=_required_str(deployment, "verification_confidence"),
        content_kind=_required_str(deployment, "content_kind"),
    )


def _light_restore_data(state: Mapping[str, Any]) -> JsonObject:
    attributes = _object(state.get("attributes"), "captured light attributes")
    data: JsonObject = {}
    brightness = attributes.get("brightness")
    if isinstance(brightness, int):
        data["brightness"] = brightness
    effect = attributes.get("effect")
    if isinstance(effect, str) and effect and effect != "None":
        data["effect"] = effect
        return data
    color_mode = attributes.get("color_mode")
    if color_mode == "rgb":
        rgb = attributes.get("rgb_color")
        if isinstance(rgb, list) and len(rgb) == 3 and all(isinstance(channel, int) for channel in rgb):
            data["rgb_color"] = rgb
    elif color_mode == "color_temp":
        kelvin = attributes.get("color_temp_kelvin")
        if isinstance(kelvin, int):
            data["color_temp_kelvin"] = kelvin
    return data


def _light_state_matches(expected: Mapping[str, Any], current: Mapping[str, Any]) -> bool:
    if current.get("state") != expected.get("state"):
        return False
    if expected.get("state") == "off":
        return True
    expected_attributes = expected.get("attributes")
    current_attributes = current.get("attributes")
    if not isinstance(expected_attributes, dict) or not isinstance(current_attributes, dict):
        return False
    expected_effect = expected_attributes.get("effect")
    if isinstance(expected_effect, str) and expected_effect and expected_effect != "None":
        return current_attributes.get("effect") == expected_effect
    if expected_attributes.get("color_mode") == "rgb" and isinstance(expected_attributes.get("rgb_color"), list):
        if current_attributes.get("rgb_color") != expected_attributes.get("rgb_color"):
            return False
    if expected_attributes.get("color_mode") == "color_temp" and isinstance(
        expected_attributes.get("color_temp_kelvin"), int
    ):
        if current_attributes.get("color_temp_kelvin") != expected_attributes.get("color_temp_kelvin"):
            return False
    expected_brightness = expected_attributes.get("brightness")
    current_brightness = current_attributes.get("brightness")
    return not isinstance(expected_brightness, int) or (
        isinstance(current_brightness, int) and abs(current_brightness - expected_brightness) <= 1
    )


def _control_state_matches(expected: Mapping[str, Any], current: Mapping[str, Any] | None) -> bool:
    if current is None:
        return False
    entity_id = expected.get("entity_id")
    if not isinstance(entity_id, str):
        return False
    domain = entity_id.partition(".")[0]
    if expected.get("state") in {"unknown", "unavailable"}:
        return True
    if domain == "light":
        return _light_state_matches(expected, current)
    if domain == "number":
        try:
            return abs(float(str(expected.get("state"))) - float(str(current.get("state")))) <= 0.01
        except ValueError:
            return False
    return current.get("state") == expected.get("state")


def _write_state(state: RunState) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    staging = STATE_PATH.with_suffix(".staging")
    staging.write_text(json.dumps(state.to_dict(), sort_keys=True), encoding="utf-8")
    staging.chmod(0o600)
    staging.replace(STATE_PATH)


def _read_state() -> RunState:
    try:
        value = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValidationError("no staged Effect Studio validation state exists") from exc
    except json.JSONDecodeError as exc:
        raise ValidationError("staged Effect Studio validation state is not valid JSON") from exc
    if not isinstance(value, dict):
        raise ValidationError("staged Effect Studio validation state is not an object")
    return RunState.from_dict(value)


def _remove_state() -> None:
    STATE_PATH.unlink(missing_ok=True)
    STATE_PATH.with_suffix(".staging").unlink(missing_ok=True)


async def _restart_home_assistant(
    client: ClientProtocol,
    rest: HomeAssistantRest,
    *,
    identity_entry_id: str,
    light_entity_id: str,
) -> tuple[HomeAssistantWebSocket, HomeAssistantRest]:
    stop_subscription_id, _initial = await client.subscribe(
        {
            "type": "subscribe_events",
            "event_type": "homeassistant_stop",
        },
        initial_event=False,
    )
    with suppress(Exception):
        await client.call(
            {
                "type": "call_service",
                "domain": "homeassistant",
                "service": "restart",
                "service_data": {},
            }
        )
        with suppress(Exception):
            await client.wait_event(stop_subscription_id, timeout=30)

    saw_unavailable = False
    unavailable_deadline = asyncio.get_running_loop().time() + RESTART_UNAVAILABLE_TIMEOUT
    while not saw_unavailable and asyncio.get_running_loop().time() < unavailable_deadline:
        saw_unavailable = not await rest.ready()
        if not saw_unavailable:
            await asyncio.sleep(0.5)
    if not saw_unavailable:
        raise ValidationError("Home Assistant restart did not enter an unavailable state")
    with suppress(BaseException):
        await client.close()

    ready_deadline = asyncio.get_running_loop().time() + RESTART_SETUP_TIMEOUT
    last_entry_state = "unavailable"
    while asyncio.get_running_loop().time() < ready_deadline:
        if await rest.ready():
            ready_client: HomeAssistantWebSocket | None = None
            try:
                ready_client, ready_rest = await _connect()
                entries = _object_list(
                    await ready_client.call({"type": "config_entries/get"}),
                    "config entry response",
                )
                entry = next((item for item in entries if item.get("entry_id") == identity_entry_id), None)
                if entry is None:
                    last_entry_state = "missing"
                else:
                    last_entry_state = str(entry.get("state", "unknown"))
                    if (
                        entry.get("domain") == DOMAIN
                        and entry.get("disabled_by") is None
                        and entry.get("state") == "loaded"
                    ):
                        states = _object_list(
                            await ready_client.call({"type": "get_states"}),
                            "restart state response",
                        )
                        light_state = next(
                            (state for state in states if state.get("entity_id") == light_entity_id),
                            None,
                        )
                        if light_state is not None and light_state.get("state") in {"on", "off"}:
                            return ready_client, ready_rest
            except Exception:
                last_entry_state = "unavailable"
            if ready_client is not None:
                with suppress(BaseException):
                    await ready_client.close()
        await asyncio.sleep(2)
    raise ValidationError(
        f"Home Assistant cupboard entry and light did not become usable after restart; entry state={last_entry_state}"
    )


async def _connect() -> tuple[HomeAssistantWebSocket, HomeAssistantRest]:
    base_url = os.environ.get("HA_URL")
    token = os.environ.get("HA_TOKEN")
    if not base_url or not token:
        raise ValidationError("Home Assistant platform credentials are unavailable")
    rest = HomeAssistantRest(base_url, token)
    return await HomeAssistantWebSocket.connect(base_url, token), rest


async def _run(args: argparse.Namespace) -> JsonObject:
    identity_entry_id = os.environ.get("EFFECT_STUDIO_CONFIG_ENTRY_ID")
    identity_model = os.environ.get("EFFECT_STUDIO_DEVICE_MODEL")
    if not identity_entry_id or not identity_model:
        raise ValidationError("run through effect-studio-home-assistant.sh so devices.env selects cupboard internally")
    if identity_model != EXPECTED_MODEL:
        raise ValidationError("devices.env cupboard identity is not H617A")

    if args.stage != "after-restart" and STATE_PATH.exists():
        raise ValidationError("staged validation state already exists; run the after-restart stage to recover it")

    client, rest = await _connect()
    validator = EffectStudioValidator(
        client,
        rest,
        identity_entry_id=identity_entry_id,
        identity_model=identity_model,
    )
    staged = _read_state() if args.stage == "after-restart" else None
    run_state: RunState | None = staged
    routes: list[RouteSummary] = []
    diagnostics_count = 0
    restart_completed = args.stage == "after-restart"
    cleanup_required = args.stage != "before-restart"
    before_restart_complete = False
    primary_error: BaseException | None = None
    cleanup_errors: list[str] = []
    original_states: list[JsonObject] = staged.original_states if staged is not None else []
    try:
        await validator.verify_surfaces()
        await validator.subscribe()
        if staged is None:
            selection = validator._selection()
            original_states = await validator.capture_controllable_state()
            run_state = await validator.create_and_update_temporary_effect()
            run_state.original_states = original_states
            _write_state(run_state)
            client, rest = await _restart_home_assistant(
                client,
                rest,
                identity_entry_id=identity_entry_id,
                light_entity_id=selection.light_entity_id,
            )
            restart_completed = True
            validator = EffectStudioValidator(
                client,
                rest,
                identity_entry_id=identity_entry_id,
                identity_model=identity_model,
            )
            validator.selection = selection
            if args.stage == "before-restart":
                before_restart_complete = True
            else:
                await validator.verify_surfaces()
                await validator.subscribe()
        if not before_restart_complete:
            if run_state is None:
                raise ValidationError("Effect Studio run state was not created")
            await validator.verify_persisted_item(run_state)
            routes, operation_ids = await validator.run_routes(run_state)
            diagnostics_count = await validator.verify_diagnostics(operation_ids)
    except BaseException as exc:
        primary_error = exc
    finally:
        if run_state is None and validator.temporary_item_id is not None:
            run_state = RunState(
                validator.temporary_item_id,
                validator.temporary_item_revision,
                original_states,
            )
        if run_state is not None:
            try:
                await client.call({"type": "get_states"})
            except BaseException:
                with suppress(BaseException):
                    await client.close()
                try:
                    client, rest = await _connect()
                    validator = EffectStudioValidator(
                        client,
                        rest,
                        identity_entry_id=identity_entry_id,
                        identity_model=identity_model,
                    )
                    await validator.verify_surfaces()
                    await validator.subscribe()
                except BaseException as exc:
                    cleanup_errors.append(f"cleanup reconnect failed: {_error_summary(exc)}")
            if cleanup_required:
                try:
                    await validator.cleanup_item(run_state.item_id)
                except BaseException as exc:
                    cleanup_errors.append(f"temporary library cleanup failed: {_error_summary(exc)}")
            try:
                await validator.restore_states(run_state.original_states)
            except BaseException as exc:
                cleanup_errors.append(f"light restoration failed: {_error_summary(exc)}")
        if cleanup_required and not cleanup_errors:
            _remove_state()
        with suppress(BaseException):
            await client.close()

    if cleanup_errors:
        detail = "; ".join(cleanup_errors)
        if primary_error is not None:
            raise ValidationError(f"{_error_summary(primary_error)}; {detail}") from primary_error
        raise ValidationError(detail)
    if primary_error is not None:
        raise primary_error
    if before_restart_complete:
        return {
            "stage": args.stage,
            "restart": "completed",
            "temporary_item": "retained_for_after_restart",
            "restoration": "verified",
        }
    return {
        "stage": args.stage,
        "restart": "completed" if restart_completed else "not_requested",
        "routes": [route.to_dict() for route in routes],
        "diagnostic_events": diagnostics_count,
        "temporary_item": "removed",
        "restoration": "verified",
    }


def _websocket_url(base_url: str) -> str:
    parsed = urlsplit(base_url)
    if parsed.scheme not in {"http", "https"}:
        raise ValidationError("HA_URL must use HTTP or HTTPS")
    scheme = "wss" if parsed.scheme == "https" else "ws"
    return urlunsplit((scheme, parsed.netloc, f"{parsed.path.rstrip('/')}/api/websocket", "", ""))


def _timestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _object(value: object, name: str) -> JsonObject:
    if not isinstance(value, dict):
        raise ValidationError(f"{name} was not an object")
    return cast(JsonObject, value)


def _object_list(value: object, name: str) -> list[JsonObject]:
    if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
        raise ValidationError(f"{name} was not a list of objects")
    return cast(list[JsonObject], value)


def _required_int(value: Mapping[str, Any], key: str) -> int:
    item = value.get(key)
    if not isinstance(item, int) or isinstance(item, bool):
        raise ValidationError(f"{key} was not an integer")
    return item


def _required_str(value: Mapping[str, Any], key: str) -> str:
    item = value.get(key)
    if not isinstance(item, str) or not item:
        raise ValidationError(f"{key} was not a non-empty string")
    return item


def _redacted_error_detail(detail: str) -> str:
    bounded = detail[:240]
    for secret in (
        os.environ.get("HA_TOKEN"),
        os.environ.get("EFFECT_STUDIO_CONFIG_ENTRY_ID"),
    ):
        if secret:
            bounded = bounded.replace(secret, "**REDACTED**")
    return re.sub(r"(?i)\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b", "**REDACTED**", bounded)


def _error_summary(error: BaseException) -> str:
    if isinstance(error, HomeAssistantApiError):
        return f"{type(error).__name__}({error.code})"
    detail = str(error)
    return type(error).__name__ if not detail else f"{type(error).__name__}: {detail}"


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--stage",
        choices=("all", "before-restart", "after-restart"),
        default="all",
        help="run the complete validation or one side of the single supported restart boundary",
    )
    return parser


def main() -> int:
    try:
        result = asyncio.run(_run(_parser().parse_args()))
    except BaseException as exc:
        print(
            json.dumps(
                {
                    "status": "failed",
                    "error": type(exc).__name__,
                    "detail": _redacted_error_detail(str(exc)),
                },
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
