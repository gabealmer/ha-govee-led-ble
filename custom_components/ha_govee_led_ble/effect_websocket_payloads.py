"""Public payload builders for Effect Studio WebSocket responses."""

from typing import Any

from .effect_domain import (
    BuiltinScene,
    LayeredScene,
    LibraryItem,
    PaletteScene,
    effect_content_to_dict,
)
from .effect_drafts import EffectDraft
from .effect_storage import LibrarySnapshot


def item_summary(item: LibraryItem) -> dict[str, Any]:
    content = effect_content_to_dict(item.content)
    kind = content["kind"]
    summary = {
        "id": str(item.id),
        "revision": item.revision,
        "name": item.name,
        "kind": kind,
    }
    model = (
        content.get("model")
        if kind
        in {
            "palette_diy",
            "music_profile",
            "video_profile",
            "workshop",
            "special_diy",
        }
        else None
    )
    if model in {"H617A", "H6199"}:
        summary["model"] = model
    elif kind in {"h617a_painted", "h617a_single", "h617a_multi"}:
        summary["model"] = "H617A"
    elif kind in {"scene_builtin", "scene_palette", "scene_layered"}:
        template = content.get("template")
        if isinstance(template, dict) and template.get("sku") in {"H617A", "H6199"}:
            summary["model"] = template["sku"]
    elif item.target_hint is not None and item.target_hint.model in {"H617A", "H6199"}:
        summary["model"] = item.target_hint.model
    if isinstance(item.content, BuiltinScene | PaletteScene | LayeredScene):
        summary["template"] = content["template"]
    return summary


def library_snapshot_payload(snapshot: LibrarySnapshot) -> dict[str, Any]:
    return {
        "library_revision": snapshot.library_revision,
        "items": [item_summary(item) for item in snapshot.items],
    }


def draft_summary(draft: EffectDraft) -> dict[str, Any]:
    return {
        "id": str(draft.id),
        "revision": draft.revision,
        "name": draft.item.name,
        "updated_at": draft.updated_at,
        "selected_config_entry_id": draft.selected_config_entry_id,
    }
