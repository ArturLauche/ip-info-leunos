export type ClientIpDiscoveryResult = {
  ipv4: string | null;
  ipv6: string | null;
};

type ClientIpProvider = {
  name: string;
  url: string;
  parse: (response: Response) => Promise<string | undefined>;
};

const CLIENT_IP_PROVIDERS: ClientIpProvider[] = [
  {
    name: "ipify64",
    url: "https://api64.ipify.org?format=json",
    parse: async (response) => {
      const json = (await response.json()) as { ip?: string };
      return json.ip;
    },
  },
  {
    name: "ipify4",
    url: "https://api.ipify.org?format=json",
    parse: async (response) => {
      const json = (await response.json()) as { ip?: string };
      return json.ip;
    },
  },
  {
    name: "aws-checkip",
    url: "https://checkip.amazonaws.com",
    parse: async (response) => response.text().then((value) => value.trim()),
  },
];

function isIPv4Candidate(ip: string) {
  const parts = ip.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const value = Number(part);
      return value >= 0 && value <= 255;
    })
  );
}

function isIPv6Candidate(ip: string) {
  return ip.includes(":");
}

async function fetchClientIp(provider: ClientIpProvider) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);

  try {
    const response = await fetch(provider.url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const ip = (await provider.parse(response))?.trim();
    return ip || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function discoverClientIps(): Promise<ClientIpDiscoveryResult> {
  const discovered: ClientIpDiscoveryResult = { ipv4: null, ipv6: null };

  for (const provider of CLIENT_IP_PROVIDERS) {
    if (discovered.ipv4 && discovered.ipv6) break;

    const ip = await fetchClientIp(provider);
    if (!ip) continue;

    if (!discovered.ipv4 && isIPv4Candidate(ip)) {
      discovered.ipv4 = ip;
    }

    if (!discovered.ipv6 && isIPv6Candidate(ip)) {
      discovered.ipv6 = ip;
    }
  }

  return discovered;
}
