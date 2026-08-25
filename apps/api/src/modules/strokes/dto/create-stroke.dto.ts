import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateStrokeDto {
  @IsInt()
  @Min(0)
  pageIndex: number;

  // [[x, y], ...] normalized 0-1 against the page's own width/height.
  @IsArray()
  @ArrayMinSize(2)
  points: [number, number][];

  @IsString()
  @Matches(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)
  color: string;

  @IsString()
  brush: string;

  @IsNumber()
  @Min(0.1)
  size: number;
}
