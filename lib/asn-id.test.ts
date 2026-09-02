import { describe, expect, it } from "vitest";
import { AsnValidationError, MAX_ASN_NUMBER, normalizeAsnInput } from "./asn-id";

describe("normalizeAsnInput (client-safe)", () => {
  it("normalizes numeric and AS-prefixed input", () => {
    expect(normalizeAsnInput("8881")).toEqual({ asn: "AS8881", asnNumber: 8881 });
    expect(normalizeAsnInput("as8881")).toEqual({ asn: "AS8881", asnNumber: 8881 });
    expect(normalizeAsnInput("  AS008881  ")).toEqual({ asn: "AS8881", asnNumber: 8881 });
  });

  it("rejects non-numeric input", () => {
    expect(() => normalizeAsnInput("example.com")).toThrow(AsnValidationError);
    expect(() => normalizeAsnInput("")).toThrow(AsnValidationError);
  });

  it("rejects out-of-range numbers", () => {
    expect(() => normalizeAsnInput("0")).toThrow(AsnValidationError);
    expect(() => normalizeAsnInput(String(MAX_ASN_NUMBER + 1))).toThrow(AsnValidationError);
  });
});
