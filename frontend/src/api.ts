import type {
  CustomEffectCatalogue,
  DeploymentRecord,
  DeploymentSnapshot,
  DeviceCapabilities,
  DraftSummary,
  EditorApiInfo,
  EffectContent,
  EffectDraft,
  HomeAssistant,
  LibraryItem,
  LibrarySnapshot,
  SceneCatalogue,
  SceneDetail,
  SceneSummary,
} from "./types";
import {
  decodeCustomCatalogue,
  decodeDeployment,
  decodeDeploymentSnapshot,
  decodeDevices,
  decodeDraft,
  decodeDraftSummaries,
  decodeEditorApiInfo,
  decodeLibraryItem,
  decodeLibrarySnapshot,
  decodeSceneCatalogue,
  decodeSceneDetail,
  decodeSceneSummary,
  effectContentToWire,
} from "./validation";

const PREFIX = "ha_govee_led_ble/editor";

export class EffectStudioApi {
  public constructor(private readonly hass: HomeAssistant) {}

  public async info(): Promise<EditorApiInfo> {
    return decodeEditorApiInfo(await this.call("info"));
  }

  public async devices(): Promise<DeviceCapabilities[]> {
    const result = await this.call("devices");
    return decodeDevices(resultField(result, "devices"));
  }

  public async customCatalogue(): Promise<CustomEffectCatalogue> {
    const result = await this.call("custom/catalogue");
    return decodeCustomCatalogue(resultField(result, "catalogue"));
  }

  public async library(): Promise<LibrarySnapshot> {
    return decodeLibrarySnapshot(await this.call("library/list"));
  }

  public async item(itemId: string): Promise<LibraryItem> {
    const result = await this.call("library/get", {
      item_id: itemId,
    });
    return decodeLibraryItem(resultField(result, "item"));
  }

  public async createItem(
    name: string,
    content: EffectContent,
    expectedLibraryRevision: number,
  ): Promise<{ item: LibraryItem; library_revision: number }> {
    const result = await this.call("library/create", {
      name,
      content: effectContentToWire(content),
      expected_library_revision: expectedLibraryRevision,
    });
    return {
      item: decodeLibraryItem(resultField(result, "item")),
      library_revision: libraryRevisionField(result),
    };
  }

  public async updateItem(
    item: LibraryItem,
    name: string,
    content: EffectContent,
    expectedLibraryRevision: number,
  ): Promise<{ item: LibraryItem; library_revision: number }> {
    const result = await this.call("library/update", {
      item_id: item.id,
      name,
      content: effectContentToWire(content),
      expected_revision: item.revision,
      expected_library_revision: expectedLibraryRevision,
    });
    return {
      item: decodeLibraryItem(resultField(result, "item")),
      library_revision: libraryRevisionField(result),
    };
  }

  public async drafts(): Promise<DraftSummary[]> {
    const result = await this.call("draft/list");
    return decodeDraftSummaries(resultField(result, "drafts"));
  }

  public async draft(draftId: string): Promise<EffectDraft> {
    const result = await this.call("draft/get", {
      draft_id: draftId,
    });
    return decodeDraft(resultField(result, "draft"));
  }

  public async createDraft(
    name: string,
    content: EffectContent,
    selectedConfigEntryId: string | null,
    baseItem?: LibraryItem,
  ): Promise<EffectDraft> {
    const result = await this.call("draft/create", {
      name,
      content: effectContentToWire(content),
      updated_at: new Date().toISOString(),
      selected_config_entry_id: selectedConfigEntryId,
      ...(baseItem
        ? {
            base_item_id: baseItem.id,
            base_item_revision: baseItem.revision,
          }
        : {}),
    });
    return decodeDraft(resultField(result, "draft"));
  }

  public async updateDraft(
    draft: EffectDraft,
    name: string,
    content: EffectContent,
    selectedConfigEntryId: string | null,
  ): Promise<EffectDraft> {
    const result = await this.call("draft/update", {
      draft_id: draft.id,
      expected_revision: draft.revision,
      name,
      content: effectContentToWire(content),
      updated_at: new Date().toISOString(),
      selected_config_entry_id: selectedConfigEntryId,
    });
    return decodeDraft(resultField(result, "draft"));
  }

  public async deleteDraft(draft: EffectDraft): Promise<void> {
    await this.call("draft/delete", {
      draft_id: draft.id,
      expected_revision: draft.revision,
    });
  }

