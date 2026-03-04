import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * AnalyticsModule: registers analytics and order history endpoints for the
 * venue owner dashboard.
 *
 * Provides:
 *   GET /venues/:venueId/analytics/revenue
 *   GET /venues/:venueId/analytics/top-items
 *   GET /venues/:venueId/analytics/daily-volume
 *   GET /venues/:venueId/orders/history
 *
 * PrismaService is injected via global PrismaModule (no explicit import needed).
 */
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
