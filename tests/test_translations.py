"""Translation files match the code. Runs without Home Assistant's harness."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).parent.parent / "custom_components" / "automation_pause"
STRINGS = json.loads((ROOT / "strings.json").read_text("utf-8"))
LANGUAGES = {
    p.stem: json.loads(p.read_text("utf-8"))
    for p in sorted((ROOT / "translations").glob("*.json"))
}


def _keys(node, prefix=""):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from _keys(v, f"{prefix}.{k}" if prefix else k)
    else:
        yield prefix


def test_english_equals_strings():
    assert LANGUAGES["en"] == STRINGS


@pytest.mark.parametrize("language", sorted(LANGUAGES))
def test_every_language_has_every_key(language):
    assert set(_keys(LANGUAGES[language])) == set(_keys(STRINGS))


@pytest.mark.parametrize("language", sorted(LANGUAGES))
def test_placeholders_match_english(language):
    """A missing placeholder shows as raw text in the message."""
    english = dict(zip(_keys(STRINGS), _values(STRINGS), strict=True))
    for key, text in zip(
        _keys(LANGUAGES[language]), _values(LANGUAGES[language]), strict=True
    ):
        assert set(re.findall(r"{\w+}", text)) == set(
            re.findall(r"{\w+}", english[key])
        ), key


def _values(node):
    if isinstance(node, dict):
        for v in node.values():
            yield from _values(v)
    else:
        yield node


def test_every_exception_has_text():
    source = "".join(p.read_text("utf-8") for p in ROOT.glob("*.py"))
    raised = set(re.findall(r'translation_key="(\w+)"', source))
    assert raised  # the pattern still finds the raises
    assert raised <= set(STRINGS["exceptions"])
