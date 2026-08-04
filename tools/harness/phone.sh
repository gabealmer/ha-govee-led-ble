#!/usr/bin/env bash
# Phone, BLE and capture primitives. Sourced, not run.
#
# One native toolchain on one host: pymobiledevice3 over usbmux for the phone and Bleak over
# either local BlueZ or the lab's host-D-Bus wrapper. Checks earn their place only by
# catching a SILENT failure; anything that merely predicts a loud one has been deleted.
set -uo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$HARNESS_DIR/../.." && pwd)"
source "$HARNESS_DIR/devices.env"
mkdir -p "$HARNESS_RUN_DIR" "$GOVEE_CAPTURE_DIR" "$GOVEE_SHOT_DIR"

# Resolve the CLI to use. The WSL userspace path deliberately chooses the pinned mise pipx
# environment: it supplies the Python library used by the WDA daemon as well as its CLI, while
# Windows owns neither when USB/IP is attached.
#
# A function, not a straight-line block, because the choice depends on HARNESS_RSD_BACKEND and
# that is not final until resolve_device has adopted a running session's state. Resolving only
# at source time picked the fallback interpreter for every shell that had not run up.sh, and
# the fallback is a DIFFERENT pymobiledevice3 install that does not honour
# USBMUXD_SOCKET_ADDRESS, so it reported a dead usbmuxd against a healthy one.
PYMOBILEDEVICE3_REQUESTED="$PYMOBILEDEVICE3"
harness_resolve_pmd3() {
  local resolved_pmd3 pmd3_root
  PYMOBILEDEVICE3="$PYMOBILEDEVICE3_REQUESTED"
  if [ "$HARNESS_RSD_BACKEND" = userspace ] &&
     [ "$PYMOBILEDEVICE3_IS_DEFAULT" = 1 ] &&
     command -v mise >/dev/null 2>&1 &&
     pmd3_root="$(mise where "$NATIVE_PMD3_TOOL" 2>/dev/null)" &&
     [ -x "$pmd3_root/pymobiledevice3/bin/pymobiledevice3" ]; then
    PYMOBILEDEVICE3="$pmd3_root/pymobiledevice3/bin/pymobiledevice3"
  elif resolved_pmd3="$(command -v "$PYMOBILEDEVICE3" 2>/dev/null)"; then
    PYMOBILEDEVICE3="$resolved_pmd3"
  elif command -v mise >/dev/null 2>&1 &&
       resolved_pmd3="$(mise which "$PYMOBILEDEVICE3" 2>/dev/null)"; then
    PYMOBILEDEVICE3="$resolved_pmd3"
  fi
}
harness_resolve_pmd3

PMD3_COMMAND_TIMEOUT="${PMD3_COMMAND_TIMEOUT:-60}"
pmd3() { timeout "$PMD3_COMMAND_TIMEOUT" "$PYMOBILEDEVICE3" "$@"; }
dvt() {
  if [ "$HARNESS_RSD_BACKEND" = userspace ]; then
    pmd3 developer dvt "$@" --userspace
  else
    pmd3 developer dvt "$@" --tunnel "$PHONE_UDID"
  fi
}

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
# The daemon owns its native userspace RSD when USB/IP is attached. The client is plain HTTP
# through a usbmux forward and needs neither, so it runs on the project interpreter.
wda() { uv run --no-sync --project "$REPO_DIR" python "$HARNESS_DIR/wda.py" "$@"; }

