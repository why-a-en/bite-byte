import { fetchRevenue, fetchTopItems, fetchDailyVolume } from '@/actions/analytics';
import { RevenueCards } from '@/components/dashboard/analytics/revenue-cards';
import { TopItemsList } from '@/components/dashboard/analytics/top-items-list';
import { OrderVolumeChart } from '@/components/dashboard/analytics/order-volume-chart';

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;

  const [revenue, topItems, dailyVolume] = await Promise.all([
    fetchRevenue(venueId),
    fetchTopItems(venueId),
    fetchDailyVolume(venueId, 7),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Business performance overview for your venue
        </p>
      </div>

      <RevenueCards revenue={revenue} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderVolumeChart data={dailyVolume} />
        <TopItemsList items={topItems} />
      </div>
    </div>
  );
}
