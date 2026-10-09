# Automation Pause and Resume

Pause any Home Assistant automation for a set time. It turns on again by itself.

Home Assistant has no "turn off for 1 hour". `automation.turn_off` lasts until someone turns the automation on again. This integration adds that time limit, with no helper, script or edit per automation.

Status: beta, in development. The build plan is in [docs/PLAN.md](docs/PLAN.md).

## Features

- Pause any automation for 15 minutes, 1 hour, 1 day, 1 week or a custom time (1 minute to 365 days).
- No helper, script or edit per automation. New automations appear with no change.
- The pause survives a Home Assistant restart. An end time that passed while Home Assistant was down resumes the automation at startup.
- A sidebar dashboard that looks like Settings → Automations, with search, filters and sort by last triggered.
- Two actions, `automation_pause.pause` and `automation_pause.resume`, for your own scripts and automations.
- A sensor that lists the pauses, and events for notifications.

## Install (HACS)

1. HACS → three-dot menu → **Custom repositories** → add `https://github.com/straybiker/HA-Automation-Pause-and-Resume`, category **Integration**.
2. Download it. A beta version (`0.x.y-beta.N`) needs **Show beta versions** on.
3. Restart Home Assistant.
4. **Settings → Devices & services → Add integration → Automation Pause and Resume.**

The integration adds the dashboard **Automation Pause and Resume** to the sidebar. It loads its own card, so there is no second HACS download and no manual dashboard resource.

Home Assistant 2026.9 or later.

## Use

Open the dashboard. Click an automation, or use **Pause…** in its ⋮ menu, and pick a duration. A paused automation shows "Resumes in …" instead of its switch. Its ⋮ menu has **Resume now** and **Extend…**.

To turn the automation on before the end, use **Resume now** or the normal switch. A manual turn-on ends the pause.

The card `custom:automation-pause-card` also works in any other dashboard:

```yaml
type: custom:automation-pause-card
```

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

### Sensor and events

- `sensor.paused_automations`: the number of pauses. Attribute `paused`: a list of `{entity_id, paused_at, resume_at}`.
- `automation_pause_started` (data: `entity_id`, `paused_at`, `resume_at`) and `automation_pause_resumed` (data: `entity_id`, `reason`: `timer`, `service`, `manual` or `removed`). Both show in the logbook.

Every rule is in [docs/behaviour.md](docs/behaviour.md).

## Options

**Settings → Devices & services → Automation Pause and Resume → Configure**:

- **Show the dashboard**: off removes the dashboard and your edits to it.
- **Dashboard name**: the name in the sidebar.
- **Rebuild the dashboard**: discards your edits and builds the dashboard again.

## Remove

When you remove the integration, it turns every paused automation on again.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
