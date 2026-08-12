"""Compatibility hooks for the disposable Home Assistant Container."""

from __future__ import annotations

import os
from functools import wraps
from typing import Any

_BARE_AUTH_ENV = "HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH"
_PATCH_MARKER = "_ha_govee_led_ble_bare_external_auth"


def _patch_dbus_fast_default_auth() -> None:
    if os.environ.get(_BARE_AUTH_ENV) != "1":
        return

    from dbus_fast.aio import MessageBus
    from dbus_fast.auth import UID_NOT_SPECIFIED, AuthExternal
    from dbus_fast.constants import BusType

    original_init = MessageBus.__init__
    if getattr(original_init, _PATCH_MARKER, False):
        return

    @wraps(original_init)
    def patched_init(
        self: Any,
        bus_address: str | None = None,
        bus_type: Any = BusType.SESSION,
        auth: Any = None,
        negotiate_unix_fd: bool = False,
    ) -> None:
        if auth is None:
            auth = AuthExternal(UID_NOT_SPECIFIED)
        original_init(
            self,
            bus_address=bus_address,
            bus_type=bus_type,
            auth=auth,
            negotiate_unix_fd=negotiate_unix_fd,
        )

    setattr(patched_init, _PATCH_MARKER, True)
    message_bus_class: Any = MessageBus
    message_bus_class.__init__ = patched_init


_patch_dbus_fast_default_auth()
