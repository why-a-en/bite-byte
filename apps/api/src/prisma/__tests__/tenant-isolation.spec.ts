import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ClsService, ClsModule, ClsStore } from 'nestjs-cls';
import { Test } from '@nestjs/testing';
import { createTenantPrismaExtension } from '../prisma-tenant.extension';

// The CLS store type for this application
interface AppClsStore extends ClsStore {
  VENUE_ID?: string;
}

describe('Tenant isolation', () => {
  // adminPrisma: connects as bitebyte (superuser) — bypasses RLS.
  // Used for test setup/teardown and to verify extension pass-through behavior.
  let adminPrisma: PrismaClient;

  // appPrisma: connects as bitebyte_app (non-superuser) — subject to RLS.
  // Used to build tenantPrisma so that RLS isolation is actually enforced.
  let appPrisma: PrismaClient;

  let clsService: ClsService<AppClsStore>;
  let tenantPrisma: ReturnType<typeof createTenantPrismaExtension>;
  let adminTenantPrisma: ReturnType<typeof createTenantPrismaExtension>;
  let venueAId: string;
  let venueBId: string;

  beforeAll(async () => {
    // Bootstrap a minimal NestJS test module for CLS
    const moduleRef = await Test.createTestingModule({
      imports: [ClsModule.forRoot({ global: true })],
    }).compile();

    clsService = moduleRef.get(ClsService);

    // Prisma 7 (Rust-free) requires an explicit driver adapter.
    // adminPrisma uses ADMIN_DATABASE_URL (superuser, bypasses RLS) for setup/teardown.
    // Falls back to DATABASE_URL if ADMIN_DATABASE_URL is not set.
    const adminConnectionString =
      process.env['ADMIN_DATABASE_URL'] ?? process.env['DATABASE_URL'];
    const adminAdapter = new PrismaPg({ connectionString: adminConnectionString });
    adminPrisma = new PrismaClient({ adapter: adminAdapter });
    await adminPrisma.$connect();

    // appPrisma uses DATABASE_URL (bitebyte_app non-superuser, RLS enforced).
    const appAdapter = new PrismaPg({
      connectionString: process.env['DATABASE_URL'],
    });
    appPrisma = new PrismaClient({ adapter: appAdapter });
    await appPrisma.$connect();

    // tenantPrisma wraps appPrisma — queries go through RLS as bitebyte_app.
    tenantPrisma = createTenantPrismaExtension(appPrisma, clsService as ClsService);

    // adminTenantPrisma wraps adminPrisma — used to verify extension pass-through
    // (the superuser can still see all rows when no CLS context is set).
    adminTenantPrisma = createTenantPrismaExtension(
      adminPrisma,
      clsService as ClsService,
    );

    // Create two test venues using adminPrisma (superuser bypasses RLS on INSERT).
    const venueA = await adminPrisma.venue.create({
      data: {
        name: 'Venue A (isolation test)',
        slug: `venue-a-test-${Date.now()}`,
        paymentMode: 'BOTH',
      },
    });
    const venueB = await adminPrisma.venue.create({
      data: {
        name: 'Venue B (isolation test)',
        slug: `venue-b-test-${Date.now()}`,
        paymentMode: 'BOTH',
      },
    });
    venueAId = venueA.id;
    venueBId = venueB.id;
  });

  afterAll(async () => {
    // Clean up test data using adminPrisma (superuser, bypasses RLS).
    if (venueAId || venueBId) {
      await adminPrisma.venue.deleteMany({
        where: { id: { in: [venueAId, venueBId].filter(Boolean) } },
      });
    }
    await appPrisma.$disconnect();
    await adminPrisma.$disconnect();
  });

  it('query in context of Venue A cannot return Venue B rows', async () => {
    // Set CLS context to Venue A — tenantPrisma sets app.tenant_id via set_config,
    // and RLS on the bitebyte_app role enforces the row filter at the DB level.
    await clsService.runWith({ VENUE_ID: venueAId }, async () => {
      const venues = await tenantPrisma.venue.findMany();
      // Must only return Venue A
      expect(venues.every((v) => v.id === venueAId)).toBe(true);
      expect(venues.some((v) => v.id === venueBId)).toBe(false);
    });
  });

  it('query in context of Venue B cannot return Venue A rows', async () => {
    // Set CLS context to Venue B
    await clsService.runWith({ VENUE_ID: venueBId }, async () => {
      const venues = await tenantPrisma.venue.findMany();
      // Must only return Venue B
      expect(venues.every((v) => v.id === venueBId)).toBe(true);
      expect(venues.some((v) => v.id === venueAId)).toBe(false);
    });
  });

  it('query with no CLS context returns all rows (system operation)', async () => {
    // No CLS context set — the extension passes query through without set_config.
    // Uses adminTenantPrisma (superuser) so RLS does not filter rows; this verifies
    // that the extension itself has no filtering effect when venueId is absent.
    const venues = await adminTenantPrisma.venue.findMany({
      where: { id: { in: [venueAId, venueBId] } },
    });
    // Both venues should be returned (no tenant filter applied by extension)
    expect(venues.length).toBe(2);
  });
});
