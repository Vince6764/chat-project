import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { trimString } from '../../common/dto/trim-string.js';

export class JoinDto {
  /** Username to join with (1-40 characters, case-insensitive unique) */
  @IsNotEmpty()
  @IsString()
  @Length(1, 40)
  @Transform(trimString)
  name!: string;
}
