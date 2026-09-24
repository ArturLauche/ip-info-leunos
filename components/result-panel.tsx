import { CircleCheck, CircleHelp, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResultTone = "success" | "info" | "warning" | "neutral";

interface ResultPanelProps {
  title: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: ResultTone;
  className?: string;
}

const toneStyles: Record<ResultTone, { icon: typeof CircleCheck; className: string }> = {
  success: { icon: CircleCheck, className: "text-success" },
  info: { icon: Info, className: "text-info" },
  warning: { icon: TriangleAlert, className: "text-warning" },
  neutral: { icon: CircleHelp, className: "text-muted-foreground" },
};

/**
 * The shared result grammar for the simpler tools. A result has one clear
 * headline, an optional explanation/action row, and a flat body; nested cards
 * are left to genuinely independent data groups such as ASN sections.
 */
export function ResultPanel({
  title,
  children,
  description,
  actions,
  tone = "success",
  className,
}: ResultPanelProps) {
  const { icon: Icon, className: iconClassName } = toneStyles[tone];

  return (
    <Card className={cn("tool-reveal gap-0 overflow-hidden py-0 shadow-none", className)}>
      <div
        className="flex flex-col items-start gap-3 border-b bg-muted/30 px-5 py-3.5 sm:flex-row sm:flex-nowrap"
        aria-live="polite"
        aria-atomic="true"
      >
        <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", iconClassName)} />
        <div className="min-w-0 flex-1">
          <h2 className="min-w-0 max-w-full text-sm font-semibold break-all [overflow-wrap:anywhere] text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{actions}</div>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  );
}