wda_serving() { curl -sf --max-time 3 "http://127.0.0.1:$WDA_PORT/status" 2>/dev/null | grep -q '"ready"'; }
wda_up() {
  wda_serving && return 0
  if [ "$HARNESS_RSD_BACKEND" != userspace ]; then
    tunnel_up || return 1
  fi
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
wda_down() {
  stop_service wda-forward
  stop_service wda
  rm -f "$HARNESS_RUN_DIR/wda-session"
}

# Creating this session is the one place that activates Govee. Starting the WDA runner does
# not launch the app, and a separate DVT launch reset the app immediately before WDA did.
wda_activate_govee() { wda list >/dev/null; }

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

# The lab uses a shared kernel tunnel. WSL app sessions use one no-root in-process RSD per
# native service, which is the only route that follows USB/IP ownership without discovery.
# CAPTURE does not need either: BTPacketLogger is a lockdown service.
tunneld_serving() { curl -sf --max-time 3 "http://127.0.0.1:$TUNNELD_PORT" 2>/dev/null | grep -q tunnel-address; }
# Whether the daemon is LISTENING, which is a different question from whether it serves a
# device: tunneld answers {} with no phone attached, and conflating the two once made a
# failed stop report success.
tunneld_listening() { ss -ltnH "sport = :$TUNNELD_PORT" 2>/dev/null | grep -q LISTEN; }
tunnel_up() {
  [ "$HARNESS_RSD_BACKEND" = userspace ] && return 0
  tunneld_serving && return 0
  if [ -n "${USBMUXD_SOCKET_ADDRESS:-}" ]; then
    sudo -b nohup env USBMUXD_SOCKET_ADDRESS="$USBMUXD_SOCKET_ADDRESS" \
      "$PYMOBILEDEVICE3" remote tunneld --protocol tcp \
      >"$HARNESS_RUN_DIR/tunneld.log" 2>&1 </dev/null
  else
    sudo -b nohup "$PYMOBILEDEVICE3" remote tunneld --protocol tcp \
      >"$HARNESS_RUN_DIR/tunneld.log" 2>&1 </dev/null
  fi
  for _ in $(seq 1 25); do sleep 1; tunneld_serving && return 0; done
  echo "tunneld did not come up; see $HARNESS_RUN_DIR/tunneld.log" >&2; return 1
}
tunnel_down() {
  [ "$HARNESS_RSD_BACKEND" = userspace ] && return 0
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
  if [ "$HARNESS_RSD_BACKEND" = userspace ]; then
    nohup "$PYMOBILEDEVICE3" developer core-device display serve-web \
      --http-port "$SERVE_WEB_PORT" --userspace \
      >"$HARNESS_RUN_DIR/serve-web.log" 2>&1 & echo $! > "$(_pidfile serve-web)"
  else
    nohup "$PYMOBILEDEVICE3" developer core-device display serve-web \
      --http-port "$SERVE_WEB_PORT" --tunnel "$PHONE_UDID" \
      >"$HARNESS_RUN_DIR/serve-web.log" 2>&1 & echo $! > "$(_pidfile serve-web)"
  fi
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
  dvt screenshot "$full" >/dev/null 2>&1
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
  #
  # EXCEPT ON WSL, where an EMPTY tree is a real observation: this guest has no USB bus of
  # its own, so vhci_hcd is not loaded and the directory is genuinely empty until the first
  # usbipd attach. Reporting UNKNOWN there sent the operator to "check /sys/bus/usb/devices
  # is readable" when the honest answer was that the phone had not been attached yet.
  if ! compgen -G "$sysfs/*/idVendor" >/dev/null; then
    [ "$HARNESS_HOST_KIND" = wsl ] || { echo UNKNOWN; return; }
    echo ABSENT
    return
  fi
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
    if [ "$HARNESS_HOST_KIND" = wsl ]; then
      echo "$PHONE_UDID is not attached to WSL, so usbmuxd has nothing to serve." >&2
      echo "Unlock and attach it to WSL before retrying." >&2
    else
      echo "$PHONE_UDID is not on the host's USB bus, so usbmuxd has nothing to serve and" >&2
      echo "nothing in this guest can fix it." >&2
      echo "Unlock the phone, then UNPLUG AND REPLUG it. A phone can leave the bus while" >&2
      echo "still connected, and unlocking alone has not been enough to bring it back." >&2
    fi
    return 1
  fi
  # An unprivileged guest runs no udev, so libusb's hotplug discovery never fires and
  # usbmuxd only ever sees what was attached when it started. A phone plugged in later is
  # present in sysfs and invisible to every pymobiledevice3 command.
  #
  # The LISTING answers two questions the round-trip below cannot: whether the CLI runs at
  # all, and whether the device being served is OURS rather than any Apple device that
  # happens to be attached. Both were regressions when this was briefly replaced by the
  # round-trip alone, so the two checks are kept in series rather than swapped.
  local listing rc=0
  listing="$(pmd3 usbmux list 2>&1)" || rc=$?
  if [ "$rc" -ne 0 ] && [ "$HARNESS_HOST_KIND" = wsl ]; then
    restart_usbmuxd
    rc=0
    listing="$(pmd3 usbmux list 2>&1)" || rc=$?
  fi
  if [ "$rc" -ne 0 ]; then
    echo "pymobiledevice3 could not be run, so usbmuxd's view is unknown:" >&2
    echo "$listing" >&2
    return 1
  fi
  case "$listing" in
    *"$PHONE_UDID"*) ;;
    *)
      echo "the phone is on the USB bus but usbmuxd is not serving it." >&2
      if [ "$HARNESS_HOST_KIND" = wsl ]; then
        echo "Restart the native muxer and re-run:" >&2
        echo "  sudo systemctl restart usbmuxd.service" >&2
      else
        echo "This guest gets no udev hotplug, so usbmuxd only sees what was attached when it" >&2
        echo "started. Restart it and re-run:" >&2
        echo "  sudo systemctl restart hippoxmox-usbmuxd.service" >&2
      fi
      return 1
      ;;
  esac
  # LISTED IS NOT REACHABLE. usbmuxd's device list is a cache, so it keeps naming a phone
  # whose mux session is dead; this is the check the listing above cannot make.
  ensure_mux_serving_phone && return 0
  echo "usbmuxd lists $PHONE_UDID but will not open a connection to it, so its session is" >&2
  echo "stale. Restarting the muxer is what clears this:" >&2
  if [ "$HARNESS_HOST_KIND" = wsl ]; then
    echo "  sudo systemctl restart usbmuxd.service" >&2
  else
    echo "  sudo systemctl restart hippoxmox-usbmuxd.service" >&2
  fi
  return 1
}

