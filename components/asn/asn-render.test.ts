import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AsnProfile } from "@/lib/asn";
import { getToolTranslation } from "@/lib/tool-i18n";
import { FacilitySection } from "./facility-section";
import { IxPresenceSection } from "./ix-presence-section";
import { LoadingSkeleton } from "./loading-skeleton";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
import { PrefixSection } from "./prefix-section";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";
import { AsnSummaryCard } from "./summary-card";

const t = getToolTranslation("en");

/**
 * Render smoke tests for the redesigned ASN result sections. They guard the
 * information hierarchy contract — identity first, then metrics, then details —
 * and the sparse-data path, without pinning styling to specific class strings.
 */

function createProfile(overrides: Partial<AsnProfile> = {}): AsnProfile {
  return {
    found: true,
    asn: "AS8881",
    asnNumber: 8881,
    name: "VERSATEL 1&1 Versatel GmbH",
    country: "DE",
    registry: "ripe",
    allocated: "1999-03-04",
    domain: "versatel.de",
    type: "isp",
    numIps: 1048576,
    prefixes4: [
      { netblock: "62.128.0.0/12", id: "1", name: "VERSATEL", country: "DE", size: "1048576", status: "assigned", domain: "", rpkiStatus: "valid" },
      { netblock: "80.66.0.0/16", id: "2", name: "", country: "", size: "", status: "announced", domain: "", rpkiStatus: "invalid" },
    ],
    prefixes6: [
      { netblock: "2001:1b00::/32", id: "3", name: "", country: "", size: "", status: "announced", domain: "", rpkiStatus: "" },
    ],
    prefixes4Total: 566,
    prefixes6Total: 120,
    peers: [
      { asn: "AS6939", asnNumber: 6939, source: "RIPEstat RIS", power: 658, v4Peers: 120, v6Peers: 130 },
      { asn: "AS174", asnNumber: 174 },
    ],
    upstreams: [{ asn: "AS3320", asnNumber: 3320, source: "RIPEstat RIS", power: 1201, v4Peers: 30, v6Peers: 31 }],
    downstreams: [],
    peersTotal: 202,
    upstreamsTotal: 15,
    downstreamsTotal: 0,
    peeringdb: {
      netId: 684,
      name: "1&1 Versatel Deutschland",
      aka: "8881",
      website: "https://www.1und1.net/",
      lookingGlass: "https://lg.1und1.net",
      routeServer: "",
      traffic: "5-10Tbps",
      policyGeneral: "Selective",
      policyLocations: "Required - EU",
      policyRatio: "Not required",
      policyContracts: "Not Required",
      infoPrefixes4: 2500,
      infoPrefixes6: 500,
      status: "ok",
      ixCount: 7,
      facilityCount: 13,
      ixlan: [
        { id: 2283, ixId: 87, ixlanId: 87, name: "BCIX: BCIX Peering LAN", speed: 200000, ipaddr4: "193.178.185.15", ipaddr6: "2001:7f8:19:1::22b1:15", isRsPeer: true, operational: true, status: "ok" },
        { id: 2284, ixId: 88, ixlanId: 88, name: "DE-CIX Frankfurt", speed: 100000, ipaddr4: "80.81.192.1", ipaddr6: "", isRsPeer: false, operational: true, status: "ok" },
      ],
      facilities: [
        { id: 28103, facilityId: 60, name: "Equinix FR5 - Frankfurt, KleyerStrasse", city: "Frankfurt", country: "DE", localAsn: 8881, status: "ok" },
      ],
      ixlanTotal: 14,
      facilitiesTotal: 13,
    },
    sources: { ipinfo: "not_configured", peeringdb: "available", ripestat: "available" },
    warnings: ["RIPEstat IPv4 prefixes truncated to 100 of 566 records."],
    sourceDiagnostics: [
      { source: "ipinfo", status: "not_configured", durationMs: 10, cache: "not_configured", warnings: 0 },
      { source: "ripestat", status: "available", durationMs: 386, cache: "miss", warnings: 1 },
    ],
    ...overrides,
  };
}

const sparse = createProfile({
  name: "",
  country: "",
  registry: "",
  allocated: "",
  domain: "",
  type: "",
  numIps: null,
  prefixes4: [],
  prefixes6: [],
  prefixes4Total: 0,
  prefixes6Total: 0,
  peers: [],
  upstreams: [],
  peersTotal: 0,
  upstreamsTotal: 0,
  peeringdb: null,
  warnings: [],
});

describe("AsnSummaryCard", () => {
  it("leads with the ASN identity, then name, geography and domain", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("AS8881");
    expect(html).toContain("VERSATEL 1&amp;1 Versatel GmbH");
    expect(html).toContain("/api/flag/de");
    expect(html).toContain("Mar 4, 1999");
    expect(html).toContain('href="https://versatel.de"');
    // Identity precedes the metrics band in document order.
    expect(html.indexOf("AS8881")).toBeLessThan(html.indexOf("1,048,576"));
  });

  it("marks partial provider data as subordinate to the identity", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("Partial data");
    expect(html).not.toContain("Complete");
  });

  it("renders em dashes for unavailable metrics and zero for real zeroes", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: sparse, t, locale: "en" }));

    expect(html).toContain("Unnamed AS");
    // numIps unavailable and no PeeringDB profile -> two em dashes.
    expect(html.match(/—/g)?.length).toBeGreaterThanOrEqual(2);
    // Genuine zeroes still read as numbers.
    expect(html).toContain(">0<");
  });

  it("omits the metadata line entirely when no identity metadata exists", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: sparse, t, locale: "en" }));

    expect(html).not.toContain("Allocated");
    expect(html).not.toContain("/api/flag/");
  });
});

