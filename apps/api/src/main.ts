import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true is required for Stripe webhook signature verification (Phase 3)
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();
