import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

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
import {
  studioActionStyles,
  studioBaseStyles,
  studioCardStyles,
  studioFormStyles,
  studioVisuallyHiddenStyles,
} from "./studio-styles";
import type {
  AdvancedContent,
  BrightnessOrder,
  BrightnessPattern,
  EffectLayer,
  LayeredSceneContent,
  Movement,
  RGB,
  SelectionType,
} from "./types";
import { relocatedIndex, rgbToHex } from "./ui-utils";

const AUTHORING_LAYER_LIMIT = 5;
const AUTHORING_PALETTE_LIMIT = 8;
const DEFAULT_SEGMENT_COUNT = 15;
const KNOWN_SELECTION_TYPES: SelectionType[] = [1, 2, 0, 3];
const KNOWN_BRIGHTNESS_ORDERS: BrightnessOrder[] = [0, 1, 2, 3];
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

  @state()
  private layerActionsIndex?: number;

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (!changed.has("content") || !this.content) {
      return;
    }
    if (this.content.layers.length === 0) {
      this.activeLayerIndex = 0;
      this.activePatternIndex = 0;
      return;
    }
    this.activeLayerIndex = clamp(
      this.activeLayerIndex,
      0,
      this.content.layers.length - 1,
    );
    if (this.activeLayer.brightness_patterns.length === 0) {
      this.activePatternIndex = 0;
      return;
    }
    this.activePatternIndex = clamp(
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
        >
          ${this.layerActionsIndex === undefined
            ? nothing
            : html`
                <div
                  slot="item-${this.layerActionsIndex}"
                  class="strip-popover layer-actions-popover"
                  role="dialog"
                  aria-label="Layer actions"
                >
                  <button
                    class="secondary"
                    type="button"
                    ?disabled=${this.disabled ||
                    this.content.layers.length >= AUTHORING_LAYER_LIMIT}
                    @click=${this.copyLayer}
                  >
                    Copy layer
                  </button>
                  <button
                    class="secondary danger"
                    type="button"
                    ?disabled=${this.disabled ||
                    this.content.layers.length === 1}
                    @click=${this.deleteLayer}
                  >
                    Delete layer
                  </button>
                </div>
              `}
        </govee-reorderable-strip>

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
    const areaIsEditable =
      layer.area.start_tenths >= 0 &&
      layer.area.start_tenths <= 9 &&
      layer.area.width_tenths >= 1 &&
      layer.area.width_tenths <= 10 - layer.area.start_tenths;
    const start = clamp(layer.area.start_tenths, 0, 9);
    const end = start + layer.area.width_tenths;
    const segmentCount =
      Number.isInteger(this.segmentCount) && this.segmentCount > 0
        ? this.segmentCount
        : DEFAULT_SEGMENT_COUNT;
    const segmentColour = rgbToHex(layer.palette[0] ?? [47, 111, 237]);
    return html`
      <section class="card wide-card">
        <h3 class="section-title">Applied area</h3>
        <div class="area-control">
          <div
            class="area-segments"
            style="--area-segment-count: ${segmentCount}; --area-colour: ${segmentColour};"
            aria-label="Applied area, ${segmentCount} segments"
          >
            ${Array.from(
              { length: segmentCount },
              (_, index) => html`
                <span
                  class=${areaIsEditable &&
                  segmentOverlapsArea(index, segmentCount, start, end)
                    ? "covered"
                    : ""}
                  aria-hidden="true"
                ></span>
              `,
            )}
          </div>
          ${areaIsEditable
            ? html`
                <div class="area-boundaries">
                  <label class="area-boundary">
                    <span>
                      <span>Left edge</span>
                      <output aria-label="Applied area left edge value"
                        >${start * 10}%</output
                      >
                    </span>
                    <input
                      type="range"
                      min="0"
                      max=${end - 1}
                      step="1"
                      .value=${String(start)}
                      aria-label="Applied area left edge"
                      aria-valuetext="${start * 10}%"
                      ?disabled=${this.disabled}
                      @input=${(event: Event) =>
                        this.setAppliedArea(
                          Number((event.target as HTMLInputElement).value),
                          end,
                        )}
                    />
                  </label>
                  <label class="area-boundary">
                    <span>
                      <span>Right edge</span>
                      <output aria-label="Applied area right edge value"
                        >${end * 10}%</output
                      >
                    </span>
                    <input
                      type="range"
                      min=${start + 1}
                      max="10"
                      step="1"
                      .value=${String(end)}
                      aria-label="Applied area right edge"
                      aria-valuetext="${end * 10}%"
                      ?disabled=${this.disabled}
                      @input=${(event: Event) =>
                        this.setAppliedArea(
                          start,
                          Number((event.target as HTMLInputElement).value),
                        )}
                    />
                  </label>
                </div>
              `
            : nothing}
        </div>
        ${!areaIsEditable
          ? html`
              <p class="muted">
                This loaded layer encodes raw area values: start
                ${layer.area.start_tenths}, width ${layer.area.width_tenths}.
                They remain preserved until replaced.
              </p>
              <button
                class="secondary"
                type="button"
                ?disabled=${this.disabled}
                @click=${() =>
                  this.updateLayer({
                    area: { start_tenths: 0, width_tenths: 10 },
                  })}
              >
                Set full strip
              </button>
            `
          : nothing}
        ${this.renderSelectionControls(layer)}
      </section>
    `;
  }

  private setAppliedArea(start: number, end: number): void {
    this.updateLayer({
      area: {
        start_tenths: start,
        width_tenths: end - start,
      },
    });
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
    const activeIndex = clamp(
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
              clamp(
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

  private updateLayer(update: Partial<EffectLayer>): void {
    if (!this.content || this.disabled) {
      return;
    }
    const layers = this.content.layers.map((layer, index) =>
      index === this.activeLayerIndex
        ? cloneLayer({ ...layer, ...update })
        : cloneLayer(layer),
    );
    this.emitContent({ kind: "advanced", layers });
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
    this.layerActionsIndex = undefined;
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
    this.layerActionsIndex = this.activeLayerIndex;
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
    this.layerActionsIndex = undefined;
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
    if (this.layerActionsIndex !== undefined) {
      this.layerActionsIndex = relocatedIndex(
        this.layerActionsIndex,
        from,
        to,
      );
    }
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
      this.layerActionsIndex =
        this.layerActionsIndex === index ? undefined : index;
      return;
    }
    this.activeLayerIndex = index;
    this.activePatternIndex = 0;
    this.layerActionsIndex = index;
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

  private emitContent(content: AdvancedContent): void {
    this.dispatchEvent(
      new CustomEvent<{ content: AdvancedContent }>("content-changed", {
        detail: { content },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private installContent(content: AdvancedContent): void {
    this.content = content;
    this.emitContent(content);
  }

  static styles = [
    studioBaseStyles,
    studioCardStyles,
    studioActionStyles,
    studioFormStyles,
    studioVisuallyHiddenStyles,
    css`
    :host {
      display: block;
    }

    p {
      margin-top: 0;
    }

    .layer-card {
      margin-bottom: var(--studio-section-gap);
    }

    .card-heading,
    .pattern-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pattern-tabs {
      display: flex;
      flex: 1;
      gap: 6px;
      min-width: 0;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: thin;
    }

    .pattern-tabs button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .pattern-tabs button.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .add-button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--studio-blue);
      background: var(--studio-card);
      font-weight: 600;
      border-style: dashed;
      cursor: pointer;
    }

    .layer-actions-popover {
      --strip-popover-width: 220px;
      display: grid;
      gap: 8px;
    }

    .layer-actions-popover .secondary {
      width: 100%;
    }

    .limit-note,
    .muted {
      color: var(--studio-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .limit-note {
      margin: 12px 0 0;
    }

    .empty-state .add-button {
      margin-top: 12px;
    }

    .control-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .area-control {
      margin-bottom: 16px;
      padding: 4px 0;
    }

    .area-segments {
      display: grid;
      grid-template-columns: repeat(
        var(--area-segment-count),
        minmax(0, 1fr)
      );
      gap: 4px;
    }

    .area-segments span {
      min-width: 0;
      min-height: 48px;
      border: 1px solid
        color-mix(in srgb, var(--area-colour) 35%, var(--studio-border));
      border-radius: 6px;
      background: color-mix(
        in srgb,
        var(--area-colour) 14%,
        var(--studio-card)
      );
    }

    .area-segments span.covered {
      border-color: color-mix(
        in srgb,
        var(--area-colour) 70%,
        #000
      );
      background: var(--area-colour);
    }

    .area-boundaries {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .area-boundary {
      display: grid;
      gap: 8px;
    }

    .area-boundary > span {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      color: var(--studio-muted);
      font-size: var(--studio-parameter-label-size);
      font-weight: var(--studio-parameter-label-weight);
    }

    .area-boundary output {
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .area-boundary input {
      width: 100%;
      min-width: 0;
      min-height: 44px;
      margin: 0;
      accent-color: var(--studio-blue);
    }

    .area-boundary input:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    .selection-controls {
      margin-top: 8px;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
    }

    .selection-controls > .parameter-label {
      display: block;
      margin-bottom: 4px;
    }

    .pattern-toolbar {
      align-items: stretch;
      margin-top: 16px;
    }

    .icon-action {
      flex: 0 0 44px;
      width: 44px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--studio-blue);
      background: var(--studio-card);
      cursor: pointer;
      font-size: 22px;
    }

    .brightness-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 18px;
    }

    .brightness-fields .field:first-child {
      grid-column: 1 / -1;
    }

    .brightness-fields .raw-value-note {
      grid-column: 1 / -1;
      margin: 14px 0 0;
    }

    .card-heading {
      justify-content: space-between;
    }

    .card-heading h3 {
      margin-bottom: 0;
    }

    .movement-enter-exit {
      margin-top: 12px;
    }

    .priority-control {
      margin-top: 16px;
    }

    details summary {
      min-height: 44px;
      color: var(--primary-text-color);
      cursor: pointer;
      font-weight: 650;
    }

    .raw-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 18px;
    }

    @media (max-width: 760px) {
      .control-grid,
      .area-boundaries,
      .brightness-fields,
      .raw-grid {
        grid-template-columns: 1fr;
      }

      .wide-card,
      .brightness-fields .field:first-child {
        grid-column: auto;
      }

      .add-button {
        width: 100%;
      }

    }

    @media (max-width: 480px) {
      .card {
        padding: 16px;
      }

      .secondary {
        min-width: 0;
      }
    }

  `];
}

export function blankAdvancedContent(): AdvancedContent {
  return {
    kind: "advanced",
    layers: [blankLayer()],
  };
}

export function cloneAdvancedContent(
  content: AdvancedContent,
): AdvancedContent {
  return {
    kind: "advanced",
    layers: content.layers.map(cloneLayer),
  };
}

export function cloneLayeredSceneContent(
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

function blankLayer(): EffectLayer {
  return {
    area: {
      start_tenths: 0,
      width_tenths: 10,
    },
    selection: {
      type: 0,
      param_1: 0,
      param_2: 1,
    },
    brightness_gradient: false,
    brightness_patterns: [blankBrightnessPattern()],
    distribution: {
      method: 1,
      backwards: false,
    },
    colour_speed: 128,
    colour_retention: 20,
    palette: [
      [255, 0, 0],
      [0, 0, 255],
    ],
    selected_movement: blankMovement(),
    overall_movement: blankMovement(),
    priority: 0,
    unknown_flags: 0,
    excess: "",
  };
}

function blankBrightnessPattern(): BrightnessPattern {
  return {
    scope_high: 255,
    scope_low: 0,
    order: 0,
    change_speed: 128,
    brightest_retention: 20,
    darkest_retention: 20,
  };
}

function blankMovement(): Movement {
  return {
    enabled: false,
    enter_exit: false,
    direction: 0,
    distance: 1,
    speed: 128,
    unknown_flags: 0,
  };
}

function cloneLayer(layer: EffectLayer): EffectLayer {
  return {
    ...layer,
    area: { ...layer.area },
    selection: { ...layer.selection },
    brightness_patterns: layer.brightness_patterns.map((pattern) => ({
      ...pattern,
    })),
    distribution: { ...layer.distribution },
    palette: layer.palette.map((colour) => [...colour] as RGB),
    selected_movement: { ...layer.selected_movement },
    overall_movement: { ...layer.overall_movement },
  };
}

function isKnownSelectionType(value: number): value is SelectionType {
  return KNOWN_SELECTION_TYPES.includes(value as SelectionType);
}

function isKnownBrightnessOrder(value: number): value is BrightnessOrder {
  return KNOWN_BRIGHTNESS_ORDERS.includes(value as BrightnessOrder);
}

function bytePercent(value: number): number {
  return Math.round((clamp(value, 0, 255) / 255) * 100);
}

function hexByte(value: number): string {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function parseHexByte(value: string): number | undefined {
  const normalised = value.trim().replace(/^0x/i, "");
  if (!/^[0-9a-f]{1,2}$/i.test(normalised)) {
    return undefined;
  }
  return Number.parseInt(normalised, 16);
}

function segmentOverlapsArea(
  index: number,
  segmentCount: number,
  start: number,
  end: number,
): boolean {
  const segmentStart = (index * 10) / segmentCount;
  const segmentEnd = ((index + 1) * 10) / segmentCount;
  return segmentEnd > start && segmentStart < end;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
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
