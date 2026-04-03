import { fetchApi } from '@/lib/api';
import { VenueCard, CreateVenueCard } from '@/components/dashboard/venue-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Store } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  slug: string;
  _count?: {
    categories: number;
  };
  createdAt?: string;
}

export default async function DashboardPage() {
  let venues: Venue[] = [];

  try {
    venues = await fetchApi('/venues');
  } catch {
    venues = [];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your venues and menus
          </p>
        </div>
        {venues.length > 0 && (
          <Button asChild>
            <Link href="/venues/new">
              <Plus className="h-4 w-4 mr-2" />
              New Venue
            </Link>
          </Button>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Store className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-medium mb-2">No venues yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create your first venue to start building menus and accepting orders.
          </p>
          <CreateVenueCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
