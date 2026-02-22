"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";

type ReputationResult = {
  target: string;
  kind: "ip" | "domain";
  riskScore: number;
  riskLevel: string;
  findings: { level: "warning" | "critical"; message: string }[];
  checks: {
    resolution: {
      total: number;
      ipv4: string[];
      ipv6: string[];
      nameservers: string[];
      mxCount: number;
    };
    emailAuth: {
      spfPresent: boolean;
      dmarcPresent: boolean;
    };
    dnsbl: { address: string; listedOn: string[] }[];
    ptr: string[];
    tls: {
      enabled: boolean;
      validTo: string | null;
      daysRemaining: number | null;
      issuer: string | null;
      error: string | null;
    } | null;
  };
};

function riskTone(score: number) {
  if (score >= 80) return "text-red-700 bg-red-500/15 border-red-500/30";
  if (score >= 60) return "text-orange-700 bg-orange-500/15 border-orange-500/30";
  if (score >= 35) return "text-amber-700 bg-amber-500/15 border-amber-500/30";
  if (score >= 15) return "text-yellow-700 bg-yellow-500/15 border-yellow-500/30";
  return "text-emerald-700 bg-emerald-500/15 border-emerald-500/30";
}

function riskBarColor(score: number) {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 35) return "bg-amber-500";
  if (score >= 15) return "bg-yellow-500";
  return "bg-emerald-500";
}

export function ReputationCheck({ target }: { target: string }) {
  const [data, setData] = useState<ReputationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      if (!target.trim()) return;
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(`/api/reputation?target=${encodeURIComponent(target)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Reputation lookup failed");
        if (!canceled) setData(json);
      } catch (err) {
        if (!canceled) setError((err as Error).message);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    run();

    return () => {
      canceled = true;
    };
  }, [target]);

  const listedCount = useMemo(
    () => data?.checks.dnsbl.filter((entry) => entry.listedOn.length > 0).length ?? 0,
    [data],
  );

  return (
    <section className="w-full max-w-4xl rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reputation & Threat Checks</h2>
          <p className="text-sm text-muted-foreground">Multi-source heuristics for abuse and operational risk.</p>
        </div>

        {data && (
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${riskTone(data.riskScore)}`}>
            {data.riskScore < 15 ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {data.riskLevel} ({data.riskScore}/100)
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Running extensive checks...</p>}
      {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {data && !loading && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-semibold text-foreground">{data.target}</span> ({data.kind})
            </p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full transition-all ${riskBarColor(data.riskScore)}`} style={{ width: `${Math.max(4, data.riskScore)}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Findings</h3>
            {data.findings.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                No major abuse indicators detected in this pass.
              </div>
            ) : (
              <ul className="space-y-2">
                {data.findings.map((finding) => (
                  <li
                    key={`${finding.level}-${finding.message}`}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                      finding.level === "critical"
                        ? "border-red-300 bg-red-500/10 text-red-700"
                        : "border-amber-300 bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{finding.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-background/50 p-4">
              <p className="font-medium text-foreground">Resolution</p>
              <p className="text-muted-foreground">Total IPs: {data.checks.resolution.total}</p>
              <p className="text-muted-foreground">IPv4: {data.checks.resolution.ipv4.length}</p>
              <p className="text-muted-foreground">IPv6: {data.checks.resolution.ipv6.length}</p>
              <p className="text-muted-foreground">Nameservers: {data.checks.resolution.nameservers.length}</p>
              <p className="text-muted-foreground">MX records: {data.checks.resolution.mxCount}</p>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/50 p-4">
              <p className="font-medium text-foreground">Email auth</p>
              <p className={data.checks.emailAuth.spfPresent ? "text-emerald-700" : "text-amber-700"}>
                SPF: {data.checks.emailAuth.spfPresent ? "present" : "missing"}
              </p>
              <p className={data.checks.emailAuth.dmarcPresent ? "text-emerald-700" : "text-amber-700"}>
                DMARC: {data.checks.emailAuth.dmarcPresent ? "present" : "missing"}
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/50 p-4">
              <p className="font-medium text-foreground">DNSBL status</p>
              <p className={listedCount > 0 ? "text-red-700" : "text-emerald-700"}>
                Listed IPs: {listedCount}/{data.checks.dnsbl.length}
              </p>
              {data.checks.dnsbl.length > 0 && (
                <div className="mt-1 space-y-1">
                  {data.checks.dnsbl.map((entry) => (
                    <p key={entry.address} className="text-muted-foreground">
                      {entry.address}: {entry.listedOn.length ? entry.listedOn.join(", ") : "not listed"}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/70 bg-background/50 p-4">
              <p className="font-medium text-foreground">TLS / PTR</p>
              {data.checks.tls ? (
                <>
                  <p className={data.checks.tls.enabled ? "text-emerald-700" : "text-amber-700"}>
                    TLS: {data.checks.tls.enabled ? `enabled (${data.checks.tls.daysRemaining ?? "?"} days left)` : `unavailable (${data.checks.tls.error ?? "unknown"})`}
                  </p>
                  <p className="text-muted-foreground">Issuer: {data.checks.tls.issuer || "n/a"}</p>
                </>
              ) : (
                <p className="text-muted-foreground">PTR: {data.checks.ptr.length ? data.checks.ptr.join(", ") : "none"}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
