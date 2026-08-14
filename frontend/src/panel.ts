import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  blankAdvancedContent,
  cloneAdvancedContent,
  cloneLayeredSceneContent,
} from "./advanced-effect-editor";
import "./advanced-effect-editor";
import { EffectStudioApi } from "./api";
import "./colour-picker";
import "./custom-effect-editor";
import "./music-profile-editor";
import "./palette-editor";
import "./painted-segment-editor";
import "./scene-browser";
import "./video-profile-editor";
import {
  studioActionStyles,
  studioBaseStyles,
  studioCardStyles,
  studioEditorStyles,
  studioFeedbackStyles,
  studioFormStyles,
  studioSelectorStyles,
  studioVisuallyHiddenStyles,
  studioWorkspaceStyles,
} from "./studio-styles";
import type {
  AdvancedContent,
  CustomEffectCatalogue,
  CustomEffectContent,
  DeploymentRecord,
  DeviceCapabilities,
  DiyEffectFamily,
  EffectContent,
  HomeAssistant,
  LayeredSceneContent,
  LibraryItem,
  LibrarySummary,
  LibrarySnapshot,
  ModelEffectCatalogue,
  ModelSku,
  MusicProfileContent,
  OpaqueContent,
  PaletteDiyEffectContent,
  PaintedContent,
  PanelConfig,
  RGB,
  VideoProfileContent,
} from "./types";
import {
  compareLabels,
  errorCode,
  errorMessage,
} from "./ui-utils";
import { isCompatibleEditorInfo } from "./validation";

type StudioSection = "video" | "scenes" | "custom";
type AdvancedEditableContent = AdvancedContent | LayeredSceneContent;
type ProfileContent =
  | PaletteDiyEffectContent
  | MusicProfileContent
  | VideoProfileContent;
type EditableEffectContent =
  | CustomEffectContent
  | ProfileContent
  | AdvancedEditableContent;
type NewEffectKind =
  | CustomEffectContent["kind"]
  | PaletteDiyEffectContent["kind"]
  | AdvancedContent["kind"];
type NewEffectType = "single" | "multi" | "advanced";
type DeleteCandidate = Pick<LibrarySummary, "id" | "revision" | "name">;
type CustomEffectCategory =
  | "all"
  | "music"
  | "single-layer"
  | "multi-layer"
  | "advanced"
  | "my-effects";
type CustomEffectListEntry =
  | {
      kind: "paint";
      key: "template:paint";
      label: "Paint";
      category: "single-layer";
    }
  | {
      kind: "single";
      key: string;
      label: string;
      category: "single-layer";
      family: number;
      variant: number;
    }
  | {
      kind: "music";
      key: string;
      label: string;
      category: "music";
      mode?: string;
      family?: number;
      variant?: number;
    }
  | {
      kind: "multi";
      key: "template:mix";
      label: "Mix";
      category: "multi-layer";
    }
  | {
      kind: "advanced";
      key: "template:advanced";
      label: "Layered";
      category: "advanced";
    }
  | {
      kind: "saved";
      key: string;
      label: string;
      category: Exclude<CustomEffectCategory, "all">;
      item: LibrarySummary;
    };

const SEGMENT_COUNT = 15;

export class GoveeLedEffectStudio extends LitElement {
  @property({ attribute: false })
  public hass?: HomeAssistant;

  @property({ attribute: false })
  public panel?: PanelConfig;

  @property({ type: Boolean })
  public showDevicePicker = false;

  @state()
  private loading = true;

  @state()
  private error?: string;

  @state()
  private notice?: string;

  @state()
  private devices: DeviceCapabilities[] = [];

  @state()
  private selectedDeviceId?: string;

  @state()
  private section: StudioSection = "custom";

  @state()
  private customEffectCategory: CustomEffectCategory = "all";

  @state()
  private customTemplateSelection?: string;

  @state()
  private templateSourceLabel?: string;

  @state()
  private customCopyStarted = false;

  @state()
  private library: LibrarySnapshot = {
    library_revision: 0,
    items: [],
  };

  @state()
  private customCatalogue?: CustomEffectCatalogue;

  @state()
  private currentItem?: LibraryItem;

  @state()
  private name = "";

  @state()
  private content: EffectContent = blankPainted();

  @state()
  private paintBrushes = defaultPalette();

  @state()
  private selectedPaintBrush = 0;

  @state()
  private brushUsesBackground = false;

  @state()
  private saving = false;

  @state()
  private applying = false;

  @state()
  private deleteCandidate?: DeleteCandidate;

  @state()
  private deletingItemId?: string;

  @state()
  private deployments: DeploymentRecord[] = [];

  @state()
  private activeOperationId?: string;

  private api?: EffectStudioApi;
  private savedBaseline?: string;
  private editorTransitionEpoch = 0;
  private unsubscribeLibrary?: () => void;
  private unsubscribeDeployments?: () => void;
  private loadEpoch = 0;
  private deploymentRevision = -1;
  private deleteReturnFocus?: HTMLElement;

  private get isAdmin(): boolean {
    return this.hass?.user?.is_admin === true;
  }

  private get selectedDevice(): DeviceCapabilities | undefined {
    return this.devices.find(
      (device) => device.config_entry_id === this.selectedDeviceId,
    );
  }

  private get selectedModel(): ModelSku | undefined {
    const model = this.selectedDevice?.model ?? this.devices[0]?.model;
    return model === "H617A" || model === "H6199" ? model : undefined;
  }

  private get modelCatalogue(): ModelEffectCatalogue | undefined {
    const model = this.selectedModel;
    return model ? this.customCatalogue?.models[model] : undefined;
  }

  private get videoAvailable(): boolean {
    return Boolean(this.modelCatalogue?.video_modes.length);
  }

  private get customEffectsAvailable(): boolean {
    const catalogue = this.modelCatalogue;
    return Boolean(
      catalogue &&
        (catalogue.painted_effects.length ||
          catalogue.effects.length ||
          catalogue.music_modes.length ||
          catalogue.supports.advanced !== "unsupported"),
    );
  }

  private get dirty(): boolean {
    if (!isEditableEffectContent(this.content)) {
      return false;
    }
    return this.savedBaseline !== serialiseEditable(this.name, this.content);
  }

  private get applyCapability() {
    if (!isCustomEffectContent(this.content)) {
      return undefined;
    }
    const capabilities = this.selectedDevice?.custom_effects;
    if (!capabilities) {
      return undefined;
    }
    switch (this.content.kind) {
      case "h617a_painted":
        return capabilities.painted;
      case "h617a_single":
        return capabilities.single;
      case "h617a_multi":
        return capabilities.multi;
    }
  }

  private get canApply(): boolean {
    return (
      isCustomEffectContent(this.content) &&
      this.isAdmin &&
      !this.applying &&
      !this.deletingCurrentItem &&
      this.name.trim().length > 0 &&
      this.applyCapability === "supported"
    );
  }

  private get deletingCurrentItem(): boolean {
    return (
      this.deletingItemId !== undefined &&
      this.currentItem?.id === this.deletingItemId
    );
  }

