import type {
  JsonObject,
  MusicProfileContent,
  RelativeBrightness,
  VideoProfileContent,
} from "./types";
import { cloneRgb } from "./ui-utils";

export function cloneRelativeBrightness(
  relativeBrightness: RelativeBrightness,
): RelativeBrightness {
  return { ...relativeBrightness };
}

export function cloneVideoProfileContent(
  content: VideoProfileContent,
): VideoProfileContent {
  return {
    ...content,
    relative_brightness: cloneRelativeBrightness(content.relative_brightness),
  };
}

export function cloneMusicProfileContent(
  content: MusicProfileContent,
): MusicProfileContent {
  return {
    ...content,
    colour: content.colour === null ? null : cloneRgb(content.colour),
    parameters: cloneJsonObject(content.parameters),
  };
}

export function cloneJsonObject(value: JsonObject): JsonObject {
  return structuredClone(value) as JsonObject;
}
