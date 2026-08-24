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
import { blankAdvancedContent } from "../../src/advanced-effect-model";
import type {
  CustomEffectCatalogue,
  DeviceCapabilities,
  HomeAssistant,
  LibraryItem,
  ModelEffectCatalogue,
  MusicProfileContent,
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
    },
    profiles: {
      music: "unsupported",
      video: "unsupported",
    },
    readback: "supported",
    preview_health: {
      config_entry_id: id,
      revision: 0,
      phase: "healthy",
      incident_id: null,
      error_code: null,
      error_message: null,
      write_disposition: "not_started",
      checked_at: "2026-08-24T00:00:00Z",
    },
    effect_categories: [
      "scenes",
      "video",
      "effects",
      "multi_layered",
      "reactive",
      "advanced",
    ],
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

function h6199Catalogue(): ModelEffectCatalogue {
  return {
    sku: "H6199",
    painted_effects: [],
    effects: [
      {
        id: "fade",
        label: "Fade",
        family: 1,
        variations: [{ id: "base", label: "Base", variant: 0 }],
        supports_multi: false,
        rate: "speed",
        category: "single_layer",
      },
    ],
    music_modes: [
      { id: "energetic", label: "Energetic" },
      { id: "rhythm", label: "Rhythm" },
    ],
    video_modes: [
      { id: "movie", label: "Movie" },
      { id: "game", label: "Game" },
    ],
    workshop_templates: [],
    workflows: [],
    supports: {
      multi: "unsupported",
      advanced: "supported",
      workshop: "unsupported",
    },
    limits: {
      palette_min: 1,
      palette_max: 8,
      multi_max: 5,
      music_sensitivity_min: 0,
      music_sensitivity_max: 100,
    },
    apply: {
      painted: "unsupported",
      single: "unsupported",
      multi: "unsupported",
      palette_diy: "supported",
      workshop: "unsupported",
    },
  };
}