  public async applySaved(
    configEntryId: string,
    item: LibraryItem,
  ): Promise<DeploymentRecord> {
    const result = await this.call("apply", {
      config_entry_id: configEntryId,
      item_id: item.id,
      revision: item.revision,
      updated_at: new Date().toISOString(),
    });
    return decodeDeployment(resultField(result, "deployment"));
  }

  public async applySnapshot(
    configEntryId: string,
    name: string,
    content: EffectContent,
  ): Promise<DeploymentRecord> {
    const result = await this.call(
      "apply_snapshot",
      {
        config_entry_id: configEntryId,
        name,
        content: effectContentToWire(content),
        updated_at: new Date().toISOString(),
      },
    );
    return decodeDeployment(resultField(result, "deployment"));
  }

  public async sceneCatalogue(
    configEntryId: string,
  ): Promise<SceneCatalogue> {
    const result = await this.call(
      "scene/catalogue/list",
      {
        config_entry_id: configEntryId,
      },
    );
    return decodeSceneCatalogue(resultField(result, "catalogue"));
  }

  public sceneDetail(
    configEntryId: string,
    sceneId: number,
    effectId: number,
  ): Promise<SceneDetail> {
    return this.call("scene/catalogue/get", {
      config_entry_id: configEntryId,
      scene_id: sceneId,
      effect_id: effectId,
    }).then(decodeSceneDetail);
  }

  public async applyScene(
    configEntryId: string,
    scene: SceneSummary,
    speedIndex: number | null,
  ): Promise<{
    scene: SceneSummary;
    speed_index: number | null;
    readback: "scene_identity_only";
  }> {
    const result = await this.call("scene/apply", {
      config_entry_id: configEntryId,
      scene_id: scene.scene_id,
      effect_id: scene.effect_id,
      ...(speedIndex === null ? {} : { speed_index: speedIndex }),
    });
    const returnedScene = decodeSceneSummary(resultField(result, "scene"));
    const readback = resultField(result, "readback");
    if (readback !== "scene_identity_only") {
      throw new Error("Malformed Effect Studio server payload: scene Apply readback is invalid.");
    }
    const returnedSpeed = resultField(result, "speed_index");
    if (
      returnedSpeed !== null &&
      (typeof returnedSpeed !== "number" ||
        !Number.isSafeInteger(returnedSpeed) ||
        returnedSpeed < 0 ||
        returnedSpeed > 255)
    ) {
      throw new Error("Malformed Effect Studio server payload: scene Apply speed is invalid.");
    }
    return {
      scene: returnedScene,
      speed_index: returnedSpeed,
      readback,
    };
  }

  public subscribeLibrary(
    callback: (snapshot: LibrarySnapshot) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> {
    return this.hass.connection.subscribeMessage(
      (snapshot) => {
        try {
          callback(decodeLibrarySnapshot(snapshot));
        } catch (error) {
          onError?.(asError(error));
        }
      },
      {
        type: `${PREFIX}/library/subscribe`,
      },
    );
  }

  public subscribeDeployments(
    callback: (snapshot: DeploymentSnapshot) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> {
    return this.hass.connection.subscribeMessage(
      (snapshot) => {
        try {
          callback(decodeDeploymentSnapshot(snapshot));
        } catch (error) {
          onError?.(asError(error));
        }
      },
      {
        type: `${PREFIX}/deployment/subscribe`,
      },
    );
  }

  private call<T>(
    command: string,
    data: Record<string, unknown> = {},
  ): Promise<T> {
    return this.hass.callWS<T>({
      type: `${PREFIX}/${command}`,
      ...data,
    });
  }
}

function resultField(value: unknown, field: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Malformed Effect Studio server payload: response must be an object.");
  }
  if (!(field in value)) {
    throw new Error(`Malformed Effect Studio server payload: response is missing ${field}.`);
  }
  return (value as Record<string, unknown>)[field];
}

function libraryRevisionField(value: unknown): number {
  const revision = resultField(value, "library_revision");
  if (
    typeof revision !== "number" ||
    !Number.isSafeInteger(revision) ||
    revision < 0
  ) {
    throw new Error("Malformed Effect Studio server payload: library revision is invalid.");
  }
  return revision;
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Malformed Effect Studio server payload.");
}
