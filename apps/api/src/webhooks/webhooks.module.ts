import { Module } from '@nestjs/common';
import { StripeWebhookStub } from './stripe-webhook.stub';

@Module({
  controllers: [StripeWebhookStub],
})
export class WebhooksModule {}
