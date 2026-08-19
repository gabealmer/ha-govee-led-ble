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
        width: 42px;
        min-height: 24px;
        height: 24px;
        padding: 0;
        border: 1px solid var(--studio-border);
        border-radius: 999px;
        background: color-mix(
          in srgb,
          var(--studio-muted) 12%,
          var(--studio-card)
        );
        cursor: pointer;
      }

      button span {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: color-mix(
          in srgb,
          var(--studio-muted) 72%,
          var(--studio-card)
        );
        box-shadow: 0 1px 2px rgb(0 0 0 / 20%);
        transition: transform 120ms ease;
      }

      button.on {
        border-color: color-mix(
          in srgb,
          var(--studio-blue) 62%,
          var(--studio-border)
        );
        background: color-mix(
          in srgb,
          var(--studio-blue) 72%,
          var(--studio-card)
        );
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
