// Pure rules of the card: build, filter and sort the list, time texts,
// duration checks and error texts. No Lit and no DOM, so vitest runs it in Node.

import type { StringKey, Strings } from "./strings";
import { formatString } from "./strings";
import type {
  AutomationItem,
  Duration,
  DurationUnit,
  HomeAssistant,
  PauseBlock,
  PauseInfo,
  SortKey,
  StatusFilter,
} from "./types";

export const DEFAULT_ENTITY = "sensor.paused_automations";
export const SERVICE_DOMAIN = "automation_pause";

/** Same bounds as the pause service. */
export const MIN_DURATION_SECONDS = 60;
export const MAX_DURATION_SECONDS = 365 * 24 * 3600;

const SECONDS_PER_UNIT: Record<DurationUnit, number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
};

// ---------------------------------------------------------------------------
// Data

/** Reads the "paused" attribute of the sensor. Bad entries are skipped. */
export const parsePauses = (value: unknown): Map<string, PauseInfo> => {
  const pauses = new Map<string, PauseInfo>();
  if (!Array.isArray(value)) {
    return pauses;
  }
  for (const entry of value) {
    if (
      entry &&
      typeof entry === "object" &&
      typeof entry.entity_id === "string" &&
      typeof entry.resume_at === "string"
    ) {
      pauses.set(entry.entity_id, {
        paused_at: typeof entry.paused_at === "string" ? entry.paused_at : "",
        resume_at: entry.resume_at,
      });
    }
  }
  return pauses;
};

type HassData = Pick<
  HomeAssistant,
  "states" | "entities" | "devices" | "areas"
>;

const areaOf = (hass: HassData, entityId: string): string | undefined => {
  const entry = hass.entities?.[entityId];
  const areaId =
    entry?.area_id ||
    (entry?.device_id ? hass.devices?.[entry.device_id]?.area_id : undefined);
  return areaId ? hass.areas?.[areaId]?.name : undefined;
};

/** Every automation.* entity, with its area and pause. */
export const buildItems = (
  hass: HassData,
  pauses: Map<string, PauseInfo>
): AutomationItem[] => {
  const items: AutomationItem[] = [];
  for (const [entityId, stateObj] of Object.entries(hass.states)) {
    if (!stateObj || !entityId.startsWith("automation.")) {
      continue;
    }
    const attributes = stateObj.attributes;
    const name = attributes.friendly_name;
    const lastTriggered = attributes.last_triggered;
    const configId = attributes.id;
    items.push({
      entity_id: entityId,
      name: typeof name === "string" && name ? name : entityId,
      area: areaOf(hass, entityId),
      last_triggered:
        typeof lastTriggered === "string" && lastTriggered
          ? lastTriggered
          : undefined,
      state: stateObj.state,
      config_id:
        typeof configId === "string" || typeof configId === "number"
          ? String(configId)
          : undefined,
      pause: pauses.get(entityId),
    });
  }
  return items;
};

/** Why the automation cannot be paused, or undefined when it can. */
export const pauseBlock = (item: AutomationItem): PauseBlock | undefined => {
  if (item.pause) {
    // A paused automation can always be extended or resumed.
    return undefined;
  }
  if (item.state !== "on" && item.state !== "off") {
    return "unavailable";
  }
  if (!item.config_id) {
    return "no_id";
  }
  if (item.state === "off") {
    return "already_off";
  }
  return undefined;
};

// ---------------------------------------------------------------------------
// Filter and sort

/** Lower case without accents, so "Lumière" matches "lumiere". */
export const normalizeText = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Every word of the query must be in the name or the entity id. */
export const matchesSearch = (item: AutomationItem, query: string): boolean => {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (!words.length) {
    return true;
  }
  const haystack = `${normalizeText(item.name)} ${normalizeText(item.entity_id)}`;
  return words.every((word) => haystack.includes(word));
};

export const matchesStatus = (
  item: AutomationItem,
  status: StatusFilter
): boolean => {
  switch (status) {
    case "enabled":
      return item.state === "on";
    case "disabled":
      // A paused automation is off too, but it has its own filter.
      return item.state === "off" && !item.pause;
    case "paused":
      return item.pause !== undefined;
    default:
      return true;
  }
};

export const filterItems = (
  items: readonly AutomationItem[],
  query: string,
  status: StatusFilter
): AutomationItem[] =>
  items.filter(
    (item) => matchesStatus(item, status) && matchesSearch(item, query)
  );

const stateRank = (item: AutomationItem): number => {
  if (item.pause) {
    return 0;
  }
  if (item.state === "on") {
    return 1;
  }
  if (item.state === "off") {
    return 2;
  }
  return 3;
};

const timeOf = (iso: string | undefined): number => {
  if (!iso) {
    return Number.NaN;
  }
  return Date.parse(iso);
};

/**
 * Sorts a copy of the list.
 * - last_triggered: newest first, never-run last.
 * - name: A to Z in the user's language.
 * - state: paused first (soonest end first), then on, off, other.
 * Ties sort by name, then by entity id.
 */
