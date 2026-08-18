import { expect, test } from "vitest";

import { PanelController } from "../../src/panel-controller";
import { PanelEditorController } from "../../src/panel-editor-controller";
import { PanelModalController } from "../../src/panel-modal-controller";
import { PanelModel } from "../../src/panel-model";
import { PanelPreviewController } from "../../src/panel-preview-controller";
import type {
  DeviceCapabilities,
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
    background: [0, 0, 0],
    groups: [{ fill: [1, 2, 3], segments: [0] }],
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
  expect(model.availabilityNotice()).toContain("temporarily unavailable");
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
  model.content.background[0] = 255;

  expect(source.background).toEqual([0, 0, 0]);
  expect(model.dirty).toBe(true);
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
  expect(model.name).toBe("Custom Paint");
  expect(model.dirty).toBe(true);
});

test("initial navigation preserves unavailable deep links and their notice", async () => {
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
  expect(model.notice).toContain("temporarily unavailable");
});
