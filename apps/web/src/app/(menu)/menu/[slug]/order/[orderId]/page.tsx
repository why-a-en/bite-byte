import { notFound } from 'next/navigation';
import { fetchPublicApi } from '@/lib/api-public';
import { OrderStatus } from '@/components/ordering/order-status';

export interface PublicOrder {
  id: string;
  referenceCode: string;
  status: 'PENDING_PAYMENT' | 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    itemNameAtOrder: string;
    unitPriceAtOrder: string;
    quantity: number;
  }>;
}

interface PageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { slug, orderId } = await params;

  let order: PublicOrder;
  try {
    order = await fetchPublicApi(`/public/venues/${slug}/orders/${orderId}`, {
      cache: 'no-store',
    });
  } catch {
    // Catches both 404 (not found) and 403 (wrong slug) — both become 404 to prevent cross-venue snooping
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Order Status</h1>
        <p className="text-gray-400 text-sm mb-6">
          Sit tight — we&apos;ll keep you updated.
        </p>
        <OrderStatus order={order} venueSlug={slug} />
      </div>
    </div>
  );
}
