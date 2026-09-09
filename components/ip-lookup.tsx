"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { IpDisplay } from "@/components/ip-display";
import { ToolSearchForm } from "@/components/tool-search-form";
import { getTranslation, type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";
import { useToolQuery } from "@/hooks/use-tool-query";

interface IpLookupProps {
  locale: Locale;
  initialQuery?: string;
}

export function IpLookup({ locale, initialQuery }: IpLookupProps) {
  const router = useRouter();
  const sanitizedInitial = initialQuery?.trim() || "";
  const [submittedIp, setSubmittedIp] = useState<string | null>(
    sanitizedInitial || null,
  );
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(0);
  const { querySync, markSubmitted } = useToolQuery(initialQuery);
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);

  // Re-run when the deep-linked query changes on the same route (e.g. the
  // command palette navigating /check → /check?q=…), which keeps the existing
  // component mounted and would otherwise ignore the new prop.
  useEffect(() => {
    setSubmittedIp(querySync.query || null);
    // A cleared deep link unmounts IpDisplay, whose loading callback can no
    // longer fire — reset the spinner so the form never stays stuck.
    if (!querySync.query) setLoading(false);
  }, [querySync]);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={querySync.query}
        syncKey={querySync.revision}
        placeholder={t.searchPlaceholder}
        submitLabel={t.searchButton}
        loadingLabel={toolT.lookupInProgress}
        loading={loading}
        cancelLabel={toolT.cancelLookup}
        onCancel={() => {
          setSubmittedIp(null);
          setLoading(false);
        }}
        onSubmit={(value) => {
          markSubmitted(value);
          setSubmission((previous) => previous + 1);
          setSubmittedIp(value);
          // Deep-link the query like useToolLookup does for the other tools
          // so results are shareable and survive refresh/back/forward.
          router.replace(`/check?q=${encodeURIComponent(value)}`, {
            scroll: false,
          });
        }}
      />

      {submittedIp ? (
        <IpDisplay
          key={submission}
          targetIp={submittedIp}
          locale={locale}
          onLoadingChange={setLoading}
        />
      ) : (
        <EmptyState
          icon={Search}
          title={t.checkEmptyTitle ?? t.checkTitle}
          description={t.checkEmptyDescription ?? t.checkSubtitle}
        />
      )}
    </div>
  );
}