restart_usbmuxd() {
  if timeout 15 sudo systemctl restart usbmuxd.service; then
    return 0
  fi
  sudo systemctl kill --kill-whom=main --signal=KILL usbmuxd.service
  sudo systemctl start usbmuxd.service
}

# NAMES THE WEDGE FROM THE MUXER'S OWN LOG instead of inferring it from a client timeout.
# Prints a one-line reason, or nothing when the log is clean.
#
# WHY THIS BEATS WAITING: both signatures are written the MOMENT the link goes bad, seconds
# before any client notices. Discovering the same fault through phone_mux_alive costs a full
# PMD3_PROBE_TIMEOUT of silence and still does not say what happened.
#
# The two strings, and what they mean:
#   "ERROR (on device): asyncReadComplete, message was too large (65536 bytes, max = 65535)"
#     the phone lost a message boundary and read two host messages as one. Relayed verbatim
#     from the device: usbmuxd's device_control_input prints control payload type 3 as-is.
#   "Got unhandled payload type 4"
#     the mux SEQUENCE COUNTER has desynchronised. usbmuxd 1.1.1 discards the text, so this
#     is all Ubuntu's build shows; built from master the same line carries the phone's own
#     words, "detected duplicate packet. Expected 2408 received 2411". No usbmuxd version
#     handles type 4, so the daemon never learns the link is dead and keeps writing to it.
#
# BOTH ARE LOGGED AT DEFAULT VERBOSITY, which is what makes this usable without reconfiguring
# the service.
mux_wedge_reason() {
  local since="${1:-5 min ago}" log
  log="$(journalctl -u usbmuxd --since "$since" --no-pager 2>/dev/null)" || return 1
  case "$log" in
    *"unhandled payload type 4"*)
      echo "the mux sequence counter desynchronised (device reported a duplicate packet)"
      return 0
      ;;
    *"message was too large"*)
      echo "the phone lost a mux message boundary (asyncReadComplete, message was too large)"
      return 0
      ;;
  esac
  return 1
}

# LIVENESS IS A ROUND TRIP, NEVER A LISTING. usbmuxd's device list is a cache: after the
# mux session dies it keeps answering ListDevices with the phone's UDID while every real
# connection to it fails. Measured 2026-08-03: `idevice_id -l` named the phone on three
# consecutive tries while `ideviceinfo` failed all three with "Mux error (-8)", and a
# restart fixed both. `pmd3 usbmux list` is the same ListDevices call, so probing with it
# is a check a broken muxer PASSES.
#
# THE ANSWER IS THE OUTPUT, NEVER THE EXIT STATUS. pymobiledevice3 EXITS 0 ON FAILURE:
# measured against a nonexistent usbmux socket it printed "Failed to connect to usbmuxd
# socket" to stderr, wrote nothing to stdout, and returned 0. A first version of this probe
# discarded the output and tested `$?`, so it reported a healthy muxer for one that was not
# running at all, which is the very bug it was written to catch.
#
# --udid is passed because the probe must answer for OUR phone: pymobiledevice3 otherwise
# defaults to the first USB device, so a second Apple device would satisfy it.
PMD3_PROBE_TIMEOUT="${PMD3_PROBE_TIMEOUT:-35}"
phone_mux_alive() {
  local info
  info="$(timeout "$PMD3_PROBE_TIMEOUT" "$PYMOBILEDEVICE3" lockdown info --udid "$PHONE_UDID" 2>/dev/null)" ||
    return 1
  jq -e --arg udid "$PHONE_UDID" '.UniqueDeviceID == $udid' >/dev/null 2>&1 <<<"$info"
}

# Leaves usbmuxd actually serving the phone, or fails. A restart is the supported way to
# pick up a device that arrived after the daemon started, since a USB/IP attach delivers no
# udev hotplug, and it is also the only thing that clears a stale or wedged session.
#
# usbmuxd EXITS when the last device disconnects, so on WSL it is routinely inactive before
# the phone is attached and this is its normal cold start, not a recovery. It then needs a
# moment to enumerate over USB/IP, so the re-probe is a short loop: a single immediate retry
# reports a dead muxer for a daemon that is merely still coming up.
USBMUX_SETTLE_ATTEMPTS="${USBMUX_SETTLE_ATTEMPTS:-6}"
ensure_mux_serving_phone() {
  phone_mux_alive && return 0
  [ "$HARNESS_HOST_KIND" = wsl ] || return 1
  # Said BEFORE the restart, because the restart is what erases the evidence: a fresh muxer
  # logs nothing about why the previous one died, so a session that recovers silently
  # teaches nobody that the DDI upload is eating the link.
  local reason
  reason="$(mux_wedge_reason)" &&
    echo "usbmuxd wedged: $reason; restarting it" >&2
  restart_usbmuxd || return 1
  local attempt
  for ((attempt = 1; attempt <= USBMUX_SETTLE_ATTEMPTS; attempt++)); do
    phone_mux_alive && return 0
    sleep 2
  done
  return 1
}

