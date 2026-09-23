import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the final ASN brief and detail workspace so loading has low layout shift. */
export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>

      <Card className="gap-0 overflow-hidden p-0" aria-hidden="true">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <Skeleton className="size-10 shrink-0 rounded-xl sm:size-11" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-3/4 max-w-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-1.5 bg-card p-4 sm:p-5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="hidden h-3 w-24 lg:block" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-border/60 px-5 py-3.5 sm:px-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6" aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="hidden h-3 w-20 sm:block" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
          {Array.from({ length: 3 }).map((_, column) => (
            <div key={column} className="flex flex-col gap-3">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-b-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
