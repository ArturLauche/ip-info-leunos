import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  /** When provided, the value becomes a link to this route. */
  href?: string;
}

export function InfoCard({ icon: Icon, label, value, detail, href }: InfoCardProps) {
  return (
    <div className="group flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      {href ? (
        <Link
          href={href}
          className="truncate text-lg font-semibold text-primary transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {value}
        </Link>
      ) : (
        <p className="truncate text-lg font-semibold text-foreground">{value}</p>
      )}
      {detail && (
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}
