"""Versioned contracts shared by the advanced backend and frontend."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Final

from .effect_domain import EFFECT_SCHEMA_VERSION, JsonValue
from .effect_limits import (
    MAX_DEPLOYMENT_RECORDS,
    MAX_DRAFTS_PER_OWNER,
    MAX_EDITOR_DEVICES,
    MAX_EFFECT_DOCUMENT_BYTES,
    MAX_EFFECT_NAME_LENGTH,
    MAX_LIBRARY_ITEMS,
    MAX_SCENE_CATALOGUE_ENTRIES,
)

EDITOR_API_VERSION: Final = 1
EDITOR_ASSET_VERSION: Final = 1
EFFECT_COMPILER_VERSION: Final = 1


class CapabilityState(StrEnum):
    SUPPORTED = "supported"
    UNSUPPORTED = "unsupported"
    EVIDENCE_GAP = "evidence_gap"


@dataclass(frozen=True, slots=True)
class EditorApiInfo:
    api_version: int = EDITOR_API_VERSION
    effect_schema_version: int = EFFECT_SCHEMA_VERSION
    compiler_version: int = EFFECT_COMPILER_VERSION

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "api_version": self.api_version,
            "effect_schema_version": self.effect_schema_version,
            "compiler_version": self.compiler_version,
            "limits": {
                "effect_name": MAX_EFFECT_NAME_LENGTH,
                "effect_document_bytes": MAX_EFFECT_DOCUMENT_BYTES,
                "devices": MAX_EDITOR_DEVICES,
                "library_items": MAX_LIBRARY_ITEMS,
                "drafts_per_owner": MAX_DRAFTS_PER_OWNER,
                "deployment_records": MAX_DEPLOYMENT_RECORDS,
                "scene_catalogue_entries": MAX_SCENE_CATALOGUE_ENTRIES,
            },
        }


@dataclass(frozen=True, slots=True)
class DeviceEffectCapabilities:
    config_entry_id: str
    model: str
    display_name: str
    segment_count: int
    painted: CapabilityState
    single: CapabilityState
    multi: CapabilityState
    advanced: CapabilityState
    readback: str

    def to_dict(self) -> dict[str, JsonValue]:
        return {
            "config_entry_id": self.config_entry_id,
            "model": self.model,
            "display_name": self.display_name,
            "segment_count": self.segment_count,
            "custom_effects": {
                "painted": self.painted.value,
                "single": self.single.value,
                "multi": self.multi.value,
                "advanced": self.advanced.value,
            },
            "readback": self.readback,
        }


def device_effect_capabilities(
    config_entry_id: str,
    model: str,
    display_name: str,
    segment_count: int,
) -> DeviceEffectCapabilities:
    if model == "H617A":
        return DeviceEffectCapabilities(
            config_entry_id=config_entry_id,
            model=model,
            display_name=display_name,
            segment_count=segment_count,
            painted=CapabilityState.SUPPORTED,
            single=CapabilityState.SUPPORTED,
            multi=CapabilityState.SUPPORTED,
            advanced=CapabilityState.EVIDENCE_GAP,
            readback="diy_code_only",
        )
    return DeviceEffectCapabilities(
        config_entry_id=config_entry_id,
        model=model,
        display_name=display_name,
        segment_count=segment_count,
        painted=CapabilityState.UNSUPPORTED,
        single=CapabilityState.UNSUPPORTED,
        multi=CapabilityState.UNSUPPORTED,
        advanced=CapabilityState.EVIDENCE_GAP,
        readback="mode_only",
    )
