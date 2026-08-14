import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import "./palette-editor";
import type { SliderControlChange } from "./slider-control";
import "./slider-control";
import {
  studioBaseStyles,
  studioCardStyles,
  studioFormStyles,
} from "./studio-styles";
import type {
  DiyEffectFamily,
  EffectPair,
  ModelEffectCatalogue,
  MultiContent,
  PaletteDiyEffectContent,
  RGB,
  SingleContent,
} from "./types";
import { clonePalette } from "./ui-utils";

type PaletteContent = SingleContent | MultiContent | PaletteDiyEffectContent;

export class GoveeCustomEffectEditor extends LitElement {
  @property({ attribute: false })
  public content?: PaletteContent;

  @property({ attribute: false })
  public catalogue?: ModelEffectCatalogue;

  @property({ type: Boolean })
  public disabled = false;

  private draggedEffectIndex?: number;

  protected updated(): void {
    if (!this.content) {
      return;
    }
    if (
      this.content.kind === "h617a_single" ||
      this.content.kind === "palette_diy"
    ) {
      const variation = this.shadowRoot?.querySelector<HTMLSelectElement>(
        "select[data-single-variation]",
      );
      if (variation) {
        variation.value = String(this.content.variant);
      }
      return;
    }
    this.content.effects.forEach((pair, index) => {
      const family = this.effectFamily(pair, true);
      const effect = this.shadowRoot?.querySelector<HTMLSelectElement>(
        `select[data-effect-index="${index}"]`,
      );
      const variation = this.shadowRoot?.querySelector<HTMLSelectElement>(
        `select[data-variation-index="${index}"]`,
      );
      if (effect) {
        effect.value = family?.id ?? `unknown:${pair.family}`;
      }
      if (variation) {
        variation.value = String(pair.variant);
      }
    });
  }

  protected render() {
    if (!this.content || !this.catalogue) {
      return nothing;
    }
    const rateLabel =
      (this.content.kind === "h617a_single" ||
        this.content.kind === "palette_diy") &&
      this.effectFamily(this.content)?.rate === "sensitivity"
        ? "Sensitivity"
        : "Speed";

    return html`
      ${this.content.kind === "h617a_multi"
        ? html`
            <section class="card effect-card">
              <h3 class="section-title">Effects</h3>
              ${this.renderSequence(this.content)}
            </section>
          `
        : nothing}

      <section class="card parameters-card">
        <div class="parameter-stack">
          ${this.renderSingleVariation()}
          <div class="parameter-group">
            <span class="parameter-label">Colours</span>
            ${this.renderPalette()}
          </div>
          <govee-slider-control
            .label=${rateLabel}
            .value=${this.content.speed}
            .minimum=${0}
            .maximum=${100}
            .disabled=${this.disabled}
            @value-changed=${(event: CustomEvent<SliderControlChange>) =>
              this.emitContent({
                ...this.content!,
                speed: event.detail.value,
              })}
          ></govee-slider-control>
        </div>
      </section>
    `;
  }

  private renderSingleVariation() {
    if (
      !this.content ||
      (this.content.kind !== "h617a_single" &&
        this.content.kind !== "palette_diy")
    ) {
      return nothing;
    }
    const content = this.content;
    const family = this.effectFamily(content);
    const variations = family?.variations ?? [];
    const knownVariation = variations.some(
      (variation) => variation.variant === content.variant,
    );
    if (knownVariation && variations.length <= 1) {
      return nothing;
    }
    return html`
      <label class="field parameter-group">
        <span class="parameter-label">Variation</span>
        <select
          aria-label="Variation"
          data-single-variation
          .value=${String(content.variant)}
          ?disabled=${this.disabled}
          @change=${(event: Event) =>
            this.emitContent({
              ...content,
              variant: Number((event.target as HTMLSelectElement).value),
            })}
        >
          ${knownVariation
            ? nothing
            : html`
                <option value=${String(content.variant)}>
                  Unknown variation ${content.variant}
                </option>
              `}
          ${variations.map(
            (variation) => html`
              <option value=${String(variation.variant)}>
                ${variation.label}
              </option>
            `,
          )}
        </select>
      </label>
    `;
  }

  private renderSequence(content: MultiContent) {
    return html`
      <ol class="sequence">
        ${content.effects.map((pair, index) => this.effectRow(pair, index))}
      </ol>
      <button
        class="add-step"
        type="button"
        title="Add another effect"
        aria-label="Add another effect"
        ?disabled=${this.disabled ||
        content.effects.length >= this.catalogue!.limits.multi_max}
        @click=${this.addEffect}
      >
        +
      </button>
    `;
  }

