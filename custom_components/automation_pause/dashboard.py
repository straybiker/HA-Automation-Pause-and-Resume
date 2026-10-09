"""The dashboard in the sidebar.

Home Assistant has no public API for an integration to create a dashboard.
The integration registers its own Lovelace panel, as Lovelace does for each
storage dashboard, with the configuration in a store of its own. The panel
shows in Settings > Dashboards, but it is not an item of Lovelace's
dashboard collection: its name and icon come from the integration. The user
can edit it in the UI. The Dashboard option removes it; Rebuild the
dashboard discards the edits and generates it again.

The dashboard holds one panel view with the integration's own card. The
integration serves that card itself (see frontend.py), so the dashboard
needs no HACS card and no manual resource.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components import frontend
from homeassistant.components.lovelace import dashboard as lovelace
from homeassistant.components.lovelace.const import LOVELACE_DATA, ConfigNotFound
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.util import slugify

from .const import (
    CARD_ELEMENT,
    CONF_DASHBOARD,
    CONF_DASHBOARD_TITLE,
    DOMAIN,
    LOGGER,
    NAME,
)

# Lovelace's own store layout, so its websocket API loads and saves the config.
_LOVELACE_STORE_KEY = "lovelace.{}"
_LOVELACE_STORE_VERSION = 1
_ICON = "mdi:timer-pause-outline"


def _store_id(entry: ConfigEntry) -> str:
    return f"{DOMAIN}_{entry.entry_id}"


def _store(hass: HomeAssistant, entry: ConfigEntry) -> Store[dict[str, Any]]:
    return Store(
        hass, _LOVELACE_STORE_VERSION, _LOVELACE_STORE_KEY.format(_store_id(entry))
    )


async def async_remove(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the saved dashboard; the next setup with the option builds it anew."""
    await _store(hass, entry).async_remove()


def title(entry: ConfigEntry) -> str:
    """The name from the setup, or the integration name when it is empty."""
    return (entry.options.get(CONF_DASHBOARD_TITLE) or "").strip() or NAME


def url_path(hass: HomeAssistant, entry: ConfigEntry) -> str:
    """A path from the title.

    Lovelace requires a hyphen in a dashboard path, so that it cannot hide a
    built-in panel such as "config". A one-word title gets the domain added.
    The entry ID is added when another panel already uses the path.
    """
    base = slugify(title(entry), separator="-") or slugify(NAME, separator="-")
    if "-" not in base:
        base = f"{base}-{slugify(DOMAIN, separator='-')}"
    if frontend.async_panel_exists(hass, base):
        return f"{base}-{entry.entry_id[-6:].lower()}"
    return base


async def async_setup(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Show the dashboard when the option is on; otherwise delete it."""
    if not entry.options.get(CONF_DASHBOARD):
        await async_remove(hass, entry)
        return
    if LOVELACE_DATA not in hass.data:
        LOGGER.warning("Dashboards are not loaded; no dashboard is added")
        return

    path = url_path(hass, entry)
    name = title(entry)
    board = lovelace.LovelaceStorage(
        hass,
        {
            "id": _store_id(entry),
            "url_path": path,
            "title": name,
            "icon": _ICON,
            "mode": "storage",
            "show_in_sidebar": True,
            "require_admin": False,
        },
    )
    # The config reads no state, so a build during startup is final.
    try:
        await board.async_load(False)
    except ConfigNotFound:
        await board.async_save(build(entry))

    dashboards = hass.data[LOVELACE_DATA].dashboards
    dashboards[path] = board
    frontend.async_register_built_in_panel(
        hass,
        "lovelace",
        sidebar_title=name,
        sidebar_icon=_ICON,
        frontend_url_path=path,
        config={"mode": "storage"},
        update=True,
    )

    @callback
    def _hide() -> None:
        frontend.async_remove_panel(hass, path, warn_if_unknown=False)
        dashboards.pop(path, None)

    entry.async_on_unload(_hide)


def build(entry: ConfigEntry) -> dict[str, Any]:
    """One panel view, so the card fills the page like Settings > Automations."""
    name = title(entry)
    return {
        "title": name,
        "views": [
            {
                "title": name,
                "path": "automations",
                "icon": _ICON,
                "type": "panel",
                "cards": [{"type": f"custom:{CARD_ELEMENT}"}],
            }
        ],
    }
