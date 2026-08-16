import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { PositionDto } from './position.dto';

export class AddBookToShelfDto {
  @IsString()
  bookId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  position?: PositionDto;
}
