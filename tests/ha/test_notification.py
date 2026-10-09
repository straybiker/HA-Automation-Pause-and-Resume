"""The notification when the timer ends a pause."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause.const import (
    EVENT_PAUSE_RESUMED,
    REASON_TIMER,
)
from custom_components.automation_pause.notification import TITLE, notification_id

from .common import automation, later, pause, resume
from .conftest import KITCHEN, make_entry, setup


def _notifications(hass: HomeAssistant) -> dict[str, dict]:
    return persistent_notification._async_get_or_create_notifications(hass)


async def _with_option(hass: HomeAssistant) -> MockConfigEntry:
    entry = make_entry(hass, notify_resumed=True)
    await setup(hass, entry)
    return entry


async def test_no_notification_without_the_option(
    hass: HomeAssistant, automations, entry: MockConfigEntry, freezer
) -> None:
    await setup(hass, entry)
    await pause(hass, KITCHEN)
    await later(hass, freezer, timedelta(minutes=5))
    assert notification_id(KITCHEN) not in _notifications(hass)


async def test_the_timer_end_shows_a_notification(
    hass: HomeAssistant, automations, freezer
) -> None:
    await _with_option(hass)
    await pause(hass, KITCHEN)
    await later(hass, freezer, timedelta(minutes=5))
    shown = _notifications(hass)[notification_id(KITCHEN)]
    assert shown["title"] == TITLE
    assert "Test kitchen lights" in shown["message"]


async def test_a_second_end_replaces_the_notification(
    hass: HomeAssistant, automations, freezer
) -> None:
    await _with_option(hass)
    for _ in range(2):
        await pause(hass, KITCHEN)
        await later(hass, freezer, timedelta(minutes=5))
    ours = [key for key in _notifications(hass) if key == notification_id(KITCHEN)]
    assert len(ours) == 1


async def test_a_resume_by_the_user_shows_none(
    hass: HomeAssistant, automations
) -> None:
    await _with_option(hass)
    await pause(hass, KITCHEN)
    await resume(hass, KITCHEN)
    assert notification_id(KITCHEN) not in _notifications(hass)


async def test_a_manual_turn_on_shows_none(hass: HomeAssistant, automations) -> None:
    await _with_option(hass)
    await pause(hass, KITCHEN)
    await automation(hass, "turn_on", KITCHEN)
    assert notification_id(KITCHEN) not in _notifications(hass)


async def test_unload_stops_the_notifications(hass: HomeAssistant, automations) -> None:
    entry = await _with_option(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    hass.bus.async_fire(
        EVENT_PAUSE_RESUMED, {"entity_id": KITCHEN, "reason": REASON_TIMER}
    )
    await hass.async_block_till_done()
    assert notification_id(KITCHEN) not in _notifications(hass)


async def test_an_automation_without_a_state_uses_its_entity_id(
    hass: HomeAssistant, automations
) -> None:
    await _with_option(hass)
    gone = "automation.test_gone"
    hass.bus.async_fire(
        EVENT_PAUSE_RESUMED, {"entity_id": gone, "reason": REASON_TIMER}
    )
    await hass.async_block_till_done()
    assert gone in _notifications(hass)[notification_id(gone)]["message"]
