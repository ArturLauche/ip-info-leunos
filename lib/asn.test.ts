import { describe, expect, it } from "vitest";
import {
  AsnValidationError,
  normalizeAsnInput,
  normalizeIpinfoAsnPayload,
  normalizePeeringDbPayload,
  normalizeRipeStatPayload,
} from "@/lib/asn";

describe("ASN normalization", () => {
  it.each([
    ["AS8881", { asn: "AS8881", asnNumber: 8881 }],
    ["as8881", { asn: "AS8881", asnNumber: 8881 }],
    ["8881", { asn: "AS8881", asnNumber: 8881 }],
    [" AS0008881 ", { asn: "AS8881", asnNumber: 8881 }],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeAsnInput(input)).toEqual(expected);
  });

  it.each(["", "AS", "ASN8881", "8 881", "-1", "AS0", "AS4294967296"])(
    "rejects invalid ASN input %s",
    (input) => {
      expect(() => normalizeAsnInput(input)).toThrow(AsnValidationError);
    },
  );
});

describe("ASN provider normalization", () => {
  it("normalizes IPinfo ASN payloads", () => {
    const warnings: string[] = [];
    const normalized = normalizeIpinfoAsnPayload(
      {
        name: "Example Network",
        country: "DE",
        registry: "ripe",
        allocated: "1998-01-01",
        domain: "example.net",
        num_ips: 1024,
        type: "isp",
        prefixes: [
          {
            netblock: "203.0.113.0/24",
            id: "EXAMPLE-V4",
            name: "Example Network",
            country: "DE",
            size: "256",
            status: "ALLOCATED PA",
            domain: "example.net",
            rpki_status: "valid",
          },
        ],
        prefixes6: [{ netblock: "2001:db8::/32", rpki_status: "not_found" }],
        peers: ["3356", "AS6939", "invalid"],
        upstreams: [1299],
        downstreams: ["200665"],
      },
      warnings,
    );

    expect(normalized).toMatchObject({
      name: "Example Network",
      country: "DE",
      registry: "ripe",
      allocated: "1998-01-01",
      domain: "example.net",
      numIps: 1024,
      type: "isp",
      prefixes4Total: 1,
      prefixes6Total: 1,
      peersTotal: 2,
      upstreamsTotal: 1,
      downstreamsTotal: 1,
    });
    expect(normalized?.prefixes4[0]).toMatchObject({
      netblock: "203.0.113.0/24",
      rpkiStatus: "valid",
    });
    expect(normalized?.peers.map((peer) => peer.asn)).toEqual(["AS3356", "AS6939"]);
    expect(warnings).toEqual([]);
  });

  it("normalizes PeeringDB payloads without leaking contact data", () => {
    const warnings: string[] = [];
    const normalized = normalizePeeringDbPayload(
      {
        data: [
          {
            id: 684,
            name: "Example Peering",
            aka: "Example",
            website: "https://example.net",
            looking_glass: "https://lg.example.net",
            route_server: "rs.example.net",
            info_traffic: "1-5Tbps",
            policy_general: "Open",
            policy_locations: "Required",
            policy_ratio: false,
            policy_contracts: "Not required",
            info_prefixes4: 20,
            info_prefixes6: 3,
            ix_count: 1,
            fac_count: 1,
            status: "ok",
            poc_set: [{ email: "private@example.net", phone: "+49 30 000000" }],
            netixlan_set: [
              {
                id: 1,
                ix_id: 2,
                ixlan_id: 3,
                name: "DE-CIX Frankfurt",
                speed: 100000,
                ipaddr4: "198.51.100.1",
                ipaddr6: "2001:db8::1",
                is_rs_peer: true,
                operational: true,
                status: "ok",
              },
            ],
            netfac_set: [
              {
                id: 4,
                fac_id: 5,
                name: "Example Facility",
                city: "Berlin",
                country: "DE",
                local_asn: 8881,
                status: "ok",
              },
            ],
          },
        ],
      },
      warnings,
    );

    expect(normalized).toMatchObject({
      netId: 684,
      name: "Example Peering",
      policyRatio: "Not required",
      ixCount: 1,
      facilityCount: 1,
      ixlanTotal: 1,
      facilitiesTotal: 1,
    });
    expect(normalized?.ixlan[0]).toMatchObject({
      name: "DE-CIX Frankfurt",
      speed: 100000,
      isRsPeer: true,
    });
    expect(normalized?.facilities[0]).toMatchObject({
      name: "Example Facility",
      city: "Berlin",
      localAsn: 8881,
    });
    expect(JSON.stringify(normalized)).not.toContain("private@example.net");
    expect(JSON.stringify(normalized)).not.toContain("+49 30 000000");
  });

  it("normalizes RIPEstat prefixes and routing neighbours", () => {
    const warnings: string[] = [];
    const normalized = normalizeRipeStatPayload(
      {
        overview: {
          data: {
            holder: "Example Holder",
          },
        },
        prefixes: {
          data: {
            prefixes: [{ prefix: "203.0.113.0/24" }, { prefix: "2001:db8::/32" }],
          },
        },
        neighbours: {
          data: {
            neighbours: [
              { asn: 1299, type: "left", power: 30, v4_peers: 12, v6_peers: 4 },
              { asn: 200665, type: "right", power: 20, v4_peers: 10, v6_peers: 2 },
              { asn: 6939, type: "unknown", power: 5, v4_peers: 3, v6_peers: 1 },
            ],
          },
        },
      },
      warnings,
    );

    expect(normalized).toMatchObject({
      name: "Example Holder",
      prefixes4Total: 1,
      prefixes6Total: 1,
      peersTotal: 1,
      upstreamsTotal: 1,
      downstreamsTotal: 1,
    });
    expect(normalized?.prefixes4[0]).toMatchObject({
      netblock: "203.0.113.0/24",
      status: "announced",
    });
    expect(normalized?.upstreams[0]).toMatchObject({
      asn: "AS1299",
      source: "RIPEstat RIS",
      power: 30,
      v4Peers: 12,
      v6Peers: 4,
    });
    expect(normalized?.downstreams[0].asn).toBe("AS200665");
    expect(normalized?.peers[0].asn).toBe("AS6939");
  });
});
