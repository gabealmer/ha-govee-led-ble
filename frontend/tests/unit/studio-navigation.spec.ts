import { expect, test } from "vitest";

import {
  activeStudioContext,
  deviceIdFromEditorPath,
  editorDevicePath,
  initialDeviceId,
  rememberedStudioSection,
} from "../../src/studio-navigation";
import type {
  DeviceCapabilities,
  LibrarySummary,
} from "../../src/types";

const device = (
  id: string,
  painted: "supported" | "unsupported",
): DeviceCapabilities => ({
  config_entry_id: id,
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
    special_diy: "unsupported",
  },
  profiles: {
    music: "supported",
    video: "unsupported",
  },
  readback: "state",
  active_state: null,
});

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

test("active context opens only exact current saved content or native scenes", () => {
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

  expect(activeStudioContext(active, [saved], () => true)).toEqual({
    kind: "saved",
    item: saved,
  });
  active.active_state.mode = "scene";
  active.active_state.effect = "rainbow";
  active.active_state.active_effect!.content_hash = "b".repeat(64);
  expect(activeStudioContext(active, [saved], () => true)).toEqual({
    kind: "root",
  });
  active.active_state = {
    ...active.active_state,
    mode: "scene",
    effect: "rainbow",
    active_effect: null,
  };
  expect(activeStudioContext(active, [saved], () => true)).toEqual({
    kind: "native-scene",
    effect: "rainbow",
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
