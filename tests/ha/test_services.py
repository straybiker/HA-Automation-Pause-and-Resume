"""The pause and resume actions: targets, checks and events."""

from __future__ import annotations

from datetime import timedelta

import pytest
from homeassistant.const import EVENT_CALL_SERVICE, STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import label_registry as lr
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
)

from custom_components.automation_pause.const import (
    DOMAIN,
    EVENT_PAUSE_RESUMED,
    EVENT_PAUSE_STARTED,
    SENSOR_ENTITY_ID,
    SERVICE_PAUSE,
    SERVICE_RESUME,
    STORE_KEY,
)

from .common import automation, later, manager, pause, resume, state
from .conftest import GARDEN, KITCHEN, NO_ID, setup


async def _error(coro) -> str:
    with pytest.raises(ServiceValidationError) as err:
        await coro
    assert err.value.translation_domain == DOMAIN
    return err.value.translation_key


async def test_pause_turns_off_and_the_timer_turns_on(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer, hass_storage
) -> None:
    await setup(hass, entry)
    started = async_capture_events(hass, EVENT_PAUSE_STARTED)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    now = dt_util.utcnow()

    await pause(hass, KITCHEN, {"minutes": 15})

    assert state(hass, KITCHEN) == STATE_OFF
    assert state(hass, GARDEN) == STATE_ON
    paused = manager(entry).paused[KITCHEN]
    assert paused.paused_at == now
    assert paused.resume_at == now + timedelta(minutes=15)
    assert hass_storage[STORE_KEY]["data"] == {
        KITCHEN: {
            "paused_at": now.isoformat(),
            "resume_at": (now + timedelta(minutes=15)).isoformat(),
        }
    }
    assert [e.data for e in started] == [
        {
            "entity_id": KITCHEN,
            "paused_at": now.isoformat(),
            "resume_at": (now + timedelta(minutes=15)).isoformat(),
        }
    ]

    await later(hass, freezer, timedelta(minutes=14))
    assert state(hass, KITCHEN) == STATE_OFF

    await later(hass, freezer, timedelta(minutes=1))
    assert state(hass, KITCHEN) == STATE_ON
    assert not manager(entry).paused
    assert hass_storage[STORE_KEY]["data"] == {}
    assert [e.data for e in resumed] == [{"entity_id": KITCHEN, "reason": "timer"}]


