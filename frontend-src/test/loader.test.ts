import { describe, expect, it } from "vitest";
import { cardUrl, loadErrorMessage } from "../src/loader";

describe("loader", () => {
  it("loads the card next to it with the same version", () => {
    expect(
      cardUrl(
        "https://ha.example/automation_pause/automation-pause-loader.js?v=1.2.3"
      )
    ).toBe(
      "https://ha.example/automation_pause/automation-pause-card.js?v=1.2.3"
    );
  });

  it("names the error, its first stack lines and the browser", () => {
    const error = new TypeError("x is not a function");
    error.stack =
      "TypeError: x is not a function\n  at a (card.js:1:2)\n  at b (card.js:3:4)";
    const message = loadErrorMessage(error, "TestBrowser/1");
    expect(message).toContain("could not load: TypeError: x is not a function");
    expect(message).toContain("at a (card.js:1:2) | at b (card.js:3:4)");
    expect(message).toContain("browser: TestBrowser/1");
  });

  it("handles a value that is not an Error", () => {
    expect(loadErrorMessage("failed", "B/1")).toBe(
      "automation-pause-card could not load: failed\nbrowser: B/1"
    );
  });
});
