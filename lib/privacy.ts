import type { Locale } from "@/lib/i18n";

/**
 * Resolves the controller contact email from the environment. Returns null when
 * unset so that no contact address is ever hardcoded in the public repository.
 * Configure it at deploy time via the PRIVACY_CONTACT_EMAIL environment variable.
 */
export function getPrivacyContactEmail(): string | null {
  const fromEnv = process.env.PRIVACY_CONTACT_EMAIL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : null;
}

/**
 * Resolves the controller's identity (name / legal entity) from the environment.
 * GDPR Art. 13(1)(a) requires naming the controller; this is deployment-specific
 * and must not be hardcoded, so it is configured via PRIVACY_CONTROLLER_NAME.
 */
export function getPrivacyControllerName(): string | null {
  const fromEnv = process.env.PRIVACY_CONTROLLER_NAME?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : null;
}

export interface PrivacySection {
  heading: string;
  /** Paragraphs may contain the tokens {email} and {controller}, replaced at render time. */
  paragraphs?: string[];
  bullets?: string[];
}

export interface PrivacyContent {
  navLabel: string;
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  /** Shown in place of {email} when no contact address is configured. */
  contactNotConfigured: string;
  /** Shown in place of {controller} when no controller name is configured. */
  controllerNotConfigured: string;
  sections: PrivacySection[];
}

/** ISO date shown as "last updated"; bump when the policy text changes. */
const LAST_UPDATED = "2026-06-15";

