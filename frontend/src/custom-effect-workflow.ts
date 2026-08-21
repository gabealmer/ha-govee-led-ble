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
  "single-layer",
  "multi-layer",
  "music",
  "special-diy",
  "advanced",
];

const CATEGORY_LABELS: Readonly<
  Record<CustomEffectCategory, string>
> = {
  all: "All",
  "my-effects": "My Effects",
  "multi-layer": "Layered Effects",
  music: "Reactive",
  "single-layer": "Effects",
  "special-diy": "Special DIY",
  advanced: "Advanced",
};

const CATEGORY_DISPLAY_ORDER: readonly CustomEffectCategory[] = [
  "single-layer",
  "multi-layer",
  "music",
  "special-diy",
  "advanced",
];

export function customEffectCategories(
  context: CustomEffectListContext,
): { category: CustomEffectCategory; label: string }[] {
  return CATEGORY_DISPLAY_ORDER.filter((category) =>
    customEffectCategoryAvailable(context, category),
  ).map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
  }));
}

export function defaultCustomEffectCategory(
  context: CustomEffectListContext,
): CustomEffectCategory {
  return (
    CATEGORY_PRIORITY.find((category) =>
      customEffectCategoryAvailable(context, category),
    ) ?? "single-layer"
  );
}

export function starterBaseline(
  name: string,
  content: EditableEffectContent,
  customCopyStarted: boolean,
): string | undefined {
  return customCopyStarted ? serialiseEditable(name, content) : undefined;
}
