import type {
  DeviceCapabilities,
  HomeAssistantEntityState,
  RGB,
} from "./types";

export type NativeLightState = "on" | "off" | "unavailable";

export interface StudioToolbarLayoutState {
  visible: boolean;
  deviceSelector: boolean;
  modeControls: boolean;
  lightControl: boolean;
  settings: boolean;
}

export function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function clampInteger(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return clamp(Math.round(value), minimum, maximum);
}

export function cloneRgb(colour: RGB): RGB {
  return [...colour] as RGB;
}

export function clonePalette(palette: RGB[]): RGB[] {
  return palette.map(cloneRgb);
}

export function sameRgb(left: RGB, right: RGB): boolean {
  return (
    left[0] === right[0] &&
    left[1] === right[1] &&
    left[2] === right[2]
  );
}

export function rgbToHex(colour: RGB): string {
  return `#${colour
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function hexToRgb(value: string): RGB {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

export function compareLabels(left: string, right: string): number {
  return left.localeCompare(right, "en-AU", { sensitivity: "base" });
}

export function showHomeAssistantHeader(
  narrow: boolean,
  dockedSidebar: string | undefined,
  kioskMode: boolean | undefined,
): boolean {
  return kioskMode !== true && (narrow || dockedSidebar === "always_hidden");
}

export function lightControlEntityId(
  device: DeviceCapabilities | undefined,
): string | undefined {
  return device?.light_entity_id ?? undefined;
}

export function studioToolbarLayoutState(
  showDeviceSelector: boolean,
  isAdmin: boolean,
  deviceAvailable: boolean,
  lightEntityId: string | undefined,
): StudioToolbarLayoutState {
  const modeControls = isAdmin && deviceAvailable;
  const lightControl = deviceAvailable && lightEntityId !== undefined;
  const settings = isAdmin && deviceAvailable;
  return {
    visible:
      showDeviceSelector || modeControls || lightControl || settings,
    deviceSelector: showDeviceSelector,
    modeControls,
    lightControl,
    settings,
  };
}

export function classifyLightEntityState(
  states: Record<string, HomeAssistantEntityState> | undefined,
  entityId: string,
): NativeLightState {
  const state = states?.[entityId]?.state;
  if (state === "on" || state === "off") {
    return state;
  }
  return "unavailable";
}

export function lightControlPresentation(
  displayName: string,
  state: NativeLightState,
) {
  const accessibleName = `Control ${displayName} (${state})`;
  return {
    accessibleName,
    className: `light-state-${state}`,
  };
}

export function moreInfoDetail(entityId: string): { entityId: string } {
  return { entityId };
}

export function integrationSettingsPath(
  configurationPath: string,
  configEntryId: string,
): string {
  const path = configurationPath.split("#", 1)[0];
  return `${path}#${new URLSearchParams({
    config_entry: configEntryId,
  }).toString()}`;
}

export function relocatedIndex(
  current: number,
  from: number,
  to: number,
): number;
export function relocatedIndex(
  current: number | undefined,
  from: number,
  to: number,
): number | undefined;
export function relocatedIndex(
  current: number | undefined,
  from: number,
  to: number,
): number | undefined {
  if (current === undefined || from === to) {
    return current;
  }
  if (current === from) {
    return to;
  }
  if (from < to && current > from && current <= to) {
    return current - 1;
  }
  if (to < from && current >= to && current < from) {
    return current + 1;
  }
  return current;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export function errorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return undefined;
}
