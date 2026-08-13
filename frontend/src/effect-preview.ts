import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import type {
  EffectPreviewModel,
  PreviewLayer,
  PreviewSequenceItem,
} from "./preview-model";
import type { RGB } from "./types";

export interface PreviewSweepLaneChange {
  lane: number;
  previousLane: number;
  sequence: number;
  lanes: number[];
  previousLanes: number[];
}

const LOGICAL_LANE_COUNT = 15;

export class GoveeEffectPreview extends LitElement {
  @property({ attribute: false })
  public model?: EffectPreviewModel;

  @property({ type: Boolean })
  public interactive = false;

  @property({ type: Boolean })
  public disabled = false;

  private paintingPointerId?: number;
  private lastPaintedCell?: number;
  private previewVisible = true;
  private visibilityObserver?: IntersectionObserver;
  private motionQuery?: MediaQueryList;
  private sweepElapsedMilliseconds = 0;
  private sweepCompletedSteps = 0;
  private sweepKey?: string;
  private sweepLane = 0;
  private sweepRunningSince?: number;
  private sweepTransitionSequence = 0;
  private sweepTimeout?: number;
  private customAnimationElapsedMilliseconds = 0;
  private customAnimationKey?: string;
  private customAnimationRunningSince?: number;
  private customAnimationTimeout?: number;

  @state()
  private customAnimationSequence = 0;

