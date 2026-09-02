import { isIPv6Address, stripIpv6Brackets } from "@/lib/network/target";

export type RiskLevel = "low" | "medium" | "high" | "critical";

/**
 * Structured evidence categories separating policy, mail reputation,
 * observed spam, active attacks, botnets, malware, and network roles.
 */
export type EvidenceCategory =
  | "mail_policy"
  | "mail_reputation"
  | "spam_observed"
  | "scanner"
  | "bruteforce"
  | "botnet"
  | "malware"
  | "proxy"
  | "vpn"
  | "tor"
  | "hosting"
  | "residential"
  | "mobile";

/**
 * Connection and network characteristics (not threat evidence).
 */
export type NetworkContextType =
  | "residential"
  | "business"
  | "mobile"
  | "hosting"
  | "vpn"
  | "proxy"
  | "tor"
  | "unknown";

/**
 * Explicit provider source statuses.
 */
export type SourceStatus =
  | "clean"
  | "matched"
  | "policy_listed"
  | "resolver_blocked"
  | "unsupported"
  | "not_configured"
  | "rate_limited"
  | "unavailable";

export type SourceType =
  | "dnsbl"
  | "threat_feed"
  | "abuse_database"
  | "scanner_intel";

export interface EvidenceItem {
  id: string;
  sourceId: string;
  sourceName: string;
  category: EvidenceCategory;
  severity: "info" | "low" | "medium" | "high" | "critical";
  title: string;
  summary: string;
  confidence?: number | null;
  reportsCount?: number | null;
  firstSeen?: string | null;
  lastSeen?: string | null;
  attackType?: string | null;
  family?: string | null;
  targetSubnet?: string | null;
  isPolicy?: boolean;
}

export interface ProviderSourceResult {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  supportsIpv6: boolean;
  statusMessage?: string;
  rawCodes?: string[];
  evidence: EvidenceItem[];
  responseTimeMs?: number;
}

export interface CoverageReport {
  totalSources: number;
  checkedCount: number;
  threatCount: number;
  policyCount: number;
  cleanCount: number;
  unavailableCount: number;
}

export interface NetworkContext {
  type: NetworkContextType;
  isResidential: boolean;
  isHosting: boolean;
  isMobile: boolean;
  isProxy: boolean;
  isVpn: boolean;
  isTor: boolean;
  isp: string;
  org: string;
  as: string;
  asname: string;
}

export interface ReputationSummary {
  ip: string;
  score: number; // 0 - 100
  level: RiskLevel;
  verdictTitle: string;
  verdictDescription: string;
  evidenceCategories: EvidenceCategory[];
  networkContext: NetworkContext;
  geo: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
  } | null;
  evidence: EvidenceItem[];
  sources: ProviderSourceResult[];
  coverage: CoverageReport;
  checkedAt: string;

  // Backward-compatibility fields
  categories: ThreatCategory[];
  blacklists: BlacklistStatus[];
  listedCount: number;
  checkedCount: number;
  abuse: AbuseSummary;
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
}

// Backward-compatibility definitions
export type ThreatCategory =
  | "proxy_vpn"
  | "tor"
  | "hosting"
  | "spam_source"
  | "botnet"
  | "abuse_reported"
  | "mail_policy"
  | "mail_reputation"
  | "bruteforce"
  | "scanner"
  | "malware";

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
  status?: SourceStatus;
  rawCodes?: string[];
  statusMessage?: string;
}

export type AbuseSourceStatus = "available" | "not_configured" | "unavailable";

export interface AbuseSummary {
  status: AbuseSourceStatus;
  confidenceScore: number | null;
  totalReports: number | null;
  lastReportedAt: string | null;
}

