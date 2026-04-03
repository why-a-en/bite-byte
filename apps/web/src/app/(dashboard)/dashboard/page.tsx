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
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your venues and menus
          </p>
        </div>
        {venues.length > 0 && (
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
          >
            <Link href="/venues/new">
              <Plus className="h-4 w-4 mr-2" />
              New Venue
            </Link>
          </Button>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
            <Store className="h-7 w-7 text-gray-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            No venues yet
          </h2>
          <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
            Create your first venue to start building menus and accepting
            orders.
          </p>
          <CreateVenueCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
