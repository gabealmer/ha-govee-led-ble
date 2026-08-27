import { customEffectCategoryAvailable, customEffectKindAvailable, libraryItemAvailable, type CustomEffectListContext } from "./custom-effect-list";
import {
  editorActionDescriptors,
  editorOwnerMatches,
  newEditorSourceSelected,
  reactiveEffectSelectorVisible,
  NO_EDITOR_SOURCE,
  serialiseEditableContent,
  type EditorAction,
  type EditorSource,
} from "./editor-state";
import {
  blankPainted,
  isEditableEffectContent,
  serialiseEditable,
  type CustomEffectCategory,
  type EditableEffectContent,
  type PaintedSegmentDraft,
} from "./effect-editor-model";
import type { SceneInitialSelection } from "./scene-browser";
import type { StudioSection } from "./studio-navigation";
import type {
  CustomEffectCatalogue, DeviceCapabilities, DiyEffectFamily, EffectContent, EffectUserState, LibraryItem, LibrarySnapshot,
  LibrarySummary, HomeAssistant, ModelEffectCatalogue, ModelSku, PreviewStatus, RGB,
} from "./types";

export type DeleteCandidate = Pick<LibrarySummary, "id" | "version" | "updated_at" | "name"> & {
  discardsOpenEdits?: boolean;
};

export interface PendingTransitionDialog {
  primaryLabel: "Save" | "Save As";
  saveName: string;
  requiresName: boolean;
  busy: boolean;
  error?: string;
}

export class PanelModel {
  public loading = true;
  public error?: string;
  public notice?: string;
  public devices: DeviceCapabilities[] = [];
  public selectedDeviceId?: string;
  public userState?: EffectUserState;
  public sceneInitialSelection?: SceneInitialSelection;
  public section: StudioSection = "custom";
  public customEffectCategory: CustomEffectCategory = "single-layer";
  public sceneEditorOpen = false;
  public editorSource: EditorSource = NO_EDITOR_SOURCE;
  public library: LibrarySnapshot = { items: [] };
  public customCatalogue?: CustomEffectCatalogue;
  public currentItem?: LibraryItem;
  public savedSceneSelection?: LibraryItem;
  public name = "";
  public content: EffectContent = blankPainted();
  public paintColour: RGB = [255, 69, 58];
  public paintBrushOff = false;
  public saving = false;
  public saveNameDialogOpen = false;
  public saveNameValue = "";
  public saveNameError?: string;
  public pendingTransitionDialog?: PendingTransitionDialog;
  public deleteCandidate?: DeleteCandidate;
  public deletingItemId?: string;
  public liveApplyEnabled = true;
  public autoSaveEnabled = false;
  public autoSaveInProgress = false;
  public autoSaveFailed = false;
  public previewStatus?: PreviewStatus;
  public previewNotice?: string;
  public previewProgressVisible = false;
  public savedBaseline?: string;
  public resetBaseline?: EditableEffectContent;
  public resetNameBaseline?: string;
  public editorTransitionEpoch = 0;
  public isAdmin = false;

  public constructor(private readonly changed: () => void) {}

  public update(change: (model: PanelModel) => void): void {
    change(this);
    this.changed();
  }

  public patch(change: Partial<PanelModel>): void {
    Object.assign(this, change);
    this.changed();
  }

  public syncAdmin(hass?: HomeAssistant): void {
    const isAdmin = hass?.user?.is_admin === true;
    if (this.isAdmin !== isAdmin) {
      this.isAdmin = isAdmin;
      this.changed();
    }
  }

  public get selectedDevice(): DeviceCapabilities | undefined {
    return this.devices.find(
      (device) => device.config_entry_id === this.selectedDeviceId,
    );
  }

  public get selectedModel(): ModelSku | undefined {
    const model = this.selectedDevice?.model;
    return model === "H617A" || model === "H6199" ? model : undefined;
  }

  public get showDeviceSelector(): boolean {
    return (
      this.devices.length > 1 ||
      (this.devices.length > 0 &&
        this.selectedDeviceId !== undefined &&
        this.selectedDevice === undefined)
    );
  }

  public get editorReadOnly(): boolean {
    return !this.isAdmin;
  }

  public get editorOwnedByActiveView(): boolean {
    return editorOwnerMatches(
      this.editorSource,
      this.section,
      this.customEffectCategory,
    );
  }

  public get templateSelection(): string | undefined {
    return this.editorSource.kind === "catalogue"
      ? this.editorSource.selectionIdentity
      : undefined;
  }

  public get catalogueSourceLabel(): string | undefined {
    return this.editorSource.kind === "catalogue"
      ? this.editorSource.label
      : undefined;
  }

  public get newCustomEffectSelected(): boolean {
    return newEditorSourceSelected(
      this.editorSource,
      this.customEffectCategory,
    );
  }

  public get showReactiveEffectSelector(): boolean {
    return reactiveEffectSelectorVisible(this.editorSource);
  }

  public get modelCatalogue(): ModelEffectCatalogue | undefined {
    const model = this.selectedModel;
    return model ? this.customCatalogue?.models[model] : undefined;
  }

  public get videoAvailable(): boolean {
    return (
      this.effectCategoryEnabled("video") &&
      Boolean(this.modelCatalogue?.video_modes.length)
    );
  }

