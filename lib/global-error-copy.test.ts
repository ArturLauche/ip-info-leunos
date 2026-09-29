import { describe, expect, it } from "vitest";
import { globalErrorCopy } from "@/lib/global-error-copy";
import { SUPPORTED_LOCALES } from "@/lib/locale-config";
import { getToolTranslation } from "@/lib/tool-i18n";

describe("globalErrorCopy", () => {
  it("stays identical to the tool catalog for every locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const t = getToolTranslation(locale);
      expect(globalErrorCopy[locale], locale).toEqual({
        title: t.errorTitle,
        description: t.errorDescription,
        retry: t.errorRetry,
      });
    }
  });
});
