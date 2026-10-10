# Behaviour

This is the specification of a pause. `manager.py` implements it. The tests in `tests/ha/` check it. Change all three together.

## Terms

- **Pause**: an automation that the integration turned off and must turn on again at a set time.
- **End time** (`resume_at`): the time the pause ends.
- **Start time** (`paused_at`): the time the pause began.
- **Our context**: the `Context` the integration puts on its own `turn_off` and `turn_on` calls. It marks a state change as ours.

All times are stored and sent in UTC, as ISO 8601 text.

## Actions

### `automation_pause.pause`

| Field | Required | Default | Value |
|---|---|---|---|
| target | yes | | Automations, or devices, areas or labels that hold automations |
| `duration` | yes | | 1 minute to 365 days, both included |
| `stop_actions` | no | `true` | Same as `automation.turn_off` |

### `automation_pause.resume`

| Field | Required | Value |
|---|---|---|
| target | yes | Paused automations, or devices, areas or labels that hold them |

### Targets

- An entity named in the call must be an `automation.*` entity. Otherwise the call fails with `not_automation`.
- A device, area or label can hold other entities. Only its automations count.
- No automation in the target: the call fails with `no_entities`.
- No loaded config entry: the call fails with `not_loaded`.

### All or nothing

The integration checks every automation in the call first. If one check fails, the call fails and nothing changes.

A failed turn-on at the end of a pause is not a check. See "The turn-on fails".

## Pause

### Checks

The target checks (see Targets) run first. Then these checks run, in this order. The first failure stops the call.

| Check | Error |
|---|---|
| Duration below 1 minute | `duration_too_short` |
| Duration above 365 days | `duration_too_long` |
| No state | `not_found` |
| State `unavailable` or `unknown` | `unavailable` |
| No `id` attribute | `no_id` |
| Not paused and state `off` | `already_off` |

Why the `id` rule: without an `id`, Home Assistant turns the automation on again after a restart or reload. The pause would break without notice.

Why the `off` rule: the end of a pause turns the automation on. That is only correct for an automation that was on when the pause began.

### A new pause

1. Call `automation.turn_off` with `stop_actions` and our context.
2. Store the pause.
3. Start a timer for the end time.
4. Update the sensor.
5. Fire `automation_pause_started`.

### A pause of a paused automation

The pauses do not stack.

- The new end time is now + duration. It replaces the old end time, also when the old one is later.
- The start time stays.
- There is no second `turn_off`.
- `automation_pause_started` fires again, with the new end time.

## End of a pause

A pause ends by the timer, by the resume action, or at startup when the end time has passed.

1. If the automation is `off`, call `automation.turn_on` with our context.
2. Stop the timer.
3. Remove the pause from the store.
4. Fire `automation_pause_resumed`.

Resume of an automation that is not paused fails with `not_paused`.

### The automation is unavailable at the end

Home Assistant cannot turn on an unavailable automation. When it is available again, it restores `off`. So the pause waits:

- The pause stays, with its end time in the past. A warning goes to the log.
- When the automation shows `off` again, the pause ends at once (reason `timer`).
- The resume action ends the pause at any time.

### The turn-on fails

The pause stays. No event fires. An automation that stays off with no pause would never turn on again, and nobody would see it.

- **Resume action:** the call fails with `turn_on_failed`. This is a `HomeAssistantError`, not a validation error. The end time and the timer do not change. The other automations in the call resume as usual.
- **Timer or startup:** there is no caller, so a warning goes to the log. The pause waits with its end time in the past, as for an unavailable automation. It ends when the automation shows `off` again, at the next start, by the resume action, or by a manual turn-on.

## Changes from outside

One state listener watches all paused automations.

