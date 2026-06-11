export function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      {/* Hero Header Skeleton */}
      <div className="flex h-36 flex-col justify-between rounded-2xl border border-border/40 bg-card/25 p-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
        </div>
        <div className="mt-3 h-8 w-2/3 rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-1/3 rounded-md bg-muted" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex h-28 flex-col justify-between rounded-2xl border border-border/40 bg-card/25 p-5">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="mt-2 h-7 w-20 rounded bg-muted" />
            <div className="mt-3 h-3 w-full rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Routing Section Skeleton */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/25 p-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-5 w-8 rounded-full bg-muted" />
            </div>
            {Array.from({ length: 4 }).map((_, row) => (
              <div key={row} className="flex flex-col gap-2 rounded-xl border border-border/30 bg-card/10 p-3.5">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="mt-1 h-3 w-full rounded bg-muted" />
                <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
