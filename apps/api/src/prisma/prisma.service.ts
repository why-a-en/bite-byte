import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * PrismaService wraps PrismaClient using the @prisma/adapter-pg driver adapter.
 * Prisma 7 (Rust-free) requires an explicit driver adapter — it no longer reads
 * DATABASE_URL automatically without one.
 */
@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
