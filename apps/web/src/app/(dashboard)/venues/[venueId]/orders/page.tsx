import { cookies } from 'next/headers';
import { fetchActiveOrders } from '@/actions/orders';
import { OrdersBoard } from '@/components/dashboard/orders-board';

interface PageProps {
  params: Promise<{ venueId: string }>;
}

export default async function OrdersPage({ params }: PageProps) {
  const { venueId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  const initialOrders = await fetchActiveOrders(venueId).catch(() => []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Live Orders
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage incoming orders in real time
        </p>
      </div>
      <OrdersBoard
        venueId={venueId}
        initialOrders={initialOrders}
        token={token}
      />
    </div>
  );
}