  private get activeDeployment(): DeploymentRecord | undefined {
    const selected = this.deployments.find(
      (deployment) => deployment.operation_id === this.activeOperationId,
    );
    if (selected || !this.applying) {
      return selected;
    }
    return this.latestDeployment([
      "pending",
      "uploading",
      "verifying",
    ]);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.hass && !this.api) {
      void this.load();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.loadEpoch += 1;
    this.beginEditorTransition();
    this.stopSubscriptions();
    this.api = undefined;
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("hass") && this.hass && !this.api) {
      void this.load();
    }
    this.syncSingleEffectSelects();
  }

  protected render() {
    if (this.loading) {
      return html`<div class="centred" role="status">Loading effect studio...</div>`;
    }
    if (this.error) {
      return this.renderFatalError();
    }

    return html`
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.notice
        ? html`<div class="notice" role="status">${this.notice}</div>`
        : nothing}

      <main
        class="studio ${this.section}-mode"
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.videoAvailable
            ? this.navButton("video", "Video")
            : nothing}
          ${this.navButton("scenes", "Scenes")}
          ${this.customEffectsAvailable
            ? this.navButton("custom", "Effects")
            : nothing}
          ${this.showDevicePicker ? this.renderDevicePicker() : nothing}
        </nav>

        <govee-scene-browser
          ?hidden=${this.section !== "scenes"}
          .api=${this.api}
          .device=${this.selectedDevice}
          .library=${this.library}
          .isAdmin=${this.isAdmin}
          @library-item-saved=${this.sceneLibraryItemSaved}
          @scene-edit-selected=${this.sceneTemplateSelected}
        ></govee-scene-browser>
        ${this.section === "video" ? this.renderVideo() : nothing}
        ${this.section === "custom" ? this.renderCustomEffects() : nothing}
      </main>
      ${this.deleteCandidate ? this.renderDeleteConfirmation() : nothing}
    `;
  }

  private renderDevicePicker() {
    return html`
      <div class="device-picker">
        <select
          aria-label="Development device"
          .value=${this.selectedDeviceId ?? ""}
          @change=${this.deviceChanged}
        >
          ${this.devices.map(
            (device) => html`
              <option value=${device.config_entry_id}>
                ${device.display_name} / ${device.model}
              </option>
            `,
          )}
          ${this.selectedDeviceId && !this.selectedDevice
            ? html`
                <option value=${this.selectedDeviceId} disabled>
                  Device temporarily unavailable
                </option>
              `
            : nothing}
        </select>
      </div>
    `;
  }

  private renderFatalError() {
    return html`
      <main class="fatal">
        <h1>Effect Studio is unavailable</h1>
        <p role="alert">${this.error}</p>
        <p>Existing light controls are unaffected.</p>
        <a href=${this.panel?.config?.configuration_path ?? "/config/integrations"}>
          Open integration configuration
        </a>
      </main>
    `;
  }

  private navButton(section: StudioSection, label: string) {
    return html`
      <button
        class="selector ${this.section === section ? "selected" : ""}"
        type="button"
        aria-current=${this.section === section ? "page" : nothing}
        @click=${() => void this.selectSection(section)}
      >
        ${label}
      </button>
    `;
  }

  private renderCustomEffects() {
    const newEffectKind = this.defaultNewEffectKind;
    return html`
      <aside
        class="sidebar category-sidebar effect-categories"
        aria-label="Effect categories"
      >
        ${newEffectKind
          ? html`
              <button
                class="selector"
                type="button"
                ?disabled=${!this.isAdmin}
                @click=${() => this.newEffect(newEffectKind)}
              >
                New
              </button>
            `
          : nothing}
        ${this.customEffectCategoryButton("all", "All")}
        ${this.customEffectCategoryAvailable("music")
          ? this.customEffectCategoryButton("music", "Music")
          : nothing}
        ${this.customEffectCategoryAvailable("single-layer")
          ? this.customEffectCategoryButton("single-layer", "Single Layer")
          : nothing}
        ${this.customEffectCategoryAvailable("multi-layer")
          ? this.customEffectCategoryButton("multi-layer", "Multi Layer")
          : nothing}
        ${this.customEffectCategoryAvailable("advanced")
          ? this.customEffectCategoryButton("advanced", "Advanced")
          : nothing}
        ${this.customEffectCategoryAvailable("my-effects")
          ? this.customEffectCategoryButton("my-effects", "My effects")
          : nothing}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        ${this.customEffectEntries.map((entry) =>
          this.customEffectListButton(entry),
        )}
      </aside>

      <section class="editor-surface editor">
        ${this.name || this.currentItem
          ? this.renderCurrentCustomEditor()
          : nothing}
      </section>
    `;
  }

  private renderCurrentCustomEditor() {
    if (isCustomEffectContent(this.content)) {
      return this.content.kind === "h617a_painted"
        ? this.renderPaintedEditor()
        : this.renderPaletteEffectEditor();
    }
    if (this.content.kind === "palette_diy") {
      return this.renderPaletteEffectEditor();
    }
    if (this.content.kind === "music_profile") {
      return this.renderMusicProfileEditor();
    }
    if (isAdvancedEditableContent(this.content)) {
      return this.renderAdvancedEditor();
    }
    return this.content.kind === "opaque"
      ? this.renderOpaqueEditor(this.content)
      : nothing;
  }

  private renderVideo() {
    const catalogue = this.modelCatalogue;
    if (!catalogue || !this.videoAvailable) {
      return nothing;
    }
    const saved = this.library.items
      .filter(
        (item) =>
          item.kind === "video_profile" && this.libraryItemAvailable(item),
      )
      .sort((left, right) => compareLabels(left.name, right.name));
    return html`
      <aside class="sidebar item-sidebar library" aria-label="Video profiles">
        ${catalogue.video_modes.map((mode) =>
          this.videoListButton(
            `template:video:${mode.id}`,
            mode.label,
            () => this.openVideoTemplate(mode.id, mode.label),
          ),
        )}
        ${saved.map((item) =>
          this.videoListButton(
            `saved:${item.id}`,
            item.name,
            () => void this.selectItem(item.id),
            item,
          ),
        )}
      </aside>
      <section class="editor-surface editor">
        ${this.content.kind === "video_profile"
          ? this.renderVideoProfileEditor()
          : nothing}
      </section>
    `;
  }

  private videoListButton(
    key: string,
    label: string,
    select: () => void,
    item?: LibrarySummary,
  ) {
    const selected = item
      ? this.currentItem?.id === item.id
      : !this.currentItem && this.customTemplateSelection === key;
    return html`
      <button
        class="selector item ${selected ? "selected" : ""}"
        type="button"
        ?disabled=${!item && !this.isAdmin}
        @click=${select}
      >
        <span>${label}</span>
      </button>
    `;
  }

  private openVideoTemplate(mode: string, label: string): void {
    if (this.selectedModel !== "H6199") {
      return;
    }
    this.openEditableTemplate(
      label,
      blankVideoProfile(mode),
      `template:video:${mode}`,
    );
  }

  private renderVideoProfileEditor() {
    if (this.content.kind !== "video_profile") {
      return nothing;
    }
    return html`
      ${this.renderProfileHeading()}
      <govee-video-profile-editor
        .content=${this.content}
        .disabled=${!this.isAdmin}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${(
          event: CustomEvent<{ content: VideoProfileContent }>,
        ) => {
          this.content = cloneVideoProfile(event.detail.content);
        }}
      ></govee-video-profile-editor>
    `;
  }

  private renderMusicProfileEditor() {
    if (this.content.kind !== "music_profile") {
      return nothing;
    }
    return html`
      ${this.renderProfileHeading()}
      <govee-music-profile-editor
        .content=${this.content}
        .catalogue=${this.modelCatalogue}
        .disabled=${!this.isAdmin}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${(
          event: CustomEvent<{ content: MusicProfileContent }>,
        ) => {
          this.content = cloneMusicProfile(event.detail.content);
        }}
      ></govee-music-profile-editor>
    `;
  }

  private renderProfileHeading() {
    return this.renderEditorHeading(
      html`<button class="secondary" type="button" disabled>Apply</button>`,
    );
  }

  private get customEffectEntries(): CustomEffectListEntry[] {
    const catalogue = this.modelCatalogue;
    const musicFamily = catalogue?.effects.find(
      (effect) => effect.id === "music",
    );
    const entries: CustomEffectListEntry[] = [
      ...(catalogue?.painted_effects.length
        ? [
            {
              kind: "paint" as const,
              key: "template:paint" as const,
              label: "Paint" as const,
              category: "single-layer" as const,
            },
          ]
        : []),
      ...(catalogue?.music_modes.map(
        (mode): CustomEffectListEntry => ({
          kind: "music",
          key: `template:music:${mode.id}`,
          label: mode.label,
          category: "music",
          mode: mode.id,
        }),
      ) ?? []),
      ...(musicFamily
        ? [
            {
              kind: "music" as const,
              key: `template:music:custom:${musicFamily.family}`,
              label: "Custom",
              category: "music" as const,
              family: musicFamily.family,
              variant: musicFamily.variations[0].variant,
            },
          ]
        : []),
      ...(catalogue?.effects
        .filter((effect) => effect.id !== "music")
        .map(
        (effect): CustomEffectListEntry => ({
          kind: "single",
          key: `template:single:${effect.family}:${effect.variations[0].variant}`,
          label: effect.label,
          category: "single-layer",
          family: effect.family,
          variant: effect.variations[0].variant,
        }),
      ) ?? []),
      ...(catalogue?.supports.multi !== "unsupported"
        ? [
            {
              kind: "multi" as const,
              key: "template:mix" as const,
              label: "Mix" as const,
              category: "multi-layer" as const,
            },
          ]
        : []),
      {
        kind: "advanced",
        key: "template:advanced",
        label: "Layered",
        category: "advanced",
      },
      ...this.library.items
        .filter(
          (item) =>
            isMyEffectKind(item.kind) &&
            item.kind !== "video_profile",
        )
        .map(
          (item): CustomEffectListEntry => ({
            kind: "saved",
            key: `saved:${item.id}`,
            label: item.name,
            category: customEffectCategoryForKind(item.kind),
            item,
          }),
        ),
    ];
    return entries
      .filter((entry) => this.customEffectEntryAvailable(entry))
      .filter(
        (entry) =>
          this.customEffectCategory === "all" ||
          (this.customEffectCategory === "my-effects" &&
            entry.kind === "saved") ||
          entry.category === this.customEffectCategory,
      )
      .sort((left, right) => compareLabels(left.label, right.label));
  }

  private customEffectEntryAvailable(entry: CustomEffectListEntry): boolean {
    switch (entry.kind) {
      case "paint":
        return this.customEffectKindAvailable("h617a_painted");
      case "single":
        return this.customEffectKindAvailable(
          this.selectedModel === "H617A"
            ? "h617a_single"
            : "palette_diy",
        );
      case "music":
        return entry.mode
          ? this.customEffectKindAvailable("music_profile")
          : this.customEffectKindAvailable("palette_diy") ||
              this.customEffectKindAvailable("h617a_single");
      case "multi":
        return this.customEffectKindAvailable("h617a_multi");
      case "advanced":
        return this.customEffectKindAvailable("advanced");
      case "saved":
        return this.libraryItemAvailable(entry.item);
    }
  }

  private libraryItemAvailable(item: LibrarySummary): boolean {
    const model = this.selectedModel;
    if (item.model !== undefined && item.model !== model) {
      return false;
    }
    if (item.kind === "video_profile") {
      return this.videoAvailable;
    }
    if (
      item.model === undefined &&
      ["h617a_painted", "h617a_single", "h617a_multi"].includes(item.kind) &&
      model !== "H617A"
    ) {
      return false;
    }
    return this.customEffectKindAvailable(item.kind);
  }

  private effectContentAvailable(content: EffectContent): boolean {
    const model = this.selectedModel;
    if (
      content.kind === "h617a_painted" ||
      content.kind === "h617a_single" ||
      content.kind === "h617a_multi"
    ) {
      return model === "H617A";
    }
    if (
      content.kind === "palette_diy" ||
      content.kind === "music_profile" ||
      content.kind === "video_profile"
    ) {
      return content.model === model;
    }
    if (content.kind === "scene_layered") {
      return content.template.sku === model;
    }
    return this.customEffectKindAvailable(content.kind);
  }

  private customEffectCategoryAvailable(
    category: CustomEffectCategory,
  ): boolean {
    switch (category) {
      case "all":
        return this.customEffectsAvailable;
      case "music":
        return Boolean(this.modelCatalogue?.music_modes.length);
      case "single-layer":
        return (
          this.customEffectKindAvailable("h617a_painted") ||
          this.customEffectKindAvailable("h617a_single") ||
          this.customEffectKindAvailable("palette_diy")
        );
      case "multi-layer":
        return this.customEffectKindAvailable("h617a_multi");
      case "advanced":
        return this.customEffectKindAvailable("advanced");
      case "my-effects":
        return this.library.items.some(
          (item) =>
            item.kind !== "video_profile" &&
            isMyEffectKind(item.kind) &&
            this.libraryItemAvailable(item),
        );
    }
  }

  private customEffectKindAvailable(kind: string): boolean {
    const catalogue = this.modelCatalogue;
    const model = this.selectedModel;
    if (kind === "h617a_painted") {
      return model === "H617A" && Boolean(catalogue?.painted_effects.length);
    }
    if (kind === "h617a_single") {
      return model === "H617A" && Boolean(catalogue?.effects.length);
    }
    if (kind === "palette_diy") {
      return model === "H6199" && Boolean(catalogue?.effects.length);
    }
    if (kind === "h617a_multi") {
      return model === "H617A" && catalogue?.supports.multi !== "unsupported";
    }
    if (kind === "music_profile") {
      return Boolean(catalogue?.music_modes.length);
    }
    return catalogue?.supports.advanced !== "unsupported";
  }

  private get defaultNewEffectKind(): NewEffectKind | undefined {
    if (this.customEffectKindAvailable("h617a_single")) {
      return "h617a_single";
    }
    if (this.customEffectKindAvailable("palette_diy")) {
      return "palette_diy";
    }
    if (this.customEffectKindAvailable("h617a_painted")) {
      return "h617a_painted";
    }
    if (this.customEffectKindAvailable("h617a_multi")) {
      return "h617a_multi";
    }
    return this.customEffectKindAvailable("advanced")
      ? "advanced"
      : undefined;
  }

  private customEffectCategoryButton(
    category: CustomEffectCategory,
    label: string,
  ) {
    const selected = this.customEffectCategory === category;
    return html`
      <button
        class="selector ${selected ? "selected" : ""}"
        type="button"
        aria-current=${selected ? "page" : nothing}
        @click=${() => {
          this.customEffectCategory = category;
        }}
      >
        ${label}
      </button>
    `;
  }

  private customEffectListButton(entry: CustomEffectListEntry) {
    const selected =
      entry.kind === "saved"
        ? this.currentItem?.id === entry.item.id
        : !this.currentItem && this.customTemplateSelection === entry.key;
    return html`
      <button
        class="selector item ${selected ? "selected" : ""}"
        type="button"
        ?disabled=${entry.kind !== "saved" && !this.isAdmin}
        @click=${() => this.selectCustomEffectEntry(entry)}
      >
        <span>${entry.label}</span>
      </button>
    `;
  }

  private renderDeleteConfirmation() {
    const candidate = this.deleteCandidate!;
    const discardsOpenEdits =
      this.currentItem?.id === candidate.id && this.dirty;
    return html`
      <div class="dialog-backdrop" @click=${this.cancelDelete}>
        <section
          class="delete-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-effect-title"
          @click=${(event: Event) => event.stopPropagation()}
          @keydown=${this.deleteDialogKeyDown}
        >
          <h2 id="delete-effect-title">Delete effect?</h2>
          <p>
            <strong>${candidate.name}</strong> will be removed from the shared
            Effect Studio library.
          </p>
          ${discardsOpenEdits
            ? html`<p>Unsaved changes in the open effect will be discarded.</p>`
            : nothing}
          <div class="dialog-actions">
            <button
              class="secondary"
              type="button"
              @click=${this.cancelDelete}
            >
              Cancel
            </button>
            <button
              class="danger"
              type="button"
              @click=${this.confirmDelete}
            >
              Delete effect
            </button>
          </div>
        </section>
      </div>
    `;
  }

  private selectCustomEffectEntry(entry: CustomEffectListEntry): void {
    if (entry.kind === "saved") {
      void this.selectItem(entry.item.id);
      return;
    }
    if (entry.kind === "advanced") {
      this.newEffect("advanced", undefined, {
        name: entry.label,
        content: blankAdvancedContent(),
        selectionIdentity: entry.key,
        templateLabel: entry.label,
      });
      this.customTemplateSelection = entry.key;
      return;
    }
    const catalogue = this.modelCatalogue;
    if (!catalogue) {
      return;
    }
    if (entry.kind === "music") {
      if (entry.mode) {
        this.openMusicTemplate(entry.mode, entry.label);
        return;
      }
      if (entry.family === undefined || entry.variant === undefined) {
        return;
      }
      const content =
        this.selectedModel === "H617A"
          ? {
              ...blankCustomEffect("h617a_single", catalogue),
              family: entry.family,
              variant: entry.variant,
            }
          : blankPaletteDiy(
              catalogue,
              this.selectedModel!,
              entry.family,
              entry.variant,
            );
      this.openEditableTemplate(
        entry.label,
        content,
        entry.key,
      );
      return;
    }
    if (entry.kind === "paint") {
      this.newEffect("h617a_painted", undefined, {
        name: entry.label,
        content: blankPainted(),
        selectionIdentity: entry.key,
        templateLabel: entry.label,
      });
      return;
    }
    if (entry.kind === "single") {
      if (this.selectedModel === "H617A") {
        const content = blankCustomEffect(
          "h617a_single",
          catalogue,
        );
        this.newEffect("h617a_single", undefined, {
          name: entry.label,
          content: {
            ...content,
            family: entry.family,
            variant: entry.variant,
          },
          selectionIdentity: entry.key,
          templateLabel: entry.label,
        });
      } else {
        this.openEditableTemplate(
          entry.label,
          blankPaletteDiy(
            catalogue,
            this.selectedModel!,
            entry.family,
            entry.variant,
          ),
          entry.key,
        );
      }
      return;
    }
    this.newEffect("h617a_multi", undefined, {
      name: entry.label,
      content: blankCustomEffect("h617a_multi", catalogue),
      selectionIdentity: entry.key,
      templateLabel: entry.label,
    });
  }

  private openEditableTemplate(
    label: string,
    content: EditableEffectContent,
    selectionIdentity: string,
  ): void {
    this.beginEditorTransition();
    this.currentItem = undefined;
    this.templateSourceLabel = label;
    this.customCopyStarted = true;
    this.customTemplateSelection = selectionIdentity;
    this.name = label;
    this.content = cloneEditableEffect(content);
    this.savedBaseline = undefined;
    this.notice = undefined;
  }

  private openMusicTemplate(mode: string, label: string): void {
    const model = this.selectedModel;
    if (model !== "H617A" && model !== "H6199") {
      return;
    }
    this.openEditableTemplate(
      label,
      {
        kind: "music_profile",
        model,
        mode,
        sensitivity: model === "H6199" ? 100 : 99,
        colour: null,
        calm: ["rhythm", "bloom", "shiny"].includes(mode)
          ? false
          : null,
        parameters: {},
      },
      `template:music:${mode}`,
    );
  }

  private renderAdvancedEditor() {
    if (!isAdvancedEditableContent(this.content)) {
      return nothing;
    }
    const layeredScene = this.content.kind === "scene_layered";
    return html`
      ${layeredScene
        ? html`
            <button
              class="back-button"
              type="button"
              @click=${this.backToScenes}
            >
              ← Back to Scenes
            </button>
          `
        : nothing}
      ${this.renderEditorHeading(
        html`
          <button class="secondary" type="button" disabled>
            Apply
          </button>
        `,
      )}

      ${this.renderNewEffectTypeTabs()}

      ${!this.isAdmin
        ? html`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `
        : nothing}

      ${layeredScene
        ? html`
            <div class="feedback source-note" role="note">
              Source parameter bytes remain immutable provenance. Layer edits
              are saved separately and may diverge from those bytes.
            </div>
          `
        : nothing}

      <govee-advanced-effect-editor
        .content=${advancedEditorContent(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count ?? 15}
        @content-changed=${(
          event: CustomEvent<{ content: AdvancedContent }>,
        ) => {
          if (!isAdvancedEditableContent(this.content)) {
            return;
          }
          this.content = updateAdvancedEditorContent(
            this.content,
            event.detail.content,
          );
        }}
      ></govee-advanced-effect-editor>
    `;
  }

  private renderOpaqueEditor(content: OpaqueContent) {
    return html`
      ${this.renderEditorHeading(
        html`<button class="secondary" type="button" disabled>Apply</button>`,
        { save: false, title: html`<h2>${this.name}</h2>` },
      )}
      <div class="feedback read-only" role="note">
        This effect definition can be inspected, but this editor cannot change,
        save or apply it.
      </div>
      <section class="card opaque-content">
        <h3 class="section-title">Source kind</h3>
        <p><code>${content.source_kind}</code></p>
        <h3 class="section-title">Preserved content</h3>
        <pre aria-label="Preserved opaque content">${JSON.stringify(
          content.body,
          null,
          2,
        )}</pre>
      </section>
    `;
  }

  private renderPaintedEditor() {
    if (this.content.kind !== "h617a_painted") {
      return nothing;
    }
    const deployment = this.activeDeployment;
    return html`
      ${this.renderEditorHeading(html`
        <button
          class="secondary"
          type="button"
          ?disabled=${!this.canApply}
          @click=${this.apply}
        >
          ${this.applying ? "Applying..." : "Apply"}
        </button>
      `)}

      ${this.renderNewEffectTypeTabs()}

      ${!this.isAdmin
        ? html`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `
        : nothing}

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .colours=${coloursForSegments(this.content)}
        .disabled=${!this.isAdmin}
        @segment-selected=${(
          event: CustomEvent<{ index: number }>,
        ) => this.setSegmentColour(event.detail.index)}
      ></govee-painted-segment-editor>

      <div class="controls">
        <section class="card">
          <h3 class="section-title">Brushes</h3>
          <govee-palette-editor
            class="paint-brushes"
            .palette=${this.paintBrushes}
            .minColours=${2}
            .maxColours=${8}
            .disabled=${!this.isAdmin}
            .persistentPicker=${true}
            .selectedIndex=${this.selectedPaintBrush}
            ariaLabel="Brushes"
            itemName="brush"
            @palette-changed=${this.paintBrushesChanged}
            @colour-selected=${this.paintBrushSelected}
          ></govee-palette-editor>
          <div class="background-colour">
            <span class="parameter-label">Background</span>
            <govee-colour-picker
              .colour=${this.content.background}
              .disabled=${!this.isAdmin}
              @colour-changing=${this.backgroundChanged}
              @colour-changed=${this.backgroundChanged}
            ></govee-colour-picker>
          </div>
          <div class="button-row">
            <button
              class="secondary ${this.brushUsesBackground ? "active" : ""}"
              type="button"
              ?disabled=${!this.isAdmin}
              aria-pressed=${this.brushUsesBackground}
              @click=${() => {
                this.brushUsesBackground = !this.brushUsesBackground;
              }}
            >
              Use background
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${!this.isAdmin}
              @click=${this.paintAll}
            >
              Paint all
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${!this.isAdmin}
              @click=${this.resetPaint}
            >
              Reset
            </button>
          </div>
        </section>

        <section class="card">
          <div class="parameter-stack">
            ${this.renderPaintedVariationField()}
            ${this.rangeField("Speed", "speed", this.content.speed)}
            ${this.rangeField(
              "Brightness",
              "brightness",
              this.content.brightness,
            )}
          </div>
        </section>
      </div>

      ${deployment ? this.renderDeployment(deployment) : nothing}
    `;
  }

  private renderPaletteEffectEditor() {
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "h617a_multi" &&
      this.content.kind !== "palette_diy"
    ) {
      return nothing;
    }
    const content = this.content;
    const deployment = this.activeDeployment;
    return html`
      ${this.renderEditorHeading(html`
        <button
          class="secondary"
          type="button"
          ?disabled=${!this.canApply}
          @click=${this.apply}
        >
          ${this.applying ? "Applying..." : "Apply"}
        </button>
      `)}

      ${this.renderNewEffectTypeTabs()}

      ${!this.isAdmin
        ? html`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `
        : nothing}

      ${this.renderSingleEffectSelector()}

      <govee-custom-effect-editor
        .content=${content}
        .catalogue=${this.modelCatalogue}
        .disabled=${!this.isAdmin}
        @content-changed=${(
          event: CustomEvent<{
            content:
              | CustomEffectContent
              | PaletteDiyEffectContent;
          }>,
        ) => {
          this.content =
            event.detail.content.kind === "palette_diy"
              ? clonePaletteDiy(event.detail.content)
              : cloneCustomEffect(event.detail.content);
        }}
      ></govee-custom-effect-editor>

      ${deployment ? this.renderDeployment(deployment) : nothing}
    `;
  }

  private renderSingleEffectSelector() {
    if (
      !this.customCatalogue ||
      this.templateSourceLabel ||
      (this.content.kind !== "h617a_painted" &&
        this.content.kind !== "h617a_single" &&
        this.content.kind !== "palette_diy")
    ) {
      return nothing;
    }
    if (
      this.currentItem?.content.kind === "h617a_painted" &&
      this.content.kind === "h617a_painted"
    ) {
      return nothing;
    }
    const family = this.selectedSingleEffectFamily;
    const currentFamily =
      this.content.kind === "h617a_painted" ? undefined : this.content.family;
    const effectFamilies =
      this.currentItem?.content.kind === "h617a_painted"
        ? []
        : this.modelCatalogue?.effects.filter(
            (effect) =>
              effect.id !== "music" ||
              effect.family === currentFamily,
          ) ?? [];
    const familyAvailable = effectFamilies.some(
      (effect) => effect.family === family?.family,
    );
    const selectedEffect =
      this.content.kind === "h617a_painted"
        ? "paint"
        : family && familyAvailable
          ? family.id
          : `unknown:${this.content.family}`;
    const includePaint =
      this.customEffectKindAvailable("h617a_painted") &&
      this.currentItem?.content.kind !== "h617a_single";
    return html`
      <section class="card single-effect-settings">
        <label class="field">
          <span>Effect</span>
          <select
            aria-label="Effect"
            .value=${selectedEffect}
            ?disabled=${!this.isAdmin}
            @change=${this.singleEffectChanged}
          >
            ${(this.content.kind === "h617a_single" ||
              this.content.kind === "palette_diy") && !familyAvailable
              ? html`
                  <option value=${selectedEffect}>
                    Unknown effect ${this.content.family}
                  </option>
                `
              : nothing}
            ${includePaint
              ? html`
                  <option
                    value="paint"
                    ?selected=${selectedEffect === "paint"}
                  >
                    Paint
                  </option>
                `
              : nothing}
            ${effectFamilies.map(
              (effect) => html`
                <option
                  value=${effect.id}
                  ?selected=${selectedEffect === effect.id}
                >
                  ${effect.label}
                </option>
              `,
            )}
          </select>
        </label>
      </section>
    `;
  }

  private renderPaintedVariationField() {
    if (!this.customCatalogue || this.content.kind !== "h617a_painted") {
      return nothing;
    }
    const content = this.content;
    const variations = this.customCatalogue.painted_effects;
    const knownVariation = variations.some(
      (variation) => variation.id === content.effect,
    );
    if (knownVariation && variations.length <= 1) {
      return nothing;
    }
    return html`
      <label class="field">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          .value=${content.effect}
          ?disabled=${!this.isAdmin}
          @change=${this.paintedEffectVariationChanged}
        >
          ${knownVariation
            ? nothing
            : html`
                <option value=${content.effect}>
                  Unknown variation ${content.effect}
                </option>
              `}
          ${variations.map(
            (variation) => html`
              <option
                value=${variation.id}
                ?selected=${variation.id === content.effect}
              >
                ${variation.label}
              </option>
            `,
          )}
        </select>
      </label>
    `;
  }

  private renderEffectName() {
    return this.templateSourceLabel
      ? html`<h2>${this.templateSourceLabel}</h2>`
      : html`
          <input
            class="editor-name"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        `;
  }

  private renderEditorHeading(
    applyAction: unknown,
    options: { save?: boolean; title?: unknown } = {},
  ) {
    return html`
      <div class="editor-heading">
        <div>${options.title ?? this.renderEffectName()}</div>
        <div class="actions">
          ${options.save === false ? nothing : this.renderSaveAction()}
          ${applyAction}
          ${this.renderEditorDeleteButton()}
        </div>
      </div>
    `;
  }

  private renderSaveAction() {
    return this.templateSourceLabel
      ? html`
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin ||
            this.saving ||
            this.deletingCurrentItem}
            @click=${this.saveAsCustom}
          >
            Save as Custom
          </button>
        `
      : html`
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin ||
            !this.dirty ||
            this.saving ||
            this.deletingCurrentItem}
            @click=${this.save}
          >
            ${this.saving ? "Saving..." : "Save"}
          </button>
        `;
  }

  private get selectedSingleEffectFamily(): DiyEffectFamily | undefined {
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "palette_diy"
    ) {
      return undefined;
    }
    const family = this.content.family;
    return this.modelCatalogue?.effects.find(
      (effect) => effect.family === family,
    );
  }

  private syncSingleEffectSelects(): void {
    if (
      this.content.kind !== "h617a_painted" &&
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "palette_diy"
    ) {
      return;
    }
    const effect = this.shadowRoot?.querySelector<HTMLSelectElement>(
      'select[aria-label="Effect"]',
    );
    if (effect) {
      effect.value =
        this.content.kind === "h617a_painted"
          ? "paint"
          : this.selectedSingleEffectFamily?.id ??
            `unknown:${this.content.family}`;
    }
    if (this.content.kind === "h617a_painted") {
      const variation = this.shadowRoot?.querySelector<HTMLSelectElement>(
        'select[aria-label="Variation"]',
      );
      if (variation) {
        variation.value = this.content.effect;
      }
    }
  }

  private rangeField(
    label: string,
    key: "speed" | "brightness",
    value: number,
  ) {
    return html`
      <label class="range-field">
        <span class="parameter-label">${label}</span>
        <input
          type="range"
          min="0"
          max="100"
          .value=${String(value)}
          ?disabled=${!this.isAdmin}
          @input=${(event: Event) =>
            this.updateContent({
              [key]: Number((event.target as HTMLInputElement).value),
            })}
        />
        <output>${value}%</output>
      </label>
    `;
  }

  private renderNewEffectTypeTabs() {
    if (
      this.currentItem ||
      this.templateSourceLabel ||
      this.customCopyStarted ||
      !isEditableEffectContent(this.content)
    ) {
      return nothing;
    }
    return html`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.newEffectTypeAvailable("single")
          ? this.newEffectTypeButton("single", "Single")
          : nothing}
        ${this.newEffectTypeAvailable("multi")
          ? this.newEffectTypeButton("multi", "Multi")
          : nothing}
        ${this.newEffectTypeAvailable("advanced")
          ? this.newEffectTypeButton("advanced", "Advanced")
          : nothing}
      </div>
    `;
  }

  private newEffectTypeAvailable(type: NewEffectType): boolean {
    if (type === "single") {
      return (
        this.customEffectKindAvailable("h617a_painted") ||
        this.customEffectKindAvailable("h617a_single") ||
        this.customEffectKindAvailable("palette_diy")
      );
    }
    return this.customEffectKindAvailable(
      type === "multi" ? "h617a_multi" : "advanced",
    );
  }

  private newEffectTypeButton(
    type: NewEffectType,
    label: string,
  ) {
    const selected = newEffectTypeForContent(this.content) === type;
    const wouldDiscardSequence =
      type === "single" &&
      this.content.kind === "h617a_multi" &&
      this.content.effects.length > 1;
    return html`
      <button
        type="button"
        role="tab"
        aria-selected=${selected}
        class=${selected ? "selected" : ""}
        title=${wouldDiscardSequence
          ? "Remove all but one effect before switching to Single"
          : nothing}
        ?disabled=${!this.isAdmin || wouldDiscardSequence}
        @click=${() => this.switchNewEffectType(type)}
      >
        ${label}
      </button>
    `;
  }

  private renderDeployment(deployment: DeploymentRecord) {
    const deviceName =
      this.devices.find(
        (device) => device.config_entry_id === deployment.config_entry_id,
      )?.display_name ?? "device";
    let message: string;
    switch (deployment.phase) {
      case "pending":
        message = `Preparing to apply to ${deviceName}.`;
        break;
      case "uploading":
        message = `Applying to ${deviceName}: ${deployment.progress_current} of ${deployment.progress_total}.`;
        break;
      case "verifying":
        message = `Checking the selected effect on ${deviceName}.`;
        break;
      case "confirmed":
        message = `Applied to ${deviceName}. The selected custom-effect code was confirmed, but exact effect contents cannot be read back.`;
        break;
      case "unknown":
        message = `Applied to ${deviceName}, but the selected effect could not be confirmed.`;
        break;
      case "interrupted":
        message = `Apply to ${deviceName} was interrupted by a Home Assistant restart.`;
        break;
      case "failed":
        message = `Apply to ${deviceName} failed.`;
        break;
    }
    return html`
      <div
        class="feedback deployment ${deployment.phase}"
        role=${deployment.phase === "failed" ? "alert" : "status"}
      >
        ${message}
      </div>
    `;
  }

  private async selectSection(section: StudioSection): Promise<void> {
    const transitionEpoch = this.beginEditorTransition();
    if (section === this.section) {
      return;
    }
    if (section === "custom" && !this.customEffectsAvailable) {
      return;
    }
    if (section === "video" && !this.videoAvailable) {
      return;
    }
    this.section = section;
    this.notice = undefined;
    if (section === "scenes") {
      return;
    }
    if (section === "video") {
      const savedVideo = this.library.items.find(
        (item) =>
          item.kind === "video_profile" && this.libraryItemAvailable(item),
      );
      if (savedVideo) {
        await this.selectItem(savedVideo.id, transitionEpoch);
        return;
      }
      const mode = this.modelCatalogue?.video_modes[0];
      if (mode) {
        this.openVideoTemplate(mode.id, mode.label);
      }
      return;
    }
    if (
      (isCustomEffectContent(this.content) ||
        this.content.kind === "palette_diy" ||
        this.content.kind === "music_profile" ||
        isAdvancedEditableContent(this.content) ||
        this.content.kind === "opaque") &&
      this.customEffectKindAvailable(this.content.kind)
    ) {
      return;
    }
    const item = this.preferredLibraryEffect();
    if (item) {
      await this.selectItem(item.id, transitionEpoch);
      return;
    }
    if (this.isAdmin) {
      this.openDefaultAvailableTemplate(transitionEpoch);
    } else {
      this.currentItem = undefined;
      this.name = "";
    }
  }

  private async load(): Promise<void> {
    const loadEpoch = this.loadEpoch + 1;
    this.loadEpoch = loadEpoch;
    this.loading = true;
    this.error = undefined;
    this.deploymentRevision = -1;
    const api = new EffectStudioApi(this.hass!);
    this.api = api;
    try {
      const [info, devices, library, customCatalogue] = await Promise.all([
        api.info(),
        api.devices(),
        api.library(),
        api.customCatalogue(),
      ]);
      if (!this.loadIsCurrent(loadEpoch, api)) {
        return;
      }

      if (!isCompatibleEditorInfo(info)) {
        throw new Error(
          "This editor bundle is not compatible with the installed backend.",
        );
      }
      this.devices = devices;
      this.library = library;
      this.customCatalogue = customCatalogue;
      this.selectedDeviceId =
        this.deviceIdFromPath() ??
        devices.find(
          (device) => device.custom_effects.painted === "supported",
        )?.config_entry_id ??
        devices[0]?.config_entry_id;
      if (!this.customEffectsAvailable) {
        this.section = "scenes";
      }

      const unsubscribeLibrary = await api.subscribeLibrary(
        (snapshot) => {
          void this.libraryChanged(snapshot);
        },
        (error) => this.subscriptionFailed(error, loadEpoch, api),
      );
      if (!this.loadIsCurrent(loadEpoch, api) || this.error) {
        unsubscribeLibrary();
        return;
      }
      this.unsubscribeLibrary = unsubscribeLibrary;
      if (this.isAdmin) {
        const unsubscribeDeployments = await api.subscribeDeployments(
          (snapshot) => {
            if (snapshot.revision < this.deploymentRevision) {
              return;
            }
            this.deploymentRevision = snapshot.revision;
            this.deployments = snapshot.deployments;
            if (!this.activeOperationId) {
              this.activeOperationId = this.latestDeployment([
                "pending",
                "uploading",
                "verifying",
                "interrupted",
              ])?.operation_id;
            }
          },
          (error) => this.subscriptionFailed(error, loadEpoch, api),
        );
        if (!this.loadIsCurrent(loadEpoch, api) || this.error) {
          unsubscribeDeployments();
          return;
        }
        this.unsubscribeDeployments = unsubscribeDeployments;
      }

      const firstCustom = this.preferredLibraryEffect(library.items);
      if (firstCustom) {
        await this.selectItem(firstCustom.id);
      } else if (this.isAdmin) {
        this.openDefaultAvailableTemplate();
      }
    } catch (error) {
      if (this.loadIsCurrent(loadEpoch, api)) {
        this.stopSubscriptions();
        this.error = errorMessage(error);
      }
    } finally {
      if (this.loadIsCurrent(loadEpoch, api)) {
        this.loading = false;
      }
    }
  }

  private openDefaultTemplate(existingTransitionEpoch?: number): void {
    this.newEffect("h617a_painted", existingTransitionEpoch, {
      name: "Paint",
      content: blankPainted(),
      selectionIdentity: "template:paint",
      templateLabel: "Paint",
    });
  }

  private preferredLibraryEffect(
    items: LibrarySummary[] = this.library.items,
  ): LibrarySummary | undefined {
    return items
      .filter(
        (item) =>
          item.kind !== "video_profile" &&
          isMyEffectKind(item.kind) &&
          this.libraryItemAvailable(item),
      )
      .sort((left, right) => {
        const priority =
          libraryKindPriority(left.kind, this.selectedModel) -
          libraryKindPriority(right.kind, this.selectedModel);
        return priority || compareLabels(left.name, right.name);
      })[0];
  }

  private openDefaultAvailableTemplate(
    existingTransitionEpoch?: number,
  ): void {
    if (this.customEffectKindAvailable("h617a_painted")) {
      this.openDefaultTemplate(existingTransitionEpoch);
      return;
    }
    if (
      this.customEffectKindAvailable("h617a_single") &&
      this.modelCatalogue?.effects[0]
    ) {
      const family = this.modelCatalogue.effects.find(
        (effect) => effect.id !== "music",
      ) ?? this.modelCatalogue.effects[0];
      const variation = family.variations[0];
      const content = blankCustomEffect("h617a_single", this.modelCatalogue);
      this.newEffect("h617a_single", existingTransitionEpoch, {
        name: family.label,
        content: {
          ...content,
          family: family.family,
          variant: variation.variant,
        },
        selectionIdentity: `template:single:${family.family}:${variation.variant}`,
        templateLabel: family.label,
      });
      return;
    }
    if (
      this.customEffectKindAvailable("palette_diy") &&
      this.modelCatalogue?.effects[0]
    ) {
      const family = this.modelCatalogue.effects.find(
        (effect) => effect.id !== "music",
      ) ?? this.modelCatalogue.effects[0];
      this.openEditableTemplate(
        family.label,
        blankPaletteDiy(
          this.modelCatalogue,
          this.selectedModel!,
          family.family,
          family.variations[0].variant,
        ),
        `template:single:${family.family}:${family.variations[0].variant}`,
      );
      return;
    }
    if (this.customEffectKindAvailable("h617a_multi")) {
      this.newEffect("h617a_multi", existingTransitionEpoch, {
        name: "Mix",
        content: blankCustomEffect("h617a_multi", this.modelCatalogue!),
        selectionIdentity: "template:mix",
        templateLabel: "Mix",
      });
      return;
    }
    if (this.customEffectKindAvailable("advanced")) {
      this.newEffect("advanced", existingTransitionEpoch, {
        name: "Layered",
        content: blankAdvancedContent(),
        selectionIdentity: "template:advanced",
        templateLabel: "Layered",
      });
      return;
    }
    this.currentItem = undefined;
    this.name = "";
  }

  private loadIsCurrent(epoch: number, api: EffectStudioApi): boolean {
    return (
      this.isConnected &&
      this.loadEpoch === epoch &&
      this.api === api
    );
  }

  private subscriptionFailed(
    error: Error,
    epoch: number,
    api: EffectStudioApi,
  ): void {
    if (!this.loadIsCurrent(epoch, api)) {
      return;
    }
    this.error = error.message;
    this.loading = false;
    queueMicrotask(() => {
      if (this.loadIsCurrent(epoch, api)) {
        this.stopSubscriptions();
      }
    });
  }

  private stopSubscriptions(): void {
    this.unsubscribeLibrary?.();
    this.unsubscribeDeployments?.();
    this.unsubscribeLibrary = undefined;
    this.unsubscribeDeployments = undefined;
  }

  private deviceIdFromPath(): string | undefined {
    const match = window.location.pathname.match(
      /\/ha-govee-led-ble\/editor\/([^/]+)/,
    );
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  }

  private async libraryChanged(snapshot: LibrarySnapshot): Promise<void> {
    const previousRevision = this.library.library_revision;
    if (snapshot.library_revision < previousRevision) {
      return;
    }
    this.library = snapshot;
    if (!this.currentItem || snapshot.library_revision === previousRevision) {
      return;
    }
    const summary = snapshot.items.find(
      (item) => item.id === this.currentItem?.id,
    );
    if (!summary) {
      if (this.deletingItemId === this.currentItem.id) {
        return;
      }
      this.notice = "This effect was removed from the shared library.";
      return;
    }
    if (summary.revision === this.currentItem.revision) {
      return;
    }
    if (this.dirty) {
      this.notice =
        "This effect changed elsewhere. Reload it before saving.";
      return;
    }
    const transitionEpoch = this.beginEditorTransition();
    const selected = await this.selectItem(
      summary.id,
      transitionEpoch,
    );
    if (
      selected &&
      this.editorTransitionIsCurrent(transitionEpoch)
    ) {
      this.notice = "Loaded the latest shared revision.";
    }
  }

  private sceneLibraryItemSaved(
    event: CustomEvent<{
      item: LibraryItem;
      library_revision: number;
    }>,
  ): void {
    this.library = {
      library_revision: event.detail.library_revision,
      items: upsertSummary(this.library.items, event.detail.item),
    };
  }

  private sceneTemplateSelected(
    event: CustomEvent<{
      content: LayeredSceneContent;
      config_entry_id: string;
      name: string;
    }>,
  ): void {
    if (
      !this.isAdmin ||
      event.detail.config_entry_id !== this.selectedDeviceId
    ) {
      return;
    }
    const transitionEpoch = this.beginEditorTransition();
    this.currentItem = undefined;
    this.templateSourceLabel = undefined;
    this.customCopyStarted = true;
    this.name = event.detail.name.trim() || "Layered scene template";
    this.content = cloneLayeredSceneContent(event.detail.content);
    this.savedBaseline = undefined;
    this.section = "custom";
    this.customEffectCategory = "all";
    this.customTemplateSelection = undefined;
    this.notice = undefined;
    this.selectNewEffectName(transitionEpoch);
  }

  private backToScenes(): void {
    this.beginEditorTransition();
    this.section = "scenes";
    this.notice = undefined;
  }

  private beginEditorTransition(): number {
    this.editorTransitionEpoch += 1;
    return this.editorTransitionEpoch;
  }

  private editorTransitionIsCurrent(epoch: number): boolean {
    return epoch === this.editorTransitionEpoch;
  }

  private deviceChanged(event: Event): void {
    const transitionEpoch = this.beginEditorTransition();
    this.selectedDeviceId = (event.target as HTMLSelectElement).value;
    this.activeOperationId = undefined;
    this.activeOperationId = this.latestDeployment([
      "pending",
      "uploading",
      "verifying",
      "interrupted",
    ])?.operation_id;
    this.notice = undefined;
    if (this.section === "video" && !this.videoAvailable) {
      this.section = "scenes";
      return;
    }
    if (!this.customEffectsAvailable) {
      this.section = "scenes";
      return;
    }
    if (!this.customEffectCategoryAvailable(this.customEffectCategory)) {
      this.customEffectCategory = "all";
    }
    if (
      this.section === "custom" &&
      !this.effectContentAvailable(this.content)
    ) {
      const entries = this.customEffectEntries.filter(
        (candidate) => candidate.kind !== "saved",
      );
      const entry =
        this.customEffectCategory === "all"
          ? undefined
          : this.customEffectCategory === "music"
            ? entries.find(
                (candidate) =>
                  candidate.kind === "music" &&
                  candidate.mode !== undefined,
              )
            : entries[0];
      if (entry) {
        this.selectCustomEffectEntry(entry);
      } else {
        this.openDefaultAvailableTemplate(transitionEpoch);
      }
    }
    if (
      this.section === "video" &&
      this.content.kind === "video_profile" &&
      this.content.model !== this.selectedModel
    ) {
      const mode = this.modelCatalogue?.video_modes[0];
      if (mode) {
        this.openVideoTemplate(mode.id, mode.label);
      }
    }
  }

  private switchNewEffectType(type: NewEffectType): void {
    if (
      !this.isAdmin ||
      !this.newEffectTypeAvailable(type) ||
      this.currentItem ||
      this.templateSourceLabel ||
      !isEditableEffectContent(this.content) ||
      newEffectTypeForContent(this.content) === type
    ) {
      return;
    }
    if (type === "advanced") {
      this.newEffect("advanced");
      return;
    }
    const kind =
      type === "single"
        ? this.selectedModel === "H6199"
          ? "palette_diy"
          : "h617a_single"
        : "h617a_multi";
    if (isCustomEffectContent(this.content) && kind !== "palette_diy") {
      this.switchCustomMode(kind);
      return;
    }
    if (
      this.content.kind === "palette_diy" &&
      kind === "palette_diy"
    ) {
      return;
    }
    this.newEffect(kind);
  }

  private switchCustomMode(kind: CustomEffectContent["kind"]): void {
    if (
      !this.isAdmin ||
      !this.customCatalogue ||
      !isCustomEffectContent(this.content) ||
      this.content.kind === kind
    ) {
      return;
    }
    const current = this.content;
    if (
      kind === "h617a_single" &&
      current.kind === "h617a_multi" &&
      current.effects.length > 1
    ) {
      return;
    }
    let next: CustomEffectContent;
    if (kind === "h617a_painted") {
      const colour: RGB =
        current.kind === "h617a_painted"
          ? this.activePaintBrush
          : current.palette[0]
            ? [...current.palette[0]]
            : [47, 111, 237];
      next = {
        ...blankPainted(),
        speed: current.speed,
        groups: [
          {
            fill: [...colour],
            segments: Array.from({ length: SEGMENT_COUNT }, (_, index) => index),
          },
        ],
      };
      if (current.kind !== "h617a_painted") {
        this.paintBrushes = mergedPaintBrushes(current.palette);
        this.selectedPaintBrush = 0;
      }
      this.brushUsesBackground = false;
    } else if (current.kind === "h617a_painted") {
      const paintedPalette = uniquePaintedPalette(current);
      if (kind === "h617a_single") {
        const blank = blankCustomEffect(kind, this.customCatalogue);
        next = {
          ...blank,
          speed: current.speed,
          palette: paintedPalette.length ? paintedPalette : blank.palette,
        };
      } else {
        const blank = blankCustomEffect("h617a_multi", this.customCatalogue);
        next = {
          ...blank,
          speed: current.speed,
          palette: paintedPalette.length ? paintedPalette : blank.palette,
        };
      }
    } else if (kind === "h617a_multi" && current.kind === "h617a_single") {
      next = {
        kind,
        effects: [
          {
            family: current.family,
            variant: current.variant,
          },
        ],
        speed: current.speed,
        palette: current.palette.map((colour) => [...colour]),
      };
    } else if (
      kind === "h617a_single" &&
      current.kind === "h617a_multi"
    ) {
      const first = current.effects[0];
      next = {
        kind,
        family: first.family,
        variant: first.variant,
        speed: current.speed,
        palette: current.palette.map((colour) => [...colour]),
      };
    } else {
      return;
    }
    this.content = next;
    if (/^New (Paint|Painted|Single|Multi) effect$/.test(this.name)) {
      this.name = `New ${customKindLabel(kind)} effect`;
    }
    this.notice = this.applyAvailabilityNotice();
  }

  private newEffect(
    kind: NewEffectKind,
    existingTransitionEpoch?: number,
    initial?: {
      name: string;
      content: EditableEffectContent;
      selectionIdentity?: string;
      templateLabel?: string;
    },
  ): void {
    const transitionEpoch =
      existingTransitionEpoch ?? this.beginEditorTransition();
    if (
      !this.api ||
      !this.isAdmin ||
      !this.customEffectKindAvailable(kind) ||
      (kind !== "advanced" && !this.modelCatalogue)
    ) {
      return;
    }
    this.currentItem = undefined;
    this.templateSourceLabel = initial?.templateLabel;
    this.customCopyStarted = initial?.templateLabel !== undefined;
    this.customTemplateSelection =
      kind === "advanced"
        ? undefined
        : initial?.selectionIdentity ??
          (kind === "h617a_painted" ? "template:paint" : undefined);
    this.name = initial?.name ?? `New ${customKindLabel(kind)} effect`;
    this.content =
      initial?.content ??
      (kind === "advanced"
        ? blankAdvancedContent()
       : kind === "palette_diy"
         ? blankPaletteDiy(
             this.modelCatalogue!,
             this.selectedModel!,
           )
         : blankCustomEffect(kind, this.modelCatalogue!));
    if (kind === "h617a_painted") {
      this.brushUsesBackground = false;
    }
    this.savedBaseline = undefined;
    this.notice = this.applyAvailabilityNotice();
    this.selectNewEffectName(transitionEpoch);
  }

  private selectNewEffectName(transitionEpoch: number): void {
    void this.updateComplete.then(() => {
      if (
        !this.editorTransitionIsCurrent(transitionEpoch) ||
        this.currentItem ||
        this.templateSourceLabel
      ) {
        return;
      }
      const input =
        this.shadowRoot?.querySelector<HTMLInputElement>(".editor .editor-name");
      input?.focus();
      input?.select();
    });
  }

  private renderEditorDeleteButton() {
    if (!this.isAdmin || !this.currentItem) {
      return nothing;
    }
    return html`
      <button
        class="danger"
        type="button"
        ?disabled=${this.deletingItemId !== undefined ||
        this.saving ||
        this.applying}
        @click=${(event: Event) =>
          this.requestDelete(
            {
              id: this.currentItem!.id,
              revision: this.currentItem!.revision,
              name: this.currentItem!.name,
            },
            event.currentTarget as HTMLElement,
          )}
      >
        ${this.deletingCurrentItem ? "Deleting..." : "Delete"}
      </button>
    `;
  }

  private requestDelete(
    candidate: DeleteCandidate,
    returnFocus: HTMLElement,
  ): void {
    if (
      !this.api ||
      !this.isAdmin ||
      this.deletingItemId !== undefined ||
      this.saving ||
      this.applying
    ) {
      return;
    }
    this.deleteCandidate = { ...candidate };
    this.deleteReturnFocus = returnFocus;
    this.notice = undefined;
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>(".delete-dialog .danger")
        ?.focus();
    });
  }

  private cancelDelete(): void {
    const returnFocus = this.deleteReturnFocus;
    this.deleteCandidate = undefined;
    this.deleteReturnFocus = undefined;
    void this.updateComplete.then(() => {
      if (returnFocus?.isConnected) {
        returnFocus.focus();
      }
    });
  }

  private deleteDialogKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    this.cancelDelete();
  }

  private async confirmDelete(): Promise<void> {
    const candidate = this.deleteCandidate;
    const api = this.api;
    if (
      !candidate ||
      !api ||
      !this.isAdmin ||
      this.deletingItemId !== undefined
    ) {
      return;
    }
    const originatingLibraryRevision = this.library.library_revision;
    this.deleteCandidate = undefined;
    this.deleteReturnFocus = undefined;
    this.deletingItemId = candidate.id;
    this.notice = undefined;
    try {
      const libraryRevision = await api.deleteItem(
        candidate,
        originatingLibraryRevision,
      );
      if (libraryRevision >= this.library.library_revision) {
        this.library = {
          library_revision: libraryRevision,
          items: this.library.items.filter((item) => item.id !== candidate.id),
        };
      }
      if (
        this.currentItem?.id === candidate.id &&
        this.currentItem.revision === candidate.revision
      ) {
        this.beginEditorTransition();
        this.currentItem = undefined;
        this.templateSourceLabel = undefined;
        this.customCopyStarted = false;
        this.customTemplateSelection = undefined;
        this.name = "";
        this.content = blankPainted();
        this.savedBaseline = undefined;
      }
      this.notice = `Deleted ${candidate.name}.`;
    } catch (error) {
      const conflict = errorCode(error) === "conflict";
      this.notice = conflict
        ? "This effect or library changed elsewhere. Reload before deleting."
        : `Delete failed: ${errorMessage(error)}`;
      if (conflict) {
        try {
          const snapshot = await api.library();
          if (snapshot.library_revision >= this.library.library_revision) {
            this.library = snapshot;
          }
        } catch (refreshError) {
          this.notice += ` Library refresh failed: ${errorMessage(refreshError)}`;
        }
      }
    } finally {
      this.deletingItemId = undefined;
    }
  }

  private async selectItem(
    itemId: string,
    existingTransitionEpoch?: number,
  ): Promise<boolean> {
    const transitionEpoch =
      existingTransitionEpoch ?? this.beginEditorTransition();
    if (!this.api) {
      return false;
    }
    try {
      const item = await this.api.item(itemId);
      if (!this.editorTransitionIsCurrent(transitionEpoch)) {
        return false;
      }
      if (item.content.kind === "opaque") {
        this.currentItem = item;
        this.templateSourceLabel = undefined;
        this.customCopyStarted = false;
        this.customTemplateSelection = undefined;
        this.name = item.name;
        this.content = cloneOpaqueContent(item.content);
        this.savedBaseline = undefined;
        this.notice =
          "This effect definition is preserved, but this editor cannot change or apply it.";
        return true;
      }
      if (!isEditableEffectContent(item.content)) {
        this.notice = "This item cannot be edited here.";
        return false;
      }
      this.currentItem = item;
      this.templateSourceLabel = undefined;
      this.customCopyStarted = false;
      this.customTemplateSelection = undefined;
      this.name = item.name;
      this.content = cloneEditableEffect(item.content);
      if (item.content.kind === "h617a_painted") {
        this.brushUsesBackground = false;
      }
      this.savedBaseline = serialiseEditable(
        item.name,
        item.content,
      );
      this.notice = this.applyAvailabilityNotice();
      return true;
    } catch (error) {
      if (this.editorTransitionIsCurrent(transitionEpoch)) {
        this.notice = errorMessage(error);
      }
      return false;
    }
  }

  private nameChanged(event: Event): void {
    this.name = (event.target as HTMLInputElement).value;
  }

  private saveAsCustom(): void {
    const source = this.templateSourceLabel;
    if (!source || !this.isAdmin) {
      return;
    }
    const transitionEpoch = this.beginEditorTransition();
    this.templateSourceLabel = undefined;
    this.customTemplateSelection = undefined;
    this.customCopyStarted = true;
    this.name = `Custom ${source}`;
    this.savedBaseline = undefined;
    this.selectNewEffectName(transitionEpoch);
  }

  private paintBrushesChanged(
    event: CustomEvent<{ palette: RGB[] }>,
  ): void {
    this.paintBrushes = event.detail.palette.map(
      (colour) => [...colour] as RGB,
    );
    this.selectedPaintBrush = Math.max(
      0,
      Math.min(
        this.selectedPaintBrush,
        this.paintBrushes.length - 1,
      ),
    );
    this.brushUsesBackground = false;
  }

  private paintBrushSelected(
    event: CustomEvent<{ index: number }>,
  ): void {
    this.selectedPaintBrush = event.detail.index;
    this.brushUsesBackground = false;
  }

  private get activePaintBrush(): RGB {
    return [
      ...(this.paintBrushes[this.selectedPaintBrush] ??
        this.paintBrushes[0] ??
        [47, 111, 237]),
    ] as RGB;
  }

  private backgroundChanged(event: CustomEvent<{ colour: RGB }>): void {
    this.updateContent({
      background: [...event.detail.colour],
    });
  }

  private singleEffectChanged(event: Event): void {
    if (!this.customCatalogue || this.currentItem?.content.kind === "opaque") {
      return;
    }
    const selected = (event.target as HTMLSelectElement).value;
    if (
      this.currentItem &&
      ((this.content.kind === "h617a_painted" && selected !== "paint") ||
        (this.content.kind === "h617a_single" && selected === "paint"))
    ) {
      return;
    }
    const selectingTemplate =
      this.templateSourceLabel !== undefined ||
      this.customTemplateSelection !== undefined;
    if (selected === "paint") {
      if (this.content.kind !== "h617a_painted") {
        this.switchCustomMode("h617a_painted");
      }
      if (selectingTemplate) {
        this.customTemplateSelection = "template:paint";
      }
      this.updateGeneratedEffectName("Paint");
      return;
    }
    const family = this.modelCatalogue?.effects.find(
      (effect) => effect.id === selected,
    );
    const variation = family?.variations[0];
    if (!family || !variation) {
      return;
    }
    if (this.content.kind === "h617a_painted") {
      this.switchCustomMode("h617a_single");
    }
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "palette_diy"
    ) {
      return;
    }
    this.content = {
      ...this.content,
      family: family.family,
      variant: variation.variant,
    };
    if (selectingTemplate) {
      this.customTemplateSelection = `template:single:${family.family}:${variation.variant}`;
    }
    this.updateGeneratedEffectName(family.label);
  }

  private paintedEffectVariationChanged(event: Event): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.updateContent({
      effect: (event.target as HTMLSelectElement)
        .value as PaintedContent["effect"],
    });
  }

  private updateGeneratedEffectName(label: string): void {
    if (this.templateSourceLabel) {
      this.templateSourceLabel = label;
      this.name = label;
      return;
    }
    if (!this.currentItem && /^New .+ effect$/.test(this.name)) {
      this.name = `New ${label} effect`;
    }
  }

  private setSegmentColour(index: number): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    const colours = coloursForSegments(this.content);
    colours[index] = this.brushUsesBackground
      ? [...this.content.background]
      : this.activePaintBrush;
    this.content = {
      ...this.content,
      groups: groupsFromColours(colours, this.content.background),
    };
  }

  private paintAll(): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    const colour = this.brushUsesBackground
      ? this.content.background
      : this.activePaintBrush;
    this.content = {
      ...this.content,
      groups: groupsFromColours(
        Array.from({ length: SEGMENT_COUNT }, () => [...colour] as RGB),
        this.content.background,
      ),
    };
  }

  private resetPaint(): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.content = {
      ...this.content,
      groups: [],
    };
  }

  private updateContent(update: Partial<PaintedContent>): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.content = {
      ...this.content,
      ...update,
    };
  }

  private async save(): Promise<void> {
    if (
      !this.api ||
      !this.isAdmin ||
      !this.dirty ||
      this.saving ||
      this.deletingCurrentItem ||
      !isEditableEffectContent(this.content)
    ) {
      return;
    }
    const api = this.api;
    const name = this.name.trim();
    if (!name) {
      this.notice = "Give this effect a name before saving.";
      return;
    }
    const transitionEpoch = this.beginEditorTransition();
    const originatingItem = this.currentItem;
    const content = cloneEditableEffect(this.content);
    const originatingLibraryRevision = this.library.library_revision;
    this.saving = true;
    this.notice = undefined;
    try {
      const result = originatingItem
        ? await api.updateItem(
            originatingItem,
            name,
            content,
            originatingLibraryRevision,
          )
        : await api.createItem(
            name,
            content,
            originatingLibraryRevision,
          );
      if (!isEditableEffectContent(result.item.content)) {
        throw new Error("The saved effect returned an unsupported definition.");
      }
      const savedContent = result.item.content;
      if (result.library_revision >= this.library.library_revision) {
        this.library = {
          library_revision: result.library_revision,
          items: upsertSummary(this.library.items, result.item),
        };
      }
      const originIsCurrent =
        this.editorTransitionIsCurrent(transitionEpoch) &&
        sameLibraryItemRevision(this.currentItem, originatingItem) &&
        isEditableEffectContent(this.content) &&
        serialiseEditable(this.name, this.content) ===
          serialiseEditable(name, content);
      if (originIsCurrent) {
        this.currentItem = result.item;
        this.customTemplateSelection = undefined;
        this.name = result.item.name;
        this.content = cloneEditableEffect(savedContent);
        this.savedBaseline = serialiseEditable(this.name, this.content);
      }
      const savedResultIsCurrent = () =>
        this.editorTransitionIsCurrent(transitionEpoch) &&
        sameLibraryItemRevision(this.currentItem, result.item) &&
        isEditableEffectContent(this.content) &&
        serialiseEditable(this.name, this.content) ===
          serialiseEditable(result.item.name, savedContent);
      if (savedResultIsCurrent()) {
        this.notice = "Saved.";
      }
    } catch (error) {
      if (errorCode(error) === "conflict") {
        const conflictNotice =
          "This effect or library changed elsewhere. Reload before saving.";
        if (this.editorTransitionIsCurrent(transitionEpoch)) {
          this.notice = conflictNotice;
        }
        try {
          const snapshot = await api.library();
          if (snapshot.library_revision >= this.library.library_revision) {
            this.library = snapshot;
          }
        } catch (refreshError) {
          if (this.editorTransitionIsCurrent(transitionEpoch)) {
            this.notice =
              `${conflictNotice} Library refresh failed: ` +
              errorMessage(refreshError);
          }
        }
      } else if (this.editorTransitionIsCurrent(transitionEpoch)) {
        this.notice = `Save failed: ${errorMessage(error)}`;
      }
    } finally {
      this.saving = false;
    }
  }

  private async apply(): Promise<void> {
    if (
      !this.api ||
      !this.canApply ||
      !isCustomEffectContent(this.content) ||
      !this.selectedDeviceId
    ) {
      return;
    }
    const name = this.name.trim();
    const selectedDeviceId = this.selectedDeviceId;
    const transitionEpoch = this.editorTransitionEpoch;
    this.activeOperationId = undefined;
    this.applying = true;
    this.notice = undefined;
    try {
      const deployment =
        !this.dirty && this.currentItem
          ? await this.api.applySaved(selectedDeviceId, this.currentItem)
          : await this.api.applySnapshot(
              selectedDeviceId,
              name,
              this.content,
            );
      if (
        transitionEpoch !== this.editorTransitionEpoch ||
        selectedDeviceId !== this.selectedDeviceId
      ) {
        return;
      }
      this.activeOperationId = deployment.operation_id;
      this.deployments = [
        deployment,
        ...this.deployments.filter(
          (item) => item.operation_id !== deployment.operation_id,
        ),
      ];
    } catch (error) {
      if (
        transitionEpoch === this.editorTransitionEpoch &&
        selectedDeviceId === this.selectedDeviceId
      ) {
        this.notice = `Apply failed: ${errorMessage(error)}`;
      }
    } finally {
      this.applying = false;
    }
  }

  private applyAvailabilityNotice(): string | undefined {
    if (isAdvancedEditableContent(this.content)) {
      return undefined;
    }
    if (this.selectedDeviceId && !this.selectedDevice) {
      return "This device is temporarily unavailable in Home Assistant. Apply is disabled until it is loaded.";
    }
    return undefined;
  }

  private latestDeployment(
    phases: DeploymentRecord["phase"][],
  ): DeploymentRecord | undefined {
    return [...this.deployments]
      .filter(
        (deployment) =>
          deployment.config_entry_id === this.selectedDeviceId &&
          phases.includes(deployment.phase),
      )
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at))[0];
  }

  static styles = [
    studioBaseStyles,
    studioCardStyles,
    studioActionStyles,
    studioSelectorStyles,
    studioFormStyles,
    studioEditorStyles,
    studioFeedbackStyles,
    studioVisuallyHiddenStyles,
    studioWorkspaceStyles,
    css`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }

    .centred,
    .fatal {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .fatal h1 {
      margin-top: 0;
    }

    .fatal a {
      color: var(--studio-blue);
      font-weight: 600;
    }

    h1,
    h2,
    h3,
    p {
      margin-top: 0;
    }

    h1 {
      margin-bottom: 0;
      font-size: 25px;
      font-weight: 600;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
      font-weight: 600;
    }

    h3 {
      margin-bottom: 18px;
      font-size: 16px;
    }

    .device-picker {
      margin-top: auto;
    }

    .device-picker select {
      width: 100%;
    }

    select {
      min-height: 42px;
      padding: 8px 12px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-button-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .notice {
      padding: 11px 28px;
      border-bottom: 1px solid
        color-mix(in srgb, var(--studio-blue) 35%, var(--studio-border));
      color: var(--primary-text-color);
      background: var(--studio-blue-soft);
    }

    .studio {
      display: grid;
      grid-template-columns: 190px 230px minmax(0, 1fr);
      min-height: 100vh;
    }

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .studio.video-mode {
      grid-template-columns: 190px 230px minmax(0, 1fr);
    }

    .primary-nav {
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .custom-mode-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 22px;
      padding: 6px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      background: var(--studio-card);
    }

    .custom-mode-tabs button {
      min-height: 52px;
      padding: 12px;
      border: 0;
      border-radius: 9px;
      color: var(--primary-text-color);
      background: transparent;
      font-size: 15px;
      font-weight: 650;
      cursor: pointer;
    }

    .custom-mode-tabs button.selected {
      color: var(--text-primary-color, #fff);
      background: var(--studio-blue);
    }

    .custom-mode-tabs button:disabled {
      cursor: default;
      opacity: 0.52;
    }

    .back-button {
      min-height: 44px;
      margin-bottom: 14px;
      padding: 8px 0;
      border: 0;
      color: var(--studio-blue);
      background: transparent;
      font-weight: 650;
      cursor: pointer;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    .actions > button {
      min-height: 44px;
    }

    .dialog-backdrop {
      position: fixed;
      z-index: 1000;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgb(0 0 0 / 45%);
    }

    .delete-dialog {
      width: min(440px, 100%);
      padding: 24px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      box-shadow: 0 18px 52px rgb(0 0 0 / 28%);
    }

    .delete-dialog p {
      margin-top: 16px;
      margin-bottom: 0;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 24px;
    }

    .source-note {
      color: var(--studio-muted);
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .single-effect-settings {
      margin-bottom: 18px;
    }

    .single-effect-settings .field {
      margin-top: 0;
    }

    .opaque-content h3 {
      margin: 0 0 8px;
    }

    .opaque-content h3:not(:first-child) {
      margin-top: 20px;
    }

    .opaque-content p {
      margin: 0;
    }

    .opaque-content pre {
      max-width: 100%;
      margin: 0;
      padding: 16px;
      overflow: auto;
      border-radius: 8px;
      background: var(--secondary-background-color, #f1f1f1);
      color: var(--primary-text-color);
      font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .background-colour {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .range-field {
      grid-template-columns: 80px minmax(100px, 1fr) 44px;
    }

    .deployment {
      margin-top: 18px;
      margin-bottom: 0;
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 35%,
        var(--studio-border)
      );
      background: var(--studio-blue-soft);
    }

    .deployment.failed {
      border-color: var(--error-color, #db4437);
      color: var(--error-color, #db4437);
      background: color-mix(
        in srgb,
        var(--error-color, #db4437) 8%,
        var(--studio-card)
      );
    }

    @media (max-width: 900px) {
      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .studio.scenes-mode,
      .studio.custom-mode,
      .studio.video-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .custom-mode .effect-categories,
      .custom-mode .library,
      .custom-mode .editor {
        grid-column: 2;
      }

      .video-mode .library,
      .video-mode .editor {
        grid-column: 2;
      }

      .editor {
        grid-column: 2;
      }

      .controls {
        grid-template-columns: 1fr;
      }

    }

    @media (max-width: 760px) {
      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        padding: 10px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .device-picker {
        grid-column: 1 / -1;
        margin-top: 4px;
        padding-top: 10px;
        text-align: start;
      }

      .selector {
        text-align: center;
      }

      .library {
        padding-block: 18px;
      }

      .effect-categories .selector {
        text-align: start;
      }

      .library .selector {
        text-align: start;
      }

    }

    @media (max-width: 480px) {
      .notice {
        padding-inline: 16px;
      }

      .button-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .button-row button:first-child {
        grid-column: 1 / -1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        scroll-behavior: auto !important;
      }
    }
  `];
}

