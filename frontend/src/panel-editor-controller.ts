import { blankAdvancedContent, cloneLayeredSceneContent } from "./advanced-effect-model";
import { newEffectKindForCategory, type CustomEffectListEntry } from "./custom-effect-list";
import type { EditorOwner, EditorSource } from "./editor-state";
import {
  blankCustomEffect,
  blankPainted,
  blankPaletteDiy,
  blankVideoProfile,
  cloneCustomEffect,
  cloneEditableEffect,
  cloneOpaqueContent,
  clonePaletteDiy,
  customKindLabel,
  customEffectCategoryForKind,
  isAdvancedEditableContent,
  isCustomEffectContent,
  isEditableEffectContent,
  serialiseEditable,
  uniquePaintedPalette,
  updateAdvancedEditorContent,
  type CustomEffectCategory,
  type EditableEffectContent,
  type NewEffectKind,
} from "./effect-editor-model";
import type { LivePreviewInteraction } from "./live-preview-controller";
import { PanelModalController } from "./panel-modal-controller";
import { PanelModel } from "./panel-model";
import { PanelPreviewController } from "./panel-preview-controller";
import { cloneMusicProfileContent, cloneVideoProfileContent } from "./profile-model";
import type { ScenePreviewRequest } from "./scene-browser";
import type {
  AdvancedContent,
  CustomEffectContent,
  LayeredSceneContent,
  LibraryItem,
  MusicProfileContent,
  PaintedContent,
  PaletteDiyEffectContent,
  RGB,
  VideoProfileContent,
} from "./types";

interface PanelEditorOptions {
  apiReady(): boolean;
  selectItem(itemId: string): void;
  editorTransitionStarted(): void;
  contentCommitted(interaction: LivePreviewInteraction): void;
}

interface InitialEffect {
  name: string;
  content: EditableEffectContent;
}

interface EditorReturnState {
  currentItem?: LibraryItem;
  savedSceneSelection?: LibraryItem;
  editorSource: EditorSource;
  name: string;
  content: PanelModel["content"];
  paintColour: RGB;
  paintBrushOff: boolean;
  savedBaseline?: string;
  resetBaseline?: EditableEffectContent;
}

export class PanelEditorController {
  private returnState?: EditorReturnState;

  public constructor(
    private readonly model: PanelModel,
    private readonly preview: PanelPreviewController,
    private readonly modal: PanelModalController,
    private readonly options: PanelEditorOptions,
  ) {}

  public beginTransition(cancelPreview = true): number {
    this.options.editorTransitionStarted();
    this.modal.closeForEditorTransition();
    return this.preview.beginEditorTransition(cancelPreview);
  }

  public beginSelectionTransition(): number {
    return this.beginTransition(false);
  }

  public reset(cancelPreview = true): void {
    this.beginTransition(cancelPreview);
    this.clearReturnTarget();
    this.model.patch({
      sceneEditorOpen: false, sceneInitialSelection: undefined, currentItem: undefined, savedSceneSelection: undefined,
      editorSource: { kind: "none" }, name: "", content: blankPainted(),
      savedBaseline: undefined, resetBaseline: undefined,
    });
  }

  public selectCustomEffectEntry(entry: CustomEffectListEntry): void {
    if (entry.kind === "saved") {
      this.options.selectItem(entry.item.id);
    } else if (entry.kind === "music") {
      this.openMusicTemplate(entry.mode, entry.label, true);
    } else if (entry.kind === "paint") {
      this.openEditableTemplate(
        entry.label,
        blankPainted(),
        entry.key,
        { section: "custom", category: entry.category },
        true,
      );
    } else if (entry.kind === "advanced") {
      this.openEditableTemplate(
        entry.label,
        blankAdvancedContent(),
        entry.key,
        { section: "custom", category: entry.category },
        true,
      );
    } else if (entry.kind === "workshop") {
      this.openEditableTemplate(
        entry.label,
        entry.content,
        entry.key,
        { section: "custom", category: entry.category },
        true,
      );
    } else {
      const catalogue = this.model.modelCatalogue;
      if (!catalogue) return;
      if (this.model.selectedModel === "H617A") {
        const content = blankCustomEffect("h617a_single", catalogue);
        this.openEditableTemplate(
          entry.label,
          { ...content, family: entry.family, variant: entry.variant },
          entry.key,
          { section: "custom", category: entry.category },
          true,
        );
      } else {
        this.openEditableTemplate(
          entry.label,
          blankPaletteDiy(catalogue, this.model.selectedModel!, entry.family, entry.variant),
          entry.key,
          { section: "custom", category: entry.category },
          true,
        );
      }
    }
  }

