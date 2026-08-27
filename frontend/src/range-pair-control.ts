import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";

import type { LivePreviewInteraction } from "./live-preview-controller";
import {
  orderedRangePair,
  rangePairHandleForValue,
  rangePairKeyboardUpdate,
  updateRangePair,
  type RangePair,
  type RangePairHandle,
} from "./range-pair-control-model";
import { studioBaseStyles, studioFormStyles } from "./studio-styles";

export interface RangePairControlChange extends RangePair {
  interaction: LivePreviewInteraction;
}

interface RangePairDrag {
  handle: RangePairHandle;
  pointerId: number;
  target: HTMLElement;
  track: HTMLElement;
  pair: RangePair;
  changed: boolean;
}

export class GoveeRangePairControl extends LitElement {
  @property()
  public label = "";

  @property()
  public lowLabel = "Low";

  @property()
  public highLabel = "High";

  @property({ type: Number })
  public lowValue = 0;

  @property({ type: Number })
  public highValue = 100;

  @property({ type: Number })
  public minimum = 0;

  @property({ type: Number })
  public maximum = 100;

  @property({ type: Number })
  public step = 1;

  @property({ type: Boolean })
  public disabled = false;

  @state()
  private activeHandle?: RangePairHandle;

  @state()
  private dragPair?: RangePair;

  private drag?: RangePairDrag;

