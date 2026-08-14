import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { cloneAdvancedContent } from "./advanced-effect-editor";
import type { EffectStudioApi } from "./api";
import { rgbToHex } from "./palette-editor";
import type {
  BuiltinSceneContent,
  DeviceCapabilities,
  LayeredSceneContent,
  LibraryItem,
  LibrarySnapshot,
  LibrarySummary,
  PaletteSceneContent,
  SceneCatalogue,
  SceneSummary,
} from "./types";

type CategorySelection = "all" | "custom" | number;
type SceneContent =
  | BuiltinSceneContent
  | PaletteSceneContent
  | LayeredSceneContent;
type SceneListEntry =
  | { kind: "custom"; item: LibrarySummary; label: string }
  | { kind: "builtin"; scene: SceneSummary; label: string };
type SceneRequestContext = {
  generation: number;
  api: EffectStudioApi;
  deviceId: string;
  category: CategorySelection;
  selectionIdentity?: string;
};

export class GoveeSceneBrowser extends LitElement {
  @property({ attribute: false })
  public api?: EffectStudioApi;

  @property({ attribute: false })
  public device?: DeviceCapabilities;

  @property({ attribute: false })
  public library: LibrarySnapshot = {
    library_revision: 0,
    items: [],
  };

  @property({ type: Boolean })
  public isAdmin = false;

  @state()
  private catalogue?: SceneCatalogue;

  @state()
  private category: CategorySelection = "all";

  @state()
  private selectedScene?: SceneSummary;

  @state()
  private selectedItem?: LibraryItem;

  @state()
  private content?: SceneContent;

  @state()
  private name = "";

  @state()
  private speedIndex: number | null = null;

  @state()
  private loading = false;

  @state()
  private saving = false;

  @state()
  private applying = false;

  @state()
  private notice?: string;

  @state()
  private error?: string;

