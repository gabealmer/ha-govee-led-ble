import {
  customEffectCategoryAvailable,
  type CustomEffectListContext,
} from "./custom-effect-list";
import {
  type CustomEffectCategory,
  type EditableEffectContent,
  serialiseEditable,
} from "./effect-editor-model";

const CATEGORY_PRIORITY: readonly Exclude<
  CustomEffectCategory,
  "all"
>[] = [
  "my-effects",
  "single-layer",
  "multi-layer",
  "advanced",
  "music",
  "special-diy",
];

export function defaultCustomEffectCategory(
  context: CustomEffectListContext,
): CustomEffectCategory {
  return (
    CATEGORY_PRIORITY.find((category) =>
      customEffectCategoryAvailable(context, category),
    ) ?? "all"
  );
}

export function showCustomEffectSelector(
  hasCurrentItem: boolean,
  customCopyStarted: boolean,
  templateSourceLabel: string | undefined,
): boolean {
  return (
    !hasCurrentItem &&
    !customCopyStarted &&
    templateSourceLabel === undefined
  );
}

export function starterBaseline(
  name: string,
  content: EditableEffectContent,
  customCopyStarted: boolean,
): string | undefined {
  return customCopyStarted ? serialiseEditable(name, content) : undefined;
}
