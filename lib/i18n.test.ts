import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  SUPPORTED_LOCALES,
  getLocaleDirection,
  getLocaleOpenGraphLanguage,
  getLocaleSchemaLanguage,
  getNativeLocaleName,
  getTranslation,
  isSupportedLocale,
  normalizeLocale,
  parseLocaleCookie,
  resolveLocale,
  translations,
  type Locale,
} from "@/lib/i18n";
import { formatCount } from "@/components/asn/helpers";
import { getPrivacyContent } from "@/lib/privacy";
import { getTermsContent } from "@/lib/terms";
import {
  COUNT_FORM_KEYS,
  getToolTranslation,
  toolTranslations,
} from "@/lib/tool-i18n";
import { getUiCopy, uiCopy } from "@/lib/ui-copy";

function recordKeys(value: object): string[] {
  return Object.keys(value).sort();
}

function collectStrings(value: unknown, output: string[] = []): string[] {
  if (typeof value === "string") output.push(value);
  else if (value && typeof value === "object") {
    for (const child of Object.values(value)) collectStrings(child, output);
  }
  return output;
}

function placeholders(value: unknown): string[] {
  const result = new Set<string>();
  for (const text of collectStrings(value)) {
    for (const match of text.matchAll(/\{[^}]+\}/g)) result.add(match[0]);
  }
  return [...result].sort();
}

/**
 * Every leaf must be a non-empty string, and (for catalogs) keys must match the
 * English reference. Plural records are the one documented exception: they
 * carry exactly the CLDR categories a language uses (lib/i18n has its own test
 * for that), so they must contain at least the reference keys and may add more.
 */
function expectStringLeaves(
  value: unknown,
  path: string,
  reference: unknown = value,
): void {
  if (typeof value === "string") {
    expect(value.trim(), path).not.toBe("");
    expect(typeof reference, path).toBe("string");
    return;
  }
  if (value && typeof value === "object") {
    const referenceObject =
      reference && typeof reference === "object" ? reference : {};
    const key = path.split(".").pop() ?? "";
    if (COUNT_FORM_KEYS.includes(key as (typeof COUNT_FORM_KEYS)[number])) {
      for (const required of recordKeys(referenceObject)) {
        expect(required in value, `${path}.${required}`).toBe(true);
      }
    } else {
      expect(recordKeys(value), path).toEqual(recordKeys(referenceObject));
    }
    for (const [childKey, child] of Object.entries(value)) {
      expectStringLeaves(
        child,
        `${path}.${childKey}`,
        (referenceObject as Record<string, unknown>)[childKey],
      );
    }
  }
}

