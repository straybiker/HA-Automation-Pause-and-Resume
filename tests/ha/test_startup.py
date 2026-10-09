"""The stored pauses at a Home Assistant start."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

import pytest
from homeassistant.const import (
    EVENT_HOMEASSISTANT_STARTED,
    STATE_OFF,
    STATE_ON,
    STATE_UNAVAILABLE,
)
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
)

from custom_components.automation_pause.const import (
    EVENT_PAUSE_RESUMED,
    STORE_KEY,
    STORE_VERSION,
)

from .common import later, manager, pause, sensor, state
from .conftest import GARDEN, KITCHEN, setup

# Off at the start, as after a restart during a pause.
OVERDUE = "automation.test_overdue"
# On at the start: turned on while Home Assistant was down.
TURNED_ON = GARDEN
# Neither a state nor a registry entry: deleted while Home Assistant was down.
MISSING = "automation.test_missing"
# A registry entry, but unavailable (for example a broken configuration).
BROKEN = "automation.test_broken"


def _automation(alias: str, automation_id: str, on: bool) -> dict[str, Any]:
    return {
        "id": automation_id,
        "alias": alias,
        "initial_state": on,
        "triggers": [{"trigger": "event", "event_type": f"test_{automation_id}"}],
        "actions": [{"event": "test_ran"}],
    }


def _stored(paused_at: timedelta, resume_at: timedelta) -> dict[str, str]:
    now = dt_util.utcnow()
    return {
        "paused_at": (now + paused_at).isoformat(),
        "resume_at": (now + resume_at).isoformat(),
    }


@pytest.fixture
async def stopped(hass: HomeAssistant, hass_storage) -> None:
    """Home Assistant starts with stored pauses and its automations loaded."""
    hass_storage[STORE_KEY] = {
        "version": STORE_VERSION,
        "minor_version": 1,
        "key": STORE_KEY,
        "data": {
            KITCHEN: _stored(timedelta(hours=-1), timedelta(minutes=15)),
            OVERDUE: _stored(timedelta(hours=-2), timedelta(hours=-1)),
            TURNED_ON: _stored(timedelta(hours=-1), timedelta(hours=1)),
            MISSING: _stored(timedelta(hours=-1), timedelta(hours=1)),
            BROKEN: _stored(timedelta(hours=-1), timedelta(minutes=16)),
        },
    }
    hass.set_state(CoreState.not_running)
    assert await async_setup_component(
        hass,
        "automation",
        {
            "automation": [
                _automation("Test kitchen lights", "kitchen", False),
                _automation("Test overdue", "overdue", False),
                _automation("Test garden watering", "garden", True),
            ]
        },
    )
    er.async_get(hass).async_get_or_create(
        "automation", "automation", "broken", suggested_object_id="test_broken"
    )
    hass.states.async_set(BROKEN, STATE_UNAVAILABLE)
    await hass.async_block_till_done()


async def _start(hass: HomeAssistant) -> None:
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()


async def test_nothing_happens_before_the_start(
    hass: HomeAssistant, stopped, entry: MockConfigEntry
) -> None:
    """The rules need every automation loaded, so they wait for the start."""
    await setup(hass, entry)
    assert set(manager(entry).paused) == {KITCHEN, OVERDUE, TURNED_ON, MISSING, BROKEN}
    assert manager(entry).async_diagnostics()["timers"] == 0
    assert state(hass, OVERDUE) == STATE_OFF


async def test_the_startup_rules(
    hass: HomeAssistant, freezer, stopped, entry: MockConfigEntry, hass_storage
) -> None:
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)

    await _start(hass)

    assert {e.data["entity_id"]: e.data["reason"] for e in resumed} == {
        OVERDUE: "timer",
        TURNED_ON: "manual",
        MISSING: "removed",
    }
    assert state(hass, OVERDUE) == STATE_ON
    assert state(hass, TURNED_ON) == STATE_ON
    assert set(manager(entry).paused) == {KITCHEN, BROKEN}
    assert set(hass_storage[STORE_KEY]["data"]) == {KITCHEN, BROKEN}
    assert sensor(hass) == ("2", [KITCHEN, BROKEN])
    assert state(hass, KITCHEN) == STATE_OFF

    await later(hass, freezer, timedelta(minutes=15))
    assert state(hass, KITCHEN) == STATE_ON
    assert set(manager(entry).paused) == {BROKEN}

    # Still unavailable at its end: the pause waits until it is back.
    await later(hass, freezer, timedelta(minutes=1))
    assert set(manager(entry).paused) == {BROKEN}
    hass.states.async_set(BROKEN, STATE_OFF)
    await hass.async_block_till_done()
    assert not manager(entry).paused
    assert resumed[-1].data == {"entity_id": BROKEN, "reason": "timer"}


async def test_a_pause_during_the_start_works_at_once(
    hass: HomeAssistant, freezer, stopped, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    # Extends the stored pause; its timer starts now, not at the start.
    await pause(hass, KITCHEN, {"minutes": 1})
    assert manager(entry).async_diagnostics()["timers"] == 1

    await _start(hass)
    await later(hass, freezer, timedelta(minutes=1))
    assert state(hass, KITCHEN) == STATE_ON


async def test_an_unreadable_stored_pause_is_skipped(
    hass: HomeAssistant, automations, entry: MockConfigEntry, hass_storage
) -> None:
    hass_storage[STORE_KEY] = {
        "version": STORE_VERSION,
        "minor_version": 1,
        "key": STORE_KEY,
        "data": {
            KITCHEN: {"paused_at": "not a time", "resume_at": "never"},
            GARDEN: {"paused_at": dt_util.utcnow().isoformat()},
            # The ISO format, but month 13.
            OVERDUE: {
                "paused_at": "2026-13-01T00:00:00+00:00",
                "resume_at": "2026-13-01T01:00:00+00:00",
            },
        },
    }
    await setup(hass, entry)
    assert not manager(entry).paused
