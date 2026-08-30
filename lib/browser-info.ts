/**
 * Client-side browser / OS / device detection and a local diagnostic fingerprint.
 *
 * Designed for the visitor IP page only. Detection prefers User-Agent Client Hints
 * when present and falls back to the User-Agent string conservatively: ambiguous
 * values stay `null` rather than guessing. The fingerprint is hashed in the
 * browser from a documented, deterministic subset of signals already collected
 * for `assessLocalProxyHints` — it is never persisted or sent to the backend.
 */

import type { BrowserDeviceHints } from "@/lib/connection-type";

export const FINGERPRINT_SCHEMA_VERSION = 1;
export const FINGERPRINT_HASH_ALGORITHM = "SHA-256";

export type DeviceType = "desktop" | "mobile" | "tablet";

export interface UserAgentBrand {
  brand: string;
  version: string;
}

export interface UserAgentClientHints {
  brands?: UserAgentBrand[];
  mobile?: boolean;
  platform?: string;
  platformVersion?: string;
  fullVersionList?: UserAgentBrand[];
  uaFullVersion?: string;
}

export interface DetectedBrowserInfo {
  browserName: string | null;
  browserMajorVersion: string | null;
  browserFullVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: DeviceType | null;
  /** IANA timezone from the client (`Intl`), never from IP geolocation. */
  timeZone: string | null;
}

/**
 * Documented fingerprint v1 inputs. Only these fields are hashed.
 * Intentionally omitted: full User-Agent, IP addresses, timezone offset (DST),
 * network connection metrics, webdriver, canvas/WebGL/audio, fonts, device model.
 */
export interface FingerprintMaterial {
  v: typeof FINGERPRINT_SCHEMA_VERSION;
  browserName: string;
  browserMajor: string;
  osName: string;
  deviceType: string;
  timeZone: string;
  language: string;
  languages: string[];
  platform: string;
  hardwareConcurrency: number | "";
  deviceMemory: number | "";
  screenWidth: number | "";
  screenHeight: number | "";
  colorDepth: number | "";
  maxTouchPoints: number | "";
}

type NavigatorNetworkInformation = Navigator & {
  deviceMemory?: number;
  connection?: BrowserDeviceHints["connection"];
  userAgentData?: NavigatorUserAgentData;
};

interface NavigatorUserAgentData {
  brands: UserAgentBrand[];
  mobile: boolean;
  platform: string;
  getHighEntropyValues?: (
    hints: string[],
  ) => Promise<{
    brands?: UserAgentBrand[];
    mobile?: boolean;
    platform?: string;
    platformVersion?: string;
    fullVersionList?: UserAgentBrand[];
    uaFullVersion?: string;
  }>;
}

const GREASE_BRAND = /not[\s._/\-;:]*a[\s._/\-;:]*brand/i;

const BRAND_PRIORITY = [
  "Edge",
  "Opera",
  "Brave",
  "Vivaldi",
  "Samsung Internet",
  "Yandex",
  "Chrome",
  "Firefox",
  "Safari",
  "Chromium",
] as const;

const HIGH_ENTROPY_HINTS = [
  "platform",
  "platformVersion",
  "fullVersionList",
  "uaFullVersion",
] as const;

export function readBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

