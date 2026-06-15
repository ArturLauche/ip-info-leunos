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
  contactNotConfigured: "Kontaktadresse auf Anfrage",
  sections: [
    {
      heading: "1. Geltungsbereich",
      paragraphs: [
        "Diese Nutzungsbedingungen gelten für die Verwendung dieser Seite und der hier angebotenen Werkzeuge zur Abfrage von IP-, Domain- und Netzwerkinformationen. Mit der Nutzung der Seite erklären Sie sich mit diesen Bedingungen einverstanden.",
        "Diese Seite ist ein privates, nicht-kommerzielles Hobbyprojekt und wird ohne Vergütung bereitgestellt. Sollten Sie mit diesen Bedingungen nicht einverstanden sein, bitten wir Sie, die Seite nicht zu nutzen.",
      ],
    },
    {
      heading: "2. Leistungsbeschreibung",
      paragraphs: [
        "Die Seite stellt Werkzeuge bereit, um öffentlich verfügbare Informationen zu IP-Adressen, Domains und Netzwerken nachzuschlagen. Die Ergebnisse stammen teilweise aus externen, öffentlichen Diensten und werden ohne Gewähr auf Richtigkeit, Vollständigkeit oder Aktualität wiedergegeben.",
        "Die Werkzeuge richten sich an die technisch interessierte Nutzung und ersetzen keine professionelle Netzwerk-, Sicherheits- oder Rechtsberatung.",
      ],
    },
    {
      heading: "3. Verfügbarkeit des Dienstes",
      paragraphs: [
        "Es besteht kein Anspruch auf eine bestimmte oder ununterbrochene Verfügbarkeit der Seite. Der Betrieb kann jederzeit ohne Vorankündigung gewartet, eingeschränkt, geändert oder dauerhaft eingestellt werden.",
        "Zur Abwehr von Missbrauch und Überlastung können einzelne Anfragen mengenmäßig begrenzt (Rate-Limiting) oder abgelehnt werden.",
      ],
    },
    {
      heading: "4. Zulässige Nutzung",
      paragraphs: [
        "Sie verpflichten sich, die Seite nur im Rahmen der geltenden Gesetze zu nutzen. Insbesondere ist Folgendes untersagt:",
      ],
      bullets: [
        "die automatisierte oder massenhafte Abfrage in einem Umfang, der den Betrieb beeinträchtigt oder die Rate-Limits umgeht;",
        "die Nutzung der Werkzeuge zur Vorbereitung oder Durchführung von Angriffen, unbefugten Zugriffen oder sonstigen rechtswidrigen Handlungen;",
        "die Eingabe von Zielen oder Zugangsdaten, für deren Prüfung Sie nicht berechtigt sind;",
        "die Umgehung technischer Beschränkungen oder Sicherheitsvorkehrungen der Seite;",
        "jede Nutzung, die Rechte Dritter verletzt oder gegen geltendes Recht verstößt.",
      ],
    },
    {
      heading: "5. Keine Gewähr für Ergebnisse",
      paragraphs: [
        "Die abgerufenen Informationen dienen ausschließlich technischen und informativen Zwecken. Sie können unvollständig, veraltet oder fehlerhaft sein und ersetzen keine fachliche, rechtliche oder sicherheitsbezogene Beratung.",
        "Die Bewertung und Verwendung der Ergebnisse erfolgt in Ihrer eigenen Verantwortung. Für Entscheidungen, die Sie auf Grundlage der angezeigten Informationen treffen, wird keine Haftung übernommen.",
      ],
    },
    {
      heading: "6. Externe Dienste und Inhalte",
      paragraphs: [
        "Zur Bereitstellung der Ergebnisse werden Anfragen an externe Dienste übermittelt. Für deren Inhalte, Verfügbarkeit und Datenverarbeitung ist der jeweilige Anbieter verantwortlich. Einzelheiten zu den eingebundenen Diensten finden Sie in der Datenschutzerklärung.",
      ],
    },
    {
      heading: "7. Haftung",
      paragraphs: [
        "Die Werkzeuge werden ohne jede Gewährleistung „wie besehen“ bereitgestellt. Eine Haftung für Schäden, die aus der Nutzung oder Nichtverfügbarkeit der Seite oder aus dem Vertrauen auf die angezeigten Ergebnisse entstehen, ist – soweit gesetzlich zulässig – ausgeschlossen.",
        "Unberührt bleibt die Haftung für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.",
      ],
    },
    {
      heading: "8. Haftung für Links",
      paragraphs: [
        "Die Seite kann Verweise auf externe Websites Dritter enthalten oder Ergebnisse anzeigen, die auf solche verweisen. Auf deren Inhalte haben wir keinen Einfluss und übernehmen hierfür keine Haftung. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.",
      ],
    },
    {
      heading: "9. Geistiges Eigentum",
      paragraphs: [
        "Die Gestaltung der Seite sowie der zugrunde liegende Quellcode unterliegen dem Schutz des geistigen Eigentums bzw. den Bedingungen der jeweiligen Lizenz des Projekts. Die über die Tools angezeigten Daten stammen überwiegend aus öffentlichen Quellen Dritter und unterliegen gegebenenfalls deren Nutzungsbedingungen.",
      ],
    },
    {
      heading: "10. Datenschutz",
      paragraphs: [
        "Informationen zum Umgang mit personenbezogenen Daten finden Sie in der Datenschutzerklärung. Mit der Nutzung der Seite nehmen Sie die dort beschriebene Datenverarbeitung zur Kenntnis.",
      ],
    },
    {
      heading: "11. Schlussbestimmungen",
      paragraphs: [
        "Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.",
        "Es gilt das Recht am Sitz des Verantwortlichen, soweit dem keine zwingenden gesetzlichen Vorschriften – etwa zugunsten von Verbrauchern – entgegenstehen.",
      ],
    },
    {
      heading: "12. Änderungen dieser Bedingungen",
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
  contactNotConfigured: "contact address on request",
  sections: [
    {
      heading: "1. Scope",
      paragraphs: [
        "These terms of use apply to your use of this site and the tools offered here for looking up IP, domain and network information. By using the site you agree to these terms.",
        "This site is a private, non-commercial hobby project and is provided free of charge. If you do not agree to these terms, please do not use the site.",
      ],
    },
    {
      heading: "2. Description of service",
      paragraphs: [
        "The site provides tools to look up publicly available information about IP addresses, domains and networks. Some results originate from external, public services and are reproduced without any guarantee of accuracy, completeness or timeliness.",
        "The tools are aimed at technically interested use and do not replace professional network, security or legal advice.",
      ],
    },
    {
      heading: "3. Availability of the service",
      paragraphs: [
        "There is no entitlement to any particular or uninterrupted availability of the site. Operation may be maintained, restricted, changed or permanently discontinued at any time without prior notice.",
        "To prevent abuse and overload, individual requests may be rate-limited or refused.",
      ],
    },
    {
      heading: "4. Acceptable use",
      paragraphs: [
        "You agree to use the site only in compliance with applicable law. In particular, the following is prohibited:",
      ],
      bullets: [
        "automated or bulk querying at a scale that impairs operation or circumvents the rate limits;",
        "using the tools to prepare or carry out attacks, unauthorized access or other unlawful acts;",
        "entering targets or credentials that you are not authorized to test;",
        "circumventing technical restrictions or security measures of the site;",
        "any use that infringes the rights of third parties or violates applicable law.",
      ],
    },
    {
      heading: "5. No guarantee of results",
      paragraphs: [
        "The retrieved information is provided for technical and informational purposes only. It may be incomplete, outdated or incorrect and does not replace professional, legal or security advice.",
        "Assessing and using the results is your own responsibility. No liability is accepted for decisions you make on the basis of the displayed information.",
      ],
    },
    {
      heading: "6. External services and content",
      paragraphs: [
        "To provide results, requests are sent to external services. The respective provider is responsible for their content, availability and data processing. Details of the embedded services can be found in the privacy policy.",
      ],
    },
    {
      heading: "7. Liability",
      paragraphs: [
        "The tools are provided “as is” without any warranty. To the extent permitted by law, liability for damages arising from the use or unavailability of the site, or from reliance on the displayed results, is excluded.",
        "This does not affect liability for intent and gross negligence, nor for damages resulting from injury to life, body or health.",
      ],
    },
    {
      heading: "8. Liability for links",
      paragraphs: [
        "The site may contain references to external third-party websites or display results that point to them. We have no influence over their content and accept no liability for it. The respective provider is always responsible for the content of the linked pages.",
      ],
    },
    {
      heading: "9. Intellectual property",
      paragraphs: [
        "The design of the site and the underlying source code are protected by intellectual property rights or governed by the project's respective license. The data shown through the tools largely originates from third-party public sources and may be subject to their terms of use.",
      ],
    },
    {
      heading: "10. Data protection",
      paragraphs: [
        "Information on how personal data is handled can be found in the privacy policy. By using the site you acknowledge the data processing described there.",
      ],
    },
    {
      heading: "11. Final provisions",
      paragraphs: [
        "Should individual provisions of these terms of use be or become invalid, the validity of the remaining provisions shall remain unaffected.",
        "The law at the controller's place of establishment applies, unless mandatory statutory provisions — for example in favor of consumers — preclude this.",
      ],
    },
    {
      heading: "12. Changes to these terms",
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
