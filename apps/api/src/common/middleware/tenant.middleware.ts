import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Phase 1: stub — venueId resolution is implemented in Phase 2 (JWT) and Phase 3 (slug)
    // Phase 2 will read venueId from JWT payload set by JwtStrategy
    // Phase 3 will resolve venueId from venueSlug URL parameter
    const venueId = (req as any).venueId ?? null;
    if (venueId) {
      this.cls.set('VENUE_ID', venueId);
    }
    next();
  }
}
