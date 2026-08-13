#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo"
exec uv run --project "$repo" --no-sync python -m tools.harness.animation_capture "$@"
