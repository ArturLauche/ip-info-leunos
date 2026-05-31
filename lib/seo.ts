import type { Metadata } from "next";

export const siteConfig = {
  name: "IP Auskunft",
  shortName: "IP Auskunft",
  description:
    "Kostenlose IP- und Netzwerk-Tools: öffentliche IP anzeigen, IP-/Domain-Checks, DNS-Lookups, Whois, CDN-Erkennung und Erreichbarkeitstests.",
  url: "https://ip-info.leunos.com",
  locale: "de_DE",
  keywords: [
    "IP Adresse",
    "Meine IP",
    "IP Lookup",
    "ASN Lookup",
    "DNS Lookup",
    "Whois",
    "CDN Check",
    "PeeringDB",
    "Ping Test",
    "Netzwerk Analyse",
  ],
};

export const defaultOpenGraphImage = "/icon.svg";

export function createPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const canonical = new URL(path, siteConfig.url).toString();

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: defaultOpenGraphImage,
          width: 512,
          height: 512,
          alt: `${siteConfig.name} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [defaultOpenGraphImage],
    },
  };
}
