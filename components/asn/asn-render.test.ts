import { createElement, type ReactElement } from "react";
import type { ComponentProps } from "react";
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withI18n } from "@/components/i18n-test-utils";
import { getI18nDictionaries } from "@/lib/i18n-dictionaries";
import type { AsnProfile } from "@/lib/asn";
import { getToolTranslation } from "@/lib/tool-i18n";
import { ExternalLink } from "./external-link";
import { FacilitySection } from "./facility-section";
import {
  countryName,
  displayUrl,
  exchangesTab,
  formatCount,
  formatPolicyValue,
  formatSpeed,
  ipv4EquivalentBits,
  isUrl,
  knownTotal,
  peeringDbUrl,
  registryName,
  splitHolderName,
  splitIxName,
} from "./helpers";
import { AsnDetailTabs } from "./detail-tabs";
import { IxPresenceSection } from "./ix-presence-section";
import { LoadingSkeleton } from "./loading-skeleton";
import { AsnCapabilities, ExampleAsns, LookupError, NotFoundState } from "./lookup-states";
import { PeeringUnavailable } from "./peering-unavailable";
import { PeeringDbProfileSection } from "./peeringdb-profile-section";
import { PrefixSection } from "./prefix-section";
import { AsnResultView, buildDetailTabs } from "./result-view";
import { RoutingSection } from "./routing-section";
import { SourceDiagnosticsSection } from "./source-diagnostics-section";
import { AsnSummaryCard } from "./summary-card";

const t = getToolTranslation("en");

const renderToStaticMarkup = (element: ReactElement) => renderMarkup(withI18n(element));

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
    warnings: [],
    warningDetails: [
      {
        code: "truncated",
        label: "RIPEstat IPv4 prefixes",
        limit: 100,
        total: 566,
      },
    ],
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
  it("leads with the organisation and ASN, then geography, domain and the metrics", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("AS8881");
    expect(html).toContain("VERSATEL 1&amp;1 Versatel GmbH");
    expect(html).toContain("/api/flag/de");
    expect(html).toContain("Mar 4, 1999");
    expect(html).toContain('href="https://versatel.de"');
    // The organisation names the network, its ASN follows, and identity
    // precedes the metrics band in document order.
    expect(html.indexOf("VERSATEL 1&amp;1 Versatel GmbH")).toBeLessThan(html.indexOf("AS8881"));
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

  it("labels registry facts with readable names", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("Germany");
    expect(html).toContain("RIPE NCC");
    expect(html).toContain(">ISP<");
    expect(html).toContain("≈ /12 equivalent");
    expect(html).toContain("566 IPv4");
  });

  it("names each provider's availability in the provenance strip", () => {
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("IPinfo");
    expect(html).toContain("not configured");
    expect(html).toContain("RIPEstat");
    expect(html).toContain("PeeringDB");
    // Missing IPv4 data explains itself instead of showing a bare dash.
    expect(renderToStaticMarkup(createElement(AsnSummaryCard, { result: sparse, t, locale: "en" }))).toContain(
      "Requires IPinfo",
    );
  });

  it("treats prefixes and neighbours as unavailable when no routing source answered", () => {
    const offline = createProfile({
      ...sparse,
      sources: { ipinfo: "not_configured", peeringdb: "available", ripestat: "error" },
    });
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: offline, t, locale: "en" }));

    expect(html).not.toContain(">0<");
    expect(html).toContain("Not reported");
  });

  it("leads with the organisation when the holder string carries a registry handle", () => {
    const html = renderToStaticMarkup(
      createElement(AsnSummaryCard, {
        result: createProfile({ name: "CLOUDFLARENET - Cloudflare, Inc." }),
        t,
        locale: "en",
      }),
    );

    expect(html.indexOf("Cloudflare, Inc.")).toBeLessThan(html.indexOf("CLOUDFLARENET<"));
  });

  it("turns each headline figure into a shortcut only when a navigator is given", () => {
    const buttons = (html: string) => html.match(/<button/g)?.length ?? 0;
    const passive = renderToStaticMarkup(createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en" }));
    const interactive = renderToStaticMarkup(
      createElement(AsnSummaryCard, { result: createProfile(), t, locale: "en", onNavigate: () => {} }),
    );

    // The copy button is the only control without a navigator; each of the
    // four figures adds one with it.
    expect(buttons(passive)).toBe(1);
    expect(buttons(interactive)).toBe(5);
  });

  it("surfaces the PeeringDB policy and traffic, with the website standing in for a missing domain", () => {
    const html = renderToStaticMarkup(
      createElement(AsnSummaryCard, { result: createProfile({ domain: "" }), t, locale: "en" }),
    );

    expect(html).toContain("Peering policy");
    expect(html).toContain("Selective");
    expect(html).toContain("5-10Tbps");
    expect(html).toContain("Website");
    expect(html).toContain('href="https://www.1und1.net/"');
    expect(html).not.toContain(">Domain<");
  });

  it("never links a website that is not http(s)", () => {
    const profile = createProfile({ domain: "" });
    profile.peeringdb!.website = "javascript:alert(1)";
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: profile, t, locale: "en" }));

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("Website");
  });

  it("words the policy exactly as the profile tab does", () => {
    const profile = createProfile();
    profile.peeringdb!.policyGeneral = "Required - EU";
    const html = renderToStaticMarkup(createElement(AsnSummaryCard, { result: profile, t, locale: "en" }));

    expect(html).toContain("Required – EU");
    expect(html).not.toContain("Required - EU");
    expect(html).not.toContain("– -");
  });
});

