"""Diagnostics download: the pauses and the running timers."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from . import AutomationPauseConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: AutomationPauseConfigEntry
) -> dict[str, Any]:
    # Entity IDs and times only: nothing to redact.
    return entry.runtime_data.async_diagnostics()
