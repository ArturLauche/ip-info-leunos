import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFingerprintMaterial,
  collectBrowserDeviceHints,
  detectVisitorBrowserInfo,
  formatBrowserVersion,
  formatOsLabel,
  hashFingerprintMaterial,
  readBrowserTimeZone,
  readUserAgentClientHints,
  resolveVisitorBrowserInfo,
  serializeFingerprintMaterial,
  type DetectedBrowserInfo,
  type UserAgentClientHints,
} from "./browser-info";
import type { BrowserDeviceHints } from "./connection-type";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function hints(overrides: Partial<BrowserDeviceHints> = {}): BrowserDeviceHints {
  return {
    userAgent: "",
    platform: "",
    language: "en-US",
    languages: ["en-US", "en"],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    maxTouchPoints: 0,
    webdriver: false,
    timeZone: "Europe/Berlin",
    timezoneOffsetMinutes: 60,
    screen: { width: 1920, height: 1080, colorDepth: 24 },
    ...overrides,
  };
}

function detect(userAgent: string, extra?: Partial<BrowserDeviceHints>, uaHints?: UserAgentClientHints | null) {
  return detectVisitorBrowserInfo(
    hints({
      userAgent,
      ...extra,
    }),
    uaHints,
  );
}

describe("browser parsing", () => {
  it("detects Chrome on Windows from the User-Agent without treating it as Safari", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      { platform: "Win32" },
    );

    expect(info.browserName).toBe("Chrome");
    expect(info.browserMajorVersion).toBe("128");
    expect(info.browserFullVersion).toBeNull();
    expect(info.osName).toBe("Windows");
    expect(info.osVersion).toBeNull();
    expect(info.deviceType).toBe("desktop");
  });

  it("detects Edge instead of Chrome when Edg is present", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
      { platform: "Win32" },
    );

    expect(info.browserName).toBe("Edge");
    expect(info.browserMajorVersion).toBe("128");
    expect(info.browserFullVersion).toBeNull();
  });

  it("detects Firefox on Windows", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
      { platform: "Win32" },
    );

    expect(info.browserName).toBe("Firefox");
    expect(info.browserMajorVersion).toBe("131");
    expect(info.browserFullVersion).toBe("131.0");
    expect(info.osName).toBe("Windows");
    expect(info.deviceType).toBe("desktop");
  });

  it("detects Safari on macOS and ignores the frozen 10_15_7 UA version", () => {
    const info = detect(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
      { platform: "MacIntel" },
    );

    expect(info.browserName).toBe("Safari");
    expect(info.browserMajorVersion).toBe("17");
    expect(info.browserFullVersion).toBe("17.6");
    expect(info.osName).toBe("macOS");
    expect(info.osVersion).toBeNull();
    expect(info.deviceType).toBe("desktop");
  });

  it("detects Chrome on macOS instead of Safari", () => {
    const info = detect(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.137 Safari/537.36",
      { platform: "MacIntel" },
    );

    expect(info.browserName).toBe("Chrome");
    expect(info.browserFullVersion).toBe("128.0.6613.137");
    expect(info.osName).toBe("macOS");
  });

  it("detects Firefox on Linux", () => {
    const info = detect(
      "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
      { platform: "Linux x86_64" },
    );

    expect(info.browserName).toBe("Firefox");
    expect(info.osName).toBe("Linux");
    expect(info.deviceType).toBe("desktop");
  });

  it("detects Chrome on Android phones", () => {
    const info = detect(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.99 Mobile Safari/537.36",
      { platform: "Linux aarch64", maxTouchPoints: 5 },
    );

    expect(info.browserName).toBe("Chrome");
    expect(info.osName).toBe("Android");
    expect(info.osVersion).toBe("14");
    expect(info.deviceType).toBe("mobile");
  });

  it("detects Samsung Internet instead of Chrome", () => {
    const info = detect(
      "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36",
    );

    expect(info.browserName).toBe("Samsung Internet");
    expect(info.browserFullVersion).toBe("26.0");
    expect(info.deviceType).toBe("mobile");
  });

  it("detects Safari on iPhone as iOS", () => {
    const info = detect(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
      { platform: "iPhone" },
    );

    expect(info.browserName).toBe("Safari");
    expect(info.osName).toBe("iOS");
    expect(info.osVersion).toBe("17");
    expect(info.deviceType).toBe("mobile");
  });

  it("detects Chrome and Firefox branded browsers on iOS", () => {
    const chrome = detect(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0.6613.98 Mobile/15E148 Safari/604.1",
    );
    const firefox = detect(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/131.0 Mobile/15E148 Safari/605.1.15",
    );

    expect(chrome.browserName).toBe("Chrome");
    expect(chrome.browserFullVersion).toBe("128.0.6613.98");
    expect(firefox.browserName).toBe("Firefox");
    expect(firefox.osName).toBe("iOS");
  });

  it("detects Safari on iPad as a tablet running iPadOS", () => {
    const info = detect(
      "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1",
      { platform: "iPad" },
    );

    expect(info.browserName).toBe("Safari");
    expect(info.osName).toBe("iPadOS");
    expect(info.deviceType).toBe("tablet");
  });

  it("treats iPadOS desktop-mode Macintosh UAs with multi-touch as tablets", () => {
    const info = detect(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
      { platform: "MacIntel", maxTouchPoints: 5 },
    );

    expect(info.deviceType).toBe("tablet");
    expect(info.osName).toBe("iPadOS");
  });

  it("detects Opera from the OPR token", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.5230.38",
    );

    expect(info.browserName).toBe("Opera");
    expect(info.browserFullVersion).toBe("114.0.5230.38");
  });

  it("detects Chrome OS from the CrOS token", () => {
    const info = detect(
      "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.137 Safari/537.36",
    );

    expect(info.osName).toBe("Chrome OS");
    expect(info.deviceType).toBe("desktop");
  });

  it("prefers User-Agent Client Hints over a generic Chrome UA, including GREASE brands", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      { platform: "Win32" },
      {
        brands: [
          { brand: "Not.A/Brand", version: "99" },
          { brand: "Chromium", version: "128" },
          { brand: "Microsoft Edge", version: "128" },
        ],
        fullVersionList: [
          { brand: "Not.A/Brand", version: "99.0.0.0" },
          { brand: "Chromium", version: "128.0.6613.137" },
          { brand: "Microsoft Edge", version: "128.0.2739.79" },
        ],
        mobile: false,
        platform: "Windows",
        platformVersion: "15.0.0",
      },
    );

    expect(info.browserName).toBe("Edge");
    expect(info.browserMajorVersion).toBe("128");
    expect(info.browserFullVersion).toBe("128.0.2739.79");
    expect(info.osName).toBe("Windows");
    expect(info.osVersion).toBe("11");
  });

  it("maps Chromium Client Hints Windows 10 and ignores a zero platform version", () => {
    const windows10 = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      { platform: "Win32" },
      {
        brands: [{ brand: "Google Chrome", version: "128" }],
        mobile: false,
        platform: "Windows",
        platformVersion: "10.0.0",
        uaFullVersion: "128.0.6613.137",
      },
    );
    const unknownWindows = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      { platform: "Win32" },
      {
        brands: [{ brand: "Google Chrome", version: "128" }],
        mobile: false,
        platform: "Windows",
        platformVersion: "0.0.0",
      },
    );

    expect(windows10.osVersion).toBe("10");
    expect(windows10.browserFullVersion).toBe("128.0.6613.137");
    expect(unknownWindows.osName).toBe("Windows");
    expect(unknownWindows.osVersion).toBeNull();
  });

  it("maps pre-2004 Windows 10 Client Hint platform versions to Windows 10", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      { platform: "Win32" },
      {
        brands: [{ brand: "Google Chrome", version: "128" }],
        mobile: false,
        platform: "Windows",
        platformVersion: "4.0.0",
      },
    );

    expect(info.osName).toBe("Windows");
    expect(info.osVersion).toBe("10");
  });

  it("prefers explicit User-Agent brands over generic Chrome/Chromium Client Hints", () => {
    const genericHints: UserAgentClientHints = {
      brands: [
        { brand: "Not.A/Brand", version: "99" },
        { brand: "Chromium", version: "128" },
        { brand: "Google Chrome", version: "128" },
      ],
      mobile: false,
      platform: "Windows",
    };

    const vivaldi = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Vivaldi/7.0.3495.15",
      { platform: "Win32" },
      genericHints,
    );
    const opera = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.5230.38",
      { platform: "Win32" },
      genericHints,
    );

    expect(vivaldi.browserName).toBe("Vivaldi");
    expect(vivaldi.browserFullVersion).toBe("7.0.3495.15");
    expect(opera.browserName).toBe("Opera");
    expect(opera.browserFullVersion).toBe("114.0.5230.38");
  });

  it("uses Client Hints to classify Android tablets vs phones", () => {
    const phone = detect(
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.99 Safari/537.36",
      { platform: "Linux armv8l" },
      { brands: [{ brand: "Google Chrome", version: "128" }], mobile: true, platform: "Android" },
    );
    const tablet = detect(
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.99 Safari/537.36",
      { platform: "Linux armv8l" },
      { brands: [{ brand: "Google Chrome", version: "128" }], mobile: false, platform: "Android" },
    );

    expect(phone.deviceType).toBe("mobile");
    expect(tablet.deviceType).toBe("tablet");
    expect(tablet.osName).toBe("Android");
  });

  it("does not report Safari for legacy Android WebKit UAs", () => {
    const info = detect(
      "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; Nexus 4 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    );

    expect(info.browserName).toBeNull();
    expect(info.osName).toBe("Android");
    expect(info.deviceType).toBe("mobile");
  });

  it("reads modern Opera and Opera Mini versions instead of the Presto 9.80 marker", () => {
    const presto = detect(
      "Opera/9.80 (Windows NT 6.1) Presto/2.12.388 Version/12.16",
      { platform: "Win32" },
    );
    const mini = detect(
      "Opera/9.80 (Android; Opera Mini/43.0.2245.123) Presto/2.12 Version/11.10",
    );

    expect(presto.browserName).toBe("Opera");
    expect(presto.browserFullVersion).toBe("12.16");
    expect(mini.browserName).toBe("Opera Mini");
    expect(mini.browserFullVersion).toBe("43.0.2245.123");
  });

  it("does not guess a browser, OS, or device type from an empty or ambiguous UA", () => {
    const empty = detect("");
    const ambiguous = detect("Mozilla/5.0");

    expect(empty.browserName).toBeNull();
    expect(empty.osName).toBeNull();
    expect(empty.deviceType).toBeNull();
    expect(ambiguous.browserName).toBeNull();
    expect(ambiguous.osName).toBeNull();
    expect(ambiguous.deviceType).toBeNull();
  });

  it("does not treat a Windows touchscreen as a tablet", () => {
    const info = detect(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.137 Safari/537.36",
      { platform: "Win32", maxTouchPoints: 10 },
    );

    expect(info.deviceType).toBe("desktop");
    expect(info.osName).toBe("Windows");
  });

  it("detects an explicit Android tablet token and leaves other Android UAs unknown without Client Hints", () => {
    const namedTablet = detect(
      "Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.99 Safari/537.36",
    );
    const ambiguous = detect(
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.99 Safari/537.36",
    );

    expect(namedTablet.osName).toBe("Android");
    expect(namedTablet.deviceType).toBe("tablet");
    expect(ambiguous.osName).toBe("Android");
    expect(ambiguous.deviceType).toBeNull();
  });
});

