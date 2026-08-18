import { EffectStudioApi } from "./api";
import { AsyncRequestController, type AsyncRequestToken } from "./async-request-controller";
import {
  cloneEditableEffect, isAdvancedEditableContent, isCustomEffectContent, isEditableEffectContent, isMyEffectKind,
  libraryItemSyncResult, libraryKindPriority, sameLibraryItemVersion, serialiseEditable, upsertSummary, type CustomEffectCategory,
} from "./effect-editor-model";
import { PanelEditorController } from "./panel-editor-controller";
import { PanelModalController } from "./panel-modal-controller";
import { PanelModel } from "./panel-model";
import { PanelPreviewController } from "./panel-preview-controller";
import { activeStudioContext, editorDevicePath, initialDeviceId, rememberedStudioSection, type StudioSection } from "./studio-navigation";
import type { HomeAssistant, LibraryItem, LibrarySnapshot, LibrarySummary } from "./types";
import { compareLabels, errorCode, errorMessage } from "./ui-utils";
import { isCompatibleEditorInfo } from "./validation";

type LoadRequest = AsyncRequestToken<{ api: EffectStudioApi }>;

interface PanelControllerOptions {
  connected(): boolean;
  pathname(): string;
  replacePath(path: string): void;
}

export class PanelController {
  public api?: EffectStudioApi;

  private unsubscribeLibrary?: () => void;
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
    let preferenceNotice: string | undefined;
    try {
      const [info, devices, library, customCatalogue, userState] = await Promise.all([
        api.info(), api.devices(), api.library(), api.customCatalogue(), api.userState(),
      ]);
      if (!this.loadIsCurrent(request)) return;
      if (!isCompatibleEditorInfo(info)) {
        throw new Error("This editor bundle is not compatible with the installed backend.");
      }
      this.model.patch({ devices, library, customCatalogue, userState });
      preferenceNotice = await this.initialiseSelectedDevice();
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
      if (preferenceNotice) this.model.patch({ notice: preferenceNotice });
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
    let preferenceNotice: string | undefined;
    try {
      const userState = await this.api?.updateUserState(selectedDeviceId, this.model.userState?.navigation ?? {});
      if (userState) this.model.patch({ userState });
    } catch (error) {
      preferenceNotice = `Could not remember the selected light: ${errorMessage(error)}`;
    }
    await this.openInitialContext();
    if (preferenceNotice) this.model.patch({ notice: preferenceNotice });
  }

