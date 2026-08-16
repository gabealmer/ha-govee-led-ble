import { blankAdvancedContent, cloneAdvancedContent } from "../../src/advanced-effect-editor";
import {
  EDITOR_API_VERSION,
  EFFECT_COMPILER_VERSION,
  EFFECT_SCHEMA_VERSION,
} from "../../src/contracts";
import {
  decodeCustomCatalogue,
  decodeDeployment,
  decodeEffectContent,
  decodeLibrarySnapshot,
  decodeSceneDetail,
} from "../../src/validation";
import type {
  CustomEffectCatalogue,
  DeploymentRecord,
  DeploymentPhase,
  DeviceCapabilities,
  DraftSummary,
  EffectContent,
  HomeAssistant,
  KnownEffectContent,
  LibrarySnapshot,
  LibrarySummary,
  PaletteSceneContent,
  PreviewStatus,
  SceneCatalogue,
  SceneDetail,
  SceneSummary,
} from "../../src/types";
import productionData from "./production-data.json";

const PREFIX = "ha_govee_led_ble/editor/";
const STORAGE_KEY = "effect-studio-playwright-backend";
const CHANNEL_NAME = "effect-studio-playwright-subscriptions";

type SubscriptionKind = "library" | "deployment" | "preview";

type WireOpaqueContent = {
  kind: string;
  [key: string]: unknown;
};

type WireEffectContent = KnownEffectContent | WireOpaqueContent;

interface WireLibraryItem {
  schema_version: number;
  id: string;
  revision: number;
  name: string;
  content: WireEffectContent;
  provenance: Record<string, unknown>;
  extensions: Record<string, unknown>;
  target_hint: {
    model: string | null;
    segment_count: number | null;
  };
}

interface WireEffectDraft {
  id: string;
  owner_id: string;
  revision: number;
  item: WireLibraryItem;
  updated_at: string;
  selected_config_entry_id: string | null;
  base_item_id: string | null;
  base_item_revision: number | null;
}

interface WireDeploymentSnapshot {
  revision: number;
  deployments: DeploymentRecord[];
}

interface BackendState {
  libraryRevision: number;
  items: Record<string, WireLibraryItem>;
  drafts: Record<string, WireEffectDraft>;
  deployments: DeploymentRecord[];
  nextItemId: number;
  nextDraftId: number;
  nextOperationId: number;
}

interface SubscriptionStats {
  installs: number;
  unsubscribes: number;
  deliveries: number;
}

interface BackendStats {
  library: SubscriptionStats & { active: number };
  deployment: SubscriptionStats & { active: number };
  preview: SubscriptionStats & { active: number };
}

interface ChannelMessage {
  kind: SubscriptionKind;
  snapshot: LibrarySnapshot | WireDeploymentSnapshot;
}

export interface MockBackendSnapshot {
  state: BackendState;
  calls: Record<string, unknown>[];
  subscriptions: BackendStats;
}

export class MockHomeAssistantBackend {
  public readonly hass: HomeAssistant;

  private readonly channel = new BroadcastChannel(CHANNEL_NAME);
  private readonly libraryCallbacks = new Set<
    (snapshot: LibrarySnapshot) => void
  >();
  private readonly deploymentCallbacks = new Set<
    (snapshot: WireDeploymentSnapshot) => void
  >();
  private readonly previewCallbacks = new Set<
    (status: PreviewStatus) => void
  >();
  private readonly conflicts = new Map<string, number>();
  private readonly failures = new Map<string, number>();
  private readonly delays = new Map<string, number>();
  private readonly calls: Record<string, unknown>[] = [];
  private readonly storageKey: string;
  private readonly stats: Record<SubscriptionKind, SubscriptionStats> = {
    library: { installs: 0, unsubscribes: 0, deliveries: 0 },
    deployment: { installs: 0, unsubscribes: 0, deliveries: 0 },
    preview: { installs: 0, unsubscribes: 0, deliveries: 0 },
  };

  public constructor(
    private readonly isAdmin: boolean,
    private readonly apiMismatch: boolean,
    private readonly slowLoad: boolean,
    private readonly malformedLibrary: boolean,
    private readonly rejectDeploymentSubscription: boolean,
    private readonly useTestFixtures: boolean,
  ) {
    this.storageKey = `${STORAGE_KEY}:${useTestFixtures ? "fixtures" : "production"}`;
    if (!localStorage.getItem(this.storageKey)) {
      this.writeState(initialState(useTestFixtures));
    }
    this.hass = {
      callWS: <T>(message: Record<string, unknown>) =>
        this.callWS<T>(message),
      connection: {
        subscribeMessage: <T>(
          callback: (event: T) => void,
          message: Record<string, unknown>,
        ) => this.subscribeMessage(callback, message),
      },
      user: {
        is_admin: this.isAdmin,
      },
    };
    this.channel.addEventListener("message", (event: MessageEvent<ChannelMessage>) => {
      if (event.data.kind === "library") {
        this.deliverLibrary(event.data.snapshot as LibrarySnapshot);
      } else {
        this.deliverDeployments(event.data.snapshot as WireDeploymentSnapshot);
      }
    });
  }

