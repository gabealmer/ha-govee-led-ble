import importlib.util
import json
import stat
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.error import HTTPError

import pytest

_SCRIPT = Path(__file__).parents[1] / "tools" / "harness" / "container_ha.py"
_SPEC = importlib.util.spec_from_file_location("harness_container_ha", _SCRIPT)
assert _SPEC is not None and _SPEC.loader is not None
container_ha = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(container_ha)


def test_authenticated_requests_use_bearer_header_without_putting_token_in_url(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    captured: dict[str, Any] = {}

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return None

        def read(self):
            return b"{}"

    def open_request(request, *, timeout: int):
        captured["url"] = request.full_url
        captured["authorization"] = request.get_header("Authorization")
        captured["timeout"] = timeout
        return Response()

    monkeypatch.setattr(container_ha, "urlopen", open_request)

    client._request_json("GET", "/api/test", access_token="local-access")  # noqa: S106 - synthetic test token.

    assert captured == {
        "url": "http://127.0.0.1:8123/api/test",
        "authorization": "Bearer local-access",
        "timeout": 10,
    }


def test_fresh_onboarding_sends_bearer_auth_to_authenticated_http_steps(
    socket_enabled,
    tmp_path: Path,
) -> None:
    expected_access_token = "short-lived-access"  # noqa: S105 - synthetic test token.
    authenticated_paths: list[str] = []

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, _format: str, *_args: object) -> None:
            return

        def _reply(self, status: int, payload: object) -> None:
            body = json.dumps(payload).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:
            if self.path == "/api/onboarding":
                self._reply(
                    200,
                    [
                        {"step": "user", "done": False},
                        {"step": "core_config", "done": False},
                        {"step": "analytics", "done": False},
                        {"step": "integration", "done": False},
                    ],
                )
                return
            self._reply(404, {"error": "not found"})

        def do_POST(self) -> None:
            content_length = int(self.headers.get("Content-Length", "0"))
            self.rfile.read(content_length)
            if self.path == "/api/onboarding/users":
                self._reply(200, {"auth_code": "one-use-code"})
                return
            if self.path == "/auth/token":
                self._reply(
                    200,
                    {
                        "access_token": expected_access_token,
                        "refresh_token": "persistent-refresh",
                    },
                )
                return
            if self.path in {
                "/api/onboarding/core_config",
                "/api/onboarding/analytics",
                "/api/onboarding/integration",
            }:
                if self.headers.get("Authorization") != f"Bearer {expected_access_token}":
                    self._reply(401, {"error": "invalid bearer authentication"})
                    return
                authenticated_paths.append(self.path)
                self._reply(200, {})
                return
            self._reply(404, {"error": "not found"})

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever)
    thread.start()
    try:
        client = container_ha.ContainerHomeAssistant(
            f"http://127.0.0.1:{server.server_port}",
            tmp_path / "auth.json",
        )

        client.ensure_onboarding("developer", "local-password")
    finally:
        server.shutdown()
        thread.join(timeout=5)
        server.server_close()

    assert authenticated_paths == [
        "/api/onboarding/core_config",
        "/api/onboarding/analytics",
        "/api/onboarding/integration",
    ]


def test_authenticated_http_error_does_not_expose_access_token(
    monkeypatch,
    tmp_path: Path,
) -> None:
    access_token = "short-lived-access"  # noqa: S105 - synthetic test token.
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")

    def reject(request, *, timeout: int):
        body = BytesIO(f"rejected {request.get_header('Authorization')}".encode())
        raise HTTPError(request.full_url, 401, "unauthorised", request.headers, body)

    monkeypatch.setattr(container_ha, "urlopen", reject)

    with pytest.raises(container_ha.ContainerHomeAssistantHttpError) as error:
        client._request_json("POST", "/api/protected", json_data={}, access_token=access_token)

    assert access_token not in str(error.value)
    assert "<redacted>" in str(error.value)


