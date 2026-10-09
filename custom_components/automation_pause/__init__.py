"""Automation Pause and Resume: pause an automation for a set time."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType

from . import dashboard, frontend, notification, services
from .const import CONF_NOTIFY_RESUMED, DOMAIN, LOGGER
from .manager import PauseManager

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
PLATFORMS = [Platform.SENSOR]

type AutomationPauseConfigEntry = ConfigEntry[PauseManager]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the actions and the card once per Home Assistant run."""
    services.async_setup(hass)
    await frontend.async_register(hass)
    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: AutomationPauseConfigEntry
) -> bool:
    manager = PauseManager(hass)
    await manager.async_load()
    entry.runtime_data = manager
    entry.async_on_unload(manager.async_stop)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # Before the startup rules: a pause that ended while Home Assistant was
    # down also gets its notification.
    if entry.options.get(CONF_NOTIFY_RESUMED):
        entry.async_on_unload(notification.async_setup(hass))
    # Timers start once every automation is loaded, so the startup rules
    # see the real state of each paused automation.
    entry.async_on_unload(async_at_started(hass, manager.async_start))
    # The dashboard uses Lovelace internals, so a failure there must not stop
    # the pauses.
    try:
        await dashboard.async_setup(hass, entry)
    except Exception:  # noqa: BLE001
        LOGGER.warning("The dashboard could not be set up", exc_info=True)
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: AutomationPauseConfigEntry
) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(
    hass: HomeAssistant, entry: AutomationPauseConfigEntry
) -> None:
    """Turn the paused automations on again, then delete the pauses and the
    dashboard: nothing else would turn those automations on."""
    await PauseManager.async_remove(hass)
    await dashboard.async_remove(hass, entry)
