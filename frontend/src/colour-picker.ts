import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles } from "./studio-styles";
import type { RGB } from "./types";
import { clonePalette, hexToRgb, rgbToHex } from "./ui-utils";

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

export class GoveeColourPicker extends LitElement {
  @property({ attribute: false })
  public colour: RGB = [255, 255, 255];

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Boolean })
  public selectionActive = true;

  @property({ type: Boolean })
  public rememberOnCommit = true;

  private displayedRecentColours = clonePalette(recentColours);

  public connectedCallback(): void {
    super.connectedCallback();
    this.displayedRecentColours = clonePalette(recentColours);
  }

  protected render() {
    const selectedHex = this.selectionActive ? rgbToHex(this.colour) : "";
    const customSelected =
      this.selectionActive &&
      !this.displayedRecentColours.some(
        (recent) => rgbToHex(recent) === selectedHex,
      );
    return html`
      <div class="preset-grid">
        ${this.displayedRecentColours.map(
          (recent) => html`
            <button
              class=${rgbToHex(recent) === selectedHex ? "selected" : ""}
              type="button"
              style="--preset-colour: ${rgbToHex(recent)}"
              aria-label="Use ${rgbToHex(recent)}"
              aria-pressed=${rgbToHex(recent) === selectedHex}
              ?disabled=${this.disabled}
              @click=${() => this.commit(recent)}
            ></button>
          `,
        )}
        <label
          class="custom-colour ${customSelected ? "selected" : ""}"
          style="--custom-colour: ${rgbToHex(this.colour)}"
        >
          <input
            type="color"
            aria-label="Custom colour"
            .value=${rgbToHex(this.colour)}
            ?disabled=${this.disabled}
            @input=${(event: Event) =>
              this.emit(
                "colour-changing",
                hexToRgb((event.target as HTMLInputElement).value),
              )}
            @change=${(event: Event) =>
              this.commit(
                hexToRgb((event.target as HTMLInputElement).value),
              )}
          />
        </label>
      </div>
    `;
  }

  private commit(colour: RGB): void {
    if (this.rememberOnCommit) {
      rememberRecentColour(colour);
    }
    this.emit("colour-changed", colour);
  }

  private emit(name: "colour-changing" | "colour-changed", colour: RGB): void {
    this.colour = [...colour];
    this.dispatchEvent(
      new CustomEvent<{ colour: RGB }>(name, {
        detail: { colour: [...colour] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = [studioBaseStyles, css`
    :host {
      --custom-colour-ring-width: 5px;
      --custom-colour-inner-ring-width: 3px;
      display: block;
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: var(--studio-micro-gap);
    }

    .preset-grid button,
    .custom-colour {
      position: relative;
      min-height: var(--studio-control-height);
      border: var(--studio-border-width) solid rgb(0 0 0 / 12%);
      border-radius: var(--studio-swatch-radius);
      cursor: pointer;
    }

    .preset-grid button.selected,
    .custom-colour.selected {
      border-color: var(--studio-blue);
      box-shadow:
        inset 0 0 0 var(--studio-strong-border-width) var(--studio-card),
        0 0 0 var(--studio-strong-border-width) var(--studio-blue);
    }

    .preset-grid button {
      background: var(--preset-colour);
    }

    .custom-colour {
      overflow: hidden;
      background: var(--custom-colour);
      box-shadow:
        inset 0 0 0 var(--custom-colour-inner-ring-width)
          var(--studio-card),
        inset 0 0 0 var(--custom-colour-ring-width) rgb(0 0 0 / 32%);
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
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }
  `];
}

export function recentColour(index: number): RGB {
  return [...recentColours[index % recentColours.length]];
}

export function rememberRecentColour(colour: RGB): void {
  rememberColour(colour);
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
  const filled = clonePalette(colours);
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

declare global {
  interface HTMLElementTagNameMap {
    "govee-colour-picker": GoveeColourPicker;
  }
}

if (!customElements.get("govee-colour-picker")) {
  customElements.define("govee-colour-picker", GoveeColourPicker);
}
