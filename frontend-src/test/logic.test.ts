import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BACKEND_ERROR_KEYS,
  DEFAULT_DURATIONS,
  buildItems,
  checkDuration,
  countdownText,
  countdownTime,
  dateTimeOptions,
  durationErrorKey,
  durationLabel,
  errorText,
  filterItems,
  findSensor,
  formatDateTime,
  lastTriggeredText,
  matchesSearch,
  parseCustomDuration,
  parseDurations,
  parsePauses,
  pauseBlock,
  relativeTime,
  sortItems,
} from "../src/logic";
import { formatString, getStrings } from "../src/strings";
import type { AutomationItem, HomeAssistant } from "../src/types";

const en = getStrings("en");
const nl = getStrings("nl");

// Intl uses narrow no-break spaces in some outputs.
const plain = (text: string) => text.replace(/\s/g, " ");

const item = (overrides: Partial<AutomationItem>): AutomationItem => ({
  entity_id: "automation.test",
  name: "Test",
  state: "on",
  config_id: "1000",
  ...overrides,
});

// Local time, so day-based rules do not depend on the time zone of the run.
const NOW = new Date(2026, 9, 9, 15, 0, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const inMs = (ms: number) => new Date(NOW.getTime() + ms).toISOString();
const MIN = 60000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("filter", () => {
  const items = [
    item({ entity_id: "automation.lumiere_salon", name: "Lumière salon" }),
    item({ entity_id: "automation.garden_lights", name: "Tuin verlichting" }),
    item({
      entity_id: "automation.morning",
      name: "Morning routine",
      state: "off",
    }),
    item({
      entity_id: "automation.heating",
      name: "Heating",
      state: "off",
      pause: { paused_at: ago(HOUR), resume_at: inMs(HOUR) },
    }),
    item({
      entity_id: "automation.broken",
      name: "Broken",
      state: "unavailable",
    }),
  ];

  it("ignores accents and case", () => {
    expect(matchesSearch(items[0], "lumiere")).toBe(true);
    expect(matchesSearch(items[0], "LUMIÈRE SALON")).toBe(true);
    expect(matchesSearch(item({ name: "Lumiere" }), "lumière")).toBe(true);
  });

  it("searches the entity id", () => {
    expect(filterItems(items, "garden_l", "all").map((i) => i.name)).toEqual([
      "Tuin verlichting",
    ]);
    expect(filterItems(items, "automation.heat", "all")).toHaveLength(1);
  });

  it("needs every word to match", () => {
    expect(filterItems(items, "salon lum", "all")).toHaveLength(1);
    expect(filterItems(items, "salon tuin", "all")).toHaveLength(0);
  });

  it("returns everything for an empty query", () => {
    expect(filterItems(items, "   ", "all")).toHaveLength(items.length);
  });

  it("filters by status", () => {
    const names = (status: Parameters<typeof filterItems>[2]) =>
      filterItems(items, "", status).map((i) => i.name);
    expect(names("enabled")).toEqual(["Lumière salon", "Tuin verlichting"]);
    expect(names("disabled")).toEqual(["Morning routine"]);
    expect(names("paused")).toEqual(["Heating"]);
    expect(names("all")).toHaveLength(5);
  });

  it("combines search and status", () => {
    expect(filterItems(items, "heat", "enabled")).toHaveLength(0);
    expect(filterItems(items, "heat", "paused")).toHaveLength(1);
  });
});

describe("sort", () => {
  const items = [
    item({
      entity_id: "automation.b",
      name: "Bravo",
      last_triggered: ago(HOUR),
    }),
    item({ entity_id: "automation.n1", name: "November" }),
    item({
      entity_id: "automation.a",
      name: "Alpha",
      last_triggered: ago(DAY),
    }),
    item({
      entity_id: "automation.e",
      name: "Écho",
      last_triggered: ago(HOUR),
      state: "off",
    }),
    item({ entity_id: "automation.d", name: "Delta" }),
    item({
      entity_id: "automation.p2",
      name: "Papa",
      state: "off",
      last_triggered: ago(MIN),
      pause: { paused_at: ago(MIN), resume_at: inMs(2 * HOUR) },
    }),
    item({
      entity_id: "automation.p1",
      name: "Quebec",
      state: "off",
      pause: { paused_at: ago(MIN), resume_at: inMs(HOUR) },
    }),
    item({ entity_id: "automation.u", name: "Uniform", state: "unavailable" }),
  ];
  const names = (key: Parameters<typeof sortItems>[1]) =>
    sortItems(items, key, "en").map((i) => i.name);

  it("puts the newest run first and never-run last, ties by name", () => {
    expect(names("last_triggered")).toEqual([
      "Papa",
      "Bravo",
      "Écho",
      "Alpha",
      "Delta",
      "November",
      "Quebec",
      "Uniform",
    ]);
  });

  it("sorts by name in the user's language", () => {
    expect(names("name")).toEqual([
      "Alpha",
      "Bravo",
      "Delta",
      "Écho",
      "November",
      "Papa",
      "Quebec",
      "Uniform",
    ]);
  });

  it("sorts ties of the same name by entity id", () => {
    const twins = [
      item({ entity_id: "automation.z", name: "Same" }),
      item({ entity_id: "automation.a", name: "Same" }),
    ];
    expect(sortItems(twins, "name").map((i) => i.entity_id)).toEqual([
      "automation.a",
      "automation.z",
    ]);
  });

  it("puts paused first (soonest end first), then on, off and other", () => {
    expect(names("state")).toEqual([
      "Quebec",
      "Papa",
      "Alpha",
      "Bravo",
      "Delta",
      "November",
      "Écho",
      "Uniform",
    ]);
  });

  it("does not change the input", () => {
    const copy = [...items];
    sortItems(items, "name");
    expect(items).toEqual(copy);
  });
});

describe("countdown", () => {
  it("shows minutes, rounded up", () => {
    expect(countdownText(inMs(12 * MIN), NOW, "en", en)).toBe(
      "Resumes in 12 min."
    );
    expect(countdownTime(inMs(30000), NOW, "en")).toBe("in 1 min.");
    expect(countdownTime(inMs(11 * MIN + 1000), NOW, "en")).toBe("in 12 min.");
    expect(countdownTime(inMs(89 * MIN), NOW, "en")).toBe("in 89 min.");
  });

  it("switches to hours at 90 minutes and to days at 36 hours", () => {
    expect(countdownTime(inMs(90 * MIN), NOW, "en")).toBe("in 2 hr.");
    expect(countdownTime(inMs(35 * HOUR), NOW, "en")).toBe("in 35 hr.");
    expect(countdownTime(inMs(36 * HOUR), NOW, "en")).toBe("in 2 days");
    expect(countdownTime(inMs(7 * DAY), NOW, "en")).toBe("in 7 days");
  });

  it("says resuming when the end has passed", () => {
    expect(countdownTime(ago(1000), NOW, "en")).toBeUndefined();
    expect(countdownText(ago(1000), NOW, "en", en)).toBe("Resuming…");
    expect(countdownText(NOW.toISOString(), NOW, "en", en)).toBe("Resuming…");
    expect(countdownText("not a date", NOW, "en", en)).toBe("Resuming…");
  });

  it("speaks Dutch", () => {
    expect(countdownText(inMs(12 * MIN), NOW, "nl", nl)).toBe(
      "Hervat over 12 min."
    );
  });
});

describe("relative time", () => {
  it("uses the HA unit steps", () => {
    expect(relativeTime(new Date(ago(30000)), NOW, "en")).toBe(
      "30 seconds ago"
    );
    expect(relativeTime(new Date(ago(5 * MIN)), NOW, "en")).toBe(
      "5 minutes ago"
    );
    expect(relativeTime(new Date(ago(3 * HOUR)), NOW, "en")).toBe(
      "3 hours ago"
    );
    expect(relativeTime(new Date(ago(DAY)), NOW, "en")).toBe("yesterday");
    expect(relativeTime(new Date(ago(2 * DAY)), NOW, "en")).toBe("2 days ago");
    expect(relativeTime(new Date(inMs(5 * MIN)), NOW, "en")).toBe(
      "in 5 minutes"
    );
  });

  it("stays in hours on the same calendar day", () => {
    // 23 hours is past the hour limit (22), but it is still today.
    const late = new Date(2026, 9, 9, 23, 30, 0);
    const from = new Date(2026, 9, 9, 0, 30, 0);
    expect(relativeTime(from, late, "en")).toBe("23 hours ago");
  });

  it("shows Never, a relative time, or a date after 3 days", () => {
    expect(lastTriggeredText(undefined, NOW, "en", en)).toBe("Never");
    expect(lastTriggeredText(undefined, NOW, "nl", nl)).toBe("Nooit");
    expect(lastTriggeredText(ago(3 * HOUR), NOW, "nl", nl)).toBe(
      "3 uur geleden"
    );
    expect(lastTriggeredText(ago(3 * DAY), NOW, "en", en)).toBe("3 days ago");
    const old = new Date(Date.UTC(2026, 8, 1, 8, 5)).toISOString();
    expect(
      plain(
        lastTriggeredText(old, NOW, "en", en, {
          timeZone: "UTC",
          hour12: false,
        })
      )
    ).toBe("Sep 1, 08:05");
  });

  it("adds the year only for another year", () => {
    const date = new Date(Date.UTC(2025, 8, 1, 20, 5));
    expect(
      plain(formatDateTime(date, "en", { timeZone: "UTC", hour12: true }, NOW))
    ).toBe("Sep 1, 2025, 8:05 PM");
  });

  it("uses the clock of the language by default", () => {
    const date = new Date(Date.UTC(2026, 8, 1, 20, 5));
    expect(plain(formatDateTime(date, "en", { timeZone: "UTC" }, NOW))).toBe(
      "Sep 1, 8:05 PM"
    );
    expect(plain(formatDateTime(date, "nl", { timeZone: "UTC" }, NOW))).toBe(
      "1 sep, 20:05"
    );
  });

  it("reads the HA profile options", () => {
    expect(
      dateTimeOptions({
        locale: { language: "en", time_format: "24", time_zone: "server" },
        config: { time_zone: "Europe/Brussels" },
      })
    ).toEqual({ timeZone: "Europe/Brussels", hour12: false });
    expect(
      dateTimeOptions({
        locale: { language: "en", time_format: "language", time_zone: "local" },
        config: { time_zone: "Europe/Brussels" },
      })
    ).toEqual({ timeZone: undefined, hour12: undefined });
  });
});

describe("durations", () => {
  it("reads the list of the sensor in minutes, sorted, each once", () => {
    expect(parseDurations([1440, 15, 60, 15, 10080])).toEqual([
      15, 60, 1440, 10080,
    ]);
    expect(parseDurations([])).toEqual([]);
  });

  it("skips bad entries in the list", () => {
    expect(
      parseDurations([
        "15",
        null,
        {},
        Number.NaN,
        Number.POSITIVE_INFINITY,
        1.5,
        0,
        -60,
        525601,
        1,
        525600,
      ])
    ).toEqual([1, 525600]);
  });

  it("uses the default list without the attribute", () => {
    for (const value of [undefined, null, "15,60", 15, {}]) {
      expect(parseDurations(value)).toEqual([15, 60, 1440, 10080]);
    }
    expect(parseDurations(undefined)).toEqual(DEFAULT_DURATIONS);
    // A copy: the dialog must not change the default.
    expect(parseDurations(undefined)).not.toBe(DEFAULT_DURATIONS);
  });

  it("labels each duration with the largest whole unit", () => {
    expect(
      [15, 90, 60, 120, 1440, 2160, 10080, 20160, 525600].map((m) =>
        plain(durationLabel(m, "en"))
      )
    ).toEqual([
      "15 minutes",
      "90 minutes",
      "1 hour",
      "2 hours",
      "1 day",
      "36 hours",
      "1 week",
      "2 weeks",
      "365 days",
    ]);
    expect(
      [15, 60, 120, 1440, 2880, 10080, 20160].map((m) =>
        plain(durationLabel(m, "nl"))
      )
    ).toEqual([
      "15 minuten",
      "1 uur",
      "2 uur",
      "1 dag",
      "2 dagen",
      "1 week",
      "2 weken",
    ]);
  });

  it("accepts every default duration", () => {
    for (const minutes of DEFAULT_DURATIONS) {
      expect(checkDuration(minutes * 60).error).toBeUndefined();
    }
    expect(checkDuration(7 * 86400).duration).toEqual({
      days: 7,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("parses custom values", () => {
    expect(parseCustomDuration("15", "minutes").duration).toEqual({
      days: 0,
      hours: 0,
      minutes: 15,
      seconds: 0,
    });
    expect(parseCustomDuration(" 1,5 ", "hours").duration).toEqual({
      days: 0,
      hours: 1,
      minutes: 30,
      seconds: 0,
    });
    expect(parseCustomDuration("2.25", "days").duration).toEqual({
      days: 2,
      hours: 6,
      minutes: 0,
      seconds: 0,
    });
  });

  it("rejects text that is not a number", () => {
    for (const value of ["", "abc", "-5", "1e3", "1.", "5 min"]) {
      expect(parseCustomDuration(value, "minutes").error).toBe("invalid");
    }
    expect(checkDuration(Number.NaN).error).toBe("invalid");
  });

  it("keeps the bounds of 1 minute to 365 days", () => {
    expect(checkDuration(59).error).toBe("too_short");
    expect(checkDuration(60).seconds).toBe(60);
    expect(parseCustomDuration("0", "minutes").error).toBe("too_short");
    expect(parseCustomDuration("0.5", "minutes").error).toBe("too_short");
    expect(parseCustomDuration("1", "minutes").error).toBeUndefined();
    expect(parseCustomDuration("365", "days").duration).toEqual({
      days: 365,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    expect(parseCustomDuration("525600", "minutes").error).toBeUndefined();
    expect(parseCustomDuration("366", "days").error).toBe("too_long");
    expect(parseCustomDuration("8760.01", "hours").error).toBe("too_long");
  });

  it("names the error text", () => {
    expect(en[durationErrorKey("invalid")]).toBe("Enter a number.");
    expect(en[durationErrorKey("too_short")]).toBe(
      "A pause must be at least 1 minute."
    );
    expect(nl[durationErrorKey("too_long")]).toBe(
      "Een pauze duurt hoogstens 365 dagen."
    );
  });
});

describe("errors", () => {
  const validation = (key: string, domain = "automation_pause") => ({
    code: "service_validation_error",
    message: "Backend text",
    translation_domain: domain,
    translation_key: key,
    translation_placeholders: { entity_id: "automation.test" },
  });

  it("maps the backend keys to the card's own texts", () => {
    expect(errorText(validation("no_id"), en)).toBe(
      "automation.test has no id. Add an id: to this automation in YAML. Without it, a restart or reload turns the automation on again."
    );
    expect(errorText(validation("already_off"), nl)).toBe(
      "automation.test staat al uit. Er is niets te pauzeren."
    );
    expect(errorText(validation("duration_too_long"), en)).toBe(
      "A pause can be at most 365 days."
    );
  });

  it("has a text for every exception key in strings.json", () => {
    const backend = JSON.parse(
      readFileSync(
        new URL(
          "../../custom_components/automation_pause/strings.json",
          import.meta.url
        ),
        "utf8"
      )
    ) as { exceptions: Record<string, unknown> };
    expect([...BACKEND_ERROR_KEYS].sort()).toEqual(
      Object.keys(backend.exceptions).sort()
    );
    for (const key of BACKEND_ERROR_KEYS) {
      expect(errorText(validation(key), en)).not.toContain("{");
      expect(errorText(validation(key), nl)).not.toContain("{");
    }
  });

  it("falls back to the message", () => {
    expect(errorText(validation("something_new"), en)).toBe("Backend text");
    expect(errorText(validation("not_found", "homeassistant"), en)).toBe(
      "Backend text"
    );
    expect(errorText({ code: "unknown_error", message: "Boom" }, en)).toBe(
      "Boom"
    );
    expect(errorText("Plain text", en)).toBe("Plain text");
    expect(errorText({}, en)).toBe("Unknown error");
    expect(errorText(undefined, nl)).toBe("Onbekende fout");
  });
});

describe("data", () => {
  const hass: Pick<HomeAssistant, "states" | "entities" | "devices" | "areas"> =
    {
      states: {
        "automation.one": {
          entity_id: "automation.one",
          state: "on",
          attributes: {
            friendly_name: "One",
            id: "1001",
            last_triggered: "2026-10-09T10:00:00+00:00",
          },
        },
        "automation.two": {
          entity_id: "automation.two",
          state: "off",
          attributes: {
            friendly_name: "Two",
            id: 1002,
            last_triggered: null,
            icon: "mdi:water",
          },
        },
        "automation.three": {
          entity_id: "automation.three",
          state: "on",
          attributes: {},
        },
        "sensor.other": {
          entity_id: "sensor.other",
          state: "1",
          attributes: {},
        },
      },
      entities: {
        "automation.one": {
          entity_id: "automation.one",
          area_id: "kitchen",
          icon: "mdi:fan",
        },
        "automation.two": {
          entity_id: "automation.two",
          device_id: "device1",
        },
      },
      devices: { device1: { id: "device1", area_id: "garden" } },
      areas: {
        kitchen: { area_id: "kitchen", name: "Kitchen" },
        garden: { area_id: "garden", name: "Garden" },
      },
    };

  it("lists every automation with its area and pause", () => {
    const pauses = parsePauses([
      {
        entity_id: "automation.two",
        paused_at: "2026-10-09T10:00:00+00:00",
        resume_at: "2026-10-09T11:00:00+00:00",
      },
    ]);
    const items = buildItems(hass, pauses);
    expect(items).toEqual([
      {
        entity_id: "automation.one",
        name: "One",
        icon: "mdi:fan",
        area: "Kitchen",
        last_triggered: "2026-10-09T10:00:00+00:00",
        state: "on",
        config_id: "1001",
        pause: undefined,
      },
      {
        entity_id: "automation.two",
        name: "Two",
        icon: "mdi:water",
        area: "Garden",
        last_triggered: undefined,
        state: "off",
        config_id: "1002",
        pause: {
          paused_at: "2026-10-09T10:00:00+00:00",
          resume_at: "2026-10-09T11:00:00+00:00",
        },
      },
      {
        entity_id: "automation.three",
        name: "automation.three",
        icon: undefined,
        area: undefined,
        last_triggered: undefined,
        state: "on",
        config_id: undefined,
        pause: undefined,
      },
    ]);
  });

  it("skips bad pause entries", () => {
    expect(parsePauses(undefined).size).toBe(0);
    expect(parsePauses("x").size).toBe(0);
    expect(
      parsePauses([null, { entity_id: 1 }, { entity_id: "automation.a" }]).size
    ).toBe(0);
  });

  it("explains why an automation cannot be paused", () => {
    expect(pauseBlock(item({}))).toBeUndefined();
    expect(pauseBlock(item({ config_id: undefined }))).toBe("no_id");
    expect(pauseBlock(item({ state: "off" }))).toBe("already_off");
    expect(pauseBlock(item({ state: "unavailable" }))).toBe("unavailable");
    expect(
      pauseBlock(
        item({
          state: "off",
          pause: { paused_at: ago(MIN), resume_at: inMs(MIN) },
        })
      )
    ).toBeUndefined();
  });
});

describe("sensor", () => {
  const entities = (
    ...entries: { entity_id: string; platform?: string }[]
  ): Pick<HomeAssistant, "entities"> => ({
    entities: Object.fromEntries(entries.map((e) => [e.entity_id, e])),
  });

  it("finds the sensor of a new install by its platform", () => {
    const hass = entities(
      { entity_id: "sensor.other", platform: "template" },
      { entity_id: "automation.one", platform: "automation" },
      {
        entity_id: "sensor.automation_pause_and_resume_paused_automations",
        platform: "automation_pause",
      }
    );
    expect(findSensor(hass)).toBe(
      "sensor.automation_pause_and_resume_paused_automations"
    );
  });

  it("finds the entity ID that an older install keeps", () => {
    // The entity registry keeps the ID that the sensor got before.
    const hass = entities(
      { entity_id: "sensor.paused_automations", platform: "automation_pause" },
      { entity_id: "sensor.unrelated", platform: "demo" }
    );
    expect(findSensor(hass)).toBe("sensor.paused_automations");
  });

  it("finds a renamed sensor", () => {
    const hass = entities({
      entity_id: "sensor.my_pauses",
      platform: "automation_pause",
    });
    expect(findSensor(hass)).toBe("sensor.my_pauses");
  });

  it("uses the card config entity first", () => {
    const hass = entities({
      entity_id: "sensor.paused_automations",
      platform: "automation_pause",
    });
    expect(findSensor(hass, "sensor.chosen")).toBe("sensor.chosen");
  });

  it("finds nothing without the integration", () => {
    expect(
      findSensor(entities({ entity_id: "sensor.other", platform: "demo" }))
    ).toBeUndefined();
    expect(
      findSensor(
        entities({ entity_id: "automation.x", platform: "automation_pause" })
      )
    ).toBeUndefined();
    expect(findSensor({})).toBeUndefined();
  });
});

describe("strings", () => {
  it("picks the language and falls back to English", () => {
    expect(getStrings("nl").never).toBe("Nooit");
    expect(getStrings("nl-BE").never).toBe("Nooit");
    expect(getStrings("fr").never).toBe("Never");
    expect(getStrings(undefined).never).toBe("Never");
  });

  it("has the same keys in both languages", () => {
    expect(Object.keys(nl).sort()).toEqual(Object.keys(en).sort());
  });

  it("fills placeholders", () => {
    expect(formatString(en.search_other, { number: 91 })).toBe(
      "Search 91 automations"
    );
    expect(formatString("{a} {b}", { a: 1 })).toBe("1 {b}");
  });
});
