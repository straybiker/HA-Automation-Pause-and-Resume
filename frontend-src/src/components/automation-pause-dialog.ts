// The pause dialog. A native <dialog> styled like ha-dialog: pick a duration
// from the list (or a custom one) and press Pause. The same dialog extends a
// running pause and explains why an automation cannot be paused.

import type { PropertyValues, TemplateResult } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { mdiAlertCircleOutline, mdiAlertOutline, mdiClose } from "@mdi/js";
import { define, fireEvent } from "../define";
import type { DateTimeOptions, DurationResult } from "../logic";
import {
  DURATION_PRESETS,
  checkDuration,
  countdownText,
  durationErrorKey,
  formatDateTime,
  parseCustomDuration,
  pauseBlock,
  presetLabel,
} from "../logic";
import type { Strings } from "../strings";
import { formatString } from "../strings";
import {
  alertStyles,
  buttonStyles,
  iconButtonStyles,
  iconStyles,
  renderIcon,
} from "../styles";
import type { AutomationItem, Duration, DurationUnit } from "../types";

export interface PauseSubmitDetail {
  entityId: string;
  duration: Duration;
}

export interface ResumeSubmitDetail {
  entityId: string;
}

const UNITS: readonly DurationUnit[] = ["minutes", "hours", "days"];

export class AutomationPauseDialog extends LitElement {
  @property({ type: Boolean }) public open = false;

  @property({ attribute: false }) public item?: AutomationItem;

  @property({ attribute: false }) public strings!: Strings;

  @property() public language = "en";

  @property({ attribute: false }) public now = Date.now();

  @property({ attribute: false }) public dateOptions: DateTimeOptions = {};

  @property({ type: Boolean }) public busy = false;

  @property() public error = "";

  @state() private _choice?: string;

  @state() private _customValue = "";

  @state() private _customUnit: DurationUnit = "hours";

  @query("dialog") private _dialog!: HTMLDialogElement;

  @query("input[type=radio], .footer .button")
  private _firstControl?: HTMLElement;

