import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles, studioFormStyles } from "./studio-styles";
import { clamp } from "./ui-utils";

export interface SliderControlChange {
  value: number;
}

export class GoveeSliderControl extends LitElement {
  @property()
  public label = "";

  @property({ type: Number })
  public value = 0;

  @property({ type: Number })
  public minimum = 0;

  @property({ type: Number })
  public maximum = 100;

  @property({ type: Number })
  public step = 1;

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Boolean })
  public showValue = false;

  @property({ attribute: false })
  public valueText?: string;

  @property({ attribute: false })
  public describedBy?: string;

  protected render() {
    const value = clamp(this.value, this.minimum, this.maximum);
    const output = this.valueText ?? String(value);
    return html`
      <label class="slider-field">
        <span class="slider-heading">
          <span class="parameter-label">${this.label}</span>
          ${this.showValue || this.valueText !== undefined
            ? html`<output aria-label="${this.label} value">${output}</output>`
            : nothing}
        </span>
        <input
          type="range"
          min=${this.minimum}
          max=${this.maximum}
          step=${this.step}
          .value=${String(value)}
          aria-label=${this.label}
          aria-describedby=${this.describedBy ?? nothing}
          ?disabled=${this.disabled}
          @input=${this.inputChanged}
        />
      </label>
    `;
  }

  private inputChanged(event: Event): void {
    this.dispatchEvent(
      new CustomEvent<SliderControlChange>("value-changed", {
        detail: { value: Number((event.target as HTMLInputElement).value) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = [
    studioBaseStyles,
    studioFormStyles,
    css`
      :host {
        display: block;
      }

      .slider-field {
        display: grid;
        gap: 10px;
      }

      .slider-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }

      output {
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }

      input {
        width: 100%;
        min-width: 0;
        min-height: var(--studio-control-height);
        margin: 0;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-slider-control": GoveeSliderControl;
  }
}

if (!customElements.get("govee-slider-control")) {
  customElements.define("govee-slider-control", GoveeSliderControl);
}
