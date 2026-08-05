#!/usr/bin/env bash
# Mark and tap every discrete position on the currently-visible H6199 white-balance track.
#
# Coordinates are WDA points read from the live accessibility/screenshot geometry:
#   white_balance_probe.sh START_X END_X Y [COUNT] [LABEL_PREFIX]
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"
resolve_device "$(harness_running_session_device || echo "$DEVICE_DEFAULT")"

start_x="${1:?start X required}"
end_x="${2:?end X required}"
y="${3:?Y required}"
count="${4:-20}"
prefix="${5:-white-balance}"

[ "$DEVICE_SKU" = H6199 ] || { echo "white-balance probe is H6199-only" >&2; exit 2; }
[ "$count" -gt 1 ] || { echo "count must be greater than one" >&2; exit 2; }

for ((index = 0; index < count; index++)); do
  x=$((start_x + ((end_x - start_x) * index + (count - 1) / 2) / (count - 1)))
  printf -v label '%s-%02d' "$prefix" "$((index + 1))"
  capture mark "$label" >/dev/null
  wda point "$x $y" >/dev/null
  sleep "${WHITE_BALANCE_SETTLE_SECONDS:-2}"
done

shot white-balance-probe-complete >/dev/null
