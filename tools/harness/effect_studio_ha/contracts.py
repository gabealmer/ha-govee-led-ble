"""Contracts and validation helpers for the Effect Studio Home Assistant harness."""

from __future__ import annotations

import os
import re
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Protocol, cast

type JsonObject = dict[str, Any]
type JsonValue = str | int | float | bool | None | list["JsonValue"] | dict[str, "JsonValue"]

DOMAIN = "ha_govee_led_ble"
PANEL_PATH = "ha-govee-led-ble"
PANEL_MODULE_URL = f"/{DOMAIN}_static/editor-loader.js"
EXPECTED_MODEL = "H617A"
STATE_SCHEMA_VERSION = 2
MAX_ROUTE_SUMMARIES = 32
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
    "workshop": ("confirmed", "activation_match"),
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
    item_version: int
    item_updated_at: str
    original_states: list[JsonObject]

    def to_dict(self) -> JsonObject:
        return {
            "schema_version": STATE_SCHEMA_VERSION,
            "item_id": self.item_id,
            "item_version": self.item_version,
            "item_updated_at": self.item_updated_at,
            "original_states": self.original_states,
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> RunState:
        if raw.get("schema_version") != STATE_SCHEMA_VERSION:
            raise ValidationError("Effect Studio staged state has an unsupported schema")
        item_id = raw.get("item_id")
        item_version = raw.get("item_version")
        item_updated_at = raw.get("item_updated_at")
        original_states = raw.get("original_states")
        if (
            not isinstance(item_id, str)
            or not isinstance(item_version, int)
            or not isinstance(item_updated_at, str)
            or not isinstance(original_states, list)
        ):
            raise ValidationError("Effect Studio staged state is malformed")
        if any(not isinstance(state, dict) for state in original_states):
            raise ValidationError("Effect Studio staged control state is malformed")
        return cls(item_id, item_version, item_updated_at, cast(list[JsonObject], original_states))


def select_device(devices: Sequence[JsonObject], identity_entry_id: str, identity_model: str) -> JsonObject:
    matches = [device for device in devices if device.get("config_entry_id") == identity_entry_id]
    if len(matches) != 1:
        raise ValidationError("devices.env cupboard identity did not select exactly one loaded editor device")
    selected = matches[0]
    if selected.get("model") != identity_model or selected.get("model") != EXPECTED_MODEL:
        raise ValidationError("devices.env cupboard identity does not route to an H617A editor device")
    custom_effects = object_value(selected.get("custom_effects"), "cupboard custom-effect capabilities")
    profiles = object_value(selected.get("profiles"), "cupboard profile capabilities")
    required_custom = {"painted", "single", "multi", "advanced", "workshop"}
    if any(custom_effects.get(capability) != "supported" for capability in required_custom):
        raise ValidationError("cupboard is missing an applicable H617A custom-effect route")
    if profiles.get("music") != "supported":
        raise ValidationError("cupboard is missing the native music route")
    return selected


def validate_h617a_catalogue(catalogue: Mapping[str, Any]) -> None:
    for key in ("painted_effects", "effects", "music_modes", "workshop_templates", "workflows"):
        if not object_list(catalogue.get(key), f"H617A catalogue {key}"):
            raise ValidationError(f"H617A catalogue {key} is empty")
    supports = object_value(catalogue.get("supports"), "H617A catalogue support")
    apply = object_value(catalogue.get("apply"), "H617A catalogue apply support")
    if supports.get("advanced") != "supported" or supports.get("workshop") != "supported":
        raise ValidationError("H617A catalogue does not declare Advanced and Workshop support")
    if any(apply.get(kind) != "supported" for kind in ("painted", "single", "multi", "workshop")):
        raise ValidationError("H617A catalogue does not declare all physical apply routes")


def require_scene_kinds(scenes: Sequence[JsonObject]) -> None:
    kinds = {scene.get("parameter_kind") for scene in scenes}
    if not {"none", "palette", "layers"}.issubset(kinds):
        raise ValidationError("H617A live scene catalogue lacks native, palette or layered content")


def validate_deployment(deployment: Mapping[str, Any], config_entry_id: str) -> None:
    if deployment.get("config_entry_id") != config_entry_id:
        raise ValidationError("deployment was routed to a different config entry")
    content_kind = required_str(deployment, "content_kind")
    expected = TERMINAL_DEPLOYMENTS.get(content_kind)
    if expected is None:
        raise ValidationError(f"deployment returned unexpected content kind {content_kind!r}")
    actual = (required_str(deployment, "phase"), required_str(deployment, "verification_confidence"))
    if actual != expected:
        raise ValidationError(
            f"{content_kind} ended in phase {actual[0]!r} with confidence {actual[1]!r}; "
            f"expected {expected[0]!r}/{expected[1]!r}"
        )
    if deployment.get("error_code") is not None:
        raise ValidationError(f"{content_kind} deployment retained an error code")
    current = required_int(deployment, "progress_current")
    total = required_int(deployment, "progress_total")
    if total < 1 or current != total:
        raise ValidationError(f"{content_kind} deployment progress is incomplete")


def deployment_summary(route: str, deployment: Mapping[str, Any]) -> RouteSummary:
    return RouteSummary(
        route=route,
        phase=required_str(deployment, "phase"),
        confidence=required_str(deployment, "verification_confidence"),
        content_kind=required_str(deployment, "content_kind"),
    )


def timestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def object_value(value: object, name: str) -> JsonObject:
    if not isinstance(value, dict):
        raise ValidationError(f"{name} was not an object")
    return cast(JsonObject, value)


def object_list(value: object, name: str) -> list[JsonObject]:
    if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
        raise ValidationError(f"{name} was not a list of objects")
    return cast(list[JsonObject], value)


def required_int(value: Mapping[str, Any], key: str) -> int:
    item = value.get(key)
    if not isinstance(item, int) or isinstance(item, bool):
        raise ValidationError(f"{key} was not an integer")
    return item


def required_str(value: Mapping[str, Any], key: str) -> str:
    item = value.get(key)
    if not isinstance(item, str) or not item:
        raise ValidationError(f"{key} was not a non-empty string")
    return item


def redacted_error_detail(detail: str) -> str:
    bounded = detail[:240]
    for secret in (
        os.environ.get("HA_TOKEN"),
        os.environ.get("EFFECT_STUDIO_CONFIG_ENTRY_ID"),
    ):
        if secret:
            bounded = bounded.replace(secret, "**REDACTED**")
    return re.sub(r"(?i)\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b", "**REDACTED**", bounded)


def error_summary(error: BaseException) -> str:
    if isinstance(error, HomeAssistantApiError):
        return f"{type(error).__name__}({error.code})"
    detail = str(error)
    return type(error).__name__ if not detail else f"{type(error).__name__}: {detail}"
