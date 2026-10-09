# Automation Pause and Resume (HACS integration)

## Context

HA has no "disable for X time". `automation.turn_off` lasts until someone turns the automation on again.

Goal: pick any automation, pick a duration, and it turns on again by itself.

Requirements:
- No helper, script or edit per automation.
- New automations appear in the picker with no change.
- The pause survives an HA restart.
- The picker has search and sorts by last run.
- Durations: 15 minutes, 1 hour, 1 day, 1 week, custom.
- Ready to use after install: the integration ships its own dashboard.
- The dashboard looks and behaves like the built-in Settings → Automations list. This keeps a later core contribution realistic.

## Alternatives

| Option | No per-automation config | Restart-safe | Pause limit | Search + sort by last run |
|---|---|---|---|---|
| **Custom integration + bundled card + shipped dashboard (chosen)** | Yes | Yes (`Store`) | None | Yes, in own card |
| YAML package with timer slot pool | Yes | Yes | 10 | Needs `auto-entities` + `browser_mod` |
| Scheduler component | Yes | Unknown for missed runs | None | Needs extra cards |
| To-do list + 1-minute ticker | Yes | Yes | None | Needs extra cards |
| Add-on | n/a | n/a | n/a | Rejected: an add-on needs an API token and cannot reach HA state or the frontend |
| Contribute to HA core first | Yes | Yes | None | Native: action in Settings → Automations |

The chosen option has no cap, no startup gap and no extra HACS cards. The cost is one new codebase with tests and frontend work.

A core contribution is the only way to put the pause action into the built-in Settings → Automations page. It needs two reviews (`home-assistant/core` and `home-assistant/frontend`) and a proposal to the maintainers first. Acceptance is not certain, and a forum request for this feature drew the reply that a script can do it. So the integration comes first and the core proposal follows with a working version as evidence.

## Findings that shape the design

- Live HA has 91 automations. 90 have an `id:`. `packages/wh52.yaml:23` has none.
- `automation.turn_off` survives a restart only when the automation has an `id:`. Without it, the automation returns to `on` after a restart.
- Built-in cards cannot list all automations, search them or sort them. The picker needs a custom card.
- `HA EV Charge Control` is the template for repo, CI, tests and dashboard. Reuse:
  - `dashboard.py`: integration-owned Lovelace storage panel.
    - Registered in `async_setup_entry` after the platforms. A failure only logs a warning, because the code uses Lovelace internals.
    - Removed on unload (`async_on_unload`). Store removed on entry removal.
    - The stored config is built once. A reload and an upgrade keep user edits. A "Rebuild the dashboard" option resets it.
    - Built again once at `async_at_started` if HA was still starting and the stored config is still the first one.
  - Config flow: `dashboard` toggle and `dashboard_title` in the first step and in the options flow, plus the `dashboard_rebuild` action.
  - `manifest.json` with `after_dependencies: ["frontend", "lovelace"]`, `iot_class: calculated`.
  - `tests/ha/test_dashboard.py` (fixture `async_setup_component(hass, "lovelace", {})`), `test_manifest.py`, `test_translations.py`, `conftest.py` with `collect_ignore = ["ha"]` when `pytest-homeassistant-custom-component` is missing (Windows), `scripts/test-ha.ps1` + `ha-tests.Dockerfile` for the full run.
  - CI: `test.yml` (pytest on Python 3.14, weekly cron, separate pinned `ruff check` + `ruff format --check` job), `validate.yml` (hassfest + `hacs/action`), `release.yml` (tag must equal `manifest.json` version).
  - Repo files: `CLAUDE.md`, `CONTRIBUTING.md`, `docs/`, `brand/` icons (256 and 512 px), `strings.json` identical to `translations/en.json`, plus `nl.json`.
  - Release: same version in `manifest.json` and `pyproject.toml`, GitHub release with tag `v<version>`, pre-releases `0.x.y-beta.N`.
  - Commit subjects: imperative, sentence case, no prefix.
- Neither EV Charge Control nor the other integrations ship JS. The card, its build and its registration are new work.

## Design

### Repo

Name: "Automation Pause and Resume". New repo `straybiker/HA-Automation-Pause-and-Resume`, local folder `C:\Users\stray\OneDrive\Projects\HA Automation Pause and Resume`. Integration domain `automation_pause` (short; services read `automation_pause.pause` and `automation_pause.resume`).

