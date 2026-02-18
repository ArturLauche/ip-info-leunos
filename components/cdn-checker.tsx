"use client";

import { useState, type FormEvent } from "react";
import { Search, CircleCheck, TriangleAlert, Shield } from "lucide-react";

interface HeaderPair {
  key: string;
  value: string;
}

interface CdnResult {
  target: string;
  reachable: boolean;
  status?: number;
  usesCdn: boolean;
  detectedCdn: string | null;
  confidence: "high" | "medium" | "low" | null;
  reason: string;
  cnameChain: string[];
  headers: HeaderPair[];
}

export function CdnChecker() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CdnResult | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = target.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/cdn?target=${encodeURIComponent(trimmed)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not analyze this target.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error while contacting the CDN checker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="example.com"
            className="h-12 w-full rounded-lg border border-border bg-secondary/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Analyzing..." : "Check CDN"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {result.usesCdn ? (
                <CircleCheck className="h-5 w-5 text-emerald-400" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
              <p className="text-lg font-semibold text-foreground">
                {result.usesCdn ? "CDN detected" : "No clear CDN signature"}
              </p>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">Target: {result.target}</p>
            {result.status ? (
              <p className="text-sm text-muted-foreground">HTTP status: {result.status}</p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              Provider: <span className="text-foreground">{result.detectedCdn || "Unknown"}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Confidence: <span className="text-foreground">{result.confidence || "n/a"}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{result.reason}</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-foreground">CNAME chain</p>
            {result.cnameChain.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {result.cnameChain.map((entry) => (
                  <li key={entry} className="font-mono">
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No CNAME records discovered.</p>
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-foreground">Interesting response headers</p>
            {result.headers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {result.headers.map((header) => (
                  <li key={header.key}>
                    <span className="font-mono text-foreground">{header.key}</span>: {header.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No relevant headers found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
