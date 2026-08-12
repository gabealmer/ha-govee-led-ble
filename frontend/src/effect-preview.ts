import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import type {
  EffectPreviewModel,
  PreviewLayer,
  PreviewSequenceItem,
} from "./preview-model";
import type { RGB } from "./types";

export class GoveeEffectPreview extends LitElement {
  @property({ attribute: false })
  public model?: EffectPreviewModel;

  @property({ type: Boolean })
  public interactive = false;

  @property({ type: Boolean })
  public disabled = false;

  private paintingPointerId?: number;
  private lastPaintedCell?: number;

  protected render() {
    if (!this.model) {
      return nothing;
    }
    return html`
      <section class="preview ${this.model.kind}" aria-label=${this.model.title}>
        <header>
          <h3>${this.model.title}</h3>
          ${this.fidelityBadge(this.model.fidelity)}
        </header>
        ${this.renderBody(this.model)}
        <p class="fidelity-notice" role="note">${this.model.notice}</p>
      </section>
    `;
  }

  private renderBody(model: EffectPreviewModel) {
    switch (model.kind) {
      case "cells":
        return html`
          <div
            class="cell-strip"
            role=${this.interactive ? "group" : "img"}
            aria-label="Exact 15-segment colour map"
            @pointermove=${this.pointerMoved}
            @pointerup=${this.pointerFinished}
            @pointercancel=${this.pointerFinished}
          >
            ${model.cells.map((cell, index) =>
              this.interactive
                ? html`
                    <button
                      class="preview-cell"
                      type="button"
                      style="--preview-colour: ${rgbToHex(cell.colour)}"
                      aria-label="Segment ${index + 1}, ${rgbToHex(cell.colour)}"
                      ?disabled=${this.disabled}
                      data-preview-cell=${index}
                      @pointerdown=${(event: PointerEvent) =>
                        this.pointerStarted(index, event)}
                      @click=${(event: MouseEvent) =>
                        this.cellClicked(index, event)}
                    ></button>
                  `
                : html`
                    <span
                      class="preview-cell"
                      style="--preview-colour: ${rgbToHex(cell.colour)}"
                      aria-hidden="true"
                    ></span>
                  `,
            )}
          </div>
        `;
      case "palette":
        return html`
          ${this.renderPalette(model.palette)}
          <ol class="sequence" aria-label="Catalogue effect order">
            ${model.sequence.map((item, index) =>
              this.renderSequenceItem(item, index),
            )}
          </ol>
        `;
      case "layers":
        return html`
          <div class="layers">
            ${model.layers.map((layer) =>
              this.renderLayer(layer, layer.index === model.activeLayer),
            )}
          </div>
        `;
      case "scene-steps":
        return html`
          <dl class="scene-metadata">
            <div>
              <dt>Layout</dt>
              <dd>${model.layout}</dd>
            </div>
            <div>
              <dt>Brightness flag</dt>
              <dd>${model.brightnessFlag ? "Set" : "Clear"}</dd>
            </div>
            <div>
              <dt>Step count</dt>
              <dd>${model.steps.length}</dd>
            </div>
          </dl>
          ${model.layout === 0
            ? html`
                <h4 class="preview-subheading">Shared palette</h4>
                ${this.renderPalette(model.palette)}
              `
            : nothing}
          <ol class="scene-steps" aria-label="Ordered scene steps">
            ${model.steps.map(
              (step) => html`
                <li>
                  <span class="order">${step.index + 1}</span>
                  <span
                    class="swatch compact"
                    style="--preview-colour: ${rgbToHex(step.colour)}"
                    aria-label="Step colour ${rgbToHex(step.colour)}"
                    title=${rgbToHex(step.colour)}
                  ></span>
                  <span>
                    <strong>Raw value ${step.value}</strong>
                    <small>Step colour ${rgbToHex(step.colour)}</small>
                    ${step.inlineColour === null
                      ? nothing
                      : html`
                          <small>
                            Inline colour ${rgbToHex(step.inlineColour)}
                          </small>
                        `}
                  </span>
                  ${step.inlineColour === null
                    ? nothing
                    : html`
                        <span
                          class="swatch compact"
                          style="--preview-colour: ${rgbToHex(
                            step.inlineColour,
                          )}"
                          aria-label="Inline colour ${rgbToHex(
                            step.inlineColour,
                          )}"
                          title=${rgbToHex(step.inlineColour)}
                        ></span>
                      `}
                </li>
              `,
            )}
          </ol>
        `;
      case "opaque":
        return html`
          ${model.palette === null
            ? nothing
            : this.renderPalette(model.palette)}
          <ul class="opaque-details">
            ${model.details.map((detail) => html`<li>${detail}</li>`)}
          </ul>
        `;
    }
  }

