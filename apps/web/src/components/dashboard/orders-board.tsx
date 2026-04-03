'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { socket } from '@/lib/socket';
import { playOrderAlert } from '@/lib/audio-alert';
import { fetchActiveOrders, updateOrderStatus, type Order } from '@/actions/orders';
import { ConnectionBanner } from './connection-banner';
import { OrderCard } from './order-card';

interface OrdersBoardProps {
  venueId: string;
  initialOrders: Order[];
  token: string;
}

const COLUMNS: { label: string; status: Order['status'] }[] = [
  { label: 'Received', status: 'RECEIVED' },
  { label: 'Preparing', status: 'PREPARING' },
  { label: 'Ready', status: 'READY' },
];

const COLUMN_HEADER_COLORS: Record<string, string> = {
  RECEIVED: 'text-blue-700',
  PREPARING: 'text-orange-700',
  READY: 'text-green-700',
};

const COLUMN_BG_COLORS: Record<string, string> = {
  RECEIVED: 'bg-blue-50',
  PREPARING: 'bg-amber-50',
  READY: 'bg-green-50',
};

export function OrdersBoard({ venueId, initialOrders, token }: OrdersBoardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [connected, setConnected] = useState(false);
  const hasConnectedOnce = useRef(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`muted:${venueId}`) === 'true';
  });
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Ref pattern from MEMORY.md — prevents stale closure in socket handlers
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Sync initialOrders into state when prop changes (established pattern)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Track auto-hide timeouts for completed orders
  const autoHideTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Track polling interval for REST fallback
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scheduleAutoHide = useCallback((orderId: string) => {
    // Cancel any existing timer for this order
    const existing = autoHideTimers.current.get(orderId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      autoHideTimers.current.delete(orderId);
    }, 30_000);

    autoHideTimers.current.set(orderId, timer);
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const active = await fetchActiveOrders(venueId);
        setOrders(active);
      } catch {
        // Silent failure — just try again next interval
      }
    }, 5_000);
  }, [venueId]);

  useEffect(() => {
    // Handlers — defined as named functions so we can remove them with socket.off(event, handler)
    const handleConnect = async () => {
      hasConnectedOnce.current = true;
      setConnected(true);
      socket.emit('join:venue', venueId);
      // Re-fetch active orders on connect AND reconnect before resuming WS feed
      try {
        const active = await fetchActiveOrders(venueId);
        setOrders(active);
      } catch {
        // Ignore fetch error — WS events will keep state in sync
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleOrderNew = (order: Order) => {
      setOrders((prev) => [order, ...prev]);
      setNewOrderIds((prev) => new Set(prev).add(order.id));
      // Remove from newOrderIds after 2 seconds (animation duration)
      setTimeout(() => {
        setNewOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(order.id);
          return next;
        });
      }, 2_000);

      if (!isMutedRef.current) {
        playOrderAlert();
      }
    };

    const handleOrderUpdated = (update: Partial<Order> & { id: string }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === update.id ? { ...o, ...update } : o)),
      );
      if (update.status === 'COMPLETED') {
        scheduleAutoHide(update.id);
      }
    };

    const handleConnectError = () => {
      // socket.active is false once reconnectionAttempts are exhausted
      if (!socket.active) {
        startPolling();
      }
    };

    // Configure auth and connect
    socket.auth = { token };
    socket.connect();

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('order:new', handleOrderNew);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('connect_error', handleConnectError);

    return () => {
      // Remove named handlers
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:new', handleOrderNew);
      socket.off('order:updated', handleOrderUpdated);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();

      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Clear all auto-hide timers
      autoHideTimers.current.forEach((timer) => clearTimeout(timer));
      autoHideTimers.current.clear();
    };
  }, [venueId, token, scheduleAutoHide, startPolling]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(`muted:${venueId}`, String(next));
      return next;
    });
  }, [venueId]);

  const handleStatusUpdate = useCallback(
    async (orderId: string, newStatus: string) => {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o,
        ),
      );

      if (newStatus === 'COMPLETED') {
        scheduleAutoHide(orderId);
      }

      try {
        await updateOrderStatus(venueId, orderId, newStatus);
        const statusLabel = COLUMNS.find((c) => c.status === newStatus)?.label ?? newStatus;
        toast.success(`Order moved to ${statusLabel}`);
      } catch {
        toast.error('Failed to update order status');
        // Revert optimistic update on failure
        try {
          const active = await fetchActiveOrders(venueId);
          setOrders(active);
        } catch {
          // Ignore
        }
      }
    },
    [venueId, scheduleAutoHide],
  );

  // Filter out cancelled orders client-side (belt-and-suspenders)
  const visibleOrders = orders.filter(
    (o) => o.status !== 'CANCELLED' && o.status !== 'PENDING_PAYMENT',
  );

  return (
    <div className="flex flex-col h-full">
      {hasConnectedOnce.current && <ConnectionBanner connected={connected} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">Live Orders</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMuteToggle}
          aria-label={isMuted ? 'Unmute alerts' : 'Mute alerts'}
          title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-auto p-4">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium mb-2">No active orders</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Orders will appear here in real-time when customers place them.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {COLUMNS.map(({ label, status }) => {
            const columnOrders = visibleOrders.filter((o) => o.status === status);
            const headerColor = COLUMN_HEADER_COLORS[status];

            const columnBg = COLUMN_BG_COLORS[status] ?? '';

            return (
              <div key={status} className={`flex flex-col gap-3 p-3 rounded-xl ${columnBg}`}>
                {/* Column header */}
                <div className="flex items-center gap-2">
                  <h2 className={`font-semibold text-sm uppercase tracking-wide ${headerColor}`}>
                    {label}
                  </h2>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {columnOrders.length}
                  </Badge>
                </div>

                {/* Order cards */}
                <div className="space-y-2 flex-1">
                  {columnOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No orders</p>
                  ) : (
                    columnOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusUpdate={handleStatusUpdate}
                        isNew={newOrderIds.has(order.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
