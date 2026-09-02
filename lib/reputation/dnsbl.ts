import { isIPv6Address, stripIpv6Brackets } from "@/lib/network/target";
import type { RawEvidence, SourceStatus } from "./model";

/** DNSBL query encodings and per-zone response interpretation. */

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
  status: SourceStatus;
  evidence: RawEvidence[];
}

const VALID_DNSBL_ANSWER = /^127\./;

function isValidAnswer(record: string) {
  return VALID_DNSBL_ANSWER.test(record);
}

/** Filters out wildcard / DNS interference answers. */
export function hasTrustworthyAnswers(records: string[]) {
  return records.length > 0 && records.every(isValidAnswer);
}

/**
 * Spamhaus ZEN return codes (see docs.spamhaus.com "Available Zones"):
 * 127.0.0.2 SBL, .3 CSS, .4 XBL, .9 DROP, .10/.11 PBL, .30 BCL.
 * 127.255.255.x are error answers (public resolver block / query limit).
 */
const ZEN_CODES: Record<number, Omit<RawEvidence, "sourceId" | "raw">> = {
  2: {
    category: "spam_observed",
    reason: "sbl",
    weight: 30,
    confidence: 90,
    freshness: 1,
  },
  3: {
    category: "mail_reputation",
    reason: "css",
    weight: 14,
    confidence: 75,
    freshness: 1,
  },
  4: {
    category: "botnet",
    reason: "xbl",
    weight: 40,
    confidence: 85,
    freshness: 1,
  },
  9: {
    category: "malware",
    reason: "drop",
    weight: 65,
    confidence: 90,
    freshness: 1,
  },
  10: {
    category: "mail_policy",
    reason: "pbl_isp",
    weight: 0,
    confidence: 95,
    freshness: 1,
  },
  11: {
    category: "mail_policy",
    reason: "pbl_spamhaus",
    weight: 0,
    confidence: 95,
    freshness: 1,
  },
  30: {
    category: "botnet",
    reason: "bcl",
    weight: 65,
    confidence: 90,
    freshness: 1,
  },
};

export function interpretZenResponse(records: string[]): DnsblInterpretation {
  if (!hasTrustworthyAnswers(records)) {
    return records.length > 0
      ? { status: "resolver_blocked", evidence: [] }
      : { status: "clean", evidence: [] };
  }

  for (const record of records) {
    if (record === "127.255.255.252") return { status: "rate_limited", evidence: [] };
    if (record === "127.255.255.254") return { status: "resolver_blocked", evidence: [] };
    if (record === "127.255.255.255") return { status: "unavailable", evidence: [] };
    if (record.startsWith("127.255.")) return { status: "resolver_blocked", evidence: [] };
  }

  const evidence: RawEvidence[] = [];
  const seenCodes = new Set<number>();

  for (const record of records) {
    const match = record.match(/^127\.0\.0\.(\d{1,3})$/);
    if (!match) continue;
    const code = Number(match[1]);
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);

    const definition = ZEN_CODES[code];
    if (!definition) continue;

    evidence.push({
      ...definition,
      sourceId: "spamhaus-zen",
      raw: record,
    });
  }

  if (evidence.length === 0) return { status: "clean", evidence: [] };

  const hasThreat = evidence.some((item) => item.weight > 0);
  return { status: hasThreat ? "matched" : "policy_listed", evidence };
}

/** SpamCop BL: 127.0.0.2 means listed; listings are short-lived spam reports. */
export function interpretSpamcopResponse(records: string[]): DnsblInterpretation {
  if (!hasTrustworthyAnswers(records)) {
    return records.length > 0
      ? { status: "resolver_blocked", evidence: [] }
      : { status: "clean", evidence: [] };
  }

  const evidence: RawEvidence[] = records
    .filter((record) => record.startsWith("127.0.0."))
    .map((record) => ({
      sourceId: "spamcop",
      category: "mail_reputation" as const,
      reason: "spamcop_listing",
      weight: 14,
      confidence: 70,
      freshness: 1,
      raw: record,
    }));

  return evidence.length > 0 ? { status: "matched", evidence } : { status: "clean", evidence: [] };
}

/**
 * Barracuda BRBL: 127.0.0.2 means poor email reputation as measured by the
 * Barracuda filter network. It is historical, aggregated evidence and can hit
 * dynamically reassigned addresses; it does not prove current spam activity.
 */
