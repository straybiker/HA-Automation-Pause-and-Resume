# CLAUDE.md

This file guides Claude Code in this repository.

## Project

HACS custom integration `automation_pause`. It pauses any Home Assistant automation for a set time and turns it on again by itself. The pause survives a restart. The integration ships its own card (`custom:automation-pause-card`) and a sidebar dashboard that holds it.

The repository is public on GitHub (`straybiker/HA-Automation-Pause-and-Resume`). `docs/PLAN.md` is the build plan.

## Design constraints

- No helper, script or edit per automation. Every automation with an `id:` can be paused.
- `manager.py` holds all pause rules. It has no card or dashboard code, so the logic can move into the core `automation` integration later.
- Service fields match `automation.turn_off` (`entity_id`, `stop_actions`) plus `duration`.
- The card copies the look of Settings → Automations and uses HA CSS variables only. It does not use HA's internal `ha-*` elements.
- The card reads only `hass.states`, `hass.callService` and public card APIs.

## Rules

- `docs/behaviour.md` is the specification. Change it, `manager.py` and the tests together.
- Home Assistant code is async. No blocking I/O in the event loop.
- Keep hassfest and the HACS action green.
- Python 3.14. Home Assistant 2026.3 or later.
- Comments explain why. Do not write changelog comments. Git is the changelog.
- Never commit secrets, tokens, `.env` files or real entity IDs. The repository is public.
- Before every commit, review the documentation (`README.md`, `CONTRIBUTING.md`, `docs/*.md`, `CLAUDE.md`) against the change and update what is out of date.
- Keep development notes out of the repository: no dated decisions, commit hashes or conversation history in docs.
- Commit subjects: imperative, sentence case, no prefix.

## Commands

```powershell
pytest -q                 # Windows: static and translation tests; tests/ha is skipped
.\scripts\test-ha.ps1     # full suite in Docker (the HA test harness needs Linux)
ruff check .
ruff format --check .
```

- Releases: bump the version in `manifest.json` and `pyproject.toml` together; tag `v<version>`. See CONTRIBUTING.md.
- Translations: `strings.json` and `translations/en.json` must stay identical; `translations/nl.json` must have the same keys. `tests/test_translations.py` checks both.
- Run hassfest locally before pushing manifest, strings or icons changes: `docker run --rm -v "<repo>:/github/workspace" ghcr.io/home-assistant/hassfest`.
- The shell is PowerShell on Windows 11. Test Windows-facing tooling in `pwsh`, not in Git Bash.
