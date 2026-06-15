import { ApiClientError } from "@/lib/api/client";
import { type Locale } from "@/lib/i18n";

type ToolTranslation = {
  errorRateLimited: string;
  errorInvalidTarget: string;
  errorTargetBlocked: string;
  errorTimeout: string;
  errorUpstream: string;
  errorBadRequest: string;
  errorTargetNetwork: string;
  showAll: string;
  showLess: string;
  navOverview: string;
  navDiagnostics: string;
  navMyIp: string;
  brandTagline: string;
  themeToggle: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  navMenu: string;
  copyValue: string;
  commandTriggerLabel: string;
  commandPlaceholder: string;
  commandGroupActions: string;
  commandGroupPages: string;
  commandEmpty: string;
  commandHintNavigate: string;
  commandHintSelect: string;
  commandHintClose: string;
  pingTabLabel: string;
  dnsTabLabel: string;
  whoisTabLabel: string;
  cdnTabLabel: string;
  asnTabLabel: string;
  reputationTabLabel: string;
  pingTitle: string;
  pingSubtitle: string;
  dnsTitle: string;
  dnsSubtitle: string;
  whoisTitle: string;
  whoisSubtitle: string;
  cdnTitle: string;
  cdnSubtitle: string;
  asnTitle: string;
  asnSubtitle: string;
  asnPlaceholder: string;
  asnLookupButton: string;
  asnLookingUp: string;
  asnInvalidInput: string;
  asnInvalidRange: string;
  asnNetworkError: string;
  asnUpstreamError: string;
  asnRateLimitError: string;
  asnEmptyTitle: string;
  asnEmptyDescription: string;
  dnsEmptyTitle: string;
  dnsEmptyDescription: string;
  whoisEmptyTitle: string;
  whoisEmptyDescription: string;
  cdnEmptyTitle: string;
  cdnEmptyDescription: string;
  asnNotFoundTitle: string;
  asnNotFoundDescription: string;
  asnPartialData: string;
  asnCompleteData: string;
  asnPrefixes: string;
  asnRouting: string;
  asnPeeringDb: string;
  asnIxPresence: string;
  asnFacilities: string;
  asnSourceDiagnostics: string;
  asnDetailedDiagnostics: string;
  asnUnnamed: string;
  asnRoutingDescription: string;
  asnIxDescription: string;
  asnPrefixesDescription: string;
  asnPeeringDbDescription: string;
  asnFacilitiesDescription: string;
  asnProfileIdentityHeading: string;
  asnProfileInterconnectionHeading: string;
  asnProfilePolicyHeading: string;
  asnWarnings: string;
  asnDiagnosticDuration: string;
  asnDiagnosticCache: string;
  asnCacheMiss: string;
  asnCacheFresh: string;
  asnCacheStale: string;
  asnCacheNotConfigured: string;
  asnNoPrefixes: string;
  asnNoRelations: string;
  asnMetricIpv4Addresses: string;
  asnMetricRoutingNeighbours: string;
  asnMetricIxPresence: string;
  asnMetricIpinfoDetail: string;
  asnMetricAnnouncedPrefixesDetail: string;
  asnMetricBgpRelationshipsDetail: string;
  asnMetricPeeringDbProfileDetail: string;
  asnPrefixIpCount: string;
  asnRelationPeers: string;
  asnRelationUpstreams: string;
  asnRelationDownstreams: string;
  asnRelationPower: string;
  asnSourceAvailable: string;
  asnSourceUnavailable: string;
  asnSourceNotConfigured: string;
  asnSourceError: string;
  asnLabelName: string;
  asnLabelCountry: string;
  asnLabelAllocated: string;
  asnLabelNetworkId: string;
  asnLabelAlsoKnownAs: string;
  asnLabelWebsite: string;
  asnLabelLookingGlass: string;
  asnLabelRouteServer: string;
  asnLabelTraffic: string;
  asnLabelPolicyGeneral: string;
  asnLabelPolicyLocations: string;
  asnLabelPolicyRatio: string;
  asnLabelPolicyContracts: string;
  asnLabelStatus: string;
  asnLabelExchange: string;
  asnLabelSpeed: string;
  asnLabelIpv4: string;
  asnLabelIpv6: string;
  asnLabelRsPeer: string;
  asnLabelFacility: string;
  asnLabelCity: string;
  asnLabelLocalAsn: string;
  asnBooleanYes: string;
  asnBooleanNo: string;
  asnSpeedMbps: string;
  asnNoIxLanRecords: string;
  asnNoFacilityRecords: string;
  asnWarningIpinfoUnavailable: string;
  asnWarningIpinfoUnexpected: string;
  asnWarningNoRipeStatData: string;
  asnWarningNoPeeringDbProfile: string;
  asnWarningProviderHttp: string;
  asnWarningProviderTimedOut: string;
  asnWarningProviderTooLarge: string;
  asnWarningProviderInvalidJson: string;
  asnWarningProviderUnavailable: string;
  asnWarningProviderStale: string;
  asnWarningTruncated: string;
  asnWarningLabelIpinfoIpv4Prefixes: string;
  asnWarningLabelIpinfoIpv6Prefixes: string;
  asnWarningLabelIpinfoPeers: string;
  asnWarningLabelIpinfoUpstreams: string;
  asnWarningLabelIpinfoDownstreams: string;
  asnWarningLabelPeeringDbIxLan: string;
  asnWarningLabelPeeringDbFacilities: string;
  asnWarningLabelRipeStatIpv4Prefixes: string;
  asnWarningLabelRipeStatIpv6Prefixes: string;
  asnWarningLabelRipeStatRoutingNeighbours: string;
  asnWarningLabelRipeStatUpstreamNeighbours: string;
  asnWarningLabelRipeStatDownstreamNeighbours: string;
  targetPlaceholder: string;
  lookupInProgress: string;
  dnsLookupButton: string;
  dnsLookupError: string;
  dnsRecordsFor: string;
  resolvedAddresses: string;
  noAddressResult: string;
  recordDetails: string;
  dnsRecordNotes: string;
  dnsTableType: string;
  dnsTableValue: string;
  dnsShowRaw: string;
  dnsHideRaw: string;
  dnsNoRecords: string;
  whoisPlaceholder: string;
  whoisLookupButton: string;
  whoisLookupError: string;
  whoisFor: string;
  queriedServer: string;
  referralSource: string;
  noWhoisData: string;
  whoisRegistrar: string;
  whoisCreated: string;
  whoisUpdated: string;
  whoisExpires: string;
  whoisStatusLabel: string;
  whoisNameservers: string;
  whoisShowRaw: string;
  whoisHideRaw: string;
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
  reputationTitle: string;
  reputationSubtitle: string;
  reputationPlaceholder: string;
  reputationCheckButton: string;
  reputationChecking: string;
  reputationNetworkError: string;
  reputationRateLimitError: string;
  reputationInvalidIp: string;
  reputationBlockedIp: string;
  reputationEmptyTitle: string;
  reputationEmptyDescription: string;
  reputationRiskLow: string;
  reputationRiskMedium: string;
  reputationRiskHigh: string;
  reputationScoreLabel: string;
  reputationNoThreats: string;
  reputationThreatProxy: string;
  reputationThreatTor: string;
  reputationThreatHosting: string;
  reputationThreatSpam: string;
  reputationThreatBotnet: string;
  reputationThreatAbuse: string;
  reputationBlacklistsLabel: string;
  reputationListedSummary: string;
  reputationBlacklistListed: string;
  reputationBlacklistClean: string;
  reputationBlacklistUnchecked: string;
  reputationAbuseLabel: string;
  reputationAbuseReports: string;
  reputationAbuseConfidence: string;
  reputationAbuseNotConfigured: string;
  reputationAbuseUnavailable: string;
  reputationGeoLabel: string;
  reputationNetworkLabel: string;
  reputationDisclaimer: string;
};