# A BUSID NAMES A PORT, NOT A PHONE. usbipd numbers a device by the hub port it happens to
# sit on, so the same phone was 1-2 this morning and 11-1 after a re-dock this afternoon.
# That is why the hardware id is the only handle stored anywhere and every BUSID in this
# file is derived here and spent immediately: a remembered one does not fail loudly, it
# quietly starts naming whatever is on that port now.
phone_usbipd_busid() {
  local listing
  listing="$("$USBIPD" list)" || {
    echo "usbipd could not list USB devices" >&2
    return 1
  }

  local -a matches=()
  mapfile -t matches < <(
    awk -v target="${IPHONE_USB_HARDWARE_ID,,}" 'tolower($2) == target { print $1 }' <<<"$listing"
  )
  case "${#matches[@]}" in
    1) printf '%s\n' "${matches[0]}" ;;
    0)
      echo "no USB device with id $IPHONE_USB_HARDWARE_ID is available to usbipd" >&2
      return 1
      ;;
    *)
      echo "usbipd found multiple $IPHONE_USB_HARDWARE_ID devices; disconnect the extra phone" >&2
      return 1
      ;;
  esac
}

wait_for_phone_usbipd_busid() {
  local attempt busid
  for ((attempt = 1; attempt <= USBIPD_WAIT_ATTEMPTS; attempt++)); do
    if busid="$(phone_usbipd_busid 2>/dev/null)"; then
      printf '%s\n' "$busid"
      return 0
    fi
    [ "$attempt" = "$USBIPD_WAIT_ATTEMPTS" ] || sleep "$USBIPD_WAIT_DELAY"
  done
  echo "iPhone $IPHONE_USB_HARDWARE_ID did not re-enumerate for usbipd" >&2
  return 1
}

# usbipd's attach returns as soon as the host accepts the request, but the guest enumerates
# the device asynchronously and a just-force-bound phone re-enumerates under a new BUSID
# while that is happening. So the completion condition is the phone being in THIS guest's
# USB tree, not the exit status of attach: waiting on the weaker signal is what made a
# successful-looking attach surface later as "not attached to WSL" from require_phone.
#
# THE BUSID IS RESOLVED HERE, at the top of every attempt, and never taken as an argument:
# one handed in was read before whatever the caller did next, and both callers force-bind
# first, which re-enumerates the phone asynchronously. That window is small and self-healing,
# but it is the same shape as a re-dock, and what it produces is an attach that succeeds
# against whatever now sits on the old port.
#
# `attach` DOES accept --hardware-id (usbipd-win #341; present in every 4.x release), so the
# --busid here is a CHOICE, not the constraint it looks like. Two things are bought by
# resolving it ourselves: phone_usbipd_busid separates "no iPhone" from "two iPhones", which
# are different problems with different fixes, and the retry has to re-read the tree anyway
# to follow a re-enumeration. Either selector is fine as long as nothing remembers a BUSID
# between attempts; that is the property to preserve if this is ever switched over.
attach_phone_to_wsl() {
  local busid= attempt settle
  for ((attempt = 1; attempt <= USBIPD_ATTACH_ATTEMPTS; attempt++)); do
    busid="$(wait_for_phone_usbipd_busid)" || return 1
    "$USBIPD" attach --wsl --busid "$busid" >/dev/null 2>&1 || true
    for ((settle = 1; settle <= USBIPD_WAIT_ATTEMPTS; settle++)); do
      [ "$(phone_present)" = PRESENT ] && return 0
      sleep "$USBIPD_WAIT_DELAY"
    done
  done
  echo "iPhone $IPHONE_USB_HARDWARE_ID never reached WSL's USB tree; last BUSID $busid" >&2
  return 1
}

phone_usbipd_elevated() {
  local action=$1
  if [ -n "${USBIPD_ELEVATED:-}" ]; then
    "$USBIPD_ELEVATED" "$action" "$IPHONE_USB_HARDWARE_ID"
    return
  fi

  (
    export USBIPD_ACTION="$action" IPHONE_USB_HARDWARE_ID
    export WSLENV="${WSLENV:+$WSLENV:}USBIPD_ACTION:IPHONE_USB_HARDWARE_ID"
    pwsh.exe -NoProfile -Command '
      $arguments = if ($env:USBIPD_ACTION -eq "bind") {
        @("bind", "--force", "--hardware-id", $env:IPHONE_USB_HARDWARE_ID)
      } else {
        @("unbind", "--hardware-id", $env:IPHONE_USB_HARDWARE_ID)
      }
      $process = Start-Process -FilePath "usbipd.exe" -ArgumentList $arguments -Verb RunAs -Wait -PassThru
      if ($process.ExitCode -ne 0) { exit $process.ExitCode }
    '
  )
}

