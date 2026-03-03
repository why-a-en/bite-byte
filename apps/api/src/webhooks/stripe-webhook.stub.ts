import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Controller('webhooks')
export class StripeWebhookStub {
  private readonly logger = new Logger(StripeWebhookStub.name);
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder');

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !signature || !req.rawBody) {
      this.logger.warn('Stripe webhook received without signature verification — check STRIPE_WEBHOOK_SECRET env var');
      return { received: true, status: 'no_verification' };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err}`);
    }

    // Idempotency check — prevents duplicate processing on Stripe retry (up to 72h retry window)
    // The unique constraint on stripe_event_id is the atomic guard at DB level
    const existing = await this.prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (existing) {
      this.logger.log(`Stripe event ${event.id} already processed — skipping`);
      return { received: true, status: 'already_processed' };
    }

    // Record event BEFORE processing (prevents race condition on concurrent delivery)
    await this.prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      },
    });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (!orderId) {
          this.logger.warn(`payment_intent.succeeded missing orderId metadata: ${paymentIntent.id}`);
          break;
        }
        await this.ordersService.markOrderReceived(orderId, paymentIntent.id);
        this.logger.log(`Order ${orderId} marked RECEIVED via webhook`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await this.ordersService.cancelOrder(orderId, 'payment_failed');
          this.logger.log(`Order ${orderId} CANCELLED via payment_failed webhook`);
        }
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }
}
