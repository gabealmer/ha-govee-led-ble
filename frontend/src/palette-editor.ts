import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import type { RGB } from "./types";

const PRESET_COLOURS: RGB[] = [
  [255, 69, 58],
  [255, 159, 10],
  [255, 214, 10],
  [48, 209, 88],
  [10, 132, 255],
  [94, 92, 230],
  [191, 90, 242],
  [255, 45, 85],
];

export class GoveePaletteEditor extends LitElement {
  @property({ attribute: false })
  public palette: RGB[] = [];

  @property({ type: Number })
  public minColours = 1;

  @property({ type: Number })
  public maxColours = 8;

  @property({ type: Boolean })
  public disabled = false;

  @state()
  private editingIndex?: number;

  private draggedIndex?: number;
  private pointerId?: number;
  private pointerIndex?: number;
  private pointerX = 0;
  private pointerY = 0;
  private pointerMoved = false;
  private suppressClick = false;

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (
      changed.has("palette") &&
      this.editingIndex !== undefined &&
      this.editingIndex >= this.palette.length
    ) {
      this.editingIndex = undefined;
    }
  }

  protected render() {
    return html`
      <ul class="palette-list" aria-label="Colours">
        ${this.palette.map(
          (colour, index) => html`
            <li
              class="swatch-item"
              data-colour-index=${index}
              draggable=${this.disabled ? "false" : "true"}
              @dragstart=${(event: DragEvent) =>
                this.dragStarted(index, event)}
              @dragover=${(event: DragEvent) => {
                if (!this.disabled) {
                  event.preventDefault();
                }
              }}
              @drop=${(event: DragEvent) => this.dropped(index, event)}
              @pointerdown=${(event: PointerEvent) =>
                this.pointerStarted(index, event)}
              @pointermove=${this.pointerMovedOver}
              @pointerup=${this.pointerFinished}
              @pointercancel=${this.pointerFinished}
            >
              <button
                class="swatch"
                type="button"
                data-colour-index=${index}
                style="--swatch-colour: ${rgbToHex(colour)}"
                aria-label="Edit colour ${index + 1}, ${rgbToHex(
                  colour,
                )}. Drag to reorder or use arrow keys."
                ?disabled=${this.disabled}
                @click=${() => this.toggleEditor(index)}
                @keydown=${(event: KeyboardEvent) =>
                  this.keyPressed(index, event)}
              ></button>
              ${this.editingIndex === index
                ? this.renderPopover(index, colour)
                : nothing}
            </li>
          `,
        )}
        <li>
          <button
            class="palette-add"
            type="button"
            title="Add colour"
            aria-label="Add colour"
            ?disabled=${this.disabled ||
            this.palette.length >= this.maxColours}
            @click=${this.addColour}
          >
            +
          </button>
        </li>
      </ul>
    `;
  }

  private renderPopover(index: number, colour: RGB) {
    return html`
      <div class="colour-popover" role="dialog" aria-label="Edit colour">
        <div class="preset-grid">
          ${PRESET_COLOURS.map(
            (preset) => html`
              <button
                type="button"
                style="--preset-colour: ${rgbToHex(preset)}"
                aria-label="Use ${rgbToHex(preset)}"
                ?disabled=${this.disabled}
                @click=${() => this.updateColour(index, preset)}
              ></button>
            `,
          )}
        </div>
        <label class="custom-colour">
          <span>Custom colour</span>
          <input
            type="color"
            .value=${rgbToHex(colour)}
            ?disabled=${this.disabled}
            @input=${(event: Event) =>
              this.updateColour(
                index,
                hexToRgb((event.target as HTMLInputElement).value),
              )}
          />
        </label>
        <div class="colour-actions">
          <button
            type="button"
            ?disabled=${this.disabled || index === 0}
            @click=${() => this.moveColour(index, -1, true)}
          >
            Move left
          </button>
          <button
            type="button"
            ?disabled=${this.disabled || index === this.palette.length - 1}
            @click=${() => this.moveColour(index, 1, true)}
          >
            Move right
          </button>
          <button
            class="danger"
            type="button"
            ?disabled=${this.disabled || this.palette.length <= this.minColours}
            @click=${() => this.removeColour(index)}
          >
            Remove
          </button>
        </div>
      </div>
    `;
  }

  private updateColour(index: number, colour: RGB): void {
    const palette = clonePalette(this.palette);
    palette[index] = [...colour];
    this.emitPalette(palette);
  }

  private addColour(): void {
    if (this.disabled || this.palette.length >= this.maxColours) {
      return;
    }
    const previous =
      this.palette[this.palette.length - 1] ??
      PRESET_COLOURS[this.palette.length % PRESET_COLOURS.length];
    const palette = [...clonePalette(this.palette), [...previous] as RGB];
    this.editingIndex = palette.length - 1;
    this.emitPalette(palette);
  }

  private removeColour(index: number): void {
    if (this.disabled || this.palette.length <= this.minColours) {
      return;
    }
    const palette = this.palette
      .filter((_colour, colourIndex) => colourIndex !== index)
      .map((colour) => [...colour] as RGB);
    const focusIndex = Math.min(index, palette.length - 1);
    this.editingIndex = undefined;
    this.emitPalette(palette);
    this.focusSwatchAfterUpdate(focusIndex);
  }

  private moveColour(
    index: number,
    offset: number,
    restoreFocus = false,
  ): void {
    const target = index + offset;
    if (
      this.disabled ||
      target < 0 ||
      target >= this.palette.length
    ) {
      return;
    }
    this.reorder(index, target, restoreFocus);
  }

  private reorder(
    from: number,
    to: number,
    restoreFocus = false,
  ): void {
    if (this.disabled || from === to) {
      return;
    }
    const palette = clonePalette(this.palette);
    const [moving] = palette.splice(from, 1);
    palette.splice(to, 0, moving);
    this.editingIndex =
      this.editingIndex === from
        ? to
        : relocatedIndex(this.editingIndex, from, to);
    this.emitPalette(palette);
    if (restoreFocus) {
      this.focusSwatchAfterUpdate(to);
    }
  }

  private focusSwatchAfterUpdate(index: number): void {
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector<HTMLButtonElement>(
          `.swatch[data-colour-index="${index}"]`,
        )
        ?.focus();
    });
  }

  private dragStarted(index: number, event: DragEvent): void {
    if (this.disabled) {
      return;
    }
    this.draggedIndex = index;
    event.dataTransfer?.setData("text/plain", String(index));
  }

  private dropped(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedIndex === undefined) {
      return;
    }
    this.reorder(this.draggedIndex, index);
    this.draggedIndex = undefined;
  }

  private keyPressed(index: number, event: KeyboardEvent): void {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight"
    ) {
      return;
    }
    event.preventDefault();
    this.moveColour(
      index,
      event.key === "ArrowLeft" ? -1 : 1,
      true,
    );
  }

  private toggleEditor(index: number): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.editingIndex =
      this.editingIndex === index ? undefined : index;
  }

  private pointerStarted(index: number, event: PointerEvent): void {
    if (
      this.disabled ||
      event.pointerType === "mouse" ||
      (event.target as HTMLElement).closest(".colour-popover")
    ) {
      return;
    }
    this.pointerId = event.pointerId;
    this.pointerIndex = index;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.pointerMoved = false;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  private pointerMovedOver(event: PointerEvent): void {
    if (
      event.pointerId !== this.pointerId ||
      this.pointerIndex === undefined
    ) {
      return;
    }
    const deltaX = event.clientX - this.pointerX;
    const deltaY = event.clientY - this.pointerY;
    if (!this.pointerMoved) {
      if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 10) {
        return;
      }
      this.pointerMoved = true;
    }
    event.preventDefault();
    const target = this.shadowRoot
      ?.elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-colour-index]");
    const targetIndex = Number(target?.dataset.colourIndex);
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex === this.pointerIndex
    ) {
      return;
    }
    this.reorder(this.pointerIndex, targetIndex);
    this.pointerIndex = targetIndex;
  }

  private pointerFinished(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.suppressClick = this.pointerMoved;
    this.pointerId = undefined;
    this.pointerIndex = undefined;
    this.pointerMoved = false;
  }

  private emitPalette(palette: RGB[]): void {
    this.palette = palette;
    this.dispatchEvent(
      new CustomEvent<{ palette: RGB[] }>("palette-changed", {
        detail: { palette },
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
      --studio-muted: var(--secondary-text-color, #68707c);
      --studio-danger: var(--error-color, #db4437);
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      min-height: 44px;
      font: inherit;
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

    .swatch,
    .palette-add {
      width: 44px;
      height: 44px;
      padding: 0;
      border-radius: 8px;
      cursor: pointer;
    }

    .swatch {
      border: 1px solid rgb(0 0 0 / 14%);
      background: var(--swatch-colour);
    }

    .palette-add {
      display: grid;
      place-items: center;
      border: 1px dashed var(--studio-border);
      color: var(--studio-blue);
      background: transparent;
      font-size: 24px;
    }

    .swatch:focus-visible,
    .palette-add:focus-visible {
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
      color: var(--studio-danger);
    }

    button:disabled,
    input:disabled {
      cursor: not-allowed;
      opacity: 0.52;
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
    }
  `;
}

function clonePalette(palette: RGB[]): RGB[] {
  return palette.map((colour) => [...colour]);
}

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

export function rgbToHex(colour: RGB): string {
  return `#${colour
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToRgb(value: string): RGB {
  return [
    Number.parseInt(value.slice(1, 3), 16),
    Number.parseInt(value.slice(3, 5), 16),
    Number.parseInt(value.slice(5, 7), 16),
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-palette-editor": GoveePaletteEditor;
  }
}

if (!customElements.get("govee-palette-editor")) {
  customElements.define("govee-palette-editor", GoveePaletteEditor);
}
