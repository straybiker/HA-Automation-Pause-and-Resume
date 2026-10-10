# Automation Pause and Resume

Pause any Home Assistant automation for a set time. It turns on again by itself.

Home Assistant has no "turn off for 1 hour". `automation.turn_off` lasts until someone turns the automation on again. This integration adds that time limit, with no helper, script or edit per automation.

Status: beta, in development. The build plan is in [docs/PLAN.md](docs/PLAN.md).

## Features

- Pause any automation for a duration from the list or a custom time (1 minute to 365 days). The list is 15 minutes, 1 hour, 1 day and 1 week; you can change it under Options.
- No helper, script or edit per automation. New automations appear with no change.
- The pause survives a Home Assistant restart. An end time that passed while Home Assistant was down resumes the automation at startup.
- A sidebar dashboard that looks like Settings → Automations, with search, filters and sort by last triggered.
- Two actions, `automation_pause.pause` and `automation_pause.resume`, for your own scripts and automations.
- A sensor that lists the pauses, and events for notifications.

## Use cases

- **Holidays.** Pause the morning routines and the wake-up lights for the week you are away. They turn on again on the day you come home.
- **Guests.** Pause the motion lights in the guest room and the presence-based heating while guests stay.
- **Maintenance.** Pause the pool pump or the irrigation for a day while you repair it. You cannot forget to turn it on again.
- **Seasons.** Pause the garden watering for the winter, for up to 365 days. It turns on again in spring.
- **A quick break.** Pause a noisy notification for an hour from the dashboard.

## Install (HACS)

1. HACS → three-dot menu → **Custom repositories** → add `https://github.com/straybiker/HA-Automation-Pause-and-Resume`, category **Integration**.
2. Download it. A beta version (`0.x.y-beta.N`) needs **Show beta versions** on.
3. Restart Home Assistant.
4. **Settings → Devices & services → Add integration → Automation Pause and Resume.**

The setup asks two things:

- **Add a dashboard** (on by default): adds the dashboard to the sidebar. You can add or remove it later under **Configure**.
- **Dashboard name** (default "Automation Pause and Resume"): the name in the sidebar. It also sets the address of the dashboard.

The integration loads its own card, so there is no second HACS download and no manual dashboard resource.

Home Assistant 2026.9 or later.

## Use

Open the dashboard. Click an automation, or use **Pause…** in its ⋮ menu, and pick a duration. A paused automation shows "Resumes in …" instead of its switch. Its ⋮ menu has **Resume now** and **Extend…**.

To turn the automation on before the end, use **Resume now** or the normal switch. A manual turn-on ends the pause.

The list remembers its sort and filter in each browser, as Settings → Automations does. The search starts empty.

The card `custom:automation-pause-card` also works in any other dashboard:

```yaml
type: custom:automation-pause-card
```

The card finds the sensor of the integration by itself. To read another sensor, add `entity: sensor.<id>`.

### Limits

- The automation needs an `id:`. Without an `id`, Home Assistant turns it on again after a restart or reload, and the pause would break. Automations made in the UI always have one. For a YAML automation, add `id:` with any unique text.
- Only an automation that is on can be paused. The end of the pause turns it on again.
- A second pause replaces the end time. Pauses do not add up.

### Actions

```yaml
action: automation_pause.pause
target:
  entity_id: automation.example
data:
  duration:
    hours: 2
  stop_actions: true   # optional, same as automation.turn_off
```

```yaml
action: automation_pause.resume
target:
  entity_id: automation.example
```

Targets can also be devices, areas or labels; only their automations count.

When an automation does not turn on at the end, its pause stays. The `resume` action then fails with "could not be turned on".

### Sensor and events

- The sensor **Paused automations** belongs to the service device **Automation Pause and Resume**. State: the number of pauses. Attribute `paused`: a list of `{entity_id, paused_at, resume_at}`. Attribute `durations`: the list of the pause dialog in minutes, for example `[15, 60, 1440, 10080]`. The recorder does not keep `durations`.
  - A new install names it `sensor.automation_pause_and_resume_paused_automations`. An older install keeps `sensor.paused_automations`.
- `automation_pause_started` (data: `entity_id`, `paused_at`, `resume_at`) and `automation_pause_resumed` (data: `entity_id`, `reason`: `timer`, `service`, `manual` or `removed`). Both show in the logbook.

Every rule is in [docs/behaviour.md](docs/behaviour.md).

## Examples

### Pause the motion lights while guests stay

A toggle helper `input_boolean.guests` marks a visit. The lights pause for at most a week and come back when the guests leave.

```yaml
alias: Guests pause the motion lights
triggers:
  - trigger: state
    entity_id: input_boolean.guests
actions:
  - if:
      - condition: state
        entity_id: input_boolean.guests
        state: "on"
    then:
      - action: automation_pause.pause
        target:
          entity_id: automation.guest_room_motion_lights
        data:
          duration:
            days: 7
    else:
      # Fails when the pause has already ended; that is fine here.
      - action: automation_pause.resume
        target:
          entity_id: automation.guest_room_motion_lights
        continue_on_error: true
```

