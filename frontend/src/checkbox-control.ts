import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles, studioFormStyles } from "./studio-styles";

export interface CheckboxControlChange {
  checked: boolean;
}

export class GoveeCheckboxControl extends LitElement {
  @property()
  public label = "";

  @property({ type: Boolean })
  public checked = false;

  @property({ type: Boolean })
  public disabled = false;

  protected render() {
    return html`
      <label class="check-field">
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.checkedChanged}
        />
        <span class="parameter-label">${this.label}</span>
      </label>
    `;
  }

  private checkedChanged(event: Event): void {
    this.dispatchEvent(
      new CustomEvent<CheckboxControlChange>("checked-changed", {
        detail: {
          checked: (event.target as HTMLInputElement).checked,
        },
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
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-checkbox-control": GoveeCheckboxControl;
  }
}

if (!customElements.get("govee-checkbox-control")) {
  customElements.define("govee-checkbox-control", GoveeCheckboxControl);
}