export function interpretBarracudaResponse(records: string[]): DnsblInterpretation {
  if (!hasTrustworthyAnswers(records)) {
    return records.length > 0
      ? { status: "resolver_blocked", evidence: [] }
      : { status: "clean", evidence: [] };
  }

  const evidence: RawEvidence[] = records
    .filter((record) => record.startsWith("127.0.0."))
    .map((record) => ({
      sourceId: "barracuda",
      category: "mail_reputation" as const,
      reason: "barracuda_listing",
      weight: 12,
      confidence: 60,
      freshness: 0.85,
      raw: record,
    }));

  return evidence.length > 0 ? { status: "matched", evidence } : { status: "clean", evidence: [] };
}

/**
 * DroneBL return codes (documented via the dnsbl.dronebl.org zone TXT test
 * entries): 3 IRC spam drone, 5 Bottler, 6 unknown worm/spambot, 7 DDoS
 * drone, 8 open SOCKS proxy, 9 open HTTP proxy, 10 proxy chain, 11 web page
 * proxy, 13 automated dictionary attacks, 14 open Wingate proxy, 15
 * compromised router/gateway, 16 autorooting worms, 17 automatically
 * determined botnet IPs, 18 possibly compromised DNS/MX host, 255
 * uncategorized. Listings can be old; freshness is therefore reduced.
 */
const DRONEBL_CODES: Record<number, Omit<RawEvidence, "sourceId" | "raw">> = {
  3: { category: "botnet", reason: "dronebl_irc_drone", weight: 35, confidence: 70, freshness: 0.7 },
  5: { category: "botnet", reason: "dronebl_bottler", weight: 25, confidence: 60, freshness: 0.7 },
  6: { category: "botnet", reason: "dronebl_worm", weight: 35, confidence: 65, freshness: 0.7 },
  7: { category: "ddos", reason: "dronebl_ddos_drone", weight: 30, confidence: 70, freshness: 0.7 },
  8: { category: "proxy", reason: "dronebl_open_socks_proxy", weight: 10, confidence: 70, freshness: 0.7 },
  9: { category: "proxy", reason: "dronebl_open_http_proxy", weight: 10, confidence: 70, freshness: 0.7 },
  10: { category: "proxy", reason: "dronebl_proxychain", weight: 12, confidence: 65, freshness: 0.7 },
  11: { category: "proxy", reason: "dronebl_web_proxy", weight: 8, confidence: 60, freshness: 0.7 },
  13: { category: "bruteforce", reason: "dronebl_dictionary", weight: 20, confidence: 65, freshness: 0.7 },
  14: { category: "proxy", reason: "dronebl_wingate", weight: 10, confidence: 65, freshness: 0.7 },
  15: { category: "malware", reason: "dronebl_compromised_router", weight: 40, confidence: 70, freshness: 0.7 },
  16: { category: "botnet", reason: "dronebl_worm", weight: 35, confidence: 65, freshness: 0.7 },
  17: { category: "botnet", reason: "dronebl_botnet_auto", weight: 30, confidence: 55, freshness: 0.7 },
  18: { category: "botnet", reason: "dronebl_compromised_host", weight: 25, confidence: 55, freshness: 0.7 },
  255: { category: "abuse_reported", reason: "dronebl_uncategorized", weight: 15, confidence: 55, freshness: 0.7 },
};

export function interpretDroneblResponse(records: string[]): DnsblInterpretation {
  if (!hasTrustworthyAnswers(records)) {
    return records.length > 0
      ? { status: "resolver_blocked", evidence: [] }
      : { status: "clean", evidence: [] };
  }

  const evidence: RawEvidence[] = [];
  const seenCodes = new Set<number>();

  for (const record of records) {
    const match = record.match(/^127\.0\.0\.(\d{1,3})$/);
    if (!match) continue;
    const code = Number(match[1]);
    if (code === 1 || seenCodes.has(code)) continue;
    seenCodes.add(code);

    const definition = DRONEBL_CODES[code];
    if (!definition) continue;

    evidence.push({ ...definition, sourceId: "dronebl", raw: record });
  }

  return evidence.length > 0 ? { status: "matched", evidence } : { status: "clean", evidence: [] };
}