# ROLLBACK MARKER PLUS A DIAGNOSTIC, NOT AN INPUT. Only the file's EXISTENCE is ever read
# back (by release, to decide whether ownership needs handing over), and the detach it then
# performs is keyed on the hardware id. The BUSID is written purely so a post-mortem can
# see which port the phone was on at the time; nothing may act on it, because by the time
# anything reads it a re-dock may have moved the phone and the recorded id would name
# whatever now sits on that port.
write_phone_usbipd_state() {
  printf '%s %s\n' "$1" "$2" >"$PHONE_USBIPD_STATE_FILE"
}

phone_usbipd_shared() {
  local vid=${IPHONE_USB_HARDWARE_ID%%:*} pid=${IPHONE_USB_HARDWARE_ID##*:}
  "$USBIPD" state 2>/dev/null | tr -d '\r' |
    jq -e --arg id "VID_${vid^^}&PID_${pid^^}" \
      'any(.Devices[]; ((.InstanceId // "") | ascii_upcase | contains($id)) and .IsForced)' \
      >/dev/null 2>&1
}

# Detach only. The share is left in place on purpose: binding is the part that needs
# elevation, it survives replugs and reboots, and re-binding every cycle both prompts for
# UAC and drops the stub driver that makes attach work at all.
#
# BE CLEAR ABOUT WHAT THIS DOES NOT DO: a force-bound device stays bound to the USB/IP stub
# driver, so detaching returns it to no Windows application. usbipd-win's own documentation
# says detach restores host access EXCEPT for a forced bind, and only `unbind` reverses
# that. An earlier comment here claimed Windows regains the phone on detach; it does not,
# and iTunes/AMDS will not see it again until someone unbinds. That trade is deliberate,
# because unbinding is what costs a UAC prompt on every single cycle.
phone_usbipd_release() {
  [ "$HARNESS_HOST_KIND" = wsl ] || return 0
  [ -s "$PHONE_USBIPD_STATE_FILE" ] || return 0

  "$USBIPD" detach --hardware-id "$IPHONE_USB_HARDWARE_ID" >/dev/null 2>&1 || true
  rm -f "$PHONE_USBIPD_STATE_FILE"
}

phone_usbipd_acquire() {
  [ "$HARNESS_HOST_KIND" = wsl ] || return 0

  local after
  # An already-attached phone is the goal state, so adopt it rather than cycling ownership:
  # detaching and re-binding a working attachment is the one move guaranteed to break it,
  # and the transition is not free (the stub driver only takes over on re-enumeration).
  if [ "$(phone_present)" = PRESENT ] && after="$(phone_usbipd_busid 2>/dev/null)"; then
    write_phone_usbipd_state attached "$after" || return 1
    ensure_mux_serving_phone || {
      echo "native usbmuxd will not serve the already-attached iPhone $after" >&2
      return 1
    }
    return 0
  fi

  # Elevation is asked for ONLY when the share is actually missing, so the usual cycle runs
  # without a UAC prompt at all.
  if ! phone_usbipd_shared; then
    phone_usbipd_elevated bind || {
      echo "could not force-bind iPhone $IPHONE_USB_HARDWARE_ID for WSL" >&2
      return 1
    }
  fi
  after="$(wait_for_phone_usbipd_busid)" || return 1
  # Recorded before the attach rather than after it, so a half-finished attach is still
  # rolled back to Windows by the detach in release. It is a note for a post-mortem only:
  # the attach below resolves the port it uses for itself.
  write_phone_usbipd_state attached "$after" || return 1
  attach_phone_to_wsl || {
    echo "the phone is shared but Windows would not release it; unplug and replug it" >&2
    return 1
  }
  ensure_mux_serving_phone || {
    echo "native usbmuxd will not serve iPhone $after after attaching it" >&2
    return 1
  }
}

# THE DDI UPLOAD CANNOT CROSS USB/IP. Root-caused 2026-08-03 by running usbmuxd master
# (which prints the payload 1.1.1 discards): partway through the ~15 MB upload the phone
# reports control payload type 4, "detected duplicate packet. Expected 2408 received 2411".
# That is the usbmux SEQUENCE COUNTER desynchronising because outbound packets were lost or
# reordered in transit; the earlier "asyncReadComplete, message was too large (65536 bytes,
# max = 65535)" is the same fault seen one layer up, as a lost message boundary. usbipd-win
# #867 is the same issue and its maintainer states it is "by design" and "not something that
# can be fixed", the cause being user-mode timing letting bulk transfers bunch up.
#
# usbmuxd handles no type-4 message in ANY version, so it never learns the link desynced and
# keeps sending into a stream the phone is rejecting: the session then wedges permanently
# and only a muxer restart clears it. Measured: mount fails after 95s, and every subsequent
# lockdown call hangs.
#
# NONE OF THE OBVIOUS FIXES WORK, all measured rather than reasoned:
#   - dropping --userspace (the previous theory) does not help; the flag was never the cause
#   - usbmuxd master does not help: same desync, same wedge
#   - the ZLP is not a version difference: usb_send in 1.1.1 and master both send one
#     whenever length % wMaxPacketSize == 0, and full-size mux packets are 49152 = 96*512
#
# So the upload is done over NATIVE WINDOWS USB instead, where the same mount takes 3s. The
# mount is device-side state that survives the handover to WSL, and pymobiledevice3 10.2.3+
# short-circuits auto-mount when an image is already mounted, so every later run costs a
# round trip rather than an upload. NO --userspace AND NO --tunnel either way: the mounter
# runs over plain lockdown/usbmux and a transport flag only forces it through a tunnel it
# never required.
mount_developer_image() { pmd3 mounter auto-mount; }

# The Windows-side mount. Only reachable on WSL, and only worth running when the WSL-side
# check has already said no image is mounted, because it costs two UAC prompts and takes the
# phone away from this guest and back.
#
# NOT DONE OVER TCP TO THE WINDOWS MUXER. pymobiledevice3's documented WSL path points at
# Apple's muxer on 127.0.0.1:27015 and needs networkingMode=mirrored, but this host runs NAT
# on purpose (see .wslconfig: GSA only acquires WSL traffic once it is NAT'd into the host
# stack) and AMDS binds to loopback only. So the mount is driven by Windows-side
# pymobiledevice3 instead, which needs no networking at all.
WINDOWS_DDI_SCRIPT="${WINDOWS_DDI_SCRIPT:-$HARNESS_DIR/windows_ddi.ps1}"
WINDOWS_MOUNT_ATTEMPTS="${WINDOWS_MOUNT_ATTEMPTS:-200}"
windows_ddi_ownership() {
  pwsh.exe -NoProfile -ExecutionPolicy Bypass \
    -File "$(wslpath -w "$WINDOWS_DDI_SCRIPT")" \
    -Action "$1" -HardwareId "$IPHONE_USB_HARDWARE_ID" 2>&1 | tr -d '\r'
}

windows_pmd3() {
  timeout "$PMD3_COMMAND_TIMEOUT" "$WINDOWS_PMD3_PYTHON" -m pymobiledevice3 "$@" | tr -d '\r'
}

windows_developer_image_mounted() {
  jq -e --arg path "$DEVELOPER_IMAGE_MOUNT_PATH" 'any(.[]; (.MountPath? // "") == $path)' \
    >/dev/null 2>&1 <<<"$(windows_pmd3 mounter list 2>/dev/null)"
}

# AMDS DOES NOT HAVE THE PHONE THE MOMENT ITS SERVICE REPORTS STARTED. The unbind makes
# Windows re-enumerate the device and the service then has to notice it, so the mount that
# follows raced both. Measured: the first committed version went straight to auto-mount and
# failed with "Device is not connected", which reads as an absent phone rather than as the
# few seconds of settling it actually was.
WINDOWS_PHONE_WAIT_ATTEMPTS="${WINDOWS_PHONE_WAIT_ATTEMPTS:-20}"
wait_for_phone_on_windows() {
  local attempt
  for ((attempt = 1; attempt <= WINDOWS_PHONE_WAIT_ATTEMPTS; attempt++)); do
    jq -e --arg udid "$PHONE_UDID" 'any(.[]; (.Identifier? // "") == $udid)' \
      >/dev/null 2>&1 <<<"$(windows_pmd3 usbmux list 2>/dev/null)" && return 0
    sleep 2
  done
  echo "the phone never became visible to Apple Mobile Device Service on Windows" >&2
  return 1
}

# The mount attempt is its own lock probe: locked it refuses in about a second with
# {'Error': 'DeviceLocked'} and leaves the session healthy, so polling costs nothing. It is
# polled rather than demanded because auto-lock cannot always be disabled, and a fixed
# unlock window turns a working harness into a failed run.
mount_developer_image_on_windows() {
  local attempt output
  for ((attempt = 1; attempt <= WINDOWS_MOUNT_ATTEMPTS; attempt++)); do
    output="$(windows_pmd3 mounter auto-mount 2>&1)"
    case "$output" in
      *DeviceLocked*)
        [ "$attempt" = 1 ] && echo "waiting for the phone to be unlocked to mount the DDI..." >&2
        sleep 3
        continue
        ;;
    esac
    # The device is the only trustworthy verdict, because auto-mount exits 0 on failure.
    windows_developer_image_mounted && return 0
    printf '%s\n' "$output" >&2
    return 1
  done
  echo "gave up waiting for the phone to be unlocked" >&2
  return 1
}

