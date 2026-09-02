import type { ConnectionType } from "@/lib/connection-type";

/**
 * Evidence-based reputation model.
 *
 * Providers normalize their findings into `RawEvidence` items that carry the
 * semantics of the source (category, reason code, base weight, confidence,
 * freshness). `lib/reputation/scoring.ts` turns those into a deterministic,
 * traceable risk score. Connection characteristics (hosting, VPN, Tor, ...)
 * are context, never threat evidence: their weight is always zero.
 */

export type RiskLevel = "low" | "medium" | "high";

export type EvidenceCategory =
  | "mail_policy"
  | "mail_reputation"
  | "spam_observed"
  | "abuse_reported"
  | "scanner"
  | "bruteforce"
  | "web_attack"
  | "ddos"
  | "botnet"
  | "malware"
  | "proxy"
  | "vpn"
  | "tor"
  | "hosting"
  | "residential"
  | "mobile"
  | "benign_service";

export type EvidenceSeverity = "info" | "low" | "medium" | "high" | "critical";

export type SourceStatus =
  | "available"
  | "clean"
  | "matched"
  | "policy_listed"
  | "not_configured"
  | "unsupported"
  | "rate_limited"
  | "resolver_blocked"
  | "unavailable";

/** Categories that describe a connection, not malicious behavior. */
export const CONTEXT_CATEGORIES: ReadonlySet<EvidenceCategory> = new Set([
  "mail_policy",
  "vpn",
  "tor",
  "hosting",
  "residential",
  "mobile",
  "benign_service",
]);

/** Direct observations of malicious or abusive behavior. */
export const DIRECT_CATEGORIES: ReadonlySet<EvidenceCategory> = new Set([
  "botnet",
  "malware",
  "ddos",
  "bruteforce",
  "web_attack",
  "scanner",
  "spam_observed",
  "abuse_reported",
  "proxy",
]);

/** Mail-flow related categories shown in their own section. */
export const MAIL_CATEGORIES: ReadonlySet<EvidenceCategory> = new Set([
  "mail_policy",
  "mail_reputation",
  "spam_observed",
]);

/**
 * Evidence as produced by a provider parser. `weight` is the base risk
 * contribution (0-100) before confidence and freshness factors; `freshness`
 * (0-1) is the parser's recency assessment of the finding.
 */
export interface RawEvidence {
  sourceId: string;
  category: EvidenceCategory;
  /** Stable code resolved to an explanation via lib/tool-i18n.ts. */
  reason: string;
  /** Base points before factors; zero for policy and context categories. */
  weight: number;
  /** 0-100 source-specific confidence in this finding. */
  confidence: number;
  /** 0-1 recency assessment; 1 means the finding reflects current state. */
  freshness: number;
  firstSeen?: string | null;
  lastSeen?: string | null;
  reportCount?: number | null;
  attackCount?: number | null;
  malwareFamily?: string | null;
  /** Locale-neutral source detail (service names, SBL ids, CIDRs). */
  detail?: string | null;
  /** Original DNS answer or provider code, kept for transparency. */
  raw?: string | null;
}

export interface EvidenceItem extends RawEvidence {
  severity: EvidenceSeverity;
  /** Raw observation strength (weight x confidence x freshness + bonus). */
  points: number;
  /**
   * Score contribution after the independence-group discount (strongest
   * signal per provider family counts fully, correlated ones half).
   * Per-source point totals sum these, so they reconcile with the score
   * (before corroboration bonuses and the 100-point cap).
   */
  adjustedPoints: number;
}

export interface SourceResult {
  id: string;
  status: SourceStatus;
}

export interface ReputationSourceDefinition {
  id: string;
  name: string;
  kind: "dnsbl" | "api" | "feed" | "metadata";
  supportsIpv6: boolean;
  /** Environment variable that enables this optional source. */
  optionalKeyEnv?: string;
  /** Correlated datasets share a group so they are not double counted. */
  independenceGroup: string;
  docsUrl: string;
}

