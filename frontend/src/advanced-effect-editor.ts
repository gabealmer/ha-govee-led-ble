import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  bytePercent,
  isKnownBrightnessOrder,
  KNOWN_BRIGHTNESS_ORDERS,
} from "./advanced-effect-model";
import {
  AdvancedEffectEditorController,
  AUTHORING_LAYER_LIMIT,
  AUTHORING_PALETTE_LIMIT,
  DEFAULT_SEGMENT_COUNT,
  type MovementKey,
} from "./advanced-effect-editor-controller";
import {
  renderDistribution,
  renderNumberField,
  renderRangeField,
  renderSelectionControls,
} from "./advanced-effect-editor-fields";
import { advancedEffectEditorStyles } from "./advanced-effect-editor-styles";
import type { AppliedAreaChange } from "./applied-area-control";
import "./applied-area-control";
import type { LivePreviewInteraction } from "./live-preview-controller";
export {
  blankAdvancedContent,
  cloneAdvancedContent,
  cloneLayeredSceneContent,
} from "./advanced-effect-model";
import type { CheckboxControlChange } from "./checkbox-control";
import "./checkbox-control";
import "./reorderable-strip";
import type {
  GoveeReorderableStrip,
  ReorderableStripItem,
} from "./reorderable-strip";
import type {
  SegmentedControlChange,
  SegmentedControlOption,
} from "./segmented-control";
import "./segmented-control";
import "./slider-control";
import type { SwitchControlChange } from "./switch-control";
import "./switch-control";
import type {
  AdvancedContent,
  BrightnessOrder,
  BrightnessPattern,
  EffectLayer,
  Movement,
  RGB,
} from "./types";

const PRIORITY_OPTIONS = [
  { value: 0, label: "None" },
  ...[1, 2, 3, 4, 5].map((value) => ({
    value,
    label: String(value),
  })),
] satisfies readonly SegmentedControlOption<number>[];

const BRIGHTNESS_LABELS: Record<BrightnessOrder, string> = {
  0: "Brightest to darkest",
  1: "Brightest, darkest, brightest",
  2: "Darkest to brightest",
  3: "Darkest, brightest, darkest",
};

const BRIGHTNESS_RANGES = [
  ["Scope low", "scope_low"],
  ["Scope high", "scope_high"],
  ["Changing speed", "change_speed"],
  ["Brightest retention", "brightest_retention"],
  ["Darkest retention", "darkest_retention"],
] as const;

const MOVEMENT_LABELS: Record<number, string> = {
  0: "Forward",
  1: "Backward",
  2: "Forward and back",
  3: "Back and forward",
};

