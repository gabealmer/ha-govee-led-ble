import type {
  AdvancedContent,
  BuiltinSceneContent,
  CapabilityState,
  CustomEffectCatalogue,
  DeploymentRecord,
  DeploymentSnapshot,
  DeviceCapabilities,
  DraftSummary,
  EditorApiInfo,
  EffectContent,
  EffectDraft,
  EffectLayer,
  HomeAssistant,
  KnownEffectContent,
  LayeredSceneContent,
  LibraryItem,
  LibrarySnapshot,
  PaletteSceneContent,
  RGB,
  SceneCatalogue,
  SceneDetail,
  SceneSummary,
} from "./types";

export const EDITOR_API_VERSION = 1;
export const EFFECT_SCHEMA_VERSION = 1;
export const EFFECT_COMPILER_VERSION = 1;
export const MAX_EFFECT_NAME_LENGTH = 128;
export const MAX_EFFECT_DOCUMENT_BYTES = 65_536;
export const MAX_EDITOR_DEVICES = 512;
export const MAX_LIBRARY_ITEMS = 256;
export const MAX_DRAFTS_PER_OWNER = 32;
export const MAX_DEPLOYMENT_RECORDS = 128;
export const MAX_SCENE_CATALOGUE_ENTRIES = 512;

const MAX_IDENTIFIER_LENGTH = 255;
const MAX_TIMESTAMP_LENGTH = 64;
const MAX_CATALOGUE_BYTES = 262_144;
const MAX_JSON_DEPTH = 16;
const MAX_JSON_NODES = 4096;
const MAX_CATALOGUE_JSON_NODES = 16_384;
const MAX_JSON_COLLECTION_ITEMS = 1024;
const MAX_JSON_STRING_LENGTH = 16_384;
const MAX_SAFE_REVISION = Number.MAX_SAFE_INTEGER;
// The backend only round trips reserved config bit 3 of a type-1 scene.
const PALETTE_CONFIG_RESERVED_MASK = 0x08;
// The A3 line count is a u1, so a framed scene parameter spans at most 255 lines of 17 bytes.
const SCENE_TRAILING_PADDING_MAX = 0xff * 17;
// The packed movement and layer-flag bytes assign these bits to explicit fields, so canonical
// unknown_flags may only carry the complementary reserved bits the wire form masks in.
const MOVEMENT_UNKNOWN_FLAGS_MASK = 0xe8;
const LAYER_UNKNOWN_FLAGS_MASK = 0xfd;

type WireOpaqueContent = Record<string, unknown> & { kind: string };
export type WireEffectContent = KnownEffectContent | WireOpaqueContent;
export type WireLibraryItem = Omit<LibraryItem, "content"> & {
  content: WireEffectContent;
};
export type WireEffectDraft = Omit<EffectDraft, "item"> & {
  item: WireLibraryItem;
};

export function decodeEditorApiInfo(value: unknown): EditorApiInfo {
  const info = objectValue(value, "editor info");
  const limits = objectValue(info.limits, "editor limits");
  return {
    api_version: integerValue(info.api_version, "API version", 1),
    effect_schema_version: integerValue(
      info.effect_schema_version,
      "effect schema version",
      1,
    ),
    compiler_version: integerValue(
      info.compiler_version,
      "compiler version",
      1,
    ),
    limits: {
      effect_name: exactInteger(
        limits.effect_name,
        MAX_EFFECT_NAME_LENGTH,
        "effect-name limit",
      ),
      effect_document_bytes: exactInteger(
        limits.effect_document_bytes,
        MAX_EFFECT_DOCUMENT_BYTES,
        "effect-document limit",
      ),
      devices: exactInteger(
        limits.devices,
        MAX_EDITOR_DEVICES,
        "device limit",
      ),
      library_items: exactInteger(
        limits.library_items,
        MAX_LIBRARY_ITEMS,
        "library-item limit",
      ),
      drafts_per_owner: exactInteger(
        limits.drafts_per_owner,
        MAX_DRAFTS_PER_OWNER,
        "draft limit",
      ),
      deployment_records: exactInteger(
        limits.deployment_records,
        MAX_DEPLOYMENT_RECORDS,
        "deployment limit",
      ),
      scene_catalogue_entries: exactInteger(
        limits.scene_catalogue_entries,
        MAX_SCENE_CATALOGUE_ENTRIES,
        "scene catalogue limit",
      ),
    },
  };
}

