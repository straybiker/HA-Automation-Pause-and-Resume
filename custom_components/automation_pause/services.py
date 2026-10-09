"""The pause and resume actions."""

from __future__ import annotations

from typing import TYPE_CHECKING

import probatio
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.target import (
    TargetSelection,
    async_extract_referenced_entity_ids,
)
from homeassistant.helpers.typing import VolDictType

from .const import (
    ATTR_DURATION,
    ATTR_STOP_ACTIONS,
    DEFAULT_STOP_ACTIONS,
    DOMAIN,
    SERVICE_PAUSE,
    SERVICE_RESUME,
)

if TYPE_CHECKING:
    from . import AutomationPauseConfigEntry
    from .manager import PauseManager

# The target fields are optional here, so an empty target gets a clear
# message (no_entities) instead of a schema error.
_PAUSE_FIELDS: VolDictType = {
    **cv.ENTITY_SERVICE_FIELDS,
    probatio.Required(ATTR_DURATION): cv.time_period,
    probatio.Optional(ATTR_STOP_ACTIONS, default=DEFAULT_STOP_ACTIONS): cv.boolean,
}
PAUSE_SCHEMA = probatio.Schema(_PAUSE_FIELDS)
RESUME_SCHEMA = probatio.Schema(cv.ENTITY_SERVICE_FIELDS)

AUTOMATION_PREFIX = "automation."


@callback
def async_setup(hass: HomeAssistant) -> None:
    """Register the actions once; they find the manager at call time."""

    async def pause(call: ServiceCall) -> None:
        manager = _manager(hass)
        await manager.async_pause(
            _automations(hass, call),
            call.data[ATTR_DURATION],
            call.data[ATTR_STOP_ACTIONS],
            context=call.context,
        )

    async def resume(call: ServiceCall) -> None:
        manager = _manager(hass)
        await manager.async_resume(_automations(hass, call), context=call.context)

    hass.services.async_register(DOMAIN, SERVICE_PAUSE, pause, schema=PAUSE_SCHEMA)
    hass.services.async_register(DOMAIN, SERVICE_RESUME, resume, schema=RESUME_SCHEMA)


def _manager(hass: HomeAssistant) -> PauseManager:
    if not (entries := hass.config_entries.async_loaded_entries(DOMAIN)):
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="not_loaded",
        )
    entry: AutomationPauseConfigEntry = entries[0]
    return entry.runtime_data


def _automations(hass: HomeAssistant, call: ServiceCall) -> list[str]:
    """The automations in the target.

    An entity named in the call must be an automation. A device, area or
    label can hold other entities too; only its automations count.
    """
    selected = async_extract_referenced_entity_ids(hass, TargetSelection(call.data))
    for entity_id in sorted(selected.referenced):
        if not entity_id.startswith(AUTOMATION_PREFIX):
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="not_automation",
                translation_placeholders={"entity_id": entity_id},
            )
    entity_ids = sorted(
        selected.referenced
        | {e for e in selected.indirectly_referenced if e.startswith(AUTOMATION_PREFIX)}
    )
    if not entity_ids:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="no_entities",
        )
    return entity_ids
