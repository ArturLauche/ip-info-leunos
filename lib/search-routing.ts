/**
 * Smart routing for the global command/search surface. Classifies a raw query
 * into the most appropriate tool destination so a single input can serve every
 * tool: AS-prefixed input opens the ASN profile, everything else (IPv4, IPv6,
 * domain) goes to the universal IP/host lookup.
 */
export type SmartTargetKind = "asn" | "lookup";

export interface SmartTarget {
  href: string;
  kind: SmartTargetKind;
}

/** Resolves a typed query to a destination, or `null` when it is empty. */
export function resolveSmartTarget(raw: string): SmartTarget | null {
  const query = raw.trim();
  if (!query) return null;

  const asnMatch = query.match(/^as\s*([0-9]{1,10})$/i);
  if (asnMatch) {
    return { href: `/asn/${asnMatch[1]}`, kind: "asn" };
  }

  return { href: `/check?q=${encodeURIComponent(query)}`, kind: "lookup" };
}
