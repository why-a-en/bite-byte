'use client';

import { BarChart, Bar, XAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DailyVolume {
  date: string;
  count: number;
}

interface OrderVolumeChartProps {
  data: DailyVolume[];
}

const chartConfig: ChartConfig = {
  count: {
    label: 'Orders',
    color: 'hsl(var(--chart-1))',
  },
};

export function OrderVolumeChart({ data }: OrderVolumeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Volume</CardTitle>
        <CardDescription>Orders per day</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No order data yet</p>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => d.slice(5)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
