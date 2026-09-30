import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the result layout piece for piece — identity block, metrics band,
// provenance strip, then the flat tab bar and three routing columns — so
// nothing jumps when the data lands.
export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>

      <Card className="gap-0 overflow-hidden p-0" aria-hidden="true">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-6 w-64 max-w-full sm:h-7" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3.5 border-t border-border/60 pt-4">
            {["w-24", "w-14", "w-16", "w-24", "w-28"].map((width, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className={`h-4 ${width}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/60 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5 bg-card px-5 py-3.5 sm:px-6 sm:py-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-16 sm:h-7" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-border/60 bg-muted/30 px-5 py-3 sm:px-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-48 max-w-[50%]" />
        </div>
      </Card>

      <div aria-hidden="true" className="flex flex-col">
        <div className="flex gap-1 overflow-hidden border-b border-border">
          {["w-14", "w-16", "w-20", "w-16", "w-24"].map((width, i) => (
            <div key={i} className="flex min-h-11 items-center gap-2 px-3 sm:min-h-10">
              <Skeleton className={`h-3.5 ${width}`} />
              {i < 4 && <Skeleton className="h-3 w-6" />}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5 pt-5 sm:pt-6">
          <Skeleton className="h-3 w-full max-w-lg" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 xl:gap-8">
            {Array.from({ length: 3 }).map((_, column) => (
              <div key={column} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-sm" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="flex flex-col pt-2.5">
                  {Array.from({ length: 6 }).map((_, row) => (
                    <div key={row} className="flex min-h-9 items-center justify-between gap-3 py-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