function installH6199Catalogue(model: PanelModel): void {
  const catalogue = h6199Catalogue();
  model.customCatalogue = {
    ...catalogue,
    schema_version: 7,
    sku: "H617A",
    models: {
      H617A: { ...catalogue, sku: "H617A" },
      H6199: catalogue,
    },
  } as CustomEffectCatalogue;
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

function musicItem(content: MusicProfileContent): LibraryItem {
  return {
    schema_version: 1,
    id: "music-1",
    version: 2,
    updated_at: "2026-08-18T00:00:00Z",
    name: "Saved Reactive",
    content,
    content_hash: "music-hash",
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

test("selected-device health remains latched until a confirmed health update", () => {
  const model = new PanelModel(() => undefined);
  model.devices = [device("entry-a", "H617A")];
  model.selectedDeviceId = "entry-a";

  expect(model.selectedPreviewHealth?.phase).toBe("healthy");

  model.previewHealth = {
    "entry-a": {
      config_entry_id: "entry-a",
      revision: 1,
      phase: "degraded",
      incident_id: "incident-a",
      error_code: "device_readback_unknown",
      error_message: "No readback",
      write_disposition: "completed",
      checked_at: "2026-08-24T00:01:00Z",
    },
  };
  model.previewStatus = {
    session_id: "session-a",
    sequence: 2,
    config_entry_id: "entry-a",
    phase: "queued",
    content_kind: "h617a_single",
    confidence: "unknown",
    error_code: null,
    error_message: null,
    write_disposition: "not_started",
    persist_default: false,
    scene_id: null,
    effect_id: null,
    default_action: null,
  };

  expect(model.selectedPreviewHealth?.phase).toBe("degraded");

  model.previewHealth = {
    "entry-a": {
      ...model.previewHealth["entry-a"],
      revision: 2,
      phase: "healthy",
      incident_id: null,
      error_code: null,
      error_message: null,
    },
  };

  expect(model.selectedPreviewHealth?.phase).toBe("healthy");
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
});

test("save and effect-family controls distinguish starters, New drafts, and saved effects", () => {
  const model = new PanelModel(() => undefined);
  model.name = "Jumping";
  model.content = painted();
  model.savedBaseline = serialiseEditable(model.name, model.content);
  model.editorSource = {
    kind: "catalogue",
    owner: { section: "custom", category: "single-layer" },
    selectionIdentity: "template:paint",
    label: "Paint",
  };

  expect(model.dirty).toBe(false);
  expect(model.canSaveCurrentDraft).toBe(false);
  expect(model.showSingleEffectSelector).toBe(false);

  model.editorSource = {
    kind: "new",
    owner: { section: "custom", category: "single-layer" },
  };
  expect(model.showSingleEffectSelector).toBe(true);

  model.currentItem = item(painted());
  model.editorSource = {
    kind: "saved",
    owner: { section: "custom", category: "single-layer" },
    itemId: model.currentItem.id,
  };
  expect(model.showSingleEffectSelector).toBe(true);
  expect(model.canSaveCurrentDraft).toBe(false);
});

test("unchanged explicit New drafts open the Save naming flow", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.name = "Jumping";
  model.content = painted();
  model.savedBaseline = serialiseEditable(model.name, model.content);
  model.editorSource = {
    kind: "new",
    owner: { section: "custom", category: "single-layer" },
  };
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  const save = vi.fn();

  modal.requestSave({} as HTMLElement, save);

  expect(save).not.toHaveBeenCalled();
  expect(model.saveNameDialogOpen).toBe(true);
  expect(model.saveNameMode).toBe("save");
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
  model.sceneEditorOpen = true;

  expect(controller.applyLibraryItem(item(source))).toBe(true);
  expect(model.dirty).toBe(false);
  expect(model.sceneEditorOpen).toBe(false);

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
  model.resetBaseline = {
    ...painted(),
    segments: Array.from({ length: 15 }, () => null),
  };
  controller.resetContent();
  if (model.content.kind !== "h617a_painted") {
    throw new Error("paint content changed kind");
  }
  expect(model.content.segments.every((segment) => segment === null)).toBe(true);
  expect(model.content).toMatchObject({
    kind: "h617a_painted",
    effect: "cycle",
    speed: 50,
    brightness: 100,
    segments: Array.from({ length: 15 }, () => null),
  });
});

test("catalogue templates edit directly without creating a Cancel breadcrumb", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const controller = editor(model);

  controller.openEditableTemplate(
    "Paint",
    painted(),
    "template:paint",
    { section: "custom", category: "single-layer" },
  );
  const templateEpoch = model.editorTransitionEpoch;
  expect(model.editorSource.kind).toBe("catalogue");
  expect(model.dirty).toBe(false);
  expect(model.editorActions).toMatchObject({
    cancel: false,
    save: false,
    saveAs: true,
  });

  controller.updatePaintedContent({ speed: 75 }, "committed");
  expect(model.editorTransitionEpoch).toBe(templateEpoch);
  expect(model.name).toBe("Paint");
  expect(model.resetDirty).toBe(true);
  expect(model.editorActions.cancel).toBe(false);

  controller.resetContent();
  expect(model.content).toEqual(painted());
  expect(model.name).toBe("Paint");
  expect(model.resetDirty).toBe(false);
});

test("explicit template selection previews once while automatic opening only populates the editor", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const preview = new PanelPreviewController(model);
  const schedule = vi.spyOn(preview, "scheduleTemplateSelection");
  const scheduleEdited = vi.spyOn(preview, "scheduleEdited");
  const committed = vi.fn();
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  const controller = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => undefined,
    contentCommitted: committed,
  });

  controller.openEditableTemplate(
    "Paint",
    painted(),
    "template:paint",
    { section: "custom", category: "single-layer" },
    true,
  );
  expect(schedule).toHaveBeenCalledOnce();

  schedule.mockClear();
  const transitionEpoch = controller.beginSelectionTransition();
  controller.openEditableTemplate(
    "Paint",
    painted(),
    "template:paint",
    { section: "custom", category: "single-layer" },
    false,
    transitionEpoch,
  );
  expect(schedule).not.toHaveBeenCalled();

  controller.updatePaintedContent({ speed: 80 }, "committed");
  scheduleEdited.mockClear();
  committed.mockClear();
  controller.resetContent();
  expect(scheduleEdited).toHaveBeenCalledWith("committed", undefined);
  expect(committed).toHaveBeenCalledWith("committed");
});

