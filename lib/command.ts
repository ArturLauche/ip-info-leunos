import type { ToolKey } from "@/components/shell/nav-config";

/** Coarse classification of a command-bar query, used to suggest deep links. */
export type QueryKind = "ipv4" | "ipv6" | "asn" | "domain" | "text" | "empty";

export interface QueryClassification {
  kind: QueryKind;
  /**
   * Normalized value to feed into a tool deep link: host extracted from URLs,
   * ASNs rendered as `AS<number>`, IPv6 lower-cased.
   */
  value: string;
}

/** A smart deep-link suggestion derived from the typed query. */
export interface CommandActionTarget {
  tool: ToolKey;
  href: string;
}

const MAX_ASN = 4_294_967_295;

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_CHARSET = /^[0-9a-f:]+$/i;
const ASN_PATTERN = /^as\s*(\d{1,10})$/i;
const BARE_NUMBER_PATTERN = /^\d{1,10}$/;
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function isIpv4(value: string): boolean {
  const match = IPV4_PATTERN.exec(value);
  if (!match) return false;
  return match.slice(1).every((octet) => {
    const n = Number(octet);
    return n >= 0 && n <= 255;
  });
}

function isIpv6(value: string): boolean {
  if (value === "::" || !value.includes(":") || !IPV6_CHARSET.test(value)) {
    return false;
  }
  const colons = (value.match(/:/g) ?? []).length;
  // Require enough structure to avoid matching clock times like "12:30:45":
  // either compression, a hex letter, or more colons than a time would have.
  return colons >= 2 && (colons >= 3 || value.includes("::") || /[a-f]/i.test(value));
}

/** Strips a scheme/path down to the host when the input looks like a URL. */
function extractHost(raw: string): string {
  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
    const url = new URL(hasScheme ? raw : `http://${raw}`);
    return url.hostname || raw;
  } catch {
    return raw;
  }
}

/**
 * Classifies a raw query string into the kind of network object it most likely
 * represents, returning a normalized value suitable for tool deep links.
 */
export function classifyQuery(raw: string): QueryClassification {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty", value: "" };

  // Only reduce to a host when the input carries URL markers, so that bare
  // ASNs and IP addresses are never mangled by the URL parser.
  const candidate =
    /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) || trimmed.includes("/")
      ? extractHost(trimmed)
      : trimmed;

  if (isIpv4(candidate)) return { kind: "ipv4", value: candidate };
  if (isIpv6(candidate)) return { kind: "ipv6", value: candidate.toLowerCase() };

  const asnMatch = ASN_PATTERN.exec(candidate);
  if (asnMatch) {
    const number = Number(asnMatch[1]);
    if (number >= 1 && number <= MAX_ASN) return { kind: "asn", value: `AS${number}` };
  }

  if (BARE_NUMBER_PATTERN.test(candidate)) {
    const number = Number(candidate);
    if (number >= 1 && number <= MAX_ASN) return { kind: "asn", value: `AS${number}` };
  }

  if (DOMAIN_PATTERN.test(candidate)) return { kind: "domain", value: candidate.toLowerCase() };

  return { kind: "text", value: trimmed };
}

/**
 * Builds the ordered set of deep-link suggestions for a classified query.
 * Returns an empty list for free text and empty input.
 */
export function buildActionTargets(
  classification: QueryClassification,
): CommandActionTarget[] {
  const { kind, value } = classification;
  const encoded = encodeURIComponent(value);

  switch (kind) {
    case "ipv4":
    case "ipv6":
      return [
        { tool: "check", href: `/check?q=${encoded}` },
        { tool: "reputation", href: `/reputation?ip=${encoded}` },
        { tool: "dns", href: `/dns?target=${encoded}` },
        { tool: "whois", href: `/whois?target=${encoded}` },
      ];
    case "domain":
      return [
        { tool: "check", href: `/check?q=${encoded}` },
        { tool: "dns", href: `/dns?target=${encoded}` },
        { tool: "whois", href: `/whois?target=${encoded}` },
        { tool: "cdn", href: `/cdn?target=${encoded}` },
        { tool: "ping", href: `/ping?target=${encoded}` },
      ];
    case "asn":
      return [{ tool: "asn", href: `/asn?q=${encoded}` }];
    default:
      return [];
  }
}

/**
 * Case-insensitive token match: every whitespace-separated term in the query
 * must appear somewhere in the haystack. Used to filter navigation targets.
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack.toLowerCase();
  return terms.every((term) => text.includes(term));
}
