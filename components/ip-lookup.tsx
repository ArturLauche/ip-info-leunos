"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { IpDisplay } from "@/components/ip-display";
import { ToolSearchForm } from "@/components/tool-search-form";
import { getTranslation, type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

interface IpLookupProps {
  locale: Locale;
  initialQuery?: string;
}

export function IpLookup({ locale, initialQuery }: IpLookupProps) {
  const sanitizedInitial = initialQuery?.trim() || "";
  const [submittedIp, setSubmittedIp] = useState<string | null>(
    sanitizedInitial || null,
  );
  const [isLookingUp, setIsLookingUp] = useState(false);
  const router = useRouter();
  const t = getTranslation(locale);
  const toolT = getToolTranslation(locale);

  // Re-run when the deep-linked query changes on the same route (e.g. the
  // command palette navigating /check → /check?q=…), which keeps the existing
  // component mounted and would otherwise ignore the new prop.
  useEffect(() => {
    setSubmittedIp(sanitizedInitial || null);
  }, [sanitizedInitial]);

  const handleLookup = (value: string) => {
    setSubmittedIp(value);
    // Reflect the query in the URL like every other tool so results stay
    // shareable and survive a refresh.
    router.replace(`/check?q=${encodeURIComponent(value)}`, { scroll: false });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={sanitizedInitial}
        placeholder={t.searchPlaceholder}
        submitLabel={t.searchButton}
        loadingLabel={toolT.lookupInProgress}
        loading={isLookingUp}
        onSubmit={handleLookup}
      />

      {submittedIp ? (
        <IpDisplay
          targetIp={submittedIp}
          locale={locale}
          onLoadingChange={setIsLookingUp}
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