test("Reactive Reset restores its baseline immediately and previews only once", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const selected = device("entry-a", "H6199");
  selected.profiles.music = "supported";
  model.devices = [selected];
  model.selectedDeviceId = selected.config_entry_id;
  model.customEffectCategory = "music";
  installH6199Catalogue(model);
  const preview = new PanelPreviewController(model);
  const scheduleEdited = vi.spyOn(preview, "scheduleEdited");
  const committed = vi.fn();
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  const controller = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => undefined,
    contentCommitted: committed,
  });

  controller.newCustomEffect("music");
  controller.musicModeChanged("rhythm");
  expect(model.resetDirty).toBe(true);
  scheduleEdited.mockClear();
  committed.mockClear();

  controller.resetContent();
  expect(model.content).toMatchObject({
    kind: "music_profile",
    mode: "energetic",
  });
  expect(model.resetDirty).toBe(false);
  expect(model.editorActions.reset).toBe(false);
  expect(scheduleEdited).toHaveBeenCalledTimes(1);
  expect(scheduleEdited).toHaveBeenCalledWith("committed", undefined);
  expect(committed).toHaveBeenCalledTimes(1);

  controller.resetContent();
  expect(scheduleEdited).toHaveBeenCalledTimes(1);
  expect(committed).toHaveBeenCalledTimes(1);
});

test("Reactive mode changes preserve common fields, identity, and generated names", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.customEffectCategory = "music";
  const selected = device("entry-a", "H6199");
  selected.profiles.music = "supported";
  model.devices = [selected];
  model.selectedDeviceId = selected.config_entry_id;
  installH6199Catalogue(model);
  const preview = new PanelPreviewController(model);
  const scheduleEdited = vi.spyOn(preview, "scheduleEdited");
  const committed = vi.fn();
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  const controller = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => undefined,
    contentCommitted: committed,
  });

  controller.newCustomEffect("music");
  controller.musicContentChanged({
    kind: "music_profile",
    model: "H6199",
    mode: "energetic",
    sensitivity: 61,
    colour: [1, 2, 3],
    calm: null,
    parameters: { point: 4, speed: 8 },
  });
  scheduleEdited.mockClear();
  committed.mockClear();

  controller.musicModeChanged("rhythm");
  expect(model.editorSource).toEqual({
    kind: "new",
    owner: { section: "custom", category: "music" },
  });
  expect(model.newCustomEffectSelected).toBe(true);
  expect(model.name).toBe("New Rhythm effect");
  expect(model.content).toEqual({
    kind: "music_profile",
    model: "H6199",
    mode: "rhythm",
    sensitivity: 61,
    colour: [1, 2, 3],
    calm: false,
    parameters: {},
  });
  expect(scheduleEdited).toHaveBeenCalledWith("committed", undefined);
  expect(committed).toHaveBeenCalledWith("committed");

  model.name = "My Reactive effect";
  controller.musicModeChanged("energetic");
  expect(model.name).toBe("My Reactive effect");

  const saved = musicItem({
    kind: "music_profile",
    model: "H6199",
    mode: "energetic",
    sensitivity: 72,
    colour: null,
    calm: null,
    parameters: { point: 5 },
  });
  controller.applyLibraryItem(saved);
  controller.musicModeChanged("rhythm");
  expect(model.editorSource).toMatchObject({
    kind: "saved",
    itemId: saved.id,
  });
  expect(model.dirty).toBe(true);
  expect(model.content).toMatchObject({
    mode: "rhythm",
    sensitivity: 72,
    colour: null,
    parameters: {},
  });
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
  expect(model.editorSource.kind).toBe("new");
  expect(model.editorActions.cancel).toBe(true);
  expect(model.name).toBe("New Advanced effect");

  controller.cancelCreation();
  expect(model.editorActions.cancel).toBe(false);
  expect(model.name).toBe("Prior");
  expect(model.content).toEqual(painted());

  controller.newEffect("advanced");
  expect(model.editorActions.cancel).toBe(true);
  controller.cancelCreation();
  controller.cancelCreation();
  expect(model.editorActions.cancel).toBe(false);
  expect(model.name).toBe("Prior");
});

