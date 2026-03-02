import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SafeUser } from '../users/users.service';

interface RegisterBody {
  email: string;
  password: string;
}

interface AuthenticatedRequest {
  user: SafeUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Creates a new user account and returns a JWT access token.
   * Returns 409 if email is already registered.
   */
  @Post('register')
  async register(@Body() body: RegisterBody): Promise<{ access_token: string }> {
    return this.authService.register(body.email, body.password);
  }

  /**
   * POST /auth/login
   * Validates email/password via LocalAuthGuard (Passport local strategy).
   * On success, req.user is populated with SafeUser and a JWT is returned.
   * Returns 401 if credentials are invalid.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: AuthenticatedRequest): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }
}
