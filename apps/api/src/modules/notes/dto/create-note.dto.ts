import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateNoteDto {
  @IsInt()
  @Min(0)
  pageIndex: number;

  @IsInt()
  @Min(0)
  offset: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body: string;

  @IsOptional()
  @IsString()
  colorTag?: string;

  @IsOptional()
  @IsString()
  highlightId?: string;

  // EPUB only — see Note.cfi in schema.prisma.
  @IsOptional()
  @IsString()
  cfi?: string;
}