test("Advanced waits for New or a saved effect instead of opening a redundant starter", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.devices = [device("entry-a", "H617A")];
  model.devices[0].custom_effects.advanced = "supported";
  model.selectedDeviceId = "entry-a";
  const controller = editor(model);
  const transitionEpoch = controller.beginTransition();

  controller.openDefaultAvailableTemplate("advanced", transitionEpoch);

  expect(model.name).toBe("");
  expect(model.editorSource.kind).toBe("none");
  expect(model.editorActions.cancel).toBe(false);
});

test("explicit New and layered scene Reset restore content without changing names", () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.devices = [device("entry-a", "H617A")];
  model.devices[0].custom_effects.advanced = "supported";
  model.selectedDeviceId = "entry-a";
  const controller = editor(model);

  controller.newEffect("advanced");
  const newName = model.name;
  const editedNew = blankAdvancedContent();
  editedNew.layers[0].priority = 4;
  controller.advancedContentChanged(editedNew, "committed");
  expect(model.resetDirty).toBe(true);
  controller.resetContent();
  expect(model.name).toBe(newName);
  expect(model.content).toEqual(blankAdvancedContent());

  const scene = {
    kind: "scene_layered" as const,
    template: {
      sku: "H617A",
      scene_id: 1,
      effect_id: 2,
      catalogue_schema_version: 1,
    },
    effect: { layers: blankAdvancedContent().layers },
    speed_index: null,
    raw_param: "",
  };
  controller.openSceneEditor({
    content: scene,
    config_entry_id: "entry-a",
    name: "Scene heading",
  });
  const editedScene = blankAdvancedContent();
  editedScene.layers[0].priority = 5;
  controller.advancedContentChanged(editedScene, "committed");
  controller.resetContent();

  expect(model.name).toBe("Scene heading");
  expect(model.content).toEqual(scene);
});

test("category transitions stay blank without a matching active item", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const selected = device("entry-a", "H6199");
  selected.custom_effects = {
    painted: "unsupported",
    single: "unsupported",
    multi: "unsupported",
    palette_diy: "supported",
    advanced: "supported",
    workshop: "unsupported",
  };
  selected.profiles = { music: "supported", video: "supported" };
  model.devices = [selected];
  model.selectedDeviceId = selected.config_entry_id;
  model.section = "video";
  installH6199Catalogue(model);
  const preview = new PanelPreviewController(model);
  const templatePreview = vi.spyOn(preview, "scheduleTemplateSelection");
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

  const videoEpoch = editorController.beginSelectionTransition();
  editorController.openVideoTemplate("movie", "Movie", false, videoEpoch);
  expect(model.editorOwnedByActiveView).toBe(true);
  expect(templatePreview).not.toHaveBeenCalled();

  await controller.selectSection("custom", "single-layer");
  expect(model.name).toBe("");
  expect(model.editorSource.kind).toBe("none");
  expect(templatePreview).not.toHaveBeenCalled();

  await controller.selectSection("custom", "music");
  expect(model.editorSource.kind).toBe("none");
  expect(model.name).toBe("");
  expect(model.content.kind).not.toBe("palette_diy");

  editorController.openMusicTemplate("energetic", "Energetic");
  expect(model.editorActions.cancel).toBe(false);
  editorController.openMusicTemplate("rhythm", "Rhythm");
  expect(model.editorActions.cancel).toBe(false);

  await controller.selectSection("video");
  expect(model.name).toBe("");
  await controller.selectSection("custom", "music");
  expect(model.editorSource.kind).toBe("none");
  await controller.selectSection("custom", "single-layer");
  expect(model.name).toBe("");
  await controller.selectSection("video");
  expect(model.name).toBe("");
});

