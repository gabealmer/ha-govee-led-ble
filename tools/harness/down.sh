#!/usr/bin/env bash
# down.sh [device] -- give the BLE link back to Home Assistant.
#
# Phone teardown only runs for a mode that stood the phone up: pymobiledevice3 blocks for a
# long time against an absent phone, and handing the link back must not wait on one.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"

state_mode=direct state_device=""
[ -s "$HARNESS_STATE_FILE" ] && read -r state_mode state_device _ < "$HARNESS_STATE_FILE"
resolve_device "${1:-${state_device:-$DEVICE_DEFAULT}}"

# The app is closed first so it releases the link before HA reaches for it.
if [ "$state_mode" = app ]; then
  pmd3 developer dvt pkill "$GOVEE_APP_PROCESS" >/dev/null 2>&1 || true
  capture stop >/dev/null 2>&1 || true
  # WDA holds an XCTest automation session on the PHONE, so leaving it up is not merely an
  # idle process: the next session inherits a runner nobody started. This is the same leak
  # tunnel_down had, found the same way, by looking at what was still listening afterwards.
  wda_down
  hid_down
fi

ha_entry "$DEVICE_ENTRY" enable >/dev/null
entry_state="$(ha_entry "$DEVICE_ENTRY" status)"
grep -q '"state": "loaded"' <<<"$entry_state" && grep -q '"disabled_by": null' <<<"$entry_state" || {
  grep -E '"state"|"disabled_by"' <<<"$entry_state" >&2
  echo "entry did not come back cleanly" >&2; exit 1
}

# Only after the link is back, and never fatally: tunneld is root-owned and its stop needs
# passwordless sudo, so a failure here must not abort the script before the entry is handed
# over. Ordering it earlier under `set -e` would strand the device with nobody holding it.
if [ "$state_mode" = app ]; then
  tunnel_down || true
fi

rm -f "$HARNESS_STATE_FILE"
echo "== down: $DEVICE_NAME entry loaded, disabled_by null"
