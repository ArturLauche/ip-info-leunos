import type { ComponentProps } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import {
  LanguageEmptyState,
  LanguageSelector,
  LocaleOptionRow,
  localeMatchesQuery,
} from "./language-selector";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {} }),
}));

const renderSelector = (props: { locale: Locale }): string =>
  renderToStaticMarkup(createElement(LanguageSelector, props));

const renderRow = (props: LocaleRowProps): string =>
  renderToStaticMarkup(createElement(LocaleOptionRow, props));

type LocaleRowProps = Parameters<typeof LocaleOptionRow>[0];

const noop = () => {};

const find = (query: string): Locale[] =>
  SUPPORTED_LOCALES.filter((locale) => localeMatchesQuery(locale, query));

const countOf = (markup: string, needle: string): number =>
  markup.split(needle).length - 1;

/** Extracts one panel row so a single language can be inspected. */
const row = (markup: string, locale: Locale): string => {
  const start = markup.indexOf(`id="language-option-${locale}"`);
  expect(start, locale).toBeGreaterThan(-1);
  return markup.slice(start, markup.indexOf("</div>", start));
};

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
describe("LanguageSelector trigger", () => {
  it("names the active language in the viewer's own language", () => {
    const html = renderSelector({ locale: "el" });
    expect(html).toContain('aria-label="Επιλέξτε γλώσσα: Ελληνικά"');
    expect(html).toContain('title="Επιλέξτε γλώσσα: Ελληνικά"');
  });

  it("tells assistive technology that it opens a dialog", () => {
    const html = renderSelector({ locale: "de" });
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    // The unmodified module keeps the Radix portal closed until the picker is
    // opened, so no panel markup exists before the click.
    expect(html).not.toContain('role="combobox"');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain('aria-controls="language-panel"');
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
});

/**
 * Radix mounts its portal only after a layout effect, so a static render never
 * reaches the panel. The mocks are applied per test through `vi.doMock` against
 * a freshly imported copy of the component and removed again afterwards, so the
 * closed-state tests above keep exercising the unmodified module.
 *
 * `matches` stubs the matcher the way a filter would leave the list: absent for
 * the full list, `null` for none, a predicate to narrow it.
 */
async function renderOpenPanel(
  locale: Locale,
  options: { matches?: ((haystack: string) => boolean) | null } = {},
): Promise<string> {
  vi.resetModules();
  vi.doMock("@/components/ui/dialog", async (importOriginal) => {
    const actual =
      await importOriginal<typeof import("@/components/ui/dialog")>();
    const react = await import("react");
    return {
      ...actual,
      Dialog: (props: ComponentProps<typeof actual.Dialog>) =>
        react.createElement(actual.Dialog, { ...props, open: true }),
      DialogPortal: (props: ComponentProps<typeof actual.DialogPortal>) =>
        react.createElement(react.Fragment, null, props.children),
      DialogOverlay: () => null,
    };
  });
  if (options.matches !== undefined) {
    vi.doMock("@/lib/command", async (importOriginal) => {
      const actual =
        await importOriginal<typeof import("@/lib/command")>();
      const matcher = options.matches ?? (() => false);
      return { ...actual, matchesQuery: (haystack: string) => matcher(haystack) };
    });
  }
  const picker = await import("./language-selector");
  return renderToStaticMarkup(
    createElement(picker.LanguageSelector, { locale }),
  );
}

afterEach(() => {
  vi.doUnmock("@/components/ui/dialog");
  vi.doUnmock("@/lib/command");
  vi.resetModules();
});

/** Pulls the filter field out of the rendered panel. */
function filterField(markup: string): string {
  const role = markup.indexOf('role="combobox"');
  expect(role, "combobox").toBeGreaterThan(-1);
  const start = markup.lastIndexOf("<input", role);
  expect(start, "filter input").toBeGreaterThan(-1);
  const end = markup.indexOf(">", role);
  expect(end, "filter input end").toBeGreaterThan(start);
  return markup.slice(start, end + 1);
}

describe("LanguageSelector panel", () => {
  it("wires the filter into a combobox that names the highlighted language", async () => {
    const field = filterField(await renderOpenPanel("ja"));
    expect(field).toContain('aria-haspopup="listbox"');
    expect(field).toContain('aria-expanded="true"');
    expect(field).toContain('aria-controls="language-list"');
    // The panel opens on the active language, so the aria-activedescendant
    // points there and the row is scrolled into view.
    expect(field).toContain('aria-activedescendant="language-option-ja"');
  });

  it("collapses the combobox and swaps in the empty state when nothing matches", async () => {
    const html = await renderOpenPanel("de", { matches: null });
    const field = filterField(html);
    // Nothing points at a listbox that is no longer rendered: no IDREF, no
    // popup to declare, and no expanded state to claim.
    expect(field).not.toContain("aria-controls");
    expect(field).not.toContain("aria-haspopup");
    expect(field).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="listbox"');
    expect(html).toContain("Keine Sprache passt zur Suche.");
  });

  it("falls back to the first match when the active language is filtered out", async () => {
    const html = await renderOpenPanel("ja", {
      matches: (haystack) => haystack.split(" ").includes("German"),
    });
    expect(countOf(html, 'role="option"')).toBe(1);
    expect(filterField(html)).toContain(
      'aria-activedescendant="language-option-de"',
    );
  });

  it("labels the filter with the localized placeholder", async () => {
    expect(await renderOpenPanel("de")).toContain(
      'placeholder="Sprachen suchen"',
    );
    expect(await renderOpenPanel("ja")).toContain('placeholder="言語を検索"');
  });

  it("offers every language in a listbox labelled in the active language", async () => {
    const html = await renderOpenPanel("fr");
    expect(html).toContain('role="listbox"');
    expect(html).toContain('aria-label="Sélectionner la langue"');
    expect(countOf(html, 'role="option"')).toBe(SUPPORTED_LOCALES.length);
  });

  it("marks exactly the language in effect inside the list", async () => {
    const html = await renderOpenPanel("pt-BR");
    expect(countOf(html, "aria-current")).toBe(1);
    expect(row(html, "pt-BR")).toContain('aria-current="true"');
    expect(row(html, "pt-PT")).not.toContain("aria-current");
  });

  it("hints at the keyboard model with the picker's own labels", async () => {
    const html = await renderOpenPanel("en");
    expect(html).toContain("Select language");
    expect(html).toContain("Close");
  });
});

/**
 * Panel rows are rendered headlessly because the Radix portal stays closed
 * under a static render: this is what pins the selection semantics the
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

describe("LanguageEmptyState", () => {
  it("replaces the list with a localized status message", () => {
    const html = renderToStaticMarkup(
      createElement(LanguageEmptyState, { locale: "de" }),
    );
    expect(html).toBe(
      '<p role="status" class="px-3 py-8 text-center text-sm text-muted-foreground">Keine Sprache passt zur Suche.</p>',
    );
  });
});
