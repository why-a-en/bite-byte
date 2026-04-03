import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { VenueSettingsForm } from '@/components/dashboard/venue-settings-form';

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
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {venue.name}
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
            {PAYMENT_MODE_LABELS[venue.paymentMode]}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Created {new Date(venue.createdAt).toLocaleDateString()}
        </p>
      </div>

      <VenueSettingsForm venue={venue} />
    </div>
  );
}
