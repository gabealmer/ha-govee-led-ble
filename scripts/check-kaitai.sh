#!/usr/bin/env bash
# Run the clean Kaitai verification target.
set -euo pipefail
cd "$(dirname "$0")/.."

exec make verify-protocol
