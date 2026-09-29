import { isValidElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/request-locale", () => ({ getRequestLocale: async () => "en" }));

import AsnPage from "./page";

async function initialAsnFor(params: { asn?: string | string[]; q?: string | string[] }) {
  const page = await AsnPage({ searchParams: Promise.resolve(params) });
  const checker = (page.props as { children: unknown }).children;
  expect(isValidElement(checker)).toBe(true);
  return ((checker as ReactElement).props as { initialAsn: string }).initialAsn;
}

describe("/asn search parameters", () => {
  it("uses the first value when a key repeats instead of crashing the page", async () => {
    await expect(initialAsnFor({ asn: ["AS13335", "AS15169"] })).resolves.toBe("AS13335");
    await expect(initialAsnFor({ q: ["AS8881", "AS3320"] })).resolves.toBe("AS8881");
  });

  it("prefers asn over q and falls back when asn is empty", async () => {
    await expect(initialAsnFor({ asn: "AS1", q: "AS2" })).resolves.toBe("AS1");
    await expect(initialAsnFor({ asn: "", q: "AS2" })).resolves.toBe("AS2");
    await expect(initialAsnFor({})).resolves.toBe("");
  });
});
