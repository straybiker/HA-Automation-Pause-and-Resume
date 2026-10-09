// A dropdown menu like ha-dropdown. It uses the Popover API, so the menu sits
// in the top layer and no card or view can clip it.

import type { PropertyValues, TemplateResult } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { property, query } from "lit/decorators.js";
import { mdiCheck } from "@mdi/js";
import { define, fireEvent } from "../define";
import { iconStyles, renderIcon } from "../styles";

export interface MenuItem {
  value: string;
  label: string;
  icon?: string;
  /** Second, smaller line, for example why the entry is dimmed. */
  secondary?: string;
  /** Looks inactive but can still be chosen, to show the reason. */
  dimmed?: boolean;
  disabled?: boolean;
  /** Shows a check mark, for single-choice menus. */
  checked?: boolean;
  /** Draws a divider above this entry. */
  divider?: boolean;
}

export interface MenuSelectDetail {
  value: string;
}

const GAP = 8;

export class AutomationPauseMenu extends LitElement {
  @property({ attribute: false }) public items: MenuItem[] = [];

  @property({ attribute: false }) public anchor?: HTMLElement;

  @property({ type: Boolean }) public open = false;

  /** "end" aligns the right edge of the menu with the anchor (LTR). */
  @property() public align: "start" | "end" = "end";

  @property() public label = "";

  @query(".menu") private _menu!: HTMLElement;

  private _closedAt = 0;

  /** True right after a light dismiss, so the anchor click does not reopen it. */
  public justClosed(): boolean {
    return Date.now() - this._closedAt < 300;
  }

  protected render(): TemplateResult {
    return html`
      <div
        class="menu"
        popover="auto"
        role="menu"
        aria-label=${this.label}
        @toggle=${this._handleToggle}
        @keydown=${this._handleKeyDown}
      >
        ${this.items.map(
          (item) => html`
            ${
              item.divider
                ? html`<div class="divider" role="separator"></div>`
                : nothing
            }
            <button
              class="item ${item.dimmed ? "dimmed" : ""}"
              role=${item.checked === undefined ? "menuitem" : "menuitemradio"}
              aria-checked=${
                item.checked === undefined
                  ? nothing
                  : item.checked
                    ? "true"
                    : "false"
              }
              ?disabled=${item.disabled}
              .value=${item.value}
              @click=${this._handleClick}
            >
              ${
                item.icon
                  ? renderIcon(item.icon)
                  : item.checked !== undefined
                    ? html`<span class="icon-space"></span>`
                    : nothing
              }
              <span class="text">
                <span class="label">${item.label}</span>
                ${
                  item.secondary
                    ? html`<span class="secondary">${item.secondary}</span>`
                    : nothing
                }
              </span>
              ${item.checked ? renderIcon(mdiCheck, "icon check") : nothing}
            </button>
          `
        )}
      </div>
    `;
  }

  protected updated(changed: PropertyValues): void {
    if (!changed.has("open")) {
      return;
    }
    const menu = this._menu;
    if (this.open && !menu.matches(":popover-open")) {
      menu.showPopover();
      this._position();
      const first = menu.querySelector<HTMLButtonElement>(
        "button:not([disabled])"
      );
      first?.focus();
    } else if (!this.open && menu.matches(":popover-open")) {
      menu.hidePopover();
    }
  }

  private _position(): void {
    const anchor = this.anchor;
    const menu = this._menu;
    if (!anchor) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const rtl = getComputedStyle(this).direction === "rtl";
    const alignRight = (this.align === "end") !== rtl;

    let left = alignRight ? rect.right - width : rect.left;
    left = Math.max(GAP, Math.min(left, viewWidth - width - GAP));

    let top = rect.bottom;
    if (top + height > viewHeight - GAP) {
      const above = rect.top - height;
      top = above >= GAP ? above : Math.max(GAP, viewHeight - height - GAP);
    }
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  private _handleToggle(ev: Event): void {
    if ((ev as ToggleEvent).newState === "closed") {
      this._closedAt = Date.now();
      this.open = false;
      fireEvent(this, "menu-closed", undefined);
    }
  }

  private _handleClick(ev: Event): void {
    const value = (ev.currentTarget as HTMLButtonElement).value;
    this._menu.hidePopover();
    this.anchor?.focus();
    fireEvent<MenuSelectDetail>(this, "menu-select", { value });
  }

  private _handleKeyDown(ev: KeyboardEvent): void {
    if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") {
      if (ev.key === "Escape") {
        this.anchor?.focus();
      }
      return;
    }
    ev.preventDefault();
    const buttons = Array.from(
      this._menu.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
    );
    const index = buttons.indexOf(
      this.shadowRoot!.activeElement as HTMLButtonElement
    );
    const step = ev.key === "ArrowDown" ? 1 : -1;
    const next = buttons[(index + step + buttons.length) % buttons.length];
    next?.focus();
  }

  static styles = [
    iconStyles,
    css`
      .menu {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: var(--ha-space-1, 4px) 0;
        min-width: 200px;
        max-width: min(320px, calc(100vw - 16px));
        max-height: calc(100vh - 16px);
        overflow-y: auto;
        box-sizing: border-box;
        border: 1px solid var(--ha-color-border-neutral-quiet, transparent);
        border-radius: var(--ha-border-radius-lg, 12px);
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: var(
          --ha-box-shadow-l,
          0 8px 12px 6px rgba(0, 0, 0, 0.15),
          0 4px 4px rgba(0, 0, 0, 0.3)
        );
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
      }
      .item {
        display: flex;
        align-items: center;
        gap: var(--ha-space-4, 16px);
        width: 100%;
        min-height: 48px;
        box-sizing: border-box;
        padding: var(--ha-space-2, 8px) var(--ha-space-4, 16px);
        margin: 0;
        border: none;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        font-size: var(--ha-font-size-m, 14px);
        line-height: var(--ha-line-height-condensed, 1.2);
        text-align: start;
        cursor: pointer;
        position: relative;
      }
      .item::before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: var(--primary-text-color);
        opacity: 0;
        pointer-events: none;
      }
      .item:hover::before {
        opacity: 0.08;
      }
      .item:focus-visible {
        outline: none;
      }
      .item:focus-visible::before {
        opacity: 0.12;
      }
      .item .icon {
        color: var(--secondary-text-color);
      }
      .item .check {
        color: var(--primary-color);
        margin-inline-start: auto;
      }
      .icon-space {
        width: 24px;
        flex: none;
      }
      .item.dimmed .label,
      .item.dimmed .icon,
      .item:disabled .label,
      .item:disabled .icon {
        opacity: 0.5;
      }
      .item:disabled {
        cursor: default;
      }
      .item:disabled::before {
        opacity: 0;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .secondary {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        margin-top: 2px;
      }
      .divider {
        height: 1px;
        margin: var(--ha-space-1, 4px) 0;
        background-color: var(--divider-color);
      }
    `,
  ];
}

define("automation-pause-menu", AutomationPauseMenu);

declare global {
  interface HTMLElementTagNameMap {
    "automation-pause-menu": AutomationPauseMenu;
  }
}
