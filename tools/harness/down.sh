#!/usr/bin/env bash
# down.sh [device] -- give the BLE link back to Home Assistant.
#
# Phone teardown only runs for a mode that stood the phone up: pymobiledevice3 blocks for a
# long time against an absent phone, and handing the link back must not wait on one.
set -euo pipefail

state_file="${HARNESS_STATE_FILE:-/tmp/govee-harness-state}"
state_mode=direct state_device="" state_phone_backend="" state_rsd_backend=""
[ -s "$state_file" ] &&
  read -r state_mode state_device _ state_phone_backend state_rsd_backend <"$state_file"

# The state selects the same owner that stood the session up BEFORE phone.sh is sourced.
# Older three-field state files were native app sessions on WSL too, so retain that migration
# path rather than handing their WDA process to the Windows backend during teardown.
if [ "$state_phone_backend" = native ]; then
  export HARNESS_PHONE_BACKEND=native
elif [ "$state_mode" = app ] &&
     { [ "${HARNESS_HOST_KIND:-}" = wsl ] ||
       { [ -z "${HARNESS_HOST_KIND:-}" ] && grep -qi microsoft /proc/sys/kernel/osrelease 2>/dev/null; }; }; then
  export HARNESS_PHONE_BACKEND=native
fi
[ -z "$state_rsd_backend" ] || export HARNESS_RSD_BACKEND="$state_rsd_backend"

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"
resolve_device "${1:-${state_device:-$DEVICE_DEFAULT}}"
cleanup_status=0

# The app is closed first so it releases the link before HA reaches for it.
capture_verdict=""
if [ "$state_mode" != direct ]; then
  dvt pkill "$GOVEE_APP_PROCESS" >/dev/null 2>&1 || true
  # Never fatal here, for the same reason tunnel_down is deferred below: the link has to go
  # back to HA whatever the capture turned out to be. But the result is not discarded either.
  # capture stop now judges whether the capture actually holds the light it was for, and a
  # session that captured nothing is the failure this whole teardown path used to hide.
  if [ "$state_mode" = app ]; then
    capture_verdict="$(capture stop 2>&1 >/dev/null)" || capture_status=$?
  fi
  # WDA holds an XCTest automation session on the PHONE, so leaving it up is not merely an
  # idle process: the next session inherits a runner nobody started. This is the same leak
  # tunnel_down had, found the same way, by looking at what was still listening afterwards.
  wda_down || {
    echo "WDA teardown failed; continuing so Home Assistant gets the light back" >&2
    cleanup_status=1
  }
  hid_down || {
    echo "serve-web teardown failed; continuing so Home Assistant gets the light back" >&2
    cleanup_status=1
  }
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
if [ "$state_mode" != direct ]; then
  if [ "$HARNESS_RSD_BACKEND" != userspace ]; then
    tunnel_down || true
  fi
  phone_usbipd_release || {
    echo "iPhone USB ownership teardown failed; Windows tooling may not see the phone" >&2
    cleanup_status=1
  }
fi

rm -f "$state_file"
echo "== down: $DEVICE_NAME entry loaded, disabled_by null"

# Last, so it cannot come between the device and its owner, and loud, so it cannot be the
# thing nobody read. A capture that holds none of the light's frames is a session to repeat.
if [ "${capture_status:-0}" = 3 ]; then
  echo "$capture_verdict" >&2
  echo "== down: the capture is NOT usable as evidence; the rig is down, so repeat the run" >&2
  exit 1
fi
[ "$cleanup_status" = 0 ] || exit 1
