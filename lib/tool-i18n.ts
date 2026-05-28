import { type Locale } from "@/lib/i18n";

type ToolTranslation = {
  pingTabLabel: string;
  dnsTabLabel: string;
  whoisTabLabel: string;
  cdnTabLabel: string;
  clientDnsTabLabel: string;
  runtimeDnsTabLabel: string;
  pingTitle: string;
  pingSubtitle: string;
  dnsTitle: string;
  dnsSubtitle: string;
  whoisTitle: string;
  whoisSubtitle: string;
  cdnTitle: string;
  cdnSubtitle: string;
  clientDnsTitle: string;
  clientDnsSubtitle: string;
  runtimeDnsTitle: string;
  runtimeDnsSubtitle: string;
  targetPlaceholder: string;
  lookupInProgress: string;
  dnsLookupButton: string;
  dnsLookupError: string;
  dnsNetworkError: string;
  dnsRecordsFor: string;
  resolvedAddresses: string;
  noAddressResult: string;
  recordDetails: string;
  whoisPlaceholder: string;
  whoisLookupButton: string;
  whoisLookupError: string;
  whoisNetworkError: string;
  whoisFor: string;
  queriedServer: string;
  referralSource: string;
  noWhoisData: string;
  pingPlan: string;
  pingTestMode: string;
  pingModeHelperTcp: string;
  pingModeHelperUdp: string;
  pingModeHelperEb: string;
  pingModeHelperDatabase: string;
  pingModeDatabase: string;
  pingDatabaseType: string;
  pingTargetHost: string;
  pingPort: string;
  pingTimeout: string;
  pingUseAuth: string;
  pingUsername: string;
  pingPassword: string;
  pingDatabaseOptional: string;
  pingRunButton: string;
  pingRunning: string;
  pingCheckFailed: string;
  pingNetworkError: string;
  pingModeLabel: string;
  pingLatencyLabel: string;
  pingTargetLabel: string;
  pingDetailsLabel: string;
  pingCurrentPlanTcp: string;
  pingCurrentPlanUdp: string;
  pingCurrentPlanEb: string;
  pingCurrentPlanDbAuth: string;
  pingCurrentPlanDbProtocol: string;
  cdnAnalyzeButton: string;
  cdnAnalyzing: string;
  cdnAnalyzeError: string;
  cdnNetworkError: string;
  cdnSummaryUnreachable: string;
  cdnSummaryNoMatch: string;
  cdnSummaryDetected: string;
  cdnConfidenceNa: string;
  cdnNoProviderMatch: string;
  cdnInspectIpsHint: string;
  cdnTargetLabel: string;
  cdnHttpStatusLabel: string;
  cdnProviderLabel: string;
  cdnUnknown: string;
  cdnMatchedSignals: string;
  cdnNoSignals: string;
  cdnCnameChain: string;
  cdnNoCname: string;
  cdnInterestingHeaders: string;
  cdnNoHeaders: string;
  clientDnsEstimate: string;
  clientDnsScanning: string;
  clientDnsCheckedAt: string;
  clientDnsNoData: string;
  clientDnsRuntimeEnvironment: string;
  clientDnsMethodPrefix: string;
  clientDnsMethodRuntime: string;
  clientDnsLeakTestCaveat: string;
  clientDnsEnvironmentPrefix: string;
  clientDnsSummaryPrefix: string;
  clientDnsDetectedResolvers: string;
  clientDnsDetectedResolversPlural: string;
  clientDnsKnownResolvers: string;
  clientDnsUnknownResolvers: string;
  clientDnsNoResolvers: string;
  clientDnsStrong: string;
  clientDnsModerate: string;
  clientDnsWeak: string;
  clientDnsUnknownPrivacy: string;
  clientDnsNotScored: string;
  clientDnsHighPrivacy: string;
  clientDnsMediumPrivacy: string;
  clientDnsLowPrivacy: string;
  clientDnsUnknownPrivacyLabel: string;
  clientDnsProviderPolicy: string;
  clientDnsGuidanceIntro: string;
  clientDnsGuidancePrefer: string;
  clientDnsGuidanceNetworks: string;
  clientDnsRescan: string;
};

