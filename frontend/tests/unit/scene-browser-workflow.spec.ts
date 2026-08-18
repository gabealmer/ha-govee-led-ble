import { describe, expect, test, vi } from "vitest";

import type { EffectStudioApi } from "../../src/api";
import { SceneBrowserWorkflow } from "../../src/scene-browser-workflow";
import type {
  BuiltinSceneContent,
  DeviceCapabilities,
  LibraryItem,
  LibrarySummary,
  SceneCatalogue,
  SceneDetail,
  SceneSummary,
} from "../../src/types";

const firstScene: SceneSummary = {
  scene_id: 1,
  effect_id: 11,
  category_id: 1,
  category: "Natural",
  name: "Glacier",
  variant: "",
  display_name: "Glacier",
  scene_type: 1,
  parameter_kind: "none",
  speed: { option_count: 3, default_index: 1 },
};
const secondScene: SceneSummary = {
  ...firstScene,
  scene_id: 2,
  effect_id: 22,
  name: "Sunrise",
  display_name: "Sunrise",
};
const catalogue: SceneCatalogue = {
  schema_version: 1,
  sku: "H617A",
  enabled: true,
  categories: [{ id: 1, name: "Natural" }],
  scenes: [firstScene, secondScene],
};
const device = {
  config_entry_id: "device-a",
} as DeviceCapabilities;

function content(scene: SceneSummary, speedIndex: number | null = null): BuiltinSceneContent {
  return {
    kind: "scene_builtin",
    template: {
      sku: catalogue.sku,
      scene_id: scene.scene_id,
      effect_id: scene.effect_id,
      catalogue_schema_version: catalogue.schema_version,
    },
    speed_index: speedIndex,
  };
}

function detail(scene: SceneSummary, speedIndex: number | null = null): SceneDetail {
  return { scene, content: content(scene, speedIndex), has_default: false };
}

function libraryItem(id: string, scene: SceneSummary, name = "Saved Glacier"): LibraryItem {
  return {
    schema_version: 1,
    id,
    version: 1,
    updated_at: "2026-08-18T00:00:00Z",
    name,
    content: content(scene),
    content_hash: "a".repeat(64),
    origin: { kind: "authored", source_id: null },
    extensions: {},
  };
}

