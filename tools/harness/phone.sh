#!/usr/bin/env bash
# Phone, BLE and capture primitives. Sourced, not run.
#
# One native toolchain on one host: pymobiledevice3 over usbmux for the phone, the host
# D-Bus bus for the radio. Checks earn their place only by catching a SILENT failure;
# anything that merely predicts a loud one has been deleted, because the command's own
# error says it better and sooner.
set -uo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$HARNESS_DIR/../.." && pwd)"
source "$HARNESS_DIR/devices.env"
mkdir -p "$HARNESS_RUN_DIR" "$GOVEE_CAPTURE_DIR" "$GOVEE_SHOT_DIR"

# Resolved to an absolute path once. sudo applies secure_path, so root cannot see a binary
# that lives on the caller's PATH: tunneld failed with "nohup: failed to run command" until
# this was added, because pymobiledevice3 is installed per-user under ~/.local/bin.
PYMOBILEDEVICE3="$(command -v "$PYMOBILEDEVICE3" 2>/dev/null || echo "$PYMOBILEDEVICE3")"

pmd3() { "$PYMOBILEDEVICE3" "$@"; }

# ax.py needs the pymobiledevice3 LIBRARY, not just its CLI, and pymobiledevice3 is a uv
# tool rather than a dependency of this project, so the project venv cannot import it.
# Derived from the CLI's real path so this keeps working when the tool is upgraded or the
# install moves; a hardcoded interpreter would rot at the first `mise`/`uv tool` change.
pmd3_python() { echo "$(dirname "$(readlink -f "$PYMOBILEDEVICE3")")/python"; }

# Read the screen as NAMED elements. Needs no tunnel and no root: like BTPacketLogger the
# accessibility daemon is reachable over plain usbmux, so this works whether or not the
# app-driving half of the rig is up. See ax.py for why it does not tap.
ax() { "$(pmd3_python)" "$HARNESS_DIR/ax.py" "$@"; }

# Drive the phone by NAME through WebDriverAgent. See wda.py for why it never uses
# coordinates, and wda_daemon.py for why the runner is held rather than started per command.
#
# The daemon needs the pymobiledevice3 library and the tunnel; the client is plain HTTP
# through a usbmux forward and needs neither, so it runs on the project interpreter.
wda() { uv run --no-sync --project "$REPO_DIR" python "$HARNESS_DIR/wda.py" "$@"; }

wda_serving() { curl -sf --max-time 3 "http://127.0.0.1:$WDA_PORT/status" 2>/dev/null | grep -q '"ready"'; }
wda_up() {
  wda_serving && return 0
  tunnel_up || return 1
  "$(pmd3_python)" "$HARNESS_DIR/wda_daemon.py" >"$HARNESS_RUN_DIR/wda.log" 2>&1 &
  echo $! >"$(_pidfile wda)"
  # The forward is a separate process because the daemon holds the runner and must not be
  # restarted to re-establish a socket. Call the binary DIRECTLY, not through the pmd3
  # function: backgrounding a function records the subshell's pid, so the stop killed a
  # wrapper and left the real forward orphaned on the port while reporting success.
  "$PYMOBILEDEVICE3" usbmux forward "$WDA_PORT" "$WDA_PORT" >"$HARNESS_RUN_DIR/wda-forward.log" 2>&1 &
  echo $! >"$(_pidfile wda-forward)"
  for _ in $(seq 1 60); do sleep 2; wda_serving && return 0; done
  echo "WDA did not come up; see $HARNESS_RUN_DIR/wda.log" >&2; return 1
}
wda_down() { stop_service wda-forward; stop_service wda; }

# Background services are tracked by PID FILE, never by matching a command line: a pattern
# cannot tell our process from anyone else's, and matches nothing once an argument moves.
_pidfile() { echo "$HARNESS_RUN_DIR/$1.pid"; }
stop_service() {
  local pid file; file="$(_pidfile "$1")"; pid="$(cat "$file" 2>/dev/null)" || return 0
  rm -f "$file"
  [ -n "$pid" ] || return 0
  kill "$pid" 2>/dev/null || true
  # CONFIRM IT DIED. Removing the pid file was previously the whole of the stop, so a kill
  # that did nothing still read as a clean stop and the next run inherited the process.
  local i
  for i in 1 2 3 4 5 6 7 8 9 10; do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.5
  done
  kill -9 "$pid" 2>/dev/null || true
  sleep 0.5
  if kill -0 "$pid" 2>/dev/null; then
    echo "$1 (pid $pid) would not stop" >&2
    return 1
  fi
}

