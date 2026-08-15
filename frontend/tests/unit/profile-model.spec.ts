import { expect, test } from "@playwright/test";

import {
  cloneMusicProfileContent,
  cloneVideoProfileContent,
} from "../../src/profile-model";

test("profile clones isolate nested colour, parameter, and brightness state", () => {
  const music = {
    kind: "music_profile" as const,
    model: "H617A" as const,
    mode: "rhythm",
    sensitivity: 50,
    colour: [1, 2, 3] as [number, number, number],
    calm: null,
    parameters: { nested: { value: 1 } },
  };
  const video = {
    kind: "video_profile" as const,
    model: "H6199" as const,
    mode: "movie" as const,
    full_screen: true,
    saturation: 50,
    sound_effects: false,
    sound_effects_softness: 50,
    white_balance_position: 17,
    relative_brightness: {
      left: 100,
      top: 100,
      right: 100,
      bottom: 100,
    },
    blank_screen: false,
  };
  const musicClone = cloneMusicProfileContent(music);
  const videoClone = cloneVideoProfileContent(video);

  musicClone.colour![0] = 9;
  const nested = musicClone.parameters.nested;
  if (
    typeof nested !== "object" ||
    nested === null ||
    Array.isArray(nested)
  ) {
    throw new Error("Expected nested profile parameters.");
  }
  nested.value = 2;
  videoClone.relative_brightness.left = 20;

  expect(music.colour).toEqual([1, 2, 3]);
  expect(music.parameters).toEqual({ nested: { value: 1 } });
  expect(video.relative_brightness.left).toBe(100);
});
