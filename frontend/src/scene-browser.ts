import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { cloneLayeredSceneContent } from "./advanced-effect-editor";
import type { EffectStudioApi } from "./api";
import type {
  SegmentedControlChange,
  SegmentedControlOption,
} from "./segmented-control";
import "./segmented-control";
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
import {
  compareLabels,
  errorCode,
  errorMessage,
  rgbToHex,
} from "./ui-utils";

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
  private search = "";

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
  private editingCopy = false;

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
      this.search = "";
      this.selectedScene = undefined;
      this.selectedItem = undefined;
      this.content = undefined;
      this.editingCopy = false;
      this.notice = undefined;
      this.error = undefined;
      this.loading = Boolean(this.api && this.device);
    }
    if (changed.has("library") && this.selectedItem) {
      const summary = this.library.items.find(
        (item) => item.id === this.selectedItem?.id,
      );
      if (!summary) {
        this.invalidateRequests();
        this.selectedScene = undefined;
        this.selectedItem = undefined;
        this.content = undefined;
        this.editingCopy = false;
        this.notice = "The selected custom scene was deleted.";
      }
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
    if (changed.has("library") && this.selectedItem) {
      const summary = this.library.items.find(
        (item) => item.id === this.selectedItem?.id,
      );
      if (summary && summary.revision !== this.selectedItem.revision) {
        if (this.sceneDirty) {
          this.notice =
            "This custom scene changed elsewhere. Reload it before saving.";
        } else {
          void this.selectCustom(summary);
        }
      }
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
      <aside
        class="sidebar category-sidebar categories"
        aria-label="Scene categories"
      >
        ${this.sortedCategories.map((category) =>
          this.categoryButton(category.id, category.label),
        )}
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
      </aside>

      <section class="editor-surface detail">
        ${this.notice
          ? html`<div class="feedback notice" role="status">${this.notice}</div>`
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
    const categories: { id: CategorySelection; label: string }[] = [];
    if (this.catalogue?.scenes.length) {
      categories.push({ id: "all", label: "All scenes" });
    }
    if (this.compatibleCustomScenes.length) {
      categories.push({ id: "custom", label: "Custom" });
    }
    categories.push(
      ...(this.catalogue?.categories
        .filter((category) =>
          this.catalogue?.scenes.some(
            (scene) => scene.category_id === category.id,
          ),
        )
        .map((category) => ({
          id: category.id,
          label: category.name,
        })) ?? []),
    );
    return categories.sort((left, right) =>
      compareLabels(left.label, right.label),
    );
  }

  private get compatibleCustomScenes(): LibrarySummary[] {
    return this.library.items.filter(
      (item) =>
        (item.kind === "scene_builtin" ||
          item.kind === "scene_palette" ||
          item.kind === "scene_layered") &&
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
    const query = this.search.trim().toLocaleLowerCase();
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
    ]
      .filter(
        (entry) =>
          !query || entry.label.toLocaleLowerCase().includes(query),
      )
      .sort((left, right) => compareLabels(left.label, right.label));
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
    const custom = this.selectedItem !== undefined || this.editingCopy;
    const layered = this.content?.kind === "scene_layered";
    const nativeSelection =
      this.selectedItem === undefined && !this.editingCopy;
    const snapshotApply =
      !nativeSelection &&
      this.content?.kind !== "scene_builtin" &&
      (this.selectedItem === undefined || this.sceneDirty);
    const applyEnabled = Boolean(
      (nativeSelection ? this.catalogue?.enabled : true) &&
        (!snapshotApply || this.name.trim()),
    );
    return html`
      <header class="editor-heading">
        <div>
          ${custom
            ? html`
                <input
                  class="editor-name"
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
            class="primary"
            type="button"
            ?disabled=${!this.isAdmin ||
            this.saving ||
            this.applying ||
            !this.hasCurrentSceneContent()}
            @click=${layered ? this.edit : custom ? this.save : this.edit}
          >
            ${this.saving
              ? "Saving..."
              : layered
                ? "Edit"
                : custom
                  ? "Save"
                  : "Edit"}
          </button>
          <button
            class="secondary"
            type="button"
            ?disabled=${!this.isAdmin ||
            !applyEnabled ||
            !this.hasCurrentSceneContent() ||
            this.saving ||
            this.applying}
            @click=${this.apply}
          >
            ${this.applying ? "Applying..." : "Apply"}
          </button>
          ${this.selectedItem
            ? html`
                <button
                  class="danger"
                  type="button"
                  ?disabled=${!this.isAdmin || this.saving || this.applying}
                  @click=${this.requestDelete}
                >
                  Delete
                </button>
              `
            : nothing}
        </div>
      </header>

      ${!this.catalogue?.enabled
        ? html`
            <div class="feedback callout" role="note">
              Native scenes are disabled for this device in the integration
              options. Browsing and saving copies remain available.
            </div>
          `
        : nothing}

      ${custom &&
      (this.content?.kind === "scene_palette" ||
        this.content?.kind === "scene_layered")
        ? html`
            <div
              class="feedback callout"
              role="note"
            >
              Authored scene parameters are uploaded before the source scene is
              selected. The device confirms scene identity, but cannot read the
              authored parameters back.
            </div>
          `
        : nothing}

      ${speed || this.content?.kind === "scene_palette"
        ? this.renderParameters(speed, speedIndex)
        : nothing}
    `;
  }

  private renderParameters(
    speed: SceneSummary["speed"],
    speedIndex: number,
  ) {
    const palette =
      this.content?.kind === "scene_palette" ? this.content : undefined;
    return html`
      <div class="card scene-parameters">
        <div class="parameter-list">
          ${speed
            ? html`
                <govee-segmented-control
                  .label=${"Speed"}
                  .value=${speedIndex}
                  .options=${sceneSpeedOptions(
                    speed.option_count,
                    speed.default_index,
                  )}
                  .disabled=${!this.isAdmin}
                  @value-changed=${(
                    event: CustomEvent<SegmentedControlChange<number>>,
                  ) => {
                    this.speedIndex = event.detail.value;
                  }}
                ></govee-segmented-control>
              `
            : nothing}
          ${palette
            ? this.renderPaletteParameters(palette)
            : nothing}
        </div>
      </div>
    `;
  }

  private renderPaletteParameters(content: PaletteSceneContent) {
    return html`
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
          <dt>Steps</dt>
          <dd>${content.steps.length}</dd>
        </div>
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
    this.editingCopy = false;
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
    this.editingCopy = false;
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
    this.editingCopy = false;
    this.content = undefined;
    this.name = summary.name;
    try {
      const item = await request.api.item(summary.id);
      if (!this.requestIsCurrent(request)) {
        return;
      }
      if (
        item.content.kind !== "scene_builtin" &&
        item.content.kind !== "scene_palette" &&
        item.content.kind !== "scene_layered"
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
      this.editingCopy = false;
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
      this.saving ||
      this.applying
    ) {
      return;
    }

    const name = this.name.trim();
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
      this.editingCopy = false;
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

  private edit(): void {
    if (
      !this.isAdmin ||
      !this.selectedScene ||
      !this.hasCurrentSceneContent()
    ) {
      return;
    }
    if (
      this.selectedScene.scene_type === 2 &&
      this.content?.kind === "scene_layered"
    ) {
      this.dispatchSceneEdit();
      return;
    }
    this.editingCopy = true;
    this.name = `${this.selectedScene.display_name} copy`;
    this.notice = undefined;
  }

  private dispatchSceneEdit(): void {
    if (
      !this.selectedScene ||
      this.content?.kind !== "scene_layered"
    ) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{
        content: LayeredSceneContent;
        config_entry_id: string;
        item?: LibraryItem;
        name: string;
      }>("scene-edit-selected", {
        detail: {
          content: cloneLayeredSceneContent({
            ...this.content,
            speed_index: this.speedIndex,
          }),
          config_entry_id: this.device!.config_entry_id,
          ...(this.selectedItem ? { item: this.selectedItem } : {}),
          name:
            this.selectedItem?.name ??
            `${this.selectedScene.display_name} copy`,
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
      (!this.catalogue?.enabled &&
        this.selectedItem === undefined &&
        !this.editingCopy) ||
      this.saving ||
      this.applying
    ) {
      return;
    }
    const request = this.captureRequest();
    const device = this.device;
    const scene = this.selectedScene;
    const speedIndex = this.speedIndex;
    const nativeSelection =
      this.selectedItem === undefined && !this.editingCopy;
    const content =
      this.content!.kind === "scene_palette"
        ? clonePaletteSceneContent({
            ...this.content!,
            speed_index: speedIndex,
          })
        : this.content!.kind === "scene_layered"
          ? cloneLayeredSceneContent({
              ...this.content!,
              speed_index: speedIndex,
            })
          : {
              ...this.content!,
              speed_index: speedIndex,
            };
    const snapshotApply =
      !nativeSelection &&
      content.kind !== "scene_builtin" &&
      (this.selectedItem === undefined || this.sceneDirty);
    const name = this.name.trim();
    if (snapshotApply && !name) {
      this.notice = "Give this custom scene a name before applying it.";
      return;
    }
    this.applying = true;
    this.notice = undefined;
    try {
      if (nativeSelection || content.kind === "scene_builtin") {
        await request.api.applyScene(request.deviceId, scene, speedIndex);
      } else if (snapshotApply) {
        await request.api.applySnapshot(
          request.deviceId,
          name,
          content,
        );
      } else {
        await request.api.applySaved(request.deviceId, this.selectedItem!);
      }
      if (this.requestIsCurrent(request)) {
        this.notice =
          nativeSelection || content.kind === "scene_builtin"
            ? `Applied to ${device.display_name}. Scene identity can be read back; the selected speed remains optimistic.`
            : `Applied to ${device.display_name}. Scene identity was confirmed; authored parameters remain write-only.`;
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

  private get sceneDirty(): boolean {
    if (!this.selectedItem || !this.content) {
      return true;
    }
    const current =
      this.content.kind === "scene_palette"
        ? clonePaletteSceneContent({
            ...this.content,
            speed_index: this.speedIndex,
          })
        : this.content.kind === "scene_layered"
          ? cloneLayeredSceneContent({
              ...this.content,
              speed_index: this.speedIndex,
            })
          : {
              ...this.content,
              speed_index: this.speedIndex,
            };
    return (
      this.name.trim() !== this.selectedItem.name ||
      JSON.stringify(current) !== JSON.stringify(this.selectedItem.content)
    );
  }

  private requestDelete(event: Event): void {
    if (!this.selectedItem || !this.isAdmin) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("library-item-delete-requested", {
        detail: {
          id: this.selectedItem.id,
          revision: this.selectedItem.revision,
          name: this.selectedItem.name,
        },
        bubbles: true,
        composed: true,
      }),
    );
    (event.currentTarget as HTMLElement).blur();
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
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none !important;
    }

    h2,
    p {
      margin-top: 0;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
    }

    .scene-search {
      display: block;
      margin-bottom: 12px;
    }

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
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .scene-parameters {
      margin-top: 18px;
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

    .parameter-list {
      display: grid;
      gap: 12px;
    }

    .parameter-entry {
      padding: 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--primary-background-color) 58%,
        var(--studio-card)
      );
    }

    .visual-parameter {
      display: grid;
      gap: 12px;
    }

    .scene-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
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
      margin: 0;
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

    .empty p {
      margin-bottom: 0;
      color: var(--studio-muted);
      line-height: 1.5;
    }

    .status {
      grid-column: 2 / -1;
      padding: 48px 28px;
    }

    @media (max-width: 900px) {
      :host {
        display: block;
      }

    }

    @media (max-width: 600px) {
      .parameter-summary {
        grid-template-columns: 1fr;
      }
    }
  `];
}

function sceneKey(scene: SceneSummary): string {
  return `builtin:${scene.scene_id}:${scene.effect_id}`;
}

function sceneSpeedOptions(
  optionCount: number,
  defaultIndex: number,
): SegmentedControlOption<number>[] {
  return Array.from({ length: optionCount }, (_unused, index) => ({
    value: index,
    label: sceneSpeedLabel(index, defaultIndex),
  }));
}

function sceneSpeedLabel(index: number, defaultIndex: number): string {
  const offset = index - defaultIndex;
  if (offset === 0) {
    return "Default";
  }

  const magnitude = Math.abs(offset);
  return `${magnitude} ${magnitude === 1 ? "step" : "steps"} ${offset < 0 ? "lower" : "higher"}`;
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

declare global {
  interface HTMLElementTagNameMap {
    "govee-scene-browser": GoveeSceneBrowser;
  }
}

if (!customElements.get("govee-scene-browser")) {
  customElements.define("govee-scene-browser", GoveeSceneBrowser);
}
