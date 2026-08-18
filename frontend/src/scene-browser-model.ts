import { cloneLayeredSceneContent } from "./advanced-effect-model";
import type { SegmentedControlOption } from "./segmented-control";
import type {
  BuiltinSceneContent,
  LayeredSceneContent,
  LibrarySummary,
  PaletteSceneContent,
  PreviewStatus,
  SceneSummary,
} from "./types";

export type CategorySelection = "all" | "custom" | number;
export type SceneContent =
  | BuiltinSceneContent
  | PaletteSceneContent
  | LayeredSceneContent;
export type SceneListEntry =
  | { kind: "custom"; item: LibrarySummary; label: string }
  | { kind: "builtin"; scene: SceneSummary; label: string };

export function sceneKey(scene: SceneSummary): string {
  return `builtin:${scene.scene_id}:${scene.effect_id}`;
}

export function normaliseSceneName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function previewMayChangeSceneDefault(
  status: PreviewStatus | undefined,
  configEntryId: string | undefined,
): boolean {
  return Boolean(
    status &&
      configEntryId &&
      status.config_entry_id === configEntryId &&
      ["scene_builtin", "scene_palette", "scene_layered"].includes(
        status.content_kind,
      ) &&
      ["written", "confirmed", "unconfirmed"].includes(status.phase),
  );
}

export function sceneSpeedOptions(
  optionCount: number,
  defaultIndex: number,
): SegmentedControlOption<number>[] {
  return Array.from({ length: optionCount }, (_unused, index) => ({
    value: index,
    label: "▸".repeat(index + 1),
    ariaLabel: sceneSpeedAriaLabel(index, defaultIndex, optionCount),
  }));
}

function sceneSpeedAriaLabel(
  index: number,
  defaultIndex: number,
  optionCount: number,
): string {
  const names =
    optionCount === 3
      ? ["Slow", "Medium", "Fast"]
      : optionCount === 4
        ? ["Slowest", "Slow", "Fast", "Fastest"]
        : [];
  const label = names[index] ?? `Speed ${index + 1}`;
  return index === defaultIndex ? `${label}, catalogue default` : label;
}

export function clonePaletteSceneContent(
  content: PaletteSceneContent,
): PaletteSceneContent {
  return {
    ...content,
    template: { ...content.template },
    steps: content.steps.map((step) => ({
      ...step,
      colour: [...step.colour],
      inline_colour:
        step.inline_colour === null ? null : [...step.inline_colour],
    })),
    palette: content.palette.map((colour) => [...colour]),
  };
}

export function cloneSceneContent(content: SceneContent): SceneContent {
  if (content.kind === "scene_palette") {
    return clonePaletteSceneContent(content);
  }
  if (content.kind === "scene_layered") {
    return cloneLayeredSceneContent(content);
  }
  return {
    ...content,
    template: { ...content.template },
  };
}
