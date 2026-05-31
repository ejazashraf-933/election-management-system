import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePollingStationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsNotEmpty()
  @IsInt()
  constituencyId: number;

  @IsOptional()
  @IsInt()
  presidingOfficerId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalRegisteredVoters?: number;
}
