import { describe, expect, it } from "vitest";
import { extractAsnFromText, MAX_ASN, normalizeAsn } from "./input";

describe("normalizeAsn", () => {
  it("normalizes the AS-prefixed form", () => {
    expect(normalizeAsn("AS8881")).toEqual({
      ok: true,
      value: { asn: "AS8881", asnNumber: 8881 },
    });
  });

  it("normalizes a lowercase prefixed form", () => {
    expect(normalizeAsn("as8881")).toEqual({
      ok: true,
      value: { asn: "AS8881", asnNumber: 8881 },
    });
  });

  it("normalizes a bare numeric form", () => {
    expect(normalizeAsn("8881")).toEqual({
      ok: true,
      value: { asn: "AS8881", asnNumber: 8881 },
    });
  });

  it("trims surrounding and internal whitespace", () => {
    expect(normalizeAsn("  AS 8881  ")).toEqual({
      ok: true,
      value: { asn: "AS8881", asnNumber: 8881 },
    });
  });

  it("accepts the largest valid 32-bit ASN", () => {
    expect(normalizeAsn(String(MAX_ASN))).toEqual({
      ok: true,
      value: { asn: `AS${MAX_ASN}`, asnNumber: MAX_ASN },
    });
  });

  it("rejects empty input", () => {
    expect(normalizeAsn("")).toEqual({ ok: false, error: "empty" });
    expect(normalizeAsn("   ")).toEqual({ ok: false, error: "empty" });
    expect(normalizeAsn(null)).toEqual({ ok: false, error: "empty" });
    expect(normalizeAsn(undefined)).toEqual({ ok: false, error: "empty" });
  });

  it("rejects invalid strings", () => {
    expect(normalizeAsn("abc")).toEqual({ ok: false, error: "invalid_format" });
    expect(normalizeAsn("AS")).toEqual({ ok: false, error: "invalid_format" });
    expect(normalizeAsn("AS88.81")).toEqual({ ok: false, error: "invalid_format" });
    expect(normalizeAsn("12ab")).toEqual({ ok: false, error: "invalid_format" });
    expect(normalizeAsn("AS-1")).toEqual({ ok: false, error: "invalid_format" });
  });

  it("rejects zero and out-of-range values", () => {
    expect(normalizeAsn("0")).toEqual({ ok: false, error: "out_of_range" });
    expect(normalizeAsn("AS0")).toEqual({ ok: false, error: "out_of_range" });
    expect(normalizeAsn(String(MAX_ASN + 1))).toEqual({ ok: false, error: "out_of_range" });
    expect(normalizeAsn("99999999999")).toEqual({ ok: false, error: "out_of_range" });
  });
});

describe("extractAsnFromText", () => {
  it("extracts an ASN from a descriptive string", () => {
    expect(extractAsnFromText("AS8881 Deutsche Telekom AG")).toEqual({
      asn: "AS8881",
      asnNumber: 8881,
    });
  });

  it("returns null when no ASN is present", () => {
    expect(extractAsnFromText("Deutsche Telekom AG")).toBeNull();
    expect(extractAsnFromText("")).toBeNull();
    expect(extractAsnFromText(null)).toBeNull();
  });
});
