import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the result layout piece for piece — identity block, metrics band,
// provenance strip, then the tabbed detail card with its underline bar and
// three routing columns — so nothing jumps when the data lands.
export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>

      <Card className="gap-0 overflow-hidden p-0" aria-hidden="true">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-[1.625rem] w-36 sm:h-[1.875rem] sm:w-40" />
            <Skeleton className="mt-1 h-5 w-56 max-w-full sm:h-6" />
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

      <Card className="gap-0 p-0" aria-hidden="true">
        <div className="grid grid-cols-3 gap-1 border-b border-border/70 px-2 sm:flex sm:gap-1 sm:px-3">
          {["w-16", "w-20", "w-16"].map((width, i) => (
            <div key={i} className="flex min-h-14 flex-col items-center justify-center gap-1.5 px-1.5 sm:min-h-12 sm:flex-row sm:px-3">
              <Skeleton className={`h-3.5 ${width}`} />
              <Skeleton className="h-3.5 w-8 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <Skeleton className="h-3 w-full max-w-lg" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 xl:gap-8">
            {Array.from({ length: 3 }).map((_, column) => (
              <div key={column} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-md" />
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
      </Card>
    </div>
  );
}
