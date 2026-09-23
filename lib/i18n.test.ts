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
  normalizeLocale,
  parseLocaleCookie,
  resolveLocale,
  translations,
  type Locale,
} from "@/lib/i18n";
import { getPrivacyContent } from "@/lib/privacy";
import { getTermsContent } from "@/lib/terms";
import { getToolTranslation, toolTranslations } from "@/lib/tool-i18n";
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
    expect(recordKeys(value), path).toEqual(recordKeys(referenceObject));
    for (const [key, child] of Object.entries(value)) {
      expectStringLeaves(
        child,
        `${path}.${key}`,
        (referenceObject as Record<string, unknown>)[key],
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
