import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-8" />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {Array.from({ length: 3 }).map((_, col) => (
            <div key={col} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              <div className="space-y-2 flex-1">
                {Array.from({ length: 2 }).map((_, row) => (
                  <Skeleton key={row} className="h-28 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
