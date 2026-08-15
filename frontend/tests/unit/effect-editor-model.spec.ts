import { expect, test } from "@playwright/test";

import {
  blankCustomEffect,
  cloneEditableEffect,
  coloursForSegments,
  customEffectCategoryForKind,
  groupsFromColours,
  isEditableEffectContent,
  libraryKindPriority,
  mergedPaintBrushes,
  PAINTED_SEGMENT_COUNT,
  serialiseEditable,
  uniquePaintedPalette,
  upsertSummary,
} from "../../src/effect-editor-model";
import type {
  LibraryItem,
  ModelEffectCatalogue,
  PaintedContent,
} from "../../src/types";

const catalogue = {
  sku: "H617A",
  painted_effects: [],
  effects: [
    {
      id: "steady",
      label: "Steady",
      family: 1,
      variations: [{ id: "base", label: "Base", variant: 2 }],
      supports_multi: true,
      rate: "speed",
      category: "single_layer",
    },
  ],
  music_modes: [],
  video_modes: [],
  workshop_templates: [],
  special_diy_templates: [],
  workflows: [],
  supports: {
    multi: "supported",
    advanced: "supported",
    workshop: "unsupported",
    special_diy: "unsupported",
  },
  limits: {
    palette_min: 1,
    palette_max: 8,
    multi_max: 5,
    music_sensitivity_min: 0,
    music_sensitivity_max: 100,
  },
  apply: {
    painted: "supported",
    single: "supported",
    multi: "supported",
    palette_diy: "unsupported",
    workshop: "unsupported",
    special_diy: "unsupported",
  },
} satisfies ModelEffectCatalogue;

test("custom defaults use catalogue identities without sharing palettes", () => {
  const first = blankCustomEffect("h617a_single", catalogue);
  const second = blankCustomEffect("h617a_single", catalogue);

  first.palette[0][0] = 0;

  expect(first.family).toBe(1);
  expect(first.variant).toBe(2);
  expect(second.palette[0]).toEqual([255, 0, 0]);
});

test("painted colours round trip through grouped segments", () => {
  const content: PaintedContent = {
    kind: "h617a_painted",
    effect: "clockwise",
    speed: 50,
    brightness: 100,
    background: [0, 0, 0],
    groups: [
      { fill: [255, 0, 0], segments: [0, 2] },
      { fill: [0, 0, 255], segments: [1] },
    ],
  };
  const colours = coloursForSegments(content);

  expect(colours).toHaveLength(PAINTED_SEGMENT_COUNT);
  expect(groupsFromColours(colours, content.background)).toEqual(
    content.groups,
  );
  expect(uniquePaintedPalette(content)).toEqual([
    [255, 0, 0],
    [0, 0, 255],
  ]);
});

test("paint brushes remove duplicates and retain the eight-colour limit", () => {
  const brushes = mergedPaintBrushes([
    [255, 0, 0],
    [255, 0, 0],
    [1, 2, 3],
  ]);

  expect(brushes[0]).toEqual([255, 0, 0]);
  expect(brushes[1]).toEqual([1, 2, 3]);
  expect(brushes).toHaveLength(8);
});

test("editable clones and serialisation isolate nested state", () => {
  const source = {
    kind: "music_profile" as const,
    model: "H617A" as const,
    mode: "rhythm",
    sensitivity: 50,
    colour: [1, 2, 3] as [number, number, number],
    calm: null,
    parameters: { speed: 4 },
  };
  const cloned = cloneEditableEffect(source);

  if (cloned.kind !== "music_profile" || cloned.colour === null) {
    throw new Error("Expected a music profile clone.");
  }
  cloned.colour[0] = 9;
  cloned.parameters.speed = 8;

  expect(source.colour).toEqual([1, 2, 3]);
  expect(source.parameters).toEqual({ speed: 4 });
  expect(serialiseEditable("  Name  ", source)).toContain('"name":"Name"');
});

test("library summaries retain model metadata and stable ordering", () => {
  const item: LibraryItem = {
    schema_version: 1,
    id: "second",
    revision: 2,
    name: "Alpha",
    content: blankCustomEffect("h617a_single", catalogue),
    provenance: {},
    extensions: {},
  };
  const summaries = upsertSummary(
    [
      {
        id: "first",
        revision: 1,
        name: "Zulu",
        kind: "h617a_single",
        model: "H617A",
      },
    ],
    item,
  );

  expect(summaries.map((summary) => summary.name)).toEqual(["Alpha", "Zulu"]);
  expect(summaries[0].model).toBe("H617A");
  expect(isEditableEffectContent(item.content)).toBe(true);
  expect(customEffectCategoryForKind(item.content.kind)).toBe("single-layer");
  expect(libraryKindPriority("palette_diy", "H6199")).toBeLessThan(
    libraryKindPriority("advanced", "H6199"),
  );
});