function blankPainted(): PaintedContent {
  return {
    kind: "h617a_painted",
    effect: "clockwise",
    speed: 50,
    brightness: 100,
    background: [0, 0, 0],
    groups: [],
  };
}

function blankCustomEffect(
  kind: "h617a_painted",
  catalogue: ModelEffectCatalogue,
): PaintedContent;
function blankCustomEffect(
  kind: "h617a_single",
  catalogue: ModelEffectCatalogue,
): Extract<CustomEffectContent, { kind: "h617a_single" }>;
function blankCustomEffect(
  kind: "h617a_multi",
  catalogue: ModelEffectCatalogue,
): Extract<CustomEffectContent, { kind: "h617a_multi" }>;
function blankCustomEffect(
  kind: CustomEffectContent["kind"],
  catalogue: ModelEffectCatalogue,
): CustomEffectContent;
function blankCustomEffect(
  kind: CustomEffectContent["kind"],
  catalogue: ModelEffectCatalogue,
): CustomEffectContent {
  if (kind === "h617a_painted") {
    return blankPainted();
  }
  const first =
    kind === "h617a_multi"
      ? catalogue.effects.find((effect) => effect.supports_multi)
      : catalogue.effects[0];
  if (!first) {
    throw new Error("The custom-effect catalogue has no compatible effects.");
  }
  const variation = first.variations[0];
  const pair = {
    family: first.family,
    variant: variation.variant,
  };
  if (kind === "h617a_single") {
    return {
      kind,
      ...pair,
      speed: 50,
      palette: defaultPalette(),
    };
  }
  return {
    kind,
    effects: [pair],
    speed: 50,
    palette: defaultPalette(),
  };
}