  private renderSequenceItem(item: PreviewSequenceItem, index: number) {
    return html`
      <li class=${item.fidelity === "opaque" ? "unknown" : ""}>
        <span class="order">${index + 1}</span>
        <span>
          <strong>${item.label}</strong>
          ${item.fidelity === "opaque"
            ? html`<small>${item.raw}</small>`
            : nothing}
        </span>
        ${this.fidelityBadge(item.fidelity)}
      </li>
    `;
  }

  private renderLayer(layer: PreviewLayer, active: boolean) {
    const width = Math.max(0, layer.area.end - layer.area.start);
    return html`
      <article class="layer-summary ${active ? "active" : ""}">
        <div class="layer-heading">
          <h4>${layer.label}</h4>
          ${active ? html`<span class="current">Selected</span>` : nothing}
        </div>
        <div
          class="area-track"
          role="img"
          aria-label="${layer.label} applied area: start ${layer.area
            .rawStartTenths} tenths, width ${layer.area.rawWidthTenths} tenths"
        >
          <span
            class="area-band"
            style="inset-inline-start: ${layer.area.start *
            100}%; width: ${width * 100}%"
          ></span>
        </div>
        <p class="area-value">
          Applied area: ${layer.area.rawStartTenths}/10 +
          ${layer.area.rawWidthTenths}/10
          ${layer.area.valid ? nothing : html` <strong>out of range</strong>`}
        </p>
        ${this.renderPalette(layer.palette)}
        <dl>
          ${layer.fields.map(
            (field) => html`
              <div class=${field.fidelity === "opaque" ? "unknown" : ""}>
                <dt>${field.label}</dt>
                <dd>${field.value}</dd>
                ${field.fidelity === "opaque"
                  ? this.fidelityBadge("opaque")
                  : nothing}
              </div>
            `,
          )}
        </dl>
        ${layer.notices.length
          ? html`
              <ul class="layer-notices">
                ${layer.notices.map((notice) => html`<li>${notice}</li>`)}
              </ul>
            `
          : nothing}
      </article>
    `;
  }

  private renderPalette(palette: RGB[]) {
    return html`
      <div class="palette" role="list" aria-label="Preview palette">
        ${palette.length
          ? palette.map(
              (colour, index) => html`
                <span
                  role="listitem"
                  class="swatch"
                  style="--preview-colour: ${rgbToHex(colour)}"
                  aria-label="Colour ${index + 1}, ${rgbToHex(colour)}"
                  title=${rgbToHex(colour)}
                ></span>
              `,
            )
          : html`<span class="empty-palette">No palette colours</span>`}
      </div>
    `;
  }

  private fidelityBadge(fidelity: EffectPreviewModel["fidelity"] | "opaque") {
    return html`
      <span class="fidelity ${fidelity}">
        ${fidelity === "deterministic"
          ? "Deterministic"
          : fidelity === "structural"
            ? "Structural"
            : "Opaque / unknown"}
      </span>
    `;
  }

  private pointerStarted(index: number, event: PointerEvent): void {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    this.paintingPointerId = event.pointerId;
    this.lastPaintedCell = index;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.selectCell(index);
  }

