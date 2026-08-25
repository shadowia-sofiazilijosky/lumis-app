import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class CreateHighlightDto {
  // 6- or 8-digit hex — a full color spectrum with transparency, not a fixed palette.
  @IsString()
  @Matches(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)
  color: string;

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