function blankPaletteDiy(
  catalogue: ModelEffectCatalogue,
  model: string,
  family?: number,
  variant?: number,
): PaletteDiyEffectContent {
  if (model !== "H617A" && model !== "H6199") {
    throw new Error(`Unsupported custom-effect model ${model}.`);
  }
  const selected =
    catalogue.effects.find((effect) => effect.family === family) ??
    catalogue.effects[0];
  if (!selected) {
    throw new Error("The custom-effect catalogue has no compatible effects.");
  }
  return {
    kind: "palette_diy",
    model,
    family: family ?? selected.family,
    variant: variant ?? selected.variations[0].variant,
    speed: 50,
    palette: defaultPalette(),
  };
}

function blankVideoProfile(mode: string): VideoProfileContent {
  return {
    kind: "video_profile",
    model: "H6199",
    mode: mode === "game" ? "game" : "movie",
    full_screen: true,
    saturation: 50,
    sound_effects: false,
    sound_effects_softness: 50,
    white_balance_position: 17,
    relative_brightness: {
      left: 100,
      top: 100,
      right: 100,
      bottom: 100,
    },
    blank_screen: false,
  };
}

function clonePainted(content: PaintedContent): PaintedContent {
  return {
    ...content,
    background: [...content.background],
    groups: content.groups.map((group) => ({
      fill: [...group.fill],
      segments: [...group.segments],
    })),
  };
}

