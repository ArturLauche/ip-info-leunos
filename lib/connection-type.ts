/**
 * Locale-neutral connection-type and proxy heuristics for IP metadata.
 * The API returns these codes; the UI translates them via `lib/i18n.ts`.
 */

export const CONNECTION_TYPES = [
  "datacenter",
  "tor",
  "vpn",
  "proxy",
  "mobile",
  "starlink",
  "satellite",
  "fiber",
  "cable",
  "fixed_wireless",
  "dsl",
  "business",
  "fixed",
  "unknown",
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export type ProxyType = "tor" | "vpn" | "hosting-proxy" | "unknown";

export interface ProxyAssessment {
  isProxy: boolean;
  proxyType: ProxyType;
  confidence: "none" | "low" | "medium" | "high";
  reasons: string[];
}

export type ProxyHintConfidence = "none" | "low" | "medium" | "high";

export type ProxyHintCategory =
  | "enterprise-proxy"
  | "school-proxy"
  | "security-gateway"
  | "local-proxy"
  | "transparent-proxy"
  | "generic-proxy"
  | "unknown";

export type ProxyHintReason =
  | "enterprise-product-header"
  | "explicit-proxy-header"
  | "network-proxy-signature"
  | "forwarded-chain-anomaly"
  | "school-network-context"
  | "enterprise-network-context"
  | "timezone-mismatch"
  | "language-mismatch"
  | "network-device-inconsistency"
  | "automation-signal";

export const PROXY_HINT_FIXED_LABELS = [
  "via-header",
  "proxy-header",
  "cache-header",
  "forwarded-chain",
  "gateway-signature",
  "proxy-signature",
  "socks-signature",
  "school-network",
  "enterprise-network",
  "timezone-mismatch",
  "language-mismatch",
  "network-device-inconsistency",
  "automation-signal",
] as const;

export type ProxyHintFixedLabel = (typeof PROXY_HINT_FIXED_LABELS)[number];

export const PROXY_HINT_PRODUCTS = [
  { id: "zscaler", name: "Zscaler", keywords: ["zscaler"] },
  { id: "netskope", name: "Netskope", keywords: ["netskope"] },
  { id: "bluecoat", name: "Blue Coat", keywords: ["bluecoat", "blue coat"] },
  { id: "symantec", name: "Symantec", keywords: ["symantec"] },
  { id: "broadcom", name: "Broadcom", keywords: ["broadcom"] },
  { id: "squid", name: "Squid", keywords: ["squid"] },
  { id: "forcepoint", name: "Forcepoint", keywords: ["forcepoint"] },
  { id: "websense", name: "Websense", keywords: ["websense"] },
  { id: "fortigate", name: "FortiGate", keywords: ["fortigate"] },
  { id: "fortinet", name: "Fortinet", keywords: ["fortinet"] },
  { id: "palo-alto", name: "Palo Alto", keywords: ["palo alto", "paloalto"] },
  { id: "globalprotect", name: "GlobalProtect", keywords: ["globalprotect", "global protect"] },
  { id: "cisco-umbrella", name: "Cisco Umbrella", keywords: ["cisco umbrella", "umbrella"] },
  { id: "barracuda", name: "Barracuda", keywords: ["barracuda"] },
  { id: "iboss", name: "iboss", keywords: ["iboss"] },
  { id: "smoothwall", name: "Smoothwall", keywords: ["smoothwall"] },
  { id: "lightspeed", name: "Lightspeed", keywords: ["lightspeed"] },
  { id: "sophos", name: "Sophos", keywords: ["sophos"] },
  { id: "mimecast", name: "Mimecast", keywords: ["mimecast"] },
  { id: "proofpoint", name: "Proofpoint", keywords: ["proofpoint"] },
  {
    id: "cloudflare-gateway",
    name: "Cloudflare Gateway",
    keywords: ["cloudflare gateway"],
  },
  { id: "cloudflare-warp", name: "Cloudflare WARP", keywords: ["cloudflare warp"] },
] as const;

export type ProxyHintProduct = (typeof PROXY_HINT_PRODUCTS)[number]["id"];

export type ProxyHintLabel =
  | ProxyHintFixedLabel
  | `product-header:${ProxyHintProduct}`
  | `product-signature:${ProxyHintProduct}`;

export interface ProxyHintAssessment {
  detected: boolean;
  confidence: ProxyHintConfidence;
  category: ProxyHintCategory;
  reasons: ProxyHintReason[];
  labels: ProxyHintLabel[];
}

export interface ProxyHintNetworkSignals {
  isp: string;
  org: string;
  as: string;
  asname?: string;
  reverse?: string;
}

export interface BrowserDeviceHints {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  hardwareConcurrency: number;
  deviceMemory?: number;
  maxTouchPoints: number;
  webdriver: boolean;
  timeZone: string;
  timezoneOffsetMinutes: number;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  connection?: {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
}

export interface LocalProxyHintIpData extends ProxyHintNetworkSignals {
  timezone: string;
  countryCode: string;
  mobile: boolean;
  hosting: boolean;
  connectionType: ConnectionType;
}

export interface NetworkSignals {
  isp: string;
  org: string;
  as: string;
  reverse?: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}

const TOR_KEYWORDS = [" tor ", ".tor", "tor-exit", "tor exit", "tor relay", "onion"];
const VPN_KEYWORDS = [
  "vpn",
  "wireguard",
  "openvpn",
  "ipsec",
  "nordvpn",
  "mullvad",
  "expressvpn",
  "protonvpn",
  "surfshark",
  "cyberghost",
  "pia",
  "private internet access",
  "tunnel",
  "zerotier",
  "tailscale",
];
const PROXY_KEYWORDS = [
  "proxy",
  "socks",
  "residential gateway",
  "anonymizer",
  "exit node",
  "forwarder",
];
const DATACENTER_KEYWORDS = [
  "digitalocean",
  "ovh",
  "hetzner",
  "linode",
  "amazon",
  "aws",
  "google cloud",
  "microsoft",
  "azure",
  "oracle cloud",
  "vultr",
  "choopa",
  "leaseweb",
  "contabo",
  "datacenter",
  "colo",
  "colocation",
];
const RESIDENTIAL_KEYWORDS = [
  "telekom",
  "vodafone",
  "comcast",
  "charter",
  "cox",
  "orange",
  "telefonica",
  "verizon",
  "at&t",
  "bell",
  "movistar",
  "free",
  "bt",
];

const STARLINK_KEYWORDS = ["starlink", "spacex"];
const SATELLITE_KEYWORDS = ["satellite", "satellit", "viasat", "hughesnet", "ses astra"];
const FIBER_KEYWORDS = [
  "fiber",
  "fibre",
  "glasfaser",
  "ftth",
  "fttb",
  "fttp",
  "xgs-pon",
  "gpon",
  "deutsche glasfaser",
  "init7",
];
const CABLE_KEYWORDS = [
  "cable",
  "kabel",
  "docsis",
  "vodafone kabel",
  "unitymedia",
  "liberty global",
  "comcast",
  "charter",
  "cox",
  "cablevision",
  "pyur",
  "tele columbus",
];
const FIXED_WIRELESS_KEYWORDS = [
  "fwa",
  "fixed wireless",
  "fixed-wireless",
  "wireless broadband",
  "richtfunk",
  "wimax",
];
const DSL_KEYWORDS = [
  "dsl",
  "t-online",
  "adsl",
  "vdsl",
  "xdsl",
  "pppoe",
  "1&1",
  "o2",
  "ewe tel",
  "netcologne",
  "m-net",
  "easybell",
  "at&t",
  "centurylink",
  "bt ",
];
const BUSINESS_KEYWORDS = [
  "leased line",
  "dedicated internet",
  "dia",
  "business internet",
  "enterprise",
  "mpls",
];

const PROXY_HINT_REASON_SCORES: Record<ProxyHintReason, number> = {
  "enterprise-product-header": 40,
  "explicit-proxy-header": 30,
  "network-proxy-signature": 25,
  "forwarded-chain-anomaly": 20,
  "school-network-context": 0,
  "enterprise-network-context": 0,
  "timezone-mismatch": 10,
  "language-mismatch": 5,
  "network-device-inconsistency": 10,
  "automation-signal": 10,
};

const TECHNICAL_PROXY_REASONS = new Set<ProxyHintReason>([
  "enterprise-product-header",
  "explicit-proxy-header",
  "network-proxy-signature",
  "forwarded-chain-anomaly",
]);

const NETWORK_PROXY_KEYWORDS = [
  "proxy",
  "socks",
  "gateway",
  "firewall",
  "webfilter",
  "web filter",
  "content filter",
  "secure web",
  "secure web gateway",
  "swg",
  "cache",
  "relay",
];

const SCHOOL_NETWORK_KEYWORDS = [
  "school",
  "university",
  "college",
  "campus",
  "education",
  "edu",
  "district",
];

const ENTERPRISE_NETWORK_KEYWORDS = [
  "verwaltung",
  "stadt",
  "kreis",
  "ministry",
  "government",
  "enterprise",
  "corp",
  "corporate",
  "office",
  "company",
  "business",
];

const COUNTRY_LANGUAGE_PREFIXES: Record<string, readonly string[]> = {
  DE: ["de"],
  AT: ["de"],
  CH: ["de", "fr", "it"],
  US: ["en", "es"],
  GB: ["en"],
  IE: ["en"],
  AU: ["en"],
  NZ: ["en"],
  CA: ["en", "fr"],
  ES: ["es"],
  MX: ["es"],
  AR: ["es"],
  CL: ["es"],
  CO: ["es"],
  PE: ["es"],
  VE: ["es"],
  EC: ["es"],
  BO: ["es"],
  PY: ["es"],
  UY: ["es"],
  CR: ["es"],
  PA: ["es"],
  GT: ["es"],
  HN: ["es"],
  SV: ["es"],
  NI: ["es"],
  DO: ["es"],
  FR: ["fr"],
  BE: ["fr", "nl", "de"],
  PT: ["pt"],
  BR: ["pt"],
  JP: ["ja"],
  RU: ["ru"],
  BY: ["ru", "be"],
  CN: ["zh"],
  TW: ["zh"],
  HK: ["zh", "en"],
  SG: ["zh", "en", "ms", "ta"],
};

const FIXED_CONNECTION_TYPES = new Set<ConnectionType>([
  "datacenter",
  "fiber",
  "cable",
  "fixed_wireless",
  "dsl",
  "business",
  "fixed",
]);

const PROXY_HINT_PRODUCT_NAMES = Object.fromEntries(
  PROXY_HINT_PRODUCTS.map((product) => [product.id, product.name]),
) as Record<ProxyHintProduct, string>;

export { PROXY_HINT_PRODUCT_NAMES };

function combineSignals(signals: Pick<NetworkSignals, "isp" | "org" | "as">) {
  return `${signals.isp || ""} ${signals.org || ""} ${signals.as || ""}`.toLowerCase();
}

function includesTerm(value: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(value);
}

function includesAnyTerm(value: string, terms: readonly string[]) {
  return terms.some((term) => includesTerm(value, term));
}

export function findProxyHintProducts(value: string): ProxyHintProduct[] {
  return PROXY_HINT_PRODUCTS.filter((product) =>
    product.keywords.some((keyword) => includesTerm(value, keyword)),
  ).map((product) => product.id);
}

export function isProxyHintProduct(value: string): value is ProxyHintProduct {
  return Object.hasOwn(PROXY_HINT_PRODUCT_NAMES, value);
}

function getProxyHintScore(reasons: readonly ProxyHintReason[]) {
  const uniqueReasons = new Set(reasons);
  let score = [...uniqueReasons].reduce(
    (total, reason) => total + PROXY_HINT_REASON_SCORES[reason],
    0,
  );
  const hasTechnicalReason = [...uniqueReasons].some((reason) =>
    TECHNICAL_PROXY_REASONS.has(reason),
  );

  if (hasTechnicalReason && uniqueReasons.has("school-network-context")) score += 15;
  if (hasTechnicalReason && uniqueReasons.has("enterprise-network-context")) score += 15;

  return score;
}

function getProxyHintCategory(
  detected: boolean,
  reasons: readonly ProxyHintReason[],
  labels: readonly ProxyHintLabel[],
): ProxyHintCategory {
  if (!detected) return "unknown";

  const reasonSet = new Set(reasons);
  const labelSet = new Set(labels);
  const hasTechnicalReason = reasons.some((reason) => TECHNICAL_PROXY_REASONS.has(reason));

  if (hasTechnicalReason && reasonSet.has("school-network-context")) return "school-proxy";
  if (hasTechnicalReason && reasonSet.has("enterprise-network-context")) return "enterprise-proxy";

  const products = labels.flatMap((label) => {
    const separatorIndex = label.indexOf(":");
    if (separatorIndex < 0) return [];
    const product = label.slice(separatorIndex + 1);
    return isProxyHintProduct(product) ? [product] : [];
  });

  if (products.some((product) => product !== "squid")) return "security-gateway";
  if (labelSet.has("gateway-signature")) return "security-gateway";
  if (labelSet.has("socks-signature") || labelSet.has("proxy-header")) return "local-proxy";
  if (
    products.includes("squid") ||
    labelSet.has("via-header") ||
    labelSet.has("cache-header") ||
    labelSet.has("forwarded-chain")
  ) {
    return "transparent-proxy";
  }
  if (hasTechnicalReason) return "generic-proxy";

  return "unknown";
}

export function createProxyHintAssessment({
  reasons = [],
  labels = [],
}: {
  reasons?: readonly ProxyHintReason[];
  labels?: readonly ProxyHintLabel[];
} = {}): ProxyHintAssessment {
  const uniqueReasons = [...new Set(reasons)];
  const uniqueLabels = [...new Set(labels)];
  const score = getProxyHintScore(uniqueReasons);
  const detected = score >= 25;
  const confidence: ProxyHintConfidence = !detected
    ? "none"
    : score >= 70
      ? "high"
      : score >= 45
        ? "medium"
        : "low";

  return {
    detected,
    confidence,
    category: getProxyHintCategory(detected, uniqueReasons, uniqueLabels),
    reasons: uniqueReasons,
    labels: uniqueLabels,
  };
}

export function mergeProxyHintAssessments(
  ...assessments: Array<ProxyHintAssessment | null | undefined>
): ProxyHintAssessment {
  return createProxyHintAssessment({
    reasons: assessments.flatMap((assessment) => assessment?.reasons || []),
    labels: assessments.flatMap((assessment) => assessment?.labels || []),
  });
}

export function assessNetworkProxyHints(signals: ProxyHintNetworkSignals): ProxyHintAssessment {
  const combined = [signals.isp, signals.org, signals.as, signals.asname, signals.reverse]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const products = findProxyHintProducts(combined);
  const hasSchoolContext = includesAnyTerm(combined, SCHOOL_NETWORK_KEYWORDS);
  const hasEnterpriseContext = includesAnyTerm(combined, ENTERPRISE_NETWORK_KEYWORDS);
  const hasProxyKeyword = includesAnyTerm(combined, NETWORK_PROXY_KEYWORDS);
  const reasons: ProxyHintReason[] = [];
  const labels: ProxyHintLabel[] = [];

  if (hasSchoolContext) {
    reasons.push("school-network-context");
    labels.push("school-network");
  }
  if (hasEnterpriseContext) {
    reasons.push("enterprise-network-context");
    labels.push("enterprise-network");
  }
  if (products.length > 0 || hasProxyKeyword) {
    reasons.push("network-proxy-signature");
    labels.push(...products.map((product) => `product-signature:${product}` as const));

    if (includesAnyTerm(combined, ["socks"])) labels.push("socks-signature");
    else if (includesAnyTerm(combined, ["gateway", "firewall", "webfilter", "web filter", "content filter", "secure web", "swg"])) {
      labels.push("gateway-signature");
    } else {
      labels.push("proxy-signature");
    }
  }

  return createProxyHintAssessment({ reasons, labels });
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date) {
  if (!timeZone) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const utcTimestamp = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );

    return Math.round((utcTimestamp - date.getTime()) / 60_000);
  } catch {
    return null;
  }
}

