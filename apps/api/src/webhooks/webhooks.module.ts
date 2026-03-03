import { Module } from '@nestjs/common';
import { StripeWebhookStub } from './stripe-webhook.stub';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [StripeWebhookStub],
})
export class WebhooksModule {}
