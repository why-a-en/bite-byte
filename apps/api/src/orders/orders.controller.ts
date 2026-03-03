import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';

/**
 * OrdersController — NO @UseGuards.
 * All endpoints are public and require no authentication.
 * Customer-facing: creating orders, payment intents, and checking order status.
 */
@Controller('public/venues/:slug')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/public/venues/:slug/orders
   * Creates an order. Returns referenceCode and status.
   * PAY_AT_COUNTER: status is RECEIVED immediately.
   * STRIPE: status is PENDING_PAYMENT until webhook fires.
   */
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('slug') slug: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(slug, dto);
  }

  /**
   * GET /api/public/venues/:slug/orders/:orderId
   * Returns current order status for the order tracking page.
   */
  @Get('orders/:orderId')
  async getOrderStatus(
    @Param('slug') slug: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findPublic(orderId, slug);
  }

  /**
   * POST /api/public/venues/:slug/orders/:orderId/payment-intent
   * Creates a Stripe PaymentIntent for a PENDING_PAYMENT order.
   * Returns { clientSecret } for the Stripe Payment Element.
   */
  @Post('orders/:orderId/payment-intent')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentIntent(@Param('orderId') orderId: string) {
    return this.ordersService.createPaymentIntent(orderId);
  }
}
