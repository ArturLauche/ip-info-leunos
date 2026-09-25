import { describe, expect, it } from "vitest";
import { DNS_TIMEOUT_MESSAGE, dnsLookupErrorCode } from "./dns-errors";

describe("dnsLookupErrorCode", () => {
  it("classifies the codes Node's resolver actually emits", () => {
    // c-ares failures carry an "E" prefix: the server-side failure is
    // ESERVFAIL, so a SERVFAIL-only check would never fire.
    expect(dnsLookupErrorCode("ESERVFAIL")).toBe("temporary");
    expect(dnsLookupErrorCode("EAI_AGAIN")).toBe("temporary");
    expect(dnsLookupErrorCode("EREFUSED")).toBe("temporary");
    expect(dnsLookupErrorCode("SERVFAIL")).toBe("temporary");
    expect(dnsLookupErrorCode(DNS_TIMEOUT_MESSAGE)).toBe("timeout");
    expect(dnsLookupErrorCode("ETIMEOUT")).toBe("timeout");
    expect(dnsLookupErrorCode("ENOTFOUND")).toBe("not_found");
    expect(dnsLookupErrorCode("ENODATA")).toBe("not_found");
  });

  it("falls back to unknown for anything unrecognized", () => {
    expect(dnsLookupErrorCode(undefined)).toBe("unknown");
    expect(dnsLookupErrorCode(null)).toBe("unknown");
    expect(dnsLookupErrorCode("")).toBe("unknown");
    expect(dnsLookupErrorCode("ECONNRESET")).toBe("unknown");
  });
});