  public snapshot(): MockBackendSnapshot {
    return {
      state: this.readState(),
      calls: structuredClone(this.calls),
      subscriptions: {
        library: {
          ...this.stats.library,
          active: this.libraryCallbacks.size,
        },
        deployment: {
          ...this.stats.deployment,
          active: this.deploymentCallbacks.size,
        },
        preview: {
          ...this.stats.preview,
          active: this.previewCallbacks.size,
        },
      },
    };
  }

  private sceneCatalogue(configEntryId: string): SceneCatalogue {
    const device = requiredDevice(configEntryId);
    return this.useTestFixtures && device.model === "H617A"
      ? TEST_SCENE_CATALOGUE
      : requiredRealSceneCatalogue(device.model);
  }

  public validateEffectContent(value: unknown): EffectContent {
    return decodeEffectContent(value);
  }

  public validateCustomCatalogue(value: unknown): CustomEffectCatalogue {
    return decodeCustomCatalogue(value);
  }

  public validateLibrarySnapshot(value: unknown): LibrarySnapshot {
    return decodeLibrarySnapshot(value);
  }

  public validateDeployment(value: unknown): DeploymentRecord {
    return decodeDeployment(value);
  }

  public validateSceneDetail(value: unknown): SceneDetail {
    return decodeSceneDetail(value);
  }

  public failNext(command: string): void {
    this.failures.set(command, (this.failures.get(command) ?? 0) + 1);
  }

  public conflictNext(command: string): void {
    this.conflicts.set(command, (this.conflicts.get(command) ?? 0) + 1);
  }

  public delayNext(command: string, milliseconds: number): void {
    this.delays.set(command, milliseconds);
  }

  public emitLibrary(): void {
    this.publishLibrary(this.readState());
  }

  public emitDeployments(): void {
    this.publishDeployments(this.readState());
  }

  public emitDeploymentPhase(phase: DeploymentPhase): void {
    const state = this.readState();
    state.deployments = [
      {
        operation_id: "phase-contract-operation",
        config_entry_id: "h617a-main",
        diy_code: 800,
        content_kind: "h617a_painted",
        target_mode: "custom",
        target_effect: null,
        phase,
        updated_at: new Date().toISOString(),
        item_id: "painted-1",
        item_revision: 1,
        error_code: phase === "failed" ? "test_failure" : null,
        progress_current: phase === "compiling" || phase === "pending" ? 0 : 1,
        progress_total: 2,
        verification_confidence:
          phase === "confirmed" ? "activation_match" : "unknown",
      },
    ];
    this.writeState(state);
    this.publishDeployments(state);
  }

