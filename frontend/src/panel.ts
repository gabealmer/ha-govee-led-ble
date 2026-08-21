import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import "./advanced-effect-editor";
import "./colour-picker";
import { rememberRecentColour } from "./colour-picker";
import "./custom-effect-editor";
import type {
  CustomEffectBrowserCategoryRequest,
  CustomEffectBrowserEntryRequest,
} from "./custom-effect-browser";
import "./custom-effect-browser";
import {
  advancedEditorContent,
  effectOriginDescription,
  isAdvancedEditableContent,
  isCustomEffectContent,
} from "./effect-editor-model";
import { customEffectCategories } from "./custom-effect-workflow";
import type { LivePreviewInteraction } from "./live-preview-controller";
import "./music-profile-editor";
import "./palette-editor";
import "./painted-segment-editor";
import { PanelController } from "./panel-controller";
import { PanelEditorController } from "./panel-editor-controller";
import { PanelModalController } from "./panel-modal-controller";
import { PanelModel, type DeleteCandidate } from "./panel-model";
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
import {
  studioNavigationItems,
  type StudioNavigationItem,
} from "./studio-navigation";
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
import {
  compareLabels,
  integrationSettingsPath,
  lightControlEntityId,
  moreInfoDetail,
  showHomeAssistantHeader,
  showStudioToolbar,
} from "./ui-utils";

export class GoveeLedEffectStudio extends LitElement {
  @property({ attribute: false })
  public hass?: HomeAssistant;

  @property({ attribute: false })
  public panel?: PanelConfig;

  @property({ type: Boolean })
  public narrow = false;

  @state()
  private modelRevision = 0;

  private readonly model = new PanelModel(() => {
    this.modelRevision += 1;
  });
  private readonly preview = new PanelPreviewController(this.model);
  private readonly modal = new PanelModalController(this.model, {
    updateComplete: () => this.updateComplete,
    root: () => this.shadowRoot,
    canMutate: () => this.controller?.api !== undefined,
  });
  private readonly editor: PanelEditorController;
  private readonly controller: PanelController;

  public constructor() {
    super();
    this.editor = new PanelEditorController(
      this.model,
      this.preview,
      this.modal,
      {
        apiReady: () => this.controller?.api !== undefined,
        selectItem: (itemId) => void this.controller.selectItem(itemId),
        editorTransitionStarted: () =>
          this.controller?.cancelPendingAutoSave(),
        contentCommitted: (interaction) =>
          this.controller?.contentCommitted(interaction),
      },
    );
    this.controller = new PanelController(
      this.model,
      this.editor,
      this.preview,
      this.modal,
      {
        connected: () => this.isConnected,
        pathname: () => window.location.pathname,
        replacePath: (path) => {
          window.history.replaceState(window.history.state, "", path);
        },
      },
    );
  }

  private get section() { return this.model.section; }
  private get templateSourceLabel() { return this.model.templateSourceLabel; }
  private get currentItem() { return this.model.currentItem; }
  private get content() { return this.model.content; }
  private get isAdmin() { return this.hass?.user?.is_admin === true; }
  private get editorReadOnly() { return this.model.editorReadOnly; }