export function assessLocalProxyHints(
  ipData: LocalProxyHintIpData,
  deviceHints: BrowserDeviceHints,
  now = new Date(),
): ProxyHintAssessment {
  const reasons: ProxyHintReason[] = [];
  const labels: ProxyHintLabel[] = [];
  const ipOffset = getTimeZoneOffsetMinutes(ipData.timezone, now);

  if (
    ipOffset !== null &&
    Number.isFinite(deviceHints.timezoneOffsetMinutes) &&
    Math.abs(ipOffset - deviceHints.timezoneOffsetMinutes) >= 60
  ) {
    reasons.push("timezone-mismatch");
    labels.push("timezone-mismatch");
  }

  const expectedLanguages = COUNTRY_LANGUAGE_PREFIXES[ipData.countryCode.toUpperCase()];
  const browserLanguages = [...deviceHints.languages, deviceHints.language]
    .filter(Boolean)
    .map((language) => language.toLowerCase().split("-")[0]);

  if (
    expectedLanguages?.length &&
    browserLanguages.length > 0 &&
    !browserLanguages.some((language) => expectedLanguages.includes(language))
  ) {
    reasons.push("language-mismatch");
    labels.push("language-mismatch");
  }

  const connectionType = deviceHints.connection?.type?.toLowerCase();
  const desktopPlatform = /win|mac|linux|x11/i.test(deviceHints.platform);
  const mobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(deviceHints.userAgent);
  const cellularAgainstFixedMetadata =
    connectionType === "cellular" &&
    !ipData.mobile &&
    (ipData.hosting || FIXED_CONNECTION_TYPES.has(ipData.connectionType));
  const mobileMetadataAgainstEthernetDesktop =
    ipData.mobile &&
    connectionType === "ethernet" &&
    desktopPlatform &&
    !mobileUserAgent &&
    deviceHints.maxTouchPoints === 0;
  const impossibleNetworkMetrics =
    (deviceHints.connection?.downlink !== undefined && deviceHints.connection.downlink < 0) ||
    (deviceHints.connection?.rtt !== undefined && deviceHints.connection.rtt < 0);

  if (cellularAgainstFixedMetadata || mobileMetadataAgainstEthernetDesktop || impossibleNetworkMetrics) {
    reasons.push("network-device-inconsistency");
    labels.push("network-device-inconsistency");
  }

  const headlessUserAgent = /headlesschrome|phantomjs|playwright|puppeteer|selenium/i.test(
    deviceHints.userAgent,
  );
  const impossibleDeviceValues =
    deviceHints.hardwareConcurrency < 1 ||
    (deviceHints.deviceMemory !== undefined && deviceHints.deviceMemory <= 0) ||
    deviceHints.maxTouchPoints < 0 ||
    deviceHints.screen.width <= 0 ||
    deviceHints.screen.height <= 0 ||
    deviceHints.screen.colorDepth <= 0;

  if (deviceHints.webdriver || headlessUserAgent || impossibleDeviceValues) {
    reasons.push("automation-signal");
    labels.push("automation-signal");
  }

  return createProxyHintAssessment({ reasons, labels });
}