  public disconnectedCallback(): void {
    this.clearDrag();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("disabled") && this.disabled && this.drag) {
      this.completeDrag();
    }
  }

  protected render() {
    const pair = this.dragPair ?? this.pair;
    const span = Math.max(1, this.maximum - this.minimum);
    const lowPercent = ((pair.low - this.minimum) / span) * 100;
    const highPercent = ((pair.high - this.minimum) / span) * 100;
    return html`
      <div class="range-pair-field">
        <span class="range-pair-label">
          <span class="range-pair-label-context">
            <span class="parameter-label">${this.label}</span>
            <slot name="help"></slot>
          </span>
          <span class="range-pair-values">
            ${this.lowLabel} ${pair.low} · ${this.highLabel} ${pair.high}
          </span>
        </span>
        <div class="range-pair-track">
          <span class="track"></span>
          <span
            class="selected-track"
            style="left: ${lowPercent}%; width: ${highPercent -
            lowPercent}%;"
          ></span>
          ${this.renderHandle("low", pair, lowPercent)}
          ${this.renderHandle("high", pair, highPercent)}
        </div>
      </div>
    `;
  }

  private renderHandle(
    handle: RangePairHandle,
    pair: RangePair,
    percent: number,
  ) {
    const value = pair[handle];
    const minimum = handle === "low" ? this.minimum : pair.low;
    const maximum = handle === "low" ? pair.high : this.maximum;
    return html`
      <span
        class="handle-target handle-${handle} ${this.activeHandle === handle
          ? "active"
          : ""}"
        style="left: ${percent}%;"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-label=${`${this.label} ${handle === "low"
          ? this.lowLabel
          : this.highLabel}`}
        aria-orientation="horizontal"
        aria-valuemin=${minimum}
        aria-valuemax=${maximum}
        aria-valuenow=${value}
        aria-disabled=${this.disabled ? "true" : "false"}
        @focus=${() => {
          this.activeHandle = handle;
        }}
        @keydown=${(event: KeyboardEvent) =>
          this.keyPressed(event, handle)}
        @pointerdown=${(event: PointerEvent) =>
          this.startDrag(event, handle)}
        @pointermove=${this.pointerMoved}
        @pointerup=${this.pointerFinished}
        @pointercancel=${this.pointerFinished}
        @lostpointercapture=${this.pointerCaptureLost}
      >
        <span class="handle" aria-hidden="true"></span>
      </span>
    `;
  }

  private keyPressed(
    event: KeyboardEvent,
    handle: RangePairHandle,
  ): void {
    if (this.disabled) {
      return;
    }
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const next = rangePairKeyboardUpdate(
      this.pair,
      handle,
      event.key,
      this.minimum,
      this.maximum,
      this.step,
    );
    if (!next) {
      return;
    }
    this.activeHandle = handle;
    this.emitChange(next, "committed");
  }

  private startDrag(
    event: PointerEvent,
    requestedHandle: RangePairHandle,
  ): void {
    if (
      this.disabled ||
      this.drag !== undefined ||
      (event.button !== 0 && event.pointerType !== "touch")
    ) {
      return;
    }
    const requestedTarget = event.currentTarget as HTMLElement;
    const track = requestedTarget.parentElement;
    if (!track) {
      return;
    }
    const pair = this.pair;
    const bounds = track.getBoundingClientRect();
    const pointerValue = this.pointerValue(event.clientX, bounds);
    const valueSpan = Math.max(1, this.maximum - this.minimum);
    const handleCentre =
      bounds.left +
      ((pair.low - this.minimum) / valueSpan) * bounds.width;
    const preferred =
      pair.low === pair.high
        ? event.clientX <= handleCentre
          ? "low"
          : "high"
        : this.activeHandle ?? requestedHandle;
    const handle = rangePairHandleForValue(
      pointerValue,
      pair,
      preferred,
    );
    const target =
      this.shadowRoot?.querySelector<HTMLElement>(
        `.handle-${handle}`,
      ) ?? requestedTarget;
    event.preventDefault();
    target.focus();
    target.setPointerCapture(event.pointerId);
    this.activeHandle = handle;
    this.dragPair = pair;
    this.drag = {
      handle,
      pointerId: event.pointerId,
      target,
      track,
      pair,
      changed: false,
    };
  }

  private readonly pointerMoved = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const next = updateRangePair(
      drag.pair,
      drag.handle,
      this.pointerValue(
        event.clientX,
        drag.track.getBoundingClientRect(),
      ),
      this.minimum,
      this.maximum,
    );
    if (
      next.low === drag.pair.low &&
      next.high === drag.pair.high
    ) {
      return;
    }
    drag.pair = next;
    drag.changed = true;
    this.dragPair = next;
    this.emitChange(next, "changing");
  };

  private readonly pointerFinished = (event: PointerEvent): void => {
    if (this.drag?.pointerId !== event.pointerId) {
      return;
    }
    this.completeDrag();
  };

  private readonly pointerCaptureLost = (event: PointerEvent): void => {
    if (this.drag?.pointerId === event.pointerId) {
      this.completeDrag(false);
    }
  };

  private completeDrag(releaseCapture = true): void {
    const drag = this.drag;
    if (!drag) {
      return;
    }
    const pair = drag.pair;
    const changed = drag.changed;
    this.clearDrag();
    if (
      releaseCapture &&
      drag.target.hasPointerCapture(drag.pointerId)
    ) {
      drag.target.releasePointerCapture(drag.pointerId);
    }
    if (changed) {
      this.emitChange(pair, "committed");
    }
  }

  private clearDrag(): void {
    this.drag = undefined;
    this.dragPair = undefined;
  }

  private get pair(): RangePair {
    return orderedRangePair(
      this.lowValue,
      this.highValue,
      this.minimum,
      this.maximum,
    );
  }

  private pointerValue(clientX: number, bounds: DOMRect): number {
    const ratio =
      bounds.width > 0
        ? Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width))
        : 0;
    return (
      this.minimum +
      Math.round(
        ((ratio * (this.maximum - this.minimum)) / this.step),
      ) *
        this.step
    );
  }

  private emitChange(
    pair: RangePair,
    interaction: LivePreviewInteraction,
  ): void {
    this.dispatchEvent(
      new CustomEvent<RangePairControlChange>(
        "range-pair-changed",
        {
          detail: { ...pair, interaction },
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  static styles = [
    studioBaseStyles,
    studioFormStyles,
    css`
      :host {
        display: block;
      }

      .range-pair-field {
        display: grid;
        gap: var(--studio-control-gap);
      }

      .range-pair-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: var(--studio-info-control-size);
        gap: var(--studio-compact-gap);
      }

      .range-pair-label-context {
        display: inline-flex;
        align-items: center;
        gap: var(--studio-compact-gap);
      }

      .range-pair-values {
        color: var(--studio-muted);
        font-size: var(--studio-caption-size);
        font-variant-numeric: tabular-nums;
      }

      .range-pair-track {
        position: relative;
        height: var(--studio-control-height);
        margin-inline: calc(var(--studio-touch-target-size) / 2);
        touch-action: pan-y;
      }

      .track,
      .selected-track {
        position: absolute;
        top: 50%;
        height: var(--studio-strong-border-width);
        transform: translateY(-50%);
      }

      .track {
        right: 0;
        left: 0;
        background: var(--studio-border);
      }

      .selected-track {
        background: var(--studio-blue);
      }

      .handle-target {
        position: absolute;
        z-index: 1;
        top: 50%;
        display: grid;
        width: var(--studio-touch-target-size);
        height: var(--studio-touch-target-size);
        place-items: center;
        cursor: ew-resize;
        touch-action: pan-y;
        user-select: none;
        transform: translate(-50%, -50%);
      }

      .handle-target.active {
        z-index: 2;
      }

      .handle {
        width: var(--studio-spacing-4xl);
        height: var(--studio-spacing-4xl);
        border: var(--studio-border-width) solid
          var(--text-primary-color, #fff);
        border-radius: var(--studio-round-radius);
        background: var(--studio-muted);
        box-shadow: 0 var(--studio-border-width)
          var(--studio-micro-gap) rgb(0 0 0 / 45%);
      }

      .handle-target:focus-visible {
        outline: var(--studio-focus-width) solid var(--studio-blue);
        outline-offset: calc(0px - var(--studio-focus-width));
        border-radius: var(--studio-round-radius);
      }

      .handle-target[aria-disabled="true"] {
        cursor: not-allowed;
        opacity: var(--studio-disabled-opacity);
      }

      @media (forced-colors: active) {
        .track,
        .selected-track {
          background: CanvasText;
        }

        .handle {
          border-color: Canvas;
          background: CanvasText;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-range-pair-control": GoveeRangePairControl;
  }
}

if (!customElements.get("govee-range-pair-control")) {
  customElements.define(
    "govee-range-pair-control",
    GoveeRangePairControl,
  );
}
