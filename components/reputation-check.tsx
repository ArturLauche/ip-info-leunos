"use client";

import { useEffect, useState } from "react";

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

      try {
        const res = await fetch(`/api/reputation?target=${encodeURIComponent(target)}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Reputation lookup failed");
        }
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

  return (
    <section className="w-full max-w-4xl rounded-xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reputation & Threat Checks</h2>
        {data && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {data.riskLevel} ({data.riskScore}/100)
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Running extensive checks...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-medium text-foreground">{data.target}</span> ({data.kind})
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Findings</h3>
            {data.findings.length === 0 ? (
              <p className="text-sm text-emerald-600">No major abuse indicators detected in this pass.</p>
            ) : (
              <ul className="space-y-2">
                {data.findings.map((finding) => (
                  <li
                    key={`${finding.level}-${finding.message}`}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      finding.level === "critical"
                        ? "border-red-300 bg-red-500/10 text-red-700"
                        : "border-amber-300 bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {finding.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="font-medium">Resolution</p>
              <p className="text-muted-foreground">IPs: {data.checks.resolution.total}</p>
              <p className="text-muted-foreground">NS: {data.checks.resolution.nameservers.length}</p>
              <p className="text-muted-foreground">MX: {data.checks.resolution.mxCount}</p>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="font-medium">Email auth</p>
              <p className="text-muted-foreground">SPF: {data.checks.emailAuth.spfPresent ? "present" : "missing"}</p>
              <p className="text-muted-foreground">DMARC: {data.checks.emailAuth.dmarcPresent ? "present" : "missing"}</p>
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="font-medium">DNSBL</p>
              {data.checks.dnsbl.length === 0 ? (
                <p className="text-muted-foreground">No resolved IPs to evaluate.</p>
              ) : (
                data.checks.dnsbl.map((entry) => (
                  <p key={entry.address} className="text-muted-foreground">
                    {entry.address}: {entry.listedOn.length ? entry.listedOn.join(", ") : "not listed"}
                  </p>
                ))
              )}
            </div>

            <div className="rounded-md border border-border p-3">
              <p className="font-medium">TLS / PTR</p>
              {data.checks.tls ? (
                <>
                  <p className="text-muted-foreground">
                    TLS: {data.checks.tls.enabled ? `enabled (${data.checks.tls.daysRemaining ?? "?"} days left)` : "unavailable"}
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
