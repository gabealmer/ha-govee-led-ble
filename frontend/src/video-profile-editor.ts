import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import {
  studioBaseStyles,
  studioCardStyles,
  studioFormStyles,
} from "./studio-styles";
import type { RelativeBrightness, VideoProfileContent } from "./types";

const VIDEO_MODE_OPTIONS = [
  { value: "movie", label: "Movie" },
  { value: "game", label: "Game" },
] as const satisfies ReadonlyArray<{
  value: VideoProfileContent["mode"];
  label: string;
}>;

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

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

export function cloneRelativeBrightness(
  relativeBrightness: RelativeBrightness,
): RelativeBrightness {
  return { ...relativeBrightness };
}

export function cloneVideoProfileContent(
  content: VideoProfileContent,
): VideoProfileContent {
  return {
    ...content,
    relative_brightness: cloneRelativeBrightness(content.relative_brightness),
  };
}

export function uniformRelativeBrightnessValue(
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

export function uniformBrightnessControlValue(
  relativeBrightness: RelativeBrightness,
): number {
  const uniform = uniformRelativeBrightnessValue(relativeBrightness);
  if (uniform !== undefined) {
    return uniform;
  }
  return clamp(
    (relativeBrightness.left +
      relativeBrightness.top +
      relativeBrightness.right +
      relativeBrightness.bottom) /
      4,
    1,
    100,
  );
}

export function applyUniformRelativeBrightness(
  value: number,
): RelativeBrightness {
  const next = clamp(value, 1, 100);
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

  protected render() {
    if (!this.content) {
      return html`
        <section class="card empty-state" role="status">
          <h3>Video profile unavailable</h3>
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
          <h3>Profile</h3>
          <div class="content-stack">
            ${this.renderSegmentedField(
              "Mode",
              this.content.mode,
              VIDEO_MODE_OPTIONS,
              (value) =>
                this.updateContent((content) => {
                  content.mode = value;
                }),
            )}
            ${this.renderSegmentedField(
              "Capture area",
              this.content.full_screen,
              CAPTURE_AREA_OPTIONS,
              (value) =>
                this.updateContent((content) => {
                  content.full_screen = value;
                }),
            )}
            ${this.renderToggleRow(
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
                  String(this.content.sound_effects_softness),
                  (value) =>
                    this.updateContent((content) => {
                      content.sound_effects_softness = clamp(value, 1, 100);
                    }),
                )
              : nothing}
            ${this.renderToggleRow(
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
          <h3>Image</h3>
          <div class="content-stack">
            ${this.renderRangeField(
              "Saturation",
              this.content.saturation,
              0,
              100,
              `${this.content.saturation}%`,
              (value) =>
                this.updateContent((content) => {
                  content.saturation = clamp(value, 0, 100);
                }),
            )}
            ${this.renderWhiteBalanceField(this.content.white_balance_position)}
          </div>
        </section>

        <section class="card brightness-card">
          <div class="card-heading">
            <h3>Relative brightness</h3>
            ${mixedBrightness
              ? html`<span class="status-chip">Mixed edges</span>`
              : nothing}
          </div>
          <div class="content-stack">
            ${this.renderRangeField(
              "Uniform brightness",
              uniformBrightness,
              1,
              100,
              `${uniformBrightness}%`,
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
                    sides, or fine-tune each edge below.
                  </p>
                `
              : nothing}
            <div class="edge-grid">
              ${BRIGHTNESS_EDGE_OPTIONS.map(({ key, label }) =>
                this.renderRangeField(
                  label,
                  brightness[key],
                  1,
                  100,
                  `${brightness[key]}%`,
                  (value) => this.updateRelativeBrightnessEdge(key, value),
                ),
              )}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  private renderSegmentedField<T extends string | boolean>(
    label: string,
    selected: T,
    options: readonly { value: T; label: string }[],
    changed: (value: T) => void,
  ) {
    return html`
      <div class="field-group">
        <span class="field-label">${label}</span>
        <div class="segmented" role="group" aria-label=${label}>
          ${options.map(
            (option) => html`
              <button
                class=${selected === option.value ? "selected" : ""}
                type="button"
                aria-pressed=${selected === option.value}
                ?disabled=${this.disabled}
                @click=${() => {
                  if (selected !== option.value) {
                    changed(option.value);
                  }
                }}
              >
                ${option.label}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  }

  private renderToggleRow(
    label: string,
    checked: boolean,
    changed: (checked: boolean) => void,
  ) {
    return html`
      <div class="toggle-row">
        <span class="toggle-label">${label}</span>
        <button
          class="switch ${checked ? "on" : ""}"
          type="button"
          role="switch"
          aria-checked=${checked}
          aria-label=${label}
          ?disabled=${this.disabled}
          @click=${() => changed(!checked)}
        >
          <span aria-hidden="true"></span>
        </button>
      </div>
    `;
  }

  private renderRangeField(
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    output: string,
    changed: (value: number) => void,
    describedBy?: string,
  ) {
    return html`
      <label class="range-field">
        <span>${label}</span>
        <input
          type="range"
          min=${minimum}
          max=${maximum}
          .value=${String(clamp(value, minimum, maximum))}
          aria-label=${label}
          aria-describedby=${describedBy ?? nothing}
          ?disabled=${this.disabled}
          @input=${(event: Event) =>
            changed(Number((event.target as HTMLInputElement).value))}
        />
        <output aria-label="${label} value">${output}</output>
      </label>
    `;
  }

  private renderWhiteBalanceField(value: number) {
    return html`
      <label class="range-field white-balance-field">
        <span>White balance</span>
        <div class="slider-with-endpoints">
          <input
            type="range"
            min="1"
            max="20"
            .value=${String(clamp(value, 1, 20))}
            aria-label="White balance"
            ?disabled=${this.disabled}
            @input=${(event: Event) =>
              this.updateContent((content) => {
                content.white_balance_position = clamp(
                  Number((event.target as HTMLInputElement).value),
                  1,
                  20,
                );
              })}
          />
          <div class="endpoint-labels" aria-hidden="true">
            <span>Cool</span>
            <span>Warm</span>
          </div>
        </div>
        <output aria-label="White balance value">${value}</output>
      </label>
    `;
  }

  private updateRelativeBrightnessEdge(
    edge: RelativeBrightnessEdge,
    value: number,
  ): void {
    this.updateContent((content) => {
      content.relative_brightness[edge] = clamp(value, 1, 100);
    });
  }

  private updateContent(changed: (content: VideoProfileContent) => void): void {
    if (!this.content) {
      return;
    }
    const next = cloneVideoProfileContent(this.content);
    changed(next);
    this.emitContent(next);
  }

  private emitContent(content: VideoProfileContent): void {
    this.dispatchEvent(
      new CustomEvent<{ content: VideoProfileContent }>("content-changed", {
        detail: { content: cloneVideoProfileContent(content) },
        bubbles: true,
        composed: true,
      }),
    );
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

      h3,
      p {
        margin-top: 0;
      }

      h3 {
        margin-bottom: 14px;
        font-size: 16px;
      }

      .editor-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--studio-section-gap);
      }

      .brightness-card {
        grid-column: 1 / -1;
      }

      .content-stack,
      .edge-grid,
      .field-group {
        display: grid;
      }

      .content-stack {
        gap: 14px;
      }

      .field-group {
        gap: 10px;
      }

      .edge-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px 18px;
      }

      .field,
      .range-field,
      .field-group {
        margin-top: 0;
      }

      .field-label {
        color: var(--studio-muted);
        font-size: 13px;
        font-weight: 600;
      }

      .toggle-label {
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 600;
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

      .card-heading,
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .card-heading {
        margin-bottom: 14px;
      }

      .card-heading h3 {
        margin-bottom: 0;
      }

      .toggle-row {
        min-height: var(--studio-control-height);
      }

      .segmented {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .segmented button {
        flex: 1;
        min-width: 0;
        padding: 8px 14px;
        border: 1px solid var(--studio-border);
        border-radius: 8px;
        color: var(--primary-text-color);
        background: var(--studio-card);
        cursor: pointer;
      }

      .segmented button.selected {
        color: var(--studio-blue);
        border-color: var(--studio-blue);
        background: var(--studio-blue-soft);
        font-weight: 650;
      }

      .switch {
        position: relative;
        width: 60px;
        min-height: 44px;
        height: 44px;
        padding: 0;
        border: 1px solid var(--studio-border);
        border-radius: 999px;
        background: var(--secondary-background-color, #f5f6f8);
        cursor: pointer;
      }

      .switch span {
        position: absolute;
        top: 6px;
        left: 6px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--studio-muted);
        transition: transform 120ms ease;
      }

      .switch.on {
        border-color: var(--studio-blue);
        background: var(--studio-blue);
      }

      .switch.on span {
        background: var(--text-primary-color, #fff);
        transform: translateX(18px);
      }

      .range-field {
        grid-template-columns: minmax(118px, auto) minmax(0, 1fr) 64px;
        align-items: center;
        gap: 10px;
        font-variant-numeric: tabular-nums;
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
        .edge-grid {
          grid-template-columns: 1fr;
        }

        .range-field {
          grid-template-columns: 1fr;
        }

        .range-field output {
          text-align: start;
        }

        .toggle-row {
          align-items: start;
        }

        .switch {
          flex: 0 0 auto;
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
