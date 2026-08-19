import { expect, test } from "vitest";

import {
  clamp,
  clampInteger,
  clonePalette,
  lightControlEntityId,
  moreInfoDetail,
  relocatedIndex,
  sameRgb,
  showHomeAssistantHeader,
  showStudioToolbar,
} from "../../src/ui-utils";
import type { DeviceCapabilities, RGB } from "../../src/types";

function device(lightEntityId: string | null): DeviceCapabilities {
  return {
    config_entry_id: "entry-a",
    light_entity_id: lightEntityId,
    model: "H617A",
    display_name: "Cupboard",
    segment_count: 15,
    custom_effects: {
      painted: "supported",
      single: "supported",
      multi: "supported",
      palette_diy: "supported",
      advanced: "supported",
      workshop: "supported",
      special_diy: "supported",
    },
    profiles: {
      music: "supported",
      video: "unsupported",
    },
    readback: "diy_code_only",
    active_state: null,
  };
}

test("numeric clamps preserve or round values as requested", () => {
  expect(clamp(2.75, 0, 5)).toBe(2.75);
  expect(clamp(-1, 0, 5)).toBe(0);
  expect(clampInteger(2.6, 0, 5)).toBe(3);
  expect(clampInteger(5.8, 0, 5)).toBe(5);
});

test("palette clones do not share colour arrays", () => {
  const source: RGB[] = [[1, 2, 3]];
  const cloned = clonePalette(source);

  cloned[0][0] = 9;

  expect(source).toEqual([[1, 2, 3]]);
  expect(sameRgb(cloned[0], [9, 2, 3])).toBe(true);
});

test("relocated indexes follow the moved item and shifted neighbours", () => {
  expect(relocatedIndex(1, 1, 3)).toBe(3);
  expect(relocatedIndex(2, 1, 3)).toBe(1);
  expect(relocatedIndex(2, 3, 1)).toBe(3);
  expect(relocatedIndex(undefined, 1, 3)).toBeUndefined();
});

test("Home Assistant header appears only when native navigation is unavailable", () => {
  expect(showHomeAssistantHeader(true, "auto", false)).toBe(true);
  expect(showHomeAssistantHeader(false, "always_hidden", false)).toBe(true);
  expect(showHomeAssistantHeader(false, "docked", false)).toBe(false);
  expect(showHomeAssistantHeader(true, "auto", true)).toBe(false);
});

test("light controls follow the selected device without hiding the toolbar", () => {
  expect(lightControlEntityId(device("light.cupboard"))).toBe("light.cupboard");
  expect(lightControlEntityId(device(null))).toBeUndefined();
  expect(lightControlEntityId(undefined)).toBeUndefined();
  expect(showStudioToolbar(false, false, "light.cupboard")).toBe(true);
  expect(showStudioToolbar(false, true, undefined)).toBe(true);
  expect(showStudioToolbar(true, false, undefined)).toBe(true);
  expect(showStudioToolbar(false, false, undefined)).toBe(false);
  expect(moreInfoDetail("light.cupboard")).toEqual({
    entityId: "light.cupboard",
  });
});
