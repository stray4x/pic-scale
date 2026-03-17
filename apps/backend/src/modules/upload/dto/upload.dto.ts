import { IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadDto {
  @Type(() => Number)
  @IsInt()
  @IsIn([2, 4, 8])
  scale: number;
}
