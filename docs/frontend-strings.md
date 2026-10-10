# Card strings and port notes

The card keeps its EN and NL texts in `frontend-src/src/strings.ts`. Where Home Assistant has a string with the same meaning, the card copies its English text. This table maps each card key to that `home-assistant/frontend` key (file `src/translations/en.json`). "new" means HA has no such string. A port adds the "new" strings under `ui.panel.config.automation.picker` and the dialog strings under a new `ui.dialogs.automation_pause` block.

## Strings

| Card key | English text | `home-assistant/frontend` key |
|---|---|---|
| `card_name` | Automation Pause and Resume | new (card picker only) |
| `card_description` | Lists all automations. Pause one … | new (card picker only) |
| `search_one`, `search_other` | Search {number} automation(s) | `ui.panel.config.automation.picker.search` (one ICU plural string) |
| `clear_search` | Clear | `ui.components.input.clear` |
| `filters` | Filters | `ui.components.subpage-data-table.filters` |
| `filter_all` | All | new |
| `filter_enabled` | Enabled | `ui.panel.config.entities.picker.status.enabled` |
| `filter_disabled` | Disabled | `ui.panel.config.automation.picker.disabled` |
| `filter_paused` | Paused | new |
| `sort_by` | Sort by {column} | `ui.components.subpage-data-table.sort_by` (`{sortColumn}`) |
| `column_icon` | Icon | `ui.panel.config.automation.picker.headers.icon` |
| `column_name` | Name | `ui.panel.config.automation.picker.headers.name` |
| `column_area` | Area | `ui.panel.config.generic.headers.area` |
| `column_last_triggered` | Last triggered | `ui.card.automation.last_triggered` |
| `column_state` | State | `ui.panel.config.automation.picker.state` |
| `column_actions` | Actions | `ui.panel.config.generic.headers.actions` |
| `never` | Never | `ui.components.relative_time.never` |
| `disabled` | Disabled | `ui.panel.config.automation.picker.disabled` |
| `unavailable` | Unavailable | `state.default.unavailable` |
| `enable_disable` | Enable/disable | `ui.panel.config.automation.picker.headers.toggle` |
| `resumes` | Resumes {time} | new |
| `resuming` | Resuming… | new |
| `paused_until` | Paused until {time}. | new |
| `overflow_menu` | Overflow menu | `ui.common.overflow_menu` |
| `menu_info` | More info | `ui.panel.config.automation.editor.show_info` |
| `menu_settings` | Settings | `ui.panel.config.automation.picker.show_settings` |
| `menu_run` | Run actions | `ui.panel.config.automation.editor.run` |
| `menu_trace` | Traces | `ui.panel.config.automation.editor.show_trace` |
| `menu_edit` | Edit automation | `ui.panel.config.automation.picker.edit_automation` |
| `menu_enable` | Enable | `ui.panel.config.automation.editor.enable` |
| `menu_disable` | Disable | `ui.panel.config.automation.editor.disable` |
| `menu_pause` | Pause… | new |
| `menu_extend` | Extend… | new |
| `menu_resume` | Resume now | new |
| `block_short_no_id` | No id | new |
| `block_short_already_off` | Already off | new |
| `block_short_unavailable` | Unavailable | `state.default.unavailable` |
| `block_no_id` | This automation has no id. … | new (close to `ui.panel.config.automation.editor.traces_not_available`) |
| `block_already_off` | This automation is already off. … | new |
| `block_unavailable` | This automation is unavailable. | new |
| `dialog_pause_title` | Pause automation | new |
| `dialog_extend_title` | Extend pause | new |
| `dialog_durations` | Duration | `ui.components.selectors.duration.duration` |
| `extend_hint` | The new duration starts now … | new |
| `custom` | Custom | `ui.panel.config.backup.schedule.time_options.custom` |
| `custom_value` | Value | new |
| `custom_unit` | Unit | new |
| `unit_minutes` | Minutes | `ui.panel.config.automation.editor.triggers.type.time_pattern.minutes` |
| `unit_hours` | Hours | `ui.panel.config.automation.editor.triggers.type.time_pattern.hours` |
| `unit_days` | Days | new |
| `duration_invalid` | Enter a number. | new |
| `duration_too_short` | A pause must be at least 1 minute. | new (same text as backend key `duration_too_short`) |
| `duration_too_long` | A pause can be at most 365 days. | new (same text as backend key `duration_too_long`) |
| `cancel` | Cancel | `ui.common.cancel` |
| `close` | Close | `ui.common.close` |
| `pause` | Pause | `ui.card.timer.actions.pause` |
| `extend` | Extend | new |
| `resume_now` | Resume now | new |
| `no_automations` | We couldn't find any automations | `ui.panel.config.automation.picker.no_automations` |
| `no_match` | No rows matching current filters | `ui.components.data-table.no_match_filter` |
| `entity_not_found` | Entity not available: {entity} | `ui.panel.lovelace.warning.entity_not_found` |
| `sensor_not_found` | The sensor of Automation Pause and Resume is not available. … | new (shown when the card finds no sensor of the integration) |
| `error_unknown` | Unknown error | `ui.common.unknown_error` |
| `error_<key>` | the backend error texts | `component.automation_pause.exceptions.<key>.message` (backend translations) |

Texts that come from `Intl` and need no string:

- The duration list ("15 minutes", "90 minutes", "2 hours", "1 week"): `Intl.NumberFormat` with `style: "unit"` and the largest unit that divides the value: week, day, hour or minute. The values come from the sensor attribute `durations`.
- Relative times ("12 minutes ago", "in 12 min."): `Intl.RelativeTimeFormat`, with the unit steps of HA's `selectUnit`.
- Dates older than 3 days: `Intl.DateTimeFormat`, as HA's `formatShortDateTimeWithConditionalYear`.

## Components and the built-in list

The card re-creates the look of `ha-config-automation-picker` with plain elements, because the `ha-*` elements are lazy-loaded and can change. A port to `home-assistant/frontend` replaces each part with the HA element.

| Card part | Built-in counterpart | Port |
|---|---|---|
| `automation-pause-card` | `ha-automation-picker` | Drop. The picker already reads `hass` and builds the rows. |
| `automation-pause-list` header (filter chip, search, sort chip) | `hass-tabs-subpage-data-table` (`ha-filter-pane-chip`, `ha-input-search`, sort `ha-dropdown`) | Drop. Add a "Paused" option to the filter pane, for example a new `ha-filter-*` element. |
| `automation-pause-list` column titles and rows | `ha-data-table` with the picker's `_columns` | Drop. Add the paused chip to the `formatted_state` column template. |
| `automation-pause-row` switch | `ha-switch` in the `formatted_state` column | Use `ha-switch`. |
| `automation-pause-row` paused chip | new | `ha-assist-chip` in the `formatted_state` column. |
| `automation-pause-row` overflow menu | `ha-dropdown` `#overflow-menu` with `ha-dropdown-item` | Add "Pause…", "Extend…" and "Resume now" items to the existing menu. |
| `automation-pause-menu` | `ha-dropdown` | Drop. |
| `automation-pause-dialog` | new | Port to an `ha-dialog` based `dialog-automation-pause.ts` with a `showAutomationPauseDialog` helper, like other config dialogs. |
| `logic.ts` | `common/` helpers | Keep filter and duration rules; use `relativeTime` and `formatShortDateTimeWithConditionalYear` from `common/datetime`. |
| `navigate()` in the card | `navigate()` from `common/navigate` | Use HA's `navigate`. |

Menu entries of the built-in list that the card leaves out: "Assign category", "Duplicate" and "Delete". They need HA's internal dialogs and registry calls.
