import type {
  CustomEffectCatalogue,
  DeviceCapabilities,
  EditorApiInfo,
  EffectContent,
  EffectUserState,
  HomeAssistant,
  LibraryItem,
  LibrarySnapshot,
  PreviewStatus,
  SceneCatalogue,
  SceneDetail,
  SceneSummary,
} from "./types";
import {
  decodeCustomCatalogue,
  decodeDevices,
  decodeEditorApiInfo,
  decodeEffectUserState,
  decodeLibraryItem,
  decodeLibrarySnapshot,
  decodePreviewStatus,
  decodeSceneCatalogue,
  decodeSceneDetail,
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

  public async userState(): Promise<EffectUserState> {
    const result = await this.call("user_state/get");
    return decodeEffectUserState(resultField(result, "user_state"));
  }

  public async updateUserState(
    selectedConfigEntryId: string | undefined,
    navigation: EffectUserState["navigation"],
  ): Promise<EffectUserState> {
    const result = await this.call("user_state/update", {
      ...(selectedConfigEntryId
        ? { selected_config_entry_id: selectedConfigEntryId }
        : {}),
      navigation,
    });
    return decodeEffectUserState(resultField(result, "user_state"));
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
  ): Promise<LibraryItem> {
    const result = await this.call("library/create", {
      name,
      content: effectContentToWire(content),
    });
    return decodeLibraryItem(resultField(result, "item"));
  }

  public async updateItem(
    item: LibraryItem,
    name: string,
    content: EffectContent,
  ): Promise<LibraryItem> {
    const result = await this.call("library/update", {
      item_id: item.id,
      name,
      content: effectContentToWire(content),
      expected_version: item.version,
      expected_updated_at: item.updated_at,
    });
    return decodeLibraryItem(resultField(result, "item"));
  }

  public async deleteItem(item: Pick<LibraryItem, "id" | "version" | "updated_at">): Promise<void> {
    await this.call("library/delete", {
      item_id: item.id,
      expected_version: item.version,
      expected_updated_at: item.updated_at,
    });
  }

  public async applySavedEffect(
    configEntryId: string,
    itemId: string,
  ): Promise<void> {
    await this.call("apply", {
      config_entry_id: configEntryId,
      item_id: itemId,
      updated_at: new Date().toISOString(),
    });
  }

  public async openPreviewSession(): Promise<string> {
    const result = await this.call("preview/session/open");
    const sessionId = resultField(result, "session_id");
    if (typeof sessionId !== "string" || sessionId.length < 1 || sessionId.length > 255) {
      throw new Error("Malformed Effect Studio server payload: preview session ID is invalid.");
    }
    return sessionId;
  }

  public async closePreviewSession(sessionId: string): Promise<void> {
    await this.call("preview/session/close", {
      session_id: sessionId,
    });
  }

  public async previewSnapshot(
    sessionId: string,
    sequence: number,
    configEntryId: string,
    name: string,
    content: EffectContent,
    force = false,
    committed = false,
  ): Promise<void> {
    await this.call("preview/apply_snapshot", {
      session_id: sessionId,
      sequence,
      config_entry_id: configEntryId,
      name,
      content: effectContentToWire(content),
      updated_at: new Date().toISOString(),
      force,
      committed,
    });
  }

  public async previewScene(
    sessionId: string,
    sequence: number,
    configEntryId: string,
    scene: SceneSummary,
    speedIndex: number | null,
    force = false,
    committed = false,
  ): Promise<void> {
    await this.call("preview/apply_scene", {
      session_id: sessionId,
      sequence,
      config_entry_id: configEntryId,
      scene_id: scene.scene_id,
      effect_id: scene.effect_id,
      ...(speedIndex === null ? {} : { speed_index: speedIndex }),
      updated_at: new Date().toISOString(),
      force,
      committed,
    });
  }

  public async cancelPreview(
    sessionId: string,
    configEntryId?: string,
  ): Promise<void> {
    await this.call("preview/cancel", {
      session_id: sessionId,
      ...(configEntryId ? { config_entry_id: configEntryId } : {}),
    });
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

  public resetScene(
    configEntryId: string,
    scene: SceneSummary,
  ): Promise<SceneDetail> {
    return this.call("scene/reset", {
      config_entry_id: configEntryId,
      scene_id: scene.scene_id,
      effect_id: scene.effect_id,
    }).then(decodeSceneDetail);
  }

  public setSceneDefault(
    configEntryId: string,
    scene: SceneSummary,
    speedIndex: number | null,
  ): Promise<SceneDetail> {
    return this.call("scene/default/set", {
      config_entry_id: configEntryId,
      scene_id: scene.scene_id,
      effect_id: scene.effect_id,
      ...(speedIndex === null ? {} : { speed_index: speedIndex }),
      updated_at: new Date().toISOString(),
    }).then(decodeSceneDetail);
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

  public subscribePreview(
    sessionId: string,
    callback: (status: PreviewStatus) => void,
    onError?: (error: Error) => void,
  ): Promise<() => void> {
    return this.hass.connection.subscribeMessage(
      (status) => {
        try {
          callback(decodePreviewStatus(status));
        } catch (error) {
          onError?.(asError(error));
        }
      },
      {
        type: `${PREFIX}/preview/subscribe`,
        session_id: sessionId,
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


function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Malformed Effect Studio server payload.");
}
