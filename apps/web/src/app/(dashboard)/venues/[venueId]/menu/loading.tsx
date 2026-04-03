import { Skeleton } from '@/components/ui/skeleton';

export default function MenuLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg border" />
        ))}
      </div>
    </div>
  );
}