  public newCustomEffect(category: CustomEffectCategory): void {
    if (category === "music") {
      const mode = this.model.modelCatalogue?.music_modes[0];
      const content = mode
        ? this.musicTemplateContent(mode.id)
        : undefined;
      if (mode && content) {
        this.newEffect("music_profile", undefined, {
          name: `New ${mode.label} effect`,
          content,
        });
      }
      return;
    }
    const kind = newEffectKindForCategory(this.model.customEffectListContext, category);
    if (kind) this.newEffect(kind);
  }

  public openVideoTemplate(
    mode: string,
    label: string,
    explicit = true,
    existingTransitionEpoch?: number,
  ): void {
    if (this.model.selectedModel === "H6199") {
      this.openEditableTemplate(
        label,
        blankVideoProfile(mode),
        `template:video:${mode}`,
        { section: "video" },
        explicit,
        existingTransitionEpoch,
      );
    }
  }

  public openEditableTemplate(
    label: string,
    content: EditableEffectContent,
    selectionIdentity: string,
    owner: EditorOwner,
    explicit = true,
    existingTransitionEpoch?: number,
  ): void {
    if (
      existingTransitionEpoch !== undefined &&
      existingTransitionEpoch !== this.model.editorTransitionEpoch
    ) {
      return;
    }
    if (existingTransitionEpoch === undefined) {
      this.beginSelectionTransition();
    }
    const installed = cloneEditableEffect(content);
    this.clearReturnTarget();
    this.model.patch({
      currentItem: undefined,
      editorSource: {
        kind: "catalogue",
        owner,
        selectionIdentity,
        label,
      },
      name: label,
      content: installed,
      savedBaseline: undefined,
      resetBaseline: cloneEditableEffect(content),
      notice: undefined,
    });
    if (explicit) {
      this.preview.scheduleTemplateSelection();
    }
  }

  public openMusicTemplate(
    mode: string,
    label: string,
    explicit = true,
    existingTransitionEpoch?: number,
  ): void {
    const content = this.musicTemplateContent(mode);
    if (!content) return;
    this.openEditableTemplate(
      label,
      content,
      `template:music:${mode}`,
      { section: "custom", category: "music" },
      explicit,
      existingTransitionEpoch,
    );
  }