describe("locale registry and negotiation", () => {
  it("registers every supported locale with native metadata", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(26);
    expect(new Set(SUPPORTED_LOCALES).size).toBe(SUPPORTED_LOCALES.length);

    for (const locale of SUPPORTED_LOCALES) {
      const definition = LOCALE_DEFINITIONS[locale];
      expect(definition.nativeName, locale).toBeTruthy();
      expect(definition.englishName, locale).toBeTruthy();
      expect(["ltr", "rtl"], locale).toContain(definition.direction);
      expect(getLocaleSchemaLanguage(locale), locale).toBeTruthy();
      expect(getLocaleOpenGraphLanguage(locale), locale).toMatch(
        /^[a-z]{2}_[A-Z]{2}$/,
      );
    }

    expect(getNativeLocaleName("pt-BR")).toBe("Português (Brasil)");
    expect(getNativeLocaleName("pt-PT")).toBe("Português (Portugal)");
    expect(getNativeLocaleName("zh-CN")).toBe("简体中文");
    expect(getNativeLocaleName("zh-TW")).toBe("繁體中文");
  });

  it("resolves the requested regional and script variants", () => {
    const expectations: Array<[string, Locale]> = [
      ["it-IT", "it"],
      ["nl-NL", "nl"],
      ["pl-PL", "pl"],
      ["ko-KR", "ko"],
      ["tr-TR", "tr"],
      ["uk-UA", "uk"],
      ["ar-SA", "ar"],
      ["ar-EG", "ar"],
      ["hi-IN", "hi"],
      ["id-ID", "id"],
      ["cs-CZ", "cs"],
      ["sv-SE", "sv"],
      ["da-DK", "da"],
      ["nb-NO", "nb"],
      ["fi-FI", "fi"],
      ["el-GR", "el"],
      ["ro-RO", "ro"],
      ["pt-PT", "pt-PT"],
      ["zh-Hans", "zh-CN"],
      ["zh-Hant", "zh-TW"],
      ["zh-Hant-HK", "zh-TW"],
      ["zh-HK", "zh-TW"],
      ["zh-TW", "zh-TW"],
    ];

    for (const [tag, expected] of expectations) {
      expect(resolveLocale(tag), tag).toBe(expected);
      expect(normalizeLocale(tag), tag).toBe(expected);
    }
  });

  it("accepts the Norwegian macrolanguage tags browsers send", () => {
    // Browsers send "no" or "no-NO" rather than "nb"; both must reach Bokmål
    // instead of silently falling back to English.
    for (const tag of ["no", "no-NO", "no-no", "NO", "no-nb"]) {
      expect(resolveLocale(tag), tag).toBe("nb");
      expect(normalizeLocale(tag), tag).toBe("nb");
    }
  });

  it("never serves a locale the client excluded with q=0", () => {
    // A wildcard or the final fallback must not resolve to an excluded locale.
    expect(resolveLocale("en;q=0, *;q=0.5")).not.toBe("en");
    expect(resolveLocale("en;q=0, *;q=0.5")).toBe("de");
    expect(resolveLocale("de;q=0, en;q=0")).toBe("es");
    expect(resolveLocale("en;q=0, de;q=0.9")).toBe("de");
    expect(resolveLocale("en;q=0, en-US;q=0, *;q=0.1")).not.toBe("en");
    // An explicit preference still wins: the user picked it in this browser.
    expect(resolveLocale("en;q=0, *;q=0.5", "en")).toBe("en");
  });

  it("keeps language-only Portuguese on the Brazilian variant", () => {
    expect(resolveLocale("pt")).toBe("pt-BR");
    expect(resolveLocale("pt-PT,pt;q=0.8")).toBe("pt-PT");
  });

  it("honors quality values, ignores q=0, and falls back safely", () => {
    expect(resolveLocale("fr;q=0.1, de;q=0.9")).toBe("de");
    expect(resolveLocale("fr;q=0, de;q=0.5")).toBe("de");
    expect(resolveLocale("xx-YY, *;q=0.1")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("not-a-locale")).toBe(DEFAULT_LOCALE);
    expect(getTranslation("not-a-locale" as Locale)).toBe(getTranslation("en"));
    expect(getToolTranslation("not-a-locale" as Locale)).toBe(
      toolTranslations.en,
    );
    expect(getPrivacyContent("not-a-locale" as Locale).title).toBe(
      getPrivacyContent("en").title,
    );
    expect(getTermsContent("not-a-locale" as Locale).title).toBe(
      getTermsContent("en").title,
    );
  });

  it("gives an explicit saved preference priority over browser negotiation", () => {
    expect(resolveLocale("de-DE", "it-IT")).toBe("it");
    expect(resolveLocale("ar-SA", "zh-Hant")).toBe("zh-TW");
  });

  it("round-trips the functional language cookie", () => {
    expect(parseLocaleCookie("ip-info-locale=pt-PT; Path=/")).toBe("pt-PT");
    expect(parseLocaleCookie("ip-info-locale=zh-Hant; Path=/")).toBe("zh-TW");
    expect(parseLocaleCookie("ip-info-locale=unknown")).toBeNull();
  });

  it("keeps regional variants genuinely distinct", () => {
    expect(getTranslation("pt-BR").homeTitle).not.toBe(
      getTranslation("pt-PT").homeTitle,
    );
    expect(getToolTranslation("pt-BR").whoisSubtitle).not.toBe(
      getToolTranslation("pt-PT").whoisSubtitle,
    );
    expect(getTranslation("zh-CN").homeTitle).not.toBe(
      getTranslation("zh-TW").homeTitle,
    );
    expect(getToolTranslation("zh-CN").dnsSubtitle).not.toBe(
      getToolTranslation("zh-TW").dnsSubtitle,
    );
  });

  it("never resolves prototype-inherited keys as locales", () => {
    // Object.prototype keys must not pass locale validation: they would flow
    // into LOCALE_DEFINITIONS lookups as fake Locales and crash renders.
    const hostile = ["constructor", "toString", "hasOwnProperty", "valueOf", "__proto__"];
    for (const tag of hostile) {
      expect(normalizeLocale(tag), tag).toBeNull();
      expect(isSupportedLocale(tag), tag).toBe(false);
      expect(resolveLocale(null, tag), tag).toBe(DEFAULT_LOCALE);
      expect(resolveLocale("de-DE,de;q=0.9", tag), tag).toBe("de");
    }
  });

  it("activates RTL only for Arabic", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
    for (const locale of SUPPORTED_LOCALES.filter(
      (candidate) => candidate !== "ar",
    )) {
      expect(getLocaleDirection(locale), locale).toBe("ltr");
    }
  });
});

