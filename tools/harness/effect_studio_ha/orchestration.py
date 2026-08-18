"""Staged Effect Studio validation orchestration."""

from __future__ import annotations

import argparse
import json
import os
from collections.abc import Awaitable, Callable
from contextlib import suppress
from pathlib import Path

from .contracts import EXPECTED_MODEL, JsonObject, RouteSummary, RunState, ValidationError, error_summary
from .scenarios import EffectStudioValidator
from .transport import HomeAssistantRest, HomeAssistantWebSocket

type Connection = tuple[HomeAssistantWebSocket, HomeAssistantRest]
type Connect = Callable[[], Awaitable[Connection]]
type Restart = Callable[..., Awaitable[Connection]]
type ValidatorFactory = Callable[..., EffectStudioValidator]


def write_state(state: RunState, state_path: Path) -> None:
    state_path.parent.mkdir(parents=True, exist_ok=True)
    staging = state_path.with_suffix(".staging")
    staging.write_text(json.dumps(state.to_dict(), sort_keys=True), encoding="utf-8")
    staging.chmod(0o600)
    staging.replace(state_path)


def read_state(state_path: Path) -> RunState:
    try:
        value = json.loads(state_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValidationError("no staged Effect Studio validation state exists") from exc
    except json.JSONDecodeError as exc:
        raise ValidationError("staged Effect Studio validation state is not valid JSON") from exc
    if not isinstance(value, dict):
        raise ValidationError("staged Effect Studio validation state is not an object")
    return RunState.from_dict(value)


def remove_state(state_path: Path) -> None:
    state_path.unlink(missing_ok=True)
    state_path.with_suffix(".staging").unlink(missing_ok=True)


async def run(
    args: argparse.Namespace,
    *,
    state_path: Path,
    connect_client: Connect,
    restart: Restart,
    validator_factory: ValidatorFactory,
) -> JsonObject:
    identity_entry_id = os.environ.get("EFFECT_STUDIO_CONFIG_ENTRY_ID")
    identity_model = os.environ.get("EFFECT_STUDIO_DEVICE_MODEL")
    if not identity_entry_id or not identity_model:
        raise ValidationError("run through effect-studio-home-assistant.sh so devices.env selects cupboard internally")
    if identity_model != EXPECTED_MODEL:
        raise ValidationError("devices.env cupboard identity is not H617A")

    if args.stage != "after-restart" and state_path.exists():
        raise ValidationError("staged validation state already exists; run the after-restart stage to recover it")

    client, rest = await connect_client()
    validator = validator_factory(
        client,
        rest,
        identity_entry_id=identity_entry_id,
        identity_model=identity_model,
    )
    staged = read_state(state_path) if args.stage == "after-restart" else None
    run_state: RunState | None = staged
    routes: list[RouteSummary] = []
    diagnostics_count = 0
    restart_completed = args.stage == "after-restart"
    cleanup_required = args.stage != "before-restart"
    before_restart_complete = False
    primary_error: BaseException | None = None
    cleanup_errors: list[str] = []
    original_states: list[JsonObject] = staged.original_states if staged is not None else []
    try:
        await validator.verify_surfaces()
        await validator.subscribe()
        if staged is None:
            selection = validator._selection()
            original_states = await validator.capture_controllable_state()
            run_state = await validator.create_and_update_temporary_effect()
            run_state.original_states = original_states
            write_state(run_state, state_path)
            client, rest = await restart(
                client,
                rest,
                identity_entry_id=identity_entry_id,
                light_entity_id=selection.light_entity_id,
            )
            restart_completed = True
            validator = validator_factory(
                client,
                rest,
                identity_entry_id=identity_entry_id,
                identity_model=identity_model,
            )
            validator.selection = selection
            if args.stage == "before-restart":
                before_restart_complete = True
            else:
                await validator.verify_surfaces()
                await validator.subscribe()
        if not before_restart_complete:
            if run_state is None:
                raise ValidationError("Effect Studio run state was not created")
            await validator.verify_persisted_item(run_state)
            routes, operation_ids = await validator.run_routes(run_state)
            diagnostics_count = await validator.verify_diagnostics(operation_ids)
    except BaseException as exc:
        primary_error = exc
    finally:
        if run_state is None and validator.temporary_item_id is not None:
            run_state = RunState(
                validator.temporary_item_id,
                validator.temporary_item_version,
                validator.temporary_item_updated_at,
                original_states,
            )
        if run_state is not None:
            try:
                await client.call({"type": "get_states"})
            except BaseException:
                with suppress(BaseException):
                    await client.close()
                try:
                    client, rest = await connect_client()
                    validator = validator_factory(
                        client,
                        rest,
                        identity_entry_id=identity_entry_id,
                        identity_model=identity_model,
                    )
                    await validator.verify_surfaces()
                    await validator.subscribe()
                except BaseException as exc:
                    cleanup_errors.append(f"cleanup reconnect failed: {error_summary(exc)}")
            if cleanup_required:
                try:
                    await validator.cleanup_item(run_state.item_id)
                except BaseException as exc:
                    cleanup_errors.append(f"temporary library cleanup failed: {error_summary(exc)}")
            try:
                await validator.restore_states(run_state.original_states)
            except BaseException as exc:
                cleanup_errors.append(f"light restoration failed: {error_summary(exc)}")
        if cleanup_required and not cleanup_errors:
            remove_state(state_path)
        with suppress(BaseException):
            await client.close()

    if cleanup_errors:
        detail = "; ".join(cleanup_errors)
        if primary_error is not None:
            raise ValidationError(f"{error_summary(primary_error)}; {detail}") from primary_error
        raise ValidationError(detail)
    if primary_error is not None:
        raise primary_error
    if before_restart_complete:
        return {
            "stage": args.stage,
            "restart": "completed",
            "temporary_item": "retained_for_after_restart",
            "restoration": "verified",
        }
    return {
        "stage": args.stage,
        "restart": "completed" if restart_completed else "not_requested",
        "routes": [route.to_dict() for route in routes],
        "retained_diagnostic_events": diagnostics_count,
        "temporary_item": "removed",
        "restoration": "verified",
    }