  private async callWS<T>(message: Record<string, unknown>): Promise<T> {
    this.calls.push(structuredClone(message));
    const type = String(message.type ?? "");
    if (!type.startsWith(PREFIX)) {
      throw new Error(`Unexpected WebSocket command: ${type}`);
    }
    const command = type.slice(PREFIX.length);
    this.maybeConflict(command);
    this.maybeFail(command);
    await this.maybeDelay(command);
    if (this.slowLoad && command === "info") {
      await delay(500);
    }

    switch (command) {
      case "info":
        return this.result<T>({
          api_version: this.apiMismatch
            ? EDITOR_API_VERSION + 1
            : EDITOR_API_VERSION,
          effect_schema_version: EFFECT_SCHEMA_VERSION,
          compiler_version: EFFECT_COMPILER_VERSION,
          limits: {
            effect_name: 128,
            effect_document_bytes: 65_536,
            devices: 512,
            library_items: 256,
            drafts_per_owner: 32,
            deployment_records: 128,
            scene_catalogue_entries: 512,
          },
        });
      case "devices":
        return this.result<T>({ devices: DEVICES });
      case "custom/catalogue":
        return this.result<T>({ catalogue: REAL_CUSTOM_CATALOGUE });
      case "library/list":
        if (this.malformedLibrary) {
          return this.result<T>({
            library_revision: 1,
            items: "not-an-array",
          });
        }
        return this.result<T>(librarySnapshot(this.readState()));
      case "library/get":
        {
          const item = requiredItem(
            this.readState(),
            String(message.item_id),
          );
          if (!this.isAdmin && item.content.kind === "future_wave") {
            throw new MockUnauthorizedError();
          }
          return this.result<T>({ item });
        }
      case "library/create":
        return this.createItem<T>(message);
      case "library/update":
        return this.updateItem<T>(message);
      case "library/delete":
        return this.deleteItem<T>(message);
      case "draft/list":
        return this.result<T>({
          drafts: Object.values(this.readState().drafts).map(draftSummary),
        });
      case "draft/get":
        return this.result<T>({
          draft: requiredDraft(this.readState(), String(message.draft_id)),
        });
      case "draft/create":
        return this.createDraft<T>(message);
      case "draft/update":
        return this.updateDraft<T>(message);
      case "draft/delete":
        return this.deleteDraft<T>(message);
      case "scene/catalogue/list":
        return this.result<T>({
          catalogue: this.sceneCatalogue(String(message.config_entry_id)),
        });
      case "scene/catalogue/get":
        return this.sceneDetail<T>(message);
      case "scene/apply":
        {
          const catalogue = this.sceneCatalogue(
            String(message.config_entry_id),
          );
        return this.result<T>({
          scene: requiredScene(
            catalogue.scenes,
            Number(message.scene_id),
            Number(message.effect_id),
          ),
          speed_index:
            typeof message.speed_index === "number" ? message.speed_index : null,
          readback: "scene_identity_only",
        });
        }
      case "apply":
      case "apply_snapshot":
        return this.apply<T>(message);
      case "preview/session/open":
        return this.result<T>({ session_id: "preview-session-1" });
      case "preview/session/close":
        return this.result<T>({ closed: true });
      case "preview/apply_scene":
      case "preview/apply_snapshot":
        this.emitPreviewStatus(message, "written");
        return this.result<T>({ accepted: true });
      case "preview/cancel":
        return this.result<T>({ cancelled: true });
      default:
        throw new Error(`Unhandled WebSocket command: ${command}`);
    }
  }

  private async subscribeMessage<T>(
    callback: (event: T) => void,
    message: Record<string, unknown>,
  ): Promise<() => void> {
    const type = String(message.type ?? "");
    const kind: SubscriptionKind =
      type === `${PREFIX}library/subscribe`
        ? "library"
        : type === `${PREFIX}deployment/subscribe`
          ? "deployment"
          : type === `${PREFIX}preview/subscribe`
            ? "preview"
          : (() => {
              throw new Error(`Unexpected subscription: ${type}`);
            })();
    if (
      kind === "preview" &&
      this.rejectDeploymentSubscription &&
      this.stats.preview.installs === 0
    ) {
      throw new MockUnauthorizedError();
    }
    if ((kind === "deployment" || kind === "preview") && !this.isAdmin) {
      throw new MockUnauthorizedError();
    }

    this.stats[kind].installs += 1;
    if (kind === "library") {
      this.libraryCallbacks.add(
        callback as (snapshot: LibrarySnapshot) => void,
      );
    } else if (kind === "deployment") {
      this.deploymentCallbacks.add(
        callback as (snapshot: WireDeploymentSnapshot) => void,
      );
    } else {
      this.previewCallbacks.add(
        callback as (status: PreviewStatus) => void,
      );
    }

    let active = true;
    return () => {
      if (!active) {
        return;
      }
      active = false;
      this.stats[kind].unsubscribes += 1;
      if (kind === "library") {
        this.libraryCallbacks.delete(
          callback as (snapshot: LibrarySnapshot) => void,
        );
      } else if (kind === "deployment") {
        this.deploymentCallbacks.delete(
          callback as (snapshot: WireDeploymentSnapshot) => void,
        );
      } else {
        this.previewCallbacks.delete(
          callback as (status: PreviewStatus) => void,
        );
      }
    };
  }

  private emitPreviewStatus(
    message: Record<string, unknown>,
    phase: PreviewStatus["phase"],
  ): void {
    const status: PreviewStatus = {
      session_id: String(message.session_id),
      sequence: Number(message.sequence),
      config_entry_id: String(message.config_entry_id),
      phase,
      content_kind:
        typeof message.content === "object" &&
        message.content !== null &&
        "kind" in message.content
          ? String((message.content as { kind: unknown }).kind)
          : "scene_builtin",
      confidence: "write_completed",
      error_code: null,
    };
    queueMicrotask(() => {
      this.stats.preview.deliveries += this.previewCallbacks.size;
      for (const callback of this.previewCallbacks) {
        callback(structuredClone(status));
      }
    });
  }

  public emitMalformedLibrary(): void {
    for (const callback of this.libraryCallbacks) {
      callback({
        library_revision: 1,
        items: "not-an-array",
      } as unknown as LibrarySnapshot);
    }
  }

  public emitStaleSnapshots(): void {
    this.deliverLibrary({
      library_revision: 0,
      items: [],
    });
    this.deliverDeployments({
      revision: 0,
      deployments: [],
    });
  }