  public openDefaultAvailableTemplate(
    category: CustomEffectCategory,
    existingTransitionEpoch: number,
  ): void {
    const catalogue = this.model.modelCatalogue;
    if (category === "music" || category === "multi-layer") {
      this.clearSelection(existingTransitionEpoch);
      return;
    }
    if (category === "advanced") {
      const workshop = catalogue?.workshop_templates[0];
      if (this.model.customEffectKindAvailable("advanced")) {
        this.openEditableTemplate(
          "Layered",
          blankAdvancedContent(),
          "template:advanced",
          { section: "custom", category },
          false,
          existingTransitionEpoch,
        );
      } else if (workshop && this.model.customEffectKindAvailable("workshop")) {
        this.openEditableTemplate(
          workshop.label,
          workshop.content,
          `template:workshop:${workshop.id}`,
          { section: "custom", category },
          false,
          existingTransitionEpoch,
        );
      } else {
        this.clearSelection(existingTransitionEpoch);
      }
      return;
    }
    if (category !== "single-layer") {
      this.clearSelection(existingTransitionEpoch);
      return;
    }
    if (this.model.customEffectKindAvailable("h617a_painted")) {
      this.openEditableTemplate(
        "Paint",
        blankPainted(),
        "template:paint",
        { section: "custom", category },
        false,
        existingTransitionEpoch,
      );
      return;
    }
    const family =
      catalogue?.effects.find((effect) => effect.category === "single_layer") ??
      catalogue?.effects[0];
    if (
      this.model.customEffectKindAvailable("h617a_single") &&
      catalogue &&
      family
    ) {
      const variation = family.variations[0];
      const content = blankCustomEffect("h617a_single", catalogue);
      this.openEditableTemplate(
        family.label,
        {
          ...content,
          family: family.family,
          variant: variation.variant,
        },
        `template:single:${family.family}:${variation.variant}`,
        { section: "custom", category },
        false,
        existingTransitionEpoch,
      );
    } else if (
      this.model.customEffectKindAvailable("palette_diy") &&
      catalogue &&
      family
    ) {
      const variation = family.variations[0];
      this.openEditableTemplate(
        family.label,
        blankPaletteDiy(catalogue, this.model.selectedModel!, family.family, variation.variant),
        `template:single:${family.family}:${variation.variant}`,
        { section: "custom", category },
        false,
        existingTransitionEpoch,
      );
    } else {
      this.clearSelection(existingTransitionEpoch);
    }
  }

  public newEffect(kind: NewEffectKind, existingTransitionEpoch?: number, initial?: InitialEffect): void {
    if (
      existingTransitionEpoch !== undefined &&
      existingTransitionEpoch !== this.model.editorTransitionEpoch
    ) {
      return;
    }
    if (existingTransitionEpoch === undefined) this.beginTransition();
    if (
      !this.options.apiReady() || !this.model.isAdmin || !this.model.customEffectKindAvailable(kind) ||
      (kind !== "advanced" && !this.model.modelCatalogue)
    ) return;
    if (existingTransitionEpoch === undefined) {
      this.captureReturnTarget();
    }
    const content = initial?.content ?? (
      kind === "advanced"
        ? blankAdvancedContent()
        : kind === "music_profile"
          ? this.musicTemplateContent(this.model.modelCatalogue!.music_modes[0]?.id ?? "")
        : kind === "palette_diy"
          ? blankPaletteDiy(this.model.modelCatalogue!, this.model.selectedModel!)
          : blankCustomEffect(kind, this.model.modelCatalogue!)
    );
    if (!content) return;
    const name = initial?.name ?? `New ${customKindLabel(kind)} effect`;
    const owner: EditorOwner = {
      section: "custom",
      category:
        kind === "music_profile"
          ? "music"
          : kind === "h617a_multi"
            ? "multi-layer"
            : kind === "advanced"
              ? "advanced"
              : "single-layer",
    };
    this.model.patch({
      currentItem: undefined,
      editorSource: { kind: "new", owner },
      name,
      content: cloneEditableEffect(content),
      paintBrushOff: kind === "h617a_painted" ? false : this.model.paintBrushOff,
      savedBaseline: serialiseEditable(name, content),
      resetBaseline: cloneEditableEffect(content),
      notice: undefined,
    });
  }