### Tell me when a pause ends

For a notification in Home Assistant, turn on **Notify when a pause ends** under Options. For a message on your phone, use an automation on the event:

```yaml
alias: Notify when a pause ends
triggers:
  - trigger: event
    event_type: automation_pause_resumed
    event_data:
      reason: timer
actions:
  - action: notify.notify
    data:
      message: "{{ state_attr(trigger.event.data.entity_id, 'friendly_name') }} is on again."
```

### Skip the watering when rain is forecast

Give the watering automations the label "Garden". One action pauses all of them.

```yaml
alias: Rain pauses the watering
triggers:
  - trigger: numeric_state
    entity_id: sensor.rain_forecast_today
    above: 5
actions:
  - action: automation_pause.pause
    target:
      label_id: garden
    data:
      duration:
        days: 2
```

## Options

**Settings → Devices & services → Automation Pause and Resume → Configure**:

- **Show the dashboard**: off removes the dashboard and your edits to it.
- **Dashboard name**: the name in the sidebar.
- **Admin only**: only administrators see the dashboard in the sidebar.
- **Rebuild the dashboard**: discards your edits and builds the dashboard again.
- **Notify when a pause ends**: a Home Assistant notification (the bell in the sidebar) when the timer ends a pause, also when the end time passed while Home Assistant was down. A resume by you, by an action or with the switch gives no notification. A new end of the same automation replaces its notification.
- **Durations in the pause dialog**: the choices in the dialog of the card. A new install starts with 15 minutes, 1 hour, 1 day and 1 week.
  - Pick from the list (5 minutes to 4 weeks), or type your own value: a number and a unit, `m` (minutes), `h` (hours), `d` (days) or `w` (weeks). For example `45m`, `2h`, `3d` or `2w`. From 1 minute to 365 days.
  - The integration sorts the list from short to long and keeps each length of time once: `60m` and `1h` are the same. It stores the largest whole unit, so `60m` becomes `1h`.
  - **Custom** is always the last item in the dialog. With an empty list, the dialog shows only Custom.
  - The list only sets the choices in the card. The `pause` action takes any duration from 1 minute to 365 days.

Change this dashboard here, under **Configure**. The dialog in Settings → Dashboards cannot save it.

To hide the dashboard only for yourself, use Home Assistant's own sidebar edit: long-press the sidebar title.

## Troubleshooting

### "… has no id"

The automation has no `id:`, so a restart or reload would turn it on again. Add `id:` with any unique text to the automation in YAML, then reload the automations.

### The dashboard is not in the sidebar

1. Open **Configure** and check that **Show the dashboard** is on.
2. If **Admin only** is on, only administrators see it.
3. You may have hidden it in your own sidebar. Long-press the sidebar title to show it again.
4. If the dashboard is empty or broken, turn on **Rebuild the dashboard**.

### The card does not load

The card shows "Custom element doesn't exist: automation-pause-card", or the old card after an update.

1. Restart Home Assistant after a HACS download.
2. Reload the page without the browser cache: Ctrl+F5, or Cmd+Shift+R on a Mac.
3. In the Companion app: **Settings → Companion app → Debugging → Reset frontend cache**.

### The card says the sensor is not available

The integration is not loaded, or its sensor is disabled. Open **Settings → Devices & services → Automation Pause and Resume** and check the entry. If the sensor **Paused automations** is disabled, enable it.

### "… could not be turned on. The pause stays."

Home Assistant did not turn the automation on. The pause stays, so the automation is not forgotten. Look in the log for the cause, then use **Resume now** again.

### The logbook does not show the pauses

The logbook reads the recorder. If your `recorder:` excludes the automation, or the events `automation_pause_started` and `automation_pause_resumed`, the logbook cannot show the pauses. Remove those excludes.

### Debug logging and diagnostics

1. **Settings → Devices & services → Automation Pause and Resume**, ⋮ → **Enable debug logging**.
2. Repeat the problem.
3. ⋮ → **Disable debug logging**. The browser downloads the log.
4. ⋮ → **Download diagnostics** for the stored pauses and the running timers.

Attach both files to an [issue](https://github.com/straybiker/HA-Automation-Pause-and-Resume/issues).

## Remove

1. **Settings → Devices & services → Automation Pause and Resume**, ⋮ → **Delete**. The integration turns every paused automation on again and deletes its dashboard.
2. In HACS, open **Automation Pause and Resume**, ⋮ → **Remove**.
3. Restart Home Assistant.

## Quality

The integration is self-assessed against the [Integration Quality Scale](https://developers.home-assistant.io/docs/core/integration-quality-scale/) rules up to Platinum. See [quality_scale.yaml](custom_components/automation_pause/quality_scale.yaml). This is not an official tier: Home Assistant gives tiers to core integrations only.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
