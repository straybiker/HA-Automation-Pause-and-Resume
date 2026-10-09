"""Show the pause events in the logbook of the paused automation."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_REASON,
    ATTR_RESUME_AT,
    DOMAIN,
    EVENT_PAUSE_RESUMED,
    EVENT_PAUSE_STARTED,
)

# The logbook entry keys. Plain strings, so this module does not import the
# logbook integration.
_NAME = "name"
_MESSAGE = "message"
_ENTITY_ID = "entity_id"


@callback
def async_describe_events(
    hass: HomeAssistant,
    async_describe_event: Callable[[str, str, Callable[[Any], dict[str, Any]]], None],
) -> None:
    def name(entity_id: str | None) -> str | None:
        if entity_id and (state := hass.states.get(entity_id)) is not None:
            return state.name
        return entity_id

    @callback
    def started(event: Any) -> dict[str, Any]:
        data = event.data
        entity_id = data.get(ATTR_ENTITY_ID)
        resume_at = dt_util.parse_datetime(str(data.get(ATTR_RESUME_AT)))
        until = (
            dt_util.as_local(resume_at).strftime("%Y-%m-%d %H:%M")
            if resume_at
            else data.get(ATTR_RESUME_AT)
        )
        return {
            _NAME: name(entity_id),
            _MESSAGE: f"paused until {until}",
            _ENTITY_ID: entity_id,
        }

    @callback
    def resumed(event: Any) -> dict[str, Any]:
        data = event.data
        entity_id = data.get(ATTR_ENTITY_ID)
        return {
            _NAME: name(entity_id),
            _MESSAGE: f"resumed ({data.get(ATTR_REASON)})",
            _ENTITY_ID: entity_id,
        }

    async_describe_event(DOMAIN, EVENT_PAUSE_STARTED, started)
    async_describe_event(DOMAIN, EVENT_PAUSE_RESUMED, resumed)