describe("target IP suppression", () => {
  const deviceHints = hints({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.137 Safari/537.36",
    platform: "Win32",
  });

  it("returns visitor browser info only for the current connection", () => {
    expect(resolveVisitorBrowserInfo(undefined, deviceHints)?.browserName).toBe("Chrome");
    expect(resolveVisitorBrowserInfo("", deviceHints)?.browserName).toBe("Chrome");
  });

  it("does not expose the visitor browser profile for an arbitrary IP lookup", () => {
    expect(resolveVisitorBrowserInfo("8.8.8.8", deviceHints)).toBeNull();
    expect(resolveVisitorBrowserInfo("2001:4860:4860::8888", deviceHints)).toBeNull();
  });
});

describe("timezone handling", () => {
  it("uses the client IANA timezone from hints and ignores IP geolocation timezone", () => {
    const ipTimezone = "America/New_York";
    const info = detectVisitorBrowserInfo(
      hints({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
        timeZone: "Europe/Berlin",
      }),
    );

    expect(info.timeZone).toBe("Europe/Berlin");
    expect(info.timeZone).not.toBe(ipTimezone);
    expect(Object.keys(info)).not.toContain("ipTimezone");
  });

  it("treats a missing client timezone as unknown", () => {
    const info = detectVisitorBrowserInfo(hints({ timeZone: "  " }));
    expect(info.timeZone).toBeNull();
  });

  it("reads the IANA timezone from Intl.DateTimeFormat resolved options", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "Asia/Tokyo" }),
        }) as Intl.DateTimeFormat,
    );

    expect(readBrowserTimeZone()).toBe("Asia/Tokyo");
  });

  it("collects the browser timezone together with the proxy-hint device signals", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "Australia/Sydney" }),
        }) as Intl.DateTimeFormat,
    );
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
      platform: "Linux x86_64",
      language: "de-DE",
      languages: ["de-DE", "de"],
      hardwareConcurrency: 8,
      maxTouchPoints: 0,
      webdriver: false,
    });
    vi.stubGlobal("screen", { width: 1440, height: 900, colorDepth: 24 });

    const collected = collectBrowserDeviceHints(new Date("2026-08-29T12:00:00Z"));
    expect(collected?.timeZone).toBe("Australia/Sydney");
    expect(collected?.userAgent).toContain("Firefox/131.0");
    expect(collected?.platform).toBe("Linux x86_64");
    expect(collected?.language).toBe("de-DE");
    expect(collected?.timezoneOffsetMinutes).toBe(-new Date("2026-08-29T12:00:00Z").getTimezoneOffset());
  });
});

