import { Injectable } from '@nestjs/common';
import { FontPreference, ThemePreference, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  updatePreferences(
    id: string,
    data: {
      themePreference?: ThemePreference;
      fontPreference?: FontPreference;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: data,
    });
  }

  toPublic(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
