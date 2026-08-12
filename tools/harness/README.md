# BLE harness hosts

The harness uses the same Bash entry points on the Hippoxmox AI lab and on WSL:

```bash
bash tools/harness/up.sh app
bash tools/harness/act.sh ...
bash tools/harness/down.sh
```

Run `tools/harness/preflight.sh app` or `tools/harness/preflight.sh direct` before taking a
device link when setting up a host.

## Isolated Home Assistant Container

`container.sh` runs a separate [Home Assistant Container](https://www.home-assistant.io/installation/linux#install-home-assistant-container) through Podman.  It does not deploy to, restart or otherwise repurpose the household Home Assistant instance.

The household config entry remains the normal BLE owner.  `up` verifies that entry is loaded and enabled, verifies Podman plus `org.bluez`, pulls and inspects the pinned image, and runs Home Assistant's `bluetooth_adapters.dbus.get_bluetooth_adapter_details()` inside that image with the final D-Bus mounts and environment.  In proxied mode it also probes `PF_BLUETOOTH` before changing ownership.  These image-level authentication and adapter checks must pass before the household entry is disabled.  Once Home Assistant confirms `state: not_loaded` with `disabled_by: user`, the active rollback trap protects ownership while portable mode runs a bounded direct `BleakScanner.find_device_by_address()` discovery.  A single-link light cannot be required to advertise while household Home Assistant still holds its connection.  The address is supplied through protected standard input and is not placed in process arguments or output.  Cache mode skips this direct scan.  The long-running isolated container starts only after the scan succeeds, and a scan failure restores household ownership.  The scan does not connect; the isolated coordinator's first refresh validates the connection path.  `require_restart` is refused.  A failed start stops the container and restores the household entry.  `down` stops the container and Vite first, then enables and polls the recorded household entry.  A failed restore retains retryable ownership state rather than reporting the rig as down.

The container image is pinned to the Home Assistant version used by this repository's test environment.  It uses host networking and a read-only D-Bus socket-directory mount without `--privileged`; host BlueZ retains controller ownership.  Ordinary Linux mounts `/run/dbus` and uses its system bus directly.  A host using the existing `WITH_HOST_BLUETOOTH` convention resolves the wrapper's D-Bus address and Bleak authentication UID, preflights `org.bluez` through that wrapper, mounts the resolved directory at the same container path, and passes the matching environment to Home Assistant.

Proxied mode also mounts `container_python/sitecustomize.py` and enables it with an isolated-container flag.  The compatibility hook supplies dbus-fast's `AuthExternal(UID_NOT_SPECIFIED)` only when a caller omits an authenticator, which emits the [D-Bus bare `AUTH EXTERNAL` exchange](https://dbus.freedesktop.org/doc/dbus-specification.html#auth-protocol).  Bleak continues to receive `BLEAK_DBUS_AUTH_UID=-1` explicitly.  The hook is absent on direct Linux and cannot affect the production integration or household Home Assistant.

When the proxied image can authenticate to BlueZ but its `PF_BLUETOOTH` probe fails, the harness passes `HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK=1` to the disposable container.  The integration still checks Home Assistant's Bluetooth cache first.  A cached device whose source has a registered Home Assistant scanner keeps the wrapped client and slot management.  A stale cached device with no registered source scanner is reused without another scan and receives the original unwrapped client.  A cache miss uses `habluetooth`'s original scanner and tags that result for the same original client.  The variable accepts exactly `1`; every other configured value is rejected.  `container.sh` owns this switch and never passes it to ordinary Linux containers.  It exists only for this isolated nested LXC/Proxmox development topology and is not a production deployment recommendation.

The integration directory is bind-mounted read-only, while Home Assistant configuration, onboarding credentials, refresh tokens and config-entry state persist under the gitignored `.harness/ha-container/devices/<device>/` directory.  The HTTP listener defaults to `127.0.0.1:8123` to avoid exposing an unfinished onboarding flow on the LAN.  Readiness handles both first onboarding and later boots where Home Assistant removes the onboarding route.

Configure these values in the untracked `devices.local.env`:

- `HA_CONTAINER_USERNAME` and `HA_CONTAINER_PASSWORD` for the isolated administrator only.
- `DEVICE_HA_CONTAINER_ADDRESS[<device>]` when a sniff-only device needs explicit container access.  Devices already present in `DEVICE_BLE_ADDRESS` are eligible without another address.
- Optionally, `HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL=http://127.0.0.1:5173/src/panel.ts` for live frontend development.
- Optionally, `HA_CONTAINER_FRONTEND_ORIGIN` when the browser opens isolated Home Assistant through another local address.  Vite grants CORS only to this exact origin.
- Optionally, `HA_CONTAINER_PODMAN_COMMAND=(sudo -n /usr/bin/podman)` for an explicitly approved rootful fallback.  It must be a Bash indexed array; command strings and runtime evaluation are not accepted.

No household token is copied into container state.  Household API access continues through `ha.sh` and Bitwarden Secrets Manager.  Generated Home Assistant refresh tokens stay in the ignored per-device state, while short-lived access tokens are sent only through HTTP or WebSocket authentication fields.  Tokens are never passed in process arguments or included in HTTP error diagnostics.

Use one command surface for the lifecycle:

```bash
# Verify the handover plan without calling Podman or either Home Assistant API.
bash tools/harness/container.sh --dry-run up strip

# Optional Vite development server.  Start this before up when the module URL is set.
bash tools/harness/container.sh frontend strip

# Transfer BLE ownership and automate onboarding plus config-entry creation.
bash tools/harness/container.sh up strip
bash tools/harness/container.sh status strip

# Reload bind-mounted Python after backend changes.
bash tools/harness/container.sh restart strip

# Stop isolated processes, then restore and poll household ownership.
bash tools/harness/container.sh down strip
```

Dry-run output includes the selected transport and container arguments but redacts the
household config-entry ID and device address.

Vite serves only the `frontend/` tree, with HMR and an exact Home Assistant origin, so frontend edits do not rebuild committed assets or expose repository configuration.  The integration accepts the external module only when the development environment variable is present, the URL uses local HTTP with an explicit port, and the path names a JavaScript or TypeScript module.  A malformed value degrades to the committed safe module.  Production module selection and `trust_external: false` remain unchanged when the variable is absent.

`status` reports the selected owner, household entry state, container running state, health and the isolated config entry.  It reports a conflict explicitly if both Home Assistant instances appear active.  Container presence and runtime inspection are tri-state: Podman errors are reported as unknown rather than absent or stopped.  `down` and rollback restore household ownership only after Podman confirms the isolated container is stopped or absent; uncertainty retains `container-stop-failed`, leaves the household entry disabled, and requires `down` after Podman access is restored.  Rollback ignores further termination signals while it performs this sequence.

Rootless Podman inside a nested user namespace can fail before it creates a runtime namespace.  This is a pre-handover failure: the household entry remains enabled.  Do not change host subuid mappings for the harness; run it on the lab host or configure the reviewed command-array prefix instead.

### Container workflow contract

Without the development module variable, the bind-mounted integration registers the production `editor-loader.js`, which selects the manifest-pinned bootstrap from the same integration tree.  The process setup test exercises that panel registration together with the real editor WebSocket commands, Home Assistant storage repositories, committed scene catalogue and a real `GoveeBLECoordinator` instance.

`frontend`, `up` and `restart` share `.harness/ha-container/`.  Vite is a separate transient process, while Home Assistant keeps one per-device `/config` directory across container restarts.  `restart` does not recreate the container or rewrite its storage; `down` removes the container and Vite process but retains the ignored development configuration for the next session.

The per-device config-entry ID is written as soon as Home Assistant creates the entry, before the harness waits for `loaded`.  A later `up` validates and resumes that exact enabled integration entry after `setup_retry`.  If an older config has no recorded ID and the flow reports `already_configured`, recovery succeeds only when the isolated Home Assistant config contains exactly one enabled `ha_govee_led_ble` entry.

The non-hardware workflow is covered by:

```bash
TMPDIR="$PWD/.harness/test-tmp" uv run --no-sync pytest \
  tests/test_editor_panel.py \
  tests/test_harness_container.py \
  tests/test_harness_container_sitecustomize.py \
  tests/test_harness_container_ha.py -q
```

When PacketLogger is unavailable, UI automation can still be used without claiming the run
is capture evidence:

```bash
bash tools/harness/up.sh ui
source tools/harness/phone.sh
wda list
wda tap "RGBIC Strip Lights"
bash tools/harness/down.sh
```

## WSL

WSL runs the Bash orchestration, analysis and tests, and owns the phone natively.

`up.sh app` deliberately changes USB ownership. It first detaches any stale WSL attachment,
force-binds the iPhone found by `05ac:12a8`, resolves its BUSID again after re-enumeration, then
attaches it to WSL. Native usbmuxd, WDA and `idevicebtlogger -f pcap` then share that one USB
connection. WDA and serve-web use their own in-process userspace RSD tunnels through
CoreDeviceProxy, not native `tunneld`, so they do not rely on rediscovery after USB/IP changes.
The force-bind and unbind use UAC. `down.sh` stops those native services, detaches and unbinds
the phone, so Windows tooling can use it again. BUSIDs are never configured.

Direct BLE also runs natively here, once a controller is attached the same way the phone is:

```bash
usbipd.exe list                       # find the radio, e.g. 0a12:0001
usbipd.exe attach --wsl --busid <id>  # it appears as hci0; Windows loses it until detached
```

`require_bluetooth_transport` checks for `/sys/class/bluetooth/hci*`, so a radio that is
merely *Shared* in usbipd and not *Attached* reads as no controller at all. That is the usual
cause of "no Bluetooth controller is attached to WSL" while a dongle is plainly plugged in.

### A session's environment is derived, not inherited

`resolve_device` computes `HARNESS_STATE_FILE` and `HARNESS_RUN_DIR` from the device name and
adopts the ownership a running session recorded, then re-derives everything that follows:
the usbmux socket address, the capture backend and which `pymobiledevice3` to use. **Call it
before any capture, `dvt` or teardown command**, because sourcing `phone.sh` alone leaves the
ambient WSL defaults in place and those describe a different rig.

This is not a nicety. `HARNESS_PHONE_BACKEND` defaults to `windows` on WSL and an app session
is `native`, so a shell that skipped it silently chose the pymobiledevice3 capture backend,
which cannot reach a natively-owned phone and records an empty file; `down.sh` read no state,
concluded `direct`, and tore down an app session without stopping its capture or releasing
the phone.

`USBMUXD_SOCKET_ADDRESS` matters for the same reason and is easy to misread. pymobiledevice3
ships a WSL class whose usbmux address is the *Windows* iTunes TCP endpoint, so without that
variable every call reports "Failed to connect to usbmuxd socket" while the daemon is running,
holds the phone and answers a hand-written `ListDevices` perfectly well. Do not go looking at
usbmuxd when you see that message; check the variable.

Install [Apple’s signed Bluetooth logging profile](https://secure-appldnld.apple.com/iOSProfiles/BluetoothLogging.mobileconfig)
once. Its UUID is `D8A1D847-C161-4D0A-9426-FB9C3E48297D`; do not use the retired third-party mirror.

## Attributing a capture

A phone here is paired with several Govee devices, and frames on a BLE connection that was
already open when recording started carry **no address at all**. The decoder counts those
separately and refuses to attribute them, so a capture taken over a live connection proves
nothing about which light it is of.

The fix is to make the connection happen *inside* the capture window. Killing the app is one
way, but not the only one and not the easiest: **re-activating the app through WDA after it
has been backgrounded is enough**, because backgrounding drops the link and activation
rebuilds it. Start the capture, put something else in front of the app (or simply drop the
cached WDA session so the next call re-activates it), then navigate. Two captures taken that
way on 2026-08-04 came back 50/50 and 62-of-108 attributed with no kill involved.

Check it rather than assume it. `govee-capture.sh stop` compares the capture against the
device it was supposed to be of and fails when none of its frames are there. A session with
no bound device is checked against the weaker thing that is still true of it: that the
capture holds ONE BLE connection's worth of Govee traffic, since a phone paired with the
whole house records several. Decoding without `--allow-unattributed` will refuse a capture
that is mostly unaddressed, and that flag never lets two connections be read as one.

## Writing Wi-Fi credentials to a device

`tools/harness/provision_wifi.sh` writes a network to a device over our own radio, reading the
SSID and passphrase from stdin so neither reaches argv. The wire structure it produces is owned
by the Kaitai specs, not by prose; what follows is only the method.

There is **no software way to clear a device's stored Wi-Fi** on this model. The vendor app's
own clear-Wi-Fi opcode and the older provisioning-mode toggle are both absent from the
firmware, proven on hardware. The only reset is the vendor's physical one, a ten second hold
of the power button, and that is also the recovery path that makes everything here
non-bricking. Plan around overwriting the credentials, not clearing them.

Because a push is persistent and largely one-way, the safety argument is a **diff, not a
review**. We hold vendor-generated sequences at three, four and five data frames. The encoder
refuses to run unless it reproduces all three byte for byte, and `wifi_provision.py compare`
requires a new network's length-prefixed fields to match one captured case. A shape outside
that set is an extrapolation and is refused.

The device answers twice and the two mean different things. An acknowledgement arrives within
milliseconds and says only that the frames were structurally accepted; the outcome arrives
about eleven seconds later and says whether it joined. **Neither is evidence of what the
device actually did.** Confirm from the network side, against an identifier the device itself
reported, rather than trusting either the reply or the vendor app's own indicator: a
conclusion in this repo was once withdrawn for relying on that indicator.

Two behaviours worth knowing before planning a change. Credentials that fail are *attempted
and abandoned*, so the device returns to its stored network rather than ending up unconfigured;
a bad SSID is therefore not a lever on connectivity. And whether the device keeps one network
or a fallback list is **untested**, so removing a network it has committed to may or may not
strand it. Overwriting and then removing the device's route to the internet avoids depending
on that unknown.


## Hippoxmox

The AI lab receives the iPhone through Proxmox USB passthrough. Its BlueZ daemon remains on
the host and direct BLE commands use `with-host-bluetooth`. The host udev rule restarts the
guest usbmuxd service after an iPhone hotplug.

The isolated Home Assistant Container follows that same wrapper convention.  On this LXC,
the wrapper supplies `unix:path=/var/host-dbus/system_bus_socket` and
`BLEAK_DBUS_AUTH_UID=-1`; the harness mounts `/var/host-dbus` read-only and passes both
values into the container.  The pre-handover check confirms D-Bus authentication and hci0.
When the nested container's `PF_BLUETOOTH` probe fails, direct Bleak discovery runs only
after household ownership is released and before the isolated container starts.  No
operator-managed topology switch is required.
