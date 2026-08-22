import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ShelfArrangement } from '@prisma/client';

export class UpdateShelfDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  genre?: string;

  @IsOptional()
  @IsEnum(ShelfArrangement)
  arrangement?: ShelfArrangement;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  shelfColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  shelfFrame?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  backgroundImageUrl?: string;

  @IsOptional()
  @IsArray()
  decorations?: Record<string, unknown>[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
