import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AnalyticsService,
  RevenueResult,
  TopItemResult,
  DailyVolumeResult,
  OrderHistoryResult,
} from './analytics.service';

/**
 * AnalyticsController: authenticated analytics and order history endpoints
 * for the venue owner dashboard, scoped under /venues/:venueId.
 *
 * Route prefix: venues/:venueId
 *
 * Endpoints:
 *   GET /venues/:venueId/analytics/revenue       — revenue for today/week/month
 *   GET /venues/:venueId/analytics/top-items     — top 5 items by quantity
 *   GET /venues/:venueId/analytics/daily-volume  — daily order count for last N days
 *   GET /venues/:venueId/orders/history          — paginated completed/cancelled orders
 *
 * No route collision with public OrdersController (/public/venues/:slug/orders/:orderId)
 * — these routes are on the /venues/:venueId prefix (authenticated owner), not /public/...
 */
@Controller('venues/:venueId')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /venues/:venueId/analytics/revenue
   * Returns { today, week, month } revenue sums (excluding CANCELLED orders).
   */
  @Get('analytics/revenue')
  async getRevenue(
    @Req() req: Request,
    @Param('venueId') venueId: string,
  ): Promise<RevenueResult> {
    const userId = (req.user as { userId: string }).userId;
    await this.analyticsService.verifyVenueOwnership(venueId, userId);
    return this.analyticsService.getRevenue(venueId);
  }

  /**
   * GET /venues/:venueId/analytics/top-items?take=5
   * Returns top N items by total quantity ordered (excluding CANCELLED orders).
   */
  @Get('analytics/top-items')
  async getTopItems(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Query('take') take?: string,
  ): Promise<TopItemResult[]> {
    const userId = (req.user as { userId: string }).userId;
    await this.analyticsService.verifyVenueOwnership(venueId, userId);
    return this.analyticsService.getTopItems(venueId, take ? parseInt(take, 10) : 5);
  }

  /**
   * GET /venues/:venueId/analytics/daily-volume?days=7
   * Returns daily order counts for the past N days (excluding CANCELLED orders).
   * BigInt COUNT values are converted to Number before serialization.
   */
  @Get('analytics/daily-volume')
  async getDailyVolume(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Query('days') days?: string,
  ): Promise<DailyVolumeResult[]> {
    const userId = (req.user as { userId: string }).userId;
    await this.analyticsService.verifyVenueOwnership(venueId, userId);
    return this.analyticsService.getDailyVolume(venueId, days ? parseInt(days, 10) : 7);
  }

  /**
   * GET /venues/:venueId/orders/history?from=&to=&page=1&pageSize=20
   * Returns paginated COMPLETED and CANCELLED orders with optional date filtering.
   * Orders are sorted newest first and include order items.
   */
  @Get('orders/history')
  async getHistory(
    @Req() req: Request,
    @Param('venueId') venueId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<OrderHistoryResult> {
    const userId = (req.user as { userId: string }).userId;
    await this.analyticsService.verifyVenueOwnership(venueId, userId);
    return this.analyticsService.getHistory(
      venueId,
      from,
      to,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }
}
