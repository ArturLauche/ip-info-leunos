import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
}

export function InfoCard({ icon: Icon, label, value, detail }: InfoCardProps) {
  return (
    <div className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/50">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="truncate text-lg font-semibold text-foreground">{value}</p>
      {detail && (
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}
