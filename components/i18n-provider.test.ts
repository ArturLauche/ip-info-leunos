import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getI18nDictionaries } from "@/lib/i18n-dictionaries";
import { SUPPORTED_LOCALES } from "@/lib/locale-config";
import { getToolTranslation } from "@/lib/tool-i18n";
import { withI18n } from "./i18n-test-utils";
import { useI18n } from "./i18n-provider";

function Probe() {
  const { locale, tool, core, ui } = useI18n();
  return createElement(
    "p",
    null,
    [locale, tool.navMenu, core.homeTitle, ui.emailAt].join("|"),
  );
}

describe("I18nProvider", () => {
  it("serves exactly the negotiated locale's catalogs", () => {
    const html = renderToStaticMarkup(withI18n(createElement(Probe), "de"));
    const dictionaries = getI18nDictionaries("de");

    expect(html).toBe(
      `<p>de|${dictionaries.tool.navMenu}|${dictionaries.core.homeTitle}|${dictionaries.ui.emailAt}</p>`,
    );
    expect(dictionaries.tool).toBe(getToolTranslation("de"));
  });

  it("refuses to render outside a provider instead of guessing a language", () => {
    expect(() => renderToStaticMarkup(createElement(Probe))).toThrow(
      "useI18n must be used within an I18nProvider",
    );
  });

  it("hands the client plain data that survives the RSC boundary", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const dictionaries = getI18nDictionaries(locale);
      expect(JSON.parse(JSON.stringify(dictionaries)), locale).toStrictEqual(
        dictionaries,
      );
    }
  });
});
