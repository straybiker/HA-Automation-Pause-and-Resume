"""The sensor that lists the paused automations."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import AutomationPauseConfigEntry
from .const import (
    ATTR_PAUSED,
    ATTR_PAUSED_AT,
    ATTR_RESUME_AT,
    SENSOR_ENTITY_ID,
    SENSOR_KEY,
)
from .manager import PauseManager, sorted_pauses


async def async_setup_entry(
    hass: HomeAssistant,
    entry: AutomationPauseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([PausedAutomationsSensor(entry.entry_id, entry.runtime_data)])


class PausedAutomationsSensor(SensorEntity):
    """State: the number of pauses. Attribute: the pauses, first end first."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = SENSOR_KEY

    def __init__(self, entry_id: str, manager: PauseManager) -> None:
        self._manager = manager
        self._attr_unique_id = f"{entry_id}_{SENSOR_KEY}"
        # Fixed, so the card finds it in every language.
        self.entity_id = SENSOR_ENTITY_ID

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            self._manager.async_add_listener(self.async_write_ha_state)
        )

    @property
    def native_value(self) -> int:
        return len(self._manager.paused)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            ATTR_PAUSED: [
                {
                    ATTR_ENTITY_ID: p.entity_id,
                    ATTR_PAUSED_AT: p.paused_at.isoformat(),
                    ATTR_RESUME_AT: p.resume_at.isoformat(),
                }
                for p in sorted_pauses(self._manager.paused.values())
            ]
        }
