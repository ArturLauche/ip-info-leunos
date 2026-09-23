/**
 * Client-safe ASN identifier validation.
 *
 * Split out of `lib/asn.ts` so browser bundles (`ip-display`, `asn-checker`,
 * API-route zod transforms stay server-side) only pay for ~30 lines instead
 * of the full RIPEstat/PeeringDB/IPinfo normalizer module. This file must
 * stay dependency-free.
 */

export const MAX_ASN_NUMBER = 4_294_967_295;

const ASN_PATTERN = /^(?:AS)?([0-9]+)$/i;

export interface NormalizedAsn {
  asn: string;
  asnNumber: number;
}

export type AsnValidationErrorCode = "invalid_format" | "out_of_range";

export class AsnValidationError extends Error {
  readonly code: AsnValidationErrorCode;

  constructor(
    message = "Please provide a valid ASN.",
    code: AsnValidationErrorCode = "invalid_format",
  ) {
    super(message);
    this.name = "AsnValidationError";
    this.code = code;
  }
}

export function normalizeAsnInput(input: string): NormalizedAsn {
  const trimmed = input.trim();
  const match = trimmed.match(ASN_PATTERN);

  if (!match) {
    throw new AsnValidationError(
      "Use an AS-prefixed or numeric ASN, for example AS8881 or 8881.",
      "invalid_format",
    );
  }

  const digits = match[1].replace(/^0+/, "") || "0";
  const asnNumber = Number(digits);

  if (
    !Number.isSafeInteger(asnNumber) ||
    asnNumber < 1 ||
    asnNumber > MAX_ASN_NUMBER
  ) {
    throw new AsnValidationError(
      `ASN must be between 1 and ${MAX_ASN_NUMBER}.`,
      "out_of_range",
    );
  }

  return {
    asn: `AS${asnNumber}`,
    asnNumber,
  };
}
