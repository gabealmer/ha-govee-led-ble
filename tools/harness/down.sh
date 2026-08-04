#!/usr/bin/env bash
# down.sh [device] -- give the BLE link back to Home Assistant.
#
# Phone teardown only runs for a mode that stood the phone up: pymobiledevice3 blocks for a
# long time against an absent phone, and handing the link back must not wait on one.
set -euo pipefail

# The state has to be read BEFORE phone.sh is sourced (it selects the owner that stood the
# session up), but the path is per device, so it is derived from the argument here rather
# than waiting for resolve_device. Reading the unsuffixed default instead meant a teardown
# from any shell that had not run up.sh found nothing, fell through to `direct`, and left the
# capture running, WDA holding an XCTest session, serve-web listening and the USB attached.
#
# The prefix is spelled out rather than taken from HARNESS_STATE_PREFIX in devices.env, and
# that duplication is deliberate: sourcing devices.env here to get it would set
# HARNESS_PHONE_BACKEND, so when phone.sh sourced it again the *_EXPLICIT flags would record
# a caller pin that never happened. Keep the two in step by hand.
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
# Polled, and NOT fatal. The entry can only load once the light's single BLE link is free,
# and that happens when the phone drops it, which is asynchronous and can take tens of
# seconds: the app kill above is best-effort, and a phone that still holds the link reports
# "unreachable at setup" until it lets go. Home Assistant retries setup on its own backoff,
# so a not-yet-loaded entry here is a normal race and not a teardown failure.
#
# It used to `exit 1` on the first reading, which is the same ordering mistake this script
# already documents twice below: a step that can legitimately fail placed before steps that
# must always run. On 2026-08-04 it aborted teardown while the phone still held the link,
# leaving the session state file behind, so the next shell believed a session was up and the
# rig looked live when it was not.
entry_state=""
for _ in $(seq 1 "${HA_ENTRY_ATTEMPTS:-6}"); do
  entry_state="$(ha_entry "$DEVICE_ENTRY" status)"
  grep -q '"state": "loaded"' <<<"$entry_state" && grep -q '"disabled_by": null' <<<"$entry_state" && break
  sleep "${HA_ENTRY_DELAY:-10}"
done
entry_ok=1
grep -q '"state": "loaded"' <<<"$entry_state" && grep -q '"disabled_by": null' <<<"$entry_state" || entry_ok=0

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
if [ "$entry_ok" = 1 ]; then
  echo "== down: $DEVICE_NAME entry loaded, disabled_by null"
else
  grep -E '"state"|"disabled_by"|"reason"' <<<"$entry_state" >&2
  echo "== down: the rig IS down and the phone is released, but the entry has not loaded yet." >&2
  echo "   Home Assistant retries on its own backoff. If it stays unreachable, something is" >&2
  echo "   still holding the light's one BLE link: check the phone's app is closed." >&2
  cleanup_status=1
fi

# Last, so it cannot come between the device and its owner, and loud, so it cannot be the
# thing nobody read. A capture that holds none of the light's frames is a session to repeat.
if [ "${capture_status:-0}" = 3 ]; then
  echo "$capture_verdict" >&2
  echo "== down: the capture is NOT usable as evidence; the rig is down, so repeat the run" >&2
  exit 1
fi
[ "$cleanup_status" = 0 ] || exit 1
