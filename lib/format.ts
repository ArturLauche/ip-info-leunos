import type { Locale } from "@/lib/locale-config";

const numberFormats = new Map<Locale, Intl.NumberFormat>();

/** Replaces `{key}` placeholders in a translation template. */
export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function formatNumber(value: number | null | undefined, locale: Locale): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale);
    numberFormats.set(locale, format);
  }
  return format.format(value);
}

export function valueOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}
