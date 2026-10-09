// Shared looks of the small controls. They copy HA's ha-icon-button,
// ha-assist-chip and ha-button with HA CSS variables, because the internal
// ha-* elements are lazy-loaded and can change.

import type { TemplateResult } from "lit";
import { css, html } from "lit";

/** An inline MDI icon. The path comes from @mdi/js. */
export const renderIcon = (path: string, className = "icon"): TemplateResult =>
  html`<svg class=${className} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${path}></path>
  </svg>`;

export const iconStyles = css`
  .icon {
    width: var(--mdc-icon-size, 24px);
    height: var(--mdc-icon-size, 24px);
    fill: currentColor;
    flex: none;
    display: block;
  }
`;

export const iconButtonStyles = css`
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 48px;
    height: 48px;
    padding: 12px;
    margin: 0;
    border: none;
    border-radius: var(--ha-border-radius-circle, 50%);
    background: none;
    color: inherit;
    cursor: pointer;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .icon-button::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background-color: currentColor;
    opacity: 0;
    transition: opacity 15ms linear;
  }
  .icon-button:hover::before {
    opacity: 0.08;
  }
  .icon-button:focus-visible {
    outline: none;
  }
  .icon-button:focus-visible::before,
  .icon-button:active::before {
    opacity: 0.12;
  }
`;

// The assist chip of the header (Filters, Sort by) and the paused chip.
// 32 px high like ha-assist-chip; the ::after area makes the tap target 44 px.
export const chipStyles = css`
  .chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--ha-space-2, 8px);
    box-sizing: border-box;
    height: 32px;
    padding-inline: var(--ha-space-2, 8px) var(--ha-space-4, 16px);
    margin: 0;
    border: 1px solid var(--outline-color, var(--divider-color));
    border-radius: 10px;
    background-color: var(--card-background-color);
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 20px;
    letter-spacing: 0.1px;
    white-space: nowrap;
    cursor: pointer;
    flex: none;
    -webkit-tap-highlight-color: transparent;
    --mdc-icon-size: 18px;
  }
  .chip.no-icon {
    padding-inline-start: var(--ha-space-4, 16px);
  }
  .chip.trailing {
    padding-inline-end: var(--ha-space-2, 8px);
  }
  .chip::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--primary-text-color);
    opacity: 0;
    pointer-events: none;
  }
  .chip::after {
    content: "";
    position: absolute;
    inset: -6px 0;
  }
  .chip:hover::before {
    opacity: 0.08;
  }
  .chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .chip.active {
    background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    border-color: transparent;
  }
  .chip .icon {
    color: var(--primary-color);
  }
`;

// ha-button: "plain" (text) and "filled" (accent) appearances.
export const buttonStyles = css`
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ha-space-2, 8px);
    box-sizing: border-box;
    min-height: 44px;
    min-width: 64px;
    padding: 0 var(--ha-space-4, 16px);
    margin: 0;
    border: none;
    border-radius: var(--ha-border-radius-pill, 9999px);
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 20px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    background: none;
    color: var(--primary-color);
    -webkit-tap-highlight-color: transparent;
  }
  .button::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
  }
  .button:hover::before {
    opacity: 0.08;
  }
  .button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .button.filled {
    background-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .button:disabled {
    cursor: default;
    color: var(--disabled-text-color, var(--secondary-text-color));
    background-color: transparent;
  }
  .button.filled:disabled {
    background-color: var(
      --ha-color-fill-disabled-quiet-resting,
      rgba(0, 0, 0, 0.12)
    );
  }
  .button:disabled::before {
    opacity: 0;
  }
`;

// ha-alert: a tinted box with an icon.
export const alertStyles = css`
  .alert {
    display: flex;
    gap: var(--ha-space-3, 12px);
    align-items: flex-start;
    padding: var(--ha-space-2, 8px) var(--ha-space-3, 12px);
    border-radius: var(--ha-border-radius-sm, 4px);
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    line-height: var(--ha-line-height-normal, 1.6);
    position: relative;
    overflow: hidden;
  }
  .alert::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--alert-color);
    opacity: 0.12;
    pointer-events: none;
  }
  .alert .icon {
    color: var(--alert-color);
    margin-top: 2px;
  }
  .alert.warning {
    --alert-color: var(--warning-color, #ffa600);
  }
  .alert.error {
    --alert-color: var(--error-color, #db4437);
  }
`;
