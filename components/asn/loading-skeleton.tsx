import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the redesigned result layout: one summary card (identity + 4 stats)
// followed by tabbed content, so loading shimmer matches the final shape.
export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Card className="flex flex-col gap-5 p-5 sm:p-6" aria-hidden="true">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:p-6" aria-hidden="true">
        <Skeleton className="h-9 w-full max-w-md rounded-lg" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