export function collectBrowserDeviceHints(now = new Date()): BrowserDeviceHints | null {
  if (typeof navigator === "undefined" || typeof screen === "undefined") {
    return null;
  }

  const navigatorWithNetworkInfo = navigator as NavigatorNetworkInformation;
  const connection = navigatorWithNetworkInfo.connection;

  return {
    userAgent: navigator.userAgent || "",
    platform: navigator.platform || "",
    language: navigator.language || "",
    languages: [...(navigator.languages || [])],
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigatorWithNetworkInfo.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
    webdriver: Boolean(navigator.webdriver),
    timeZone: readBrowserTimeZone(),
    timezoneOffsetMinutes: -now.getTimezoneOffset(),
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    connection: connection
      ? {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
      : undefined,
  };
}

export async function readUserAgentClientHints(
  uaData: NavigatorUserAgentData | null | undefined = typeof navigator === "undefined"
    ? undefined
    : (navigator as NavigatorNetworkInformation).userAgentData,
): Promise<UserAgentClientHints | null> {
  if (!uaData) return null;

  const lowEntropy: UserAgentClientHints = {
    brands: uaData.brands,
    mobile: uaData.mobile,
    platform: uaData.platform,
  };

  if (typeof uaData.getHighEntropyValues !== "function") {
    return lowEntropy;
  }

  try {
    const high = await raceWithTimeout(uaData.getHighEntropyValues([...HIGH_ENTROPY_HINTS]), 1000);
    if (!high) return lowEntropy;
    return {
      brands: high.brands ?? uaData.brands,
      mobile: high.mobile ?? uaData.mobile,
      platform: high.platform ?? uaData.platform,
      platformVersion: high.platformVersion,
      fullVersionList: high.fullVersionList,
      uaFullVersion: high.uaFullVersion,
    };
  } catch {
    return lowEntropy;
  }
}

export function detectVisitorBrowserInfo(
  hints: BrowserDeviceHints,
  uaHints?: UserAgentClientHints | null,
): DetectedBrowserInfo {
  const deviceType = detectDeviceType(hints, uaHints);
  const os = detectOs(hints, uaHints, deviceType);
  const browser = detectBrowser(hints, uaHints);
  const timeZone = hints.timeZone.trim() || null;

  return {
    browserName: browser.name,
    browserMajorVersion: browser.majorVersion,
    browserFullVersion: browser.fullVersion,
    osName: os.name,
    osVersion: os.version,
    deviceType,
    timeZone,
  };
}

export function resolveVisitorBrowserInfo(
  targetIp: string | undefined,
  hints: BrowserDeviceHints,
  uaHints?: UserAgentClientHints | null,
): DetectedBrowserInfo | null {
  if (targetIp) return null;
  return detectVisitorBrowserInfo(hints, uaHints);
}

export function formatBrowserVersion(info: DetectedBrowserInfo): string | null {
  return info.browserFullVersion || info.browserMajorVersion;
}

export function formatOsLabel(info: DetectedBrowserInfo): string | null {
  if (!info.osName) return null;
  if (!info.osVersion) return info.osName;
  return `${info.osName} ${info.osVersion}`;
}

/** Groups used when rendering a hex fingerprint in the UI. */
export const FINGERPRINT_DISPLAY_GROUP_SIZE = 8;
export const FINGERPRINT_DISPLAY_GROUPS_PER_LINE = 4;

/** Split a hex fingerprint into fixed-width groups so it can wrap at group boundaries. */
export function splitFingerprintGroups(
  hash: string,
  groupSize = FINGERPRINT_DISPLAY_GROUP_SIZE,
): string[] {
  if (!hash) return [];
  if (groupSize < 1) return [hash];

  const groups: string[] = [];
  for (let i = 0; i < hash.length; i += groupSize) {
    groups.push(hash.slice(i, i + groupSize));
  }
  return groups;
}

/**
 * Space-separated fingerprint, wrapped into even lines of groups.
 * SHA-256 hex (64 chars) becomes two lines of four 8-character groups.
 */
export function formatFingerprint(
  hash: string,
  groupSize = FINGERPRINT_DISPLAY_GROUP_SIZE,
  groupsPerLine = FINGERPRINT_DISPLAY_GROUPS_PER_LINE,
): string {
  const groups = splitFingerprintGroups(hash, groupSize);
  if (groups.length === 0) return "";
  if (groupsPerLine < 1) return groups.join(" ");

  const lines: string[] = [];
  for (let i = 0; i < groups.length; i += groupsPerLine) {
    lines.push(groups.slice(i, i + groupsPerLine).join(" "));
  }
  return lines.join("\n");
}

export function buildFingerprintMaterial(
  hints: BrowserDeviceHints,
  info: DetectedBrowserInfo,
): FingerprintMaterial {
  return {
    v: FINGERPRINT_SCHEMA_VERSION,
    browserName: info.browserName ?? "",
    browserMajor: info.browserMajorVersion ?? "",
    osName: info.osName ?? "",
    deviceType: info.deviceType ?? "",
    timeZone: info.timeZone ?? "",
    language: hints.language || "",
    languages: [...(hints.languages || [])].filter(Boolean).sort(),
    platform: hints.platform || "",
    hardwareConcurrency: finiteOrEmpty(hints.hardwareConcurrency),
    deviceMemory: finiteOrEmpty(hints.deviceMemory),
    screenWidth: finiteOrEmpty(hints.screen?.width),
    screenHeight: finiteOrEmpty(hints.screen?.height),
    colorDepth: finiteOrEmpty(hints.screen?.colorDepth),
    maxTouchPoints: finiteOrEmpty(hints.maxTouchPoints),
  };
}

export function serializeFingerprintMaterial(material: FingerprintMaterial): string {
  const canonical: FingerprintMaterial = {
    v: material.v,
    browserName: material.browserName,
    browserMajor: material.browserMajor,
    osName: material.osName,
    deviceType: material.deviceType,
    timeZone: material.timeZone,
    language: material.language,
    languages: [...material.languages].sort(),
    platform: material.platform,
    hardwareConcurrency: material.hardwareConcurrency,
    deviceMemory: material.deviceMemory,
    screenWidth: material.screenWidth,
    screenHeight: material.screenHeight,
    colorDepth: material.colorDepth,
    maxTouchPoints: material.maxTouchPoints,
  };

  return JSON.stringify(canonical);
}

export async function hashFingerprintMaterial(material: FingerprintMaterial): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;

  try {
    const encoded = new TextEncoder().encode(serializeFingerprintMaterial(material));
    const digest = await crypto.subtle.digest(FINGERPRINT_HASH_ALGORITHM, encoded);
    return toHex(new Uint8Array(digest));
  } catch {
    return null;
  }
}

