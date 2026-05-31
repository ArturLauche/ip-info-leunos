import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const originalIpinfoToken = process.env.IPINFO_TOKEN;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function invoke(asn = "AS8881") {
  return GET(new Request(`http://localhost/api/asn/${asn}`), {
    params: Promise.resolve({ asn }),
  });
}

afterEach(() => {
  if (originalIpinfoToken === undefined) {
    delete process.env.IPINFO_TOKEN;
  } else {
    process.env.IPINFO_TOKEN = originalIpinfoToken;
  }
  vi.unstubAllGlobals();
});

describe("ASN API route", () => {
  it("combines IPinfo and PeeringDB data without exposing the token or contacts", async () => {
    process.env.IPINFO_TOKEN = "secret-token";
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);

      if (href.startsWith("https://ipinfo.io/")) {
        return jsonResponse({
          asn: "AS8881",
          name: "1&1 Versatel Deutschland GmbH",
          country: "DE",
          registry: "ripe",
          allocated: "1998-01-01",
          domain: "1und1.net",
          num_ips: 4096,
          type: "isp",
          prefixes: [{ netblock: "203.0.113.0/24", rpki_status: "valid" }],
          prefixes6: [{ netblock: "2001:db8::/32", rpki_status: "not_found" }],
          peers: ["3356"],
          upstreams: ["1299"],
          downstreams: ["200665"],
        });
      }

      if (href.includes("stat.ripe.net/data/as-overview")) {
        return jsonResponse({ data: { holder: "RIPE Holder" } });
      }

      if (href.includes("stat.ripe.net/data/announced-prefixes")) {
        return jsonResponse({ data: { prefixes: [{ prefix: "198.51.100.0/24" }] } });
      }

      if (href.includes("stat.ripe.net/data/asn-neighbours")) {
        return jsonResponse({
          data: {
            neighbours: [
              { asn: 1299, type: "left", power: 30, v4_peers: 12, v6_peers: 2 },
              { asn: 200665, type: "right", power: 20, v4_peers: 8, v6_peers: 1 },
            ],
          },
        });
      }

      return jsonResponse({
        data: [
          {
            id: 684,
            name: "1&1 Versatel Deutschland",
            aka: "Versatel",
            website: "https://www.1und1.net",
            looking_glass: "https://lg.example.net",
            route_server: "rs.example.net",
            info_traffic: "1-5Tbps",
            policy_general: "Open",
            policy_locations: "Required",
            policy_ratio: false,
            policy_contracts: "Not required",
            info_prefixes4: 20,
            info_prefixes6: 2,
            ix_count: 1,
            fac_count: 1,
            status: "ok",
            poc_set: [{ email: "private@example.net" }],
            netixlan_set: [{ id: 1, ix_id: 2, name: "DE-CIX Frankfurt", status: "ok" }],
            netfac_set: [{ id: 3, fac_id: 4, name: "Example Facility", city: "Berlin", country: "DE" }],
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await invoke();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      data: {
        found: true,
        asn: "AS8881",
        asnNumber: 8881,
        name: "1&1 Versatel Deutschland GmbH",
        country: "DE",
        sources: {
          ipinfo: "available",
          peeringdb: "available",
          ripestat: "available",
        },
        peeringdb: {
          netId: 684,
          name: "1&1 Versatel Deutschland",
        },
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("token=secret-token"),
      expect.any(Object),
    );
    expect(JSON.stringify(body)).not.toContain("secret-token");
    expect(JSON.stringify(body)).not.toContain("private@example.net");
  });

  it("skips IPinfo when no token is configured", async () => {
    delete process.env.IPINFO_TOKEN;
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);

      if (href.includes("stat.ripe.net/data/as-overview")) {
        return jsonResponse({ data: { holder: "RIPE Holder" } });
      }

      if (href.includes("stat.ripe.net/data/announced-prefixes")) {
        return jsonResponse({ data: { prefixes: [{ prefix: "198.51.100.0/24" }] } });
      }

      if (href.includes("stat.ripe.net/data/asn-neighbours")) {
        return jsonResponse({ data: { neighbours: [{ asn: 1299, type: "left", power: 30 }] } });
      }

      return jsonResponse({
        data: [],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await invoke("8881");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.peeringdb.com/api/net?asn=8881&depth=2",
      expect.any(Object),
    );
    expect(body).toMatchObject({
      ok: true,
      data: {
        found: true,
        asn: "AS8881",
        name: "RIPE Holder",
        upstreams: [{ asn: "AS1299" }],
        sources: {
          ipinfo: "not_configured",
          peeringdb: "unavailable",
          ripestat: "available",
        },
      },
    });
  });

  it("returns partial data when PeeringDB fails but IPinfo is available", async () => {
    process.env.IPINFO_TOKEN = "secret-token";
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);

      if (href.startsWith("https://ipinfo.io/")) {
        return jsonResponse({
          asn: "AS8881",
          name: "Example Network",
          country: "DE",
          prefixes: [],
          prefixes6: [],
        });
      }

      if (href.includes("stat.ripe.net/")) {
        return jsonResponse({ data: {} });
      }

      return jsonResponse({ error: "temporarily unavailable" }, 502);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await invoke();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      data: {
        found: true,
        name: "Example Network",
        sources: {
          ipinfo: "available",
          peeringdb: "error",
          ripestat: "unavailable",
        },
      },
    });
    expect(body.data.warnings).toContain("PeeringDB returned HTTP 502.");
  });

  it("rejects impossible ASNs", async () => {
    const response = await invoke("AS4294967296");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      ok: false,
      error: { code: "bad_request" },
    });
  });
});
