// One row of the list. It copies a row of ha-data-table in the built-in
// automation list: icon, name, area, last triggered, enabled switch, overflow
// menu. A paused automation shows a countdown chip instead of the switch.

import type { TemplateResult } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { property, query, state } from "lit/decorators.js";
import {
  mdiCloseThick,
  mdiCog,
  mdiDotsVertical,
  mdiExclamationThick,
  mdiInformationOutline,
  mdiPause,
  mdiPencil,
  mdiPlay,
  mdiRobot,
  mdiTimerPauseOutline,
  mdiTimerPlayOutline,
  mdiTimerPlusOutline,
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
  mdiTransitConnection,
} from "@mdi/js";
import { define, fireEvent } from "../define";
import type { DateTimeOptions } from "../logic";
import {
  countdownText,
  countdownTime,
  formatDateTime,
  lastTriggeredText,
  pauseBlock,
} from "../logic";
import type { Strings } from "../strings";
import {
  chipStyles,
  iconButtonStyles,
  iconStyles,
  renderIcon,
} from "../styles";
import type { AutomationItem, RowAction, RowActionDetail } from "../types";
import type {
  AutomationPauseMenu,
  MenuItem,
  MenuSelectDetail,
} from "./automation-pause-menu";
import "./automation-pause-menu";

/** wide: area column; medium: area under the name; narrow: phone layout. */
export type RowLayout = "wide" | "medium" | "narrow";

export class AutomationPauseRow extends LitElement {
  @property({ attribute: false }) public item!: AutomationItem;

  @property({ attribute: false }) public strings!: Strings;

  @property() public language = "en";

  @property({ attribute: false }) public now = Date.now();

  @property({ attribute: false }) public dateOptions: DateTimeOptions = {};

  @property({ reflect: true }) public layout: RowLayout = "wide";

  @state() private _menuOpen = false;

  @state() private _menuUsed = false;

  @query(".actions-cell button") private _menuButton?: HTMLButtonElement;

  @query("automation-pause-menu") private _menu?: AutomationPauseMenu;