  private effectRow(pair: EffectPair, index: number) {
    const family = this.effectFamily(pair, true);
    const variations = family?.variations ?? [];
    return html`
      <li
        class="effect-row"
        draggable=${!this.disabled ? "true" : "false"}
        @dragstart=${(event: DragEvent) =>
          this.effectDragStarted(index, event)}
        @dragover=${(event: DragEvent) => {
          if (!this.disabled) {
            event.preventDefault();
          }
        }}
        @drop=${(event: DragEvent) => this.effectDropped(index, event)}
      >
        <div class="effect-fields">
          <label class="field">
            <span>Effect</span>
            <select
              aria-label="Effect ${index + 1}"
              data-effect-index=${index}
              .value=${family?.id ?? `unknown:${pair.family}`}
              ?disabled=${this.disabled}
              @change=${(event: Event) =>
                this.effectFamilyChanged(
                  index,
                  (event.target as HTMLSelectElement).value,
                )}
            >
              ${family
                ? nothing
                : html`
                    <option value=${`unknown:${pair.family}`}>
                      Unknown effect ${pair.family}
                    </option>
                  `}
              ${this.multiFamilies.map(
                (effect) => html`
                  <option value=${effect.id}>${effect.label}</option>
                `,
              )}
            </select>
          </label>
          <label class="field">
            <span>Variation</span>
            <select
              aria-label="Variation ${index + 1}"
              data-variation-index=${index}
              .value=${String(pair.variant)}
              ?disabled=${this.disabled}
              @change=${(event: Event) =>
                this.effectVariationChanged(
                  index,
                  Number((event.target as HTMLSelectElement).value),
                )}
            >
              ${variations.some(
                (variation) => variation.variant === pair.variant,
              )
                ? nothing
                : html`
                    <option value=${String(pair.variant)}>
                      Unknown variation ${pair.variant}
                    </option>
                  `}
              ${variations.map(
                (variation) => html`
                  <option value=${String(variation.variant)}>
                    ${variation.label}
                  </option>
                `,
              )}
            </select>
          </label>
        </div>
        ${!this.disabled
          ? html`
              <details class="row-menu">
                <summary aria-label="Reorder or remove effect ${index + 1}">
                  ⋮
                </summary>
                <div class="row-menu-popover">
                  <button
                    type="button"
                    ?disabled=${this.disabled || index === 0}
                    @click=${(event: Event) => {
                      this.closeDetails(event);
                      this.moveEffect(index, -1);
                    }}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    ?disabled=${this.disabled ||
                    index ===
                      (this.content as MultiContent).effects.length - 1}
                    @click=${(event: Event) => {
                      this.closeDetails(event);
                      this.moveEffect(index, 1);
                    }}
                  >
                    Move down
                  </button>
                  <button
                    class="danger"
                    type="button"
                    ?disabled=${this.disabled ||
                    (this.content as MultiContent).effects.length === 1}
                    @click=${(event: Event) => {
                      this.closeDetails(event);
                      this.removeEffect(index);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </details>
            `
          : nothing}
      </li>
    `;
  }

  private get multiFamilies(): DiyEffectFamily[] {
    return this.catalogue?.effects.filter((effect) => effect.supports_multi) ?? [];
  }

  private renderPalette() {
    return html`
      <govee-palette-editor
        .palette=${this.content!.palette}
        .minColours=${this.catalogue!.limits.palette_min}
        .maxColours=${this.catalogue!.limits.palette_max}
        .disabled=${this.disabled}
        @palette-changed=${(event: CustomEvent<{ palette: RGB[] }>) => {
          this.emitContent({
            ...this.content!,
            palette: clonePalette(event.detail.palette),
          });
        }}
      ></govee-palette-editor>
    `;
  }

  private effectFamilyChanged(index: number, familyId: string): void {
    const family = this.multiFamilies.find((effect) => effect.id === familyId);
    const variation = family?.variations[0];
    if (!family || !variation) {
      return;
    }
    this.replaceEffect(index, {
      family: family.family,
      variant: variation.variant,
    });
  }

  private effectVariationChanged(index: number, variant: number): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const current = this.content.effects[index];
    if (!current) {
      return;
    }
    this.replaceEffect(index, { ...current, variant });
  }

  private replaceEffect(index: number, pair: EffectPair): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const effects = this.content.effects.map((effect, effectIndex) =>
      effectIndex === index ? pair : effect,
    );
    this.emitContent({ ...this.content, effects });
  }

