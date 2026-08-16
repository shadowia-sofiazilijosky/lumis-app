import { IsNumber, IsOptional } from 'class-validator';

/** Freeform placement on a shelf's canvas. */
export class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;
}