# Developer services (dvt, HID, screenshots) all need one shared RemoteXPC tunnel; it needs
# root for its TUN device. CAPTURE DOES NOT: BTPacketLogger is a lockdown service.
tunneld_serving() { curl -sf --max-time 3 "http://127.0.0.1:$TUNNELD_PORT" 2>/dev/null | grep -q tunnel-address; }
# Whether the daemon is LISTENING, which is a different question from whether it serves a
# device: tunneld answers {} with no phone attached, and conflating the two once made a
# failed stop report success.
tunneld_listening() { ss -ltnH "sport = :$TUNNELD_PORT" 2>/dev/null | grep -q LISTEN; }
tunnel_up() {
  tunneld_serving && return 0
  sudo -b nohup "$PYMOBILEDEVICE3" remote tunneld --protocol tcp >"$HARNESS_RUN_DIR/tunneld.log" 2>&1 </dev/null
  for _ in $(seq 1 25); do sleep 1; tunneld_serving && return 0; done
  echo "tunneld did not come up; see $HARNESS_RUN_DIR/tunneld.log" >&2; return 1
}
tunnel_down() {
  tunneld_listening || return 0
  local pid
  pid="$(sudo -n ss -ltnpH "sport = :$TUNNELD_PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)"
  [ -n "$pid" ] && sudo -n kill "$pid" 2>/dev/null
  for _ in $(seq 1 10); do sleep 1; tunneld_listening || return 0; done
  echo "tunneld still listening (pid ${pid:-unknown})" >&2; return 1
}

# The phone reaches us over the LAN, so this is the lab's routable address, not a loopback.
serve_web_url() { echo "http://$(harness_host_ip):$SERVE_WEB_PORT"; }
hid_alive() { curl -sf --max-time 3 -o /dev/null "$(serve_web_url)/viewer.js" 2>/dev/null; }

# ONE session per work block. Measured 2026-07-30: a session PER GESTURE degraded 9/16 ->
# 1/6 -> 1/8, because each one rebuilt the auth-gating media stream and backboardd silently
# drops every digitizer event while that stream is down. serve-web delivered 20/20.
hid_up() {
  hid_alive && return 0
  stop_service serve-web
  # "$PYMOBILEDEVICE3", never the pmd3 function: nohup execvp()s its argument and cannot
  # see a shell function, so a function here exits 127 instantly and every poll below then
  # burns its full timeout before reporting a failure that never happened.
  nohup "$PYMOBILEDEVICE3" developer core-device display serve-web --http-port "$SERVE_WEB_PORT" \
    >"$HARNESS_RUN_DIR/serve-web.log" 2>&1 & echo $! > "$(_pidfile serve-web)"
  for _ in $(seq 1 20); do sleep 2; hid_alive && return 0; done
  echo "serve-web did not come up; see $HARNESS_RUN_DIR/serve-web.log" >&2; return 1
}
hid_down() { stop_service serve-web; }

# A 200 means the report was dispatched, not that backboardd honoured it. act.sh judges.
touch_post() {
  curl -s --max-time 15 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d "{\"type\":\"$1\",\"x\":$2,\"y\":$3}" "$(serve_web_url)/touch"
}
tap() { [ "$(touch_post tap "$1" "$2")" = 200 ] || echo "   /touch refused tap $1 $2" >&2; }
drag() {
  local x1=$1 y1=$2 x2=$3 y2=$4 steps=${5:-14} i
  touch_post contact "$x1" "$y1" >/dev/null
  for i in $(seq 1 "$steps"); do
    touch_post contact "$(( x1 + (x2 - x1) * i / steps ))" "$(( y1 + (y2 - y1) * i / steps ))" >/dev/null
    sleep 0.025
  done
  touch_post release "$x2" "$y2" >/dev/null
}

# Small-screenshot pixels to the 0..65535 gesture space, per axis.
to_gesture_space() {
  python3 -c "
import sys
scale, width, height = $SHOT_SCALE, $PHONE_PANEL_WIDTH, $PHONE_PANEL_HEIGHT
print(' '.join(str(round(float(v) / scale / (width if i % 2 == 0 else height) * 65535))
               for i, v in enumerate(sys.argv[1:])))" "$@"
}

shot() {
  local name full small
  name="$(date +%Y%m%d-%H%M%S)-${1:-shot}"
  full="$GOVEE_SHOT_DIR/$name.png"; small="$GOVEE_SHOT_DIR/$name-small.png"
  pmd3 developer dvt screenshot "$full" >/dev/null 2>&1
  [ -s "$full" ] || { echo "screenshot failed; tunnel up and DDI mounted?" >&2; return 1; }
  uv run --no-sync --project "$REPO_DIR" python -c "
from PIL import Image; import sys
i = Image.open(sys.argv[1]); s = float(sys.argv[3])
i.resize((int(i.width * s), int(i.height * s)), Image.LANCZOS).save(sys.argv[2])" "$full" "$small" "$SHOT_SCALE"
  echo "$small"
}

