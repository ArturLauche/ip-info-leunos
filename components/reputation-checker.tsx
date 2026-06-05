"use client";

import { type Locale } from "@/lib/i18n";
import { unwrapApiResponse } from "@/lib/api/client";
import { getToolTranslation } from "@/lib/tool-i18n";
import { ErrorPanel } from "@/components/error-panel";
import { ToolSearchForm } from "@/components/tool-search-form";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Fingerprint,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Source {
  name: string;
  status: "clean" | "suspicious" | "listed" | "unknown" | "not_configured" | "error";
  score?: number;
  reason?: string;
  checkedAt: string;
}

interface ReputationResult {
  ip: string;
  hostname?: string;
  risk: "low" | "medium" | "high" | "unknown";
  score: number | null;
  sources: Source[];
  checkedAt: string;
}

interface ReputationCheckerProps {
  locale: Locale;
  initialIp?: string;
}

function statusColor(status: Source["status"]) {
  switch (status) {
    case "clean":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
    case "suspicious":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    case "listed":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    case "unknown":
      return "border-sky-500/40 bg-sky-500/10 text-sky-300";
    case "error":
      return "border-red-500/40 bg-red-500/10 text-red-300";
    case "not_configured":
      return "border-sky-500/40 bg-sky-500/10 text-sky-300";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

function riskIcon(risk: ReputationResult["risk"]) {
  if (risk === "high") return <ShieldAlert className="h-6 w-6 text-red-400" />;
  if (risk === "medium") return <Shield className="h-6 w-6 text-amber-400" />;
  if (risk === "low") return <ShieldCheck className="h-6 w-6 text-emerald-400" />;
  return <ShieldQuestion className="h-6 w-6 text-sky-400" />;
}

function formatDate(iso: string, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ReputationChecker({ locale, initialIp = "" }: ReputationCheckerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReputationResult | null>(null);
  const t = getToolTranslation(locale);

  const runCheck = useCallback(
    async (ip: string, updateUrl = true) => {
      const trimmed = ip.trim();
      if (!trimmed) return;

      setLoading(true);
      setError(null);
      setResult(null);

      if (updateUrl) {
        router.replace(`/reputation?ip=${encodeURIComponent(trimmed)}`, { scroll: false });
      }

      try {
        const response = await fetch(`/api/reputation?ip=${encodeURIComponent(trimmed)}`);
        const data = unwrapApiResponse<ReputationResult>(await response.json());
        setResult(data);
      } catch (checkError) {
        setError((checkError as Error).message || t.reputationNetworkError);
      } finally {
        setLoading(false);
      }
    },
    [router, t.reputationNetworkError],
  );

  useEffect(() => {
    if (initialIp.trim()) {
      runCheck(initialIp, false);
    }
  }, [initialIp, runCheck]);

  return (
    <div className="flex w-full flex-col gap-8">
      <ToolSearchForm
        initialValue={initialIp}
        placeholder={t.reputationPlaceholder}
        submitLabel={t.reputationLookupButton}
        loadingLabel={t.reputationLookingUp}
        loading={loading}
        onSubmit={(value) => runCheck(value)}
      />

      {error && <ErrorPanel message={error} />}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {riskIcon(result.risk)}
              <p className="text-lg font-semibold text-foreground">
                {t.reputationRiskLabel.replace("{risk}",
                  result.risk === "low"
                    ? t.reputationRiskLow
                    : result.risk === "medium"
                      ? t.reputationRiskMedium
                      : result.risk === "high"
                        ? t.reputationRiskHigh
                        : t.reputationRiskUnknown,
                )}
              </p>
              {typeof result.score === "number" && (
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                  Score {result.score}/100
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.reputationDisclaimer}
            </p>
          </div>

          {result.sources.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">{t.reputationSources}</p>
              {result.sources.map((source) => (
                <div
                  key={source.name}
                  className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">{source.name}</p>
                    </div>
                    {source.reason && (
                      <p className="text-xs text-muted-foreground">{source.reason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {typeof source.score === "number" && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {source.score}/100
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${statusColor(source.status)}`}
                    >
                      {source.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs font-medium">{t.reputationSourcesDisclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