const en: ToolTranslation = {
  errorRateLimited: "Too many requests. Please wait a moment and try again.",
  errorInvalidTarget: "Please provide a valid public domain, IP address, or URL.",
  errorTargetBlocked: "Private, local, and internal targets cannot be checked on this public site.",
  errorTimeout: "The check timed out. The target may be slow or unreachable.",
  errorUpstream: "An upstream data provider is currently unavailable.",
  errorBadRequest: "The request parameters are invalid.",
  errorTargetNetwork: "The target could not be resolved or reached.",
  showAll: "Show all",
  showLess: "Show less",
  navOverview: "Overview",
  navDiagnostics: "Diagnostics",
  navMyIp: "My IP",
  brandTagline: "Network & IP toolkit",
  themeToggle: "Toggle theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  navMenu: "Menu",
  copyValue: "Copy",
  commandTriggerLabel: "Search…",
  commandPlaceholder: "Search tools, or enter an IP, domain or ASN…",
  commandGroupActions: "Actions",
  commandGroupPages: "Go to",
  commandEmpty: "No matching tools or actions.",
  commandHintNavigate: "Navigate",
  commandHintSelect: "Open",
  commandHintClose: "Close",
  pingTabLabel: "Ping Tester",
  dnsTabLabel: "DNS Lookup",
  whoisTabLabel: "WHOIS Lookup",
  cdnTabLabel: "CDN Checker",
  asnTabLabel: "ASN Lookup",
  reputationTabLabel: "IP Reputation",
  pingTitle: "Ping & Port Tester",
  pingSubtitle: "Guided checks for TCP/UDP ports, EB endpoints, and database connectivity with a cleaner test workflow.",
  dnsTitle: "DNS Lookup",
  dnsSubtitle: "Query DNS records (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) for domains and reverse DNS for IP addresses.",
  whoisTitle: "WHOIS Lookup",
  whoisSubtitle: "Query WHOIS records for domains and IP addresses directly from this app.",
  cdnTitle: "CDN Usage Checker",
  cdnSubtitle: "Analyze any domain for CDN usage and likely provider (including CloudFront, Google Cloud CDN, Azure CDN, Vercel, and more).",
  asnTitle: "ASN Information",
  asnSubtitle: "Look up autonomous systems with IPinfo ASN details and public PeeringDB interconnection data.",
  asnPlaceholder: "AS8881 or 8881",
  asnLookupButton: "Lookup ASN",
  asnLookingUp: "Looking up...",
  asnInvalidInput: "Use an AS-prefixed or numeric ASN, for example AS8881 or 8881.",
  asnInvalidRange: "ASN must be between 1 and {max}.",
  asnNetworkError: "Network error while contacting the ASN lookup.",
  asnUpstreamError: "ASN data providers are currently unavailable.",
  asnRateLimitError: "Too many ASN lookups. Please wait before trying again.",
  asnEmptyTitle: "Enter an ASN to inspect a network profile",
  asnEmptyDescription: "Use AS-prefixed or numeric input. Provider data may be partial depending on public records and the configured IPinfo plan.",
  dnsEmptyTitle: "Enter a domain to resolve its DNS records",
  dnsEmptyDescription: "Look up A, AAAA, MX, TXT, NS, SOA, SRV and CAA records, or run a reverse lookup on an IP address.",
  whoisEmptyTitle: "Enter a domain or IP to query WHOIS",
  whoisEmptyDescription: "Retrieve registrar, registration dates, status and nameservers from the responsible WHOIS server.",
  cdnEmptyTitle: "Enter a domain to detect its CDN",
  cdnEmptyDescription: "Inspect DNS, CNAME chains and response headers to identify the CDN or edge provider sitting in front of a site.",
  asnNotFoundTitle: "No ASN profile found",
  asnNotFoundDescription: "The ASN is valid, but neither configured source returned a usable public profile.",
  asnPartialData: "Partial data",
  asnCompleteData: "Complete",
  asnPrefixes: "Announced prefixes",
  asnRouting: "Routing relationships",
  asnPeeringDb: "PeeringDB profile",
  asnIxPresence: "IX presence",
  asnFacilities: "Facility presence",
  asnSourceDiagnostics: "Source diagnostics",
  asnDetailedDiagnostics: "Detailed diagnostics",
  asnUnnamed: "Unnamed AS",
  asnRoutingDescription:
    "Autonomous system interconnections, neighbours, and path weights. Higher weights indicate more frequently observed routing paths.",
  asnIxDescription:
    "Internet exchanges (IX) where this autonomous system is present, including interconnection bandwidth.",
  asnPrefixesDescription: "IP netblocks announced by this autonomous system to the global routing table.",
  asnPeeringDbDescription:
    "Interconnection profile and routing policies declared in the public PeeringDB database.",
  asnFacilitiesDescription: "Physical data centers and colocation facilities where this network is present.",
  asnProfileIdentityHeading: "Identity & status",
  asnProfileInterconnectionHeading: "Interconnection details",
  asnProfilePolicyHeading: "Peering policy",
  asnWarnings: "Warnings",
  asnDiagnosticDuration: "Duration",
  asnDiagnosticCache: "Cache",
  asnCacheMiss: "miss",
  asnCacheFresh: "fresh",
  asnCacheStale: "stale",
  asnCacheNotConfigured: "not configured",
  asnNoPrefixes: "No prefixes returned by the configured sources.",
  asnNoRelations: "No routing relationships returned by the configured sources.",
  asnMetricIpv4Addresses: "IPv4 addresses",
  asnMetricRoutingNeighbours: "Routing neighbours",
  asnMetricIxPresence: "IX presence",
  asnMetricIpinfoDetail: "IPinfo ASN data, when configured",
  asnMetricAnnouncedPrefixesDetail: "Announced prefixes",
  asnMetricBgpRelationshipsDetail: "IPinfo or RIPEstat BGP relationships",
  asnMetricPeeringDbProfileDetail: "PeeringDB network profile",
  asnPrefixIpCount: "IPs",
  asnRelationPeers: "Peers",
  asnRelationUpstreams: "Upstreams",
  asnRelationDownstreams: "Downstreams",
  asnRelationPower: "power",
  asnSourceAvailable: "available",
  asnSourceUnavailable: "unavailable",
  asnSourceNotConfigured: "not configured",
  asnSourceError: "error",
  asnLabelName: "Name",
  asnLabelCountry: "Country",
  asnLabelAllocated: "Allocated",
  asnLabelNetworkId: "Network ID",
  asnLabelAlsoKnownAs: "Also known as",
  asnLabelWebsite: "Website",
  asnLabelLookingGlass: "Looking glass",
  asnLabelRouteServer: "Route server",
  asnLabelTraffic: "Traffic",
  asnLabelPolicyGeneral: "Policy general",
  asnLabelPolicyLocations: "Policy locations",
  asnLabelPolicyRatio: "Policy ratio",
  asnLabelPolicyContracts: "Policy contracts",
  asnLabelStatus: "Status",
  asnLabelExchange: "Exchange",
  asnLabelSpeed: "Speed",
  asnLabelIpv4: "IPv4",
  asnLabelIpv6: "IPv6",
  asnLabelRsPeer: "RS peer",
  asnLabelFacility: "Facility",
  asnLabelCity: "City",
  asnLabelLocalAsn: "Local ASN",
  asnBooleanYes: "yes",
  asnBooleanNo: "no",
  asnSpeedMbps: "Mbps",
  asnNoIxLanRecords: "No IX LAN records returned.",
  asnNoFacilityRecords: "No facility records returned.",
  asnWarningIpinfoUnavailable: "IPinfo ASN data is unavailable for this ASN or token plan.",
  asnWarningIpinfoUnexpected: "IPinfo returned an unexpected ASN payload.",
  asnWarningNoRipeStatData: "No RIPEstat ASN data was found for this ASN.",
  asnWarningNoPeeringDbProfile: "No public PeeringDB network profile was found for this ASN.",
  asnWarningProviderHttp: "{provider} returned HTTP {status}.",
  asnWarningProviderTimedOut: "{provider} request timed out.",
  asnWarningProviderTooLarge: "{provider} response exceeded the size limit.",
  asnWarningProviderInvalidJson: "{provider} returned invalid JSON.",
  asnWarningProviderUnavailable: "{provider} data is currently unavailable.",
  asnWarningProviderStale: "{provider} data is currently unavailable; using stale cached data.",
  asnWarningTruncated: "{label} truncated to {limit} of {total} records.",
  asnWarningLabelIpinfoIpv4Prefixes: "IPinfo IPv4 prefixes",
  asnWarningLabelIpinfoIpv6Prefixes: "IPinfo IPv6 prefixes",
  asnWarningLabelIpinfoPeers: "IPinfo peers",
  asnWarningLabelIpinfoUpstreams: "IPinfo upstreams",
  asnWarningLabelIpinfoDownstreams: "IPinfo downstreams",
  asnWarningLabelPeeringDbIxLan: "PeeringDB IX LAN records",
  asnWarningLabelPeeringDbFacilities: "PeeringDB facilities",
  asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat IPv4 prefixes",
  asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat IPv6 prefixes",
  asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat routing neighbours",
  asnWarningLabelRipeStatUpstreamNeighbours: "RIPEstat upstream-side neighbours",
  asnWarningLabelRipeStatDownstreamNeighbours: "RIPEstat downstream-side neighbours",
  targetPlaceholder: "example.com",
  lookupInProgress: "Looking up...",
  dnsLookupButton: "Lookup DNS",
  dnsLookupError: "DNS lookup failed.",
  dnsRecordsFor: "DNS records for",
  resolvedAddresses: "Resolved addresses",
  noAddressResult: "No A/AAAA lookup result.",
  recordDetails: "Record details",
  dnsRecordNotes: "Record lookup notes",
  dnsTableType: "Type",
  dnsTableValue: "Value",
  dnsShowRaw: "Show raw JSON",
  dnsHideRaw: "Hide raw JSON",
  dnsNoRecords: "No records of the selected type were returned.",
  whoisPlaceholder: "example.com or 8.8.8.8",
  whoisLookupButton: "Lookup WHOIS",
  whoisLookupError: "WHOIS lookup failed.",
  whoisFor: "WHOIS for",
  queriedServer: "Queried server",
  referralSource: "Referral source",
  noWhoisData: "No WHOIS data returned.",
  whoisRegistrar: "Registrar",
  whoisCreated: "Created",
  whoisUpdated: "Updated",
  whoisExpires: "Expires",
  whoisStatusLabel: "Status",
  whoisNameservers: "Nameservers",
  whoisShowRaw: "Show raw output",
  whoisHideRaw: "Hide raw output",
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
  reputationTitle: "IP Reputation Check",
  reputationSubtitle: "Scan a public IP address against multiple reputation sources and get a concise risk summary.",
  reputationPlaceholder: "8.8.8.8 or 2001:4860:4860::8888",
  reputationCheckButton: "Check reputation",
  reputationChecking: "Checking...",
  reputationNetworkError: "Network error while contacting the reputation check.",
  reputationRateLimitError: "Too many reputation checks. Please wait before trying again.",
  reputationInvalidIp: "Please enter a valid public IP address (IPv4 or IPv6).",
  reputationBlockedIp: "Private, reserved, and internal IP ranges cannot be checked.",
  reputationEmptyTitle: "Enter an IP address to check its reputation",
  reputationEmptyDescription: "The IP is checked against DNS blacklists, proxy/hosting heuristics, and abuse reports when an AbuseIPDB key is configured.",
  reputationRiskLow: "Low risk",
  reputationRiskMedium: "Medium risk",
  reputationRiskHigh: "High risk",
  reputationScoreLabel: "Risk score",
  reputationNoThreats: "No threat categories detected.",
  reputationThreatProxy: "Proxy / VPN",
  reputationThreatTor: "Tor exit node",
  reputationThreatHosting: "Hosting / datacenter",
  reputationThreatSpam: "Spam source",
  reputationThreatBotnet: "Botnet / exploited",
  reputationThreatAbuse: "Abuse reported",
  reputationBlacklistsLabel: "Blacklists",
  reputationListedSummary: "{listed} of {checked} listed",
  reputationBlacklistListed: "listed",
  reputationBlacklistClean: "clean",
  reputationBlacklistUnchecked: "unchecked",
  reputationAbuseLabel: "Abuse reports",
  reputationAbuseReports: "{count} reports (90 days)",
  reputationAbuseConfidence: "{score}% confidence",
  reputationAbuseNotConfigured: "not configured",
  reputationAbuseUnavailable: "unavailable",
  reputationGeoLabel: "Geolocation",
  reputationNetworkLabel: "ASN / Provider",
  reputationDisclaimer: "Aggregated from public sources; results are indicative, not a definitive verdict.",
};

