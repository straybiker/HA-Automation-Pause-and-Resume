"""The durations of the pause dialog. Runs without Home Assistant's harness."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from custom_components.automation_pause.const import (
    DEFAULT_DURATIONS,
    DURATION_CHOICES,
)
from custom_components.automation_pause.durations import (
    MAX_MINUTES,
    MIN_MINUTES,
    format_minutes,
    normalize,
    parse_minutes,
    to_minutes,
)

ROOT = Path(__file__).parent.parent / "custom_components" / "automation_pause"


@pytest.mark.parametrize(
    ("text", "minutes"),
    [
        ("1m", 1),
        ("45m", 45),
        ("2h", 120),
        ("3d", 3 * 1440),
        ("2w", 2 * 10080),
        ("365d", 365 * 1440),
        # Upper case and spaces are fine.
        ("2H", 120),
        (" 1 w ", 10080),
        ("007m", 7),
    ],
)
def test_parse(text: str, minutes: int) -> None:
    assert parse_minutes(text) == minutes


@pytest.mark.parametrize(
    "text",
    [
        "",
        "m",
        "15",
        "15s",
        "1.5h",
        "-5m",
        "1h30m",
        "1 5m",
        "15 minutes",
        # Below 1 minute or above 365 days.
        "0m",
        "0w",
        "366d",
        "53w",
        "525601m",
        # Long numbers stop at the pattern, not at int().
        "9" * 5000 + "m",
        # Only ASCII digits.
        "١٥m",
    ],
)
def test_parse_rejects(text: str) -> None:
    with pytest.raises(ValueError):
        parse_minutes(text)


def test_bounds_match_the_action() -> None:
    assert MIN_MINUTES == 1
    assert MAX_MINUTES == 365 * 24 * 60
    assert parse_minutes("525600m") == MAX_MINUTES


@pytest.mark.parametrize(
    ("minutes", "text"),
    [
        (1, "1m"),
        (90, "90m"),
        (60, "1h"),
        (1500, "25h"),
        (1440, "1d"),
        (10080, "1w"),
        (365 * 1440, "365d"),
        (364 * 1440, "52w"),
    ],
)
def test_format_takes_the_largest_whole_unit(minutes: int, text: str) -> None:
    assert format_minutes(minutes) == text


def test_normalize_sorts_and_merges() -> None:
    assert normalize(["1w", "60m", "15m", "1h", "7d", " 2H "]) == [
        "15m",
        "1h",
        "2h",
        "1w",
    ]
    assert normalize([]) == []


def test_normalize_rejects_one_bad_value() -> None:
    with pytest.raises(ValueError):
        normalize(["15m", "soon"])


def test_to_minutes() -> None:
    assert to_minutes(DEFAULT_DURATIONS) == [15, 60, 1440, 10080]


def test_the_choices_are_valid_and_normal() -> None:
    assert normalize(DURATION_CHOICES) == list(DURATION_CHOICES)
    assert set(DEFAULT_DURATIONS) <= set(DURATION_CHOICES)


@pytest.mark.parametrize(
    "path", [ROOT / "strings.json", *sorted((ROOT / "translations").glob("*.json"))]
)
def test_every_choice_has_a_label(path: Path) -> None:
    strings = json.loads(path.read_text("utf-8"))
    labels = strings["selector"]["durations"]["options"]
    assert list(labels) == list(DURATION_CHOICES)
