"""Durable deployment intent and replaceable observed-device state."""

from __future__ import annotations

import asyncio
import copy
import logging
from collections.abc import Callable, Mapping
from dataclasses import dataclass, replace
from enum import StrEnum
from typing import Any, Final, cast, overload
from uuid import UUID

from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .effect_domain import EffectValidationError, LibraryItem
from .effect_limits import (
    MAX_DEPLOYMENT_RECORDS,
    MAX_DEPLOYMENT_STORE_BYTES,
    MAX_DEVICE_CACHE_ENTRIES,
    MAX_DEVICE_CACHE_STORE_BYTES,
    MAX_IDENTIFIER_LENGTH,
    MAX_REVISION,
    MAX_STORE_JSON_NODES,
    validate_bounded_string,
    validate_json_document,
    validate_revision,
    validate_timestamp,
)
from .effect_storage import (
    EffectLimitError,
    EffectNotFoundError,
    EffectRevisionConflictError,
    EffectStorageError,
)
from .effect_store import HomeAssistantVersionedDocumentStore, VersionedDocumentStore

DEPLOYMENT_STORE_VERSION: Final = 1
DEPLOYMENT_STORE_MINOR_VERSION: Final = 3
DEPLOYMENT_STORE_KEY: Final = f"{DOMAIN}.effect_deployments"
DEVICE_CACHE_STORE_VERSION: Final = 1
DEVICE_CACHE_STORE_MINOR_VERSION: Final = 2
DEVICE_CACHE_STORE_KEY: Final = f"{DOMAIN}.effect_device_cache"
MAX_DEPLOYMENT_PROGRESS: Final = 1024
MAX_DEPLOYMENT_EVIDENCE_CODES: Final = 8

_LOGGER = logging.getLogger(__name__)


class DeploymentPhase(StrEnum):
    COMPILING = "compiling"
    PENDING = "pending"
    UPLOADING = "uploading"
    ACTIVATING = "activating"
    VERIFYING = "verifying"
    CONFIRMED = "confirmed"
    UNCERTAIN = "uncertain"
    RECOVERING = "recovering"
    FAILED = "failed"
    INTERRUPTED = "interrupted"
    UNKNOWN = "unknown"


class ObservationConfidence(StrEnum):
    EXACT_SESSION = "exact_session"
    ACTIVATION_MATCH = "activation_match"
    UNKNOWN = "unknown"