  private createItem<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    expectRevision(
      message.expected_library_revision,
      state.libraryRevision,
      "library",
    );
    const id = `item-${state.nextItemId}`;
    state.nextItemId += 1;
    state.libraryRevision += 1;
    const item = libraryItem(
      id,
      String(message.name),
      message.content as WireEffectContent,
    );
    state.items[id] = item;
    this.writeState(state);
    this.publishLibrary(state);
    return this.result<T>({
      item,
      library_revision: state.libraryRevision,
    });
  }

  private updateItem<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    expectRevision(
      message.expected_library_revision,
      state.libraryRevision,
      "library",
    );
    const current = requiredItem(state, String(message.item_id));
    expectRevision(message.expected_revision, current.revision, "item");
    state.libraryRevision += 1;
    const item: WireLibraryItem = {
      ...current,
      revision: current.revision + 1,
      name: String(message.name),
      content: structuredClone(message.content as WireEffectContent),
    };
    state.items[item.id] = item;
    this.writeState(state);
    this.publishLibrary(state);
    return this.result<T>({
      item,
      library_revision: state.libraryRevision,
    });
  }

  private deleteItem<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    expectRevision(
      message.expected_library_revision,
      state.libraryRevision,
      "library",
    );
    const current = requiredItem(state, String(message.item_id));
    expectRevision(message.expected_revision, current.revision, "item");
    state.libraryRevision += 1;
    delete state.items[current.id];
    this.writeState(state);
    this.publishLibrary(state);
    return this.result<T>({
      library_revision: state.libraryRevision,
    });
  }

  private createDraft<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    const id = `draft-${state.nextDraftId}`;
    state.nextDraftId += 1;
    const draft: WireEffectDraft = {
      id,
      owner_id: "playwright-user",
      revision: 1,
      item: {
        ...libraryItem(
          `draft-item-${id}`,
          String(message.name),
          message.content as WireEffectContent,
        ),
        revision: 1,
      },
      updated_at: String(message.updated_at),
      selected_config_entry_id:
        typeof message.selected_config_entry_id === "string"
          ? message.selected_config_entry_id
          : null,
      base_item_id:
        typeof message.base_item_id === "string"
          ? message.base_item_id
          : null,
      base_item_revision:
        typeof message.base_item_revision === "number"
          ? message.base_item_revision
          : null,
    };
    state.drafts[id] = draft;
    this.writeState(state);
    return this.result<T>({ draft });
  }

  private updateDraft<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    const current = requiredDraft(state, String(message.draft_id));
    expectRevision(message.expected_revision, current.revision, "draft");
    const draft: WireEffectDraft = {
      ...current,
      revision: current.revision + 1,
      item: {
        ...current.item,
        revision: current.item.revision + 1,
        name: String(message.name),
        content: structuredClone(message.content as WireEffectContent),
      },
      updated_at: String(message.updated_at),
      selected_config_entry_id:
        typeof message.selected_config_entry_id === "string"
          ? message.selected_config_entry_id
          : null,
    };
    state.drafts[draft.id] = draft;
    this.writeState(state);
    return this.result<T>({ draft });
  }

  private deleteDraft<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    const current = requiredDraft(state, String(message.draft_id));
    expectRevision(message.expected_revision, current.revision, "draft");
    delete state.drafts[current.id];
    this.writeState(state);
    return this.result<T>({});
  }

  private async sceneDetail<T>(
    message: Record<string, unknown>,
  ): Promise<T> {
    const device = requiredDevice(String(message.config_entry_id));
    const catalogue = this.sceneCatalogue(device.config_entry_id);
    const scene = requiredScene(
      catalogue.scenes,
      Number(message.scene_id),
      Number(message.effect_id),
    );
    const detail = this.useTestFixtures && device.model === "H617A"
      ? testSceneDetail(scene)
      : requiredRealSceneDetail(device.model, scene);
    await delay(scene.scene_id === 1 ? 300 : 10);
    return this.result<T>(detail);
  }

  private apply<T>(message: Record<string, unknown>): T {
    const state = this.readState();
    const operationId = `operation-${state.nextOperationId}`;
    state.nextOperationId += 1;
    const content =
      typeof message.item_id === "string"
        ? requiredItem(state, message.item_id).content
        : decodeEffectContent(message.content);
    const sceneTarget =
      content.kind === "advanced" ||
      content.kind === "scene_palette" ||
      content.kind === "scene_layered";
    const device = requiredDevice(String(message.config_entry_id));
    const h6199SlotEffect =
      device.model === "H6199" &&
      (content.kind === "palette_diy" || content.kind === "special_diy");
    const profileTarget =
      content.kind === "music_profile"
        ? "music"
        : content.kind === "video_profile"
          ? "video"
          : undefined;
    const uploadOnly = content.kind === "workshop";
    const deployment: DeploymentRecord = {
      operation_id: operationId,
      config_entry_id: String(message.config_entry_id),
      diy_code:
        profileTarget || uploadOnly ? null : h6199SlotEffect ? 401 : 1,
      content_kind: content.kind,
      target_mode: profileTarget ?? (sceneTarget ? "scene" : "custom"),
      target_effect: sceneTarget ? "compiled-scene" : null,
      phase: uploadOnly
        ? "applied"
        : h6199SlotEffect
          ? "uncertain"
          : "confirmed",
      updated_at: new Date().toISOString(),
      item_id:
        typeof message.item_id === "string" ? message.item_id : null,
      item_revision:
        typeof message.revision === "number" ? message.revision : null,
      error_code: h6199SlotEffect ? "activation_readback_unproven" : null,
      progress_current: h6199SlotEffect ? 3 : 1,
      progress_total: h6199SlotEffect ? 3 : 1,
      verification_confidence: h6199SlotEffect
        ? "unknown"
        : uploadOnly
          ? "write_completed"
          : profileTarget
            ? "settings_match"
            : "activation_match",
    };
    state.deployments.unshift(deployment);
    this.writeState(state);
    this.publishDeployments(state);
    return this.result<T>({ deployment });
  }

  private publishLibrary(state: BackendState): void {
    const snapshot = librarySnapshot(state);
    this.deliverLibrary(snapshot);
    this.channel.postMessage({
      kind: "library",
      snapshot,
    } satisfies ChannelMessage);
  }

  private publishDeployments(state: BackendState): void {
    const snapshot = deploymentSnapshot(state);
    this.deliverDeployments(snapshot);
    this.channel.postMessage({
      kind: "deployment",
      snapshot,
    } satisfies ChannelMessage);
  }

  private deliverLibrary(snapshot: LibrarySnapshot): void {
    for (const callback of this.libraryCallbacks) {
      this.stats.library.deliveries += 1;
      callback(structuredClone(snapshot));
    }
  }

  private deliverDeployments(snapshot: WireDeploymentSnapshot): void {
    for (const callback of this.deploymentCallbacks) {
      this.stats.deployment.deliveries += 1;
      callback(structuredClone(snapshot));
    }
  }

  private maybeFail(command: string): void {
    const count = this.failures.get(command) ?? 0;
    if (count === 0) {
      return;
    }
    this.failures.set(command, count - 1);
    throw new Error(`Injected ${command} failure`);
  }

  private maybeConflict(command: string): void {
    const count = this.conflicts.get(command) ?? 0;
    if (count === 0) {
      return;
    }
    this.conflicts.set(command, count - 1);
    throw new MockConflictError(`Injected ${command} conflict`);
  }

  private async maybeDelay(command: string): Promise<void> {
    const milliseconds = this.delays.get(command);
    if (milliseconds === undefined) {
      return;
    }
    this.delays.delete(command);
    await delay(milliseconds);
  }

  private readState(): BackendState {
    const value = localStorage.getItem(this.storageKey);
    if (!value) {
      throw new Error("The mock backend state is unavailable");
    }
    return JSON.parse(value) as BackendState;
  }

  private writeState(state: BackendState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private result<T>(value: unknown): T {
    return structuredClone(value) as T;
  }
}

