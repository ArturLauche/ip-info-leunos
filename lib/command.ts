import type { ToolKey } from "@/components/shell/nav-config";

/** Coarse classification of a command-bar query, used to suggest deep links. */
export type QueryKind = "ipv4" | "ipv6" | "asn" | "domain" | "text" | "empty";

export interface QueryClassification {
  kind: QueryKind;
  /**
   * Normalized value to feed into a tool deep link: host extracted from URLs
   * (brackets stripped, IDNs punycode-encoded), ASNs rendered as `AS<number>`,
   * IPv6 lower-cased.
   */
  value: string;
}

/** A smart deep-link suggestion derived from the typed query. */
export interface CommandActionTarget {
  tool: ToolKey;
  href: string;
}

const MAX_ASN = 4_294_967_295;

const ASN_PATTERN = /^as\s*(\d{1,10})$/i;
const BARE_NUMBER_PATTERN = /^\d{1,10}$/;
// Hostname labels are LDH; the TLD is either alphabetic or a punycode (xn--) label.
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/i;

/** Validates a canonical dotted-decimal IPv4 address (no leading-zero octets). */
function isIpv4(value: string): boolean {
  const octets = value.split(".");
  if (octets.length !== 4) return false;
  return octets.every((octet) => {
    if (!/^\d{1,3}$/.test(octet)) return false;
    if (octet.length > 1 && octet[0] === "0") return false; // reject 001, 00, ...
    return Number(octet) <= 255;
  });
}

/**
 * Validates IPv6 structure: 8 hextets, or `::` compression (at most once), with
 * optional embedded IPv4 in the trailing 32 bits and an optional zone id.
 */
function isIpv6(value: string): boolean {
  const zoneIndex = value.indexOf("%");
  const address = zoneIndex === -1 ? value : value.slice(0, zoneIndex);
  if (!address.includes(":")) return false;
  if (/[^0-9a-f:.]/i.test(address)) return false;
  if (/:::/.test(address)) return false;
  if ((address.match(/::/g) ?? []).length > 1) return false;
  // A lone leading/trailing colon (not part of "::") is invalid.
  if (address.startsWith(":") && !address.startsWith("::")) return false;
  if (address.endsWith(":") && !address.endsWith("::")) return false;

  const hasCompression = address.includes("::");
  let groups = address.split(":");

  // An embedded IPv4 address occupies the final two hextets.
  let embeddedHextets = 0;
  const last = groups[groups.length - 1];
  if (last.includes(".")) {
    if (!isIpv4(last)) return false;
    embeddedHextets = 2;
    groups = groups.slice(0, -1);
  }

  let hextets = embeddedHextets;
  for (const group of groups) {
    if (group === "") continue; // boundary of "::"
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return false;
    hextets += 1;
  }

  return hasCompression ? hextets <= 7 : hextets === 8;
}

interface HostExtraction {
  host: string;
  hasCredentials: boolean;
}

/** Parses a URL-ish input down to its hostname, flagging embedded credentials. */
function extractHostFromUrl(raw: string): HostExtraction | null {
  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
    const url = new URL(hasScheme ? raw : `http://${raw}`);
    let host = url.hostname;
    if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1); // IPv6
    return { host, hasCredentials: url.username !== "" || url.password !== "" };
  } catch {
    return null;
  }
}

/** Extracts an IP host from a bare `host:port` authority that carries no scheme. */
function extractIpAuthority(raw: string): string | null {
  if (!raw.includes(":")) return null;
  try {
    const url = new URL(`http://${raw}`);
    if (url.username || url.password) return null;
    let host = url.hostname;
    if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
    return isIpv4(host) || isIpv6(host) ? host : null;
  } catch {
    return null;
  }
}

/** Punycode-encodes an IDN via the URL parser and matches the domain pattern. */
function normalizeDomain(candidate: string): string | null {
  try {
    const url = new URL(`http://${candidate}`);
    if (url.username || url.password) return null;
    let host = url.hostname; // ASCII / punycode form for IDNs
    if (host.startsWith("[")) return null; // bracketed IPv6 is handled elsewhere
    if (host.endsWith(".")) host = host.slice(0, -1); // drop a trailing FQDN dot
    return DOMAIN_PATTERN.test(host) ? host : null;
  } catch {
    // Unparseable host (e.g. invalid punycode A-label): not a usable domain.
    return null;
  }
}

/**
 * Classifies a raw query string into the kind of network object it most likely
 * represents, returning a normalized value suitable for tool deep links.
 */
export function classifyQuery(raw: string): QueryClassification {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty", value: "" };

  // Reduce URL-ish input to its host. Reject credential-bearing URLs outright —
  // the app never accepts credentials in lookup strings (see AGENTS.md).
  let candidate = trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) || trimmed.includes("/") || trimmed.includes("@")) {
    const extracted = extractHostFromUrl(trimmed);
    if (!extracted || extracted.hasCredentials || !extracted.host) {
      return { kind: "text", value: trimmed };
    }
    candidate = extracted.host;
  }

  // Drop a single trailing dot from fully-qualified names (example.com.).
  if (candidate.endsWith(".")) candidate = candidate.slice(0, -1);

  // Bare host:port authorities whose host is an IP (8.8.8.8:53, [::1]:443).
  if (!isIpv4(candidate) && !isIpv6(candidate)) {
    const authority = extractIpAuthority(candidate);
    if (authority) candidate = authority;
  }

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

  const domain = normalizeDomain(candidate);
  if (domain) return { kind: "domain", value: domain };

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
        { tool: "ping", href: `/ping?target=${encoded}` },
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
