import { EffectStudioApi } from "./api";
import { AsyncRequestController, type AsyncRequestToken } from "./async-request-controller";
import {
  cloneEditableEffect, customEffectCategoryForKind, isEditableEffectContent,
  libraryItemSyncResult, sameLibraryItemVersion, serialiseEditable, upsertSummary, type CustomEffectCategory,
  type EditableEffectContent,
} from "./effect-editor-model";
import type { LivePreviewInteraction } from "./live-preview-controller";
import { PanelEditorController } from "./panel-editor-controller";
import { PanelModalController } from "./panel-modal-controller";
import { PanelModel } from "./panel-model";
import { PanelPreviewController } from "./panel-preview-controller";
import {
  activeStudioContext,
  editorDevicePath,
  initialDeviceId,
  rememberedStudioSection,
  type StudioSection,
} from "./studio-navigation";
import type {
  DeviceCapabilities,
  EffectUserState,
  HomeAssistant,
  LibraryItem,
  LibrarySnapshot,
} from "./types";
import { errorCode, errorMessage } from "./ui-utils";
import { isCompatibleEditorInfo } from "./validation";

type LoadRequest = AsyncRequestToken<{ api: EffectStudioApi }>;
interface AutoSaveTarget {
  epoch: number;
  item: LibraryItem;
  name: string;
  content: EditableEffectContent;
}

interface PanelControllerOptions {
  connected(): boolean;
  pathname(): string;
  replacePath(path: string): void;
}

export class PanelController {
  public api?: EffectStudioApi;

  private unsubscribeLibrary?: () => void;
  private autoSavePending?: AutoSaveTarget;
  private autoSaveRunning = false;
  private deviceRefresh?: {
    api: EffectStudioApi;
    configEntryId: string;
    promise: Promise<DeviceCapabilities>;
  };
  private readonly latestSavedItems = new Map<string, LibraryItem>();
  private readonly loadRequests = new AsyncRequestController<{ api: EffectStudioApi }>(
    (left, right) => left.api === right.api,
  );

  public constructor(
    private readonly model: PanelModel,
    private readonly editor: PanelEditorController,
    private readonly preview: PanelPreviewController,
    private readonly modal: PanelModalController,
    private readonly options: PanelControllerOptions,
  ) {}

  public async load(hass: HomeAssistant, isAdmin: boolean): Promise<void> {
    this.model.patch({
      loading: true,
      error: undefined,
      previewStatus: undefined,
      previewNotice: undefined,
      isAdmin,
    });
    const api = new EffectStudioApi(hass);
    this.api = api;
    const request = this.loadRequests.begin({ api });
    try {
      const [info, devices, library, customCatalogue, userState] = await Promise.all([
        api.info(), api.devices(), api.library(), api.customCatalogue(), api.userState(),
      ]);
      if (!this.loadIsCurrent(request)) return;
      if (!isCompatibleEditorInfo(info)) {
        throw new Error("This editor bundle is not compatible with the installed backend.");
      }
      this.model.patch({
        devices,
        library,
        customCatalogue,
        userState,
        autoSaveEnabled: restoredAutoSave(userState.navigation.auto_save),
      });
      await this.initialiseSelectedDevice();
      if (!this.model.customEffectsAvailable) this.model.patch({ section: "scenes" });
      const unsubscribeLibrary = await api.subscribeLibrary(
        (snapshot) => void this.libraryChanged(snapshot),
        (error) => this.subscriptionFailed(error, request),
      );
      if (!this.loadIsCurrent(request) || this.model.error) {
        unsubscribeLibrary();
        return;
      }
      this.unsubscribeLibrary = unsubscribeLibrary;
      if (isAdmin) {
        const opened = await this.preview.open(api, (error) => this.subscriptionFailed(error, request));
        if (!opened || !this.loadIsCurrent(request) || this.model.error) {
          this.preview.dispose();
          return;
        }
      }
      await this.openInitialContext();
    } catch (error) {
      if (this.loadIsCurrent(request)) {
        this.stopSubscriptions();
        this.model.patch({ error: errorMessage(error) });
      }
    } finally {
      if (this.loadIsCurrent(request)) this.model.patch({ loading: false });
    }
  }

  public disconnect(): void {
    this.cancelPendingAutoSave();
    this.loadRequests.invalidate();
    this.stopSubscriptions();
    this.api = undefined;
  }

