import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  index?: number;
}

export function InfoCard({ icon: Icon, label, value, detail, index = 0 }: InfoCardProps) {
  return (
    <div
      className="animate-fade-in-up group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="truncate text-lg font-semibold tracking-tight text-foreground">{value}</p>
      {detail && (
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}
