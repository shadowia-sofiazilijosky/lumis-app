import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderBooksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  bookIds: string[];
}
