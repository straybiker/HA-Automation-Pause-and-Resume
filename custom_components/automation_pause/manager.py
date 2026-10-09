"""The pause rules: store, timers and the reaction to outside changes.

This module has no card or dashboard code, so the rules can move into the
core automation integration later. docs/behaviour.md is the specification.
"""

from __future__ import annotations

from collections import deque
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from functools import partial
from types import MappingProxyType
from typing import Any

from homeassistant.const import (
    ATTR_ENTITY_ID,
    ATTR_ID,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
    STATE_OFF,
    STATE_ON,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import (
    CALLBACK_TYPE,
    Context,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_state_change_event,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    ATTR_PAUSED_AT,
    ATTR_REASON,
    ATTR_RESUME_AT,
    ATTR_STOP_ACTIONS,
    DOMAIN,
    EVENT_PAUSE_RESUMED,
    EVENT_PAUSE_STARTED,
    LOGGER,
    MAX_DURATION,
    MIN_DURATION,
    REASON_MANUAL,
    REASON_REMOVED,
    REASON_SERVICE,
    REASON_TIMER,
    STORE_KEY,
    STORE_VERSION,
)

AUTOMATION = "automation"
# A state that says nothing about on or off: a reload, or a broken config.
_NO_STATE = (STATE_UNAVAILABLE, STATE_UNKNOWN)
# Only the contexts of recent calls can still show up in a state change.
_OWN_CONTEXTS = 100

type StoreData = dict[str, dict[str, str]]


@dataclass(frozen=True, slots=True)
class Pause:
    """One paused automation. Both times are aware UTC datetimes."""

    entity_id: str
    paused_at: datetime
    resume_at: datetime

    def as_dict(self) -> dict[str, str]:
        return {
            ATTR_PAUSED_AT: self.paused_at.isoformat(),
            ATTR_RESUME_AT: self.resume_at.isoformat(),
        }


def _invalid(
    *, translation_key: str, entity_id: str | None = None
) -> ServiceValidationError:
    return ServiceValidationError(
        translation_domain=DOMAIN,
        translation_key=translation_key,
        translation_placeholders=None
        if entity_id is None
        else {"entity_id": entity_id},
    )


def _time(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return dt_util.parse_datetime(value)
    except ValueError:
        return None


def _parse(entity_id: str, item: Any) -> Pause | None:
    """A stored pause; None when it cannot be read."""
    paused_at = resume_at = None
    if isinstance(item, dict):
        paused_at = _time(item.get(ATTR_PAUSED_AT))
        resume_at = _time(item.get(ATTR_RESUME_AT))
    if paused_at is None or resume_at is None:
        LOGGER.warning("Ignoring an unreadable stored pause for %s", entity_id)
        return None
    return Pause(entity_id, dt_util.as_utc(paused_at), dt_util.as_utc(resume_at))


class PauseManager:
    """Pauses automations and turns them on again when the time ends."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[StoreData] = Store(hass, STORE_VERSION, STORE_KEY)
        self._pauses: dict[str, Pause] = {}
        self._timers: dict[str, CALLBACK_TYPE] = {}
        self._own_contexts: deque[str] = deque(maxlen=_OWN_CONTEXTS)
        # Renamed automations that may still show "on" from their new start.
        # The value says whether our turn_off is on its way.
        self._renamed: dict[str, bool] = {}
        self._listeners: list[Callable[[], None]] = []
        self._tracked: frozenset[str] = frozenset()
        self._unsub_state: CALLBACK_TYPE | None = None
        self._unsub_registry: CALLBACK_TYPE | None = None
        self._started = False

    @property
    def paused(self) -> Mapping[str, Pause]:
        return MappingProxyType(self._pauses)

    @callback
    def async_add_listener(self, update: Callable[[], None]) -> Callable[[], None]:
        """Call update after every change of the pauses."""
        self._listeners.append(update)

        @callback
        def remove() -> None:
            if update in self._listeners:
                self._listeners.remove(update)

        return remove

    @callback
    def async_diagnostics(self) -> dict[str, Any]:
        return {
            "pauses": self._store_data(),
            "timers": len(self._timers),
            "started": self._started,
        }

    async def async_load(self) -> None:
        """Read the stored pauses and watch the paused automations.

        The timers start in async_start, when every automation is loaded.
        """
        for entity_id, item in ((await self._store.async_load()) or {}).items():
            if (pause := _parse(entity_id, item)) is not None:
                self._pauses[entity_id] = pause
        self._unsub_registry = self.hass.bus.async_listen(
            er.EVENT_ENTITY_REGISTRY_UPDATED, self._async_registry_updated
        )
        self._update_tracking()

    async def async_start(self, hass: HomeAssistant) -> None:
        """Apply the startup rules to the stored pauses."""
        self._started = True
        registry = er.async_get(hass)
        now = dt_util.utcnow()
        # A pause made while Home Assistant was starting has a timer already.
        for pause in [
            p for p in self._pauses.values() if p.entity_id not in self._timers
        ]:
            entity_id = pause.entity_id
            state = hass.states.get(entity_id)
            if state is None and registry.async_get(entity_id) is None:
                await self._async_end(entity_id, REASON_REMOVED)
            elif state is not None and state.state == STATE_ON:
                # Turned on while Home Assistant was down.
                await self._async_end(entity_id, REASON_MANUAL)
            elif pause.resume_at <= now:
                await self._async_timer_fired(entity_id, now)
            else:
                self._schedule(pause)
        self._notify()

    @callback
    def async_stop(self) -> None:
        """Stop the timers and listeners. The stored pauses stay."""
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()
        if self._unsub_state is not None:
            self._unsub_state()
            self._unsub_state = None
        self._tracked = frozenset()
        if self._unsub_registry is not None:
            self._unsub_registry()
            self._unsub_registry = None
        self._started = False

    async def async_pause(
        self,
        entity_ids: list[str],
        duration: timedelta,
        stop_actions: bool,
        *,
        context: Context | None = None,
    ) -> None:
        """Pause the automations, or extend their pause. All or nothing."""
        if duration < MIN_DURATION:
            raise _invalid(translation_key="duration_too_short")
        if duration > MAX_DURATION:
            raise _invalid(translation_key="duration_too_long")
        entity_ids = list(dict.fromkeys(entity_ids))
        if not entity_ids:
            raise _invalid(translation_key="no_entities")
        for entity_id in entity_ids:
            self._check_pausable(entity_id)

        now = dt_util.utcnow()
        resume_at = now + duration
        own = self._own_context(context)
        started: list[Pause] = []
        for entity_id in entity_ids:
            state = self.hass.states.get(entity_id)
            # A paused automation is off already: no second turn_off.
            if state is not None and state.state == STATE_ON:
                await self.hass.services.async_call(
                    AUTOMATION,
                    SERVICE_TURN_OFF,
                    {ATTR_ENTITY_ID: entity_id, ATTR_STOP_ACTIONS: stop_actions},
                    blocking=True,
                    context=own,
                )
            # No stacking: a new pause replaces the end time and keeps the start.
            old = self._pauses.get(entity_id)
            pause = Pause(entity_id, old.paused_at if old else now, resume_at)
            self._pauses[entity_id] = pause
            started.append(pause)
        await self._async_save()
        for pause in started:
            self._schedule(pause)
        self._update_tracking()
        self._notify()
        for pause in started:
            self.hass.bus.async_fire(
                EVENT_PAUSE_STARTED,
                {ATTR_ENTITY_ID: pause.entity_id} | pause.as_dict(),
                context=own,
            )

    async def async_resume(
        self, entity_ids: list[str], *, context: Context | None = None
    ) -> None:
        """End the pauses now. All or nothing."""
        entity_ids = list(dict.fromkeys(entity_ids))
        if not entity_ids:
            raise _invalid(translation_key="no_entities")
        for entity_id in entity_ids:
            if entity_id not in self._pauses:
                raise _invalid(translation_key="not_paused", entity_id=entity_id)
        for entity_id in entity_ids:
            await self._async_end(entity_id, REASON_SERVICE, context)

    @staticmethod
    async def async_remove(hass: HomeAssistant) -> None:
        """Turn every paused automation on again, then delete the store.

        After the integration is gone, nothing else would turn them on.
        """
        store: Store[StoreData] = Store(hass, STORE_VERSION, STORE_KEY)
        for entity_id in (await store.async_load()) or {}:
            if (
                state := hass.states.get(entity_id)
            ) is None or state.state != STATE_OFF:
                continue
            try:
                await hass.services.async_call(
                    AUTOMATION,
                    SERVICE_TURN_ON,
                    {ATTR_ENTITY_ID: entity_id},
                    blocking=True,
                )
            except HomeAssistantError:
                LOGGER.warning("Could not turn %s on", entity_id, exc_info=True)
        await store.async_remove()

    def _check_pausable(self, entity_id: str) -> None:
        if not entity_id.startswith(f"{AUTOMATION}."):
            raise _invalid(translation_key="not_automation", entity_id=entity_id)
        state = self.hass.states.get(entity_id)
        if state is None:
            raise _invalid(translation_key="not_found", entity_id=entity_id)
        if state.state in _NO_STATE:
            raise _invalid(translation_key="unavailable", entity_id=entity_id)
        # Without an id, a restart or reload turns the automation on again.
        if state.attributes.get(ATTR_ID) is None:
            raise _invalid(translation_key="no_id", entity_id=entity_id)
        # The end of a pause turns the automation on. That is only right for
        # an automation that was on when the pause began.
        if entity_id not in self._pauses and state.state == STATE_OFF:
            raise _invalid(translation_key="already_off", entity_id=entity_id)

    def _own_context(self, parent: Context | None = None) -> Context:
        """A context that marks a state change as ours, not a manual one."""
        if parent is None:
            context = Context()
        else:
            context = Context(user_id=parent.user_id, parent_id=parent.id)
        self._own_contexts.append(context.id)
        return context

    def _store_data(self) -> StoreData:
        return {p.entity_id: p.as_dict() for p in self._pauses.values()}

    async def _async_save(self) -> None:
        await self._store.async_save(self._store_data())

    @callback
    def _save_later(self) -> None:
        self.hass.async_create_task(self._async_save(), eager_start=True)

    @callback
    def _notify(self) -> None:
        for update in list(self._listeners):
            update()

    @callback
    def _schedule(self, pause: Pause) -> None:
        if (cancel := self._timers.pop(pause.entity_id, None)) is not None:
            cancel()
        self._timers[pause.entity_id] = async_track_point_in_utc_time(
            self.hass,
            partial(self._async_timer_fired, pause.entity_id),
            pause.resume_at,
        )

    @callback
    def _update_tracking(self) -> None:
        """Watch exactly the paused automations, with one listener."""
        wanted = frozenset(self._pauses)
        if wanted == self._tracked:
            return
        if self._unsub_state is not None:
            self._unsub_state()
            self._unsub_state = None
        self._tracked = wanted
        if wanted:
            self._unsub_state = async_track_state_change_event(
                self.hass, wanted, self._async_state_changed
            )

    @callback
    def _drop(self, entity_id: str) -> Pause | None:
        """Forget a pause. The caller saves and fires the event."""
        pause = self._pauses.pop(entity_id, None)
        if (cancel := self._timers.pop(entity_id, None)) is not None:
            cancel()
        self._renamed.pop(entity_id, None)
        self._update_tracking()
        self._notify()
        return pause

    @callback
    def _fire_resumed(
        self, entity_id: str, reason: str, context: Context | None = None
    ) -> None:
        self.hass.bus.async_fire(
            EVENT_PAUSE_RESUMED,
            {ATTR_ENTITY_ID: entity_id, ATTR_REASON: reason},
            context=context,
        )

    @callback
    def _end_now(self, entity_id: str, reason: str) -> None:
        """End a pause without turning the automation on."""
        if self._drop(entity_id) is None:
            return
        self._save_later()
        self._fire_resumed(entity_id, reason)

    async def _async_end(
        self, entity_id: str, reason: str, context: Context | None = None
    ) -> None:
        """End a pause. A timer or service end turns the automation on."""
        if self._drop(entity_id) is None:
            return
        await self._async_save()
        own = self._own_context(context)
        state = self.hass.states.get(entity_id)
        if (
            reason in (REASON_TIMER, REASON_SERVICE)
            and state is not None
            and state.state == STATE_OFF
        ):
            try:
                await self.hass.services.async_call(
                    AUTOMATION,
                    SERVICE_TURN_ON,
                    {ATTR_ENTITY_ID: entity_id},
                    blocking=True,
                    context=own,
                )
            except HomeAssistantError:
                LOGGER.warning("Could not turn %s on", entity_id, exc_info=True)
        self._fire_resumed(entity_id, reason, own)

    async def _async_timer_fired(self, entity_id: str, _now: datetime) -> None:
        self._timers.pop(entity_id, None)
        if entity_id not in self._pauses:
            return
        state = self.hass.states.get(entity_id)
        if state is None and er.async_get(self.hass).async_get(entity_id) is None:
            await self._async_end(entity_id, REASON_REMOVED)
            return
        if state is None or state.state in _NO_STATE:
            # Turning it on now would do nothing, and when it comes back it
            # restores "off". So the pause waits; the state listener ends it.
            LOGGER.warning(
                "The pause of %s has ended, but it is unavailable. It turns on "
                "when it is available again",
                entity_id,
            )
            return
        await self._async_end(entity_id, REASON_TIMER)

    @callback
    def _async_state_changed(self, event: Event[EventStateChangedData]) -> None:
        entity_id = event.data["entity_id"]
        new_state = event.data["new_state"]
        if (pause := self._pauses.get(entity_id)) is None:
            return
        # A reload makes the state unavailable for a moment; a rename
        # removes it. The pause must survive both.
        if new_state is None or new_state.state in _NO_STATE:
            return
        if entity_id in self._renamed:
            self._settle_renamed(entity_id)
            return
        if new_state.state == STATE_ON:
            if new_state.context.id not in self._own_contexts:
                self._end_now(entity_id, REASON_MANUAL)
            return
        if (
            self._started
            and entity_id not in self._timers
            and pause.resume_at <= dt_util.utcnow()
        ):
            # Back from unavailable after the pause ended.
            self.hass.async_create_task(
                self._async_end(entity_id, REASON_TIMER), eager_start=True
            )

    @callback
    def _settle_renamed(self, entity_id: str) -> None:
        """Turn a renamed automation off again.

        Home Assistant adds a renamed automation again under its new entity
        ID. It finds no saved state for that ID, so it turns the automation
        on. That is not a manual change, so the pause stays. This reads the
        state machine, not the event: the events of a rename arrive late.
        """
        state = self.hass.states.get(entity_id)
        if state is None or state.state in _NO_STATE:
            return
        if state.state == STATE_OFF:
            self._renamed.pop(entity_id, None)
        elif not self._renamed.get(entity_id):
            self._renamed[entity_id] = True
            self.hass.async_create_task(
                self._async_turn_off_renamed(entity_id), eager_start=True
            )

    async def _async_turn_off_renamed(self, entity_id: str) -> None:
        try:
            await self.hass.services.async_call(
                AUTOMATION,
                SERVICE_TURN_OFF,
                {ATTR_ENTITY_ID: entity_id, ATTR_STOP_ACTIONS: False},
                blocking=True,
                context=self._own_context(),
            )
        except HomeAssistantError:
            LOGGER.warning("Could not turn %s off again", entity_id, exc_info=True)
            self._renamed.pop(entity_id, None)

    @callback
    def _async_registry_updated(
        self, event: Event[er.EventEntityRegistryUpdatedData]
    ) -> None:
        data = event.data
        if data["action"] == "remove":
            # The automation editor removes the entry when the user deletes
            # the automation. A reload does not.
            self._end_now(data["entity_id"], REASON_REMOVED)
        elif data["action"] == "update" and "old_entity_id" in data:
            self._move(data["old_entity_id"], data["entity_id"])

    @callback
    def _move(self, old_id: str, new_id: str) -> None:
        """Keep the pause and its end time under the new entity ID."""
        had_timer = old_id in self._timers
        if (pause := self._drop(old_id)) is None:
            return
        self._pauses[new_id] = replace(pause, entity_id=new_id)
        # Before the start, async_start schedules the timer.
        if had_timer:
            self._schedule(self._pauses[new_id])
        self._update_tracking()
        self._notify()
        self._save_later()
        self._renamed[new_id] = False
        self._settle_renamed(new_id)


def sorted_pauses(pauses: Iterable[Pause]) -> list[Pause]:
    """The pauses by end time, the first to end first."""
    return sorted(pauses, key=lambda p: (p.resume_at, p.entity_id))
