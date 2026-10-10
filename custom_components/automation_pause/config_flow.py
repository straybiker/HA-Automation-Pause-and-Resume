"""Config and options flow: one entry, with the dashboard as the only choice.

The pauses need no settings. The flow only asks whether to add the sidebar
dashboard and what to call it. The options flow can change both, can limit
the dashboard to administrators, can rebuild it, and sets the durations in
the card's pause dialog. A new entry has no durations option: it uses the
defaults until the user saves the options.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any, override

import probatio
from homeassistant.helpers import selector
from homeassistant.helpers.schema_config_entry_flow import (
    SchemaCommonFlowHandler,
    SchemaConfigFlowHandler,
    SchemaFlowError,
    SchemaFlowFormStep,
    SchemaOptionsFlowHandler,
)
from homeassistant.util import dt as dt_util

from . import dashboard, durations
from .const import (
    CONF_DASHBOARD,
    CONF_DASHBOARD_REBUILD,
    CONF_DASHBOARD_REBUILT,
    CONF_DASHBOARD_REQUIRE_ADMIN,
    CONF_DASHBOARD_TITLE,
    CONF_DURATIONS,
    CONF_NOTIFY_RESUMED,
    DEFAULT_DURATIONS,
    DOMAIN,
    DURATION_CHOICES,
    NAME,
)

if TYPE_CHECKING:
    from . import AutomationPauseConfigEntry

USER_SCHEMA = probatio.Schema(
    {
        probatio.Required(CONF_DASHBOARD, default=True): selector.BooleanSelector(),
        probatio.Optional(CONF_DASHBOARD_TITLE, default=NAME): selector.TextSelector(),
    }
)

# Labels of the fixed choices: strings.json, selector.durations. sort=False
# keeps them short to long instead of A to Z.
DURATIONS_SELECTOR = selector.SelectSelector(
    selector.SelectSelectorConfig(
        options=list(DURATION_CHOICES),
        multiple=True,
        custom_value=True,
        sort=False,
        mode=selector.SelectSelectorMode.DROPDOWN,
        translation_key=CONF_DURATIONS,
    )
)


async def _options_schema(handler: SchemaCommonFlowHandler) -> probatio.Schema:
    """The current choice is the default, so an empty answer changes nothing."""
    return probatio.Schema(
        {
            probatio.Required(
                CONF_DASHBOARD, default=bool(handler.options.get(CONF_DASHBOARD))
            ): selector.BooleanSelector(),
            probatio.Optional(CONF_DASHBOARD_TITLE): selector.TextSelector(),
            probatio.Required(
                CONF_DASHBOARD_REQUIRE_ADMIN,
                default=bool(handler.options.get(CONF_DASHBOARD_REQUIRE_ADMIN)),
            ): selector.BooleanSelector(),
            probatio.Required(
                CONF_DASHBOARD_REBUILD, default=False
            ): selector.BooleanSelector(),
            probatio.Required(
                CONF_NOTIFY_RESUMED,
                default=bool(handler.options.get(CONF_NOTIFY_RESUMED)),
            ): selector.BooleanSelector(),
            probatio.Required(
                CONF_DURATIONS,
                default=list(handler.options.get(CONF_DURATIONS, DEFAULT_DURATIONS)),
            ): DURATIONS_SELECTOR,
        }
    )


async def _validate_dashboard(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Rebuild is an action, not a setting: delete the saved dashboard now.

    The reload builds it again. Home Assistant reloads after an options flow
    only when the options changed, so the rebuild time is saved as an
    option: a rebuild alone still reloads, after the options are saved.
    """
    if user_input.pop(CONF_DASHBOARD_REBUILD, False):
        parent = handler.parent_handler
        if isinstance(parent, SchemaOptionsFlowHandler):
            entry: AutomationPauseConfigEntry = parent.config_entry
            await dashboard.async_remove(parent.hass, entry)
        user_input[CONF_DASHBOARD_REBUILT] = dt_util.utcnow().isoformat()
    return user_input


async def _validate_options(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """The durations first: a rebuild deletes the dashboard at once, so it
    must not run when the form comes back with an error.

    The durations are stored normalized: sorted, each length of time once,
    in the largest whole unit. An empty list is valid: the card then shows
    only Custom.
    """
    try:
        user_input[CONF_DURATIONS] = durations.normalize(user_input[CONF_DURATIONS])
    except ValueError as err:
        raise SchemaFlowError("invalid_duration") from err
    return await _validate_dashboard(handler, user_input)


CONFIG_FLOW = {"user": SchemaFlowFormStep(USER_SCHEMA)}
OPTIONS_FLOW = {
    "init": SchemaFlowFormStep(_options_schema, validate_user_input=_validate_options)
}


class AutomationPauseConfigFlow(SchemaConfigFlowHandler, domain=DOMAIN):
    """One entry per Home Assistant: the manifest sets single_config_entry."""

    config_flow = CONFIG_FLOW
    options_flow = OPTIONS_FLOW
    options_flow_reloads = True

    @override
    def async_config_entry_title(self, options: Mapping[str, Any]) -> str:
        return NAME
