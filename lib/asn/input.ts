// The largest valid Autonomous System Number is 2^32 - 1 (32-bit ASNs).
export const MAX_ASN = 4_294_967_295;
export const MIN_ASN = 1;

export type NormalizedAsn = {
  /** Display form, e.g. "AS8881". */
  asn: string;
  /** Numeric form, e.g. 8881. */
  asnNumber: number;
};

export type AsnNormalizationError =
  | "empty"
  | "invalid_format"
  | "out_of_range";

export type AsnNormalizationResult =
  | { ok: true; value: NormalizedAsn }
  | { ok: false; error: AsnNormalizationError };

/**
 * Normalizes arbitrary user input into both the display ("AS8881") and numeric
 * (8881) representations of an Autonomous System Number.
 *
 * Accepts inputs such as "AS8881", "as8881", "8881", " AS 8881 ", and "as8881.".
 * Rejects empty input, non-numeric junk, and values outside the valid 32-bit range.
 */
export function normalizeAsn(input: string | null | undefined): AsnNormalizationResult {
  if (input === null || input === undefined) {
    return { ok: false, error: "empty" };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
  }

  // Strip an optional leading "AS" (case-insensitive) and any internal spaces
  // between the prefix and the digits, e.g. "AS 8881".
  const withoutPrefix = trimmed.replace(/^as[\s]*/i, "");
  const compact = withoutPrefix.replace(/\s+/g, "");

  if (!/^\d+$/.test(compact)) {
    return { ok: false, error: "invalid_format" };
  }

  // Guard against absurdly long digit strings before BigInt parsing.
  if (compact.length > 10) {
    return { ok: false, error: "out_of_range" };
  }

  const asnNumber = Number.parseInt(compact, 10);
  if (!Number.isInteger(asnNumber) || asnNumber < MIN_ASN || asnNumber > MAX_ASN) {
    return { ok: false, error: "out_of_range" };
  }

  return {
    ok: true,
    value: {
      asn: `AS${asnNumber}`,
      asnNumber,
    },
  };
}

/** Extracts a normalized ASN from a free-form string such as "AS8881 Deutsche Telekom AG". */
export function extractAsnFromText(text: string | null | undefined): NormalizedAsn | null {
  if (!text) return null;
  const match = text.match(/\bAS\s*(\d{1,10})\b/i);
  if (!match) return null;
  const result = normalizeAsn(match[1]);
  return result.ok ? result.value : null;
}
