#!/usr/bin/env bash
set -euo pipefail

self_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$self_dir/animation-capture.sh" camera "$@"
