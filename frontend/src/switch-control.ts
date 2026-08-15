import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles } from "./studio-styles";

export interface SwitchControlChange {
  checked: boolean;
}

export class GoveeSwitchControl extends LitElement {
  @property()
  public label = "";

  @property({ type: Boolean })
  public checked = false;

  @property({ type: Boolean })
  public disabled = false;

  protected render() {
    return html`
      <button
        class=${this.checked ? "on" : ""}
        type="button"
        role="switch"
        aria-checked=${this.checked}
        aria-label=${this.label}
        ?disabled=${this.disabled}
        @click=${this.toggle}
      >
        <span aria-hidden="true"></span>
      </button>
    `;
  }

  private toggle(): void {
    this.dispatchEvent(
      new CustomEvent<SwitchControlChange>("checked-changed", {
        detail: { checked: !this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static styles = [
    studioBaseStyles,
    css`
      :host {
        display: inline-block;
        flex: 0 0 auto;
      }

      button {
        position: relative;
        width: 60px;
        min-height: var(--studio-control-height);
        height: var(--studio-control-height);
        padding: 0;
        border: 1px solid var(--studio-border);
        border-radius: 999px;
        background: var(--secondary-background-color, #f5f6f8);
        cursor: pointer;
      }

      button span {
        position: absolute;
        top: 6px;
        left: 6px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--studio-muted);
        transition: transform 120ms ease;
      }

      button.on {
        border-color: var(--studio-blue);
        background: var(--studio-blue);
      }

      button.on span {
        background: var(--text-primary-color, #fff);
        transform: translateX(18px);
      }

      @media (prefers-reduced-motion: reduce) {
        button span {
          transition: none;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-switch-control": GoveeSwitchControl;
  }
}

if (!customElements.get("govee-switch-control")) {
  customElements.define("govee-switch-control", GoveeSwitchControl);
}