  public async deviceChanged(selectedDeviceId: string): Promise<void> {
    if (
      !selectedDeviceId || selectedDeviceId === this.model.selectedDeviceId ||
      !this.model.devices.some((device) => device.config_entry_id === selectedDeviceId)
    ) return;
    await this.preview.cancel();
    this.model.patch({
      selectedDeviceId,
      previewStatus: undefined,
      previewNotice: undefined,
      notice: undefined,
    });
    this.options.replacePath(editorDevicePath(selectedDeviceId));
    try {
      const userState = await this.api?.updateUserState(
        selectedDeviceId,
        this.navigationPreferences,
      );
      if (userState) this.model.patch({ userState });
    } catch (error) {
      console.warn("Could not remember the selected light", error);
    }
    await this.openInitialContext();
  }

  public async selectSection(
    section: StudioSection,
    customEffectCategory?: CustomEffectCategory,
  ): Promise<void> {
    if (
      (section === "scenes" && !this.model.scenesAvailable) ||
      (section === "custom" &&
        (!this.model.customEffectsAvailable ||
          (customEffectCategory !== undefined &&
            !this.model.customEffectCategoryAvailable(customEffectCategory)))) ||
      (section === "video" && !this.model.videoAvailable)
    ) return;
    const nextCategory =
      section === "custom" && customEffectCategory !== undefined
        ? customEffectCategory
        : this.model.customEffectCategory;
    const navigationChanged =
      section !== this.model.section ||
      (section === "custom" &&
        nextCategory !== this.model.customEffectCategory);
    const selectionOwned =
      this.model.editorOwnedByActiveView &&
      section === this.model.section &&
      (section !== "custom" ||
        nextCategory === this.model.customEffectCategory);
    if (!navigationChanged && selectionOwned) {
      if (section === "scenes" && this.model.sceneEditorOpen) {
        this.editor.cancelSceneEdit();
      }
      return;
    }
    const transitionEpoch = this.editor.beginTransition();
    this.model.patch({
      sceneEditorOpen: false,
      sceneInitialSelection: undefined,
      section,
      customEffectCategory: nextCategory,
      notice: undefined,
    });
    this.editor.clearSelection(transitionEpoch);
    this.remember();
    await this.restoreActiveSelection(transitionEpoch);
  }

  public async openInitialContext(): Promise<void> {
    this.openRootCreateView();
    await this.restoreActiveSelection(this.model.editorTransitionEpoch);
  }

  private async restoreActiveSelection(
    transitionEpoch: number,
  ): Promise<void> {
    const device = await this.refreshSelectedDevice(transitionEpoch);
    if (
      !device ||
      transitionEpoch !== this.model.editorTransitionEpoch
    ) {
      return;
    }
    const context = activeStudioContext(
      device,
      this.model.library.items,
      (candidate) =>
        candidate.kind === "scene_builtin" || candidate.kind === "scene_palette" || candidate.kind === "scene_layered"
          ? candidate.template?.sku === this.model.selectedModel
          : this.model.libraryItemAvailable(candidate),
      this.model.modelCatalogue,
    );
    if (context.kind === "native-scene") {
      if (this.model.section === "scenes") {
        this.model.patch({ sceneInitialSelection: { kind: "native", effect: context.effect } });
      }
      return;
    }
    if (context.kind === "native-profile") {
      if (
        context.section !== this.model.section ||
        (context.section === "custom" &&
          context.category !== this.model.customEffectCategory)
      ) {
        return;
      }
      if (context.section === "video") {
        this.editor.openVideoTemplate(
          context.mode,
          context.label,
          false,
          transitionEpoch,
        );
      } else {
        this.editor.openMusicTemplate(
          context.mode,
          context.label,
          false,
          transitionEpoch,
        );
      }
      return;
    }
    if (context.kind === "root") {
      return;
    }
    const item = context.item;
    if (item.kind === "scene_builtin" || item.kind === "scene_palette" || item.kind === "scene_layered") {
      if (this.model.section === "scenes") {
        this.model.patch({ sceneInitialSelection: { kind: "saved", itemId: item.id } });
      }
      return;
    }
    if (
      (item.kind === "video_profile" && this.model.section !== "video") ||
      (item.kind !== "video_profile" &&
        (this.model.section !== "custom" ||
          this.categoryForKind(item.kind) !==
            this.model.customEffectCategory))
    ) {
      return;
    }
    if (!(await this.selectItem(item.id, transitionEpoch, false))) {
      this.editor.clearSelection(transitionEpoch);
    }
  }

  public sceneInitialSelectionOpened(): void {
    this.model.patch({ section: "scenes", sceneInitialSelection: undefined });
  }

