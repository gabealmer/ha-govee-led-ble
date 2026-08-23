import { customEffectCategoryAvailable, customEffectKindAvailable, libraryItemAvailable, type CustomEffectListContext } from "./custom-effect-list";
import { defaultCustomEffectCategory } from "./custom-effect-workflow";
import {
  editorActionVisibility,
  editorOwnerMatches,
  NO_EDITOR_SOURCE,
  serialiseEditableContent,
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
  public saveNameMode: "save" | "copy" = "save";
  public saveNameValue = "";
  public saveNameError?: string;
  public deleteCandidate?: DeleteCandidate;
  public deletingItemId?: string;
  public liveApplyEnabled = true;
  public autoSaveEnabled = false;
  public autoSaveFailed = false;
  public previewStatus?: PreviewStatus;
  public previewNotice?: string;
  public previewProgressVisible = false;
  public savedBaseline?: string;
  public resetBaseline?: EditableEffectContent;
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

  public get modelCatalogue(): ModelEffectCatalogue | undefined {
    const model = this.selectedModel;
    return model ? this.customCatalogue?.models[model] : undefined;
  }

  public get videoAvailable(): boolean {
    return Boolean(this.modelCatalogue?.video_modes.length);
  }

  public get customEffectsAvailable(): boolean {
    const catalogue = this.modelCatalogue;
    return Boolean(
      catalogue &&
        (catalogue.painted_effects.length ||
          catalogue.effects.length ||
          catalogue.music_modes.length ||
          catalogue.supports.advanced !== "unsupported"),
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

  public get canSaveCurrentDraft(): boolean {
    return (
      this.dirty ||
      this.editorSource.kind === "new" ||
      (this.editorSource.kind === "scene" &&
        this.editorSource.itemId === undefined)
    );
  }

  public get resetDirty(): boolean {
    return (
      isEditableEffectContent(this.content) &&
      this.resetBaseline !== undefined &&
      serialiseEditableContent(this.content) !==
        serialiseEditableContent(this.resetBaseline)
    );
  }

  public get editorActions() {
    return editorActionVisibility(
      this.editorSource,
      this.resetDirty,
      this.autoSaveEnabled,
      this.autoSaveFailed,
    );
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
    return customEffectCategoryAvailable(
      this.customEffectListContext,
      category,
    );
  }

  public defaultCustomEffectCategory(): CustomEffectCategory {
    return defaultCustomEffectCategory(this.customEffectListContext);
  }

  public customEffectKindAvailable(kind: string): boolean {
    return customEffectKindAvailable(this.customEffectListContext, kind);
  }

  public get activePaintBrush(): PaintedSegmentDraft {
    return this.paintBrushOff ? null : [...this.paintColour];
  }

}
