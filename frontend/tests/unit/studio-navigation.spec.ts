import { expect, test } from "vitest";

import {
  activeStudioContext,
  deviceIdFromEditorPath,
  editorDevicePath,
  initialDeviceId,
  rememberedStudioSection,
  studioNavigationItems,
} from "../../src/studio-navigation";
import type {
  DeviceCapabilities,
  LibrarySummary,
  ModelEffectCatalogue,
} from "../../src/types";

const device = (
  id: string,
  painted: "supported" | "unsupported",
): DeviceCapabilities => ({
  config_entry_id: id,
  light_entity_id: `light.${id}`,
  model: "H617A",
  display_name: id,
  segment_count: 15,
  custom_effects: {
    painted,
    single: "supported",
    multi: "supported",
    palette_diy: "unsupported",
    advanced: "supported",
    workshop: "supported",
  },
  profiles: {
    music: "supported",
    video: "unsupported",
  },
  readback: "state",
  active_state: null,
});

const catalogue: ModelEffectCatalogue = {
  sku: "H617A",
  painted_effects: [],
  effects: [],
  music_modes: [{ id: "separation", label: "Separation" }],
  video_modes: [{ id: "movie", label: "Movie" }],
  workshop_templates: [],
  workflows: [],
  supports: {
    multi: "unsupported",
    advanced: "unsupported",
    workshop: "unsupported",
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
  },
};

test("remembered navigation restores only an available top-level section", () => {
  expect(
    rememberedStudioSection(
      { section: "video" },
      { custom: true, video: true },
    ),
  ).toBe("video");
  expect(
    rememberedStudioSection(
      { section: "video" },
      { custom: true, video: false },
    ),
  ).toBe("custom");
  expect(
    rememberedStudioSection(
      { section: "future" },
      { custom: false, video: false },
    ),
  ).toBe("scenes");
});

test("primary navigation flattens custom categories", () => {
  const categories = [
    { category: "single-layer" as const, label: "Effects" },
    { category: "multi-layer" as const, label: "Layered Effects" },
  ];
  expect(studioNavigationItems(true, categories)).toEqual([
    { section: "scenes", label: "Scenes" },
    { section: "video", label: "Video" },
    { section: "custom", category: "single-layer", label: "Effects" },
    {
      section: "custom",
      category: "multi-layer",
      label: "Layered Effects",
    },
  ]);
  expect(studioNavigationItems(false, categories).map((item) => item.label)).toEqual([
    "Scenes",
    "Effects",
    "Layered Effects",
  ]);
});

test("active context requires exact available saved identity", () => {
  const saved: LibrarySummary = {
    id: "effect-a",
    version: 1,
    updated_at: "2026-08-17T00:00:00Z",
    name: "Saved",
    kind: "h617a_single",
    content_hash: "a".repeat(64),
    origin: { kind: "authored", source_id: null },
  };
  const active = device("entry-a", "supported");
  active.active_state = {
    config_entry_id: active.config_entry_id,
    mode: "custom",
    observed_at: "2026-08-17T00:00:00Z",
    confidence: "activation_match",
    diy_code: 800,
    effect: null,
    native_mode: null,
    matched_operation_id: "operation-a",
    active_effect: {
      source_kind: "saved_effect",
      selector_label: saved.name,
      content_hash: saved.content_hash,
      origin: saved.origin,
      observable_signature: "custom:800",
      confidence: "activation_match",
      item_id: saved.id,
      item_version: saved.version,
    },
  };

  expect(activeStudioContext(active, [saved], () => true, catalogue)).toEqual({
    kind: "saved",
    item: saved,
  });
  active.active_state!.active_effect!.item_version = saved.version + 1;
  expect(activeStudioContext(active, [saved], () => true, catalogue)).toEqual({
    kind: "root",
  });
  active.active_state!.active_effect!.item_version = saved.version;
  active.active_state!.active_effect!.content_hash = "b".repeat(64);
  expect(activeStudioContext(active, [saved], () => true, catalogue)).toEqual({
    kind: "root",
  });
  active.active_state!.active_effect!.content_hash = saved.content_hash;
  active.active_state!.active_effect!.confidence = "unknown";
  active.active_state!.confidence = "unknown";
  expect(activeStudioContext(active, [saved], () => true, catalogue)).toEqual({
    kind: "root",
  });
  active.active_state!.active_effect!.confidence = "activation_match";
  active.active_state!.confidence = "activation_match";
  expect(activeStudioContext(active, [saved], () => false, catalogue)).toEqual({
    kind: "root",
  });
  active.active_state!.active_effect = {
    ...active.active_state!.active_effect!,
    source_kind: "snapshot",
    item_id: null,
    item_version: null,
  };
  active.active_state!.mode = "scene";
  active.active_state!.effect = "rainbow";
  active.active_state!.native_mode = "rainbow";
  expect(activeStudioContext(active, [saved], () => true, catalogue)).toEqual({
    kind: "root",
  });
});

test("fresh native identities are catalogue validated without confidence gating", () => {
  const active = device("entry-a", "supported");
  active.active_state = {
    config_entry_id: active.config_entry_id,
    mode: "scene",
    observed_at: "2026-08-17T00:00:00Z",
    confidence: "unknown",
    diy_code: null,
    effect: "rainbow",
    native_mode: "rainbow",
    matched_operation_id: null,
    active_effect: null,
  };
  expect(activeStudioContext(active, [], () => true, catalogue)).toEqual({
    kind: "native-scene",
    effect: "rainbow",
  });
  active.active_state.mode = "video";
  active.active_state.effect = null;
  active.active_state.native_mode = "movie";
  expect(activeStudioContext(active, [], () => true, catalogue)).toEqual({
    kind: "native-profile",
    section: "video",
    mode: "movie",
    label: "Movie",
  });
  active.active_state.mode = "music";
  active.active_state.native_mode = "separation";
  expect(activeStudioContext(active, [], () => true, catalogue)).toEqual({
    kind: "native-profile",
    section: "custom",
    category: "music",
    mode: "separation",
    label: "Separation",
  });
  active.active_state.native_mode = "shared-diy-code";
  expect(activeStudioContext(active, [], () => true, catalogue)).toEqual({
    kind: "root",
  });
});

test("device selection gives exact deep links precedence over remembered state", () => {
  const devices = [device("first", "unsupported"), device("painted", "supported")];

  expect(
    deviceIdFromEditorPath("/ha-govee-led-ble/editor/device%20a"),
  ).toBe("device a");
  expect(
    deviceIdFromEditorPath("/prefix/ha-govee-led-ble/editor/device"),
  ).toBeUndefined();
  expect(
    deviceIdFromEditorPath("/ha-govee-led-ble/editor/%E0%A4%A"),
  ).toBeUndefined();
  expect(editorDevicePath("device a")).toBe(
    "/ha-govee-led-ble/editor/device%20a",
  );
  expect(
    initialDeviceId(
      "/ha-govee-led-ble/editor/linked",
      devices,
      "painted",
    ),
  ).toBe("linked");
  expect(
    initialDeviceId("/ha-govee-led-ble", devices, "painted"),
  ).toBe("painted");
  expect(
    initialDeviceId("/ha-govee-led-ble", devices, "missing"),
  ).toBe("first");
});
