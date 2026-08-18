import { customEffectCategoryAvailable, customEffectKindAvailable, libraryItemAvailable, type CustomEffectListContext } from "./custom-effect-list";
import { defaultCustomEffectCategory, showCustomEffectSelector } from "./custom-effect-workflow";
import { blankPainted, defaultPalette, isEditableEffectContent, serialiseEditable, type CustomEffectCategory } from "./effect-editor-model";
import type { SceneInitialSelection } from "./scene-browser";
import type { StudioSection } from "./studio-navigation";
import type {
  CustomEffectCatalogue, DeviceCapabilities, DiyEffectFamily, EffectContent, EffectUserState, LibraryItem, LibrarySnapshot,
  LibrarySummary, ModelEffectCatalogue, ModelSku, PreviewStatus, RGB,
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
  public customEffectCategory: CustomEffectCategory = "all";
  public sceneEditorOpen = false;
  public customTemplateSelection?: string;
  public templateSourceLabel?: string;
  public customCopyStarted = false;
  public library: LibrarySnapshot = { items: [] };
  public customCatalogue?: CustomEffectCatalogue;
  public currentItem?: LibraryItem;
  public savedSceneSelection?: LibraryItem;
  public name = "";
  public content: EffectContent = blankPainted();
  public paintBrushes = defaultPalette();
  public selectedPaintBrush = 0;
  public brushUsesBackground = false;
  public saving = false;
  public saveNameDialogOpen = false;
  public saveNameValue = "";
  public saveNameError?: string;
  public deleteCandidate?: DeleteCandidate;
  public deletingItemId?: string;
  public liveApplyEnabled = true;
  public previewStatus?: PreviewStatus;
  public savedBaseline?: string;
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
    return !this.isAdmin || this.templateSourceLabel !== undefined;
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
      isEditableEffectContent(this.content) &&
      this.savedBaseline !== serialiseEditable(this.name, this.content)
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
      case "special_diy":
        return device.custom_effects.special_diy;
    }
  }

  public get deletingCurrentItem(): boolean {
    return (
      this.deletingItemId !== undefined &&
      this.currentItem?.id === this.deletingItemId
    );
  }

  public get showCustomEffectSelector(): boolean {
    return showCustomEffectSelector(
      this.currentItem !== undefined,
      this.customCopyStarted,
      this.templateSourceLabel,
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

  public get activePaintBrush(): RGB {
    return [
      ...(this.paintBrushes[this.selectedPaintBrush] ??
        this.paintBrushes[0] ??
        [47, 111, 237]),
    ] as RGB;
  }

  public availabilityNotice(): string | undefined {
    return this.selectedDeviceId && !this.selectedDevice
      ? "This device is temporarily unavailable in Home Assistant. Live apply will resume after it is loaded and edited."
      : undefined;
  }
}
