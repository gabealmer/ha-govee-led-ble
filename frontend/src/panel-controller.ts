import { EffectStudioApi } from "./api";
import { AsyncRequestController, type AsyncRequestToken } from "./async-request-controller";
import {
  cloneEditableEffect, customEffectCategoryForKind, isAdvancedEditableContent, isCustomEffectContent, isEditableEffectContent, isMyEffectKind,
  libraryItemSyncResult, libraryKindPriority, sameLibraryItemVersion, serialiseEditable, upsertSummary, type CustomEffectCategory,
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
  shouldOpenVideoSelection,
  type StudioSection,
} from "./studio-navigation";
import type {
  EffectUserState,
  HomeAssistant,
  LibraryItem,
  LibrarySnapshot,
  LibrarySummary,
} from "./types";
import { compareLabels, errorCode, errorMessage } from "./ui-utils";
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
    this.model.patch({ loading: true, error: undefined, previewStatus: undefined, isAdmin });
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
    this.model.patch({ selectedDeviceId, previewStatus: undefined, notice: undefined });
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
    const categoryChanged =
      section === "custom" &&
      customEffectCategory !== undefined &&
      customEffectCategory !== this.model.customEffectCategory;
    if (section === this.model.section && categoryChanged) {
      if (!this.model.customEffectCategoryAvailable(customEffectCategory)) {
        return;
      }
      this.model.patch({
        customEffectCategory,
        notice: undefined,
      });
      this.remember();
      return;
    }
    const transitionEpoch = this.editor.beginTransition();
    if (section === this.model.section && !categoryChanged) {
      if (section === "scenes" && this.model.sceneEditorOpen) this.model.patch({ sceneEditorOpen: false });
      if (shouldOpenVideoSelection(section, this.model.content.kind)) {
        await this.openVideoSelection(transitionEpoch);
      }
      return;
    }
    if (
      (section === "custom" &&
        (!this.model.customEffectsAvailable ||
          (customEffectCategory !== undefined &&
            !this.model.customEffectCategoryAvailable(customEffectCategory)))) ||
      (section === "video" && !this.model.videoAvailable)
    ) return;
    this.model.patch({
      sceneEditorOpen: false,
      section,
      customEffectCategory:
        section === "custom" && customEffectCategory !== undefined
          ? customEffectCategory
          : this.model.customEffectCategory,
      notice: undefined,
    });
    this.remember();
    if (section === "scenes") return;
    if (section === "video") {
      await this.openVideoSelection(transitionEpoch);
      return;
    }
    if (
      (isCustomEffectContent(this.model.content) || this.model.content.kind === "palette_diy" ||
        this.model.content.kind === "music_profile" || isAdvancedEditableContent(this.model.content) ||
        this.model.content.kind === "opaque") &&
      this.model.customEffectKindAvailable(this.model.content.kind)
    ) return;
    const item = this.preferredLibraryEffect();
    if (item) await this.selectItem(item.id, transitionEpoch);
    else if (this.model.isAdmin) this.editor.openDefaultAvailableTemplate(transitionEpoch);
    else this.model.patch({ currentItem: undefined, name: "" });
  }

  public async openInitialContext(): Promise<void> {
    this.openRootCreateView();
    const context = activeStudioContext(
      this.model.selectedDevice,
      this.model.library.items,
      (candidate) =>
        candidate.kind === "scene_builtin" || candidate.kind === "scene_palette" || candidate.kind === "scene_layered"
          ? candidate.template?.sku === this.model.selectedModel
          : this.model.libraryItemAvailable(candidate),
    );
    if (context.kind === "native-scene") {
      this.model.patch({ sceneInitialSelection: { kind: "native", effect: context.effect } });
      return;
    }
    if (context.kind === "root") return;
    const item = context.item;
    if (item.kind === "scene_builtin" || item.kind === "scene_palette" || item.kind === "scene_layered") {
      this.model.patch({ sceneInitialSelection: { kind: "saved", itemId: item.id } });
      return;
    }
    this.model.patch({
      section: item.kind === "video_profile" ? "video" : "custom",
      customEffectCategory:
        item.kind === "video_profile"
          ? this.model.customEffectCategory
          : this.categoryForKind(item.kind),
    });
    if (!(await this.selectItem(item.id, undefined, false))) {
      this.openRootCreateView();
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
    const transitionEpoch = existingTransitionEpoch ?? this.editor.beginTransition();
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
      !this.api || !this.model.isAdmin || !this.model.dirty || this.model.saving ||
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
          currentItem: result, customCopyStarted: false, customTemplateSelection: undefined,
          name: result.name, content: cloneEditableEffect(savedContent),
          savedBaseline: serialiseEditable(result.name, savedContent),
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
      section: rememberedStudioSection(navigation, { custom: this.model.customEffectsAvailable, video: this.model.videoAvailable }),
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

  private preferredLibraryEffect(items: LibrarySummary[] = this.model.library.items): LibrarySummary | undefined {
    return items
      .filter((item) => item.kind !== "video_profile" && isMyEffectKind(item.kind) && this.model.libraryItemAvailable(item))
      .sort((left, right) => {
        const priority = libraryKindPriority(left.kind, this.model.selectedModel) - libraryKindPriority(right.kind, this.model.selectedModel);
        return priority || compareLabels(left.name, right.name);
      })[0];
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

  private async openVideoSelection(transitionEpoch: number): Promise<void> {
    const item = this.model.library.items.find(
      (candidate) =>
        candidate.kind === "video_profile" &&
        this.model.libraryItemAvailable(candidate),
    );
    if (item) {
      await this.selectItem(item.id, transitionEpoch);
      return;
    }
    const mode = this.model.modelCatalogue?.video_modes[0];
    if (mode) {
      this.editor.openVideoTemplate(mode.id, mode.label);
    }
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
    value === "advanced" || value === "special-diy" || value === "my-effects";
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
