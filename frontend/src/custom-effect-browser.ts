import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import {
  buildCustomEffectEntries,
  newEffectKindForCategory,
  type CustomEffectListContext,
  type CustomEffectListEntry,
} from "./custom-effect-list";
import { customEffectCategories } from "./custom-effect-workflow";
import type { CustomEffectCategory } from "./effect-editor-model";
import {
  studioBaseStyles,
  studioSelectorStyles,
  studioWorkspaceStyles,
} from "./studio-styles";

export interface CustomEffectBrowserEntryRequest {
  entry: CustomEffectListEntry;
}

export interface CustomEffectBrowserCategoryRequest {
  category: CustomEffectCategory;
}

export class GoveeCustomEffectBrowser extends LitElement {
  @property({ attribute: false })
  public context?: CustomEffectListContext;

  @property()
  public category: CustomEffectCategory = "single-layer";

  @property()
  public currentItemId?: string;

  @property()
  public templateSelection?: string;

  @property({ type: Boolean })
  public isAdmin = false;

  protected render() {
    const context = this.context;
    if (!context) {
      return nothing;
    }
    const entries = buildCustomEffectEntries(context, this.category);
    const canCreate =
      (this.category === "music" &&
        Boolean(context.catalogue?.music_modes.length)) ||
      newEffectKindForCategory(context, this.category) !== undefined;
    return html`
      <aside
        class="sidebar category-sidebar effect-categories"
        aria-label="Effect categories"
      >
        ${customEffectCategories(context).map(({ category, label }) =>
          this.categoryButton(category, label),
        )}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        ${canCreate
          ? html`
              <button
                class="selector item new-effect-action"
                type="button"
                ?disabled=${!this.isAdmin}
                @click=${this.requestNew}
              >
                <span
                  ><span class="new-effect-icon" aria-hidden="true"></span
                  >New</span
                >
              </button>
            `
          : nothing}
        ${entries.map((entry) => this.entryButton(entry))}
      </aside>
    `;
  }

  private categoryButton(
    category: CustomEffectCategory,
    label: string,
  ) {
    const selected = this.category === category;
    return html`
      <button
        class="selector ${selected ? "selected" : ""}"
        type="button"
        aria-current=${selected ? "page" : nothing}
        @click=${() => {
          this.dispatchEvent(
            new CustomEvent<CustomEffectBrowserCategoryRequest>(
              "custom-category-requested",
              {
                detail: { category },
                bubbles: true,
                composed: true,
              },
            ),
          );
        }}
      >
        ${label}
      </button>
    `;
  }

  private entryButton(entry: CustomEffectListEntry) {
    const selected =
      entry.kind === "saved"
        ? this.currentItemId === entry.item.id
        : this.currentItemId === undefined &&
          this.templateSelection === entry.key;
    return html`
      <button
        class="selector item ${selected ? "selected" : ""}"
        type="button"
        ?disabled=${entry.kind !== "saved" && !this.isAdmin}
        @click=${() => {
          this.dispatchEvent(
            new CustomEvent<CustomEffectBrowserEntryRequest>(
              "custom-entry-requested",
              {
                detail: { entry },
                bubbles: true,
                composed: true,
              },
            ),
          );
        }}
      >
        <span>${entry.label}</span>
      </button>
    `;
  }

  private requestNew(): void {
    this.dispatchEvent(
      new CustomEvent<CustomEffectBrowserCategoryRequest>(
        "custom-new-requested",
        {
          detail: { category: this.category },
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  static styles = [
    studioBaseStyles,
    studioSelectorStyles,
    studioWorkspaceStyles,
    css`
      :host {
        --new-effect-stroke-width: 1.5px;
        --new-effect-sticky-shadow-height: 5px;
        display: contents;
      }

      .new-effect-action {
        position: sticky;
        z-index: var(--studio-z-raised);
        top: 0;
        margin-bottom: var(--studio-tight-gap);
        border: var(--studio-border-width) solid
          color-mix(in srgb, var(--studio-blue) 24%, var(--studio-border));
        color: var(--primary-text-color);
        background: color-mix(
          in srgb,
          var(--studio-blue) 5%,
          var(--primary-background-color, #fff)
        );
        box-shadow: 0 var(--new-effect-sticky-shadow-height) 0
          var(--primary-background-color, #fff);
        font-weight: var(--studio-font-weight-semibold);
      }

      .new-effect-icon {
        display: inline-block;
        width: var(--studio-spacing-lg);
        height: var(--studio-spacing-lg);
        margin-inline-end: var(--studio-compact-gap);
        background:
          linear-gradient(var(--studio-blue), var(--studio-blue)) center /
            var(--studio-spacing-lg) var(--new-effect-stroke-width) no-repeat,
          linear-gradient(var(--studio-blue), var(--studio-blue)) center /
            var(--new-effect-stroke-width) var(--studio-spacing-lg) no-repeat;
      }

      .new-effect-action:hover {
        border-color: color-mix(
          in srgb,
          var(--studio-blue) 34%,
          var(--studio-border)
        );
        background: color-mix(
          in srgb,
          var(--studio-blue) 9%,
          var(--primary-background-color, #fff)
        );
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--studio-compact-gap);
      }

      /* Places categories and effects in stacked rows beside HA's docked sidebar. */
      @media (min-width: 901px) and (max-width: 1320px) {
        .effect-categories {
          display: flex;
          grid-row: 1;
          grid-column: 2;
          gap: var(--studio-tight-gap);
          overflow-x: auto;
          padding: var(--studio-responsive-navigation-padding);
          border-inline-end: 0;
          border-bottom: var(--studio-border-width) solid var(--studio-border);
        }

        .effect-categories .selector {
          width: auto;
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .library {
          grid-row: 2;
          grid-column: 2;
          max-height: var(--studio-stacked-list-max-height);
          border-inline-end: 0;
          border-bottom: var(--studio-border-width) solid var(--studio-border);
        }
      }

      /* The panel owns document-flow placement below this width. */
      @media (max-width: 900px) {
        :host {
          display: block;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-custom-effect-browser": GoveeCustomEffectBrowser;
  }
}

if (!customElements.get("govee-custom-effect-browser")) {
  customElements.define(
    "govee-custom-effect-browser",
    GoveeCustomEffectBrowser,
  );
}
