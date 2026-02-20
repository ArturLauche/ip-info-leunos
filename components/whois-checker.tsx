"use client";

import { CircleCheck, Search, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";

interface WhoisResult {
  target: string;
  server: string;
  raw: string;
  refer?: string;
  note?: string;
}

export function WhoisChecker() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhoisResult | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = target.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/whois?target=${encodeURIComponent(trimmed)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "WHOIS lookup failed.");
      } else {
        setResult(data as WhoisResult);
      }
    } catch {
      setError("Network error while contacting /api/whois.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="example.com or 8.8.8.8"
            className="h-12 w-full rounded-lg border border-border bg-secondary/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Looking up..." : "Lookup WHOIS"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
          <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <CircleCheck className="h-5 w-5 text-emerald-400" />
            WHOIS for {result.target}
          </p>

          <div className="text-sm text-muted-foreground">
            <p>
              Queried server: <span className="font-mono text-foreground">{result.server}</span>
            </p>
            {result.refer && (
              <p>
                Referral source: <span className="font-mono text-foreground">{result.refer}</span>
              </p>
            )}
            {result.note && <p>{result.note}</p>}
          </div>

          <div className="max-h-[32rem] overflow-auto rounded-lg border border-border bg-secondary/40 p-3 font-mono text-xs text-foreground">
            <pre className="whitespace-pre-wrap break-words">{result.raw || "No WHOIS data returned."}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
