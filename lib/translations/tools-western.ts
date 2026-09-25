import type { ToolTranslation } from "@/lib/tool-i18n";

export const toolsWestern: Record<"es" | "fr" | "it" | "nl", ToolTranslation> =
  {
    es: {
      errorRateLimited:
        "Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.",
      errorInvalidTarget:
        "Introduce un dominio, una dirección IP o una URL públicos válidos.",
      errorTargetBlocked:
        "No se pueden comprobar objetivos privados, locales o internos en este sitio público.",
      errorTimeout:
        "La comprobación ha agotado el tiempo de espera. El objetivo puede ser lento o inaccesible.",
      errorUpstream:
        "Un proveedor de datos upstream no está disponible actualmente.",
      errorBadRequest: "Los parámetros de la solicitud no son válidos.",
      errorTargetNetwork: "No se ha podido resolver o alcanzar el objetivo.",
      showAll: "Mostrar todo",
      showLess: "Mostrar menos",
      navOverview: "Resumen",
      navDiagnostics: "Diagnóstico",
      navMyIp: "Mi IP",
      brandTagline: "Kit de red e IP",
      themeToggle: "Cambiar tema",
      themeLight: "Claro",
      themeDark: "Oscuro",
      themeSystem: "Sistema",
      navMenu: "Menú",
      skipToContent: "Ir al contenido",
      navToolsLabel: "Herramientas",
      sidebarLabel: "Navegación del sitio",
      navClose: "Cerrar menú",
      copyValue: "Copiar",
      downloadJson: "Descargar JSON",
      cancelLookup: "Cancelar",
      whoisNoteIana:
        "No se encontró ningún servidor de referencia. Se muestra la respuesta WHOIS de IANA.",
      whoisNoteRdap:
        "WHOIS no estaba disponible. En su lugar, se muestran los datos de registro RDAP.",
      commandTriggerLabel: "Buscar…",
      commandPlaceholder:
        "Busca herramientas o introduce una IP, un dominio o un ASN…",
      commandGroupActions: "Acciones",
      commandGroupPages: "Ir a",
      commandEmpty: "No hay herramientas ni acciones coincidentes.",
      commandHintNavigate: "Navegar",
      commandHintSelect: "Abrir",
      commandHintClose: "Cerrar",
      notFoundTitle: "Página no encontrada",
      notFoundDescription:
        "Esta dirección no pertenece a ninguna herramienta. Vuelve a la página de inicio o usa la búsqueda (Ctrl+K).",
      notFoundBackHome: "Volver a la página de inicio",
      errorTitle: "Algo ha salido mal",
      errorDescription:
        "No se ha podido cargar esta página. Inténtalo de nuevo; si el problema continúa, la causa está de nuestro lado.",
      errorRetry: "Intentar de nuevo",
      asnRpkiValid: "RPKI válido",
      asnRpkiInvalid: "RPKI no válido",
      asnRpkiStatus: "RPKI {status}",
      cdnConfidenceHigh: "Alta",
      cdnConfidenceMedium: "Media",
      cdnConfidenceLow: "Baja",
      pingTabLabel: "Probador de ping",
      dnsTabLabel: "Consulta de DNS",
      whoisTabLabel: "Consulta de WHOIS",
      cdnTabLabel: "Comprobador de CDN",
      asnTabLabel: "Consulta de ASN",
      reputationTabLabel: "Reputación de IP",
      pingTitle: "Probador de ping y puertos",
      pingSubtitle:
        "Comprobaciones guiadas de puertos TCP/UDP, endpoints EB y conectividad de bases de datos en un flujo de pruebas más claro.",
      dnsTitle: "Consulta de DNS",
      dnsSubtitle:
        "Consulta registros DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) de dominios y consultas DNS inversas de direcciones IP.",
      whoisTitle: "Consulta de WHOIS",
      whoisSubtitle:
        "Consulta directamente desde esta aplicación los registros WHOIS de dominios y direcciones IP.",
      cdnTitle: "Comprobador de uso de CDN",
      cdnSubtitle:
        "Analiza cualquier dominio para detectar el uso de CDN y el proveedor probable (incluidos CloudFront, Google Cloud CDN, Azure CDN, Vercel y otros).",
      asnTitle: "Información de ASN",
      asnSubtitle:
        "Consulta sistemas autónomos con los detalles de ASN de IPinfo y los datos públicos de interconexión de PeeringDB.",
      asnPlaceholder: "AS8881 o 8881",
      asnLookupButton: "Consultar ASN",
      asnLookingUp: "Consultando…",
      asnInvalidInput:
        "Usa un ASN con prefijo AS o numérico, por ejemplo AS8881 o 8881.",
      asnInvalidRange: "El ASN debe estar entre 1 y {max}.",
      asnNetworkError: "Error de red al contactar con la consulta de ASN.",
      asnUpstreamError:
        "Los proveedores de datos de ASN no están disponibles actualmente.",
      asnRateLimitError:
        "Demasiadas consultas de ASN. Espera antes de volver a intentarlo.",
      asnEmptyTitle: "Introduce un ASN para inspeccionar un perfil de red",
      asnEmptyDescription:
        "Usa una entrada con prefijo AS o numérica. Los datos de los proveedores pueden estar incompletos según los registros públicos y el plan de IPinfo configurado.",
      dnsEmptyTitle: "Introduce un dominio para resolver sus registros DNS",
      dnsEmptyDescription:
        "Consulta registros A, AAAA, MX, TXT, NS, SOA, SRV y CAA, o realiza una consulta inversa en una dirección IP.",
      whoisEmptyTitle: "Introduce un dominio o una IP para consultar WHOIS",
      whoisEmptyDescription:
        "Obtén el registrador, las fechas de registro, el estado y los servidores de nombres del servidor WHOIS correspondiente.",
      cdnEmptyTitle: "Introduce un dominio para detectar su CDN",
      cdnEmptyDescription:
        "Inspecciona DNS, las cadenas CNAME y las cabeceras de respuesta para identificar el CDN o el proveedor de edge que está delante del sitio.",
      asnNotFoundTitle: "No se ha encontrado ningún perfil de ASN",
      asnNotFoundDescription:
        "El ASN es válido, pero ninguna de las fuentes configuradas ha devuelto un perfil público utilizable.",
      asnPartialData: "Datos parciales",
      asnCompleteData: "Completos",
      asnPrefixes: "Prefijos anunciados",
      asnRouting: "Relaciones de enrutamiento",
      asnPeeringDb: "Perfil de PeeringDB",
      asnIxPresence: "Presencia en IX",
      asnFacilities: "Presencia en instalaciones",
      asnSourceDiagnostics: "Diagnóstico de fuentes",
      asnDetailedDiagnostics: "Diagnóstico detallado",
      asnUnnamed: "AS sin nombre",
      asnRoutingDescription:
        "Interconexiones, vecinos y pesos de rutas del sistema autónomo. Los pesos más altos indican rutas de enrutamiento observadas con mayor frecuencia.",
      asnIxDescription:
        "Puntos de intercambio de Internet (IX) en los que está presente este sistema autónomo, incluido el ancho de banda de interconexión.",
      asnPrefixesDescription:
        "Bloques de red IP anunciados por este sistema autónomo en la tabla de enrutamiento global.",
      asnPeeringDbDescription:
        "Perfil de interconexión y políticas de enrutamiento declarados en la base de datos pública de PeeringDB.",
      asnFacilitiesDescription:
        "Centros de datos físicos y instalaciones de colocación donde está presente esta red.",
      asnProfileIdentityHeading: "Identidad y estado",
      asnProfileInterconnectionHeading: "Detalles de interconexión",
      asnProfilePolicyHeading: "Política de peering",
      asnProfileExternalHeading: "Perfiles externos",
      asnProfilePrefixes4: "Prefijos IPv4",
      asnProfilePrefixes6: "Prefijos IPv6",
      asnWarnings: "Advertencias",
      asnDiagnosticDuration: "Duración",
      asnDiagnosticCache: "Caché",
      asnDiagnosticWarnings: "Advertencias",
      asnDiagnosticSource: "Fuente",
      asnSourceDiagnosticsDescription:
        "Disponibilidad de los proveedores, duración de la solicitud y estado de la caché para esta consulta.",
      asnCacheMiss: "no encontrado en caché",
      asnCacheFresh: "actualizado",
      asnCacheStale: "obsoleto",
      asnCacheNotConfigured: "no configurado",
      asnNoPrefixes: "Las fuentes configuradas no han devuelto prefijos.",
      asnNoRelations:
        "Las fuentes configuradas no han devuelto relaciones de enrutamiento.",
      asnMetricIpv4Addresses: "Direcciones IPv4",
      asnMetricRoutingNeighbours: "Vecinos de enrutamiento",
      asnMetricIxPresence: "Presencia en IX",
      asnPrefixIpCount: "IP",
      asnRelationPeers: "Pares",
      asnRelationUpstreams: "Proveedores upstream",
      asnRelationDownstreams: "Destinos downstream",
      asnRelationPower: "peso",
      asnSourceAvailable: "disponible",
      asnSourceUnavailable: "no disponible",
      asnSourceNotConfigured: "no configurado",
      asnSourceError: "fallo",
      asnLabelName: "Nombre",
      asnLabelCountry: "País",
      asnLabelAllocated: "Asignado",
      asnLabelNetworkId: "ID de red",
      asnLabelAlsoKnownAs: "También conocido como",
      asnLabelWebsite: "Sitio web",
      asnLabelLookingGlass: "Looking Glass",
      asnLabelRouteServer: "Servidor de rutas",
      asnLabelTraffic: "Tráfico",
      asnLabelPolicyGeneral: "Política general",
      asnLabelPolicyLocations: "Ubicaciones de la política",
      asnLabelPolicyRatio: "Proporción de la política",
      asnLabelPolicyContracts: "Contratos de la política",
      asnLabelStatus: "Estado",
      asnLabelExchange: "Intercambio",
      asnLabelSpeed: "Velocidad",
      asnLabelIpv4: "IPv4",
      asnLabelIpv6: "IPv6",
      asnLabelRsPeer: "Par RS",
      asnLabelFacility: "Instalación",
      asnLabelCity: "Ciudad",
      asnLabelLocalAsn: "ASN local",
      asnSortTable: "Tabla ordenable",
      asnSortBy: "Ordenar por {column}",
      asnSortNotSorted: "sin ordenar",
      asnSortAscending: "ascendente",
      asnSortDescending: "descendente",
      asnBooleanYes: "sí",
      asnBooleanNo: "no",
      asnSpeedMbps: "Mbps",
      asnSpeedGbps: "Gbps",
      asnSpeedTbps: "Tbps",
      asnNoIxLanRecords: "No se han devuelto registros de LAN de IX.",
      asnNoFacilityRecords: "No se han devuelto registros de instalaciones.",
      asnWarningIpinfoUnavailable:
        "Los datos de ASN de IPinfo no están disponibles para este ASN o este plan de token.",
      asnWarningIpinfoUnexpected:
        "IPinfo ha devuelto una carga ASN inesperada.",
      asnWarningNoRipeStatData:
        "No se han encontrado datos de ASN de RIPEstat para este ASN.",
      asnWarningNoPeeringDbProfile:
        "No se ha encontrado ningún perfil de red público de PeeringDB para este ASN.",
      asnWarningProviderHttp: "{provider} ha devuelto HTTP {status}.",
      asnWarningProviderTimedOut:
        "La solicitud a {provider} ha agotado el tiempo de espera.",
      asnWarningProviderTooLarge:
        "La respuesta de {provider} supera el límite de tamaño.",
      asnWarningProviderInvalidJson: "{provider} ha devuelto JSON no válido.",
      asnWarningProviderUnavailable:
        "Los datos de {provider} no están disponibles actualmente.",
      asnWarningProviderStale:
        "Los datos de {provider} no están disponibles actualmente; se usan datos obsoletos de la caché.",
      asnWarningTruncated:
        "{label} se ha truncado a {limit} de {total} registros.",
      asnWarningLabelIpinfoIpv4Prefixes: "Prefijos IPv4 de IPinfo",
      asnWarningLabelIpinfoIpv6Prefixes: "Prefijos IPv6 de IPinfo",
      asnWarningLabelIpinfoPeers: "Pares de IPinfo",
      asnWarningLabelIpinfoUpstreams: "Proveedores upstream de IPinfo",
      asnWarningLabelIpinfoDownstreams: "Destinos downstream de IPinfo",
      asnWarningLabelPeeringDbIxLan: "Registros de LAN de IX de PeeringDB",
      asnWarningLabelPeeringDbFacilities: "Instalaciones de PeeringDB",
      asnWarningLabelRipeStatIpv4Prefixes: "Prefijos IPv4 de RIPEstat",
      asnWarningLabelRipeStatIpv6Prefixes: "Prefijos IPv6 de RIPEstat",
      asnWarningLabelRipeStatRoutingNeighbours:
        "Vecinos de enrutamiento de RIPEstat",
      asnWarningLabelRipeStatUpstreamNeighbours: "Vecinos upstream de RIPEstat",
      asnWarningLabelRipeStatDownstreamNeighbours:
        "Vecinos downstream de RIPEstat",
      asnTabRouting: "Enrutamiento",
      asnTabPrefixes: "Prefijos",
      asnTabPeering: "Peering",
      asnTabSources: "Fuentes",
      asnDetailNavLabel: "Detalles del ASN",
      asnIdentityEyebrow: "Sistema autónomo",
      asnCopyAsn: "Copiar ASN",
      asnLabelType: "Tipo",
      asnLabelRegistry: "Registro",
      asnLabelDomain: "Dominio",
      asnNetworkTypes: {
        isp: "ISP",
        hosting: "Alojamiento",
        business: "Empresa",
        education: "Educación",
        government: "Gobierno",
        inactive: "Inactivo",
      },
      asnSourcesLabel: "Fuentes",
      asnMetricIpv4Equivalent: "≈ equivalente a /{bits}",
      asnMetricRequiresIpinfo: "Requiere IPinfo",
      asnMetricNotReported: "No reportado",
      asnMetricNoPeeringDb: "Sin perfil de PeeringDB",
      asnFacilityCount: {
        one: "{count} instalación",
        other: "{count} instalaciones",
      },
      asnExchangeCount: {
        one: "{count} intercambio",
        other: "{count} intercambios",
      },
      asnConnectionCount: {
        one: "{count} conexión",
        other: "{count} conexiones",
      },
      asnShowMore: "Mostrar {count} más",
      asnListedOfTotal: "{shown} de {total} listados",
      asnNoneReported: "Ninguno reportado",
      asnRelationV4Peers: "Pares IPv4",
      asnRelationV6Peers: "Pares IPv6",
      asnRelationObservedVia:
        "Peso y número de pares observados mediante {source}.",
      asnRpkiLabel: "RPKI",
      asnRpkiValidShort: "Válido",
      asnRpkiInvalidShort: "No válido",
      asnLabelExchanges: "Intercambios",
      asnLabelFacilities: "Instalaciones",
      asnLabelPeeringDbRecord: "Registro de PeeringDB",
      asnViewOnPeeringDb: "Ver {name} en PeeringDB",
      asnIxNotOperational: "No operativo",
      asnSortLabel: "Ordenar",
      asnSortDefault: "Orden del proveedor",
      asnSameAsn: "Mismo ASN que este",
      asnExamplesLabel: "Probar",
      asnLabelPolicy: "Política",
      asnCountryCount: { one: "en {count} país", other: "en {count} países" },
      targetPlaceholder: "example.com",
      lookupInProgress: "Consultando…",
      dnsLookupButton: "Consultar DNS",
      dnsLookupError: "La consulta de DNS ha fallado.",
      dnsRecordsFor: "Registros DNS de",
      resolvedAddresses: "Direcciones resueltas",
      noAddressResult: "No hay resultados de A/AAAA.",
      recordDetails: "Detalles del registro",
      dnsRecordNotes: "Notas de la consulta de registros",
      dnsTableType: "Tipo",
      dnsTableValue: "Valor",
      dnsShowRaw: "Mostrar JSON sin formato",
      dnsHideRaw: "Ocultar JSON sin formato",
      dnsNoRecords: "No se han devuelto registros del tipo seleccionado.",
      whoisPlaceholder: "example.com o 8.8.8.8",
      whoisLookupButton: "Consultar WHOIS",
      whoisLookupError: "La consulta de WHOIS ha fallado.",
      whoisFor: "WHOIS de",
      queriedServer: "Servidor consultado",
      referralSource: "Fuente de referencia",
      noWhoisData: "No se han devuelto datos de WHOIS.",
      whoisRegistrar: "Registrador",
      whoisCreated: "Creado",
      whoisUpdated: "Actualizado",
      whoisExpires: "Caduca",
      whoisStatusLabel: "Estado",
      whoisNameservers: "Servidores de nombres",
      whoisShowRaw: "Mostrar salida sin formato",
      whoisHideRaw: "Ocultar salida sin formato",
      pingTestMode: "Modo de prueba",
      pingModeHelperTcp: "Comprueba si el puerto TCP acepta conexiones.",
      pingModeHelperUdp:
        "Envía una sonda UDP e informa del comportamiento inmediato de respuesta o error.",
      pingModeHelperEb:
        "Comprueba primero TCP y después la accesibilidad del endpoint HTTP/HTTPS.",
      pingModeHelperDatabase:
        "Ejecuta comprobaciones del protocolo antes de la autenticación y comprobaciones autenticadas opcionales.",
      pingModeDatabase: "Base de datos",
      pingDatabaseType: "Tipo de base de datos",
      pingTargetHost: "Host/IP de destino",
      pingPort: "Puerto",
      pingTimeout: "Tiempo de espera (ms)",
      pingUseAuth: "Comprobar con autenticación",
      pingUsername: "Nombre de usuario",
      pingPassword: "Contraseña",
      pingDatabaseOptional: "Base de datos (opcional)",
      pingRunButton: "Ejecutar prueba de ping",
      pingRunning: "Ejecutando comprobación…",
      pingNetworkError: "Error de red al contactar con /api/ping.",
      pingModeLabel: "Modo",
      pingLatencyLabel: "Latencia",
      pingTargetLabel: "Destino",
      pingDetailsLabel: "Detalles",
      pingEmptyTitle: "Aún no se ha ejecutado ninguna prueba",
      pingEmptyDescription:
        "Elige un modo de prueba, introduce un host y un puerto y ejecuta la comprobación para medir la accesibilidad y la latencia.",
      pingStatusSuccess: "Destino accesible",
      pingStatusFailed: "Comprobación fallida",
      pingShowDetails: "Mostrar detalles técnicos",
      pingHideDetails: "Ocultar detalles técnicos",
      pingResultTcpOk: "Conexión TCP establecida.",
      pingResultTcpTimeout: "Tiempo de espera de TCP tras {timeoutMs} ms.",
      pingResultTcpFailed: "Error en la conexión TCP: {error}",
      pingResultUdpSent:
        "Paquete UDP enviado. No se ha observado ningún error ICMP durante {timeoutMs} ms.",
      pingResultUdpResponse:
        "Respuesta UDP recibida de {from} ({bytes} bytes).",
      pingResultUdpFailed: "La sonda UDP ha fallado: {error}",
      pingResultEbHttpOk:
        "Endpoint accesible mediante {scheme} (estado {status}).",
      pingResultEbNoHttp:
        "TCP está abierto, pero no se ha detectado ninguna respuesta HTTP(S) en este endpoint.",
      pingResultEbTcpFailed:
        "La comprobación EB ha fallado en la fase TCP: {error}",
      pingResultDbConnectFailed:
        "No se ha podido conectar con {database}: {error}",
      pingResultDbProtocolOk:
        "El servidor {database} ha respondido a una sonda de protocolo previa a la autenticación.",
      pingResultDbProtocolFailed: "La sonda de {database} ha fallado: {error}",
      pingResultDbTcpOk:
        "El puerto TCP de {database} es accesible. No hay una sonda de protocolo previa a la autenticación para este tipo.",
      pingResultDbAuthUnsupported:
        "Las comprobaciones autenticadas solo están implementadas para Redis. Usa la comprobación de protocolo para {database}.",
      pingResultDbAuthOk: "La conexión autenticada a Redis ha sido correcta.",
      pingResultDbAuthFailed:
        "La comprobación de autenticación de Redis ha fallado: {error}",
      cdnAnalyzeButton: "Comprobar CDN",
      cdnAnalyzing: "Analizando…",
      cdnNetworkError: "Error de red al contactar con el comprobador de CDN.",
      cdnSummaryUnreachable: "Destino inaccesible",
      cdnSummaryNoMatch: "No hay una coincidencia de CDN fiable",
      cdnSummaryDetected: "CDN detectado",
      cdnConfidenceNa: "n/d",
      cdnNoProviderMatch: "Ningún proveedor coincide: IP resueltas",
      cdnInspectIpsHint:
        "Puedes consultar estas IP en la página de consulta de IP:",
      cdnTargetLabel: "Destino",
      cdnHttpStatusLabel: "Estado HTTP",
      cdnProviderLabel: "Proveedor",
      cdnUnknown: "Desconocido",
      cdnMatchedSignals: "Señales coincidentes",
      cdnNoSignals: "No ha coincidido ninguna señal explícita de CDN.",
      cdnCnameChain: "Cadena CNAME",
      cdnNoCname: "No se han encontrado registros CNAME.",
      cdnInterestingHeaders: "Cabeceras de respuesta interesantes",
      cdnNoHeaders: "No se han encontrado cabeceras relevantes.",
      reputationTitle: "Comprobación de reputación de IP",
      reputationSubtitle:
        "Comprueba una dirección IP pública frente a fuentes independientes de reputación e inteligencia de amenazas y obtén una evaluación de riesgo basada en evidencias.",
      reputationPlaceholder: "8.8.8.8 o 2001:4860:4860::8888",
      reputationCheckButton: "Comprobar reputación",
      reputationChecking: "Comprobando…",
      reputationNetworkError:
        "Error de red al contactar con la comprobación de reputación.",
      reputationRateLimitError:
        "Demasiadas comprobaciones de reputación. Espera antes de volver a intentarlo.",
      reputationInvalidIp:
        "Introduce una dirección IP pública válida (IPv4 o IPv6).",
      reputationBlockedIp:
        "No se pueden comprobar rangos de IP privados, reservados o internos.",
      reputationEmptyTitle:
        "Introduce una dirección IP para comprobar su reputación",
      reputationEmptyDescription:
        "La IP se comprueba contra listas de bloqueo DNS, bases de datos de informes de abuso, rastreadores de C2 de botnets y fuentes de clasificación de redes. Los proveedores opcionales (AbuseIPDB, GreyNoise, http:BL, ThreatFox) se activan cuando se configura una clave de API gratuita.",
      reputationRiskLow: "Riesgo bajo",
      reputationRiskMedium: "Riesgo medio",
      reputationRiskHigh: "Riesgo alto",
      reputationHeadlineClean: "No se ha detectado actividad maliciosa",
      reputationScoreLabel: "Puntuación de riesgo",
      reputationSectionSummary: "Resumen de reputación",
      reputationSectionThreats: "Evidencias de amenazas",
      reputationSectionMail: "Reputación de correo",
      reputationSectionNetwork: "Clasificación de red",
      reputationSectionSources: "Fuentes",
      reputationSectionScore: "Cómo se ha calculado esta puntuación",
      reputationCoverageChecked: "{count} fuentes comprobadas",
      reputationCoverageMatched: "{count} con evidencias de amenazas",
      reputationCoveragePolicy:
        "{count} con información de política o contexto",
      reputationCoverageUnavailable: "{count} no disponibles",
      reputationGeneratedAt: "Generado {time}",
      reputationNoThreatEvidence:
        "No se han encontrado observaciones maliciosas directas en las fuentes que se han podido comprobar.",
      reputationNoMailEvidence:
        "No se han encontrado listados de reputación de correo en las fuentes comprobadas.",
      reputationFilterAll: "Todas",
      reputationNoEvidence:
        "No hay evidencias de este grupo en las fuentes que se han podido comprobar.",
      reputationFactChecked: "Comprobado",
      reputationFactMatched: "Con evidencias de amenazas",
      reputationFactUnavailable: "No disponible",
      reputationFactCheckedAt: "Comprobado el",
      reputationScoreCapped: "Limitado a partir de {count} puntos brutos",
      reputationConnectionLabel: "Conexión",
      reputationReverseLabel: "DNS inverso",
      reputationFieldSource: "Fuente",
      reputationFieldConfidence: "Confianza",
      reputationFieldFirstSeen: "Primera vez visto",
      reputationFieldLastSeen: "Última vez visto",
      reputationFieldReports: "Informes",
      reputationFieldAttacks: "Eventos de ataque",
      reputationFieldMalware: "Software malicioso",
      reputationFieldDetail: "Detalle",
      reputationFieldReturnCode: "Código de retorno",
      reputationPointsLabel: "+{points} puntos",
      reputationCategories: {
        mail_policy: "Listado de política de correo",
        mail_reputation: "Listado de reputación de correo electrónico",
        spam_observed: "Actividad de spam observada",
        abuse_reported: "Abuso reportado",
        scanner: "Escáner de Internet",
        bruteforce: "Ataques de fuerza bruta",
        web_attack: "Ataques web",
        ddos: "Ataques DDoS / de inundación",
        botnet: "Actividad de botnet",
        malware: "Infraestructura de malware",
        proxy: "Proxy abierto",
        vpn: "VPN / anonimizador",
        tor: "Nodo de salida de Tor",
        hosting: "Alojamiento / centro de datos",
        residential: "Red residencial",
        mobile: "Red móvil",
        benign_service: "Servicio empresarial conocido",
      },
      reputationSeverities: {
        info: "Información",
        low: "Gravedad baja",
        medium: "Gravedad media",
        high: "Gravedad alta",
        critical: "Crítica",
      },
      reputationSourceStates: {
        available: "disponible",
        clean: "limpio",
        matched: "coincidencia",
        policy_listed: "listado (política)",
        not_configured: "no configurado",
        unsupported: "no compatible",
        rate_limited: "limitado por tasa",
        resolver_blocked: "resolver bloqueado",
        unavailable: "no disponible",
      },
      reputationReasons: {
        sbl: "Aparece en la SBL de Spamhaus: fuentes de spam verificadas, servicios de spam o remitentes de spam de ROKSO (un listado basado en evidencias y mantenido por personas).",
        css: "Aparece en Spamhaus CSS: detección automática de envíos de correo de gran volumen o en zona gris. Las evidencias son más débiles que las de SBL.",
        xbl: "Aparece en la XBL de Spamhaus: se ha observado que el host ejecuta software troyano o de explotación o funciona como proxy abierto, normalmente una máquina comprometida.",
        drop: "La dirección pertenece a un bloque de red DROP de Spamhaus: rangos controlados por operaciones penales o de alojamiento a prueba de balas y utilizados para malware, controladores de botnets o spam.",
        pbl_isp:
          "Aparece en la PBL de Spamhaus (mantenida por el ISP): no se espera que este rango entregue correo SMTP directamente a servidores de correo de terceros. Es normal para la mayoría de las direcciones residenciales, dinámicas y de usuarios finales, y no es una prueba de abuso.",
        pbl_spamhaus:
          "Aparece en la PBL de Spamhaus (mantenida por Spamhaus): un rango de política que no debería entregar correo directamente. Es normal para muchas direcciones de usuarios finales y no es una prueba de abuso.",
        bcl: "Aparece en la Botnet Controller List de Spamhaus: infraestructura activa y confirmada de comando y control de botnets.",
        spamcop_listing:
          "Aparece en SpamCop por informes recientes de spam (trampas de spam y evidencias enviadas por usuarios). Los listados expiran poco después del último informe.",
        barracuda_listing:
          "Mala reputación de correo medida en la red de filtros de Barracuda. Es una señal agregada y parcialmente histórica que también puede afectar a direcciones reasignadas dinámicamente; no demuestra que esta dirección esté enviando spam actualmente.",
        dronebl_irc_drone:
          "La red DroneBL lo ha observado como un drone de spam IRC (bot).",
        dronebl_bottler:
          "La red DroneBL lo ha observado como un bot IRC Bottler.",
        dronebl_worm:
          "La red DroneBL lo ha observado ejecutando un gusano o un bot de spam.",
        dronebl_ddos_drone:
          "Se ha observado como un drone DDoS (participa en ataques distribuidos).",
        dronebl_open_socks_proxy:
          "Se ha observado ejecutando un proxy SOCKS abierto: infraestructura susceptible de abuso, no necesariamente maliciosa por sí misma.",
        dronebl_open_http_proxy:
          "Se ha observado ejecutando un proxy HTTP abierto: infraestructura susceptible de abuso, no necesariamente maliciosa por sí misma.",
        dronebl_proxychain:
          "Se ha observado como parte de una cadena de proxies.",
        dronebl_web_proxy: "Se ha observado ejecutando un proxy web abierto.",
        dronebl_dictionary:
          "Se ha observado realizando ataques automatizados de diccionario (fuerza bruta).",
        dronebl_wingate: "Se ha observado ejecutando un proxy WinGate abierto.",
        dronebl_compromised_router:
          "Se ha observado como un router o gateway comprometido.",
        dronebl_botnet_auto:
          "Clasificado automáticamente como infraestructura de botnet por DroneBL (detección experimental).",
        dronebl_compromised_host: "Posible host comprometido detectado en IRC.",
        dronebl_uncategorized:
          "Aparece en DroneBL con una clase de amenaza sin categorizar.",
        bld_attack:
          "Informes de ataque presentados por operadores de servidores afectados y recopilados por blocklist.de. Una entrada activa en DNS significa que se han informado ataques recientemente.",
        bld_counts_only:
          "Informes históricos de abuso registrados por blocklist.de; la dirección no está actualmente en la zona DNS activa.",
        feodo_c2_online:
          "Servidor activo de comando y control de botnets, verificado por Feodo Tracker (abuse.ch) mediante una respuesta C2 válida.",
        feodo_c2_offline:
          "Servidor C2 de botnets seguido por Feodo Tracker (abuse.ch); visto por última vez hace pocos días y conservado en la lista de bloqueo.",
        greynoise_scanner_malicious:
          "Se ha observado escaneando Internet durante los últimos 90 días y GreyNoise lo ha clasificado como malicioso.",
        greynoise_scanner_unknown:
          "Se ha observado escaneando Internet durante los últimos 90 días; GreyNoise no ha podido clasificar la actividad.",
        greynoise_scanner_benign:
          "Se ha observado escaneando Internet, pero GreyNoise lo ha clasificado como benigno, por ejemplo, un proyecto de investigación.",
        greynoise_riot:
          "Servicio empresarial común conocido en el conjunto de datos GreyNoise RIOT, por ejemplo un CDN o una empresa de seguridad.",
        abuseipdb_reports:
          "Informes de abuso presentados por usuarios de AbuseIPDB durante los últimos 90 días. La puntuación de confianza refleja el volumen y la coherencia de los informes.",
        abuseipdb_tor: "Identificado como nodo de salida de Tor por AbuseIPDB.",
        threatfox_ioc:
          "Publicado como indicador de amenaza (IOC) en la base de datos ThreatFox de abuse.ch, compartida por investigadores de seguridad.",
        httpbl_search_engine:
          "Rastreador de motor de búsqueda conocido (Project Honey Pot).",
        httpbl_suspicious:
          "Visitante web sospechoso observado en la red de honeypots de Project Honey Pot. A menudo son robots inofensivos; interpreta la información con precaución.",
        httpbl_harvester:
          "Se ha observado recopilando direcciones de correo electrónico de los honeypots de la red de Project Honey Pot.",
        httpbl_comment_spammer:
          "Se ha observado publicando spam en comentarios en los honeypots de la red de Project Honey Pot.",
        ipapi_vpn:
          "Marcado como servicio VPN, proxy o anonimizador por ip-api.com.",
        ipapi_hosting:
          "Marcado como dirección de alojamiento o centro de datos por ip-api.com.",
        ipapi_mobile:
          "Identificado como conexión móvil o celular por ip-api.com.",
        residential_estimate:
          "Conexión residencial estimada según el tipo de conexión y la nomenclatura DNS inversa: una heurística, no una confirmación del proveedor.",
        corroboration:
          "Varias fuentes independientes informan de actividad maliciosa para esta dirección.",
        mail_corroboration:
          "Varias listas independientes de reputación de correo contienen esta dirección.",
      },
      reputationSourceDescriptions: {
        "spamhaus-zen":
          "DNSBL combinado de Spamhaus: SBL (fuentes de spam verificadas), CSS (detección automática de remitentes de spam), XBL (hosts explotados), PBL (rangos de política de correo) y BCL (controladores de botnets).",
        "spamhaus-drop":
          "Fuente gratuita de Spamhaus con bloques de red completos controlados por operaciones penales o de alojamiento a prueba de balas. Se comprueba localmente desde una copia en caché actualizada cada hora.",
        spamcop:
          "Lista de bloqueo de correo creada a partir de trampas de spam e informes de spam de usuarios. Los listados duran poco y reflejan el comportamiento de envío reciente.",
        barracuda:
          "Puntuaciones de reputación de correo medidas en la red de filtros de spam de Barracuda Networks. Señal agregada y parcialmente histórica.",
        dronebl:
          "DNSBL gestionada por el proyecto DroneBL que lista drones, hosts comprometidos, participantes en DDoS y proxies abiertos observados mediante redes IRC y de monitorización. Gratuita para uso comercial y no comercial.",
        "blocklist-de":
          "Plataforma alemana de informes de abuso que recopila informes de ataques (fuerza bruta SSH, ataques de correo, escaneos web, ...) de operadores de servidores afectados.",
        "feodo-tracker":
          "Rastreador de abuse.ch para servidores C2 de botnets (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Las entradas requieren una respuesta C2 válida observada. Se comprueba localmente desde una fuente en caché.",
        greynoise:
          "Inteligencia sobre escáneres de todo Internet. La API comunitaria indica si se ha observado una dirección escaneando recientemente y cómo está clasificada.",
        abuseipdb:
          "Base de datos de informes de abuso con aportaciones de la comunidad y una puntuación de confianza. Requiere una clave de API gratuita (ABUSEIPDB_API_KEY).",
        httpbl:
          "DNSBL de Project Honey Pot para abuso web: recolectores de direcciones, spammer de comentarios y bots sospechosos. Requiere una clave de acceso gratuita (HTTPBL_ACCESS_KEY).",
        threatfox:
          "Plataforma de abuse.ch para compartir indicadores de compromiso, incluidas direcciones C2 de botnets. Requiere una Auth-Key gratuita (THREATFOX_AUTH_KEY).",
        "ip-api":
          "Metadatos de IP: geolocalización, red/ASN y señales de clasificación de la conexión.",
      },
      reputationGeoLabel: "Geolocalización",
      reputationNetworkLabel: "ASN / Proveedor",
      reputationShowHiddenSources: "Mostrar fuentes no configuradas ({count})",
      reputationHideHiddenSources: "Ocultar fuentes no configuradas",
    },
    fr: {
      errorRateLimited: "Trop de requêtes. Patientez un instant et réessayez.",
      errorInvalidTarget:
        "Saisissez un domaine, une adresse IP ou une URL publics valides.",
      errorTargetBlocked:
        "Les cibles privées, locales et internes ne peuvent pas être vérifiées sur ce site public.",
      errorTimeout:
        "La vérification a expiré. La cible peut être lente ou inaccessible.",
      errorUpstream:
        "Un fournisseur de données en amont est actuellement indisponible.",
      errorBadRequest: "Les paramètres de la requête sont invalides.",
      errorTargetNetwork: "La cible n’a pas pu être résolue ou atteinte.",
      showAll: "Tout afficher",
      showLess: "Afficher moins",
      navOverview: "Vue d’ensemble",
      navDiagnostics: "Diagnostic",
      navMyIp: "Mon IP",
      brandTagline: "Boîte à outils réseau et IP",
      themeToggle: "Changer de thème",
      themeLight: "Clair",
      themeDark: "Sombre",
      themeSystem: "Système",
      navMenu: "Menu",
      skipToContent: "Aller au contenu",
      navToolsLabel: "Outils",
      sidebarLabel: "Navigation du site",
      navClose: "Fermer le menu",
      copyValue: "Copier",
      downloadJson: "Télécharger le JSON",
      cancelLookup: "Annuler",
      whoisNoteIana:
        "Aucun serveur de référence n’a été trouvé. La réponse WHOIS de l’IANA est affichée.",
      whoisNoteRdap:
        "WHOIS était indisponible. Les données d’enregistrement RDAP sont affichées à la place.",
      commandTriggerLabel: "Rechercher…",
      commandPlaceholder:
        "Recherchez des outils ou saisissez une IP, un domaine ou un ASN…",
      commandGroupActions: "Actions",
      commandGroupPages: "Aller à",
      commandEmpty: "Aucun outil ni aucune action correspondant.",
      commandHintNavigate: "Naviguer",
      commandHintSelect: "Ouvrir",
      commandHintClose: "Fermer",
      notFoundTitle: "Page introuvable",
      notFoundDescription:
        "Cette adresse ne correspond à aucun outil. Revenez à la page d’accueil ou utilisez la recherche (Ctrl+K).",
      notFoundBackHome: "Retour à la page d’accueil",
      errorTitle: "Une erreur s’est produite",
      errorDescription:
        "Cette page n’a pas pu être chargée. Réessayez ; si le problème persiste, la cause est de notre côté.",
      errorRetry: "Réessayer",
      asnRpkiValid: "RPKI valide",
      asnRpkiInvalid: "RPKI non valide",
      asnRpkiStatus: "RPKI {status}",
      cdnConfidenceHigh: "Élevée",
      cdnConfidenceMedium: "Moyenne",
      cdnConfidenceLow: "Faible",
      pingTabLabel: "Testeur de ping",
      dnsTabLabel: "Recherche DNS",
      whoisTabLabel: "Recherche WHOIS",
      cdnTabLabel: "Vérificateur CDN",
      asnTabLabel: "Recherche ASN",
      reputationTabLabel: "Réputation IP",
      pingTitle: "Testeur de ping et de ports",
      pingSubtitle:
        "Des vérifications guidées des ports TCP/UDP, des points de terminaison EB et de la connectivité des bases de données, dans un flux de test plus clair.",
      dnsTitle: "Recherche DNS",
      dnsSubtitle:
        "Interrogez les enregistrements DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) des domaines et effectuez une recherche DNS inverse pour les adresses IP.",
      whoisTitle: "Recherche WHOIS",
      whoisSubtitle:
        "Interrogez directement depuis cette application les enregistrements WHOIS des domaines et des adresses IP.",
      cdnTitle: "Vérificateur d’utilisation CDN",
      cdnSubtitle:
        "Analysez n’importe quel domaine pour détecter l’utilisation d’un CDN et le fournisseur probable (dont CloudFront, Google Cloud CDN, Azure CDN, Vercel et autres).",
      asnTitle: "Informations ASN",
      asnSubtitle:
        "Consultez les systèmes autonomes avec les détails ASN d’IPinfo et les données publiques d’interconnexion de PeeringDB.",
      asnPlaceholder: "AS8881 ou 8881",
      asnLookupButton: "Rechercher l’ASN",
      asnLookingUp: "Recherche…",
      asnInvalidInput:
        "Utilisez un ASN avec le préfixe AS ou un numéro, par exemple AS8881 ou 8881.",
      asnInvalidRange: "L’ASN doit être compris entre 1 et {max}.",
      asnNetworkError: "Erreur réseau lors de la recherche de l’ASN.",
      asnUpstreamError:
        "Les fournisseurs de données ASN sont actuellement indisponibles.",
      asnRateLimitError:
        "Trop de recherches ASN. Patientez avant de réessayer.",
      asnEmptyTitle: "Saisissez un ASN pour examiner un profil réseau",
      asnEmptyDescription:
        "Utilisez une saisie avec le préfixe AS ou numérique. Les données des fournisseurs peuvent être partielles selon les registres publics et l’offre IPinfo configurée.",
      dnsEmptyTitle:
        "Saisissez un domaine pour résoudre ses enregistrements DNS",
      dnsEmptyDescription:
        "Recherchez les enregistrements A, AAAA, MX, TXT, NS, SOA, SRV et CAA, ou effectuez une recherche inverse sur une adresse IP.",
      whoisEmptyTitle: "Saisissez un domaine ou une IP pour interroger WHOIS",
      whoisEmptyDescription:
        "Récupérez le bureau d’enregistrement, les dates d’enregistrement, le statut et les serveurs de noms auprès du serveur WHOIS responsable.",
      cdnEmptyTitle: "Saisissez un domaine pour détecter son CDN",
      cdnEmptyDescription:
        "Inspectez le DNS, les chaînes CNAME et les en-têtes de réponse pour identifier le CDN ou le fournisseur edge placé devant le site.",
      asnNotFoundTitle: "Aucun profil ASN trouvé",
      asnNotFoundDescription:
        "L’ASN est valide, mais aucune source configurée n’a renvoyé de profil public exploitable.",
      asnPartialData: "Données partielles",
      asnCompleteData: "Complètes",
      asnPrefixes: "Préfixes annoncés",
      asnRouting: "Relations de routage",
      asnPeeringDb: "Profil PeeringDB",
      asnIxPresence: "Présence sur les IX",
      asnFacilities: "Présence dans les sites",
      asnSourceDiagnostics: "Diagnostic des sources",
      asnDetailedDiagnostics: "Diagnostic détaillé",
      asnUnnamed: "AS sans nom",
      asnRoutingDescription:
        "Interconnexions, voisins et poids des chemins du système autonome. Des poids plus élevés indiquent des chemins de routage observés plus fréquemment.",
      asnIxDescription:
        "Points d’échange Internet (IX) où ce système autonome est présent, avec la bande passante d’interconnexion.",
      asnPrefixesDescription:
        "Blocs réseau IP annoncés par ce système autonome dans la table de routage globale.",
      asnPeeringDbDescription:
        "Profil d’interconnexion et politiques de routage déclarés dans la base de données publique PeeringDB.",
      asnFacilitiesDescription:
        "Centres de données physiques et installations de colocation où ce réseau est présent.",
      asnProfileIdentityHeading: "Identité et statut",
      asnProfileInterconnectionHeading: "Détails de l’interconnexion",
      asnProfilePolicyHeading: "Politique de peering",
      asnProfileExternalHeading: "Profils externes",
      asnProfilePrefixes4: "Préfixes IPv4",
      asnProfilePrefixes6: "Préfixes IPv6",
      asnWarnings: "Avertissements",
      asnDiagnosticDuration: "Durée",
      asnDiagnosticCache: "Cache",
      asnDiagnosticWarnings: "Avertissements",
      asnDiagnosticSource: "Source",
      asnSourceDiagnosticsDescription:
        "Disponibilité des fournisseurs, durée de la requête et état du cache pour cette recherche.",
      asnCacheMiss: "absent du cache",
      asnCacheFresh: "à jour",
      asnCacheStale: "périmé",
      asnCacheNotConfigured: "non configuré",
      asnNoPrefixes: "Aucune source configurée n’a renvoyé de préfixes.",
      asnNoRelations:
        "Aucune source configurée n’a renvoyé de relations de routage.",
      asnMetricIpv4Addresses: "Adresses IPv4",
      asnMetricRoutingNeighbours: "Voisins de routage",
      asnMetricIxPresence: "Présence sur les IX",
      asnPrefixIpCount: "IP",
      asnRelationPeers: "Pairs",
      asnRelationUpstreams: "Upstreams",
      asnRelationDownstreams: "Downstreams",
      asnRelationPower: "poids",
      asnSourceAvailable: "disponible",
      asnSourceUnavailable: "indisponible",
      asnSourceNotConfigured: "non configuré",
      asnSourceError: "erreur",
      asnLabelName: "Nom",
      asnLabelCountry: "Pays",
      asnLabelAllocated: "Attribué",
      asnLabelNetworkId: "ID réseau",
      asnLabelAlsoKnownAs: "Également appelé",
      asnLabelWebsite: "Site web",
      asnLabelLookingGlass: "Looking Glass",
      asnLabelRouteServer: "Serveur de routes",
      asnLabelTraffic: "Trafic",
      asnLabelPolicyGeneral: "Politique générale",
      asnLabelPolicyLocations: "Sites de la politique",
      asnLabelPolicyRatio: "Ratio de la politique",
      asnLabelPolicyContracts: "Contrats de la politique",
      asnLabelStatus: "Statut",
      asnLabelExchange: "Échange",
      asnLabelSpeed: "Débit",
      asnLabelIpv4: "IPv4",
      asnLabelIpv6: "IPv6",
      asnLabelRsPeer: "Pair RS",
      asnLabelFacility: "Installation",
      asnLabelCity: "Ville",
      asnLabelLocalAsn: "ASN local",
      asnSortTable: "Tableau triable",
      asnSortBy: "Trier par {column}",
      asnSortNotSorted: "non trié",
      asnSortAscending: "croissant",
      asnSortDescending: "décroissant",
      asnBooleanYes: "oui",
      asnBooleanNo: "non",
      asnSpeedMbps: "Mbit/s",
      asnSpeedGbps: "Gbit/s",
      asnSpeedTbps: "Tbit/s",
      asnNoIxLanRecords: "Aucun enregistrement LAN de IX n’a été renvoyé.",
      asnNoFacilityRecords:
        "Aucun enregistrement d’installation n’a été renvoyé.",
      asnWarningIpinfoUnavailable:
        "Les données ASN IPinfo ne sont pas disponibles pour cet ASN ou cette offre de jeton.",
      asnWarningIpinfoUnexpected: "IPinfo a renvoyé une charge ASN inattendue.",
      asnWarningNoRipeStatData:
        "Aucune donnée ASN RIPEstat n’a été trouvée pour cet ASN.",
      asnWarningNoPeeringDbProfile:
        "Aucun profil réseau public PeeringDB n’a été trouvé pour cet ASN.",
      asnWarningProviderHttp: "{provider} a renvoyé HTTP {status}.",
      asnWarningProviderTimedOut: "La requête vers {provider} a expiré.",
      asnWarningProviderTooLarge:
        "La réponse de {provider} dépasse la taille maximale autorisée.",
      asnWarningProviderInvalidJson: "{provider} a renvoyé un JSON invalide.",
      asnWarningProviderUnavailable:
        "Les données de {provider} sont actuellement indisponibles.",
      asnWarningProviderStale:
        "Les données de {provider} sont actuellement indisponibles ; des données périmées du cache sont utilisées.",
      asnWarningTruncated:
        "{label} tronqué à {limit} sur {total} enregistrements.",
      asnWarningLabelIpinfoIpv4Prefixes: "Préfixes IPv4 IPinfo",
      asnWarningLabelIpinfoIpv6Prefixes: "Préfixes IPv6 IPinfo",
      asnWarningLabelIpinfoPeers: "Pairs IPinfo",
      asnWarningLabelIpinfoUpstreams: "Upstreams IPinfo",
      asnWarningLabelIpinfoDownstreams: "Downstreams IPinfo",
      asnWarningLabelPeeringDbIxLan: "Enregistrements de LAN IX de PeeringDB",
      asnWarningLabelPeeringDbFacilities: "Installations PeeringDB",
      asnWarningLabelRipeStatIpv4Prefixes: "Préfixes IPv4 RIPEstat",
      asnWarningLabelRipeStatIpv6Prefixes: "Préfixes IPv6 RIPEstat",
      asnWarningLabelRipeStatRoutingNeighbours: "Voisins de routage RIPEstat",
      asnWarningLabelRipeStatUpstreamNeighbours: "Voisins amont RIPEstat",
      asnWarningLabelRipeStatDownstreamNeighbours: "Voisins aval RIPEstat",
      asnTabRouting: "Routage",
      asnTabPrefixes: "Préfixes",
      asnTabPeering: "Peering",
      asnTabSources: "Sources",
      asnDetailNavLabel: "Détails de l’ASN",
      asnIdentityEyebrow: "Système autonome",
      asnCopyAsn: "Copier l’ASN",
      asnLabelType: "Type",
      asnLabelRegistry: "Registre",
      asnLabelDomain: "Domaine",
      asnNetworkTypes: {
        isp: "ISP",
        hosting: "Hébergement",
        business: "Entreprise",
        education: "Éducation",
        government: "Gouvernement",
        inactive: "Inactif",
      },
      asnSourcesLabel: "Sources",
      asnMetricIpv4Equivalent: "≈ équivalent /{bits}",
      asnMetricRequiresIpinfo: "Nécessite IPinfo",
      asnMetricNotReported: "Non renseigné",
      asnMetricNoPeeringDb: "Aucun profil PeeringDB",
      asnFacilityCount: { one: "{count} site", other: "{count} sites" },
      asnExchangeCount: { one: "{count} échange", other: "{count} échanges" },
      asnConnectionCount: {
        one: "{count} connexion",
        other: "{count} connexions",
      },
      asnShowMore: "Afficher {count} de plus",
      asnListedOfTotal: "{shown} sur {total} listés",
      asnNoneReported: "Aucune donnée",
      asnRelationV4Peers: "Pairs IPv4",
      asnRelationV6Peers: "Pairs IPv6",
      asnRelationObservedVia: "Poids et nombre de pairs observés via {source}.",
      asnRpkiLabel: "RPKI",
      asnRpkiValidShort: "Valide",
      asnRpkiInvalidShort: "Non valide",
      asnLabelExchanges: "Échanges",
      asnLabelFacilities: "Sites",
      asnLabelPeeringDbRecord: "Enregistrement PeeringDB",
      asnViewOnPeeringDb: "Voir {name} sur PeeringDB",
      asnIxNotOperational: "Non opérationnel",
      asnSortLabel: "Trier",
      asnSortDefault: "Ordre du fournisseur",
      asnSameAsn: "Même ASN que celui-ci",
      asnExamplesLabel: "Essayer",
      asnLabelPolicy: "Politique",
      asnCountryCount: { one: "dans {count} pays", other: "dans {count} pays" },
      targetPlaceholder: "example.com",
      lookupInProgress: "Recherche…",
      dnsLookupButton: "Rechercher le DNS",
      dnsLookupError: "La recherche DNS a échoué.",
      dnsRecordsFor: "Enregistrements DNS de",
      resolvedAddresses: "Adresses résolues",
      noAddressResult: "Aucun résultat A/AAAA.",
      recordDetails: "Détails de l’enregistrement",
      dnsRecordNotes: "Notes de recherche des enregistrements",
      dnsTableType: "Type",
      dnsTableValue: "Valeur",
      dnsShowRaw: "Afficher le JSON brut",
      dnsHideRaw: "Masquer le JSON brut",
      dnsNoRecords: "Aucun enregistrement du type sélectionné n’a été renvoyé.",
      whoisPlaceholder: "example.com ou 8.8.8.8",
      whoisLookupButton: "Rechercher WHOIS",
      whoisLookupError: "La recherche WHOIS a échoué.",
      whoisFor: "WHOIS de",
      queriedServer: "Serveur interrogé",
      referralSource: "Source de référence",
      noWhoisData: "Aucune donnée WHOIS n’a été renvoyée.",
      whoisRegistrar: "Bureau d’enregistrement",
      whoisCreated: "Créé",
      whoisUpdated: "Mis à jour",
      whoisExpires: "Expire",
      whoisStatusLabel: "Statut",
      whoisNameservers: "Serveurs de noms",
      whoisShowRaw: "Afficher la sortie brute",
      whoisHideRaw: "Masquer la sortie brute",
      pingTestMode: "Mode de test",
      pingModeHelperTcp: "Vérifie si le port TCP accepte une connexion.",
      pingModeHelperUdp:
        "Envoie une sonde UDP et indique immédiatement le comportement de réponse ou d’erreur.",
      pingModeHelperEb:
        "Vérifie d’abord TCP, puis la joignabilité du point de terminaison HTTP/HTTPS.",
      pingModeHelperDatabase:
        "Effectue des vérifications du protocole avant authentification et, si nécessaire, des vérifications authentifiées.",
      pingModeDatabase: "Base de données",
      pingDatabaseType: "Type de base de données",
      pingTargetHost: "Hôte / IP cible",
      pingPort: "Port",
      pingTimeout: "Délai d’expiration (ms)",
      pingUseAuth: "Vérifier avec authentification",
      pingUsername: "Nom d’utilisateur",
      pingPassword: "Mot de passe",
      pingDatabaseOptional: "Base de données (facultative)",
      pingRunButton: "Lancer le test de ping",
      pingRunning: "Vérification en cours…",
      pingNetworkError:
        "Erreur réseau lors de la communication avec /api/ping.",
      pingModeLabel: "Mode",
      pingLatencyLabel: "Latence",
      pingTargetLabel: "Cible",
      pingDetailsLabel: "Détails",
      pingEmptyTitle: "Aucun test exécuté pour le moment",
      pingEmptyDescription:
        "Choisissez un mode de test, saisissez un hôte et un port, puis lancez la vérification pour mesurer la joignabilité et la latence.",
      pingStatusSuccess: "Cible joignable",
      pingStatusFailed: "Échec de la vérification",
      pingShowDetails: "Afficher les détails techniques",
      pingHideDetails: "Masquer les détails techniques",
      pingResultTcpOk: "Connexion TCP établie.",
      pingResultTcpTimeout: "Délai TCP dépassé après {timeoutMs} ms.",
      pingResultTcpFailed: "Échec de la connexion TCP : {error}",
      pingResultUdpSent:
        "Paquet UDP envoyé. Aucune erreur ICMP observée sous {timeoutMs} ms.",
      pingResultUdpResponse: "Réponse UDP reçue de {from} ({bytes} octets).",
      pingResultUdpFailed: "Échec de la sonde UDP : {error}",
      pingResultEbHttpOk:
        "Point de terminaison accessible via {scheme} (statut {status}).",
      pingResultEbNoHttp:
        "TCP est ouvert, mais aucune réponse HTTP(S) n’a été détectée sur ce point de terminaison.",
      pingResultEbTcpFailed:
        "Échec de la vérification EB au niveau TCP : {error}",
      pingResultDbConnectFailed: "Échec de la connexion à {database} : {error}",
      pingResultDbProtocolOk:
        "Le serveur {database} a répondu à une sonde de protocole avant authentification.",
      pingResultDbProtocolFailed: "Échec de la sonde {database} : {error}",
      pingResultDbTcpOk:
        "Le port TCP de {database} est joignable. Aucune sonde de protocole avant authentification n’est disponible pour ce type.",
      pingResultDbAuthUnsupported:
        "Les vérifications authentifiées ne sont implémentées que pour Redis. Utilisez la vérification du protocole pour {database}.",
      pingResultDbAuthOk: "La connexion Redis authentifiée a réussi.",
      pingResultDbAuthFailed:
        "Échec de la vérification de l’authentification Redis : {error}",
      cdnAnalyzeButton: "Vérifier le CDN",
      cdnAnalyzing: "Analyse…",
      cdnNetworkError:
        "Erreur réseau lors de la communication avec le vérificateur de CDN.",
      cdnSummaryUnreachable: "Cible inaccessible",
      cdnSummaryNoMatch: "Aucune correspondance CDN fiable",
      cdnSummaryDetected: "CDN détecté",
      cdnConfidenceNa: "n/d",
      cdnNoProviderMatch: "Aucun fournisseur correspondant - IP résolues",
      cdnInspectIpsHint:
        "Vous pouvez examiner ces IP dans la page de recherche d’IP :",
      cdnTargetLabel: "Cible",
      cdnHttpStatusLabel: "Statut HTTP",
      cdnProviderLabel: "Fournisseur",
      cdnUnknown: "Inconnu",
      cdnMatchedSignals: "Signaux correspondants",
      cdnNoSignals: "Aucun signal CDN explicite ne correspond.",
      cdnCnameChain: "Chaîne CNAME",
      cdnNoCname: "Aucun enregistrement CNAME n’a été trouvé.",
      cdnInterestingHeaders: "En-têtes de réponse intéressants",
      cdnNoHeaders: "Aucun en-tête pertinent n’a été trouvé.",
      reputationTitle: "Vérification de la réputation IP",
      reputationSubtitle:
        "Vérifiez une adresse IP publique auprès de sources indépendantes de réputation et de renseignement sur les menaces, et obtenez une évaluation du risque fondée sur des preuves.",
      reputationPlaceholder: "8.8.8.8 ou 2001:4860:4860::8888",
      reputationCheckButton: "Vérifier la réputation",
      reputationChecking: "Vérification…",
      reputationNetworkError:
        "Erreur réseau lors de la communication avec la vérification de réputation.",
      reputationRateLimitError:
        "Trop de vérifications de réputation. Patientez avant de réessayer.",
      reputationInvalidIp:
        "Saisissez une adresse IP publique valide (IPv4 ou IPv6).",
      reputationBlockedIp:
        "Les plages d’IP privées, réservées et internes ne peuvent pas être vérifiées.",
      reputationEmptyTitle:
        "Saisissez une adresse IP pour vérifier sa réputation",
      reputationEmptyDescription:
        "L’IP est vérifiée par rapport aux listes de blocage DNS, aux bases de données de signalements d’abus, aux traqueurs C2 de botnets et aux sources de classification des réseaux. Les fournisseurs facultatifs (AbuseIPDB, GreyNoise, http:BL, ThreatFox) sont activés lorsqu’une clé d’API gratuite est configurée.",
      reputationRiskLow: "Faible risque",
      reputationRiskMedium: "Risque moyen",
      reputationRiskHigh: "Risque élevé",
      reputationHeadlineClean: "Aucune activité malveillante détectée",
      reputationScoreLabel: "Score de risque",
      reputationSectionSummary: "Synthèse de la réputation",
      reputationSectionThreats: "Éléments de menace",
      reputationSectionMail: "Réputation des e-mails",
      reputationSectionNetwork: "Classification du réseau",
      reputationSectionSources: "Sources",
      reputationSectionScore: "Comment ce score a été calculé",
      reputationCoverageChecked: "{count} sources vérifiées",
      reputationCoverageMatched: "{count} avec des éléments de menace",
      reputationCoveragePolicy:
        "{count} avec des informations de politique ou de contexte",
      reputationCoverageUnavailable: "{count} indisponibles",
      reputationGeneratedAt: "Généré {time}",
      reputationNoThreatEvidence:
        "Aucune observation malveillante directe n’a été trouvée dans les sources qui ont pu être vérifiées.",
      reputationNoMailEvidence:
        "Aucune liste de réputation des e-mails n’a été trouvée dans les sources vérifiées.",
      reputationFilterAll: "Tous",
      reputationNoEvidence:
        "Aucun élément dans ce groupe parmi les sources qui ont pu être vérifiées.",
      reputationFactChecked: "Vérifié",
      reputationFactMatched: "Avec des éléments de menace",
      reputationFactUnavailable: "Indisponible",
      reputationFactCheckedAt: "Vérifié le",
      reputationScoreCapped: "Limité à partir de {count} points bruts",
      reputationConnectionLabel: "Connexion",
      reputationReverseLabel: "DNS inverse",
      reputationFieldSource: "Source",
      reputationFieldConfidence: "Confiance",
      reputationFieldFirstSeen: "Première observation",
      reputationFieldLastSeen: "Dernière observation",
      reputationFieldReports: "Signalements",
      reputationFieldAttacks: "Événements d’attaque",
      reputationFieldMalware: "Logiciel malveillant",
      reputationFieldDetail: "Détail",
      reputationFieldReturnCode: "Code de retour",
      reputationPointsLabel: "+{points} points",
      reputationCategories: {
        mail_policy: "Mention dans une liste de politique de messagerie",
        mail_reputation: "Liste de réputation des e-mails",
        spam_observed: "Activité de spam observée",
        abuse_reported: "Abus signalé",
        scanner: "Scanner à l’échelle d’Internet",
        bruteforce: "Attaques par force brute",
        web_attack: "Attaques web",
        ddos: "Attaques DDoS / par inondation",
        botnet: "Activité de botnet",
        malware: "Infrastructure de logiciel malveillant",
        proxy: "Proxy ouvert",
        vpn: "VPN / anonymiseur",
        tor: "Nœud de sortie Tor",
        hosting: "Hébergement / centre de données",
        residential: "Réseau résidentiel",
        mobile: "Réseau mobile",
        benign_service: "Service professionnel connu",
      },
      reputationSeverities: {
        info: "Information",
        low: "Gravité faible",
        medium: "Gravité moyenne",
        high: "Gravité élevée",
        critical: "Critique",
      },
      reputationSourceStates: {
        available: "disponible",
        clean: "propre",
        matched: "correspondance",
        policy_listed: "répertorié (politique)",
        not_configured: "non configuré",
        unsupported: "non pris en charge",
        rate_limited: "limité par le débit",
        resolver_blocked: "résolveur bloqué",
        unavailable: "indisponible",
      },
      reputationReasons: {
        sbl: "Répertorié sur la SBL de Spamhaus : sources de spam vérifiées, services de spam ou spammeurs ROKSO (liste fondée sur des preuves et maintenue par des humains).",
        css: "Répertorié sur Spamhaus CSS : détection automatique d’envois de courriels à haut volume ou dans une zone grise. Les preuves sont moins fortes que pour SBL.",
        xbl: "Répertorié sur la XBL de Spamhaus : l’hôte a été observé exécutant un logiciel trojan ou d’exploitation, ou servant de proxy ouvert — généralement une machine compromise.",
        drop: "L’adresse figure dans un bloc DROP de Spamhaus : plages contrôlées par des opérations criminelles ou des infrastructures d’hébergement dites « bulletproof » et utilisées pour des logiciels malveillants, des contrôleurs de botnets ou du spam.",
        pbl_isp:
          "Répertorié sur la PBL de Spamhaus (maintenue par le FAI) : cette plage ne doit pas livrer directement de courrier SMTP à des serveurs de messagerie tiers. C’est normal pour la plupart des adresses résidentielles, dynamiques et d’utilisateurs finaux, et ne constitue pas une preuve d’abus.",
        pbl_spamhaus:
          "Répertorié sur la PBL de Spamhaus (maintenue par Spamhaus) : une plage de politique qui ne doit pas livrer directement de courrier. C’est normal pour de nombreuses adresses d’utilisateurs finaux et ne constitue pas une preuve d’abus.",
        bcl: "Répertorié sur la Botnet Controller List de Spamhaus : infrastructure active et confirmée de commande et de contrôle de botnets.",
        spamcop_listing:
          "Répertorié sur SpamCop d’après des signalements récents de spam (pièges à spam et preuves envoyées par des utilisateurs). Les inscriptions expirent peu après le dernier signalement.",
        barracuda_listing:
          "Mauvaise réputation de messagerie mesurée dans le réseau de filtres Barracuda. Il s’agit d’un signal agrégé et partiellement historique, qui peut aussi concerner des adresses réattribuées dynamiquement ; cela ne prouve pas que cette adresse envoie actuellement du spam.",
        dronebl_irc_drone:
          "Le réseau DroneBL l’a observé comme un drone de spam IRC (bot).",
        dronebl_bottler:
          "Le réseau DroneBL l’a observé comme un bot IRC Bottler.",
        dronebl_worm:
          "Le réseau DroneBL l’a observé exécutant un ver ou un bot de spam.",
        dronebl_ddos_drone:
          "Il a été observé comme un drone DDoS (il participe à des attaques distribuées).",
        dronebl_open_socks_proxy:
          "Il a été observé exécutant un proxy SOCKS ouvert — infrastructure susceptible d’être détournée, pas nécessairement malveillante en soi.",
        dronebl_open_http_proxy:
          "Il a été observé exécutant un proxy HTTP ouvert — infrastructure susceptible d’être détournée, pas nécessairement malveillante en soi.",
        dronebl_proxychain:
          "Il a été observé comme faisant partie d’une chaîne de proxys.",
        dronebl_web_proxy: "Il a été observé exécutant un proxy web ouvert.",
        dronebl_dictionary:
          "Il a été observé effectuant des attaques automatisées par dictionnaire (force brute).",
        dronebl_wingate: "Il a été observé exécutant un proxy WinGate ouvert.",
        dronebl_compromised_router:
          "Il a été observé comme un routeur ou une passerelle compromise.",
        dronebl_botnet_auto:
          "Classé automatiquement comme infrastructure de botnet par DroneBL (détection expérimentale).",
        dronebl_compromised_host:
          "Hôte possiblement compromis détecté sur IRC.",
        dronebl_uncategorized:
          "Répertorié sur DroneBL avec une classe de menace non catégorisée.",
        bld_attack:
          "Signalements d’attaque déposés par des opérateurs de serveurs concernés et collectés par blocklist.de. Une entrée DNS active signifie que des attaques ont été signalées récemment.",
        bld_counts_only:
          "Signalements d’abus historiques enregistrés par blocklist.de ; l’adresse ne figure pas actuellement dans la zone DNS active.",
        feodo_c2_online:
          "Serveur de commande et de contrôle de botnets actuellement actif, vérifié par Feodo Tracker (abuse.ch) au moyen d’une réponse C2 valide.",
        feodo_c2_offline:
          "Serveur C2 de botnets suivi par Feodo Tracker (abuse.ch) ; vu pour la dernière fois il y a quelques jours et conservé dans la liste de blocage.",
        greynoise_scanner_malicious:
          "Observé en train de scanner Internet au cours des 90 derniers jours et classé comme malveillant par GreyNoise.",
        greynoise_scanner_unknown:
          "Observé en train de scanner Internet au cours des 90 derniers jours ; GreyNoise n’a pas pu classer l’activité.",
        greynoise_scanner_benign:
          "Observé en train de scanner Internet, mais classé comme bénin par GreyNoise (par exemple, un projet de recherche).",
        greynoise_riot:
          "Service professionnel courant bien connu dans le jeu de données GreyNoise RIOT (par exemple un CDN ou une entreprise de sécurité).",
        abuseipdb_reports:
          "Signalements d’abus déposés par des utilisateurs d’AbuseIPDB au cours des 90 derniers jours. Le score de confiance reflète le volume et la cohérence des signalements.",
        abuseipdb_tor: "Identifié par AbuseIPDB comme un nœud de sortie Tor.",
        threatfox_ioc:
          "Publié comme indicateur de menace (IOC) dans la base de données ThreatFox d’abuse.ch, partagée par les chercheurs en sécurité.",
        httpbl_search_engine:
          "Robot de moteur de recherche connu (Project Honey Pot).",
        httpbl_suspicious:
          "Visiteur web suspect observé dans le réseau de pots de miel de Project Honey Pot. Il s’agit souvent de robots inoffensifs ; soyez prudent.",
        httpbl_harvester:
          "Observé en train de collecter des adresses e-mail depuis les pots de miel du réseau Project Honey Pot.",
        httpbl_comment_spammer:
          "Observé en train de publier du spam dans les commentaires sur les pots de miel du réseau Project Honey Pot.",
        ipapi_vpn:
          "Signalé comme service VPN, proxy ou anonymiseur par ip-api.com.",
        ipapi_hosting:
          "Signalé comme adresse d’hébergement ou de centre de données par ip-api.com.",
        ipapi_mobile:
          "Identifié comme connexion mobile ou cellulaire par ip-api.com.",
        residential_estimate:
          "Connexion résidentielle estimée d’après le type de connexion et la convention de nommage DNS inverse — il s’agit d’une heuristique, pas d’une confirmation du fournisseur.",
        corroboration:
          "Plusieurs sources indépendantes signalent une activité malveillante pour cette adresse.",
        mail_corroboration:
          "Plusieurs listes indépendantes de réputation des e-mails contiennent cette adresse.",
      },
      reputationSourceDescriptions: {
        "spamhaus-zen":
          "DNSBL Spamhaus combiné : SBL (sources de spam vérifiées), CSS (détection automatique des expéditeurs de spam), XBL (hôtes exploités), PBL (plages de politique de messagerie) et BCL (contrôleurs de botnets).",
        "spamhaus-drop":
          "Flux gratuit Spamhaus de blocs réseau complets contrôlés par des opérations criminelles ou des infrastructures d’hébergement dites « bulletproof ». Vérifié localement à partir d’une copie en cache actualisée chaque heure.",
        spamcop:
          "Liste de blocage de la messagerie construite à partir de pièges à spam et de signalements d’utilisateurs. Les inscriptions sont de courte durée et reflètent le comportement d’envoi récent.",
        barracuda:
          "Scores de réputation de la messagerie mesurés dans le réseau de filtrage anti-spam de Barracuda Networks. Signal agrégé et partiellement historique.",
        dronebl:
          "DNSBL exploitée par le projet DroneBL, qui liste les drones, hôtes compromis, participants à des attaques DDoS et proxys ouverts observés par les réseaux IRC et de surveillance. Gratuite pour un usage commercial et non commercial.",
        "blocklist-de":
          "Plateforme allemande de signalement d’abus qui collecte les signalements d’attaques (force brute SSH, attaques par messagerie, scans web, ...) auprès des opérateurs de serveurs concernés.",
        "feodo-tracker":
          "Suivi d’abuse.ch pour les serveurs C2 de botnets (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Les entrées exigent une réponse C2 valide observée. Vérifié localement à partir d’un flux en cache.",
        greynoise:
          "Renseignement sur les scanners à l’échelle d’Internet. L’API communautaire indique si une adresse a été observée en train de scanner récemment et comment elle est classée.",
        abuseipdb:
          "Base de données de signalements d’abus alimentée par la communauté, avec un score de confiance. Nécessite une clé d’API gratuite (ABUSEIPDB_API_KEY).",
        httpbl:
          "DNSBL de Project Honey Pot pour les abus web : collecteurs d’adresses, spammeurs de commentaires et bots suspects. Nécessite une clé d’accès gratuite (HTTPBL_ACCESS_KEY).",
        threatfox:
          "Plateforme d’abuse.ch pour partager des indicateurs de compromission, notamment des adresses C2 de botnets. Nécessite une clé d’authentification gratuite (THREATFOX_AUTH_KEY).",
        "ip-api":
          "Métadonnées IP : géolocalisation, réseau/ASN et indicateurs de classification de la connexion.",
      },
      reputationGeoLabel: "Géolocalisation",
      reputationNetworkLabel: "ASN / Fournisseur",
      reputationShowHiddenSources:
        "Afficher les sources non configurées ({count})",
      reputationHideHiddenSources: "Masquer les sources non configurées",
    },
    it: {
      errorRateLimited: "Troppe richieste. Attendi qualche istante e riprova.",
      errorInvalidTarget:
        "Inserisci un dominio, un indirizzo IP o un URL pubblico valido.",
      errorTargetBlocked:
        "Le destinazioni private, locali e interne non possono essere verificate su questo sito pubblico.",
      errorTimeout:
        "La verifica è scaduta. La destinazione potrebbe essere lenta o irraggiungibile.",
      errorUpstream:
        "Un fornitore di dati upstream non è attualmente disponibile.",
      errorBadRequest: "I parametri della richiesta non sono validi.",
      errorTargetNetwork:
        "Non è stato possibile risolvere o raggiungere la destinazione.",
      showAll: "Mostra tutto",
      showLess: "Mostra meno",
      navOverview: "Panoramica",
      navDiagnostics: "Diagnostica",
      navMyIp: "Il mio IP",
      brandTagline: "Strumenti di rete e IP",
      themeToggle: "Cambia tema",
      themeLight: "Chiaro",
      themeDark: "Scuro",
      themeSystem: "Sistema",
      navMenu: "Menu",
      skipToContent: "Vai al contenuto",
      navToolsLabel: "Strumenti",
      sidebarLabel: "Navigazione del sito",
      navClose: "Chiudi menu",
      copyValue: "Copia",
      downloadJson: "Scarica JSON",
      cancelLookup: "Annulla",
      whoisNoteIana:
        "Nessun server di riferimento trovato. Viene mostrata la risposta WHOIS di IANA.",
      whoisNoteRdap:
        "WHOIS non era disponibile. Vengono mostrati i dati di registrazione RDAP.",
      commandTriggerLabel: "Cerca…",
      commandPlaceholder:
        "Cerca strumenti o inserisci un IP, un dominio o un ASN…",
      commandGroupActions: "Azioni",
      commandGroupPages: "Vai a",
      commandEmpty: "Nessuno strumento o azione corrispondente.",
      commandHintNavigate: "Naviga",
      commandHintSelect: "Apri",
      commandHintClose: "Chiudi",
      notFoundTitle: "Pagina non trovata",
      notFoundDescription:
        "Questo indirizzo non appartiene a nessuno strumento. Torna alla pagina iniziale oppure usa la ricerca (Ctrl+K).",
      notFoundBackHome: "Torna alla pagina iniziale",
      errorTitle: "Qualcosa è andato storto",
      errorDescription:
        "Non è stato possibile caricare questa pagina. Riprova; se il problema persiste, la causa è dalla nostra parte.",
      errorRetry: "Riprova",
      asnRpkiValid: "RPKI valido",
      asnRpkiInvalid: "RPKI non valido",
      asnRpkiStatus: "RPKI {status}",
      cdnConfidenceHigh: "Alta",
      cdnConfidenceMedium: "Media",
      cdnConfidenceLow: "Bassa",
      pingTabLabel: "Tester ping",
      dnsTabLabel: "Ricerca DNS",
      whoisTabLabel: "Ricerca WHOIS",
      cdnTabLabel: "Verificatore CDN",
      asnTabLabel: "Ricerca ASN",
      reputationTabLabel: "Reputazione IP",
      pingTitle: "Tester ping e porte",
      pingSubtitle:
        "Verifiche guidate di porte TCP/UDP, endpoint EB e connettività dei database in un flusso di test più lineare.",
      dnsTitle: "Ricerca DNS",
      dnsSubtitle:
        "Interroga i record DNS (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) dei domini ed esegui ricerche DNS inverse per gli indirizzi IP.",
      whoisTitle: "Ricerca WHOIS",
      whoisSubtitle:
        "Interroga direttamente da questa app i record WHOIS di domini e indirizzi IP.",
      cdnTitle: "Verificatore dell’uso di CDN",
      cdnSubtitle:
        "Analizza qualsiasi dominio per rilevare l’uso di CDN e il probabile provider (inclusi CloudFront, Google Cloud CDN, Azure CDN, Vercel e altri).",
      asnTitle: "Informazioni ASN",
      asnSubtitle:
        "Consulta i sistemi autonomi con i dettagli ASN di IPinfo e i dati pubblici di interconnessione di PeeringDB.",
      asnPlaceholder: "AS8881 o 8881",
      asnLookupButton: "Cerca ASN",
      asnLookingUp: "Ricerca in corso…",
      asnInvalidInput:
        "Usa un ASN con prefisso AS o numerico, ad esempio AS8881 o 8881.",
      asnInvalidRange: "L’ASN deve essere compreso tra 1 e {max}.",
      asnNetworkError:
        "Errore di rete durante la comunicazione con la ricerca ASN.",
      asnUpstreamError:
        "I provider di dati ASN non sono attualmente disponibili.",
      asnRateLimitError: "Troppe ricerche ASN. Attendi prima di riprovare.",
      asnEmptyTitle: "Inserisci un ASN per esaminare un profilo di rete",
      asnEmptyDescription:
        "Usa un valore con prefisso AS o numerico. I dati dei provider possono essere parziali in base ai record pubblici e al piano IPinfo configurato.",
      dnsEmptyTitle: "Inserisci un dominio per risolvere i suoi record DNS",
      dnsEmptyDescription:
        "Cerca i record A, AAAA, MX, TXT, NS, SOA, SRV e CAA, oppure esegui una ricerca inversa su un indirizzo IP.",
      whoisEmptyTitle: "Inserisci un dominio o un IP per interrogare WHOIS",
      whoisEmptyDescription:
        "Ottieni registrar, date di registrazione, stato e nameserver dal server WHOIS responsabile.",
      cdnEmptyTitle: "Inserisci un dominio per rilevare il suo CDN",
      cdnEmptyDescription:
        "Ispeziona DNS, catene CNAME e intestazioni di risposta per identificare il CDN o il provider edge davanti al sito.",
      asnNotFoundTitle: "Nessun profilo ASN trovato",
      asnNotFoundDescription:
        "L’ASN è valido, ma nessuna delle fonti configurate ha restituito un profilo pubblico utilizzabile.",
      asnPartialData: "Dati parziali",
      asnCompleteData: "Completi",
      asnPrefixes: "Prefissi annunciati",
      asnRouting: "Relazioni di routing",
      asnPeeringDb: "Profilo PeeringDB",
      asnIxPresence: "Presenza negli IX",
      asnFacilities: "Presenza nelle strutture",
      asnSourceDiagnostics: "Diagnostica delle fonti",
      asnDetailedDiagnostics: "Diagnostica dettagliata",
      asnUnnamed: "AS senza nome",
      asnRoutingDescription:
        "Interconnessioni, vicini e pesi dei percorsi del sistema autonomo. Pesi più alti indicano percorsi di routing osservati più frequentemente.",
      asnIxDescription:
        "Punti di scambio Internet (IX) in cui è presente questo sistema autonomo, inclusa la banda di interconnessione.",
      asnPrefixesDescription:
        "Blocchi di rete IP annunciati da questo sistema autonomo nella tabella di routing globale.",
      asnPeeringDbDescription:
        "Profilo di interconnessione e policy di routing dichiarati nel database pubblico PeeringDB.",
      asnFacilitiesDescription:
        "Data center fisici e strutture di colocation in cui questa rete è presente.",
      asnProfileIdentityHeading: "Identità e stato",
      asnProfileInterconnectionHeading: "Dettagli dell’interconnessione",
      asnProfilePolicyHeading: "Policy di peering",
      asnProfileExternalHeading: "Profili esterni",
      asnProfilePrefixes4: "Prefissi IPv4",
      asnProfilePrefixes6: "Prefissi IPv6",
      asnWarnings: "Avvisi",
      asnDiagnosticDuration: "Durata",
      asnDiagnosticCache: "Cache",
      asnDiagnosticWarnings: "Avvisi",
      asnDiagnosticSource: "Fonte",
      asnSourceDiagnosticsDescription:
        "Disponibilità dei provider, durata della richiesta e stato della cache per questa ricerca.",
      asnCacheMiss: "non presente in cache",
      asnCacheFresh: "aggiornata",
      asnCacheStale: "obsoleta",
      asnCacheNotConfigured: "non configurata",
      asnNoPrefixes: "Le fonti configurate non hanno restituito prefissi.",
      asnNoRelations:
        "Le fonti configurate non hanno restituito relazioni di routing.",
      asnMetricIpv4Addresses: "Indirizzi IPv4",
      asnMetricRoutingNeighbours: "Vicini di routing",
      asnMetricIxPresence: "Presenza negli IX",
      asnPrefixIpCount: "IP",
      asnRelationPeers: "Peer",
      asnRelationUpstreams: "Upstream",
      asnRelationDownstreams: "Downstream",
      asnRelationPower: "peso",
      asnSourceAvailable: "disponibile",
      asnSourceUnavailable: "non disponibile",
      asnSourceNotConfigured: "non configurata",
      asnSourceError: "errore",
      asnLabelName: "Nome",
      asnLabelCountry: "Paese",
      asnLabelAllocated: "Assegnato",
      asnLabelNetworkId: "ID rete",
      asnLabelAlsoKnownAs: "Anche noto come",
      asnLabelWebsite: "Sito web",
      asnLabelLookingGlass: "Looking Glass",
      asnLabelRouteServer: "Server di routing",
      asnLabelTraffic: "Traffico",
      asnLabelPolicyGeneral: "Policy generale",
      asnLabelPolicyLocations: "Località della policy",
      asnLabelPolicyRatio: "Rapporto della policy",
      asnLabelPolicyContracts: "Contratti della policy",
      asnLabelStatus: "Stato",
      asnLabelExchange: "Scambio",
      asnLabelSpeed: "Velocità",
      asnLabelIpv4: "IPv4",
      asnLabelIpv6: "IPv6",
      asnLabelRsPeer: "Peer RS",
      asnLabelFacility: "Struttura",
      asnLabelCity: "Città",
      asnLabelLocalAsn: "ASN locale",
      asnSortTable: "Tabella ordinabile",
      asnSortBy: "Ordina per {column}",
      asnSortNotSorted: "non ordinato",
      asnSortAscending: "crescente",
      asnSortDescending: "decrescente",
      asnBooleanYes: "sì",
      asnBooleanNo: "no",
      asnSpeedMbps: "Mbit/s",
      asnSpeedGbps: "Gbit/s",
      asnSpeedTbps: "Tbit/s",
      asnNoIxLanRecords: "Nessun record LAN IX restituito.",
      asnNoFacilityRecords: "Nessun record delle strutture restituito.",
      asnWarningIpinfoUnavailable:
        "I dati ASN di IPinfo non sono disponibili per questo ASN o questo piano del token.",
      asnWarningIpinfoUnexpected:
        "IPinfo ha restituito un contenuto ASN inatteso.",
      asnWarningNoRipeStatData:
        "Nessun dato ASN RIPEstat trovato per questo ASN.",
      asnWarningNoPeeringDbProfile:
        "Nessun profilo di rete pubblico PeeringDB trovato per questo ASN.",
      asnWarningProviderHttp: "{provider} ha restituito HTTP {status}.",
      asnWarningProviderTimedOut: "La richiesta a {provider} è scaduta.",
      asnWarningProviderTooLarge:
        "La risposta di {provider} ha superato il limite di dimensione.",
      asnWarningProviderInvalidJson:
        "{provider} ha restituito JSON non valido.",
      asnWarningProviderUnavailable:
        "I dati di {provider} non sono attualmente disponibili.",
      asnWarningProviderStale:
        "I dati di {provider} non sono attualmente disponibili; vengono usati dati obsoleti dalla cache.",
      asnWarningTruncated: "{label} troncato a {limit} di {total} record.",
      asnWarningLabelIpinfoIpv4Prefixes: "Prefissi IPv4 di IPinfo",
      asnWarningLabelIpinfoIpv6Prefixes: "Prefissi IPv6 di IPinfo",
      asnWarningLabelIpinfoPeers: "Peer IPinfo",
      asnWarningLabelIpinfoUpstreams: "Upstream IPinfo",
      asnWarningLabelIpinfoDownstreams: "Downstream IPinfo",
      asnWarningLabelPeeringDbIxLan: "Record LAN IX di PeeringDB",
      asnWarningLabelPeeringDbFacilities: "Strutture PeeringDB",
      asnWarningLabelRipeStatIpv4Prefixes: "Prefissi IPv4 RIPEstat",
      asnWarningLabelRipeStatIpv6Prefixes: "Prefissi IPv6 RIPEstat",
      asnWarningLabelRipeStatRoutingNeighbours: "Vicini di routing RIPEstat",
      asnWarningLabelRipeStatUpstreamNeighbours: "Vicini upstream RIPEstat",
      asnWarningLabelRipeStatDownstreamNeighbours: "Vicini downstream RIPEstat",
      asnTabRouting: "Routing",
      asnTabPrefixes: "Prefissi",
      asnTabPeering: "Peering",
      asnTabSources: "Fonti",
      asnDetailNavLabel: "Dettagli dell’ASN",
      asnIdentityEyebrow: "Sistema autonomo",
      asnCopyAsn: "Copia ASN",
      asnLabelType: "Tipo",
      asnLabelRegistry: "Registro",
      asnLabelDomain: "Dominio",
      asnNetworkTypes: {
        isp: "ISP",
        hosting: "Hosting",
        business: "Azienda",
        education: "Istruzione",
        government: "Governo",
        inactive: "Inattivo",
      },
      asnSourcesLabel: "Fonti",
      asnMetricIpv4Equivalent: "≈ equivalente a /{bits}",
      asnMetricRequiresIpinfo: "Richiede IPinfo",
      asnMetricNotReported: "Non riportato",
      asnMetricNoPeeringDb: "Nessun profilo PeeringDB",
      asnFacilityCount: {
        one: "{count} struttura",
        other: "{count} strutture",
      },
      asnExchangeCount: { one: "{count} scambio", other: "{count} scambi" },
      asnConnectionCount: {
        one: "{count} connessione",
        other: "{count} connessioni",
      },
      asnShowMore: "Mostra altri {count}",
      asnListedOfTotal: "{shown} di {total} elencati",
      asnNoneReported: "Nessun dato riportato",
      asnRelationV4Peers: "Peer IPv4",
      asnRelationV6Peers: "Peer IPv6",
      asnRelationObservedVia:
        "Peso e numero di peer osservati tramite {source}.",
      asnRpkiLabel: "RPKI",
      asnRpkiValidShort: "Valido",
      asnRpkiInvalidShort: "Non valido",
      asnLabelExchanges: "Scambi",
      asnLabelFacilities: "Strutture",
      asnLabelPeeringDbRecord: "Record PeeringDB",
      asnViewOnPeeringDb: "Vedi {name} su PeeringDB",
      asnIxNotOperational: "Non operativo",
      asnSortLabel: "Ordina",
      asnSortDefault: "Ordine del provider",
      asnSameAsn: "Stesso ASN di questo",
      asnExamplesLabel: "Prova",
      asnLabelPolicy: "Policy",
      asnCountryCount: { one: "in {count} paese", other: "in {count} paesi" },
      targetPlaceholder: "example.com",
      lookupInProgress: "Ricerca in corso…",
      dnsLookupButton: "Cerca DNS",
      dnsLookupError: "Ricerca DNS non riuscita.",
      dnsRecordsFor: "Record DNS di",
      resolvedAddresses: "Indirizzi risolti",
      noAddressResult: "Nessun risultato A/AAAA.",
      recordDetails: "Dettagli del record",
      dnsRecordNotes: "Note sulla ricerca dei record",
      dnsTableType: "Tipo",
      dnsTableValue: "Valore",
      dnsShowRaw: "Mostra JSON grezzo",
      dnsHideRaw: "Nascondi JSON grezzo",
      dnsNoRecords: "Nessun record del tipo selezionato restituito.",
      whoisPlaceholder: "example.com o 8.8.8.8",
      whoisLookupButton: "Cerca WHOIS",
      whoisLookupError: "Ricerca WHOIS non riuscita.",
      whoisFor: "WHOIS di",
      queriedServer: "Server interrogato",
      referralSource: "Fonte di riferimento",
      noWhoisData: "Nessun dato WHOIS restituito.",
      whoisRegistrar: "Registrar",
      whoisCreated: "Creato",
      whoisUpdated: "Aggiornato",
      whoisExpires: "Scadenza",
      whoisStatusLabel: "Stato",
      whoisNameservers: "Nameserver",
      whoisShowRaw: "Mostra output grezzo",
      whoisHideRaw: "Nascondi output grezzo",
      pingTestMode: "Modalità di test",
      pingModeHelperTcp: "Verifica se la porta TCP accetta una connessione.",
      pingModeHelperUdp:
        "Invia una sonda UDP e segnala subito il comportamento di risposta o errore.",
      pingModeHelperEb:
        "Verifica prima TCP, poi la raggiungibilità dell’endpoint HTTP/HTTPS.",
      pingModeHelperDatabase:
        "Esegue controlli del protocollo prima dell’autenticazione e controlli autenticati facoltativi.",
      pingModeDatabase: "Database",
      pingDatabaseType: "Tipo di database",
      pingTargetHost: "Host/IP di destinazione",
      pingPort: "Porta",
      pingTimeout: "Timeout (ms)",
      pingUseAuth: "Verifica con autenticazione",
      pingUsername: "Nome utente",
      pingPassword: "Password",
      pingDatabaseOptional: "Database (facoltativo)",
      pingRunButton: "Esegui test ping",
      pingRunning: "Verifica in corso…",
      pingNetworkError:
        "Errore di rete durante la comunicazione con /api/ping.",
      pingModeLabel: "Modalità",
      pingLatencyLabel: "Latenza",
      pingTargetLabel: "Destinazione",
      pingDetailsLabel: "Dettagli",
      pingEmptyTitle: "Nessun test eseguito",
      pingEmptyDescription:
        "Scegli una modalità di test, inserisci un host e una porta, poi esegui la verifica per misurare raggiungibilità e latenza.",
      pingStatusSuccess: "Destinazione raggiungibile",
      pingStatusFailed: "Verifica non riuscita",
      pingShowDetails: "Mostra dettagli tecnici",
      pingHideDetails: "Nascondi dettagli tecnici",
      pingResultTcpOk: "Connessione TCP stabilita.",
      pingResultTcpTimeout: "Timeout TCP dopo {timeoutMs} ms.",
      pingResultTcpFailed: "Connessione TCP non riuscita: {error}",
      pingResultUdpSent:
        "Pacchetto UDP inviato. Nessun errore ICMP osservato entro {timeoutMs} ms.",
      pingResultUdpResponse: "Risposta UDP ricevuta da {from} ({bytes} byte).",
      pingResultUdpFailed: "Sonda UDP non riuscita: {error}",
      pingResultEbHttpOk:
        "Endpoint raggiungibile tramite {scheme} (stato {status}).",
      pingResultEbNoHttp:
        "TCP aperto, ma nessuna risposta HTTP(S) rilevata su questo endpoint.",
      pingResultEbTcpFailed: "Verifica EB non riuscita nella fase TCP: {error}",
      pingResultDbConnectFailed:
        "Connessione a {database} non riuscita: {error}",
      pingResultDbProtocolOk:
        "Il server {database} ha risposto a una sonda del protocollo pre-autenticazione.",
      pingResultDbProtocolFailed: "Sonda {database} non riuscita: {error}",
      pingResultDbTcpOk:
        "La porta TCP di {database} è raggiungibile. Per questo tipo non è disponibile una sonda del protocollo pre-autenticazione.",
      pingResultDbAuthUnsupported:
        "I controlli autenticati sono implementati solo per Redis. Per {database} usa il controllo del protocollo.",
      pingResultDbAuthOk: "Connessione Redis autenticata riuscita.",
      pingResultDbAuthFailed:
        "Verifica dell’autenticazione Redis non riuscita: {error}",
      cdnAnalyzeButton: "Verifica CDN",
      cdnAnalyzing: "Analisi…",
      cdnNetworkError:
        "Errore di rete durante la comunicazione con il verificatore CDN.",
      cdnSummaryUnreachable: "Destinazione irraggiungibile",
      cdnSummaryNoMatch: "Nessuna corrispondenza CDN affidabile",
      cdnSummaryDetected: "CDN rilevato",
      cdnConfidenceNa: "n/d",
      cdnNoProviderMatch: "Nessun provider corrispondente - IP risolti",
      cdnInspectIpsHint:
        "Puoi ispezionare questi IP nella pagina di ricerca IP:",
      cdnTargetLabel: "Destinazione",
      cdnHttpStatusLabel: "Stato HTTP",
      cdnProviderLabel: "Provider",
      cdnUnknown: "Sconosciuto",
      cdnMatchedSignals: "Segnali corrispondenti",
      cdnNoSignals: "Nessun segnale CDN esplicito corrispondente.",
      cdnCnameChain: "Catena CNAME",
      cdnNoCname: "Nessun record CNAME rilevato.",
      cdnInterestingHeaders: "Intestazioni di risposta interessanti",
      cdnNoHeaders: "Nessuna intestazione rilevante trovata.",
      reputationTitle: "Controllo della reputazione IP",
      reputationSubtitle:
        "Controlla un indirizzo IP pubblico rispetto a fonti indipendenti di reputazione e intelligenza sulle minacce e ottieni una valutazione del rischio basata sulle evidenze.",
      reputationPlaceholder: "8.8.8.8 o 2001:4860:4860::8888",
      reputationCheckButton: "Controlla la reputazione",
      reputationChecking: "Controllo…",
      reputationNetworkError:
        "Errore di rete durante la comunicazione con il controllo della reputazione.",
      reputationRateLimitError:
        "Troppi controlli di reputazione. Attendi prima di riprovare.",
      reputationInvalidIp:
        "Inserisci un indirizzo IP pubblico valido (IPv4 o IPv6).",
      reputationBlockedIp:
        "Gli intervalli IP privati, riservati e interni non possono essere controllati.",
      reputationEmptyTitle:
        "Inserisci un indirizzo IP per controllarne la reputazione",
      reputationEmptyDescription:
        "L’indirizzo IP viene confrontato con blacklist DNS, database di segnalazioni di abuso, tracker C2 di botnet e fonti di classificazione della rete. I provider opzionali (AbuseIPDB, GreyNoise, http:BL, ThreatFox) vengono attivati quando viene configurata una chiave API gratuita.",
      reputationRiskLow: "Rischio basso",
      reputationRiskMedium: "Rischio medio",
      reputationRiskHigh: "Rischio alto",
      reputationHeadlineClean: "Nessuna attività malevola rilevata",
      reputationScoreLabel: "Punteggio di rischio",
      reputationSectionSummary: "Riepilogo della reputazione",
      reputationSectionThreats: "Evidenze di minacce",
      reputationSectionMail: "Reputazione delle email",
      reputationSectionNetwork: "Classificazione della rete",
      reputationSectionSources: "Fonti",
      reputationSectionScore: "Come è stato calcolato questo punteggio",
      reputationCoverageChecked: "{count} fonti controllate",
      reputationCoverageMatched: "{count} con evidenze di minacce",
      reputationCoveragePolicy: "{count} con informazioni di policy o contesto",
      reputationCoverageUnavailable: "{count} non disponibili",
      reputationGeneratedAt: "Generato {time}",
      reputationNoThreatEvidence:
        "Nelle fonti che è stato possibile controllare non sono state trovate osservazioni malevole dirette.",
      reputationNoMailEvidence:
        "Nelle fonti controllate non sono state trovate liste di reputazione delle email.",
      reputationFilterAll: "Tutte",
      reputationNoEvidence:
        "Nessuna evidenza in questo gruppo nelle fonti che è stato possibile controllare.",
      reputationFactChecked: "Controllato",
      reputationFactMatched: "Con evidenze di minacce",
      reputationFactUnavailable: "Non disponibile",
      reputationFactCheckedAt: "Controllato il",
      reputationScoreCapped: "Limitato a partire da {count} punti grezzi",
      reputationConnectionLabel: "Connessione",
      reputationReverseLabel: "DNS inverso",
      reputationFieldSource: "Fonte",
      reputationFieldConfidence: "Affidabilità",
      reputationFieldFirstSeen: "Prima osservazione",
      reputationFieldLastSeen: "Ultima osservazione",
      reputationFieldReports: "Segnalazioni",
      reputationFieldAttacks: "Eventi di attacco",
      reputationFieldMalware: "Software malevolo",
      reputationFieldDetail: "Dettaglio",
      reputationFieldReturnCode: "Codice di ritorno",
      reputationPointsLabel: "+{points} punti",
      reputationCategories: {
        mail_policy: "Iscrizione nelle liste di policy e-mail",
        mail_reputation: "Voce nella reputazione delle email",
        spam_observed: "Attività di spam osservata",
        abuse_reported: "Abuso segnalato",
        scanner: "Scanner su scala Internet",
        bruteforce: "Attacchi di forza bruta",
        web_attack: "Attacchi web",
        ddos: "Attacchi DDoS / flood",
        botnet: "Attività di botnet",
        malware: "Infrastruttura malware",
        proxy: "Proxy aperto",
        vpn: "VPN / anonimizzatore",
        tor: "Nodo di uscita Tor",
        hosting: "Hosting / data center",
        residential: "Rete residenziale",
        mobile: "Rete mobile",
        benign_service: "Servizio aziendale noto",
      },
      reputationSeverities: {
        info: "Informazione",
        low: "Gravità bassa",
        medium: "Gravità media",
        high: "Gravità alta",
        critical: "Critica",
      },
      reputationSourceStates: {
        available: "disponibile",
        clean: "pulita",
        matched: "corrispondenza",
        policy_listed: "in elenco (policy)",
        not_configured: "non configurata",
        unsupported: "non supportata",
        rate_limited: "limitata dalla frequenza",
        resolver_blocked: "resolver bloccato",
        unavailable: "non disponibile",
      },
      reputationReasons: {
        sbl: "Presente nella SBL di Spamhaus: fonti di spam verificate, servizi di spam o spammer ROKSO (elenco basato su evidenze e mantenuto da persone).",
        css: "Presente in Spamhaus CSS: rilevamento automatico di invii di e-mail ad alto volume o nella zona grigia. Le evidenze sono più deboli rispetto alla SBL.",
        xbl: "Presente nella XBL di Spamhaus: l’host è stato osservato mentre eseguiva software trojan o exploit oppure come proxy aperto, di solito una macchina compromessa.",
        drop: "L’indirizzo si trova in un blocco DROP di Spamhaus: intervalli controllati da operazioni criminali o da servizi di hosting «bulletproof», usati per malware, controller di botnet o spam.",
        pbl_isp:
          "Presente nella PBL di Spamhaus (gestita dall’ISP): questo intervallo non dovrebbe consegnare direttamente posta SMTP a server di posta di terze parti. È normale per la maggior parte degli indirizzi residenziali, dinamici e degli utenti finali e non costituisce prova di abuso.",
        pbl_spamhaus:
          "Presente nella PBL di Spamhaus (gestita da Spamhaus): un intervallo di policy che non dovrebbe consegnare direttamente posta. È normale per molti indirizzi di utenti finali e non costituisce prova di abuso.",
        bcl: "Presente nella Botnet Controller List di Spamhaus: infrastruttura attiva e confermata di comando e controllo di botnet.",
        spamcop_listing:
          "Presente su SpamCop in base a segnalazioni recenti di spam (trappole per spam e prove inviate dagli utenti). Le voci scadono poco dopo l’ultima segnalazione.",
        barracuda_listing:
          "Scarsa reputazione email misurata nella rete di filtri Barracuda. È un segnale aggregato e in parte storico che può riguardare anche indirizzi riassegnati dinamicamente; non dimostra che questo indirizzo stia inviando spam in questo momento.",
        dronebl_irc_drone:
          "La rete DroneBL lo ha osservato come drone spam IRC (bot).",
        dronebl_bottler:
          "La rete DroneBL lo ha osservato come bot IRC Bottler.",
        dronebl_worm:
          "La rete DroneBL lo ha osservato mentre eseguiva un worm o uno spam bot.",
        dronebl_ddos_drone:
          "Osservato come drone DDoS (partecipa ad attacchi distribuiti).",
        dronebl_open_socks_proxy:
          "Osservato mentre eseguiva un proxy SOCKS aperto: infrastruttura abusabile, non necessariamente malevola di per sé.",
        dronebl_open_http_proxy:
          "Osservato mentre eseguiva un proxy HTTP aperto: infrastruttura abusabile, non necessariamente malevola di per sé.",
        dronebl_proxychain: "Osservato come parte di una catena di proxy.",
        dronebl_web_proxy: "Osservato mentre eseguiva un proxy web aperto.",
        dronebl_dictionary:
          "Osservato mentre eseguiva attacchi automatici a dizionario (forza bruta).",
        dronebl_wingate: "Osservato mentre eseguiva un proxy WinGate aperto.",
        dronebl_compromised_router:
          "Osservato come router o gateway compromesso.",
        dronebl_botnet_auto:
          "Classificato automaticamente come infrastruttura di botnet da DroneBL (rilevamento sperimentale).",
        dronebl_compromised_host: "Possibile host compromesso rilevato su IRC.",
        dronebl_uncategorized:
          "Presente su DroneBL con una classe di minaccia non categorizzata.",
        bld_attack:
          "Segnalazioni di attacco depositate dagli operatori dei server colpiti e raccolte da blocklist.de. Una voce DNS attiva significa che sono state segnalate attacchi recentemente.",
        bld_counts_only:
          "Segnalazioni di abuso storiche registrate da blocklist.de; l’indirizzo non è attualmente nella zona DNS attiva.",
        feodo_c2_online:
          "Server di comando e controllo di botnet attualmente attivo, verificato da Feodo Tracker (abuse.ch) tramite una risposta C2 valida.",
        feodo_c2_offline:
          "Server C2 di botnet monitorato da Feodo Tracker (abuse.ch); visto l’ultima volta nei giorni passati e mantenuto nella blocklist.",
        greynoise_scanner_malicious:
          "Osservato mentre scansionava Internet negli ultimi 90 giorni e classificato come malevolo da GreyNoise.",
        greynoise_scanner_unknown:
          "Osservato mentre scansionava Internet negli ultimi 90 giorni; GreyNoise non ha potuto classificare l’attività.",
        greynoise_scanner_benign:
          "Osservato mentre scansionava Internet, ma classificato come benigno da GreyNoise (ad esempio, un progetto di ricerca).",
        greynoise_riot:
          "Servizio aziendale comune noto nel dataset GreyNoise RIOT (ad esempio un CDN o un’azienda di sicurezza).",
        abuseipdb_reports:
          "Segnalazioni di abuso depositate dagli utenti di AbuseIPDB negli ultimi 90 giorni. Il punteggio di affidabilità riflette il volume e la coerenza delle segnalazioni.",
        abuseipdb_tor: "Identificato da AbuseIPDB come nodo di uscita Tor.",
        threatfox_ioc:
          "Pubblicato come indicatore di minaccia (IOC) nel database ThreatFox di abuse.ch, condiviso dai ricercatori di sicurezza.",
        httpbl_search_engine:
          "Crawler noto di un motore di ricerca (Project Honey Pot).",
        httpbl_suspicious:
          "Visitatore web sospetto osservato nella rete honeypot di Project Honey Pot. Spesso si tratta di robot innocui; valuta con cautela.",
        httpbl_harvester:
          "Osservato mentre raccoglieva indirizzi e-mail dagli honeypot della rete Project Honey Pot.",
        httpbl_comment_spammer:
          "Osservato mentre pubblicava spam nei commenti sugli honeypot della rete Project Honey Pot.",
        ipapi_vpn:
          "Contrassegnato da ip-api.com come servizio VPN, proxy o anonimizzatore.",
        ipapi_hosting:
          "Contrassegnato da ip-api.com come indirizzo di hosting o data center.",
        ipapi_mobile:
          "Identificato da ip-api.com come connessione mobile o cellulare.",
        residential_estimate:
          "Connessione residenziale stimata in base al tipo di connessione e alla convenzione di denominazione DNS inversa: un’euristica, non una conferma del provider.",
        corroboration:
          "Diverse fonti indipendenti segnalano attività malevola per questo indirizzo.",
        mail_corroboration:
          "Diverse liste indipendenti sulla reputazione delle email contengono questo indirizzo.",
      },
      reputationSourceDescriptions: {
        "spamhaus-zen":
          "DNSBL Spamhaus combinata: SBL (fonti di spam verificate), CSS (rilevamento automatico dei mittenti di spam), XBL (host sfruttati), PBL (intervalli di policy e-mail) e BCL (controller di botnet).",
        "spamhaus-drop":
          "Feed gratuito di Spamhaus con blocchi di rete completi controllati da operazioni criminali o da servizi di hosting «bulletproof». Controllato localmente da una copia in cache aggiornata ogni ora.",
        spamcop:
          "Blocklist e-mail creata da trappole per spam e segnalazioni degli utenti. Le voci hanno una durata breve e riflettono il comportamento di invio recente.",
        barracuda:
          "Punteggi di reputazione e-mail misurati nella rete di filtri antispam di Barracuda Networks. Segnale aggregato e in parte storico.",
        dronebl:
          "DNSBL gestita dal progetto DroneBL che elenca drone, host compromessi, partecipanti a DDoS e proxy aperti osservati tramite reti IRC e di monitoraggio. Gratuita per uso commerciale e non commerciale.",
        "blocklist-de":
          "Piattaforma tedesca di segnalazioni di abuso che raccoglie segnalazioni di attacchi (forza bruta SSH, attacchi e-mail, scansioni web, ...) dagli operatori dei server colpiti.",
        "feodo-tracker":
          "Tracker di abuse.ch per server C2 di botnet (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Le voci richiedono una risposta C2 valida osservata. Controllato localmente da un feed in cache.",
        greynoise:
          "Informazioni sugli scanner su scala Internet. L’API della community segnala se un indirizzo è stato osservato mentre scansionava di recente e come è classificato.",
        abuseipdb:
          "Database di segnalazioni di abuso alimentato dalla community con un punteggio di affidabilità. Richiede una chiave API gratuita (ABUSEIPDB_API_KEY).",
        httpbl:
          "DNSBL di Project Honey Pot per gli abusi web: raccoglitori di indirizzi e-mail, spammer nei commenti e bot sospetti. Richiede una chiave di accesso gratuita (HTTPBL_ACCESS_KEY).",
        threatfox:
          "Piattaforma di abuse.ch per condividere indicatori di compromissione, inclusi gli indirizzi C2 di botnet. Richiede una Auth-Key gratuita (THREATFOX_AUTH_KEY).",
        "ip-api":
          "Metadati IP: geolocalizzazione, rete/ASN e segnali di classificazione della connessione.",
      },
      reputationGeoLabel: "Geolocalizzazione",
      reputationNetworkLabel: "ASN / Provider",
      reputationShowHiddenSources: "Mostra fonti non configurate ({count})",
      reputationHideHiddenSources: "Nascondi fonti non configurate",
    },
    nl: {
      errorRateLimited: "Te veel verzoeken. Wacht even en probeer het opnieuw.",
      errorInvalidTarget:
        "Voer een geldig openbaar domein, IP-adres of URL in.",
      errorTargetBlocked:
        "Privé-, lokale en interne doelen kunnen op deze openbare site niet worden gecontroleerd.",
      errorTimeout:
        "De controle heeft een time-out. Het doel kan traag of onbereikbaar zijn.",
      errorUpstream:
        "Een upstream-gegevensprovider is momenteel niet beschikbaar.",
      errorBadRequest: "De parameters van het verzoek zijn ongeldig.",
      errorTargetNetwork: "Het doel kon niet worden opgelost of bereikt.",
      showAll: "Alles tonen",
      showLess: "Minder tonen",
      navOverview: "Overzicht",
      navDiagnostics: "Diagnostiek",
      navMyIp: "Mijn IP",
      brandTagline: "Netwerk- en IP-toolkit",
      themeToggle: "Thema wisselen",
      themeLight: "Licht",
      themeDark: "Donker",
      themeSystem: "Systeem",
      navMenu: "Menu",
      skipToContent: "Naar de inhoud",
      navToolsLabel: "Gereedschappen",
      sidebarLabel: "Sitenavigatie",
      navClose: "Menu sluiten",
      copyValue: "Kopiëren",
      downloadJson: "JSON downloaden",
      cancelLookup: "Annuleren",
      whoisNoteIana:
        "Er is geen verwijzingsserver gevonden. De IANA-WHOIS-respons wordt weergegeven.",
      whoisNoteRdap:
        "WHOIS was niet beschikbaar. In plaats daarvan worden RDAP-registratiegegevens weergegeven.",
      commandTriggerLabel: "Zoeken…",
      commandPlaceholder: "Zoek gereedschap of voer een IP, domein of ASN in…",
      commandGroupActions: "Acties",
      commandGroupPages: "Ga naar",
      commandEmpty: "Geen overeenkomende gereedschappen of acties.",
      commandHintNavigate: "Navigeren",
      commandHintSelect: "Openen",
      commandHintClose: "Sluiten",
      notFoundTitle: "Pagina niet gevonden",
      notFoundDescription:
        "Dit adres hoort bij geen enkel gereedschap. Ga terug naar de startpagina of gebruik het zoekveld (Ctrl+K).",
      notFoundBackHome: "Terug naar de startpagina",
      errorTitle: "Er is iets misgegaan",
      errorDescription:
        "Deze pagina kon niet worden geladen. Probeer het opnieuw; als het probleem aanhoudt, ligt de oorzaak aan onze kant.",
      errorRetry: "Opnieuw proberen",
      asnRpkiValid: "RPKI geldig",
      asnRpkiInvalid: "RPKI ongeldig",
      asnRpkiStatus: "RPKI {status}",
      cdnConfidenceHigh: "Hoog",
      cdnConfidenceMedium: "Gemiddeld",
      cdnConfidenceLow: "Laag",
      pingTabLabel: "Pingtester",
      dnsTabLabel: "DNS-zoekopdracht",
      whoisTabLabel: "WHOIS-zoekopdracht",
      cdnTabLabel: "CDN-controle",
      asnTabLabel: "ASN-zoekopdracht",
      reputationTabLabel: "IP-reputatie",
      pingTitle: "Ping- en poorttester",
      pingSubtitle:
        "Begeleide controles van TCP/UDP-poorten, EB-eindpunten en databaseconnectiviteit in een overzichtelijke teststroom.",
      dnsTitle: "DNS-zoekopdracht",
      dnsSubtitle:
        "Voer een DNS-zoekopdracht uit naar records (A, AAAA, CNAME, MX, NS, TXT, SOA, SRV, CAA) voor domeinen en een omgekeerde DNS-zoekopdracht voor IP-adressen.",
      whoisTitle: "WHOIS-zoekopdracht",
      whoisSubtitle:
        "Voer rechtstreeks vanuit deze app een WHOIS-zoekopdracht uit naar domeinen en IP-adressen.",
      cdnTitle: "CDN-gebruikscontrole",
      cdnSubtitle:
        "Analyseer een willekeurig domein op CDN-gebruik en de waarschijnlijke provider (onder meer CloudFront, Google Cloud CDN, Azure CDN, Vercel en andere).",
      asnTitle: "ASN-informatie",
      asnSubtitle:
        "Zoek autonome systemen op met IPinfo-ASN-gegevens en openbare PeeringDB-gegevens over onderlinge verbindingen.",
      asnPlaceholder: "AS8881 of 8881",
      asnLookupButton: "ASN opzoeken",
      asnLookingUp: "Bezig met opzoeken…",
      asnInvalidInput:
        "Gebruik een ASN met de prefix AS of een numerieke ASN, bijvoorbeeld AS8881 of 8881.",
      asnInvalidRange: "De ASN moet tussen 1 en {max} liggen.",
      asnNetworkError:
        "Netwerkfout tijdens het contact met de ASN-zoekopdracht.",
      asnUpstreamError:
        "De ASN-gegevensproviders zijn momenteel niet beschikbaar.",
      asnRateLimitError:
        "Te veel ASN-zoekopdrachten. Wacht even voordat je het opnieuw probeert.",
      asnEmptyTitle: "Voer een ASN in om een netwerkprofiel te bekijken",
      asnEmptyDescription:
        "Gebruik een invoer met de prefix AS of een numerieke invoer. Providergegevens kunnen gedeeltelijk zijn, afhankelijk van openbare records en het geconfigureerde IPinfo-plan.",
      dnsEmptyTitle: "Voer een domein in om de DNS-records op te lossen",
      dnsEmptyDescription:
        "Zoek A-, AAAA-, MX-, TXT-, NS-, SOA-, SRV- en CAA-records op, of voer een omgekeerde zoekopdracht uit op een IP-adres.",
      whoisEmptyTitle: "Voer een domein of IP-adres in om WHOIS op te zoeken",
      whoisEmptyDescription:
        "Haal de registrar, registratiedata, status en nameservers op bij de verantwoordelijke WHOIS-server.",
      cdnEmptyTitle: "Voer een domein in om de CDN te detecteren",
      cdnEmptyDescription:
        "Bekijk DNS, CNAME-ketens en antwoordheaders om de CDN of edge-provider vóór de site te identificeren.",
      asnNotFoundTitle: "Geen ASN-profiel gevonden",
      asnNotFoundDescription:
        "De ASN is geldig, maar geen enkele geconfigureerde bron gaf een bruikbaar openbaar profiel terug.",
      asnPartialData: "Gedeeltelijke gegevens",
      asnCompleteData: "Volledig",
      asnPrefixes: "Aangekondigde voorvoegsels",
      asnRouting: "Routeringsrelaties",
      asnPeeringDb: "PeeringDB-profiel",
      asnIxPresence: "Aanwezigheid op IX’en",
      asnFacilities: "Aanwezigheid in datacenters en colocaties",
      asnSourceDiagnostics: "Brondiagnostiek",
      asnDetailedDiagnostics: "Gedetailleerde diagnostiek",
      asnUnnamed: "Naamloos AS",
      asnRoutingDescription:
        "Onderlinge verbindingen, buren en padgewichten van het autonome systeem. Hogere gewichten geven vaker waargenomen routeringspaden aan.",
      asnIxDescription:
        "Internet exchange punten (IX) waar dit autonome systeem aanwezig is, inclusief de bandbreedte voor onderlinge verbindingen.",
      asnPrefixesDescription:
        "IP-netblokken die dit autonome systeem in de globale routeringstabel aankondigt.",
      asnPeeringDbDescription:
        "Profiel van onderlinge verbindingen en routeringsbeleid dat in de openbare PeeringDB-database is vermeld.",
      asnFacilitiesDescription:
        "Fysieke datacenters en colocatielocaties waar dit netwerk aanwezig is.",
      asnProfileIdentityHeading: "Identiteit en status",
      asnProfileInterconnectionHeading: "Details van onderlinge verbindingen",
      asnProfilePolicyHeading: "Peeringbeleid",
      asnProfileExternalHeading: "Externe profielen",
      asnProfilePrefixes4: "IPv4-voorvoegsels",
      asnProfilePrefixes6: "IPv6-voorvoegsels",
      asnWarnings: "Waarschuwingen",
      asnDiagnosticDuration: "Duur",
      asnDiagnosticCache: "Cache",
      asnDiagnosticWarnings: "Waarschuwingen",
      asnDiagnosticSource: "Bron",
      asnSourceDiagnosticsDescription:
        "Beschikbaarheid van providers, duur van het verzoek en cachestatus bij deze zoekopdracht.",
      asnCacheMiss: "niet in cache",
      asnCacheFresh: "vers",
      asnCacheStale: "verouderd",
      asnCacheNotConfigured: "niet geconfigureerd",
      asnNoPrefixes:
        "De geconfigureerde bronnen hebben geen voorvoegsels teruggegeven.",
      asnNoRelations:
        "De geconfigureerde bronnen hebben geen routeringsrelaties teruggegeven.",
      asnMetricIpv4Addresses: "IPv4-adressen",
      asnMetricRoutingNeighbours: "Routeringsburen",
      asnMetricIxPresence: "Aanwezigheid op IX’en",
      asnPrefixIpCount: "IP’s",
      asnRelationPeers: "Peers",
      asnRelationUpstreams: "Upstreams",
      asnRelationDownstreams: "Downstreams",
      asnRelationPower: "gewicht",
      asnSourceAvailable: "beschikbaar",
      asnSourceUnavailable: "niet beschikbaar",
      asnSourceNotConfigured: "niet geconfigureerd",
      asnSourceError: "fout",
      asnLabelName: "Naam",
      asnLabelCountry: "Land",
      asnLabelAllocated: "Toegewezen",
      asnLabelNetworkId: "Netwerk-ID",
      asnLabelAlsoKnownAs: "Ook bekend als",
      asnLabelWebsite: "Website",
      asnLabelLookingGlass: "Looking Glass",
      asnLabelRouteServer: "Routingserver",
      asnLabelTraffic: "Verkeer",
      asnLabelPolicyGeneral: "Beleid algemeen",
      asnLabelPolicyLocations: "Beleidslocaties",
      asnLabelPolicyRatio: "Beleidsverhouding",
      asnLabelPolicyContracts: "Beleidscontracten",
      asnLabelStatus: "Status",
      asnLabelExchange: "Exchange",
      asnLabelSpeed: "Snelheid",
      asnLabelIpv4: "IPv4",
      asnLabelIpv6: "IPv6",
      asnLabelRsPeer: "RS-peer",
      asnLabelFacility: "Locatie",
      asnLabelCity: "Stad",
      asnLabelLocalAsn: "Lokale ASN",
      asnSortTable: "Sorteerbare tabel",
      asnSortBy: "Sorteren op {column}",
      asnSortNotSorted: "niet gesorteerd",
      asnSortAscending: "oplopend",
      asnSortDescending: "aflopend",
      asnBooleanYes: "ja",
      asnBooleanNo: "nee",
      asnSpeedMbps: "Mbit/s",
      asnSpeedGbps: "Gbit/s",
      asnSpeedTbps: "Tbit/s",
      asnNoIxLanRecords: "Geen IX-LAN-records teruggegeven.",
      asnNoFacilityRecords: "Geen locatierecords teruggegeven.",
      asnWarningIpinfoUnavailable:
        "IPinfo-ASN-gegevens zijn niet beschikbaar voor deze ASN of dit tokenplan.",
      asnWarningIpinfoUnexpected:
        "IPinfo gaf een onverwacht ASN-antwoord terug.",
      asnWarningNoRipeStatData:
        "Er zijn geen RIPEstat-ASN-gegevens gevonden voor deze ASN.",
      asnWarningNoPeeringDbProfile:
        "Er is geen openbaar PeeringDB-netwerkprofiel gevonden voor deze ASN.",
      asnWarningProviderHttp: "{provider} gaf HTTP {status} terug.",
      asnWarningProviderTimedOut:
        "Het verzoek aan {provider} heeft een time-out gekregen.",
      asnWarningProviderTooLarge:
        "Het antwoord van {provider} overschreed de limiet voor de bestandsgrootte.",
      asnWarningProviderInvalidJson: "{provider} gaf ongeldige JSON terug.",
      asnWarningProviderUnavailable:
        "De gegevens van {provider} zijn momenteel niet beschikbaar.",
      asnWarningProviderStale:
        "De gegevens van {provider} zijn momenteel niet beschikbaar; er wordt verouderde cachedata gebruikt.",
      asnWarningTruncated:
        "{label} is ingekort tot {limit} van {total} records.",
      asnWarningLabelIpinfoIpv4Prefixes: "IPinfo-IPv4-voorvoegsels",
      asnWarningLabelIpinfoIpv6Prefixes: "IPinfo-IPv6-voorvoegsels",
      asnWarningLabelIpinfoPeers: "IPinfo-peers",
      asnWarningLabelIpinfoUpstreams: "IPinfo-upstreams",
      asnWarningLabelIpinfoDownstreams: "IPinfo-downstreams",
      asnWarningLabelPeeringDbIxLan: "PeeringDB IX-LAN-records",
      asnWarningLabelPeeringDbFacilities: "PeeringDB-locaties",
      asnWarningLabelRipeStatIpv4Prefixes: "RIPEstat-IPv4-voorvoegsels",
      asnWarningLabelRipeStatIpv6Prefixes: "RIPEstat-IPv6-voorvoegsels",
      asnWarningLabelRipeStatRoutingNeighbours: "RIPEstat-routeringsburen",
      asnWarningLabelRipeStatUpstreamNeighbours: "RIPEstat-upstreamburen",
      asnWarningLabelRipeStatDownstreamNeighbours: "RIPEstat-downstreamburen",
      asnTabRouting: "Routering",
      asnTabPrefixes: "Voorvoegsels",
      asnTabPeering: "Peering",
      asnTabSources: "Bronnen",
      asnDetailNavLabel: "ASN-details",
      asnIdentityEyebrow: "Autonome systeem",
      asnCopyAsn: "ASN kopiëren",
      asnLabelType: "Type",
      asnLabelRegistry: "Registry",
      asnLabelDomain: "Domein",
      asnNetworkTypes: {
        isp: "ISP",
        hosting: "Hosting",
        business: "Bedrijf",
        education: "Onderwijs",
        government: "Overheid",
        inactive: "Inactief",
      },
      asnSourcesLabel: "Bronnen",
      asnMetricIpv4Equivalent: "≈ /{bits}-equivalent",
      asnMetricRequiresIpinfo: "Vereist IPinfo",
      asnMetricNotReported: "Niet gemeld",
      asnMetricNoPeeringDb: "Geen PeeringDB-profiel",
      asnFacilityCount: { one: "{count} locatie", other: "{count} locaties" },
      asnExchangeCount: { one: "{count} exchange", other: "{count} exchanges" },
      asnConnectionCount: {
        one: "{count} verbinding",
        other: "{count} verbindingen",
      },
      asnShowMore: "Nog {count} meer tonen",
      asnListedOfTotal: "{shown} van {total} vermeld",
      asnNoneReported: "Niets gemeld",
      asnRelationV4Peers: "IPv4-peers",
      asnRelationV6Peers: "IPv6-peers",
      asnRelationObservedVia:
        "Gewicht en aantal peers waargenomen via {source}.",
      asnRpkiLabel: "RPKI",
      asnRpkiValidShort: "Geldig",
      asnRpkiInvalidShort: "Ongeldig",
      asnLabelExchanges: "Exchanges",
      asnLabelFacilities: "Locaties",
      asnLabelPeeringDbRecord: "PeeringDB-record",
      asnViewOnPeeringDb: "Bekijk {name} op PeeringDB",
      asnIxNotOperational: "Niet operationeel",
      asnSortLabel: "Sorteren",
      asnSortDefault: "Volgorde van de provider",
      asnSameAsn: "Dezelfde ASN als deze",
      asnExamplesLabel: "Proberen",
      asnLabelPolicy: "Beleid",
      asnCountryCount: { one: "in {count} land", other: "in {count} landen" },
      targetPlaceholder: "example.com",
      lookupInProgress: "Bezig met opzoeken…",
      dnsLookupButton: "DNS opzoeken",
      dnsLookupError: "DNS-zoekopdracht mislukt.",
      dnsRecordsFor: "DNS-records voor",
      resolvedAddresses: "Opgeloste adressen",
      noAddressResult: "Geen A/AAAA-resultaat.",
      recordDetails: "Recorddetails",
      dnsRecordNotes: "Opmerkingen bij de recordzoekopdracht",
      dnsTableType: "Type",
      dnsTableValue: "Waarde",
      dnsShowRaw: "Ruwe JSON tonen",
      dnsHideRaw: "Ruwe JSON verbergen",
      dnsNoRecords:
        "Er zijn geen records van het geselecteerde type teruggegeven.",
      whoisPlaceholder: "example.com of 8.8.8.8",
      whoisLookupButton: "WHOIS opzoeken",
      whoisLookupError: "WHOIS-zoekopdracht mislukt.",
      whoisFor: "WHOIS voor",
      queriedServer: "Geraadpleegde server",
      referralSource: "Verwijzingsbron",
      noWhoisData: "Er zijn geen WHOIS-gegevens teruggegeven.",
      whoisRegistrar: "Registrar",
      whoisCreated: "Aangemaakt",
      whoisUpdated: "Bijgewerkt",
      whoisExpires: "Verloopt",
      whoisStatusLabel: "Status",
      whoisNameservers: "Nameservers",
      whoisShowRaw: "Ruwe uitvoer tonen",
      whoisHideRaw: "Ruwe uitvoer verbergen",
      pingTestMode: "Testmodus",
      pingModeHelperTcp:
        "Controleert of de TCP-poort een verbinding accepteert.",
      pingModeHelperUdp:
        "Stuurt een UDP-sonde en meldt direct het reactie- of foutgedrag.",
      pingModeHelperEb:
        "Controleert eerst TCP en daarna de bereikbaarheid van een HTTP/HTTPS-eindpunt.",
      pingModeHelperDatabase:
        "Voert protocolcontroles voorafgaand aan authenticatie uit en optionele geauthenticeerde controles.",
      pingModeDatabase: "Database",
      pingDatabaseType: "Databasetype",
      pingTargetHost: "Doelhost / IP",
      pingPort: "Poort",
      pingTimeout: "Time-out (ms)",
      pingUseAuth: "Controleren met authenticatie",
      pingUsername: "Gebruikersnaam",
      pingPassword: "Wachtwoord",
      pingDatabaseOptional: "Database (optioneel)",
      pingRunButton: "Pingtest uitvoeren",
      pingRunning: "Controle bezig…",
      pingNetworkError: "Netwerkfout tijdens het contact met /api/ping.",
      pingModeLabel: "Modus",
      pingLatencyLabel: "Latentie",
      pingTargetLabel: "Doel",
      pingDetailsLabel: "Details",
      pingEmptyTitle: "Nog geen test uitgevoerd",
      pingEmptyDescription:
        "Kies een testmodus, voer een host en poort in en voer de controle uit om de bereikbaarheid en latentie te meten.",
      pingStatusSuccess: "Doel bereikbaar",
      pingStatusFailed: "Controle mislukt",
      pingShowDetails: "Technische details tonen",
      pingHideDetails: "Technische details verbergen",
      pingResultTcpOk: "TCP-verbinding tot stand gebracht.",
      pingResultTcpTimeout: "TCP-time-out na {timeoutMs} ms.",
      pingResultTcpFailed: "TCP-verbinding mislukt: {error}",
      pingResultUdpSent:
        "UDP-pakket verzonden. Geen ICMP-fout waargenomen binnen {timeoutMs} ms.",
      pingResultUdpResponse:
        "UDP-respons ontvangen van {from} ({bytes} bytes).",
      pingResultUdpFailed: "UDP-sonde mislukt: {error}",
      pingResultEbHttpOk: "Eindpunt bereikbaar via {scheme} (status {status}).",
      pingResultEbNoHttp:
        "TCP is open, maar er is geen HTTP(S)-respons op dit eindpunt waargenomen.",
      pingResultEbTcpFailed: "EB-controle mislukt tijdens de TCP-fase: {error}",
      pingResultDbConnectFailed: "Verbinding met {database} mislukt: {error}",
      pingResultDbProtocolOk:
        "De {database}-server reageerde op een protocolsonde vóór authenticatie.",
      pingResultDbProtocolFailed: "Sonde voor {database} mislukt: {error}",
      pingResultDbTcpOk:
        "De TCP-poort van {database} is bereikbaar. Voor dit type is er geen protocolsonde vóór authenticatie.",
      pingResultDbAuthUnsupported:
        "Geauthenticeerde controles zijn alleen voor Redis geïmplementeerd. Gebruik de protocolcontrole voor {database}.",
      pingResultDbAuthOk: "Geauthenticeerde Redis-verbinding geslaagd.",
      pingResultDbAuthFailed: "Redis-authenticatiecontrole mislukt: {error}",
      cdnAnalyzeButton: "CDN controleren",
      cdnAnalyzing: "Bezig met analyseren…",
      cdnNetworkError: "Netwerkfout tijdens het contact met de CDN-controle.",
      cdnSummaryUnreachable: "Doel onbereikbaar",
      cdnSummaryNoMatch: "Geen betrouwbare CDN-overeenkomst",
      cdnSummaryDetected: "CDN gedetecteerd",
      cdnConfidenceNa: "n.v.t.",
      cdnNoProviderMatch: "Geen provider gevonden — opgeloste IP’s",
      cdnInspectIpsHint:
        "Je kunt deze IP’s bekijken op de pagina IP-zoekopdracht:",
      cdnTargetLabel: "Doel",
      cdnHttpStatusLabel: "HTTP-status",
      cdnProviderLabel: "Provider",
      cdnUnknown: "Onbekend",
      cdnMatchedSignals: "Overeenkomende signalen",
      cdnNoSignals: "Er is geen expliciet CDN-signaal gevonden.",
      cdnCnameChain: "CNAME-keten",
      cdnNoCname: "Er zijn geen CNAME-records gevonden.",
      cdnInterestingHeaders: "Interessante antwoordheaders",
      cdnNoHeaders: "Er zijn geen relevante headers gevonden.",
      reputationTitle: "IP-reputatiecontrole",
      reputationSubtitle:
        "Controleer een openbaar IP-adres tegen onafhankelijke bronnen voor reputatie en informatie over dreigingen en ontvang een op bewijs gebaseerde risicobeoordeling.",
      reputationPlaceholder: "8.8.8.8 of 2001:4860:4860::8888",
      reputationCheckButton: "Reputatie controleren",
      reputationChecking: "Bezig met controleren…",
      reputationNetworkError:
        "Netwerkfout tijdens het contact met de reputatiecontrole.",
      reputationRateLimitError:
        "Te veel reputatiecontroles. Wacht even voordat je het opnieuw probeert.",
      reputationInvalidIp:
        "Voer een geldig openbaar IP-adres in (IPv4 of IPv6).",
      reputationBlockedIp:
        "Privé-, gereserveerde en interne IP-bereiden kunnen niet worden gecontroleerd.",
      reputationEmptyTitle:
        "Voer een IP-adres in om de reputatie ervan te controleren",
      reputationEmptyDescription:
        "Het IP-adres wordt gecontroleerd tegen DNS-blacklists, databases met misbruikmeldingen, botnet-C2-trackers en bronnen voor netwerkclassificatie. Optionele providers (AbuseIPDB, GreyNoise, http:BL, ThreatFox) worden geactiveerd wanneer een gratis API-sleutel is geconfigureerd.",
      reputationRiskLow: "Laag risico",
      reputationRiskMedium: "Gemiddeld risico",
      reputationRiskHigh: "Hoog risico",
      reputationHeadlineClean: "Geen kwaadwillige activiteit gedetecteerd",
      reputationScoreLabel: "Risicoscore",
      reputationSectionSummary: "Reputatie-overzicht",
      reputationSectionThreats: "Bewijs van dreiging",
      reputationSectionMail: "E-mailreputatie",
      reputationSectionNetwork: "Netwerkclassificatie",
      reputationSectionSources: "Bronnen",
      reputationSectionScore: "Hoe deze score is berekend",
      reputationCoverageChecked: "{count} bronnen gecontroleerd",
      reputationCoverageMatched: "{count} met bewijs van dreiging",
      reputationCoveragePolicy: "{count} met beleids- of contextinformatie",
      reputationCoverageUnavailable: "{count} niet beschikbaar",
      reputationGeneratedAt: "Gegenereerd {time}",
      reputationNoThreatEvidence:
        "In de bronnen die konden worden gecontroleerd, zijn geen directe kwaadwillige waarnemingen gevonden.",
      reputationNoMailEvidence:
        "In de gecontroleerde bronnen zijn geen vermeldingen voor e-mailreputatie gevonden.",
      reputationFilterAll: "Alle",
      reputationNoEvidence:
        "Er is geen bewijs in deze groep uit de bronnen die konden worden gecontroleerd.",
      reputationFactChecked: "Gecontroleerd",
      reputationFactMatched: "Met bewijs van dreiging",
      reputationFactUnavailable: "Niet beschikbaar",
      reputationFactCheckedAt: "Gecontroleerd op",
      reputationScoreCapped: "Beperkt vanaf {count} ruwe punten",
      reputationConnectionLabel: "Verbinding",
      reputationReverseLabel: "Omgekeerde DNS",
      reputationFieldSource: "Bron",
      reputationFieldConfidence: "Betrouwbaarheid",
      reputationFieldFirstSeen: "Eerst gezien",
      reputationFieldLastSeen: "Laatst gezien",
      reputationFieldReports: "Meldingen",
      reputationFieldAttacks: "Aanvalsgebeurtenissen",
      reputationFieldMalware: "Malware",
      reputationFieldDetail: "Detail",
      reputationFieldReturnCode: "Retourcode",
      reputationPointsLabel: "+{points} punten",
      reputationCategories: {
        mail_policy: "Vermelding in het e-mailbeleid",
        mail_reputation: "Vermelding in de e-mailreputatie",
        spam_observed: "Waargenomen spamactiviteit",
        abuse_reported: "Misbruik gemeld",
        scanner: "Internetbrede scanner",
        bruteforce: "Brute-force-aanvallen",
        web_attack: "Webaanvallen",
        ddos: "DDoS-/floodaanvallen",
        botnet: "Botnetactiviteit",
        malware: "Malware-infrastructuur",
        proxy: "Open proxy",
        vpn: "VPN / anonymizer",
        tor: "Tor-uitgangsknooppunt",
        hosting: "Hosting / datacentrum",
        residential: "Residentieel netwerk",
        mobile: "Mobiel netwerk",
        benign_service: "Bekende zakelijke dienst",
      },
      reputationSeverities: {
        info: "Informatie",
        low: "Lage ernst",
        medium: "Gemiddelde ernst",
        high: "Hoge ernst",
        critical: "Kritiek",
      },
      reputationSourceStates: {
        available: "beschikbaar",
        clean: "schoon",
        matched: "overeenkomst",
        policy_listed: "vermeld (beleid)",
        not_configured: "niet geconfigureerd",
        unsupported: "niet ondersteund",
        rate_limited: "snelheidsbeperkt",
        resolver_blocked: "resolver geblokkeerd",
        unavailable: "niet beschikbaar",
      },
      reputationReasons: {
        sbl: "Vermeld in de SBL van Spamhaus: geverifieerde spambronnen, spamservices of ROKSO-spammers (een op bewijs gebaseerde, door mensen onderhouden lijst).",
        css: "Vermeld in Spamhaus CSS: automatische detectie van e-mailverzending met een hoog volume of in het grijze gebied. Dit is zwakker bewijs dan SBL.",
        xbl: "Vermeld in de XBL van Spamhaus: de host is waargenomen met trojan- of exploitsoftware of als open proxy, meestal een gecompromitteerde machine.",
        drop: "Het adres valt in een DROP-netblok van Spamhaus: bereiken die door criminele organisaties of ‘bulletproof’-hosting worden beheerd en worden gebruikt voor malware, botnetcontrollers of spam.",
        pbl_isp:
          "Vermeld in de PBL van Spamhaus (beheerd door de ISP): dit bereik hoort geen SMTP-e-mail rechtstreeks aan servers van derden te leveren. Dit is normaal voor de meeste residentiële, dynamische en eindgebruikersadressen en is geen bewijs van misbruik.",
        pbl_spamhaus:
          "Vermeld in de PBL van Spamhaus (beheerd door Spamhaus): een beleidsbereik dat geen e-mail rechtstreeks hoort te leveren. Dit is normaal voor veel eindgebruikersadressen en is geen bewijs van misbruik.",
        bcl: "Vermeld in de Botnet Controller List van Spamhaus: bevestigde actieve infrastructuur voor commando en controle van botnets.",
        spamcop_listing:
          "Vermeld bij SpamCop op basis van recente spamrapporten (spamvallen en door gebruikers ingezonden bewijs). Vermeldingen vervallen kort na het laatste rapport.",
        barracuda_listing:
          "Slechte e-mailreputatie gemeten in het Barracuda-filternetwerk. Dit is een geaggregeerd en deels historisch signaal dat ook dynamisch her toegewezen adressen kan treffen; het bewijst niet dat dit adres nu spam verzendt.",
        dronebl_irc_drone:
          "Door het DroneBL-netwerk waargenomen als IRC-spamdrone (bot).",
        dronebl_bottler:
          "Door het DroneBL-netwerk waargenomen als Bottler-IRC-bot.",
        dronebl_worm:
          "Door het DroneBL-netwerk waargenomen terwijl het een worm of spambot uitvoerde.",
        dronebl_ddos_drone:
          "Waargenomen als DDoS-drone (neemt deel aan gedistributeerde aanvallen).",
        dronebl_open_socks_proxy:
          "Waargenomen terwijl het een open SOCKS-proxy uitvoerde: misbruikbare infrastructuur, op zichzelf niet noodzakelijk kwaadwillend.",
        dronebl_open_http_proxy:
          "Waargenomen terwijl het een open HTTP-proxy uitvoerde: misbruikbare infrastructuur, op zichzelf niet noodzakelijk kwaadwillend.",
        dronebl_proxychain: "Waargenomen als onderdeel van een proxyketen.",
        dronebl_web_proxy:
          "Waargenomen terwijl het een open webproxy uitvoerde.",
        dronebl_dictionary:
          "Waargenomen bij geautomatiseerde woordenboekaanvallen (brute force).",
        dronebl_wingate:
          "Waargenomen terwijl het een open WinGate-proxy uitvoerde.",
        dronebl_compromised_router:
          "Waargenomen als gecompromitteerde router of gateway.",
        dronebl_botnet_auto:
          "Door DroneBL automatisch ingedeeld als botnet-infrastructuur (experimentele detectie).",
        dronebl_compromised_host:
          "Mogelijk gecompromitteerde host op IRC gedetecteerd.",
        dronebl_uncategorized:
          "Vermeld bij DroneBL met een niet-gecategoriseerde dreigingsklasse.",
        bld_attack:
          "Aanvallen gemeld door getroffen serverbeheerders en verzameld door blocklist.de. Een actieve DNS-vermelding betekent dat er onlangs aanvallen zijn gemeld.",
        bld_counts_only:
          "Historische misbruikrapporten geregistreerd door blocklist.de; het adres staat momenteel niet in de actieve DNS-zone.",
        feodo_c2_online:
          "Momenteel actieve server voor commando en controle van botnets, geverifieerd door Feodo Tracker (abuse.ch) via een geldige C2-respons.",
        feodo_c2_offline:
          "Botnet-C2-server gevolgd door Feodo Tracker (abuse.ch); voor het laatst enkele dagen geleden gezien en in de blokkeringslijst behouden.",
        greynoise_scanner_malicious:
          "In de afgelopen 90 dagen waargenomen terwijl het internet scandeerde en door GreyNoise als kwaadwillend ingedeeld.",
        greynoise_scanner_unknown:
          "In de afgelopen 90 dagen waargenomen terwijl het internet scandeerde; GreyNoise kon de activiteit niet indelen.",
        greynoise_scanner_benign:
          "Waargenomen terwijl het internet scandeerde, maar door GreyNoise als goedaardig ingedeeld (bijvoorbeeld een onderzoeksproject).",
        greynoise_riot:
          "Bekende gangbare zakelijke dienst in de GreyNoise RIOT-dataset (bijvoorbeeld een CDN of een beveiligingsbedrijf).",
        abuseipdb_reports:
          "Misbruikrapporten van AbuseIPDB-gebruikers in de afgelopen 90 dagen. De betrouwbaarheidsscore weerspiegelt het aantal en de consistentie van de rapporten.",
        abuseipdb_tor:
          "Door AbuseIPDB geïdentificeerd als Tor-uitgangsknooppunt.",
        threatfox_ioc:
          "Gepubliceerd als dreigingsindicator (IOC) in de ThreatFox-database van abuse.ch, gedeeld door beveiligingsonderzoekers.",
        httpbl_search_engine: "Bekende zoekmachinecrawler (Project Honey Pot).",
        httpbl_suspicious:
          "Verdachte webbezoeker waargenomen in het honeypotnetwerk van Project Honey Pot. Vaak onschadelijke robots; wees voorzichtig.",
        httpbl_harvester:
          "Waargenomen terwijl het e-mailadressen verzamelde uit honeypots in het Project Honey Pot-netwerk.",
        httpbl_comment_spammer:
          "Waargenomen terwijl het commentspam plaatste op honeypots in het Project Honey Pot-netwerk.",
        ipapi_vpn:
          "Door ip-api.com gemarkeerd als VPN-, proxy- of anonimiseringsdienst.",
        ipapi_hosting:
          "Door ip-api.com gemarkeerd als hosting- of datacenteradres.",
        ipapi_mobile:
          "Door ip-api.com geïdentificeerd als mobiele of cellulaire verbinding.",
        residential_estimate:
          "Geschatte residentiële verbinding op basis van het verbindingstype en de naamgeving van omgekeerde DNS — een heuristiek, geen bevestiging door de provider.",
        corroboration:
          "Diverse onafhankelijke bronnen melden kwaadwillige activiteit voor dit adres.",
        mail_corroboration:
          "Diverse onafhankelijke lijsten voor e-mailreputatie bevatten dit adres.",
      },
      reputationSourceDescriptions: {
        "spamhaus-zen":
          "Gecombineerde Spamhaus-DNSBL: SBL (geverifieerde spambronnen), CSS (automatische detectie van spamaflezers), XBL (uitgebuite hosts), PBL (beleidsbereiken voor e-mail) en BCL (botnetcontrollers).",
        "spamhaus-drop":
          "Gratis Spamhaus-feed met volledige netblokken die door criminele organisaties of ‘bulletproof’-hosts worden beheerd. Lokaal gecontroleerd vanuit een cache die elk uur wordt vernieuwd.",
        spamcop:
          "E-mailblokkeringslijst opgebouwd uit spamvallen en spamrapporten van gebruikers. Vermeldingen zijn kortlevend en weerspiegelen recent verzendgedrag.",
        barracuda:
          "E-mailreputatiescores gemeten in het spamfilternetwerk van Barracuda Networks. Een geaggregeerd en deels historisch signaal.",
        dronebl:
          "DNSBL van het DroneBL-project met drones, gecompromitteerde hosts, DDoS-deelnemers en open proxies die via IRC- en monitoringsnetwerken zijn waargenomen. Gratis voor commercieel en niet-commercieel gebruik.",
        "blocklist-de":
          "Duits platform voor misbruikmeldingen dat aanvallen (SSH-brute force, e-mailaanvallen, webscans, ...) van getroffen serverbeheerders verzamelt.",
        "feodo-tracker":
          "abuse.ch-tracker voor botnet-C2-servers (Dridex, Emotet, TrickBot, QakBot, BazarLoader). Vermeldingen vereisen een waargenomen geldige C2-respons. Lokaal gecontroleerd vanuit een cachefeed.",
        greynoise:
          "Informatie over internetbrede scanners. De community-API meldt of een adres onlangs is waargenomen bij het scannen en hoe het is ingedeeld.",
        abuseipdb:
          "Door de community opgebouwde database met misbruikmeldingen en een betrouwbaarheidsscore. Vereist een gratis API-sleutel (ABUSEIPDB_API_KEY).",
        httpbl:
          "Project Honey Pot DNSBL voor webmisbruik: adresverzamelaars, commentspammers en verdachte bots. Vereist een gratis toegangssleutel (HTTPBL_ACCESS_KEY).",
        threatfox:
          "abuse.ch-platform voor het delen van indicatoren van compromittering, waaronder botnet-C2-adressen. Vereist een gratis Auth-Key (THREATFOX_AUTH_KEY).",
        "ip-api":
          "IP-metadata: geolocatie, netwerk/ASN en classificatievlaggen voor verbindingen.",
      },
      reputationGeoLabel: "Geolocatie",
      reputationNetworkLabel: "ASN / Provider",
      reputationShowHiddenSources:
        "Niet-geconfigureerde bronnen tonen ({count})",
      reputationHideHiddenSources: "Niet-geconfigureerde bronnen verbergen",
    },
  };
