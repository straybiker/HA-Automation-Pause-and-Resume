"""The setup flow and the options flow."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause.const import DOMAIN

from .conftest import setup


async def _start(hass: HomeAssistant):
    return await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )


async def test_flow_creates_the_entry_with_the_defaults(
    hass: HomeAssistant, automations
) -> None:
    result = await _start(hass)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Automation Pause and Resume"
    assert result["data"] == {}
    # The dashboard is on by default, with the integration name.
    assert result["options"] == {
        "dashboard": True,
        "dashboard_title": "Automation Pause and Resume",
    }


async def test_flow_keeps_the_choices(hass: HomeAssistant, automations) -> None:
    result = await _start(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"dashboard": False, "dashboard_title": "Pauses"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    entry = result["result"]
    assert entry.options == {"dashboard": False, "dashboard_title": "Pauses"}
    assert entry.title == "Automation Pause and Resume"


async def test_a_second_flow_aborts(
    hass: HomeAssistant, entry: MockConfigEntry
) -> None:
    result = await _start(hass)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def test_options_flow_shows_the_current_choice(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "init"
    # An empty answer keeps the dashboard off.
    result = await hass.config_entries.options.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options == {"dashboard": False}


async def test_options_flow_clears_the_name(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"dashboard": False, "dashboard_title": "Pauses"}
    )
    assert entry.options == {"dashboard": False, "dashboard_title": "Pauses"}
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"dashboard": False}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options == {"dashboard": False}
