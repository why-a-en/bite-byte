import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';

/**
 * SafeUser excludes the passwordHash field to prevent it from ever appearing
 * in API responses or being serialized to the client.
 */
export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by email, excluding passwordHash from the result.
   * Use findByEmailWithHash() when you need to validate credentials.
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find a user by email including the passwordHash — for credential validation only.
   * Never return this result to the client.
   */
  async findByEmailWithHash(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by ID, excluding passwordHash.
   */
  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Create a new user with a pre-hashed password.
   * Returns the full User (with passwordHash) for internal use by AuthService.
   */
  async create(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: { email, passwordHash },
    });
  }
}
