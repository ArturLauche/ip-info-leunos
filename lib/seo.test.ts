import { describe, expect, it } from "vitest";
import { SUPPORTED_LOCALES } from "./i18n";
import {
  canonicalUrl,
  createPageMetadata,
  documentTitle,
  schemaInLanguage,
  siteConfig,
} from "./seo";

describe("canonicalUrl", () => {
  it("keeps the site root without a trailing slash", () => {
    expect(canonicalUrl("/")).toBe(siteConfig.url);
    expect(canonicalUrl("")).toBe(siteConfig.url);
  });

  it("joins nested paths without a trailing slash", () => {
    expect(canonicalUrl("/check")).toBe(`${siteConfig.url}/check`);
    expect(canonicalUrl("/asn/AS8881")).toBe(`${siteConfig.url}/asn/AS8881`);
  });
});

describe("createPageMetadata", () => {
  it("uses an absolute document title so the home route includes the brand", () => {
    const metadata = createPageMetadata({
      title: "Meine öffentliche IP-Adresse anzeigen",
      description: "Zeige deine öffentliche IP.",
      path: "/",
    });

    expect(metadata.title).toEqual({
      absolute: documentTitle("Meine öffentliche IP-Adresse anzeigen"),
    });
    expect(metadata.alternates).toMatchObject({
      canonical: siteConfig.url,
    });
  });

  it("keeps Open Graph titles brand-free because site_name is set separately", () => {
    const metadata = createPageMetadata({
      title: "DNS Lookup für A, AAAA, MX, TXT und mehr",
      description: "Prüfe öffentliche DNS-Daten.",
      path: "/dns",
    });

    expect(metadata.openGraph).toMatchObject({
      title: "DNS Lookup für A, AAAA, MX, TXT und mehr",
      url: `${siteConfig.url}/dns`,
      siteName: siteConfig.name,
    });
  });
});

describe("schemaInLanguage", () => {
  it("lists every UI locale for the WebSite node", () => {
    expect([...schemaInLanguage]).toEqual([
      "de-DE",
      "en",
      "es",
      "fr",
      "pt-BR",
      "ja",
      "ru",
      "zh-CN",
    ]);
    expect(schemaInLanguage).toHaveLength(SUPPORTED_LOCALES.length);
  });
});