function cloneCustomEffect(
  content: CustomEffectContent,
): CustomEffectContent {
  if (content.kind === "h617a_painted") {
    return clonePainted(content);
  }
  if (content.kind === "h617a_single") {
    return {
      ...content,
      palette: content.palette.map((colour) => [...colour]),
    };
  }

  return {
    ...content,
    effects: content.effects.map((effect) => ({ ...effect })),
    palette: content.palette.map((colour) => [...colour]),
  };
}

function clonePaletteDiy(
  content: PaletteDiyEffectContent,
): PaletteDiyEffectContent {
  return {
    ...content,
    palette: content.palette.map((colour) => [...colour]),
  };
}

function cloneMusicProfile(
  content: MusicProfileContent,
): MusicProfileContent {
  return {
    ...content,
    colour: content.colour ? [...content.colour] : null,
    parameters: structuredClone(content.parameters),
  };
}

function cloneVideoProfile(
  content: VideoProfileContent,
): VideoProfileContent {
  return {
    ...content,
    relative_brightness: { ...content.relative_brightness },
  };
}

function cloneEditableEffect(
  content: EditableEffectContent,
): EditableEffectContent {
  if (content.kind === "advanced") {
    return cloneAdvancedContent(content);
  }
  if (content.kind === "scene_layered") {
    return cloneLayeredSceneContent(content);
  }
  if (content.kind === "palette_diy") {
    return clonePaletteDiy(content);
  }
  if (content.kind === "music_profile") {
    return cloneMusicProfile(content);
  }
  if (content.kind === "video_profile") {
    return cloneVideoProfile(content);
  }
  return cloneCustomEffect(content);
}

