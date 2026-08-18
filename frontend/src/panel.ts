import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  blankAdvancedContent,
  cloneLayeredSceneContent,
} from "./advanced-effect-model";
import "./advanced-effect-editor";
import { EffectStudioApi } from "./api";
import {
  AsyncRequestController,
  type AsyncRequestToken,
} from "./async-request-controller";
import "./colour-picker";
import "./custom-effect-editor";
import {
  customEffectCategoryAvailable,
  customEffectKindAvailable,
  libraryItemAvailable,
  newEffectKindForCategory,
  type CustomEffectListContext,
  type CustomEffectListEntry,
} from "./custom-effect-list";
import type {
  CustomEffectBrowserCategoryRequest,
  CustomEffectBrowserEntryRequest,
} from "./custom-effect-browser";
import "./custom-effect-browser";
import {
  defaultCustomEffectCategory,
  showCustomEffectSelector,
  starterBaseline,
} from "./custom-effect-workflow";
import {
  advancedEditorContent,
  blankCustomEffect,
  blankPainted,
  blankPaletteDiy,
  blankVideoProfile,
  cloneCustomEffect,
  cloneEditableEffect,
  cloneOpaqueContent,
  clonePaletteDiy,
  cloneSpecialDiy,
  coloursForSegments,
  customKindLabel,
  defaultPalette,
  effectOriginDescription,
  groupsFromColours,
  isAdvancedEditableContent,
  isCustomEffectContent,
  isEditableEffectContent,
  isMyEffectKind,
  libraryItemSyncResult,
  libraryKindPriority,
  mergedPaintBrushes,
  PAINTED_SEGMENT_COUNT,
  sameLibraryItemVersion,
  serialiseEditable,
  uniquePaintedPalette,
  updateAdvancedEditorContent,
  upsertSummary,
} from "./effect-editor-model";
import type {
  CustomEffectCategory,
  EditableEffectContent,
  NewEffectKind,
} from "./effect-editor-model";
import {
  LivePreviewController,
  type LivePreviewInteraction,
} from "./live-preview-controller";
import "./music-profile-editor";
import "./palette-editor";
import "./painted-segment-editor";
import {
  EffectStudioPreviewSession,
  scenePreviewRequest,
  snapshotPreviewRequest,
  type PanelPreviewRequest,
} from "./panel-preview";
import { effectStudioPanelStyles } from "./panel-styles";
import {
  cloneMusicProfileContent,
  cloneVideoProfileContent,
} from "./profile-model";
import type {
  GoveeSceneBrowser,
  LibraryItemDeleteRequest,
  SceneInitialSelection,
  ScenePreviewRequest,
} from "./scene-browser";
import "./scene-browser";
import type { SliderControlChange } from "./slider-control";
import "./slider-control";
import {
  activeStudioContext,
  editorDevicePath,
  initialDeviceId,
  rememberedStudioSection,
  type StudioSection,
} from "./studio-navigation";
import "./video-profile-editor";
import type {
  AdvancedContent,
  CustomEffectCatalogue,
  CustomEffectContent,
  DeviceCapabilities,
  DiyEffectFamily,
  EffectContent,
  EffectUserState,
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
  PreviewStatus,
  RGB,
  SpecialDiyContent,
  VideoProfileContent,
} from "./types";
import {
  compareLabels,
  errorCode,
  errorMessage,
} from "./ui-utils";
import { isCompatibleEditorInfo } from "./validation";

type DeleteCandidate = Pick<
  LibrarySummary,
  "id" | "version" | "updated_at" | "name"
> & {
  discardsOpenEdits?: boolean;
};
type PanelLoadContext = { api: EffectStudioApi };
type PanelLoadRequest = AsyncRequestToken<PanelLoadContext>;
export class GoveeLedEffectStudio extends LitElement {
  @property({ attribute: false })
  public hass?: HomeAssistant;

  @property({ attribute: false })
  public panel?: PanelConfig;

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

  private userState?: EffectUserState;

  @state()
  private sceneInitialSelection?: SceneInitialSelection;

  @state()
  private section: StudioSection = "custom";

  @state()
  private customEffectCategory: CustomEffectCategory = "all";

  @state()
  private sceneEditorOpen = false;

  @state()
  private customTemplateSelection?: string;

  @state()
  private templateSourceLabel?: string;

  @state()
  private customCopyStarted = false;

  @state()
  private library: LibrarySnapshot = {
    items: [],
  };

  @state()
  private customCatalogue?: CustomEffectCatalogue;

  @state()
  private currentItem?: LibraryItem;

  @state()
  private savedSceneSelection?: LibraryItem;

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
  private saveNameDialogOpen = false;

  @state()
  private saveNameValue = "";

  @state()
  private saveNameError?: string;

  @state()
  private deleteCandidate?: DeleteCandidate;

  @state()
  private deletingItemId?: string;

  @state()
  private liveApplyEnabled = true;

  @state()
  private previewStatus?: PreviewStatus;

  private api?: EffectStudioApi;
  private previewSession?: EffectStudioPreviewSession;
  private savedBaseline?: string;
  private editorTransitionEpoch = 0;
  private unsubscribeLibrary?: () => void;
  private readonly loadRequests = new AsyncRequestController<PanelLoadContext>(
    (left, right) => left.api === right.api,
  );
  private deleteReturnFocus?: HTMLElement;
  private saveNameReturnFocus?: HTMLElement;
  private modalScrollLock?: {
    bodyOverflow: string;
    documentOverflow: string;
  };
  private readonly livePreview = new LivePreviewController<PanelPreviewRequest>({
    submit: (request) => {
      if (
        this.liveApplyEnabled &&
        request.configEntryId === this.selectedDeviceId
      ) {
        void this.previewSession?.submit(request);
      }
    },
    cancel: () => {
      void this.cancelPreview();
    },
  });

  private get isAdmin(): boolean {
    return this.hass?.user?.is_admin === true;
  }

  private get modalOpen(): boolean {
    return this.saveNameDialogOpen || this.deleteCandidate !== undefined;
  }

  private get selectedDevice(): DeviceCapabilities | undefined {
    return this.devices.find(
      (device) => device.config_entry_id === this.selectedDeviceId,
    );
  }

  private get selectedModel(): ModelSku | undefined {
    const model = this.selectedDevice?.model;
    return model === "H617A" || model === "H6199" ? model : undefined;
  }

