import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      <div className="space-y-0">
        {/* Table header */}
        <div className="flex gap-4 px-4 py-3 border-b">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-3 border-b">
            {Array.from({ length: 5 }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
