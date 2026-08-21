import { isKnownSelectionType } from "./advanced-effect-model";
import type { ReorderableStripItem } from "./reorderable-strip-model";
import type { SelectionType } from "./types";

export const AUTHORING_LAYER_LIMIT = 5;
export const AUTHORING_PALETTE_LIMIT = 8;
export const DEFAULT_SEGMENT_COUNT = 15;

export const FILL_PATTERN_LABELS: Record<SelectionType, string> = {
  0: "Segment",
  1: "Continuous",
  2: "Random",
  3: "Custom",
};

export type FillPatternParameterKey = "param_1" | "param_2";
export type FillPatternParameter = readonly [
  FillPatternParameterKey,
  string,
];

export const FILL_PATTERN_PARAMETERS: Record<
  SelectionType,
  readonly FillPatternParameter[]
> = {
  0: [["param_2", "Segment count"]],
  1: [["param_2", "LED count"]],
  2: [
    ["param_2", "Minimum LED count"],
    ["param_1", "Maximum LED count"],
  ],
  3: [
    ["param_1", "Lit length"],
    ["param_2", "Gap"],
  ],
};

export type AdvancedLayerActionKind = "copy" | "delete";

export interface AdvancedLayerAction {
  kind: AdvancedLayerActionKind;
  label: string;
  glyph: string;
  danger: boolean;
  disabled: boolean;
}

export function fillPatternParameters(
  type: number,
): readonly FillPatternParameter[] {
  return isKnownSelectionType(type)
    ? FILL_PATTERN_PARAMETERS[type]
    : [];
}

export function advancedLayerItems(
  layerCount: number,
): ReorderableStripItem[] {
  return numberedStripItems(
    layerCount,
    "layer",
    "Layer",
    "advanced-layer-tab",
    "advanced-layer-panel",
    "Drag to reorder or use the Left and Right Arrow keys.",
  );
}

export function advancedBrightnessPatternItems(
  patternCount: number,
): ReorderableStripItem[] {
  return numberedStripItems(
    patternCount,
    "pattern",
    "Pattern",
    "advanced-pattern-tab",
    "advanced-pattern-panel",
  );
}

export function advancedLayerActions(
  layerCount: number,
): AdvancedLayerAction[] {
  return [
    {
      kind: "copy",
      label: "Copy current layer",
      glyph: "⧉",
      danger: false,
      disabled: layerCount >= AUTHORING_LAYER_LIMIT,
    },
    {
      kind: "delete",
      label: "Delete current layer",
      glyph: "×",
      danger: true,
      disabled: layerCount === 1,
    },
  ];
}

function numberedStripItems(
  count: number,
  keyPrefix: string,
  ariaPrefix: string,
  idPrefix: string,
  ariaControls: string,
  ariaDescription?: string,
): ReorderableStripItem[] {
  return Array.from({ length: count }, (_item, index) => ({
    key: `${keyPrefix}-${index}`,
    label: String(index + 1),
    ariaLabel: `${ariaPrefix} ${index + 1}`,
    ariaDescription,
    id: `${idPrefix}-${index}`,
    ariaControls,
  }));
}
