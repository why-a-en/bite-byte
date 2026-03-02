import { PrismaClient } from '../generated/prisma/client';
import { ClsService } from 'nestjs-cls';

export function createTenantPrismaExtension(
  prisma: PrismaClient,
  cls: ClsService,
) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const venueId = cls.get<string>('VENUE_ID');
          if (!venueId) {
            // No tenant context — allow (system operations, health checks, migrations)
            return query(args);
          }
          // Array-style transaction only (NOT callback-style — see Prisma #23583)
          // TRUE flag = transaction-local scope, safe under connection pooling
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.tenant_id', ${venueId}, TRUE)`,
            query(args) as any,
          ]);
          return result;
        },
      },
    },
  });
}