  public connectedCallback(): void {
    super.connectedCallback();
    if (typeof window !== "undefined" && "matchMedia" in window) {
      this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.motionQuery.addEventListener("change", this.motionChanged);
    }
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    this.visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        this.previewVisible = entry.isIntersecting;
        this.configureDirectionalSweep();
        this.configureCustomAnimation();
        this.requestUpdate();
      },
      { threshold: 0.01 },
    );
    this.visibilityObserver.observe(this);
  }

  public disconnectedCallback(): void {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;
    this.motionQuery?.removeEventListener("change", this.motionChanged);
    this.motionQuery = undefined;
    this.pauseDirectionalSweep();
    this.pauseCustomAnimation();
    super.disconnectedCallback();
  }

  protected updated(): void {
    this.configureDirectionalSweep();
    this.configureCustomAnimation();
  }

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
      case "capture-static":
        return html`
          <div
            class="cell-strip capture-static"
            role="img"
            aria-label="Capture-backed abstract map of 15 sampled regions; ${model.illuminatedSegments.length} regions were observed illuminated"
          >
            ${model.cells.map(
              (colour) => html`
                <span
                  class="preview-cell"
                  style="--preview-colour: ${rgbToHex(colour)}"
                  aria-hidden="true"
                ></span>
              `,
            )}
          </div>
          ${this.captureEvidence(model)}
        `;
      case "capture-directional-sweep": {
        const activeLane = this.directionalSweepLane(model);
        const activeLanes = directionalSweepLanes(model, activeLane);
        const activeBands = new Map(
          activeLanes.map((lane, band) => [lane, band]),
        );
        const stepMilliseconds = directionalSweepStepMilliseconds(model);
        const fullCircuitMilliseconds =
          directionalSweepFullCircuitMilliseconds(model);
        const motionDescription = model.motionUsesReviewedDefaultSpeed
          ? `The reviewed visual repeat is ${model.periodSeconds.toFixed(
              3,
            )} seconds at Default speed. One band completes the logical 15-lane circuit in ${(
              fullCircuitMilliseconds / 1000
            ).toFixed(3)} seconds.`
          : "Timing and motion were observed only at Default speed. This non-default Speed selection freezes a phase-separated capture snapshot.";
        return html`
          <div
            class="directional-sweep"
            role="img"
            aria-label="Capture-backed abstract directional sweep towards the ${model.direction ===
            "towards_first_segment"
              ? "first"
              : "last"} sampled region, with ${model.travellingBands} phase-separated travelling bands. ${motionDescription}"
            data-preview-seed=${model.seed}
            data-logical-lane=${activeLane}
            data-logical-lanes=${activeLanes.join(",")}
            data-phase-separation=${phaseSeparation(model)}
            data-step-interval-ms=${stepMilliseconds.toFixed(3)}
            data-full-circuit-ms=${fullCircuitMilliseconds.toFixed(3)}
            data-observed-repeat-ms=${(model.periodSeconds * 1000).toFixed(3)}
            data-motion-state=${model.motionUsesReviewedDefaultSpeed
              ? "default"
              : "snapshot"}
          >
            <div
              class="sweep-track"
              style="--sweep-base: ${rgbToHex(
                model.baseColour,
              )}; --sweep-band: ${rgbToHex(model.bandColour)}"
              aria-hidden="true"
            >
              ${Array.from({ length: LOGICAL_LANE_COUNT }, (_, lane) => {
                const band = activeBands.get(lane);
                const current = band !== undefined;
                return html`
                  <span
                    class="sweep-cell ${current ? "current" : ""}"
                    data-logical-lane=${lane}
                  >
                    ${current
                      ? html`
                          <span
                            class="sweep-band"
                            data-logical-band=${band}
                          ></span>
                        `
                      : nothing}
                  </span>
                `;
              })}
            </div>
          </div>
          <p class="motion-note" role="note">${motionDescription}</p>
          ${this.captureEvidence(model)}
        `;
      }
      case "custom-animation": {
        const cells = this.customAnimationCells(model);
        const motion =
          model.effect === "marquee"
            ? `Palette bands move towards the last segment in groups of ${model.bandWidthSegments}.`
            : model.effect === "fade"
              ? "The whole strip blends between palette colours."
              : "The whole strip changes abruptly between palette colours.";
        return html`
          <div
            class="custom-animation"
            role="img"
            aria-label="${model.title}. ${motion}"
            data-effect=${model.effect}
            data-segment-count=${model.segmentCount}
            data-speed-percent=${model.speedPercent}
            data-phase-ms=${model.phaseMilliseconds.toFixed(3)}
          >
            <div
              class="custom-animation-track"
              style="grid-template-columns: repeat(${model.segmentCount}, minmax(0, 1fr))"
              aria-hidden="true"
            >
              ${cells.map(
                (colour, index) => html`
                  <span
                    class="custom-animation-cell"
                    data-segment=${index}
                    style="--preview-colour: ${rgbToHex(colour)}"
                  ></span>
                `,
              )}
            </div>
          </div>
          <p class="motion-note" role="note">${motion}</p>
        `;
      }
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

  private captureEvidence(
    model:
      | Extract<
          EffectPreviewModel,
          { kind: "capture-static" | "capture-directional-sweep" }
        >
      | undefined,
  ) {
    if (!model) {
      return nothing;
    }
    return html`
      <div class="capture-evidence" role="note">
        <p>
          This is a reviewed recorded capture with spatial lane calibration from
          corpus ${model.evidence.corpusId}.  Camera colour is uncalibrated.
          The abstract regions are not physical LED geometry.
        </p>
        <ul aria-label="Capture evidence limitations">
          ${model.limitations.map((limitation) => html`<li>${limitation}</li>`)}
        </ul>
      </div>
    `;
  }

  private readonly motionChanged = (): void => {
    this.configureDirectionalSweep();
    this.requestUpdate();
  };

  private configureDirectionalSweep(): void {
    const model = this.model;
    if (model?.kind !== "capture-directional-sweep") {
      this.pauseDirectionalSweep();
      this.sweepKey = undefined;
      return;
    }
    const key = `${model.identity.sku}:${model.identity.sceneId}:${model.identity.effectId}:${model.seed}`;
    if (this.sweepKey !== key) {
      this.pauseDirectionalSweep();
      this.sweepKey = key;
      this.sweepElapsedMilliseconds = 0;
      this.sweepCompletedSteps = 0;
      this.sweepLane = model.initialStep;
      this.sweepTransitionSequence = 0;
    }
    if (
      !this.previewVisible ||
      this.motionQuery?.matches ||
      !model.motionUsesReviewedDefaultSpeed
    ) {
      this.pauseDirectionalSweep();
      return;
    }
    if (this.sweepRunningSince === undefined) {
      this.sweepRunningSince = performance.now();
    }
    const stepMilliseconds = directionalSweepStepMilliseconds(model);
    const elapsed = this.sweepElapsedMilliseconds + (performance.now() - this.sweepRunningSince);
    const completedSteps = Math.floor(elapsed / stepMilliseconds);
    while (this.sweepCompletedSteps < completedSteps) {
      const previousLane = this.sweepLane;
      const previousLanes = directionalSweepLanes(model, previousLane);
      this.sweepCompletedSteps += 1;
      this.sweepLane = laneAfterSteps(model, this.sweepCompletedSteps);
      this.dispatchEvent(
        new CustomEvent<PreviewSweepLaneChange>("preview-sweep-lane-change", {
          detail: {
            lane: this.sweepLane,
            previousLane,
            sequence: this.sweepTransitionSequence,
            lanes: directionalSweepLanes(model, this.sweepLane),
            previousLanes,
          },
          bubbles: true,
          composed: true,
        }),
      );
      this.sweepTransitionSequence += 1;
    }
    window.clearTimeout(this.sweepTimeout);
    this.sweepTimeout = window.setTimeout(() => {
      this.configureDirectionalSweep();
      this.requestUpdate();
    }, Math.max(1, stepMilliseconds - (elapsed % stepMilliseconds)));
  }

  private pauseDirectionalSweep(): void {
    if (this.sweepRunningSince !== undefined) {
      this.sweepElapsedMilliseconds += performance.now() - this.sweepRunningSince;
      this.sweepRunningSince = undefined;
    }
    window.clearTimeout(this.sweepTimeout);
    this.sweepTimeout = undefined;
  }

  private configureCustomAnimation(): void {
    const model = this.model;
    if (model?.kind !== "custom-animation") {
      this.pauseCustomAnimation();
      this.customAnimationKey = undefined;
      return;
    }
    const key = `${model.effect}:${model.segmentCount}:${model.speedPercent}:${model.palette
      .map(rgbToHex)
      .join(",")}`;
    if (this.customAnimationKey !== key) {
      this.pauseCustomAnimation();
      this.customAnimationKey = key;
      this.customAnimationElapsedMilliseconds = 0;
    }
    if (!this.previewVisible || this.motionQuery?.matches) {
      this.pauseCustomAnimation();
      return;
    }
    if (this.customAnimationRunningSince === undefined) {
      this.customAnimationRunningSince = performance.now();
    }
    window.clearTimeout(this.customAnimationTimeout);
    this.customAnimationTimeout = window.setTimeout(() => {
      this.customAnimationSequence += 1;
    }, model.effect === "jumping" ? 100 : 33);
  }

  private pauseCustomAnimation(): void {
    if (this.customAnimationRunningSince !== undefined) {
      this.customAnimationElapsedMilliseconds +=
        performance.now() - this.customAnimationRunningSince;
      this.customAnimationRunningSince = undefined;
    }
    window.clearTimeout(this.customAnimationTimeout);
    this.customAnimationTimeout = undefined;
  }

  private customAnimationCells(
    model: Extract<EffectPreviewModel, { kind: "custom-animation" }>,
  ): RGB[] {
    const palette = model.palette.length
      ? model.palette
      : ([[0, 0, 0]] as RGB[]);
    const elapsed =
      this.customAnimationElapsedMilliseconds +
      (this.customAnimationRunningSince === undefined
        ? 0
        : performance.now() - this.customAnimationRunningSince);
    if (model.effect === "jumping") {
      const colour =
        palette[Math.floor(elapsed / model.phaseMilliseconds) % palette.length];
      return Array.from({ length: model.segmentCount }, () => [...colour] as RGB);
    }
    if (model.effect === "fade") {
      const phase = elapsed / model.phaseMilliseconds;
      const fromIndex = Math.floor(phase) % palette.length;
      const toIndex = (fromIndex + 1) % palette.length;
      const rawProgress = phase - Math.floor(phase);
      const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      const colour = interpolateColour(
        palette[fromIndex],
        palette[toIndex],
        progress,
      );
      return Array.from({ length: model.segmentCount }, () => [...colour] as RGB);
    }
    const step = Math.floor(elapsed / model.phaseMilliseconds);
    const cycleWidth = model.bandWidthSegments * palette.length;
    return Array.from({ length: model.segmentCount }, (_, segment) => {
      const position = positiveModulo(segment - step, cycleWidth);
      const paletteIndex = Math.floor(position / model.bandWidthSegments);
      return [...palette[paletteIndex]] as RGB;
    });
  }

  private directionalSweepLane(
    model: Extract<EffectPreviewModel, { kind: "capture-directional-sweep" }>,
  ): number {
    const key = `${model.identity.sku}:${model.identity.sceneId}:${model.identity.effectId}:${model.seed}`;
    return this.sweepKey === key ? this.sweepLane : model.initialStep;
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
        ${fidelity === "capture_backed"
          ? "Capture-backed"
          : fidelity === "deterministic"
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

    .fidelity.capture_backed {
      color: var(--primary-color, #2f6fed);
      border-color: color-mix(
        in srgb,
        var(--primary-color, #2f6fed) 50%,
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

    .directional-sweep {
      min-width: 0;
    }

    .sweep-track {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
      min-height: 48px;
      direction: ltr;
      border-radius: 6px;
    }

    .sweep-cell {
      position: relative;
      display: grid;
      place-items: stretch;
      border: 1px solid color-mix(in srgb, var(--sweep-base) 70%, #000);
      border-radius: 5px;
      background: var(--sweep-base);
    }

    .sweep-cell.current {
      border-color: color-mix(in srgb, var(--sweep-band) 70%, #000);
    }

    .sweep-band {
      display: block;
      min-width: 100%;
      min-height: 100%;
      border-radius: 2px;
      background: var(--sweep-band);
    }

    .custom-animation-track {
      display: grid;
      gap: 4px;
      min-height: 48px;
      direction: ltr;
    }

    .custom-animation-cell {
      display: block;
      min-width: 0;
      min-height: 48px;
      border: 1px solid
        color-mix(in srgb, var(--preview-colour) 70%, #000);
      border-radius: 5px;
      background: var(--preview-colour);
    }

    .capture-evidence {
      margin-top: 12px;
      color: var(--preview-muted);
      font-size: 12px;
      line-height: 1.45;
    }

    .capture-evidence p {
      margin-bottom: 6px;
    }

    .capture-evidence ul {
      margin: 0;
      padding-inline-start: 20px;
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

      .sweep-track {
        gap: 3px;
        min-height: 38px;
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

function interpolateColour(from: RGB, to: RGB, progress: number): RGB {
  return from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * progress),
  ) as RGB;
}

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function laneAfterSteps(
  model: Extract<EffectPreviewModel, { kind: "capture-directional-sweep" }>,
  completedSteps: number,
): number {
  const direction = model.direction === "towards_first_segment" ? -1 : 1;
  const lane = (model.initialStep + direction * completedSteps) % LOGICAL_LANE_COUNT;
  return lane < 0 ? lane + LOGICAL_LANE_COUNT : lane;
}

function directionalSweepLanes(
  model: Extract<EffectPreviewModel, { kind: "capture-directional-sweep" }>,
  leadingLane: number,
): number[] {
  return Array.from({ length: model.travellingBands }, (_, band) => {
    const offset = Math.round((band * LOGICAL_LANE_COUNT) / model.travellingBands);
    const lane = (leadingLane + offset) % LOGICAL_LANE_COUNT;
    return lane < 0 ? lane + LOGICAL_LANE_COUNT : lane;
  });
}

function phaseSeparation(
  model: Extract<EffectPreviewModel, { kind: "capture-directional-sweep" }>,
): number {
  return Math.round(LOGICAL_LANE_COUNT / model.travellingBands);
}

function directionalSweepFullCircuitMilliseconds(
  model: Extract<EffectPreviewModel, { kind: "capture-directional-sweep" }>,
): number {
  return model.periodSeconds * model.travellingBands * 1000;
}

function directionalSweepStepMilliseconds(
  model: Extract<EffectPreviewModel, { kind: "capture-directional-sweep" }>,
): number {
  return directionalSweepFullCircuitMilliseconds(model) / LOGICAL_LANE_COUNT;
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-effect-preview": GoveeEffectPreview;
  }
}