function cloneOpaqueContent(content: OpaqueContent): OpaqueContent {
  return {
    ...content,
    body: structuredClone(content.body),
  };
}

function advancedEditorContent(
  content: AdvancedEditableContent,
): AdvancedContent {
  return content.kind === "advanced"
    ? content
    : {
        kind: "advanced",
        layers: content.effect.layers,
      };
}

function updateAdvancedEditorContent(
  current: AdvancedEditableContent,
  edited: AdvancedContent,
): AdvancedEditableContent {
  if (current.kind === "advanced") {
    return cloneAdvancedContent(edited);
  }
  return {
    ...cloneLayeredSceneContent(current),
    effect: {
      layers: cloneAdvancedContent(edited).layers,
    },
  };
}

function defaultPalette(): RGB[] {
  return [
    [255, 0, 0],
    [255, 127, 0],
    [255, 255, 0],
    [0, 255, 0],
    [0, 0, 255],
    [0, 255, 255],
    [139, 0, 255],
  ];
}

function mergedPaintBrushes(colours: RGB[]): RGB[] {
  const brushes: RGB[] = [];
  for (const colour of [...colours, ...defaultPalette()]) {
    if (!brushes.some((brush) => sameColour(brush, colour))) {
      brushes.push([...colour]);
    }
    if (brushes.length === 8) {
      break;
    }
  }
  return brushes;
}