export function decodeDevices(value: unknown): DeviceCapabilities[] {
  const devices = arrayValue(value, "devices", MAX_EDITOR_DEVICES).map((item, index) => {
    const device = objectValue(item, `devices[${index}]`);
    const effects = objectValue(
      device.custom_effects,
      `devices[${index}].custom_effects`,
    );
    return {
      config_entry_id: boundedString(
        device.config_entry_id,
        `devices[${index}].config_entry_id`,
        MAX_IDENTIFIER_LENGTH,
      ),
      model: boundedString(
        device.model,
        `devices[${index}].model`,
        MAX_IDENTIFIER_LENGTH,
      ),
      display_name: boundedString(
        device.display_name,
        `devices[${index}].display_name`,
        MAX_IDENTIFIER_LENGTH,
      ),
      segment_count: integerValue(
        device.segment_count,
        `devices[${index}].segment_count`,
        0,
        65_535,
      ),
      custom_effects: {
        painted: capabilityValue(effects.painted, "painted capability"),
        single: capabilityValue(effects.single, "single capability"),
        multi: capabilityValue(effects.multi, "multi capability"),
        advanced: capabilityValue(effects.advanced, "advanced capability"),
      },
      readback: boundedString(
        device.readback,
        `devices[${index}].readback`,
        MAX_IDENTIFIER_LENGTH,
      ),
    };
  });
  requireUnique(devices, (device) => device.config_entry_id, "device IDs");
  return devices;
}

export function decodeCustomCatalogue(value: unknown): CustomEffectCatalogue {
  assertBoundedJson(value, "custom-effect catalogue", MAX_EFFECT_DOCUMENT_BYTES);
  const catalogue = objectValue(value, "custom-effect catalogue");
  const limits = objectValue(catalogue.limits, "custom-effect limits");
  const apply = objectValue(catalogue.apply, "custom-effect Apply capabilities");
  return {
    schema_version: integerValue(catalogue.schema_version, "catalogue schema", 1),
    sku: stringValue(catalogue.sku, "catalogue SKU") as "H617A",
    effects: arrayValue(
      catalogue.effects,
      "custom-effect templates",
      MAX_JSON_COLLECTION_ITEMS,
    ).map((item, index) => {
      const effect = objectValue(item, `custom-effect templates[${index}]`);
      return {
        id: boundedString(effect.id, "template ID", MAX_IDENTIFIER_LENGTH),
        label: boundedString(
          effect.label,
          "template label",
          MAX_EFFECT_NAME_LENGTH,
        ),
        family: integerValue(effect.family, "template family", 0, 255),
        variant: integerValue(effect.variant, "template variant", 0, 255),
      };
    }),
    limits: {
      palette_min: integerValue(limits.palette_min, "minimum palette", 1, 255),
      palette_max: integerValue(limits.palette_max, "maximum palette", 1, 255),
      multi_max: integerValue(limits.multi_max, "maximum Multi effects", 1, 255),
    },
    apply: {
      single: capabilityValue(apply.single, "Single Apply capability"),
      multi: capabilityValue(apply.multi, "Multi Apply capability"),
    },
  };
}

export function decodeLibrarySnapshot(value: unknown): LibrarySnapshot {
  const snapshot = objectValue(value, "library snapshot");
  const decoded: LibrarySnapshot = {
    library_revision: revisionValue(
      snapshot.library_revision,
      "library revision",
      0,
    ),
    items: arrayValue(
      snapshot.items,
      "library items",
      MAX_LIBRARY_ITEMS,
    ).map((item, index) => {
      const summary = objectValue(item, `library items[${index}]`);
      const template =
        summary.template === undefined
          ? undefined
          : catalogueRef(summary.template, `library items[${index}].template`);
      return {
        id: boundedString(summary.id, "library item ID", MAX_IDENTIFIER_LENGTH),
        revision: revisionValue(summary.revision, "library item revision", 1),
        name: boundedString(
          summary.name,
          "library item name",
          MAX_EFFECT_NAME_LENGTH,
        ),
        kind: boundedString(
          summary.kind,
          "library item kind",
          MAX_IDENTIFIER_LENGTH,
        ),
        ...(template ? { template } : {}),
      };
    }),
  };
  requireUnique(decoded.items, (item) => item.id, "library item IDs");
  return decoded;
}

