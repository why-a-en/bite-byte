import { fetchApi } from '@/lib/api';

export interface RevenueData {
  today: number;
  week: number;
  month: number;
}

export interface TopItem {
  name: string;
  count: number;
}

export interface DailyVolume {
  date: string;
  count: number;
}

export interface OrderHistoryItem {
  id: string;
  referenceCode: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderHistoryResponse {
  orders: OrderHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchRevenue(venueId: string): Promise<RevenueData> {
  return fetchApi(`/venues/${venueId}/analytics/revenue`);
}

export async function fetchTopItems(venueId: string): Promise<TopItem[]> {
  return fetchApi(`/venues/${venueId}/analytics/top-items`);
}

export async function fetchDailyVolume(
  venueId: string,
  days = 7,
): Promise<DailyVolume[]> {
  return fetchApi(`/venues/${venueId}/analytics/daily-volume?days=${days}`);
}

export async function fetchOrderHistory(
  venueId: string,
  params?: {
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  },
): Promise<OrderHistoryResponse> {
  const query = new URLSearchParams();
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.pageSize !== undefined)
    query.set('pageSize', String(params.pageSize));
  const qs = query.toString();
  return fetchApi(
    `/venues/${venueId}/orders/history${qs ? `?${qs}` : ''}`,
  );
}
