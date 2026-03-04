import { PoundSterling } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RevenueCardsProps {
  revenue: {
    today: number;
    week: number;
    month: number;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

function RevenueCard({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <PoundSterling className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
      </CardContent>
    </Card>
  );
}

export function RevenueCards({ revenue }: RevenueCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RevenueCard title="Today" amount={revenue.today} />
      <RevenueCard title="This Week" amount={revenue.week} />
      <RevenueCard title="This Month" amount={revenue.month} />
    </div>
  );
}
