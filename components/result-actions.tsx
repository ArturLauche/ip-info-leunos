"use client";

import { Download } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { getTranslation, type Locale } from "@/lib/i18n";
import { getToolTranslation } from "@/lib/tool-i18n";

/** Export on demand: serialization and Blob allocation happen only on click. */
export function ResultActions({
  data,
  copyText,
  filename,
  locale,
}: {
  data: unknown;
  copyText: string;
  filename: string;
  locale: Locale;
}) {
  const t = getToolTranslation(locale);
  const baseT = getTranslation(locale);

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename.replace(/[^a-z0-9._-]/gi, "_")}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    // Allow the browser to begin the download before releasing the Blob.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        text={copyText}
        label={t.copyValue}
        copiedLabel={baseT.copiedToClipboard}
        failedLabel={baseT.copyFailed}
        showLabel
        className="min-h-11 sm:min-h-8"
      />
      <Button type="button" variant="outline" size="sm" onClick={download} className="min-h-11 sm:min-h-8">
        <Download aria-hidden="true" />
        {t.downloadJson}
      </Button>
    </div>
  );
}
