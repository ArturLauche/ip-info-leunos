import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {/* Hero header */}
      <Card className="gap-0 overflow-hidden py-0" aria-hidden="true">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 p-6">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3 p-5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>

      {/* Routing columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, col) => (
          <Card key={col} className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            {Array.from({ length: 4 }).map((_, row) => (
              <div key={row} className="flex flex-col gap-2 border-b py-3.5 last:border-b-0">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
