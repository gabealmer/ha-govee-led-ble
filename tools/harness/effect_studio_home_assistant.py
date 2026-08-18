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

from effect_studio_ha import contracts, orchestration, restoration, transport  # noqa: E402
from effect_studio_ha.scenarios import EffectStudioValidator  # noqa: E402

DOMAIN = contracts.DOMAIN
WS_CUSTOM_CATALOGUE = contracts.WS_CUSTOM_CATALOGUE
WS_DEVICES = contracts.WS_DEVICES
WS_INFO = contracts.WS_INFO
WS_LIBRARY_DELETE = contracts.WS_LIBRARY_DELETE
WS_LIBRARY_LIST = contracts.WS_LIBRARY_LIST
WS_SCENE_CATALOGUE_LIST = contracts.WS_SCENE_CATALOGUE_LIST

ClientProtocol = contracts.ClientProtocol
DeviceSelection = contracts.DeviceSelection
HomeAssistantApiError = contracts.HomeAssistantApiError
JsonObject = contracts.JsonObject
RouteSummary = contracts.RouteSummary
RunState = contracts.RunState
ValidationError = contracts.ValidationError
HomeAssistantRest = transport.HomeAssistantRest
HomeAssistantWebSocket = transport.HomeAssistantWebSocket

_redacted_error_detail = contracts.redacted_error_detail
_validate_deployment = contracts.validate_deployment
_light_restore_data = restoration.light_restore_data
_light_state_matches = restoration.light_state_matches

STATE_PATH = Path(__file__).parents[2] / ".harness" / "effect-studio-home-assistant.json"


def _write_state(state: RunState) -> None:
    orchestration.write_state(state, STATE_PATH)


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
