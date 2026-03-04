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

  let initialOrders = await fetchActiveOrders(venueId).catch(() => []);

  return (
    <div className="flex flex-col h-full">
      <OrdersBoard
        venueId={venueId}
        initialOrders={initialOrders}
        token={token}
      />
    </div>
  );
}
