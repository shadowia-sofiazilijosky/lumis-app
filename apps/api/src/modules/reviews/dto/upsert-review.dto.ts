import { ReadingStatus, RecommendLevel } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertReviewDto {
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  spicyRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  romanceRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  plotRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sadnessRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  humorRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  mysteryRating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  genre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  favoriteCharacter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  leastFavoriteCharacter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  favoriteQuote?: string;

  @IsOptional()
  @IsBoolean()
  cried?: boolean;

  @IsOptional()
  @IsEnum(RecommendLevel)
  recommend?: RecommendLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  bookNumberOfYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  mood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  // Freeform — currently `{ html: string }` from the reader's rich text editor.
  @IsOptional()
  bodyRichText?: unknown;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  finishedAt?: string;
}
