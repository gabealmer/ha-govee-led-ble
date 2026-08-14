import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

import { rgbToHex } from "./palette-editor";
import type { RGB } from "./types";

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
        <h3 id="painted-segments-heading">Painted segments</h3>
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
    this.selectSegment(index);
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
      this.selectSegment(index);
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
      this.selectSegment(index);
    }
  }

  private selectSegment(index: number): void {
    this.dispatchEvent(
      new CustomEvent<{ index: number }>("segment-selected", {
        detail: { index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = css`
    :host {
      display: block;
      --studio-blue: var(--primary-color, #2f6fed);
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
    }

    * {
      box-sizing: border-box;
    }

    .card {
      padding: 20px;
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    h3 {
      margin: 0 0 14px;
      font-size: 16px;
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
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    @media (max-width: 600px) {
      .segments {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `;
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
