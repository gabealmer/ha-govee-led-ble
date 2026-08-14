import "../../src/panel";
import { EffectStudioApi } from "../../src/api";
import type { GoveeLedEffectStudio } from "../../src/panel";
import type {
  DeploymentRecord,
  DeploymentSnapshot,
  EffectContent,
  EffectDraft,
  LibraryItem,
} from "../../src/types";

import {
  MockHomeAssistantBackend,
  type MockBackendSnapshot,
} from "./mock-home-assistant";

const parameters = new URLSearchParams(window.location.search);
const backend = new MockHomeAssistantBackend(
  parameters.get("admin") !== "0",
  parameters.get("apiMismatch") === "1",
  parameters.get("slowLoad") === "1",
  parameters.get("malformedLibrary") === "1",
  parameters.get("rejectDeploymentSubscription") === "1",
  parameters.get("fixtures") === "1",
);

if (parameters.get("rtl") === "1") {
  document.documentElement.dir = "rtl";
}

const editor = document.createElement("ha-govee-led-ble-editor");
editor.hass = backend.hass;
editor.panel = {
  config: {
    configuration_path: "/config/integrations/integration/ha_govee_led_ble",
  },
};
document.body.append(editor);

export interface EffectStudioTestHarness {
  backend: MockHomeAssistantBackend;
  disconnectEditor(): void;
  exerciseOpaqueAdapter(): Promise<{
    loaded: LibraryItem;
    created: LibraryItem;
    updated: LibraryItem;
    fetchedDraft: EffectDraft;
    updatedDraft: EffectDraft;
    deployment: DeploymentRecord;
    subscribedDeployment: DeploymentRecord;
    knownKind: EffectContent["kind"];
    knownFirstChannel: number | null;
  }>;
  reconnectEditor(): void;
  snapshot(): MockBackendSnapshot;
  validateSceneDetail(value: unknown): unknown;
}

window.testHarness = {
  backend,
  disconnectEditor() {
    editor.remove();
  },
  async exerciseOpaqueAdapter() {
    const api = new EffectStudioApi(backend.hass);
    const loaded = await api.item("opaque-1");
    const known = await api.item("painted-1");
    const library = await api.library();
    const createdResult = await api.createItem(
      "Opaque adapter copy",
      loaded.content,
      library.library_revision,
    );
    const updatedResult = await api.updateItem(
      createdResult.item,
      "Opaque adapter updated",
      createdResult.item.content,
      createdResult.library_revision,
    );
    const createdDraft = await api.createDraft(
      "Opaque adapter draft",
      loaded.content,
      null,
    );
    const fetchedDraft = await api.draft(createdDraft.id);
    const updatedDraft = await api.updateDraft(
      fetchedDraft,
      "Opaque adapter draft updated",
      fetchedDraft.item.content,
      null,
    );
    let resolveDeployment:
      | ((snapshot: DeploymentSnapshot) => void)
      | undefined;
    const subscribedSnapshot = new Promise<DeploymentSnapshot>((resolve) => {
      resolveDeployment = resolve;
    });
    const unsubscribe = await api.subscribeDeployments((snapshot) => {
      resolveDeployment?.(snapshot);
    });
    const deployment = await api.applySnapshot(
      "h617a-main",
      "Opaque adapter deployment",
      loaded.content,
    );
    const subscribedDeployment = (await subscribedSnapshot).deployments[0];
    unsubscribe();
    return {
      loaded,
      created: createdResult.item,
      updated: updatedResult.item,
      fetchedDraft,
      updatedDraft,
      deployment,
      subscribedDeployment,
      knownKind: known.content.kind,
      knownFirstChannel:
        known.content.kind === "h617a_painted"
          ? known.content.background[0]
          : null,
    };
  },
  reconnectEditor() {
    if (!editor.isConnected) {
      document.body.append(editor);
    }
  },
  snapshot() {
    return backend.snapshot();
  },
  validateSceneDetail(value) {
    return backend.validateSceneDetail(value);
  },
};

declare global {
  interface Window {
    testHarness: EffectStudioTestHarness;
  }

  interface HTMLElementTagNameMap {
    "ha-govee-led-ble-editor": GoveeLedEffectStudio;
  }
}
