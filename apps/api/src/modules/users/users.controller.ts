import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Patch,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser, UsersService } from './users.service';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUser> {
    const hasChanges = Object.values(dto).some((value) => value !== undefined);
    if (!hasChanges) {
      const current = await this.usersService.findById(user.userId);
      if (!current) throw new NotFoundException('Usuario no encontrado.');
      return this.usersService.toPublic(current);
    }

    const updated = await this.usersService.updateUser(user.userId, dto);
    return this.usersService.toPublic(updated);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_AVATAR_TYPES.has(file.mimetype)) {
          callback(
            new UnsupportedMediaTypeException(
              'Formato no soportado. Usá JPG, PNG o WEBP.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PublicUser> {
    if (!file) {
      throw new BadRequestException('Falta la imagen.');
    }

    const updated = await this.usersService.updateAvatar(
      user.userId,
      file.buffer,
      file.mimetype,
    );
    return this.usersService.toPublic(updated);
  }
}
