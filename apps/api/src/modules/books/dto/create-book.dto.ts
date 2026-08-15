import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  author?: string;
}
