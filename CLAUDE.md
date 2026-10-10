# CLAUDE.md

This file guides Claude Code in this repository.

## Project

HACS custom integration `automation_pause`. It pauses any Home Assistant automation for a set time and turns it on again by itself. The pause survives a restart. The integration ships its own card (`custom:automation-pause-card`) and a sidebar dashboard that holds it.

The repository is public on GitHub (`straybiker/HA-Automation-Pause-and-Resume`). `docs/PLAN.md` is the build plan.

## Design constraints

- No helper, script or edit per automation. Every automation with an `id:` can be paused.
- `manager.py` holds all pause rules. It has no card or dashboard code, so the logic can move into the core `automation` integration later.
- Service fields match `automation.turn_off` (`entity_id`, `stop_actions`) plus `duration`.
- The card copies the look of Settings → Automations and uses HA CSS variables only. It does not use HA's internal `ha-*` elements. Two exceptions, both defined on every dashboard: `ha-icon` draws an automation's own icon (without it the row shows the robot), and `ha-card` holds the list, so dashboard themes and card-mod style it like any other card.
- The card reads only `hass.states`, `hass.entities` (areas, icons, and the platform that finds the sensor), `hass.callService` and public card APIs.

## Rules

- `docs/behaviour.md` is the specification. Change it, `manager.py` and the tests together.
- Home Assistant code is async. No blocking I/O in the event loop.
- Keep hassfest and the HACS action green.
- Python 3.14. Home Assistant 2026.9 or later (`hacs.json`). CI tests the oldest supported release (`requirements-dev-oldest.txt`) and the newest (`requirements-dev.txt`).
- Comments explain why. Do not write changelog comments. Git is the changelog.
- Never commit secrets, tokens, `.env` files or real entity IDs. The repository is public.
- Before every commit, review the documentation (`README.md`, `CONTRIBUTING.md`, `docs/*.md`, `CLAUDE.md`) against the change and update what is out of date.
- Keep development notes out of the repository: no dated decisions, commit hashes or conversation history in docs.
- Commit subjects: imperative, sentence case, no prefix.

## Commands

```powershell
pytest -q                 # Windows: static and translation tests; tests/ha is skipped
.\scripts\test-ha.ps1     # full suite in Docker (the HA test harness needs Linux)
.\scripts\test-ha.ps1 -Oldest   # the same with the oldest supported Home Assistant
ruff check .
ruff format --check .
mypy                      # strict typing of the integration (pyproject.toml)
cd frontend-src; npm ci; npm run typecheck; npm run lint; npm test; npm run build
```

- The card bundle `custom_components/automation_pause/frontend/automation-pause-card.js` is committed. Rebuild it with `npm run build` after every change in `frontend-src/` and commit both. CI fails when it is not current.
- Releases: bump the version in `manifest.json` and `pyproject.toml` together; tag `v<version>`. See CONTRIBUTING.md.
- Test report: every release rebuilds `docs/test-report.md` and `.html` and commits them. Run `.venv\Scripts\python.exe scripts/report/collect.py` (all checks locally; Docker and Node) or `collect.py --ci` (the finished CI run of the pushed HEAD), then `scripts/report/build.py`. Raw results go to `build/report/` (git-ignored). Live results are hand-kept in `docs/live-verification.json`. `tests/test_report.py` fails when the report does not name the manifest version.
- Translations: `strings.json` and `translations/en.json` must stay identical; `translations/nl.json` must have the same keys. `tests/test_translations.py` checks both.
- Run hassfest locally before pushing manifest, strings or icons changes: `docker run --rm -v "<repo>:/github/workspace" ghcr.io/home-assistant/hassfest`.
- The shell is PowerShell on Windows 11. Test Windows-facing tooling in `pwsh`, not in Git Bash.
