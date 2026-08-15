#!/usr/bin/env bash
# container.sh [--dry-run] {up|status|frontend|restart|down} [device]
#
# Run a separate Home Assistant Container against one selected device. The household entry
# is the normal owner and is disabled only while this command surface has durable ownership
# state proving that it must be restored.
set -euo pipefail
umask 077

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$HARNESS_DIR/../.." && pwd)"
# shellcheck disable=SC1091
source "$HARNESS_DIR/devices.env"

usage() {
  cat <<'EOF'
usage: container.sh [--dry-run] {up|status|frontend|restart|down} [device]

  up        hand the selected device from household HA to isolated HA
  status    show the household entry, container and selected owner
  frontend  start the live Vite module configured in devices.local.env
  restart   restart isolated HA so bind-mounted Python changes are reloaded
  down      stop isolated HA and Vite, then restore and poll household HA
EOF
}

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
  shift
fi
COMMAND="${1:-}"
[ -n "$COMMAND" ] || { usage >&2; exit 2; }
shift
case "$COMMAND" in up|status|frontend|restart|down) ;; *) usage >&2; exit 2 ;; esac
[ "$#" -le 1 ] || { usage >&2; exit 2; }
REQUESTED_DEVICE="${1:-}"

CONTAINER_NAME="${HA_CONTAINER_NAME:-ha-govee-led-ble-dev}"
CONTAINER_IMAGE="${HA_CONTAINER_IMAGE:-ghcr.io/home-assistant/home-assistant:2026.8.1}"
CONTAINER_ROOT="${HA_CONTAINER_ROOT:-$REPO_DIR/.harness/ha-container}"
CURRENT_STATE_FILE="$CONTAINER_ROOT/current"
HA_CONTAINER_BASE_URL="${HA_CONTAINER_BASE_URL:-http://127.0.0.1:8123}"
HA_CONTAINER_SERVER_HOST="${HA_CONTAINER_SERVER_HOST:-127.0.0.1}"
HA_CONTAINER_FRONTEND_ORIGIN="${HA_CONTAINER_FRONTEND_ORIGIN:-$HA_CONTAINER_BASE_URL}"
HCI_PATH="${HA_CONTAINER_HCI_PATH:-/sys/class/bluetooth/hci0}"
BUSCTL="${HA_CONTAINER_BUSCTL:-/usr/bin/busctl}"
EDITOR_DEV_MODULE_URL="${HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL:-}"
BLUEZ_DBUS_ADDRESS=""
BLUEZ_DBUS_SOCKET=""
BLUEZ_DBUS_DIR=""
BLUEZ_AUTH_UID=""
BLUEZ_USES_HOST_PROXY=0
BLUEZ_IS_NESTED_LAB_PROXY=0
BLUEZ_TRANSPORT_RESOLVED=0
PORTABLE_BLE_RESOLVER_REQUIRED=0

if declare -p HA_CONTAINER_PODMAN_COMMAND >/dev/null 2>&1; then
  [[ "$(declare -p HA_CONTAINER_PODMAN_COMMAND)" == "declare -a"* ]] || {
    echo "HA_CONTAINER_PODMAN_COMMAND must be a Bash indexed array" >&2
    exit 2
  }
  PODMAN_COMMAND=("${HA_CONTAINER_PODMAN_COMMAND[@]}")
else
  PODMAN_COMMAND=("${PODMAN:-/usr/bin/podman}")
fi
[ "${#PODMAN_COMMAND[@]}" -gt 0 ] && [ -n "${PODMAN_COMMAND[0]}" ] || {
  echo "the Podman command array must not be empty" >&2
  exit 2
}
podman_cmd() {
  "${PODMAN_COMMAND[@]}" "$@"
}

CONTAINER_PRESENCE=unknown
CONTAINER_RUNTIME=unknown
inspect_container_state() {
  local exists_status running
  CONTAINER_PRESENCE=unknown
  CONTAINER_RUNTIME=unknown
  if podman_cmd container exists "$CONTAINER_NAME" >/dev/null 2>&1; then
    CONTAINER_PRESENCE=present
  else
    exists_status=$?
    if [ "$exists_status" = 1 ]; then
      CONTAINER_PRESENCE=absent
      CONTAINER_RUNTIME=stopped
      return 0
    fi
    return 1
  fi
  if ! running="$(podman_cmd inspect --format '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null)"; then
    return 1
  fi
  case "$running" in
    true) CONTAINER_RUNTIME=running ;;
    false) CONTAINER_RUNTIME=stopped ;;
    *) return 1 ;;
  esac
}

container_health() {
  local health
  if health="$(podman_cmd inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER_NAME" 2>/dev/null)"; then
    printf '%s\n' "$health"
    return 0
  fi
  printf 'unknown\n'
  return 1
}