  private get showDeviceSelector(): boolean {
    return (
      this.devices.length > 1 ||
      (this.devices.length > 0 &&
        this.selectedDeviceId !== undefined &&
        this.selectedDevice === undefined)
    );
  }

  private get editorReadOnly(): boolean {
    return !this.isAdmin || this.templateSourceLabel !== undefined;
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

  private get customEffectListContext(): CustomEffectListContext {
    return {
      model: this.selectedModel,
      catalogue: this.modelCatalogue,
      libraryItems: this.library.items,
    };
  }

  private get dirty(): boolean {
    if (!isEditableEffectContent(this.content)) {
      return false;
    }
    return this.savedBaseline !== serialiseEditable(this.name, this.content);
  }

  private get previewCapability() {
    if (!isEditableEffectContent(this.content)) {
      return undefined;
    }
    const device = this.selectedDevice;
    if (!device) {
      return undefined;
    }
    switch (this.content.kind) {
      case "h617a_painted":
        return device.custom_effects.painted;
      case "h617a_single":
        return device.custom_effects.single;
      case "h617a_multi":
        return device.custom_effects.multi;
      case "palette_diy":
        return device.custom_effects.palette_diy;
      case "advanced":
      case "scene_layered":
        return device.custom_effects.advanced;
      case "music_profile":
        return device.profiles.music;
      case "video_profile":
        return device.profiles.video;
      case "workshop":
        return device.custom_effects.workshop;
      case "special_diy":
        return device.custom_effects.special_diy;
    }
  }

  private get canPreview(): boolean {
    return (
      isEditableEffectContent(this.content) &&
      this.isAdmin &&
      !this.deletingCurrentItem &&
      this.previewCapability === "supported" &&
      this.selectedDevice !== undefined &&
      this.previewSession?.ready === true
    );
  }

  private get deletingCurrentItem(): boolean {
    return (
      this.deletingItemId !== undefined &&
      this.currentItem?.id === this.deletingItemId
    );
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.hass && !this.api) {
      void this.load();
    }
  }

  public disconnectedCallback(): void {
    this.releaseModalScrollLock();
    super.disconnectedCallback();
    this.loadRequests.invalidate();
    this.beginEditorTransition();
    this.stopSubscriptions();
    this.livePreview.dispose();
    this.api = undefined;
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("hass") && this.hass && !this.api) {
      void this.load();
    }
    this.syncModalScrollLock();
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

      ${this.renderStudioToolbar()}

