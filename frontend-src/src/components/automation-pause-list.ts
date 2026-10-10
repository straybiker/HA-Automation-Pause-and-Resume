// The list with its header: filter chip, search field and sort chip, then the
// column titles and the rows. It copies hass-tabs-subpage-data-table and
// ha-data-table as used by the built-in automation list.

import type { PropertyValues, TemplateResult } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import {
  mdiArrowDown,
  mdiClose,
  mdiFilterVariant,
  mdiMagnify,
  mdiMenuDown,
} from "@mdi/js";
import { define } from "../define";
import type { DateTimeOptions } from "../logic";
import { filterItems, parseView, sortItems } from "../logic";
import type { Strings } from "../strings";
import { formatString } from "../strings";
import {
  chipStyles,
  iconButtonStyles,
  iconStyles,
  renderIcon,
} from "../styles";
import type { AutomationItem, SortKey, StatusFilter } from "../types";
import type {
  AutomationPauseMenu,
  MenuItem,
  MenuSelectDetail,
} from "./automation-pause-menu";
import "./automation-pause-menu";
import type { RowLayout } from "./automation-pause-row";
import "./automation-pause-row";

// Per browser, like the sort and filters of the built-in automation list.
const VIEW_STORAGE_KEY = "automation-pause-card.view";

const loadView = (): ReturnType<typeof parseView> => {
  try {
    return parseView(localStorage.getItem(VIEW_STORAGE_KEY));
  } catch {
    return parseView(null);
  }
};

// Below this width the list uses the phone layout of ha-data-table.
const NARROW_WIDTH = 600;
// Below this width the area moves from its own column to the name cell.
const MEDIUM_WIDTH = 760;

const STATUS_FILTERS: readonly StatusFilter[] = [
  "all",
  "enabled",
  "disabled",
  "paused",
];

const SORT_KEYS: readonly SortKey[] = ["name", "last_triggered", "state"];

type OpenMenu = "filter" | "sort" | undefined;

export class AutomationPauseList extends LitElement {
  @property({ attribute: false }) public items: AutomationItem[] = [];

  @property({ attribute: false }) public strings!: Strings;

  @property() public language = "en";

  @property({ attribute: false }) public now = Date.now();

  @property({ attribute: false }) public dateOptions: DateTimeOptions = {};

  @state() private _search = "";

  @state() private _status: StatusFilter = loadView().status;

  @state() private _sort: SortKey = loadView().sort;

  @state() private _layout: RowLayout = "wide";

  @state() private _openMenu: OpenMenu;

  @query("automation-pause-menu") private _menu?: AutomationPauseMenu;

  @query(".search input") private _searchInput?: HTMLInputElement;

  private _resizeObserver?: ResizeObserver;

  private _menuAnchor?: HTMLElement;

