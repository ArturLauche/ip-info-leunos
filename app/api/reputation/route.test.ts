import { describe, expect, it, vi } from "vitest";
import dns from "node:dns/promises";
import { GET } from "./route";

describe("/api/reputation", () => {
  it("returns 400 for empty ip", async () => {
    const request = new Request("http://localhost/api/reputation?ip=");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const json = (await response.json()) as { ok: boolean };
    expect(json.ok).toBe(false);
  });

  it("returns 400 for missing ip", async () => {
    const request = new Request("http://localhost/api/reputation");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid target", async () => {
    const request = new Request("http://localhost/api/reputation?ip=not-an-ip");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("blocks private IPv4 addresses", async () => {
    const request = new Request("http://localhost/api/reputation?ip=192.168.1.1");
    const response = await GET(request);
    expect(response.status).toBe(403);
    const json = (await response.json()) as { ok: boolean };
    expect(json.ok).toBe(false);
  });

  it("blocks loopback IPv4", async () => {
    const request = new Request("http://localhost/api/reputation?ip=127.0.0.1");
    const response = await GET(request);
    expect(response.status).toBe(403);
    const json = (await response.json()) as { ok: boolean };
    expect(json.ok).toBe(false);
  });

  it("blocks private IPv6 addresses", async () => {
    const request = new Request("http://localhost/api/reputation?ip=::1");
    const response = await GET(request);
    expect(response.status).toBe(403);
    const json = (await response.json()) as { ok: boolean };
    expect(json.ok).toBe(false);
  });

  it("accepts public IPv4 and returns partial results when a provider fails", async () => {
    vi.spyOn(dns, "resolve4").mockResolvedValueOnce(["127.0.0.2"] as never);

    const request = new Request("http://localhost/api/reputation?ip=8.8.8.8");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: boolean; data: Record<string, unknown> };
    expect(json.ok).toBe(true);
    expect(json.data.ip).toBe("8.8.8.8");
    expect(Array.isArray(json.data.sources)).toBe(true);
  });

  it("accepts domains, resolves, and validates the first public IP", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([
      { address: "1.1.1.1", family: 4 },
    ] as never);

    const request = new Request("http://localhost/api/reputation?ip=example.com");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: boolean; data: Record<string, unknown> };
    expect(json.ok).toBe(true);
    expect(json.data.ip).toBe("1.1.1.1");
    expect(json.data.hostname).toBe("example.com");
  });
});