test("automatic restoration selects only a matching fresh native category", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const selected = device("entry-a", "H6199");
  selected.profiles = { music: "supported", video: "supported" };
  model.devices = [selected];
  model.selectedDeviceId = selected.config_entry_id;
  model.userState = {
    owner_id: "user-a",
    recent_colours: [],
    selected_config_entry_id: selected.config_entry_id,
    navigation: { section: "scenes" },
  };
  installH6199Catalogue(model);
  const preview = new PanelPreviewController(model);
  const templatePreview = vi.spyOn(preview, "scheduleTemplateSelection");
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
  let refreshed = structuredClone(selected);
  refreshed.active_state = {
    config_entry_id: selected.config_entry_id,
    mode: "scene",
    observed_at: "2026-08-23T00:00:00Z",
    confidence: "unknown",
    diy_code: null,
    effect: "candlelight",
    native_mode: "candlelight",
    matched_operation_id: null,
    active_effect: null,
  };
  selected.active_state = structuredClone(refreshed.active_state);
  const applySavedEffect = vi.fn();
  controller.api = {
    device: vi.fn().mockImplementation(async () => structuredClone(selected)),
    updateUserState: vi.fn().mockResolvedValue(model.userState),
    applySavedEffect,
  } as unknown as EffectStudioApi;

  await controller.openInitialContext();
  expect(model.sceneInitialSelection).toEqual({
    kind: "native",
    effect: "candlelight",
  });

  await controller.selectSection("video");
  expect(model.editorSource.kind).toBe("none");
  expect(model.name).toBe("");

  refreshed.active_state = {
    ...refreshed.active_state!,
    mode: "video",
    effect: null,
    native_mode: "movie",
  };
  selected.active_state = structuredClone(refreshed.active_state);
  await controller.selectSection("video");
  expect(model.templateSelection).toBe("template:video:movie");

  refreshed.active_state = {
    ...refreshed.active_state!,
    mode: "music",
    native_mode: "energetic",
  };
  selected.active_state = structuredClone(refreshed.active_state);
  await controller.selectSection("custom", "music");
  expect(model.templateSelection).toBe("template:music:energetic");
  expect(templatePreview).not.toHaveBeenCalled();
  expect(applySavedEffect).not.toHaveBeenCalled();
});

test("navigation does not request device refreshes", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  const selected = device("entry-a", "H6199");
  selected.profiles = { music: "supported", video: "supported" };
  model.devices = [selected];
  model.selectedDeviceId = selected.config_entry_id;
  installH6199Catalogue(model);
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
  const deviceRefresh = vi.fn();
  controller.api = {
    device: deviceRefresh,
    updateUserState: vi.fn().mockResolvedValue(undefined),
  } as unknown as EffectStudioApi;

  await controller.selectSection("video");
  await controller.selectSection("custom", "music");

  expect(model.section).toBe("custom");
  expect(model.customEffectCategory).toBe("music");
  expect(model.editorSource.kind).toBe("none");
  expect(deviceRefresh).not.toHaveBeenCalled();
});

