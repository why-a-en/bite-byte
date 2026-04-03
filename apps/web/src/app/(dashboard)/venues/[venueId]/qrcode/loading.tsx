import { Skeleton } from '@/components/ui/skeleton';

export default function QRCodeLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <Skeleton className="h-64 w-64 rounded-lg" />
        <Skeleton className="h-9 w-40 mt-6" />
      </div>
    </div>
  );
}
