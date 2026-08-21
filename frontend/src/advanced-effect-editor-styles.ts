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

    .layer-strip {
      --strip-label-min-width: var(--studio-compact-action-size);
    }

    .card-heading,
    .patterns-heading,
    .section-heading,
    .subsection-heading {
      display: flex;
      align-items: center;
      gap: var(--studio-compact-gap);
    }

    .section-heading {
      margin-bottom: var(--studio-section-title-gap);
    }

    .section-heading .section-title {
      margin: 0;
    }

    .subsection-heading h4 {
      margin: 0;
      font-size: var(--studio-subheading-size);
      font-weight: var(--studio-font-weight-semibold);
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

    .fill-pattern-controls {
      margin-top: var(--studio-section-gap);
      padding-top: var(--studio-section-gap);
      border-top: var(--studio-border-width) solid var(--studio-border);
    }

    .parameter-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--studio-parameter-gap) var(--studio-section-gap);
    }

    .parameter-grid > .field {
      margin-top: 0;
    }

    .patterns-heading {
      justify-content: space-between;
    }

    .patterns-section {
      display: grid;
      gap: var(--studio-parameter-gap);
    }

    .pattern-delete {
      min-height: var(--studio-compact-control-height);
      padding: var(--studio-spacing-xs) var(--studio-spacing-lg);
    }

    .card-heading {
      justify-content: space-between;
      margin-bottom: var(--studio-section-title-gap);
    }

    .card-heading .section-heading {
      margin-bottom: 0;
    }

    .check-control-with-help {
      display: flex;
      align-items: center;
      gap: var(--studio-compact-gap);
    }

    .check-control-with-help govee-checkbox-control {
      min-width: 0;
      flex: 1;
    }

    /* Advanced cards and parameter pairs become single-column on narrow screens. */
    @media (max-width: 760px) {
      .control-grid,
      .parameter-grid {
        grid-template-columns: 1fr;
      }

      .wide-card {
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
