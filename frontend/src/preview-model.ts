import type {
  AdvancedContent,
  BuiltinSceneContent,
  CaptureBackedPreviewProfile,
  CustomEffectCatalogue,
  EffectLayer,
  EffectPair,
  LayeredSceneContent,
  MultiContent,
  PaletteSceneContent,
  PaintedContent,
  RGB,
  SingleContent,
} from "./types";

export type PreviewFidelity =
  | "capture_backed"
  | "deterministic"
  | "structural"
  | "opaque";

export interface PreviewCell {
  colour: RGB;
  source: "background" | "group";
}

export type PreviewSequenceItem =
  | {
      fidelity: "structural";
      id: string;
      label: string;
    }
  | {
      fidelity: "opaque";
      label: string;
      raw: string;
    };

export interface PreviewArea {
  start: number;
  end: number;
  rawStartTenths: number;
  rawWidthTenths: number;
  valid: boolean;
}

export type PreviewField =
  | {
      fidelity: "structural";
      label: string;
      value: string;
    }
  | {
      fidelity: "opaque";
      label: string;
      value: string;
    };

export interface PreviewLayer {
  index: number;
  label: string;
  area: PreviewArea;
  palette: RGB[];
  fields: PreviewField[];
  notices: string[];
}

interface PreviewBase {
  title: string;
  notice: string;
}

export interface DeterministicPreview extends PreviewBase {
  kind: "cells";
  fidelity: "deterministic";
  cells: PreviewCell[];
}

export interface StructuralPalettePreview extends PreviewBase {
  kind: "palette";
  fidelity: "structural";
  palette: RGB[];
  sequence: PreviewSequenceItem[];
}

export interface StructuralLayersPreview extends PreviewBase {
  kind: "layers";
  fidelity: "structural";
  layers: PreviewLayer[];
  activeLayer: number;
}

export interface PreviewSceneStep {
  index: number;
  value: number;
  colour: RGB;
  inlineColour: RGB | null;
}

export interface StructuralScenePreview extends PreviewBase {
  kind: "scene-steps";
  fidelity: "structural";
  layout: 0 | 1;
  brightnessFlag: boolean;
  palette: RGB[];
  steps: PreviewSceneStep[];
}

export interface ObservedCustomAnimationPreview extends PreviewBase {
  kind: "custom-animation";
  fidelity: "capture_backed";
  effect: "jumping" | "fade" | "marquee";
  palette: RGB[];
  segmentCount: number;
  speedPercent: number;
  phaseMilliseconds: number;
  bandWidthSegments: number;
  direction: "towards_last_segment";
}

export interface OpaquePreview extends PreviewBase {
  kind: "opaque";
  fidelity: "opaque";
  palette: RGB[] | null;
  details: string[];
}

interface CaptureBackedPreviewBase extends PreviewBase {
  fidelity: "capture_backed";
  identity: {
    sku: string;
    sceneId: number;
    effectId: number;
  };
  illuminatedSegments: number[];
  limitations: string[];
  evidence: {
    corpusId: string;
    contactSheetSha256: string;
  };
}

export interface CaptureBackedStaticPreview extends CaptureBackedPreviewBase {
  kind: "capture-static";
  cells: RGB[];
}

export interface CaptureBackedDirectionalSweepPreview
  extends CaptureBackedPreviewBase {
  kind: "capture-directional-sweep";
  baseColour: RGB;
  bandColour: RGB;
  direction: "towards_first_segment" | "towards_last_segment";
  periodSeconds: number;
  travellingBands: number;
  seed: number;
  initialStep: number;
  motionUsesReviewedDefaultSpeed: boolean;
}

export type EffectPreviewModel =
  | CaptureBackedStaticPreview
  | CaptureBackedDirectionalSweepPreview
  | ObservedCustomAnimationPreview
  | DeterministicPreview
  | StructuralPalettePreview
  | StructuralLayersPreview
  | StructuralScenePreview
  | OpaquePreview;

export function paintedPreviewModel(
  content: PaintedContent,
): DeterministicPreview {
  const cells: PreviewCell[] = Array.from({ length: 15 }, () => ({
    colour: cloneColour(content.background),
    source: "background",
  }));
  for (const group of content.groups) {
    for (const segment of group.segments) {
      if (segment >= 0 && segment < cells.length) {
        cells[segment] = {
          colour: cloneColour(group.fill),
          source: "group",
        };
      }
    }
  }
  return {
    kind: "cells",
    fidelity: "deterministic",
    title: "Painted segments",
    cells,
    notice:
      "Deterministic preview: only the exact 15-segment background and group map is shown.",
  };
}

