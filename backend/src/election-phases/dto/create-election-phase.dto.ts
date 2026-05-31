import { IsInt, IsString, IsDateString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateElectionPhaseDto {
  @IsInt()
  electionId: number;

  @IsInt()
  phaseNumber: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsDateString()
  scheduledDate: string;

  @IsArray()
  @IsInt({ each: true })
  constituencyIds: number[];
}
