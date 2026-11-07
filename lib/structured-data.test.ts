import { describe, expect, it } from "vitest";
import { canonicalUrl, siteConfig } from "./site-config";
import {
  buildBreadcrumbList,
  buildPageBreadcrumbs,
  buildWebPageGraph,
} from "./structured-data";

describe("buildPageBreadcrumbs", () => {
  it("keeps the home page as the root without a trail", () => {
    expect(
      buildPageBreadcrumbs({
        path: "/",
        title: "IP Info",
        homeTitle: "IP Info",
      }),
    ).toEqual([]);
  });

  it("adds the home crumb for a normal tool page", () => {
    expect(
      buildPageBreadcrumbs({
        path: "/dns",
        title: "DNS Lookup",
        homeTitle: "IP Info",
      }),
    ).toEqual([
      { name: "IP Info", path: "/" },
      { name: "DNS Lookup", path: "/dns" },
    ]);
  });

  it("keeps the tool parent when a deep link differs from the nav path", () => {
    expect(
      buildPageBreadcrumbs({
        path: "/asn/AS13335",
        title: "AS13335",
        homeTitle: "IP Info",
        parent: { name: "ASN Lookup", path: "/asn" },
      }),
    ).toEqual([
      { name: "IP Info", path: "/" },
      { name: "ASN Lookup", path: "/asn" },
      { name: "AS13335", path: "/asn/AS13335" },
    ]);
  });
});

describe("buildBreadcrumbList", () => {
  it("uses canonical absolute URLs and positional items", () => {
    const breadcrumb = buildBreadcrumbList([
      { name: "Home", path: "/" },
      { name: "ASN Lookup", path: "/asn" },
      { name: "AS13335", path: "/asn/AS13335" },
    ]);

    expect(breadcrumb).not.toBeNull();
    expect(breadcrumb?.["@id"]).toBe(
      `${canonicalUrl("/asn/AS13335")}#breadcrumb`,
    );
    expect(breadcrumb?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ASN Lookup",
        item: canonicalUrl("/asn"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "AS13335",
        item: canonicalUrl("/asn/AS13335"),
      },
    ]);
  });

  it("returns null when there is no trail", () => {
    expect(buildBreadcrumbList([])).toBeNull();
  });
});

describe("buildWebPageGraph", () => {
  it("links the page to the site, app and breadcrumb nodes", () => {
    const appId = `${canonicalUrl("/asn/AS13335")}#web-application`;
    const graph = buildWebPageGraph({
      path: "/asn/AS13335",
      name: "AS13335 – ASN Information",
      description: "ASN profile",
      locale: "en",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "ASN Lookup", path: "/asn" },
        { name: "AS13335", path: "/asn/AS13335" },
      ],
      appId,
    });

    const [webPage, breadcrumb] = graph["@graph"];

    expect(webPage).toMatchObject({
      "@type": "WebPage",
      "@id": `${canonicalUrl("/asn/AS13335")}#webpage`,
      url: canonicalUrl("/asn/AS13335"),
      name: `AS13335 – ASN Information | ${siteConfig.name}`,
      description: "ASN profile",
      inLanguage: "en",
      about: { "@id": appId },
      mainEntity: { "@id": appId },
      breadcrumb: { "@id": `${canonicalUrl("/asn/AS13335")}#breadcrumb` },
      isPartOf: { "@id": `${siteConfig.url}/#website` },
    });
    expect(breadcrumb).toMatchObject({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl("/asn/AS13335")}#breadcrumb`,
    });
  });

  it("omits breadcrumbs and app references on the home page", () => {
    const graph = buildWebPageGraph({
      path: "/",
      name: "My IP",
      description: "Your public IP",
      locale: "en",
    });

    expect(graph["@graph"]).toHaveLength(1);
    const [webPage] = graph["@graph"];

    expect(webPage).not.toHaveProperty("breadcrumb");
    expect(webPage).not.toHaveProperty("about");
    expect(webPage).not.toHaveProperty("mainEntity");
    expect(webPage).toMatchObject({
      name: `My IP | ${siteConfig.name}`,
      url: siteConfig.url,
    });
  });

  it("uses an absolute social image URL", () => {
    const graph = buildWebPageGraph({
      path: "/dns",
      name: "DNS Lookup",
      description: "Query DNS records",
      locale: "en",
    });

    const [webPage] = graph["@graph"];
    expect(webPage.primaryImageOfPage).toMatchObject({
      "@type": "ImageObject",
      url: `${siteConfig.url}/og-image.png`,
      width: 1200,
      height: 630,
    });
  });
});
