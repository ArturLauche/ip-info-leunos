import { describe, expect, it } from "vitest";
import { isCacheableDnsResult } from "@/lib/dns-cache";
import { GET } from "./route";

describe("GET /api/dns", () => {
  it("rejects missing target with a validation error", async () => {
    const response = await GET(new Request("http://localhost/api/dns"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("blocks localhost without performing DNS resolution", async () => {
    const response = await GET(new Request("http://localhost/api/dns?target=localhost"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("blocks private IPv4 PTR targets", async () => {
    const response = await GET(new Request("http://localhost/api/dns?target=10.0.0.1"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });

  it("blocks internal-looking hostnames", async () => {
    const response = await GET(new Request("http://localhost/api/dns?target=host.internal"));
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("target_blocked");
  });
});

describe("isCacheableDnsResult", () => {
  it("caches clean answers and stable negatives", () => {
    expect(isCacheableDnsResult(null, [])).toBe(true);
    expect(isCacheableDnsResult("ENOTFOUND", [])).toBe(true);
    expect(isCacheableDnsResult("ENODATA", [])).toBe(true);
  });

  it("does not cache transient resolver failures", () => {
    expect(isCacheableDnsResult("DNS query timed out.", [])).toBe(false);
    expect(isCacheableDnsResult("SERVFAIL", [])).toBe(false);
    expect(isCacheableDnsResult("EREFUSED", [])).toBe(false);
    expect(isCacheableDnsResult(null, [{ type: "A", error: "DNS query timed out." }])).toBe(false);
    expect(isCacheableDnsResult(null, [{ type: "MX", error: "SERVFAIL" }])).toBe(false);
  });
});
