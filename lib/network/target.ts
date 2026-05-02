import dns from "node:dns/promises";
import net from "node:net";

export type TargetErrorCode = "invalid_target" | "target_blocked" | "timeout" | "network_error";

export class TargetValidationError extends Error {
  code: TargetErrorCode;
  status: number;
  details?: unknown;

  constructor(code: TargetErrorCode, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "TargetValidationError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export type PublicTarget = {
  input: string;
  hostname: string;
  addresses: string[];
};

export type PublicUrl = PublicTarget & {
  url: string;
};

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"]);
const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".intranet",
  ".lan",
  ".home",
];

const IPV4_BLOCKED_RANGES: Array<[number, number, string]> = [
  [ipv4ToNumber("0.0.0.0"), 8, "current-network"],
  [ipv4ToNumber("10.0.0.0"), 8, "private"],
  [ipv4ToNumber("100.64.0.0"), 10, "carrier-grade-nat"],
  [ipv4ToNumber("127.0.0.0"), 8, "loopback"],
  [ipv4ToNumber("169.254.0.0"), 16, "link-local"],
  [ipv4ToNumber("172.16.0.0"), 12, "private"],
  [ipv4ToNumber("192.0.0.0"), 24, "ietf-protocol-assignment"],
  [ipv4ToNumber("192.0.2.0"), 24, "documentation"],
  [ipv4ToNumber("192.168.0.0"), 16, "private"],
  [ipv4ToNumber("198.18.0.0"), 15, "benchmark"],
  [ipv4ToNumber("198.51.100.0"), 24, "documentation"],
  [ipv4ToNumber("203.0.113.0"), 24, "documentation"],
  [ipv4ToNumber("224.0.0.0"), 4, "multicast"],
  [ipv4ToNumber("240.0.0.0"), 4, "reserved"],
];

const IPV6_BLOCKED_RANGES: Array<[bigint, number, string]> = [
  [BigInt(0), 128, "unspecified"],
  [BigInt(1), 128, "loopback"],
  [ipv6ToBigInt("64:ff9b::"), 96, "translation-prefix"],
  [ipv6ToBigInt("100::"), 64, "discard-prefix"],
  [ipv6ToBigInt("2001:2::"), 48, "benchmark"],
  [ipv6ToBigInt("2001:db8::"), 32, "documentation"],
  [ipv6ToBigInt("2002::"), 16, "6to4"],
  [ipv6ToBigInt("fc00::"), 7, "unique-local"],
  [ipv6ToBigInt("fe80::"), 10, "link-local"],
  [ipv6ToBigInt("ff00::"), 8, "multicast"],
];

export function isIpAddress(value: string) {
  return net.isIP(stripIpv6Brackets(value)) !== 0;
}

export function isIPv4Address(value: string) {
  return net.isIP(stripIpv6Brackets(value)) === 4;
}

export function isIPv6Address(value: string) {
  return net.isIP(stripIpv6Brackets(value)) === 6;
}

export function stripIpv6Brackets(value: string) {
  return value.trim().replace(/^\[|\]$/g, "").split("%", 1)[0];
}