function summary(item: LibraryItem): LibrarySummary {
  return {
    id: item.id,
    version: item.version,
    updated_at: item.updated_at,
    name: item.name,
    kind: item.content.kind,
    content_hash: item.content_hash,
    origin: item.origin,
    template: item.content.kind === "scene_builtin" ? item.content.template : undefined,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

function harness(api: EffectStudioApi) {
  const initialSelectionFinished = vi.fn();
  const libraryItemSaved = vi.fn();
  const workflow = new SceneBrowserWorkflow({
    changed: vi.fn(),
    initialSelectionFinished,
    libraryItemSaved,
  });
  workflow.configure(api, device);
  return { workflow, initialSelectionFinished, libraryItemSaved };
}

describe("SceneBrowserWorkflow", () => {
  test("a stale scene response cannot replace the latest selection", async () => {
    const first = deferred<SceneDetail>();
    const second = deferred<SceneDetail>();
    const api = {
      sceneCatalogue: vi.fn().mockResolvedValue(catalogue),
      sceneDetail: vi.fn((_deviceId: string, sceneId: number) =>
        sceneId === firstScene.scene_id ? first.promise : second.promise,
      ),
    } as unknown as EffectStudioApi;
    const { workflow } = harness(api);
    await workflow.loadCatalogue();

    const selectFirst = workflow.selectBuiltin(firstScene);
    const selectSecond = workflow.selectBuiltin(secondScene);
    second.resolve(detail(secondScene, 2));
    await expect(selectSecond).resolves.toBe(true);
    first.resolve(detail(firstScene, 0));
    await expect(selectFirst).resolves.toBe(false);

    expect(workflow.state.selectedScene).toEqual(secondScene);
    expect(workflow.state.speedIndex).toBe(2);
  });

  test("an initial saved selection opens once through the custom-scene path", async () => {
    const item = libraryItem("saved-a", firstScene);
    const api = {
      sceneCatalogue: vi.fn().mockResolvedValue(catalogue),
      item: vi.fn().mockResolvedValue(item),
      sceneDetail: vi.fn().mockResolvedValue(detail(firstScene)),
    } as unknown as EffectStudioApi;
    const { workflow, initialSelectionFinished } = harness(api);
    workflow.setLibrary({ items: [summary(item)] });
    workflow.setInitialSelection({ kind: "saved", itemId: item.id });

    await workflow.loadCatalogue();
    await workflow.openInitialSelection();

    expect(workflow.state.selectedItem).toEqual(item);
    expect(workflow.state.content).not.toBe(item.content);
    expect(initialSelectionFinished).toHaveBeenCalledOnce();
    expect(initialSelectionFinished).toHaveBeenCalledWith(true);
  });

  test("saving owns persistence payloads and commits the returned library item", async () => {
    const saved = libraryItem("saved-copy", firstScene, "Glacier custom");
    const createItem = vi.fn().mockResolvedValue(saved);
    const api = {
      sceneCatalogue: vi.fn().mockResolvedValue(catalogue),
      sceneDetail: vi.fn().mockResolvedValue(detail(firstScene)),
      createItem,
    } as unknown as EffectStudioApi;
    const { workflow, libraryItemSaved } = harness(api);
    await workflow.loadCatalogue();
    await workflow.selectBuiltin(firstScene);
    workflow.edit(true);
    workflow.setName("  Glacier custom  ");
    workflow.setSpeedIndex(2);

    await workflow.save(true);

    expect(createItem).toHaveBeenCalledWith(
      "Glacier custom",
      expect.objectContaining({ kind: "scene_builtin", speed_index: 2 }),
    );
    expect(libraryItemSaved).toHaveBeenCalledWith(saved);
    expect(workflow.state.selectedItem).toEqual(saved);
    expect(workflow.state.category).toBe("custom");
    expect(workflow.state.notice).toBe("Custom scene saved.");
  });

  test("cancelling a scene copy restores the selected catalogue scene", async () => {
    const api = {
      sceneCatalogue: vi.fn().mockResolvedValue(catalogue),
      sceneDetail: vi.fn().mockResolvedValue(detail(firstScene, 1)),
    } as unknown as EffectStudioApi;
    const { workflow } = harness(api);
    await workflow.loadCatalogue();
    await workflow.selectBuiltin(firstScene);
    workflow.edit(true);
    workflow.setName("Changed copy");
    workflow.setSpeedIndex(2);

    await expect(workflow.cancelCopy()).resolves.toBe(true);

    expect(workflow.state.editingCopy).toBe(false);
    expect(workflow.state.name).toBe(firstScene.display_name);
    expect(workflow.state.speedIndex).toBe(1);
    expect(api.sceneDetail).toHaveBeenCalledTimes(2);
  });

  test("a completed stale save is announced without restoring its old selection", async () => {
    const pendingSave = deferred<LibraryItem>();
    const saved = libraryItem("saved-copy", firstScene, "Glacier copy");
    const api = {
      sceneCatalogue: vi.fn().mockResolvedValue(catalogue),
      sceneDetail: vi.fn().mockResolvedValue(detail(firstScene)),
      createItem: vi.fn().mockReturnValue(pendingSave.promise),
    } as unknown as EffectStudioApi;
    const { workflow, libraryItemSaved } = harness(api);
    await workflow.loadCatalogue();
    await workflow.selectBuiltin(firstScene);
    workflow.edit(true);

    const save = workflow.save(true);
    workflow.setCategory("custom");
    pendingSave.resolve(saved);
    await save;

    expect(libraryItemSaved).toHaveBeenCalledWith(saved);
    expect(workflow.state.selectedItem).toBeUndefined();
    expect(workflow.state.category).toBe("custom");
  });
});
