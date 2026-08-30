import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body?: string;

  @IsOptional()
  @IsString()
  colorTag?: string;

  // Setting this true unpins every other note/highlight on the same book
  // (at most one pinned "featured" item per book) — see NotesService.update.
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
