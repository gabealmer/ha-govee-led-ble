import { html, nothing, type TemplateResult } from "lit";

import {
  isKnownSelectionType,
  KNOWN_SELECTION_TYPES,
} from "./advanced-effect-model";
import type { SliderControlChange } from "./slider-control";
import type { EffectLayer, SelectionType } from "./types";
import { clampInteger } from "./ui-utils";

const SELECTION_LABELS: Record<SelectionType, string> = { 0: "Segment", 1: "Continuous", 2: "Random", 3: "Custom" };

type SelectionParameterKey = "param_1" | "param_2";
type SelectionParameter = readonly [SelectionParameterKey, string];

const SELECTION_PARAMETERS: Record<SelectionType, readonly SelectionParameter[]> = {
  0: [["param_2", "Segments"]],
  1: [["param_2", "Count"]],
  2: [["param_2", "Minimum"], ["param_1", "Maximum"]],
  3: [["param_1", "Lit length"], ["param_2", "Gap"]],
};

export function renderSelectionControls(layer: EffectLayer, disabled: boolean, update: (update: Partial<EffectLayer["selection"]>) => void): TemplateResult {
  const selection = layer.selection;
  const knownType = isKnownSelectionType(selection.type);
  const parameters = knownType
    ? SELECTION_PARAMETERS[selection.type as SelectionType]
    : [];
  return html`
    <div class="selection-controls">
      <span class="parameter-label">Selection</span>
      <label class="field">
        <span>Type</span>
        <select
          aria-label="Selection type"
          .value=${knownType ? String(selection.type) : ""}
          ?disabled=${disabled}
          @change=${(event: Event) => update({ type: Number((event.target as HTMLSelectElement).value) })}
        >
          ${KNOWN_SELECTION_TYPES.map((value) => html`
            <option value=${value} .selected=${selection.type === value}>${SELECTION_LABELS[value]}</option>
          `)}
          ${knownType
            ? nothing
            : html`<option value="" disabled selected>Choose a type</option>`}
        </select>
      </label>
      ${parameters.map(([key, label]) =>
        renderNumberField(label, selection[key], (value) => update({ [key]: value }), disabled),
      )}
    </div>
  `;
}

export function renderDistribution(
  layer: EffectLayer, disabled: boolean, updateDistribution: (update: Partial<EffectLayer["distribution"]>) => void, updateLayer: (update: Partial<EffectLayer>) => void,
): TemplateResult {
  const method = layer.distribution.method;
  return html`
    <section class="card">
      <h3 class="section-title">Distribution</h3>
      <label class="field">
        <span>Method</span>
        <select
          .value=${method <= 2 ? String(method) : ""}
          ?disabled=${disabled}
          @change=${(event: Event) => updateDistribution({ method: Number((event.target as HTMLSelectElement).value) })}
        >
          <option value="0">Unified</option>
          <option value="1">By IC</option>
          <option value="2">By segment</option>
          ${method > 2
            ? html`<option value="" disabled selected>Choose a method</option>`
            : nothing}
        </select>
      </label>
      ${method === 1 || method === 2 ? html`
        <label class="field">
          <span>Direction</span>
          <select
            .value=${layer.distribution.backwards ? "backwards" : "forwards"}
            ?disabled=${disabled}
            @change=${(event: Event) => updateDistribution({
              backwards: (event.target as HTMLSelectElement).value === "backwards",
            })}
          >
            <option value="forwards">Forward</option>
            <option value="backwards">Backward</option>
          </select>
        </label>
      ` : nothing}
      ${renderRangeField("Colour speed", layer.colour_speed, (value) => updateLayer({ colour_speed: value }), disabled)}
      ${renderRangeField("Colour retention", layer.colour_retention, (value) => updateLayer({ colour_retention: value }), disabled)}
    </section>
  `;
}

export function renderRangeField(
  label: string, value: number, changed: (value: number) => void, disabled: boolean,
): TemplateResult {
  return html`
    <govee-slider-control
      .label=${label}
      .value=${value}
      .minimum=${0}
      .maximum=${255}
      .disabled=${disabled}
      @value-changed=${(event: CustomEvent<SliderControlChange>) => changed(event.detail.value)}
    ></govee-slider-control>
  `;
}

export function renderNumberField(
  label: string, value: number, changed: (value: number) => void, disabled: boolean, minimum = 0, maximum = 255,
): TemplateResult {
  return html`
    <label class="field">
      <span>${label}</span>
      <input
        type="number"
        min=${minimum}
        max=${maximum}
        .value=${String(value)}
        ?disabled=${disabled}
        @change=${(event: Event) => changed(clampInteger(Number((event.target as HTMLInputElement).value), minimum, maximum))}
      />
    </label>
  `;
}
