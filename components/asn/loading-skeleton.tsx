import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {/* Overview */}
      <Card className="gap-0 overflow-hidden py-0" aria-hidden="true">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <Skeleton className="size-11 rounded-xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-56 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-border/60 pt-5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="border-t bg-muted/30 px-5 py-3 sm:px-6">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="hidden h-5 w-28 rounded-full sm:block" />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="hidden h-9 w-36 rounded-lg sm:block" />
          <Skeleton className="hidden h-9 w-36 rounded-lg lg:block" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, col) => (
            <Card key={col} className="gap-0 overflow-hidden py-0">
              <div className="border-b bg-muted/30 px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col px-4 py-2">
                {Array.from({ length: 5 }).map((_, row) => (
                  <div key={row} className="flex flex-col gap-2 border-b py-3 last:border-b-0">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
