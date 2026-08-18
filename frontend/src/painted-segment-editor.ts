import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

import {
  studioBaseStyles,
  studioCardStyles,
} from "./studio-styles";
import type { LivePreviewInteraction } from "./live-preview-controller";
import type { RGB } from "./types";
import { rgbToHex } from "./ui-utils";

export class GoveePaintedSegmentEditor extends LitElement {
  @property({ attribute: false })
  public colours: RGB[] = [];

  @property({ type: Boolean })
  public disabled = false;

  private paintingPointerId?: number;
  private lastPaintedSegment?: number;

  protected render() {
    return html`
      <section class="card" aria-labelledby="painted-segments-heading">
        <h3 class="section-title" id="painted-segments-heading">
          Painted segments
        </h3>
        <div class="segments">
          ${this.colours.map(
            (colour, index) => html`
              <button
                type="button"
                data-segment=${index}
                style="--segment-colour: ${rgbToHex(colour)}"
                aria-label="Segment ${index + 1}, ${rgbToHex(colour)}"
                ?disabled=${this.disabled}
                @pointerdown=${(event: PointerEvent) =>
                  this.pointerStarted(index, event)}
                @pointermove=${this.pointerMoved}
                @pointerup=${this.pointerFinished}
                @pointercancel=${this.pointerFinished}
                @click=${(event: MouseEvent) =>
                  this.segmentClicked(index, event)}
              ></button>
            `,
          )}
        </div>
      </section>
    `;
  }

  private pointerStarted(index: number, event: PointerEvent): void {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    this.paintingPointerId = event.pointerId;
    this.lastPaintedSegment = index;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.selectSegment(index, "changing");
  }

  private pointerMoved(event: PointerEvent): void {
    if (event.pointerId !== this.paintingPointerId || !this.shadowRoot) {
      return;
    }
    const target = this.shadowRoot
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-segment]");
    const index = Number(target?.dataset.segment);
    if (
      Number.isInteger(index) &&
      index !== this.lastPaintedSegment
    ) {
      this.lastPaintedSegment = index;
      this.selectSegment(index, "changing");
    }
  }

  private pointerFinished(event: PointerEvent): void {
    if (event.pointerId !== this.paintingPointerId) {
      return;
    }
    const captured = this.shadowRoot?.querySelector<HTMLElement>(
      `[data-segment="${this.lastPaintedSegment}"]`,
    );
    if (captured?.hasPointerCapture(event.pointerId)) {
      captured.releasePointerCapture(event.pointerId);
    }
    this.paintingPointerId = undefined;
    this.lastPaintedSegment = undefined;
  }

  private segmentClicked(index: number, event: MouseEvent): void {
    if (!this.disabled && event.detail === 0) {
      this.selectSegment(index, "committed");
    }
  }

  private selectSegment(
    index: number,
    interaction: LivePreviewInteraction,
  ): void {
    this.dispatchEvent(
      new CustomEvent<{
        index: number;
        interaction: LivePreviewInteraction;
      }>("segment-selected", {
        detail: { index, interaction },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = [studioBaseStyles, studioCardStyles, css`
    :host {
      display: block;
    }

    .segments {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
      touch-action: none;
    }

    button {
      min-width: 0;
      min-height: 48px;
      padding: 0;
      border: 1px solid
        color-mix(in srgb, var(--segment-colour) 70%, #000);
      border-radius: 6px;
      background: var(--segment-colour);
      cursor: crosshair;
    }

    button:focus-visible {
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }

    @media (max-width: 600px) {
      .segments {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-painted-segment-editor": GoveePaintedSegmentEditor;
  }
}

if (!customElements.get("govee-painted-segment-editor")) {
  customElements.define(
    "govee-painted-segment-editor",
    GoveePaintedSegmentEditor,
  );
}