  public sceneInitialSelectionFailed(): void {
    this.model.patch({ sceneInitialSelection: undefined });
    this.openRootCreateView();
  }

  public remember(): void {
    void this.rememberNavigation();
  }

  public toggleAutoSave(): void {
    const autoSaveEnabled = !this.model.autoSaveEnabled;
    this.model.patch({
      autoSaveEnabled,
      autoSaveFailed: false,
    });
    if (autoSaveEnabled) {
      this.contentCommitted("committed");
    } else {
      this.cancelPendingAutoSave();
    }
    this.remember();
  }

  public contentCommitted(interaction: LivePreviewInteraction): void {
    if (
      interaction !== "committed" ||
      !this.model.isAdmin ||
      !this.model.autoSaveEnabled ||
      this.model.sceneEditorOpen ||
      !this.model.currentItem ||
      !isEditableEffectContent(this.model.content) ||
      !this.model.dirty
    ) {
      return;
    }
    this.autoSavePending = {
      epoch: this.model.editorTransitionEpoch,
      item: this.model.currentItem,
      name: this.model.name.trim(),
      content: cloneEditableEffect(this.model.content),
    };
    if (!this.autoSaveRunning) {
      void this.drainAutoSave();
    }
  }

  public cancelPendingAutoSave(): void {
    this.autoSavePending = undefined;
  }

  public async libraryChanged(snapshot: LibrarySnapshot): Promise<void> {
    this.model.patch({ library: snapshot });
    if (
      this.model.saving &&
      this.model.currentItem &&
      snapshot.items.some(
        (item) =>
          item.id === this.model.currentItem!.id &&
          item.version > this.model.currentItem!.version,
      )
    ) {
      return;
    }
    const sync = libraryItemSyncResult(this.model.currentItem, snapshot.items, this.model.dirty, this.model.deletingItemId);
    if (sync.action === "none") return;
    if (sync.action === "removed") {
      this.model.patch({ notice: undefined });
      return;
    }
    if (sync.action === "conflict") {
      this.model.patch({ notice: "This effect changed elsewhere. Reload it before saving." });
      return;
    }
    const transitionEpoch = this.editor.beginTransition();
    const selected = await this.selectItem(
      sync.summary.id,
      transitionEpoch,
      false,
    );
    if (selected && transitionEpoch === this.model.editorTransitionEpoch) {
      this.model.patch({ notice: undefined });
    }
  }

  public sceneItemSaved(item: LibraryItem): void {
    this.model.patch({ library: { items: upsertSummary(this.model.library.items, item) } });
  }

  public async selectItem(
    itemId: string,
    existingTransitionEpoch?: number,
    applyLive = true,
  ): Promise<boolean> {
    const transitionEpoch =
      existingTransitionEpoch ?? this.editor.beginSelectionTransition();
    if (!this.api) return false;
    try {
      const item = await this.api.item(itemId);
      if (
        transitionEpoch !== this.model.editorTransitionEpoch ||
        !this.editor.applyLibraryItem(item)
      ) {
        return false;
      }
      if (applyLive && this.model.liveApplyEnabled) {
        await this.applySavedIdentity(item, transitionEpoch);
      }
      return transitionEpoch === this.model.editorTransitionEpoch;
    } catch (error) {
      if (transitionEpoch === this.model.editorTransitionEpoch) this.model.patch({ notice: errorMessage(error) });
      return false;
    }
  }

  public async confirmDelete(): Promise<void> {
    const candidate = this.modal.deleteCandidate;
    if (!candidate || !this.api || !this.model.isAdmin || this.model.deletingItemId !== undefined) return;
    this.modal.takeDeleteCandidate();
    this.model.patch({ deletingItemId: candidate.id, notice: undefined });
    try {
      await this.api.deleteItem(candidate);
      this.model.patch({ library: { items: this.model.library.items.filter((item) => item.id !== candidate.id) } });
      if (this.model.currentItem?.id === candidate.id && this.model.currentItem.version === candidate.version) {
        this.editor.clearCurrentAfterDelete();
      }
      this.model.patch({ notice: undefined });
    } catch (error) {
      const conflict = errorCode(error) === "conflict";
      this.model.patch({
        notice: conflict
          ? "This effect or library changed elsewhere. Reload before deleting."
          : `Delete failed: ${errorMessage(error)}`,
      });
      if (conflict) {
        try {
          this.model.patch({ library: await this.api.library() });
        } catch (refreshError) {
          this.model.patch({ notice: `${this.model.notice} Library refresh failed: ${errorMessage(refreshError)}` });
        }
      }
    } finally {
      this.model.patch({ deletingItemId: undefined });
      this.modal.focusActiveSectionIfNeeded();
    }
  }