export function decodeLibraryItem(value: unknown): LibraryItem {
  assertBoundedJson(value, "library item", MAX_EFFECT_DOCUMENT_BYTES);
  const item = objectValue(value, "library item");
  const target =
    item.target_hint === undefined
      ? undefined
      : objectValue(item.target_hint, "target hint");
  return {
    schema_version: exactInteger(
      item.schema_version,
      EFFECT_SCHEMA_VERSION,
      "effect schema version",
    ),
    id: boundedString(item.id, "effect ID", MAX_IDENTIFIER_LENGTH),
    revision: revisionValue(item.revision, "effect revision", 1),
    name: boundedString(item.name, "effect name", MAX_EFFECT_NAME_LENGTH),
    content: decodeEffectContent(item.content),
    provenance: boundedRecord(item.provenance, "effect provenance"),
    extensions: boundedRecord(item.extensions, "effect extensions"),
    ...(target
      ? {
          target_hint: {
            model:
              target.model === null
                ? null
                : boundedString(
                    target.model,
                    "target model",
                    MAX_IDENTIFIER_LENGTH,
                  ),
            segment_count:
              target.segment_count === null
                ? null
                : integerValue(
                    target.segment_count,
                    "target segment count",
                    1,
                    65_535,
                  ),
          },
        }
      : {}),
  };
}

export function decodeDraftSummaries(value: unknown): DraftSummary[] {
  const drafts = arrayValue(value, "draft summaries", MAX_DRAFTS_PER_OWNER).map(
    (item, index) => {
      const draft = objectValue(item, `draft summaries[${index}]`);
      return {
        id: boundedString(draft.id, "draft ID", MAX_IDENTIFIER_LENGTH),
        revision: revisionValue(draft.revision, "draft revision", 1),
        name: boundedString(draft.name, "draft name", MAX_EFFECT_NAME_LENGTH),
        updated_at: timestampString(
          draft.updated_at,
          "draft timestamp",
        ),
        selected_config_entry_id: nullableBoundedString(
          draft.selected_config_entry_id,
          "draft config entry ID",
        ),
      };
    },
  );
  requireUnique(drafts, (draft) => draft.id, "draft IDs");
  return drafts;
}

export function decodeDraft(value: unknown): EffectDraft {
  const draft = objectValue(value, "effect draft");
  return {
    id: boundedString(draft.id, "draft ID", MAX_IDENTIFIER_LENGTH),
    owner_id: boundedString(
      draft.owner_id,
      "draft owner",
      MAX_IDENTIFIER_LENGTH,
    ),
    revision: revisionValue(draft.revision, "draft revision", 1),
    item: decodeLibraryItem(draft.item),
    updated_at: timestampString(
      draft.updated_at,
      "draft timestamp",
    ),
    selected_config_entry_id: nullableBoundedString(
      draft.selected_config_entry_id,
      "draft config entry ID",
    ),
    base_item_id: nullableBoundedString(
      draft.base_item_id,
      "draft base item ID",
    ),
    base_item_revision:
      draft.base_item_revision === null
        ? null
        : revisionValue(
            draft.base_item_revision,
            "draft base item revision",
            1,
          ),
  };
}

export function decodeDeployment(value: unknown): DeploymentRecord {
  const deployment = objectValue(value, "deployment");
  const phase = stringValue(deployment.phase, "deployment phase");
  if (
    phase !== "pending" &&
    phase !== "uploading" &&
    phase !== "verifying" &&
    phase !== "confirmed" &&
    phase !== "failed" &&
    phase !== "interrupted" &&
    phase !== "unknown"
  ) {
    invalid("deployment phase is invalid");
  }
  const decoded: DeploymentRecord = {
    operation_id: boundedString(
      deployment.operation_id,
      "deployment operation ID",
      MAX_IDENTIFIER_LENGTH,
    ),
    config_entry_id: boundedString(
      deployment.config_entry_id,
      "deployment config entry ID",
      MAX_IDENTIFIER_LENGTH,
    ),
    diy_code: integerValue(deployment.diy_code, "deployment DIY code", 0, 65_535),
    phase,
    updated_at: timestampString(
      deployment.updated_at,
      "deployment timestamp",
    ),
    item_id: nullableBoundedString(deployment.item_id, "deployment item ID"),
    item_revision:
      deployment.item_revision === null
        ? null
        : revisionValue(
            deployment.item_revision,
            "deployment item revision",
            1,
          ),
    error_code: nullableBoundedString(
      deployment.error_code,
      "deployment error code",
    ),
    progress_current: integerValue(
      deployment.progress_current,
      "deployment progress",
      0,
      1024,
    ),
    progress_total: integerValue(
      deployment.progress_total,
      "deployment progress total",
      0,
      1024,
    ),
  };
  if (decoded.progress_current > decoded.progress_total) {
    invalid("deployment progress exceeds its total");
  }
  return decoded;
}

