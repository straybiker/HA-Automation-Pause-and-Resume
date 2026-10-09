"""Build docs/test-report.md and docs/test-report.html.

Reads build/report/data.json (written by collect.py) and the hand-kept
docs/live-verification.json. The HTML page is self-contained: inline style, no
scripts, no external files. The Markdown file shows the same report on GitHub.

    python scripts/report/build.py
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime
from html import escape
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parents[1]
DATA = ROOT / "build" / "report" / "data.json"
LIVE = ROOT / "docs" / "live-verification.json"
BEHAVIOUR = "behaviour.md"

# Test file -> (title, [(rule, link)]). Links are relative to docs/.
FILES: dict[str, tuple[str, list[tuple[str, str]]]] = {
    "tests/ha/test_services.py": (
        "Pause and resume actions",
        [
            ("Actions", f"{BEHAVIOUR}#actions"),
            ("Targets", f"{BEHAVIOUR}#targets"),
            ("All or nothing", f"{BEHAVIOUR}#all-or-nothing"),
            ("Checks", f"{BEHAVIOUR}#checks"),
            ("A new pause", f"{BEHAVIOUR}#a-new-pause"),
            (
                "A pause of a paused automation",
                f"{BEHAVIOUR}#a-pause-of-a-paused-automation",
            ),
            ("End of a pause", f"{BEHAVIOUR}#end-of-a-pause"),
            ("Events", f"{BEHAVIOUR}#events"),
        ],
    ),
    "tests/ha/test_manager.py": (
        "Changes from outside",
        [
            ("Changes from outside", f"{BEHAVIOUR}#changes-from-outside"),
            ("Reload", f"{BEHAVIOUR}#reload"),
            ("Rename", f"{BEHAVIOUR}#rename"),
            (
                "The automation is unavailable at the end",
                f"{BEHAVIOUR}#the-automation-is-unavailable-at-the-end",
            ),
            ("Removal of the integration", f"{BEHAVIOUR}#removal-of-the-integration"),
            ("Store", f"{BEHAVIOUR}#store"),
        ],
    ),
    "tests/ha/test_startup.py": (
        "Startup",
        [("Startup", f"{BEHAVIOUR}#startup"), ("Store", f"{BEHAVIOUR}#store")],
    ),
    "tests/ha/test_sensor.py": ("Sensor", [("Sensor", f"{BEHAVIOUR}#sensor")]),
    "tests/ha/test_diagnostics.py": (
        "Diagnostics and logbook",
        [
            ("Diagnostics", f"{BEHAVIOUR}#diagnostics"),
            ("Events", f"{BEHAVIOUR}#events"),
        ],
    ),
    "tests/ha/test_config_flow.py": (
        "Setup and options flow",
        [("README: Options", "../README.md#options")],
    ),
    "tests/ha/test_dashboard.py": (
        "Sidebar dashboard",
        [("README: Options", "../README.md#options")],
    ),
    "tests/ha/test_frontend.py": ("Card serving", []),
    "tests/test_manifest.py": ("Repository metadata", []),
    "tests/test_translations.py": ("Translations", []),
}
CHECKS = (
    ("typecheck", "Card: typecheck (tsc)"),
    ("lint", "Card: eslint and prettier"),
    ("bundle", "Card: bundle equals a fresh build"),
    ("ruff_check", "ruff check"),
    ("ruff_format", "ruff format"),
    ("mypy", "mypy --strict"),
    ("hassfest", "hassfest"),
    ("hacs", "HACS validation"),
)
MARK = {"pass": "✅ pass", "fail": "❌ fail", "not_run": "➖ not run"}
TEST_MARK = {
    "passed": "✅ pass",
    "failed": "❌ fail",
    "skipped": "➖ skipped",
    "xfailed": "➖ expected failure",
}
LIVE_MARK = {"pass": "✅ pass", "fail": "❌ fail", "open": "⏳ open"}


# --- model --------------------------------------------------------------------


def sentence(name: str) -> str:
    text = name.removeprefix("test_").replace("_", " ").strip()
    return text[:1].upper() + text[1:] + ("" if text.endswith(".") else ".")


def suite_row(label: str, tests: list[dict], ran: bool, error: str) -> dict:
    counts = Counter(t["outcome"] for t in tests)
    failed = counts["failed"]
    if not ran:
        status = "not_run"
    elif failed or not tests:
        status = "fail"
    else:
        status = "pass"
    return {
        "label": label,
        "passed": counts["passed"],
        "failed": failed,
        "skipped": counts["skipped"] + counts["xfailed"],
        "status": status,
        "detail": error,
    }


def summary(data: dict) -> list[dict]:
    rows = []
    for release, title in (
        ("newest", "newest Home Assistant"),
        ("oldest", "oldest supported Home Assistant"),
    ):
        entry = data["pytest"][release]
        ha = entry["homeassistant"] or "?"
        tests = entry["tests"]
        n_ha = sum(t["file"].startswith("tests/ha/") for t in tests)
        detail = entry["error"] or (
            f"{entry['requirements']}: {n_ha} Home Assistant tests, "
            f"{len(tests) - n_ha} static tests"
        )
        rows.append(suite_row(f"pytest, {title} {ha}", tests, entry["ran"], detail))
    vitest = data["vitest"]
    rows.append(
        suite_row(
            "Card: vitest",
            vitest["tests"],
            vitest["ran"],
            vitest["error"] or f"Node {data['node']}",
        )
    )
    for key, label in CHECKS:
        tool = data["tools"][key]
        rows.append(
            {
                "label": label,
                "passed": None,
                "failed": None,
                "skipped": None,
                "status": tool["status"],
                "detail": tool["detail"],
            }
        )
    return rows


def pytest_rows(data: dict) -> dict[str, list[dict]]:
    """Every pytest test once, with its result per release, grouped by file."""
    merged: dict[tuple, dict] = {}
    for release in ("newest", "oldest"):
        for t in data["pytest"][release]["tests"]:
            key = (t["file"], t["name"], t["params"])
            row = merged.setdefault(key, {**t, "results": {}})
            row["results"][release] = (t["outcome"], t["message"])
    files: dict[str, list[dict]] = {}
    for row in merged.values():
        files.setdefault(row["file"], []).append(row)
    order = list(FILES)
    return dict(
        sorted(
            files.items(),
            key=lambda kv: (
                order.index(kv[0]) if kv[0] in order else len(order),
                kv[0],
            ),
        )
    )


def vitest_rows(data: dict) -> dict[str, list[dict]]:
    files: dict[str, list[dict]] = {}
    for t in data["vitest"]["tests"]:
        files.setdefault(t["file"], []).append(t)
    return files


def live_run(version: str) -> tuple[dict | None, bool]:
    """The run for this release, else the newest run."""
    if not LIVE.is_file():
        return None, False
    runs = json.loads(LIVE.read_text("utf-8")).get("runs", [])
    current = [r for r in runs if r.get("release") == version]
    if current:
        return current[-1], True
    if not runs:
        return None, False

    def when(item: tuple[int, dict]) -> tuple:
        index, run = item
        try:
            return datetime.strptime(run.get("date", ""), "%d/%m/%Y"), index
        except ValueError:
            return datetime.min, index

    return max(enumerate(runs), key=when)[1], False


def live_counts(run: dict) -> str:
    counts = Counter(s["result"] for s in run["steps"])
    return ", ".join(f"{counts[k]} {k}" for k in ("pass", "fail", "open") if counts[k])


def overall(rows: list[dict]) -> str:
    failed = [r["label"] for r in rows if r["status"] == "fail"]
    not_run = [r["label"] for r in rows if r["status"] == "not_run"]
    text = (
        f"{len(failed)} of {len(rows)} checks fail: {', '.join(failed)}."
        if failed
        else f"All {len(rows) - len(not_run)} checks that ran pass."
    )
    if not_run:
        text += f" Not run: {', '.join(not_run)}."
    return text


# --- Markdown -----------------------------------------------------------------


def cell(value: object) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def num(value: int | None) -> str:
    return "–" if value is None else str(value)


def source_md(data: dict) -> str:
    src = data["source"]
    return f"[{src['label']}]({src['url']})" if src.get("url") else src["label"]


def test_result_md(result: tuple[str, str] | None) -> str:
    if result is None:
        return "–"
    outcome, message = result
    text = TEST_MARK.get(outcome, outcome)
    return f"{text}: {cell(message)}" if message else text


def markdown(data: dict) -> str:
    version = data["version"]
    rows = summary(data)
    commit = f"`{data['commit']}` on `{data['branch']}`"
    if data["dirty"]:
        commit += ", with uncommitted changes"
    newest = data["pytest"]["newest"]["homeassistant"] or "?"
    oldest = data["pytest"]["oldest"]["homeassistant"] or "?"
    out = [
        "# Test report",
        "",
        "<!-- Generated by scripts/report/build.py. Do not edit. -->",
        "",
        "| | |",
        "|---|---|",
        f"| Integration version | {version} |",
        f"| Commit | {commit} |",
        f"| Date | {data['date']} |",
        f"| Results | {source_md(data)} |",
        f"| Supported Home Assistant | {data['min_homeassistant']} or later |",
        "",
        "The same report as a page: [test-report.html](test-report.html). "
        "GitHub shows that file as code; open it from a checkout.",
        "",
        "## Summary",
        "",
        f"**{overall(rows)}**",
        "",
        "| Check | Passed | Failed | Skipped | Result | Detail |",
        "|---|--:|--:|--:|---|---|",
    ]
    for r in rows:
        out.append(
            f"| {cell(r['label'])} | {num(r['passed'])} | {num(r['failed'])} | "
            f"{num(r['skipped'])} | {MARK[r['status']]} | {cell(r['detail'])} |"
        )
    out += [
        "",
        "pytest runs the same suite twice: with the newest Home Assistant "
        "(`requirements-dev.txt`) and with the oldest supported one "
        "(`requirements-dev-oldest.txt`). The static tests do not need "
        "Home Assistant. `tests/test_report.py` checks this report and is left "
        "out of it.",
        "",
        "## Live verification",
        "",
    ]
    run, current = live_run(version)
    if run is None:
        out += ["No live run is recorded in `docs/live-verification.json`.", ""]
    else:
        if not current:
            out += [
                f"No live run for {version} yet. "
                f"This is the newest run, for release {run['release']}.",
                "",
            ]
        out += [
            "By hand on a live Home Assistant, with the steps in "
            "[PLAN.md](PLAN.md#verification-live-ha). "
            "The data is in `docs/live-verification.json`.",
            "",
            f"Release **{run['release']}**"
            + (" (this release)" if current else "")
            + f" · Home Assistant {run['home_assistant']} · {run['date']} · "
            + live_counts(run),
            "",
            "| Step | Check | Result | Note |",
            "|---|---|---|---|",
        ]
        for s in run["steps"]:
            out.append(
                f"| {cell(s['step'])} | {cell(s['check'])} | "
                f"{LIVE_MARK.get(s['result'], s['result'])} | "
                f"{cell(s.get('note') or '–')} |"
            )
        out.append("")

    out += ["## pytest", ""]
    for file, tests in pytest_rows(data).items():
        title, covers = FILES.get(file, (file, []))
        kind = "Home Assistant tests" if file.startswith("tests/ha/") else "Static"
        line = f"`{file}` · {kind}"
        if covers:
            line += " · Covers: " + ", ".join(f"[{t}]({link})" for t, link in covers)
        out += [
            f"### {title}",
            "",
            line,
            "",
            f"| Test | Case | Newest ({newest}) | Oldest ({oldest}) |",
            "|---|---|---|---|",
        ]
        for t in tests:
            text = sentence(t["name"])
            if t["doc"]:
                text += f"<br>*{t['doc']}*"
            out.append(
                f"| {cell(text)} | {cell(t['params']) or '–'} | "
                f"{test_result_md(t['results'].get('newest'))} | "
                f"{test_result_md(t['results'].get('oldest'))} |"
            )
        out.append("")

    out += ["## Card (vitest)", ""]
    for file, tests in vitest_rows(data).items():
        out += [
            f"### `frontend-src/{file}`",
            "",
            "| Area | Test | Result |",
            "|---|---|---|",
        ]
        for t in tests:
            result = test_result_md((t["outcome"], t["message"]))
            out.append(
                f"| {cell(t['area'] or '–')} | {cell(sentence(t['name']))} | {result} |"
            )
        out.append("")
    return "\n".join(out)


# --- HTML ---------------------------------------------------------------------


def h(value: object) -> str:
    return escape(str(value), quote=True)


def pill(kind: str, text: str) -> str:
    return f'<span class="pill p-{kind}">{h(text)}</span>'


STATUS_PILL = {"pass": "pass", "fail": "fail", "not_run": "none"}
TEST_PILL = {"passed": "pass", "failed": "fail", "skipped": "none", "xfailed": "none"}
LIVE_PILL = {"pass": "pass", "fail": "fail", "open": "open"}


def test_result_html(result: tuple[str, str] | None) -> str:
    if result is None:
        return '<span class="muted">–</span>'
    outcome, message = result
    text = pill(TEST_PILL.get(outcome, "none"), TEST_MARK.get(outcome, outcome)[2:])
    return text + (f'<div class="note">{h(message)}</div>' if message else "")


def table(head: list[str], body: list[list[str]], cls: str = "") -> str:
    ths = "".join(f"<th>{x}</th>" for x in head)
    # At phone width the cells stack; data-label names each one but the first.
    labels = [""] + [f' data-label="{x}"' for x in head[1:]]
    trs = "".join(
        "<tr>"
        + "".join(f"<td{label}>{x}</td>" for label, x in zip(labels, r, strict=True))
        + "</tr>"
        for r in body
    )
    return (
        f'<div class="scroll"><table class="{cls}"><thead><tr>{ths}</tr></thead>'
        f"<tbody>{trs}</tbody></table></div>"
    )


def html_header(data: dict) -> str:
    src = data["source"]
    results = (
        f'<a href="{h(src["url"])}">{h(src["label"])}</a>'
        if src.get("url")
        else h(src["label"])
    )
    commit = f"<code>{h(data['commit'])}</code> on <code>{h(data['branch'])}</code>"
    if data["dirty"]:
        commit += ' <span class="warn">with uncommitted changes</span>'
    items = [
        ("Integration version", f"<b>{h(data['version'])}</b>"),
        ("Commit", commit),
        ("Date", h(data["date"])),
        ("Results", results),
        ("Supported Home Assistant", f"{h(data['min_homeassistant'])} or later"),
    ]
    return (
        '<dl class="meta">'
        + "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in items)
        + "</dl>"
    )


def html_summary(data: dict) -> str:
    rows = summary(data)
    verdict = "fail" if any(r["status"] == "fail" for r in rows) else "pass"
    body = [
        [
            h(r["label"]),
            f'<span class="num">{num(r["passed"])}</span>',
            f'<span class="num">{num(r["failed"])}</span>',
            f'<span class="num">{num(r["skipped"])}</span>',
            pill(STATUS_PILL[r["status"]], MARK[r["status"]][2:]),
            f'<span class="note">{h(r["detail"])}</span>',
        ]
        for r in rows
    ]
    return (
        f'<p class="verdict v-{verdict}">{h(overall(rows))}</p>'
        + table(["Check", "Passed", "Failed", "Skipped", "Result", "Detail"], body)
        + '<p class="muted">pytest runs the same suite twice: with the newest Home '
        "Assistant (<code>requirements-dev.txt</code>) and with the oldest supported "
        "one (<code>requirements-dev-oldest.txt</code>). The static tests do not need "
        "Home Assistant. <code>tests/test_report.py</code> checks this report and is "
        "left out of it.</p>"
    )


def html_live(data: dict) -> str:
    run, current = live_run(data["version"])
    if run is None:
        return '<p class="muted">No live run is recorded.</p>'
    parts = []
    if not current:
        parts.append(
            f'<p class="warn">No live run for {h(data["version"])} yet. This is the '
            f"newest run, for release {h(run['release'])}.</p>"
        )
    parts.append(
        '<p class="muted">By hand on a live Home Assistant, with the steps in '
        '<a href="PLAN.md#verification-live-ha">PLAN.md</a>. The data is in '
        "<code>docs/live-verification.json</code>.</p>"
    )
    parts.append(
        f"<p>Release <b>{h(run['release'])}</b>"
        + (" (this release)" if current else "")
        + f" · Home Assistant {h(run['home_assistant'])} · {h(run['date'])} · "
        + h(live_counts(run))
        + "</p>"
    )
    body = [
        [
            f'<span class="num">{h(s["step"])}</span>',
            h(s["check"]),
            pill(LIVE_PILL.get(s["result"], "none"), s["result"]),
            f'<span class="note">{h(s.get("note") or "–")}</span>',
        ]
        for s in run["steps"]
    ]
    parts.append(table(["Step", "Check", "Result", "Note"], body, "live"))
    return "".join(parts)


def outcomes(t: dict) -> list[str]:
    """A pytest row holds a result per release; a vitest row holds one."""
    if "results" in t:
        return [r[0] for r in t["results"].values()]
    return [t["outcome"]]


def group(title: str, sub: str, tests: list[dict], content: str) -> str:
    failed = any("failed" in outcomes(t) for t in tests)
    status = pill("fail", "failures") if failed else pill("pass", f"{len(tests)} tests")
    return (
        f"<details{' open' if failed else ''}><summary>"
        f'<span class="gt">{h(title)}</span> {status}'
        f'<span class="note sub">{sub}</span></summary>{content}</details>'
    )


def html_tests(data: dict) -> str:
    newest = data["pytest"]["newest"]["homeassistant"] or "?"
    oldest = data["pytest"]["oldest"]["homeassistant"] or "?"
    parts = ["<h3>pytest</h3>"]
    for file, tests in pytest_rows(data).items():
        title, covers = FILES.get(file, (file, []))
        kind = "Home Assistant tests" if file.startswith("tests/ha/") else "Static"
        sub = f"<code>{h(file)}</code> · {kind}"
        if covers:
            sub += " · Covers: " + ", ".join(
                f'<a href="{h(link)}">{h(t)}</a>' for t, link in covers
            )
        body = [
            [
                h(sentence(t["name"]))
                + (f'<div class="note">{h(t["doc"])}</div>' if t["doc"] else ""),
                f'<span class="params">{h(t["params"]) or "–"}</span>',
                test_result_html(t["results"].get("newest")),
                test_result_html(t["results"].get("oldest")),
            ]
            for t in tests
        ]
        content = table(
            ["Test", "Case", f"Newest {h(newest)}", f"Oldest {h(oldest)}"], body
        )
        parts.append(group(title, sub, tests, content))
    parts.append("<h3>Card (vitest)</h3>")
    for file, tests in vitest_rows(data).items():
        body = [
            [
                h(t["area"] or "–"),
                h(sentence(t["name"])),
                test_result_html((t["outcome"], t["message"])),
            ]
            for t in tests
        ]
        content = table(["Area", "Test", "Result"], body)
        parts.append(
            group(file, f"<code>frontend-src/{h(file)}</code>", tests, content)
        )
    return "".join(parts)


def html(data: dict) -> str:
    head = (HERE / "head.html").read_text("utf-8")
    body = (HERE / "body.html").read_text("utf-8")
    footer = (
        f"Generated {h(data['generated'])} by <code>scripts/report/build.py</code>. "
        f"Python {h(data['pytest']['newest']['python'] or '?')} in the test image, "
        f"Node {h(data['node'])}."
    )
    for marker, content in (
        ("header", html_header(data)),
        ("summary", html_summary(data)),
        ("live", html_live(data)),
        ("tests", html_tests(data)),
        ("footer", footer),
    ):
        body = body.replace(f"<!--@{marker}-->", content)
    return (
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f"{head}</head>\n<body>\n{body}</body>\n</html>\n"
    )


def main() -> None:
    if not DATA.is_file():
        raise SystemExit("No build/report/data.json: run scripts/report/collect.py.")
    data = json.loads(DATA.read_text("utf-8"))
    for name, text in (
        ("test-report.md", markdown(data)),
        ("test-report.html", html(data)),
    ):
        path = ROOT / "docs" / name
        path.write_text(
            text if text.endswith("\n") else text + "\n", "utf-8", newline="\n"
        )
        print(path, len(text))


if __name__ == "__main__":
    main()
