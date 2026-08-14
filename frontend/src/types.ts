export type RGB = [number, number, number];
export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type CapabilityState = "supported" | "unsupported" | "evidence_gap";
export type ModelSku = "H617A" | "H6199";
export type ReleaseWorkflowId =
  | "native_scenes"
  | "edited_palette_scenes"
  | "layered_scenes"
  | "painted"
  | "single"
  | "multi"
  | "native_music"
  | "video"
  | "palette_diy"
  | "advanced"
  | "workshop"
  | "special_diy";
export type ReleaseWorkflowApplication =
  | "studio"
  | "home_assistant"
  | "planned";

export interface EditorApiInfo {
  api_version: number;
  effect_schema_version: number;
  compiler_version: number;
  limits: {
    effect_name: number;
    effect_document_bytes: number;
    devices: number;
    library_items: number;
    drafts_per_owner: number;
    deployment_records: number;
    scene_catalogue_entries: number;
  };
}

export interface DeviceCapabilities {
  config_entry_id: string;
  model: string;
  display_name: string;
  segment_count: number;
  custom_effects: {
    painted: CapabilityState;
    single: CapabilityState;
    multi: CapabilityState;
    palette_diy: CapabilityState;
    advanced: CapabilityState;
    workshop: CapabilityState;
    special_diy: CapabilityState;
  };
  profiles: {
    music: CapabilityState;
    video: CapabilityState;
  };
  readback: string;
}

export interface PaintedGroup {
  fill: RGB;
  segments: number[];
}

export interface PaintedContent {
  kind: "h617a_painted";
  effect:
    | "cycle"
    | "clockwise"
    | "counter_clockwise"
    | "twinkle"
    | "gradient"
    | "breathe";
  speed: number;
  brightness: number;
  background: RGB;
  groups: PaintedGroup[];
}

export interface SingleContent {
  kind: "h617a_single";
  family: number;
  variant: number;
  speed: number;
  palette: RGB[];
}

export interface EffectPair {
  family: number;
  variant: number;
}

export interface MultiContent {
  kind: "h617a_multi";
  effects: EffectPair[];
  speed: number;
  palette: RGB[];
}

export interface PaletteDiyEffectContent {
  kind: "palette_diy";
  model: ModelSku;
  family: number;
  variant: number;
  speed: number;
  palette: RGB[];
}

export interface MusicProfileContent {
  kind: "music_profile";
  model: ModelSku;
  mode: string;
  sensitivity: number;
  colour: RGB | null;
  calm: boolean | null;
  parameters: JsonObject;
}

