import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { LanguageSelector, localeMatchesQuery } from "./language-selector";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

const renderSelector = (props: {
  locale: Locale;
  compact?: boolean;
}): string => renderToStaticMarkup(createElement(LanguageSelector, props));

const find = (query: string): Locale[] =>
  SUPPORTED_LOCALES.filter((locale) => localeMatchesQuery(locale, query));

/**
 * The picker replaces a 26-row scroll menu, so the filter has to find a
 * language through every name a person can actually type — native, English,
 * diacritic-free and by tag.
 */
describe("localeMatchesQuery", () => {
  it("offers every supported locale for an empty query", () => {
    expect(find("")).toEqual([...SUPPORTED_LOCALES]);
    expect(find("   ")).toEqual([...SUPPORTED_LOCALES]);
  });

  it("finds a language by its native name", () => {
    expect(find("suomi")).toEqual(["fi"]);
    expect(find("polski")).toEqual(["pl"]);
    expect(find("日本語")).toEqual(["ja"]);
  });

  it("finds a language by its English name", () => {
    expect(find("japanese")).toEqual(["ja"]);
    expect(find("norwegian")).toEqual(["nb"]);
  });

  it("finds a language by its tag, including the region", () => {
    expect(find("ja")).toEqual(["ja"]);
    expect(find("pt-BR")).toEqual(["pt-BR"]);
    expect(find("br")).toEqual(["pt-BR"]);
  });

  it("finds a language without typing the diacritics", () => {
    expect(find("espanol")).toEqual(["es"]);
    expect(find("francais")).toEqual(["fr"]);
    expect(find("portugues")).toEqual(["pt-BR", "pt-PT"]);
    expect(find("ελληνικα")).toEqual(["el"]);
  });

  it("requires every typed term to match", () => {
    expect(find("portugues brasil")).toEqual(["pt-BR"]);
    expect(find("portugues alemanha")).toEqual([]);
  });

  it("returns nothing for an unknown query", () => {
    expect(find("qwertz")).toEqual([]);
  });
});

/**
 * The trigger keeps announcing the active language while the picker is closed,
 * because the whole page re-renders once the server render catches up with the
 * new locale cookie.
 */
describe("LanguageSelector trigger markup", () => {
  it("names the active language in the viewer's own language", () => {
    const html = renderSelector({ locale: "el" });
    expect(html).toContain('aria-label="Επιλέξτε γλώσσα: Ελληνικά"');
    expect(html).toContain('title="Επιλέξτε γλώσσα: Ελληνικά"');
  });

  it("marks the visible language name with its own lang attribute", () => {
    expect(renderSelector({ locale: "ja" })).toContain(
      '<span class="max-w-28 truncate" lang="ja">日本語</span>',
    );
  });

  it("mirrors the trigger label into a polite status region", () => {
    expect(renderSelector({ locale: "pt-BR" })).toContain(
      '<span role="status" class="sr-only">Selecionar idioma: Português (Brasil)</span>',
    );
  });

  it("drops the visible language name in the compact variant", () => {
    expect(renderSelector({ locale: "ja", compact: true })).not.toContain(
      "max-w-28",
    );
  });
});