export function assessProxyRisk(signals: NetworkSignals): ProxyAssessment {
  const combined = `${combineSignals(signals)} ${(signals.reverse || "").toLowerCase()}`;
  const includesAny = (keywords: string[]) => keywords.some((keyword) => combined.includes(keyword));

  const reasons: string[] = [];
  let score = 0;
  let proxyType: ProxyType = "unknown";

  if (signals.proxy) {
    score += 4;
    reasons.push("upstream-provider-flagged-proxy");
  }
  if (signals.hosting) {
    score += 2;
    reasons.push("upstream-provider-flagged-hosting");
  }
  if (includesAny(TOR_KEYWORDS)) {
    score += 5;
    proxyType = "tor";
    reasons.push("tor-signature");
  }
  if (includesAny(VPN_KEYWORDS)) {
    score += 3;
    if (proxyType === "unknown") proxyType = "vpn";
    reasons.push("vpn-signature");
  }
  if (includesAny(PROXY_KEYWORDS)) {
    score += 2;
    if (proxyType === "unknown") proxyType = "hosting-proxy";
    reasons.push("proxy-signature");
  }
  if (signals.hosting && includesAny(DATACENTER_KEYWORDS)) {
    score += 2;
    if (proxyType === "unknown") proxyType = "hosting-proxy";
    reasons.push("datacenter-signature");
  }

  if (signals.mobile || includesAny(RESIDENTIAL_KEYWORDS)) {
    score -= 3;
    reasons.push("residential-or-mobile-signal");
  }

  const isProxy = score >= 4 || proxyType === "tor";
  const confidence: ProxyAssessment["confidence"] = !isProxy
    ? "none"
    : score >= 7
      ? "high"
      : score >= 5
        ? "medium"
        : "low";

  return { isProxy, proxyType, confidence, reasons };
}

