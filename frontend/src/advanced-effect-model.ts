import type {
  AdvancedContent,
  BrightnessOrder,
  BrightnessPattern,
  EffectLayer,
  LayeredSceneContent,
  Movement,
  SelectionType,
} from "./types";
import { clampInteger, clonePalette } from "./ui-utils";

export const KNOWN_SELECTION_TYPES: readonly SelectionType[] = [1, 2, 0, 3];
export const KNOWN_BRIGHTNESS_ORDERS: readonly BrightnessOrder[] = [0, 1, 2, 3];

export function blankAdvancedContent(): AdvancedContent {
  return {
    kind: "advanced",
    layers: [blankLayer()],
  };
}

export function cloneAdvancedContent(
  content: AdvancedContent,
): AdvancedContent {
  return {
    kind: "advanced",
    layers: content.layers.map(cloneLayer),
  };
}

export function cloneLayeredSceneContent(
  content: LayeredSceneContent,
): LayeredSceneContent {
  return {
    ...content,
    template: { ...content.template },
    effect: {
      layers: cloneAdvancedContent({
        kind: "advanced",
        layers: content.effect.layers,
      }).layers,
    },
  };
}

export function blankLayer(): EffectLayer {
  return {
    area: {
      start_tenths: 0,
      width_tenths: 10,
    },
    selection: {
      type: 0,
      param_1: 0,
      param_2: 1,
    },
    brightness_gradient: false,
    brightness_patterns: [blankBrightnessPattern()],
    distribution: {
      method: 1,
      backwards: false,
    },
    colour_speed: 128,
    colour_retention: 20,
    palette: [
      [255, 0, 0],
      [0, 0, 255],
    ],
    selected_movement: blankMovement(),
    overall_movement: blankMovement(),
    priority: 0,
    unknown_flags: 0,
    excess: "",
  };
}

export function blankBrightnessPattern(): BrightnessPattern {
  return {
    scope_high: 255,
    scope_low: 0,
    order: 0,
    change_speed: 128,
    brightest_retention: 20,
    darkest_retention: 20,
  };
}

function blankMovement(): Movement {
  return {
    enabled: false,
    enter_exit: false,
    direction: 0,
    distance: 1,
    speed: 128,
    unknown_flags: 0,
  };
}

export function cloneLayer(layer: EffectLayer): EffectLayer {
  return {
    ...layer,
    area: { ...layer.area },
    selection: { ...layer.selection },
    brightness_patterns: layer.brightness_patterns.map((pattern) => ({
      ...pattern,
    })),
    distribution: { ...layer.distribution },
    palette: clonePalette(layer.palette),
    selected_movement: { ...layer.selected_movement },
    overall_movement: { ...layer.overall_movement },
  };
}

export function isKnownSelectionType(value: number): value is SelectionType {
  return KNOWN_SELECTION_TYPES.includes(value as SelectionType);
}

export function isKnownBrightnessOrder(
  value: number,
): value is BrightnessOrder {
  return KNOWN_BRIGHTNESS_ORDERS.includes(value as BrightnessOrder);
}

export function bytePercent(value: number): number {
  return Math.round((clampInteger(value, 0, 255) / 255) * 100);
}

export function hexByte(value: number): string {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

export function parseHexByte(value: string): number | undefined {
  const normalised = value.trim().replace(/^0x/i, "");
  if (!/^[0-9a-f]{1,2}$/i.test(normalised)) {
    return undefined;
  }
  return Number.parseInt(normalised, 16);
}

export function segmentOverlapsArea(
  index: number,
  segmentCount: number,
  start: number,
  end: number,
): boolean {
  const segmentStart = (index * 10) / segmentCount;
  const segmentEnd = ((index + 1) * 10) / segmentCount;
  return segmentEnd > start && segmentStart < end;
}
