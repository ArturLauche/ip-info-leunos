import type { Metadata } from "next";

export const siteConfig = {
  name: "IP Auskunft",
  shortName: "IP Auskunft",
  description:
    "Kostenlose Netzwerk-Tools für öffentliche IP-Adressen, ASN, DNS, Whois, CDN-Erkennung, Erreichbarkeit und IP-Reputation.",
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
    "IP Reputation",
    "Blacklist Check",
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
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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
