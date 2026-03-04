import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RevenueResult {
  today: number;
  week: number;
  month: number;
}

export interface TopItemResult {
  name: string;
  count: number;
}

export interface DailyVolumeResult {
  date: string;
  count: number;
}

export interface OrderHistoryResult {
  orders: unknown[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * AnalyticsService: revenue summaries, top items, daily volume, and paginated
 * order history for the venue owner's analytics dashboard.
 *
 * All queries are scoped to a venueId. Venue ownership must be verified by the
 * caller (controller calls verifyVenueOwnership before each method).
 *
 * Revenue and top-item queries exclude CANCELLED orders.
 * BigInt values from $queryRaw are explicitly converted to Number to prevent
 * JSON serialization errors (PostgreSQL COUNT returns BigInt in Prisma $queryRaw).
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify the requesting user owns the venue.
   * Throws NotFoundException (404) if venue does not exist.
   * Throws ForbiddenException (403) if the user is not the owner.
   */
  async verifyVenueOwnership(venueId: string, userId: string): Promise<void> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { ownerId: true },
    });
    if (!venue) {
      throw new NotFoundException(`Venue ${venueId} not found`);
    }
    if (venue.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }

  /**
   * Return revenue sums for today, this week (Sunday-start), and this month.
   * Excludes CANCELLED orders. Null _sum (no orders in period) is returned as 0.
   */
  async getRevenue(venueId: string): Promise<RevenueResult> {
    const now = new Date();

    // Start of today (midnight local time, UTC-anchored)
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Start of week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const notCancelled = { not: 'CANCELLED' as const };

    const [todayAgg, weekAgg, monthAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where: { venueId, status: notCancelled, createdAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { venueId, status: notCancelled, createdAt: { gte: startOfWeek } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { venueId, status: notCancelled, createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      today: Number(todayAgg._sum.totalAmount ?? 0),
      week: Number(weekAgg._sum.totalAmount ?? 0),
      month: Number(monthAgg._sum.totalAmount ?? 0),
    };
  }

  /**
   * Return the top `take` items by total quantity ordered.
   * Excludes CANCELLED orders. Uses groupBy on OrderItem.
   */
  async getTopItems(venueId: string, take = 5): Promise<TopItemResult[]> {
    const groups = await this.prisma.orderItem.groupBy({
      by: ['menuItemId', 'itemNameAtOrder'],
      where: {
        order: {
          venueId,
          status: { not: 'CANCELLED' as const },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take,
    });

    return groups.map((r) => ({
      name: r.itemNameAtOrder,
      count: r._sum.quantity ?? 0,
    }));
  }

  /**
   * Return daily order counts for the past `days` days using raw SQL.
   *
   * IMPORTANT: PostgreSQL COUNT() returns BigInt in Prisma $queryRaw results.
   * We MUST convert with Number() before returning — JSON.stringify throws
   * "Do not know how to serialize a BigInt" otherwise.
   *
   * NOTE: Prisma groupBy cannot extract date parts from timestamps (it groups
   * on the full timestamp), so we use $queryRaw with DATE() for daily bucketing.
   */
  async getDailyVolume(
    venueId: string,
    days = 7,
  ): Promise<DailyVolumeResult[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.prisma.$queryRaw<
      Array<{ date: Date | string; count: bigint }>
    >`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM orders
      WHERE venue_id = ${venueId}::uuid
        AND status != 'CANCELLED'
        AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Convert BigInt count to Number and Date to string for JSON safety
    return rows.map((r) => ({
      date: String(r.date).substring(0, 10),
      count: Number(r.count),
    }));
  }

  /**
   * Return paginated completed/cancelled order history with optional date filtering.
   * Orders are sorted by createdAt descending (newest first).
   * Includes order items in the response.
   */
  async getHistory(
    venueId: string,
    from?: string,
    to?: string,
    page = 1,
    pageSize = 20,
  ): Promise<OrderHistoryResult> {
    const where: {
      venueId: string;
      status: { in: ('COMPLETED' | 'CANCELLED')[] };
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      venueId,
      status: { in: ['COMPLETED', 'CANCELLED'] as const },
    };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, pageSize };
  }
}