export interface RelativeBrightness {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface VideoProfileContent {
  kind: "video_profile";
  model: "H6199";
  mode: "movie" | "game";
  full_screen: boolean;
  saturation: number;
  sound_effects: boolean;
  sound_effects_softness: number;
  white_balance_position: number;
  relative_brightness: RelativeBrightness;
  blank_screen: boolean;
}

export type BrightnessOrder = 0 | 1 | 2 | 3;

export type SelectionType = 0 | 1 | 2 | 3;

export interface AppliedArea {
  start_tenths: number;
  width_tenths: number;
}

export interface Selection {
  type: number;
  param_1: number;
  param_2: number;
}

export interface BrightnessPattern {
  scope_high: number;
  scope_low: number;
  order: number;
  change_speed: number;
  brightest_retention: number;
  darkest_retention: number;
}

export interface Distribution {
  method: number;
  backwards: boolean;
}

export interface Movement {
  enabled: boolean;
  enter_exit: boolean;
  direction: number;
  distance: number;
  speed: number;
  unknown_flags: number;
}

export interface EffectLayer {
  area: AppliedArea;
  selection: Selection;
  brightness_gradient: boolean;
  brightness_patterns: BrightnessPattern[];
  distribution: Distribution;
  colour_speed: number;
  colour_retention: number;
  palette: RGB[];
  selected_movement: Movement;
  overall_movement: Movement;
  priority: number;
  unknown_flags: number;
  excess: string;
}

export interface AdvancedContent {
  kind: "advanced";
  layers: EffectLayer[];
}

export interface WorkshopContent {
  kind: "workshop";
  model: ModelSku;
  template: string;
  effect: {
    layers: EffectLayer[];
  };
  raw_param: string;
  trailing_padding: number;
}

export interface SpecialDiyContent {
  kind: "special_diy";
  model: "H6199";
  template: string;
  family: number;
  variant: number;
  speed: number;
  palette: RGB[];
  raw_payload: string;
  trailing_padding: number;
}

export type CustomEffectContent =
  | PaintedContent
  | SingleContent
  | MultiContent;

export interface PaintedEffectTemplate {
  id: PaintedContent["effect"];
  label: string;
}

export interface PaletteDiyVariation {
  id: string;
  label: string;
  variant: number;
}

export type DiyEffectVariation = PaletteDiyVariation;

export interface PaletteDiyFamily {
  id: string;
  label: string;
  family: number;
  variations: PaletteDiyVariation[];
  supports_multi: boolean;
  rate: "speed" | "sensitivity";
  category: "single_layer";
}

export type DiyEffectFamily = PaletteDiyFamily;

export interface EffectStudioModeOption {
  id: string;
  label: string;
}

export interface WorkshopTemplate {
  id: string;
  label: string;
  source_fixture: string;
  content: WorkshopContent;
}

export interface SpecialDiyTemplate {
  id: string;
  label: string;
  source_fixture: string;
  content: SpecialDiyContent;
}

export interface ReleaseWorkflowCapability {
  id: ReleaseWorkflowId;
  label: string;
  content_kind: string;
  application: ReleaseWorkflowApplication;
}

export interface ModelEffectCatalogue {
  sku: ModelSku;
  painted_effects: PaintedEffectTemplate[];
  effects: PaletteDiyFamily[];
  music_modes: EffectStudioModeOption[];
  video_modes: EffectStudioModeOption[];
  workshop_templates: WorkshopTemplate[];
  special_diy_templates: SpecialDiyTemplate[];
  workflows: ReleaseWorkflowCapability[];
  supports: {
    multi: CapabilityState;
    advanced: CapabilityState;
    workshop: CapabilityState;
    special_diy: CapabilityState;
  };
  limits: {
    palette_min: number;
    palette_max: number;
    multi_max: number;
    music_sensitivity_min: number;
    music_sensitivity_max: number;
  };
  apply: {
    painted: CapabilityState;
    single: CapabilityState;
    multi: CapabilityState;
    palette_diy: CapabilityState;
    workshop: CapabilityState;
    special_diy: CapabilityState;
  };
}

export interface EffectStudioCatalogue extends ModelEffectCatalogue {
  schema_version: 5;
  sku: "H617A";
  models: Record<ModelSku, ModelEffectCatalogue>;
}

export type CustomEffectCatalogue = EffectStudioCatalogue;

export interface CatalogueRef {
  sku: string;
  scene_id: number;
  effect_id: number;
  catalogue_schema_version: number;
}

export interface BuiltinSceneContent {
  kind: "scene_builtin";
  template: CatalogueRef;
  speed_index: number | null;
}

export interface SceneStepContent {
  value: number;
  colour: RGB;
  inline_colour: RGB | null;
}

export interface PaletteSceneContent {
  kind: "scene_palette";
  template: CatalogueRef;
  layout: 0 | 1;
  brightness_flag: boolean;
  steps: SceneStepContent[];
  palette: RGB[];
  speed_index: number | null;
  config_flags?: number;
  trailing_padding?: number;
}

export interface LayeredSceneContent {
  kind: "scene_layered";
  template: CatalogueRef;
  effect: {
    layers: EffectLayer[];
  };
  speed_index: number | null;
  raw_param: string;
  trailing_padding?: number;
}

export type KnownEffectContent =
  | CustomEffectContent
  | PaletteDiyEffectContent
  | MusicProfileContent
  | VideoProfileContent
  | AdvancedContent
  | WorkshopContent
  | SpecialDiyContent
  | BuiltinSceneContent
  | PaletteSceneContent
  | LayeredSceneContent;

export interface OpaqueContent {
  kind: "opaque";
  source_kind: string;
  body: Record<string, unknown>;
}

export type EffectContent = KnownEffectContent | OpaqueContent;

export interface LibraryItem {
  schema_version: number;
  id: string;
  revision: number;
  name: string;
  content: EffectContent;
  provenance: Record<string, unknown>;
  extensions: Record<string, unknown>;
  target_hint?: {
    model: string | null;
    segment_count: number | null;
  };
}

export interface LibrarySummary {
  id: string;
  revision: number;
  name: string;
  kind: string;
  model?: ModelSku;
  template?: CatalogueRef;
}

export interface LibrarySnapshot {
  library_revision: number;
  items: LibrarySummary[];
}

export interface EffectDraft {
  id: string;
  owner_id: string;
  revision: number;
  item: LibraryItem;
  updated_at: string;
  selected_config_entry_id: string | null;
  base_item_id: string | null;
  base_item_revision: number | null;
}

export interface DraftSummary {
  id: string;
  revision: number;
  name: string;
  updated_at: string;
  selected_config_entry_id: string | null;
}

export const DEPLOYMENT_PHASES = [
  "compiling",
  "pending",
  "uploading",
  "activating",
  "verifying",
  "confirmed",
  "applied",
  "uncertain",
  "recovering",
  "failed",
  "interrupted",
  "unknown",
] as const;

export type DeploymentPhase = (typeof DEPLOYMENT_PHASES)[number];

export const IN_FLIGHT_DEPLOYMENT_PHASES = [
  "compiling",
  "pending",
  "uploading",
  "activating",
  "verifying",
  "recovering",
] as const satisfies readonly DeploymentPhase[];

export interface DeploymentRecord {
  operation_id: string;
  config_entry_id: string;
  diy_code: number | null;
  content_kind: string;
  target_mode: "custom" | "scene" | "music" | "video";
  target_effect: string | null;
  phase: DeploymentPhase;
  updated_at: string;
  item_id: string | null;
  item_revision: number | null;
  error_code: string | null;
  progress_current: number;
  progress_total: number;
  verification_confidence:
    | "exact_session"
    | "activation_match"
    | "settings_match"
    | "mode_match"
    | "write_completed"
    | "unknown";
}

export interface DeploymentSnapshot {
  revision: number;
  deployments: DeploymentRecord[];
}

export interface SceneCategory {
  id: number;
  name: string;
}

export type SceneParameterKind = "none" | "palette" | "layers" | "opaque";

export interface SceneSummary {
  scene_id: number;
  effect_id: number;
  category_id: number;
  category: string;
  name: string;
  variant: string;
  display_name: string;
  scene_type: number;
  parameter_kind: SceneParameterKind;
  speed: {
    option_count: number;
    default_index: number;
  } | null;
}

export interface SceneCatalogue {
  schema_version: number;
  sku: string;
  enabled: boolean;
  categories: SceneCategory[];
  scenes: SceneSummary[];
}

export interface SceneDetail {
  scene: SceneSummary;
  content: BuiltinSceneContent | PaletteSceneContent | LayeredSceneContent;
}

export interface HomeAssistant {
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  connection: {
    subscribeMessage<T>(
      callback: (event: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void>;
  };
  user?: {
    is_admin: boolean;
  };
}

export interface PanelConfig {
  config?: {
    configuration_path?: string;
  };
}
