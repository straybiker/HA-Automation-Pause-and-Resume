"""Diagnostics and the logbook text."""

from __future__ import annotations

from types import SimpleNamespace

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause import logbook
from custom_components.automation_pause.const import (
    DOMAIN,
    EVENT_PAUSE_RESUMED,
    EVENT_PAUSE_STARTED,
)
from custom_components.automation_pause.diagnostics import (
    async_get_config_entry_diagnostics,
)

from .common import manager, pause
from .conftest import KITCHEN, setup


async def test_diagnostics(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    paused = manager(entry).paused[KITCHEN]

    assert await async_get_config_entry_diagnostics(hass, entry) == {
        "pauses": {
            KITCHEN: {
                "paused_at": paused.paused_at.isoformat(),
                "resume_at": paused.resume_at.isoformat(),
            }
        },
        "timers": 1,
        "started": True,
    }


async def test_logbook_text(hass: HomeAssistant, automations) -> None:
    described = {}

    def describe(domain, event_type, describe_event):
        assert domain == DOMAIN
        described[event_type] = describe_event

    logbook.async_describe_events(hass, describe)
    resume_at = dt_util.utcnow()
    local = dt_util.as_local(resume_at).strftime("%Y-%m-%d %H:%M")

    started = described[EVENT_PAUSE_STARTED](
        SimpleNamespace(
            data={
                "entity_id": KITCHEN,
                "paused_at": resume_at.isoformat(),
                "resume_at": resume_at.isoformat(),
            }
        )
    )
    assert started == {
        "name": "Test kitchen lights",
        "message": f"paused until {local}",
        "entity_id": KITCHEN,
    }
    resumed = described[EVENT_PAUSE_RESUMED](
        SimpleNamespace(data={"entity_id": KITCHEN, "reason": "timer"})
    )
    assert resumed == {
        "name": "Test kitchen lights",
        "message": "resumed (timer)",
        "entity_id": KITCHEN,
    }