/**
 * blocklist.de encodes the attacked service in the A record's last octet
 * (documented on blocklist.de/en/rbldns.html). The TXT record carries the
 * last attack timestamp: "Infected System (Service: sasl, Last-Attack:
 * 1788355802), see http://...".
 */
const BLOCKLIST_DE_SERVICES: Record<number, string> = {
  2: "amavis",
  3: "apache-ddos",
  4: "asterisk",
  5: "bad-bot",
  6: "ftp",
  7: "imap",
  8: "irc-bot",
  9: "mail",
  10: "pop3",
  11: "registration-bot",
  12: "rfi-attack",
  13: "sasl",
  14: "ssh",
  15: "w00tw00t",
  16: "port-flood",
  17: "sql-injection",
  18: "webmin",
  19: "trigger-spam",
  20: "manual-report",
  21: "brute-force-login",
  22: "mysql",
};

const BLOCKLIST_DE_CODES: Record<number, Omit<RawEvidence, "sourceId" | "raw" | "detail">> = {
  2: { category: "bruteforce", reason: "bld_attack", weight: 18, confidence: 70, freshness: 1 },
  3: { category: "ddos", reason: "bld_attack", weight: 30, confidence: 70, freshness: 1 },
  4: { category: "bruteforce", reason: "bld_attack", weight: 25, confidence: 70, freshness: 1 },
  5: { category: "scanner", reason: "bld_attack", weight: 15, confidence: 70, freshness: 1 },
  6: { category: "bruteforce", reason: "bld_attack", weight: 22, confidence: 70, freshness: 1 },
  7: { category: "bruteforce", reason: "bld_attack", weight: 22, confidence: 70, freshness: 1 },
  8: { category: "botnet", reason: "bld_attack", weight: 30, confidence: 70, freshness: 1 },
  9: { category: "bruteforce", reason: "bld_attack", weight: 22, confidence: 70, freshness: 1 },
  10: { category: "bruteforce", reason: "bld_attack", weight: 22, confidence: 70, freshness: 1 },
  11: { category: "spam_observed", reason: "bld_attack", weight: 15, confidence: 70, freshness: 1 },
  12: { category: "web_attack", reason: "bld_attack", weight: 25, confidence: 70, freshness: 1 },
  13: { category: "bruteforce", reason: "bld_attack", weight: 25, confidence: 70, freshness: 1 },
  14: { category: "bruteforce", reason: "bld_attack", weight: 28, confidence: 70, freshness: 1 },
  15: { category: "scanner", reason: "bld_attack", weight: 18, confidence: 70, freshness: 1 },
  16: { category: "ddos", reason: "bld_attack", weight: 30, confidence: 70, freshness: 1 },
  17: { category: "web_attack", reason: "bld_attack", weight: 28, confidence: 70, freshness: 1 },
  18: { category: "bruteforce", reason: "bld_attack", weight: 20, confidence: 70, freshness: 1 },
  19: { category: "spam_observed", reason: "bld_attack", weight: 18, confidence: 70, freshness: 1 },
  20: { category: "abuse_reported", reason: "bld_attack", weight: 20, confidence: 65, freshness: 1 },
  21: { category: "bruteforce", reason: "bld_attack", weight: 25, confidence: 70, freshness: 1 },
  22: { category: "bruteforce", reason: "bld_attack", weight: 22, confidence: 70, freshness: 1 },
};

export function freshnessFromTimestamp(timestampMs: number | null, nowMs: number): number {
  if (timestampMs === null) return 0.5;
  const ageDays = (nowMs - timestampMs) / 86_400_000;
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.85;
  if (ageDays <= 90) return 0.6;
  if (ageDays <= 365) return 0.4;
  return 0.25;
}

/** Extracts the "Last-Attack" unix timestamp from a blocklist.de TXT answer. */
export function parseBlocklistDeTxt(txt: string[] | string | null | undefined): {
  service: string | null;
  lastAttackAt: string | null;
} {
  const joined = Array.isArray(txt) ? txt.join(" ") : (txt ?? "");
  if (!joined) return { service: null, lastAttackAt: null };

  const lastAttackMatch = joined.match(/Last-Attack:\s*(\d{9,11})/);
  const lastAttackAt = lastAttackMatch
    ? new Date(Number(lastAttackMatch[1]) * 1000).toISOString()
    : null;

  const serviceMatch = joined.match(/Service:\s*([^,\s]+)/);
  return { service: serviceMatch ? serviceMatch[1] : null, lastAttackAt };
}