const de: Partial<ToolTranslation> = {
  pingTabLabel: "Ping-Tester",
  dnsTabLabel: "DNS-Abfrage",
  whoisTabLabel: "WHOIS-Abfrage",
  cdnTabLabel: "CDN-Prüfer",
  asnTabLabel: "ASN-Abfrage",
  reputationTabLabel: "IP-Reputation",
  errorRateLimited: "Zu viele Anfragen. Bitte warte kurz und versuche es erneut.",
  errorInvalidTarget: "Bitte gib eine gültige öffentliche Domain, IP-Adresse oder URL an.",
  errorTargetBlocked: "Private, lokale und interne Ziele können auf dieser öffentlichen Seite nicht geprüft werden.",
  errorTimeout: "Zeitüberschreitung bei der Prüfung. Das Ziel ist möglicherweise langsam oder nicht erreichbar.",
  errorUpstream: "Ein vorgelagerter Datenanbieter ist derzeit nicht verfügbar.",
  errorBadRequest: "Die Anfrageparameter sind ungültig.",
  errorTargetNetwork: "Das Ziel konnte nicht aufgelöst oder erreicht werden.",
  showAll: "Alle anzeigen",
  showLess: "Weniger anzeigen",
  navOverview: "Übersicht",
  navDiagnostics: "Diagnose",
  navMyIp: "Meine IP",
  brandTagline: "Netzwerk- & IP-Toolkit",
  themeToggle: "Theme wechseln",
  themeLight: "Hell",
  themeDark: "Dunkel",
  themeSystem: "System",
  navMenu: "Menü",
  copyValue: "Kopieren",
  commandTriggerLabel: "Suchen…",
  commandPlaceholder: "Tools suchen oder IP, Domain oder ASN eingeben…",
  commandGroupActions: "Aktionen",
  commandGroupPages: "Wechseln zu",
  commandEmpty: "Keine passenden Tools oder Aktionen.",
  commandHintNavigate: "Navigieren",
  commandHintSelect: "Öffnen",
  commandHintClose: "Schließen",
  pingTitle: "Ping- & Port-Tester",
  pingSubtitle: "Geführte Prüfungen für TCP/UDP-Ports, EB-Endpunkte und Datenbank-Konnektivität in einem klaren Testablauf.",
  dnsTitle: "DNS-Abfrage",
  dnsSubtitle: "DNS-Einträge (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) für Domains und Reverse-DNS für IP-Adressen abfragen.",
  whoisTitle: "WHOIS-Abfrage",
  whoisSubtitle: "WHOIS-Daten für Domains und IP-Adressen direkt in dieser App abfragen.",
  cdnTitle: "CDN-Nutzungsprüfung",
  cdnSubtitle: "Analysiere beliebige Domains auf CDN-Nutzung und wahrscheinlichen Anbieter (u. a. CloudFront, Google Cloud CDN, Azure CDN, Vercel).",
  asnTitle: "ASN-Informationen",
  asnSubtitle: "Autonome Systeme mit IPinfo-ASN-Daten und öffentlichen PeeringDB-Interconnection-Daten nachschlagen.",
  asnPlaceholder: "AS8881 oder 8881",
  asnLookupButton: "ASN abfragen",
  asnLookingUp: "Abfrage läuft...",
  asnInvalidInput: "Nutze eine AS-Nummer mit oder ohne Präfix, zum Beispiel AS8881 oder 8881.",
  asnInvalidRange: "ASN muss zwischen 1 und {max} liegen.",
  asnNetworkError: "Netzwerkfehler bei der ASN-Abfrage.",
  asnUpstreamError: "Die ASN-Datenquellen sind derzeit nicht verfügbar.",
  asnRateLimitError: "Zu viele ASN-Abfragen. Bitte warte kurz und versuche es dann erneut.",
  asnEmptyTitle: "ASN eingeben, um ein Netzwerkprofil zu prüfen",
  asnEmptyDescription: "AS-Präfix oder reine Zahl eingeben. Quelldaten können je nach öffentlichen Einträgen und IPinfo-Plan unvollständig sein.",
  dnsEmptyTitle: "Domain eingeben, um DNS-Records abzufragen",
  dnsEmptyDescription: "Frage A-, AAAA-, MX-, TXT-, NS-, SOA-, SRV- und CAA-Records ab oder löse eine IP-Adresse per Reverse-Lookup auf.",
  whoisEmptyTitle: "Domain oder IP eingeben, um WHOIS abzufragen",
  whoisEmptyDescription: "Ruft Registrar, Registrierungsdaten, Status und Nameserver vom zuständigen WHOIS-Server ab.",
  cdnEmptyTitle: "Domain eingeben, um das CDN zu erkennen",
  cdnEmptyDescription: "Analysiert DNS, CNAME-Ketten und Response-Header, um das CDN bzw. den Edge-Anbieter vor einer Seite zu identifizieren.",
  asnNotFoundTitle: "Kein ASN-Profil gefunden",
  asnNotFoundDescription: "Die ASN ist gültig, aber keine konfigurierte Quelle lieferte ein nutzbares öffentliches Profil.",
  asnPartialData: "Teildaten",
  asnCompleteData: "Vollständig",
  asnPrefixes: "Angekündigte Prefixe",
  asnRouting: "Routing-Beziehungen",
  asnPeeringDb: "PeeringDB-Profil",
  asnIxPresence: "IX-Präsenz",
  asnFacilities: "Standort-Präsenz",
  asnSourceDiagnostics: "Quellendiagnose",
  asnDetailedDiagnostics: "Detaillierte Diagnose",
  asnUnnamed: "Unbenanntes AS",
  asnRoutingDescription:
    "Verbindungen, Nachbarn und Pfadgewichte des autonomen Systems. Höhere Gewichte stehen für häufiger beobachtete Routing-Pfade.",
  asnIxDescription:
    "Internet-Exchanges (IX), an denen dieses autonome System präsent ist, inklusive Anbindungsbandbreite.",
  asnPrefixesDescription: "IP-Netzblöcke, die dieses autonome System in der globalen Routing-Tabelle ankündigt.",
  asnPeeringDbDescription:
    "Interconnection-Profil und Routing-Richtlinien aus der öffentlichen PeeringDB-Datenbank.",
  asnFacilitiesDescription: "Physische Rechenzentren und Colocation-Standorte, an denen dieses Netzwerk präsent ist.",
  asnProfileIdentityHeading: "Identität & Status",
  asnProfileInterconnectionHeading: "Interconnection-Details",
  asnProfilePolicyHeading: "Peering-Richtlinie",
  asnWarnings: "Warnungen",
  asnDiagnosticDuration: "Dauer",
  asnDiagnosticCache: "Cache",
  asnCacheMiss: "nicht im Cache",
  asnCacheFresh: "frisch",
  asnCacheStale: "veraltet",
  asnCacheNotConfigured: "nicht konfiguriert",
  asnNoPrefixes: "Keine Prefixe von den konfigurierten Quellen erhalten.",
  asnNoRelations: "Keine Routing-Beziehungen von den konfigurierten Quellen erhalten.",
  asnMetricIpv4Addresses: "IPv4-Adressen",
  asnMetricRoutingNeighbours: "Routing-Nachbarn",
  asnMetricIxPresence: "IX-Präsenz",
  asnMetricIpinfoDetail: "IPinfo-ASN-Daten, wenn konfiguriert",
  asnMetricAnnouncedPrefixesDetail: "Angekündigte Prefixe",
  asnMetricBgpRelationshipsDetail: "BGP-Beziehungen aus IPinfo oder RIPEstat",
  asnMetricPeeringDbProfileDetail: "PeeringDB-Netzwerkprofil",
  asnPrefixIpCount: "IPs",
  asnRelationPeers: "Peers",
  asnRelationUpstreams: "Upstreams",
  asnRelationDownstreams: "Downstreams",
  asnRelationPower: "Gewicht",
  asnSourceAvailable: "verfügbar",
  asnSourceUnavailable: "nicht verfügbar",
  asnSourceNotConfigured: "nicht konfiguriert",
  asnSourceError: "Fehler",
  asnLabelName: "Name",
  asnLabelCountry: "Land",
  asnLabelAllocated: "Zugewiesen",
  asnLabelNetworkId: "Netzwerk-ID",
  asnLabelAlsoKnownAs: "Auch bekannt als",
  asnLabelWebsite: "Website",
  asnLabelLookingGlass: "Looking Glass",
  asnLabelRouteServer: "Route-Server",
  asnLabelTraffic: "Traffic",
  asnLabelPolicyGeneral: "Peering-Policy",
  asnLabelPolicyLocations: "Policy-Standorte",
  asnLabelPolicyRatio: "Policy-Ratio",
  asnLabelPolicyContracts: "Policy-Verträge",
  asnLabelStatus: "Status",
  asnLabelExchange: "Exchange",
  asnLabelSpeed: "Geschwindigkeit",
  asnLabelIpv4: "IPv4",
  asnLabelIpv6: "IPv6",
  asnLabelRsPeer: "RS-Peer",
  asnLabelFacility: "Standort",
  asnLabelCity: "Stadt",
  asnLabelLocalAsn: "Lokale ASN",
  asnBooleanYes: "ja",
  asnBooleanNo: "nein",
  asnSpeedMbps: "Mbit/s",
  asnNoIxLanRecords: "Keine IX-LAN-Einträge erhalten.",
  asnNoFacilityRecords: "Keine Standort-Einträge erhalten.",
  asnWarningIpinfoUnavailable: "IPinfo-ASN-Daten sind für diese ASN oder diesen Token-Plan nicht verfügbar.",
  asnWarningIpinfoUnexpected: "IPinfo hat eine unerwartete ASN-Antwort geliefert.",
  asnWarningNoRipeStatData: "RIPEstat hat für diese ASN keine ASN-Daten gefunden.",
  asnWarningNoPeeringDbProfile: "Für diese ASN wurde kein öffentliches PeeringDB-Netzwerkprofil gefunden.",
  asnWarningProviderHttp: "{provider} antwortete mit HTTP {status}.",
  asnWarningProviderTimedOut: "{provider} hat nicht rechtzeitig geantwortet.",
  asnWarningProviderTooLarge: "Die Antwort von {provider} überschritt das Größenlimit.",
  asnWarningProviderInvalidJson: "{provider} lieferte ungültiges JSON.",
  asnWarningProviderUnavailable: "{provider}-Daten sind derzeit nicht verfügbar.",
  asnWarningProviderStale: "{provider}-Daten sind derzeit nicht verfügbar; es werden veraltete Cache-Daten verwendet.",
  asnWarningTruncated: "{label} wurden auf {limit} von {total} Einträgen gekürzt.",
  asnWarningLabelIpinfoIpv4Prefixes: "IPinfo-IPv4-Prefixe",
  asnWarningLabelIpinfoIpv6Prefixes: "IPinfo-IPv6-Prefixe",
  asnWarningLabelIpinfoPeers: "IPinfo-Peers",
  asnWarningLabelIpinfoUpstreams: "IPinfo-Upstreams",
  asnWarningLabelIpinfoDownstreams: "IPinfo-Downstreams",
  asnWarningLabelPeeringDbIxLan: "PeeringDB-IX-LAN-Einträge",
  asnWarningLabelPeeringDbFacilities: "PeeringDB-Standorte",
  asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat-IPv4-Prefixe",
  asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat-IPv6-Prefixe",
  asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat-Routing-Nachbarn",
  asnWarningLabelRipeStatUpstreamNeighbours: "RIPEstat-Upstream-Nachbarn",
  asnWarningLabelRipeStatDownstreamNeighbours: "RIPEstat-Downstream-Nachbarn",
  lookupInProgress: "Suche läuft...",
  dnsLookupButton: "DNS abfragen",
  dnsLookupError: "DNS-Abfrage fehlgeschlagen.",
  dnsRecordsFor: "DNS-Einträge für",
  resolvedAddresses: "Aufgelöste Adressen",
  noAddressResult: "Kein A/AAAA-Ergebnis.",
  recordDetails: "Eintragsdetails",
  dnsRecordNotes: "Hinweise zur Record-Abfrage",
  dnsTableType: "Typ",
  dnsTableValue: "Wert",
  dnsShowRaw: "Rohes JSON anzeigen",
  dnsHideRaw: "Rohes JSON ausblenden",
  dnsNoRecords: "Keine Einträge des gewählten Typs erhalten.",
  whoisLookupButton: "WHOIS abfragen",
  whoisLookupError: "WHOIS-Abfrage fehlgeschlagen.",
  whoisFor: "WHOIS für",
  queriedServer: "Abgefragter Server",
  referralSource: "Weiterleitungsquelle",
  noWhoisData: "Keine WHOIS-Daten zurückgegeben.",
  whoisRegistrar: "Registrar",
  whoisCreated: "Erstellt",
  whoisUpdated: "Aktualisiert",
  whoisExpires: "Läuft ab",
  whoisStatusLabel: "Status",
  whoisNameservers: "Nameserver",
  whoisShowRaw: "Rohausgabe anzeigen",
  whoisHideRaw: "Rohausgabe ausblenden",
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
  reputationTitle: "IP-Reputationsprüfung",
  reputationSubtitle: "Prüfe eine öffentliche IP-Adresse gegen mehrere Reputationsquellen und erhalte eine kompakte Risikoübersicht.",
  reputationPlaceholder: "8.8.8.8 oder 2001:4860:4860::8888",
  reputationCheckButton: "Reputation prüfen",
  reputationChecking: "Prüfung läuft...",
  reputationNetworkError: "Netzwerkfehler bei der Reputationsprüfung.",
  reputationRateLimitError: "Zu viele Reputationsprüfungen. Bitte warte kurz und versuche es dann erneut.",
  reputationInvalidIp: "Bitte eine gültige öffentliche IP-Adresse eingeben (IPv4 oder IPv6).",
  reputationBlockedIp: "Private, reservierte und interne IP-Bereiche können nicht geprüft werden.",
  reputationEmptyTitle: "IP-Adresse eingeben, um ihre Reputation zu prüfen",
  reputationEmptyDescription: "Die IP wird gegen DNS-Blacklists, Proxy-/Hosting-Heuristiken und Abuse-Meldungen geprüft, sofern ein AbuseIPDB-Schlüssel konfiguriert ist.",
  reputationRiskLow: "Geringes Risiko",
  reputationRiskMedium: "Mittleres Risiko",
  reputationRiskHigh: "Hohes Risiko",
  reputationScoreLabel: "Risiko-Score",
  reputationNoThreats: "Keine Bedrohungskategorien erkannt.",
  reputationThreatProxy: "Proxy / VPN",
  reputationThreatTor: "Tor-Exit-Node",
  reputationThreatHosting: "Hosting / Rechenzentrum",
  reputationThreatSpam: "Spam-Quelle",
  reputationThreatBotnet: "Botnetz / kompromittiert",
  reputationThreatAbuse: "Abuse gemeldet",
  reputationBlacklistsLabel: "Blacklists",
  reputationListedSummary: "{listed} von {checked} gelistet",
  reputationBlacklistListed: "gelistet",
  reputationBlacklistClean: "sauber",
  reputationBlacklistUnchecked: "nicht geprüft",
  reputationAbuseLabel: "Abuse-Meldungen",
  reputationAbuseReports: "{count} Meldungen (90 Tage)",
  reputationAbuseConfidence: "{score} % Konfidenz",
  reputationAbuseNotConfigured: "nicht konfiguriert",
  reputationAbuseUnavailable: "nicht verfügbar",
  reputationGeoLabel: "Geolokalisierung",
  reputationNetworkLabel: "ASN / Provider",
  reputationDisclaimer: "Aus öffentlichen Quellen aggregiert; Ergebnisse sind Hinweise, kein endgültiges Urteil.",
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

/**
 * Maps a structured API error to a translated message via its error code.
 * Falls back to the tool-specific message for client-side network failures
 * and unknown codes.
 */
export function getApiErrorMessage(error: unknown, t: ToolTranslation, fallback: string): string {
  if (!(error instanceof ApiClientError)) return fallback;

  switch (error.code) {
    case "rate_limited":
      return t.errorRateLimited;
    case "invalid_target":
      return t.errorInvalidTarget;
    case "target_blocked":
      return t.errorTargetBlocked;
    case "timeout":
      return t.errorTimeout;
    case "upstream_error":
      return t.errorUpstream;
    case "bad_request":
      return t.errorBadRequest;
    case "network_error":
      return t.errorTargetNetwork;
    default:
      return fallback;
  }
}

export type { ToolTranslation };
