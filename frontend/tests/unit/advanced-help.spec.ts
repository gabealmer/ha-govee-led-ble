import { expect, test } from "vitest";

import { ADVANCED_HELP_CONTENT } from "../../src/advanced-help";

test("Advanced help registry covers supported evidence without time units", () => {
  expect(Object.keys(ADVANCED_HELP_CONTENT)).toEqual([
    "appliedArea",
    "fillPattern",
    "distribution",
    "colourSpeed",
    "colourRetention",
    "patterns",
    "brightnessScope",
    "changingSpeed",
    "inAreaMovement",
    "wholeLayerMovement",
    "pauseBeforeReentry",
    "priority",
  ]);

  expect(ADVANCED_HELP_CONTENT.appliedArea.text).toContain(
    "physical LED boundary",
  );
  expect(ADVANCED_HELP_CONTENT.fillPattern.text).toContain(
    "inside the applied area",
  );
  expect(ADVANCED_HELP_CONTENT.brightnessScope.text).toContain(
    "Scope low and Scope high",
  );
  expect(
    `${ADVANCED_HELP_CONTENT.colourRetention.text} ${ADVANCED_HELP_CONTENT.changingSpeed.text}`,
  ).not.toMatch(/\b(?:milliseconds?|seconds?|minutes?)\b/i);
  expect(
    Object.values(ADVANCED_HELP_CONTENT).some(({ label }) =>
      label.startsWith("Brightness information"),
    ),
  ).toBe(false);
});
