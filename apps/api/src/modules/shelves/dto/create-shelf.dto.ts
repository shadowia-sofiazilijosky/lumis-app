import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  backgroundImageUrl?: string;

  // Freeform decoration objects (lights, plants, etc.) — deliberately loosely
  // typed here; the frontend owns and fully round-trips this shape.
  @IsOptional()
  @IsArray()
  decorations?: Record<string, unknown>[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