resolve_bluez_transport() {
  local output values=() address="${DBUS_SYSTEM_BUS_ADDRESS:-}" auth_uid="${BLEAK_DBUS_AUTH_UID:-}"
  [ "$BLUEZ_TRANSPORT_RESOLVED" = 0 ] || return 0
  if [ -n "$WITH_HOST_BLUETOOTH" ]; then
    command -v "$WITH_HOST_BLUETOOTH" >/dev/null 2>&1 || {
      echo "Bluetooth wrapper '$WITH_HOST_BLUETOOTH' is not installed" >&2
      return 1
    }
    # shellcheck disable=SC2016
    output="$(
      "$WITH_HOST_BLUETOOTH" sh -c \
        'printf "%s\n%s\n" "${DBUS_SYSTEM_BUS_ADDRESS:-}" "${BLEAK_DBUS_AUTH_UID:-}"'
    )" || {
      echo "Bluetooth wrapper '$WITH_HOST_BLUETOOTH' did not expose its D-Bus environment" >&2
      return 1
    }
    mapfile -t values <<<"$output"
    address="${values[0]:-}"
    auth_uid="${values[1]:-}"
    BLUEZ_USES_HOST_PROXY=1
  fi
  address="${address:-unix:path=/run/dbus/system_bus_socket}"
  case "$address" in
    unix:path=/*) ;;
    *)
      echo "BlueZ D-Bus address must be an absolute unix:path address" >&2
      return 1
      ;;
  esac
  BLUEZ_DBUS_SOCKET="${address#unix:path=}"
  [[ "$BLUEZ_DBUS_SOCKET" != *","* ]] && [[ "$BLUEZ_DBUS_SOCKET" != *";"* ]] || {
    echo "BlueZ D-Bus address must identify one Unix socket" >&2
    return 1
  }
  BLUEZ_DBUS_DIR="$(dirname "$BLUEZ_DBUS_SOCKET")"
  if [ -n "$auth_uid" ]; then
    [[ "$auth_uid" =~ ^-?[0-9]+$ ]] || {
      echo "BLEAK_DBUS_AUTH_UID must be an integer" >&2
      return 1
    }
    BLUEZ_AUTH_UID="$auth_uid"
  fi
  if [ "$address" != "unix:path=/run/dbus/system_bus_socket" ]; then
    BLUEZ_USES_HOST_PROXY=1
  fi
  if [ "$BLUEZ_USES_HOST_PROXY" = 1 ] && [ -n "$WITH_HOST_BLUETOOTH" ]; then
    BLUEZ_IS_NESTED_LAB_PROXY=1
  fi
  BLUEZ_DBUS_ADDRESS="$address"
  BLUEZ_TRANSPORT_RESOLVED=1
}

STATE_PHASE=""
STATE_DEVICE=""
STATE_HOUSEHOLD_ENTRY=""
read_current_state() {
  STATE_PHASE=""
  STATE_DEVICE=""
  STATE_HOUSEHOLD_ENTRY=""
  [ -r "$CURRENT_STATE_FILE" ] || return 1
  IFS=$'\t' read -r STATE_PHASE STATE_DEVICE STATE_HOUSEHOLD_ENTRY <"$CURRENT_STATE_FILE"
  [ -n "$STATE_PHASE" ] && [ -n "$STATE_DEVICE" ] && [ -n "$STATE_HOUSEHOLD_ENTRY" ]
}
read_current_state || true

RECOVERED_CONTAINER_DEVICE=""
if [ "$DRY_RUN" != 1 ] && [ -z "$STATE_DEVICE" ] && [ "$COMMAND" != frontend ] && command -v "${PODMAN_COMMAND[0]}" >/dev/null 2>&1; then
  if inspect_container_state && [ "$CONTAINER_PRESENCE" = present ]; then
    RECOVERED_CONTAINER_DEVICE="$(podman_cmd inspect \
      --format '{{index .Config.Labels "io.github.teh-hippo.ha-govee-led-ble.device"}}' \
      "$CONTAINER_NAME" 2>/dev/null)" || {
      echo "Podman could not inspect the isolated container label; restore Podman access and retry" >&2
      exit 1
    }
  fi
fi
if [ -z "$REQUESTED_DEVICE" ]; then
  REQUESTED_DEVICE="${STATE_DEVICE:-${RECOVERED_CONTAINER_DEVICE:-$DEVICE_DEFAULT}}"
fi
[[ "$REQUESTED_DEVICE" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "device labels must contain only letters, numbers, dot, underscore or dash" >&2; exit 2; }
resolve_device_identity "$REQUESTED_DEVICE"
if [ -n "$RECOVERED_CONTAINER_DEVICE" ] && [ "$RECOVERED_CONTAINER_DEVICE" != "$DEVICE_NAME" ]; then
  echo "container $CONTAINER_NAME belongs to $RECOVERED_CONTAINER_DEVICE, not $DEVICE_NAME" >&2
  exit 1
fi
if [ -z "$STATE_PHASE" ] && [ "$RECOVERED_CONTAINER_DEVICE" = "$DEVICE_NAME" ]; then
  STATE_PHASE=recovered-container
  STATE_DEVICE="$DEVICE_NAME"
  STATE_HOUSEHOLD_ENTRY="$DEVICE_ENTRY"
fi
if [ -n "$STATE_DEVICE" ] && [ "$STATE_DEVICE" != "$DEVICE_NAME" ] && [ "$COMMAND" != frontend ]; then
  echo "isolated HA state belongs to $STATE_DEVICE; run down before selecting $DEVICE_NAME" >&2
  exit 1
fi
if [ -n "$STATE_HOUSEHOLD_ENTRY" ] && [ "$STATE_DEVICE" = "$DEVICE_NAME" ]; then
  [[ "$STATE_HOUSEHOLD_ENTRY" =~ ^[A-Za-z0-9]+$ ]] || { echo "isolated ownership state contains an invalid household entry id" >&2; exit 1; }
  DEVICE_ENTRY="$STATE_HOUSEHOLD_ENTRY"
fi

DEVICE_ROOT="$CONTAINER_ROOT/devices/$DEVICE_NAME"
CONFIG_DIR="$DEVICE_ROOT/config"
AUTH_FILE="$DEVICE_ROOT/auth.json"
ENTRY_ID_FILE="$DEVICE_ROOT/config-entry-id"
FRONTEND_PID_FILE="$CONTAINER_ROOT/vite.pid"
FRONTEND_LOG_FILE="$CONTAINER_ROOT/vite.log"
INTEGRATION_DIR="$REPO_DIR/custom_components/ha_govee_led_ble"
FRONTEND_DIR="$REPO_DIR/frontend"
CONTAINER_PYTHON_DIR="$HARNESS_DIR/container_python"
CONTAINER_PYTHON_PATH=/opt/ha-govee-led-ble-harness

write_current_state() {
  local phase="$1" staging="$CURRENT_STATE_FILE.new"
  mkdir -p "$CONTAINER_ROOT"
  printf '%s\t%s\t%s\n' "$phase" "$DEVICE_NAME" "$DEVICE_ENTRY" >"$staging"
  mv "$staging" "$CURRENT_STATE_FILE"
  STATE_PHASE="$phase"
  STATE_DEVICE="$DEVICE_NAME"
  STATE_HOUSEHOLD_ENTRY="$DEVICE_ENTRY"
}

run_dry() {
  printf 'DRY RUN:'
  printf ' %q' "$@"
  printf '\n'
}

household_ha() {
  if [ "$DRY_RUN" = 1 ]; then
    run_dry household-ha "$@"
    return 0
  fi
  if [ -n "${HA_CONTAINER_HOUSEHOLD_COMMAND:-}" ]; then
    "$HA_CONTAINER_HOUSEHOLD_COMMAND" "$@"
  else
    bash "$HARNESS_DIR/ha.sh" "$@"
  fi
}

container_api() {
  if [ "$DRY_RUN" = 1 ]; then
    run_dry isolated-ha-api "$@"
    return 0
  fi
  if [ -n "${HA_CONTAINER_API_COMMAND:-}" ]; then
    "$HA_CONTAINER_API_COMMAND" "$@"
  else
    uv run --no-sync --with websockets python "$HARNESS_DIR/container_ha.py" \
      --base-url "$HA_CONTAINER_BASE_URL" \
      --auth-file "$AUTH_FILE" \
      "$@"
  fi
}

household_ready() {
  grep -Eq '"state"[[:space:]]*:[[:space:]]*"loaded"' <<<"$1" &&
    grep -Eq '"disabled_by"[[:space:]]*:[[:space:]]*null' <<<"$1"
}

household_disabled() {
  grep -Eq '"state"[[:space:]]*:[[:space:]]*"not_loaded"' <<<"$1" &&
    grep -Eq '"disabled_by"[[:space:]]*:[[:space:]]*"user"' <<<"$1"
}

household_may_own_ble() {
  grep -Eq '"state"[[:space:]]*:[[:space:]]*"(loaded|require_restart)"' <<<"$1"
}

verify_household_owner() {
  local status
  status="$(household_ha "$DEVICE_ENTRY" status)"
  if ! household_ready "$status"; then
    echo "household HA is not the enabled, loaded owner of $DEVICE_NAME:" >&2
    printf '%s\n' "$status" >&2
    return 1
  fi
}

disable_household() {
  local result status
  result="$(household_ha "$DEVICE_ENTRY" disable)"
  grep -Eq '"success"[[:space:]]*:[[:space:]]*true' <<<"$result" || {
    echo "household HA did not disable $DEVICE_ENTRY" >&2
    return 1
  }
  for _ in $(seq 1 "${HA_ENTRY_DISABLE_ATTEMPTS:-10}"); do
    status="$(household_ha "$DEVICE_ENTRY" status)"
    household_disabled "$status" && return 0
    if grep -Eq '"state"[[:space:]]*:[[:space:]]*"require_restart"' <<<"$status"; then
      echo "household HA requires a restart to disable $DEVICE_ENTRY; refusing BLE handover" >&2
      return 1
    fi
    sleep "${HA_ENTRY_DISABLE_DELAY:-1}"
  done
  echo "household HA did not confirm state not_loaded with disabled_by user for $DEVICE_ENTRY" >&2
  return 1
}

restore_household() {
  local status="" attempts="${HA_ENTRY_ATTEMPTS:-12}" delay="${HA_ENTRY_DELAY:-5}"
  household_ha "$DEVICE_ENTRY" enable >/dev/null || {
    write_current_state restore-failed
    echo "COULD NOT RETURN BLE TO HOUSEHOLD HOME ASSISTANT" >&2
    return 1
  }
  for _ in $(seq 1 "$attempts"); do
    status="$(household_ha "$DEVICE_ENTRY" status)"
    household_ready "$status" && {
      rm -f "$CURRENT_STATE_FILE"
      echo "== household owner restored: $DEVICE_NAME entry loaded, disabled_by null"
      return 0
    }
    sleep "$delay"
  done
  write_current_state restore-failed
  printf '%s\n' "$status" >&2
  echo "household entry has not returned to loaded, enabled state" >&2
  return 1
}

stop_container() {
  local remove_status=0
  if ! inspect_container_state; then
    echo "Podman could not determine whether the isolated container is active; household HA remains disabled" >&2
    echo "Restore Podman access, confirm the container state, then rerun container.sh down" >&2
    return 2
  fi
  if [ "$CONTAINER_PRESENCE" = absent ]; then
    return 0
  fi
  if [ "$CONTAINER_RUNTIME" = running ]; then
    podman_cmd stop --time "${HA_CONTAINER_STOP_TIMEOUT:-30}" "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
  podman_cmd rm --force "$CONTAINER_NAME" >/dev/null 2>&1 || remove_status=1
  if ! inspect_container_state; then
    echo "Podman could not confirm the isolated container stopped; household HA remains disabled" >&2
    echo "Restore Podman access, confirm the container state, then rerun container.sh down" >&2
    return 2
  fi
  if [ "$CONTAINER_PRESENCE" = absent ]; then
    return 0
  fi
  if [ "$CONTAINER_RUNTIME" = running ]; then
    echo "isolated Home Assistant container is still running; household HA remains disabled" >&2
    return 2
  fi
  if [ "$remove_status" = 1 ]; then
    echo "isolated Home Assistant stopped but could not be removed" >&2
    return 1
  fi
  echo "isolated Home Assistant container remained present after removal" >&2
  return 1
}

frontend_process_matches() {
  local pid="$1" command_line
  [ -r "/proc/$pid/cmdline" ] || return 1
  command_line="$(tr '\0' ' ' <"/proc/$pid/cmdline")"
  [[ "$command_line" == *"$FRONTEND_DIR"* ]] && [[ "$command_line" == *"vite.dev.config.ts"* ]]
}

stop_frontend() {
  local pid
  [ -r "$FRONTEND_PID_FILE" ] || return 0
  read -r pid <"$FRONTEND_PID_FILE"
  if [[ "$pid" =~ ^[0-9]+$ ]] && frontend_process_matches "$pid"; then
    kill -- "-$pid" >/dev/null 2>&1 || true
    for _ in $(seq 1 20); do
      kill -0 "$pid" >/dev/null 2>&1 || break
      sleep 0.1
    done
  fi
  rm -f "$FRONTEND_PID_FILE"
}

validate_editor_url() {
  [ -n "$EDITOR_DEV_MODULE_URL" ] || {
    echo "set HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL in devices.local.env" >&2
    return 1
  }
  python3 "$INTEGRATION_DIR/editor_dev.py" "$EDITOR_DEV_MODULE_URL"
}

validate_frontend_origin() {
  python3 - "$HA_CONTAINER_FRONTEND_ORIGIN" <<'PY'
import ipaddress
import sys
from urllib.parse import urlsplit

value = sys.argv[1]
parsed = urlsplit(value)
if parsed.scheme != "http" or parsed.path not in ("", "/") or parsed.query or parsed.fragment:
    raise SystemExit("HA_CONTAINER_FRONTEND_ORIGIN must be a local HTTP origin without a path")
if parsed.username is not None or parsed.password is not None or parsed.port != 8123 or parsed.hostname is None:
    raise SystemExit("HA_CONTAINER_FRONTEND_ORIGIN must use an explicit local port 8123")
if parsed.hostname != "localhost":
    try:
        address = ipaddress.ip_address(parsed.hostname)
    except ValueError as err:
        raise SystemExit("HA_CONTAINER_FRONTEND_ORIGIN host must be localhost or a local IP address") from err
    if address.is_unspecified or address.is_multicast or not (
        address.is_loopback or address.is_private or address.is_link_local
    ):
        raise SystemExit("HA_CONTAINER_FRONTEND_ORIGIN host must be localhost or a local IP address")
print(value.rstrip("/"))
PY
}

module_is_ready() {
  python3 - "$EDITOR_DEV_MODULE_URL" <<'PY'
import sys
from urllib.request import urlopen

with urlopen(sys.argv[1], timeout=3) as response:
    if response.status != 200:
        raise SystemExit(1)
PY
}

write_configuration() {
  case "$HA_CONTAINER_SERVER_HOST" in 127.0.0.1|0.0.0.0) ;; *)
    echo "HA_CONTAINER_SERVER_HOST must be 127.0.0.1 or 0.0.0.0" >&2
    return 1
  esac
  mkdir -p "$CONFIG_DIR"
  local staging="$CONFIG_DIR/configuration.yaml.new"
  cat >"$staging" <<EOF
default_config:

http:
  server_host: $HA_CONTAINER_SERVER_HOST

logger:
  default: info
  logs:
    custom_components.ha_govee_led_ble: debug
EOF
  mv "$staging" "$CONFIG_DIR/configuration.yaml"
}

check_host_prerequisites() {
  resolve_bluez_transport
  command -v "${PODMAN_COMMAND[0]}" >/dev/null 2>&1 || {
    echo "Podman command is unavailable: ${PODMAN_COMMAND[0]}" >&2
    return 1
  }
  podman_cmd info --format '{{.Host.OCIRuntime.Name}}' >/dev/null || {
    echo "Podman cannot create its runtime namespace on this host" >&2
    return 1
  }
  [ -x "$BUSCTL" ] || { echo "busctl is not executable at $BUSCTL" >&2; return 1; }
  [ -S "$BLUEZ_DBUS_SOCKET" ] || {
    echo "host BlueZ D-Bus socket not found at $BLUEZ_DBUS_SOCKET" >&2
    return 1
  }
  if [ "$BLUEZ_USES_HOST_PROXY" = 0 ]; then
    [ -d "$HCI_PATH" ] || { echo "Bluetooth controller not found at $HCI_PATH" >&2; return 1; }
  fi
  if [ -n "$WITH_HOST_BLUETOOTH" ]; then
    "$WITH_HOST_BLUETOOTH" "$BUSCTL" --system get-property \
      org.bluez /org/bluez/hci0 org.bluez.Adapter1 Powered >/dev/null
  else
    "$BUSCTL" --address="$BLUEZ_DBUS_ADDRESS" get-property \
      org.bluez /org/bluez/hci0 org.bluez.Adapter1 Powered >/dev/null
  fi || {
    echo "org.bluez did not expose the hci0 Adapter1 interface on the host D-Bus" >&2
    return 1
  }
  python3 - "$HA_CONTAINER_SERVER_HOST" <<'PY'
import socket
import sys

with socket.socket() as listener:
    listener.bind((sys.argv[1], 8123))
PY
}

validate_container_image() {
  [[ "$CONTAINER_IMAGE" =~ ^ghcr\.io/home-assistant/home-assistant:([0-9]{4}\.[0-9]+\.[0-9]+)$ ]] ||
    [[ "$CONTAINER_IMAGE" =~ ^ghcr\.io/home-assistant/home-assistant@sha256:[0-9a-f]{64}$ ]] || {
    echo "HA_CONTAINER_IMAGE must pin an official Home Assistant release or sha256 digest" >&2
    return 1
  }
}

prepare_container_image() {
  validate_container_image
  podman_cmd pull --quiet "$CONTAINER_IMAGE" >/dev/null
  [ -n "$(podman_cmd image inspect --format '{{.Id}}' "$CONTAINER_IMAGE")" ] || {
    echo "Podman did not retain the pinned Home Assistant image" >&2
    return 1
  }
}

build_bluez_container_args() {
  resolve_bluez_transport
  BLUEZ_CONTAINER_ARGS=(
    --volume "$BLUEZ_DBUS_DIR:$BLUEZ_DBUS_DIR:ro"
    --env "DBUS_SYSTEM_BUS_ADDRESS=$BLUEZ_DBUS_ADDRESS"
  )
  if [ -n "$BLUEZ_AUTH_UID" ]; then
    BLUEZ_CONTAINER_ARGS+=(--env "BLEAK_DBUS_AUTH_UID=$BLUEZ_AUTH_UID")
  fi
  if [ "$BLUEZ_USES_HOST_PROXY" = 1 ]; then
    BLUEZ_CONTAINER_ARGS+=(
      --volume "$CONTAINER_PYTHON_DIR:$CONTAINER_PYTHON_PATH:ro"
      --env "PYTHONPATH=$CONTAINER_PYTHON_PATH"
      --env "HA_GOVEE_LED_BLE_PROXY_DBUS_BARE_AUTH=1"
    )
    if [ "$BLUEZ_IS_NESTED_LAB_PROXY" = 1 ] && [ "$PORTABLE_BLE_RESOLVER_REQUIRED" = 1 ]; then
      BLUEZ_CONTAINER_ARGS+=(--env "HA_GOVEE_LED_BLE_PORTABLE_BLE_FALLBACK=1")
    fi
  fi
}

build_container_shared_args() {
  build_bluez_container_args
  CONTAINER_SHARED_ARGS=(
    --network host
    --volume "$CONFIG_DIR:/config:rw"
    --volume "$INTEGRATION_DIR:/config/custom_components/ha_govee_led_ble:ro"
    "${BLUEZ_CONTAINER_ARGS[@]}"
    --env "TZ=${HA_CONTAINER_TIME_ZONE:-Australia/Brisbane}"
  )
  if [ -n "$EDITOR_DEV_MODULE_URL" ]; then
    CONTAINER_SHARED_ARGS+=(--env "HA_GOVEE_LED_BLE_EDITOR_DEV_MODULE_URL=$EDITOR_DEV_MODULE_URL")
  fi
}

build_bluetooth_adapter_preflight_args() {
  local probe
  build_container_shared_args
  probe="import asyncio, sys; from bluetooth_adapters.dbus import get_bluetooth_adapter_details; "
  probe+="details = asyncio.run(get_bluetooth_adapter_details()); "
  probe+="sys.exit(0 if any(path.rsplit('/', 1)[-1] == 'hci0' for path in details) else 'hci0 not returned by bluetooth_adapters')"
  BLUETOOTH_ADAPTER_PREFLIGHT_ARGS=(
    "${PODMAN_COMMAND[@]}" run --rm
    "${CONTAINER_SHARED_ARGS[@]}"
    --entrypoint python3
    "$CONTAINER_IMAGE"
    -c
    "$probe"
  )
}

preflight_bluetooth_adapters() {
  build_bluetooth_adapter_preflight_args
  "${BLUETOOTH_ADAPTER_PREFLIGHT_ARGS[@]}" >/dev/null || {
    echo "pinned Home Assistant bluetooth_adapters preflight did not authenticate to hci0" >&2
    return 1
  }
}

build_pf_bluetooth_preflight_args() {
  local probe
  build_container_shared_args
  probe="import socket; "
  probe+="sock = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_RAW, socket.BTPROTO_HCI); "
  probe+="sock.close()"
  PF_BLUETOOTH_PREFLIGHT_ARGS=(
    "${PODMAN_COMMAND[@]}" run --rm
    "${CONTAINER_SHARED_ARGS[@]}"
    --entrypoint python3
    "$CONTAINER_IMAGE"
    -c
    "$probe"
  )
}

detect_portable_ble_resolver_requirement() {
  PORTABLE_BLE_RESOLVER_REQUIRED=0
  [ "$BLUEZ_IS_NESTED_LAB_PROXY" = 1 ] || return 0
  build_pf_bluetooth_preflight_args
  if ! "${PF_BLUETOOTH_PREFLIGHT_ARGS[@]}" >/dev/null 2>&1; then
    PORTABLE_BLE_RESOLVER_REQUIRED=1
  fi
}

build_direct_ble_preflight_args() {
  local probe
  build_container_shared_args
  probe="import asyncio, sys; from bleak import BleakScanner; "
  probe+="address = sys.stdin.readline().strip(); "
  probe+="sys.exit('selected BLE address was not supplied') if not address else None; "
  probe+="device = asyncio.run(asyncio.wait_for("
  probe+="BleakScanner.find_device_by_address(address, timeout=10.0), timeout=12.0)); "
  probe+="sys.exit(0 if device is not None and device.address.casefold() == address.casefold() else 1)"
  DIRECT_BLE_PREFLIGHT_ARGS=(
    "${PODMAN_COMMAND[@]}" run --rm --interactive
    "${CONTAINER_SHARED_ARGS[@]}"
    --entrypoint python3
    "$CONTAINER_IMAGE"
    -c
    "$probe"
  )
}

preflight_direct_ble_device() {
  [ "$BLUEZ_IS_NESTED_LAB_PROXY" = 1 ] && [ "$PORTABLE_BLE_RESOLVER_REQUIRED" = 1 ] || return 0
  build_direct_ble_preflight_args
  if ! printf '%s\n' "$DEVICE_HA_CONTAINER_ADDR" | "${DIRECT_BLE_PREFLIGHT_ARGS[@]}" >/dev/null 2>&1; then
    echo "pinned Home Assistant direct Bleak discovery preflight did not find the selected device" >&2
    return 1
  fi
}

build_container_run_args() {
  build_container_shared_args
  CONTAINER_RUN_ARGS=(
    "${PODMAN_COMMAND[@]}" run --detach
    --name "$CONTAINER_NAME"
    --label "io.github.teh-hippo.ha-govee-led-ble.harness=true"
    --label "io.github.teh-hippo.ha-govee-led-ble.device=$DEVICE_NAME"
    --stop-signal SIGINT
    "${CONTAINER_SHARED_ARGS[@]}"
    --health-cmd "python3 -c \"from urllib.request import urlopen; urlopen('http://127.0.0.1:8123/', timeout=3)\""
    --health-interval 10s
    --health-timeout 5s
    --health-retries 12
    --health-start-period 30s
  )
  CONTAINER_RUN_ARGS+=("$CONTAINER_IMAGE")
}

dry_run_up() {
  [ -n "$DEVICE_HA_CONTAINER_ADDR" ] || {
    echo "$DEVICE_NAME is not opted in for isolated Home Assistant Container access" >&2
    return 1
  }
  [ -z "$EDITOR_DEV_MODULE_URL" ] || validate_editor_url >/dev/null
  validate_container_image
  resolve_bluez_transport
  build_bluetooth_adapter_preflight_args
  if [ "$BLUEZ_IS_NESTED_LAB_PROXY" = 1 ]; then
    build_pf_bluetooth_preflight_args
    PORTABLE_BLE_RESOLVER_REQUIRED=1
    build_direct_ble_preflight_args
  fi
  build_container_run_args
  if [ -n "$WITH_HOST_BLUETOOTH" ]; then
    run_dry "$WITH_HOST_BLUETOOTH" "$BUSCTL" --system get-property \
      org.bluez /org/bluez/hci0 org.bluez.Adapter1 Powered
  else
    run_dry "$BUSCTL" --address="$BLUEZ_DBUS_ADDRESS" get-property \
      org.bluez /org/bluez/hci0 org.bluez.Adapter1 Powered
  fi
  run_dry "${PODMAN_COMMAND[@]}" pull --quiet "$CONTAINER_IMAGE"
  run_dry "${PODMAN_COMMAND[@]}" image inspect "$CONTAINER_IMAGE"
  run_dry "${BLUETOOTH_ADAPTER_PREFLIGHT_ARGS[@]}"
  if [ "$BLUEZ_IS_NESTED_LAB_PROXY" = 1 ]; then
    run_dry "${PF_BLUETOOTH_PREFLIGHT_ARGS[@]}"
  fi
  run_dry verify-household-owner HOUSEHOLD_ENTRY_REDACTED
  run_dry write-ownership-state handover-starting "$CURRENT_STATE_FILE"
  run_dry household-ha HOUSEHOLD_ENTRY_REDACTED disable
  if [ "$BLUEZ_IS_NESTED_LAB_PROXY" = 1 ]; then
    run_dry protected-device-address-stdin "${DIRECT_BLE_PREFLIGHT_ARGS[@]}"
  fi
  run_dry "${CONTAINER_RUN_ARGS[@]}"
  run_dry isolated-ha-api bootstrap \
    --address DEVICE_ADDRESS_REDACTED \
    --model "$DEVICE_SKU" \
    --entry-id-file "$ENTRY_ID_FILE"
  run_dry write-ownership-state container-running "$CURRENT_STATE_FILE"
}

start_frontend() {
  local info host port _path bind_host vite pid allowed_origin
  info="$(validate_editor_url)"
  allowed_origin="$(validate_frontend_origin)"
  IFS=$'\t' read -r host port _path <<<"$info"
  bind_host="${HA_CONTAINER_VITE_BIND_HOST:-}"
  if [ -z "$bind_host" ]; then
    case "$host" in localhost|127.*|::1) bind_host=127.0.0.1 ;; *) bind_host=0.0.0.0 ;; esac
  fi
  case "$bind_host" in 127.0.0.1|0.0.0.0) ;; *) echo "HA_CONTAINER_VITE_BIND_HOST must be 127.0.0.1 or 0.0.0.0" >&2; return 1 ;; esac
  vite="${HA_CONTAINER_VITE_EXECUTABLE:-$FRONTEND_DIR/node_modules/.bin/vite}"
  if [ "$DRY_RUN" = 1 ]; then
    run_dry env "HA_GOVEE_LED_BLE_VITE_ALLOWED_ORIGIN=$allowed_origin" \
      setsid "$vite" --config "$FRONTEND_DIR/vite.dev.config.ts" --host "$bind_host" --port "$port" --strictPort
    return 0
  fi
  [ -x "$vite" ] || { echo "Vite is unavailable; run npm install in frontend/" >&2; return 1; }
  if [ -r "$FRONTEND_PID_FILE" ]; then
    read -r pid <"$FRONTEND_PID_FILE"
    if [[ "$pid" =~ ^[0-9]+$ ]] && frontend_process_matches "$pid" && module_is_ready; then
      echo "== frontend ready: $EDITOR_DEV_MODULE_URL"
      return 0
    fi
    stop_frontend
  fi
  mkdir -p "$CONTAINER_ROOT"
  command -v setsid >/dev/null || { echo "setsid is required to manage the Vite process group" >&2; return 1; }
  HA_GOVEE_LED_BLE_VITE_ALLOWED_ORIGIN="$allowed_origin" \
    setsid "$vite" --config "$FRONTEND_DIR/vite.dev.config.ts" --host "$bind_host" --port "$port" --strictPort \
    >"$FRONTEND_LOG_FILE" 2>&1 </dev/null &
  pid=$!
  printf '%s\n' "$pid" >"$FRONTEND_PID_FILE"
  for _ in $(seq 1 30); do
    if module_is_ready >/dev/null 2>&1; then
      echo "== frontend ready: $EDITOR_DEV_MODULE_URL"
      return 0
    fi
    kill -0 "$pid" >/dev/null 2>&1 || break
    sleep 1
  done
  cat "$FRONTEND_LOG_FILE" >&2
  stop_frontend
  echo "Vite did not serve $EDITOR_DEV_MODULE_URL" >&2
  return 1
}

case "$COMMAND" in
  frontend)
    start_frontend
    exit 0
    ;;
  status)
    household_status="$(household_ha "$DEVICE_ENTRY" status)" || household_status='{"error":"unavailable"}'
    if household_ready "$household_status"; then
      household_owner=ready
    elif household_disabled "$household_status"; then
      household_owner=disabled
    else
      household_owner=unavailable
    fi
    if ! inspect_container_state; then
      running=unknown
      health=unknown
    elif [ "$CONTAINER_PRESENCE" = present ]; then
      case "$CONTAINER_RUNTIME" in
        running) running=yes ;;
        stopped) running=no ;;
        *) running=unknown ;;
      esac
      health="$(container_health)" || health=unknown
    else
      running=no
      health=absent
    fi
    if [ "$running" = unknown ]; then
      owner="UNKNOWN: Podman could not inspect the isolated Home Assistant container"
    elif [ "$running" = yes ] && household_may_own_ble "$household_status"; then
      owner="CONFLICT: household and isolated Home Assistant are both active"
    elif [ -n "$STATE_PHASE" ] && [ "$STATE_DEVICE" = "$DEVICE_NAME" ]; then
      if [ "$STATE_PHASE" = container-running ] && [ "$running" = yes ]; then
        owner="isolated Home Assistant container"
      elif [ "$household_owner" = ready ]; then
        owner="household Home Assistant; stale isolated state requires down"
      else
        owner="none; household restore required"
      fi
    elif [ "$household_owner" = ready ]; then
      owner="household Home Assistant"
    else
      owner="external or unknown"
    fi
    echo "device: $DEVICE_NAME ($DEVICE_SKU)"
    echo "owner: $owner"
    echo "household entry: $household_owner"
    echo "isolated container: running=$running health=$health phase=${STATE_PHASE:-down}"
    if [ "$running" = yes ] && [ -s "$ENTRY_ID_FILE" ]; then
      container_api status --entry-id-file "$ENTRY_ID_FILE" || true
    fi
    exit 0
    ;;
  down)
    if [ "$DRY_RUN" = 1 ]; then
      run_dry "${PODMAN_COMMAND[@]}" stop "$CONTAINER_NAME"
      run_dry "${PODMAN_COMMAND[@]}" rm --force "$CONTAINER_NAME"
      run_dry stop-vite "$FRONTEND_PID_FILE"
      [ -n "$STATE_PHASE" ] && run_dry restore-household "$DEVICE_ENTRY"
      exit 0
    fi
    trap '' HUP INT TERM
    cleanup_status=0 container_status=0
    stop_container || container_status=$?
    [ "$container_status" = 0 ] || cleanup_status=1
    stop_frontend || cleanup_status=1
    if [ -n "$STATE_PHASE" ]; then
      if [ "$container_status" = 2 ]; then
        write_current_state container-stop-failed
      else
        restore_household || cleanup_status=1
      fi
    else
      echo "== down: no isolated ownership state; household entry was not changed"
    fi
    [ "$cleanup_status" = 0 ]
    exit
    ;;
esac

if [ "$COMMAND" = up ] && [ "$DRY_RUN" = 1 ]; then
  dry_run_up
  exit 0
fi

[ "$COMMAND" != restart ] || [ "$DRY_RUN" != 1 ] || {
  run_dry "${PODMAN_COMMAND[@]}" restart "$CONTAINER_NAME"
  container_api bootstrap --address "$DEVICE_HA_CONTAINER_ADDR" --model "$DEVICE_SKU" --entry-id-file "$ENTRY_ID_FILE"
  exit 0
}

[ -n "$DEVICE_HA_CONTAINER_ADDR" ] || {
  echo "$DEVICE_NAME is not opted in for isolated Home Assistant Container access" >&2
  exit 1
}

if [ "$COMMAND" = up ]; then
  if [ "$STATE_PHASE" = container-running ]; then
    inspect_container_state || {
      echo "Podman could not inspect the recorded isolated container; run down after restoring Podman access" >&2
      exit 1
    }
    if [ "$CONTAINER_PRESENCE" = present ] && [ "$CONTAINER_RUNTIME" = running ]; then
      echo "== isolated Home Assistant is already up for $DEVICE_NAME"
      exit 0
    fi
  fi
  [ -z "$STATE_PHASE" ] || { echo "incomplete isolated state ($STATE_PHASE); run down first" >&2; exit 1; }
  inspect_container_state || {
    echo "Podman could not determine whether $CONTAINER_NAME exists; restore Podman access before handover" >&2
    exit 1
  }
  [ "$CONTAINER_PRESENCE" = absent ] || {
    echo "container $CONTAINER_NAME exists without usable ownership state; run down first" >&2
    exit 1
  }
  check_host_prerequisites
  prepare_container_image
  if [ -n "$EDITOR_DEV_MODULE_URL" ]; then
    validate_editor_url >/dev/null
    module_is_ready || {
      echo "the configured Vite module is not ready; run container.sh frontend $DEVICE_NAME first" >&2
      exit 1
    }
  fi
  if [ ! -s "$AUTH_FILE" ]; then
    : "${HA_CONTAINER_USERNAME:?set in $HARNESS_IDENTITY_FILE}"
    : "${HA_CONTAINER_PASSWORD:?set in $HARNESS_IDENTITY_FILE}"
    [ "$HA_CONTAINER_PASSWORD" != replace-with-a-local-only-password ] || {
      echo "replace HA_CONTAINER_PASSWORD in $HARNESS_IDENTITY_FILE" >&2
      exit 1
    }
  fi
  write_configuration
  preflight_bluetooth_adapters
  detect_portable_ble_resolver_requirement
  verify_household_owner
  rollback_required=1
  # shellcheck disable=SC2329
  rollback_up() {
    local status=$? container_status=0
    trap - EXIT
    trap '' HUP INT TERM
    if [ "$rollback_required" = 1 ]; then
      stop_container || container_status=$?
      stop_frontend || true
      if [ "$container_status" = 2 ]; then
        write_current_state container-stop-failed
      else
        restore_household || true
      fi
    fi
    exit "$status"
  }
  trap rollback_up EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  trap 'exit 129' HUP
  write_current_state handover-starting
  disable_household
  preflight_direct_ble_device
  write_current_state container-starting
  build_container_run_args
  "${CONTAINER_RUN_ARGS[@]}" >/dev/null
  container_api bootstrap \
    --address "$DEVICE_HA_CONTAINER_ADDR" \
    --model "$DEVICE_SKU" \
    --entry-id-file "$ENTRY_ID_FILE"
  write_current_state container-running
  rollback_required=0
  trap - EXIT HUP INT TERM
  echo "== isolated owner ready: $DEVICE_NAME at $HA_CONTAINER_BASE_URL"
  exit 0
fi

[ "$COMMAND" = restart ] || exit 2
[ "$STATE_PHASE" = container-running ] || { echo "isolated Home Assistant is not up" >&2; exit 1; }
inspect_container_state || {
  echo "Podman could not inspect the isolated Home Assistant container; run down after restoring Podman access" >&2
  exit 1
}
[ "$CONTAINER_PRESENCE" = present ] && [ "$CONTAINER_RUNTIME" = running ] || {
  echo "isolated Home Assistant container is not running; run down to restore household HA" >&2
  exit 1
}
restart_failed=1
# shellcheck disable=SC2329
rollback_restart() {
  local status=$? container_status=0
  trap - EXIT
  trap '' HUP INT TERM
  if [ "$restart_failed" = 1 ]; then
    stop_container || container_status=$?
    stop_frontend || true
    if [ "$container_status" = 2 ]; then
      write_current_state container-stop-failed
    else
      restore_household || true
    fi
  fi
  exit "$status"
}
trap rollback_restart EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP
podman_cmd restart --time "${HA_CONTAINER_STOP_TIMEOUT:-30}" "$CONTAINER_NAME" >/dev/null
container_api bootstrap \
  --address "$DEVICE_HA_CONTAINER_ADDR" \
  --model "$DEVICE_SKU" \
  --entry-id-file "$ENTRY_ID_FILE"
restart_failed=0
trap - EXIT HUP INT TERM
echo "== isolated backend restarted: $DEVICE_NAME"