export const REPUTATION_BLACKLISTS: BlacklistDefinition[] = [
  { id: "spamhaus-zen", name: "Spamhaus ZEN", zone: "zen.spamhaus.org", supportsIpv6: true },
  { id: "dronebl", name: "DroneBL", zone: "dnsbl.dronebl.org", supportsIpv6: true },
  { id: "spamcop", name: "SpamCop", zone: "bl.spamcop.net", supportsIpv6: false },
  { id: "barracuda", name: "Barracuda BRBL", zone: "b.barracudacentral.org", supportsIpv6: false },
  { id: "blocklist-de", name: "blocklist.de", zone: "bl.blocklist.de", supportsIpv6: false },
];

export function reverseIpv4ForDnsbl(ip: string): string {
  return ip.split(".").reverse().join(".");
}

export function ipv6ToNibbleFormat(ip: string): string | null {
  const address = stripIpv6Brackets(ip).toLowerCase();
  if (!isIPv6Address(address)) return null;

  // Convert an embedded IPv4 tail (for example ::ffff:1.2.3.4) into hex groups.
  const v4Match = address.match(/^(.*):(\d{1,3}(?:\.\d{1,3}){3})$/);
  let norm = address;
  if (v4Match) {
    const octets = v4Match[2].split(".").map(Number);
    if (octets.some((octet) => octet > 255)) return null;
    const hex = octets.map((octet) => octet.toString(16).padStart(2, "0"));
    norm = `${v4Match[1]}:${hex[0]}${hex[1]}:${hex[2]}${hex[3]}`;
  }

  const [head, tail = ""] = norm.split("::");
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

/**
 * Decodes Spamhaus ZEN DNSBL response records.
 * Distinguishes SBL, CSS, XBL, DROP, PBL, and open-resolver blocking.
 */
export function decodeSpamhausZen(records: string[]): {
  status: SourceStatus;
  statusMessage: string;
  evidence: EvidenceItem[];
  rawCodes: string[];
} {
  const valid = records.filter((r) => r.startsWith("127."));
  if (!valid.length) {
    return {
      status: "clean",
      statusMessage: "Not listed in Spamhaus ZEN.",
      evidence: [],
      rawCodes: records,
    };
  }

  // 127.255.255.x indicates query refused due to open/public resolver
  if (valid.some((r) => r.startsWith("127.255.255."))) {
    return {
      status: "resolver_blocked",
      statusMessage:
        "Spamhaus blocked queries from open public DNS resolvers. Direct query not permitted without Spamhaus subscription.",
      evidence: [],
      rawCodes: valid,
    };
  }

  const codes = valid
    .filter((r) => r.startsWith("127.0.0."))
    .map((r) => Number(r.split(".").pop()));

  const evidence: EvidenceItem[] = [];

  // SBL: Direct spam operations (127.0.0.2)
  if (codes.includes(2)) {
    evidence.push({
      id: "spamhaus-sbl",
      sourceId: "spamhaus-zen",
      sourceName: "Spamhaus SBL",
      category: "spam_observed",
      severity: "high",
      title: "Spamhaus SBL Listed",
      summary: "Verified spam source or unsolicited bulk email operation listed in Spamhaus SBL.",
    });
  }

  // CSS: Snowshoe or compromised low-volume mail sender (127.0.0.3)
  if (codes.includes(3)) {
    evidence.push({
      id: "spamhaus-css",
      sourceId: "spamhaus-zen",
      sourceName: "Spamhaus CSS",
      category: "mail_reputation",
      severity: "medium",
      title: "Spamhaus CSS Listed",
      summary: "Snowshoe spamming or compromised sender listed in Spamhaus CSS.",
    });
  }

  // XBL: Exploits, 3rd-party exploits, worms, Trojan, botnet agents (127.0.0.4 - 127.0.0.7)
  if (codes.some((c) => c >= 4 && c <= 7)) {
    evidence.push({
      id: "spamhaus-xbl",
      sourceId: "spamhaus-zen",
      sourceName: "Spamhaus XBL",
      category: "botnet",
      severity: "high",
      title: "Spamhaus XBL Listed",
      summary: "Compromised machine or botnet agent running exploits, worms, or open proxies.",
    });
  }

  // DROP: Cybercriminal / hijacked networks (127.0.0.9)
  if (codes.includes(9)) {
    evidence.push({
      id: "spamhaus-drop-zen",
      sourceId: "spamhaus-zen",
      sourceName: "Spamhaus DROP",
      category: "malware",
      severity: "critical",
      title: "Spamhaus DROP Listed",
      summary: "Subnet operated or leased by professional cybercriminals or spammers.",
    });
  }

  // PBL: Policy Block List - end user, residential, or dynamic ranges (127.0.0.10 or 127.0.0.11)
  // CRITICAL: Policy listing only, contributes 0 threat score!
  if (codes.includes(10) || codes.includes(11)) {
    evidence.push({
      id: "spamhaus-pbl",
      sourceId: "spamhaus-zen",
      sourceName: "Spamhaus PBL",
      category: "mail_policy",
      severity: "info",
      isPolicy: true,
      title: "Mail Policy Listing (Spamhaus PBL)",
      summary:
        "End-user, broadband, or dynamic IP space not designated to send direct unauthenticated SMTP mail to external MX servers. Standard and normal for residential connections.",
    });
  }

  const hasMalicious = evidence.some((e) => !e.isPolicy && e.category !== "mail_policy");
  const hasPolicy = evidence.some((e) => e.isPolicy);

  let status: SourceStatus = "clean";
  let statusMessage = "Not listed in Spamhaus ZEN.";
  if (hasMalicious) {
    status = "matched";
    statusMessage = "Threat evidence detected on Spamhaus ZEN.";
  } else if (hasPolicy) {
    status = "policy_listed";
    statusMessage = "Standard mail policy listing (PBL); no threat evidence.";
  }

  return { status, statusMessage, evidence, rawCodes: valid };
}

/**
 * Decodes SpamCop DNSBL response.
 */
export function decodeSpamCop(records: string[]): {
  status: SourceStatus;
  statusMessage: string;
  evidence: EvidenceItem[];
  rawCodes: string[];
} {
  const valid = records.filter((r) => r.startsWith("127."));
  if (!valid.length) {
    return {
      status: "clean",
      statusMessage: "Not listed on SpamCop.",
      evidence: [],
      rawCodes: records,
    };
  }

  const evidence: EvidenceItem[] = [
    {
      id: "spamcop-hit",
      sourceId: "spamcop",
      sourceName: "SpamCop",
      category: "mail_reputation",
      severity: "medium",
      title: "SpamCop Listing",
      summary: "Recent spam trap hits reported to SpamCop within the last 24 to 48 hours.",
    },
  ];

  return {
    status: "matched",
    statusMessage: "Recent spam reports on SpamCop.",
    evidence,
    rawCodes: valid,
  };
}

/**
 * Decodes Barracuda BRBL DNSBL response.
 */
export function decodeBarracuda(records: string[]): {
  status: SourceStatus;
  statusMessage: string;
  evidence: EvidenceItem[];
  rawCodes: string[];
} {
  const valid = records.filter((r) => r.startsWith("127."));
  if (!valid.length) {
    return {
      status: "clean",
      statusMessage: "Not listed on Barracuda BRBL.",
      evidence: [],
      rawCodes: records,
    };
  }

  const evidence: EvidenceItem[] = [
    {
      id: "barracuda-hit",
      sourceId: "barracuda",
      sourceName: "Barracuda BRBL",
      category: "mail_reputation",
      severity: "low",
      title: "Barracuda BRBL Listing",
      summary:
        "Listed on Barracuda Reputation Block List. Indicates historical email volume or poor mail reputation; frequently occurs on dynamically reassigned residential addresses.",
    },
  ];

  return {
    status: "matched",
    statusMessage: "Historical email reputation listing on Barracuda BRBL.",
    evidence,
    rawCodes: valid,
  };
}

/**
 * Decodes DroneBL DNSBL response.
 */
export function decodeDroneBl(records: string[]): {
  status: SourceStatus;
  statusMessage: string;
  evidence: EvidenceItem[];
  rawCodes: string[];
} {
  const valid = records.filter((r) => r.startsWith("127."));
  if (!valid.length) {
    return {
      status: "clean",
      statusMessage: "Not listed on DroneBL.",
      evidence: [],
      rawCodes: records,
    };
  }

  const evidence: EvidenceItem[] = [];
  const codes = valid.map((r) => Number(r.split(".").pop()));

  for (const code of codes) {
    switch (code) {
      case 3:
        evidence.push({
          id: "dronebl-3",
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "botnet",
          severity: "medium",
          title: "DroneBL: IRC Drone",
          summary: "Machine observed participating in unauthorized IRC networks.",
        });
        break;
      case 5:
        evidence.push({
          id: "dronebl-5",
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "botnet",
          severity: "high",
          title: "DroneBL: Bottler",
          summary: "Automated botnet agent or bottler detected.",
        });
        break;
      case 6:
      case 19:
        evidence.push({
          id: `dronebl-${code}`,
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "spam_observed",
          severity: "high",
          title: "DroneBL: Spambot",
          summary: "Spam-emitting worm, Trojan, or automated spambot observed.",
        });
        break;
      case 7:
        evidence.push({
          id: "dronebl-7",
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "botnet",
          severity: "high",
          title: "DroneBL: DDoS Drone",
          summary: "Observed participating in distributed denial-of-service (DDoS) attacks.",
        });
        break;
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        evidence.push({
          id: `dronebl-${code}`,
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "proxy",
          severity: "medium",
          title: "DroneBL: Open Proxy",
          summary: `Open proxy server detected (return code 127.0.0.${code}).`,
        });
        break;
      case 13:
        evidence.push({
          id: "dronebl-13",
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "bruteforce",
          severity: "medium",
          title: "DroneBL: Dictionary Attack",
          summary: "Observed conducting automated credential brute-force or dictionary attacks.",
        });
        break;
      case 15:
      case 16:
      case 18:
        evidence.push({
          id: `dronebl-${code}`,
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "malware",
          severity: "high",
          title: "DroneBL: Compromised System",
          summary: "Compromised router, web server, or autorooting worm infection observed.",
        });
        break;
      case 17:
        evidence.push({
          id: "dronebl-17",
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "botnet",
          severity: "critical",
          title: "DroneBL: Botnet Controller",
          summary: "Active botnet command and control (C2) server.",
        });
        break;
      default:
        evidence.push({
          id: `dronebl-${code}`,
          sourceId: "dronebl",
          sourceName: "DroneBL",
          category: "scanner",
          severity: "low",
          title: "DroneBL Listing",
          summary: `Reported on DroneBL (return code 127.0.0.${code}).`,
        });
        break;
    }
  }

  return {
    status: "matched",
    statusMessage: "Active abuse or botnet entry on DroneBL.",
    evidence,
    rawCodes: valid,
  };
}

/**
 * Decodes blocklist.de DNSBL & API data.
 */
export function decodeBlocklistDe(
  records: string[],
  httpData?: { attacks?: number; reports?: number } | null,
): {
  status: SourceStatus;
  statusMessage: string;
  evidence: EvidenceItem[];
  rawCodes: string[];
} {
  const valid = records.filter((r) => r.startsWith("127."));
  const hasHttpReports = (httpData?.attacks ?? 0) > 0;

  if (!valid.length && !hasHttpReports) {
    return {
      status: "clean",
      statusMessage: "Not listed on blocklist.de.",
      evidence: [],
      rawCodes: records,
    };
  }

  const attacks = httpData?.attacks ?? 1;
  const reports = httpData?.reports ?? 1;
  const codes = valid.map((r) => Number(r.split(".").pop()));

  let category: EvidenceCategory = "bruteforce";
  let attackType = "Brute-force / Abuse";

  if (codes.includes(2) || codes.includes(14) || codes.includes(6) || codes.includes(7) || codes.includes(10)) {
    category = "bruteforce";
    attackType = codes.includes(2) || codes.includes(14) ? "SSH Brute-force" : "Service Authentication Attack";
  } else if (codes.includes(3)) {
    category = "mail_reputation";
    attackType = "Postfix / Mail Abuse";
  } else if (codes.includes(15) || codes.includes(12) || codes.includes(17)) {
    category = "scanner";
    attackType = codes.includes(17) ? "SQL Injection Probe" : "Web Vulnerability Scan";
  } else if (codes.includes(16)) {
    category = "botnet";
    attackType = "DoS / Traffic Flood";
  } else if (codes.includes(9) || codes.includes(19)) {
    category = "spam_observed";
    attackType = "Mail Abuse / Spam";
  }

  const severity: EvidenceItem["severity"] = attacks >= 50 ? "high" : "medium";

  const evidence: EvidenceItem[] = [
    {
      id: "blocklist-de-attack",
      sourceId: "blocklist-de",
      sourceName: "blocklist.de",
      category,
      severity,
      title: `blocklist.de: ${attackType}`,
      summary: `Observed performing ${attackType.toLowerCase()} attacks within the past 48 hours (${attacks} attacks across ${reports} reports).`,
      reportsCount: attacks,
      attackType,
    },
  ];

  return {
    status: "matched",
    statusMessage: `${attacks} attacks observed on blocklist.de in the past 48 hours.`,
    evidence,
    rawCodes: valid,
  };
}

/**
 * Decodes Project Honey Pot HTTP:BL DNSBL response.
 * Format: 127.<days>.<threat_score>.<type>
 */
export function decodeHoneyPot(records: string[]): {
  status: SourceStatus;
  statusMessage: string;
  evidence: EvidenceItem[];
  rawCodes: string[];
} {
  const valid = records.filter((r) => r.startsWith("127."));
  if (!valid.length) {
    return {
      status: "clean",
      statusMessage: "Not listed in Project Honey Pot.",
      evidence: [],
      rawCodes: records,
    };
  }

  const parts = valid[0].split(".").map(Number);
  if (parts.length !== 4) {
    return {
      status: "matched",
      statusMessage: "Listed in Project Honey Pot.",
      evidence: [],
      rawCodes: valid,
    };
  }

  const daysSince = parts[1];
  const threatScore = parts[2];
  const visitorType = parts[3];

  if (visitorType === 0) {
    return {
      status: "clean",
      statusMessage: "Legitimate search engine crawler identified by Project Honey Pot.",
      evidence: [],
      rawCodes: valid,
    };
  }

  let category: EvidenceCategory = "scanner";
  let typeTitle = "Suspicious Visitor";
  if (visitorType & 4) {
    category = "spam_observed";
    typeTitle = "Comment Spammer";
  } else if (visitorType & 2) {
    category = "scanner";
    typeTitle = "Email Harvester";
  } else if (visitorType & 1) {
    category = "scanner";
    typeTitle = "Suspicious Scanner";
  }

  const severity: EvidenceItem["severity"] =
    threatScore >= 50 ? "high" : threatScore >= 20 ? "medium" : "low";

  const evidence: EvidenceItem[] = [
    {
      id: "honeypot-hit",
      sourceId: "project-honeypot",
      sourceName: "Project Honey Pot",
      category,
      severity,
      title: `Honey Pot: ${typeTitle}`,
      summary: `Identified as ${typeTitle.toLowerCase()} with threat score ${threatScore}/255. Last seen ${daysSince} day(s) ago.`,
      confidence: threatScore,
    },
  ];

  return {
    status: "matched",
    statusMessage: `Project Honey Pot: ${typeTitle} (score ${threatScore}).`,
    evidence,
    rawCodes: valid,
  };
}

/**
 * Preserved and enhanced legacy interpretation function.
 */
export interface DnsblInterpretation {
  listed: boolean;
  blocked: boolean;
  categories: ThreatCategory[];
}

export function interpretDnsblResponse(zone: string, records: string[]): DnsblInterpretation {
  const valid = records.filter((record) => record.startsWith("127."));
  if (!valid.length) {
    return { listed: false, blocked: records.length > 0, categories: [] };
  }

  if (zone.endsWith("spamhaus.org")) {
    const decoded = decodeSpamhausZen(records);
    if (decoded.status === "resolver_blocked") {
      return { listed: false, blocked: true, categories: [] };
    }
    const categories: ThreatCategory[] = decoded.evidence
      .filter((e) => !e.isPolicy)
      .map((e) => (e.category === "botnet" ? "botnet" : "spam_source"));
    return { listed: categories.length > 0, blocked: false, categories };
  }

  if (zone.endsWith("dronebl.org")) {
    const decoded = decodeDroneBl(records);
    const categories: ThreatCategory[] = decoded.evidence.map((e) =>
      e.category === "botnet" ? "botnet" : "spam_source",
    );
    return { listed: true, blocked: false, categories };
  }

  if (zone.endsWith("blocklist.de")) {
    const decoded = decodeBlocklistDe(records);
    return { listed: decoded.status === "matched", blocked: false, categories: ["abuse_reported"] };
  }

  if (zone.endsWith("barracudacentral.org")) {
    const decoded = decodeBarracuda(records);
    return { listed: decoded.status === "matched", blocked: false, categories: ["mail_reputation"] };
  }

  return { listed: true, blocked: false, categories: ["spam_source"] };
}

/**
 * Deterministic, evidence-based reputation scoring engine.
 *
 * Scoring Rules:
 * 1. Policy listings (e.g. Spamhaus PBL) contribute 0 threat points.
 * 2. Connection characteristics (residential, hosting, mobile, VPN, proxy, Tor) contribute 0 threat points.
 * 3. A single isolated mail reputation signal (e.g. Barracuda BRBL) contributes 10 points (Low Risk).
 * 4. Active botnet C2 (Feodo Tracker) or criminal network (Spamhaus DROP) contributes 50+ points.
 * 5. Direct abuse observations (blocklist.de SSH brute force, AbuseIPDB confidence) contribute 20-35 points.
 * 6. Multiple independent corroborating sources increase risk progressively.
 */
export function calculateReputationScore(
  evidence: EvidenceItem[],
  sources: ProviderSourceResult[],
  networkContext: NetworkContext,
): {
  score: number;
  level: RiskLevel;
  verdictTitle: string;
  verdictDescription: string;
} {
  // Filter threat evidence: exclude policy listings and informational items
  const threatEvidence = evidence.filter(
    (item) => !item.isPolicy && item.category !== "mail_policy" && item.severity !== "info",
  );

  const policyEvidence = evidence.filter(
    (item) => item.isPolicy || item.category === "mail_policy",
  );

  // Group threats by distinct source to prevent double-counting within the same provider
  const sourceThreats = new Map<string, EvidenceItem[]>();
  for (const item of threatEvidence) {
    const current = sourceThreats.get(item.sourceId) || [];
    current.push(item);
    sourceThreats.set(item.sourceId, current);
  }

  let baseScore = 0;
  let maxSeverity: "info" | "low" | "medium" | "high" | "critical" = "info";

  for (const items of sourceThreats.values()) {
    for (const item of items) {
      if (item.severity === "critical") maxSeverity = "critical";
      else if (item.severity === "high" && maxSeverity !== "critical") maxSeverity = "high";
      else if (
        item.severity === "medium" &&
        maxSeverity !== "critical" &&
        maxSeverity !== "high"
      ) {
        maxSeverity = "medium";
      } else if (item.severity === "low" && maxSeverity === "info") {
        maxSeverity = "low";
      }
    }
  }

  // Assign primary severity base score
  if (maxSeverity === "critical") {
    baseScore = 85;
  } else if (maxSeverity === "high") {
    baseScore = 60;
  } else if (maxSeverity === "medium") {
    baseScore = 25;
  } else if (maxSeverity === "low") {
    baseScore = 10;
  } else {
    baseScore = 0;
  }

  // Corroboration bonus: each additional independent source adds weight
  const independentCount = sourceThreats.size;
  if (independentCount > 1) {
    let extraPoints = 0;
    let counted = 0;
    for (const items of sourceThreats.values()) {
      counted++;
      if (counted === 1) continue; // Skip the primary source
      const hasCriticalOrHigh = items.some(
        (i) => i.severity === "critical" || i.severity === "high",
      );
      const hasMedium = items.some((i) => i.severity === "medium");
      if (hasCriticalOrHigh) extraPoints += 15;
      else if (hasMedium) extraPoints += 10;
      else extraPoints += 5;
    }
    baseScore += extraPoints;
  }

  const score = Math.min(100, Math.max(0, baseScore));
  const level: RiskLevel =
    score >= 80 ? "critical" : score >= 50 ? "high" : score >= 20 ? "medium" : "low";

  // Generate clear, explainable verdicts
  let verdictTitle = "No threats detected";
  let verdictDescription =
    "No blocklist entries, active abuse reports, or malware signals were found for this IP address.";

  if (threatEvidence.length === 0) {
    if (policyEvidence.length > 0) {
      verdictTitle = "No malicious activity (Mail policy listing)";
      verdictDescription =
        "This IP address is in an end-user / residential broadband range. As expected for residential connections, direct unauthenticated SMTP delivery is restricted by policy (Spamhaus PBL).";
    } else if (networkContext.isTor) {
      verdictTitle = "Tor exit node (No abuse detected)";
      verdictDescription =
        "Identified as an active Tor network relay. No recent attacks, abuse reports, or malware activities were recorded.";
    } else if (networkContext.isVpn || networkContext.isProxy) {
      verdictTitle = "VPN / Proxy (No abuse detected)";
      verdictDescription =
        "Identified as a VPN or proxy server. No malicious activities or abuse reports are associated with this address.";
    } else if (networkContext.isHosting) {
      verdictTitle = "Datacenter / Hosting (Clean)";
      verdictDescription =
        "Belongs to a datacenter or cloud hosting provider. No abuse or threat evidence was detected.";
    } else if (networkContext.isResidential) {
      verdictTitle = "Clean residential IP";
      verdictDescription =
        "Identified as a regular residential connection. No threat listings or abuse reports were found.";
    }
  } else if (level === "low") {
    const isBarracudaOnly =
      sourceThreats.size === 1 && sourceThreats.has("barracuda");
    if (isBarracudaOnly) {
      verdictTitle = "Low risk (Mail reputation note)";
      verdictDescription =
        "A historical email reputation entry was observed on Barracuda BRBL. No corroborating abuse reports, spam traps, or malware activities were detected.";
    } else {
      verdictTitle = "Low risk";
      verdictDescription =
        "Minor reputation signals observed without evidence of active attacks or malicious infrastructure.";
    }
  } else if (level === "medium") {
    const hasBruteforce = threatEvidence.some((e) => e.category === "bruteforce");
    const hasSpam = threatEvidence.some((e) => e.category === "spam_observed");
    if (hasBruteforce) {
      verdictTitle = "Medium risk (Recent brute-force attacks)";
      verdictDescription =
        "Recent authentication brute-force attacks or scanning activities were reported for this IP address.";
    } else if (hasSpam) {
      verdictTitle = "Medium risk (Spam reports)";
      verdictDescription =
        "Recent spam emissions or spam trap hits were observed across reputable mail security feeds.";
    } else {
      verdictTitle = "Medium risk";
      verdictDescription =
        "Suspicious scanning or reputation anomalies were detected across monitored security feeds.";
    }
  } else {
    // High risk
    const hasFeodo = threatEvidence.some((e) => e.sourceId === "feodo-tracker");
    const hasDrop = threatEvidence.some((e) => e.sourceId === "spamhaus-drop");
    const hasBotnet = threatEvidence.some((e) => e.category === "botnet");
    const hasBruteforce = threatEvidence.some((e) => e.category === "bruteforce");

    if (hasFeodo) {
      verdictTitle = "High risk: Active Botnet C2 Server";
      verdictDescription =
        "Confirmed high-confidence botnet command and control (C2) infrastructure identified by abuse.ch Feodo Tracker.";
    } else if (hasDrop) {
      verdictTitle = "High risk: Hijacked / Criminal Network";
      verdictDescription =
        "Part of an allocated subnet operated or hijacked by professional cybercriminals (Spamhaus DROP).";
    } else if (hasBotnet) {
      verdictTitle = "High risk: Active Botnet / Compromised System";
      verdictDescription =
        "Multiple high-confidence security sources report this machine participating in botnet operations or malware attacks.";
    } else if (hasBruteforce) {
      verdictTitle = "High risk: Automated Brute-Force & Attack Source";
      verdictDescription =
        "Multiple independent threat feeds confirm repeated authentication brute-force attacks and abuse.";
    } else {
      verdictTitle = "High risk: Malicious Activity Detected";
      verdictDescription =
        "Multiple independent threat sources corroborate active malicious attacks, spam emissions, or brute-force behavior.";
    }
  }

  return { score, level, verdictTitle, verdictDescription };
}

/**
 * Legacy aggregateReputation function preserved for backward compatibility.
 */
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
  const dummyEvidence: EvidenceItem[] = [];
  const dummySources: ProviderSourceResult[] = [];

  for (let idx = 0; idx < signals.blacklists.length; idx++) {
    const entry = signals.blacklists[idx];
    if (entry.listed) {
      const isPolicy = entry.categories.includes("mail_policy");
      const category: EvidenceCategory = isPolicy
        ? "mail_policy"
        : entry.categories.includes("botnet")
          ? "botnet"
          : (entry.categories[0] as EvidenceCategory) || "spam_observed";
      const severity = isPolicy
        ? "info"
        : entry.categories.includes("botnet")
          ? "high"
          : "medium";

      dummyEvidence.push({
        id: `${entry.id}-${idx}`,
        sourceId: `${entry.id}-${idx}`,
        sourceName: entry.name,
        category,
        severity,
        isPolicy,
        title: entry.name,
        summary: `Listed on ${entry.name}`,
      });
      dummySources.push({
        id: `${entry.id}-${idx}`,
        name: entry.name,
        type: "dnsbl",
        status: isPolicy ? "policy_listed" : "matched",
        supportsIpv6: true,
        evidence: [],
      });
    }
  }

  if (signals.abuseConfidence && signals.abuseConfidence >= 25) {
    dummyEvidence.push({
      id: "abuseipdb",
      sourceId: "abuseipdb",
      sourceName: "AbuseIPDB",
      category: "bruteforce",
      severity: signals.abuseConfidence >= 75 ? "high" : "medium",
      title: "AbuseIPDB Reports",
      summary: `Confidence: ${signals.abuseConfidence}%`,
    });
  }

  const networkContext: NetworkContext = {
    type: signals.tor
      ? "tor"
      : signals.proxy
        ? "proxy"
        : signals.hosting
          ? "hosting"
          : "residential",
    isResidential: !signals.hosting && !signals.tor && !signals.proxy,
    isHosting: signals.hosting,
    isMobile: false,
    isProxy: signals.proxy,
    isVpn: signals.proxy,
    isTor: signals.tor,
    isp: "",
    org: "",
    as: "",
    asname: "",
  };

  const { score, level } = calculateReputationScore(
    dummyEvidence,
    dummySources,
    networkContext,
  );

  const categories = new Set<ThreatCategory>();
  for (const item of dummyEvidence) {
    if (!item.isPolicy) {
      categories.add(item.category as ThreatCategory);
    }
  }
  if (signals.tor) categories.add("tor");
  if (signals.proxy && !signals.tor) categories.add("proxy_vpn");
  if (signals.hosting) categories.add("hosting");

  return { score, level, categories: [...categories] };
}
