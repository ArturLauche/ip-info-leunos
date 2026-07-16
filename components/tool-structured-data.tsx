import { navGroups, type ToolKey } from "@/components/shell/nav-config";
import { StructuredData } from "@/components/structured-data";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/seo";

const featureLists: Record<ToolKey, { de: string[]; en: string[] }> = {
  home: {
    de: ["Öffentliche IPv4- und IPv6-Adresse", "Ungefähre IP-Geolokalisierung", "Provider, Organisation und ASN", "Reverse DNS und Verbindungshinweise"],
    en: ["Public IPv4 and IPv6 address", "Approximate IP geolocation", "Provider, organization, and ASN", "Reverse DNS and connection signals"],
  },
  check: {
    de: ["Lookup öffentlicher IPv4- und IPv6-Adressen", "Domainauflösung", "Provider- und ASN-Daten", "Reverse DNS und ungefähre Geolokalisierung"],
    en: ["Public IPv4 and IPv6 lookup", "Domain resolution", "Provider and ASN data", "Reverse DNS and approximate geolocation"],
  },
  asn: {
    de: ["ASN-Identität und angekündigte Prefixe", "RIPEstat-Routing-Beobachtungen", "Öffentliche PeeringDB-Profile", "Quellenstatus und Teilresultate"],
    en: ["ASN identity and announced prefixes", "RIPEstat routing observations", "Public PeeringDB profiles", "Source status and partial results"],
  },
  ping: {
    de: ["TCP- und UDP-Erreichbarkeit", "Endpoint-Prüfung", "Ausgewählte Datenbank-Probes", "Serverseitige Latenz und Zeitlimits"],
    en: ["TCP and UDP reachability", "Endpoint checks", "Selected database probes", "Server-side latency and timeouts"],
  },
  dns: {
    de: ["A, AAAA und CNAME", "MX, NS und TXT", "SOA, SRV und CAA", "PTR-Reverse-Lookup"],
    en: ["A, AAAA, and CNAME", "MX, NS, and TXT", "SOA, SRV, and CAA", "PTR reverse lookup"],
  },
  whois: {
    de: ["Domain- und IP-WHOIS", "Registrar- und Registry-Daten", "Nameserver und Datumsfelder", "RDAP-Fallback und Rohantwort"],
    en: ["Domain and IP WHOIS", "Registrar and registry data", "Name servers and date fields", "RDAP fallback and raw response"],
  },
  cdn: {
    de: ["DNS- und CNAME-Signale", "HTTP-Header-Signale", "CDN- und Edge-Anbieter-Heuristiken", "Begrenzte Prüfung öffentlicher Ziele"],
    en: ["DNS and CNAME signals", "HTTP header signals", "CDN and edge-provider heuristics", "Bounded checks of public targets"],
  },
  reputation: {
    de: ["Ausgewählte DNS-Blacklists", "Proxy- und Hosting-Heuristiken", "Optionale AbuseIPDB-Meldedaten", "Vorsichtiger Risiko-Score"],
    en: ["Selected DNS blocklists", "Proxy and hosting heuristics", "Optional AbuseIPDB report data", "Cautious risk score"],
  },
};

interface ToolStructuredDataProps {
  tool: ToolKey;
  locale: Locale;
  name: string;
  description: string;
}

export function ToolStructuredData({ tool, locale, name, description }: ToolStructuredDataProps) {
  const path = navGroups.flatMap((group) => group.items).find((item) => item.key === tool)?.href ?? "/";
  const url = new URL(path, siteConfig.url).toString();
  const language = locale === "de" ? "de-DE" : locale;
  const features = locale === "de" ? featureLists[tool].de : featureLists[tool].en;

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${url}#web-application`,
        name,
        url,
        description,
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory: "Internet and network information tool",
        operatingSystem: "Any system with a modern web browser",
        browserRequirements: "Requires JavaScript for interactive lookups",
        featureList: features,
        isAccessibleForFree: true,
        inLanguage: language,
        offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
        provider: { "@id": `${siteConfig.url}/#organization` },
        isPartOf: { "@id": `${siteConfig.url}/#website` },
      }}
    />
  );
}
