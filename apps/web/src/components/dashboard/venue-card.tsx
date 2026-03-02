import Link from 'next/link';
import { Store, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    slug: string;
    _count?: {
      categories: number;
    };
    createdAt?: string;
  };
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link href={`/venues/${venue.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                <Store className="h-4 w-4 text-brand" />
              </div>
              <CardTitle className="text-base">{venue.name}</CardTitle>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">Slug:</span> /{venue.slug}
            </p>
            {venue._count !== undefined && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Categories:</span>{' '}
                {venue._count.categories}
              </p>
            )}
            {venue.createdAt && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Created:</span>{' '}
                {new Date(venue.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CreateVenueCard() {
  return (
    <Link href="/venues/new">
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 group">
        <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand/10 transition-colors">
            <Store className="h-6 w-6 text-muted-foreground group-hover:text-brand transition-colors" />
          </div>
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Create your first venue
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
