#!/usr/bin/env python3
"""Install a GitHub branch through HACS and verify the served Effect Studio asset."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import ssl
from typing import Any
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen

type JsonObject = dict[str, Any]

DOMAIN = "ha_govee_led_ble"
EDITOR_PANEL_PATH = "ha-govee-led-ble"
EDITOR_LOADER_MODULE_URL = f"/{DOMAIN}_static/editor-loader.js"


class HomeAssistantWebSocket:
    """Authenticated request/response helper for development deployment."""

    def __init__(self, websocket: Any) -> None:
        self.websocket = websocket
        self.next_id = 1

    async def authenticate(self) -> None:
        if (await self._receive()).get("type") != "auth_required":
            raise RuntimeError("Home Assistant did not request authentication")
        await self.websocket.send(
            json.dumps(
                {
                    "type": "auth",
                    "access_token": os.environ["HA_TOKEN"],
                }
            )
        )
        if (await self._receive()).get("type") != "auth_ok":
            raise RuntimeError("Home Assistant rejected authentication")

    async def call(self, payload: JsonObject) -> Any:
        message_id = self.next_id
        self.next_id += 1
        await self.websocket.send(json.dumps({**payload, "id": message_id}))
        while True:
            response = await self._receive()
            if response.get("id") != message_id or response.get("type") != "result":
                continue
            if not response.get("success"):
                raise RuntimeError(json.dumps(response.get("error"), sort_keys=True))
            return response.get("result")

    async def _receive(self) -> JsonObject:
        value = json.loads(await self.websocket.recv())
        if not isinstance(value, dict):
            raise RuntimeError("Home Assistant returned a non-object WebSocket message")
        return value


def _websocket_url(base_url: str) -> str:
    parsed = urlsplit(base_url)
    scheme = "wss" if parsed.scheme == "https" else "ws"
    return urlunsplit((scheme, parsed.netloc, f"{parsed.path.rstrip('/')}/api/websocket", "", ""))


def _find_repository(repositories: object, full_name: str) -> JsonObject:
    if not isinstance(repositories, list):
        raise RuntimeError("HACS returned a non-list repository response")
    matches = [
        repository
        for repository in repositories
        if isinstance(repository, dict) and repository.get("full_name") == full_name
    ]
    if len(matches) != 1:
        raise RuntimeError(f"expected one HACS repository named {full_name!r}, found {len(matches)}")
    return matches[0]


def _require_loader(panels: object) -> None:
    if not isinstance(panels, dict):
        raise RuntimeError("Home Assistant returned a non-object panel response")
    panel = panels.get(EDITOR_PANEL_PATH)
    if not isinstance(panel, dict):
        raise RuntimeError("Effect Studio panel is not registered")
    config = panel.get("config")
    custom = config.get("_panel_custom") if isinstance(config, dict) else None
    module_url = custom.get("module_url") if isinstance(custom, dict) else None
    if module_url != EDITOR_LOADER_MODULE_URL:
        raise RuntimeError(
            "restart-free frontend deployment is not active; deploy in backend mode and restart Home Assistant once"
        )


def _served_bootstrap() -> str:
    url = urljoin(os.environ["HA_URL"].rstrip("/") + "/", f"{DOMAIN}_static/manifest.json")
    request = Request(  # noqa: S310 - URL is derived from the configured HA endpoint.
        url,
        headers={
            "Authorization": f"Bearer {os.environ['HA_TOKEN']}",
            "Cache-Control": "no-cache",
        },
    )
    context = ssl.create_default_context() if url.startswith("https://") else None
    with urlopen(request, context=context) as response:  # noqa: S310 - configured HA endpoint.
        manifest = json.load(response)
    if not isinstance(manifest, dict) or not isinstance(manifest.get("bootstrap"), str):
        raise RuntimeError("Home Assistant served an invalid Effect Studio manifest")
    return manifest["bootstrap"]


async def deploy(args: argparse.Namespace) -> None:
    import websockets

    url = _websocket_url(os.environ["HA_URL"])
    ssl_context = ssl.create_default_context() if url.startswith("wss://") else None
    async with websockets.connect(url, ssl=ssl_context, max_size=None) as websocket:
        client = HomeAssistantWebSocket(websocket)
        await client.authenticate()
        if args.mode == "frontend":
            _require_loader(await client.call({"type": "get_panels"}))
        repositories = await client.call(
            {
                "type": "hacs/repositories/list",
                "categories": ["integration"],
            }
        )
        repository = _find_repository(repositories, args.repository)
        repository_id = repository.get("id")
        if not isinstance(repository_id, str):
            raise RuntimeError("HACS repository has no string ID")
        await client.call(
            {
                "type": "hacs/repository/download",
                "repository": repository_id,
                "version": args.ref,
            }
        )
    bootstrap = await asyncio.to_thread(_served_bootstrap)
    if bootstrap != args.expected_bootstrap:
        raise RuntimeError(f"Home Assistant serves {bootstrap!r}, expected {args.expected_bootstrap!r}")
    print(
        json.dumps(
            {
                "mode": args.mode,
                "ref": args.ref,
                "repository": args.repository,
                "bootstrap": bootstrap,
            },
            sort_keys=True,
        )
    )


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("frontend", "backend"), required=True)
    parser.add_argument("--ref", required=True)
    parser.add_argument("--expected-bootstrap", required=True)
    parser.add_argument("--repository", default="teh-hippo/ha-govee-led-ble")
    return parser


if __name__ == "__main__":
    asyncio.run(deploy(_parser().parse_args()))
