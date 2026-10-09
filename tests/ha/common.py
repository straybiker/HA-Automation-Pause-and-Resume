"""Helpers for the pause tests. All entity ids are fake."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from freezegun.api import FrozenDateTimeFactory
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.automation_pause.const import (
    DOMAIN,
    SERVICE_PAUSE,
    SERVICE_RESUME,
)
from custom_components.automation_pause.manager import PauseManager

from .conftest import SENSOR

FIVE_MINUTES = {"minutes": 5}


async def pause(
    hass: HomeAssistant, entity_id: str | list[str], duration: Any = None, **data: Any
) -> None:
    await hass.services.async_call(
        DOMAIN,
        SERVICE_PAUSE,
        {"entity_id": entity_id, "duration": duration or FIVE_MINUTES} | data,
        blocking=True,
    )
    await hass.async_block_till_done()


async def resume(hass: HomeAssistant, entity_id: str | list[str]) -> None:
    await hass.services.async_call(
        DOMAIN, SERVICE_RESUME, {"entity_id": entity_id}, blocking=True
    )
    await hass.async_block_till_done()


async def automation(hass: HomeAssistant, service: str, entity_id: str) -> None:
    """Turn an automation on or off, as a user does."""
    await hass.services.async_call(
        "automation", service, {"entity_id": entity_id}, blocking=True
    )
    await hass.async_block_till_done()


async def later(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, delta: timedelta
) -> None:
    freezer.tick(delta)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


def manager(entry: MockConfigEntry) -> PauseManager:
    return entry.runtime_data


def state(hass: HomeAssistant, entity_id: str) -> str:
    current = hass.states.get(entity_id)
    assert current is not None, entity_id
    return current.state


def sensor(hass: HomeAssistant) -> tuple[str, list[str]]:
    """The sensor state and the entity ids in its attribute, in order."""
    current = hass.states.get(SENSOR)
    assert current is not None
    return current.state, [p["entity_id"] for p in current.attributes["paused"]]
