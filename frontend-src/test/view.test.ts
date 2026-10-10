import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW, parseView } from "../src/logic";

describe("stored view", () => {
  it("restores a stored sort and filter", () => {
    expect(parseView('{"sort":"name","status":"paused"}')).toEqual({
      sort: "name",
      status: "paused",
    });
  });

  it("uses the defaults when nothing is stored", () => {
    expect(parseView(null)).toEqual(DEFAULT_VIEW);
    expect(parseView(undefined)).toEqual(DEFAULT_VIEW);
  });

  it("uses the defaults for damaged data", () => {
    expect(parseView("{not json")).toEqual(DEFAULT_VIEW);
    expect(parseView("42")).toEqual(DEFAULT_VIEW);
  });

  it("replaces only the values it does not know", () => {
    expect(parseView('{"sort":"colour","status":"disabled"}')).toEqual({
      sort: DEFAULT_VIEW.sort,
      status: "disabled",
    });
  });
});
