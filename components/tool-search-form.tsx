"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ToolSearchFormProps {
  initialValue?: string;
  placeholder: string;
  submitLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
}

export function ToolSearchForm({
  initialValue = "",
  placeholder,
  submitLabel,
  loadingLabel,
  loading = false,
  onSubmit,
}: ToolSearchFormProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-2.5 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="h-11 pl-10 text-sm"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-11 shrink-0 sm:min-w-36"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingLabel || submitLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