```
custom_components/automation_pause/
  __init__.py        setup, services, card + dashboard registration
  manager.py         PauseManager: store, timers, rules
  sensor.py          paused automations sensor
  dashboard.py       integration-owned dashboard (EV Charge Control pattern)
  frontend.py        static path + extra JS registration
  config_flow.py     single instance, dashboard options
  const.py  services.yaml  strings.json  icons.json  diagnostics.py
  translations/en.json  nl.json
  brand/
  manifest.json      integration_type: service, iot_class: calculated,
                     single_config_entry: true,
                     dependencies: automation, http, frontend
                     after_dependencies: lovelace
  frontend/automation-pause-card.js    built bundle, committed
frontend-src/        TypeScript + Lit + esbuild, vitest
tests/  tests/ha/
scripts/test-ha.ps1  ha-tests.Dockerfile
docs/  CLAUDE.md  CONTRIBUTING.md  README.md  LICENSE
hacs.json  pyproject.toml  requirements-dev.txt
.github/workflows/test.yml  validate.yml  release.yml
```

### Services

- `automation_pause.pause`
  - `entity_id`: one or more `automation.*` (entity selector).
  - `duration`: duration selector, `enable_day: true`. Minimum 1 minute, maximum 365 days.
  - `stop_actions`: boolean, default `true` (same default as `automation.turn_off`).
- `automation_pause.resume`
  - `entity_id`: one or more `automation.*`.

Errors use `ServiceValidationError` with translated messages, so the card can show them.

### Engine (`manager.py`)

Stored in `Store` (key `automation_pause`, version 1):
`{entity_id: {paused_at, resume_at}}` in UTC ISO format. The manager only accepts pauses on automations that are `on`, so every stored pause means "turn on at the end".

`pause`:
1. Reject if the entity is missing, `unavailable`, has no `id` attribute, or is not an automation.
   Reason for the `id` rule: without an `id`, HA turns the automation on again after a restart or reload. The pause would silently break. The error text says to add an `id:`.
2. Already paused: replace `resume_at` with now + duration. Do not stack. Keep the original `paused_at`.
3. Not paused and state `off`: reject with "already off, nothing to pause". Reason: the automation is re-enabled only if it was on when the pause began.
4. Otherwise: call `automation.turn_off` with our own `Context`, save the store, schedule `async_track_point_in_utc_time`, update the sensor.

`resume` (timer, service or startup):
1. Cancel the timer. Remove the entry. Save.
2. If the state is `off`, call `automation.turn_on`.

Manual change rule:
- One `async_track_state_change_event` listener covers all paused entities.
- A change to `on` with a context other than ours drops the pause. Do not call `turn_on`.
- `unavailable` is ignored (reload).
- Entity removed: drop the pause.

Startup (`async_at_started`):
- Overdue: resume now.
- Not overdue and state `off`: schedule the timer.
- Not overdue and state `on` (changed while HA was down): drop the pause.
- Entity gone: drop the pause.

Bus events `automation_pause_started` and `automation_pause_resumed` (data: entity_id, reason `timer` / `service` / `manual` / `removed`). Users can add notifications on them. They appear in the logbook.

### Sensor

`sensor.paused_automations`:
- State: count of paused automations.
- Attribute `paused`: list of `{entity_id, paused_at, resume_at}`.

### Card (`custom:automation-pause-card`)

Loading (`frontend.py`): `hass.http.async_register_static_paths` plus `frontend.add_extra_js_url`, with `?v=<manifest version>` for cache busting. No manual resource entry. The card appears in the card picker through `window.customCards`.

Look and feel: the card copies the built-in Settings → Automations list (`ha-config-automation-picker`), so a later core proposal can show a 1:1 screenshot and the UI code ports to `home-assistant/frontend` with little change.
- Flat, full-width layout. No card border and no custom title bar. Inside the dashboard panel it sits under the standard HA toolbar.
- Header row, as in the built-in list:
  - Search field "Search automations".
  - Filter button with a status filter: All, Enabled, Disabled, Paused.
  - Sort menu: Last triggered (default, newest first, never-run last), Name, Status (paused first).
- Table rows, as in the built-in list:
  - Name, with the area as a second line when the automation has one.
  - Last triggered as relative time, "Never" when empty.
  - Status: the same enabled switch as the built-in list. A paused row shows a chip "Resumes in 12 min" instead.
  - Overflow menu (⋮) with the built-in entries kept in the same order where they make sense, plus a pause entry.
