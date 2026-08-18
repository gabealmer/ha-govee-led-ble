import type { EffectStudioApi } from "./api";
import { isAdvancedEditableContent, isCustomEffectContent, isMyEffectKind, libraryKindPriority, type CustomEffectCategory } from "./effect-editor-model";
import { PanelEditorController } from "./panel-editor-controller";
import { PanelLibraryController } from "./panel-library-controller";
import { PanelModel } from "./panel-model";
import { PanelPreviewController } from "./panel-preview-controller";
import { activeStudioContext, editorDevicePath, initialDeviceId, rememberedStudioSection, type StudioSection } from "./studio-navigation";
import type { LibrarySummary } from "./types";
import { compareLabels, errorMessage } from "./ui-utils";

interface PanelNavigationOptions {
  api(): EffectStudioApi | undefined;
  pathname(): string;
  replacePath(path: string): void;
}

export class PanelNavigationController {
  public constructor(
    private readonly model: PanelModel,
    private readonly editor: PanelEditorController,
    private readonly library: PanelLibraryController,
    private readonly preview: PanelPreviewController,
    private readonly options: PanelNavigationOptions,
  ) {}

  public async initialiseSelectedDevice(): Promise<string | undefined> {
    const userState = this.model.userState;
    const selectedDeviceId = initialDeviceId(this.options.pathname(), this.model.devices, userState?.selected_config_entry_id);
    this.model.update((model) => {
      model.selectedDeviceId = selectedDeviceId;
      model.notice = model.availabilityNotice();
    });
    if (!userState || !this.model.selectedDevice || selectedDeviceId === userState.selected_config_entry_id) return undefined;
    try {
      const updated = await this.options.api()?.updateUserState(selectedDeviceId, userState.navigation);
      if (updated) this.model.patch({ userState: updated });
      return undefined;
    } catch (error) {
      return `Could not remember the selected light: ${errorMessage(error)}`;
    }
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
      const updated = await this.options.api()?.updateUserState(selectedDeviceId, this.model.userState?.navigation ?? {});
      if (updated) this.model.patch({ userState: updated });
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
      const savedVideo = this.model.library.items.find(
        (item) => item.kind === "video_profile" && this.model.libraryItemAvailable(item),
      );
      if (savedVideo) {
        await this.library.selectItem(savedVideo.id, transitionEpoch);
      } else {
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
    if (item) await this.library.selectItem(item.id, transitionEpoch);
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
    if (!(await this.library.selectItem(item.id))) this.openRootCreateView();
  }

  public openRootCreateView(): void {
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

  private async rememberNavigation(): Promise<void> {
    const api = this.options.api();
    if (!api || !this.model.userState) return;
    try {
      const userState = await api.updateUserState(this.model.selectedDeviceId, {
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
}

export function isCustomEffectCategory(value: unknown): value is CustomEffectCategory {
  return value === "all" || value === "music" || value === "single-layer" || value === "multi-layer" ||
    value === "advanced" || value === "special-diy" || value === "my-effects";
}