describe("fingerprint generation", () => {
  const deviceHints = hints({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.137 Safari/537.36",
    platform: "Win32",
    languages: ["de-DE", "en-US", "de"],
    timeZone: "Europe/Berlin",
  });
  const info = detectVisitorBrowserInfo(deviceHints);

  it("hashes a documented deterministic subset with Web Crypto SHA-256", async () => {
    const material = buildFingerprintMaterial(deviceHints, info);
    const serialized = serializeFingerprintMaterial(material);
    const hash = await hashFingerprintMaterial(material);

    expect(material.v).toBe(1);
    expect(serialized).not.toContain(deviceHints.userAgent);
    expect(serialized).not.toContain("timezoneOffset");
    expect(serialized).not.toContain("webdriver");
    expect(serialized).not.toContain("ethernet");
    expect(JSON.parse(serialized).languages).toEqual(["de", "de-DE", "en-US"]);
    expect(hash).toBe(createHash("sha256").update(serialized).digest("hex"));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is stable for the same characteristics regardless of language order", async () => {
    const left = detectVisitorBrowserInfo(hints({ languages: ["fr", "en-US", "de"] }));
    const right = detectVisitorBrowserInfo(hints({ languages: ["de", "fr", "en-US"] }));
    const leftHash = await hashFingerprintMaterial(
      buildFingerprintMaterial(hints({ languages: ["fr", "en-US", "de"] }), left),
    );
    const rightHash = await hashFingerprintMaterial(
      buildFingerprintMaterial(hints({ languages: ["de", "fr", "en-US"] }), right),
    );

    expect(leftHash).toBe(rightHash);
  });

  it("changes when the browser timezone changes and stays independent of IP timezone", async () => {
    const berlinHints = hints({ timeZone: "Europe/Berlin" });
    const tokyoHints = hints({ timeZone: "Asia/Tokyo" });
    const berlin = detectVisitorBrowserInfo(berlinHints);
    const tokyo = detectVisitorBrowserInfo(tokyoHints);

    const berlinHash = await hashFingerprintMaterial(buildFingerprintMaterial(berlinHints, berlin));
    const tokyoHash = await hashFingerprintMaterial(buildFingerprintMaterial(tokyoHints, tokyo));
    const berlinAgain = await hashFingerprintMaterial(buildFingerprintMaterial(berlinHints, berlin));

    expect(berlin.timeZone).toBe("Europe/Berlin");
    expect(tokyo.timeZone).toBe("Asia/Tokyo");
    expect(berlinHash).toBe(berlinAgain);
    expect(berlinHash).not.toBe(tokyoHash);
  });

  it("keeps the same hash when screen width and height swap after rotation", async () => {
    const portrait = hints({ screen: { width: 390, height: 844, colorDepth: 24 } });
    const landscape = hints({ screen: { width: 844, height: 390, colorDepth: 24 } });
    const portraitInfo = detectVisitorBrowserInfo(portrait);
    const landscapeInfo = detectVisitorBrowserInfo(landscape);

    const portraitMaterial = buildFingerprintMaterial(portrait, portraitInfo);
    const landscapeMaterial = buildFingerprintMaterial(landscape, landscapeInfo);

    expect(portraitMaterial.screenShortSide).toBe(390);
    expect(portraitMaterial.screenLongSide).toBe(844);
    expect(landscapeMaterial.screenShortSide).toBe(390);
    expect(landscapeMaterial.screenLongSide).toBe(844);
    expect(await hashFingerprintMaterial(portraitMaterial)).toBe(
      await hashFingerprintMaterial(landscapeMaterial),
    );
  });
});

