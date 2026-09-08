"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared clipboard button for checker results. Extracted from the IpDisplay
 * copy button so DNS/WHOIS/CDN/reputation rows share one tested behavior:
 * clipboard write, success/error toast, transient check icon.
 */
export function CopyButton({
  text,
  label,
  copiedLabel,
  failedLabel,
  className,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(copiedLabel);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(failedLabel);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label={label}
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}

/** Copies the current deep-link URL so results are shareable. */
export function CopyLinkButton({
  href,
  label,
  copiedLabel,
  failedLabel,
}: {
  href: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    try {
      const absolute = new URL(href, window.location.origin).toString();
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      toast.success(copiedLabel);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(failedLabel);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleCopy}>
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Link2 className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}

/** Downloads a result payload as formatted JSON (client-side Blob, no endpoint). */
export function DownloadJsonButton({
  data,
  filename,
  label,
}: {
  data: unknown;
  filename: string;
  label: string;
}) {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleDownload}>
      <Download className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}

/** One-click example queries for empty states (dead CTA slot until now). */
export function ExampleQueries({
  examples,
  onSelect,
  label,
}: {
  examples: string[];
  onSelect: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      {examples.map((example) => (
        <Button
          key={example}
          type="button"
          variant="outline"
          size="sm"
          className="font-mono"
          onClick={() => onSelect(example)}
        >
          {example}
        </Button>
      ))}
    </div>
  );
}
