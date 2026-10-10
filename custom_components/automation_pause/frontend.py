"""Serve the card and load it on every page of the frontend.

The integration ships its card in the frontend/ folder. Home Assistant
serves that folder under /automation_pause, and the frontend imports the
loader as an extra module. The loader imports the card and writes a load
failure to the Home Assistant log; the frontend would only print it to the
browser console. So the card works in any dashboard with no manual
resource and no second HACS install.

The URL carries the integration version. The files are served with long
cache headers, and a new version is a new URL, so browsers load a new card
after an update and use their cache until then.
"""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration
from homeassistant.util.hass_dict import HassKey

from .const import CARD_URL_BASE, DOMAIN, LOADER_FILE

# The built card. The folder must exist when Home Assistant starts; the file
# in it is read on each request.
CARD_DIR = Path(__file__).parent / "frontend"

# A second registration of the same path would make aiohttp raise.
_REGISTERED: HassKey[bool] = HassKey(f"{DOMAIN}_frontend")


def loader_url(version: str) -> str:
    return f"{CARD_URL_BASE}/{LOADER_FILE}?v={version}"


async def async_register(hass: HomeAssistant) -> None:
    """Serve the card folder and add the card to the frontend, once per run."""
    if hass.data.get(_REGISTERED):
        return
    # Set before the first await, so a parallel call cannot register twice.
    hass.data[_REGISTERED] = True
    integration = await async_get_integration(hass, DOMAIN)
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL_BASE, str(CARD_DIR), cache_headers=True)]
    )
    frontend.add_extra_js_url(hass, loader_url(str(integration.version)))