- Pause flow: select the automation (row click, or "Pause…" in the ⋮ menu). A dialog styled like `ha-dialog` lists the durations as list items: 15 minutes, 1 hour, 1 day, 1 week, Custom (number + unit). Pick one, press "Pause".
- Paused row menu: "Resume now" and "Extend…" (same dialog).
- Rows for automations without `id` or already off cannot be paused. The dialog explains why.
- Behavior and data:
  - Reads every `automation.*` state from `hass.states`. New automations appear without change.
  - Search is case- and accent-insensitive on name and entity id.
  - Countdown refreshes every 30 s. Service errors show in the dialog.
- Look: HA CSS variables only (light and dark), Roboto/HA typography, 16 px gutters, 44 px minimum touch targets. Works at phone width.
- Strings: use HA's own wording where HA has a string ("Search automations", "Last triggered", "Never"). A table in `docs/` maps each string to its `home-assistant/frontend` translation key for the port. EN and NL, chosen by `hass.language`.
- Config: `entity` (default `sensor.paused_automations`). No visual editor in v1.

Build and code style:
- TypeScript (strict) + Lit 3, the stack of `home-assistant/frontend`. ESLint and Prettier config copied from that repo, so ported code passes its lint.
- Small components (`list`, `row`, `pause-dialog`) with no dependency on each other beyond props and events. Easier to move into the frontend repo.
- Do not use HA's internal `ha-*` elements. They are lazy-loaded and can change. The card re-creates their look with HA CSS variables.
- esbuild bundles into one file. The bundle is committed, so HACS needs no release asset. CI fails if the committed bundle differs from a fresh build.

### Dashboard (`dashboard.py`)

Copy the EV Charge Control pattern with these differences:
- Title "Automation Pause and Resume", icon `mdi:timer-pause-outline`.
- One view of type `panel` that holds `custom:automation-pause-card`. The card fills the page like the built-in Automations page. The integration always registers the card, so the dashboard has no HACS dependency.
- If a Lovelace view cannot match the built-in page closely enough (toolbar, spacing), fall back to a custom panel (`panel_custom`) that hosts the same element. Decide during the frontend phase, with screenshots next to the built-in page.
- Options in the config flow: `dashboard` (default on), `dashboard_title`, `dashboard_rebuild`.
- The card also works in any other dashboard.

### Core-compatible design

Keep the integration easy to move into core:
- `manager.py` holds all rules and has no card or dashboard code. Core would host the same logic in the `automation` integration.
- Service fields match `automation.turn_off` (`entity_id`, `stop_actions`) plus `duration`. A core version is then a new field on an existing action.
- `docs/behaviour.md` states every rule (extend, no stacking, was-on only, manual change drops the pause, startup handling). It becomes the specification in the proposal.
- The card and dashboard stay outside `manager.py`. In core, the frontend repo replaces them with an action in the automation list and editor menus.

## Install (HACS)

Yes, through HACS as a custom repository. HACS needs a public GitHub repo with `custom_components/automation_pause/` and a root `hacs.json`.

1. HACS → three-dot menu → Custom repositories → add `https://github.com/straybiker/HA-Automation-Pause-and-Resume`, category Integration.
2. Download it. Pre-releases (`0.x.y-beta.N`) need "Show beta versions" on.
3. Restart HA.
4. Settings → Devices & services → Add integration → "Automation Pause and Resume". One click. It adds the sidebar dashboard.

The integration registers its own card. There is no second HACS install for the card, and no manual dashboard resource.

After release, the HA MCP tools (`ha_manage_hacs`) can do steps 1 to 3 on the live instance. Each step needs user approval at that time. Listing in the default HACS store is optional and comes later.

## Bootstrap and hand-off (this session, after plan approval)

