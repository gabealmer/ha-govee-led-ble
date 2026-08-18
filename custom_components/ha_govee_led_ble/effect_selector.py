"""Saved-effect projection for Home Assistant light selectors."""

from __future__ import annotations

from collections import Counter
from collections.abc import Iterable
from uuid import UUID

from homeassistant.components.light import EFFECT_OFF

from .const import MUSIC_MODES
from .effect_compiler import CompatibilityState, compatibility
from .effect_domain import EffectValidationError, LibraryItem
from .scenes import MODEL_SCENE_LABELS

_EFFECT_QUOTE_CHARS = "\"'“”‘’"

VIDEO_EFFECTS: dict[str, str] = {
    "Video: Movie": "movie",
    "Video: Game": "game",
}
MUSIC_EFFECTS: dict[str, str] = {f"Music: {name.title()}": name.replace(" ", "_") for name in MUSIC_MODES}


def normalise_effect_name(effect_name: str) -> str:
    stripped = effect_name.strip().strip(_EFFECT_QUOTE_CHARS).strip()
    return " ".join(stripped.split()).casefold()


_RESERVED_EFFECT_NAMES = frozenset(
    normalise_effect_name(label)
    for label in (
        EFFECT_OFF,
        *VIDEO_EFFECTS,
        *MUSIC_EFFECTS,
        *(label for labels in MODEL_SCENE_LABELS.values() for label in labels.values()),
    )
)


def validate_saved_effect_name(
    name: str,
    items: Iterable[LibraryItem],
    *,
    excluding_item_id: UUID | None = None,
) -> None:
    key = normalise_effect_name(name)
    if key in _RESERVED_EFFECT_NAMES:
        raise EffectValidationError(f"effect name {name!r} is reserved by Home Assistant")
    if any(item.id != excluding_item_id and normalise_effect_name(item.name) == key for item in items):
        raise EffectValidationError(f"effect name {name!r} is already in use")


def compatible_saved_effects(
    items: Iterable[LibraryItem],
    model: str,
) -> tuple[LibraryItem, ...]:
    compatible = [item for item in items if compatibility(item, model).state is CompatibilityState.COMPATIBLE]
    counts = Counter(normalise_effect_name(item.name) for item in compatible)
    return tuple(
        sorted(
            (
                item
                for item in compatible
                if counts[normalise_effect_name(item.name)] == 1
                and normalise_effect_name(item.name) not in _RESERVED_EFFECT_NAMES
            ),
            key=lambda item: item.name.casefold(),
        )
    )


def saved_effect_by_name(
    items: Iterable[LibraryItem],
    model: str,
    effect_name: str,
) -> LibraryItem | None:
    key = normalise_effect_name(effect_name)
    matches = [
        item
        for item in items
        if normalise_effect_name(item.name) == key and compatibility(item, model).state is CompatibilityState.COMPATIBLE
    ]
    if len(matches) > 1:
        raise EffectValidationError(f"saved effect name {effect_name!r} is ambiguous")
    if key in _RESERVED_EFFECT_NAMES:
        return None
    return matches[0] if matches else None
