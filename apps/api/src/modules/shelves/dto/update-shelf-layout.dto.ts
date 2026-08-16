import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PositionDto } from './position.dto';

export class BookPositionDto {
  @IsString()
  bookId: string;

  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;
}

/** Bulk "save layout" payload — one shot for every book that moved on the shelf's canvas. */
export class UpdateShelfLayoutDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookPositionDto)
  positions: BookPositionDto[];
}