export const sortItems = (
  items: readonly AutomationItem[],
  key: SortKey,
  language = "en"
): AutomationItem[] => {
  const collator = new Intl.Collator(language, { sensitivity: "accent" });
  const byName = (a: AutomationItem, b: AutomationItem) =>
    collator.compare(a.name, b.name) ||
    collator.compare(a.entity_id, b.entity_id);

  const compare = (a: AutomationItem, b: AutomationItem): number => {
    if (key === "last_triggered") {
      const ta = timeOf(a.last_triggered);
      const tb = timeOf(b.last_triggered);
      const aNever = Number.isNaN(ta);
      const bNever = Number.isNaN(tb);
      if (aNever !== bNever) {
        return aNever ? 1 : -1;
      }
      if (!aNever && ta !== tb) {
        return tb - ta;
      }
    } else if (key === "state") {
      const diff = stateRank(a) - stateRank(b);
      if (diff) {
        return diff;
      }
      if (a.pause && b.pause) {
        const end = timeOf(a.pause.resume_at) - timeOf(b.pause.resume_at) || 0;
        if (end) {
          return end;
        }
      }
    }
    return byName(a, b);
  };
  return [...items].sort(compare);
};

// ---------------------------------------------------------------------------
// Time texts

export interface DateTimeOptions {
  /** IANA time zone. Undefined uses the browser zone. */
  timeZone?: string;
  /** True for 12 hour clock, false for 24 hour, undefined for the language default. */
  hour12?: boolean;
}

/** Date options from the HA user profile (hass.locale and hass.config). */
export const dateTimeOptions = (
  hass: Pick<HomeAssistant, "locale" | "config">
): DateTimeOptions => {
  const locale = hass.locale;
  return {
    timeZone:
      locale?.time_zone === "server" ? hass.config?.time_zone : undefined,
    hour12:
      locale?.time_format === "12"
        ? true
        : locale?.time_format === "24"
          ? false
          : undefined,
  };
};

// Same rule as HA's useAmPm: the clock style of the language, unless the
// user picked 12 or 24 hours in the profile.
const usesAmPm = (language: string, hour12: boolean | undefined): boolean => {
  if (hour12 !== undefined) {
    return hour12;
  }
  const cycle = new Intl.DateTimeFormat(language, {
    hour: "numeric",
  }).resolvedOptions().hourCycle;
  return cycle === "h11" || cycle === "h12";
};

/** Short date and time, with the year only when it is not this year. */
export const formatDateTime = (
  date: Date,
  language: string,
  options: DateTimeOptions = {},
  now: Date = new Date()
): string => {
  const amPm = usesAmPm(language, options.hour12);
  return new Intl.DateTimeFormat(language, {
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    month: "short",
    day: "numeric",
    hour: amPm ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12: amPm,
    timeZone: options.timeZone,
  }).format(date);
};

const DAY_MS = 86400000;

const startOfDay = (date: Date): number => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
};

/**
 * The relative time of a past or future moment, with the unit rules of HA's
 * selectUnit (seconds below 59, minutes below 59, hours below 22, then days).
 */
export const relativeTime = (
  from: Date,
  now: Date,
  language: string
): string => {
  const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  const secs = (from.getTime() - now.getTime()) / 1000;
  if (Math.abs(secs) < 59) {
    return format.format(Math.round(secs), "second");
  }
  const mins = secs / 60;
  if (Math.abs(mins) < 59) {
    return format.format(Math.round(mins), "minute");
  }
  const hours = secs / 3600;
  if (Math.abs(hours) < 22) {
    return format.format(Math.round(hours), "hour");
  }
  const days = Math.round((startOfDay(from) - startOfDay(now)) / DAY_MS);
  if (days === 0) {
    return format.format(Math.round(hours), "hour");
  }
  return format.format(days, "day");
};

/**
 * The "Last triggered" text, as in the built-in automation list: relative up
 * to 3 days back, a date after that, "Never" without a value.
 */
export const lastTriggeredText = (
  iso: string | undefined,
  now: Date,
  language: string,
  strings: Pick<Strings, "never">,
  options: DateTimeOptions = {}
): string => {
  const time = timeOf(iso);
  if (Number.isNaN(time)) {
    return strings.never;
  }
  const date = new Date(time);
  if (Math.trunc((now.getTime() - time) / DAY_MS) > 3) {
    return formatDateTime(date, language, options, now);
  }
  return relativeTime(date, now, language);
};

/**
 * The time left until a pause ends, for example "in 12 min.". Minutes below
 * 90 minutes, hours below 36 hours, days after that. Minutes round up, so the
 * text never says "in 0 min.". Undefined when the end time has passed.
 */
