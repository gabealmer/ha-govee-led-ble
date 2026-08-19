import { css } from "lit";

import {
  studioActionStyles,
  studioBaseStyles,
  studioCardStyles,
  studioEditorStyles,
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
  studioVisuallyHiddenStyles,
  studioWorkspaceStyles,
  css`
    :host {
      display: flex;
      height: calc(100dvh - env(safe-area-inset-bottom, 0px));
      min-height: 0;
      overflow: hidden;
      flex-direction: column;
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

    select {
      min-height: 42px;
      padding: 8px 12px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-button-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .home-assistant-header {
      display: flex;
      align-items: center;
      min-height: 40px;
      padding: 0 16px;
      flex: 0 0 40px;
      box-sizing: border-box;
      border-bottom: var(--app-header-border-bottom, none);
      color: var(--app-header-text-color, #fff);
      background: var(--app-header-background-color, var(--primary-color));
      font-size: var(--ha-font-size-l, 18px);
      font-weight: var(--ha-font-weight-normal, 400);
    }

    .home-assistant-menu {
      display: inline-grid;
      width: 40px;
      height: 40px;
      margin: 0 16px 0 -10px;
      padding: 10px;
      border: 0;
      place-items: center;
      color: inherit;
      background: transparent;
      cursor: pointer;
    }

    .home-assistant-menu svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .home-assistant-menu:focus-visible {
      border-radius: 50%;
      outline: 2px solid currentColor;
      outline-offset: -4px;
    }

    .studio-toolbar {
      position: sticky;
      z-index: 4;
      top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .device-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      color: var(--studio-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .device-selector select {
      width: min(340px, 50vw);
      min-width: 180px;
    }

    .live-apply-control {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-inline-start: auto;
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
      display: grid;
      width: 18px;
      height: 18px;
      flex: 0 0 18px;
      place-items: center;
      border: 2px solid transparent;
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
      min-height: 0;
      overflow: hidden;
      flex: 1 1 auto;
      grid-template-columns: 190px 230px minmax(0, 1fr);
    }

    .empty-state {
      max-width: 680px;
      margin: 0 auto;
      padding: 56px 24px;
    }

    .empty-state a {
      color: var(--studio-blue);
      font-weight: 600;
    }

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns: 190px 190px 230px minmax(0, 1fr);
    }

    .primary-nav {
      display: flex;
      min-height: 0;
      overflow: auto;
      flex-direction: column;
      gap: 6px;
      padding: 22px 16px;
      border-inline-end: 1px solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
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

    .paint-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 14px;
    }

    .paint-off {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
      padding: 6px 10px;
      border: 1px solid var(--studio-border);
      border-radius: var(--studio-button-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
      cursor: pointer;
    }

    .paint-off.active {
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 58%,
        var(--studio-border)
      );
      box-shadow: inset 0 0 0 1px var(--studio-blue);
    }

    .paint-off-swatch {
      width: 16px;
      height: 16px;
      border: 1px solid var(--studio-border);
      border-radius: 50%;
      background: #000;
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 14%);
    }

    .action-error,
    .read-only-copy {
      margin: 0 0 var(--studio-section-gap);
      line-height: 1.45;
    }

    .action-error {
      color: var(--error-color, #db4437);
    }

    .read-only-copy {
      color: var(--studio-muted);
    }

    @media (max-width: 900px) {
      :host {
        height: auto;
        min-height: 100%;
        overflow: visible;
      }

      .studio {
        grid-template-columns: 170px minmax(0, 1fr);
        min-height: 0;
        overflow: visible;
        flex: none;
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
      .studio-toolbar {
        align-items: stretch;
        flex-direction: column;
        padding-block: 10px;
      }

      .device-selector {
        align-items: stretch;
        flex-direction: column;
        gap: 5px;
      }

      .device-selector select {
        width: 100%;
      }

      .live-apply-control {
        align-self: flex-end;
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
