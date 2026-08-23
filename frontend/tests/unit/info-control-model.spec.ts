import { expect, test } from "vitest";

import {
  popoverPosition,
  rectIntersectsViewport,
} from "../../src/info-control-model";

const viewport = { left: 0, top: 0, width: 400, height: 600 };

test("popover is centred below its trigger when space permits", () => {
  expect(
    popoverPosition(
      { left: 180, right: 204, top: 100, bottom: 124, width: 24, height: 24 },
      { width: 200, height: 80 },
      viewport,
      8,
      12,
    ),
  ).toEqual({ left: 92, top: 132 });
});

test("popover flips above and remains inside viewport gutters", () => {
  expect(
    popoverPosition(
      { left: 380, right: 404, top: 560, bottom: 584, width: 24, height: 24 },
      { width: 200, height: 100 },
      viewport,
      8,
      12,
    ),
  ).toEqual({ left: 188, top: 452 });
});

test("viewport intersection includes partially visible triggers only", () => {
  expect(
    rectIntersectsViewport(
      { left: -5, right: 5, top: 10, bottom: 34, width: 10, height: 24 },
      viewport,
    ),
  ).toBe(true);
  expect(
    rectIntersectsViewport(
      { left: -25, right: -1, top: 10, bottom: 34, width: 24, height: 24 },
      viewport,
    ),
  ).toBe(false);
});
