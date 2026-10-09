// custom:automation-pause-card. It lists every automation like Settings →
// Automations and pauses one for a set time. Only this element reads hass; the
// list, rows and dialog get plain props and answer with events.

import type { PropertyValues, TemplateResult } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { mdiAlertOutline } from "@mdi/js";
import "./components/automation-pause-dialog";
import type {
  PauseSubmitDetail,
  ResumeSubmitDetail,
} from "./components/automation-pause-dialog";
import "./components/automation-pause-list";
import { define, fireEvent } from "./define";
import {
  DEFAULT_ENTITY,
  SERVICE_DOMAIN,
  buildItems,
  dateTimeOptions,
  errorText,
  parsePauses,
  pauseBlock,
} from "./logic";
import { formatString, getStrings } from "./strings";
import { alertStyles, iconStyles, renderIcon } from "./styles";
import type {
  AutomationItem,
  AutomationPauseCardConfig,
  HomeAssistant,
  RowActionDetail,
} from "./types";

const CARD_TYPE = "automation-pause-card";

// The countdown chips and "Last triggered" texts refresh at this rate.
const REFRESH_MS = 30000;

// Same as HA's navigate(): push the path and let the app router react.
const navigate = (path: string): void => {
  // eslint-disable-next-line no-restricted-syntax
  history.pushState(null, "", path);
  window.dispatchEvent(
    new CustomEvent("location-changed", { detail: { replace: false } })
  );
};