export const REPUTATION_SOURCES: ReputationSourceDefinition[] = [
  {
    id: "spamhaus-zen",
    name: "Spamhaus ZEN",
    kind: "dnsbl",
    supportsIpv6: true,
    independenceGroup: "spamhaus",
    docsUrl: "https://www.spamhaus.org/blocklists/spamhaus-zen/",
  },
  {
    id: "spamhaus-drop",
    name: "Spamhaus DROP",
    kind: "feed",
    supportsIpv6: true,
    independenceGroup: "spamhaus",
    docsUrl: "https://www.spamhaus.org/blocklists/do-not-route-or-peer/",
  },
  {
    id: "spamcop",
    name: "SpamCop",
    kind: "dnsbl",
    supportsIpv6: false,
    independenceGroup: "spamcop",
    docsUrl: "https://www.spamcop.net/bl.shtml",
  },
  {
    id: "barracuda",
    name: "Barracuda BRBL",
    kind: "dnsbl",
    supportsIpv6: false,
    independenceGroup: "barracuda",
    docsUrl: "https://www.barracudacentral.org/lookups",
  },
  {
    id: "dronebl",
    name: "DroneBL",
    kind: "dnsbl",
    supportsIpv6: true,
    independenceGroup: "dronebl",
    docsUrl: "https://dronebl.org/docs/howtouse",
  },
  {
    id: "blocklist-de",
    name: "blocklist.de",
    kind: "api",
    supportsIpv6: false,
    independenceGroup: "blocklist-de",
    docsUrl: "https://www.blocklist.de/en/api.html",
  },
  {
    id: "feodo-tracker",
    name: "Feodo Tracker",
    kind: "feed",
    supportsIpv6: false,
    independenceGroup: "abuse.ch",
    docsUrl: "https://feodotracker.abuse.ch/",
  },
  {
    id: "greynoise",
    name: "GreyNoise",
    kind: "api",
    supportsIpv6: false,
    optionalKeyEnv: "GREYNOISE_API_KEY",
    independenceGroup: "greynoise",
    docsUrl: "https://docs.greynoise.io/docs/using-the-greynoise-community-api",
  },
  {
    id: "abuseipdb",
    name: "AbuseIPDB",
    kind: "api",
    supportsIpv6: true,
    optionalKeyEnv: "ABUSEIPDB_API_KEY",
    independenceGroup: "abuseipdb",
    docsUrl: "https://docs.abuseipdb.com/",
  },
  {
    id: "httpbl",
    name: "Project Honey Pot http:BL",
    kind: "dnsbl",
    supportsIpv6: false,
    optionalKeyEnv: "HTTPBL_ACCESS_KEY",
    independenceGroup: "honeypot",
    docsUrl: "https://www.projecthoneypot.org/httpbl_api.php",
  },
  {
    id: "threatfox",
    name: "ThreatFox",
    kind: "api",
    supportsIpv6: true,
    optionalKeyEnv: "THREATFOX_AUTH_KEY",
    independenceGroup: "abuse.ch",
    docsUrl: "https://threatfox.abuse.ch/api/",
  },
  {
    id: "ip-api",
    name: "ip-api.com",
    kind: "metadata",
    supportsIpv6: true,
    independenceGroup: "metadata",
    docsUrl: "https://ip-api.com/",
  },
];

export function getReputationSource(id: string): ReputationSourceDefinition | undefined {
  return REPUTATION_SOURCES.find((source) => source.id === id);
}

export interface ReputationGeo {
  country: string;
  countryCode: string;
  region: string;
  city: string;
}

export interface ReputationNetwork {
  as: string;
  asname: string;
  isp: string;
  org: string;
}

/** Connection characteristics, shown as context and never scored as risk. */
export interface NetworkContext {
  connectionType: ConnectionType;
  hosting: boolean;
  mobile: boolean;
  proxy: boolean;
  tor: boolean;
  /** Heuristic residential estimate from connection type and reverse DNS. */
  residentialEstimated: boolean;
  reverse: string | null;
}

export interface ReputationCoverage {
  checkedCount: number;
  matchedCount: number;
  policyCount: number;
  cleanCount: number;
  unavailableCount: number;
  skippedCount: number;
}

export interface ScoreContribution {
  sourceId: string;
  sourceName: string;
  category: EvidenceCategory;
  reason: string;
  points: number;
}

export type ReputationHeadline =
  | "no_malicious_activity"
  | "low_risk"
  | "medium_risk"
  | "high_risk";

export interface ReputationSummary {
  ip: string;
  score: number;
  level: RiskLevel;
  headline: ReputationHeadline;
  evidence: EvidenceItem[];
  contributions: ScoreContribution[];
  threatCategories: EvidenceCategory[];
  mailCategories: EvidenceCategory[];
  contextCategories: EvidenceCategory[];
  networkContext: NetworkContext | null;
  sources: SourceResult[];
  coverage: ReputationCoverage;
  geo: ReputationGeo | null;
  network: ReputationNetwork | null;
  checkedAt: string;
}

export function severityFromWeight(weight: number): EvidenceSeverity {
  if (weight >= 55) return "critical";
  if (weight >= 35) return "high";
  if (weight >= 18) return "medium";
  if (weight > 0) return "low";
  return "info";
}