  private addEffect(): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const next =
      this.multiFamilies[this.content.effects.length] ??
      this.multiFamilies[0];
    const variation = next?.variations[0];
    if (!next || !variation) {
      return;
    }
    const effects = [
      ...this.content.effects,
      { family: next.family, variant: variation.variant },
    ];
    this.emitContent({ ...this.content, effects });
  }

  private removeEffect(index: number): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const effects = this.content.effects.filter(
      (_effect, effectIndex) => effectIndex !== index,
    );
    this.emitContent({ ...this.content, effects });
  }

  private moveEffect(index: number, offset: number): void {
    if (!this.content || this.content.kind !== "h617a_multi") {
      return;
    }
    const target = index + offset;
    if (target < 0 || target >= this.content.effects.length) {
      return;
    }
    this.reorderEffect(index, target);
  }

  private reorderEffect(from: number, to: number): void {
    if (!this.content || this.content.kind !== "h617a_multi" || from === to) {
      return;
    }
    const effects = [...this.content.effects];
    const [moving] = effects.splice(from, 1);
    effects.splice(to, 0, moving);
    this.emitContent({ ...this.content, effects });
  }

  private effectDragStarted(index: number, event: DragEvent): void {
    this.draggedEffectIndex = index;
    event.dataTransfer?.setData("text/plain", String(index));
  }

  private effectDropped(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedEffectIndex === undefined) {
      return;
    }
    this.reorderEffect(this.draggedEffectIndex, index);
    this.draggedEffectIndex = undefined;
  }

  private closeDetails(event: Event): void {
    (event.currentTarget as HTMLElement).closest("details")?.removeAttribute(
      "open",
    );
  }

  private effectFamily(
    pair: EffectPair,
    multiOnly = false,
  ): DiyEffectFamily | undefined {
    return (multiOnly ? this.multiFamilies : this.catalogue?.effects)?.find(
      (effect) => effect.family === pair.family,
    );
  }

  private emitContent(content: PaletteContent): void {
    this.dispatchEvent(
      new CustomEvent<{ content: PaletteContent }>("content-changed", {
        detail: { content },
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

    p {
      margin-top: 0;
    }

    .parameters-card {
      margin-top: var(--studio-section-gap);
    }

    .sequence {
      display: grid;
      gap: 8px;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
    }

    .effect-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .effect-row[draggable="true"] {
      cursor: grab;
    }

    .effect-fields {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      flex: 1;
      gap: 10px;
      min-width: 0;
    }

    .effect-fields .field {
      margin-top: 0;
      font-size: 12px;
      font-weight: 650;
    }

    .effect-fields select {
      width: 100%;
      min-height: var(--studio-control-height);
      padding: 8px 10px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .row-menu {
      position: relative;
      flex: 0 0 var(--studio-control-height);
    }

    .row-menu summary {
      display: grid;
      width: var(--studio-control-height);
      height: var(--studio-control-height);
      place-items: center;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      color: var(--studio-muted);
      background: var(--studio-card);
      cursor: pointer;
      list-style: none;
      font-size: 22px;
    }

    .row-menu summary::-webkit-details-marker {
      display: none;
    }

    .row-menu-popover {
      position: absolute;
      z-index: 20;
      top: 50px;
      right: 0;
      display: grid;
      width: 150px;
      padding: 6px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-popover-radius);
      background: var(--studio-card);
      box-shadow: var(--studio-popover-shadow);
    }

    .row-menu-popover button {
      padding: 8px 10px;
      border: 0;
      border-radius: 6px;
      color: var(--primary-text-color);
      background: transparent;
      text-align: start;
      cursor: pointer;
    }

    .danger {
      color: var(--studio-danger) !important;
    }

    .add-step {
      display: grid;
      width: var(--studio-control-height);
      height: var(--studio-control-height);
      place-items: center;
      padding: 0;
      border: 1px dashed var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--studio-blue);
      background: transparent;
      cursor: pointer;
      font-size: 24px;
    }

    @media (max-width: 560px) {
      .effect-fields {
        grid-template-columns: 1fr;
      }
    }

  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-custom-effect-editor": GoveeCustomEffectEditor;
  }
}

if (!customElements.get("govee-custom-effect-editor")) {
  customElements.define(
    "govee-custom-effect-editor",
    GoveeCustomEffectEditor,
  );
}