# Hands the phone to Windows, mounts, and hands it back.
#
# THE PHONE IS RETURNED TO WSL WHETHER OR NOT THE MOUNT WORKED. The caller was handed an
# attached phone and must get one back: an earlier version returned as soon as the mount
# failed, leaving the device force-bound but attached to nothing, so the real fault (a phone
# that locked partway through) surfaced on the next run as an absent device instead.
ensure_developer_image_via_windows() {
  [ "$HARNESS_HOST_KIND" = wsl ] || return 1
  [ -x "$WINDOWS_PMD3_PYTHON" ] || {
    echo "the DDI cannot be mounted over USB/IP and Windows-side pymobiledevice3 is not" >&2
    echo "installed at $WINDOWS_PMD3_PYTHON, so there is no path that can mount it." >&2
    return 1
  }

  echo "== mounting the DDI over native Windows USB (it cannot cross USB/IP)" >&2
  "$USBIPD" detach --hardware-id "$IPHONE_USB_HARDWARE_ID" >/dev/null 2>&1 || true
  windows_ddi_ownership to-windows >&2 || {
    echo "could not hand the phone to Windows" >&2
    return 1
  }

  local rc=0
  wait_for_phone_on_windows || rc=1
  [ "$rc" = 0 ] && { mount_developer_image_on_windows || rc=1; }

  windows_ddi_ownership to-wsl >&2 || {
    echo "the DDI step finished but the phone could not be handed back to WSL" >&2
    return 1
  }

  local busid
  busid="$(wait_for_phone_usbipd_busid)" || return 1
  write_phone_usbipd_state attached "$busid" || return 1
  attach_phone_to_wsl || return 1
  ensure_mux_serving_phone || return 1
  return "$rc"
}

