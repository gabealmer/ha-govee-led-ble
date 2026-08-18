import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import "./advanced-effect-editor";
import "./colour-picker";
import "./custom-effect-editor";
import type { CustomEffectListEntry } from "./custom-effect-list";
import type {
  CustomEffectBrowserCategoryRequest,
  CustomEffectBrowserEntryRequest,
} from "./custom-effect-browser";
import "./custom-effect-browser";
import {
  advancedEditorContent,
  coloursForSegments,
  effectOriginDescription,
  isAdvancedEditableContent,
  isCustomEffectContent,
} from "./effect-editor-model";
import type { LivePreviewInteraction } from "./live-preview-controller";
import "./music-profile-editor";
import "./palette-editor";
import "./painted-segment-editor";
import { PanelDataController } from "./panel-data-controller";
import { PanelEditorController } from "./panel-editor-controller";
import { PanelLibraryController } from "./panel-library-controller";
import { PanelModalController } from "./panel-modal-controller";
import { PanelModel, type DeleteCandidate } from "./panel-model";
import { PanelNavigationController } from "./panel-navigation-controller";
import { PanelPreviewController } from "./panel-preview-controller";
import { effectStudioPanelStyles } from "./panel-styles";
import type {
  GoveeSceneBrowser,
  LibraryItemDeleteRequest,
  ScenePreviewRequest,
} from "./scene-browser";
import "./scene-browser";
import type { SliderControlChange } from "./slider-control";
import "./slider-control";
import type { StudioSection } from "./studio-navigation";
import "./video-profile-editor";
import type {
  AdvancedContent,
  CustomEffectContent,
  HomeAssistant,
  LayeredSceneContent,
  LibraryItem,
  LibrarySummary,
  MusicProfileContent,
  OpaqueContent,
  PaintedContent,
  PaletteDiyEffectContent,
  PanelConfig,
  RGB,
  SpecialDiyContent,
  VideoProfileContent,
} from "./types";
import { compareLabels } from "./ui-utils";

export class GoveeLedEffectStudio extends LitElement {
  @property({ attribute: false })
  public hass?: HomeAssistant;

  @property({ attribute: false })
  public panel?: PanelConfig;

  @state()
  private modelRevision = 0;

  private readonly model = new PanelModel(() => {
    this.modelRevision += 1;
  });
  private readonly preview = new PanelPreviewController(this.model);
  private readonly modal = new PanelModalController(this.model, {
    updateComplete: () => this.updateComplete,
    root: () => this.shadowRoot,
    canMutate: () => this.data?.api !== undefined,
  });
  private readonly editor: PanelEditorController;
  private readonly libraryController: PanelLibraryController;
  private readonly navigation: PanelNavigationController;
  private readonly data: PanelDataController;

  public constructor() {
    super();
    this.editor = new PanelEditorController(
      this.model,
      this.preview,
      this.modal,
      {
        apiReady: () => this.data?.api !== undefined,
        selectItem: (itemId) => void this.libraryController.selectItem(itemId),
      },
    );
    this.libraryController = new PanelLibraryController(
      this.model,
      this.editor,
      this.modal,
      {
        api: () => this.data?.api,
        rememberNavigation: () => this.navigation.remember(),
      },
    );
    this.navigation = new PanelNavigationController(
      this.model,
      this.editor,
      this.libraryController,
      this.preview,
      {
        api: () => this.data?.api,
        pathname: () => window.location.pathname,
        replacePath: (path) => {
          window.history.replaceState(window.history.state, "", path);
        },
      },
    );
    this.data = new PanelDataController(this.model, this.preview, {
      connected: () => this.isConnected,
      initialiseSelectedDevice: () =>
        this.navigation.initialiseSelectedDevice(),
      openInitialContext: () => this.navigation.openInitialContext(),
      libraryChanged: (snapshot) =>
        this.libraryController.libraryChanged(snapshot),
    });
  }