describe("complete translation catalogs", () => {
  it("has a distinct main translation for every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const translated = getTranslation(locale);
      expect(translated, locale).toBeTruthy();
      if (locale !== "en")
        expect(translated, locale).not.toBe(getTranslation("en"));
      expect(translated.homeTitle, locale).toBeTruthy();
      expect(translated.homeSubtitle, locale).toBeTruthy();
      expect(translated.checkEmptyTitle, locale).toBeTruthy();
      expect(translated.checkEmptyDescription, locale).toBeTruthy();
      expectStringLeaves(translated, `translation.${locale}`);
      expect(
        placeholders(translated),
        `translation.placeholders.${locale}`,
      ).toEqual(placeholders(getTranslation("en")));
    }
    expect(Object.keys(translations).sort()).toEqual(
      [...SUPPORTED_LOCALES].sort(),
    );
  });

  it("has a complete, non-alias tool translation for every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const translated = getToolTranslation(locale);
      expect(translated, locale).toBeTruthy();
      if (locale !== "en")
        expect(translated, locale).not.toBe(toolTranslations.en);
      expectStringLeaves(translated, `tool.${locale}`, toolTranslations.en);
      expect(placeholders(translated), `tool.placeholders.${locale}`).toEqual(
        placeholders(toolTranslations.en),
      );
      for (const key of [
        "errorInvalidTarget",
        "asnTitle",
        "dnsTitle",
        "pingTitle",
        "reputationTitle",
      ] as const) {
        expect(translated[key], `${locale}.${key}`).toBeTruthy();
      }
    }
    expect(Object.keys(toolTranslations).sort()).toEqual(
      [...SUPPORTED_LOCALES].sort(),
    );
  });

  it("supplies every CLDR plural category a locale's grammar uses", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const translated = getToolTranslation(locale);
      const categories = new Intl.PluralRules(locale).resolvedOptions()
        .pluralCategories;
      for (const key of COUNT_FORM_KEYS) {
        const forms = translated[key];
        // `other` is the mandatory fallback; every other category may be
        // omitted only when its form is identical to it.
        expect(forms.other.trim(), `${locale}.${key}.other`).not.toBe("");
        for (const category of categories) {
          const form = forms[category as keyof typeof forms] ?? forms.other;
          expect(form.trim(), `${locale}.${key}.${category}`).not.toBe("");
        }
      }
    }
  });

  it("uses the distinct plural forms Arabic and the Slavic languages require", () => {
    const arabic = getToolTranslation("ar");
    // Arabic distinguishes zero, one, two, few, many and other.
    expect(arabic.asnFacilityCount.zero).toBeDefined();
    expect(arabic.asnFacilityCount.two).toBeDefined();
    expect(formatCount(arabic.asnFacilityCount, 0, "ar")).toBe("لا توجد منشآت");
    expect(formatCount(arabic.asnFacilityCount, 1, "ar")).toBe("منشأة واحدة");
    expect(formatCount(arabic.asnFacilityCount, 2, "ar")).toBe("منشأتان");
    expect(formatCount(arabic.asnFacilityCount, 3, "ar")).toBe("3 منشآت");
    expect(formatCount(arabic.asnFacilityCount, 11, "ar")).toBe("11 منشأة");
    expect(formatCount(arabic.asnFacilityCount, 100, "ar")).toBe("100 منشأة");

    const polish = getToolTranslation("pl");
    // Polish: one for 1, few for 2-4, many for 0 and 5-21.
    expect(formatCount(polish.asnFacilityCount, 1, "pl")).toBe("1 obiekt");
    expect(formatCount(polish.asnFacilityCount, 3, "pl")).toBe("3 obiektu");
    expect(formatCount(polish.asnFacilityCount, 5, "pl")).toBe("5 obiektów");

    // Romanian: `other` covers 20+, which needs the "de" construction.
    expect(formatCount(getToolTranslation("ro").asnFacilityCount, 20, "ro")).toBe(
      "20 de locații",
    );
    expect(formatCount(getToolTranslation("ro").asnFacilityCount, 2, "ro")).toBe(
      "2 locații",
    );
  });

  it("keeps the five reputation records complete in every tool catalog", () => {
    const recordKeysToCheck = [
      "reputationCategories",
      "reputationSeverities",
      "reputationSourceStates",
      "reputationReasons",
      "reputationSourceDescriptions",
    ] as const;
    for (const locale of SUPPORTED_LOCALES) {
      const translated = getToolTranslation(locale);
      const english = toolTranslations.en;
      for (const record of recordKeysToCheck) {
        expect(
          Object.keys(translated[record]).sort(),
          `${locale}.${record}`,
        ).toEqual(Object.keys(english[record]).sort());
        for (const value of Object.values(translated[record])) {
          expect(value, `${locale}.${record}`).toBeTruthy();
        }
      }
    }
  });

  it("has complete supplemental UI copy for every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(getUiCopy(locale), locale).toBe(uiCopy[locale]);
      expectStringLeaves(uiCopy[locale], `ui.${locale}`);
    }
  });
});

