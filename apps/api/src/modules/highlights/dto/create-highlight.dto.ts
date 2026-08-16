import { HighlightColor } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateHighlightDto {
  @IsEnum(HighlightColor)
  color: HighlightColor;

  @IsInt()
  @Min(0)
  pageIndex: number;

  @IsInt()
  @Min(0)
  startOffset: number;

  @IsInt()
  @Min(0)
  endOffset: number;

  @IsString()
  @MinLength(1)
  selectedText: string;

  // EPUB only — see Highlight.cfi in schema.prisma.
  @IsOptional()
  @IsString()
  cfi?: string;
}
