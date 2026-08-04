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
# `name` and `slide` are the gestures to reach for first, and the pixel forms are the
# fallback. wda.py exists because coordinates go stale without warning - a promotional
# banner appeared mid-session once and moved every tile 145 pixels - and for most of this
# script's life the loop that records evidence could not use it, so every survey went back
# to pixels and inherited that failure. A named gesture also fails LOUDLY when the name is
# absent or ambiguous, where a stale coordinate lands on whatever is now underneath it.
#
# The pixel forms are additionally UNRELIABLE, not merely brittle. On 2026-08-04 `drag`
# moved the video Relative Brightness slider not at all while `slide` moved it 50% -> 100%
# on the same control seconds later, and /touch returned 200 throughout: a 200 means the
# report was dispatched, not that backboardd honoured it.
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"
# Sourcing phone.sh is NOT enough to describe the rig. resolve_device is what reconstructs a
# running session's ownership, and without it this script silently used the ambient WSL
# defaults: dvt then talked to the wrong usbmux and every screenshot failed with "DDI
# mounted?", while WDA, which needs none of that, kept working and made it look like a
# screenshot problem. act.sh takes no device argument, so it adopts whichever session is up.
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

# Two things make a naive diff useless: the status-bar clock ticks every minute, and tiles
# update as devices come and go. Both are excluded by dropping the status bar and counting
# only pixels that move past a quantisation step. Measured: a tap that did not land scores
# 0.0000, a page navigation 0.26 to 0.28, so the 1% threshold sits far from both.
changed_fraction() {
  uv run --no-sync --project "$REPO_DIR" python -c "
from PIL import Image; import numpy as np, sys
a, b = (np.asarray(Image.open(p).convert('L'), dtype=int) for p in sys.argv[1:3])
print('1.0' if a.shape != b.shape else '%.4f' % (np.abs(a[int(a.shape[0] * 0.06):] - b[int(a.shape[0] * 0.06):]) > 25).mean())" "$1" "$2"
}

ble_since_mark() {
  local name; name="$(current_capture_name)"
  [ -n "$name" ] || { echo "(no capture running)"; return; }
  uv run --project "$REPO_DIR" python "$REPO_DIR/tools/ble/analyse_capture.py" "$name" 2>&1 | sed -n "/$label/,\$p"
}

# Delivered by a screen change OR by BLE traffic. A screen diff alone is NOT evidence of
# failure: an Apply button whose whole effect is on the strip changes nothing on screen, and
# calling that a miss costs a manual round trip. Equally, a miss is not proof of an injector
# fault: a control hidden behind the floating action bar legitimately changes nothing, and
# both were misread that way on 2026-07-28. Re-measure off the CURRENT screenshot first.
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

# Checked BEFORE the diff is trusted: the app-to-lock-screen transition is a LARGE screen
# change, so a diff-only check scores a locked phone as DELIVERED. That false positive cost
# a wrong conclusion on 2026-07-28, and retrying cannot help because HID is refused while
# locked and the screen cannot be unlocked over HID either.
require_unlocked "$after" || { echo "   nothing landed, and the diff above is meaningless" >&2; exit 1; }

if [ "$gesture" != wait ] && ! delivered "$fraction" "$ble"; then
  echo "   nothing changed (diff $fraction, no BLE); resending once" >&2
  # Only the pixel path has a client to refresh. A named gesture is delivered by WDA, so
  # cycling serve-web there would restart a component that was never in the path and
  # report its restart as the remedy.
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
