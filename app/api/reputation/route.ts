import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DNSBL_ZONES = ["zen.spamhaus.org", "bl.spamcop.net", "dnsbl.sorbs.net", "b.barracudacentral.org"] as const;
const SUSPICIOUS_TLDS = new Set(["zip", "mov", "click", "top", "gq", "tk", "ml", "work", "country", "kim", "date", "racing", "science", "fit"]);

function normalizeTarget(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
    return trimmed.split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  }
}

function isPrivateOrReservedIPv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 127 || a === 0 || (a === 169 && b === 254) || a >= 224;
}

function reverseIPv4(ip: string) {
  return ip.split(".").reverse().join(".");
}

async function dnsblLookup(ip: string) {
  if (net.isIP(ip) !== 4 || isPrivateOrReservedIPv4(ip)) return [] as string[];
  const reversed = reverseIPv4(ip);
  const listedOn: string[] = [];

  await Promise.all(
    DNSBL_ZONES.map(async (zone) => {
      try {
        await dns.resolve4(`${reversed}.${zone}`);
        listedOn.push(zone);
      } catch {
        // not listed
      }
    }),
  );

  return listedOn;
}

function gradeFromScore(score: number) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  if (score >= 15) return "Low";
  return "Minimal";
}

function daysBetween(now: Date, future: Date) {
  return Math.ceil((future.getTime() - now.getTime()) / 86400000);
}

async function getTlsSummary(hostname: string) {
  return new Promise<{ enabled: boolean; validTo: string | null; daysRemaining: number | null; issuer: string | null; error: string | null }>((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false, timeout: 5000 },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.valid_to) {
          socket.end();
          resolve({ enabled: false, validTo: null, daysRemaining: null, issuer: null, error: "No certificate presented" });
          return;
        }

        const validToDate = new Date(cert.valid_to);
        const daysRemaining = Number.isNaN(validToDate.getTime()) ? null : daysBetween(new Date(), validToDate);
        socket.end();
        resolve({ enabled: true, validTo: cert.valid_to ?? null, daysRemaining, issuer: cert.issuer?.O ?? cert.issuer?.CN ?? null, error: null });
      },
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ enabled: false, validTo: null, daysRemaining: null, issuer: null, error: "TLS handshake timeout" });
    });
    socket.on("error", (error) => {
      resolve({ enabled: false, validTo: null, daysRemaining: null, issuer: null, error: error.message });
    });
  });
}

function domainSignals(hostname: string) {
  const findings: string[] = [];
  const labels = hostname.split(".").filter(Boolean);
  const tld = labels.at(-1) ?? "";

  if (hostname.includes("xn--")) findings.push("Punycode domain detected (possible homograph attempt)");
  if (hostname.length > 45) findings.push("Long domain name length");
  if ((hostname.match(/-/g) || []).length >= 3) findings.push("Many hyphens in domain");
  if ((hostname.match(/\d/g) || []).length >= 4) findings.push("Domain contains many digits");
  if (SUSPICIOUS_TLDS.has(tld)) findings.push(`TLD .${tld} has elevated abuse prevalence`);

  return findings;
}

async function rdapSummary(target: string, ipMode: boolean) {
  try {
    const response = await fetch(`https://rdap.org/${ipMode ? `ip/${target}` : `domain/${target}`}`, { cache: "no-store" });
    if (!response.ok) return { ok: false as const, error: `RDAP status ${response.status}` };

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];
    const registration = events.find((event: { eventAction?: string }) => ["registration", "registered"].includes((event.eventAction ?? "").toLowerCase()));
    const expiration = events.find((event: { eventAction?: string }) => ["expiration", "expiry", "expired"].includes((event.eventAction ?? "").toLowerCase()));

    return { ok: true as const, registrationDate: registration?.eventDate ?? null, expirationDate: expiration?.eventDate ?? null, status: Array.isArray(data.status) ? data.status : [], entities: Array.isArray(data.entities) ? data.entities.length : 0 };
  } catch (error) {
    return { ok: false as const, error: (error as Error).message };
  }
}

