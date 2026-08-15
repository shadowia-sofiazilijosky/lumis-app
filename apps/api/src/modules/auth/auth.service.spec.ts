import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const mockUser: User = {
  id: 'user-1',
  email: 'lectora@lumis.app',
  passwordHash: 'hashed-password',
  displayName: 'Lectora',
  avatarUrl: null,
  role: Role.USER,
  themePreference: 'SYSTEM',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let prisma: {
    refreshToken: {
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      toPublic: jest.fn((user: User) => {
        const { passwordHash: _passwordHash, ...publicUser } = user;
        return publicUser;
      }),
    } as unknown as jest.Mocked<UsersService>;

    prisma = {
      refreshToken: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
      decode: jest
        .fn()
        .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    } as unknown as jest.Mocked<JwtService>;

    const configService = {
      getOrThrow: jest.fn((key: string) => `config-${key}`),
    } as unknown as ConfigService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-value');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException if the email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: mockUser.email,
          password: 'password123',
          displayName: 'Lectora',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates the user with a hashed password and returns a token pair', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: mockUser.email,
        password: 'password123',
        displayName: 'Lectora',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: mockUser.email }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.refreshToken).toBe('signed.jwt.token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException if the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@lumis.app', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns a token pair on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: mockUser.email,
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('refresh', () => {
    const storedToken = {
      id: 'jti-1',
      userId: mockUser.id,
      tokenHash: 'hashed-value',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    };

    it('throws UnauthorizedException if the stored token is missing', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh(mockUser.id, 'jti-1', 'raw-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if the stored token was revoked', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...storedToken,
        revokedAt: new Date(),
      });

      await expect(
        service.refresh(mockUser.id, 'jti-1', 'raw-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if the raw token does not match the stored hash', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refresh(mockUser.id, 'jti-1', 'raw-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rotates the token and returns a new pair on success', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.refresh(mockUser.id, 'jti-1', 'raw-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'jti-1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result.accessToken).toBe('signed.jwt.token');
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout('jti-1');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'jti-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
