# BLE harness hosts

The harness uses the same Bash entry points on the Hippoxmox AI lab and on WSL:

```bash
bash tools/harness/up.sh app
bash tools/harness/act.sh ...
bash tools/harness/down.sh
```

Run `tools/harness/preflight.sh app` or `tools/harness/preflight.sh direct` before taking a
device link when setting up a host.

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
