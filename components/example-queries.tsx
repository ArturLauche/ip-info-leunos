"use client";

import { Button } from "@/components/ui/button";

interface ExampleQueriesProps {
  examples: readonly string[];
  label: string;
  onSelect: (value: string) => void;
}

/**
 * A small first-use shortcut for tools that accept a public host or IP. The
 * examples are deliberately rendered as quiet actions rather than another
 * decorative card: they give the empty state a useful next step.
 */
export function ExampleQueries({ examples, label, onSelect }: ExampleQueriesProps) {
  if (examples.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap justify-center gap-2">
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
    </div>
  );
}