async def test_stop_actions_goes_to_turn_off(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    calls = async_capture_events(hass, EVENT_CALL_SERVICE)

    await pause(hass, KITCHEN)
    await pause(hass, GARDEN, stop_actions=False)

    turn_off = [
        c.data["service_data"]
        for c in calls
        if c.data["domain"] == "automation" and c.data["service"] == "turn_off"
    ]
    assert turn_off == [
        {"entity_id": KITCHEN, "stop_actions": True},
        {"entity_id": GARDEN, "stop_actions": False},
    ]


async def test_a_second_pause_replaces_the_end(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    """No stacking: the new end is now + duration; the start stays."""
    await setup(hass, entry)
    started = async_capture_events(hass, EVENT_PAUSE_STARTED)
    calls = async_capture_events(hass, EVENT_CALL_SERVICE)
    first = dt_util.utcnow()
    await pause(hass, KITCHEN, {"hours": 1})

    await later(hass, freezer, timedelta(minutes=10))
    await pause(hass, KITCHEN, {"minutes": 15})

    paused = manager(entry).paused[KITCHEN]
    assert paused.paused_at == first
    assert paused.resume_at == first + timedelta(minutes=25)
    assert len(started) == 2
    assert started[1].data["paused_at"] == first.isoformat()
    turn_off = [c for c in calls if c.data["service"] == "turn_off"]
    assert len(turn_off) == 1

    # The old end (1 hour) no longer applies.
    await later(hass, freezer, timedelta(minutes=15))
    assert state(hass, KITCHEN) == STATE_ON
    await later(hass, freezer, timedelta(hours=1))
    assert state(hass, KITCHEN) == STATE_ON


async def test_resume_turns_on_at_once(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer, hass_storage
) -> None:
    await setup(hass, entry)
    resumed = async_capture_events(hass, EVENT_PAUSE_RESUMED)
    await pause(hass, KITCHEN)

    await resume(hass, KITCHEN)

    assert state(hass, KITCHEN) == STATE_ON
    assert not manager(entry).paused
    assert hass_storage[STORE_KEY]["data"] == {}
    assert [e.data for e in resumed] == [{"entity_id": KITCHEN, "reason": "service"}]
    # The cancelled timer does nothing.
    await later(hass, freezer, timedelta(minutes=10))
    assert len(resumed) == 1


async def test_an_off_automation_is_rejected(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """Only an automation that was on can be turned on at the end."""
    await setup(hass, entry)
    await automation(hass, "turn_off", KITCHEN)

    assert await _error(pause(hass, KITCHEN)) == "already_off"
    assert not manager(entry).paused


async def test_an_automation_without_id_is_rejected(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    assert await _error(pause(hass, NO_ID)) == "no_id"
    assert state(hass, NO_ID) == STATE_ON


@pytest.mark.parametrize(
    ("entity_id", "key"),
    [
        ("automation.test_does_not_exist", "not_found"),
        (SENSOR_ENTITY_ID, "not_automation"),
    ],
)
async def test_a_wrong_entity_is_rejected(
    hass: HomeAssistant, automations, entry: MockConfigEntry, entity_id, key
) -> None:
    await setup(hass, entry)
    assert await _error(pause(hass, entity_id)) == key


async def test_an_unavailable_automation_is_rejected(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    attributes = dict(hass.states.get(KITCHEN).attributes)
    hass.states.async_set(KITCHEN, "unavailable", attributes)

    assert await _error(pause(hass, KITCHEN)) == "unavailable"


@pytest.mark.parametrize(
    ("duration", "key"),
    [
        ({"seconds": 59}, "duration_too_short"),
        ({"minutes": 1}, None),
        ({"days": 365}, None),
        ({"days": 365, "seconds": 1}, "duration_too_long"),
    ],
)
async def test_duration_bounds(
    hass: HomeAssistant, automations, entry: MockConfigEntry, duration, key
) -> None:
    await setup(hass, entry)
    if key is None:
        await pause(hass, KITCHEN, duration)
        assert KITCHEN in manager(entry).paused
    else:
        assert await _error(pause(hass, KITCHEN, duration)) == key
        assert state(hass, KITCHEN) == STATE_ON


async def test_duration_as_text(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """An automation can give the duration as HH:MM:SS, like a delay."""
    await setup(hass, entry)
    now = dt_util.utcnow()
    await pause(hass, KITCHEN, "01:30:00")
    assert manager(entry).paused[KITCHEN].resume_at - now >= timedelta(minutes=90)


async def test_several_automations_in_one_call(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    started = async_capture_events(hass, EVENT_PAUSE_STARTED)

    await pause(hass, [KITCHEN, GARDEN])

    assert state(hass, KITCHEN) == STATE_OFF
    assert state(hass, GARDEN) == STATE_OFF
    assert sorted(e.data["entity_id"] for e in started) == [GARDEN, KITCHEN]

    await resume(hass, [KITCHEN, GARDEN])
    assert state(hass, KITCHEN) == STATE_ON
    assert state(hass, GARDEN) == STATE_ON


@pytest.mark.parametrize(
    ("others", "key"),
    [
        ([NO_ID], "no_id"),
        (["automation.test_does_not_exist"], "not_found"),
        ([SENSOR_ENTITY_ID], "not_automation"),
    ],
)
async def test_one_bad_entity_pauses_nothing(
    hass: HomeAssistant, automations, entry: MockConfigEntry, others, key
) -> None:
    """All or nothing: every entity is checked before any is turned off."""
    await setup(hass, entry)
    assert await _error(pause(hass, [KITCHEN, *others])) == key
    assert state(hass, KITCHEN) == STATE_ON
    assert not manager(entry).paused


async def test_one_off_automation_pauses_nothing(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    await automation(hass, "turn_off", GARDEN)
    assert await _error(pause(hass, [KITCHEN, GARDEN])) == "already_off"
    assert state(hass, KITCHEN) == STATE_ON


async def test_one_unpaused_automation_resumes_nothing(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    assert await _error(resume(hass, [KITCHEN, GARDEN])) == "not_paused"
    assert state(hass, KITCHEN) == STATE_OFF
    assert KITCHEN in manager(entry).paused


async def test_no_target_is_rejected(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    call = hass.services.async_call(
        DOMAIN, SERVICE_PAUSE, {"duration": {"minutes": 5}}, blocking=True
    )
    assert await _error(call) == "no_entities"
    call = hass.services.async_call(DOMAIN, SERVICE_RESUME, {}, blocking=True)
    assert await _error(call) == "no_entities"


async def test_a_label_targets_only_its_automations(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """A label, area or device can hold other entities; they are skipped."""
    await setup(hass, entry)
    label = lr.async_get(hass).async_create("Test pausable")
    registry = er.async_get(hass)
    registry.async_update_entity(GARDEN, labels={label.label_id})
    registry.async_update_entity(SENSOR_ENTITY_ID, labels={label.label_id})

    await hass.services.async_call(
        DOMAIN,
        SERVICE_PAUSE,
        {"label_id": label.label_id, "duration": {"minutes": 5}},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert list(manager(entry).paused) == [GARDEN]

    await hass.services.async_call(
        DOMAIN, SERVICE_RESUME, {"label_id": label.label_id}, blocking=True
    )
    await hass.async_block_till_done()
    assert not manager(entry).paused
    assert state(hass, GARDEN) == STATE_ON


async def test_an_action_without_a_loaded_entry_is_rejected(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    assert await _error(pause(hass, KITCHEN)) == "not_loaded"
    assert await _error(resume(hass, KITCHEN)) == "not_loaded"
    assert state(hass, KITCHEN) == STATE_ON
