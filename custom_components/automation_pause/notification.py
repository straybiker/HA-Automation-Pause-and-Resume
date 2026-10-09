"""A Home Assistant notification when the timer ends a pause.

It listens to the resumed event, so the pause rules in manager.py stay free
of user interface code. Only the timer counts: after a resume by the user,
by an action or by a manual turn-on, a notification would only repeat what
the user just did.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.const import ATTR_ENTITY_ID, ATTR_FRIENDLY_NAME
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback

from .const import ATTR_REASON, DOMAIN, EVENT_PAUSE_RESUMED, REASON_TIMER

TITLE = "Automation resumed"


def notification_id(entity_id: str) -> str:
    """One notification per automation: a later end replaces the earlier one."""
    return f"{DOMAIN}_{entity_id}"


@callback
def async_setup(hass: HomeAssistant) -> CALLBACK_TYPE:
    """Show a notification for each pause that the timer ends."""

    @callback
    def _resumed(event: Event[dict[str, Any]]) -> None:
        if event.data.get(ATTR_REASON) != REASON_TIMER:
            return
        entity_id = event.data[ATTR_ENTITY_ID]
        state = hass.states.get(entity_id)
        name = state.attributes.get(ATTR_FRIENDLY_NAME) if state else None
        persistent_notification.async_create(
            hass,
            f"**{name or entity_id}** is on again. Its pause has ended.",
            title=TITLE,
            notification_id=notification_id(entity_id),
        )

    return hass.bus.async_listen(EVENT_PAUSE_RESUMED, _resumed)
