"""The setup flow and the options flow."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause.const import DOMAIN

from .conftest import make_entry, setup

DEFAULTS = ["15m", "1h", "1d", "1w"]


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
    # single_config_entry allows one entry, so it needs no unique ID.
    assert result["result"].unique_id is None
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
    assert entry.options == {
        "dashboard": False,
        "dashboard_require_admin": False,
        "notify_resumed": False,
        "durations": DEFAULTS,
    }


async def test_options_flow_clears_the_name(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"dashboard": False, "dashboard_title": "Pauses"}
    )
    assert entry.options == {
        "dashboard": False,
        "dashboard_title": "Pauses",
        "dashboard_require_admin": False,
        "notify_resumed": False,
        "durations": DEFAULTS,
    }
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"dashboard": False}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options == {
        "dashboard": False,
        "dashboard_require_admin": False,
        "notify_resumed": False,
        "durations": DEFAULTS,
    }


def _default(result, key: str):
    """The default that the form shows for a field."""
    for field in result["data_schema"].schema:
        if field.schema == key:
            return field.default()
    raise KeyError(key)


async def test_options_flow_shows_the_default_durations(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """A new install, or an older one, has no durations option yet."""
    assert "durations" not in entry.options
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert _default(result, "durations") == DEFAULTS


async def test_options_flow_shows_the_stored_durations(
    hass: HomeAssistant, automations
) -> None:
    entry = make_entry(hass, durations=["2h"])
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert _default(result, "durations") == ["2h"]


async def test_options_flow_normalizes_the_durations(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """Sorted, each length of time once, in the largest whole unit."""
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"dashboard": False, "durations": ["1w", "90m", "60m", "1h", "7d", " 2D "]},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["durations"] == ["1h", "90m", "2d", "1w"]


async def test_options_flow_keeps_an_empty_list(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    """No durations: the card shows only Custom."""
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"dashboard": False, "durations": []}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["durations"] == []


async def test_options_flow_rejects_a_bad_duration(
    hass: HomeAssistant, automations, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    for bad in ("soon", "0m", "366d", "1.5h"):
        result = await hass.config_entries.options.async_configure(
            result["flow_id"], {"dashboard": False, "durations": ["1h", bad]}
        )
        assert result["type"] is FlowResultType.FORM
        assert result["errors"] == {"base": "invalid_duration"}
    # The form stays open and takes a valid list.
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"dashboard": False, "durations": ["45m"]}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["durations"] == ["45m"]
