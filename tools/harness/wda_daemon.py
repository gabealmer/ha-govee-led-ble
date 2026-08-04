"""Hold ONE WebDriverAgent runner alive so that driving the phone is not dominated by startup.

WHY. The pymobiledevice3 CLI starts an XCTest runner per command and cancels it on exit, so a
five-step interaction pays five runner starts at 30 to 60 seconds each. A probe run that way
burned fourteen starts in one evening and still could not separate two hypotheses, because
every question cost a minute and the app state reset underneath it.

WDA itself listens on a TCP port on the device for as long as the runner lives. So the runner
is started once here and held, and everything else talks plain HTTP through a usbmux port
forward. Queries then cost milliseconds, which is what makes it reasonable to re-read the
screen before every single action rather than caching what it looked like.

Run it in the background and stop it by killing the process; the runner dies with it, which is
deliberate. An XCTest runner left alive holds an automation session on the phone.
"""

from __future__ import annotations

import asyncio
import os
import sys

UDID = os.environ["PHONE_UDID"]
RUNNER_BUNDLE_ID = os.environ["WDA_RUNNER_BUNDLE_ID"]
WDA_PORT = 8100
# Upstream's helper hardcodes 30 seconds. That expired against a cold app and took the runner
# down with it, which reads as "WDA did not become reachable" rather than "not yet". The
# runner's own wait for its test configuration is 600 seconds, so 30 was never a considered
# limit.
STARTUP_TIMEOUT = 180.0


async def _run(rsd) -> int:
    from pymobiledevice3 import usbmux
    from pymobiledevice3.exceptions import ConnectionFailedError
    from pymobiledevice3.services.dvt.testmanaged.xcuitest import TestConfig, XCUITestService

    cfg = await TestConfig.create_for(rsd, runner_bundle_id=RUNNER_BUNDLE_ID)
    task = asyncio.create_task(XCUITestService(rsd).run(cfg), name="wda-xctrunner")
    loop = asyncio.get_running_loop()
    deadline = loop.time() + STARTUP_TIMEOUT
    while True:
        if task.done():
            task.result()
            print("the runner exited before WDA became reachable", file=sys.stderr)
            return 1
        if loop.time() >= deadline:
            task.cancel()
            print(f"WDA not reachable on {WDA_PORT} within {STARTUP_TIMEOUT}s", file=sys.stderr)
            return 1
        device = await usbmux.select_device(UDID)
        if device is None:
            task.cancel()
            print(f"{UDID} is not on usbmux", file=sys.stderr)
            return 1
        try:
            await device.connect(WDA_PORT)
        except ConnectionFailedError:
            await asyncio.sleep(0.5)
        else:
            break

    # The line the harness waits for. Printed only once WDA has actually answered its port,
    # so a caller that sees it can issue a request immediately.
    print("WDA-READY", flush=True)
    await task
    return 0


async def main() -> int:
    if os.environ.get("HARNESS_RSD_BACKEND") == "userspace":
        # USB/IP hands the phone to this Linux process. A shared tunneld cannot discover it
        # reliably, while CoreDeviceProxy opens directly over the native usbmuxd socket.
        from pymobiledevice3.remote.userspace_tunnel import UserspaceRsdTunnel

        async with UserspaceRsdTunnel(serial=UDID) as rsd:
            return await _run(rsd)

    from pymobiledevice3.tunneld.api import get_tunneld_device_by_udid

    rsd = await get_tunneld_device_by_udid(UDID)
    if rsd is None:
        print("no tunnel for this device; raise tunneld first", file=sys.stderr)
        return 1
    return await _run(rsd)


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