describe("display helpers", () => {
  it("prefers a reliable full version and composes the OS label", () => {
    const info: DetectedBrowserInfo = {
      browserName: "Chrome",
      browserMajorVersion: "128",
      browserFullVersion: "128.0.6613.137",
      osName: "Windows",
      osVersion: "11",
      deviceType: "desktop",
      timeZone: "Europe/Berlin",
    };

    expect(formatBrowserVersion(info)).toBe("128.0.6613.137");
    expect(formatOsLabel(info)).toBe("Windows 11");
    expect(formatOsLabel({ ...info, osVersion: null })).toBe("Windows");
    expect(formatBrowserVersion({ ...info, browserFullVersion: null })).toBe("128");
  });
});

describe("User-Agent Client Hints collection", () => {
  it("returns low-entropy brands when high-entropy values are unavailable", async () => {
    await expect(
      readUserAgentClientHints({
        brands: [{ brand: "Brave", version: "1.70" }, { brand: "Chromium", version: "128" }],
        mobile: false,
        platform: "Linux",
      }),
    ).resolves.toEqual({
      brands: [{ brand: "Brave", version: "1.70" }, { brand: "Chromium", version: "128" }],
      mobile: false,
      platform: "Linux",
    });
  });

  it("merges high-entropy values when the browser provides them", async () => {
    await expect(
      readUserAgentClientHints({
        brands: [{ brand: "Google Chrome", version: "128" }],
        mobile: false,
        platform: "Windows",
        getHighEntropyValues: async () => ({
          platform: "Windows",
          platformVersion: "15.0.0",
          uaFullVersion: "128.0.6613.137",
          fullVersionList: [{ brand: "Google Chrome", version: "128.0.6613.137" }],
        }),
      }),
    ).resolves.toMatchObject({
      platform: "Windows",
      platformVersion: "15.0.0",
      uaFullVersion: "128.0.6613.137",
    });
  });
});
