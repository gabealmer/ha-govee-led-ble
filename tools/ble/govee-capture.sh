#!/usr/bin/env bash
# Govee BLE capture, driven from the lab over USB.
#
#   govee-capture.sh start <name> [prediction-sha256]   begin capture
#   govee-capture.sh mark <label>                       timestamp an action within it
#   govee-capture.sh stop                               stop and decode
#   govee-capture.sh decode <name> [--all]
#   govee-capture.sh list
#
# NO TUNNEL IS NEEDED. com.apple.bluetooth.BTPacketLogger is a lockdown service, so this
# works over plain usbmux; only the app-driving half of the rig is behind RemoteXPC.
#
# Env: GOVEE_CAPTURE_DIR (default ~/govee-captures), PYMOBILEDEVICE3, PREFLIGHT_SECONDS.
set -euo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SELF_DIR/../.." && pwd)"
CAP="${GOVEE_CAPTURE_DIR:-$HOME/govee-captures}"
STATE="$CAP/.current"
PMD3="${PYMOBILEDEVICE3:-pymobiledevice3}"
PREFLIGHT_SECONDS="${PREFLIGHT_SECONDS:-15}"

usage() { grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

# 10.2.3 takes `btlogger [OPTIONS] {out}`; upstream moved it under a `capture` subcommand.
# Passing the wrong one is not a soft failure: the extra word is eaten as the OUTPUT PATH,
# so it writes a file named `capture` and exits. Verified against the installed binary on
# 2026-07-30, when the documented `btlogger capture --format pcapng` did exactly that.
btlogger_argv() {
  if "$PMD3" btlogger --help 2>&1 | grep -qE '^\s+capture\s'; then
    echo "btlogger capture"
  else
    echo "btlogger"
  fi
}

# The real precondition is that HCI frames are FLOWING. A missing Bluetooth logging profile,
# or a locked phone, opens cleanly and records nothing, which is indistinguishable from a
# quiet radio unless you look for frames. Asking the project's own reader means a capture
# that passes here cannot then fail to decode for a container reason.
frames_seen() {
  uv run --project "$REPO_DIR" --no-sync python -c '
import sys
from pathlib import Path
sys.path.insert(0, sys.argv[1])
from decode_govee import iter_frames
try:
    print(sum(1 for _ in iter_frames(Path(sys.argv[2]).read_bytes(), allow_truncated=True)))
except Exception:
    print(0)' "$SELF_DIR" "$1" 2>/dev/null || echo 0
}

case "${1:-}" in
  start)
    name="${2:-}"; [ -n "$name" ] || usage 1
    sha="${3:--}"
    [ "$sha" = - ] || [[ "$sha" =~ ^[0-9a-f]{64}$ ]] || { echo "prediction SHA-256 must be 64 lowercase hex" >&2; exit 1; }
    [ -f "$STATE" ] && { read -r old _ < "$STATE"; kill "$old" 2>/dev/null || true; rm -f "$STATE"; }
    name="${name//[^A-Za-z0-9._-]/_}"; mkdir -p "$CAP"
    out="$CAP/$name.pcapng"; rm -f "$out"
    # --format is not optional: the default is Apple's PacketLogger .pklg, a different
    # container again, and naming the file .pcapng would not make it one.
    # shellcheck disable=SC2046
    nohup "$PMD3" $(btlogger_argv) --format pcapng "$out" >"$CAP/$name.log" 2>&1 &
    pid=$!
    printf '%s %s %s %s\n' "$pid" "$name" "$(date --iso-8601=ns)" "$sha" > "$STATE"
    : > "$CAP/$name.actions.tsv"
    for _ in $(seq 1 "$PREFLIGHT_SECONDS"); do
      sleep 1; [ "$(frames_seen "$out")" -gt 0 ] && break
    done
    if [ "$(frames_seen "$out")" -eq 0 ]; then
      kill "$pid" 2>/dev/null || true; rm -f "$STATE" "$CAP/$name.actions.tsv"
      echo "capture preflight failed: no HCI frames in ${PREFLIGHT_SECONDS}s. In order:" >&2
      echo "  1. the iPhone is unlocked;" >&2
      echo "  2. the Bluetooth logging (PacketLogger) profile is installed and active;" >&2
      echo "  3. the phone is on USB ($PMD3 usbmux list; the guest muxer does NOT hotplug," >&2
      echo "     so a replug needs: sudo systemctl restart hippoxmox-usbmuxd.service);" >&2
      echo "  4. toggle Bluetooth off then on. Log: $CAP/$name.log" >&2
      exit 1
    fi
    echo "recording '$name' (pid $pid); mark each action before it starts, then: stop"
    ;;
  mark)
    [ -f "$STATE" ] || { echo "no capture running"; exit 1; }
    shift; label="$*"; [ -n "$label" ] || usage 1
    read -r _ name _ < "$STATE"
    printf '%s\t%s\n' "$(date --iso-8601=ns)" "${label//[$'\t\r\n']/ }" >> "$CAP/$name.actions.tsv"
    echo "marked '$label'"
    ;;
  stop)
    [ -f "$STATE" ] || { echo "no capture running"; exit 1; }
    read -r pid name started sha < "$STATE"
    kill -INT "$pid" 2>/dev/null || true
    for _ in $(seq 1 10); do kill -0 "$pid" 2>/dev/null || break; sleep 0.3; done
    kill "$pid" 2>/dev/null || true
    rm -f "$STATE"
    printf '{"capture":"%s","started_at":"%s","stopped_at":"%s","actions":"%s.actions.tsv","prediction_sha256":%s}\n' \
      "$name" "$started" "$(date --iso-8601=ns)" "$name" \
      "$([ "${sha:--}" = - ] && echo null || echo "\"$sha\"")" > "$CAP/$name.meta.json"
    echo "stopped '$name'"
    uv run --project "$REPO_DIR" python "$SELF_DIR/decode_govee.py" "$CAP/$name.pcapng"
    ;;
  decode)
    name="${2:-}"; [ -n "$name" ] || usage 1; shift 2
    uv run --project "$REPO_DIR" python "$SELF_DIR/decode_govee.py" "$CAP/$name.pcapng" "$@"
    ;;
  list) ls -lh "$CAP"/*.pcapng 2>/dev/null || echo "no captures yet" ;;
  *) usage 0 ;;
esac
