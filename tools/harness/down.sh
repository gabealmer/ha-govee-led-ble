#!/usr/bin/env bash
# down.sh [device] -- give the BLE link back to Home Assistant.
#
# Phone teardown only runs for a mode that stood the phone up: pymobiledevice3 blocks for a
# long time against an absent phone, and handing the link back must not wait on one.
set -euo pipefail

# Read the per-device owner before sourcing phone.sh. The literal prefix avoids setting
# backend variables before phone.sh records which values the caller explicitly supplied.
state_file="${HARNESS_STATE_FILE:-}"
if [ -z "$state_file" ]; then
  if [ -n "${1:-}" ]; then
    state_file="/tmp/govee-harness-state-$1"
  else
    # No device named: adopt the session if exactly one is up, so the common case of a single
    # rig needs no argument. More than one is ambiguous and must be named explicitly.
    _candidates=(); for _f in /tmp/govee-harness-state-*; do [ -s "$_f" ] && _candidates+=("$_f"); done
    [ "${#_candidates[@]}" = 1 ] && state_file="${_candidates[0]}"
    unset _candidates _f
  fi
  state_file="${state_file:-/tmp/govee-harness-state}"
fi
state_mode=direct state_device="" state_phone_backend="" state_rsd_backend=""
[ -s "$state_file" ] &&
  read -r state_mode state_device _ state_phone_backend state_rsd_backend <"$state_file"

# Retain the native WSL owner for older three-field state files.
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
  # Capture failure cannot interrupt BLE ownership restoration, but remains a final error.
  if [ "$state_mode" = app ]; then
    capture_verdict="$(capture stop 2>&1 >/dev/null)" || capture_status=$?
  fi
  # Stop the phone's XCTest session before releasing USB ownership.
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
# Poll because the phone releases the single BLE link asynchronously. Home Assistant retries
# setup on its own backoff, so delayed loading must not skip the remaining teardown.
entry_state=""
for _ in $(seq 1 "${HA_ENTRY_ATTEMPTS:-6}"); do
  entry_state="$(ha_entry "$DEVICE_ENTRY" status)"
  grep -q '"state": "loaded"' <<<"$entry_state" && grep -q '"disabled_by": null' <<<"$entry_state" && break
  sleep "${HA_ENTRY_DELAY:-10}"
done
entry_ok=1
grep -q '"state": "loaded"' <<<"$entry_state" && grep -q '"disabled_by": null' <<<"$entry_state" || entry_ok=0

# Tunnel and USB teardown must not interrupt Home Assistant ownership restoration.
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
if [ "$entry_ok" = 1 ]; then
  echo "== down: $DEVICE_NAME entry loaded, disabled_by null"
else
  grep -E '"state"|"disabled_by"|"reason"' <<<"$entry_state" >&2
  echo "== down: the rig IS down and the phone is released, but the entry has not loaded yet." >&2
  echo "   Home Assistant retries on its own backoff. If it stays unreachable, something is" >&2
  echo "   still holding the light's one BLE link: check the phone's app is closed." >&2
  cleanup_status=1
fi

# Report unusable evidence only after ownership is restored.
if [ "${capture_status:-0}" = 3 ]; then
  echo "$capture_verdict" >&2
  echo "== down: the capture is NOT usable as evidence; the rig is down, so repeat the run" >&2
  exit 1
fi
[ "$cleanup_status" = 0 ] || exit 1
