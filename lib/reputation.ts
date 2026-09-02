import { isIPv6Address, stripIpv6Brackets } from "@/lib/network/target";

export type RiskLevel = "low" | "medium" | "high";

export type ThreatCategory =
  | "proxy_vpn"
  | "tor"
  | "hosting"
  | "spam_source"
  | "botnet"
  | "abuse_reported";

export interface BlacklistDefinition {
  id: string;
  name: string;
  zone: string;
  supportsIpv6: boolean;
}

export interface BlacklistStatus {
  id: string;
  name: string;
  listed: boolean;
  checked: boolean;
  categories: ThreatCategory[];
}

export type AbuseSourceStatus = "available" | "not_configured" | "unavailable";

export interface AbuseSummary {
  status: AbuseSourceStatus;
  confidenceScore: number | null;
  totalReports: number | null;
  lastReportedAt: string | null;
}

export interface ReputationSummary {
  ip: string;
  score: number;
  level: RiskLevel;
  categories: ThreatCategory[];
  blacklists: BlacklistStatus[];
  listedCount: number;
  checkedCount: number;
  abuse: AbuseSummary;
  geo: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
  } | null;
  network: {
    as: string;
    asname: string;
    isp: string;
    org: string;
  } | null;
  flags: {
    proxy: boolean;
    hosting: boolean;
    mobile: boolean;
  };
  checkedAt: string;
}

export const REPUTATION_BLACKLISTS: BlacklistDefinition[] = [
  { id: "spamhaus-zen", name: "Spamhaus ZEN", zone: "zen.spamhaus.org", supportsIpv6: true },
  { id: "spamcop", name: "SpamCop", zone: "bl.spamcop.net", supportsIpv6: false },
  { id: "barracuda", name: "Barracuda", zone: "b.barracudacentral.org", supportsIpv6: false },
];

export function reverseIpv4ForDnsbl(ip: string): string {
  return ip.split(".").reverse().join(".");
}

export function ipv6ToNibbleFormat(ip: string): string | null {
  let address = stripIpv6Brackets(ip).toLowerCase();
  if (!isIPv6Address(address)) return null;

  // Convert an embedded IPv4 tail (for example ::ffff:1.2.3.4) into hex groups.
  const v4Match = address.match(/^(.*):(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4Match) {
    const octets = v4Match[2].split(".").map(Number);
    if (octets.some((octet) => octet > 255)) return null;
    const hex = octets.map((octet) => octet.toString(16).padStart(2, "0"));
    address = `${v4Match[1]}:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`;
  }

  const [head, tail = ""] = address.split("::");
  const headParts = head ? head.split(":").filter(Boolean) : [];
  const tailParts = tail ? tail.split(":").filter(Boolean) : [];
  const missing = 8 - headParts.length - tailParts.length;
  if (missing < 0) return null;

  const groups = [...headParts, ...Array.from({ length: missing }, () => "0"), ...tailParts];
  if (groups.length !== 8) return null;

  return groups
    .map((group) => group.padStart(4, "0"))
    .join("")
    .split("")
    .reverse()
    .join(".");
}

export interface DnsblInterpretation {
  listed: boolean;
  /** The DNSBL refused the query (for example Spamhaus via a public resolver). */
  blocked: boolean;
  categories: ThreatCategory[];
}

export function interpretDnsblResponse(zone: string, records: string[]): DnsblInterpretation {
  const valid = records.filter((record) => record.startsWith("127."));

  // A non-127/8 answer means wildcarding or DNS interference; do not trust it.
  if (!valid.length) {
    return { listed: false, blocked: records.length > 0, categories: [] };
  }

  if (zone.endsWith("spamhaus.org")) {
    if (valid.some((record) => record.startsWith("127.255."))) {
      return { listed: false, blocked: true, categories: [] };
    }

    const codes = valid
      .filter((record) => record.startsWith("127.0.0."))
      .map((record) => Number(record.split(".").pop()));

    const categories: ThreatCategory[] = [];
    if (codes.some((code) => code === 2 || code === 3 || code === 9)) {
      categories.push("spam_source");
    }
    if (codes.some((code) => code >= 4 && code <= 7)) {
      categories.push("botnet");
    }

    // PBL-only answers (127.0.0.10/11) flag dynamic/policy ranges, not bad actors.
    return { listed: categories.length > 0, blocked: false, categories };
  }

  return { listed: true, blocked: false, categories: ["spam_source"] };
}

export interface ReputationSignals {
  blacklists: BlacklistStatus[];
  abuseConfidence: number | null;
  abuseReports: number | null;
  proxy: boolean;
  hosting: boolean;
  tor: boolean;
}

export function aggregateReputation(signals: ReputationSignals): {
  score: number;
  level: RiskLevel;
  categories: ThreatCategory[];
} {
  const listedCount = signals.blacklists.filter((entry) => entry.listed).length;

  let score = 0;
  if (listedCount > 0) {
    score += Math.min(60, 30 * listedCount);
  }
  if (typeof signals.abuseConfidence === "number") {
    score += Math.round(Math.min(100, Math.max(0, signals.abuseConfidence)) * 0.3);
  }
  if (signals.tor) {
    score += 25;
  } else if (signals.proxy) {
    score += 15;
  }
  if (signals.hosting) {
    score += 5;
  }
  score = Math.min(100, score);

  const categories = new Set<ThreatCategory>();
  for (const entry of signals.blacklists) {
    for (const category of entry.categories) {
      categories.add(category);
    }
  }
  if (signals.tor) {
    categories.add("tor");
  } else if (signals.proxy) {
    categories.add("proxy_vpn");
  }
  if (signals.hosting) categories.add("hosting");
  if ((signals.abuseConfidence ?? 0) >= 25 || (signals.abuseReports ?? 0) >= 3) {
    categories.add("abuse_reported");
  }

  const level: RiskLevel = score >= 60 ? "high" : score >= 25 ? "medium" : "low";

  return { score, level, categories: [...categories] };
}
