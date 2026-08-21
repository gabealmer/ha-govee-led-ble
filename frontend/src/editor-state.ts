import type { CustomEffectCategory, EditableEffectContent } from "./effect-editor-model";

export type EditorOwner =
  | { section: "custom"; category: CustomEffectCategory }
  | { section: "video" }
  | { section: "scenes" };

export type EditorSource =
  | { kind: "none" }
  | {
      kind: "catalogue";
      owner: EditorOwner;
      selectionIdentity: string;
      label: string;
    }
  | { kind: "new"; owner: EditorOwner }
  | { kind: "saved"; owner: EditorOwner; itemId: string }
  | { kind: "scene"; owner: { section: "scenes" }; itemId?: string };

export interface EditorActionVisibility {
  reset: boolean;
  cancel: boolean;
  save: boolean;
  saveAs: boolean;
  delete: boolean;
}

export const NO_EDITOR_SOURCE: EditorSource = { kind: "none" };

export function editorOwnerMatches(
  source: EditorSource,
  section: "custom" | "video" | "scenes",
  customCategory: CustomEffectCategory,
): boolean {
  if (source.kind === "none" || source.owner.section !== section) {
    return false;
  }
  return (
    source.owner.section !== "custom" ||
    source.owner.category === customCategory
  );
}

export function editorActionVisibility(
  source: EditorSource,
  resetDirty: boolean,
  autoSaveEnabled: boolean,
  autoSaveFailed: boolean,
): EditorActionVisibility {
  switch (source.kind) {
    case "catalogue":
      return {
        reset: resetDirty,
        cancel: false,
        save: false,
        saveAs: true,
        delete: false,
      };
    case "new":
      return {
        reset: resetDirty,
        cancel: true,
        save: true,
        saveAs: false,
        delete: false,
      };
    case "saved":
      return {
        reset: resetDirty,
        cancel: false,
        save: !autoSaveEnabled || autoSaveFailed,
        saveAs: true,
        delete: true,
      };
    case "scene":
      return {
        reset: resetDirty,
        cancel: true,
        save: true,
        saveAs: source.itemId !== undefined,
        delete: source.itemId !== undefined,
      };
    case "none":
      return {
        reset: false,
        cancel: false,
        save: false,
        saveAs: false,
        delete: false,
      };
  }
}

export function serialiseEditableContent(
  content: EditableEffectContent,
): string {
  return JSON.stringify(content);
}
