"""The durations of the card's pause dialog: parse, check and format them.

The options store text such as "15m" or "2h". The sensor sends minutes, so
the card needs no parser. This module has no Home Assistant code, so its
tests run without the test harness.
"""

from __future__ import annotations

import re
from collections.abc import Iterable
from datetime import timedelta

from .const import MAX_DURATION, MIN_DURATION

# Largest first: a value takes the largest unit that divides it.
UNIT_MINUTES = {"w": 7 * 24 * 60, "d": 24 * 60, "h": 60, "m": 1}

MIN_MINUTES = MIN_DURATION // timedelta(minutes=1)
MAX_MINUTES = MAX_DURATION // timedelta(minutes=1)

# ASCII digits only. Nine digits are more than 365 days in any unit, and the
# limit keeps a very long number away from int().
_PATTERN = re.compile(r"\s*([0-9]{1,9})\s*([mhdw])\s*", re.IGNORECASE)


def parse_minutes(value: str) -> int:
    """'2h' -> 120. Raises ValueError for bad text or a value out of bounds."""
    match = _PATTERN.fullmatch(value)
    if match is None:
        raise ValueError(f"not a duration: {value!r}")
    minutes = int(match[1]) * UNIT_MINUTES[match[2].lower()]
    if not MIN_MINUTES <= minutes <= MAX_MINUTES:
        raise ValueError(f"out of bounds: {value!r}")
    return minutes


def format_minutes(minutes: int) -> str:
    """120 -> '2h', 90 -> '90m', 10080 -> '1w'."""
    unit, size = next((u, s) for u, s in UNIT_MINUTES.items() if minutes % s == 0)
    return f"{minutes // size}{unit}"


def to_minutes(values: Iterable[str]) -> list[int]:
    """The values in minutes, short to long, each length of time once."""
    return sorted({parse_minutes(value) for value in values})


def normalize(values: Iterable[str]) -> list[str]:
    """The stored form: '60m' and '1h' become one '1h'; sorted short to long."""
    return [format_minutes(minutes) for minutes in to_minutes(values)]