export function normalizeLookupTarget(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new TargetValidationError("invalid_target", "Please provide a target host or IP.");
  }

  if (isIpAddress(trimmed)) {
    return stripIpv6Brackets(trimmed).toLowerCase();
  }

  const candidate =
    /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) || trimmed.startsWith("//") || /[/?#@]/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate.startsWith("//") ? `https:${candidate}` : candidate);
    if (parsed.username || parsed.password) {
      throw new TargetValidationError("invalid_target", "Credentials are not allowed in targets.");
    }

    return normalizeHostname(parsed.hostname);
  } catch (error) {
    if (error instanceof TargetValidationError) throw error;

    const withoutPath = trimmed
      .split(/[/?#]/)[0]
      .replace(/:\d+$/, "");

    if (isIpAddress(withoutPath)) {
      return stripIpv6Brackets(withoutPath).toLowerCase();
    }

    return normalizeHostname(withoutPath);
  }
}

export function normalizeWebUrl(input: string, defaultProtocol: "https:" | "http:" = "https:") {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new TargetValidationError("invalid_target", "Please provide a valid URL or domain.");
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `${defaultProtocol}//${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new TargetValidationError("invalid_target", "Please provide a valid URL or domain.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new TargetValidationError("invalid_target", "Only HTTP and HTTPS targets are supported.");
  }

  if (parsed.username || parsed.password) {
    throw new TargetValidationError("invalid_target", "Credentials are not allowed in URLs.");
  }

  parsed.hash = "";
  normalizeHostname(parsed.hostname);
  return parsed;
}

export function normalizeHostname(hostname: string) {
  const normalized = stripIpv6Brackets(hostname)
    .trim()
    .replace(/\.$/, "")
    .toLowerCase();

  if (!normalized || normalized.length > 253) {
    throw new TargetValidationError("invalid_target", "Please provide a valid host or IP.");
  }

  if (isIpAddress(normalized)) return normalized;

  if (BLOCKED_HOSTNAMES.has(normalized) || BLOCKED_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) {
    throw new TargetValidationError(
      "target_blocked",
      "Private, local, and internal hostnames are not allowed on the public site.",
      403,
      { hostname: normalized },
    );
  }

  const labels = normalized.split(".");
  const validLabels = labels.every((label) => {
    if (!label || label.length > 63) return false;
    return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label);
  });

  if (!validLabels) {
    throw new TargetValidationError("invalid_target", "Please provide a valid host or IP.");
  }

  return normalized;
}

export function assertPublicIpAddress(address: string) {
  const normalized = stripIpv6Brackets(address);
  const family = net.isIP(normalized);

  if (family === 4) {
    const range = blockedIPv4Range(normalized);
    if (range) {
      throw new TargetValidationError(
        "target_blocked",
        "Private, reserved, and internal IP ranges are blocked on the public site.",
        403,
        { address: normalized, range },
      );
    }
    return;
  }

  if (family === 6) {
    const mapped = getMappedIPv4(normalized);
    if (mapped) {
      assertPublicIpAddress(mapped);
      return;
    }

    const range = blockedIPv6Range(normalized);
    if (range) {
      throw new TargetValidationError(
        "target_blocked",
        "Private, reserved, and internal IPv6 ranges are blocked on the public site.",
        403,
        { address: normalized, range },
      );
    }
    return;
  }

  throw new TargetValidationError("invalid_target", "Please provide a valid IP address.");
}

export async function resolveTargetAddresses(hostname: string) {
  if (isIpAddress(hostname)) {
    return [stripIpv6Brackets(hostname)];
  }

  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    return [...new Set(records.map((record) => record.address))];
  } catch (error) {
    throw new TargetValidationError(
      "network_error",
      "The target could not be resolved.",
      400,
      { hostname, code: (error as NodeJS.ErrnoException).code || "DNS_ERROR" },
    );
  }
}

export async function assertPublicTarget(input: string): Promise<PublicTarget> {
  const hostname = normalizeLookupTarget(input);
  const addresses = await resolveTargetAddresses(hostname);

  if (!addresses.length) {
    throw new TargetValidationError("network_error", "The target did not resolve to any address.", 400, {
      hostname,
    });
  }

  for (const address of addresses) {
    assertPublicIpAddress(address);
  }

  return { input, hostname, addresses };
}

export async function assertPublicUrl(input: string | URL): Promise<PublicUrl> {
  const parsed = typeof input === "string" ? normalizeWebUrl(input) : input;
  const target = await assertPublicTarget(parsed.hostname);

  return {
    ...target,
    url: parsed.toString(),
  };
}

export async function fetchPublicUrl(
  input: string | URL,
  init: RequestInit & {
    maxRedirects?: number;
    timeoutMs?: number;
    maxContentLengthBytes?: number;
  } = {},
) {
  const maxRedirects = init.maxRedirects ?? 3;
  const timeoutMs = init.timeoutMs ?? 5_000;
  const maxContentLengthBytes = init.maxContentLengthBytes ?? 1_000_000;
  let current = typeof input === "string" ? normalizeWebUrl(input) : input;

  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    await assertPublicUrl(current);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(current, {
        ...init,
        redirect: "manual",
        signal: controller.signal,
      });
      clearTimeout(timer);

      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > maxContentLengthBytes) {
        await response.body?.cancel();
        throw new TargetValidationError(
          "target_blocked",
          "The target response is too large for this public checker.",
          413,
          { contentLength, maxContentLengthBytes },
        );
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel();

        if (!location) return response;
        current = new URL(location, current);
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof TargetValidationError) throw error;
      if ((error as Error).name === "AbortError") {
        throw new TargetValidationError("timeout", "The target request timed out.", 408);
      }
      throw error;
    }
  }

  throw new TargetValidationError("target_blocked", "Too many redirects while validating the target.", 400, {
    maxRedirects,
  });
}

function blockedIPv4Range(address: string) {
  const value = ipv4ToNumber(address);

  for (const [rangeStart, prefix, name] of IPV4_BLOCKED_RANGES) {
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    if ((value & mask) === (rangeStart & mask)) return name;
  }

  return null;
}

function blockedIPv6Range(address: string) {
  const value = ipv6ToBigInt(address);

  for (const [rangeStart, prefix, name] of IPV6_BLOCKED_RANGES) {
    const shift = BigInt(128 - prefix);
    if ((value >> shift) === (rangeStart >> shift)) return name;
  }

  return null;
}

function getMappedIPv4(address: string) {
  const normalized = address.toLowerCase();
  if (!normalized.startsWith("::ffff:")) return null;

  const tail = normalized.slice("::ffff:".length);
  if (net.isIP(tail) === 4) return tail;

  return null;
}

function ipv4ToNumber(address: string) {
  const octets = address.split(".").map((part) => Number(part));
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    throw new Error(`Invalid IPv4 address: ${address}`);
  }

  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    octets[3]
  ) >>> 0;
}

function ipv6ToBigInt(address: string) {
  const normalized = stripIpv6Brackets(address).toLowerCase();
  if (net.isIP(normalized) !== 6) {
    throw new Error(`Invalid IPv6 address: ${address}`);
  }

  const ipv4TailMatch = normalized.match(/(.+):(\d{1,3}(?:\.\d{1,3}){3})$/);
  const expandedInput = ipv4TailMatch
    ? `${ipv4TailMatch[1]}:${ipv4ToNumber(ipv4TailMatch[2]).toString(16).padStart(8, "0").slice(0, 4)}:${ipv4ToNumber(ipv4TailMatch[2]).toString(16).padStart(8, "0").slice(4)}`
    : normalized;

  const [leftRaw, rightRaw] = expandedInput.split("::");
  const left = leftRaw ? leftRaw.split(":").filter(Boolean) : [];
  const right = rightRaw ? rightRaw.split(":").filter(Boolean) : [];
  const fill = 8 - left.length - right.length;

  if (fill < 0 || expandedInput.split("::").length > 2) {
    throw new Error(`Invalid IPv6 address: ${address}`);
  }

  const parts = [...left, ...Array.from({ length: fill }, () => "0"), ...right];
  if (parts.length !== 8) {
    throw new Error(`Invalid IPv6 address: ${address}`);
  }

  return parts.reduce((acc, part) => (acc << BigInt(16)) + BigInt(Number.parseInt(part || "0", 16)), BigInt(0));
}
