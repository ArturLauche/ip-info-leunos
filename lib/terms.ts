import type { Locale } from "@/lib/i18n";

export interface TermsSection {
  heading: string;
  /** Paragraphs may contain the token {email}, replaced at render time. */
  paragraphs?: string[];
  bullets?: string[];
}

export interface TermsContent {
  navLabel: string;
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  /** Shown in place of {email} when no contact address is configured. */
  contactNotConfigured: string;
  sections: TermsSection[];
}

/** ISO date shown as "last updated"; bump when the terms text changes. */
const LAST_UPDATED = "2026-06-15";

const de: TermsContent = {
  navLabel: "Nutzungsbedingungen",
  title: "Nutzungsbedingungen",
  subtitle: "Bedingungen für die Nutzung der hier angebotenen Werkzeuge.",
  lastUpdatedLabel: "Stand",
  lastUpdated: LAST_UPDATED,
  contactNotConfigured: "(Kontakt-E-Mail nicht hinterlegt)",
  sections: [
    {
      heading: "1. Geltungsbereich",
      paragraphs: [
        "Diese Nutzungsbedingungen gelten für die Verwendung dieser Seite und der hier angebotenen Werkzeuge zur Abfrage von IP-, Domain- und Netzwerkinformationen. Mit der Nutzung der Seite erklären Sie sich mit diesen Bedingungen einverstanden.",
        "Diese Seite ist ein privates, nicht-kommerzielles Hobbyprojekt und wird ohne Vergütung bereitgestellt.",
      ],
    },
    {
      heading: "2. Leistungsbeschreibung",
      paragraphs: [
        "Die Seite stellt Werkzeuge bereit, um öffentlich verfügbare Informationen zu IP-Adressen, Domains und Netzwerken nachzuschlagen. Die Ergebnisse stammen teilweise aus externen, öffentlichen Diensten und werden ohne Gewähr auf Richtigkeit, Vollständigkeit oder Aktualität wiedergegeben.",
        "Es besteht kein Anspruch auf eine bestimmte Verfügbarkeit der Seite. Der Betrieb kann jederzeit ohne Vorankündigung eingeschränkt, geändert oder eingestellt werden.",
      ],
    },
    {
      heading: "3. Zulässige Nutzung",
      paragraphs: [
        "Sie verpflichten sich, die Seite nur im Rahmen der geltenden Gesetze zu nutzen. Insbesondere ist Folgendes untersagt:",
      ],
      bullets: [
        "die automatisierte oder massenhafte Abfrage in einem Umfang, der den Betrieb beeinträchtigt oder die Rate-Limits umgeht;",
        "die Nutzung der Werkzeuge zur Vorbereitung oder Durchführung von Angriffen, unbefugten Zugriffen oder sonstigen rechtswidrigen Handlungen;",
        "die Eingabe von Zielen oder Zugangsdaten, für deren Prüfung Sie nicht berechtigt sind;",
        "jede Nutzung, die Rechte Dritter verletzt oder gegen geltendes Recht verstößt.",
      ],
    },
    {
      heading: "4. Externe Dienste und Inhalte",
      paragraphs: [
        "Zur Bereitstellung der Ergebnisse werden Anfragen an externe Dienste übermittelt. Für deren Inhalte, Verfügbarkeit und Datenverarbeitung ist der jeweilige Anbieter verantwortlich. Einzelheiten zu den eingebundenen Diensten finden Sie in der Datenschutzerklärung.",
      ],
    },
    {
      heading: "5. Haftung",
      paragraphs: [
        "Die Werkzeuge werden ohne jede Gewährleistung „wie besehen“ bereitgestellt. Eine Haftung für Schäden, die aus der Nutzung oder Nichtverfügbarkeit der Seite oder aus dem Vertrauen auf die angezeigten Ergebnisse entstehen, ist – soweit gesetzlich zulässig – ausgeschlossen.",
        "Unberührt bleibt die Haftung für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.",
      ],
    },
    {
      heading: "6. Änderungen dieser Bedingungen",
      paragraphs: [
        "Diese Nutzungsbedingungen können bei Bedarf angepasst werden, etwa wenn sich Funktionen oder eingebundene Dienste ändern. Es gilt jeweils die hier veröffentlichte Fassung.",
        "Bei Fragen erreichen Sie uns unter: {email}",
      ],
    },
  ],
};

const en: TermsContent = {
  navLabel: "Terms of Use",
  title: "Terms of Use",
  subtitle: "The terms that govern your use of the tools offered here.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: LAST_UPDATED,
  contactNotConfigured: "(contact email not configured)",
  sections: [
    {
      heading: "1. Scope",
      paragraphs: [
        "These terms of use apply to your use of this site and the tools offered here for looking up IP, domain and network information. By using the site you agree to these terms.",
        "This site is a private, non-commercial hobby project and is provided free of charge.",
      ],
    },
    {
      heading: "2. Description of service",
      paragraphs: [
        "The site provides tools to look up publicly available information about IP addresses, domains and networks. Some results originate from external, public services and are reproduced without any guarantee of accuracy, completeness or timeliness.",
        "There is no entitlement to any particular availability of the site. Operation may be restricted, changed or discontinued at any time without prior notice.",
      ],
    },
    {
      heading: "3. Acceptable use",
      paragraphs: [
        "You agree to use the site only in compliance with applicable law. In particular, the following is prohibited:",
      ],
      bullets: [
        "automated or bulk querying at a scale that impairs operation or circumvents the rate limits;",
        "using the tools to prepare or carry out attacks, unauthorized access or other unlawful acts;",
        "entering targets or credentials that you are not authorized to test;",
        "any use that infringes the rights of third parties or violates applicable law.",
      ],
    },
    {
      heading: "4. External services and content",
      paragraphs: [
        "To provide results, requests are sent to external services. The respective provider is responsible for their content, availability and data processing. Details of the embedded services can be found in the privacy policy.",
      ],
    },
    {
      heading: "5. Liability",
      paragraphs: [
        "The tools are provided “as is” without any warranty. To the extent permitted by law, liability for damages arising from the use or unavailability of the site, or from reliance on the displayed results, is excluded.",
        "This does not affect liability for intent and gross negligence, nor for damages resulting from injury to life, body or health.",
      ],
    },
    {
      heading: "6. Changes to these terms",
      paragraphs: [
        "These terms of use may be adjusted when necessary, for example when features or embedded services change. The version published here applies in each case.",
        "For any questions, you can reach us at: {email}",
      ],
    },
  ],
};

const CONTENT_BY_LOCALE: Partial<Record<Locale, TermsContent>> = {
  de,
  en,
};

/** Returns the terms-of-use content for the locale, defaulting to English. */
export function getTermsContent(locale: Locale): TermsContent {
  return CONTENT_BY_LOCALE[locale] ?? en;
}
