#!/usr/bin/env python3
"""Inspect and control one Home Assistant config entry over its authenticated APIs."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import ssl
import sys
from collections.abc import Iterable
from typing import Any
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen

type JsonObject = dict[str, Any]


class HomeAssistantWebSocket:
    """Correlate authenticated Home Assistant WebSocket requests."""

    def __init__(self, websocket: Any) -> None:
        self.websocket = websocket
        self.next_message_id = 1

    async def authenticate(self, token: str) -> None:
        if (await self._receive()).get("type") != "auth_required":
            raise RuntimeError("server did not ask for auth")
        await self.websocket.send(json.dumps({"type": "auth", "access_token": token}))
        if (await self._receive()).get("type") != "auth_ok":
            raise RuntimeError("auth rejected")

    async def call(self, payload: JsonObject) -> JsonObject:
        request = dict(payload)
        request["id"] = self.next_message_id
        self.next_message_id += 1
        await self.websocket.send(json.dumps(request))
        while True:
            message = await self._receive()
            if message.get("id") == request["id"] and message.get("type") == "result":
                return message

    async def _receive(self) -> JsonObject:
        message = json.loads(await self.websocket.recv())
        if not isinstance(message, dict):
            raise RuntimeError("Home Assistant returned a non-object message")
        return message


def _normalise_suffix(suffix: str) -> str:
    return f"_{suffix.lstrip('_')}"


def resolve_entity(entries: Iterable[JsonObject], entry_id: str, selector: str) -> JsonObject:
    """Resolve exactly one entity by unique-ID suffix or ``domain:<domain>``."""
    candidates = [entry for entry in entries if entry.get("config_entry_id") == entry_id]
    if selector.startswith("domain:"):
        domain = selector.removeprefix("domain:")
        matches = [entry for entry in candidates if str(entry.get("entity_id", "")).partition(".")[0] == domain]
        description = f"domain {domain!r}"
    else:
        normalised = _normalise_suffix(selector)
        matches = [
            entry
            for entry in candidates
            if isinstance(entry.get("unique_id"), str) and entry["unique_id"].endswith(normalised)
        ]
        description = f"unique ID ending {normalised!r}"
    if len(matches) != 1:
        raise ValueError(f"expected one entity with {description} in the entry, found {len(matches)}")
    return matches[0]


def _state_for(states: Iterable[JsonObject], entity_id: str) -> JsonObject:
    state = next((candidate for candidate in states if candidate.get("entity_id") == entity_id), None)
    if state is None:
        raise ValueError(f"state not found for {entity_id}")
    return state


def _service_data(text: str) -> JsonObject:
    if not text.strip():
        return {}
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("service data on stdin must be a JSON object")
    return data


def diagnostics_url(websocket_url: str, entry_id: str) -> str:
    """Derive the authenticated diagnostics endpoint from the configured WebSocket endpoint."""
    parsed = urlsplit(websocket_url)
    schemes = {"ws": "http", "wss": "https"}
    if parsed.scheme not in schemes or not parsed.path.endswith("/api/websocket"):
        raise ValueError("HA_WEBSOCKET_URL must end in /api/websocket")
    prefix = parsed.path[: -len("/api/websocket")]
    path = f"{prefix}/api/diagnostics/config_entry/{quote(entry_id, safe='')}"
    return urlunsplit((schemes[parsed.scheme], parsed.netloc, path, "", ""))


def _download_diagnostics(entry_id: str) -> JsonObject:
    request = Request(  # noqa: S310 - URL is validated as the configured HA HTTP(S) endpoint.
        diagnostics_url(os.environ["HA_WEBSOCKET_URL"], entry_id),
        headers={"Authorization": f"Bearer {os.environ['HA_TOKEN']}", "Accept": "application/json"},
    )
    context = ssl.create_default_context() if request.full_url.startswith("https://") else None
    with urlopen(request, context=context) as response:  # noqa: S310 - URL is the configured HA endpoint.
        data = json.load(response)
    if not isinstance(data, dict):
        raise RuntimeError("Home Assistant diagnostics response was not a JSON object")
    return data


def _print_result(result: Any) -> None:
    print(json.dumps(result, indent=2, sort_keys=True))


def _require_success(result: JsonObject) -> Any:
    if not result.get("success"):
        raise RuntimeError(json.dumps(result, sort_keys=True))
    return result.get("result")


async def _entry_entities(client: HomeAssistantWebSocket, entry_id: str) -> list[JsonObject]:
    result = _require_success(await client.call({"type": "config/entity_registry/list"}))
    if not isinstance(result, list):
        raise RuntimeError("entity registry response was not a list")
    return [entry for entry in result if isinstance(entry, dict) and entry.get("config_entry_id") == entry_id]


async def _states(client: HomeAssistantWebSocket) -> list[JsonObject]:
    result = _require_success(await client.call({"type": "get_states"}))
    if not isinstance(result, list):
        raise RuntimeError("state response was not a list")
    return [state for state in result if isinstance(state, dict)]


async def _run_websocket(args: argparse.Namespace) -> int:
    import websockets

    url = os.environ["HA_WEBSOCKET_URL"]
    ssl_context = ssl.create_default_context() if url.startswith("wss://") else None
    async with websockets.connect(url, ssl=ssl_context, max_size=None) as websocket:
        client = HomeAssistantWebSocket(websocket)
        await client.authenticate(os.environ["HA_TOKEN"])

        if args.action == "status":
            entries = _require_success(await client.call({"type": "config_entries/get"}))
            entry = next((entry for entry in entries if entry.get("entry_id") == args.entry_id), None)
            _print_result(entry if entry is not None else {"error": "entry not found"})
            return 0 if entry is not None else 1

        if args.action in {"enable", "disable"}:
            result = await client.call(
                {
                    "type": "config_entries/disable",
                    "entry_id": args.entry_id,
                    "disabled_by": "user" if args.action == "disable" else None,
                }
            )
            _print_result(result)
            return 0 if result.get("success") else 1

        entries = await _entry_entities(client, args.entry_id)
        states = await _states(client)
        if args.action == "entities":
            rows = []
            for entry in entries:
                entity_id = entry.get("entity_id")
                state = next((item.get("state") for item in states if item.get("entity_id") == entity_id), None)
                rows.append(
                    {
                        "entity_id": entity_id,
                        "disabled_by": entry.get("disabled_by"),
                        "state": state,
                    }
                )
            _print_result(rows)
            return 0

        entity = resolve_entity(entries, args.entry_id, args.suffix)
        entity_id = str(entity["entity_id"])
        if args.action == "state":
            _print_result(_state_for(states, entity_id))
            return 0

        if args.action == "call":
            result = await client.call(
                {
                    "type": "call_service",
                    "domain": args.domain,
                    "service": args.service,
                    "service_data": _service_data(sys.stdin.read()),
                    "target": {"entity_id": entity_id},
                }
            )
            _print_result(result)
            return 0 if result.get("success") else 1

        deadline = asyncio.get_running_loop().time() + args.timeout
        while True:
            state = _state_for(await _states(client), entity_id)
            if str(state.get("state")) == args.expected:
                _print_result(state)
                return 0
            if asyncio.get_running_loop().time() >= deadline:
                _print_result(state)
                return 1
            await asyncio.sleep(1)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("entry_id")
    actions = parser.add_subparsers(dest="action", required=True)
    for action in ("status", "enable", "disable", "entities", "diagnostics"):
        actions.add_parser(action)
    state = actions.add_parser("state")
    state.add_argument("suffix")
    call = actions.add_parser("call")
    call.add_argument("domain")
    call.add_argument("service")
    call.add_argument("suffix")
    wait = actions.add_parser("wait")
    wait.add_argument("suffix")
    wait.add_argument("expected")
    wait.add_argument("--timeout", type=float, default=30)
    return parser


async def run(args: argparse.Namespace) -> int:
    if args.action == "diagnostics":
        _print_result(await asyncio.to_thread(_download_diagnostics, args.entry_id))
        return 0
    return await _run_websocket(args)


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run(_parser().parse_args())))