  public async save(): Promise<void> {
    if (
      !this.api || !this.model.isAdmin || !this.model.canSaveCurrentDraft || this.model.saving ||
      this.model.deletingCurrentItem || !isEditableEffectContent(this.model.content)
    ) return;
    const name = this.model.name.trim();
    if (!name) {
      this.model.patch({ notice: "Give this effect a name before saving." });
      return;
    }

    const transitionEpoch = this.model.editorTransitionEpoch;
    const originatingItem = this.model.currentItem;
    const content = cloneEditableEffect(this.model.content);
    const savingSceneEditor = this.model.sceneEditorOpen;
    this.model.patch({ saving: true, notice: undefined });
    try {
      const result = originatingItem
        ? await this.api.updateItem(originatingItem, name, content)
        : await this.api.createItem(name, content);
      if (!isEditableEffectContent(result.content)) {
        throw new Error("The saved effect returned an unsupported definition.");
      }
      const savedContent = result.content;
      this.model.patch({ library: { items: upsertSummary(this.model.library.items, result) } });
      const originIsCurrent =
        transitionEpoch === this.model.editorTransitionEpoch &&
        sameLibraryItemVersion(this.model.currentItem, originatingItem) &&
        isEditableEffectContent(this.model.content) &&
        serialiseEditable(this.model.name, this.model.content) === serialiseEditable(name, content);
      if (originIsCurrent) {
        this.editor.commitCreation();
        this.model.patch({
          currentItem: result,
          editorSource: {
            kind: "saved",
            owner:
              result.content.kind === "video_profile"
                ? { section: "video" }
                : {
                    section: "custom",
                    category: this.categoryForKind(result.content.kind),
                  },
            itemId: result.id,
          },
          name: result.name, content: cloneEditableEffect(savedContent),
          savedBaseline: serialiseEditable(result.name, savedContent),
          resetBaseline: cloneEditableEffect(savedContent),
          sceneEditorOpen: savingSceneEditor && savedContent.kind === "scene_layered" ? false : this.model.sceneEditorOpen,
          section: savingSceneEditor && savedContent.kind === "scene_layered" ? "custom" : this.model.section,
          customEffectCategory: savingSceneEditor && savedContent.kind === "scene_layered"
            ? this.categoryForKind(result.content.kind)
            : this.model.customEffectCategory,
          savedSceneSelection: originatingItem && savedContent.kind === "scene_layered" ? result : this.model.savedSceneSelection,
          autoSaveFailed: false,
        });
        if (savingSceneEditor && savedContent.kind === "scene_layered") this.remember();
        if (this.model.liveApplyEnabled) {
          await this.applySavedIdentity(result, transitionEpoch);
        }
      }

      const savedResultIsCurrent =
        transitionEpoch === this.model.editorTransitionEpoch &&
        sameLibraryItemVersion(this.model.currentItem, result) &&
        isEditableEffectContent(this.model.content) &&
        serialiseEditable(this.model.name, this.model.content) === serialiseEditable(result.name, savedContent);
      if (savedResultIsCurrent) this.model.patch({ notice: undefined });
    } catch (error) {
      if (errorCode(error) === "conflict") {
        const conflictNotice = "This effect or library changed elsewhere. Reload before saving.";
        if (transitionEpoch === this.model.editorTransitionEpoch) this.model.patch({ notice: conflictNotice });
        try {
          this.model.patch({ library: await this.api.library() });
        } catch (refreshError) {
          if (transitionEpoch === this.model.editorTransitionEpoch) {
            this.model.patch({ notice: `${conflictNotice} Library refresh failed: ${errorMessage(refreshError)}` });
          }
        }
      } else if (transitionEpoch === this.model.editorTransitionEpoch) {
        this.model.patch({ notice: `Save failed: ${errorMessage(error)}` });
      }
    } finally {
      this.model.patch({ saving: false });
    }
  }

