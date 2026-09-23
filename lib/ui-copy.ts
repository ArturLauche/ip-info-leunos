import type { Locale } from "@/lib/locale-config";

export type UiCopy = {
  pingDatabaseGeneric: string;
  pingCustomPort: string;
  dnsTypeAll: string;
  dnsErrorTimeout: string;
  dnsErrorNotFound: string;
  dnsErrorTemporary: string;
  dnsRecordQueryError: string;
  dnsErrorUnknown: string;
  pingResultUnknown: string;
  pingDetailUdpConnectionless: string;
  pingDetailGenericDatabaseTcpOnly: string;
  cdnReasonMatchedSignals: string;
  cdnReasonGoogleFingerprint: string;
  cdnReasonMicrosoftFingerprint: string;
  cdnReasonGenericProxyHeaders: string;
  cdnReasonUnreachable: string;
  cdnReasonNoKnownSignature: string;
  cdnProviderUnknownProxy: string;
  cdnSignalHeader: string;
  cdnSignalHeaderValue: string;
  cdnSignalDns: string;
  reputationDetailRiot: string;
  reputationDetailThreatType: string;
  reputationDetailC2Status: string;
  reputationDetailNetwork: string;
  reputationDetailService: string;
  asnPolicyRequired: string;
  asnPolicyNotRequired: string;
  asnWarningUnknown: string;
  emailAt: string;
  emailDot: string;
  localeCookieNotice: string;
  languageSelectorLabel: string;
  structuredDataCategory: string;
  structuredDataOperatingSystem: string;
  structuredDataBrowserRequirements: string;
};

