import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

interface ResultPanelProps {
  title: ReactNode;
  children: ReactNode;
}

export function ResultPanel({ title, children }: ResultPanelProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm">
      <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <CircleCheck className="h-5 w-5 text-emerald-400" />
        {title}
      </p>
      {children}
    </div>
  );
}