| Change | Result |
|---|---|
| State `on` with a context that is not ours | The pause ends. No `turn_on`. Reason `manual`. |
| State `on` with our context | Nothing. |
| State `unavailable` or `unknown` | Nothing. A reload makes a changed automation unavailable for a moment. |
| State removed | Nothing. A rename removes the state and adds it again. |
| Registry entry removed | The pause ends. No `turn_on`. Reason `removed`. The automation editor removes the entry when the user deletes an automation. |
| Registry entry renamed | The pause moves to the new entity ID. The end time and the timer stay. |

A second author that turns the automation on, such as the UI toggle or another integration, is a manual change. This is intended.

### Reload

`automation.reload` adds a changed automation again. It restores its last state, `off`. The pause stays.

### Rename

Home Assistant adds a renamed automation again under the new entity ID. It finds no saved state for that ID, so it turns the automation on. This is not a manual change. The integration turns the automation off again with our context and keeps the pause.

## Startup

The stored pauses load with the config entry. The startup rules run when Home Assistant has started, so every automation is loaded. For each stored pause:

| Situation | Result |
|---|---|
| No state and no registry entry | The pause ends. Reason `removed`. |
| State `on` (turned on while Home Assistant was down) | The pause ends. No `turn_on`. Reason `manual`. |
| End time passed | The pause ends now, as at the end of a pause. Reason `timer`. |
| Otherwise (`off`, or unavailable) | The timer starts. |

During the start, the actions work as usual. A pause made then gets its timer at once.

## Removal of the integration

When the user removes the integration, it turns on every stored automation that is `off`. Then it deletes the store. After the integration is gone, nothing else would turn them on.

## Store

- Key `automation_pause`, version 1.
- Content: `{entity_id: {"paused_at": iso, "resume_at": iso}}`.
- An entry that cannot be read is skipped with a warning.

## Events

| Event | Data |
|---|---|
| `automation_pause_started` | `entity_id`, `paused_at`, `resume_at` |
| `automation_pause_resumed` | `entity_id`, `reason`: `timer`, `service`, `manual` or `removed` |

Both events show in the logbook of the automation: "paused until 2026-10-09 18:00" (local time) and "resumed (timer)".

## Notification

With the option **Notify when a pause ends**, a Home Assistant notification shows when a pause ends with reason `timer`. That includes an end time that passed while Home Assistant was down.

- Other reasons (`service`, `manual`, `removed`) give no notification. The user caused them, or the automation is gone.
- One notification per automation. A later end replaces it.
- `notification.py` listens to `automation_pause_resumed`. `manager.py` does not know about it.

## Sensor

The sensor **Paused automations** belongs to the service device **Automation Pause and Resume**, one per config entry.

- State: the number of pauses.
- Attribute `paused`: a list of `{entity_id, paused_at, resume_at}`, the first to end first.
- Attribute `durations`: the durations of the card's pause dialog, in whole minutes, short to long. See Durations. The recorder does not keep it: it changes only with the options.

The entity ID is not fixed. A new install gets `sensor.automation_pause_and_resume_paused_automations` (device name, then entity name). The entity registry keeps the ID of an older install, `sensor.paused_automations`. The card finds the sensor by its platform, `automation_pause`, so every ID works. The card option `entity` overrides this.

## Durations

The option **Durations in the pause dialog** sets the choices in the card's pause dialog. It changes no pause rule: the actions still take any duration from 1 minute to 365 days.

- Value: a number and a unit, `m`, `h`, `d` or `w`, from 1 minute to 365 days. Upper case and spaces are accepted. Any other value fails with `invalid_duration` and nothing is saved.
- Stored: sorted short to long, each length of time once, in the largest whole unit (`60m` is stored as `1h`, `7d` as `1w`).
- An entry without the option uses the default: `15m`, `1h`, `1d`, `1w`. A new install has no option until the user saves the options.
- An empty list is valid. The dialog then shows only Custom.
- The card reads the sensor attribute `durations`. Without it (an older backend) the card uses the default list. Custom is always the last item.

## Diagnostics

The download holds the stored pauses, the number of running timers, and whether the startup rules have run.
