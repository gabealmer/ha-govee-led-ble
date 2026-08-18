import type {
  JsonObject,
  MusicProfileContent,
  VideoProfileContent,
} from "./types";
import { cloneRgb } from "./ui-utils";

export function cloneVideoProfileContent(
  content: VideoProfileContent,
): VideoProfileContent {
  return {
    ...content,
    relative_brightness: { ...content.relative_brightness },
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
