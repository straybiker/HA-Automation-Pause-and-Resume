"""Fixtures for the Home Assistant tests. All entity ids are fake."""

from __future__ import annotations

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause.const import DOMAIN

# Two automations with an id, one without (it cannot be paused).
KITCHEN = "automation.test_kitchen_lights"
GARDEN = "automation.test_garden_watering"
NO_ID = "automation.test_no_id"


def _automation(alias: str, automation_id: str | None = None) -> dict:
    config = {
        "alias": alias,
        "triggers": [{"trigger": "event", "event_type": f"test_{alias}"}],
        "actions": [{"event": "test_ran"}],
    }
    if automation_id:
        config["id"] = automation_id
    return config


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
async def automations(hass: HomeAssistant) -> None:
    """Three automations, all on."""
    assert await async_setup_component(
        hass,
        "automation",
        {
            "automation": [
                _automation("Test kitchen lights", "kitchen"),
                _automation("Test garden watering", "garden"),
                _automation("Test no id"),
            ]
        },
    )
    await hass.async_block_till_done()


def make_entry(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Automation Pause and Resume",
        options={"dashboard": False} | options,
    )
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
def entry(hass: HomeAssistant) -> MockConfigEntry:
    return make_entry(hass)


async def setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
