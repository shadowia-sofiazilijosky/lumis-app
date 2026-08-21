import { IsNumber, IsOptional, IsString } from 'class-validator';

/** Freeform placement on a shelf's canvas. */
export class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  // Storage key (not a URL — signed URLs expire) for a user-uploaded photo
  // of a book's real spine, used instead of the generic rendered spine.
  @IsOptional()
  @IsString()
  customSpineImageKey?: string;
}
