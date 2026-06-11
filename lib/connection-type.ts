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

function combineSignals(signals: Pick<NetworkSignals, "isp" | "org" | "as">) {
  return `${signals.isp || ""} ${signals.org || ""} ${signals.as || ""}`.toLowerCase();
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
