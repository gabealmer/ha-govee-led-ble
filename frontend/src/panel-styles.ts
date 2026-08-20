import { css } from "lit";

import {
  studioActionStyles,
  studioBaseStyles,
  studioCardStyles,
  studioEditorStyles,
  studioFormStyles,
  studioSelectorStyles,
  studioTokenStyles,
  studioVisuallyHiddenStyles,
  studioWorkspaceStyles,
} from "./studio-styles";

export const effectStudioPanelStyles = [
  studioTokenStyles,
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
      --studio-device-selector-max-width: 340px;
      --studio-device-selector-min-width: 180px;
      --studio-dialog-max-width: 440px;
      --studio-video-list-max-height: 150px;
      --studio-live-track-width: 32px;
      --studio-live-track-padding: 2px;
      --studio-live-indicator-size: 18px;
      --studio-live-thumb-size: var(--studio-spacing-xl);
      --studio-live-thumb-travel: 14px;
      --studio-live-status-line-height: 16px;
      --studio-live-spin-duration: 700ms;
      --studio-live-reduced-motion-duration: 1400ms;
      --studio-backdrop-blur: 10px;
      --studio-dialog-shadow-offset: 18px;
      --studio-dialog-shadow-blur: 52px;
      --studio-primary-nav-min-item-width: 90px;
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
      max-width: var(--studio-empty-state-max-width);
      margin: 0 auto;
      padding: var(--studio-message-block-padding)
        var(--studio-message-inline-padding);
    }

    .fatal h1 {
      margin-top: 0;
    }

    .fatal a {
      color: var(--studio-blue);
      font-weight: var(--studio-font-weight-semibold);
    }

    h1,
    h2,
    h3,
    p {
      margin-top: 0;
    }

    h1 {
      margin-bottom: 0;
      font-size: var(--studio-page-heading-size);
      font-weight: var(--studio-font-weight-semibold);
    }

    h2 {
      margin-bottom: 0;
      font-size: var(--studio-heading-size);
      font-weight: var(--studio-font-weight-semibold);
    }

    h3 {
      margin-bottom: var(--studio-section-gap);
      font-size: var(--studio-section-title-size);
    }

    select {
      min-height: var(--studio-control-height);
      padding: var(--studio-option-padding);
      border: var(--studio-border-width) solid var(--studio-border);
      border-radius: var(--studio-button-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
    }

    .home-assistant-header {
      display: flex;
      align-items: center;
      min-height: var(--studio-app-header-height);
      padding: 0 var(--studio-chrome-gutter);
      flex: 0 0 var(--studio-app-header-height);
      box-sizing: border-box;
      border-bottom: var(--app-header-border-bottom, none);
      color: var(--app-header-text-color, #fff);
      background: var(--app-header-background-color, var(--primary-color));
      font-size: var(--ha-font-size-l, 18px);
      font-weight: var(--ha-font-weight-normal, 400);
    }

    .home-assistant-menu {
      display: inline-grid;
      width: var(--studio-app-header-height);
      height: var(--studio-app-header-height);
      margin: 0 var(--studio-chrome-gutter) 0
        calc(0px - var(--studio-control-gap));
      padding: var(--studio-control-gap);
      border: 0;
      place-items: center;
      color: inherit;
      background: transparent;
      cursor: pointer;
    }

    .home-assistant-menu svg {
      width: var(--studio-icon-size);
      height: var(--studio-icon-size);
      fill: currentColor;
    }

    .home-assistant-menu:focus-visible {
      border-radius: var(--studio-round-radius);
      outline: var(--studio-strong-border-width) solid currentColor;
      outline-offset: calc(0px - var(--studio-micro-gap));
    }

    .studio-toolbar {
      position: sticky;
      z-index: var(--studio-z-toolbar);
      top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--studio-action-gap);
      height: var(--studio-app-header-height);
      min-height: var(--studio-app-header-height);
      padding: var(--studio-tight-gap) var(--studio-section-gap);
      box-sizing: border-box;
      border-bottom: var(--studio-border-width) solid var(--studio-border);
      background: color-mix(
        in srgb,
        var(--primary-background-color, #fff) 94%,
        transparent
      );
      backdrop-filter: blur(var(--studio-backdrop-blur));
    }

    .device-selector {
      display: flex;
      align-items: center;
      gap: var(--studio-control-gap);
      min-width: 0;
      color: var(--studio-muted);
      font-size: var(--studio-parameter-label-size);
      font-weight: var(--studio-font-weight-semibold);
    }

    .device-selector select {
      width: min(var(--studio-device-selector-max-width), 50vw);
      min-width: var(--studio-device-selector-min-width);
    }

    .live-apply-control {
      display: flex;
      align-items: center;
      gap: var(--studio-action-gap);
    }

    .studio-toolbar-controls {
      display: flex;
      align-items: center;
      gap: var(--studio-micro-gap);
      margin-inline-start: auto;
    }

    .light-control-button {
      display: inline-grid;
      width: var(--studio-compact-control-height);
      height: var(--studio-compact-control-height);
      min-height: var(--studio-compact-control-height);
      padding: var(--studio-compact-gap);
      box-sizing: border-box;
      border: 0;
      border-radius: var(--studio-round-radius);
      place-items: center;
      color: var(--secondary-text-color);
      background: transparent;
      cursor: pointer;
      text-decoration: none;
    }

    .light-control-button:hover {
      color: var(--primary-text-color);
      background: color-mix(
        in srgb,
        var(--primary-text-color) 8%,
        transparent
      );
    }

    .light-control-button:focus-visible {
      color: var(--primary-text-color);
      outline: var(--studio-strong-border-width) solid var(--studio-blue);
      outline-offset: var(--studio-border-width);
    }

    .light-control-button svg {
      width: var(--studio-icon-size);
      height: var(--studio-icon-size);
      fill: currentColor;
    }

    .live-apply-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--studio-compact-gap);
      min-height: var(--studio-compact-control-height);
      padding: var(--studio-micro-gap) var(--studio-compact-gap);
      border: 0;
      color: var(--primary-text-color);
      background: transparent;
      font: inherit;
      font-weight: var(--studio-font-weight-semibold);
      cursor: pointer;
    }

    .live-apply-track {
      display: inline-flex;
      align-items: center;
      width: var(--studio-live-track-width);
      height: var(--studio-live-indicator-size);
      padding: var(--studio-live-track-padding);
      border-radius: var(--studio-pill-radius);
      background: var(--disabled-color, #9e9e9e);
      transition: background var(--studio-transition-duration) ease;
    }

    .live-apply-thumb {
      width: var(--studio-live-thumb-size);
      height: var(--studio-live-thumb-size);
      border-radius: var(--studio-round-radius);
      background: #fff;
      box-shadow: 0 var(--studio-border-width)
        var(--studio-strong-border-width) rgb(0 0 0 / 30%);
      transition: transform var(--studio-transition-duration) ease;
    }

    .live-apply-toggle[aria-checked="true"] .live-apply-track {
      background: var(--studio-blue);
    }

    .live-apply-toggle[aria-checked="true"] .live-apply-thumb {
      transform: translateX(var(--studio-live-thumb-travel));
    }

    .live-apply-status {
      position: relative;
      display: grid;
      width: var(--studio-live-indicator-size);
      height: var(--studio-live-indicator-size);
      flex: 0 0 var(--studio-live-indicator-size);
      place-items: center;
      border: var(--studio-strong-border-width) solid transparent;
      border-radius: var(--studio-round-radius);
    }

    .live-apply-status.pending {
      border-color: color-mix(
        in srgb,
        var(--studio-blue) 25%,
        transparent
      );
      border-top-color: var(--studio-blue);
      animation: live-apply-spin var(--studio-live-spin-duration) linear
        infinite;
    }

    .live-apply-status.warning {
      border-color: var(--error-color, #db4437);
    }

    .live-apply-status.warning::after {
      position: absolute;
      inset: calc(0px - var(--studio-border-width)) 0 0;
      color: var(--error-color, #db4437);
      content: "!";
      font-size: var(--studio-caption-size);
      font-weight: var(--studio-font-weight-alert);
      line-height: var(--studio-live-status-line-height);
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
      grid-template-columns:
        var(--studio-navigation-width)
        var(--studio-list-width)
        minmax(0, 1fr);
    }

    .empty-state {
      max-width: var(--studio-empty-state-max-width);
      margin: 0 auto;
      padding: var(--studio-empty-state-block-padding)
        var(--studio-message-inline-padding);
    }

    .empty-state a {
      color: var(--studio-blue);
      font-weight: var(--studio-font-weight-semibold);
    }

    .studio.scenes-mode,
    .studio.custom-mode {
      grid-template-columns:
        var(--studio-navigation-width)
        var(--studio-navigation-width)
        var(--studio-list-width)
        minmax(0, 1fr);
    }

    .primary-nav {
      display: flex;
      min-height: 0;
      overflow: auto;
      flex-direction: column;
      gap: var(--studio-tight-gap);
      padding: var(--studio-sidebar-padding);
      border-inline-end: var(--studio-border-width) solid var(--studio-border);
      background: var(--secondary-background-color, #f5f6f8);
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--studio-action-gap);
    }

    .actions > button {
      min-height: var(--studio-control-height);
    }

    .dialog-backdrop {
      position: fixed;
      z-index: var(--studio-z-modal);
      inset: 0;
      display: grid;
      place-items: center;
      overflow: auto;
      overscroll-behavior: contain;
      padding: var(--studio-dialog-padding);
      background: rgb(0 0 0 / 45%);
    }

    .dialog-card {
      width: min(var(--studio-dialog-max-width), 100%);
      max-height: calc(100vh - var(--studio-dialog-viewport-gutter));
      overflow: auto;
      padding: var(--studio-dialog-padding);
      border: var(--studio-border-width) solid var(--studio-border);
      border-radius: var(--studio-dialog-radius);
      color: var(--primary-text-color);
      background: var(--studio-card);
      box-shadow: 0 var(--studio-dialog-shadow-offset)
        var(--studio-dialog-shadow-blur) rgb(0 0 0 / 28%);
    }

    .dialog-card p {
      margin-top: var(--studio-spacing-2xl);
      margin-bottom: 0;
      line-height: var(--studio-body-line-height);
    }

    .save-dialog .field {
      margin-top: var(--studio-spacing-4xl);
    }

    .dialog-error {
      color: var(--error-color, #db4437);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--studio-action-gap);
      margin-top: var(--studio-dialog-padding);
    }

    .controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--studio-section-gap);
      margin-top: var(--studio-section-gap);
    }

    .single-effect-settings {
      margin-bottom: var(--studio-section-gap);
    }

    .single-effect-settings .field {
      margin-top: 0;
    }

    .opaque-content h3 {
      margin: 0 0 var(--studio-compact-gap);
    }

    .opaque-content h3:not(:first-child) {
      margin-top: var(--studio-spacing-4xl);
    }

    .opaque-content p {
      margin: 0;
    }

    .opaque-content pre {
      max-width: 100%;
      margin: 0;
      padding: var(--studio-spacing-2xl);
      overflow: auto;
      border-radius: var(--studio-control-radius);
      background: var(--secondary-background-color, #f1f1f1);
      color: var(--primary-text-color);
      font: var(--studio-caption-size) / var(--studio-body-line-height)
        ui-monospace, SFMono-Regular, Consolas, monospace;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .paint-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--studio-control-gap);
      margin-top: var(--studio-field-margin);
    }

    .paint-off {
      display: inline-flex;
      align-items: center;
      gap: var(--studio-compact-gap);
      min-height: var(--studio-compact-control-height);
      padding: var(--studio-tight-gap) var(--studio-control-gap);
      border: var(--studio-border-width) solid var(--studio-border);
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
      box-shadow: inset 0 0 0 var(--studio-border-width)
        var(--studio-blue);
    }

    .paint-off-swatch {
      width: var(--studio-small-swatch-size);
      height: var(--studio-small-swatch-size);
      border: var(--studio-border-width) solid var(--studio-border);
      border-radius: var(--studio-round-radius);
      background: #000;
      box-shadow: inset 0 0 0 var(--studio-border-width)
        rgb(255 255 255 / 14%);
    }

    .action-error,
    .read-only-copy {
      margin: 0 0 var(--studio-section-gap);
      line-height: var(--studio-muted-line-height);
    }

    .action-error {
      color: var(--error-color, #db4437);
    }

    .read-only-copy {
      color: var(--studio-muted);
    }

    /* Accommodates Home Assistant's docked sidebar on common 1024px and 1280px desktops. */
    @media (min-width: 901px) and (max-width: 1320px) {
      .studio.scenes-mode,
      .studio.custom-mode {
        flex-basis: 0;
        grid-template-rows: auto auto minmax(0, 1fr);
        grid-template-columns:
          var(--studio-stacked-navigation-width)
          minmax(0, 1fr);
      }

      .scenes-mode .primary-nav,
      .custom-mode .primary-nav {
        grid-row: 1 / span 3;
      }

      .scenes-mode > .editor,
      .custom-mode > .editor {
        grid-row: 3;
        grid-column: 2;
      }

      .studio.video-mode {
        flex-basis: 0;
        grid-template-rows: auto minmax(0, 1fr);
        grid-template-columns:
          var(--studio-stacked-navigation-width)
          minmax(0, 1fr);
      }

      .video-mode .primary-nav {
        grid-row: 1 / span 2;
      }

      .video-mode .library {
        grid-row: 1;
        grid-column: 2;
        max-height: var(--studio-video-list-max-height);
        border-inline-end: 0;
        border-bottom: var(--studio-border-width) solid var(--studio-border);
      }

      .video-mode .editor {
        grid-row: 2;
        grid-column: 2;
      }
    }

    /* Switches from bounded panel grids to document-flow layout on narrow screens. */
    @media (max-width: 900px) {
      :host {
        height: auto;
        min-height: 100%;
        overflow: visible;
      }

      .studio {
        grid-template-columns:
          var(--studio-stacked-navigation-width)
          minmax(0, 1fr);
        min-height: 0;
        overflow: visible;
        flex: none;
      }

      .studio.scenes-mode,
      .studio.custom-mode {
        grid-template-columns:
          var(--studio-stacked-navigation-width)
          minmax(0, 1fr);
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

    /* Moves primary navigation into a horizontal row on phone and small tablet widths. */
    @media (max-width: 760px) {
      .studio {
        display: block;
      }

      .primary-nav {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(var(--studio-primary-nav-min-item-width), 1fr)
        );
        padding: var(--studio-control-gap) var(--studio-chrome-gutter);
        border-inline-end: 0;
        border-bottom: var(--studio-border-width) solid var(--studio-border);
      }

      .selector {
        text-align: center;
      }

      .library {
        padding-block: var(--studio-section-gap);
      }

      .effect-categories .selector {
        text-align: start;
      }

      .library .selector {
        text-align: start;
      }
    }

    /* Stacks the toolbar only when its controls no longer fit on one phone row. */
    @media (max-width: 480px) {
      .studio-toolbar {
        height: auto;
        align-items: stretch;
        flex-direction: column;
        padding-block: var(--studio-control-gap);
      }

      .device-selector {
        align-items: stretch;
        flex-direction: column;
        gap: var(--studio-tight-gap);
      }

      .device-selector select {
        width: 100%;
      }

      .studio-toolbar-controls {
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
        animation-duration: var(--studio-live-reduced-motion-duration);
      }

      .live-apply-track,
      .live-apply-thumb {
        transition: none;
      }
    }
  `,
];