function coloursForSegments(content: PaintedContent): RGB[] {
  const colours = Array.from(
    { length: SEGMENT_COUNT },
    () => [...content.background] as RGB,
  );
  for (const group of content.groups) {
    for (const segment of group.segments) {
      colours[segment] = [...group.fill];
    }
  }
  return colours;
}

function groupsFromColours(colours: RGB[], background: RGB) {
  const groups = new Map<string, { fill: RGB; segments: number[] }>();
  colours.forEach((colour, segment) => {
    if (sameColour(colour, background)) {
      return;
    }
    const key = colour.join(",");
    const group = groups.get(key);
    if (group) {
      group.segments.push(segment);
    } else {
      groups.set(key, {
        fill: [...colour],
        segments: [segment],
      });
    }
  });
  return [...groups.values()];
}

function uniquePaintedPalette(content: PaintedContent): RGB[] {
  const palette: RGB[] = [];
  for (const colour of coloursForSegments(content)) {
    if (
      !sameColour(colour, content.background) &&
      !palette.some((existing) => sameColour(existing, colour))
    ) {
      palette.push([...colour]);
    }
    if (palette.length === 8) {
      break;
    }
  }
  return palette;
}

function sameColour(left: RGB, right: RGB): boolean {
  return (
    left[0] === right[0] &&
    left[1] === right[1] &&
    left[2] === right[2]
  );
}

