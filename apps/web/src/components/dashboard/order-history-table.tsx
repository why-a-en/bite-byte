'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OrderHistoryItem } from '@/actions/analytics';

interface OrderHistoryTableProps {
  venueId: string;
  initialData: {
    orders: OrderHistoryItem[];
    total: number;
    page: number;
    pageSize: number;
  };
  initialFrom?: string;
  initialTo?: string;
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function OrderHistoryTable({
  venueId: _venueId,
  initialData,
  initialFrom = '',
  initialTo = '',
}: OrderHistoryTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const totalPages = Math.ceil(initialData.total / initialData.pageSize);

  function buildUrl(params: {
    from?: string;
    to?: string;
    page?: number;
  }) {
    const sp = new URLSearchParams();
    const from = params.from ?? fromDate;
    const to = params.to ?? toDate;
    const page = params.page ?? initialData.page;
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    if (page !== 1) sp.set('page', String(page));
    const qs = sp.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }

  function handleFilter() {
    router.push(buildUrl({ page: 1 }));
  }

  function handleClear() {
    setFromDate('');
    setToDate('');
    router.push(pathname);
  }

  function handlePrev() {
    if (initialData.page <= 1) return;
    router.push(buildUrl({ page: initialData.page - 1 }));
  }

  function handleNext() {
    if (initialData.page >= totalPages) return;
    router.push(buildUrl({ page: initialData.page + 1 }));
  }

  return (
    <div className="space-y-4">
      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border bg-card">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <Button onClick={handleFilter} size="sm">
          Filter
        </Button>
        {(fromDate || toDate) && (
          <Button onClick={handleClear} size="sm" variant="outline">
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {initialData.orders.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border bg-card py-12">
          <p className="text-sm text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialData.orders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() =>
                        setExpandedRow(
                          expandedRow === order.id ? null : order.id,
                        )
                      }
                    >
                      <td className="px-4 py-3 font-mono font-medium">
                        {order.referenceCode}
                      </td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                    {expandedRow === order.id && (
                      <tr key={`${order.id}-expanded`} className="bg-muted/20">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="text-xs space-y-1.5">
                            <p className="font-semibold text-foreground mb-2">
                              Order items:
                            </p>
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-muted-foreground"
                              >
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span>
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {initialData.total} total orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={initialData.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {initialData.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={initialData.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
