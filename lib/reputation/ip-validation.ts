import net from "node:net";
import {
  assertPublicIpAddress,
  isIpAddress,
  normalizeLookupTarget,
  resolveTargetAddresses,
  stripIpv6Brackets,
  TargetValidationError,
} from "@/lib/network/target";

export function isPublicIpAddress(input: string):
  | { ok: true; address: string }
  | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Please provide a target." };
  }

  try {
    const normalized = normalizeLookupTarget(trimmed);

    if (!isIpAddress(normalized)) {
      return {
        ok: false,
        error: "Please provide a valid IP address (domains are not supported).",
      };
    }

    const address = stripIpv6Brackets(normalized);
    assertPublicIpAddress(address);
    return { ok: true, address };
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Invalid target." };
  }
}

export async function resolvePublicIp(input: string):
  | Promise<
    | { ok: true; ip: string; hostname: string }
    | { ok: false; error: string; code?: string }
  > {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Please provide a target." };
  }

  // Direct IP path
  if (isIpAddress(trimmed)) {
    const direct = isPublicIpAddress(trimmed);
    if (!direct.ok) {
      return { ok: false, error: direct.error, code: "target_blocked" };
    }
    return { ok: true, ip: direct.address, hostname: direct.address };
  }

  // Domain path: normalize, resolve, return first public IP
  try {
    const hostname = normalizeLookupTarget(trimmed);
    const addresses = await resolveTargetAddresses(hostname, { timeoutMs: 3_000 });

    if (!addresses.length) {
      return { ok: false, error: "The target did not resolve to any address.", code: "invalid_target" };
    }

    for (const address of addresses) {
      try {
        assertPublicIpAddress(address);
        return { ok: true, ip: address, hostname };
      } catch {
        // try next address
      }
    }

    return {
      ok: false,
      error: "The target resolved only to private, reserved, or internal addresses.",
      code: "target_blocked",
    };
  } catch (error) {
    if (error instanceof TargetValidationError) {
      return { ok: false, error: error.message, code: error.code };
    }
    return { ok: false, error: "Invalid target.", code: "invalid_target" };
  }
}

export function isBrowserIpLike(input: string): boolean {
  return net.isIP(stripIpv6Brackets(input.trim())) !== 0;
}
