import { type Locale } from "@/lib/i18n";

type ToolTranslation = {
  pingTabLabel: string;
  dnsTabLabel: string;
  whoisTabLabel: string;
  cdnTabLabel: string;
  pingTitle: string;
  pingSubtitle: string;
  dnsTitle: string;
  dnsSubtitle: string;
  whoisTitle: string;
  whoisSubtitle: string;
  cdnTitle: string;
  cdnSubtitle: string;
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
  asnTabLabel: string;
  asnTitle: string;
  asnSubtitle: string;
  asnSearchPlaceholder: string;
  asnLookupButton: string;
  asnLookupInProgress: string;
  asnLookupError: string;
  asnNetworkError: string;
  asnNotFound: string;
  asnPartialData: string;
  asnIdentity: string;
  asnPrefixes: string;
  asnRouting: string;
  asnPeering: string;
  asnIxFacilities: string;
  asnSources: string;
  asnAnnounced: string;
  asnNotAnnounced: string;
  asnRegistry: string;
  asnAllocated: string;
  asnDomain: string;
  asnType: string;
  asnNumIps: string;
  asnPrefixes4: string;
  asnPrefixes6: string;
  asnPrefixes4Count: string;
  asnPrefixes6Count: string;
  asnPeers: string;
  asnUpstreams: string;
  asnDownstreams: string;
  asnRpkiStatus: string;
  asnRpkiValid: string;
  asnRpkiInvalid: string;
  asnRpkiNotFound: string;
  asnVisibility: string;
  asnTraffic: string;
  asnPolicyGeneral: string;
  asnPolicyLocations: string;
  asnPolicyRatio: string;
  asnPolicyContracts: string;
  asnLookingGlass: string;
  asnRouteServer: string;
  asnWebsite: string;
  asnIxPresence: string;
  asnFacilityPresence: string;
  asnSpeed: string;
  asnRouteServerPeer: string;
  asnSourceRipestat: string;
  asnSourcePeeringdb: string;
  asnSourceIpinfo: string;
  asnSourceAvailable: string;
  asnSourceUnavailable: string;
  asnSourceNotConfigured: string;
  asnSourceError: string;
  asnWarning: string;
  asnLoadMore: string;
  asnShowAll: string;
  asnSortByPower: string;
  asnSortByAsn: string;
  asnSortByName: string;
  asnNoPrefixes: string;
  asnNoIx: string;
  asnNoFacilities: string;
  asnNoPeers: string;
  asnNoUpstreams: string;
  asnNoDownstreams: string;
  asnRisPeers: string;
  asnRipestatAttribution: string;
  asnPeeringdbAttribution: string;
  asnNetworkInfo: string;
  asnQuickStats: string;
  asnIxCount: string;
  asnFacCount: string;
  asnTotalPrefixes: string;
  asnOperational: string;
  asnYes: string;
  asnNo: string;
  asnNoData: string;
  asnNeighborTable: string;
  asnNeighborPower: string;
};