  private get api() { return this.data.api; }
  private get loading() { return this.model.loading; }
  private get error() { return this.model.error; }
  private get notice() { return this.model.notice; }
  private get devices() { return this.model.devices; }
  private get selectedDeviceId() { return this.model.selectedDeviceId; }
  private get sceneInitialSelection() { return this.model.sceneInitialSelection; }
  private get section() { return this.model.section; }
  private get customEffectCategory() { return this.model.customEffectCategory; }
  private get sceneEditorOpen() { return this.model.sceneEditorOpen; }
  private get customTemplateSelection() { return this.model.customTemplateSelection; }
  private get templateSourceLabel() { return this.model.templateSourceLabel; }
  private get customCopyStarted() { return this.model.customCopyStarted; }
  private get library() { return this.model.library; }
  private get customCatalogue() { return this.model.customCatalogue; }
  private get currentItem() { return this.model.currentItem; }
  private get savedSceneSelection() { return this.model.savedSceneSelection; }
  private get name() { return this.model.name; }
  private get content() { return this.model.content; }
  private get paintBrushes() { return this.model.paintBrushes; }
  private get selectedPaintBrush() { return this.model.selectedPaintBrush; }
  private get brushUsesBackground() { return this.model.brushUsesBackground; }
  private get saving() { return this.model.saving; }
  private get saveNameDialogOpen() { return this.model.saveNameDialogOpen; }
  private get saveNameValue() { return this.model.saveNameValue; }
  private get saveNameError() { return this.model.saveNameError; }
  private get deleteCandidate() { return this.model.deleteCandidate; }
  private get deletingItemId() { return this.model.deletingItemId; }
  private get liveApplyEnabled() { return this.model.liveApplyEnabled; }
  private get previewStatus() { return this.model.previewStatus; }
  private get isAdmin() { return this.model.isAdmin; }
  private get modalOpen() { return this.modal.open; }
  private get selectedDevice() { return this.model.selectedDevice; }
  private get showDeviceSelector() { return this.model.showDeviceSelector; }
  private get editorReadOnly() { return this.model.editorReadOnly; }
  private get modelCatalogue() { return this.model.modelCatalogue; }
  private get videoAvailable() { return this.model.videoAvailable; }
  private get customEffectsAvailable() { return this.model.customEffectsAvailable; }
  private get customEffectListContext() { return this.model.customEffectListContext; }
  private get dirty() { return this.model.dirty; }
  private get deletingCurrentItem() { return this.model.deletingCurrentItem; }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.hass && !this.data.api) {
      void this.data.load(this.hass, this.hass.user?.is_admin === true);
    }
  }

  public disconnectedCallback(): void {
    this.modal.releaseScrollLock();
    super.disconnectedCallback();
    this.editor.beginTransition();
    this.data.disconnect();
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("hass") && this.hass && !this.data.api) {
      void this.data.load(this.hass, this.hass.user?.is_admin === true);
    }
    this.modal.syncScrollLock();
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
          this.navigation.categoryChanged(event.detail.category);
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
    this.editor.openVideoTemplate(mode, label);
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
          this.editor.videoContentChanged(
            event.detail.content,
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
          this.editor.musicContentChanged(
            event.detail.content,
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
    return this.model.libraryItemAvailable(item);
  }

  private customEffectKindAvailable(kind: string): boolean {
    return this.model.customEffectKindAvailable(kind);
  }

  private newCustomEffect(
    category: CustomEffectBrowserCategoryRequest["category"],
  ): void {
    this.editor.newCustomEffect(category);
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
                this.modal.saveNameChanged(
                  (event.target as HTMLInputElement).value,
                );
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
    this.editor.selectCustomEffectEntry(entry);
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
          this.editor.advancedContentChanged(
            event.detail.content,
            event.detail.interaction,
            this.currentScenePreviewRequest(),
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
                this.editor.toggleBackgroundBrush();
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
          this.editor.customContentChanged(
            event.detail.content,
            event.detail.interaction,
          );
        }}
      ></govee-custom-effect-editor>
    `;
  }

  private get showCustomEffectSelector(): boolean {
    return this.model.showCustomEffectSelector;
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

  private get selectedSingleEffectFamily() {
    return this.model.selectedSingleEffectFamily;
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

  private selectSection(section: StudioSection): void {
    void this.navigation.selectSection(section);
  }

  private deviceChanged = (event: Event): void => {
    void this.navigation.deviceChanged(
      (event.target as HTMLSelectElement).value,
    );
  };

  private sceneInitialSelectionOpened = (): void => {
    this.navigation.sceneInitialSelectionOpened();
  };

  private sceneInitialSelectionFailed = (): void => {
    this.navigation.sceneInitialSelectionFailed();
  };

  private sceneLibraryItemSaved(
    event: CustomEvent<{
      item: LibraryItem;
    }>,
  ): void {
    this.libraryController.sceneItemSaved(event.detail.item);
  }

  private sceneTemplateSelected(
    event: CustomEvent<{
      content: LayeredSceneContent;
      config_entry_id: string;
      item?: LibraryItem;
      name: string;
    }>,
  ): void {
    this.editor.openSceneEditor(event.detail);
  }

  private sceneLibraryItemDeleteRequested(
    event: CustomEvent<LibraryItemDeleteRequest>,
  ): void {
    const { returnFocus, ...candidate } = event.detail;
    this.requestDelete(candidate, returnFocus);
  }

  private cancelSceneEdit(): void {
    this.editor.cancelSceneEdit();
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
    this.modal.requestDelete(candidate, returnFocus);
  }

  private cancelDelete(): void {
    this.modal.cancelDelete();
  }

  private deleteDialogKeyDown(event: KeyboardEvent): void {
    this.modal.dialogKeyDown(event, () => this.cancelDelete());
  }

  private confirmDelete(): void {
    void this.libraryController.confirmDelete();
  }

  private selectItem(itemId: string): void {
    void this.libraryController.selectItem(itemId);
  }

  private nameChanged(event: Event): void {
    this.editor.nameChanged((event.target as HTMLInputElement).value);
  }

  private requestSave(event: Event): void {
    this.modal.requestSave(
      event.currentTarget as HTMLElement,
      () => void this.libraryController.save(),
    );
  }

  private cancelSaveName(): void {
    this.modal.cancelSaveName();
  }

  private saveNameDialogKeyDown(event: KeyboardEvent): void {
    this.modal.dialogKeyDown(event, () => this.cancelSaveName());
  }

  private confirmNamedSave(event: SubmitEvent): void {
    event.preventDefault();
    this.modal.confirmNamedSave(
      () => void this.libraryController.save(),
    );
  }

  private editTemplate(): void {
    this.editor.editTemplate();
  }

  private paintBrushesChanged(
    event: CustomEvent<{ palette: RGB[] }>,
  ): void {
    this.editor.paintBrushesChanged(event.detail.palette);
  }

  private paintBrushSelected(
    event: CustomEvent<{ index: number }>,
  ): void {
    this.editor.paintBrushSelected(event.detail.index);
  }

  private backgroundChanged(event: CustomEvent<{ colour: RGB }>): void {
    this.editor.backgroundChanged(
      event.detail.colour,
      event.type === "colour-changing" ? "changing" : "committed",
    );
  }

  private singleEffectChanged(event: Event): void {
    this.editor.selectSingleEffect(
      (event.target as HTMLSelectElement).value,
    );
  }

  private paintedEffectVariationChanged(event: Event): void {
    this.editor.paintedVariationChanged(
      (event.target as HTMLSelectElement).value as PaintedContent["effect"],
    );
  }

  private setSegmentColour(
    index: number,
    interaction: LivePreviewInteraction,
  ): void {
    this.editor.setSegmentColour(index, interaction);
  }

  private paintAll(): void {
    this.editor.paintAll();
  }

  private resetPaint(): void {
    this.editor.resetPaint();
  }

  private updateContent(
    update: { speed?: number; brightness?: number },
    interaction: LivePreviewInteraction = "changing",
  ): void {
    this.editor.updatePaintedContent(update, interaction);
  }

  private scenePreviewRequested(
    event: CustomEvent<ScenePreviewRequest>,
  ): void {
    this.preview.scheduleScene(event.detail);
  }

  private toggleLiveApply = (): void => {
    this.preview.toggle(this.currentScenePreviewRequest());
  };

  private currentScenePreviewRequest(): ScenePreviewRequest | undefined {
    return this.shadowRoot
      ?.querySelector<GoveeSceneBrowser>("govee-scene-browser")
      ?.currentPreviewRequest();
  }

  static styles = effectStudioPanelStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-govee-led-ble-editor": GoveeLedEffectStudio;
  }
}

if (!customElements.get("ha-govee-led-ble-editor")) {
  customElements.define("ha-govee-led-ble-editor", GoveeLedEffectStudio);
}
