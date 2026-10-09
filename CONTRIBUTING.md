# Contributing

Thank you for your help. Report bugs and ideas as [issues](https://github.com/straybiker/HA-Automation-Pause-and-Resume/issues). For a pull request, read this file first.

## Read first

- [docs/behaviour.md](docs/behaviour.md): the specification of the pause rules.
- [docs/frontend-strings.md](docs/frontend-strings.md): the card's strings and how its parts map to Home Assistant's own automation list.

## Development setup

Python 3.14 is necessary.

**Linux, macOS or CI:** the full suite.

```bash
pip install -r requirements-dev.txt
pytest -q
```

**Oldest supported release:** `requirements-dev-oldest.txt` pins the test harness of the oldest Home Assistant release in `hacs.json`. CI runs the suite with both files. Raise both together.

**Windows:** the Home Assistant test harness needs Linux (it imports `fcntl`). Run the static and translation tests natively; `tests/ha` is skipped there.

```powershell
pip install -r requirements-dev-windows.txt
pytest -q
```

Run the full suite in Docker. All arguments go to pytest:

```powershell
.\scripts\test-ha.ps1
.\scripts\test-ha.ps1 tests/ha -x
.\scripts\test-ha.ps1 -Oldest     # with the oldest supported Home Assistant
```

**Lint and format** with the version that CI uses (pinned in the requirements files):

```bash
ruff check .
ruff format --check .
```

**Strict typing** of the integration. The settings are in `pyproject.toml` (`[tool.mypy]`):

```bash
mypy
```

**hassfest** after a change to the manifest, strings, translations or icons:

```bash
docker run --rm -v "$PWD:/github/workspace" ghcr.io/home-assistant/hassfest
```

## Card

The card's source is in `frontend-src/` (TypeScript, Lit, esbuild, vitest). Use the Node version in `frontend-src/.nvmrc`.

```bash
cd frontend-src
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` writes `custom_components/automation_pause/frontend/automation-pause-card.js`. Commit that file with the source change: HACS installs it as it is. CI fails when the committed file differs from a fresh build.

The card copies the look of Settings → Automations with Home Assistant's CSS variables. It does not use Home Assistant's internal `ha-*` elements, except `ha-icon` for an automation's own icon (with the robot as fallback).

## Rules

- **The rules live in `manager.py`.** It has no card or dashboard code.
- **Behaviour is specified first.** A change to a pause rule changes `docs/behaviour.md`, `manager.py` and its tests together. Open an issue to discuss it first.
- **Home Assistant code is async.** No blocking I/O in the event loop.
- **Translations.** `strings.json` and `translations/en.json` are identical; `translations/nl.json` has the same keys. `tests/test_translations.py` checks this.
- **Comments say why.** No changelog comments: git is the changelog.
- **No private data.** The repository is public: no secrets, `.env` files or entity IDs of real devices.
- **Docs are part of the change.** Before each commit, check `README.md`, `docs/*.md` and `CONTRIBUTING.md` against the change.

## Test report

[docs/test-report.md](docs/test-report.md) and `docs/test-report.html` show the results of one full run for one version. GitHub shows the HTML file as code; open it from a checkout. Each release rebuilds them. `tests/test_report.py` fails when the report does not name the version in `manifest.json`.

```powershell
python scripts/report/collect.py        # runs every check: pytest (newest and oldest Home Assistant) and ruff in Docker, the card checks, hassfest
python scripts/report/collect.py --ci   # or: uses the finished CI run of the pushed HEAD (needs gh)
python scripts/report/build.py          # writes docs/test-report.md and .html
```

- `collect.py` writes the raw results to `build/report/` (not in git). It does not change tracked files.
- The HACS validation runs only in CI. A local run shows it as "not run".
- The live verification comes from `docs/live-verification.json`. Add a run for each release you test on a live Home Assistant: `release`, `home_assistant`, `date` (DD/MM/YYYY) and a `steps` list with `step`, `check`, `result` (`pass`, `fail` or `open`) and `note`. The steps are those in [docs/PLAN.md](docs/PLAN.md#verification-live-ha). The report shows the run for the current release, else the newest run.

## Releases

1. Set the same version in `custom_components/automation_pause/manifest.json` and `pyproject.toml` (SemVer). `tests/test_manifest.py` checks that they match.
2. Rebuild and commit the test report (see [Test report](#test-report)).
3. Publish a GitHub release with the tag `v<version>`, for example `v0.1.0`. HACS offers releases as versions; the Release workflow fails when the tag does not match the manifest.

For a test version, use a SemVer pre-release version such as `0.1.0-beta.1` and mark the GitHub release as a pre-release. HACS offers it only to users who turn on **Show beta versions** for the repository.

## Pull requests

- Branch from `main`.
- CI runs pytest, ruff, the card checks, hassfest and the HACS validation. All must pass.
- Keep a pull request to one subject.