export async function GET(request: Request) {
  const targetParam = new URL(request.url).searchParams.get("target");
  if (!targetParam?.trim()) return NextResponse.json({ error: "Missing target query parameter." }, { status: 400 });

  const target = normalizeTarget(targetParam);
  if (!target) return NextResponse.json({ error: "Please provide a valid IP or domain." }, { status: 400 });

  const ipVersion = net.isIP(target);
  const isIpTarget = ipVersion !== 0;
  const findings: { level: "warning" | "critical"; message: string }[] = [];
  let riskScore = 0;

  const resolvedAddresses = isIpTarget ? [{ address: target, family: ipVersion }] : await dns.lookup(target, { all: true }).catch(() => []);
  if (!isIpTarget && resolvedAddresses.length === 0) {
    findings.push({ level: "warning", message: "Domain does not currently resolve to an IP address" });
    riskScore += 20;
  }

  const [aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords, ptrRecord] = await Promise.all([
    !isIpTarget ? dns.resolve4(target).catch(() => [] as string[]) : Promise.resolve([] as string[]),
    !isIpTarget ? dns.resolve6(target).catch(() => [] as string[]) : Promise.resolve([] as string[]),
    !isIpTarget ? dns.resolveMx(target).catch(() => [] as { exchange: string; priority: number }[]) : Promise.resolve([] as { exchange: string; priority: number }[]),
    !isIpTarget ? dns.resolveTxt(target).catch(() => [] as string[][]) : Promise.resolve([] as string[][]),
    !isIpTarget ? dns.resolveNs(target).catch(() => [] as string[]) : Promise.resolve([] as string[]),
    isIpTarget ? dns.reverse(target).catch(() => [] as string[]) : Promise.resolve([] as string[]),
  ]);

  if (isIpTarget && ptrRecord.length === 0) {
    findings.push({ level: "warning", message: "No reverse DNS (PTR) record found for IP" });
    riskScore += 10;
  }

  let dmarcPresent = false;
  if (!isIpTarget) {
    dmarcPresent = (await dns.resolveTxt(`_dmarc.${target}`).catch(() => [] as string[][])).length > 0;
    const spfPresent = txtRecords.some((entry) => entry.join("").toLowerCase().startsWith("v=spf1"));

    if (mxRecords.length > 0 && !spfPresent) {
      findings.push({ level: "warning", message: "Domain receives email (MX) but has no SPF record" });
      riskScore += 8;
    }
    if (mxRecords.length > 0 && !dmarcPresent) {
      findings.push({ level: "warning", message: "Domain receives email (MX) but has no DMARC record" });
      riskScore += 10;
    }

    for (const signal of domainSignals(target)) {
      findings.push({ level: "warning", message: signal });
      riskScore += 6;
    }
  }

  const rdap = await rdapSummary(target, isIpTarget);
  if (rdap.ok) {
    if (rdap.registrationDate) {
      const ageDays = Math.floor((new Date().getTime() - new Date(rdap.registrationDate).getTime()) / 86400000);
      if (ageDays >= 0 && ageDays < 30) {
        findings.push({ level: "critical", message: `Recently registered (${ageDays} days old)` });
        riskScore += 25;
      } else if (ageDays >= 30 && ageDays < 120) {
        findings.push({ level: "warning", message: `Relatively new registration (${ageDays} days old)` });
        riskScore += 10;
      }
    }

    if (rdap.expirationDate) {
      const remaining = daysBetween(new Date(), new Date(rdap.expirationDate));
      if (remaining < 14) {
        findings.push({ level: "warning", message: `Registration expires very soon (${remaining} days)` });
        riskScore += 7;
      }
    }

    if (rdap.status.some((status: unknown) => String(status).toLowerCase().includes("inactive"))) {
      findings.push({ level: "warning", message: "RDAP status includes inactive state" });
      riskScore += 8;
    }
  }

  const dnsbl = await Promise.all(resolvedAddresses.map(async ({ address }) => ({ address, listedOn: await dnsblLookup(address) })));
  for (const item of dnsbl) {
    if (item.listedOn.length > 0) {
      findings.push({ level: "critical", message: `${item.address} is listed on DNSBLs: ${item.listedOn.join(", ")}` });
      riskScore += 30;
    }
  }

  const ipApiFlags = await Promise.all(
    resolvedAddresses.slice(0, 3).map(async ({ address }) => {
      try {
        const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(address)}?fields=status,proxy,hosting,mobile,query`, { cache: "no-store" });
        const data = await response.json();
        return data.status === "success" ? data : null;
      } catch {
        return null;
      }
    }),
  );

  for (const item of ipApiFlags) {
    if (!item) continue;
    if (item.proxy) {
      findings.push({ level: "critical", message: `${item.query} detected as proxy/VPN/Tor endpoint` });
      riskScore += 18;
    }
    if (item.hosting) {
      findings.push({ level: "warning", message: `${item.query} belongs to hosting/datacenter network` });
      riskScore += 10;
    }
  }

  const tlsSummary = !isIpTarget ? await getTlsSummary(target) : null;
  if (tlsSummary && !tlsSummary.enabled) {
    findings.push({ level: "warning", message: `TLS not available: ${tlsSummary.error}` });
    riskScore += 8;
  }
  if (tlsSummary?.enabled && (tlsSummary.daysRemaining ?? 9999) < 10) {
    findings.push({ level: "warning", message: `TLS certificate expires soon (${tlsSummary.daysRemaining} days)` });
    riskScore += 10;
  }

  const uniqueFindings = Array.from(new Set(findings.map((f) => `${f.level}:${f.message}`))).map((value) => {
    const [level, ...message] = value.split(":");
    return { level: level as "warning" | "critical", message: message.join(":") };
  });

  return NextResponse.json({
    target,
    kind: isIpTarget ? "ip" : "domain",
    riskScore: Math.min(100, riskScore),
    riskLevel: gradeFromScore(riskScore),
    findings: uniqueFindings,
    checks: {
      resolution: { total: resolvedAddresses.length, ipv4: aRecords, ipv6: aaaaRecords, nameservers: nsRecords, mxCount: mxRecords.length },
      emailAuth: { spfPresent: txtRecords.some((entry) => entry.join("").toLowerCase().startsWith("v=spf1")), dmarcPresent },
      rdap,
      dnsbl,
      ptr: ptrRecord,
      tls: tlsSummary,
      ipApiFlags: ipApiFlags.filter(Boolean),
    },
  });
}
