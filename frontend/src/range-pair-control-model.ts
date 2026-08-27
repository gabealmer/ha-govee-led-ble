import { clampInteger } from "./ui-utils";

export type RangePairHandle = "low" | "high";

export interface RangePair {
  low: number;
  high: number;
}

export function orderedRangePair(
  low: number,
  high: number,
  minimum: number,
  maximum: number,
): RangePair {
  const first = clampInteger(low, minimum, maximum);
  const second = clampInteger(high, minimum, maximum);
  return {
    low: Math.min(first, second),
    high: Math.max(first, second),
  };
}

export function updateRangePair(
  pair: RangePair,
  handle: RangePairHandle,
  value: number,
  minimum: number,
  maximum: number,
): RangePair {
  if (handle === "low") {
    return {
      low: clampInteger(value, minimum, pair.high),
      high: pair.high,
    };
  }
  return {
    low: pair.low,
    high: clampInteger(value, pair.low, maximum),
  };
}

export function rangePairKeyboardUpdate(
  pair: RangePair,
  handle: RangePairHandle,
  key: string,
  minimum: number,
  maximum: number,
  step: number,
): RangePair | undefined {
  const direction =
    key === "ArrowLeft" || key === "ArrowDown"
      ? -1
      : key === "ArrowRight" || key === "ArrowUp"
        ? 1
        : undefined;
  let value: number;
  if (key === "Home") {
    value = handle === "low" ? minimum : pair.low;
  } else if (key === "End") {
    value = handle === "low" ? pair.high : maximum;
  } else if (direction !== undefined) {
    value = pair[handle] + direction * step;
  } else {
    return undefined;
  }
  const next = updateRangePair(
    pair,
    handle,
    value,
    minimum,
    maximum,
  );
  return next.low === pair.low && next.high === pair.high
    ? undefined
    : next;
}

export function rangePairHandleForValue(
  value: number,
  pair: RangePair,
  preferred: RangePairHandle,
): RangePairHandle {
  const lowDistance = Math.abs(value - pair.low);
  const highDistance = Math.abs(value - pair.high);
  if (lowDistance === highDistance) {
    return preferred;
  }
  return lowDistance < highDistance ? "low" : "high";
}
