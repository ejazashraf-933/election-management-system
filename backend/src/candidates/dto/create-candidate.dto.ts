import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateCandidateDto {
  @IsInt()
  userId: number;

  @IsInt()
  constituencyId: number;

  @IsOptional()
  @IsInt()
  partyId?: number;

  @IsOptional()
  @IsBoolean()
  isIndependent?: boolean;
}
