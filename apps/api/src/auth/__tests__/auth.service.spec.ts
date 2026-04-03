import { ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';

// Mock bcrypt before importing anything that uses it
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: vi.fn(),
    findByEmailWithHash: vi.fn(),
    create: vi.fn(),
  };

  const mockJwtService = {
    signAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockUsersService as any,
      mockJwtService as any,
    );
  });

  describe('register', () => {
    it('hashes password, creates user, and returns JWT', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashed-password',
      });
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await service.register('test@example.com', 'password123');

      expect(result).toEqual({ access_token: 'test-token' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        'test@example.com',
        'hashed-password',
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
      });
    });

    it('throws ConflictException when email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      await expect(
        service.register('test@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);

      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const userWithHash = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('returns SafeUser (without passwordHash) when password matches', async () => {
      mockUsersService.findByEmailWithHash.mockResolvedValue(userWithHash);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        createdAt: userWithHash.createdAt,
        updatedAt: userWithHash.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('returns null when user not found', async () => {
      mockUsersService.findByEmailWithHash.mockResolvedValue(null);

      const result = await service.validateUser('unknown@example.com', 'password123');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('returns null when password does not match', async () => {
      mockUsersService.findByEmailWithHash.mockResolvedValue(userWithHash);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('signs JWT with { sub, email } and returns access_token', async () => {
      mockJwtService.signAsync.mockResolvedValue('login-token');

      const safeUser = {
        id: 'user-1',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.login(safeUser);

      expect(result).toEqual({ access_token: 'login-token' });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
      });
    });
  });
});