describe("RoutingSection", () => {
  it("links every relationship back to its own ASN page with power context", () => {
    const html = renderToStaticMarkup(createElement(RoutingSection, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain('href="/asn/AS6939"');
    expect(html).toContain('href="/asn/AS3320"');
    expect(html).toContain("v4 120");
    expect(html).toContain("Power and peer counts observed via RIPEstat RIS.");
    expect(html).toContain("1,201");
  });

  it("shows per-relationship totals and designed empty states", () => {
    const html = renderToStaticMarkup(createElement(RoutingSection, { result: createProfile(), t, locale: "en" }));

    expect(html).toContain("202");
    expect(html).toContain("15");
    // An empty relationship type gets a short in-column placeholder…
    expect(html).toContain("None reported");
    expect(html).toContain("border-dashed");

    // …and a section with no relationships at all explains why once.
    const empty = renderToStaticMarkup(createElement(RoutingSection, { result: sparse, t, locale: "en" }));
    expect(empty).toContain("No routing relationships returned by the configured sources.");
  });

  it("orders relationships upstream, peer, downstream and names the source once", () => {
    const html = renderToStaticMarkup(createElement(RoutingSection, { result: createProfile(), t, locale: "en" }));

    expect(html.indexOf("Upstreams")).toBeLessThan(html.indexOf("Peers"));
    expect(html.indexOf("Peers")).toBeLessThan(html.indexOf("Downstreams"));
    expect(html.match(/Power and peer counts observed via RIPEstat RIS\./g)?.length).toBe(1);
    expect(html.match(/RIPEstat RIS/g)?.length).toBe(1);
    // Terse cells, descriptive link names.
    expect(html).toContain('aria-label="AS6939, power 658, IPv4 peers 120, IPv6 peers 130"');
  });

  it("sizes the v4, v6 and power columns from the longest figure in each list", () => {
    // Header and list share a template per column; report each distinct one in order.
    const templates = (html: string) => [...new Set([...html.matchAll(/--rel-cols:([^";]+)/g)].map((m) => m[1]))];

    // Each list is sized on its own figures (upstreams 30/31, peers 120/130),
    // and 6rem is the floor for the power cell.
    expect(templates(renderToStaticMarkup(createElement(RoutingSection, { result: createProfile(), t, locale: "en" })))).toEqual([
      "minmax(0,1fr) 1rem 1rem 6rem",
      "minmax(0,1fr) 1.5rem 1.5rem 6rem",
    ]);

    // Seven-digit peer counts and a seven-digit power (bar 2.5rem + gap 0.5rem
    // + nine characters) get their own room instead of colliding.
    const large = createProfile({
      peers: [{ asn: "AS3320", asnNumber: 3320, power: 1_376_839, v4Peers: 1_376_839, v6Peers: 186_635 }],
      peersTotal: 1,
      upstreams: [],
      downstreams: [],
    });
    expect(templates(renderToStaticMarkup(createElement(RoutingSection, { result: large, t, locale: "en" })))).toEqual([
      "minmax(0,1fr) 4.5rem 3.5rem 7.5rem",
    ]);
  });
});

describe("PrefixSection", () => {
  it("separates IPv4 from IPv6 and distinguishes RPKI states by label", () => {
    const html = renderToStaticMarkup(createElement(PrefixSection, { result: createProfile(), t, locale: "en" }));

    // Address and prefix length render as separate weights.
    expect(html).toContain("62.128.0.0</span>");
    expect(html).toContain("/12</span>");
    expect(html).toContain("2001:1b00::</span>");
    expect(html).toContain("RPKI valid");
    expect(html).toContain("RPKI invalid");
    expect(html).toContain("566");
    expect(html).toContain("1,048,576 IPs");
    // "announced" is implied by the section and not repeated per row.
    expect(html).not.toContain(">announced<");
    expect(html).not.toContain("· announced");
    expect(html).toContain("2 of 566 listed");
  });

  it("offers show-more only once the row limit is exceeded", () => {
    const prefixes = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        netblock: `10.${i}.0.0/16`,
        id: String(i),
        name: "",
        country: "",
        size: "",
        status: "announced",
        domain: "",
        rpkiStatus: "",
      }));
    const render = (count: number) =>
      renderToStaticMarkup(
        createElement(PrefixSection, {
          result: createProfile({ prefixes4: prefixes(count), prefixes4Total: count }),
          t,
          locale: "en",
        }),
      );

    expect(render(10)).not.toContain("more</button>");
    expect(render(11)).toContain("Show 1 more");
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
    // The network ID links to the PeeringDB record.
    expect(html).toContain('href="https://www.peeringdb.com/net/684"');
  });

  it("lists the general policy and declared traffic as profile rows", () => {
    const html = renderToStaticMarkup(
      createElement(PeeringDbProfileSection, { profile: createProfile().peeringdb!, t, locale: "en" }),
    );

    expect(html).toContain("Selective");
    expect(html).toContain("5-10Tbps");
    // Exchange and facility counts belong to their own tabs, not the profile.
    expect(html).not.toContain("Exchanges");
    expect(html).not.toContain("connections");
  });

  it("keeps the free text after a closed policy answer without doubling the separator", () => {
    const html = renderToStaticMarkup(
      createElement(PeeringDbProfileSection, { profile: createProfile().peeringdb!, t, locale: "en" }),
    );

    // PeeringDB writes "Required - EU"; the answer is translated and the
    // separator normalised.
    expect(html).toContain("Required – EU");
    expect(html).not.toContain("– -");
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
    expect(html).not.toContain("Interconnection details");
    // No group means no empty definition lists either.
    expect(html).not.toContain("<dl");
  });
});

describe("IxPresenceSection", () => {
  it("renders the desktop table and the mobile card list with RS peer state", () => {
    const html = renderToStaticMarkup(createElement(IxPresenceSection, { result: createProfile(), t, locale: "en" }));

    // Exchange and LAN names split onto two lines; the IX links to PeeringDB.
    expect(html).toContain("BCIX Peering LAN");
    expect(html).toContain('href="https://www.peeringdb.com/ix/87"');
    expect(html).toContain('aria-label="View BCIX: BCIX Peering LAN on PeeringDB"');
    expect(html).toContain("200 Gbps");
    expect(html).toContain("193.178.185.15");
    expect(html).toContain("2001:7f8:19:1::22b1:15");
    expect(html).toContain("aria-sort");
    expect(html).toContain("Sort by Exchange");
    expect(html).toContain("Sort by IPv6");
    expect(html).toContain("14 connections · 7 exchanges");
    expect(html).toContain("2 of 14 listed");
    // Both presentations exist in the DOM; CSS picks one per breakpoint.
    expect(html).toContain("md:hidden");
    expect(html).toContain("md:block");
  });

  it("does not repeat an IPv4 address that PeeringDB also put in the IPv6 field", () => {
    const profile = createProfile();
    profile.peeringdb!.ixlan[1] = { ...profile.peeringdb!.ixlan[1], ipaddr6: "80.81.192.1" };
    const html = renderToStaticMarkup(createElement(IxPresenceSection, { result: profile, t, locale: "en" }));

    // Once in the desktop cell, once in the phone list — never as IPv6.
    expect(html.match(/80\.81\.192\.1</g)?.length).toBe(2);
  });

  it("flags connections PeeringDB marks as not operational", () => {
    const profile = createProfile();
    profile.peeringdb!.ixlan[1] = { ...profile.peeringdb!.ixlan[1], operational: false };
    const html = renderToStaticMarkup(createElement(IxPresenceSection, { result: profile, t, locale: "en" }));

    expect(html).toContain("Not operational");
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
    expect(html).toContain('href="https://www.peeringdb.com/fac/60"');
  });

  it("links a local ASN only when it differs from the looked-up network", () => {
    const facilities = [
      ...createProfile().peeringdb!.facilities,
      { id: 1, facilityId: 61, name: "Sibling PoP", city: "Berlin", country: "DE", localAsn: 3320, status: "ok" },
    ];
    const html = renderToStaticMarkup(
      createElement(FacilitySection, { facilities, total: 2, asnNumber: 8881, t, locale: "en" }),
    );

    expect(html).toContain('href="/asn/AS3320"');
    expect(html).not.toContain('href="/asn/AS8881"');
    expect(html).toContain('title="Same as this ASN"');
  });

  it("summarises country spread only when the facility list is complete", () => {
    const facility = (id: number, city: string, country: string) => ({
      id,
      facilityId: id,
      name: `Site ${id}`,
      city,
      country,
      localAsn: 8881,
      status: "ok",
    });
    const facilities = [facility(1, "Frankfurt", "DE"), facility(2, "Berlin", "DE"), facility(3, "Paris", "FR")];
    const complete = renderToStaticMarkup(createElement(FacilitySection, { facilities, total: 3, t, locale: "en" }));
    const truncated = renderToStaticMarkup(createElement(FacilitySection, { facilities, total: 13, t, locale: "en" }));

    expect(complete).toContain("3 facilities in 2 countries");
    expect(truncated).toContain("13 facilities");
    expect(truncated).not.toContain("countries");
  });
});

describe("SourceDiagnosticsSection", () => {
  it("reports availability, duration, cache and warnings per source", () => {
    const html = renderToStaticMarkup(
      createElement(SourceDiagnosticsSection, { result: createProfile(), t, locale: "en" }),
    );

    expect(html).toContain("RIPEstat");
    expect(html).toContain("386 ms");
    expect(html).toContain("not configured");
    expect(html).toContain("Warnings");
    expect(html).toContain("Source");
    // Provider warnings live in the diagnostics panel, translated.
    expect(html).toContain("RIPEstat IPv4 prefixes truncated to 100 of 566 records.");
  });
});

describe("lookup states", () => {
  it("frames a not-found ASN with its provider availability", () => {
    const html = renderToStaticMarkup(
      createElement(NotFoundState, { result: createProfile({ ...sparse, found: false, asn: "AS64512" }), t }),
    );

    expect(html).toContain("AS64512");
    expect(html).toContain("No ASN profile found");
    expect(html).toContain("RIPEstat");
    // A dead end offers known-good ASNs, keeping the source-info flag.
    expect(html).toContain('href="/asn/AS13335"');
    expect(
      renderToStaticMarkup(
        createElement(NotFoundState, { result: createProfile({ ...sparse, found: false }), t, sourceInfo: true }),
      ),
    ).toContain('href="/asn/AS13335?source-info=1"');
  });

  it("keeps the source-info flag on example links", () => {
    expect(renderToStaticMarkup(createElement(ExampleAsns, { t }))).toContain('href="/asn/AS13335"');
    expect(renderToStaticMarkup(createElement(ExampleAsns, { t, sourceInfo: true }))).toContain(
      'href="/asn/AS13335?source-info=1"',
    );
  });

  it("names each example network next to its ASN", () => {
    const html = renderToStaticMarkup(createElement(ExampleAsns, { t }));

    expect(html).toContain("Cloudflare");
    expect(html).toContain("Google");
    expect(html).toContain("Deutsche Telekom");
  });

  it("previews the three detail areas with the copy their tabs use", () => {
    const html = renderToStaticMarkup(createElement(AsnCapabilities, { t }));

    for (const copy of [
      t.asnTabRouting,
      t.asnRoutingDescription,
      t.asnTabPrefixes,
      t.asnPrefixesDescription,
      t.asnPeeringDb,
      t.asnPeeringDbDescription,
    ]) {
      expect(html).toContain(copy);
    }
  });

  it("only advertises tabs a PeeringDB-backed lookup actually shows", () => {
    const labels = buildDetailTabs(createProfile(), t, false).map((tab) => tab.label);

    for (const title of [t.asnTabRouting, t.asnTabPrefixes, t.asnPeeringDb]) {
      expect(labels).toContain(title);
      expect(renderToStaticMarkup(createElement(AsnCapabilities, { t }))).toContain(title);
    }
  });

  it("offers a retry only when one is provided", () => {
    const withRetry = renderToStaticMarkup(
      createElement(LookupError, { message: "ASN data providers are currently unavailable.", onRetry: () => {}, t }),
    );
    const without = renderToStaticMarkup(createElement(LookupError, { message: "Invalid", t }));

    expect(withRetry).toContain("Try again");
    expect(without).not.toContain("Try again");
  });
});

describe("ASN presentation helpers", () => {
  it("formats port speeds without rounding away common sizes", () => {
    expect(formatSpeed(2500, t, "en")).toBe("2.5 Gbps");
    expect(formatSpeed(1_200_000, t, "en")).toBe("1.2 Tbps");
    expect(formatSpeed(100, t, "en")).toBe("100 Mbps");
    expect(formatSpeed(null, t, "en")).toBe("—");
    expect(formatSpeed(2500, getToolTranslation("de"), "de")).toBe("2,5 Gbit/s");
  });

  it("splits registry holder strings and PeeringDB LAN names", () => {
    expect(splitHolderName("CLOUDFLARENET - Cloudflare, Inc.")).toEqual({
      handle: "CLOUDFLARENET",
      organisation: "Cloudflare, Inc.",
    });
    expect(splitHolderName("VERSATEL 1&1 Versatel GmbH")).toEqual({
      handle: "",
      organisation: "VERSATEL 1&1 Versatel GmbH",
    });
    expect(splitIxName("DE-CIX Frankfurt: DE-CIX Frankfurt Peering LAN")).toEqual({
      exchange: "DE-CIX Frankfurt",
      lan: "DE-CIX Frankfurt Peering LAN",
    });
    expect(splitIxName("TorIX")).toEqual({ exchange: "TorIX", lan: "" });
  });

  it("reports routing totals as unknown, not zero, when no routing source answered", () => {
    const offline = createProfile({
      ...sparse,
      sources: { ipinfo: "not_configured", peeringdb: "available", ripestat: "error" },
    });

    expect(knownTotal(offline, 0)).toBeNull();
    expect(knownTotal(sparse, 0)).toBe(0);
    expect(knownTotal(offline, 5)).toBe(5);
  });

  it("keeps the link arrow glued without splitting surrogate pairs", () => {
    const html = renderToStaticMarkup(
      createElement(ExternalLink, { href: "https://example.com", text: "Hall 𝟙𝟚𝟛" }),
    );

    expect(html).toContain("Hall <span");
    expect(html).toContain("𝟙𝟚𝟛");
    expect(html).not.toContain("\uFFFD");
  });

  it("derives readable registry, country, size and link values", () => {
    expect(registryName("ripe")).toBe("RIPE NCC");
    expect(registryName("arin")).toBe("ARIN");
    expect(countryName("de", "en")).toBe("Germany");
    expect(countryName("de", "de")).toBe("Deutschland");
    expect(countryName("not-a-code", "en")).toBe("not-a-code");
    expect(ipv4EquivalentBits(1_048_576)).toBe(12);
    expect(ipv4EquivalentBits(256)).toBe(24);
    expect(ipv4EquivalentBits(null)).toBeNull();
    expect(peeringDbUrl("net", 684)).toBe("https://www.peeringdb.com/net/684");
    expect(peeringDbUrl("ix", null)).toBeNull();
    expect(formatCount(t.asnFacilityCount, 1, "en")).toBe("1 facility");
    expect(formatCount(t.asnFacilityCount, 1200, "en")).toBe("1,200 facilities");
  });

  it("classifies and shortens outbound URLs", () => {
    expect(isUrl("https://example.com")).toBe(true);
    expect(isUrl("javascript:alert(1)")).toBe(false);
    expect(displayUrl("https://www.example.com/")).toBe("example.com");
    expect(displayUrl("http://lg.example.net/path/")).toBe("lg.example.net/path");
  });

  it("translates the closed policy answers and normalises the separator before free text", () => {
    const en = getI18nDictionaries("en").ui;
    const de = getI18nDictionaries("de").ui;

    expect(formatPolicyValue("Required - EU", en)).toBe("Required – EU");
    expect(formatPolicyValue("Required", en)).toBe(en.asnPolicyRequired);
    expect(formatPolicyValue("Not Required", de)).toBe(de.asnPolicyNotRequired);
    expect(formatPolicyValue("not_required", en)).toBe(en.asnPolicyNotRequired);
    // Open-ended answers and missing values pass through untouched.
    expect(formatPolicyValue("Selective", en)).toBe("Selective");
    expect(formatPolicyValue(null, en)).toBeNull();
    expect(formatPolicyValue(undefined, en)).toBeUndefined();
  });

  it("sends the exchange figure to its own tab, or to the single peering tab", () => {
    expect(exchangesTab(createProfile())).toBe("exchanges");
    expect(exchangesTab(sparse)).toBe("peering");
  });
});

describe("LoadingSkeleton", () => {
  it("mirrors the summary card, the flat tab bar and the routing columns", () => {
    const html = renderToStaticMarkup(createElement(LoadingSkeleton, { label: "Looking up" }));

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Looking up");
    // One card for the summary; the tab bar and panel sit flat on the page.
    expect(html.match(/data-slot="card"/g)?.length).toBe(1);
    expect(html).toContain("md:grid-cols-4");
    expect(html).toContain("md:grid-cols-3");
  });
});

describe("AsnDetailTabs", () => {
  const tabs = [
    { value: "routing", label: "Routing", count: 2512 },
    { value: "prefixes", label: "Prefixes", count: 0 },
    { value: "peering", label: "Peering" },
    { value: "sources", label: "Sources", count: 3, countLabel: "warnings", tone: "warning" as const },
  ];
  type TabsProps = ComponentProps<typeof AsnDetailTabs>;
  const render = (value: string) => {
    const props: Omit<TabsProps, "children"> = {
      tabs,
      value,
      onValueChange: () => {},
      label: "ASN details",
      locale: "en",
    };
    // Children go in as the trailing argument, as React expects.
    return renderToStaticMarkup(createElement(AsnDetailTabs, props as TabsProps, "panel body"));
  };

  it("renders a labelled tablist with one tab per section and formatted counts", () => {
    const html = render("prefixes");

    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="ASN details"');
    expect(html.match(/role="tab"/g)?.length).toBe(4);
    expect(html).toContain("2,512");
    // A real zero is shown; a tab without a count shows none.
    expect(html).toContain(">0<");
    expect(html).toContain("panel body");
  });

  it("marks exactly the selected tab and tones the warning count", () => {
    const html = render("peering");

    expect(html.match(/aria-selected="true"/g)?.length).toBe(1);
    expect(html).toMatch(/aria-selected="true"[^>]*data-state="active"[^>]*>[^<]*<span[^>]*>Peering/);
    expect(html).toContain("text-warning");
    // The bare number is ambiguous, so it carries a screen-reader noun.
    expect(html).toContain("warnings</span>");
  });
});

describe("buildDetailTabs", () => {
  it("splits PeeringDB into exchanges, facilities and profile when it has a record", () => {
    const tabs = buildDetailTabs(createProfile(), t, false);

    expect(tabs.map((tab) => tab.value)).toEqual(["routing", "prefixes", "exchanges", "facilities", "profile"]);
    expect(tabs.find((tab) => tab.value === "exchanges")?.count).toBe(7);
    expect(tabs.find((tab) => tab.value === "facilities")?.count).toBe(13);
  });

  it("collapses to one explanatory peering tab without a PeeringDB record", () => {
    expect(buildDetailTabs(sparse, t, false).map((tab) => tab.value)).toEqual(["routing", "prefixes", "peering"]);
  });

  it("adds the sources tab, with the warning count, only behind the source-info flag", () => {
    const warned = createProfile({ warnings: ["a", "b"] });

    expect(buildDetailTabs(warned, t, true).at(-1)).toMatchObject({ value: "sources", count: 2, tone: "warning" });
    expect(buildDetailTabs(warned, t, false).some((tab) => tab.value === "sources")).toBe(false);
    expect(buildDetailTabs(createProfile(), t, true).at(-1)?.count).toBeNull();
  });

  it("reports unknown routing totals as no count rather than zero", () => {
    const offline = createProfile({
      ...sparse,
      sources: { ipinfo: "not_configured", peeringdb: "available", ripestat: "error" },
    });

    expect(buildDetailTabs(offline, t, false)[0].count).toBeNull();
    expect(buildDetailTabs(offline, t, false)[1].count).toBeNull();
  });
});

describe("AsnResultView", () => {
  it("opens on routing with the overview and only the selected panel mounted", () => {
    const html = renderToStaticMarkup(
      createElement(AsnResultView, { result: createProfile(), t, locale: "en", showSourceInfo: false }),
    );

    expect(html).toContain('aria-label="AS8881 — ASN Information"');
    expect(html.match(/role="tab"/g)?.length).toBe(5);
    expect(html).toContain("Power and peer counts observed via RIPEstat RIS.");
    // The prefix, exchange and profile panels are not mounted until selected.
    expect(html).not.toContain("2 of 566 listed");
    expect(html).not.toContain("BCIX Peering LAN");
  });

  it("adds a sources tab behind the flag without changing the default panel", () => {
    const html = renderToStaticMarkup(
      createElement(AsnResultView, { result: createProfile(), t, locale: "en", showSourceInfo: true }),
    );

    expect(html.match(/role="tab"/g)?.length).toBe(6);
    expect(html).toContain("Power and peer counts observed via RIPEstat RIS.");
  });

  it("wires every tab to a tabpanel that names it back", () => {
    const html = renderToStaticMarkup(
      createElement(AsnResultView, { result: createProfile(), t, locale: "en", showSourceInfo: true }),
    );
    const attributes = (tag: string) => Object.fromEntries([...tag.matchAll(/([a-z-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const tabs = [...html.matchAll(/<[a-z]+\b[^>]*\brole="tab"[^>]*>/g)].map((m) => attributes(m[0]));
    const panels = [...html.matchAll(/<[a-z]+\b[^>]*\brole="tabpanel"[^>]*>/g)].map((m) => attributes(m[0]));

    expect(tabs).toHaveLength(6);
    expect(panels).toHaveLength(6);
    for (const tab of tabs) {
      const panel = panels.find((candidate) => candidate.id === tab["aria-controls"]);
      expect(panel, `panel for ${tab["aria-controls"]}`).toBeDefined();
      expect(panel?.["aria-labelledby"]).toBe(tab.id);
    }
  });
});

describe("PeeringUnavailable", () => {
  it("reports a provider failure from the structured warning, not raw provider text", () => {
    const failed = createProfile({
      ...sparse,
      sources: { ipinfo: "not_configured", peeringdb: "error", ripestat: "available" },
      warnings: ["PeeringDB returned HTTP 429."],
      warningDetails: [
        { code: "provider_http", provider: "PeeringDB", status: 429 },
        { code: "truncated", label: "RIPEstat IPv4 prefixes", limit: 100, total: 566 },
      ],
    });
    const html = renderToStaticMarkup(createElement(PeeringUnavailable, { result: failed, t, locale: "en" }));

    expect(html).toContain("PeeringDB returned HTTP 429.");
    // A failure never claims the record does not exist.
    expect(html).not.toContain(t.asnWarningNoPeeringDbProfile);
    // Only PeeringDB's own warnings belong on this tab.
    expect(html).not.toContain("truncated");
    expect(html).toContain("text-warning");
  });

  it("falls back to a generic outage message when a failed provider gave no warning", () => {
    const failed = createProfile({
      ...sparse,
      sources: { ipinfo: "not_configured", peeringdb: "error", ripestat: "available" },
      warningDetails: [],
    });
    const html = renderToStaticMarkup(createElement(PeeringUnavailable, { result: failed, t, locale: "en" }));

    expect(html).toContain("PeeringDB data is currently unavailable.");
    expect(html).not.toContain(t.asnWarningNoPeeringDbProfile);
  });

  it("matches the provider whether the warning names it by label or by source key", () => {
    const failedWith = (provider: string) =>
      createProfile({
        ...sparse,
        sources: { ipinfo: "not_configured", peeringdb: "error", ripestat: "available" },
        warningDetails: [{ code: "provider_timeout", provider }],
      });

    for (const provider of ["PeeringDB", "peeringdb"]) {
      const html = renderToStaticMarkup(
        createElement(PeeringUnavailable, { result: failedWith(provider), t, locale: "en" }),
      );
      expect(html).toContain(`${provider} request timed out.`);
    }
  });

  it("treats the API's 'answered, no record' shape as a neutral statement, not an outage", () => {
    // A PeeringDB 404 or empty payload is reported as `unavailable` with a
    // provider-less warning (app/api/asn/[asn]/route.ts).
    const noRecord = createProfile({
      ...sparse,
      sources: { ipinfo: "not_configured", peeringdb: "unavailable", ripestat: "available" },
      warnings: ["No public PeeringDB network profile was found for this ASN."],
      warningDetails: [{ code: "peeringdb_no_profile" }],
    });
    const html = renderToStaticMarkup(createElement(PeeringUnavailable, { result: noRecord, t, locale: "en" }));

    expect(html).toContain(t.asnWarningNoPeeringDbProfile);
    expect(html).not.toContain("currently unavailable");
    expect(html).not.toContain("<ul");
    expect(html).not.toContain("text-warning");
  });
});
