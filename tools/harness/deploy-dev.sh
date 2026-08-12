#!/usr/bin/env bash
# deploy-dev.sh {frontend|backend} [ref] -- install a pushed branch through HACS.
set -euo pipefail

mode="${1:?frontend|backend required}"
case "$mode" in frontend|backend) ;; *) echo "mode must be frontend or backend" >&2; exit 2 ;; esac
ref="${2:-ux}"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM_HELPER="${PLATFORM_HELPER:-$HOME/.copilot/skills/platform/scripts/platform.sh}"

cd "$REPO_DIR"
git fetch --quiet origin "$ref"
remote_commit="$(git rev-parse "origin/$ref")"
local_commit="$(git rev-parse HEAD)"
[ "$local_commit" = "$remote_commit" ] || {
  echo "HEAD must equal origin/$ref before deployment" >&2
  echo "local:  $local_commit" >&2
  echo "remote: $remote_commit" >&2
  exit 1
}
[ -z "$(git status --short)" ] || {
  echo "worktree must be clean before deployment" >&2
  exit 1
}

bootstrap="$(jq -er '.bootstrap | select(type == "string")' \
  custom_components/ha_govee_led_ble/frontend/manifest.json)"

bash "$PLATFORM_HELPER" run ha -- \
  uv run --with websockets python "$REPO_DIR/tools/harness/hacs_download.py" \
    --mode "$mode" \
    --ref "$ref" \
    --expected-bootstrap "$bootstrap"

if [ "$mode" = frontend ]; then
  echo "== deployed frontend from $ref; refresh Effect Studio"
else
  echo "== deployed backend from $ref; restart Home Assistant before testing Python changes"
fi