const en: ToolTranslation = {
  pingTabLabel: "Ping Tester",
  dnsTabLabel: "DNS Lookup",
  whoisTabLabel: "WHOIS Lookup",
  cdnTabLabel: "CDN Checker",
  pingTitle: "Ping & Port Tester",
  pingSubtitle: "Guided checks for TCP/UDP ports, EB endpoints, and database connectivity with a cleaner test workflow.",
  dnsTitle: "DNS Lookup",
  dnsSubtitle: "Query domain DNS records (A, AAAA, CNAME, MX, NS, TXT, SRV) from a single page.",
  whoisTitle: "WHOIS Lookup",
  whoisSubtitle: "Query WHOIS records for domains and IP addresses directly from this app.",
  cdnTitle: "CDN Usage Checker",
  cdnSubtitle: "Analyze any domain for CDN usage and likely provider (including CloudFront, Google Cloud CDN, Azure CDN, Vercel, and more).",
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
  asnTabLabel: "ASN Lookup",
  asnTitle: "ASN Lookup",
  asnSubtitle: "View autonomous system details with routing, peering, and IX data from RIPEstat and PeeringDB.",
  asnSearchPlaceholder: "Enter ASN (e.g. AS8881 or 8881)...",
  asnLookupButton: "Lookup ASN",
  asnLookupInProgress: "Looking up ASN...",
  asnLookupError: "ASN lookup failed.",
  asnNetworkError: "Network error while contacting the ASN API.",
  asnNotFound: "No data found for this ASN.",
  asnPartialData: "Partial data available — some sources returned no results.",
  asnIdentity: "Identity",
  asnPrefixes: "Prefixes",
  asnRouting: "Routing",
  asnPeering: "Peering",
  asnIxFacilities: "IX & Facilities",
  asnSources: "Data Sources",
  asnAnnounced: "Announced",
  asnNotAnnounced: "Not announced",
  asnRegistry: "Registry",
  asnAllocated: "Allocated",
  asnDomain: "Domain",
  asnType: "Type",
  asnNumIps: "Total IPs",
  asnPrefixes4: "IPv4 Prefixes",
  asnPrefixes6: "IPv6 Prefixes",
  asnPrefixes4Count: "IPv4 Prefix Count",
  asnPrefixes6Count: "IPv6 Prefix Count",
  asnPeers: "Peers",
  asnUpstreams: "Upstreams",
  asnDownstreams: "Downstreams",
  asnRpkiStatus: "RPKI Status",
  asnRpkiValid: "Valid",
  asnRpkiInvalid: "Invalid",
  asnRpkiNotFound: "No ROA found",
  asnVisibility: "Visibility",
  asnTraffic: "Traffic",
  asnPolicyGeneral: "General Policy",
  asnPolicyLocations: "Location Policy",
  asnPolicyRatio: "Ratio Policy",
  asnPolicyContracts: "Contract Policy",
  asnLookingGlass: "Looking Glass",
  asnRouteServer: "Route Server",
  asnWebsite: "Website",
  asnIxPresence: "Internet Exchange Presence",
  asnFacilityPresence: "Facility Presence",
  asnSpeed: "Speed",
  asnRouteServerPeer: "RS Peer",
  asnSourceRipestat: "RIPEstat",
  asnSourcePeeringdb: "PeeringDB",
  asnSourceIpinfo: "IPinfo",
  asnSourceAvailable: "Available",
  asnSourceUnavailable: "No data",
  asnSourceNotConfigured: "Not configured",
  asnSourceError: "Error",
  asnWarning: "Warning",
  asnLoadMore: "Load more",
  asnShowAll: "Show all",
  asnSortByPower: "By power",
  asnSortByAsn: "By ASN",
  asnSortByName: "By name",
  asnNoPrefixes: "No announced prefixes found.",
  asnNoIx: "No IX presence data available.",
  asnNoFacilities: "No facility presence data available.",
  asnNoPeers: "No peers detected.",
  asnNoUpstreams: "No upstreams detected.",
  asnNoDownstreams: "No downstreams detected.",
  asnRisPeers: "RIS peers seeing",
  asnRipestatAttribution: "Routing data by",
  asnPeeringdbAttribution: "Peering data by",
  asnNetworkInfo: "Network Info",
  asnQuickStats: "Quick Stats",
  asnIxCount: "IXPs",
  asnFacCount: "Facilities",
  asnTotalPrefixes: "Total Prefixes",
  asnOperational: "Operational",
  asnYes: "Yes",
  asnNo: "No",
  asnNoData: "No data",
  asnNeighborTable: "ASN",
  asnNeighborPower: "Power",
};

