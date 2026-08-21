import { expect, test, vi } from "vitest";

import type { EffectStudioApi } from "../../src/api";
import {
  PanelController,
  restoredAutoSave,
  restoredCustomEffectCategory,
} from "../../src/panel-controller";
import { PanelEditorController } from "../../src/panel-editor-controller";
import { PanelModalController } from "../../src/panel-modal-controller";
import { PanelModel } from "../../src/panel-model";
import { PanelPreviewController } from "../../src/panel-preview-controller";
import {
  blankVideoProfile,
  serialiseEditable,
} from "../../src/effect-editor-model";
import type {
  DeviceCapabilities,
  HomeAssistant,
  LibraryItem,
  PaintedContent,
} from "../../src/types";

function device(
  id: string,
  model: "H617A" | "H6199",
): DeviceCapabilities {
  return {
    config_entry_id: id,
    light_entity_id: `light.${id}`,
    model,
    display_name: id,
    segment_count: 15,
    custom_effects: {
      painted: "supported",
      single: "unsupported",
      multi: "unsupported",
      palette_diy: "unsupported",
      advanced: "unsupported",
      workshop: "unsupported",
      special_diy: "unsupported",
    },
    profiles: {
      music: "unsupported",
      video: "unsupported",
    },
    readback: "supported",
    active_state: null,
  };
}

function painted(): PaintedContent {
  return {
    kind: "h617a_painted",
    effect: "cycle",
    speed: 50,
    brightness: 100,
    segments: [
      [1, 2, 3],
      ...Array.from({ length: 14 }, () => null),
    ],
  };
}

function item(content: PaintedContent): LibraryItem {
  return {
    schema_version: 1,
    id: "item-1",
    version: 2,
    updated_at: "2026-08-18T00:00:00Z",
    name: "Saved paint",
    content,
    content_hash: "hash",
    origin: { kind: "authored", source_id: null },
    extensions: {},
  };
}

function editor(model: PanelModel): PanelEditorController {
  const preview = new PanelPreviewController(model);
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  return new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => undefined,
    contentCommitted: () => undefined,
  });
}

test("derives selected-device and preview decisions from panel state", () => {
  const model = new PanelModel(() => undefined);
  model.devices = [device("entry-a", "H617A")];
  model.selectedDeviceId = "entry-a";
  model.isAdmin = true;

  expect(model.selectedDevice?.display_name).toBe("entry-a");
  expect(model.selectedModel).toBe("H617A");
  expect(model.previewCapability).toBe("supported");
  expect(model.showDeviceSelector).toBe(false);

  model.selectedDeviceId = "missing";
  expect(model.selectedDevice).toBeUndefined();
  expect(model.showDeviceSelector).toBe(true);
});

test("administrator state follows late Home Assistant user updates", () => {
  const changed = vi.fn();
  const model = new PanelModel(changed);

  model.syncAdmin({ user: undefined } as unknown as HomeAssistant);
  expect(model.isAdmin).toBe(false);

  model.syncAdmin({
    user: { is_admin: true },
  } as unknown as HomeAssistant);
  expect(model.isAdmin).toBe(true);
  expect(changed).toHaveBeenCalledOnce();
});

test("remembered All category migrates to the available fallback", () => {
  expect(
    restoredCustomEffectCategory(
      "all",
      (category) => category === "all",
      "music",
    ),
  ).toBe("music");
  expect(
    restoredCustomEffectCategory(
      "my-effects",
      () => false,
      "single-layer",
    ),
  ).toBe("single-layer");
  expect(
    restoredCustomEffectCategory(
      "special-diy",
      () => false,
      "music",
    ),
  ).toBe("music");
});

