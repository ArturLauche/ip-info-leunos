import { CircleCheck, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultPanelProps {
  title: ReactNode;
  children: ReactNode;
  /** "warning" marks a completed lookup that found nothing usable. */
  status?: "success" | "warning";
}

export function ResultPanel({ title, children, status = "success" }: ResultPanelProps) {
  const StatusIcon = status === "warning" ? TriangleAlert : CircleCheck;

  return (
    <Card className="tool-reveal gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
        <StatusIcon
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0",
            status === "warning" ? "text-warning" : "text-success",
          )}
        />
        <h2 className="min-w-0 text-sm font-semibold break-words [overflow-wrap:anywhere] text-foreground">{title}</h2>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  );
}
