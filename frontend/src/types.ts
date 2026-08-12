export type RGB = [number, number, number];

export type CapabilityState = "supported" | "unsupported" | "evidence_gap";

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
    advanced: CapabilityState;
  };
  readback: string;
}

export interface PaintedGroup {
  fill: RGB;
  segments: number[];
}

export interface PaintedContent {
  kind: "h617a_painted";
  effect: "clockwise" | "counter_clockwise";
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

export type CustomEffectContent =
  | PaintedContent
  | SingleContent
  | MultiContent;

export interface DiyEffectTemplate {
  id: string;
  label: string;
  family: number;
  variant: number;
}

export interface CustomEffectCatalogue {
  schema_version: number;
  sku: "H617A";
  effects: DiyEffectTemplate[];
  limits: {
    palette_min: number;
    palette_max: number;
    multi_max: number;
  };
  apply: {
    single: CapabilityState;
    multi: CapabilityState;
  };
}

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

export interface LayeredSceneContent {
  kind: "scene_layered";
  template: CatalogueRef;
  effect: {
    layers: EffectLayer[];
  };
  speed_index: number | null;
  raw_param: string;
}

export type KnownEffectContent =
  | CustomEffectContent
  | AdvancedContent
  | BuiltinSceneContent
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

export type DeploymentPhase =
  | "pending"
  | "uploading"
  | "verifying"
  | "confirmed"
  | "failed"
  | "interrupted"
  | "unknown";

export interface DeploymentRecord {
  operation_id: string;
  config_entry_id: string;
  diy_code: number;
  phase: DeploymentPhase;
  updated_at: string;
  item_id: string | null;
  item_revision: number | null;
  error_code: string | null;
  progress_current: number;
  progress_total: number;
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
  content: BuiltinSceneContent | LayeredSceneContent;
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
