import { SUPPORTED_LOCALE_CODES } from '@lumis/shared-types';
import { FontPreference, ThemePreference } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(ThemePreference)
  themePreference?: ThemePreference;

  @IsOptional()
  @IsEnum(FontPreference)
  fontPreference?: FontPreference;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  favoriteQuote?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  readingGoal?: number;

  // ISO 3166-1 alpha-2.
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  // IANA timezone name -- validated properly (against the real tz database)
  // server-side in the service layer, not just a shape check here.
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  // ISO 639-1, one of SUPPORTED_LOCALE_CODES.
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LOCALE_CODES)
  language?: string;
}
