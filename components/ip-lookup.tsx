"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { IpDisplay } from "@/components/ip-display";
import { ToolSearchForm } from "@/components/tool-search-form";
import { getTranslation, type Locale } from "@/lib/i18n";

interface IpLookupProps {
  locale: Locale;
  initialQuery?: string;
}

export function IpLookup({ locale, initialQuery }: IpLookupProps) {
  const sanitizedInitial = initialQuery?.trim() || "";
  const [submittedIp, setSubmittedIp] = useState<string | null>(
    sanitizedInitial || null,
  );
  const t = getTranslation(locale);

  return (
    <div className="flex w-full flex-col gap-6">
      <ToolSearchForm
        initialValue={sanitizedInitial}
        placeholder={t.searchPlaceholder}
        submitLabel={t.searchButton}
        onSubmit={(value) => setSubmittedIp(value)}
      />

      {submittedIp ? (
        <IpDisplay targetIp={submittedIp} locale={locale} />
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
