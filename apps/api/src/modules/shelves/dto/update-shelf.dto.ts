import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
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
  @IsInt()
  @Min(240)
  @Max(2400)
  canvasWidth?: number;

  @IsOptional()
  @IsInt()
  @Min(160)
  @Max(1600)
  canvasHeight?: number;

  @IsOptional()
  @IsArray()
  decorations?: Record<string, unknown>[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
