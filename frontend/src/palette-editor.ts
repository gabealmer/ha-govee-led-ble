import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import "./reorderable-strip";
import type {
  GoveeReorderableStrip,
  ReorderableStripItem,
} from "./reorderable-strip";
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

  @property({ type: Boolean })
  public persistentPicker = false;

  @property({ type: Number })
  public selectedIndex?: number;

  @property()
  public ariaLabel = "Colours";

  @property()
  public itemName = "colour";

  @state()
  private editingIndex?: number;

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
    const activeIndex = this.persistentPicker
      ? this.selectedIndex
      : this.editingIndex;
    const items: ReorderableStripItem[] = this.palette.map(
      (colour, index) => ({
        key: `${index}-${rgbToHex(colour)}`,
        label: `${capitalise(this.itemName)} ${index + 1}`,
        ariaLabel: this.itemAriaLabel(colour, index),
        colour: rgbToHex(colour),
        removeReady:
          !this.persistentPicker &&
          this.editingIndex === index &&
          this.palette.length > this.minColours,
        disabled: this.disabled,
      }),
    );
    return html`
      <govee-reorderable-strip
        .items=${items}
        .activeIndex=${activeIndex}
        .itemRole=${this.persistentPicker ? "tab" : "button"}
        .ariaLabel=${this.ariaLabel}
        .addLabel=${`Add ${this.itemName}`}
        .addDisabled=${this.disabled ||
        this.palette.length >= this.maxColours}
        .reorderDisabled=${this.disabled || this.persistentPicker}
        @item-selected=${(event: CustomEvent<{ index: number }>) =>
          this.swatchClicked(event.detail.index)}
        @items-reordered=${(
          event: CustomEvent<{ from: number; to: number }>,
        ) => this.reorder(event.detail.from, event.detail.to)}
        @item-added=${this.addColour}
      >
        ${this.persistentPicker || this.editingIndex === undefined
          ? nothing
          : html`
              <div
                slot="item-${this.editingIndex}"
                class="strip-popover colour-popover"
                role="dialog"
                aria-label="Edit colour"
                @keydown=${(event: KeyboardEvent) =>
                  this.popoverKeyPressed(this.editingIndex!, event)}
              >
                ${this.renderPopover(
                  this.editingIndex,
                  this.palette[this.editingIndex],
                )}
              </div>
            `}
      </govee-reorderable-strip>
      ${this.persistentPicker && activeIndex !== undefined
        ? html`
            <div
              class="persistent-picker"
              role="group"
              aria-label="Edit ${this.itemName} ${activeIndex + 1}"
            >
              ${this.renderPopover(
                activeIndex,
                this.palette[activeIndex],
              )}
            </div>
          `
        : nothing}
    `;
  }

  private itemAriaLabel(colour: RGB, index: number): string {
    const name = `${capitalise(this.itemName)} ${index + 1}`;
    if (this.persistentPicker) {
      return `${name}, ${rgbToHex(colour)}${
        index === this.selectedIndex ? ", selected" : ""
      }`;
    }
    return this.editingIndex === index &&
      this.palette.length > this.minColours
      ? `Remove colour ${index + 1}`
      : `Edit colour ${index + 1}, ${rgbToHex(
          colour,
        )}. Drag to reorder or use arrow keys.`;
  }

  private renderPopover(index: number, colour: RGB) {
    return html`
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
    `;
  }

  private commitColour(index: number, colour: RGB): void {
    rememberColour(colour);
    this.updateColour(index, colour);
    if (this.persistentPicker) {
      return;
    }
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
    const index = palette.length - 1;
    if (this.persistentPicker) {
      this.selectColour(index, palette[index]);
    } else {
      this.editingIndex = index;
    }
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

  private reorder(from: number, to: number): void {
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
    if (this.persistentPicker) {
      const selectedIndex = relocatedIndex(this.selectedIndex, from, to);
      if (selectedIndex !== undefined) {
        this.selectColour(selectedIndex, palette[selectedIndex]);
      }
    }
    this.emitPalette(palette);
  }

  private focusSwatchAfterUpdate(index: number): void {
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelector<GoveeReorderableStrip>("govee-reorderable-strip")
        ?.focusItem(index);
    });
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
    if (this.persistentPicker) {
      this.selectColour(index, this.palette[index]);
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

  private selectColour(index: number, colour: RGB): void {
    this.selectedIndex = index;
    this.dispatchEvent(
      new CustomEvent<{ index: number; colour: RGB }>("colour-selected", {
        detail: { index, colour: [...colour] },
        bubbles: true,
        composed: true,
      }),
    );
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

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }

    .persistent-picker {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--studio-border);
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

  `;
}

function clonePalette(palette: RGB[]): RGB[] {
  return palette.map((colour) => [...colour]);
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