export const uiCopy: Record<Locale, UiCopy> = {
  en: {
    pingDatabaseGeneric: "Generic TCP database",
    pingCustomPort: "Custom port",
    dnsTypeAll: "All",
    dnsErrorTimeout: "The DNS query timed out.",
    dnsErrorNotFound: "No DNS record was found.",
    dnsErrorTemporary: "The DNS resolver returned a temporary failure.",
    dnsRecordQueryError: "{type}: the record query failed.",
    dnsErrorUnknown: "The DNS lookup failed.",
    pingResultUnknown: "The check returned an unknown result.",
    pingDetailUdpConnectionless:
      "UDP is connectionless; success means the packet was sent without an immediate error.",
    pingDetailGenericDatabaseTcpOnly:
      "This confirms TCP reachability, not database authentication or protocol readiness.",
    cdnReasonMatchedSignals: "Matched CDN signals.",
    cdnReasonGoogleFingerprint: "Google frontend server fingerprint detected.",
    cdnReasonMicrosoftFingerprint: "Microsoft server fingerprint detected.",
    cdnReasonGenericProxyHeaders:
      "Caching or proxy headers were found, but no provider-specific signature matched.",
    cdnReasonUnreachable: "The target could not be reached from the server.",
    cdnReasonNoKnownSignature: "No known CDN signature was detected.",
    cdnProviderUnknownProxy: "Unknown CDN / reverse proxy",
    cdnSignalHeader: "header",
    cdnSignalHeaderValue: "header value",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC type",
    reputationDetailC2Status: "C2 status",
    reputationDetailNetwork: "Network",
    reputationDetailService: "Service",
    asnPolicyRequired: "Required",
    asnPolicyNotRequired: "Not required",
    asnWarningUnknown: "The data provider returned an additional warning.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "A functional cookie stores your language choice. It is not used for tracking or advertising.",
    languageSelectorLabel: "Select language",
    structuredDataCategory: "Internet and network information tool",
    structuredDataOperatingSystem: "Any system with a modern web browser",
    structuredDataBrowserRequirements:
      "Requires JavaScript for interactive lookups",
  },
  de: {
    pingDatabaseGeneric: "Allgemeine TCP-Datenbank",
    pingCustomPort: "Manueller Port",
    dnsTypeAll: "Alle",
    dnsErrorTimeout: "Die DNS-Abfrage hat zu lange gedauert.",
    dnsErrorNotFound: "Es wurde kein DNS-Eintrag gefunden.",
    dnsErrorTemporary: "Der DNS-Resolver hat einen temporären Fehler gemeldet.",
    dnsRecordQueryError: "{type}: Die Record-Abfrage ist fehlgeschlagen.",
    dnsErrorUnknown: "Die DNS-Abfrage ist fehlgeschlagen.",
    pingResultUnknown: "Die Prüfung hat ein unbekanntes Ergebnis geliefert.",
    pingDetailUdpConnectionless:
      "UDP ist verbindungslos; Erfolg bedeutet, dass das Paket ohne sofortigen Fehler gesendet wurde.",
    pingDetailGenericDatabaseTcpOnly:
      "Dies bestätigt TCP-Erreichbarkeit, nicht die Datenbankauthentifizierung oder Protokollbereitschaft.",
    cdnReasonMatchedSignals: "CDN-Signale erkannt.",
    cdnReasonGoogleFingerprint: "Google-Frontend-Server-Fingerabdruck erkannt.",
    cdnReasonMicrosoftFingerprint: "Microsoft-Server-Fingerabdruck erkannt.",
    cdnReasonGenericProxyHeaders:
      "Cache- oder Proxy-Header gefunden, aber keine anbieterspezifische Signatur.",
    cdnReasonUnreachable: "Das Ziel konnte vom Server nicht erreicht werden.",
    cdnReasonNoKnownSignature: "Keine bekannte CDN-Signatur erkannt.",
    cdnProviderUnknownProxy: "Unbekanntes CDN / Reverse Proxy",
    cdnSignalHeader: "Header",
    cdnSignalHeaderValue: "Headerwert",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC-Typ",
    reputationDetailC2Status: "C2-Status",
    reputationDetailNetwork: "Netzwerk",
    reputationDetailService: "Dienst",
    asnPolicyRequired: "Erforderlich",
    asnPolicyNotRequired: "Nicht erforderlich",
    asnWarningUnknown:
      "Der Datenanbieter hat eine zusätzliche Warnung zurückgegeben.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Ein funktionales Cookie speichert Ihre Sprachauswahl. Es wird weder für Tracking noch für Werbung verwendet.",
    languageSelectorLabel: "Sprache auswählen",
    structuredDataCategory: "Werkzeug für Internet- und Netzwerkinformationen",
    structuredDataOperatingSystem: "Jedes System mit einem modernen Webbrowser",
    structuredDataBrowserRequirements:
      "Für interaktive Abfragen ist JavaScript erforderlich",
  },
  es: {
    pingDatabaseGeneric: "Base de datos TCP genérica",
    pingCustomPort: "Puerto personalizado",
    dnsTypeAll: "Todos",
    dnsErrorTimeout: "La consulta DNS ha agotado el tiempo de espera.",
    dnsErrorNotFound: "No se encontró ningún registro DNS.",
    dnsErrorTemporary: "El resolvedor DNS devolvió un error temporal.",
    dnsRecordQueryError: "{type}: la consulta del registro falló.",
    dnsErrorUnknown: "La búsqueda DNS falló.",
    pingResultUnknown: "La comprobación devolvió un resultado desconocido.",
    pingDetailUdpConnectionless:
      "UDP no establece conexiones; el éxito significa que el paquete se envió sin un error inmediato.",
    pingDetailGenericDatabaseTcpOnly:
      "Esto confirma la accesibilidad por TCP, no la autenticación de la base de datos ni la disponibilidad del protocolo.",
    cdnReasonMatchedSignals: "Se detectaron señales de CDN.",
    cdnReasonGoogleFingerprint:
      "Se detectó la huella del servidor frontend de Google.",
    cdnReasonMicrosoftFingerprint:
      "Se detectó la huella del servidor de Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Se encontraron cabeceras de caché o proxy, pero no coincidió ninguna firma específica de proveedor.",
    cdnReasonUnreachable: "No se pudo alcanzar el destino desde el servidor.",
    cdnReasonNoKnownSignature: "No se detectó ninguna firma conocida de CDN.",
    cdnProviderUnknownProxy: "CDN / proxy inverso desconocido",
    cdnSignalHeader: "cabecera",
    cdnSignalHeaderValue: "valor de la cabecera",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Tipo de IOC",
    reputationDetailC2Status: "Estado de C2",
    reputationDetailNetwork: "Red",
    reputationDetailService: "Servicio",
    asnPolicyRequired: "Obligatorio",
    asnPolicyNotRequired: "No obligatorio",
    asnWarningUnknown:
      "El proveedor de datos devolvió una advertencia adicional.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Una cookie funcional almacena tu elección de idioma. No se utiliza para el seguimiento ni para la publicidad.",
    languageSelectorLabel: "Seleccionar idioma",
    structuredDataCategory: "Herramienta de información de Internet y redes",
    structuredDataOperatingSystem:
      "Cualquier sistema con un navegador web moderno",
    structuredDataBrowserRequirements:
      "Requiere JavaScript para consultas interactivas",
  },
  fr: {
    pingDatabaseGeneric: "Base de données TCP générique",
    pingCustomPort: "Port personnalisé",
    dnsTypeAll: "Tous",
    dnsErrorTimeout: "La requête DNS a expiré.",
    dnsErrorNotFound: "Aucun enregistrement DNS n’a été trouvé.",
    dnsErrorTemporary: "Le résolveur DNS a renvoyé une erreur temporaire.",
    dnsRecordQueryError: "{type} : la requête de l’enregistrement a échoué.",
    dnsErrorUnknown: "La résolution DNS a échoué.",
    pingResultUnknown: "Le test a renvoyé un résultat inconnu.",
    pingDetailUdpConnectionless:
      "L’UDP est sans connexion ; une réussite signifie que le paquet a été envoyé sans erreur immédiate.",
    pingDetailGenericDatabaseTcpOnly:
      "Cela confirme l’accessibilité TCP, et non l’authentification de la base de données ni la disponibilité du protocole.",
    cdnReasonMatchedSignals: "Signaux CDN détectés.",
    cdnReasonGoogleFingerprint:
      "Empreinte du serveur frontend de Google détectée.",
    cdnReasonMicrosoftFingerprint: "Empreinte du serveur Microsoft détectée.",
    cdnReasonGenericProxyHeaders:
      "Des en-têtes de cache ou de proxy ont été trouvés, mais aucune signature spécifique à un fournisseur n’a correspondu.",
    cdnReasonUnreachable:
      "La cible n’a pas pu être atteinte depuis le serveur.",
    cdnReasonNoKnownSignature: "Aucune signature CDN connue n’a été détectée.",
    cdnProviderUnknownProxy: "CDN / proxy inverse inconnu",
    cdnSignalHeader: "en-tête",
    cdnSignalHeaderValue: "valeur de l’en-tête",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Type d’IOC",
    reputationDetailC2Status: "État C2",
    reputationDetailNetwork: "Réseau",
    reputationDetailService: "Service",
    asnPolicyRequired: "Obligatoire",
    asnPolicyNotRequired: "Non obligatoire",
    asnWarningUnknown:
      "Le fournisseur de données a renvoyé un avertissement supplémentaire.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Un cookie fonctionnel enregistre votre choix de langue. Il n’est pas utilisé pour le suivi ni pour la publicité.",
    languageSelectorLabel: "Sélectionner la langue",
    structuredDataCategory: "Outil d’information sur Internet et les réseaux",
    structuredDataOperatingSystem:
      "Tout système équipé d’un navigateur web moderne",
    structuredDataBrowserRequirements:
      "Nécessite JavaScript pour les recherches interactives",
  },
  it: {
    pingDatabaseGeneric: "Database TCP generico",
    pingCustomPort: "Porta personalizzata",
    dnsTypeAll: "Tutti",
    dnsErrorTimeout: "La query DNS è scaduta.",
    dnsErrorNotFound: "Non è stato trovato alcun record DNS.",
    dnsErrorTemporary: "Il resolver DNS ha restituito un errore temporaneo.",
    dnsRecordQueryError: "{type}: la query del record non è riuscita.",
    dnsErrorUnknown: "La ricerca DNS non è riuscita.",
    pingResultUnknown: "Il controllo ha restituito un risultato sconosciuto.",
    pingDetailUdpConnectionless:
      "L’UDP è senza connessione; un esito positivo significa che il pacchetto è stato inviato senza errori immediati.",
    pingDetailGenericDatabaseTcpOnly:
      "Questo conferma la raggiungibilità TCP, non l’autenticazione del database o la disponibilità del protocollo.",
    cdnReasonMatchedSignals: "Rilevati segnali CDN.",
    cdnReasonGoogleFingerprint:
      "Rilevata l’impronta del server frontend di Google.",
    cdnReasonMicrosoftFingerprint: "Rilevata l’impronta del server Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Sono stati trovati header di cache o proxy, ma nessuna firma specifica del provider corrisponde.",
    cdnReasonUnreachable:
      "Non è stato possibile raggiungere la destinazione dal server.",
    cdnReasonNoKnownSignature: "Non è stata rilevata alcuna firma CDN nota.",
    cdnProviderUnknownProxy: "CDN / reverse proxy sconosciuto",
    cdnSignalHeader: "header",
    cdnSignalHeaderValue: "valore dell’header",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Tipo di IOC",
    reputationDetailC2Status: "Stato C2",
    reputationDetailNetwork: "Rete",
    reputationDetailService: "Servizio",
    asnPolicyRequired: "Obbligatorio",
    asnPolicyNotRequired: "Non obbligatorio",
    asnWarningUnknown:
      "Il provider dei dati ha restituito un avviso aggiuntivo.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Un cookie funzionale memorizza la scelta della lingua. Non viene utilizzato per il tracciamento o la pubblicità.",
    languageSelectorLabel: "Seleziona la lingua",
    structuredDataCategory: "Strumento di informazioni su Internet e rete",
    structuredDataOperatingSystem:
      "Qualsiasi sistema con un browser web moderno",
    structuredDataBrowserRequirements:
      "Richiede JavaScript per le ricerche interattive",
  },
  nl: {
    pingDatabaseGeneric: "Generieke TCP-database",
    pingCustomPort: "Aangepaste poort",
    dnsTypeAll: "Alle",
    dnsErrorTimeout: "De DNS-query is verlopen.",
    dnsErrorNotFound: "Er is geen DNS-record gevonden.",
    dnsErrorTemporary: "De DNS-resolver gaf een tijdelijke fout terug.",
    dnsRecordQueryError: "{type}: de DNS-recordquery is mislukt.",
    dnsErrorUnknown: "De DNS-lookup is mislukt.",
    pingResultUnknown: "De controle gaf een onbekend resultaat.",
    pingDetailUdpConnectionless:
      "UDP is verbindingsloos; succes betekent dat het pakket zonder onmiddellijke fout is verzonden.",
    pingDetailGenericDatabaseTcpOnly:
      "Dit bevestigt TCP-bereikbaarheid, niet database-authenticatie of de gereedheid van het protocol.",
    cdnReasonMatchedSignals: "CDN-signalen gedetecteerd.",
    cdnReasonGoogleFingerprint:
      "Vingerafdruk van Google-frontendserver gedetecteerd.",
    cdnReasonMicrosoftFingerprint:
      "Vingerafdruk van Microsoft-server gedetecteerd.",
    cdnReasonGenericProxyHeaders:
      "Cache- of proxyheaders gevonden, maar er paste geen providerspecifieke handtekening.",
    cdnReasonUnreachable: "Het doel kon vanaf de server niet worden bereikt.",
    cdnReasonNoKnownSignature:
      "Er is geen bekende CDN-handtekening gedetecteerd.",
    cdnProviderUnknownProxy: "Onbekende CDN / reverse proxy",
    cdnSignalHeader: "header",
    cdnSignalHeaderValue: "headervalue",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC-type",
    reputationDetailC2Status: "C2-status",
    reputationDetailNetwork: "Netwerk",
    reputationDetailService: "Dienst",
    asnPolicyRequired: "Verplicht",
    asnPolicyNotRequired: "Niet verplicht",
    asnWarningUnknown: "De gegevensprovider gaf een extra waarschuwing.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Een functionele cookie slaat uw taalkeuze op. Deze wordt niet gebruikt voor tracking of reclame.",
    languageSelectorLabel: "Taal selecteren",
    structuredDataCategory: "Tool voor internet- en netwerkinformatie",
    structuredDataOperatingSystem: "Elk systeem met een moderne webbrowser",
    structuredDataBrowserRequirements:
      "Vereist JavaScript voor interactieve zoekopdrachten",
  },
  pl: {
    pingDatabaseGeneric: "Ogólna baza danych TCP",
    pingCustomPort: "Port niestandardowy",
    dnsTypeAll: "Wszystkie",
    dnsErrorTimeout: "Zapytanie DNS upłynęło.",
    dnsErrorNotFound: "Nie znaleziono żadnego rekordu DNS.",
    dnsErrorTemporary: "Resolver DNS zwrócił tymczasowy błąd.",
    dnsRecordQueryError: "{type}: zapytanie rekordu nie powiodło się.",
    dnsErrorUnknown: "Wyszukiwanie DNS nie powiodło się.",
    pingResultUnknown: "Test zwrócił nieznany wynik.",
    pingDetailUdpConnectionless:
      "UDP jest bezpołączeniowy; sukces oznacza, że pakiet został wysłany bez natychmiastowego błędu.",
    pingDetailGenericDatabaseTcpOnly:
      "Potwierdza to osiągalność przez TCP, a nie uwierzytelnianie w bazie danych ani gotowość protokołu.",
    cdnReasonMatchedSignals: "Wykryto sygnały CDN.",
    cdnReasonGoogleFingerprint: "Wykryto odcisk serwera frontendowego Google.",
    cdnReasonMicrosoftFingerprint: "Wykryto odcisk serwera Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Znaleziono nagłówki pamięci podręcznej lub proxy, ale żadna sygnatura konkretnego dostawcy nie pasowała.",
    cdnReasonUnreachable: "Nie udało się osiągnąć celu z serwera.",
    cdnReasonNoKnownSignature: "Nie wykryto znanej sygnatury CDN.",
    cdnProviderUnknownProxy: "Nieznany CDN / reverse proxy",
    cdnSignalHeader: "nagłówek",
    cdnSignalHeaderValue: "wartość nagłówka",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Typ IOC",
    reputationDetailC2Status: "Status C2",
    reputationDetailNetwork: "Sieć",
    reputationDetailService: "Usługa",
    asnPolicyRequired: "Wymagane",
    asnPolicyNotRequired: "Nie wymagane",
    asnWarningUnknown: "Dostawca danych zwrócił dodatkowe ostrzeżenie.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Funkcjonalny plik cookie przechowuje wybrany język. Nie jest używany do śledzenia ani reklam.",
    languageSelectorLabel: "Wybierz język",
    structuredDataCategory: "Narzędzie do informacji o Internecie i sieciach",
    structuredDataOperatingSystem:
      "Dowolny system z nowoczesną przeglądarką internetową",
    structuredDataBrowserRequirements:
      "Wymaga JavaScript do interaktywnych wyszukiwań",
  },
  "pt-BR": {
    pingDatabaseGeneric: "Banco de dados TCP genérico",
    pingCustomPort: "Porta personalizada",
    dnsTypeAll: "Todos",
    dnsErrorTimeout: "A consulta DNS expirou.",
    dnsErrorNotFound: "Nenhum registro DNS foi encontrado.",
    dnsErrorTemporary: "O resolvedor DNS retornou uma falha temporária.",
    dnsRecordQueryError: "{type}: a consulta do registro falhou.",
    dnsErrorUnknown: "A consulta DNS falhou.",
    pingResultUnknown: "A verificação retornou um resultado desconhecido.",
    pingDetailUdpConnectionless:
      "O UDP não mantém conexão; o sucesso significa que o pacote foi enviado sem erro imediato.",
    pingDetailGenericDatabaseTcpOnly:
      "Isso confirma a acessibilidade por TCP, não a autenticação do banco de dados nem a prontidão do protocolo.",
    cdnReasonMatchedSignals: "Sinais de CDN detectados.",
    cdnReasonGoogleFingerprint:
      "Impressão digital do servidor frontend do Google detectada.",
    cdnReasonMicrosoftFingerprint:
      "Impressão digital do servidor Microsoft detectada.",
    cdnReasonGenericProxyHeaders:
      "Cabeçalhos de cache ou proxy foram encontrados, mas nenhuma assinatura específica de fornecedor correspondeu.",
    cdnReasonUnreachable:
      "Não foi possível alcançar o alvo a partir do servidor.",
    cdnReasonNoKnownSignature:
      "Nenhuma assinatura CDN conhecida foi detectada.",
    cdnProviderUnknownProxy: "CDN / proxy reverso desconhecido",
    cdnSignalHeader: "cabeçalho",
    cdnSignalHeaderValue: "valor do cabeçalho",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Tipo de IOC",
    reputationDetailC2Status: "Status do C2",
    reputationDetailNetwork: "Rede",
    reputationDetailService: "Serviço",
    asnPolicyRequired: "Obrigatório",
    asnPolicyNotRequired: "Não obrigatório",
    asnWarningUnknown: "O provedor de dados retornou um aviso adicional.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Um cookie funcional armazena sua escolha de idioma. Ele não é usado para rastreamento nem publicidade.",
    languageSelectorLabel: "Selecionar idioma",
    structuredDataCategory: "Ferramenta de informações sobre Internet e redes",
    structuredDataOperatingSystem:
      "Qualquer sistema com um navegador web moderno",
    structuredDataBrowserRequirements:
      "Requer JavaScript para consultas interativas",
  },
  "pt-PT": {
    pingDatabaseGeneric: "Base de dados TCP genérica",
    pingCustomPort: "Porta personalizada",
    dnsTypeAll: "Todos",
    dnsErrorTimeout: "A consulta DNS expirou.",
    dnsErrorNotFound: "Não foi encontrado nenhum registo DNS.",
    dnsErrorTemporary: "O resolvedor DNS devolveu uma falha temporária.",
    dnsRecordQueryError: "{type}: a consulta do registo falhou.",
    dnsErrorUnknown: "A pesquisa DNS falhou.",
    pingResultUnknown: "O teste devolveu um resultado desconhecido.",
    pingDetailUdpConnectionless:
      "O UDP não mantém ligação; o sucesso significa que o pacote foi enviado sem erro imediato.",
    pingDetailGenericDatabaseTcpOnly:
      "Isto confirma a acessibilidade por TCP, não a autenticação da base de dados nem a prontidão do protocolo.",
    cdnReasonMatchedSignals: "Foram detetados sinais de CDN.",
    cdnReasonGoogleFingerprint:
      "Impressão digital do servidor frontend do Google detetada.",
    cdnReasonMicrosoftFingerprint:
      "Impressão digital do servidor Microsoft detetada.",
    cdnReasonGenericProxyHeaders:
      "Foram encontrados cabeçalhos de cache ou proxy, mas nenhuma assinatura específica de fornecedor correspondeu.",
    cdnReasonUnreachable:
      "Não foi possível alcançar o alvo a partir do servidor.",
    cdnReasonNoKnownSignature:
      "Não foi detetada nenhuma assinatura CDN conhecida.",
    cdnProviderUnknownProxy: "CDN / proxy inverso desconhecido",
    cdnSignalHeader: "cabeçalho",
    cdnSignalHeaderValue: "valor do cabeçalho",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Tipo de IOC",
    reputationDetailC2Status: "Estado do C2",
    reputationDetailNetwork: "Rede",
    reputationDetailService: "Serviço",
    asnPolicyRequired: "Obrigatório",
    asnPolicyNotRequired: "Não obrigatório",
    asnWarningUnknown: "O fornecedor de dados devolveu um aviso adicional.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Um cookie funcional guarda a sua escolha de idioma. Não é utilizado para rastreio nem publicidade.",
    languageSelectorLabel: "Selecionar idioma",
    structuredDataCategory: "Ferramenta de informações sobre Internet e redes",
    structuredDataOperatingSystem:
      "Qualquer sistema com um navegador web moderno",
    structuredDataBrowserRequirements:
      "Requer JavaScript para consultas interativas",
  },
  ja: {
    pingDatabaseGeneric: "汎用TCPデータベース",
    pingCustomPort: "カスタムポート",
    dnsTypeAll: "すべて",
    dnsErrorTimeout: "DNSクエリがタイムアウトしました。",
    dnsErrorNotFound: "DNSレコードが見つかりませんでした。",
    dnsErrorTemporary: "DNSリゾルバーが一時的なエラーを返しました。",
    dnsRecordQueryError: "{type}: レコードの取得に失敗しました。",
    dnsErrorUnknown: "DNS検索に失敗しました。",
    pingResultUnknown: "チェック結果が不明でした。",
    pingDetailUdpConnectionless:
      "UDPは接続を確立しないため、成功とは、即時エラーなしでパケットが送信されたことを意味します。",
    pingDetailGenericDatabaseTcpOnly:
      "これはTCPの到達性を確認するもので、データベース認証やプロトコルの準備状況を確認するものではありません。",
    cdnReasonMatchedSignals: "CDNシグナルを検出しました。",
    cdnReasonGoogleFingerprint:
      "Googleフロントエンドサーバーのフィンガープリントを検出しました。",
    cdnReasonMicrosoftFingerprint:
      "Microsoftサーバーのフィンガープリントを検出しました。",
    cdnReasonGenericProxyHeaders:
      "キャッシュまたはプロキシヘッダーが見つかりましたが、プロバイダー固有のシグネチャは一致しませんでした。",
    cdnReasonUnreachable: "サーバーから対象へ到達できませんでした。",
    cdnReasonNoKnownSignature: "既知のCDNシグネチャは検出されませんでした。",
    cdnProviderUnknownProxy: "不明なCDN / リバースプロキシ",
    cdnSignalHeader: "ヘッダー",
    cdnSignalHeaderValue: "ヘッダー値",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOCの種類",
    reputationDetailC2Status: "C2ステータス",
    reputationDetailNetwork: "ネットワーク",
    reputationDetailService: "サービス",
    asnPolicyRequired: "必須",
    asnPolicyNotRequired: "必須ではない",
    asnWarningUnknown: "データプロバイダーから追加の警告が返されました。",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "機能的なCookieは、選択した言語を保存します。トラッキングや広告には使用されません。",
    languageSelectorLabel: "言語を選択",
    structuredDataCategory: "インターネットとネットワークの情報ツール",
    structuredDataOperatingSystem:
      "最新のウェブブラウザーを備えたすべてのシステム",
    structuredDataBrowserRequirements:
      "インタラクティブな検索にはJavaScriptが必要です",
  },
  ko: {
    pingDatabaseGeneric: "범용 TCP 데이터베이스",
    pingCustomPort: "사용자 지정 포트",
    dnsTypeAll: "모두",
    dnsErrorTimeout: "DNS 쿼리 시간이 초과되었습니다.",
    dnsErrorNotFound: "DNS 레코드를 찾을 수 없습니다.",
    dnsErrorTemporary: "DNS 리졸버가 일시적인 오류를 반환했습니다.",
    dnsRecordQueryError: "{type}: 레코드 조회에 실패했습니다.",
    dnsErrorUnknown: "DNS 조회에 실패했습니다.",
    pingResultUnknown: "검사 결과를 알 수 없습니다.",
    pingDetailUdpConnectionless:
      "UDP는 연결을 설정하지 않는 프로토콜입니다. 성공은 즉각적인 오류 없이 패킷이 전송되었다는 뜻입니다.",
    pingDetailGenericDatabaseTcpOnly:
      "이는 TCP 연결 가능 여부를 확인할 뿐이며, 데이터베이스 인증이나 프로토콜 준비 상태를 확인하는 것은 아닙니다.",
    cdnReasonMatchedSignals: "CDN 신호가 감지되었습니다.",
    cdnReasonGoogleFingerprint:
      "Google 프런트엔드 서버의 핑거프린트가 감지되었습니다.",
    cdnReasonMicrosoftFingerprint:
      "Microsoft 서버의 핑거프린트가 감지되었습니다.",
    cdnReasonGenericProxyHeaders:
      "캐시 또는 프록시 헤더가 발견되었지만 공급업체 고유 시그니처는 일치하지 않았습니다.",
    cdnReasonUnreachable: "서버에서 대상에 도달할 수 없습니다.",
    cdnReasonNoKnownSignature: "알려진 CDN 시그니처가 감지되지 않았습니다.",
    cdnProviderUnknownProxy: "알 수 없는 CDN / 리버스 프록시",
    cdnSignalHeader: "헤더",
    cdnSignalHeaderValue: "헤더 값",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC 유형",
    reputationDetailC2Status: "C2 상태",
    reputationDetailNetwork: "네트워크",
    reputationDetailService: "서비스",
    asnPolicyRequired: "필수",
    asnPolicyNotRequired: "필수 아님",
    asnWarningUnknown: "데이터 제공업체가 추가 경고를 반환했습니다.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "기능성 쿠키는 선택한 언어를 저장합니다. 추적이나 광고에 사용되지 않습니다.",
    languageSelectorLabel: "언어 선택",
    structuredDataCategory: "인터넷 및 네트워크 정보 도구",
    structuredDataOperatingSystem: "최신 웹 브라우저가 있는 모든 시스템",
    structuredDataBrowserRequirements:
      "대화형 조회에는 JavaScript가 필요합니다",
  },
  ru: {
    pingDatabaseGeneric: "Универсальная база данных TCP",
    pingCustomPort: "Пользовательский порт",
    dnsTypeAll: "Все",
    dnsErrorTimeout: "Истекло время ожидания DNS-запроса.",
    dnsErrorNotFound: "DNS-запись не найдена.",
    dnsErrorTemporary: "DNS-резолвер вернул временную ошибку.",
    dnsRecordQueryError: "{type}: не удалось выполнить запрос записи.",
    dnsErrorUnknown: "Не удалось выполнить поиск DNS.",
    pingResultUnknown: "Проверка вернула неизвестный результат.",
    pingDetailUdpConnectionless:
      "UDP не устанавливает соединение; успех означает, что пакет отправлен без немедленной ошибки.",
    pingDetailGenericDatabaseTcpOnly:
      "Это подтверждает доступность по TCP, а не аутентификацию базы данных или готовность протокола.",
    cdnReasonMatchedSignals: "Обнаружены сигналы CDN.",
    cdnReasonGoogleFingerprint: "Обнаружен отпечаток сервера frontend Google.",
    cdnReasonMicrosoftFingerprint: "Обнаружен отпечаток сервера Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Найдены заголовки кэша или прокси, но ни одна сигнатура конкретного провайдера не совпала.",
    cdnReasonUnreachable: "С сервера не удалось связаться с целью.",
    cdnReasonNoKnownSignature: "Известная сигнатура CDN не обнаружена.",
    cdnProviderUnknownProxy: "Неизвестный CDN / обратный прокси",
    cdnSignalHeader: "заголовок",
    cdnSignalHeaderValue: "значение заголовка",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Тип IOC",
    reputationDetailC2Status: "Статус C2",
    reputationDetailNetwork: "Сеть",
    reputationDetailService: "Сервис",
    asnPolicyRequired: "Требуется",
    asnPolicyNotRequired: "Не требуется",
    asnWarningUnknown: "Поставщик данных вернул дополнительное предупреждение.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Функциональный файл cookie хранит выбранный вами язык. Он не используется для отслеживания или рекламы.",
    languageSelectorLabel: "Выбрать язык",
    structuredDataCategory:
      "Инструмент для получения информации об Интернете и сетях",
    structuredDataOperatingSystem: "Любая система с современным веб-браузером",
    structuredDataBrowserRequirements:
      "Для интерактивных запросов требуется JavaScript",
  },
  uk: {
    pingDatabaseGeneric: "Загальна база даних TCP",
    pingCustomPort: "Користувацький порт",
    dnsTypeAll: "Усі",
    dnsErrorTimeout: "Час очікування DNS-запиту минув.",
    dnsErrorNotFound: "DNS-запис не знайдено.",
    dnsErrorTemporary: "DNS-резолвер повернув тимчасову помилку.",
    dnsRecordQueryError: "{type}: не вдалося виконати запит до DNS-запису.",
    dnsErrorUnknown: "Пошук DNS не вдався.",
    pingResultUnknown: "Перевірка повернула невідомий результат.",
    pingDetailUdpConnectionless:
      "UDP не встановлює з’єднання; успіх означає, що пакет було надіслано без негайної помилки.",
    pingDetailGenericDatabaseTcpOnly:
      "Це підтверджує доступність через TCP, а не автентифікацію бази даних чи готовність протоколу.",
    cdnReasonMatchedSignals: "Виявлено сигнали CDN.",
    cdnReasonGoogleFingerprint: "Виявлено відбиток сервера frontend Google.",
    cdnReasonMicrosoftFingerprint: "Виявлено відбиток сервера Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Знайдено заголовки кешу або проксі, але жоден підпис конкретного провайдера не збігся.",
    cdnReasonUnreachable: "З сервера не вдалося зв’язатися з ціллю.",
    cdnReasonNoKnownSignature: "Відомий підпис CDN не виявлено.",
    cdnProviderUnknownProxy: "Невідомий CDN / зворотний проксі",
    cdnSignalHeader: "заголовок",
    cdnSignalHeaderValue: "значення заголовка",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Тип IOC",
    reputationDetailC2Status: "Статус C2",
    reputationDetailNetwork: "Мережа",
    reputationDetailService: "Служба",
    asnPolicyRequired: "Потрібна",
    asnPolicyNotRequired: "Не потрібна",
    asnWarningUnknown: "Постачальник даних повернув додаткове попередження.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Функціональний файл cookie зберігає вибрану вами мову. Він не використовується для відстеження чи реклами.",
    languageSelectorLabel: "Вибрати мову",
    structuredDataCategory:
      "Інструмент для отримання інформації про Інтернет і мережі",
    structuredDataOperatingSystem: "Будь-яка система із сучасним веббраузером",
    structuredDataBrowserRequirements:
      "Для інтерактивних запитів потрібен JavaScript",
  },
  "zh-CN": {
    pingDatabaseGeneric: "通用 TCP 数据库",
    pingCustomPort: "自定义端口",
    dnsTypeAll: "全部",
    dnsErrorTimeout: "DNS 查询超时。",
    dnsErrorNotFound: "未找到 DNS 记录。",
    dnsErrorTemporary: "DNS 解析器返回了临时错误。",
    dnsRecordQueryError: "{type}：记录查询失败。",
    dnsErrorUnknown: "DNS 查找失败。",
    pingResultUnknown: "检查返回了未知结果。",
    pingDetailUdpConnectionless:
      "UDP 是无连接协议；成功表示数据包已发送，且没有立即报错。",
    pingDetailGenericDatabaseTcpOnly:
      "这仅确认 TCP 可达性，不代表数据库认证或协议已就绪。",
    cdnReasonMatchedSignals: "检测到 CDN 信号。",
    cdnReasonGoogleFingerprint: "检测到 Google 前端服务器指纹。",
    cdnReasonMicrosoftFingerprint: "检测到 Microsoft 服务器指纹。",
    cdnReasonGenericProxyHeaders:
      "发现了缓存或代理标头，但没有匹配到特定提供商的特征。",
    cdnReasonUnreachable: "服务器无法连接到目标。",
    cdnReasonNoKnownSignature: "未检测到已知的 CDN 特征。",
    cdnProviderUnknownProxy: "未知 CDN / 反向代理",
    cdnSignalHeader: "标头",
    cdnSignalHeaderValue: "标头值",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC 类型",
    reputationDetailC2Status: "C2 状态",
    reputationDetailNetwork: "网络",
    reputationDetailService: "服务",
    asnPolicyRequired: "必需",
    asnPolicyNotRequired: "非必需",
    asnWarningUnknown: "数据提供商返回了额外警告。",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "功能性 Cookie 会存储您选择的语言。它不用于跟踪或广告。",
    languageSelectorLabel: "选择语言",
    structuredDataCategory: "互联网和网络信息工具",
    structuredDataOperatingSystem: "配备现代网络浏览器的任何系统",
    structuredDataBrowserRequirements: "交互式查询需要 JavaScript",
  },
  "zh-TW": {
    pingDatabaseGeneric: "一般 TCP 資料庫",
    pingCustomPort: "自訂連接埠",
    dnsTypeAll: "全部",
    dnsErrorTimeout: "DNS 查詢逾時。",
    dnsErrorNotFound: "找不到 DNS 記錄。",
    dnsErrorTemporary: "DNS 解析器傳回了暫時性錯誤。",
    dnsRecordQueryError: "{type}：記錄查詢失敗。",
    dnsErrorUnknown: "DNS 查詢失敗。",
    pingResultUnknown: "檢查傳回了未知結果。",
    pingDetailUdpConnectionless:
      "UDP 是無連線協定；成功表示封包已傳送，且沒有立即發生錯誤。",
    pingDetailGenericDatabaseTcpOnly:
      "這只確認 TCP 可達性，不代表資料庫驗證或協定已就緒。",
    cdnReasonMatchedSignals: "偵測到 CDN 訊號。",
    cdnReasonGoogleFingerprint: "偵測到 Google 前端伺服器指紋。",
    cdnReasonMicrosoftFingerprint: "偵測到 Microsoft 伺服器指紋。",
    cdnReasonGenericProxyHeaders:
      "發現快取標頭或 Proxy 標頭，但沒有比對到特定供應商的特徵。",
    cdnReasonUnreachable: "伺服器無法連線到目標。",
    cdnReasonNoKnownSignature: "未偵測到已知的 CDN 特徵。",
    cdnProviderUnknownProxy: "未知 CDN / 反向 Proxy",
    cdnSignalHeader: "標頭",
    cdnSignalHeaderValue: "標頭值",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC 類型",
    reputationDetailC2Status: "C2 狀態",
    reputationDetailNetwork: "網路",
    reputationDetailService: "服務",
    asnPolicyRequired: "必要",
    asnPolicyNotRequired: "非必要",
    asnWarningUnknown: "資料提供者傳回了額外警告。",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "功能性 Cookie 會儲存您選擇的語言。它不用於追蹤或廣告。",
    languageSelectorLabel: "選擇語言",
    structuredDataCategory: "網際網路與網路資訊工具",
    structuredDataOperatingSystem: "配備現代網頁瀏覽器的任何系統",
    structuredDataBrowserRequirements: "互動式查詢需要 JavaScript",
  },
  ar: {
    pingDatabaseGeneric: "قاعدة بيانات TCP عامة",
    pingCustomPort: "منفذ مخصص",
    dnsTypeAll: "الكل",
    dnsErrorTimeout: "انتهت مهلة استعلام DNS.",
    dnsErrorNotFound: "لم يتم العثور على أي سجل DNS.",
    dnsErrorTemporary: "أعاد محلّل DNS خطأً مؤقتًا.",
    dnsRecordQueryError: "{type}: فشل استعلام السجل.",
    dnsErrorUnknown: "فشل بحث DNS.",
    pingResultUnknown: "أعاد الفحص نتيجة غير معروفة.",
    pingDetailUdpConnectionless:
      "UDP بروتوكول بلا اتصال؛ تعني النجاحية إرسال الحزمة دون خطأ فوري.",
    pingDetailGenericDatabaseTcpOnly:
      "يؤكد هذا إمكانية الوصول عبر TCP، وليس مصادقة قاعدة البيانات أو جاهزية البروتوكول.",
    cdnReasonMatchedSignals: "تم اكتشاف إشارات CDN.",
    cdnReasonGoogleFingerprint:
      "تم اكتشاف بصمة خادم الواجهة الأمامية من Google.",
    cdnReasonMicrosoftFingerprint: "تم اكتشاف بصمة خادم Microsoft.",
    cdnReasonGenericProxyHeaders:
      "تم العثور على ترويسات ذاكرة التخزين المؤقت أو وكيل، لكن لم تتطابق أي بصمة خاصة بمزود.",
    cdnReasonUnreachable: "تعذر الوصول إلى الهدف من الخادم.",
    cdnReasonNoKnownSignature: "لم يتم اكتشاف أي بصمة معروفة لـ CDN.",
    cdnProviderUnknownProxy: "CDN / وكيل عكسي غير معروف",
    cdnSignalHeader: "ترويسة",
    cdnSignalHeaderValue: "قيمة الترويسة",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "نوع IOC",
    reputationDetailC2Status: "حالة C2",
    reputationDetailNetwork: "الشبكة",
    reputationDetailService: "الخدمة",
    asnPolicyRequired: "مطلوب",
    asnPolicyNotRequired: "غير مطلوب",
    asnWarningUnknown: "أعاد مزود البيانات تحذيرًا إضافيًا.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "يخزّن ملف تعريف الارتباط الوظيفي لغتك المختارة. ولا يُستخدم للتتبع أو الإعلانات.",
    languageSelectorLabel: "اختر اللغة",
    structuredDataCategory: "أداة معلومات عن الإنترنت والشبكات",
    structuredDataOperatingSystem: "أي نظام مزود بمتصفح ويب حديث",
    structuredDataBrowserRequirements:
      "تتطلب عمليات البحث التفاعلية JavaScript",
  },
  hi: {
    pingDatabaseGeneric: "सामान्य TCP डेटाबेस",
    pingCustomPort: "कस्टम पोर्ट",
    dnsTypeAll: "सभी",
    dnsErrorTimeout: "DNS क्वेरी टाइम आउट हो गई।",
    dnsErrorNotFound: "कोई DNS रिकॉर्ड नहीं मिला।",
    dnsErrorTemporary: "DNS रिज़ॉल्वर ने अस्थायी त्रुटि लौटाई।",
    dnsRecordQueryError: "{type}: रिकॉर्ड क्वेरी विफल रही।",
    dnsErrorUnknown: "DNS लुकअप विफल रहा।",
    pingResultUnknown: "जाँच का परिणाम अज्ञात था।",
    pingDetailUdpConnectionless:
      "UDP कनेक्शन रहित प्रोटोकॉल है; सफलता का अर्थ है कि पैकेट भेजा गया और तुरंत कोई त्रुटि नहीं हुई।",
    pingDetailGenericDatabaseTcpOnly:
      "यह TCP पहुँच की पुष्टि करता है, डेटाबेस प्रमाणीकरण या प्रोटोकॉल की तैयारी की नहीं।",
    cdnReasonMatchedSignals: "CDN संकेत मिले।",
    cdnReasonGoogleFingerprint: "Google फ्रंटएंड सर्वर का फिंगरप्रिंट मिला।",
    cdnReasonMicrosoftFingerprint: "Microsoft सर्वर का फिंगरप्रिंट मिला।",
    cdnReasonGenericProxyHeaders:
      "कैश या प्रॉक्सी हेडर मिले, लेकिन किसी विशेष प्रदाता का हस्ताक्षर मेल नहीं खाया।",
    cdnReasonUnreachable: "सर्वर से लक्ष्य तक नहीं पहुँचा जा सका।",
    cdnReasonNoKnownSignature: "कोई ज्ञात CDN हस्ताक्षर नहीं मिला।",
    cdnProviderUnknownProxy: "अज्ञात CDN / रिवर्स प्रॉक्सी",
    cdnSignalHeader: "हेडर",
    cdnSignalHeaderValue: "हेडर मान",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC प्रकार",
    reputationDetailC2Status: "C2 स्थिति",
    reputationDetailNetwork: "नेटवर्क",
    reputationDetailService: "सेवा",
    asnPolicyRequired: "आवश्यक",
    asnPolicyNotRequired: "आवश्यक नहीं",
    asnWarningUnknown: "डेटा प्रदाता ने अतिरिक्त चेतावनी दी।",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "एक कार्यात्मक कुकी आपकी चुनी हुई भाषा संग्रहीत करती है। इसका उपयोग ट्रैकिंग या विज्ञापन के लिए नहीं किया जाता है।",
    languageSelectorLabel: "भाषा चुनें",
    structuredDataCategory: "इंटरनेट और नेटवर्क की जानकारी का उपकरण",
    structuredDataOperatingSystem: "आधुनिक वेब ब्राउज़र वाला कोई भी सिस्टम",
    structuredDataBrowserRequirements:
      "इंटरैक्टिव खोज के लिए JavaScript आवश्यक है",
  },
  id: {
    pingDatabaseGeneric: "Basis data TCP umum",
    pingCustomPort: "Port khusus",
    dnsTypeAll: "Semua",
    dnsErrorTimeout: "Kuerensi DNS habis waktu.",
    dnsErrorNotFound: "Tidak ditemukan record DNS.",
    dnsErrorTemporary: "Resolver DNS mengembalikan kesalahan sementara.",
    dnsRecordQueryError: "{type}: kuerensi record gagal.",
    dnsErrorUnknown: "Pencarian DNS gagal.",
    pingResultUnknown: "Pemeriksaan mengembalikan hasil yang tidak dikenal.",
    pingDetailUdpConnectionless:
      "UDP bersifat tanpa koneksi; berhasil berarti paket dikirim tanpa error seketika.",
    pingDetailGenericDatabaseTcpOnly:
      "Ini mengonfirmasi keterjangkauan TCP, bukan autentikasi database atau kesiapan protokol.",
    cdnReasonMatchedSignals: "Sinyal CDN terdeteksi.",
    cdnReasonGoogleFingerprint:
      "Fingerprint server frontend Google terdeteksi.",
    cdnReasonMicrosoftFingerprint: "Fingerprint server Microsoft terdeteksi.",
    cdnReasonGenericProxyHeaders:
      "Header cache atau proxy ditemukan, tetapi tidak ada tanda tangan khusus penyedia yang cocok.",
    cdnReasonUnreachable: "Target tidak dapat dijangkau dari server.",
    cdnReasonNoKnownSignature: "Tidak ditemukan tanda tangan CDN yang dikenal.",
    cdnProviderUnknownProxy: "CDN / reverse proxy tidak dikenal",
    cdnSignalHeader: "header",
    cdnSignalHeaderValue: "nilai header",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Jenis IOC",
    reputationDetailC2Status: "Status C2",
    reputationDetailNetwork: "Jaringan",
    reputationDetailService: "Layanan",
    asnPolicyRequired: "Wajib",
    asnPolicyNotRequired: "Tidak wajib",
    asnWarningUnknown: "Penyedia data mengembalikan peringatan tambahan.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Cookie fungsional menyimpan pilihan bahasa Anda. Cookie ini tidak digunakan untuk pelacakan atau iklan.",
    languageSelectorLabel: "Pilih bahasa",
    structuredDataCategory: "Alat informasi internet dan jaringan",
    structuredDataOperatingSystem: "Sistem apa pun dengan peramban web modern",
    structuredDataBrowserRequirements:
      "Memerlukan JavaScript untuk pencarian interaktif",
  },
  cs: {
    pingDatabaseGeneric: "Obecná databáze TCP",
    pingCustomPort: "Vlastní port",
    dnsTypeAll: "Vše",
    dnsErrorTimeout: "Dotaz DNS vypršel.",
    dnsErrorNotFound: "Nebyl nalezen žádný záznam DNS.",
    dnsErrorTemporary: "DNS resolver vrátil dočasnou chybu.",
    dnsRecordQueryError: "{type}: dotaz na záznam selhal.",
    dnsErrorUnknown: "Vyhledávání DNS selhalo.",
    pingResultUnknown: "Kontrola vrátila neznámý výsledek.",
    pingDetailUdpConnectionless:
      "UDP je bez spojení; úspěch znamená, že byl paket odeslán bez okamžité chyby.",
    pingDetailGenericDatabaseTcpOnly:
      "Tím se potvrzuje dosažitelnost přes TCP, nikoli autentizace databáze nebo připravenost protokolu.",
    cdnReasonMatchedSignals: "Byly zjištěny signály CDN.",
    cdnReasonGoogleFingerprint: "Byl zjištěn otisk serveru frontend Google.",
    cdnReasonMicrosoftFingerprint: "Byl zjištěn otisk serveru Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Byly nalezeny hlavičky cache nebo proxy, ale neshodl se žádný podpis konkrétního poskytovatele.",
    cdnReasonUnreachable: "Ze serveru se nepodařilo dosáhnout cíle.",
    cdnReasonNoKnownSignature: "Nebyl zjištěn žádný známý podpis CDN.",
    cdnProviderUnknownProxy: "Neznámý CDN / reverzní proxy",
    cdnSignalHeader: "hlavička",
    cdnSignalHeaderValue: "hodnota hlavičky",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Typ IOC",
    reputationDetailC2Status: "Stav C2",
    reputationDetailNetwork: "Síť",
    reputationDetailService: "Služba",
    asnPolicyRequired: "Povinné",
    asnPolicyNotRequired: "Nepovinné",
    asnWarningUnknown: "Poskytovatel dat vrátil další upozornění.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Funkční cookie ukládá vybraný jazyk. Nepoužívá se k sledování ani reklamě.",
    languageSelectorLabel: "Vybrat jazyk",
    structuredDataCategory: "Nástroj pro informace o internetu a sítích",
    structuredDataOperatingSystem:
      "Jakýkoli systém s moderním webovým prohlížečem",
    structuredDataBrowserRequirements:
      "Pro interaktivní vyhledávání je nutný JavaScript",
  },
  sv: {
    pingDatabaseGeneric: "Generisk TCP-databas",
    pingCustomPort: "Anpassad port",
    dnsTypeAll: "Alla",
    dnsErrorTimeout: "DNS-frågan tog för lång tid.",
    dnsErrorNotFound: "Ingen DNS-post hittades.",
    dnsErrorTemporary: "DNS-resolvern returnerade ett tillfälligt fel.",
    dnsRecordQueryError: "{type}: frågan om posten misslyckades.",
    dnsErrorUnknown: "DNS-sökningen misslyckades.",
    pingResultUnknown: "Kontrollen gav ett okänt resultat.",
    pingDetailUdpConnectionless:
      "UDP är anslutningslöst; framgång betyder att paketet skickades utan ett omedelbart fel.",
    pingDetailGenericDatabaseTcpOnly:
      "Detta bekräftar TCP-nåbarhet, inte databasautentisering eller att protokollet är redo.",
    cdnReasonMatchedSignals: "CDN-signaler upptäcktes.",
    cdnReasonGoogleFingerprint:
      "Fingeravtryck för Googles frontendserver upptäcktes.",
    cdnReasonMicrosoftFingerprint:
      "Fingeravtryck för Microsoft-server upptäcktes.",
    cdnReasonGenericProxyHeaders:
      "Cache- eller proxyhuvud hittades, men ingen leverantörsspecifik signatur matchade.",
    cdnReasonUnreachable: "Målet kunde inte nås från servern.",
    cdnReasonNoKnownSignature: "Ingen känd CDN-signatur upptäcktes.",
    cdnProviderUnknownProxy: "Okänd CDN / reverse proxy",
    cdnSignalHeader: "huvud",
    cdnSignalHeaderValue: "huvudvärde",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC-typ",
    reputationDetailC2Status: "C2-status",
    reputationDetailNetwork: "Nätverk",
    reputationDetailService: "Tjänst",
    asnPolicyRequired: "Obligatoriskt",
    asnPolicyNotRequired: "Inte obligatoriskt",
    asnWarningUnknown: "Dataleverantören returnerade en ytterligare varning.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "En funktionell cookie lagrar ditt språkval. Den används inte för spårning eller annonsering.",
    languageSelectorLabel: "Välj språk",
    structuredDataCategory: "Verktyg för information om internet och nätverk",
    structuredDataOperatingSystem: "Alla system med en modern webbläsare",
    structuredDataBrowserRequirements:
      "Kräver JavaScript för interaktiva sökningar",
  },
  da: {
    pingDatabaseGeneric: "Generisk TCP-database",
    pingCustomPort: "Brugerdefineret port",
    dnsTypeAll: "Alle",
    dnsErrorTimeout: "DNS-forespørgslen fik timeout.",
    dnsErrorNotFound: "Der blev ikke fundet nogen DNS-post.",
    dnsErrorTemporary: "DNS-resolveren returnerede en midlertidig fejl.",
    dnsRecordQueryError: "{type}: forespørgslen på posten mislykkedes.",
    dnsErrorUnknown: "DNS-opslaget mislykkedes.",
    pingResultUnknown: "Kontrollen returnerede et ukendt resultat.",
    pingDetailUdpConnectionless:
      "UDP er forbindelsesløst; succes betyder, at pakken blev sendt uden en umiddelbar fejl.",
    pingDetailGenericDatabaseTcpOnly:
      "Dette bekræfter TCP-tilgængelighed, ikke databasegodkendelse eller protokolberedskab.",
    cdnReasonMatchedSignals: "CDN-signaler blev registreret.",
    cdnReasonGoogleFingerprint:
      "Fingeraftryk fra Googles frontendserver blev registreret.",
    cdnReasonMicrosoftFingerprint:
      "Fingeraftryk fra Microsoft-server blev registreret.",
    cdnReasonGenericProxyHeaders:
      "Cache- eller proxy-headere blev fundet, men ingen providerspecifik signatur passede.",
    cdnReasonUnreachable: "Målet kunne ikke nås fra serveren.",
    cdnReasonNoKnownSignature: "Ingen kendt CDN-signatur blev registreret.",
    cdnProviderUnknownProxy: "Ukendt CDN / reverse proxy",
    cdnSignalHeader: "header",
    cdnSignalHeaderValue: "headerværdi",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC-type",
    reputationDetailC2Status: "C2-status",
    reputationDetailNetwork: "Netværk",
    reputationDetailService: "Tjeneste",
    asnPolicyRequired: "Påkrævet",
    asnPolicyNotRequired: "Ikke påkrævet",
    asnWarningUnknown: "Dataleverandøren returnerede en yderligere advarsel.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "En funktionel cookie gemmer dit sprogval. Den bruges ikke til sporing eller annoncer.",
    languageSelectorLabel: "Vælg sprog",
    structuredDataCategory: "Værktøj til information om internet og netværk",
    structuredDataOperatingSystem: "Alle systemer med en moderne webbrowser",
    structuredDataBrowserRequirements:
      "Kræver JavaScript til interaktive søgninger",
  },
  nb: {
    pingDatabaseGeneric: "Generisk TCP-database",
    pingCustomPort: "Egendefinert port",
    dnsTypeAll: "Alle",
    dnsErrorTimeout: "DNS-forespørselen tok for lang tid.",
    dnsErrorNotFound: "Fant ingen DNS-post.",
    dnsErrorTemporary: "DNS-løseren returnerte en midlertidig feil.",
    dnsRecordQueryError: "{type}: forespørselen om posten mislyktes.",
    dnsErrorUnknown: "DNS-oppslaget mislyktes.",
    pingResultUnknown: "Kontrollen ga et ukjent resultat.",
    pingDetailUdpConnectionless:
      "UDP er tilkoblingsfritt; suksess betyr at pakken ble sendt uten en umiddelbar feil.",
    pingDetailGenericDatabaseTcpOnly:
      "Dette bekrefter TCP-tilgjengelighet, ikke databaseautentisering eller protokollberedskap.",
    cdnReasonMatchedSignals: "CDN-signaler ble oppdaget.",
    cdnReasonGoogleFingerprint:
      "Fingeravtrykk for Googles frontendserver ble oppdaget.",
    cdnReasonMicrosoftFingerprint:
      "Fingeravtrykk for Microsoft-server ble oppdaget.",
    cdnReasonGenericProxyHeaders:
      "Cache- eller proxyhoder ble funnet, men ingen leverandørspesifikk signatur passet.",
    cdnReasonUnreachable: "Målet kunne ikke nås fra serveren.",
    cdnReasonNoKnownSignature: "Ingen kjent CDN-signatur ble oppdaget.",
    cdnProviderUnknownProxy: "Ukjent CDN / omvendt proxy",
    cdnSignalHeader: "header",
    cdnSignalHeaderValue: "header-verdi",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC-type",
    reputationDetailC2Status: "C2-status",
    reputationDetailNetwork: "Nettverk",
    reputationDetailService: "Tjeneste",
    asnPolicyRequired: "Påkrevd",
    asnPolicyNotRequired: "Ikke påkrevd",
    asnWarningUnknown: "Dataleverandøren returnerte en ytterligere advarsel.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "En funksjonell cookie lagrer språkvalget ditt. Den brukes ikke til sporing eller reklame.",
    languageSelectorLabel: "Velg språk",
    structuredDataCategory: "Verktøy for informasjon om internett og nettverk",
    structuredDataOperatingSystem: "Alle systemer med en moderne nettleser",
    structuredDataBrowserRequirements: "Krever JavaScript for interaktive søk",
  },
  fi: {
    pingDatabaseGeneric: "Yleinen TCP-tietokanta",
    pingCustomPort: "Mukautettu portti",
    dnsTypeAll: "Kaikki",
    dnsErrorTimeout: "DNS-kysely aikakatkaisti.",
    dnsErrorNotFound: "DNS-tietuetta ei löytynyt.",
    dnsErrorTemporary: "DNS-ratkaisija palautti tilapäisen virheen.",
    dnsRecordQueryError: "{type}: tietueen kysely epäonnistui.",
    dnsErrorUnknown: "DNS-haku epäonnistui.",
    pingResultUnknown: "Tarkistus palautti tuntemattoman tuloksen.",
    pingDetailUdpConnectionless:
      "UDP on yhteydetön; onnistuminen tarkoittaa, että paketti lähetettiin ilman välitöntä virhettä.",
    pingDetailGenericDatabaseTcpOnly:
      "Tämä vahvistaa TCP-tavoitettavuuden, ei tietokannan todennuksen tai protokollan valmiuden.",
    cdnReasonMatchedSignals: "CDN-signaaleja havaittiin.",
    cdnReasonGoogleFingerprint:
      "Googlen frontend-palvelimen sormenjälki havaittiin.",
    cdnReasonMicrosoftFingerprint:
      "Microsoft-palvelimen sormenjälki havaittiin.",
    cdnReasonGenericProxyHeaders:
      "Välimuisti- tai proxyotsakkeita löytyi, mutta yksikään toimittajakohtainen allekirjoitus ei täsmännyt.",
    cdnReasonUnreachable: "Kohdetta ei voitu tavoittaa palvelimelta.",
    cdnReasonNoKnownSignature:
      "Yhtään tunnettua CDN-allekirjoitusta ei havaittu.",
    cdnProviderUnknownProxy: "Tuntematon CDN / reverse proxy",
    cdnSignalHeader: "otsake",
    cdnSignalHeaderValue: "otsakkeen arvo",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC-tyyppi",
    reputationDetailC2Status: "C2-tila",
    reputationDetailNetwork: "Verkko",
    reputationDetailService: "Palvelu",
    asnPolicyRequired: "Vaaditaan",
    asnPolicyNotRequired: "Ei vaadita",
    asnWarningUnknown: "Tietojentarjoaja palautti ylimääräisen varoituksen.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Toiminnallinen eväste tallentaa kielivalintasi. Sitä ei käytetä seurantaan eikä mainontaan.",
    languageSelectorLabel: "Valitse kieli",
    structuredDataCategory: "Työkalu internet- ja verkkotietoihin",
    structuredDataOperatingSystem:
      "Kaikki järjestelmät, joissa on moderni verkkoselain",
    structuredDataBrowserRequirements:
      "Vaatii JavaScriptin vuorovaikutteisiin hakuihin",
  },
  el: {
    pingDatabaseGeneric: "Γενική βάση δεδομένων TCP",
    pingCustomPort: "Προσαρμοσμένη θύρα",
    dnsTypeAll: "Όλα",
    dnsErrorTimeout: "Το ερώτημα DNS έληξε λόγω χρονικού ορίου.",
    dnsErrorNotFound: "Δεν βρέθηκε καμία εγγραφή DNS.",
    dnsErrorTemporary: "Ο αναλυτής DNS επέστρεψε προσωρινή αστοχία.",
    dnsRecordQueryError: "{type}: το ερώτημα της εγγραφής απέτυχε.",
    dnsErrorUnknown: "Η αναζήτηση DNS απέτυχε.",
    pingResultUnknown: "Ο έλεγχος επέστρεψε άγνωστο αποτέλεσμα.",
    pingDetailUdpConnectionless:
      "Το UDP είναι πρωτόκολλο χωρίς σύνδεση· η επιτυχία σημαίνει ότι το πακέτο στάλθηκε χωρίς άμεσο σφάλμα.",
    pingDetailGenericDatabaseTcpOnly:
      "Αυτό επιβεβαιώνει την προσβασιμότητα μέσω TCP, όχι τον έλεγχο ταυτότητας της βάσης δεδομένων ή την ετοιμότητα του πρωτοκόλλου.",
    cdnReasonMatchedSignals: "Ανιχνεύθηκαν σήματα CDN.",
    cdnReasonGoogleFingerprint:
      "Ανιχνεύτηκε αποτύπωμα διακομιστή frontend της Google.",
    cdnReasonMicrosoftFingerprint:
      "Ανιχνεύτηκε αποτύπωμα διακομιστή Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Βρέθηκαν κεφαλίδες cache ή proxy, αλλά δεν ταίριαξε καμία υπογραφή συγκεκριμένου παρόχου.",
    cdnReasonUnreachable:
      "Δεν ήταν δυνατή η πρόσβαση στον στόχο από τον διακομιστή.",
    cdnReasonNoKnownSignature: "Δεν ανιχνεύθηκε καμία γνωστή υπογραφή CDN.",
    cdnProviderUnknownProxy: "Άγνωστο CDN / reverse proxy",
    cdnSignalHeader: "κεφαλίδα",
    cdnSignalHeaderValue: "τιμή κεφαλίδας",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Τύπος IOC",
    reputationDetailC2Status: "Κατάσταση C2",
    reputationDetailNetwork: "Δίκτυο",
    reputationDetailService: "Υπηρεσία",
    asnPolicyRequired: "Απαιτείται",
    asnPolicyNotRequired: "Δεν απαιτείται",
    asnWarningUnknown: "Ο πάροχος δεδομένων επέστρεψε πρόσθετη προειδοποίηση.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Ένα λειτουργικό cookie αποθηκεύει τη γλωσσική επιλογή σας. Δεν χρησιμοποιείται για παρακολούθηση ή διαφημίσεις.",
    languageSelectorLabel: "Επιλέξτε γλώσσα",
    structuredDataCategory:
      "Εργαλείο πληροφοριών για το Διαδίκτυο και τα δίκτυα",
    structuredDataOperatingSystem:
      "Οποιοδήποτε σύστημα με σύγχρονο περιηγητή ιστού",
    structuredDataBrowserRequirements:
      "Απαιτεί JavaScript για διαδραστικές αναζητήσεις",
  },
  ro: {
    pingDatabaseGeneric: "Bază de date TCP generică",
    pingCustomPort: "Port personalizat",
    dnsTypeAll: "Toate",
    dnsErrorTimeout: "Interogarea DNS a expirat.",
    dnsErrorNotFound: "Nu s-a găsit nicio înregistrare DNS.",
    dnsErrorTemporary: "Rezolverul DNS a returnat o eroare temporară.",
    dnsRecordQueryError: "{type}: interogarea înregistrării a eșuat.",
    dnsErrorUnknown: "Căutarea DNS a eșuat.",
    pingResultUnknown: "Verificarea a returnat un rezultat necunoscut.",
    pingDetailUdpConnectionless:
      "UDP nu stabilește conexiuni; succesul înseamnă că pachetul a fost trimis fără o eroare imediată.",
    pingDetailGenericDatabaseTcpOnly:
      "Aceasta confirmă accesibilitatea prin TCP, nu autentificarea bazei de date sau pregătirea protocolului.",
    cdnReasonMatchedSignals: "Au fost detectate semnale CDN.",
    cdnReasonGoogleFingerprint:
      "A fost detectată amprenta serverului frontend Google.",
    cdnReasonMicrosoftFingerprint:
      "A fost detectată amprenta serverului Microsoft.",
    cdnReasonGenericProxyHeaders:
      "Au fost găsite anteturi cache sau proxy, dar nicio semnătură specifică furnizorului nu s-a potrivit.",
    cdnReasonUnreachable: "Nu s-a putut ajunge la țintă de pe server.",
    cdnReasonNoKnownSignature:
      "Nu a fost detectată nicio semnătură CDN cunoscută.",
    cdnProviderUnknownProxy: "CDN / proxy invers necunoscut",
    cdnSignalHeader: "antet",
    cdnSignalHeaderValue: "valoarea antetului",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "Tip IOC",
    reputationDetailC2Status: "Stare C2",
    reputationDetailNetwork: "Rețea",
    reputationDetailService: "Serviciu",
    asnPolicyRequired: "Obligatoriu",
    asnPolicyNotRequired: "Nu este obligatoriu",
    asnWarningUnknown:
      "Furnizorul de date a returnat o avertizare suplimentară.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "Un cookie funcțional stochează limba selectată. Acesta nu este folosit pentru urmărire sau publicitate.",
    languageSelectorLabel: "Selectați limba",
    structuredDataCategory:
      "Instrument de informații despre Internet și rețele",
    structuredDataOperatingSystem: "Orice sistem cu un browser web modern",
    structuredDataBrowserRequirements:
      "Necesită JavaScript pentru căutări interactive",
  },
  tr: {
    pingDatabaseGeneric: "Genel TCP veritabanı",
    pingCustomPort: "Özel port",
    dnsTypeAll: "Tümü",
    dnsErrorTimeout: "DNS sorgusu zaman aşımına uğradı.",
    dnsErrorNotFound: "Hiçbir DNS kaydı bulunamadı.",
    dnsErrorTemporary: "DNS çözümleyici geçici bir hata döndürdü.",
    dnsRecordQueryError: "{type}: kayıt sorgusu başarısız oldu.",
    dnsErrorUnknown: "DNS araması başarısız oldu.",
    pingResultUnknown: "Kontrol bilinmeyen bir sonuç döndürdü.",
    pingDetailUdpConnectionless:
      "UDP bağlantısızdır; başarı, paketin anında bir hata oluşmadan gönderildiği anlamına gelir.",
    pingDetailGenericDatabaseTcpOnly:
      "Bu, veritabanı kimlik doğrulamasını veya protokol hazırlığını değil, TCP erişilebilirliğini doğrular.",
    cdnReasonMatchedSignals: "CDN sinyalleri algılandı.",
    cdnReasonGoogleFingerprint:
      "Google frontend sunucusunun parmak izi algılandı.",
    cdnReasonMicrosoftFingerprint:
      "Microsoft sunucusunun parmak izi algılandı.",
    cdnReasonGenericProxyHeaders:
      "Önbellek veya proxy başlıkları bulundu, ancak sağlayıcıya özgü bir imza eşleşmedi.",
    cdnReasonUnreachable: "Sunucudan hedefe ulaşılamadı.",
    cdnReasonNoKnownSignature: "Bilinen bir CDN imzası algılanmadı.",
    cdnProviderUnknownProxy: "Bilinmeyen CDN / ters proxy",
    cdnSignalHeader: "başlık",
    cdnSignalHeaderValue: "başlık değeri",
    cdnSignalDns: "DNS",
    reputationDetailRiot: "RIOT",
    reputationDetailThreatType: "IOC türü",
    reputationDetailC2Status: "C2 durumu",
    reputationDetailNetwork: "Ağ",
    reputationDetailService: "Hizmet",
    asnPolicyRequired: "Zorunlu",
    asnPolicyNotRequired: "Zorunlu değil",
    asnWarningUnknown: "Veri sağlayıcı ek bir uyarı döndürdü.",
    emailAt: "[at]",
    emailDot: "[dot]",
    localeCookieNotice:
      "İşlevsel bir çerez seçtiğiniz dili saklar. İzleme veya reklam için kullanılmaz.",
    languageSelectorLabel: "Dil seçin",
    structuredDataCategory: "İnternet ve ağ bilgileri aracı",
    structuredDataOperatingSystem:
      "Modern bir web tarayıcısına sahip herhangi bir sistem",
    structuredDataBrowserRequirements:
      "Etkileşimli aramalar için JavaScript gerekir",
  },
};

export function getUiCopy(locale: Locale): UiCopy {
  return uiCopy[locale] ?? uiCopy.en;
}