1. Create the local folder `C:\Users\stray\OneDrive\Projects\HA Automation Pause and Resume` (same style as `HA EV Charge Control`). Run `git init -b main`.
2. Add: `README.md` (stub), `LICENSE` (MIT, same as `HA-EV-Charge-Control`), `.gitignore`, and this plan as `docs/PLAN.md`. Commit.
3. Create the GitHub repo and push: `gh repo create straybiker/HA-Automation-Pause-and-Resume --public --source . --push`. The `gh` login is `straybiker` with `repo` and `workflow` scopes. Set the description and topics `home-assistant`, `hacs`, `custom-component`, `automation`. Public publish: covered by the approval of this plan.
4. Hand off: open a new session with that folder as its working directory (the Claude desktop app's `spawn_task` with `cwd` can start it). Its first prompt: read `docs/PLAN.md` and start at phase 1.
5. This session stops after the hand-off. Phases 1 to 8 run in the new session.

## Phases

1. Skeleton: `manifest.json`, `hacs.json`, `pyproject.toml`, LICENSE (MIT, confirm), CI workflows, `CLAUDE.md`, brand icons.
2. Backend: `manager.py`, services, sensor, config flow, diagnostics, translations, tests.
3. Dashboard: `dashboard.py`, options, tests (adapt `test_dashboard.py`).
4. Frontend: card, pure-logic tests (filter, sort, relative time), build, bundle commit, `frontend.py`.
5. Release `v0.1.0-beta.1`: GitHub release with the tag, marked as pre-release. Needs user approval.
6. Live install: add the repo to HACS as a custom repository, restart, add the integration, open the new dashboard.
7. Optional: add `id:` to the automation in `packages/wh52.yaml:23` so it can be paused. This is the only change in the HomeAssistant repo.
8. Upstream proposal, after the beta has run on live HA and the rules are stable:
   - Write the proposal from `docs/behaviour.md`: problem, user stories, API (`duration` on `automation.turn_off`), storage, UI, screenshots of the card, and the forum request as evidence of demand.
   - Check the current HA contribution docs for where it goes (feature request or architecture discussion). Post it. Needs user approval before anything is published.
   - If the maintainers accept: core PR (`automation` integration, tests, home-assistant.io docs) and frontend PR (action in the automation list and editor menus).
   - When a core release ships the action: release a last integration version that warns and points to the native action, then archive the repo.
   - If the maintainers decline: keep the integration.

## Tests

Backend: `pytest` with `pytest-homeassistant-custom-component` (real `hass` fixture, `async_fire_time_changed`), as in EV Charge Control. Run on Windows with `scripts/test-ha.ps1` (Docker).

Cases:
- Pause turns the automation off, stores the entry, schedules the resume. Resume turns it on.
- Second pause replaces `resume_at`. No stacking.
- Pause on an `off` automation is rejected.
- Pause on an automation without `id` is rejected.
- Manual turn-on during a pause drops it. The timer does not turn the automation on again later.
- `unavailable` blip during a pause keeps the pause.
- Entity removed during a pause drops the pause.
- Store round trip, and restart with future, overdue, `on` and missing entries.
- Our own `Context` is not mistaken for a manual change.
- Duration bounds. Multi-entity calls.
- Sensor state and attribute after each step.
- Dashboard: in the sidebar, edits survive a reload, rebuild discards edits, option off removes it, a dashboard failure does not stop the entry.
- Static: manifest keys, version equals `pyproject.toml`, `strings.json` equals `translations/en.json`, `nl.json` has the same keys.

Frontend: `vitest` for filter, sort, countdown text and duration parsing.

CI: pytest, ruff, hassfest, `hacs/action`, release tag check, frontend typecheck + test + build + bundle-is-current check.

## Verification (live HA)

Use a harmless test automation. Do not use EMS, EMHASS or EV automations.

1. "Automation Pause and Resume" shows in the sidebar after the integration is added. Its list, placed next to Settings → Automations in light and dark theme, has the same header, row layout, spacing and relative-time text. Keep the side-by-side screenshots for the core proposal.
2. Pause 15 min from the card: automation `off`, sensor lists it, countdown runs.
3. Wait for the end: automation `on`, sensor empty, `automation_pause_resumed` event with reason `timer`.
4. Pause again while paused: new end time, one entry.
5. "Resume now": automation `on` at once.
6. Turn the automation on by hand during a pause: pause disappears, no later turn-on.
7. Restart HA during a pause: automation stays `off`, countdown continues, then resumes.
8. Stop HA, wait past the end time, start HA: automation resumes at start.
9. Run `automation.reload` during a pause: pause stays.
10. Try the `wh52` automation (no `id`): clear error, row dimmed.
11. Search narrows the list. Sort by last run puts the most recent first. Create a new automation: it appears with no config.
12. Edit the dashboard, reload the integration: edits stay. "Rebuild the dashboard": edits reset.
13. Phone width: no horizontal scroll, chips are tappable.

## Risks

- The dashboard uses Lovelace internals (`LovelaceStorage`, `LOVELACE_DATA`). A failure logs a warning. The card and services keep working.
- A second author writing to the same automation (UI toggle, other integration) is treated as a manual change. This is intended.
- HA frontend internals can change. The card only uses `hass.states`, `hass.callService` and public card APIs, so the exposure is small.
- HACS custom repositories must be public. Nothing in the repo may hold secrets or live HA details (entity ids, hosts, tokens).
