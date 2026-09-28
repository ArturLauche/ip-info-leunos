import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import {
  LanguageSelector,
  LocaleOptionRow,
  localeMatchesQuery,
} from "./language-selector";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

const renderSelector = (props: {
  locale: Locale;
  compact?: boolean;
}): string => renderToStaticMarkup(createElement(LanguageSelector, props));

const renderRow = (props: LocaleRowProps): string =>
  renderToStaticMarkup(createElement(LocaleOptionRow, props));

type LocaleRowProps = Parameters<typeof LocaleOptionRow>[0];

const noop = () => {};

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
 * The trigger keeps announcing the language while the picker is closed, because
 * the whole page re-renders once the server render catches up with the new
 * locale cookie.
 */
describe("LanguageSelector trigger markup", () => {
  it("names the active language in the viewer's own language", () => {
    const html = renderSelector({ locale: "el" });
    expect(html).toContain('aria-label="Επιλέξτε γλώσσα: Ελληνικά"');
    expect(html).toContain('title="Επιλέξτε γλώσσα: Ελληνικά"');
  });

  it("tells assistive technology that it opens a dialog", () => {
    const html = renderSelector({ locale: "de" });
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
  });

  it("marks the visible language name with its own lang attribute", () => {
    expect(renderSelector({ locale: "ja" })).toContain(
      '<span class="max-w-28 truncate" lang="ja">日本語</span>',
    );
  });

  it("announces the switched language on its own", () => {
    expect(renderSelector({ locale: "ja" })).toContain(
      '<span role="status" class="sr-only">日本語</span>',
    );
  });

  it("drops the visible language name in the compact variant", () => {
    expect(renderSelector({ locale: "ja", compact: true })).not.toContain(
      "max-w-28",
    );
  });
});

/**
 * Panel rows are rendered headlessly because the Radix portal stays closed
 * during a static render: this is what pins the selection semantics the
 * dropdown had and the combobox has to keep.
 */
describe("LocaleOptionRow", () => {
  it("marks the language in effect for assistive technology", () => {
    expect(
      renderRow({
        candidate: "ja",
        isActive: false,
        isCurrent: true,
        onSelect: noop,
        onHighlight: noop,
      }),
    ).toContain('aria-current="true"');
  });

  it("marks the keyboard row as the selected option", () => {
    const html = renderRow({
      candidate: "ja",
      isActive: true,
      isCurrent: false,
      onSelect: noop,
      onHighlight: noop,
    });
    expect(html).toContain('aria-selected="true"');
    expect(html).not.toContain("aria-current");
  });

  it("keeps right-to-left candidates in their own direction", () => {
    const html = renderRow({
      candidate: "ar",
      isActive: false,
      isCurrent: false,
      onSelect: noop,
      onHighlight: noop,
    });
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
  });

  it("shows the English name only where the native one hides it", () => {
    expect(
      renderRow({
        candidate: "ja",
        isActive: false,
        isCurrent: false,
        onSelect: noop,
        onHighlight: noop,
      }),
    ).toContain("Japanese");
    expect(
      renderRow({
        candidate: "en",
        isActive: false,
        isCurrent: false,
        onSelect: noop,
        onHighlight: noop,
      }),
    ).not.toContain('text-xs text-muted-foreground');
  });
});
