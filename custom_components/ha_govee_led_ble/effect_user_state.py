"""Bounded owner-scoped editor preferences and recent colours."""

from __future__ import annotations

import copy
import logging
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any, Final, cast

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN
from .effect_domain import RGB, JsonValue
from .effect_limits import (
    MAX_IDENTIFIER_LENGTH,
    MAX_PREFERENCES_BYTES,
    MAX_STORE_JSON_NODES,
    MAX_USER_STATE_RECORDS,
    MAX_USER_STATE_STORE_BYTES,
    validate_bounded_string,
    validate_json_document,
)
from .effect_storage import EffectLimitError, EffectStorageError

USER_STATE_STORE_VERSION: Final = 1
USER_STATE_STORE_MINOR_VERSION: Final = 1
USER_STATE_STORE_KEY: Final = f"{DOMAIN}.effect_user_state"
MAX_RECENT_COLOURS: Final = 12

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class EffectUserState:
    owner_id: str
    recent_colours: tuple[RGB, ...] = ()
    preferences: Mapping[str, JsonValue] = field(default_factory=dict)

    def __post_init__(self) -> None:
        validate_bounded_string(
            self.owner_id,
            "user-state owner",
            maximum=MAX_IDENTIFIER_LENGTH,
            error_type=EffectStorageError,
        )
        if len(self.recent_colours) > MAX_RECENT_COLOURS:
            raise EffectStorageError(f"recent colours must not exceed {MAX_RECENT_COLOURS}")
        if len(set(self.recent_colours)) != len(self.recent_colours):
            raise EffectStorageError("recent colours must not contain duplicates")
        for colour in self.recent_colours:
            _validate_rgb(colour)
        preferences = dict(self.preferences)
        validate_json_document(
            preferences,
            "preferences",
            maximum_bytes=MAX_PREFERENCES_BYTES,
            error_type=EffectStorageError,
        )
        object.__setattr__(self, "preferences", preferences)

    def to_dict(self) -> dict[str, Any]:
        return {
            "owner_id": self.owner_id,
            "recent_colours": [list(colour) for colour in self.recent_colours],
            "preferences": dict(self.preferences),
        }

    @classmethod
    def from_dict(cls, raw: Mapping[str, Any]) -> EffectUserState:
        colours_raw = raw.get("recent_colours")
        if not isinstance(colours_raw, Sequence) or isinstance(colours_raw, str | bytes):
            raise EffectStorageError("recent colours must be a list")
        preferences = raw.get("preferences", {})
        if not isinstance(preferences, Mapping):
            raise EffectStorageError("preferences must be a mapping")
        return cls(
            owner_id=_required_str(raw, "owner_id"),
            recent_colours=tuple(_rgb_from_value(colour) for colour in cast(Sequence[object], colours_raw)),
            preferences=cast(dict[str, JsonValue], dict(preferences)),
        )


class _UserStateStore(Store[dict[str, Any]]):
    async def _async_migrate_func(
        self,
        old_major_version: int,
        old_minor_version: int,
        old_data: dict[str, Any],
    ) -> dict[str, Any]:
        if old_major_version == USER_STATE_STORE_VERSION and old_minor_version <= USER_STATE_STORE_MINOR_VERSION:
            return old_data
        raise EffectStorageError(f"cannot migrate user-state store version {old_major_version}.{old_minor_version}")


