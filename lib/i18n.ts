export const SUPPORTED_LOCALES = [
  "de",
  "en",
  "es",
  "fr",
  "pt-BR",
  "ja",
  "ru",
  "zh-CN",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_ALIASES: Record<string, Locale> = {
  "de-at": "de",
  "de-ch": "de",
  "de-de": "de",
  "en-gb": "en",
  "en-us": "en",
  "es-es": "es",
  "es-mx": "es",
  "fr-ca": "fr",
  "fr-fr": "fr",
  "ja-jp": "ja",
  pt: "pt-BR",
  "pt-pt": "pt-BR",
  "pt-br": "pt-BR",
  "ru-ru": "ru",
  zh: "zh-CN",
  "zh-hans": "zh-CN",
  "zh-hk": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-tw": "zh-CN",
};

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function resolveLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return "en";

  const preferredLocales = acceptLanguage
    .split(",")
    .map((entry) => entry.trim().split(";")[0])
    .filter(Boolean);

  for (const locale of preferredLocales) {
    if (SUPPORTED_LOCALE_SET.has(locale)) {
      return locale as Locale;
    }

    const normalizedLocale = locale.toLowerCase();
    const aliasedLocale = LOCALE_ALIASES[normalizedLocale];
    if (aliasedLocale) {
      return aliasedLocale;
    }

    const baseLocale = normalizedLocale.split("-")[0];
    if (baseLocale && SUPPORTED_LOCALE_SET.has(baseLocale)) {
      return baseLocale as Locale;
    }

    const aliasedBaseLocale = baseLocale ? LOCALE_ALIASES[baseLocale] : null;
    if (aliasedBaseLocale) {
      return aliasedBaseLocale;
    }
  }

  return "en";
}

export type Translation = {
  appName: string;
  navHome: string;
  navCheck: string;
  homeTitle: string;
  homeSubtitle: string;
  checkTitle: string;
  checkSubtitle: string;
  queryOtherIp: string;
  backToOwnIp: string;
  footerDataBy: string;
  copyIpLabel: string;
  ipInfoError: string;
  queriedIpAddress: string;
  yourIpAddresses: string;
  notAvailable: string;
  detectedConnectionType: string;
  ipv4Status: string;
  ipv6Status: string;
  available: string;
  notDetected: string;
  active: string;
  inactive: string;
  location: string;
  country: string;
  timezone: string;
  timezoneDetail: string;
  isp: string;
  ispDetail: string;
  organization: string;
  organizationDetail: string;
  asNumber: string;
  asFallbackDetail: string;
  coordinates: string;
  coordinatesDetail: string;
  region: string;
  postalCode: string;
  postalCodeDetail: string;
  searchPlaceholder: string;
  searchButton: string;
  mobileFlag: string;
  proxyFlag: string;
  hostingFlag: string;
  unknown: string;
  connectionDsl: string;
  detected: string;
};

