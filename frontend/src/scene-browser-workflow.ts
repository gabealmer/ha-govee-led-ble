import { cloneLayeredSceneContent } from "./advanced-effect-model";
import type { EffectStudioApi } from "./api";
import { AsyncRequestController, type AsyncRequestToken } from "./async-request-controller";
import { libraryItemSyncResult } from "./effect-editor-model";
import {
  buildScenePreviewRequest,
  cloneSceneContent,
  compatibleCustomScenes,
  findCatalogueScene,
  findNativeScene,
  hasCurrentSceneContent,
  initialSceneBrowserState,
  isSceneContent,
  normaliseSceneName,
  sceneContentAtSpeed,
  sceneIsDirty,
  sceneKey,
  type CategorySelection,
  type SceneBrowserViewState,
  type SceneContent,
  type SceneInitialSelection,
  type ScenePreviewRequest,
} from "./scene-browser-model";
import type {
  DeviceCapabilities,
  LayeredSceneContent,
  LibraryItem,
  LibrarySnapshot,
  LibrarySummary,
  SceneDetail,
  SceneSummary,
} from "./types";
import { errorCode, errorMessage } from "./ui-utils";

type SceneRequestState = {
  api: EffectStudioApi;
  deviceId: string;
  category: CategorySelection;
  selectionIdentity?: string;
};
type SceneRequestContext = AsyncRequestToken<SceneRequestState>;

type SceneDefaultAction =
  | { kind: "set"; speedIndex: number | null }
  | { kind: "reset"; speedIndex: number | null };

type SceneDefaultSnapshot = {
  scene: SceneSummary;
  content: SceneContent;
  speedIndex: number | null;
  hasDefault: boolean;
};

type SceneDefaultWrite = {
  action: SceneDefaultAction;
  api: EffectStudioApi;
  deviceId: string;
  scene: SceneSummary;
  selectionIdentity: string;
  selectionRevision: number;
  speedRevision: number;
};

type SerialWrite<T> = {
  generation: number;
  payload: T;
  resolve: () => void;
};

class SerialLatestWriter<T> {
  private generation = 0;
  private active = false;
  private pending?: SerialWrite<T>;

  public constructor(
    private readonly execute: (write: Readonly<SerialWrite<T>>) => Promise<void>,
  ) {}

  public get currentGeneration(): number {
    return this.generation;
  }

  public get busy(): boolean {
    return this.active || this.pending !== undefined;
  }

  public enqueue(payload: T): Promise<void> {
    this.generation += 1;
    this.pending?.resolve();
    return new Promise((resolve) => {
      this.pending = { generation: this.generation, payload, resolve };
      void this.drain();
    });
  }

  public invalidate(): void {
    this.generation += 1;
    this.pending?.resolve();
    this.pending = undefined;
  }

  public isLatest(generation: number): boolean {
    return generation === this.generation;
  }

  private async drain(): Promise<void> {
    if (this.active) {
      return;
    }
    this.active = true;
    try {
      while (this.pending) {
        const write = this.pending;
        this.pending = undefined;
        try {
          await this.execute(write);
        } finally {
          write.resolve();
        }
      }
    } finally {
      this.active = false;
    }
  }
}

export interface SceneEditSelection {
  content: LayeredSceneContent;
  config_entry_id: string;
  item?: LibraryItem;
  name: string;
}

export interface SceneBrowserWorkflowEffects {
  changed: (state: SceneBrowserViewState) => void;
  initialSelectionFinished: (opened: boolean) => void;
  libraryItemSaved: (item: LibraryItem) => void;
}

