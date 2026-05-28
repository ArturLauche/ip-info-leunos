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
  asnTabLabel: string;
  asnTitle: string;
  asnSubtitle: string;
  asnPlaceholder: string;
  asnLookupButton: string;
  asnLoading: string;
  asnInvalidInput: string;
  asnNetworkError: string;
  asnNotFound: string;
  asnNotAvailable: string;
  asnIdentityTitle: string;
  asnNameLabel: string;
  asnCountryLabel: string;
  asnRegistryLabel: string;
  asnAllocatedLabel: string;
  asnDomainLabel: string;
  asnTypeLabel: string;
  asnNumIpsLabel: string;
  asnRpkiLabel: string;
  asnPrefixesTitle: string;
  asnPrefixes4Label: string;
  asnPrefixes6Label: string;
  asnNoPrefixes: string;
  asnRelationsTitle: string;
  asnPeersLabel: string;
  asnUpstreamsLabel: string;
  asnDownstreamsLabel: string;
  asnNoRelations: string;
  asnPeeringTitle: string;
  asnAkaLabel: string;
  asnWebsiteLabel: string;
  asnLookingGlassLabel: string;
  asnRouteServerLabel: string;
  asnTrafficLabel: string;
  asnPolicyGeneralLabel: string;
  asnPolicyLocationsLabel: string;
  asnPolicyRatioLabel: string;
  asnPolicyContractsLabel: string;
  asnInfoPrefixes4Label: string;
  asnInfoPrefixes6Label: string;
  asnNoPeeringDb: string;
  asnIxTitle: string;
  asnNoIx: string;
  asnFacilitiesTitle: string;
  asnNoFacilities: string;
  asnSourcesTitle: string;
  asnWarningsTitle: string;
  asnSourceIpinfo: string;
  asnSourcePeeringdb: string;
  asnSourceAvailable: string;
  asnSourceUnavailable: string;
  asnSourceNotConfigured: string;
  asnSourceError: string;
  asnViewOnIpinfo: string;
  asnViewOnPeeringdb: string;
  asnYes: string;
  asnNo: string;
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
  asnTabLabel: "ASN Lookup",
  asnTitle: "ASN Lookup",
  asnSubtitle:
    "Look up an Autonomous System Number to combine IPinfo-style routing data with PeeringDB peering details.",
  asnPlaceholder: "Enter an ASN, e.g. AS8881 or 8881",
  asnLookupButton: "Lookup ASN",
  asnLoading: "Looking up...",
  asnInvalidInput: "Please enter a valid ASN, for example AS8881 or 8881.",
  asnNetworkError: "Network error while contacting the ASN lookup.",
  asnNotFound: "No public data was found for this ASN.",
  asnNotAvailable: "n/a",
  asnIdentityTitle: "ASN identity",
  asnNameLabel: "Name",
  asnCountryLabel: "Country",
  asnRegistryLabel: "Registry",
  asnAllocatedLabel: "Allocated",
  asnDomainLabel: "Domain",
  asnTypeLabel: "Type",
  asnNumIpsLabel: "IPv4 addresses",
  asnRpkiLabel: "RPKI",
  asnPrefixesTitle: "IP prefixes",
  asnPrefixes4Label: "IPv4 prefixes",
  asnPrefixes6Label: "IPv6 prefixes",
  asnNoPrefixes: "No prefixes available.",
  asnRelationsTitle: "Routing relationships",
  asnPeersLabel: "Peers",
  asnUpstreamsLabel: "Upstreams",
  asnDownstreamsLabel: "Downstreams",
  asnNoRelations: "No routing relationships available.",
  asnPeeringTitle: "PeeringDB profile",
  asnAkaLabel: "Also known as",
  asnWebsiteLabel: "Website",
  asnLookingGlassLabel: "Looking glass",
  asnRouteServerLabel: "Route server",
  asnTrafficLabel: "Traffic level",
  asnPolicyGeneralLabel: "Peering policy",
  asnPolicyLocationsLabel: "Policy locations",
  asnPolicyRatioLabel: "Ratio required",
  asnPolicyContractsLabel: "Contract required",
  asnInfoPrefixes4Label: "Declared IPv4 prefixes",
  asnInfoPrefixes6Label: "Declared IPv6 prefixes",
  asnNoPeeringDb: "This ASN does not maintain a PeeringDB profile.",
  asnIxTitle: "Internet exchange presence",
  asnNoIx: "No exchange presence listed.",
  asnFacilitiesTitle: "Facility presence",
  asnNoFacilities: "No facility presence listed.",
  asnSourcesTitle: "Data sources",
  asnWarningsTitle: "Notes",
  asnSourceIpinfo: "IPinfo",
  asnSourcePeeringdb: "PeeringDB",
  asnSourceAvailable: "Available",
  asnSourceUnavailable: "No data",
  asnSourceNotConfigured: "Not configured",
  asnSourceError: "Error",
  asnViewOnIpinfo: "View on IPinfo",
  asnViewOnPeeringdb: "View on PeeringDB",
  asnYes: "Yes",
  asnNo: "No",
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
  asnTabLabel: "ASN-Abfrage",
  asnTitle: "ASN-Abfrage",
  asnSubtitle:
    "Frage eine Autonomous-System-Nummer ab und kombiniere IPinfo-Routing-Daten mit PeeringDB-Peering-Details.",
  asnPlaceholder: "ASN eingeben, z. B. AS8881 oder 8881",
  asnLookupButton: "ASN abfragen",
  asnLoading: "Suche läuft...",
  asnInvalidInput: "Bitte gib eine gültige ASN ein, z. B. AS8881 oder 8881.",
  asnNetworkError: "Netzwerkfehler bei der ASN-Abfrage.",
  asnNotFound: "Für diese ASN wurden keine öffentlichen Daten gefunden.",
  asnNotAvailable: "n. v.",
  asnIdentityTitle: "ASN-Identität",
  asnNameLabel: "Name",
  asnCountryLabel: "Land",
  asnRegistryLabel: "Registry",
  asnAllocatedLabel: "Zugeteilt",
  asnDomainLabel: "Domain",
  asnTypeLabel: "Typ",
  asnNumIpsLabel: "IPv4-Adressen",
  asnRpkiLabel: "RPKI",
  asnPrefixesTitle: "IP-Präfixe",
  asnPrefixes4Label: "IPv4-Präfixe",
  asnPrefixes6Label: "IPv6-Präfixe",
  asnNoPrefixes: "Keine Präfixe verfügbar.",
  asnRelationsTitle: "Routing-Beziehungen",
  asnPeersLabel: "Peers",
  asnUpstreamsLabel: "Upstreams",
  asnDownstreamsLabel: "Downstreams",
  asnNoRelations: "Keine Routing-Beziehungen verfügbar.",
  asnPeeringTitle: "PeeringDB-Profil",
  asnAkaLabel: "Auch bekannt als",
  asnWebsiteLabel: "Webseite",
  asnLookingGlassLabel: "Looking Glass",
  asnRouteServerLabel: "Route Server",
  asnTrafficLabel: "Traffic-Niveau",
  asnPolicyGeneralLabel: "Peering-Richtlinie",
  asnPolicyLocationsLabel: "Richtlinien-Standorte",
  asnPolicyRatioLabel: "Ratio erforderlich",
  asnPolicyContractsLabel: "Vertrag erforderlich",
  asnInfoPrefixes4Label: "Angegebene IPv4-Präfixe",
  asnInfoPrefixes6Label: "Angegebene IPv6-Präfixe",
  asnNoPeeringDb: "Diese ASN pflegt kein PeeringDB-Profil.",
  asnIxTitle: "Internet-Exchange-Präsenz",
  asnNoIx: "Keine Exchange-Präsenz hinterlegt.",
  asnFacilitiesTitle: "Standort-Präsenz",
  asnNoFacilities: "Keine Standort-Präsenz hinterlegt.",
  asnSourcesTitle: "Datenquellen",
  asnWarningsTitle: "Hinweise",
  asnSourceAvailable: "Verfügbar",
  asnSourceUnavailable: "Keine Daten",
  asnSourceNotConfigured: "Nicht konfiguriert",
  asnSourceError: "Fehler",
  asnViewOnIpinfo: "Auf IPinfo ansehen",
  asnViewOnPeeringdb: "Auf PeeringDB ansehen",
  asnYes: "Ja",
  asnNo: "Nein",
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
