import { LitElement, css, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { studioBaseStyles } from "./studio-styles";

export interface ReorderableStripItem {
  key: string;
  label: string;
  ariaLabel: string;
  colour?: string;
  removeReady?: boolean;
  disabled?: boolean;
  id?: string;
  ariaControls?: string;
}

export class GoveeReorderableStrip extends LitElement {
  @property({ attribute: false })
  public items: ReorderableStripItem[] = [];

  @property({ attribute: false })
  public activeIndex?: number;

  @property()
  public ariaLabel = "Items";

  @property()
  public itemRole: "button" | "tab" = "button";

  @property()
  public addLabel = "Add item";

  @property({ type: Boolean })
  public addDisabled = false;

  @property({ type: Boolean })
  public addHidden = false;

  @property({ type: Boolean })
  public reorderDisabled = false;

  private draggedIndex?: number;
  private pointerId?: number;
  private pointerIndex?: number;
  private pointerTarget?: HTMLElement;
  private pointerX = 0;
  private pointerY = 0;
  private pointerMoved = false;
  private suppressClick = false;

  protected render() {
    const tablist = this.itemRole === "tab";
    return html`
      <ul
        class="item-list"
        aria-label=${this.ariaLabel}
        role=${tablist ? "tablist" : nothing}
      >
        ${this.items.map(
          (item, index) => html`
            <li
              class="item-wrapper"
              role=${tablist ? "presentation" : nothing}
              data-item-index=${index}
              draggable=${this.reorderDisabled ? "false" : "true"}
              @dragstart=${(event: DragEvent) =>
                this.dragStarted(index, event)}
              @dragover=${(event: DragEvent) => {
                if (!this.reorderDisabled) {
                  event.preventDefault();
                }
              }}
              @drop=${(event: DragEvent) => this.dropped(index, event)}
              @pointerdown=${(event: PointerEvent) =>
                this.pointerStarted(index, event)}
              @pointermove=${this.pointerMovedOver}
              @pointerup=${this.pointerFinished}
              @pointercancel=${this.pointerFinished}
            >
              <button
                id=${item.id ?? nothing}
                class="item ${item.colour ? "colour" : "label"} ${index ===
                this.activeIndex
                  ? "selected"
                  : ""} ${item.removeReady ? "remove-ready" : ""}"
                type="button"
                role=${tablist ? "tab" : nothing}
                aria-label=${item.ariaLabel}
                aria-selected=${tablist
                  ? String(index === this.activeIndex)
                  : nothing}
                aria-controls=${item.ariaControls ?? nothing}
                tabindex=${tablist
                  ? index === this.activeIndex
                    ? "0"
                    : "-1"
                  : nothing}
                style=${item.colour
                  ? `--item-colour: ${item.colour}`
                  : nothing}
                ?disabled=${item.disabled}
                @click=${() => this.itemClicked(index)}
                @keydown=${(event: KeyboardEvent) =>
                  this.keyPressed(index, event)}
              >
                ${item.colour ? nothing : item.label}
              </button>
              <slot name="item-${index}"></slot>
            </li>
          `,
        )}
        ${this.addHidden
          ? nothing
          : html`
              <li>
                <button
                  class="add"
                  type="button"
                  title=${this.addLabel}
                  aria-label=${this.addLabel}
                  ?disabled=${this.addDisabled}
                  @click=${this.addClicked}
                >
                  +
                </button>
              </li>
            `}
      </ul>
    `;
  }

  public focusItem(index: number): void {
    void this.updateComplete.then(() => {
      this.shadowRoot
        ?.querySelectorAll<HTMLButtonElement>(".item")
        [index]?.focus();
    });
  }

  private itemClicked(index: number): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ index: number }>("item-selected", {
        detail: { index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private addClicked(): void {
    this.dispatchEvent(
      new CustomEvent("item-added", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dragStarted(index: number, event: DragEvent): void {
    if (this.reorderDisabled) {
      return;
    }
    this.draggedIndex = index;
    event.dataTransfer?.setData("text/plain", String(index));
  }

  private dropped(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.draggedIndex === undefined) {
      return;
    }
    this.reorder(this.draggedIndex, index);
    this.draggedIndex = undefined;
  }

  private keyPressed(index: number, event: KeyboardEvent): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const target = index + (event.key === "ArrowLeft" ? -1 : 1);
    if (target < 0 || target >= this.items.length) {
      return;
    }
    if (this.reorderDisabled) {
      if (this.itemRole === "tab") {
        this.itemClicked(target);
        this.focusItem(target);
      }
      return;
    }
    this.reorder(index, target, true);
  }

  private pointerStarted(index: number, event: PointerEvent): void {
    if (
      this.reorderDisabled ||
      event.pointerType === "mouse" ||
      (event.target as HTMLElement).closest(".strip-popover")
    ) {
      return;
    }
    this.suppressClick = false;
    this.pointerId = event.pointerId;
    this.pointerIndex = index;
    this.pointerTarget = event.currentTarget as HTMLElement;
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.pointerMoved = false;
  }

  private pointerMovedOver(event: PointerEvent): void {
    if (
      event.pointerId !== this.pointerId ||
      this.pointerIndex === undefined
    ) {
      return;
    }
    const deltaX = event.clientX - this.pointerX;
    const deltaY = event.clientY - this.pointerY;
    if (!this.pointerMoved) {
      if (Math.abs(deltaY) > Math.abs(deltaX) || Math.abs(deltaX) < 10) {
        return;
      }
      this.pointerMoved = true;
      this.pointerTarget?.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const target = this.shadowRoot
      ?.elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-item-index]");
    const targetIndex = Number(target?.dataset.itemIndex);
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex === this.pointerIndex
    ) {
      return;
    }
    this.reorder(this.pointerIndex, targetIndex);
    this.pointerIndex = targetIndex;
  }

  private pointerFinished(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) {
      return;
    }
    const target = this.pointerTarget;
    if (target?.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.suppressClick = this.pointerMoved;
    this.pointerId = undefined;
    this.pointerIndex = undefined;
    this.pointerTarget = undefined;
    this.pointerMoved = false;
  }

  private reorder(from: number, to: number, restoreFocus = false): void {
    if (this.reorderDisabled || from === to) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ from: number; to: number }>("items-reordered", {
        detail: { from, to },
        bubbles: true,
        composed: true,
      }),
    );
    if (restoreFocus) {
      this.focusItem(to);
    }
  }

  static styles = [studioBaseStyles, css`
    :host {
      --strip-label-min-width: 76px;
      --strip-popover-default-width: 280px;
      --strip-remove-icon-size: 26px;
      display: block;
    }

    .item-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--studio-control-gap);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .item-wrapper {
      position: relative;
      touch-action: pan-y;
    }

    .item-wrapper[draggable="true"] {
      cursor: grab;
    }

    .item,
    .add {
      height: var(--studio-control-height);
      padding: 0;
      border-radius: var(--studio-control-radius);
      cursor: pointer;
    }

    .item {
      border: var(--studio-border-width) solid rgb(0 0 0 / 14%);
    }

    .item.colour,
    .add {
      width: var(--studio-control-height);
    }

    .item.colour {
      background: var(--item-colour);
    }

    .item.label {
      min-width: var(--strip-label-min-width);
      padding: 0 var(--studio-spacing-xl);
      color: var(--primary-text-color);
      background: var(--studio-card);
      font-weight: var(--studio-font-weight-semibold);
    }

    .item.label.selected {
      color: var(--studio-blue);
      border-color: var(--studio-blue);
      background: var(--studio-blue-soft);
    }

    .item.remove-ready {
      position: relative;
      outline: var(--studio-strong-border-width) solid
        rgb(255 255 255 / 95%);
      outline-offset: calc(0px - var(--studio-micro-gap));
    }

    .item.remove-ready::after {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: var(--strip-remove-icon-size);
      font-weight: var(--studio-font-weight-medium);
      text-shadow: 0 var(--studio-border-width) var(--studio-micro-gap)
        rgb(0 0 0 / 80%);
      content: "×";
      pointer-events: none;
    }

    .add {
      display: grid;
      place-items: center;
      border: var(--studio-border-width) dashed var(--studio-border);
      color: var(--studio-blue);
      background: transparent;
      font-size: var(--studio-editor-heading-size);
    }

    .item:focus-visible,
    .add:focus-visible {
      outline: var(--studio-focus-width) solid var(--studio-blue);
      outline-offset: var(--studio-focus-offset);
    }

    ::slotted(.strip-popover) {
      position: absolute;
      z-index: var(--studio-z-popover);
      top: calc(var(--studio-control-height) + var(--studio-compact-gap));
      left: 0;
      width: min(
        var(--strip-popover-width, var(--strip-popover-default-width)),
        calc(100vw - var(--studio-dialog-viewport-gutter))
      );
      padding: var(--studio-popover-padding);
      border: var(--studio-border-width) solid var(--studio-border);
      border-radius: var(--studio-popover-radius);
      background: var(--studio-card);
      box-shadow: var(--studio-popover-shadow);
    }

    /* Promotes popovers to viewport overlays on phones to avoid clipping. */
    @media (max-width: 600px) {
      ::slotted(.strip-popover) {
        position: fixed;
        top: 50%;
        right: var(--studio-mobile-gutter);
        left: var(--studio-mobile-gutter);
        width: auto;
        max-height: calc(100vh - var(--studio-dialog-viewport-gutter));
        overflow: auto;
        transform: translateY(-50%);
      }
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "govee-reorderable-strip": GoveeReorderableStrip;
  }
}

if (!customElements.get("govee-reorderable-strip")) {
  customElements.define(
    "govee-reorderable-strip",
    GoveeReorderableStrip,
  );
}
