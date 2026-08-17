import { ReadingStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
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