test("save and effect-family controls distinguish starters, New drafts, and saved effects", () => {
  const model = new PanelModel(() => undefined);
  model.name = "Jumping";
  model.content = painted();
  model.savedBaseline = serialiseEditable(model.name, model.content);
  model.customCopyStarted = true;

  expect(model.dirty).toBe(false);
  expect(model.canSaveCurrentDraft).toBe(true);
  expect(model.showSingleEffectSelector).toBe(false);

  model.customCopyStarted = false;
  model.customTemplateSelection = "template:paint";
  expect(model.showSingleEffectSelector).toBe(true);

  model.currentItem = item(painted());
  expect(model.showSingleEffectSelector).toBe(true);
  expect(model.canSaveCurrentDraft).toBe(false);
});

test("unchanged starters open the Save As naming flow", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.name = "Jumping";
  model.content = painted();
  model.savedBaseline = serialiseEditable(model.name, model.content);
  model.customCopyStarted = true;
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  const save = vi.fn();

  modal.requestSave({} as HTMLElement, save);

  expect(save).not.toHaveBeenCalled();
  expect(model.saveNameDialogOpen).toBe(true);
  expect(model.saveNameMode).toBe("copy");
  expect(model.saveNameValue).toBe("Jumping");
});

test("auto-save restores only an explicit true preference", () => {
  expect(restoredAutoSave(true)).toBe(true);
  expect(restoredAutoSave(false)).toBe(false);
  expect(restoredAutoSave("true")).toBe(false);
  expect(restoredAutoSave(undefined)).toBe(false);
});

test("installs saved content as an isolated editable baseline", () => {
  const model = new PanelModel(() => undefined);
  const controller = editor(model);
  const source = painted();

  expect(controller.applyLibraryItem(item(source))).toBe(true);
  expect(model.dirty).toBe(false);

  if (model.content.kind !== "h617a_painted") {
    throw new Error("saved painted content changed kind");
  }
  model.content.segments[0] = [255, 0, 0];

  expect(source.segments[0]).toEqual([1, 2, 3]);
  expect(model.dirty).toBe(true);
});

test("paint editing applies colour and off as distinct draft states", () => {
  const model = new PanelModel(() => undefined);
  const controller = editor(model);

  controller.paintColourChanged([12, 34, 56]);
  expect(controller.setSegmentColour(2, "committed")).toBe(true);
  expect(model.content).toMatchObject({
    kind: "h617a_painted",
    segments: expect.arrayContaining([[12, 34, 56]]),
  });
  expect(controller.setSegmentColour(2, "committed")).toBe(false);

  controller.selectPaintOff();
  controller.setSegmentColour(2, "committed");
  if (model.content.kind !== "h617a_painted") {
    throw new Error("paint content changed kind");
  }
  expect(model.content.segments[2]).toBeNull();

  controller.paintColourChanged([90, 80, 70]);
  controller.setSegmentColour(4, "committed");
  controller.resetPaint();
  if (model.content.kind !== "h617a_painted") {
    throw new Error("paint content changed kind");
  }
  expect(model.content.segments.every((segment) => segment === null)).toBe(true);
  expect(model.content).toMatchObject({
    kind: "h617a_painted",
    effect: "clockwise",
    speed: 50,
    brightness: 100,
    segments: Array.from({ length: 15 }, () => null),
  });
});

test("template editing creates a custom copy and invalidates prior transitions", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const controller = editor(model);

  controller.openEditableTemplate("Paint", painted(), "template:paint");
  const templateEpoch = model.editorTransitionEpoch;
  expect(model.templateSourceLabel).toBe("Paint");
  expect(model.dirty).toBe(true);

  expect(controller.prepareTemplateEdit()).toBe(true);
  expect(model.editorTransitionEpoch).toBeGreaterThan(templateEpoch);
  expect(model.templateSourceLabel).toBeUndefined();
  expect(model.customCopyStarted).toBe(true);
  expect(model.editorCancelAvailable).toBe(true);
  expect(model.name).toBe("Custom Paint");
  expect(model.dirty).toBe(true);

  controller.cancelCreation();
  expect(model.templateSourceLabel).toBe("Paint");
  expect(model.customCopyStarted).toBe(false);
  expect(model.editorCancelAvailable).toBe(false);
});