  private requestGeneration = 0;
  private activeSelectionIdentity?: string;

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("device") || changed.has("api")) {
      this.invalidateRequests();
      this.catalogue = undefined;
      this.category = "all";
      this.selectedScene = undefined;
      this.selectedItem = undefined;
      this.content = undefined;
      this.notice = undefined;
      this.error = undefined;
      this.loading = Boolean(this.api && this.device);
    }
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (
      (changed.has("device") || changed.has("api")) &&
      this.api &&
      this.device
    ) {
      void this.loadCatalogue();
    }
  }

  protected render() {
    if (!this.device) {
      return html`
        <section class="empty">
          <h2>No loaded device</h2>
          <p>Load a Govee light before browsing its native scenes.</p>
        </section>
      `;
    }
    if (this.loading) {
      return html`<div class="status" role="status">Loading scenes...</div>`;
    }
    if (this.error || !this.catalogue) {
      return html`
        <section class="empty">
          <h2>Scenes are unavailable</h2>
          <p role="alert">${this.error ?? "The scene catalogue could not be loaded."}</p>
        </section>
      `;
    }

    return html`
      <aside class="categories" aria-label="Scene categories">
        ${this.sortedCategories.map((category) =>
          this.categoryButton(category.id, category.label),
        )}
      </aside>

      <aside class="scenes" aria-label="Scenes">
        ${this.filteredSceneEntries.map((entry) =>
          entry.kind === "custom"
            ? this.sceneButton(
                `custom:${entry.item.id}`,
                entry.label,
                () => this.selectCustom(entry.item),
              )
            : this.sceneButton(
                sceneKey(entry.scene),
                entry.label,
                () => this.selectBuiltin(entry.scene),
              ),
        )}
        ${!this.filteredSceneEntries.length
          ? html`<p class="empty-list">No scenes in this category.</p>`
          : nothing}
      </aside>

      <section class="detail">
        ${this.notice
          ? html`<div class="notice" role="status">${this.notice}</div>`
          : nothing}
        ${this.selectedScene && this.content
          ? this.renderDetail()
          : nothing}
      </section>
    `;
  }

  private get sortedCategories(): {
    id: CategorySelection;
    label: string;
  }[] {
    return [
      { id: "all" as const, label: "All scenes" },
      { id: "custom" as const, label: "Custom" },
      ...(this.catalogue?.categories.map((category) => ({
        id: category.id,
        label: category.name,
      })) ?? []),
    ].sort((left, right) => compareLabels(left.label, right.label));
  }

  private get compatibleCustomScenes(): LibrarySummary[] {
    return this.library.items.filter(
      (item) =>
        (item.kind === "scene_builtin" || item.kind === "scene_palette") &&
        item.template?.sku === this.catalogue?.sku,
    );
  }

  private get filteredCustomScenes(): LibrarySummary[] {
    return this.category === "all" || this.category === "custom"
      ? this.compatibleCustomScenes
      : [];
  }

  private get filteredBuiltinScenes(): SceneSummary[] {
    if (!this.catalogue || this.category === "custom") {
      return [];
    }
    if (this.category === "all") {
      return this.catalogue.scenes;
    }
    return this.catalogue.scenes.filter(
      (scene) => scene.category_id === this.category,
    );
  }

  private get filteredSceneEntries(): SceneListEntry[] {
    return [
      ...this.filteredCustomScenes.map(
        (item): SceneListEntry => ({
          kind: "custom",
          item,
          label: item.name,
        }),
      ),
      ...this.filteredBuiltinScenes.map(
        (scene): SceneListEntry => ({
          kind: "builtin",
          scene,
          label: scene.display_name,
        }),
      ),
    ].sort((left, right) => compareLabels(left.label, right.label));
  }

  private get selectionKey(): string | undefined {
    if (this.selectedItem) {
      return `custom:${this.selectedItem.id}`;
    }
    return this.selectedScene ? sceneKey(this.selectedScene) : undefined;
  }

  private categoryButton(category: CategorySelection, label: string) {
    const selected = this.category === category;
    return html`
      <button
        class="selector ${selected ? "selected" : ""}"
        type="button"
        aria-current=${selected ? "page" : nothing}
        @click=${() => this.selectCategory(category)}
      >
        ${label}
      </button>
    `;
  }

  private sceneButton(
    key: string,
    label: string,
    select: () => void,
  ) {
    const selected = this.selectionKey === key;
    return html`
      <button
        class="selector scene ${selected ? "selected" : ""}"
        type="button"
        aria-pressed=${selected}
        @click=${select}
      >
        <span>${label}</span>
      </button>
    `;
  }

  private renderDetail() {
    const scene = this.selectedScene!;
    const speed = scene.speed;
    const speedIndex = this.speedIndex ?? speed?.default_index ?? 0;
    const custom = this.selectedItem !== undefined;
    return html`
      <header class="detail-heading">
        <div>
          ${custom
            ? html`
                <input
                  class="name"
                  aria-label="Scene name"
                  maxlength="128"
                  .value=${this.name}
                  ?disabled=${!this.isAdmin}
                  @input=${(event: Event) => {
                    this.name = (event.target as HTMLInputElement).value;
                  }}
                />
              `
            : html`<h2>${scene.display_name}</h2>`}
        </div>
        <div class="actions">
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.isAdmin ||
            this.saving ||
            !this.hasCurrentSceneContent() ||
            this.content?.kind === "scene_layered"}
            @click=${this.save}
          >
            ${this.saving
              ? "Saving..."
              : custom
                ? "Save"
                : "Save copy"}
          </button>
          ${scene.parameter_kind === "layers"
            ? html`
                <button
                  class="secondary"
                  type="button"
                  ?disabled=${!this.isAdmin ||
                  scene.scene_type !== 2 ||
                  !this.hasCurrentSceneContent() ||
                  this.content?.kind !== "scene_layered"}
                  @click=${this.useAsTemplate}
                >
                  Use as Template
                </button>
              `
            : nothing}
          <button
            class="primary"
            type="button"
            aria-describedby=${custom &&
            this.content?.kind === "scene_palette"
              ? "palette-apply-reason"
              : nothing}
            ?disabled=${!this.isAdmin ||
            !this.catalogue?.enabled ||
            !this.hasCurrentSceneContent() ||
            (this.selectedItem !== undefined &&
              this.content?.kind !== "scene_builtin") ||
            this.applying}
            @click=${this.apply}
          >
            ${this.applying ? "Applying..." : "Apply"}
          </button>
        </div>
      </header>

      ${!this.catalogue?.enabled
        ? html`
            <div class="callout" role="note">
              Native scenes are disabled for this device in the integration
              options. Browsing and saving copies remain available.
            </div>
          `
        : nothing}

      ${custom && this.content?.kind === "scene_palette"
        ? html`
            <div class="callout" id="palette-apply-reason" role="note">
              Saved palette scene copies cannot be applied. Apply the native
              catalogue scene through its scene identity instead.
            </div>
          `
        : nothing}

      ${speed
        ? html`
            <section class="card">
              <h3>Common settings</h3>
              <label class="range-field">
                <span>Speed</span>
                <input
                  type="range"
                  aria-label="Scene speed"
                  min="0"
                  max=${speed.option_count - 1}
                  step="1"
                  .value=${String(speedIndex)}
                  ?disabled=${!this.isAdmin}
                  @input=${(event: Event) => {
                    this.speedIndex = Number(
                      (event.target as HTMLInputElement).value,
                    );
                  }}
                />
                <output>
                  ${speedLabel(speedIndex, speed.default_index)}
                </output>
              </label>
            </section>
          `
        : nothing}

      ${this.content?.kind === "scene_palette"
        ? this.renderPaletteParameters(this.content)
        : nothing}
    `;
  }

  private renderPaletteParameters(content: PaletteSceneContent) {
    return html`
      <section class="card scene-parameters">
        <h3>Scene parameters</h3>
        <dl class="parameter-summary">
          <div>
            <dt>Layout</dt>
            <dd>${content.layout}</dd>
          </div>
          <div>
            <dt>Brightness flag</dt>
            <dd>${content.brightness_flag ? "Set" : "Clear"}</dd>
          </div>
          <div>
            <dt>Step count</dt>
            <dd>${content.steps.length}</dd>
          </div>
        </dl>
        ${content.palette.length > 0
          ? html`
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
            `
          : nothing}
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
                    ? html`
                        <small>
                          Inline colour ${rgbToHex(step.inline_colour)}
                        </small>
                      `
                    : nothing}
                </span>
              </li>
            `,
          )}
        </ol>
      </section>
    `;
  }

  private async loadCatalogue(): Promise<void> {
    if (!this.api || !this.device) {
      return;
    }
    const request = this.beginRequest();
    this.loading = true;
    this.error = undefined;
    this.notice = undefined;
    this.selectedScene = undefined;
    this.selectedItem = undefined;
    this.content = undefined;
    try {
      const catalogue = await request.api.sceneCatalogue(request.deviceId);
      if (!this.requestIsCurrent(request)) {
        return;
      }
      this.catalogue = catalogue;
      this.category = "all";
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.error = errorMessage(error);
      }
    } finally {
      if (this.requestIsCurrent(request)) {
        this.loading = false;
      }
    }
  }

  private selectCategory(category: CategorySelection): void {
    this.invalidateRequests();
    this.category = category;
    this.selectedScene = undefined;
    this.selectedItem = undefined;
    this.content = undefined;
    this.notice = undefined;
  }

  private async selectBuiltin(scene: SceneSummary): Promise<void> {
    if (!this.api || !this.device) {
      return;
    }
    const identity = sceneKey(scene);
    const request = this.beginRequest(identity);
    this.notice = undefined;
    this.selectedScene = scene;
    this.selectedItem = undefined;
    this.content = undefined;
    this.name = scene.display_name;
    this.speedIndex = scene.speed?.default_index ?? null;
    try {
      const detail = await request.api.sceneDetail(
        request.deviceId,
        scene.scene_id,
        scene.effect_id,
      );
      if (
        !this.requestIsCurrent(request) ||
        sceneKey(detail.scene) !== identity
      ) {
        return;
      }
      this.selectedScene = detail.scene;
      this.content = detail.content;
      this.name = detail.scene.display_name;
      this.speedIndex = detail.content.speed_index;
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.notice = errorMessage(error);
      }
    }
  }

  private async selectCustom(summary: LibrarySummary): Promise<void> {
    if (!this.api || !this.device || !this.catalogue) {
      return;
    }
    const catalogue = this.catalogue;
    const request = this.beginRequest(`custom:${summary.id}`);
    this.notice = undefined;
    this.selectedScene = undefined;
    this.selectedItem = undefined;
    this.content = undefined;
    this.name = summary.name;
    try {
      const item = await request.api.item(summary.id);
      if (!this.requestIsCurrent(request)) {
        return;
      }
      if (
        item.content.kind !== "scene_builtin" &&
        item.content.kind !== "scene_palette"
      ) {
        throw new Error("This custom scene uses an unsupported definition.");
      }
      const content = item.content;
      if (content.template.sku !== catalogue.sku) {
        throw new Error(
          `This custom scene targets ${content.template.sku}, not ${catalogue.sku}.`,
        );
      }
      const scene = catalogue.scenes.find(
        (candidate) =>
          candidate.scene_id === content.template.scene_id &&
          candidate.effect_id === content.template.effect_id,
      );
      if (!scene) {
        throw new Error("The source scene is not in this device catalogue.");
      }
      const detail = await request.api.sceneDetail(
        request.deviceId,
        content.template.scene_id,
        content.template.effect_id,
      );
      if (
        !this.requestIsCurrent(request) ||
        sceneKey(detail.scene) !== sceneKey(scene)
      ) {
        return;
      }
      this.selectedScene = scene;
      this.selectedItem = item;
      this.content = content;
      this.name = item.name;
      this.speedIndex =
        content.speed_index ?? scene.speed?.default_index ?? null;
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.notice = errorMessage(error);
      }
    }
  }

  private async save(): Promise<void> {
    if (
      !this.api ||
      !this.device ||
      !this.catalogue ||
      !this.selectedScene ||
      !this.content ||
      !this.hasCurrentSceneContent() ||
      (this.content.kind !== "scene_builtin" &&
        this.content.kind !== "scene_palette") ||
      !this.isAdmin ||
      this.saving
    ) {
      return;
    }

    const name = (
      this.selectedItem
        ? this.name.trim()
        : `${this.selectedScene.display_name} copy`
    ).trim();
    if (!name) {
      this.notice = "Give this custom scene a name before saving.";
      return;
    }
    const content =
      this.content.kind === "scene_palette"
        ? clonePaletteSceneContent({
            ...this.content,
            speed_index: this.speedIndex,
          })
        : {
            ...this.content,
            speed_index: this.speedIndex,
          };
    const request = this.captureRequest();
    this.saving = true;
    this.notice = undefined;
    try {
      const result = this.selectedItem
        ? await this.api.updateItem(
            this.selectedItem,
            name,
            content,
            this.library.library_revision,
          )
        : await this.api.createItem(
            name,
            content,
            this.library.library_revision,
          );
      if (
        result.item.content.kind !== "scene_builtin" &&
        result.item.content.kind !== "scene_palette"
      ) {
        throw new Error("The saved scene returned an unsupported definition.");
      }
      this.dispatchEvent(
        new CustomEvent("library-item-saved", {
          detail: {
            item: result.item,
            library_revision: result.library_revision,
          },
          bubbles: true,
          composed: true,
        }),
      );
      if (!this.requestIsCurrent(request)) {
        return;
      }
      this.requestGeneration += 1;
      this.activeSelectionIdentity = `custom:${result.item.id}`;
      this.selectedItem = result.item;
      this.content = result.item.content;
      this.name = result.item.name;
      this.category = "custom";
      this.notice = "Custom scene saved.";
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.notice =
          errorCode(error) === "conflict"
            ? "The library changed elsewhere. Reload the scene before saving."
            : `Save failed: ${errorMessage(error)}`;
      }
    } finally {
      this.saving = false;
    }
  }

  private useAsTemplate(): void {
    if (
      !this.isAdmin ||
      !this.selectedScene ||
      this.selectedScene.scene_type !== 2 ||
      this.content?.kind !== "scene_layered" ||
      !this.hasCurrentSceneContent()
    ) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{
        content: LayeredSceneContent;
        config_entry_id: string;
        name: string;
      }>("scene-template-selected", {
        detail: {
          content: cloneLayeredSceneContent({
            ...this.content,
            speed_index: this.speedIndex,
          }),
          config_entry_id: this.device!.config_entry_id,
          name: `${this.selectedScene.display_name} layered`,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async apply(): Promise<void> {
    if (
      !this.api ||
      !this.device ||
      !this.selectedScene ||
      !this.hasCurrentSceneContent() ||
      !this.isAdmin ||
      !this.catalogue?.enabled ||
      (this.selectedItem !== undefined &&
        this.content?.kind !== "scene_builtin") ||
      this.applying
    ) {
      return;
    }
    const request = this.captureRequest();
    const device = this.device;
    const scene = this.selectedScene;
    const speedIndex = this.speedIndex;
    this.applying = true;
    this.notice = undefined;
    try {
      await request.api.applyScene(request.deviceId, scene, speedIndex);
      if (this.requestIsCurrent(request)) {
        this.notice = `Applied to ${device.display_name}. Scene identity can be read back; the selected speed remains optimistic.`;
      }
    } catch (error) {
      if (this.requestIsCurrent(request)) {
        this.notice = `Apply failed: ${errorMessage(error)}`;
      }
    } finally {
      this.applying = false;
    }
  }

  private beginRequest(
    selectionIdentity?: string,
  ): SceneRequestContext {
    this.requestGeneration += 1;
    this.activeSelectionIdentity = selectionIdentity;
    return this.captureRequest();
  }

  private captureRequest(): SceneRequestContext {
    return {
      generation: this.requestGeneration,
      api: this.api!,
      deviceId: this.device!.config_entry_id,
      category: this.category,
      selectionIdentity: this.activeSelectionIdentity,
    };
  }

  private invalidateRequests(): void {
    this.requestGeneration += 1;
    this.activeSelectionIdentity = undefined;
  }

  private requestIsCurrent(request: SceneRequestContext): boolean {
    return (
      request.generation === this.requestGeneration &&
      request.api === this.api &&
      request.deviceId === this.device?.config_entry_id &&
      request.category === this.category &&
      request.selectionIdentity === this.activeSelectionIdentity
    );
  }

  private hasCurrentSceneContent(): boolean {
    if (
      !this.catalogue ||
      !this.selectedScene ||
      !this.content ||
      this.content.template.sku !== this.catalogue.sku ||
      this.content.template.scene_id !== this.selectedScene.scene_id ||
      this.content.template.effect_id !== this.selectedScene.effect_id
    ) {
      return false;
    }
    return this.activeSelectionIdentity === this.selectionKey;
  }

  static styles = css`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none !important;
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    button {
      min-height: 40px;
    }

    .categories,
    .scenes {
      overflow: auto;
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--primary-background-color);
    }

    .categories {
      background: var(--secondary-background-color, #f5f6f8);
    }

    .eyebrow {
      margin: 0 10px 8px;
      color: var(--studio-muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    h2,
    h3,
    p {
      margin-top: 0;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
    }

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
    }

    .scenes-heading {
      margin: 0 10px 20px;
    }

    .scenes-heading .eyebrow {
      margin-inline: 0;
    }

    .selector {
      width: 100%;
      min-height: 40px;
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

    .detail {
      min-width: 0;
      padding: 28px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .detail-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 22px;
    }

    .detail-heading .eyebrow {
      margin-inline: 0;
    }

    .name {
      width: min(460px, 100%);
      min-height: 42px;
      padding: 8px 0;
      border: 0;
      border-bottom: 1px solid var(--studio-border);
      color: var(--primary-text-color);
      background: transparent;
      font-size: 24px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 9px;
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

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .card,
    .callout,
    .notice,
    .empty {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .card {
      margin-top: 18px;
      padding: 20px;
    }

    .parameter-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin: 0;
    }

    .parameter-summary div {
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
    }

    .parameter-summary dt,
    .parameter-summary dd {
      margin: 0;
    }

    .parameter-summary dt {
      color: var(--studio-muted);
      font-size: 12px;
    }

    .parameter-summary dd {
      margin-top: 4px;
      font-weight: 700;
    }

    .scene-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .scene-palette span,
    .step-colour {
      display: block;
      width: 32px;
      height: 32px;
      border: 1px solid
        color-mix(in srgb, var(--scene-colour) 70%, #000);
      border-radius: 6px;
      background: var(--scene-colour);
    }

    .scene-steps {
      display: grid;
      gap: 8px;
      margin: 14px 0 0;
      padding: 0;
      list-style: none;
    }

    .scene-steps li {
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      align-items: center;
      gap: 10px;
    }

    .step-order {
      width: 24px;
      color: var(--studio-muted);
      text-align: end;
    }

    .scene-steps small {
      display: block;
      color: var(--studio-muted);
    }

    .callout,
    .notice {
      margin-bottom: 18px;
      padding: 12px 14px;
      line-height: 1.45;
    }

    .notice {
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 35%,
        var(--studio-border)
      );
      background: var(--studio-blue-soft);
    }

    .empty {
      max-width: 680px;
      padding: 28px;
      line-height: 1.55;
    }

    .empty p,
    .empty-list,
    .muted {
      margin-bottom: 0;
      color: var(--studio-muted);
      line-height: 1.5;
    }

    .empty-list {
      padding: 12px 10px;
    }

    .range-field {
      display: grid;
      grid-template-columns: 80px minmax(100px, 1fr) 72px;
      align-items: center;
      gap: 10px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .range-field output {
      color: var(--primary-text-color);
      text-align: end;
    }

    .status {
      grid-column: 2 / -1;
      padding: 48px 28px;
    }

    @media (max-width: 900px) {
      :host {
        display: block;
      }

      .categories {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .categories .eyebrow {
        display: none;
      }

      .categories .selector {
        flex: 0 0 auto;
        width: auto;
        white-space: nowrap;
      }

      .scenes {
        max-height: 340px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .detail {
        padding: 20px 16px 32px;
      }
    }

    @media (max-width: 600px) {
      .detail-heading {
        align-items: stretch;
        flex-direction: column;
      }

      .actions > button {
        flex: 1;
      }
    }
  `;
}

function sceneKey(scene: SceneSummary): string {
  return `builtin:${scene.scene_id}:${scene.effect_id}`;
}

function speedLabel(index: number, defaultIndex: number): string {
  const offset = index - defaultIndex;
  if (offset === 0) {
    return "Default";
  }

  const magnitude = Math.abs(offset);
  return `${offset < 0 ? "Slower" : "Faster"}${magnitude > 1 ? ` ${magnitude}` : ""}`;
}

function compareLabels(left: string, right: string): number {
  return left.localeCompare(right, "en-AU", { sensitivity: "base" });
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

function clonePaletteSceneContent(
  content: PaletteSceneContent,
): PaletteSceneContent {
  return {
    ...content,
    template: { ...content.template },
    steps: content.steps.map((step) => ({
      ...step,
      colour: [...step.colour],
      inline_colour:
        step.inline_colour === null ? null : [...step.inline_colour],
    })),
    palette: content.palette.map((colour) => [...colour]),
  };
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
    "govee-scene-browser": GoveeSceneBrowser;
  }
}

if (!customElements.get("govee-scene-browser")) {
  customElements.define("govee-scene-browser", GoveeSceneBrowser);
}
