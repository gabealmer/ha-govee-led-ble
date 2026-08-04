"""Exercise WDA's native userspace RSD selection without a device."""

import asyncio
import importlib
import sys
from types import ModuleType
from unittest.mock import AsyncMock


def test_userspace_backend_keeps_wda_on_the_native_usbmux_owner(monkeypatch):
    monkeypatch.setenv("PHONE_UDID", "00008140-AAAABBBBCCCCDDDD")
    monkeypatch.setenv("WDA_RUNNER_BUNDLE_ID", "com.example.WebDriverAgentRunner.xctrunner")
    monkeypatch.setenv("HARNESS_RSD_BACKEND", "userspace")

    opened: list[str] = []
    rsd = object()

    class FakeUserspaceRsdTunnel:
        def __init__(self, serial: str):
            opened.append(serial)

        async def __aenter__(self):
            return rsd

        async def __aexit__(self, exc_type, exc_value, traceback):
            return None

    pmd3 = ModuleType("pymobiledevice3")
    remote = ModuleType("pymobiledevice3.remote")
    userspace = ModuleType("pymobiledevice3.remote.userspace_tunnel")
    userspace.UserspaceRsdTunnel = FakeUserspaceRsdTunnel
    monkeypatch.setitem(sys.modules, "pymobiledevice3", pmd3)
    monkeypatch.setitem(sys.modules, "pymobiledevice3.remote", remote)
    monkeypatch.setitem(sys.modules, "pymobiledevice3.remote.userspace_tunnel", userspace)

    daemon = importlib.import_module("tools.harness.wda_daemon")
    daemon = importlib.reload(daemon)
    daemon._run = AsyncMock(return_value=0)

    assert asyncio.run(daemon.main()) == 0
    assert opened == ["00008140-AAAABBBBCCCCDDDD"]
    daemon._run.assert_awaited_once_with(rsd)