  public async saveAs(name: string): Promise<void> {
    if (
      !this.api ||
      !this.model.isAdmin ||
      this.model.saving ||
      this.model.deletingCurrentItem ||
      !isEditableEffectContent(this.model.content)
    ) {
      return;
    }
    const content = cloneEditableEffect(this.model.content);
    const transitionEpoch = this.model.editorTransitionEpoch;
    const sourceItemId = this.model.currentItem?.id;
    this.cancelPendingAutoSave();
    this.model.patch({ saving: true, notice: undefined });
    try {
      const result = await this.api.createItem(name, content);
      this.model.patch({
        library: {
          items: upsertSummary(this.model.library.items, result),
        },
      });
      if (
        transitionEpoch === this.model.editorTransitionEpoch &&
        this.model.currentItem?.id === sourceItemId
      ) {
        this.editor.applyLibraryItem(result);
        this.model.patch({
          ...(result.content.kind === "video_profile"
            ? {}
            : {
                section: "custom" as const,
                customEffectCategory: this.categoryForKind(
                  result.content.kind,
                ),
              }),
          autoSaveFailed: false,
        });
        this.remember();
        if (this.model.liveApplyEnabled) {
          await this.applySavedIdentity(result, transitionEpoch);
        }
      }
    } catch (error) {
      if (transitionEpoch === this.model.editorTransitionEpoch) {
        this.model.patch({
          notice: `Save As failed: ${errorMessage(error)}`,
        });
      }
    } finally {
      this.model.patch({ saving: false });
    }
  }

  public async initialiseSelectedDevice(): Promise<string | undefined> {
    const userState = this.model.userState;
    const selectedDeviceId = initialDeviceId(this.options.pathname(), this.model.devices, userState?.selected_config_entry_id);
    this.model.update((model) => {
      model.selectedDeviceId = selectedDeviceId;
      model.notice = undefined;
    });
    if (!userState || !this.model.selectedDevice || selectedDeviceId === userState.selected_config_entry_id) return undefined;
    try {
      const updated = await this.api?.updateUserState(
        selectedDeviceId,
        {
          ...userState.navigation,
          auto_save: this.model.autoSaveEnabled,
        },
      );
      if (updated) this.model.patch({ userState: updated });
      return undefined;
    } catch (error) {
      console.warn("Could not remember the selected light", error);
      return undefined;
    }
  }

  private openRootCreateView(): void {
    this.editor.reset();
    const navigation = this.model.userState?.navigation ?? {};
    const remembered = navigation.custom_category;
    const customEffectCategory = restoredCustomEffectCategory(
      remembered,
      (category) => this.model.customEffectCategoryAvailable(category),
      this.model.defaultCustomEffectCategory(),
    );
    this.model.patch({
      section: rememberedStudioSection(navigation, {
        scenes: this.model.scenesAvailable,
        custom: this.model.customEffectsAvailable,
        video: this.model.videoAvailable,
      }),
      customEffectCategory,
      autoSaveEnabled: restoredAutoSave(navigation.auto_save),
      notice: undefined,
    });
  }

  private async rememberNavigation(): Promise<void> {
    if (!this.api || !this.model.userState) return;
    try {
      const userState = await this.api.updateUserState(this.model.selectedDeviceId, {
        ...this.navigationPreferences,
      });
      this.model.patch({ userState });
    } catch (error) {
      console.warn("Could not remember Studio navigation", error);
    }
  }

  private async drainAutoSave(): Promise<void> {
    this.autoSaveRunning = true;
    try {
      while (this.autoSavePending) {
        const target = this.autoSavePending;
        this.autoSavePending = undefined;
        await this.persistAutoSave(target);
      }
    } finally {
      this.autoSaveRunning = false;
    }
  }

  private async persistAutoSave(target: AutoSaveTarget): Promise<void> {
    if (!this.api || !target.name) {
      return;
    }
    const base = this.latestSavedItems.get(target.item.id) ?? target.item;
    this.model.patch({
      saving: true,
      autoSaveFailed: false,
      notice: undefined,
    });
    try {
      const result = await this.api.updateItem(
        base,
        target.name,
        target.content,
      );
      if (!isEditableEffectContent(result.content)) {
        throw new Error("The saved effect returned an unsupported definition.");
      }
      const savedContent = result.content;
      this.latestSavedItems.set(result.id, result);
      this.model.patch({
        library: {
          items: upsertSummary(this.model.library.items, result),
        },
      });
      if (
        target.epoch === this.model.editorTransitionEpoch &&
        this.model.currentItem?.id === result.id
      ) {
        const savedBaseline = serialiseEditable(
          result.name,
          savedContent,
        );
        this.model.patch({
          currentItem: result,
          savedBaseline,
          autoSaveFailed: false,
          notice: undefined,
        });
        if (
          this.model.liveApplyEnabled &&
          isEditableEffectContent(this.model.content) &&
          serialiseEditable(this.model.name, this.model.content) ===
            savedBaseline
        ) {
          await this.applySavedIdentity(result, target.epoch);
        }
      }
    } catch (error) {
      if (
        target.epoch === this.model.editorTransitionEpoch &&
        this.model.currentItem?.id === target.item.id
      ) {
        this.model.patch({
          autoSaveFailed: true,
          notice:
            errorCode(error) === "conflict"
              ? "This effect changed elsewhere. Reload it before saving."
              : `Save failed: ${errorMessage(error)}`,
        });
      }
      this.autoSavePending = undefined;
    } finally {
      this.model.patch({ saving: false });
    }
  }

