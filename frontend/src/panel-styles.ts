import { css } from "lit";

import {
  studioActionStyles,
  studioBaseStyles,
  studioCardStyles,
  studioEditorStyles,
  studioFeedbackStyles,
  studioFormStyles,
  studioSelectorStyles,
  studioVisuallyHiddenStyles,
  studioWorkspaceStyles,
} from "./studio-styles";

export const effectStudioPanelStyles = [
  studioBaseStyles,
  studioCardStyles,
  studioActionStyles,
  studioSelectorStyles,
  studioFormStyles,
  studioEditorStyles,
  studioFeedbackStyles,
  studioVisuallyHiddenStyles,
  studioWorkspaceStyles,
  css`
    :host {
      display: block;
      min-height: 100%;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }

    .centred,
    .fatal {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .fatal h1 {
      margin-top: 0;
    }

    .fatal a {
      color: var(--studio-blue);
      font-weight: 600;
    }

    h1,
    h2,
    h3,
    p {
      margin-top: 0;
    }

    h1 {
      margin-bottom: 0;
      font-size: 25px;
      font-weight: 600;
    }

    h2 {
      margin-bottom: 0;
      font-size: 20px;
      font-weight: 600;
    }

    h3 {
      margin-bottom: 18px;
      font-size: 16px;
    }

    .device-picker {
      margin-top: auto;
    }

    .device-picker select {
      width: 100%;
    }

    select {
      min-height: 42px;
      padding: 8px 12px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-button-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .notice {
      padding: 11px 28px;
      border-bottom: 1px solid
        color-mix(in srgb, var(--studio-blue) 35%, var(--studio-border));
      color: var(--primary-text-color);
      background: var(--studio-blue-soft);
    }

    .live-apply-toolbar {
      position: sticky;
      z-index: 4;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 9px;
      min-height: 48px;
      padding: 6px 18px;
      border-bottom: 1px solid var(--studio-border);
      background: color-mix(
        in srgb,
        var(--primary-background-color, #fff) 94%,
        transparent
      );
      backdrop-filter: blur(10px);
    }

    .live-apply-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
      padding: 4px 8px;
      border: 0;
      color: var(--primary-text-color);
      background: transparent;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .live-apply-track {
      display: inline-flex;
      align-items: center;
      width: 32px;
      height: 18px;
      padding: 2px;
      border-radius: 999px;
      background: var(--disabled-color, #9e9e9e);
      transition: background 120ms ease;
    }

    .live-apply-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 30%);
      transition: transform 120ms ease;
    }

    .live-apply-toggle[aria-checked="true"] .live-apply-track {
      background: var(--studio-blue);
    }

    .live-apply-toggle[aria-checked="true"] .live-apply-thumb {
      transform: translateX(14px);
    }

    .live-apply-status {
      position: relative;
      width: 18px;
      height: 18px;
      flex: 0 0 18px;
      border: 2px solid var(--disabled-color, #9e9e9e);
      border-radius: 50%;
    }

    .live-apply-status.pending {
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 25%,
        transparent
      );
      border-top-color: var(--studio-blue);
      animation: live-apply-spin 700ms linear infinite;
    }

    .live-apply-status.current {
      border-color: var(--success-color, #2e7d32);
    }

    .live-apply-status.current::after {
      position: absolute;
      width: 7px;
      height: 4px;
      border-bottom: 2px solid var(--success-color, #2e7d32);
      border-left: 2px solid var(--success-color, #2e7d32);
      content: "";
      transform: translate(4px, 4px) rotate(-45deg);
    }

    .live-apply-status.warning {
      border-color: var(--error-color, #db4437);
    }

    .live-apply-status.warning::after {
      position: absolute;
      inset: -1px 0 0;
      color: var(--error-color, #db4437);
      content: "!";
      font-size: 12px;
      font-weight: 800;
      line-height: 16px;
      text-align: center;
    }

    @keyframes live-apply-spin {
      to {
        transform: rotate(360deg);
      }
    }

    .studio {
      display: grid;
      grid-template-columns: 190px 230px minmax(0, 1fr);
      min-height: 100vh;
    }

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .library .new-effect-action {
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

    .library .new-effect-icon {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-inline-end: 8px;
      background:
        linear-gradient(var(--studio-blue), var(--studio-blue)) center / 12px
          1.5px no-repeat,
        linear-gradient(var(--studio-blue), var(--studio-blue)) center / 1.5px
          12px no-repeat;
    }

    .library .new-effect-action:hover {
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

    .back-button {
      min-height: 44px;
      margin-bottom: 14px;
      padding: 8px 0;
      border: 0;
      color: var(--studio-blue);
      background: transparent;
      font-weight: 650;
      cursor: pointer;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
    }

    .actions > button {
      min-height: 44px;
    }

    .dialog-backdrop {
      position: fixed;
      z-index: 1000;
      inset: 0;
      display: grid;
      place-items: center;
      overflow: auto;
      overscroll-behavior: contain;
      padding: 24px;
      background: rgb(0 0 0 / 45%);
    }

    .dialog-card {
      width: min(440px, 100%);
      max-height: calc(100vh - 48px);
      overflow: auto;
      padding: 24px;
      border: 1px solid var(--studio-border);
      border-radius: 12px;
      color: var(--primary-text-color);
      background: var(--studio-card);
      box-shadow: 0 18px 52px rgb(0 0 0 / 28%);
    }

    .dialog-card p {
      margin-top: 16px;
      margin-bottom: 0;
      line-height: 1.5;
    }

    .save-dialog .field {
      margin-top: 20px;
    }

    .dialog-error {
      color: var(--error-color, #db4437);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 24px;
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .single-effect-settings {
      margin-bottom: 18px;
    }

    .single-effect-settings .field {
      margin-top: 0;
    }

    .opaque-content h3 {
      margin: 0 0 8px;
    }

    .opaque-content h3:not(:first-child) {
      margin-top: 20px;
    }

    .opaque-content p {
      margin: 0;
    }

    .opaque-content pre {
      max-width: 100%;
      margin: 0;
      padding: 16px;
      overflow: auto;
      border-radius: 8px;
      background: var(--secondary-background-color, #f1f1f1);
      color: var(--primary-text-color);
      font: 12px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .background-colour {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    @media (max-width: 900px) {
      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .studio.scenes-mode,
      .studio.custom-mode {
        grid-template-columns: 170px minmax(0, 1fr);
      }

      .custom-mode .effect-categories,
      .custom-mode .library {
        grid-column: 2;
      }

      .video-mode .library {
        grid-column: 2;
      }

      .editor {
        grid-column: 2;
      }

      .controls {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        padding: 10px 16px;
        border-inline-end: 0;
        border-bottom: 1px solid var(--studio-border);
      }

      .device-picker {
        grid-column: 1 / -1;
        margin-top: 4px;
        padding-top: 10px;
        text-align: start;
      }

      .selector {
        text-align: center;
      }

      .library {
        padding-block: 18px;
      }

      .effect-categories .selector {
        text-align: start;
      }

      .library .selector {
        text-align: start;
      }
    }

    @media (max-width: 480px) {
      .notice {
        padding-inline: 16px;
      }

      .button-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .button-row button:first-child {
        grid-column: 1 / -1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        scroll-behavior: auto !important;
      }

      .live-apply-status.pending {
        animation-duration: 1400ms;
      }

      .live-apply-track,
      .live-apply-thumb {
        transition: none;
      }
    }
  `,
];