# Asks the DEVICE what it has mounted, which is the only trustworthy verdict: auto-mount
# EXITS 0 ON FAILURE (pymobiledevice3#1817, still open), so its status says nothing, and
# matching its text for "error" is worse still because "already mounted" is itself logged
# at ERROR. Matched on the personalized DDI's mount point rather than on the array being
# non-empty, so some other image cannot stand in for the one the developer services need.
DEVELOPER_IMAGE_MOUNT_PATH="${DEVELOPER_IMAGE_MOUNT_PATH:-/System/Developer}"
developer_image_mounted() {
  local listing
  listing="$(timeout "$PMD3_PROBE_TIMEOUT" "$PYMOBILEDEVICE3" mounter list --udid "$PHONE_UDID" 2>/dev/null)" ||
    return 1
  jq -e --arg path "$DEVELOPER_IMAGE_MOUNT_PATH" \
    'any(.[]; (.MountPath? // "") == $path)' >/dev/null 2>&1 <<<"$listing"
}

# Prints MOUNTED, LOCKED or FAILED, and is the COLD-START lock check as well as the mount.
#
# The DDI mounter is the one service that reports lock state structurally: a locked phone
# refuses the upload with {'Error': 'DeviceLocked'} in about a second. That is worth having
# because the screenshot reading below needs the DDI mounted, and mounting the DDI needs an
# unlocked phone, so on a cold start the screenshot can only ever answer UNKNOWN. Discarding
# this result is what made a merely locked phone surface as "could not read the phone's lock
# state, so it is not safe to drive it", which sent two sessions looking at the tunnel.
#
# The VERDICT COMES FROM `mounter list`, not from auto-mount's own report, because
# auto-mount cannot be believed either way: it EXITS 0 ON FAILURE, printing a formatted
# traceback and returning success. Matching its text for "error" would be no better, since
# that decides a mount happened by whether a human-readable string happened to contain a
# word. An image is mounted when the device says one is mounted.
developer_image_state() {
  # ASKED BEFORE ANY MOUNT IS ATTEMPTED, which on WSL is the difference between a working
  # session and a wedged one: over USB/IP the upload desynchronises the mux sequence and
  # kills the muxer, so an already-mounted image must short-circuit before that is risked.
  # pymobiledevice3 does the same check internally, but only after opening the service.
  if developer_image_mounted; then
    echo MOUNTED
    return
  fi
  local mount_output
  mount_output="$(mount_developer_image 2>&1)"
  # Taken before the positive check because it is the one failure with a specific remedy,
  # and because a locked phone never reaches a mounted state to be confirmed.
  case "$mount_output" in
    *DeviceLocked*) echo LOCKED; return ;;
  esac
  if developer_image_mounted; then
    echo MOUNTED
    return
  fi
  printf '%s\n' "$mount_output" >&2
  echo FAILED
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