  private get navigationPreferences(): EffectUserState["navigation"] {
    return {
      section: this.model.section,
      custom_category: this.model.customEffectCategory,
      auto_save: this.model.autoSaveEnabled,
    };
  }

  private categoryForKind(kind: string): CustomEffectCategory {
    const category = customEffectCategoryForKind(kind);
    return this.model.customEffectCategoryAvailable(category)
      ? category
      : this.model.defaultCustomEffectCategory();
  }

  private async applySavedIdentity(
    item: LibraryItem,
    transitionEpoch: number,
  ): Promise<void> {
    const configEntryId = this.model.selectedDeviceId;
    if (!this.api || !configEntryId) {
      return;
    }
    try {
      await this.api.applySavedEffect(configEntryId, item.id);
    } catch (error) {
      if (transitionEpoch === this.model.editorTransitionEpoch) {
        this.model.patch({
          notice: `Apply failed: ${errorMessage(error)}`,
        });
      }
    }
  }

  private async refreshSelectedDevice(
    transitionEpoch: number,
  ): Promise<DeviceCapabilities | undefined> {
    const api = this.api;
    const selectedDeviceId = this.model.selectedDeviceId;
    if (!api || !selectedDeviceId) {
      return undefined;
    }
    let refreshed: DeviceCapabilities;
    try {
      refreshed = await this.requestDeviceRefresh(api, selectedDeviceId);
    } catch (error) {
      if (transitionEpoch === this.model.editorTransitionEpoch) {
        this.model.patch({
          notice: `Refresh failed: ${errorMessage(error)}`,
        });
      }
      return undefined;
    }
    if (
      api !== this.api ||
      transitionEpoch !== this.model.editorTransitionEpoch ||
      selectedDeviceId !== this.model.selectedDeviceId
    ) {
      return undefined;
    }
    this.model.patch({
      devices: this.model.devices.map((device) =>
        device.config_entry_id === selectedDeviceId ? refreshed : device,
      ),
    });
    return refreshed;
  }

  private requestDeviceRefresh(
    api: EffectStudioApi,
    configEntryId: string,
  ): Promise<DeviceCapabilities> {
    const current = this.deviceRefresh;
    if (
      current?.api === api &&
      current.configEntryId === configEntryId
    ) {
      return current.promise;
    }
    const promise = api.device(configEntryId).finally(() => {
      if (this.deviceRefresh?.promise === promise) {
        this.deviceRefresh = undefined;
      }
    });
    this.deviceRefresh = { api, configEntryId, promise };
    return promise;
  }

  private loadIsCurrent(request: LoadRequest): boolean {
    return this.options.connected() && this.api !== undefined && this.loadRequests.isCurrent(request, { api: this.api });
  }

  private subscriptionFailed(error: Error, request: LoadRequest): void {
    if (!this.loadIsCurrent(request)) return;
    this.model.patch({ error: error.message, loading: false });
    queueMicrotask(() => {
      if (this.loadIsCurrent(request)) this.stopSubscriptions();
    });
  }

  private stopSubscriptions(): void {
    this.unsubscribeLibrary?.();
    this.unsubscribeLibrary = undefined;
    this.preview.dispose();
  }
}

export function isCustomEffectCategory(value: unknown): value is CustomEffectCategory {
  return value === "all" || value === "music" || value === "single-layer" || value === "multi-layer" ||
    value === "advanced" || value === "my-effects";
}

export function restoredCustomEffectCategory(
  remembered: unknown,
  available: (category: CustomEffectCategory) => boolean,
  fallback: CustomEffectCategory,
): CustomEffectCategory {
  if (remembered === "all") {
    return fallback;
  }
  return isCustomEffectCategory(remembered) && available(remembered)
    ? remembered
    : fallback;
}

export function restoredAutoSave(value: unknown): boolean {
  return value === true;
}
