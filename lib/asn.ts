import { z } from "zod";

const MAX_ASN_NUMBER = 4_294_967_295;

const ASN_INPUT_PATTERN = /^(?:AS)?(\d+)$/i;

export type NormalizedAsn = {
  display: string;
  number: number;
};

export function normalizeAsnInput(input: string): NormalizedAsn | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = ASN_INPUT_PATTERN.exec(trimmed);
  if (!match) return null;

  const number = Number(match[1]);
  if (!isValidAsnNumber(number)) return null;

  return { display: asnDisplay(number), number };
}

export function isValidAsnNumber(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_ASN_NUMBER;
}

export function asnDisplay(n: number): string {
  return `AS${n}`;
}

export const asnQuerySchema = z
  .string()
  .trim()
  .min(1, "ASN input is required.")
  .max(20, "ASN input is too long.")
  .transform((value) => normalizeAsnInput(value))
  .refine((value): value is NormalizedAsn => value !== null, {
    message: "Please provide a valid ASN (e.g. AS8881 or 8881).",
  })
  .transform((value) => value.number);
