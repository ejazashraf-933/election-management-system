import { IsInt, IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateNominationDto {
  @IsInt()
  electionId: number;

  @IsInt()
  constituencyId: number;

  @IsOptional()
  @IsInt()
  partyId?: number;

  @IsOptional()
  @IsBoolean()
  isIndependent?: boolean;

  @IsOptional()
  @IsNumber()
  nominationFee?: number;

  @IsOptional()
  @IsString()
  proposerName?: string;

  @IsOptional()
  @IsString()
  proposerCnic?: string;

  @IsOptional()
  @IsString()
  seconderName?: string;

  @IsOptional()
  @IsString()
  seconderCnic?: string;
}