export class AutomationPauseCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: AutomationPauseCardConfig;

  @state() private _now = Date.now();

  @state() private _dialogEntityId?: string;

  @state() private _dialogBusy = false;

  @state() private _dialogError = "";

  private _timer?: number;

  private _items: AutomationItem[] = [];

  public static getStubConfig(): AutomationPauseCardConfig {
    return { type: `custom:${CARD_TYPE}`, entity: DEFAULT_ENTITY };
  }

  public setConfig(config: AutomationPauseCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    if (
      config.entity !== undefined &&
      (typeof config.entity !== "string" ||
        !config.entity.startsWith("sensor."))
    ) {
      throw new Error("entity must be a sensor entity ID");
    }
    this._config = config;
  }

  public getCardSize(): number {
    return 10;
  }

  /** Sections view: use the full width, like the built-in list. */
  public getGridOptions(): Record<string, unknown> {
    return { columns: "full" };
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this._now = Date.now();
    this._timer = window.setInterval(() => {
      this._now = Date.now();
    }, REFRESH_MS);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
    this._timer = undefined;
  }

  private get _entityId(): string {
    return this._config?.entity ?? DEFAULT_ENTITY;
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!changed.has("hass") || changed.size > 1) {
      return true;
    }
    // hass changes on every state change in HA. Render only when something
    // the card shows changed.
    const old = changed.get("hass") as HomeAssistant | undefined;
    const hass = this.hass;
    if (!old || !hass) {
      return true;
    }
    if (
      old.language !== hass.language ||
      old.locale !== hass.locale ||
      old.entities !== hass.entities ||
      old.devices !== hass.devices ||
      old.areas !== hass.areas ||
      old.states[this._entityId] !== hass.states[this._entityId]
    ) {
      return true;
    }
    for (const id of Object.keys(hass.states)) {
      if (id.startsWith("automation.") && old.states[id] !== hass.states[id]) {
        return true;
      }
    }
    for (const id of Object.keys(old.states)) {
      if (id.startsWith("automation.") && !(id in hass.states)) {
        return true;
      }
    }
    return false;
  }

  protected willUpdate(): void {
    const hass = this.hass;
    if (hass) {
      const sensor = hass.states[this._entityId];
      this._items = buildItems(hass, parsePauses(sensor?.attributes.paused));
    }
  }

  protected render(): TemplateResult | typeof nothing {
    const hass = this.hass;
    if (!hass || !this._config) {
      return nothing;
    }
    const language = hass.locale?.language ?? hass.language ?? "en";
    const strings = getStrings(hass.language ?? language);
    const sensor = hass.states[this._entityId];
    const dateOptions = dateTimeOptions(hass);
    const dialogItem = this._dialogEntityId
      ? this._items.find((item) => item.entity_id === this._dialogEntityId)
      : undefined;

    return html`
      ${
        sensor
          ? nothing
          : html`<div class="alert warning">
              ${renderIcon(mdiAlertOutline)}
              <span
                >${formatString(strings.entity_not_found, {
                  entity: this._entityId,
                })}</span
              >
            </div>`
      }
      <automation-pause-list
        .items=${this._items}
        .strings=${strings}
        .language=${language}
        .now=${this._now}
        .dateOptions=${dateOptions}
        @automation-pause-row-action=${this._handleRowAction}
      ></automation-pause-list>
      <automation-pause-dialog
        .open=${dialogItem !== undefined}
        .item=${dialogItem}
        .strings=${strings}
        .language=${language}
        .now=${this._now}
        .dateOptions=${dateOptions}
        .busy=${this._dialogBusy}
        .error=${this._dialogError}
        @automation-pause-pause-submit=${this._handlePause}
        @automation-pause-resume-submit=${this._handleResume}
        @automation-pause-dialog-closed=${this._closeDialog}
      ></automation-pause-dialog>
    `;
  }

  private _openDialog(entityId: string): void {
    this._dialogError = "";
    this._dialogBusy = false;
    this._dialogEntityId = entityId;
  }

  private _closeDialog(): void {
    this._dialogEntityId = undefined;
    this._dialogError = "";
    this._dialogBusy = false;
  }

  private _handleRowAction(ev: CustomEvent<RowActionDetail>): void {
    const hass = this.hass;
    const item = this._items.find((i) => i.entity_id === ev.detail.entityId);
    if (!hass || !item) {
      return;
    }
    const entityId = item.entity_id;
    switch (ev.detail.action) {
      case "open":
      case "pause":
      case "extend":
        this._openDialog(entityId);
        break;
      case "resume":
        // HA shows a toast when the call fails.
        hass
          .callService(SERVICE_DOMAIN, "resume", {}, { entity_id: entityId })
          .catch(() => undefined);
        break;
      case "toggle":
        hass
          .callService(
            "automation",
            item.state === "off" ? "turn_on" : "turn_off",
            {},
            { entity_id: entityId }
          )
          .catch(() => undefined);
        break;
      case "run":
        hass
          .callService(
            "automation",
            "trigger",
            { skip_condition: true },
            { entity_id: entityId }
          )
          .catch(() => undefined);
        break;
      case "info":
        fireEvent(this, "hass-more-info", { entityId });
        break;
      case "settings":
        fireEvent(this, "hass-more-info", { entityId, view: "settings" });
        break;
      case "trace":
        if (item.config_id) {
          navigate(
            `/config/automation/trace/${encodeURIComponent(item.config_id)}`
          );
        }
        break;
      case "edit":
        navigate(
          item.config_id
            ? `/config/automation/edit/${encodeURIComponent(item.config_id)}`
            : `/config/automation/show/${encodeURIComponent(entityId)}`
        );
        break;
    }
  }

  private async _handlePause(
    ev: CustomEvent<PauseSubmitDetail>
  ): Promise<void> {
    const item = this._items.find((i) => i.entity_id === ev.detail.entityId);
    if (!this.hass || !item || pauseBlock(item)) {
      return;
    }
    await this._callFromDialog("pause", {
      duration: ev.detail.duration,
      stop_actions: true,
    });
  }

  private async _handleResume(
    ev: CustomEvent<ResumeSubmitDetail>
  ): Promise<void> {
    if (ev.detail.entityId !== this._dialogEntityId) {
      return;
    }
    await this._callFromDialog("resume", {});
  }

  private async _callFromDialog(
    service: "pause" | "resume",
    data: Record<string, unknown>
  ): Promise<void> {
    const hass = this.hass;
    const entityId = this._dialogEntityId;
    if (!hass || !entityId) {
      return;
    }
    this._dialogBusy = true;
    this._dialogError = "";
    try {
      // notifyOnError false: the dialog shows the error, so no extra toast.
      await hass.callService(
        SERVICE_DOMAIN,
        service,
        data,
        { entity_id: entityId },
        false
      );
      if (this._dialogEntityId === entityId) {
        this._closeDialog();
      }
    } catch (err) {
      if (this._dialogEntityId === entityId) {
        this._dialogBusy = false;
        this._dialogError = errorText(
          err,
          getStrings(hass.language ?? hass.locale?.language)
        );
      }
    }
  }

  static styles = [
    iconStyles,
    alertStyles,
    css`
      :host {
        display: block;
        background-color: var(--primary-background-color);
      }
      .alert {
        margin: 8px 16px;
      }
    `,
  ];
}

define(CARD_TYPE, AutomationPauseCard);

declare global {
  interface HTMLElementTagNameMap {
    "automation-pause-card": AutomationPauseCard;
  }
  interface Window {
    customCards?: {
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }[];
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TYPE)) {
  const strings = getStrings(navigator.language);
  window.customCards.push({
    type: CARD_TYPE,
    name: strings.card_name,
    description: strings.card_description,
    preview: true,
    documentationURL:
      "https://github.com/straybiker/HA-Automation-Pause-and-Resume",
  });
}
