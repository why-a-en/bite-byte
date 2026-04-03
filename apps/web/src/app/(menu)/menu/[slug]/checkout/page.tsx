import { notFound } from 'next/navigation';
import { fetchPublicApi } from '@/lib/api-public';
import { CheckoutForm } from '@/components/ordering/checkout-form';
import type { PublicVenue } from '../page';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { slug } = await params;

  let venue: Pick<PublicVenue, 'id' | 'name' | 'slug' | 'paymentMode'>;
  try {
    venue = await fetchPublicApi(`/public/venues/${slug}/menu`);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Branded header */}
        <div className="flex items-center gap-3 mb-6">
          <a
            href={`/menu/${slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            aria-label="Back to menu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Checkout</h1>
            <p className="text-xs text-gray-400 font-medium">{venue.name}</p>
          </div>
        </div>
        <CheckoutForm venue={venue} />
      </div>
    </div>
  );
}
