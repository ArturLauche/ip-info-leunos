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

  it("emits an absolute og:image URL so scrapers without metadataBase resolution still render cards", () => {
    const metadata = createPageMetadata({
      title: "DNS Lookup für A, AAAA, MX, TXT und mehr",
      description: "Prüfe öffentliche DNS-Daten.",
      path: "/dns",
    });

    expect(metadata.openGraph).toMatchObject({
      locale: "de_DE",
      alternateLocale: expect.arrayContaining(["en_US"]),
    });
    const images = (metadata.openGraph as { images?: Array<{ url?: string }> })?.images;
    expect(images?.[0]?.url).toBe(`${siteConfig.url}/og-image.png`);
  });
});

describe("schemaInLanguage", () => {
  it("is derived from every UI locale, with de published as de-DE", () => {
    expect(schemaInLanguage).toEqual(
      SUPPORTED_LOCALES.map((locale) => (locale === "de" ? "de-DE" : locale)),
    );
    expect(schemaInLanguage).toContain("de-DE");
    expect(schemaInLanguage).not.toContain("de");
  });
});
