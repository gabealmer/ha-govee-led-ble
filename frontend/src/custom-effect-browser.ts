import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import {
  buildCustomEffectEntries,
  customEffectCategoryAvailable,
  newEffectKindForCategory,
  type CustomEffectListContext,
  type CustomEffectListEntry,
} from "./custom-effect-list";
import { filterCustomEffectEntries } from "./custom-effect-workflow";
import type { CustomEffectCategory } from "./effect-editor-model";
import {
  studioBaseStyles,
  studioSelectorStyles,
  studioVisuallyHiddenStyles,
  studioWorkspaceStyles,
} from "./studio-styles";

const CATEGORIES: readonly [
  CustomEffectCategory,
  string,
][] = [
  ["my-effects", "My Effects"],
  ["music", "Music"],
  ["single-layer", "Single Layer"],
  ["multi-layer", "Multi Layer"],
  ["advanced", "Advanced"],
  ["special-diy", "Special DIY"],
];

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

  @state()
  private search = "";

  protected render() {
    const context = this.context;
    if (!context) {
      return nothing;
    }
    const entries = filterCustomEffectEntries(
      buildCustomEffectEntries(context, this.category),
      this.search,
    );
    const canCreate =
      (this.category === "music" &&
        Boolean(context.catalogue?.music_modes.length)) ||
      newEffectKindForCategory(context, this.category) !== undefined;
    return html`
      <aside
        class="sidebar category-sidebar effect-categories"
        aria-label="Effect categories"
      >
        ${CATEGORIES.map(([category, label]) =>
          customEffectCategoryAvailable(context, category)
            ? this.categoryButton(category, label)
            : nothing,
        )}
      </aside>

      <aside class="sidebar item-sidebar library" aria-label="Effects">
        <label class="effect-search">
          <span class="visually-hidden">Search effects</span>
          <input
            type="search"
            aria-label="Search effects"
            placeholder="Search effects"
            .value=${this.search}
            @input=${(event: Event) => {
              this.search = (event.target as HTMLInputElement).value;
            }}
          />
        </label>
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
    studioVisuallyHiddenStyles,
    studioWorkspaceStyles,
    css`
      :host {
        display: contents;
      }

      .effect-search {
        display: block;
        margin-bottom: 12px;
      }

      .effect-search input {
        width: 100%;
        min-height: var(--studio-control-height);
        padding: 8px 11px;
        border: 1px solid var(--studio-border);
        border-radius: var(--studio-control-radius);
        color: var(--primary-text-color);
        background: var(--studio-card);
      }

      .new-effect-action {
        position: sticky;
        z-index: 1;
        top: 0;
        margin-bottom: 6px;
        border: 1px solid
          color-mix(in srgb, var(--studio-blue) 24%, var(--studio-border));
        color: var(--primary-text-color);
        background: color-mix(
          in srgb,
          var(--studio-blue) 5%,
          var(--primary-background-color, #fff)
        );
        box-shadow: 0 5px 0 var(--primary-background-color, #fff);
        font-weight: 600;
      }

      .new-effect-icon {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-inline-end: 8px;
        background:
          linear-gradient(var(--studio-blue), var(--studio-blue)) center /
            12px 1.5px no-repeat,
          linear-gradient(var(--studio-blue), var(--studio-blue)) center /
            1.5px 12px no-repeat;
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
        gap: 8px;
      }

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
