import { expect, test } from "@playwright/test";

import {
  blankAdvancedContent,
  bytePercent,
  cloneAdvancedContent,
  cloneLayeredSceneContent,
  hexByte,
  parseHexByte,
  segmentOverlapsArea,
} from "../../src/advanced-effect-model";

test("blank advanced content contains an editable default layer", () => {
  const content = blankAdvancedContent();

  expect(content.layers).toHaveLength(1);
  expect(content.layers[0].area).toEqual({
    start_tenths: 0,
    width_tenths: 10,
  });
  expect(content.layers[0].brightness_patterns).toHaveLength(1);
  expect(content.layers[0].palette).toEqual([
    [255, 0, 0],
    [0, 0, 255],
  ]);
});

test("advanced and layered scene clones do not share nested state", () => {
  const source = blankAdvancedContent();
  const advancedClone = cloneAdvancedContent(source);
  const scene = {
    kind: "scene_layered" as const,
    template: {
      sku: "H6199",
      scene_id: 1,
      effect_id: 2,
      catalogue_schema_version: 1,
    },
    effect: { layers: source.layers },
    speed_index: null,
    raw_param: "",
  };
  const sceneClone = cloneLayeredSceneContent(scene);

  advancedClone.layers[0].palette[0][0] = 0;
  sceneClone.template.scene_id = 9;
  sceneClone.effect.layers[0].area.start_tenths = 4;

  expect(source.layers[0].palette[0]).toEqual([255, 0, 0]);
  expect(scene.template.scene_id).toBe(1);
  expect(source.layers[0].area.start_tenths).toBe(0);
});

test("wire byte helpers preserve accepted values and reject malformed text", () => {
  expect(bytePercent(128)).toBe(50);
  expect(bytePercent(300)).toBe(100);
  expect(hexByte(10)).toBe("0A");
  expect(parseHexByte(" 0x7f ")).toBe(127);
  expect(parseHexByte("100")).toBeUndefined();
  expect(parseHexByte("gg")).toBeUndefined();
});

test("segment overlap uses fractional segment boundaries", () => {
  expect(segmentOverlapsArea(0, 15, 0, 1)).toBe(true);
  expect(segmentOverlapsArea(1, 15, 0, 0.5)).toBe(false);
  expect(segmentOverlapsArea(14, 15, 9.5, 10)).toBe(true);
});
