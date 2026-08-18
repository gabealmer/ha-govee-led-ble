#!/usr/bin/env python3
"""Bootstrap and inspect the isolated Home Assistant Container."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import stat
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen

DOMAIN = "ha_govee_led_ble"
type JsonObject = dict[str, Any]


class ContainerHomeAssistantError(RuntimeError):
    """Raised when the isolated Home Assistant API contract is not satisfied."""


class ContainerHomeAssistantHttpError(ContainerHomeAssistantError):
    """Raised when the isolated Home Assistant returns an error response."""

    def __init__(self, method: str, path: str, status: int, detail: str) -> None:
        super().__init__(f"{method} {path} returned HTTP {status}: {detail}")
        self.status = status


class ContainerHomeAssistant:
    """Manage the isolated Home Assistant instance through its public APIs."""

    def __init__(self, base_url: str, auth_file: Path) -> None:
        self.base_url = base_url.rstrip("/")
        parsed = urlsplit(self.base_url)
        if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "localhost", "::1"} or parsed.path:
            raise ValueError("the isolated Home Assistant URL must be local HTTP without a path")
        self.client_id = f"{self.base_url}/"
        self.auth_file = auth_file

    def wait_ready(self, timeout: float) -> None:
        """Wait until Home Assistant exposes its onboarding status API."""
        deadline = time.monotonic() + timeout
        last_error = "not ready"
        while time.monotonic() < deadline:
            try:
                response = self._request_json("GET", "/api/onboarding")
            except ContainerHomeAssistantHttpError as err:
                if err.status == 404 and self.auth_file.is_file():
                    return
                last_error = str(err)
            except ContainerHomeAssistantError as err:
                last_error = str(err)
            else:
                if isinstance(response, list):
                    return
                last_error = "onboarding status was not a list"
            time.sleep(1)
        raise ContainerHomeAssistantError(
            f"Home Assistant did not become ready within {timeout:g} seconds: {last_error}"
        )

    def ensure_onboarding(self, username: str, password: str) -> str:
        """Complete onboarding and return a current access token."""
        status = self._onboarding_status()
        access_token: str
        if not status.get("user", False):
            if not username or not password or password == "replace-with-a-local-only-password":  # noqa: S105 - documented sentinel, not a credential.
                raise ContainerHomeAssistantError(
                    "set HA_CONTAINER_USERNAME and a non-placeholder HA_CONTAINER_PASSWORD in devices.local.env"
                )
            response = self._request_json(
                "POST",
                "/api/onboarding/users",
                json_data={
                    "name": "Govee BLE Development",
                    "username": username,
                    "password": password,
                    "client_id": self.client_id,
                    "language": "en",
                },
                sensitive=True,
            )
            auth_code = _required_string(response, "auth_code", "onboarding user response")
            tokens = self._request_json(
                "POST",
                "/auth/token",
                form_data={
                    "grant_type": "authorization_code",
                    "code": auth_code,
                    "client_id": self.client_id,
                },
                sensitive=True,
            )
            access_token = _required_string(tokens, "access_token", "token response")
            refresh_token = _required_string(tokens, "refresh_token", "token response")
            self._write_auth(refresh_token)
            status["user"] = True
        else:
            access_token = self._refresh_access_token()

        authenticated_steps: tuple[tuple[str, str, JsonObject], ...] = (
            ("core_config", "/api/onboarding/core_config", {}),
            ("analytics", "/api/onboarding/analytics", {}),
            (
                "integration",
                "/api/onboarding/integration",
                {"client_id": self.client_id, "redirect_uri": self.client_id},
            ),
        )
        for step, path, payload in authenticated_steps:
            if status.get(step, False):
                continue
            self._request_json("POST", path, json_data=payload, access_token=access_token)
            status[step] = True
        return access_token

    async def ensure_config_entry(
        self,
        access_token: str,
        *,
        address: str,
        model: str,
        entry_id_file: Path,
        timeout: float,
    ) -> JsonObject:
        """Create or select the device entry and wait for it to load."""
        normalised_address = _normalise_address(address)
        persisted_entry_id = _read_entry_id(entry_id_file)
        if persisted_entry_id is not None:
            entry = _entry_by_id(await self._config_entries(access_token), persisted_entry_id)
            if entry is None:
                raise ContainerHomeAssistantError("persisted isolated config entry was not found")
            _validate_enabled_domain_entry(entry, "persisted isolated config entry")
        else:
            entry = await self._complete_matching_discovery_flow(access_token, normalised_address)
            if entry is None:
                entry = await self._create_manual_entry(access_token, normalised_address, model)

        entry_id = _required_string(entry, "entry_id", "config entry")
        _write_entry_id(entry_id_file, entry_id)
        deadline = asyncio.get_running_loop().time() + timeout
        while True:
            current = _entry_by_id(await self._config_entries(access_token), entry_id)
            if current is None:
                raise ContainerHomeAssistantError("selected isolated config entry disappeared")
            _validate_enabled_domain_entry(current, "selected isolated config entry")
            if current.get("state") == "loaded":
                return _public_entry(current)
            if asyncio.get_running_loop().time() >= deadline:
                raise ContainerHomeAssistantError(
                    f"isolated config entry did not load within {timeout:g} seconds; state={current.get('state')!r}"
                )
            await asyncio.sleep(1)

    async def entry_status(self, entry_id: str) -> JsonObject:
        """Return the selected isolated config entry status."""
        access_token = self._refresh_access_token()
        entry = _entry_by_id(await self._config_entries(access_token), entry_id)
        if entry is None:
            raise ContainerHomeAssistantError("persisted isolated config entry was not found")
        if entry.get("domain") != DOMAIN:
            raise ContainerHomeAssistantError(f"persisted isolated config entry does not belong to {DOMAIN}")
        return _public_entry(entry)

    def _onboarding_status(self) -> dict[str, bool]:
        try:
            response = self._request_json("GET", "/api/onboarding")
        except ContainerHomeAssistantHttpError as err:
            if err.status == 404 and self.auth_file.is_file():
                return {
                    "user": True,
                    "core_config": True,
                    "analytics": True,
                    "integration": True,
                }
            raise
        if not isinstance(response, list):
            raise ContainerHomeAssistantError("onboarding status was not a list")
        status: dict[str, bool] = {}
        for item in response:
            if isinstance(item, dict) and isinstance(item.get("step"), str):
                status[item["step"]] = item.get("done") is True
        return status

    def _refresh_access_token(self) -> str:
        try:
            stored = json.loads(self.auth_file.read_text(encoding="utf-8"))
        except FileNotFoundError as err:
            raise ContainerHomeAssistantError(
                f"{self.auth_file} is missing; remove the isolated device config and run up again"
            ) from err
        except json.JSONDecodeError as err:
            raise ContainerHomeAssistantError(f"{self.auth_file} is not valid JSON") from err
        refresh_token = _required_string(stored, "refresh_token", "stored authentication")
        response = self._request_json(
            "POST",
            "/auth/token",
            form_data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": self.client_id,
            },
            sensitive=True,
        )
        return _required_string(response, "access_token", "token response")

    def _write_auth(self, refresh_token: str) -> None:
        self.auth_file.parent.mkdir(parents=True, exist_ok=True)
        staging = self.auth_file.with_name(f".{self.auth_file.name}.new")
        descriptor = os.open(staging, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as file:
            json.dump({"client_id": self.client_id, "refresh_token": refresh_token}, file)
            file.write("\n")
        staging.replace(self.auth_file)
        self.auth_file.chmod(stat.S_IRUSR | stat.S_IWUSR)

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        json_data: JsonObject | None = None,
        form_data: dict[str, str] | None = None,
        access_token: str | None = None,
        sensitive: bool = False,
    ) -> Any:
        headers = {"Accept": "application/json"}
        data: bytes | None = None
        if json_data is not None:
            data = json.dumps(json_data).encode()
            headers["Content-Type"] = "application/json"
        elif form_data is not None:
            data = urlencode(form_data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        if access_token is not None:
            headers["Authorization"] = "Bearer " + access_token
        request = Request(f"{self.base_url}{path}", data=data, headers=headers, method=method)  # noqa: S310
        try:
            with urlopen(request, timeout=10) as response:  # noqa: S310 - base URL is restricted to local HTTP.
                body = response.read()
        except HTTPError as err:
            detail = "<redacted>" if sensitive or access_token is not None else err.read(500).decode(errors="replace")
            raise ContainerHomeAssistantHttpError(method, path, err.code, detail) from err
        except (TimeoutError, URLError) as err:
            raise ContainerHomeAssistantError(f"{method} {path} failed: {err}") from err
        if not body:
            return {}
        try:
            return json.loads(body)
        except json.JSONDecodeError as err:
            raise ContainerHomeAssistantError(f"{method} {path} returned invalid JSON") from err

    async def _websocket_result(self, access_token: str, message_type: str, **message: Any) -> Any:
        import websockets  # type: ignore[import-not-found]

        parsed = urlsplit(self.base_url)
        websocket_url = urlunsplit(("ws", parsed.netloc, "/api/websocket", "", ""))
        async with websockets.connect(websocket_url, max_size=None) as websocket:
            required = json.loads(await websocket.recv())
            if required.get("type") != "auth_required":
                raise ContainerHomeAssistantError("isolated Home Assistant did not request WebSocket authentication")
            await websocket.send(json.dumps({"type": "auth", "access_token": access_token}))
            authenticated = json.loads(await websocket.recv())
            if authenticated.get("type") != "auth_ok":
                raise ContainerHomeAssistantError("isolated Home Assistant rejected WebSocket authentication")
            await websocket.send(json.dumps({"id": 1, "type": message_type, **message}))
            while True:
                response = json.loads(await websocket.recv())
                if response.get("id") != 1 or response.get("type") != "result":
                    continue
                if not response.get("success"):
                    raise ContainerHomeAssistantError(f"isolated Home Assistant rejected {message_type}")
                return response.get("result")

    async def _config_entries(self, access_token: str) -> list[JsonObject]:
        result = await self._websocket_result(access_token, "config_entries/get", domain=DOMAIN)
        if not isinstance(result, list):
            raise ContainerHomeAssistantError("config_entries/get did not return a list")
        return [entry for entry in result if isinstance(entry, dict)]

    async def _config_flows(self, access_token: str) -> list[JsonObject]:
        result = await self._websocket_result(access_token, "config_entries/flow/progress")
        if not isinstance(result, list):
            raise ContainerHomeAssistantError("config_entries/flow/progress did not return a list")
        return [flow for flow in result if isinstance(flow, dict)]

    async def _complete_matching_discovery_flow(
        self,
        access_token: str,
        address: str,
    ) -> JsonObject | None:
        matching = [flow for flow in await self._config_flows(access_token) if _flow_matches_address(flow, address)]
        for flow in matching:
            flow_id = _required_string(flow, "flow_id", "discovery flow")
            result = self._request_json(
                "POST",
                f"/api/config/config_entries/flow/{flow_id}",
                json_data={},
                access_token=access_token,
            )
            entry = await self._entry_from_flow_result(access_token, result)
            if entry is not None:
                return entry
        return None

    async def _create_manual_entry(
        self,
        access_token: str,
        address: str,
        model: str,
    ) -> JsonObject:
        flow = self._request_json(
            "POST",
            "/api/config/config_entries/flow",
            json_data={"handler": DOMAIN},
            access_token=access_token,
        )
        flow_id = _required_string(flow, "flow_id", "config flow response")
        result = self._request_json(
            "POST",
            f"/api/config/config_entries/flow/{flow_id}",
            json_data={"address": address, "model": model},
            access_token=access_token,
        )
        entry = await self._entry_from_flow_result(access_token, result)
        if entry is not None:
            return entry
        if isinstance(result, dict) and result.get("type") == "abort" and result.get("reason") == "already_in_progress":
            for _ in range(10):
                entry = await self._complete_matching_discovery_flow(access_token, address)
                if entry is not None:
                    return entry
                await asyncio.sleep(0.2)
        raise ContainerHomeAssistantError(f"config flow did not create or select {DOMAIN}: {_safe_flow_result(result)}")

    async def _entry_from_flow_result(
        self,
        access_token: str,
        result: Any,
    ) -> JsonObject | None:
        if isinstance(result, dict) and result.get("type") == "create_entry" and isinstance(result.get("result"), dict):
            entry_id = _required_string(result["result"], "entry_id", "config entry result")
            return {"entry_id": entry_id}
        if isinstance(result, dict) and result.get("type") == "abort" and result.get("reason") == "already_configured":
            return _single_enabled_domain_entry(await self._config_entries(access_token))
        return None


def _normalise_address(address: str) -> str:
    compact = address.strip().upper().replace(":", "").replace("-", "")
    if len(compact) != 12 or any(character not in "0123456789ABCDEF" for character in compact):
        raise ValueError("device address must contain 12 hexadecimal digits")
    return ":".join(compact[index : index + 2] for index in range(0, 12, 2))


def _required_string(value: Any, key: str, description: str) -> str:
    if not isinstance(value, dict):
        raise ContainerHomeAssistantError(f"{description} did not contain {key}")
    result = value.get(key)
    if not isinstance(result, str) or not result:
        raise ContainerHomeAssistantError(f"{description} did not contain {key}")
    return result


def _entry_by_id(entries: list[JsonObject], entry_id: str) -> JsonObject | None:
    matches = [entry for entry in entries if entry.get("entry_id") == entry_id]
    if len(matches) > 1:
        raise ContainerHomeAssistantError("isolated Home Assistant returned a duplicate config entry ID")
    return matches[0] if matches else None


def _validate_enabled_domain_entry(entry: JsonObject, description: str) -> None:
    if entry.get("domain") != DOMAIN:
        raise ContainerHomeAssistantError(f"{description} does not belong to {DOMAIN}")
    if entry.get("disabled_by") is not None:
        raise ContainerHomeAssistantError(f"{description} is disabled")


def _single_enabled_domain_entry(entries: list[JsonObject]) -> JsonObject:
    matches = [entry for entry in entries if entry.get("domain") == DOMAIN and entry.get("disabled_by") is None]
    if len(matches) != 1:
        raise ContainerHomeAssistantError(
            f"already_configured recovery requires exactly one enabled {DOMAIN} entry; found {len(matches)}"
        )
    return matches[0]


def _flow_matches_address(flow: JsonObject, address: str) -> bool:
    context = flow.get("context")
    return (
        flow.get("handler") == DOMAIN
        and flow.get("step_id") == "bluetooth_confirm"
        and isinstance(context, dict)
        and context.get("source") == "bluetooth"
        and isinstance(context.get("unique_id"), str)
        and context["unique_id"].upper() == address
    )


def _public_entry(entry: JsonObject) -> JsonObject:
    return {
        "entry_id": entry.get("entry_id"),
        "title": entry.get("title"),
        "state": entry.get("state"),
        "disabled_by": entry.get("disabled_by"),
    }


def _safe_flow_result(result: Any) -> str:
    if not isinstance(result, dict):
        return "non-object response"
    return json.dumps(
        {key: result.get(key) for key in ("type", "step_id", "reason", "errors") if key in result},
        sort_keys=True,
    )


def _write_entry_id(path: Path, entry_id: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    staging = path.with_name(f".{path.name}.new")
    staging.write_text(f"{entry_id}\n", encoding="utf-8")
    staging.chmod(0o600)
    staging.replace(path)


def _read_entry_id(path: Path) -> str | None:
    try:
        entry_id = path.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return None
    except OSError as err:
        raise ContainerHomeAssistantError(f"could not read persisted isolated config entry ID: {err}") from err
    if not entry_id or any(character.isspace() for character in entry_id):
        raise ContainerHomeAssistantError("persisted isolated config entry ID is invalid")
    return entry_id


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8123")
    parser.add_argument("--auth-file", type=Path, required=True)
    commands = parser.add_subparsers(dest="command", required=True)
    wait_ready = commands.add_parser("wait-ready")
    wait_ready.add_argument("--timeout", type=float, default=120)
    bootstrap = commands.add_parser("bootstrap")
    bootstrap.add_argument("--address", required=True)
    bootstrap.add_argument("--model", required=True)
    bootstrap.add_argument("--entry-id-file", type=Path, required=True)
    bootstrap.add_argument("--timeout", type=float, default=90)
    status = commands.add_parser("status")
    status.add_argument("--entry-id-file", type=Path, required=True)
    return parser


async def run(args: argparse.Namespace) -> int:
    client = ContainerHomeAssistant(args.base_url, args.auth_file)
    if args.command == "wait-ready":
        await asyncio.to_thread(client.wait_ready, args.timeout)
        return 0
    if args.command == "bootstrap":
        await asyncio.to_thread(client.wait_ready, 120)
        username = os.environ.get("HA_CONTAINER_USERNAME", "")
        password = os.environ.get("HA_CONTAINER_PASSWORD", "")
        access_token = await asyncio.to_thread(client.ensure_onboarding, username, password)
        entry = await client.ensure_config_entry(
            access_token,
            address=args.address,
            model=args.model,
            entry_id_file=args.entry_id_file,
            timeout=args.timeout,
        )
        print(json.dumps(entry, sort_keys=True))
        return 0
    entry_id = args.entry_id_file.read_text(encoding="utf-8").strip()
    if not entry_id:
        raise ContainerHomeAssistantError(f"{args.entry_id_file} is empty")
    print(json.dumps(await client.entry_status(entry_id), sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(run(_parser().parse_args())))
    except (ContainerHomeAssistantError, ValueError) as err:
        print(err, file=sys.stderr)
        raise SystemExit(1) from err