const en: ToolTranslation = {
  pingTabLabel: "Ping Tester",
  dnsTabLabel: "DNS Lookup",
  whoisTabLabel: "WHOIS Lookup",
  cdnTabLabel: "CDN Checker",
  clientDnsTabLabel: "Runtime DNS Scan",
  runtimeDnsTabLabel: "Runtime DNS Scan",
  pingTitle: "Ping & Port Tester",
  pingSubtitle: "Guided checks for TCP/UDP ports, EB endpoints, and database connectivity with a cleaner test workflow.",
  dnsTitle: "DNS Lookup",
  dnsSubtitle: "Query domain DNS records (A, AAAA, CNAME, MX, NS, TXT, SRV) from a single page.",
  whoisTitle: "WHOIS Lookup",
  whoisSubtitle: "Query WHOIS records for domains and IP addresses directly from this app.",
  cdnTitle: "CDN Usage Checker",
  cdnSubtitle: "Analyze any domain for CDN usage and likely provider (including CloudFront, Google Cloud CDN, Azure CDN, Vercel, and more).",
  clientDnsTitle: "Runtime DNS Resolver Scan",
  clientDnsSubtitle:
    "Detect DNS resolvers visible to this server runtime, identify known DNS providers, and estimate privacy posture with practical guidance.",
  runtimeDnsTitle: "Runtime DNS Resolver Scan",
  runtimeDnsSubtitle:
    "Inspect the DNS resolvers visible to this app runtime. This is server/runtime visibility, not a browser DNS leak test.",
  targetPlaceholder: "example.com",
  lookupInProgress: "Looking up...",
  dnsLookupButton: "Lookup DNS",
  dnsLookupError: "DNS lookup failed.",
  dnsNetworkError: "Network error while contacting /api/dns.",
  dnsRecordsFor: "DNS records for",
  resolvedAddresses: "Resolved addresses",
  noAddressResult: "No A/AAAA lookup result.",
  recordDetails: "Record details",
  whoisPlaceholder: "example.com or 8.8.8.8",
  whoisLookupButton: "Lookup WHOIS",
  whoisLookupError: "WHOIS lookup failed.",
  whoisNetworkError: "Network error while contacting /api/whois.",
  whoisFor: "WHOIS for",
  queriedServer: "Queried server",
  referralSource: "Referral source",
  noWhoisData: "No WHOIS data returned.",
  pingPlan: "Current test plan",
  pingTestMode: "Test mode",
  pingModeHelperTcp: "Verifies whether the TCP port accepts a connection.",
  pingModeHelperUdp: "Sends a UDP probe and reports immediate response/error behavior.",
  pingModeHelperEb: "Checks TCP first, then tries HTTP/HTTPS endpoint reachability.",
  pingModeHelperDatabase: "Runs pre-auth protocol checks and optional authenticated checks.",
  pingModeDatabase: "Database",
  pingDatabaseType: "Database type",
  pingTargetHost: "Target host / IP",
  pingPort: "Port",
  pingTimeout: "Timeout (ms)",
  pingUseAuth: "Check with authentication",
  pingUsername: "Username",
  pingPassword: "Password",
  pingDatabaseOptional: "Database (optional)",
  pingRunButton: "Run ping test",
  pingRunning: "Running check...",
  pingCheckFailed: "Ping check failed.",
  pingNetworkError: "Network error while contacting /api/ping.",
  pingModeLabel: "Mode",
  pingLatencyLabel: "Latency",
  pingTargetLabel: "Target",
  pingDetailsLabel: "Details",
  pingCurrentPlanTcp: "TCP check against",
  pingCurrentPlanUdp: "UDP check against",
  pingCurrentPlanEb: "EB check against",
  pingCurrentPlanDbAuth: "authenticated check against",
  pingCurrentPlanDbProtocol: "protocol check against",
  cdnAnalyzeButton: "Check CDN",
  cdnAnalyzing: "Analyzing...",
  cdnAnalyzeError: "Could not analyze this target.",
  cdnNetworkError: "Network error while contacting the CDN checker.",
  cdnSummaryUnreachable: "Target unreachable",
  cdnSummaryNoMatch: "No confident CDN match",
  cdnSummaryDetected: "CDN detected",
  cdnConfidenceNa: "n/a",
  cdnNoProviderMatch: "No provider matched - resolved IPs",
  cdnInspectIpsHint: "You can inspect these IPs in the IP lookup page:",
  cdnTargetLabel: "Target",
  cdnHttpStatusLabel: "HTTP Status",
  cdnProviderLabel: "Provider",
  cdnUnknown: "Unknown",
  cdnMatchedSignals: "Matched signals",
  cdnNoSignals: "No explicit CDN signal matched.",
  cdnCnameChain: "CNAME chain",
  cdnNoCname: "No CNAME records discovered.",
  cdnInterestingHeaders: "Interesting response headers",
  cdnNoHeaders: "No relevant headers found.",
  clientDnsEstimate: "DNS privacy estimate",
  clientDnsScanning: "Scanning active resolvers...",
  clientDnsCheckedAt: "Checked at",
  clientDnsNoData: "No DNS scan results available right now.",
  clientDnsRuntimeEnvironment: "This scanner inspects DNS resolvers visible to the app runtime. In production this describes the server or hosting platform, not the visitor browser.",
  clientDnsMethodPrefix: "Method:",
  clientDnsMethodRuntime: "Node.js runtime resolver configuration (dns.getServers).",
  clientDnsLeakTestCaveat: "This is not a dnsleaktest.com-style browser DNS leak test and should not be compared as one.",
  clientDnsEnvironmentPrefix: "Environment:",
  clientDnsSummaryPrefix: "Summary:",
  clientDnsDetectedResolvers: "Detected resolver",
  clientDnsDetectedResolversPlural: "Detected resolvers",
  clientDnsKnownResolvers: "known",
  clientDnsUnknownResolvers: "unknown",
  clientDnsNoResolvers: "No resolvers were returned by the runtime DNS stack.",
  clientDnsStrong: "Strong privacy posture",
  clientDnsModerate: "Moderate privacy posture",
  clientDnsWeak: "Weak privacy posture",
  clientDnsUnknownPrivacy: "Unknown privacy posture",
  clientDnsNotScored: "Not scored",
  clientDnsHighPrivacy: "high privacy",
  clientDnsMediumPrivacy: "medium privacy",
  clientDnsLowPrivacy: "low privacy",
  clientDnsUnknownPrivacyLabel: "unknown",
  clientDnsProviderPolicy: "Provider policy page",
  clientDnsGuidanceIntro:
    "DNS resolvers can still see your queried domains unless you use encrypted DNS (DoH/DoT) and a privacy-focused provider.",
  clientDnsGuidancePrefer:
    "Prefer resolvers with transparent data-retention policies and optional malware blocking.",
  clientDnsGuidanceNetworks: "Enterprise/VPN networks may intentionally override your local DNS settings.",
  clientDnsRescan: "Rescan DNS",
};

