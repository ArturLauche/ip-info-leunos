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

export type ProxyHintConfidence = "low" | "medium" | "high";

export type ProxyHintCategory =
  | "enterprise-proxy"
  | "school-proxy"
  | "security-gateway"
  | "local-proxy"
  | "transparent-proxy"
  | "generic-proxy"
  | "unknown";

export interface ProxyHintAssessment {
  detected: boolean;
  confidence: ProxyHintConfidence;
  category: ProxyHintCategory;
  reasons: string[];
  labels: string[];
}

export interface ProxyHintSignal {
  points: number;
  reason: string;
  label: string;
  category: ProxyHintCategory;
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

export interface ProxyHintNetworkSignals {
  isp: string;
  org: string;
  as: string;
  asname?: string;
  reverse?: string;
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

const PROXY_HINT_CATEGORY_ORDER: ProxyHintCategory[] = [
  "security-gateway",
  "school-proxy",
  "enterprise-proxy",
  "transparent-proxy",
  "local-proxy",
  "generic-proxy",
  "unknown",
];

const PROXY_HINT_SIGNATURES: Array<{
  keywords: string[];
  label: string;
  category: ProxyHintCategory;
}> = [
  { keywords: ["zscaler"], label: "Zscaler", category: "security-gateway" },
  { keywords: ["netskope"], label: "Netskope", category: "security-gateway" },
  { keywords: ["bluecoat"], label: "Blue Coat", category: "security-gateway" },
  { keywords: ["symantec"], label: "Symantec", category: "security-gateway" },
  { keywords: ["broadcom"], label: "Broadcom", category: "security-gateway" },
  { keywords: ["squid"], label: "Squid", category: "transparent-proxy" },
  { keywords: ["forcepoint"], label: "Forcepoint", category: "security-gateway" },
  { keywords: ["websense"], label: "Websense", category: "security-gateway" },
  { keywords: ["fortigate", "fortinet"], label: "Fortinet", category: "security-gateway" },
  { keywords: ["palo alto", "paloalto"], label: "Palo Alto", category: "security-gateway" },
  { keywords: ["globalprotect"], label: "GlobalProtect", category: "security-gateway" },
  { keywords: ["cisco umbrella", "umbrella"], label: "Cisco Umbrella", category: "security-gateway" },
  { keywords: ["barracuda"], label: "Barracuda", category: "security-gateway" },
  { keywords: ["iboss"], label: "iboss", category: "school-proxy" },
  { keywords: ["smoothwall"], label: "Smoothwall", category: "school-proxy" },
  { keywords: ["lightspeed"], label: "Lightspeed", category: "school-proxy" },
  { keywords: ["sophos"], label: "Sophos", category: "security-gateway" },
  { keywords: ["mimecast"], label: "Mimecast", category: "security-gateway" },
  { keywords: ["proofpoint"], label: "Proofpoint", category: "security-gateway" },
  {
    keywords: ["cloudflare gateway", "cloudflare warp"],
    label: "Cloudflare Gateway",
    category: "security-gateway",
  },
];

const PROXY_HINT_NETWORK_TERMS: Array<{
  keyword: string;
  label: string;
  category: ProxyHintCategory;
}> = [
  { keyword: "secure web gateway", label: "secure web gateway", category: "security-gateway" },
  { keyword: "webfilter", label: "web filter", category: "security-gateway" },
  { keyword: "content filter", label: "content filter", category: "security-gateway" },
  { keyword: "secure web", label: "secure web", category: "security-gateway" },
  { keyword: "firewall", label: "firewall", category: "security-gateway" },
  { keyword: "gateway", label: "gateway", category: "enterprise-proxy" },
  { keyword: "proxy", label: "proxy", category: "generic-proxy" },
  { keyword: "socks", label: "SOCKS-style proxy", category: "local-proxy" },
  { keyword: "cache", label: "cache", category: "transparent-proxy" },
  { keyword: "relay", label: "relay", category: "transparent-proxy" },
  { keyword: "swg", label: "secure web gateway", category: "security-gateway" },
];

const SCHOOL_CONTEXT_KEYWORDS = [
  "school",
  "university",
  "college",
  "campus",
  "education",
  "edu",
  "district",
  "schule",
  "gymnasium",
];

const ENTERPRISE_CONTEXT_KEYWORDS = [
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

function combineSignals(signals: Pick<NetworkSignals, "isp" | "org" | "as">) {
  return `${signals.isp || ""} ${signals.org || ""} ${signals.as || ""}`.toLowerCase();
}

function normalizeProxyHintText(value: string) {
  return value.toLowerCase().replace(/[_-]+/g, " ");
}

function includesProxyHintTerm(normalizedText: string, keyword: string) {
  if (keyword === "edu") return /\bedu\b/.test(normalizedText);
  return normalizedText.includes(keyword);
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createEmptyProxyHintAssessment(): ProxyHintAssessment {
  return {
    detected: false,
    confidence: "low",
    category: "unknown",
    reasons: [],
    labels: [],
  };
}

export function getProxyHintSignatureMatches(value: string) {
  const normalized = normalizeProxyHintText(value);

  return PROXY_HINT_SIGNATURES.filter((signature) =>
    signature.keywords.some((keyword) => normalized.includes(keyword)),
  );
}

export function summarizeProxyHintSignals(
  signals: ProxyHintSignal[],
  options: { detectAnySignalAsLow?: boolean } = {},
): ProxyHintAssessment {
  const uniqueSignals = uniqueBy(
    signals.filter((signal) => signal.points > 0),
    (signal) => `${signal.reason}:${signal.label}`,
  );
  const score = uniqueSignals.reduce((total, signal) => total + signal.points, 0);

  const confidence: ProxyHintConfidence | null =
    score >= 70
      ? "high"
      : score >= 45
        ? "medium"
        : score >= 25 || (options.detectAnySignalAsLow && score > 0)
          ? "low"
          : null;

  if (!confidence) return createEmptyProxyHintAssessment();

  const categoryScores = new Map<ProxyHintCategory, number>();
  for (const signal of uniqueSignals) {
    categoryScores.set(
      signal.category,
      (categoryScores.get(signal.category) ?? 0) + signal.points,
    );
  }

  const category =
    [...categoryScores.entries()].sort((a, b) => {
      const scoreDelta = b[1] - a[1];
      if (scoreDelta !== 0) return scoreDelta;
      return (
        PROXY_HINT_CATEGORY_ORDER.indexOf(a[0]) -
        PROXY_HINT_CATEGORY_ORDER.indexOf(b[0])
      );
    })[0]?.[0] ?? "unknown";

  return {
    detected: true,
    confidence,
    category,
    reasons: uniqueBy(uniqueSignals.map((signal) => signal.reason), (reason) => reason),
    labels: uniqueBy(uniqueSignals.map((signal) => signal.label), (label) => label),
  };
}

export function getNetworkProxyHintSignals(signals: ProxyHintNetworkSignals): ProxyHintSignal[] {
  const combined = normalizeProxyHintText(
    `${signals.isp || ""} ${signals.org || ""} ${signals.as || ""} ${signals.asname || ""} ${
      signals.reverse || ""
    }`,
  );
  const hintSignals: ProxyHintSignal[] = [];
  const signatureMatches = getProxyHintSignatureMatches(combined);
  const networkTermMatches = PROXY_HINT_NETWORK_TERMS.filter((term) =>
    includesProxyHintTerm(combined, term.keyword),
  );

  for (const signature of signatureMatches) {
    hintSignals.push({
      points: 25,
      reason: `metadata-product-signature:${signature.keywords[0]}`,
      label: `${signature.label} signature`,
      category: signature.category,
    });
  }

  if (networkTermMatches.length > 0) {
    const strongestTerm = networkTermMatches[0];
    hintSignals.push({
      points: 25,
      reason: `metadata-network-signature:${strongestTerm.keyword}`,
      label: `${strongestTerm.label} signature`,
      category: strongestTerm.category,
    });
  }

  const hasSchoolContext = SCHOOL_CONTEXT_KEYWORDS.some((keyword) =>
    includesProxyHintTerm(combined, keyword),
  );
  const hasEnterpriseContext = ENTERPRISE_CONTEXT_KEYWORDS.some((keyword) =>
    includesProxyHintTerm(combined, keyword),
  );

  if ((hasSchoolContext || hasEnterpriseContext) && (networkTermMatches.length > 0 || signatureMatches.length > 0)) {
    const contextCategory =
      signatureMatches[0]?.category ?? (hasSchoolContext ? "school-proxy" : "enterprise-proxy");
    hintSignals.push({
      points: 15,
      reason: hasSchoolContext
        ? "metadata-school-gateway-context"
        : "metadata-enterprise-gateway-context",
      label: hasSchoolContext ? "school gateway context" : "enterprise gateway context",
      category: contextCategory,
    });
  }

  return hintSignals;
}

export function assessNetworkProxyHints(signals: ProxyHintNetworkSignals): ProxyHintAssessment {
  return summarizeProxyHintSignals(getNetworkProxyHintSignals(signals));
}

export function mergeProxyHintAssessments(
  assessments: Array<ProxyHintAssessment | null | undefined>,
): ProxyHintAssessment {
  const detectedAssessments = assessments.filter(
    (assessment): assessment is ProxyHintAssessment => Boolean(assessment?.detected),
  );

  if (detectedAssessments.length === 0) return createEmptyProxyHintAssessment();

  const confidenceRank: Record<ProxyHintConfidence, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };
  const confidenceByRank: Record<number, ProxyHintConfidence> = {
    1: "low",
    2: "medium",
    3: "high",
  };
  const maxRank = Math.max(
    ...detectedAssessments.map((assessment) => confidenceRank[assessment.confidence]),
  );
  const mediumOrHigherCount = detectedAssessments.filter(
    (assessment) => confidenceRank[assessment.confidence] >= 2,
  ).length;
  const mergedRank =
    maxRank === 3
      ? 3
      : maxRank === 2 && mediumOrHigherCount >= 2
        ? 3
        : maxRank === 1 && detectedAssessments.length >= 2
          ? 2
          : maxRank;

  const categoryScores = new Map<ProxyHintCategory, number>();
  for (const assessment of detectedAssessments) {
    categoryScores.set(
      assessment.category,
      (categoryScores.get(assessment.category) ?? 0) + confidenceRank[assessment.confidence],
    );
  }
  const category =
    [...categoryScores.entries()].sort((a, b) => {
      const scoreDelta = b[1] - a[1];
      if (scoreDelta !== 0) return scoreDelta;
      return (
        PROXY_HINT_CATEGORY_ORDER.indexOf(a[0]) -
        PROXY_HINT_CATEGORY_ORDER.indexOf(b[0])
      );
    })[0]?.[0] ?? "unknown";

  return {
    detected: true,
    confidence: confidenceByRank[mergedRank],
    category,
    reasons: uniqueBy(
      detectedAssessments.flatMap((assessment) => assessment.reasons),
      (reason) => reason,
    ),
    labels: uniqueBy(
      detectedAssessments.flatMap((assessment) => assessment.labels),
      (label) => label,
    ),
  };
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
