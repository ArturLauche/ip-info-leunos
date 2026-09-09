import { describe, expect, it } from "vitest";
import { firstSearchParam } from "./search-params";

describe("page search parameters", () => {
  it("uses the first value consistently for repeated query keys", () => {
    expect(firstSearchParam(["1.1.1.1", "8.8.8.8"])).toBe("1.1.1.1");
    expect(firstSearchParam(["", "8.8.8.8"])).toBe("");
  });

  it("handles absent, empty, and single values without coercing arrays", () => {
    expect(firstSearchParam(undefined)).toBe("");
    expect(firstSearchParam([])).toBe("");
    expect(firstSearchParam("example.com")).toBe("example.com");
  });
});
