"""The committed test report belongs to the current version.

Every release rebuilds the report (scripts/report/). It runs without Home
Assistant. scripts/report/collect.py leaves this file out of the report.
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DOCS = ROOT / "docs"
REBUILD = (
    "Rebuild the report: python scripts/report/collect.py, "
    "then python scripts/report/build.py"
)


def _version() -> str:
    manifest = ROOT / "custom_components" / "automation_pause" / "manifest.json"
    return json.loads(manifest.read_text("utf-8"))["version"]


def test_markdown_report_names_the_manifest_version() -> None:
    text = (DOCS / "test-report.md").read_text("utf-8")
    assert f"| Integration version | {_version()} |" in text, REBUILD


def test_html_report_names_the_manifest_version() -> None:
    text = (DOCS / "test-report.html").read_text("utf-8")
    assert f"<dd><b>{_version()}</b></dd>" in text, REBUILD