export function customEffectPreviewModel(
  content: SingleContent | MultiContent,
  catalogue: CustomEffectCatalogue,
  segmentCount = 15,
): ObservedCustomAnimationPreview | StructuralPalettePreview | OpaquePreview {
  const pairs =
    content.kind === "h617a_single"
      ? [content]
      : content.effects;
  const sequence = pairs.map((pair) => catalogueSequenceItem(pair, catalogue));
  const notice =
    "Structural preview: the saved palette and catalogue-backed effect order are shown. Device animation and behaviour are not simulated.";

  if (content.kind === "h617a_single" && sequence[0]?.fidelity === "opaque") {
    return {
      kind: "opaque",
      fidelity: "opaque",
      title: "Unknown custom effect",
      palette: clonePalette(content.palette),
      details: [sequence[0].raw],
      notice:
        "Opaque preview: this family and variant pair is not present in the Custom Effect Catalogue. The raw identity and palette remain visible without inferred behaviour.",
    };
  }

  if (content.kind === "h617a_single") {
    const template = catalogue.effects.find(
      (effect) =>
        effect.family === content.family && effect.variant === content.variant,
    );
    if (
      template?.id === "jumping" ||
      template?.id === "fade" ||
      template?.id === "marquee"
    ) {
      return observedCustomAnimationPreview(
        content,
        template.id,
        segmentCount,
      );
    }
  }

  return {
    kind: "palette",
    fidelity: "structural",
    title:
      content.kind === "h617a_single"
        ? "Single effect structure"
        : "Multi effect sequence",
    palette: clonePalette(content.palette),
    sequence,
    notice,
  };
}

function observedCustomAnimationPreview(
  content: SingleContent,
  effect: ObservedCustomAnimationPreview["effect"],
  segmentCount: number,
): ObservedCustomAnimationPreview {
  const speedFactor = 0.25 + 1.5 * clamp(content.speed / 100, 0, 1);
  const defaultMilliseconds =
    effect === "marquee" ? 253 : effect === "fade" ? 5_500 : 5_200;
  return {
    kind: "custom-animation",
    fidelity: "capture_backed",
    effect,
    title: `Observed ${effectLabel(effect)} preview`,
    palette: clonePalette(content.palette),
    segmentCount: Math.max(1, Math.round(segmentCount)),
    speedPercent: content.speed,
    phaseMilliseconds: defaultMilliseconds / speedFactor,
    bandWidthSegments: Math.max(1, Math.round(segmentCount * (2 / 15))),
    direction: "towards_last_segment",
    notice:
      "Capture-backed behaviour preview: the observed device animation is replayed with your palette and segment count. Timing is an initial capture-based estimate and scales with Speed.",
  };
}

function effectLabel(
  effect: ObservedCustomAnimationPreview["effect"],
): string {
  return effect[0].toUpperCase() + effect.slice(1);
}

export function advancedPreviewModel(
  content: AdvancedContent,
  activeLayer: number,
): StructuralLayersPreview {
  return {
    kind: "layers",
    fidelity: "structural",
    title: "Layer structure",
    activeLayer,
    layers: content.layers.map(layerPreview),
    notice:
      "Structural preview: documented layer fields, palettes and applied-area fractions are shown. No composite animation or physical LED geometry is inferred.",
  };
}

export function builtinScenePreviewModel(
  content: BuiltinSceneContent,
): OpaquePreview {
  return {
    kind: "opaque",
    fidelity: "opaque",
    title: "Built-in scene identity",
    palette: null,
    details: [
      `Scene ${content.template.scene_id}, effect ${content.template.effect_id}`,
      content.speed_index === null
        ? "Raw speed index: none"
        : `Raw speed index: ${content.speed_index}`,
    ],
    notice:
      "Opaque preview: Scene Type 0 has no documented visual parameters, so no colour, layout, timing or motion preview is shown.",
  };
}

