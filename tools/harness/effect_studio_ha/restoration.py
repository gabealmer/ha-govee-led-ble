"""Controllable state restoration and matching."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable, Mapping, Sequence
from typing import Any

from homeassistant.components.light import EFFECT_OFF

from .contracts import ClientProtocol, JsonObject, ValidationError, object_list, object_value

type EntityServiceCaller = Callable[[str, str, str, JsonObject | None], Awaitable[None]]
type RestorationVerifier = Callable[[Sequence[JsonObject]], Awaitable[None]]


def light_restore_data(state: Mapping[str, Any]) -> JsonObject:
    attributes = object_value(state.get("attributes"), "captured light attributes")
    data: JsonObject = {}
    brightness = attributes.get("brightness")
    if isinstance(brightness, int):
        data["brightness"] = brightness
    effect = attributes.get("effect")
    if isinstance(effect, str) and effect and effect != EFFECT_OFF:
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


def light_state_matches(expected: Mapping[str, Any], current: Mapping[str, Any]) -> bool:
    if current.get("state") != expected.get("state"):
        return False
    if expected.get("state") == "off":
        return True
    expected_attributes = expected.get("attributes")
    current_attributes = current.get("attributes")
    if not isinstance(expected_attributes, dict) or not isinstance(current_attributes, dict):
        return False
    expected_effect = expected_attributes.get("effect")
    active_effect = isinstance(expected_effect, str) and expected_effect and expected_effect != EFFECT_OFF
    if active_effect:
        if current_attributes.get("effect") != expected_effect:
            return False
    elif current_attributes.get("effect") not in (None, EFFECT_OFF):
        return False
    if (
        not active_effect
        and expected_attributes.get("color_mode") == "rgb"
        and isinstance(expected_attributes.get("rgb_color"), list)
    ):
        if current_attributes.get("rgb_color") != expected_attributes.get("rgb_color"):
            return False
    if (
        not active_effect
        and expected_attributes.get("color_mode") == "color_temp"
        and isinstance(expected_attributes.get("color_temp_kelvin"), int)
    ):
        if current_attributes.get("color_temp_kelvin") != expected_attributes.get("color_temp_kelvin"):
            return False
    expected_brightness = expected_attributes.get("brightness")
    current_brightness = current_attributes.get("brightness")
    return not isinstance(expected_brightness, int) or (
        isinstance(current_brightness, int) and abs(current_brightness - expected_brightness) <= 1
    )


def control_state_matches(expected: Mapping[str, Any], current: Mapping[str, Any] | None) -> bool:
    if current is None:
        return False
    entity_id = expected.get("entity_id")
    if not isinstance(entity_id, str):
        return False
    domain = entity_id.partition(".")[0]
    if expected.get("state") in {"unknown", "unavailable"}:
        return True
    if domain == "light":
        return light_state_matches(expected, current)
    if domain == "number":
        try:
            return abs(float(str(expected.get("state"))) - float(str(current.get("state")))) <= 0.01
        except ValueError:
            return False
    return current.get("state") == expected.get("state")


async def call_entity_service(
    client: ClientProtocol,
    domain: str,
    service: str,
    entity_id: str,
    service_data: JsonObject | None = None,
) -> None:
    await client.call(
        {
            "type": "call_service",
            "domain": domain,
            "service": service,
            "service_data": service_data or {},
            "target": {"entity_id": entity_id},
        }
    )


async def verify_restored(client: ClientProtocol, original_states: Sequence[JsonObject]) -> None:
    light_entities = [
        state.get("entity_id")
        for state in original_states
        if isinstance(state.get("entity_id"), str) and str(state["entity_id"]).startswith("light.")
    ]
    if len(light_entities) != 1:
        raise ValidationError("captured state has no cupboard light")
    deadline = asyncio.get_running_loop().time() + 45
    while True:
        states = object_list(await client.call({"type": "get_states"}), "restored state response")
        current_by_id = {str(state["entity_id"]): state for state in states if isinstance(state.get("entity_id"), str)}
        if all(
            control_state_matches(expected, current_by_id.get(str(expected.get("entity_id"))))
            for expected in original_states
        ):
            return
        if asyncio.get_running_loop().time() >= deadline:
            raise ValidationError("cupboard light state restoration could not be verified")
        await asyncio.sleep(1)


async def restore_states(
    client: ClientProtocol,
    original_states: Sequence[JsonObject],
    *,
    call_service: EntityServiceCaller | None = None,
    verify: RestorationVerifier | None = None,
) -> None:
    async def default_call_service(
        domain: str,
        service: str,
        entity_id: str,
        service_data: JsonObject | None,
    ) -> None:
        await call_entity_service(client, domain, service, entity_id, service_data)

    async def default_verify(states: Sequence[JsonObject]) -> None:
        await verify_restored(client, states)

    service_caller = call_service or default_call_service
    verifier = verify or default_verify
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
            await service_caller("number", "set_value", entity_id, {"value": value})
        elif domain == "select":
            await service_caller("select", "select_option", entity_id, {"option": state_value})
        elif domain == "switch":
            await service_caller("switch", "turn_on" if state_value == "on" else "turn_off", entity_id, None)
        elif domain == "light":
            if state_value == "off":
                restore_data = light_restore_data(state)
                if restore_data:
                    await service_caller("light", "turn_on", entity_id, restore_data)
                await service_caller("light", "turn_off", entity_id, None)
            elif state_value == "on":
                await service_caller("light", "turn_on", entity_id, light_restore_data(state))
    await verifier(original_states)
