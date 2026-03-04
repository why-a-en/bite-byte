import { fetchOrderHistory } from '@/actions/analytics';
import { OrderHistoryTable } from '@/components/dashboard/order-history-table';

export default async function OrderHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const { venueId } = await params;
  const { from, to, page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const data = await fetchOrderHistory(venueId, {
    from,
    to,
    page: currentPage,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and filter all orders for this venue
        </p>
      </div>

      <OrderHistoryTable
        venueId={venueId}
        initialData={data}
        initialFrom={from ?? ''}
        initialTo={to ?? ''}
      />
    </div>
  );
}