test("cancelling a new effect restores the prior editor state", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.devices = [device("entry-a", "H617A")];
  model.devices[0].custom_effects.advanced = "supported";
  model.selectedDeviceId = "entry-a";
  model.name = "Prior";
  model.content = painted();
  const controller = editor(model);

  controller.newEffect("advanced");
  expect(model.editorCancelAvailable).toBe(true);
  expect(model.name).toBe("New Layered effect");

  controller.cancelCreation();
  expect(model.editorCancelAvailable).toBe(false);
  expect(model.name).toBe("Prior");
  expect(model.content).toEqual(painted());

  controller.newEffect("advanced");
  expect(model.editorCancelAvailable).toBe(true);
  controller.cancelCreation();
  controller.cancelCreation();
  expect(model.editorCancelAvailable).toBe(false);
  expect(model.name).toBe("Prior");
});

test("automatic default templates do not expose Cancel", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.devices = [device("entry-a", "H617A")];
  model.devices[0].custom_effects.advanced = "supported";
  model.selectedDeviceId = "entry-a";
  const controller = editor(model);
  const transitionEpoch = controller.beginTransition();

  controller.newEffect("advanced", transitionEpoch);

  expect(model.name).toBe("New Layered effect");
  expect(model.editorCancelAvailable).toBe(false);
});

test("initial navigation preserves unavailable deep links without a feedback banner", async () => {
  const model = new PanelModel(() => undefined);
  model.devices = [device("entry-a", "H617A")];
  model.userState = {
    owner_id: "user-a",
    recent_colours: [],
    selected_config_entry_id: "entry-a",
    navigation: {},
  };
  const preview = new PanelPreviewController(model);
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  let controller!: PanelController;
  const editorController = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: (itemId) => void controller.selectItem(itemId),
    editorTransitionStarted: () => undefined,
    contentCommitted: () => undefined,
  });
  controller = new PanelController(
    model,
    editorController,
    preview,
    modal,
    {
      connected: () => true,
      pathname: () => "/ha-govee-led-ble/editor/unavailable",
      replacePath: () => undefined,
    },
  );

  expect(await controller.initialiseSelectedDevice()).toBeUndefined();
  expect(model.selectedDeviceId).toBe("unavailable");
  expect(model.notice).toBeUndefined();
});

test("auto-save coalesces committed edits onto the returned item version", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.autoSaveEnabled = true;
  model.liveApplyEnabled = false;
  const preview = new PanelPreviewController(model);
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  let controller!: PanelController;
  const editorController = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => controller.cancelPendingAutoSave(),
    contentCommitted: (interaction) =>
      controller.contentCommitted(interaction),
  });
  controller = new PanelController(
    model,
    editorController,
    preview,
    modal,
    {
      connected: () => true,
      pathname: () => "/ha-govee-led-ble",
      replacePath: () => undefined,
    },
  );
  const sourceContent = painted();
  const source = item(sourceContent);
  editorController.applyLibraryItem(source);
  let resolveFirst!: (value: LibraryItem) => void;
  const first = new Promise<LibraryItem>((resolve) => {
    resolveFirst = resolve;
  });
  const updateItem = vi
    .fn()
    .mockReturnValueOnce(first)
    .mockImplementationOnce(
      async (
        current: LibraryItem,
        name: string,
        content: PaintedContent,
      ) => ({
        ...current,
        version: current.version + 1,
        updated_at: "2026-08-18T00:00:02Z",
        name,
        content,
      }),
    );
  controller.api = { updateItem } as unknown as EffectStudioApi;

  editorController.updatePaintedContent({ speed: 60 }, "committed");
  editorController.updatePaintedContent({ speed: 70 }, "committed");
  resolveFirst({
    ...source,
    version: 3,
    updated_at: "2026-08-18T00:00:01Z",
    content: { ...sourceContent, speed: 60 },
  });

  await vi.waitFor(() => expect(updateItem).toHaveBeenCalledTimes(2));

  expect(updateItem.mock.calls[1][0]).toMatchObject({ version: 3 });
  expect(updateItem.mock.calls[1][2]).toMatchObject({ speed: 70 });
  expect(model.currentItem).toMatchObject({ version: 4 });
  expect(model.notice).toBeUndefined();
});

