"""The card: served by the integration and loaded on every page."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.automation_pause import frontend
from custom_components.automation_pause.const import CARD_FILE

from .conftest import setup

MANIFEST = (
    Path(__file__).parents[2]
    / "custom_components"
    / "automation_pause"
    / "manifest.json"
)
CARD_PATH = f"/automation_pause/{CARD_FILE}"


def _version() -> str:
    return json.loads(MANIFEST.read_text(encoding="utf-8"))["version"]


def _card_urls(hass: HomeAssistant) -> list[str]:
    return [url for url in hass.data[DATA_EXTRA_MODULE_URL].urls if CARD_FILE in url]


async def test_card_url_carries_the_version(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    assert _card_urls(hass) == [f"{CARD_PATH}?v={_version()}"]


async def test_the_card_is_served(
    hass: HomeAssistant,
    hass_client: ClientSessionGenerator,
    automations,
    entry: MockConfigEntry,
    tmp_path: Path,
) -> None:
    (tmp_path / CARD_FILE).write_text("customElements.define('x', class {});")
    with patch.object(frontend, "CARD_DIR", tmp_path):
        await setup(hass, entry)
    client = await hass_client()
    response = await client.get(f"{CARD_PATH}?v={_version()}")
    assert response.status == 200
    assert await response.text() == "customElements.define('x', class {});"
    # Long caching is safe: a new version is a new URL.
    assert "max-age" in response.headers["Cache-Control"]


async def test_a_missing_bundle_does_not_stop_the_setup(
    hass: HomeAssistant,
    hass_client: ClientSessionGenerator,
    automations,
    entry: MockConfigEntry,
    tmp_path: Path,
) -> None:
    with patch.object(frontend, "CARD_DIR", tmp_path / "missing"):
        await setup(hass, entry)
    assert _card_urls(hass) == [f"{CARD_PATH}?v={_version()}"]
    client = await hass_client()
    response = await client.get(CARD_PATH)
    assert response.status == 404


async def test_a_second_registration_is_ignored(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    await frontend.async_register(hass)
    assert len(_card_urls(hass)) == 1
