import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                'h-4 rounded',
                j === 0 ? 'w-1/4' : j === cols - 1 ? 'w-1/6' : 'w-1/3'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-border/60 dark:border-white/[0.06] p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-border/60 dark:border-white/[0.06] p-6 space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <TableSkeleton rows={4} cols={3} />
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-border/60 dark:border-white/[0.06] p-6 space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <TableSkeleton rows={4} cols={3} />
        </div>
      </div>
    </div>
  );
}
