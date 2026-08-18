import type { EffectStudioApi } from "./api";
import {
  cloneEditableEffect,
  isEditableEffectContent,
  libraryItemSyncResult,
  sameLibraryItemVersion,
  serialiseEditable,
  upsertSummary,
} from "./effect-editor-model";
import { PanelEditorController } from "./panel-editor-controller";
import { PanelModalController } from "./panel-modal-controller";
import { PanelModel } from "./panel-model";
import type { LibraryItem, LibrarySnapshot } from "./types";
import { errorCode, errorMessage } from "./ui-utils";

interface PanelLibraryOptions {
  api(): EffectStudioApi | undefined;
  rememberNavigation(): void;
}

export class PanelLibraryController {
  public constructor(
    private readonly model: PanelModel,
    private readonly editor: PanelEditorController,
    private readonly modal: PanelModalController,
    private readonly options: PanelLibraryOptions,
  ) {}

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
    if (selected && this.editor.transitionIsCurrent(transitionEpoch)) {
      this.model.patch({ notice: "Loaded the latest saved version." });
    }
  }

  public sceneItemSaved(item: LibraryItem): void {
    this.model.patch({ library: { items: upsertSummary(this.model.library.items, item) } });
  }

  public async selectItem(itemId: string, existingTransitionEpoch?: number): Promise<boolean> {
    const transitionEpoch = existingTransitionEpoch ?? this.editor.beginTransition();
    const api = this.options.api();
    if (!api) return false;
    try {
      const item = await api.item(itemId);
      return this.editor.transitionIsCurrent(transitionEpoch) && this.editor.applyLibraryItem(item);
    } catch (error) {
      if (this.editor.transitionIsCurrent(transitionEpoch)) this.model.patch({ notice: errorMessage(error) });
      return false;
    }
  }

  public async confirmDelete(): Promise<void> {
    const candidate = this.modal.deleteCandidate;
    const api = this.options.api();
    if (!candidate || !api || !this.model.isAdmin || this.model.deletingItemId !== undefined) return;
    this.modal.takeDeleteCandidate();
    this.model.patch({ deletingItemId: candidate.id, notice: undefined });
    try {
      await api.deleteItem(candidate);
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
          this.model.patch({ library: await api.library() });
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
    const api = this.options.api();
    if (
      !api || !this.model.isAdmin || !this.model.dirty || this.model.saving ||
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
        ? await api.updateItem(originatingItem, name, content)
        : await api.createItem(name, content);
      if (!isEditableEffectContent(result.content)) {
        throw new Error("The saved effect returned an unsupported definition.");
      }
      const savedContent = result.content;
      this.model.patch({ library: { items: upsertSummary(this.model.library.items, result) } });
      const originIsCurrent =
        this.editor.transitionIsCurrent(transitionEpoch) &&
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
        if (savingSceneEditor && savedContent.kind === "scene_layered") this.options.rememberNavigation();
      }
      const savedResultIsCurrent =
        this.editor.transitionIsCurrent(transitionEpoch) &&
        sameLibraryItemVersion(this.model.currentItem, result) &&
        isEditableEffectContent(this.model.content) &&
        serialiseEditable(this.model.name, this.model.content) === serialiseEditable(result.name, savedContent);
      if (savedResultIsCurrent) this.model.patch({ notice: undefined });
    } catch (error) {
      if (errorCode(error) === "conflict") {
        const conflictNotice = "This effect or library changed elsewhere. Reload before saving.";
        if (this.editor.transitionIsCurrent(transitionEpoch)) this.model.patch({ notice: conflictNotice });
        try {
          this.model.patch({ library: await api.library() });
        } catch (refreshError) {
          if (this.editor.transitionIsCurrent(transitionEpoch)) {
            this.model.patch({ notice: `${conflictNotice} Library refresh failed: ${errorMessage(refreshError)}` });
          }
        }
      } else if (this.editor.transitionIsCurrent(transitionEpoch)) {
        this.model.patch({ notice: `Save failed: ${errorMessage(error)}` });
      }
    } finally {
      this.model.patch({ saving: false });
    }
  }
}
