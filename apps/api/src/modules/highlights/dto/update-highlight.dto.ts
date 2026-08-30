import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHighlightDto {
  // Setting this true unpins every other note/highlight on the same book
  // (at most one pinned "featured" item per book) — see HighlightsService.update.
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