describe("legal content and safe fallback", () => {
  it("discloses the language preference in both storage sections of every policy", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const content = getPrivacyContent(locale);
      const localStorage = (content.sections[5].paragraphs ?? []).join(" ");
      const cookies = (content.sections[6].paragraphs ?? []).join(" ");
      // The policy must not contradict itself: local storage holds the theme
      // *and* the language, the cookie section names the language cookie, and
      // no section still points at the old "Local storage (theme)" heading.
      expect(localStorage, locale).toContain(getUiCopy(locale).localeStorageNotice);
      expect(cookies, locale).toContain(getUiCopy(locale).localeCookieNotice);
      for (const section of content.sections) {
        for (const paragraph of section.paragraphs ?? []) {
          // A leftover "(theme)" parenthetical would be a cross-reference
          // to the heading before it was renamed to cover both preferences.
          expect(paragraph, `${locale}: ${section.heading}`).not.toMatch(
            /\((theme|Theme|tema|Tema|thème|tém|temă|motyw|тема|теми|θέμα|teema|teeman|teema|テーマ|主题|主題|테마|थीम|السمة|thema|теми|trav)\)/,
          );
        }
      }
      expect(content.lastUpdated, locale).toBe("2026-09-25");
    }
  });

  it("keeps Portuguese and Chinese legal variants distinct", () => {
    expect(JSON.stringify(getPrivacyContent("pt-BR"))).not.toBe(
      JSON.stringify(getPrivacyContent("pt-PT")),
    );
    expect(JSON.stringify(getTermsContent("pt-BR"))).not.toBe(
      JSON.stringify(getTermsContent("pt-PT")),
    );
    expect(JSON.stringify(getPrivacyContent("zh-CN"))).not.toBe(
      JSON.stringify(getPrivacyContent("zh-TW")),
    );
  });

  it("provides complete legal content without English fallback aliases", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const privacy = getPrivacyContent(locale);
      const terms = getTermsContent(locale);
      expect(privacy.sections, `${locale}.privacy`).toHaveLength(13);
      expect(terms.sections, `${locale}.terms`).toHaveLength(12);
      expect(privacy.title, locale).toBeTruthy();
      expect(terms.title, locale).toBeTruthy();
      expect(
        privacy.sections.some((section) =>
          section.paragraphs?.join(" ").includes("{email}"),
        ),
        locale,
      ).toBe(true);
      expect(
        terms.sections.some((section) =>
          section.paragraphs?.join(" ").includes("{email}"),
        ),
        locale,
      ).toBe(true);
      if (locale !== "en" && locale !== "de") {
        expect(privacy, locale).not.toBe(getPrivacyContent("en"));
        expect(terms, locale).not.toBe(getTermsContent("en"));
        expect(privacy.title, locale).not.toBe(getPrivacyContent("en").title);
        expect(terms.title, locale).not.toBe(getTermsContent("en").title);
      }
    }
  });
});
