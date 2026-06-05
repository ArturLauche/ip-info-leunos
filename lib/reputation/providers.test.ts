import { describe, expect, it, vi } from "vitest";
import dns from "node:dns/promises";
import {
  spamhausDnsbl,
  abuseIpDb,
  ipApiReputation,
  alienVaultOtx,
} from "./providers";

describe("spamhausDnsbl", () => {
  it("is always configured", () => {
    expect(spamhausDnsbl.isConfigured()).toBe(true);
  });

  it("returns listed for 127.0.0.2", async () => {
    vi.spyOn(dns, "resolve4").mockResolvedValueOnce(["127.0.0.2"]);
    const result = await spamhausDnsbl.check("1.2.3.4", new AbortController().signal);
    expect(result.status).toBe("listed");
    expect(result.reason).toContain("127.0.0.2");
  });

  it("returns clean on ENOTFOUND", async () => {
    vi.spyOn(dns, "resolve4").mockRejectedValueOnce(new Error("queryA ENOTFOUND 4.3.2.1.zen.spamhaus.org"));
    const result = await spamhausDnsbl.check("1.2.3.4", new AbortController().signal);
    expect(result.status).toBe("clean");
  });

  it("returns clean on ENODATA", async () => {
    vi.spyOn(dns, "resolve4").mockRejectedValueOnce(new Error("queryA ENODATA 4.3.2.1.zen.spamhaus.org"));
    const result = await spamhausDnsbl.check("1.2.3.4", new AbortController().signal);
    expect(result.status).toBe("clean");
  });

  it("returns unknown for IPv6", async () => {
    const result = await spamhausDnsbl.check("2606:4700::1111", new AbortController().signal);
    expect(result.status).toBe("unknown");
  });

  it("returns error on unexpected DNS failure", async () => {
    vi.spyOn(dns, "resolve4").mockRejectedValueOnce(new Error("network unreachable"));
    const result = await spamhausDnsbl.check("1.2.3.4", new AbortController().signal);
    expect(result.status).toBe("error");
  });
});

describe("abuseIpDb", () => {
  it("is not configured without env key", () => {
    expect(abuseIpDb.isConfigured()).toBe(false);
  });

  it("returns not_configured when key missing", async () => {
    const result = await abuseIpDb.check("8.8.8.8", new AbortController().signal);
    expect(result.status).toBe("not_configured");
  });
});

describe("ipApiReputation", () => {
  it("is always configured", () => {
    expect(ipApiReputation.isConfigured()).toBe(true);
  });
});

describe("alienVaultOtx", () => {
  it("is not configured without env key", () => {
    expect(alienVaultOtx.isConfigured()).toBe(false);
  });

  it("returns not_configured when key missing", async () => {
    const result = await alienVaultOtx.check("8.8.8.8", new AbortController().signal);
    expect(result.status).toBe("not_configured");
  });
});
