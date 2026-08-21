"""Effect Studio scenario orchestration."""

from __future__ import annotations

import asyncio
from collections.abc import Mapping, Sequence
from copy import deepcopy
from typing import Any

from .content import (
    advanced_content,
    edited_palette_content,
    multi_content,
    music_content,
    painted_content,
    single_content,
)
from .contracts import (
    DOMAIN,
    EDITOR_CLEANUP_TIMEOUT,
    EXPECTED_MODEL,
    MAX_ROUTE_SUMMARIES,
    PANEL_MODULE_URL,
    PANEL_PATH,
    WS_APPLY_SNAPSHOT,
    WS_CUSTOM_CATALOGUE,
    WS_DEPLOYMENT_SUBSCRIBE,
    WS_DEVICES,
    WS_INFO,
    WS_LIBRARY_CREATE,
    WS_LIBRARY_DELETE,
    WS_LIBRARY_GET,
    WS_LIBRARY_LIST,
    WS_LIBRARY_SUBSCRIBE,
    WS_LIBRARY_UPDATE,
    WS_SCENE_APPLY,
    WS_SCENE_CATALOGUE_GET,
    WS_SCENE_CATALOGUE_LIST,
    ClientProtocol,
    DeviceSelection,
    HomeAssistantApiError,
    JsonObject,
    RouteSummary,
    RunState,
    ValidationError,
    deployment_summary,
    object_list,
    object_value,
    require_scene_kinds,
    required_int,
    required_str,
    select_device,
    timestamp,
    validate_deployment,
    validate_h617a_catalogue,
)
from .restoration import call_entity_service, restore_states, verify_restored
from .transport import HomeAssistantRest


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
        self.catalogue: JsonObject = {}
        self.scene_catalogue: JsonObject = {}
        self.temporary_item_id: str | None = None
        self.temporary_item_version: int = 1
        self.temporary_item_updated_at: str = ""

    async def verify_surfaces(self) -> DeviceSelection:
        panels = object_value(await self.client.call({"type": "get_panels"}), "panel response")
        panel = object_value(panels.get(PANEL_PATH), "Effect Studio panel")
        panel_config = object_value(panel.get("config"), "Effect Studio panel config")
        panel_custom = object_value(panel_config.get("_panel_custom"), "Effect Studio custom panel config")
        if panel_custom.get("module_url") != PANEL_MODULE_URL:
            raise ValidationError("Effect Studio panel does not use the stable loader module")

        info = object_value(await self.client.call({"type": WS_INFO}), "editor info")
        if info.get("api_version") != 7 or info.get("effect_schema_version") != 2:
            raise ValidationError("Effect Studio editor API versions are not supported")
        limits = object_value(info.get("limits"), "editor limits")
        if not isinstance(limits.get("deployment_records"), int) or not isinstance(limits.get("library_items"), int):
            raise ValidationError("Effect Studio editor limits are incomplete")

        devices_payload = object_value(await self.client.call({"type": WS_DEVICES}), "editor devices")
        devices = object_list(devices_payload.get("devices"), "editor devices")
        device = select_device(devices, self.identity_entry_id, self.identity_model)

        registry = object_list(
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
        if device.get("light_entity_id") != light_entities[0]:
            raise ValidationError("Effect Studio device does not reference the enabled light entity")
        self.selection = DeviceSelection(
            config_entry_id=self.identity_entry_id,
            model=device["model"],
            display_name=str(device.get("display_name", "cupboard")),
            light_entity_id=light_entities[0],
            entity_ids=tuple(
                str(entry["entity_id"]) for entry in entry_entities if isinstance(entry.get("entity_id"), str)
            ),
        )

        services = object_value(await self.client.call({"type": "get_services"}), "service registry")
        domain_services = object_value(services.get(DOMAIN), "Effect Studio services")
        required_services = {"apply_custom_effect"}
        if not required_services.issubset(domain_services):
            raise ValidationError("Effect Studio services are incomplete")

        catalogue_payload = object_value(await self.client.call({"type": WS_CUSTOM_CATALOGUE}), "custom catalogue")
        self.catalogue = object_value(catalogue_payload.get("catalogue"), "custom catalogue")
        if self.catalogue.get("schema_version") != 7:
            raise ValidationError("Effect Studio custom catalogue schema is not supported")
        models = object_value(self.catalogue.get("models"), "model catalogues")
        model_catalogue = object_value(models.get(EXPECTED_MODEL), "H617A catalogue")
        validate_h617a_catalogue(model_catalogue)

        scene_payload = object_value(
            await self.client.call(
                {
                    "type": WS_SCENE_CATALOGUE_LIST,
                    "config_entry_id": self.identity_entry_id,
                }
            ),
            "scene catalogue response",
        )
        self.scene_catalogue = object_value(scene_payload.get("catalogue"), "scene catalogue")
        if self.scene_catalogue.get("sku") != EXPECTED_MODEL or self.scene_catalogue.get("enabled") is not True:
            raise ValidationError("cupboard native scene catalogue is unavailable or routed to the wrong model")
        require_scene_kinds(object_list(self.scene_catalogue.get("scenes"), "scene catalogue entries"))
        return self.selection

    async def subscribe(self) -> None:
        self.library_subscription_id, library_event = await self.client.subscribe({"type": WS_LIBRARY_SUBSCRIBE})
        library_payload = object_value(library_event.get("event"), "initial library subscription event")
        object_list(library_payload.get("items"), "initial library items")
        self.deployment_subscription_id, deployment_event = await self.client.subscribe(
            {"type": WS_DEPLOYMENT_SUBSCRIBE}
        )
        deployment_payload = object_value(deployment_event.get("event"), "initial deployment subscription event")
        required_int(deployment_payload, "version")
        object_list(deployment_payload.get("deployments"), "initial deployments")

    async def capture_controllable_state(self) -> list[JsonObject]:
        selection = self._selection()
        states = object_list(await self.client.call({"type": "get_states"}), "state response")
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
        content = single_content(model_catalogue, speed=40)
        created = object_value(
            await self.client.call(
                {
                    "type": WS_LIBRARY_CREATE,
                    "name": "Effect Studio HA validation",
                    "content": content,
                }
            ),
            "library create response",
        )
        created_item = object_value(created.get("item"), "created library item")
        item_id = required_str(created_item, "id")
        created_version = required_int(created_item, "version")
        created_updated_at = required_str(created_item, "updated_at")
        self.temporary_item_id = item_id
        self.temporary_item_version = created_version
        self.temporary_item_updated_at = created_updated_at
        await self._expect_library_event(item_id, created_version)

        updated_content = single_content(model_catalogue, speed=60)
        updated = object_value(
            await self.client.call(
                {
                    "type": WS_LIBRARY_UPDATE,
                    "item_id": item_id,
                    "name": "Effect Studio HA validation",
                    "content": updated_content,
                    "expected_version": created_version,
                    "expected_updated_at": created_updated_at,
                }
            ),
            "library update response",
        )
        updated_item = object_value(updated.get("item"), "updated library item")
        item_version = required_int(updated_item, "version")
        item_updated_at = required_str(updated_item, "updated_at")
        self.temporary_item_version = item_version
        self.temporary_item_updated_at = item_updated_at
        await self._expect_library_event(item_id, item_version)

        conflict = await self.client.call_raw(
            {
                "type": WS_LIBRARY_UPDATE,
                "item_id": item_id,
                "name": "Stale Effect Studio HA validation",
                "content": updated_content,
                "expected_version": created_version,
                "expected_updated_at": created_updated_at,
            }
        )
        error = conflict.get("error")
        if conflict.get("success") is not False or not isinstance(error, dict) or error.get("code") != "conflict":
            raise ValidationError("Effect Studio library did not reject a stale item version")
        return RunState(item_id, item_version, item_updated_at, [])

    async def verify_persisted_item(self, state: RunState) -> None:
        listing = object_value(await self.client.call({"type": WS_LIBRARY_LIST}), "library list")
        items = object_list(listing.get("items"), "library items")
        summary = next((item for item in items if item.get("id") == state.item_id), None)
        if (
            summary is None
            or summary.get("version") != state.item_version
            or summary.get("updated_at") != state.item_updated_at
        ):
            raise ValidationError("temporary Effect Studio item did not survive the Home Assistant restart")
        item_payload = object_value(
            await self.client.call({"type": WS_LIBRARY_GET, "item_id": state.item_id}),
            "library get response",
        )
        item = object_value(item_payload.get("item"), "persisted library item")
        if (
            item.get("version") != state.item_version
            or item.get("updated_at") != state.item_updated_at
            or object_value(item.get("content"), "persisted content").get("kind") != "h617a_single"
        ):
            raise ValidationError("temporary Effect Studio item changed across the Home Assistant restart")

    async def run_routes(self, state: RunState) -> tuple[list[RouteSummary], list[str]]:
        selection = self._selection()
        if self.deployment_subscription_id is None:
            raise ValidationError("deployment subscription is not active")
        routes: list[RouteSummary] = []
        operation_ids: list[str] = []
        scenes = object_list(self.scene_catalogue.get("scenes"), "scene catalogue entries")
        native = next((scene for scene in scenes if scene.get("parameter_kind") == "none"), scenes[0])
        native_result = object_value(
            await self.client.call(
                {
                    "type": WS_SCENE_APPLY,
                    "config_entry_id": selection.config_entry_id,
                    "scene_id": required_int(native, "scene_id"),
                    "effect_id": required_int(native, "effect_id"),
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
        palette_content = edited_palette_content(object_value(palette_detail.get("content"), "palette scene content"))
        deployment = await self._apply_snapshot("edited_palette_scene", palette_content)
        routes.append(deployment_summary("edited_palette_scene", deployment))
        operation_ids.append(required_str(deployment, "operation_id"))

        layered_scene = next(scene for scene in scenes if scene.get("parameter_kind") == "layers")
        layered_detail = await self._scene_detail(layered_scene)
        layered_content = deepcopy(object_value(layered_detail.get("content"), "layered scene content"))
        deployment = await self._apply_snapshot("layered_scene_copy", layered_content)
        routes.append(deployment_summary("layered_scene_copy", deployment))
        operation_ids.append(required_str(deployment, "operation_id"))

        await self.client.call(
            {
                "type": "call_service",
                "domain": DOMAIN,
                "service": "apply_custom_effect",
                "service_data": {
                    "entity_id": selection.light_entity_id,
                    "effect_id": state.item_id,
                },
            }
        )
        deployment = await self._wait_item_deployment(state.item_id)
        routes.append(deployment_summary("single", deployment))
        operation_ids.append(required_str(deployment, "operation_id"))

        model_catalogue = self._model_catalogue()
        deployment = await self._apply_snapshot("painted", painted_content(model_catalogue))
        routes.append(deployment_summary("painted", deployment))
        operation_ids.append(required_str(deployment, "operation_id"))

        for route, content in (
            ("multi", multi_content(model_catalogue)),
            ("native_music", music_content(model_catalogue)),
            ("advanced", advanced_content(layered_content)),
        ):
            deployment = await self._apply_snapshot(route, content)
            routes.append(deployment_summary(route, deployment))
            operation_ids.append(required_str(deployment, "operation_id"))

        workshop_templates = object_list(model_catalogue.get("workshop_templates"), "H617A Workshop templates")
        for template in workshop_templates:
            template_id = required_str(template, "id")
            content = deepcopy(object_value(template.get("content"), "Workshop template content"))
            deployment = await self._apply_snapshot(f"workshop:{template_id}", content)
            routes.append(deployment_summary(f"workshop:{template_id}", deployment))
            operation_ids.append(required_str(deployment, "operation_id"))

        if len(routes) > MAX_ROUTE_SUMMARIES:
            raise ValidationError("Effect Studio route summary exceeded its configured bound")
        return routes, operation_ids

    async def verify_diagnostics(self, operation_ids: Sequence[str]) -> int:
        diagnostics = await self.rest.diagnostics(self._selection().config_entry_id)
        coordinator = object_value(diagnostics.get("coordinator"), "coordinator diagnostics")
        if coordinator.get("model") != EXPECTED_MODEL:
            raise ValidationError("diagnostics report the wrong physical model")
        packet_log = object_list(coordinator.get("packet_log"), "diagnostic packet log")
        if not packet_log:
            raise ValidationError("diagnostics contain no bounded packet evidence")
        deployment_diagnostics = object_value(
            diagnostics.get("effect_deployment_diagnostics"),
            "effect deployment diagnostics",
        )
        events = object_list(deployment_diagnostics.get("events"), "effect deployment diagnostic events")
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
                listing = object_value(await self.client.call({"type": WS_LIBRARY_LIST}), "library cleanup list")
            except HomeAssistantApiError as exc:
                if exc.code != "unknown_command" or asyncio.get_running_loop().time() >= deadline:
                    raise
                await asyncio.sleep(1)
                continue
            items = object_list(listing.get("items"), "library cleanup items")
            summary = next((item for item in items if item.get("id") == item_id), None)
            if summary is None:
                return
            item_version = required_int(summary, "version")
            item_updated_at = required_str(summary, "updated_at")
            try:
                await self.client.call(
                    {
                        "type": WS_LIBRARY_DELETE,
                        "item_id": item_id,
                        "expected_version": item_version,
                        "expected_updated_at": item_updated_at,
                    }
                )
            except HomeAssistantApiError as exc:
                if exc.code in {"conflict", "unknown_command"} and asyncio.get_running_loop().time() < deadline:
                    await asyncio.sleep(1)
                    continue
                raise
            if self.library_subscription_id is not None:
                await self._expect_library_event(item_id, None)
            return

    async def restore_states(self, original_states: Sequence[JsonObject]) -> None:
        await restore_states(
            self.client,
            original_states,
            call_service=self._call_entity_service,
            verify=self._verify_restored,
        )

    async def _apply_snapshot(self, route: str, content: JsonObject) -> JsonObject:
        result = object_value(
            await self.client.call(
                {
                    "type": WS_APPLY_SNAPSHOT,
                    "config_entry_id": self._selection().config_entry_id,
                    "name": f"Effect Studio HA validation {route}"[:96],
                    "content": content,
                    "updated_at": timestamp(),
                }
            ),
            f"{route} apply response",
        )
        deployment = object_value(result.get("deployment"), f"{route} deployment")
        operation_id = required_str(deployment, "operation_id")
        await self._wait_deployment(operation_id)
        validate_deployment(deployment, self._selection().config_entry_id)
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
        payload = object_value(event.get("event"), "deployment subscription event")
        deployments = object_list(payload.get("deployments"), "deployment subscription records")
        deployment = next(deployment for deployment in deployments if deployment.get("operation_id") == operation_id)
        validate_deployment(deployment, self._selection().config_entry_id)
        return deployment

    async def _wait_item_deployment(self, item_id: str) -> JsonObject:
        if self.deployment_subscription_id is None:
            raise ValidationError("deployment subscription is not active")

        def matches(message: JsonObject) -> bool:
            event = message.get("event")
            if not isinstance(event, dict):
                return False
            deployments = event.get("deployments")
            return isinstance(deployments, list) and any(
                isinstance(deployment, dict)
                and deployment.get("item_id") == item_id
                and deployment.get("phase") in {"confirmed", "applied", "uncertain", "failed", "interrupted", "unknown"}
                for deployment in deployments
            )

        event = await self.client.wait_event(self.deployment_subscription_id, matches, timeout=90)
        payload = object_value(event.get("event"), "deployment subscription event")
        deployments = object_list(payload.get("deployments"), "deployment subscription records")
        deployment = next(deployment for deployment in deployments if deployment.get("item_id") == item_id)
        validate_deployment(deployment, self._selection().config_entry_id)
        return deployment

    async def _scene_detail(self, scene: Mapping[str, Any]) -> JsonObject:
        return object_value(
            await self.client.call(
                {
                    "type": WS_SCENE_CATALOGUE_GET,
                    "config_entry_id": self._selection().config_entry_id,
                    "scene_id": required_int(scene, "scene_id"),
                    "effect_id": required_int(scene, "effect_id"),
                }
            ),
            "scene detail",
        )

    async def _expect_library_event(self, item_id: str, item_version: int | None) -> None:
        if self.library_subscription_id is None:
            raise ValidationError("library subscription is not active")

        def matches(message: JsonObject) -> bool:
            event = message.get("event")
            if not isinstance(event, dict):
                return False
            items = event.get("items")
            if not isinstance(items, list):
                return False
            matching = next((item for item in items if isinstance(item, dict) and item.get("id") == item_id), None)
            return (
                matching is None
                if item_version is None
                else matching is not None and matching.get("version") == item_version
            )

        await self.client.wait_event(self.library_subscription_id, matches)

    async def _wait_light_effect(self, expected: str) -> None:
        deadline = asyncio.get_running_loop().time() + 30
        while True:
            states = object_list(await self.client.call({"type": "get_states"}), "state response")
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
        await call_entity_service(self.client, domain, service, entity_id, service_data)

    async def _verify_restored(self, original_states: Sequence[JsonObject]) -> None:
        await verify_restored(self.client, original_states)

    def _selection(self) -> DeviceSelection:
        if self.selection is None:
            raise ValidationError("cupboard device has not been discovered")
        return self.selection

    def _model_catalogue(self) -> JsonObject:
        models = object_value(self.catalogue.get("models"), "model catalogues")
        return object_value(models.get(EXPECTED_MODEL), "H617A catalogue")
