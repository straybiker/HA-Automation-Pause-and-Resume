// The small part of the frontend "hass" object that the card reads. HA does
// not publish these types as a package, so the card declares only what it uses.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface HassEntityRegistryDisplayEntry {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  /** An icon the user set in the entity settings, such as "mdi:fan". */
  icon?: string | null;
  /** The integration that registered the entity, such as "automation_pause". */
  platform?: string;
}

export interface HassDeviceRegistryEntry {
  id: string;
  area_id?: string | null;
}

export interface HassAreaRegistryEntry {
  area_id: string;
  name: string;
}

export interface HassLocale {
  language: string;
  time_format?: string;
  time_zone?: string;
}

export interface HassServiceTarget {
  entity_id?: string | string[];
}

export interface HomeAssistant {
  states: Record<string, HassEntity | undefined>;
  entities?: Record<string, HassEntityRegistryDisplayEntry | undefined>;
  devices?: Record<string, HassDeviceRegistryEntry | undefined>;
  areas?: Record<string, HassAreaRegistryEntry | undefined>;
  language?: string;
  locale?: HassLocale;
  config?: { time_zone?: string };
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: HassServiceTarget,
    notifyOnError?: boolean
  ): Promise<unknown>;
}

export interface AutomationPauseCardConfig {
  type: string;
  /** The sensor to read. Without it, the card finds the integration's sensor. */
  entity?: string;
}

/** One stored pause, as listed in the sensor attribute "paused". */
export interface PauseInfo {
  paused_at: string;
  resume_at: string;
}

/** One automation, ready for the list. */
export interface AutomationItem {
  entity_id: string;
  name: string;
  area?: string;
  /** The automation's own icon, such as "mdi:fan". Undefined: the robot. */
  icon?: string;
  /** ISO time, or undefined when the automation never ran. */
  last_triggered?: string;
  state: string;
  /** The automation config id. Missing for YAML automations without an id. */
  config_id?: string;
  pause?: PauseInfo;
}

export type StatusFilter = "all" | "enabled" | "disabled" | "paused";

export type SortKey = "last_triggered" | "name" | "state";

/** Why an automation cannot be paused. */
export type PauseBlock = "no_id" | "already_off" | "unavailable";

/** Duration in the shape of the HA duration selector. */
export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type DurationUnit = "minutes" | "hours" | "days";

/** What a row asks the card to do. */
export type RowAction =
  | "open"
  | "toggle"
  | "info"
  | "settings"
  | "run"
  | "trace"
  | "edit"
  | "pause"
  | "extend"
  | "resume";

export interface RowActionDetail {
  action: RowAction;
  entityId: string;
}
