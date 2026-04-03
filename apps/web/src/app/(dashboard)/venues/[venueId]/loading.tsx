import { Skeleton } from '@/components/ui/skeleton';

export default function VenueSettingsLoading() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-40 mt-2" />
      </div>

      <div className="space-y-6">
        <div className="space-y-4 max-w-lg">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
