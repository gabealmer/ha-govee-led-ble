import { blankAdvancedContent, cloneLayeredSceneContent } from "./advanced-effect-model";
import { newEffectKindForCategory, type CustomEffectListEntry } from "./custom-effect-list";
import { starterBaseline } from "./custom-effect-workflow";
import {
  blankCustomEffect,
  blankPainted,
  blankPaletteDiy,
  blankVideoProfile,
  cloneCustomEffect,
  cloneEditableEffect,
  cloneOpaqueContent,
  clonePaletteDiy,
  cloneSpecialDiy,
  coloursForSegments,
  customKindLabel,
  groupsFromColours,
  isAdvancedEditableContent,
  isCustomEffectContent,
  isEditableEffectContent,
  mergedPaintBrushes,
  PAINTED_SEGMENT_COUNT,
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
  SpecialDiyContent,
  VideoProfileContent,
} from "./types";

interface PanelEditorOptions {
  apiReady(): boolean;
  selectItem(itemId: string): void;
}

interface InitialEffect {
  name: string;
  content: EditableEffectContent;
  selectionIdentity?: string;
  templateLabel?: string;
  customCopyStarted?: boolean;
}

export class PanelEditorController {
  public constructor(
    private readonly model: PanelModel,
    private readonly preview: PanelPreviewController,
    private readonly modal: PanelModalController,
    private readonly options: PanelEditorOptions,
  ) {}

  public beginTransition(): number {
    this.modal.closeForEditorTransition();
    return this.preview.beginEditorTransition();
  }

  public transitionIsCurrent(epoch: number): boolean {
    return this.preview.editorTransitionIsCurrent(epoch);
  }

  public reset(): void {
    this.beginTransition();
    this.model.patch({
      sceneEditorOpen: false, sceneInitialSelection: undefined, currentItem: undefined, savedSceneSelection: undefined,
      templateSourceLabel: undefined, customCopyStarted: false, customTemplateSelection: undefined, name: "",
      content: blankPainted(), savedBaseline: undefined,
    });
  }

  public selectCustomEffectEntry(entry: CustomEffectListEntry): void {
    if (entry.kind === "saved") {
      this.options.selectItem(entry.item.id);
    } else if (entry.kind === "special_diy") {
      this.openEditableTemplate(entry.label, entry.content, entry.key);
    } else if (entry.kind === "music") {
      this.openMusicTemplate(entry.mode, entry.label);
    } else if (entry.kind === "paint") {
      this.newEffect("h617a_painted", undefined, {
        name: entry.label, content: blankPainted(), selectionIdentity: entry.key, customCopyStarted: true,
      });
    } else {
      const catalogue = this.model.modelCatalogue;
      if (!catalogue) return;
      if (this.model.selectedModel === "H617A") {
        const content = blankCustomEffect("h617a_single", catalogue);
        this.newEffect("h617a_single", undefined, {
          name: entry.label, content: { ...content, family: entry.family, variant: entry.variant },
          selectionIdentity: entry.key, customCopyStarted: true,
        });
      } else {
        this.newEffect("palette_diy", undefined, {
          name: entry.label,
          content: blankPaletteDiy(catalogue, this.model.selectedModel!, entry.family, entry.variant),
          selectionIdentity: entry.key,
          customCopyStarted: true,
        });
      }
    }
  }

  public newCustomEffect(category: CustomEffectCategory): void {
    if (category === "music") {
      const mode = this.model.modelCatalogue?.music_modes[0];
      if (mode) this.openMusicTemplate(mode.id, mode.label);
      return;
    }
    const kind = newEffectKindForCategory(this.model.customEffectListContext, category);
    if (kind) this.newEffect(kind);
  }

  public openVideoTemplate(mode: string, label: string): void {
    if (this.model.selectedModel === "H6199") {
      this.openEditableTemplate(label, blankVideoProfile(mode), `template:video:${mode}`);
    }
  }

  public openEditableTemplate(label: string, content: EditableEffectContent, selectionIdentity: string): void {
    this.beginTransition();
    this.model.patch({
      currentItem: undefined, templateSourceLabel: label, customCopyStarted: false,
      customTemplateSelection: selectionIdentity, name: label, content: cloneEditableEffect(content),
      savedBaseline: undefined, notice: undefined,
    });
  }