  public async selectSection(section: StudioSection): Promise<void> {
    const transitionEpoch = this.editor.beginTransition();
    if (section === this.model.section) {
      if (section === "scenes" && this.model.sceneEditorOpen) this.model.patch({ sceneEditorOpen: false });
      return;
    }
    if ((section === "custom" && !this.model.customEffectsAvailable) || (section === "video" && !this.model.videoAvailable)) return;
    this.model.patch({ sceneEditorOpen: false, section, notice: undefined });
    this.remember();
    if (section === "scenes") return;
    if (section === "video") {
      const item = this.model.library.items.find(
        (candidate) => candidate.kind === "video_profile" && this.model.libraryItemAvailable(candidate),
      );
      if (item) await this.selectItem(item.id, transitionEpoch);
      else {
        const mode = this.model.modelCatalogue?.video_modes[0];
        if (mode) this.editor.openVideoTemplate(mode.id, mode.label);
      }
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
    this.model.patch({ section: item.kind === "video_profile" ? "video" : "custom" });
    if (!(await this.selectItem(item.id))) this.openRootCreateView();
  }

  public sceneInitialSelectionOpened(): void {
    this.model.patch({ section: "scenes", sceneInitialSelection: undefined });
  }

  public sceneInitialSelectionFailed(): void {
    this.model.patch({ sceneInitialSelection: undefined });
    this.openRootCreateView();
  }

  public categoryChanged(customEffectCategory: CustomEffectCategory): void {
    this.model.patch({ customEffectCategory });
    this.remember();
  }

  public remember(): void {
    void this.rememberNavigation();
  }

  public async libraryChanged(snapshot: LibrarySnapshot): Promise<void> {
    this.model.patch({ library: snapshot });
    const sync = libraryItemSyncResult(this.model.currentItem, snapshot.items, this.model.dirty, this.model.deletingItemId);
    if (sync.action === "none") return;
    if (sync.action === "removed") {
      this.model.patch({ notice: "This effect was removed from the shared library." });
      return;
    }
    if (sync.action === "conflict") {
      this.model.patch({ notice: "This effect changed elsewhere. Reload it before saving." });
      return;
    }
    const transitionEpoch = this.editor.beginTransition();
    const selected = await this.selectItem(sync.summary.id, transitionEpoch);
    if (selected && transitionEpoch === this.model.editorTransitionEpoch) {
      this.model.patch({ notice: "Loaded the latest saved version." });
    }
  }

  public sceneItemSaved(item: LibraryItem): void {
    this.model.patch({ library: { items: upsertSummary(this.model.library.items, item) } });
  }

  public async selectItem(itemId: string, existingTransitionEpoch?: number): Promise<boolean> {
    const transitionEpoch = existingTransitionEpoch ?? this.editor.beginTransition();
    if (!this.api) return false;
    try {
      const item = await this.api.item(itemId);
      return transitionEpoch === this.model.editorTransitionEpoch && this.editor.applyLibraryItem(item);
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
      this.model.patch({ notice: `Deleted ${candidate.name}.` });
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
        this.model.patch({
          currentItem: result, customCopyStarted: false, customTemplateSelection: undefined,
          name: result.name, content: cloneEditableEffect(savedContent),
          savedBaseline: serialiseEditable(result.name, savedContent),
          sceneEditorOpen: savingSceneEditor && savedContent.kind === "scene_layered" ? false : this.model.sceneEditorOpen,
          section: savingSceneEditor && savedContent.kind === "scene_layered" ? "custom" : this.model.section,
          customEffectCategory: savingSceneEditor && savedContent.kind === "scene_layered" ? "my-effects" : this.model.customEffectCategory,
          savedSceneSelection: originatingItem && savedContent.kind === "scene_layered" ? result : this.model.savedSceneSelection,
        });
        if (savingSceneEditor && savedContent.kind === "scene_layered") this.remember();
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

  public async initialiseSelectedDevice(): Promise<string | undefined> {
    const userState = this.model.userState;
    const selectedDeviceId = initialDeviceId(this.options.pathname(), this.model.devices, userState?.selected_config_entry_id);
    this.model.update((model) => {
      model.selectedDeviceId = selectedDeviceId;
      model.notice = model.availabilityNotice();
    });
    if (!userState || !this.model.selectedDevice || selectedDeviceId === userState.selected_config_entry_id) return undefined;
    try {
      const updated = await this.api?.updateUserState(selectedDeviceId, userState.navigation);
      if (updated) this.model.patch({ userState: updated });
      return undefined;
    } catch (error) {
      return `Could not remember the selected light: ${errorMessage(error)}`;
    }
  }

  private openRootCreateView(): void {
    this.editor.reset();
    const navigation = this.model.userState?.navigation ?? {};
    const remembered = navigation.custom_category;
    const customEffectCategory = isCustomEffectCategory(remembered) && remembered !== "all" && this.model.customEffectCategoryAvailable(remembered)
      ? remembered
      : this.model.defaultCustomEffectCategory();
    this.model.patch({
      section: rememberedStudioSection(navigation, { custom: this.model.customEffectsAvailable, video: this.model.videoAvailable }),
      customEffectCategory,
      notice: this.model.availabilityNotice(),
    });
  }

  private async rememberNavigation(): Promise<void> {
    if (!this.api || !this.model.userState) return;
    try {
      const userState = await this.api.updateUserState(this.model.selectedDeviceId, {
        section: this.model.section,
        custom_category: this.model.customEffectCategory,
      });
      this.model.patch({ userState });
    } catch (error) {
      this.model.patch({ notice: `Could not remember Studio navigation: ${errorMessage(error)}` });
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