export const countdownTime = (
  resumeAt: string,
  now: Date,
  language: string
): string | undefined => {
  const end = timeOf(resumeAt);
  if (Number.isNaN(end)) {
    return undefined;
  }
  const secs = (end - now.getTime()) / 1000;
  if (secs <= 0) {
    return undefined;
  }
  const format = new Intl.RelativeTimeFormat(language, {
    numeric: "always",
    style: "short",
  });
  const minutes = Math.ceil(secs / 60);
  if (minutes < 90) {
    return format.format(minutes, "minute");
  }
  const hours = Math.round(minutes / 60);
  if (hours < 36) {
    return format.format(hours, "hour");
  }
  return format.format(Math.round(hours / 24), "day");
};

/** The chip text: "Resumes in 12 min." or "Resuming…" when the time has passed. */
export const countdownText = (
  resumeAt: string,
  now: Date,
  language: string,
  strings: Pick<Strings, "resumes" | "resuming">
): string => {
  const time = countdownTime(resumeAt, now, language);
  return time ? formatString(strings.resumes, { time }) : strings.resuming;
};

// ---------------------------------------------------------------------------
// Durations

export const durationFromSeconds = (total: number): Duration => {
  let rest = Math.round(total);
  const days = Math.floor(rest / 86400);
  rest -= days * 86400;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  return { days, hours, minutes, seconds: rest - minutes * 60 };
};

export interface DurationPreset {
  key: string;
  seconds: number;
  unit: "minute" | "hour" | "day" | "week";
  value: number;
}

export const DURATION_PRESETS: readonly DurationPreset[] = [
  { key: "15m", seconds: 15 * 60, unit: "minute", value: 15 },
  { key: "1h", seconds: 3600, unit: "hour", value: 1 },
  { key: "1d", seconds: 86400, unit: "day", value: 1 },
  { key: "1w", seconds: 7 * 86400, unit: "week", value: 1 },
];

/** "15 minutes", "1 uur", … in the user's language. */
export const presetLabel = (preset: DurationPreset, language: string) =>
  new Intl.NumberFormat(language, {
    style: "unit",
    unit: preset.unit,
    unitDisplay: "long",
  }).format(preset.value);

export type DurationError = "invalid" | "too_short" | "too_long";

export type DurationResult =
  | { duration: Duration; seconds: number; error?: undefined }
  | { error: DurationError; duration?: undefined; seconds?: undefined };

/** Checks a number of seconds against the bounds of the pause service. */
export const checkDuration = (seconds: number): DurationResult => {
  if (!Number.isFinite(seconds)) {
    return { error: "invalid" };
  }
  const rounded = Math.round(seconds);
  if (rounded < MIN_DURATION_SECONDS) {
    return { error: "too_short" };
  }
  if (rounded > MAX_DURATION_SECONDS) {
    return { error: "too_long" };
  }
  return { duration: durationFromSeconds(rounded), seconds: rounded };
};

/**
 * Reads the custom duration fields. Accepts a decimal point or comma, so
 * "1,5" hours works for Dutch users.
 */
export const parseCustomDuration = (
  value: string,
  unit: DurationUnit
): DurationResult => {
  const text = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(text)) {
    return { error: "invalid" };
  }
  return checkDuration(Number(text) * SECONDS_PER_UNIT[unit]);
};

export const durationErrorKey = (error: DurationError): StringKey =>
  error === "invalid"
    ? "duration_invalid"
    : error === "too_short"
      ? "duration_too_short"
      : "duration_too_long";

// ---------------------------------------------------------------------------
// Errors

/** The ServiceValidationError keys of the backend (strings.json "exceptions"). */
export const BACKEND_ERROR_KEYS = [
  "not_loaded",
  "no_entities",
  "not_automation",
  "not_found",
  "unavailable",
  "no_id",
  "already_off",
  "not_paused",
  "duration_too_short",
  "duration_too_long",
] as const;

export type BackendErrorKey = (typeof BACKEND_ERROR_KEYS)[number];

const isBackendErrorKey = (key: unknown): key is BackendErrorKey =>
  typeof key === "string" &&
  (BACKEND_ERROR_KEYS as readonly string[]).includes(key);

/**
 * The text for a rejected hass.callService. Known keys of this integration get
 * the card's own text; anything else shows the message of the error.
 */
export const errorText = (err: unknown, strings: Strings): string => {
  if (err && typeof err === "object") {
    const error = err as {
      message?: unknown;
      translation_domain?: unknown;
      translation_key?: unknown;
      translation_placeholders?: unknown;
    };
    const ownDomain =
      error.translation_domain === undefined ||
      error.translation_domain === SERVICE_DOMAIN;
    if (ownDomain && isBackendErrorKey(error.translation_key)) {
      const placeholders =
        error.translation_placeholders &&
        typeof error.translation_placeholders === "object"
          ? (error.translation_placeholders as Record<string, string>)
          : {};
      return formatString(
        strings[`error_${error.translation_key}`],
        placeholders
      );
    }
    if (typeof error.message === "string" && error.message) {
      return error.message;
    }
  }
  if (typeof err === "string" && err) {
    return err;
  }
  return strings.error_unknown;
};
