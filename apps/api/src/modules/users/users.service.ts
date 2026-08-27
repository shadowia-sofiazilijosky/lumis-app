import { Injectable } from '@nestjs/common';
import { FontPreference, ThemePreference, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

export type PublicUser = Omit<User, 'passwordHash' | 'avatarImageKey'> & {
  avatarUrl: string | null;
};

export interface UpdateUserData {
  themePreference?: ThemePreference;
  fontPreference?: FontPreference;
  displayName?: string;
  bio?: string;
  location?: string;
  favoriteQuote?: string;
  readingGoal?: number;
  country?: string;
  timezone?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

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

  updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateAvatar(
    id: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<User> {
    const previous = await this.prisma.user.findUnique({
      where: { id },
      select: { avatarImageKey: true },
    });

    const extension =
      contentType === 'image/png'
        ? '.png'
        : contentType === 'image/webp'
          ? '.webp'
          : '.jpg';
    const avatarImageKey = `${id}/avatar${extension}`;
    // Upload never overwrites in place at the same key across formats
    // (jpg <-> png), so remove whatever was there before uploading the new one.
    if (
      previous?.avatarImageKey &&
      previous.avatarImageKey !== avatarImageKey
    ) {
      await this.storage.remove([previous.avatarImageKey]);
    }
    await this.storage.upload(avatarImageKey, buffer, contentType, {
      upsert: true,
    });

    return this.prisma.user.update({
      where: { id },
      data: { avatarImageKey },
    });
  }

  async toPublic(user: User): Promise<PublicUser> {
    const { passwordHash: _passwordHash, avatarImageKey, ...rest } = user;
    const avatarUrl = avatarImageKey
      ? await this.storage.createSignedUrl(avatarImageKey)
      : null;
    return { ...rest, avatarUrl };
  }
}