export class GoveeAdvancedEffectEditor extends LitElement {
  @property({ attribute: false })
  public content?: AdvancedContent;

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Number })
  public segmentCount = DEFAULT_SEGMENT_COUNT;

  @state()
  private movementAnnouncement = "";

  private readonly controller = new AdvancedEffectEditorController();
  private previewInteraction: LivePreviewInteraction = "committed";

  public connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("value-changed", this.capturePreviewInteraction, true);
    this.addEventListener("palette-changed", this.capturePreviewInteraction, true);
  }

  public disconnectedCallback(): void {
    this.removeEventListener("value-changed", this.capturePreviewInteraction, true);
    this.removeEventListener("palette-changed", this.capturePreviewInteraction, true);
    super.disconnectedCallback();
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("content") || changed.has("disabled")) {
      this.controller.sync(this.content, this.disabled);
    }
  }

  protected render() {
    if (!this.content) {
      return nothing;
    }
    if (this.content.layers.length === 0) {
      return this.renderEmptyLayers();
    }
    const layer = this.activeLayer;
    const layerItems: ReorderableStripItem[] = this.content.layers.map(
      (_item, index) => ({
        key: `layer-${index}`,
        label: `Layer ${index + 1}`,
        ariaLabel: `Layer ${index + 1}. Drag to reorder or use arrow keys.`,
        id: `advanced-layer-tab-${index}`,
        ariaControls: "advanced-layer-panel",
      }),
    );
    return html`
      <div class="visually-hidden" aria-live="polite">
        ${this.movementAnnouncement}
      </div>

      <section class="card layer-card">
        <div class="layer-toolbar">
          <govee-reorderable-strip
            .items=${layerItems}
            .activeIndex=${this.controller.activeLayerIndex}
            ariaLabel="Effect layers"
            itemRole="tab"
            addLabel="Add layer"
            .addDisabled=${this.disabled}
            .addHidden=${this.content.layers.length >= AUTHORING_LAYER_LIMIT}
            .reorderDisabled=${this.disabled}
            @item-selected=${(event: CustomEvent<{ index: number }>) =>
              this.selectLayer(event.detail.index)}
            @items-reordered=${(
              event: CustomEvent<{ from: number; to: number }>,
            ) => this.reorderLayer(event.detail.from, event.detail.to)}
            @item-added=${this.addLayer}
          ></govee-reorderable-strip>
          ${this.disabled
            ? nothing
            : html`
                <div class="layer-actions">
                  <button
                    class="secondary"
                    type="button"
                    ?disabled=${this.content.layers.length >=
                    AUTHORING_LAYER_LIMIT}
                    @click=${this.copyLayer}
                  >
                    Copy
                  </button>
                  <button
                    class="danger"
                    type="button"
                    ?disabled=${this.content.layers.length === 1}
                    @click=${this.deleteLayer}
                  >
                    Delete
                  </button>
                </div>
              `}
        </div>

        ${this.content.layers.length >= AUTHORING_LAYER_LIMIT
          ? html`
              <p class="limit-note">
                ${this.content.layers.length > AUTHORING_LAYER_LIMIT
                  ? `This loaded effect has ${this.content.layers.length} layers. All are preserved, but adding and copying are unavailable while five or more remain.`
                  : "Advanced effects can author up to five layers."}
              </p>
            `
          : nothing}
      </section>

      <section
        id="advanced-layer-panel"
        role="tabpanel"
        aria-labelledby="advanced-layer-tab-${this.controller.activeLayerIndex}"
      >
        <div class="control-grid">
          ${this.renderAppliedArea(layer)}
          ${this.renderPalette(layer)}
          ${renderDistribution(
            layer,
            this.disabled,
            (update) =>
              this.applyContentChange(
                this.controller.updateNested("distribution", update),
              ),
            (update) => this.updateLayer(update),
          )}
          ${this.renderBrightness(layer)}
          ${this.renderMovement(
            layer,
            "selected_movement",
            "Move effect within applied area",
            true,
          )}
          ${this.renderMovement(
            layer,
            "overall_movement",
            "Move entire layer",
            false,
          )}
          ${this.renderPriority(layer)}
        </div>
      </section>
    `;
  }

  private renderEmptyLayers() {
    return html`
      <section class="card empty-state" role="status">
        <h3 class="section-title">No layer records</h3>
        <p class="muted">
          This layered content contains no layer records. It remains preserved
          until you add one.
        </p>
        <button
          class="add-button"
          type="button"
          ?disabled=${this.disabled}
          @click=${this.addLayer}
        >
          Add layer
        </button>
      </section>
    `;
  }

  private get activeLayer(): EffectLayer {
    return this.controller.activeLayer;
  }

  private renderAppliedArea(layer: EffectLayer) {
    return html`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <govee-applied-area-control
          .layer=${layer}
          .disabled=${this.disabled}
          .segmentCount=${this.segmentCount}
          @area-changed=${(event: CustomEvent<AppliedAreaChange>) =>
            this.applyContentChange(
              this.controller.replaceActiveLayer(event.detail.layer),
              event.detail.interaction,
            )}
        ></govee-applied-area-control>
        ${renderSelectionControls(
          layer,
          this.disabled,
          (update) =>
            this.applyContentChange(
              this.controller.updateNested("selection", update),
            ),
        )}
      </section>
    `;
  }

  private renderPalette(layer: EffectLayer) {
    return html`
      <section class="card">
        <h3 class="section-title">Colours</h3>
        <govee-palette-editor
          .palette=${layer.palette}
          .minColours=${1}
          .maxColours=${AUTHORING_PALETTE_LIMIT}
          .disabled=${this.disabled}
          @palette-changed=${(event: CustomEvent<{ palette: RGB[] }>) =>
            this.applyContentChange(
              this.controller.updatePalette(event.detail.palette),
            )}
        ></govee-palette-editor>
        ${layer.palette.length > AUTHORING_PALETTE_LIMIT
          ? html`
              <p class="muted">
                All ${layer.palette.length} loaded colours are preserved.
                Adding remains unavailable until fewer than eight remain.
              </p>
            `
          : nothing}
      </section>
    `;
  }

  private renderBrightness(layer: EffectLayer) {
    if (layer.brightness_patterns.length === 0) {
      return html`
        <section class="card wide-card empty-state" role="status">
          <h3 class="section-title">No brightness pattern records</h3>
          <p class="muted">
            This layer contains no brightness pattern records. It remains
            preserved until you add one.
          </p>
          <button
            class="add-button"
            type="button"
            ?disabled=${this.disabled}
            @click=${this.addBrightnessPattern}
          >
            Add brightness pattern
          </button>
        </section>
      `;
    }
    const activeIndex = this.controller.visiblePatternIndex(
      layer.brightness_patterns.length,
    );
    const pattern = layer.brightness_patterns[activeIndex];
    const knownOrder = isKnownBrightnessOrder(pattern.order);
    return html`
      <section class="card wide-card">
        <h3 class="section-title">Brightness</h3>
        <label class="field brightness-style">
          <span>Brightness style</span>
          <select
            .value=${layer.brightness_gradient ? "gradient" : "unified"}
            ?disabled=${this.disabled}
            @change=${(event: Event) =>
              this.updateLayer({
                brightness_gradient:
                  (event.target as HTMLSelectElement).value === "gradient",
              })}
          >
            <option value="unified">Unified</option>
            <option value="gradient">Gradient</option>
          </select>
        </label>

        <div class="patterns-heading">
          <h4>Brightness patterns</h4>
          <button
            class="secondary pattern-delete"
            type="button"
            ?disabled=${this.disabled ||
            layer.brightness_patterns.length === 1}
            @click=${this.deleteBrightnessPattern}
          >
            Delete
          </button>
        </div>
        <govee-reorderable-strip
          class="pattern-strip"
          .items=${layer.brightness_patterns.map((_item, index) => ({
            key: `pattern-${index}`,
            label: `Pattern ${index + 1}`,
            ariaLabel: `Pattern ${index + 1}`,
            id: `advanced-pattern-tab-${index}`,
            ariaControls: "advanced-pattern-panel",
          }))}
          .activeIndex=${activeIndex}
          ariaLabel="Brightness patterns"
          itemRole="tab"
          addLabel="Add brightness pattern"
          .addDisabled=${this.disabled}
          .addHidden=${layer.brightness_patterns.length >= 3}
          .reorderDisabled=${true}
          @item-selected=${(event: CustomEvent<{ index: number }>) =>
            this.selectPattern(event.detail.index)}
          @item-added=${this.addBrightnessPattern}
        ></govee-reorderable-strip>

        <div
          class="brightness-fields"
          id="advanced-pattern-panel"
          role="tabpanel"
          aria-labelledby="advanced-pattern-tab-${activeIndex}"
        >
          <label class="field">
            <span>Order</span>
            <select
              aria-label="Brightness order"
              ?disabled=${this.disabled}
              @change=${(event: Event) =>
                this.updateBrightnessPattern({
                  order: Number((event.target as HTMLSelectElement).value),
                })}
            >
              ${KNOWN_BRIGHTNESS_ORDERS.map(
                (order) =>
                  html`<option
                    value=${order}
                    .selected=${pattern.order === order}
                  >
                    ${BRIGHTNESS_LABELS[order]}
                  </option>`,
              )}
              ${!knownOrder
                ? html`<option value="" disabled .selected=${true}>
                    Choose an order
                  </option>`
                : nothing}
            </select>
          </label>
          ${BRIGHTNESS_RANGES.map(([label, key]) =>
            renderRangeField(
              label,
              pattern[key],
              (value) => this.updateBrightnessPattern({ [key]: value }),
              this.disabled,
            ),
          )}
        </div>
      </section>
    `;
  }

  private renderMovement(
    layer: EffectLayer,
    key: "selected_movement" | "overall_movement",
    label: string,
    showEnterExit: boolean,
  ) {
    const movement = layer[key];
    return html`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">${label}</h3>
          <govee-switch-control
            .label=${`${label} enabled`}
            .checked=${movement.enabled}
            .disabled=${this.disabled}
            @checked-changed=${(
              event: CustomEvent<SwitchControlChange>,
            ) =>
              this.updateMovement(
                key,
                { enabled: event.detail.checked },
                `${label} ${event.detail.checked ? "enabled" : "disabled"}.`,
              )}
          ></govee-switch-control>
        </div>
        ${movement.enabled
          ? html`
              ${renderNumberField(
                "ICs per step",
                movement.distance,
                (value) =>
                  this.updateMovement(
                    key,
                    { distance: value },
                    `${label} distance ${value}.`,
                  ),
                this.disabled,
              )}
              <label class="field">
                <span>Direction</span>
                <select
                  ?disabled=${this.disabled}
                  @change=${(event: Event) => {
                    const direction = Number(
                      (event.target as HTMLSelectElement).value,
                    );
                    this.updateMovement(
                      key,
                      { direction },
                      `${label} direction ${MOVEMENT_LABELS[direction]}.`,
                    );
                  }}
                >
                  ${Object.entries(MOVEMENT_LABELS).map(
                    ([value, direction]) =>
                      html`<option
                        value=${value}
                        .selected=${movement.direction === Number(value)}
                      >
                        ${direction}
                      </option>`,
                  )}
                </select>
              </label>
              ${renderRangeField(
                "Speed",
                movement.speed,
                (value) =>
                  this.updateMovement(
                    key,
                    { speed: value },
                    `${label} speed ${bytePercent(value)} per cent.`,
                  ),
                this.disabled,
              )}
              ${showEnterExit
                ? html`
                    <govee-checkbox-control
                      class="movement-enter-exit"
                      label="Pause before re-entering"
                      .checked=${movement.enter_exit}
                      .disabled=${this.disabled}
                      @checked-changed=${(
                        event: CustomEvent<CheckboxControlChange>,
                      ) => {
                        const enterExit = event.detail.checked;
                        this.updateMovement(
                          key,
                          { enter_exit: enterExit },
                          `${label} pause before re-entering ${enterExit
                            ? "enabled"
                            : "disabled"}.`,
                        );
                      }}
                    ></govee-checkbox-control>
                  `
                : nothing}
            `
          : nothing}
      </section>
    `;
  }

  private renderPriority(layer: EffectLayer) {
    return html`
      <section class="card">
        <h3 class="section-title">Priority</h3>
        <govee-segmented-control
          class="priority-control"
          label="Priority"
          .value=${layer.priority}
          .options=${PRIORITY_OPTIONS}
          .disabled=${this.disabled}
          .hideLabel=${true}
          @value-changed=${(
            event: CustomEvent<SegmentedControlChange<number>>,
          ) => this.updateLayer({ priority: event.detail.value })}
        ></govee-segmented-control>
      </section>
    `;
  }

  private updateLayer(update: Partial<EffectLayer>, interaction?: LivePreviewInteraction): void {
    this.applyContentChange(this.controller.updateLayer(update), interaction);
  }

  private updateBrightnessPattern(update: Partial<BrightnessPattern>): void {
    this.applyContentChange(this.controller.updateBrightnessPattern(update));
  }

  private updateMovement(key: MovementKey, update: Partial<Movement>, announcement?: string): void {
    this.applyContentChange(this.controller.updateNested(key, update));
    if (announcement) {
      this.movementAnnouncement = announcement;
    }
  }

  private addLayer(): void {
    this.applyLayerChange(this.controller.addLayer());
  }

  private copyLayer(): void {
    this.applyLayerChange(this.controller.copyLayer());
  }

  private deleteLayer(): void {
    this.applyLayerChange(this.controller.deleteLayer());
  }

  private reorderLayer(from: number, to: number): void {
    this.applySelectionChange(this.controller.reorderLayer(from, to));
  }

  private addBrightnessPattern(): void {
    this.applySelectionChange(this.controller.addBrightnessPattern());
  }

  private deleteBrightnessPattern(): void {
    this.applySelectionChange(this.controller.deleteBrightnessPattern());
  }

  private selectLayer(index: number): void {
    if (this.controller.selectLayer(index)) {
      this.requestUpdate();
    }
  }

  private selectPattern(index: number): void {
    if (this.controller.selectPattern(index)) {
      this.requestUpdate();
    }
  }

  private focusActiveTab(): void {
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector<GoveeReorderableStrip>("govee-reorderable-strip")
        ?.focusItem(this.controller.activeLayerIndex);
    });
  }

  private readonly capturePreviewInteraction = (event: Event): void => {
    const source = event.composedPath()[0];
    if (
      event.type === "value-changed" &&
      source instanceof HTMLElement &&
      source.tagName === "GOVEE-SLIDER-CONTROL"
    ) {
      this.previewInteraction = "changing";
      return;
    }
    if (event.type === "palette-changed") {
      const interaction = (
        event as CustomEvent<{ interaction?: LivePreviewInteraction }>
      ).detail.interaction;
      if (interaction) {
        this.previewInteraction = interaction;
      }
    }
  };

  private applyLayerChange(content: AdvancedContent | undefined): void {
    if (this.applySelectionChange(content)) {
      this.focusActiveTab();
    }
  }

  private applySelectionChange(content: AdvancedContent | undefined): boolean {
    if (!this.applyContentChange(content)) {
      return false;
    }
    this.requestUpdate();
    return true;
  }

  private applyContentChange(content: AdvancedContent | undefined, interaction?: LivePreviewInteraction): boolean {
    if (!content) {
      return false;
    }
    if (this.controller.isCurrentContent(content)) {
      this.content = content;
    }
    this.emitContent(content, interaction);
    return true;
  }

  private emitContent(
    content: AdvancedContent,
    interaction: LivePreviewInteraction = this.previewInteraction,
  ): void {
    this.previewInteraction = "committed";
    this.dispatchEvent(
      new CustomEvent<{
        content: AdvancedContent;
        interaction: LivePreviewInteraction;
      }>("content-changed", {
        detail: { content, interaction },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = advancedEffectEditorStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-advanced-effect-editor": GoveeAdvancedEffectEditor;
  }
}

if (!customElements.get("govee-advanced-effect-editor")) {
  customElements.define(
    "govee-advanced-effect-editor",
    GoveeAdvancedEffectEditor,
  );
}
