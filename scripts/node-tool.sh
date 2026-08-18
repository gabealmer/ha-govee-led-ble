#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

tool="${1:?node or npm required}"
shift
case "$tool" in node|npm) ;; *) echo "unsupported Node.js tool: $tool" >&2; exit 2 ;; esac

expected="$(cat .node-version)"
bin_dir=""
if command -v node >/dev/null 2>&1 && [[ "$(node --version)" == "v$expected" ]]; then
  bin_dir="$(dirname "$(command -v node)")"
elif command -v mise >/dev/null 2>&1; then
  install_dir="$(mise where "node@$expected" 2>/dev/null || true)"
  [[ -n "$install_dir" ]] && [[ -x "$install_dir/bin/node" ]] || {
    echo "Node.js $expected is required; run: mise install node@$expected" >&2
    exit 1
  }
  bin_dir="$install_dir/bin"
else
  actual="$(node --version 2>/dev/null || printf 'not installed')"
  echo "Node.js $expected is required; found $actual" >&2
  exit 1
fi

PATH="$bin_dir:$PATH" exec "$bin_dir/$tool" "$@"
