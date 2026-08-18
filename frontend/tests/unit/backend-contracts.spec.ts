import { describe, expect, test } from "vitest";

import backendContracts from "../fixtures/backend-contracts.json";
import {
  decodeCustomCatalogue,
  decodeDevices,
  decodeEditorApiInfo,
  decodeEffectContent,
  decodeEffectUserState,
  decodeLibraryItem,
  decodeLibrarySnapshot,
  decodePreviewStatus,
  decodeSceneCatalogue,
  decodeSceneDetail,
  decodeSceneSummary,
  effectContentToWire,
  isCompatibleEditorInfo,
} from "../../src/validation";

type JsonObject = Record<string, unknown>;

const responses = backendContracts.responses;
const contentSamples: Record<string, unknown> = backendContracts.content_samples;
const knownContentFamilies = [
  "h617a_painted",
  "h617a_single",
  "h617a_multi",
  "palette_diy",
  "music_profile",
  "video_profile",
  "advanced",
  "workshop",
  "special_diy",
  "scene_builtin",
  "scene_palette",
  "scene_layered",
] as const;

function cloneObject(value: unknown): JsonObject {
  return structuredClone(value) as JsonObject;
}

function objectArray(value: unknown): JsonObject[] {
  return value as JsonObject[];
}

test("canonical backend responses decode through the production validators", () => {
  const info = decodeEditorApiInfo(responses.editor_info);
  expect(isCompatibleEditorInfo(info)).toBe(true);
  const devices = decodeDevices(responses.devices);
  expect(devices).toHaveLength(2);
  expect(devices[0].active_state?.active_effect?.observable_signature).toBe(
    "custom:800",
  );
  expect(decodeCustomCatalogue(responses.custom_catalogue).models).toHaveProperty(
    "H6199",
  );
  expect(decodeLibrarySnapshot(responses.library_snapshot).items).toHaveLength(
    2,
  );
  expect(decodeLibraryItem(responses.library_item).content.kind).toBe(
    "h617a_painted",
  );
  expect(decodePreviewStatus(responses.preview_status).phase).toBe("confirmed");
  expect(
    decodeEffectUserState({
      owner_id: "user-a",
      recent_colours: [[1, 2, 3]],
      selected_config_entry_id: "entry-a",
      navigation: { section: "scenes" },
    }),
  ).toEqual({
    owner_id: "user-a",
    recent_colours: [[1, 2, 3]],
    selected_config_entry_id: "entry-a",
    navigation: { section: "scenes" },
  });

  for (const catalogue of Object.values(responses.scene_catalogues)) {
    const decoded = decodeSceneCatalogue(catalogue);
    expect(decoded.scenes.length).toBeGreaterThan(0);
    expect(decodeSceneSummary(decoded.scenes[0])).toEqual(decoded.scenes[0]);
  }
  for (const detail of Object.values(responses.scene_details)) {
    const decoded = decodeSceneDetail(detail);
    expect(decoded.scene.display_name).not.toBe("");
    expect(typeof decoded.has_default).toBe("boolean");
  }
});

test.each(knownContentFamilies)(
  "canonical %s content decodes and preserves its wire form",
  (family) => {
    const payload = contentSamples[family];
    const decoded = decodeEffectContent(payload);
    expect(decoded.kind).toBe(family);
    expect(effectContentToWire(decoded)).toEqual(payload);
  },
);

test("unknown content remains opaque and preserves its wire form", () => {
  const payload = contentSamples.future_wave;
  const decoded = decodeEffectContent(payload);
  expect(decoded).toMatchObject({
    kind: "opaque",
    source_kind: "future_wave",
  });
  expect(effectContentToWire(decoded)).toEqual(payload);
});

describe("focused response mutations", () => {
  test("API version drift is incompatible without making the payload malformed", () => {
    const payload = cloneObject(responses.editor_info);
    payload.api_version = 999;
    expect(isCompatibleEditorInfo(decodeEditorApiInfo(payload))).toBe(false);
  });

  test("unknown library models remain optional compatibility hints", () => {
    const payload = cloneObject(responses.library_snapshot);
    objectArray(payload.items)[0].model = "future-model";
    expect(decodeLibrarySnapshot(payload).items[0]).not.toHaveProperty("model");
  });

  test("library snapshots reject duplicate IDs and malformed item collections", () => {
    const duplicate = cloneObject(responses.library_snapshot);
    const items = objectArray(duplicate.items);
    items[1].id = items[0].id;
    expect(() => decodeLibrarySnapshot(duplicate)).toThrow(
      "library item IDs must be unique",
    );

    const malformed = cloneObject(responses.library_snapshot);
    malformed.items = {};
    expect(() => decodeLibrarySnapshot(malformed)).toThrow(
      "library items must be an array",
    );
  });

  test("scene details reject non-scene content", () => {
    const payload = cloneObject(responses.scene_details.scene_builtin);
    payload.content = contentSamples.h617a_painted;
    expect(() => decodeSceneDetail(payload)).toThrow(
      "scene detail content is unsupported",
    );
  });
});

describe("focused effect-content mutations", () => {
  test("palette scenes reject invalid layouts, flags, colours, and padding", () => {
    const mutations: Array<(payload: JsonObject) => void> = [
      (payload) => {
        payload.layout = 2;
      },
      (payload) => {
        objectArray(payload.steps)[0].inline_colour = [1, 2, 3];
      },
      (payload) => {
        payload.config_flags = 1;
      },
      (payload) => {
        payload.trailing_padding = 0xff * 17 + 1;
      },
      (payload) => {
        objectArray(payload.steps)[0].colour = [1, 2];
      },
    ];

    for (const mutate of mutations) {
      const payload = cloneObject(contentSamples.scene_palette);
      mutate(payload);
      expect(() => decodeEffectContent(payload)).toThrow(
        "Malformed Effect Studio server payload",
      );
    }
  });

  test("layer and movement reserved bits round-trip while explicit bits are rejected", () => {
    const reserved = cloneObject(contentSamples.advanced);
    const reservedLayer = objectArray(reserved.layers)[0];
    reservedLayer.unknown_flags = 0xfd;
    (reservedLayer.selected_movement as JsonObject).unknown_flags = 0xe8;
    (reservedLayer.overall_movement as JsonObject).unknown_flags = 0xe8;
    const decoded = decodeEffectContent(reserved);
    expect(decodeEffectContent(effectContentToWire(decoded))).toEqual(decoded);

    const invalidLayer = cloneObject(contentSamples.scene_layered);
    const layeredEffect = invalidLayer.effect as JsonObject;
    objectArray(layeredEffect.layers)[0].unknown_flags = 0x02;
    expect(() => decodeEffectContent(invalidLayer)).toThrow(
      "must only set reserved bits",
    );

    const invalidMovement = cloneObject(contentSamples.advanced);
    const advancedLayer = objectArray(invalidMovement.layers)[0];
    (advancedLayer.selected_movement as JsonObject).unknown_flags = 0x01;
    expect(() => decodeEffectContent(invalidMovement)).toThrow(
      "must only set reserved bits",
    );
  });

  test("layered scene padding remains bounded", () => {
    const payload = cloneObject(contentSamples.scene_layered);
    payload.trailing_padding = 0xff * 17 + 1;
    expect(() => decodeEffectContent(payload)).toThrow(
      "layered scene trailing padding must be an integer",
    );
  });
});
