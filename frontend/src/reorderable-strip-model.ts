export interface ReorderableStripItem {
  key: string;
  label: string;
  ariaLabel: string;
  ariaDescription?: string;
  colour?: string;
  removeReady?: boolean;
  disabled?: boolean;
  id?: string;
  ariaControls?: string;
}

export type ReorderableStripItemRole = "button" | "tab";

export interface ReorderableStripModel {
  listRole?: "tablist";
  addAction?: {
    label: string;
    disabled: boolean;
  };
}

export type ReorderableStripKeyboardAction =
  | {
      kind: "select";
      index: number;
      focusIndex: number;
    }
  | {
      kind: "reorder";
      from: number;
      to: number;
      focusIndex: number;
    };

export function reorderableStripModel(
  itemRole: ReorderableStripItemRole,
  addLabel: string,
  addDisabled: boolean,
  addHidden: boolean,
): ReorderableStripModel {
  return {
    listRole: itemRole === "tab" ? "tablist" : undefined,
    addAction: addHidden
      ? undefined
      : {
          label: addLabel,
          disabled: addDisabled,
        },
  };
}

export function reorderableStripKeyboardAction(
  index: number,
  key: string,
  itemCount: number,
  reorderDisabled: boolean,
  itemRole: ReorderableStripItemRole,
): ReorderableStripKeyboardAction | undefined {
  if (key !== "ArrowLeft" && key !== "ArrowRight") {
    return undefined;
  }
  const target = index + (key === "ArrowLeft" ? -1 : 1);
  if (target < 0 || target >= itemCount) {
    return undefined;
  }
  if (reorderDisabled) {
    return itemRole === "tab"
      ? {
          kind: "select",
          index: target,
          focusIndex: target,
        }
      : undefined;
  }
  return {
    kind: "reorder",
    from: index,
    to: target,
    focusIndex: target,
  };
}
