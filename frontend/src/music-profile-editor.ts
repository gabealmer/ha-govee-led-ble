import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import type { CheckboxControlChange } from "./checkbox-control";
import "./checkbox-control";
import { recentColour } from "./colour-picker";
import "./colour-picker";
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
  cloneJsonObject,
  cloneMusicProfileContent,
} from "./profile-model";
import {
  studioBaseStyles,
  studioCardStyles,
  studioFormStyles,
} from "./studio-styles";
import type {
  EffectStudioModeOption,
  JsonObject,
  ModelEffectCatalogue,
  MusicProfileContent,
  RGB,
} from "./types";
import { clampInteger, cloneRgb } from "./ui-utils";

type OwnedMusicParameterKey =
  | "point"
  | "gradient"
  | "relative_brightness"
  | "key_count"
  | "direction"
  | "segment_count"
  | "speed";

type FountainDirection = "clockwise" | "two_way" | "counterclockwise";

const STYLE_MODE_IDS = new Set(["rhythm", "bloom", "shiny"]);
const OWNED_MUSIC_PARAMETER_KEYS = new Set<OwnedMusicParameterKey>([
  "point",
  "gradient",
  "relative_brightness",
  "key_count",
  "direction",
  "segment_count",
  "speed",
]);
const FOUNTAIN_DIRECTIONS: ReadonlyArray<{
  id: FountainDirection;
  label: string;
}> = [
  { id: "clockwise", label: "Clockwise" },
  { id: "two_way", label: "Two-way" },
  { id: "counterclockwise", label: "Counterclockwise" },
];

export class GoveeMusicProfileEditor extends LitElement {
  @property({ attribute: false })
  public content?: MusicProfileContent;