  public get customEffectsAvailable(): boolean {
    const catalogue = this.modelCatalogue;
    return Boolean(
      catalogue &&
        (this.customEffectCategoryAvailable("single-layer") ||
          this.customEffectCategoryAvailable("multi-layer") ||
          this.customEffectCategoryAvailable("music") ||
          this.customEffectCategoryAvailable("advanced")),
    );
  }

  public get customEffectListContext(): CustomEffectListContext {
    return {
      model: this.selectedModel,
      catalogue: this.modelCatalogue,
      libraryItems: this.library.items,
    };
  }

  public get dirty(): boolean {
    return (
      this.editorSource.kind !== "none" &&
      this.editorSource.kind !== "catalogue" &&
      isEditableEffectContent(this.content) &&
      this.savedBaseline !== serialiseEditable(this.name, this.content)
    );
  }

  public get localWorkNeedsProtection(): boolean {
    if (
      this.editorSource.kind === "saved" ||
      this.editorSource.kind === "scene"
    ) {
      return this.dirty;
    }
    if (this.liveApplyEnabled) {
      return false;
    }
    if (this.editorSource.kind === "catalogue") {
      return this.resetDirty;
    }
    return this.editorSource.kind === "new" && (this.dirty || this.resetDirty);
  }

  public get canSaveCurrentDraft(): boolean {
    return (
      this.dirty ||
      this.editorSource.kind === "new" ||
      (this.editorSource.kind === "scene" &&
        this.editorSource.itemId === undefined)
    );
  }

  public get resetDirty(): boolean {
    return this.resetContentDirty || this.resetNameDirty;
  }

  public get resetContentDirty(): boolean {
    return (
      isEditableEffectContent(this.content) &&
      this.resetBaseline !== undefined &&
      serialiseEditableContent(this.content) !==
        serialiseEditableContent(this.resetBaseline)
    );
  }

  public get resetNameDirty(): boolean {
    return (
      this.editorSource.kind === "new" &&
      this.resetNameBaseline !== undefined &&
      this.name.trim() !== this.resetNameBaseline.trim()
    );
  }

  public get editorActions() {
    return editorActionDescriptors(
      this.editorSource,
      {
        resetAvailable: this.resetBaseline !== undefined,
        resetDirty: this.resetDirty,
        autoSaveEnabled: this.autoSaveEnabled,
        autoSaveFailed: this.autoSaveFailed,
        canSave: this.canSaveCurrentDraft,
        canMutate: this.isAdmin,
        busy: this.saving || this.deletingCurrentItem,
      },
    );
  }

  public editorAction(id: EditorAction) {
    return this.editorActions.find((action) => action.id === id);
  }

  public get showSingleEffectSelector(): boolean {
    return (
      this.editorSource.kind === "new" ||
      this.editorSource.kind === "saved"
    );
  }

  public get previewCapability() {
    if (!isEditableEffectContent(this.content)) {
      return undefined;
    }
    const device = this.selectedDevice;
    if (!device) {
      return undefined;
    }
    switch (this.content.kind) {
      case "h617a_painted":
        return device.custom_effects.painted;
      case "h617a_single":
        return device.custom_effects.single;
      case "h617a_multi":
        return device.custom_effects.multi;
      case "palette_diy":
        return device.custom_effects.palette_diy;
      case "advanced":
      case "scene_layered":
        return device.custom_effects.advanced;
      case "music_profile":
        return device.profiles.music;
      case "video_profile":
        return device.profiles.video;
      case "workshop":
        return device.custom_effects.workshop;
    }
  }

  public get deletingCurrentItem(): boolean {
    return (
      this.deletingItemId !== undefined &&
      this.currentItem?.id === this.deletingItemId
    );
  }

  public get selectedSingleEffectFamily(): DiyEffectFamily | undefined {
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "palette_diy"
    ) {
      return undefined;
    }
    const family = this.content.family;
    return this.modelCatalogue?.effects.find(
      (effect) => effect.family === family,
    );
  }

  public libraryItemAvailable(item: LibrarySummary): boolean {
    return libraryItemAvailable(this.customEffectListContext, item);
  }

  public customEffectCategoryAvailable(
    category: CustomEffectCategory,
  ): boolean {
    return (
      this.effectCategoryEnabled(category) &&
      customEffectCategoryAvailable(this.customEffectListContext, category)
    );
  }

  public get scenesAvailable(): boolean {
    return this.effectCategoryEnabled("scenes");
  }

  private effectCategoryEnabled(category: CustomEffectCategory | "scenes" | "video"): boolean {
    const option = {
      scenes: "scenes",
      video: "video",
      "single-layer": "effects",
      "multi-layer": "multi_layered",
      music: "reactive",
      advanced: "advanced",
      all: "",
      "my-effects": "",
    }[category];
    return option !== "" && this.selectedDevice?.effect_categories.includes(option) === true;
  }

  public defaultCustomEffectCategory(): CustomEffectCategory {
    return (
      ["single-layer", "multi-layer", "music", "advanced"].find(
        (category) =>
          this.customEffectCategoryAvailable(category as CustomEffectCategory),
      ) as CustomEffectCategory | undefined
    ) ?? "single-layer";
  }

  public customEffectKindAvailable(kind: string): boolean {
    return customEffectKindAvailable(this.customEffectListContext, kind);
  }

  public get activePaintBrush(): PaintedSegmentDraft {
    return this.paintBrushOff ? null : [...this.paintColour];
  }

}
