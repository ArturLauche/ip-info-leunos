import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { withI18n } from "@/components/i18n-test-utils";
import { LocaleAnnouncer } from "./locale-announcer";

describe("LocaleAnnouncer", () => {
  it("renders a persistent, initially silent polite region", () => {
    const html = renderToStaticMarkup(withI18n(createElement(LocaleAnnouncer)));
    expect(html).toMatch(/<p role="status" aria-live="polite" aria-atomic="true" class="sr-only" lang="[a-zA-Z-]+"><\/p>/);
  });
});
