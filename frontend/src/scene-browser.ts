import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import type { EffectStudioApi } from "./api";
import { effectOriginDescription } from "./effect-editor-model";
import type { SegmentedControlChange } from "./segmented-control";
import "./segmented-control";
import {
  previewMayChangeSceneDefault,
  sceneBrowserCategories,
  sceneBrowserEntries,
  sceneKey,
  sceneSelectionKey,
  sceneSpeedOptions,
  type CategorySelection,
  type SceneBrowserViewState,
  type SceneContent,
  type SceneInitialSelection,
  type ScenePreviewRequest,
} from "./scene-browser-model";
import { SceneBrowserWorkflow, type SceneEditSelection } from "./scene-browser-workflow";
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
  DeviceCapabilities,
  LibraryItem,
  LibrarySnapshot,
  PaletteSceneContent,
  PreviewStatus,
  SceneSummary,
} from "./types";
import { rgbToHex } from "./ui-utils";

export type { SceneInitialSelection, ScenePreviewRequest } from "./scene-browser-model";

export interface LibraryItemDeleteRequest {
  id: string;
  version: number;
  updated_at: string;
  name: string;
  discardsOpenEdits: boolean;
  returnFocus: HTMLElement;
}

export class GoveeSceneBrowser extends LitElement {
  @property({ attribute: false })
  public api?: EffectStudioApi;

  @property({ attribute: false })
  public device?: DeviceCapabilities;

  @property({ attribute: false })
  public library: LibrarySnapshot = { items: [] };

  @property({ type: Boolean })
  public isAdmin = false;

  @property({ attribute: false })
  public savedSceneSelection?: LibraryItem;

  @property({ attribute: false })
  public initialSelection?: SceneInitialSelection;

  @property({ type: Boolean })
  public externalEditActive = false;

  @property()
  public panelNotice?: string;

  @property({ attribute: false })
  public previewStatus?: PreviewStatus;

  @state()
  private viewState: SceneBrowserViewState;

  @state()
  private search = "";

  private readonly workflow: SceneBrowserWorkflow;

  public constructor() {
    super();
    this.workflow = new SceneBrowserWorkflow({
      changed: (viewState) => {
        this.viewState = viewState;
      },
      initialSelectionFinished: (opened) => {
        this.emit(opened ? "scene-initial-selection-opened" : "scene-initial-selection-failed");
      },
      libraryItemSaved: (item) => {
        this.emit("library-item-saved", { item });
      },
    });
    this.viewState = this.workflow.state;
  }