export function interpretBlocklistDeResponse(
  records: string[],
  txt: string[] | string | null | undefined,
  nowMs: number,
  counts: { attacks: number | null; reports: number | null } | null,
): DnsblInterpretation {
  if (!hasTrustworthyAnswers(records)) {
    if (records.length > 0) return { status: "resolver_blocked", evidence: [] };
    // Not listed in DNS, but the HTTP API may still report historical counts.
    if (counts && (counts.reports ?? 0) > 0) {
      return {
        status: "matched",
        evidence: [
          {
            sourceId: "blocklist-de",
            category: "abuse_reported",
            reason: "bld_counts_only",
            weight: 18,
            confidence: 70,
            freshness: 0.5,
            reportCount: counts.reports,
            attackCount: counts.attacks,
          },
        ],
      };
    }
    return { status: "clean", evidence: [] };
  }

  const { service, lastAttackAt } = parseBlocklistDeTxt(txt);
  const lastAttackMs = lastAttackAt ? Date.parse(lastAttackAt) : null;
  const freshness = freshnessFromTimestamp(lastAttackMs, nowMs);

  const evidence: RawEvidence[] = [];
  const seenCodes = new Set<number>();

  for (const record of records) {
    const match = record.match(/^127\.0\.0\.(\d{1,3})$/);
    if (!match) continue;
    const code = Number(match[1]);
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);

    const definition = BLOCKLIST_DE_CODES[code];
    if (!definition) continue;

    evidence.push({
      ...definition,
      freshness,
      sourceId: "blocklist-de",
      detail: `Service: ${service ?? BLOCKLIST_DE_SERVICES[code] ?? "unknown"}`,
      lastSeen: lastAttackAt,
      reportCount: counts?.reports ?? null,
      attackCount: counts?.attacks ?? null,
      raw: record,
    });
  }

  if (evidence.length === 0) {
    return { status: "clean", evidence: [] };
  }

  return { status: "matched", evidence };
}

/**
 * Project Honey Pot http:BL answers encode 127.<days since last
 * activity>.<threat score>.<visitor type>. Visitor types are bit flags:
 * 1 suspicious, 2 harvester, 4 comment spammer; 0 marks a search engine.
 */
export function interpretHttpblResponse(records: string[], nowMs: number): DnsblInterpretation {
  if (!hasTrustworthyAnswers(records)) {
    return records.length > 0
      ? { status: "resolver_blocked", evidence: [] }
      : { status: "clean", evidence: [] };
  }

  const record = records.find((entry) => /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(entry));
  if (!record) return { status: "clean", evidence: [] };

  const parts = record.split(".").map(Number);
  const days = parts[1];
  const threat = parts[2];
  const visitorType = parts[3];
  const lastSeen = new Date(nowMs - days * 86_400_000).toISOString();
  const freshness = freshnessFromTimestamp(Date.parse(lastSeen), nowMs);
  const threatScale = Math.min(1, Math.max(0.3, threat / 75));

  const evidence: RawEvidence[] = [];

  if (visitorType === 0) {
    evidence.push({
      sourceId: "httpbl",
      category: "benign_service",
      reason: "httpbl_search_engine",
      weight: 0,
      confidence: 90,
      freshness,
      lastSeen,
      raw: record,
    });
  } else {
    const flags: Array<{ bit: number; reason: string; category: RawEvidence["category"]; base: number; confidence: number }> = [
      { bit: 1, reason: "httpbl_suspicious", category: "scanner", base: 8, confidence: 50 },
      { bit: 2, reason: "httpbl_harvester", category: "spam_observed", base: 15, confidence: 60 },
      { bit: 4, reason: "httpbl_comment_spammer", category: "spam_observed", base: 22, confidence: 65 },
    ];

    for (const flag of flags) {
      if ((visitorType & flag.bit) === 0) continue;
      evidence.push({
        sourceId: "httpbl",
        category: flag.category,
        reason: flag.reason,
        weight: Math.round(flag.base * threatScale),
        confidence: flag.confidence,
        freshness,
        lastSeen,
        raw: record,
      });
    }
  }

  if (evidence.length === 0) return { status: "clean", evidence: [] };

  const hasThreat = evidence.some((item) => item.weight > 0);
  return { status: hasThreat ? "matched" : "policy_listed", evidence };
}
