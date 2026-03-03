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
        <div className="flex items-center gap-3 mb-6">
          <a href={`/menu/${slug}`} className="text-gray-500 hover:text-gray-900">
            &larr; Back
          </a>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
        <CheckoutForm venue={venue} />
      </div>
    </div>
  );
}
