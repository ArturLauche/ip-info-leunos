import type { Locale } from "@/lib/locale-config";
import type { PrivacyContent } from "@/lib/privacy";
import type { TermsContent } from "@/lib/terms";
import { legalEastern } from "@/lib/translations/legal-eastern";
import { legalMenaAsia } from "@/lib/translations/legal-mena-asia";
import { legalNorthern } from "@/lib/translations/legal-northern";
import { legalWestern } from "@/lib/translations/legal-western";

type AdditionalLocale = Exclude<Locale, "de" | "en">;

export const additionalPrivacyContent: Record<
  AdditionalLocale,
  PrivacyContent
> = {
  es: legalWestern.es.privacy,
  fr: legalWestern.fr.privacy,
  it: legalWestern.it.privacy,
  nl: legalWestern.nl.privacy,
  pl: legalEastern.pl.privacy,
  "pt-BR": legalEastern["pt-BR"].privacy,
  "pt-PT": legalEastern["pt-PT"].privacy,
  ja: legalEastern.ja.privacy,
  ko: legalEastern.ko.privacy,
  ru: legalEastern.ru.privacy,
  uk: legalMenaAsia.uk.privacy,
  "zh-CN": legalMenaAsia["zh-CN"].privacy,
  "zh-TW": legalMenaAsia["zh-TW"].privacy,
  ar: legalMenaAsia.ar.privacy,
  hi: legalMenaAsia.hi.privacy,
  id: legalMenaAsia.id.privacy,
  cs: legalNorthern.cs.privacy,
  sv: legalNorthern.sv.privacy,
  da: legalNorthern.da.privacy,
  nb: legalNorthern.nb.privacy,
  fi: legalNorthern.fi.privacy,
  el: legalNorthern.el.privacy,
  ro: legalNorthern.ro.privacy,
  tr: legalNorthern.tr.privacy,
};

export const additionalTermsContent: Record<AdditionalLocale, TermsContent> = {
  es: legalWestern.es.terms,
  fr: legalWestern.fr.terms,
  it: legalWestern.it.terms,
  nl: legalWestern.nl.terms,
  pl: legalEastern.pl.terms,
  "pt-BR": legalEastern["pt-BR"].terms,
  "pt-PT": legalEastern["pt-PT"].terms,
  ja: legalEastern.ja.terms,
  ko: legalEastern.ko.terms,
  ru: legalEastern.ru.terms,
  uk: legalMenaAsia.uk.terms,
  "zh-CN": legalMenaAsia["zh-CN"].terms,
  "zh-TW": legalMenaAsia["zh-TW"].terms,
  ar: legalMenaAsia.ar.terms,
  hi: legalMenaAsia.hi.terms,
  id: legalMenaAsia.id.terms,
  cs: legalNorthern.cs.terms,
  sv: legalNorthern.sv.terms,
  da: legalNorthern.da.terms,
  nb: legalNorthern.nb.terms,
  fi: legalNorthern.fi.terms,
  el: legalNorthern.el.terms,
  ro: legalNorthern.ro.terms,
  tr: legalNorthern.tr.terms,
};