  public applyLibraryItem(item: LibraryItem): boolean {
    this.clearReturnTarget();
    const owner: EditorOwner =
      item.content.kind === "video_profile"
        ? { section: "video" }
        : {
            section: "custom",
            category: customEffectCategoryForKind(item.content.kind),
          };
    const selection = {
      currentItem: item,
      sceneEditorOpen: false,
      editorSource: {
        kind: "saved" as const,
        owner,
        itemId: item.id,
      },
      name: item.name,
    };
    if (item.content.kind === "opaque") {
      this.model.patch({
        ...selection, content: cloneOpaqueContent(item.content), savedBaseline: undefined,
        resetBaseline: undefined, notice: undefined,
      });
      return true;
    }
    if (!isEditableEffectContent(item.content)) {
      this.model.patch({ notice: "This item cannot be edited here." });
      return false;
    }
    const content = item.content;
    this.model.patch({
      ...selection, content: cloneEditableEffect(content), savedBaseline: serialiseEditable(item.name, content),
      resetBaseline: cloneEditableEffect(content),
      paintBrushOff: content.kind === "h617a_painted" ? false : this.model.paintBrushOff,
      notice: undefined,
    });
    return true;
  }

  public clearCurrentAfterDelete(): void {
    this.beginTransition();
    this.clearReturnTarget();
    this.model.patch({
      currentItem: undefined, editorSource: { kind: "none" },
      sceneEditorOpen: false,
      name: "", content: blankPainted(), savedBaseline: undefined,
      resetBaseline: undefined,
    });
  }

  public openSceneEditor(detail: {
    content: LayeredSceneContent;
    config_entry_id: string;
    item?: LibraryItem;
    name: string;
  }): void {
    if (!this.model.isAdmin || detail.config_entry_id !== this.model.selectedDeviceId) return;
    this.beginTransition();
    this.model.patch({
      currentItem: detail.item,
      editorSource: {
        kind: "scene",
        owner: { section: "scenes" },
        ...(detail.item ? { itemId: detail.item.id } : {}),
      },
      name: detail.name.trim() || "Layered scene template", content: cloneLayeredSceneContent(detail.content),
      savedBaseline: detail.item?.content.kind === "scene_layered" ? serialiseEditable(detail.item.name, detail.item.content) : undefined,
      resetBaseline: cloneLayeredSceneContent(detail.content),
      sceneEditorOpen: true, notice: undefined,
    });
  }

  public cancelSceneEdit(): void {
    this.beginTransition();
    this.model.patch({ sceneEditorOpen: false, notice: undefined });
  }

  public cancelCreation(): void {
    const returnState = this.returnState;
    if (!returnState) {
      return;
    }
    this.beginTransition();
    this.returnState = undefined;
    this.model.patch({
      ...returnState,
      paintColour: [...returnState.paintColour],
      notice: undefined,
    });
  }

  public commitCreation(): void {
    this.clearReturnTarget();
  }

  public advancedContentChanged(content: AdvancedContent, interaction?: LivePreviewInteraction, scene?: ScenePreviewRequest): void {
    if (!isAdvancedEditableContent(this.model.content)) return;
    this.installEditedContent(updateAdvancedEditorContent(this.model.content, content), interaction, scene);
  }

  public customContentChanged(
    content: CustomEffectContent | PaletteDiyEffectContent,
    interaction?: LivePreviewInteraction,
  ): void {
    const clone = content.kind === "palette_diy"
      ? clonePaletteDiy(content)
      : cloneCustomEffect(content);
    this.installEditedContent(clone, interaction);
  }

  public musicContentChanged(content: MusicProfileContent, interaction?: LivePreviewInteraction): void {
    this.installEditedContent(cloneMusicProfileContent(content), interaction);
  }

  public videoContentChanged(content: VideoProfileContent, interaction?: LivePreviewInteraction): void {
    this.installEditedContent(cloneVideoProfileContent(content), interaction);
  }

  public paintColourChanged(colour: RGB): void {
    this.model.patch({
      paintColour: [...colour],
      paintBrushOff: false,
    });
  }

  public selectPaintOff(): void {
    this.model.patch({ paintBrushOff: true });
  }

