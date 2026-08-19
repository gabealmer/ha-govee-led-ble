import { expect, test } from "vitest";

import {
  clamp,
  clampInteger,
  clonePalette,
  relocatedIndex,
  sameRgb,
  showHomeAssistantHeader,
} from "../../src/ui-utils";
import type { RGB } from "../../src/types";

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
