import { z } from "zod";
import type { RawEvidence } from "./model";
import type { DnsblInterpretation } from "./dnsbl";

/** Pure payload normalizers for the HTTP-based reputation providers. */

const greyNoiseSchema = z
  .object({
    ip: z.string().optional(),
    noise: z.boolean().optional(),
    riot: z.boolean().optional(),
    classification: z.string().optional(),
    name: z.string().optional(),
    link: z.string().optional(),
    last_seen: z.string().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export interface GreyNoiseResult {
  noise: boolean;
  riot: boolean;
  classification: string | null;
  name: string | null;
  lastSeen: string | null;
}

export function normalizeGreyNoisePayload(payload: unknown): GreyNoiseResult | null {
  const parsed = greyNoiseSchema.safeParse(payload);
  if (!parsed.success) return null;

  return {
    noise: Boolean(parsed.data.noise),
    riot: Boolean(parsed.data.riot),
    classification: parsed.data.classification ?? null,
    name: parsed.data.name ?? null,
    lastSeen: parsed.data.last_seen ?? null,
  };
}

/**
 * GreyNoise observes Internet-wide scanning. `noise` means the IP was seen
 * scanning within the last 90 days; the classification separates malicious
 * from unknown or benign (research) scanners. RIOT entries are known common
 * business services and are pure context.
 */
export function greyNoiseEvidence(result: GreyNoiseResult, nowMs: number): DnsblInterpretation {
  if (!result.noise && !result.riot) {
    return { status: "clean", evidence: [] };
  }

  const lastSeenMs = result.lastSeen ? Date.parse(result.lastSeen) : null;
  const ageDays = lastSeenMs === null ? null : (nowMs - lastSeenMs) / 86_400_000;
  const freshness = ageDays === null ? 0.5 : ageDays <= 7 ? 1 : ageDays <= 30 ? 0.85 : 0.6;
  const evidence: RawEvidence[] = [];

  if (result.noise) {
    const classification = (result.classification ?? "unknown").toLowerCase();
    if (classification === "malicious") {
      evidence.push({
        sourceId: "greynoise",
        category: "scanner",
        reason: "greynoise_scanner_malicious",
        weight: 20,
        confidence: 80,
        freshness,
        lastSeen: result.lastSeen,
      });
    } else if (classification === "benign") {
      evidence.push({
        sourceId: "greynoise",
        category: "scanner",
        reason: "greynoise_scanner_benign",
        weight: 0,
        confidence: 80,
        freshness,
        lastSeen: result.lastSeen,
      });
    } else {
      evidence.push({
        sourceId: "greynoise",
        category: "scanner",
        reason: "greynoise_scanner_unknown",
        weight: 12,
        confidence: 55,
        freshness,
        lastSeen: result.lastSeen,
      });
    }
  }

  if (result.riot) {
    evidence.push({
      sourceId: "greynoise",
      category: "benign_service",
      reason: "greynoise_riot",
      weight: 0,
      confidence: 85,
      freshness: 1,
      detail: result.name && result.name !== "unknown" ? `RIOT: ${result.name}` : null,
    });
  }

  const hasThreat = evidence.some((item) => item.weight > 0);
  return {
    status: hasThreat ? "matched" : evidence.length > 0 ? "policy_listed" : "clean",
    evidence,
  };
}

const abuseIpDbSchema = z
  .object({
    data: z
      .object({
        abuseConfidenceScore: z.number().optional(),
        totalReports: z.number().optional(),
        lastReportedAt: z.string().nullable().optional(),
        isTor: z.boolean().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export interface AbuseIpDbResult {
  confidenceScore: number;
  totalReports: number;
  lastReportedAt: string | null;
  isTor: boolean;
}

export function normalizeAbuseIpDbPayload(payload: unknown): AbuseIpDbResult | null {
  const parsed = abuseIpDbSchema.safeParse(payload);
  if (!parsed.success) return null;

  const data = parsed.data.data;
  return {
    confidenceScore: data.abuseConfidenceScore ?? 0,
    totalReports: data.totalReports ?? 0,
    lastReportedAt: data.lastReportedAt || null,
    isTor: Boolean(data.isTor),
  };
}

/**
 * AbuseIPDB aggregates crowd-reported abuse (brute force, spam, scans, ...)
 * with a confidence score. The /check endpoint reports no per-report
 * categories, so this stays a generic direct-abuse observation whose weight
 * scales with the provider's own confidence score.
 */
export function abuseIpDbEvidence(result: AbuseIpDbResult, nowMs: number): DnsblInterpretation {
  const evidence: RawEvidence[] = [];
  const lastReportedMs = result.lastReportedAt ? Date.parse(result.lastReportedAt) : null;
  const ageDays = lastReportedMs === null ? null : (nowMs - lastReportedMs) / 86_400_000;
  const freshness = ageDays === null ? 0.5 : ageDays <= 7 ? 1 : ageDays <= 30 ? 0.85 : ageDays <= 90 ? 0.6 : 0.4;

  if (result.totalReports > 0) {
    evidence.push({
      sourceId: "abuseipdb",
      category: "abuse_reported",
      reason: "abuseipdb_reports",
      weight: 45,
      confidence: Math.min(100, Math.max(0, result.confidenceScore)),
      freshness,
      lastSeen: result.lastReportedAt,
      reportCount: result.totalReports,
    });
  }

  if (result.isTor) {
    evidence.push({
      sourceId: "abuseipdb",
      category: "tor",
      reason: "abuseipdb_tor",
      weight: 0,
      confidence: 90,
      freshness: 1,
    });
  }

  const hasThreat = evidence.some((item) => item.weight > 0);
  return {
    status: hasThreat ? "matched" : evidence.length > 0 ? "policy_listed" : "clean",
    evidence,
  };
}

const threatFoxSchema = z
  .object({
    query_status: z.string(),
    data: z
      .array(
        z
          .object({
            ioc: z.string().optional(),
            threat_type: z.string().optional(),
            malware_family: z.string().nullable().optional(),
            malware_variant: z.string().nullable().optional(),
            first_seen: z.string().nullable().optional(),
            last_seen: z.string().nullable().optional(),
            confidence_level: z.number().nullable().optional(),
          })
          .passthrough(),
      )
      .nullable()
      .optional(),
  })
  .passthrough();

export interface ThreatFoxIoc {
  ioc: string | null;
  threatType: string | null;
  malwareFamily: string | null;
  firstSeen: string | null;
  lastSeen: string | null;
  confidenceLevel: number | null;
}

export function normalizeThreatFoxPayload(payload: unknown): ThreatFoxIoc[] | null {
  const parsed = threatFoxSchema.safeParse(payload);
  if (!parsed.success) return null;
  if (parsed.data.query_status && parsed.data.query_status !== "ok") return [];
  if (!parsed.data.data) return [];

  return parsed.data.data.map((entry) => ({
    ioc: entry.ioc ?? null,
    threatType: entry.threat_type ?? null,
    malwareFamily: entry.malware_family || entry.malware_variant || null,
    firstSeen: normalizeThreatFoxDate(entry.first_seen),
    lastSeen: normalizeThreatFoxDate(entry.last_seen),
    confidenceLevel: entry.confidence_level ?? null,
  }));
}

function normalizeThreatFoxDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const iso = value.includes(" ") ? value.replace(" ", "T") + "Z" : value;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/**
 * ThreatFox is an abuse.ch IOC repository. Most IP IOCs are botnet C2
 * addresses with a malware family and a confidence level; the API returns no
 * match (clean) for unknown IPs.
 */
export function threatFoxEvidence(iocs: ThreatFoxIoc[], nowMs: number): DnsblInterpretation {
  const relevant = iocs.filter((ioc) => Boolean(ioc.ioc));
  if (relevant.length === 0) return { status: "clean", evidence: [] };

  const evidence: RawEvidence[] = [];

  for (const ioc of relevant) {
    const lastSeenMs = ioc.lastSeen ? Date.parse(ioc.lastSeen) : null;
    const ageDays = lastSeenMs === null ? null : (nowMs - lastSeenMs) / 86_400_000;
    const freshness = ageDays === null ? 0.5 : ageDays <= 30 ? 1 : ageDays <= 90 ? 0.7 : 0.4;
    const confidence = ioc.confidenceLevel === null ? 70 : Math.min(100, Math.max(0, ioc.confidenceLevel));

    evidence.push({
      sourceId: "threatfox",
      category: ioc.threatType?.includes("botnet") ? "botnet" : "malware",
      reason: "threatfox_ioc",
      weight: 55,
      confidence,
      freshness,
      firstSeen: ioc.firstSeen,
      lastSeen: ioc.lastSeen,
      malwareFamily: ioc.malwareFamily,
      detail: ioc.threatType ? `IOC type: ${ioc.threatType}` : null,
    });
  }

  return { status: "matched", evidence };
}

const blocklistDeCountsSchema = z
  .object({
    attacks: z.union([z.number(), z.string()]).optional(),
    reports: z.union([z.number(), z.string()]).optional(),
  })
  .passthrough();

export interface BlocklistDeCounts {
  attacks: number | null;
  reports: number | null;
}

/** blocklist.de api.php returns the counts as strings. */
export function normalizeBlocklistDeCounts(payload: unknown): BlocklistDeCounts | null {
  const parsed = blocklistDeCountsSchema.safeParse(payload);
  if (!parsed.success) return null;

  const attacks = toCount(parsed.data.attacks);
  const reports = toCount(parsed.data.reports);
  if (attacks === null && reports === null) return null;
  return { attacks, reports };
}

function toCount(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value === "string" && value.trim() && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}
