import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
}

export function InfoCard({ icon: Icon, label, value, detail }: InfoCardProps) {
  return (
    <Card className="gap-0 py-0 transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className="truncate text-base font-semibold text-foreground" title={value}>
          {value}
        </p>
        {detail && <p className="truncate text-xs text-muted-foreground">{detail}</p>}
      </div>
    </Card>
  );
}