export function captureBackedPreviewModel(
  profile: CaptureBackedPreviewProfile,
  speedContext?: {
    selectedIndex: number | null;
    defaultIndex: number | null;
  },
): CaptureBackedStaticPreview | CaptureBackedDirectionalSweepPreview {
  const base: CaptureBackedPreviewBase = {
    fidelity: "capture_backed",
    title:
      profile.primitive === "static"
        ? "Observed static scene"
        : "Observed directional sweep",
    identity: {
      sku: profile.sku,
      sceneId: profile.scene_id,
      effectId: profile.effect_id,
    },
    illuminatedSegments: [...profile.illuminated_segments],
    limitations: [...profile.limitations],
    evidence: {
      corpusId: profile.evidence.corpus_id,
      contactSheetSha256: profile.evidence.contact_sheet_sha256,
    },
    notice:
      "Capture-backed preview: this is a reviewed recorded capture with spatial lane calibration. Camera colour is uncalibrated. It is not a protocol rendering and does not define device behaviour.",
  };
  if (profile.primitive === "static") {
    return {
      ...base,
      kind: "capture-static",
      cells: clonePalette(profile.palette.segment_rgb),
    };
  }
  const seed = previewSeed(profile.sku, profile.scene_id, profile.effect_id);
  return {
    ...base,
    kind: "capture-directional-sweep",
    baseColour: cloneColour(profile.palette.base_rgb),
    bandColour: cloneColour(profile.palette.band_rgb),
    direction: profile.direction,
    periodSeconds: profile.period_seconds,
    travellingBands: profile.travelling_bands,
    seed,
    initialStep: seed % 15,
    motionUsesReviewedDefaultSpeed:
      speedContext === undefined ||
      (speedContext.defaultIndex !== null &&
        speedContext.selectedIndex === speedContext.defaultIndex),
  };
}

export function paletteScenePreviewModel(
  content: PaletteSceneContent,
): StructuralScenePreview {
  return {
    kind: "scene-steps",
    fidelity: "structural",
    title:
      content.layout === 0
        ? "Captured palette scene structure"
        : "Palette scene structure (schema-only layout 1)",
    layout: content.layout,
    brightnessFlag: content.brightness_flag,
    palette: clonePalette(content.palette),
    steps: content.steps.map((step, index) => ({
      index,
      value: step.value,
      colour: cloneColour(step.colour),
      inlineColour:
        step.inline_colour === null
          ? null
          : cloneColour(step.inline_colour),
    })),
    notice:
      content.layout === 0
        ? "Structural preview: captured layout 0 palette, ordered steps, colours and raw values are shown. Timing, motion and device animation are not inferred."
        : "Schema-only structural preview: synthetic layout 1 structure, ordered steps, colours and raw values are shown. No hardware behaviour, timing, motion or animation is inferred.",
  };
}

export function layeredScenePreviewModel(
  content: LayeredSceneContent,
): StructuralLayersPreview {
  return {
    ...advancedPreviewModel(
      { kind: "advanced", layers: content.effect.layers },
      -1,
    ),
    title: "Captured layered scene structure",
  };
}

function catalogueSequenceItem(
  pair: EffectPair,
  catalogue: CustomEffectCatalogue,
): PreviewSequenceItem {
  const template = catalogue.effects.find(
    (effect) =>
      effect.family === pair.family && effect.variant === pair.variant,
  );
  if (!template) {
    return {
      fidelity: "opaque",
      label: "Unknown catalogue identity",
      raw: `Raw family ${pair.family}, variant ${pair.variant}`,
    };
  }
  return {
    fidelity: "structural",
    id: template.id,
    label: template.label,
  };
}

function layerPreview(layer: EffectLayer, index: number): PreviewLayer {
  const fields: PreviewField[] = [];
  const notices: string[] = [];

  const selection = selectionField(layer);
  fields.push(selection);
  if (selection.fidelity === "opaque") {
    notices.push(
      `Selection type ${layer.selection.type} has unknown structure. Its raw parameters remain visible and no selected cells are inferred.`,
    );
  }

  const distribution = distributionField(layer);
  fields.push(distribution);
  if (distribution.fidelity === "opaque") {
    notices.push(
      `Distribution method ${layer.distribution.method} is unknown. Its raw value remains visible.`,
    );
  }

  fields.push({
    fidelity: "structural",
    label: "Colour timing",
    value: `speed ${layer.colour_speed}; retention ${layer.colour_retention}`,
  });

  if (layer.brightness_patterns.length === 0) {
    fields.push({
      fidelity: "structural",
      label: "Brightness",
      value: "No pattern records",
    });
  } else {
    layer.brightness_patterns.forEach((pattern, patternIndex) => {
      const knownOrder = pattern.order >= 0 && pattern.order <= 3;
      fields.push({
        fidelity: knownOrder ? "structural" : "opaque",
        label: `Brightness pattern ${patternIndex + 1}`,
        value: `order ${pattern.order}; scope ${pattern.scope_low}-${pattern.scope_high}; speed ${pattern.change_speed}; retention ${pattern.brightest_retention}/${pattern.darkest_retention}; ${layer.brightness_gradient ? "gradient" : "unified"}`,
      });
      if (!knownOrder) {
        notices.push(
          `Brightness order ${pattern.order} has unknown structure. Its raw pattern remains visible and no brightness gradient is inferred.`,
        );
      }
    });
  }

  movementField(layer.selected_movement, "Selected movement", fields, notices);
  movementField(layer.overall_movement, "Whole-layer movement", fields, notices);

  fields.push({
    fidelity: "structural",
    label: "Priority",
    value: String(layer.priority),
  });
  if (layer.unknown_flags !== 0) {
    fields.push({
      fidelity: "opaque",
      label: "Layer flags",
      value: `0x${hexByte(layer.unknown_flags)}`,
    });
    notices.push("Unknown layer flags remain visible without interpretation.");
  }
  if (layer.excess.length > 0) {
    fields.push({
      fidelity: "opaque",
      label: "Excess bytes",
      value: layer.excess,
    });
    notices.push("Unparsed excess bytes remain visible without interpretation.");
  }

  const area = normalizedArea(layer);
  if (!area.valid) {
    notices.push(
      `Applied area ${area.rawStartTenths}/10 + ${area.rawWidthTenths}/10 is outside the documented range and is clamped only for the normalized band.`,
    );
  }

  return {
    index,
    label: `Layer ${index + 1}`,
    area,
    palette: clonePalette(layer.palette),
    fields,
    notices,
  };
}