  @query(".custom input") private _customInput?: HTMLInputElement;

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("open") && this.open) {
      this._choice = undefined;
      this._customValue = "";
      this._customUnit = "hours";
    }
  }

  protected updated(changed: PropertyValues): void {
    if (!changed.has("open")) {
      return;
    }
    if (this.open && !this._dialog.open) {
      this._dialog.showModal();
      this._firstControl?.focus();
    } else if (!this.open && this._dialog.open) {
      this._dialog.close();
    }
  }

  private _result(): DurationResult | undefined {
    if (!this._choice) {
      return undefined;
    }
    if (this._choice === "custom") {
      return this._customValue.trim()
        ? parseCustomDuration(this._customValue, this._customUnit)
        : undefined;
    }
    const preset = DURATION_PRESETS.find((p) => p.key === this._choice);
    return preset ? checkDuration(preset.seconds) : undefined;
  }

  protected render(): TemplateResult {
    const item = this.item;
    const strings = this.strings;
    if (!strings) {
      return html`<dialog></dialog>`;
    }
    const paused = item?.pause !== undefined;
    const block = item ? pauseBlock(item) : undefined;
    const result = this._result();

    return html`<dialog
      aria-labelledby="title"
      @close=${this._handleClose}
      @click=${this._handleDialogClick}
    >
      <div class="header">
        <button
          class="icon-button"
          aria-label=${strings.close}
          @click=${this._close}
        >
          ${renderIcon(mdiClose)}
        </button>
        <div class="titles">
          <h2 id="title">
            ${paused ? strings.dialog_extend_title : strings.dialog_pause_title}
          </h2>
          ${item ? html`<div class="subtitle">${item.name}</div>` : nothing}
        </div>
      </div>
      <div class="body">
        ${item && paused ? this._renderPauseState(item) : nothing}
        ${
          block
            ? html`<div class="alert warning">
                ${renderIcon(mdiAlertOutline)}
                <span>${strings[`block_${block}`]}</span>
              </div>`
            : this._renderDurations(result)
        }
        ${
          this.error
            ? html`<div class="alert error" role="alert">
                ${renderIcon(mdiAlertCircleOutline)}
                <span>${this.error}</span>
              </div>`
            : nothing
        }
      </div>
      <div class="footer">
        ${
          paused
            ? html`<button
                class="button resume"
                ?disabled=${this.busy}
                @click=${this._resume}
              >
                ${strings.resume_now}
              </button>`
            : nothing
        }
        ${
          block
            ? html`<button class="button" @click=${this._close}>
                ${strings.close}
              </button>`
            : html`<button class="button" @click=${this._close}>
                  ${strings.cancel}
                </button>
                <button
                  class="button filled"
                  ?disabled=${this.busy || !result?.duration}
                  @click=${this._submit}
                >
                  ${paused ? strings.extend : strings.pause}
                </button>`
        }
      </div>
    </dialog>`;
  }

  private _renderPauseState(item: AutomationItem): TemplateResult {
    const now = new Date(this.now);
    const resumeAt = item.pause!.resume_at;
    const until = formatString(this.strings.paused_until, {
      time: formatDateTime(
        new Date(resumeAt),
        this.language,
        this.dateOptions,
        now
      ),
    });
    return html`<p class="state">
        ${until} ${countdownText(resumeAt, now, this.language, this.strings)}
      </p>
      <p class="hint">${this.strings.extend_hint}</p>`;
  }

  private _renderDurations(result: DurationResult | undefined): TemplateResult {
    const strings = this.strings;
    const customError =
      this._choice === "custom" && result?.error
        ? strings[durationErrorKey(result.error)]
        : "";
    return html`<div
        class="list"
        role="radiogroup"
        aria-label=${strings.dialog_durations}
      >
        ${DURATION_PRESETS.map((preset) =>
          this._renderChoice(preset.key, presetLabel(preset, this.language))
        )}
        ${this._renderChoice("custom", strings.custom)}
      </div>
      ${
        this._choice === "custom"
          ? html`<div class="custom">
                <label class="field">
                  <span>${strings.custom_value}</span>
                  <input
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    .value=${live(this._customValue)}
                    aria-invalid=${customError ? "true" : "false"}
                    aria-describedby="custom-error"
                    @input=${this._handleCustomValue}
                    @keydown=${this._handleCustomKey}
                  />
                </label>
                <label class="field">
                  <span>${strings.custom_unit}</span>
                  <select @change=${this._handleCustomUnit}>
                    ${UNITS.map(
                      (unit) =>
                        html`<option
                          value=${unit}
                          ?selected=${unit === this._customUnit}
                        >
                          ${strings[`unit_${unit}`]}
                        </option>`
                    )}
                  </select>
                </label>
              </div>
              <div id="custom-error" class="field-error">${customError}</div>`
          : nothing
      }`;
  }

  private _renderChoice(key: string, label: string): TemplateResult {
    return html`<label class="choice">
      <input
        type="radio"
        name="duration"
        .value=${key}
        .checked=${live(this._choice === key)}
        @change=${this._handleChoice}
      />
      <span>${label}</span>
    </label>`;
  }

  private _handleChoice(ev: Event): void {
    this._choice = (ev.target as HTMLInputElement).value;
    if (this._choice === "custom") {
      this.updateComplete.then(() => this._customInput?.focus());
    }
  }

  private _handleCustomValue(ev: Event): void {
    this._customValue = (ev.target as HTMLInputElement).value;
  }

  private _handleCustomUnit(ev: Event): void {
    this._customUnit = (ev.target as HTMLSelectElement).value as DurationUnit;
  }

  private _handleCustomKey(ev: KeyboardEvent): void {
    if (ev.key === "Enter") {
      this._submit();
    }
  }

  private _submit(): void {
    const duration = this._result()?.duration;
    if (!this.item || !duration || this.busy) {
      return;
    }
    fireEvent<PauseSubmitDetail>(this, "automation-pause-pause-submit", {
      entityId: this.item.entity_id,
      duration,
    });
  }

  private _resume(): void {
    if (!this.item || this.busy) {
      return;
    }
    fireEvent<ResumeSubmitDetail>(this, "automation-pause-resume-submit", {
      entityId: this.item.entity_id,
    });
  }

  private _close(): void {
    this._dialog.close();
  }

  private _handleDialogClick(ev: MouseEvent): void {
    // A click on the backdrop targets the <dialog> itself.
    if (ev.target === this._dialog) {
      this._dialog.close();
    }
  }

  private _handleClose(): void {
    if (this.open) {
      fireEvent(this, "automation-pause-dialog-closed", undefined);
    }
  }

  static styles = [
    iconStyles,
    iconButtonStyles,
    buttonStyles,
    alertStyles,
    css`
      dialog {
        box-sizing: border-box;
        width: min(var(--ha-dialog-width-md, 580px), 95vw);
        max-width: 95vw;
        max-height: calc(100vh - 80px);
        padding: 0;
        border: none;
        border-radius: var(
          --ha-dialog-border-radius,
          var(--ha-border-radius-3xl, 24px)
        );
        background-color: var(
          --ha-dialog-surface-background,
          var(--card-background-color, #fff)
        );
        color: var(--primary-text-color);
        box-shadow: var(
          --dialog-box-shadow,
          0 8px 12px 6px rgba(0, 0, 0, 0.15),
          0 4px 4px rgba(0, 0, 0, 0.3)
        );
        font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
        -webkit-font-smoothing: var(--ha-font-smoothing, antialiased);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background-color: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.32));
      }
      @media all and (max-width: 450px), all and (max-height: 500px) {
        dialog {
          width: 100vw;
          max-width: 100vw;
          height: 100%;
          max-height: 100%;
          margin: 0;
          border-radius: 0;
        }
      }
      .header {
        display: flex;
        align-items: flex-start;
        gap: var(--ha-space-1, 4px);
        padding: var(--ha-space-3, 12px) var(--ha-space-6, 24px)
          var(--ha-space-4, 16px) var(--ha-space-3, 12px);
        flex: none;
      }
      .titles {
        min-width: 0;
        padding-top: 10px;
      }
      h2 {
        margin: 0;
        font-size: var(--ha-font-size-2xl, 24px);
        line-height: var(--ha-line-height-condensed, 1.2);
        font-weight: var(--ha-font-weight-normal, 400);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .subtitle {
        margin-top: var(--ha-space-1, 4px);
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-m, 14px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .body {
        flex: 1;
        overflow: auto;
        padding: 0 var(--ha-space-6, 24px) var(--ha-space-4, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-3, 12px);
        font-size: var(--ha-font-size-m, 14px);
        line-height: var(--ha-line-height-normal, 1.6);
      }
      p {
        margin: 0;
      }
      .hint {
        color: var(--secondary-text-color);
      }
      .list {
        display: flex;
        flex-direction: column;
        margin: 0 calc(-1 * var(--ha-space-6, 24px));
      }
      .choice {
        display: flex;
        align-items: center;
        gap: var(--ha-space-4, 16px);
        min-height: 48px;
        padding: 0 var(--ha-space-6, 24px);
        cursor: pointer;
        font-size: var(--ha-font-size-l, 16px);
        position: relative;
      }
      .choice::before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: var(--primary-text-color);
        opacity: 0;
        pointer-events: none;
      }
      .choice:hover::before {
        opacity: 0.04;
      }
      .choice input {
        width: 20px;
        height: 20px;
        margin: 0;
        accent-color: var(--primary-color);
        flex: none;
      }
      .custom {
        display: flex;
        gap: var(--ha-space-3, 12px);
        flex-wrap: wrap;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--ha-space-1, 4px);
        flex: 1 1 120px;
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
      }
      .field input,
      .field select {
        box-sizing: border-box;
        height: 48px;
        padding: 0 var(--ha-space-3, 12px);
        border: 1px solid var(--outline-color, var(--divider-color));
        border-radius: var(--ha-border-radius-md, 8px);
        background-color: var(--card-background-color);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: var(--ha-font-size-l, 16px);
      }
      .field input:focus,
      .field select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: inset 0 0 0 1px var(--primary-color);
      }
      .field input[aria-invalid="true"] {
        border-color: var(--error-color, #db4437);
      }
      .field-error {
        min-height: 1.6em;
        color: var(--error-color, #db4437);
        font-size: var(--ha-font-size-s, 12px);
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ha-space-3, 12px);
        justify-content: flex-end;
        align-items: center;
        padding: var(--ha-space-3, 12px) var(--ha-space-4, 16px)
          var(--ha-space-4, 16px);
        flex: none;
      }
      .resume {
        margin-inline-end: auto;
      }
    `,
  ];
}

define("automation-pause-dialog", AutomationPauseDialog);

declare global {
  interface HTMLElementTagNameMap {
    "automation-pause-dialog": AutomationPauseDialog;
  }
}