export function decodeDeploymentSnapshot(value: unknown): DeploymentSnapshot {
  const snapshot = objectValue(value, "deployment snapshot");
  const decoded = {
    revision: revisionValue(snapshot.revision, "deployment revision", 0),
    deployments: arrayValue(
      snapshot.deployments,
      "deployments",
      MAX_DEPLOYMENT_RECORDS,
    ).map(decodeDeployment),
  };
  requireUnique(
    decoded.deployments,
    (deployment) => deployment.operation_id,
    "deployment operation IDs",
  );
  return decoded;
}

export function decodeSceneCatalogue(value: unknown): SceneCatalogue {
  assertBoundedJson(
    value,
    "scene catalogue",
    MAX_CATALOGUE_BYTES,
    MAX_CATALOGUE_JSON_NODES,
  );
  const catalogue = objectValue(value, "scene catalogue");
  return {
    schema_version: integerValue(
      catalogue.schema_version,
      "scene catalogue schema",
      1,
    ),
    sku: boundedString(catalogue.sku, "scene catalogue SKU", MAX_IDENTIFIER_LENGTH),
    enabled: booleanValue(catalogue.enabled, "scene catalogue enabled"),
    categories: arrayValue(
      catalogue.categories,
      "scene categories",
      MAX_JSON_COLLECTION_ITEMS,
    ).map((item, index) => {
      const category = objectValue(item, `scene categories[${index}]`);
      return {
        id: integerValue(category.id, "scene category ID", 0, 65_535),
        name: boundedString(
          category.name,
          "scene category name",
          MAX_EFFECT_NAME_LENGTH,
        ),
      };
    }),
    scenes: arrayValue(
      catalogue.scenes,
      "scenes",
      MAX_SCENE_CATALOGUE_ENTRIES,
    ).map(decodeSceneSummary),
  };
}

export function decodeSceneDetail(value: unknown): SceneDetail {
  const detail = objectValue(value, "scene detail");
  assertBoundedJson(
    { scene: detail.scene, content: detail.content },
    "scene detail",
    MAX_EFFECT_DOCUMENT_BYTES,
  );
  const content = decodeEffectContent(detail.content);
  if (
    content.kind !== "scene_builtin" &&
    content.kind !== "scene_palette" &&
    content.kind !== "scene_layered"
  ) {
    invalid("scene detail content is unsupported");
  }
  const scene = decodeSceneSummary(detail.scene);
  return { scene, content };
}

export function decodeEffectContent(value: unknown): EffectContent {
  assertBoundedJson(value, "effect content", MAX_EFFECT_DOCUMENT_BYTES);
  const content = objectValue(value, "effect content");
  const kind = boundedString(
    content.kind,
    "effect content kind",
    MAX_IDENTIFIER_LENGTH,
  );
  switch (kind) {
    case "h617a_painted":
      return {
        kind,
        effect: enumString(
          content.effect,
          ["clockwise", "counter_clockwise"],
          "painted effect",
        ),
        speed: integerValue(content.speed, "painted speed", 0, 100),
        brightness: integerValue(
          content.brightness,
          "painted brightness",
          0,
          100,
        ),
        background: rgbValue(content.background, "painted background"),
        groups: arrayValue(content.groups, "paint groups", 15).map(
          (item, index) => {
            const group = objectValue(item, `paint groups[${index}]`);
            return {
              fill: rgbValue(group.fill, "paint-group fill"),
              segments: arrayValue(group.segments, "painted segments", 15).map(
                (segment) =>
                  integerValue(segment, "painted segment", 0, 14),
              ),
            };
          },
        ),
      };
    case "h617a_single":
      return {
        kind,
        family: integerValue(content.family, "Single family", 0, 254),
        variant: integerValue(content.variant, "Single variant", 0, 255),
        speed: integerValue(content.speed, "Single speed", 0, 100),
        palette: paletteValue(content.palette, "Single palette", 8),
      };
    case "h617a_multi":
      return {
        kind,
        effects: arrayValue(content.effects, "Multi effects", 4).map(
          (item, index) => {
            const effect = objectValue(item, `Multi effects[${index}]`);
            return {
              family: integerValue(effect.family, "Multi family", 0, 254),
              variant: integerValue(effect.variant, "Multi variant", 0, 255),
            };
          },
        ),
        speed: integerValue(content.speed, "Multi speed", 0, 100),
        palette: paletteValue(content.palette, "Multi palette", 8),
      };
    case "advanced":
      return {
        kind,
        layers: layerArray(content.layers, "Advanced layers"),
      } satisfies AdvancedContent;
    case "scene_builtin":
      return {
        kind,
        template: catalogueRef(content.template, "scene template"),
        speed_index: nullableInteger(
          content.speed_index,
          "scene speed index",
          0,
          255,
        ),
      } satisfies BuiltinSceneContent;
    case "scene_palette":
      return paletteSceneContent(content);
    case "scene_layered": {
      const effect = objectValue(content.effect, "layered scene effect");
      const trailingPadding = sceneTrailingPadding(
        content.trailing_padding,
        "layered scene trailing padding",
      );
      return {
        kind,
        template: catalogueRef(content.template, "layered scene template"),
        effect: {
          layers: layerArray(effect.layers, "layered scene layers"),
        },
        speed_index: nullableInteger(
          content.speed_index,
          "layered scene speed index",
          0,
          255,
        ),
        raw_param: hexString(content.raw_param, "layered scene raw parameter"),
        ...(trailingPadding === undefined
          ? {}
          : { trailing_padding: trailingPadding }),
      } satisfies LayeredSceneContent;
    }

    default: {
      const { kind: _kind, ...body } = content;
      return {
        kind: "opaque",
        source_kind: kind,
        body,
      };
    }
  }
}

