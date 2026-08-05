#!/usr/bin/env bash
# block_probe.sh <label> -- tap Apply, reassemble the 0xA3 body, and diff it against the
# previous probe. One controlled change per call.
#
# The Workshop effect editor is the only place a compiled scene block can be changed one
# parameter at a time, so this is the loop that names bytes inside it. Every other route
# authors a whole new effect and moves every byte at once.
#
# The diff is against the LAST probe rather than a fixed baseline, because the editor keeps
# its changes: each call is a controlled comparison with the one before it, and a chain of
# those is what a differential aggregate is built from.
set -euo pipefail
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SELF_DIR/phone.sh"
resolve_device "$(harness_running_session_device || echo "$DEVICE_DEFAULT")"

label="${1:?label required}"
state="${BLOCK_PROBE_STATE:-/tmp/govee-block-probe.last}"

capture mark "$label" >/dev/null
wda tap Apply >/dev/null
sleep 3

body="$(uv run --no-sync --project "$REPO_DIR" python "$REPO_DIR/tools/ble/analyse_capture.py" \
        "$(current_capture_name)" 2>/dev/null |
        sed -n "/=== $label ===/,\$p" | grep -A1 'a3 body' | tail -1 | tr -d ' ')"

[ -n "$body" ] || { echo "no A3 body seen for '$label'" >&2; exit 1; }
echo "$label $body"

if [ -s "$state" ]; then
  uv run --no-sync --project "$REPO_DIR" python -c "
import sys
prev_label, prev = open(sys.argv[1]).read().split()
cur = sys.argv[2]
a, b = bytes.fromhex(prev), bytes.fromhex(cur)
if len(a) != len(b):
    print(f'   LENGTH CHANGED {len(a)} -> {len(b)} since {prev_label}')
    raise SystemExit
d = [i for i in range(len(a)) if a[i] != b[i]]
if not d:
    print(f'   no change since {prev_label}')
else:
    for i in d:
        print(f'   body[{i}] block+{i - 5}: {a[i]:#04x} -> {b[i]:#04x}   {a[i]} -> {b[i]}')
" "$state" "$body"
fi
printf '%s %s\n' "$label" "$body" > "$state"
