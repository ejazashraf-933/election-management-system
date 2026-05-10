import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateElectionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
