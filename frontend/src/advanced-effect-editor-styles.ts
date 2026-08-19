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
      gap: 8px;
    }

    .layer-toolbar govee-reorderable-strip {
      min-width: 0;
      flex: 1;
    }

    .layer-actions {
      display: flex;
      flex: 0 0 auto;
      gap: 8px;
    }

    .card-heading,
    .patterns-heading {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .add-button {
      flex: 0 0 auto;
      padding: 8px 14px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-control-radius);
      color: var(--studio-blue);
      background: var(--studio-card);
      font-weight: 600;
      border-style: dashed;
      cursor: pointer;
    }

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
      font-size: 13px;
      line-height: 1.45;
    }

    .limit-note {
      margin: 12px 0 0;
    }

    .empty-state .add-button {
      margin-top: 12px;
    }

    .control-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: 18px;
    }

    .wide-card {
      grid-column: 1 / -1;
    }

    .selection-controls {
      margin-top: 8px;
      padding-top: 18px;
      border-top: 1px solid var(--studio-border);
    }

    .selection-controls > .parameter-label {
      display: block;
      margin-bottom: 4px;
    }

    .brightness-style {
      margin-top: 16px;
    }

    .patterns-heading {
      justify-content: space-between;
      margin-top: 20px;
    }

    .patterns-heading h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .pattern-delete {
      min-height: 36px;
      padding: 6px 12px;
    }

    .pattern-strip {
      margin-top: 10px;
    }

    .brightness-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 18px;
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
      margin-top: 12px;
    }

    .priority-control {
      margin-top: 16px;
    }

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

    @media (max-width: 480px) {
      .card {
        padding: 16px;
      }

      .secondary {
        min-width: 0;
      }
    }
  `,
];