const de: PrivacyContent = {
  navLabel: "Datenschutz",
  title: "Datenschutzerklärung",
  subtitle:
    "Wie diese Seite mit personenbezogenen Daten – insbesondere IP-Adressen – umgeht.",
  lastUpdatedLabel: "Stand",
  lastUpdated: LAST_UPDATED,
  contactNotConfigured: "Kontaktadresse auf Anfrage",
  controllerNotConfigured: "der Betreiber dieser Seite (Identität auf Anfrage)",
  sections: [
    {
      heading: "1. Verantwortlicher",
      paragraphs: [
        "Diese Seite ist ein privates, nicht-kommerzielles Hobbyprojekt. Verantwortlich im Sinne der Datenschutz-Grundverordnung (DSGVO) ist {controller}.",
        "Kontakt in Datenschutzfragen: {email}",
      ],
    },
    {
      heading: "2. Grundsatz der Datensparsamkeit",
      paragraphs: [
        "Diese Seite verwendet keine Tracking-Cookies, kein Webanalyse-Werkzeug, keine Werbenetzwerke und kein Nutzerkonto. Es werden keine Tracking-, Werbe- oder dauerhaften Nutzerprofile gebildet und keine personenbezogenen Daten zu Marketingzwecken verarbeitet.",
        "Bei der Anzeige Ihrer eigenen IP-Adresse werden aus dieser Adresse allerdings vorübergehend Netzwerkmerkmale abgeleitet – etwa ungefährer Standort, Provider/ASN, Verbindungstyp sowie eine Proxy-/Hosting-Einschätzung. Dies dient ausschließlich der unmittelbaren Anzeige des Ergebnisses und wird nicht dauerhaft gespeichert oder zu einem Personenprofil zusammengeführt.",
      ],
    },
    {
      heading: "3. Zugriffsdaten und IP-Adresse",
      paragraphs: [
        "Beim Aufruf der Seite verarbeitet der Server technisch notwendige Zugriffsdaten, darunter Ihre IP-Adresse. Die IP-Adresse wird zur Auslieferung der Seite sowie kurzzeitig zur Missbrauchs- und Überlastungsabwehr (Rate-Limiting) genutzt.",
        "Das Rate-Limiting hält ausschließlich flüchtige Zähler im Arbeitsspeicher (Zeitfenster von etwa 60 Sekunden). Es wird keine dauerhafte Protokolldatenbank mit IP-Adressen durch die Anwendung selbst angelegt.",
        "Rechtsgrundlage ist das berechtigte Interesse am sicheren und stabilen Betrieb der Seite gemäß Art. 6 Abs. 1 lit. f DSGVO. Der eingesetzte Hosting-Anbieter kann unabhängig hiervon eigene Server-Logs führen.",
      ],
    },
    {
      heading: "4. Verarbeitung bei Nutzung der Tools",
      paragraphs: [
        "Die Kernfunktion dieser Seite besteht darin, Informationen zu IP-Adressen, Domains und Netzwerken abzufragen. Wenn Sie Ihre eigene IP anzeigen lassen oder eine IP-Adresse bzw. Domain prüfen, wird die jeweilige IP-Adresse oder Domain an externe, öffentliche Dienste übermittelt, um die angefragten Informationen zu beschaffen.",
        "Einige Tools verarbeiten dabei mehr als nur eine IP-Adresse oder Domain: Beim CDN-Check wird die vollständige von Ihnen eingegebene URL einschließlich Pfad und Query-Parametern an das Ziel angefragt. Bei den Erreichbarkeitsprüfungen (Ping/Datenbank) können von Ihnen eingegebene Zugangsdaten – etwa Benutzername und Passwort – im Rahmen des Verbindungsaufbaus an das von Ihnen angegebene Ziel übertragen werden. Solche Eingaben werden nur für die jeweilige Prüfung verwendet, nicht dauerhaft gespeichert und über das von Ihnen angegebene Ziel hinaus nicht an Dritte weitergegeben.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Bereitstellung der von Ihnen aktiv angeforderten Funktion).",
      ],
    },
    {
      heading: "5. Eingebundene externe Dienste",
      paragraphs: [
        "Je nach genutztem Tool werden Anfragen an folgende Dienste gestellt. Ein Teil dieser Dienste hat seinen Sitz außerhalb der EU/des EWR (insbesondere in den USA). Eine solche Übermittlung in ein Drittland erfolgt auf Grundlage der jeweiligen Datenschutz- und Übermittlungsbedingungen des Anbieters; für einzelne Anbieter besteht möglicherweise kein Angemessenheitsbeschluss, und geeignete Garantien im Sinne des Art. 46 DSGVO können fehlen. Nähere Angaben zur Übermittlungsgrundlage für einen konkreten Dienst können Sie über die genannte Kontaktadresse anfragen.",
      ],
      bullets: [
        "ip-api.com – IP-Geolokalisierung und Netzwerk-Metadaten (serverseitig).",
        "ipinfo.io – optionale ASN-Details, sofern ein Token konfiguriert ist (serverseitig).",
        "stat.ripe.net (RIPE NCC, EU) – öffentliche Routing- und ASN-Daten (serverseitig).",
        "peeringdb.com – öffentliche Netzwerk- und Peering-Profile (serverseitig).",
        "WHOIS/RDAP – bei WHOIS-Abfragen wird das eingegebene Ziel zunächst an whois.iana.org und anschließend an den jeweils zuständigen Registry- bzw. Referral-WHOIS-Server übermittelt; rdap.org dient als RDAP-/Ausweichquelle (serverseitig).",
        "api.abuseipdb.com – optionale Reputations-/Missbrauchsdaten, sofern ein Schlüssel konfiguriert ist (serverseitig).",
        "DNS-Blacklists zen.spamhaus.org, bl.spamcop.net, b.barracudacentral.org – Reputationsprüfung (serverseitig).",
        "flagcdn.com – Länderflaggen. Enthält ein Ergebnis ein Land, wird der zugehörige Ländercode serverseitig über einen eigenen Proxy an flagcdn.com übermittelt (Ihre IP-Adresse wird dabei nicht weitergegeben); die Flaggengrafik wird serverseitig zwischengespeichert.",
        "Rekursiver DNS-Resolver – für domainbasierte Prüfungen wird der eingegebene Hostname über den vom Hosting bzw. System konfigurierten DNS-Resolver aufgelöst; dieser Resolver (ggf. durch den Hosting-Anbieter betrieben) erhält dabei den angefragten Hostnamen.",
        "api64.ipify.org und checkip.amazonaws.com – Ermittlung der eigenen IP-Adresse direkt aus Ihrem Browser; dabei wird Ihre IP-Adresse unmittelbar an diese Dienste übermittelt.",
      ],
    },
    {
      heading: "6. Lokale Speicherung (Theme)",
      paragraphs: [
        "Zur Speicherung Ihrer Designeinstellung (hell/dunkel/System) wird ein Wert im lokalen Speicher (localStorage) Ihres Browsers abgelegt. Dies ist technisch funktional, dient ausschließlich Ihrer Voreinstellung und übermittelt keine Daten an den Server oder an Dritte. Eine Einwilligung ist hierfür nicht erforderlich.",
      ],
    },
    {
      heading: "7. Cookies",
      paragraphs: [
        "Diese Seite setzt keine Einwilligungs-, Tracking- oder Werbe-Cookies und keine vergleichbaren Techniken zum geräteübergreifenden Wiedererkennen ein. Es findet lediglich die unter „Lokale Speicherung (Theme)“ beschriebene, technisch notwendige Speicherung Ihrer Designeinstellung im lokalen Speicher Ihres Browsers statt.",
        "Da keine zustimmungspflichtigen Cookies oder Tracker verwendet werden, ist ein Cookie-Banner für diese Seite nicht erforderlich.",
      ],
    },
    {
      heading: "8. Datensicherheit",
      paragraphs: [
        "Der Abruf der Seite erfolgt verschlüsselt über HTTPS (TLS), um die Übertragung gegen unbefugte Kenntnisnahme und Manipulation zu schützen. Darüber hinaus werden im Rahmen der Möglichkeiten dieses Hobbyprojekts angemessene technische und organisatorische Maßnahmen getroffen, um die verarbeiteten Daten gegen Verlust, Missbrauch und unbefugten Zugriff zu sichern.",
        "Ein vollständiger Schutz bei der Übertragung über das Internet kann nach dem Stand der Technik jedoch nicht garantiert werden.",
      ],
    },
    {
      heading: "9. Kontaktaufnahme",
      paragraphs: [
        "Wenn Sie uns über die angegebene Kontaktadresse ansprechen, verarbeiten wir die von Ihnen mitgeteilten Angaben (etwa Ihre E-Mail-Adresse und den Inhalt der Nachricht) ausschließlich zur Bearbeitung Ihres Anliegens. Rechtsgrundlage ist unser berechtigtes Interesse an der Beantwortung von Anfragen gemäß Art. 6 Abs. 1 lit. f DSGVO.",
        "Die Angaben werden gelöscht, sobald sie zur Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
      ],
    },
    {
      heading: "10. Speicherdauer",
      paragraphs: [
        "Die Anwendung speichert Anfragedaten nicht dauerhaft. Rate-Limiting-Zähler verlieren nach Ablauf des Zeitfensters (etwa 60 Sekunden) ihre Gültigkeit; die tatsächliche Entfernung des zugehörigen Eintrags aus dem Arbeitsspeicher erfolgt bei einem späteren Aufräumvorgang im Zuge weiterer Anfragen. Bleibt weiterer Verkehr aus, kann ein bereits abgelaufener Eintrag bis zum nächsten Aufräumvorgang oder bis zum Neustart des Prozesses im Speicher verbleiben. Eine dauerhafte oder personenbezogen auswertbare Speicherung findet nicht statt.",
        "An externe Dienste übermittelte Daten unterliegen den jeweiligen Datenschutzbestimmungen dieser Anbieter.",
      ],
    },
    {
      heading: "11. Keine automatisierte Entscheidungsfindung",
      paragraphs: [
        "Es findet keine ausschließlich automatisierte Entscheidungsfindung einschließlich Profiling im Sinne des Art. 22 DSGVO statt. Die von den Tools angezeigten Einschätzungen – etwa zu Verbindungstyp oder Proxy-/Hosting-Nutzung – dienen allein Ihrer unmittelbaren Information und entfalten keine rechtliche Wirkung Ihnen gegenüber.",
      ],
    },
    {
      heading: "12. Ihre Rechte",
      paragraphs: [
        "Sie haben im Rahmen der gesetzlichen Voraussetzungen das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das Recht, einer Verarbeitung auf Grundlage berechtigter Interessen zu widersprechen.",
        "Da Verarbeitungen auf Grundlage berechtigter Interessen erfolgen, haben Sie zudem das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen diese Verarbeitung Widerspruch einzulegen (Art. 21 DSGVO).",
        "Darüber hinaus haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für Anliegen erreichen Sie uns unter: {email}",
      ],
    },
    {
      heading: "13. Änderungen dieser Erklärung",
      paragraphs: [
        "Diese Datenschutzerklärung wird bei Bedarf angepasst, etwa wenn sich Funktionen oder eingebundene Dienste ändern. Es gilt jeweils die hier veröffentlichte Fassung.",
      ],
    },
  ],
};