function sceneTrailingPadding(
  value: unknown,
  label: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  return integerValue(value, label, 0, SCENE_TRAILING_PADDING_MAX);
}

function paletteSceneContent(
  content: Record<string, unknown>,
): PaletteSceneContent {
  const layoutValue = integerValue(
    content.layout,
    "palette scene layout",
    0,
    1,
  );
  const layout: 0 | 1 = layoutValue === 0 ? 0 : 1;
  const steps = arrayValue(
    content.steps,
    "palette scene steps",
    255,
  ).map((item, index) => {
    const step = objectValue(item, `palette scene steps[${index}]`);
    const inlineColour =
      layout === 0
        ? (() => {
            if (step.inline_colour !== null) {
              invalid(
                `palette scene steps[${index}].inline_colour must be null for layout 0`,
              );
            }
            return null;
          })()
        : rgbValue(
            step.inline_colour,
            `palette scene steps[${index}].inline_colour`,
          );
    return {
      value: integerValue(
        step.value,
        `palette scene steps[${index}].value`,
        0,
        65_535,
      ),
      colour: rgbValue(
        step.colour,
        `palette scene steps[${index}].colour`,
      ),
      inline_colour: inlineColour,
    };
  });
  const palette = paletteValue(
    content.palette,
    "palette scene shared palette",
    255,
    true,
  );
  if (layout === 1 && palette.length !== 0) {
    invalid("palette scene layout 1 must not have a shared palette");
  }
  let configFlags: number | undefined;
  if (content.config_flags !== undefined) {
    configFlags = integerValue(content.config_flags, "palette scene config flags", 0, 255);
    if (configFlags & ~PALETTE_CONFIG_RESERVED_MASK) {
      invalid("palette scene config flags must only set reserved config bits");
    }
  }
  const trailingPadding = sceneTrailingPadding(
    content.trailing_padding,
    "palette scene trailing padding",
  );
  return {
    kind: "scene_palette",
    template: catalogueRef(content.template, "palette scene template"),
    layout,
    brightness_flag: booleanValue(
      content.brightness_flag,
      "palette scene brightness flag",
    ),
    steps,
    palette,
    speed_index: nullableInteger(
      content.speed_index,
      "palette scene speed index",
      0,
      255,
    ),
    ...(configFlags === undefined ? {} : { config_flags: configFlags }),
    ...(trailingPadding === undefined
      ? {}
      : { trailing_padding: trailingPadding }),
  };
}

export function effectContentToWire(
  content: EffectContent,
): WireEffectContent {
  if (content.kind !== "opaque") {
    return content;
  }
  assertBoundedJson(content.body, "opaque content", MAX_EFFECT_DOCUMENT_BYTES);
  return {
    ...content.body,
    kind: boundedString(
      content.source_kind,
      "opaque source kind",
      MAX_IDENTIFIER_LENGTH,
    ),
  };
}

