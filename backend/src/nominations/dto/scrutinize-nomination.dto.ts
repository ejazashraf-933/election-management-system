import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NominationStatus } from '../nomination.entity';

export class ScrutinizeNominationDto {
  @IsEnum([NominationStatus.APPROVED, NominationStatus.REJECTED, NominationStatus.UNDER_SCRUTINY])
  status: NominationStatus;

  @IsOptional()
  @IsString()
  scrutinyNotes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