function detectBrowser(
  hints: BrowserDeviceHints,
  uaHints?: UserAgentClientHints | null,
): { name: string | null; majorVersion: string | null; fullVersion: string | null } {
  const fromHints = pickBrand(
    uaHints?.fullVersionList?.length ? uaHints.fullVersionList : uaHints?.brands,
  );

  if (fromHints) {
    const fullFromList = reliableFullVersion(fromHints.version);
    const fullFromUa =
      fromHints.name === "Chrome" || fromHints.name === "Chromium" || fromHints.name === "Edge"
        ? reliableFullVersion(uaHints?.uaFullVersion)
        : null;
    const fullVersion = fullFromList || fullFromUa;
    const majorVersion = parseMajorVersion(fullVersion || fromHints.version);
    return { name: fromHints.name, majorVersion, fullVersion };
  }

  return detectBrowserFromUserAgent(hints.userAgent);
}

function detectBrowserFromUserAgent(userAgent: string): {
  name: string | null;
  majorVersion: string | null;
  fullVersion: string | null;
} {
  const ua = userAgent || "";
  if (!ua.trim()) {
    return { name: null, majorVersion: null, fullVersion: null };
  }

  const rules: { name: string; pattern: RegExp }[] = [
    { name: "Yandex", pattern: /YaBrowser\/([0-9.]+)/i },
    { name: "Samsung Internet", pattern: /SamsungBrowser\/([0-9.]+)/i },
    { name: "Opera", pattern: /(?:OPR|Opera)\/([0-9.]+)/i },
    { name: "Edge", pattern: /(?:Edg|EdgiOS|EdgA)\/([0-9.]+)/i },
    { name: "Vivaldi", pattern: /Vivaldi\/([0-9.]+)/i },
    { name: "Brave", pattern: /Brave\/([0-9.]+)/i },
    { name: "Firefox", pattern: /(?:Firefox|FxiOS)\/([0-9.]+)/i },
    { name: "Chrome", pattern: /(?:Chrome|CriOS)\/([0-9.]+)/i },
    { name: "Safari", pattern: /Version\/([0-9.]+).*Safari\//i },
  ];

  for (const rule of rules) {
    if (rule.name === "Chrome" && /(?:Edg|EdgiOS|EdgA|OPR|Opera|SamsungBrowser|YaBrowser|Vivaldi|Brave)\//i.test(ua)) {
      continue;
    }
    if (rule.name === "Safari" && /(?:Chrome|CriOS|Chromium|Android)\//i.test(ua)) {
      continue;
    }

    const match = ua.match(rule.pattern);
    if (!match) continue;

    const rawVersion = match[1];
    const fullVersion = reliableFullVersion(rawVersion);
    const majorVersion = parseMajorVersion(rawVersion);
    return { name: rule.name, majorVersion, fullVersion };
  }

  return { name: null, majorVersion: null, fullVersion: null };
}

function detectDeviceType(
  hints: BrowserDeviceHints,
  uaHints?: UserAgentClientHints | null,
): DeviceType | null {
  const ua = hints.userAgent || "";
  const platform = `${hints.platform} ${uaHints?.platform || ""}`;

  if (isIpad(hints, uaHints)) return "tablet";
  if (/iPhone|iPod/i.test(ua) || /iPhone/i.test(platform)) return "mobile";

  if (uaHints?.mobile === true) return "mobile";

  if (/Android/i.test(ua) || /^Android$/i.test(uaHints?.platform || "")) {
    if (/Tablet/i.test(ua)) return "tablet";
    if (/Mobile/i.test(ua)) return "mobile";
    if (uaHints?.mobile === false) return "tablet";
    return null;
  }

  if (/Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|IEMobile|webOS/i.test(ua)) return "mobile";

  if (isDesktopOs(hints, uaHints)) return "desktop";

  return null;
}

function detectOs(
  hints: BrowserDeviceHints,
  uaHints: UserAgentClientHints | null | undefined,
  deviceType: DeviceType | null,
): { name: string | null; version: string | null } {
  const chPlatform = uaHints?.platform?.trim() || "";
  const ua = hints.userAgent || "";
  const platform = hints.platform || "";

  if (chPlatform) {
    const mapped = mapClientHintPlatform(chPlatform, uaHints?.platformVersion, deviceType, hints);
    if (mapped.name) return mapped;
  }

  if (isIpad(hints, uaHints) || /iPad/i.test(ua)) {
    return { name: "iPadOS", version: parseAppleOsVersion(ua, /(?:CPU OS|iPad OS) ([0-9_]+)/i) };
  }

  if (/iPhone|iPod/i.test(ua) || /iPhone/i.test(platform)) {
    return { name: "iOS", version: parseAppleOsVersion(ua, /OS ([0-9_]+) like Mac OS X/i) };
  }

  if (/Android/i.test(ua)) {
    return { name: "Android", version: firstGroup(ua, /Android ([0-9.]+)/i) };
  }

  if (/\bCrOS\b/i.test(ua)) {
    return { name: "Chrome OS", version: null };
  }

  if (/Windows/i.test(ua) || /Win/i.test(platform)) {
    // Windows 11 still reports NT 10.0 in the UA; only Client Hints can distinguish.
    return { name: "Windows", version: null };
  }

  if (/Macintosh|Mac OS X|MacIntel/i.test(ua) || /Mac/i.test(platform)) {
    // Desktop Safari freezes the macOS UA at 10_15_7 — do not report that as the version.
    return { name: "macOS", version: null };
  }

  if (/Linux|X11/i.test(ua) || /Linux/i.test(platform)) {
    return { name: "Linux", version: null };
  }

  return { name: null, version: null };
}

function mapClientHintPlatform(
  platform: string,
  platformVersion: string | undefined,
  deviceType: DeviceType | null,
  hints: BrowserDeviceHints,
): { name: string | null; version: string | null } {
  if (/^Windows$/i.test(platform)) {
    return { name: "Windows", version: mapWindowsPlatformVersion(platformVersion) };
  }
  if (/^macOS$/i.test(platform)) {
    if (isIpad(hints, { platform })) {
      return { name: "iPadOS", version: parseMajorVersion(platformVersion) };
    }
    return { name: "macOS", version: parseMajorVersion(platformVersion) };
  }
  if (/^iOS$/i.test(platform)) {
    return {
      name: deviceType === "tablet" || isIpad(hints, { platform }) ? "iPadOS" : "iOS",
      version: parseMajorVersion(platformVersion),
    };
  }
  if (/^Android$/i.test(platform)) {
    return { name: "Android", version: parseMajorVersion(platformVersion) };
  }
  if (/Chrome OS|ChromeOS|Chromium OS/i.test(platform)) {
    return { name: "Chrome OS", version: parseMajorVersion(platformVersion) };
  }
  if (/^Linux$/i.test(platform)) {
    if (/Android/i.test(hints.userAgent)) {
      return { name: "Android", version: firstGroup(hints.userAgent, /Android ([0-9.]+)/i) };
    }
    return { name: "Linux", version: null };
  }
  return { name: null, version: null };
}

function isIpad(hints: BrowserDeviceHints, uaHints?: UserAgentClientHints | null): boolean {
  if (/iPad/i.test(hints.userAgent)) return true;
  if (/^iPad/i.test(hints.platform)) return true;

  // iPadOS 13+ desktop UA reports Macintosh with a multi-touch screen.
  const macintosh =
    /Macintosh/i.test(hints.userAgent) ||
    /MacIntel|Macintosh/i.test(hints.platform) ||
    /^macOS$/i.test(uaHints?.platform || "");
  return macintosh && hints.maxTouchPoints > 1;
}

function isDesktopOs(hints: BrowserDeviceHints, uaHints?: UserAgentClientHints | null): boolean {
  const platform = `${hints.platform} ${uaHints?.platform || ""} ${hints.userAgent}`;
  if (/Android|iPhone|iPod|iPad/i.test(platform)) return false;
  return /Windows|Win32|Win64|Mac OS|Macintosh|MacIntel|Linux|X11|CrOS|Chrome OS/i.test(platform);
}

function pickBrand(brands: UserAgentBrand[] | undefined): { name: string; version: string } | null {
  if (!brands?.length) return null;

  const normalized = brands
    .map((entry) => {
      const name = normalizeBrandName(entry.brand);
      if (!name) return null;
      return { name, version: entry.version || "" };
    })
    .filter((entry): entry is { name: string; version: string } => entry !== null);

  if (normalized.length === 0) return null;

  for (const preferred of BRAND_PRIORITY) {
    const match = normalized.find((entry) => entry.name === preferred);
    if (match) return match;
  }

  return null;
}

function normalizeBrandName(brand: string): string | null {
  const trimmed = brand.trim();
  if (!trimmed || GREASE_BRAND.test(trimmed)) return null;

  const lower = trimmed.toLowerCase();
  if (lower === "google chrome" || lower === "chrome") return "Chrome";
  if (lower === "microsoft edge" || lower === "edge") return "Edge";
  if (lower === "opera") return "Opera";
  if (lower === "brave") return "Brave";
  if (lower === "vivaldi") return "Vivaldi";
  if (lower === "samsung internet") return "Samsung Internet";
  if (lower === "firefox") return "Firefox";
  if (lower === "safari") return "Safari";
  if (lower === "yandex" || lower === "yandex browser") return "Yandex";
  if (lower === "chromium") return "Chromium";
  return null;
}

function reliableFullVersion(version: string | null | undefined): string | null {
  if (!version) return null;
  const trimmed = version.trim();
  if (!/^[0-9]+(?:\.[0-9]+)*$/.test(trimmed)) return null;
  // Chromium reduced UA reports major.0.0.0 — that is not a reliable full version.
  if (/^[0-9]+\.0\.0\.0$/.test(trimmed)) return null;
  if (/^[0-9]+$/.test(trimmed)) return null;
  return trimmed;
}

function parseMajorVersion(version: string | null | undefined): string | null {
  if (!version) return null;
  const match = version.trim().match(/^([0-9]+)/);
  return match ? match[1] : null;
}

function mapWindowsPlatformVersion(platformVersion: string | undefined): string | null {
  const major = parseMajorVersion(platformVersion);
  if (!major) return null;
  const numeric = Number(major);
  if (!Number.isFinite(numeric) || numeric === 0) return null;
  // Chromium maps Windows 11 to UniversalApiContract >= 13.
  if (numeric >= 13) return "11";
  if (numeric === 10) return "10";
  return null;
}

function parseAppleOsVersion(userAgent: string, pattern: RegExp): string | null {
  const raw = firstGroup(userAgent, pattern);
  if (!raw) return null;
  const major = raw.split("_")[0];
  return parseMajorVersion(major);
}

function firstGroup(value: string, pattern: RegExp): string | null {
  const match = value.match(pattern);
  return match?.[1] || null;
}

function finiteOrEmpty(value: number | undefined): number | "" {
  return typeof value === "number" && Number.isFinite(value) ? value : "";
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
