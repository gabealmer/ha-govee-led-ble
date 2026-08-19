import { expect, test, vi } from "vitest";

import { PanelController } from "../../src/panel-controller";
import { PanelEditorController } from "../../src/panel-editor-controller";
import { PanelModalController } from "../../src/panel-modal-controller";
import { PanelModel } from "../../src/panel-model";
import { PanelPreviewController } from "../../src/panel-preview-controller";
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
