#!/usr/bin/env bash
# One step of the loop: act, settle, screenshot, and show the BLE frames in between.
#
#   act.sh <label> name 'element name' the element's accessibility name; PREFER THIS
#   act.sh <label> slide 'track name' FROM TO   drag along that element, as 0..1 fractions
#   act.sh <label> point X Y           WDA POINTS off an element's rect; last resort
#   act.sh <label> swipe X1 Y1 X2 Y2   WDA POINTS; unnamed slider tracks, and scrolling
#   act.sh <label> tap  X Y            small-screenshot pixels, read off the CURRENT shot
#   act.sh <label> drag X1 Y1 X2 Y2
#   act.sh <label> wait                no gesture, just observe
#   act.sh shot [label]
#
# Prefer named gestures because they fail when a target is absent or ambiguous. Pixel
# coordinates are a last resort and must be measured from the current screenshot; a
# successful HID response does not prove the phone applied the gesture.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"
# Reconstruct the running session's ownership and transport rather than inheriting ambient
# host defaults. act.sh takes no device argument, so it adopts the active session.
resolve_device "$(harness_running_session_device || echo "$DEVICE_DEFAULT")"

SETTLE_SECONDS="${SETTLE_SECONDS:-3}"
[ "${1:-}" = shot ] && { shot "${2:-shot}"; exit 0; }

label="${1:?label required}"; gesture="${2:?name|slide|point|swipe|tap|drag|wait required}"; shift 2

deliver() {
  case "$gesture" in
    name)  wda tap "$1" ;;
    slide) wda slide "$1" --from "$2" --to "$3" ;;
    point) wda point "$1 $2" ;;
    swipe) wda swipe "$1 $2 $3 $4" ;;
    tap)  # shellcheck disable=SC2046
          tap $(to_gesture_space "$1" "$2") ;;
    drag) # shellcheck disable=SC2046
          drag $(to_gesture_space "$1" "$2" "$3" "$4") ;;
    wait) ;;
    *)    echo "unknown gesture '$gesture'" >&2; exit 2 ;;
  esac
}

# Ignore the status bar and count only pixels beyond a quantisation step. The 1% threshold
# separates observed missed gestures from page navigation.
changed_fraction() {
  uv run --no-sync --project "$REPO_DIR" python -c "
from PIL import Image; import numpy as np, sys
a, b = (np.asarray(Image.open(p).convert('L'), dtype=int) for p in sys.argv[1:3])
print('1.0' if a.shape != b.shape else '%.4f' % (np.abs(a[int(a.shape[0] * 0.06):] - b[int(a.shape[0] * 0.06):]) > 25).mean())" "$1" "$2"
}

# Narrow to the bound peer because a phone capture can contain several Govee connections.
ble_since_mark() {
  local name; name="$(current_capture_name)"
  [ -n "$name" ] || { echo "(no capture running)"; return; }
  local narrow=()
  [ -n "${DEVICE_EXPECTED_PEER:-}" ] && narrow=(--source "$DEVICE_EXPECTED_PEER")
  uv run --project "$REPO_DIR" python "$REPO_DIR/tools/ble/analyse_capture.py" "$name" \
    "${narrow[@]}" 2>&1 | sed -n "/$label/,\$p"
}

# Delivery requires a screen change or attributable BLE traffic. A miss may also mean the
# target is obscured, so pixel gestures are re-measured before blaming the injector.
delivered() {
  [ "$(python3 -c "print(1 if $1 >= 0.01 else 0)")" = 1 ] && return 0
  grep -qE '^[[:space:]]+(33-write|a3 body|aa reply) ' <<<"$2"
}

capture mark "$label" >/dev/null
before=""; [ "$gesture" = wait ] || before="$(shot "$label-before")"
deliver "$@"
sleep "$SETTLE_SECONDS"
after="$(shot "$label")"
ble="$(ble_since_mark)"
fraction=1.0; [ -z "$before" ] || fraction="$(changed_fraction "$before" "$after")"

# A lock-screen transition is a large diff but not delivered input.
require_unlocked "$after" || { echo "   nothing landed, and the diff above is meaningless" >&2; exit 1; }

if [ "$gesture" != wait ] && ! delivered "$fraction" "$ble"; then
  echo "   nothing changed (diff $fraction, no BLE); resending once" >&2
  # Refresh only the pixel-delivery path; named gestures use WDA directly.
  case "$gesture" in name|slide|point|swipe) ;; *) hid_down; sleep 2; hid_up ;; esac
  deliver "$@"; sleep "$SETTLE_SECONDS"
  after="$(shot "$label-retry")"; ble="$(ble_since_mark)"
  fraction="$(changed_fraction "$before" "$after")"
  delivered "$fraction" "$ble" ||
    echo "WARNING: still nothing (diff $fraction). Re-measure the control off THIS screenshot and check the action bar is not covering it before blaming the injector." >&2
fi

echo "screenshot: $after"
echo "--- BLE since '$label' ---"
printf '%s\n' "$ble"
