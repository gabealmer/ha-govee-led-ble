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

  @property({ attribute: false })
  public describedBy?: string;

  protected render() {
    const value = clamp(this.value, this.minimum, this.maximum);
    return html`
      <label class="slider-field">
        <span class="parameter-label">${this.label}</span>
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
        gap: var(--studio-control-gap);
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
