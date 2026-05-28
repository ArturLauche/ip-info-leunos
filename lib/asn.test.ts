import { describe, expect, it } from "vitest";
import { asnDisplay, isValidAsnNumber, normalizeAsnInput, asnQuerySchema } from "./asn";

describe("normalizeAsnInput", () => {
  it("parses AS-prefixed input", () => {
    expect(normalizeAsnInput("AS8881")).toEqual({ display: "AS8881", number: 8881 });
  });

  it("parses lowercase as prefix", () => {
    expect(normalizeAsnInput("as8881")).toEqual({ display: "AS8881", number: 8881 });
  });

  it("parses numeric-only input", () => {
    expect(normalizeAsnInput("8881")).toEqual({ display: "AS8881", number: 8881 });
  });

  it("trims whitespace", () => {
    expect(normalizeAsnInput("  AS8881  ")).toEqual({ display: "AS8881", number: 8881 });
  });

  it("accepts AS1 (minimum valid)", () => {
    expect(normalizeAsnInput("AS1")).toEqual({ display: "AS1", number: 1 });
  });

  it("accepts maximum 32-bit ASN", () => {
    expect(normalizeAsnInput("AS4294967295")).toEqual({
      display: "AS4294967295",
      number: 4294967295,
    });
  });

  it("rejects AS0", () => {
    expect(normalizeAsnInput("AS0")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(normalizeAsnInput("")).toBeNull();
  });

  it("rejects whitespace-only", () => {
    expect(normalizeAsnInput("   ")).toBeNull();
  });

  it("rejects non-numeric string", () => {
    expect(normalizeAsnInput("abc")).toBeNull();
  });

  it("rejects bare AS prefix", () => {
    expect(normalizeAsnInput("AS")).toBeNull();
  });

  it("rejects space between AS and number", () => {
    expect(normalizeAsnInput("AS 8881")).toBeNull();
  });

  it("rejects hyphen-separated prefix", () => {
    expect(normalizeAsnInput("AS-8881")).toBeNull();
  });

  it("rejects value exceeding 32-bit range", () => {
    expect(normalizeAsnInput("AS4294967296")).toBeNull();
  });

  it("rejects very large numbers", () => {
    expect(normalizeAsnInput("AS99999999999")).toBeNull();
  });

  it("rejects decimal numbers", () => {
    expect(normalizeAsnInput("8881.5")).toBeNull();
  });

  it("rejects negative numbers", () => {
    expect(normalizeAsnInput("-8881")).toBeNull();
  });
});

describe("isValidAsnNumber", () => {
  it("accepts 1", () => {
    expect(isValidAsnNumber(1)).toBe(true);
  });

  it("accepts 4294967295", () => {
    expect(isValidAsnNumber(4294967295)).toBe(true);
  });

  it("rejects 0", () => {
    expect(isValidAsnNumber(0)).toBe(false);
  });

  it("rejects 4294967296", () => {
    expect(isValidAsnNumber(4294967296)).toBe(false);
  });

  it("rejects negative", () => {
    expect(isValidAsnNumber(-1)).toBe(false);
  });

  it("rejects non-integer", () => {
    expect(isValidAsnNumber(1.5)).toBe(false);
  });

  it("rejects NaN", () => {
    expect(isValidAsnNumber(Number.NaN)).toBe(false);
  });
});

describe("asnDisplay", () => {
  it("formats simple ASN", () => {
    expect(asnDisplay(8881)).toBe("AS8881");
  });

  it("formats ASN 1", () => {
    expect(asnDisplay(1)).toBe("AS1");
  });

  it("formats large ASN", () => {
    expect(asnDisplay(4294967295)).toBe("AS4294967295");
  });
});

describe("asnQuerySchema", () => {
  it("transforms valid input to number", () => {
    const result = asnQuerySchema.safeParse("AS8881");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(8881);
  });

  it("transforms numeric input", () => {
    const result = asnQuerySchema.safeParse("8881");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(8881);
  });

  it("rejects invalid input", () => {
    const result = asnQuerySchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });

  it("rejects empty input", () => {
    const result = asnQuerySchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects AS0", () => {
    const result = asnQuerySchema.safeParse("AS0");
    expect(result.success).toBe(false);
  });
});
