import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import "./reorderable-strip";
import type {
  GoveeReorderableStrip,
  ReorderableStripItem,
} from "./reorderable-strip";
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

type AreaDragMode = "start" | "end" | "move";

interface AreaDrag {
  pointerId: number;
  mode: AreaDragMode;
  initialStart: number;
  initialEnd: number;
  currentStart: number;
  currentEnd: number;
  originX: number;
  pointerOffsetX: number;
  trackLeft: number;
  trackWidth: number;
  captureTarget: HTMLElement;
}

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

  private areaDrag?: AreaDrag;

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
            class="area-track"
            style="--area-segment-count: ${segmentCount}; --area-colour: ${segmentColour};"
          >
            <div
              class="area-segments"
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
                  <div
                    class="area-selection"
                    style="--area-start: ${start * 10}%; --area-width: ${(end -
                    start) *
                    10}%"
                  >
                    <button
                      class="area-handle area-handle-start"
                      type="button"
                      role="slider"
                      aria-label="Applied area start"
                      aria-orientation="horizontal"
                      aria-valuemin="0"
                      aria-valuemax=${end - 1}
                      aria-valuenow=${start}
                      aria-valuetext="${start * 10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${(event: PointerEvent) =>
                        this.areaPointerStarted(
                          "start",
                          start,
                          end,
                          event,
                        )}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${(event: KeyboardEvent) =>
                        this.areaBoundaryKeyDown(
                          "start",
                          start,
                          end,
                          event,
                        )}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                    <button
                      class="area-selection-body"
                      type="button"
                      aria-label="Move applied area, ${start *
                      10}% to ${end * 10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${(event: PointerEvent) =>
                        this.areaPointerStarted(
                          "move",
                          start,
                          end,
                          event,
                        )}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${(event: KeyboardEvent) =>
                        this.areaPositionKeyDown(start, end, event)}
                    ></button>
                    <button
                      class="area-handle area-handle-end"
                      type="button"
                      role="slider"
                      aria-label="Applied area end"
                      aria-orientation="horizontal"
                      aria-valuemin=${start + 1}
                      aria-valuemax="10"
                      aria-valuenow=${end}
                      aria-valuetext="${end * 10}%"
                      ?disabled=${this.disabled}
                      @pointerdown=${(event: PointerEvent) =>
                        this.areaPointerStarted(
                          "end",
                          start,
                          end,
                          event,
                        )}
                      @pointermove=${this.areaPointerMoved}
                      @pointerup=${this.areaPointerFinished}
                      @pointercancel=${this.areaPointerFinished}
                      @lostpointercapture=${this.areaPointerFinished}
                      @keydown=${(event: KeyboardEvent) =>
                        this.areaBoundaryKeyDown(
                          "end",
                          start,
                          end,
                          event,
                        )}
                    >
                      <span aria-hidden="true"></span>
                    </button>
                  </div>
                `
              : nothing}
          </div>
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

  private areaPointerStarted(
    mode: AreaDragMode,
    start: number,
    end: number,
    event: PointerEvent,
  ): void {
    if (this.disabled) {
      return;
    }
    const track = this.shadowRoot?.querySelector<HTMLElement>(".area-track");
    if (!track) {
      return;
    }
    const bounds = track.getBoundingClientRect();
    if (bounds.width <= 0) {
      return;
    }
    const captureTarget = event.currentTarget as HTMLElement;
    const boundary =
      mode === "start" ? start : mode === "end" ? end : start;
    event.preventDefault();
    event.stopPropagation();
    captureTarget.focus();
    captureTarget.setPointerCapture(event.pointerId);
    this.areaDrag = {
      pointerId: event.pointerId,
      mode,
      initialStart: start,
      initialEnd: end,
      currentStart: start,
      currentEnd: end,
      originX: event.clientX,
      pointerOffsetX:
        mode === "move"
          ? 0
          : event.clientX -
            (bounds.left + (boundary / 10) * bounds.width),
      trackLeft: bounds.left,
      trackWidth: bounds.width,
      captureTarget,
    };
  }

  private areaPointerMoved(event: PointerEvent): void {
    const drag = this.areaDrag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    let nextStart = drag.initialStart;
    let nextEnd = drag.initialEnd;
    if (drag.mode === "move") {
      const width = drag.initialEnd - drag.initialStart;
      const delta = Math.round(
        ((event.clientX - drag.originX) / drag.trackWidth) * 10,
      );
      nextStart = clamp(drag.initialStart + delta, 0, 10 - width);
      nextEnd = nextStart + width;
    } else {
      const boundary = Math.round(
        ((event.clientX -
          drag.pointerOffsetX -
          drag.trackLeft) /
          drag.trackWidth) *
          10,
      );
      if (drag.mode === "start") {
        nextStart = clamp(boundary, 0, drag.initialEnd - 1);
      } else {
        nextEnd = clamp(boundary, drag.initialStart + 1, 10);
      }
    }
    if (
      nextStart === drag.currentStart &&
      nextEnd === drag.currentEnd
    ) {
      return;
    }
    drag.currentStart = nextStart;
    drag.currentEnd = nextEnd;
    this.setAppliedArea(nextStart, nextEnd);
  }

  private areaPointerFinished(event: PointerEvent): void {
    const drag = this.areaDrag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    if (drag.captureTarget.hasPointerCapture(event.pointerId)) {
      drag.captureTarget.releasePointerCapture(event.pointerId);
    }
    this.areaDrag = undefined;
  }

  private areaBoundaryKeyDown(
    boundary: "start" | "end",
    start: number,
    end: number,
    event: KeyboardEvent,
  ): void {
    const minimum = boundary === "start" ? 0 : start + 1;
    const maximum = boundary === "start" ? end - 1 : 10;
    const value = boundary === "start" ? start : end;
    const next = adjustedSliderValue(event.key, value, minimum, maximum);
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    this.setAppliedArea(
      boundary === "start" ? next : start,
      boundary === "end" ? next : end,
    );
  }

  private areaPositionKeyDown(
    start: number,
    end: number,
    event: KeyboardEvent,
  ): void {
    const width = end - start;
    const next = adjustedSliderValue(event.key, start, 0, 10 - width);
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    this.setAppliedArea(next, next + width);
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
          byteOutput(layer.colour_speed),
          (value) => this.updateLayer({ colour_speed: value }),
        )}
        ${this.rangeField(
          "Colour retention",
          layer.colour_retention,
          0,
          255,
          String(layer.colour_retention),
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
        <div
          class="parameter-options"
          role="group"
          aria-label="Brightness distribution"
        >
          <button
            class=${layer.brightness_gradient ? "" : "selected"}
            type="button"
            aria-pressed=${!layer.brightness_gradient}
            ?disabled=${this.disabled}
            @click=${() =>
              this.updateLayer({ brightness_gradient: false })}
          >
            Unified
          </button>
          <button
            class=${layer.brightness_gradient ? "selected" : ""}
            type="button"
            aria-pressed=${layer.brightness_gradient}
            ?disabled=${this.disabled}
            @click=${() =>
              this.updateLayer({ brightness_gradient: true })}
          >
            Gradient
          </button>
        </div>

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
            byteOutput(pattern.scope_low),
            (value) => this.updateBrightnessPattern({ scope_low: value }),
          )}
          ${this.rangeField(
            "Scope high",
            pattern.scope_high,
            0,
            255,
            byteOutput(pattern.scope_high),
            (value) => this.updateBrightnessPattern({ scope_high: value }),
          )}
          ${this.rangeField(
            "Changing speed",
            pattern.change_speed,
            0,
            255,
            byteOutput(pattern.change_speed),
            (value) => this.updateBrightnessPattern({ change_speed: value }),
          )}
          ${this.rangeField(
            "Brightest retention",
            pattern.brightest_retention,
            0,
            255,
            String(pattern.brightest_retention),
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
            String(pattern.darkest_retention),
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
          <button
            class="switch ${movement.enabled ? "on" : ""}"
            type="button"
            role="switch"
            aria-checked=${movement.enabled}
            aria-label="${label} enabled"
            ?disabled=${this.disabled}
            @click=${() =>
              this.updateMovement(
                key,
                { enabled: !movement.enabled },
                `${label} ${movement.enabled ? "disabled" : "enabled"}.`,
              )}
          >
            <span aria-hidden="true"></span>
          </button>
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
                byteOutput(movement.speed),
                (value) =>
                  this.updateMovement(
                    key,
                    { speed: value },
                    `${label} speed ${bytePercent(value)} per cent.`,
                  ),
              )}
              <label class="check-field">
                <input
                  type="checkbox"
                  .checked=${movement.enter_exit}
                  ?disabled=${this.disabled}
                  @change=${(event: Event) => {
                    const enterExit = (event.target as HTMLInputElement)
                      .checked;
                    this.updateMovement(
                      key,
                      { enter_exit: enterExit },
                      `${label} enter and exit ${enterExit
                        ? "enabled"
                        : "disabled"}.`,
                    );
                  }}
                />
                <span>Enter and exit</span>
              </label>
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
          <button
            class="switch ${enabled ? "on" : ""}"
            type="button"
            role="switch"
            aria-checked=${enabled}
            aria-label="Layer priority enabled"
            ?disabled=${this.disabled}
            @click=${() =>
              this.updateLayer({ priority: enabled ? 0 : 1 })}
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
        ${enabled
          ? html`
              <div class="priority-row" role="group" aria-label="Priority">
                ${[1, 2, 3, 4, 5].map(
                  (priority) => html`
                    <button
                      class=${layer.priority === priority ? "selected" : ""}
                      type="button"
                      aria-pressed=${layer.priority === priority}
                      ?disabled=${this.disabled}
                      @click=${() => this.updateLayer({ priority })}
                    >
                      ${priority}
                    </button>
                  `,
                )}
              </div>
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
    output: string,
    changed: (value: number) => void,
  ) {
    return html`
      <label class="range-field">
        <span>${label}</span>
        <input
          type="range"
          min=${minimum}
          max=${maximum}
          .value=${String(clamp(value, minimum, maximum))}
          aria-label=${label}
          ?disabled=${this.disabled}
          @input=${(event: Event) =>
            changed(Number((event.target as HTMLInputElement).value))}
        />
        <output aria-label="${label} value">${output}</output>
      </label>
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
      --area-trim: var(--warning-color, #f4c542);
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

    .pattern-tabs button,
    .priority-row button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .pattern-tabs button.selected,
    .priority-row button.selected {
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
      color: var(--primary-text-color);
      background: var(--studio-card);
      font-weight: 600;
      cursor: pointer;
    }

    .add-button {
      color: var(--studio-blue);
      border-style: dashed;
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
      position: relative;
      margin-bottom: 16px;
      padding: 10px 12px;
    }

    .area-track {
      position: relative;
      direction: ltr;
      touch-action: none;
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

    .area-selection {
      position: absolute;
      z-index: 2;
      top: -7px;
      bottom: -7px;
      left: var(--area-start);
      width: var(--area-width);
      border-block: 4px solid var(--area-trim);
      pointer-events: none;
    }

    .area-handle,
    .area-selection-body {
      position: absolute;
      min-height: 0;
      margin: 0;
      padding: 0;
      pointer-events: auto;
    }

    .area-handle {
      z-index: 2;
      top: -4px;
      bottom: -4px;
      width: 22px;
      border: 0;
      border-radius: 6px;
      background: var(--area-trim);
      box-shadow: 0 2px 7px rgb(0 0 0 / 28%);
      cursor: ew-resize;
    }

    .area-handle-start {
      left: 0;
      transform: translateX(-50%);
    }

    .area-handle-end {
      right: 0;
      transform: translateX(50%);
    }

    .area-handle span {
      display: block;
      width: 3px;
      height: 18px;
      margin: auto;
      border-radius: 999px;
      background: color-mix(in srgb, var(--area-trim) 40%, #000);
    }

    .area-selection-body {
      z-index: 1;
      inset: 4px 11px;
      border: 0;
      background: transparent;
      cursor: grab;
    }

    .area-selection-body:active {
      cursor: grabbing;
    }

    .area-handle:focus-visible,
    .area-selection-body:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 3px;
    }

    .area-handle:disabled,
    .area-selection-body:disabled {
      cursor: not-allowed;
      opacity: 0.58;
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

    .range-field {
      grid-template-columns: minmax(112px, auto) minmax(100px, 1fr) 74px;
      font-variant-numeric: tabular-nums;
    }

    .priority-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
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

    .switch {
      position: relative;
      width: 60px;
      min-height: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 999px;
      background: var(--secondary-background-color, #f5f6f8);
      cursor: pointer;
    }

    .switch span {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--studio-muted);
      transition: transform 120ms ease;
    }

    .switch.on {
      border-color: var(--studio-blue);
      background: var(--studio-blue);
    }

    .switch.on span {
      background: var(--text-primary-color, #fff);
      transform: translateX(18px);
    }

    .check-field {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      margin-top: 12px;
    }

    .check-field input {
      width: 20px;
      height: 20px;
    }

    .priority-row {
      margin-top: 16px;
    }

    .priority-row button {
      flex: 1;
      min-width: 44px;
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

      .range-field {
        grid-template-columns: 1fr 64px;
      }

      .range-field span {
        grid-column: 1 / -1;
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

    @media (prefers-reduced-motion: reduce) {
      .switch span {
        transition: none;
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

function byteOutput(value: number): string {
  return `${bytePercent(value)}% · ${value}`;
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

function adjustedSliderValue(
  key: string,
  value: number,
  minimum: number,
  maximum: number,
): number | undefined {
  if (key === "Home") {
    return minimum;
  }
  if (key === "End") {
    return maximum;
  }
  if (key === "ArrowLeft" || key === "ArrowDown") {
    return clamp(value - 1, minimum, maximum);
  }
  if (key === "ArrowRight" || key === "ArrowUp") {
    return clamp(value + 1, minimum, maximum);
  }
  return undefined;
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
