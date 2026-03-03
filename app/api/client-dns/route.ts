import dns from "node:dns";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ResolverProfile = {
  provider: string;
  homepage: string;
  privacy: "high" | "medium" | "low";
  notes: string;
};

const KNOWN_RESOLVERS: Record<string, ResolverProfile> = {
  "1.1.1.1": {
    provider: "Cloudflare",
    homepage: "https://www.cloudflare.com/application-services/products/dns/",
    privacy: "high",
    notes: "No default end-user IP logging for standard resolver traffic beyond short operational windows.",
  },
  "1.0.0.1": {
    provider: "Cloudflare",
    homepage: "https://www.cloudflare.com/application-services/products/dns/",
    privacy: "high",
    notes: "Companion Cloudflare resolver with strong public privacy commitments.",
  },
  "8.8.8.8": {
    provider: "Google Public DNS",
    homepage: "https://developers.google.com/speed/public-dns",
    privacy: "medium",
    notes: "Collects resolver telemetry and may retain temporary logs for abuse prevention and performance.",
  },
  "8.8.4.4": {
    provider: "Google Public DNS",
    homepage: "https://developers.google.com/speed/public-dns",
    privacy: "medium",
    notes: "Public resolver with transparent docs but broader data ecosystem concerns.",
  },
  "9.9.9.9": {
    provider: "Quad9",
    homepage: "https://quad9.net/",
    privacy: "high",
    notes: "Security-focused resolver with threat blocking and no sale of personal data.",
  },
  "149.112.112.112": {
    provider: "Quad9",
    homepage: "https://quad9.net/",
    privacy: "high",
    notes: "Secondary Quad9 endpoint with same privacy model.",
  },
  "208.67.222.222": {
    provider: "OpenDNS",
    homepage: "https://www.opendns.com/",
    privacy: "low",
    notes: "Filtering-focused resolver tied to account-based features and request logging.",
  },
  "208.67.220.220": {
    provider: "OpenDNS",
    homepage: "https://www.opendns.com/",
    privacy: "low",
    notes: "Companion OpenDNS endpoint with similar policy profile.",
  },
  "94.140.14.14": {
    provider: "AdGuard DNS",
    homepage: "https://adguard-dns.io/",
    privacy: "high",
    notes: "Privacy-oriented resolver with tracking/ad blocking options.",
  },
  "94.140.15.15": {
    provider: "AdGuard DNS",
    homepage: "https://adguard-dns.io/",
    privacy: "high",
    notes: "Secondary AdGuard resolver endpoint.",
  },
  "76.76.2.0": {
    provider: "Control D",
    homepage: "https://controld.com/",
    privacy: "medium",
    notes: "Customizable resolver with clear policies; privacy depends on selected profile.",
  },
};

function normalizeResolver(address: string) {
  return address.replace(/^\[|\]$/g, "").split("%", 1)[0];
}

function inspectResolver(address: string) {
  const normalized = normalizeResolver(address);
  const profile = KNOWN_RESOLVERS[normalized];

  if (!profile) {
    return {
      address: normalized,
      provider: "Unknown / ISP or local resolver",
      privacy: "medium" as const,
      notes:
        "This resolver is not in the built-in public DNS list. It may belong to your ISP, enterprise, router, or a custom secure DNS stack.",
      homepage: null,
    };
  }

  return {
    address: normalized,
    provider: profile.provider,
    privacy: profile.privacy,
    notes: profile.notes,
    homepage: profile.homepage,
  };
}

function scorePrivacy(level: "high" | "medium" | "low") {
  if (level === "high") return 100;
  if (level === "medium") return 65;
  return 30;
}

export async function GET() {
  const resolvers = dns.getServers().map(inspectResolver);

  const privacyScore =
    resolvers.length > 0
      ? Math.round(resolvers.reduce((acc, item) => acc + scorePrivacy(item.privacy), 0) / resolvers.length)
      : 0;

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    resolvers,
    resolverCount: resolvers.length,
    privacyScore,
  });
}
