import dns from "node:dns/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as targets from "@/lib/network/target";
import { GET } from "./route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/cdn", () => {
  it("rejects missing target with a validation error", async () => {
    const response = await GET(new Request("http://localhost/api/cdn"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("bad_request");
  });

  it("blocks localhost URLs without fetching", async () => {
    const response = await GET(
      new Request("http://localhost/api/cdn?target=http%3A%2F%2Flocalhost%2F"),
    );
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(["invalid_target", "target_blocked"]).toContain(body.error.code);
  });

  it("blocks private-IP URLs", async () => {
    const response = await GET(
      new Request("http://localhost/api/cdn?target=http%3A%2F%2F192.168.0.1%2F"),
    );
    const body = await response.json();

    expect(body.ok).toBe(false);
    expect(["invalid_target", "target_blocked"]).toContain(body.error.code);
  });

  it("reuses validated DNS addresses without a duplicate A/AAAA lookup", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([
      { address: "1.1.1.1", family: 4 },
      { address: "2606:4700:4700::1111", family: 6 },
    ] as never);
    const resolve4 = vi.spyOn(dns, "resolve4").mockResolvedValue([]);
    const resolve6 = vi.spyOn(dns, "resolve6").mockResolvedValue([]);
    vi.spyOn(dns, "resolveCname")
      .mockResolvedValueOnce(["edge.example"])
      .mockRejectedValue(new Error("CNAME lookup unavailable"));
    vi.spyOn(targets, "fetchPublicUrl").mockResolvedValue(new Response(null, {
      status: 200,
      headers: { server: "edge" },
    }));

    const response = await GET(new Request("http://localhost/api/cdn?target=https%3A%2F%2Fcdn.example%2F", {
      headers: { "x-real-ip": "198.51.100.45" },
    }));
    const body = await response.json();

    expect(body).toMatchObject({
      ok: true,
      data: {
        target: "cdn.example",
        resolvedIps: ["1.1.1.1", "2606:4700:4700::1111"],
        cnameChain: ["edge.example"],
      },
    });
    expect(dns.lookup).toHaveBeenCalledTimes(1);
    expect(targets.fetchPublicUrl).toHaveBeenCalledOnce();
    const [, requestOptions] = vi.mocked(targets.fetchPublicUrl).mock.calls[0];
    expect(requestOptions?.validatedTarget?.hostname).toBe("cdn.example");
    expect(resolve4).not.toHaveBeenCalled();
    expect(resolve6).not.toHaveBeenCalled();
  });
});
