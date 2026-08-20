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
        --switch-track-width: 42px;
        --switch-track-height: var(--studio-spacing-6xl);
        --switch-thumb-size: var(--studio-spacing-3xl);
        --switch-thumb-inset: 2px;
        display: inline-block;
        flex: 0 0 auto;
      }

      button {
        position: relative;
        width: var(--switch-track-width);
        min-height: var(--switch-track-height);
        height: var(--switch-track-height);
        padding: 0;
        border: var(--studio-border-width) solid var(--studio-border);
        border-radius: var(--studio-pill-radius);
        background: color-mix(
          in srgb,
          var(--studio-muted) 12%,
          var(--studio-card)
        );
        cursor: pointer;
      }

      button span {
        position: absolute;
        top: var(--switch-thumb-inset);
        left: var(--switch-thumb-inset);
        width: var(--switch-thumb-size);
        height: var(--switch-thumb-size);
        border-radius: var(--studio-round-radius);
        background: color-mix(
          in srgb,
          var(--studio-muted) 72%,
          var(--studio-card)
        );
        box-shadow: 0 var(--studio-border-width)
          var(--studio-strong-border-width) rgb(0 0 0 / 20%);
        transition: transform var(--studio-transition-duration) ease;
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
        transform: translateX(var(--switch-thumb-size));
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