  public openMusicTemplate(mode: string, label: string): void {
    const selectedModel = this.model.selectedModel;
    if (selectedModel !== "H617A" && selectedModel !== "H6199") return;
    this.beginTransition();
    const content: MusicProfileContent = {
      kind: "music_profile", model: selectedModel, mode, sensitivity: selectedModel === "H6199" ? 100 : 99,
      colour: null, calm: ["rhythm", "bloom", "shiny"].includes(mode) ? false : null, parameters: {},
    };
    this.model.patch({
      currentItem: undefined, templateSourceLabel: undefined, customCopyStarted: true,
      customTemplateSelection: `template:music:${mode}`, name: label, content,
      savedBaseline: starterBaseline(label, content, true), notice: this.model.availabilityNotice(),
    });
  }

  public openDefaultTemplate(existingTransitionEpoch?: number): void {
    this.newEffect("h617a_painted", existingTransitionEpoch, {
      name: "Paint", content: blankPainted(), selectionIdentity: "template:paint", templateLabel: "Paint",
    });
  }

  public openDefaultAvailableTemplate(existingTransitionEpoch?: number): void {
    const catalogue = this.model.modelCatalogue;
    if (this.model.customEffectKindAvailable("h617a_painted")) {
      this.openDefaultTemplate(existingTransitionEpoch);
      return;
    }
    const family = catalogue?.effects.find((effect) => effect.category === "single_layer") ?? catalogue?.effects[0];
    if (this.model.customEffectKindAvailable("h617a_single") && catalogue && family) {
      const variation = family.variations[0];
      const content = blankCustomEffect("h617a_single", catalogue);
      this.newEffect("h617a_single", existingTransitionEpoch, {
        name: family.label, content: { ...content, family: family.family, variant: variation.variant },
        selectionIdentity: `template:single:${family.family}:${variation.variant}`, templateLabel: family.label,
      });
    } else if (this.model.customEffectKindAvailable("palette_diy") && catalogue && family) {
      const variation = family.variations[0];
      this.openEditableTemplate(
        family.label,
        blankPaletteDiy(catalogue, this.model.selectedModel!, family.family, variation.variant),
        `template:single:${family.family}:${variation.variant}`,
      );
    } else if (this.model.customEffectKindAvailable("h617a_multi") && catalogue) {
      this.newEffect("h617a_multi", existingTransitionEpoch, {
        name: "Mix", content: blankCustomEffect("h617a_multi", catalogue),
        selectionIdentity: "template:mix", templateLabel: "Mix",
      });
    } else if (this.model.customEffectKindAvailable("advanced")) {
      this.newEffect("advanced", existingTransitionEpoch, {
        name: "Layered", content: blankAdvancedContent(), selectionIdentity: "template:advanced", templateLabel: "Layered",
      });
    } else {
      this.model.patch({ currentItem: undefined, name: "" });
    }
  }

  public newEffect(kind: NewEffectKind, existingTransitionEpoch?: number, initial?: InitialEffect): void {
    if (existingTransitionEpoch === undefined) this.beginTransition();
    if (
      !this.options.apiReady() || !this.model.isAdmin || !this.model.customEffectKindAvailable(kind) ||
      (kind !== "advanced" && !this.model.modelCatalogue)
    ) return;
    const content = initial?.content ?? (
      kind === "advanced"
        ? blankAdvancedContent()
        : kind === "palette_diy"
          ? blankPaletteDiy(this.model.modelCatalogue!, this.model.selectedModel!)
          : blankCustomEffect(kind, this.model.modelCatalogue!)
    );
    const name = initial?.name ?? `New ${customKindLabel(kind)} effect`;
    const customCopyStarted = initial?.customCopyStarted ?? false;
    this.model.patch({
      currentItem: undefined, templateSourceLabel: initial?.templateLabel, customCopyStarted,
      customTemplateSelection: kind === "advanced" ? undefined : initial?.selectionIdentity ?? (kind === "h617a_painted" ? "template:paint" : undefined),
      name, content, brushUsesBackground: kind === "h617a_painted" ? false : this.model.brushUsesBackground,
      savedBaseline: starterBaseline(name, content, customCopyStarted), notice: this.model.availabilityNotice(),
    });
  }