export function decodeSceneSummary(value: unknown): SceneSummary {
  const scene = objectValue(value, "scene");
  const parameterKind = stringValue(
    scene.parameter_kind,
    "scene parameter kind",
  );
  if (
    parameterKind !== "none" &&
    parameterKind !== "palette" &&
    parameterKind !== "layers" &&
    parameterKind !== "opaque"
  ) {
    invalid("scene parameter kind is invalid");
  }
  const speed =
    scene.speed === null
      ? null
      : (() => {
          const raw = objectValue(scene.speed, "scene speed");
          return {
            option_count: integerValue(
              raw.option_count,
              "scene speed option count",
              1,
              256,
            ),
            default_index: integerValue(
              raw.default_index,
              "scene default speed",
              0,
              255,
            ),
          };
        })();
  return {
    scene_id: integerValue(scene.scene_id, "scene ID", 0, 65_535),
    effect_id: integerValue(scene.effect_id, "scene effect ID", 0, 65_535),
    category_id: integerValue(scene.category_id, "scene category ID", 0, 65_535),
    category: boundedString(
      scene.category,
      "scene category",
      MAX_EFFECT_NAME_LENGTH,
    ),
    name: boundedString(scene.name, "scene name", MAX_EFFECT_NAME_LENGTH),
    variant: boundedStringAllowEmpty(
      scene.variant,
      "scene variant",
      MAX_IDENTIFIER_LENGTH,
    ),
    display_name: boundedString(
      scene.display_name,
      "scene display name",
      MAX_EFFECT_NAME_LENGTH,
    ),
    scene_type: integerValue(scene.scene_type, "scene type", 0, 255),
    parameter_kind: parameterKind,
    speed,
  };
}

function layerArray(value: unknown, name: string): EffectLayer[] {
  return arrayValue(value, name, 255).map((item, index) =>
    layerValue(item, `${name}[${index}]`),
  );
}

function layerValue(value: unknown, name: string): EffectLayer {
  const layer = objectValue(value, name);
  const area = objectValue(layer.area, `${name}.area`);
  const selection = objectValue(layer.selection, `${name}.selection`);
  const distribution = objectValue(
    layer.distribution,
    `${name}.distribution`,
  );
  return {
    area: {
      start_tenths: integerValue(
        area.start_tenths,
        `${name}.area.start_tenths`,
        0,
        15,
      ),
      width_tenths: integerValue(
        area.width_tenths,
        `${name}.area.width_tenths`,
        0,
        15,
      ),
    },
    selection: {
      type: byteValue(selection.type, `${name}.selection.type`),
      param_1: byteValue(selection.param_1, `${name}.selection.param_1`),
      param_2: byteValue(selection.param_2, `${name}.selection.param_2`),
    },
    brightness_gradient: booleanValue(
      layer.brightness_gradient,
      `${name}.brightness_gradient`,
    ),
    brightness_patterns: arrayValue(
      layer.brightness_patterns,
      `${name}.brightness_patterns`,
      255,
    ).map((item, index) => {
      const pattern = objectValue(
        item,
        `${name}.brightness_patterns[${index}]`,
      );
      return {
        scope_high: byteValue(pattern.scope_high, "brightness scope high"),
        scope_low: byteValue(pattern.scope_low, "brightness scope low"),
        order: byteValue(pattern.order, "brightness order"),
        change_speed: byteValue(pattern.change_speed, "brightness change speed"),
        brightest_retention: byteValue(
          pattern.brightest_retention,
          "brightest retention",
        ),
        darkest_retention: byteValue(
          pattern.darkest_retention,
          "darkest retention",
        ),
      };
    }),
    distribution: {
      method: integerValue(
        distribution.method,
        `${name}.distribution.method`,
        0,
        127,
      ),
      backwards: booleanValue(
        distribution.backwards,
        `${name}.distribution.backwards`,
      ),
    },
    colour_speed: byteValue(layer.colour_speed, `${name}.colour_speed`),
    colour_retention: byteValue(
      layer.colour_retention,
      `${name}.colour_retention`,
    ),
    palette: paletteValue(layer.palette, `${name}.palette`, 255, true),
    selected_movement: movementValue(
      layer.selected_movement,
      `${name}.selected_movement`,
    ),
    overall_movement: movementValue(
      layer.overall_movement,
      `${name}.overall_movement`,
    ),
    priority: byteValue(layer.priority, `${name}.priority`),
    unknown_flags: unknownFlagsValue(
      layer.unknown_flags,
      LAYER_UNKNOWN_FLAGS_MASK,
      `${name}.unknown_flags`,
    ),
    excess: hexString(layer.excess, `${name}.excess`),
  };
}

