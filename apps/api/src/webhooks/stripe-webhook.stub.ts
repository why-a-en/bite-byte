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

@Controller('webhooks')
export class StripeWebhookStub {
  private readonly logger = new Logger(StripeWebhookStub.name);
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder');

  constructor(private readonly prisma: PrismaService) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || !signature || !req.rawBody) {
      // In Phase 1, STRIPE_WEBHOOK_SECRET may not be set — log and acknowledge
      this.logger.warn('Stripe webhook received without signature verification (Phase 1 stub)');
      return { received: true, status: 'stub_no_verification' };
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

    // TODO Phase 3: implement switch(event.type) for payment_intent.succeeded
    // This will be the SOLE trigger for transitioning orders to RECEIVED status (INFR-02)
    this.logger.log(`Stripe event ${event.type} acknowledged (stub — full handler in Phase 3)`);
    return { received: true };
  }
}
