import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Events for HA itself. Every other event is internal to the card.
const HA_EVENTS = new Set(["hass-more-info", "location-changed"]);

const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sources(join(dir, entry.name))
      : entry.name.endsWith(".ts")
        ? [readFileSync(join(dir, entry.name), "utf-8")]
        : []
  );

describe("event names", () => {
  // Composed events bubble to HA's app root. An internal event with one of
  // HA's names (such as "dialog-closed") makes HA's own listener fail.
  it("prefixes every internal event", () => {
    const code = sources(join(__dirname, "..", "src")).join("\n");
    const fired = [
      ...code.matchAll(/fireEvent(?:<[^>]+>)?\(\s*\w+,\s*"([^"]+)"/g),
      ...code.matchAll(/new CustomEvent\(\s*"([^"]+)"/g),
    ].map((match) => match[1]);
    expect(fired.length).toBeGreaterThan(0);
    for (const name of fired) {
      if (!HA_EVENTS.has(name)) {
        expect(name).toMatch(/^automation-pause-/);
      }
    }
  });
});
