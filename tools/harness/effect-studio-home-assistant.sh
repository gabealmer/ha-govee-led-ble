#!/usr/bin/env bash
set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$HARNESS_DIR/devices.env"
resolve_device_identity cupboard

[ "$DEVICE_SKU" = H617A ] || {
  echo "cupboard is not configured as H617A" >&2
  exit 1
}

export EFFECT_STUDIO_CONFIG_ENTRY_ID="$DEVICE_ENTRY"
export EFFECT_STUDIO_DEVICE_MODEL="$DEVICE_SKU"
unset DEVICE_ENTRY DEVICE_ADDRESS DEVICE_SNIFF_ADDR DEVICE_EXPECTED_PEER DEVICE_HA_CONTAINER_ADDR

PLATFORM_HELPER="$HOME/.copilot/skills/platform/scripts/platform.sh"
exec bash "$PLATFORM_HELPER" run ha -- \
  uv run --with websockets python "$HARNESS_DIR/effect_studio_home_assistant.py" "$@"