  public currentPreviewRequest(): ScenePreviewRequest | undefined {
    return this.workflow.previewRequest(this.isAdmin);
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("device") || changed.has("api")) {
      this.workflow.configure(this.api, this.device);
      this.search = "";
    }
    if (changed.has("initialSelection")) {
      this.workflow.setInitialSelection(this.initialSelection);
    }
    if (changed.has("savedSceneSelection") && this.savedSceneSelection) {
      this.workflow.synchroniseSavedSelection(this.savedSceneSelection);
    }
    if (changed.has("library")) {
      this.workflow.setLibrary(this.library);
    }
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if ((changed.has("device") || changed.has("api")) && this.api && this.device) {
      void this.workflow.loadCatalogue();
    }
    if (changed.has("initialSelection") && this.viewState.catalogue && this.initialSelection) {
      void this.workflow.openInitialSelection();
    }
    if (
      changed.has("previewStatus") &&
      previewMayChangeSceneDefault(this.previewStatus, this.device?.config_entry_id)
    ) {
      void this.workflow.refreshSelectedDefault();
    }
  }

  protected render() {
    const state = this.viewState;
    if (!this.device) {
      return html`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `;
    }
    if (state.loading) {
      return html`<div class="status" role="status">Loading scenes...</div>`;
    }
    if (state.error || !state.catalogue) {
      return html`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${state.error ?? "The scene catalogue could not be loaded."}</p>
        </section>
      `;
    }
    return html`
      <aside class="sidebar category-sidebar categories" aria-label="Scene categories">
        ${this.sortedCategories.map((category) => this.categoryButton(category.id, category.label))}
      </aside>

      <aside class="sidebar item-sidebar scenes" aria-label="Scenes">
        <label class="scene-search">
          <span class="visually-hidden">Search scenes</span>
          <input
            type="search"
            aria-label="Search scenes"
            placeholder="Search scenes"
            .value=${this.search}
            @input=${(event: Event) => {
              this.search = (event.target as HTMLInputElement).value;
            }}
          />
        </label>
        ${this.filteredSceneEntries.map((entry) =>
          entry.kind === "custom"
            ? this.sceneButton(`custom:${entry.item.id}`, entry.label, () => this.selectCustom(entry.item, true))
            : this.sceneButton(sceneKey(entry.scene), entry.label, () => this.selectBuiltin(entry.scene, true)),
        )}
      </aside>

      ${this.externalEditActive
        ? nothing
        : html`
            <section class="editor-surface detail">
              ${this.panelNotice ? html`<div class="feedback" role="status">${this.panelNotice}</div>` : nothing}
              ${state.notice ? html`<div class="feedback notice" role="status">${state.notice}</div>` : nothing}
              ${state.selectedScene && state.content ? this.renderDetail() : nothing}
            </section>
          `}
    `;
  }

  private get sortedCategories(): { id: CategorySelection; label: string }[] {
    return sceneBrowserCategories(this.viewState.catalogue, this.workflow.compatibleCustomScenes);
  }

  private get filteredSceneEntries() {
    return sceneBrowserEntries(this.viewState, this.workflow.compatibleCustomScenes, this.search);
  }

  private categoryButton(category: CategorySelection, label: string) {
    const selected = this.viewState.category === category;
    return html`
      <button
        class="selector ${selected ? "selected" : ""}"
        type="button"
        aria-current=${selected ? "page" : nothing}
        @click=${() => {
          this.dismissExternalEdit();
          this.workflow.setCategory(category);
        }}
      >
        ${label}
      </button>
    `;
  }

  private sceneButton(key: string, label: string, select: () => void) {
    const selected = sceneSelectionKey(this.viewState) === key;
    return html`
      <button
        class="selector scene ${selected ? "selected" : ""}"
        type="button"
        aria-pressed=${selected}
        @click=${() => {
          this.dismissExternalEdit();
          select();
        }}
      >
        <span>${label}</span>
      </button>
    `;
  }

  private renderDetail() {
    const state = this.viewState;
    const scene = state.selectedScene!;
    const speed = scene.speed;
    const speedIndex = state.speedIndex ?? speed?.default_index ?? 0;
    const custom = state.selectedItem !== undefined || state.editingCopy;
    const layered = state.content?.kind === "scene_layered";
    const nativeSelection = state.selectedItem === undefined && !state.editingCopy;
    const savingCopy = state.selectedItem === undefined && state.editingCopy;
    const saveDisabled = !state.name.trim() || (state.selectedItem !== undefined && !this.workflow.sceneDirty);
    return html`
      <header class="editor-heading">
        <div class="editor-title">
          ${custom
            ? html`
                <div class="editable-title">
                  <input
                    class="editor-name"
                    aria-label="Scene name"
                    maxlength="128"
                    .value=${state.name}
                    ?disabled=${!this.isAdmin}
                    @input=${(event: Event) => {
                      this.workflow.setName((event.target as HTMLInputElement).value);
                    }}
                  />
                  ${this.workflow.sceneDirty
                    ? html`<span class="dirty-marker" aria-label="Unsaved changes">*</span>`
                    : nothing}
                </div>
              `
            : html`<h2>${scene.display_name}</h2>`}
          ${state.selectedItem
            ? html`<small class="origin-name">
                ${effectOriginDescription(state.selectedItem.origin, scene.display_name)}
              </small>`
            : nothing}
        </div>
        <div class="actions">
          <button
            class=${layered || nativeSelection ? "secondary" : "primary"}
            type="button"
            ?disabled=${!this.isAdmin ||
            state.saving ||
            !this.workflow.hasCurrentSceneContent() ||
            (!layered && custom && saveDisabled)}
            @click=${layered || nativeSelection ? this.edit : this.save}
          >
            ${state.saving
              ? "Saving..."
              : layered
                ? "Edit"
                : nativeSelection
                  ? "Edit"
                  : savingCopy
                    ? "Save as Custom"
                    : "Save"}
          </button>
          ${state.selectedItem
            ? html`
                <button
                  class="danger"
                  type="button"
                  ?disabled=${!this.isAdmin || state.saving}
                  @click=${this.requestDelete}
                >
                  Delete
                </button>
              `
            : nothing}
          ${nativeSelection && state.hasDefault
            ? html`
                <button
                  class="secondary"
                  type="button"
                  ?disabled=${!this.isAdmin || state.saving || !state.catalogue?.enabled}
                  @click=${this.resetToCatalogue}
                >
                  Reset to catalogue
                </button>
              `
            : nothing}
        </div>
      </header>

      ${!state.catalogue?.enabled
        ? html`
            <div class="feedback callout" role="note">
              Native scenes are disabled for this device in the integration options. Browsing and saving copies remain available.
            </div>
          `
        : nothing}

      ${speed || state.content?.kind === "scene_palette" ? this.renderParameters(speed, speedIndex) : nothing}
    `;
  }

  private renderParameters(speed: SceneSummary["speed"], speedIndex: number) {
    const palette = this.viewState.content?.kind === "scene_palette" ? this.viewState.content : undefined;
    return html`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${speed
            ? html`
                <govee-segmented-control
                  .label=${"Speed"}
                  .value=${speedIndex}
                  .options=${sceneSpeedOptions(speed.option_count, speed.default_index)}
                  .disabled=${!this.isAdmin}
                  @value-changed=${(event: CustomEvent<SegmentedControlChange<number>>) => {
                    this.workflow.setSpeedIndex(event.detail.value);
                    this.dispatchPreview();
                  }}
                ></govee-segmented-control>
              `
            : nothing}
          ${palette ? this.renderPaletteParameters(palette) : nothing}
        </div>
      </div>
    `;
  }

  private renderPaletteParameters(content: PaletteSceneContent) {
    return html`
      <dl class="parameter-summary">
        <div><dt>Layout</dt><dd>${content.layout}</dd></div>
        <div><dt>Brightness flag</dt><dd>${content.brightness_flag ? "Set" : "Clear"}</dd></div>
        <div><dt>Steps</dt><dd>${content.steps.length}</dd></div>
      </dl>
      ${content.palette.length > 0
        ? html`
            <section class="parameter-entry visual-parameter">
              <span class="parameter-label">Palette</span>
              <div class="scene-palette" role="list" aria-label="Scene palette">
                ${content.palette.map(
                  (colour, index) => html`
                    <span
                      role="listitem"
                      style="--scene-colour: ${rgbToHex(colour)}"
                      aria-label="Colour ${index + 1}, ${rgbToHex(colour)}"
                    ></span>
                  `,
                )}
              </div>
            </section>
          `
        : nothing}
      <section class="parameter-entry visual-parameter">
        <span class="parameter-label">Sequence</span>
        <ol class="scene-steps" aria-label="Ordered scene steps">
          ${content.steps.map(
            (step, index) => html`
              <li>
                <span class="step-order">${index + 1}</span>
                <span
                  class="step-colour"
                  style="--scene-colour: ${rgbToHex(step.colour)}"
                  aria-label="Step colour ${rgbToHex(step.colour)}"
                ></span>
                <span>
                  <strong>Raw value ${step.value}</strong>
                  <small>Step colour ${rgbToHex(step.colour)}</small>
                  ${step.inline_colour
                    ? html`<small>Inline colour ${rgbToHex(step.inline_colour)}</small>`
                    : nothing}
                </span>
              </li>
            `,
          )}
        </ol>
      </section>
    `;
  }

  private async selectBuiltin(scene: SceneSummary, preview = false): Promise<void> {
    if ((await this.workflow.selectBuiltin(scene)) && preview) {
      this.dispatchPreview();
    }
  }

  private async selectCustom(summary: Parameters<SceneBrowserWorkflow["selectCustom"]>[0], preview = false): Promise<void> {
    if ((await this.workflow.selectCustom(summary)) && preview) {
      this.dispatchPreview();
    }
  }

  private edit(): void {
    const detail = this.workflow.edit(this.isAdmin);
    if (detail) {
      this.emit<SceneEditSelection>("scene-edit-selected", detail);
    }
  }

  private save(): void {
    void this.workflow.save(this.isAdmin);
  }

  private resetToCatalogue(): void {
    void this.workflow.resetToCatalogue(this.isAdmin);
  }

  private dispatchPreview(): void {
    const detail = this.currentPreviewRequest();
    if (detail) {
      this.emit<ScenePreviewRequest>("scene-preview-requested", detail);
    }
  }

  private dismissExternalEdit(): void {
    if (this.externalEditActive) {
      this.emit("scene-external-edit-cancelled");
    }
  }

  private requestDelete(event: Event): void {
    const item = this.viewState.selectedItem;
    if (!item || !this.isAdmin) {
      return;
    }
    const returnFocus = event.currentTarget as HTMLElement;
    this.emit<LibraryItemDeleteRequest>("library-item-delete-requested", {
      id: item.id,
      version: item.version,
      updated_at: item.updated_at,
      name: item.name,
      discardsOpenEdits: this.workflow.sceneDirty,
      returnFocus,
    });
    returnFocus.blur();
  }

  private emit<T>(name: string, detail?: T): void {
    this.dispatchEvent(
      new CustomEvent<T>(name, {
        ...(detail === undefined ? {} : { detail }),
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = [
    studioBaseStyles,
    studioCardStyles,
    studioActionStyles,
    studioSelectorStyles,
    studioEditorStyles,
    studioFeedbackStyles,
    studioFormStyles,
    studioVisuallyHiddenStyles,
    studioWorkspaceStyles,
    css`
      :host { display: contents; }
      :host([hidden]) { display: none !important; }
      h2, p { margin-top: 0; }
      h2 { margin-bottom: 0; font-size: 20px; }
      .scene-search { display: block; margin-bottom: 12px; }
      .scene-search input {
        width: 100%;
        min-height: var(--studio-control-height);
        padding: 8px 11px;
        border: 1px solid var(--studio-border);
        border-radius: var(--studio-control-radius);
        color: var(--primary-text-color);
        background: var(--studio-card);
      }
      .empty {
        max-width: 680px;
        padding: 28px;
        border: 1px solid var(--studio-border);
        border-radius: 10px;
        background: var(--studio-card);
        line-height: 1.55;
      }
      .scene-parameters { margin-top: 18px; }
      .parameter-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin: 0;
      }
      .parameter-summary div { padding: 10px; border: 1px solid var(--studio-border); border-radius: 8px; }
      .parameter-summary dt, .parameter-summary dd { margin: 0; }
      .parameter-summary dt { color: var(--studio-muted); font-size: 12px; }
      .parameter-summary dd { margin-top: 4px; font-weight: 700; }
      .parameter-list { display: grid; gap: 12px; }
      .parameter-entry {
        padding: 14px;
        border: 1px solid var(--studio-border);
        border-radius: 8px;
        background: color-mix(in srgb, var(--primary-background-color) 58%, var(--studio-card));
      }
      .visual-parameter { display: grid; gap: 12px; }
      .scene-palette { display: flex; flex-wrap: wrap; gap: 8px; }
      .scene-palette span, .step-colour {
        display: block;
        width: 32px;
        height: 32px;
        border: 1px solid color-mix(in srgb, var(--scene-colour) 70%, #000);
        border-radius: 6px;
        background: var(--scene-colour);
      }
      .scene-steps { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
      .scene-steps li {
        display: grid;
        grid-template-columns: auto auto minmax(0, 1fr);
        align-items: center;
        gap: 10px;
      }
      .step-order { width: 24px; color: var(--studio-muted); text-align: end; }
      .scene-steps small { display: block; color: var(--studio-muted); }
      .notice {
        border-color: color-mix(in srgb, var(--studio-blue) 35%, var(--studio-border));
        background: var(--studio-blue-soft);
      }
      .empty p { margin-bottom: 0; color: var(--studio-muted); line-height: 1.5; }
      .status { grid-column: 2 / -1; padding: 48px 28px; }
      @media (max-width: 900px) { :host { display: block; } }
      @media (max-width: 600px) { .parameter-summary { grid-template-columns: 1fr; } }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-scene-browser": GoveeSceneBrowser;
  }
}

if (!customElements.get("govee-scene-browser")) {
  customElements.define("govee-scene-browser", GoveeSceneBrowser);
}