const en: PrivacyContent = {
  navLabel: "Privacy",
  title: "Privacy Policy",
  subtitle:
    "How this site handles personal data — in particular IP addresses.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: LAST_UPDATED,
  contactNotConfigured: "contact address on request",
  controllerNotConfigured: "the operator of this site (identity available on request)",
  sections: [
    {
      heading: "1. Controller",
      paragraphs: [
        "This site is a private, non-commercial hobby project. The controller within the meaning of the General Data Protection Regulation (GDPR) is {controller}.",
        "Contact for data protection matters: {email}",
      ],
    },
    {
      heading: "2. Data minimization",
      paragraphs: [
        "This site uses no tracking cookies, no web analytics, no advertising networks and no user accounts. No tracking, advertising or persistent user profiles are built, and no personal data is processed for marketing purposes.",
        "When displaying your own IP address, however, network attributes are derived from that address on the fly — such as approximate location, provider/ASN, connection type, and a proxy/hosting assessment. This serves only to display the result immediately and is not stored permanently or combined into a personal profile.",
      ],
    },
    {
      heading: "3. Access data and IP address",
      paragraphs: [
        "When you open the site, the server processes technically necessary access data, including your IP address. The IP address is used to deliver the site and, briefly, to prevent abuse and overload (rate limiting).",
        "Rate limiting keeps only transient counters in memory (a window of roughly 60 seconds). The application itself does not create a persistent log database of IP addresses.",
        "The legal basis is the legitimate interest in operating the site securely and reliably under Art. 6(1)(f) GDPR. Independently of this, the hosting provider may keep its own server logs.",
      ],
    },
    {
      heading: "4. Processing when using the tools",
      paragraphs: [
        "The core function of this site is to look up information about IP addresses, domains and networks. When you view your own IP or check an IP address or domain, that IP address or domain is sent to external, public services in order to obtain the requested information.",
        "Some tools process more than just an IP address or domain: the CDN check requests the full URL you enter — including its path and query parameters — from the target. The reachability checks (ping/database) may transmit credentials you enter, such as a username and password, to the target you specify as part of establishing the connection. Such inputs are used only for the respective check, are not stored permanently, and are not shared with third parties beyond the target you specify.",
        "The legal basis is Art. 6(1)(f) GDPR (providing the function you actively requested).",
      ],
    },
    {
      heading: "5. Embedded external services",
      paragraphs: [
        "Depending on the tool used, requests are made to the following services. Some of these services are located outside the EU/EEA (in particular the USA). Any such transfer to a third country takes place on the basis of the respective provider's data protection and transfer terms; for individual providers there may be no adequacy decision, and appropriate safeguards within the meaning of Art. 46 GDPR may be absent. You can request further details about the transfer basis for a specific service via the contact address below.",
      ],
      bullets: [
        "ip-api.com – IP geolocation and network metadata (server-side).",
        "ipinfo.io – optional ASN details if a token is configured (server-side).",
        "stat.ripe.net (RIPE NCC, EU) – public routing and ASN data (server-side).",
        "peeringdb.com – public network and peering profiles (server-side).",
        "WHOIS/RDAP – for WHOIS lookups the entered target is first sent to whois.iana.org and then to the relevant registry or referral WHOIS server; rdap.org serves as an RDAP/fallback source (server-side).",
        "api.abuseipdb.com – optional reputation/abuse data if a key is configured (server-side).",
        "DNS blacklists zen.spamhaus.org, bl.spamcop.net, b.barracudacentral.org – reputation checks (server-side).",
        "flagcdn.com – country flags. When a result includes a country, the corresponding country code is forwarded server-side via an own proxy to flagcdn.com (your IP address is not shared in the process); the flag image is cached server-side.",
        "Recursive DNS resolver – for domain-based checks the entered hostname is resolved via the DNS resolver configured by the hosting/system; that resolver (possibly operated by the hosting provider) receives the queried hostname.",
        "api64.ipify.org and checkip.amazonaws.com – discovering your own IP directly from your browser; your IP address is sent directly to these services.",
      ],
    },
    {
      heading: "6. Local storage (theme)",
      paragraphs: [
        "Your theme preference (light/dark/system) is stored as a value in your browser's local storage. This is technically functional, serves only your preference, and transmits no data to the server or third parties. No consent is required for this.",
      ],
    },
    {
      heading: "7. Cookies",
      paragraphs: [
        "This site sets no consent, tracking or advertising cookies, and uses no comparable techniques to recognize you across devices. Only the technically necessary storage of your theme preference described under “Local storage (theme)” takes place, in your browser's local storage.",
        "Because no consent-requiring cookies or trackers are used, a cookie banner is not required for this site.",
      ],
    },
    {
      heading: "8. Data security",
      paragraphs: [
        "The site is served over encrypted HTTPS (TLS) to protect the transmission against unauthorized access and tampering. Beyond that, appropriate technical and organizational measures are taken — within the means of this hobby project — to protect the processed data against loss, misuse and unauthorized access.",
        "Complete protection during transmission over the internet cannot, however, be guaranteed according to the current state of the art.",
      ],
    },
    {
      heading: "9. Contacting us",
      paragraphs: [
        "If you contact us at the address provided, we process the information you share (such as your email address and the content of your message) solely to handle your request. The legal basis is our legitimate interest in responding to enquiries under Art. 6(1)(f) GDPR.",
        "The information is deleted once it is no longer required to handle the request and no statutory retention obligations apply.",
      ],
    },
    {
      heading: "10. Retention",
      paragraphs: [
        "The application does not store request data permanently. Rate-limiting counters expire after the time window (roughly 60 seconds); the associated entry is physically removed from memory during a later cleanup triggered by subsequent requests. If no further traffic arrives, an already-expired entry may remain in memory until the next cleanup or until the process restarts. No permanent or personally evaluable storage takes place.",
        "Data sent to external services is subject to the respective privacy policies of those providers.",
      ],
    },
    {
      heading: "11. No automated decision-making",
      paragraphs: [
        "There is no solely automated decision-making, including profiling, within the meaning of Art. 22 GDPR. The assessments shown by the tools — for example regarding connection type or proxy/hosting use — serve only to inform you directly and have no legal effect concerning you.",
      ],
    },
    {
      heading: "12. Your rights",
      paragraphs: [
        "Subject to the legal requirements, you have the right of access, rectification, erasure, restriction of processing, data portability, and the right to object to processing based on legitimate interests.",
        "Because processing is carried out on the basis of legitimate interests, you also have the right to object at any time, on grounds relating to your particular situation, to that processing (Art. 21 GDPR).",
        "You also have the right to lodge a complaint with a data protection supervisory authority. For any request, you can reach us at: {email}",
      ],
    },
    {
      heading: "13. Changes to this policy",
      paragraphs: [
        "This privacy policy is updated when necessary, for example when features or embedded services change. The version published here applies in each case.",
      ],
    },
  ],
};

const CONTENT_BY_LOCALE: Partial<Record<Locale, PrivacyContent>> = {
  de,
  en,
};

/** Returns the privacy content for the locale, defaulting to English. */
export function getPrivacyContent(locale: Locale): PrivacyContent {
  return CONTENT_BY_LOCALE[locale] ?? en;
}
