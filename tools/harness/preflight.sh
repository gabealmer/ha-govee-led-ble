#!/usr/bin/env bash
# preflight.sh [app|direct] -- inspect harness prerequisites without taking a BLE link.
set -euo pipefail

mode="${1:-app}"
case "$mode" in app|direct) ;; *) echo "mode must be app or direct" >&2; exit 2 ;; esac

# Keep preflight's selected backend truthful without attaching the phone yet.
if [ "$mode" = app ] &&
   { [ "${HARNESS_HOST_KIND:-}" = wsl ] ||
     { [ -z "${HARNESS_HOST_KIND:-}" ] && grep -qi microsoft /proc/sys/kernel/osrelease 2>/dev/null; }; }; then
  export HARNESS_PHONE_BACKEND=native
  export HARNESS_RSD_BACKEND=userspace
fi

# shellcheck source=tools/harness/phone.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phone.sh"

echo "host: $HARNESS_HOST_KIND"
echo "phone backend: $HARNESS_PHONE_BACKEND"
echo "RSD backend: $HARNESS_RSD_BACKEND"
echo "BLE backend: $HARNESS_BLE_BACKEND"

if [ "$mode" = direct ]; then
  require_bluetooth_transport
  echo "bluetooth: ready"
  exit 0
fi

if [ "$HARNESS_HOST_KIND" = wsl ]; then
  busid="$(phone_usbipd_busid)" || exit 1
  echo "phone: $busid ready for WSL ownership"
  exit 0
fi

require_phone
echo "phone: ready"
echo "pymobiledevice3: $(pmd3 version)"
