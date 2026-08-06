#!/usr/bin/env bash
# provision_wifi.sh [device] -- write Wi-Fi credentials to a device over our own radio.
#
# Reads the network from STDIN as SSID, passphrase and an optional API URL:
#
#   printf '%s\n%s\n%s\n' "$SSID" "$PASSPHRASE" "$API" |
#     bash tools/harness/provision_wifi.sh dreamtv
#
# STDIN rather than arguments because argv is world-readable through /proc for the life of
# the process, so a passphrase on a command line leaks it to every account on the box.
#
# THIS WRITES PERSISTENT CONFIGURATION TO A DEVICE. Two things make that survivable. The
# encoder refuses to run unless it still reproduces all captured accepted shapes, and
# `wifi_provision.py compare` requires the new SSID, passphrase and API lengths to match one
# of them. The recovery path if it goes wrong is the vendor's physical reset, a ten second
# hold of the device's power button, because there is NO software clear-Wi-Fi on this model:
# opcodes 0x46 and 0x17 are both firmware-absent.
#
# Home Assistant owns the link by default and is released for the duration. The trap gives
# it back on every exit path, because a light nobody owns is worse than a failed experiment.
set -uo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"
resolve_device "${1:-$DEVICE_DEFAULT}"

[ -t 0 ] && {
  echo "read SSID and passphrase from stdin; API URL is an optional third line" >&2
  exit 2
}
network="$(cat)"

[ -n "$DEVICE_EXPECTED_PEER" ] || { echo "$DEVICE_NAME has no address to write to" >&2; exit 1; }
require_bluetooth_transport || exit 1

ha_released=0
give_link_back() {
  [ "$ha_released" = 1 ] || return
  echo "== handing the link back to Home Assistant"
  ha_entry "$DEVICE_ENTRY" enable >/dev/null 2>&1 ||
    echo "WARNING: could not re-enable $DEVICE_ENTRY" >&2
}
trap give_link_back EXIT

echo "== how this push differs from the sequence the firmware accepted"
printf '%s\n' "$network" |
  uv run --project "$REPO_DIR" --no-sync python "$REPO_DIR/tools/ble/wifi_provision.py" compare || exit 1

echo "== releasing the link from Home Assistant"
ha_entry "$DEVICE_ENTRY" disable | grep -qi '"success": true' || {
  echo "HA did not release the entry" >&2; exit 1; }
ha_released=1
sleep 4

# The only honest test that a link is free is to read a frame back off it.
echo "== confirming the link is free"
ble_link_is_free "$DEVICE_EXPECTED_PEER" || {
  echo "no read-back from $DEVICE_EXPECTED_PEER; something still holds the link" >&2; exit 1; }

# Expect a1 11 00 within milliseconds (frames accepted) and ee 11 <status> after about
# eleven seconds. A non-zero a1 11 is a framing rejection and silence is the watchdog, so
# listen well past both rather than concluding from the absence of a reply.
echo "== writing the provisioning sequence"
printf '%s\n' "$network" |
  uv run --project "$REPO_DIR" --no-sync python "$REPO_DIR/tools/ble/wifi_provision.py" build |
  govee_send send - --address "$DEVICE_EXPECTED_PEER" --gap 0.3 --listen 40

echo "== VERIFY INDEPENDENTLY. ee 11 00 is the device's own claim; confirm what it actually"
echo "   joined from the network side before believing it."
