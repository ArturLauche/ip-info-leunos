"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared clipboard feedback for technical values and complete results. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  failedLabel,
  className,
  showLabel = false,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCopied(false);
    return () => clearTimeout(resetTimer.current);
  }, [text]);

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
      variant={showLabel ? "outline" : "ghost"}
      size={showLabel ? "sm" : "icon"}
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {showLabel && label}
    </Button>
  );
}
