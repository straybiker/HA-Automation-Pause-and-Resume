"""Config and options flow: one entry, with the dashboard as the only choice.

The pauses need no settings. The flow only asks whether to add the sidebar
dashboard and what to call it. The options flow can change both, and can
rebuild the dashboard.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import probatio
from homeassistant.helpers import selector
from homeassistant.helpers.schema_config_entry_flow import (
    SchemaCommonFlowHandler,
    SchemaConfigFlowHandler,
    SchemaFlowFormStep,
    SchemaOptionsFlowHandler,
)
from homeassistant.util import dt as dt_util

from . import dashboard
from .const import (
    CONF_DASHBOARD,
    CONF_DASHBOARD_REBUILD,
    CONF_DASHBOARD_REBUILT,
    CONF_DASHBOARD_TITLE,
    DOMAIN,
    NAME,
)

USER_SCHEMA = probatio.Schema(
    {
        probatio.Required(CONF_DASHBOARD, default=True): selector.BooleanSelector(),
        probatio.Optional(CONF_DASHBOARD_TITLE, default=NAME): selector.TextSelector(),
    }
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
                CONF_DASHBOARD_REBUILD, default=False
            ): selector.BooleanSelector(),
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
            await dashboard.async_remove(parent.hass, parent.config_entry)
        user_input[CONF_DASHBOARD_REBUILT] = dt_util.utcnow().isoformat()
    return user_input


CONFIG_FLOW = {"user": SchemaFlowFormStep(USER_SCHEMA)}
OPTIONS_FLOW = {
    "init": SchemaFlowFormStep(_options_schema, validate_user_input=_validate_dashboard)
}


class AutomationPauseConfigFlow(SchemaConfigFlowHandler, domain=DOMAIN):
    """One entry per Home Assistant: the manifest sets single_config_entry."""

    config_flow = CONFIG_FLOW
    options_flow = OPTIONS_FLOW
    options_flow_reloads = True

    def async_config_entry_title(self, options: Mapping[str, Any]) -> str:
        return NAME
