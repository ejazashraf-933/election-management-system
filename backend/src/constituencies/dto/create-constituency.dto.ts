import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConstituencyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  description?: string;
}
