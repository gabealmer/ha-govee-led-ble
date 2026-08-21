import { expect, test } from "vitest";

import {
  buildCustomEffectEntries,
  type CustomEffectListContext,
} from "../../src/custom-effect-list";
import {
  customEffectCategories,
  defaultCustomEffectCategory,
  starterBaseline,
} from "../../src/custom-effect-workflow";
import { blankCustomEffect, serialiseEditable } from "../../src/effect-editor-model";
import type { LibrarySummary, ModelEffectCatalogue } from "../../src/types";

const catalogue = {
  sku: "H617A",
  painted_effects: [{ id: "cycle", label: "Paint" }],
  effects: [
    {
      id: "jumping",
      label: "Jumping",
      family: 1,
      variations: [{ id: "whole", label: "Whole strip", variant: 0 }],
      supports_multi: true,
      rate: "speed",
      category: "single_layer",
    },
  ],
  music_modes: [{ id: "rhythm", label: "Rhythm" }],
  video_modes: [],
  workshop_templates: [],
  special_diy_templates: [],
  workflows: [],
  supports: {
    multi: "supported",
    advanced: "supported",
    workshop: "supported",
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
    workshop: "supported",
    special_diy: "unsupported",
  },
} satisfies ModelEffectCatalogue;

const saved: LibrarySummary = {
  id: "effect-a",
  version: 1,
  updated_at: "2026-08-17T00:00:00Z",
  name: "My Jump",
  kind: "h617a_single",
  content_hash: "a".repeat(64),
  origin: { kind: "authored", source_id: null },
  model: "H617A",
};

function context(items: LibrarySummary[] = []): CustomEffectListContext {
  return {
    model: "H617A",
    catalogue,
    libraryItems: items,
  };
}

test("starter lists expose product choices but not protocol evidence fixtures", () => {
  expect(
    buildCustomEffectEntries(context(), "single-layer").map(
      (entry) => entry.label,
    ),
  ).toEqual(["Jumping", "Paint"]);
  expect(buildCustomEffectEntries(context(), "advanced")).toEqual([]);
  expect(
    buildCustomEffectEntries(context(), "music").map((entry) => entry.label),
  ).toEqual(["Rhythm"]);
});

test("saved effects remain available in their content category", () => {
  const entries = buildCustomEffectEntries(context([saved]), "single-layer");

  expect(defaultCustomEffectCategory(context([saved]))).toBe("single-layer");
  expect(entries.map((entry) => entry.label)).toEqual([
    "Jumping",
    "My Jump",
    "Paint",
  ]);
});

test("Effects is the stable fallback when no custom category is available", () => {
  expect(
    defaultCustomEffectCategory({
      model: "H617A",
      catalogue: {
        ...catalogue,
        painted_effects: [],
        effects: [],
        music_modes: [],
        supports: {
          multi: "unsupported",
          advanced: "unsupported",
          workshop: "unsupported",
          special_diy: "unsupported",
        },
      },
      libraryItems: [],
    }),
  ).toBe("single-layer");
});

test("categories keep Effects first and Advanced last", () => {
  expect(
    customEffectCategories(context([saved])).map(({ label }) => label),
  ).toEqual([
    "Effects",
    "Layered Effects",
    "Reactive",
    "Advanced",
  ]);
});

test("starters stay clean until edited while intentional New shows its selector", () => {
  const content = blankCustomEffect("h617a_single", catalogue);

  expect(starterBaseline("Jumping", content, true)).toBe(
    serialiseEditable("Jumping", content),
  );
  expect(starterBaseline("New Single effect", content, false)).toBeUndefined();
});
