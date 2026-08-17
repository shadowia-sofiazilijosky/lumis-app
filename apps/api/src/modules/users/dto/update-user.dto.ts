import { ThemePreference } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(ThemePreference)
  themePreference?: ThemePreference;
}