  public connectedCallback(): void {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (!width) {
        return;
      }
      this._layout =
        width < NARROW_WIDTH
          ? "narrow"
          : width < MEDIUM_WIDTH
            ? "medium"
            : "wide";
    });
    this._resizeObserver.observe(this);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("_layout") || changed.has("items")) {
      this.style.setProperty("--automation-pause-columns", this._columns());
    }
  }

  private _columns(): string {
    // Each row is its own grid, so every column needs a fixed or shared size.
    const stateWidth = this.items.some((item) => item.pause) ? "220px" : "82px";
    switch (this._layout) {
      case "narrow":
        return "56px minmax(0, 1fr) auto 56px";
      case "medium":
        return `64px minmax(0, 2fr) minmax(150px, 1fr) ${stateWidth} 64px`;
      default:
        return `64px minmax(0, 2fr) minmax(120px, 1fr) minmax(150px, 1fr) ${stateWidth} 64px`;
    }
  }

  protected render(): TemplateResult {
    const strings = this.strings;
    const narrow = this._layout === "narrow";
    const rows = sortItems(
      filterItems(this.items, this._search, this._status),
      this._sort,
      this.language
    );

    return html`
      ${
        narrow
          ? html`<div class="search-toolbar">${this._renderSearch()}</div>
              <div class="chip-row">
                ${this._renderFilterChip()}
                <div class="flex"></div>
                ${this._renderSortChip()}
              </div>`
          : html`<div class="table-header">
              ${this._renderFilterChip()}${this._renderSearch()}${this._renderSortChip()}
            </div>`
      }
      <div class="table" role="table" aria-rowcount=${rows.length + 1}>
        ${narrow ? nothing : this._renderColumnTitles()}
        ${
          rows.length
            ? repeat(
                rows,
                (item) => item.entity_id,
                (item) =>
                  html`<automation-pause-row
                    .item=${item}
                    .strings=${strings}
                    .language=${this.language}
                    .now=${this.now}
                    .dateOptions=${this.dateOptions}
                    .layout=${this._layout}
                  ></automation-pause-row>`
              )
            : html`<div class="empty" role="row">
                <div role="cell">
                  ${this.items.length ? strings.no_match : strings.no_automations}
                </div>
              </div>`
        }
      </div>
      <automation-pause-menu
        .items=${this._menuItems()}
        .anchor=${this._menuAnchor}
        .open=${this._openMenu !== undefined}
        .align=${this._openMenu === "filter" ? "start" : "end"}
        .label=${
          this._openMenu === "filter" ? strings.filters : this._sortLabel()
        }
        @automation-pause-menu-select=${this._handleMenuSelect}
        @automation-pause-menu-closed=${this._handleMenuClosed}
      ></automation-pause-menu>
    `;
  }

  private _renderSearch(): TemplateResult {
    const label = formatString(
      this.items.length === 1
        ? this.strings.search_one
        : this.strings.search_other,
      { number: this.items.length }
    );
    return html`<div class="search">
      ${renderIcon(mdiMagnify)}
      <input
        type="search"
        autocomplete="off"
        spellcheck="false"
        .value=${this._search}
        placeholder=${label}
        aria-label=${label}
        @input=${this._handleSearch}
      />
      ${
        this._search
          ? html`<button
              class="icon-button clear"
              aria-label=${this.strings.clear_search}
              @click=${this._clearSearch}
            >
              ${renderIcon(mdiClose)}
            </button>`
          : nothing
      }
    </div>`;
  }

  private _renderFilterChip(): TemplateResult {
    const active = this._status !== "all";
    return html`<div class="filter-chip">
      <button
        class="chip ${active ? "active" : ""}"
        aria-haspopup="menu"
        aria-expanded=${this._openMenu === "filter" ? "true" : "false"}
        data-menu="filter"
        @click=${this._toggleMenu}
      >
        ${renderIcon(mdiFilterVariant)}
        <span>${this.strings.filters}</span>
      </button>
      ${active ? html`<div class="badge" aria-hidden="true">1</div>` : nothing}
    </div>`;
  }

  private _sortTitle(key: SortKey): string {
    return key === "name"
      ? this.strings.column_name
      : key === "last_triggered"
        ? this.strings.column_last_triggered
        : this.strings.column_state;
  }

  private _sortLabel(): string {
    return formatString(this.strings.sort_by, {
      column: this._sortTitle(this._sort),
    });
  }

  private _renderSortChip(): TemplateResult {
    return html`<button
      class="chip no-icon trailing"
      aria-haspopup="menu"
      aria-expanded=${this._openMenu === "sort" ? "true" : "false"}
      data-menu="sort"
      @click=${this._toggleMenu}
    >
      <span>${this._sortLabel()}</span>
      ${renderIcon(mdiMenuDown)}
    </button>`;
  }

  private _renderColumnTitles(): TemplateResult {
    const strings = this.strings;
    const title = (text: string, key?: SortKey) => {
      if (!key) {
        return html`<div class="column-title" role="columnheader">
          ${text}
        </div>`;
      }
      const sorted = this._sort === key;
      return html`<div
        class="column-title sortable ${sorted ? "sorted" : ""}"
        role="columnheader"
        aria-sort=${
          sorted ? (key === "name" ? "ascending" : "descending") : "none"
        }
      >
        <button .value=${key} @click=${this._handleTitleClick}>
          ${renderIcon(mdiArrowDown, "icon sort-icon")}<span>${text}</span>
        </button>
      </div>`;
    };
    return html`<div class="column-titles" role="row">
      <div class="column-title" role="columnheader">
        <span class="visually-hidden">${strings.column_icon}</span>
      </div>
      ${title(strings.column_name, "name")}
      ${this._layout === "wide" ? title(strings.column_area) : nothing}
      ${title(strings.column_last_triggered, "last_triggered")}
      ${title(strings.column_state, "state")}
      <div class="column-title" role="columnheader">
        <span class="visually-hidden">${strings.column_actions}</span>
      </div>
    </div>`;
  }

  private _menuItems(): MenuItem[] {
    if (this._openMenu === "filter") {
      return STATUS_FILTERS.map((status) => ({
        value: status,
        label: this.strings[`filter_${status}`],
        checked: this._status === status,
      }));
    }
    if (this._openMenu === "sort") {
      return SORT_KEYS.map((key) => ({
        value: key,
        label: this._sortTitle(key),
        checked: this._sort === key,
      }));
    }
    return [];
  }

  private _toggleMenu(ev: Event): void {
    const button = ev.currentTarget as HTMLElement;
    const menu = button.dataset.menu as OpenMenu;
    if (this._menu?.justClosed() && this._menuAnchor === button) {
      return;
    }
    this._menuAnchor = button;
    this._openMenu = this._openMenu === menu ? undefined : menu;
  }

  private _handleMenuSelect(ev: CustomEvent<MenuSelectDetail>): void {
    ev.stopPropagation();
    if (this._openMenu === "filter") {
      this._status = ev.detail.value as StatusFilter;
    } else if (this._openMenu === "sort") {
      this._sort = ev.detail.value as SortKey;
    }
    this._saveView();
  }

  private _saveView(): void {
    try {
      localStorage.setItem(
        VIEW_STORAGE_KEY,
        JSON.stringify({ sort: this._sort, status: this._status })
      );
    } catch {
      // Private windows can block storage; the list still works without it.
    }
  }

  private _handleMenuClosed(ev: Event): void {
    ev.stopPropagation();
    this._openMenu = undefined;
  }

  private _handleTitleClick(ev: Event): void {
    this._sort = (ev.currentTarget as HTMLButtonElement).value as SortKey;
    this._saveView();
  }

  private _handleSearch(ev: Event): void {
    this._search = (ev.target as HTMLInputElement).value;
  }

  private _clearSearch(): void {
    this._search = "";
    this._searchInput?.focus();
  }

  static styles = [
    iconStyles,
    iconButtonStyles,
    chipStyles,
    css`
      :host {
        display: block;
        color: var(--primary-text-color);
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
        -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
        -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing, grayscale);
      }

      /* hass-tabs-subpage-data-table .table-header */
      .table-header {
        display: flex;
        align-items: center;
        height: 56px;
        width: 100%;
        justify-content: space-between;
        padding: 0 16px;
        gap: var(--ha-space-4, 16px);
        box-sizing: border-box;
        background: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .search-toolbar {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        background: var(--primary-background-color);
      }
      .chip-row {
        display: flex;
        align-items: center;
        gap: var(--ha-space-4, 16px);
        min-height: 56px;
        padding: 0 16px;
        box-sizing: border-box;
        background: var(--primary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }
      .flex {
        flex: 1;
      }

      /* ha-input-search, outlined */
      .search {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--ha-space-2, 8px);
        box-sizing: border-box;
        height: 32px;
        padding-inline: 12px 4px;
        border: 1px solid var(--outline-color, var(--divider-color));
        border-radius: 10px;
        background-color: var(--card-background-color);
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }
      .search-toolbar .search {
        height: 44px;
        border-radius: var(--ha-border-radius-md, 8px);
      }
      .search:hover {
        border-color: var(--outline-hover-color, var(--secondary-text-color));
      }
      .search:focus-within {
        border-color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }
      .search input {
        flex: 1;
        min-width: 0;
        height: 100%;
        padding: 0;
        border: none;
        outline: none;
        background: none;
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: var(--ha-font-size-m, 14px);
      }
      .search input::placeholder {
        color: var(--secondary-text-color);
      }
      .search input::-webkit-search-cancel-button {
        display: none;
      }
      .search .clear {
        width: 32px;
        height: 32px;
        padding: 6px;
        flex: none;
      }

      /* ha-filter-pane-chip badge */
      .filter-chip {
        position: relative;
        display: inline-flex;
        flex: none;
      }
      .badge {
        position: absolute;
        top: -4px;
        inset-inline-end: -4px;
        min-width: 16px;
        box-sizing: border-box;
        border-radius: 50%;
        font-size: var(--ha-font-size-xs, 10px);
        font-weight: var(--ha-font-weight-normal, 400);
        background-color: var(--primary-color);
        line-height: var(--ha-line-height-normal, 1.6);
        text-align: center;
        padding: 0 2px;
        color: var(--text-primary-color, #fff);
        pointer-events: none;
      }

      /* ha-data-table */
      .table {
        background-color: var(
          --data-table-background-color,
          var(--card-background-color)
        );
      }
      /* ha-data-table draws a line between rows, not above the first one. */
      .table > automation-pause-row:first-of-type {
        border-top-color: transparent;
      }
      .column-titles {
        display: grid;
        grid-template-columns: var(--automation-pause-columns);
        align-items: center;
        height: 56px;
        border-bottom: 1px solid var(--divider-color);
      }
      .column-title {
        padding-inline: 16px;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        box-sizing: border-box;
        color: var(--primary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        line-height: var(--ha-line-height-normal, 1.6);
        font-weight: var(--ha-font-weight-medium, 500);
        letter-spacing: 0.0071428571em;
        text-align: start;
      }
      .column-title button {
        display: inline-flex;
        align-items: center;
        gap: 0;
        max-width: 100%;
        min-height: 44px;
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        letter-spacing: inherit;
        cursor: pointer;
      }
      .column-title button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .column-title span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sort-icon {
        width: 0;
        margin-inline-end: 0;
        opacity: 0;
        transition:
          width 0.2s ease,
          margin 0.2s ease;
        --mdc-icon-size: 18px;
      }
      .sortable.sorted .sort-icon,
      .sortable button:hover .sort-icon {
        width: 18px;
        margin-inline-end: 6px;
        opacity: 1;
      }
      .sortable:not(.sorted) button:hover .sort-icon {
        opacity: 0.5;
      }
      .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        padding: 16px;
        box-sizing: border-box;
        text-align: center;
        font-size: 0.875rem;
        color: var(--primary-text-color);
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    `,
  ];
}

define("automation-pause-list", AutomationPauseList);

declare global {
  interface HTMLElementTagNameMap {
    "automation-pause-list": AutomationPauseList;
  }
}
