#!/usr/bin/env bash
# Kaitai gate: the specs are the source of truth for wire structure, so they have to be
# verified, not just spell-checked. evidence_lint.py only reads the .ksy text; it cannot
# tell whether a spec still compiles or still matches the wire. This script does both.
#
# The generated *.py parsers are gitignored build products, so they go stale silently and
# a roundtrip run against a stale parser proves nothing. Always recompile before running.
set -euo pipefail
cd "$(dirname "$0")/.."

KAITAI=tools/ble/kaitai

if [ ! -d "$KAITAI/node_modules" ]; then
  echo "--- installing the Kaitai compiler toolchain"
  npm --prefix "$KAITAI" ci --silent
fi

echo "--- Compiling every spec"
for spec in "$KAITAI"/*.ksy; do
  node "$KAITAI/compile.js" "$spec" >/dev/null
  echo "  ok $(basename "$spec")"
done

echo "--- Running the .kst fixtures"
uv run --no-sync python "$KAITAI/kst_runner.py"

echo "--- Evidence tags"
uv run --no-sync python "$KAITAI/evidence_lint.py"
