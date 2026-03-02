import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { SafeUser } from '../../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // CRITICAL: override default 'username' field to 'email'
    // Without this, Passport sends undefined for the email parameter
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<SafeUser> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
