import { ReaderTheme } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateReadingProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  currentPage?: number;

  // Freeform — shape depends on the format (e.g. an EPUB CFI-like string).
  @IsOptional()
  currentLocator?: unknown;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsEnum(ReaderTheme)
  readerTheme?: ReaderTheme;

  @IsOptional()
  @IsIn(['horizontal', 'vertical', 'flip'])
  pageTurnMode?: string;

  @IsOptional()
  @IsBoolean()
  readingRulerEnabled?: boolean;

  @IsOptional()
  @IsIn(['portrait', 'landscape'])
  pageOrientation?: string;
}
