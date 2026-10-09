"""The quality scale self-assessment lists every rule and has no open rule.

hassfest skips quality_scale.yaml for a custom integration, so this test
does the check. It runs without Home Assistant's harness.
"""

from __future__ import annotations

from pathlib import Path

import yaml

QUALITY_SCALE = (
    Path(__file__).parent.parent
    / "custom_components"
    / "automation_pause"
    / "quality_scale.yaml"
)

# The rules of the Integration Quality Scale up to Platinum, as in Home
# Assistant core's script/hassfest/quality_scale.py. Add a new rule here when
# core adds one.
RULES = {
    # Bronze
    "action-setup",
    "appropriate-polling",
    "brands",
    "common-modules",
    "config-flow",
    "config-flow-test-coverage",
    "dependency-transparency",
    "docs-actions",
    "docs-conditions",
    "docs-high-level-description",
    "docs-installation-instructions",
    "docs-removal-instructions",
    "docs-triggers",
    "entity-event-setup",
    "entity-unique-id",
    "has-entity-name",
    "runtime-data",
    "test-before-configure",
    "test-before-setup",
    "unique-config-entry",
    # Silver
    "action-exceptions",
    "config-entry-unloading",
    "docs-configuration-parameters",
    "docs-installation-parameters",
    "entity-unavailable",
    "integration-owner",
    "log-when-unavailable",
    "parallel-updates",
    "reauthentication-flow",
    "test-coverage",
    # Gold
    "devices",
    "diagnostics",
    "discovery",
    "discovery-update-info",
    "docs-data-update",
    "docs-examples",
    "docs-known-limitations",
    "docs-supported-devices",
    "docs-supported-functions",
    "docs-troubleshooting",
    "docs-use-cases",
    "dynamic-devices",
    "entity-category",
    "entity-device-class",
    "entity-disabled-by-default",
    "entity-translations",
    "exception-translations",
    "icon-translations",
    "reconfiguration-flow",
    "repair-issues",
    "stale-devices",
    # Platinum
    "async-dependency",
    "inject-websession",
    "strict-typing",
}


def _rules() -> dict[str, object]:
    return yaml.safe_load(QUALITY_SCALE.read_text("utf-8"))["rules"]


def _status(value: object) -> str:
    return value if isinstance(value, str) else value["status"]


def test_every_rule_is_listed() -> None:
    assert set(_rules()) == RULES


def test_no_rule_is_open() -> None:
    open_rules = [
        rule
        for rule, value in _rules().items()
        if _status(value) not in {"done", "exempt"}
    ]
    assert open_rules == []


def test_every_exemption_says_why() -> None:
    for rule, value in _rules().items():
        if _status(value) == "exempt":
            assert isinstance(value, dict), rule
            assert value.get("comment"), rule