class EffectUserStateRepository:
    def __init__(self, hass: HomeAssistant) -> None:
        self._store = _UserStateStore(
            hass,
            USER_STATE_STORE_VERSION,
            USER_STATE_STORE_KEY,
            private=True,
            atomic_writes=True,
            minor_version=USER_STATE_STORE_MINOR_VERSION,
        )
        self._data: dict[str, Any] | None = None

    async def async_load(self) -> tuple[EffectUserState, ...]:
        stored = await self._store.async_load()
        data = {"users": {}} if stored is None else stored
        states, cleaned = _load_user_states(data)
        if cleaned != data:
            await self._store.async_save(cleaned)
        self._data = copy.deepcopy(cleaned)
        return states

    def get(self, owner_id: str) -> EffectUserState:
        users = cast(dict[str, Any], self._require_loaded()["users"])
        raw = users.get(owner_id)
        if not isinstance(raw, Mapping):
            return EffectUserState(owner_id)
        return EffectUserState.from_dict(cast(Mapping[str, Any], raw))

    def set(self, state: EffectUserState) -> None:
        current = self._require_loaded()
        if state.owner_id not in current["users"] and len(current["users"]) >= MAX_USER_STATE_RECORDS:
            raise EffectLimitError(f"user-state store must not exceed {MAX_USER_STATE_RECORDS} users")
        candidate = copy.deepcopy(current)
        candidate["users"][state.owner_id] = state.to_dict()
        _validate_user_states(candidate)
        self._data = candidate
        self._store.async_delay_save(lambda: copy.deepcopy(self._require_loaded()), delay=5)

    def record_colour(self, owner_id: str, colour: RGB) -> EffectUserState:
        _validate_rgb(colour)
        current = self.get(owner_id)
        recent = (colour, *(item for item in current.recent_colours if item != colour))
        updated = EffectUserState(
            owner_id,
            recent[:MAX_RECENT_COLOURS],
            current.preferences,
        )
        self.set(updated)
        return updated

    async def async_flush(self) -> None:
        await self._store.async_save(copy.deepcopy(self._require_loaded()))

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise EffectStorageError("user-state store has not been loaded")
        return self._data


def _validate_user_states(data: object) -> tuple[EffectUserState, ...]:
    if not isinstance(data, Mapping):
        raise EffectStorageError("user-state store must be a mapping")
    validate_json_document(
        data,
        "user-state store",
        maximum_bytes=MAX_USER_STATE_STORE_BYTES,
        error_type=EffectStorageError,
        maximum_nodes=MAX_STORE_JSON_NODES,
    )
    users = data.get("users")
    if not isinstance(users, Mapping):
        raise EffectStorageError("user-state users must be a mapping")
    if len(users) > MAX_USER_STATE_RECORDS:
        raise EffectLimitError(f"user-state store must not exceed {MAX_USER_STATE_RECORDS} users")
    states = tuple(EffectUserState.from_dict(_as_mapping(state, f"user state {key}")) for key, state in users.items())
    if any(state.owner_id != key for key, state in zip(users, states, strict=True)):
        raise EffectStorageError("user-state key does not match owner ID")
    return states


def _validate_rgb(value: RGB) -> None:
    if (
        not isinstance(value, tuple)
        or len(value) != 3
        or any(not isinstance(channel, int) or not 0 <= channel <= 255 for channel in value)
    ):
        raise EffectStorageError("recent colour must be an RGB tuple")


def _rgb_from_value(value: object) -> RGB:
    if (
        not isinstance(value, Sequence)
        or isinstance(value, str | bytes)
        or len(value) != 3
        or any(not isinstance(channel, int) for channel in value)
    ):
        raise EffectStorageError("recent colour must contain three integer channels")
    colour = cast(RGB, tuple(value))
    _validate_rgb(colour)
    return colour


def _load_user_states(data: object) -> tuple[tuple[EffectUserState, ...], dict[str, Any]]:
    if not isinstance(data, Mapping):
        raise EffectStorageError("user-state store must be a mapping")
    users = data.get("users")
    if not isinstance(users, Mapping):
        raise EffectStorageError("user-state users must be a mapping")
    states: list[EffectUserState] = []
    invalid = 0
    for key, value in users.items():
        try:
            validate_json_document(
                value,
                f"user state {key}",
                maximum_bytes=MAX_USER_STATE_STORE_BYTES,
                error_type=EffectStorageError,
            )
            state = EffectUserState.from_dict(_as_mapping(value, "user state"))
            if state.owner_id != key:
                raise EffectStorageError("user-state key does not match owner ID")
        except EffectStorageError:
            invalid += 1
            continue
        states.append(state)
    if len(states) > MAX_USER_STATE_RECORDS:
        raise EffectLimitError(f"user-state store must not exceed {MAX_USER_STATE_RECORDS} users")
    candidate = {"users": {state.owner_id: state.to_dict() for state in states}}
    if invalid:
        _LOGGER.warning("Discarded %d invalid Effect Studio user-state record(s)", invalid)
    return _validate_user_states(candidate), candidate


def _as_mapping(value: object, name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise EffectStorageError(f"{name} must be a mapping")
    return cast(Mapping[str, Any], value)


def _required_str(raw: Mapping[str, Any], key: str) -> str:
    value = raw.get(key)
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string")
    return value
