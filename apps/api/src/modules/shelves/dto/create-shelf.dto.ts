import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ShelfArrangement } from '@prisma/client';

export class CreateShelfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

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

  // Freeform decoration objects (lights, plants, etc.) — deliberately loosely
  // typed here; the frontend owns and fully round-trips this shape.
  @IsOptional()
  @IsArray()
  decorations?: Record<string, unknown>[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