  public connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this.keyDown);
    this.model.syncAdmin(this.hass);
    if (this.hass && !this.controller.api) {
      void this.controller.load(this.hass, this.isAdmin);
    }
  }

  public disconnectedCallback(): void {
    this.removeEventListener("keydown", this.keyDown);
    this.modal.releaseScrollLock();
    super.disconnectedCallback();
    this.editor.beginTransition();
    this.controller.disconnect();
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("hass")) {
      this.model.syncAdmin(this.hass);
    }
    if (changed.has("hass") && this.hass && !this.controller.api) {
      void this.controller.load(this.hass, this.isAdmin);
    }
    this.modal.syncScrollLock();
    this.syncSingleEffectSelects();
  }

  protected render() {
    if (this.model.loading) {
      return html`
        ${this.renderHomeAssistantHeader()}
        <div class="centred" role="status">Loading effect studio...</div>
      `;
    }
    if (this.model.error) {
      return html`
        ${this.renderHomeAssistantHeader()}
        ${this.renderFatalError()}
      `;
    }

    return html`
      ${this.renderHomeAssistantHeader()}
      <h1 class="visually-hidden">Effect Studio</h1>

      ${this.renderStudioToolbar()}

      ${this.model.selectedDevice
        ? this.renderStudio()
        : this.renderMissingDevice()}
      ${this.model.saveNameDialogOpen ? this.renderSaveNameDialog() : nothing}
      ${this.model.deleteCandidate ? this.renderDeleteConfirmation() : nothing}
    `;
  }

  private renderHomeAssistantHeader() {
    if (
      !showHomeAssistantHeader(
        this.narrow,
        this.hass?.dockedSidebar,
        this.hass?.kioskMode,
      )
    ) {
      return nothing;
    }
    return html`
      <header class="home-assistant-header">
        <button
          class="home-assistant-menu"
          type="button"
          aria-label="Open Home Assistant navigation"
          @click=${this.toggleHomeAssistantMenu}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
          </svg>
        </button>
        <span>Govee Effect Studio</span>
      </header>
    `;
  }

  private toggleHomeAssistantMenu(): void {
    this.dispatchEvent(
      new CustomEvent("hass-toggle-menu", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderStudio() {
    return html`
      <main
        class="studio ${this.section}-mode"
        ?inert=${this.modal.open}
      >
        <nav class="primary-nav" aria-label="Create">
          ${studioNavigationItems(
            this.model.videoAvailable,
            this.model.customEffectsAvailable
              ? customEffectCategories(this.model.customEffectListContext)
              : [],
          ).map((item) => this.navButton(item))}
        </nav>

        <govee-scene-browser
          ?hidden=${this.section !== "scenes"}
          .externalEditActive=${this.model.sceneEditorOpen}
          .api=${this.controller.api}
          .device=${this.model.selectedDevice}
          .library=${this.model.library}
          .panelNotice=${this.model.notice}
          .previewStatus=${this.model.previewStatus}
          .isAdmin=${this.isAdmin}
          .autoSaveEnabled=${this.model.autoSaveEnabled}
          .savedSceneSelection=${this.model.savedSceneSelection}
          .initialSelection=${this.model.sceneInitialSelection}
          @library-item-saved=${this.sceneLibraryItemSaved}
          @library-item-delete-requested=${this.sceneLibraryItemDeleteRequested}
          @scene-edit-selected=${this.sceneTemplateSelected}
          @scene-preview-requested=${(
            event: CustomEvent<ScenePreviewRequest>,
          ) => this.preview.scheduleScene(event.detail)}
          @scene-external-edit-cancelled=${this.cancelSceneEdit}
          @scene-initial-selection-opened=${this.sceneInitialSelectionOpened}
          @scene-initial-selection-failed=${this.sceneInitialSelectionFailed}
        ></govee-scene-browser>
        ${this.section === "scenes" && this.model.sceneEditorOpen
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
    const linked = this.model.selectedDeviceId !== undefined;
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
    const device = this.model.selectedDevice;
    const liveApplyVisible = this.isAdmin && device !== undefined;
    const lightEntityId = lightControlEntityId(device);
    if (!showStudioToolbar(
      this.model.showDeviceSelector,
      liveApplyVisible,
      lightEntityId,
    )) {
      return nothing;
    }
    return html`
      <div class="studio-toolbar">
        ${this.renderDeviceSelector()}
        <div class="studio-toolbar-controls">
          ${liveApplyVisible ? this.renderLiveApplyControl() : nothing}
          ${liveApplyVisible ? this.renderAutoSaveControl() : nothing}
          ${device && lightEntityId
            ? this.renderLightControl(device.display_name, lightEntityId)
            : nothing}
          ${device && this.isAdmin
            ? this.renderIntegrationSettings(
                device.display_name,
                device.config_entry_id,
              )
            : nothing}
        </div>
      </div>
    `;
  }

  private renderLightControl(displayName: string, entityId: string) {
    return html`
      <button
        class="light-control-button"
        type="button"
        aria-label=${`Control ${displayName}`}
        title=${`Control ${displayName}`}
        @click=${() => this.showLightControls(entityId)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M20 15.31 23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69M12 18V6a6 6 0 0 1 0 12"
          ></path>
        </svg>
      </button>
    `;
  }

  private showLightControls(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: moreInfoDetail(entityId),
      }),
    );
  }

  private renderIntegrationSettings(
    displayName: string,
    configEntryId: string,
  ) {
    const configurationPath =
      this.panel?.config?.configuration_path ??
      "/config/integrations/integration/ha_govee_led_ble";
    return html`
      <a
        class="light-control-button"
        href=${integrationSettingsPath(configurationPath, configEntryId)}
        aria-label=${`Configure visible effects for ${displayName}`}
        title=${`Configure visible effects for ${displayName}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58-1.92-3.32-2.39.96a7.2 7.2 0 0 0-1.62-.94L14.87 3h-3.84l-.36 3.18c-.59.24-1.13.56-1.62.94l-2.39-.96-1.92 3.32 2.03 1.58c-.05.31-.08.64-.08.94s.03.63.08.94l-2.03 1.58 1.92 3.32 2.39-.96c.49.38 1.03.7 1.62.94l.36 3.18h3.84l.36-3.18c.59-.24 1.13-.56 1.62-.94l2.39.96 1.92-3.32-2.02-1.58M13 15.5A3.5 3.5 0 1 1 13 8a3.5 3.5 0 0 1 0 7.5"
          ></path>
        </svg>
      </a>
    `;
  }

  private renderDeviceSelector() {
    if (!this.model.showDeviceSelector) {
      return nothing;
    }
    const selectedUnavailable =
      this.model.selectedDeviceId !== undefined && this.model.selectedDevice === undefined;
    return html`
      <label class="device-selector">
        <select
          aria-label="Light"
          @change=${(event: Event) =>
            void this.controller.deviceChanged(
              (event.target as HTMLSelectElement).value,
            )}
        >
          ${selectedUnavailable
            ? html`
                <option
                  value=${this.model.selectedDeviceId!}
                  .selected=${true}
                >
                  Unavailable light
                </option>
              `
            : nothing}
          ${[...this.model.devices]
            .sort((left, right) =>
              compareLabels(left.display_name, right.display_name),
            )
            .map(
              (device) => html`
                <option
                  value=${device.config_entry_id}
                  .selected=${device.config_entry_id ===
                  this.model.selectedDeviceId}
                >
                  ${device.display_name} (${device.model})
                </option>
              `,
            )}
        </select>
      </label>
    `;
  }

  private renderLiveApplyControl() {
    const phase = this.model.previewStatus?.phase;
    const pending =
      this.model.previewProgressVisible &&
      (phase === "queued" || phase === "writing");
    const warning = phase === "failed";
    const status = pending
      ? "Applying changes"
      : warning
        ? "The latest change could not reach the light"
        : undefined;
    return html`
      <div class="live-apply-control">
        <button
          class="live-apply-toggle"
          type="button"
          role="switch"
          aria-label="Live"
          aria-checked=${this.model.liveApplyEnabled}
          @click=${() =>
            this.preview.toggle(this.currentScenePreviewRequest())}
        >
          <span class="live-apply-track" aria-hidden="true">
            <span class="live-apply-label">Live</span>
            <span class="live-apply-thumb"></span>
          </span>
        </button>
        <span
          class="live-apply-status ${pending
            ? "pending"
            : warning
              ? "warning"
              : "idle"}"
          title=${status ?? nothing}
          aria-hidden="true"
        ></span>
        ${status
          ? html`<span class="visually-hidden" role="status"
              >${status}</span
            >`
          : nothing}
      </div>
    `;
  }

  private renderAutoSaveControl() {
    return html`
      <button
        class="live-apply-toggle save-toggle"
        type="button"
        role="switch"
        aria-label="Save automatically"
        aria-checked=${this.model.autoSaveEnabled}
        title="Automatically save committed changes"
        @click=${() => this.controller.toggleAutoSave()}
      >
        <span class="live-apply-track" aria-hidden="true">
          <span class="live-apply-label save-label">
            <svg viewBox="0 0 24 24">
              <path d="M17 3H5a2 2 0 0 0-2 2v14h18V7l-4-4m-5 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6m3-8H5V5h10v4Z"></path>
            </svg>
            Save
          </span>
          <span class="live-apply-thumb"></span>
        </span>
      </button>
    `;
  }

  private renderFatalError() {
    return html`
      <main class="fatal">
        <h1>Effect Studio is unavailable</h1>
        <p role="alert">${this.model.error}</p>
        <p>Existing light controls are unaffected.</p>
        <a href=${this.panel?.config?.configuration_path ?? "/config/integrations"}>
          Open integration configuration
        </a>
      </main>
    `;
  }

  private navButton(item: StudioNavigationItem) {
    const selected =
      this.section === item.section &&
      (item.section !== "custom" ||
        item.category === this.model.customEffectCategory);
    return html`
      <button
        class="selector ${selected ? "selected" : ""}"
        type="button"
        aria-current=${selected ? "page" : nothing}
        @click=${() =>
          void this.controller.selectSection(item.section, item.category)}
      >
        ${item.label}
      </button>
    `;
  }

  private renderCustomEffects() {
    return html`
      <govee-custom-effect-browser
        .context=${this.model.customEffectListContext}
        .category=${this.model.customEffectCategory}
        .currentItemId=${this.currentItem?.id}
        .templateSelection=${this.model.customTemplateSelection}
        .isAdmin=${this.isAdmin}
        @custom-entry-requested=${(
          event: CustomEvent<CustomEffectBrowserEntryRequest>,
        ) => this.editor.selectCustomEffectEntry(event.detail.entry)}
        @custom-new-requested=${(
          event: CustomEvent<CustomEffectBrowserCategoryRequest>,
        ) => this.editor.newCustomEffect(event.detail.category)}
      ></govee-custom-effect-browser>

      <section class="editor-surface editor">
        ${this.renderPanelNotice()}
        ${this.model.name || this.currentItem
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
    const catalogue = this.model.modelCatalogue;
    if (!catalogue || !this.model.videoAvailable) {
      return nothing;
    }
    const saved = this.model.library.items
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
            () => this.editor.openVideoTemplate(mode.id, mode.label),
          ),
        )}
        ${saved.map((item) =>
          this.videoListButton(
            `saved:${item.id}`,
            item.name,
            () => void this.controller.selectItem(item.id),
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
      : !this.currentItem && this.model.customTemplateSelection === key;
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

  private renderVideoProfileEditor() {
    if (this.content.kind !== "video_profile") {
      return nothing;
    }
    return html`
      ${this.renderProfileHeading()}
      <govee-video-profile-editor
        .content=${this.content}
        .disabled=${this.editorReadOnly}
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
        .catalogue=${this.model.modelCatalogue}
        .disabled=${this.editorReadOnly}
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

  private renderPanelNotice() {
    return this.model.notice
      ? html`<p class="action-error" role="alert">${this.model.notice}</p>`
      : nothing;
  }


  private renderDeleteConfirmation() {
    const candidate = this.model.deleteCandidate!;
    const discardsOpenEdits =
      candidate.discardsOpenEdits === true ||
      (this.currentItem?.id === candidate.id && this.model.dirty);
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
              @click=${() => void this.controller.confirmDelete()}
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
          @submit=${(event: SubmitEvent) => {
            event.preventDefault();
            this.modal.confirmNamedSave(
              (name, mode) =>
                void (mode === "copy"
                  ? this.controller.saveAs(name)
                  : this.controller.save()),
            );
          }}
        >
          <h2 id="save-effect-title">
            ${this.model.saveNameMode === "copy"
              ? "Save Effect As"
              : "New Custom Effect"}
          </h2>
          <label class="field">
            <span>Name</span>
            <input
              aria-label="Name"
              aria-describedby=${this.model.saveNameError
                ? "save-effect-name-error"
                : nothing}
              maxlength="128"
              autocomplete="off"
              .value=${this.model.saveNameValue}
              @input=${(event: Event) => {
                this.modal.saveNameChanged(
                  (event.target as HTMLInputElement).value,
                );
              }}
            />
          </label>
          ${this.model.saveNameError
            ? html`
                <p id="save-effect-name-error" class="dialog-error" role="alert">
                  ${this.model.saveNameError}
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
            <button class="primary" type="submit">
              ${this.model.saveNameMode === "copy" ? "Save As" : "Save"}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private renderAdvancedEditor() {
    if (!isAdvancedEditableContent(this.content)) {
      return nothing;
    }
    return html`
      ${this.renderEditorHeading()}

      <govee-advanced-effect-editor
        .content=${advancedEditorContent(this.content)}
        .disabled=${!this.isAdmin}
        .segmentCount=${this.model.selectedDevice?.segment_count ?? 15}
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
        title: html`<div class="mobile-redundant-heading">
          <h2>${this.model.name}</h2>
        </div>`,
      })}
      <p class="read-only-copy">
        This effect definition can be inspected, but this editor cannot change,
        save or preview it.
      </p>
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

      ${this.renderSingleEffectSelector()}

      <govee-painted-segment-editor
        .segments=${this.content.segments}
        .disabled=${this.editorReadOnly}
        @segment-selected=${(
          event: CustomEvent<{
            index: number;
            interaction: LivePreviewInteraction;
          }>,
        ) => {
          const changed = this.editor.setSegmentColour(
            event.detail.index,
            event.detail.interaction,
          );
          if (changed && !this.model.paintBrushOff) {
            rememberRecentColour(this.model.paintColour);
          }
        }}
      ></govee-painted-segment-editor>

      <div class="controls">
        <section class="card">
          <h3 class="section-title">Paint colour</h3>
          <govee-colour-picker
            .colour=${this.model.paintColour}
            .disabled=${this.editorReadOnly}
            .selectionActive=${!this.model.paintBrushOff}
            .rememberOnCommit=${false}
            @colour-changing=${(event: CustomEvent<{ colour: RGB }>) =>
              this.editor.paintColourChanged(event.detail.colour)}
            @colour-changed=${(event: CustomEvent<{ colour: RGB }>) =>
              this.editor.paintColourChanged(event.detail.colour)}
          ></govee-colour-picker>
          <div class="paint-actions">
            <button
              class="paint-off ${this.model.paintBrushOff ? "active" : ""}"
              type="button"
              ?disabled=${this.editorReadOnly}
              aria-pressed=${this.model.paintBrushOff}
              @click=${() => this.editor.selectPaintOff()}
            >
              <span class="paint-off-swatch" aria-hidden="true"></span>
              Off
            </button>
            <button
              class="secondary"
              type="button"
              ?disabled=${this.editorReadOnly}
              @click=${() => this.editor.resetPaint()}
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



      ${this.renderSingleEffectSelector()}

      <govee-custom-effect-editor
        .content=${content}
        .catalogue=${this.model.modelCatalogue}
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

  private renderSingleEffectSelector() {
    if (
      !this.model.customCatalogue ||
      !this.model.showSingleEffectSelector ||
      (this.content.kind !== "h617a_painted" &&
        this.content.kind !== "h617a_single" &&
        this.content.kind !== "palette_diy")
    ) {
      return nothing;
    }
    const family = this.selectedSingleEffectFamily;
    const effectFamilies =
      this.currentItem?.content.kind === "h617a_painted"
        ? []
        : this.model.modelCatalogue?.effects.filter(
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
            ?disabled=${!this.isAdmin}
            @change=${(event: Event) =>
              this.editor.selectSingleEffect(
                (event.target as HTMLSelectElement).value,
              )}
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
    if (!this.model.customCatalogue || this.content.kind !== "h617a_painted") {
      return nothing;
    }
    const content = this.content;
    const variations = this.model.customCatalogue.painted_effects;
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
          @change=${(event: Event) =>
            this.editor.updatePaintedContent(
              {
                effect: (event.target as HTMLSelectElement)
                  .value as PaintedContent["effect"],
              },
              "committed",
            )}
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
      this.model.dirty && !this.templateSourceLabel
        ? html`<span class="dirty-marker" aria-label="Unsaved changes">*</span>`
        : nothing;
    if (this.templateSourceLabel) {
      return html`
        <div class="editor-title mobile-redundant-heading">
          <h2>${this.templateSourceLabel}</h2>
          ${origin ? html`<small class="origin-name">${origin}</small>` : nothing}
        </div>
      `;
    }
    if (!this.currentItem) {
      const title =
        this.model.customCopyStarted && this.model.name.trim()
          ? this.model.name
          : "New effect";
      return html`
        <div class="editor-title mobile-redundant-heading">
          <div class="editable-title"><h2>${title}</h2>${marker}</div>
          ${origin ? html`<small class="origin-name">${origin}</small>` : nothing}
        </div>
      `;
    }
    return html`
      <div class="editor-title mobile-editable-heading">
        <span class="mobile-name-label">Name</span>
        <div class="editable-title">
          <input
            class="editor-name"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.model.name}
            ?disabled=${!this.isAdmin}
            @input=${(event: Event) =>
              this.model.patch({
                name: (event.target as HTMLInputElement).value,
              })}
            @change=${() =>
              this.controller.contentCommitted("committed")}
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
        <div class="editor-heading-title">
          ${options.title ?? this.renderEffectName()}
        </div>
        <div class="actions">
          ${this.model.sceneEditorOpen || this.model.editorCancelAvailable
            ? html`
                <button
                  class="secondary"
                  type="button"
                  ?disabled=${this.model.saving}
                  @click=${this.model.sceneEditorOpen
                    ? this.cancelSceneEdit
                    : this.cancelCreation}
                >
                  Cancel
                </button>
              `
            : nothing}
          ${options.save === false ? nothing : this.renderSaveAction()}
          ${options.save === false ? nothing : this.renderSaveAsAction()}
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
          this.model.saving ||
          this.model.deletingCurrentItem}
          @click=${() => this.editor.prepareTemplateEdit()}
        >
          Edit
        </button>
      `;
    }
    if (
      this.currentItem &&
      this.model.autoSaveEnabled &&
      !this.model.autoSaveFailed &&
      !this.model.sceneEditorOpen
    ) {
      return nothing;
    }
    const saveLabel =
      !this.currentItem && this.model.customCopyStarted
        ? "Save As"
        : "Save";
    return html`
      <button
        class="primary"
        type="button"
        ?disabled=${!this.isAdmin ||
        !this.model.canSaveCurrentDraft ||
        this.model.saving ||
        this.model.deletingCurrentItem}
        @click=${(event: Event) =>
          this.modal.requestSave(
            event.currentTarget as HTMLElement,
            () => void this.controller.save(),
          )}
      >
        ${this.model.saving ? "Saving..." : saveLabel}
      </button>
    `;
  }

  private renderSaveAsAction() {
    if (!this.currentItem && !this.templateSourceLabel) {
      return nothing;
    }
    const sourceName = this.model.name.trim() || this.templateSourceLabel || "Effect";
    return html`
      <button
        class="primary"
        type="button"
        ?disabled=${!this.isAdmin ||
        this.model.saving ||
        this.model.deletingCurrentItem}
        @click=${(event: Event) =>
          this.modal.requestSaveAs(
            event.currentTarget as HTMLElement,
            `${sourceName} copy`,
          )}
      >
        Save As
      </button>
    `;
  }

  private keyDown = (event: KeyboardEvent): void => {
    if (
      event.defaultPrevented ||
      event.repeat ||
      event.isComposing ||
      event.key.toLocaleLowerCase() !== "s" ||
      (!event.ctrlKey && !event.metaKey) ||
      this.modal.open
    ) {
      return;
    }
    if (event.shiftKey) {
      if (this.section === "scenes" && !this.model.sceneEditorOpen) {
        return;
      }
      if (
        !this.currentItem &&
        !this.templateSourceLabel &&
        !this.model.customCopyStarted
      ) {
        return;
      }
      event.preventDefault();
      const sourceName =
        this.model.name.trim() || this.templateSourceLabel || "Effect";
      this.modal.requestSaveAs(this, `${sourceName} copy`);
      return;
    }
    if (this.section === "scenes") {
      if (this.model.sceneEditorOpen) {
        if (
          !this.model.canSaveCurrentDraft ||
          this.model.saving ||
          this.model.deletingCurrentItem
        ) {
          return;
        }
        event.preventDefault();
        this.controller.cancelPendingAutoSave();
        this.modal.requestSave(this, () => void this.controller.save());
        return;
      }
      const sceneBrowser =
        this.shadowRoot?.querySelector<GoveeSceneBrowser>(
          "govee-scene-browser",
        );
      if (sceneBrowser?.invokeSaveShortcut()) {
        event.preventDefault();
      }
      return;
    }
    if (
      this.templateSourceLabel ||
      !this.model.canSaveCurrentDraft ||
      this.model.saving ||
      this.model.deletingCurrentItem
    ) {
      return;
    }
    event.preventDefault();
    this.controller.cancelPendingAutoSave();
    this.modal.requestSave(this, () => void this.controller.save());
  };

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
  ) {
    return html`
      <govee-slider-control
        .label=${label}
        .value=${value}
        .minimum=${0}
        .maximum=${100}
        .disabled=${this.editorReadOnly}
        @value-changed=${(event: CustomEvent<SliderControlChange>) =>
          this.editor.updatePaintedContent(
            { [key]: event.detail.value },
            event.detail.interaction,
          )}
      ></govee-slider-control>
    `;
  }

  private sceneInitialSelectionOpened = (): void => {
    this.controller.sceneInitialSelectionOpened();
  };

  private sceneInitialSelectionFailed = (): void => {
    this.controller.sceneInitialSelectionFailed();
  };

  private sceneLibraryItemSaved(
    event: CustomEvent<{
      item: LibraryItem;
    }>,
  ): void {
    this.controller.sceneItemSaved(event.detail.item);
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

  private cancelCreation(): void {
    this.editor.cancelCreation();
  }

  private renderEditorDeleteButton() {
    if (!this.isAdmin || !this.currentItem) {
      return nothing;
    }
    return html`
      <button
        class="danger"
        type="button"
        ?disabled=${this.model.deletingItemId !== undefined ||
        this.model.saving}
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
        ${this.model.deletingCurrentItem ? "Deleting..." : "Delete"}
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

  private cancelSaveName(): void {
    this.modal.cancelSaveName();
  }

  private saveNameDialogKeyDown(event: KeyboardEvent): void {
    this.modal.dialogKeyDown(event, () => this.cancelSaveName());
  }

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
