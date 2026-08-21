import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles } from "./studio-styles";
import { labelledSwitchModel } from "./ui-utils";

export interface LabelledSwitchChange {
  checked: boolean;
}

export class GoveeLabelledSwitch extends LitElement {
  @property()
  public label = "";

  @property({ attribute: "accessible-name" })
  public accessibleName = "";

  @property()
  public description = "";

  @property({ type: Boolean })
  public checked = false;

  @property({ type: Boolean })
  public disabled = false;

  protected render() {
    const model = labelledSwitchModel(
      this.label,
      this.checked,
      this.accessibleName || this.label,
    );
    return html`
      <button
        type="button"
        role=${model.role}
        aria-checked=${model.checked}
        aria-label=${model.accessibleName}
        title=${this.description || nothing}
        ?disabled=${this.disabled}
        @click=${this.toggle}
      >
        <span class="track" aria-hidden="true">
          <span class="label">${model.label}</span>
          <span class="thumb"></span>
        </span>
      </button>
    `;
  }

  private toggle(): void {
    this.dispatchEvent(
      new CustomEvent<LabelledSwitchChange>("checked-changed", {
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
        display: inline-flex;
        width: var(--studio-labelled-switch-track-width);
        height: var(--studio-touch-target-size);
        flex: 0 0 var(--studio-labelled-switch-track-width);
      }

      button {
        display: inline-grid;
        width: var(--studio-labelled-switch-track-width);
        min-height: var(--studio-touch-target-size);
        height: var(--studio-touch-target-size);
        padding: 0;
        border: 0;
        place-items: center;
        color: var(--text-primary-color, #fff);
        background: transparent;
        font: inherit;
        cursor: pointer;
      }

      .track {
        --studio-switch-track-width: var(
          --studio-labelled-switch-track-width
        );
        --studio-switch-thumb-travel: calc(
          var(--studio-switch-track-width) - var(--studio-switch-thumb-inset) -
            var(--studio-switch-thumb-inset) -
            var(--studio-switch-thumb-size)
        );
        position: relative;
        display: block;
        width: var(--studio-switch-track-width);
        height: var(--studio-switch-track-height);
        border-radius: var(--studio-pill-radius);
        background: var(--studio-switch-track-off);
        transition: background var(--studio-switch-transition-duration)
          var(--studio-switch-transition-easing);
      }

      .label {
        position: absolute;
        top: 0;
        left: calc(
          var(--studio-switch-thumb-inset) +
            var(--studio-switch-thumb-size) +
            var(--studio-labelled-switch-zone-gap)
        );
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--studio-labelled-switch-label-width);
        height: var(--studio-switch-track-height);
        font-size: var(--studio-caption-size);
        font-weight: var(--studio-font-weight-semibold);
        line-height: var(--studio-icon-line-height);
        white-space: nowrap;
        pointer-events: none;
      }

      .thumb {
        position: absolute;
        top: var(--studio-switch-thumb-inset);
        left: var(--studio-switch-thumb-inset);
        width: var(--studio-switch-thumb-size);
        height: var(--studio-switch-thumb-size);
        border-radius: var(--studio-round-radius);
        background: var(--studio-switch-thumb-off);
        box-shadow: 0 var(--studio-border-width)
          var(--studio-strong-border-width) rgb(0 0 0 / 30%);
        transition:
          transform var(--studio-switch-transition-duration)
            var(--studio-switch-transition-easing),
          background var(--studio-switch-transition-duration)
            var(--studio-switch-transition-easing);
      }

      button[aria-checked="true"] .track {
        background: var(--studio-switch-track-on);
      }

      button[aria-checked="true"] .thumb {
        background: var(--studio-switch-thumb-on);
        transform: translateX(var(--studio-switch-thumb-travel));
      }

      button:focus-visible {
        outline: 0;
      }

      button:focus-visible .track {
        outline: var(--studio-focus-width) solid var(--studio-blue);
        outline-offset: var(--studio-focus-offset);
      }

      @media (prefers-reduced-motion: reduce) {
        .track,
        .thumb {
          transition: none;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-labelled-switch": GoveeLabelledSwitch;
  }
}

if (!customElements.get("govee-labelled-switch")) {
  customElements.define("govee-labelled-switch", GoveeLabelledSwitch);
}
