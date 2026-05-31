import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ElectionType } from '../election.entity';

export class CreateElectionDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ElectionType)
  electionType?: ElectionType;

  @IsOptional()
  @IsDateString()
  nominationStartDate?: string;

  @IsOptional()
  @IsDateString()
  nominationEndDate?: string;

  @IsOptional()
  @IsDateString()
  withdrawalDeadline?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalSeats?: number;
}
