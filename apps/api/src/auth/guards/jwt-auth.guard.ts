import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard protects endpoints that require authentication.
 * Apply with @UseGuards(JwtAuthGuard) — returns 401 if no valid Bearer token.
 * After guard passes, req.user contains { userId, email } from JwtStrategy.validate().
 *
 * This guard is exported from AuthModule and used by all subsequent plans (02+).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