const de: Partial<ToolTranslation> = {
  pingTabLabel: "Ping-Tester",
  dnsTabLabel: "DNS-Abfrage",
  whoisTabLabel: "WHOIS-Abfrage",
  cdnTabLabel: "CDN-Prüfer",
  pingTitle: "Ping- & Port-Tester",
  pingSubtitle: "Geführte Prüfungen für TCP/UDP-Ports, EB-Endpunkte und Datenbank-Konnektivität in einem klaren Testablauf.",
  dnsTitle: "DNS-Abfrage",
  dnsSubtitle: "Domain-DNS-Einträge (A, AAAA, CNAME, MX, NS, TXT, SRV) auf einer Seite abfragen.",
  whoisTitle: "WHOIS-Abfrage",
  whoisSubtitle: "WHOIS-Daten für Domains und IP-Adressen direkt in dieser App abfragen.",
  cdnTitle: "CDN-Nutzungsprüfung",
  cdnSubtitle: "Analysiere beliebige Domains auf CDN-Nutzung und wahrscheinlichen Anbieter (u. a. CloudFront, Google Cloud CDN, Azure CDN, Vercel).",
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
  asnTabLabel: "ASN-Abfrage",
  asnTitle: "ASN-Abfrage",
  asnSubtitle: "Details zur autonomen Systemnummer mit Routing-, Peering- und IX-Daten von RIPEstat und PeeringDB anzeigen.",
  asnSearchPlaceholder: "AS-Nummer eingeben (z.B. AS8881 oder 8881)...",
  asnLookupButton: "ASN suchen",
  asnLookupInProgress: "ASN wird gesucht...",
  asnLookupError: "ASN-Abfrage fehlgeschlagen.",
  asnNetworkError: "Netzwerkfehler bei der ASN-API.",
  asnNotFound: "Keine Daten für diese ASN gefunden.",
  asnPartialData: "Teilweise Daten verfügbar — einige Quellen lieferten keine Ergebnisse.",
  asnIdentity: "Identität",
  asnPrefixes: "Präfixe",
  asnRouting: "Routing",
  asnPeering: "Peering",
  asnIxFacilities: "IX & Rechenzentren",
  asnSources: "Datenquellen",
  asnAnnounced: "Angekündigt",
  asnNotAnnounced: "Nicht angekündigt",
  asnRegistry: "Registry",
  asnAllocated: "Zugewiesen",
  asnDomain: "Domain",
  asnType: "Typ",
  asnNumIps: "IPs gesamt",
  asnPrefixes4: "IPv4-Präfixe",
  asnPrefixes6: "IPv6-Präfixe",
  asnPrefixes4Count: "IPv4-Präfixanzahl",
  asnPrefixes6Count: "IPv6-Präfixanzahl",
  asnPeers: "Peers",
  asnUpstreams: "Upstreams",
  asnDownstreams: "Downstreams",
  asnRpkiStatus: "RPKI-Status",
  asnRpkiValid: "Gültig",
  asnRpkiInvalid: "Ungültig",
  asnRpkiNotFound: "Kein ROA gefunden",
  asnVisibility: "Sichtbarkeit",
  asnTraffic: "Traffic",
  asnPolicyGeneral: "Allgemeine Richtlinie",
  asnPolicyLocations: "Standort-Richtlinie",
  asnPolicyRatio: "Ratio-Richtlinie",
  asnPolicyContracts: "Vertrags-Richtlinie",
  asnLookingGlass: "Looking Glass",
  asnRouteServer: "Route Server",
  asnWebsite: "Webseite",
  asnIxPresence: "Internet-Exchange-Präsenz",
  asnFacilityPresence: "Rechenzentrums-Präsenz",
  asnSpeed: "Geschwindigkeit",
  asnRouteServerPeer: "RS-Peer",
  asnSourceRipestat: "RIPEstat",
  asnSourcePeeringdb: "PeeringDB",
  asnSourceIpinfo: "IPinfo",
  asnSourceAvailable: "Verfügbar",
  asnSourceUnavailable: "Keine Daten",
  asnSourceNotConfigured: "Nicht konfiguriert",
  asnSourceError: "Fehler",
  asnWarning: "Warnung",
  asnLoadMore: "Mehr laden",
  asnShowAll: "Alle anzeigen",
  asnSortByPower: "Nach Power",
  asnSortByAsn: "Nach ASN",
  asnSortByName: "Nach Name",
  asnNoPrefixes: "Keine angekündigten Präfixe gefunden.",
  asnNoIx: "Keine IX-Präsenzdaten verfügbar.",
  asnNoFacilities: "Keine Rechenzentrumsdaten verfügbar.",
  asnNoPeers: "Keine Peers erkannt.",
  asnNoUpstreams: "Keine Upstreams erkannt.",
  asnNoDownstreams: "Keine Downstreams erkannt.",
  asnRisPeers: "RIS-Peers",
  asnRipestatAttribution: "Routing-Daten von",
  asnPeeringdbAttribution: "Peering-Daten von",
  asnNetworkInfo: "Netzwerk-Info",
  asnQuickStats: "Schnellübersicht",
  asnIxCount: "IXPs",
  asnFacCount: "Rechenzentren",
  asnTotalPrefixes: "Präfixe gesamt",
  asnOperational: "Operativ",
  asnYes: "Ja",
  asnNo: "Nein",
  asnNoData: "Keine Daten",
  asnNeighborTable: "ASN",
  asnNeighborPower: "Power",
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
