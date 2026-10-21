import {
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  FINGERPRINT_DIGEST_HEX_LENGTH,
  hashFingerprintMaterial,
  splitFingerprintGroups,
  type FingerprintMaterial,
} from "@/lib/browser-info";
import { getTranslation } from "@/lib/i18n";
import type { Locale } from "@/lib/locale-config";
import { CopyButton } from "./copy-button";
import {
  BrowserFingerprint,
  BrowserFingerprintView,
} from "./browser-fingerprint";
import { withI18n } from "./i18n-test-utils";

const HASH = "ddb2b258340ac3677b8737627d28c0cc6a556a10512fe90d642bfa3ac3650287";
const t = getTranslation("en");

const FIXTURE_MATERIAL: FingerprintMaterial = {
  v: 1,
  browserName: "Chrome",
  browserMajor: "141",
  osName: "macOS",
  deviceType: "desktop",
  timeZone: "Europe/Berlin",
  language: "en-US",
  languages: ["en-US"],
  platform: "MacIntel",
  hardwareConcurrency: 8,
  deviceMemory: 8,
  screenWidth: 1440,
  screenHeight: 900,
  colorDepth: 24,
  maxTouchPoints: 0,
};

type AnyElement = ReactElement<Record<string, unknown>>;

function render(
  props: { value: string | null; ready: boolean },
  locale: Locale = "en",
) {
  return renderToStaticMarkup(
    withI18n(createElement(BrowserFingerprint, props), locale),
  );
}

/** Every React element reachable from a tree, in document order. */
function elementsIn(node: ReactNode, out: AnyElement[] = []): AnyElement[] {
  if (Array.isArray(node)) {
    for (const child of node) elementsIn(child, out);
    return out;
  }
  if (!isValidElement(node)) return out;
  out.push(node as AnyElement);
  elementsIn((node.props as { children?: ReactNode }).children, out);
  return out;
}

describe("BrowserFingerprint copy action", () => {
  it("copies the complete, unformatted hash", () => {
    const tree = BrowserFingerprintView({ value: HASH, ready: true, t });
    const copy = elementsIn(tree).find(
      (element) => element.type === CopyButton,
    );

    expect(copy?.props).toMatchObject({
      text: HASH,
      label: t.copyFingerprintLabel,
      copiedLabel: t.copiedToClipboard,
      failedLabel: t.copyFailed,
    });
    expect(copy?.props.showLabel).not.toBe(true);
  });

  it("shows eight groups that rebuild the exact hash when joined", () => {
    const tree = BrowserFingerprintView({ value: HASH, ready: true, t });
    const groups = elementsIn(tree).filter(
      (element) => element.props["data-fingerprint-group"] !== undefined,
    );

    expect(groups).toHaveLength(8);
    expect(groups.map((element) => element.props.children).join("")).toBe(HASH);
  });

  it("offers no copy action while the hash is calculating or unavailable", () => {
    expect(render({ value: null, ready: false })).not.toContain(
      t.copyFingerprintLabel,
    );
    expect(render({ value: null, ready: true })).not.toContain(
      t.copyFingerprintLabel,
    );
  });
});

describe("BrowserFingerprint states", () => {
  it("keeps the same grid while loading so the card does not resize when the hash lands", () => {
    const loading = render({ value: null, ready: false });
    const ready = render({ value: HASH, ready: true });

    expect(loading).toContain('aria-busy="true"');
    expect(loading).not.toContain(HASH);
    // One skeleton for the copy action plus one per group of a real hash.
    const skeletons = loading.split('data-slot="skeleton"').length - 1;
    expect(skeletons).toBe(splitFingerprintGroups(HASH).length + 1);
    expect(ready.split("data-fingerprint-group").length - 1).toBe(8);
    expect(ready).not.toContain("aria-busy");
  });

  it("sizes the placeholder from a real digest of the algorithm in use", async () => {
    const digest = await hashFingerprintMaterial(FIXTURE_MATERIAL);

    expect(digest).toHaveLength(FINGERPRINT_DIGEST_HEX_LENGTH);
    expect(splitFingerprintGroups(digest ?? "")).toHaveLength(8);
  });

  it("explains an unavailable hash instead of rendering a grid", () => {
    const html = render({ value: null, ready: true });

    expect(html).toContain(t.fingerprintUnavailable);
    expect(html).not.toContain("aria-busy");
    expect(html).not.toContain("data-fingerprint-group");
  });

  it("localizes the fingerprint label and the icon button's accessible name", () => {
    const de = getTranslation("de");
    const html = render({ value: HASH, ready: true }, "de");

    expect(html).toContain(`<span>${de.browserFingerprint}</span>`);
    expect(html).toContain(`aria-label="${de.copyFingerprintLabel}"`);
  });
});

describe("BrowserFingerprint accessibility", () => {
  it("announces the full hash once and hides the visual groups from assistive tech", () => {
    const html = render({ value: HASH, ready: true });

    expect(html.split(HASH).length - 1).toBe(1);
    expect(html).toContain(`<span class="sr-only">${HASH}</span>`);
    expect(html).toMatch(
      /aria-hidden="true"[^>]*class="[^"]*tool-section-reveal/,
    );
  });

  it("names the algorithm next to the value", () => {
    expect(render({ value: HASH, ready: true })).toContain("SHA-256");
  });
});
