import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles } from "./studio-styles";

export class GoveeInfoControl extends LitElement {
  @property()
  public label = "More information";

  @property()
  public text = "";

  protected render() {
    return html`
      <button
        class="info-trigger"
        type="button"
        aria-label=${this.label}
        title=${this.label}
        popovertarget="information"
      >
        <span aria-hidden="true">(i)</span>
      </button>
      <div
        id="information"
        class="info-popover"
        popover="auto"
        role="note"
        aria-label=${this.label}
      >
        ${this.text}
      </div>
    `;
  }

  static styles = [
    studioBaseStyles,
    css`
      :host {
        display: inline-flex;
        flex: 0 0 auto;
      }

      .info-trigger {
        display: inline-grid;
        width: var(--studio-info-control-size);
        min-height: var(--studio-info-control-size);
        padding: 0;
        place-items: center;
        border: var(--studio-border-width) solid var(--studio-border);
        border-radius: var(--studio-round-radius);
        color: var(--studio-muted);
        background: var(--studio-card);
        font-size: var(--studio-info-control-font-size);
        font-weight: var(--studio-font-weight-semibold);
        line-height: var(--studio-icon-line-height);
        cursor: help;
      }

      .info-trigger:hover,
      .info-trigger:focus-visible {
        color: var(--studio-blue);
        border-color: var(--studio-blue);
      }

      .info-trigger:focus-visible {
        outline: var(--studio-focus-width) solid var(--studio-blue);
        outline-offset: var(--studio-focus-offset);
      }

      .info-popover {
        width: min(
          var(--studio-info-popover-width),
          calc(100vw - var(--studio-dialog-viewport-gutter))
        );
        margin: auto;
        padding: var(--studio-popover-padding);
        border: var(--studio-border-width) solid var(--studio-border);
        border-radius: var(--studio-popover-radius);
        color: var(--primary-text-color);
        background: var(--studio-card);
        box-shadow: var(--studio-popover-shadow);
        font-size: var(--studio-parameter-label-size);
        line-height: var(--studio-muted-line-height);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-info-control": GoveeInfoControl;
  }
}

if (!customElements.get("govee-info-control")) {
  customElements.define("govee-info-control", GoveeInfoControl);
}
