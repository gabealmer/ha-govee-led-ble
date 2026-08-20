import { css } from "lit";

import {
  studioActionStyles,
  studioBaseStyles,
  studioCardStyles,
  studioFormStyles,
  studioVisuallyHiddenStyles,
} from "./studio-styles";

export const advancedEffectEditorStyles = [
  studioBaseStyles,
  studioCardStyles,
  studioActionStyles,
  studioFormStyles,
  studioVisuallyHiddenStyles,
  css`
    :host {
      display: block;
    }

    p {
      margin-top: 0;
    }

    .layer-card {
      margin-bottom: var(--studio-section-gap);
    }

    .layer-toolbar {
      display: flex;
      align-items: flex-start;
      gap: var(--studio-compact-gap);
    }

    .layer-toolbar govee-reorderable-strip {
      min-width: 0;
      flex: 1;
    }

    .layer-actions {
      display: flex;
      flex: 0 0 auto;
      gap: var(--studio-compact-gap);
    }

    .card-heading,
    .patterns-heading {
      display: flex;
      align-items: center;
      gap: var(--studio-compact-gap);
    }

    .add-button {
      flex: 0 0 auto;
      padding: var(--studio-spacing-sm) var(--studio-spacing-xl);
      border: var(--studio-border-width) solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--studio-blue);
      background: var(--studio-card);
      font-weight: var(--studio-font-weight-semibold);
      border-style: dashed;
      cursor: pointer;
    }

    /* Stacks layer actions when they no longer fit beside the layer strip. */
    @media (max-width: 600px) {
      .layer-toolbar {
        align-items: stretch;
        flex-direction: column;
      }

      .layer-actions > button {
        flex: 1;
      }
    }

    .limit-note,
    .muted {
      color: var(--studio-muted);
      font-size: var(--studio-parameter-label-size);
      line-height: var(--studio-muted-line-height);
    }

    .limit-note {
      margin: var(--studio-spacing-lg) 0 0;
    }

    .empty-state .add-button {
      margin-top: var(--studio-spacing-lg);
    }

    .control-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: var(--studio-section-gap);
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .selection-controls {
      margin-top: var(--studio-spacing-sm);
      padding-top: var(--studio-section-gap);
      border-top: var(--studio-border-width) solid var(--studio-border);
    }

    .selection-controls > .parameter-label {
      display: block;
      margin-bottom: var(--studio-micro-gap);
    }

    .brightness-style {
      margin-top: var(--studio-spacing-2xl);
    }

    .patterns-heading {
      justify-content: space-between;
      margin-top: var(--studio-spacing-4xl);
    }

    .patterns-heading h4 {
      margin: 0;
      font-size: var(--studio-subheading-size);
      font-weight: var(--studio-font-weight-semibold);
    }

    .pattern-delete {
      min-height: var(--studio-compact-control-height);
      padding: var(--studio-spacing-xs) var(--studio-spacing-lg);
    }

    .pattern-strip {
      margin-top: var(--studio-spacing-md);
    }

    .brightness-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 var(--studio-section-gap);
    }

    .brightness-fields .field:first-child {
      grid-column: 1 / -1;
    }

    .card-heading {
      justify-content: space-between;
    }

    .card-heading h3 {
      margin-bottom: 0;
    }

    .movement-enter-exit {
      margin-top: var(--studio-spacing-lg);
    }

    .priority-control {
      margin-top: var(--studio-spacing-2xl);
    }

    /* Advanced cards and pattern fields become single-column with horizontal navigation. */
    @media (max-width: 760px) {
      .control-grid,
      .brightness-fields {
        grid-template-columns: 1fr;
      }

      .wide-card,
      .brightness-fields .field:first-child {
        grid-column: auto;
      }

      .add-button {
        width: 100%;
      }
    }

    /* Recovers phone-width card space without reducing control hit targets. */
    @media (max-width: 480px) {
      .card {
        padding: var(--studio-spacing-2xl);
      }

      .secondary {
        min-width: 0;
      }
    }
  `,
];
