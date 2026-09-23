import type { ToolTranslation } from "@/lib/tool-i18n";

export const toolsNorthern: Record<
  "cs" | "sv" | "da" | "nb" | "fi" | "el" | "ro" | "tr",
  ToolTranslation
> = {
  cs: {
    errorRateLimited:
      "Příliš mnoho požadavků. Počkejte chvíli a zkuste to znovu.",
    errorInvalidTarget: "Zadejte platnou veřejnou doménu, IP adresu nebo URL.",
    errorTargetBlocked:
      "Soukromé, místní a vnitřní cíle nelze na tomto veřejném webu kontrolovat.",
    errorTimeout: "Kontrola vypršela. Cíl může být pomalý nebo nedostupný.",
    errorUpstream:
      "Některý z upstreamových poskytovatelů dat je momentálně nedostupný.",
    errorBadRequest: "Parametry požadavku jsou neplatné.",
    errorTargetNetwork: "Cíl se nepodařilo rozlišit ani dosáhnout.",
    showAll: "Zobrazit vše",
    showLess: "Zobrazit méně",
    navOverview: "Přehled",
    navDiagnostics: "Diagnostika",
    navMyIp: "Moje IP",
    brandTagline: "Nástroje pro síť a IP",
    themeToggle: "Přepnout motiv",
    themeLight: "Světlý",
    themeDark: "Tmavý",
    themeSystem: "Systémový",
    navMenu: "Nabídka",
    skipToContent: "Přejít na obsah",
    navToolsLabel: "Nástroje",
    sidebarLabel: "Navigace webu",
    navClose: "Zavřít nabídku",
    copyValue: "Kopírovat",
    downloadJson: "Stáhnout JSON",
    cancelLookup: "Zrušit",
    whoisNoteIana:
      "Nebyl nalezen žádný odkazující server. Zobrazuje se odpověď WHOIS služby IANA.",
    whoisNoteRdap:
      "WHOIS nebylo dostupné. Místo toho se zobrazují registrační údaje RDAP.",
    commandTriggerLabel: "Hledat…",
    commandPlaceholder: "Hledejte nástroje nebo zadejte IP, doménu či ASN…",
    commandGroupActions: "Akce",
    commandGroupPages: "Přejít na",
    commandEmpty: "Nenalezeny žádné odpovídající nástroje ani akce.",
    commandHintNavigate: "Navigovat",
    commandHintSelect: "Otevřít",
    commandHintClose: "Zavřít",
    notFoundTitle: "Stránka nebyla nalezena",
    notFoundDescription:
      "Tato adresa nepatří žádnému nástroji. Vraťte se na úvodní stránku nebo použijte hledání (Ctrl+K).",
    notFoundBackHome: "Zpět na úvodní stránku",
    errorTitle: "Něco se pokazilo",
    errorDescription:
      "Tuto stránku se nepodařilo načíst. Zkuste to znovu — pokud se chyba opakuje, příčina je na naší straně.",
    errorRetry: "Zkusit znovu",
    asnRpkiValid: "RPKI platné",
    asnRpkiInvalid: "RPKI neplatné",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Vysoká",
    cdnConfidenceMedium: "Střední",
    cdnConfidenceLow: "Nízká",
    pingTabLabel: "Tester ping",
    dnsTabLabel: "Vyhledávání DNS",
    whoisTabLabel: "Vyhledávání WHOIS",
    cdnTabLabel: "Kontrola CDN",
    asnTabLabel: "Vyhledávání ASN",
    reputationTabLabel: "Reputace IP",
    pingTitle: "Tester ping a portů",
    pingSubtitle:
      "Přehledné kontroly portů TCP/UDP, koncových bodů EB a připojení k databázím v jednoduchém testovacím postupu.",
    dnsTitle: "Vyhledávání DNS",
    dnsSubtitle:
      "Dotazujte záznamy DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) pro domény a reverzní DNS pro IP adresy.",
    whoisTitle: "Vyhledávání WHOIS",
    whoisSubtitle:
      "Dotazujte záznamy WHOIS pro domény a IP adresy přímo v této aplikaci.",
    cdnTitle: "Kontrola používání CDN",
    cdnSubtitle:
      "Analyzujte libovolnou doménu a zjistěte používání CDN i pravděpodobného poskytovatele (včetně CloudFront, Google Cloud CDN, Azure CDN, Vercel a dalších).",
    asnTitle: "Informace o ASN",
    asnSubtitle:
      "Vyhledávejte autonomní systémy pomocí podrobností ASN od IPinfo a veřejných dat o propojení z PeeringDB.",
    asnPlaceholder: "AS8881 nebo 8881",
    asnLookupButton: "Vyhledat ASN",
    asnLookingUp: "Vyhledávání…",
    asnInvalidInput:
      "Zadejte ASN s předponou AS nebo číselnou hodnotu, například AS8881 nebo 8881.",
    asnInvalidRange: "ASN musí být mezi 1 a {max}.",
    asnNetworkError: "Při kontaktování vyhledávání ASN došlo k chybě sítě.",
    asnUpstreamError: "Poskytovatelé dat ASN jsou momentálně nedostupní.",
    asnRateLimitError:
      "Příliš mnoho vyhledávání ASN. Před dalším pokusem počkejte.",
    asnEmptyTitle: "Zadejte ASN a prohlédněte si profil sítě",
    asnEmptyDescription:
      "Použijte hodnotu s předponou AS nebo číselnou hodnotu. Údaje poskytovatelů mohou být podle veřejných záznamů a nakonfigurovaného plánu IPinfo neúplné.",
    dnsEmptyTitle: "Zadejte doménu a vyřešte její záznamy DNS",
    dnsEmptyDescription:
      "Vyhledejte záznamy A, AAAA, MX, TXT, NS, SOA, SRV a CAA nebo proveďte reverzní vyhledávání IP adresy.",
    whoisEmptyTitle: "Zadejte doménu nebo IP adresu pro dotaz do WHOIS",
    whoisEmptyDescription:
      "Získejte od příslušného serveru WHOIS údaje o registrátorovi, datech registrace, stavu a jmenných serverech.",
    cdnEmptyTitle: "Zadejte doménu a zjistěte její CDN",
    cdnEmptyDescription:
      "Zkontrolujte DNS, řetězce CNAME a hlavičky odpovědi, abyste určili CDN nebo poskytovatele edge, který stojí před webem.",
    asnNotFoundTitle: "Profil ASN nebyl nalezen",
    asnNotFoundDescription:
      "ASN je platné, ale ani jeden nakonfigurovaný zdroj nevrátil použitelný veřejný profil.",
    asnPartialData: "Neúplná data",
    asnCompleteData: "Úplné",
    asnPrefixes: "Oznamované prefixy",
    asnRouting: "Směrovací vztahy",
    asnPeeringDb: "Profil PeeringDB",
    asnIxPresence: "Přítomnost na IX",
    asnFacilities: "Přítomnost v lokalitách",
    asnSourceDiagnostics: "Diagnostika zdrojů",
    asnDetailedDiagnostics: "Podrobná diagnostika",
    asnUnnamed: "Nepojmenovaný AS",
    asnRoutingDescription:
      "Propojení autonomního systému, sousední uzly a váhy cest. Vyšší váhy znamenají častěji pozorované směrovací cesty.",
    asnIxDescription:
      "Internetové výměnné uzly (IX), na kterých je tento autonomní systém přítomen, včetně šířky propojení.",
    asnPrefixesDescription:
      "IP síťové bloky oznamované tímto autonomním systémem v globální směrovací tabulce.",
    asnPeeringDbDescription:
      "Profil propojení a směrovací zásady deklarované ve veřejné databázi PeeringDB.",
    asnFacilitiesDescription:
      "Fyzická datová centra a kolokační lokality, ve kterých je tato síť přítomna.",
    asnProfileIdentityHeading: "Identita a stav",
    asnProfileInterconnectionHeading: "Podrobnosti propojení",
    asnProfilePolicyHeading: "Politika peeringu",
    asnProfileExternalHeading: "Externí profily",
    asnProfilePrefixes4: "Prefixy IPv4",
    asnProfilePrefixes6: "Prefixy IPv6",
    asnWarnings: "Varování",
    asnDiagnosticDuration: "Doba trvání",
    asnDiagnosticCache: "Cache",
    asnDiagnosticWarnings: "Varování",
    asnDiagnosticSource: "Zdroj",
    asnSourceDiagnosticsDescription:
      "Dostupnost poskytovatelů, doba trvání požadavku a stav cache pro toto vyhledávání.",
    asnCacheMiss: "cache miss",
    asnCacheFresh: "čerstvé",
    asnCacheStale: "zastaralé",
    asnCacheNotConfigured: "nenastaveno",
    asnNoPrefixes: "Nakonfigurované zdroje nevrátily žádné prefixy.",
    asnNoRelations: "Nakonfigurované zdroje nevrátily žádné směrovací vztahy.",
    asnMetricIpv4Addresses: "Adresy IPv4",
    asnMetricRoutingNeighbours: "Směrovací sousedé",
    asnMetricIxPresence: "Přítomnost na IX",
    asnMetricIpinfoDetail: "Data ASN od IPinfo, jsou-li nakonfigurována",
    asnMetricAnnouncedPrefixesDetail: "Oznamované prefixy",
    asnMetricBgpRelationshipsDetail: "Vztahy BGP z IPinfo nebo RIPEstat",
    asnMetricPeeringDbProfileDetail: "Profil sítě PeeringDB",
    asnPrefixIpCount: "IP adres",
    asnRelationPeers: "Peery",
    asnRelationUpstreams: "Upstreamy",
    asnRelationDownstreams: "Downstreamy",
    asnRelationPower: "váha",
    asnSourceAvailable: "dostupný",
    asnSourceUnavailable: "nedostupný",
    asnSourceNotConfigured: "nenastaven",
    asnSourceError: "chyba",
    asnLabelName: "Název",
    asnLabelCountry: "Země",
    asnLabelAllocated: "Přiřazeno",
    asnLabelNetworkId: "ID sítě",
    asnLabelAlsoKnownAs: "Známé také jako",
    asnLabelWebsite: "Web",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Provoz",
    asnLabelPolicyGeneral: "Obecná politika",
    asnLabelPolicyLocations: "Lokality podle politiky",
    asnLabelPolicyRatio: "Poměr podle politiky",
    asnLabelPolicyContracts: "Smlouvy podle politiky",
    asnLabelStatus: "Stav",
    asnLabelExchange: "Výměnný uzel",
    asnLabelSpeed: "Rychlost",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS peer",
    asnLabelFacility: "Lokalita",
    asnLabelCity: "Město",
    asnLabelLocalAsn: "Místní ASN",
    asnSortTable: "Seřaditelná tabulka",
    asnSortBy: "Seřadit podle {column}",
    asnSortNotSorted: "neseřazeno",
    asnSortAscending: "vzestupně",
    asnSortDescending: "sestupně",
    asnBooleanYes: "ano",
    asnBooleanNo: "ne",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Nebyly vráceny žádné záznamy IX LAN.",
    asnNoFacilityRecords: "Nebyly vráceny žádné záznamy lokalit.",
    asnWarningIpinfoUnavailable:
      "Data ASN od IPinfo nejsou pro toto ASN ani plán tokenu dostupná.",
    asnWarningIpinfoUnexpected: "IPinfo vrátil neočekávaná data ASN.",
    asnWarningNoRipeStatData:
      "Pro toto ASN nebyla nalezena žádná data ASN z RIPEstat.",
    asnWarningNoPeeringDbProfile:
      "Pro toto ASN nebyl nalezen žádný veřejný profil sítě v PeeringDB.",
    asnWarningProviderHttp: "{provider} vrátil HTTP {status}.",
    asnWarningProviderTimedOut: "Požadavek na {provider} vypršel.",
    asnWarningProviderTooLarge:
      "Odpověď {provider} překročila limit velikosti.",
    asnWarningProviderInvalidJson: "{provider} vrátil neplatný JSON.",
    asnWarningProviderUnavailable:
      "Data poskytovatele {provider} jsou momentálně nedostupná.",
    asnWarningProviderStale:
      "Data poskytovatele {provider} jsou momentálně nedostupná; používají se zastaralá data z cache.",
    asnWarningTruncated: "{label} byly zkráceny na {limit} z {total} záznamů.",
    asnWarningLabelIpinfoIpv4Prefixes: "Prefixy IPv4 z IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Prefixy IPv6 z IPinfo",
    asnWarningLabelIpinfoPeers: "Peery z IPinfo",
    asnWarningLabelIpinfoUpstreams: "Upstreamy z IPinfo",
    asnWarningLabelIpinfoDownstreams: "Downstreamy z IPinfo",
    asnWarningLabelPeeringDbIxLan: "Záznamy IX LAN z PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Lokality z PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Prefixy IPv4 z RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Prefixy IPv6 z RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours: "Směrovací sousedé z RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Sousedé na straně upstreamu z RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Sousedé na straně downstreamu z RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "Vyhledávání…",
    dnsLookupButton: "Vyhledat DNS",
    dnsLookupError: "Vyhledávání DNS selhalo.",
    dnsRecordsFor: "Záznamy DNS pro",
    resolvedAddresses: "Vyřešené adresy",
    noAddressResult: "Výsledek vyhledávání A/AAAA nebylo nalezen.",
    recordDetails: "Podrobnosti záznamu",
    dnsRecordNotes: "Poznámky k vyhledávání záznamů",
    dnsTableType: "Typ",
    dnsTableValue: "Hodnota",
    dnsShowRaw: "Zobrazit nezpracovaný JSON",
    dnsHideRaw: "Skrýt nezpracovaný JSON",
    dnsNoRecords: "Nebyly vráceny žádné záznamy vybraného typu.",
    whoisPlaceholder: "example.com nebo 8.8.8.8",
    whoisLookupButton: "Vyhledat WHOIS",
    whoisLookupError: "Vyhledávání WHOIS selhalo.",
    whoisFor: "WHOIS pro",
    queriedServer: "Dotazovaný server",
    referralSource: "Zdroj odkazu",
    noWhoisData: "Nebyla vrácena žádná data WHOIS.",
    whoisRegistrar: "Registrátor",
    whoisCreated: "Vytvořeno",
    whoisUpdated: "Aktualizováno",
    whoisExpires: "Vyprší",
    whoisStatusLabel: "Stav",
    whoisNameservers: "Jmenné servery",
    whoisShowRaw: "Zobrazit nezpracovaný výstup",
    whoisHideRaw: "Skrýt nezpracovaný výstup",
    pingTestMode: "Režim testu",
    pingModeHelperTcp: "Ověří, zda port TCP přijímá připojení.",
    pingModeHelperUdp:
      "Odešle sondu UDP a zobrazí okamžitou odezvu nebo chybu.",
    pingModeHelperEb:
      "Nejprve ověří TCP a poté zkusí dosažitelnost koncového bodu HTTP/HTTPS.",
    pingModeHelperDatabase:
      "Spustí kontroly protokolu před ověřením a volitelné kontroly s ověřením.",
    pingModeDatabase: "Databáze",
    pingDatabaseType: "Typ databáze",
    pingTargetHost: "Cílový host / IP",
    pingPort: "Port",
    pingTimeout: "Časový limit (ms)",
    pingUseAuth: "Kontrolovat s ověřením",
    pingUsername: "Uživatelské jméno",
    pingPassword: "Heslo",
    pingDatabaseOptional: "Databáze (volitelné)",
    pingRunButton: "Spustit test ping",
    pingRunning: "Kontrola probíhá…",
    pingNetworkError: "Při kontaktování /api/ping došlo k chybě sítě.",
    pingModeLabel: "Režim",
    pingLatencyLabel: "Latence",
    pingTargetLabel: "Cíl",
    pingDetailsLabel: "Podrobnosti",
    pingEmptyTitle: "Zatím nebyl spuštěn žádný test",
    pingEmptyDescription:
      "Vyberte režim testu, zadejte host a port a spusťte kontrolu pro změření dosažitelnosti a latence.",
    pingStatusSuccess: "Cíl je dosažitelný",
    pingStatusFailed: "Kontrola selhala",
    pingShowDetails: "Zobrazit technické podrobnosti",
    pingHideDetails: "Skrýt technické podrobnosti",
    pingResultTcpOk: "Připojení TCP bylo navázáno.",
    pingResultTcpTimeout: "Vypršel časový limit TCP po {timeoutMs} ms.",
    pingResultTcpFailed: "Připojení TCP selhalo: {error}",
    pingResultUdpSent:
      "Paket UDP byl odeslán. Během {timeoutMs} ms nebyla pozorována žádná chyba ICMP.",
    pingResultUdpResponse: "Byla přijata odpověď UDP z {from} ({bytes} bajtů).",
    pingResultUdpFailed: "Sonda UDP selhala: {error}",
    pingResultEbHttpOk:
      "Koncový bod je dosažitelný přes {scheme} (stav {status}).",
    pingResultEbNoHttp:
      "TCP je otevřené, ale na tomto koncovém bodě nebyla zjištěna žádná odpověď HTTP(S).",
    pingResultEbTcpFailed: "Kontrola EB selhala ve fázi TCP: {error}",
    pingResultDbConnectFailed:
      "Připojení k databázi {database} selhalo: {error}",
    pingResultDbProtocolOk:
      "Server {database} odpověděl na sondu handshake před ověřením.",
    pingResultDbProtocolFailed: "Sonda databáze {database} selhala: {error}",
    pingResultDbTcpOk:
      "Port TCP databáze {database} je dosažitelný. Pro tento typ není k dispozici sonda protokolu před ověřením.",
    pingResultDbAuthUnsupported:
      "Kontroly s ověřením jsou implementovány pouze pro Redis. Pro {database} použijte kontrolu protokolu.",
    pingResultDbAuthOk: "Připojení k Redis s ověřením bylo úspěšné.",
    pingResultDbAuthFailed: "Ověření Redis selhalo: {error}",
    cdnAnalyzeButton: "Zkontrolovat CDN",
    cdnAnalyzing: "Analýza…",
    cdnNetworkError: "Při kontaktování kontroly CDN došlo k chybě sítě.",
    cdnSummaryUnreachable: "Cíl není dosažitelný",
    cdnSummaryNoMatch: "Žádná spolehlivá shoda CDN",
    cdnSummaryDetected: "Bylo zjištěno CDN",
    cdnConfidenceNa: "neuplatňuje se",
    cdnNoProviderMatch: "Žádný poskytovatel neodpovídá — vyřešené IP adresy",
    cdnInspectIpsHint:
      "Tyto IP adresy můžete prohlédnout na stránce vyhledávání IP:",
    cdnTargetLabel: "Cíl",
    cdnHttpStatusLabel: "Stav HTTP",
    cdnProviderLabel: "Poskytovatel",
    cdnUnknown: "Neznámý",
    cdnMatchedSignals: "Odpovídající signály",
    cdnNoSignals: "Nebyly nalezeny žádné výslovné signály CDN.",
    cdnCnameChain: "Řetězec CNAME",
    cdnNoCname: "Nebyl nalezen žádný záznam CNAME.",
    cdnInterestingHeaders: "Zajímavé hlavičky odpovědi",
    cdnNoHeaders: "Nebyly nalezeny žádné relevantní hlavičky.",
    reputationTitle: "Kontrola reputace IP",
    reputationSubtitle:
      "Porovnejte veřejnou IP adresu s nezávislými zdroji reputace a informací o hrozbách a získejte hodnocení rizika založené na důkazech.",
    reputationPlaceholder: "8.8.8.8 nebo 2001:4860:4860::8888",
    reputationCheckButton: "Zkontrolovat reputaci",
    reputationChecking: "Kontroluji…",
    reputationNetworkError:
      "Při kontaktování kontroly reputace došlo k chybě sítě.",
    reputationRateLimitError:
      "Příliš mnoho kontrol reputace. Před dalším pokusem počkejte.",
    reputationInvalidIp: "Zadejte platnou veřejnou IP adresu (IPv4 nebo IPv6).",
    reputationBlockedIp:
      "Soukromé, rezervované a vnitřní rozsahy IP nelze kontrolovat.",
    reputationEmptyTitle: "Zadejte IP adresu a zkontrolujte její reputaci",
    reputationEmptyDescription:
      "IP adresa se porovná s DNS seznamy blokování, databázemi hlášení zneužití, sledovači C2 botnetů a zdroji klasifikace sítí. Volitelní poskytovatelé (AbuseIPDB, GreyNoise, http:BL, ThreatFox) se aktivují, jakmile je nastaven bezplatný API klíč.",
    reputationRiskLow: "Nízké riziko",
    reputationRiskMedium: "Střední riziko",
    reputationRiskHigh: "Vysoké riziko",
    reputationHeadlineClean: "Nebyla zjištěna žádná škodlivá aktivita",
    reputationScoreLabel: "Skóre rizika",
    reputationSectionSummary: "Souhrn reputace",
    reputationSectionThreats: "Důkazy hrozby",
    reputationSectionMail: "Reputace e-mailu",
    reputationSectionNetwork: "Klasifikace sítě",
    reputationSectionSources: "Zdroje",
    reputationSectionScore: "Jak bylo vypočteno toto skóre",
    reputationCoverageChecked: "Zkontrolováno zdrojů: {count}",
    reputationCoverageMatched: "Zdroje s důkazy hrozby: {count}",
    reputationCoveragePolicy:
      "Zdroje s informací o zásadách či kontextu: {count}",
    reputationCoverageUnavailable: "Nedostupné zdroje: {count}",
    reputationGeneratedAt: "Vygenerováno {time}",
    reputationNoThreatEvidence:
      "Ve zdrojích, které bylo možné zkontrolovat, nebyly nalezeny žádné přímé pozorování škodlivé činnosti.",
    reputationNoMailEvidence:
      "Ve zkontrolovaných zdrojích nebyly nalezeny žádné záznamy o reputaci e-mailu.",
    reputationFilterAll: "Vše",
    reputationNoEvidence:
      "V této skupině nejsou důkazy ze zdrojů, které bylo možné zkontrolovat.",
    reputationFactChecked: "Zkontrolováno",
    reputationFactMatched: "S důkazy hrozby",
    reputationFactUnavailable: "Nedostupné",
    reputationFactCheckedAt: "Zkontrolováno",
    reputationScoreCapped: "Omezeno z {count} nezpracovaných bodů",
    reputationConnectionLabel: "Připojení",
    reputationReverseLabel: "Reverzní DNS",
    reputationFieldSource: "Zdroj",
    reputationFieldConfidence: "Důvěra",
    reputationFieldFirstSeen: "Poprvé spatřeno",
    reputationFieldLastSeen: "Naposledy spatřeno",
    reputationFieldReports: "Hlášení",
    reputationFieldAttacks: "Události útoků",
    reputationFieldMalware: "Škodlivý software",
    reputationFieldDetail: "Podrobnosti",
    reputationFieldReturnCode: "Návratový kód",
    reputationPointsLabel: "+{points} bodů",
    reputationCategories: {
      mail_policy: "Záznam v politice e-mailu",
      mail_reputation: "Záznam reputace e-mailu",
      spam_observed: "Pozorována aktivita nevyžádaných e-mailů",
      abuse_reported: "Nahlášeno zneužití",
      scanner: "Skenovač pro celý internet",
      bruteforce: "Útoky hrubou silou",
      web_attack: "Útoky na webové aplikace",
      ddos: "Útoky DDoS / záplavové útoky",
      botnet: "Aktivita botnetu",
      malware: "Infrastruktura škodlivého softwaru",
      proxy: "Otevřená proxy",
      vpn: "VPN / anonymizátor",
      tor: "Výstupní uzel Tor",
      hosting: "Hosting / datové centrum",
      residential: "Domácí síť",
      mobile: "Mobilní síť",
      benign_service: "Známá obchodní služba",
    },
    reputationSeverities: {
      info: "Informace",
      low: "Nízká závažnost",
      medium: "Střední závažność",
      high: "Vysoká závažnost",
      critical: "Kritická",
    },
    reputationSourceStates: {
      available: "dostupný",
      clean: "čistý",
      matched: "shoda",
      policy_listed: "uveden v politice",
      not_configured: "nenastaven",
      unsupported: "nepodporováno",
      rate_limited: "omezen počtem požadavků",
      resolver_blocked: "zablokován resolverem",
      unavailable: "nedostupný",
    },
    reputationReasons: {
      sbl: "Uvedeno ve Spamhaus SBL: ověřené zdroje spamu, spamové služby nebo spammery ROKSO (doložený seznam vedený lidmi).",
      css: "Uvedeno ve Spamhaus CSS: automatická detekce rozesílání e-mailů ve velkém objemu nebo v šedé zóně. Jde o slabší důkaz než SBL.",
      xbl: "Uvedeno ve Spamhaus XBL: na hostiteli byl pozorován trojský kůň, exploitový software nebo otevřená proxy — obvykle jde o kompromitovaný počítač.",
      drop: "Adresa patří do bloku sítí Spamhaus DROP: rozsahy ovládané trestnými či bulletproof-hostingovými skupinami a používané pro škodlivý software, řadiče botnetů nebo spam.",
      pbl_isp:
        "Uvedeno ve Spamhaus PBL (spravuje ISP): od tohoto rozsahu se neočekává přímé doručování SMTP e-mailů serverům třetích stran. To je běžné u většiny domácích, dynamických a koncových adres a není důkazem zneužití.",
      pbl_spamhaus:
        "Uvedeno ve Spamhaus PBL (spravuje Spamhaus): zásadový rozsah, který by neměl přímo doručovat e-maily. U mnoha koncových adres je to běžné a není to důkaz zneužití.",
      bcl: "Uvedeno v seznamu Spamhaus Botnet Controller List: potvrzená aktivní infrastruktura pro řízení a kontrolu botnetů.",
      spamcop_listing:
        "Uvedeno ve SpamCop na základě nedávných hlášení spamu (spamtrapy a důkazy od uživatelů). Záznamy krátce po posledním hlášení vyprší.",
      barracuda_listing:
        "Špatná reputace e-mailu měřená v síti filtrů Barracuda. Jde o agregovaný, částečně historický signál, který může zasáhnout i dynamicky přidělené adresy; nedokazuje, že adresa právě nyní rozesílá spam.",
      dronebl_irc_drone:
        "Síť DroneBL ji pozorovala jako IRC spam drone (bota).",
      dronebl_bottler: "Síť DroneBL ji pozorovala jako IRC bota Bottler.",
      dronebl_worm:
        "Síť DroneBL ji pozorovala při spuštění červa nebo spam bota.",
      dronebl_ddos_drone:
        "Pozorována jako DDoS drone, tedy účastník distribuovaných útoků.",
      dronebl_open_socks_proxy:
        "Pozorována jako otevřená SOCKS proxy — infrastruktura zneužitelná pro útoky, která nemusí být sama o sobě škodlivá.",
      dronebl_open_http_proxy:
        "Pozorována jako otevřená HTTP proxy — infrastruktura zneužitelná pro útoky, která nemusí být sama o sobě škodlivá.",
      dronebl_proxychain: "Pozorována jako součást řetězce proxy.",
      dronebl_web_proxy: "Pozorována jako otevřená webová proxy.",
      dronebl_dictionary:
        "Pozorována při automatizovaných slovníkových útocích hrubou silou.",
      dronebl_wingate: "Pozorována jako otevřená proxy WinGate.",
      dronebl_compromised_router:
        "Pozorována jako kompromitovaný router nebo brána.",
      dronebl_botnet_auto:
        "DroneBL ji automaticky zařadil mezi infrastrukturu botnetu (experimentální detekce).",
      dronebl_compromised_host:
        "Na IRC byl zjištěn pravděpodobně kompromitovaný hostitel.",
      dronebl_uncategorized:
        "Uvedena v DroneBL v nezařazené hrozebné kategorii.",
      bld_attack:
        "Hlášení útoků podaná dotčenými provozovateli serverů a shromážděná službou blocklist.de. Aktivní záznam v DNS znamená, že byly útoky nahlášeny nedávno.",
      bld_counts_only:
        "Historická hlášení zneužití zaznamenaná službou blocklist.de; adresa nyní není v aktivní zóně DNS.",
      feodo_c2_online:
        "Aktivní server pro řízení a kontrolu botnetu ověřený službou Feodo Tracker (abuse.ch) na základě platné odezvy C2.",
      feodo_c2_offline:
        "Server C2 botnetu sledovaný službou Feodo Tracker (abuse.ch); naposledy byl viděn v posledních dnech a zůstává v blocklistu.",
      greynoise_scanner_malicious:
        "Během posledních 90 dní byla pozorována při skenování internetu a GreyNoise ji označil za škodlivou.",
      greynoise_scanner_unknown:
        "Během posledních 90 dní byla pozorována při skenování internetu; GreyNoise nedokázal činnost zařadit.",
      greynoise_scanner_benign:
        "Pozorována při skenování internetu, ale GreyNoise ji označil za neškodnou, například v případě výzkumného projektu.",
      greynoise_riot:
        "Známá běžně používaná obchodní služba v datové sadě GreyNoise RIOT, například CDN nebo bezpečnostní společnost.",
      abuseipdb_reports:
        "Hlášení zneužití od uživatelů AbuseIPDB za posledních 90 dní. Skóre důvěry odráží počet a stálost hlášení.",
      abuseipdb_tor: "AbuseIPDB ji označil za výstupní uzel Tor.",
      threatfox_ioc:
        "Zveřejněna jako indikátor kompromitace (IOC) v databázi abuse.ch ThreatFox, kterou sdílejí výzkumníci v oblasti bezpečnosti.",
      httpbl_search_engine: "Známý crawler vyhledávače Project Honey Pot.",
      httpbl_suspicious:
        "Podezřelý návštěvník webu pozorovaný v síti honeypotů Project Honey Pot. Často jde o neškodné boty, ale buďte opatrní.",
      httpbl_harvester:
        "Pozorována při sběru e-mailových adres z honeypotů v síti Project Honey Pot.",
      httpbl_comment_spammer:
        "Pozorována při rozesílání spamu v komentářích na honeypoty v síti Project Honey Pot.",
      ipapi_vpn:
        "Služba ip-api.com ji označila za VPN, proxy nebo anonymizátor.",
      ipapi_hosting:
        "Služba ip-api.com ji označila za adresu hostingu nebo datového centra.",
      ipapi_mobile:
        "Služba ip-api.com ji označila za mobilní nebo celulární připojení.",
      residential_estimate:
        "Odhad domácího připojení na základě typu připojení a názvu v reverzním DNS — jde o heuristiku, ne o potvrzení poskytovatele.",
      corroboration:
        "Několik nezávislých zdrojů hlásí škodlivou aktivitu této adresy.",
      mail_corroboration:
        "Tuto adresu obsahuje několik nezávislých seznamů reputace e-mailu.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Kombinovaný Spamhaus DNSBL: SBL (ověřené zdroje spamu), CSS (automatická detekce spamových odesílatelů), XBL (zneužité hostitele), PBL (zásadové rozsahy pro e-mail) a BCL (řadiče botnetů).",
      "spamhaus-drop":
        "Bezplatný zdroj Spamhaus s celými bloky sítí ovládanými trestnými nebo bulletproof-hostingovými skupinami. Kontroluje se lokálně z aktualizované po hodině uložené kopie.",
      spamcop:
        "Blocklist e-mailů vytvořený ze spamtrapů a hlášení spamu od uživatelů. Záznamy jsou krátkodobé a odrážejí nedávné chování při odesílání.",
      barracuda:
        "Skóre reputace e-mailu měřená v síti spamových filtrů Barracuda Networks. Agregovaný, částečně historický signál.",
      dronebl:
        "DNSBL provozovaná projektem DroneBL, která uvádí drony, kompromitované hostitele, účastníky DDoS a otevřené proxy pozorované sítěmi IRC a monitorovacími systémy. Bezplatné pro komerční i nekomerční použití.",
      "blocklist-de":
        "Německá platforma hlášení zneužití, která od dotčených provozovatelů serverů sbírá hlášení útoků, jako jsou útoky hrubou silou na SSH, útoky na e-mail a skenování webu.",
      "feodo-tracker":
        "Sledovací služba abuse.ch pro C2 servery botnetů Dridex, Emotet, TrickBot, QakBot a BazarLoader. Záznam vyžaduje pozorovanou platnou odezvu C2. Kontroluje se lokálně z uloženého zdroje dat.",
      greynoise:
        "Inteligence o skenovačích pro celý internet. Komunitní API uvádí, zda byla adresa nedávno pozorována při skenování a jak je klasifikována.",
      abuseipdb:
        "Databáze komunitně sbíraných hlášení o zneužití se skórem důvěry. Vyžaduje bezplatný API klíč (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL Project Honey Pot pro zneužití webu: sběrači adres, spamovatelé v komentářích a podezřelí boti. Vyžaduje bezplatný přístupový klíč (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Platforma abuse.ch pro sdílení indikátorů kompromitace, včetně adres C2 botnetů. Vyžaduje bezplatný Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Metadata IP: geolokace, síť nebo ASN a příznaky klasifikace připojení.",
    },
    reputationGeoLabel: "Geolokace",
    reputationNetworkLabel: "ASN / poskytovatel",
    reputationShowHiddenSources: "Zobrazit nenastavené zdroje ({count})",
    reputationHideHiddenSources: "Skrýt nenastavené zdroje",
  },
  sv: {
    errorRateLimited: "För många förfrågan. Vänta en stund och försök igen.",
    errorInvalidTarget: "Ange en giltig offentlig domän, IP-adress eller URL.",
    errorTargetBlocked:
      "Privata, lokala och interna mål kan inte kontrolleras på den här publika webbplatsen.",
    errorTimeout:
      "Kontrollen tog för lång tid. Målet kan vara långsamt eller otillgängligt.",
    errorUpstream: "En uppströmsdataleverantör är för närvarande otillgänglig.",
    errorBadRequest: "Parametrarna för begäran är ogiltiga.",
    errorTargetNetwork: "Målet kunde inte slås upp eller nås.",
    showAll: "Visa alla",
    showLess: "Visa färre",
    navOverview: "Översikt",
    navDiagnostics: "Diagnostik",
    navMyIp: "Min IP",
    brandTagline: "Nätverks- och IP-verktyg",
    themeToggle: "Byt tema",
    themeLight: "Ljust",
    themeDark: "Mörkt",
    themeSystem: "System",
    navMenu: "Meny",
    skipToContent: "Hoppa till innehåll",
    navToolsLabel: "Verktyg",
    sidebarLabel: "Webbplatsnavigering",
    navClose: "Stäng menyn",
    copyValue: "Kopiera",
    downloadJson: "Ladda ner JSON",
    cancelLookup: "Avbryt",
    whoisNoteIana:
      "Ingen hänvisningsserver hittades. WHOIS-svaret från IANA visas.",
    whoisNoteRdap:
      "WHOIS var inte tillgängligt. Registreringsdata från RDAP visas i stället.",
    commandTriggerLabel: "Sök…",
    commandPlaceholder: "Sök verktyg eller ange en IP-adress, domän eller ASN…",
    commandGroupActions: "Åtgärder",
    commandGroupPages: "Gå till",
    commandEmpty: "Inga matchande verktyg eller åtgärder.",
    commandHintNavigate: "Navigera",
    commandHintSelect: "Öppna",
    commandHintClose: "Stäng",
    notFoundTitle: "Sidan hittades inte",
    notFoundDescription:
      "Den här adressen tillhör inget verktyg. Gå tillbaka till startsidan eller använd sökningen (Ctrl+K).",
    notFoundBackHome: "Tillbaka till startsidan",
    errorTitle: "Något gick fel",
    errorDescription:
      "Den här sidan kunde inte laddas. Försök igen — om felet kvarstår beror det på vår sida.",
    errorRetry: "Försök igen",
    asnRpkiValid: "RPKI giltigt",
    asnRpkiInvalid: "RPKI ogiltigt",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Hög",
    cdnConfidenceMedium: "Medel",
    cdnConfidenceLow: "Låg",
    pingTabLabel: "Pingtestare",
    dnsTabLabel: "DNS-sökning",
    whoisTabLabel: "WHOIS-sökning",
    cdnTabLabel: "CDN-kontroll",
    asnTabLabel: "ASN-sökning",
    reputationTabLabel: "IP-reputation",
    pingTitle: "Ping- och porttestare",
    pingSubtitle:
      "Guidade kontroller av TCP/UDP-portar, EB-slutpunkter och databasanslutningar i ett tydligt testflöde.",
    dnsTitle: "DNS-sökning",
    dnsSubtitle:
      "Fråga efter DNS-poster (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) för domäner och omvänd DNS för IP-adresser.",
    whoisTitle: "WHOIS-sökning",
    whoisSubtitle:
      "Fråga efter WHOIS-poster för domäner och IP-adresser direkt i den här appen.",
    cdnTitle: "Kontroll av CDN-användning",
    cdnSubtitle:
      "Analysera valfri domän för CDN-användning och trolig leverantör ( bland annat CloudFront, Google Cloud CDN, Azure CDN, Vercel med flera).",
    asnTitle: "ASN-information",
    asnSubtitle:
      "Sök upp autonoma system med ASN-detaljer från IPinfo och offentliga PeeringDB-uppgifter om sammankoppling.",
    asnPlaceholder: "AS8881 eller 8881",
    asnLookupButton: "Sök ASN",
    asnLookingUp: "Söker…",
    asnInvalidInput:
      "Ange ett ASN med AS-prefix eller ett numeriskt ASN, till exempel AS8881 eller 8881.",
    asnInvalidRange: "ASN måste vara mellan 1 och {max}.",
    asnNetworkError: "Nätverksfel när ASN-sökningen kontaktades.",
    asnUpstreamError: "ASN-dataleverantörer är för närvarande otillgängliga.",
    asnRateLimitError:
      "För många ASN-sökningar. Vänta lite innan du försöker igen.",
    asnEmptyTitle: "Ange ett ASN för att inspektera en nätverksprofil",
    asnEmptyDescription:
      "Använd AS-prefix eller ett numeriskt värde. Leverantörsdata kan vara ofullständiga beroende på offentliga register och den konfigurerade IPinfo-planen.",
    dnsEmptyTitle: "Ange en domän för att slå upp dess DNS-poster",
    dnsEmptyDescription:
      "Sök upp A-, AAAA-, MX-, TXT-, NS-, SOA-, SRV- och CAA-poster, eller kör en omvänd sökning på en IP-adress.",
    whoisEmptyTitle: "Ange en domän eller IP-adress för att fråga WHOIS",
    whoisEmptyDescription:
      "Hämta registrar, registreringsdatum, status och namnservrar från ansvarig WHOIS-server.",
    cdnEmptyTitle: "Ange en domän för att identifiera dess CDN",
    cdnEmptyDescription:
      "Inspektera DNS, CNAME-kedjor och svarshuvuden för att identifiera CDN- eller edge-leverantören framför webbplatsen.",
    asnNotFoundTitle: "Ingen ASN-profil hittades",
    asnNotFoundDescription:
      "ASN:et är giltigt, men ingen konfigurerad källa returnerade en användbar offentlig profil.",
    asnPartialData: "Delade data",
    asnCompleteData: "Komplett",
    asnPrefixes: "Annonserade prefix",
    asnRouting: "Routingrelationer",
    asnPeeringDb: "PeeringDB-profil",
    asnIxPresence: "IX-närvaro",
    asnFacilities: "Närvaro i anläggningar",
    asnSourceDiagnostics: "Källdiagnostik",
    asnDetailedDiagnostics: "Detaljerad diagnostik",
    asnUnnamed: "Namnlöst AS",
    asnRoutingDescription:
      "Sammankopplingar, grannar och vikter för autonoma system. Högre vikter betyder att routingvägar har observerats oftare.",
    asnIxDescription:
      "Internetutbytespunkter (IX) där det autonoma systemet finns, inklusive bandbredd för sammankoppling.",
    asnPrefixesDescription:
      "IP-nätblock som det autonoma systemet annonserar i den globala routingtabellen.",
    asnPeeringDbDescription:
      "Sammankopplingsprofil och routingpolicy som deklarerats i den offentliga PeeringDB-databasen.",
    asnFacilitiesDescription:
      "Fysiska datacenter och colocation-anläggningar där det här nätverket finns.",
    asnProfileIdentityHeading: "Identitet och status",
    asnProfileInterconnectionHeading: "Sammankopplingsdetaljer",
    asnProfilePolicyHeading: "Peeringpolicy",
    asnProfileExternalHeading: "Externa profiler",
    asnProfilePrefixes4: "IPv4-prefix",
    asnProfilePrefixes6: "IPv6-prefix",
    asnWarnings: "Varningar",
    asnDiagnosticDuration: "Varaktighet",
    asnDiagnosticCache: "Cache",
    asnDiagnosticWarnings: "Varningar",
    asnDiagnosticSource: "Källa",
    asnSourceDiagnosticsDescription:
      "Leverantörernas tillgänglighet, begärandets varaktighet och cachestatus för den här sökningen.",
    asnCacheMiss: "cache miss",
    asnCacheFresh: "färsk",
    asnCacheStale: "föråldrad",
    asnCacheNotConfigured: "inte konfigurerad",
    asnNoPrefixes: "Inga prefix returnerades av de konfigurerade källorna.",
    asnNoRelations:
      "Inga routingrelationer returnerades av de konfigurerade källorna.",
    asnMetricIpv4Addresses: "IPv4-adresser",
    asnMetricRoutingNeighbours: "Routinggrannar",
    asnMetricIxPresence: "IX-närvaro",
    asnMetricIpinfoDetail: "ASN-data från IPinfo, när det är konfigurerat",
    asnMetricAnnouncedPrefixesDetail: "Annonserade prefix",
    asnMetricBgpRelationshipsDetail:
      "BGP-relationer från IPinfo eller RIPEstat",
    asnMetricPeeringDbProfileDetail: "Nätverksprofil i PeeringDB",
    asnPrefixIpCount: "IP-adresser",
    asnRelationPeers: "Peers",
    asnRelationUpstreams: "Upstreams",
    asnRelationDownstreams: "Downstreams",
    asnRelationPower: "vikt",
    asnSourceAvailable: "tillgänglig",
    asnSourceUnavailable: "otillgänglig",
    asnSourceNotConfigured: "inte konfigurerad",
    asnSourceError: "fel",
    asnLabelName: "Namn",
    asnLabelCountry: "Land",
    asnLabelAllocated: "Tilldelad",
    asnLabelNetworkId: "Nätverks-ID",
    asnLabelAlsoKnownAs: "Även känt som",
    asnLabelWebsite: "Webbplats",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Trafik",
    asnLabelPolicyGeneral: "Generell policy",
    asnLabelPolicyLocations: "Policyplatser",
    asnLabelPolicyRatio: "Policyförhållande",
    asnLabelPolicyContracts: "Policyavtal",
    asnLabelStatus: "Status",
    asnLabelExchange: "Utbytespunkt",
    asnLabelSpeed: "Hastighet",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS-peer",
    asnLabelFacility: "Anläggning",
    asnLabelCity: "Stad",
    asnLabelLocalAsn: "Lokalt ASN",
    asnSortTable: "Sorterbar tabell",
    asnSortBy: "Sortera efter {column}",
    asnSortNotSorted: "inte sorterad",
    asnSortAscending: "stigande",
    asnSortDescending: "fallande",
    asnBooleanYes: "ja",
    asnBooleanNo: "nej",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Inga IX LAN-poster returnerades.",
    asnNoFacilityRecords: "Inga anläggningsposter returnerades.",
    asnWarningIpinfoUnavailable:
      "ASN-data från IPinfo är inte tillgänglig för det här ASN:et eller tokenplanen.",
    asnWarningIpinfoUnexpected: "IPinfo returnerade oväntade ASN-data.",
    asnWarningNoRipeStatData:
      "Inga ASN-data från RIPEstat hittades för det här ASN:et.",
    asnWarningNoPeeringDbProfile:
      "Ingen offentlig nätverksprofil i PeeringDB hittades för det här ASN:et.",
    asnWarningProviderHttp: "{provider} returnerade HTTP {status}.",
    asnWarningProviderTimedOut: "Begäran till {provider} tog för lång tid.",
    asnWarningProviderTooLarge:
      "Svaret från {provider} överskred storleksgränsen.",
    asnWarningProviderInvalidJson: "{provider} returnerade ogiltig JSON.",
    asnWarningProviderUnavailable:
      "Data från {provider} är för närvarande otillgängliga.",
    asnWarningProviderStale:
      "Data från {provider} är för närvarande otillgängliga; föråldrade cachade data används.",
    asnWarningTruncated: "{label} förkortades till {limit} av {total} poster.",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfo IPv4-prefix",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfo IPv6-prefix",
    asnWarningLabelIpinfoPeers: "IPinfo-peers",
    asnWarningLabelIpinfoUpstreams: "IPinfo-upstreams",
    asnWarningLabelIpinfoDownstreams: "IPinfo-downstreams",
    asnWarningLabelPeeringDbIxLan: "PeeringDB IX LAN-poster",
    asnWarningLabelPeeringDbFacilities: "PeeringDB-anläggningar",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat IPv4-prefix",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat IPv6-prefix",
    asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat routinggrannar",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "RIPEstat grannar på uppströmssidan",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "RIPEstat grannar på nedströmssidan",
    targetPlaceholder: "example.com",
    lookupInProgress: "Söker…",
    dnsLookupButton: "Sök DNS",
    dnsLookupError: "DNS-sökningen misslyckades.",
    dnsRecordsFor: "DNS-poster för",
    resolvedAddresses: "Upplösta adresser",
    noAddressResult: "Inget resultat från A/AAAA-sökningen.",
    recordDetails: "Postdetaljer",
    dnsRecordNotes: "Anteckningar om postsökningen",
    dnsTableType: "Typ",
    dnsTableValue: "Värde",
    dnsShowRaw: "Visa rå JSON",
    dnsHideRaw: "Dölj rå JSON",
    dnsNoRecords: "Inga poster av den valda typen returnerades.",
    whoisPlaceholder: "example.com eller 8.8.8.8",
    whoisLookupButton: "Sök WHOIS",
    whoisLookupError: "WHOIS-sökningen misslyckades.",
    whoisFor: "WHOIS för",
    queriedServer: "Förfrågad server",
    referralSource: "Hänvisningskälla",
    noWhoisData: "Inga WHOIS-data returnerades.",
    whoisRegistrar: "Registrar",
    whoisCreated: "Skapad",
    whoisUpdated: "Uppdaterad",
    whoisExpires: "Går ut",
    whoisStatusLabel: "Status",
    whoisNameservers: "Namnservrar",
    whoisShowRaw: "Visa råutdata",
    whoisHideRaw: "Dölj råutdata",
    pingTestMode: "Testläge",
    pingModeHelperTcp: "Verifierar om TCP-porten accepterar en anslutning.",
    pingModeHelperUdp:
      "Skickar en UDP-sond och rapporterar omedelbart svar eller fel.",
    pingModeHelperEb:
      "Kontrollerar TCP först och försöker sedan nå HTTP/HTTPS-slutpunkten.",
    pingModeHelperDatabase:
      "Kör protokollkontroller före autentisering och valfria autentiserade kontroller.",
    pingModeDatabase: "Databas",
    pingDatabaseType: "Databastyp",
    pingTargetHost: "Målhost / IP",
    pingPort: "Port",
    pingTimeout: "Tidsgräns (ms)",
    pingUseAuth: "Kontrollera med autentisering",
    pingUsername: "Användarnamn",
    pingPassword: "Lösenord",
    pingDatabaseOptional: "Databas (valfritt)",
    pingRunButton: "Kör pingtest",
    pingRunning: "Kontrollen pågår…",
    pingNetworkError: "Nätverksfel när /api/ping kontaktades.",
    pingModeLabel: "Läge",
    pingLatencyLabel: "Latens",
    pingTargetLabel: "Mål",
    pingDetailsLabel: "Detaljer",
    pingEmptyTitle: "Inget test har körts ännu",
    pingEmptyDescription:
      "Välj ett testläge, ange en host och en port och kör kontrollen för att mäta nåbarhet och latens.",
    pingStatusSuccess: "Målet är nåbart",
    pingStatusFailed: "Kontrollen misslyckades",
    pingShowDetails: "Visa tekniska detaljer",
    pingHideDetails: "Dölj tekniska detaljer",
    pingResultTcpOk: "TCP-anslutningen upprättades.",
    pingResultTcpTimeout: "TCP-tidsgränsen överskreds efter {timeoutMs} ms.",
    pingResultTcpFailed: "TCP-anslutningen misslyckades: {error}",
    pingResultUdpSent:
      "UDP-paket har skickats. Inget ICMP-fel observerades under {timeoutMs} ms.",
    pingResultUdpResponse: "UDP-svar mottogs från {from} ({bytes} byte).",
    pingResultUdpFailed: "UDP-sonden misslyckades: {error}",
    pingResultEbHttpOk: "Slutpunkten är nåbar via {scheme} (status {status}).",
    pingResultEbNoHttp:
      "TCP är öppen, men inget HTTP(S)-svar upptäcktes på den här slutpunkten.",
    pingResultEbTcpFailed: "EB-kontrollen misslyckades i TCP-steget: {error}",
    pingResultDbConnectFailed:
      "Anslutningen till databasen {database} misslyckades: {error}",
    pingResultDbProtocolOk:
      "Servern {database} svarade på en handskakningssond före autentisering.",
    pingResultDbProtocolFailed:
      "Sonden mot databasen {database} misslyckades: {error}",
    pingResultDbTcpOk:
      "TCP-porten för {database} är nåbar. Det finns ingen protokollsond före autentisering för den här typen.",
    pingResultDbAuthUnsupported:
      "Autentiserade kontroller implementeras endast för Redis. Använd protokollkontrollen för {database}.",
    pingResultDbAuthOk: "Autentiserad Redis-anslutning lyckades.",
    pingResultDbAuthFailed: "Redis-autentiseringen misslyckades: {error}",
    cdnAnalyzeButton: "Kontrollera CDN",
    cdnAnalyzing: "Analyserar…",
    cdnNetworkError: "Nätverksfel när CDN-kontrollen kontaktades.",
    cdnSummaryUnreachable: "Målet är onåbart",
    cdnSummaryNoMatch: "Ingen säker CDN-träff",
    cdnSummaryDetected: "CDN upptäcktes",
    cdnConfidenceNa: "ej tillämpligt",
    cdnNoProviderMatch: "Ingen leverantör matchade — upplösta IP-adresser",
    cdnInspectIpsHint:
      "Du kan undersöka dessa IP-adresser på sidan för IP-sökning:",
    cdnTargetLabel: "Mål",
    cdnHttpStatusLabel: "HTTP-status",
    cdnProviderLabel: "Leverantör",
    cdnUnknown: "Okänd",
    cdnMatchedSignals: "Matchade signaler",
    cdnNoSignals: "Inga uttryckliga CDN-signaler matchades.",
    cdnCnameChain: "CNAME-kedja",
    cdnNoCname: "Inga CNAME-poster hittades.",
    cdnInterestingHeaders: "Intressanta svarshuvuden",
    cdnNoHeaders: "Inga relevanta rubriker hittades.",
    reputationTitle: "Kontroll av IP-reputation",
    reputationSubtitle:
      "Jämför en offentlig IP-adress med oberoende källor för ryckte och hotinformation och få en evidensbaserad riskbedömning.",
    reputationPlaceholder: "8.8.8.8 eller 2001:4860:4860::8888",
    reputationCheckButton: "Kontrollera IP-reputation",
    reputationChecking: "Kontrollerar…",
    reputationNetworkError:
      "Nätverksfel när reputationskontrollen kontaktades.",
    reputationRateLimitError:
      "För många IP-reputationskontroller. Vänta lite innan du försöker igen.",
    reputationInvalidIp:
      "Ange en giltig offentlig IP-adress (IPv4 eller IPv6).",
    reputationBlockedIp:
      "Privata, reserverade och interna IP-intervall kan inte kontrolleras.",
    reputationEmptyTitle: "Ange en IP-adress för att kontrollera dess rykte",
    reputationEmptyDescription:
      "IP-adressen kontrolleras mot DNS-blocklistor, databaser med Abuse-rapporter, spårare för botnet-C2 och källor för nätverksklassificering. Valfria leverantörer (AbuseIPDB, GreyNoise, http:BL, ThreatFox) aktiveras när en gratis API-nyckel har konfigurerats.",
    reputationRiskLow: "Låg risk",
    reputationRiskMedium: "Medelhög risk",
    reputationRiskHigh: "Hög risk",
    reputationHeadlineClean: "Ingen skadlig aktivitet upptäcktes",
    reputationScoreLabel: "Riskpoäng",
    reputationSectionSummary: "Sammanfattning av IP-reputation",
    reputationSectionThreats: "Hotbevis",
    reputationSectionMail: "E-postreputation",
    reputationSectionNetwork: "Nätverksklassificering",
    reputationSectionSources: "Källor",
    reputationSectionScore: "Så beräknades poängen",
    reputationCoverageChecked: "{count} källor kontrollerade",
    reputationCoverageMatched: "{count} med hotbevis",
    reputationCoveragePolicy: "{count} med policy- eller kontextinformation",
    reputationCoverageUnavailable: "{count} otillgängliga",
    reputationGeneratedAt: "Genererad {time}",
    reputationNoThreatEvidence:
      "Inga direkta skadliga observationer hittades bland de källor som kunde kontrolleras.",
    reputationNoMailEvidence:
      "Inga listor för e-postreputation hittades bland de kontrollerade källorna.",
    reputationFilterAll: "Alla",
    reputationNoEvidence:
      "Inga bevis i den här gruppen bland de källor som kunde kontrolleras.",
    reputationFactChecked: "Kontrollerad",
    reputationFactMatched: "Med hotbevis",
    reputationFactUnavailable: "Otillgänglig",
    reputationFactCheckedAt: "Kontrollerad",
    reputationScoreCapped: "Begränsad från {count} råpoäng",
    reputationConnectionLabel: "Anslutning",
    reputationReverseLabel: "Omvänd DNS",
    reputationFieldSource: "Källa",
    reputationFieldConfidence: "Tilltro",
    reputationFieldFirstSeen: "Först sedd",
    reputationFieldLastSeen: "Senast sedd",
    reputationFieldReports: "Rapporter",
    reputationFieldAttacks: "Attackhändelser",
    reputationFieldMalware: "Skadlig programvara",
    reputationFieldDetail: "Detalj",
    reputationFieldReturnCode: "Returkod",
    reputationPointsLabel: "+{points} poäng",
    reputationCategories: {
      mail_policy: "E-postpolicy i lista",
      mail_reputation: "E-postreputation i lista",
      spam_observed: "Spamaktivitet observerad",
      abuse_reported: "Missbruk rapporterad",
      scanner: "Skanner för hela internet",
      bruteforce: "Brute-force-attacker",
      web_attack: "Webbattacker",
      ddos: "DDoS- eller flödesattacker",
      botnet: "Botnetaktivitet",
      malware: "Infrastruktur för skadlig programvara",
      proxy: "Öppen proxy",
      vpn: "VPN eller anonymiserare",
      tor: "Tor-utgångsnod",
      hosting: "Hosting eller datacenter",
      residential: "Bostadsnätverk",
      mobile: "Mobilnätverk",
      benign_service: "Känd kommersiell tjänst",
    },
    reputationSeverities: {
      info: "Information",
      low: "Låg allvarlighetsgrad",
      medium: "Medelhög allvarlighetsgrad",
      high: "Hög allvarlighetsgrad",
      critical: "Kritisk",
    },
    reputationSourceStates: {
      available: "tillgänglig",
      clean: "ren",
      matched: "matchad",
      policy_listed: "listad enligt policy",
      not_configured: "inte konfigurerad",
      unsupported: "stöds inte",
      rate_limited: "begränsad av antalet anrop",
      resolver_blocked: "blockerad av resolver",
      unavailable: "otillgänglig",
    },
    reputationReasons: {
      sbl: "Listad i Spamhaus SBL: verifierade spamkällor, spamtjänster eller ROKSO-spammare (evidensbaserad, mänskligt underhållen lista).",
      css: "Listad i Spamhaus CSS: automatisk upptäckt av massutskick eller e-post i gränslandet. Svagare evidens än SBL.",
      xbl: "Listad i Spamhaus XBL: värden har observerats köra trojan- eller exploitprogramvara eller en öppen proxy — vanligtvis en komprometterad dator.",
      drop: "Adressen finns i ett Spamhaus DROP-nätblock: intervall som kontrolleras av kriminella eller bulletproof-hostingverksamheter och används för skadlig programvara, botnetkontroller eller spam.",
      pbl_isp:
        "Listad i Spamhaus PBL (underhålls av ISP): detta intervall förväntas inte leverera SMTP-post direkt till tredjepartens postservrar. Det är normalt för de flesta bostads-, dynamiska och slutanvändaradresser och är inte belägg för missbruk.",
      pbl_spamhaus:
        "Listad i Spamhaus PBL (underhålls av Spamhaus): ett policyintervall som inte bör leverera post direkt. Normalt för många slutanvändaradresser och inte belägg för missbruk.",
      bcl: "Listad i Spamhaus Botnet Controller List: bekräftad aktiv botnetkommando- och kontrollinfrastruktur.",
      spamcop_listing:
        "Listad i SpamCop utifrån nyliga spamrapporter (spamfällor och användarbevis). Listningar upphör strax efter den senaste rapporten.",
      barracuda_listing:
        "Dålig e-postreputation mätt i Barracudas filtreringsnätverk. Det är en aggregerad, delvis historisk signal som också kan påverka dynamiskt omfördelade adresser; den bevisar inte att adressen skickar spam nu.",
      dronebl_irc_drone:
        "Observerad som IRC-spamdrone (bot) av DroneBL-nätverket.",
      dronebl_bottler: "Observerad som Bottler IRC-bot av DroneBL-nätverket.",
      dronebl_worm:
        "Observerad köra en mask eller spambot av DroneBL-nätverket.",
      dronebl_ddos_drone:
        "Observerad som DDoS-drone (deltar i distribuerade attacker).",
      dronebl_open_socks_proxy:
        "Observerad köra en öppen SOCKS-proxy — infrastruktur som kan missbrukas och som inte nödvändigtvis är skadlig i sig.",
      dronebl_open_http_proxy:
        "Observerad köra en öppen HTTP-proxy — infrastruktur som kan missbrukas och som inte nödvändigtvis är skadlig i sig.",
      dronebl_proxychain: "Observerad som del av en proxykedja.",
      dronebl_web_proxy: "Observerad köra en öppen webbproxy.",
      dronebl_dictionary:
        "Observerad utföra automatiserade ordboksattacker (brute force).",
      dronebl_wingate: "Observerad köra en öppen WinGate-proxy.",
      dronebl_compromised_router:
        "Observerad som en komprometterad router eller gateway.",
      dronebl_botnet_auto:
        "Klassificerad automatiskt som botnetinfrastruktur av DroneBL (experimentell upptäckt).",
      dronebl_compromised_host:
        "Möjligen komprometterad värd upptäckt via IRC.",
      dronebl_uncategorized: "Listad i DroneBL med en okategoriserad hotklass.",
      bld_attack:
        "Attackrapporter från drabbade serveroperatörer som samlats in av blocklist.de. En aktiv DNS-post betyder att attacker har rapporterats nyligen.",
      bld_counts_only:
        "Historiska missbruksrapporter registrerade av blocklist.de; adressen finns inte i den aktiva DNS-zonen just nu.",
      feodo_c2_online:
        "Aktiv botnetkommando- och kontrollserver, verifierad av Feodo Tracker (abuse.ch) genom ett giltigt C2-svar.",
      feodo_c2_offline:
        "C2-server för botnet som spåras av Feodo Tracker (abuse.ch); senast sedd inom de senaste dagarna och kvar i blocklistan.",
      greynoise_scanner_malicious:
        "Observerad skanna internetet under de senaste 90 dagarna och klassificerad som skadlig av GreyNoise.",
      greynoise_scanner_unknown:
        "Observerad skanna internetet under de senaste 90 dagarna; GreyNoise kunde inte klassificera aktiviteten.",
      greynoise_scanner_benign:
        "Observerad skanna internetet, men klassificerad som ofarlig av GreyNoise, exempelvis ett forskningsprojekt.",
      greynoise_riot:
        "Känd kommersiell tjänst som ofta finns i GreyNoise RIOT-data, exempelvis en CDN- eller säkerhetsleverantör.",
      abuseipdb_reports:
        "Missbruksrapporter från AbuseIPDB-användare under de senaste 90 dagarna. Tilltropoängen speglar antalet och konsekvensen i rapporterna.",
      abuseipdb_tor: "Identifierad som Tor-utgångsnod av AbuseIPDB.",
      threatfox_ioc:
        "Publicerad som hotindikator (IOC) i abuse.ch ThreatFox-databasen, som säkerhetsforskare delar.",
      httpbl_search_engine: "Känd sökmotorrobot (Project Honey Pot).",
      httpbl_suspicious:
        "Misstänkt webbbesökare observerad i Project Honey Pots honeypotnätverk. Ofta harmlösa robotar; var försiktig.",
      httpbl_harvester:
        "Observerad samla e-postadresser från honeypots i Project Honey Pot-nätverket.",
      httpbl_comment_spammer:
        "Observerad posta kommentarspam till honeypots i Project Honey Pot-nätverket.",
      ipapi_vpn:
        "Markerad som VPN-, proxy- eller anonymiseringstjänst av ip-api.com.",
      ipapi_hosting:
        "Markerad som hosting- eller datacenteradress av ip-api.com.",
      ipapi_mobile:
        "Identifierad som mobil- eller cellulär anslutning av ip-api.com.",
      residential_estimate:
        "Uppskattad bostadsanslutning baserad på anslutningstyp och namn i omvänd DNS — en heuristik, inte en bekräftelse från leverantören.",
      corroboration:
        "Flera oberoende källor rapporterar skadlig aktivitet för den här adressen.",
      mail_corroboration:
        "Flera oberoende listor för e-postreputation innehåller den här adressen.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Kombinerad Spamhaus-DNSBL: SBL (verifierade spamkällor), CSS (automatisk upptäckt av spamavsendare), XBL (utnyttjade värdar), PBL (policyintervall för post) och BCL (botnetkontroller).",
      "spamhaus-drop":
        "Gratis Spamhaus-flöde med hela nätblock som kontrolleras av kriminella eller bulletproof-hostingverksamheter. Kontrolleras lokalt från en cache som uppdateras varje timme.",
      spamcop:
        "E-postblocklista byggd från spamfällor och användarrapporter om spam. Listningar är kortlivade och speglar nyligt utsändningsbeteende.",
      barracuda:
        "Poäng för e-postreputation mätta i Barracuda Networks spamfiltnätverk. Aggregerad och delvis historisk signal.",
      dronebl:
        "DNSBL som drivs av projektet DroneBL och listar droner, komprometterade värdar, DDoS-deltagare och öppna proxyer som observerats av IRC- och övervakningsnätverk. Gratis för kommersiell och icke-kommersiell användning.",
      "blocklist-de":
        "Tysk plattform för missbruksrapporter som samlar attackrapporter från drabbade serveroperatörer, till exempel SSH brute force, e-postattacker och webbskanningar.",
      "feodo-tracker":
        "abuse.ch-spårare för C2-servrar i botnät (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Poster kräver ett observerat giltigt C2-svar. Kontrolleras lokalt från ett cachat flöde.",
      greynoise:
        "Underrättelser om skannrar för hela internetet. Community-API:et anger om en adress nyligen observerats skanna och hur den klassificerats.",
      abuseipdb:
        "Databas med folkinsamlade missbruksrapporter och tilltropoäng. Kräver en gratis API-nyckel (ABUSEIPDB_API_KEY).",
      httpbl:
        "Project Honey Pot DNSBL för webbmissbruk: adresssamlar, kommentarspam och misstänkta robotar. Kräver en gratis åtkomstnyckel (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Plattform från abuse.ch för delning av indikatorer på kompromiss, inklusive C2-adresser för botnät. Kräver en gratis Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "IP-metadata: geolokalisering, nätverk eller ASN och flaggor för anslutningsklassificering.",
    },
    reputationGeoLabel: "Geolokalisering",
    reputationNetworkLabel: "ASN / leverantör",
    reputationShowHiddenSources: "Visa obefintliga källor ({count})",
    reputationHideHiddenSources: "Dölj obefintliga källor",
  },
  da: {
    errorRateLimited: "For mange anmodninger. Vent et øjeblik, og prøv igen.",
    errorInvalidTarget:
      "Angiv et gyldigt offentligt domæne, en IP-adresse eller en URL.",
    errorTargetBlocked:
      "Private, lokale og interne mål kan ikke kontrolleres på dette offentlige websted.",
    errorTimeout:
      "Kontrollen fik timeout. Målet kan være langsomt eller utilgængeligt.",
    errorUpstream: "En upstream-dataleverandør er i øjeblikket utilgængelig.",
    errorBadRequest: "Anmodningens parametre er ugyldige.",
    errorTargetNetwork: "Målet kunne ikke opløses eller nås.",
    showAll: "Vis alle",
    showLess: "Vis færre",
    navOverview: "Oversigt",
    navDiagnostics: "Diagnostik",
    navMyIp: "Min IP",
    brandTagline: "Netværks- og IP-værktøjer",
    themeToggle: "Skift tema",
    themeLight: "Lyst",
    themeDark: "Mørkt",
    themeSystem: "System",
    navMenu: "Menu",
    skipToContent: "Gå til indhold",
    navToolsLabel: "Værktøjer",
    sidebarLabel: "Webstedsnavigation",
    navClose: "Luk menu",
    copyValue: "Kopiér",
    downloadJson: "Download JSON",
    cancelLookup: "Annullér",
    whoisNoteIana:
      "Der blev ikke fundet en henvisningsserver. IANA-WHOIS-svaret vises.",
    whoisNoteRdap:
      "WHOIS var ikke tilgængelig. Registreringsdata fra RDAP vises i stedet.",
    commandTriggerLabel: "Søg…",
    commandPlaceholder:
      "Søg efter værktøjer, eller indtast en IP-adresse, et domæne eller et ASN…",
    commandGroupActions: "Handlinger",
    commandGroupPages: "Gå til",
    commandEmpty: "Ingen matchende værktøjer eller handlinger.",
    commandHintNavigate: "Naviger",
    commandHintSelect: "Åbn",
    commandHintClose: "Luk",
    notFoundTitle: "Siden blev ikke fundet",
    notFoundDescription:
      "Denne adresse hører ikke til noget værktøj. Gå tilbage til startsiden, eller brug søgningen (Ctrl+K).",
    notFoundBackHome: "Tilbage til startsiden",
    errorTitle: "Noget gik galt",
    errorDescription:
      "Denne side kunne ikke indlæses. Prøv igen — hvis fejlen fortsætter, ligger årsagen på vores side.",
    errorRetry: "Prøv igen",
    asnRpkiValid: "RPKI gyldigt",
    asnRpkiInvalid: "RPKI ugyldigt",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Høj",
    cdnConfidenceMedium: "Mellem",
    cdnConfidenceLow: "Lav",
    pingTabLabel: "Ping-tester",
    dnsTabLabel: "DNS-opslag",
    whoisTabLabel: "WHOIS-opslag",
    cdnTabLabel: "CDN-kontrol",
    asnTabLabel: "ASN-opslag",
    reputationTabLabel: "IP-omdømme",
    pingTitle: "Ping- og porttester",
    pingSubtitle:
      "Vejledte kontroller af TCP/UDP-porte, EB-endpunkter og databaseforbindelse i et enkelt testflow.",
    dnsTitle: "DNS-opslag",
    dnsSubtitle:
      "Forespørg efter DNS-poster (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) for domæner og omvendt DNS for IP-adresser.",
    whoisTitle: "WHOIS-opslag",
    whoisSubtitle:
      "Forespørg efter WHOIS-poster for domæner og IP-adresser direkte i denne app.",
    cdnTitle: "Kontrol af CDN-brug",
    cdnSubtitle:
      "Analysér ethvert domæne for CDN-brug og sandsynlig leverandør, herunder CloudFront, Google Cloud CDN, Azure CDN, Vercel og flere.",
    asnTitle: "ASN-oplysninger",
    asnSubtitle:
      "Slå autonome systemer op med ASN-detaljer fra IPinfo og offentlige PeeringDB-oplysninger om sammenkobling.",
    asnPlaceholder: "AS8881 eller 8881",
    asnLookupButton: "Slå ASN op",
    asnLookingUp: "Slår op…",
    asnInvalidInput:
      "Brug et ASN med AS-præfiks eller et numerisk ASN, for eksempel AS8881 eller 8881.",
    asnInvalidRange: "ASN skal være mellem 1 og {max}.",
    asnNetworkError:
      "Der opstod en netværksfejl under kontakt til ASN-opslaget.",
    asnUpstreamError: "ASN-dataleverandørerne er i øjeblikket utilgængelige.",
    asnRateLimitError: "For mange ASN-opslag. Vent lidt, før du prøver igen.",
    asnEmptyTitle: "Indtast et ASN for at undersøge en netværksprofil",
    asnEmptyDescription:
      "Brug AS-præfiks eller en numerisk værdi. Leverandørdata kan være delvise afhængigt af offentlige registre og den konfigurerede IPinfo-plan.",
    dnsEmptyTitle: "Indtast et domæne for at slå dets DNS-poster op",
    dnsEmptyDescription:
      "Slå A-, AAAA-, MX-, TXT-, NS-, SOA-, SRV- og CAA-poster op, eller kør en omvendt opslagning på en IP-adresse.",
    whoisEmptyTitle:
      "Indtast et domæne eller en IP-adresse for at spørge til WHOIS",
    whoisEmptyDescription:
      "Hent registrar, registreringsdatoer, status og navneservere fra den ansvarlige WHOIS-server.",
    cdnEmptyTitle: "Indtast et domæne for at registrere dets CDN",
    cdnEmptyDescription:
      "Undersøg DNS, CNAME-kæder og svarheadere for at identificere CDN- eller edge-leverandøren foran webstedet.",
    asnNotFoundTitle: "Ingen ASN-profil fundet",
    asnNotFoundDescription:
      "ASN:et er gyldigt, men ingen af de konfigurerede kilder returnerede en brugbar offentlig profil.",
    asnPartialData: "Delvise data",
    asnCompleteData: "Komplette",
    asnPrefixes: "Annoncerede præfikser",
    asnRouting: "Routingrelationer",
    asnPeeringDb: "PeeringDB-profil",
    asnIxPresence: "IX-tilstedeværelse",
    asnFacilities: "Tilstedeværelse i anlæg",
    asnSourceDiagnostics: "Kildediagnostik",
    asnDetailedDiagnostics: "Detaljeret diagnostik",
    asnUnnamed: "Unavngivet AS",
    asnRoutingDescription:
      "Sammenkoblinger, naboer og rutevægte for det autonome system. Højere vægte betyder, at rutestier er observeret oftere.",
    asnIxDescription:
      "Internetudvekslingspunkter (IX), hvor det autonome system er til stede, inklusive båndbredde til sammenkobling.",
    asnPrefixesDescription:
      "IP-netblokke, som det autonome system broadcasterer i den globale routingtabel.",
    asnPeeringDbDescription:
      "Sammenkoblingsprofil og routingpolitik, der er erklæret i den offentlige PeeringDB-database.",
    asnFacilitiesDescription:
      "Fysiske datacentre og colocation-anlæg, hvor dette netværk er til stede.",
    asnProfileIdentityHeading: "Identitet og status",
    asnProfileInterconnectionHeading: "Detaljer om sammenkobling",
    asnProfilePolicyHeading: "Peeringpolitik",
    asnProfileExternalHeading: "Eksterne profiler",
    asnProfilePrefixes4: "IPv4-præfikser",
    asnProfilePrefixes6: "IPv6-præfikser",
    asnWarnings: "Advarsler",
    asnDiagnosticDuration: "Varighed",
    asnDiagnosticCache: "Cache",
    asnDiagnosticWarnings: "Advarsler",
    asnDiagnosticSource: "Kilde",
    asnSourceDiagnosticsDescription:
      "Leverandørtilgængelighed, anmodningens varighed og cachestatus for dette opslag.",
    asnCacheMiss: "cache miss",
    asnCacheFresh: "frisk",
    asnCacheStale: "forældet",
    asnCacheNotConfigured: "ikke konfigureret",
    asnNoPrefixes:
      "Ingen præfikser blev returneret af de konfigurerede kilder.",
    asnNoRelations:
      "Ingen routingrelationer blev returneret af de konfigurerede kilder.",
    asnMetricIpv4Addresses: "IPv4-adresser",
    asnMetricRoutingNeighbours: "Routingnaboer",
    asnMetricIxPresence: "IX-tilstedeværelse",
    asnMetricIpinfoDetail: "ASN-data fra IPinfo, når de er konfigureret",
    asnMetricAnnouncedPrefixesDetail: "Annoncerede præfikser",
    asnMetricBgpRelationshipsDetail: "BGP-relationer fra IPinfo eller RIPEstat",
    asnMetricPeeringDbProfileDetail: "PeeringDB-netværksprofil",
    asnPrefixIpCount: "IP-adresser",
    asnRelationPeers: "Peers",
    asnRelationUpstreams: "Upstreams",
    asnRelationDownstreams: "Downstreams",
    asnRelationPower: "vægt",
    asnSourceAvailable: "tilgængelig",
    asnSourceUnavailable: "utilgængelig",
    asnSourceNotConfigured: "ikke konfigureret",
    asnSourceError: "fejl",
    asnLabelName: "Navn",
    asnLabelCountry: "Land",
    asnLabelAllocated: "Tildelt",
    asnLabelNetworkId: "Netværks-ID",
    asnLabelAlsoKnownAs: "Også kendt som",
    asnLabelWebsite: "Websted",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Trafik",
    asnLabelPolicyGeneral: "Generel politik",
    asnLabelPolicyLocations: "Policysteder",
    asnLabelPolicyRatio: "Policyforhold",
    asnLabelPolicyContracts: "Policykontrakter",
    asnLabelStatus: "Status",
    asnLabelExchange: "Udvekslingspunkt",
    asnLabelSpeed: "Hastighed",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS-peer",
    asnLabelFacility: "Anlæg",
    asnLabelCity: "By",
    asnLabelLocalAsn: "Lokalt ASN",
    asnSortTable: "Sortérbar tabel",
    asnSortBy: "Sortér efter {column}",
    asnSortNotSorted: "ikke sorteret",
    asnSortAscending: "stigende",
    asnSortDescending: "faldende",
    asnBooleanYes: "ja",
    asnBooleanNo: "nej",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Der blev ikke returneret nogen IX LAN-poster.",
    asnNoFacilityRecords: "Der blev ikke returneret nogen anlægsposter.",
    asnWarningIpinfoUnavailable:
      "ASN-data fra IPinfo er ikke tilgængelige for dette ASN eller denne tokenplan.",
    asnWarningIpinfoUnexpected: "IPinfo returnerede uventede ASN-data.",
    asnWarningNoRipeStatData:
      "Der blev ikke fundet nogen ASN-data fra RIPEstat for dette ASN.",
    asnWarningNoPeeringDbProfile:
      "Der blev ikke fundet nogen offentlig PeeringDB-netværksprofil for dette ASN.",
    asnWarningProviderHttp: "{provider} returnerede HTTP {status}.",
    asnWarningProviderTimedOut: "Anmodningen til {provider} fik timeout.",
    asnWarningProviderTooLarge:
      "Svaret fra {provider} overskred størrelsesgrænsen.",
    asnWarningProviderInvalidJson: "{provider} returnerede ugyldig JSON.",
    asnWarningProviderUnavailable:
      "Data fra {provider} er i øjeblikket utilgængelige.",
    asnWarningProviderStale:
      "Data fra {provider} er i øjeblikket utilgængelige; forældede cachede data bruges.",
    asnWarningTruncated: "{label} blev afkortet til {limit} af {total} poster.",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfo IPv4-præfikser",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfo IPv6-præfikser",
    asnWarningLabelIpinfoPeers: "IPinfo-peers",
    asnWarningLabelIpinfoUpstreams: "IPinfo-upstreams",
    asnWarningLabelIpinfoDownstreams: "IPinfo-downstreams",
    asnWarningLabelPeeringDbIxLan: "PeeringDB IX LAN-poster",
    asnWarningLabelPeeringDbFacilities: "PeeringDB-anlæg",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat IPv4-præfikser",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat IPv6-præfikser",
    asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat routingnaboer",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "RIPEstat naboer på upstream-siden",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "RIPEstat naboer på downstream-siden",
    targetPlaceholder: "example.com",
    lookupInProgress: "Slår op…",
    dnsLookupButton: "Slå DNS op",
    dnsLookupError: "DNS-opslaget mislykkedes.",
    dnsRecordsFor: "DNS-poster for",
    resolvedAddresses: "Opløste adresser",
    noAddressResult: "Der blev ikke fundet noget resultat af A/AAAA-opslaget.",
    recordDetails: "Postdetaljer",
    dnsRecordNotes: "Noter til posteropslag",
    dnsTableType: "Type",
    dnsTableValue: "Værdi",
    dnsShowRaw: "Vis rå JSON",
    dnsHideRaw: "Skjul rå JSON",
    dnsNoRecords: "Der blev ikke returneret nogen poster af den valgte type.",
    whoisPlaceholder: "example.com eller 8.8.8.8",
    whoisLookupButton: "Slå WHOIS op",
    whoisLookupError: "WHOIS-opslaget mislykkedes.",
    whoisFor: "WHOIS for",
    queriedServer: "Forespurgt server",
    referralSource: "Henvisningskilde",
    noWhoisData: "Der blev ikke returneret nogen WHOIS-data.",
    whoisRegistrar: "Registrar",
    whoisCreated: "Oprettet",
    whoisUpdated: "Opdateret",
    whoisExpires: "Udløber",
    whoisStatusLabel: "Status",
    whoisNameservers: "Navneservere",
    whoisShowRaw: "Vis råoutput",
    whoisHideRaw: "Skjul råoutput",
    pingTestMode: "Testtilstand",
    pingModeHelperTcp: "Kontrollerer, om TCP-porten accepterer en forbindelse.",
    pingModeHelperUdp:
      "Sender en UDP-sonde og rapporterer et øjeblikkeligt svar eller en fejl.",
    pingModeHelperEb:
      "Kontrollerer TCP først og prøver derefter, om HTTP/HTTPS-endpunktet er tilgængeligt.",
    pingModeHelperDatabase:
      "Kører protokolkontroller før autentificering og valgfrie autentificerede kontroller.",
    pingModeDatabase: "Database",
    pingDatabaseType: "Databasetype",
    pingTargetHost: "Målhost / IP",
    pingPort: "Port",
    pingTimeout: "Timeout (ms)",
    pingUseAuth: "Kontrollér med autentificering",
    pingUsername: "Brugernavn",
    pingPassword: "Adgangskode",
    pingDatabaseOptional: "Database (valgfri)",
    pingRunButton: "Kør pingtest",
    pingRunning: "Kontrol kører…",
    pingNetworkError: "Der opstod en netværksfejl under kontakt til /api/ping.",
    pingModeLabel: "Tilstand",
    pingLatencyLabel: "Latens",
    pingTargetLabel: "Mål",
    pingDetailsLabel: "Detaljer",
    pingEmptyTitle: "Der er endnu ikke kørt nogen test",
    pingEmptyDescription:
      "Vælg en testtilstand, indtast en host og en port, og kør kontrollen for at måle tilgængelighed og latens.",
    pingStatusSuccess: "Målet er tilgængeligt",
    pingStatusFailed: "Kontrollen mislykkedes",
    pingShowDetails: "Vis tekniske detaljer",
    pingHideDetails: "Skjul tekniske detaljer",
    pingResultTcpOk: "TCP-forbindelsen blev oprettet.",
    pingResultTcpTimeout: "TCP-timeout efter {timeoutMs} ms.",
    pingResultTcpFailed: "TCP-forbindelsen mislykkedes: {error}",
    pingResultUdpSent:
      "UDP-pakke sendt. Der blev ikke observeret nogen ICMP-fejl inden for {timeoutMs} ms.",
    pingResultUdpResponse: "UDP-svar modtaget fra {from} ({bytes} bytes).",
    pingResultUdpFailed: "UDP-sonden mislykkedes: {error}",
    pingResultEbHttpOk:
      "Endpunktet er tilgængeligt via {scheme} (status {status}).",
    pingResultEbNoHttp:
      "TCP er åben, men der blev ikke registreret noget HTTP(S)-svar på dette endpunkt.",
    pingResultEbTcpFailed: "EB-kontrollen mislykkedes i TCP-trinnet: {error}",
    pingResultDbConnectFailed:
      "Forbindelsen til {database} mislykkedes: {error}",
    pingResultDbProtocolOk:
      "{database}-serveren svarede på en pre-auth-handshake-sonde.",
    pingResultDbProtocolFailed: "Sonden til {database} mislykkedes: {error}",
    pingResultDbTcpOk:
      "TCP-porten til {database} er tilgængelig. Der findes ingen protokol-sonde før autentificering for denne type.",
    pingResultDbAuthUnsupported:
      "Autentificerede kontroller er kun implementeret til Redis. Brug protokolkontrollen til {database}.",
    pingResultDbAuthOk: "Autentificeret Redis-forbindelse lykkedes.",
    pingResultDbAuthFailed: "Redis-autentificeringen mislykkedes: {error}",
    cdnAnalyzeButton: "Kontrollér CDN",
    cdnAnalyzing: "Analyserer…",
    cdnNetworkError:
      "Der opstod en netværksfejl under kontakt til CDN-kontrollen.",
    cdnSummaryUnreachable: "Målet er ikke tilgængeligt",
    cdnSummaryNoMatch: "Ingen sikker CDN-match",
    cdnSummaryDetected: "CDN registreret",
    cdnConfidenceNa: "ikke relevant",
    cdnNoProviderMatch: "Ingen leverandør matchede — opløste IP-adresser",
    cdnInspectIpsHint: "Du kan undersøge disse IP-adresser på IP-opslagssiden:",
    cdnTargetLabel: "Mål",
    cdnHttpStatusLabel: "HTTP-status",
    cdnProviderLabel: "Leverandør",
    cdnUnknown: "Ukendt",
    cdnMatchedSignals: "Matchede signaler",
    cdnNoSignals: "Der blev ikke fundet nogen eksplicit CDN-signal.",
    cdnCnameChain: "CNAME-kæde",
    cdnNoCname: "Der blev ikke fundet nogen CNAME-poster.",
    cdnInterestingHeaders: "Interessante svarheadere",
    cdnNoHeaders: "Der blev ikke fundet nogen relevante headere.",
    reputationTitle: "Kontrol af IP-omdømme",
    reputationSubtitle:
      "Sammenlign en offentlig IP-adresse med uafhængige kilder til omdømme og trusselsoplysninger, og få en evidensbaseret risikovurdering.",
    reputationPlaceholder: "8.8.8.8 eller 2001:4860:4860::8888",
    reputationCheckButton: "Kontrollér omdømme",
    reputationChecking: "Kontrollerer…",
    reputationNetworkError:
      "Der opstod en netværksfejl under kontakt til omdømmekontrollen.",
    reputationRateLimitError:
      "For mange omdømmekontroller. Vent lidt, før du prøver igen.",
    reputationInvalidIp:
      "Indtast en gyldig offentlig IP-adresse (IPv4 eller IPv6).",
    reputationBlockedIp:
      "Private, reserverede og interne IP-intervaller kan ikke kontrolleres.",
    reputationEmptyTitle:
      "Indtast en IP-adresse for at kontrollere dens omdømme",
    reputationEmptyDescription:
      "IP-adressen kontrolleres mod DNS-blocklister, databaser med abuse-rapporter, botnet-C2-trackere og kilder til netværksklassificering. Valgfrie leverandører (AbuseIPDB, GreyNoise, http:BL, ThreatFox) aktiveres, når en gratis API-nøgle er konfigureret.",
    reputationRiskLow: "Lav risiko",
    reputationRiskMedium: "Mellem risiko",
    reputationRiskHigh: "Høj risiko",
    reputationHeadlineClean: "Der blev ikke opdaget skadelig aktivitet",
    reputationScoreLabel: "Risikoscoring",
    reputationSectionSummary: "Sammenfatning af omdømme",
    reputationSectionThreats: "Dokumentation for trusler",
    reputationSectionMail: "E-mailomdømme",
    reputationSectionNetwork: "Netværksklassificering",
    reputationSectionSources: "Kilder",
    reputationSectionScore: "Sådan blev scoren beregnet",
    reputationCoverageChecked: "{count} kilder kontrolleret",
    reputationCoverageMatched: "{count} med dokumentation for trusler",
    reputationCoveragePolicy: "{count} med politik- eller kontekstoplysninger",
    reputationCoverageUnavailable: "{count} utilgængelige",
    reputationGeneratedAt: "Genereret {time}",
    reputationNoThreatEvidence:
      "Der blev ikke fundet nogen direkte skadelige observationer blandt de kilder, der kunne kontrolleres.",
    reputationNoMailEvidence:
      "Der blev ikke fundet nogen lister over e-mailomdømme blandt de kontrollerede kilder.",
    reputationFilterAll: "Alle",
    reputationNoEvidence:
      "Der er ingen dokumentation i denne gruppe blandt de kilder, der kunne kontrolleres.",
    reputationFactChecked: "Kontrolleret",
    reputationFactMatched: "Med dokumentation for trusler",
    reputationFactUnavailable: "Utilgængelig",
    reputationFactCheckedAt: "Kontrolleret",
    reputationScoreCapped: "Begrænset fra {count} råpoint",
    reputationConnectionLabel: "Forbindelse",
    reputationReverseLabel: "Omvendt DNS",
    reputationFieldSource: "Kilde",
    reputationFieldConfidence: "Tillid",
    reputationFieldFirstSeen: "Først set",
    reputationFieldLastSeen: "Sidst set",
    reputationFieldReports: "Rapporter",
    reputationFieldAttacks: "Angrebshændelser",
    reputationFieldMalware: "Skadelig software",
    reputationFieldDetail: "Detalje",
    reputationFieldReturnCode: "Returkode",
    reputationPointsLabel: "+{points} point",
    reputationCategories: {
      mail_policy: "Postpolicy i liste",
      mail_reputation: "E-mailomdømme i liste",
      spam_observed: "Spamaktivitet observeret",
      abuse_reported: "Misbrug rapporteret",
      scanner: "Scanner for hele internettet",
      bruteforce: "Brute-force-angreb",
      web_attack: "Webangreb",
      ddos: "DDoS- eller oversvømmelsesangreb",
      botnet: "Botnetaktivitet",
      malware: "Infrastruktur for skadelig software",
      proxy: "Åben proxy",
      vpn: "VPN / anonymisator",
      tor: "Tor-exitnode",
      hosting: "Hosting / datacenter",
      residential: "Beboelsesnetværk",
      mobile: "Mobilnetværk",
      benign_service: "Kendt forretningstjeneste",
    },
    reputationSeverities: {
      info: "Information",
      low: "Lav alvorlighed",
      medium: "Mellem alvorlighed",
      high: "Høj alvorlighed",
      critical: "Kritisk",
    },
    reputationSourceStates: {
      available: "tilgængelig",
      clean: "ren",
      matched: "matchet",
      policy_listed: "listet (politik)",
      not_configured: "ikke konfigureret",
      unsupported: "ikke understøttet",
      rate_limited: "hastighedsbegrænset",
      resolver_blocked: "blokeret af resolver",
      unavailable: "utilgængelig",
    },
    reputationReasons: {
      sbl: "Listet i Spamhaus SBL: verificerede spamkilder, spamtjenester eller ROKSO-spammere (dokumentationsbaseret, menneskebearbejdet liste).",
      css: "Listet i Spamhaus CSS: automatisk registrering af masse- eller gråzoneudsendelse af e-mail. Svagere dokumentation end SBL.",
      xbl: "Listet i Spamhaus XBL: værten blev observeret med trojan- eller exploitsoftware eller som åben proxy — typisk en kompromitteret computer.",
      drop: "Adressen ligger i et Spamhaus DROP-netblok: områder, der kontrolleres af kriminelle eller bulletproof-hostingoperationer og bruges til skadelig software, botnet-controllere eller spam.",
      pbl_isp:
        "Listet i Spamhaus PBL (vedligeholdt af udbyderen): dette område forventes ikke at levere SMTP-post direkte til tredjeparts mailservere. Det er normalt for de fleste bolig-, dynamiske og slutbrugeradresser og er ikke dokumentation for misbrug.",
      pbl_spamhaus:
        "Listet i Spamhaus PBL (vedligeholdt af Spamhaus): et politikområde, der ikke bør levere post direkte. Normalt for mange slutbrugeradresser og ikke dokumentation for misbrug.",
      bcl: "Listet i Spamhaus Botnet Controller List: bekræftet aktiv botnetkommando- og kontrolinfrastruktur.",
      spamcop_listing:
        "Listet i SpamCop på baggrund af nylige spamrapporter (spamfælder og brugerindsendt dokumentation). Listinger udløber kort efter den seneste rapport.",
      barracuda_listing:
        "Dårligt e-mailomdømme målt i Barracudas filtreringsnetværk. Det er et samlet, delvist historisk signal, som også kan påvirke dynamisk omfordelte adresser; det beviser ikke, at adressen sender spam nu.",
      dronebl_irc_drone:
        "Observeret som IRC-spamdrone (bot) af DroneBL-netværket.",
      dronebl_bottler: "Observeret som Bottler IRC-bot af DroneBL-netværket.",
      dronebl_worm:
        "Observeret køre en orm eller spambot af DroneBL-netværket.",
      dronebl_ddos_drone:
        "Observeret som DDoS-drone (deltager i distribuerede angreb).",
      dronebl_open_socks_proxy:
        "Observeret køre en åben SOCKS-proxy — infrastruktur, der kan misbruges, men som ikke nødvendigvis selv er skadelig.",
      dronebl_open_http_proxy:
        "Observeret køre en åben HTTP-proxy — infrastruktur, der kan misbruges, men som ikke nødvendigvis selv er skadelig.",
      dronebl_proxychain: "Observeret som en del af en proxykæde.",
      dronebl_web_proxy: "Observeret køre en åben webproxy.",
      dronebl_dictionary:
        "Observeret udføre automatiserede ordbogsangreb (brute force).",
      dronebl_wingate: "Observeret køre en åben WinGate-proxy.",
      dronebl_compromised_router:
        "Observeret som kompromitteret router eller gateway.",
      dronebl_botnet_auto:
        "Klassificeret automatisk som botnetinfrastruktur af DroneBL (eksperimentel registrering).",
      dronebl_compromised_host: "Muligvis kompromitteret vært opdaget via IRC.",
      dronebl_uncategorized:
        "Listet i DroneBL med en ukategoriseret truselklasse.",
      bld_attack:
        "Angrebsrapporter indsendt af berørte serveroperatører og indsamlet af blocklist.de. En aktiv DNS-post betyder, at angreb er blevet rapporteret for nylig.",
      bld_counts_only:
        "Historiske rapporter om misbrug registreret af blocklist.de; adressen er ikke i den aktive DNS-zone lige nu.",
      feodo_c2_online:
        "Aktiv botnetkommando- og kontrolserver, verificeret af Feodo Tracker (abuse.ch) via et gyldigt C2-svar.",
      feodo_c2_offline:
        "C2-server til botnet, der overvåges af Feodo Tracker (abuse.ch); sidst set inden for de seneste dage og fortsat i bloklisten.",
      greynoise_scanner_malicious:
        "Observeret scanne internettet inden for de seneste 90 dage og klassificeret som skadelig af GreyNoise.",
      greynoise_scanner_unknown:
        "Observeret scanne internettet inden for de seneste 90 dage; GreyNoise kunne ikke klassificere aktiviteten.",
      greynoise_scanner_benign:
        "Observeret scanne internettet, men klassificeret som harmløs af GreyNoise, for eksempel et forskningsprojekt.",
      greynoise_riot:
        "Almindelig forretningstjeneste, der er kendt i GreyNoise RIOT-datasættet, for eksempel en CDN- eller sikkerhedsvirksomhed.",
      abuseipdb_reports:
        "Rapporter om misbrug fra AbuseIPDB-brugere inden for de seneste 90 dage. Tillidsscoren afspejler antallet og konsekvensen af rapporterne.",
      abuseipdb_tor: "Identificeret som Tor-exitnode af AbuseIPDB.",
      threatfox_ioc:
        "Offentliggjort som trusselindikator (IOC) i abuse.ch ThreatFox-databasen, som sikkerhedsforskere deler.",
      httpbl_search_engine: "Kendt søgemaskinecrawler (Project Honey Pot).",
      httpbl_suspicious:
        "Mistænkelig webbesøgende observeret i Project Honey Pots honeypotnetværk. Ofte harmløse robotter; vær forsigtig.",
      httpbl_harvester:
        "Observeret indsamle e-mailadresser fra honeypots i Project Honey Pot-netværket.",
      httpbl_comment_spammer:
        "Observeret sende kommentarspam til honeypots i Project Honey Pot-netværket.",
      ipapi_vpn:
        "Markeret som VPN-, proxy- eller anonymiseringstjeneste af ip-api.com.",
      ipapi_hosting:
        "Markeret som hosting- eller datacenteradresse af ip-api.com.",
      ipapi_mobile:
        "Identificeret som mobil- eller celleforbindelse af ip-api.com.",
      residential_estimate:
        "Estimeret boligforbindelse baseret på forbindelsestype og navngivning i omvendt DNS — en heuristik, ikke en bekræftelse fra udbyderen.",
      corroboration:
        "Flere uafhængige kilder rapporterer skadelig aktivitet for denne adresse.",
      mail_corroboration:
        "Flere uafhængige lister over e-mailomdømme indeholder denne adresse.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Kombineret Spamhaus-DNSBL: SBL (verificerede spamkilder), CSS (automatisk registrering af spamafsendere), XBL (udnyttede værter), PBL (postpolitikområder) og BCL (botnet-controllere).",
      "spamhaus-drop":
        "Gratis Spamhaus-feed med hele netblokke, der kontrolleres af kriminelle eller bulletproof-hostingoperationer. Kontrolleres lokalt fra en cached kopi, der opdateres hver time.",
      spamcop:
        "E-mail-blockliste bygget fra spamfælder og bruger-rapporter om spam. Listinger er kortlivede og afspejler nylig afsendelsesadfærd.",
      barracuda:
        "Omdømmescores for e-mail målt i Barracuda Networks spamfilternetværk. Samlet og delvist historisk signal.",
      dronebl:
        "DNSBL drevet af DroneBL-projektet, som lister droner, kompromitterede værter, DDoS-deltagere og åbne proxyer, der er observeret af IRC- og overvågningsnetværk. Gratis til kommerciel og ikke-kommerciel brug.",
      "blocklist-de":
        "Tysk platform for rapporter om misbrug, som indsamler angrebsrapporter fra berørte serveroperatører, såsom SSH brute force, mailangreb og webscans.",
      "feodo-tracker":
        "abuse.ch-tracker til C2-servere i botnet (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Poster kræver et observeret gyldigt C2-svar. Kontrolleres lokalt fra et cached feed.",
      greynoise:
        "Efterretninger om scannere på hele internettet. Community-API'et oplyser, om en adresse for nylig blev set scanninge, og hvordan den er klassificeret.",
      abuseipdb:
        "Database med brugerindsamlede misbruksrapporter og tillidsscore. Kræver en gratis API-nøgle (ABUSEIPDB_API_KEY).",
      httpbl:
        "Project Honey Pot DNSBL til webmisbrug: adressesamlere, kommentarspammere og mistænkelige robotter. Kræver en gratis adgangsnøgle (HTTPBL_ACCESS_KEY).",
      threatfox:
        "abuse.ch-platform til deling af indikatorer på kompromittering, herunder C2-adresser i botnet. Kræver en gratis Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "IP-metadata: gelokalisering, netværk/ASN og flag for forbindelsesklassificering.",
    },
    reputationGeoLabel: "Geolokalisering",
    reputationNetworkLabel: "ASN / leverandør",
    reputationShowHiddenSources: "Vis ukonfigurerede kilder ({count})",
    reputationHideHiddenSources: "Skjul ukonfigurerede kilder",
  },
  nb: {
    errorRateLimited: "For mange forespørsler. Vent litt og prøv igjen.",
    errorInvalidTarget:
      "Oppgi et gyldig offentlig domene, en IP-adresse eller en URL.",
    errorTargetBlocked:
      "Private, lokale og interne mål kan ikke kontrolleres på dette offentlige nettstedet.",
    errorTimeout:
      "Kontrollen fikk tidsavbrudd. Målet kan være langsomt eller utilgjengelig.",
    errorUpstream:
      "En oppstrømsdataleverandør er utilgjengelig for øyeblikket.",
    errorBadRequest: "Parametrene i forespørselen er ugyldige.",
    errorTargetNetwork: "Målet kunne ikke slås opp eller nås.",
    showAll: "Vis alle",
    showLess: "Vis færre",
    navOverview: "Oversikt",
    navDiagnostics: "Diagnostikk",
    navMyIp: "Min IP",
    brandTagline: "Nettverks- og IP-verktøy",
    themeToggle: "Bytt tema",
    themeLight: "Lyst",
    themeDark: "Mørkt",
    themeSystem: "System",
    navMenu: "Meny",
    skipToContent: "Gå til innhold",
    navToolsLabel: "Verktøy",
    sidebarLabel: "Nettstedsnavigasjon",
    navClose: "Lukk meny",
    copyValue: "Kopier",
    downloadJson: "Last ned JSON",
    cancelLookup: "Avbryt",
    whoisNoteIana:
      "Ingen henvisningsserver ble funnet. WHOIS-svaret fra IANA vises.",
    whoisNoteRdap:
      "WHOIS var utilgjengelig. Registreringsdata fra RDAP vises i stedet.",
    commandTriggerLabel: "Søk…",
    commandPlaceholder:
      "Søk etter verktøy, eller skriv inn en IP-adresse, et domene eller et ASN…",
    commandGroupActions: "Handlinger",
    commandGroupPages: "Gå til",
    commandEmpty: "Ingen samsvarende verktøy eller handlinger.",
    commandHintNavigate: "Naviger",
    commandHintSelect: "Åpne",
    commandHintClose: "Lukk",
    notFoundTitle: "Siden ble ikke funnet",
    notFoundDescription:
      "Denne adressen hører ikke til noe verktøy. Gå tilbake til startsiden, eller bruk søket (Ctrl+K).",
    notFoundBackHome: "Tilbake til startsiden",
    errorTitle: "Noe gikk galt",
    errorDescription:
      "Denne siden kunne ikke lastes inn. Prøv igjen — hvis feilen fortsetter, ligger årsaken på vår side.",
    errorRetry: "Prøv igjen",
    asnRpkiValid: "RPKI gyldig",
    asnRpkiInvalid: "RPKI ugyldig",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Høy",
    cdnConfidenceMedium: "Middels",
    cdnConfidenceLow: "Lav",
    pingTabLabel: "Ping-tester",
    dnsTabLabel: "DNS-oppslag",
    whoisTabLabel: "WHOIS-oppslag",
    cdnTabLabel: "CDN-kontroll",
    asnTabLabel: "ASN-oppslag",
    reputationTabLabel: "IP-reputasjon",
    pingTitle: "Ping- og porttester",
    pingSubtitle:
      "Veilede kontroller av TCP/UDP-porter, EB-endepunkter og databaseforbindelse i en tydelig testflyt.",
    dnsTitle: "DNS-oppslag",
    dnsSubtitle:
      "Slå opp DNS-poster (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) for domener og omvendt DNS for IP-adresser.",
    whoisTitle: "WHOIS-oppslag",
    whoisSubtitle:
      "Slå opp WHOIS-poster for domener og IP-adresser direkte i denne appen.",
    cdnTitle: "Kontroll av CDN-bruk",
    cdnSubtitle:
      "Analyser hvilket som helst domene for CDN-bruk og sannsynlig leverandør, inkludert CloudFront, Google Cloud CDN, Azure CDN, Vercel og mer.",
    asnTitle: "ASN-informasjon",
    asnSubtitle:
      "Slå opp autonome systemer med ASN-detaljer fra IPinfo og offentlige PeeringDB-data om sammenkobling.",
    asnPlaceholder: "AS8881 eller 8881",
    asnLookupButton: "Slå opp ASN",
    asnLookingUp: "Slår opp…",
    asnInvalidInput:
      "Bruk et ASN med AS-prefiks eller et numerisk ASN, for eksempel AS8881 eller 8881.",
    asnInvalidRange: "ASN må være mellom 1 og {max}.",
    asnNetworkError: "Nettverksfeil under kontakt med ASN-oppslaget.",
    asnUpstreamError: "ASN-dataleverandørene er utilgjengelige for øyeblikket.",
    asnRateLimitError: "For mange ASN-oppslag. Vent litt før du prøver igjen.",
    asnEmptyTitle: "Skriv inn et ASN for å undersøke en nettverksprofil",
    asnEmptyDescription:
      "Bruk AS-prefiks eller et numerisk tall. Leverandørdata kan være delvise avhengig av offentlige registre og den konfigurerte IPinfo-planen.",
    dnsEmptyTitle: "Skriv inn et domene for å slå opp DNS-poster",
    dnsEmptyDescription:
      "Slå opp A-, AAAA-, MX-, TXT-, NS-, SOA-, SRV- og CAA-poster, eller kjør et omvendt oppslag på en IP-adresse.",
    whoisEmptyTitle:
      "Skriv inn et domene eller en IP-adresse for å spørre WHOIS",
    whoisEmptyDescription:
      "Hent registrar, registreringsdatoer, status og navneservere fra den ansvarlige WHOIS-serveren.",
    cdnEmptyTitle: "Skriv inn et domene for å finne CDN-en",
    cdnEmptyDescription:
      "Undersøk DNS, CNAME-kjeder og svarhoder for å identifisere CDN- eller edge-leverandøren foran nettstedet.",
    asnNotFoundTitle: "Ingen ASN-profil funnet",
    asnNotFoundDescription:
      "ASN-et er gyldig, men ingen av de konfigurerte kildene returnerte en brukbar offentlig profil.",
    asnPartialData: "Delvise data",
    asnCompleteData: "Komplett",
    asnPrefixes: "Kunngjorte prefikser",
    asnRouting: "Ruterelasjoner",
    asnPeeringDb: "PeeringDB-profil",
    asnIxPresence: "IX-tilstedeværelse",
    asnFacilities: "Tilstedeværelse i anlegg",
    asnSourceDiagnostics: "Kildediagnostikk",
    asnDetailedDiagnostics: "Detaljert diagnostikk",
    asnUnnamed: "Unavngitt AS",
    asnRoutingDescription:
      "Sammenkoblinger, naboer og rutevekter for det autonome systemet. Høyere vekter betyr at rutestier har blitt observert oftere.",
    asnIxDescription:
      "Internettutvekslingspunkter (IX) der dette autonome systemet er til stede, inkludert båndbredde for sammenkobling.",
    asnPrefixesDescription:
      "IP-nettblokker som dette autonome systemet kunngjør i den globale rutetabellen.",
    asnPeeringDbDescription:
      "Sammenkoblingsprofil og rutepolicy erklært i den offentlige PeeringDB-databasen.",
    asnFacilitiesDescription:
      "Fysiske datasentre og colocation-anlegg der dette nettverket er til stede.",
    asnProfileIdentityHeading: "Identitet og status",
    asnProfileInterconnectionHeading: "Detaljer om sammenkobling",
    asnProfilePolicyHeading: "Peeringpolicy",
    asnProfileExternalHeading: "Eksterne profiler",
    asnProfilePrefixes4: "IPv4-prefikser",
    asnProfilePrefixes6: "IPv6-prefikser",
    asnWarnings: "Advarsler",
    asnDiagnosticDuration: "Varighet",
    asnDiagnosticCache: "Cache",
    asnDiagnosticWarnings: "Advarsler",
    asnDiagnosticSource: "Kilde",
    asnSourceDiagnosticsDescription:
      "Leverandørenes tilgjengelighet, forespørselens varighet og cachestatus for dette oppslaget.",
    asnCacheMiss: "cache miss",
    asnCacheFresh: "fersk",
    asnCacheStale: "utdatert",
    asnCacheNotConfigured: "ikke konfigurert",
    asnNoPrefixes: "Ingen prefikser ble returnert av de konfigurerte kildene.",
    asnNoRelations:
      "Ingen ruterelasjoner ble returnert av de konfigurerte kildene.",
    asnMetricIpv4Addresses: "IPv4-adresser",
    asnMetricRoutingNeighbours: "Rutenaboer",
    asnMetricIxPresence: "IX-tilstedeværelse",
    asnMetricIpinfoDetail: "ASN-data fra IPinfo, når konfigurert",
    asnMetricAnnouncedPrefixesDetail: "Kunngjorte prefikser",
    asnMetricBgpRelationshipsDetail: "BGP-relasjoner fra IPinfo eller RIPEstat",
    asnMetricPeeringDbProfileDetail: "PeeringDB-nettverksprofil",
    asnPrefixIpCount: "IP-adresser",
    asnRelationPeers: "Peers",
    asnRelationUpstreams: "Upstreams",
    asnRelationDownstreams: "Downstreams",
    asnRelationPower: "vekt",
    asnSourceAvailable: "tilgjengelig",
    asnSourceUnavailable: "utilgjengelig",
    asnSourceNotConfigured: "ikke konfigurert",
    asnSourceError: "feil",
    asnLabelName: "Navn",
    asnLabelCountry: "Land",
    asnLabelAllocated: "Tildelt",
    asnLabelNetworkId: "Nettverks-ID",
    asnLabelAlsoKnownAs: "Også kjent som",
    asnLabelWebsite: "Nettsted",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Trafikk",
    asnLabelPolicyGeneral: "Generell policy",
    asnLabelPolicyLocations: "Policysteder",
    asnLabelPolicyRatio: "Policyforhold",
    asnLabelPolicyContracts: "Policykontrakter",
    asnLabelStatus: "Status",
    asnLabelExchange: "Utvekslingspunkt",
    asnLabelSpeed: "Hastighet",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS-peer",
    asnLabelFacility: "Anlegg",
    asnLabelCity: "By",
    asnLabelLocalAsn: "Lokalt ASN",
    asnSortTable: "Sorterbar tabell",
    asnSortBy: "Sorter etter {column}",
    asnSortNotSorted: "ikke sortert",
    asnSortAscending: "stigende",
    asnSortDescending: "synkende",
    asnBooleanYes: "ja",
    asnBooleanNo: "nei",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Ingen IX LAN-poster ble returnert.",
    asnNoFacilityRecords: "Ingen anleggsposter ble returnert.",
    asnWarningIpinfoUnavailable:
      "ASN-data fra IPinfo er ikke tilgjengelig for dette ASN-et eller tokenplanen.",
    asnWarningIpinfoUnexpected: "IPinfo returnerte uventede ASN-data.",
    asnWarningNoRipeStatData:
      "Ingen ASN-data fra RIPEstat ble funnet for dette ASN-et.",
    asnWarningNoPeeringDbProfile:
      "Ingen offentlig PeeringDB-nettverksprofil ble funnet for dette ASN-et.",
    asnWarningProviderHttp: "{provider} returnerte HTTP {status}.",
    asnWarningProviderTimedOut:
      "Forespørselen til {provider} fikk tidsavbrudd.",
    asnWarningProviderTooLarge:
      "Svaret fra {provider} overskred størrelsesgrensen.",
    asnWarningProviderInvalidJson: "{provider} returnerte ugyldig JSON.",
    asnWarningProviderUnavailable:
      "Data fra {provider} er utilgjengelige for øyeblikket.",
    asnWarningProviderStale:
      "Data fra {provider} er utilgjengelige for øyeblikket; utdaterte cachede data brukes.",
    asnWarningTruncated: "{label} ble avkortet til {limit} av {total} poster.",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfo IPv4-prefikser",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfo IPv6-prefikser",
    asnWarningLabelIpinfoPeers: "IPinfo-peers",
    asnWarningLabelIpinfoUpstreams: "IPinfo-upstreams",
    asnWarningLabelIpinfoDownstreams: "IPinfo-downstreams",
    asnWarningLabelPeeringDbIxLan: "PeeringDB IX LAN-poster",
    asnWarningLabelPeeringDbFacilities: "PeeringDB-anlegg",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat IPv4-prefikser",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat IPv6-prefikser",
    asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat rutenaboer",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "RIPEstat naboer på oppstrømssiden",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "RIPEstat naboer på nedstrømssiden",
    targetPlaceholder: "example.com",
    lookupInProgress: "Slår opp…",
    dnsLookupButton: "Slå opp DNS",
    dnsLookupError: "DNS-oppslaget mislyktes.",
    dnsRecordsFor: "DNS-poster for",
    resolvedAddresses: "Oppløste adresser",
    noAddressResult: "Ingen resultater fra A/AAAA-oppslaget.",
    recordDetails: "Postdetaljer",
    dnsRecordNotes: "Merknader til postoppslag",
    dnsTableType: "Type",
    dnsTableValue: "Verdi",
    dnsShowRaw: "Vis rå JSON",
    dnsHideRaw: "Skjul rå JSON",
    dnsNoRecords: "Ingen poster av den valgte typen ble returnert.",
    whoisPlaceholder: "example.com eller 8.8.8.8",
    whoisLookupButton: "Slå opp WHOIS",
    whoisLookupError: "WHOIS-oppslaget mislyktes.",
    whoisFor: "WHOIS for",
    queriedServer: "Forespurt server",
    referralSource: "Henvisningskilde",
    noWhoisData: "Ingen WHOIS-data ble returnert.",
    whoisRegistrar: "Registrar",
    whoisCreated: "Opprettet",
    whoisUpdated: "Oppdatert",
    whoisExpires: "Utløper",
    whoisStatusLabel: "Status",
    whoisNameservers: "Navneservere",
    whoisShowRaw: "Vis råutdata",
    whoisHideRaw: "Skjul råutdata",
    pingTestMode: "Testmodus",
    pingModeHelperTcp: "Kontrollerer om TCP-porten godtar en tilkobling.",
    pingModeHelperUdp:
      "Sender en UDP-sonde og rapporterer umiddelbart svar eller feil.",
    pingModeHelperEb:
      "Kontrollerer TCP først og prøver deretter om HTTP/HTTPS-endepunktet er tilgjengelig.",
    pingModeHelperDatabase:
      "Kjører protokollkontroller før autentisering og valgfrie autentiserte kontroller.",
    pingModeDatabase: "Database",
    pingDatabaseType: "Databasetype",
    pingTargetHost: "Målvert / IP",
    pingPort: "Port",
    pingTimeout: "Tidsavbrudd (ms)",
    pingUseAuth: "Kontroller med autentisering",
    pingUsername: "Brukernavn",
    pingPassword: "Passord",
    pingDatabaseOptional: "Database (valgfritt)",
    pingRunButton: "Kjør pingtest",
    pingRunning: "Kontroll pågår…",
    pingNetworkError: "Nettverksfeil under kontakt med /api/ping.",
    pingModeLabel: "Modus",
    pingLatencyLabel: "Latens",
    pingTargetLabel: "Mål",
    pingDetailsLabel: "Detaljer",
    pingEmptyTitle: "Ingen test er kjørt ennå",
    pingEmptyDescription:
      "Velg en testmodus, skriv inn en vert og en port, og kjør kontrollen for å måle tilgjengelighet og latens.",
    pingStatusSuccess: "Målet er tilgjengelig",
    pingStatusFailed: "Kontrollen mislyktes",
    pingShowDetails: "Vis tekniske detaljer",
    pingHideDetails: "Skjul tekniske detaljer",
    pingResultTcpOk: "TCP-tilkoblingen ble etablert.",
    pingResultTcpTimeout: "TCP fikk tidsavbrudd etter {timeoutMs} ms.",
    pingResultTcpFailed: "TCP-tilkoblingen mislyktes: {error}",
    pingResultUdpSent:
      "UDP-pakke sendt. Ingen ICMP-feil ble observert innen {timeoutMs} ms.",
    pingResultUdpResponse: "UDP-svar mottatt fra {from} ({bytes} byte).",
    pingResultUdpFailed: "UDP-sonden mislyktes: {error}",
    pingResultEbHttpOk:
      "Endepunktet er tilgjengelig via {scheme} (status {status}).",
    pingResultEbNoHttp:
      "TCP er åpen, men ingen HTTP(S)-respons ble oppdaget på dette endepunktet.",
    pingResultEbTcpFailed: "EB-kontrollen mislyktes i TCP-trinnet: {error}",
    pingResultDbConnectFailed: "Tilkobling til {database} mislyktes: {error}",
    pingResultDbProtocolOk:
      "{database}-serveren svarte på en pre-auth-håndshake-sonde.",
    pingResultDbProtocolFailed: "Sonden mot {database} mislyktes: {error}",
    pingResultDbTcpOk:
      "TCP-porten til {database} er tilgjengelig. Det finnes ingen protokoll-sonde før autentisering for denne typen.",
    pingResultDbAuthUnsupported:
      "Autentiserte kontroller er bare implementert for Redis. Bruk protokollkontrollen for {database}.",
    pingResultDbAuthOk: "Autentisert Redis-tilkobling lyktes.",
    pingResultDbAuthFailed: "Redis-autentiseringen mislyktes: {error}",
    cdnAnalyzeButton: "Kontroller CDN",
    cdnAnalyzing: "Analyserer…",
    cdnNetworkError: "Nettverksfeil under kontakt med CDN-kontrollen.",
    cdnSummaryUnreachable: "Målet er ikke tilgjengelig",
    cdnSummaryNoMatch: "Ingen sikker CDN-treff",
    cdnSummaryDetected: "CDN oppdaget",
    cdnConfidenceNa: "ikke relevant",
    cdnNoProviderMatch: "Ingen leverandør ble truffet — oppløste IP-adresser",
    cdnInspectIpsHint:
      "Du kan undersøke disse IP-adressene på IP-oppslagssiden:",
    cdnTargetLabel: "Mål",
    cdnHttpStatusLabel: "HTTP-status",
    cdnProviderLabel: "Leverandør",
    cdnUnknown: "Ukjent",
    cdnMatchedSignals: "Matchede signaler",
    cdnNoSignals: "Ingen eksplisitt CDN-signal ble truffet.",
    cdnCnameChain: "CNAME-kjede",
    cdnNoCname: "Ingen CNAME-poster ble oppdaget.",
    cdnInterestingHeaders: "Interessante svarshoder",
    cdnNoHeaders: "Ingen relevante hoder ble funnet.",
    reputationTitle: "Kontroll av IP-reputasjon",
    reputationSubtitle:
      "Sammenlign en offentlig IP-adresse med uavhengige kilder til reputasjon og trusselinformasjon, og få en evidensbasert risikovurdering.",
    reputationPlaceholder: "8.8.8.8 eller 2001:4860:4860::8888",
    reputationCheckButton: "Kontroller reputasjon",
    reputationChecking: "Kontrollerer…",
    reputationNetworkError:
      "Nettverksfeil under kontakt med reputasjonskontrollen.",
    reputationRateLimitError:
      "For mange reputasjonskontroller. Vent litt før du prøver igjen.",
    reputationInvalidIp:
      "Skriv inn en gyldig offentlig IP-adresse (IPv4 eller IPv6).",
    reputationBlockedIp:
      "Private, reserverte og interne IP-områder kan ikke kontrolleres.",
    reputationEmptyTitle:
      "Skriv inn en IP-adresse for å kontrollere reputasjonen",
    reputationEmptyDescription:
      "IP-adressen kontrolleres mot DNS-blokklister, databaser med misbruksrapporter, botnet-C2-sporing og kilder til nettverksklassifisering. Valgfrie leverandører (AbuseIPDB, GreyNoise, http:BL, ThreatFox) aktiveres når en gratis API-nøkkel er konfigurert.",
    reputationRiskLow: "Lav risiko",
    reputationRiskMedium: "Middels risiko",
    reputationRiskHigh: "Høy risiko",
    reputationHeadlineClean: "Ingen skadelig aktivitet ble oppdaget",
    reputationScoreLabel: "Risikoscore",
    reputationSectionSummary: "Sammendrag av reputasjon",
    reputationSectionThreats: "Trusseldokumentasjon",
    reputationSectionMail: "E-postreputasjon",
    reputationSectionNetwork: "Nettverksklassifisering",
    reputationSectionSources: "Kilder",
    reputationSectionScore: "Hvordan denne scoren ble beregnet",
    reputationCoverageChecked: "{count} kilder kontrollert",
    reputationCoverageMatched: "{count} med trusseldokumentasjon",
    reputationCoveragePolicy: "{count} med policy- eller kontekstinformasjon",
    reputationCoverageUnavailable: "{count} utilgjengelige",
    reputationGeneratedAt: "Generert {time}",
    reputationNoThreatEvidence:
      "Ingen direkte skadelige observasjoner ble funnet blant kildene som kunne kontrolleres.",
    reputationNoMailEvidence:
      "Ingen lister over e-postreputasjon ble funnet blant de kontrollerte kildene.",
    reputationFilterAll: "Alle",
    reputationNoEvidence:
      "Ingen dokumentasjon i denne gruppen blant kildene som kunne kontrolleres.",
    reputationFactChecked: "Kontrollert",
    reputationFactMatched: "Med trusseldokumentasjon",
    reputationFactUnavailable: "Utilgjengelig",
    reputationFactCheckedAt: "Kontrollert",
    reputationScoreCapped: "Begrenset fra {count} råpoeng",
    reputationConnectionLabel: "Tilkobling",
    reputationReverseLabel: "Omvendt DNS",
    reputationFieldSource: "Kilde",
    reputationFieldConfidence: "Tillit",
    reputationFieldFirstSeen: "Først observert",
    reputationFieldLastSeen: "Sist observert",
    reputationFieldReports: "Rapporter",
    reputationFieldAttacks: "Angriftshendelser",
    reputationFieldMalware: "Skadelig programvare",
    reputationFieldDetail: "Detalj",
    reputationFieldReturnCode: "Returkode",
    reputationPointsLabel: "+{points} poeng",
    reputationCategories: {
      mail_policy: "Oppføring i e-postpolicy",
      mail_reputation: "Oppføring i e-postreputasjon",
      spam_observed: "Spamaktivitet observert",
      abuse_reported: "Misbruk rapportert",
      scanner: "Skanner for hele internettet",
      bruteforce: "Brute-force-angrep",
      web_attack: "Webangrep",
      ddos: "DDoS- eller flomangrep",
      botnet: "Botnetaktivitet",
      malware: "Infrastruktur for skadelig programvare",
      proxy: "Åpen proxy",
      vpn: "VPN / anonymiserer",
      tor: "Tor-utgangsnode",
      hosting: "Hosting / datasenter",
      residential: "Bolignettverk",
      mobile: "Mobilnettverk",
      benign_service: "Kjent forretningstjeneste",
    },
    reputationSeverities: {
      info: "Informasjon",
      low: "Lav alvorlighetsgrad",
      medium: "Middels alvorlighetsgrad",
      high: "Høy alvorlighetsgrad",
      critical: "Kritisk",
    },
    reputationSourceStates: {
      available: "tilgjengelig",
      clean: "ren",
      matched: "truffet",
      policy_listed: "oppført (policy)",
      not_configured: "ikke konfigurert",
      unsupported: "ikke støttet",
      rate_limited: "hastighetsbegrenset",
      resolver_blocked: "blokkert av resolver",
      unavailable: "utilgjengelig",
    },
    reputationReasons: {
      sbl: "Oppført i Spamhaus SBL: verifiserte spamkilder, spamtjenester eller ROKSO-sammere (dokumentasjonsbasert, menneskebearbeidet liste).",
      css: "Oppført i Spamhaus CSS: automatisk registrering av masseutsending eller utsendelse i en gråsone. Svakere dokumentasjon enn SBL.",
      xbl: "Oppført i Spamhaus XBL: verten ble observert med trojan- eller exploitprogramvare eller som åpen proxy — vanligvis en kompromittert maskin.",
      drop: "Adressen ligger i et Spamhaus DROP-nettblokk: områder kontrollert av kriminelle eller bulletproof-hostingvirksomheter, brukt til skadelig programvare, botnetkontrollører eller spam.",
      pbl_isp:
        "Oppført i Spamhaus PBL (vedlikeholdt av ISP): dette området forventes ikke å levere SMTP-post direkte til tredjeparts postservere. Det er normalt for de fleste bolig-, dynamiske og sluttbrukeradresser og er ikke dokumentasjon på misbruk.",
      pbl_spamhaus:
        "Oppført i Spamhaus PBL (vedlikeholdt av Spamhaus): et policyområde som ikke skal levere post direkte. Normalt for mange sluttbrukeradresser og ikke dokumentasjon på misbruk.",
      bcl: "Oppført i Spamhaus Botnet Controller List: bekreftet aktiv botnetkommando- og kontrollinfrastruktur.",
      spamcop_listing:
        "Oppført i SpamCop basert på nylige spamrapporter (spamfeller og brukerinnsendt dokumentasjon). Oppføringer utløper kort etter siste rapport.",
      barracuda_listing:
        "Dårlig e-postreputasjon målt i Barracudas filtreringsnettverk. Dette er et aggregert, delvis historisk signal som også kan påvirke dynamisk omfordelte adresser; det beviser ikke at adressen sender spam nå.",
      dronebl_irc_drone:
        "Observert som IRC-spamdrone (bot) av DroneBL-nettverket.",
      dronebl_bottler: "Observert som Bottler IRC-bot av DroneBL-nettverket.",
      dronebl_worm:
        "Observert kjøre en orm eller spambot av DroneBL-nettverket.",
      dronebl_ddos_drone:
        "Observert som DDoS-drone (deltar i distribuerte angrep).",
      dronebl_open_socks_proxy:
        "Observert kjøre en åpen SOCKS-proxy — infrastruktur som kan misbrukes, men som ikke nødvendigvis er skadelig i seg selv.",
      dronebl_open_http_proxy:
        "Observert kjøre en åpen HTTP-proxy — infrastruktur som kan misbrukes, men som ikke nødvendigvis er skadelig i seg selv.",
      dronebl_proxychain: "Observert som en del av en proxykjede.",
      dronebl_web_proxy: "Observert kjøre en åpen webproxy.",
      dronebl_dictionary:
        "Observert utføre automatiserte ordboksangrep (brute force).",
      dronebl_wingate: "Observert kjøre en åpen WinGate-proxy.",
      dronebl_compromised_router:
        "Observert som en kompromittert ruter eller gateway.",
      dronebl_botnet_auto:
        "Automatisk klassifisert som botnetinfrastruktur av DroneBL (eksperimentell registrering).",
      dronebl_compromised_host: "Muligens kompromittert vert oppdaget via IRC.",
      dronebl_uncategorized:
        "Oppført i DroneBL med en ukategorisert trusselklasse.",
      bld_attack:
        "Angrepsrapporter fra berørte serveroperatører, samlet av blocklist.de. En aktiv DNS-post betyr at angrep nylig er rapportert.",
      bld_counts_only:
        "Historiske misbruksrapporter registrert av blocklist.de; adressen er ikke i den aktive DNS-sonen nå.",
      feodo_c2_online:
        "Aktiv botnetkommando- og kontrollserver, verifisert av Feodo Tracker (abuse.ch) gjennom et gyldig C2-svar.",
      feodo_c2_offline:
        "C2-server for botnet som spores av Feodo Tracker (abuse.ch); sist observert de siste dagene og beholdt i blokklisten.",
      greynoise_scanner_malicious:
        "Observert å skanne internettet de siste 90 dagene og klassifisert som skadelig av GreyNoise.",
      greynoise_scanner_unknown:
        "Observert å skanne internettet de siste 90 dagene; GreyNoise kunne ikke klassifisere aktiviteten.",
      greynoise_scanner_benign:
        "Observert å skanne internettet, men klassifisert som harmløs av GreyNoise, for eksempel et forskningsprosjekt.",
      greynoise_riot:
        "Vanlig forretningstjeneste som er kjent i GreyNoise RIOT-datasettet, for eksempel en CDN- eller sikkerhetsbedrift.",
      abuseipdb_reports:
        "Misbruksrapporter fra AbuseIPDB-brukere de siste 90 dagene. Tillitsscoren gjenspeiler antall og konsistens i rapportene.",
      abuseipdb_tor: "Identifisert som Tor-utgangsnode av AbuseIPDB.",
      threatfox_ioc:
        "Publisert som trusselindikator (IOC) i abuse.ch ThreatFox-databasen, som sikkerhetsforskere deler.",
      httpbl_search_engine: "Kjent søkemotorrobot (Project Honey Pot).",
      httpbl_suspicious:
        "Mistenkelig webbesøker observert i honeypot-nettverket til Project Honey Pot. Ofte harmløse roboter; vær forsiktig.",
      httpbl_harvester:
        "Observert samle e-postadresser fra honeypots i Project Honey Pot-nettverket.",
      httpbl_comment_spammer:
        "Observert legge inn kommentarspam på honeypots i Project Honey Pot-nettverket.",
      ipapi_vpn:
        "Merket som VPN-, proxy- eller anonymiseringstjeneste av ip-api.com.",
      ipapi_hosting:
        "Merket som hosting- eller datasenteradresse av ip-api.com.",
      ipapi_mobile:
        "Identifisert som mobil- eller mobilforbindelse av ip-api.com.",
      residential_estimate:
        "Estimert boligforbindelse basert på tilkoblingstype og navngivning i omvendt DNS — en heuristik, ikke en bekreftelse fra leverandøren.",
      corroboration:
        "Flere uavhengige kilder rapporterer skadelig aktivitet for denne adressen.",
      mail_corroboration:
        "Flere uavhengige lister over e-postreputasjon inneholder denne adressen.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Kombinert Spamhaus-DNSBL: SBL (verifiserte spamkilder), CSS (automatisk registrering av spamafsendere), XBL (utnyttede verter), PBL (postpolicyområder) og BCL (botnetkontrollører).",
      "spamhaus-drop":
        "Gratis Spamhaus-feed med hele nettblokk kontrollert av kriminelle eller bulletproof-hostingvirksomheter. Kontrolleres lokalt fra en bufret kopi som oppdateres hver time.",
      spamcop:
        "E-postblokkliste bygget fra spamfeller og brukerrapporter om spam. Oppføringer er kortlivede og gjenspeiler nylig sending.",
      barracuda:
        "E-postreputasjonspoeng målt i Barracuda Networks spamfilternettverk. Aggregert og delvis historisk signal.",
      dronebl:
        "DNSBL drevet av DroneBL-prosjektet, som lister droner, kompromitterte verter, DDoS-deltakere og åpne proxyer observert av IRC- og overvåkningsnettverk. Gratis for kommersiell og ikke-kommersiell bruk.",
      "blocklist-de":
        "Tysk plattform for misbruksrapporter som samler angrepsrapporter fra berørte serveroperatører, for eksempel SSH brute force, e-postangrep og webskanning.",
      "feodo-tracker":
        "abuse.ch-sporing for C2-servere i botnett (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Oppføringer krever et observert gyldig C2-svar. Kontrolleres lokalt fra en bufret feed.",
      greynoise:
        "Etterretningsinformasjon om skannere på hele internettet. Community-API-et oppgir om en adresse nylig ble observert å skanne, og hvordan den er klassifisert.",
      abuseipdb:
        "Database med innrapporterte misbruksmeldinger og tillitsscore. Krever en gratis API-nøkkel (ABUSEIPDB_API_KEY).",
      httpbl:
        "Project Honey Pot DNSBL for nettmisbruk: adressesamlere, kommentarspammere og mistenkelige roboter. Krever en gratis tilgangsnøkkel (HTTPBL_ACCESS_KEY).",
      threatfox:
        "abuse.ch-plattform for deling av kompromitteringsindikatorer, inkludert C2-adresser i botnett. Krever en gratis Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "IP-metadata: geolokalisering, nettverk/ASN og flagg for tilkoblingsklassifisering.",
    },
    reputationGeoLabel: "Geolokalisering",
    reputationNetworkLabel: "ASN / leverandør",
    reputationShowHiddenSources: "Vis ukonfigurerte kilder ({count})",
    reputationHideHiddenSources: "Skjul ukonfigurerte kilder",
  },
  fi: {
    errorRateLimited: "Liian paljon pyyntöjä. Odota hetki ja yritä uudelleen.",
    errorInvalidTarget:
      "Anna kelvollinen julkinen verkkotunnus, IP-osoite tai URL-osoite.",
    errorTargetBlocked:
      "Yksityisiä, paikallisia ja sisäisiä kohteita ei voi tarkistaa tällä julkisella sivustolla.",
    errorTimeout:
      "Tarkistus aikakatkaistiin. Kohde voi olla hidas tai tavoittamaton.",
    errorUpstream:
      "Yläpuolinen tietojen toimittaja ei ole tällä hetkellä käytettävissä.",
    errorBadRequest: "Pyynnön parametrit ovat virheellisiä.",
    errorTargetNetwork:
      "Kohdetta ei voitu ratkaista tai siihen ei saatettu yhteyttä.",
    showAll: "Näytä kaikki",
    showLess: "Näytä vähemmän",
    navOverview: "Yleiskatsaus",
    navDiagnostics: "Vianmääritys",
    navMyIp: "Oma IP",
    brandTagline: "Verkko- ja IP-työkalut",
    themeToggle: "Vaihda teemaa",
    themeLight: "Vaalea",
    themeDark: "Tumma",
    themeSystem: "Järjestelmä",
    navMenu: "Valikko",
    skipToContent: "Siirry sisältöön",
    navToolsLabel: "Työkalut",
    sidebarLabel: "Sivuston navigointi",
    navClose: "Sulje valikko",
    copyValue: "Kopioi",
    downloadJson: "Lataa JSON",
    cancelLookup: "Peruuta",
    whoisNoteIana:
      "Viittausserveriä ei löytynyt. Näytetään IANA:n WHOIS-vastaus.",
    whoisNoteRdap:
      "WHOIS ei ollut käytettävissä. Sen sijaan näytetään RDAP-rekisteröintitiedot.",
    commandTriggerLabel: "Haku…",
    commandPlaceholder:
      "Hae työkaluja tai anna IP-osoite, verkkotunnus tai ASN…",
    commandGroupActions: "Toiminnot",
    commandGroupPages: "Siirry",
    commandEmpty: "Vastavia työkaluja tai toimintoja ei löytynyt.",
    commandHintNavigate: "Siirry",
    commandHintSelect: "Avaa",
    commandHintClose: "Sulje",
    notFoundTitle: "Sivua ei löytynyt",
    notFoundDescription:
      "Tämä osoite ei kuulu mihään työkaluun. Palaa aloitussivulle tai käytä hakua (Ctrl+K).",
    notFoundBackHome: "Takaisin aloitussivulle",
    errorTitle: "Jokin meni pieleen",
    errorDescription:
      "Sivua ei voitu ladata. Yritä uudelleen — jos virhe toistuu, syy on meidän puolellamme.",
    errorRetry: "Yritä uudelleen",
    asnRpkiValid: "RPKI voittaa",
    asnRpkiInvalid: "RPKI ei kelpaa",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Korkea",
    cdnConfidenceMedium: "Keskitaso",
    cdnConfidenceLow: "Matala",
    pingTabLabel: "Ping-testeri",
    dnsTabLabel: "DNS-haku",
    whoisTabLabel: "WHOIS-haku",
    cdnTabLabel: "CDN-tarkistus",
    asnTabLabel: "ASN-haku",
    reputationTabLabel: "IP-maine",
    pingTitle: "Ping- ja porttitesteri",
    pingSubtitle:
      "Ohjattuja TCP- ja UDP-porttien, EB-päätepisteiden sekä tietokantayhteyksien tarkistuksia selkeässä testikulussa.",
    dnsTitle: "DNS-haku",
    dnsSubtitle:
      "Hae verkkotunnusten DNS-tietueet (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) ja IP-osoitteiden käänteinen DNS.",
    whoisTitle: "WHOIS-haku",
    whoisSubtitle:
      "Hae verkkotunnusten ja IP-osoitteiden WHOIS-tiedot suoraan tästä sovelluksesta.",
    cdnTitle: "CDN-käytön tarkistus",
    cdnSubtitle:
      "Analysoi verkkotunnoksen CDN-käyttö ja todennäköinen palveluntarjoaja (mukaan lukien CloudFront, Google Cloud CDN, Azure CDN, Vercel ja muut).",
    asnTitle: "ASN-tiedot",
    asnSubtitle:
      "Hae autonomisia järjestelmiä IPinfon ASN-tiedoilla ja PeeringDB:n julkisilla yhteyksistä.",
    asnPlaceholder: "AS8881 tai 8881",
    asnLookupButton: "Hae ASN",
    asnLookingUp: "Haetaan…",
    asnInvalidInput:
      "Käytä AS-etuliitteellä varustettua tai numeerista ASN:ää, esimerkiksi AS8881 tai 8881.",
    asnInvalidRange: "AS-numeron on oltava välillä 1–{max}.",
    asnNetworkError: "Verkkovirhe ASN-haun yhteydenottoon.",
    asnUpstreamError:
      "ASN-tietojen palveluntarjoajat eivät ole tällä hetkellä käytettävissä.",
    asnRateLimitError: "Liikaa ASN-hakuja. Odota hetki ennen uutta yritystä.",
    asnEmptyTitle: "Anna ASN, niin voit tarkastella verkkoprofiilia",
    asnEmptyDescription:
      "Käytä AS-etuliitettä tai numeroa. Palveluntarjoajien tiedot voivat olla epätäydellisiä julkisten rekisteröintien ja määritetyn IPinfo-suunnitelman mukaan.",
    dnsEmptyTitle: "Anna verkkotunnus, niin voit ratkaista sen DNS-tietueet",
    dnsEmptyDescription:
      "Hae A-, AAAA-, MX-, TXT-, NS-, SOA-, SRV- ja CAA-tietueet tai tee IP-osoitteen käänteinen haku.",
    whoisEmptyTitle: "Anna verkkotunnus tai IP-osoite WHOIS-hakua varten",
    whoisEmptyDescription:
      "Hae rekisteröijä, rekisteröintipäivät, tila ja nimipalvelimet vastuulliselta WHOIS-palvelimelta.",
    cdnEmptyTitle: "Anna verkkotunnus ja tunnista sen CDN",
    cdnEmptyDescription:
      "Tarkista DNS, CNAME-ketjut ja vastausotsakkeet tunnistaksesi verkkosivuston edessä olevan CDN- tai edge-palveluntarjoajan.",
    asnNotFoundTitle: "ASN-profiilia ei löytynyt",
    asnNotFoundDescription:
      "ASN on kelvollinen, mutta yksikään määritetyistä lähteistä ei palauttanut käyttökelpoista julkista profiilia.",
    asnPartialData: "Epätäydelliset tiedot",
    asnCompleteData: "Täydet",
    asnPrefixes: "Ilmoitetut etuliitteet",
    asnRouting: "Reitityssuhteet",
    asnPeeringDb: "PeeringDB-profiili",
    asnIxPresence: "IX-esiintyminen",
    asnFacilities: "Laitetiloissa esiintyminen",
    asnSourceDiagnostics: "Lähdiagnostiikka",
    asnDetailedDiagnostics: "Yksityiskohtainen vianmääritys",
    asnUnnamed: "Nimetön AS",
    asnRoutingDescription:
      "Autonomisen järjestelmän yhteydet, naapurit ja reittipainot. Korkeampi paino tarkoittaa, että reittejä on havaittu useammin.",
    asnIxDescription:
      "Internetvaihtopisteet (IX), joissa tämä autonominen järjestelmä esiintyy, mukaan lukien yhteyskaistan nopeus.",
    asnPrefixesDescription:
      "IP-verkkoalueet, jotka autonominen järjestelmä ilmoittaa globaaliin reititystauluun.",
    asnPeeringDbDescription:
      "Yhteysprofiili ja reitityskäytännöt, jotka on ilmoitettu julkisessa PeeringDB-tietokannassa.",
    asnFacilitiesDescription:
      "Fyysiset datakeskukset ja kolokaatiolaitokset, joissa tämä verkko esiintyy.",
    asnProfileIdentityHeading: "Identiteetti ja tila",
    asnProfileInterconnectionHeading: "Yhteyksien tiedot",
    asnProfilePolicyHeading: "Peering-käytäntö",
    asnProfileExternalHeading: "Ulkoiset profiilit",
    asnProfilePrefixes4: "IPv4-etuliitteet",
    asnProfilePrefixes6: "IPv6-etuliitteet",
    asnWarnings: "Varoitukset",
    asnDiagnosticDuration: "Kesto",
    asnDiagnosticCache: "Välimuisti",
    asnDiagnosticWarnings: "Varoitukset",
    asnDiagnosticSource: "Lähde",
    asnSourceDiagnosticsDescription:
      "Palveluntarjoajien saatavuus, pyynnön kesto ja välimuistin tila tälle haulle.",
    asnCacheMiss: "ei löydy välimuistista",
    asnCacheFresh: "tuore",
    asnCacheStale: "vanhentunut",
    asnCacheNotConfigured: "ei määritetty",
    asnNoPrefixes: "Määritetyt lähteet eivät palauttaneet etuliitteitä.",
    asnNoRelations: "Määritetyt lähteet eivät palauttaneet reitityssuhteita.",
    asnMetricIpv4Addresses: "IPv4-osoitteet",
    asnMetricRoutingNeighbours: "Reitityksen naapurit",
    asnMetricIxPresence: "IX-esiintyminen",
    asnMetricIpinfoDetail: "IPinfon ASN-tiedot, kun ne on määritetty",
    asnMetricAnnouncedPrefixesDetail: "Ilmoitetut etuliitteet",
    asnMetricBgpRelationshipsDetail: "IPinfon tai RIPEstatin BGP-suhteet",
    asnMetricPeeringDbProfileDetail: "PeeringDB-verkoprofiili",
    asnPrefixIpCount: "IP-osoitteita",
    asnRelationPeers: "Peerit",
    asnRelationUpstreams: "Upstreamit",
    asnRelationDownstreams: "Downstreamit",
    asnRelationPower: "paino",
    asnSourceAvailable: "käytettävissä",
    asnSourceUnavailable: "ei käytettävissä",
    asnSourceNotConfigured: "ei määritetty",
    asnSourceError: "virhe",
    asnLabelName: "Nimi",
    asnLabelCountry: "Maa",
    asnLabelAllocated: "Varattu",
    asnLabelNetworkId: "Verkko-ID",
    asnLabelAlsoKnownAs: "Tunnetaan myös nimellä",
    asnLabelWebsite: "Verkkosivusto",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Reittipalvelin",
    asnLabelTraffic: "Liikenne",
    asnLabelPolicyGeneral: "Yleinen käytäntö",
    asnLabelPolicyLocations: "Käytännön sijainnit",
    asnLabelPolicyRatio: "Käytännön suhde",
    asnLabelPolicyContracts: "Käytännön sopimukset",
    asnLabelStatus: "Tila",
    asnLabelExchange: "Vaihtopiste",
    asnLabelSpeed: "Nopeus",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS-peer",
    asnLabelFacility: "Laitetila",
    asnLabelCity: "Kaupunki",
    asnLabelLocalAsn: "Paikallinen ASN",
    asnSortTable: "Lajiteltava taulukko",
    asnSortBy: "Lajittele sarakkeen {column} mukaan",
    asnSortNotSorted: "ei lajitettu",
    asnSortAscending: "nouseva",
    asnSortDescending: "laskeva",
    asnBooleanYes: "kyllä",
    asnBooleanNo: "ei",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "IX LAN -tietueita ei palautettu.",
    asnNoFacilityRecords: "Laitetilatietueita ei palautettu.",
    asnWarningIpinfoUnavailable:
      "IPinfon ASN-tiedot eivät ole käytettävissä tälle ASN:lle tai token-suunnitelmalle.",
    asnWarningIpinfoUnexpected:
      "IPinfo palautti odottamattoman ASN-vastauksen.",
    asnWarningNoRipeStatData:
      "Tälle ASN:lle ei löytynyt RIPEstatin ASN-tietoja.",
    asnWarningNoPeeringDbProfile:
      "Tälle ASN:lle ei löytynyt julkista PeeringDB-verkoprofiilia.",
    asnWarningProviderHttp: "{provider} palautti HTTP-tilan {status}.",
    asnWarningProviderTimedOut: "{provider}-pyynnön aika loppui.",
    asnWarningProviderTooLarge: "{provider}-vastauksen koko ylitti rajan.",
    asnWarningProviderInvalidJson:
      "{provider} palautti virheellisen JSON-vastauksen.",
    asnWarningProviderUnavailable:
      "{provider}-tiedot eivät ole tällä hetkellä käytettävissä.",
    asnWarningProviderStale:
      "{provider}-tiedot eivät ole tällä hetkellä käytettävissä; käytetään vanhentuneita välimuistitietoja.",
    asnWarningTruncated:
      "{label} lyhenettiin {limit} tietueeseen {total} tietueesta.",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfon IPv4-etuliitteet",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfon IPv6-etuliitteet",
    asnWarningLabelIpinfoPeers: "IPinfon peerit",
    asnWarningLabelIpinfoUpstreams: "IPinfon upstreamit",
    asnWarningLabelIpinfoDownstreams: "IPinfon downstreamit",
    asnWarningLabelPeeringDbIxLan: "PeeringDB:n IX LAN -tietueet",
    asnWarningLabelPeeringDbFacilities: "PeeringDB:n laitetilat",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstatin IPv4-etuliitteet",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstatin IPv6-etuliitteet",
    asnWarningLabelRipeStatRoutingNeighbours: "RIPEstatin reitityksen naapurit",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "RIPEstatin upstream-puolen naapurit",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "RIPEstatin downstream-puolen naapurit",
    targetPlaceholder: "example.com",
    lookupInProgress: "Haetaan…",
    dnsLookupButton: "Hae DNS",
    dnsLookupError: "DNS-haku epäonnistui.",
    dnsRecordsFor: "DNS-tietueet kohteelle",
    resolvedAddresses: "Ratkaisut osoitteet",
    noAddressResult: "A/AAAA-hausta ei saatu tuloksia.",
    recordDetails: "Tietueen tiedot",
    dnsRecordNotes: "Tietuehakuun liittyvät huomautukset",
    dnsTableType: "Tyyppi",
    dnsTableValue: "Arvo",
    dnsShowRaw: "Näytä raaka JSON",
    dnsHideRaw: "Piilota raaka JSON",
    dnsNoRecords: "Valitun tyyppisiä tietueita ei palautettu.",
    whoisPlaceholder: "example.com tai 8.8.8.8",
    whoisLookupButton: "Hae WHOIS",
    whoisLookupError: "WHOIS-haku epäonnistui.",
    whoisFor: "WHOIS kohteelle",
    queriedServer: "Kysytty palvelin",
    referralSource: "Viitteen lähde",
    noWhoisData: "WHOIS-tietoja ei palautettu.",
    whoisRegistrar: "Rekisteröijä",
    whoisCreated: "Luotu",
    whoisUpdated: "Päivitetty",
    whoisExpires: "Voimassaolon päättymispäivä",
    whoisStatusLabel: "Tila",
    whoisNameservers: "Nimipalvelimet",
    whoisShowRaw: "Näytä raaka tuloste",
    whoisHideRaw: "Piilota raaka tuloste",
    pingTestMode: "Testitila",
    pingModeHelperTcp: "Tarkistaa, hyväksyykö TCP-portti yhteyden.",
    pingModeHelperUdp:
      "Lähettää UDP-sondin ja ilmoittaa välittömästä vastauksesta tai virheestä.",
    pingModeHelperEb:
      "Tarkistaa ensin TCP:n ja kokeilee sitten HTTP/HTTPS-päätepisteen tavoitettavuutta.",
    pingModeHelperDatabase:
      "Suorittaa ennen todennusta tehtävät protokollatarkistukset ja valinnaiset todennustarkistukset.",
    pingModeDatabase: "Tietokanta",
    pingDatabaseType: "Tietokannan tyyppi",
    pingTargetHost: "Kohdepalvelin / IP",
    pingPort: "Portti",
    pingTimeout: "Aikakatkaisu (ms)",
    pingUseAuth: "Tarkista todennuksella",
    pingUsername: "Käyttäjätunnus",
    pingPassword: "Salasana",
    pingDatabaseOptional: "Tietokanta (valinnainen)",
    pingRunButton: "Suorita ping-testi",
    pingRunning: "Tarkistus käynnissä…",
    pingNetworkError: "Verkkovirhe /api/ping-rajapintaa yhteyttä otettaessa.",
    pingModeLabel: "Tila",
    pingLatencyLabel: "Viive",
    pingTargetLabel: "Kohde",
    pingDetailsLabel: "Tiedot",
    pingEmptyTitle: "Testiä ei ole vielä suoritettu",
    pingEmptyDescription:
      "Valitse testitila, anna palvelin ja portti sekä suorita tarkistus mitataksesi tavoitettavuutta ja viivettä.",
    pingStatusSuccess: "Kohde on tavoitettavissa",
    pingStatusFailed: "Tarkistus epäonnistui",
    pingShowDetails: "Näytä tekniset tiedot",
    pingHideDetails: "Piilota tekniset tiedot",
    pingResultTcpOk: "TCP-yhteys muodostettiin.",
    pingResultTcpTimeout: "TCP:n aikakatkaisu {timeoutMs} ms kuluttua.",
    pingResultTcpFailed: "TCP-yhteys epäonnistui: {error}",
    pingResultUdpSent:
      "UDP-paketti lähetetty. ICMP-virheitä ei havaittu {timeoutMs} ms aikana.",
    pingResultUdpResponse:
      "UDP-vastaus vastaanotettu lähteestä {from} ({bytes} tavua).",
    pingResultUdpFailed: "UDP-sondi epäonnistui: {error}",
    pingResultEbHttpOk:
      "Päätepiste on tavoitettavissa protokollalla {scheme} (tila {status}).",
    pingResultEbNoHttp:
      "TCP on auki, mutta tästä päätepisteestä ei havaittu HTTP(S)-vastetta.",
    pingResultEbTcpFailed: "EB-tarkistus epäonnistui TCP-vaiheessa: {error}",
    pingResultDbConnectFailed:
      "Yhteys tietokantaan {database} epäonnistui: {error}",
    pingResultDbProtocolOk:
      "{database}-palvelin vastasi ennen todennusta tehtävään kättelysondiin.",
    pingResultDbProtocolFailed:
      "Tietokannan {database} sondi epäonnistui: {error}",
    pingResultDbTcpOk:
      "Tietokannan {database} TCP-portti on tavoitettavissa. Tälle tyypille ei ole ennen todennusta tehtävää protokollasondia.",
    pingResultDbAuthUnsupported:
      "Todennetut tarkistukset on toteutettu vain Redisille. Käytä tietokannan {database} protokollatarkistusta.",
    pingResultDbAuthOk: "Todennettu Redis-yhteys onnistui.",
    pingResultDbAuthFailed: "Redis-todennus epäonnistui: {error}",
    cdnAnalyzeButton: "Tarkista CDN",
    cdnAnalyzing: "Analysoidaan…",
    cdnNetworkError: "Verkkovirhe CDN-tarkistusta yhteyttä otettaessa.",
    cdnSummaryUnreachable: "Kohde ei ole tavoitettavissa",
    cdnSummaryNoMatch: "Varmaa CDN-vastaavuutta ei löytynyt",
    cdnSummaryDetected: "CDN havaittu",
    cdnConfidenceNa: "ei koske",
    cdnNoProviderMatch:
      "Palveluntarjoajaa ei tunnistettu — ratkaistut IP-osoitteet",
    cdnInspectIpsHint: "Voit tarkastella näitä IP-osoitteita IP-hakusivulla:",
    cdnTargetLabel: "Kohde",
    cdnHttpStatusLabel: "HTTP-tila",
    cdnProviderLabel: "Palveluntarjoaja",
    cdnUnknown: "Tuntematon",
    cdnMatchedSignals: "Vastaavat signaalit",
    cdnNoSignals: "Yksiselitteistä CDN-signaalia ei löytynyt.",
    cdnCnameChain: "CNAME-ketju",
    cdnNoCname: "CNAME-tietueita ei löytynyt.",
    cdnInterestingHeaders: "Mielenkiintoiset vastausotsakkeet",
    cdnNoHeaders: "Olennaisia otsakkeita ei löytynyt.",
    reputationTitle: "IP-maineen tarkistus",
    reputationSubtitle:
      "Vertaa julkista IP-osoitetta riippumattomiin maineen ja uhkatiedon lähteisiin ja saat näyttöön perustuvan riskiarvion.",
    reputationPlaceholder: "8.8.8.8 tai 2001:4860:4860::8888",
    reputationCheckButton: "Tarkista maine",
    reputationChecking: "Tarkistetaan…",
    reputationNetworkError:
      "Verkkovirhe maineen tarkistusta yhteyttä otettaessa.",
    reputationRateLimitError:
      "Liikaa IP-maineen tarkistuksia. Odota hetki ennen uutta yritystä.",
    reputationInvalidIp: "Anna kelvollinen julkinen IP-osoite (IPv4 tai IPv6).",
    reputationBlockedIp:
      "Yksityisiä, varattuja ja sisäisiä IP-alueita ei voi tarkistaa.",
    reputationEmptyTitle: "Anna IP-osoite tarkistaaksesi sen maineen",
    reputationEmptyDescription:
      "IP-osoitetta verrataan DNS-estoihin, väärinkäytösraporttien tietokantoihin, botnet-C2-seuraajiin ja verkkoluokituslähteisiin. Valinnaiset palveluntarjoajat (AbuseIPDB, GreyNoise, http:BL, ThreatFox) aktivoituvat, kun ilmainen API-avain on määritetty.",
    reputationRiskLow: "Matala riski",
    reputationRiskMedium: "Keskitasoinen riski",
    reputationRiskHigh: "Korkea riski",
    reputationHeadlineClean: "Haitallista toimintaa ei havaittu",
    reputationScoreLabel: "Riskipisteet",
    reputationSectionSummary: "Maineyhteenveto",
    reputationSectionThreats: "Uhkan näyttö",
    reputationSectionMail: "Sähköpostin maine",
    reputationSectionNetwork: "Verkkoluokitus",
    reputationSectionSources: "Lähteet",
    reputationSectionScore: "Näiden pisteiden laskenta",
    reputationCoverageChecked: "{count} lähdettä tarkistettu",
    reputationCoverageMatched: "{count} lähteessä uhkan näyttöä",
    reputationCoveragePolicy:
      "{count} lähteessä käytäntö- tai kontekstitietoja",
    reputationCoverageUnavailable: "{count} ei käytettävissä",
    reputationGeneratedAt: "Luotu {time}",
    reputationNoThreatEvidence:
      "Tarkistettavissa olevista lähteistä ei löytynyt suoria havaintoja haitallisesta toiminnasta.",
    reputationNoMailEvidence:
      "Tarkistetuista lähteistä ei löytynyt sähköpostin maineluetteloita.",
    reputationFilterAll: "Kaikki",
    reputationNoEvidence:
      "Tässä ryhmässä ei ole näyttöä tarkistettavissa olevista lähteistä.",
    reputationFactChecked: "Tarkistettu",
    reputationFactMatched: "Sisältää uhkan näyttöä",
    reputationFactUnavailable: "Ei käytettävissä",
    reputationFactCheckedAt: "Tarkistettu",
    reputationScoreCapped: "Rajautettu {count} raakapisteestä",
    reputationConnectionLabel: "Yhteys",
    reputationReverseLabel: "Käänteinen DNS",
    reputationFieldSource: "Lähde",
    reputationFieldConfidence: "Luottamus",
    reputationFieldFirstSeen: "Ensimmäinen havainto",
    reputationFieldLastSeen: "Viimeisin havainto",
    reputationFieldReports: "Raportit",
    reputationFieldAttacks: "Hyökkäystapahtumat",
    reputationFieldMalware: "Haittaohjelma",
    reputationFieldDetail: "Yksityiskohta",
    reputationFieldReturnCode: "Palautuskoodi",
    reputationPointsLabel: "+{points} pistettä",
    reputationCategories: {
      mail_policy: "Sähköpostikäytännön luettelo",
      mail_reputation: "Sähköpostin maineluettelo",
      spam_observed: "Roskapostiaktiviteettia havaittu",
      abuse_reported: "Väärinkäyttö ilmoitettu",
      scanner: "Koko internetin skanneri",
      bruteforce: "Raahevoimahyökkäykset",
      web_attack: "Verkkohyökkäykset",
      ddos: "DDoS- ja tulvahyökkäykset",
      botnet: "Botnet-aktiviteetti",
      malware: "Haittaohjelmiston infrastruktuuri",
      proxy: "Avoin välityspalvelin",
      vpn: "VPN / anonymisointi",
      tor: "Tor-poistumisnode",
      hosting: "Hosting / datakeskus",
      residential: "Kotiverkko",
      mobile: "Mobiiliverkko",
      benign_service: "Tunnettu liiketoimintapalvelu",
    },
    reputationSeverities: {
      info: "Tiedot",
      low: "Matala vakavuus",
      medium: "Keskitasoinen vakavuus",
      high: "Korkea vakavuus",
      critical: "Kriittinen",
    },
    reputationSourceStates: {
      available: "käytettävissä",
      clean: "puhdas",
      matched: "vastaavuus",
      policy_listed: "luetteloitu (käytäntö)",
      not_configured: "ei määritetty",
      unsupported: "ei tuettu",
      rate_limited: "pyyntörajoitettu",
      resolver_blocked: "resolversin estämä",
      unavailable: "ei käytettävissä",
    },
    reputationReasons: {
      sbl: "Spamhaus SBL -luettelossa: vahvistettuja roskapostin lähteitä, roskapostipalveluita tai ROKSO-roskapostittajia (näyttöön perustuva, ihmisten ylläpitämä luettelo).",
      css: "Spamhaus CSS -luettelossa: automaattinen suuren volyymin tai rajatapausten sähköpostin lähettämisen tunnistus. Heikompi näyttö kuin SBL.",
      xbl: "Spamhaus XBL -luettelossa: isäntä on havaittu suorittavan troijalais- tai hyökkäysohjelmistoa tai avointa välityspalvelinta — yleensä vaarantunut tietokone.",
      drop: "Osoite kuuluu Spamhaus DROP -verkkolohkoon: rangaistuksellisten tai bulletproof-hosting-toimijoiden hallitsemat alueet, joita käytetään haittaohjelmistoon, bottiverkkojen ohjaimiin tai roskapostiin.",
      pbl_isp:
        "Spamhaus PBL -luettelossa (ISP ylläpitää): tältä alueelta ei odoteta SMTP-sähköpostin toimitusta suoraan kolmansien osapuolten postipalvelimille. Tämä on normaalia useimmille koti-, dynaamisille ja loppukäyttäjäosoitteille eikä ole väärinkäytön näyttö.",
      pbl_spamhaus:
        "Spamhaus PBL -luettelossa (Spamhaus ylläpitää): käytäntöalue, joka ei saisi toimittaa sähköpostia suoraan. Normaalia monille loppukäyttäjäosoitteille, eikä väärinkäytön näyttö.",
      bcl: "Spamhaus Botnet Controller List -luettelossa: vahvistettu aktiivinen bottiverkon komento- ja ohjausinfrastruktuuri.",
      spamcop_listing:
        "SpamCop-luettelossa viimeaikaisten roskapostiraporttien perusteella (spammanssat ja käyttäjien antama näyttö). Luettelointi päättyy pian viimeisimmän ilmoituksen jälkeen.",
      barracuda_listing:
        "Huono sähköpostin maine, joka on mitattu Barracudan suodatinkimmoisessä. Kyse on koostetusta, osittain historiallisesta signaalista, joka voi vaikuttaa myös dynaamisesti uudelleenosoitettuihin osoitteisiin eikä todista, että osoite lähettää juuri nyt roskapostia.",
      dronebl_irc_drone:
        "DroneBL-verkko on havainnut sen IRC-roskidroonina eli bottina.",
      dronebl_bottler: "DroneBL-verkko on havainnut sen Bottler-IRC-bottina.",
      dronebl_worm:
        "DroneBL-verkko on havainnut sen suorittavan matoa tai roskapostibottia.",
      dronebl_ddos_drone:
        "Havaittu DDoS-droonena eli osallistujana hajautettuihin hyökkäyksiin.",
      dronebl_open_socks_proxy:
        "Havaittu suorittavan avointa SOCKS-välityspalvelinta — hyökkäyskelpoinen infrastruktuuri, joka ei välttämättä ole itsessään haittallinen.",
      dronebl_open_http_proxy:
        "Havaittu suorittavan avointa HTTP-välityspalvelinta — hyökkäyskelpoinen infrastruktuuri, joka ei välttämättä ole itsessään haittallinen.",
      dronebl_proxychain: "Havaittu osana proxyketjua.",
      dronebl_web_proxy: "Havaittu suorittavan avointa web-välityspalvelinta.",
      dronebl_dictionary:
        "Havaittu suorittavan automaattisia sanakirjahyökkäyksiä eli raahevoimahyökkäyksiä.",
      dronebl_wingate:
        "Havaittu suorittavan avointa WinGate-välityspalvelinta.",
      dronebl_compromised_router:
        "Havaittu vaarantuneena reitittimenä tai yhdyskäytävänä.",
      dronebl_botnet_auto:
        "DroneBL on luokitellut sen automaattisesti bottiverkon infrastruktuuriksi (kokeellinen tunnistus).",
      dronebl_compromised_host:
        "IRC:ssä havaittu mahdollisesti vaarantunut isäntä.",
      dronebl_uncategorized:
        "DroneBL-luettelossa luokittelemattomalla uhkatyypillä.",
      bld_attack:
        "Hyökkäysraportteja, jotka uhrideksi joutuneet palvelinoperaattorit ovat tehneet ja blocklist.de on koonnut. Aktiivinen DNS-merkintä tarkoittaa, että hyökkäyksistä on ilmoitettu äskettäin.",
      bld_counts_only:
        "Historiallisia väärinkäytösraportteja blocklist.de on tallentanut; osoite ei ole tällä hetkellä aktiivisessa DNS-alueessa.",
      feodo_c2_online:
        "Aktiivinen bottiverkon komento- ja ohjauspalvelin, jonka Feodo Tracker (abuse.ch) on vahvistanut kelvollisella C2-vastauksella.",
      feodo_c2_offline:
        "Feodo Trackerin (abuse.ch) seuraama bottiverkon C2-palvelin; viimeksi havaittu muutaman päivän sisällä ja säilytetty estolistassa.",
      greynoise_scanner_malicious:
        "Havaittu skannoivan internettiä viimeisen 90 päivän aikana ja GreyNoise on luokitellut sen haittalliseksi.",
      greynoise_scanner_unknown:
        "Havaittu skannoivan internettiä viimeisen 90 päivän aikana; GreyNoise ei voinut luokitella toimintaa.",
      greynoise_scanner_benign:
        "Havaittu skannoivan internettiä, mutta GreyNoise on luokitellut sen vaarattomaksi, esimerkiksi tutkimushankkeeksi.",
      greynoise_riot:
        "Tunnettu yleinen liiketoimintapalvelu GreyNoise RIOT-aineistossa, esimerkiksi CDN- tai turvallisuusyritys.",
      abuseipdb_reports:
        "AbuseIPDB-käyttäjien väärinkäytösraportit viimeisen 90 päivän ajalta. Luottamusaste heijastaa raporttien määrää ja johdonmukaisuutta.",
      abuseipdb_tor: "AbuseIPDB on tunnistanut sen Tor-poistumisnodena.",
      threatfox_ioc:
        "Julkaistu uhka-indikaattorina (IOC) abuse.ch:n ThreatFox-tietokannassa, jonka turvallisuustutkijat jakavat.",
      httpbl_search_engine: "Tunnettu hakukoneen välein (Project Honey Pot).",
      httpbl_suspicious:
        "Epäilyttävä verkkokävijä havaittu Project Honey Potin honeypot-verkossa. Usein harmiton roboti, mutta suhtaudu varovaisesti.",
      httpbl_harvester:
        "Havaittu keräävän sähköpostiosoitteita Project Honey Pot -verkon honeypoteista.",
      httpbl_comment_spammer:
        "Havaittu lähettävän kommenttiroskapostia Project Honey Pot -verkon honeypoteihin.",
      ipapi_vpn:
        "ip-api.com on merkinnyt sen VPN-, proxy- tai anonymisointipalveluksi.",
      ipapi_hosting:
        "ip-api.com on merkinnyt sen hosting- tai datakeskusosoitteeksi.",
      ipapi_mobile:
        "ip-api.com on tunnistanut sen mobiili- tai soluyhteydeksi.",
      residential_estimate:
        "Arvioitu kotiliittymä yhteyden tyypin ja käänteisen DNS-nimeämisen perusteella — heuristinen arvio, ei palveluntarjoajan vahvistus.",
      corroboration:
        "Useat riippumattomat lähteet ilmoittavat osoitteen haittallisesta toiminnasta.",
      mail_corroboration:
        "Useat riippumattomat sähköpostin maineluettelot sisältävät tämän osoitteen.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Yhdistetty Spamhaus-DNSBL: SBL (vahvistetut roskapostin lähteet), CSS (roskapostin lähettäjien automaattinen tunnistus), XBL (väärinkäytetyt isännät), PBL (sähköpostin käytäntöalueet) ja BCL (bottiverkkojen ohjaimet).",
      "spamhaus-drop":
        "Ilmainen Spamhaus-syöte, jossa ovat kokonaiset verkkolohkot, joita rangaistukselliset tai bulletproof-hosting-toimijat hallitsevat. Tarkistetaan paikallisesti välimuistiin tallennetusta, tunti kertaa päivitetystä kopiosta.",
      spamcop:
        "Sähköpostin estollista, joka on koostettu spammanssoista ja käyttäjien roskapostiraporteista. Luetteloinnit ovat lyhytaikaisia ja kuvaavat viimeaikaista lähetyskäyttäytymistä.",
      barracuda:
        "Barracuda Networksin roskapostisuodatinverkon mittaamat sähköpostin mainepisteet. Koostettu ja osittain historiallinen signaali.",
      dronebl:
        "DroneBL-projektin ylläpitämä DNSBL, joka luettelee IRC- ja valvontaverkkojen havaitsemia drooneja, vaarantuneita isäntiä, DDoS-osallistujia ja avoimia välityspalvelimia. Ilmaista kaupalliseen ja ei-kaupalliseen käyttöön.",
      "blocklist-de":
        "Saksalainen väärinkäytösraportointialusta, joka kerää uhrideksi joutuneilta palvelinoperaattoreilta hyökkäysraportteja, kuten SSH-raakevoimahyökkäyksiä, sähköpostihyökkäyksiä ja verkkoskaneuksia.",
      "feodo-tracker":
        "abuse.ch:n seuranta bottiverkkojen C2-palvelimille (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Merkinnät edellyttävät havaittu kelvollista C2-vastausta. Tarkistetaan paikallisesti välimuistista.",
      greynoise:
        "Tiedot koko internetin skannereista. Yhteisö-API kertoo, onko osoitettu havaittu skannaamassa äskettäin ja miten se on luokiteltu.",
      abuseipdb:
        "Yhteisökerätty väärinkäytösraporttien tietokanta, jossa on luottamusaste. Vaatii ilmaisen API-avaimen (ABUSEIPDB_API_KEY).",
      httpbl:
        "Project Honey Potin DNSBL verkkowäärinkäytölle: osoitekerääjät, kommenttiroskpostaajat ja epäilyttävät robotit. Vaatii ilmaisen käyttöavaimen (HTTPBL_ACCESS_KEY).",
      threatfox:
        "abuse.ch:n alusta, jossa jaetaan vaarantumisindikaattoreita, mukaan lukien bottiverkkojen C2-osoitteet. Vaatii ilmaisen Auth-Key-avaimen (THREATFOX_AUTH_KEY).",
      "ip-api":
        "IP-metatiedot: maantieteellinen sijainti, verkko tai ASN ja yhteyden luokitusliput.",
    },
    reputationGeoLabel: "Geolokointi",
    reputationNetworkLabel: "ASN / palveluntarjoaja",
    reputationShowHiddenSources: "Näytä määrittämättömät lähteet ({count})",
    reputationHideHiddenSources: "Piilota määrittämättömät lähteet",
  },
  el: {
    errorRateLimited:
      "Πάρα πολλές αιτήσεις. Περιμένετε λίγο και δοκιμάστε ξανά.",
    errorInvalidTarget:
      "Εισαγάγετε έναν έγκυρο δημόσιο τομένα, διεύθυνση IP ή URL.",
    errorTargetBlocked:
      "Ιδιωτικοί, τοπικοί και εσωτερικοί στόχοι δεν μπορούν να ελεγχθούν σε αυτόν τον δημόσιο ιστότοπο.",
    errorTimeout:
      "Ο έλεγχος έληξε με χρονικό όριο. Ο στόχος μπορεί να είναι αργός ή μη προσβάσιμος.",
    errorUpstream:
      "Ένας ανώτερος πάροχος δεδομένων δεν είναι προς το παρόν διαθέσιμος.",
    errorBadRequest: "Οι παράμετροι του αιτήματος δεν είναι έγκυρες.",
    errorTargetNetwork: "Δεν ήταν δυνατή η ανάλυση ή η πρόσβαση στον στόχο.",
    showAll: "Εμφάνιση όλων",
    showLess: "Εμφάνιση λιγότερων",
    navOverview: "Επισκόπηση",
    navDiagnostics: "Διαγνωστικά",
    navMyIp: "Η IP μου",
    brandTagline: "Εργαλεία δικτύου και IP",
    themeToggle: "Αλλαγή θέματος",
    themeLight: "Φωτεινό",
    themeDark: "Σκοτεινό",
    themeSystem: "Σύστημα",
    navMenu: "Μενού",
    skipToContent: "Μετάβαση στο περιεχόμενο",
    navToolsLabel: "Εργαλεία",
    sidebarLabel: "Πλοήγηση στον ιστότοπο",
    navClose: "Κλείσιμο μενού",
    copyValue: "Αντιγραφή",
    downloadJson: "Λήψη JSON",
    cancelLookup: "Ακύρωση",
    whoisNoteIana:
      "Δεν βρέθηκε διακομιστής παραπομπής. Εμφανίζεται η απόκριση WHOIS του IANA.",
    whoisNoteRdap:
      "Το WHOIS δεν ήταν διαθέσιμο. Εμφανίζονται αντί για αυτό τα δεδομένα καταχώρισης RDAP.",
    commandTriggerLabel: "Αναζήτηση…",
    commandPlaceholder: "Αναζητήστε εργαλεία ή εισαγάγετε IP, τομένα ή ASN…",
    commandGroupActions: "Ενέργειες",
    commandGroupPages: "Μετάβαση σε",
    commandEmpty: "Δεν βρέθηκαν αντίστοιχα εργαλεία ή ενέργειες.",
    commandHintNavigate: "Πλοήγηση",
    commandHintSelect: "Άνοιγμα",
    commandHintClose: "Κλείσιμο",
    notFoundTitle: "Η σελίδα δεν βρέθηκε",
    notFoundDescription:
      "Αυτή η διεύθυνση δεν αντιστοιχεί σε κάποιο εργαλείο. Επιστρέψτε στην αρχική σελίδα ή χρησιμοποιήστε την αναζήτηση (Ctrl+K).",
    notFoundBackHome: "Επιστροφή στην αρχική σελίδα",
    errorTitle: "Κάτι πήγε στραβά",
    errorDescription:
      "Δεν ήταν δυνατή η φόρτωση αυτής της σελίδας. Δοκιμάστε ξανά — αν το πρόβλημα συνεχίζεται, η αιτία είναι στο δικό μας σύστημα.",
    errorRetry: "Δοκιμή ξανά",
    asnRpkiValid: "Το RPKI είναι έγκυρο",
    asnRpkiInvalid: "Το RPKI δεν είναι έγκυρο",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Υψηλή",
    cdnConfidenceMedium: "Μεσαία",
    cdnConfidenceLow: "Χαμηλή",
    pingTabLabel: "Δοκιμαστής ping",
    dnsTabLabel: "Αναζήτηση DNS",
    whoisTabLabel: "Αναζήτηση WHOIS",
    cdnTabLabel: "Έλεγχος CDN",
    asnTabLabel: "Αναζήτηση ASN",
    reputationTabLabel: "Φήμη IP",
    pingTitle: "Δοκιμαστής ping και θυρών",
    pingSubtitle:
      "Καθοδηγούμενοι έλεγχοι θυρών TCP/UDP, endpoint EB και συνδεσιμότητας βάσεων δεδομένων με καθαρότερη ροή ελέγχου.",
    dnsTitle: "Αναζήτηση DNS",
    dnsSubtitle:
      "Εκτελείτε ερωτήματα εγγραφών DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) για τομείς και αντίστροφο DNS για διευθύνσεις IP.",
    whoisTitle: "Αναζήτηση WHOIS",
    whoisSubtitle:
      "Εκτελείτε ερωτήματα εγγραφών WHOIS για τομείς και διευθύνσεις IP απευθείας από την εφαρμογή.",
    cdnTitle: "Έλεγχος χρήσης CDN",
    cdnSubtitle:
      "Αναλύστε οποιονδήποτε τομένα για χρήση CDN και πιθανό πάροχο, όπως CloudFront, Google Cloud CDN, Azure CDN, Vercel και άλλους.",
    asnTitle: "Πληροφορίες ASN",
    asnSubtitle:
      "Αναζητήστε αυτόνομα συστήματα με λεπτομέρειες ASN από το IPinfo και δημόσια δεδομένα διασύνδεσης από το PeeringDB.",
    asnPlaceholder: "AS8881 ή 8881",
    asnLookupButton: "Αναζήτηση ASN",
    asnLookingUp: "Αναζητήστε…",
    asnInvalidInput:
      "Χρησιμοποιήστε ASN με πρόθεμα AS ή αριθμητικό ASN, για παράδειγμα AS8881 ή 8881.",
    asnInvalidRange: "Το ASN πρέπει να είναι μεταξύ 1 και {max}.",
    asnNetworkError:
      "Σφάλμα δικτύου κατά την επικοινωνία με την αναζήτηση ASN.",
    asnUpstreamError:
      "Οι πάροχοι δεδομένων ASN δεν είναι προς το παρόν διαθέσιμοι.",
    asnRateLimitError:
      "Πάρα πολλές αναζητήσεις ASN. Περιμένετε λίγο πριν δοκιμάσετε ξανά.",
    asnEmptyTitle: "Εισαγάγετε ένα ASN για να εξετάσετε ένα προφίλ δικτύου",
    asnEmptyDescription:
      "Χρησιμοποιήστε τιμή με πρόθεμα AS ή αριθμητική τιμή. Τα δεδομένα των παρόχων μπορεί να είναι μερικά, ανάλογα με τα δημόσια αρχεία και το διαμορφωμένο πλάνο IPinfo.",
    dnsEmptyTitle: "Εισαγάγετε τομένα για να επιλύσετε τις εγγραφές DNS",
    dnsEmptyDescription:
      "Αναζητήστε εγγραφές A, AAAA, MX, TXT, NS, SOA, SRV και CAA ή εκτελέστε αντίστροφη αναζήτηση σε διεύθυνση IP.",
    whoisEmptyTitle: "Εισαγάγετε τομένα ή διεύθυνση IP για ερώτημα WHOIS",
    whoisEmptyDescription:
      "Ανακτήστε μητρώο, ημερομηνίες καταχώρισης, κατάσταση και διακομιστές ονόματος από τον υπεύθυνο διακομιστή WHOIS.",
    cdnEmptyTitle: "Εισαγάγετε τομένα για να εντοπίσετε το CDN του",
    cdnEmptyDescription:
      "Εξετάστε το DNS, τις αλυσίδες CNAME και τις κεφαλίδες απόκρισης για να εντοπίσετε τον πάροχο CDN ή edge που βρίσκεται μπροστά από τον ιστότοπο.",
    asnNotFoundTitle: "Δεν βρέθηκε προφίλ ASN",
    asnNotFoundDescription:
      "Το ASN είναι έγκυρο, αλλά καμία διαμορφωμένη πηγή δεν επέστρεψε χρήσιμο δημόσιο προφίλ.",
    asnPartialData: "Μερικά δεδομένα",
    asnCompleteData: "Πλήρη",
    asnPrefixes: "Δηλωμένα προθέματα",
    asnRouting: "Σχέσεις δρομολόγησης",
    asnPeeringDb: "Προφίλ PeeringDB",
    asnIxPresence: "Παρουσία σε IX",
    asnFacilities: "Παρουσία σε εγκαταστάσεις",
    asnSourceDiagnostics: "Διαγνωστικά πηγών",
    asnDetailedDiagnostics: "Λεπτομερή διαγνωστικά",
    asnUnnamed: "Ανώνυμο AS",
    asnRoutingDescription:
      "Διασυνδέσεις, γείτονες και βάρη διαδρομών του αυτόνομου συστήματος. Υψηλότερα βάρη δείχνουν διαδρομές που παρατηρήθηκαν πιο συχνά.",
    asnIxDescription:
      "Σημεία ανταλλαγής Internet (IX) όπου υπάρχει το αυτόνομο σύστημα, συμπεριλαμβανομένου του εύρους ζώνης διασύνδεσης.",
    asnPrefixesDescription:
      "Δίκτυα IP που το αυτόνομο σύστημα δηλώνει στον παγκόσμιο πίνακα δρομολόγησης.",
    asnPeeringDbDescription:
      "Προφίλ διασύνδεσης και πολιτικές δρομολόγησης που έχουν δηλωθεί στη δημόσια βάση PeeringDB.",
    asnFacilitiesDescription:
      "Φυσικά κέντρα δεδομένων και εγκαταστάσεις colocation όπου υπάρχει αυτό το δίκτυο.",
    asnProfileIdentityHeading: "Ταυτότητα και κατάσταση",
    asnProfileInterconnectionHeading: "Λεπτομέρειες διασύνδεσης",
    asnProfilePolicyHeading: "Πολιτική peering",
    asnProfileExternalHeading: "Εξωτερικά προφίλ",
    asnProfilePrefixes4: "Προθέματα IPv4",
    asnProfilePrefixes6: "Προθέματα IPv6",
    asnWarnings: "Προειδοποιήσεις",
    asnDiagnosticDuration: "Διάρκεια",
    asnDiagnosticCache: "Cache",
    asnDiagnosticWarnings: "Προειδοποιήσεις",
    asnDiagnosticSource: "Πηγή",
    asnSourceDiagnosticsDescription:
      "Διαθεσιμότητα παρόχων, διάρκεια αιτήματος και κατάσταση cache για αυτή την αναζήτηση.",
    asnCacheMiss: "cache miss",
    asnCacheFresh: "φρέσκο",
    asnCacheStale: "παλαιό",
    asnCacheNotConfigured: "μη διαμορφωμένο",
    asnNoPrefixes: "Οι διαμορφωμένες πηγές δεν επέστρεψαν προθέματα.",
    asnNoRelations:
      "Οι διαμορφωμένες πηγές δεν επέστρεψαν σχέσεις δρομολόγησης.",
    asnMetricIpv4Addresses: "Διευθύνσεις IPv4",
    asnMetricRoutingNeighbours: "Γείτονες δρομολόγησης",
    asnMetricIxPresence: "Παρουσία σε IX",
    asnMetricIpinfoDetail: "Δεδομένα ASN από το IPinfo, όταν έχουν διαμορφωθεί",
    asnMetricAnnouncedPrefixesDetail: "Δηλωμένα προθέματα",
    asnMetricBgpRelationshipsDetail: "Σχέσεις BGP από IPinfo ή RIPEstat",
    asnMetricPeeringDbProfileDetail: "Προφίλ δικτύου PeeringDB",
    asnPrefixIpCount: "Διευθύνσεις IP",
    asnRelationPeers: "Peers",
    asnRelationUpstreams: "Upstreams",
    asnRelationDownstreams: "Downstreams",
    asnRelationPower: "βάρος",
    asnSourceAvailable: "διαθέσιμη",
    asnSourceUnavailable: "μη διαθέσιμη",
    asnSourceNotConfigured: "μη διαμορφωμένη",
    asnSourceError: "σφάλμα",
    asnLabelName: "Όνομα",
    asnLabelCountry: "Χώρα",
    asnLabelAllocated: "Εκχωρημένο",
    asnLabelNetworkId: "ID δικτύου",
    asnLabelAlsoKnownAs: "Γνωστό και ως",
    asnLabelWebsite: "Ιστότοπος",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Κίνηση",
    asnLabelPolicyGeneral: "Γενική πολιτική",
    asnLabelPolicyLocations: "Τοποθεσίες πολιτικής",
    asnLabelPolicyRatio: "Αναλογία πολιτικής",
    asnLabelPolicyContracts: "Συμβάσεις πολιτικής",
    asnLabelStatus: "Κατάσταση",
    asnLabelExchange: "Σημείο ανταλλαγής",
    asnLabelSpeed: "Ταχύτητα",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS peer",
    asnLabelFacility: "Εγκατάσταση",
    asnLabelCity: "Πόλη",
    asnLabelLocalAsn: "Τοπικό ASN",
    asnSortTable: "Πίνακας με δυνατότητα ταξινόμησης",
    asnSortBy: "Ταξινόμηση κατά {column}",
    asnSortNotSorted: "χωρίς ταξινόμηση",
    asnSortAscending: "αύξουσα",
    asnSortDescending: "φθίνουσα",
    asnBooleanYes: "ναι",
    asnBooleanNo: "όχι",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Δεν επιστράφηκαν εγγραφές IX LAN.",
    asnNoFacilityRecords: "Δεν επιστράφηκαν εγγραφές εγκαταστάσεων.",
    asnWarningIpinfoUnavailable:
      "Τα δεδομένα ASN του IPinfo δεν είναι διαθέσιμα για αυτό το ASN ή το πλάνο token.",
    asnWarningIpinfoUnexpected: "Το IPinfo επέστρεψε απροσδόκητα δεδομένα ASN.",
    asnWarningNoRipeStatData:
      "Δεν βρέθηκαν δεδομένα ASN από το RIPEstat για αυτό το ASN.",
    asnWarningNoPeeringDbProfile:
      "Δεν βρέθηκε δημόσιο προφίλ δικτύου PeeringDB για αυτό το ASN.",
    asnWarningProviderHttp: "Ο {provider} επέστρεψε HTTP {status}.",
    asnWarningProviderTimedOut:
      "Το αίτημα προς {provider} έληξε με χρονικό όριο.",
    asnWarningProviderTooLarge:
      "Η απόκριση του {provider} ξεπέρασε το όριο μεγέθους.",
    asnWarningProviderInvalidJson: "Ο {provider} επέστρεψε μη έγκυρο JSON.",
    asnWarningProviderUnavailable:
      "Τα δεδομένα του {provider} δεν είναι προς το παρόν διαθέσιμα.",
    asnWarningProviderStale:
      "Τα δεδομένα του {provider} δεν είναι προς το παρόν διαθέσιμα; χρησιμοποιούνται παλαιά δεδομένα cache.",
    asnWarningTruncated:
      "Τα {label} περιορίστηκαν σε {limit} από {total} εγγραφές.",
    asnWarningLabelIpinfoIpv4Prefixes: "Προθέματα IPv4 από IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Προθέματα IPv6 από IPinfo",
    asnWarningLabelIpinfoPeers: "Peers από IPinfo",
    asnWarningLabelIpinfoUpstreams: "Upstreams από IPinfo",
    asnWarningLabelIpinfoDownstreams: "Downstreams από IPinfo",
    asnWarningLabelPeeringDbIxLan: "Εγγραφές IX LAN από PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Εγκαταστάσεις PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Προθέματα IPv4 από RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Προθέματα IPv6 από RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours:
      "Γείτονες δρομολόγησης από RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Γείτονες από την πλευρά upstream του RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Γείτονες από την πλευρά downstream του RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "Αναζητήστε…",
    dnsLookupButton: "Αναζήτηση DNS",
    dnsLookupError: "Η αναζήτηση DNS απέτυχε.",
    dnsRecordsFor: "Εγγραφές DNS για",
    resolvedAddresses: "Επιλυμένες διευθύνσεις",
    noAddressResult: "Δεν υπήρξε αποτέλεσμα αναζήτησης A/AAAA.",
    recordDetails: "Λεπτομέρειες εγγραφής",
    dnsRecordNotes: "Σημειώσεις αναζήτησης εγγραφών",
    dnsTableType: "Τύπος",
    dnsTableValue: "Τιμή",
    dnsShowRaw: "Εμφάνιση ακατέργαστου JSON",
    dnsHideRaw: "Απόκρυψη ακατέργαστου JSON",
    dnsNoRecords: "Δεν επιστράφηκαν εγγραφές του επιλεγμένου τύπου.",
    whoisPlaceholder: "example.com ή 8.8.8.8",
    whoisLookupButton: "Αναζήτηση WHOIS",
    whoisLookupError: "Η αναζήτηση WHOIS απέτυχε.",
    whoisFor: "WHOIS για",
    queriedServer: "Διακομιστής που ρωτήθηκε",
    referralSource: "Πηγή παραπομπής",
    noWhoisData: "Δεν επιστράφηκαν δεδομένα WHOIS.",
    whoisRegistrar: "Εταιρεία καταχώρισης",
    whoisCreated: "Δημιουργήθηκε",
    whoisUpdated: "Ενημερώθηκε",
    whoisExpires: "Λήγει",
    whoisStatusLabel: "Κατάσταση",
    whoisNameservers: "Διακομιστές ονόματος",
    whoisShowRaw: "Εμφάνιση ακατέργαστης εξόδου",
    whoisHideRaw: "Απόκρυψη ακατέργαστης εξόδου",
    pingTestMode: "Λειτουργία ελέγχου",
    pingModeHelperTcp: "Ελέγχει αν η θύρα TCP δέχεται σύνδεση.",
    pingModeHelperUdp:
      "Στέλνει δοκιμή UDP και αναφέρει άμεση απόκριση ή σφάλμα.",
    pingModeHelperEb:
      "Ελέγχει πρώτα το TCP και έπειτα δοκιμάζει την προσβασιμότητα endpoint HTTP/HTTPS.",
    pingModeHelperDatabase:
      "Εκτελεί ελέγχους πρωτοκόλλου πριν από τον έλεγχο ταυτότητας και προαιρετικούς ελέγχους με ταυτότητα.",
    pingModeDatabase: "Βάση δεδομένων",
    pingDatabaseType: "Τύπος βάσης δεδομένων",
    pingTargetHost: "Διακομιστής-στόχος / IP",
    pingPort: "Θύρα",
    pingTimeout: "Χρονικό όριο (ms)",
    pingUseAuth: "Έλεγχος με ταυτότητα",
    pingUsername: "Όνομα χρήστη",
    pingPassword: "Κωδικός πρόσβασης",
    pingDatabaseOptional: "Βάση δεδομένων (προαιρετική)",
    pingRunButton: "Εκτέλεση δοκιμής ping",
    pingRunning: "Ο έλεγχος εκτελείται…",
    pingNetworkError: "Σφάλμα δικτύου κατά την επικοινωνία με το /api/ping.",
    pingModeLabel: "Λειτουργία",
    pingLatencyLabel: "Καθυστέρηση",
    pingTargetLabel: "Στόχος",
    pingDetailsLabel: "Λεπτομέρειες",
    pingEmptyTitle: "Δεν έχει εκτελεστεί ακόμη δοκιμή",
    pingEmptyDescription:
      "Επιλέξτε λειτουργία δοκιμής, εισαγάγετε διακομιστή και θύρα και εκτελέστε τον έλεγχο για να μετρήσετε προσβασιμότητα και καθυστέρηση.",
    pingStatusSuccess: "Ο στόχος είναι προσβάσιμος",
    pingStatusFailed: "Ο έλεγχος απέτυχε",
    pingShowDetails: "Εμφάνιση τεχνικών λεπτομερειών",
    pingHideDetails: "Απόκρυψη τεχνικών λεπτομερειών",
    pingResultTcpOk: "Η σύνδεση TCP δημιουργήθηκε.",
    pingResultTcpTimeout: "Χρονικό όριο TCP μετά από {timeoutMs} ms.",
    pingResultTcpFailed: "Η σύνδεση TCP απέτυχε: {error}",
    pingResultUdpSent:
      "Στάλθηκε πακέτο UDP. Δεν παρατηρήθηκε σφάλμα ICMP εντός {timeoutMs} ms.",
    pingResultUdpResponse: "Λήφθηκε απόκριση UDP από {from} ({bytes} byte).",
    pingResultUdpFailed: "Η δοκιμή UDP απέτυχε: {error}",
    pingResultEbHttpOk:
      "Το endpoint είναι προσβάσιμο μέσω {scheme} (κατάσταση {status}).",
    pingResultEbNoHttp:
      "Η TCP θύρα είναι ανοιχτή, αλλά δεν εντοπίστηκε απόκριση HTTP(S) σε αυτό το endpoint.",
    pingResultEbTcpFailed: "Ο έλεγχος EB απέτυχε στο στάδιο TCP: {error}",
    pingResultDbConnectFailed:
      "Η σύνδεση με τη βάση δεδομένων {database} απέτυχε: {error}",
    pingResultDbProtocolOk:
      "Ο διακομιστής {database} απάντησε σε δοκιμή handshake πριν από τον έλεγχο ταυτότητας.",
    pingResultDbProtocolFailed:
      "Η δοκιμή της βάσης {database} απέτυχε: {error}",
    pingResultDbTcpOk:
      "Η TCP θύρα της βάσης {database} είναι προσβάσιμη. Δεν υπάρχει δοκιμή πρωτοκόλλου πριν από τον έλεγχο ταυτότητας για αυτόν τον τύπο.",
    pingResultDbAuthUnsupported:
      "Οι έλεγχοι με ταυτότητα υλοποιούνται μόνο για το Redis. Χρησιμοποιήστε τον έλεγχο πρωτοκόλλου για {database}.",
    pingResultDbAuthOk:
      "Η σύνδεση Redis με ταυτότητα ολοκληρώθηκε με επιτυχία.",
    pingResultDbAuthFailed: "Ο έλεγχος ταυτότητας Redis απέτυχε: {error}",
    cdnAnalyzeButton: "Έλεγχος CDN",
    cdnAnalyzing: "Ανάλυση…",
    cdnNetworkError: "Σφάλμα δικτύου κατά την επικοινωνία με τον έλεγχο CDN.",
    cdnSummaryUnreachable: "Ο στόχος δεν είναι προσβάσιμος",
    cdnSummaryNoMatch: "Δεν υπάρχει αξιόπιστη αντιστοίχιση CDN",
    cdnSummaryDetected: "Εντοπίστηκε CDN",
    cdnConfidenceNa: "δεν ισχύει",
    cdnNoProviderMatch:
      "Κανένας πάροχος δεν αντιστοιχίστηκε — επιλυμένες διευθύνσεις IP",
    cdnInspectIpsHint:
      "Μπορείτε να εξετάσετε αυτές τις διευθύνσεις IP στη σελίδα αναζήτησης IP:",
    cdnTargetLabel: "Στόχος",
    cdnHttpStatusLabel: "Κατάσταση HTTP",
    cdnProviderLabel: "Πάροχος",
    cdnUnknown: "Άγνωστο",
    cdnMatchedSignals: "Σήματα που αντιστοιχίστηκαν",
    cdnNoSignals: "Δεν βρέθηκε κανένα ρητό σήμα CDN.",
    cdnCnameChain: "Αλυσίδα CNAME",
    cdnNoCname: "Δεν ανακαλύφθηκαν εγγραφές CNAME.",
    cdnInterestingHeaders: "Ενδιαφέρουσες κεφαλίδες απόκρισης",
    cdnNoHeaders: "Δεν βρέθηκαν σχετικές κεφαλίδες.",
    reputationTitle: "Έλεγχος φήμης IP",
    reputationSubtitle:
      "Συγκρίνετε μια δημόσια διεύθυνση IP με ανεξάρτητες πηγές φήμης και πληροφοριών απειλών και λάβετε μια εκτίμηση κινδύνου βασισμένη σε αποδεικτικά στοιχεία.",
    reputationPlaceholder: "8.8.8.8 ή 2001:4860:4860::8888",
    reputationCheckButton: "Έλεγχος φήμης",
    reputationChecking: "Έλεγχος…",
    reputationNetworkError:
      "Σφάλμα δικτύου κατά την επικοινωνία με τον έλεγχο φήμης.",
    reputationRateLimitError:
      "Πάρα πολλοί έλεγχοι φήμης. Περιμένετε λίγο πριν δοκιμάσετε ξανά.",
    reputationInvalidIp:
      "Εισαγάγετε έγκυρη δημόσια διεύθυνση IP (IPv4 ή IPv6).",
    reputationBlockedIp:
      "Δεν είναι δυνατός ο έλεγχος ιδιωτικών, δεσμευμένων και εσωτερικών εύρων IP.",
    reputationEmptyTitle: "Εισαγάγετε διεύθυνση IP για να ελέγξετε τη φήμη της",
    reputationEmptyDescription:
      "Η διεύθυνση IP ελέγχεται έναντι λίστας DNS αποκλεισμού, βάσεων αναφορών κατάχρησης, παρακολουθητών C2 botnet και πηγών ταξινόμησης δικτύου. Οι προαιρετικοί πάροχοι (AbuseIPDB, GreyNoise, http:BL, ThreatFox) ενεργοποιούνται όταν έχει διαμορφωθεί δωρεάν κλειδί API.",
    reputationRiskLow: "Χαμηλός κίνδυνος",
    reputationRiskMedium: "Μεσαίος κίνδυνος",
    reputationRiskHigh: "Υψηλός κίνδυνος",
    reputationHeadlineClean: "Δεν εντοπίστηκε κακόβουλη δραστηριότητα",
    reputationScoreLabel: "Βαθμός κινδύνου",
    reputationSectionSummary: "Σύνοψη φήμης",
    reputationSectionThreats: "Αποδεικτικά απειλών",
    reputationSectionMail: "Φήμη email",
    reputationSectionNetwork: "Ταξινόμηση δικτύου",
    reputationSectionSources: "Πηγές",
    reputationSectionScore: "Πώς υπολογίστηκε αυτός ο βαθμός",
    reputationCoverageChecked: "{count} πηγές ελέγχθηκαν",
    reputationCoverageMatched: "{count} με αποδεικτικά απειλών",
    reputationCoveragePolicy:
      "{count} με πληροφορίες πολιτικής ή περιβάλλοντος",
    reputationCoverageUnavailable: "{count} μη διαθέσιμες",
    reputationGeneratedAt: "Δημιουργήθηκε {time}",
    reputationNoThreatEvidence:
      "Δεν βρέθηκαν άμεσες παρατηρήσεις κακόβουλης δραστηριότητας στις πηγές που ήταν δυνατό να ελεγχθούν.",
    reputationNoMailEvidence:
      "Δεν βρέθηκαν λίστες φήμης email στις ελεγχθείσες πηγές.",
    reputationFilterAll: "Όλες",
    reputationNoEvidence:
      "Δεν υπάρχουν αποδεικτικά στοιχεία σε αυτή την ομάδα από τις πηγές που ήταν δυνατό να ελεγχθούν.",
    reputationFactChecked: "Ελεγμένο",
    reputationFactMatched: "Με αποδεικτικά απειλών",
    reputationFactUnavailable: "Μη διαθέσιμο",
    reputationFactCheckedAt: "Ελέγχθηκε",
    reputationScoreCapped: "Περιορίστηκε από {count} αρχικούς βαθμούς",
    reputationConnectionLabel: "Σύνδεση",
    reputationReverseLabel: "Αντίστροφο DNS",
    reputationFieldSource: "Πηγή",
    reputationFieldConfidence: "Εμπιστοσύνη",
    reputationFieldFirstSeen: "Πρώτη παρατήρηση",
    reputationFieldLastSeen: "Τελευταία παρατήρηση",
    reputationFieldReports: "Αναφορές",
    reputationFieldAttacks: "Συμβάντα επιθέσεων",
    reputationFieldMalware: "Κακόβουλο λογισμικό",
    reputationFieldDetail: "Λεπτομέρεια",
    reputationFieldReturnCode: "Κωδικός επιστροφής",
    reputationPointsLabel: "+{points} βαθμοί",
    reputationCategories: {
      mail_policy: "Καταχώριση πολιτικής email",
      mail_reputation: "Καταχώριση φήμης email",
      spam_observed: "Παρατηρήθηκε δραστηριότητα spam",
      abuse_reported: "Αναφέρθηκε κατάχρηση",
      scanner: "Σαρωτής ολόκληρου του Internet",
      bruteforce: "Επιθέσεις brute force",
      web_attack: "Επιθέσεις στον Web",
      ddos: "Επιθέσεις DDoS / πλημμύρισης",
      botnet: "Δραστηριότητα botnet",
      malware: "Υποδομή κακόβουλου λογισμικού",
      proxy: "Ανοιχτός διαμεσολαβητής",
      vpn: "VPN / ανωνυμοποιητής",
      tor: "Κόμβος εξόδου Tor",
      hosting: "Hosting / κέντρο δεδομένων",
      residential: "Οικιακό δίκτυο",
      mobile: "Δίκτυο κινητής τηλεφωνίας",
      benign_service: "Γνωστή εμπορική υπηρεσία",
    },
    reputationSeverities: {
      info: "Πληροφορία",
      low: "Χαμηλή σοβαρότητα",
      medium: "Μεσαία σοβαρότητα",
      high: "Υψηλή σοβαρότητα",
      critical: "Κρίσιμη",
    },
    reputationSourceStates: {
      available: "διαθέσιμη",
      clean: "καθαρή",
      matched: "αντιστοιχία",
      policy_listed: "στη λίστα (πολιτική)",
      not_configured: "μη διαμορφωμένη",
      unsupported: "μη υποστηριζόμενη",
      rate_limited: "περιορισμένη από τον ρυθμό",
      resolver_blocked: "αποκλεισμένη από resolver",
      unavailable: "μη διαθέσιμη",
    },
    reputationReasons: {
      sbl: "Στη λίστα Spamhaus SBL: επαληθευμένες πηγές spam, υπηρεσίες spam ή spammers ROKSO (λίστα βασισμένη σε αποδεικτικά στοιχεία και με ανθρώπινη συντήρηση).",
      css: "Στη λίστα Spamhaus CSS: αυτόματος εντοπισμός αποστολής email μεγάλου όγκου ή στη γκρίζα ζώνη. Ασθενέστερα αποδεικτικά στοιχεία από τη SBL.",
      xbl: "Στη λίστα Spamhaus XBL: παρατηρήθηκε ότι ο κόμβος εκτελεί trojan ή exploit λογισμικό ή λειτουργεί ως ανοιχτός proxy — συνήθως ένας παραβιασμένος υπολογιστής.",
      drop: "Η διεύθυνση βρίσκεται σε μπλοκ IP του Spamhaus DROP: εύρη που ελέγχουν εγκληματικές ή bulletproof-hosting δραστηριότητες και χρησιμοποιούνται για κακόβουλο λογισμικό, χειριστές botnet ή spam.",
      pbl_isp:
        "Στη λίστα Spamhaus PBL (που συντηρεί ο ISP): αυτό το εύρος δεν αναμένεται να παραδίδει απευθείας SMTP email σε διακομιστές email τρίτων. Αυτό είναι συνηθισμένο για τις περισσότερες οικιακές, δυναμικές διευθύνσεις τελικών χρηστών και δεν αποτελεί αποδεικτικό στοιχείο κατάχρησης.",
      pbl_spamhaus:
        "Στη λίστα Spamhaus PBL (που συντηρεί το Spamhaus): ένα εύρος πολιτικής που δεν πρέπει να παραδίδει απευθείας email. Είναι συνηθισμένο για πολλές διευθύνσεις τελικών χρηστών και δεν αποτελεί αποδεικτικό στοιχείο κατάχρησης.",
      bcl: "Στη λίστα Spamhaus Botnet Controller List: επιβεβαιωμένη ενεργή υποδομή εντολών και ελέγχου botnet.",
      spamcop_listing:
        "Στη λίστα SpamCop βάσει πρόσφατων αναφορών spam (spamtraps και στοιχεία από χρήστες). Οι καταχωρίσεις λήγουν σύντομα μετά την τελευταία αναφορά.",
      barracuda_listing:
        "Κακή φήμη email που μετρήθηκε στο δίκτυο φίλτρων Barracuda. Πρόκειται για συγκεντρωμένο, εν μέρει ιστορικό σήμα, που μπορεί να επηρεάσει και διευθύνσεις που εκχωρήθηκαν δυναμικά· δεν αποδεικνύει ότι η διεύθυνση στέλνει spam τώρα.",
      dronebl_irc_drone:
        "Παρατηρήθηκε από το δίκτυο DroneBL ως IRC spam drone (bot).",
      dronebl_bottler:
        "Παρατηρήθηκε από το δίκτυο DroneBL ως IRC bot τύπου Bottler.",
      dronebl_worm: "Το δίκτυο DroneBL παρατήρησε να εκτελεί σκώλη ή spam bot.",
      dronebl_ddos_drone:
        "Παρατηρήθηκε ως DDoS drone (συμμετέχει σε κατανεμημένες επιθέσεις).",
      dronebl_open_socks_proxy:
        "Παρατηρήθηκε να εκτελεί ανοιχτό SOCKS proxy — υποδομή που μπορεί να καταχραστεί, χωρίς να είναι απαραίτητα κακόβουλη από μόνη της.",
      dronebl_open_http_proxy:
        "Παρατηρήθηκε να εκτελεί ανοιχτό HTTP proxy — υποδομή που μπορεί να καταχραστεί, χωρίς να είναι απαραίτητα κακόβουλη από μόνη της.",
      dronebl_proxychain: "Παρατηρήθηκε ως μέρος αλυσίδας proxy.",
      dronebl_web_proxy: "Παρατηρήθηκε να εκτελεί ανοιχτό web proxy.",
      dronebl_dictionary:
        "Παρατηρήθηκε να εκτελεί αυτοματοποιημένες επιθέσεις λεξικού (brute force).",
      dronebl_wingate: "Παρατηρήθηκε να εκτελεί ανοιχτό WinGate proxy.",
      dronebl_compromised_router:
        "Παρατηρήθηκε ως παραβιασμένος δρομολογητής ή πύλη.",
      dronebl_botnet_auto:
        "Ταξινομήθηκε αυτόματα από το DroneBL ως υποδομή botnet (πειραματική ανίχνευση).",
      dronebl_compromised_host:
        "Πιθανώς παραβιασμένος κόμβος που εντοπίστηκε μέσω IRC.",
      dronebl_uncategorized:
        "Στη λίστα DroneBL με ακατηγορίοποιητη κατηγορία απειλής.",
      bld_attack:
        "Αναφορές επιθέσεων από παρόχους διακομιστών που επηρεάστηκαν, συλλεγμένες από το blocklist.de. Μια ενεργή καταχώριση DNS σημαίνει ότι καταγράφηκαν πρόσφατες επιθέσεις.",
      bld_counts_only:
        "Ιστορικές αναφορές κατάχρησης που καταγράφηκαν από το blocklist.de· η διεύθυνση δεν βρίσκεται αυτήν τη στιγμή στην ενεργή ζώνη DNS.",
      feodo_c2_online:
        "Ενεργός διακομιστής εντολών και ελέγχου botnet, επαληθευμένος από το Feodo Tracker (abuse.ch) μέσω έγκυρης απόκρισης C2.",
      feodo_c2_offline:
        "Διακομιστής C2 botnet που παρακολουθείται από το Feodo Tracker (abuse.ch); εμφανίστηκε τις τελευταίες ημέρες και παραμένει στη λίστα αποκλεισμού.",
      greynoise_scanner_malicious:
        "Παρατηρήθηκε να σαρώνει το Internet τις τελευταίες 90 ημέρες και ταξινομήθηκε ως κακόβουλο από το GreyNoise.",
      greynoise_scanner_unknown:
        "Παρατηρήθηκε να σαρώνει το Internet τις τελευταίες 90 ημέρες· το GreyNoise δεν μπόρεσε να ταξινομήσει τη δραστηριότητα.",
      greynoise_scanner_benign:
        "Παρατηρήθηκε να σαρώνει το Internet, αλλά ταξινομήθηκε ως αβλαβές από το GreyNoise, για παράδειγμα ένα ερευνητικό έργο.",
      greynoise_riot:
        "Γνωστή κοινή εμπορική υπηρεσία στο σύνολο δεδομένων GreyNoise RIOT, για παράδειγμα CDN ή εταιρεία ασφαλείας.",
      abuseipdb_reports:
        "Αναφορές κατάχρησης από χρήστες του AbuseIPDB τις τελευταίες 90 ημέρες. Η βαθμολογία εμπιστοσύνης αντανακλά τον αριθμό και τη συνέπεια των αναφορών.",
      abuseipdb_tor: "Αναγνωρίστηκε ως κόμβος εξόδου Tor από το AbuseIPDB.",
      threatfox_ioc:
        "Δημοσιεύτηκε ως ένδειξη απειλής (IOC) στη βάση δεδομένων abuse.ch ThreatFox, την οποία μοιράζονται ερευνητές ασφαλείας.",
      httpbl_search_engine:
        "Γνωστός αρπάκτης μηχανής αναζήτησης (Project Honey Pot).",
      httpbl_suspicious:
        "Υποπτος επισκέπτης ιστότοπου που παρατηρήθηκε στο δίκτυο honeypot του Project Honey Pot. Συχνά πρόκειται για αβλαβή ρομπότ, αλλά χρειάζεται προσοχή.",
      httpbl_harvester:
        "Παρατηρήθηκε να συλλέγει διευθύνσεις email από honeypot του δικτύου Project Honey Pot.",
      httpbl_comment_spammer:
        "Παρατηρήθηκε να δημοσιεύει spam σε σχόλια στα honeypot του δικτύου Project Honey Pot.",
      ipapi_vpn:
        "Σημειώθηκε από το ip-api.com ως υπηρεσία VPN, proxy ή ανωνυμοποίησης.",
      ipapi_hosting:
        "Σημειώθηκε από το ip-api.com ως διεύθυνση hosting ή κέντρου δεδομένων.",
      ipapi_mobile:
        "Αναγνωρίστηκε από το ip-api.com ως κινητή ή κυψελική σύνδεση.",
      residential_estimate:
        "Εκτιμώμενη οικιακή σύνδεση με βάση τον τύπο σύνδεσης και την ονομασία στο αντίστροφο DNS — πρόκειται για ευρετική εκτίμηση, όχι επιβεβαίωση παρόχου.",
      corroboration:
        "Πολλές ανεξάρτητες πηγές αναφέρουν κακόβουλη δραστηριότητα για αυτή τη διεύθυνση.",
      mail_corroboration:
        "Πολλές ανεξάρτητες λίστες φήμης email περιέχουν αυτή τη διεύθυνση.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Συνδυασμένο Spamhaus DNSBL: SBL (επαληθευμένες πηγές spam), CSS (αυτόματος εντοπισμός αποστολέων spam), XBL (εκμεταλλευμένοι κόμβοι), PBL (εύρη πολιτικής email) και BCL (χειριστές botnet).",
      "spamhaus-drop":
        "Δωρεάν ροή Spamhaus με ολόκληρα μπλοκ IP που ελέγχουν εγκληματικές ή bulletproof-hosting δραστηριότητες. Ελέγχεται τοπικά από αντίγραφο στην cache που ανανεώνεται κάθε ώρα.",
      spamcop:
        "Λίστα αποκλεισμού email που βασίζεται σε spamtraps και αναφορές spam χρηστών. Οι καταχωρίσεις είναι σύντομες και αποτυπώνουν πρόσφατη συμπεριφορά αποστολής.",
      barracuda:
        "Βαθμολογίες φήμης email που μετρώνται στο δίκτυο φίλτρων spam της Barracuda Networks. Συγκεντρωμένο και εν μέρει ιστορικό σήμα.",
      dronebl:
        "DNSBL που λειτουργεί το έργο DroneBL και περιλαμβάνει drones, παραβιασμένους κόμβους, συμμετέχοντες σε DDoS και ανοιχτούς proxy που παρατηρούνται από δίκτυα IRC και παρακολούθησης. Δωρεάν για εμπορική και μη εμπορική χρήση.",
      "blocklist-de":
        "Γερμανική πλατφόρμα αναφορών κατάχρησης που συλλέγει αναφορές επιθέσεων (SSH brute force, επιθέσεις email, σάρωση ιστότοπων) από παρόχους διακομιστών που επηρεάστηκαν.",
      "feodo-tracker":
        "Παρακολούθηση abuse.ch για διακομιστές C2 botnet (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Οι καταχωρίσεις απαιτούν παρατηρημένη έγκυρη απόκριση C2. Ελέγχεται τοπικά από αποθηκευμένη ροή.",
      greynoise:
        "Πληροφορίες για σαρωτές σε ολόκληρο το Internet. Το community API αναφέρει αν μια διεύθυνση παρατηρήθηκε πρόσφατα να σαρώνει και πώς ταξινομείται.",
      abuseipdb:
        "Βάση δεδομένων αναφορών κατάχρησης από την κοινότητα, με βαθμό εμπιστοσύνης. Απαιτεί δωρεάν κλειδί API (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL του Project Honey Pot για κακή χρήση ιστότοπων: συλλέκτες διευθύνσεων, spammers σχολίων και ύποπτα bots. Απαιτεί δωρεάν κλειδί πρόσβασης (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Πλατφόρμα abuse.ch για την κοινή χρήση ενδεικτικών παραβίασης, συμπεριλαμβανομένων διευθύνσεων C2 botnet. Απαιτεί δωρεάν Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Μεταδεδομένα IP: γεωγραφική θέση, δίκτυο ή ASN και σημαίδια ταξινόμησης σύνδεσης.",
    },
    reputationGeoLabel: "Γεωγραφική θέση",
    reputationNetworkLabel: "ASN / Πάροχος",
    reputationShowHiddenSources: "Εμφάνιση μη διαμορφωμένων πηγών ({count})",
    reputationHideHiddenSources: "Απόκρυψη μη διαμορφωμένων πηγών",
  },
  ro: {
    errorRateLimited: "Prea multe cereri. Așteaptă puțin și încearcă din nou.",
    errorInvalidTarget:
      "Introduceți un domeniu public, o adresă IP sau o adresă URL validă.",
    errorTargetBlocked:
      "Țintele private, locale și interne nu pot fi verificate pe acest site public.",
    errorTimeout:
      "Verificarea a expirat. Ținta poate fi lentă sau inaccesibilă.",
    errorUpstream: "Un furnizor de date din amonte este momentan indisponibil.",
    errorBadRequest: "Parametrii cererii nu sunt valizi.",
    errorTargetNetwork: "Ținta nu a putut fi rezolvată sau contactată.",
    showAll: "Afișează tot",
    showLess: "Afișează mai puțin",
    navOverview: "Prezentare generală",
    navDiagnostics: "Diagnosticare",
    navMyIp: "IP-ul meu",
    brandTagline: "Instrumente pentru rețea și IP",
    themeToggle: "Schimbă tema",
    themeLight: "Luminoasă",
    themeDark: "Întunecată",
    themeSystem: "Sistem",
    navMenu: "Meniu",
    skipToContent: "Sari la conținut",
    navToolsLabel: "Instrumente",
    sidebarLabel: "Navigarea site-ului",
    navClose: "Închide meniul",
    copyValue: "Copiază",
    downloadJson: "Descarcă JSON",
    cancelLookup: "Anulează",
    whoisNoteIana:
      "Nu a fost găsit niciun server de trimitere. Se afișează răspunsul WHOIS al IANA.",
    whoisNoteRdap:
      "WHOIS nu a fost disponibil. În schimb, se afișează datele de înregistrare RDAP.",
    commandTriggerLabel: "Caută…",
    commandPlaceholder:
      "Caută instrumente sau introdu o adresă IP, un domeniu sau un ASN…",
    commandGroupActions: "Acțiuni",
    commandGroupPages: "Mergi la",
    commandEmpty: "Nu s-au găsit instrumente sau acțiuni corespunzătoare.",
    commandHintNavigate: "Navighează",
    commandHintSelect: "Deschide",
    commandHintClose: "Închide",
    notFoundTitle: "Pagina nu a fost găsită",
    notFoundDescription:
      "Această adresă nu aparține niciunui instrument. Revino la pagina de început sau folosește căutarea (Ctrl+K).",
    notFoundBackHome: "Înapoi la pagina de început",
    errorTitle: "Ceva nu a mers bine",
    errorDescription:
      "Pagina nu a putut fi încărcată. Încearcă din nou — dacă problema continuă, cauza este de partea noastră.",
    errorRetry: "Încearcă din nou",
    asnRpkiValid: "RPKI valid",
    asnRpkiInvalid: "RPKI invalid",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Ridicată",
    cdnConfidenceMedium: "Medie",
    cdnConfidenceLow: "Scăzută",
    pingTabLabel: "Test ping",
    dnsTabLabel: "Căutare DNS",
    whoisTabLabel: "Căutare WHOIS",
    cdnTabLabel: "Verificare CDN",
    asnTabLabel: "Căutare ASN",
    reputationTabLabel: "Reputație IP",
    pingTitle: "Test ping și porturi",
    pingSubtitle:
      "Verificări ghidate pentru porturi TCP/UDP, endpointuri EB și conectivitatea bazelor de date, într-un flux de test clar.",
    dnsTitle: "Căutare DNS",
    dnsSubtitle:
      "Interoghează înregistrările DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) pentru domenii și DNS invers pentru adrese IP.",
    whoisTitle: "Căutare WHOIS",
    whoisSubtitle:
      "Interoghează înregistrările WHOIS pentru domenii și adrese IP direct din aplicație.",
    cdnTitle: "Verificarea utilizării CDN",
    cdnSubtitle:
      "Analizează orice domeniu pentru utilizarea CDN și furnizorul probabil, inclusiv CloudFront, Google Cloud CDN, Azure CDN, Vercel și altele.",
    asnTitle: "Informații ASN",
    asnSubtitle:
      "Caută sisteme autonome cu detalii ASN de la IPinfo și date publice de interconectare din PeeringDB.",
    asnPlaceholder: "AS8881 sau 8881",
    asnLookupButton: "Caută ASN",
    asnLookingUp: "Se caută…",
    asnInvalidInput:
      "Folosește un ASN cu prefixul AS sau o valoare numerică, de exemplu AS8881 sau 8881.",
    asnInvalidRange: "ASN-ul trebuie să fie între 1 și {max}.",
    asnNetworkError: "Eroare de rețea la contactarea căutării ASN.",
    asnUpstreamError: "Furnizorii de date ASN sunt momentan indisponibili.",
    asnRateLimitError:
      "Prea multe căutări ASN. Așteaptă puțin înainte de a încerca din nou.",
    asnEmptyTitle: "Introdu un ASN pentru a inspecta un profil de rețea",
    asnEmptyDescription:
      "Folosește o valoare cu prefixul AS sau una numerică. Datele furnizorilor pot fi parțiale în funcție de înregistrările publice și planul IPinfo configurat.",
    dnsEmptyTitle: "Introdu un domeniu pentru a-i rezolva înregistrările DNS",
    dnsEmptyDescription:
      "Caută înregistrări A, AAAA, MX, TXT, NS, SOA, SRV și CAA sau rulează o căutare inversă pe o adresă IP.",
    whoisEmptyTitle:
      "Introdu un domeniu sau o adresă IP pentru a interoga WHOIS",
    whoisEmptyDescription:
      "Obține registratorul, datele de înregistrare, starea și serverele de nume de la serverul WHOIS responsabil.",
    cdnEmptyTitle: "Introdu un domeniu pentru a identifica CDN-ul său",
    cdnEmptyDescription:
      "Inspectează DNS, lanțurile CNAME și antetele răspunsului pentru a identifica furnizorul CDN sau edge aflat în fața site-ului.",
    asnNotFoundTitle: "Nu a fost găsit niciun profil ASN",
    asnNotFoundDescription:
      "ASN-ul este valid, dar nicio sursă configurată nu a returnat un profil public utilizabil.",
    asnPartialData: "Date parțiale",
    asnCompleteData: "Complete",
    asnPrefixes: "Prefixe anunțate",
    asnRouting: "Relații de rutare",
    asnPeeringDb: "Profil PeeringDB",
    asnIxPresence: "Prezență în IX",
    asnFacilities: "Prezență în locații",
    asnSourceDiagnostics: "Diagnosticarea surselor",
    asnDetailedDiagnostics: "Diagnosticare detaliată",
    asnUnnamed: "AS fără nume",
    asnRoutingDescription:
      "Interconectările, vecinii și ponderile traseelor sistemului autonom. Ponderile mai mari indică trasee de rutare observate mai frecvent.",
    asnIxDescription:
      "Punctele de schimb Internet (IX) în care este prezent acest sistem autonom, inclusiv lățimea de bandă pentru interconectare.",
    asnPrefixesDescription:
      "Blocurile IP anunțate de acest sistem autonom în tabela globală de rutare.",
    asnPeeringDbDescription:
      "Profilul de interconectare și politicile de rutare declarate în baza de date publică PeeringDB.",
    asnFacilitiesDescription:
      "Centre de date fizice și locații de colocation în care este prezentă această rețea.",
    asnProfileIdentityHeading: "Identitate și stare",
    asnProfileInterconnectionHeading: "Detalii de interconectare",
    asnProfilePolicyHeading: "Politică de peering",
    asnProfileExternalHeading: "Profiluri externe",
    asnProfilePrefixes4: "Prefixe IPv4",
    asnProfilePrefixes6: "Prefixe IPv6",
    asnWarnings: "Avertismente",
    asnDiagnosticDuration: "Durată",
    asnDiagnosticCache: "Cache",
    asnDiagnosticWarnings: "Avertismente",
    asnDiagnosticSource: "Sursă",
    asnSourceDiagnosticsDescription:
      "Disponibilitatea furnizorilor, durata cererii și starea cache-ului pentru această căutare.",
    asnCacheMiss: "cache miss",
    asnCacheFresh: "proaspăt",
    asnCacheStale: "învechit",
    asnCacheNotConfigured: "neconfigurat",
    asnNoPrefixes: "Nicio sursă configurată nu a returnat prefixe.",
    asnNoRelations: "Nicio sursă configurată nu a returnat relații de rutare.",
    asnMetricIpv4Addresses: "Adrese IPv4",
    asnMetricRoutingNeighbours: "Vecini de rutare",
    asnMetricIxPresence: "Prezență în IX",
    asnMetricIpinfoDetail: "Date ASN de la IPinfo, dacă sunt configurate",
    asnMetricAnnouncedPrefixesDetail: "Prefixe anunțate",
    asnMetricBgpRelationshipsDetail: "Relații BGP de la IPinfo sau RIPEstat",
    asnMetricPeeringDbProfileDetail: "Profil de rețea PeeringDB",
    asnPrefixIpCount: "Adrese IP",
    asnRelationPeers: "Peers",
    asnRelationUpstreams: "Upstreams",
    asnRelationDownstreams: "Downstreams",
    asnRelationPower: "pondere",
    asnSourceAvailable: "disponibilă",
    asnSourceUnavailable: "indisponibilă",
    asnSourceNotConfigured: "neconfigurată",
    asnSourceError: "eroare",
    asnLabelName: "Nume",
    asnLabelCountry: "Țară",
    asnLabelAllocated: "Alocat",
    asnLabelNetworkId: "ID rețea",
    asnLabelAlsoKnownAs: "Cunoscut și ca",
    asnLabelWebsite: "Site web",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Trafic",
    asnLabelPolicyGeneral: "Politică generală",
    asnLabelPolicyLocations: "Locații specificate în politică",
    asnLabelPolicyRatio: "Raport specificat în politică",
    asnLabelPolicyContracts: "Contracte specificate în politică",
    asnLabelStatus: "Stare",
    asnLabelExchange: "Punct de schimb",
    asnLabelSpeed: "Viteză",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS peer",
    asnLabelFacility: "Locație",
    asnLabelCity: "Oraș",
    asnLabelLocalAsn: "ASN local",
    asnSortTable: "Tabel sortabil",
    asnSortBy: "Sortează după {column}",
    asnSortNotSorted: "nesortat",
    asnSortAscending: "crescător",
    asnSortDescending: "descrescător",
    asnBooleanYes: "da",
    asnBooleanNo: "nu",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Nu au fost returnate înregistrări IX LAN.",
    asnNoFacilityRecords: "Nu au fost returnate înregistrări de locații.",
    asnWarningIpinfoUnavailable:
      "Datele ASN de la IPinfo nu sunt disponibile pentru acest ASN sau acest plan de token.",
    asnWarningIpinfoUnexpected: "IPinfo a returnat date ASN neașteptate.",
    asnWarningNoRipeStatData:
      "Nu au fost găsite date ASN de la RIPEstat pentru acest ASN.",
    asnWarningNoPeeringDbProfile:
      "Nu a fost găsit niciun profil public de rețea în PeeringDB pentru acest ASN.",
    asnWarningProviderHttp: "{provider} a returnat HTTP {status}.",
    asnWarningProviderTimedOut: "Cererea către {provider} a expirat.",
    asnWarningProviderTooLarge:
      "Răspunsul {provider} a depășit limita de dimensiune.",
    asnWarningProviderInvalidJson: "{provider} a returnat JSON invalid.",
    asnWarningProviderUnavailable:
      "Datele {provider} sunt momentan indisponibile.",
    asnWarningProviderStale:
      "Datele {provider} sunt momentan indisponibile; se folosesc date vechi din cache.",
    asnWarningTruncated:
      "{label} au fost trunchiate la {limit} din {total} înregistrări.",
    asnWarningLabelIpinfoIpv4Prefixes: "Prefixe IPv4 IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Prefixe IPv6 IPinfo",
    asnWarningLabelIpinfoPeers: "Peers IPinfo",
    asnWarningLabelIpinfoUpstreams: "Upstreams IPinfo",
    asnWarningLabelIpinfoDownstreams: "Downstreams IPinfo",
    asnWarningLabelPeeringDbIxLan: "Înregistrări IX LAN PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Locații PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Prefixe IPv4 RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Prefixe IPv6 RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours: "Vecini de rutare RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Vecini din partea upstream RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Vecini din partea downstream RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "Se caută…",
    dnsLookupButton: "Caută DNS",
    dnsLookupError: "Căutarea DNS a eșuat.",
    dnsRecordsFor: "Înregistrări DNS pentru",
    resolvedAddresses: "Adrese rezolvate",
    noAddressResult: "Căutarea A/AAAA nu a returnat niciun rezultat.",
    recordDetails: "Detaliile înregistrării",
    dnsRecordNotes: "Note despre căutarea înregistrărilor",
    dnsTableType: "Tip",
    dnsTableValue: "Valoare",
    dnsShowRaw: "Afișează JSON brut",
    dnsHideRaw: "Ascunde JSON-ul brut",
    dnsNoRecords: "Nu au fost returnate înregistrări de tipul selectat.",
    whoisPlaceholder: "example.com sau 8.8.8.8",
    whoisLookupButton: "Caută WHOIS",
    whoisLookupError: "Căutarea WHOIS a eșuat.",
    whoisFor: "WHOIS pentru",
    queriedServer: "Server interogat",
    referralSource: "Sursă de trimitere",
    noWhoisData: "Nu au fost returnate date WHOIS.",
    whoisRegistrar: "Registrar",
    whoisCreated: "Creat",
    whoisUpdated: "Actualizat",
    whoisExpires: "Expiră",
    whoisStatusLabel: "Stare",
    whoisNameservers: "Servere de nume",
    whoisShowRaw: "Afișează rezultatul brut",
    whoisHideRaw: "Ascunde rezultatul brut",
    pingTestMode: "Mod de testare",
    pingModeHelperTcp: "Verifică dacă portul TCP acceptă o conexiune.",
    pingModeHelperUdp:
      "Trimite o sondă UDP și raportează imediat răspunsul sau eroarea.",
    pingModeHelperEb:
      "Verifică mai întâi TCP, apoi încearcă să ajungă la endpointul HTTP/HTTPS.",
    pingModeHelperDatabase:
      "Rulează verificări de protocol înainte de autentificare și verificări opționale cu autentificare.",
    pingModeDatabase: "Bază de date",
    pingDatabaseType: "Tipul bazei de date",
    pingTargetHost: "Gazdă / IP țintă",
    pingPort: "Port",
    pingTimeout: "Timeout (ms)",
    pingUseAuth: "Verifică cu autentificare",
    pingUsername: "Nume de utilizator",
    pingPassword: "Parolă",
    pingDatabaseOptional: "Bază de date (opțională)",
    pingRunButton: "Rulează testul ping",
    pingRunning: "Verificarea este în curs…",
    pingNetworkError: "Eroare de rețea la contactarea /api/ping.",
    pingModeLabel: "Mod",
    pingLatencyLabel: "Latență",
    pingTargetLabel: "Țintă",
    pingDetailsLabel: "Detalii",
    pingEmptyTitle: "Niciun test nu a fost rulat încă",
    pingEmptyDescription:
      "Alege un mod de testare, introdu o gazdă și un port, apoi rulează verificarea pentru a măsura accesibilitatea și latența.",
    pingStatusSuccess: "Ținta este accesibilă",
    pingStatusFailed: "Verificarea a eșuat",
    pingShowDetails: "Afișează detaliile tehnice",
    pingHideDetails: "Ascunde detaliile tehnice",
    pingResultTcpOk: "Conexiunea TCP a fost stabilită.",
    pingResultTcpTimeout: "Timeout TCP după {timeoutMs} ms.",
    pingResultTcpFailed: "Conexiunea TCP a eșuat: {error}",
    pingResultUdpSent:
      "Pachet UDP trimis. Nu a fost observată nicio eroare ICMP în {timeoutMs} ms.",
    pingResultUdpResponse: "Răspuns UDP primit de la {from} ({bytes} octeți).",
    pingResultUdpFailed: "Sonda UDP a eșuat: {error}",
    pingResultEbHttpOk:
      "Endpointul este accesibil prin {scheme} (stare {status}).",
    pingResultEbNoHttp:
      "TCP este deschis, dar nu a fost detectat niciun răspuns HTTP(S) pe acest endpoint.",
    pingResultEbTcpFailed: "Verificarea EB a eșuat în etapa TCP: {error}",
    pingResultDbConnectFailed:
      "Conectivitatea la baza de date {database} a eșuat: {error}",
    pingResultDbProtocolOk:
      "Serverul {database} a răspuns la o sondă de handshake înainte de autentificare.",
    pingResultDbProtocolFailed:
      "Sonda pentru baza de date {database} a eșuat: {error}",
    pingResultDbTcpOk:
      "Portul TCP al bazei de date {database} este accesibil. Pentru acest tip nu există o sondă de protocol înainte de autentificare.",
    pingResultDbAuthUnsupported:
      "Verificările cu autentificare sunt implementate numai pentru Redis. Folosește verificarea protocolului pentru {database}.",
    pingResultDbAuthOk: "Conexiunea autentificată la Redis a reușit.",
    pingResultDbAuthFailed: "Verificarea autentificării Redis a eșuat: {error}",
    cdnAnalyzeButton: "Verifică CDN",
    cdnAnalyzing: "Se analizează…",
    cdnNetworkError: "Eroare de rețea la contactarea verificării CDN.",
    cdnSummaryUnreachable: "Ținta nu este accesibilă",
    cdnSummaryNoMatch: "Nicio potrivire CDN de încredere",
    cdnSummaryDetected: "CDN detectat",
    cdnConfidenceNa: "nu se aplică",
    cdnNoProviderMatch:
      "Niciun furnizor nu se potrivește — adrese IP rezolvate",
    cdnInspectIpsHint:
      "Poți inspecta aceste adrese IP în pagina de căutare IP:",
    cdnTargetLabel: "Țintă",
    cdnHttpStatusLabel: "Stare HTTP",
    cdnProviderLabel: "Furnizor",
    cdnUnknown: "Necunoscut",
    cdnMatchedSignals: "Semnale potrivite",
    cdnNoSignals: "Nu a fost potrivit niciun semnal CDN explicit.",
    cdnCnameChain: "Lanț CNAME",
    cdnNoCname: "Nu au fost găsite înregistrări CNAME.",
    cdnInterestingHeaders: "Antete de răspuns interesante",
    cdnNoHeaders: "Nu au fost găsite antete relevante.",
    reputationTitle: "Verificarea reputației IP",
    reputationSubtitle:
      "Compară o adresă IP publică cu surse independente de reputație și informații despre amenințări și obține o evaluare a riscului bazată pe dovezi.",
    reputationPlaceholder: "8.8.8.8 sau 2001:4860:4860::8888",
    reputationCheckButton: "Verifică reputația",
    reputationChecking: "Se verifică…",
    reputationNetworkError:
      "Eroare de rețea la contactarea verificării reputației.",
    reputationRateLimitError:
      "Prea multe verificări de reputație. Așteaptă puțin înainte de a încerca din nou.",
    reputationInvalidIp: "Introdu o adresă IP publică validă (IPv4 sau IPv6).",
    reputationBlockedIp:
      "Intervalele IP private, rezervate și interne nu pot fi verificate.",
    reputationEmptyTitle: "Introdu o adresă IP pentru a-i verifica reputația",
    reputationEmptyDescription:
      "Adresa IP este comparată cu liste de blocare DNS, baze de date cu rapoarte de abuz, urmăritori C2 de botnet și surse de clasificare a rețelei. Furnizorii opționali (AbuseIPDB, GreyNoise, http:BL, ThreatFox) se activează când este configurată o cheie API gratuită.",
    reputationRiskLow: "Risc scăzut",
    reputationRiskMedium: "Risc mediu",
    reputationRiskHigh: "Risc ridicat",
    reputationHeadlineClean: "Nu a fost detectată activitate malițioasă",
    reputationScoreLabel: "Scor de risc",
    reputationSectionSummary: "Sumarul reputației",
    reputationSectionThreats: "Dovezi de amenințare",
    reputationSectionMail: "Reputația e-mailului",
    reputationSectionNetwork: "Clasificarea rețelei",
    reputationSectionSources: "Surse",
    reputationSectionScore: "Cum a fost calculat acest scor",
    reputationCoverageChecked: "{count} surse verificate",
    reputationCoverageMatched: "{count} cu dovezi de amenințare",
    reputationCoveragePolicy: "{count} cu informații de politică sau context",
    reputationCoverageUnavailable: "{count} indisponibile",
    reputationGeneratedAt: "Generat {time}",
    reputationNoThreatEvidence:
      "Nu au fost găsite observații malițioase directe în sursele care puteau fi verificate.",
    reputationNoMailEvidence:
      "Nu au fost găsite liste de reputație a e-mailului în sursele verificate.",
    reputationFilterAll: "Toate",
    reputationNoEvidence:
      "Nu există dovezi în acest grup din sursele care puteau fi verificate.",
    reputationFactChecked: "Verificat",
    reputationFactMatched: "Cu dovezi de amenințare",
    reputationFactUnavailable: "Indisponibil",
    reputationFactCheckedAt: "Verificat la",
    reputationScoreCapped: "Limitat de la {count} puncte brute",
    reputationConnectionLabel: "Conexiune",
    reputationReverseLabel: "DNS invers",
    reputationFieldSource: "Sursă",
    reputationFieldConfidence: "Încredere",
    reputationFieldFirstSeen: "Prima observare",
    reputationFieldLastSeen: "Ultima observare",
    reputationFieldReports: "Rapoarte",
    reputationFieldAttacks: "Evenimente de atac",
    reputationFieldMalware: "Software rău intenționat",
    reputationFieldDetail: "Detaliu",
    reputationFieldReturnCode: "Cod de returnare",
    reputationPointsLabel: "+{points} puncte",
    reputationCategories: {
      mail_policy: "Listă de politici pentru e-mail",
      mail_reputation: "Listă de reputație a e-mailului",
      spam_observed: "Activitate spam observată",
      abuse_reported: "Abuz raportat",
      scanner: "Scanner pentru întregul Internet",
      bruteforce: "Atacuri de forță brută",
      web_attack: "Atacuri web",
      ddos: "Atacuri DDoS / inundații",
      botnet: "Activitate de botnet",
      malware: "Infrastructură pentru software rău intenționat",
      proxy: "Proxy deschis",
      vpn: "VPN / anonimizator",
      tor: "Nod de ieșire Tor",
      hosting: "Hosting / centru de date",
      residential: "Rețea rezidențială",
      mobile: "Rețea mobilă",
      benign_service: "Serviciu comercial cunoscut",
    },
    reputationSeverities: {
      info: "Informație",
      low: "Severitate scăzută",
      medium: "Severitate medie",
      high: "Severitate ridicată",
      critical: "Critic",
    },
    reputationSourceStates: {
      available: "disponibilă",
      clean: "curată",
      matched: "potrivire",
      policy_listed: "listată (politică)",
      not_configured: "neconfigurată",
      unsupported: "neacceptată",
      rate_limited: "limitată de rată",
      resolver_blocked: "blocată de resolver",
      unavailable: "indisponibilă",
    },
    reputationReasons: {
      sbl: "Listată în Spamhaus SBL: surse de spam verificate, servicii de spam sau spammeri ROKSO (listă bazată pe dovezi și întreținută de oameni).",
      css: "Listată în Spamhaus CSS: detectarea automată a trimiterii de e-mail în volum mare sau din zona gri. Dovezi mai slabe decât SBL.",
      xbl: "Listată în Spamhaus XBL: gazda a fost observată cu software troian sau de exploatare ori ca proxy deschis — de obicei un computer compromis.",
      drop: "Adresa se află într-un bloc de rețea Spamhaus DROP: intervale controlate de operațiuni criminale sau de găzduire bulletproof, folosite pentru software rău intenționat, controlori de botnet sau spam.",
      pbl_isp:
        "Listată în Spamhaus PBL (întreținut de ISP): acest interval nu este așteptat să livreze direct e-mail SMTP către serverele de e-mail ale terților. Acest lucru este normal pentru majoritatea adreselor rezidențiale, dinamice și de utilizator final și nu reprezintă dovadă de abuz.",
      pbl_spamhaus:
        "Listată în Spamhaus PBL (întreținut de Spamhaus): interval de politică care nu ar trebui să livreze direct e-mail. Este normal pentru multe adrese de utilizator final și nu reprezintă dovadă de abuz.",
      bcl: "Listată în Spamhaus Botnet Controller List: infrastructură activă de comandă și control a botnetului, confirmată.",
      spamcop_listing:
        "Listată în SpamCop pe baza rapoartelor recente de spam (spamtraps și dovezi trimise de utilizatori). Listările expiră la scurt timp după ultimul raport.",
      barracuda_listing:
        "Reputație slabă a e-mailului, măsurată în rețeaua de filtre Barracuda. Este un semnal agregat, parțial istoric, care poate afecta și adrese realocate dinamic; nu dovedește că adresa trimite spam în acest moment.",
      dronebl_irc_drone:
        "Observată de rețeaua DroneBL ca spam drone IRC (bot).",
      dronebl_bottler: "Observată de rețeaua DroneBL ca bot IRC Bottler.",
      dronebl_worm:
        "Rețeaua DroneBL a observat executarea unui vierme sau a unui spam bot.",
      dronebl_ddos_drone:
        "Observată ca DDoS drone (participă la atacuri distribuite).",
      dronebl_open_socks_proxy:
        "Observată executând un proxy SOCKS deschis — infrastructură care poate fi abuzată, dar care nu este neapărat rău intenționată în sine.",
      dronebl_open_http_proxy:
        "Observată executând un proxy HTTP deschis — infrastructură care poate fi abuzată, dar care nu este neapărat rău intenționată în sine.",
      dronebl_proxychain: "Observată ca parte a unui lanț de proxy-uri.",
      dronebl_web_proxy: "Observată executând un proxy web deschis.",
      dronebl_dictionary:
        "Observată efectuând atacuri automate cu dicționar (forță brută).",
      dronebl_wingate: "Observată executând un proxy WinGate deschis.",
      dronebl_compromised_router: "Observată ca router sau gateway compromis.",
      dronebl_botnet_auto:
        "Clasificată automat de DroneBL drept infrastructură de botnet (detecție experimentală).",
      dronebl_compromised_host: "Gazdă posibil compromisă, detectată prin IRC.",
      dronebl_uncategorized:
        "Listată în DroneBL cu o clasă de amenințare necategorizată.",
      bld_attack:
        "Rapoarte de atac depuse de operatorii serverelor afectate și strânse de blocklist.de. O înregistrare DNS activă înseamnă că atacurile au fost raportate recent.",
      bld_counts_only:
        "Rapoarte istorice de abuz înregistrate de blocklist.de; adresa nu se află momentan în zona DNS activă.",
      feodo_c2_online:
        "Server activ de comandă și control al botnetului, verificat de Feodo Tracker (abuse.ch) printr-o răspuns C2 valid.",
      feodo_c2_offline:
        "Server C2 de botnet urmărit de Feodo Tracker (abuse.ch); văzut ultima dată în zilele trecute și păstrat în lista de blocare.",
      greynoise_scanner_malicious:
        "Observată scanând Internetul în ultimele 90 de zile și clasificată ca rău intenționată de GreyNoise.",
      greynoise_scanner_unknown:
        "Observată scanând Internetul în ultimele 90 de zile; GreyNoise nu a putut clasifica activitatea.",
      greynoise_scanner_benign:
        "Observată scanând Internetul, dar clasificată ca nevinovată de GreyNoise, de exemplu un proiect de cercetare.",
      greynoise_riot:
        "Serviciu comercial cunoscut și frecvent în setul de date GreyNoise RIOT, de exemplu un CDN sau o firmă de securitate.",
      abuseipdb_reports:
        "Rapoarte de abuz depuse de utilizatorii AbuseIPDB în ultimele 90 de zile. Scorul de încredere reflectă volumul și consecvența rapoartelor.",
      abuseipdb_tor: "Identificată ca nod de ieșire Tor de AbuseIPDB.",
      threatfox_ioc:
        "Publicată ca indicator de amenințare (IOC) în baza de date abuse.ch ThreatFox, partajată de cercetătorii în securitate.",
      httpbl_search_engine:
        "Crawler cunoscut al motorului de căutare (Project Honey Pot).",
      httpbl_suspicious:
        "Vizitator web suspect observat în rețeaua de honeypot-uri Project Honey Pot. Adesea sunt roboti inofensivi; procedați cu prudență.",
      httpbl_harvester:
        "Observată adunând adrese de e-mail din honeypot-urile rețelei Project Honey Pot.",
      httpbl_comment_spammer:
        "Observată publicând spam în comentarii pe honeypot-urile rețelei Project Honey Pot.",
      ipapi_vpn:
        "Marcată ca serviciu VPN, proxy sau anonimizator de ip-api.com.",
      ipapi_hosting:
        "Marcată ca adresă de hosting sau centru de date de ip-api.com.",
      ipapi_mobile:
        "Identificată ca conexiune mobilă sau celulară de ip-api.com.",
      residential_estimate:
        "Conexiune rezidențială estimată pe baza tipului de conexiune și denumirii din DNS invers — o euristică, nu o confirmare a furnizorului.",
      corroboration:
        "Mai multe surse independente raportează activitate malițioasă pentru această adresă.",
      mail_corroboration:
        "Mai multe liste independente de reputație a e-mailului conțin această adresă.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "DNSBL Spamhaus combinat: SBL (surse de spam verificate), CSS (detectarea automată a expeditorilor de spam), XBL (gazde exploatate), PBL (intervale de politică pentru e-mail) și BCL (controlori de botnet).",
      "spamhaus-drop":
        "Flux gratuit Spamhaus cu blocuri de rețea întregi controlate de operațiuni criminale sau de găzduire bulletproof. Verificat local dintr-o copie în cache, actualizată orar.",
      spamcop:
        "Listă de blocare a e-mailurilor construită din spamtraps și rapoarte de spam ale utilizatorilor. Listările au durată scurtă și reflectă comportamentul recent de trimitere.",
      barracuda:
        "Scoruri de reputație a e-mailului măsurate în rețeaua de filtre spam Barracuda Networks. Semnal agregat și parțial istoric.",
      dronebl:
        "DNSBL operat de proiectul DroneBL, care listează drone-uri, gazde compromise, participanți la DDoS și proxy-uri deschise observate de rețele IRC și de monitorizare. Gratuit pentru utilizare comercială și necomercială.",
      "blocklist-de":
        "Platformă germană de raportare a abuzurilor care colectează rapoarte de atac (atacuri SSH prin forță brută, atacuri prin e-mail, scanări web) de la operatorii de serveri afectați.",
      "feodo-tracker":
        "Monitorul abuse.ch pentru servere C2 de botnet (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Înregistrările necesită un răspuns C2 valid observat. Verificat local dintr-un flux în cache.",
      greynoise:
        "Informații despre scannerele din întregul Internet. API-ul comunitar indică dacă o adresă a fost observată recent scanând și cum este clasificată.",
      abuseipdb:
        "Bază de date cu rapoarte de abuz strânse de comunitate, cu scor de încredere. Necesită o cheie API gratuită (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL Project Honey Pot pentru abuz web: colectori de adrese, spammeri de comentarii și boti suspecti. Necesită o cheie de acces gratuită (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Platforma abuse.ch pentru partajarea indicatorilor de compromitere, inclusiv adresele C2 ale botneturilor. Necesită un Auth-Key gratuit (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Metadate IP: localizare geografică, rețea sau ASN și indicatori de clasificare a conexiunii.",
    },
    reputationGeoLabel: "Localizare geografică",
    reputationNetworkLabel: "ASN / furnizor",
    reputationShowHiddenSources: "Afișează sursele neconfigurate ({count})",
    reputationHideHiddenSources: "Ascunde sursele neconfigurate",
  },
  tr: {
    errorRateLimited:
      "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
    errorInvalidTarget:
      "Lütfen geçerli bir genel alan adı, IP adresi veya URL girin.",
    errorTargetBlocked:
      "Özel, yerel ve dahili hedefler bu genel sitede kontrol edilemez.",
    errorTimeout:
      "Kontrol zaman aşımına uğradı. Hedef yavaş veya erişilemez olabilir.",
    errorUpstream: "Bir üst veri sağlayıcısı şu anda kullanılamıyor.",
    errorBadRequest: "İstek parametreleri geçersiz.",
    errorTargetNetwork: "Hedef çözümlenemedi veya erişilemedi.",
    showAll: "Tümünü göster",
    showLess: "Daha az göster",
    navOverview: "Genel bakış",
    navDiagnostics: "Tanılama",
    navMyIp: "IP'm",
    brandTagline: "Ağ ve IP araçları",
    themeToggle: "Temayı değiştir",
    themeLight: "Açık",
    themeDark: "Koyu",
    themeSystem: "Sistem",
    navMenu: "Menü",
    skipToContent: "İçeriğe geç",
    navToolsLabel: "Araçlar",
    sidebarLabel: "Site gezinmesi",
    navClose: "Menüyü kapat",
    copyValue: "Kopyala",
    downloadJson: "JSON indir",
    cancelLookup: "İptal",
    whoisNoteIana:
      "Yönlendirme sunucusu bulunamadı. IANA WHOIS yanıtı gösteriliyor.",
    whoisNoteRdap:
      "WHOIS kullanılamadı. Bunun yerine RDAP kayıt verileri gösteriliyor.",
    commandTriggerLabel: "Ara…",
    commandPlaceholder:
      "Araçlarda arayın veya bir IP, alan adı ya da ASN girin…",
    commandGroupActions: "İşlemler",
    commandGroupPages: "Git",
    commandEmpty: "Eşleşen araç veya işlem bulunamadı.",
    commandHintNavigate: "Gezin",
    commandHintSelect: "Aç",
    commandHintClose: "Kapat",
    notFoundTitle: "Sayfa bulunamadı",
    notFoundDescription:
      "Bu adres hiçbir araca ait değil. Başlangıç sayfasına dönün veya aramayı kullanın (Ctrl+K).",
    notFoundBackHome: "Başlangıç sayfasına dön",
    errorTitle: "Bir şeyler ters gitti",
    errorDescription:
      "Bu sayfa yüklenemedi. Tekrar deneyin — hata devam ederse neden bizim tarafımızdadır.",
    errorRetry: "Tekrar dene",
    asnRpkiValid: "RPKI geçerli",
    asnRpkiInvalid: "RPKI geçersiz",
    asnRpkiStatus: "RPKI {status}",
    cdnConfidenceHigh: "Yüksek",
    cdnConfidenceMedium: "Orta",
    cdnConfidenceLow: "Düşük",
    pingTabLabel: "Ping test aracı",
    dnsTabLabel: "DNS sorgusu",
    whoisTabLabel: "WHOIS sorgusu",
    cdnTabLabel: "CDN denetleyici",
    asnTabLabel: "ASN sorgusu",
    reputationTabLabel: "IP itibarı",
    pingTitle: "Ping ve port test aracı",
    pingSubtitle:
      "TCP/UDP portları, EB uç noktaları ve veritabanı bağlantısı için daha açık bir test akışıyla yönlendirilmiş kontroller.",
    dnsTitle: "DNS sorgusu",
    dnsSubtitle:
      "Alan adları için DNS kayıtlarını (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) ve IP adresleri için ters DNS’i sorgulayın.",
    whoisTitle: "WHOIS sorgusu",
    whoisSubtitle:
      "Alan adları ve IP adresleri için WHOIS kayıtlarını doğrudan bu uygulamadan sorgulayın.",
    cdnTitle: "CDN kullanım denetleyicisi",
    cdnSubtitle:
      "Herhangi bir alan adının CDN kullanımını ve olası sağlayıcısını analiz edin (CloudFront, Google Cloud CDN, Azure CDN, Vercel ve daha fazlası dahil).",
    asnTitle: "ASN bilgileri",
    asnSubtitle:
      "Otonom sistemleri IPinfo ASN ayrıntıları ve PeeringDB’den herkese açık bağlantı verileriyle arayın.",
    asnPlaceholder: "AS8881 veya 8881",
    asnLookupButton: "ASN ara",
    asnLookingUp: "Aranıyor…",
    asnInvalidInput:
      "Örneğin AS8881 veya 8881 gibi AS ön ekli ya da sayısal bir ASN kullanın.",
    asnInvalidRange: "ASN 1 ile {max} arasında olmalıdır.",
    asnNetworkError: "ASN aramasına bağlanırken ağ hatası oluştu.",
    asnUpstreamError: "ASN veri sağlayıcıları şu anda kullanılamıyor.",
    asnRateLimitError:
      "Çok fazla ASN sorgusu yaptınız. Tekrar denemeden önce bekleyin.",
    asnEmptyTitle: "Bir ağ profilini incelemek için ASN girin",
    asnEmptyDescription:
      "AS ön ekli veya sayısal bir değer kullanın. Sağlayıcı verileri herkese açık kayıtlara ve yapılandırılmış IPinfo planına bağlı olarak kısmi olabilir.",
    dnsEmptyTitle: "DNS kayıtlarını çözümlemek için alan adı girin",
    dnsEmptyDescription:
      "A, AAAA, MX, TXT, NS, SOA, SRV ve CAA kayıtlarını sorgulayın veya bir IP adresinde ters sorgu çalıştırın.",
    whoisEmptyTitle: "WHOIS sorgusu için alan adı veya IP girin",
    whoisEmptyDescription:
      "Sorumlu WHOIS sunucusundan registrarı, kayıt tarihlerini, durumu ve ad sunucularını alın.",
    cdnEmptyTitle: "CDN’sini belirlemek için alan adı girin",
    cdnEmptyDescription:
      "Sitenin önündeki CDN veya edge sağlayıcısını belirlemek için DNS, CNAME zincirlerini ve yanıt başlıklarını inceleyin.",
    asnNotFoundTitle: "ASN profili bulunamadı",
    asnNotFoundDescription:
      "ASN geçerli, ancak yapılandırılmış kaynakların hiçbiri kullanılabilir bir herkese açık profil döndürmedi.",
    asnPartialData: "Kısmi veriler",
    asnCompleteData: "Tam",
    asnPrefixes: "Duyurulan prefixler",
    asnRouting: "Yönlendirme ilişkileri",
    asnPeeringDb: "PeeringDB profili",
    asnIxPresence: "IX varlığı",
    asnFacilities: "Tesislerde bulunma",
    asnSourceDiagnostics: "Kaynak tanılaması",
    asnDetailedDiagnostics: "Ayrıntılı tanılama",
    asnUnnamed: "Adsız AS",
    asnRoutingDescription:
      "Otonom sistemin bağlantıları, komşuları ve yol ağırlıkları. Daha yüksek ağırlıklar daha sık gözlenen yönlendirme yollarını gösterir.",
    asnIxDescription:
      "Bu otonom sistemin bulunduğu Internet değişim noktaları (IX) ve bağlantı bant genişliği.",
    asnPrefixesDescription:
      "Bu otonom sistemin küresel yönlendirme tablosuna duyurduğu IP ağ blokları.",
    asnPeeringDbDescription:
      "Herkese açık PeeringDB veritabanında bildirilen bağlantı profili ve yönlendirme politikaları.",
    asnFacilitiesDescription:
      "Bu ağın bulunduğu fiziksel veri merkezleri ve colocation tesisleri.",
    asnProfileIdentityHeading: "Kimlik ve durum",
    asnProfileInterconnectionHeading: "Bağlantı ayrıntıları",
    asnProfilePolicyHeading: "Peering politikası",
    asnProfileExternalHeading: "Harici profiller",
    asnProfilePrefixes4: "IPv4 prefixleri",
    asnProfilePrefixes6: "IPv6 prefixleri",
    asnWarnings: "Uyarılar",
    asnDiagnosticDuration: "Süre",
    asnDiagnosticCache: "Önbellek",
    asnDiagnosticWarnings: "Uyarılar",
    asnDiagnosticSource: "Kaynak",
    asnSourceDiagnosticsDescription:
      "Bu sorgu için sağlayıcıların kullanılabilirliği, istek süresi ve önbellek durumu.",
    asnCacheMiss: "önbellekte bulunamadı",
    asnCacheFresh: "taze",
    asnCacheStale: "eski",
    asnCacheNotConfigured: "yapılandırılmadı",
    asnNoPrefixes: "Yapılandırılmış kaynaklar prefix döndürmedi.",
    asnNoRelations:
      "Yapılandırılmış kaynaklar yönlendirme ilişkisi döndürmedi.",
    asnMetricIpv4Addresses: "IPv4 adresleri",
    asnMetricRoutingNeighbours: "Yönlendirme komşuları",
    asnMetricIxPresence: "IX varlığı",
    asnMetricIpinfoDetail: "Yapılandırıldığında IPinfo ASN verileri",
    asnMetricAnnouncedPrefixesDetail: "Duyurulan prefixler",
    asnMetricBgpRelationshipsDetail: "IPinfo veya RIPEstat BGP ilişkileri",
    asnMetricPeeringDbProfileDetail: "PeeringDB ağ profili",
    asnPrefixIpCount: "IP adresleri",
    asnRelationPeers: "Peers",
    asnRelationUpstreams: "Upstreams",
    asnRelationDownstreams: "Downstreams",
    asnRelationPower: "ağırlık",
    asnSourceAvailable: "kullanılabilir",
    asnSourceUnavailable: "kullanılamıyor",
    asnSourceNotConfigured: "yapılandırılmadı",
    asnSourceError: "hata",
    asnLabelName: "Ad",
    asnLabelCountry: "Ülke",
    asnLabelAllocated: "Tahsis edildi",
    asnLabelNetworkId: "Ağ kimliği",
    asnLabelAlsoKnownAs: "Şu adlarla da bilinir",
    asnLabelWebsite: "Web sitesi",
    asnLabelLookingGlass: "Looking glass",
    asnLabelRouteServer: "Route server",
    asnLabelTraffic: "Trafik",
    asnLabelPolicyGeneral: "Genel politika",
    asnLabelPolicyLocations: "Politika konumları",
    asnLabelPolicyRatio: "Politika oranı",
    asnLabelPolicyContracts: "Politika sözleşmeleri",
    asnLabelStatus: "Durum",
    asnLabelExchange: "Değişim noktası",
    asnLabelSpeed: "Hız",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS peer",
    asnLabelFacility: "Tesis",
    asnLabelCity: "Şehir",
    asnLabelLocalAsn: "Yerel ASN",
    asnSortTable: "Sıralanabilir tablo",
    asnSortBy: "{column} ölçütüne göre sırala",
    asnSortNotSorted: "sıralanmadı",
    asnSortAscending: "artan",
    asnSortDescending: "azalan",
    asnBooleanYes: "evet",
    asnBooleanNo: "hayır",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "IX LAN kayıtları döndürülmedi.",
    asnNoFacilityRecords: "Tesis kayıtları döndürülmedi.",
    asnWarningIpinfoUnavailable:
      "IPinfo ASN verileri bu ASN veya token planı için kullanılamıyor.",
    asnWarningIpinfoUnexpected: "IPinfo beklenmeyen ASN verisi döndürdü.",
    asnWarningNoRipeStatData: "Bu ASN için RIPEstat ASN verisi bulunamadı.",
    asnWarningNoPeeringDbProfile:
      "Bu ASN için herkese açık PeeringDB ağ profili bulunamadı.",
    asnWarningProviderHttp: "{provider} HTTP {status} döndürdü.",
    asnWarningProviderTimedOut: "{provider} isteği zaman aşımına uğradı.",
    asnWarningProviderTooLarge: "{provider} yanıtı boyut sınırını aştı.",
    asnWarningProviderInvalidJson: "{provider} geçersiz JSON döndürdü.",
    asnWarningProviderUnavailable:
      "{provider} verileri şu anda kullanılamıyor.",
    asnWarningProviderStale:
      "{provider} verileri şu anda kullanılamıyor; eski önbellek verileri kullanılıyor.",
    asnWarningTruncated:
      "{label} kayıtlarından {limit} tanesi gösterildi; toplam {total} kayıt vardı.",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfo IPv4 prefixleri",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfo IPv6 prefixleri",
    asnWarningLabelIpinfoPeers: "IPinfo peerleri",
    asnWarningLabelIpinfoUpstreams: "IPinfo upstream’leri",
    asnWarningLabelIpinfoDownstreams: "IPinfo downstream’leri",
    asnWarningLabelPeeringDbIxLan: "PeeringDB IX LAN kayıtları",
    asnWarningLabelPeeringDbFacilities: "PeeringDB tesisleri",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat IPv4 prefixleri",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat IPv6 prefixleri",
    asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat yönlendirme komşuları",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "RIPEstat upstream tarafındaki komşular",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "RIPEstat downstream tarafındaki komşular",
    targetPlaceholder: "example.com",
    lookupInProgress: "Aranıyor…",
    dnsLookupButton: "DNS ara",
    dnsLookupError: "DNS sorgusu başarısız oldu.",
    dnsRecordsFor: "DNS kayıtları:",
    resolvedAddresses: "Çözümlenen adresler",
    noAddressResult: "A/AAAA sorgusu sonucu bulunamadı.",
    recordDetails: "Kayıt ayrıntıları",
    dnsRecordNotes: "Kayıt sorgusu notları",
    dnsTableType: "Tür",
    dnsTableValue: "Değer",
    dnsShowRaw: "Ham JSON’u göster",
    dnsHideRaw: "Ham JSON’u gizle",
    dnsNoRecords: "Seçilen türde kayıt döndürülmedi.",
    whoisPlaceholder: "example.com veya 8.8.8.8",
    whoisLookupButton: "WHOIS ara",
    whoisLookupError: "WHOIS sorgusu başarısız oldu.",
    whoisFor: "WHOIS kaydı:",
    queriedServer: "Sorgulanan sunucu",
    referralSource: "Yönlendirme kaynağı",
    noWhoisData: "WHOIS verisi döndürülmedi.",
    whoisRegistrar: "Kayıt kuruluşu",
    whoisCreated: "Oluşturuldu",
    whoisUpdated: "Güncellendi",
    whoisExpires: "Sona erme",
    whoisStatusLabel: "Durum",
    whoisNameservers: "Ad sunucuları",
    whoisShowRaw: "Ham çıktıyı göster",
    whoisHideRaw: "Ham çıktıyı gizle",
    pingTestMode: "Test modu",
    pingModeHelperTcp:
      "TCP bağlantı noktasının bağlantı kabul edip etmediğini doğrular.",
    pingModeHelperUdp:
      "UDP probu gönderir ve anlık yanıt veya hata davranışını bildirir.",
    pingModeHelperEb:
      "Önce TCP’yi kontrol eder, ardından HTTP/HTTPS uç noktasının erişilebilirliğini dener.",
    pingModeHelperDatabase:
      "Kimlik doğrulama öncesi protokol kontrollerini ve isteğe bağlı kimlik doğrulamalı kontrolleri çalıştırır.",
    pingModeDatabase: "Veritabanı",
    pingDatabaseType: "Veritabanı türü",
    pingTargetHost: "Hedef sunucu / IP",
    pingPort: "Bağlantı noktası",
    pingTimeout: "Zaman aşımı (ms)",
    pingUseAuth: "Kimlik doğrulamasıyla kontrol et",
    pingUsername: "Kullanıcı adı",
    pingPassword: "Parola",
    pingDatabaseOptional: "Veritabanı (isteğe bağlı)",
    pingRunButton: "Ping testini çalıştır",
    pingRunning: "Kontrol çalışıyor…",
    pingNetworkError: "/api/ping adresine bağlanırken ağ hatası oluştu.",
    pingModeLabel: "Mod",
    pingLatencyLabel: "Gecikme",
    pingTargetLabel: "Hedef",
    pingDetailsLabel: "Ayrıntılar",
    pingEmptyTitle: "Henüz test çalıştırılmadı",
    pingEmptyDescription:
      "Erişilebilirliği ve gecikmeyi ölçmek için bir test modu seçin, sunucu ve bağlantı noktası girin ve kontrolü çalıştırın.",
    pingStatusSuccess: "Hedefe erişilebiliyor",
    pingStatusFailed: "Kontrol başarısız oldu",
    pingShowDetails: "Teknik ayrıntıları göster",
    pingHideDetails: "Teknik ayrıntıları gizle",
    pingResultTcpOk: "TCP bağlantısı kuruldu.",
    pingResultTcpTimeout: "{timeoutMs} ms sonra TCP zaman aşımına uğradı.",
    pingResultTcpFailed: "TCP bağlantısı başarısız oldu: {error}",
    pingResultUdpSent:
      "UDP paketi gönderildi. {timeoutMs} ms içinde ICMP hatası görülmedi.",
    pingResultUdpResponse:
      "{from} adresinden UDP yanıtı alındı ({bytes} bayt).",
    pingResultUdpFailed: "UDP probu başarısız oldu: {error}",
    pingResultEbHttpOk:
      "Uç nokta {scheme} üzerinden erişilebilir (durum {status}).",
    pingResultEbNoHttp:
      "TCP açık, ancak bu uç noktada HTTP(S) yanıtı algılanmadı.",
    pingResultEbTcpFailed: "EB kontrolü TCP aşamasında başarısız oldu: {error}",
    pingResultDbConnectFailed: "{database} bağlantısı başarısız oldu: {error}",
    pingResultDbProtocolOk:
      "{database} sunucusu, kimlik doğrulama öncesi handshake probuna yanıt verdi.",
    pingResultDbProtocolFailed: "{database} probu başarısız oldu: {error}",
    pingResultDbTcpOk:
      "{database} TCP bağlantı noktasına erişilebiliyor. Bu tür için kimlik doğrulama öncesi protokol probu yoktur.",
    pingResultDbAuthUnsupported:
      "Kimlik doğrulamalı kontroller yalnızca Redis için uygulanmıştır. {database} için protokol kontrolünü kullanın.",
    pingResultDbAuthOk: "Kimlik doğrulamalı Redis bağlantısı başarılı oldu.",
    pingResultDbAuthFailed:
      "Redis kimlik doğrulama kontrolü başarısız oldu: {error}",
    cdnAnalyzeButton: "CDN’yi kontrol et",
    cdnAnalyzing: "Analiz ediliyor…",
    cdnNetworkError: "CDN denetleyicisine bağlanırken ağ hatası oluştu.",
    cdnSummaryUnreachable: "Hedefe erişilemiyor",
    cdnSummaryNoMatch: "Güvenilir CDN eşleşmesi yok",
    cdnSummaryDetected: "CDN algılandı",
    cdnConfidenceNa: "uygulanamaz",
    cdnNoProviderMatch: "Eşleşen sağlayıcı yok — çözümlenen IP’ler",
    cdnInspectIpsHint: "Bu IP’leri IP sorgusu sayfasında inceleyebilirsiniz:",
    cdnTargetLabel: "Hedef",
    cdnHttpStatusLabel: "HTTP durumu",
    cdnProviderLabel: "Sağlayıcı",
    cdnUnknown: "Bilinmiyor",
    cdnMatchedSignals: "Eşleşen sinyaller",
    cdnNoSignals: "Açık bir CDN sinyali eşleşmedi.",
    cdnCnameChain: "CNAME zinciri",
    cdnNoCname: "CNAME kaydı bulunamadı.",
    cdnInterestingHeaders: "İlginç yanıt başlıkları",
    cdnNoHeaders: "İlgili başlık bulunamadı.",
    reputationTitle: "IP itibarı kontrolü",
    reputationSubtitle:
      "Herkese açık bir IP adresini bağımsız itibar ve tehdit istihbaratı kaynaklarıyla karşılaştırın ve kanıta dayalı bir risk değerlendirmesi alın.",
    reputationPlaceholder: "8.8.8.8 veya 2001:4860:4860::8888",
    reputationCheckButton: "İtibarı kontrol et",
    reputationChecking: "Kontrol ediliyor…",
    reputationNetworkError: "İtibar kontrolüne bağlanırken ağ hatası oluştu.",
    reputationRateLimitError:
      "Çok fazla itibar kontrolü yaptınız. Tekrar denemeden önce bekleyin.",
    reputationInvalidIp:
      "Lütfen geçerli bir genel IP adresi girin (IPv4 veya IPv6).",
    reputationBlockedIp:
      "Özel, ayrılmış ve dahili IP aralıkları kontrol edilemez.",
    reputationEmptyTitle: "İtibarını kontrol etmek için bir IP adresi girin",
    reputationEmptyDescription:
      "IP adresi; DNS engel listeleri, kötüye kullanım raporu veritabanları, botnet C2 izleyicileri ve ağ sınıflandırma kaynaklarıyla karşılaştırılır. İsteğe bağlı sağlayıcılar (AbuseIPDB, GreyNoise, http:BL, ThreatFox), ücretsiz bir API anahtarı yapılandırıldığında etkinleşir.",
    reputationRiskLow: "Düşük risk",
    reputationRiskMedium: "Orta risk",
    reputationRiskHigh: "Yüksek risk",
    reputationHeadlineClean: "Kötücül etkinlik algılanmadı",
    reputationScoreLabel: "Risk puanı",
    reputationSectionSummary: "İtibar özeti",
    reputationSectionThreats: "Tehdit kanıtları",
    reputationSectionMail: "E-posta itibarı",
    reputationSectionNetwork: "Ağ sınıflandırması",
    reputationSectionSources: "Kaynaklar",
    reputationSectionScore: "Bu puan nasıl hesaplandı",
    reputationCoverageChecked: "{count} kaynak kontrol edildi",
    reputationCoverageMatched: "{count} kaynakta tehdit kanıtı var",
    reputationCoveragePolicy:
      "{count} kaynakta politika veya bağlam bilgisi var",
    reputationCoverageUnavailable: "{count} kaynak kullanılamıyor",
    reputationGeneratedAt: "{time} tarihinde oluşturuldu",
    reputationNoThreatEvidence:
      "Kontrol edilebilen kaynaklarda doğrudan kötücül gözlem bulunamadı.",
    reputationNoMailEvidence:
      "Kontrol edilen kaynaklarda e-posta itibar listesi bulunamadı.",
    reputationFilterAll: "Tümü",
    reputationNoEvidence: "Kontrol edilebilen kaynaklarda bu grupta kanıt yok.",
    reputationFactChecked: "Kontrol edildi",
    reputationFactMatched: "Tehdit kanıtı var",
    reputationFactUnavailable: "Kullanılamıyor",
    reputationFactCheckedAt: "Kontrol zamanı",
    reputationScoreCapped: "{count} ham puanla sınırlama yapıldı",
    reputationConnectionLabel: "Bağlantı",
    reputationReverseLabel: "Ters DNS",
    reputationFieldSource: "Kaynak",
    reputationFieldConfidence: "Güven",
    reputationFieldFirstSeen: "İlk görülme",
    reputationFieldLastSeen: "Son görülme",
    reputationFieldReports: "Raporlar",
    reputationFieldAttacks: "Saldırı olayları",
    reputationFieldMalware: "Zararlı yazılım",
    reputationFieldDetail: "Ayrıntı",
    reputationFieldReturnCode: "Dönüş kodu",
    reputationPointsLabel: "+{points} puan",
    reputationCategories: {
      mail_policy: "E-posta politikası kaydı",
      mail_reputation: "E-posta itibarı kaydı",
      spam_observed: "Spam etkinliği gözlendi",
      abuse_reported: "Kötüye kullanım bildirildi",
      scanner: "İnternet geneli tarayıcı",
      bruteforce: "Kaba kuvvet saldırıları",
      web_attack: "Web saldırıları",
      ddos: "DDoS / taşkın saldırıları",
      botnet: "Botnet etkinliği",
      malware: "Zararlı yazılım altyapısı",
      proxy: "Açık proxy",
      vpn: "VPN / anonimleştirici",
      tor: "Tor çıkış düğümü",
      hosting: "Barındırma / veri merkezi",
      residential: "Ev ağı",
      mobile: "Mobil ağ",
      benign_service: "Bilinen iş hizmeti",
    },
    reputationSeverities: {
      info: "Bilgi",
      low: "Düşük önem",
      medium: "Orta önem",
      high: "Yüksek önem",
      critical: "Kritik",
    },
    reputationSourceStates: {
      available: "kullanılabilir",
      clean: "temiz",
      matched: "eşleşti",
      policy_listed: "listelendi (politika)",
      not_configured: "yapılandırılmadı",
      unsupported: "desteklenmiyor",
      rate_limited: "hız sınırlı",
      resolver_blocked: "çözümleyici tarafından engellendi",
      unavailable: "kullanılamıyor",
    },
    reputationReasons: {
      sbl: "Spamhaus SBL’de listeleniyor: doğrulanmış spam kaynakları, spam hizmetleri veya ROKSO spammer’ları (kanıta dayalı, insanlar tarafından sürdürülen liste).",
      css: "Spamhaus CSS’de listeleniyor: yüksek hacimli veya gri bölge e-posta gönderiminin otomatik algılanması. SBL’den daha zayıf kanıttır.",
      xbl: "Spamhaus XBL’de listeleniyor: makinede truva at veya açık istismar yazılımı ya da açık proxy çalıştığı gözlemlendi — genellikle ele geçirilmiş bir bilgisayardır.",
      drop: "Adres, Spamhaus DROP ağ bloğunda yer alıyor: suç örgütlerinin veya bulletproof-hosting operasyonlarının kontrolündeki, zararlı yazılım, botnet denetleyicileri veya spam için kullanılan aralıklar.",
      pbl_isp:
        "Spamhaus PBL’de listeleniyor (ISP tarafından sürdürülüyor): bu aralığın üçüncü taraf posta sunucularına doğrudan SMTP e-postası göndermesi beklenmez. Bu, çoğu ev, dinamik ve son kullanıcı adresi için normaldir ve kötüye kullanım kanıtı değildir.",
      pbl_spamhaus:
        "Spamhaus PBL’de listeleniyor (Spamhaus tarafından sürdürülüyor): doğrudan e-posta göndermemesi gereken bir politika aralığı. Birçok son kullanıcı adresi için normaldir ve kötüye kullanım kanıtı değildir.",
      bcl: "Spamhaus Botnet Controller List’te listeleniyor: doğrulanmış etkin botnet komuta ve kontrol altyapısı.",
      spamcop_listing:
        "Son spam raporlarına dayanarak SpamCop’ta listeleniyor (spam tuzakları ve kullanıcı kanıtları). Listelemeler son rapordan kısa süre sonra sona erer.",
      barracuda_listing:
        "Barracuda filtre ağında ölçülen zayıf e-posta itibarı. Bu, toplu ve kısmen geçmişe dönük bir sinyaldir; dinamik olarak yeniden atanmış adresleri de etkileyebilir ve adresin şu anda spam gönderdiğini kanıtlamaz.",
      dronebl_irc_drone:
        "DroneBL ağı tarafından IRC spam droneu (bot) olarak gözlemlendi.",
      dronebl_bottler:
        "DroneBL ağı tarafından Bottler IRC botu olarak gözlemlendi.",
      dronebl_worm:
        "DroneBL ağı tarafından bir solucan veya spam botu çalıştırırken gözlemlendi.",
      dronebl_ddos_drone:
        "DDoS droneu olarak gözlemlendi (dağıtık saldırılara katılıyor).",
      dronebl_open_socks_proxy:
        "Açık SOCKS proxy çalıştırırken gözlemlendi — kötüye kullanılabilir ancak kendiliğinden zararlı olmayan altyapı.",
      dronebl_open_http_proxy:
        "Açık HTTP proxy çalıştırırken gözlemlendi — kötüye kullanılabilir ancak kendiliğinden zararlı olmayan altyapı.",
      dronebl_proxychain: "Bir proxy zincirinin parçası olarak gözlemlendi.",
      dronebl_web_proxy: "Açık web proxy çalıştırırken gözlemlendi.",
      dronebl_dictionary:
        "Otomatik sözlük (kaba kuvvet) saldırıları gerçekleştirirken gözlemlendi.",
      dronebl_wingate: "Açık WinGate proxy çalıştırırken gözlemlendi.",
      dronebl_compromised_router:
        "Ele geçirilmiş yönlendirici veya ağ geçidi olarak gözlemlendi.",
      dronebl_botnet_auto:
        "DroneBL tarafından otomatik olarak botnet altyapısı olarak sınıflandırıldı (deneysel algılama).",
      dronebl_compromised_host:
        "IRC üzerinden algılanan muhtemelen ele geçirilmiş sunucu.",
      dronebl_uncategorized:
        "DroneBL’de sınıflandırılmamış tehdit sınıfıyla listeleniyor.",
      bld_attack:
        "Etkilenen sunucu operatörlerinin bildirdiği ve blocklist.de’nin topladığı saldırı raporları. Etkin bir DNS kaydı, saldırıların yakın zamanda bildirildiği anlamına gelir.",
      bld_counts_only:
        "blocklist.de’nin kaydettiği geçmiş kötüye kullanım raporları; adres şu anda etkin DNS bölgesinde değil.",
      feodo_c2_online:
        "Feodo Tracker (abuse.ch) tarafından geçerli bir C2 yanıtıyla doğrulanan etkin botnet komuta ve kontrol sunucusu.",
      feodo_c2_offline:
        "Feodo Tracker (abuse.ch) tarafından izlenen botnet C2 sunucusu; son günlerde görüldü ve engel listesinde tutuluyor.",
      greynoise_scanner_malicious:
        "Son 90 gün içinde Internet’i tararken gözlemlendi ve GreyNoise tarafından kötücül olarak sınıflandırıldı.",
      greynoise_scanner_unknown:
        "Son 90 gün içinde Internet’i tararken gözlemlendi; GreyNoise etkinliği sınıflandıramadı.",
      greynoise_scanner_benign:
        "Internet’i tararken gözlemlendi, ancak GreyNoise tarafından zararsız olarak sınıflandırıldı, örneğin bir araştırma projesi.",
      greynoise_riot:
        "GreyNoise RIOT veri setinde bilinen yaygın iş hizmeti, örneğin bir CDN veya güvenlik şirketi.",
      abuseipdb_reports:
        "Son 90 günde AbuseIPDB kullanıcılarının gönderdiği kötüye kullanım raporları. Güven puanı, raporların sayısını ve tutarlılığını yansıtır.",
      abuseipdb_tor: "AbuseIPDB tarafından Tor çıkış düğümü olarak tanımlandı.",
      threatfox_ioc:
        "Güvenlik araştırmacılarının paylaştığı abuse.ch ThreatFox veritabanında tehdit göstergesi (IOC) olarak yayımlandı.",
      httpbl_search_engine:
        "Bilinen arama motoru tarayıcısı (Project Honey Pot).",
      httpbl_suspicious:
        "Project Honey Pot honeypot ağında gözlemlenen şüpheli web ziyaretçisi. Çoğu zaman zararsız botlardır; dikkatli olun.",
      httpbl_harvester:
        "Project Honey Pot ağındaki honeypot’lardan e-posta adresleri toplarken gözlemlendi.",
      httpbl_comment_spammer:
        "Project Honey Pot ağındaki honeypot’lara yorum spamı gönderirken gözlemlendi.",
      ipapi_vpn:
        "ip-api.com tarafından VPN, proxy veya anonimleştirici hizmet olarak işaretlendi.",
      ipapi_hosting:
        "ip-api.com tarafından barındırma veya veri merkezi adresi olarak işaretlendi.",
      ipapi_mobile:
        "ip-api.com tarafından mobil veya hücresel bağlantı olarak tanımlandı.",
      residential_estimate:
        "Bağlantı türü ve ters DNS adlandırmasına dayanan tahmini ev bağlantısı — sağlayıcı onayı değil, sezgisel bir tahmindir.",
      corroboration:
        "Bu adres için birkaç bağımsız kaynak kötücül etkinlik bildiriyor.",
      mail_corroboration:
        "Bu adresi birkaç bağımsız e-posta itibar listesi içeriyor.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Birleşik Spamhaus DNSBL: SBL (doğrulanmış spam kaynakları), CSS (otomatik spam gönderici algılama), XBL (kötüye kullanılmış sunucular), PBL (e-posta politikası aralıkları) ve BCL (botnet denetleyicileri).",
      "spamhaus-drop":
        "Suç örgütlerinin veya bulletproof-hosting operasyonlarının kontrolündeki tüm ağ bloklarının ücretsiz Spamhaus akışı. Saatlik güncellenen önbellek kopyasından yerel olarak kontrol edilir.",
      spamcop:
        "Spam tuzaklarından ve kullanıcı spam raporlarından oluşturulan e-posta engel listesi. Listelemeler kısa ömürlüdür ve son gönderim davranışını yansıtır.",
      barracuda:
        "Barracuda Networks spam filtre ağında ölçülen e-posta itibar puanları. Toplu ve kısmen geçmişe dönük sinyal.",
      dronebl:
        "DroneBL projesi tarafından işletilen DNSBL; IRC ve izleme ağlarının gözlemlediği drone’ları, ele geçirilmiş sunucuları, DDoS katılımcılarını ve açık proxy’leri listeler. Ticari ve ticari olmayan kullanım için ücretsizdir.",
      "blocklist-de":
        "Etkilenen sunucu operatörlerinden SSH kaba kuvvet saldırıları, e-posta saldırıları ve web taramaları gibi saldırı raporları toplayan Alman kötüye kullanım bildirim platformu.",
      "feodo-tracker":
        "Botnet C2 sunucuları için abuse.ch izleyicisi (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Kayıtlar gözlemlenmiş geçerli bir C2 yanıtı gerektirir. Önbellekteki akıştan yerel olarak kontrol edilir.",
      greynoise:
        "Internet genelindeki tarayıcılar için istihbarat. Topluluk API’si, bir adresin yakın zamanda tarama yaparken görülüp görülmediğini ve nasıl sınıflandırıldığını bildirir.",
      abuseipdb:
        "Güven puanına sahip, topluluk katkılı kötüye kullanım raporu veritabanı. Ücretsiz bir API anahtarı gerektirir (ABUSEIPDB_API_KEY).",
      httpbl:
        "Web kötüye kullanımı için Project Honey Pot DNSBL: adres toplayıcılar, yorum spamcıları ve şüpheli botlar. Ücretsiz bir erişim anahtarı gerektirir (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Botnet C2 adresleri dahil olmak üzere ihlal göstergelerini paylaşmak için abuse.ch platformu. Ücretsiz bir Auth-Key gerektirir (THREATFOX_AUTH_KEY).",
      "ip-api":
        "IP meta verileri: coğrafi konum, ağ/ASN ve bağlantı sınıflandırma işaretleri.",
    },
    reputationGeoLabel: "Coğrafi konum",
    reputationNetworkLabel: "ASN / sağlayıcı",
    reputationShowHiddenSources:
      "Yapılandırılmamış kaynakları göster ({count})",
    reputationHideHiddenSources: "Yapılandırılmamış kaynakları gizle",
  },
};