@dataclass(frozen=True, slots=True)
class PriorControlState:
    mode: str
    is_on: bool
    brightness_pct: int
    rgb_color: tuple[int, int, int]
    color_temp_kelvin: int | None = None
    effect: str | None = None
    diy_code: int | None = None
    music_mode: str = "off"
    video_mode: str = "off"
    music_sensitivity: int = 100
    music_calm: bool = False
    music_color: tuple[int, int, int] | None = None

    def __post_init__(self) -> None:
        validate_bounded_string(
            self.mode,
            "prior control mode",
            maximum=MAX_IDENTIFIER_LENGTH,
            error_type=EffectStorageError,
        )
        if not isinstance(self.is_on, bool):
            raise EffectStorageError("prior power state must be a boolean")
        if (
            not isinstance(self.brightness_pct, int)
            or isinstance(self.brightness_pct, bool)
            or not 0 <= self.brightness_pct <= 100
        ):
            raise EffectStorageError("prior brightness must be from 0 to 100")
        _validate_rgb(self.rgb_color, "prior RGB colour")
        if self.color_temp_kelvin is not None and (
            not isinstance(self.color_temp_kelvin, int)
            or isinstance(self.color_temp_kelvin, bool)
            or not 1000 <= self.color_temp_kelvin <= 10000
        ):
            raise EffectStorageError("prior colour temperature must be from 1000 to 10000")
        for value, name in (
            (self.effect, "prior effect"),
            (self.music_mode, "prior music mode"),
            (self.video_mode, "prior video mode"),
        ):
            if value is not None:
                validate_bounded_string(
                    value,
                    name,
                    maximum=MAX_IDENTIFIER_LENGTH,
                    error_type=EffectStorageError,
                )
        if self.diy_code is not None and (
            not isinstance(self.diy_code, int) or isinstance(self.diy_code, bool) or not 0 <= self.diy_code <= 0xFFFF
        ):
            raise EffectStorageError("prior DIY code must be from 0 to 65535")
        if (
            not isinstance(self.music_sensitivity, int)
            or isinstance(self.music_sensitivity, bool)
            or not 0 <= self.music_sensitivity <= 100
        ):
            raise EffectStorageError("prior music sensitivity must be from 0 to 100")
        if not isinstance(self.music_calm, bool):
            raise EffectStorageError("prior music style must be a boolean")
        if self.music_color is not None:
            _validate_rgb(self.music_color, "prior music colour")

    def to_dict(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "is_on": self.is_on,
            "brightness_pct": self.brightness_pct,
            "rgb_color": list(self.rgb_color),
            "color_temp_kelvin": self.color_temp_kelvin,
            "effect": self.effect,
            "diy_code": self.diy_code,
            "music_mode": self.music_mode,
            "video_mode": self.video_mode,
            "music_sensitivity": self.music_sensitivity,
            "music_calm": self.music_calm,
            "music_color": list(self.music_color) if self.music_color is not None else None,
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> PriorControlState:
        return cls(
            mode=_required_str(raw, "mode"),
            is_on=_required_bool(raw, "is_on"),
            brightness_pct=_required_int(raw, "brightness_pct"),
            rgb_color=_required_rgb(raw, "rgb_color"),
            color_temp_kelvin=_optional_int(raw, "color_temp_kelvin"),
            effect=_optional_str(raw, "effect"),
            diy_code=_optional_int(raw, "diy_code"),
            music_mode=_optional_str(raw, "music_mode") or "off",
            video_mode=_optional_str(raw, "video_mode") or "off",
            music_sensitivity=_optional_int(raw, "music_sensitivity", default=100),
            music_calm=_optional_bool(raw, "music_calm", default=False),
            music_color=_optional_rgb(raw, "music_color"),
        )


@dataclass(frozen=True, slots=True)
class DeploymentRecord:
    operation_id: UUID
    config_entry_id: str
    diy_code: int
    phase: DeploymentPhase
    compiler_version: int
    artifact_sha256: str
    updated_at: str
    target_mode: str = "custom"
    target_effect: str | None = None
    evidence_codes: tuple[str, ...] = ()
    item_id: UUID | None = None
    item_revision: int | None = None
    snapshot_id: UUID | None = None
    snapshot: LibraryItem | None = None
    error_code: str | None = None
    progress_current: int = 0
    progress_total: int = 0
    verification_confidence: ObservationConfidence = ObservationConfidence.UNKNOWN
    prior_state: PriorControlState | None = None

    def __post_init__(self) -> None:
        validate_bounded_string(
            self.config_entry_id,
            "deployment config entry ID",
            maximum=MAX_IDENTIFIER_LENGTH,
            error_type=EffectStorageError,
        )
        if not isinstance(self.diy_code, int) or not 0 <= self.diy_code <= 0xFFFF:
            raise EffectStorageError("deployment DIY code must be from 0 to 65535")
        if self.target_mode not in {"custom", "scene"}:
            raise EffectStorageError("deployment target mode must be custom or scene")
        if self.target_effect is not None:
            validate_bounded_string(
                self.target_effect,
                "deployment target effect",
                maximum=MAX_IDENTIFIER_LENGTH,
                error_type=EffectStorageError,
            )
        if self.target_mode == "scene" and self.target_effect is None:
            raise EffectStorageError("scene deployment must include a target effect")
        if len(self.evidence_codes) > MAX_DEPLOYMENT_EVIDENCE_CODES:
            raise EffectStorageError(
                f"deployment must not exceed {MAX_DEPLOYMENT_EVIDENCE_CODES} evidence codes"
            )
        for code in self.evidence_codes:
            validate_bounded_string(
                code,
                "deployment evidence code",
                maximum=MAX_IDENTIFIER_LENGTH,
                error_type=EffectStorageError,
            )
        if self.compiler_version < 1:
            raise EffectStorageError("deployment compiler version must be positive")
        if len(self.artifact_sha256) != 64 or any(
            character not in "0123456789abcdef" for character in self.artifact_sha256
        ):
            raise EffectStorageError("deployment artifact hash must be SHA-256")
        validate_timestamp(
            self.updated_at,
            "deployment timestamp",
            error_type=EffectStorageError,
        )
        if self.error_code is not None:
            validate_bounded_string(
                self.error_code,
                "deployment error code",
                maximum=MAX_IDENTIFIER_LENGTH,
                error_type=EffectStorageError,
            )
        if (
            self.progress_current < 0
            or self.progress_total < 0
            or self.progress_current > self.progress_total
            or self.progress_total > MAX_DEPLOYMENT_PROGRESS
        ):
            raise EffectStorageError("deployment progress is invalid")
        library_source = self.item_id is not None or self.item_revision is not None
        snapshot_source = self.snapshot_id is not None or self.snapshot is not None
        if library_source == snapshot_source:
            raise EffectStorageError("deployment must reference exactly one library revision or applied snapshot")
        if library_source:
            if self.item_id is None or self.item_revision is None:
                raise EffectStorageError("deployment library source is incomplete")
            validate_revision(
                self.item_revision,
                "deployment item revision",
                minimum=1,
                error_type=EffectStorageError,
            )
        if snapshot_source and (self.snapshot_id is None or self.snapshot is None):
            raise EffectStorageError("deployment applied snapshot is incomplete")

    def to_dict(self) -> dict[str, Any]:
        return {
            "operation_id": str(self.operation_id),
            "config_entry_id": self.config_entry_id,
            "diy_code": self.diy_code,
            "phase": self.phase.value,
            "compiler_version": self.compiler_version,
            "artifact_sha256": self.artifact_sha256,
            "updated_at": self.updated_at,
            "target_mode": self.target_mode,
            "target_effect": self.target_effect,
            "evidence_codes": list(self.evidence_codes),
            "item_id": str(self.item_id) if self.item_id is not None else None,
            "item_revision": self.item_revision,
            "snapshot_id": (str(self.snapshot_id) if self.snapshot_id is not None else None),
            "snapshot": self.snapshot.to_dict() if self.snapshot is not None else None,
            "error_code": self.error_code,
            "progress_current": self.progress_current,
            "progress_total": self.progress_total,
            "verification_confidence": self.verification_confidence.value,
            "prior_state": self.prior_state.to_dict() if self.prior_state is not None else None,
        }

    def to_public_dict(self) -> dict[str, Any]:
        return {
            "operation_id": str(self.operation_id),
            "config_entry_id": self.config_entry_id,
            "diy_code": self.diy_code,
            "target_mode": self.target_mode,
            "target_effect": self.target_effect,
            "phase": self.phase.value,
            "updated_at": self.updated_at,
            "item_id": str(self.item_id) if self.item_id is not None else None,
            "item_revision": self.item_revision,
            "error_code": self.error_code,
            "progress_current": self.progress_current,
            "progress_total": self.progress_total,
            "verification_confidence": self.verification_confidence.value,
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> DeploymentRecord:
        try:
            operation_id = UUID(_required_str(raw, "operation_id"))
            item_id_raw = raw.get("item_id")
            item_id = None if item_id_raw is None else UUID(str(item_id_raw))
            snapshot_id_raw = raw.get("snapshot_id")
            snapshot_id = None if snapshot_id_raw is None else UUID(str(snapshot_id_raw))
        except ValueError as exc:
            raise EffectStorageError("deployment contains an invalid UUID") from exc
        try:
            phase = DeploymentPhase(_required_str(raw, "phase"))
            confidence = ObservationConfidence(
                str(raw.get("verification_confidence", ObservationConfidence.UNKNOWN.value))
            )
        except ValueError as exc:
            raise EffectStorageError("deployment phase is invalid") from exc
        snapshot_raw = raw.get("snapshot")
        prior_state_raw = raw.get("prior_state")
        try:
            snapshot = None if snapshot_raw is None else LibraryItem.from_dict(_as_mapping(snapshot_raw, "snapshot"))
        except EffectValidationError as exc:
            raise EffectStorageError(f"deployment snapshot is invalid: {exc}") from exc
        return cls(
            operation_id=operation_id,
            config_entry_id=_required_str(raw, "config_entry_id"),
            diy_code=_required_int(raw, "diy_code"),
            phase=phase,
            compiler_version=_required_int(raw, "compiler_version"),
            artifact_sha256=_required_str(raw, "artifact_sha256"),
            updated_at=_required_str(raw, "updated_at"),
            target_mode=_optional_str(raw, "target_mode") or "custom",
            target_effect=_optional_str(raw, "target_effect"),
            evidence_codes=_string_tuple(raw.get("evidence_codes", ()), "deployment evidence codes"),
            item_id=item_id,
            item_revision=_optional_int(raw, "item_revision"),
            snapshot_id=snapshot_id,
            snapshot=snapshot,
            error_code=_optional_str(raw, "error_code"),
            progress_current=_optional_int(raw, "progress_current", default=0),
            progress_total=_optional_int(raw, "progress_total", default=0),
            verification_confidence=confidence,
            prior_state=(
                None
                if prior_state_raw is None
                else PriorControlState.from_dict(_as_mapping(prior_state_raw, "prior control state"))
            ),
        )


@dataclass(frozen=True, slots=True)
class DeploymentSnapshot:
    revision: int
    records: tuple[DeploymentRecord, ...]


class EffectDeploymentRepository:
    def __init__(self, hass: HomeAssistant | VersionedDocumentStore) -> None:
        self._store = _deployment_store(hass) if isinstance(hass, HomeAssistant) else hass
        self._lock = asyncio.Lock()
        self._data: dict[str, Any] | None = None
        self._listeners: set[Callable[[DeploymentSnapshot], None]] = set()

    async def async_load(self) -> DeploymentSnapshot:
        async with self._lock:
            stored = await self._store.async_load()
            data: dict[str, Any] = {"revision": 0, "records": {}} if stored is None else stored
            snapshot, data = _load_deployments(data)
            interrupted = {}
            for record in snapshot.records:
                if record.phase is DeploymentPhase.COMPILING:
                    interrupted[str(record.operation_id)] = replace(
                        record,
                        phase=DeploymentPhase.FAILED,
                        error_code="home_assistant_restarted_before_write",
                    ).to_dict()
                elif record.phase in {
                    DeploymentPhase.UPLOADING,
                    DeploymentPhase.ACTIVATING,
                    DeploymentPhase.VERIFYING,
                    DeploymentPhase.RECOVERING,
                }:
                    interrupted[str(record.operation_id)] = replace(
                        record,
                        phase=DeploymentPhase.UNCERTAIN,
                        error_code="home_assistant_restarted",
                    ).to_dict()
            if interrupted:
                data = copy.deepcopy(data)
                data["records"].update(interrupted)
                data["revision"] += 1
                snapshot = _validate_deployments(data)
                await self._store.async_save(data)
            elif stored is not None and data != stored:
                await self._store.async_save(data)
            self._data = copy.deepcopy(data)
            return snapshot

    def snapshot(self) -> DeploymentSnapshot:
        return _validate_deployments(self._require_loaded())

    def subscribe(
        self,
        listener: Callable[[DeploymentSnapshot], None],
    ) -> Callable[[], None]:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)

    def get(self, operation_id: UUID) -> DeploymentRecord:
        records = cast(dict[str, Any], self._require_loaded()["records"])
        raw = records.get(str(operation_id))
        if not isinstance(raw, Mapping):
            raise EffectNotFoundError(f"deployment {operation_id} does not exist")
        return DeploymentRecord.from_dict(cast(Mapping[str, Any], raw))

    def get_optional(self, operation_id: UUID) -> DeploymentRecord | None:
        try:
            return self.get(operation_id)
        except EffectNotFoundError:
            return None

    def latest_for_diy_code(
        self,
        config_entry_id: str,
        diy_code: int,
    ) -> DeploymentRecord | None:
        matching = tuple(
            record
            for record in self.snapshot().records
            if record.config_entry_id == config_entry_id
            and record.target_mode == "custom"
            and record.diy_code == diy_code
        )
        return max(matching, key=lambda record: record.updated_at, default=None)

    def latest_for_effect(
        self,
        config_entry_id: str,
        effect: str,
    ) -> DeploymentRecord | None:
        matching = tuple(
            record
            for record in self.snapshot().records
            if record.config_entry_id == config_entry_id
            and record.target_mode == "scene"
            and record.target_effect == effect
        )
        return max(matching, key=lambda record: record.updated_at, default=None)

    async def async_put(
        self,
        record: DeploymentRecord,
        *,
        expected_revision: int | None,
    ) -> DeploymentSnapshot:
        async with self._lock:
            current = self._require_loaded()
            revision = cast(int, current["revision"])
            if expected_revision is not None and revision != expected_revision:
                raise EffectRevisionConflictError(revision)
            candidate = copy.deepcopy(current)
            key = str(record.operation_id)
            if key not in candidate["records"] and len(candidate["records"]) >= MAX_DEPLOYMENT_RECORDS:
                _remove_oldest_terminal_deployment(candidate["records"])
            candidate["records"][str(record.operation_id)] = record.to_dict()
            candidate["revision"] += 1
            snapshot = _validate_deployments(candidate)
            await self._store.async_save(candidate)
            self._data = candidate
            for listener in tuple(self._listeners):
                try:
                    listener(snapshot)
                except Exception:
                    _LOGGER.exception("Effect deployment subscriber failed after a committed write")
            return snapshot

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise EffectStorageError("deployment store has not been loaded")
        return self._data


def _deployment_store(hass: HomeAssistant) -> VersionedDocumentStore:
    return HomeAssistantVersionedDocumentStore(
        hass,
        DEPLOYMENT_STORE_VERSION,
        DEPLOYMENT_STORE_KEY,
        minor_version=DEPLOYMENT_STORE_MINOR_VERSION,
        migrate=_async_migrate_deployments,
    )


async def _async_migrate_deployments(
    old_major_version: int,
    old_minor_version: int,
    old_data: dict[str, Any],
) -> dict[str, Any]:
    if old_major_version == DEPLOYMENT_STORE_VERSION and old_minor_version <= DEPLOYMENT_STORE_MINOR_VERSION:
        return old_data
    raise EffectStorageError(f"cannot migrate deployment store version {old_major_version}.{old_minor_version}")


@dataclass(frozen=True, slots=True)
class ObservedDeviceState:
    config_entry_id: str
    mode: str
    observed_at: str
    confidence: ObservationConfidence = ObservationConfidence.UNKNOWN
    diy_code: int | None = None
    effect: str | None = None
    matched_operation_id: UUID | None = None

    def __post_init__(self) -> None:
        validate_bounded_string(
            self.config_entry_id,
            "observed config entry ID",
            maximum=MAX_IDENTIFIER_LENGTH,
            error_type=EffectStorageError,
        )
        validate_bounded_string(
            self.mode,
            "observed mode",
            maximum=MAX_IDENTIFIER_LENGTH,
            error_type=EffectStorageError,
        )
        validate_timestamp(
            self.observed_at,
            "observation timestamp",
            error_type=EffectStorageError,
        )
        if self.diy_code is not None and not 0 <= self.diy_code <= 0xFFFF:
            raise EffectStorageError("observed DIY code must be from 0 to 65535")
        if self.effect is not None:
            validate_bounded_string(
                self.effect,
                "observed effect",
                maximum=MAX_IDENTIFIER_LENGTH,
                error_type=EffectStorageError,
            )

    def to_dict(self) -> dict[str, Any]:
        return {
            "config_entry_id": self.config_entry_id,
            "mode": self.mode,
            "observed_at": self.observed_at,
            "confidence": self.confidence.value,
            "diy_code": self.diy_code,
            "effect": self.effect,
            "matched_operation_id": (str(self.matched_operation_id) if self.matched_operation_id is not None else None),
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> ObservedDeviceState:
        operation_raw = raw.get("matched_operation_id")
        try:
            operation_id = None if operation_raw is None else UUID(str(operation_raw))
            confidence = ObservationConfidence(_required_str(raw, "confidence"))
        except ValueError as exc:
            raise EffectStorageError("observed device state is invalid") from exc
        return cls(
            config_entry_id=_required_str(raw, "config_entry_id"),
            mode=_required_str(raw, "mode"),
            observed_at=_required_str(raw, "observed_at"),
            confidence=confidence,
            diy_code=_optional_int(raw, "diy_code"),
            effect=_optional_str(raw, "effect"),
            matched_operation_id=operation_id,
        )


class EffectDeviceCache:
    def __init__(self, hass: HomeAssistant | VersionedDocumentStore) -> None:
        self._store = _device_cache_store(hass) if isinstance(hass, HomeAssistant) else hass
        self._data: dict[str, Any] | None = None

    async def async_load(self) -> tuple[ObservedDeviceState, ...]:
        stored = await self._store.async_load()
        data = {"devices": {}} if stored is None else stored
        states, data = _load_device_cache(data)
        stale_states = tuple(
            replace(
                state,
                confidence=ObservationConfidence.UNKNOWN,
                matched_operation_id=None,
            )
            for state in states
        )
        if stale_states != states:
            data = {"devices": {state.config_entry_id: state.to_dict() for state in stale_states}}
            self._store.async_delay_save(lambda: copy.deepcopy(data), delay=5)
            states = stale_states
        elif stored is not None and data != stored:
            await self._store.async_save(data)
        self._data = copy.deepcopy(data)
        return states

    def get(self, config_entry_id: str) -> ObservedDeviceState | None:
        devices = cast(dict[str, Any], self._require_loaded()["devices"])
        raw = devices.get(config_entry_id)
        return None if not isinstance(raw, Mapping) else ObservedDeviceState.from_dict(cast(Mapping[str, Any], raw))

    def set(self, state: ObservedDeviceState) -> None:
        candidate = copy.deepcopy(self._require_loaded())
        if state.config_entry_id not in candidate["devices"] and len(candidate["devices"]) >= MAX_DEVICE_CACHE_ENTRIES:
            oldest = min(
                candidate["devices"].values(),
                key=lambda raw: _required_str(_as_mapping(raw, "device state"), "observed_at"),
            )
            oldest_id = _required_str(_as_mapping(oldest, "device state"), "config_entry_id")
            candidate["devices"].pop(oldest_id, None)
        candidate["devices"][state.config_entry_id] = state.to_dict()
        _validate_device_cache(candidate)
        self._data = candidate
        self._store.async_delay_save(lambda: copy.deepcopy(self._require_loaded()), delay=5)

    def remove(self, config_entry_id: str) -> None:
        candidate = copy.deepcopy(self._require_loaded())
        candidate["devices"].pop(config_entry_id, None)
        self._data = candidate
        self._store.async_delay_save(lambda: copy.deepcopy(self._require_loaded()), delay=5)

    async def async_flush(self) -> None:
        await self._store.async_save(copy.deepcopy(self._require_loaded()))

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise EffectStorageError("device cache has not been loaded")
        return self._data


def _device_cache_store(hass: HomeAssistant) -> VersionedDocumentStore:
    return HomeAssistantVersionedDocumentStore(
        hass,
        DEVICE_CACHE_STORE_VERSION,
        DEVICE_CACHE_STORE_KEY,
        minor_version=DEVICE_CACHE_STORE_MINOR_VERSION,
        migrate=_async_migrate_device_cache,
    )


async def _async_migrate_device_cache(
    old_major_version: int,
    old_minor_version: int,
    old_data: dict[str, Any],
) -> dict[str, Any]:
    if old_major_version == DEVICE_CACHE_STORE_VERSION and old_minor_version <= DEVICE_CACHE_STORE_MINOR_VERSION:
        return old_data
    raise EffectStorageError(f"cannot migrate device-cache store version {old_major_version}.{old_minor_version}")


def _validate_deployments(data: object) -> DeploymentSnapshot:
    raw = _as_mapping(data, "deployment store")
    validate_json_document(
        raw,
        "deployment store",
        maximum_bytes=MAX_DEPLOYMENT_STORE_BYTES,
        error_type=EffectStorageError,
        maximum_nodes=MAX_STORE_JSON_NODES,
    )
    revision = _required_non_negative_int(raw, "revision")
    records = _required_mapping(raw, "records")
    if len(records) > MAX_DEPLOYMENT_RECORDS:
        raise EffectLimitError(f"deployment history must not exceed {MAX_DEPLOYMENT_RECORDS} records")
    parsed = tuple(
        DeploymentRecord.from_dict(_as_mapping(record, f"deployment {key}")) for key, record in records.items()
    )
    if any(str(record.operation_id) != str(key) for key, record in zip(records, parsed, strict=True)):
        raise EffectStorageError("deployment record key does not match operation ID")
    return DeploymentSnapshot(revision, parsed)


def _validate_device_cache(data: object) -> tuple[ObservedDeviceState, ...]:
    raw = _as_mapping(data, "device cache")
    validate_json_document(
        raw,
        "device cache",
        maximum_bytes=MAX_DEVICE_CACHE_STORE_BYTES,
        error_type=EffectStorageError,
        maximum_nodes=MAX_STORE_JSON_NODES,
    )
    devices = _required_mapping(raw, "devices")
    if len(devices) > MAX_DEVICE_CACHE_ENTRIES:
        raise EffectLimitError(f"device cache must not exceed {MAX_DEVICE_CACHE_ENTRIES} records")
    states = tuple(
        ObservedDeviceState.from_dict(_as_mapping(state, f"device state {key}")) for key, state in devices.items()
    )
    if any(state.config_entry_id != key for key, state in zip(devices, states, strict=True)):
        raise EffectStorageError("device-cache key does not match config entry ID")
    return states


def _load_deployments(data: object) -> tuple[DeploymentSnapshot, dict[str, Any]]:
    raw = _as_mapping(data, "deployment store")
    revision = _required_non_negative_int(raw, "revision")
    records = _required_mapping(raw, "records")
    cleaned: dict[str, Any] = {}
    invalid = 0
    for key, value in records.items():
        try:
            validate_json_document(
                value,
                f"deployment {key}",
                maximum_bytes=MAX_DEPLOYMENT_STORE_BYTES,
                error_type=EffectStorageError,
            )
            record = DeploymentRecord.from_dict(_as_mapping(value, "deployment"))
            if str(record.operation_id) != str(key):
                raise EffectStorageError("deployment record key does not match operation ID")
            record = _normalise_legacy_deployment(record)
        except EffectStorageError:
            invalid += 1
            continue
        cleaned[str(key)] = record.to_dict()
    while len(cleaned) > MAX_DEPLOYMENT_RECORDS:
        _remove_oldest_terminal_deployment(cleaned)
    candidate = {"revision": revision + (1 if invalid or len(cleaned) != len(records) else 0), "records": cleaned}
    snapshot = _validate_deployments(candidate)
    if invalid:
        _LOGGER.warning("Discarded %d invalid Effect Studio deployment record(s)", invalid)
    return snapshot, candidate


def _load_device_cache(data: object) -> tuple[tuple[ObservedDeviceState, ...], dict[str, Any]]:
    raw = _as_mapping(data, "device cache")
    devices = _required_mapping(raw, "devices")
    states: list[ObservedDeviceState] = []
    invalid = 0
    for key, value in devices.items():
        try:
            validate_json_document(
                value,
                f"device state {key}",
                maximum_bytes=MAX_DEVICE_CACHE_STORE_BYTES,
                error_type=EffectStorageError,
            )
            state = ObservedDeviceState.from_dict(_as_mapping(value, "device state"))
            if state.config_entry_id != key:
                raise EffectStorageError("device-cache key does not match config entry ID")
        except EffectStorageError:
            invalid += 1
            continue
        states.append(state)
    states.sort(key=lambda state: state.observed_at, reverse=True)
    states = states[:MAX_DEVICE_CACHE_ENTRIES]
    candidate = {"devices": {state.config_entry_id: state.to_dict() for state in states}}
    if invalid:
        _LOGGER.warning("Discarded %d invalid Effect Studio device-cache record(s)", invalid)
    return _validate_device_cache(candidate), candidate


def _remove_oldest_terminal_deployment(records: dict[str, Any]) -> None:
    terminal = [
        DeploymentRecord.from_dict(_as_mapping(raw, "deployment"))
        for raw in records.values()
        if _required_str(_as_mapping(raw, "deployment"), "phase")
        in {
            DeploymentPhase.CONFIRMED.value,
            DeploymentPhase.UNCERTAIN.value,
            DeploymentPhase.FAILED.value,
            DeploymentPhase.INTERRUPTED.value,
            DeploymentPhase.UNKNOWN.value,
        }
    ]
    if not terminal:
        raise EffectLimitError(f"deployment history cannot exceed {MAX_DEPLOYMENT_RECORDS} active records")
    oldest = min(terminal, key=lambda record: record.updated_at)
    records.pop(str(oldest.operation_id), None)


def _normalise_legacy_deployment(record: DeploymentRecord) -> DeploymentRecord:
    if record.phase is DeploymentPhase.PENDING:
        return replace(record, phase=DeploymentPhase.COMPILING)
    if record.phase in {DeploymentPhase.INTERRUPTED, DeploymentPhase.UNKNOWN}:
        return replace(record, phase=DeploymentPhase.UNCERTAIN)
    return record


def _as_mapping(value: object, name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise EffectStorageError(f"{name} must be a mapping")
    return cast(Mapping[str, Any], value)


def _required_mapping(raw: Mapping[str, Any], key: str) -> Mapping[str, Any]:
    if key not in raw:
        raise EffectStorageError(f"missing required field {key!r}")
    return _as_mapping(raw[key], key)


def _required_str(raw: Mapping[str, Any], key: str) -> str:
    value = raw.get(key)
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string")
    return value


def _string_tuple(value: object, name: str) -> tuple[str, ...]:
    if not isinstance(value, list | tuple):
        raise EffectStorageError(f"{name} must be a sequence")
    if any(not isinstance(item, str) for item in value):
        raise EffectStorageError(f"{name} must contain strings")
    return tuple(value)


def _optional_str(raw: Mapping[str, Any], key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string or null")
    return value


def _required_int(raw: Mapping[str, Any], key: str) -> int:
    value = raw.get(key)
    if not isinstance(value, int) or isinstance(value, bool):
        raise EffectStorageError(f"{key} must be an integer")
    return value


def _required_non_negative_int(raw: Mapping[str, Any], key: str) -> int:
    value = _required_int(raw, key)
    if not 0 <= value <= MAX_REVISION:
        raise EffectStorageError(f"{key} must not be negative")
    return value


@overload
def _optional_int(raw: Mapping[str, Any], key: str, *, default: int) -> int: ...


@overload
def _optional_int(raw: Mapping[str, Any], key: str, *, default: None = None) -> int | None: ...


def _optional_int(raw: Mapping[str, Any], key: str, *, default: int | None = None) -> int | None:
    value = raw.get(key)
    if value is None:
        return default
    if not isinstance(value, int) or isinstance(value, bool):
        raise EffectStorageError(f"{key} must be an integer or null")
    return value


def _required_bool(raw: Mapping[str, Any], key: str) -> bool:
    value = raw.get(key)
    if not isinstance(value, bool):
        raise EffectStorageError(f"{key} must be a boolean")
    return value


@overload
def _optional_bool(raw: Mapping[str, Any], key: str, *, default: bool) -> bool: ...


@overload
def _optional_bool(raw: Mapping[str, Any], key: str, *, default: None = None) -> bool | None: ...


def _optional_bool(raw: Mapping[str, Any], key: str, *, default: bool | None = None) -> bool | None:
    value = raw.get(key)
    if value is None:
        return default
    if not isinstance(value, bool):
        raise EffectStorageError(f"{key} must be a boolean or null")
    return value


def _validate_rgb(value: tuple[int, int, int], name: str) -> None:
    if (
        not isinstance(value, tuple)
        or len(value) != 3
        or any(
            not isinstance(channel, int) or isinstance(channel, bool) or not 0 <= channel <= 0xFF for channel in value
        )
    ):
        raise EffectStorageError(f"{name} must contain three channels from 0 to 255")


def _required_rgb(raw: Mapping[str, Any], key: str) -> tuple[int, int, int]:
    value = raw.get(key)
    if not isinstance(value, list | tuple) or len(value) != 3:
        raise EffectStorageError(f"{key} must be an RGB colour")
    resolved = cast(tuple[int, int, int], tuple(value))
    _validate_rgb(resolved, key)
    return resolved


def _optional_rgb(raw: Mapping[str, Any], key: str) -> tuple[int, int, int] | None:
    value = raw.get(key)
    return None if value is None else _required_rgb({key: value}, key)