def test_onboarding_persists_only_the_refresh_token_with_private_permissions(
    monkeypatch,
    tmp_path: Path,
) -> None:
    auth_file = tmp_path / "auth.json"
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", auth_file)
    calls: list[tuple[str, str, dict[str, object]]] = []

    def request(method: str, path: str, **kwargs):
        calls.append((method, path, kwargs))
        if path == "/api/onboarding":
            return [
                {"step": "user", "done": False},
                {"step": "core_config", "done": False},
                {"step": "analytics", "done": False},
                {"step": "integration", "done": False},
            ]
        if path == "/api/onboarding/users":
            return {"auth_code": "one-use-code"}
        if path == "/auth/token":
            return {
                "access_token": "short-lived-access",
                "refresh_token": "persistent-refresh",
            }
        return {}

    monkeypatch.setattr(client, "_request_json", request)

    assert client.ensure_onboarding("developer", "local-password") == "short-lived-access"
    assert json.loads(auth_file.read_text()) == {
        "client_id": "http://127.0.0.1:8123/",
        "refresh_token": "persistent-refresh",
    }
    assert stat.S_IMODE(auth_file.stat().st_mode) == 0o600
    assert [path for _, path, _ in calls] == [
        "/api/onboarding",
        "/api/onboarding/users",
        "/auth/token",
        "/api/onboarding/core_config",
        "/api/onboarding/analytics",
        "/api/onboarding/integration",
    ]


def test_already_onboarded_instance_treats_missing_onboarding_route_as_complete(
    monkeypatch,
    tmp_path: Path,
) -> None:
    auth_file = tmp_path / "auth.json"
    auth_file.write_text(
        json.dumps(
            {
                "client_id": "http://127.0.0.1:8123/",
                "refresh_token": "persistent-refresh",
            }
        )
    )
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", auth_file)
    calls: list[str] = []

    def request(_method: str, path: str, **_kwargs):
        calls.append(path)
        if path == "/api/onboarding":
            raise container_ha.ContainerHomeAssistantHttpError("GET", path, 404, "not found")
        return {"access_token": "refreshed-access"}

    monkeypatch.setattr(client, "_request_json", request)

    client.wait_ready(1)
    assert client.ensure_onboarding("", "") == "refreshed-access"
    assert calls == ["/api/onboarding", "/api/onboarding", "/auth/token"]


def test_first_onboarding_requires_local_credentials(monkeypatch, tmp_path: Path) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    monkeypatch.setattr(client, "_onboarding_status", lambda: {"user": False})

    with pytest.raises(container_ha.ContainerHomeAssistantError, match="HA_CONTAINER_USERNAME"):
        client.ensure_onboarding("", "")


async def test_config_entry_is_created_by_manual_flow_and_waited_until_loaded(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"
    api_calls: list[tuple[str, str, dict[str, object]]] = []

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": "isolated-entry",
                "domain": container_ha.DOMAIN,
                "title": "Govee H617A",
                "state": "loaded",
                "disabled_by": None,
            }
        ]

    async def config_flows(_access_token: str):
        return [
            {
                "handler": "other",
                "flow_id": "unrelated",
                "step_id": "bluetooth_confirm",
                "context": {
                    "source": "bluetooth",
                    "unique_id": "D0:35:34:AA:BB:CC",
                },
            }
        ]

    def request(method: str, path: str, **kwargs):
        api_calls.append((method, path, kwargs))
        if path == "/api/config/config_entries/flow":
            return {"type": "form", "flow_id": "flow-one", "step_id": "user"}
        return {"type": "create_entry", "result": {"entry_id": "isolated-entry"}}

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", config_flows)
    monkeypatch.setattr(client, "_request_json", request)

    entry = await client.ensure_config_entry(
        "access",
        address="d0-35-34-aa-bb-cc",
        model="H617A",
        entry_id_file=entry_id_file,
        timeout=1,
    )

    assert entry == {
        "entry_id": "isolated-entry",
        "title": "Govee H617A",
        "state": "loaded",
        "disabled_by": None,
    }
    assert api_calls[1][2]["json_data"] == {
        "address": "D0:35:34:AA:BB:CC",
        "model": "H617A",
    }
    assert "unique_id" not in entry
    assert entry_id_file.read_text() == "isolated-entry\n"