      ${this.selectedDevice
        ? this.renderStudio()
        : this.renderMissingDevice()}
      ${this.saveNameDialogOpen ? this.renderSaveNameDialog() : nothing}
      ${this.deleteCandidate ? this.renderDeleteConfirmation() : nothing}
    `;
  }

  private renderStudio() {
    return html`
      <main
        class="studio ${this.section}-mode"
        ?inert=${this.modalOpen}
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.videoAvailable
            ? this.navButton("video", "Video")
            : nothing}
          ${this.navButton("scenes", "Built-in")}
          ${this.customEffectsAvailable
            ? this.navButton("custom", "Custom")
            : nothing}
        </nav>

        <govee-scene-browser
          ?hidden=${this.section !== "scenes"}
          .externalEditActive=${this.sceneEditorOpen}
          .api=${this.api}
          .device=${this.selectedDevice}
          .library=${this.library}
          .panelNotice=${this.notice}
          .previewStatus=${this.previewStatus}
          .isAdmin=${this.isAdmin}
          .savedSceneSelection=${this.savedSceneSelection}
          .initialSelection=${this.sceneInitialSelection}
          @library-item-saved=${this.sceneLibraryItemSaved}
          @library-item-delete-requested=${this.sceneLibraryItemDeleteRequested}
          @scene-edit-selected=${this.sceneTemplateSelected}
          @scene-preview-requested=${this.scenePreviewRequested}
          @scene-external-edit-cancelled=${this.cancelSceneEdit}
          @scene-initial-selection-opened=${this.sceneInitialSelectionOpened}
          @scene-initial-selection-failed=${this.sceneInitialSelectionFailed}
        ></govee-scene-browser>
        ${this.section === "scenes" && this.sceneEditorOpen
          ? html`
              <section class="editor-surface editor">
                ${this.renderPanelNotice()}
                ${this.renderAdvancedEditor()}
              </section>
            `
          : nothing}
        ${this.section === "video" ? this.renderVideo() : nothing}
        ${this.section === "custom" ? this.renderCustomEffects() : nothing}
      </main>
    `;
  }

  private renderMissingDevice() {
    const linked = this.selectedDeviceId !== undefined;
    return html`
      <main class="empty-state">
        <h2>${linked ? "This Govee light is unavailable" : "No Govee lights are available"}</h2>
        <p>
          ${linked
            ? "Choose another light or wait for this config entry to load."
            : "Add or enable a supported Govee Bluetooth light to use Effect Studio."}
        </p>
        <a href=${this.panel?.config?.configuration_path ?? "/config/integrations"}>
          Open integration configuration
        </a>
      </main>
    `;
  }

  private renderStudioToolbar() {
    if (
      !this.showDeviceSelector &&
      (!this.isAdmin || this.selectedDevice === undefined)
    ) {
      return nothing;
    }
    return html`
      <div class="studio-toolbar">
        ${this.renderDeviceSelector()}
        ${this.isAdmin && this.selectedDevice
          ? this.renderLiveApplyControl()
          : nothing}
      </div>
    `;
  }

  private renderDeviceSelector() {
    if (!this.showDeviceSelector) {
      return nothing;
    }
    const selectedUnavailable =
      this.selectedDeviceId !== undefined && this.selectedDevice === undefined;
    return html`
      <label class="device-selector">
        <span>Govee light</span>
        <select
          aria-label="Govee light"
          .value=${this.selectedDeviceId ?? ""}
          @change=${this.deviceChanged}
        >
          ${selectedUnavailable
            ? html`<option value=${this.selectedDeviceId!}>Unavailable light</option>`
            : nothing}
          ${[...this.devices]
            .sort((left, right) =>
              compareLabels(left.display_name, right.display_name),
            )
            .map(
              (device) => html`
                <option value=${device.config_entry_id}>
                  ${device.display_name} (${device.model})
                </option>
              `,
            )}
        </select>
      </label>
    `;
  }

  private renderLiveApplyControl() {
    const phase = this.previewStatus?.phase;
    const pending = phase === "queued" || phase === "writing";
    const warning = phase === "failed";
    const current =
      phase === "written" ||
      phase === "confirmed" ||
      phase === "unconfirmed";
    const status = pending
      ? "Applying changes"
      : warning
        ? "The latest change could not reach the light"
        : current
          ? phase === "unconfirmed"
            ? "Changes sent; readback is unavailable"
            : "Changes applied"
          : this.liveApplyEnabled
            ? "Live apply is ready"
            : "Live apply is off";
    return html`
      <div class="live-apply-control">
        <button
          class="live-apply-toggle"
          type="button"
          role="switch"
          aria-checked=${this.liveApplyEnabled}
          @click=${this.toggleLiveApply}
        >
          <span class="live-apply-track" aria-hidden="true">
            <span class="live-apply-thumb"></span>
          </span>
          <span>Live apply</span>
        </button>
        <span
          class="live-apply-status ${pending
            ? "pending"
            : warning
              ? "warning"
              : current
                ? "current"
                : "idle"}"
          role="status"
          aria-label=${status}
          title=${status}
        ></span>
        <span class="visually-hidden" aria-live="polite">${status}</span>
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
    return html`
      <govee-custom-effect-browser
        .context=${this.customEffectListContext}
        .category=${this.customEffectCategory}
        .currentItemId=${this.currentItem?.id}
        .templateSelection=${this.customTemplateSelection}
        .isAdmin=${this.isAdmin}
        @custom-category-requested=${(
          event: CustomEvent<CustomEffectBrowserCategoryRequest>,
        ) => {
          this.customEffectCategory = event.detail.category;
          void this.rememberNavigation();
        }}
        @custom-entry-requested=${(
          event: CustomEvent<CustomEffectBrowserEntryRequest>,
        ) => this.selectCustomEffectEntry(event.detail.entry)}
        @custom-new-requested=${(
          event: CustomEvent<CustomEffectBrowserCategoryRequest>,
        ) => this.newCustomEffect(event.detail.category)}
      ></govee-custom-effect-browser>

      <section class="editor-surface editor">
        ${this.renderPanelNotice()}
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
    if (
      this.content.kind === "palette_diy" ||
      this.content.kind === "special_diy"
    ) {
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
        ${this.renderPanelNotice()}
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
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${(
          event: CustomEvent<{
            content: VideoProfileContent;
            interaction?: LivePreviewInteraction;
          }>,
        ) => {
          this.installEditedContent(
            cloneVideoProfileContent(event.detail.content),
            event.detail.interaction,
          );
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
        .disabled=${this.editorReadOnly}
        .showModeSelector=${!this.templateSourceLabel}
        @content-changed=${(
          event: CustomEvent<{
            content: MusicProfileContent;
            interaction?: LivePreviewInteraction;
          }>,
        ) => {
          this.installEditedContent(
            cloneMusicProfileContent(event.detail.content),
            event.detail.interaction,
          );
        }}
      ></govee-music-profile-editor>
    `;
  }

  private renderProfileHeading() {
    return this.renderEditorHeading();
  }

  private libraryItemAvailable(item: LibrarySummary): boolean {
    return libraryItemAvailable(this.customEffectListContext, item);
  }

  private customEffectCategoryAvailable(
    category: CustomEffectCategory,
  ): boolean {
    return customEffectCategoryAvailable(
      this.customEffectListContext,
      category,
    );
  }

  private defaultCustomEffectCategory(): CustomEffectCategory {
    return defaultCustomEffectCategory(this.customEffectListContext);
  }

  private customEffectKindAvailable(kind: string): boolean {
    return customEffectKindAvailable(this.customEffectListContext, kind);
  }

  private newCustomEffect(category: CustomEffectCategory): void {
    if (category === "music") {
      const mode = this.modelCatalogue?.music_modes[0];
      if (mode) {
        this.openMusicTemplate(mode.id, mode.label);
      }
      return;
    }
    const kind = newEffectKindForCategory(
      this.customEffectListContext,
      category,
    );
    if (kind) {
      this.newEffect(kind);
    }
  }

  private renderPanelNotice() {
    return this.notice
      ? html`<div class="feedback" role="status">${this.notice}</div>`
      : nothing;
  }


  private renderDeleteConfirmation() {
    const candidate = this.deleteCandidate!;
    const discardsOpenEdits =
      candidate.discardsOpenEdits === true ||
      (this.currentItem?.id === candidate.id && this.dirty);
    return html`
      <div class="dialog-backdrop" @click=${this.cancelDelete}>
        <section
          class="dialog-card delete-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-effect-title"
          tabindex="-1"
          @click=${(event: Event) => event.stopPropagation()}
          @keydown=${this.deleteDialogKeyDown}
        >
          <h2 id="delete-effect-title">Delete effect?</h2>
          <p>
            <strong>${candidate.name}</strong> will be permanently removed
            from the shared Effect Studio library. This cannot be undone.
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

  private renderSaveNameDialog() {
    return html`
      <div class="dialog-backdrop" @click=${this.cancelSaveName}>
        <form
          class="dialog-card save-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-effect-title"
          tabindex="-1"
          @click=${(event: Event) => event.stopPropagation()}
          @keydown=${this.saveNameDialogKeyDown}
          @submit=${this.confirmNamedSave}
        >
          <h2 id="save-effect-title">Save effect</h2>
          <label class="field">
            <span>Effect name</span>
            <input
              aria-label="Effect name"
              aria-describedby=${this.saveNameError
                ? "save-effect-name-error"
                : nothing}
              maxlength="128"
              autocomplete="off"
              .value=${this.saveNameValue}
              @input=${(event: Event) => {
                this.saveNameValue = (event.target as HTMLInputElement).value;
                this.saveNameError = undefined;
              }}
            />
          </label>
          ${this.saveNameError
            ? html`
                <p id="save-effect-name-error" class="dialog-error" role="alert">
                  ${this.saveNameError}
                </p>
              `
            : nothing}
          <div class="dialog-actions">
            <button
              class="secondary"
              type="button"
              @click=${this.cancelSaveName}
            >
              Cancel
            </button>
            <button class="primary" type="submit">Save effect</button>
          </div>
        </form>
      </div>
    `;
  }

  private selectCustomEffectEntry(entry: CustomEffectListEntry): void {
    if (entry.kind === "saved") {
      void this.selectItem(entry.item.id);
      return;
    }
    if (entry.kind === "special_diy") {
      this.openEditableTemplate(
        entry.label,
        entry.content,
        entry.key,
      );
      return;
    }
    if (entry.kind === "music") {
      this.openMusicTemplate(entry.mode, entry.label);
      return;
    }
    if (entry.kind === "paint") {
      this.newEffect("h617a_painted", undefined, {
        name: entry.label,
        content: blankPainted(),
        selectionIdentity: entry.key,
        customCopyStarted: true,
      });
      return;
    }
    const catalogue = this.modelCatalogue;
    if (!catalogue) {
      return;
    }
    if (this.selectedModel === "H617A") {
      const content = blankCustomEffect("h617a_single", catalogue);
      this.newEffect("h617a_single", undefined, {
        name: entry.label,
        content: {
          ...content,
          family: entry.family,
          variant: entry.variant,
        },
        selectionIdentity: entry.key,
        customCopyStarted: true,
      });
      return;
    }
    this.newEffect("palette_diy", undefined, {
      name: entry.label,
      content: blankPaletteDiy(
        catalogue,
        this.selectedModel!,
        entry.family,
        entry.variant,
      ),
      selectionIdentity: entry.key,
      customCopyStarted: true,
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
    this.customCopyStarted = false;
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
    this.beginEditorTransition();
    this.currentItem = undefined;
    this.templateSourceLabel = undefined;
    this.customCopyStarted = true;
    this.customTemplateSelection = `template:music:${mode}`;
    this.name = label;
    this.content = {
      kind: "music_profile",
      model,
      mode,
      sensitivity: model === "H6199" ? 100 : 99,
      colour: null,
      calm: ["rhythm", "bloom", "shiny"].includes(mode)
        ? false
        : null,
      parameters: {},
    };
    this.savedBaseline = starterBaseline(
      this.name,
      this.content,
      this.customCopyStarted,
    );
    this.notice = this.applyAvailabilityNotice();
  }

  private renderAdvancedEditor() {
    if (!isAdvancedEditableContent(this.content)) {
      return nothing;
    }
    return html`
      ${this.renderEditorHeading()}

      ${!this.isAdmin
        ? html`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `
        : nothing}

      <govee-advanced-effect-editor
        .content=${advancedEditorContent(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.selectedDevice?.segment_count ?? 15}
        @content-changed=${(
          event: CustomEvent<{
            content: AdvancedContent;
            interaction?: LivePreviewInteraction;
          }>,
        ) => {
          if (
            !isAdvancedEditableContent(this.content) ||
            !this.prepareTemplateEdit()
          ) {
            return;
          }
          this.installEditedContent(
            updateAdvancedEditorContent(
              this.content,
              event.detail.content,
            ),
            event.detail.interaction,
          );
        }}
      ></govee-advanced-effect-editor>
    `;
  }

  private renderOpaqueEditor(content: OpaqueContent) {
    return html`
      ${this.renderEditorHeading({
        save: false,
        title: html`<h2>${this.name}</h2>`,
      })}
      <div class="feedback read-only" role="note">
        This effect definition can be inspected, but this editor cannot change,
        save or preview it.
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
    return html`
      ${this.renderEditorHeading()}

      ${!this.isAdmin
        ? html`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `
        : nothing}

      ${this.showCustomEffectSelector
        ? this.renderSingleEffectSelector()
        : nothing}

      <govee-painted-segment-editor
        .colours=${coloursForSegments(this.content)}
        .disabled=${this.editorReadOnly}
        @segment-selected=${(
          event: CustomEvent<{
            index: number;
            interaction: LivePreviewInteraction;
          }>,
        ) =>
          this.setSegmentColour(
            event.detail.index,
            event.detail.interaction,
          )}
      ></govee-painted-segment-editor>

      <div class="controls">
        <section class="card">
          <h3 class="section-title">Brushes</h3>
          <govee-palette-editor
            class="paint-brushes"
            .palette=${this.paintBrushes}
            .minColours=${2}
            .maxColours=${8}
            .disabled=${this.editorReadOnly}
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
              .disabled=${this.editorReadOnly}
              @colour-changing=${this.backgroundChanged}
              @colour-changed=${this.backgroundChanged}
            ></govee-colour-picker>
          </div>
          <div class="button-row">
            <button
              class="secondary ${this.brushUsesBackground ? "active" : ""}"
              type="button"
              ?disabled=${this.editorReadOnly}
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
              ?disabled=${this.editorReadOnly}
              @click=${this.paintAll}
            >
              Paint all
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${this.editorReadOnly}
              @click=${this.resetPaint}
            >
              Reset
            </button>
          </div>
        </section>

        <section class="card">
          <div class="parameter-stack">
            ${this.renderPaintedVariationField()}
            ${this.sliderField("Speed", "speed", this.content.speed)}
            ${this.sliderField(
              "Brightness",
              "brightness",
              this.content.brightness,
              `${this.content.brightness}%`,
            )}
          </div>
        </section>
      </div>
    `;
  }

  private renderPaletteEffectEditor() {
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "h617a_multi" &&
      this.content.kind !== "palette_diy" &&
      this.content.kind !== "special_diy"
    ) {
      return nothing;
    }
    const content = this.content;
    return html`
      ${this.renderEditorHeading()}

      ${!this.isAdmin
        ? html`
            <div class="feedback read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `
        : nothing}

      ${this.showCustomEffectSelector
        ? this.renderSingleEffectSelector()
        : nothing}

      <govee-custom-effect-editor
        .content=${content}
        .catalogue=${this.modelCatalogue}
        .disabled=${this.editorReadOnly}
        @content-changed=${(
          event: CustomEvent<{
            content:
              | CustomEffectContent
              | PaletteDiyEffectContent
              | SpecialDiyContent;
            interaction?: LivePreviewInteraction;
          }>,
        ) => {
          const content =
            event.detail.content.kind === "palette_diy"
              ? clonePaletteDiy(event.detail.content)
              : event.detail.content.kind === "special_diy"
                ? cloneSpecialDiy(event.detail.content)
              : cloneCustomEffect(event.detail.content);
          this.installEditedContent(content, event.detail.interaction);
        }}
      ></govee-custom-effect-editor>
    `;
  }

  private get showCustomEffectSelector(): boolean {
    return showCustomEffectSelector(
      this.currentItem !== undefined,
      this.customCopyStarted,
      this.templateSourceLabel,
    );
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
    const effectFamilies =
      this.currentItem?.content.kind === "h617a_painted"
        ? []
        : this.modelCatalogue?.effects.filter(
            (effect) => effect.category === "single_layer",
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
            ?disabled=${this.editorReadOnly}
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
          ?disabled=${this.editorReadOnly}
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
    const origin = this.currentItem
      ? effectOriginDescription(this.currentItem.origin)
      : undefined;
    const marker =
      this.dirty && !this.templateSourceLabel
        ? html`<span class="dirty-marker" aria-label="Unsaved changes">*</span>`
        : nothing;
    if (this.templateSourceLabel) {
      return html`
        <div class="editor-title">
          <h2>${this.templateSourceLabel}</h2>
          ${origin ? html`<small class="origin-name">${origin}</small>` : nothing}
        </div>
      `;
    }
    if (!this.currentItem) {
      const title =
        this.customCopyStarted && this.name.trim()
          ? this.name
          : "New effect";
      return html`
        <div class="editor-title">
          <div class="editable-title"><h2>${title}</h2>${marker}</div>
          ${origin ? html`<small class="origin-name">${origin}</small>` : nothing}
        </div>
      `;
    }
    return html`
      <div class="editor-title">
        <div class="editable-title">
          <input
            class="editor-name"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
          ${marker}
        </div>
        ${origin ? html`<small class="origin-name">${origin}</small>` : nothing}
      </div>
    `;
  }

  private renderEditorHeading(
    options: { save?: boolean; title?: unknown } = {},
  ) {
    return html`
      <div class="editor-heading">
        <div>${options.title ?? this.renderEffectName()}</div>
        <div class="actions">
          ${this.content.kind === "scene_layered"
            ? html`
                <button
                  class="secondary"
                  type="button"
                  ?disabled=${this.saving}
                  @click=${this.cancelSceneEdit}
                >
                  Cancel
                </button>
              `
            : nothing}
          ${options.save === false ? nothing : this.renderSaveAction()}
          ${this.renderEditorDeleteButton()}
        </div>
      </div>
    `;
  }

  private renderSaveAction() {
    if (this.templateSourceLabel) {
      return html`
        <button
          class="secondary"
          type="button"
          ?disabled=${!this.isAdmin ||
          this.saving ||
          this.deletingCurrentItem}
          @click=${this.editTemplate}
        >
          Edit
        </button>
      `;
    }
    const saveLabel =
      !this.currentItem && this.customCopyStarted
        ? "Save as Custom"
        : "Save";
    return html`
      <button
        class="primary"
        type="button"
        ?disabled=${!this.isAdmin ||
        !this.dirty ||
        this.saving ||
        this.deletingCurrentItem}
        @click=${this.requestSave}
      >
        ${this.saving ? "Saving..." : saveLabel}
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

  private sliderField(
    label: string,
    key: "speed" | "brightness",
    value: number,
    valueText?: string,
  ) {
    return html`
      <govee-slider-control
        .label=${label}
        .value=${value}
        .minimum=${0}
        .maximum=${100}
        .valueText=${valueText}
        .disabled=${this.editorReadOnly}
        @value-changed=${(event: CustomEvent<SliderControlChange>) =>
          this.updateContent({ [key]: event.detail.value })}
      ></govee-slider-control>
    `;
  }

  private async selectSection(section: StudioSection): Promise<void> {
    const transitionEpoch = this.beginEditorTransition();
    if (section === this.section) {
      if (section === "scenes" && this.sceneEditorOpen) {
        this.sceneEditorOpen = false;
      }
      return;
    }
    if (section === "custom" && !this.customEffectsAvailable) {
      return;
    }
    if (section === "video" && !this.videoAvailable) {
      return;
    }
    this.sceneEditorOpen = false;
    this.section = section;
    this.notice = undefined;
    void this.rememberNavigation();
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
    this.loading = true;
    this.error = undefined;
    this.previewStatus = undefined;
    const api = new EffectStudioApi(this.hass!);
    this.api = api;
    const loadRequest = this.loadRequests.begin({ api });
    let preferenceNotice: string | undefined;
    try {
      const [info, devices, library, customCatalogue, userState] =
        await Promise.all([
          api.info(),
          api.devices(),
          api.library(),
          api.customCatalogue(),
          api.userState(),
        ]);
      if (!this.loadIsCurrent(loadRequest)) {
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
      this.userState = userState;
      this.selectedDeviceId = initialDeviceId(
        window.location.pathname,
        devices,
        userState.selected_config_entry_id,
      );
      this.notice = this.applyAvailabilityNotice();
      if (
        this.selectedDevice &&
        this.selectedDeviceId !== userState.selected_config_entry_id
      ) {
        try {
          this.userState = await api.updateUserState(
            this.selectedDeviceId,
            userState.navigation,
          );
        } catch (error) {
          preferenceNotice = `Could not remember the selected light: ${errorMessage(error)}`;
        }
      }
      if (!this.customEffectsAvailable) {
        this.section = "scenes";
      }

      const unsubscribeLibrary = await api.subscribeLibrary(
        (snapshot) => {
          void this.libraryChanged(snapshot);
        },
        (error) => this.subscriptionFailed(error, loadRequest),
      );
      if (!this.loadIsCurrent(loadRequest) || this.error) {
        unsubscribeLibrary();
        return;
      }
      this.unsubscribeLibrary = unsubscribeLibrary;
      if (this.isAdmin) {
        const previewSession = new EffectStudioPreviewSession(
          api,
          (status) => {
            if (
              status !== undefined &&
              status.config_entry_id !== this.selectedDeviceId
            ) {
              return;
            }
            this.previewStatus = status;
          },
          (error) => this.subscriptionFailed(error, loadRequest),
        );
        this.previewSession = previewSession;
        const opened = await previewSession.open();
        if (
          !opened ||
          !this.loadIsCurrent(loadRequest) ||
          this.error
        ) {
          previewSession.close();
          return;
        }
      }

      await this.openInitialContext();
      this.notice = preferenceNotice ?? this.notice;
    } catch (error) {
      if (this.loadIsCurrent(loadRequest)) {
        this.stopSubscriptions();
        this.error = errorMessage(error);
      }
    } finally {
      if (this.loadIsCurrent(loadRequest)) {
        this.loading = false;
      }
    }
  }

  private deviceChanged = async (event: Event): Promise<void> => {
    const selectedDeviceId = (event.target as HTMLSelectElement).value;
    if (
      !selectedDeviceId ||
      selectedDeviceId === this.selectedDeviceId ||
      !this.devices.some(
        (device) => device.config_entry_id === selectedDeviceId,
      )
    ) {
      return;
    }
    await this.cancelPreview();
    this.selectedDeviceId = selectedDeviceId;
    this.previewStatus = undefined;
    this.notice = undefined;
    window.history.replaceState(
      window.history.state,
      "",
      editorDevicePath(selectedDeviceId),
    );
    let preferenceNotice: string | undefined;
    try {
      this.userState = await this.api?.updateUserState(
        selectedDeviceId,
        this.userState?.navigation ?? {},
      );
    } catch (error) {
      preferenceNotice = `Could not remember the selected light: ${errorMessage(error)}`;
    }
    await this.openInitialContext();
    this.notice = preferenceNotice ?? this.notice;
  };

  private async openInitialContext(): Promise<void> {
    this.openRootCreateView();
    const context = activeStudioContext(
      this.selectedDevice,
      this.library.items,
      (candidate) =>
        candidate.kind === "scene_builtin" ||
        candidate.kind === "scene_palette" ||
        candidate.kind === "scene_layered"
          ? candidate.template?.sku === this.selectedModel
          : this.libraryItemAvailable(candidate),
    );
    if (context.kind === "native-scene") {
      this.sceneInitialSelection = {
        kind: "native",
        effect: context.effect,
      };
      return;
    }
    if (context.kind === "root") {
      return;
    }
    const item = context.item;
    if (
      item.kind === "scene_builtin" ||
      item.kind === "scene_palette" ||
      item.kind === "scene_layered"
    ) {
      this.sceneInitialSelection = {
        kind: "saved",
        itemId: item.id,
      };
      return;
    }
    this.section = item.kind === "video_profile" ? "video" : "custom";
    if (!await this.selectItem(item.id)) {
      this.openRootCreateView();
    }
  }

  private openRootCreateView(): void {
    this.beginEditorTransition();
    this.sceneEditorOpen = false;
    this.sceneInitialSelection = undefined;
    this.currentItem = undefined;
    this.savedSceneSelection = undefined;
    this.templateSourceLabel = undefined;
    this.customCopyStarted = false;
    this.customTemplateSelection = undefined;
    this.name = "";
    this.content = blankPainted();
    this.savedBaseline = undefined;
    const navigation = this.userState?.navigation ?? {};
    this.section = rememberedStudioSection(navigation, {
      custom: this.customEffectsAvailable,
      video: this.videoAvailable,
    });
    const category = navigation.custom_category;
    if (
      isCustomEffectCategory(category) &&
      category !== "all" &&
      this.customEffectCategoryAvailable(category)
    ) {
      this.customEffectCategory = category;
    } else {
      this.customEffectCategory = this.defaultCustomEffectCategory();
    }
    this.notice = this.applyAvailabilityNotice();
  }

  private sceneInitialSelectionOpened = (): void => {
    this.section = "scenes";
    this.sceneInitialSelection = undefined;
  };

  private sceneInitialSelectionFailed = (): void => {
    this.sceneInitialSelection = undefined;
    this.openRootCreateView();
  };

  private async rememberNavigation(): Promise<void> {
    if (!this.api || !this.userState) {
      return;
    }
    try {
      this.userState = await this.api.updateUserState(
        this.selectedDeviceId,
        {
          section: this.section,
          custom_category: this.customEffectCategory,
        },
      );
    } catch (error) {
      this.notice = `Could not remember Studio navigation: ${errorMessage(error)}`;
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
        (effect) => effect.category === "single_layer",
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
        (effect) => effect.category === "single_layer",
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

  private loadIsCurrent(request: PanelLoadRequest): boolean {
    return (
      this.isConnected &&
      this.api !== undefined &&
      this.loadRequests.isCurrent(request, { api: this.api })
    );
  }

  private subscriptionFailed(
    error: Error,
    request: PanelLoadRequest,
  ): void {
    if (!this.loadIsCurrent(request)) {
      return;
    }
    this.error = error.message;
    this.loading = false;
    queueMicrotask(() => {
      if (this.loadIsCurrent(request)) {
        this.stopSubscriptions();
      }
    });
  }

  private stopSubscriptions(): void {
    this.livePreview.reset();
    this.previewStatus = undefined;
    this.unsubscribeLibrary?.();
    this.unsubscribeLibrary = undefined;
    this.previewSession?.close();
    this.previewSession = undefined;
  }

  private async libraryChanged(snapshot: LibrarySnapshot): Promise<void> {
    this.library = snapshot;
    const sync = libraryItemSyncResult(
      this.currentItem,
      snapshot.items,
      this.dirty,
      this.deletingItemId,
    );
    if (sync.action === "none") {
      return;
    }
    if (sync.action === "removed") {
      this.notice = "This effect was removed from the shared library.";
      return;
    }
    if (sync.action === "conflict") {
      this.notice =
        "This effect changed elsewhere. Reload it before saving.";
      return;
    }
    const transitionEpoch = this.beginEditorTransition();
    const selected = await this.selectItem(
      sync.summary.id,
      transitionEpoch,
    );
    if (
      selected &&
      this.editorTransitionIsCurrent(transitionEpoch)
    ) {
      this.notice = "Loaded the latest saved version.";
    }
  }

  private sceneLibraryItemSaved(
    event: CustomEvent<{
      item: LibraryItem;
    }>,
  ): void {
    this.library = {
      items: upsertSummary(this.library.items, event.detail.item),
    };
  }

  private sceneTemplateSelected(
    event: CustomEvent<{
      content: LayeredSceneContent;
      config_entry_id: string;
      item?: LibraryItem;
      name: string;
    }>,
  ): void {
    if (
      !this.isAdmin ||
      event.detail.config_entry_id !== this.selectedDeviceId
    ) {
      return;
    }
    this.beginEditorTransition();
    this.currentItem = event.detail.item;
    this.templateSourceLabel = undefined;
    this.customCopyStarted = event.detail.item === undefined;
    this.name = event.detail.name.trim() || "Layered scene template";
    this.content = cloneLayeredSceneContent(event.detail.content);
    this.savedBaseline =
      event.detail.item?.content.kind === "scene_layered"
        ? serialiseEditable(
            event.detail.item.name,
            event.detail.item.content,
          )
        : undefined;
    this.sceneEditorOpen = true;
    this.customTemplateSelection = undefined;
    this.notice = undefined;
  }

  private sceneLibraryItemDeleteRequested(
    event: CustomEvent<LibraryItemDeleteRequest>,
  ): void {
    const { returnFocus, ...candidate } = event.detail;
    this.requestDelete(candidate, returnFocus);
  }

  private cancelSceneEdit(): void {
    this.beginEditorTransition();
    this.sceneEditorOpen = false;
    this.notice = undefined;
  }

  private beginEditorTransition(): number {
    this.editorTransitionEpoch += 1;
    this.livePreview.reset();
    this.previewStatus = undefined;
    this.saveNameDialogOpen = false;
    this.saveNameError = undefined;
    this.saveNameReturnFocus = undefined;
    return this.editorTransitionEpoch;
  }

  private editorTransitionIsCurrent(epoch: number): boolean {
    return epoch === this.editorTransitionEpoch;
  }

  private switchCustomMode(
    kind: CustomEffectContent["kind"],
    schedulePreview = true,
  ): void {
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
            segments: Array.from(
              { length: PAINTED_SEGMENT_COUNT },
              (_, index) => index,
            ),
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
    if (schedulePreview) {
      this.installEditedContent(next);
    } else {
      this.content = next;
    }
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
      customCopyStarted?: boolean;
    },
  ): void {
    if (existingTransitionEpoch === undefined) {
      this.beginEditorTransition();
    }
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
    this.customCopyStarted = initial?.customCopyStarted ?? false;
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
    this.savedBaseline = starterBaseline(
      this.name,
      this.content,
      this.customCopyStarted,
    );
    this.notice = this.applyAvailabilityNotice();
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
        this.saving}
        @click=${(event: Event) =>
          this.requestDelete(
            {
              id: this.currentItem!.id,
              version: this.currentItem!.version,
              updated_at: this.currentItem!.updated_at,
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
      this.saving
    ) {
      return;
    }
    this.deleteCandidate = { ...candidate };
    this.deleteReturnFocus = returnFocus;
    this.notice = undefined;
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>(".delete-dialog .secondary")
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
    if (event.key === "Tab") {
      this.trapDialogFocus(event);
      return;
    }
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
    this.deleteCandidate = undefined;
    this.deleteReturnFocus = undefined;
    this.deletingItemId = candidate.id;
    this.notice = undefined;
    try {
      await api.deleteItem(candidate);
      this.library = {
        items: this.library.items.filter((item) => item.id !== candidate.id),
      };
      if (
        this.currentItem?.id === candidate.id &&
        this.currentItem.version === candidate.version
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
          this.library = snapshot;
        } catch (refreshError) {
          this.notice += ` Library refresh failed: ${errorMessage(refreshError)}`;
        }
      }
    } finally {
      this.deletingItemId = undefined;
      this.focusActiveSectionIfNeeded();
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

  private requestSave(event: Event): void {
    if (this.currentItem) {
      void this.save();
      return;
    }
    if (
      !this.isAdmin ||
      !this.dirty ||
      this.saving ||
      this.deletingCurrentItem
    ) {
      return;
    }
    this.saveNameValue = this.name;
    this.saveNameError = undefined;
    this.saveNameReturnFocus = event.currentTarget as HTMLElement;
    this.saveNameDialogOpen = true;
    void this.updateComplete.then(() => {
      const input =
        this.shadowRoot?.querySelector<HTMLInputElement>(".save-dialog input");
      input?.focus();
      input?.select();
    });
  }

  private cancelSaveName(): void {
    const returnFocus = this.saveNameReturnFocus;
    this.saveNameDialogOpen = false;
    this.saveNameError = undefined;
    this.saveNameReturnFocus = undefined;
    void this.updateComplete.then(() => {
      if (returnFocus?.isConnected) {
        returnFocus.focus();
      }
    });
  }

  private saveNameDialogKeyDown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      this.trapDialogFocus(event);
      return;
    }
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    this.cancelSaveName();
  }

  private trapDialogFocus(event: KeyboardEvent): void {
    const dialog = event.currentTarget as HTMLElement;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    const root = dialog.getRootNode();
    const active =
      root instanceof ShadowRoot ? root.activeElement : document.activeElement;
    const activeIsFocusable =
      active instanceof HTMLElement && focusable.includes(active);
    if (event.shiftKey) {
      if (active === first || !activeIsFocusable) {
        event.preventDefault();
        last.focus();
      }
      return;
    }
    if (active === last || !activeIsFocusable) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusActiveSectionIfNeeded(): void {
    void this.updateComplete.then(() => {
      if (this.shadowRoot?.activeElement) {
        return;
      }
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>(
          '.primary-nav .selector[aria-current="page"]',
        )
        ?.focus();
    });
  }

  private syncModalScrollLock(): void {
    if (!this.modalOpen) {
      this.releaseModalScrollLock();
      return;
    }
    if (this.modalScrollLock) {
      return;
    }
    this.modalScrollLock = {
      bodyOverflow: document.body.style.overflow,
      documentOverflow: document.documentElement.style.overflow,
    };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  private releaseModalScrollLock(): void {
    if (!this.modalScrollLock) {
      return;
    }
    document.body.style.overflow = this.modalScrollLock.bodyOverflow;
    document.documentElement.style.overflow =
      this.modalScrollLock.documentOverflow;
    this.modalScrollLock = undefined;
  }

  private confirmNamedSave(event: SubmitEvent): void {
    event.preventDefault();
    const name = this.saveNameValue.trim();
    if (!name) {
      this.saveNameError = "Enter an effect name.";
      void this.updateComplete.then(() => {
        this.shadowRoot
          ?.querySelector<HTMLInputElement>(".save-dialog input")
          ?.focus();
      });
      return;
    }
    this.name = name;
    this.saveNameDialogOpen = false;
    this.saveNameError = undefined;
    this.saveNameReturnFocus = undefined;
    void this.save();
  }

  private editTemplate(): void {
    this.prepareTemplateEdit();
  }

  private prepareTemplateEdit(): boolean {
    const source = this.templateSourceLabel;
    if (!source) {
      return true;
    }
    if (
      !this.isAdmin ||
      this.saving ||
      this.deletingCurrentItem
    ) {
      return false;
    }
    this.beginEditorTransition();
    this.templateSourceLabel = undefined;
    this.customTemplateSelection = undefined;
    this.customCopyStarted = true;
    this.name = `Custom ${source}`;
    this.savedBaseline = undefined;
    return true;
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
    }, event.type === "colour-changing" ? "changing" : "committed");
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
      this.switchCustomMode("h617a_single", false);
    }
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "palette_diy"
    ) {
      return;
    }
    this.installEditedContent({
      ...this.content,
      family: family.family,
      variant: variation.variant,
    });
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
    }, "committed");
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

  private setSegmentColour(
    index: number,
    interaction: LivePreviewInteraction,
  ): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    const colours = coloursForSegments(this.content);
    colours[index] = this.brushUsesBackground
      ? [...this.content.background]
      : this.activePaintBrush;
    this.installEditedContent({
      ...this.content,
      groups: groupsFromColours(colours, this.content.background),
    }, interaction);
  }

  private paintAll(): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    const colour = this.brushUsesBackground
      ? this.content.background
      : this.activePaintBrush;
    this.installEditedContent({
      ...this.content,
      groups: groupsFromColours(
        Array.from(
          { length: PAINTED_SEGMENT_COUNT },
          () => [...colour] as RGB,
        ),
        this.content.background,
      ),
    });
  }

  private resetPaint(): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.installEditedContent({
      ...this.content,
      groups: [],
    });
  }

  private updateContent(
    update: Partial<PaintedContent>,
    interaction: LivePreviewInteraction = "changing",
  ): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.installEditedContent({
      ...this.content,
      ...update,
    }, interaction);
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
    const transitionEpoch = this.editorTransitionEpoch;
    const originatingItem = this.currentItem;
    const content = cloneEditableEffect(this.content);
    const savingSceneEditor = this.sceneEditorOpen;
    this.saving = true;
    this.notice = undefined;
    try {
      const result = originatingItem
        ? await api.updateItem(
            originatingItem,
            name,
            content,
          )
        : await api.createItem(
            name,
            content,
          );
      if (!isEditableEffectContent(result.content)) {
        throw new Error("The saved effect returned an unsupported definition.");
      }
      const savedContent = result.content;
      this.library = {
        items: upsertSummary(this.library.items, result),
      };
      const originIsCurrent =
        this.editorTransitionIsCurrent(transitionEpoch) &&
        sameLibraryItemVersion(this.currentItem, originatingItem) &&
        isEditableEffectContent(this.content) &&
        serialiseEditable(this.name, this.content) ===
          serialiseEditable(name, content);
      if (originIsCurrent) {
        this.currentItem = result;
        this.customCopyStarted = false;
        this.customTemplateSelection = undefined;
        this.name = result.name;
        this.content = cloneEditableEffect(savedContent);
        this.savedBaseline = serialiseEditable(this.name, this.content);
        if (savingSceneEditor && savedContent.kind === "scene_layered") {
          this.sceneEditorOpen = false;
          this.section = "custom";
          this.customEffectCategory = "my-effects";
          void this.rememberNavigation();
        }
        if (
          originatingItem &&
          savedContent.kind === "scene_layered"
        ) {
          this.savedSceneSelection = result;
        }
      }
      const savedResultIsCurrent = () =>
        this.editorTransitionIsCurrent(transitionEpoch) &&
        sameLibraryItemVersion(this.currentItem, result) &&
        isEditableEffectContent(this.content) &&
        serialiseEditable(this.name, this.content) ===
          serialiseEditable(result.name, savedContent);
      if (savedResultIsCurrent()) {
        this.notice = undefined;
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
          this.library = snapshot;
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

  private installEditedContent(
    content: EffectContent,
    interaction: LivePreviewInteraction = "committed",
  ): void {
    this.content = content;
    const request = this.currentPreviewRequest();
    if (request) {
      this.livePreview.schedule(request, interaction);
    }
  }

  private scenePreviewRequested(
    event: CustomEvent<ScenePreviewRequest>,
  ): void {
    if (!this.liveApplyEnabled || !this.selectedDeviceId) {
      return;
    }
    const request = this.previewRequestForScene(
      event.detail,
      this.selectedDeviceId,
      true,
    );
    this.livePreview.schedule(request, "committed");
  }

  private toggleLiveApply = (): void => {
    if (this.liveApplyEnabled) {
      this.liveApplyEnabled = false;
      this.previewStatus = undefined;
      this.livePreview.disable();
      return;
    }
    this.liveApplyEnabled = true;
    const request = this.currentPreviewRequest(true);
    this.livePreview.enable(request);
  };

  private currentPreviewRequest(force = false): PanelPreviewRequest | undefined {
    if (!this.liveApplyEnabled || !this.selectedDeviceId) {
      return undefined;
    }
    if (this.section === "scenes") {
      const browser =
        this.shadowRoot?.querySelector<GoveeSceneBrowser>(
          "govee-scene-browser",
        );
      const request = browser?.currentPreviewRequest();
      return request
        ? this.previewRequestForScene(
            request,
            this.selectedDeviceId,
            force,
          )
        : undefined;
    }
    if (!this.canPreview || !isEditableEffectContent(this.content)) {
      return undefined;
    }
    const name = this.name.trim() || "Live preview";
    return snapshotPreviewRequest(
      this.selectedDeviceId,
      name,
      this.content,
      force,
    );
  }

  private previewRequestForScene(
    request: ScenePreviewRequest,
    configEntryId: string,
    force: boolean,
  ): PanelPreviewRequest {
    return scenePreviewRequest(request, configEntryId, force);
  }

  private async cancelPreview(): Promise<void> {
    const previewSession = this.previewSession;
    if (!previewSession) {
      return;
    }
    try {
      await previewSession.cancel(this.selectedDeviceId);
    } catch (error) {
      if (errorCode(error) !== "not_found") {
        this.notice = `Could not cancel Live apply: ${errorMessage(error)}`;
      }
    }
  }

  private applyAvailabilityNotice(): string | undefined {
    if (this.selectedDeviceId && !this.selectedDevice) {
      return "This device is temporarily unavailable in Home Assistant. Live apply will resume after it is loaded and edited.";
    }
    return undefined;
  }

  static styles = effectStudioPanelStyles;
}

function isCustomEffectCategory(
  value: unknown,
): value is CustomEffectCategory {
  return (
    value === "all" ||
    value === "music" ||
    value === "single-layer" ||
    value === "multi-layer" ||
    value === "advanced" ||
    value === "special-diy" ||
    value === "my-effects"
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-govee-led-ble-editor": GoveeLedEffectStudio;
  }
}

if (!customElements.get("ha-govee-led-ble-editor")) {
  customElements.define("ha-govee-led-ble-editor", GoveeLedEffectStudio);
}