const DEVICES = productionData.devices as DeviceCapabilities[];

const REAL_CUSTOM_CATALOGUE =
  productionData.custom_catalogue as unknown as CustomEffectCatalogue;
const REAL_SCENE_CATALOGUES =
  productionData.scene_catalogues as Record<string, SceneCatalogue>;
const REAL_SCENE_DETAILS =
  productionData.scene_details as Record<
    string,
    Record<string, SceneDetail>
  >;

const TEST_SCENES: SceneSummary[] = [
  {
    scene_id: 100,
    effect_id: 200,
    category_id: 5,
    category: "Everyday",
    name: "reading",
    variant: "",
    display_name: "Reading",
    scene_type: 0,
    parameter_kind: "none",
    speed: null,
  },
  {
    scene_id: 1041,
    effect_id: 1103,
    category_id: 133,
    category: "Festival",
    name: "Halloween",
    variant: "",
    display_name: "Halloween",
    scene_type: 1,
    parameter_kind: "palette",
    speed: null,
  },
  {
    scene_id: 1049,
    effect_id: 1111,
    category_id: 136,
    category: "Life",
    name: "Sweet",
    variant: "",
    display_name: "Sweet",
    scene_type: 1,
    parameter_kind: "palette",
    speed: null,
  },
  {
    scene_id: 9001,
    effect_id: 9002,
    category_id: 999,
    category: "Synthetic schema-only",
    name: "layout_1_schema_fixture",
    variant: "synthetic",
    display_name: "Synthetic Layout 1 (schema only)",
    scene_type: 1,
    parameter_kind: "palette",
    speed: {
      option_count: 8,
      default_index: 7,
    },
  },
  {
    scene_id: 1,
    effect_id: 101,
    category_id: 10,
    category: "Nature",
    name: "aurora",
    variant: "",
    display_name: "Aurora Layers",
    scene_type: 2,
    parameter_kind: "layers",
    speed: {
      option_count: 3,
      default_index: 1,
    },
  },
  {
    scene_id: 2,
    effect_id: 202,
    category_id: 20,
    category: "Focus",
    name: "ocean",
    variant: "layers",
    display_name: "Ocean Layers",
    scene_type: 2,
    parameter_kind: "layers",
    speed: {
      option_count: 3,
      default_index: 1,
    },
  },
  {
    scene_id: 3,
    effect_id: 303,
    category_id: 20,
    category: "Focus",
    name: "empty_pattern",
    variant: "layers",
    display_name: "Empty Pattern Layers",
    scene_type: 2,
    parameter_kind: "layers",
    speed: {
      option_count: 3,
      default_index: 1,
    },
  },
];