async def test_matching_bluetooth_discovery_flow_is_confirmed_before_manual_fallback(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"
    api_calls: list[tuple[str, str, dict[str, object]]] = []

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": "discovered-entry",
                "domain": container_ha.DOMAIN,
                "title": "Govee H617A",
                "state": "loaded",
                "disabled_by": None,
            }
        ]

    async def config_flows(_access_token: str):
        return [
            {
                "handler": container_ha.DOMAIN,
                "flow_id": "bluetooth-flow",
                "step_id": "bluetooth_confirm",
                "context": {
                    "source": "bluetooth",
                    "unique_id": "d0:35:34:aa:bb:cc",
                },
            }
        ]

    def request(method: str, path: str, **kwargs):
        api_calls.append((method, path, kwargs))
        return {"type": "create_entry", "result": {"entry_id": "discovered-entry"}}

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", config_flows)
    monkeypatch.setattr(client, "_request_json", request)

    entry = await client.ensure_config_entry(
        "access",
        address="D0:35:34:AA:BB:CC",
        model="H617A",
        entry_id_file=entry_id_file,
        timeout=1,
    )

    assert entry["entry_id"] == "discovered-entry"
    assert api_calls == [
        (
            "POST",
            "/api/config/config_entries/flow/bluetooth-flow",
            {"json_data": {}, "access_token": "access"},
        )
    ]


async def test_already_in_progress_manual_flow_reenumerates_and_confirms_discovery(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"
    flow_calls = 0
    api_paths: list[str] = []

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": "raced-entry",
                "domain": container_ha.DOMAIN,
                "state": "loaded",
                "disabled_by": None,
            }
        ]

    async def config_flows(_access_token: str):
        nonlocal flow_calls
        flow_calls += 1
        if flow_calls == 1:
            return []
        return [
            {
                "handler": container_ha.DOMAIN,
                "flow_id": "raced-bluetooth-flow",
                "step_id": "bluetooth_confirm",
                "context": {
                    "source": "bluetooth",
                    "unique_id": "D0:35:34:AA:BB:CC",
                },
            }
        ]

    def request(_method: str, path: str, **_kwargs):
        api_paths.append(path)
        if path == "/api/config/config_entries/flow":
            return {"type": "form", "flow_id": "manual-flow", "step_id": "user"}
        if path.endswith("/manual-flow"):
            return {"type": "abort", "reason": "already_in_progress"}
        return {"type": "create_entry", "result": {"entry_id": "raced-entry"}}

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", config_flows)
    monkeypatch.setattr(client, "_request_json", request)

    entry = await client.ensure_config_entry(
        "access",
        address="D0:35:34:AA:BB:CC",
        model="H617A",
        entry_id_file=entry_id_file,
        timeout=1,
    )

    assert entry["entry_id"] == "raced-entry"
    assert api_paths == [
        "/api/config/config_entries/flow",
        "/api/config/config_entries/flow/manual-flow",
        "/api/config/config_entries/flow/raced-bluetooth-flow",
    ]


async def test_setup_retry_persists_entry_id_and_next_run_reuses_it(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"
    state = "setup_retry"
    flow_calls = 0
    api_paths: list[str] = []

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": "selected-entry",
                "domain": container_ha.DOMAIN,
                "title": "Govee",
                "state": state,
                "disabled_by": None,
            }
        ]

    async def config_flows(_access_token: str):
        nonlocal flow_calls
        flow_calls += 1
        return []

    def request(_method: str, path: str, **_kwargs):
        api_paths.append(path)
        if path == "/api/config/config_entries/flow":
            return {"type": "form", "flow_id": "manual-flow", "step_id": "user"}
        return {"type": "create_entry", "result": {"entry_id": "selected-entry"}}

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", config_flows)
    monkeypatch.setattr(client, "_request_json", request)

    with pytest.raises(container_ha.ContainerHomeAssistantError, match="state='setup_retry'"):
        await client.ensure_config_entry(
            "access",
            address="D0:35:34:AA:BB:CC",
            model="H617A",
            entry_id_file=entry_id_file,
            timeout=0,
        )

    assert entry_id_file.read_text() == "selected-entry\n"
    assert stat.S_IMODE(entry_id_file.stat().st_mode) == 0o600
    assert flow_calls == 1
    assert api_paths == [
        "/api/config/config_entries/flow",
        "/api/config/config_entries/flow/manual-flow",
    ]

    state = "loaded"
    entry = await client.ensure_config_entry(
        "access",
        address="D0:35:34:AA:BB:CC",
        model="H617A",
        entry_id_file=entry_id_file,
        timeout=0,
    )

    assert entry["entry_id"] == "selected-entry"
    assert flow_calls == 1
    assert len(api_paths) == 2


