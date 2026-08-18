#!/usr/bin/env bash
# local-package.sh {up|status|down} [device] -- run isolated HA from the local deterministic ZIP.
set -euo pipefail

command="${1:?up|status|down required}"
case "$command" in up|status|down) ;; *) echo "command must be up, status or down" >&2; exit 2 ;; esac
device="${2:-}"
[ "$#" -le 2 ] || { echo "usage: local-package.sh {up|status|down} [device]" >&2; exit 2; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PACKAGE_DIR="$REPO_DIR/.harness/local-package/ha_govee_led_ble"

cd "$REPO_DIR"
if [ "$command" = up ]; then
  make clean package
  uv run --no-sync python tools/harness/local_package.py \
    --archive dist/ha_govee_led_ble.zip \
    --destination "$PACKAGE_DIR"
fi

[ -d "$PACKAGE_DIR" ] || {
  echo "no extracted local package; run local-package.sh up first" >&2
  exit 1
}

args=("$command")
[ -z "$device" ] || args+=("$device")
HA_GOVEE_LED_BLE_INTEGRATION_DIR="$PACKAGE_DIR" bash tools/harness/container.sh "${args[@]}"
