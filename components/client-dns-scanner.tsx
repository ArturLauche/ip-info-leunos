"use client";

import { getToolTranslation } from "@/lib/tool-i18n";
import type { Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { CircleCheck, Loader2, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ResolverPrivacy, RuntimeDnsScanResult } from "@/lib/runtime-dns";

function privacyBadge(level: ResolverPrivacy) {
  if (level === "high") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (level === "medium") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (level === "low") return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return "border-border bg-secondary text-muted-foreground";
}

interface ClientDnsScannerProps {
  locale: Locale;
}

export function ClientDnsScanner({ locale }: ClientDnsScannerProps) {
  const t = getToolTranslation(locale);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RuntimeDnsScanResult | null>(null);

  const runScan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/client-dns", { cache: "no-store" });
      const data = unwrapApiResponse<RuntimeDnsScanResult>(await response.json());

      setResult(data);
    } catch (scanError) {
      setError((scanError as Error).message || t.clientDnsNoData);
    } finally {
      setLoading(false);
    }
  }, [t.clientDnsNoData]);

  useEffect(() => {
    runScan();
  }, [runScan]);

  const privacyLabel = useMemo(() => {
    if (!result) return t.cdnConfidenceNa;
    if (result.privacyScore === null) return t.clientDnsUnknownPrivacy;
    if (result.privacyScore >= 80) return t.clientDnsStrong;
    if (result.privacyScore >= 55) return t.clientDnsModerate;
    return t.clientDnsWeak;
  }, [result, t]);

  const privacyTextByLevel: Record<ResolverPrivacy, string> = {
    high: t.clientDnsHighPrivacy,
    medium: t.clientDnsMediumPrivacy,
    low: t.clientDnsLowPrivacy,
    unknown: t.clientDnsUnknownPrivacyLabel,
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-xl border border-border/70 bg-card/60 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.clientDnsEstimate}</p>
        {loading ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.clientDnsScanning}
          </div>
        ) : result ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold text-foreground">
              {result.privacyScore === null ? t.clientDnsNotScored : `${result.privacyScore}/100`}
            </p>
            <p className="text-sm text-muted-foreground">{privacyLabel}</p>
            <p className="text-xs text-muted-foreground">
              {t.clientDnsCheckedAt} {new Date(result.checkedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </div>

      {result && (
        <>
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground">
            <p>
              <strong>{t.clientDnsEnvironmentPrefix}</strong> {t.clientDnsRuntimeEnvironment}
            </p>
            <p className="mt-2">
              <strong>{t.clientDnsMethodPrefix}</strong> {t.clientDnsMethodRuntime}
            </p>
            <p className="mt-2 text-amber-200">{t.clientDnsLeakTestCaveat}</p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-foreground">
            <p className="flex items-center gap-2 font-medium">
              <CircleCheck className="h-4 w-4 text-emerald-400" />
              <span>
                <strong>{t.clientDnsSummaryPrefix}</strong>{" "}
                {result.resolverCount === 0
                  ? t.clientDnsNoResolvers
                  : `${result.resolverCount} ${result.resolverCount === 1 ? t.clientDnsDetectedResolvers : t.clientDnsDetectedResolversPlural}` }
              </span>
            </p>
            {result.resolverCount > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {result.knownResolverCount} {t.clientDnsKnownResolvers},{" "}
                {result.unknownResolverCount} {t.clientDnsUnknownResolvers}
              </p>
            )}
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
                    {privacyTextByLevel[resolver.privacy]}
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
                    {t.clientDnsProviderPolicy}
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ShieldQuestion className="mt-0.5 h-4 w-4 text-primary" />
              {t.clientDnsGuidanceIntro}
            </p>
            <p className="mt-2 flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
              {t.clientDnsGuidancePrefer}
            </p>
            <p className="mt-2 flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-400" />
              {t.clientDnsGuidanceNetworks}
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
        {loading ? t.clientDnsScanning : t.clientDnsRescan}
      </button>
    </div>
  );
}
