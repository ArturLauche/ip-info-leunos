import type { ToolTranslation } from "@/lib/tool-i18n";

export const toolsEastern: Record<
  "pl" | "pt-BR" | "pt-PT" | "ja" | "ko" | "ru",
  ToolTranslation
> = {
  pl: {
    errorRateLimited: "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie.",
    errorInvalidTarget: "Podaj prawidłową publiczną domenę, adres IP lub URL.",
    errorTargetBlocked:
      "Prywatnych, lokalnych i wewnętrznych celów nie można sprawdzać w tej publicznej witrynie.",
    errorTimeout: "Sprawdzenie upłynęło. Cel może być wolny lub nieosiągalny.",
    errorUpstream: "Dostawca danych źródłowych jest obecnie niedostępny.",
    errorBadRequest: "Parametry żądania są nieprawidłowe.",
    errorTargetNetwork: "Nie udało się rozwiązać ani połączyć się z celem.",
    showAll: "Pokaż wszystko",
    showLess: "Pokaż mniej",
    navOverview: "Przegląd",
    navDiagnostics: "Diagnostyka",
    navMyIp: "Moje IP",
    brandTagline: "Zestaw narzędzi sieciowych i IP",
    themeToggle: "Zmień motyw",
    themeLight: "Jasny",
    themeDark: "Ciemny",
    themeSystem: "Systemowy",
    navMenu: "Nawigacja",
    skipToContent: "Przejdź do treści",
    navToolsLabel: "Narzędzia",
    sidebarLabel: "Nawigacja witryny",
    navClose: "Zamknij menu",
    copyValue: "Kopiuj",
    downloadJson: "Pobierz JSON",
    cancelLookup: "Anuluj",
    whoisNoteIana:
      "Nie znaleziono serwera polecen. Wyświetlana jest odpowiedź WHOIS z IANA.",
    whoisNoteRdap:
      "WHOIS był niedostępny. Zamiast tego wyświetlane są dane rejestracyjne RDAP.",
    commandTriggerLabel: "Szukaj…",
    commandPlaceholder: "Szukaj narzędzi lub wprowadź IP, domenę albo ASN…",
    commandGroupActions: "Akcje",
    commandGroupPages: "Przejdź do",
    commandEmpty: "Brak pasujących narzędzi lub akcji.",
    commandHintNavigate: "Nawiguj",
    commandHintSelect: "Otwórz",
    commandHintClose: "Zamknij",
    notFoundTitle: "Nie znaleziono strony",
    notFoundDescription:
      "Ten adres nie należy do żadnego narzędzia. Wróć do strony głównej lub skorzystaj z wyszukiwania (Ctrl+K).",
    notFoundBackHome: "Wróć do strony głównej",
    errorTitle: "Coś poszło nie tak",
    errorDescription:
      "Tej strony nie udało się wczytać. Spróbuj ponownie — jeśli problem będzie się powtarzał, przyczyna leży po naszej stronie.",
    errorRetry: "Spróbuj ponownie",
    asnRpkiValid: "RPKI prawidłowy",
    asnRpkiInvalid: "RPKI nieprawidłowy",
    asnRpkiStatus: "RPKI: {status}",
    cdnConfidenceHigh: "Wysoka",
    cdnConfidenceMedium: "Średnia",
    cdnConfidenceLow: "Niska",
    pingTabLabel: "Tester ping",
    dnsTabLabel: "Wyszukiwanie DNS",
    whoisTabLabel: "Wyszukiwanie WHOIS",
    cdnTabLabel: "Weryfikator CDN",
    asnTabLabel: "Wyszukiwanie ASN",
    reputationTabLabel: "Reputacja IP",
    pingTitle: "Tester ping i portów",
    pingSubtitle:
      "Kierowane testy portów TCP/UDP, punktów końcowych EB i łączności z bazami danych w przejrzystym przepływie testów.",
    dnsTitle: "Wyszukiwanie DNS",
    dnsSubtitle:
      "Wyszukuj rekordy DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) dla domen oraz odwrotne DNS dla adresów IP.",
    whoisTitle: "Wyszukiwanie WHOIS",
    whoisSubtitle:
      "Wyszukuj rekordy WHOIS domen i adresów IP bezpośrednio w tej aplikacji.",
    cdnTitle: "Weryfikacja korzystania z CDN",
    cdnSubtitle:
      "Przeanalizuj dowolną domenę pod kątem korzystania z CDN i prawdopodobnego dostawcy, w tym CloudFront, Google Cloud CDN, Azure CDN, Vercel i innych.",
    asnTitle: "Informacje o ASN",
    asnSubtitle:
      "Wyszukuj systemy autonomiczne w danych ASN IPinfo oraz publicznych danych o połączeniach z PeeringDB.",
    asnPlaceholder: "AS8881 lub 8881",
    asnLookupButton: "Wyszukaj ASN",
    asnLookingUp: "Wyszukiwanie...",
    asnInvalidInput:
      "Użyj ASN z prefiksem AS lub liczbowego, na przykład AS8881 albo 8881.",
    asnInvalidRange: "ASN musi mieścić się w zakresie od 1 do {max}.",
    asnNetworkError: "Błąd sieci podczas kontaktowania z wyszukiwarką ASN.",
    asnUpstreamError: "Dostawcy danych ASN są obecnie niedostępni.",
    asnRateLimitError:
      "Zbyt wiele wyszukiwań ASN. Odczekaj przed ponowną próbą.",
    asnEmptyTitle: "Wprowadź ASN, aby sprawdzić profil sieci",
    asnEmptyDescription:
      "Wprowadź wartość z prefiksem AS lub samą liczbę. Dane dostawców mogą być niepełne, zależnie od publicznych rejestrów i skonfigurowanego planu IPinfo.",
    dnsEmptyTitle: "Wprowadź domenę, aby rozwiązać jej rekordy DNS",
    dnsEmptyDescription:
      "Wyszukaj rekordy A, AAAA, MX, TXT, NS, SOA, SRV i CAA lub wykonaj odwrotne wyszukiwanie dla adresu IP.",
    whoisEmptyTitle: "Wprowadź domenę lub adres IP, aby wyszukać WHOIS",
    whoisEmptyDescription:
      "Pobierz dane rejestratora, daty rejestracji, status i serwery nazw z właściwego serwera WHOIS.",
    cdnEmptyTitle: "Wprowadź domenę, aby wykryć jej CDN",
    cdnEmptyDescription:
      "Przeanalizuj DNS, łańcuchy CNAME i nagłówki odpowiedzi, aby zidentyfikować CDN lub dostawcę edge stojącego przed witryną.",
    asnNotFoundTitle: "Nie znaleziono profilu ASN",
    asnNotFoundDescription:
      "ASN jest prawidłowy, ale żadne skonfigurowane źródło nie zwróciło użytecznego profilu publicznego.",
    asnPartialData: "Dane częściowe",
    asnCompleteData: "Kompletne",
    asnPrefixes: "Anonsowane prefiksy",
    asnRouting: "Relacje routingu",
    asnPeeringDb: "Profil PeeringDB",
    asnIxPresence: "Obecność w IX",
    asnFacilities: "Obecność w obiektach",
    asnSourceDiagnostics: "Diagnostyka źródeł",
    asnDetailedDiagnostics: "Szczegółowa diagnostyka",
    asnUnnamed: "Nienazwany system AS",
    asnRoutingDescription:
      "Połączenia, sąsiedzi i wagi ścieżek systemu autonomicznego. Wyższe wagi oznaczają częściej obserwowane ścieżki routingu.",
    asnIxDescription:
      "Punkty wymiany internetowej (IX), w których obecny jest ten system autonomiczny, wraz z przepustowością połączeń.",
    asnPrefixesDescription:
      "Bloki IP anonsowane przez ten system autonomiczny w globalnej tablicy routingu.",
    asnPeeringDbDescription:
      "Profil połączeń i polityki routingu zadeklarowane w publicznej bazie PeeringDB.",
    asnFacilitiesDescription:
      "Fizyczne centra danych i obiekty kolokacyjne, w których obecna jest ta sieć.",
    asnProfileIdentityHeading: "Tożsamość i status",
    asnProfileInterconnectionHeading: "Szczegóły połączeń",
    asnProfilePolicyHeading: "Polityka peeringu",
    asnProfileExternalHeading: "Profile zewnętrzne",
    asnProfilePrefixes4: "Prefiksy IPv4",
    asnProfilePrefixes6: "Prefiksy IPv6",
    asnWarnings: "Ostrzeżenia",
    asnDiagnosticDuration: "Czas trwania",
    asnDiagnosticCache: "Pamięć podręczna",
    asnDiagnosticWarnings: "Ostrzeżenia",
    asnDiagnosticSource: "Źródło",
    asnSourceDiagnosticsDescription:
      "Dostępność dostawców, czas trwania żądania i stan pamięci podręcznej dla tego wyszukiwania.",
    asnCacheMiss: "brak wpisu",
    asnCacheFresh: "aktualny",
    asnCacheStale: "nieaktualny",
    asnCacheNotConfigured: "nie skonfigurowano",
    asnNoPrefixes: "Skonfigurowane źródła nie zwróciły prefiksów.",
    asnNoRelations: "Skonfigurowane źródła nie zwróciły relacji routingu.",
    asnMetricIpv4Addresses: "Adresy IPv4",
    asnMetricRoutingNeighbours: "Sąsiedzi routingu",
    asnMetricIxPresence: "Obecność w IX",
    asnMetricIpinfoDetail: "Dane ASN z IPinfo, jeśli skonfigurowano",
    asnMetricAnnouncedPrefixesDetail: "Anonsowane prefiksy",
    asnMetricBgpRelationshipsDetail: "Relacje BGP z IPinfo lub RIPEstat",
    asnMetricPeeringDbProfileDetail: "Profil sieci w PeeringDB",
    asnPrefixIpCount: "IP",
    asnRelationPeers: "Peery",
    asnRelationUpstreams: "Upstreamy",
    asnRelationDownstreams: "Downstreamy",
    asnRelationPower: "waga",
    asnSourceAvailable: "dostępne",
    asnSourceUnavailable: "niedostępne",
    asnSourceNotConfigured: "nie skonfigurowano",
    asnSourceError: "błąd",
    asnLabelName: "Nazwa",
    asnLabelCountry: "Kraj",
    asnLabelAllocated: "Przydzielono",
    asnLabelNetworkId: "Identyfikator sieci",
    asnLabelAlsoKnownAs: "Znane również jako",
    asnLabelWebsite: "Strona internetowa",
    asnLabelLookingGlass: "Looking Glass",
    asnLabelRouteServer: "Serwer tras",
    asnLabelTraffic: "Ruch",
    asnLabelPolicyGeneral: "Ogólna polityka",
    asnLabelPolicyLocations: "Lokalizacje polityki",
    asnLabelPolicyRatio: "Współczynnik polityki",
    asnLabelPolicyContracts: "Kontrakty polityki",
    asnLabelStatus: "Stan",
    asnLabelExchange: "Wymiana",
    asnLabelSpeed: "Prędkość",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "Peer RS",
    asnLabelFacility: "Obiekt",
    asnLabelCity: "Miasto",
    asnLabelLocalAsn: "Lokalny ASN",
    asnSortTable: "Sortowalna tabela",
    asnSortBy: "Sortuj według: {column}",
    asnSortNotSorted: "bez sortowania",
    asnSortAscending: "rosnąco",
    asnSortDescending: "malejąco",
    asnBooleanYes: "tak",
    asnBooleanNo: "nie",
    asnSpeedMbps: "Mb/s",
    asnNoIxLanRecords: "Nie zwrócono wpisów IX LAN.",
    asnNoFacilityRecords: "Nie zwrócono wpisów obiektów.",
    asnWarningIpinfoUnavailable:
      "Dane ASN IPinfo są niedostępne dla tego ASN lub planu tokenu.",
    asnWarningIpinfoUnexpected: "IPinfo zwróciło nieoczekiwane dane ASN.",
    asnWarningNoRipeStatData:
      "Nie znaleziono danych ASN w RIPEstat dla tego ASN.",
    asnWarningNoPeeringDbProfile:
      "Nie znaleziono publicznego profilu sieci PeeringDB dla tego ASN.",
    asnWarningProviderHttp: "{provider} zwróciło HTTP {status}.",
    asnWarningProviderTimedOut: "Żądanie do {provider} upłynęło.",
    asnWarningProviderTooLarge:
      "Odpowiedź {provider} przekroczyła limit rozmiaru.",
    asnWarningProviderInvalidJson: "{provider} zwróciło nieprawidłowy JSON.",
    asnWarningProviderUnavailable: "Dane {provider} są obecnie niedostępne.",
    asnWarningProviderStale:
      "Dane {provider} są obecnie niedostępne; używane są nieaktualne dane z pamięci podręcznej.",
    asnWarningTruncated: "Ograniczono {label} do {limit} z {total} rekordów.",
    asnWarningLabelIpinfoIpv4Prefixes: "Prefiksy IPv4 IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Prefiksy IPv6 IPinfo",
    asnWarningLabelIpinfoPeers: "Peery IPinfo",
    asnWarningLabelIpinfoUpstreams: "Upstreamy IPinfo",
    asnWarningLabelIpinfoDownstreams: "Downstreamy IPinfo",
    asnWarningLabelPeeringDbIxLan: "Wpisy IX LAN PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Obiekty PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Prefiksy IPv4 RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Prefiksy IPv6 RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours: "Sąsiedzi routingu RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Sąsiedzi po stronie upstream RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Sąsiedzi po stronie downstream RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "Wyszukiwanie...",
    dnsLookupButton: "Wyszukaj DNS",
    dnsLookupError: "Wyszukiwanie DNS nie powiodło się.",
    dnsRecordsFor: "Rekordy DNS dla",
    resolvedAddresses: "Rozwiązane adresy",
    noAddressResult: "Brak wyniku A/AAAA.",
    recordDetails: "Szczegóły rekordu",
    dnsRecordNotes: "Uwagi do wyszukiwania rekordów",
    dnsTableType: "Typ",
    dnsTableValue: "Wartość",
    dnsShowRaw: "Pokaż surowy JSON",
    dnsHideRaw: "Ukryj surowy JSON",
    dnsNoRecords: "Nie zwrócono rekordów wybranego typu.",
    whoisPlaceholder: "example.com lub 8.8.8.8",
    whoisLookupButton: "Wyszukaj WHOIS",
    whoisLookupError: "Wyszukiwanie WHOIS nie powiodło się.",
    whoisFor: "WHOIS dla",
    queriedServer: "Zapytany serwer",
    referralSource: "Źródło polecenia",
    noWhoisData: "Nie zwrócono danych WHOIS.",
    whoisRegistrar: "Rejestrator",
    whoisCreated: "Utworzono",
    whoisUpdated: "Zaktualizowano",
    whoisExpires: "Wygasa",
    whoisStatusLabel: "Stan",
    whoisNameservers: "Serwery nazw",
    whoisShowRaw: "Pokaż surowe dane",
    whoisHideRaw: "Ukryj surowe dane",
    pingTestMode: "Tryb testu",
    pingModeHelperTcp: "Sprawdza, czy port TCP akceptuje połączenie.",
    pingModeHelperUdp:
      "Wysyła sondę UDP i informuje o natychmiastowej odpowiedzi lub błędzie.",
    pingModeHelperEb:
      "Najpierw sprawdza TCP, a następnie osiągalność punktów końcowych HTTP/HTTPS.",
    pingModeHelperDatabase:
      "Wykrywa protokół przed uwierzytelnieniem i opcjonalnie sprawdza połączenie uwierzytelnione.",
    pingModeDatabase: "Baza danych",
    pingDatabaseType: "Typ bazy danych",
    pingTargetHost: "Host docelowy / IP",
    pingPort: "Numer portu",
    pingTimeout: "Limit czasu (ms)",
    pingUseAuth: "Sprawdź z uwierzytelnieniem",
    pingUsername: "Nazwa użytkownika",
    pingPassword: "Hasło",
    pingDatabaseOptional: "Baza danych (opcjonalnie)",
    pingRunButton: "Uruchom test ping",
    pingRunning: "Test jest wykonywany...",
    pingNetworkError: "Błąd sieci podczas kontaktowania z /api/ping.",
    pingModeLabel: "Tryb",
    pingLatencyLabel: "Opóźnienie",
    pingTargetLabel: "Cel",
    pingDetailsLabel: "Szczegóły",
    pingEmptyTitle: "Nie uruchomiono jeszcze testu",
    pingEmptyDescription:
      "Wybierz tryb testu, wprowadź host i port, a następnie uruchom sprawdzenie, aby zmierzyć osiągalność i opóźnienie.",
    pingStatusSuccess: "Cel osiągalny",
    pingStatusFailed: "Sprawdzenie nie powiodło się",
    pingShowDetails: "Pokaż szczegóły techniczne",
    pingHideDetails: "Ukryj szczegóły techniczne",
    pingResultTcpOk: "Nawiązano połączenie TCP.",
    pingResultTcpTimeout: "Limit czasu TCP upłynął po {timeoutMs} ms.",
    pingResultTcpFailed: "Połączenie TCP nie powiodło się: {error}",
    pingResultUdpSent:
      "Wysłano pakiet UDP. W ciągu {timeoutMs} ms nie zaobserwowano błędu ICMP.",
    pingResultUdpResponse: "Otrzymano odpowiedź UDP z {from} ({bytes} B).",
    pingResultUdpFailed: "Sonda UDP nie powiodła się: {error}",
    pingResultEbHttpOk:
      "Punkt końcowy osiągalny przez {scheme} (status {status}).",
    pingResultEbNoHttp:
      "TCP jest otwarty, ale w tym punkcie końcowym nie wykryto odpowiedzi HTTP(S).",
    pingResultEbTcpFailed:
      "Sprawdzenie EB nie powiodło się na etapie TCP: {error}",
    pingResultDbConnectFailed:
      "Łączność z bazą {database} nie powiodła się: {error}",
    pingResultDbProtocolOk:
      "Serwer {database} odpowiedział na sondę uścisku dłoni przed uwierzytelnieniem.",
    pingResultDbProtocolFailed: "Sonda {database} nie powiodła się: {error}",
    pingResultDbTcpOk:
      "Port TCP bazy {database} jest osiągalny. Dla tego typu nie ma sondy protokołu przed uwierzytelnieniem.",
    pingResultDbAuthUnsupported:
      "Sprawdzenia z uwierzytelnieniem są zaimplementowane tylko dla Redis. Użyj sprawdzenia protokołu dla {database}.",
    pingResultDbAuthOk:
      "Połączenie z Redis z uwierzytelnieniem zakończyło się powodzeniem.",
    pingResultDbAuthFailed:
      "Sprawdzenie uwierzytelnienia Redis nie powiodło się: {error}",
    cdnAnalyzeButton: "Sprawdź CDN",
    cdnAnalyzing: "Analizowanie...",
    cdnNetworkError: "Błąd sieci podczas kontaktowania z weryfikatorem CDN.",
    cdnSummaryUnreachable: "Cel nieosiągalny",
    cdnSummaryNoMatch: "Brak pewnego dopasowania CDN",
    cdnSummaryDetected: "Wykryto CDN",
    cdnConfidenceNa: "nie dotyczy",
    cdnNoProviderMatch: "Żaden dostawca nie pasuje — rozwiązane adresy IP",
    cdnInspectIpsHint:
      "Możesz sprawdzić te adresy IP na stronie wyszukiwania IP:",
    cdnTargetLabel: "Cel",
    cdnHttpStatusLabel: "Status HTTP",
    cdnProviderLabel: "Dostawca",
    cdnUnknown: "Nieznany",
    cdnMatchedSignals: "Pasujące sygnały",
    cdnNoSignals: "Nie znaleziono jednoznacznego sygnału CDN.",
    cdnCnameChain: "Łańcuch CNAME",
    cdnNoCname: "Nie znaleziono rekordów CNAME.",
    cdnInterestingHeaders: "Interesujące nagłówki odpowiedzi",
    cdnNoHeaders: "Nie znaleziono istotnych nagłówków.",
    reputationTitle: "Sprawdzenie reputacji IP",
    reputationSubtitle:
      "Sprawdź publiczny adres IP w niezależnych źródłach reputacji i analizy zagrożeń oraz otrzymaj ocenę ryzyka opartą na dowodach.",
    reputationPlaceholder: "8.8.8.8 lub 2001:4860:4860::8888",
    reputationCheckButton: "Sprawdź reputację",
    reputationChecking: "Sprawdzanie...",
    reputationNetworkError:
      "Błąd sieci podczas kontaktowania ze sprawdzeniem reputacji.",
    reputationRateLimitError:
      "Zbyt wiele sprawdzeń reputacji. Odczekaj przed ponowną próbą.",
    reputationInvalidIp:
      "Wprowadź prawidłowy publiczny adres IP (IPv4 lub IPv6).",
    reputationBlockedIp:
      "Prywatnych, zarezerwowanych i wewnętrznych zakresów IP nie można sprawdzać.",
    reputationEmptyTitle: "Wprowadź adres IP, aby sprawdzić jego reputację",
    reputationEmptyDescription:
      "Adres IP jest sprawdzany względem list blokad DNS, baz zgłoszeń nadużyć, trackerów C2 botnetów i źródeł klasyfikacji sieci. Opcjonalni dostawcy (AbuseIPDB, GreyNoise, http:BL, ThreatFox) są aktywowani po skonfigurowaniu bezpłatnego klucza API.",
    reputationRiskLow: "Niskie ryzyko",
    reputationRiskMedium: "Średnie ryzyko",
    reputationRiskHigh: "Wysokie ryzyko",
    reputationHeadlineClean: "Nie wykryto złośliwej aktywności",
    reputationScoreLabel: "Wynik ryzyka",
    reputationSectionSummary: "Podsumowanie reputacji",
    reputationSectionThreats: "Dowody zagrożenia",
    reputationSectionMail: "Reputacja poczty",
    reputationSectionNetwork: "Klasyfikacja sieci",
    reputationSectionSources: "Źródła",
    reputationSectionScore: "Jak obliczono ten wynik",
    reputationCoverageChecked: "Sprawdzono źródła: {count}",
    reputationCoverageMatched: "Z dowodami zagrożenia: {count}",
    reputationCoveragePolicy: "Z informacjami polityki lub kontekstu: {count}",
    reputationCoverageUnavailable: "Niedostępne: {count}",
    reputationGeneratedAt: "Wygenerowano {time}",
    reputationNoThreatEvidence:
      "W sprawdzanych źródłach nie znaleziono bezpośrednich obserwacji złośliwej aktywności.",
    reputationNoMailEvidence:
      "W sprawdzanych źródłach nie znaleziono wpisów dotyczących reputacji poczty.",
    reputationFilterAll: "Wszystkie",
    reputationNoEvidence:
      "Brak dowodów w tej grupie w źródłach, które można było sprawdzić.",
    reputationFactChecked: "Sprawdzono",
    reputationFactMatched: "Z dowodami zagrożenia",
    reputationFactUnavailable: "Niedostępne",
    reputationFactCheckedAt: "Sprawdzono o",
    reputationScoreCapped: "Ograniczono z {count} punktów bazowych",
    reputationConnectionLabel: "Połączenie",
    reputationReverseLabel: "Odwrotne DNS",
    reputationFieldSource: "Źródło",
    reputationFieldConfidence: "Pewność",
    reputationFieldFirstSeen: "Pierwsze wystąpienie",
    reputationFieldLastSeen: "Ostatnie wystąpienie",
    reputationFieldReports: "Zgłoszenia",
    reputationFieldAttacks: "Zdarzenia ataku",
    reputationFieldMalware: "Złośliwe oprogramowanie",
    reputationFieldDetail: "Szczegóły",
    reputationFieldReturnCode: "Kod zwrotu",
    reputationPointsLabel: "+{points} pkt",
    reputationCategories: {
      mail_policy: "Wpis dotyczący polityki poczty",
      mail_reputation: "Wpis dotyczący reputacji poczty",
      spam_observed: "Wykryto aktywność spamową",
      abuse_reported: "Zgłoszono nadużycie",
      scanner: "Skaner działający w całym Internecie",
      bruteforce: "Ataki siłowe",
      web_attack: "Ataki na witryny",
      ddos: "Ataki DDoS / powodzie",
      botnet: "Aktywność botnetu",
      malware: "Infrastruktura złośliwego oprogramowania",
      proxy: "Otwarty proxy",
      vpn: "VPN / anonimizator",
      tor: "Węzeł wyjściowy Tor",
      hosting: "Hosting / centrum danych",
      residential: "Sieć prywatna",
      mobile: "Sieć mobilna",
      benign_service: "Znana usługa biznesowa",
    },
    reputationSeverities: {
      info: "Informacja",
      low: "Niskie zagrożenie",
      medium: "Średnie zagrożenie",
      high: "Wysokie zagrożenie",
      critical: "Krytyczne",
    },
    reputationSourceStates: {
      available: "dostępne",
      clean: "czyste",
      matched: "dopasowano",
      policy_listed: "na liście (polityka)",
      not_configured: "nie skonfigurowano",
      unsupported: "nieobsługiwane",
      rate_limited: "ograniczono limitem",
      resolver_blocked: "zablokowano w resolverze",
      unavailable: "niedostępne",
    },
    reputationReasons: {
      sbl: "Wpis na liście Spamhaus SBL: zweryfikowane źródła spamu, usługi spamowe lub spamerzy ROKSO (lista oparta na dowodach i utrzymywana przez redakcję).",
      css: "Wpis na liście Spamhaus CSS: automatyczne wykrywanie wysokonakładowego lub szarego wysyłania poczty. Dowody słabsze niż w SBL.",
      xbl: "Wpis na liście Spamhaus XBL: host obserwowano z oprogramowaniem typu trojan lub exploit albo jako otwarty proxy — zwykle przejęty komputer.",
      drop: "Adres znajduje się w bloku sieci Spamhaus DROP: zakresy kontrolowane przez przestępców lub operatorów hostingu typu bulletproof, używane do złośliwego oprogramowania, kontrolerów botnetów i spamu.",
      pbl_isp:
        "Wpis na liście Spamhaus PBL (utrzymywanej przez ISP): ten zakres nie powinien bezpośrednio dostarczać poczty SMTP do zewnętrznych serwerów. Jest to normalne dla większości prywatnych, dynamicznych i końcowych adresów i nie jest dowodem nadużycia.",
      pbl_spamhaus:
        "Wpis na liście Spamhaus PBL (utrzymywanej przez Spamhaus): zakres polityki, który nie powinien dostarczać poczty bezpośrednio. Normalny dla wielu adresów końcowych, bez dowodu nadużycia.",
      bcl: "Wpis na liście Spamhaus Botnet Controller: potwierdzona aktywna infrastruktura sterowania i kontrolowania botnetu.",
      spamcop_listing:
        "Wpis w SpamCop na podstawie najnowszych zgłoszeń spamu (pułapki spamowe i dowody użytkowników). Wpisy wygasają krótko po ostatnim zgłoszeniu.",
      barracuda_listing:
        "Słaba reputacja poczty zmierzona w sieci filtrów Barracuda. To zagregowany, częściowo historyczny sygnał, który może również dotyczyć dynamicznie przypisywanych adresów — nie dowodzi, że ten adres obecnie wysyła spam.",
      dronebl_irc_drone:
        "Sieć DroneBL obserwowała host jako drona spamowego IRC (bota).",
      dronebl_bottler: "Sieć DroneBL obserwowała bota IRC typu Bottler.",
      dronebl_worm:
        "Sieć DroneBL obserwowała host uruchamiający robaka lub spambota.",
      dronebl_ddos_drone:
        "Obserwowano jako drona DDoS (uczestniczy w atakach rozproszonych).",
      dronebl_open_socks_proxy:
        "Obserwowano działanie otwartego proxy SOCKS — infrastruktury, która może być nadużywana, ale nie musi być sama w sobie złośliwa.",
      dronebl_open_http_proxy:
        "Obserwowano działanie otwartego proxy HTTP — infrastruktury, która może być nadużywana, ale nie musi być sama w sobie złośliwa.",
      dronebl_proxychain: "Obserwowano jako element łańcucha proxy.",
      dronebl_web_proxy: "Obserwowano działanie otwartego proxy internetowego.",
      dronebl_dictionary:
        "Obserwowano wykonywanie zautomatyzowanych ataków słownikowych (siłowych).",
      dronebl_wingate: "Obserwowano działanie otwartego proxy WinGate.",
      dronebl_compromised_router:
        "Obserwowano jako przejęty router lub bramę sieciową.",
      dronebl_botnet_auto:
        "DroneBL automatycznie zakwalifikował host jako infrastrukturę botnetu (wykrywanie eksperymentalne).",
      dronebl_compromised_host:
        "Wykryto prawdopodobnie przejęty host za pośrednictwem IRC.",
      dronebl_uncategorized: "Wpis w DroneBL z nieokreśloną klasą zagrożenia.",
      bld_attack:
        "Raporty o atakach złożone przez operatorów naruszonych serwerów i zebrane przez blocklist.de. Wpis DNS oznacza, że ataki zgłoszono niedawno.",
      bld_counts_only:
        "Historyczne zgłoszenia nadużyć zapisane przez blocklist.de; adres nie znajduje się obecnie w aktywnej strefie DNS.",
      feodo_c2_online:
        "Aktywny serwer sterowania i kontrolowania botnetu, zweryfikowany przez Feodo Tracker (abuse.ch) na podstawie prawidłowej odpowiedzi C2.",
      feodo_c2_offline:
        "Serwer C2 botnetu śledzony przez Feodo Tracker (abuse.ch); ostatnio widziany w ciągu ostatnich dni i pozostawiony na liście blokowania.",
      greynoise_scanner_malicious:
        "W ciągu ostatnich 90 dni obserwowano skanowanie internetu, a GreyNoise sklasyfikował je jako złośliwe.",
      greynoise_scanner_unknown:
        "W ciągu ostatnich 90 dni obserwowano skanowanie internetu, ale GreyNoise nie mógł sklasyfikować aktywności.",
      greynoise_scanner_benign:
        "Obserwowano skanowanie internetu, ale GreyNoise sklasyfikował je jako nieszkodliwe, na przykład jako projekt badawczy.",
      greynoise_riot:
        "Znana, powszechnie używana usługa biznesowa w zbiorze GreyNoise RIOT, na przykład CDN lub firma bezpieczeństwa.",
      abuseipdb_reports:
        "Raporty o nadużyciach zgłoszone przez użytkowników AbuseIPDB w ciągu ostatnich 90 dni. Wynik pewności odzwierciedla liczbę i spójność raportów.",
      abuseipdb_tor: "AbuseIPDB zidentyfikował adres jako węzeł wyjściowy Tor.",
      threatfox_ioc:
        "Opublikowany jako wskaźnik zagrożenia (IOC) w bazie abuse.ch ThreatFox, udostępniany badaczom bezpieczeństwa.",
      httpbl_search_engine: "Znany robot wyszukiwarki (Project Honey Pot).",
      httpbl_suspicious:
        "Podejrzany odwiedzający witrynę wykryty w sieci honeypot Project Honey Pot. Często jest to nieszkodliwy robot; zachowaj ostrożność.",
      httpbl_harvester:
        "Obserwowano zbieranie adresów e-mail z honeypotów w sieci Project Honey Pot.",
      httpbl_comment_spammer:
        "Obserwowano publikowanie spamu w komentarzach w honeypotach sieci Project Honey Pot.",
      ipapi_vpn:
        "Oznaczony przez ip-api.com jako usługa VPN, proxy lub anonimizator.",
      ipapi_hosting:
        "Oznaczony przez ip-api.com jako adres hostingu lub centrum danych.",
      ipapi_mobile:
        "Zidentyfikowany przez ip-api.com jako połączenie mobilne lub komórkowe.",
      residential_estimate:
        "Szacowane połączenie prywatne na podstawie typu połączenia i nazewnictwa odwrotnego DNS — heurystyka, bez potwierdzenia dostawcy.",
      corroboration:
        "Kilka niezależnych źródeł zgłasza złośliwą aktywność dla tego adresu.",
      mail_corroboration:
        "Ten adres znajduje się na kilku niezależnych listach reputacji poczty.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Połączona lista DNSBL Spamhaus: SBL (zweryfikowane źródła spamu), CSS (automatyczne wykrywanie nadawców spamu), XBL (przejęte hosty), PBL (zakresy polityki poczty), BCL (kontrolery botnetów).",
      "spamhaus-drop":
        "Bezpłatny kanał Spamhaus z blokami sieci kontrolowanymi przez przestępców lub operatorów hostingu typu bulletproof. Sprawdzany lokalnie z kopii w pamięci podręcznej odświeżanej co godzinę.",
      spamcop:
        "Lista blokad poczty tworzona z pułapek spamowych i zgłoszeń użytkowników. Wpisy są krótkotrwałe i odzwierciedlają bieżące zachowanie nadawców.",
      barracuda:
        "Wartości reputacji poczty mierzone w sieci filtrów spamu Barracuda Networks. Zagregowany, częściowo historyczny sygnał.",
      dronebl:
        "DNSBL prowadzony przez projekt DroneBL, wymieniający drony, przejęte hosty, uczestników ataków DDoS i otwarte proxy obserwowane przez sieci IRC i monitorujące. Bezpłatne do użytku komercyjnego i niekomercyjnego.",
      "blocklist-de":
        "Niemiecka platforma zgłoszeń nadużyć gromadząca raporty o atakach, takich jak ataki siłowe SSH, ataki pocztowe i skanowanie witryn, od operatorów naruszonych serwerów.",
      "feodo-tracker":
        "Tracker abuse.ch serwerów C2 botnetów, między innymi Dridex, Emotet, TrickBot, QakBot i BazarLoader. Wpisy wymagają zaobserwowanej prawidłowej odpowiedzi C2. Sprawdzany lokalnie z kanału w pamięci podręcznej.",
      greynoise:
        "Informacje o skanerach działających w całym Internecie. API społecznościowe informuje, czy adres ostatnio obserwowano podczas skanowania i jak go sklasyfikowano.",
      abuseipdb:
        "Baza zgłoszeń nadużyć tworzona przez społeczność, z wynikiem pewności. Wymaga bezpłatnego klucza API (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL Project Honey Pot dotyczący nadużyć w Internecie: zbieracze adresów, spamujący w komentarzach i podejrzane boty. Wymaga bezpłatnego klucza dostępu (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Platforma abuse.ch do udostępniania wskaźników kompromitacji, w tym adresów C2 botnetów. Wymaga bezpłatnego klucza Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Metadane IP: geolokalizacja, sieć/ASN oraz flagi klasyfikacji połączenia.",
    },
    reputationGeoLabel: "Geolokalizacja",
    reputationNetworkLabel: "ASN / dostawca",
    reputationShowHiddenSources: "Pokaż nieskonfigurowane źródła ({count})",
    reputationHideHiddenSources: "Ukryj nieskonfigurowane źródła",
  },
  "pt-BR": {
    errorRateLimited:
      "Muitas solicitações. Aguarde um momento e tente novamente.",
    errorInvalidTarget:
      "Informe um domínio público, endereço IP ou URL válido.",
    errorTargetBlocked:
      "Alvos privados, locais e internos não podem ser verificados neste site público.",
    errorTimeout:
      "A verificação expirou. O alvo pode estar lento ou inacessível.",
    errorUpstream:
      "Um provedor de dados upstream está indisponível no momento.",
    errorBadRequest: "Os parâmetros da solicitação são inválidos.",
    errorTargetNetwork: "Não foi possível resolver ou acessar o alvo.",
    showAll: "Mostrar tudo",
    showLess: "Mostrar menos",
    navOverview: "Visão geral",
    navDiagnostics: "Diagnóstico",
    navMyIp: "Meu IP",
    brandTagline: "Kit de ferramentas de rede e IP",
    themeToggle: "Alternar tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema",
    navMenu: "Menu do site",
    skipToContent: "Pular para o conteúdo",
    navToolsLabel: "Ferramentas",
    sidebarLabel: "Navegação do site",
    navClose: "Fechar menu",
    copyValue: "Copiar",
    downloadJson: "Baixar JSON",
    cancelLookup: "Cancelar",
    whoisNoteIana:
      "Nenhum servidor de referência foi encontrado. Exibindo a resposta WHOIS da IANA.",
    whoisNoteRdap:
      "O WHOIS estava indisponível. Exibindo os dados de registro RDAP.",
    commandTriggerLabel: "Pesquisar…",
    commandPlaceholder:
      "Pesquisar ferramentas ou inserir um IP, domínio ou ASN…",
    commandGroupActions: "Ações",
    commandGroupPages: "Ir para",
    commandEmpty: "Nenhuma ferramenta ou ação correspondente.",
    commandHintNavigate: "Navegar",
    commandHintSelect: "Abrir",
    commandHintClose: "Fechar",
    notFoundTitle: "Página não encontrada",
    notFoundDescription:
      "Este endereço não pertence a nenhuma ferramenta. Volte à página inicial ou use a pesquisa (Ctrl+K).",
    notFoundBackHome: "Voltar à página inicial",
    errorTitle: "Algo deu errado",
    errorDescription:
      "Não foi possível carregar esta página. Tente novamente — se o problema continuar, a causa está do nosso lado.",
    errorRetry: "Tentar novamente",
    asnRpkiValid: "RPKI válido",
    asnRpkiInvalid: "RPKI inválido",
    asnRpkiStatus: "RPKI: {status}",
    cdnConfidenceHigh: "Alta",
    cdnConfidenceMedium: "Média",
    cdnConfidenceLow: "Baixa",
    pingTabLabel: "Testador de ping",
    dnsTabLabel: "Consulta de DNS",
    whoisTabLabel: "Consulta de WHOIS",
    cdnTabLabel: "Verificador de CDN",
    asnTabLabel: "Consulta de ASN",
    reputationTabLabel: "Reputação de IP",
    pingTitle: "Testador de ping e portas",
    pingSubtitle:
      "Testes orientados para portas TCP/UDP, endpoints EB e conectividade com bancos de dados em um fluxo de teste mais simples.",
    dnsTitle: "Consulta de DNS",
    dnsSubtitle:
      "Consulte registros DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) de domínios e faça a consulta DNS reversa de endereços IP.",
    whoisTitle: "Consulta de WHOIS",
    whoisSubtitle:
      "Consulte registros WHOIS de domínios e endereços IP diretamente neste aplicativo.",
    cdnTitle: "Verificador de uso de CDN",
    cdnSubtitle:
      "Analise qualquer domínio quanto ao uso de CDN e ao provedor provável, incluindo CloudFront, Google Cloud CDN, Azure CDN, Vercel e outros.",
    asnTitle: "Informações do ASN",
    asnSubtitle:
      "Pesquise sistemas autônomos com detalhes de ASN da IPinfo e dados públicos de interconexão do PeeringDB.",
    asnPlaceholder: "AS8881 ou 8881",
    asnLookupButton: "Consultar ASN",
    asnLookingUp: "Consultando...",
    asnInvalidInput:
      "Use um ASN com prefixo AS ou numérico, por exemplo AS8881 ou 8881.",
    asnInvalidRange: "O ASN deve estar entre 1 e {max}.",
    asnNetworkError: "Erro de rede ao contatar a consulta de ASN.",
    asnUpstreamError:
      "Os provedores de dados de ASN estão indisponíveis no momento.",
    asnRateLimitError:
      "Muitas consultas de ASN. Aguarde antes de tentar novamente.",
    asnEmptyTitle: "Informe um ASN para inspecionar um perfil de rede",
    asnEmptyDescription:
      "Use uma entrada com prefixo AS ou apenas numérica. Os dados dos provedores podem estar incompletos conforme os registros públicos e o plano da IPinfo configurado.",
    dnsEmptyTitle: "Informe um domínio para resolver seus registros DNS",
    dnsEmptyDescription:
      "Consulte registros A, AAAA, MX, TXT, NS, SOA, SRV e CAA ou faça uma consulta reversa em um endereço IP.",
    whoisEmptyTitle: "Informe um domínio ou IP para consultar o WHOIS",
    whoisEmptyDescription:
      "Obtenha o registrador, as datas de registro, o status e os servidores de nomes no servidor WHOIS responsável.",
    cdnEmptyTitle: "Informe um domínio para detectar o CDN",
    cdnEmptyDescription:
      "Inspecione DNS, cadeias CNAME e cabeçalhos de resposta para identificar o CDN ou o provedor de edge na frente do site.",
    asnNotFoundTitle: "Nenhum perfil de ASN encontrado",
    asnNotFoundDescription:
      "O ASN é válido, mas nenhuma fonte configurada retornou um perfil público utilizável.",
    asnPartialData: "Dados parciais",
    asnCompleteData: "Completos",
    asnPrefixes: "Prefixos anunciados",
    asnRouting: "Relações de roteamento",
    asnPeeringDb: "Perfil do PeeringDB",
    asnIxPresence: "Presença em IX",
    asnFacilities: "Presença em instalações",
    asnSourceDiagnostics: "Diagnóstico das fontes",
    asnDetailedDiagnostics: "Diagnóstico detalhado",
    asnUnnamed: "AS sem nome",
    asnRoutingDescription:
      "Interconexões, vizinhos e pesos de caminhos do sistema autônomo. Pesos maiores indicam caminhos de roteamento observados com mais frequência.",
    asnIxDescription:
      "Pontos de troca da Internet (IX) onde este sistema autônomo está presente, incluindo a largura de banda das interconexões.",
    asnPrefixesDescription:
      "Blocos de IP anunciados por este sistema autônomo na tabela de roteamento global.",
    asnPeeringDbDescription:
      "Perfil de interconexão e políticas de roteamento declarados no banco de dados público do PeeringDB.",
    asnFacilitiesDescription:
      "Centros de dados físicos e instalações de colocation onde esta rede está presente.",
    asnProfileIdentityHeading: "Identidade e status",
    asnProfileInterconnectionHeading: "Detalhes de interconexão",
    asnProfilePolicyHeading: "Política de peering",
    asnProfileExternalHeading: "Perfis externos",
    asnProfilePrefixes4: "Prefixos IPv4",
    asnProfilePrefixes6: "Prefixos IPv6",
    asnWarnings: "Avisos",
    asnDiagnosticDuration: "Duração",
    asnDiagnosticCache: "Armazenamento em cache",
    asnDiagnosticWarnings: "Avisos",
    asnDiagnosticSource: "Fonte",
    asnSourceDiagnosticsDescription:
      "Disponibilidade dos provedores, duração da solicitação e estado do cache desta consulta.",
    asnCacheMiss: "não encontrado",
    asnCacheFresh: "atual",
    asnCacheStale: "desatualizado",
    asnCacheNotConfigured: "não configurado",
    asnNoPrefixes: "Nenhum prefixo retornado pelas fontes configuradas.",
    asnNoRelations:
      "Nenhuma relação de roteamento retornada pelas fontes configuradas.",
    asnMetricIpv4Addresses: "Endereços IPv4",
    asnMetricRoutingNeighbours: "Vizinhos de roteamento",
    asnMetricIxPresence: "Presença em IX",
    asnMetricIpinfoDetail: "Dados de ASN da IPinfo, quando configurados",
    asnMetricAnnouncedPrefixesDetail: "Prefixos anunciados",
    asnMetricBgpRelationshipsDetail: "Relações BGP da IPinfo ou do RIPEstat",
    asnMetricPeeringDbProfileDetail: "Perfil de rede do PeeringDB",
    asnPrefixIpCount: "Endereços IP",
    asnRelationPeers: "Pares",
    asnRelationUpstreams: "Trânsitos a montante",
    asnRelationDownstreams: "Trânsitos a jusante",
    asnRelationPower: "peso",
    asnSourceAvailable: "disponível",
    asnSourceUnavailable: "indisponível",
    asnSourceNotConfigured: "não configurado",
    asnSourceError: "erro",
    asnLabelName: "Nome",
    asnLabelCountry: "País",
    asnLabelAllocated: "Alocado",
    asnLabelNetworkId: "ID da rede",
    asnLabelAlsoKnownAs: "Também conhecido como",
    asnLabelWebsite: "Site",
    asnLabelLookingGlass: "Looking Glass",
    asnLabelRouteServer: "Servidor de rotas",
    asnLabelTraffic: "Tráfego",
    asnLabelPolicyGeneral: "Política geral",
    asnLabelPolicyLocations: "Localizações da política",
    asnLabelPolicyRatio: "Proporção da política",
    asnLabelPolicyContracts: "Contratos da política",
    asnLabelStatus: "Situação",
    asnLabelExchange: "Troca",
    asnLabelSpeed: "Velocidade",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "Peer RS",
    asnLabelFacility: "Instalação",
    asnLabelCity: "Cidade",
    asnLabelLocalAsn: "ASN local",
    asnSortTable: "Tabela classificável",
    asnSortBy: "Classificar por {column}",
    asnSortNotSorted: "sem classificação",
    asnSortAscending: "crescente",
    asnSortDescending: "decrescente",
    asnBooleanYes: "sim",
    asnBooleanNo: "não",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Nenhum registro de IX LAN retornado.",
    asnNoFacilityRecords: "Nenhum registro de instalação retornado.",
    asnWarningIpinfoUnavailable:
      "Os dados de ASN da IPinfo não estão disponíveis para este ASN ou plano de token.",
    asnWarningIpinfoUnexpected:
      "A IPinfo retornou um payload de ASN inesperado.",
    asnWarningNoRipeStatData:
      "Nenhum dado de ASN foi encontrado no RIPEstat para este ASN.",
    asnWarningNoPeeringDbProfile:
      "Nenhum perfil de rede público do PeeringDB foi encontrado para este ASN.",
    asnWarningProviderHttp: "{provider} retornou HTTP {status}.",
    asnWarningProviderTimedOut: "A solicitação para {provider} expirou.",
    asnWarningProviderTooLarge:
      "A resposta de {provider} excedeu o limite de tamanho.",
    asnWarningProviderInvalidJson: "{provider} retornou JSON inválido.",
    asnWarningProviderUnavailable:
      "Os dados de {provider} estão indisponíveis no momento.",
    asnWarningProviderStale:
      "Os dados de {provider} estão indisponíveis no momento; usando dados desatualizados do cache.",
    asnWarningTruncated:
      "Os dados de {label} foram truncados para {limit} de {total} registros.",
    asnWarningLabelIpinfoIpv4Prefixes: "Prefixos IPv4 da IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Prefixos IPv6 da IPinfo",
    asnWarningLabelIpinfoPeers: "Peers da IPinfo",
    asnWarningLabelIpinfoUpstreams: "Upstreams da IPinfo",
    asnWarningLabelIpinfoDownstreams: "Downstreams da IPinfo",
    asnWarningLabelPeeringDbIxLan: "Registros de IX LAN do PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Instalações do PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Prefixos IPv4 do RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Prefixos IPv6 do RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours:
      "Vizinhos de roteamento do RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Vizinhos do lado upstream do RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Vizinhos do lado downstream do RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "Consultando...",
    dnsLookupButton: "Consultar DNS",
    dnsLookupError: "A consulta de DNS falhou.",
    dnsRecordsFor: "Registros DNS de",
    resolvedAddresses: "Endereços resolvidos",
    noAddressResult: "Nenhum resultado A/AAAA.",
    recordDetails: "Detalhes do registro",
    dnsRecordNotes: "Observações da consulta de registros",
    dnsTableType: "Tipo",
    dnsTableValue: "Valor",
    dnsShowRaw: "Mostrar JSON bruto",
    dnsHideRaw: "Ocultar JSON bruto",
    dnsNoRecords: "Nenhum registro do tipo selecionado foi retornado.",
    whoisPlaceholder: "example.com ou 8.8.8.8",
    whoisLookupButton: "Consultar WHOIS",
    whoisLookupError: "A consulta de WHOIS falhou.",
    whoisFor: "WHOIS de",
    queriedServer: "Servidor consultado",
    referralSource: "Origem do encaminhamento",
    noWhoisData: "Nenhum dado WHOIS foi retornado.",
    whoisRegistrar: "Registrador",
    whoisCreated: "Criado",
    whoisUpdated: "Atualizado",
    whoisExpires: "Expira",
    whoisStatusLabel: "Situação",
    whoisNameservers: "Servidores de nomes",
    whoisShowRaw: "Mostrar saída bruta",
    whoisHideRaw: "Ocultar saída bruta",
    pingTestMode: "Modo de teste",
    pingModeHelperTcp: "Verifica se a porta TCP aceita uma conexão.",
    pingModeHelperUdp:
      "Envia uma sonda UDP e relata o comportamento imediato de resposta ou erro.",
    pingModeHelperEb:
      "Verifica primeiro o TCP e depois a acessibilidade dos endpoints HTTP/HTTPS.",
    pingModeHelperDatabase:
      "Executa verificações de protocolo antes da autenticação e verificações autenticadas opcionais.",
    pingModeDatabase: "Banco de dados",
    pingDatabaseType: "Tipo de banco de dados",
    pingTargetHost: "Host de destino / IP",
    pingPort: "Porta",
    pingTimeout: "Tempo limite (ms)",
    pingUseAuth: "Verificar com autenticação",
    pingUsername: "Nome de usuário",
    pingPassword: "Senha",
    pingDatabaseOptional: "Banco de dados (opcional)",
    pingRunButton: "Executar teste de ping",
    pingRunning: "Executando verificação...",
    pingNetworkError: "Erro de rede ao contatar /api/ping.",
    pingModeLabel: "Modo",
    pingLatencyLabel: "Latência",
    pingTargetLabel: "Alvo",
    pingDetailsLabel: "Detalhes",
    pingEmptyTitle: "Nenhum teste executado ainda",
    pingEmptyDescription:
      "Escolha um modo de teste, informe um host e uma porta e execute a verificação para medir a acessibilidade e a latência.",
    pingStatusSuccess: "Alvo acessível",
    pingStatusFailed: "Falha na verificação",
    pingShowDetails: "Mostrar detalhes técnicos",
    pingHideDetails: "Ocultar detalhes técnicos",
    pingResultTcpOk: "Conexão TCP estabelecida.",
    pingResultTcpTimeout: "Tempo limite de TCP após {timeoutMs} ms.",
    pingResultTcpFailed: "Falha na conexão TCP: {error}",
    pingResultUdpSent:
      "Pacote UDP enviado. Nenhum erro ICMP observado em {timeoutMs} ms.",
    pingResultUdpResponse: "Resposta UDP recebida de {from} ({bytes} bytes).",
    pingResultUdpFailed: "Falha na sonda UDP: {error}",
    pingResultEbHttpOk: "Endpoint acessível via {scheme} (status {status}).",
    pingResultEbNoHttp:
      "TCP aberto, mas nenhuma resposta HTTP(S) foi detectada neste endpoint.",
    pingResultEbTcpFailed: "A verificação EB falhou na etapa TCP: {error}",
    pingResultDbConnectFailed: "A conectividade com {database} falhou: {error}",
    pingResultDbProtocolOk:
      "O servidor {database} respondeu a uma sonda de handshake pré-autenticação.",
    pingResultDbProtocolFailed: "A sonda {database} falhou: {error}",
    pingResultDbTcpOk:
      "A porta TCP de {database} está acessível. Não há sonda de protocolo pré-autenticação para este tipo.",
    pingResultDbAuthUnsupported:
      "As verificações autenticadas só são implementadas para Redis. Use a verificação de protocolo para {database}.",
    pingResultDbAuthOk: "Conexão Redis autenticada bem-sucedida.",
    pingResultDbAuthFailed:
      "Falha na verificação de autenticação do Redis: {error}",
    cdnAnalyzeButton: "Verificar CDN",
    cdnAnalyzing: "Analisando...",
    cdnNetworkError: "Erro de rede ao contatar o verificador de CDN.",
    cdnSummaryUnreachable: "Alvo inacessível",
    cdnSummaryNoMatch: "Nenhuma correspondência de CDN confiável",
    cdnSummaryDetected: "CDN detectado",
    cdnConfidenceNa: "n/d",
    cdnNoProviderMatch: "Nenhum provedor correspondeu — IPs resolvidos",
    cdnInspectIpsHint:
      "Você pode inspecionar estes IPs na página de consulta de IP:",
    cdnTargetLabel: "Alvo",
    cdnHttpStatusLabel: "Status HTTP",
    cdnProviderLabel: "Provedor",
    cdnUnknown: "Desconhecido",
    cdnMatchedSignals: "Sinais correspondentes",
    cdnNoSignals: "Nenhum sinal explícito de CDN correspondeu.",
    cdnCnameChain: "Cadeia CNAME",
    cdnNoCname: "Nenhum registro CNAME foi encontrado.",
    cdnInterestingHeaders: "Cabeçalhos de resposta interessantes",
    cdnNoHeaders: "Nenhum cabeçalho relevante foi encontrado.",
    reputationTitle: "Verificação de reputação de IP",
    reputationSubtitle:
      "Verifique um endereço IP público em fontes independentes de reputação e inteligência de ameaças e obtenha uma avaliação de risco baseada em evidências.",
    reputationPlaceholder: "8.8.8.8 ou 2001:4860:4860::8888",
    reputationCheckButton: "Verificar reputação",
    reputationChecking: "Verificando...",
    reputationNetworkError:
      "Erro de rede ao contatar a verificação de reputação.",
    reputationRateLimitError:
      "Muitas verificações de reputação. Aguarde antes de tentar novamente.",
    reputationInvalidIp: "Digite um endereço IP público válido (IPv4 ou IPv6).",
    reputationBlockedIp:
      "Faixas de IP privadas, reservadas e internas não podem ser verificadas.",
    reputationEmptyTitle: "Digite um endereço IP para verificar a reputação",
    reputationEmptyDescription:
      "O IP é verificado em listas de bloqueio DNS, bancos de dados de relatos de abuso, rastreadores de C2 de botnets e fontes de classificação de rede. Provedores opcionais (AbuseIPDB, GreyNoise, http:BL, ThreatFox) são ativados quando uma chave gratuita de API é configurada.",
    reputationRiskLow: "Risco baixo",
    reputationRiskMedium: "Risco médio",
    reputationRiskHigh: "Risco alto",
    reputationHeadlineClean: "Nenhuma atividade maliciosa detectada",
    reputationScoreLabel: "Pontuação de risco",
    reputationSectionSummary: "Resumo da reputação",
    reputationSectionThreats: "Evidências de ameaça",
    reputationSectionMail: "Reputação de e-mail",
    reputationSectionNetwork: "Classificação da rede",
    reputationSectionSources: "Fontes",
    reputationSectionScore: "Como esta pontuação foi calculada",
    reputationCoverageChecked: "{count} fontes verificadas",
    reputationCoverageMatched: "{count} com evidências de ameaça",
    reputationCoveragePolicy: "{count} com informações de política ou contexto",
    reputationCoverageUnavailable: "{count} indisponíveis",
    reputationGeneratedAt: "Gerado em {time}",
    reputationNoThreatEvidence:
      "Nenhuma observação maliciosa direta foi encontrada nas fontes que puderam ser verificadas.",
    reputationNoMailEvidence:
      "Nenhuma listagem de reputação de e-mail foi encontrada nas fontes verificadas.",
    reputationFilterAll: "Todas",
    reputationNoEvidence:
      "Nenhuma evidência neste grupo nas fontes que puderam ser verificadas.",
    reputationFactChecked: "Verificada",
    reputationFactMatched: "Com evidências de ameaça",
    reputationFactUnavailable: "Indisponível",
    reputationFactCheckedAt: "Verificada em",
    reputationScoreCapped: "Limitada a partir de {count} pontos brutos",
    reputationConnectionLabel: "Conexão",
    reputationReverseLabel: "DNS reverso",
    reputationFieldSource: "Fonte",
    reputationFieldConfidence: "Confiança",
    reputationFieldFirstSeen: "Visto pela primeira vez",
    reputationFieldLastSeen: "Visto pela última vez",
    reputationFieldReports: "Relatos",
    reputationFieldAttacks: "Eventos de ataque",
    reputationFieldMalware: "Software malicioso",
    reputationFieldDetail: "Detalhe",
    reputationFieldReturnCode: "Código de retorno",
    reputationPointsLabel: "+{points} pontos",
    reputationCategories: {
      mail_policy: "Listagem de política de e-mail",
      mail_reputation: "Listagem de reputação de e-mail",
      spam_observed: "Atividade de spam observada",
      abuse_reported: "Abuso reportado",
      scanner: "Scanner de internet",
      bruteforce: "Ataques de força bruta",
      web_attack: "Ataques web",
      ddos: "Ataques DDoS / inundação",
      botnet: "Atividade de botnet",
      malware: "Infraestrutura de malware",
      proxy: "Proxy aberto",
      vpn: "VPN / anonimizador",
      tor: "Nó de saída Tor",
      hosting: "Hospedagem / datacenter",
      residential: "Rede residencial",
      mobile: "Rede móvel",
      benign_service: "Serviço empresarial conhecido",
    },
    reputationSeverities: {
      info: "Informação",
      low: "Baixa gravidade",
      medium: "Média gravidade",
      high: "Alta gravidade",
      critical: "Crítica",
    },
    reputationSourceStates: {
      available: "disponível",
      clean: "limpo",
      matched: "correspondente",
      policy_listed: "listado (política)",
      not_configured: "não configurado",
      unsupported: "não suportado",
      rate_limited: "limitado por taxa",
      resolver_blocked: "resolver bloqueado",
      unavailable: "indisponível",
    },
    reputationReasons: {
      sbl: "Listado no Spamhaus SBL: fontes verificadas de spam, serviços de spam ou remetentes de spam ROKSO (lista baseada em evidências e mantida editorialmente).",
      css: "Listado no Spamhaus CSS: detecção automatizada de envios de e-mail de alto volume ou em zona cinzenta. Evidência mais fraca que a do SBL.",
      xbl: "Listado no Spamhaus XBL: o host foi observado executando software de trojan/exploit ou um proxy aberto — normalmente uma máquina comprometida.",
      drop: "O endereço está em um bloco de rede Spamhaus DROP: faixas controladas por operações criminosas ou de hosting à prova de rastreamento, usadas para malware, controladores de botnet ou spam.",
      pbl_isp:
        "Listado no Spamhaus PBL (mantido pelo ISP): esta faixa não deve entregar e-mail SMTP diretamente a servidores de terceiros. Isso é normal para a maioria dos endereços residenciais, dinâmicos e de usuários finais e não é evidência de abuso.",
      pbl_spamhaus:
        "Listado no Spamhaus PBL (mantido pelo Spamhaus): uma faixa de política que não deve entregar e-mail diretamente. Normal para muitos endereços de usuários finais, sem evidência de abuso.",
      bcl: "Listado na Spamhaus Botnet Controller List: infraestrutura de comando e controle de botnet confirmada e ativa.",
      spamcop_listing:
        "Listado no SpamCop com base em relatos recentes de spam (armadilhas e evidências enviadas por usuários). As entradas expiram pouco depois do último relato.",
      barracuda_listing:
        "Reputação de e-mail ruim medida na rede de filtros da Barracuda. É um sinal agregado e parcialmente histórico que também pode afetar endereços reatribuídos dinamicamente; não prova que este endereço esteja enviando spam agora.",
      dronebl_irc_drone:
        "Observado pela rede DroneBL como drone de spam IRC (bot).",
      dronebl_bottler: "Observado pela rede DroneBL como bot IRC Bottler.",
      dronebl_worm:
        "Observado pela rede DroneBL executando um worm ou spambot.",
      dronebl_ddos_drone:
        "Observado como drone de DDoS (participa de ataques distribuídos).",
      dronebl_open_socks_proxy:
        "Observado executando um proxy SOCKS aberto — infraestrutura vulnerável a abuso, não necessariamente maliciosa por si só.",
      dronebl_open_http_proxy:
        "Observado executando um proxy HTTP aberto — infraestrutura vulnerável a abuso, não necessariamente maliciosa por si só.",
      dronebl_proxychain: "Observado como parte de uma cadeia de proxies.",
      dronebl_web_proxy: "Observado executando um proxy web aberto.",
      dronebl_dictionary:
        "Observado realizando ataques automatizados de dicionário (força bruta).",
      dronebl_wingate: "Observado executando um proxy WinGate aberto.",
      dronebl_compromised_router:
        "Observado como um roteador ou gateway comprometido.",
      dronebl_botnet_auto:
        "Classificado automaticamente pela DroneBL como infraestrutura de botnet (detecção experimental).",
      dronebl_compromised_host: "Possível host comprometido detectado via IRC.",
      dronebl_uncategorized:
        "Listado na DroneBL com uma classe de ameaça não categorizada.",
      bld_attack:
        "Relatos de ataques enviados por operadores de servidores afetados e coletados pelo blocklist.de. Uma entrada DNS ativa significa que ataques foram relatados recentemente.",
      bld_counts_only:
        "Relatos históricos de abuso registrados pelo blocklist.de; o endereço não está atualmente na zona DNS ativa.",
      feodo_c2_online:
        "Servidor de comando e controle de botnet atualmente ativo, verificado pelo Feodo Tracker (abuse.ch) por meio de uma resposta C2 válida.",
      feodo_c2_offline:
        "Servidor C2 de botnet rastreado pelo Feodo Tracker (abuse.ch); visto pela última vez nos últimos dias e mantido na blocklist.",
      greynoise_scanner_malicious:
        "Observado escaneando a internet nos últimos 90 dias e classificado como malicioso pelo GreyNoise.",
      greynoise_scanner_unknown:
        "Observado escaneando a internet nos últimos 90 dias; o GreyNoise não conseguiu classificar a atividade.",
      greynoise_scanner_benign:
        "Observado escaneando a internet, mas classificado como benigno pelo GreyNoise, por exemplo, um projeto de pesquisa.",
      greynoise_riot:
        "Serviço empresarial comum e conhecido no conjunto de dados GreyNoise RIOT, por exemplo uma CDN ou empresa de segurança.",
      abuseipdb_reports:
        "Relatos de abuso enviados por usuários do AbuseIPDB nos últimos 90 dias. A pontuação de confiança reflete o volume e a consistência dos relatos.",
      abuseipdb_tor: "Identificado pelo AbuseIPDB como nó de saída Tor.",
      threatfox_ioc:
        "Publicado como indicador de ameaça (IOC) no banco de dados abuse.ch ThreatFox, compartilhado por pesquisadores de segurança.",
      httpbl_search_engine:
        "Rastreador conhecido de mecanismo de busca (Project Honey Pot).",
      httpbl_suspicious:
        "Visitante web suspeito observado na rede de honeypots do Project Honey Pot. Muitas vezes são robôs inofensivos; avalie com cuidado.",
      httpbl_harvester:
        "Observado coletando endereços de e-mail de honeypots na rede do Project Honey Pot.",
      httpbl_comment_spammer:
        "Observado publicando spam em comentários nos honeypots da rede do Project Honey Pot.",
      ipapi_vpn:
        "Sinalizado pelo ip-api.com como serviço de VPN, proxy ou anonimizador.",
      ipapi_hosting:
        "Sinalizado pelo ip-api.com como endereço de hospedagem ou datacenter.",
      ipapi_mobile:
        "Identificado pelo ip-api.com como conexão móvel ou celular.",
      residential_estimate:
        "Conexão residencial estimada pelo tipo de conexão e pela nomenclatura de DNS reverso — uma heurística, sem confirmação do provedor.",
      corroboration:
        "Várias fontes independentes relatam atividade maliciosa para este endereço.",
      mail_corroboration:
        "Várias listas independentes de reputação de e-mail contêm este endereço.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "DNSBL combinado da Spamhaus: SBL (fontes verificadas de spam), CSS (detecção automatizada de remetentes de spam), XBL (hosts explorados), PBL (faixas de política de e-mail) e BCL (controladores de botnet).",
      "spamhaus-drop":
        "Feed gratuito da Spamhaus com blocos de rede inteiros controlados por operações criminosas ou de hosting à prova de rastreamento. Verificado localmente a partir de uma cópia em cache atualizada por hora.",
      spamcop:
        "Lista de bloqueio de e-mail construída a partir de armadilhas de spam e relatos de usuários. As entradas têm curta duração e refletem o comportamento de envio recente.",
      barracuda:
        "Pontuações de reputação de e-mail medidas na rede de filtros de spam da Barracuda Networks. Sinal agregado e parcialmente histórico.",
      dronebl:
        "DNSBL operada pelo projeto DroneBL, com drones, hosts comprometidos, participantes de DDoS e proxies abertos observados por redes IRC e de monitoramento. Gratuita para uso comercial e não comercial.",
      "blocklist-de":
        "Plataforma alemã de relatos de abuso que coleta relatos de ataques (força bruta SSH, ataques de e-mail, varreduras web, ...) de operadores de servidores afetados.",
      "feodo-tracker":
        "Rastreador do abuse.ch para servidores C2 de botnet (Dridex, Emotet, TrickBot, QakBot, BazarLoader). As entradas exigem uma resposta C2 válida observada. Verificado localmente a partir de um feed em cache.",
      greynoise:
        "Inteligência sobre scanners de internet. A API da comunidade informa se um endereço foi observado escaneando recentemente e como ele foi classificado.",
      abuseipdb:
        "Banco de dados de relatos de abuso colaborativo com pontuação de confiança. Requer uma chave gratuita de API (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL do Project Honey Pot para abuso na web: coletores de endereços, spammers de comentários e bots suspeitos. Requer uma chave gratuita de acesso (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Plataforma do abuse.ch para compartilhar indicadores de comprometimento, incluindo endereços C2 de botnet. Requer uma Auth-Key gratuita (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Metadados de IP: geolocalização, rede/ASN e flags de classificação da conexão.",
    },
    reputationGeoLabel: "Geolocalização",
    reputationNetworkLabel: "ASN / provedor",
    reputationShowHiddenSources: "Mostrar fontes não configuradas ({count})",
    reputationHideHiddenSources: "Ocultar fontes não configuradas",
  },
  "pt-PT": {
    errorRateLimited:
      "Demasiados pedidos. Aguarde um momento e tente novamente.",
    errorInvalidTarget:
      "Indique um domínio público, endereço IP ou URL válido.",
    errorTargetBlocked:
      "Não é possível verificar alvos privados, locais ou internos neste site público.",
    errorTimeout:
      "A verificação expirou. O alvo pode estar lento ou inacessível.",
    errorUpstream:
      "Um fornecedor de dados a montante está atualmente indisponível.",
    errorBadRequest: "Os parâmetros do pedido são inválidos.",
    errorTargetNetwork: "Não foi possível resolver ou contactar o alvo.",
    showAll: "Mostrar tudo",
    showLess: "Mostrar menos",
    navOverview: "Panorama",
    navDiagnostics: "Diagnóstico",
    navMyIp: "O meu IP",
    brandTagline: "Conjunto de ferramentas de rede e IP",
    themeToggle: "Alternar o tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema",
    navMenu: "Menu de navegação",
    skipToContent: "Saltar para o conteúdo",
    navToolsLabel: "Ferramentas",
    sidebarLabel: "Navegação do site",
    navClose: "Fechar o menu",
    copyValue: "Copiar",
    downloadJson: "Transferir JSON",
    cancelLookup: "Cancelar",
    whoisNoteIana:
      "Não foi encontrado nenhum servidor de referência. A mostrar a resposta WHOIS da IANA.",
    whoisNoteRdap:
      "O WHOIS estava indisponível. A mostrar os dados de registo RDAP.",
    commandTriggerLabel: "Pesquisar…",
    commandPlaceholder:
      "Pesquisar ferramentas ou introduza um IP, domínio ou ASN…",
    commandGroupActions: "Ações",
    commandGroupPages: "Ir para",
    commandEmpty: "Não existem ferramentas ou ações correspondentes.",
    commandHintNavigate: "Navegar",
    commandHintSelect: "Abrir",
    commandHintClose: "Fechar",
    notFoundTitle: "Página não encontrada",
    notFoundDescription:
      "Este endereço não pertence a nenhuma ferramenta. Regresse à página inicial ou utilize a pesquisa (Ctrl+K).",
    notFoundBackHome: "Regressar à página inicial",
    errorTitle: "Ocorreu um problema",
    errorDescription:
      "Não foi possível carregar esta página. Tente novamente — se a falha persistir, a causa é nossa.",
    errorRetry: "Tentar novamente",
    asnRpkiValid: "RPKI válido",
    asnRpkiInvalid: "RPKI inválido",
    asnRpkiStatus: "RPKI: {status}",
    cdnConfidenceHigh: "Elevada",
    cdnConfidenceMedium: "Média",
    cdnConfidenceLow: "Baixa",
    pingTabLabel: "Testador de ping",
    dnsTabLabel: "Pesquisa de DNS",
    whoisTabLabel: "Pesquisa de WHOIS",
    cdnTabLabel: "Verificador de CDN",
    asnTabLabel: "Pesquisa de ASN",
    reputationTabLabel: "Reputação do IP",
    pingTitle: "Testador de ping e portas",
    pingSubtitle:
      "Testes orientados para portas TCP/UDP, pontos terminais EB e conectividade de bases de dados, num fluxo de teste mais simples.",
    dnsTitle: "Pesquisa de DNS",
    dnsSubtitle:
      "Pesquise registos DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) de domínios e faça pesquisas DNS inversas de endereços IP.",
    whoisTitle: "Pesquisa de WHOIS",
    whoisSubtitle:
      "Pesquise registos WHOIS de domínios e endereços IP diretamente nesta aplicação.",
    cdnTitle: "Verificador de utilização de CDN",
    cdnSubtitle:
      "Analise qualquer domínio para identificar a utilização de CDN e o fornecedor provável, incluindo CloudFront, Google Cloud CDN, Azure CDN, Vercel e outros.",
    asnTitle: "Informação sobre ASN",
    asnSubtitle:
      "Pesquise sistemas autónomos com detalhes de ASN da IPinfo e dados públicos de interligação do PeeringDB.",
    asnPlaceholder: "AS8881 ou 8881",
    asnLookupButton: "Pesquisar ASN",
    asnLookingUp: "A pesquisar...",
    asnInvalidInput:
      "Utilize um ASN com prefixo AS ou numérico, por exemplo AS8881 ou 8881.",
    asnInvalidRange: "O ASN tem de estar entre 1 e {max}.",
    asnNetworkError: "Ocorreu um erro de rede ao contactar a pesquisa de ASN.",
    asnUpstreamError:
      "Os fornecedores de dados de ASN estão atualmente indisponíveis.",
    asnRateLimitError:
      "Demasiadas pesquisas de ASN. Aguarde antes de tentar novamente.",
    asnEmptyTitle: "Introduza um ASN para analisar um perfil de rede",
    asnEmptyDescription:
      "Introduza um valor com prefixo AS ou apenas numérico. Os dados dos fornecedores podem estar incompletos, consoante os registos públicos e o plano IPinfo configurado.",
    dnsEmptyTitle: "Introduza um domínio para resolver os seus registos DNS",
    dnsEmptyDescription:
      "Pesquise registos A, AAAA, MX, TXT, NS, SOA, SRV e CAA ou faça uma pesquisa inversa num endereço IP.",
    whoisEmptyTitle:
      "Introduza um domínio ou endereço IP para pesquisar o WHOIS",
    whoisEmptyDescription:
      "Obtenha o registador, as datas de registo, o estado e os servidores de nomes junto do servidor WHOIS responsável.",
    cdnEmptyTitle: "Introduza um domínio para detetar o respetivo CDN",
    cdnEmptyDescription:
      "Inspecione o DNS, as cadeias CNAME e os cabeçalhos de resposta para identificar o CDN ou fornecedor de edge à frente do site.",
    asnNotFoundTitle: "Não foi encontrado nenhum perfil de ASN",
    asnNotFoundDescription:
      "O ASN é válido, mas nenhuma fonte configurada devolveu um perfil público utilizável.",
    asnPartialData: "Dados parciais",
    asnCompleteData: "Completos",
    asnPrefixes: "Prefixos anunciados",
    asnRouting: "Relações de encaminhamento",
    asnPeeringDb: "Perfil do PeeringDB",
    asnIxPresence: "Presença em IX",
    asnFacilities: "Presença em instalações",
    asnSourceDiagnostics: "Diagnóstico das fontes",
    asnDetailedDiagnostics: "Diagnóstico detalhado",
    asnUnnamed: "AS sem nome",
    asnRoutingDescription:
      "Interligações, vizinhos e pesos dos caminhos do sistema autónomo. Pesos mais elevados indicam caminhos de encaminhamento observados com maior frequência.",
    asnIxDescription:
      "Pontos de troca na Internet (IX) onde este sistema autónomo está presente, incluindo a largura de banda das interligações.",
    asnPrefixesDescription:
      "Blocos de IP anunciados por este sistema autónomo na tabela de encaminhamento global.",
    asnPeeringDbDescription:
      "Perfil de interligação e políticas de encaminhamento declarados na base de dados pública do PeeringDB.",
    asnFacilitiesDescription:
      "Centros de dados físicos e instalações de alojamento onde esta rede está presente.",
    asnProfileIdentityHeading: "Identidade e estado",
    asnProfileInterconnectionHeading: "Detalhes das interligações",
    asnProfilePolicyHeading: "Política de peering",
    asnProfileExternalHeading: "Perfis externos",
    asnProfilePrefixes4: "Prefixos IPv4",
    asnProfilePrefixes6: "Prefixos IPv6",
    asnWarnings: "Avisos",
    asnDiagnosticDuration: "Duração",
    asnDiagnosticCache: "Armazenamento em cache",
    asnDiagnosticWarnings: "Avisos",
    asnDiagnosticSource: "Origem",
    asnSourceDiagnosticsDescription:
      "Disponibilidade dos fornecedores, duração do pedido e estado da cache desta pesquisa.",
    asnCacheMiss: "não encontrado",
    asnCacheFresh: "fresco",
    asnCacheStale: "obsoleto",
    asnCacheNotConfigured: "não configurado",
    asnNoPrefixes: "As fontes configuradas não devolveram prefixos.",
    asnNoRelations:
      "As fontes configuradas não devolveram relações de encaminhamento.",
    asnMetricIpv4Addresses: "Endereços IPv4",
    asnMetricRoutingNeighbours: "Vizinhos de encaminhamento",
    asnMetricIxPresence: "Presença em IX",
    asnMetricIpinfoDetail: "Dados de ASN da IPinfo, quando configurados",
    asnMetricAnnouncedPrefixesDetail: "Prefixos anunciados",
    asnMetricBgpRelationshipsDetail: "Relações BGP da IPinfo ou do RIPEstat",
    asnMetricPeeringDbProfileDetail: "Perfil de rede do PeeringDB",
    asnPrefixIpCount: "Endereços IP",
    asnRelationPeers: "Pares",
    asnRelationUpstreams: "Encaminhamento a montante",
    asnRelationDownstreams: "Encaminhamento a jusante",
    asnRelationPower: "peso",
    asnSourceAvailable: "disponível",
    asnSourceUnavailable: "indisponível",
    asnSourceNotConfigured: "não configurado",
    asnSourceError: "erro",
    asnLabelName: "Nome",
    asnLabelCountry: "País",
    asnLabelAllocated: "Atribuído",
    asnLabelNetworkId: "ID da rede",
    asnLabelAlsoKnownAs: "Também conhecido como",
    asnLabelWebsite: "Site",
    asnLabelLookingGlass: "Looking Glass",
    asnLabelRouteServer: "Servidor de rotas",
    asnLabelTraffic: "Tráfego",
    asnLabelPolicyGeneral: "Política geral",
    asnLabelPolicyLocations: "Localizações da política",
    asnLabelPolicyRatio: "Rácio da política",
    asnLabelPolicyContracts: "Contratos da política",
    asnLabelStatus: "Estado",
    asnLabelExchange: "Troca",
    asnLabelSpeed: "Velocidade",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "Peer RS",
    asnLabelFacility: "Instalação",
    asnLabelCity: "Cidade",
    asnLabelLocalAsn: "ASN local",
    asnSortTable: "Tabela ordenável",
    asnSortBy: "Ordenar por {column}",
    asnSortNotSorted: "sem ordenação",
    asnSortAscending: "ascendente",
    asnSortDescending: "descendente",
    asnBooleanYes: "sim",
    asnBooleanNo: "não",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "Não foram devolvidos registos de IX LAN.",
    asnNoFacilityRecords: "Não foram devolvidos registos de instalações.",
    asnWarningIpinfoUnavailable:
      "Os dados de ASN da IPinfo não estão disponíveis para este ASN ou plano do token.",
    asnWarningIpinfoUnexpected:
      "A IPinfo devolveu um payload de ASN inesperado.",
    asnWarningNoRipeStatData:
      "Não foram encontrados dados de ASN no RIPEstat para este ASN.",
    asnWarningNoPeeringDbProfile:
      "Não foi encontrado um perfil de rede público do PeeringDB para este ASN.",
    asnWarningProviderHttp: "{provider} devolveu HTTP {status}.",
    asnWarningProviderTimedOut: "O pedido a {provider} expirou.",
    asnWarningProviderTooLarge:
      "A resposta de {provider} excedeu o limite de tamanho.",
    asnWarningProviderInvalidJson: "{provider} devolveu JSON inválido.",
    asnWarningProviderUnavailable:
      "Os dados de {provider} estão atualmente indisponíveis.",
    asnWarningProviderStale:
      "Os dados de {provider} estão atualmente indisponíveis; a utilizar dados desatualizados da cache.",
    asnWarningTruncated:
      "Os dados de {label} foram truncados para {limit} de {total} registos.",
    asnWarningLabelIpinfoIpv4Prefixes: "Prefixos IPv4 da IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Prefixos IPv6 da IPinfo",
    asnWarningLabelIpinfoPeers: "Peers da IPinfo",
    asnWarningLabelIpinfoUpstreams: "Upstreams da IPinfo",
    asnWarningLabelIpinfoDownstreams: "Downstreams da IPinfo",
    asnWarningLabelPeeringDbIxLan: "Registos de IX LAN do PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Instalações do PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Prefixos IPv4 do RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Prefixos IPv6 do RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours:
      "Vizinhos de encaminhamento do RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Vizinhos do lado a montante do RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Vizinhos do lado a jusante do RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "A pesquisar...",
    dnsLookupButton: "Pesquisar DNS",
    dnsLookupError: "A pesquisa de DNS falhou.",
    dnsRecordsFor: "Registos DNS de",
    resolvedAddresses: "Endereços resolvidos",
    noAddressResult: "Não foi encontrado nenhum resultado A/AAAA.",
    recordDetails: "Detalhes do registo",
    dnsRecordNotes: "Notas da pesquisa de registos",
    dnsTableType: "Tipo",
    dnsTableValue: "Valor",
    dnsShowRaw: "Mostrar JSON bruto",
    dnsHideRaw: "Ocultar JSON bruto",
    dnsNoRecords: "Não foram devolvidos registos do tipo selecionado.",
    whoisPlaceholder: "example.com ou 8.8.8.8",
    whoisLookupButton: "Pesquisar WHOIS",
    whoisLookupError: "A pesquisa de WHOIS falhou.",
    whoisFor: "WHOIS de",
    queriedServer: "Servidor consultado",
    referralSource: "Origem do encaminhamento",
    noWhoisData: "Não foram devolvidos dados WHOIS.",
    whoisRegistrar: "Registador",
    whoisCreated: "Criado",
    whoisUpdated: "Atualizado",
    whoisExpires: "Expira",
    whoisStatusLabel: "Estado",
    whoisNameservers: "Servidores de nomes",
    whoisShowRaw: "Mostrar resultado bruto",
    whoisHideRaw: "Ocultar resultado bruto",
    pingTestMode: "Modo de teste",
    pingModeHelperTcp: "Verifica se a porta TCP aceita uma ligação.",
    pingModeHelperUdp:
      "Envia uma sonda UDP e comunica a resposta ou o erro imediato.",
    pingModeHelperEb:
      "Verifica primeiro o TCP e depois a acessibilidade dos pontos terminais HTTP/HTTPS.",
    pingModeHelperDatabase:
      "Executa verificações do protocolo antes da autenticação e verificações autenticadas opcionais.",
    pingModeDatabase: "Base de dados",
    pingDatabaseType: "Tipo de base de dados",
    pingTargetHost: "Anfitrião de destino / IP",
    pingPort: "Porta",
    pingTimeout: "Tempo limite (ms)",
    pingUseAuth: "Verificar com autenticação",
    pingUsername: "Nome de utilizador",
    pingPassword: "Palavra-passe",
    pingDatabaseOptional: "Base de dados (opcional)",
    pingRunButton: "Executar teste de ping",
    pingRunning: "A executar a verificação...",
    pingNetworkError: "Ocorreu um erro de rede ao contactar /api/ping.",
    pingModeLabel: "Modo",
    pingLatencyLabel: "Latência",
    pingTargetLabel: "Alvo",
    pingDetailsLabel: "Detalhes",
    pingEmptyTitle: "Ainda não foi executado nenhum teste",
    pingEmptyDescription:
      "Escolha um modo de teste, introduza um anfitrião e uma porta e execute a verificação para medir a acessibilidade e a latência.",
    pingStatusSuccess: "Alvo acessível",
    pingStatusFailed: "Falha na verificação",
    pingShowDetails: "Mostrar detalhes técnicos",
    pingHideDetails: "Ocultar detalhes técnicos",
    pingResultTcpOk: "Ligação TCP estabelecida.",
    pingResultTcpTimeout: "Tempo limite de TCP após {timeoutMs} ms.",
    pingResultTcpFailed: "Falha na ligação TCP: {error}",
    pingResultUdpSent:
      "Pacote UDP enviado. Não foi observado nenhum erro ICMP em {timeoutMs} ms.",
    pingResultUdpResponse: "Resposta UDP recebida de {from} ({bytes} bytes).",
    pingResultUdpFailed: "Falha na sonda UDP: {error}",
    pingResultEbHttpOk:
      "Ponto terminal acessível via {scheme} (estado {status}).",
    pingResultEbNoHttp:
      "TCP está aberto, mas não foi detetada qualquer resposta HTTP(S) neste ponto terminal.",
    pingResultEbTcpFailed: "A verificação EB falhou na fase TCP: {error}",
    pingResultDbConnectFailed: "A conectividade com {database} falhou: {error}",
    pingResultDbProtocolOk:
      "O servidor {database} respondeu a uma sonda de aperto de mãos pré-autenticação.",
    pingResultDbProtocolFailed: "A sonda {database} falhou: {error}",
    pingResultDbTcpOk:
      "A porta TCP de {database} está acessível. Não existe sonda de protocolo pré-autenticação para este tipo.",
    pingResultDbAuthUnsupported:
      "As verificações autenticadas só estão implementadas para o Redis. Utilize a verificação do protocolo para {database}.",
    pingResultDbAuthOk: "A ligação Redis autenticada foi bem-sucedida.",
    pingResultDbAuthFailed:
      "A verificação de autenticação do Redis falhou: {error}",
    cdnAnalyzeButton: "Verificar CDN",
    cdnAnalyzing: "A analisar...",
    cdnNetworkError:
      "Ocorreu um erro de rede ao contactar o verificador de CDN.",
    cdnSummaryUnreachable: "Alvo inacessível",
    cdnSummaryNoMatch: "Sem correspondência de CDN fiável",
    cdnSummaryDetected: "CDN detetado",
    cdnConfidenceNa: "n/d",
    cdnNoProviderMatch:
      "Nenhum fornecedor correspondeu — endereços IP resolvidos",
    cdnInspectIpsHint:
      "Pode inspecionar estes IPs na página de pesquisa de IP:",
    cdnTargetLabel: "Alvo",
    cdnHttpStatusLabel: "Estado HTTP",
    cdnProviderLabel: "Fornecedor",
    cdnUnknown: "Desconhecido",
    cdnMatchedSignals: "Sinais correspondentes",
    cdnNoSignals:
      "Não foi encontrado nenhum sinal explícito de CDN correspondente.",
    cdnCnameChain: "Cadeia CNAME",
    cdnNoCname: "Não foram encontrados registos CNAME.",
    cdnInterestingHeaders: "Cabeçalhos de resposta interessantes",
    cdnNoHeaders: "Não foram encontrados cabeçalhos relevantes.",
    reputationTitle: "Verificação da reputação do IP",
    reputationSubtitle:
      "Verifique um endereço IP público face a fontes independentes de reputação e inteligência de ameaças e obtenha uma avaliação de risco baseada em evidências.",
    reputationPlaceholder: "8.8.8.8 ou 2001:4860:4860::8888",
    reputationCheckButton: "Verificar reputação",
    reputationChecking: "A verificar...",
    reputationNetworkError:
      "Ocorreu um erro de rede ao contactar a verificação de reputação.",
    reputationRateLimitError:
      "Demasiadas verificações de reputação. Aguarde antes de tentar novamente.",
    reputationInvalidIp:
      "Introduza um endereço IP público válido (IPv4 ou IPv6).",
    reputationBlockedIp:
      "Os intervalos de IP privados, reservados e internos não podem ser verificados.",
    reputationEmptyTitle:
      "Introduza um endereço IP para verificar a respetiva reputação",
    reputationEmptyDescription:
      "O IP é verificado face a listas de bloqueio DNS, bases de dados de participações de abuso, rastreadores de C2 de botnets e fontes de classificação de rede. Os fornecedores opcionais (AbuseIPDB, GreyNoise, http:BL, ThreatFox) são ativados quando é configurada uma chave API gratuita.",
    reputationRiskLow: "Risco baixo",
    reputationRiskMedium: "Risco médio",
    reputationRiskHigh: "Risco elevado",
    reputationHeadlineClean: "Não foi detetada qualquer atividade maliciosa",
    reputationScoreLabel: "Pontuação de risco",
    reputationSectionSummary: "Resumo da reputação",
    reputationSectionThreats: "Provas de ameaça",
    reputationSectionMail: "Reputação do correio eletrónico",
    reputationSectionNetwork: "Classificação da rede",
    reputationSectionSources: "Fontes",
    reputationSectionScore: "Como foi calculada esta pontuação",
    reputationCoverageChecked: "{count} fontes verificadas",
    reputationCoverageMatched: "{count} com provas de ameaça",
    reputationCoveragePolicy: "{count} com informação de política ou contexto",
    reputationCoverageUnavailable: "{count} indisponíveis",
    reputationGeneratedAt: "Gerado em {time}",
    reputationNoThreatEvidence:
      "Não foram encontradas observações maliciosas diretas nas fontes que puderam ser verificadas.",
    reputationNoMailEvidence:
      "Não foram encontradas listagens de reputação de correio eletrónico nas fontes verificadas.",
    reputationFilterAll: "Todas",
    reputationNoEvidence:
      "Não existem provas neste grupo nas fontes que puderam ser verificadas.",
    reputationFactChecked: "Verificada",
    reputationFactMatched: "Com provas de ameaça",
    reputationFactUnavailable: "Indisponível",
    reputationFactCheckedAt: "Verificada em",
    reputationScoreCapped: "Limitada a partir de {count} pontos brutos",
    reputationConnectionLabel: "Ligação",
    reputationReverseLabel: "DNS inverso",
    reputationFieldSource: "Origem",
    reputationFieldConfidence: "Confiança",
    reputationFieldFirstSeen: "Visto pela primeira vez",
    reputationFieldLastSeen: "Visto pela última vez",
    reputationFieldReports: "Participações",
    reputationFieldAttacks: "Eventos de ataque",
    reputationFieldMalware: "Software malicioso",
    reputationFieldDetail: "Detalhe",
    reputationFieldReturnCode: "Código de retorno",
    reputationPointsLabel: "+{points} pontos",
    reputationCategories: {
      mail_policy: "Listagem de política de correio",
      mail_reputation: "Listagem de reputação de correio eletrónico",
      spam_observed: "Atividade de spam observada",
      abuse_reported: "Abuso comunicado",
      scanner: "Scanner de internet",
      bruteforce: "Ataques de força bruta",
      web_attack: "Ataques web",
      ddos: "Ataques DDoS / inundação",
      botnet: "Atividade de botnet",
      malware: "Infraestrutura de malware",
      proxy: "Proxy aberto",
      vpn: "VPN / anonimizador",
      tor: "Nó de saída Tor",
      hosting: "Alojamento / centro de dados",
      residential: "Rede residencial",
      mobile: "Rede móvel",
      benign_service: "Serviço empresarial conhecido",
    },
    reputationSeverities: {
      info: "Informação",
      low: "Baixa gravidade",
      medium: "Média gravidade",
      high: "Alta gravidade",
      critical: "Crítica",
    },
    reputationSourceStates: {
      available: "disponível",
      clean: "limpo",
      matched: "correspondente",
      policy_listed: "listado (política)",
      not_configured: "não configurado",
      unsupported: "não suportado",
      rate_limited: "limitado pela taxa",
      resolver_blocked: "resolver bloqueado",
      unavailable: "indisponível",
    },
    reputationReasons: {
      sbl: "Indicado no Spamhaus SBL: fontes de spam verificadas, serviços de spam ou remitentes de spam ROKSO (lista baseada em evidências e mantida editorialmente).",
      css: "Indicado no Spamhaus CSS: deteção automática de envios de correio de grande volume ou em zona cinzenta. Evidência mais fraca do que a do SBL.",
      xbl: "Indicado no Spamhaus XBL: o anfitrião foi observado a executar software de cavalo de Troia/exploit ou um proxy aberto — normalmente uma máquina comprometida.",
      drop: "O endereço encontra-se num bloco de rede Spamhaus DROP: faixas controladas por operações criminosas ou de alojamento à prova de rastreio, utilizadas para malware, controladores de botnets ou spam.",
      pbl_isp:
        "Indicado no Spamhaus PBL (mantido pelo ISP): esta faixa não deve entregar diretamente correio SMTP a servidores de terceiros. É normal para a maioria dos endereços residenciais, dinâmicos e de utilizadores finais e não é prova de abuso.",
      pbl_spamhaus:
        "Indicado no Spamhaus PBL (mantido pela Spamhaus): uma faixa de política que não deve entregar correio diretamente. É normal para muitos endereços de utilizadores finais e não é prova de abuso.",
      bcl: "Indicado na Spamhaus Botnet Controller List: infraestrutura de comando e controlo de botnets confirmada e ativa.",
      spamcop_listing:
        "Indicado no SpamCop com base em participações recentes de spam (armadilhas e evidências submetidas por utilizadores). As entradas expiram pouco depois da última participação.",
      barracuda_listing:
        "Reputação de correio fraca medida na rede de filtros da Barracuda. É um sinal agregado e parcialmente histórico que também pode afetar endereços reatribuídos dinamicamente; não prova que este endereço esteja a enviar spam neste momento.",
      dronebl_irc_drone:
        "Observado pela rede DroneBL como drone de spam IRC (bot).",
      dronebl_bottler: "Observado pela rede DroneBL como bot IRC Bottler.",
      dronebl_worm:
        "Observado pela rede DroneBL a executar um worm ou spambot.",
      dronebl_ddos_drone:
        "Observado como drone de DDoS (participa em ataques distribuídos).",
      dronebl_open_socks_proxy:
        "Observado a executar um proxy SOCKS aberto — infraestrutura que pode ser abusada, mas que não é necessariamente maliciosa por si só.",
      dronebl_open_http_proxy:
        "Observado a executar um proxy HTTP aberto — infraestrutura que pode ser abusada, mas que não é necessariamente maliciosa por si só.",
      dronebl_proxychain: "Observado como parte de uma cadeia de proxies.",
      dronebl_web_proxy: "Observado a executar um proxy web aberto.",
      dronebl_dictionary:
        "Observado a realizar ataques automatizados de dicionário (força bruta).",
      dronebl_wingate: "Observado a executar um proxy WinGate aberto.",
      dronebl_compromised_router:
        "Observado como um router ou gateway comprometido.",
      dronebl_botnet_auto:
        "Classificado automaticamente pela DroneBL como infraestrutura de botnets (deteção experimental).",
      dronebl_compromised_host:
        "Possível anfitrião comprometido detetado via IRC.",
      dronebl_uncategorized:
        "Indicado na DroneBL com uma classe de ameaça não categorizada.",
      bld_attack:
        "Participações de ataque submetidas por operadores de servidores afetados e recolhidas pelo blocklist.de. Uma entrada DNS ativa significa que houve relatos de ataques recentemente.",
      bld_counts_only:
        "Participações históricas de abuso registadas pelo blocklist.de; o endereço não está atualmente na zona DNS ativa.",
      feodo_c2_online:
        "Servidor de comando e controlo de botnets atualmente ativo, verificado pelo Feodo Tracker (abuse.ch) através de uma resposta C2 válida.",
      feodo_c2_offline:
        "Servidor C2 de botnets seguido pelo Feodo Tracker (abuse.ch); visto pela última vez nos últimos dias e mantido na lista de bloqueio.",
      greynoise_scanner_malicious:
        "Observado a analisar a Internet nos últimos 90 dias e classificado como malicioso pelo GreyNoise.",
      greynoise_scanner_unknown:
        "Observado a analisar a Internet nos últimos 90 dias; o GreyNoise não conseguiu classificar a atividade.",
      greynoise_scanner_benign:
        "Observado a analisar a Internet, mas classificado como benigno pelo GreyNoise, por exemplo, um projeto de investigação.",
      greynoise_riot:
        "Serviço empresarial comum e conhecido no conjunto de dados GreyNoise RIOT, por exemplo uma CDN ou uma empresa de segurança.",
      abuseipdb_reports:
        "Participações de abuso submetidas por utilizadores do AbuseIPDB nos últimos 90 dias. A pontuação de confiança reflete o volume e a consistência das participações.",
      abuseipdb_tor: "Identificado pelo AbuseIPDB como nó de saída Tor.",
      threatfox_ioc:
        "Publicado como indicador de ameaça (IOC) na base de dados abuse.ch ThreatFox, partilhado por investigadores de segurança.",
      httpbl_search_engine:
        "Rastreador conhecido de motores de pesquisa (Project Honey Pot).",
      httpbl_suspicious:
        "Visitante web suspeito observado na rede de honeypots do Project Honey Pot. Muitas vezes são robôs inofensivos; avalie com cuidado.",
      httpbl_harvester:
        "Observado a recolher endereços de correio eletrónico de honeypots na rede do Project Honey Pot.",
      httpbl_comment_spammer:
        "Observado a publicar spam em comentários nos honeypots da rede do Project Honey Pot.",
      ipapi_vpn:
        "Sinalizado pelo ip-api.com como serviço de VPN, proxy ou anonimizador.",
      ipapi_hosting:
        "Sinalizado pelo ip-api.com como endereço de alojamento ou centro de dados.",
      ipapi_mobile:
        "Identificado pelo ip-api.com como ligação móvel ou celular.",
      residential_estimate:
        "Ligação residencial estimada pelo tipo de ligação e pela nomenclatura de DNS inverso — uma heurística, sem confirmação do fornecedor.",
      corroboration:
        "Várias fontes independentes comunicam atividade maliciosa para este endereço.",
      mail_corroboration:
        "Várias listas independentes de reputação de correio eletrónico contêm este endereço.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "DNSBL combinado da Spamhaus: SBL (fontes de spam verificadas), CSS (deteção automática de remetentes de spam), XBL (anfitriões explorados), PBL (faixas de política de correio) e BCL (controladores de botnets).",
      "spamhaus-drop":
        "Feed gratuito da Spamhaus com blocos de rede inteiros controlados por operações criminosas ou de alojamento à prova de rastreio. Verificado localmente a partir de uma cópia em cache atualizada de hora a hora.",
      spamcop:
        "Lista de bloqueio de correio construída a partir de armadilhas de spam e participações de utilizadores. As entradas têm curta duração e refletem o comportamento de envio recente.",
      barracuda:
        "Pontuações de reputação de correio medidas na rede de filtros de spam da Barracuda Networks. Sinal agregado e parcialmente histórico.",
      dronebl:
        "DNSBL operada pelo projeto DroneBL, com drones, anfitriões comprometidos, participantes de DDoS e proxies abertos observados por redes IRC e de monitorização. Gratuita para utilização comercial e não comercial.",
      "blocklist-de":
        "Plataforma alemã de participações de abuso que recolhe relatos de ataques (força bruta SSH, ataques de correio, análise de páginas web, ...) de operadores de servidores afetados.",
      "feodo-tracker":
        "Feed do abuse.ch para servidores C2 de botnets (Dridex, Emotet, TrickBot, QakBot, BazarLoader). As entradas exigem uma resposta C2 válida observada. Verificado localmente a partir de um feed em cache.",
      greynoise:
        "Inteligência sobre scanners de Internet. A API da comunidade comunica se um endereço foi observado a analisar recentemente e como foi classificado.",
      abuseipdb:
        "Base de dados colaborativa de participações de abuso com pontuação de confiança. Requer uma chave API gratuita (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL do Project Honey Pot para abuso na Web: coletores de endereços, spammers de comentários e bots suspeitos. Requer uma chave de acesso gratuita (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Plataforma do abuse.ch para partilhar indicadores de compromisso, incluindo endereços C2 de botnets. Requer uma Auth-Key gratuita (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Metadados de IP: geolocalização, rede/ASN e flags de classificação da ligação.",
    },
    reputationGeoLabel: "Geolocalização",
    reputationNetworkLabel: "ASN / fornecedor",
    reputationShowHiddenSources: "Mostrar fontes não configuradas ({count})",
    reputationHideHiddenSources: "Ocultar fontes não configuradas",
  },
  ja: {
    errorRateLimited:
      "リクエストが多すぎます。しばらく待ってから再試行してください。",
    errorInvalidTarget:
      "有効な公開ドメイン、IP アドレス、または URL を入力してください。",
    errorTargetBlocked:
      "この公開サイトでは、プライベート、ローカル、内部宛先のターゲットを確認できません。",
    errorTimeout:
      "チェックがタイムアウトしました。ターゲットが遅い、または到達できない可能性があります。",
    errorUpstream: "上流のデータプロバイダーは現在利用できません。",
    errorBadRequest: "リクエストパラメータが無効です。",
    errorTargetNetwork: "ターゲットを解決または到達できませんでした。",
    showAll: "すべて表示",
    showLess: "表示を減らす",
    navOverview: "概要",
    navDiagnostics: "診断",
    navMyIp: "マイ IP",
    brandTagline: "ネットワーク・IP ツールキット",
    themeToggle: "テーマを切り替える",
    themeLight: "ライト",
    themeDark: "ダーク",
    themeSystem: "システム",
    navMenu: "メニュー",
    skipToContent: "コンテンツへ移動",
    navToolsLabel: "ツール",
    sidebarLabel: "サイトナビゲーション",
    navClose: "メニューを閉じる",
    copyValue: "コピー",
    downloadJson: "JSON をダウンロード",
    cancelLookup: "キャンセル",
    whoisNoteIana:
      "参照サーバーが見つかりませんでした。IANA の WHOIS 応答を表示しています。",
    whoisNoteRdap:
      "WHOIS を利用できませんでした。代わりに RDAP 登録データを表示しています。",
    commandTriggerLabel: "検索…",
    commandPlaceholder: "ツールを検索するか、IP、ドメイン、ASN を入力…",
    commandGroupActions: "アクション",
    commandGroupPages: "移動先",
    commandEmpty: "一致するツールやアクションはありません。",
    commandHintNavigate: "移動",
    commandHintSelect: "開く",
    commandHintClose: "閉じる",
    notFoundTitle: "ページが見つかりません",
    notFoundDescription:
      "このアドレスはどのツールにも属していません。スタートページに戻るか、検索を使用してください（Ctrl+K）。",
    notFoundBackHome: "スタートページに戻る",
    errorTitle: "問題が発生しました",
    errorDescription:
      "このページを読み込めませんでした。もう一度お試しください。問題が続く場合は、原因は当側にあります。",
    errorRetry: "再試行",
    asnRpkiValid: "RPKI 有効",
    asnRpkiInvalid: "RPKI 無効",
    asnRpkiStatus: "RPKI 状態: {status}",
    cdnConfidenceHigh: "高",
    cdnConfidenceMedium: "中",
    cdnConfidenceLow: "低",
    pingTabLabel: "Ping テスター",
    dnsTabLabel: "DNS ルックアップ",
    whoisTabLabel: "WHOIS ルックアップ",
    cdnTabLabel: "CDN チェッカー",
    asnTabLabel: "ASN ルックアップ",
    reputationTabLabel: "IP レピュテーション",
    pingTitle: "Ping・ポートテスター",
    pingSubtitle:
      "TCP/UDP ポート、EB エンドポイント、データベース接続を順番に確認できる、分かりやすいテストワークフローです。",
    dnsTitle: "DNS ルックアップ",
    dnsSubtitle:
      "ドメインの DNS レコード（A、AAAA、CNAME、MX、NS、TXT、SOA、SRV、CAA）と IP アドレスの逆引き DNS を検索します。",
    whoisTitle: "WHOIS ルックアップ",
    whoisSubtitle:
      "ドメインと IP アドレスの WHOIS レコードをこのアプリから直接検索します。",
    cdnTitle: "CDN 利用チェッカー",
    cdnSubtitle:
      "任意のドメインについて CDN の利用状況と推定プロバイダー（CloudFront、Google Cloud CDN、Azure CDN、Vercel など）を分析します。",
    asnTitle: "ASN 情報",
    asnSubtitle:
      "IPinfo の ASN データと PeeringDB の公開相互接続データから自律システムを検索します。",
    asnPlaceholder: "AS8881 または 8881",
    asnLookupButton: "ASN を検索",
    asnLookingUp: "検索中...",
    asnInvalidInput:
      "AS プレフィックスを付けた ASN または数値を使用してください。例：AS8881 または 8881。",
    asnInvalidRange: "ASN は 1 から {max} の範囲である必要があります。",
    asnNetworkError: "ASN 検索中のネットワークエラーです。",
    asnUpstreamError: "ASN データプロバイダーは現在利用できません。",
    asnRateLimitError:
      "ASN 検索的回数が多すぎます。しばらく待ってから再試行してください。",
    asnEmptyTitle: "ASN を入力してネットワークプロファイルを調べる",
    asnEmptyDescription:
      "AS プレフィックス付きまたは数値で入力します。公開レジストリと設定済みの IPinfo プランにより、プロバイダーのデータが不完全になる場合があります。",
    dnsEmptyTitle: "ドメインを入力して DNS レコードを解決する",
    dnsEmptyDescription:
      "A、AAAA、MX、TXT、NS、SOA、SRV、CAA レコードを検索するか、IP アドレスで逆引き検索を実行します。",
    whoisEmptyTitle: "ドメインまたは IP を入力して WHOIS を検索する",
    whoisEmptyDescription:
      "該当する WHOIS サーバーから登録機関、登録日、ステータス、ネームサーバーを取得します。",
    cdnEmptyTitle: "ドメインを入力して CDN を検出する",
    cdnEmptyDescription:
      "DNS、CNAME チェーン、レスポンスヘッダーを調べ、サイトの前段にある CDN またはエッジプロバイダーを特定します。",
    asnNotFoundTitle: "ASN プロファイルが見つかりません",
    asnNotFoundDescription:
      "ASN は有効ですが、設定済みのどのソースからも利用可能な公開プロファイルが返されませんでした。",
    asnPartialData: "部分的なデータ",
    asnCompleteData: "完全",
    asnPrefixes: "アナウンスされたプレフィックス",
    asnRouting: "ルーティング関係",
    asnPeeringDb: "PeeringDB プロファイル",
    asnIxPresence: "IX 参加状況",
    asnFacilities: "施設参加状況",
    asnSourceDiagnostics: "ソース診断",
    asnDetailedDiagnostics: "詳細診断",
    asnUnnamed: "名称未設定の AS",
    asnRoutingDescription:
      "自律システムの相互接続、隣接ノード、経路の重みです。重みが高いほど、観測される経路が多いことを示します。",
    asnIxDescription:
      "この自律システムが参加しているインターネット交換所（IX）と、その相互接続帯域です。",
    asnPrefixesDescription:
      "グローバルルーティングテーブルにこの自律システムが発表する IP ネットワークブロックです。",
    asnPeeringDbDescription:
      "公開 PeeringDB データベースで宣言された相互接続プロファイルとルーティングポリシーです。",
    asnFacilitiesDescription:
      "このネットワークが参加している物理データセンターとコロケーション施設です。",
    asnProfileIdentityHeading: "識別情報とステータス",
    asnProfileInterconnectionHeading: "相互接続の詳細",
    asnProfilePolicyHeading: "Peering ポリシー",
    asnProfileExternalHeading: "外部プロファイル",
    asnProfilePrefixes4: "IPv4 プレフィックス",
    asnProfilePrefixes6: "IPv6 プレフィックス",
    asnWarnings: "警告",
    asnDiagnosticDuration: "所要時間",
    asnDiagnosticCache: "キャッシュ",
    asnDiagnosticWarnings: "警告",
    asnDiagnosticSource: "ソース",
    asnSourceDiagnosticsDescription:
      "この検索におけるプロバイダーの可用性、リクエスト時間、キャッシュ状態です。",
    asnCacheMiss: "未ヒット",
    asnCacheFresh: "最新",
    asnCacheStale: "古い",
    asnCacheNotConfigured: "未設定",
    asnNoPrefixes: "設定済みのソースからプレフィックスが返されませんでした。",
    asnNoRelations:
      "設定済みのソースからルーティング関係が返されませんでした。",
    asnMetricIpv4Addresses: "IPv4 アドレス",
    asnMetricRoutingNeighbours: "ルーティング隣接ノード",
    asnMetricIxPresence: "IX 参加状況",
    asnMetricIpinfoDetail: "設定済みの場合は IPinfo の ASN データ",
    asnMetricAnnouncedPrefixesDetail: "発表プレフィックス",
    asnMetricBgpRelationshipsDetail: "IPinfo または RIPEstat の BGP 関係",
    asnMetricPeeringDbProfileDetail: "PeeringDB ネットワークプロファイル",
    asnPrefixIpCount: "IP 数",
    asnRelationPeers: "ピア",
    asnRelationUpstreams: "上流",
    asnRelationDownstreams: "下流",
    asnRelationPower: "重み",
    asnSourceAvailable: "利用可能",
    asnSourceUnavailable: "利用不可",
    asnSourceNotConfigured: "未設定",
    asnSourceError: "エラー",
    asnLabelName: "名前",
    asnLabelCountry: "国",
    asnLabelAllocated: "割り当て済み",
    asnLabelNetworkId: "ネットワーク ID",
    asnLabelAlsoKnownAs: "別名",
    asnLabelWebsite: "ウェブサイト",
    asnLabelLookingGlass: "Looking Glass",
    asnLabelRouteServer: "ルートサーバー",
    asnLabelTraffic: "トラフィック",
    asnLabelPolicyGeneral: "ポリシー一般",
    asnLabelPolicyLocations: "ポリシー地域",
    asnLabelPolicyRatio: "ポリシーレシオ",
    asnLabelPolicyContracts: "ポリシー契約",
    asnLabelStatus: "ステータス",
    asnLabelExchange: "交換",
    asnLabelSpeed: "速度",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS ピア",
    asnLabelFacility: "施設",
    asnLabelCity: "都市",
    asnLabelLocalAsn: "ローカル ASN",
    asnSortTable: "並べ替え可能なテーブル",
    asnSortBy: "{column} で並べ替え",
    asnSortNotSorted: "未並べ替え",
    asnSortAscending: "昇順",
    asnSortDescending: "降順",
    asnBooleanYes: "はい",
    asnBooleanNo: "いいえ",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "IX LAN レコードは返されませんでした。",
    asnNoFacilityRecords: "施設レコードは返されませんでした。",
    asnWarningIpinfoUnavailable:
      "この ASN またはトークンプランでは IPinfo の ASN データを利用できません。",
    asnWarningIpinfoUnexpected:
      "IPinfo が予期しない ASN ペイロードを返しました。",
    asnWarningNoRipeStatData:
      "この ASN の RIPEstat ASN データが見つかりませんでした。",
    asnWarningNoPeeringDbProfile:
      "この ASN の PeeringDB 公開ネットワークプロファイルが見つかりませんでした。",
    asnWarningProviderHttp: "{provider} が HTTP {status} を返しました。",
    asnWarningProviderTimedOut:
      "{provider} へのリクエストがタイムアウトしました。",
    asnWarningProviderTooLarge: "{provider} の応答がサイズ上限を超えました。",
    asnWarningProviderInvalidJson: "{provider} が不正な JSON を返しました。",
    asnWarningProviderUnavailable: "{provider} のデータは現在利用できません。",
    asnWarningProviderStale:
      "{provider} のデータは現在利用できません。古いキャッシュデータを使用しています。",
    asnWarningTruncated: "{label} を全 {total} 件中 {limit} 件に省略しました。",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfo の IPv4 プレフィックス",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfo の IPv6 プレフィックス",
    asnWarningLabelIpinfoPeers: "IPinfo のピア",
    asnWarningLabelIpinfoUpstreams: "IPinfo の上流",
    asnWarningLabelIpinfoDownstreams: "IPinfo の下流",
    asnWarningLabelPeeringDbIxLan: "PeeringDB の IX LAN レコード",
    asnWarningLabelPeeringDbFacilities: "PeeringDB の施設",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat の IPv4 プレフィックス",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat の IPv6 プレフィックス",
    asnWarningLabelRipeStatRoutingNeighbours:
      "RIPEstat のルーティング隣接ノード",
    asnWarningLabelRipeStatUpstreamNeighbours: "RIPEstat の上流側隣接ノード",
    asnWarningLabelRipeStatDownstreamNeighbours: "RIPEstat の下流側隣接ノード",
    targetPlaceholder: "example.com",
    lookupInProgress: "検索中...",
    dnsLookupButton: "DNS を検索",
    dnsLookupError: "DNS 検索に失敗しました。",
    dnsRecordsFor: "DNS レコード：",
    resolvedAddresses: "解決されたアドレス",
    noAddressResult: "A/AAAA の結果がありません。",
    recordDetails: "レコードの詳細",
    dnsRecordNotes: "レコード検索に関する注記",
    dnsTableType: "種類",
    dnsTableValue: "値",
    dnsShowRaw: "生の JSON を表示",
    dnsHideRaw: "生の JSON を隠す",
    dnsNoRecords: "選択した種類のレコードは返されませんでした。",
    whoisPlaceholder: "example.com または 8.8.8.8",
    whoisLookupButton: "WHOIS を検索",
    whoisLookupError: "WHOIS 検索に失敗しました。",
    whoisFor: "WHOIS：",
    queriedServer: "問い合わせ先サーバー",
    referralSource: "参照元",
    noWhoisData: "WHOIS データが返されませんでした。",
    whoisRegistrar: "登録機関",
    whoisCreated: "作成日",
    whoisUpdated: "更新日",
    whoisExpires: "有効期限",
    whoisStatusLabel: "ステータス",
    whoisNameservers: "ネームサーバー",
    whoisShowRaw: "生の出力を表示",
    whoisHideRaw: "生の出力を隠す",
    pingTestMode: "テストモード",
    pingModeHelperTcp: "TCP ポートが接続を受け付けるかどうかを確認します。",
    pingModeHelperUdp:
      "UDP プローブを送信し、即時の応答またはエラーの動作を報告します。",
    pingModeHelperEb:
      "まず TCP を確認し、その後 HTTP/HTTPS エンドポイントの到達性を試します。",
    pingModeHelperDatabase:
      "認証前のプロトコルチェックと、任意の認証済みチェックを実行します。",
    pingModeDatabase: "データベース",
    pingDatabaseType: "データベースの種類",
    pingTargetHost: "宛先ホスト / IP",
    pingPort: "ポート",
    pingTimeout: "タイムアウト（ms）",
    pingUseAuth: "認証ありで確認",
    pingUsername: "ユーザー名",
    pingPassword: "パスワード",
    pingDatabaseOptional: "データベース（任意）",
    pingRunButton: "Ping テストを実行",
    pingRunning: "チェックを実行中...",
    pingNetworkError: "/api/ping へのネットワークエラーです。",
    pingModeLabel: "モード",
    pingLatencyLabel: "レイテンシ",
    pingTargetLabel: "ターゲット",
    pingDetailsLabel: "詳細",
    pingEmptyTitle: "まだテストを実行していません",
    pingEmptyDescription:
      "テストモードを選び、ホストとポートを入力してチェックを実行すると、到達性とレイテンシを測定できます。",
    pingStatusSuccess: "ターゲットに到達可能",
    pingStatusFailed: "チェック失敗",
    pingShowDetails: "技術的な詳細を表示",
    pingHideDetails: "技術的な詳細を隠す",
    pingResultTcpOk: "TCP 接続を確立しました。",
    pingResultTcpTimeout: "{timeoutMs} ms 後に TCP がタイムアウトしました。",
    pingResultTcpFailed: "TCP 接続に失敗しました：{error}",
    pingResultUdpSent:
      "UDP パケットを送信しました。{timeoutMs} ms 以内に ICMP エラーは観測されませんでした。",
    pingResultUdpResponse:
      "{from} から UDP 応答を受信しました（{bytes} バイト）。",
    pingResultUdpFailed: "UDP プローブに失敗しました：{error}",
    pingResultEbHttpOk:
      "{scheme} 経由でエンドポイントに到達できます（ステータス {status}）。",
    pingResultEbNoHttp:
      "TCP は開いていますが、このエンドポイントでは HTTP(S) 応答を検出できませんでした。",
    pingResultEbTcpFailed: "TCP 段階で EB チェックに失敗しました：{error}",
    pingResultDbConnectFailed: "{database} への接続に失敗しました：{error}",
    pingResultDbProtocolOk:
      "{database} サーバーが認証前ハンドシェイクのプローブに応答しました。",
    pingResultDbProtocolFailed: "{database} のプローブに失敗しました：{error}",
    pingResultDbTcpOk:
      "{database} の TCP ポートに到達できます。このタイプには認証前プロトコルのプローブはありません。",
    pingResultDbAuthUnsupported:
      "認証付きチェックは Redis のみで実装されています。{database} にはプロトコルチェックを使用してください。",
    pingResultDbAuthOk: "認証済み Redis 接続に成功しました。",
    pingResultDbAuthFailed: "Redis 認証チェックに失敗しました：{error}",
    cdnAnalyzeButton: "CDN を確認",
    cdnAnalyzing: "分析中...",
    cdnNetworkError: "CDN チェッカーへのネットワークエラーです。",
    cdnSummaryUnreachable: "ターゲットに到達できません",
    cdnSummaryNoMatch: "確実な CDN の一致なし",
    cdnSummaryDetected: "CDN を検出",
    cdnConfidenceNa: "該当なし",
    cdnNoProviderMatch: "プロバイダーの一致なし — 解決された IP",
    cdnInspectIpsHint: "これらの IP は IP ルックアップページで確認できます：",
    cdnTargetLabel: "ターゲット",
    cdnHttpStatusLabel: "HTTP ステータス",
    cdnProviderLabel: "プロバイダー",
    cdnUnknown: "不明",
    cdnMatchedSignals: "一致したシグナル",
    cdnNoSignals: "明示的な CDN シグナルに一致しませんでした。",
    cdnCnameChain: "CNAME チェーン",
    cdnNoCname: "CNAME レコードが見つかりませんでした。",
    cdnInterestingHeaders: "注目すべきレスポンスヘッダー",
    cdnNoHeaders: "関連するヘッダーが見つかりませんでした。",
    reputationTitle: "IP レピュテーションチェック",
    reputationSubtitle:
      "公開 IP アドレスを独立したレピュテーションおよび脅威インテリジェンスのソースと照合し、エビデンスに基づくリスク評価を取得します。",
    reputationPlaceholder: "8.8.8.8 または 2001:4860:4860::8888",
    reputationCheckButton: "レピュテーションを確認",
    reputationChecking: "確認中...",
    reputationNetworkError:
      "レピュテーションチェックへのネットワークエラーです。",
    reputationRateLimitError:
      "レピュテーションチェックが多すぎます。しばらく待ってから再試行してください。",
    reputationInvalidIp:
      "有効な公開 IP アドレス（IPv4 または IPv6）を入力してください。",
    reputationBlockedIp:
      "プライベート、予約済み、内部の IP 範囲は確認できません。",
    reputationEmptyTitle: "IP アドレスを入力してレピュテーションを確認",
    reputationEmptyDescription:
      "IP は DNS ブロックリスト、虐待報告データベース、ボットネット C2 トラッカー、ネットワーク分類ソースと照合されます。任意のプロバイダー（AbuseIPDB、GreyNoise、http:BL、ThreatFox）は、無料の API キーを設定すると有効になります。",
    reputationRiskLow: "低リスク",
    reputationRiskMedium: "中リスク",
    reputationRiskHigh: "高リスク",
    reputationHeadlineClean: "悪意のある活動は検出されませんでした",
    reputationScoreLabel: "リスクスコア",
    reputationSectionSummary: "レピュテーション概要",
    reputationSectionThreats: "脅威のエビデンス",
    reputationSectionMail: "メールレピュテーション",
    reputationSectionNetwork: "ネットワーク分類",
    reputationSectionSources: "ソース",
    reputationSectionScore: "このスコアの算出方法",
    reputationCoverageChecked: "{count} 件のソースを確認",
    reputationCoverageMatched: "{count} 件に脅威のエビデンスあり",
    reputationCoveragePolicy: "{count} 件にポリシーまたはコンテキスト情報あり",
    reputationCoverageUnavailable: "{count} 件が利用不可",
    reputationGeneratedAt: "{time} に生成",
    reputationNoThreatEvidence:
      "確認できたソースでは、直接的な悪意ある活動は観察されませんでした。",
    reputationNoMailEvidence:
      "確認したソースでは、メールレピュテーションの掲載は見つかりませんでした。",
    reputationFilterAll: "すべて",
    reputationNoEvidence:
      "確認できたソースに、このグループのエビデンスはありません。",
    reputationFactChecked: "確認済み",
    reputationFactMatched: "脅威のエビデンスあり",
    reputationFactUnavailable: "利用不可",
    reputationFactCheckedAt: "確認日時",
    reputationScoreCapped: "{count} ポイントから上限を適用",
    reputationConnectionLabel: "接続",
    reputationReverseLabel: "逆引き DNS",
    reputationFieldSource: "ソース",
    reputationFieldConfidence: "信頼度",
    reputationFieldFirstSeen: "初回検出",
    reputationFieldLastSeen: "最終検出",
    reputationFieldReports: "報告数",
    reputationFieldAttacks: "攻撃イベント",
    reputationFieldMalware: "マルウェア",
    reputationFieldDetail: "詳細",
    reputationFieldReturnCode: "リターンコード",
    reputationPointsLabel: "+{points} ポイント",
    reputationCategories: {
      mail_policy: "メールポリシーの掲載",
      mail_reputation: "メールレピュテーションの掲載",
      spam_observed: "スパム活動を検出",
      abuse_reported: "不正行為の報告",
      scanner: "インターネット全体のスキャナー",
      bruteforce: "ブルートフォース攻撃",
      web_attack: "Web 攻撃",
      ddos: "DDoS／フラッド攻撃",
      botnet: "ボットネット活動",
      malware: "マルウェアインフラ",
      proxy: "オープンプロキシ",
      vpn: "VPN／匿名化サービス",
      tor: "Tor 出口ノード",
      hosting: "ホスティング／データセンター",
      residential: "住宅用ネットワーク",
      mobile: "モバイルネットワーク",
      benign_service: "既知の企業サービス",
    },
    reputationSeverities: {
      info: "情報",
      low: "低",
      medium: "中",
      high: "高",
      critical: "重大",
    },
    reputationSourceStates: {
      available: "利用可能",
      clean: "クリーン",
      matched: "一致",
      policy_listed: "掲載済み（ポリシー）",
      not_configured: "未設定",
      unsupported: "未対応",
      rate_limited: "レート制限",
      resolver_blocked: "リゾルバでブロック",
      unavailable: "利用不可",
    },
    reputationReasons: {
      sbl: "Spamhaus SBL に掲載：検証済みのスパム送信元、スパムサービス、または ROKSO スパマー（エビデンスに基づき、編集者が管理するリスト）。",
      css: "Spamhaus CSS に掲載：大量送信またはグレーゾーンのメール送信を自動検出。SBL より弱いエビデンスです。",
      xbl: "Spamhaus XBL に掲載：トロイの木馬やエクスプロイトソフト、オープンプロキシを実行するホストが観測されました。通常は侵害されたマシンです。",
      drop: "このアドレスは Spamhaus DROP のネットワークブロック内にあります。犯罪組織や追跡を困難にした bulletproof hosting の運用者が管理し、マルウェア、ボットネットコントローラー、スパムに使用される範囲です。",
      pbl_isp:
        "Spamhaus PBL に掲載（ISP が管理）：この範囲は、第三者のメールサーバーに SMTP メールを直接配信しないことが推奨されています。住宅、動的、端末ユーザーのアドレスでは一般的であり、虐待のエビデンスではありません。",
      pbl_spamhaus:
        "Spamhaus PBL に掲載（Spamhaus が管理）：直接メールを配信すべきではないポリシー範囲です。多くの端末ユーザーアドレスでは正常であり、虐待のエビデンスではありません。",
      bcl: "Spamhaus Botnet Controller List に掲載：確認されたアクティブなボットネットのコマンド＆コントロールインフラです。",
      spamcop_listing:
        "最近のスパム報告（スパムトラップとユーザー提供の証拠）に基づき SpamCop に掲載されています。掲載は最後の報告から短時間で期限切れになります。",
      barracuda_listing:
        "Barracuda フィルターネットワークで測定したメールレピュテーションが低いことを示します。集計され、一部過去データに基づく信号であり、動的に再割り当てされたアドレスにも影響し得ますが、現在このアドレスがスパムを送信していることを証明するものではありません。",
      dronebl_irc_drone:
        "DroneBL ネットワークが IRC スパムドローン（ボット）として観測しました。",
      dronebl_bottler:
        "DroneBL ネットワークが Bottler IRC ボットとして観測しました。",
      dronebl_worm:
        "DroneBL ネットワークがワームまたはスパムボットを実行しているホストとして観測しました。",
      dronebl_ddos_drone: "DDoS ドローンとして観測（分散攻撃に参加）。",
      dronebl_open_socks_proxy:
        "オープン SOCKS プロキシを実行しているホストとして観測。悪用可能なインフラであり、それ自体が必ず悪意があるわけではありません。",
      dronebl_open_http_proxy:
        "オープン HTTP プロキシを実行しているホストとして観測。悪用可能なインフラであり、それ自体が必ず悪意があるわけではありません。",
      dronebl_proxychain: "プロキシチェーンの一部として観測。",
      dronebl_web_proxy:
        "オープン Web プロキシを実行しているホストとして観測。",
      dronebl_dictionary:
        "自動化された辞書攻撃（ブルートフォース攻撃）を実行しているホストとして観測。",
      dronebl_wingate:
        "オープン WinGate プロキシを実行しているホストとして観測。",
      dronebl_compromised_router:
        "侵害されたルーターまたはゲートウェイとして観測。",
      dronebl_botnet_auto:
        "DroneBL によりボットネットインフラとして自動的に分類（実験的検出）。",
      dronebl_compromised_host:
        "IRC 経由で侵害された可能性のあるホストを検出。",
      dronebl_uncategorized: "未分類の脅威クラスとして DroneBL に掲載。",
      bld_attack:
        "影響を受けたサーバー管理者が提出し、blocklist.de が収集した攻撃報告です。DNS に有効なエントリがあることは、攻撃が最近報告されたことを意味します。",
      bld_counts_only:
        "blocklist.de に記録された過去の虐待報告です。アドレスは現在有効な DNS ゾーンにありません。",
      feodo_c2_online:
        "有効な C2 応答によって Feodo Tracker（abuse.ch）が確認した、現在アクティブなボットネットのコマンド＆コントロールサーバーです。",
      feodo_c2_offline:
        "Feodo Tracker（abuse.ch）が追跡するボットネット C2 サーバーです。過去数日以内に最後に検出され、ブロックリストに残されています。",
      greynoise_scanner_malicious:
        "過去 90 日間にインターネットのスキャンを行うホストとして観測され、GreyNoise により悪意あると分類されました。",
      greynoise_scanner_unknown:
        "過去 90 日間にインターネットのスキャンを行うホストとして観測されましたが、GreyNoise は活動を分類できませんでした。",
      greynoise_scanner_benign:
        "インターネットのスキャンを観測されましたが、GreyNoise は無害と分類しました（例：研究プロジェクト）。",
      greynoise_riot:
        "GreyNoise RIOT データセット内の既知の一般的なビジネスサービス（例：CDN やセキュリティ企業）です。",
      abuseipdb_reports:
        "過去 90 日間に AbuseIPDB ユーザーが提出した虐待報告です。信頼度スコアは報告数と一貫性を反映します。",
      abuseipdb_tor: "AbuseIPDB により Tor 出口ノードと識別されました。",
      threatfox_ioc:
        "セキュリティ研究者が共有する abuse.ch ThreatFox データベースで脅威指標（IOC）として公開されています。",
      httpbl_search_engine: "既知の検索エンジンクーラー（Project Honey Pot）。",
      httpbl_suspicious:
        "Project Honey Pot のハニーポットネットワークで観察された不審な Web 訪問者です。多くの場合は無害なボットですが、慎重の評価が必要です。",
      httpbl_harvester:
        "Project Honey Pot ネットワークのハニーポットからメールアドレスを収集しているホストとして観測されました。",
      httpbl_comment_spammer:
        "Project Honey Pot ネットワークのハニーポットにコメントスパムを投稿しているホストとして観測されました。",
      ipapi_vpn:
        "ip-api.com により VPN、プロキシ、または匿名化サービスとしてフラグが立てられています。",
      ipapi_hosting:
        "ip-api.com によりホスティングまたはデータセンターのアドレスとしてフラグが立てられています。",
      ipapi_mobile:
        "ip-api.com によりモバイルまたはセルラー接続として識別されました。",
      residential_estimate:
        "接続タイプと逆引き DNS の命名に基づく住宅接続の推定です。プロバイダー確認済みの値ではなく、ヒューリスティックです。",
      corroboration:
        "複数の独立したソースが、このアドレスに悪意ある活動があると報告しています。",
      mail_corroboration:
        "複数の独立したメールレピュテーションリストにこのアドレスが含まれています。",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Spamhaus の複合 DNSBL：SBL（検証済みスパム送信元）、CSS（自動スパム送信者検出）、XBL（悪用されたホスト）、PBL（メールポリシーブロック）、BCL（ボットネットコントローラー）。",
      "spamhaus-drop":
        "犯罪組織や追跡を困難にした bulletproof hosting の運用者が管理するネットワークブロック全体の無料 Spamhaus フィードです。1 時間ごとに更新されるキャッシュコピーからローカルで確認します。",
      spamcop:
        "スパムトラップとユーザーのスパム報告から構築されたメールブロックリストです。掲載は短く、最近の送信動作を反映します。",
      barracuda:
        "Barracuda Networks のスパムフィルターネットワークで測定されたメールレピュテーションスコアです。集計信号で、一部過去データを含みます。",
      dronebl:
        "DroneBL プロジェクトが運用する DNSBL で、IRC や監視ネットワークで観測されたドローン、侵害ホスト、DDoS 参加者、オープンプロキシを掲載します。商用・非商用とも無料です。",
      "blocklist-de":
        "影響を受けたサーバー管理者から攻撃報告（SSH ブルートフォース、メール攻撃、Web スキャンなど）を収集するドイツの虐待報告プラットフォームです。",
      "feodo-tracker":
        "ボットネット C2 サーバー（Dridex、Emotet、TrickBot、QakBot、BazarLoader）を追跡する abuse.ch のトラッカーです。エントリには有効な C2 応答の観測が必要です。キャッシュフィードからローカルで確認します。",
      greynoise:
        "インターネット全体のスキャナーに関するインテリジェンスです。コミュニティ API は、アドレスが最近スキャンされたかどうかと分類結果を報告します。",
      abuseipdb:
        "信頼度スコアを備えた、ユーザー参加型の虐待報告データベースです。無料の API キー（ABUSEIPDB_API_KEY）が必要です。",
      httpbl:
        "Web 悪用向けの Project Honey Pot DNSBL です。メールアドレスコレクター、コメントスパム、疑わしいボットを掲載します。無料のアクセスキー（HTTPBL_ACCESS_KEY）が必要です。",
      threatfox:
        "ボットネット C2 アドレスを含む侵害指標を共有するための abuse.ch プラットフォームです。無料の Auth-Key（THREATFOX_AUTH_KEY）が必要です。",
      "ip-api":
        "IP メタデータ：地理位置、ネットワーク／ASN、接続分類フラグです。",
    },
    reputationGeoLabel: "地理位置",
    reputationNetworkLabel: "ASN / プロバイダー",
    reputationShowHiddenSources: "未設定のソースを表示（{count}）",
    reputationHideHiddenSources: "未設定のソースを隠す",
  },
  ko: {
    errorRateLimited: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    errorInvalidTarget: "유효한 공개 도메인, IP 주소 또는 URL을 입력해 주세요.",
    errorTargetBlocked:
      "이 공개 사이트에서는 사설, 로컬 및 내부 대상을 검사할 수 없습니다.",
    errorTimeout:
      "검사 시간이 초과되었습니다. 대상이 느리거나 연결할 수 없을 수 있습니다.",
    errorUpstream: "상위 데이터 제공업체가 현재 이용할 수 없습니다.",
    errorBadRequest: "요청 매개변수가 올바르지 않습니다.",
    errorTargetNetwork: "대상을 확인하거나 연결할 수 없습니다.",
    showAll: "모두 보기",
    showLess: "간단히 보기",
    navOverview: "개요",
    navDiagnostics: "진단",
    navMyIp: "내 IP",
    brandTagline: "네트워크 및 IP 도구 모음",
    themeToggle: "테마 전환",
    themeLight: "밝게",
    themeDark: "어둡게",
    themeSystem: "시스템 설정",
    navMenu: "메뉴",
    skipToContent: "콘텐츠로 건너뛰기",
    navToolsLabel: "도구",
    sidebarLabel: "사이트 탐색",
    navClose: "메뉴 닫기",
    copyValue: "복사",
    downloadJson: "JSON 다운로드",
    cancelLookup: "취소",
    whoisNoteIana: "참조 서버를 찾지 못했습니다. IANA WHOIS 응답을 표시합니다.",
    whoisNoteRdap:
      "WHOIS를 사용할 수 없습니다. 대신 RDAP 등록 데이터를 표시합니다.",
    commandTriggerLabel: "검색…",
    commandPlaceholder: "도구를 검색하거나 IP, 도메인, ASN을 입력하세요…",
    commandGroupActions: "작업",
    commandGroupPages: "이동할 페이지",
    commandEmpty: "일치하는 도구나 작업이 없습니다.",
    commandHintNavigate: "탐색",
    commandHintSelect: "열기",
    commandHintClose: "닫기",
    notFoundTitle: "페이지를 찾을 수 없습니다",
    notFoundDescription:
      "이 주소는 어떤 도구에도 속하지 않습니다. 시작 페이지로 돌아가거나 검색을 사용하세요(Ctrl+K).",
    notFoundBackHome: "시작 페이지로 돌아가기",
    errorTitle: "문제가 발생했습니다",
    errorDescription:
      "이 페이지를 불러오지 못했습니다. 다시 시도해 보세요. 문제가 계속되면 원인은 당사 쪽에 있습니다.",
    errorRetry: "다시 시도",
    asnRpkiValid: "RPKI 유효",
    asnRpkiInvalid: "RPKI 무효",
    asnRpkiStatus: "RPKI 상태: {status}",
    cdnConfidenceHigh: "높음",
    cdnConfidenceMedium: "중간",
    cdnConfidenceLow: "낮음",
    pingTabLabel: "핑 테스트 도구",
    dnsTabLabel: "DNS 조회",
    whoisTabLabel: "WHOIS 조회",
    cdnTabLabel: "CDN 검사기",
    asnTabLabel: "ASN 조회",
    reputationTabLabel: "IP 평판",
    pingTitle: "핑 및 포트 테스터",
    pingSubtitle:
      "TCP/UDP 포트, EB 엔드포인트 및 데이터베이스 연결을 단계별로 검사하는 편리한 테스트 워크플로입니다.",
    dnsTitle: "DNS 조회",
    dnsSubtitle:
      "도메인의 DNS 레코드(A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA)와 IP 주소의 역방향 DNS를 조회합니다.",
    whoisTitle: "WHOIS 조회",
    whoisSubtitle:
      "이 앱에서 도메인과 IP 주소의 WHOIS 레코드를 직접 조회합니다.",
    cdnTitle: "CDN 사용 여부 검사기",
    cdnSubtitle:
      "임의의 도메인에서 CDN 사용 여부와 예상되는 제공업체를 분석합니다. CloudFront, Google Cloud CDN, Azure CDN, Vercel 등을 포함합니다.",
    asnTitle: "ASN 정보",
    asnSubtitle:
      "IPinfo ASN 정보와 PeeringDB의 공개 상호 연결 데이터를 이용해 자율 시스템을 조회합니다.",
    asnPlaceholder: "AS8881 또는 8881",
    asnLookupButton: "ASN 조회",
    asnLookingUp: "조회 중...",
    asnInvalidInput:
      "AS 접두사가 붙은 ASN 또는 숫자를 사용하세요. 예를 들어 AS8881 또는 8881입니다.",
    asnInvalidRange: "ASN은 1에서 {max} 사이여야 합니다.",
    asnNetworkError: "ASN 조회 중 네트워크 오류가 발생했습니다.",
    asnUpstreamError: "ASN 데이터 제공업체가 현재 이용할 수 없습니다.",
    asnRateLimitError: "ASN 조회가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    asnEmptyTitle: "네트워크 프로필을 살펴보려면 ASN을 입력하세요",
    asnEmptyDescription:
      "AS 접두사가 붙은 값 또는 숫자를 입력하세요. 공개 등록 데이터와 구성된 IPinfo 요금제에 따라 제공업체 데이터가 부분적일 수 있습니다.",
    dnsEmptyTitle: "DNS 레코드를 확인할 도메인을 입력하세요",
    dnsEmptyDescription:
      "A, AAAA, MX, TXT, NS, SOA, SRV, CAA 레코드를 조회하거나 IP 주소에서 역방향 조회를 실행하세요.",
    whoisEmptyTitle: "WHOIS를 조회할 도메인 또는 IP를 입력하세요",
    whoisEmptyDescription:
      "해당 WHOIS 서버에서 등록기관, 등록일, 상태 및 네임서버를 가져옵니다.",
    cdnEmptyTitle: "CDN을 확인하려면 도메인을 입력하세요",
    cdnEmptyDescription:
      "DNS, CNAME 체인 및 응답 헤더를 조사해 사이트 앞단에 있는 CDN 또는 edge 제공업체를 식별합니다.",
    asnNotFoundTitle: "ASN 프로필을 찾을 수 없습니다",
    asnNotFoundDescription:
      "ASN은 유효하지만 구성된 소스 중 어느 것도 사용할 수 있는 공개 프로필을 반환하지 않았습니다.",
    asnPartialData: "부분 데이터",
    asnCompleteData: "완전",
    asnPrefixes: "공지된 프리픽스",
    asnRouting: "라우팅 관계",
    asnPeeringDb: "PeeringDB 프로필",
    asnIxPresence: "IX 참여 현황",
    asnFacilities: "시설 참여 현황",
    asnSourceDiagnostics: "소스 진단",
    asnDetailedDiagnostics: "상세 진단",
    asnUnnamed: "이름 없는 AS",
    asnRoutingDescription:
      "자율 시스템의 상호 연결, 이웃 및 경로 가중치입니다. 가중치가 높을수록 더 자주 관찰된 경로임을 의미합니다.",
    asnIxDescription:
      "이 자율 시스템이 위치한 인터넷 교환소(IX)와 상호 연결 대역폭입니다.",
    asnPrefixesDescription:
      "이 자율 시스템이 글로벌 라우팅 테이블에 공지한 IP 네트워크 블록입니다.",
    asnPeeringDbDescription:
      "공개 PeeringDB 데이터베이스에 선언된 상호 연결 프로필 및 라우팅 정책입니다.",
    asnFacilitiesDescription:
      "이 네트워크가 위치한 물리적 데이터 센터 및 코로케이션 시설입니다.",
    asnProfileIdentityHeading: "식별 정보 및 상태",
    asnProfileInterconnectionHeading: "상호 연결 세부 정보",
    asnProfilePolicyHeading: "Peering 정책",
    asnProfileExternalHeading: "외부 프로필",
    asnProfilePrefixes4: "IPv4 프리픽스",
    asnProfilePrefixes6: "IPv6 프리픽스",
    asnWarnings: "경고",
    asnDiagnosticDuration: "소요 시간",
    asnDiagnosticCache: "캐시",
    asnDiagnosticWarnings: "경고",
    asnDiagnosticSource: "소스",
    asnSourceDiagnosticsDescription:
      "이번 조회에서 제공업체 가용성, 요청 소요 시간 및 캐시 상태입니다.",
    asnCacheMiss: "미스",
    asnCacheFresh: "최신",
    asnCacheStale: "오래됨",
    asnCacheNotConfigured: "미설정",
    asnNoPrefixes: "구성된 소스에서 프리픽스를 반환하지 않았습니다.",
    asnNoRelations: "구성된 소스에서 라우팅 관계를 반환하지 않았습니다.",
    asnMetricIpv4Addresses: "IPv4 주소",
    asnMetricRoutingNeighbours: "라우팅 이웃",
    asnMetricIxPresence: "IX 참여 현황",
    asnMetricIpinfoDetail: "구성된 경우 IPinfo ASN 데이터",
    asnMetricAnnouncedPrefixesDetail: "공지된 프리픽스",
    asnMetricBgpRelationshipsDetail: "IPinfo 또는 RIPEstat BGP 관계",
    asnMetricPeeringDbProfileDetail: "PeeringDB 네트워크 프로필",
    asnPrefixIpCount: "IP 수",
    asnRelationPeers: "피어",
    asnRelationUpstreams: "상위",
    asnRelationDownstreams: "하위",
    asnRelationPower: "가중치",
    asnSourceAvailable: "사용 가능",
    asnSourceUnavailable: "사용 불가",
    asnSourceNotConfigured: "미설정",
    asnSourceError: "오류",
    asnLabelName: "이름",
    asnLabelCountry: "국가",
    asnLabelAllocated: "할당됨",
    asnLabelNetworkId: "네트워크 ID",
    asnLabelAlsoKnownAs: "다른 이름",
    asnLabelWebsite: "웹사이트",
    asnLabelLookingGlass: "Looking Glass",
    asnLabelRouteServer: "라우트 서버",
    asnLabelTraffic: "트래픽",
    asnLabelPolicyGeneral: "일반 정책",
    asnLabelPolicyLocations: "정책 위치",
    asnLabelPolicyRatio: "정책 비율",
    asnLabelPolicyContracts: "정책 계약",
    asnLabelStatus: "상태",
    asnLabelExchange: "교환",
    asnLabelSpeed: "속도",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "RS 피어",
    asnLabelFacility: "시설",
    asnLabelCity: "도시",
    asnLabelLocalAsn: "로컬 ASN",
    asnSortTable: "정렬 가능한 표",
    asnSortBy: "{column} 기준으로 정렬",
    asnSortNotSorted: "정렬되지 않음",
    asnSortAscending: "오름차순",
    asnSortDescending: "내림차순",
    asnBooleanYes: "예",
    asnBooleanNo: "아니오",
    asnSpeedMbps: "Mbps",
    asnNoIxLanRecords: "IX LAN 레코드가 반환되지 않았습니다.",
    asnNoFacilityRecords: "시설 레코드가 반환되지 않았습니다.",
    asnWarningIpinfoUnavailable:
      "이 ASN 또는 토큰 요금제에 대한 IPinfo ASN 데이터를 사용할 수 없습니다.",
    asnWarningIpinfoUnexpected:
      "IPinfo가 예상치 못한 ASN 페이로드를 반환했습니다.",
    asnWarningNoRipeStatData:
      "이 ASN에 대한 RIPEstat ASN 데이터를 찾을 수 없습니다.",
    asnWarningNoPeeringDbProfile:
      "이 ASN에 대한 PeeringDB 공개 네트워크 프로필을 찾을 수 없습니다.",
    asnWarningProviderHttp: "{provider}가 HTTP {status}를 반환했습니다.",
    asnWarningProviderTimedOut: "{provider} 요청 시간이 초과되었습니다.",
    asnWarningProviderTooLarge: "{provider} 응답이 크기 제한을 초과했습니다.",
    asnWarningProviderInvalidJson: "{provider}가 잘못된 JSON을 반환했습니다.",
    asnWarningProviderUnavailable:
      "{provider} 데이터를 현재 사용할 수 없습니다.",
    asnWarningProviderStale:
      "{provider} 데이터를 현재 사용할 수 없습니다. 오래된 캐시 데이터를 사용합니다.",
    asnWarningTruncated:
      "{label} 데이터는 전체 {total}개 중 {limit}개로 축약되었습니다.",
    asnWarningLabelIpinfoIpv4Prefixes: "IPinfo IPv4 프리픽스",
    asnWarningLabelIpinfoIpv6Prefixes: "IPinfo IPv6 프리픽스",
    asnWarningLabelIpinfoPeers: "IPinfo 피어",
    asnWarningLabelIpinfoUpstreams: "IPinfo 상위",
    asnWarningLabelIpinfoDownstreams: "IPinfo 하위",
    asnWarningLabelPeeringDbIxLan: "PeeringDB IX LAN 레코드",
    asnWarningLabelPeeringDbFacilities: "PeeringDB 시설",
    asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat IPv4 프리픽스",
    asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat IPv6 프리픽스",
    asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat 라우팅 이웃",
    asnWarningLabelRipeStatUpstreamNeighbours: "RIPEstat 상위 측 이웃",
    asnWarningLabelRipeStatDownstreamNeighbours: "RIPEstat 하위 측 이웃",
    targetPlaceholder: "example.com",
    lookupInProgress: "조회 중...",
    dnsLookupButton: "DNS 조회",
    dnsLookupError: "DNS 조회에 실패했습니다.",
    dnsRecordsFor: "DNS 레코드:",
    resolvedAddresses: "해결된 주소",
    noAddressResult: "A/AAAA 조회 결과가 없습니다.",
    recordDetails: "레코드 세부 정보",
    dnsRecordNotes: "레코드 조회 참고 사항",
    dnsTableType: "유형",
    dnsTableValue: "값",
    dnsShowRaw: "원본 JSON 표시",
    dnsHideRaw: "원본 JSON 숨기기",
    dnsNoRecords: "선택한 유형의 레코드가 반환되지 않았습니다.",
    whoisPlaceholder: "example.com 또는 8.8.8.8",
    whoisLookupButton: "WHOIS 조회",
    whoisLookupError: "WHOIS 조회에 실패했습니다.",
    whoisFor: "WHOIS 대상:",
    queriedServer: "조회한 서버",
    referralSource: "참조 출처",
    noWhoisData: "WHOIS 데이터가 반환되지 않았습니다.",
    whoisRegistrar: "등록기관",
    whoisCreated: "생성일",
    whoisUpdated: "업데이트일",
    whoisExpires: "만료일",
    whoisStatusLabel: "상태",
    whoisNameservers: "네임서버",
    whoisShowRaw: "원본 출력 표시",
    whoisHideRaw: "원본 출력 숨기기",
    pingTestMode: "테스트 모드",
    pingModeHelperTcp: "TCP 포트가 연결을 수락하는지 확인합니다.",
    pingModeHelperUdp:
      "UDP 프로브를 보내고 즉시 나타나는 응답 또는 오류를 보고합니다.",
    pingModeHelperEb:
      "먼저 TCP를 확인한 다음 HTTP/HTTPS 엔드포인트의 도달 가능성을 검사합니다.",
    pingModeHelperDatabase:
      "인증 전 프로토콜 검사와 선택적 인증 검사를 실행합니다.",
    pingModeDatabase: "데이터베이스",
    pingDatabaseType: "데이터베이스 유형",
    pingTargetHost: "대상 호스트 / IP",
    pingPort: "포트",
    pingTimeout: "시간 초과(ms)",
    pingUseAuth: "인증으로 검사",
    pingUsername: "사용자 이름",
    pingPassword: "비밀번호",
    pingDatabaseOptional: "데이터베이스(선택 사항)",
    pingRunButton: "핑 테스트 실행",
    pingRunning: "검사 실행 중...",
    pingNetworkError: "/api/ping에 연결하는 중 네트워크 오류가 발생했습니다.",
    pingModeLabel: "모드",
    pingLatencyLabel: "지연 시간",
    pingTargetLabel: "대상",
    pingDetailsLabel: "세부 정보",
    pingEmptyTitle: "아직 실행한 테스트가 없습니다",
    pingEmptyDescription:
      "테스트 모드를 선택하고 호스트와 포트를 입력한 다음 검사를 실행하여 도달 가능성과 지연 시간을 측정하세요.",
    pingStatusSuccess: "대상에 도달할 수 있음",
    pingStatusFailed: "검사 실패",
    pingShowDetails: "기술 세부 정보 표시",
    pingHideDetails: "기술 세부 정보 숨기기",
    pingResultTcpOk: "TCP 연결이 설정되었습니다.",
    pingResultTcpTimeout: "{timeoutMs} ms 후 TCP 시간이 초과되었습니다.",
    pingResultTcpFailed: "TCP 연결에 실패했습니다: {error}",
    pingResultUdpSent:
      "UDP 패킷을 보냈습니다. {timeoutMs} ms 안에 ICMP 오류가 관찰되지 않았습니다.",
    pingResultUdpResponse: "{from}에서 UDP 응답을 받았습니다({bytes}바이트).",
    pingResultUdpFailed: "UDP 프로브에 실패했습니다: {error}",
    pingResultEbHttpOk:
      "{scheme}를 통해 엔드포인트에 도달할 수 있습니다(상태 {status}).",
    pingResultEbNoHttp:
      "TCP는 열렸지만 이 엔드포인트에서 HTTP(S) 응답이 감지되지 않았습니다.",
    pingResultEbTcpFailed: "TCP 단계에서 EB 검사에 실패했습니다: {error}",
    pingResultDbConnectFailed: "{database} 연결에 실패했습니다: {error}",
    pingResultDbProtocolOk:
      "{database} 서버가 인증 전 핸드셰이크 프로브에 응답했습니다.",
    pingResultDbProtocolFailed: "{database} 프로브에 실패했습니다: {error}",
    pingResultDbTcpOk:
      "{database} TCP 포트에 도달할 수 있습니다. 이 유형에는 인증 전 프로토콜 프로브가 없습니다.",
    pingResultDbAuthUnsupported:
      "인증 검사는 Redis에만 구현되어 있습니다. {database}에는 프로토콜 검사를 사용하세요.",
    pingResultDbAuthOk: "인증된 Redis 연결에 성공했습니다.",
    pingResultDbAuthFailed: "Redis 인증 검사에 실패했습니다: {error}",
    cdnAnalyzeButton: "CDN 검사",
    cdnAnalyzing: "분석 중...",
    cdnNetworkError: "CDN 검사기에 연결하는 중 네트워크 오류가 발생했습니다.",
    cdnSummaryUnreachable: "대상에 도달할 수 없음",
    cdnSummaryNoMatch: "확실한 CDN 일치 없음",
    cdnSummaryDetected: "CDN 감지",
    cdnConfidenceNa: "해당 없음",
    cdnNoProviderMatch: "일치하는 제공업체 없음 — 해결된 IP",
    cdnInspectIpsHint: "다음 IP를 IP 조회 페이지에서 살펴볼 수 있습니다:",
    cdnTargetLabel: "대상",
    cdnHttpStatusLabel: "HTTP 상태",
    cdnProviderLabel: "제공업체",
    cdnUnknown: "알 수 없음",
    cdnMatchedSignals: "일치한 신호",
    cdnNoSignals: "명시적인 CDN 신호가 일치하지 않았습니다.",
    cdnCnameChain: "CNAME 체인",
    cdnNoCname: "CNAME 레코드를 찾지 못했습니다.",
    cdnInterestingHeaders: "주요 응답 헤더",
    cdnNoHeaders: "관련 헤더를 찾지 못했습니다.",
    reputationTitle: "IP 평판 확인",
    reputationSubtitle:
      "공개 IP 주소를 독립적인 평판 및 위협 인텔리전스 소스와 대조하고 증거 기반 위험 평가를 받아보세요.",
    reputationPlaceholder: "8.8.8.8 또는 2001:4860:4860::8888",
    reputationCheckButton: "평판 확인",
    reputationChecking: "확인 중...",
    reputationNetworkError: "평판 확인 중 네트워크 오류가 발생했습니다.",
    reputationRateLimitError:
      "평판 확인이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    reputationInvalidIp: "유효한 공개 IP 주소(IPv4 또는 IPv6)를 입력해 주세요.",
    reputationBlockedIp: "사설, 예약 및 내부 IP 범위는 확인할 수 없습니다.",
    reputationEmptyTitle: "평판을 확인할 IP 주소를 입력하세요",
    reputationEmptyDescription:
      "IP를 DNS 차단 목록, 악용 신고 데이터베이스, 봇넷 C2 추적기 및 네트워크 분류 소스와 대조합니다. 선택적 제공업체(AbuseIPDB, GreyNoise, http:BL, ThreatFox)는 무료 API 키를 구성하면 활성화됩니다.",
    reputationRiskLow: "위험도 낮음",
    reputationRiskMedium: "위험도 중간",
    reputationRiskHigh: "위험도 높음",
    reputationHeadlineClean: "악성 활동이 감지되지 않았습니다",
    reputationScoreLabel: "위험 점수",
    reputationSectionSummary: "평판 요약",
    reputationSectionThreats: "위협 증거",
    reputationSectionMail: "메일 평판",
    reputationSectionNetwork: "네트워크 분류",
    reputationSectionSources: "소스",
    reputationSectionScore: "이 점수의 계산 방법",
    reputationCoverageChecked: "{count}개 소스 확인",
    reputationCoverageMatched: "{count}개에 위협 증거 있음",
    reputationCoveragePolicy: "{count}개에 정책 또는 맥락 정보 있음",
    reputationCoverageUnavailable: "{count}개 사용 불가",
    reputationGeneratedAt: "{time}에 생성",
    reputationNoThreatEvidence:
      "확인 가능한 소스에서 직접적인 악성 활동은 관찰되지 않았습니다.",
    reputationNoMailEvidence:
      "확인한 소스에서 메일 평판 목록을 찾지 못했습니다.",
    reputationFilterAll: "전체",
    reputationNoEvidence:
      "확인 가능한 소스에서 이 그룹에 대한 증거가 없습니다.",
    reputationFactChecked: "확인됨",
    reputationFactMatched: "위협 증거 있음",
    reputationFactUnavailable: "사용 불가",
    reputationFactCheckedAt: "확인 시각",
    reputationScoreCapped: "{count}개 원시 점수에서 상한 적용",
    reputationConnectionLabel: "연결",
    reputationReverseLabel: "역방향 DNS",
    reputationFieldSource: "소스",
    reputationFieldConfidence: "신뢰도",
    reputationFieldFirstSeen: "최초 확인",
    reputationFieldLastSeen: "마지막 확인",
    reputationFieldReports: "신고",
    reputationFieldAttacks: "공격 이벤트",
    reputationFieldMalware: "악성코드",
    reputationFieldDetail: "세부 정보",
    reputationFieldReturnCode: "반환 코드",
    reputationPointsLabel: "+{points}점",
    reputationCategories: {
      mail_policy: "메일 정책 목록",
      mail_reputation: "메일 평판 목록",
      spam_observed: "스팸 활동 관측",
      abuse_reported: "악용 신고됨",
      scanner: "인터넷 전체 스캐너",
      bruteforce: "무차별 대입 공격",
      web_attack: "웹 공격",
      ddos: "DDoS / 플러드 공격",
      botnet: "봇넷 활동",
      malware: "악성코드 인프라",
      proxy: "오픈 프록시",
      vpn: "VPN / 익명화 서비스",
      tor: "Tor 출구 노드",
      hosting: "호스팅 / 데이터 센터",
      residential: "주거용 네트워크",
      mobile: "모바일 네트워크",
      benign_service: "알려진 기업 서비스",
    },
    reputationSeverities: {
      info: "정보",
      low: "낮은 심각도",
      medium: "중간 심각도",
      high: "높은 심각도",
      critical: "심각",
    },
    reputationSourceStates: {
      available: "사용 가능",
      clean: "안전함",
      matched: "일치",
      policy_listed: "목록에 있음(정책)",
      not_configured: "미설정",
      unsupported: "지원되지 않음",
      rate_limited: "요청 속도 제한",
      resolver_blocked: "리졸버 차단",
      unavailable: "사용 불가",
    },
    reputationReasons: {
      sbl: "Spamhaus SBL에 등록됨: 확인된 스팸 발신원, 스팸 서비스 또는 ROKSO 스패머(증거 기반이며 편집자가 관리하는 목록).",
      css: "Spamhaus CSS에 등록됨: 대량 또는 회색 지대 메일 발송을 자동으로 탐지한 항목입니다. SBL보다 약한 증거입니다.",
      xbl: "Spamhaus XBL에 등록됨: 트로이목마/익스플로잇 소프트웨어 또는 열린 프록시를 실행하는 호스트로 관측되었습니다. 일반적으로 침해된 컴퓨터입니다.",
      drop: "주소가 Spamhaus DROP 네트워크 블록에 포함되어 있습니다. 범죄 조직이나 불릿프루프 호스팅 운영자가 통제하며 악성코드, 봇넷 컨트롤러 또는 스팸에 사용되는 범위입니다.",
      pbl_isp:
        "Spamhaus PBL에 등록됨(ISP 관리): 이 범위에서 타사 메일 서버로 SMTP 메일을 직접 전달하지 않는 것이 정상입니다. 대부분의 주거용, 동적 및 최종 사용자 주소에서는 정상이며 악용 증거가 아닙니다.",
      pbl_spamhaus:
        "Spamhaus PBL에 등록됨(Spamhaus 관리): 직접 메일을 전달하지 않아야 하는 정책 범위입니다. 많은 최종 사용자 주소에서 정상이며 악용 증거가 아닙니다.",
      bcl: "Spamhaus Botnet Controller List에 등록됨: 확인된 활성 봇넷 명령 및 제어 인프라입니다.",
      spamcop_listing:
        "최근 스팸 신고(스팸 트랩 및 사용자가 제출한 증거)를 바탕으로 SpamCop에 등록되었습니다. 등록은 마지막 신고 직후 짧은 시간 내에 만료됩니다.",
      barracuda_listing:
        "Barracuda 필터 네트워크에서 측정한 메일 평판이 좋지 않습니다. 집계되고 일부 과거 데이터에 기반한 신호이며 동적으로 재할당된 주소에도 영향을 줄 수 있지만, 현재 이 주소가 스팸을 전송한다는 증거는 아닙니다.",
      dronebl_irc_drone:
        "DroneBL 네트워크가 IRC 스팸 드론(봇)으로 관측했습니다.",
      dronebl_bottler: "DroneBL 네트워크가 Bottler IRC 봇으로 관측했습니다.",
      dronebl_worm:
        "DroneBL 네트워크가 웜 또는 스팸봇을 실행하는 것으로 관측했습니다.",
      dronebl_ddos_drone: "DDoS 드론으로 관측되었습니다(분산 공격에 참여).",
      dronebl_open_socks_proxy:
        "열린 SOCKS 프록시를 실행하는 것으로 관측되었습니다. 남용 가능한 인프라지만 그 자체로 반드시 악성인 것은 아닙니다.",
      dronebl_open_http_proxy:
        "열린 HTTP 프록시를 실행하는 것으로 관측되었습니다. 남용 가능한 인프라지만 그 자체로 반드시 악성인 것은 아닙니다.",
      dronebl_proxychain: "프록시 체인의 일부로 관측되었습니다.",
      dronebl_web_proxy: "열린 웹 프록시를 실행하는 것으로 관측되었습니다.",
      dronebl_dictionary:
        "자동화된 사전 공격(무차별 대입 공격)을 수행하는 것으로 관측되었습니다.",
      dronebl_wingate: "열린 WinGate 프록시를 실행하는 것으로 관측되었습니다.",
      dronebl_compromised_router:
        "침해된 라우터 또는 게이트웨이로 관측되었습니다.",
      dronebl_botnet_auto:
        "DroneBL이 봇넷 인프라로 자동 분류했습니다(실험적 탐지).",
      dronebl_compromised_host:
        "IRC를 통해 침해되었을 가능성이 있는 호스트를 탐지했습니다.",
      dronebl_uncategorized: "분류되지 않은 위협 범주의 DroneBL 목록에 등록됨.",
      bld_attack:
        "피해 서버 운영자가 제출하고 blocklist.de가 수집한 공격 신고입니다. 활성 DNS 항목이 있으면 최근에 공격이 신고되었다는 뜻입니다.",
      bld_counts_only:
        "blocklist.de에 기록된 과거 악용 신고입니다. 현재 주소는 활성 DNS 영역에 없습니다.",
      feodo_c2_online:
        "유효한 C2 응답을 통해 Feodo Tracker(abuse.ch)가 확인한 현재 활성 봇넷 명령 및 제어 서버입니다.",
      feodo_c2_offline:
        "Feodo Tracker(abuse.ch)가 추적하는 봇넷 C2 서버입니다. 최근 며칠 안에 마지막으로 관측되어 차단 목록에 남아 있습니다.",
      greynoise_scanner_malicious:
        "최근 90일 동안 인터넷을 스캔하는 것으로 관측되었고 GreyNoise가 악성으로 분류했습니다.",
      greynoise_scanner_unknown:
        "최근 90일 동안 인터넷을 스캔하는 것으로 관측되었지만 GreyNoise가 활동을 분류하지 못했습니다.",
      greynoise_scanner_benign:
        "인터넷을 스캔하는 것으로 관측되었지만 GreyNoise가 연구 프로젝트 등 무해한 활동으로 분류했습니다.",
      greynoise_riot:
        "GreyNoise RIOT 데이터셋에 있는 알려진 일반 기업 서비스(예: CDN 또는 보안 회사)입니다.",
      abuseipdb_reports:
        "최근 90일 동안 AbuseIPDB 사용자가 제출한 악용 신고입니다. 신뢰도 점수는 신고 수와 일관성을 반영합니다.",
      abuseipdb_tor: "AbuseIPDB가 Tor 출구 노드로 식별했습니다.",
      threatfox_ioc:
        "보안 연구자들이 공유하는 abuse.ch ThreatFox 데이터베이스에 위협 지표(IOC)로 게시되었습니다.",
      httpbl_search_engine: "알려진 검색 엔진 크롤러(Project Honey Pot)입니다.",
      httpbl_suspicious:
        "Project Honey Pot의 허니팟 네트워크에서 관측된 의심스러운 웹 방문자입니다. 흔히 무해한 봇이지만 신중하게 평가해야 합니다.",
      httpbl_harvester:
        "Project Honey Pot 네트워크의 허니팟에서 이메일 주소를 수집하는 것으로 관측되었습니다.",
      httpbl_comment_spammer:
        "Project Honey Pot 네트워크의 허니팟에 댓글 스팸을 게시하는 것으로 관측되었습니다.",
      ipapi_vpn: "ip-api.com이 VPN, 프록시 또는 익명화 서비스로 표시했습니다.",
      ipapi_hosting:
        "ip-api.com이 호스팅 또는 데이터 센터 주소로 표시했습니다.",
      ipapi_mobile: "ip-api.com이 모바일 또는 셀룰러 연결로 식별했습니다.",
      residential_estimate:
        "연결 유형과 역방향 DNS 명명에서 추정한 주거용 연결입니다. 제공업체 확인을 받은 값이 아니라 휴리스틱입니다.",
      corroboration: "여러 독립적인 소스가 이 주소의 악성 활동을 보고합니다.",
      mail_corroboration:
        "여러 독립적인 메일 평판 목록에 이 주소가 포함되어 있습니다.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Spamhaus 통합 DNSBL: SBL(확인된 스팸 발신원), CSS(자동 스팸 발신자 탐지), XBL(악용된 호스트), PBL(메일 정책 범위), BCL(봇넷 컨트롤러).",
      "spamhaus-drop":
        "범죄 조직이나 불릿프루프 호스팅 운영자가 통제하는 전체 네트워크 블록의 무료 Spamhaus 피드입니다. 매시간 갱신되는 캐시 복사본으로 로컬에서 확인합니다.",
      spamcop:
        "스팸 트랩과 사용자의 스팸 신고로 만든 이메일 차단 목록입니다. 등록 기간이 짧고 최근 발송 행동을 반영합니다.",
      barracuda:
        "Barracuda Networks 스팸 필터 네트워크에서 측정한 메일 평판 점수입니다. 집계되고 일부 과거 데이터에 기반한 신호입니다.",
      dronebl:
        "DroneBL 프로젝트가 운영하는 DNSBL로, IRC 및 모니터링 네트워크에서 관측된 드론, 침해 호스트, DDoS 참여자 및 열린 프록시를 등록합니다. 상업 및 비상업 용도로 무료입니다.",
      "blocklist-de":
        "피해 서버 운영자의 공격 신고(SSH 무차별 대입, 메일 공격, 웹 스캔 등)를 수집하는 독일의 악용 신고 플랫폼입니다.",
      "feodo-tracker":
        "봇넷 C2 서버(Dridex, Emotet, TrickBot, QakBot, BazarLoader)를 추적하는 abuse.ch 트래커입니다. 항목에는 관찰된 유효 C2 응답이 필요합니다. 캐시된 피드에서 로컬로 확인합니다.",
      greynoise:
        "인터넷 전체 스캐너에 대한 인텔리ジェンス입니다. 커뮤니티 API는 주소가 최근 스캔되었는지와 어떻게 분류되었는지 보고합니다.",
      abuseipdb:
        "신뢰도 점수가 있는 사용자 참여형 악용 신고 데이터베이스입니다. 무료 API 키(ABUSEIPDB_API_KEY)가 필요합니다.",
      httpbl:
        "웹 악용을 위한 Project Honey Pot DNSBL입니다. 이메일 수집기, 댓글 스패머 및 의심스러운 봇을 등록합니다. 무료 액세스 키(HTTPBL_ACCESS_KEY)가 필요합니다.",
      threatfox:
        "봇넷 C2 주소를 포함한 침해 지표를 공유하는 abuse.ch 플랫폼입니다. 무료 Auth-Key(THREATFOX_AUTH_KEY)가 필요합니다.",
      "ip-api":
        "IP 메타데이터: 지리 위치, 네트워크/ASN 및 연결 분류 플래그입니다.",
    },
    reputationGeoLabel: "지리 위치",
    reputationNetworkLabel: "ASN / 제공업체",
    reputationShowHiddenSources: "구성되지 않은 소스 표시({count})",
    reputationHideHiddenSources: "구성되지 않은 소스 숨기기",
  },
  ru: {
    errorRateLimited:
      "Слишком много запросов. Подождите немного и повторите попытку.",
    errorInvalidTarget:
      "Укажите действительный общедоступный домен, IP-адрес или URL.",
    errorTargetBlocked:
      "Частные, локальные и внутренние цели нельзя проверить на этом публичном сайте.",
    errorTimeout:
      "Время проверки истекло. Цель может быть медленной или недоступной.",
    errorUpstream: "Поставщик исходных данных сейчас недоступен.",
    errorBadRequest: "Параметры запроса недопустимы.",
    errorTargetNetwork: "Не удалось разрешить или связаться с целью.",
    showAll: "Показать все",
    showLess: "Показать меньше",
    navOverview: "Обзор",
    navDiagnostics: "Диагностика",
    navMyIp: "Мой IP",
    brandTagline: "Набор сетевых инструментов и IP",
    themeToggle: "Переключить тему",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    themeSystem: "Системная",
    navMenu: "Меню",
    skipToContent: "Перейти к содержимому",
    navToolsLabel: "Инструменты",
    sidebarLabel: "Навигация сайта",
    navClose: "Закрыть меню",
    copyValue: "Копировать",
    downloadJson: "Скачать JSON",
    cancelLookup: "Отмена",
    whoisNoteIana: "Сервер пересылки не найден. Показан ответ WHOIS IANA.",
    whoisNoteRdap:
      "WHOIS недоступен. Вместо него показаны регистрационные данные RDAP.",
    commandTriggerLabel: "Поиск…",
    commandPlaceholder: "Найти инструмент или введите IP, домен либо ASN…",
    commandGroupActions: "Действия",
    commandGroupPages: "Перейти к",
    commandEmpty: "Подходящих инструментов или действий нет.",
    commandHintNavigate: "Перейти",
    commandHintSelect: "Открыть",
    commandHintClose: "Закрыть",
    notFoundTitle: "Страница не найдена",
    notFoundDescription:
      "Этот адрес не относится ни к одному инструменту. Вернитесь на начальную страницу или воспользуйтесь поиском (Ctrl+K).",
    notFoundBackHome: "Вернуться на начальную страницу",
    errorTitle: "Что-то пошло не так",
    errorDescription:
      "Не удалось загрузить эту страницу. Повторите попытку — если ошибка сохраняется, причина на нашей стороне.",
    errorRetry: "Повторить попытку",
    asnRpkiValid: "RPKI действителен",
    asnRpkiInvalid: "RPKI недействителен",
    asnRpkiStatus: "RPKI: {status}",
    cdnConfidenceHigh: "Высокая",
    cdnConfidenceMedium: "Средняя",
    cdnConfidenceLow: "Низкая",
    pingTabLabel: "Тестер ping",
    dnsTabLabel: "Поиск DNS",
    whoisTabLabel: "Поиск WHOIS",
    cdnTabLabel: "Проверка CDN",
    asnTabLabel: "Поиск ASN",
    reputationTabLabel: "Репутация IP",
    pingTitle: "Тестер ping и портов",
    pingSubtitle:
      "Пошаговые проверки портов TCP/UDP, EB-точек и подключения к базам данных в понятном сценарии.",
    dnsTitle: "Поиск DNS",
    dnsSubtitle:
      "Запрашивайте записи DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) для доменов и выполняйте обратный DNS для IP-адресов.",
    whoisTitle: "Поиск WHOIS",
    whoisSubtitle:
      "Запрашивайте записи WHOIS для доменов и IP-адресов прямо в этом приложении.",
    cdnTitle: "Проверка использования CDN",
    cdnSubtitle:
      "Проанализируйте любой домен на использование CDN и определите вероятного провайдера, включая CloudFront, Google Cloud CDN, Azure CDN, Vercel и другие.",
    asnTitle: "Сведения об ASN",
    asnSubtitle:
      "Ищите автономные системы по данным ASN IPinfo и общедоступным сведениям о соединениях из PeeringDB.",
    asnPlaceholder: "AS8881 или 8881",
    asnLookupButton: "Найти ASN",
    asnLookingUp: "Идёт поиск...",
    asnInvalidInput:
      "Используйте ASN с префиксом AS или числовой ASN, например AS8881 или 8881.",
    asnInvalidRange: "ASN должен находиться в диапазоне от 1 до {max}.",
    asnNetworkError: "Произошла сетевая ошибка при обращении к поиску ASN.",
    asnUpstreamError: "Поставщики данных ASN сейчас недоступны.",
    asnRateLimitError:
      "Слишком много запросов ASN. Подождите перед повторной попыткой.",
    asnEmptyTitle: "Введите ASN, чтобы изучить профиль сети",
    asnEmptyDescription:
      "Введите значение с префиксом AS или только число. Данные поставщиков могут быть неполными в зависимости от общедоступных реестров и настроенного плана IPinfo.",
    dnsEmptyTitle: "Введите домен для разрешения его записей DNS",
    dnsEmptyDescription:
      "Найдите записи A, AAAA, MX, TXT, NS, SOA, SRV и CAA или выполните обратный поиск для IP-адреса.",
    whoisEmptyTitle: "Введите домен или IP-адрес для поиска WHOIS",
    whoisEmptyDescription:
      "Получите регистратора, даты регистрации, статус и серверы имён с соответствующего сервера WHOIS.",
    cdnEmptyTitle: "Введите домен, чтобы определить его CDN",
    cdnEmptyDescription:
      "Проверьте DNS, цепочки CNAME и заголовки ответов, чтобы определить CDN или провайдера периферийной сети, находящегося перед сайтом.",
    asnNotFoundTitle: "Профиль ASN не найден",
    asnNotFoundDescription:
      "ASN действителен, но ни один настроенный источник не вернул пригодный общедоступный профиль.",
    asnPartialData: "Частичные данные",
    asnCompleteData: "Полные",
    asnPrefixes: "Анонсируемые префиксы",
    asnRouting: "Отношения маршрутизации",
    asnPeeringDb: "Профиль PeeringDB",
    asnIxPresence: "Присутствие в IX",
    asnFacilities: "Присутствие в объектах",
    asnSourceDiagnostics: "Диагностика источников",
    asnDetailedDiagnostics: "Подробная диагностика",
    asnUnnamed: "Безымянная AS",
    asnRoutingDescription:
      "Межсетевые соединения, соседние узлы и веса путей автономной системы. Более высокие веса означают пути маршрутизации, которые наблюдаются чаще.",
    asnIxDescription:
      "Интернет-обменные узлы (IX), где присутствует эта автономная система, включая пропускную способность соединений.",
    asnPrefixesDescription:
      "Блоки IP, анонсируемые этой автономной системой в глобальной таблице маршрутизации.",
    asnPeeringDbDescription:
      "Профиль межсетевого взаимодействия и политики маршрутизации, заявленные в общедоступной базе PeeringDB.",
    asnFacilitiesDescription:
      "Физические центры обработки данных и объекты колокации, где присутствует эта сеть.",
    asnProfileIdentityHeading: "Идентификация и состояние",
    asnProfileInterconnectionHeading: "Сведения о соединениях",
    asnProfilePolicyHeading: "Политика пиринга",
    asnProfileExternalHeading: "Внешние профили",
    asnProfilePrefixes4: "Префиксы IPv4",
    asnProfilePrefixes6: "Префиксы IPv6",
    asnWarnings: "Предупреждения",
    asnDiagnosticDuration: "Длительность",
    asnDiagnosticCache: "Кэш",
    asnDiagnosticWarnings: "Предупреждения",
    asnDiagnosticSource: "Источник",
    asnSourceDiagnosticsDescription:
      "Доступность поставщиков, длительность запроса и состояние кэша для этого поиска.",
    asnCacheMiss: "не найдено",
    asnCacheFresh: "свежие",
    asnCacheStale: "устаревшие",
    asnCacheNotConfigured: "не настроен",
    asnNoPrefixes: "Настроенные источники не вернули префиксы.",
    asnNoRelations: "Настроенные источники не вернули отношений маршрутизации.",
    asnMetricIpv4Addresses: "Адреса IPv4",
    asnMetricRoutingNeighbours: "Соседние узлы маршрутизации",
    asnMetricIxPresence: "Присутствие в IX",
    asnMetricIpinfoDetail: "Данные ASN IPinfo, если настроены",
    asnMetricAnnouncedPrefixesDetail: "Анонсируемые префиксы",
    asnMetricBgpRelationshipsDetail: "Отношения BGP из IPinfo или RIPEstat",
    asnMetricPeeringDbProfileDetail: "Сетевой профиль PeeringDB",
    asnPrefixIpCount: "IP-адреса",
    asnRelationPeers: "Пиры",
    asnRelationUpstreams: "Апстримы",
    asnRelationDownstreams: "Даунстримы",
    asnRelationPower: "вес",
    asnSourceAvailable: "доступен",
    asnSourceUnavailable: "недоступен",
    asnSourceNotConfigured: "не настроен",
    asnSourceError: "ошибка",
    asnLabelName: "Название",
    asnLabelCountry: "Страна",
    asnLabelAllocated: "Выделен",
    asnLabelNetworkId: "Идентификатор сети",
    asnLabelAlsoKnownAs: "Также известен как",
    asnLabelWebsite: "Веб-сайт",
    asnLabelLookingGlass: "Looking Glass",
    asnLabelRouteServer: "Сервер маршрутов",
    asnLabelTraffic: "Трафик",
    asnLabelPolicyGeneral: "Общая политика",
    asnLabelPolicyLocations: "Местоположения политики",
    asnLabelPolicyRatio: "Коэффициент политики",
    asnLabelPolicyContracts: "Контракты политики",
    asnLabelStatus: "Состояние",
    asnLabelExchange: "Обмен",
    asnLabelSpeed: "Скорость",
    asnLabelIpv4: "IPv4",
    asnLabelIpv6: "IPv6",
    asnLabelRsPeer: "Пир RS",
    asnLabelFacility: "Объект",
    asnLabelCity: "Город",
    asnLabelLocalAsn: "Локальный ASN",
    asnSortTable: "Сортируемая таблица",
    asnSortBy: "Сортировать по: {column}",
    asnSortNotSorted: "без сортировки",
    asnSortAscending: "по возрастанию",
    asnSortDescending: "по убыванию",
    asnBooleanYes: "да",
    asnBooleanNo: "нет",
    asnSpeedMbps: "Мбит/с",
    asnNoIxLanRecords: "Записи IX LAN не возвращены.",
    asnNoFacilityRecords: "Записи объектов не возвращены.",
    asnWarningIpinfoUnavailable:
      "Данные ASN IPinfo недоступны для этого ASN или тарифа токена.",
    asnWarningIpinfoUnexpected: "IPinfo вернул неожиданные данные ASN.",
    asnWarningNoRipeStatData: "Для этого ASN данные ASN в RIPEstat не найдены.",
    asnWarningNoPeeringDbProfile:
      "Для этого ASN не найден общедоступный сетевой профиль PeeringDB.",
    asnWarningProviderHttp: "{provider} вернул HTTP {status}.",
    asnWarningProviderTimedOut: "Время ожидания запроса к {provider} истекло.",
    asnWarningProviderTooLarge:
      "Ответ {provider} превысил ограничение размера.",
    asnWarningProviderInvalidJson: "{provider} вернул недопустимый JSON.",
    asnWarningProviderUnavailable: "Данные {provider} сейчас недоступны.",
    asnWarningProviderStale:
      "Данные {provider} сейчас недоступны; используются устаревшие кэшированные данные.",
    asnWarningTruncated:
      "Данные {label} сокращены до {limit} из {total} записей.",
    asnWarningLabelIpinfoIpv4Prefixes: "Префиксы IPv4 IPinfo",
    asnWarningLabelIpinfoIpv6Prefixes: "Префиксы IPv6 IPinfo",
    asnWarningLabelIpinfoPeers: "Пиры IPinfo",
    asnWarningLabelIpinfoUpstreams: "Апстримы IPinfo",
    asnWarningLabelIpinfoDownstreams: "Даунстримы IPinfo",
    asnWarningLabelPeeringDbIxLan: "Записи IX LAN PeeringDB",
    asnWarningLabelPeeringDbFacilities: "Объекты PeeringDB",
    asnWarningLabelRipeStatIpv4Prefixes: "Префиксы IPv4 RIPEstat",
    asnWarningLabelRipeStatIpv6Prefixes: "Префиксы IPv6 RIPEstat",
    asnWarningLabelRipeStatRoutingNeighbours:
      "Соседние узлы маршрутизации RIPEstat",
    asnWarningLabelRipeStatUpstreamNeighbours:
      "Соседние узлы на стороне апстрима RIPEstat",
    asnWarningLabelRipeStatDownstreamNeighbours:
      "Соседние узлы на стороне даунстрима RIPEstat",
    targetPlaceholder: "example.com",
    lookupInProgress: "Идёт поиск...",
    dnsLookupButton: "Найти DNS",
    dnsLookupError: "Не удалось выполнить поиск DNS.",
    dnsRecordsFor: "Записи DNS для",
    resolvedAddresses: "Разрешённые адреса",
    noAddressResult: "Результат A/AAAA отсутствует.",
    recordDetails: "Сведения о записи",
    dnsRecordNotes: "Примечания к поиску записей",
    dnsTableType: "Тип",
    dnsTableValue: "Значение",
    dnsShowRaw: "Показать исходный JSON",
    dnsHideRaw: "Скрыть исходный JSON",
    dnsNoRecords: "Записи выбранного типа не возвращены.",
    whoisPlaceholder: "example.com или 8.8.8.8",
    whoisLookupButton: "Найти WHOIS",
    whoisLookupError: "Не удалось выполнить поиск WHOIS.",
    whoisFor: "WHOIS для",
    queriedServer: "Запрошенный сервер",
    referralSource: "Источник пересылки",
    noWhoisData: "Данные WHOIS не возвращены.",
    whoisRegistrar: "Регистратор",
    whoisCreated: "Создано",
    whoisUpdated: "Обновлено",
    whoisExpires: "Истекает",
    whoisStatusLabel: "Состояние",
    whoisNameservers: "Серверы имён",
    whoisShowRaw: "Показать исходный вывод",
    whoisHideRaw: "Скрыть исходный вывод",
    pingTestMode: "Режим проверки",
    pingModeHelperTcp: "Проверяет, принимает ли порт TCP соединение.",
    pingModeHelperUdp:
      "Отправляет UDP-проверку и сообщает о немедленном ответе или ошибке.",
    pingModeHelperEb:
      "Сначала проверяет TCP, затем доступность HTTP/HTTPS-точек.",
    pingModeHelperDatabase:
      "Выполняет проверки протокола до аутентификации и дополнительные проверки с аутентификацией.",
    pingModeDatabase: "База данных",
    pingDatabaseType: "Тип базы данных",
    pingTargetHost: "Целевой хост / IP",
    pingPort: "Порт",
    pingTimeout: "Тайм-аут (мс)",
    pingUseAuth: "Проверить с аутентификацией",
    pingUsername: "Имя пользователя",
    pingPassword: "Пароль",
    pingDatabaseOptional: "База данных (необязательно)",
    pingRunButton: "Запустить проверку ping",
    pingRunning: "Выполняется проверка...",
    pingNetworkError: "Произошла сетевая ошибка при обращении к /api/ping.",
    pingModeLabel: "Режим",
    pingLatencyLabel: "Задержка",
    pingTargetLabel: "Цель",
    pingDetailsLabel: "Подробности",
    pingEmptyTitle: "Проверка ещё не запускалась",
    pingEmptyDescription:
      "Выберите режим, укажите хост и порт, затем запустите проверку, чтобы измерить доступность и задержку.",
    pingStatusSuccess: "Цель доступна",
    pingStatusFailed: "Проверка не удалась",
    pingShowDetails: "Показать технические подробности",
    pingHideDetails: "Скрыть технические подробности",
    pingResultTcpOk: "TCP-соединение установлено.",
    pingResultTcpTimeout: "Истёк тайм-аут TCP через {timeoutMs} мс.",
    pingResultTcpFailed: "Не удалось установить TCP-соединение: {error}",
    pingResultUdpSent:
      "UDP-пакет отправлен. В течение {timeoutMs} мс ошибка ICMP не наблюдалась.",
    pingResultUdpResponse: "Получен UDP-ответ от {from} ({bytes} байт).",
    pingResultUdpFailed: "UDP-проверка не удалась: {error}",
    pingResultEbHttpOk: "Точка доступна через {scheme} (состояние {status}).",
    pingResultEbNoHttp:
      "TCP открыт, но на этой точке не обнаружен ответ HTTP(S).",
    pingResultEbTcpFailed: "Проверка EB не удалась на этапе TCP: {error}",
    pingResultDbConnectFailed: "Не удалось подключиться к {database}: {error}",
    pingResultDbProtocolOk:
      "Сервер {database} ответил на пробу предварительного рукопожатия до аутентификации.",
    pingResultDbProtocolFailed: "Проверка {database} не удалась: {error}",
    pingResultDbTcpOk:
      "TCP-порт {database} доступен. Для этого типа нет пробы протокола до аутентификации.",
    pingResultDbAuthUnsupported:
      "Проверки с аутентификацией реализованы только для Redis. Для {database} используйте проверку протокола.",
    pingResultDbAuthOk:
      "Аутентифицированное подключение к Redis выполнено успешно.",
    pingResultDbAuthFailed: "Проверка аутентификации Redis не удалась: {error}",
    cdnAnalyzeButton: "Проверить CDN",
    cdnAnalyzing: "Анализ...",
    cdnNetworkError: "Произошла сетевая ошибка при обращении к проверке CDN.",
    cdnSummaryUnreachable: "Цель недоступна",
    cdnSummaryNoMatch: "Надёжного совпадения CDN нет",
    cdnSummaryDetected: "CDN обнаружен",
    cdnConfidenceNa: "н/д",
    cdnNoProviderMatch: "Провайдер не совпал — разрешённые IP-адреса",
    cdnInspectIpsHint:
      "Вы можете проверить эти IP-адреса на странице поиска IP:",
    cdnTargetLabel: "Цель",
    cdnHttpStatusLabel: "Состояние HTTP",
    cdnProviderLabel: "Провайдер",
    cdnUnknown: "Неизвестно",
    cdnMatchedSignals: "Совпавшие признаки",
    cdnNoSignals: "Явные признаки CDN не совпали.",
    cdnCnameChain: "Цепочка CNAME",
    cdnNoCname: "Записи CNAME не обнаружены.",
    cdnInterestingHeaders: "Интересные заголовки ответа",
    cdnNoHeaders: "Релевантные заголовки не найдены.",
    reputationTitle: "Проверка репутации IP",
    reputationSubtitle:
      "Сопоставьте общедоступный IP-адрес с независимыми источниками репутации и разведки угроз и получите оценку риска на основе доказательств.",
    reputationPlaceholder: "8.8.8.8 или 2001:4860:4860::8888",
    reputationCheckButton: "Проверить репутацию",
    reputationChecking: "Проверка...",
    reputationNetworkError:
      "Произошла сетевая ошибка при обращении к проверке репутации.",
    reputationRateLimitError:
      "Слишком много проверок репутации. Подождите перед повторной попыткой.",
    reputationInvalidIp:
      "Введите действительный общедоступный IP-адрес (IPv4 или IPv6).",
    reputationBlockedIp:
      "Частные, зарезервированные и внутренние диапазоны IP проверять нельзя.",
    reputationEmptyTitle: "Введите IP-адрес для проверки его репутации",
    reputationEmptyDescription:
      "IP сопоставляется с DNS-блоклистами, базами сообщений о злоупотреблениях, трекерами C2 ботнетов и источниками классификации сетей. Необязательные поставщики (AbuseIPDB, GreyNoise, http:BL, ThreatFox) включаются после настройки бесплатного ключа API.",
    reputationRiskLow: "Низкий риск",
    reputationRiskMedium: "Средний риск",
    reputationRiskHigh: "Высокий риск",
    reputationHeadlineClean: "Вредоносная активность не обнаружена",
    reputationScoreLabel: "Оценка риска",
    reputationSectionSummary: "Сводка репутации",
    reputationSectionThreats: "Доказательства угроз",
    reputationSectionMail: "Репутация почты",
    reputationSectionNetwork: "Классификация сети",
    reputationSectionSources: "Источники",
    reputationSectionScore: "Как рассчитана эта оценка",
    reputationCoverageChecked: "Проверено источников: {count}",
    reputationCoverageMatched: "С доказательствами угроз: {count}",
    reputationCoveragePolicy: "С информацией о политике или контексте: {count}",
    reputationCoverageUnavailable: "Недоступно: {count}",
    reputationGeneratedAt: "Создано {time}",
    reputationNoThreatEvidence:
      "В доступных для проверки источниках не найдено прямых наблюдений вредоносной активности.",
    reputationNoMailEvidence:
      "В проверенных источниках не найдено записей о репутации почты.",
    reputationFilterAll: "Все",
    reputationNoEvidence:
      "В этой группе нет доказательств в источниках, которые удалось проверить.",
    reputationFactChecked: "Проверено",
    reputationFactMatched: "Есть доказательства угрозы",
    reputationFactUnavailable: "Недоступно",
    reputationFactCheckedAt: "Время проверки",
    reputationScoreCapped: "Ограничено по {count} исходным баллам",
    reputationConnectionLabel: "Соединение",
    reputationReverseLabel: "Обратный DNS",
    reputationFieldSource: "Источник",
    reputationFieldConfidence: "Уверенность",
    reputationFieldFirstSeen: "Первое обнаружение",
    reputationFieldLastSeen: "Последнее обнаружение",
    reputationFieldReports: "Сообщения",
    reputationFieldAttacks: "События атак",
    reputationFieldMalware: "Вредоносное ПО",
    reputationFieldDetail: "Подробности",
    reputationFieldReturnCode: "Код возврата",
    reputationPointsLabel: "+{points} баллов",
    reputationCategories: {
      mail_policy: "Запись о политике почты",
      mail_reputation: "Запись о репутации почты",
      spam_observed: "Обнаружена спам-активность",
      abuse_reported: "Сообщено о злоупотреблении",
      scanner: "Сканер всего Интернета",
      bruteforce: "Атаки полным перебором",
      web_attack: "Веб-атаки",
      ddos: "DDoS-атаки / флуд-атаки",
      botnet: "Активность ботнета",
      malware: "Инфраструктура вредоносного ПО",
      proxy: "Открытый прокси",
      vpn: "VPN / анонимайзер",
      tor: "Выходной узел Tor",
      hosting: "Хостинг / дата-центр",
      residential: "Домашняя сеть",
      mobile: "Мобильная сеть",
      benign_service: "Известный бизнес-сервис",
    },
    reputationSeverities: {
      info: "Информация",
      low: "Низкая серьёзность",
      medium: "Средняя серьёзность",
      high: "Высокая серьёзность",
      critical: "Критическая",
    },
    reputationSourceStates: {
      available: "доступен",
      clean: "чистый",
      matched: "совпал",
      policy_listed: "в списке (политика)",
      not_configured: "не настроен",
      unsupported: "не поддерживается",
      rate_limited: "ограничение частоты",
      resolver_blocked: "заблокирован резолвером",
      unavailable: "недоступен",
    },
    reputationReasons: {
      sbl: "Указан в Spamhaus SBL: проверенные источники спама, спам-сервисы или спамеры ROKSO (список на основе доказательств, поддерживаемый редакторами).",
      css: "Указан в Spamhaus CSS: автоматическое обнаружение массовой или серой отправки почты. Это более слабое доказательство, чем SBL.",
      xbl: "Указан в Spamhaus XBL: хост наблюдался с трояном, эксплойтом или открытым прокси — обычно это взломанная машина.",
      drop: "Адрес находится в сетевом блоке Spamhaus DROP: диапазоны под контролем преступных операций или хостингов для устойчивых к блокировке, используемые для вредоносного ПО, контроллеров ботнетов и спама.",
      pbl_isp:
        "Указан в Spamhaus PBL (ведётся ISP): от этого диапазона не ожидается прямая доставка SMTP-почты сторонним почтовым серверам. Это нормально для большинства домашних, динамических и пользовательских адресов и не является доказательством злоупотребления.",
      pbl_spamhaus:
        "Указан в Spamhaus PBL (ведётся Spamhaus): политический диапазон, из которого не следует напрямую доставлять почту. Это нормально для многих конечных пользовательских адресов и не является доказательством злоупотребления.",
      bcl: "Указан в Spamhaus Botnet Controller List: подтверждённая активная инфраструктура управления ботнетом и контроля над ним.",
      spamcop_listing:
        "Указан в SpamCop на основе недавних сообщений о спаме (ловушки и доказательства от пользователей). Записи перестают действовать вскоре после последнего сообщения.",
      barracuda_listing:
        "Низкая репутация почты, измеренная в сети фильтров Barracuda. Это агрегированный и частично исторический сигнал; он также может затрагивать динамически переназначаемые адреса, но не доказывает, что этот адрес сейчас отправляет спам.",
      dronebl_irc_drone:
        "Сеть DroneBL наблюдала хост как IRC-спам-дрон (бота).",
      dronebl_bottler: "Сеть DroneBL наблюдала хоста как IRC-бота Bottler.",
      dronebl_worm: "Сеть DroneBL наблюдала запуск червя или спам-бота.",
      dronebl_ddos_drone:
        "Наблюдался как DDoS-дрон (участвует в распределённых атаках).",
      dronebl_open_socks_proxy:
        "Наблюдался запуск открытого SOCKS-прокси — инфраструктуры, которой можно злоупотребить, но которая сама по себе не обязательно вредоносна.",
      dronebl_open_http_proxy:
        "Наблюдался запуск открытого HTTP-прокси — инфраструктуры, которой можно злоупотребить, но которая сама по себе не обязательно вредоносна.",
      dronebl_proxychain: "Наблюдался как часть цепочки прокси.",
      dronebl_web_proxy: "Наблюдался запуск открытого веб-прокси.",
      dronebl_dictionary:
        "Наблюдались автоматизированные словарные атаки (полный перебор).",
      dronebl_wingate: "Наблюдался запуск открытого прокси WinGate.",
      dronebl_compromised_router:
        "Наблюдался как взломанный маршрутизатор или шлюз.",
      dronebl_botnet_auto:
        "DroneBL автоматически классифицировал хост как инфраструктуру ботнета (экспериментальное обнаружение).",
      dronebl_compromised_host:
        "Через IRC обнаружен возможный взломанный хост.",
      dronebl_uncategorized:
        "Указан в DroneBL с неклассифицированным типом угрозы.",
      bld_attack:
        "Сообщения об атаках, отправленные операторами затронутых серверов и собранные blocklist.de. Активная запись DNS означает, что недавно поступали сообщения об атаках.",
      bld_counts_only:
        "Исторические сообщения о злоупотреблениях, зафиксированные blocklist.de; адрес сейчас не находится в активной зоне DNS.",
      feodo_c2_online:
        "Активный сервер управления ботнетом и контроля над ним, подтверждённый Feodo Tracker (abuse.ch) через действительный ответ C2.",
      feodo_c2_offline:
        "Сервер C2 ботнета, отслеживаемый Feodo Tracker (abuse.ch); последний раз замечен в последние дни и сохранён в блоклисте.",
      greynoise_scanner_malicious:
        "В последние 90 дней хост наблюдался при сканировании Интернета и был классифицирован GreyNoise как вредоносный.",
      greynoise_scanner_unknown:
        "В последние 90 дней хост наблюдался при сканировании Интернета, но GreyNoise не смог классифицировать активность.",
      greynoise_scanner_benign:
        "Наблюдалось сканирование Интернета, но GreyNoise классифицировал активность как безвредную, например как исследовательский проект.",
      greynoise_riot:
        "Известный распространённый бизнес-сервис из набора данных GreyNoise RIOT, например CDN или компания по безопасности.",
      abuseipdb_reports:
        "Сообщения о злоупотреблениях, отправленные пользователями AbuseIPDB за последние 90 дней. Оценка уверенности отражает объём и согласованность сообщений.",
      abuseipdb_tor: "AbuseIPDB определил адрес как выходной узел Tor.",
      threatfox_ioc:
        "Опубликован как индикатор угрозы (IOC) в базе abuse.ch ThreatFox и предоставляется исследователям безопасности.",
      httpbl_search_engine: "Известный поисковый робот (Project Honey Pot).",
      httpbl_suspicious:
        "Подозрительный посетитель веб-сайта, наблюдавшийся в сети honeypot Project Honey Pot. Часто это безвредный робот, но следует действовать осторожно.",
      httpbl_harvester:
        "Наблюдался сбор адресов электронной почты из honeypot в сети Project Honey Pot.",
      httpbl_comment_spammer:
        "Наблюдалась публикация спама в комментариях на honeypot в сети Project Honey Pot.",
      ipapi_vpn:
        "ip-api.com пометил адрес как VPN, прокси или сервис анонимизации.",
      ipapi_hosting:
        "ip-api.com пометил адрес как адрес хостинга или дата-центра.",
      ipapi_mobile:
        "ip-api.com определил соединение как мобильное или сотовое.",
      residential_estimate:
        "Предполагаемое домашнее соединение на основе типа соединения и имени в обратном DNS — эвристика без подтверждения провайдером.",
      corroboration:
        "Несколько независимых источников сообщают о вредоносной активности для этого адреса.",
      mail_corroboration:
        "Этот адрес содержится в нескольких независимых списках репутации почты.",
    },
    reputationSourceDescriptions: {
      "spamhaus-zen":
        "Комбинированный DNSBL Spamhaus: SBL (проверенные источники спама), CSS (автоматическое обнаружение спамеров), XBL (взломанные хосты), PBL (диапазоны политики почты), BCL (контроллеры ботнетов).",
      "spamhaus-drop":
        "Бесплатная лента Spamhaus с целыми сетевыми блоками под контролем преступных организаций и устойчивого хостинга. Проверяется локально из кэшированной копии, обновляемой каждый час.",
      spamcop:
        "Блоклист почты, созданный по спам-ловушкам и сообщениям пользователей. Записи недолговечны и отражают недавнее поведение отправки.",
      barracuda:
        "Оценки репутации почты, измеренные в сети спам-фильтров Barracuda Networks. Это агрегированный и частично исторический сигнал.",
      dronebl:
        "DNSBL проекта DroneBL, в котором перечислены дроны, взломанные хосты, участники DDoS-атак и открытые прокси, обнаруженные IRC- и мониторинговыми сетями. Бесплатен для коммерческого и некоммерческого использования.",
      "blocklist-de":
        "Немецкая платформа сообщений о злоупотреблениях, собирающая сообщения об атаках (SSH brute force, почтовые атаки, веб-сканирование и т. д.) от операторов затронутых серверов.",
      "feodo-tracker":
        "Трекер abuse.ch для серверов C2 ботнетов (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Для записей требуется наблюдавшийся действительный ответ C2. Проверяется локально из кэшированной ленты.",
      greynoise:
        "Разведка о сканерах всего Интернета. Сообщественный API сообщает, наблюдался ли адрес при недавнем сканировании и как он классифицирован.",
      abuseipdb:
        "Краудсорсинговая база сообщений о злоупотреблениях с оценкой уверенности. Требуется бесплатный ключ API (ABUSEIPDB_API_KEY).",
      httpbl:
        "DNSBL Project Honey Pot для веб-злоупотреблений: сборщики адресов, спамеры комментариев и подозрительные боты. Требуется бесплатный ключ доступа (HTTPBL_ACCESS_KEY).",
      threatfox:
        "Платформа abuse.ch для обмена индикаторами компрометации, включая адреса C2 ботнетов. Требуется бесплатный Auth-Key (THREATFOX_AUTH_KEY).",
      "ip-api":
        "Метаданные IP: геолокация, сеть/ASN и флаги классификации соединения.",
    },
    reputationGeoLabel: "Геолокация",
    reputationNetworkLabel: "ASN / провайдер",
    reputationShowHiddenSources: "Показать ненастроенные источники ({count})",
    reputationHideHiddenSources: "Скрыть ненастроенные источники",
  },
};