test("saved item selection applies identity only while Live is enabled", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.devices = [device("entry-a", "H617A")];
  model.selectedDeviceId = "entry-a";
  const preview = new PanelPreviewController(model);
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  let controller!: PanelController;
  const editorController = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => controller.cancelPendingAutoSave(),
    contentCommitted: (interaction) =>
      controller.contentCommitted(interaction),
  });
  controller = new PanelController(
    model,
    editorController,
    preview,
    modal,
    {
      connected: () => true,
      pathname: () => "/ha-govee-led-ble",
      replacePath: () => undefined,
    },
  );
  const saved = item(painted());
  const applySavedEffect = vi.fn().mockResolvedValue(undefined);
  controller.api = {
    item: vi.fn().mockResolvedValue(saved),
    applySavedEffect,
  } as unknown as EffectStudioApi;

  model.liveApplyEnabled = false;
  await expect(controller.selectItem(saved.id)).resolves.toBe(true);
  expect(applySavedEffect).not.toHaveBeenCalled();

  model.liveApplyEnabled = true;
  await expect(controller.selectItem(saved.id)).resolves.toBe(true);
  expect(applySavedEffect).toHaveBeenCalledWith("entry-a", saved.id);
});

test("Save As rebinds a copy to its content category", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.liveApplyEnabled = false;
  const source = item(painted());
  model.currentItem = source;
  model.name = source.name;
  model.content = painted();
  model.savedBaseline = serialiseEditable(model.name, model.content);
  model.customEffectCategory = "my-effects";
  vi.spyOn(model, "customEffectCategoryAvailable").mockImplementation(
    (category) => category === "single-layer",
  );
  const preview = new PanelPreviewController(model);
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  let controller!: PanelController;
  const editorController = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => controller.cancelPendingAutoSave(),
    contentCommitted: () => undefined,
  });
  controller = new PanelController(
    model,
    editorController,
    preview,
    modal,
    {
      connected: () => true,
      pathname: () => "/ha-govee-led-ble",
      replacePath: () => undefined,
    },
  );
  controller.api = {
    createItem: vi.fn().mockResolvedValue({
      ...source,
      id: "item-copy",
      version: 1,
      name: "Saved paint copy",
    }),
  } as unknown as EffectStudioApi;

  await controller.saveAs("Saved paint copy");

  expect(model.currentItem?.id).toBe("item-copy");
  expect(model.customEffectCategory).toBe("single-layer");
});

test("Save As keeps video profile copies in the Video section", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.liveApplyEnabled = false;
  model.section = "video";
  const source: LibraryItem = {
    schema_version: 1,
    id: "video-source",
    version: 2,
    updated_at: "2026-08-18T00:00:00Z",
    name: "Cinema",
    content: blankVideoProfile("movie"),
    content_hash: "video-hash",
    origin: { kind: "authored", source_id: null },
    extensions: {},
  };
  model.currentItem = source;
  model.name = source.name;
  model.content = source.content;
  const preview = new PanelPreviewController(model);
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  let controller!: PanelController;
  const editorController = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => controller.cancelPendingAutoSave(),
    contentCommitted: () => undefined,
  });
  controller = new PanelController(
    model,
    editorController,
    preview,
    modal,
    {
      connected: () => true,
      pathname: () => "/ha-govee-led-ble",
      replacePath: () => undefined,
    },
  );
  controller.api = {
    createItem: vi.fn().mockResolvedValue({
      ...source,
      id: "video-copy",
      version: 1,
      name: "Cinema copy",
    }),
  } as unknown as EffectStudioApi;

  await controller.saveAs("Cinema copy");

  expect(model.currentItem?.id).toBe("video-copy");
  expect(model.section).toBe("video");
});
