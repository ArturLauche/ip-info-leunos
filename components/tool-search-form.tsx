"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ToolSearchFormProps {
  initialValue?: string;
  /** Changes only for external navigation, including a reset to the same value. */
  syncKey?: number;
  placeholder: string;
  submitLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  cancelLabel?: string;
  /**
   * Shrinks the control to a quiet toolbar once a result owns the screen
   * (used by the ASN checker after a successful lookup).
   */
  compact?: boolean;
}

/**
 * Shared single-field search form for the tool pages. Name the input directly
 * to avoid a clipped one-pixel label box painting beside it at reduced zoom.
 */
export function ToolSearchForm({
  initialValue = "",
  syncKey = 0,
  placeholder,
  submitLabel,
  loadingLabel,
  loading = false,
  onSubmit,
  onCancel,
  cancelLabel,
  compact = false,
}: ToolSearchFormProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, syncKey]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  // In the compact toolbar the submit action stays quiet until the query is
  // edited, so the result below keeps the visual lead.
  const edited = value.trim() !== initialValue.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-2.5 sm:flex-row",
        compact && "flex-row flex-wrap gap-2 sm:flex-nowrap",
      )}
      aria-busy={loading}
    >
      <div className={cn("relative flex-1", compact && "min-w-0 basis-48")}>
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground",
            compact && "left-3",
          )}
          aria-hidden="true"
        />
        <Input
          id="tool-query"
          name="q"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          enterKeyHint="search"
          spellCheck={false}
          className={cn(
            "h-11 bg-card pl-10 text-sm dark:bg-card",
            compact && "h-9 pl-9 text-[13px] pointer-coarse:h-11",
          )}
        />
      </div>
      <Button
        type="submit"
        size={compact ? "default" : "lg"}
        variant={compact && !edited ? "outline" : "default"}
        disabled={loading || !value.trim()}
        className={cn("h-11 shrink-0 sm:min-w-36", compact && "h-9 sm:min-w-28 pointer-coarse:h-11")}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {loadingLabel || submitLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
      {loading && onCancel && cancelLabel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className={cn("h-11 shrink-0", compact && "h-9 pointer-coarse:h-11")}
        >
          {cancelLabel}
        </Button>
      )}
    </form>
  );
}