  public applyLibraryItem(item: LibraryItem): boolean {
    const selection = {
      currentItem: item, templateSourceLabel: undefined, customCopyStarted: false,
      customTemplateSelection: undefined, name: item.name,
    };
    if (item.content.kind === "opaque") {
      this.model.patch({
        ...selection, content: cloneOpaqueContent(item.content), savedBaseline: undefined,
        notice: "This effect definition is preserved, but this editor cannot change or apply it.",
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
      brushUsesBackground: content.kind === "h617a_painted" ? false : this.model.brushUsesBackground,
      notice: this.model.availabilityNotice(),
    });
    return true;
  }

  public clearCurrentAfterDelete(): void {
    this.beginTransition();
    this.model.patch({
      currentItem: undefined, templateSourceLabel: undefined, customCopyStarted: false,
      customTemplateSelection: undefined, name: "", content: blankPainted(), savedBaseline: undefined,
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
      currentItem: detail.item, templateSourceLabel: undefined, customCopyStarted: detail.item === undefined,
      name: detail.name.trim() || "Layered scene template", content: cloneLayeredSceneContent(detail.content),
      savedBaseline: detail.item?.content.kind === "scene_layered" ? serialiseEditable(detail.item.name, detail.item.content) : undefined,
      sceneEditorOpen: true, customTemplateSelection: undefined, notice: undefined,
    });
  }

  public cancelSceneEdit(): void {
    this.beginTransition();
    this.model.patch({ sceneEditorOpen: false, notice: undefined });
  }

  public editTemplate(): void {
    this.prepareTemplateEdit();
  }

  public prepareTemplateEdit(): boolean {
    const source = this.model.templateSourceLabel;
    if (!source) return true;
    if (!this.model.isAdmin || this.model.saving || this.model.deletingCurrentItem) return false;
    this.beginTransition();
    this.model.patch({
      templateSourceLabel: undefined, customTemplateSelection: undefined,
      customCopyStarted: true, name: `Custom ${source}`, savedBaseline: undefined,
    });
    return true;
  }

  public advancedContentChanged(content: AdvancedContent, interaction?: LivePreviewInteraction, scene?: ScenePreviewRequest): void {
    if (!isAdvancedEditableContent(this.model.content) || !this.prepareTemplateEdit()) return;
    this.installEditedContent(updateAdvancedEditorContent(this.model.content, content), interaction, scene);
  }

  public customContentChanged(
    content: CustomEffectContent | PaletteDiyEffectContent | SpecialDiyContent,
    interaction?: LivePreviewInteraction,
  ): void {
    const clone = content.kind === "palette_diy"
      ? clonePaletteDiy(content)
      : content.kind === "special_diy" ? cloneSpecialDiy(content) : cloneCustomEffect(content);
    this.installEditedContent(clone, interaction);
  }

  public musicContentChanged(content: MusicProfileContent, interaction?: LivePreviewInteraction): void {
    this.installEditedContent(cloneMusicProfileContent(content), interaction);
  }

  public videoContentChanged(content: VideoProfileContent, interaction?: LivePreviewInteraction): void {
    this.installEditedContent(cloneVideoProfileContent(content), interaction);
  }

  public nameChanged(name: string): void {
    this.model.patch({ name });
  }

  public paintBrushesChanged(palette: RGB[]): void {
    const paintBrushes = palette.map((colour) => [...colour] as RGB);
    this.model.patch({
      paintBrushes,
      selectedPaintBrush: Math.max(0, Math.min(this.model.selectedPaintBrush, paintBrushes.length - 1)),
      brushUsesBackground: false,
    });
  }

  public paintBrushSelected(index: number): void {
    this.model.patch({ selectedPaintBrush: index, brushUsesBackground: false });
  }

  public toggleBackgroundBrush(): void {
    this.model.patch({ brushUsesBackground: !this.model.brushUsesBackground });
  }

  public backgroundChanged(colour: RGB, interaction: LivePreviewInteraction): void {
    this.updatePaintedContent({ background: [...colour] }, interaction);
  }

  public selectSingleEffect(selected: string): void {
    if (!this.model.customCatalogue || this.model.currentItem?.content.kind === "opaque") return;
    const content = this.model.content;
    if (
      this.model.currentItem &&
      ((content.kind === "h617a_painted" && selected !== "paint") || (content.kind === "h617a_single" && selected === "paint"))
    ) return;
    const selectingTemplate = this.model.templateSourceLabel !== undefined || this.model.customTemplateSelection !== undefined;
    if (selected === "paint") {
      if (content.kind !== "h617a_painted") this.switchCustomMode("h617a_painted");
      this.model.update((model) => {
        if (selectingTemplate) model.customTemplateSelection = "template:paint";
        this.updateGeneratedEffectName(model, "Paint");
      });
      return;
    }
    const family = this.model.modelCatalogue?.effects.find((effect) => effect.id === selected);
    const variation = family?.variations[0];
    if (!family || !variation) return;
    if (this.model.content.kind === "h617a_painted") this.switchCustomMode("h617a_single", false);
    if (this.model.content.kind !== "h617a_single" && this.model.content.kind !== "palette_diy") return;
    this.installEditedContent({ ...this.model.content, family: family.family, variant: variation.variant });
    this.model.update((model) => {
      if (selectingTemplate) model.customTemplateSelection = `template:single:${family.family}:${variation.variant}`;
      this.updateGeneratedEffectName(model, family.label);
    });
  }

  public paintedVariationChanged(effect: PaintedContent["effect"]): void {
    this.updatePaintedContent({ effect }, "committed");
  }

  public setSegmentColour(index: number, interaction: LivePreviewInteraction): void {
    if (this.model.content.kind !== "h617a_painted") return;
    const colours = coloursForSegments(this.model.content);
    colours[index] = this.model.brushUsesBackground ? [...this.model.content.background] : this.model.activePaintBrush;
    this.installEditedContent({
      ...this.model.content, groups: groupsFromColours(colours, this.model.content.background),
    }, interaction);
  }

  public paintAll(): void {
    if (this.model.content.kind !== "h617a_painted") return;
    const colour = this.model.brushUsesBackground ? this.model.content.background : this.model.activePaintBrush;
    this.installEditedContent({
      ...this.model.content,
      groups: groupsFromColours(
        Array.from({ length: PAINTED_SEGMENT_COUNT }, () => [...colour] as RGB),
        this.model.content.background,
      ),
    });
  }

  public resetPaint(): void {
    if (this.model.content.kind === "h617a_painted") {
      this.installEditedContent({ ...this.model.content, groups: [] });
    }
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
      const colour: RGB = current.kind === "h617a_painted"
        ? this.model.activePaintBrush
        : current.palette[0] ? [...current.palette[0]] : [47, 111, 237];
      next = {
        ...blankPainted(), speed: current.speed,
        groups: [{ fill: [...colour], segments: Array.from({ length: PAINTED_SEGMENT_COUNT }, (_, index) => index) }],
      };
      if (current.kind !== "h617a_painted") {
        this.model.paintBrushes = mergedPaintBrushes(current.palette);
        this.model.selectedPaintBrush = 0;
      }
      this.model.brushUsesBackground = false;
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
      model.notice = model.availabilityNotice();
    });
  }

  private installEditedContent(
    content: EditableEffectContent,
    interaction: LivePreviewInteraction = "committed",
    scene?: ScenePreviewRequest,
  ): void {
    this.model.patch({ content });
    this.preview.scheduleEdited(interaction, scene);
  }

  private updateGeneratedEffectName(model: PanelModel, label: string): void {
    if (model.templateSourceLabel) {
      model.templateSourceLabel = label;
      model.name = label;
    } else if (!model.currentItem && /^New .+ effect$/.test(model.name)) {
      model.name = `New ${label} effect`;
    }
  }
}
