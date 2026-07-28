const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-ink-600/10 dark:bg-paper-200/10 ${className}`} />
);

export const ProblemRowSkeleton = () => (
  <div className="flex items-center justify-between gap-4 border-b border-ink-600/10 px-4 py-4 dark:border-paper-200/10">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
      <Skeleton className="h-4 w-48 max-w-full" />
    </div>
    <Skeleton className="hidden h-4 w-16 sm:block" />
    <Skeleton className="hidden h-4 w-20 md:block" />
    <Skeleton className="h-5 w-14 rounded-full" />
  </div>
);

export const ProblemListSkeleton = ({ rows = 8 }) => (
  <div className="card overflow-hidden">
    {Array.from({ length: rows }).map((_, i) => (
      <ProblemRowSkeleton key={i} />
    ))}
  </div>
);

export const ProblemDetailSkeleton = () => (
  <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <Skeleton className="h-6 w-2/3" />
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <div className="mt-8 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <Skeleton className="mt-8 h-40 w-full" />
  </div>
);

export default Skeleton;