  public selectSingleEffect(selected: string): void {
    if (!this.model.customCatalogue || this.model.currentItem?.content.kind === "opaque") return;
    const content = this.model.content;
    if (
      this.model.currentItem &&
      ((content.kind === "h617a_painted" && selected !== "paint") || (content.kind === "h617a_single" && selected === "paint"))
    ) return;
    const source = this.model.editorSource;
    if (source.kind === "catalogue") {
      if (selected === "paint") {
        this.openEditableTemplate(
          "Paint",
          blankPainted(),
          "template:paint",
          source.owner,
          true,
        );
        return;
      }
      const catalogue = this.model.modelCatalogue;
      const family = catalogue?.effects.find((effect) => effect.id === selected);
      const variation = family?.variations[0];
      if (!catalogue || !family || !variation) return;
      const selectedContent =
        this.model.selectedModel === "H617A"
          ? {
              ...blankCustomEffect("h617a_single", catalogue),
              family: family.family,
              variant: variation.variant,
            }
          : blankPaletteDiy(
              catalogue,
              this.model.selectedModel!,
              family.family,
              variation.variant,
            );
      this.openEditableTemplate(
        family.label,
        selectedContent,
        `template:single:${family.family}:${variation.variant}`,
        source.owner,
        true,
      );
      return;
    }
    if (selected === "paint") {
      if (content.kind !== "h617a_painted") this.switchCustomMode("h617a_painted");
      this.model.update((model) => {
        this.updateGeneratedEffectName(model, "Paint");
      });
      return;
    }
    const family = this.model.modelCatalogue?.effects.find((effect) => effect.id === selected);
    const variation = family?.variations[0];
    if (!family || !variation) return;
    if (this.model.content.kind === "h617a_painted") this.switchCustomMode("h617a_single", false);
    if (this.model.content.kind !== "h617a_single" && this.model.content.kind !== "palette_diy") return;
    const selectedContent = {
      ...this.model.content,
      family: family.family,
      variant: variation.variant,
    };
    this.installEditedContent(selectedContent);
    this.model.update((model) => {
      this.updateGeneratedEffectName(model, family.label);
    });
  }

  public setSegmentColour(index: number, interaction: LivePreviewInteraction): boolean {
    if (this.model.content.kind !== "h617a_painted") return false;
    const segments = this.model.content.segments.map((segment) =>
      segment === null ? null : [...segment] as RGB,
    );
    const brush = this.model.activePaintBrush;
    const current = segments[index];
    if (
      current === null
        ? brush === null
        : brush !== null && current.every((channel, channelIndex) => channel === brush[channelIndex])
    ) {
      return false;
    }
    segments[index] = brush === null ? null : [...brush];
    this.installEditedContent(
      { ...this.model.content, segments },
      interaction,
    );
    return true;
  }

  public resetContent(): void {
    const baseline = this.model.resetBaseline;
    if (!baseline || !this.model.resetDirty) {
      return;
    }
    if (baseline.kind === "h617a_painted") {
      this.model.patch({ paintBrushOff: false });
    }
    this.installEditedContent(cloneEditableEffect(baseline), "committed");
  }

  public updatePaintedContent(update: Partial<PaintedContent>, interaction: LivePreviewInteraction = "changing"): void {
    if (this.model.content.kind === "h617a_painted") {
      this.installEditedContent({ ...this.model.content, ...update }, interaction);
    }
  }

