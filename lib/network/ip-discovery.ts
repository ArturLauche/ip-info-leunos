
export type IpVersion = 4 | 6;

export interface IpDiscoveryResult {
  ip: string;
  version: IpVersion;
  source: string;
}

export interface DiscoveryOptions {
  timeoutMs?: number;
}

/**
 * Validates whether the given string is a plausible IPv4 or IPv6 address.
 */
export function getIpVersion(ip: string): IpVersion | null {
  if (!ip) return null;
  const trimmed = ip.trim();

  // Basic IPv4 regex
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
    const parts = trimmed.split(".");
    if (
      parts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255 && part === num.toString();
      })
    ) {
      return 4;
    }
  }

  // Basic IPv6 check: must contain at least two colons and only hex/colons/dots (for mapped addresses)
  if (trimmed.includes(":") && /^[0-9a-fA-F:.]+$/.test(trimmed)) {
    return 6;
  }

  return null;
}

/**
 * Attempts to find a valid IP of a specific version in an object's values.
 * Useful for extracting IPs from API responses that might have them in unexpected fields.
 */
export function findIpInObject(obj: any, version: IpVersion): string | null {
  if (!obj || typeof obj !== "object") return null;

  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      if (getIpVersion(value) === version) {
        return value.trim();
      }
    } else if (value && typeof value === "object") {
      const nested = findIpInObject(value, version);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * Discovers the client's public IP address using external providers.
 * Tries providers in order and returns the first successful result.
 */
export async function discoverExternalIp(options: DiscoveryOptions = {}): Promise<IpDiscoveryResult | null> {
  const { timeoutMs = 3000 } = options;

  const providers = [
    {
      url: "https://api64.ipify.org?format=json",
      name: "ipify",
      parse: async (res: Response) => {
        const json = await res.json();
        return json.ip as string;
      }
    },
    {
      url: "https://checkip.amazonaws.com",
      name: "aws",
      parse: async (res: Response) => {
        const text = await res.text();
        return text.trim();
      }
    }
  ];

  for (const provider of providers) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(provider.url, {
        signal: controller.signal,
        // Ensure no-cache to get the current IP
        cache: "no-store"
      });

      if (!res.ok) {
        continue;
      }

      const ip = await provider.parse(res);
      const version = getIpVersion(ip);

      if (version) {
        return { ip, version, source: provider.name };
      }
    } catch (error) {
      // Ignore errors and try the next provider
      console.debug(`IP discovery provider ${provider.name} failed:`, error);
    } finally {
      clearTimeout(id);
    }
  }

  return null;
}
