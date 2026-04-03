'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Order } from '@/actions/orders';

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  isNew?: boolean;
}

function formatRelativeTime(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  RECEIVED: 'border-l-blue-500',
  PREPARING: 'border-l-orange-500',
  READY: 'border-l-green-500',
};

const NEXT_BUTTON_LABELS: Record<string, string> = {
  RECEIVED: 'Start Preparing',
  PREPARING: 'Mark Ready',
  READY: 'Complete',
};

const NEXT_BUTTON_STATUS: Record<string, string> = {
  RECEIVED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
};

export function OrderCard({ order, onStatusUpdate, isNew = false }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [relativeTime, setRelativeTime] = useState(() => formatRelativeTime(order.createdAt));
  const [highlight, setHighlight] = useState(isNew);

  // Update relative time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(order.createdAt));
    }, 30_000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Remove highlight animation after 2 seconds
  useEffect(() => {
    if (!highlight) return;
    const timer = setTimeout(() => setHighlight(false), 2000);
    return () => clearTimeout(timer);
  }, [highlight]);

  const handleCardClick = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleNextClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextStatus = NEXT_BUTTON_STATUS[order.status];
      if (nextStatus) {
        onStatusUpdate(order.id, nextStatus);
      }
    },
    [order.id, order.status, onStatusUpdate],
  );

  const borderColor = STATUS_BORDER_COLORS[order.status] ?? 'border-l-gray-300';
  const nextLabel = NEXT_BUTTON_LABELS[order.status];
  const showCancel = order.status === 'RECEIVED' || order.status === 'PREPARING';

  return (
    <Card
      className={`cursor-pointer border-l-[3px] ${borderColor} shadow-sm hover:shadow-md transition-shadow ${highlight ? 'animate-pulse' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        {/* Collapsed view */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-sm bg-muted/50 px-1.5 py-0.5 rounded">{order.referenceCode}</span>
              <span className="text-sm font-medium truncate">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              <span>{relativeTime}</span>
              <span className="font-medium text-foreground">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground mt-0.5">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className="mt-3 border-t pt-3" onClick={(e) => e.stopPropagation()}>
            {/* Item list */}
            <ul className="space-y-1 mb-3">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.itemNameAtOrder} x{item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.unitPriceAtOrder * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {nextLabel && (
                <Button size="sm" onClick={handleNextClick}>
                  {nextLabel}
                </Button>
              )}

              {showCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. The order will be marked as cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => onStatusUpdate(order.id, 'CANCELLED')}
                      >
                        Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
