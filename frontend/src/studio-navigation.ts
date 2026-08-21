import type {
  DeviceCapabilities,
  EffectUserState,
  LibrarySummary,
} from "./types";
import type { CustomEffectCategory } from "./effect-editor-model";

const PANEL_PATH = "/ha-govee-led-ble";
const DEVICE_ROUTE = `${PANEL_PATH}/editor`;
export type StudioSection = "video" | "scenes" | "custom";
export interface StudioNavigationItem {
  section: StudioSection;
  label: string;
  category?: CustomEffectCategory;
}
export type ActiveStudioContext =
  | { kind: "saved"; item: LibrarySummary }
  | { kind: "native-scene"; effect: string }
  | { kind: "root" };

export function deviceIdFromEditorPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/ha-govee-led-ble\/editor\/([^/]+)\/?$/);
  if (!match?.[1]) {
    return undefined;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

export function editorDevicePath(deviceId: string): string {
  return `${DEVICE_ROUTE}/${encodeURIComponent(deviceId)}`;
}

export function studioNavigationItems(
  videoAvailable: boolean,
  customCategories: readonly {
    category: CustomEffectCategory;
    label: string;
  }[],
): StudioNavigationItem[] {
  return [
    { section: "scenes", label: "Scenes" },
    ...(videoAvailable
      ? [{ section: "video" as const, label: "Video" }]
      : []),
    ...customCategories.map(({ category, label }) => ({
      section: "custom" as const,
      category,
      label,
    })),
  ];
}

export function shouldOpenVideoSelection(
  section: StudioSection,
  contentKind: string,
): boolean {
  return section === "video" && contentKind !== "video_profile";
}

export function initialDeviceId(
  pathname: string,
  devices: readonly DeviceCapabilities[],
  rememberedDeviceId?: string | null,
): string | undefined {
  const linkedDeviceId = deviceIdFromEditorPath(pathname);
  if (linkedDeviceId !== undefined) {
    return linkedDeviceId;
  }
  if (
    rememberedDeviceId &&
    devices.some((device) => device.config_entry_id === rememberedDeviceId)
  ) {
    return rememberedDeviceId;
  }
  return devices[0]?.config_entry_id;
}

export function rememberedStudioSection(
  navigation: EffectUserState["navigation"],
  available: {
    custom: boolean;
    video: boolean;
  },
): StudioSection {
  const section = navigation.section;
  if (section === "video" && available.video) {
    return section;
  }
  if (section === "scenes") {
    return section;
  }
  if (section === "custom" && available.custom) {
    return section;
  }
  return available.custom ? "custom" : "scenes";
}

export function activeStudioContext(
  device: DeviceCapabilities | undefined,
  items: readonly LibrarySummary[],
  itemAvailable: (item: LibrarySummary) => boolean,
): ActiveStudioContext {
  const active = device?.active_state;
  const hint = active?.active_effect;
  if (hint) {
    if (
      hint.source_kind === "saved_effect" &&
      hint.item_id &&
      hint.confidence !== "unknown"
    ) {
      const item = items.find(
        (candidate) =>
          candidate.id === hint.item_id &&
          candidate.content_hash === hint.content_hash &&
          itemAvailable(candidate),
      );
      if (item) {
        return { kind: "saved", item };
      }
    }
    return { kind: "root" };
  }
  if (active?.mode === "scene" && active.effect) {
    return { kind: "native-scene", effect: active.effect };
  }
  return { kind: "root" };
}