function selectionField(layer: EffectLayer): PreviewField {
  const labels = ["Segment", "Continuous", "Random", "Custom"];
  const label = labels[layer.selection.type];
  return {
    fidelity: label === undefined ? "opaque" : "structural",
    label: "Selection",
    value: `${label ?? `Unknown type ${layer.selection.type}`}; parameters ${layer.selection.param_1}, ${layer.selection.param_2}`,
  };
}

function distributionField(layer: EffectLayer): PreviewField {
  const labels = ["Unified", "By IC", "By segment"];
  const label = labels[layer.distribution.method];
  return {
    fidelity: label === undefined ? "opaque" : "structural",
    label: "Distribution",
    value: `${label ?? `Unknown method ${layer.distribution.method}`}; ${layer.distribution.backwards ? "backwards" : "forwards"}`,
  };
}

function movementField(
  movement: EffectLayer["selected_movement"],
  label: string,
  fields: PreviewField[],
  notices: string[],
): void {
  if (!movement.enabled) {
    fields.push({ fidelity: "structural", label, value: "Disabled" });
    if (movement.unknown_flags !== 0) {
      fields.push({
        fidelity: "opaque",
        label: `${label} flags`,
        value: `0x${hexByte(movement.unknown_flags)}`,
      });
      notices.push(`${label} flags remain visible without interpretation.`);
    }
    return;
  }
  const directions = [
    "Forward",
    "Backward",
    "Forward and back",
    "Back and forward",
  ];
  const direction = directions[movement.direction];
  fields.push({
    fidelity: direction === undefined ? "opaque" : "structural",
    label,
    value: `${direction ?? `Unknown direction ${movement.direction}`}; distance ${movement.distance}; speed ${movement.speed}; ${movement.enter_exit ? "enter/exit" : "continuous"}`,
  });
  if (direction === undefined) {
    notices.push(
      `${label} direction ${movement.direction} is unknown. Its raw value remains visible.`,
    );
  }
  if (movement.unknown_flags !== 0) {
    fields.push({
      fidelity: "opaque",
      label: `${label} flags`,
      value: `0x${hexByte(movement.unknown_flags)}`,
    });
    notices.push(`${label} flags remain visible without interpretation.`);
  }
}

function normalizedArea(layer: EffectLayer): PreviewArea {
  const rawStartTenths = layer.area.start_tenths;
  const rawWidthTenths = layer.area.width_tenths;
  return {
    start: clamp(rawStartTenths / 10, 0, 1),
    end: clamp((rawStartTenths + rawWidthTenths) / 10, 0, 1),
    rawStartTenths,
    rawWidthTenths,
    valid:
      rawStartTenths >= 0 &&
      rawStartTenths <= 9 &&
      rawWidthTenths >= 1 &&
      rawWidthTenths <= 10 - rawStartTenths,
  };
}

function clonePalette(palette: RGB[]): RGB[] {
  return palette.map(cloneColour);
}

function cloneColour(colour: RGB): RGB {
  return [...colour] as RGB;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function hexByte(value: number): string {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function previewSeed(sku: string, sceneId: number, effectId: number): number {
  let hash = 0x811c9dc5;
  for (const character of `${sku}:${sceneId}:${effectId}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
