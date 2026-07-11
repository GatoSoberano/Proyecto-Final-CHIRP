import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChirpDto {
  @IsString() @MinLength(1) @MaxLength(280)
  text: string;

  @IsOptional() @IsBoolean()
  hasMedia?: boolean;
}
