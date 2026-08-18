"""Home Assistant WebSocket and REST transport."""

from __future__ import annotations

import asyncio
import json
import os
import ssl
from collections.abc import Awaitable, Callable
from contextlib import suppress
from typing import Any, cast
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen

from .contracts import (
    DOMAIN,
    RESTART_SETUP_TIMEOUT,
    RESTART_UNAVAILABLE_TIMEOUT,
    ClientProtocol,
    HomeAssistantApiError,
    JsonObject,
    ValidationError,
    object_list,
)


class HomeAssistantWebSocket:
    """Correlate requests while retaining subscription events on one connection."""

    def __init__(self, websocket: Any) -> None:
        self.websocket = websocket
        self.next_id = 1
        self.events: dict[int, list[JsonObject]] = {}

    @classmethod
    async def connect(cls, base_url: str, token: str) -> HomeAssistantWebSocket:
        import websockets  # type: ignore[import-not-found]

        websocket_url = websocket_url_for(base_url)
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
                "Authorization": "Bearer " + self.token,
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


def websocket_url_for(base_url: str) -> str:
    parsed = urlsplit(base_url)
    if parsed.scheme not in {"http", "https"}:
        raise ValidationError("HA_URL must use HTTP or HTTPS")
    scheme = "wss" if parsed.scheme == "https" else "ws"
    return urlunsplit((scheme, parsed.netloc, f"{parsed.path.rstrip('/')}/api/websocket", "", ""))


async def connect() -> tuple[HomeAssistantWebSocket, HomeAssistantRest]:
    base_url = os.environ.get("HA_URL")
    token = os.environ.get("HA_TOKEN")
    if not base_url or not token:
        raise ValidationError("Home Assistant platform credentials are unavailable")
    rest = HomeAssistantRest(base_url, token)
    return await HomeAssistantWebSocket.connect(base_url, token), rest


async def restart_home_assistant(
    client: ClientProtocol,
    rest: HomeAssistantRest,
    *,
    identity_entry_id: str,
    light_entity_id: str,
    connect_client: Callable[[], Awaitable[tuple[HomeAssistantWebSocket, HomeAssistantRest]]] = connect,
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
                ready_client, ready_rest = await connect_client()
                entries = object_list(
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
                        states = object_list(
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
