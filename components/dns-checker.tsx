"use client";

import { CircleCheck, Search, TriangleAlert } from "lucide-react";
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

export function DnsChecker() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DnsResult | null>(null);

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
        setError(data.error || "DNS lookup failed.");
      } else {
        setResult(data as DnsResult);
      }
    } catch {
      setError("Network error while contacting /api/dns.");
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
            placeholder="example.com"
            className="h-12 w-full rounded-lg border border-border bg-secondary/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Looking up..." : "Lookup DNS"}
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
            DNS records for {result.target}
          </p>

          <div>
            <p className="text-sm font-medium text-foreground">Resolved addresses</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {result.addresses.length > 0 ? (
                result.addresses.map((address) => (
                  <li key={`${address.address}-${address.family}`} className="font-mono">
                    {address.address} (IPv{address.family})
                  </li>
                ))
              ) : (
                <li>No A/AAAA lookup result.</li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Record details</p>
            <div className="mt-2 max-h-96 overflow-auto rounded-lg border border-border bg-secondary/40 p-3 font-mono text-xs text-foreground">
              <pre>{JSON.stringify(result.records, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
