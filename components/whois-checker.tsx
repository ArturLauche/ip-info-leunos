"use client";

import { type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { CircleCheck, Search, TriangleAlert, Server, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

interface WhoisResult {
  target: string;
  server: string;
  raw: string;
  refer?: string;
  note?: string;
}

interface WhoisCheckerProps {
  locale: Locale;
}

export function WhoisChecker({ locale }: WhoisCheckerProps) {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const t = getToolTranslation(locale);

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
        setError(data.error || t.whoisLookupError);
      } else {
        setResult(data as WhoisResult);
      }
    } catch {
      setError(t.whoisNetworkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          UX hint
        </p>
        <p className="mt-2 text-xs leading-relaxed">WHOIS zeigt Registrierungsdaten und zuständige Server. Nutze eine Domain oder IP-Adresse als Ziel.</p>
      </div>

      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:p-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder={t.whoisPlaceholder}
            className="h-12 w-full rounded-lg border border-border bg-secondary/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t.lookupInProgress : t.whoisLookupButton}
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
            {t.whoisFor} {result.target}
          </p>

          <div className="rounded-xl border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <Server className="h-4 w-4 text-primary" />
              {t.queriedServer}: <span className="font-mono">{result.server}</span>
            </p>
            {result.refer && (
              <p className="mt-2">
                {t.referralSource}: <span className="font-mono text-foreground">{result.refer}</span>
              </p>
            )}
            {result.note && <p className="mt-2">{result.note}</p>}
          </div>

          <div className="max-h-[32rem] overflow-auto rounded-lg border border-border bg-secondary/40 p-3 font-mono text-xs text-foreground">
            <pre className="whitespace-pre-wrap break-words">{result.raw || t.noWhoisData}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