  private switchCustomMode(kind: CustomEffectContent["kind"], schedulePreview = true): void {
    if (
      !this.model.isAdmin || !this.model.customCatalogue || !isCustomEffectContent(this.model.content) ||
      this.model.content.kind === kind
    ) return;
    const current = this.model.content;
    if (kind === "h617a_single" && current.kind === "h617a_multi" && current.effects.length > 1) return;
    let next: CustomEffectContent;
    if (kind === "h617a_painted") {
      if (current.kind !== "h617a_painted") {
        this.model.paintColour = current.palette[0]
          ? [...current.palette[0]]
          : [47, 111, 237];
      }
      this.model.paintBrushOff = false;
      next = { ...blankPainted(), speed: current.speed };
    } else if (current.kind === "h617a_painted") {
      const paintedPalette = uniquePaintedPalette(current);
      if (kind === "h617a_single") {
        const blank = blankCustomEffect(kind, this.model.customCatalogue);
        next = { ...blank, speed: current.speed, palette: paintedPalette.length ? paintedPalette : blank.palette };
      } else {
        const blank = blankCustomEffect("h617a_multi", this.model.customCatalogue);
        next = { ...blank, speed: current.speed, palette: paintedPalette.length ? paintedPalette : blank.palette };
      }
    } else if (kind === "h617a_multi" && current.kind === "h617a_single") {
      next = {
        kind, effects: [{ family: current.family, variant: current.variant }], speed: current.speed,
        palette: current.palette.map((colour) => [...colour]),
      };
    } else if (kind === "h617a_single" && current.kind === "h617a_multi") {
      const first = current.effects[0];
      next = {
        kind, family: first.family, variant: first.variant, speed: current.speed,
        palette: current.palette.map((colour) => [...colour]),
      };
    } else {
      return;
    }
    if (schedulePreview) this.installEditedContent(next);
    else this.model.content = next;
    this.model.update((model) => {
      if (/^New (Paint|Painted|Single|Multi) effect$/.test(model.name)) model.name = `New ${customKindLabel(kind)} effect`;
      model.notice = undefined;
    });
  }

  private installEditedContent(
    content: EditableEffectContent,
    interaction: LivePreviewInteraction = "committed",
    scene?: ScenePreviewRequest,
  ): void {
    this.model.patch({ content });
    this.preview.scheduleEdited(interaction, scene);
    this.options.contentCommitted(interaction);
  }

  private updateGeneratedEffectName(model: PanelModel, label: string): void {
    if (model.editorSource.kind === "catalogue") {
      model.editorSource = { ...model.editorSource, label };
      model.name = label;
    } else if (
      model.editorSource.kind === "new" &&
      /^New .+ effect$/.test(model.name)
    ) {
      model.name = `New ${label} effect`;
    }
  }

  private captureReturnTarget(): void {
    if (this.returnState) {
      return;
    }
    this.returnState = {
      currentItem: this.model.currentItem,
      savedSceneSelection: this.model.savedSceneSelection,
      editorSource: this.model.editorSource,
      name: this.model.name,
      content: isEditableEffectContent(this.model.content)
        ? cloneEditableEffect(this.model.content)
        : this.model.content,
      paintColour: [...this.model.paintColour],
      paintBrushOff: this.model.paintBrushOff,
      savedBaseline: this.model.savedBaseline,
      resetBaseline: this.model.resetBaseline
        ? cloneEditableEffect(this.model.resetBaseline)
        : undefined,
    };
  }

  private clearReturnTarget(): void {
    this.returnState = undefined;
  }

  public clearSelection(existingTransitionEpoch?: number): void {
    if (
      existingTransitionEpoch !== undefined &&
      existingTransitionEpoch !== this.model.editorTransitionEpoch
    ) {
      return;
    }
    if (existingTransitionEpoch === undefined) {
      this.beginTransition();
    }
    this.clearReturnTarget();
    this.model.patch({
      currentItem: undefined,
      editorSource: { kind: "none" },
      name: "",
      content: blankPainted(),
      savedBaseline: undefined,
      resetBaseline: undefined,
      notice: undefined,
    });
  }

  private musicTemplateContent(mode: string): MusicProfileContent | undefined {
    const selectedModel = this.model.selectedModel;
    if (
      (selectedModel !== "H617A" && selectedModel !== "H6199") ||
      !mode
    ) {
      return undefined;
    }
    return {
      kind: "music_profile",
      model: selectedModel,
      mode,
      sensitivity: selectedModel === "H6199" ? 100 : 99,
      colour: null,
      calm: ["rhythm", "bloom", "shiny"].includes(mode) ? false : null,
      parameters: {},
    };
  }
}
