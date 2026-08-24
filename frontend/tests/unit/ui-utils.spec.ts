import { expect, test } from "vitest";

import {
  brightnessFillGeometry,
  classifyLightEntityState,
  clamp,
  clampInteger,
  clonePalette,
  integrationSettingsPath,
  lightControlPresentation,
  lightControlEntityId,
  moreInfoDetail,
  relocatedIndex,
  sameRgb,
  showHomeAssistantHeader,
  studioToolbarLayoutState,
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
    },
    profiles: {
      music: "supported",
      video: "unsupported",
    },
    readback: "diy_code_only",
    effect_categories: [
      "scenes",
      "effects",
      "multi_layered",
      "reactive",
      "advanced",
    ],
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
  expect(
    studioToolbarLayoutState(true, true, true, "light.cupboard"),
  ).toEqual({
    visible: true,
    deviceSelector: true,
    modeControls: true,
    lightControl: true,
    settings: true,
  });
  expect(studioToolbarLayoutState(false, false, true, undefined)).toEqual({
    visible: false,
    deviceSelector: false,
    modeControls: false,
    lightControl: false,
    settings: false,
  });
  expect(studioToolbarLayoutState(false, false, true, "light.cupboard")).toEqual({
    visible: true,
    deviceSelector: false,
    modeControls: false,
    lightControl: true,
    settings: false,
  });
  expect(moreInfoDetail("light.cupboard")).toEqual({
    entityId: "light.cupboard",
  });
  expect(
    integrationSettingsPath(
      "/config/integrations/integration/ha_govee_led_ble",
      "entry a",
    ),
  ).toBe(
    "/config/integrations/integration/ha_govee_led_ble#config_entry=entry+a",
  );
});

test("native light presentation follows reactive Home Assistant state", () => {
  const states = { "light.cupboard": { state: "on" } };

  expect(classifyLightEntityState(states, "light.cupboard")).toBe("on");
  expect(lightControlPresentation("Cupboard", "on")).toEqual({
    accessibleName: "Control Cupboard (on)",
    className: "light-state-on",
  });

  states["light.cupboard"] = { state: "off" };
  expect(classifyLightEntityState(states, "light.cupboard")).toBe("off");

  states["light.cupboard"] = { state: "unavailable" };
  expect(classifyLightEntityState(states, "light.cupboard")).toBe(
    "unavailable",
  );
  expect(classifyLightEntityState({}, "light.cupboard")).toBe("unavailable");
});

test("native light fill rises bottom-up in proportion to raw brightness", () => {
  expect(brightnessFillGeometry(0)).toEqual({
    height: 0,
    y: 18,
  });

  const fortyFivePercent = brightnessFillGeometry(
    Math.round(255 * 0.45),
  );
  expect(fortyFivePercent.height / 12).toBeCloseTo(0.45, 2);
  expect(fortyFivePercent.y).toBeCloseTo(
    18 - fortyFivePercent.height,
  );

  const midpoint = brightnessFillGeometry(128);
  expect(midpoint.height / 12).toBeCloseTo(0.5, 2);
  expect(brightnessFillGeometry(255)).toEqual({
    height: 12,
    y: 6,
  });
});
