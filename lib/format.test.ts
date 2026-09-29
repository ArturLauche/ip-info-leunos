import { describe, expect, it } from "vitest";
import { formatNumber, formatTemplate, valueOrDash } from "./format";

describe("formatNumber", () => {
  it("formats per locale and reuses formatters across calls", () => {
    expect(formatNumber(1234567.5, "en")).toBe("1,234,567.5");
    expect(formatNumber(1234567.5, "de")).toBe("1.234.567,5");
    expect(formatNumber(1234567.5, "en")).toBe("1,234,567.5");
  });

  it("renders a dash for missing or non-finite values", () => {
    expect(formatNumber(null, "en")).toBe("-");
    expect(formatNumber(undefined, "en")).toBe("-");
    expect(formatNumber(Number.NaN, "en")).toBe("-");
    expect(formatNumber(Number.POSITIVE_INFINITY, "en")).toBe("-");
  });
});

describe("formatTemplate and valueOrDash", () => {
  it("replaces every placeholder occurrence", () => {
    expect(formatTemplate("{a}-{b}-{a}", { a: 1, b: "x" })).toBe("1-x-1");
  });

  it("dashes empty values only", () => {
    expect(valueOrDash("")).toBe("-");
    expect(valueOrDash(0)).toBe("0");
  });
});
