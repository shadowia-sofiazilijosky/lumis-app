import { Body, Controller, NotFoundException, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<PublicUser> {
    if (dto.themePreference === undefined) {
      const current = await this.usersService.findById(user.userId);
      if (!current) throw new NotFoundException('Usuario no encontrado.');
      return this.usersService.toPublic(current);
    }

    const updated = await this.usersService.updateThemePreference(
      user.userId,
      dto.themePreference,
    );
    return this.usersService.toPublic(updated);
  }
}