function serialiseEditable(
  name: string,
  content: EditableEffectContent,
): string {
  return JSON.stringify({
    name: name.trim(),
    content,
  });
}

function isCustomEffectKind(
  kind: unknown,
): kind is CustomEffectContent["kind"] {
  return (
    kind === "h617a_painted" ||
    kind === "h617a_single" ||
    kind === "h617a_multi"
  );
}

function isCustomEffectContent(
  content: unknown,
): content is CustomEffectContent {
  return (
    typeof content === "object" &&
    content !== null &&
    "kind" in content &&
    isCustomEffectKind(content.kind)
  );
}

function isEditableEffectContent(
  content: unknown,
): content is EditableEffectContent {
  return (
    isCustomEffectContent(content) ||
    (typeof content === "object" &&
      content !== null &&
      "kind" in content &&
      (isAdvancedEditableKind(content.kind) ||
        content.kind === "palette_diy" ||
        content.kind === "music_profile" ||
        content.kind === "video_profile"))
  );
}

function newEffectTypeForContent(
  content: EffectContent,
): NewEffectType | undefined {
  if (content.kind === "h617a_multi") {
    return "multi";
  }
  if (isAdvancedEditableKind(content.kind)) {
    return "advanced";
  }
  return content.kind === "h617a_painted" ||
    content.kind === "h617a_single" ||
    content.kind === "palette_diy"
    ? "single"
    : undefined;
}

function isAdvancedEditableKind(
  kind: unknown,
): kind is AdvancedEditableContent["kind"] {
  return kind === "advanced" || kind === "scene_layered";
}

function isAdvancedEditableContent(
  content: EffectContent,
): content is AdvancedEditableContent {
  return isAdvancedEditableKind(content.kind);
}

function isKnownEffectKind(kind: string): boolean {
  return (
    isCustomEffectKind(kind) ||
    isAdvancedEditableKind(kind) ||
    kind === "palette_diy" ||
    kind === "music_profile" ||
    kind === "video_profile" ||
    kind === "scene_builtin" ||
    kind === "scene_palette"
  );
}

function customKindLabel(kind: unknown): string {
  switch (kind) {
    case "h617a_painted":
      return "Paint";
    case "h617a_single":
      return "Single";
    case "h617a_multi":
      return "Multi";
    case "advanced":
      return "Layered";
    case "palette_diy":
      return "Single";
    default:
      return "Custom";
  }
}

function isMyEffectKind(kind: string): boolean {
  return (
    isCustomEffectKind(kind) ||
    isAdvancedEditableKind(kind) ||
    kind === "palette_diy" ||
    kind === "music_profile" ||
    !isKnownEffectKind(kind)
  );
}

function libraryKindPriority(kind: string, model: ModelSku | undefined): number {
  const order =
    model === "H6199"
      ? ["palette_diy", "music_profile", "advanced", "scene_layered"]
      : [
          "h617a_painted",
          "h617a_single",
          "h617a_multi",
          "music_profile",
          "advanced",
          "scene_layered",
        ];
  const priority = order.indexOf(kind);
  return priority === -1 ? order.length : priority;
}

function customEffectCategoryForKind(
  kind: string,
): Exclude<CustomEffectCategory, "all"> {
  if (kind === "h617a_multi") {
    return "multi-layer";
  }
  if (kind === "music_profile") {
    return "music";
  }
  if (
    kind === "h617a_painted" ||
    kind === "h617a_single" ||
    kind === "palette_diy"
  ) {
    return "single-layer";
  }
  return "advanced";
}

function sameLibraryItemRevision(
  left: LibraryItem | undefined,
  right: LibraryItem | undefined,
): boolean {
  return left?.id === right?.id && left?.revision === right?.revision;
}

function upsertSummary(
  summaries: LibrarySnapshot["items"],
  item: LibraryItem,
): LibrarySnapshot["items"] {
  const model = libraryItemModel(item);
  return [
    ...summaries.filter((summary) => summary.id !== item.id),
    {
      id: item.id,
      revision: item.revision,
      name: item.name,
      kind:
        item.content.kind === "opaque"
          ? item.content.source_kind
          : item.content.kind,
      ...(model ? { model } : {}),
      ...("template" in item.content
        ? { template: item.content.template as LibrarySummary["template"] }
        : {}),
    },
  ].sort((left, right) => left.name.localeCompare(right.name));
}

function libraryItemModel(item: LibraryItem): ModelSku | undefined {
  const content = item.content;
  if (
    content.kind === "palette_diy" ||
    content.kind === "music_profile" ||
    content.kind === "video_profile"
  ) {
    return content.model;
  }
  if (
    content.kind === "h617a_painted" ||
    content.kind === "h617a_single" ||
    content.kind === "h617a_multi"
  ) {
    return "H617A";
  }
  if (
    content.kind === "scene_builtin" ||
    content.kind === "scene_palette" ||
    content.kind === "scene_layered"
  ) {
    return knownModel(content.template.sku);
  }
  return knownModel(item.target_hint?.model);
}

function knownModel(model: string | null | undefined): ModelSku | undefined {
  return model === "H617A" || model === "H6199" ? model : undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-govee-led-ble-editor": GoveeLedEffectStudio;
  }
}

if (!customElements.get("ha-govee-led-ble-editor")) {
  customElements.define("ha-govee-led-ble-editor", GoveeLedEffectStudio);
}
