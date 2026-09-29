"use client";

import { Download } from "lucide-react";
import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

/**
 * Export on demand: serialization and Blob allocation happen only on click.
 * Without `copyText` the button copies the same JSON that Download saves.
 */
export function ResultActions({
  data,
  copyText,
  filename,
}: {
  data: unknown;
  copyText?: string;
  filename: string;
}) {
  const { tool: t, core: baseT } = useI18n();
  // Stable per `data`, so re-renders neither serialize nor reset the "copied" mark.
  const serialize = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const download = () => {
    const blob = new Blob([serialize() + "\n"], { type: "application/json" });
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
        text={copyText ?? serialize}
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