# USB PRESENCE. Prints PRESENT, ABSENT or UNKNOWN. Read from sysfs, never from lsusb.
#
# `lsusb` IS NOT INSTALLED on this guest, and the way that was missed matters more than the
# fact. The check written was `lsusb 2>/dev/null | grep -i apple || echo "no apple device"`.
# stderr was discarded, so the "command not found" never appeared; the pipeline exits 1, and
# the `||` branch then PRINTED A CONCLUSION, "no apple device", for a branch reachable by the
# tool being absent. The false negative was believed and repeated into two hand-over
# documents. A fallback must never assert a finding on a path that a broken tool can reach.
#
# So this separates "cannot tell" from "not there" at every step, and matches the CONFIGURED
# phone rather than any Apple vendor id, because a second Apple device on the host would
# otherwise read as our phone being present.
#
# The tree read here is the HOST's, not this container's: the root hubs identify themselves
# as the Proxmox kernel's xHCI controllers, and the Bluetooth dongle sits alongside them.
# That is the right scope, because usbmuxd cannot serve a device the host never enumerated.
phone_present() {
  local sysfs="${PHONE_SYSFS_USB:-/sys/bus/usb/devices}" serial found=ABSENT
  [ -d "$sysfs" ] && [ -r "$sysfs" ] || { echo UNKNOWN; return; }
  # A glob that matches nothing means sysfs is not laid out as expected, which is a failure
  # to observe and not an observation. Distinguished from a tree that lists no Apple device.
  compgen -G "$sysfs/*/idVendor" >/dev/null || { echo UNKNOWN; return; }
  for serial in "$sysfs"/*/serial; do
    [ -r "$serial" ] || continue
    # The UDID as usbmux reports it carries a hyphen the USB descriptor does not.
    case "$(tr -d - <"$serial" 2>/dev/null)" in
      "$(echo "$PHONE_UDID" | tr -d -)") echo PRESENT; return ;;
    esac
  done
  echo "$found"
}

# Succeeds only when usbmuxd can actually serve the phone, and names WHICH of the failures
# happened, because their fixes are unrelated.
#
# Without this, an absent phone surfaces as `tunneld did not come up` twenty-five seconds
# into a stand-up, which blames the tunnel for something that is not its fault.
#
# A PLUGGED-IN PHONE CAN VANISH FROM THE HOST'S USB TREE, observed 2026-07-30 22:16 by
# reading sysfs directly: no entry for this UDID while the cable was connected, and the
# Bluetooth dongle still listed alongside the root hubs. Unlocking the phone did NOT restore
# it; unplugging and replugging it while unlocked did, followed by a usbmuxd restart. WHY it
# went is NOT established. iOS USB Restricted Mode is a candidate and nothing was done to
# isolate it from cable, port or host-side causes, so it is not named in the message below.
require_phone() {
  local usb; usb="$(phone_present)"
  if [ "$usb" = UNKNOWN ]; then
    echo "could not read the USB tree, so the phone's presence is unknown. Not the same" >&2
    echo "as the phone being absent: check /sys/bus/usb/devices is readable." >&2
    return 1
  fi
  if [ "$usb" = ABSENT ]; then
    echo "$PHONE_UDID is not on the host's USB bus, so usbmuxd has nothing to serve and" >&2
    echo "nothing in this guest can fix it." >&2
    echo "Unlock the phone, then UNPLUG AND REPLUG it. A phone can leave the bus while" >&2
    echo "still connected, and unlocking alone has not been enough to bring it back." >&2
    return 1
  fi
  # An unprivileged guest runs no udev, so libusb's hotplug discovery never fires and
  # usbmuxd only ever sees what was attached when it started. A phone plugged in later is
  # present in sysfs and invisible to every pymobiledevice3 command.
  local listing rc=0
  listing="$(pmd3 usbmux list 2>&1)" || rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "pymobiledevice3 could not be run, so usbmuxd's view is unknown:" >&2
    echo "$listing" >&2
    return 1
  fi
  case "$listing" in *"$PHONE_UDID"*) return 0 ;; esac
  echo "the phone is on the USB bus but usbmuxd is not serving it." >&2
  echo "This guest gets no udev hotplug, so usbmuxd only sees what was attached when it" >&2
  echo "started. Restart it and re-run:" >&2
  echo "  sudo systemctl restart hippoxmox-usbmuxd.service" >&2
  return 1
}

# LOCK STATE. Prints LOCKED, UNLOCKED or UNKNOWN.
#
# THERE IS NO STRUCTURED QUERY FOR THIS, established 2026-07-28 and re-confirmed 2026-07-30.
# Do not spend another session looking:
#   - `core-device get-lockstate` is rejected BY THE DEVICE on iOS 27, "Action
#     com.apple.coredevice.feature.getlockstate is not implemented", locked and unlocked
#     alike. Upgrading does not help: PyPI's latest is the installed 10.2.3, git master
#     sends the byte-identical action name, and upstream has independently verified the
#     cause. pymobiledevice3#1813 (merged 2026-07-28, so it IS in 10.2.3) records
#     `com.apple.coredevice.deviceinfo` as "verified absent from the 61 RSD services on
#     iOS 27". Apple is retiring that service, so no client version brings it back.
#   - lockdown's `PasswordProtected` reports that a passcode is SET, not that the screen is
#     locked now.
#   - `get-display-info`'s `backlightState` reads "activeOn" in BOTH states, so it separates
#     nothing.
#   - The IORegistry backlight does move (rawBrightness 196 locked against 1184 unlocked)
#     but it measures the BACKLIGHT, and it DRIFTS: two readings of the same locked phone
#     twenty minutes apart gave 196 and 334, creeping toward the unlocked value as the
#     screen settled. A lit lock screen would read as unlocked outright.
#   - notification_proxy gives transition edges, not a pollable current state.
#   - Inferring it from a failed DDI auto-mount only works while the DDI is unmounted.
#
# So it is read off the status strip. On the lock screen iOS draws no signal, wifi or
# battery glyphs, so that strip is flat; in any app it is full of detail. Measured on this
# phone, both directions: 4.58 locked against 36 to 39 unlocked. The variation is used
# rather than the level, which is what stops a bright wallpaper reading as unlocked, and it
# is REPRODUCIBLE: two independent locked runs both read 4.58 to the hundredth, across the
# same interval in which the backlight number moved by 70 per cent.
#
# UNKNOWN IS NOT UNLOCKED. A version of this that preferred get-lockstate returned "not
# locked" whenever the read failed, and duly reported UNLOCKED against a phone that was
# locked, because the command it depended on errored and nothing matched. A check that
# cannot tell must say so.
phone_lock_state() {
  local screenshot="${1:-}"
  [ -n "$screenshot" ] || screenshot="$(shot lockstate)" || { echo UNKNOWN; return; }
  [ -s "$screenshot" ] || { echo UNKNOWN; return; }
  uv run --no-sync --project "$REPO_DIR" python -c "
from PIL import Image
import numpy as np, sys
image = np.asarray(Image.open(sys.argv[1]).convert('L'), dtype=float)
height, width = image.shape
strip = image[0:int(height * 0.055), int(width * 0.60):]
print('UNLOCKED' if strip.std() > 15 else 'LOCKED')" "$screenshot" 2>/dev/null || echo UNKNOWN
}

# Succeeds only on proof that the phone is unlocked. A locked phone still serves screenshots
# and BLE capture while backboardd drops every gesture, so this is the one state worth
# stopping for, and an unreadable answer stops too.
require_unlocked() {
  local state
  state="$(phone_lock_state "${1:-}")"
  [ "$state" = UNLOCKED ] && return 0
  if [ "$state" = LOCKED ]; then
    echo "phone is LOCKED: gestures will be silently dropped. Unlock it and re-run." >&2
  else
    echo "could not read the phone's lock state, so it is not safe to drive it." >&2
    echo "Check the tunnel is up and the developer disk image is mounted." >&2
  fi
  return 1
}

# BlueZ stays on the Proxmox host: the kernel only allows AF_BLUETOOTH in init_net, so a
# container borrows the host bus. Bleak is pure D-Bus, so nothing else changes.
govee_send() {
  # shellcheck disable=SC2086
  $WITH_HOST_BLUETOOTH uv run --project "$REPO_DIR" --no-sync python "$REPO_DIR/tools/ble/govee_send.py" "$@"
}

# The only honest test that a link is free: connect and read a frame back. A surviving app
# process proves nothing either way.
ble_link_is_free() { govee_send send 'aa 01' --listen 4 --address "$1" | grep -q '^  NOTIFY'; }

capture() { bash "$REPO_DIR/tools/ble/govee-capture.sh" "$@"; }
current_capture_name() { cut -d' ' -f2 "$GOVEE_CAPTURE_DIR/.current" 2>/dev/null || true; }
ha_entry() { bash "$HARNESS_DIR/ha.sh" "$1" "$2"; }

govee_app_pid() {
  # Strict: a bare integer alone on a line. pymobiledevice3 prints stack traces full of
  # digits, and grepping a number out of one once made a dead app look alive.
  pmd3 developer dvt process-id-for-bundle-id "$GOVEE_APP_BUNDLE" 2>/dev/null | grep -xE '[0-9]+' | head -1
}
restart_govee_app() {
  pmd3 developer dvt pkill "$GOVEE_APP_PROCESS" >/dev/null 2>&1; sleep 2
  pmd3 developer dvt launch "$GOVEE_APP_BUNDLE" >/dev/null 2>&1; sleep 4
}
