import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  blankAdvancedContent,
  cloneAdvancedContent,
} from "./advanced-effect-editor";
import "./advanced-effect-editor";
import { EffectStudioApi } from "./api";
import "./custom-effect-editor";
import "./palette-editor";
import "./painted-segment-editor";
import "./scene-browser";
import type {
  AdvancedContent,
  CustomEffectCatalogue,
  CustomEffectContent,
  DeploymentRecord,
  DeviceCapabilities,
  EffectContent,
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

type StudioSection = "scenes" | "custom";
type AdvancedEditableContent = AdvancedContent | LayeredSceneContent;
type EditableEffectContent = CustomEffectContent | AdvancedEditableContent;
type NewEffectKind = CustomEffectContent["kind"] | AdvancedContent["kind"];
type DeleteCandidate = Pick<LibrarySummary, "id" | "revision" | "name">;
type CustomEffectCategory =
  | "all"
  | "single-layer"
  | "multi-layer"
  | "advanced";
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
        class="studio ${this.section === "scenes"
          ? "scenes-mode"
          : "custom-mode"}"
      >
        <nav class="primary-nav" aria-label="Create">
          ${this.navButton("scenes", "Scenes")}
          ${this.navButton("custom", "My Effects")}
          ${this.showDevicePicker ? this.renderDevicePicker() : nothing}
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
        ${this.section === "custom" ? this.renderCustomEffects() : nothing}
      </main>
      ${this.deleteCandidate ? this.renderDeleteConfirmation() : nothing}
    `;
  }

  private renderDevicePicker() {
    return html`
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
      <aside class="effect-categories" aria-label="Effect categories">
        ${this.customEffectCategoryButton("all", "All")}
        ${this.customEffectCategoryButton("single-layer", "Single Layer")}
        ${this.customEffectCategoryButton("multi-layer", "Multi Layer")}
        ${this.customEffectCategoryButton("advanced", "Advanced")}
      </aside>

      <aside class="library" aria-label="My effects">
        ${this.customEffectEntries.map((entry) =>
          this.customEffectListButton(entry),
        )}
      </aside>

      <section class="editor">
        ${this.name || this.currentItem
          ? isCustomEffectContent(this.content)
            ? this.content.kind === "h617a_painted"
              ? this.renderPaintedEditor()
              : this.renderPaletteEffectEditor()
            : isAdvancedEditableContent(this.content)
              ? this.renderAdvancedEditor()
              : this.content.kind === "opaque"
                ? this.renderOpaqueEditor(this.content)
                : nothing
          : nothing}
      </section>
    `;
  }

  private get customEffectEntries(): CustomEffectListEntry[] {
    const entries: CustomEffectListEntry[] = [
      {
        kind: "paint",
        key: "template:paint",
        label: "Paint",
        category: "single-layer",
      },
      ...(this.customCatalogue?.effects.map(
        (effect): CustomEffectListEntry => ({
          kind: "single",
          key: `template:single:${effect.family}:${effect.variant}`,
          label: effect.label,
          category: "single-layer",
          family: effect.family,
          variant: effect.variant,
        }),
      ) ?? []),
      {
        kind: "multi",
        key: "template:mix",
        label: "Mix",
        category: "multi-layer",
      },
      {
        kind: "advanced",
        key: "template:advanced",
        label: "Layered",
        category: "advanced",
      },
      ...this.library.items
        .filter((item) => isMyEffectKind(item.kind))
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
      .filter(
        (entry) =>
          this.customEffectCategory === "all" ||
          entry.category === this.customEffectCategory,
      )
      .sort((left, right) => compareLabels(left.label, right.label));
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
      <div class="library-row">
        <button
          class="selector item ${selected ? "selected" : ""}"
          type="button"
          ?disabled=${entry.kind !== "saved" && !this.isAdmin}
          @click=${() => this.selectCustomEffectEntry(entry)}
        >
          <span>${entry.label}</span>
        </button>
        ${entry.kind === "saved" && this.isAdmin
          ? html`
              <button
                class="library-delete"
                type="button"
                aria-label="Delete ${entry.label}"
                title="Delete ${entry.label}"
                ?disabled=${this.deletingItemId !== undefined ||
                this.saving ||
                this.applying}
                @click=${(event: Event) =>
                  this.requestDelete(
                    entry.item,
                    event.currentTarget as HTMLElement,
                  )}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            `
          : nothing}
      </div>
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
      this.newEffect("advanced");
      this.customTemplateSelection = entry.key;
      return;
    }
    if (!this.customCatalogue) {
      return;
    }
    if (entry.kind === "paint") {
      this.newEffect("h617a_painted", undefined, {
        name: "New Paint effect",
        content: blankPainted(),
        selectionIdentity: entry.key,
      });
      return;
    }
    if (entry.kind === "single") {
      const content = blankCustomEffect(
        "h617a_single",
        this.customCatalogue,
      );
      this.newEffect("h617a_single", undefined, {
        name: `New ${entry.label} effect`,
        content: {
          ...content,
          family: entry.family,
          variant: entry.variant,
        },
        selectionIdentity: entry.key,
      });
      return;
    }
    this.newEffect("h617a_multi", undefined, {
      name: "New Mix effect",
      content: blankCustomEffect("h617a_multi", this.customCatalogue),
      selectionIdentity: entry.key,
    });
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
            ?disabled=${!this.isAdmin ||
            !this.dirty ||
            this.saving ||
            this.deletingCurrentItem}
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
          ${this.renderEditorDeleteButton()}
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
          ${this.renderEditorDeleteButton()}
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

  private renderPaintedEditor() {
    if (this.content.kind !== "h617a_painted") {
      return nothing;
    }
    const selectedEffect = this.content.effect;
    const deployment = this.activeDeployment;
    return html`
      <div class="editor-heading">
        <div>
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
            ?disabled=${!this.isAdmin ||
            !this.dirty ||
            this.saving ||
            this.deletingCurrentItem}
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
          ${this.renderEditorDeleteButton()}
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

      <govee-painted-segment-editor
        .colours=${coloursForSegments(this.content)}
        .disabled=${!this.isAdmin}
        @segment-selected=${(
          event: CustomEvent<{ index: number }>,
        ) => this.setSegmentColour(event.detail.index)}
      ></govee-painted-segment-editor>

      <div class="controls">
        <section class="card">
          <h3>Brushes</h3>
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
          <h3>Effect</h3>
          <label class="field">
            <span>Effect</span>
            <select
              ?disabled=${!this.isAdmin}
              @change=${this.effectChanged}
            >
              ${this.customCatalogue?.painted_effects.map(
                (effect) => html`
                  <option
                    value=${effect.id}
                    ?selected=${effect.id === selectedEffect}
                  >
                    ${effect.label}
                  </option>
                `,
              )}
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
            ?disabled=${!this.isAdmin ||
            !this.dirty ||
            this.saving ||
            this.deletingCurrentItem}
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
          ${this.renderEditorDeleteButton()}
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
        .disabled=${!this.isAdmin}
        @content-changed=${(
          event: CustomEvent<{ content: CustomEffectContent }>,
        ) => {
          this.content = cloneCustomEffect(event.detail.content);
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
        ${this.customModeButton("h617a_painted", "Paint")}
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
    this.section = section;
    this.notice = undefined;
    if (section === "scenes") {
      return;
    }
    if (
      isCustomEffectContent(this.content) ||
      isAdvancedEditableContent(this.content) ||
      this.content.kind === "opaque"
    ) {
      return;
    }
    const item = this.library.items.find((candidate) =>
      isMyEffectKind(candidate.kind),
    );
    if (item) {
      await this.selectItem(item.id, transitionEpoch);
      return;
    }
    if (this.isAdmin) {
      this.newEffect("h617a_painted", transitionEpoch);
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

      const firstCustom = library.items.find((item) =>
        isCustomEffectKind(item.kind),
      );
      if (firstCustom) {
        await this.selectItem(firstCustom.id);
      } else if (this.isAdmin) {
        this.newEffect("h617a_painted");
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
    this.beginEditorTransition();
    this.selectedDeviceId = (event.target as HTMLSelectElement).value;
    this.activeOperationId = undefined;
    this.activeOperationId = this.latestDeployment([
      "pending",
      "uploading",
      "verifying",
      "interrupted",
    ])?.operation_id;
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
    this.customTemplateSelection =
      kind === "h617a_painted" ? "template:paint" : undefined;
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
      content: CustomEffectContent;
      selectionIdentity?: string;
    },
  ): void {
    const transitionEpoch =
      existingTransitionEpoch ?? this.beginEditorTransition();
    if (
      !this.api ||
      !this.isAdmin ||
      (kind !== "advanced" && !this.customCatalogue)
    ) {
      return;
    }
    this.currentItem = undefined;
    this.customEffectCategory = "all";
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
        : blankCustomEffect(kind, this.customCatalogue!));
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
        this.currentItem
      ) {
        return;
      }
      const input =
        this.shadowRoot?.querySelector<HTMLInputElement>(".editor .name-input");
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

    .eyebrow {
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
      margin-top: auto;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
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
      min-height: 100vh;
    }

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav,
    .effect-categories,
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

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    .effect-categories {
      overflow: auto;
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

    .library {
      overflow: auto;
      background: var(--primary-background-color);
    }

    .library-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .library-row > .selector {
      min-width: 0;
      flex: 1;
    }

    .library-delete {
      width: 44px;
      flex: 0 0 44px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: var(--studio-muted);
      background: transparent;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }

    .library-delete:hover,
    .library-delete:focus-visible {
      color: var(--error-color, #db4437);
      background: color-mix(
        in srgb,
        var(--error-color, #db4437) 10%,
        transparent
      );
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

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
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

    .danger {
      padding: 8px 17px;
      border: 1px solid var(--error-color, #db4437);
      border-radius: 9px;
      color: var(--error-color, #db4437);
      background: var(--studio-card);
      font-weight: 600;
      cursor: pointer;
    }

    .danger:hover,
    .danger:focus-visible {
      color: var(--text-primary-color, #fff);
      background: var(--error-color, #db4437);
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

    .card {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
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

    .background-colour {
      margin-top: 18px;
    }

    .background-colour label {
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

    @media (max-width: 900px) {
      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .studio.scenes-mode,
      .studio.custom-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .custom-mode .effect-categories,
      .custom-mode .library,
      .custom-mode .editor {
        grid-column: 2;
      }

      .effect-categories {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .effect-categories .selector {
        flex: 0 0 auto;
        width: auto;
        white-space: nowrap;
      }

      .library {
        max-height: 340px;
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
      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
    default:
      return "Custom";
  }
}

function compareLabels(left: string, right: string): number {
  return left.localeCompare(right, "en-AU", { sensitivity: "base" });
}

function isMyEffectKind(kind: string): boolean {
  return (
    isCustomEffectKind(kind) ||
    isAdvancedEditableKind(kind) ||
    !isKnownEffectKind(kind)
  );
}

function customEffectCategoryForKind(
  kind: string,
): Exclude<CustomEffectCategory, "all"> {
  if (kind === "h617a_multi") {
    return "multi-layer";
  }
  if (kind === "h617a_painted" || kind === "h617a_single") {
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
