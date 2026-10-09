"""The sensor that lists the paused automations."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause.const import DOMAIN

from .common import automation, later, pause, resume, sensor
from .conftest import GARDEN, KITCHEN, SENSOR, setup

# The entity ID that the sensor had before it belonged to a device.
OLD_SENSOR = "sensor.paused_automations"


async def test_the_sensor_follows_every_step(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    await setup(hass, entry)
    assert sensor(hass) == ("0", [])

    now = dt_util.utcnow()
    await pause(hass, KITCHEN, {"hours": 1})
    assert sensor(hass) == ("1", [KITCHEN])
    assert hass.states.get(SENSOR).attributes["paused"] == [
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
    registered = er.async_get(hass).async_get(SENSOR)
    assert registered is not None
    assert registered.unique_id == f"{entry.entry_id}_paused_automations"
    assert registered.translation_key == "paused_automations"
    assert registered.platform == DOMAIN
    # has_entity_name: the device name, then the entity name.
    state = hass.states.get(SENSOR)
    assert (
        state.attributes["friendly_name"]
        == "Automation Pause and Resume Paused automations"
    )


async def test_the_sensor_belongs_to_a_service_device(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    device_id = er.async_get(hass).async_get(SENSOR).device_id
    device = dr.async_get(hass).async_get(device_id)
    assert device is not None
    assert (DOMAIN, entry.entry_id) in device.identifiers
    assert device.entry_type is dr.DeviceEntryType.SERVICE
    assert device.name == "Automation Pause and Resume"


async def test_an_older_install_keeps_its_entity_id(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """The registry keeps the entity ID that the sensor had before."""
    er.async_get(hass).async_get_or_create(
        "sensor",
        DOMAIN,
        f"{entry.entry_id}_paused_automations",
        config_entry=entry,
        suggested_object_id="paused_automations",
    )
    await setup(hass, entry)
    await pause(hass, KITCHEN)

    assert hass.states.get(SENSOR) is None
    current = hass.states.get(OLD_SENSOR)
    assert current is not None
    assert current.state == "1"
    assert [p["entity_id"] for p in current.attributes["paused"]] == [KITCHEN]
    assert er.async_get(hass).async_get(OLD_SENSOR).device_id is not None