function movementValue(value: unknown, name: string) {
  const movement = objectValue(value, name);
  return {
    enabled: booleanValue(movement.enabled, `${name}.enabled`),
    enter_exit: booleanValue(movement.enter_exit, `${name}.enter_exit`),
    direction: integerValue(movement.direction, `${name}.direction`, 0, 3),
    distance: byteValue(movement.distance, `${name}.distance`),
    speed: byteValue(movement.speed, `${name}.speed`),
    unknown_flags: unknownFlagsValue(
      movement.unknown_flags,
      MOVEMENT_UNKNOWN_FLAGS_MASK,
      `${name}.unknown_flags`,
    ),
  };
}

function catalogueRef(value: unknown, name: string) {
  const reference = objectValue(value, name);
  return {
    sku: boundedString(reference.sku, `${name}.sku`, MAX_IDENTIFIER_LENGTH),
    scene_id: integerValue(reference.scene_id, `${name}.scene_id`, 0, 65_535),
    effect_id: integerValue(
      reference.effect_id,
      `${name}.effect_id`,
      0,
      65_535,
    ),
    catalogue_schema_version: integerValue(
      reference.catalogue_schema_version,
      `${name}.catalogue_schema_version`,
      1,
      MAX_SAFE_REVISION,
    ),
  };
}

function paletteValue(
  value: unknown,
  name: string,
  maximum: number,
  allowEmpty = false,
): RGB[] {
  const palette = arrayValue(value, name, maximum);
  if (!allowEmpty && palette.length === 0) {
    invalid(`${name} must not be empty`);
  }
  return palette.map((colour, index) =>
    rgbValue(colour, `${name}[${index}]`),
  );
}

function rgbValue(value: unknown, name: string): RGB {
  const channels = arrayValue(value, name, 3);
  if (channels.length !== 3) {
    invalid(`${name} must contain three channels`);
  }
  return channels.map((channel) =>
    integerValue(channel, `${name} channel`, 0, 255),
  ) as RGB;
}

function capabilityValue(value: unknown, name: string): CapabilityState {
  if (
    value !== "supported" &&
    value !== "unsupported" &&
    value !== "evidence_gap"
  ) {
    invalid(`${name} is invalid`);
  }
  return value;
}

function boundedRecord(value: unknown, name: string): Record<string, unknown> {
  assertBoundedJson(value, name, MAX_EFFECT_DOCUMENT_BYTES);
  return objectValue(value, name);
}

function nullableBoundedString(value: unknown, name: string): string | null {
  return value === null
    ? null
    : boundedString(value, name, MAX_IDENTIFIER_LENGTH);
}

function timestampString(value: unknown, name: string): string {
  const timestamp = boundedString(value, name, MAX_TIMESTAMP_LENGTH);
  if (
    !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp) ||
    Number.isNaN(Date.parse(timestamp))
  ) {
    invalid(`${name} must be an ISO 8601 timestamp with a UTC offset`);
  }
  return timestamp;
}

function boundedString(
  value: unknown,
  name: string,
  maximum: number,
): string {
  const text = stringValue(value, name);
  if (text.length === 0 || text.length > maximum) {
    invalid(`${name} must contain 1 to ${maximum} characters`);
  }
  return text;
}

function boundedStringAllowEmpty(
  value: unknown,
  name: string,
  maximum: number,
): string {
  const text = stringValue(value, name);
  if (text.length > maximum) {
    invalid(`${name} must not exceed ${maximum} characters`);
  }
  return text;
}

function hexString(value: unknown, name: string): string {
  const text = stringValue(value, name);
  if (text.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(text)) {
    invalid(`${name} must be hexadecimal`);
  }
  return text;
}

function stringValue(value: unknown, name: string): string {
  if (typeof value !== "string") {
    invalid(`${name} must be a string`);
  }
  return value;
}

function booleanValue(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") {
    invalid(`${name} must be a boolean`);
  }
  return value;
}

function integerValue(
  value: unknown,
  name: string,
  minimum: number,
  maximum = MAX_SAFE_REVISION,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    invalid(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value;
}

function revisionValue(
  value: unknown,
  name: string,
  minimum: number,
): number {
  return integerValue(value, name, minimum, MAX_SAFE_REVISION);
}

function exactInteger(
  value: unknown,
  expected: number,
  name: string,
): number {
  const actual = integerValue(value, name, 1);
  if (actual !== expected) {
    invalid(`${name} is incompatible with this editor`);
  }
  return actual;
}

function nullableInteger(
  value: unknown,
  name: string,
  minimum: number,
  maximum: number,
): number | null {
  return value === null
    ? null
    : integerValue(value, name, minimum, maximum);
}

function byteValue(value: unknown, name: string): number {
  return integerValue(value, name, 0, 255);
}

function unknownFlagsValue(value: unknown, mask: number, name: string): number {
  const flags = byteValue(value, name);
  if (flags & ~mask) {
    invalid(`${name} must only set reserved bits, not bits explicit fields carry`);
  }
  return flags;
}

function enumString<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  name: string,
): Values[number] {
  const text = stringValue(value, name);
  if (!values.includes(text)) {
    invalid(`${name} is invalid`);
  }
  return text;
}

