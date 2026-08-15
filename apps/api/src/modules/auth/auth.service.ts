import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { PublicUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const PASSWORD_SALT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese email.');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return this.issueTokenPair(user);
  }

  async refresh(
    userId: string,
    jti: string,
    rawRefreshToken: string,
  ): Promise<TokenPair> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: jti },
    });

    if (
      !stored ||
      stored.userId !== userId ||
      stored.revokedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const matches = await bcrypt.compare(rawRefreshToken, stored.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    // Rotation: the old refresh token is one-time use.
    await this.prisma.refreshToken.update({
      where: { id: jti },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return this.issueTokenPair(user);
  }

  async logout(jti: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id: jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.getExpiresIn('JWT_ACCESS_EXPIRES_IN'),
      },
    );

    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.getExpiresIn('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    const decoded = this.jwtService.decode<{ exp: number }>(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);
    const tokenHash = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);

    await this.prisma.refreshToken.create({
      data: { id: jti, userId: user.id, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: this.usersService.toPublic(user),
    };
  }

  // ConfigService only knows `string`; jsonwebtoken's types want its narrower
  // `StringValue` duration format (e.g. "15m"), which .env.example documents.
  private getExpiresIn(key: string): JwtSignOptions['expiresIn'] {
    return this.configService.getOrThrow<string>(
      key,
    ) as JwtSignOptions['expiresIn'];
  }
}
