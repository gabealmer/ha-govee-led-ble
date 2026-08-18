"""Shared errors and field validation for persisted Effect Studio documents."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, cast, overload


class EffectStorageError(RuntimeError):
    """Persisted effect data is unavailable or internally inconsistent."""


class EffectVersionConflictError(EffectStorageError):
    """A mutation was based on an outdated document version."""

    def __init__(self, current_version: int) -> None:
        super().__init__(f"effect version conflict; current version is {current_version}")
        self.current_version = current_version


class EffectNotFoundError(EffectStorageError):
    """A requested effect does not exist."""


class EffectLimitError(EffectStorageError):
    """A bounded Effect Studio collection cannot accept more data."""


def as_persisted_mapping(value: object, name: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise EffectStorageError(f"{name} must be a mapping")
    return cast(Mapping[str, Any], value)


def required_persisted_mapping(raw: Mapping[str, Any], key: str) -> Mapping[str, Any]:
    if key not in raw:
        raise EffectStorageError(f"missing required field {key!r}")
    return as_persisted_mapping(raw[key], key)


def required_persisted_string(raw: Mapping[str, Any], key: str) -> str:
    value = raw.get(key)
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string")
    return value


def optional_persisted_string(raw: Mapping[str, Any], key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    if not isinstance(value, str):
        raise EffectStorageError(f"{key} must be a string or null")
    return value


def required_persisted_integer(raw: Mapping[str, Any], key: str) -> int:
    value = raw.get(key)
    if not isinstance(value, int) or isinstance(value, bool):
        raise EffectStorageError(f"{key} must be an integer")
    return value


@overload
def optional_persisted_integer(raw: Mapping[str, Any], key: str, *, default: int) -> int: ...


@overload
def optional_persisted_integer(
    raw: Mapping[str, Any],
    key: str,
    *,
    default: None = None,
) -> int | None: ...


def optional_persisted_integer(
    raw: Mapping[str, Any],
    key: str,
    *,
    default: int | None = None,
) -> int | None:
    value = raw.get(key)
    if value is None:
        return default
    if not isinstance(value, int) or isinstance(value, bool):
        raise EffectStorageError(f"{key} must be an integer or null")
    return value