async def test_already_configured_recovers_single_enabled_domain_entry(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": "existing-entry",
                "domain": container_ha.DOMAIN,
                "title": "Govee",
                "state": "loaded",
                "disabled_by": None,
            }
        ]

    async def config_flows(_access_token: str):
        return []

    def request(_method: str, path: str, **_kwargs):
        if path == "/api/config/config_entries/flow":
            return {"type": "form", "flow_id": "manual-flow", "step_id": "user"}
        return {"type": "abort", "reason": "already_configured"}

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", config_flows)
    monkeypatch.setattr(client, "_request_json", request)

    entry = await client.ensure_config_entry(
        "access",
        address="D0:35:34:AA:BB:CC",
        model="H617A",
        entry_id_file=entry_id_file,
        timeout=0,
    )

    assert entry["entry_id"] == "existing-entry"
    assert entry_id_file.read_text() == "existing-entry\n"


@pytest.mark.parametrize("entry_count", [0, 2])
async def test_already_configured_refuses_non_unique_enabled_domain_entry(
    monkeypatch,
    tmp_path: Path,
    entry_count: int,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": f"entry-{index}",
                "domain": container_ha.DOMAIN,
                "state": "loaded",
                "disabled_by": None,
            }
            for index in range(entry_count)
        ]

    async def config_flows(_access_token: str):
        return []

    def request(_method: str, path: str, **_kwargs):
        if path == "/api/config/config_entries/flow":
            return {"type": "form", "flow_id": "manual-flow", "step_id": "user"}
        return {"type": "abort", "reason": "already_configured"}

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", config_flows)
    monkeypatch.setattr(client, "_request_json", request)

    with pytest.raises(
        container_ha.ContainerHomeAssistantError,
        match=rf"requires exactly one enabled {container_ha.DOMAIN} entry; found {entry_count}",
    ):
        await client.ensure_config_entry(
            "access",
            address="D0:35:34:AA:BB:CC",
            model="H617A",
            entry_id_file=entry_id_file,
            timeout=0,
        )

    assert not entry_id_file.exists()


@pytest.mark.parametrize(
    ("domain", "disabled_by", "message"),
    [
        ("other", None, "does not belong"),
        (container_ha.DOMAIN, "user", "is disabled"),
    ],
)
async def test_persisted_entry_id_must_select_enabled_integration_entry(
    monkeypatch,
    tmp_path: Path,
    domain: str,
    disabled_by: str | None,
    message: str,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    entry_id_file = tmp_path / "entry-id"
    entry_id_file.write_text("selected-entry\n")

    async def config_entries(_access_token: str):
        return [
            {
                "entry_id": "selected-entry",
                "domain": domain,
                "state": "loaded",
                "disabled_by": disabled_by,
            }
        ]

    async def no_flows(_access_token: str):
        raise AssertionError("persisted entry validation must happen before flow enumeration")

    monkeypatch.setattr(client, "_config_entries", config_entries)
    monkeypatch.setattr(client, "_config_flows", no_flows)

    with pytest.raises(container_ha.ContainerHomeAssistantError, match=message):
        await client.ensure_config_entry(
            "access",
            address="D0:35:34:AA:BB:CC",
            model="H617A",
            entry_id_file=entry_id_file,
            timeout=0,
        )


async def test_config_entry_listing_is_filtered_by_integration_domain(
    monkeypatch,
    tmp_path: Path,
) -> None:
    client = container_ha.ContainerHomeAssistant("http://127.0.0.1:8123", tmp_path / "auth.json")
    call: tuple[str, str, dict[str, object]] | None = None

    async def websocket_result(access_token: str, message_type: str, **message: object):
        nonlocal call
        call = (access_token, message_type, message)
        return []

    monkeypatch.setattr(client, "_websocket_result", websocket_result)

    assert await client._config_entries("access") == []
    assert call == ("access", "config_entries/get", {"domain": container_ha.DOMAIN})


@pytest.mark.parametrize(
    "url",
    [
        "https://127.0.0.1:8123",
        "http://192.168.1.2:8123",
        "http://127.0.0.1:8123/prefix",
    ],
)
def test_container_api_rejects_non_local_base_urls(url: str, tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="local HTTP"):
        container_ha.ContainerHomeAssistant(url, tmp_path / "auth.json")
