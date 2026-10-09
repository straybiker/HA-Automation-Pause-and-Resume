"""Changes from outside during a pause: by hand, reload, rename, removal."""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import patch

from homeassistant.const import (
    EVENT_CALL_SERVICE,
    STATE_OFF,
    STATE_ON,
    STATE_UNAVAILABLE,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
)

from custom_components.automation_pause.const import EVENT_PAUSE_RESUMED, STORE_KEY

from .common import automation, later, manager, pause, state
from .conftest import GARDEN, KITCHEN, setup

RENAMED = "automation.test_kitchen_renamed"


def _turn_on_calls(calls) -> list[str]:
    return [
        c.data["service_data"]["entity_id"]
        for c in calls
        if c.data["domain"] == "automation" and c.data["service"] == "turn_on"
    ]


async def test_turning_on_by_hand_ends_the_pause(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer, hass_storage
) -> None:
    """The timer must not turn the automation on again later."""
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    await pause(hass, KITCHEN, {"minutes": 15})

    await automation(hass, "turn_on", KITCHEN)

    assert not manager(entry).paused
    assert hass_storage[STORE_KEY]["data"] == {}
    assert [e.data for e in resumed] == [{"entity_id": KITCHEN, "reason": "manual"}]

    # The user turns it off again for good: the old timer stays quiet.
    await automation(hass, "turn_off", KITCHEN)
    calls = async_capture_events(hass, EVENT_CALL_SERVICE)
    await later(hass, freezer, timedelta(minutes=20))
    assert state(hass, KITCHEN) == STATE_OFF
    assert _turn_on_calls(calls) == []
    assert len(resumed) == 1


async def test_own_changes_are_not_manual(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    """The turn_off of a pause and the turn_on at its end carry our context."""
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    await pause(hass, KITCHEN)
    await pause(hass, KITCHEN)
    await later(hass, freezer, timedelta(minutes=5))

    assert [e.data["reason"] for e in resumed] == ["timer"]
    assert state(hass, KITCHEN) == STATE_ON


async def test_an_unavailable_blip_keeps_the_pause(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    attributes = dict(hass.states.get(KITCHEN).attributes)

    hass.states.async_set(KITCHEN, STATE_UNAVAILABLE, attributes)
    await hass.async_block_till_done()
    hass.states.async_set(KITCHEN, STATE_OFF, attributes)
    await hass.async_block_till_done()

    assert KITCHEN in manager(entry).paused
    await later(hass, freezer, timedelta(minutes=5))
    assert state(hass, KITCHEN) == STATE_ON


async def test_unavailable_at_the_end_waits_until_back(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    """Turning on an unavailable automation does nothing, and it restores
    "off" when it is back. So the pause ends when it is back."""
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    await pause(hass, KITCHEN)
    attributes = dict(hass.states.get(KITCHEN).attributes)
    hass.states.async_set(KITCHEN, STATE_UNAVAILABLE, attributes)

    await later(hass, freezer, timedelta(minutes=5))
    assert KITCHEN in manager(entry).paused
    assert resumed == []

    hass.states.async_set(KITCHEN, STATE_OFF, attributes)
    await hass.async_block_till_done()
    assert not manager(entry).paused
    assert state(hass, KITCHEN) == STATE_ON
    assert [e.data for e in resumed] == [{"entity_id": KITCHEN, "reason": "timer"}]


async def test_a_reload_keeps_the_pause(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    """A reload adds a changed automation again; it restores "off"."""
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    changed = {
        "id": "kitchen",
        "alias": "Test kitchen lights",
        "triggers": [{"trigger": "event", "event_type": "test_changed"}],
        "actions": [{"event": "test_ran_changed"}],
    }
    with patch(
        "homeassistant.config.load_yaml_config_file",
        return_value={"automation": [changed]},
    ):
        await hass.services.async_call("automation", "reload", blocking=True)
        await hass.async_block_till_done()

    assert KITCHEN in manager(entry).paused
    assert state(hass, KITCHEN) == STATE_OFF
    await later(hass, freezer, timedelta(minutes=5))
    assert state(hass, KITCHEN) == STATE_ON


async def test_a_deleted_automation_ends_the_pause(
    hass: HomeAssistant, automations, entry: MockConfigEntry, hass_storage
) -> None:
    """The automation editor removes the registry entry on delete."""
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    await pause(hass, [KITCHEN, GARDEN])

    er.async_get(hass).async_remove(GARDEN)
    await hass.async_block_till_done()

    assert list(manager(entry).paused) == [KITCHEN]
    assert list(hass_storage[STORE_KEY]["data"]) == [KITCHEN]
    assert [e.data for e in resumed] == [{"entity_id": GARDEN, "reason": "removed"}]


async def test_a_rename_moves_the_pause(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer, hass_storage
) -> None:
    """Home Assistant adds the renamed automation again, and it comes back on
    (no saved state for the new ID). That is not a manual change."""
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    await pause(hass, KITCHEN)
    end = manager(entry).paused[KITCHEN].resume_at

    er.async_get(hass).async_update_entity(KITCHEN, new_entity_id=RENAMED)
    await hass.async_block_till_done()

    assert list(manager(entry).paused) == [RENAMED]
    assert manager(entry).paused[RENAMED].resume_at == end
    assert list(hass_storage[STORE_KEY]["data"]) == [RENAMED]
    assert state(hass, RENAMED) == STATE_OFF
    assert resumed == []

    await later(hass, freezer, timedelta(minutes=5))
    assert state(hass, RENAMED) == STATE_ON
    assert [e.data for e in resumed] == [{"entity_id": RENAMED, "reason": "timer"}]


async def test_a_turn_on_after_a_rename_is_manual(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    er.async_get(hass).async_update_entity(KITCHEN, new_entity_id=RENAMED)
    await hass.async_block_till_done()

    await automation(hass, "turn_on", RENAMED)

    assert not manager(entry).paused


async def test_the_store_survives_an_entry_reload(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    before = manager(entry).paused[KITCHEN]

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert manager(entry).paused[KITCHEN] == before
    await later(hass, freezer, timedelta(minutes=5))
    assert state(hass, KITCHEN) == STATE_ON


async def test_removing_the_integration_turns_paused_automations_on(
    hass: HomeAssistant, automations, entry: MockConfigEntry, hass_storage
) -> None:
    """Nothing would turn them on after the integration is gone."""
    await setup(hass, entry)
    await pause(hass, [KITCHEN, GARDEN])
    # A pause that ended by hand is gone already; the user's off stays.
    await automation(hass, "turn_on", GARDEN)
    await automation(hass, "turn_off", GARDEN)

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    assert state(hass, KITCHEN) == STATE_ON
    assert state(hass, GARDEN) == STATE_OFF
    assert STORE_KEY not in hass_storage
