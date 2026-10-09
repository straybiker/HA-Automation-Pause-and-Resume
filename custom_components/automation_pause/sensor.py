"""The sensor that lists the paused automations."""

from __future__ import annotations

from typing import Any, override

from homeassistant.components.sensor import SensorEntity
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import AutomationPauseConfigEntry
from .const import (
    ATTR_PAUSED,
    ATTR_PAUSED_AT,
    ATTR_RESUME_AT,
    DOMAIN,
    NAME,
    SENSOR_KEY,
)
from .manager import sorted_pauses

# The sensor only reads the pauses in memory: nothing to limit.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: AutomationPauseConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    async_add_entities([PausedAutomationsSensor(entry)])


class PausedAutomationsSensor(SensorEntity):
    """State: the number of pauses. Attribute: the pauses, first end first.

    The card finds this sensor by its platform, so its entity ID is free. An
    install that has sensor.paused_automations keeps it in the registry.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = SENSOR_KEY

    def __init__(self, entry: AutomationPauseConfigEntry) -> None:
        self._manager = entry.runtime_data
        self._attr_unique_id = f"{entry.entry_id}_{SENSOR_KEY}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            entry_type=DeviceEntryType.SERVICE,
            name=NAME,
        )

    @override
    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            self._manager.async_add_listener(self.async_write_ha_state)
        )

    @property
    @override
    def native_value(self) -> int:
        return len(self._manager.paused)

    @property
    @override
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