const TEST_SCENE_CATALOGUE: SceneCatalogue = {
  schema_version: 1,
  sku: "H617A",
  enabled: true,
  categories: [
    { id: 5, name: "Everyday" },
    { id: 10, name: "Nature" },
    { id: 20, name: "Focus" },
    { id: 133, name: "Festival" },
    { id: 136, name: "Life" },
    { id: 999, name: "Synthetic schema-only" },
  ],
  scenes: TEST_SCENES,
};

function initialState(useTestFixtures: boolean): BackendState {
  if (!useTestFixtures) {
    return {
      libraryRevision: 0,
      items: {},
      drafts: {},
      deployments: [],
      nextItemId: 1,
      nextDraftId: 1,
      nextOperationId: 1,
    };
  }
  const advanced = advancedFixture();
  const rawAdvanced = cloneAdvancedContent(advanced);
  rawAdvanced.layers[0].selection.type = 0xfe;
  rawAdvanced.layers[0].brightness_patterns[0].order = 0xfd;
  rawAdvanced.layers[0].selected_movement.unknown_flags = 0x20;
  rawAdvanced.layers[1].brightness_gradient = true;
  rawAdvanced.layers[1].brightness_patterns[0].order = 0xfd;
  return {
    libraryRevision: 1,
    items: {
      "painted-1": libraryItem("painted-1", "Supported painted effect", {
        kind: "h617a_painted",
        effect: "clockwise",
        speed: 50,
        brightness: 100,
        background: [0, 0, 0],
        groups: [
          {
            fill: [47, 111, 237],
            segments: [0, 1, 2],
          },
        ],
      }),
      "painted-2": libraryItem("painted-2", "Zeta painted effect", {
        kind: "h617a_painted",
        effect: "clockwise",
        speed: 40,
        brightness: 80,
        background: [0, 0, 0],
        groups: [
          {
            fill: [255, 159, 10],
            segments: [3, 4, 5],
          },
        ],
      }),
      "music-h617a": libraryItem(
        "music-h617a",
        "Saved separation profile",
        {
          kind: "music_profile",
          model: "H617A",
          mode: "separation",
          sensitivity: 50,
          colour: null,
          calm: null,
          parameters: {
            point: 3,
            gradient: true,
          },
        },
      ),
      "music-h6199": libraryItem(
        "music-h6199",
        "Saved rolling profile",
        {
          kind: "music_profile",
          model: "H6199",
          mode: "rolling",
          sensitivity: 75,
          colour: [47, 111, 237],
          calm: null,
          parameters: {},
        },
      ),
      "video-h6199": libraryItem(
        "video-h6199",
        "Saved movie profile",
        {
          kind: "video_profile",
          model: "H6199",
          mode: "movie",
          full_screen: true,
          saturation: 70,
          sound_effects: true,
          sound_effects_softness: 40,
          white_balance_position: 12,
          relative_brightness: {
            left: 80,
            top: 60,
            right: 55,
            bottom: 45,
          },
          blank_screen: false,
        },
      ),
      "single-unknown": libraryItem(
        "single-unknown",
        "Unknown Type04 pair",
        {
          kind: "h617a_single",
          family: 254,
          variant: 253,
          speed: 50,
          palette: [
            [255, 0, 0],
            [0, 0, 255],
          ],
        },
      ),
      "multi-fixture": libraryItem(
        "multi-fixture",
        "Verified fixture-backed multi effect",
        {
          kind: "h617a_multi",
          effects: [
            { family: 0, variant: 0 },
            { family: 254, variant: 253 },
            { family: 3, variant: 3 },
          ],
          speed: 35,
          palette: [
            [12, 34, 56],
            [78, 90, 123],
          ],
        },
      ),
      "single-special-unknown": libraryItem(
        "single-special-unknown",
        "Unsupported special DIY pair",
        {
          kind: "h617a_single",
          family: 252,
          variant: 251,
          speed: 65,
          palette: [
            [9, 8, 7],
            [6, 5, 4],
          ],
        },
      ),
      "advanced-1": libraryItem("advanced-1", "Layered library effect", advanced),
      "advanced-raw": libraryItem(
        "advanced-raw",
        "Raw layered values",
        rawAdvanced,
      ),
      "opaque-1": libraryItem("opaque-1", "Future backend effect", {
        kind: "future_wave",
        schema: 7,
        enabled: false,
        template: {
          secret: "opaque-summary-secret",
        },
        nested: {
          mode: "prism",
          values: [1, null, "three"],
        },
      }),
    },
    drafts: {},
    deployments: [],
    nextItemId: 1,
    nextDraftId: 1,
    nextOperationId: 1,
  };
}

