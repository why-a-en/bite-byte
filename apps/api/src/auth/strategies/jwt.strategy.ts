import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * JwtStrategy extracts the Bearer token from the Authorization header,
 * verifies the signature against JWT_SECRET, and populates req.user
 * with { userId, email } for all protected endpoints.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<{ userId: string; email: string }> {
    return { userId: payload.sub, email: payload.email };
  }
}
