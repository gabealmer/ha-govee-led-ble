import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  adjustAppliedAreaLeftEdge,
  adjustAppliedAreaRightEdge,
  appliedAreaEffectiveWidth,
  layerAppliedAreaSegments,
  moveAppliedArea,
  withAppliedAreaSegments,
} from "./advanced-effect-model";
import type { LivePreviewInteraction } from "./live-preview-controller";
import { studioActionStyles, studioBaseStyles } from "./studio-styles";
import type { EffectLayer } from "./types";
import { rgbToHex } from "./ui-utils";

const DEFAULT_SEGMENT_COUNT = 15;
type AppliedAreaControl = "left" | "move" | "right";

interface AppliedAreaDrag {
  control: AppliedAreaControl;
  pointerId: number;
  pointerStart: number;
  start: number;
  end: number;
  track: HTMLElement;
}

export interface AppliedAreaChange {
  layer: EffectLayer;
  interaction: LivePreviewInteraction;
}

export class GoveeAppliedAreaControl extends LitElement {
  @property({ attribute: false })
  public layer?: EffectLayer;

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Number })
  public segmentCount = DEFAULT_SEGMENT_COUNT;

  @state()
  private activeControl?: AppliedAreaControl;

  private drag?: AppliedAreaDrag;

  public disconnectedCallback(): void {
    this.drag = undefined;
    this.activeControl = undefined;
    super.disconnectedCallback();
  }

  protected render() {
    const layer = this.layer;
    if (!layer) {
      return nothing;
    }
    const effectiveWidth = appliedAreaEffectiveWidth(
      layer.area.width_tenths,
    );
    const areaIsEditable =
      layer.area.start_tenths >= 0 &&
      layer.area.start_tenths <= 9 &&
      effectiveWidth >= 1 &&
      effectiveWidth <= 10 - layer.area.start_tenths;
    const segmentCount = this.validSegmentCount;
    const segmentColour = rgbToHex(layer.palette[0] ?? [47, 111, 237]);
    const visibleSegments = layerAppliedAreaSegments(layer, segmentCount);
    const visualStart = (visibleSegments.start / segmentCount) * 100;
    const visualEnd = (visibleSegments.end / segmentCount) * 100;
    return html`
      <div class="area-control">
        <div
          class="area-range"
          style="--area-segment-count: ${segmentCount}; --area-colour: ${segmentColour};"
          aria-label="Applied area"
        >
          <div class="area-segments" aria-hidden="true">
            ${Array.from(
              { length: segmentCount },
              (_, index) => html`
                <span
                  class=${areaIsEditable &&
                  index >= visibleSegments.start &&
                  index < visibleSegments.end
                    ? "covered"
                    : ""}
                ></span>
              `,
            )}
          </div>
          ${areaIsEditable
            ? html`
                <div
                  class="area-window"
                  style="left: ${visualStart}%; width: ${visualEnd -
                  visualStart}%;"
                >
                  ${this.renderSlider(
                    "move",
                    "Move applied area",
                    visibleSegments.start,
                    0,
                    segmentCount - visibleSegments.length,
                    `Segments ${visibleSegments.start + 1} to ${visibleSegments.end}`,
                    visibleSegments.start + 1,
                  )}
                  ${this.renderSlider(
                    "left",
                    "Applied area left edge",
                    visibleSegments.start,
                    0,
                    visibleSegments.end - 1,
                    `Segment ${visibleSegments.start + 1}`,
                    visibleSegments.start + 1,
                  )}
                  ${this.renderSlider(
                    "right",
                    "Applied area right edge",
                    visibleSegments.end,
                    visibleSegments.start + 1,
                    segmentCount,
                    `Segment ${visibleSegments.end}`,
                    visibleSegments.end,
                  )}
                </div>
              `
            : nothing}
        </div>
        ${areaIsEditable
          ? html`
              <p class="area-help">
                Drag either edge to resize. Drag the highlighted middle to move
                the area.
              </p>
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
              @click=${this.setFullStrip}
            >
              Set full strip
            </button>
          `
        : nothing}
    `;
  }

  private renderSlider(
    control: AppliedAreaControl,
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    valueText: string,
    displayValue: number,
  ) {
    return html`
      <div
        class=${control === "move"
          ? "area-move"
          : `area-handle area-handle-${control}`}
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${label}
        aria-orientation="horizontal"
        aria-valuemin=${minimum}
        aria-valuemax=${maximum}
        aria-valuenow=${value}
        aria-valuetext=${valueText}
        aria-disabled=${this.disabled ? "true" : "false"}
        @keydown=${(event: KeyboardEvent) => this.keyPressed(event, control)}
        @pointerdown=${(event: PointerEvent) =>
          this.startDrag(event, control)}
        @pointermove=${this.pointerMoved}
        @pointerup=${this.finishDrag}
        @pointercancel=${this.finishDrag}
      >
        ${control !== "move" && this.activeControl === control
          ? html`<span class="area-drag-value" aria-hidden="true"
              >${displayValue}</span
            >`
          : nothing}
      </div>
    `;
  }

  private keyPressed(
    event: KeyboardEvent,
    control: AppliedAreaControl,
  ): void {
    const { start, end } = this.renderedSegments(
      event.currentTarget as HTMLElement,
    );
    const direction =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? -1
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? 1
          : undefined;
    let next: number;
    if (event.key === "Home") {
      next = control === "right" ? start + 1 : 0;
    } else if (event.key === "End") {
      next =
        control === "left"
          ? end - 1
          : control === "right"
            ? this.validSegmentCount
            : this.validSegmentCount - (end - start);
    } else if (direction !== undefined) {
      next = (control === "right" ? end : start) + direction;
    } else {
      return;
    }
    event.preventDefault();
    this.applyControl(control, start, end, next, "committed");
  }

  private startDrag(
    event: PointerEvent,
    control: AppliedAreaControl,
  ): void {
    if (this.disabled || (event.button !== 0 && event.pointerType !== "touch")) {
      return;
    }
    const target = event.currentTarget as HTMLElement;
    const track = target.closest<HTMLElement>(".area-range");
    if (!track) {
      return;
    }
    const { start, end } = this.renderedSegments(target);
    target.focus();
    event.preventDefault();
    event.stopPropagation();
    target.setPointerCapture(event.pointerId);
    this.activeControl = control;
    this.drag = {
      control,
      pointerId: event.pointerId,
      pointerStart: event.clientX,
      start,
      end,
      track,
    };
  }

  private readonly pointerMoved = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const bounds = drag.track.getBoundingClientRect();
    const next =
      drag.control === "move"
        ? drag.start +
          Math.round(
            ((event.clientX - drag.pointerStart) / bounds.width) *
              this.validSegmentCount,
          )
        : Math.round(
            ((event.clientX - bounds.left) / bounds.width) *
              this.validSegmentCount,
          );
    this.applyControl(drag.control, drag.start, drag.end, next, "changing");
  };

  private readonly finishDrag = (event: PointerEvent): void => {
    if (this.drag?.pointerId !== event.pointerId) {
      return;
    }
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.drag = undefined;
    this.activeControl = undefined;
  };

  private applyControl(
    control: AppliedAreaControl,
    start: number,
    end: number,
    next: number,
    interaction: LivePreviewInteraction,
  ): void {
    const area =
      control === "left"
        ? adjustAppliedAreaLeftEdge(end, next, this.validSegmentCount)
        : control === "right"
          ? adjustAppliedAreaRightEdge(start, next, this.validSegmentCount)
          : moveAppliedArea(start, end, next, this.validSegmentCount);
    this.setArea(area.start, area.end, interaction);
  }

  private setArea(
    start: number,
    end: number,
    interaction: LivePreviewInteraction,
  ): void {
    if (!this.layer || this.disabled) {
      return;
    }
    this.layer = withAppliedAreaSegments(
      this.layer,
      start,
      end,
      this.validSegmentCount,
    );
    this.dispatchEvent(
      new CustomEvent<AppliedAreaChange>("area-changed", {
        detail: { layer: this.layer, interaction },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private readonly setFullStrip = (): void => {
    if (!this.layer || this.disabled) {
      return;
    }
    this.setArea(0, this.validSegmentCount, "committed");
  };

  private renderedSegments(origin: HTMLElement): {
    start: number;
    end: number;
  } {
    const areaWindow = origin.closest(".area-window");
    const left = Number(
      areaWindow
        ?.querySelector<HTMLElement>(".area-handle-left")
        ?.getAttribute("aria-valuenow"),
    );
    const right = Number(
      areaWindow
        ?.querySelector<HTMLElement>(".area-handle-right")
        ?.getAttribute("aria-valuenow"),
    );
    if (
      Number.isInteger(left) &&
      Number.isInteger(right) &&
      left >= 0 &&
      right > left &&
      right <= this.validSegmentCount
    ) {
      return { start: left, end: right };
    }
    const segments = layerAppliedAreaSegments(
      this.layer!,
      this.validSegmentCount,
    );
    return { start: segments.start, end: segments.end };
  }

  private get validSegmentCount(): number {
    return Number.isInteger(this.segmentCount) && this.segmentCount > 0
      ? this.segmentCount
      : DEFAULT_SEGMENT_COUNT;
  }

  static styles = [
    studioBaseStyles,
    studioActionStyles,
    css`
      :host {
        display: block;
      }

      .area-control {
        margin-bottom: 16px;
        padding: 4px 22px 0;
      }

      .area-range {
        position: relative;
        min-height: 64px;
        touch-action: pan-y;
      }

      .area-segments {
        display: grid;
        grid-template-columns: repeat(
          var(--area-segment-count),
          minmax(0, 1fr)
        );
        gap: 4px;
        min-height: 64px;
        pointer-events: none;
      }

      .area-segments span {
        min-width: 0;
        min-height: 64px;
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
          var(--area-colour) 42%,
          var(--studio-border)
        );
        background: color-mix(
          in srgb,
          var(--area-colour) 24%,
          var(--studio-card)
        );
      }

      .area-window {
        position: absolute;
        z-index: 2;
        top: 0;
        bottom: 0;
        min-width: 1px;
        border-block: 3px solid
          color-mix(in srgb, var(--area-colour) 48%, var(--studio-border));
        background: color-mix(in srgb, var(--area-colour) 5%, transparent);
      }

      .area-move {
        position: absolute;
        inset: 0;
        z-index: 1;
        min-width: 44px;
        cursor: grab;
      }

      .area-move::after {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 10px;
        border-radius: 5px;
        background-image: radial-gradient(
          circle,
          color-mix(in srgb, var(--area-colour) 52%, #000) 1.5px,
          transparent 1.8px
        );
        background-position: 0 0;
        background-size: 6px 6px;
        content: "";
        opacity: 0.72;
        transform: translate(-50%, -50%);
      }

      .area-move:active {
        cursor: grabbing;
      }

      .area-handle {
        position: absolute;
        z-index: 3;
        top: 50%;
        width: 44px;
        min-height: 56px;
        border: 0;
        background: transparent;
        cursor: ew-resize;
        transform: translateY(-50%);
      }

      .area-handle::before {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 24px;
        border-inline: 2px solid
          color-mix(in srgb, var(--area-colour) 72%, #000);
        content: "";
        transform: translate(-50%, -50%);
      }

      .area-handle::after {
        position: absolute;
        z-index: -1;
        top: 50%;
        left: 50%;
        width: 22px;
        height: 44px;
        border: 2px solid
          color-mix(in srgb, var(--area-colour) 78%, #000);
        border-radius: 10px;
        background: var(--studio-card);
        box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
        content: "";
        transform: translate(-50%, -50%);
      }

      .area-handle-left {
        left: 0;
        transform: translate(-50%, -50%);
      }

      .area-handle-right {
        right: 0;
        transform: translate(50%, -50%);
      }

      .area-move:focus-visible,
      .area-handle:focus-visible {
        outline: var(--studio-focus-width) solid var(--studio-blue);
        outline-offset: var(--studio-focus-offset);
      }

      .area-move[aria-disabled="true"],
      .area-handle[aria-disabled="true"] {
        cursor: default;
        opacity: var(--studio-disabled-opacity);
      }

      .area-drag-value {
        position: absolute;
        z-index: 5;
        bottom: calc(100% + 7px);
        left: 50%;
        min-width: 28px;
        padding: 4px 7px;
        border: 1px solid var(--studio-border);
        border-radius: 8px;
        color: var(--primary-text-color);
        background: var(--studio-card);
        box-shadow: var(--studio-popover-shadow);
        font-size: 12px;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        text-align: center;
        transform: translateX(-50%);
      }

      .area-help {
        margin: 12px 0 0;
        color: var(--studio-muted);
        font-size: 13px;
        text-align: center;
      }

      .muted {
        color: var(--studio-muted);
        font-size: 13px;
        line-height: 1.45;
      }

      @media (max-width: 760px) {
        .area-control {
          padding-inline: 18px;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-applied-area-control": GoveeAppliedAreaControl;
  }
}

if (!customElements.get("govee-applied-area-control")) {
  customElements.define(
    "govee-applied-area-control",
    GoveeAppliedAreaControl,
  );
}
