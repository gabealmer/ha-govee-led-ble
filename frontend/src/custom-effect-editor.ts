import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { rgbToHex } from "./palette-editor";
import "./palette-editor";
import type {
  CustomEffectCatalogue,
  EffectPair,
  MultiContent,
  RGB,
  SingleContent,
} from "./types";

type PaletteContent = SingleContent | MultiContent;

export class GoveeCustomEffectEditor extends LitElement {
  @property({ attribute: false })
  public content?: PaletteContent;

  @property({ attribute: false })
  public catalogue?: CustomEffectCatalogue;

  @property({ type: Boolean })
  public disabled = false;

  @state()
  private pickerIndex?: number;

  @state()
  private previewEffectIndex = 0;

  private draggedEffectIndex?: number;

  private readonly windowKeyPressed = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.pickerIndex !== undefined) {
      event.preventDefault();
      this.closePicker();
    }
  };

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.windowKeyPressed);
  }

  public disconnectedCallback(): void {
    window.removeEventListener("keydown", this.windowKeyPressed);
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    if (
      changed.has("pickerIndex") &&
      this.pickerIndex !== undefined
    ) {
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>(".modal-close")
        ?.focus();
    }
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (!changed.has("content") || !this.content) {
      return;
    }
    const maximum =
      this.content.kind === "h617a_multi"
        ? this.content.effects.length - 1
        : 0;
    this.previewEffectIndex = Math.max(
      0,
      Math.min(this.previewEffectIndex, maximum),
    );
  }

  protected render() {
    if (!this.content || !this.catalogue) {
      return nothing;
    }

    return html`
      <section class="card effect-card">
        <h3>${this.content.kind === "h617a_multi" ? "Effects" : "Effect"}</h3>
        ${this.content.kind === "h617a_single"
          ? this.effectRow(this.content, 0)
          : this.renderSequence(this.content)}
      </section>

      <section class="preview-card" aria-label="Effect preview">
        ${this.content.kind === "h617a_multi"
          ? html`
              <div class="preview-tabs" aria-label="Preview sequence effect">
                ${this.content.effects.map((pair, index) => {
                  const selected = index === this.previewEffectIndex;
                  return html`
                    <button
                      type="button"
                      class=${selected ? "selected" : ""}
                      aria-pressed=${selected}
                      @click=${() => {
                        this.previewEffectIndex = index;
                      }}
                    >
                      ${this.effectLabel(pair)}
                    </button>
                  `;
                })}
              </div>
            `
          : nothing}
        ${this.effectVisual(this.previewPair, "preview-row")}
      </section>

      <section class="card parameters-card">
        <h3>Parameters</h3>
        <div class="parameter-group">
          <h4>Colours</h4>
          ${this.renderPalette()}
        </div>
        <div class="parameter-group speed-group">
          <h4>Speed</h4>
          <label class="range-field">
            <span>Speed</span>
            <input
              type="range"
              min="0"
              max="100"
              .value=${String(this.content.speed)}
              ?disabled=${this.disabled}
              @input=${(event: Event) =>
                this.emitContent({
                  ...this.content!,
                  speed: Number((event.target as HTMLInputElement).value),
                })}
            />
            <output>${this.content.speed}%</output>
          </label>
        </div>
      </section>

      ${this.pickerIndex === undefined ? nothing : this.renderPicker()}
    `;
  }

  private get previewPair(): EffectPair {
    if (!this.content) {
      return { family: 0, variant: 0 };
    }
    if (this.content.kind === "h617a_single") {
      return this.content;
    }
    return (
      this.content.effects[
        Math.min(this.previewEffectIndex, this.content.effects.length - 1)
      ] ?? this.content.effects[0]
    );
  }

  private renderSequence(content: MultiContent) {
    return html`
      <ol class="sequence">
        ${content.effects.map((pair, index) => this.effectRow(pair, index))}
      </ol>
      <button
        class="add-step"
        type="button"
        title="Add another effect"
        aria-label="Add another effect"
        ?disabled=${this.disabled ||
        content.effects.length >= this.catalogue!.limits.multi_max}
        @click=${this.addEffect}
      >
        +
      </button>
    `;
  }

  private effectRow(pair: EffectPair, index: number) {
    const multi = this.content?.kind === "h617a_multi";
    return html`
      <li
        class="effect-row"
        draggable=${multi && !this.disabled ? "true" : "false"}
        @dragstart=${(event: DragEvent) =>
          this.effectDragStarted(index, event)}
        @dragover=${(event: DragEvent) => {
          if (multi && !this.disabled) {
            event.preventDefault();
          }
        }}
        @drop=${(event: DragEvent) => this.effectDropped(index, event)}
      >
        <button
          class="effect-field"
          type="button"
          data-effect-index=${index}
          aria-label="Choose effect, current ${this.effectLabel(pair)}"
          ?disabled=${this.disabled}
          @click=${() => this.openPicker(index)}
        >
          ${this.effectVisual(pair, "effect-swatch")}
          <span class="effect-name">${this.effectLabel(pair)}</span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
        ${multi && !this.disabled
          ? html`
              <details class="row-menu">
                <summary aria-label="Reorder or remove effect ${index + 1}">
                  ⋮
                </summary>
                <div class="row-menu-popover">
                  <button
                    type="button"
                    ?disabled=${this.disabled || index === 0}
                    @click=${(event: Event) => {
                      this.closeDetails(event);
                      this.moveEffect(index, -1);
                    }}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    ?disabled=${this.disabled ||
                    index ===
                      (this.content as MultiContent).effects.length - 1}
                    @click=${(event: Event) => {
                      this.closeDetails(event);
                      this.moveEffect(index, 1);
                    }}
                  >
                    Move down
                  </button>
                  <button
                    class="danger"
                    type="button"
                    ?disabled=${this.disabled ||
                    (this.content as MultiContent).effects.length === 1}
                    @click=${(event: Event) => {
                      this.closeDetails(event);
                      this.removeEffect(index);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </details>
            `
          : nothing}
      </li>
    `;
  }

  private renderPalette() {
    return html`
      <govee-palette-editor
        .palette=${this.content!.palette}
        .minColours=${this.catalogue!.limits.palette_min}
        .maxColours=${this.catalogue!.limits.palette_max}
        .disabled=${this.disabled}
        @palette-changed=${(event: CustomEvent<{ palette: RGB[] }>) => {
          this.emitContent({
            ...this.content!,
            palette: clonePalette(event.detail.palette),
          });
        }}
      ></govee-palette-editor>
    `;
  }

  private renderPicker() {
    const current =
      this.content?.kind === "h617a_single"
        ? this.content
        : this.content?.effects[this.pickerIndex ?? 0];
    return html`
      <div
        class="modal-overlay"
        @click=${(event: MouseEvent) => {
          if (event.target === event.currentTarget) {
            this.closePicker();
          }
        }}
      >
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="effect-picker-title"
          @keydown=${this.modalKeyPressed}
        >
          <div class="modal-header">
            <div>
              <h3 id="effect-picker-title">Select an effect</h3>
              <p>Choose the visual style for this step.</p>
            </div>
            <button
              class="modal-close"
              type="button"
              aria-label="Close effect picker"
              @click=${() => this.closePicker()}
            >
              ×
            </button>
          </div>
          <div class="modal-grid">
            ${this.catalogue!.effects.map((effect) => {
              const selected =
                current !== undefined &&
                pairKey(effect) === pairKey(current);
              return html`
                <button
                  class="effect-tile ${selected ? "selected" : ""}"
                  type="button"
                  aria-pressed=${selected}
                  @click=${() => this.selectEffect(effect)}
                >
                  ${this.effectVisual(effect, "tile-thumb")}
                  <span>${effect.label}</span>
                </button>
              `;
            })}
          </div>
        </section>
      </div>
    `;
  }

  private effectVisual(pair: EffectPair, className: string) {
    return html`
      <span class="effect-visual ${className} ${this.effectId(pair)}">
        ${Array.from({ length: 15 }, (_, index) => {
          const palette = this.content?.palette ?? [[255, 255, 255]];
          return html`
            <i
              style="--cell-index: ${index}; --cell-colour: ${rgbToHex(
                palette[index % palette.length],
              )}"
            ></i>
          `;
        })}
      </span>
    `;
  }

  private selectEffect(selected: EffectPair): void {
    if (!this.content || this.pickerIndex === undefined) {
      return;
    }
    const pair = {
      family: selected.family,
      variant: selected.variant,
    };
    if (this.content.kind === "h617a_single") {
      this.emitContent({ ...this.content, ...pair });
    } else {
      const effects = this.content.effects.map((effect, index) =>
        index === this.pickerIndex ? pair : effect,
      );
      this.previewEffectIndex = this.pickerIndex;
      this.emitContent({ ...this.content, effects });
    }
    this.closePicker();
  }

  private addEffect(): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const next =
      this.catalogue?.effects[this.content.effects.length] ??
      this.catalogue?.effects[0];
    if (!next) {
      return;
    }
    const effects = [
      ...this.content.effects,
      { family: next.family, variant: next.variant },
    ];
    this.previewEffectIndex = effects.length - 1;
    this.emitContent({ ...this.content, effects });
  }

  private removeEffect(index: number): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const effects = this.content.effects.filter(
      (_effect, effectIndex) => effectIndex !== index,
    );
    this.previewEffectIndex = Math.min(
      this.previewEffectIndex,
      effects.length - 1,
    );
    this.emitContent({ ...this.content, effects });
  }

  private moveEffect(index: number, offset: number): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const target = index + offset;
    if (target < 0 || target >= this.content.effects.length) {
      return;
    }
    this.reorderEffect(index, target);
  }

  private reorderEffect(from: number, to: number): void {
    if (!this.content || this.content.kind !== "h617a_multi" || from === to) {
      return;
    }
    const effects = [...this.content.effects];
    const [moving] = effects.splice(from, 1);
    effects.splice(to, 0, moving);
    this.previewEffectIndex = relocatedIndex(
      this.previewEffectIndex,
      from,
      to,
    );
    this.emitContent({ ...this.content, effects });
  }

  private effectDragStarted(index: number, event: DragEvent): void {
    this.draggedEffectIndex = index;
    event.dataTransfer?.setData("text/plain", String(index));
  }

  private effectDropped(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedEffectIndex === undefined) {
      return;
    }
    this.reorderEffect(this.draggedEffectIndex, index);
    this.draggedEffectIndex = undefined;
  }

  private closeDetails(event: Event): void {
    (event.currentTarget as HTMLElement).closest("details")?.removeAttribute(
      "open",
    );
  }

  private openPicker(index: number): void {
    this.pickerIndex = index;
  }

  private closePicker(): void {
    const index = this.pickerIndex;
    this.pickerIndex = undefined;
    void this.updateComplete.then(() => {
      if (index !== undefined) {
        this.shadowRoot
          ?.querySelector<HTMLButtonElement>(
            `[data-effect-index="${index}"]`,
          )
          ?.focus();
      }
    });
  }

  private modalKeyPressed(event: KeyboardEvent): void {
    if (event.key !== "Tab") {
      return;
    }
    const modal = event.currentTarget as HTMLElement;
    const focusable = [
      ...modal.querySelectorAll<HTMLButtonElement>(
        'button:not([disabled])',
      ),
    ];
    if (!focusable.length) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.shadowRoot?.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private effectId(pair: EffectPair): string {
    return (
      this.catalogue?.effects.find(
        (effect) => pairKey(effect) === pairKey(pair),
      )?.id ?? "unknown"
    );
  }

  private effectLabel(pair: EffectPair): string {
    return (
      this.catalogue?.effects.find(
        (effect) => pairKey(effect) === pairKey(pair),
      )?.label ?? `Family ${pair.family}, style ${pair.variant}`
    );
  }

  private emitContent(content: PaletteContent): void {
    this.dispatchEvent(
      new CustomEvent<{ content: PaletteContent }>("content-changed", {
        detail: { content },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = css`
    :host {
      display: block;
      --studio-blue: var(--primary-color, #2f6fed);
      --studio-blue-soft: color-mix(
        in srgb,
        var(--studio-blue) 13%,
        transparent
      );
      --studio-border: var(--divider-color, #d8dce2);
      --studio-card: var(--card-background-color, #fff);
      --studio-muted: var(--secondary-text-color, #68707c);
      --studio-danger: var(--error-color, #db4437);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    button {
      min-height: 44px;
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
      margin-bottom: 12px;
      font-size: 14px;
    }

    .card,
    .preview-card {
      border: 1px solid var(--studio-border);
      border-radius: 10px;
      background: var(--studio-card);
    }

    .card {
      padding: 18px;
    }

    .preview-card,
    .parameters-card {
      margin-top: 16px;
    }

    .sequence {
      display: grid;
      gap: 8px;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
    }

    .effect-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .effect-row[draggable="true"] {
      cursor: grab;
    }

    .effect-field {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 12px;
      min-width: 0;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
      cursor: pointer;
    }

    .effect-name {
      flex: 1;
      overflow: hidden;
      text-align: start;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chevron {
      color: var(--studio-muted);
      font-size: 20px;
    }

    .row-menu {
      position: relative;
      flex: 0 0 44px;
    }

    .row-menu summary {
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--studio-muted);
      background: var(--studio-card);
      cursor: pointer;
      list-style: none;
      font-size: 22px;
    }

    .row-menu summary::-webkit-details-marker {
      display: none;
    }

    .row-menu-popover {
      position: absolute;
      z-index: 20;
      top: 50px;
      right: 0;
      display: grid;
      width: 150px;
      padding: 6px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .row-menu-popover button {
      padding: 8px 10px;
      border: 0;
      border-radius: 6px;
      color: var(--primary-text-color);
      background: transparent;
      text-align: start;
      cursor: pointer;
    }

    .danger {
      color: var(--studio-danger) !important;
    }

    .add-step,
    .palette-add {
      display: grid;
      width: 44px;
      height: 44px;
      place-items: center;
      padding: 0;
      border: 1px dashed var(--studio-border);
      border-radius: 8px;
      color: var(--studio-blue);
      background: transparent;
      cursor: pointer;
      font-size: 24px;
    }

    .preview-card {
      padding: 16px;
    }

    .preview-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      margin-bottom: 10px;
      padding-bottom: 2px;
    }

    .preview-tabs button {
      flex: 0 0 auto;
      min-height: 40px;
      padding: 7px 12px;
      border: 1px solid var(--studio-border);
      border-radius: 999px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .preview-tabs button.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
      font-weight: 650;
    }

    .effect-visual {
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 3px;
      overflow: hidden;
      padding: 4px;
      border-radius: 8px;
      background: color-mix(
        in srgb,
        var(--studio-border) 50%,
        var(--studio-card)
      );
    }

    .effect-visual i {
      display: block;
      min-width: 0;
      border-radius: 3px;
      background: var(--cell-colour);
      transform-origin: center;
    }

    .effect-swatch {
      flex: 0 0 52px;
      width: 52px;
      height: 30px;
      gap: 1px;
      padding: 3px;
      border-radius: 6px;
    }

    .effect-swatch i {
      animation: none !important;
      transform: none;
      border-radius: 1px;
    }

    .effect-swatch.fade i {
      opacity: 0.72;
    }

    .effect-swatch.jumping i {
      opacity: 0.18;
    }

    .effect-swatch.jumping i:nth-child(-n + 5) {
      opacity: 1;
    }

    .effect-swatch.marquee i {
      opacity: 0.14;
    }

    .effect-swatch.marquee i:nth-child(-n + 3) {
      opacity: 1;
    }

    .effect-swatch.chasing i {
      opacity: 0.14;
    }

    .effect-swatch.chasing i:nth-child(4n + 1) {
      opacity: 1;
    }

    .preview-row {
      min-height: 48px;
    }

    .tile-thumb {
      width: 100%;
      height: 44px;
    }

    .fade i {
      animation: fade 2.8s ease-in-out infinite alternate;
      animation-delay: calc(var(--cell-index) * -120ms);
    }

    .jumping i {
      animation: jumping 1.6s steps(1) infinite;
      animation-delay: calc(var(--cell-index) * -90ms);
    }

    .marquee i {
      animation: marquee 1.8s linear infinite;
      animation-delay: calc(var(--cell-index) * -120ms);
    }

    .chasing i {
      animation: chasing 1.35s linear infinite;
      animation-delay: calc(var(--cell-index) * -90ms);
    }

    .parameter-group + .parameter-group {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
    }

    .palette-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .swatch-item {
      position: relative;
      touch-action: pan-y;
    }

    .swatch-item[draggable="true"] {
      cursor: grab;
    }

    .swatch {
      width: 44px;
      height: 44px;
      padding: 0;
      border: 1px solid rgb(0 0 0 / 14%);
      border-radius: 8px;
      background: var(--swatch-colour);
      cursor: pointer;
    }

    .swatch:focus-visible {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
    }

    .colour-popover {
      position: absolute;
      z-index: 25;
      top: 52px;
      left: 0;
      width: min(300px, calc(100vw - 48px));
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    .preset-grid button {
      min-height: 52px;
      border: 1px solid rgb(0 0 0 / 12%);
      border-radius: 6px;
      background: var(--preset-colour);
      cursor: pointer;
    }

    .custom-colour {
      display: grid;
      grid-template-columns: 1fr 64px;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .custom-colour input {
      width: 64px;
      height: 44px;
      padding: 3px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      background: var(--studio-card);
    }

    .colour-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-top: 10px;
    }

    .colour-actions button {
      padding: 8px 10px;
      border: 1px solid var(--studio-border);
      border-radius: 7px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .colour-actions .danger {
      grid-column: 1 / -1;
    }

    .range-field {
      display: grid;
      grid-template-columns: 70px minmax(100px, 1fr) 44px;
      align-items: center;
      gap: 10px;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .range-field output {
      color: var(--primary-text-color);
      text-align: end;
    }

    .modal-overlay {
      position: fixed;
      z-index: 1000;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgb(0 0 0 / 48%);
    }

    .modal {
      width: min(680px, 100%);
      max-height: min(760px, calc(100vh - 48px));
      overflow: auto;
      padding: 18px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      background: var(--studio-card);
      box-shadow: 0 16px 48px rgb(0 0 0 / 28%);
    }

    .modal-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
    }

    .modal-header h3 {
      margin-bottom: 4px;
      font-size: 18px;
    }

    .modal-header p {
      margin-bottom: 0;
      color: var(--studio-muted);
      font-size: 13px;
    }

    .modal-close {
      flex: 0 0 44px;
      width: 44px;
      padding: 0;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
      font-size: 22px;
    }

    .modal-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .effect-tile {
      display: grid;
      gap: 8px;
      min-width: 0;
      padding: 9px;
      border: 2px solid transparent;
      border-radius: 9px;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
      text-align: start;
      cursor: pointer;
    }

    .effect-tile.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      font-weight: 650;
    }

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.52;
    }

    .effect-field:disabled,
    .swatch:disabled {
      cursor: default;
      opacity: 1;
    }

    @keyframes fade {
      0% {
        opacity: 0.18;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes jumping {
      0%,
      30% {
        opacity: 1;
      }
      31%,
      100% {
        opacity: 0.2;
      }
    }

    @keyframes marquee {
      0%,
      20% {
        opacity: 1;
        transform: scaleY(1);
      }
      21%,
      100% {
        opacity: 0.12;
        transform: scaleY(0.55);
      }
    }

    @keyframes chasing {
      0%,
      12% {
        opacity: 1;
        transform: scale(1);
      }
      13%,
      100% {
        opacity: 0.16;
        transform: scale(0.7);
      }
    }

    @media (max-width: 600px) {
      .colour-popover {
        position: fixed;
        top: 50%;
        right: 24px;
        left: 24px;
        width: auto;
        max-height: calc(100vh - 48px);
        overflow: auto;
        transform: translateY(-50%);
      }

      .modal-overlay {
        align-items: end;
        padding: 12px;
      }

      .modal {
        max-height: calc(100vh - 24px);
      }

      .modal-grid {
        grid-template-columns: 1fr;
      }

      .preview-tabs {
        gap: 4px;
      }

      .preview-tabs button {
        min-height: 44px;
        padding-inline: 9px;
        font-size: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .effect-visual i {
        animation: none !important;
      }
    }
  `;
}

function pairKey(pair: EffectPair): string {
  return `${pair.family}:${pair.variant}`;
}

function clonePalette(palette: RGB[]): RGB[] {
  return palette.map((colour) => [...colour] as RGB);
}

function relocatedIndex(
  current: number,
  from: number,
  to: number,
): number;
function relocatedIndex(
  current: number | undefined,
  from: number,
  to: number,
): number | undefined;
function relocatedIndex(
  current: number | undefined,
  from: number,
  to: number,
): number | undefined {
  if (current === undefined || from === to) {
    return current;
  }
  if (current === from) {
    return to;
  }
  if (from < to && current > from && current <= to) {
    return current - 1;
  }
  if (to < from && current >= to && current < from) {
    return current + 1;
  }
  return current;
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-custom-effect-editor": GoveeCustomEffectEditor;
  }
}

if (!customElements.get("govee-custom-effect-editor")) {
  customElements.define(
    "govee-custom-effect-editor",
    GoveeCustomEffectEditor,
  );
}