const de: Partial<ToolTranslation> = {
  pingTabLabel: "Ping-Tester",
  dnsTabLabel: "DNS-Abfrage",
  whoisTabLabel: "WHOIS-Abfrage",
  cdnTabLabel: "CDN-Prüfer",
  clientDnsTabLabel: "Runtime-DNS-Scan",
  runtimeDnsTabLabel: "Runtime-DNS-Scan",
  pingTitle: "Ping- & Port-Tester",
  pingSubtitle: "Geführte Prüfungen für TCP/UDP-Ports, EB-Endpunkte und Datenbank-Konnektivität in einem klaren Testablauf.",
  dnsTitle: "DNS-Abfrage",
  dnsSubtitle: "Domain-DNS-Einträge (A, AAAA, CNAME, MX, NS, TXT, SRV) auf einer Seite abfragen.",
  whoisTitle: "WHOIS-Abfrage",
  whoisSubtitle: "WHOIS-Daten für Domains und IP-Adressen direkt in dieser App abfragen.",
  cdnTitle: "CDN-Nutzungsprüfung",
  cdnSubtitle: "Analysiere beliebige Domains auf CDN-Nutzung und wahrscheinlichen Anbieter (u. a. CloudFront, Google Cloud CDN, Azure CDN, Vercel).",
  clientDnsTitle: "Runtime-DNS-Resolver-Scan",
  clientDnsSubtitle:
    "Erkenne DNS-Resolver, die für diese App-Laufzeit sichtbar sind, und bewerte die Datenschutzlage mit konkreten Hinweisen.",
  runtimeDnsTitle: "Runtime-DNS-Resolver-Scan",
  runtimeDnsSubtitle:
    "Prüft die DNS-Resolver, die für diese App-Laufzeit sichtbar sind. Das ist Server-/Runtime-Sichtbarkeit, kein Browser-DNS-Leak-Test.",
  lookupInProgress: "Suche läuft...",
  dnsLookupButton: "DNS abfragen",
  dnsLookupError: "DNS-Abfrage fehlgeschlagen.",
  dnsNetworkError: "Netzwerkfehler bei /api/dns.",
  dnsRecordsFor: "DNS-Einträge für",
  resolvedAddresses: "Aufgelöste Adressen",
  noAddressResult: "Kein A/AAAA-Ergebnis.",
  recordDetails: "Eintragsdetails",
  whoisLookupButton: "WHOIS abfragen",
  whoisLookupError: "WHOIS-Abfrage fehlgeschlagen.",
  whoisNetworkError: "Netzwerkfehler bei /api/whois.",
  whoisFor: "WHOIS für",
  queriedServer: "Abgefragter Server",
  referralSource: "Weiterleitungsquelle",
  noWhoisData: "Keine WHOIS-Daten zurückgegeben.",
  pingPlan: "Aktueller Testplan",
  pingTestMode: "Testmodus",
  pingModeHelperTcp: "Prüft, ob der TCP-Port eine Verbindung akzeptiert.",
  pingModeHelperUdp: "Sendet eine UDP-Probe und meldet unmittelbare Antworten/Fehler.",
  pingModeHelperEb: "Prüft zuerst TCP und danach die Erreichbarkeit von HTTP/HTTPS-Endpunkten.",
  pingModeHelperDatabase: "Führt Protokoll-Prüfungen vor Authentifizierung und optionale Auth-Checks aus.",
  pingModeDatabase: "Datenbank",
  pingDatabaseType: "Datenbanktyp",
  pingTargetHost: "Ziel-Host / IP",
  pingPort: "Port",
  pingTimeout: "Timeout (ms)",
  pingUseAuth: "Mit Authentifizierung prüfen",
  pingUsername: "Benutzername",
  pingPassword: "Passwort",
  pingDatabaseOptional: "Datenbank (optional)",
  pingRunButton: "Ping-Test starten",
  pingRunning: "Prüfung läuft...",
  pingCheckFailed: "Ping-Prüfung fehlgeschlagen.",
  pingNetworkError: "Netzwerkfehler bei /api/ping.",
  pingModeLabel: "Modus",
  pingLatencyLabel: "Latenz",
  pingTargetLabel: "Ziel",
  pingDetailsLabel: "Details",
  pingCurrentPlanTcp: "TCP-Prüfung gegen",
  pingCurrentPlanUdp: "UDP-Prüfung gegen",
  pingCurrentPlanEb: "EB-Prüfung gegen",
  pingCurrentPlanDbAuth: "Authentifizierte Prüfung gegen",
  pingCurrentPlanDbProtocol: "Protokoll-Prüfung gegen",
  cdnAnalyzeButton: "CDN prüfen",
  cdnAnalyzing: "Analyse läuft...",
  cdnAnalyzeError: "Dieses Ziel konnte nicht analysiert werden.",
  cdnNetworkError: "Netzwerkfehler beim CDN-Prüfer.",
  cdnSummaryUnreachable: "Ziel nicht erreichbar",
  cdnSummaryNoMatch: "Kein eindeutiger CDN-Treffer",
  cdnSummaryDetected: "CDN erkannt",
  cdnNoProviderMatch: "Kein Anbieter erkannt - aufgelöste IPs",
  cdnInspectIpsHint: "Diese IPs kannst du in der IP-Abfrage prüfen:",
  cdnTargetLabel: "Ziel",
  cdnHttpStatusLabel: "HTTP-Status",
  cdnProviderLabel: "Anbieter",
  cdnUnknown: "Unbekannt",
  cdnMatchedSignals: "Gefundene Signale",
  cdnNoSignals: "Kein eindeutiges CDN-Signal gefunden.",
  cdnCnameChain: "CNAME-Kette",
  cdnNoCname: "Keine CNAME-Einträge gefunden.",
  cdnInterestingHeaders: "Auffällige Response-Header",
  cdnNoHeaders: "Keine relevanten Header gefunden.",
  clientDnsEstimate: "DNS-Datenschutzbewertung",
  clientDnsScanning: "Aktive Resolver werden gescannt...",
  clientDnsCheckedAt: "Geprüft am",
  clientDnsNoData: "Aktuell liegen keine DNS-Scan-Ergebnisse vor.",
  clientDnsRuntimeEnvironment: "Dieser Scanner prüft DNS-Resolver, die für die App-Laufzeit sichtbar sind. In Produktion beschreibt das den Server oder die Hosting-Plattform, nicht den Browser des Besuchers.",
  clientDnsMethodPrefix: "Methode:",
  clientDnsMethodRuntime: "Node.js-Runtime-Resolver-Konfiguration (dns.getServers).",
  clientDnsLeakTestCaveat: "Das ist kein Browser-DNS-Leak-Test wie dnsleaktest.com und sollte nicht so verglichen werden.",
  clientDnsEnvironmentPrefix: "Umgebung:",
  clientDnsSummaryPrefix: "Zusammenfassung:",
  clientDnsDetectedResolvers: "Erkannter Resolver",
  clientDnsDetectedResolversPlural: "Erkannte Resolver",
  clientDnsKnownResolvers: "bekannt",
  clientDnsUnknownResolvers: "unbekannt",
  clientDnsNoResolvers: "Vom DNS-Stack der Laufzeit wurden keine Resolver zurückgegeben.",
  clientDnsStrong: "Starke Datenschutzlage",
  clientDnsModerate: "Mittlere Datenschutzlage",
  clientDnsWeak: "Schwache Datenschutzlage",
  clientDnsUnknownPrivacy: "Unbekannte Datenschutzlage",
  clientDnsNotScored: "Nicht bewertet",
  clientDnsHighPrivacy: "hoher Datenschutz",
  clientDnsMediumPrivacy: "mittlerer Datenschutz",
  clientDnsLowPrivacy: "niedriger Datenschutz",
  clientDnsUnknownPrivacyLabel: "unbekannt",
  clientDnsProviderPolicy: "Anbieter-Richtlinie",
  clientDnsGuidanceIntro:
    "DNS-Resolver können deine abgefragten Domains weiterhin sehen, sofern du kein verschlüsseltes DNS (DoH/DoT) mit einem datenschutzfreundlichen Anbieter nutzt.",
  clientDnsGuidancePrefer:
    "Bevorzuge Resolver mit transparenten Richtlinien zur Datenspeicherung und optionalem Malware-Schutz.",
  clientDnsGuidanceNetworks: "Enterprise-/VPN-Netzwerke können lokale DNS-Einstellungen absichtlich überschreiben.",
  clientDnsRescan: "DNS erneut scannen",
};

const toolTranslations: Record<Locale, ToolTranslation> = {
  de: { ...en, ...de },
  en,
  es: en,
  fr: en,
  "pt-BR": en,
  ja: en,
  ru: en,
  "zh-CN": en,
};

export function getToolTranslation(locale: Locale): ToolTranslation {
  return toolTranslations[locale] ?? en;
}
