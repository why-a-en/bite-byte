import { fetchApi } from '@/lib/api';

export interface OrderItem {
  itemNameAtOrder: string;
  unitPriceAtOrder: number;
  quantity: number;
}

export interface Order {
  id: string;
  referenceCode: string;
  status: 'PENDING_PAYMENT' | 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export async function fetchActiveOrders(venueId: string): Promise<Order[]> {
  return fetchApi(`/venues/${venueId}/orders/active`);
}

export async function updateOrderStatus(
  venueId: string,
  orderId: string,
  status: string,
): Promise<Order> {
  return fetchApi(`/venues/${venueId}/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