export const translations: Record<Locale, Translation> = {
  de: {
    appName: "IP Info",
    navHome: "Meine IP",
    navCheck: "IP Abfrage",
    homeTitle: "IP Auskunft",
    homeSubtitle: "Deine öffentliche IP und Netzwerk-Details auf einen Blick",
    checkTitle: "IP Abfrage",
    checkSubtitle: "Beliebige IP-Adresse oder Domain nachschlagen",
    queryOtherIp: "Andere IP-Adresse abfragen",
    backToOwnIp: "Zurück zur eigenen IP",
    footerDataBy: "Daten bereitgestellt von",
    copyIpLabel: "IP-Adresse kopieren",
    ipInfoError: "IP-Informationen konnten nicht abgerufen werden.",
    queriedIpAddress: "Abgefragte IP-Adresse",
    yourIpAddresses: "Deine IP-Adressen",
    notAvailable: "Nicht verfügbar",
    detectedConnectionType: "Erkannter Verbindungstyp",
    ipv4Status: "IPv4 Status",
    ipv6Status: "IPv6 Status",
    available: "Verfügbar",
    notDetected: "Nicht erkannt",
    active: "Aktiv",
    inactive: "Inaktiv",
    location: "Standort",
    country: "Land",
    timezone: "Zeitzone",
    timezoneDetail: "IANA Zeitzone",
    isp: "Anbieter (ISP)",
    ispDetail: "Internetdienstanbieter",
    organization: "Organisation",
    organizationDetail: "Netzwerk-Organisation",
    asNumber: "AS-Nummer",
    asFallbackDetail: "Autonomes System",
    coordinates: "Koordinaten",
    coordinatesDetail: "Breitengrad, Längengrad",
    region: "Region",
    postalCode: "Postleitzahl",
    postalCodeDetail: "PLZ",
    searchPlaceholder: "IPv4, IPv6 oder Domain eingeben...",
    searchButton: "Abfragen",
    mobileFlag: "Mobilfunk",
    proxyFlag: "Proxy/VPN",
    hostingFlag: "Hosting",
    unknown: "Unbekannt",
    connectionDsl: "Festnetz (DSL)",
    detected: "Erkannt",
  },
  en: {
    appName: "IP Info",
    navHome: "My IP",
    navCheck: "IP Lookup",
    homeTitle: "IP Info",
    homeSubtitle: "Your public IP and network details at a glance",
    checkTitle: "IP Lookup",
    checkSubtitle: "Look up any IP address or domain",
    queryOtherIp: "Query another IP address",
    backToOwnIp: "Back to your own IP",
    footerDataBy: "Data provided by",
    copyIpLabel: "Copy IP address",
    ipInfoError: "Could not retrieve IP information.",
    queriedIpAddress: "Queried IP address",
    yourIpAddresses: "Your IP addresses",
    notAvailable: "Not available",
    detectedConnectionType: "Detected connection type",
    ipv4Status: "IPv4 status",
    ipv6Status: "IPv6 status",
    available: "Available",
    notDetected: "Not detected",
    active: "Active",
    inactive: "Inactive",
    location: "Location",
    country: "Country",
    timezone: "Timezone",
    timezoneDetail: "IANA timezone",
    isp: "Provider (ISP)",
    ispDetail: "Internet service provider",
    organization: "Organization",
    organizationDetail: "Network organization",
    asNumber: "AS number",
    asFallbackDetail: "Autonomous system",
    coordinates: "Coordinates",
    coordinatesDetail: "Latitude, Longitude",
    region: "Region",
    postalCode: "Postal code",
    postalCodeDetail: "ZIP / postal",
    searchPlaceholder: "Enter IPv4, IPv6, or domain...",
    searchButton: "Lookup",
    mobileFlag: "Mobile",
    proxyFlag: "Proxy/VPN",
    hostingFlag: "Hosting",
    unknown: "Unknown",
    connectionDsl: "Wired (DSL)",
    detected: "Detected",
  },
  es: {
    appName: "IP Info",
    navHome: "Mi IP",
    navCheck: "Consulta IP",
    homeTitle: "Información IP",
    homeSubtitle: "Tu IP pública y detalles de red de un vistazo",
    checkTitle: "Consulta IP",
    checkSubtitle: "Busca cualquier dirección IP o dominio",
    queryOtherIp: "Consultar otra dirección IP",
    backToOwnIp: "Volver a tu propia IP",
    footerDataBy: "Datos proporcionados por",
    copyIpLabel: "Copiar dirección IP",
    ipInfoError: "No se pudo obtener la información de IP.",
    queriedIpAddress: "Dirección IP consultada",
    yourIpAddresses: "Tus direcciones IP",
    notAvailable: "No disponible",
    detectedConnectionType: "Tipo de conexión detectado",
    ipv4Status: "Estado IPv4",
    ipv6Status: "Estado IPv6",
    available: "Disponible",
    notDetected: "No detectado",
    active: "Activo",
    inactive: "Inactivo",
    location: "Ubicación",
    country: "País",
    timezone: "Zona horaria",
    timezoneDetail: "Zona horaria IANA",
    isp: "Proveedor (ISP)",
    ispDetail: "Proveedor de internet",
    organization: "Organización",
    organizationDetail: "Organización de red",
    asNumber: "Número AS",
    asFallbackDetail: "Sistema autónomo",
    coordinates: "Coordenadas",
    coordinatesDetail: "Latitud, Longitud",
    region: "Región",
    postalCode: "Código postal",
    postalCodeDetail: "CP",
    searchPlaceholder: "Ingresa IPv4, IPv6 o dominio...",
    searchButton: "Consultar",
    mobileFlag: "Móvil",
    proxyFlag: "Proxy/VPN",
    hostingFlag: "Hosting",
    unknown: "Desconocido",
    connectionDsl: "Fijo (DSL)",
    detected: "Detectado",
  },
  fr: {
    appName: "IP Info",
    navHome: "Mon IP",
    navCheck: "Recherche IP",
    homeTitle: "Infos IP",
    homeSubtitle: "Votre IP publique et les détails réseau en un coup d'œil",
    checkTitle: "Recherche IP",
    checkSubtitle: "Rechercher n'importe quelle adresse IP ou domaine",
    queryOtherIp: "Rechercher une autre adresse IP",
    backToOwnIp: "Retour à votre IP",
    footerDataBy: "Données fournies par",
    copyIpLabel: "Copier l'adresse IP",
    ipInfoError: "Impossible de récupérer les informations IP.",
    queriedIpAddress: "Adresse IP recherchée",
    yourIpAddresses: "Vos adresses IP",
    notAvailable: "Non disponible",
    detectedConnectionType: "Type de connexion détecté",
    ipv4Status: "Statut IPv4",
    ipv6Status: "Statut IPv6",
    available: "Disponible",
    notDetected: "Non détecté",
    active: "Actif",
    inactive: "Inactif",
    location: "Localisation",
    country: "Pays",
    timezone: "Fuseau horaire",
    timezoneDetail: "Fuseau horaire IANA",
    isp: "Fournisseur (ISP)",
    ispDetail: "Fournisseur d'accès internet",
    organization: "Organisation",
    organizationDetail: "Organisation réseau",
    asNumber: "Numéro AS",
    asFallbackDetail: "Système autonome",
    coordinates: "Coordonnées",
    coordinatesDetail: "Latitude, Longitude",
    region: "Région",
    postalCode: "Code postal",
    postalCodeDetail: "CP",
    searchPlaceholder: "Saisissez IPv4, IPv6 ou un domaine...",
    searchButton: "Rechercher",
    mobileFlag: "Mobile",
    proxyFlag: "Proxy/VPN",
    hostingFlag: "Hébergement",
    unknown: "Inconnu",
    connectionDsl: "Filaire (DSL)",
    detected: "Détecté",
  },
  "pt-BR": {
    appName: "IP Info",
    navHome: "Meu IP",
    navCheck: "Consulta IP",
    homeTitle: "Informações de IP",
    homeSubtitle: "Seu IP público e detalhes da rede rapidamente",
    checkTitle: "Consulta de IP",
    checkSubtitle: "Pesquise qualquer endereço IP ou domínio",
    queryOtherIp: "Consultar outro endereço IP",
    backToOwnIp: "Voltar para seu IP",
    footerDataBy: "Dados fornecidos por",
    copyIpLabel: "Copiar endereço IP",
    ipInfoError: "Não foi possível obter as informações de IP.",
    queriedIpAddress: "Endereço IP consultado",
    yourIpAddresses: "Seus endereços IP",
    notAvailable: "Não disponível",
    detectedConnectionType: "Tipo de conexão detectado",
    ipv4Status: "Status IPv4",
    ipv6Status: "Status IPv6",
    available: "Disponível",
    notDetected: "Não detectado",
    active: "Ativo",
    inactive: "Inativo",
    location: "Localização",
    country: "País",
    timezone: "Fuso horário",
    timezoneDetail: "Fuso horário IANA",
    isp: "Provedor (ISP)",
    ispDetail: "Provedor de internet",
    organization: "Organização",
    organizationDetail: "Organização de rede",
    asNumber: "Número AS",
    asFallbackDetail: "Sistema autônomo",
    coordinates: "Coordenadas",
    coordinatesDetail: "Latitude, Longitude",
    region: "Região",
    postalCode: "CEP",
    postalCodeDetail: "Código postal",
    searchPlaceholder: "Digite IPv4, IPv6 ou domínio...",
    searchButton: "Consultar",
    mobileFlag: "Móvel",
    proxyFlag: "Proxy/VPN",
    hostingFlag: "Hospedagem",
    unknown: "Desconhecido",
    connectionDsl: "Fixa (DSL)",
    detected: "Detectado",
  },
  ja: {
    appName: "IP Info",
    navHome: "マイIP",
    navCheck: "IP検索",
    homeTitle: "IP情報",
    homeSubtitle: "公開IPとネットワーク情報をひと目で確認",
    checkTitle: "IP検索",
    checkSubtitle: "任意のIPアドレスまたはドメインを検索",
    queryOtherIp: "別のIPアドレスを検索",
    backToOwnIp: "自分のIPに戻る",
    footerDataBy: "データ提供",
    copyIpLabel: "IPアドレスをコピー",
    ipInfoError: "IP情報を取得できませんでした。",
    queriedIpAddress: "検索したIPアドレス",
    yourIpAddresses: "あなたのIPアドレス",
    notAvailable: "利用不可",
    detectedConnectionType: "検出された接続タイプ",
    ipv4Status: "IPv4ステータス",
    ipv6Status: "IPv6ステータス",
    available: "利用可能",
    notDetected: "未検出",
    active: "有効",
    inactive: "無効",
    location: "場所",
    country: "国",
    timezone: "タイムゾーン",
    timezoneDetail: "IANAタイムゾーン",
    isp: "プロバイダー (ISP)",
    ispDetail: "インターネットサービスプロバイダー",
    organization: "組織",
    organizationDetail: "ネットワーク組織",
    asNumber: "AS番号",
    asFallbackDetail: "自律システム",
    coordinates: "座標",
    coordinatesDetail: "緯度・経度",
    region: "地域",
    postalCode: "郵便番号",
    postalCodeDetail: "郵便",
    searchPlaceholder: "IPv4、IPv6、またはドメインを入力...",
    searchButton: "検索",
    mobileFlag: "モバイル",
    proxyFlag: "プロキシ/VPN",
    hostingFlag: "ホスティング",
    unknown: "不明",
    connectionDsl: "固定回線 (DSL)",
    detected: "検出済み",
  },
  ru: {
    appName: "IP Info",
    navHome: "Мой IP",
    navCheck: "Проверка IP",
    homeTitle: "Информация об IP",
    homeSubtitle: "Ваш публичный IP и сетевые данные в одном месте",
    checkTitle: "Проверка IP",
    checkSubtitle: "Проверьте любой IP-адрес или домен",
    queryOtherIp: "Проверить другой IP-адрес",
    backToOwnIp: "Назад к своему IP",
    footerDataBy: "Данные предоставлены",
    copyIpLabel: "Скопировать IP-адрес",
    ipInfoError: "Не удалось получить информацию об IP.",
    queriedIpAddress: "Запрошенный IP-адрес",
    yourIpAddresses: "Ваши IP-адреса",
    notAvailable: "Недоступно",
    detectedConnectionType: "Определённый тип подключен��я",
    ipv4Status: "Статус IPv4",
    ipv6Status: "Статус IPv6",
    available: "Доступно",
    notDetected: "Не обнаружено",
    active: "Активно",
    inactive: "Неактивно",
    location: "Местоположение",
    country: "Страна",
    timezone: "Часовой пояс",
    timezoneDetail: "Часовой пояс IANA",
    isp: "Провайдер (ISP)",
    ispDetail: "Интернет-провайдер",
    organization: "Организация",
    organizationDetail: "Сетевая организация",
    asNumber: "Номер AS",
    asFallbackDetail: "Автономная система",
    coordinates: "Координаты",
    coordinatesDetail: "Широта, Долгота",
    region: "Регион",
    postalCode: "Почтовый индекс",
    postalCodeDetail: "Индекс",
    searchPlaceholder: "Введите IPv4, IPv6 или домен...",
    searchButton: "Проверить",
    mobileFlag: "Мобильная сеть",
    proxyFlag: "Прокси/VPN",
    hostingFlag: "Хостинг",
    unknown: "Неизвестно",
    connectionDsl: "Проводной (DSL)",
    detected: "Определено",
  },
  "zh-CN": {
    appName: "IP Info",
    navHome: "我的IP",
    navCheck: "IP 查询",
    homeTitle: "IP 信息",
    homeSubtitle: "一眼查看你的公网 IP 与网络详情",
    checkTitle: "IP 查询",
    checkSubtitle: "查询任意 IP 地址或域名",
    queryOtherIp: "查询其他 IP 地址",
    backToOwnIp: "返回我的 IP",
    footerDataBy: "数据来源",
    copyIpLabel: "复制 IP 地址",
    ipInfoError: "无法获取 IP 信息。",
    queriedIpAddress: "查询的 IP 地址",
    yourIpAddresses: "你的 IP 地址",
    notAvailable: "不可用",
    detectedConnectionType: "检测到的连接类型",
    ipv4Status: "IPv4 状态",
    ipv6Status: "IPv6 状态",
    available: "可用",
    notDetected: "未检测到",
    active: "启用",
    inactive: "停用",
    location: "位置",
    country: "国家",
    timezone: "时区",
    timezoneDetail: "IANA 时区",
    isp: "运营商 (ISP)",
    ispDetail: "互联网服务提供商",
    organization: "组织",
    organizationDetail: "网���组织",
    asNumber: "AS 编号",
    asFallbackDetail: "自治系统",
    coordinates: "坐标",
    coordinatesDetail: "纬度，经度",
    region: "地区",
    postalCode: "邮编",
    postalCodeDetail: "邮政编码",
    searchPlaceholder: "输入 IPv4、IPv6 或域名...",
    searchButton: "查询",
    mobileFlag: "移动网络",
    proxyFlag: "代理/VPN",
    hostingFlag: "托管",
    unknown: "未知",
    connectionDsl: "有线 (DSL)",
    detected: "已检测",
  },
};

export function getTranslation(locale: Locale): Translation {
  return translations[locale] ?? translations.en;
}
