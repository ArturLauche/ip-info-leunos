import { describe, expect, it } from "vitest";
import { PRIVACY_LAST_UPDATED, TERMS_LAST_UPDATED } from "./content-dates";
import { SUPPORTED_LOCALES } from "./i18n";
import { getPrivacyContent } from "./privacy";
import { getTermsContent } from "./terms";

describe("content dates", () => {
  it("keeps every legal locale on the sitemap revision date", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(getPrivacyContent(locale).lastUpdated, locale).toBe(
        PRIVACY_LAST_UPDATED,
      );
      expect(getTermsContent(locale).lastUpdated, locale).toBe(
        TERMS_LAST_UPDATED,
      );
    }
  });
});