function objectValue(
  value: unknown,
  name: string,
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    invalid(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function exactObjectKeys(
  value: Record<string, unknown>,
  expected: string[],
  name: string,
): void {
  const actual = Object.keys(value).sort();
  const keys = [...expected].sort();
  if (
    actual.length !== keys.length ||
    actual.some((key, index) => key !== keys[index])
  ) {
    invalid(`${name} fields are invalid`);
  }
}

function arrayValue(
  value: unknown,
  name: string,
  maximum: number,
): unknown[] {
  if (!Array.isArray(value)) {
    invalid(`${name} must be an array`);
  }
  if (value.length > maximum) {
    invalid(`${name} must not exceed ${maximum} items`);
  }
  return value;
}

function requireUnique<Item>(
  items: Item[],
  key: (item: Item) => string,
  name: string,
): void {
  const keys = items.map(key);
  if (new Set(keys).size !== keys.length) {
    invalid(`${name} must be unique`);
  }
}

function assertBoundedJson(
  value: unknown,
  name: string,
  maximumBytes: number,
  maximumNodes = MAX_JSON_NODES,
): void {
  let nodes = 0;
  const visit = (item: unknown, path: string, depth: number): void => {
    nodes += 1;
    if (nodes > maximumNodes) {
      invalid(`${name} must not exceed ${maximumNodes} JSON values`);
    }
    if (depth > MAX_JSON_DEPTH) {
      invalid(`${name} must not exceed ${MAX_JSON_DEPTH} nested levels`);
    }
    if (item === null || typeof item === "boolean") {
      return;
    }
    if (typeof item === "number") {
      if (
        !Number.isFinite(item) ||
        (Number.isInteger(item) && !Number.isSafeInteger(item))
      ) {
        invalid(`${path} must be a finite JSON number`);
      }
      return;
    }
    if (typeof item === "string") {
      if (item.length > MAX_JSON_STRING_LENGTH) {
        invalid(
          `${path} must not exceed ${MAX_JSON_STRING_LENGTH} characters`,
        );
      }
      return;
    }
    if (Array.isArray(item)) {
      if (item.length > MAX_JSON_COLLECTION_ITEMS) {
        invalid(`${path} must not exceed ${MAX_JSON_COLLECTION_ITEMS} items`);
      }
      item.forEach((nested, index) =>
        visit(nested, `${path}[${index}]`, depth + 1),
      );
      return;
    }
    if (typeof item === "object" && item !== null) {
      const entries = Object.entries(item);
      if (entries.length > MAX_JSON_COLLECTION_ITEMS) {
        invalid(`${path} must not exceed ${MAX_JSON_COLLECTION_ITEMS} fields`);
      }
      entries.forEach(([key, nested]) => {
        if (key.length > MAX_JSON_STRING_LENGTH) {
          invalid(`${path} contains an oversized key`);
        }
        visit(nested, `${path}.${key}`, depth + 1);
      });
      return;
    }
    invalid(`${path} contains a non-JSON value`);
  };
  visit(value, name, 0);
  const encoded = JSON.stringify(value);
  if (encoded === undefined) {
    invalid(`${name} must contain JSON values`);
  }
  if (new TextEncoder().encode(encoded).byteLength > maximumBytes) {
    invalid(`${name} must not exceed ${maximumBytes} bytes`);
  }
}

function invalid(message: string): never {
  throw new Error(`Malformed Effect Studio server payload: ${message}.`);
}

export function isCompatibleEditorInfo(info: EditorApiInfo): boolean {
  return (
    info.api_version === EDITOR_API_VERSION &&
    info.effect_schema_version === EFFECT_SCHEMA_VERSION &&
    info.compiler_version === EFFECT_COMPILER_VERSION
  );
}

export function homeAssistantUserIsAdmin(hass: HomeAssistant): boolean {
  return hass.user?.is_admin === true;
}