export function detectConnectionType(
  signals: Pick<NetworkSignals, "isp" | "org" | "as" | "mobile" | "hosting"> & {
    proxy: boolean;
    proxyType?: ProxyType;
  },
): ConnectionType {
  const combined = combineSignals(signals);
  const hasAnyKeyword = (keywords: string[]) => keywords.some((keyword) => combined.includes(keyword));

  if (signals.hosting) return "datacenter";
  if (signals.proxy) {
    if (signals.proxyType === "tor") return "tor";
    if (signals.proxyType === "vpn") return "vpn";
    return "proxy";
  }
  if (signals.mobile) return "mobile";

  if (hasAnyKeyword(STARLINK_KEYWORDS)) return "starlink";
  if (hasAnyKeyword(SATELLITE_KEYWORDS)) return "satellite";
  if (hasAnyKeyword(FIBER_KEYWORDS)) return "fiber";
  if (hasAnyKeyword(CABLE_KEYWORDS)) return "cable";
  if (hasAnyKeyword(FIXED_WIRELESS_KEYWORDS)) return "fixed_wireless";
  if (hasAnyKeyword(DSL_KEYWORDS)) return "dsl";
  if (hasAnyKeyword(BUSINESS_KEYWORDS)) return "business";

  return "fixed";
}
