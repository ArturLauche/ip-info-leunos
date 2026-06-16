export interface EmailParts {
  /** Local part, before the "@". */
  user: string;
  /** Domain part, after the "@". */
  domain: string;
}

/**
 * Splits an email into its local part and domain so the two halves can be
 * handed to the client separately. The joined "user@domain" string then never
 * appears in the server-rendered HTML or the RSC payload, which keeps it away
 * from naive harvesters that match a contiguous address. Returns null for
 * malformed input (no "@", or "@" at the very start/end).
 */
export function splitEmail(email: string): EmailParts | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at >= email.length - 1) return null;
  return { user: email.slice(0, at), domain: email.slice(at + 1) };
}