export class SceneBrowserWorkflow {
  private stateValue = initialSceneBrowserState();
  private api?: EffectStudioApi;
  private device?: DeviceCapabilities;
  private library: LibrarySnapshot = { items: [] };
  private initialSelection?: SceneInitialSelection;
  private activeSelectionIdentity?: string;
  private openedInitialSelection?: string;
  private defaultSelectionRevision = 0;
  private speedRevision = 0;
  private defaultRefreshGeneration = 0;
  private defaultBaseline?: SceneDefaultSnapshot;
  private readonly defaultWriter = new SerialLatestWriter<SceneDefaultWrite>((write) =>
    this.performDefaultWrite(write),
  );
  private readonly requests = new AsyncRequestController<SceneRequestState>(
    (left, right) =>
      left.api === right.api &&
      left.deviceId === right.deviceId &&
      left.category === right.category &&
      left.selectionIdentity === right.selectionIdentity,
  );

  public constructor(private readonly effects: SceneBrowserWorkflowEffects) {}

  public get state(): SceneBrowserViewState {
    return this.stateValue;
  }

  public get compatibleCustomScenes(): LibrarySummary[] {
    return compatibleCustomScenes(this.library.items, this.stateValue.catalogue);
  }

  public get sceneDirty(): boolean {
    return sceneIsDirty(this.stateValue);
  }

  public get sceneDefaultDirty(): boolean {
    const { content, editingCopy, selectedItem, selectedScene, speedIndex } =
      this.stateValue;
    return Boolean(
      selectedScene?.speed &&
        content &&
        selectedItem === undefined &&
        !editingCopy &&
        speedIndex !== content.speed_index,
    );
  }

  public hasCurrentSceneContent(): boolean {
    return hasCurrentSceneContent(this.stateValue, this.activeSelectionIdentity);
  }

  public previewRequest(isAdmin: boolean): ScenePreviewRequest | undefined {
    return buildScenePreviewRequest(
      this.stateValue,
      this.activeSelectionIdentity,
      Boolean(this.device),
      isAdmin,
    );
  }

  public configure(api: EffectStudioApi | undefined, device: DeviceCapabilities | undefined): void {
    this.api = api;
    this.device = device;
    this.invalidateRequests();
    this.openedInitialSelection = undefined;
    this.patch({
      catalogue: undefined,
      category: "all",
      selectedScene: undefined,
      selectedItem: undefined,
      content: undefined,
      hasDefault: false,
      editingCopy: false,
      notice: undefined,
      error: undefined,
      loading: Boolean(api && device),
    });
  }

  public setInitialSelection(selection: SceneInitialSelection | undefined): void {
    this.initialSelection = selection;
    this.openedInitialSelection = undefined;
  }

  public setLibrary(library: LibrarySnapshot): void {
    this.library = library;
    const selectedItem = this.stateValue.selectedItem;
    if (!selectedItem) {
      return;
    }
    const sync = libraryItemSyncResult(selectedItem, library.items, this.sceneDirty);
    if (sync.action === "removed") {
      this.invalidateRequests();
      this.patch({
        selectedScene: undefined,
        selectedItem: undefined,
        content: undefined,
        hasDefault: false,
        editingCopy: false,
        notice: undefined,
      });
    } else if (sync.action === "conflict") {
      this.patch({ notice: "This custom scene changed elsewhere. Reload it before saving." });
    } else if (sync.action === "reload") {
      void this.selectCustom(sync.summary);
    }
  }

  public synchroniseSavedSelection(item: LibraryItem): void {
    const { catalogue, selectedItem } = this.stateValue;
    if (
      selectedItem?.id !== item.id ||
      !catalogue ||
      !isSceneContent(item.content) ||
      item.content.template.sku !== catalogue.sku
    ) {
      return;
    }
    const scene = findCatalogueScene(catalogue, item.content);
    if (!scene) {
      return;
    }
    this.requests.invalidate();
    this.activeSelectionIdentity = `custom:${item.id}`;
    this.commitCustomSelection(item, scene, item.content);
    this.patch({ notice: undefined });
  }

  public setCategory(category: CategorySelection): void {
    this.invalidateRequests();
    this.patch({
      category,
      selectedScene: undefined,
      selectedItem: undefined,
      content: undefined,
      hasDefault: false,
      editingCopy: false,
      notice: undefined,
    });
  }

  public setName(name: string): void {
    this.patch({ name });
  }