  public connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "row");
    this.tabIndex = 0;
    this.addEventListener("click", this._handleRowClick);
    this.addEventListener("keydown", this._handleRowKey);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this._handleRowClick);
    this.removeEventListener("keydown", this._handleRowKey);
  }

  protected willUpdate(): void {
    // A YAML automation without an id can never be paused: dim it.
    this.toggleAttribute("no-id", pauseBlock(this.item) === "no_id");
  }

  protected render(): TemplateResult {
    const item = this.item;
    const strings = this.strings;
    const now = new Date(this.now);
    const narrow = this.layout === "narrow";
    const paused = item.pause !== undefined;
    const off = item.state === "off" && !paused;
    const lastTriggered = lastTriggeredText(
      item.last_triggered,
      now,
      this.language,
      strings,
      this.dateOptions
    );
    const lastTriggeredTitle = item.last_triggered
      ? formatDateTime(
          new Date(item.last_triggered),
          this.language,
          this.dateOptions,
          now
        )
      : "";

    let secondary: string[] = [];
    if (narrow) {
      // As ha-data-table in narrow mode: the hidden columns joined with " · ".
      secondary = [
        item.area ?? "",
        off ? "" : lastTriggered,
        off ? strings.disabled : "",
        item.state !== "on" && item.state !== "off" ? strings.unavailable : "",
      ].filter(Boolean);
    } else if (this.layout === "medium" && item.area) {
      secondary = [item.area];
    }

    return html`
      <div class="cell icon-cell" role="cell">${this._renderIcon()}</div>
      <div class="cell name-cell" role="rowheader">
        <div class="primary">${item.name}</div>
        ${
          secondary.length
            ? html`<div class="secondary">${secondary.join(" · ")}</div>`
            : nothing
        }
      </div>
      ${
        this.layout === "wide"
          ? html`<div class="cell" role="cell">${item.area ?? ""}</div>`
          : nothing
      }
      ${
        narrow
          ? nothing
          : html`<div class="cell" role="cell" title=${lastTriggeredTitle}>
              ${lastTriggered}
            </div>`
      }
      <div class="cell state-cell" role="cell">${this._renderState()}</div>
      <div class="cell actions-cell" role="cell">
        <button
          class="icon-button"
          aria-label=${strings.overflow_menu}
          aria-haspopup="menu"
          aria-expanded=${this._menuOpen ? "true" : "false"}
          @click=${this._toggleMenu}
        >
          ${renderIcon(mdiDotsVertical)}
        </button>
        ${
          this._menuUsed
            ? html`<automation-pause-menu
                .items=${this._menuItems()}
                .anchor=${this._menuButton}
                .open=${this._menuOpen}
                .label=${strings.overflow_menu}
                @automation-pause-menu-select=${this._handleMenuSelect}
                @automation-pause-menu-closed=${this._handleMenuClosed}
              ></automation-pause-menu>`
            : nothing
        }
      </div>
    `;
  }

  private _renderIcon(): TemplateResult {
    const item = this.item;
    let badge: TemplateResult | typeof nothing = nothing;
    let color = "";
    if (item.pause) {
      color = "disabled";
      badge = this._badge(mdiPause, "badge-paused");
    } else if (item.state === "off") {
      color = "disabled";
      badge = this._badge(mdiCloseThick, "badge-off");
    } else if (item.state !== "on") {
      color = "error";
      badge = this._badge(mdiExclamationThick, "badge-error");
    }
    return html`<div class="state-icon ${color}">
      ${this._renderOwnIcon()}${badge}
    </div>`;
  }

  /**
   * The automation's own icon, as in the built-in list. Any "mdi:" name
   * needs HA's ha-icon element; it is defined on every HA page. Without it,
   * or without an own icon, the row shows the robot.
   */
  private _renderOwnIcon(): TemplateResult {
    const icon = this.item.icon;
    if (icon && customElements.get("ha-icon")) {
      return html`<ha-icon class="own-icon" .icon=${icon}></ha-icon>`;
    }
    return renderIcon(mdiRobot);
  }

  private _badge(path: string, className: string): TemplateResult {
    return html`<div class="badge ${className}">
      ${renderIcon(path, "icon badge-icon")}
    </div>`;
  }

  private _renderState(): TemplateResult | typeof nothing {
    const item = this.item;
    const strings = this.strings;
    if (item.pause) {
      const now = new Date(this.now);
      const full = countdownText(
        item.pause.resume_at,
        now,
        this.language,
        strings
      );
      const short =
        countdownTime(item.pause.resume_at, now, this.language) ??
        strings.resuming;
      const title = formatDateTime(
        new Date(item.pause.resume_at),
        this.language,
        this.dateOptions,
        now
      );
      return html`<button
        class="chip paused-chip"
        title=${title}
        aria-label=${full}
        @click=${this._handleChipClick}
      >
        ${renderIcon(mdiTimerPauseOutline)}
        <span>${this.layout === "narrow" ? short : full}</span>
      </button>`;
    }
    if (this.layout === "narrow") {
      return nothing;
    }
    if (item.state !== "on" && item.state !== "off") {
      return html`<span class="unavailable">${strings.unavailable}</span>`;
    }
    const checked = item.state === "on";
    return html`<button
      class="switch ${checked ? "checked" : ""}"
      role="switch"
      aria-checked=${checked ? "true" : "false"}
      aria-label=${strings.enable_disable}
      @click=${this._handleSwitchClick}
    >
      <span class="track"><span class="thumb"></span></span>
    </button>`;
  }

  private _menuItems(): MenuItem[] {
    const item = this.item;
    const strings = this.strings;
    const block = pauseBlock(item);
    const items: MenuItem[] = [
      {
        value: "info",
        label: strings.menu_info,
        icon: mdiInformationOutline,
      },
      { value: "settings", label: strings.menu_settings, icon: mdiCog },
      { value: "run", label: strings.menu_run, icon: mdiPlay },
      {
        value: "trace",
        label: strings.menu_trace,
        icon: mdiTransitConnection,
        disabled: !item.config_id,
        secondary: item.config_id ? undefined : strings.block_short_no_id,
      },
      {
        value: "edit",
        label: strings.menu_edit,
        icon: mdiPencil,
        divider: true,
      },
    ];
    if (!item.pause && (item.state === "on" || item.state === "off")) {
      items.push({
        value: "toggle",
        label:
          item.state === "off" ? strings.menu_enable : strings.menu_disable,
        icon:
          item.state === "off" ? mdiToggleSwitch : mdiToggleSwitchOffOutline,
      });
    }
    if (item.pause) {
      items.push(
        {
          value: "extend",
          label: strings.menu_extend,
          icon: mdiTimerPlusOutline,
          divider: true,
        },
        {
          value: "resume",
          label: strings.menu_resume,
          icon: mdiTimerPlayOutline,
        }
      );
    } else {
      items.push({
        value: "pause",
        label: strings.menu_pause,
        icon: mdiTimerPauseOutline,
        divider: true,
        dimmed: block !== undefined,
        secondary: block ? strings[`block_short_${block}`] : undefined,
      });
    }
    return items;
  }

  private _fire(action: RowAction): void {
    fireEvent<RowActionDetail>(this, "automation-pause-row-action", {
      action,
      entityId: this.item.entity_id,
    });
  }

  private _handleRowClick = (ev: MouseEvent): void => {
    // Clicks on the controls of the row have their own action.
    if (
      ev
        .composedPath()
        .some(
          (el) =>
            el instanceof HTMLButtonElement ||
            (el as Element).localName === "automation-pause-menu"
        )
    ) {
      return;
    }
    this._fire("open");
  };

  private _handleRowKey = (ev: KeyboardEvent): void => {
    // Keys on the switch, chip or menu are retargeted to the host; only
    // keys on the row itself open the dialog.
    if (
      ev.composedPath()[0] === this &&
      (ev.key === "Enter" || ev.key === " ")
    ) {
      ev.preventDefault();
      this._fire("open");
    }
  };

  private _handleSwitchClick(): void {
    this._fire("toggle");
  }

  private _handleChipClick(): void {
    this._fire("open");
  }

  private _toggleMenu(): void {
    if (this._menu?.justClosed()) {
      return;
    }
    this._menuUsed = true;
    this._menuOpen = !this._menuOpen;
  }

  private _handleMenuSelect(ev: CustomEvent<MenuSelectDetail>): void {
    ev.stopPropagation();
    this._fire(ev.detail.value as RowAction);
  }

  private _handleMenuClosed(ev: Event): void {
    ev.stopPropagation();
    this._menuOpen = false;
  }

  static styles = [
    iconStyles,
    iconButtonStyles,
    chipStyles,
    css`
      :host {
        display: grid;
        grid-template-columns: var(--automation-pause-columns);
        align-items: center;
        box-sizing: border-box;
        height: var(--data-table-row-height, 60px);
        border-top: 1px solid var(--divider-color);
        color: var(--primary-text-color);
        /* The ha-card behind the rows paints the surface. */
        background-color: transparent;
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
        -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing, grayscale);
        font-size: 0.875rem;
        line-height: var(--ha-line-height-condensed, 1.2);
        font-weight: var(--ha-font-weight-normal, 400);
        letter-spacing: 0.0178571429em;
        cursor: pointer;
        outline: none;
        position: relative;
      }
      :host([layout="narrow"]) {
        --data-table-row-height: 72px;
      }
      :host(:hover) {
        background-image: linear-gradient(
          rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.04),
          rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.04)
        );
      }
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px var(--primary-color);
      }
      .cell {
        padding-inline: 16px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
      :host([layout="narrow"]) .cell {
        padding-inline: 8px;
      }
      .icon-cell {
        color: var(--secondary-text-color);
        overflow: visible;
        display: flex;
        justify-content: center;
      }
      .name-cell {
        overflow: hidden;
      }
      .primary {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .secondary {
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }
      .state-cell,
      .actions-cell {
        overflow: visible;
        display: flex;
        align-items: center;
      }
      .actions-cell {
        justify-content: center;
        padding: 8px;
        color: var(--secondary-text-color);
      }
      .state-icon {
        position: relative;
        display: inline-flex;
        width: 24px;
        height: 24px;
      }
      .own-icon {
        --mdc-icon-size: 24px;
        display: flex;
      }
      .state-icon.disabled {
        color: var(--disabled-color, #bdbdbd);
      }
      .state-icon.error {
        color: var(--error-color, #db4437);
      }
      .badge {
        position: absolute;
        top: -5px;
        inset-inline-end: -7px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        box-shadow: 0 0 0 2px
          var(--data-table-background-color, var(--card-background-color));
        color: var(--data-table-background-color, var(--card-background-color));
        --mdc-icon-size: 12px;
      }
      .badge-off {
        background-color: var(--disabled-color, #bdbdbd);
      }
      .badge-error {
        background-color: var(--error-color, #db4437);
      }
      .badge-paused {
        background-color: var(--warning-color, #ffa600);
      }
      .paused-chip {
        max-width: 100%;
      }
      .paused-chip span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .paused-chip .icon {
        color: var(--warning-color, #ffa600);
      }
      .unavailable {
        color: var(--secondary-text-color);
      }

      /* ha-switch: 48 x 24 px track, 18 px thumb, 44 px tap target. */
      .switch {
        position: relative;
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        height: 44px;
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .switch:focus-visible {
        outline: none;
      }
      .switch:focus-visible .track {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .track {
        position: relative;
        display: block;
        box-sizing: border-box;
        width: 48px;
        height: 24px;
        border-radius: 12px;
        border: 1px solid var(--ha-color-border-neutral-normal, #949494);
        background-color: var(--ha-color-fill-disabled-quiet-resting, #f2f2f2);
        transition: background-color 150ms;
      }
      .thumb {
        position: absolute;
        top: 50%;
        inset-inline-start: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        transform: translateY(-50%);
        background-color: var(--ha-color-on-neutral-normal, #636363);
        box-shadow: var(--ha-box-shadow-s, 0 1px 2px rgba(0, 0, 0, 0.3));
        transition: inset-inline-start 150ms;
      }
      .switch:hover .track {
        background-color: var(--ha-color-fill-disabled-quiet-hover, #e6e6e6);
      }
      .switch.checked .track {
        border-color: var(--ha-color-border-primary-loud, var(--primary-color));
        background-color: var(
          --ha-color-fill-primary-normal-resting,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.2)
        );
      }
      .switch.checked:hover .track {
        background-color: var(
          --ha-color-fill-primary-normal-hover,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.3)
        );
      }
      .switch.checked .thumb {
        inset-inline-start: 26px;
        background-color: var(
          --ha-color-on-primary-normal,
          var(--primary-color)
        );
      }
      :host([no-id]) .icon-cell,
      :host([no-id]) .name-cell {
        opacity: 0.6;
      }
    `,
  ];
}

define("automation-pause-row", AutomationPauseRow);

declare global {
  interface HTMLElementTagNameMap {
    "automation-pause-row": AutomationPauseRow;
  }
}
