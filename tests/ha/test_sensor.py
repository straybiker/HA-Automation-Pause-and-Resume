"""The sensor that lists the paused automations."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause.const import SENSOR_ENTITY_ID

from .common import automation, later, pause, resume, sensor
from .conftest import GARDEN, KITCHEN, setup


async def test_the_sensor_follows_every_step(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    await setup(hass, entry)
    assert sensor(hass) == ("0", [])

    now = dt_util.utcnow()
    await pause(hass, KITCHEN, {"hours": 1})
    assert sensor(hass) == ("1", [KITCHEN])
    assert hass.states.get(SENSOR_ENTITY_ID).attributes["paused"] == [
        {
            "entity_id": KITCHEN,
            "paused_at": now.isoformat(),
            "resume_at": (now + timedelta(hours=1)).isoformat(),
        }
    ]

    # Sorted by end: the first to end comes first.
    await pause(hass, GARDEN, {"minutes": 30})
    assert sensor(hass) == ("2", [GARDEN, KITCHEN])

    # An extension moves the automation in the list.
    await pause(hass, GARDEN, {"hours": 2})
    assert sensor(hass) == ("2", [KITCHEN, GARDEN])

    await later(hass, freezer, timedelta(hours=1))
    assert sensor(hass) == ("1", [GARDEN])

    await automation(hass, "turn_on", GARDEN)
    assert sensor(hass) == ("0", [])

    await pause(hass, KITCHEN)
    await resume(hass, KITCHEN)
    assert sensor(hass) == ("0", [])


async def test_the_sensor_entity(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    registered = er.async_get(hass).async_get(SENSOR_ENTITY_ID)
    assert registered is not None
    assert registered.unique_id == f"{entry.entry_id}_paused_automations"
    assert registered.translation_key == "paused_automations"
    state = hass.states.get(SENSOR_ENTITY_ID)
    assert state.attributes["friendly_name"] == "Paused automations"
