import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        // CLS context initialized for all routes; venueId populated by TenantMiddleware
      },
    }),
    PrismaModule,
    WebhooksModule,
    AuthModule,
    UsersModule,
    VenuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TenantMiddleware to all routes
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
