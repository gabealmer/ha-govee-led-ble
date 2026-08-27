import { expect, test } from "vitest";

import {
  orderedRangePair,
  rangePairHandleForValue,
  rangePairKeyboardUpdate,
  updateRangePair,
} from "../../src/range-pair-control-model";

test("orders and clamps range pairs without mutating their source", () => {
  expect(orderedRangePair(220, 20, 0, 255)).toEqual({
    low: 20,
    high: 220,
  });
  expect(orderedRangePair(-4, 300, 0, 255)).toEqual({
    low: 0,
    high: 255,
  });
});

test("range handles cannot cross and may meet", () => {
  expect(
    updateRangePair({ low: 20, high: 80 }, "low", 90, 0, 100),
  ).toEqual({ low: 80, high: 80 });
  expect(
    updateRangePair({ low: 20, high: 80 }, "high", 10, 0, 100),
  ).toEqual({ low: 20, high: 20 });
});

test("keyboard updates respect opposite-handle bounds", () => {
  const pair = { low: 20, high: 80 };
  expect(
    rangePairKeyboardUpdate(pair, "low", "End", 0, 100, 1),
  ).toEqual({ low: 80, high: 80 });
  expect(
    rangePairKeyboardUpdate(pair, "high", "Home", 0, 100, 1),
  ).toEqual({ low: 20, high: 20 });
  expect(
    rangePairKeyboardUpdate(pair, "low", "ArrowLeft", 0, 100, 5),
  ).toEqual({ low: 15, high: 80 });
  expect(
    rangePairKeyboardUpdate(
      { low: 0, high: 80 },
      "low",
      "ArrowLeft",
      0,
      100,
      1,
    ),
  ).toBeUndefined();
  expect(
    rangePairKeyboardUpdate(
      { low: 20, high: 20 },
      "high",
      "Home",
      0,
      100,
      1,
    ),
  ).toBeUndefined();
});

test("nearest handle selection retains the preferred handle on ties", () => {
  expect(
    rangePairHandleForValue(21, { low: 20, high: 80 }, "high"),
  ).toBe("low");
  expect(
    rangePairHandleForValue(50, { low: 20, high: 80 }, "high"),
  ).toBe("high");
});
