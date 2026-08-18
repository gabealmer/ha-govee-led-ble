import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  blankBrightnessPattern,
  blankLayer,
  bytePercent,
  cloneLayer,
  hexByte,
  isKnownBrightnessOrder,
  isKnownSelectionType,
  KNOWN_BRIGHTNESS_ORDERS,
  KNOWN_SELECTION_TYPES,
  parseHexByte,
} from "./advanced-effect-model";
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
import type { SliderControlChange } from "./slider-control";
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
  SelectionType,
} from "./types";
import { clampInteger, relocatedIndex } from "./ui-utils";

const AUTHORING_LAYER_LIMIT = 5;
const AUTHORING_PALETTE_LIMIT = 8;
const DEFAULT_SEGMENT_COUNT = 15;

const PRIORITY_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value,
  label: String(value),
})) satisfies readonly SegmentedControlOption<number>[];

const SELECTION_LABELS: Record<SelectionType, string> = {
  0: "Segment",
  1: "Continuous",
  2: "Random",
  3: "Custom",
};

const BRIGHTNESS_LABELS: Record<BrightnessOrder, string> = {
  0: "Brightest to darkest",
  1: "Brightest, darkest, brightest",
  2: "Darkest to brightest",
  3: "Darkest, brightest, darkest",
};

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
  private activeLayerIndex = 0;

  @state()
  private activePatternIndex = 0;

  @state()
  private movementAnnouncement = "";

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
    if (!changed.has("content") || !this.content) {
      return;
    }
    if (this.content.layers.length === 0) {
      this.activeLayerIndex = 0;
      this.activePatternIndex = 0;
      return;
    }
    this.activeLayerIndex = clampInteger(
      this.activeLayerIndex,
      0,
      this.content.layers.length - 1,
    );
    if (this.activeLayer.brightness_patterns.length === 0) {
      this.activePatternIndex = 0;
      return;
    }
    this.activePatternIndex = clampInteger(
      this.activePatternIndex,
      0,
      this.activeLayer.brightness_patterns.length - 1,
    );
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
            .activeIndex=${this.activeLayerIndex}
            ariaLabel="Effect layers"
            itemRole="tab"
            addLabel="Add layer"
            .addDisabled=${this.disabled ||
            this.content.layers.length >= AUTHORING_LAYER_LIMIT}
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
        aria-labelledby="advanced-layer-tab-${this.activeLayerIndex}"
      >
        <div class="control-grid">
          ${this.renderAppliedArea(layer)}
          ${this.renderPalette(layer)}
          ${this.renderDistribution(layer)}
          ${this.renderBrightness(layer)}
          ${this.renderMovement(
            layer,
            "selected_movement",
            "Move selected pattern",
          )}
          ${this.renderMovement(
            layer,
            "overall_movement",
            "Move whole layer",
          )}
          ${this.renderPriority(layer)}
          ${this.renderRawValues(layer)}
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
    return this.content!.layers[this.activeLayerIndex];
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
            this.replaceActiveLayer(
              event.detail.layer,
              event.detail.interaction,
            )}
        ></govee-applied-area-control>
        ${this.renderSelectionControls(layer)}
      </section>
    `;
  }

  private renderSelectionControls(layer: EffectLayer) {
    const selection = layer.selection;
    const knownType = isKnownSelectionType(selection.type);
    return html`
      <div class="selection-controls">
        <span class="parameter-label">Selection</span>
        <label class="field">
          <span>Type</span>
          <select
            aria-label="Selection type"
            .value=${String(selection.type)}
            ?disabled=${this.disabled}
            @change=${(event: Event) =>
              this.updateSelection({
                type: Number((event.target as HTMLSelectElement).value),
              })}
          >
            ${KNOWN_SELECTION_TYPES.map(
              (value) =>
                html`<option
                  value=${value}
                  .selected=${selection.type === value}
                >
                  ${SELECTION_LABELS[value]}
                </option>`,
            )}
            ${!knownType
              ? html`
                  <option value=${selection.type} .selected=${true}>
                    Raw type ${selection.type} (0x${hexByte(selection.type)})
                  </option>
                `
              : nothing}
          </select>
        </label>
        ${!knownType
          ? html`
              <p class="muted">
                Selection type ${selection.type} is not defined by the known
                schema. Its raw value and parameters remain preserved.
              </p>
              ${this.byteNumberField(
                "Type (raw byte)",
                selection.type,
                (value) => this.updateSelection({ type: value }),
              )}
            `
          : nothing}
        ${selection.type === 0
          ? html`
              ${this.byteNumberField(
                "Segments",
                selection.param_2,
                (value) => this.updateSelection({ param_2: value }),
              )}
              ${this.byteNumberField(
                "Parameter 1 (raw byte)",
                selection.param_1,
                (value) => this.updateSelection({ param_1: value }),
              )}
            `
          : selection.type === 1
            ? html`
                ${this.byteNumberField(
                  "Count",
                  selection.param_2,
                  (value) => this.updateSelection({ param_2: value }),
                )}
                ${this.byteNumberField(
                  "Parameter 1 (raw byte)",
                  selection.param_1,
                  (value) => this.updateSelection({ param_1: value }),
                )}
              `
            : selection.type === 2
              ? html`
                  ${this.byteNumberField(
                    "Minimum",
                    selection.param_2,
                    (value) => this.updateSelection({ param_2: value }),
                  )}
                  ${this.byteNumberField(
                    "Maximum",
                    selection.param_1,
                    (value) => this.updateSelection({ param_1: value }),
                  )}
                `
              : selection.type === 3
                ? html`
                  ${this.byteNumberField(
                    "Lit length",
                    selection.param_1,
                    (value) => this.updateSelection({ param_1: value }),
                  )}
                  ${this.byteNumberField(
                    "Gap",
                    selection.param_2,
                    (value) => this.updateSelection({ param_2: value }),
                  )}
                `
                : html`
                    ${this.byteNumberField(
                      "Parameter 1 (raw byte)",
                      selection.param_1,
                      (value) => this.updateSelection({ param_1: value }),
                    )}
                    ${this.byteNumberField(
                      "Parameter 2 (raw byte)",
                      selection.param_2,
                      (value) => this.updateSelection({ param_2: value }),
                    )}
                  `}
      </div>
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
            this.updateLayer({
              palette: event.detail.palette.map(
                (colour) => [...colour] as RGB,
              ),
            })}
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

  private renderDistribution(layer: EffectLayer) {
    const method = layer.distribution.method;
    return html`
      <section class="card">
        <h3 class="section-title">Distribution</h3>
        <label class="field">
          <span>Method</span>
          <select
            .value=${String(method)}
            ?disabled=${this.disabled}
            @change=${(event: Event) =>
              this.updateLayer({
                distribution: {
                  ...layer.distribution,
                  method: Number(
                    (event.target as HTMLSelectElement).value,
                  ),
                },
              })}
          >
            <option value="0">Unified</option>
            <option value="1">By IC</option>
            <option value="2">By segment</option>
            ${method > 2
              ? html`<option value=${method}>Raw method ${method}</option>`
              : nothing}
          </select>
        </label>
        ${method > 2
          ? this.numberField(
              "Method (raw 7-bit value)",
              method,
              0,
              127,
              (value) =>
                this.updateLayer({
                  distribution: {
                    ...layer.distribution,
                    method: value,
                  },
                }),
            )
          : nothing}
        ${method !== 0
          ? html`
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${layer.distribution.backwards
                    ? "backwards"
                    : "forwards"}
                  ?disabled=${this.disabled}
                  @change=${(event: Event) =>
                    this.updateLayer({
                      distribution: {
                        ...layer.distribution,
                        backwards:
                          (event.target as HTMLSelectElement).value ===
                          "backwards",
                      },
                    })}
                >
                  <option value="forwards">Forward</option>
                  <option value="backwards">Backward</option>
                </select>
              </label>
            `
          : nothing}
        ${this.rangeField(
          "Colour speed",
          layer.colour_speed,
          0,
          255,
          (value) => this.updateLayer({ colour_speed: value }),
        )}
        ${this.rangeField(
          "Colour retention",
          layer.colour_retention,
          0,
          255,
          (value) => this.updateLayer({ colour_retention: value }),
        )}
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
    const activeIndex = clampInteger(
      this.activePatternIndex,
      0,
      layer.brightness_patterns.length - 1,
    );
    const pattern = layer.brightness_patterns[activeIndex];
    const knownOrder = isKnownBrightnessOrder(pattern.order);
    return html`
      <section class="card wide-card">
        <h3 class="section-title">Brightness</h3>
        <govee-segmented-control
          .label=${"Distribution"}
          .value=${layer.brightness_gradient}
          .options=${[
            { value: false, label: "Unified" },
            { value: true, label: "Gradient" },
          ]}
          .disabled=${this.disabled}
          @value-changed=${(
            event: CustomEvent<SegmentedControlChange<boolean>>,
          ) =>
            this.updateLayer({
              brightness_gradient: event.detail.value,
            })}
        ></govee-segmented-control>

        <div class="pattern-toolbar">
          <div
            class="pattern-tabs"
            role="tablist"
            aria-label="Brightness patterns"
          >
            ${layer.brightness_patterns.map(
              (_item, index) => html`
                <button
                  class=${index === activeIndex ? "selected" : ""}
                  type="button"
                  role="tab"
                  aria-selected=${index === activeIndex}
                  tabindex=${index === activeIndex ? "0" : "-1"}
                  @click=${() => {
                    this.activePatternIndex = index;
                  }}
                  @keydown=${(event: KeyboardEvent) =>
                    this.patternTabKeyPressed(index, event)}
                >
                  Pattern ${index + 1}
                </button>
              `,
            )}
          </div>
          <button
            class="icon-action"
            type="button"
            aria-label="Add brightness pattern"
            ?disabled=${this.disabled ||
            layer.brightness_patterns.length >= 3}
            @click=${this.addBrightnessPattern}
          >
            +
          </button>
          <button
            class="icon-action danger"
            type="button"
            aria-label="Delete brightness pattern"
            ?disabled=${this.disabled ||
            layer.brightness_patterns.length === 1}
            @click=${this.deleteBrightnessPattern}
          >
            −
          </button>
        </div>

        <div class="brightness-fields">
          <label class="field">
            <span>Order</span>
            <select
              aria-label="Brightness order"
              .value=${String(pattern.order)}
              ?disabled=${this.disabled}
              @change=${(event: Event) =>
                this.updateBrightnessPattern({
                  order: Number((event.target as HTMLSelectElement).value),
                })}
            >
              ${KNOWN_BRIGHTNESS_ORDERS.map(
                (order) =>
                  html`<option value=${order}>
                    ${BRIGHTNESS_LABELS[order]}
                  </option>`,
              )}
              ${!knownOrder
                ? html`
                    <option value=${pattern.order} .selected=${true}>
                      Raw order ${pattern.order} (0x${hexByte(pattern.order)})
                    </option>
                  `
                : nothing}
            </select>
          </label>
          ${!knownOrder
            ? html`
                <p class="muted raw-value-note">
                  Brightness order ${pattern.order} is not defined by the
                  known schema. Its raw value remains preserved.
                </p>
                ${this.byteNumberField(
                  "Order (raw byte)",
                  pattern.order,
                  (value) =>
                    this.updateBrightnessPattern({ order: value }),
                )}
              `
            : nothing}
          ${this.rangeField(
            "Scope low",
            pattern.scope_low,
            0,
            255,
            (value) => this.updateBrightnessPattern({ scope_low: value }),
          )}
          ${this.rangeField(
            "Scope high",
            pattern.scope_high,
            0,
            255,
            (value) => this.updateBrightnessPattern({ scope_high: value }),
          )}
          ${this.rangeField(
            "Changing speed",
            pattern.change_speed,
            0,
            255,
            (value) => this.updateBrightnessPattern({ change_speed: value }),
          )}
          ${this.rangeField(
            "Brightest retention",
            pattern.brightest_retention,
            0,
            255,
            (value) =>
              this.updateBrightnessPattern({
                brightest_retention: value,
              }),
          )}
          ${this.rangeField(
            "Darkest retention",
            pattern.darkest_retention,
            0,
            255,
            (value) =>
              this.updateBrightnessPattern({
                darkest_retention: value,
              }),
          )}
        </div>
      </section>
    `;
  }

  private renderMovement(
    layer: EffectLayer,
    key: "selected_movement" | "overall_movement",
    label: string,
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
              ${this.byteNumberField("Distance", movement.distance, (value) =>
                this.updateMovement(
                  key,
                  { distance: value },
                  `${label} distance ${value}.`,
                ),
              )}
              <label class="field">
                <span>Direction</span>
                <select
                  .value=${String(movement.direction)}
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
                      html`<option value=${value}>${direction}</option>`,
                  )}
                </select>
              </label>
              ${this.rangeField(
                "Speed",
                movement.speed,
                0,
                255,
                (value) =>
                  this.updateMovement(
                    key,
                    { speed: value },
                    `${label} speed ${bytePercent(value)} per cent.`,
                  ),
              )}
              <govee-checkbox-control
                class="movement-enter-exit"
                label="Enter and exit"
                .checked=${movement.enter_exit}
                .disabled=${this.disabled}
                @checked-changed=${(
                  event: CustomEvent<CheckboxControlChange>,
                ) => {
                    const enterExit = event.detail.checked;
                    this.updateMovement(
                      key,
                      { enter_exit: enterExit },
                      `${label} enter and exit ${enterExit
                        ? "enabled"
                        : "disabled"}.`,
                    );
                  }}
              ></govee-checkbox-control>
            `
          : nothing}
      </section>
    `;
  }

  private renderPriority(layer: EffectLayer) {
    const enabled = layer.priority !== 0;
    return html`
      <section class="card">
        <div class="card-heading">
          <h3 class="section-title">Priority</h3>
          <govee-switch-control
            label="Layer priority enabled"
            .checked=${enabled}
            .disabled=${this.disabled}
            @checked-changed=${(
              event: CustomEvent<SwitchControlChange>,
            ) =>
              this.updateLayer({ priority: event.detail.checked ? 1 : 0 })}
          ></govee-switch-control>
        </div>
        ${enabled
          ? html`
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
              ${layer.priority > 5
                ? this.byteNumberField(
                    "Priority (raw byte)",
                    layer.priority,
                    (value) => this.updateLayer({ priority: value }),
                  )
                : nothing}
            `
          : nothing}
      </section>
    `;
  }

  private renderRawValues(layer: EffectLayer) {
    return html`
      <section class="card wide-card">
        <details>
          <summary>Preserved wire values</summary>
          <p class="muted">
            These fields are retained losslessly. Change them only when you
            know the source byte values.
          </p>
          <div class="raw-grid">
            ${this.hexByteField(
              "Layer flags",
              layer.unknown_flags,
              (value) => this.updateLayer({ unknown_flags: value }),
              0xfd,
            )}
            ${this.hexByteField(
              "Selected movement flags",
              layer.selected_movement.unknown_flags,
              (value) =>
                this.updateMovement("selected_movement", {
                  unknown_flags: value,
                }),
              0xe8,
            )}
            ${this.hexByteField(
              "Whole-layer movement flags",
              layer.overall_movement.unknown_flags,
              (value) =>
                this.updateMovement("overall_movement", {
                  unknown_flags: value,
                }),
              0xe8,
            )}
            ${this.numberField(
              "Applied-area start (raw nibble)",
              layer.area.start_tenths,
              0,
              15,
              (value) =>
                this.updateLayer({
                  area: { ...layer.area, start_tenths: value },
                }),
            )}
            ${this.numberField(
              "Applied-area width (raw nibble)",
              layer.area.width_tenths,
              0,
              15,
              (value) =>
                this.updateLayer({
                  area: { ...layer.area, width_tenths: value },
                }),
            )}
            <label class="field">
              <span>Excess bytes (hex)</span>
              <input
                type="text"
                inputmode="text"
                spellcheck="false"
                .value=${layer.excess}
                ?disabled=${this.disabled}
                @change=${(event: Event) =>
                  this.excessChanged(event.target as HTMLInputElement)}
              />
            </label>
          </div>
        </details>
      </section>
    `;
  }

  private rangeField(
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    changed: (value: number) => void,
  ) {
    return html`
      <govee-slider-control
        .label=${label}
        .value=${value}
        .minimum=${minimum}
        .maximum=${maximum}
        .disabled=${this.disabled}
        @value-changed=${(event: CustomEvent<SliderControlChange>) =>
          changed(event.detail.value)}
      ></govee-slider-control>
    `;
  }

  private byteNumberField(
    label: string,
    value: number,
    changed: (value: number) => void,
  ) {
    return this.numberField(label, value, 0, 255, changed);
  }

  private numberField(
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    changed: (value: number) => void,
  ) {
    return html`
      <label class="field">
        <span>${label}</span>
        <input
          type="number"
          min=${minimum}
          max=${maximum}
          .value=${String(value)}
          ?disabled=${this.disabled}
          @change=${(event: Event) =>
            changed(
              clampInteger(
                Number((event.target as HTMLInputElement).value),
                minimum,
                maximum,
              ),
            )}
        />
      </label>
    `;
  }

  private hexByteField(
    label: string,
    value: number,
    changed: (value: number) => void,
    allowedMask = 0xff,
  ) {
    return html`
      <label class="field">
        <span>${label}</span>
        <input
          type="text"
          inputmode="text"
          spellcheck="false"
          .value=${hexByte(value)}
          ?disabled=${this.disabled}
          @change=${(event: Event) => {
            const input = event.target as HTMLInputElement;
            const parsed = parseHexByte(input.value);
            if (parsed === undefined) {
              input.setCustomValidity("Enter one byte from 00 to FF.");
              input.reportValidity();
              return;
            }
            if ((parsed & ~allowedMask) !== 0) {
              input.setCustomValidity(
                `Known flag bits are controlled elsewhere. Allowed mask: ${hexByte(
                  allowedMask,
                )}.`,
              );
              input.reportValidity();
              return;
            }
            input.setCustomValidity("");
            changed(parsed);
          }}
        />
      </label>
    `;
  }

  private updateLayer(
    update: Partial<EffectLayer>,
    interaction?: LivePreviewInteraction,
  ): void {
    if (!this.content || this.disabled) {
      return;
    }
    const layers = this.content.layers.map((layer, index) =>
      index === this.activeLayerIndex
        ? cloneLayer({ ...layer, ...update })
        : cloneLayer(layer),
    );
    this.emitContent({ kind: "advanced", layers }, interaction);
  }

  private replaceActiveLayer(
    replacement: EffectLayer,
    interaction: LivePreviewInteraction,
  ): void {
    if (!this.content || this.disabled) {
      return;
    }
    const layers = this.content.layers.map((layer, index) =>
      index === this.activeLayerIndex
        ? cloneLayer(replacement)
        : cloneLayer(layer),
    );
    this.emitContent({ kind: "advanced", layers }, interaction);
  }

  private updateSelection(
    update: Partial<EffectLayer["selection"]>,
  ): void {
    this.updateLayer({
      selection: { ...this.activeLayer.selection, ...update },
    });
  }

  private updateBrightnessPattern(
    update: Partial<BrightnessPattern>,
  ): void {
    const patterns = this.activeLayer.brightness_patterns.map(
      (pattern, index) =>
        index === this.activePatternIndex
          ? { ...pattern, ...update }
          : { ...pattern },
    );
    this.updateLayer({ brightness_patterns: patterns });
  }

  private updateMovement(
    key: "selected_movement" | "overall_movement",
    update: Partial<Movement>,
    announcement?: string,
  ): void {
    this.updateLayer({
      [key]: { ...this.activeLayer[key], ...update },
    });
    if (announcement) {
      this.movementAnnouncement = announcement;
    }
  }

  private addLayer(): void {
    if (
      !this.content ||
      this.disabled ||
      this.content.layers.length >= AUTHORING_LAYER_LIMIT
    ) {
      return;
    }
    const layers = [
      ...this.content.layers.map(cloneLayer),
      blankLayer(),
    ];
    this.installContent({ kind: "advanced", layers });
    this.activeLayerIndex = layers.length - 1;
    this.activePatternIndex = 0;
    this.focusActiveTab();
  }

  private copyLayer(): void {
    if (
      !this.content ||
      this.disabled ||
      this.content.layers.length >= AUTHORING_LAYER_LIMIT
    ) {
      return;
    }
    const layers = this.content.layers.map(cloneLayer);
    layers.splice(
      this.activeLayerIndex + 1,
      0,
      cloneLayer(this.activeLayer),
    );
    this.installContent({ kind: "advanced", layers });
    this.activeLayerIndex += 1;
    this.activePatternIndex = 0;
    this.focusActiveTab();
  }

  private deleteLayer(): void {
    if (!this.content || this.disabled || this.content.layers.length === 1) {
      return;
    }
    const layers = this.content.layers
      .filter((_layer, index) => index !== this.activeLayerIndex)
      .map(cloneLayer);
    this.activeLayerIndex = Math.min(
      this.activeLayerIndex,
      layers.length - 1,
    );
    this.activePatternIndex = 0;
    this.emitContent({ kind: "advanced", layers });
    this.focusActiveTab();
  }

  private reorderLayer(from: number, to: number): void {
    if (!this.content || this.disabled) {
      return;
    }
    if (
      from < 0 ||
      from >= this.content.layers.length ||
      to < 0 ||
      to >= this.content.layers.length ||
      from === to
    ) {
      return;
    }
    const layers = this.content.layers.map(cloneLayer);
    const [moving] = layers.splice(from, 1);
    layers.splice(to, 0, moving);
    this.activeLayerIndex = relocatedIndex(
      this.activeLayerIndex,
      from,
      to,
    );
    this.emitContent({ kind: "advanced", layers });
  }

  private addBrightnessPattern(): void {
    if (
      this.disabled ||
      this.activeLayer.brightness_patterns.length >= 3
    ) {
      return;
    }
    const patterns = [
      ...this.activeLayer.brightness_patterns.map((pattern) => ({
        ...pattern,
      })),
      blankBrightnessPattern(),
    ];
    this.activePatternIndex = patterns.length - 1;
    this.updateLayer({ brightness_patterns: patterns });
  }

  private deleteBrightnessPattern(): void {
    if (
      this.disabled ||
      this.activeLayer.brightness_patterns.length === 1
    ) {
      return;
    }
    const patterns = this.activeLayer.brightness_patterns
      .filter((_pattern, index) => index !== this.activePatternIndex)
      .map((pattern) => ({ ...pattern }));
    this.activePatternIndex = Math.min(
      this.activePatternIndex,
      patterns.length - 1,
    );
    this.updateLayer({ brightness_patterns: patterns });
  }

  private selectLayer(index: number): void {
    if (index === this.activeLayerIndex) {
      return;
    }
    this.activeLayerIndex = index;
    this.activePatternIndex = 0;
  }

  private patternTabKeyPressed(
    index: number,
    event: KeyboardEvent,
  ): void {
    const count = this.activeLayer.brightness_patterns.length;
    let next: number | undefined;
    if (event.key === "ArrowLeft") {
      next = index === 0 ? count - 1 : index - 1;
    } else if (event.key === "ArrowRight") {
      next = index === count - 1 ? 0 : index + 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    }
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    this.activePatternIndex = next;
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelectorAll<HTMLButtonElement>(".pattern-tabs button")
        [next!]?.focus();
    });
  }

  private focusActiveTab(): void {
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector<GoveeReorderableStrip>("govee-reorderable-strip")
        ?.focusItem(this.activeLayerIndex);
    });
  }

  private excessChanged(input: HTMLInputElement): void {
    const value = input.value.replace(/\s+/g, "").toLowerCase();
    if (!/^(?:[0-9a-f]{2})*$/.test(value)) {
      input.setCustomValidity("Enter an even number of hexadecimal digits.");
      input.reportValidity();
      return;
    }
    input.setCustomValidity("");
    this.updateLayer({ excess: value });
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

  private installContent(content: AdvancedContent): void {
    this.content = content;
    this.emitContent(content);
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
