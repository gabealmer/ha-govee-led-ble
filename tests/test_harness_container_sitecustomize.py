import os
import subprocess
import sys
from pathlib import Path

_REPO = Path(__file__).parents[1]
_CONTAINER_PYTHON = _REPO / "tools" / "harness" / "container_python"
_AUTH_PROBE = """
import asyncio

from bleak.backends.bluezdbus.utils import get_dbus_authenticator
from dbus_fast.aio import MessageBus
from dbus_fast.auth import AuthExternal


async def main():
    for auth in (None, AuthExternal(42), get_dbus_authenticator()):
        bus = MessageBus(bus_address="unix:path=/nonexistent", auth=auth)
        print(bus._auth._authentication_start())


asyncio.run(main())
"""


def _probe_authentication(*, enable_patch: bool) -> list[str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(_CONTAINER_PYTHON)
    env["BLEAK_DBUS_AUTH_UID"] = "-1"
    if enable_patch:
        env["HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH"] = "1"
    else:
        env.pop("HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH", None)
    result = subprocess.run(  # noqa: S603
        [sys.executable, "-c", _AUTH_PROBE],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )
    return result.stdout.splitlines()


def test_proxy_patch_uses_bare_external_auth_without_overriding_explicit_auth() -> None:
    default_auth, explicit_auth, bleak_auth = _probe_authentication(enable_patch=True)

    assert default_auth == "AUTH EXTERNAL"
    assert explicit_auth == "AUTH EXTERNAL 3432"
    assert bleak_auth == "AUTH EXTERNAL"


def test_proxy_patch_is_inactive_without_explicit_harness_flag() -> None:
    default_auth, explicit_auth, bleak_auth = _probe_authentication(enable_patch=False)

    assert default_auth.startswith("AUTH EXTERNAL ")
    assert explicit_auth == "AUTH EXTERNAL 3432"
    assert bleak_auth == "AUTH EXTERNAL"
