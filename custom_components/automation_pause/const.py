"""Constants for Automation Pause and Resume."""

from __future__ import annotations

import logging
from datetime import timedelta

DOMAIN = "automation_pause"
NAME = "Automation Pause and Resume"
LOGGER = logging.getLogger(__package__)

# The pauses, by automation entity ID.
STORE_KEY = DOMAIN
STORE_VERSION = 1

SERVICE_PAUSE = "pause"
SERVICE_RESUME = "resume"
ATTR_DURATION = "duration"
# Same name and default as automation.turn_off.
ATTR_STOP_ACTIONS = "stop_actions"
DEFAULT_STOP_ACTIONS = True
MIN_DURATION = timedelta(minutes=1)
MAX_DURATION = timedelta(days=365)

EVENT_PAUSE_STARTED = "automation_pause_started"
EVENT_PAUSE_RESUMED = "automation_pause_resumed"
ATTR_REASON = "reason"
REASON_TIMER = "timer"
REASON_SERVICE = "service"
REASON_MANUAL = "manual"
REASON_REMOVED = "removed"

# The sensor that lists the pauses. The card reads it by default.
SENSOR_KEY = "paused_automations"
SENSOR_ENTITY_ID = f"sensor.{SENSOR_KEY}"
ATTR_PAUSED = "paused"
ATTR_PAUSED_AT = "paused_at"
ATTR_RESUME_AT = "resume_at"

# The card the integration serves itself, so no manual dashboard resource.
CARD_ELEMENT = "automation-pause-card"
CARD_FILE = f"{CARD_ELEMENT}.js"
CARD_URL_BASE = f"/{DOMAIN}"

# The dashboard in the sidebar.
CONF_DASHBOARD = "dashboard"
CONF_DASHBOARD_TITLE = "dashboard_title"
CONF_DASHBOARD_REBUILD = "dashboard_rebuild"
# When the user last rebuilt the dashboard; makes a rebuild change the options.
CONF_DASHBOARD_REBUILT = "dashboard_rebuilt"