function advancedFixture() {
  const first = blankAdvancedContent();
  first.layers[0].palette = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
  ];
  const second = cloneAdvancedContent(first).layers[0];
  second.area = {
    start_tenths: 2,
    width_tenths: 6,
  };
  second.palette = [
    [255, 159, 10],
    [94, 92, 230],
  ];
  return {
    kind: "advanced" as const,
    layers: [first.layers[0], second],
  };
}

function libraryItem(
  id: string,
  name: string,
  content: WireEffectContent,
): WireLibraryItem {
  return {
    schema_version: 1,
    id,
    revision: 1,
    name,
    content: structuredClone(content),
    provenance: {},
    extensions: {},
    target_hint: {
      model: "H617A",
      segment_count: 15,
    },
  };
}

function librarySnapshot(state: BackendState): LibrarySnapshot {
  return {
    library_revision: state.libraryRevision,
    items: Object.values(state.items)
      .map(librarySummary)
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

function librarySummary(item: WireLibraryItem): LibrarySummary {
  const kind = String(item.content.kind);
  const declaredModel =
    [
      "palette_diy",
      "music_profile",
      "video_profile",
      "workshop",
      "special_diy",
    ].includes(kind) &&
    "model" in item.content &&
    typeof item.content.model === "string"
      ? item.content.model
      : undefined;
  const template =
    ["scene_builtin", "scene_palette", "scene_layered"].includes(kind) &&
    "template" in item.content &&
    typeof item.content.template === "object" &&
    item.content.template !== null
      ? item.content.template as LibrarySummary["template"]
      : undefined;
  const templateModel =
    template?.sku === "H617A" || template?.sku === "H6199"
      ? template.sku
      : undefined;
  const model =
    declaredModel === "H617A" || declaredModel === "H6199"
      ? declaredModel
      : ["h617a_painted", "h617a_single", "h617a_multi"].includes(kind)
        ? "H617A"
        : templateModel
          ? templateModel
          : item.target_hint?.model === "H617A" ||
              item.target_hint?.model === "H6199"
            ? item.target_hint.model
            : undefined;
  return {
    id: item.id,
    revision: item.revision,
    name: item.name,
    kind,
    ...(model ? { model } : {}),
    ...(template
      ? {
          template: structuredClone(template),
        }
      : {}),
  };
}

function draftSummary(draft: WireEffectDraft): DraftSummary {
  return {
    id: draft.id,
    revision: draft.revision,
    name: draft.item.name,
    updated_at: draft.updated_at,
    selected_config_entry_id: draft.selected_config_entry_id,
  };
}

function deploymentSnapshot(state: BackendState): WireDeploymentSnapshot {
  return {
    revision: state.deployments.length,
    deployments: structuredClone(state.deployments),
  };
}

function requiredItem(state: BackendState, itemId: string): WireLibraryItem {
  const item = state.items[itemId];
  if (!item) {
    throw new Error(`Unknown library item: ${itemId}`);
  }
  return item;
}

function requiredDraft(state: BackendState, draftId: string): WireEffectDraft {
  const draft = state.drafts[draftId];
  if (!draft) {
    throw new Error(`Unknown draft: ${draftId}`);
  }
  return draft;
}

function expectRevision(
  received: unknown,
  expected: number,
  target: string,
): void {
  if (received !== expected) {
    throw new MockConflictError(`${target} revision changed`);
  }
}

function requiredScene(
  scenes: SceneSummary[],
  sceneId: number,
  effectId: number,
): SceneSummary {
  const scene = scenes.find(
    (candidate) =>
      candidate.scene_id === sceneId && candidate.effect_id === effectId,
  );
  if (!scene) {
    throw new Error(`Unknown scene: ${sceneId}/${effectId}`);
  }
  return scene;
}

function testSceneDetail(scene: SceneSummary): SceneDetail {
  if (scene.scene_type === 0) {
    return sceneDetailResult(scene, {
      kind: "scene_builtin",
      template: {
        sku: "H617A",
        scene_id: scene.scene_id,
        effect_id: scene.effect_id,
        catalogue_schema_version: 1,
      },
      speed_index: null,
    });
  }
  if (scene.scene_type === 1) {
    return sceneDetailResult(scene, paletteSceneFixture(scene));
  }
  const advanced = advancedFixture();
  if (scene.scene_id === 2) {
    advanced.layers = [];
  } else if (scene.scene_id === 3) {
    advanced.layers = [advanced.layers[0]];
    advanced.layers[0].brightness_patterns = [];
  }
  return sceneDetailResult(scene, {
    kind: "scene_layered",
    template: {
      sku: "H617A",
      scene_id: scene.scene_id,
      effect_id: scene.effect_id,
      catalogue_schema_version: 1,
    },
    effect: {
      layers: cloneAdvancedContent(advanced).layers,
    },
    speed_index: scene.speed?.default_index ?? null,
    raw_param:
      scene.scene_id === 1
        ? "aabbccddeeff001122334455"
        : scene.scene_id === 1068
          ? "0129000100320201ff3200ff321901fc000600ffff00a3ff0074ff00000000000000000000000000000000"
          : "102030405060708090a0b0c0",
  });
}

function requiredDevice(configEntryId: string): DeviceCapabilities {
  const device = DEVICES.find(
    (candidate) => candidate.config_entry_id === configEntryId,
  );
  if (!device) {
    throw new Error(`Unknown device: ${configEntryId}`);
  }
  return device;
}

function requiredRealSceneCatalogue(model: string): SceneCatalogue {
  const catalogue = REAL_SCENE_CATALOGUES[model];
  if (!catalogue) {
    throw new Error(`Missing real scene catalogue: ${model}`);
  }
  return catalogue;
}

function requiredRealSceneDetail(
  model: string,
  scene: SceneSummary,
): SceneDetail {
  const detail =
    REAL_SCENE_DETAILS[model]?.[`${scene.scene_id}:${scene.effect_id}`];
  if (!detail) {
    throw new Error(
      `Missing real scene detail: ${model} ${scene.scene_id}/${scene.effect_id}`,
    );
  }
  return detail;
}

function sceneDetailResult(
  scene: SceneSummary,
  content: SceneDetail["content"],
): SceneDetail {
  return { scene, content };
}

function paletteSceneFixture(scene: SceneSummary): PaletteSceneContent {
  const template = {
    sku: "H617A",
    scene_id: scene.scene_id,
    effect_id: scene.effect_id,
    catalogue_schema_version: 1,
  };
  if (scene.scene_id === 1041) {
    return {
      kind: "scene_palette",
      template,
      layout: 0,
      brightness_flag: true,
      steps: [
        { value: 5, colour: [255, 245, 0], inline_colour: null },
        { value: 5, colour: [255, 255, 255], inline_colour: null },
        { value: 5, colour: [255, 233, 255], inline_colour: null },
        { value: 5, colour: [255, 255, 255], inline_colour: null },
        { value: 5, colour: [255, 233, 217], inline_colour: null },
        { value: 6, colour: [255, 248, 255], inline_colour: null },
      ],
      palette: [
        [255, 30, 0],
        [255, 90, 0],
        [255, 50, 0],
        [255, 120, 0],
      ],
      speed_index: null,
    };
  }
  if (scene.scene_id === 1049) {
    return {
      kind: "scene_palette",
      template,
      layout: 0,
      brightness_flag: true,
      steps: [
        { value: 50, colour: [255, 180, 255], inline_colour: null },
      ],
      palette: [
        [240, 0, 30],
        [234, 0, 43],
        [188, 0, 255],
        [227, 0, 255],
      ],
      speed_index: null,
    };
  }
  return {
    kind: "scene_palette",
    template,
    layout: 1,
    brightness_flag: true,
    steps: [
      {
        value: 0x1234,
        colour: [1, 2, 3],
        inline_colour: [4, 5, 6],
      },
    ],
    palette: [],
    speed_index: 7,
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

class MockConflictError extends Error {
  public readonly code = "conflict";
}

class MockUnauthorizedError extends Error {
  public readonly code = "unauthorized";

  public constructor() {
    super("Unauthorized");
  }
}
