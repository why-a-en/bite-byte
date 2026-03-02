import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { VenueSettingsForm } from '@/components/dashboard/venue-settings-form';
import { Badge } from '@/components/ui/badge';

interface Venue {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  paymentMode: 'PREPAY_REQUIRED' | 'PAY_AT_COUNTER' | 'BOTH';
  createdAt: string;
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  PREPAY_REQUIRED: 'Prepay Required',
  PAY_AT_COUNTER: 'Pay at Counter',
  BOTH: 'Both',
};

export default async function VenueSettingsPage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;

  let venue: Venue;
  try {
    venue = await fetchApi(`/venues/${venueId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('404') || message.includes('not found')) {
      notFound();
    }
    // If unauthorized or other error, show not found
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{venue.name}</h1>
          <Badge variant="outline">{PAYMENT_MODE_LABELS[venue.paymentMode]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Created {new Date(venue.createdAt).toLocaleDateString()}
        </p>
      </div>

      <VenueSettingsForm venue={venue} />
    </div>
  );
}
