import dns from "node:dns/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as targets from "@/lib/network/target";
import { GET } from "./route";

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
});

describe("GET /api/cdn probing", () => {
  afterEach(() => vi.restoreAllMocks());

  it("starts the HTTP probe without waiting for the DNS enrichment and shares concurrent probes", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([{ address: "93.184.215.14", family: 4 }] as never);
    let releaseCname!: () => void;
    vi.spyOn(dns, "resolveCname").mockImplementation(
      () => new Promise((_resolve, reject) => {
        releaseCname = () => reject(Object.assign(new Error("no cname"), { code: "ENODATA" }));
      }),
    );
    vi.spyOn(dns, "resolve4").mockResolvedValue(["93.184.215.14"]);
    vi.spyOn(dns, "resolve6").mockRejectedValue(Object.assign(new Error("none"), { code: "ENODATA" }));
    const fetchProbe = vi.spyOn(targets, "fetchPublicUrl").mockResolvedValue(
      new Response("ok", { status: 200, headers: { "cf-ray": "abc-FRA", server: "cloudflare" } }),
    );

    const pending = [
      GET(new Request("http://localhost/api/cdn?target=probe.example")),
      GET(new Request("http://localhost/api/cdn?target=probe.example")),
    ];
    await vi.waitFor(() => expect(fetchProbe).toHaveBeenCalledTimes(1));
    // The CNAME lookup is still pending while the probe already ran.
    releaseCname();
    const [first, second] = await Promise.all(pending);
    const body = await first.json();

    expect(body).toMatchObject({ ok: true, data: { reachable: true, usesCdn: true, detectedCdn: "Cloudflare" } });
    expect(await second.json()).toEqual(body);
    expect(fetchProbe).toHaveBeenCalledTimes(1);
  });

  it("returns an unreachable result when cancelling the response body fails", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValue([{ address: "93.184.215.14", family: 4 }] as never);
    vi.spyOn(dns, "resolveCname").mockRejectedValue(new Error("no cname"));
    vi.spyOn(dns, "resolve4").mockResolvedValue(["93.184.215.14"]);
    vi.spyOn(dns, "resolve6").mockResolvedValue([]);
    const stream = new ReadableStream({
      cancel() { return Promise.reject(new Error("connection reset")); },
    });
    vi.spyOn(targets, "fetchPublicUrl").mockResolvedValue(new Response(stream, { status: 200 }));

    const response = await GET(new Request("http://localhost/api/cdn?target=cancel.example"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ok: true,
      data: { reachable: false, reasonCode: "unreachable" },
    });
  });
});
