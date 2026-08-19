import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import type { CheckboxControlChange } from "./checkbox-control";
import "./checkbox-control";
import type { LivePreviewInteraction } from "./live-preview-controller";
import type {
  SegmentedControlChange,
  SegmentedControlOption,
  SegmentedControlValue,
} from "./segmented-control";
import "./segmented-control";
import type { SliderControlChange } from "./slider-control";
import "./slider-control";
import {
  studioBaseStyles,
  studioCardStyles,
  studioFormStyles,
} from "./studio-styles";
import { cloneVideoProfileContent } from "./profile-model";
import type { RelativeBrightness, VideoProfileContent } from "./types";
import { clampInteger } from "./ui-utils";

const CAPTURE_AREA_OPTIONS = [
  { value: true, label: "Full screen" },
  { value: false, label: "Part screen" },
] as const;

const BRIGHTNESS_EDGE_OPTIONS = [
  { key: "left", label: "Left" },
  { key: "top", label: "Top" },
  { key: "right", label: "Right" },
  { key: "bottom", label: "Bottom" },
] as const satisfies ReadonlyArray<{
  key: keyof RelativeBrightness;
  label: string;
}>;

type RelativeBrightnessEdge = keyof RelativeBrightness;

function uniformRelativeBrightnessValue(
  relativeBrightness: RelativeBrightness,
): number | undefined {
  const values = [
    relativeBrightness.left,
    relativeBrightness.top,
    relativeBrightness.right,
    relativeBrightness.bottom,
  ];
  return values.every((value) => value === values[0]) ? values[0] : undefined;
}

function uniformBrightnessControlValue(
  relativeBrightness: RelativeBrightness,
): number {
  const uniform = uniformRelativeBrightnessValue(relativeBrightness);
  if (uniform !== undefined) {
    return uniform;
  }
  return clampInteger(
    (relativeBrightness.left +
      relativeBrightness.top +
      relativeBrightness.right +
      relativeBrightness.bottom) /
      4,
    1,
    100,
  );
}

function applyUniformRelativeBrightness(
  value: number,
): RelativeBrightness {
  const next = clampInteger(value, 1, 100);
  return {
    left: next,
    top: next,
    right: next,
    bottom: next,
  };
}

export class GoveeVideoProfileEditor extends LitElement {
  @property({ attribute: false })
  public content?: VideoProfileContent;

  @property({ type: Boolean })
  public disabled = false;

  private interaction: LivePreviewInteraction = "committed";

