import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the redesigned result layout — summary card (identity + metrics
// band) followed by the tabbed detail card — so the shimmer keeps the final
// shape stable and perceived layout shift stays minimal.
export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>

      <Card className="gap-0 overflow-hidden p-0" aria-hidden="true">
        <div className="flex flex-col gap-3.5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-9 rounded-xl sm:size-10" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-32 sm:h-8" />
                <Skeleton className="h-4 w-44 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="ml-12 h-4 w-2/3 max-w-md sm:ml-13" />
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 bg-card p-4 sm:p-5">
              <Skeleton className="order-1 h-7 w-16" />
              <Skeleton className="order-2 h-3 w-20" />
              <Skeleton className="order-3 hidden h-3 w-24 lg:block" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6" aria-hidden="true">
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-b-0">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
