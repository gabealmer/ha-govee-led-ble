#!/usr/bin/env bash
# ha.sh <entry_id> <status|disable|enable|entities|state|call|wait|diagnostics> [...]
#
# bws run joins its argv into one string and re-parses it through a shell, so only
# plain-word arguments survive. ha_entry.py takes an absolute path and has no CWD
# dependency, which keeps the joined string re-parsing cleanly.
set -euo pipefail
HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HARNESS_DIR/devices.env"
: "${1:?entry_id required}"
: "${2:?action required}"
exec bash "$BWS_PLATFORM_HELPER" run ha -- \
  uv run --with websockets python3 "$HARNESS_DIR/ha_entry.py" "$@"