  protected render() {
    if (!this.content) {
      return html`
        <section class="card empty-state" role="status">
          <h3 class="section-title">Video profile unavailable</h3>
          <p class="muted">
            Load an H6199 video profile to edit video-sync settings.
          </p>
        </section>
      `;
    }

    const brightness = this.content.relative_brightness;
    const mixedBrightness =
      uniformRelativeBrightnessValue(brightness) === undefined;
    const uniformBrightness = uniformBrightnessControlValue(brightness);

    return html`
      <div class="editor-grid">
        <section class="card">
          <div class="parameter-stack">
            ${this.renderSegmentedField(
              "Capture area",
              this.content.full_screen,
              CAPTURE_AREA_OPTIONS,
              (value) =>
                this.updateContent((content) => {
                  content.full_screen = value;
                }),
            )}
            ${this.renderCheckboxField(
              "Sound effects",
              this.content.sound_effects,
              (checked) =>
                this.updateContent((content) => {
                  content.sound_effects = checked;
                }),
            )}
            ${this.content.sound_effects
              ? this.renderRangeField(
                  "Softness",
                  this.content.sound_effects_softness,
                  1,
                  100,
                  (value) =>
                    this.updateContent((content) => {
                      content.sound_effects_softness = clampInteger(
                        value,
                        1,
                        100,
                      );
                    }),
                )
              : nothing}
            ${this.renderCheckboxField(
              "Blank screen",
              this.content.blank_screen,
              (checked) =>
                this.updateContent((content) => {
                  content.blank_screen = checked;
                }),
            )}
          </div>
        </section>

        <section class="card">
          <h3 class="section-title">Image</h3>
          <div class="parameter-stack">
            ${this.renderRangeField(
              "Saturation",
              this.content.saturation,
              0,
              100,
              (value) =>
                this.updateContent((content) => {
                  content.saturation = clampInteger(value, 0, 100);
                }),
            )}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3 class="section-title">Relative brightness</h3>
            ${mixedBrightness
              ? html`<span class="status-chip">Mixed edges</span>`
              : nothing}
          </div>
          <div class="parameter-stack">
            ${this.renderRangeField(
              "Uniform brightness",
              uniformBrightness,
              1,
              100,
              (value) =>
                this.updateContent((content) => {
                  content.relative_brightness =
                    applyUniformRelativeBrightness(value);
                }),
              mixedBrightness ? "relative-brightness-note" : undefined,
            )}
            ${mixedBrightness
              ? html`
                  <p class="section-note muted" id="relative-brightness-note">
                    Edges differ.  Adjust Uniform brightness to align all four
                    sides, or adjust them around the screen.
                  </p>
                `
              : nothing}
            <div
              class="screen-brightness"
              role="group"
              aria-label="Screen edge brightness"
            >
              ${this.renderScreenEdgeControl("top", "Top", brightness.top)}
              ${this.renderScreenEdgeControl("left", "Left", brightness.left)}
              <div class="virtual-screen" aria-hidden="true">
                ${BRIGHTNESS_EDGE_OPTIONS.map(
                  ({ key }) => html`
                    <span
                      class="screen-edge screen-edge-${key}"
                      style=${`--edge-level: ${brightness[key] / 100}`}
                    ></span>
                  `,
                )}
                <div class="screen-image">
                  <span>Screen</span>
                </div>
                <div class="screen-stand"></div>
              </div>
              ${this.renderScreenEdgeControl(
                "right",
                "Right",
                brightness.right,
              )}
              ${this.renderScreenEdgeControl(
                "bottom",
                "Bottom",
                brightness.bottom,
              )}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  private renderSegmentedField<T extends SegmentedControlValue>(
    label: string,
    selected: T,
    options: readonly SegmentedControlOption<T>[],
    changed: (value: T) => void,
  ) {
    return html`
      <govee-segmented-control
        .label=${label}
        .value=${selected}
        .options=${options}
        .disabled=${this.disabled}
        @value-changed=${(
          event: CustomEvent<SegmentedControlChange<T>>,
        ) => changed(event.detail.value)}
      ></govee-segmented-control>
    `;
  }

  private renderCheckboxField(
    label: string,
    checked: boolean,
    changed: (checked: boolean) => void,
  ) {
    return html`
      <govee-checkbox-control
        .label=${label}
        .checked=${checked}
        .disabled=${this.disabled}
        @checked-changed=${(event: CustomEvent<CheckboxControlChange>) =>
          changed(event.detail.checked)}
      ></govee-checkbox-control>
    `;
  }

  private renderRangeField(
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    changed: (value: number) => void,
    describedBy?: string,
  ) {
    return html`
      <govee-slider-control
        .label=${label}
        .value=${value}
        .minimum=${minimum}
        .maximum=${maximum}
        .describedBy=${describedBy}
        .disabled=${this.disabled}
        @value-changed=${(event: CustomEvent<SliderControlChange>) =>
          this.runInteraction("changing", () => changed(event.detail.value))}
      ></govee-slider-control>
    `;
  }

  private renderWhiteBalanceField(value: number) {
    return html`
      <label class="range-field white-balance-field">
        <span class="parameter-label">White balance</span>
        <div class="slider-with-endpoints">
          <input
            type="range"
            min="1"
            max="20"
            .value=${String(clampInteger(value, 1, 20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${(event: Event) =>
              this.updateContent(
                (content) => {
                  content.white_balance_position = clampInteger(
                    Number((event.target as HTMLInputElement).value),
                    1,
                    20,
                  );
                },
                "changing",
              )}
          />
          <div class="endpoint-labels" aria-hidden="true">
            <span>Cool</span>
            <span>Warm</span>
          </div>
        </div>
      </label>
    `;
  }

  private renderScreenEdgeControl(
    edge: RelativeBrightnessEdge,
    label: string,
    value: number,
  ) {
    return html`
      <label class="screen-edge-control edge-control-${edge}">
        <span class="parameter-label">${label}</span>
        <input
          type="range"
          min="1"
          max="100"
          .value=${String(value)}
          aria-label=${label}
          ?disabled=${this.disabled}
          @input=${(event: Event) =>
            this.updateRelativeBrightnessEdge(
              edge,
              Number((event.target as HTMLInputElement).value),
            )}
        />
      </label>
    `;
  }

  private updateRelativeBrightnessEdge(
    edge: RelativeBrightnessEdge,
    value: number,
  ): void {
    this.updateContent(
      (content) => {
        content.relative_brightness[edge] = clampInteger(value, 1, 100);
      },
      "changing",
    );
  }

  private updateContent(
    changed: (content: VideoProfileContent) => void,
    interaction: LivePreviewInteraction = this.interaction,
  ): void {
    if (!this.content) {
      return;
    }
    const next = cloneVideoProfileContent(this.content);
    changed(next);
    this.emitContent(next, interaction);
  }

  private emitContent(
    content: VideoProfileContent,
    interaction: LivePreviewInteraction = "committed",
  ): void {
    this.dispatchEvent(
      new CustomEvent<{
        content: VideoProfileContent;
        interaction: LivePreviewInteraction;
      }>("content-changed", {
        detail: {
          content: cloneVideoProfileContent(content),
          interaction,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private runInteraction(
    interaction: LivePreviewInteraction,
    changed: () => void,
  ): void {
    this.interaction = interaction;
    try {
      changed();
    } finally {
      this.interaction = "committed";
    }
  }

  static styles = [
    studioBaseStyles,
    studioCardStyles,
    studioFormStyles,
    css`
      :host {
        display: block;
        color: var(--primary-text-color);
      }

      p {
        margin-top: 0;
      }

      .editor-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--studio-section-gap);
      }

      .brightness-card {
        grid-column: 1 / -1;
      }

      .muted,
      .endpoint-labels {
        color: var(--studio-muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .section-note {
        margin: -6px 0 0;
      }

      .screen-brightness {
        display: grid;
        grid-template:
          ". top ." auto
          "left screen right" minmax(220px, 1fr)
          ". bottom ." auto
          / 72px minmax(260px, 560px) 72px;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px 0 20px;
      }

      .virtual-screen {
        position: relative;
        grid-area: screen;
        width: 100%;
        aspect-ratio: 16 / 10;
        padding: 10px;
        border: 1px solid color-mix(in srgb, var(--studio-muted) 55%, transparent);
        border-radius: 14px;
        background: #181b22;
        box-shadow:
          0 18px 34px rgb(15 23 42 / 18%),
          inset 0 0 0 1px rgb(255 255 255 / 6%);
      }

      .screen-image {
        display: grid;
        width: 100%;
        height: 100%;
        place-items: center;
        overflow: hidden;
        border-radius: 7px;
        color: rgb(255 255 255 / 62%);
        background:
          radial-gradient(circle at 72% 24%, rgb(64 186 255 / 42%), transparent 31%),
          radial-gradient(circle at 25% 72%, rgb(126 87 255 / 38%), transparent 36%),
          linear-gradient(145deg, #24334b, #101724 62%, #1e1633);
        font-size: 13px;
        font-weight: 650;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .screen-stand {
        position: absolute;
        bottom: -18px;
        left: 50%;
        width: 28%;
        height: 14px;
        border-bottom: 4px solid #353b47;
        transform: translateX(-50%);
      }

      .screen-stand::before {
        position: absolute;
        top: 0;
        left: 50%;
        width: 4px;
        height: 12px;
        background: #353b47;
        content: "";
        transform: translateX(-50%);
      }

      .screen-edge {
        position: absolute;
        z-index: 1;
        border-radius: 999px;
        background: rgb(67 168 255);
        box-shadow:
          0 0 8px 2px rgb(67 168 255 / 72%),
          0 0 20px 5px rgb(67 168 255 / 34%);
        opacity: calc(0.12 + var(--edge-level) * 0.88);
        pointer-events: none;
      }

      .screen-edge-top,
      .screen-edge-bottom {
        right: 16px;
        left: 16px;
        height: 5px;
      }

      .screen-edge-top {
        top: 3px;
      }

      .screen-edge-bottom {
        bottom: 3px;
      }

      .screen-edge-left,
      .screen-edge-right {
        top: 16px;
        bottom: 16px;
        width: 5px;
      }

      .screen-edge-left {
        left: 3px;
      }

      .screen-edge-right {
        right: 3px;
      }

      .screen-edge-control {
        display: grid;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .screen-edge-control input {
        min-width: 0;
      }

      .edge-control-top,
      .edge-control-bottom {
        grid-template-columns: 48px minmax(120px, 1fr);
      }

      .edge-control-top input,
      .edge-control-bottom input {
        min-height: var(--studio-control-height);
      }

      .edge-control-top {
        grid-area: top;
      }

      .edge-control-bottom {
        grid-area: bottom;
      }

      .edge-control-left,
      .edge-control-right {
        grid-template-rows: auto minmax(130px, 1fr);
        justify-items: center;
        height: 100%;
      }

      .edge-control-left {
        grid-area: left;
      }

      .edge-control-right {
        grid-area: right;
      }

      .edge-control-left input,
      .edge-control-right input {
        width: var(--studio-control-height);
        height: 100%;
        writing-mode: vertical-lr;
        direction: rtl;
      }

      .card-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .card-heading h3 {
        margin-bottom: 0;
      }

      .range-field {
        grid-template-columns: minmax(118px, auto) minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        margin-top: 0;
      }

      .range-field input[type="range"] {
        width: 100%;
        min-width: 0;
      }

      .white-balance-field {
        align-items: start;
      }

      .slider-with-endpoints {
        display: grid;
        gap: 6px;
        min-width: 0;
      }

      .endpoint-labels {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 600;
      }

      .status-chip {
        padding: 4px 9px;
        border-radius: 999px;
        color: var(--studio-blue);
        background: var(--studio-blue-soft);
        font-size: 12px;
        font-weight: 650;
        white-space: nowrap;
      }

      .empty-state h3,
      .empty-state p {
        margin-bottom: 0;
      }

      .empty-state h3 {
        margin-bottom: 8px;
      }

      @media (max-width: 760px) {
        .editor-grid {
          grid-template-columns: 1fr;
        }

        .brightness-card {
          grid-column: auto;
        }
      }

      @media (max-width: 560px) {
        .range-field {
          grid-template-columns: 1fr;
        }

        .screen-brightness {
          grid-template:
            ". top ." auto
            "left screen right" minmax(160px, 1fr)
            ". bottom ." auto
            / 52px minmax(160px, 1fr) 52px;
          gap: 8px;
        }

        .edge-control-top,
        .edge-control-bottom {
          grid-template-columns: minmax(0, 1fr) 42px;
        }

        .edge-control-top .parameter-label,
        .edge-control-bottom .parameter-label {
          grid-column: 1 / -1;
        }

        .edge-control-left,
        .edge-control-right {
          grid-template-rows: auto minmax(90px, 1fr) auto;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-video-profile-editor": GoveeVideoProfileEditor;
  }
}

if (!customElements.get("govee-video-profile-editor")) {
  customElements.define(
    "govee-video-profile-editor",
    GoveeVideoProfileEditor,
  );
}
