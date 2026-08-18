#!/usr/bin/env bash
# Run the canonical local preflight.
set -euo pipefail
cd "$(dirname "$0")/.."

exec make check