  public setSpeedIndex(speedIndex: number): void {
    this.speedRevision += 1;
    this.patch({ speedIndex });
  }

  public async loadCatalogue(): Promise<void> {
    if (!this.api || !this.device) {
      return;
    }
    const request = this.beginRequest();
    this.patch({
      loading: true,
      error: undefined,
      notice: undefined,
      selectedScene: undefined,
      selectedItem: undefined,
      content: undefined,
      hasDefault: false,
    });
    try {
      const catalogue = await request.api.sceneCatalogue(request.deviceId);
      if (!this.requestIsCurrent(request)) {
        return;
      }
      this.patch({ catalogue, category: "all", loading: false });
      await this.openInitialSelection();
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.patch({ error: errorMessage(error) });
      }
    } finally {
      if (this.requestIsCurrent(request)) {
        this.patch({ loading: false });
      }
    }
  }

  public async selectBuiltin(scene: SceneSummary): Promise<boolean> {
    if (!this.api || !this.device) {
      return false;
    }
    const identity = sceneKey(scene);
    const request = this.beginRequest(identity);
    this.patch({
      notice: undefined,
      selectedScene: scene,
      selectedItem: undefined,
      editingCopy: false,
      content: undefined,
      name: scene.display_name,
      speedIndex: scene.speed?.default_index ?? null,
    });
    try {
      const detail = await request.api.sceneDetail(request.deviceId, scene.scene_id, scene.effect_id);
      if (!this.requestIsCurrent(request) || sceneKey(detail.scene) !== identity) {
        return false;
      }
      this.defaultBaseline = this.snapshotFromDetail(detail);
      this.patch({
        selectedScene: detail.scene,
        content: detail.content,
        hasDefault: detail.has_default,
        name: detail.scene.display_name,
        speedIndex: detail.content.speed_index,
      });
      return true;
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.patch({ notice: errorMessage(error) });
      }
      return false;
    }
  }

  public async selectCustom(summary: LibrarySummary): Promise<boolean> {
    if (!this.api || !this.device || !this.stateValue.catalogue) {
      return false;
    }
    const catalogue = this.stateValue.catalogue;
    const request = this.beginRequest(`custom:${summary.id}`);
    this.patch({
      notice: undefined,
      selectedScene: undefined,
      selectedItem: undefined,
      editingCopy: false,
      content: undefined,
      hasDefault: false,
      name: summary.name,
    });
    try {
      const item = await request.api.item(summary.id);
      if (!this.requestIsCurrent(request)) {
        return false;
      }
      if (!isSceneContent(item.content)) {
        throw new Error("This custom scene uses an unsupported definition.");
      }
      const content = item.content;
      if (content.template.sku !== catalogue.sku) {
        throw new Error(`This custom scene targets ${content.template.sku}, not ${catalogue.sku}.`);
      }
      const scene = findCatalogueScene(catalogue, content);
      if (!scene) {
        throw new Error("The source scene is not in this device catalogue.");
      }
      const detail = await request.api.sceneDetail(
        request.deviceId,
        content.template.scene_id,
        content.template.effect_id,
      );
      if (!this.requestIsCurrent(request) || sceneKey(detail.scene) !== sceneKey(scene)) {
        return false;
      }
      this.commitCustomSelection(item, scene, content);
      return true;
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.patch({ notice: errorMessage(error) });
      }
      return false;
    }
  }

  public async openInitialSelection(): Promise<void> {
    const selection = this.initialSelection;
    const catalogue = this.stateValue.catalogue;
    if (!selection || !catalogue) {
      return;
    }
    const key =
      selection.kind === "saved"
        ? `saved:${selection.itemId}`
        : `native:${normaliseSceneName(selection.effect)}`;
    if (this.openedInitialSelection === key) {
      return;
    }
    this.openedInitialSelection = key;
    const opened =
      selection.kind === "saved"
        ? await this.openInitialSavedScene(selection.itemId)
        : await this.openInitialNativeScene(selection.effect);
    if (this.initialSelection === selection) {
      this.effects.initialSelectionFinished(opened);
    }
  }

  public async save(isAdmin: boolean): Promise<void> {
    const { catalogue, content, selectedItem, selectedScene } = this.stateValue;
    if (
      !this.api ||
      !this.device ||
      !catalogue ||
      !selectedScene ||
      !content ||
      !this.hasCurrentSceneContent() ||
      (content.kind !== "scene_builtin" && content.kind !== "scene_palette") ||
      !isAdmin ||
      this.stateValue.saving
    ) {
      return;
    }
    const name = this.stateValue.name.trim();
    if (!name) {
      this.patch({ notice: "Give this custom scene a name before saving." });
      return;
    }
    const savedContent = sceneContentAtSpeed(content, this.stateValue.speedIndex);
    const request = this.captureRequest();
    this.patch({ saving: true, notice: undefined });
    try {
      const result = selectedItem
        ? await request.api.updateItem(selectedItem, name, savedContent)
        : await request.api.createItem(name, savedContent);
      if (result.content.kind !== "scene_builtin" && result.content.kind !== "scene_palette") {
        throw new Error("The saved scene returned an unsupported definition.");
      }
      this.effects.libraryItemSaved(result);
      if (!this.requestIsCurrent(request)) {
        return;
      }
      this.activeSelectionIdentity = `custom:${result.id}`;
      this.requests.invalidate();
      this.patch({
        selectedItem: result,
        editingCopy: false,
        content: result.content,
        name: result.name,
        category: "custom",
        notice: undefined,
      });
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.patch({
          notice:
            errorCode(error) === "conflict"
              ? "The library changed elsewhere. Reload the scene before saving."
              : `Save failed: ${errorMessage(error)}`,
        });
      }
    } finally {
      this.patch({ saving: false });
    }
  }

  public async resetToCatalogue(isAdmin: boolean): Promise<void> {
    const { content, selectedItem, selectedScene } = this.stateValue;
    if (
      !this.api ||
      !this.device ||
      !selectedScene ||
      !content ||
      selectedItem !== undefined ||
      this.stateValue.editingCopy ||
      !this.stateValue.hasDefault ||
      !isAdmin ||
      !this.hasCurrentSceneContent()
    ) {
      return;
    }
    const speedIndex = selectedScene.speed?.default_index ?? null;
    this.speedRevision += 1;
    this.defaultRefreshGeneration += 1;
    this.patch({
      content: sceneContentAtSpeed(content, speedIndex),
      speedIndex,
      hasDefault: false,
      notice: undefined,
    });
    await this.defaultWriter.enqueue(
      this.defaultWrite({
        kind: "reset",
        speedIndex,
      }),
    );
  }

  public async setCurrentDefault(isAdmin: boolean): Promise<void> {
    const { content, selectedItem, selectedScene, speedIndex } = this.stateValue;
    if (
      !this.api ||
      !this.device ||
      !selectedScene ||
      !content ||
      selectedItem !== undefined ||
      this.stateValue.editingCopy ||
      !this.sceneDefaultDirty ||
      !isAdmin ||
      !this.hasCurrentSceneContent()
    ) {
      return;
    }
    this.defaultRefreshGeneration += 1;
    this.patch({
      content: sceneContentAtSpeed(content, speedIndex),
      hasDefault: true,
      notice: undefined,
    });
    await this.defaultWriter.enqueue(
      this.defaultWrite({
        kind: "set",
        speedIndex,
      }),
    );
  }

  public async refreshSelectedDefault(): Promise<void> {
    const selected = this.stateValue.selectedScene;
    if (!this.api || !this.device || !selected || this.defaultWriter.busy) {
      return;
    }
    const request = this.captureRequest();
    const selectionRevision = this.defaultSelectionRevision;
    const writerGeneration = this.defaultWriter.currentGeneration;
    const refreshGeneration = ++this.defaultRefreshGeneration;
    try {
      const detail = await request.api.sceneDetail(
        request.deviceId,
        selected.scene_id,
        selected.effect_id,
      );
      if (
        this.requestIsCurrent(request) &&
        selectionRevision === this.defaultSelectionRevision &&
        writerGeneration === this.defaultWriter.currentGeneration &&
        refreshGeneration === this.defaultRefreshGeneration &&
        !this.defaultWriter.busy &&
        this.stateValue.selectedScene &&
        sceneKey(this.stateValue.selectedScene) === sceneKey(selected) &&
        sceneKey(detail.scene) === sceneKey(selected)
      ) {
        this.defaultBaseline = this.snapshotFromDetail(detail);
        this.patch({ hasDefault: detail.has_default });
      }
    } catch (error) {
      if (
        this.requestIsCurrent(request) &&
        selectionRevision === this.defaultSelectionRevision &&
        writerGeneration === this.defaultWriter.currentGeneration &&
        refreshGeneration === this.defaultRefreshGeneration &&
        !this.defaultWriter.busy
      ) {
        this.patch({ notice: `Could not refresh the scene default: ${errorMessage(error)}` });
      }
    }
  }

  public edit(isAdmin: boolean): SceneEditSelection | undefined {
    const { content, selectedItem, selectedScene } = this.stateValue;
    if (!isAdmin || !selectedScene || !this.hasCurrentSceneContent()) {
      return undefined;
    }
    if (!selectedItem) {
      this.invalidateDefaultWrites();
    }
    if (selectedScene.scene_type === 2 && content?.kind === "scene_layered") {
      return {
        content: cloneLayeredSceneContent({ ...content, speed_index: this.stateValue.speedIndex }),
        config_entry_id: this.device!.config_entry_id,
        ...(selectedItem ? { item: selectedItem } : {}),
        name: selectedItem?.name ?? `${selectedScene.display_name} copy`,
      };
    }
    this.patch({
      editingCopy: true,
      name: `${selectedScene.display_name} copy`,
      notice: undefined,
    });
    return undefined;
  }

  public async cancelCopy(): Promise<boolean> {
    const scene = this.stateValue.selectedScene;
    return this.stateValue.editingCopy && scene ? this.selectBuiltin(scene) : false;
  }

  private defaultWrite(action: SceneDefaultAction): SceneDefaultWrite {
    const scene = this.stateValue.selectedScene!;
    return {
      action,
      api: this.api!,
      deviceId: this.device!.config_entry_id,
      scene,
      selectionIdentity: sceneKey(scene),
      selectionRevision: this.defaultSelectionRevision,
      speedRevision: this.speedRevision,
    };
  }

  private async performDefaultWrite(write: Readonly<SerialWrite<SceneDefaultWrite>>): Promise<void> {
    const operation = write.payload;
    const rollback = this.defaultSnapshotFor(operation);
    try {
      const detail =
        operation.action.kind === "reset"
          ? await operation.api.resetScene(operation.deviceId, operation.scene)
          : await operation.api.setSceneDefault(
              operation.deviceId,
              operation.scene,
              operation.action.speedIndex,
            );
      if (sceneKey(detail.scene) !== operation.selectionIdentity) {
        throw new Error("The scene default response did not match the selected scene.");
      }
      if (!this.defaultWriteBelongsToCurrentSelection(operation)) {
        return;
      }
      this.defaultBaseline = this.snapshotFromDetail(detail);
      if (!this.defaultWriter.isLatest(write.generation)) {
        return;
      }
      const speedIndex =
        this.speedRevision === operation.speedRevision
          ? detail.content.speed_index
          : this.stateValue.speedIndex;
      this.patch({
        selectedScene: detail.scene,
        content: cloneSceneContent(detail.content),
        speedIndex,
        hasDefault: detail.has_default,
        notice: undefined,
      });
    } catch (error) {
      if (
        !this.defaultWriter.isLatest(write.generation) ||
        !this.defaultWriteBelongsToCurrentSelection(operation)
      ) {
        return;
      }
      const rollbackValues: Partial<SceneBrowserViewState> = rollback
        ? {
            content: cloneSceneContent(rollback.content),
            hasDefault: rollback.hasDefault,
            ...(operation.action.kind === "reset" &&
            this.speedRevision === operation.speedRevision
              ? { speedIndex: rollback.speedIndex }
              : {}),
          }
        : {};
      this.patch({
        ...rollbackValues,
        notice: `${operation.action.kind === "reset" ? "Reset" : "Set as Default"} failed: ${errorMessage(error)}`,
      });
    }
  }

  private defaultSnapshotFor(operation: SceneDefaultWrite): SceneDefaultSnapshot | undefined {
    const baseline = this.defaultBaseline;
    return baseline &&
      operation.selectionRevision === this.defaultSelectionRevision &&
      sceneKey(baseline.scene) === operation.selectionIdentity
      ? {
          ...baseline,
          scene: { ...baseline.scene },
          content: cloneSceneContent(baseline.content),
        }
      : undefined;
  }

  private snapshotFromDetail(detail: SceneDetail): SceneDefaultSnapshot {
    return {
      scene: { ...detail.scene },
      content: cloneSceneContent(detail.content),
      speedIndex: detail.content.speed_index,
      hasDefault: detail.has_default,
    };
  }

  private defaultWriteBelongsToCurrentSelection(operation: SceneDefaultWrite): boolean {
    return Boolean(
      operation.selectionRevision === this.defaultSelectionRevision &&
        this.activeSelectionIdentity === operation.selectionIdentity &&
        this.stateValue.selectedItem === undefined &&
        !this.stateValue.editingCopy &&
        this.stateValue.selectedScene &&
        sceneKey(this.stateValue.selectedScene) === operation.selectionIdentity,
    );
  }

  private invalidateDefaultWrites(): void {
    this.defaultSelectionRevision += 1;
    this.speedRevision = 0;
    this.defaultRefreshGeneration += 1;
    this.defaultBaseline = undefined;
    this.defaultWriter.invalidate();
  }

  private async openInitialSavedScene(itemId: string): Promise<boolean> {
    const summary = this.compatibleCustomScenes.find((item) => item.id === itemId);
    return summary ? this.selectCustom(summary) : false;
  }

  private async openInitialNativeScene(effect: string): Promise<boolean> {
    const catalogue = this.stateValue.catalogue;
    const scene = catalogue ? findNativeScene(catalogue, effect) : undefined;
    return scene ? this.selectBuiltin(scene) : false;
  }

  private commitCustomSelection(item: LibraryItem, scene: SceneSummary, content: SceneContent): void {
    const selectedContent = cloneSceneContent(content);
    this.patch({
      selectedScene: scene,
      selectedItem: item,
      editingCopy: false,
      content: selectedContent,
      hasDefault: false,
      name: item.name,
      speedIndex: selectedContent.speed_index ?? scene.speed?.default_index ?? null,
    });
  }

  private beginRequest(selectionIdentity?: string): SceneRequestContext {
    this.invalidateDefaultWrites();
    this.activeSelectionIdentity = selectionIdentity;
    return this.requests.begin(this.requestState());
  }

  private captureRequest(): SceneRequestContext {
    return this.requests.capture(this.requestState());
  }

  private invalidateRequests(): void {
    this.invalidateDefaultWrites();
    this.requests.invalidate();
    this.activeSelectionIdentity = undefined;
  }

  private requestIsCurrent(request: SceneRequestContext): boolean {
    return Boolean(this.api && this.device && this.requests.isCurrent(request, this.requestState()));
  }

  private requestState(): SceneRequestState {
    return {
      api: this.api!,
      deviceId: this.device!.config_entry_id,
      category: this.stateValue.category,
      selectionIdentity: this.activeSelectionIdentity,
    };
  }

  private patch(values: Partial<SceneBrowserViewState>): void {
    this.stateValue = { ...this.stateValue, ...values };
    this.effects.changed(this.stateValue);
  }
}
