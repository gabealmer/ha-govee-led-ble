#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

output="${1:-custom_components/ha_govee_led_ble/frontend}"
expected_node="$(cat .node-version)"
actual_node="$(bash scripts/node-tool.sh node --version)"
if [[ "$actual_node" != "v$expected_node" ]]; then
  echo "Node.js $expected_node is required; found $actual_node" >&2
  exit 1
fi

stage="$PWD/.build/frontend-stage-${BASHPID}"
trap 'rm -rf "$stage"' EXIT
rm -rf "$stage"
mkdir -p "$stage" "$output"

FRONTEND_OUT_DIR="$stage" bash scripts/node-tool.sh npm --prefix frontend run build

python3 - "$stage/manifest.json" <<'PY'
import json
import sys
from pathlib import Path

manifest = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if manifest.get("bootstrap") != "effect-studio-bootstrap.js":
    raise SystemExit("frontend manifest contains an invalid bootstrap filename")
PY

[[ -f "$stage/effect-studio-bootstrap.js" ]] || {
  echo "frontend bootstrap effect-studio-bootstrap.js was not generated" >&2
  exit 1
}

mapfile -t generated < <(
  find "$stage" -maxdepth 1 -type f -printf '%f\n' | LC_ALL=C sort
)
expected=(effect-studio-bootstrap.js manifest.json)
if ! diff -u <(printf '%s\n' "${expected[@]}") <(printf '%s\n' "${generated[@]}"); then
  echo "frontend build did not produce exactly effect-studio-bootstrap.js and manifest.json" >&2
  exit 1
fi

for filename in "${expected[@]}"; do
  temporary="$output/.$filename.new-${BASHPID}"
  install -m 0644 "$stage/$filename" "$temporary"
  mv -f "$temporary" "$output/$filename"
done
