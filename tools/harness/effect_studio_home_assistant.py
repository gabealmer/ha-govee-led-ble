#!/usr/bin/env python3
"""Validate Effect Studio against the configured household Home Assistant instance."""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

_HARNESS_DIR = Path(__file__).resolve().parent
if str(_HARNESS_DIR) not in sys.path:
    sys.path.insert(0, str(_HARNESS_DIR))

from effect_studio_ha import content, contracts, orchestration, restoration, transport  # noqa: E402
from effect_studio_ha.scenarios import EffectStudioValidator  # noqa: E402

DOMAIN = contracts.DOMAIN
EDITOR_CLEANUP_TIMEOUT = contracts.EDITOR_CLEANUP_TIMEOUT
EXPECTED_MODEL = contracts.EXPECTED_MODEL
MAX_ROUTE_SUMMARIES = contracts.MAX_ROUTE_SUMMARIES
PANEL_MODULE_URL = contracts.PANEL_MODULE_URL
PANEL_PATH = contracts.PANEL_PATH
RESTART_SETUP_TIMEOUT = contracts.RESTART_SETUP_TIMEOUT
RESTART_UNAVAILABLE_TIMEOUT = contracts.RESTART_UNAVAILABLE_TIMEOUT
STATE_SCHEMA_VERSION = contracts.STATE_SCHEMA_VERSION
TERMINAL_DEPLOYMENTS = contracts.TERMINAL_DEPLOYMENTS
WS_APPLY_SNAPSHOT = contracts.WS_APPLY_SNAPSHOT
WS_CUSTOM_CATALOGUE = contracts.WS_CUSTOM_CATALOGUE
WS_DEPLOYMENT_SUBSCRIBE = contracts.WS_DEPLOYMENT_SUBSCRIBE
WS_DEVICES = contracts.WS_DEVICES
WS_INFO = contracts.WS_INFO
WS_LIBRARY_CREATE = contracts.WS_LIBRARY_CREATE
WS_LIBRARY_DELETE = contracts.WS_LIBRARY_DELETE
WS_LIBRARY_GET = contracts.WS_LIBRARY_GET
WS_LIBRARY_LIST = contracts.WS_LIBRARY_LIST
WS_LIBRARY_SUBSCRIBE = contracts.WS_LIBRARY_SUBSCRIBE
WS_LIBRARY_UPDATE = contracts.WS_LIBRARY_UPDATE
WS_SCENE_APPLY = contracts.WS_SCENE_APPLY
WS_SCENE_CATALOGUE_GET = contracts.WS_SCENE_CATALOGUE_GET
WS_SCENE_CATALOGUE_LIST = contracts.WS_SCENE_CATALOGUE_LIST

ClientProtocol = contracts.ClientProtocol
DeviceSelection = contracts.DeviceSelection
HomeAssistantApiError = contracts.HomeAssistantApiError
JsonObject = contracts.JsonObject
JsonValue = contracts.JsonValue
RouteSummary = contracts.RouteSummary
RunState = contracts.RunState
ValidationError = contracts.ValidationError
HomeAssistantRest = transport.HomeAssistantRest
HomeAssistantWebSocket = transport.HomeAssistantWebSocket

_advanced_content = content.advanced_content
_deployment_summary = contracts.deployment_summary
_edited_palette_content = content.edited_palette_content
_error_summary = contracts.error_summary
_multi_content = content.multi_content
_music_content = content.music_content
_object = contracts.object_value
_object_list = contracts.object_list
_painted_content = content.painted_content
_redacted_error_detail = contracts.redacted_error_detail
_require_scene_kinds = contracts.require_scene_kinds
_required_int = contracts.required_int
_required_str = contracts.required_str
_select_device = contracts.select_device
_single_content = content.single_content
_timestamp = contracts.timestamp
_validate_deployment = contracts.validate_deployment
_validate_h617a_catalogue = contracts.validate_h617a_catalogue
_control_state_matches = restoration.control_state_matches
_light_restore_data = restoration.light_restore_data
_light_state_matches = restoration.light_state_matches

STATE_PATH = Path(__file__).parents[2] / ".harness" / "effect-studio-home-assistant.json"


def _write_state(state: RunState) -> None:
    orchestration.write_state(state, STATE_PATH)


def _read_state() -> RunState:
    return orchestration.read_state(STATE_PATH)


def _remove_state() -> None:
    orchestration.remove_state(STATE_PATH)


async def _connect() -> tuple[HomeAssistantWebSocket, HomeAssistantRest]:
    return await transport.connect()


async def _restart_home_assistant(
    client: ClientProtocol,
    rest: HomeAssistantRest,
    *,
    identity_entry_id: str,
    light_entity_id: str,
) -> tuple[HomeAssistantWebSocket, HomeAssistantRest]:
    return await transport.restart_home_assistant(
        client,
        rest,
        identity_entry_id=identity_entry_id,
        light_entity_id=light_entity_id,
        connect_client=_connect,
    )


async def _run(args: argparse.Namespace) -> JsonObject:
    return await orchestration.run(
        args,
        state_path=STATE_PATH,
        connect_client=_connect,
        restart=_restart_home_assistant,
        validator_factory=EffectStudioValidator,
    )


def _websocket_url(base_url: str) -> str:
    return transport.websocket_url_for(base_url)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--stage",
        choices=("all", "before-restart", "after-restart"),
        default="all",
        help="run the complete validation or one side of the single supported restart boundary",
    )
    return parser


def main() -> int:
    try:
        result = asyncio.run(_run(_parser().parse_args()))
    except BaseException as exc:
        print(
            json.dumps(
                {
                    "status": "failed",
                    "error": type(exc).__name__,
                    "detail": _redacted_error_detail(str(exc)),
                },
                sort_keys=True,
            ),
            file=sys.stderr,
        )
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
