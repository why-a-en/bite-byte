import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService, SafeUser } from '../users/users.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user: hash the password, create the user, return a JWT.
   * Throws ConflictException if the email is already registered.
   */
  async register(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.usersService.create(email, passwordHash);

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  /**
   * Validate email/password credentials.
   * Returns a SafeUser (no passwordHash) on success, null on failure.
   * Called by LocalStrategy.validate().
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.usersService.findByEmailWithHash(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    // Return safe user without passwordHash
    const { passwordHash: _hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Sign a JWT for an already-validated user.
   * Called by AuthController after LocalAuthGuard populates req.user.
   */
  async login(user: SafeUser): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