describe("RoutingSection", () => {
  it("links every relationship back to its own ASN page with power context", () => {
    const html = renderToStaticMarkup(createElement(RoutingSection, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain('href="/asn/AS6939"');
    expect(html).toContain('href="/asn/AS3320"');
    expect(html).toContain("v4 120");
    expect(html).toContain("RIPEstat RIS");
    expect(html).toContain("1,201");
  });

  it("shows per-relationship totals and designed empty states", () => {
    const html = renderToStaticMarkup(createElement(RoutingSection, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("202");
    expect(html).toContain("15");
    expect(html).toContain("No routing relationships returned by the configured sources.");
    expect(html).toContain("border-dashed");
  });
});

describe("PrefixSection", () => {
  it("separates IPv4 from IPv6 and distinguishes RPKI states by label", () => {
    const html = renderToStaticMarkup(createElement(PrefixSection, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("62.128.0.0/12");
    expect(html).toContain("2001:1b00::/32");
    expect(html).toContain("RPKI valid");
    expect(html).toContain("RPKI invalid");
    expect(html).toContain("566");
  });

  it("offers show-more only once the row limit is exceeded", () => {
    const many = createProfile({
      prefixes4: Array.from({ length: 9 }, (_, i) => ({
        netblock: `10.${i}.0.0/16`,
        id: String(i),
        name: "",
        country: "",
        size: "",
        status: "announced",
        domain: "",
        rpkiStatus: "",
      })),
    });
    const html = renderToStaticMarkup(createElement(PrefixSection, { result: many, t, locale: "en" }));

    expect(html).toContain("Show all (9)");
  });
});

describe("PeeringDbProfileSection", () => {
  it("groups profile data and links external profiles", () => {
    const html = renderToStaticMarkup(
      createElement(PeeringDbProfileSection, { profile: createProfile().peeringdb!, t, locale: "en" }),
    );

    expect(html).toContain("Identity &amp; status");
    expect(html).toContain("Interconnection details");
    expect(html).toContain("Peering policy");
    expect(html).toContain("External profiles");
    expect(html).toContain("1und1.net");
    expect(html).toContain('href="https://lg.1und1.net"');
    // Previously hidden network characteristics are surfaced.
    expect(html).toContain("IPv4 prefixes");
    expect(html).toContain("2,500");
  });

  it("hides fields and groups without values", () => {
    const emptyProfile = {
      netId: null,
      name: "",
      aka: "",
      website: "",
      lookingGlass: "",
      routeServer: "",
      traffic: "",
      policyGeneral: "",
      policyLocations: "",
      policyRatio: "",
      policyContracts: "",
      infoPrefixes4: null,
      infoPrefixes6: null,
      status: "",
      ixCount: 0,
      facilityCount: 0,
      ixlan: [],
      facilities: [],
      ixlanTotal: 0,
      facilitiesTotal: 0,
    };
    const html = renderToStaticMarkup(
      createElement(PeeringDbProfileSection, { profile: emptyProfile, t, locale: "en" }),
    );

    expect(html).not.toContain("Peering policy");
    expect(html).not.toContain("External profiles");
    expect(html).toContain("Interconnection details");
  });
});

describe("IxPresenceSection", () => {
  it("renders the desktop table and the mobile card list with RS peer state", () => {
    const html = renderToStaticMarkup(createElement(IxPresenceSection, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("BCIX: BCIX Peering LAN");
    expect(html).toContain("200 Gbps");
    expect(html).toContain("193.178.185.15");
    expect(html).toContain("2001:7f8:19:1::22b1:15");
    expect(html).toContain("aria-sort");
    expect(html).toContain("Sort by Exchange");
    // Both presentations exist in the DOM; CSS picks one per breakpoint.
    expect(html).toContain("md:hidden");
    expect(html).toContain("hidden overflow-hidden rounded-lg border border-border/60 md:block");
  });
});

describe("FacilitySection", () => {
  it("shows structured geography with a flag and a right-aligned local ASN", () => {
    const html = renderToStaticMarkup(
      createElement(FacilitySection, {
        facilities: createProfile().peeringdb!.facilities,
        total: 13,
        t,
        locale: "en",
      }),
    );

    expect(html).toContain("Equinix FR5 - Frankfurt, KleyerStrasse");
    expect(html).toContain("Frankfurt");
    expect(html).toContain("/api/flag/de");
    expect(html).toContain("DE");
    expect(html).toContain("8881");
    expect(html).toContain("aria-sort");
  });
});

describe("SourceDiagnosticsSection", () => {
  it("reports availability, duration, cache and warnings per source", () => {
    const html = renderToStaticMarkup(
      createElement(SourceDiagnosticsSection, { result: createProfile(), t, locale: "en" }),
    );

    expect(html).toContain("ripestat");
    expect(html).toContain("386 ms");
    expect(html).toContain("not configured");
    expect(html).toContain("Warnings");
    expect(html).toContain("Source");
  });
});

describe("LoadingSkeleton", () => {
  it("mirrors the summary card and tabbed detail card shape", () => {
    const html = renderToStaticMarkup(createElement(LoadingSkeleton, { label: "Looking up" }));

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Looking up");
    // Two cards: summary (identity + metrics band) and the tabbed detail card.
    expect(html.match(/data-slot="card"/g)?.length).toBe(2);
    expect(html).toContain("md:grid-cols-4");
  });
});
