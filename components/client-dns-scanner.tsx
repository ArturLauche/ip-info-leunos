"use client";

import { CircleCheck, Loader2, ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PrivacyLevel = "high" | "medium" | "low";

type ResolverResult = {
  address: string;
  provider: string;
  privacy: PrivacyLevel;
  notes: string;
  homepage: string | null;
};

type ScanResponse = {
  checkedAt: string;
  environment: string;
  summary: string;
  privacyScore: number;
  resolvers: ResolverResult[];
};

function privacyBadge(level: PrivacyLevel) {
  if (level === "high") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (level === "medium") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-rose-500/15 text-rose-300 border-rose-500/30";
}

export function ClientDnsScanner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/client-dns", { cache: "no-store" });
      const data = (await response.json()) as ScanResponse;

      if (!response.ok) {
        throw new Error("Scan failed.");
      }

      setResult(data);
    } catch {
      setError("Could not scan DNS resolvers right now. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan();
  }, []);

  const privacyLabel = useMemo(() => {
    if (!result) return "n/a";
    if (result.privacyScore >= 80) return "Strong privacy posture";
    if (result.privacyScore >= 55) return "Moderate privacy posture";
    return "Weak privacy posture";
  }, [result]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          UX hint
        </p>
        <p className="mt-2 text-xs leading-relaxed">
          Ergebnisse können sich durch VPN, Unternehmensnetzwerke oder Browser-DNS unterscheiden. Führe bei Bedarf einen Rescan aus.
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">DNS privacy estimate</p>
        {loading ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Scanning active resolvers...
          </div>
        ) : result ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold text-foreground">{result.privacyScore}/100</p>
            <p className="text-sm text-muted-foreground">{privacyLabel}</p>
            <p className="text-xs text-muted-foreground">Checked at {new Date(result.checkedAt).toLocaleString()}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      {result && (
        <>
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground">{result.environment}</div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-foreground">
            <p className="flex items-center gap-2 font-medium">
              <CircleCheck className="h-4 w-4 text-emerald-400" />
              {result.summary}
            </p>
          </div>

          <div className="grid gap-3">
            {result.resolvers.map((resolver) => (
              <article key={resolver.address} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-foreground">{resolver.address}</p>
                    <p className="text-sm text-muted-foreground">{resolver.provider}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${privacyBadge(resolver.privacy)}`}>
                    {resolver.privacy} privacy
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{resolver.notes}</p>

                {resolver.homepage && (
                  <a
                    href={resolver.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-xs text-primary hover:underline"
                  >
                    Provider policy page
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ShieldQuestion className="mt-0.5 h-4 w-4 text-primary" />
              DNS resolvers can still see your queried domains unless you use encrypted DNS (DoH/DoT) and a privacy-focused provider.
            </p>
            <p className="mt-2 flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
              Prefer resolvers with transparent data-retention policies and optional malware blocking.
            </p>
            <p className="mt-2 flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-400" />
              Enterprise/VPN networks may intentionally override your local DNS settings.
            </p>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={runScan}
        disabled={loading}
        className="h-11 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Scanning..." : "Rescan DNS"}
      </button>
    </div>
  );
}
