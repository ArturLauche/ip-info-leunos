"use client";

import { type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { CircleCheck, Search, TriangleAlert, Sparkles, Binary, Network } from "lucide-react";
import { useState, type FormEvent } from "react";

interface DnsAddress {
  address: string;
  family: number;
}

interface DnsRecord {
  type: string;
  value: unknown;
}

interface DnsResult {
  target: string;
  addresses: DnsAddress[];
  records: DnsRecord[];
}

interface DnsCheckerProps {
  locale: Locale;
}

export function DnsChecker({ locale }: DnsCheckerProps) {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DnsResult | null>(null);
  const t = getToolTranslation(locale);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = target.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/dns?target=${encodeURIComponent(trimmed)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.dnsLookupError);
      } else {
        setResult(data as DnsResult);
      }
    } catch {
      setError(t.dnsNetworkError);
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
        <p className="mt-2 text-xs leading-relaxed">Suche zuerst die Domain (z. B. example.com), dann eine Subdomain wie api.example.com.</p>
      </div>

      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:p-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder={t.targetPlaceholder}
            className="h-12 w-full rounded-lg border border-border bg-secondary/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t.lookupInProgress : t.dnsLookupButton}
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
            {t.dnsRecordsFor} {result.target}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Network className="h-4 w-4 text-primary" />
                {t.resolvedAddresses}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {result.addresses.length > 0 ? (
                  result.addresses.map((address) => (
                    <li key={`${address.address}-${address.family}`} className="font-mono">
                      {address.address} (IPv{address.family})
                    </li>
                  ))
                ) : (
                  <li>{t.noAddressResult}</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Binary className="h-4 w-4 text-primary" />
                {t.recordDetails}
              </p>
              <div className="mt-2 max-h-96 overflow-auto rounded-lg border border-border bg-background/40 p-3 font-mono text-xs text-foreground">
                <pre>{JSON.stringify(result.records, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
