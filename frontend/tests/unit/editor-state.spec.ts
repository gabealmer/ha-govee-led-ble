import { expect, test } from "vitest";

import {
  editorActionVisibility,
  editorOwnerMatches,
  type EditorSource,
} from "../../src/editor-state";

const catalogue: EditorSource = {
  kind: "catalogue",
  owner: { section: "custom", category: "single-layer" },
  selectionIdentity: "template:paint",
  label: "Paint",
};
const saved: EditorSource = {
  kind: "saved",
  owner: { section: "custom", category: "music" },
  itemId: "saved-a",
};

test("editor actions follow the explicit source instead of inferred template flags", () => {
  expect(editorActionVisibility(catalogue, false, false, false)).toEqual({
    reset: false,
    cancel: false,
    save: false,
    saveAs: true,
    delete: false,
  });
  expect(
    editorActionVisibility(
      {
        kind: "new",
        owner: { section: "custom", category: "advanced" },
      },
      true,
      false,
      false,
    ),
  ).toEqual({
    reset: true,
    cancel: true,
    save: true,
    saveAs: false,
    delete: false,
  });
  expect(editorActionVisibility(saved, true, true, false)).toEqual({
    reset: true,
    cancel: false,
    save: false,
    saveAs: true,
    delete: true,
  });
  expect(editorActionVisibility(saved, true, true, true).save).toBe(true);
});

test("editor ownership rejects content from another category or section", () => {
  expect(editorOwnerMatches(catalogue, "custom", "single-layer")).toBe(true);
  expect(editorOwnerMatches(catalogue, "custom", "music")).toBe(false);
  expect(editorOwnerMatches(catalogue, "video", "single-layer")).toBe(false);
  expect(
    editorOwnerMatches(
      {
        kind: "catalogue",
        owner: { section: "video" },
        selectionIdentity: "template:video:movie",
        label: "Movie",
      },
      "video",
      "single-layer",
    ),
  ).toBe(true);
});
