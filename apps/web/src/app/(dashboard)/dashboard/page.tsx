import { fetchApi } from '@/lib/api';
import { VenueCard, CreateVenueCard } from '@/components/dashboard/venue-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
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
        <div>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have any venues yet. Create one to get started.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreateVenueCard />
          </div>
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
