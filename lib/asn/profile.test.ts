import { describe, expect, it } from "vitest";
import { buildAsnProfile } from "./profile";

const normalized = { asn: "AS8881", asnNumber: 8881 };

describe("buildAsnProfile", () => {
  it("merges IPinfo and PeeringDB data into a normalized profile", () => {
    const profile = buildAsnProfile({
      normalized,
      ipinfo: {
        status: "available",
        payload: {
          asn: "AS8881",
          name: "1&1 Versatel Deutschland GmbH",
          country: "DE",
          registry: "ripe",
          allocated: "1997-09-19",
          domain: "1und1.net",
          type: "isp",
          num_ips: "1234",
          prefixes: [{ netblock: "212.6.0.0/16", name: "VERSATEL", country: "DE", status: "assigned" }],
          prefixes6: [{ netblock: "2a02:8108::/29" }],
          peers: [{ asn: "AS3320", name: "DTAG" }, "AS6939"],
          upstreams: [{ asn: "AS3320" }],
          downstreams: [],
        },
      },
      peeringdb: {
        status: "available",
        record: {
          id: 684,
          name: "1&1 Versatel",
          aka: "Versatel",
          website: "https://www.1und1.net",
          looking_glass: "https://lg.example.com",
          route_server: "",
          info_traffic: "100-200Gbps",
          info_prefixes4: 5000,
          info_prefixes6: 1000,
          policy_general: "Selective",
          policy_ratio: true,
          policy_contracts: "Required",
          status: "ok",
          netixlan_set: [
            { name: "DE-CIX Frankfurt", ix_id: 31, speed: 100000, ipaddr4: "80.81.0.1", operational: true },
          ],
          netfac_set: [{ name: "Equinix FR5", fac_id: 100, city: "Frankfurt", country: "DE" }],
        },
      },
    });

    expect(profile.asn).toBe("AS8881");
    expect(profile.asnNumber).toBe(8881);
    expect(profile.name).toBe("1&1 Versatel Deutschland GmbH");
    expect(profile.country).toBe("DE");
    expect(profile.numIps).toBe(1234);
    expect(profile.prefixes4).toHaveLength(1);
    expect(profile.prefixes4[0]).toMatchObject({ prefix: "212.6.0.0/16", name: "VERSATEL" });
    expect(profile.prefixes6[0].prefix).toBe("2a02:8108::/29");
    expect(profile.peers).toEqual([
      { asn: "AS3320", name: "DTAG" },
      { asn: "AS6939" },
    ]);
    expect(profile.peeringdb?.netId).toBe(684);
    expect(profile.peeringdb?.ixCount).toBe(1);
    expect(profile.peeringdb?.facilityCount).toBe(1);
    expect(profile.peeringdb?.routeServer).toBeNull();
    expect(profile.sources).toEqual({ ipinfo: "available", peeringdb: "available" });
    expect(profile.warnings).toEqual([]);
  });

  it("degrades gracefully when IPinfo is not configured", () => {
    const profile = buildAsnProfile({
      normalized,
      ipinfo: { status: "not_configured" },
      peeringdb: {
        status: "available",
        record: { id: 684, name: "1&1 Versatel" },
      },
    });

    expect(profile.name).toBe("1&1 Versatel");
    expect(profile.numIps).toBeNull();
    expect(profile.prefixes4).toEqual([]);
    expect(profile.peers).toEqual([]);
    expect(profile.peeringdb?.netId).toBe(684);
    expect(profile.sources.ipinfo).toBe("not_configured");
    expect(profile.warnings.some((w) => w.includes("IPinfo token"))).toBe(true);
  });

  it("handles a missing PeeringDB profile", () => {
    const profile = buildAsnProfile({
      normalized,
      ipinfo: {
        status: "available",
        payload: { asn: "AS8881", name: "Example Net" },
      },
      peeringdb: { status: "unavailable" },
    });

    expect(profile.peeringdb).toBeNull();
    expect(profile.sources.peeringdb).toBe("unavailable");
    expect(profile.warnings.some((w) => w.includes("PeeringDB"))).toBe(true);
  });

  it("handles both providers failing without throwing", () => {
    const profile = buildAsnProfile({
      normalized,
      ipinfo: { status: "error" },
      peeringdb: { status: "error" },
    });

    expect(profile.name).toBeNull();
    expect(profile.peeringdb).toBeNull();
    expect(profile.prefixes4).toEqual([]);
    expect(profile.warnings).toHaveLength(2);
  });
});