  @property({ attribute: false })
  public catalogue?: ModelEffectCatalogue;

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Boolean })
  public showModeSelector = true;

  private lastFixedColour?: RGB;
  private interaction: LivePreviewInteraction = "committed";

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("content") && this.content?.colour != null) {
      this.lastFixedColour = cloneRgb(this.content.colour);
    }
  }

  protected render() {
    if (!this.content) {
      return nothing;
    }

    const modeOptions = modeOptionsFor(this.content.mode, this.catalogue);
    const sensitivityMinimum = this.catalogue?.limits.music_sensitivity_min ?? 0;
    const sensitivityMaximum = this.catalogue?.limits.music_sensitivity_max ?? 100;
    const sensitivity = clampInteger(
      this.content.sensitivity,
      sensitivityMinimum,
      sensitivityMaximum,
    );
    const colourMode = this.content.colour === null ? "automatic" : "fixed";
    const fixedColour = this.content.colour ?? this.lastFixedColour ?? recentColour(0);

    return html`
      <section class="card">
        <div class="parameter-stack">
          ${this.showModeSelector
            ? html`
                <label class="field">
                  <span class="parameter-label">Mode</span>
                  <select
                    aria-label="Mode"
                    .value=${live(this.content.mode)}
                    ?disabled=${this.disabled}
                    @change=${this.modeChanged}
                  >
                    ${modeOptions.map(
                      (mode) => html`
                        <option
                          value=${mode.id}
                          .selected=${mode.id === this.content?.mode}
                        >
                          ${mode.label}
                        </option>
                      `,
                    )}
                  </select>
                </label>
              `
            : nothing}

          ${this.renderRangeField(
            "Sensitivity",
            sensitivity,
            sensitivityMinimum,
            sensitivityMaximum,
            (value) =>
              this.updateContent((content) => {
                content.sensitivity = value;
                return content;
              }),
          )}

          ${this.renderSegmentedField(
            "Colour mode",
            colourMode,
            [
              { value: "automatic", label: "Automatic" },
              { value: "fixed", label: "Fixed" },
            ] as const,
            (value) => this.colourModeChanged(value === "fixed"),
          )}

          ${colourMode === "fixed"
            ? html`
                <div class="parameter-group fixed-colour">
                  <span class="parameter-label">Fixed colour</span>
                  <govee-colour-picker
                    .colour=${fixedColour}
                    .disabled=${this.disabled}
                    @colour-changing=${(event: CustomEvent<{ colour: RGB }>) =>
                      this.fixedColourChanged(event.detail.colour, "changing")}
                    @colour-changed=${(event: CustomEvent<{ colour: RGB }>) =>
                      this.fixedColourChanged(event.detail.colour, "committed")}
                  ></govee-colour-picker>
                </div>
              `
            : nothing}

          ${isStyleMode(this.content.mode)
            ? this.renderSegmentedField(
                "Style",
                Boolean(this.content.calm),
                [
                  { value: false, label: "Dynamic" },
                  { value: true, label: "Calm" },
                ] as const,
                (value) => this.styleChanged(value),
              )
            : nothing}

          ${this.renderModeParameters(this.content)}
        </div>
      </section>
    `;
  }

  private renderSegmentedField<T extends SegmentedControlValue>(
    label: string,
    value: T,
    options: readonly SegmentedControlOption<T>[],
    changed: (value: T) => void,
  ) {
    return html`
      <govee-segmented-control
        .label=${label}
        .value=${value}
        .options=${options}
        .disabled=${this.disabled}
        @value-changed=${(
          event: CustomEvent<SegmentedControlChange<T>>,
        ) => changed(event.detail.value)}
      ></govee-segmented-control>
    `;
  }

  private renderRangeField(
    label: string,
    value: number,
    min: number,
    max: number,
    commit: (value: number) => void,
    showValue = false,
  ) {
    return html`
      <govee-slider-control
        .label=${label}
        .value=${value}
        .minimum=${min}
        .maximum=${max}
        .showValue=${showValue}
        .disabled=${this.disabled}
        @value-changed=${(event: CustomEvent<SliderControlChange>) => {
          this.interaction = "changing";
          try {
            commit(event.detail.value);
          } finally {
            this.interaction = "committed";
          }
        }}
      ></govee-slider-control>
    `;
  }

  private renderModeParameters(content: MusicProfileContent) {
    switch (content.mode) {
      case "separation":
        return this.renderSeparationParameters(content.parameters);
      case "hopping":
        return this.renderHoppingParameters(content.parameters);
      case "piano_keys":
        return this.renderPianoKeysParameters(content.parameters);
      case "fountain":
        return this.renderFountainParameters(content.parameters);
      case "day_and_night":
        return this.renderDayAndNightParameters(content.parameters);
      default:
        return nothing;
    }
  }

  private renderSeparationParameters(parameters: JsonObject) {
    const point = numberParameter(parameters, "point", 1, 1, 5);
    const gradient = booleanParameter(parameters, "gradient", true);

    return html`
      ${this.renderRangeField("Point", point, 1, 5, (value) =>
        this.updateParameter("point", value))}
      ${this.renderCheckboxField("Gradient", gradient, (checked) =>
        this.updateParameter("gradient", checked))}
    `;
  }

  private renderHoppingParameters(parameters: JsonObject) {
    const relativeBrightness = numberParameter(
      parameters,
      "relative_brightness",
      50,
      0,
      50,
    );

    return html`
      ${this.renderRangeField(
        "Relative brightness",
        relativeBrightness,
        0,
        50,
        (value) => this.updateParameter("relative_brightness", value),
      )}
    `;
  }

  private renderPianoKeysParameters(parameters: JsonObject) {
    const keyCount = numberParameter(parameters, "key_count", 15, 8, 15);

    return html`
      ${this.renderRangeField("Key count", keyCount, 8, 15, (value) =>
        this.updateParameter("key_count", value))}
    `;
  }

  private renderFountainParameters(parameters: JsonObject) {
    const direction = directionParameter(parameters, "direction", "clockwise");

    return html`
      <label class="field">
        <span class="parameter-label">Direction</span>
        <select
          aria-label="Direction"
          .value=${live(direction)}
          ?disabled=${this.disabled}
          @change=${(event: Event) =>
            this.updateParameter(
              "direction",
              (event.target as HTMLSelectElement).value as FountainDirection,
            )}
        >
          ${FOUNTAIN_DIRECTIONS.map(
            (option) => html`
              <option
                value=${option.id}
                .selected=${option.id === direction}
              >
                ${option.label}
              </option>
            `,
          )}
        </select>
      </label>
    `;
  }

  private renderDayAndNightParameters(parameters: JsonObject) {
    const segmentCount = numberParameter(parameters, "segment_count", 1, 1, 7);
    const speed = numberParameter(parameters, "speed", 10, 1, 50);
    const gradient = booleanParameter(parameters, "gradient", false);

    return html`
      ${this.renderRangeField(
        "Segment count",
        segmentCount,
        1,
        7,
        (value) => this.updateParameter("segment_count", value),
        true,
      )}
      ${this.renderRangeField("Speed", speed, 1, 50, (value) =>
        this.updateParameter("speed", value))}
      ${this.renderCheckboxField("Gradient", gradient, (checked) =>
        this.updateParameter("gradient", checked))}
    `;
  }

  private renderCheckboxField(
    label: string,
    checked: boolean,
    commit: (checked: boolean) => void,
  ) {
    return html`
      <govee-checkbox-control
        .label=${label}
        .checked=${checked}
        .disabled=${this.disabled}
        @checked-changed=${(event: CustomEvent<CheckboxControlChange>) =>
          commit(event.detail.checked)}
      ></govee-checkbox-control>
    `;
  }

  private modeChanged = (event: Event): void => {
    const mode = (event.target as HTMLSelectElement).value;
    this.updateContent((content) => {
      content.mode = mode;
      content.parameters = preserveExtensionParameters(content.parameters);
      content.calm = isStyleMode(mode) ? content.calm ?? false : null;
      return content;
    });
  };

  private colourModeChanged(fixed: boolean): void {
    this.updateContent((content) => {
      if (!fixed) {
        this.lastFixedColour = content.colour === null ? this.lastFixedColour : cloneRgb(content.colour);
        content.colour = null;
        return content;
      }

      const colour = content.colour ?? this.lastFixedColour ?? recentColour(0);
      this.lastFixedColour = cloneRgb(colour);
      content.colour = cloneRgb(colour);
      return content;
    });
  }

  private fixedColourChanged(
    colour: RGB,
    interaction: LivePreviewInteraction,
  ): void {
    this.lastFixedColour = cloneRgb(colour);
    this.updateContent((content) => {
      content.colour = cloneRgb(colour);
      return content;
    }, interaction);
  }

  private styleChanged(calm: boolean): void {
    this.updateContent((content) => {
      if (!isStyleMode(content.mode)) {
        return content;
      }
      content.calm = calm;
      return content;
    });
  }

  private updateParameter(
    key: OwnedMusicParameterKey,
    value: boolean | number | FountainDirection,
  ): void {
    this.updateContent((content) => {
      const parameters = cloneJsonObject(content.parameters);
      parameters[key] = value;
      content.parameters = parameters;
      return content;
    });
  }

  private updateContent(
    transform: (content: MusicProfileContent) => MusicProfileContent,
    interaction: LivePreviewInteraction = this.interaction,
  ): void {
    if (!this.content) {
      return;
    }

    const installed = cloneMusicProfileContent(transform(cloneMusicProfileContent(this.content)));
    this.content = installed;
    this.dispatchEvent(
      new CustomEvent<{
        content: MusicProfileContent;
        interaction: LivePreviewInteraction;
      }>("content-changed", {
        detail: {
          content: cloneMusicProfileContent(installed),
          interaction,
        },
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
      }

    `,
  ];
}

function modeOptionsFor(
  currentMode: string,
  catalogue?: ModelEffectCatalogue,
): EffectStudioModeOption[] {
  const options = catalogue?.music_modes.map((mode) => ({ ...mode })) ?? [];
  if (options.some((mode) => mode.id === currentMode)) {
    return options;
  }
  return [{ id: currentMode, label: `Unknown mode ${currentMode}` }, ...options];
}

function preserveExtensionParameters(parameters: JsonObject): JsonObject {
  const preserved = cloneJsonObject(parameters);
  for (const key of OWNED_MUSIC_PARAMETER_KEYS) {
    delete preserved[key];
  }
  return preserved;
}

function isStyleMode(mode: string): boolean {
  return STYLE_MODE_IDS.has(mode);
}

function numberParameter(
  parameters: JsonObject,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const value = parameters[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return clampInteger(value, minimum, maximum);
}

function booleanParameter(
  parameters: JsonObject,
  key: string,
  fallback: boolean,
): boolean {
  return typeof parameters[key] === "boolean" ? (parameters[key] as boolean) : fallback;
}

function directionParameter(
  parameters: JsonObject,
  key: string,
  fallback: FountainDirection,
): FountainDirection {
  const value = parameters[key];
  return FOUNTAIN_DIRECTIONS.some((option) => option.id === value)
    ? (value as FountainDirection)
    : fallback;
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-music-profile-editor": GoveeMusicProfileEditor;
  }
}

if (!customElements.get("govee-music-profile-editor")) {
  customElements.define(
    "govee-music-profile-editor",
    GoveeMusicProfileEditor,
  );
}
