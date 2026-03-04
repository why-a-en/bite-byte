'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { socket } from '@/lib/socket';
import type { PublicOrder } from '@/app/(menu)/menu/[slug]/order/[orderId]/page';

const STEPS = [
  { status: 'RECEIVED', label: 'Order Received', description: 'We have your order' },
  { status: 'PREPARING', label: 'Preparing', description: 'Your order is being prepared' },
  { status: 'READY', label: 'Ready for Collection', description: 'Your order is ready!' },
] as const;

// Maps status to step index (for progress rendering)
const STATUS_INDEX: Record<PublicOrder['status'], number> = {
  PENDING_PAYMENT: -1, // Show as "Awaiting payment" state
  RECEIVED: 0,
  PREPARING: 1,
  READY: 2,
  COMPLETED: 3, // Show as past READY (all steps complete)
  CANCELLED: -2, // Show error state
};

const TERMINAL_STATES: Array<PublicOrder['status']> = ['READY', 'COMPLETED', 'CANCELLED'];

interface OrderUpdatedPayload {
  id: string;
  status: PublicOrder['status'];
}

interface Props {
  order: PublicOrder;
  venueSlug: string;
}

export function OrderStatus({ order, venueSlug }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<PublicOrder['status']>(order.status);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep status in sync if the server component re-renders with fresher data
  useEffect(() => {
    setStatus(order.status);
  }, [order.status]);

  useEffect(() => {
    const orderId = order.id;

    // If already in a terminal state on mount, no WebSocket needed
    if (TERMINAL_STATES.includes(order.status)) {
      return;
    }

    // Anonymous connection — customers have no JWT
    socket.auth = {};
    socket.connect();

    function onConnect() {
      socket.emit('join:order', orderId);
    }

    function onOrderUpdated(update: OrderUpdatedPayload) {
      if (update.id !== orderId) return;
      setStatus(update.status);
      // Refresh server component data so the full order object stays in sync
      router.refresh();
      // Disconnect on terminal state — no further updates expected
      if (TERMINAL_STATES.includes(update.status)) {
        socket.off('connect', onConnect);
        socket.off('order:updated', onOrderUpdated);
        socket.off('connect_error', onConnectError);
        socket.disconnect();
      }
    }

    function onConnectError() {
      // socket.active becomes false after reconnectionAttempts (3) are exhausted
      if (!socket.active) {
        // Silent fallback: poll every 5 seconds via router.refresh()
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => router.refresh(), 5000);
        }
      }
    }

    socket.on('connect', onConnect);
    socket.on('order:updated', onOrderUpdated);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('order:updated', onOrderUpdated);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  const currentIndex = STATUS_INDEX[status];

  return (
    <div className="space-y-6">
      {/* Reference code — prominent at top */}
      <div className="bg-gray-50 rounded-lg px-4 py-4 text-center border border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Reference</p>
        <p className="text-3xl font-bold tracking-widest text-black">#{order.referenceCode}</p>
        <p className="text-sm text-gray-600 mt-1">{order.customerName}&apos;s order</p>
      </div>

      {/* Status section */}
      {status === 'PENDING_PAYMENT' && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Awaiting payment confirmation</p>
            <p className="text-sm text-amber-600 mt-0.5">Please complete your payment to place the order.</p>
          </div>
        </div>
      )}

      {status === 'CANCELLED' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4">
          <p className="font-medium text-red-800">Your order has been cancelled</p>
          <p className="text-sm text-red-600 mt-0.5">
            If you believe this is an error, please contact staff.
          </p>
        </div>
      )}

      {status !== 'PENDING_PAYMENT' && status !== 'CANCELLED' && (
        <div className="space-y-0">
          {STEPS.map((step, index) => {
            const isComplete = currentIndex > index;
            const isCurrent = currentIndex === index;
            const isUpcoming = currentIndex < index;

            return (
              <div key={step.status} className="flex items-start gap-4">
                {/* Step indicator column */}
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0',
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-black text-white'
                          : 'border-2 border-gray-300 bg-white',
                    ].join(' ')}
                  >
                    {isComplete ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    ) : null}
                  </div>
                  {/* Connector line — skip after last step */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={[
                        'w-0.5 h-8',
                        isComplete ? 'bg-green-500' : 'bg-gray-200',
                      ].join(' ')}
                    />
                  )}
                </div>

                {/* Step label */}
                <div className="pb-8 pt-1">
                  <p
                    className={[
                      'font-medium',
                      isComplete ? 'text-green-700' : isCurrent ? 'text-black' : 'text-gray-400',
                    ].join(' ')}
                  >
                    {step.label}
                  </p>
                  <p
                    className={[
                      'text-sm mt-0.5',
                      isUpcoming ? 'text-gray-300' : 'text-gray-500',
                    ].join(' ')}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order items summary */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">Your items</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-800">
                {item.quantity}&times; {item.itemNameAtOrder}
              </span>
              <span className="text-sm text-gray-600">
                £{(parseFloat(item.unitPriceAtOrder) * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-sm font-semibold text-black">
            £{parseFloat(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Back to menu link */}
      <div className="pt-2 text-center">
        <Link
          href={`/menu/${venueSlug}`}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          &larr; Back to Menu
        </Link>
      </div>
    </div>
  );
}
