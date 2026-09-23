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
  /** A stable accessible name for the single-field form. */
  label?: string;
  /** Client-side validation message associated with the input. */
  inputError?: string | null;
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
  label,
  inputError,
}: ToolSearchFormProps) {
  const [value, setValue] = useState(initialValue);
  const inputId = "tool-query";
  const errorId = `${inputId}-error`;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, syncKey]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-wrap flex-col gap-2.5 sm:flex-row",
        compact &&
          "flex-row flex-wrap gap-2 rounded-lg border border-border/70 bg-muted/20 p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-ring/30",
      )}
      aria-busy={loading}
    >
      <label htmlFor={inputId} className="sr-only">
        {label || placeholder}
      </label>
      <div className="relative min-w-0 flex-1">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground",
            compact && "left-3",
          )}
          aria-hidden="true"
        />
        <Input
          id={inputId}
          name="q"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={label || placeholder}
          aria-invalid={inputError ? true : undefined}
          aria-describedby={inputError ? errorId : undefined}
          autoComplete="off"
          autoCapitalize="off"
          enterKeyHint="search"
          spellCheck={false}
          className={cn(
            "h-11 bg-card pl-10 text-sm dark:bg-card",
            compact &&
              "border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent",
          )}
        />
      </div>
      <Button
        type="submit"
        size={compact ? "default" : "lg"}
        variant={compact ? "outline" : "default"}
        disabled={loading || !value.trim()}
        className={cn("h-11 shrink-0 sm:min-w-36", compact && "h-10 sm:min-w-32")}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
          className={cn("h-11 shrink-0", compact && "h-10")}
        >
          {cancelLabel}
        </Button>
      )}
      {inputError && (
        <p id={errorId} role="alert" className="basis-full px-1 text-xs text-destructive">
          {inputError}
        </p>
      )}
    </form>
  );
}
