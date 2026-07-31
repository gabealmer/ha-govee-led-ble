#!/usr/bin/env bash
# up.sh {app|direct} [device] -- take the device's BLE link and stand the harness up.
#
#   app     the phone drives and we sniff: gesture session + Govee app + HCI capture
#   direct  we drive over BLE with govee_send.py: no phone involved at all
#
# Set HARNESS_PREDICTION_SHA to the SHA-256 of the probe's registered prediction and it is
# recorded in the capture's meta.json. A session capture is where a prediction has to be
# bound, because the capture IS the evidence the prediction is judged against; without this
# every app-mode probe silently records prediction_sha256: null.
#
# Both release the Home Assistant entry first, because a Govee device has one BLE link and
# HA holds it by default. Direct mode touches no phone service, so it runs headless.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"

mode="${1:?app|direct required}"
resolve_device "${2:-$DEVICE_DEFAULT}"
case "$mode" in app|direct) ;; *) echo "mode must be app or direct" >&2; exit 2 ;; esac

# Phone-side setup runs BEFORE Home Assistant is touched, so a failure here leaves the entry
# enabled rather than stranding the device with nobody holding its link.
if [ "$mode" = app ]; then
  # First, because everything below it depends on the phone being reachable and each of
  # them reports its absence as a failure of something else.
  require_phone || exit 1
  tunnel_up
  pmd3 mounter auto-mount >/dev/null 2>&1 || true
  # The one state that fails SILENTLY: a locked phone serves screenshots and capture while
  # backboardd drops every gesture. Everything else here fails loudly on its own.
  require_unlocked || exit 1
  hid_up
else
  [ -n "$DEVICE_ADDRESS" ] || { echo "$DEVICE_NAME has no address; direct mode is H617A only" >&2; exit 1; }
fi

echo "== releasing BLE from Home Assistant ($DEVICE_NAME / $DEVICE_SKU)"
ha_entry "$DEVICE_ENTRY" disable | grep -qi '"success": true' || { echo "HA did not release" >&2; exit 1; }

# From here the device has NO owner. A trap rather than a handler per exit, so a step added
# later cannot forget to give the link back, and serve-web (unauthenticated full control of
# the phone) never outlives a failed stand-up. The capture goes too: HARNESS_STATE_FILE is
# only written on success, so a later down.sh would default to direct mode and never stop
# it, leaving a stale .current that act.sh would mark against a file nothing is writing.
harness_is_up=0
trap '[ "$harness_is_up" = 1 ] || { ha_entry "$DEVICE_ENTRY" enable >/dev/null 2>&1; hid_down; capture stop >/dev/null 2>&1 || true; }' EXIT

if [ "$mode" = app ]; then
  # The preflight capture IS the session capture. govee-capture.sh refuses to start unless
  # the decoder reads frames out of it, which is the check that catches a missing Bluetooth
  # logging profile or a dead HCI stream; do not add a second, weaker copy here.
  session_capture="session-$DEVICE_NAME-$(date +%Y%m%d-%H%M%S)"
  capture start "$session_capture" "${HARNESS_PREDICTION_SHA:--}" >/dev/null
  restart_govee_app
  [ -n "$(govee_app_pid)" ] || { echo "Govee app did not start" >&2; exit 1; }
  echo "== up: capture '$session_capture', app running, gestures at $(serve_web_url)"
else
  ble_link_is_free "$DEVICE_ADDRESS" || { echo "no read-back from $DEVICE_ADDRESS; something holds the link" >&2; exit 1; }
  echo "== up: host owns the link to $DEVICE_ADDRESS ($DEVICE_SKU)"
fi

printf '%s %s %s\n' "$mode" "$DEVICE_NAME" "$DEVICE_ENTRY" > "$HARNESS_STATE_FILE"
harness_is_up=1
[ "$mode" = app ] && shot "up-$DEVICE_NAME"
exit 0