# Mounts the developer image and stops on the two states that make the phone undrivable.
#
# SEPARATE FROM require_unlocked BECAUSE THIS ONE MUTATES. act.sh re-reads the lock state
# after every gesture, so folding the mount into that check re-ran auto-mount per gesture
# and put the whole DDI upload on the critical path of a tap.
require_developer_image() {
  # The cheap question first, and on WSL the only safe one: an image that is already
  # mounted costs a round trip to confirm, where attempting the upload costs the muxer.
  developer_image_mounted && return 0

  # On WSL the upload cannot cross USB/IP at all, so it is not attempted here. Going to
  # Windows is the only path that works, and it reports its own lock state while it runs.
  if [ "$HARNESS_HOST_KIND" = wsl ]; then
    ensure_developer_image_via_windows && return 0
    echo "the developer disk image is not mounted and could not be mounted over Windows," >&2
    echo "so the phone cannot be driven. Unlock the phone and re-run." >&2
    return 1
  fi

  local state
  state="$(developer_image_state)"
  [ "$state" = MOUNTED ] && return 0
  if [ "$state" = LOCKED ]; then
    echo "phone is LOCKED: the developer image will not mount, and gestures would be" >&2
    echo "silently dropped even if it had. Unlock it and re-run." >&2
  else
    echo "the developer disk image would not mount, so the phone cannot be driven." >&2
  fi
  return 1
}

# Succeeds only on proof that the phone is unlocked. A locked phone still serves screenshots
# and BLE capture while backboardd drops every gesture, so this is the one state worth
# stopping for, and an unreadable answer stops too. Pure: it reads, it does not mount.
require_unlocked() {
  local state
  state="$(phone_lock_state "${1:-}")"
  [ "$state" = UNLOCKED ] && return 0
  if [ "$state" = LOCKED ]; then
    echo "phone is LOCKED: gestures will be silently dropped. Unlock it and re-run." >&2
  else
    echo "could not read the phone's lock state, so it is not safe to drive it." >&2
    echo "The screenshot it reads needs the developer image mounted; check that first." >&2
  fi
  return 1
}

require_bluetooth_transport() {
  if [ -n "$WITH_HOST_BLUETOOTH" ]; then
    command -v "$WITH_HOST_BLUETOOTH" >/dev/null 2>&1 || {
      echo "Bluetooth wrapper '$WITH_HOST_BLUETOOTH' is not installed" >&2
      return 1
    }
    return 0
  fi
  compgen -G '/sys/class/bluetooth/hci*' >/dev/null || {
    if [ "$HARNESS_HOST_KIND" = wsl ]; then
      echo "no Bluetooth controller is attached to WSL." >&2
      echo "Attach a Linux-compatible controller before retrying." >&2
    else
      echo "no Linux Bluetooth controller is available" >&2
    fi
    return 1
  }
  systemctl is-active --quiet bluetooth ||
    sudo systemctl start bluetooth
  bluetoothctl power on >/dev/null
}

govee_send() {
  if [ -n "$WITH_HOST_BLUETOOTH" ]; then
    "$WITH_HOST_BLUETOOTH" uv run --project "$REPO_DIR" --no-sync \
      python "$REPO_DIR/tools/ble/govee_send.py" "$@"
  else
    uv run --project "$REPO_DIR" --no-sync python "$REPO_DIR/tools/ble/govee_send.py" "$@"
  fi
}

# The only honest test that a link is free: connect and read a frame back. A surviving app
# process proves nothing either way.
ble_link_is_free() { govee_send send 'aa 01' --listen 4 --address "$1" | grep -q '^  NOTIFY'; }

capture() { bash "$REPO_DIR/tools/ble/govee-capture.sh" "$@"; }
current_capture_name() { cut -d' ' -f2 "$GOVEE_CAPTURE_DIR/.current" 2>/dev/null || true; }
ha_entry() { bash "$HARNESS_DIR/ha.sh" "$1" "$2"; }

# Backend-specific overrides REDEFINE functions above, and a source cannot be undone. So they
# must not be loaded until the backend is final, which it is not at source time: the ambient
# default on WSL is `windows` and resolve_device may still adopt `native` from a running
# session. Loading them early was a real failure, not a hypothetical one — capture() was
# replaced by the Windows stub, which then refused a capture on a natively-owned phone with
# advice to run up.sh, in a session where up.sh had already run.
harness_load_backend_overrides() {
  [ "$HARNESS_PHONE_BACKEND" = windows ] || return 0
  [ -z "${HARNESS_BACKEND_OVERRIDES_LOADED:-}" ] || return 0
  HARNESS_BACKEND_OVERRIDES_LOADED=1
  # shellcheck source=tools/harness/phone_windows.sh
  source "$HARNESS_DIR/phone_windows.sh"
}

# Final already if the caller pinned it; otherwise resolve_device loads them after adopting.
[ -z "$HARNESS_PHONE_BACKEND_EXPLICIT" ] || harness_load_backend_overrides
