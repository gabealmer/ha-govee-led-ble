import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  blankAdvancedContent,
  cloneAdvancedContent,
} from "./advanced-effect-editor";
import "./advanced-effect-editor";
import { EffectStudioApi } from "./api";
import "./custom-effect-editor";
import "./effect-preview";
import { paintedPreviewModel } from "./preview-model";
import "./scene-browser";
import type {
  AdvancedContent,
  CustomEffectCatalogue,
  CustomEffectContent,
  DeploymentRecord,
  DeviceCapabilities,
  EffectContent,
  EffectDraft,
  HomeAssistant,
  LayeredSceneContent,
  LibraryItem,
  LibrarySummary,
  LibrarySnapshot,
  OpaqueContent,
  PaintedContent,
  PanelConfig,
  RGB,
} from "./types";
import { isCompatibleEditorInfo } from "./validation";

type StudioSection = "scenes" | "custom" | "advanced";
type AdvancedEditableContent = AdvancedContent | LayeredSceneContent;
type EditableEffectContent = CustomEffectContent | AdvancedEditableContent;
type NewEffectKind = CustomEffectContent["kind"] | AdvancedContent["kind"];

const SEGMENT_COUNT = 15;

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

  @state()
  private section: StudioSection = "custom";

  @state()
  private library: LibrarySnapshot = {
    library_revision: 0,
    items: [],
  };

  @state()
  private customCatalogue?: CustomEffectCatalogue;

  @state()
  private drafts: EffectDraft[] = [];

  @state()
  private currentItem?: LibraryItem;

  @state()
  private currentDraft?: EffectDraft;

  @state()
  private name = "";

  @state()
  private content: EffectContent = blankPainted();

  @state()
  private foreground = "#2f80ed";

  @state()
  private brushUsesBackground = false;

  @state()
  private saving = false;

  @state()
  private applying = false;

  @state()
  private deployments: DeploymentRecord[] = [];

  @state()
  private activeOperationId?: string;

  private api?: EffectStudioApi;
  private savedBaseline?: string;
  private draftTimer?: number;
  private draftSaveInFlight?: Promise<boolean>;
  private draftPersistPending = false;
  private editorTransitionEpoch = 0;
  private sceneTemplateHandoffInFlight = false;
  private unsubscribeLibrary?: () => void;
  private unsubscribeDeployments?: () => void;
  private loadEpoch = 0;
  private deploymentRevision = -1;

  private get isAdmin(): boolean {
    return this.hass?.user?.is_admin === true;
  }

  private get selectedDevice(): DeviceCapabilities | undefined {
    return this.devices.find(
      (device) => device.config_entry_id === this.selectedDeviceId,
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
      this.name.trim().length > 0 &&
      this.applyCapability === "supported"
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

  private get customDrafts(): EffectDraft[] {
    return this.drafts.filter(
      (draft) => isCustomEffectKind(draft.item.content.kind),
    );
  }

  private get advancedDrafts(): EffectDraft[] {
    return this.drafts.filter(
      (draft) => isAdvancedEditableKind(draft.item.content.kind),
    );
  }

  private get editableDrafts(): EffectDraft[] {
    return this.drafts.filter(
      (draft) => isEditableEffectContent(draft.item.content),
    );
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
    if (this.draftTimer !== undefined) {
      window.clearTimeout(this.draftTimer);
      this.draftTimer = undefined;
      void this.persistDraft();
    }
    this.stopSubscriptions();
    this.api = undefined;
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("hass") && this.hass && !this.api) {
      void this.load();
    }
  }

  protected render() {
    if (this.loading) {
      return html`<div class="centred" role="status">Loading effect studio...</div>`;
    }
    if (this.error) {
      return this.renderFatalError();
    }

    return html`
      <header class="topbar">
        <div>
          <p class="eyebrow">Govee LED BLE</p>
          <h1>Effect Studio</h1>
        </div>
        <label class="device-picker">
          <span>Device</span>
          <select
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
        </label>
      </header>

      ${this.notice
        ? html`<div class="notice" role="status">${this.notice}</div>`
        : nothing}

      <main class="studio ${this.section === "scenes" ? "scenes-mode" : ""}">
        <nav class="primary-nav" aria-label="Create">
          <p class="nav-heading">Create</p>
          ${this.navButton("scenes", "Scenes")}
          ${this.navButton("custom", "Custom Effects")}
          ${this.navButton("advanced", "Advanced")}
          <div class="device-summary">
            ${this.selectedDevice
              ? html`
                  <strong>${this.selectedDevice.display_name}</strong>
                  <span>
                    ${this.selectedDevice.segment_count} segments /
                    ${this.selectedDevice.model}
                  </span>
                `
              : html`<span>No loaded devices</span>`}
          </div>
        </nav>

        <govee-scene-browser
          ?hidden=${this.section !== "scenes"}
          .api=${this.api}
          .device=${this.selectedDevice}
          .library=${this.library}
          .isAdmin=${this.isAdmin}
          @library-item-saved=${this.sceneLibraryItemSaved}
          @scene-template-selected=${this.sceneTemplateSelected}
        ></govee-scene-browser>
        ${this.section === "custom"
          ? this.renderCustomEffects()
          : this.section === "advanced"
            ? this.renderAdvancedEffects()
            : nothing}
      </main>
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
      <aside class="library" aria-label="Custom effects">
        <div class="library-heading">
          <div>
            <p class="eyebrow">Library</p>
            <h2>Custom effects</h2>
          </div>
          ${this.isAdmin
            ? html`
                <button
                  class="new-kind"
                  type="button"
                  @click=${() => this.resumeOrCreateEffect("custom")}
                >
                  New effect
                </button>
              `
            : nothing}
        </div>

        ${this.renderLibraryGroup("h617a_painted", "Painted")}
        ${this.renderLibraryGroup("h617a_single", "Single")}
        ${this.renderLibraryGroup("h617a_multi", "Multi")}

        ${!this.library.items.some((item) => isCustomEffectKind(item.kind)) &&
        !this.customDrafts.length
          ? html`
              <p class="empty">
                ${this.isAdmin
                  ? "Create your first custom effect."
                  : "No custom effects have been saved yet."}
              </p>
            `
          : nothing}
      </aside>

      <section class="editor">
        ${this.name || this.currentItem || this.currentDraft
          ? isCustomEffectContent(this.content)
            ? this.content.kind === "h617a_painted"
              ? this.renderPaintedEditor()
              : this.renderPaletteEffectEditor()
            : this.renderEmptyEditor(
                "Select a custom effect",
                "Choose a saved effect to inspect it.",
              )
          : html`
              <div class="empty-editor">
                <h2>Select a custom effect</h2>
                <p>Choose a saved effect to inspect it.</p>
              </div>
            `}
      </section>
    `;
  }

  private renderAdvancedEffects() {
    const advancedItems = this.library.items.filter(
      (item) => isAdvancedEditableKind(item.kind),
    );
    const opaqueItems = this.library.items.filter(
      (item) => !isKnownEffectKind(item.kind),
    );
    return html`
      <aside class="library" aria-label="Advanced effects">
        <div class="library-heading">
          <div>
            <p class="eyebrow">Library</p>
            <h2>Advanced effects</h2>
          </div>
          ${this.isAdmin
            ? html`
                <button
                  class="new-kind"
                  type="button"
                  @click=${() => this.resumeOrCreateEffect("advanced")}
                >
                  New layered effect
                </button>
              `
            : nothing}
        </div>

        ${advancedItems.length
          ? html`
              <p class="list-label">Layered</p>
              ${advancedItems.map(
                (item) => html`
                  <button
                    class="selector item ${this.currentItem?.id === item.id &&
                    !this.currentDraft
                      ? "selected"
                      : ""}"
                    type="button"
                    @click=${() => this.selectItem(item.id)}
                  >
                    <span>${item.name}</span>
                    <small>${advancedKindLabel(item.kind)}</small>
                  </button>
                `,
              )}
            `
          : nothing}

        ${opaqueItems.length
          ? html`
              <p class="list-label">Other</p>
              ${opaqueItems.map(
                (item) => html`
                  <button
                    class="selector item ${this.currentItem?.id === item.id &&
                    !this.currentDraft
                      ? "selected"
                      : ""}"
                    type="button"
                    @click=${() => this.selectItem(item.id)}
                  >
                    <span>${item.name}</span>
                    <small>${item.kind}</small>
                  </button>
                `,
              )}
            `
          : nothing}

        ${!advancedItems.length &&
        !this.advancedDrafts.length &&
        !opaqueItems.length &&
        !this.currentDraft
          ? html`
              <p class="empty">
                ${this.isAdmin
                  ? "Create your first layered effect."
                  : "No layered effects have been saved yet."}
              </p>
            `
          : nothing}
      </aside>

      <section class="editor">
        ${this.name || this.currentItem || this.currentDraft
          ? isAdvancedEditableContent(this.content)
            ? this.renderAdvancedEditor()
            : this.content.kind === "opaque"
              ? this.renderOpaqueEditor(this.content)
              : this.renderEmptyEditor(
                  "Select an advanced effect",
                  "Choose a saved layered effect to inspect it.",
                )
          : this.renderEmptyEditor(
              "Select an advanced effect",
              "Choose a saved layered effect to inspect it.",
            )}
      </section>
    `;
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
      <div class="editor-heading">
        <div>
          <p class="eyebrow">
            Advanced / ${layeredScene ? "Scene template" : "Layered"}
          </p>
          <input
            class="name-input"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin || !this.dirty || this.saving}
            @click=${this.save}
          >
            ${this.saving ? "Saving..." : "Save"}
          </button>
          <button
            class="secondary"
            type="button"
            disabled
            aria-describedby="advanced-apply-reason"
          >
            Apply
          </button>
        </div>
      </div>

      ${!this.isAdmin
        ? html`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or save them.
            </div>
          `
        : nothing}

      <div id="advanced-apply-reason" class="apply-reason" role="note">
        Layered effects can be saved, but Apply is unavailable because there
        is no confirmed compiler or deployment path.
      </div>

      ${layeredScene
        ? html`
            <div class="source-note" role="note">
              Source parameter bytes remain immutable provenance. Layer edits
              are saved separately and may diverge from those bytes.
            </div>
          `
        : nothing}

      <govee-advanced-effect-editor
        .content=${advancedEditorContent(this.content)}
        .disabled=${!this.isAdmin}
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
          this.scheduleDraft();
        }}
      ></govee-advanced-effect-editor>
    `;
  }

  private renderOpaqueEditor(content: OpaqueContent) {
    return html`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">Other / Unsupported definition</p>
          <h2>${this.name}</h2>
        </div>
        <div class="actions">
          <button class="secondary" type="button" disabled>Apply</button>
        </div>
      </div>
      <div class="read-only" role="note">
        This effect definition can be inspected, but this editor cannot change,
        save or apply it.
      </div>
      <section class="card opaque-content">
        <h3>Source kind</h3>
        <p><code>${content.source_kind}</code></p>
        <h3>Preserved content</h3>
        <pre aria-label="Preserved opaque content">${JSON.stringify(
          content.body,
          null,
          2,
        )}</pre>
      </section>
    `;
  }

  private renderEmptyEditor(title: string, body: string) {
    return html`
      <div class="empty-editor">
        <h2>${title}</h2>
        <p>${body}</p>
      </div>
    `;
  }

  private renderLibraryGroup(
    kind: CustomEffectContent["kind"],
    label: string,
  ) {
    const items = this.library.items.filter((item) => item.kind === kind);
    if (!items.length) {
      return nothing;
    }
    return html`
      <p class="list-label">${label}</p>
      ${items.map(
        (item) => html`
          <button
            class="selector item ${this.currentItem?.id === item.id &&
            !this.currentDraft
              ? "selected"
              : ""}"
            type="button"
            @click=${() => this.selectItem(item.id)}
          >
            <span>${item.name}</span>
            <small>${label}</small>
          </button>
        `,
      )}
    `;
  }

  private renderPaintedEditor() {
    if (this.content.kind !== "h617a_painted") {
      return nothing;
    }
    const deployment = this.activeDeployment;
    return html`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">Custom Effects / Painted</p>
          <input
            class="name-input"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin || !this.dirty || this.saving}
            @click=${this.save}
          >
            ${this.saving ? "Saving..." : "Save"}
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>

      ${this.renderCustomModeTabs()}

      ${!this.isAdmin
        ? html`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit or apply them.
            </div>
          `
        : nothing}

      <govee-effect-preview
        class="painted-preview"
        .model=${paintedPreviewModel(this.content)}
        .interactive=${true}
        .disabled=${!this.isAdmin}
        @preview-cell-selected=${(
          event: CustomEvent<{ index: number }>,
        ) => this.setSegmentColour(event.detail.index)}
      ></govee-effect-preview>

      <div class="controls">
        <section class="card">
          <h3>Colours</h3>
          <div class="colour-row">
            <label>
              <span>Brush</span>
              <input
                type="color"
                .value=${this.foreground}
                ?disabled=${!this.isAdmin}
                @input=${this.foregroundChanged}
              />
            </label>
            <label>
              <span>Background</span>
              <input
                type="color"
                .value=${rgbToHex(this.content.background)}
                ?disabled=${!this.isAdmin}
                @input=${this.backgroundChanged}
              />
            </label>
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
          <h3>Movement</h3>
          <label class="field">
            <span>Direction</span>
            <select
              .value=${this.content.effect}
              ?disabled=${!this.isAdmin}
              @change=${this.effectChanged}
            >
              <option value="clockwise">Clockwise</option>
              <option value="counter_clockwise">Counterclockwise</option>
            </select>
          </label>
          ${this.rangeField("Speed", "speed", this.content.speed)}
          ${this.rangeField(
            "Brightness",
            "brightness",
            this.content.brightness,
          )}
        </section>
      </div>

      ${deployment ? this.renderDeployment(deployment) : nothing}
    `;
  }

  private renderPaletteEffectEditor() {
    if (
      this.content.kind !== "h617a_single" &&
      this.content.kind !== "h617a_multi"
    ) {
      return nothing;
    }
    const content = this.content;
    const deployment = this.activeDeployment;
    return html`
      <div class="editor-heading">
        <div>
          <p class="eyebrow">
            Custom Effects / ${customKindLabel(content.kind)}
          </p>
          <input
            class="name-input"
            aria-label="Effect name"
            maxlength="128"
            .value=${this.name}
            ?disabled=${!this.isAdmin}
            @input=${this.nameChanged}
          />
        </div>
        <div class="actions">
          <button
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin || !this.dirty || this.saving}
            @click=${this.save}
          >
            ${this.saving ? "Saving..." : "Save"}
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.canApply}
            @click=${this.apply}
          >
            ${this.applying ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>

      ${this.renderCustomModeTabs()}

      ${!this.isAdmin
        ? html`
            <div class="read-only" role="note">
              You can inspect shared effects. An administrator is required to
              edit them.
            </div>
          `
        : nothing}

      <govee-custom-effect-editor
        .content=${content}
        .catalogue=${this.customCatalogue}
        .segmentCount=${this.selectedDevice?.segment_count ?? 15}
        .disabled=${!this.isAdmin}
        @content-changed=${(
          event: CustomEvent<{ content: CustomEffectContent }>,
        ) => {
          this.content = cloneCustomEffect(event.detail.content);
          this.scheduleDraft();
        }}
      ></govee-custom-effect-editor>

      ${deployment ? this.renderDeployment(deployment) : nothing}
    `;
  }

  private rangeField(
    label: string,
    key: "speed" | "brightness",
    value: number,
  ) {
    return html`
      <label class="range-field">
        <span>${label}</span>
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

  private renderCustomModeTabs() {
    if (!isCustomEffectContent(this.content)) {
      return nothing;
    }
    return html`
      <div class="custom-mode-tabs" role="tablist" aria-label="Custom effect type">
        ${this.customModeButton("h617a_painted", "Painted")}
        ${this.customModeButton("h617a_single", "Single")}
        ${this.customModeButton("h617a_multi", "Multi")}
      </div>
    `;
  }

  private customModeButton(
    kind: CustomEffectContent["kind"],
    label: string,
  ) {
    const selected =
      isCustomEffectContent(this.content) && this.content.kind === kind;
    const wouldDiscardSequence =
      kind === "h617a_single" &&
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
        @click=${() => this.switchCustomMode(kind)}
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
        class="deployment ${deployment.phase}"
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
    const flushed = await this.flushDraft();
    if (
      !flushed ||
      !this.editorTransitionIsCurrent(transitionEpoch)
    ) {
      return;
    }
    this.section = section;
    this.notice = undefined;
    if (section === "scenes") {
      return;
    }
    if (
      (section === "custom" && isCustomEffectContent(this.content)) ||
      (section === "advanced" &&
        (isAdvancedEditableContent(this.content) ||
          this.content.kind === "opaque"))
    ) {
      return;
    }
    const drafts =
      section === "advanced" ? this.advancedDrafts : this.customDrafts;
    const recovery = this.newestRecoveryForDevice(drafts);
    if (recovery) {
      const selected = await this.selectDraft(
        recovery,
        transitionEpoch,
      );
      if (
        selected &&
        this.editorTransitionIsCurrent(transitionEpoch)
      ) {
        this.notice = "Recovered an unfinished draft.";
      }
      return;
    }
    const item = this.library.items.find((candidate) =>
      section === "advanced"
        ? isAdvancedEditableKind(candidate.kind)
        : isCustomEffectKind(candidate.kind),
    );
    if (item) {
      await this.selectItem(item.id, transitionEpoch);
      return;
    }
    if (this.isAdmin) {
      await this.newEffect(
        section === "advanced" ? "advanced" : "h617a_painted",
        transitionEpoch,
      );
    } else {
      this.currentItem = undefined;
      this.currentDraft = undefined;
      this.name = "";
    }
  }

  private async resumeOrCreateEffect(
    section: "custom" | "advanced",
  ): Promise<void> {
    const drafts =
      section === "advanced" ? this.advancedDrafts : this.customDrafts;
    const recovery = this.newestRecoveryForDevice(drafts);
    if (recovery) {
      const selected = await this.selectDraft(recovery);
      if (selected) {
        this.section = section;
        this.notice = "Recovered an unfinished draft.";
      }
      return;
    }
    await this.newEffect(
      section === "advanced" ? "advanced" : "h617a_painted",
    );
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

      if (this.isAdmin) {
        const summaries = await api.drafts();
        this.drafts = await Promise.all(
          summaries.map((summary) => api.draft(summary.id)),
        );
        if (!this.loadIsCurrent(loadEpoch, api)) {
          return;
        }
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

      const recovery = this.newestRecoveryForDevice();
      const firstCustom = library.items.find((item) =>
        isCustomEffectKind(item.kind),
      );
      if (recovery) {
        const selected = await this.selectDraft(recovery);
        if (selected) {
          this.section = isCustomEffectContent(recovery.item.content)
            ? "custom"
            : "advanced";
          this.notice = "Recovered an unfinished draft.";
        }
      } else if (firstCustom) {
        await this.selectItem(firstCustom.id);
      } else if (this.isAdmin) {
        await this.newEffect("h617a_painted");
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

  private newestRecoveryForDevice(
    drafts: EffectDraft[] = this.editableDrafts,
  ): EffectDraft | undefined {
    return [...drafts]
      .filter(
        (draft) =>
          (!draft.selected_config_entry_id ||
            draft.selected_config_entry_id === this.selectedDeviceId),
      )
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at))[0];
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
      this.notice = "This effect was removed from the shared library.";
      return;
    }
    if (summary.revision === this.currentItem.revision) {
      return;
    }
    if (this.dirty) {
      this.notice =
        "This effect changed elsewhere. Reload it before saving your draft.";
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

  private async sceneTemplateSelected(
    event: CustomEvent<{
      content: LayeredSceneContent;
      config_entry_id: string;
      name: string;
    }>,
  ): Promise<void> {
    if (
      !this.api ||
      !this.isAdmin ||
      event.detail.config_entry_id !== this.selectedDeviceId ||
      this.sceneTemplateHandoffInFlight
    ) {
      return;
    }
    const api = this.api;
    const transitionEpoch = this.beginEditorTransition();
    this.sceneTemplateHandoffInFlight = true;
    try {
      const flushed = await this.flushDraft();
      if (
        !flushed ||
        !this.editorTransitionIsCurrent(transitionEpoch)
      ) {
        return;
      }
      const content = cloneLayeredSceneContent(event.detail.content);
      const name = event.detail.name.trim() || "Layered scene template";
      const draft = await api.createDraft(
        name,
        content,
        this.selectedDeviceId ?? null,
      );
      if (!this.editorTransitionIsCurrent(transitionEpoch)) {
        await this.discardStaleDraft(api, draft);
        return;
      }
      this.currentItem = undefined;
      this.currentDraft = draft;
      this.name = draft.item.name;
      if (!isAdvancedEditableContent(draft.item.content)) {
        throw new Error("The scene template draft returned an unsupported definition.");
      }
      this.content = cloneEditableEffect(draft.item.content);
      this.savedBaseline = undefined;
      this.draftPersistPending = false;
      this.drafts = replaceDraft(this.drafts, draft);
      this.section = "advanced";
      this.notice = "Scene template opened as a recovery draft.";
    } catch (error) {
      if (this.editorTransitionIsCurrent(transitionEpoch)) {
        this.notice = `The scene template draft could not be created: ${errorMessage(error)}`;
      }
    } finally {
      this.sceneTemplateHandoffInFlight = false;
    }
  }

  private async backToScenes(): Promise<void> {
    const transitionEpoch = this.beginEditorTransition();
    const flushed = await this.flushDraft();
    if (!flushed || !this.editorTransitionIsCurrent(transitionEpoch)) {
      return;
    }
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

  private async discardStaleDraft(
    api: EffectStudioApi,
    draft: EffectDraft,
  ): Promise<void> {
    try {
      await api.deleteDraft(draft);
    } catch (error) {
      console.warn("A stale recovery draft could not be removed.", error);
    }
  }

  private deviceChanged(event: Event): void {
    this.beginEditorTransition();
    this.selectedDeviceId = (event.target as HTMLSelectElement).value;
    this.activeOperationId = undefined;
    this.activeOperationId = this.latestDeployment([
      "pending",
      "uploading",
      "verifying",
      "interrupted",
    ])?.operation_id;
    this.scheduleDraft();
    this.notice = this.applyAvailabilityNotice();
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
          ? hexToRgb(this.foreground)
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
      this.foreground = rgbToHex(colour);
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
    if (/^New (Painted|Single|Multi) effect$/.test(this.name)) {
      this.name = `New ${customKindLabel(kind)} effect`;
    }
    this.scheduleDraft();
    this.notice = this.applyAvailabilityNotice();
  }

  private async newEffect(
    kind: NewEffectKind,
    existingTransitionEpoch?: number,
  ): Promise<void> {
    const transitionEpoch =
      existingTransitionEpoch ?? this.beginEditorTransition();
    if (
      !this.api ||
      !this.isAdmin ||
      (kind !== "advanced" && !this.customCatalogue)
    ) {
      return;
    }
    const api = this.api;
    const flushed = await this.flushDraft();
    if (
      !flushed ||
      !this.editorTransitionIsCurrent(transitionEpoch)
    ) {
      return;
    }
    this.currentItem = undefined;
    this.currentDraft = undefined;
    this.name = `New ${customKindLabel(kind)} effect`;
    this.content =
      kind === "advanced"
        ? blankAdvancedContent()
        : blankCustomEffect(kind, this.customCatalogue!);
    this.savedBaseline =
      kind === "advanced"
        ? serialiseEditable(this.name, this.content)
        : undefined;
    this.draftPersistPending = false;
    this.notice = this.applyAvailabilityNotice();
    try {
      const draft = await api.createDraft(
        this.name,
        this.content,
        this.selectedDeviceId ?? null,
      );
      if (!this.editorTransitionIsCurrent(transitionEpoch)) {
        await this.discardStaleDraft(api, draft);
        return;
      }
      this.currentDraft = draft;
      this.drafts = replaceDraft(this.drafts, draft);
    } catch (error) {
      if (this.editorTransitionIsCurrent(transitionEpoch)) {
        this.notice = `The recovery draft could not be created: ${errorMessage(error)}`;
      }
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
    const api = this.api;
    const flushed = await this.flushDraft();
    if (
      !flushed ||
      !this.editorTransitionIsCurrent(transitionEpoch)
    ) {
      return false;
    }
    try {
      const item = await api.item(itemId);
      if (!this.editorTransitionIsCurrent(transitionEpoch)) {
        return false;
      }
      const recoveryCandidate = this.drafts.find(
        (draft) => draft.base_item_id === item.id,
      );
      if (item.content.kind === "opaque") {
        const recovery =
          recoveryCandidate?.item.content.kind === "opaque"
            ? recoveryCandidate
            : undefined;
        const recoveryContent = recovery?.item.content;
        const selectedContent =
          recoveryContent?.kind === "opaque"
            ? recoveryContent
            : item.content;
        this.currentItem = item;
        this.currentDraft = recovery;
        this.name = recovery?.item.name ?? item.name;
        this.content = cloneOpaqueContent(selectedContent);
        this.savedBaseline = undefined;
        this.draftPersistPending = false;
        this.notice =
          "This effect definition is preserved, but this editor cannot change or apply it.";
        return true;
      }
      if (!isEditableEffectContent(item.content)) {
        this.notice = "This item cannot be edited here.";
        return false;
      }
      const recovery =
        recoveryCandidate &&
        isEditableEffectContent(recoveryCandidate.item.content)
          ? recoveryCandidate
          : undefined;
      const selectedContent = recovery?.item.content ?? item.content;
      if (!isEditableEffectContent(selectedContent)) {
        return false;
      }
      this.currentItem = item;
      this.currentDraft = recovery;
      this.name = recovery?.item.name ?? item.name;
      this.content = cloneEditableEffect(selectedContent);
      this.savedBaseline = serialiseEditable(
        item.name,
        item.content,
      );
      this.draftPersistPending = false;
      this.notice = recovery
        ? "Recovered an unfinished draft."
        : this.applyAvailabilityNotice();
      return true;
    } catch (error) {
      if (this.editorTransitionIsCurrent(transitionEpoch)) {
        this.notice = errorMessage(error);
      }
      return false;
    }
  }

  private async selectDraft(
    draft: EffectDraft,
    existingTransitionEpoch?: number,
  ): Promise<boolean> {
    const transitionEpoch =
      existingTransitionEpoch ?? this.beginEditorTransition();
    if (!this.api) {
      return false;
    }
    const api = this.api;
    if (this.currentDraft?.id === draft.id) {
      return (
        (await this.flushDraft()) &&
        this.editorTransitionIsCurrent(transitionEpoch)
      );
    }
    const flushed = await this.flushDraft();
    if (
      !flushed ||
      !this.editorTransitionIsCurrent(transitionEpoch)
    ) {
      return false;
    }
    draft = this.drafts.find((item) => item.id === draft.id) ?? draft;
    if (draft.item.content.kind === "opaque") {
      let baseItem: LibraryItem | undefined;
      if (draft.base_item_id) {
        try {
          const candidate = await api.item(draft.base_item_id);
          if (!this.editorTransitionIsCurrent(transitionEpoch)) {
            return false;
          }
          if (candidate.content.kind === "opaque") {
            baseItem = candidate;
          }
        } catch {
          if (!this.editorTransitionIsCurrent(transitionEpoch)) {
            return false;
          }
          this.notice =
            "The saved effect behind this draft is no longer available.";
        }
      }
      this.currentItem = baseItem;
      this.currentDraft = draft;
      this.name = draft.item.name;
      this.content = cloneOpaqueContent(draft.item.content);
      this.savedBaseline = undefined;
      this.draftPersistPending = false;
      this.notice =
        "This effect definition is preserved, but this editor cannot change or apply it.";
      return true;
    }
    if (!isEditableEffectContent(draft.item.content)) {
      this.notice = "This draft cannot be edited here.";
      return false;
    }
    let baseItem: LibraryItem | undefined;
    if (draft.base_item_id) {
      try {
        baseItem = await api.item(draft.base_item_id);
        if (!this.editorTransitionIsCurrent(transitionEpoch)) {
          return false;
        }
      } catch {
        if (!this.editorTransitionIsCurrent(transitionEpoch)) {
          return false;
        }
        this.notice =
          "The saved effect behind this draft is no longer available.";
      }
    }
    this.currentItem = baseItem;
    this.currentDraft = draft;
    this.name = draft.item.name;
    this.content = cloneEditableEffect(draft.item.content);
    this.savedBaseline = baseItem
      && isEditableEffectContent(baseItem.content)
      ? serialiseEditable(baseItem.name, baseItem.content)
      : undefined;
    this.draftPersistPending = false;
    if (!this.notice) {
      this.notice = this.applyAvailabilityNotice();
    }
    return true;
  }

  private nameChanged(event: Event): void {
    this.name = (event.target as HTMLInputElement).value;
    this.scheduleDraft();
  }

  private foregroundChanged(event: Event): void {
    this.foreground = (event.target as HTMLInputElement).value;
    this.brushUsesBackground = false;
  }

  private backgroundChanged(event: Event): void {
    this.updateContent({
      background: hexToRgb((event.target as HTMLInputElement).value),
    });
  }

  private effectChanged(event: Event): void {
    this.updateContent({
      effect: (event.target as HTMLSelectElement)
        .value as PaintedContent["effect"],
    });
  }

  private setSegmentColour(index: number): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    const colours = coloursForSegments(this.content);
    colours[index] = this.brushUsesBackground
      ? [...this.content.background]
      : hexToRgb(this.foreground);
    this.content = {
      ...this.content,
      groups: groupsFromColours(colours, this.content.background),
    };
    this.scheduleDraft();
  }

  private paintAll(): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    const colour = this.brushUsesBackground
      ? this.content.background
      : hexToRgb(this.foreground);
    this.content = {
      ...this.content,
      groups: groupsFromColours(
        Array.from({ length: SEGMENT_COUNT }, () => [...colour] as RGB),
        this.content.background,
      ),
    };
    this.scheduleDraft();
  }

  private resetPaint(): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.content = {
      ...this.content,
      groups: [],
    };
    this.scheduleDraft();
  }

  private updateContent(update: Partial<PaintedContent>): void {
    if (this.content.kind !== "h617a_painted") {
      return;
    }
    this.content = {
      ...this.content,
      ...update,
    };
    this.scheduleDraft();
  }

  private scheduleDraft(): void {
    if (!this.isAdmin || !this.api) {
      return;
    }
    this.draftPersistPending = true;
    if (this.draftTimer !== undefined) {
      window.clearTimeout(this.draftTimer);
    }
    this.draftTimer = window.setTimeout(() => {
      this.draftTimer = undefined;
      void this.persistDraft();
    }, 700);
  }

  private async flushDraft(): Promise<boolean> {
    if (this.draftTimer !== undefined) {
      window.clearTimeout(this.draftTimer);
      this.draftTimer = undefined;
    }
    if (!this.draftPersistPending && !this.draftSaveInFlight) {
      return true;
    }
    return this.persistDraft();
  }

  private async persistDraft(): Promise<boolean> {
    let previousSaveSucceeded = true;
    if (this.draftSaveInFlight) {
      previousSaveSucceeded = await this.draftSaveInFlight;
    }
    if (!this.draftPersistPending) {
      return previousSaveSucceeded;
    }
    if (!this.api || !this.isAdmin) {
      return false;
    }
    if (
      !this.dirty ||
      !this.name.trim() ||
      !isEditableEffectContent(this.content)
    ) {
      this.draftPersistPending = false;
      return true;
    }
    const content = this.content;
    const snapshot = serialiseDraft(
      this.name,
      content,
      this.selectedDeviceId,
    );
    this.draftPersistPending = false;
    const save = this.persistDraftNow();
    this.draftSaveInFlight = save;
    let saveSucceeded: boolean;
    try {
      saveSucceeded = await save;
    } finally {
      if (this.draftSaveInFlight === save) {
        this.draftSaveInFlight = undefined;
      }
    }
    if (!saveSucceeded) {
      this.draftPersistPending = true;
    }
    const contentChanged =
      isEditableEffectContent(this.content) &&
      snapshot !== serialiseDraft(
        this.name,
        this.content,
        this.selectedDeviceId,
      );
    if (contentChanged) {
      this.scheduleDraft();
    }
    return saveSucceeded;
  }

  private async persistDraftNow(): Promise<boolean> {
    if (!this.api || !isEditableEffectContent(this.content)) {
      return false;
    }
    const api = this.api;
    const originatingDraft = this.currentDraft;
    const originatingItem = this.currentItem;
    const name = this.name.trim();
    const content = this.content;
    const selectedDeviceId = this.selectedDeviceId ?? null;
    const snapshot = serialiseDraft(
      name,
      content,
      selectedDeviceId ?? undefined,
    );
    try {
      const draft = originatingDraft
        ? await api.updateDraft(
            originatingDraft,
            name,
            content,
            selectedDeviceId,
          )
        : await api.createDraft(
            name,
            content,
            selectedDeviceId,
            originatingItem,
          );
      if (!this.draftIdentityIsCurrent(api, originatingDraft, originatingItem)) {
        return true;
      }
      this.currentDraft = draft;
      this.drafts = replaceDraft(this.drafts, draft);
      return true;
    } catch (error) {
      if (
        errorCode(error) === "conflict" &&
        originatingDraft &&
        this.draftContextIsCurrent(
          api,
          originatingDraft,
          originatingItem,
          snapshot,
        )
      ) {
        try {
          const fork = await api.createDraft(
            name,
            content,
            selectedDeviceId,
            originatingItem,
          );
          if (
            this.draftContextIsCurrent(
              api,
              originatingDraft,
              originatingItem,
              snapshot,
            )
          ) {
            this.currentDraft = fork;
            this.drafts = replaceDraft(this.drafts, fork);
            this.notice =
              "This draft changed elsewhere, so your work was saved as a separate recovery draft.";
          }
          return true;
        } catch (forkError) {
          error = forkError;
        }
      }
      this.notice = `The recovery draft could not be saved: ${errorMessage(error)}`;
      return false;
    }
  }

  private draftIdentityIsCurrent(
    api: EffectStudioApi,
    draft: EffectDraft | undefined,
    item: LibraryItem | undefined,
  ): boolean {
    return (
      this.api === api &&
      sameDraftRevision(this.currentDraft, draft) &&
      sameLibraryItemRevision(this.currentItem, item) &&
      isEditableEffectContent(this.content)
    );
  }

  private draftContextIsCurrent(
    api: EffectStudioApi,
    draft: EffectDraft | undefined,
    item: LibraryItem | undefined,
    snapshot: string,
  ): boolean {
    return (
      this.draftIdentityIsCurrent(api, draft, item) &&
      isEditableEffectContent(this.content) &&
      serialiseDraft(
        this.name.trim(),
        this.content,
        this.selectedDeviceId,
      ) === snapshot
    );
  }

  private async save(): Promise<void> {
    if (
      !this.api ||
      !this.isAdmin ||
      !this.dirty ||
      this.saving ||
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
    const originatingDraft = this.currentDraft;
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
        this.name = result.item.name;
        this.content = cloneEditableEffect(savedContent);
        this.savedBaseline = serialiseEditable(this.name, this.content);
        this.draftPersistPending = false;
      }
      const savedResultIsCurrent = () =>
        this.editorTransitionIsCurrent(transitionEpoch) &&
        sameLibraryItemRevision(this.currentItem, result.item) &&
        isEditableEffectContent(this.content) &&
        serialiseEditable(this.name, this.content) ===
          serialiseEditable(result.item.name, savedContent);
      if (originatingDraft) {
        try {
          await api.deleteDraft(originatingDraft);
          this.drafts = this.drafts.filter(
            (draft) => !sameDraftRevision(draft, originatingDraft),
          );
          if (
            this.editorTransitionIsCurrent(transitionEpoch) &&
            sameDraftRevision(this.currentDraft, originatingDraft)
          ) {
            this.currentDraft = undefined;
          }
        } catch (error) {
          if (savedResultIsCurrent()) {
            this.notice =
              `Saved ${name}, but its recovery draft could not be cleared: ` +
              errorMessage(error);
          }
          return;
        }
      }
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
    return this.applyCapability === "supported"
      ? undefined
      : `${customKindLabel(this.content.kind)} effects cannot be applied to this device.`;
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

  static styles = css`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      --studio-blue: var(--primary-color, #03a9f4);
      --studio-blue-soft: color-mix(
        in srgb,
        var(--studio-blue) 13%,
        transparent
      );
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
      --studio-muted: var(--secondary-text-color, #68707c);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input,
    select {
      font: inherit;
    }

    button {
      min-height: 44px;
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

    .topbar {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      padding: 22px 28px;
      border-bottom: 1px solid var(--studio-border);
      background: var(--app-header-background-color, var(--studio-card));
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

    .eyebrow,
    .nav-heading,
    .list-label {
      margin-bottom: 6px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .device-picker {
      display: grid;
      gap: 6px;
      min-width: 240px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 600;
    }

    select,
    .name-input {
      min-height: 42px;
      padding: 8px 12px;
      color: var(--primary-text-color);
      border: 1px solid var(--studio-border);
      border-radius: 9px;
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
      min-height: calc(100vh - 90px);
    }

    .studio.scenes-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav,
    .library {
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .selector {
      width: 100%;
      min-height: 44px;
      padding: 9px 11px;
      border: 0;
      border-radius: 8px;
      color: var(--primary-text-color);
      background: transparent;
      text-align: start;
      cursor: pointer;
    }

    .selector:hover {
      background: color-mix(
        in srgb,
        var(--primary-text-color) 6%,
        transparent
      );
    }

    .selector.selected {
      color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .device-summary {
      display: grid;
      gap: 4px;
      margin-top: auto;
      padding: 14px 10px 2px;
      color: var(--studio-muted);
      font-size: 12px;
    }

    .device-summary strong {
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .library {
      overflow: auto;
      background: var(--primary-background-color);
    }

    .library-heading {
      display: grid;
      gap: 12px;
      margin-bottom: 22px;
    }

    .new-kind {
      min-height: 44px;
      padding: 8px 4px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      color: var(--studio-blue);
      background: var(--studio-card);
      font-size: 12px;
      font-weight: 650;
      cursor: pointer;
    }

    .library-heading > .new-kind {
      width: 100%;
    }

    .icon-button {
      width: 40px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--studio-blue);
      background: var(--studio-card);
      font-size: 24px;
      cursor: pointer;
    }

    .list-label {
      margin: 20px 10px 6px;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .item small {
      color: var(--studio-muted);
      font-size: 11px;
      font-weight: 500;
    }

    .empty {
      padding: 12px 10px;
      color: var(--studio-muted);
      line-height: 1.5;
    }

    .editor {
      min-width: 0;
      padding: 28px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .editor-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
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

    .name-input {
      width: min(460px, 100%);
      padding-inline: 0;
      border-width: 0 0 1px;
      border-radius: 0;
      background: transparent;
      font-size: 24px;
      font-weight: 600;
    }

    .actions,
    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    .actions > button {
      min-height: 44px;
    }

    .primary,
    .secondary {
      padding: 8px 17px;
      border-radius: 9px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary {
      border: 1px solid var(--studio-blue);
      color: var(--text-primary-color, #fff);
      background: var(--studio-blue);
    }

    .secondary {
      border: 1px solid var(--studio-border);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .secondary.active {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
    }

    button:disabled,
    input:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .read-only,
    .apply-reason,
    .source-note,
    .deployment {
      margin-bottom: 18px;
      padding: 12px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      line-height: 1.45;
    }

    .apply-reason {
      color: var(--primary-text-color);
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 35%,
        var(--studio-border)
      );
      background: var(--studio-blue-soft);
    }

    .source-note {
      color: var(--studio-muted);
    }

    .card,
    .placeholder,
    .empty-editor {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .painted-preview {
      display: block;
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .card {
      padding: 20px;
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

    .colour-row {
      display: flex;
      gap: 20px;
      margin-bottom: 18px;
    }

    .colour-row label {
      display: grid;
      gap: 7px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    input[type="color"] {
      width: 72px;
      height: 44px;
      padding: 3px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: var(--studio-card);
    }

    .field,
    .range-field {
      display: grid;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .range-field {
      grid-template-columns: 80px minmax(100px, 1fr) 44px;
    }

    .range-field output {
      color: var(--primary-text-color);
      text-align: end;
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

    .placeholder,
    .empty-editor {
      grid-column: 2 / -1;
      align-self: start;
      max-width: 720px;
      margin: 28px;
      padding: 28px;
      line-height: 1.55;
    }

    .placeholder p:last-child,
    .empty-editor p {
      margin: 12px 0 0;
      color: var(--studio-muted);
    }

    @media (max-width: 900px) {
      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .studio.scenes-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .library {
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .editor {
        grid-column: 2;
      }

      .controls {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .topbar {
        align-items: stretch;
        flex-direction: column;
      }

      .device-picker {
        min-width: 0;
      }

      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 10px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .nav-heading,
      .device-summary {
        display: none;
      }

      .selector {
        text-align: center;
      }

      .library {
        padding-block: 18px;
      }

      .library .selector {
        text-align: start;
      }

      .editor {
        padding: 20px 16px 32px;
      }

      .editor-heading {
        align-items: stretch;
        flex-direction: column;
      }

      .actions > button {
        flex: 1;
      }

      .placeholder,
      .empty-editor {
        margin: 18px 16px;
      }
    }

    @media (max-width: 480px) {
      .topbar {
        padding: 18px 16px;
      }

      .notice {
        padding-inline: 16px;
      }

      .colour-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
  `;
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
  catalogue: CustomEffectCatalogue,
): PaintedContent;
function blankCustomEffect(
  kind: "h617a_single",
  catalogue: CustomEffectCatalogue,
): Extract<CustomEffectContent, { kind: "h617a_single" }>;
function blankCustomEffect(
  kind: "h617a_multi",
  catalogue: CustomEffectCatalogue,
): Extract<CustomEffectContent, { kind: "h617a_multi" }>;
function blankCustomEffect(
  kind: CustomEffectContent["kind"],
  catalogue: CustomEffectCatalogue,
): CustomEffectContent;
function blankCustomEffect(
  kind: CustomEffectContent["kind"],
  catalogue: CustomEffectCatalogue,
): CustomEffectContent {
  if (kind === "h617a_painted") {
    return blankPainted();
  }
  const first = catalogue.effects[0];
  const pair = {
    family: first.family,
    variant: first.variant,
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

function cloneEditableEffect(
  content: EditableEffectContent,
): EditableEffectContent {
  if (content.kind === "advanced") {
    return cloneAdvancedContent(content);
  }
  if (content.kind === "scene_layered") {
    return cloneLayeredSceneContent(content);
  }
  return cloneCustomEffect(content);
}

function cloneOpaqueContent(content: OpaqueContent): OpaqueContent {
  return {
    ...content,
    body: structuredClone(content.body),
  };
}

function cloneLayeredSceneContent(
  content: LayeredSceneContent,
): LayeredSceneContent {
  return {
    ...content,
    template: { ...content.template },
    effect: {
      layers: cloneAdvancedContent({
        kind: "advanced",
        layers: content.effect.layers,
      }).layers,
    },
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

function rgbToHex(colour: RGB): string {
  return `#${colour
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToRgb(value: string): RGB {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
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

function serialiseDraft(
  name: string,
  content: EditableEffectContent,
  selectedDeviceId: string | undefined,
): string {
  return JSON.stringify({
    name: name.trim(),
    content,
    selectedDeviceId: selectedDeviceId ?? null,
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
      isAdvancedEditableKind(content.kind))
  );
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
    kind === "scene_builtin" ||
    kind === "scene_palette"
  );
}

function advancedKindLabel(kind: unknown): string {
  return kind === "scene_layered" ? "Scene template" : "Layered";
}

function customKindLabel(kind: unknown): string {
  switch (kind) {
    case "h617a_painted":
      return "Painted";
    case "h617a_single":
      return "Single";
    case "h617a_multi":
      return "Multi";
    case "advanced":
      return "Layered";
    default:
      return "Custom";
  }
}

function replaceDraft(drafts: EffectDraft[], next: EffectDraft): EffectDraft[] {
  return [
    next,
    ...drafts.filter((draft) => draft.id !== next.id),
  ].sort((left, right) => right.updated_at.localeCompare(left.updated_at));
}

function sameLibraryItemRevision(
  left: LibraryItem | undefined,
  right: LibraryItem | undefined,
): boolean {
  return left?.id === right?.id && left?.revision === right?.revision;
}

function sameDraftRevision(
  left: EffectDraft | undefined,
  right: EffectDraft | undefined,
): boolean {
  return left?.id === right?.id && left?.revision === right?.revision;
}

function upsertSummary(
  summaries: LibrarySnapshot["items"],
  item: LibraryItem,
): LibrarySnapshot["items"] {
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
      ...("template" in item.content
        ? { template: item.content.template as LibrarySummary["template"] }
        : {}),
    },
  ].sort((left, right) => left.name.localeCompare(right.name));
}

function errorMessage(error: unknown): string {
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

function errorCode(error: unknown): string | undefined {
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

declare global {
  interface HTMLElementTagNameMap {
    "ha-govee-led-ble-editor": GoveeLedEffectStudio;
  }
}

if (!customElements.get("ha-govee-led-ble-editor")) {
  customElements.define("ha-govee-led-ble-editor", GoveeLedEffectStudio);
}
