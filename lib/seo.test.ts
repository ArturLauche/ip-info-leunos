import { describe, expect, it } from "vitest";
import {
  getLocaleSchemaLanguage,
  getLocaleOpenGraphLanguage,
  SUPPORTED_LOCALES,
} from "./i18n";
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

  it("uses the selected locale for Open Graph metadata", () => {
    const metadata = createPageMetadata({
      title: "Lookup",
      description: "Description",
      path: "/check",
      locale: "pt-PT",
    });
    expect(metadata.openGraph).toMatchObject({
      locale: getLocaleOpenGraphLanguage("pt-PT"),
      title: "Lookup",
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

/**
 * Expected locale → language tag mappings, written out on purpose: deriving the
 * expectation from the same helper the production code uses would make the
 * assertion a tautology that can never catch a wrong or stale mapping.
 */
const EXPECTED_SCHEMA_LANGUAGES: Record<string, string> = {
  de: "de-DE",
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  nl: "nl",
  pl: "pl",
  "pt-BR": "pt-BR",
  "pt-PT": "pt-PT",
  ja: "ja",
  ko: "ko",
  ru: "ru",
  uk: "uk",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ar: "ar",
  hi: "hi",
  id: "id",
  cs: "cs",
  sv: "sv",
  da: "da",
  nb: "nb",
  fi: "fi",
  el: "el",
  ro: "ro",
  tr: "tr",
};

/**
 * Open Graph locales are `language_TERRITORY`, and the territory has to belong
 * to the language: `ar_AR` would advertise Arabic in Argentina, so the Arabic
 * catalog names a real Arabic market.
 */
const EXPECTED_OPEN_GRAPH_LOCALES: Record<string, string> = {
  de: "de_DE",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
  nl: "nl_NL",
  pl: "pl_PL",
  "pt-BR": "pt_BR",
  "pt-PT": "pt_PT",
  ja: "ja_JP",
  ko: "ko_KR",
  ru: "ru_RU",
  uk: "uk_UA",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ar: "ar_SA",
  hi: "hi_IN",
  id: "id_ID",
  cs: "cs_CZ",
  sv: "sv_SE",
  da: "da_DK",
  nb: "nb_NO",
  fi: "fi_FI",
  el: "el_GR",
  ro: "ro_RO",
  tr: "tr_TR",
};

describe("documentTitle", () => {
  it("does not repeat the site name when the page title already is it", () => {
    // The English home title equals the site name, so a plain suffix would
    // render "IP Info | IP Info".
    expect(documentTitle(siteConfig.name)).toBe(siteConfig.name);
    expect(documentTitle("DNS Lookup")).toBe(`DNS Lookup | ${siteConfig.name}`);
  });

  it("keeps the site brand consistent across the generated assets", () => {
    // Icons, the social image and llms.txt are generated from the brand name.
    expect(siteConfig.name).toBe("IP Info");
    expect(siteConfig.shortName).toBe(siteConfig.name);
    expect(siteConfig.name).not.toBe("IP Auskunft");
  });
});

describe("schemaInLanguage", () => {
  it("publishes the expected language tag for every UI locale", () => {
    expect(schemaInLanguage).toEqual(
      SUPPORTED_LOCALES.map((locale) => EXPECTED_SCHEMA_LANGUAGES[locale]),
    );
    expect(schemaInLanguage).not.toContain("de");
  });

  it("publishes a territory that belongs to the language for every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const openGraph = getLocaleOpenGraphLanguage(locale);
      expect(openGraph, locale).toBe(EXPECTED_OPEN_GRAPH_LOCALES[locale]);
      const [language, territory] = openGraph.split("_");
      expect(territory, locale).toMatch(/^[A-Z]{2}$/);
      expect(language.toLowerCase(), locale).toBe(
        getLocaleSchemaLanguage(locale).split("-")[0].toLowerCase(),
      );
    }
  });

  it("never pairs Arabic with a non-Arab territory", () => {
    expect(getLocaleOpenGraphLanguage("ar")).toBe("ar_SA");
  });
});
