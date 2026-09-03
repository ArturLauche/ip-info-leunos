import { ApiClientError } from "@/lib/api/client";
import { type Locale } from "@/lib/i18n";
import type { EvidenceCategory, EvidenceSeverity, SourceStatus } from "@/lib/reputation/model";

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
  skipToContent: string;
  navToolsLabel: string;
  sidebarLabel: string;
  navClose: string;
  copyValue: string;
  commandTriggerLabel: string;
  commandPlaceholder: string;
  commandGroupActions: string;
  commandGroupPages: string;
  commandEmpty: string;
  commandHintNavigate: string;
  commandHintSelect: string;
  commandHintClose: string;
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundBackHome: string;
  errorTitle: string;
  errorDescription: string;
  errorRetry: string;
  asnRpkiValid: string;
  asnRpkiInvalid: string;
  asnRpkiStatus: string;
  cdnConfidenceHigh: string;
  cdnConfidenceMedium: string;
  cdnConfidenceLow: string;
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
  pingEmptyTitle: string;
  pingEmptyDescription: string;
  pingStatusSuccess: string;
  pingStatusFailed: string;
  pingShowDetails: string;
  pingHideDetails: string;
  pingResultTcpOk: string;
  pingResultTcpTimeout: string;
  pingResultTcpFailed: string;
  pingResultUdpSent: string;
  pingResultUdpResponse: string;
  pingResultUdpFailed: string;
  pingResultEbHttpOk: string;
  pingResultEbNoHttp: string;
  pingResultEbTcpFailed: string;
  pingResultDbConnectFailed: string;
  pingResultDbProtocolOk: string;
  pingResultDbProtocolFailed: string;
  pingResultDbTcpOk: string;
  pingResultDbAuthUnsupported: string;
  pingResultDbAuthOk: string;
  pingResultDbAuthFailed: string;
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
  reputationHeadlineClean: string;
  reputationScoreLabel: string;
  reputationSectionSummary: string;
  reputationSectionThreats: string;
  reputationSectionMail: string;
  reputationSectionNetwork: string;
  reputationSectionSources: string;
  reputationSectionScore: string;
  reputationCoverageChecked: string;
  reputationCoverageMatched: string;
  reputationCoveragePolicy: string;
  reputationCoverageUnavailable: string;
  reputationGeneratedAt: string;
  reputationNoThreatEvidence: string;
  reputationNoMailEvidence: string;
  reputationFilterAll: string;
  reputationNoEvidence: string;
  reputationFactChecked: string;
  reputationFactMatched: string;
  reputationFactUnavailable: string;
  reputationFactCheckedAt: string;
  reputationScoreCapped: string;
  reputationConnectionLabel: string;
  reputationReverseLabel: string;
  reputationFieldSource: string;
  reputationFieldConfidence: string;
  reputationFieldFirstSeen: string;
  reputationFieldLastSeen: string;
  reputationFieldReports: string;
  reputationFieldAttacks: string;
  reputationFieldMalware: string;
  reputationFieldDetail: string;
  reputationFieldReturnCode: string;
  reputationPointsLabel: string;
  reputationCategories: Record<EvidenceCategory, string>;
  reputationSeverities: Record<EvidenceSeverity, string>;
  reputationSourceStates: Record<SourceStatus, string>;
  reputationReasons: Record<string, string>;
  reputationSourceDescriptions: Record<string, string>;
  reputationGeoLabel: string;
  reputationNetworkLabel: string;
  reputationShowHiddenSources: string;
  reputationHideHiddenSources: string;
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
  skipToContent: "Skip to content",
  navToolsLabel: "Tools",
  sidebarLabel: "Site navigation",
  navClose: "Close menu",
  copyValue: "Copy",
  commandTriggerLabel: "Search…",
  commandPlaceholder: "Search tools, or enter an IP, domain or ASN…",
  commandGroupActions: "Actions",
  commandGroupPages: "Go to",
  commandEmpty: "No matching tools or actions.",
  commandHintNavigate: "Navigate",
  commandHintSelect: "Open",
  commandHintClose: "Close",
  notFoundTitle: "Page not found",
  notFoundDescription:
    "This address does not belong to any tool. Head back to the start page, or use the search (Ctrl+K).",
  notFoundBackHome: "Back to the start page",
  errorTitle: "Something went wrong",
  errorDescription:
    "This page could not be loaded. Try again — if it keeps failing, the cause is on our side.",
  errorRetry: "Try again",
  asnRpkiValid: "RPKI valid",
  asnRpkiInvalid: "RPKI invalid",
  asnRpkiStatus: "RPKI {status}",
  cdnConfidenceHigh: "High",
  cdnConfidenceMedium: "Medium",
  cdnConfidenceLow: "Low",
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
  pingEmptyTitle: "No test run yet",
  pingEmptyDescription: "Pick a test mode, enter a host and port, then run the check to measure reachability and latency.",
  pingStatusSuccess: "Target reachable",
  pingStatusFailed: "Check failed",
  pingShowDetails: "Show technical details",
  pingHideDetails: "Hide technical details",
  pingResultTcpOk: "TCP connection established.",
  pingResultTcpTimeout: "TCP timeout after {timeoutMs} ms.",
  pingResultTcpFailed: "TCP connection failed: {error}",
  pingResultUdpSent: "UDP packet sent. No ICMP error observed within {timeoutMs} ms.",
  pingResultUdpResponse: "UDP response received from {from} ({bytes} bytes).",
  pingResultUdpFailed: "UDP probe failed: {error}",
  pingResultEbHttpOk: "Endpoint reachable via {scheme} (status {status}).",
  pingResultEbNoHttp: "TCP open, but no HTTP(S) response detected on this endpoint.",
  pingResultEbTcpFailed: "EB check failed at TCP stage: {error}",
  pingResultDbConnectFailed: "{database} connectivity failed: {error}",
  pingResultDbProtocolOk: "{database} server responded to a pre-auth handshake probe.",
  pingResultDbProtocolFailed: "{database} probe failed: {error}",
  pingResultDbTcpOk: "{database} TCP port is reachable. No protocol-level pre-auth probe for this type.",
  pingResultDbAuthUnsupported: "Authenticated checks are only implemented for Redis. Use the protocol check for {database}.",
  pingResultDbAuthOk: "Authenticated Redis connection succeeded.",
  pingResultDbAuthFailed: "Redis authentication check failed: {error}",
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
  reputationSubtitle:
    "Check a public IP address against independent reputation and threat-intelligence sources and get an evidence-based risk assessment.",
  reputationPlaceholder: "8.8.8.8 or 2001:4860:4860::8888",
  reputationCheckButton: "Check reputation",
  reputationChecking: "Checking...",
  reputationNetworkError: "Network error while contacting the reputation check.",
  reputationRateLimitError: "Too many reputation checks. Please wait before trying again.",
  reputationInvalidIp: "Please enter a valid public IP address (IPv4 or IPv6).",
  reputationBlockedIp: "Private, reserved, and internal IP ranges cannot be checked.",
  reputationEmptyTitle: "Enter an IP address to check its reputation",
  reputationEmptyDescription:
    "The IP is checked against DNS blocklists, abuse-report databases, botnet C2 trackers, and network classification sources. Optional providers (AbuseIPDB, GreyNoise, http:BL, ThreatFox) activate when a free API key is configured.",
  reputationRiskLow: "Low risk",
  reputationRiskMedium: "Medium risk",
  reputationRiskHigh: "High risk",
  reputationHeadlineClean: "No malicious activity detected",
  reputationScoreLabel: "Risk score",
  reputationSectionSummary: "Reputation Summary",
  reputationSectionThreats: "Threat Evidence",
  reputationSectionMail: "Mail Reputation",
  reputationSectionNetwork: "Network Classification",
  reputationSectionSources: "Sources",
  reputationSectionScore: "How this score was calculated",
  reputationCoverageChecked: "{count} sources checked",
  reputationCoverageMatched: "{count} with threat evidence",
  reputationCoveragePolicy: "{count} with policy or context info",
  reputationCoverageUnavailable: "{count} unavailable",
  reputationGeneratedAt: "Generated {time}",
  reputationNoThreatEvidence:
    "No direct malicious observations were found in the sources that could be checked.",
  reputationNoMailEvidence: "No email reputation listings were found in the checked sources.",
  reputationFilterAll: "All",
  reputationNoEvidence: "No evidence in this group from the sources that could be checked.",
  reputationFactChecked: "Checked",
  reputationFactMatched: "With threat evidence",
  reputationFactUnavailable: "Unavailable",
  reputationFactCheckedAt: "Checked at",
  reputationScoreCapped: "Capped from {count} raw points",
  reputationConnectionLabel: "Connection",
  reputationReverseLabel: "Reverse DNS",
  reputationFieldSource: "Source",
  reputationFieldConfidence: "Confidence",
  reputationFieldFirstSeen: "First seen",
  reputationFieldLastSeen: "Last seen",
  reputationFieldReports: "Reports",
  reputationFieldAttacks: "Attack events",
  reputationFieldMalware: "Malware",
  reputationFieldDetail: "Detail",
  reputationFieldReturnCode: "Return code",
  reputationPointsLabel: "+{points} points",
  reputationCategories: {
    mail_policy: "Mail policy listing",
    mail_reputation: "Email reputation listing",
    spam_observed: "Spam activity observed",
    abuse_reported: "Abuse reported",
    scanner: "Internet-wide scanner",
    bruteforce: "Brute-force attacks",
    web_attack: "Web attacks",
    ddos: "DDoS / flood attacks",
    botnet: "Botnet activity",
    malware: "Malware infrastructure",
    proxy: "Open proxy",
    vpn: "VPN / anonymizer",
    tor: "Tor exit node",
    hosting: "Hosting / datacenter",
    residential: "Residential network",
    mobile: "Mobile network",
    benign_service: "Known business service",
  },
  reputationSeverities: {
    info: "Info",
    low: "Low severity",
    medium: "Medium severity",
    high: "High severity",
    critical: "Critical",
  },
  reputationSourceStates: {
    available: "available",
    clean: "clean",
    matched: "matched",
    policy_listed: "listed (policy)",
    not_configured: "not configured",
    unsupported: "unsupported",
    rate_limited: "rate limited",
    resolver_blocked: "resolver blocked",
    unavailable: "unavailable",
  },
  reputationReasons: {
    sbl:
      "Listed on the Spamhaus SBL: verified spam sources, spam services, or ROKSO spammers (evidence-based, human-maintained listing).",
    css:
      "Listed on Spamhaus CSS: automated detection of high-volume or grey-area email sending. Weaker evidence than the SBL.",
    xbl:
      "Listed on the Spamhaus XBL: the host was observed running trojan/exploit software or an open proxy — typically a compromised machine.",
    drop:
      "The address is in a Spamhaus DROP netblock: ranges controlled by criminal or bulletproof-hosting operations and used for malware, botnet controllers, or spam.",
    pbl_isp:
      "Listed on the Spamhaus PBL (ISP-maintained): this range is not expected to deliver SMTP mail directly to third-party mail servers. This is normal for most residential, dynamic, and end-user addresses and is not evidence of abuse.",
    pbl_spamhaus:
      "Listed on the Spamhaus PBL (Spamhaus-maintained): a policy range that should not deliver mail directly. Normal for many end-user addresses, not evidence of abuse.",
    bcl:
      "Listed on the Spamhaus Botnet Controller List: confirmed active botnet command-and-control infrastructure.",
    spamcop_listing:
      "Listed on SpamCop based on recent spam reports (spamtraps and user-submitted evidence). Listings expire shortly after the last report.",
    barracuda_listing:
      "Poor email reputation measured across the Barracuda filter network. This is aggregated, partly historical evidence and can also affect dynamically reassigned addresses — it does not prove that this address is currently sending spam.",
    dronebl_irc_drone: "Observed as an IRC spam drone (bot) by the DroneBL network.",
    dronebl_bottler: "Observed as a Bottler IRC bot by the DroneBL network.",
    dronebl_worm: "Observed running a worm or spambot by the DroneBL network.",
    dronebl_ddos_drone: "Observed as a DDoS drone (participates in distributed attacks).",
    dronebl_open_socks_proxy:
      "Observed running an open SOCKS proxy — abusable infrastructure, not necessarily malicious by itself.",
    dronebl_open_http_proxy:
      "Observed running an open HTTP proxy — abusable infrastructure, not necessarily malicious by itself.",
    dronebl_proxychain: "Observed as part of a proxy chain.",
    dronebl_web_proxy: "Observed running an open web proxy.",
    dronebl_dictionary: "Observed performing automated dictionary (brute-force) attacks.",
    dronebl_wingate: "Observed running an open WinGate proxy.",
    dronebl_compromised_router: "Observed as a compromised router or gateway.",
    dronebl_botnet_auto:
      "Automatically classified as botnet infrastructure by DroneBL (experimental detection).",
    dronebl_compromised_host: "Possibly compromised host detected on IRC.",
    dronebl_uncategorized: "Listed on DroneBL with an uncategorized threat class.",
    bld_attack:
      "Attack reports filed by affected server operators and collected by blocklist.de. A live DNS entry means attacks were reported recently.",
    bld_counts_only:
      "Historical abuse reports recorded by blocklist.de; the address is not currently in the live DNS zone.",
    feodo_c2_online:
      "Currently active botnet command-and-control server, verified by Feodo Tracker (abuse.ch) through a valid C2 response.",
    feodo_c2_offline:
      "Botnet C2 server tracked by Feodo Tracker (abuse.ch); last seen within the past days and retained in the blocklist.",
    greynoise_scanner_malicious:
      "Observed scanning the internet within the last 90 days and classified as malicious by GreyNoise.",
    greynoise_scanner_unknown:
      "Observed scanning the internet within the last 90 days; GreyNoise could not classify the activity.",
    greynoise_scanner_benign:
      "Observed scanning the internet, but classified as benign (for example a research project) by GreyNoise.",
    greynoise_riot:
      "Known common business service in the GreyNoise RIOT dataset (for example a CDN or security company).",
    abuseipdb_reports:
      "Abuse reports filed by AbuseIPDB users over the last 90 days. The confidence score reflects report volume and consistency.",
    abuseipdb_tor: "Identified as a Tor exit node by AbuseIPDB.",
    threatfox_ioc:
      "Published as a threat indicator (IOC) in the abuse.ch ThreatFox database, shared by security researchers.",
    httpbl_search_engine: "Known search engine crawler (Project Honey Pot).",
    httpbl_suspicious:
      "Suspicious web visitor observed in the Project Honey Pot honeypot network. Often harmless robots; treat with care.",
    httpbl_harvester:
      "Observed harvesting email addresses from honeypots in the Project Honey Pot network.",
    httpbl_comment_spammer:
      "Observed posting comment spam to honeypots in the Project Honey Pot network.",
    ipapi_vpn: "Flagged as a VPN, proxy, or anonymizer service by ip-api.com.",
    ipapi_hosting: "Flagged as a hosting or datacenter address by ip-api.com.",
    ipapi_mobile: "Identified as a mobile or cellular connection by ip-api.com.",
    residential_estimate:
      "Estimated residential connection based on connection type and reverse DNS naming — a heuristic, not provider-confirmed.",
    corroboration: "Several independent sources report malicious activity for this address.",
    mail_corroboration: "Several independent email reputation lists contain this address.",
  },
  reputationSourceDescriptions: {
    "spamhaus-zen":
      "Combined Spamhaus DNSBL: SBL (verified spam sources), CSS (automated spam-sender detection), XBL (exploited hosts), PBL (mail policy ranges), BCL (botnet controllers).",
    "spamhaus-drop":
      "Free Spamhaus feed of whole netblocks controlled by criminal or bulletproof-hosting operations. Checked locally from a cached, hourly-refreshed copy.",
    spamcop:
      "Email blocklist built from spamtraps and user spam reports. Listings are short-lived and reflect recent sending behavior.",
    barracuda:
      "Email reputation scores measured across the Barracuda Networks spam filter network. Aggregated and partly historical signal.",
    dronebl:
      "DNSBL operated by the DroneBL project listing drones, compromised hosts, DDoS participants, and open proxies observed by IRC and monitoring networks. Free for commercial and non-commercial use.",
    "blocklist-de":
      "German abuse-report platform collecting attack reports (SSH brute force, mail attacks, web scans, ...) from affected server operators.",
    "feodo-tracker":
      "abuse.ch tracker for botnet C2 servers (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Entries require an observed valid C2 response. Checked locally from a cached feed.",
    greynoise:
      "Internet-wide scanner intelligence. The community API reports whether an address was observed scanning recently and how it is classified.",
    abuseipdb:
      "Crowd-sourced abuse report database with a confidence score. Requires a free API key (ABUSEIPDB_API_KEY).",
    httpbl:
      "Project Honey Pot DNSBL for web abuse: harvesters, comment spammers, and suspicious bots. Requires a free access key (HTTPBL_ACCESS_KEY).",
    threatfox:
      "abuse.ch platform for sharing indicators of compromise, including botnet C2 addresses. Requires a free Auth-Key (THREATFOX_AUTH_KEY).",
    "ip-api": "IP metadata: geolocation, network/ASN, and connection classification flags.",
  },
  reputationGeoLabel: "Geolocation",
  reputationNetworkLabel: "ASN / Provider",
  reputationShowHiddenSources: "Show unconfigured sources ({count})",
  reputationHideHiddenSources: "Hide unconfigured sources",
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
  skipToContent: "Zum Inhalt springen",
  navToolsLabel: "Werkzeuge",
  sidebarLabel: "Seitennavigation",
  navClose: "Menü schließen",
  copyValue: "Kopieren",
  commandTriggerLabel: "Suchen…",
  commandPlaceholder: "Tools suchen oder IP, Domain oder ASN eingeben…",
  commandGroupActions: "Aktionen",
  commandGroupPages: "Wechseln zu",
  commandEmpty: "Keine passenden Tools oder Aktionen.",
  commandHintNavigate: "Navigieren",
  commandHintSelect: "Öffnen",
  commandHintClose: "Schließen",
  notFoundTitle: "Seite nicht gefunden",
  notFoundDescription:
    "Diese Adresse gehört zu keinem Tool. Zurück zur Startseite — oder nutze die Suche (Strg+K).",
  notFoundBackHome: "Zur Startseite",
  errorTitle: "Etwas ist schiefgelaufen",
  errorDescription:
    "Diese Seite konnte nicht geladen werden. Bitte versuche es erneut — wiederholt sich der Fehler, liegt die Ursache bei uns.",
  errorRetry: "Erneut versuchen",
  asnRpkiValid: "RPKI gültig",
  asnRpkiInvalid: "RPKI ungültig",
  asnRpkiStatus: "RPKI {status}",
  cdnConfidenceHigh: "Hoch",
  cdnConfidenceMedium: "Mittel",
  cdnConfidenceLow: "Niedrig",
  targetPlaceholder: "example.com",
  whoisPlaceholder: "example.com oder 8.8.8.8",
  cdnConfidenceNa: "k. A.",
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
  pingEmptyTitle: "Noch kein Test ausgeführt",
  pingEmptyDescription: "Testmodus wählen, Host und Port eingeben und die Prüfung starten, um Erreichbarkeit und Latenz zu messen.",
  pingStatusSuccess: "Ziel erreichbar",
  pingStatusFailed: "Prüfung fehlgeschlagen",
  pingShowDetails: "Technische Details anzeigen",
  pingHideDetails: "Technische Details ausblenden",
  pingResultTcpOk: "TCP-Verbindung hergestellt.",
  pingResultTcpTimeout: "TCP-Zeitüberschreitung nach {timeoutMs} ms.",
  pingResultTcpFailed: "TCP-Verbindung fehlgeschlagen: {error}",
  pingResultUdpSent: "UDP-Paket gesendet. Kein ICMP-Fehler innerhalb von {timeoutMs} ms beobachtet.",
  pingResultUdpResponse: "UDP-Antwort von {from} erhalten ({bytes} Bytes).",
  pingResultUdpFailed: "UDP-Probe fehlgeschlagen: {error}",
  pingResultEbHttpOk: "Endpunkt über {scheme} erreichbar (Status {status}).",
  pingResultEbNoHttp: "TCP offen, aber keine HTTP(S)-Antwort auf diesem Endpunkt erkannt.",
  pingResultEbTcpFailed: "EB-Prüfung in der TCP-Phase fehlgeschlagen: {error}",
  pingResultDbConnectFailed: "{database}-Verbindung fehlgeschlagen: {error}",
  pingResultDbProtocolOk: "{database}-Server hat auf die Pre-Auth-Handshake-Probe geantwortet.",
  pingResultDbProtocolFailed: "{database}-Probe fehlgeschlagen: {error}",
  pingResultDbTcpOk: "{database}-TCP-Port ist erreichbar. Für diesen Typ gibt es keine Protokoll-Probe vor Authentifizierung.",
  pingResultDbAuthUnsupported: "Authentifizierte Prüfungen sind nur für Redis umgesetzt. Nutze für {database} die Protokoll-Prüfung.",
  pingResultDbAuthOk: "Authentifizierte Redis-Verbindung erfolgreich.",
  pingResultDbAuthFailed: "Redis-Authentifizierungsprüfung fehlgeschlagen: {error}",
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
  reputationSubtitle:
    "Prüfe eine öffentliche IP-Adresse gegen unabhängige Reputations- und Threat-Intelligence-Quellen und erhalte eine evidenzbasierte Risikobewertung.",
  reputationPlaceholder: "8.8.8.8 oder 2001:4860:4860::8888",
  reputationCheckButton: "Reputation prüfen",
  reputationChecking: "Prüfung läuft...",
  reputationNetworkError: "Netzwerkfehler bei der Reputationsprüfung.",
  reputationRateLimitError: "Zu viele Reputationsprüfungen. Bitte warte kurz und versuche es dann erneut.",
  reputationInvalidIp: "Bitte eine gültige öffentliche IP-Adresse eingeben (IPv4 oder IPv6).",
  reputationBlockedIp: "Private, reservierte und interne IP-Bereiche können nicht geprüft werden.",
  reputationEmptyTitle: "IP-Adresse eingeben, um ihre Reputation zu prüfen",
  reputationEmptyDescription:
    "Die IP wird gegen DNS-Blocklisten, Abuse-Meldedatenbanken, Botnet-C2-Tracker und Netzwerk-Klassifizierungsquellen geprüft. Optionale Anbieter (AbuseIPDB, GreyNoise, http:BL, ThreatFox) werden aktiviert, wenn ein kostenloser API-Schlüssel konfiguriert ist.",
  reputationRiskLow: "Geringes Risiko",
  reputationRiskMedium: "Mittleres Risiko",
  reputationRiskHigh: "Hohes Risiko",
  reputationHeadlineClean: "Keine bösartige Aktivität festgestellt",
  reputationScoreLabel: "Risiko-Score",
  reputationSectionSummary: "Reputationsübersicht",
  reputationSectionThreats: "Bedrohungsevidenz",
  reputationSectionMail: "Mail-Reputation",
  reputationSectionNetwork: "Netzwerk-Klassifizierung",
  reputationSectionSources: "Quellen",
  reputationSectionScore: "Wie dieser Score zustande kommt",
  reputationCoverageChecked: "{count} Quellen geprüft",
  reputationCoverageMatched: "{count} mit Bedrohungsevidenz",
  reputationCoveragePolicy: "{count} mit Richtlinien-/Kontextinfos",
  reputationCoverageUnavailable: "{count} nicht verfügbar",
  reputationGeneratedAt: "Erstellt {time}",
  reputationNoThreatEvidence:
    "In den prüfbaren Quellen wurden keine direkten bösartigen Beobachtungen gefunden.",
  reputationNoMailEvidence: "In den geprüften Quellen wurden keine Mail-Reputations-Einträge gefunden.",
  reputationFilterAll: "Alle",
  reputationNoEvidence: "Keine Evidenz in dieser Gruppe aus den prüfbaren Quellen.",
  reputationFactChecked: "Geprüft",
  reputationFactMatched: "Mit Bedrohungsevidenz",
  reputationFactUnavailable: "Nicht verfügbar",
  reputationFactCheckedAt: "Geprüft am",
  reputationScoreCapped: "Von {count} Rohpunkten begrenzt",
  reputationConnectionLabel: "Verbindung",
  reputationReverseLabel: "Reverse DNS",
  reputationFieldSource: "Quelle",
  reputationFieldConfidence: "Konfidenz",
  reputationFieldFirstSeen: "Erstmals gesehen",
  reputationFieldLastSeen: "Zuletzt gesehen",
  reputationFieldReports: "Meldungen",
  reputationFieldAttacks: "Angriffsereignisse",
  reputationFieldMalware: "Malware",
  reputationFieldDetail: "Detail",
  reputationFieldReturnCode: "Return-Code",
  reputationPointsLabel: "+{points} Punkte",
  reputationCategories: {
    mail_policy: "Mail-Richtlinieneintrag",
    mail_reputation: "Mail-Reputations-Eintrag",
    spam_observed: "Spam-Aktivität beobachtet",
    abuse_reported: "Abuse gemeldet",
    scanner: "Internet-weiter Scanner",
    bruteforce: "Brute-Force-Angriffe",
    web_attack: "Web-Angriffe",
    ddos: "DDoS-/Flut-Angriffe",
    botnet: "Botnetz-Aktivität",
    malware: "Malware-Infrastruktur",
    proxy: "Offener Proxy",
    vpn: "VPN / Anonymizer",
    tor: "Tor-Exit-Node",
    hosting: "Hosting / Rechenzentrum",
    residential: "Privatnetz / Residential",
    mobile: "Mobilfunknetz",
    benign_service: "Bekannter Geschäftsdienst",
  },
  reputationSeverities: {
    info: "Info",
    low: "Geringe Schwere",
    medium: "Mittlere Schwere",
    high: "Hohe Schwere",
    critical: "Kritisch",
  },
  reputationSourceStates: {
    available: "verfügbar",
    clean: "sauber",
    matched: "Treffer",
    policy_listed: "gelistet (Richtlinie)",
    not_configured: "nicht konfiguriert",
    unsupported: "nicht unterstützt",
    rate_limited: "Rate-Limit",
    resolver_blocked: "Resolver blockiert",
    unavailable: "nicht verfügbar",
  },
  reputationReasons: {
    sbl:
      "Gelistet auf der Spamhaus SBL: verifizierte Spam-Quellen, Spam-Dienste oder ROKSO-Spammer (evidenzbasierte, redaktionell gepflegte Liste).",
    css:
      "Gelistet auf Spamhaus CSS: automatische Erkennung von Massen- oder Grauzonen-Mail-Versand. Schwächere Evidenz als die SBL.",
    xbl:
      "Gelistet auf der Spamhaus XBL: Der Rechner wurde mit Trojaner-/Exploit-Software oder als offener Proxy beobachtet – typischerweise ein kompromittiertes System.",
    drop:
      "Die Adresse liegt in einem Spamhaus-DROP-Netzblock: Bereiche unter der Kontrolle krimineller oder Bulletproof-Hosting-Operationen, genutzt u. a. für Malware, Botnet-Controller und Spam.",
    pbl_isp:
      "Gelistet auf der Spamhaus PBL (vom ISP gepflegt): Dieser Bereich soll SMTP-Mail nicht direkt an Mailserver Dritter zustellen. Das ist für die meisten Privat-, dynamischen und Endkunden-Adressen normal und kein Hinweis auf Missbrauch.",
    pbl_spamhaus:
      "Gelistet auf der Spamhaus PBL (von Spamhaus gepflegt): ein Richtlinien-Bereich, der nicht direkt versenden soll. Für viele Endkunden-Adressen normal, kein Hinweis auf Missbrauch.",
    bcl:
      "Gelistet auf der Spamhaus Botnet Controller List: bestätigte, aktive Botnet-Kommando-und-Kontroll-Infrastruktur.",
    spamcop_listing:
      "Gelistet auf SpamCop basierend auf aktuellen Spam-Meldungen (Spamtraps und Nutzer-Evidenz). Einträge verfallen kurz nach der letzten Meldung.",
    barracuda_listing:
      "Schlechte Mail-Reputation, gemessen im Barracuda-Filternetzwerk. Aggregiertes, teils historisches Signal; kann auch dynamisch neu zugewiesene Adressen treffen – es belegt nicht, dass diese Adresse aktuell Spam versendet.",
    dronebl_irc_drone: "Vom DroneBL-Netzwerk als IRC-Spam-Drone (Bot) beobachtet.",
    dronebl_bottler: "Vom DroneBL-Netzwerk als Bottler-IRC-Bot beobachtet.",
    dronebl_worm: "Vom DroneBL-Netzwerk mit Wurm oder Spam-Bot beobachtet.",
    dronebl_ddos_drone: "Als DDoS-Drone beobachtet (beteiligt sich an verteilten Angriffen).",
    dronebl_open_socks_proxy:
      "Betreibt einen offenen SOCKS-Proxy – missbrauchbare Infrastruktur, nicht automatisch bösartig.",
    dronebl_open_http_proxy:
      "Betreibt einen offenen HTTP-Proxy – missbrauchbare Infrastruktur, nicht automatisch bösartig.",
    dronebl_proxychain: "Als Teil einer Proxy-Kette beobachtet.",
    dronebl_web_proxy: "Betreibt einen offenen Web-Proxy.",
    dronebl_dictionary: "Beobachtet bei automatisierten Wörterbuch-/Brute-Force-Angriffen.",
    dronebl_wingate: "Betreibt einen offenen WinGate-Proxy.",
    dronebl_compromised_router: "Als kompromittierter Router oder Gateway beobachtet.",
    dronebl_botnet_auto:
      "Von DroneBL automatisch als Botnet-Infrastruktur klassifiziert (experimentelle Erkennung).",
    dronebl_compromised_host: "Möglicherweise kompromittierter Rechner, erkannt über IRC.",
    dronebl_uncategorized: "Auf DroneBL mit unkategorisierter Bedrohungsklasse gelistet.",
    bld_attack:
      "Angriffsmeldungen betroffener Serverbetreiber, gesammelt von blocklist.de. Ein Live-Eintrag im DNS bedeutet kürzlich gemeldete Angriffe.",
    bld_counts_only:
      "Historische Abuse-Meldungen bei blocklist.de; die Adresse steht derzeit nicht in der Live-DNS-Zone.",
    feodo_c2_online:
      "Aktiver Botnet-Kommando-und-Kontroll-Server, von Feodo Tracker (abuse.ch) über eine gültige C2-Antwort verifiziert.",
    feodo_c2_offline:
      "Botnet-C2-Server, verfolgt von Feodo Tracker (abuse.ch); in den letzten Tagen zuletzt gesehen und in der Blockliste behalten.",
    greynoise_scanner_malicious:
      "Wurde in den letzten 90 Tagen beim Internet-weiten Scannen beobachtet und von GreyNoise als bösartig eingestuft.",
    greynoise_scanner_unknown:
      "Wurde in den letzten 90 Tagen beim Internet-weiten Scannen beobachtet; GreyNoise konnte die Aktivität nicht einordnen.",
    greynoise_scanner_benign:
      "Beim Internet-weiten Scannen beobachtet, aber von GreyNoise als gutartig eingestuft (z. B. Forschungsprojekt).",
    greynoise_riot:
      "Bekannter häufiger Geschäftsdienst im GreyNoise-RIOT-Datensatz (z. B. CDN oder Sicherheitsfirma).",
    abuseipdb_reports:
      "Abuse-Meldungen von AbuseIPDB-Nutzern der letzten 90 Tage. Der Konfidenzwert spiegelt Menge und Konsistenz der Meldungen.",
    abuseipdb_tor: "Von AbuseIPDB als Tor-Exit-Node identifiziert.",
    threatfox_ioc:
      "Als Bedrohungsindikator (IOC) in der abuse.ch-ThreatFox-Datenbank veröffentlicht, geteilt von Sicherheitsforschern.",
    httpbl_search_engine: "Bekannter Suchmaschinen-Crawler (Project Honey Pot).",
    httpbl_suspicious:
      "Verdächtiger Web-Besucher, beobachtet im Honeypot-Netzwerk von Project Honey Pot. Oft harmlose Bots – mit Vorsicht bewerten.",
    httpbl_harvester:
      "Beobachtet beim Absammeln von E-Mail-Adressen aus Honeypots im Project Honey Pot-Netzwerk.",
    httpbl_comment_spammer:
      "Beobachtet beim Posten von Kommentar-Spam in Honeypots im Project Honey Pot-Netzwerk.",
    ipapi_vpn: "Von ip-api.com als VPN-, Proxy- oder Anonymizer-Dienst eingestuft.",
    ipapi_hosting: "Von ip-api.com als Hosting-/Rechenzentrums-Adresse eingestuft.",
    ipapi_mobile: "Von ip-api.com als Mobilfunk-Verbindung identifiziert.",
    residential_estimate:
      "Geschätzte Privatverbindung anhand von Verbindungstyp und Reverse-DNS-Namensmuster – eine Heuristik, keine Anbieterbestätigung.",
    corroboration: "Mehrere unabhängige Quellen melden bösartige Aktivität für diese Adresse.",
    mail_corroboration: "Mehrere unabhängige Mail-Reputationslisten enthalten diese Adresse.",
  },
  reputationSourceDescriptions: {
    "spamhaus-zen":
      "Kombinierte Spamhaus-DNSBL: SBL (verifizierte Spam-Quellen), CSS (automatische Spam-Sender-Erkennung), XBL (ausgenutzte Systeme), PBL (Mail-Richtlinienbereiche), BCL (Botnet-Controller).",
    "spamhaus-drop":
      "Kostenloser Spamhaus-Feed kompletter Netzblöcke unter der Kontrolle krimineller oder Bulletproof-Hosting-Operationen. Lokal geprüft anhand einer gecachten, stündlich aktualisierten Kopie.",
    spamcop:
      "Mail-Blockliste aus Spamtraps und Nutzer-Spam-Meldungen. Einträge sind kurzlebig und spiegeln aktuelles Sendeverhalten.",
    barracuda:
      "Mail-Reputationswerte, gemessen im Spamfilter-Netzwerk von Barracuda Networks. Aggregiertes, teils historisches Signal.",
    dronebl:
      "Vom Projekt DroneBL betriebene DNSBL mit Drones, kompromittierten Systemen, DDoS-Teilnehmern und offenen Proxys, beobachtet über IRC- und Monitoringsysteme. Kostenlos für kommerzielle und nicht-kommerzielle Nutzung.",
    "blocklist-de":
      "Deutsche Abuse-Meldeplattform, die Angriffsmeldungen (SSH-Brute-Force, Mail-Angriffe, Web-Scans, ...) betroffener Serverbetreiber sammelt.",
    "feodo-tracker":
      "abuse.ch-Tracker für Botnet-C2-Server (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Einträge erfordern eine beobachtete gültige C2-Antwort. Lokal anhand eines gecachten Feeds geprüft.",
    greynoise:
      "Intelligence zu Internet-weiten Scannern. Die Community-API meldet, ob eine Adresse kürzlich beim Scannen beobachtet wurde und wie sie klassifiziert ist.",
    abuseipdb:
      "Crowd-basierte Abuse-Meldedatenbank mit Konfidenzwert. Benötigt einen kostenlosen API-Schlüssel (ABUSEIPDB_API_KEY).",
    httpbl:
      "Project Honey Pot DNSBL für Web-Abuse: Harvester, Kommentar-Spammer und verdächtige Bots. Benötigt einen kostenlosen Access Key (HTTPBL_ACCESS_KEY).",
    threatfox:
      "abuse.ch-Plattform zum Teilen von Indicators of Compromise, inklusive Botnet-C2-Adressen. Benötigt einen kostenlosen Auth-Key (THREATFOX_AUTH_KEY).",
    "ip-api": "IP-Metadaten: Geolokalisierung, Netzwerk/ASN und Verbindungsklassifizierung.",
  },
  reputationGeoLabel: "Geolokalisierung",
  reputationNetworkLabel: "ASN / Provider",
  reputationShowHiddenSources: "Nicht konfigurierte Quellen anzeigen ({count})",
  reputationHideHiddenSources: "Nicht konfigurierte Quellen ausblenden",
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