  private pointerMoved(event: PointerEvent): void {
    if (event.pointerId !== this.paintingPointerId || !this.shadowRoot) {
      return;
    }
    const target = this.shadowRoot
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-preview-cell]");
    const rawIndex = target?.dataset.previewCell;
    if (rawIndex === undefined) {
      return;
    }
    const index = Number(rawIndex);
    if (index !== this.lastPaintedCell) {
      this.lastPaintedCell = index;
      this.selectCell(index);
    }
  }

  private pointerFinished(event: PointerEvent): void {
    if (event.pointerId !== this.paintingPointerId) {
      return;
    }
    const captured = this.shadowRoot?.querySelector<HTMLElement>(
      `[data-preview-cell="${this.lastPaintedCell}"]`,
    );
    if (captured?.hasPointerCapture(event.pointerId)) {
      captured.releasePointerCapture(event.pointerId);
    }
    this.paintingPointerId = undefined;
    this.lastPaintedCell = undefined;
  }

  private cellClicked(index: number, event: MouseEvent): void {
    if (!this.disabled && event.detail === 0) {
      this.selectCell(index);
    }
  }

  private selectCell(index: number): void {
    this.dispatchEvent(
      new CustomEvent<{ index: number }>("preview-cell-selected", {
        detail: { index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = css`
    :host {
      display: block;
      --preview-border: var(--divider-color, #d8dce2);
      --preview-card: var(--card-background-color, #fff);
      --preview-muted: var(--secondary-text-color, #68707c);
      --preview-blue: var(--primary-color, #2f6fed);
    }

    * {
      box-sizing: border-box;
    }

    .preview {
      padding: 16px;
      border: 1px solid var(--preview-border);
      border-radius: 10px;
      background: var(--preview-card);
    }

    header,
    .layer-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    h3,
    h4,
    p {
      margin-top: 0;
    }

    h3 {
      margin-bottom: 14px;
      font-size: 16px;
    }

    h4 {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .fidelity,
    .current {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      min-height: 24px;
      padding: 3px 8px;
      border: 1px solid var(--preview-border);
      border-radius: 999px;
      color: var(--preview-muted);
      background: var(--secondary-background-color, #f5f6f8);
      font-size: 11px;
      font-weight: 700;
    }

    .fidelity.opaque {
      color: var(--warning-color, #8a5b00);
      border-color: color-mix(
        in srgb,
        var(--warning-color, #d99000) 55%,
        var(--preview-border)
      );
    }

    .cell-strip {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
      touch-action: none;
    }

    .preview-cell {
      display: block;
      min-width: 0;
      min-height: 48px;
      padding: 0;
      border: 1px solid
        color-mix(in srgb, var(--preview-colour) 70%, #000);
      border-radius: 6px;
      background: var(--preview-colour);
    }

    button.preview-cell {
      cursor: crosshair;
    }

    button.preview-cell:focus-visible {
      outline: 3px solid var(--preview-blue);
      outline-offset: 2px;
    }

    .palette {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 34px;
    }

    .swatch {
      width: 34px;
      height: 34px;
      border: 1px solid
        color-mix(in srgb, var(--preview-colour) 70%, #000);
      border-radius: 7px;
      background: var(--preview-colour);
    }

    .empty-palette {
      color: var(--preview-muted);
      font-size: 13px;
    }

    .sequence,
    .scene-steps,
    .opaque-details,
    .layer-notices {
      margin: 12px 0 0;
    }

    .sequence {
      display: grid;
      gap: 7px;
      padding: 0;
      list-style: none;
      counter-reset: none;
    }

    .sequence li,
    .scene-steps li {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid var(--preview-border);
      border-radius: 8px;
    }

    .sequence li.unknown,
    dl div.unknown {
      border-color: color-mix(
        in srgb,
        var(--warning-color, #d99000) 45%,
        var(--preview-border)
      );
    }

    .sequence small {
      display: block;
      margin-top: 2px;
      color: var(--preview-muted);
    }

    .scene-metadata {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin: 0 0 14px;
    }

    .scene-metadata div {
      grid-template-columns: 1fr;
    }

    .preview-subheading {
      margin: 0 0 8px;
    }

    .scene-steps {
      display: grid;
      gap: 7px;
      padding: 0;
      list-style: none;
    }

    .scene-steps li {
      grid-template-columns: auto auto minmax(0, 1fr) auto;
      align-items: center;
      padding: 8px 10px;
      border: 1px solid var(--preview-border);
      border-radius: 8px;
    }

    .scene-steps small {
      display: block;
      margin-top: 2px;
      color: var(--preview-muted);
    }

    .swatch.compact {
      width: 26px;
      height: 26px;
      border-radius: 5px;
    }

    .order {
      display: grid;
      width: 26px;
      height: 26px;
      place-items: center;
      border-radius: 50%;
      color: var(--preview-muted);
      background: var(--secondary-background-color, #f5f6f8);
      font-size: 12px;
      font-weight: 700;
    }

    .layers {
      display: grid;
      gap: 10px;
    }

    .layer-summary {
      padding: 12px;
      border: 1px solid var(--preview-border);
      border-radius: 9px;
    }

    .layer-summary.active {
      border-color: var(--preview-blue);
    }

    .area-track {
      position: relative;
      height: 20px;
      overflow: hidden;
      border: 1px solid var(--preview-border);
      border-radius: 5px;
      background: var(--secondary-background-color, #f5f6f8);
    }

    .area-band {
      position: absolute;
      inset-block: 0;
      background: var(--preview-blue);
    }

    .area-value {
      margin: 6px 0 10px;
      color: var(--preview-muted);
      font-size: 12px;
    }

    dl {
      display: grid;
      gap: 6px;
      margin: 12px 0 0;
    }

    dl div {
      display: grid;
      grid-template-columns: minmax(110px, 0.35fr) minmax(0, 1fr) auto;
      gap: 8px;
      padding: 6px 8px;
      border-inline-start: 3px solid transparent;
      background: var(--secondary-background-color, #f5f6f8);
    }

    dt {
      font-weight: 650;
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    .layer-notices,
    .opaque-details {
      padding-inline-start: 20px;
      color: var(--preview-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .fidelity-notice {
      margin: 12px 0 0;
      color: var(--preview-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    @media (max-width: 480px) {
      .cell-strip {
        gap: 3px;
      }

      .preview-cell {
        min-height: 38px;
        border-radius: 4px;
      }

      dl div {
        grid-template-columns: 1fr;
      }

      .scene-metadata {
        grid-template-columns: 1fr;
      }
    }
  `;
}

if (!customElements.get("govee-effect-preview")) {
  customElements.define("govee-effect-preview", GoveeEffectPreview);
}

function rgbToHex(colour: RGB): string {
  return `#${colour
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-effect-preview": GoveeEffectPreview;
  }
}
