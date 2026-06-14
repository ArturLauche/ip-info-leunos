import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface ResultPanelProps {
  title: ReactNode;
  children: ReactNode;
}

export function ResultPanel({ title, children }: ResultPanelProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
        <CircleCheck className="size-4 shrink-0 text-success" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  );
}