test("automatic saved restoration reads without applying, previewing, or saving", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
  model.liveApplyEnabled = true;
  const selected = device("entry-a", "H617A");
  const saved = item(painted());
  const summary = {
    id: saved.id,
    version: saved.version,
    updated_at: saved.updated_at,
    name: saved.name,
    kind: saved.content.kind,
    content_hash: saved.content_hash,
    origin: saved.origin,
  };
  selected.active_state = {
    config_entry_id: selected.config_entry_id,
    mode: "custom",
    observed_at: "2026-08-23T00:00:00Z",
    confidence: "activation_match",
    diy_code: 800,
    effect: null,
    native_mode: null,
    matched_operation_id: "operation-a",
    active_effect: {
      source_kind: "saved_effect",
      selector_label: saved.name,
      content_hash: saved.content_hash,
      origin: saved.origin,
      observable_signature: "custom:800",
      confidence: "activation_match",
      item_id: saved.id,
      item_version: saved.version,
    },
  };
  model.devices = [selected];
  model.selectedDeviceId = selected.config_entry_id;
  installH6199Catalogue(model);
  model.customCatalogue!.models.H617A.painted_effects = [
    { id: "cycle", label: "Cycle" },
  ];
  model.customCatalogue!.models.H617A.apply.painted = "supported";
  model.library = { items: [summary] };
  model.userState = {
    owner_id: "user-a",
    recent_colours: [],
    selected_config_entry_id: selected.config_entry_id,
    navigation: {
      section: "custom",
      custom_category: "single-layer",
      auto_save: true,
    },
  };
  const preview = new PanelPreviewController(model);
  const templatePreview = vi.spyOn(preview, "scheduleTemplateSelection");
  const modal = new PanelModalController(model, {
    updateComplete: async () => undefined,
    root: () => null,
    canMutate: () => true,
  });
  const contentCommitted = vi.fn();
  let controller!: PanelController;
  const editorController = new PanelEditorController(model, preview, modal, {
    apiReady: () => true,
    selectItem: () => undefined,
    editorTransitionStarted: () => controller.cancelPendingAutoSave(),
    contentCommitted,
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
  const applySavedEffect = vi.fn();
  const updateItem = vi.fn();
  const createItem = vi.fn();
  controller.api = {
    device: vi.fn().mockResolvedValue(selected),
    item: vi.fn().mockResolvedValue(saved),
    applySavedEffect,
    updateItem,
    createItem,
  } as unknown as EffectStudioApi;

  await controller.openInitialContext();

  expect(model.currentItem?.id).toBe(saved.id);
  expect(model.editorSource.kind).toBe("saved");
  expect(applySavedEffect).not.toHaveBeenCalled();
  expect(templatePreview).not.toHaveBeenCalled();
  expect(contentCommitted).not.toHaveBeenCalled();
  expect(updateItem).not.toHaveBeenCalled();
  expect(createItem).not.toHaveBeenCalled();
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
    .mockImplementation(
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
  expect(model.resetDirty).toBe(true);
  expect(model.notice).toBeUndefined();

  editorController.resetContent();
  await vi.waitFor(() => expect(updateItem).toHaveBeenCalledTimes(3));
  expect(updateItem.mock.calls[2][2]).toMatchObject({ speed: 50 });
  expect(model.resetDirty).toBe(false);
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
  expect(model.currentItem?.id).toBe(saved.id);
  expect(model.editorSource).toMatchObject({
    kind: "saved",
    itemId: saved.id,
  });
  expect(applySavedEffect).not.toHaveBeenCalled();

  model.liveApplyEnabled = true;
  await expect(controller.selectItem(saved.id)).resolves.toBe(true);
  expect(applySavedEffect).toHaveBeenCalledWith(
    "light.entry-a",
    "Saved paint",
  );
});

test("manual Save adopts the saved content as the next Reset baseline", async () => {
  const model = new PanelModel(() => undefined);
  model.isAdmin = true;
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
  const source = item(painted());
  editorController.applyLibraryItem(source);
  editorController.updatePaintedContent({ speed: 65 }, "committed");
  controller.api = {
    updateItem: vi.fn().mockResolvedValue({
      ...source,
      version: 3,
      content: { ...painted(), speed: 65 },
    }),
  } as unknown as EffectStudioApi;

  expect(model.resetDirty).toBe(true);
  await controller.save();

  expect(model.resetDirty).toBe(false);
  expect(model.resetBaseline).toMatchObject({ speed: 65 });
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
  expect(model.editorSource).toMatchObject({
    kind: "saved",
    itemId: "item-copy",
  });
  expect(model.resetDirty).toBe(false);
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
