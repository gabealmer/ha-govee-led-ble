#!/usr/bin/env python3
"""Enable, disable or inspect a Home Assistant config entry over the WebSocket API.

Disabling releases the device's single BLE link so the vendor app or a host adapter
can own it. Enabling hands it back. HA_TOKEN and HA_WEBSOCKET_URL come from the
environment; ha.sh injects the token from Bitwarden Secrets Manager and the endpoint from
the untracked devices.local.env. Neither has a default: an endpoint that fell back to a
baked-in host would quietly drive whichever instance that host happened to be.
"""

import asyncio
import json
import os
import ssl
import sys

import websockets


async def run(entry_id: str, action: str) -> int:
    url = os.environ["HA_WEBSOCKET_URL"]
    async with websockets.connect(url, ssl=ssl.create_default_context(), max_size=None) as ws:
        if json.loads(await ws.recv())["type"] != "auth_required":
            raise RuntimeError("server did not ask for auth")
        await ws.send(json.dumps({"type": "auth", "access_token": os.environ["HA_TOKEN"]}))
        if json.loads(await ws.recv())["type"] != "auth_ok":
            raise RuntimeError("auth rejected")

        next_message_id = 1

        async def call(payload: dict) -> dict:
            nonlocal next_message_id
            payload["id"] = next_message_id
            next_message_id += 1
            await ws.send(json.dumps(payload))
            while True:
                message = json.loads(await ws.recv())
                if message.get("id") == payload["id"] and message.get("type") == "result":
                    return message

        if action == "status":
            entries = (await call({"type": "config_entries/get"}))["result"]
            entry = next((e for e in entries if e["entry_id"] == entry_id), None)
            print(json.dumps(entry, indent=2) if entry else "entry not found")
            return 0 if entry else 1

        result = await call(
            {
                "type": "config_entries/disable",
                "entry_id": entry_id,
                "disabled_by": "user" if action == "disable" else None,
            }
        )
        print(json.dumps(result, indent=2))
        return 0 if result.get("success") else 1


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[2] not in {"status", "enable", "disable"}:
        print(__doc__)
        raise SystemExit(2)
    raise SystemExit(asyncio.run(run(sys.argv[1], sys.argv[2])))
