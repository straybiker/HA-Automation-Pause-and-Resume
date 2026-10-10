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

# The sensor that lists the pauses. The card finds it by its platform.
SENSOR_KEY = "paused_automations"
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
CONF_DASHBOARD_REQUIRE_ADMIN = "dashboard_require_admin"

# A Home Assistant notification when the timer ends a pause.
CONF_NOTIFY_RESUMED = "notify_resumed"
# When the user last rebuilt the dashboard; makes a rebuild change the options.
CONF_DASHBOARD_REBUILT = "dashboard_rebuilt"

# The durations in the card's pause dialog, as text such as "15m". The
# sensor sends them as minutes. An entry without the option uses the default.
CONF_DURATIONS = "durations"
ATTR_DURATIONS = "durations"
DEFAULT_DURATIONS = ("15m", "1h", "1d", "1w")
# The fixed choices of the options form; the user can type any other value.
DURATION_CHOICES = (
    "5m", "10m", "15m", "30m", "1h", "2h", "3h", "4h", "6h", "8h", "12h",
    "1d", "2d", "3d", "1w", "2w", "4w"
)  # fmt: skip
