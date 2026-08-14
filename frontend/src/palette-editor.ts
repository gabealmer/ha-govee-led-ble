import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import type { RGB } from "./types";

const RECENT_COLOUR_LIMIT = 17;
const RECENT_COLOURS_STORAGE_KEY =
  "ha_govee_led_ble/effect_studio/recent_colours";
const DEFAULT_RECENT_COLOURS: RGB[] = [
  [255, 69, 58],
  [255, 159, 10],
  [255, 214, 10],
  [48, 209, 88],
  [99, 230, 226],
  [100, 210, 255],
  [10, 132, 255],
  [94, 92, 230],
  [191, 90, 242],
  [255, 45, 85],
  [172, 142, 104],
  [255, 255, 255],
  [174, 174, 178],
  [99, 99, 102],
  [28, 28, 30],
  [255, 127, 0],
  [139, 0, 255],
];
let recentColours = loadRecentColours();

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
  private readonly windowPointerDown = (event: PointerEvent): void => {
    if (
      this.editingIndex !== undefined &&
      !event.composedPath().includes(this)
    ) {
      this.editingIndex = undefined;
    }
  };

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("pointerdown", this.windowPointerDown);
  }

  public disconnectedCallback(): void {
    window.removeEventListener("pointerdown", this.windowPointerDown);
    super.disconnectedCallback();
  }

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
              class="swatch-item ${this.editingIndex === index &&
              this.palette.length > this.minColours
                ? "remove-ready"
                : ""}"
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
                aria-label=${this.editingIndex === index &&
                this.palette.length > this.minColours
                  ? `Remove colour ${index + 1}`
                  : `Edit colour ${index + 1}, ${rgbToHex(
                      colour,
                    )}. Drag to reorder or use arrow keys.`}
                ?disabled=${this.disabled}
                @click=${() => this.swatchClicked(index)}
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
      <div
        class="colour-popover"
        role="dialog"
        aria-label="Edit colour"
        @keydown=${(event: KeyboardEvent) =>
          this.popoverKeyPressed(index, event)}
      >
        <div class="preset-grid">
          ${recentColours.map(
            (recent) => html`
              <button
                type="button"
                style="--preset-colour: ${rgbToHex(recent)}"
                aria-label="Use ${rgbToHex(recent)}"
                ?disabled=${this.disabled}
                @click=${() => this.commitColour(index, recent)}
              ></button>
            `,
          )}
          <label
            class="custom-colour"
            style="--custom-colour: ${rgbToHex(colour)}"
          >
            <input
              type="color"
              aria-label="Custom colour"
              .value=${rgbToHex(colour)}
              ?disabled=${this.disabled}
              @input=${(event: Event) =>
                this.updateColour(
                  index,
                  hexToRgb((event.target as HTMLInputElement).value),
                )}
              @change=${(event: Event) =>
                this.commitColour(
                  index,
                  hexToRgb((event.target as HTMLInputElement).value),
                )}
            />
          </label>
        </div>
      </div>
    `;
  }

  private commitColour(index: number, colour: RGB): void {
    rememberColour(colour);
    this.updateColour(index, colour);
    this.editingIndex = undefined;
    this.focusSwatchAfterUpdate(index);
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
      recentColours[this.palette.length % recentColours.length];
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

  private popoverKeyPressed(index: number, event: KeyboardEvent): void {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.editingIndex = undefined;
    this.focusSwatchAfterUpdate(index);
  }

  private swatchClicked(index: number): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if (
      this.editingIndex === index &&
      this.palette.length > this.minColours
    ) {
      this.removeColour(index);
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

    .remove-ready .swatch {
      position: relative;
      outline: 2px solid rgb(255 255 255 / 95%);
      outline-offset: -4px;
    }

    .remove-ready .swatch::after {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 26px;
      font-weight: 500;
      text-shadow: 0 1px 4px rgb(0 0 0 / 80%);
      content: "×";
      pointer-events: none;
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
      width: min(280px, calc(100vw - 48px));
      padding: 10px;
      border: 1px solid var(--studio-border);
      border-radius: 9px;
      background: var(--studio-card);
      box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }

    .preset-grid button,
    .custom-colour {
      position: relative;
      min-height: 40px;
      border: 1px solid rgb(0 0 0 / 12%);
      border-radius: 6px;
      cursor: pointer;
    }

    .preset-grid button {
      background: var(--preset-colour);
    }

    .custom-colour {
      overflow: hidden;
      background: var(--custom-colour);
      box-shadow:
        inset 0 0 0 3px var(--studio-card),
        inset 0 0 0 5px rgb(0 0 0 / 32%);
    }

    .custom-colour input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      min-height: 0;
      padding: 0;
      border: 0;
      opacity: 0;
      cursor: pointer;
    }

    .custom-colour:focus-within {
      outline: 3px solid var(--studio-blue);
      outline-offset: 2px;
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

function loadRecentColours(): RGB[] {
  const stored = localStorage.getItem(RECENT_COLOURS_STORAGE_KEY);
  if (!stored) {
    return clonePalette(DEFAULT_RECENT_COLOURS);
  }
  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return clonePalette(DEFAULT_RECENT_COLOURS);
    }
    throw error;
  }
  if (!Array.isArray(value)) {
    return clonePalette(DEFAULT_RECENT_COLOURS);
  }
  const loaded = value
    .filter(isRGB)
    .map((colour) => [...colour] as RGB)
    .slice(0, RECENT_COLOUR_LIMIT);
  return fillRecentColours(loaded);
}

function rememberColour(colour: RGB): void {
  const hex = rgbToHex(colour);
  recentColours = fillRecentColours([
    [...colour],
    ...recentColours.filter((recent) => rgbToHex(recent) !== hex),
  ]);
  localStorage.setItem(
    RECENT_COLOURS_STORAGE_KEY,
    JSON.stringify(recentColours),
  );
}

function fillRecentColours(colours: RGB[]): RGB[] {
  const filled = colours.map((colour) => [...colour] as RGB);
  for (const fallback of DEFAULT_RECENT_COLOURS) {
    if (
      filled.length >= RECENT_COLOUR_LIMIT ||
      filled.some((colour) => rgbToHex(colour) === rgbToHex(fallback))
    ) {
      continue;
    }
    filled.push([...fallback]);
  }
  return filled.slice(0, RECENT_COLOUR_LIMIT);
}

function isRGB(value: unknown): value is RGB {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (channel) =>
        Number.isInteger(channel) && channel >= 0 && channel <= 255,
    )
  );
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
