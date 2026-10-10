"""The dashboard in the sidebar."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from homeassistant.components import frontend
from homeassistant.components.frontend import DATA_PANELS
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, STATE_OFF
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.setup import async_setup_component
from homeassistant.util.hass_dict import HassKey
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.automation_pause import dashboard
from custom_components.automation_pause.const import DOMAIN

from .conftest import KITCHEN, SENSOR, make_entry, setup

# The dashboard with the default name.
PATH = "automation-pause-and-resume"
CARD = {"type": "custom:automation-pause-card"}


@pytest.fixture
async def lovelace(hass: HomeAssistant) -> None:
    assert await async_setup_component(hass, "lovelace", {})


@pytest.fixture
def with_dashboard(hass: HomeAssistant) -> MockConfigEntry:
    return make_entry(hass, dashboard=True)


async def _config(hass: HomeAssistant, path: str = PATH) -> dict:
    return await hass.data[LOVELACE_DATA].dashboards[path].async_load(False)


def _panels(hass: HomeAssistant) -> dict:
    return hass.data.get(DATA_PANELS, {})


async def _options(hass: HomeAssistant, entry: MockConfigEntry, data: dict) -> None:
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["step_id"] == "init"
    result = await hass.config_entries.options.async_configure(result["flow_id"], data)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()


async def test_dashboard_in_the_sidebar(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    panel = _panels(hass)[PATH]
    assert panel.component_name == "lovelace"
    assert panel.sidebar_icon == "mdi:timer-pause-outline"
    config = await _config(hass)
    assert config == {
        "title": "Automation Pause and Resume",
        "views": [
            {
                "title": "Automation Pause and Resume",
                "path": "automations",
                "icon": "mdi:timer-pause-outline",
                "type": "panel",
                "cards": [CARD],
            }
        ],
    }


async def test_no_dashboard_without_the_option(
    hass: HomeAssistant, automations, lovelace, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    assert PATH not in _panels(hass)
    assert PATH not in hass.data[LOVELACE_DATA].dashboards


async def test_unload_removes_the_panel(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    assert await hass.config_entries.async_unload(with_dashboard.entry_id)
    await hass.async_block_till_done()
    assert PATH not in _panels(hass)
    assert PATH not in hass.data[LOVELACE_DATA].dashboards


async def test_edits_survive_a_reload(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    mine = {"views": [{"title": "Mine", "path": "mine"}]}
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save(mine)
    assert await hass.config_entries.async_reload(with_dashboard.entry_id)
    await hass.async_block_till_done()
    assert await _config(hass) == mine


async def test_rebuild_discards_the_edits(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save({"views": []})
    await _options(hass, with_dashboard, {"dashboard": True, "dashboard_rebuild": True})
    config = await _config(hass)
    assert config["views"][0]["cards"] == [CARD]
    # An action, not a setting.
    assert "dashboard_rebuild" not in with_dashboard.options


async def test_no_rebuild_when_the_form_has_an_error(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    """The rebuild deletes the dashboard at once, so a bad duration must stop
    it first: the user can still cancel the form."""
    await setup(hass, with_dashboard)
    mine = {"views": [{"title": "Mine", "path": "mine"}]}
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save(mine)
    result = await hass.config_entries.options.async_init(with_dashboard.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"dashboard": True, "dashboard_rebuild": True, "durations": ["soon"]},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_duration"}
    assert await _config(hass) == mine


async def test_rebuild_without_other_changes(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    """Home Assistant reloads only when the options change; a rebuild alone
    must still build the dashboard again."""
    await setup(hass, with_dashboard)
    await _options(hass, with_dashboard, {"dashboard": True})
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save({"views": []})
    before = dict(with_dashboard.options)
    await _options(hass, with_dashboard, {"dashboard": True, "dashboard_rebuild": True})
    after = dict(with_dashboard.options)
    # Only the rebuild time changed.
    assert after.pop("dashboard_rebuilt")
    assert after == before
    config = await _config(hass)
    assert config["views"][0]["cards"] == [CARD]


async def test_option_adds_and_removes_the_dashboard_later(
    hass: HomeAssistant, automations, lovelace, entry: MockConfigEntry
) -> None:
    await setup(hass, entry)
    await _options(hass, entry, {"dashboard": True})
    assert PATH in _panels(hass)
    await _options(hass, entry, {"dashboard": False})
    assert PATH not in _panels(hass)
    assert PATH not in hass.data[LOVELACE_DATA].dashboards


async def test_option_off_deletes_the_edits(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save({"views": []})
    await _options(hass, with_dashboard, {"dashboard": False})
    await _options(hass, with_dashboard, {"dashboard": True})
    config = await _config(hass)
    assert config["views"][0]["cards"] == [CARD]


async def test_the_user_names_the_dashboard(
    hass: HomeAssistant, automations, lovelace
) -> None:
    entry = make_entry(hass, dashboard=True, dashboard_title="Paused for now")
    await setup(hass, entry)
    assert _panels(hass)["paused-for-now"].sidebar_title == "Paused for now"
    assert (await _config(hass, "paused-for-now"))["title"] == "Paused for now"
    assert PATH not in _panels(hass)


async def test_a_one_word_name_gets_a_hyphen(
    hass: HomeAssistant, automations, lovelace
) -> None:
    """Lovelace needs a hyphen in a dashboard path."""
    entry = make_entry(hass, dashboard=True, dashboard_title="Pauses")
    await setup(hass, entry)
    assert _panels(hass)["pauses-automation-pause"].sidebar_title == "Pauses"


async def test_a_new_name_keeps_the_content(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    mine = {"views": [{"title": "Mine", "path": "mine"}]}
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save(mine)
    await _options(
        hass, with_dashboard, {"dashboard": True, "dashboard_title": "Paused for now"}
    )
    assert PATH not in _panels(hass)
    assert _panels(hass)["paused-for-now"].sidebar_title == "Paused for now"
    assert await _config(hass, "paused-for-now") == mine


async def test_a_dashboard_failure_does_not_stop_the_entry(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    with patch(
        "custom_components.automation_pause.dashboard.async_setup",
        side_effect=RuntimeError("lovelace changed"),
    ):
        await setup(hass, with_dashboard)
    assert with_dashboard.state is ConfigEntryState.LOADED
    assert hass.states.get(SENSOR) is not None
    await hass.services.async_call(
        DOMAIN,
        "pause",
        {"entity_id": KITCHEN, "duration": {"minutes": 15}},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert hass.states.get(KITCHEN).state == STATE_OFF


async def test_edits_at_startup_are_not_built_again(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    hass.set_state(CoreState.not_running)
    await setup(hass, with_dashboard)
    mine = {"views": [{"title": "Mine", "path": "mine"}]}
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save(mine)
    hass.set_state(CoreState.running)
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()
    assert await _config(hass) == mine


async def test_removing_the_entry_deletes_the_dashboard(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    await setup(hass, with_dashboard)
    await hass.data[LOVELACE_DATA].dashboards[PATH].async_save({"views": []})
    assert await hass.config_entries.async_remove(with_dashboard.entry_id)
    await hass.async_block_till_done()
    assert PATH not in _panels(hass)
    assert await dashboard._store(hass, with_dashboard).async_load() is None


async def test_a_used_path_gets_part_of_the_entry_id(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    frontend.async_register_built_in_panel(
        hass, "lovelace", frontend_url_path=PATH, config={"mode": "storage"}
    )
    await setup(hass, with_dashboard)
    path = f"{PATH}-{with_dashboard.entry_id[-6:].lower()}"
    assert _panels(hass)[path].sidebar_title == "Automation Pause and Resume"
    assert (await _config(hass, path))["views"][0]["cards"] == [CARD]


async def test_no_dashboard_without_lovelace(
    hass: HomeAssistant,
    automations,
    with_dashboard: MockConfigEntry,
    caplog: pytest.LogCaptureFixture,
) -> None:
    with patch.object(dashboard, "LOVELACE_DATA", HassKey("test_no_lovelace")):
        await setup(hass, with_dashboard)
    assert with_dashboard.state is ConfigEntryState.LOADED
    assert PATH not in _panels(hass)
    assert "Dashboards are not loaded" in caplog.text


async def test_the_dashboard_is_for_everyone_by_default(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    """An entry from before the option has no such key: not admin only."""
    assert "dashboard_require_admin" not in with_dashboard.options
    await setup(hass, with_dashboard)
    assert _panels(hass)[PATH].require_admin is False
    board = hass.data[LOVELACE_DATA].dashboards[PATH]
    assert board.config["require_admin"] is False


async def test_admin_only(
    hass: HomeAssistant, automations, lovelace, with_dashboard: MockConfigEntry
) -> None:
    """The reload after the options flow registers the panel again."""
    await setup(hass, with_dashboard)
    await _options(
        hass, with_dashboard, {"dashboard": True, "dashboard_require_admin": True}
    )
    assert _panels(hass)[PATH].require_admin is True
    assert hass.data[LOVELACE_DATA].dashboards[PATH].config["require_admin"] is True

    await _options(
        hass, with_dashboard, {"dashboard": True, "dashboard_require_admin": False}
    )
    assert _panels(hass)[PATH].require_admin is False
